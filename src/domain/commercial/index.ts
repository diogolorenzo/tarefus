/**
 * Pure commercial domain primitives.
 *
 * These values are deliberately draft-only: they are not a public offer,
 * do not contain prices, and must be supplied by a trusted backend snapshot.
 */

export const TRIAL_DURATION_DAYS = 14;

export type SubscriptionState =
  | 'trialing'
  | 'active'
  | 'payment_pending'
  | 'canceled'
  | 'expired';

export type AccessMode = 'full' | 'read_only' | 'blocked';

export interface PlanDefinition {
  id: string;
  catalogVersion: string;
  status: 'draft';
  technicalLimits: {
    maxSeats: number;
    maxAiActionsPerMonth: number;
  };
}

export interface CommercialCatalog {
  version: string;
  status: 'draft';
  plans: readonly PlanDefinition[];
}

export interface ScheduledPlanChange {
  planId: string;
  effectiveAt: string;
}

export interface SubscriptionSnapshot {
  subscriptionId: string;
  workspaceId: string;
  planId: string;
  state: SubscriptionState;
  startedAt: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  canceledAt?: string;
  scheduledPlanChange?: ScheduledPlanChange;
}

export interface SeatUsage {
  assignedSeats: number;
}

export interface AiUsage {
  usedActions: number;
}

export interface EntitlementSnapshot {
  accessMode: AccessMode;
  planId: string | null;
  catalogVersion: string;
  seats: {
    assignedSeats: number;
    maxSeats: number;
    availableSeats: number;
    isAtOrOverLimit: boolean;
    canAssignSeat: boolean;
  };
  ai: {
    usedActions: number;
    maxActionsPerMonth: number;
    remainingActions: number;
    canUseAction: boolean;
  };
}

export type SubscriptionTransitionEvent =
  | { type: 'START_TRIAL'; occurredAt: string }
  | { type: 'ACTIVATE'; occurredAt: string; currentPeriodEndsAt: string }
  | { type: 'PAYMENT_PENDING'; occurredAt: string }
  | { type: 'CANCEL'; occurredAt: string }
  | { type: 'EXPIRE'; occurredAt: string }
  | {
      type: 'SCHEDULE_PLAN_CHANGE';
      occurredAt: string;
      planId: string;
      effectiveAt: string;
    };

export type TransitionResult =
  | { ok: true; value: SubscriptionSnapshot }
  | { ok: false; reason: 'invalid_transition' | 'invalid_timestamp' };

export const COMMERCIAL_CATALOG_DRAFT: CommercialCatalog = {
  version: 'draft-2026-09-02',
  status: 'draft',
  plans: [
    {
      id: 'draft-solo',
      catalogVersion: 'draft-2026-09-02',
      status: 'draft',
      technicalLimits: { maxSeats: 1, maxAiActionsPerMonth: 20 },
    },
    {
      id: 'draft-team',
      catalogVersion: 'draft-2026-09-02',
      status: 'draft',
      technicalLimits: { maxSeats: 3, maxAiActionsPerMonth: 100 },
    },
  ],
};

export function createTrialSubscription(input: {
  subscriptionId: string;
  workspaceId: string;
  planId: string;
  startedAt: string;
}): SubscriptionSnapshot {
  const startedAt = toTimestamp(input.startedAt);
  if (startedAt === null) throw new Error('startedAt must be a valid ISO timestamp');

  return {
    ...input,
    state: 'trialing',
    trialEndsAt: new Date(startedAt + TRIAL_DURATION_DAYS * 86_400_000).toISOString(),
  };
}

export function transitionSubscription(
  snapshot: SubscriptionSnapshot,
  event: SubscriptionTransitionEvent,
): TransitionResult {
  const occurredAt = toTimestamp(event.occurredAt);
  if (occurredAt === null) return { ok: false, reason: 'invalid_timestamp' };

  switch (event.type) {
    case 'START_TRIAL':
      return invalidTransition();
    case 'ACTIVATE':
      if (snapshot.state !== 'trialing' && snapshot.state !== 'payment_pending') {
        return invalidTransition();
      }
      if (toTimestamp(event.currentPeriodEndsAt) === null) return { ok: false, reason: 'invalid_timestamp' };
      return {
        ok: true,
        value: {
          ...snapshot,
          state: 'active',
          currentPeriodEndsAt: event.currentPeriodEndsAt,
        },
      };
    case 'PAYMENT_PENDING':
      if (snapshot.state !== 'trialing' && snapshot.state !== 'active') return invalidTransition();
      return { ok: true, value: { ...snapshot, state: 'payment_pending' } };
    case 'CANCEL':
      if (
        snapshot.state !== 'trialing' &&
        snapshot.state !== 'active' &&
        snapshot.state !== 'payment_pending'
      ) {
        return invalidTransition();
      }
      return {
        ok: true,
        value: { ...snapshot, state: 'canceled', canceledAt: event.occurredAt },
      };
    case 'EXPIRE':
      if (!canExpire(snapshot, occurredAt)) return invalidTransition();
      return { ok: true, value: { ...snapshot, state: 'expired' } };
    case 'SCHEDULE_PLAN_CHANGE':
      if (snapshot.state !== 'trialing' && snapshot.state !== 'active') return invalidTransition();
      const effectiveAt = toTimestamp(event.effectiveAt);
      if (effectiveAt === null || effectiveAt < occurredAt) {
        return { ok: false, reason: 'invalid_timestamp' };
      }
      return {
        ok: true,
        value: {
          ...snapshot,
          scheduledPlanChange: { planId: event.planId, effectiveAt: event.effectiveAt },
        },
      };
  }
}

export function applyScheduledPlanChange(
  snapshot: SubscriptionSnapshot,
  serverNow: string,
): SubscriptionSnapshot {
  const now = toTimestamp(serverNow);
  const change = snapshot.scheduledPlanChange;
  if (now === null || !change) return snapshot;

  const effectiveAt = toTimestamp(change.effectiveAt);
  if (effectiveAt === null || now < effectiveAt) return snapshot;

  const { scheduledPlanChange: _scheduledPlanChange, ...withoutSchedule } = snapshot;
  return { ...withoutSchedule, planId: change.planId };
}

export function resolveEntitlements(input: {
  catalog: CommercialCatalog;
  subscription: SubscriptionSnapshot;
  seatUsage: SeatUsage;
  aiUsage?: AiUsage;
  now: string;
}): EntitlementSnapshot {
  const plan = input.catalog.plans.find((candidate) => candidate.id === input.subscription.planId);
  if (!plan) return blockedEntitlements(input.catalog.version, input.seatUsage, input.aiUsage);

  const accessMode = resolveAccessMode(input.subscription, input.now);
  const assignedSeats = normalizedCount(input.seatUsage.assignedSeats);
  const usedActions = normalizedCount(input.aiUsage?.usedActions ?? 0);
  const availableSeats = Math.max(0, plan.technicalLimits.maxSeats - assignedSeats);
  const remainingActions = Math.max(0, plan.technicalLimits.maxAiActionsPerMonth - usedActions);

  return {
    accessMode,
    planId: plan.id,
    catalogVersion: input.catalog.version,
    seats: {
      assignedSeats,
      maxSeats: plan.technicalLimits.maxSeats,
      availableSeats,
      isAtOrOverLimit: assignedSeats >= plan.technicalLimits.maxSeats,
      canAssignSeat: accessMode === 'full' && assignedSeats < plan.technicalLimits.maxSeats,
    },
    ai: {
      usedActions,
      maxActionsPerMonth: plan.technicalLimits.maxAiActionsPerMonth,
      remainingActions,
      canUseAction: accessMode === 'full' && usedActions < plan.technicalLimits.maxAiActionsPerMonth,
    },
  };
}

function resolveAccessMode(snapshot: SubscriptionSnapshot, serverNow: string): AccessMode {
  const now = toTimestamp(serverNow);
  if (now === null) return 'blocked';

  if (snapshot.state === 'trialing') {
    const trialEndsAt = toTimestamp(snapshot.trialEndsAt);
    return trialEndsAt !== null && now < trialEndsAt ? 'full' : 'blocked';
  }
  if (snapshot.state === 'active') return isWithinPeriod(snapshot, now) ? 'full' : 'blocked';
  if (snapshot.state === 'payment_pending') return isWithinPeriod(snapshot, now) ? 'read_only' : 'blocked';
  if (snapshot.state === 'canceled') return isWithinPeriod(snapshot, now) ? 'read_only' : 'blocked';
  return 'blocked';
}

function isWithinPeriod(snapshot: SubscriptionSnapshot, now: number): boolean {
  const periodEndsAt = toTimestamp(snapshot.currentPeriodEndsAt);
  return periodEndsAt !== null && now < periodEndsAt;
}

function canExpire(snapshot: SubscriptionSnapshot, occurredAt: number): boolean {
  if (snapshot.state === 'expired') return false;
  const deadline =
    snapshot.state === 'trialing'
      ? toTimestamp(snapshot.trialEndsAt)
      : toTimestamp(snapshot.currentPeriodEndsAt);
  return deadline !== null && occurredAt >= deadline;
}

function blockedEntitlements(
  catalogVersion: string,
  seatUsage: SeatUsage,
  aiUsage: AiUsage | undefined,
): EntitlementSnapshot {
  return {
    accessMode: 'blocked',
    planId: null,
    catalogVersion,
    seats: {
      assignedSeats: normalizedCount(seatUsage.assignedSeats),
      maxSeats: 0,
      availableSeats: 0,
      isAtOrOverLimit: true,
      canAssignSeat: false,
    },
    ai: {
      usedActions: normalizedCount(aiUsage?.usedActions ?? 0),
      maxActionsPerMonth: 0,
      remainingActions: 0,
      canUseAction: false,
    },
  };
}

function normalizedCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function toTimestamp(value: string | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function invalidTransition(): TransitionResult {
  return { ok: false, reason: 'invalid_transition' };
}
