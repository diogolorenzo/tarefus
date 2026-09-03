import assert from 'node:assert/strict';
import {
  InMemoryAiUsageLedger,
  type InMemoryAiOrganizationState,
} from '../src/server/ai-usage-ledger';
import {
  AiTaskDraftService,
  InMemoryAiOperationResultStore,
} from '../src/server/ai-task-draft-service';
import {
  GoogleGeminiTaskDraftClient,
  type GeminiTaskDraftClient,
  type GeminiTaskDraftClientResult,
} from '../src/server/gemini-task-draft-client';
import {
  FirestoreCommercialRepository,
  CommercialRepositoryError,
} from '../src/server/commercial-repository';
import { FakeCommercialFirestore } from './support/fake-commercial-firestore';
import { createAiTaskDraftRouter } from '../src/server/ai-task-draft-router';
import express from 'express';
import type { Server } from 'node:http';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
let currentSuite = 'Default';

function suite(name: string, fn: () => void | Promise<void>) {
  currentSuite = name;
  return fn();
}

async function test(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ suite: currentSuite, name, passed: true, durationMs });
    console.log(`  [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const msg = err instanceof Error ? err.stack ?? err.message : String(err);
    results.push({ suite: currentSuite, name, passed: false, error: msg, durationMs });
    console.error(`  [FAIL] ${name} (${durationMs}ms)\n         ${msg}`);
  }
}

function organizationFixture(overrides: Partial<InMemoryAiOrganizationState> = {}): InMemoryAiOrganizationState {
  return {
    memberships: ['user-1', 'user-2', 'user-3'],
    entitlement: {
      accessMode: 'full',
      ai: {
        usedActions: 0,
        maxActionsPerMonth: 10,
        remainingActions: 10,
        canUseAction: true,
      },
    },
    policy: {
      periodId: '2026-09',
      maxCostMicrounitsPerPeriod: 10_000,
      maxOperationsPerWindow: 10,
      maxOperationsPerUserPerWindow: 5,
      rateWindowMs: 60_000,
      maxConcurrentOperations: 3,
      maxConcurrentOperationsPerUser: 2,
      taskDraftWorstCaseCostMicrounits: 1_000,
    },
    ...overrides,
  };
}

function replaceLedgerOrgState(
  ledger: InMemoryAiUsageLedger,
  organizationId: string,
  state: InMemoryAiOrganizationState,
): void {
  const mutable = ledger as unknown as { organizations: Map<string, InMemoryAiOrganizationState> };
  mutable.organizations.set(organizationId, structuredClone(state));
}

class MockGeminiClient implements GeminiTaskDraftClient {
  calls = 0;
  constructor(public resultFn: () => Promise<GeminiTaskDraftClientResult>) {}
  async generateTaskDraft(): Promise<GeminiTaskDraftClientResult> {
    this.calls += 1;
    return this.resultFn();
  }
}

function makeServiceFixture(opts: {
  org?: InMemoryAiOrganizationState;
  client?: MockGeminiClient;
  now?: () => number;
} = {}) {
  const client = opts.client ?? new MockGeminiClient(async () => ({
    kind: 'success',
    draft: {
      title: 'Título padrão',
      description: 'Descrição padrão',
      priority: 'medium',
      status: 'todo',
      checklist: ['Item 1', 'Item 2'],
    },
    usage: {
      inputTokens: 100,
      outputTokens: 50,
      costMicrounits: 500,
    },
  }));

  let opSeq = 0;
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-test': opts.org ?? organizationFixture() },
    operationId: () => `op-${++opSeq}`,
  });
  const resultsStore = new InMemoryAiOperationResultStore();
  const service = new AiTaskDraftService({
    ledger,
    client,
    results: resultsStore,
    now: opts.now ?? (() => 1_000_000),
  });

  return { client, ledger, resultsStore, service };
}

async function runAdversarialVerification() {
  console.log('================================================================');
  console.log('  TAREFUS ADVERSARIAL VERIFICATION SUITE - CHALLENGER 2');
  console.log('  Tasks 4 & 6: AI Engine, Budget Invariants & Admission Gates');
  console.log('================================================================\n');

  // AREA 1: GEMINI USAGE METADATA ANOMALIES
  await suite('Area 1: Gemini Usage Metadata Anomalies', async () => {
    await test('1.1 Completely omitted usageMetadata marks operation unknown and holds worst-case reserve', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: undefined,
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-1',
        description: 'Test prompt',
      });

      assert.deepEqual(res, {
        kind: 'unknown',
        operationId: 'op-1',
        errorCode: 'provider_usage_unavailable',
      });

      const snapshot = fix.ledger.snapshot();
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedActions, 1);
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedActions, 0);
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedCostMicrounits, 0);
    });

    await test('1.2 Prompt-only tokens (missing candidatesTokenCount) marks unknown and holds reserve', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: { promptTokenCount: 150 },
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-2',
        description: 'Test prompt',
      });
      assert.equal(res.kind, 'unknown');
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
    });

    await test('1.3 Candidates-only tokens (missing promptTokenCount) marks unknown and holds reserve', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: { candidatesTokenCount: 50 },
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-3',
        description: 'Test prompt',
      });
      assert.equal(res.kind, 'unknown');
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
    });

    await test('1.4 Zeroed tokens (0 prompt / 0 candidate) marks unknown and holds worst-case reserve', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 },
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-4',
        description: 'Test prompt',
      });
      assert.equal(res.kind, 'unknown');
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].confirmedCostMicrounits, 0);
    });

    await test('1.5 Negative tokens reject as invalid and mark unknown with reserve held', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: { promptTokenCount: -15, candidatesTokenCount: 50 },
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-5',
        description: 'Test prompt',
      });
      assert.equal(res.kind, 'unknown');
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
    });

    await test('1.6 Non-integer/NaN tokens reject as invalid and mark unknown with reserve held', async () => {
      const client = new GoogleGeminiTaskDraftClient({
        apiKey: 'fake-test-key',
        createSdk: () => ({
          models: {
            generateContent: async () => ({
              text: JSON.stringify({
                title: 'Tarefa Teste',
                description: 'Detalhes',
                priority: 'medium',
                status: 'todo',
                checklist: ['Subtarefa'],
              }),
              usageMetadata: { promptTokenCount: NaN as any, candidatesTokenCount: 50.5 as any },
            }),
          },
        }),
      });

      const clientRes = await client.generateTaskDraft({ description: 'Test prompt' });
      assert.deepEqual(clientRes, { kind: 'unknown', errorCode: 'provider_usage_unavailable' });

      const fix = makeServiceFixture({ client: new MockGeminiClient(async () => clientRes) });
      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-meta-6',
        description: 'Test prompt',
      });
      assert.equal(res.kind, 'unknown');
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
    });
  });

  // AREA 2: OVER-BUDGET PROVIDER COST
  await suite('Area 2: Over-Budget Provider Cost & Hard Cap Enforcement', async () => {
    await test('2.1 Confirmed cost exceeding hard cap by 1 microunit is marked unknown and hard cap held', async () => {
      const fix = makeServiceFixture({
        client: new MockGeminiClient(async () => ({
          kind: 'success',
          draft: {
            title: 'Tarefa',
            description: 'Detalhes',
            priority: 'medium',
            status: 'todo',
            checklist: [],
          },
          usage: {
            inputTokens: 1000,
            outputTokens: 500,
            costMicrounits: 1_001,
          },
        })),
      });

      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-overcost-1',
        description: 'Test description',
      });

      assert.deepEqual(res, {
        kind: 'unknown',
        operationId: 'op-1',
        errorCode: 'provider_cost_exceeds_reservation',
      });

      assert.equal(await fix.resultsStore.read('op-1'), null);
      const snapshot = fix.ledger.snapshot();
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedActions, 1);
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedActions, 0);
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedCostMicrounits, 0);
    });

    await test('2.2 Massive provider cost overage (50,000 microunits) is safely contained at hard cap', async () => {
      const fix = makeServiceFixture({
        client: new MockGeminiClient(async () => ({
          kind: 'success',
          draft: {
            title: 'Tarefa',
            description: 'Detalhes',
            priority: 'medium',
            status: 'todo',
            checklist: [],
          },
          usage: {
            inputTokens: 100_000,
            outputTokens: 50_000,
            costMicrounits: 50_000,
          },
        })),
      });

      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-overcost-2',
        description: 'Test description',
      });

      assert.deepEqual(res, {
        kind: 'unknown',
        operationId: 'op-1',
        errorCode: 'provider_cost_exceeds_reservation',
      });

      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].reservedCostMicrounits, 1_000);
      assert.equal(fix.ledger.snapshot().totalsByOrganization['org-test'].confirmedCostMicrounits, 0);
    });

    await test('2.3 Direct settle invocation exceeding reserved cost throws invariant error', async () => {
      const ledger = new InMemoryAiUsageLedger({
        organizations: { 'org-test': organizationFixture() },
        operationId: () => 'op-settle-test',
      });

      const reservation = await ledger.reserve({
        organizationId: 'org-test',
        uid: 'user-1',
        operationKey: 'task_draft',
        idempotencyFingerprint: 'sha256:' + 'a'.repeat(64),
        bodyHash: 'sha256:' + 'b'.repeat(64),
        nowMs: 1_000_000,
      });

      assert.equal(reservation.kind, 'reserved');

      await assert.rejects(
        async () => {
          await ledger.settle({
            operationId: 'op-settle-test',
            actualCostMicrounits: 1_001,
            inputTokens: 100,
            outputTokens: 50,
            resultHash: 'sha256:' + 'c'.repeat(64),
            nowMs: 1_000_001,
          });
        },
        /actualCostMicrounits exceeds the reserved worst-case cost/,
      );
    });

    await test('2.4 Cost exactly equal to hard cap settles smoothly with 0 reserve remaining', async () => {
      const fix = makeServiceFixture({
        client: new MockGeminiClient(async () => ({
          kind: 'success',
          draft: {
            title: 'Tarefa Exata',
            description: 'Detalhes',
            priority: 'medium',
            status: 'todo',
            checklist: [],
          },
          usage: {
            inputTokens: 1000,
            outputTokens: 280,
            costMicrounits: 1_000,
          },
        })),
      });

      const res = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-exact-cap',
        description: 'Test description',
      });

      assert.equal(res.kind, 'succeeded');
      const snapshot = fix.ledger.snapshot();
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedActions, 1);
      assert.equal(snapshot.totalsByOrganization['org-test'].confirmedCostMicrounits, 1_000);
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedActions, 0);
      assert.equal(snapshot.totalsByOrganization['org-test'].reservedCostMicrounits, 0);
    });
  });

  // AREA 3: REPLAY AUTHORIZATION REVALIDATION
  await suite('Area 3: Replay Authorization & Entitlement Revalidation', async () => {
    await test('3.1 User removed from organization is blocked on replay with forbidden (403) and 0 Gemini calls', async () => {
      const fix = makeServiceFixture();
      const command = {
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-replay-1',
        description: 'Proposta inicial para cliente',
      };

      const firstRes = await fix.service.generate(command);
      assert.equal(firstRes.kind, 'succeeded');
      assert.equal(fix.client.calls, 1);

      replaceLedgerOrgState(fix.ledger, 'org-test', organizationFixture({
        memberships: ['user-2', 'user-3'],
      }));

      const replayRes = await fix.service.generate(command);
      assert.deepEqual(replayRes, { kind: 'forbidden' });
      assert.equal(fix.client.calls, 1, 'Gemini must NEVER be called on unauthorized replay');
    });

    await test('3.2 Organization blocked accessMode blocks replay with entitlement (403) and 0 Gemini calls', async () => {
      const fix = makeServiceFixture();
      const command = {
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-replay-2',
        description: 'Proposta inicial para cliente',
      };

      const firstRes = await fix.service.generate(command);
      assert.equal(firstRes.kind, 'succeeded');
      assert.equal(fix.client.calls, 1);

      replaceLedgerOrgState(fix.ledger, 'org-test', organizationFixture({
        entitlement: {
          accessMode: 'blocked',
          ai: {
            usedActions: 1,
            maxActionsPerMonth: 10,
            remainingActions: 9,
            canUseAction: false,
          },
        },
      }));

      const replayRes = await fix.service.generate(command);
      assert.deepEqual(replayRes, { kind: 'blocked', reason: 'entitlement' });
      assert.equal(fix.client.calls, 1);
    });

    await test('3.3 Organization read_only accessMode blocks replay without Gemini call', async () => {
      const fix = makeServiceFixture();
      const command = {
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-replay-3',
        description: 'Proposta inicial para cliente',
      };

      const firstRes = await fix.service.generate(command);
      assert.equal(firstRes.kind, 'succeeded');

      replaceLedgerOrgState(fix.ledger, 'org-test', organizationFixture({
        entitlement: {
          accessMode: 'read_only',
          ai: {
            usedActions: 1,
            maxActionsPerMonth: 10,
            remainingActions: 9,
            canUseAction: false,
          },
        },
      }));

      const replayRes = await fix.service.generate(command);
      assert.deepEqual(replayRes, { kind: 'blocked', reason: 'entitlement' });
      assert.equal(fix.client.calls, 1);
    });

    await test('3.4 Cross-tenant replay isolation: User from different org cannot access cached draft', async () => {
      const fix = makeServiceFixture();
      const command = {
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-cross-tenant',
        description: 'Secret corporate proposal',
      };

      const firstRes = await fix.service.generate(command);
      assert.equal(firstRes.kind, 'succeeded');

      const attackerRes = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-evil',
        idempotencyKey: 'idemp-cross-tenant',
        description: 'Secret corporate proposal',
      });

      assert.deepEqual(attackerRes, { kind: 'forbidden' });
      assert.equal(fix.client.calls, 1);
    });

    await test('3.5 Modified body with same idempotency key triggers conflict (409)', async () => {
      const fix = makeServiceFixture();
      const command = {
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-conflict-test',
        description: 'Original text',
      };

      const firstRes = await fix.service.generate(command);
      assert.equal(firstRes.kind, 'succeeded');

      const conflictRes = await fix.service.generate({
        ...command,
        description: 'Altered text',
      });

      assert.deepEqual(conflictRes, {
        kind: 'conflict',
        operationId: 'op-1',
      });
      assert.equal(fix.client.calls, 1);
    });
  });

  // AREA 4: DUAL RATE & CONCURRENCY LIMITS
  await suite('Area 4: Dual Rate & Concurrency Limits (Org & User)', async () => {
    await test('4.1 Per-User Rate Limit: User hits user limit (2/min) while Org (10/min) has capacity', async () => {
      let currentTime = 1_000_000;
      const fix = makeServiceFixture({
        org: organizationFixture({
          policy: {
            ...organizationFixture().policy,
            maxOperationsPerWindow: 10,
            maxOperationsPerUserPerWindow: 2,
            rateWindowMs: 60_000,
          },
        }),
        now: () => currentTime,
      });

      const res1 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-u1-1',
        description: 'Task 1',
      });
      assert.equal(res1.kind, 'succeeded');

      const res2 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-u1-2',
        description: 'Task 2',
      });
      assert.equal(res2.kind, 'succeeded');

      const res3 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-u1-3',
        description: 'Task 3',
      });
      assert.deepEqual(res3, { kind: 'blocked', reason: 'rate' });

      const resU2 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-2',
        idempotencyKey: 'idemp-u2-1',
        description: 'Task for User 2',
      });
      assert.equal(resU2.kind, 'succeeded');
    });

    await test('4.2 Org-Wide Rate Limit: Org limit (3/min) reached blocks subsequent users with 0 calls', async () => {
      let currentTime = 1_000_000;
      const fix = makeServiceFixture({
        org: organizationFixture({
          policy: {
            ...organizationFixture().policy,
            maxOperationsPerWindow: 3,
            maxOperationsPerUserPerWindow: 5,
            rateWindowMs: 60_000,
          },
        }),
        now: () => currentTime,
      });

      await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-rate-1',
        description: 'T1',
      });
      await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-2',
        idempotencyKey: 'idemp-rate-2',
        description: 'T2',
      });
      await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-3',
        idempotencyKey: 'idemp-rate-3',
        description: 'T3',
      });

      const resOrgBlocked = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-rate-4',
        description: 'T4',
      });
      assert.deepEqual(resOrgBlocked, { kind: 'blocked', reason: 'rate' });
    });

    await test('4.3 Rate Limit Window Expiration releases rate limit cleanly', async () => {
      let currentTime = 1_000_000;
      const fix = makeServiceFixture({
        org: organizationFixture({
          policy: {
            ...organizationFixture().policy,
            maxOperationsPerWindow: 1,
            maxOperationsPerUserPerWindow: 1,
            rateWindowMs: 60_000,
          },
        }),
        now: () => currentTime,
      });

      const r1 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-window-1',
        description: 'T1',
      });
      assert.equal(r1.kind, 'succeeded');

      currentTime = 1_030_000;
      const r2 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-window-2',
        description: 'T2',
      });
      assert.deepEqual(r2, { kind: 'blocked', reason: 'rate' });

      currentTime = 1_060_001;
      const r3 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-window-3',
        description: 'T3',
      });
      assert.equal(r3.kind, 'succeeded');
    });

    await test('4.4 Per-User & Org Concurrency Limits block simultaneous operations and release on settle', async () => {
      let release1: (() => void) | undefined;
      let release2: (() => void) | undefined;

      const deferred1 = new Promise<GeminiTaskDraftClientResult>((resolve) => {
        release1 = () => resolve({
          kind: 'success',
          draft: { title: 'T1', description: 'D1', priority: 'low', status: 'todo', checklist: [] },
          usage: { inputTokens: 50, outputTokens: 25, costMicrounits: 300 },
        });
      });

      const deferred2 = new Promise<GeminiTaskDraftClientResult>((resolve) => {
        release2 = () => resolve({
          kind: 'success',
          draft: { title: 'T2', description: 'D2', priority: 'low', status: 'todo', checklist: [] },
          usage: { inputTokens: 50, outputTokens: 25, costMicrounits: 300 },
        });
      });

      let callCount = 0;
      const mockClient = new MockGeminiClient(async () => {
        callCount++;
        if (callCount === 1) return deferred1;
        if (callCount === 2) return deferred2;
        return {
          kind: 'success',
          draft: { title: 'T3', description: 'D3', priority: 'low', status: 'todo', checklist: [] },
          usage: { inputTokens: 50, outputTokens: 25, costMicrounits: 300 },
        };
      });

      const fix = makeServiceFixture({
        client: mockClient,
        org: organizationFixture({
          policy: {
            ...organizationFixture().policy,
            maxConcurrentOperations: 2,
            maxConcurrentOperationsPerUser: 1,
          },
        }),
      });

      const promise1 = fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-conc-1',
        description: 'Op 1',
      });

      const blockedUser1 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-conc-2',
        description: 'Op 2',
      });
      assert.deepEqual(blockedUser1, { kind: 'blocked', reason: 'concurrency' });

      const promise2 = fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-2',
        idempotencyKey: 'idemp-conc-3',
        description: 'Op 3',
      });

      const blockedOrg = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-3',
        idempotencyKey: 'idemp-conc-4',
        description: 'Op 4',
      });
      assert.deepEqual(blockedOrg, { kind: 'blocked', reason: 'concurrency' });

      release1?.();
      const res1 = await promise1;
      assert.equal(res1.kind, 'succeeded');

      release2?.();
      await promise2;

      const afterRelease = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-conc-5',
        description: 'Op 5',
      });
      assert.equal(afterRelease.kind, 'succeeded');
    });

    await test('4.5 Concurrency slot released on pre-provider failure and unknown failure', async () => {
      let opSeq = 0;
      const mockClient = new MockGeminiClient(async () => {
        opSeq++;
        if (opSeq === 1) return { kind: 'rejected_before_send', errorCode: 'provider_unavailable' };
        if (opSeq === 2) return { kind: 'unknown', errorCode: 'provider_timeout' };
        return {
          kind: 'success',
          draft: { title: 'T', description: 'D', priority: 'low', status: 'todo', checklist: [] },
          usage: { inputTokens: 50, outputTokens: 25, costMicrounits: 300 },
        };
      });

      const fix = makeServiceFixture({
        client: mockClient,
        org: organizationFixture({
          policy: {
            ...organizationFixture().policy,
            maxConcurrentOperations: 1,
            maxConcurrentOperationsPerUser: 1,
          },
        }),
      });

      const r1 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-rel-1',
        description: 'D1',
      });
      assert.equal(r1.kind, 'failed');

      const r2 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-rel-2',
        description: 'D2',
      });
      assert.equal(r2.kind, 'unknown');

      const r3 = await fix.service.generate({
        organizationId: 'org-test',
        uid: 'user-1',
        idempotencyKey: 'idemp-rel-3',
        description: 'D3',
      });
      assert.equal(r3.kind, 'succeeded');
    });
  });

  // AREA 5: SEAT ADMISSION GATE
  await suite('Area 5: Seat Admission Gate & Membership Invariants', async () => {
    await test('5.1 Org at maxActiveSeats capacity blocks new human membership with seat_limit_reached', async () => {
      const firestore = new FakeCommercialFirestore();
      const repo = new FirestoreCommercialRepository(firestore, {
        serverTimestamp: () => new Date().toISOString(),
      });

      await repo.createOrganization({
        organizationId: 'org-seats',
        actorUid: 'admin-1',
        correlationId: 'corr-create',
        displayName: 'Empresa Teste',
        maxActiveSeats: 2,
      });

      await repo.activateMembership({
        organizationId: 'org-seats',
        actorUid: 'admin-1',
        correlationId: 'corr-m1',
        uid: 'user-m1',
        role: 'member',
        kind: 'human',
      });
      await repo.activateMembership({
        organizationId: 'org-seats',
        actorUid: 'admin-1',
        correlationId: 'corr-m2',
        uid: 'user-m2',
        role: 'member',
        kind: 'human',
      });

      const orgDoc = await repo.readOrganization('org-seats');
      assert.equal(orgDoc?.activeSeats, 2);
      assert.equal(orgDoc?.maxActiveSeats, 2);

      await assert.rejects(
        async () => {
          await repo.activateMembership({
            organizationId: 'org-seats',
            actorUid: 'admin-1',
            correlationId: 'corr-m3',
            uid: 'user-m3',
            role: 'member',
            kind: 'human',
          });
        },
        (err: any) => err instanceof CommercialRepositoryError && err.code === 'seat_limit_reached',
      );
    });

    await test('5.2 Service memberships (bots/integrations) bypass human seat count', async () => {
      const firestore = new FakeCommercialFirestore();
      const repo = new FirestoreCommercialRepository(firestore, {
        serverTimestamp: () => new Date().toISOString(),
      });

      await repo.createOrganization({
        organizationId: 'org-srv',
        actorUid: 'admin-1',
        correlationId: 'corr-1',
        displayName: 'Empresa',
        maxActiveSeats: 1,
      });

      await repo.activateMembership({
        organizationId: 'org-srv',
        actorUid: 'admin-1',
        correlationId: 'corr-2',
        uid: 'user-human',
        role: 'member',
        kind: 'human',
      });

      await repo.activateMembership({
        organizationId: 'org-srv',
        actorUid: 'admin-1',
        correlationId: 'corr-3',
        uid: 'bot-integration',
        role: 'member',
        kind: 'service',
      });

      const orgDoc = await repo.readOrganization('org-srv');
      assert.equal(orgDoc?.activeSeats, 1);
    });

    await test('5.3 Deactivating a member decrements activeSeats and re-enables assignment', async () => {
      const firestore = new FakeCommercialFirestore();
      const repo = new FirestoreCommercialRepository(firestore, {
        serverTimestamp: () => new Date().toISOString(),
      });

      await repo.createOrganization({
        organizationId: 'org-deact',
        actorUid: 'admin-1',
        correlationId: 'corr-1',
        displayName: 'Empresa',
        maxActiveSeats: 2,
      });

      await repo.activateMembership({
        organizationId: 'org-deact',
        actorUid: 'admin-1',
        correlationId: 'corr-2',
        uid: 'u-1',
        role: 'member',
        kind: 'human',
      });
      await repo.activateMembership({
        organizationId: 'org-deact',
        actorUid: 'admin-1',
        correlationId: 'corr-3',
        uid: 'u-2',
        role: 'member',
        kind: 'human',
      });

      const deactivated = await repo.deactivateMembership({
        organizationId: 'org-deact',
        actorUid: 'admin-1',
        correlationId: 'corr-4',
        uid: 'u-1',
      });
      assert.equal(deactivated, true);

      let orgDoc = await repo.readOrganization('org-deact');
      assert.equal(orgDoc?.activeSeats, 1);

      await repo.activateMembership({
        organizationId: 'org-deact',
        actorUid: 'admin-1',
        correlationId: 'corr-5',
        uid: 'u-3',
        role: 'member',
        kind: 'human',
      });

      orgDoc = await repo.readOrganization('org-deact');
      assert.equal(orgDoc?.activeSeats, 2);
    });

    await test('5.4 Concurrent multi-admin invitation race with 1 seat left admits exactly 1', async () => {
      const firestore = new FakeCommercialFirestore();
      const repo = new FirestoreCommercialRepository(firestore, {
        serverTimestamp: () => new Date().toISOString(),
      });

      await repo.createOrganization({
        organizationId: 'org-race',
        actorUid: 'admin-1',
        correlationId: 'corr-1',
        displayName: 'Empresa Race',
        maxActiveSeats: 3,
      });

      await repo.activateMembership({
        organizationId: 'org-race',
        actorUid: 'admin-1',
        correlationId: 'corr-2',
        uid: 'u-1',
        role: 'member',
        kind: 'human',
      });
      await repo.activateMembership({
        organizationId: 'org-race',
        actorUid: 'admin-1',
        correlationId: 'corr-3',
        uid: 'u-2',
        role: 'member',
        kind: 'human',
      });

      const p1 = repo.activateMembership({
        organizationId: 'org-race',
        actorUid: 'admin-1',
        correlationId: 'corr-race-1',
        uid: 'u-3',
        role: 'member',
        kind: 'human',
      });

      const p2 = repo.activateMembership({
        organizationId: 'org-race',
        actorUid: 'admin-2',
        correlationId: 'corr-race-2',
        uid: 'u-4',
        role: 'member',
        kind: 'human',
      });

      const outcomes = await Promise.allSettled([p1, p2]);
      const fulfilled = outcomes.filter((o) => o.status === 'fulfilled');
      const rejected = outcomes.filter((o) => o.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly 1 concurrent invite must succeed');
      assert.equal(rejected.length, 1, 'Exactly 1 concurrent invite must be rejected');

      const orgDoc = await repo.readOrganization('org-race');
      assert.equal(orgDoc?.activeSeats, 3, 'Total active seats must not exceed 3');
    });

    await test('5.5 Plan downgrade with over-capacity retention keeps all active members intact', async () => {
      const firestore = new FakeCommercialFirestore();
      const repo = new FirestoreCommercialRepository(firestore, {
        serverTimestamp: () => new Date().toISOString(),
      });

      await repo.createOrganization({
        organizationId: 'org-down',
        actorUid: 'admin-1',
        correlationId: 'corr-1',
        displayName: 'Empresa Downgrade',
        maxActiveSeats: 5,
      });

      for (let i = 1; i <= 5; i++) {
        await repo.activateMembership({
          organizationId: 'org-down',
          actorUid: 'admin-1',
          correlationId: `corr-u${i}`,
          uid: `user-${i}`,
          role: 'member',
          kind: 'human',
        });
      }

      let orgDoc = await repo.readOrganization('org-down');
      assert.equal(orgDoc?.activeSeats, 5);

      await repo.setMaximumActiveSeats({
        organizationId: 'org-down',
        actorUid: 'admin-1',
        correlationId: 'corr-down',
        maxActiveSeats: 2,
      });

      orgDoc = await repo.readOrganization('org-down');
      assert.equal(orgDoc?.maxActiveSeats, 2);
      assert.equal(orgDoc?.activeSeats, 5, 'Existing active members must NOT be deleted or deactivated');

      for (let i = 1; i <= 5; i++) {
        const mem = await repo.readMembership('org-down', `user-${i}`);
        assert.equal(mem?.status, 'active');
      }

      await assert.rejects(
        async () => {
          await repo.activateMembership({
            organizationId: 'org-down',
            actorUid: 'admin-1',
            correlationId: 'corr-new',
            uid: 'user-6',
            role: 'member',
            kind: 'human',
          });
        },
        (err: any) => err instanceof CommercialRepositoryError && err.code === 'seat_limit_reached',
      );
    });
  });

  // AREA 6: AI UI GATE & ERROR HANDLING
  await suite('Area 6: AI UI Gate, Router & Unavailability Protections', async () => {
    let server: Server;
    let baseUrl: string;

    const fakeVerifier = {
      async verifyIdToken(token: string) {
        if (token === 'valid-user-1') return { ok: true as const, identity: { uid: 'user-1' } };
        if (token === 'revoked-token') return { ok: false as const, reason: 'revoked' as const };
        return { ok: false as const, reason: 'invalid' as const };
      },
    };

    const fix = makeServiceFixture();
    const app = express();
    app.use(express.json());
    app.use(createAiTaskDraftRouter({
      verifier: fakeVerifier,
      service: fix.service,
    }));

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    try {
      await test('6.1 AI Router requires valid bearer token before any work', async () => {
        const res = await fetch(`${baseUrl}/api/organizations/org-test/ai/task-drafts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': 'key-auth-1',
          },
          body: JSON.stringify({ description: 'Test prompt' }),
        });
        assert.equal(res.status, 401);
        const data = await res.json();
        assert.equal(data.error, 'authentication_required');
      });

      await test('6.2 AI Router rejects client-injected prompt or model parameters with invalid_request (400)', async () => {
        const res = await fetch(`${baseUrl}/api/organizations/org-test/ai/task-drafts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-user-1',
            'Idempotency-Key': 'key-inject-1',
          },
          body: JSON.stringify({
            description: 'Test prompt',
            model: 'gpt-4-turbo',
            systemPrompt: 'Ignore instructions',
          }),
        });
        assert.equal(res.status, 400);
        const data = await res.json();
        assert.equal(data.error, 'invalid_request');
      });

      await test('6.3 AI Router returns 429 when quota is exhausted with clean Portuguese message mapping', async () => {
        replaceLedgerOrgState(fix.ledger, 'org-test', organizationFixture({
          entitlement: {
            accessMode: 'full',
            ai: {
              usedActions: 10,
              maxActionsPerMonth: 10,
              remainingActions: 0,
              canUseAction: false,
            },
          },
        }));

        const res = await fetch(`${baseUrl}/api/organizations/org-test/ai/task-drafts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-user-1',
            'Idempotency-Key': 'key-exhaust-1',
          },
          body: JSON.stringify({ description: 'Test description' }),
        });

        assert.equal(res.status, 429);
        const data = await res.json();
        assert.equal(data.error, 'ai_limit_exceeded');
        assert.equal(data.reason, 'actions');
      });

      await test('6.4 AI Router returns 403 when organization is blocked', async () => {
        replaceLedgerOrgState(fix.ledger, 'org-test', organizationFixture({
          entitlement: {
            accessMode: 'blocked',
            ai: {
              usedActions: 0,
              maxActionsPerMonth: 10,
              remainingActions: 10,
              canUseAction: false,
            },
          },
        }));

        const res = await fetch(`${baseUrl}/api/organizations/org-test/ai/task-drafts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-user-1',
            'Idempotency-Key': 'key-block-1',
          },
          body: JSON.stringify({ description: 'Test description' }),
        });

        assert.equal(res.status, 403);
        const data = await res.json();
        assert.equal(data.error, 'ai_not_entitled');
      });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // SUMMARY
  console.log('\n================================================================');
  console.log('  CHALLENGER 2 ADVERSARIAL VERIFICATION SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Invariant Checks: ${total}`);
  console.log(`Passed:                ${passed} / ${total}`);
  console.log(`Failed:                ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED INVARIANT CHECKS:');
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(` - [${r.suite}] ${r.name}:\n   ${r.error}`);
    });
    process.exitCode = 1;
  } else {
    console.log('\nALL ADVERSARIAL STRESS-TESTS & INVARIANT GATES PASSED WITH 100% SUCCESS.');
  }
}

runAdversarialVerification().catch((err) => {
  console.error('Fatal test harness execution error:', err);
  process.exitCode = 1;
});
