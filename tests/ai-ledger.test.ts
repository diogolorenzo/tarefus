import assert from 'node:assert/strict';
import {
  InMemoryAiUsageLedger,
  type InMemoryAiOrganizationState,
} from '../src/server/ai-usage-ledger';

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

const hash = (character: string): string => `sha256:${character.repeat(64)}`;

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
      maxOperationsPerUserPerWindow: 10,
      rateWindowMs: 60_000,
      maxConcurrentOperations: 2,
      maxConcurrentOperationsPerUser: 2,
      taskDraftWorstCaseCostMicrounits: 1_000,
    },
    ...overrides,
  };
}

function reservation(
  overrides: Partial<Parameters<InMemoryAiUsageLedger['reserve']>[0]> = {},
) {
  return {
    organizationId: 'org-a',
    uid: 'user-1',
    operationKey: 'task_draft' as const,
    idempotencyFingerprint: hash('a'),
    bodyHash: hash('b'),
    nowMs: 1_000_000,
    ...overrides,
  };
}

function replaceTrustedOrganizationState(
  ledger: InMemoryAiUsageLedger,
  organizationId: string,
  state: InMemoryAiOrganizationState,
): void {
  const mutableFake = ledger as unknown as {
    organizations: Map<string, InMemoryAiOrganizationState>;
  };
  mutableFake.organizations.set(organizationId, structuredClone(state));
}

await test('blocks an exhausted AI action allowance before creating a reservation', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-a': organization({
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
    },
  });

  const result = await ledger.reserve(reservation());

  assert.deepEqual(result, { kind: 'blocked', reason: 'actions' });
  assert.equal(ledger.snapshot().operations.length, 0);
});

await test('serializes concurrent reservations so only one reaches a concurrency limit of one', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-a': organization({
        policy: {
          ...organization().policy,
          maxConcurrentOperations: 1,
        },
      }),
    },
  });

  const [first, second] = await Promise.all([
    ledger.reserve(reservation()),
    ledger.reserve(reservation({
      idempotencyFingerprint: hash('c'),
      bodyHash: hash('d'),
    })),
  ]);

  assert.equal(first.kind, 'reserved');
  assert.deepEqual(second, { kind: 'blocked', reason: 'concurrency' });
  assert.equal(ledger.snapshot().operations.length, 1);
});

await test('blocks one user at their rate limit while the organization still has capacity', async () => {
  const state = organization({ memberships: ['user-1', 'user-2'] });
  Object.assign(state.policy, {
    maxOperationsPerWindow: 4,
    maxOperationsPerUserPerWindow: 1,
    maxConcurrentOperations: 4,
    maxConcurrentOperationsPerUser: 2,
  });
  const ledger = new InMemoryAiUsageLedger({ organizations: { 'org-a': state } });
  const first = await ledger.reserve(reservation());
  assert.equal(first.kind, 'reserved');
  if (first.kind !== 'reserved') return;
  await ledger.releaseBeforeProvider({
    operationId: first.operation.operationId,
    failureCode: 'provider_unavailable',
    nowMs: 1_000_010,
  });

  const sameUser = await ledger.reserve(reservation({
    idempotencyFingerprint: hash('c'),
    bodyHash: hash('d'),
    nowMs: 1_000_020,
  }));
  const otherUser = await ledger.reserve(reservation({
    uid: 'user-2',
    idempotencyFingerprint: hash('e'),
    bodyHash: hash('f'),
    nowMs: 1_000_020,
  }));

  assert.deepEqual(sameUser, { kind: 'blocked', reason: 'rate' });
  assert.equal(otherUser.kind, 'reserved');
});

await test('blocks one user at their concurrency limit while the organization still has capacity', async () => {
  const state = organization({ memberships: ['user-1', 'user-2'] });
  Object.assign(state.policy, {
    maxOperationsPerWindow: 10,
    maxOperationsPerUserPerWindow: 10,
    maxConcurrentOperations: 3,
    maxConcurrentOperationsPerUser: 1,
  });
  const ledger = new InMemoryAiUsageLedger({ organizations: { 'org-a': state } });
  const first = await ledger.reserve(reservation());

  const sameUser = await ledger.reserve(reservation({
    idempotencyFingerprint: hash('c'),
    bodyHash: hash('d'),
  }));
  const otherUser = await ledger.reserve(reservation({
    uid: 'user-2',
    idempotencyFingerprint: hash('e'),
    bodyHash: hash('f'),
  }));

  assert.equal(first.kind, 'reserved');
  assert.deepEqual(sameUser, { kind: 'blocked', reason: 'concurrency' });
  assert.equal(otherUser.kind, 'reserved');
});

await test('replays the same body and conflicts without another reservation for a changed body', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
    operationId: () => 'operation-1',
  });

  const first = await ledger.reserve(reservation());
  const replay = await ledger.reserve(reservation());
  const conflict = await ledger.reserve(reservation({ bodyHash: hash('e') }));

  assert.equal(first.kind, 'reserved');
  assert.equal(replay.kind, 'replay');
  if (first.kind !== 'reserved' || replay.kind !== 'replay') return;
  assert.equal(replay.operation.operationId, first.operation.operationId);
  assert.equal(replay.operation.status, 'reserved');
  assert.deepEqual(conflict, { kind: 'conflict', operationId: 'operation-1' });
  assert.equal(ledger.snapshot().operations.length, 1);
});

await test('denies replay after the user membership is removed', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
    operationId: () => 'operation-1',
  });
  await ledger.reserve(reservation());
  await ledger.settle({
    operationId: 'operation-1',
    actualCostMicrounits: 640,
    inputTokens: 120,
    outputTokens: 45,
    resultHash: hash('f'),
    nowMs: 1_000_100,
  });
  replaceTrustedOrganizationState(ledger, 'org-a', organization({ memberships: [] }));

  const replay = await ledger.reserve(reservation({ nowMs: 1_000_200 }));

  assert.deepEqual(replay, { kind: 'forbidden' });
  assert.equal(ledger.snapshot().operations.length, 1);
});

await test('denies replay after the organization entitlement becomes blocked', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
    operationId: () => 'operation-1',
  });
  await ledger.reserve(reservation());
  await ledger.settle({
    operationId: 'operation-1',
    actualCostMicrounits: 640,
    inputTokens: 120,
    outputTokens: 45,
    resultHash: hash('f'),
    nowMs: 1_000_100,
  });
  replaceTrustedOrganizationState(ledger, 'org-a', organization({
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

  const replay = await ledger.reserve(reservation({ nowMs: 1_000_200 }));

  assert.deepEqual(replay, { kind: 'blocked', reason: 'entitlement' });
  assert.equal(ledger.snapshot().operations.length, 1);
});

await test('settles one confirmed action at its integer microunit cost', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
    operationId: () => 'operation-1',
  });
  const reserved = await ledger.reserve(reservation());
  assert.equal(reserved.kind, 'reserved');

  await ledger.settle({
    operationId: 'operation-1',
    actualCostMicrounits: 640,
    inputTokens: 120,
    outputTokens: 45,
    resultHash: hash('f'),
    nowMs: 1_000_100,
  });

  assert.deepEqual(ledger.snapshot().totalsByOrganization['org-a'], {
    confirmedActions: 1,
    confirmedCostMicrounits: 640,
    reservedActions: 0,
    reservedCostMicrounits: 0,
  });
  const [operation] = ledger.snapshot().operations;
  assert.equal(operation.status, 'succeeded');
  assert.equal(operation.actualCostMicrounits, 640);
  assert.equal(operation.inputTokens, 120);
  assert.equal(operation.outputTokens, 45);
});

await test('releases a pre-provider failure without retrying that idempotent operation', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-a': organization({
        policy: {
          ...organization().policy,
          maxConcurrentOperations: 1,
        },
      }),
    },
    operationId: (() => {
      let value = 0;
      return () => `operation-${++value}`;
    })(),
  });
  await ledger.reserve(reservation());

  await ledger.releaseBeforeProvider({
    operationId: 'operation-1',
    failureCode: 'provider_unavailable',
    nowMs: 1_000_100,
  });

  const replay = await ledger.reserve(reservation());
  const next = await ledger.reserve(reservation({
    idempotencyFingerprint: hash('c'),
    bodyHash: hash('d'),
  }));
  assert.equal(replay.kind, 'replay');
  if (replay.kind === 'replay') assert.equal(replay.operation.status, 'failed');
  assert.equal(next.kind, 'reserved');
});

await test('keeps an ambiguous provider timeout unknown and economically reserved', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
    operationId: () => 'operation-1',
  });
  await ledger.reserve(reservation());

  await ledger.markUnknown({
    operationId: 'operation-1',
    failureCode: 'provider_timeout',
    nowMs: 1_000_100,
  });

  const replay = await ledger.reserve(reservation());
  assert.equal(replay.kind, 'replay');
  if (replay.kind === 'replay') assert.equal(replay.operation.status, 'unknown');
  assert.deepEqual(ledger.snapshot().totalsByOrganization['org-a'], {
    confirmedActions: 0,
    confirmedCostMicrounits: 0,
    reservedActions: 1,
    reservedCostMicrounits: 1_000,
  });
});

await test('stores only hashes, bounded metadata and integer accounting fields', async () => {
  const ledger = new InMemoryAiUsageLedger({
    organizations: { 'org-a': organization() },
  });
  await ledger.reserve(reservation());

  const serialized = JSON.stringify(ledger.snapshot());
  assert.equal(serialized.includes('sensitive task description'), false);
  assert.equal(serialized.includes('Bearer '), false);
  assert.match(serialized, /sha256:[a-f0-9]{64}/);
  for (const operation of ledger.snapshot().operations) {
    assert.equal(Number.isSafeInteger(operation.reservedCostMicrounits), true);
  }
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} AI ledger tests passed`);
if (failures.length > 0) process.exit(1);
