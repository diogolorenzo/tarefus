import assert from 'node:assert/strict';
import {
  CommercialRepositoryError,
  FirestoreCommercialRepository,
  commercialPaths,
  type AuditPayload,
} from '../src/server/commercial-repository';
import { FakeCommercialFirestore } from './support/fake-commercial-firestore';

interface TestResult {
  name: string;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, execute: () => void | Promise<void>): Promise<void> {
  try {
    await execute();
    results.push({ name });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

function setup(timestamp = 'SERVER_TIMESTAMP'): {
  firestore: FakeCommercialFirestore;
  repository: FirestoreCommercialRepository;
} {
  const firestore = new FakeCommercialFirestore();
  const repository = new FirestoreCommercialRepository(firestore, {
    serverTimestamp: () => timestamp,
  });
  return { firestore, repository };
}

function command(organizationId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    organizationId,
    actorUid: 'server-admin',
    correlationId: `correlation-${organizationId}`,
    ...overrides,
  };
}

await test('builds only the six bounded commercial path families and rejects path injection', () => {
  assert.deepEqual(commercialPaths.organization('org-a'), 'organizations/org-a');
  assert.deepEqual(commercialPaths.membership('org-a', 'user-1'), 'organizations/org-a/memberships/user-1');
  assert.deepEqual(commercialPaths.subscription('org-a'), 'organizations/org-a/subscriptions/current');
  assert.deepEqual(commercialPaths.entitlement('org-a'), 'organizations/org-a/entitlements/current');
  assert.deepEqual(commercialPaths.usagePeriod('org-a', '2026-09'), 'organizations/org-a/usagePeriods/2026-09');
  assert.deepEqual(commercialPaths.auditEvent('org-a', 'event-1'), 'organizations/org-a/auditEvents/event-1');
  assert.throws(() => commercialPaths.organization('../org-b'), /single Firestore path segment/);
  assert.throws(() => commercialPaths.membership('org-a', 'users/other'), /single Firestore path segment/);
});

await test('serializes organization authority from explicit server commands with repository timestamps', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 2,
    createdAt: 'CLIENT_TIMESTAMP',
    activeSeats: 99,
    role: 'billing_admin',
  } as never);

  assert.deepEqual(firestore.read('organizations/org-a'), {
    displayName: 'Acme',
    activeSeats: 0,
    maxActiveSeats: 2,
    createdAt: 'SERVER_TIMESTAMP',
    updatedAt: 'SERVER_TIMESTAMP',
  });
});

await test('serializes concurrent human activation so the seat limit cannot be oversubscribed', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 1,
  } as never);

  const outcomes = await Promise.allSettled([
    repository.activateMembership({
      ...command('org-a', { correlationId: 'activate-1' }),
      uid: 'user-1',
      role: 'member',
      kind: 'human',
    } as never),
    repository.activateMembership({
      ...command('org-a', { correlationId: 'activate-2' }),
      uid: 'user-2',
      role: 'member',
      kind: 'human',
    } as never),
  ]);

  assert.equal(outcomes.filter((outcome) => outcome.status === 'fulfilled').length, 1);
  const rejected = outcomes.find((outcome) => outcome.status === 'rejected');
  assert.ok(rejected && rejected.status === 'rejected');
  assert.ok(rejected.reason instanceof CommercialRepositoryError);
  assert.equal(rejected.reason.code, 'seat_limit_reached');
  assert.equal(firestore.read('organizations/org-a')?.activeSeats, 1);
  assert.equal(firestore.list('organizations/org-a/memberships').length, 1);
});

await test('counts only active human memberships as seats', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 1,
  } as never);
  await repository.activateMembership({
    ...command('org-a', { correlationId: 'human' }),
    uid: 'human-1',
    role: 'member',
    kind: 'human',
  } as never);
  await repository.activateMembership({
    ...command('org-a', { correlationId: 'service' }),
    uid: 'service-1',
    role: 'admin',
    kind: 'service',
  } as never);

  assert.equal(firestore.read('organizations/org-a')?.activeSeats, 1);
  assert.equal(firestore.list('organizations/org-a/memberships').length, 2);

  await repository.deactivateMembership({
    ...command('org-a', { correlationId: 'deactivate-human' }),
    uid: 'human-1',
  } as never);
  assert.equal(firestore.read('organizations/org-a')?.activeSeats, 0);
});

await test('keeps existing members active after a seat-limit downgrade and blocks only later activation', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 2,
  } as never);
  for (const uid of ['user-1', 'user-2']) {
    await repository.activateMembership({
      ...command('org-a', { correlationId: `activate-${uid}` }),
      uid,
      role: 'member',
      kind: 'human',
    } as never);
  }

  await repository.setMaximumActiveSeats({
    ...command('org-a', { correlationId: 'downgrade' }),
    maxActiveSeats: 1,
  } as never);

  assert.equal(firestore.read('organizations/org-a')?.activeSeats, 2);
  assert.equal(firestore.read('organizations/org-a')?.maxActiveSeats, 1);
  assert.equal(firestore.read('organizations/org-a/memberships/user-1')?.status, 'active');
  assert.equal(firestore.read('organizations/org-a/memberships/user-2')?.status, 'active');
  await assert.rejects(
    repository.activateMembership({
      ...command('org-a', { correlationId: 'blocked-after-downgrade' }),
      uid: 'user-3',
      role: 'member',
      kind: 'human',
    } as never),
    (error: unknown) => error instanceof CommercialRepositoryError && error.code === 'seat_limit_reached',
  );
});

await test('isolates organization reads and implements active membership and entitlement access contracts', async () => {
  const { repository } = setup();
  for (const organizationId of ['org-a', 'org-b']) {
    await repository.createOrganization({
      ...command(organizationId),
      displayName: organizationId,
      maxActiveSeats: 2,
    } as never);
  }
  await repository.activateMembership({
    ...command('org-a', { correlationId: 'activate-a' }),
    uid: 'user-1',
    role: 'billing_admin',
    kind: 'human',
  } as never);
  await repository.activateMembership({
    ...command('org-b', { correlationId: 'activate-b' }),
    uid: 'user-1',
    role: 'member',
    kind: 'human',
  } as never);
  await repository.writeEntitlements({
    ...command('org-a', { correlationId: 'entitlement-a' }),
    entitlements: entitlement('draft-team'),
  } as never);
  await repository.writeEntitlements({
    ...command('org-b', { correlationId: 'entitlement-b' }),
    entitlements: entitlement('draft-solo'),
  } as never);

  assert.equal((await repository.readEntitlements('org-a') as { planId: string }).planId, 'draft-team');
  assert.equal((await repository.readEntitlements('org-b') as { planId: string }).planId, 'draft-solo');
  assert.deepEqual(await repository.findMembershipsByUid('user-1'), [
    { organizationId: 'org-a', uid: 'user-1', role: 'billing_admin' },
    { organizationId: 'org-b', uid: 'user-1', role: 'member' },
  ]);

  await repository.deactivateMembership({
    ...command('org-b', { correlationId: 'deactivate-b' }),
    uid: 'user-1',
  } as never);
  assert.deepEqual(await repository.findMembershipsByUid('user-1'), [
    { organizationId: 'org-a', uid: 'user-1', role: 'billing_admin' },
  ]);
});

await test('writes subscription, entitlement, and concurrent usage through allowlisted transaction serializers', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 1,
  } as never);
  await repository.writeSubscription({
    ...command('org-a', { correlationId: 'subscription' }),
    subscription: {
      subscriptionId: 'sub-1',
      workspaceId: 'malicious-org',
      planId: 'draft-team',
      state: 'active',
      startedAt: '2026-09-01T00:00:00.000Z',
      currentPeriodEndsAt: '2026-10-01T00:00:00.000Z',
      createdAt: 'CLIENT_TIMESTAMP',
      organizationId: 'malicious-org',
    },
  } as never);
  await repository.writeEntitlements({
    ...command('org-a', { correlationId: 'entitlement' }),
    entitlements: entitlement('draft-team'),
  } as never);
  await Promise.all([
    repository.incrementUsagePeriod({
      ...command('org-a', { correlationId: 'usage-1' }),
      periodId: '2026-09',
      aiActions: 2,
    } as never),
    repository.incrementUsagePeriod({
      ...command('org-a', { correlationId: 'usage-2' }),
      periodId: '2026-09',
      aiActions: 3,
    } as never),
  ]);

  assert.deepEqual(firestore.read('organizations/org-a/subscriptions/current'), {
    subscriptionId: 'sub-1',
    workspaceId: 'org-a',
    planId: 'draft-team',
    state: 'active',
    startedAt: '2026-09-01T00:00:00.000Z',
    currentPeriodEndsAt: '2026-10-01T00:00:00.000Z',
    createdAt: 'SERVER_TIMESTAMP',
    updatedAt: 'SERVER_TIMESTAMP',
  });
  assert.equal(firestore.read('organizations/org-a/entitlements/current')?.planId, 'draft-team');
  assert.deepEqual(firestore.read('organizations/org-a/usagePeriods/2026-09'), {
    aiActionsUsed: 5,
    createdAt: 'SERVER_TIMESTAMP',
    updatedAt: 'SERVER_TIMESTAMP',
  });
});

await test('creates immutable audit events with server ids, stable payload hashes, and no edit API', async () => {
  const { firestore, repository } = setup();
  await repository.createOrganization({
    ...command('org-a'),
    displayName: 'Acme',
    maxActiveSeats: 1,
  } as never);
  const payload: AuditPayload = { membershipUid: 'user-1', status: 'active' };
  const first = await repository.appendAuditEvent({
    ...command('org-a', { correlationId: 'audit-1' }),
    type: 'membership.manual_note',
    payload,
  } as never);
  const second = await repository.appendAuditEvent({
    ...command('org-a', { correlationId: 'audit-2' }),
    type: 'membership.manual_note',
    payload: { status: 'active', membershipUid: 'user-1' },
  } as never);

  assert.notEqual(first.eventId, second.eventId);
  const firstData = firestore.read(first.path);
  const secondData = firestore.read(second.path);
  assert.equal(firstData?.payloadHash, secondData?.payloadHash);
  assert.equal(firstData?.occurredAt, 'SERVER_TIMESTAMP');
  assert.equal(firstData?.actorUid, 'server-admin');
  assert.equal(firstData?.correlationId, 'audit-1');
  assert.equal('updateAuditEvent' in repository, false);
  assert.equal('deleteAuditEvent' in repository, false);
});

const failures = results.filter((result) => result.error);
if (failures.length > 0) {
  console.error(`\n${failures.length}/${results.length} commercial repository tests failed.`);
  process.exitCode = 1;
} else {
  console.log(`\n${results.length}/${results.length} commercial repository tests passed.`);
}

function entitlement(planId: string): Record<string, unknown> {
  return {
    accessMode: 'full',
    planId,
    catalogVersion: 'draft-2026-09-02',
    seats: {
      assignedSeats: 0,
      maxSeats: 1,
      availableSeats: 1,
      isAtOrOverLimit: false,
      canAssignSeat: true,
    },
    ai: {
      usedActions: 0,
      maxActionsPerMonth: 20,
      remainingActions: 20,
      canUseAction: true,
    },
  };
}
