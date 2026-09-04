import type { EntitlementSnapshot } from '../domain/commercial';

export function getAiUsageRemainingRatio(entitlements: EntitlementSnapshot): number | null {
  const { maxActionsPerMonth, remainingActions } = entitlements.ai;
  if (maxActionsPerMonth <= 0) return null;
  return remainingActions / maxActionsPerMonth;
}

export function shouldShowUpgradeCta(entitlements: EntitlementSnapshot): boolean {
  const remainingRatio = getAiUsageRemainingRatio(entitlements);
  return entitlements.seats.isAtOrOverLimit || (remainingRatio !== null && remainingRatio <= 0.2);
}
