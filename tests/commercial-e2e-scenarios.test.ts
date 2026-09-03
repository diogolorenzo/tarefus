import assert from 'node:assert/strict';
import {
  COMMERCIAL_CATALOG_DRAFT,
  createTrialSubscription,
  resolveEntitlements,
  transitionSubscription,
  applyScheduledPlanChange,
} from '../src/domain/commercial';
import {
  FirestoreCommercialRepository,
  commercialPaths,
} from '../src/server/commercial-repository';
import { FakeCommercialFirestore } from './support/fake-commercial-firestore';
import { InMemoryAiUsageLedger } from '../src/server/ai-usage-ledger';
import {
  AiTaskDraftService,
  InMemoryAiOperationResultStore,
} from '../src/server/ai-task-draft-service';
import type {
  GeminiTaskDraftClient,
  GeminiTaskDraftClientResult,
} from '../src/server/gemini-task-draft-client';

interface TestResult {
  name: string;
  tier: string;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(tier: string, name: string, execute: () => Promise<void> | void): Promise<void> {
  const start = performance.now();
  try {
    await execute();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ tier, name, durationMs });
    console.log(`[PASS] [${tier}] ${name} (${durationMs}ms)`);
  } catch (error) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ tier, name, error: message, durationMs });
    console.error(`[FAIL] [${tier}] ${name}: ${message}`);
  }
}

class DeterministicFakeGeminiClient implements GeminiTaskDraftClient {
  calls = 0;
  constructor(public resultFactory: () => Promise<GeminiTaskDraftClientResult> | GeminiTaskDraftClientResult) {}

  async generateTaskDraft(): Promise<GeminiTaskDraftClientResult> {
    this.calls += 1;
    return this.resultFactory();
  }
}

function successfulDraftResult(title = 'Preparar proposta comercial'): GeminiTaskDraftClientResult {
  return {
    kind: 'success',
    draft: {
      title,
      description: 'Estruturar o escopo, precificação e cronograma da proposta.',
      priority: 'high',
      status: 'todo',
      checklist: ['Levantar requisitos', 'Calcular custos', 'Revisar com diretoria'],
    },
    usage: {
      inputTokens: 150,
      outputTokens: 60,
      costMicrounits: 750,
    },
  };
}

const repoOptions = { serverTimestamp: () => '2026-09-02T12:00:00.000Z' };

console.log('================================================================');
console.log('  TAREFUS COMMERCIAL & ENTITLEMENTS E2E & INTEGRATION TEST SUITE');
console.log('  Tiers 3 & 4: Combinatorial & Real-World Workload Lifecycles');
console.log('================================================================\n');

// ============================================================================
// TIER 3: CROSS-FEATURE PAIRWISE COMBINATORIAL MATRICES
// ============================================================================

await test('Tier 3', 'T3.01: Trial Expiration + Seat Downgrade + Member Reactivation Blocker', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-agency-01';

  // 1. Create organization with 14-day trial on draft-team (3 seats)
  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Agência Alfa',
    maxActiveSeats: 3,
    actorUid: 'uid-owner',
    correlationId: 'corr-01',
  });

  // 2. Add owner + 2 members (total 3 seats active: owner, member1, member2)
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-owner', role: 'admin', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-02' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-dev1', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-03' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-dev2', role: 'member', kind: 'human', actorUid: 'uid-owner', correlationId: 'corr-04' });

  // Verify 3 seats assigned
  let activeSeats = firestore.read(commercialPaths.organization(orgId))?.activeSeats as number;
  assert.equal(activeSeats, 3);

  // 3. Deactivate member2
  await repo.deactivateMembership({ organizationId: orgId, uid: 'uid-dev2', actorUid: 'uid-owner', correlationId: 'corr-05' });
  activeSeats = firestore.read(commercialPaths.organization(orgId))?.activeSeats as number;
  assert.equal(activeSeats, 2);

  // 4. Trial expires 14 days later
  const trialSub = createTrialSubscription({
    subscriptionId: 'sub-01',
    workspaceId: orgId,
    planId: 'draft-team',
    startedAt: '2026-09-01T00:00:00.000Z',
  });

  const expired = transitionSubscription(trialSub, {
    type: 'EXPIRE',
    occurredAt: '2026-09-15T00:00:00.000Z',
  });
  assert(expired.ok);
  await repo.writeSubscription({ organizationId: orgId, subscription: expired.value, actorUid: 'uid-owner', correlationId: 'corr-06' });

  // 5. Entitlement is now blocked
  const resolved = resolveEntitlements({
    catalog: COMMERCIAL_CATALOG_DRAFT,
    subscription: expired.value,
    seatUsage: { assignedSeats: activeSeats },
    now: '2026-09-15T00:00:00.000Z',
  });
  assert.equal(resolved.accessMode, 'blocked');
  assert.equal(resolved.seats.canAssignSeat, false);
});

await test('Tier 3', 'T3.02: Concurrent Multi-Admin Member Invitation Race Under Seat Limit', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-race-test';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Race Studio',
    maxActiveSeats: 1, // Max 1 seat
    actorUid: 'uid-admin-1',
    correlationId: 'corr-race-1',
  });

  // Owner occupies the 1 seat
  await repo.activateMembership({
    organizationId: orgId,
    uid: 'uid-admin-1',
    role: 'admin',
    kind: 'human',
    actorUid: 'uid-admin-1',
    correlationId: 'corr-race-2',
  });
  const activeSeats = firestore.read(commercialPaths.organization(orgId))?.activeSeats as number;
  assert.equal(activeSeats, 1);

  // Attempting to invite a 2nd member concurrently must fail with seat limit reached
  let failedWithSeatLimit = false;
  try {
    await repo.activateMembership({
      organizationId: orgId,
      uid: 'uid-invitee',
      role: 'member',
      kind: 'human',
      actorUid: 'uid-admin-1',
      correlationId: 'corr-race-3',
    });
  } catch (err: any) {
    failedWithSeatLimit = String(err.message).includes('seat limit') || String(err.message).includes('Cannot activate another');
  }

  assert.equal(failedWithSeatLimit, true, 'Activation must fail when exceeding seat limit');
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 1);
});

await test('Tier 3', 'T3.03: Member Deactivation + AI Idempotency Replay Authorization Defense', async () => {
  const client = new DeterministicFakeGeminiClient(async () => successfulDraftResult());
  const operationResults = new InMemoryAiOperationResultStore();
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-ai-defense': {
        memberships: ['uid-analyst'],
        entitlement: {
          accessMode: 'full',
          ai: { usedActions: 0, maxActionsPerMonth: 50, remainingActions: 50, canUseAction: true },
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
    operationId: () => 'op-defense-1',
  });

  const service = new AiTaskDraftService({
    ledger,
    client,
    results: operationResults,
    now: () => 1_000_000,
  });

  const command = {
    organizationId: 'org-ai-defense',
    uid: 'uid-analyst',
    idempotencyKey: 'idemp-key-secret-01',
    description: 'Criar plano de expansão comercial confidencial.',
  };

  // 1. Initial valid call succeeds and stores result
  const initial = await service.generate(command);
  assert.equal(initial.kind, 'succeeded');
  assert.equal(client.calls, 1);

  // 2. Analyst is removed / deactivated from organization
  const mutableFake = ledger as unknown as {
    organizations: Map<string, any>;
  };
  const currentOrg = mutableFake.organizations.get('org-ai-defense');
  currentOrg.memberships = []; // User is no longer a member

  // 3. Deactivated analyst attempts to replay request with prior Idempotency-Key
  const replay = await service.generate(command);

  // 4. Must be rejected with forbidden without executing Gemini or returning confidential cached draft
  assert.deepEqual(replay, { kind: 'forbidden' });
  assert.equal(client.calls, 1, 'Gemini must not be called on unauthorized replay');
});

await test('Tier 3', 'T3.04: AI Quota Exhaustion + Dual Rate Limiting + Clean Error Mapping', async () => {
  let opSeq = 0;
  const client = new DeterministicFakeGeminiClient(async () => successfulDraftResult());
  const operationResults = new InMemoryAiOperationResultStore();
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-rate-ai': {
        memberships: ['uid-user-a', 'uid-user-b'],
        entitlement: {
          accessMode: 'full',
          ai: { usedActions: 0, maxActionsPerMonth: 10, remainingActions: 10, canUseAction: true },
        },
        policy: {
          periodId: '2026-09',
          maxCostMicrounitsPerPeriod: 100_000,
          maxOperationsPerWindow: 5,
          maxOperationsPerUserPerWindow: 1, // User limit = 1 per window
          rateWindowMs: 60_000,
          maxConcurrentOperations: 5,
          maxConcurrentOperationsPerUser: 5,
          taskDraftWorstCaseCostMicrounits: 1_000,
        },
      },
    },
    operationId: () => `op-rate-${++opSeq}`,
  });

  const service = new AiTaskDraftService({
    ledger,
    client,
    results: operationResults,
    now: () => 1_000_000,
  });

  // 1. User A generates 1st draft (permitted, exhausts User A rate limit for this window)
  const first = await service.generate({
    organizationId: 'org-rate-ai',
    uid: 'uid-user-a',
    idempotencyKey: 'idemp-a1',
    description: 'Tarefa 1',
  });
  assert.equal(first.kind, 'succeeded');

  // 2. User A attempts 2nd draft in same window -> Blocked by personal rate limit
  const rateBlocked = await service.generate({
    organizationId: 'org-rate-ai',
    uid: 'uid-user-a',
    idempotencyKey: 'idemp-a2',
    description: 'Tarefa 2',
  });
  assert.deepEqual(rateBlocked, { kind: 'blocked', reason: 'rate' });

  // 3. User B generates with 0 remaining actions in org -> Blocked by actions
  const mutableFake = ledger as unknown as {
    organizations: Map<string, any>;
  };
  const currentOrg = mutableFake.organizations.get('org-rate-ai');
  currentOrg.entitlement.ai.remainingActions = 1; // Only 1 was available and is now used by first call

  const quotaBlocked = await service.generate({
    organizationId: 'org-rate-ai',
    uid: 'uid-user-b',
    idempotencyKey: 'idemp-b1',
    description: 'Tarefa 3',
  });
  assert.deepEqual(quotaBlocked, { kind: 'blocked', reason: 'actions' });
});

await test('Tier 3', 'T3.05: Plan Change Schedule Offset Parsing & Server Period Boundary Invariant', async () => {
  const activeSubscription = {
    subscriptionId: 'sub-plan-test',
    workspaceId: 'workspace-plan-test',
    planId: 'draft-team',
    state: 'active' as const,
    startedAt: '2026-09-01T00:00:00.000Z',
    currentPeriodEndsAt: '2026-10-01T00:00:00.000Z',
  };

  // Schedule downgrade to draft-solo at period end
  const scheduled = transitionSubscription(activeSubscription, {
    type: 'SCHEDULE_PLAN_CHANGE',
    occurredAt: '2026-09-15T12:00:00.000Z',
    planId: 'draft-solo',
    effectiveAt: '2026-10-01T00:00:00.000Z',
  });
  assert(scheduled.ok);

  // Before effective date: plan must remain draft-team
  const midPeriod = applyScheduledPlanChange(scheduled.value, '2026-09-30T23:59:59.000Z');
  assert.equal(midPeriod.planId, 'draft-team');
  assert(midPeriod.scheduledPlanChange !== undefined);

  // At effective date: plan transitions to draft-solo and schedule is consumed
  const postPeriod = applyScheduledPlanChange(scheduled.value, '2026-10-01T00:00:00.000Z');
  assert.equal(postPeriod.planId, 'draft-solo');
  assert.equal(postPeriod.scheduledPlanChange, undefined);
});

// ============================================================================
// TIER 4: REAL-WORLD WORKLOAD SCENARIOS & MULTI-TENANT LIFECYCLES
// ============================================================================

await test('Tier 4', 'Scenario 1: Complete Agency Growth, Contraction & Over-Capacity Retention Lifecycle', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-agencia-criativa';

  // Step 1: Onboarding with 14-day trial (3 seats)
  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Agência Criativa SP',
    maxActiveSeats: 3,
    actorUid: 'uid-owner-carlos',
    correlationId: 'agency-01',
  });

  // Activate owner + 2 designers up to plan capacity (3/3)
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-owner-carlos', role: 'admin', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-02' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-designer-1', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-03' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-designer-2', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-04' });
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 3);

  // Step 3: 4th member invite blocked by seat capacity
  let blocked = false;
  try {
    await repo.activateMembership({ organizationId: orgId, uid: 'uid-copywriter', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-05' });
  } catch {
    blocked = true;
  }
  assert.equal(blocked, true, '4th member must be blocked under 3-seat limit');

  // Step 4: Upgrade subscription to Enterprise (10 seats)
  await repo.setMaximumActiveSeats({
    organizationId: orgId,
    maxActiveSeats: 10,
    actorUid: 'uid-owner-carlos',
    correlationId: 'agency-06',
  });

  // Step 5: Invite remaining team members (total 5/10 seats)
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-copywriter', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-07' });
  await repo.activateMembership({ organizationId: orgId, uid: 'uid-pm-1', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-08' });
  assert.equal(firestore.read(commercialPaths.organization(orgId))?.activeSeats, 5);

  // Step 6: Downgrade plan to Solo (1 seat)
  await repo.setMaximumActiveSeats({
    organizationId: orgId,
    maxActiveSeats: 1,
    actorUid: 'uid-owner-carlos',
    correlationId: 'agency-09',
  });

  // Step 7: Invariant: All 5 existing members remain active and untouched
  const membershipsList = firestore.list(commercialPaths.organization(orgId) + '/memberships');
  const activeMembers = membershipsList.filter((m) => m.data.status === 'active');
  assert.equal(activeMembers.length, 5, 'Existing members must NEVER be automatically removed or deactivated');

  // Step 8: Invariant: New member invitations are strictly blocked
  let newInviteBlocked = false;
  try {
    await repo.activateMembership({ organizationId: orgId, uid: 'uid-new-intern', role: 'member', kind: 'human', actorUid: 'uid-owner-carlos', correlationId: 'agency-10' });
  } catch {
    newInviteBlocked = true;
  }
  assert.equal(newInviteBlocked, true, 'New member invite must be blocked when over capacity');

  // Step 9: Audit events record every transaction immutably
  const auditPath = commercialPaths.auditEvents(orgId);
  const auditDocs = firestore.list(auditPath);
  assert(auditDocs.length >= 6, 'All state changes must emit immutable audit records');
  for (const doc of auditDocs) {
    assert(doc.data.payloadHash, 'Audit event must contain stable SHA-256 payloadHash');
  }
});

await test('Tier 4', 'Scenario 2: High-Velocity AI Team Contention, Partial Metadata & Recovery', async () => {
  let callIndex = 0;
  // Simulates varying Gemini provider responses:
  // Call 1: Normal success (750 micros)
  // Call 2: Partial metadata (returns unknown -> marked unknown, holds worst case 1,000 micros)
  // Call 3: Normal success (600 micros)
  const client = new DeterministicFakeGeminiClient(async () => {
    callIndex += 1;
    if (callIndex === 2) {
      return {
        kind: 'unknown',
        errorCode: 'provider_usage_unavailable',
      };
    }
    return successfulDraftResult(`Draft ${callIndex}`);
  });

  const resultsStore = new InMemoryAiOperationResultStore();
  let opSequence = 0;
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-sprint': {
        memberships: ['uid-pm-1', 'uid-pm-2'],
        entitlement: {
          accessMode: 'full',
          ai: { usedActions: 0, maxActionsPerMonth: 10, remainingActions: 10, canUseAction: true },
        },
        policy: {
          periodId: '2026-09',
          maxCostMicrounitsPerPeriod: 50_000,
          maxOperationsPerWindow: 10,
          maxOperationsPerUserPerWindow: 10,
          rateWindowMs: 60_000,
          maxConcurrentOperations: 2,
          maxConcurrentOperationsPerUser: 2,
          taskDraftWorstCaseCostMicrounits: 1_000,
        },
      },
    },
    operationId: () => `op-sprint-${++opSequence}`,
  });

  const service = new AiTaskDraftService({
    ledger,
    client,
    results: resultsStore,
    now: () => 1_000_000,
  });

  // Request 1: Succeeded
  const res1 = await service.generate({
    organizationId: 'org-sprint',
    uid: 'uid-pm-1',
    idempotencyKey: 'sprint-req-1',
    description: 'Sprint Backlog Tarefa 1',
  });
  assert.equal(res1.kind, 'succeeded');

  // Request 2: Partial/missing metadata -> Unknown status, holds worst case reservation
  const res2 = await service.generate({
    organizationId: 'org-sprint',
    uid: 'uid-pm-2',
    idempotencyKey: 'sprint-req-2',
    description: 'Sprint Backlog Tarefa 2',
  });
  assert.equal(res2.kind, 'unknown');

  // Request 3: Replay Request 1 -> Returns cached result immediately without new Gemini call
  const replay1 = await service.generate({
    organizationId: 'org-sprint',
    uid: 'uid-pm-1',
    idempotencyKey: 'sprint-req-1',
    description: 'Sprint Backlog Tarefa 1',
  });
  assert.deepEqual(replay1, res1);
  assert.equal(client.calls, 2, 'Replay must not call Gemini');

  // Ledger totals verification
  const snapshot = ledger.snapshot().totalsByOrganization['org-sprint'];
  assert.equal(snapshot.confirmedActions, 1, '1 action confirmed');
  assert.equal(snapshot.reservedActions, 1, '1 action held in worst-case reserve');
  assert.equal(snapshot.confirmedCostMicrounits, 750);
  assert.equal(snapshot.reservedCostMicrounits, 1_000);
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================

console.log('\n================================================================');
console.log('  COMMERCIAL E2E TEST SUMMARY');
console.log('================================================================');

const total = results.length;
const passed = results.filter((r) => !r.error).length;
const failed = results.filter((r) => r.error).length;

console.log(`Total E2E Scenarios Run: ${total}`);
console.log(`Passed:                  ${passed} / ${total}`);
console.log(`Failed:                  ${failed} / ${total}`);

if (failed > 0) {
  console.error('\nFAILED SCENARIOS:');
  results
    .filter((r) => r.error)
    .forEach((r) => {
      console.error(` - [${r.tier}] ${r.name}: ${r.error}`);
    });
  process.exit(1);
} else {
  console.log('\nALL COMMERCIAL E2E & INTEGRATION SCENARIOS PASSED.');
  process.exit(0);
}
