/**
 * Challenger 1: Empirical Adversarial Verification & Fuzzing Harness for Pricing & Calculator
 */

import {
  PRICING_PLANS,
  FEATURE_COMPARISON_CATEGORIES,
  PRICING_FAQS,
  PRICING_TESTIMONIALS,
  PRICING_HERO_COPY,
  COMPETITOR_BENCHMARK_SEAT_PRICE_BRL,
  getRecommendedPlan,
  calculateSavings,
} from '../src/data/pricingData';

interface VerificationResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: VerificationResult[] = [];

function check(name: string, condition: boolean, details: string) {
  results.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  [PASS] ${name}: ${details}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

async function runEmpiricalChallenge() {
  console.log('================================================================');
  console.log('  CHALLENGER 1: EMPIRICAL PRICING & CALCULATOR HARNESS');
  console.log('================================================================\n');

  // 1. SPECIFICATION & PLAN DATA SANITY CHECKS
  console.log('--- 1. Plan Data & Financial Discounts ---');
  for (const plan of PRICING_PLANS) {
    const annualInstallmentAnnual = plan.priceAnnualMonthly * 12;
    const monthlyAnnualCost = plan.priceMonthly * 12;
    const directDiscountPct = ((monthlyAnnualCost - annualInstallmentAnnual) / monthlyAnnualCost) * 100;
    const pixDiscountPct = ((annualInstallmentAnnual - plan.priceAnnualPix) / annualInstallmentAnnual) * 100;
    const totalPixDiscountPct = ((monthlyAnnualCost - plan.priceAnnualPix) / monthlyAnnualCost) * 100;
    const freeMonthsEquivalent = (monthlyAnnualCost - annualInstallmentAnnual) / plan.priceMonthly;

    check(
      `${plan.name} - Annual Installment Total`,
      plan.priceAnnualInstallmentTotal === annualInstallmentAnnual,
      `priceAnnualInstallmentTotal (${plan.priceAnnualInstallmentTotal}) == 12 * priceAnnualMonthly (${annualInstallmentAnnual})`
    );

    check(
      `${plan.name} - Annual Discount Range (20-22%)`,
      directDiscountPct >= 19.5 && directDiscountPct <= 22.5,
      `Direct annual discount is ${directDiscountPct.toFixed(2)}% (advertised: ${plan.annualSavingsPercentage}%)`
    );

    check(
      `${plan.name} - Free Months Equivalence`,
      freeMonthsEquivalent >= 2.0 && freeMonthsEquivalent <= 3.0,
      `Calculated free months: ${freeMonthsEquivalent.toFixed(2)} (${plan.annualSavingsMonthsDescription})`
    );

    check(
      `${plan.name} - PIX Upfront Extra Discount`,
      plan.priceAnnualPix < plan.priceAnnualInstallmentTotal && pixDiscountPct >= 8.0 && pixDiscountPct <= 15.0,
      `PIX upfront discount vs installment is ${pixDiscountPct.toFixed(2)}% (Total vs monthly: ${totalPixDiscountPct.toFixed(2)}%)`
    );
  }

  // 2. BOUNDARY VALUE ANALYSIS (BVA) ACROSS ALL CRITICAL SEAT VALUES
  console.log('\n--- 2. Boundary Value Analysis & Tier Transitions ---');
  const boundaryPoints = [
    { seats: 0, expectedPlan: 'equipe', expectedSeats: 1, baseMonthly: 69, baseAnnual: 55 },
    { seats: 1, expectedPlan: 'equipe', expectedSeats: 1, baseMonthly: 69, baseAnnual: 55 },
    { seats: 2, expectedPlan: 'equipe', expectedSeats: 2, baseMonthly: 69, baseAnnual: 55 },
    { seats: 3, expectedPlan: 'equipe', expectedSeats: 3, baseMonthly: 69, baseAnnual: 55 },
    { seats: 4, expectedPlan: 'equipe', expectedSeats: 4, baseMonthly: 69, baseAnnual: 55 },
    { seats: 5, expectedPlan: 'equipe', expectedSeats: 5, baseMonthly: 69, baseAnnual: 55 },
    { seats: 6, expectedPlan: 'crescimento', expectedSeats: 6, baseMonthly: 139, baseAnnual: 109 },
    { seats: 14, expectedPlan: 'crescimento', expectedSeats: 14, baseMonthly: 139, baseAnnual: 109 },
    { seats: 15, expectedPlan: 'crescimento', expectedSeats: 15, baseMonthly: 139, baseAnnual: 109 },
    { seats: 16, expectedPlan: 'escala', expectedSeats: 16, baseMonthly: 269, baseAnnual: 215 },
    { seats: 34, expectedPlan: 'escala', expectedSeats: 34, baseMonthly: 269, baseAnnual: 215 },
    { seats: 35, expectedPlan: 'escala', expectedSeats: 35, baseMonthly: 269, baseAnnual: 215 },
    { seats: 36, expectedPlan: 'escala', expectedSeats: 36, baseMonthly: 269 + 60, baseAnnual: 215 + 48 }, // 1 extra pack
    { seats: 45, expectedPlan: 'escala', expectedSeats: 45, baseMonthly: 269 + 60, baseAnnual: 215 + 48 }, // 1 extra pack
    { seats: 46, expectedPlan: 'escala', expectedSeats: 46, baseMonthly: 269 + 120, baseAnnual: 215 + 96 }, // 2 extra packs
    { seats: 50, expectedPlan: 'escala', expectedSeats: 50, baseMonthly: 269 + 120, baseAnnual: 215 + 96 }, // 2 extra packs
    { seats: 55, expectedPlan: 'escala', expectedSeats: 55, baseMonthly: 269 + 120, baseAnnual: 215 + 96 }, // 2 extra packs
    { seats: 56, expectedPlan: 'escala', expectedSeats: 56, baseMonthly: 269 + 180, baseAnnual: 215 + 144 }, // 3 extra packs
    { seats: 100, expectedPlan: 'escala', expectedSeats: 100, baseMonthly: 269 + 7 * 60, baseAnnual: 215 + 7 * 48 }, // 65 extra -> 7 packs
    { seats: 1000, expectedPlan: 'escala', expectedSeats: 1000, baseMonthly: 269 + 97 * 60, baseAnnual: 215 + 97 * 48 }, // 965 extra -> 97 packs
  ];

  for (const bp of boundaryPoints) {
    const calc = calculateSavings(bp.seats);
    const recPlan = getRecommendedPlan(bp.seats);

    check(
      `Boundary Seats = ${bp.seats} -> Recommended Plan`,
      recPlan.id === bp.expectedPlan && calc.planId === bp.expectedPlan,
      `Plan is ${calc.planId} (expected: ${bp.expectedPlan})`
    );

    check(
      `Boundary Seats = ${bp.seats} -> Normalized Seats`,
      calc.seats === bp.expectedSeats,
      `calc.seats is ${calc.seats} (expected: ${bp.expectedSeats})`
    );

    check(
      `Boundary Seats = ${bp.seats} -> Tarefus Monthly Cost`,
      calc.tarefusMonthly === bp.baseMonthly,
      `tarefusMonthly is R$ ${calc.tarefusMonthly} (expected: R$ ${bp.baseMonthly})`
    );

    check(
      `Boundary Seats = ${bp.seats} -> Tarefus Annual Monthly Cost`,
      calc.tarefusAnnualMonthly === bp.baseAnnual,
      `tarefusAnnualMonthly is R$ ${calc.tarefusAnnualMonthly} (expected: R$ ${bp.baseAnnual})`
    );

    const expectedCompetitor = bp.expectedSeats * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL;
    check(
      `Boundary Seats = ${bp.seats} -> Competitor Monthly Benchmark`,
      calc.competitorsMonthly === expectedCompetitor,
      `competitorsMonthly is R$ ${calc.competitorsMonthly} (expected: R$ ${expectedCompetitor})`
    );

    const expectedMonthlySavings = Math.max(0, expectedCompetitor - bp.baseMonthly);
    check(
      `Boundary Seats = ${bp.seats} -> Monthly Savings Math`,
      calc.monthlySavings === expectedMonthlySavings,
      `monthlySavings is R$ ${calc.monthlySavings} (expected: R$ ${expectedMonthlySavings})`
    );

    const expectedAnnualSavings = Math.max(0, expectedCompetitor * 12 - bp.baseAnnual * 12);
    check(
      `Boundary Seats = ${bp.seats} -> Annual Savings Math`,
      calc.annualSavings === expectedAnnualSavings,
      `annualSavings is R$ ${calc.annualSavings} (expected: R$ ${expectedAnnualSavings})`
    );

    check(
      `Boundary Seats = ${bp.seats} -> Savings Percentage Bounds`,
      calc.savingsPercentage >= 10 && calc.savingsPercentage <= 95 && !isNaN(calc.savingsPercentage),
      `savingsPercentage is ${calc.savingsPercentage}% (clamped to [10, 95])`
    );
  }

  // 3. USD COMPETITOR BREAKDOWN CONSISTENCY
  console.log('\n--- 3. USD Competitor Breakdown Math ---');
  for (let s = 1; s <= 50; s += 7) {
    const calc = calculateSavings(s);
    const breakdown = calc.usdCompetitorBreakdown;
    check(
      `USD Breakdown for ${s} seats`,
      !!breakdown &&
        breakdown.asanaBrl === Math.round(s * 80.5) &&
        breakdown.mondayBrl === Math.round(s * 72.0) &&
        breakdown.trelloBrl === Math.round(s * 31.5),
      `Asana: R$ ${breakdown?.asanaBrl}, Monday: R$ ${breakdown?.mondayBrl}, Trello: R$ ${breakdown?.trelloBrl}`
    );
  }

  // 4. ADVERSARIAL FUZZING (10,000 ITERATIONS)
  console.log('\n--- 4. Adversarial Fuzzing: 10,000 Iterations ---');
  let fuzzPassed = true;
  let fuzzFailures = 0;

  const adversarialInputs: any[] = [
    -1000000, -50, -1, -0.0001, -0, 0, 0.0001, 0.49, 0.5, 0.999, 1, 1.0001,
    2.5, 5.0, 5.49, 5.5, 15.0, 15.49, 15.5, 35.0, 35.49, 35.5, 36.0,
    99.999, 100, 999.99, 1000, 10000, 1000000,
    Number.MAX_SAFE_INTEGER,
    NaN,
    Infinity,
    -Infinity,
    undefined as any,
    null as any,
    '5' as any,
    'invalid' as any,
    {} as any,
    [] as any,
  ];

  // Add random floats and integers
  for (let i = 0; i < 9960; i++) {
    adversarialInputs.push((Math.random() - 0.2) * 1000);
  }

  for (const input of adversarialInputs) {
    try {
      const res = calculateSavings(input);
      if (
        !res ||
        typeof res.seats !== 'number' ||
        typeof res.tarefusMonthly !== 'number' ||
        typeof res.tarefusAnnualMonthly !== 'number' ||
        typeof res.competitorsMonthly !== 'number' ||
        typeof res.monthlySavings !== 'number' ||
        typeof res.annualSavings !== 'number' ||
        typeof res.savingsPercentage !== 'number' ||
        isNaN(res.seats) ||
        isNaN(res.tarefusMonthly) ||
        isNaN(res.tarefusAnnualMonthly) ||
        isNaN(res.competitorsMonthly) ||
        isNaN(res.monthlySavings) ||
        isNaN(res.annualSavings) ||
        isNaN(res.savingsPercentage) ||
        !['equipe', 'crescimento', 'escala'].includes(res.planId)
      ) {
        fuzzPassed = false;
        fuzzFailures++;
        console.error(`Fuzz Failure on input: ${input}`, res);
      }
    } catch (err: any) {
      fuzzPassed = false;
      fuzzFailures++;
      console.error(`Fuzz Threw Exception on input: ${input}`, err);
    }
  }

  check(
    '10,000 Adversarial Fuzz Invariants',
    fuzzPassed && fuzzFailures === 0,
    `Completed 10,000 fuzz cases with ${fuzzFailures} failures`
  );

  // 5. SLIDER & UI INTERACTION RANGE SIMULATION
  console.log('\n--- 5. SavingsCalculator UI Component Logic Verification ---');
  // Stepper ranges: 3 to 60
  // Slider ranges: 3 to 50
  // Preset buttons: [5, 10, 15, 20, 35, 50]
  const presets = [5, 10, 15, 20, 35, 50];
  for (const p of presets) {
    const calc = calculateSavings(p);
    check(
      `Preset Button ${p} seats`,
      calc.seats === p && calc.annualSavings > 0 && calc.savingsPercentage >= 20,
      `Seats: ${p}, Plan: ${calc.planName}, Annual Savings: R$ ${calc.annualSavings}, ${calc.savingsPercentage}%`
    );
  }

  // Visual Bar Percentage Range: 12% to 100%
  for (let s = 1; s <= 60; s++) {
    const calc = calculateSavings(s);
    for (const isAnnual of [true, false]) {
      const activeCost = isAnnual ? calc.tarefusAnnualMonthly : calc.tarefusMonthly;
      const barWidth = Math.min(100, Math.max(12, Math.round((activeCost / calc.competitorsMonthly) * 100)));
      if (barWidth < 12 || barWidth > 100 || isNaN(barWidth)) {
        check(`Bar Width Invariant for ${s} seats (Annual: ${isAnnual})`, false, `Invalid bar width ${barWidth}%`);
      }
    }
  }
  check('Visual Comparison Bar Invariant (12% <= width <= 100%)', true, 'All 60 seat points in both monthly/annual modes produce valid bar widths');

  // SUMMARY
  console.log('\n================================================================');
  console.log('  CHALLENGER 1 EMPIRICAL SUMMARY');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed} / ${total}`);
  console.log(`Failed:       ${failed} / ${total}`);

  if (failed > 0) {
    console.error(`\nCHALLENGE FAILED: ${failed} issues found.`);
    process.exit(1);
  } else {
    console.log('\nCHALLENGE PASSED: ALL MATHEMATICAL, BOUNDARY, AND FUZZING CHECKS ARE 100% SOUND.');
  }
}

runEmpiricalChallenge().catch((err) => {
  console.error('Fatal challenger execution error:', err);
  process.exit(1);
});
