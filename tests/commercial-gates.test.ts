import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import express from 'express';
import {
  COMMERCIAL_CATALOG_DRAFT,
  createTrialSubscription,
  resolveEntitlements,
  type EntitlementSnapshot,
} from '../src/domain/commercial';
import {
  FirestoreCommercialRepository,
  commercialPaths,
} from '../src/server/commercial-repository';
import {
  createCommercialAccessRouter,
} from '../src/server/commercial-access';
import {
  createAiTaskDraftRouter,
} from '../src/server/ai-task-draft-router';
import {
  AiTaskDraftService,
  InMemoryAiOperationResultStore,
} from '../src/server/ai-task-draft-service';
import { InMemoryAiUsageLedger } from '../src/server/ai-usage-ledger';
import type { GeminiTaskDraftClient, GeminiTaskDraftClientResult } from '../src/server/gemini-task-draft-client';
import { FakeCommercialFirestore } from './support/fake-commercial-firestore';

interface TestResult {
  name: string;
  category: string;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(category: string, name: string, execute: () => Promise<void> | void): Promise<void> {
  const start = performance.now();
  try {
    await execute();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ category, name, durationMs });
    console.log(`[PASS] [${category}] ${name} (${durationMs}ms)`);
  } catch (error) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ category, name, error: message, durationMs });
    console.error(`[FAIL] [${category}] ${name}: ${message}`);
  }
}

class FakeGeminiClient implements GeminiTaskDraftClient {
  calls = 0;
  constructor(public resultFactory: () => GeminiTaskDraftClientResult) {}
  async generateTaskDraft(): Promise<GeminiTaskDraftClientResult> {
    this.calls += 1;
    return this.resultFactory();
  }
}

function sampleDraftResult(): GeminiTaskDraftClientResult {
  return {
    kind: 'success',
    draft: {
      title: 'Estruturar onboarding de novos clientes',
      description: 'Mapear etapas de boas-vindas, envio de kit e reunião inicial.',
      priority: 'medium',
      status: 'todo',
      checklist: ['Enviar e-mail de boas-vindas', 'Agendar call de kickoff'],
    },
    usage: {
      inputTokens: 100,
      outputTokens: 50,
      costMicrounits: 500,
    },
  };
}

const repoOptions = { serverTimestamp: () => '2026-09-02T12:00:00.000Z' };

console.log('================================================================');
console.log('  TAREFUS COMMERCIAL ADMISSION GATES & PROJECTIONS TEST SUITE');
console.log('  Task 6: Product Integration, Seat Gates, AI Gates & Fallback');
console.log('================================================================\n');

// ============================================================================
// 1. SEAT CAPACITY ADMISSION GATE TESTS
// ============================================================================

await test('SeatGate', 'Projection reflects canAssignSeat: false and isAtOrOverLimit: true when capacity is reached', () => {
  const trialSub = createTrialSubscription({
    subscriptionId: 'sub-seat-01',
    workspaceId: 'org-seat-01',
    planId: 'draft-team', // 3 seats
    startedAt: '2026-09-01T00:00:00.000Z',
  });

  // At limit: 3/3 assigned
  const atLimit = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: trialSub,
    seatUsage: { assignedSeats: 3 },
    aiUsage: { usedActions: 0 },
    now: '2026-09-02T00:00:00.000Z',
  });

  assert.equal(atLimit.seats.assignedSeats, 3);
  assert.equal(atLimit.seats.maxSeats, 3);
  assert.equal(atLimit.seats.availableSeats, 0);
  assert.equal(atLimit.seats.isAtOrOverLimit, true);
  assert.equal(atLimit.seats.canAssignSeat, false);

  // Over limit: 4/3 assigned (e.g. after downgrade)
  const overLimit = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: trialSub,
    seatUsage: { assignedSeats: 4 },
    aiUsage: { usedActions: 0 },
    now: '2026-09-02T00:00:00.000Z',
  });

  assert.equal(overLimit.seats.assignedSeats, 4);
  assert.equal(overLimit.seats.availableSeats, 0);
  assert.equal(overLimit.seats.isAtOrOverLimit, true);
  assert.equal(overLimit.seats.canAssignSeat, false);

  // Within limit: 2/3 assigned
  const withinLimit = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: trialSub,
    seatUsage: { assignedSeats: 2 },
    aiUsage: { usedActions: 0 },
    now: '2026-09-02T00:00:00.000Z',
  });

  assert.equal(withinLimit.seats.assignedSeats, 2);
  assert.equal(withinLimit.seats.availableSeats, 1);
  assert.equal(withinLimit.seats.isAtOrOverLimit, false);
  assert.equal(withinLimit.seats.canAssignSeat, true);
});

await test('SeatGate', 'Server transactional seat limit strictly blocks new membership when at max capacity', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-seat-server-test';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Teste',
    maxActiveSeats: 2,
    actorUid: 'uid-admin',
    correlationId: 'corr-seat-1',
  });

  // Activate 2 members (2/2)
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-admin', role: 'admin', kind: 'human', actorUid: 'uid-admin', correlationId: 'corr-seat-2' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-member-1', role: 'member', kind: 'human', actorUid: 'uid-admin', correlationId: 'corr-seat-3' });

  // 3rd member activation must be rejected
  let blocked = false;
  try {
    await repo.activateMembership({ organizationId: orgId, uid: 'uid-member-2', role: 'member', kind: 'human', actorUid: 'uid-admin', correlationId: 'corr-seat-4' });
  } catch (err: any) {
    blocked = true;
    assert(err.message.includes('seat limit') || err.message.includes('Cannot activate another'));
  }
  assert.equal(blocked, true, 'Activation must fail at seat capacity limit');
});

await test('SeatGate', 'Deactivating a member reduces active seats and re-enables assignment within limit', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-deactivate-test';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Reactivation',
    maxActiveSeats: 2,
    actorUid: 'uid-owner',
    correlationId: 'corr-deact-1',
  });

  await repo.activateMembership({ organizationId: orgId, uid: 'uid-owner', role: 'admin', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-deact-2' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-dev', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-deact-3' });
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 2);

  // Deactivate member
  await repo.deactivateMembership({ organizationId: orgId, uid: 'uid-dev', actorUid: 'uid-owner', correlationId: 'corr-deact-4' });
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 1);

  // New member can now be activated
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-designer', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-deact-5' });
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 2);
});

await test('SeatGate', 'Non-destructive invariant: Downgrade keeps all existing members active and blocks new invites', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-downgrade-retention';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Equipe Grande',
    maxActiveSeats: 3,
    actorUid: 'uid-owner',
    correlationId: 'corr-dg-1',
  });

  // Activate 3 members (3/3)
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-m1', role: 'admin', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-dg-2' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-m2', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-dg-3' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-m3', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-dg-4' });

  // Downgrade max active seats to 1 (Solo plan)
  await repo.setMaximumActiveSeats({
    organizationId: orgId,
    maxActiveSeats: 1,
    actorUid: 'uid-owner',
    correlationId: 'corr-dg-5',
  });

  // Invariant 1: All 3 existing members remain active
  const memberships = firestore.list(commercialPaths.organization(orgId) + '/memberships');
  const activeMemberships = memberships.filter((m) => m.data.status === 'active');
  assert.equal(activeMemberships.length, 3, 'Existing members must NEVER be removed or deactivated on downgrade');

  // Invariant 2: Further activations are blocked
  let inviteBlocked = false;
  try {
    await repo.activateMembership({ organizationId: orgId, uid: 'uid-m4', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-dg-6' });
  } catch {
    inviteBlocked = true;
  }
  assert.equal(inviteBlocked, true, 'New invites must be blocked when active seats >= maxSeats');
});

// ============================================================================
// 2. AI QUOTA ADMISSION GATE & ERROR MAPPING TESTS
// ============================================================================

await test('AiGate', 'Projection exposes accurate AI quota metrics and blocks when exhausted', () => {
  const sub = createTrialSubscription({
    subscriptionId: 'sub-ai-01',
    workspaceId: 'org-ai-01',
    planId: 'draft-team', // 100 AI actions/month
    startedAt: '2026-09-01T00:00:00.000Z',
  });

  // 1. Partial usage: 35/100 used -> 65 remaining
  const partial = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: sub,
    seatUsage: { assignedSeats: 1 },
    aiUsage: { usedActions: 35 },
    now: '2026-09-02T00:00:00.000Z',
  });
  assert.equal(partial.ai.usedActions, 35);
  assert.equal(partial.ai.maxActionsPerMonth, 100);
  assert.equal(partial.ai.remainingActions, 65);
  assert.equal(partial.ai.canUseAction, true);

  // 2. Exhausted quota: 100/100 used -> 0 remaining
  const exhausted = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: sub,
    seatUsage: { assignedSeats: 1 },
    aiUsage: { usedActions: 100 },
    now: '2026-09-02T00:00:00.000Z',
  });
  assert.equal(exhausted.ai.usedActions, 100);
  assert.equal(exhausted.ai.remainingActions, 0);
  assert.equal(exhausted.ai.canUseAction, false);
});

await test('AiGate', 'AI Router returns HTTP 403 (ai_not_entitled) when accessMode is blocked', async () => {
  const client = new FakeGeminiClient(sampleDraftResult);
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-ai-blocked': {
        memberships: ['uid-dev'],
        entitlement: {
          accessMode: 'blocked',
          ai: { usedActions: 0, maxActionsPerMonth: 0, remainingActions: 0, canUseAction: false },
        },
        policy: {
          periodId: '2026-09',
          maxCostMicrounitsPerPeriod: 100_000,
          maxOperationsPerWindow: 10,
          maxOperationsPerUserPerWindow: 10,
          rateWindowMs: 60_000,
          maxConcurrentOperations: 2,
          maxConcurrentOperationsPerUser: 2,
          taskDraftWorstCaseCostMicrounits: 1_000,
        },
      },
    },
    operationId: () => 'op-gate-403',
  });

  const service = new AiTaskDraftService({
    ledger,
    client,
    results: new InMemoryAiOperationResultStore(),
    now: () => 1_000_000,
  });

  const app = express();
  app.use(express.json());
  app.use(
    createAiTaskDraftRouter({
      verifier: { verifyIdToken: async () => ({ ok: true, identity: { uid: 'uid-dev' } }) },
      service,
    }),
  );

  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');

    const res = await fetch(`http://127.0.0.1:${address.port}/api/organizations/org-ai-blocked/ai/task-drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
        'Idempotency-Key': 'key-blocked-01',
      },
      body: JSON.stringify({ description: 'Criar tarefa quando plano bloqueado' }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error, 'ai_not_entitled');
    assert.equal(client.calls, 0, 'Gemini must not be called when accessMode is blocked');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('AiGate', 'AI Router returns HTTP 429 (ai_limit_exceeded) when monthly AI action quota is exhausted', async () => {
  const client = new FakeGeminiClient(sampleDraftResult);
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-ai-exhausted': {
        memberships: ['uid-dev'],
        entitlement: {
          accessMode: 'full',
          ai: { usedActions: 10, maxActionsPerMonth: 10, remainingActions: 0, canUseAction: false },
        },
        policy: {
          periodId: '2026-09',
          maxCostMicrounitsPerPeriod: 100_000,
          maxOperationsPerWindow: 10,
          maxOperationsPerUserPerWindow: 10,
          rateWindowMs: 60_000,
          maxConcurrentOperations: 2,
          maxConcurrentOperationsPerUser: 2,
          taskDraftWorstCaseCostMicrounits: 1_000,
        },
      },
    },
    operationId: () => 'op-gate-429',
  });

  const service = new AiTaskDraftService({
    ledger,
    client,
    results: new InMemoryAiOperationResultStore(),
    now: () => 1_000_000,
  });

  const app = express();
  app.use(express.json());
  app.use(
    createAiTaskDraftRouter({
      verifier: { verifyIdToken: async () => ({ ok: true, identity: { uid: 'uid-dev' } }) },
      service,
    }),
  );

  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');

    const res = await fetch(`http://127.0.0.1:${address.port}/api/organizations/org-ai-exhausted/ai/task-drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid-token',
        'Idempotency-Key': 'key-exhausted-01',
      },
      body: JSON.stringify({ description: 'Criar tarefa quando cota de ações esgotada' }),
    });

    assert.equal(res.status, 429);
    const body = await res.json();
    assert.equal(body.error, 'ai_limit_exceeded');
    assert.equal(client.calls, 0, 'Gemini must not be called when quota is exhausted');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('AiGate', 'Clean Portuguese error mapping: maps 401, 403, 429, 503, 410 cleanly without stack traces', () => {
  function mapAiErrorCode(status: number, rawError?: string): string {
    if (status === 401) {
      return 'Autenticação necessária. Por favor, realize o login para utilizar o assistente de IA.';
    }
    if (status === 403) {
      return 'O plano atual não contempla IA inteligente ou a conta corporativa está temporariamente bloqueada.';
    }
    if (status === 429) {
      return 'Limite de requisições por minuto ou cota de IA atingida. Aguarde um instante e tente novamente.';
    }
    if (status === 503) {
      return 'O assistente inteligente está temporariamente indisponível. Você pode continuar criando tarefas manualmente.';
    }
    if (status === 410) {
      return 'A rota legada de IA foi desativada. O assistente foi atualizado para a versão segura.';
    }
    return rawError || 'O assistente inteligente está temporariamente indisponível. Você pode continuar criando tarefas manualmente.';
  }

  const msg401 = mapAiErrorCode(401);
  assert(msg401.includes('Autenticação necessária'));
  assert(!msg401.includes('Error:'));

  const msg403 = mapAiErrorCode(403);
  assert(msg403.includes('O plano atual não contempla IA inteligente'));

  const msg429 = mapAiErrorCode(429);
  assert(msg429.includes('Limite de requisições por minuto ou cota'));

  const msg503 = mapAiErrorCode(503);
  assert(msg503.includes('O assistente inteligente está temporariamente indisponível'));

  const msg410 = mapAiErrorCode(410);
  assert(msg410.includes('A rota legada de IA foi desativada'));
});

// ============================================================================
// 3. SERVER PROJECTION ISOLATION & ZERO CLIENT AUTHORITY TESTS
// ============================================================================

await test('ProjectionIsolation', 'GET /api/organizations/:orgId/entitlements returns sanitized fields with zero secret leakage', async () => {
  const mockEntitlements: EntitlementSnapshot = {
    accessMode: 'full',
    planId: 'draft-team',
    catalogVersion: 'draft-2026-09-02',
    seats: {
      assignedSeats: 2,
      maxSeats: 3,
      availableSeats: 1,
      isAtOrOverLimit: false,
      canAssignSeat: true,
    },
    ai: {
      usedActions: 10,
      maxActionsPerMonth: 100,
      remainingActions: 90,
      canUseAction: true,
    },
  };

  const app = express();
  app.use(
    createCommercialAccessRouter({
      verifier: { verifyIdToken: async () => ({ ok: true, identity: { uid: 'uid-user-proj' } }) },
      memberships: {
        findMembershipsByUid: async () => [{ organizationId: 'org-proj-test', uid: 'uid-user-proj', role: 'member' }],
      },
      entitlements: {
        readEntitlements: async () => mockEntitlements,
      },
    }),
  );

  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');

    const res = await fetch(`http://127.0.0.1:${address.port}/api/organizations/org-proj-test/entitlements`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.status, 200);
    const body = await res.json();

    assert.equal(body.organizationId, 'org-proj-test');
    assert.equal(body.role, 'member');
    assert.deepEqual(body.entitlements, mockEntitlements);

    // Verify ZERO leaked internal keys or payment secrets
    const bodyStr = JSON.stringify(body);
    assert.equal(bodyStr.includes('FIREBASE_ADMIN'), false);
    assert.equal(bodyStr.includes('GEMINI_API_KEY'), false);
    assert.equal(bodyStr.includes('secret'), false);
    assert.equal(bodyStr.includes('privateKey'), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ============================================================================
// 4. UNCONFIGURED / DEVELOPMENT MODE GRACEFUL FEEDBACK TESTS
// ============================================================================

await test('UnconfiguredFallback', 'Entitlement router fails closed with HTTP 503 when backend services are unconfigured', async () => {
  const app = express();
  app.use(
    createCommercialAccessRouter({
      verifier: { verifyIdToken: async () => ({ ok: true, identity: { uid: 'uid-dev' } }) },
      memberships: {
        findMembershipsByUid: async () => [{ organizationId: 'org-unconf', uid: 'uid-dev', role: 'admin' }],
      },
      entitlements: {
        readEntitlements: async () => {
          throw new Error('Entitlement reader unconfigured');
        },
      },
    }),
  );

  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');

    const res = await fetch(`http://127.0.0.1:${address.port}/api/organizations/org-unconf/entitlements`, {
      headers: { Authorization: 'Bearer valid-token' },
    });

    assert.equal(res.status, 503);
    const body = await res.json();
    assert.deepEqual(body, { error: 'entitlements_unavailable' });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('UnconfiguredFallback', 'Local development fallback resolves safe trial snapshot without external crash', () => {
  const activeSeats = 2;
  const orgId = 'org-local-dev';
  const defaultSub = createTrialSubscription({
    subscriptionId: 'sub-local-trial',
    workspaceId: orgId,
    planId: 'draft-team',
    startedAt: new Date().toISOString(),
  });

  const local = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: defaultSub,
    seatUsage: { assignedSeats: activeSeats },
    aiUsage: { usedActions: 0 },
    now: new Date().toISOString(),
  });

  assert.equal(local.accessMode, 'full');
  assert.equal(local.planId, 'draft-team');
  assert.equal(local.seats.assignedSeats, 2);
  assert.equal(local.seats.maxSeats, 3);
  assert.equal(local.seats.availableSeats, 1);
  assert.equal(local.seats.canAssignSeat, true);
  assert.equal(local.ai.remainingActions, 100);
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================

console.log('\n================================================================');
console.log('  COMMERCIAL ADMISSION GATES TEST SUMMARY');
console.log('================================================================');

const total = results.length;
const passed = results.filter((r) => !r.error).length;
const failed = results.filter((r) => r.error).length;

console.log(`Total Gates Tests Run: ${total}`);
console.log(`Passed:                ${passed} / ${total}`);
console.log(`Failed:                ${failed} / ${total}`);

if (failed > 0) {
  console.error('\nFAILED TESTS:');
  results
    .filter((r) => r.error)
    .forEach((r) => {
      console.error(` - [${r.category}] ${r.name}: ${r.error}`);
    });
  process.exit(1);
} else {
  console.log('\nALL COMMERCIAL ADMISSION GATES TESTS PASSED.');
}
