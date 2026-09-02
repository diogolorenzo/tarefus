import assert from 'node:assert/strict';
import { InMemoryAiUsageLedger, type InMemoryAiOrganizationState } from '../src/server/ai-usage-ledger';
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
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, execute: () => Promise<void>): Promise<void> {
  try {
    await execute();
    results.push({ name });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

function organization(
  overrides: Partial<InMemoryAiOrganizationState> = {},
): InMemoryAiOrganizationState {
  return {
    memberships: ['user-1'],
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
      rateWindowMs: 60_000,
      maxConcurrentOperations: 2,
      taskDraftWorstCaseCostMicrounits: 1_000,
    },
    ...overrides,
  };
}

function successfulResult(title = 'Preparar proposta'): GeminiTaskDraftClientResult {
  return {
    kind: 'success',
    draft: {
      title,
      description: 'Organizar os requisitos e preparar a proposta.',
      priority: 'medium',
      status: 'todo',
      checklist: ['Reunir requisitos', 'Revisar proposta'],
    },
    usage: {
      inputTokens: 120,
      outputTokens: 45,
      costMicrounits: 640,
    },
  };
}

class FakeGeminiClient implements GeminiTaskDraftClient {
  calls = 0;

  constructor(
    public generateResult: () => Promise<GeminiTaskDraftClientResult>,
  ) {}

  async generateTaskDraft(): Promise<GeminiTaskDraftClientResult> {
    this.calls += 1;
    return this.generateResult();
  }
}

function service(input: {
  organization?: InMemoryAiOrganizationState;
  client?: FakeGeminiClient;
  operationId?: () => string;
} = {}) {
  const client = input.client ?? new FakeGeminiClient(async () => successfulResult());
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': input.organization ?? organization() },
    operationId: input.operationId ?? (() => 'operation-1'),
  });
  return {
    client,
    ledger,
    service: new AiTaskDraftService({
      ledger,
      client,
      results: new InMemoryAiOperationResultStore(),
      now: () => 1_000_000,
    }),
  };
}

const command = {
  organizationId: 'org-a',
  uid: 'user-1',
  idempotencyKey: 'request-key-0001',
  description: 'Preparar uma proposta para o cliente.',
};

await test('blocks an exceeded allowance before calling Gemini', async () => {
  const fixture = service({
    organization: organization({
      entitlement: {
        accessMode: 'full',
        ai: {
          usedActions: 10,
          maxActionsPerMonth: 10,
          remainingActions: 0,
          canUseAction: false,
        },
      },
    }),
  });

  const response = await fixture.service.generate(command);

  assert.deepEqual(response, { kind: 'blocked', reason: 'actions' });
  assert.equal(fixture.client.calls, 0);
});

await test('allows only one concurrent provider call when concurrency is one', async () => {
  let releaseProvider: ((result: GeminiTaskDraftClientResult) => void) | undefined;
  let providerStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    providerStarted = resolve;
  });
  const client = new FakeGeminiClient(() => {
    providerStarted?.();
    return new Promise<GeminiTaskDraftClientResult>((resolve) => {
      releaseProvider = resolve;
    });
  });
  let operationSequence = 0;
  const fixture = service({
    client,
    organization: organization({
      policy: { ...organization().policy, maxConcurrentOperations: 1 },
    }),
    operationId: () => `operation-${++operationSequence}`,
  });

  const first = fixture.service.generate(command);
  await started;
  const second = await fixture.service.generate({
    ...command,
    idempotencyKey: 'request-key-0002',
    description: 'Preparar outra proposta.',
  });
  releaseProvider?.(successfulResult());
  const firstResponse = await first;

  assert.equal(firstResponse.kind, 'succeeded');
  assert.deepEqual(second, { kind: 'blocked', reason: 'concurrency' });
  assert.equal(client.calls, 1);
});

await test('returns the stored result for the same idempotency key and body', async () => {
  const fixture = service();

  const first = await fixture.service.generate(command);
  const replay = await fixture.service.generate(command);

  assert.deepEqual(replay, first);
  assert.equal(fixture.client.calls, 1);
});

await test('returns conflict for the same idempotency key with a different body', async () => {
  const fixture = service();
  await fixture.service.generate(command);

  const conflict = await fixture.service.generate({
    ...command,
    description: 'Preparar um contrato diferente.',
  });

  assert.deepEqual(conflict, { kind: 'conflict', operationId: 'operation-1' });
  assert.equal(fixture.client.calls, 1);
});

await test('releases a failure known to occur before provider dispatch', async () => {
  const client = new FakeGeminiClient(async () => ({
    kind: 'rejected_before_send',
    errorCode: 'provider_unavailable',
  }));
  let operationSequence = 0;
  const fixture = service({
    client,
    organization: organization({
      policy: { ...organization().policy, maxConcurrentOperations: 1 },
    }),
    operationId: () => `operation-${++operationSequence}`,
  });

  const failed = await fixture.service.generate(command);
  const replay = await fixture.service.generate(command);
  client.generateResult = async () => successfulResult('Preparar contrato');
  const next = await fixture.service.generate({
    ...command,
    idempotencyKey: 'request-key-0002',
    description: 'Preparar contrato.',
  });

  assert.deepEqual(failed, {
    kind: 'failed',
    operationId: 'operation-1',
    errorCode: 'provider_unavailable',
  });
  assert.deepEqual(replay, failed);
  assert.equal(next.kind, 'succeeded');
  assert.equal(client.calls, 2);
});

await test('settles confirmed provider usage and returns the structured result', async () => {
  const fixture = service();

  const response = await fixture.service.generate(command);

  assert.equal(response.kind, 'succeeded');
  if (response.kind === 'succeeded') {
    assert.equal(response.operationId, 'operation-1');
    assert.equal(response.draft.title, 'Preparar proposta');
  }
  assert.deepEqual(fixture.ledger.snapshot().totalsByOrganization['org-a'], {
    confirmedActions: 1,
    confirmedCostMicrounits: 640,
    reservedActions: 0,
    reservedCostMicrounits: 0,
  });
});

await test('keeps an ambiguous timeout unknown and never calls Gemini again on replay', async () => {
  const client = new FakeGeminiClient(async () => ({
    kind: 'unknown',
    errorCode: 'provider_timeout',
  }));
  const fixture = service({ client });

  const first = await fixture.service.generate(command);
  const replay = await fixture.service.generate(command);

  assert.deepEqual(first, {
    kind: 'unknown',
    operationId: 'operation-1',
    errorCode: 'provider_timeout',
  });
  assert.deepEqual(replay, first);
  assert.equal(client.calls, 1);
});

await test('denies a user from another organization before calling Gemini', async () => {
  const fixture = service();

  const response = await fixture.service.generate({
    ...command,
    uid: 'user-from-org-b',
  });

  assert.deepEqual(response, { kind: 'forbidden' });
  assert.equal(fixture.client.calls, 0);
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} AI task draft service tests passed`);
if (failures.length > 0) process.exit(1);
