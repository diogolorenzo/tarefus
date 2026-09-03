import assert from 'node:assert/strict';
import { planLegacyCommercialMigration } from '../src/server/commercial-migration';

interface TestResult {
  name: string;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, execute: () => void): void {
  try {
    execute();
    results.push({ name });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

const readyInput = {
  organization: {
    organizationId: 'org-acme',
    displayName: 'Acme',
    maxActiveSeats: 2,
  },
  legacySnapshot: {
    users: [
      { legacyUserId: 'legacy-b', active: false },
      { legacyUserId: 'legacy-a', active: true },
    ],
  },
  uidByLegacyUserId: {
    'legacy-a': 'firebase-user-a',
    'legacy-b': 'firebase-user-b',
  },
  roleByLegacyUserId: {
    'legacy-a': 'billing_admin' as const,
  },
};

test('produces the same conditional creation plan on every dry run', () => {
  const first = planLegacyCommercialMigration(readyInput);
  const second = planLegacyCommercialMigration(structuredClone(readyInput));

  assert.deepEqual(first, second);
  assert.equal(first.status, 'ready');
  assert.equal(first.operations[0]?.mode, 'create_if_absent');
  assert.deepEqual(first.operations.map((operation) => operation.path), [
    'organizations/org-acme',
    'organizations/org-acme/memberships/firebase-user-a',
    'organizations/org-acme/memberships/firebase-user-b',
  ]);
  assert.deepEqual(first.operations[1]?.data, {
    uid: 'firebase-user-a',
    kind: 'human',
    role: 'billing_admin',
    status: 'active',
  });
});

test('blocks the whole plan when a legacy user has no explicit Firebase UID mapping', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    uidByLegacyUserId: { 'legacy-a': 'firebase-user-a' },
  });

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.deepEqual(plan.blockers, [
    {
      code: 'missing_firebase_uid',
      legacyUserId: 'legacy-b',
      message: 'Legacy user legacy-b has no explicit Firebase UID mapping.',
    },
  ]);
});

test('does not treat legacy ids as Firebase UIDs and rejects duplicate mapped identities', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    uidByLegacyUserId: {
      'legacy-a': 'shared-firebase-user',
      'legacy-b': 'shared-firebase-user',
    },
  });

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.equal(plan.blockers[0]?.code, 'duplicate_firebase_uid');
});

test('reports a seat blocker instead of planning an over-capacity initial state', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    organization: { ...readyInput.organization, maxActiveSeats: 0 },
  });

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.deepEqual(plan.blockers, [
    {
      code: 'active_seats_exceed_limit',
      message: 'The legacy snapshot has 1 active human membership but the organization limit is 0.',
    },
  ]);
});

test('blocks instead of silently dropping a membership with an invalid commercial role mapping', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    roleByLegacyUserId: { 'legacy-a': 'owner' },
  } as never);

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.deepEqual(plan.blockers, [
    {
      code: 'invalid_input',
      field: 'roleByLegacyUserId.legacy-a',
      message: 'roleByLegacyUserId.legacy-a must be member, admin, or billing_admin.',
    },
  ]);
});

test('blocks a deserialized legacy user whose active field is missing', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    legacySnapshot: {
      users: [
        { legacyUserId: 'legacy-a' },
        { legacyUserId: 'legacy-b', active: false },
      ],
    },
  } as never);

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.deepEqual(plan.blockers, [
    {
      code: 'invalid_input',
      field: 'legacySnapshot.users[legacy-a].active',
      message: 'legacySnapshot.users[legacy-a].active must be boolean.',
    },
  ]);
});

test('blocks a deserialized legacy user whose active field has a non-boolean type', () => {
  const plan = planLegacyCommercialMigration({
    ...readyInput,
    legacySnapshot: {
      users: [
        { legacyUserId: 'legacy-a', active: 'true' },
        { legacyUserId: 'legacy-b', active: false },
      ],
    },
  } as never);

  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.operations, []);
  assert.deepEqual(plan.blockers, [
    {
      code: 'invalid_input',
      field: 'legacySnapshot.users[legacy-a].active',
      message: 'legacySnapshot.users[legacy-a].active must be boolean.',
    },
  ]);
});

const failures = results.filter((result) => result.error);
if (failures.length > 0) {
  console.error(`\n${failures.length}/${results.length} commercial migration tests failed.`);
  process.exitCode = 1;
} else {
  console.log(`\n${results.length}/${results.length} commercial migration tests passed.`);
}
