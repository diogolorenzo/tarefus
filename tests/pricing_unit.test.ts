/**
 * Tarefus Pricing Strategy - Unit & Boundary Test Suite
 * Tiers 1 & 2: Plan Pricing, Limits, PIX Discounts, Feature Matrix, FAQ, and Savings Calculator Math.
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
import type { PricingPlan, PricingPlanId } from '../src/types/pricing';

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
    const msg = err && err.message ? err.message : String(err);
    results.push({ suite: currentSuite, name, passed: false, error: msg, durationMs });
    console.error(`  [FAIL] ${name} (${durationMs}ms)`);
    console.error(`         Error: ${msg}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
    );
  }
}

function assertInRange(value: number, min: number, max: number, message: string) {
  if (value < min || value > max) {
    throw new Error(
      `Assertion failed: ${message} (Value ${value} is outside expected range [${min}, ${max}])`
    );
  }
}

async function runPricingUnitTests() {
  console.log('================================================================');
  console.log('  TAREFUS PRICING UNIT & BOUNDARY TEST SUITE');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: TIER 1 - PLAN DATA INTEGRITY & SPECIFICATION CONFORMANCE
  // ==================================================================
  await suite('1. Tier 1 - Plan Data Integrity & Specification Conformance', async () => {
    await test('1.1 Plan Count & IDs: Exactly 3 plans defined (equipe, crescimento, escala)', () => {
      assertEquals(PRICING_PLANS.length, 3, 'Must have exactly 3 plans defined');
      const ids: PricingPlanId[] = PRICING_PLANS.map((p) => p.id);
      assert(ids.includes('equipe'), 'Must include Equipe plan');
      assert(ids.includes('crescimento'), 'Must include Crescimento plan');
      assert(ids.includes('escala'), 'Must include Escala plan');
    });

    await test('1.2 Equipe Plan: Pricing, limits and feature properties conform to specification', () => {
      const equipe = PRICING_PLANS.find((p) => p.id === 'equipe')!;
      assert(!!equipe, 'Equipe plan must exist');
      assertEquals(equipe.name, 'Equipe', 'Equipe plan name');
      assertEquals(equipe.priceMonthly, 69, 'Equipe price monthly must be R$ 69');
      assertEquals(equipe.priceAnnualMonthly, 55, 'Equipe price annual monthly must be R$ 55');
      assertEquals(equipe.priceAnnualPix, 590, 'Equipe PIX upfront must be R$ 590');
      assertEquals(equipe.priceAnnualInstallmentTotal, 660, 'Equipe 12x total must be R$ 660');
      assertEquals(equipe.maxMembers, 5, 'Equipe member limit must be 5');
      assertEquals(equipe.maxBoards, 5, 'Equipe board limit must be 5');
      assertEquals(equipe.aiMonthlyCreations, 100, 'Equipe AI creation quota must be 100');
      assertEquals(equipe.auditLogDays, 30, 'Equipe audit log retention must be 30 days');
      assertEquals(equipe.isHighlighted, false, 'Equipe should not be highlighted');
      assert(equipe.features.length >= 5, 'Equipe should list at least 5 features');
      assert(equipe.ctaText.includes('Teste de 14 Dias'), 'CTA must mention 14-day trial');
    });

    await test('1.3 Crescimento Plan: Anchor plan highlighted with "Mais Escolhido" badge & limits', () => {
      const crescimento = PRICING_PLANS.find((p) => p.id === 'crescimento')!;
      assert(!!crescimento, 'Crescimento plan must exist');
      assertEquals(crescimento.name, 'Crescimento', 'Crescimento plan name');
      assertEquals(crescimento.isHighlighted, true, 'Crescimento must be marked as isHighlighted: true');
      assert(
        (crescimento.badge || '').toUpperCase().includes('MAIS ESCOLHIDO'),
        'Crescimento badge must indicate "MAIS ESCOLHIDO"'
      );
      assertEquals(crescimento.priceMonthly, 139, 'Crescimento price monthly must be R$ 139');
      assertEquals(crescimento.priceAnnualMonthly, 109, 'Crescimento price annual monthly must be R$ 109');
      assertEquals(crescimento.priceAnnualPix, 1180, 'Crescimento PIX upfront must be R$ 1180');
      assertEquals(crescimento.priceAnnualInstallmentTotal, 1308, 'Crescimento 12x total must be R$ 1308');
      assertEquals(crescimento.maxMembers, 15, 'Crescimento member limit must be 15');
      assertEquals(crescimento.maxBoards, 20, 'Crescimento board limit must be 20');
      assertEquals(crescimento.aiMonthlyCreations, 400, 'Crescimento AI creation quota must be 400');
      assertEquals(crescimento.auditLogDays, 180, 'Crescimento audit log retention must be 180 days');
      assert(crescimento.features.length >= 5, 'Crescimento should list at least 5 features');
      assert(crescimento.ctaText.includes('14 Dias'), 'CTA must mention 14 days');
    });

    await test('1.4 Escala Plan: Enterprise tier with unlimited boards and 1,200 AI generations', () => {
      const escala = PRICING_PLANS.find((p) => p.id === 'escala')!;
      assert(!!escala, 'Escala plan must exist');
      assertEquals(escala.name, 'Escala', 'Escala plan name');
      assertEquals(escala.priceMonthly, 269, 'Escala price monthly must be R$ 269');
      assertEquals(escala.priceAnnualMonthly, 215, 'Escala price annual monthly must be R$ 215');
      assertEquals(escala.priceAnnualPix, 2290, 'Escala PIX upfront must be R$ 2290');
      assertEquals(escala.priceAnnualInstallmentTotal, 2580, 'Escala 12x total must be R$ 2580');
      assertEquals(escala.maxMembers, 35, 'Escala member limit must be 35');
      assertEquals(escala.maxBoards, 'unlimited', 'Escala board limit must be unlimited');
      assertEquals(escala.aiMonthlyCreations, 1200, 'Escala AI creation quota must be 1,200');
      assertEquals(escala.auditLogDays, 'unlimited', 'Escala audit log retention must be unlimited');
      assert(escala.supportTier.toLowerCase().includes('whatsapp'), 'Escala must offer WhatsApp support');
      assert(escala.features.length >= 5, 'Escala should list at least 5 features');
    });

    await test('1.5 Annual & PIX Discounts: Strict mathematical discount verification across all plans', () => {
      for (const plan of PRICING_PLANS) {
        // 1. Annual monthly price must be strictly cheaper than monthly price
        assert(
          plan.priceAnnualMonthly < plan.priceMonthly,
          `${plan.name}: Annual monthly (R$ ${plan.priceAnnualMonthly}) must be < Monthly (R$ ${plan.priceMonthly})`
        );

        // 2. 12x Installment total must equal 12 * priceAnnualMonthly
        assertEquals(
          plan.priceAnnualInstallmentTotal,
          plan.priceAnnualMonthly * 12,
          `${plan.name}: 12x total must equal 12 * priceAnnualMonthly`
        );

        // 3. PIX upfront must be strictly cheaper than 12x installment total (extra cash discount)
        assert(
          plan.priceAnnualPix < plan.priceAnnualInstallmentTotal,
          `${plan.name}: PIX price (R$ ${plan.priceAnnualPix}) must be < 12x total (R$ ${plan.priceAnnualInstallmentTotal})`
        );

        // 4. Annual discount percentage must be between 18% and 25%
        const effectiveAnnualDiscount =
          ((plan.priceMonthly * 12 - plan.priceAnnualInstallmentTotal) / (plan.priceMonthly * 12)) * 100;
        assertInRange(
          effectiveAnnualDiscount,
          18,
          25,
          `${plan.name}: Effective annual installment discount must be ~20-22%`
        );
      }
    });
  });

  // ==================================================================
  // SUITE 2: TIER 1 - COMPARISON TABLE & FAQ INTEGRITY
  // ==================================================================
  await suite('2. Tier 1 - Feature Comparison Table & FAQ Integrity', async () => {
    await test('2.1 Comparison Categories: 5 categorized sections present', () => {
      assertEquals(
        FEATURE_COMPARISON_CATEGORIES.length,
        5,
        'Must have exactly 5 feature comparison categories'
      );
      const categoryIds = FEATURE_COMPARISON_CATEGORIES.map((c) => c.id);
      assert(categoryIds.includes('users_team'), 'Users & Team category missing');
      assert(categoryIds.includes('boards_tasks'), 'Boards & Tasks category missing');
      assert(categoryIds.includes('ai_gemini'), 'AI Gemini category missing');
      assert(categoryIds.includes('security_governance'), 'Security & Governance category missing');
      assert(categoryIds.includes('support_training'), 'Support & Training category missing');
    });

    await test('2.2 Comparison Rows: All rows have defined values for equipe, crescimento, and escala', () => {
      let totalRows = 0;
      for (const cat of FEATURE_COMPARISON_CATEGORIES) {
        assert(cat.rows.length >= 3, `Category ${cat.title} must have at least 3 comparison rows`);
        for (const row of cat.rows) {
          totalRows++;
          assert(row.name.length > 0, 'Row must have a name');
          assert(row.equipe !== undefined && row.equipe !== null, `Row ${row.name} equipe value must be defined`);
          assert(
            row.crescimento !== undefined && row.crescimento !== null,
            `Row ${row.name} crescimento value must be defined`
          );
          assert(row.escala !== undefined && row.escala !== null, `Row ${row.name} escala value must be defined`);
        }
      }
      assert(totalRows >= 20, `Comparison table must have at least 20 feature comparison rows (actual: ${totalRows})`);
    });

    await test('2.3 FAQ Items: At least 7 objection-handling Q&As covering crucial commercial topics', () => {
      assert(PRICING_FAQS.length >= 7, 'Must have at least 7 FAQ items');

      const allQAndA = PRICING_FAQS.map((f) => (f.question + ' ' + f.answer).toLowerCase()).join(' ');

      // Verify key commercial objection answers
      assert(
        allQAndA.includes('cartão') && allQAndA.includes('teste'),
        'FAQ must cover 14-day free trial without credit card'
      );
      assert(
        allQAndA.includes('membros') || allQAndA.includes('limite'),
        'FAQ must cover member limit upgrades'
      );
      assert(
        allQAndA.includes('empresa') || allQAndA.includes('usuário'),
        'FAQ must cover pricing per company vs per user'
      );
      assert(
        allQAndA.includes('pix') || allQAndA.includes('boleto') || allQAndA.includes('pagamento'),
        'FAQ must cover accepted payment methods'
      );
      assert(
        allQAndA.includes('cancelar') || allQAndA.includes('cancelamento'),
        'FAQ must cover 1-click cancellation'
      );
      assert(
        allQAndA.includes('inteligência artificial') || allQAndA.includes('ia') || allQAndA.includes('voz'),
        'FAQ must cover AI generation details'
      );
      assert(
        allQAndA.includes('nota fiscal') || allQAndA.includes('nfs-e'),
        'FAQ must cover NFS-e electronic invoice issuance'
      );
    });

    await test('2.4 Testimonials & Hero Copy: Authentic Brazilian PME testimonials and hero text', () => {
      assert(PRICING_TESTIMONIALS.length >= 3, 'Must have at least 3 customer testimonials');
      for (const t of PRICING_TESTIMONIALS) {
        assert(t.author.length > 0, 'Testimonial must have author');
        assert(t.role.length > 0, 'Testimonial must have role');
        assert(t.company.length > 0, 'Testimonial must have company name');
        assert(t.quote.length > 30, 'Testimonial quote must be descriptive');
      }

      assert(PRICING_HERO_COPY.badge.includes('REAIS'), 'Hero badge must emphasize BRL currency');
      assert(PRICING_HERO_COPY.title.length > 0, 'Hero title must be present');
      assert(PRICING_HERO_COPY.subtitle.includes('14 dias'), 'Hero subtitle must mention 14 days');
    });
  });

  // ==================================================================
  // SUITE 3: TIER 2 - CALCULATOR ENGINE & BOUNDARY VALUE ANALYSIS (BVA)
  // ==================================================================
  await suite('3. Tier 2 - Calculator Engine & Boundary Value Analysis (BVA)', async () => {
    await test('3.1 Boundary Transition 1: 5 seats (Equipe) vs 6 seats (Crescimento)', () => {
      const calc5 = calculateSavings(5);
      assertEquals(calc5.planId, 'equipe', '5 seats must recommend Equipe plan');
      assertEquals(calc5.planName, 'Equipe', 'Plan name must be Equipe');
      assertEquals(calc5.tarefusMonthly, 69, 'Equipe monthly cost is R$ 69');
      assertEquals(calc5.tarefusAnnualMonthly, 55, 'Equipe annual monthly cost is R$ 55');
      assertEquals(calc5.competitorsMonthly, 5 * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL, 'Competitor cost for 5 seats');

      const calc6 = calculateSavings(6);
      assertEquals(calc6.planId, 'crescimento', '6 seats must transition to Crescimento plan');
      assertEquals(calc6.planName, 'Crescimento', 'Plan name must be Crescimento');
      assertEquals(calc6.tarefusMonthly, 139, 'Crescimento monthly cost is R$ 139');
      assertEquals(calc6.tarefusAnnualMonthly, 109, 'Crescimento annual monthly cost is R$ 109');
      assertEquals(calc6.competitorsMonthly, 6 * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL, 'Competitor cost for 6 seats');
    });

    await test('3.2 Boundary Transition 2: 15 seats (Crescimento) vs 16 seats (Escala)', () => {
      const calc15 = calculateSavings(15);
      assertEquals(calc15.planId, 'crescimento', '15 seats must recommend Crescimento plan');
      assertEquals(calc15.tarefusMonthly, 139, 'Crescimento monthly cost is R$ 139');

      const calc16 = calculateSavings(16);
      assertEquals(calc16.planId, 'escala', '16 seats must transition to Escala plan');
      assertEquals(calc16.planName, 'Escala', 'Plan name must be Escala');
      assertEquals(calc16.tarefusMonthly, 269, 'Escala monthly cost is R$ 269');
      assertEquals(calc16.tarefusAnnualMonthly, 215, 'Escala annual monthly cost is R$ 215');
    });

    await test('3.3 Boundary Transition 3: 35 seats (Escala base) vs 36 seats (Escala + pack)', () => {
      const calc35 = calculateSavings(35);
      assertEquals(calc35.planId, 'escala', '35 seats is base Escala');
      assertEquals(calc35.tarefusMonthly, 269, '35 seats monthly cost is base R$ 269');
      assertEquals(calc35.tarefusAnnualMonthly, 215, '35 seats annual monthly cost is base R$ 215');

      const calc36 = calculateSavings(36);
      assertEquals(calc36.planId, 'escala', '36 seats is Escala with 1 extra pack');
      assertEquals(calc36.tarefusMonthly, 269 + 60, '36 seats monthly cost is 269 + 60 = R$ 329');
      assertEquals(calc36.tarefusAnnualMonthly, 215 + 48, '36 seats annual monthly cost is 215 + 48 = R$ 263');
    });

    await test('3.4 Extreme Seats: 50 seats, 100 seats, and 1,000 seats scalability', () => {
      const calc50 = calculateSavings(50);
      // 50 - 35 = 15 extra seats -> 2 packs of 10
      assertEquals(calc50.tarefusMonthly, 269 + 2 * 60, '50 seats monthly cost is 269 + 120 = R$ 389');
      assert(calc50.monthlySavings > 3000, `50 seats must yield huge monthly savings (actual: ${calc50.monthlySavings})`);
      assert(calc50.annualSavings > 36000, `50 seats must yield huge annual savings (actual: ${calc50.annualSavings})`);

      const calc100 = calculateSavings(100);
      // 100 - 35 = 65 extra seats -> 7 packs of 10
      assertEquals(calc100.tarefusMonthly, 269 + 7 * 60, '100 seats monthly cost is 269 + 420 = R$ 689');
      assertEquals(calc100.competitorsMonthly, 100 * 75, '100 seats competitors cost is R$ 7,500');
      assert(calc100.monthlySavings > 6500, 'Monthly savings at 100 seats should exceed R$ 6,500');

      const calc1000 = calculateSavings(1000);
      assert(calc1000.monthlySavings > 65000, 'Monthly savings at 1,000 seats should exceed R$ 65,000');
      assert(!isNaN(calc1000.savingsPercentage), 'Savings percentage must not be NaN');
    });

    await test('3.5 Non-Standard Inputs: 0, negative, float, and boundary seats clamp safely', () => {
      // 0 seats should clamp to minimum (1 seat)
      const calc0 = calculateSavings(0);
      assertEquals(calc0.seats, 1, '0 seats should clamp to 1 seat');
      assertEquals(calc0.planId, 'equipe', '0 seats should yield Equipe plan');

      // Negative seats should clamp to minimum (1 seat)
      const calcNeg = calculateSavings(-15);
      assertEquals(calcNeg.seats, 1, 'Negative seats should clamp to 1 seat');
      assertEquals(calcNeg.tarefusMonthly, 69, 'Clamped negative seats should cost base R$ 69');

      // Decimal seats (e.g. 11.8) should round cleanly
      const calcDec = calculateSavings(11.8);
      assertEquals(calcDec.seats, 12, '11.8 seats should round to 12 seats');
      assertEquals(calcDec.planId, 'crescimento', '12 seats should be Crescimento');

      const calcDec5 = calculateSavings(5.4);
      assertEquals(calcDec5.seats, 5, '5.4 seats should round to 5 seats');
      assertEquals(calcDec5.planId, 'equipe', '5 seats should be Equipe');
    });

    await test('3.6 Mathematical Invariants: Monotonic savings, positive margins, and USD competitor breakdown', () => {
      const testSeatPoints = [1, 3, 5, 6, 8, 10, 12, 15, 16, 20, 25, 30, 35, 40, 50, 75, 100];

      for (const seats of testSeatPoints) {
        const res = calculateSavings(seats);

        // Competitors price strictly scales linearly
        assertEquals(
          res.competitorsMonthly,
          seats * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL,
          `Competitor monthly for ${seats} seats`
        );

        // Savings math invariants
        assertEquals(
          res.monthlySavings,
          res.competitorsMonthly - res.tarefusMonthly,
          `Monthly savings invariant for ${seats} seats`
        );
        assertEquals(
          res.annualSavings,
          res.competitorsMonthly * 12 - res.tarefusAnnualMonthly * 12,
          `Annual savings invariant for ${seats} seats`
        );

        // Check USD Competitor Breakdown
        assert(!!res.usdCompetitorBreakdown, 'USD competitor breakdown must be present');
        assert(res.usdCompetitorBreakdown.asanaBrl > res.usdCompetitorBreakdown.mondayBrl, 'Asana > Monday in BRL');
        assert(res.usdCompetitorBreakdown.mondayBrl > res.usdCompetitorBreakdown.trelloBrl, 'Monday > Trello in BRL');
        assert(
          res.usdCompetitorBreakdown.asanaBrl > res.tarefusMonthly,
          `Tarefus monthly must be strictly cheaper than Asana for ${seats} seats`
        );
      }
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  PRICING UNIT TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED PRICING TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL PRICING UNIT & BOUNDARY CHECKS PASSED.');
  }
}

runPricingUnitTests().catch((err) => {
  console.error('Fatal pricing test runner error:', err);
  process.exit(1);
});
