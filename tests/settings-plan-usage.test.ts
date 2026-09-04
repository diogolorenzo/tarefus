/**
 * Tarefus Settings Plan Usage Test Suite
 * Verifies AI quota and seat-limit upgrade CTA decisions.
 */

import type { EntitlementSnapshot } from '../src/domain/commercial';
import { getAiUsageRemainingRatio, shouldShowUpgradeCta } from '../src/utils/planUsage';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ name, passed: true, durationMs });
    console.log(`  [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const error = err && err.message ? err.message : String(err);
    results.push({ name, passed: false, error, durationMs });
    console.error(`  [FAIL] ${name} (${durationMs}ms)`);
    console.error(`         Error: ${error}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message} (Expected: ${expected}, Actual: ${actual})`);
  }
}

function createEntitlements(overrides: Partial<EntitlementSnapshot> = {}): EntitlementSnapshot {
  return {
    accessMode: 'active',
    planId: 'pro',
    catalogVersion: 'test',
    seats: {
      assignedSeats: 2,
      maxSeats: 5,
      availableSeats: 3,
      isAtOrOverLimit: false,
      canAssignSeat: true,
    },
    ai: {
      usedActions: 25,
      maxActionsPerMonth: 100,
      remainingActions: 75,
      canUseAction: true,
    },
    ...overrides,
  };
}

async function runSettingsPlanUsageTests() {
  console.log('================================================================');
  console.log('  TAREFUS SETTINGS PLAN USAGE TEST SUITE');
  console.log('================================================================\n');

  await test('1.1 High AI quota remaining does not show an upgrade CTA', () => {
    const entitlements = createEntitlements();

    assertEquals(getAiUsageRemainingRatio(entitlements), 0.75, '75 of 100 actions remaining must equal 0.75');
    assert(!shouldShowUpgradeCta(entitlements), 'High remaining quota without seat pressure must not show a CTA');
  });

  await test('1.2 Low AI quota at the 20 percent threshold shows an upgrade CTA', () => {
    const entitlements = createEntitlements({
      ai: {
        usedActions: 80,
        maxActionsPerMonth: 100,
        remainingActions: 20,
        canUseAction: true,
      },
    });

    assertEquals(getAiUsageRemainingRatio(entitlements), 0.2, '20 of 100 actions remaining must equal 0.2');
    assert(shouldShowUpgradeCta(entitlements), 'The inclusive 20 percent threshold must show a CTA');
  });

  await test('1.3 Exhausted AI quota shows an upgrade CTA', () => {
    const entitlements = createEntitlements({
      ai: {
        usedActions: 100,
        maxActionsPerMonth: 100,
        remainingActions: 0,
        canUseAction: false,
      },
    });

    assertEquals(getAiUsageRemainingRatio(entitlements), 0, 'An exhausted quota must have no remaining ratio');
    assert(shouldShowUpgradeCta(entitlements), 'An exhausted quota must show a CTA');
  });

  await test('1.4 Seat limit shows an upgrade CTA even with AI quota remaining', () => {
    const entitlements = createEntitlements({
      seats: {
        assignedSeats: 5,
        maxSeats: 5,
        availableSeats: 0,
        isAtOrOverLimit: true,
        canAssignSeat: false,
      },
    });

    assertEquals(getAiUsageRemainingRatio(entitlements), 0.75, 'AI quota remains high in this seat-limit scenario');
    assert(shouldShowUpgradeCta(entitlements), 'Seat limit must independently show a CTA');
  });

  await test('1.5 Undefined AI limits return null and do not show an AI CTA', () => {
    for (const maxActionsPerMonth of [0, -1]) {
      const entitlements = createEntitlements({
        ai: {
          usedActions: 0,
          maxActionsPerMonth,
          remainingActions: 0,
          canUseAction: true,
        },
      });

      assertEquals(
        getAiUsageRemainingRatio(entitlements),
        null,
        `A max action limit of ${maxActionsPerMonth} must not be divided`
      );
      assert(!shouldShowUpgradeCta(entitlements), 'Undefined AI limits without seat pressure must not show a CTA');
    }
  });

  console.log('\n================================================================');
  console.log('  SETTINGS PLAN USAGE TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((result) => result.passed).length;
  const failed = results.filter((result) => !result.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED SETTINGS PLAN USAGE TESTS:');
    results
      .filter((result) => !result.passed)
      .forEach((result) => {
        console.error(` - ${result.name}: ${result.error}`);
      });
    process.exit(1);
  }

  console.log('\nALL SETTINGS PLAN USAGE CHECKS PASSED.');
}

runSettingsPlanUsageTests().catch((err) => {
  console.error('Fatal settings plan usage test runner error:', err);
  process.exit(1);
});
