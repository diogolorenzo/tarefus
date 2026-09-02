import {
  COMMERCIAL_CATALOG_DRAFT,
  applyScheduledPlanChange,
  createTrialSubscription,
  resolveEntitlements,
  transitionSubscription,
  type SubscriptionSnapshot,
} from '../src/domain/commercial';

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

function equal<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}; expected ${String(expected)}, received ${String(actual)}`);
  }
}

function ok(value: unknown, message: string): void {
  if (!value) throw new Error(message);
}

const catalog = COMMERCIAL_CATALOG_DRAFT;
const now = '2026-09-02T12:00:00.000Z';
const activeSubscription: SubscriptionSnapshot = {
  subscriptionId: 'sub-1',
  workspaceId: 'workspace-1',
  planId: 'draft-team',
  state: 'active',
  startedAt: '2026-08-20T12:00:00.000Z',
  currentPeriodEndsAt: '2026-09-20T12:00:00.000Z',
};

test('starts an exactly fourteen-day trial', () => {
  const trial = createTrialSubscription({
    subscriptionId: 'trial-1',
    workspaceId: 'workspace-1',
    planId: 'draft-team',
    startedAt: now,
  });

  equal(trial.state, 'trialing', 'trial state');
  equal(trial.trialEndsAt, '2026-09-16T12:00:00.000Z', 'trial end');
});

test('rejects impossible subscription state transitions', () => {
  const result = transitionSubscription(activeSubscription, {
    type: 'START_TRIAL',
    occurredAt: now,
  });

  equal(result.ok, false, 'transition must be rejected');
  if (!result.ok) equal(result.reason, 'invalid_transition', 'rejection reason');
});

test('expires a trial using server time, never client-provided status', () => {
  const trial = createTrialSubscription({
    subscriptionId: 'trial-1',
    workspaceId: 'workspace-1',
    planId: 'draft-team',
    startedAt: now,
  });
  const result = transitionSubscription(trial, {
    type: 'EXPIRE',
    occurredAt: '2026-09-16T12:00:00.000Z',
  });

  ok(result.ok, 'expiry transition must succeed at the server-side deadline');
  if (result.ok) equal(result.value.state, 'expired', 'expired state');
});

test('moves an active subscription through payment pending and cancellation', () => {
  const pending = transitionSubscription(activeSubscription, {
    type: 'PAYMENT_PENDING',
    occurredAt: now,
  });
  ok(pending.ok, 'active subscription enters payment pending');
  if (!pending.ok) return;
  equal(pending.value.state, 'payment_pending', 'payment pending state');

  const canceled = transitionSubscription(pending.value, {
    type: 'CANCEL',
    occurredAt: now,
  });
  ok(canceled.ok, 'payment pending subscription can be canceled');
  if (canceled.ok) equal(canceled.value.state, 'canceled', 'canceled state');
});

test('schedules a downgrade and applies it only at its effective server time', () => {
  const scheduled = transitionSubscription(activeSubscription, {
    type: 'SCHEDULE_PLAN_CHANGE',
    occurredAt: now,
    planId: 'draft-solo',
    effectiveAt: '2026-09-20T12:00:00.000Z',
  });
  ok(scheduled.ok, 'schedule must succeed');
  if (!scheduled.ok) return;

  const early = applyScheduledPlanChange(scheduled.value, '2026-09-19T23:59:59.000Z');
  equal(early.planId, 'draft-team', 'plan must remain unchanged before effective time');

  const applied = applyScheduledPlanChange(scheduled.value, '2026-09-20T12:00:00.000Z');
  equal(applied.planId, 'draft-solo', 'plan must change at effective time');
  equal(applied.scheduledPlanChange, undefined, 'schedule is consumed');
});

test('blocks new seats while preserving current usage when the technical limit is reached', () => {
  const entitlements = resolveEntitlements({
    catalog,
    subscription: activeSubscription,
    seatUsage: { assignedSeats: 3 },
    now,
  });

  equal(entitlements.accessMode, 'full', 'active subscription grants full access');
  equal(entitlements.seats.canAssignSeat, false, 'seat assignment is blocked at limit');
  equal(entitlements.seats.isAtOrOverLimit, true, 'limit condition is reported');
});

test('blocks AI actions when the technical monthly allowance is exhausted', () => {
  const entitlements = resolveEntitlements({
    catalog,
    subscription: activeSubscription,
    seatUsage: { assignedSeats: 1 },
    aiUsage: { usedActions: 100 },
    now,
  });

  equal(entitlements.ai.canUseAction, false, 'AI action is blocked at limit');
  equal(entitlements.ai.remainingActions, 0, 'remaining AI actions');
});

test('only derives access from trusted domain snapshots', () => {
  const expired: SubscriptionSnapshot = {
    ...activeSubscription,
    state: 'expired',
    currentPeriodEndsAt: '2026-09-01T12:00:00.000Z',
  };
  const entitlements = resolveEntitlements({
    catalog,
    subscription: expired,
    seatUsage: { assignedSeats: 0 },
    now,
  });

  equal(entitlements.accessMode, 'blocked', 'expired snapshot is blocked');
});

test('keeps canceled and payment-pending workspaces read-only until their server period ends', () => {
  const pending = resolveEntitlements({
    catalog,
    subscription: { ...activeSubscription, state: 'payment_pending' },
    seatUsage: { assignedSeats: 1 },
    now,
  });
  equal(pending.accessMode, 'read_only', 'payment pending access');
  equal(pending.seats.canAssignSeat, false, 'payment pending cannot assign seats');

  const canceled = resolveEntitlements({
    catalog,
    subscription: { ...activeSubscription, state: 'canceled' },
    seatUsage: { assignedSeats: 1 },
    now: '2026-09-21T12:00:00.000Z',
  });
  equal(canceled.accessMode, 'blocked', 'canceled access after period end');
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} commercial domain tests passed`);
if (failures.length > 0) process.exit(1);
