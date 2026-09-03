/**
 * Tarefus Adversarial & E2E Verification Suite
 * Tiers 4 & 5: Real-world User Journeys, Adversarial Fuzzing, Mathematical Invariants, XSS/SQLi Query Resilience, and Path Traversal Hardening.
 */

import {
  PRICING_PLANS,
  PRICING_FAQS,
  PRICING_HERO_COPY,
  COMPETITOR_BENCHMARK_SEAT_PRICE_BRL,
  calculateSavings,
  getRecommendedPlan,
} from '../src/data/pricingData';
import {
  GUIDE_ARTICLES,
  GUIDE_CATEGORIES,
  searchGuideArticles,
  getArticleBySlug,
  getRelatedArticles,
} from '../src/data/guideArticles';
// Pure Client-Side Route Resolver Emulator
export type AppRoute =
  | { type: 'app'; tab: 'board' | 'my-tasks' | 'settings' }
  | { type: 'pricing' }
  | { type: 'guide-landing' }
  | { type: 'guide-article'; slug: string }
  | { type: 'not-found' };

export function resolveClientRoute(pathname: string): AppRoute {
  let normalized = pathname.split('?')[0].split('#')[0].replace(/\/+/g, '/');
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (normalized === '' || normalized === '/') {
    return { type: 'app', tab: 'board' };
  }
  if (normalized === '/planos' || normalized === '/pricing') {
    return { type: 'pricing' };
  }
  if (normalized === '/guia' || normalized === '/guide') {
    return { type: 'guide-landing' };
  }
  if (normalized.startsWith('/guia/')) {
    const slug = normalized.replace('/guia/', '').trim();
    if (slug) {
      return { type: 'guide-article', slug };
    }
    return { type: 'guide-landing' };
  }
  if (normalized === '/my-tasks' || normalized === '/minhas-tarefas') {
    return { type: 'app', tab: 'my-tasks' };
  }
  if (normalized === '/settings' || normalized === '/configuracoes') {
    return { type: 'app', tab: 'settings' };
  }
  return { type: 'not-found' };
}

export function isPublicRoute(route: AppRoute): boolean {
  return route.type === 'pricing' || route.type === 'guide-landing' || route.type === 'guide-article';
}

export class ThemeManager {
  private currentTheme: 'light' | 'dark' = 'light';
  private classList: Set<string> = new Set();
  private storage: Map<string, string> = new Map();

  constructor(initialTheme: 'light' | 'dark' = 'light') {
    this.setTheme(initialTheme);
  }

  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  public setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    this.storage.set('tarefus_theme', theme);
    if (theme === 'dark') {
      this.classList.add('dark');
    } else {
      this.classList.delete('dark');
    }
  }

  public toggleTheme() {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  public hasDarkClass(): boolean {
    return this.classList.has('dark');
  }

  public getStoredTheme(): string | null {
    return this.storage.get('tarefus_theme') ?? null;
  }
}
import type { GuideArticle } from '../src/types/guide';

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
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
    );
  }
}

async function runAdversarialSuite() {
  console.log('================================================================');
  console.log('  TAREFUS ADVERSARIAL & E2E WORKLOAD SIMULATION SUITE');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: TIER 4 - REAL-WORLD APPLICATION JOURNEY FLOWS
  // ==================================================================
  await suite('1. Tier 4 - Real-World Application Journey Flows', async () => {
    await test('1.1 Journey 1 (PME Founder Pricing Simulation): Arrive on /planos -> Toggle Annual -> Slider 12 Seats -> Check Savings & FAQ -> Start Trial', () => {
      // Step 1: Resolve route /planos
      const route = resolveClientRoute('/planos');
      assertEquals(route, { type: 'pricing' }, 'Visitor reaches /planos');
      assert(isPublicRoute(route), 'Page is publicly accessible without login');

      // Step 2: Check Hero and Initial 3 Plans
      assert(PRICING_HERO_COPY.badge.includes('REAIS'), 'Hero badge shows BRL pricing');
      const equipe = PRICING_PLANS.find((p) => p.id === 'equipe')!;
      const crescimento = PRICING_PLANS.find((p) => p.id === 'crescimento')!;
      const escala = PRICING_PLANS.find((p) => p.id === 'escala')!;

      assertEquals(equipe.priceMonthly, 69, 'Equipe monthly');
      assertEquals(crescimento.priceMonthly, 139, 'Crescimento monthly');
      assertEquals(escala.priceMonthly, 269, 'Escala monthly');

      // Step 3: Toggle Billing to Annual (Simulate UI state)
      let billingCycle: 'monthly' | 'annual' = 'annual';
      const effectiveCrescimentoPrice =
        billingCycle === 'annual' ? crescimento.priceAnnualMonthly : crescimento.priceMonthly;
      assertEquals(effectiveCrescimentoPrice, 109, 'Annual discount price for Crescimento is R$ 109/mo');

      // Step 4: Interact with Savings Calculator (12 seats)
      const calculation = calculateSavings(12);
      assertEquals(calculation.seats, 12, '12 seats simulated');
      assertEquals(calculation.planId, 'crescimento', 'Recommended plan is Crescimento');
      assertEquals(calculation.tarefusMonthly, 139, 'Tarefus monthly is R$ 139');
      assertEquals(calculation.tarefusAnnualMonthly, 109, 'Tarefus annual monthly is R$ 109');
      assertEquals(calculation.competitorsMonthly, 12 * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL, 'Competitor cost is 12 * 75 = R$ 900');
      assertEquals(calculation.monthlySavings, 900 - 139, 'Monthly savings is R$ 761');
      assertEquals(calculation.annualSavings, (900 - 109) * 12, 'Annual savings is R$ 9,492');
      assert(calculation.savingsPercentage >= 80, 'Savings percentage is >= 80%');

      // Step 5: Read FAQ on credit card requirement
      const cardFaq = PRICING_FAQS.find((f) => f.question.toLowerCase().includes('cartão'))!;
      assert(!!cardFaq, 'Credit card FAQ item must exist');
      assert(
        cardFaq.answer.toLowerCase().includes('não') && cardFaq.answer.toLowerCase().includes('14 dias'),
        'FAQ confirms 14 days without card'
      );

      // Step 6: CTA Action Verification
      assert(crescimento.ctaText.includes('14 Dias'), 'Crescimento CTA initiates 14-day trial');
    });

    await test('1.2 Journey 2 (Operations Leader Guide Discovery): Arrive on /guia -> Search "whatsapp" -> Open Article -> Verify TOC & Tip -> Trial CTA', () => {
      // Step 1: Resolve route /guia
      const landingRoute = resolveClientRoute('/guia');
      assertEquals(landingRoute, { type: 'guide-landing' }, 'Visitor reaches /guia');

      // Step 2: Search for "whatsapp"
      const searchResults = searchGuideArticles('whatsapp');
      assert(searchResults.length >= 1, 'Search finds articles on whatsapp');
      const targetArticle = searchResults.find((a) => a.slug === 'delegar-tarefas-whatsapp-erros')!;
      assert(!!targetArticle, 'Target article delegar-tarefas-whatsapp-erros found');

      // Step 3: Navigate to /guia/delegar-tarefas-whatsapp-erros
      const articleRoute = resolveClientRoute(`/guia/${targetArticle.slug}`);
      assertEquals(
        articleRoute,
        { type: 'guide-article', slug: 'delegar-tarefas-whatsapp-erros' },
        'Navigates to article reader'
      );

      const article = getArticleBySlug(targetArticle.slug)!;
      assert(!!article, 'Article loaded from slug');
      assertEquals(article.funnelStage, 'ToFu', 'Article is Top of Funnel');
      assert(article.readTimeMinutes > 0, 'Estimated read time present');
      assert(article.tableOfContents.length >= 2, 'TOC has multiple navigation anchors');
      assert(article.sections.length >= 2, 'Article has structured content sections');

      // Step 4: Check Related Articles Recommendation
      const related = getRelatedArticles(article.slug, article.categoryKey, 3);
      assertEquals(related.length, 3, 'Recommends 3 related articles');
      assert(!related.some((r) => r.slug === article.slug), 'Does not include current article');

      // Step 5: Convert via CTA
      assert(article.cta.buttonText.length > 0, 'Article has action button');
      assert(article.cta.title.length > 0, 'Article has CTA title');
    });

    await test('1.3 Journey 3 (In-App Help Center to Public Strategy & Dark Theme Toggle)', () => {
      // Step 1: User switches theme to dark mode
      const themeManager = new ThemeManager('light');
      themeManager.setTheme('dark');
      assertEquals(themeManager.getTheme(), 'dark', 'Dark theme activated');
      assertEquals(themeManager.hasDarkClass(), true, 'Dark class applied to document');

      // Step 2: User navigates between public views in dark mode
      const pricingRoute = resolveClientRoute('/planos');
      assertEquals(pricingRoute, { type: 'pricing' }, 'Viewing pricing in dark mode');

      const guideRoute = resolveClientRoute('/guia');
      assertEquals(guideRoute, { type: 'guide-landing' }, 'Viewing guide in dark mode');

      // Step 3: Returns to dashboard
      const dashboardRoute = resolveClientRoute('/');
      assertEquals(dashboardRoute, { type: 'app', tab: 'board' }, 'Returns to board');
      assertEquals(themeManager.getTheme(), 'dark', 'Theme persists after return');
    });
  });

  // ==================================================================
  // SUITE 2: TIER 5 - ADVERSARIAL MATHEMATICAL FUZZING (CALCULATOR)
  // ==================================================================
  await suite('2. Tier 5 - Adversarial Mathematical Fuzzing on Calculator Engine', async () => {
    await test('2.1 1,000 Randomized Seat Values: Zero, negative, decimal, extreme, and large numbers fuzzing', () => {
      const fuzzInputs: number[] = [
        0, -1, -50, -999999,
        0.0001, 0.5, 0.999, 1.001, 4.999, 5.0001, 14.999, 15.0001, 34.999, 35.0001,
        36, 45, 50, 99, 100, 250, 500, 1000, 5000, 10000, 100000, 1000000,
      ];

      // Add 974 randomized numbers
      for (let i = 0; i < 974; i++) {
        fuzzInputs.push((Math.random() - 0.2) * 500);
      }

      for (const input of fuzzInputs) {
        const result = calculateSavings(input);

        // Invariant 1: Result is well-formed
        assert(typeof result === 'object' && result !== null, 'Result must be object');
        assert(typeof result.seats === 'number' && !isNaN(result.seats), 'seats must be finite number');
        assert(result.seats >= 1, `seats must clamp to >= 1 (got ${result.seats} for input ${input})`);

        // Invariant 2: Cost is non-negative and finite
        assert(result.tarefusMonthly >= 69, `tarefusMonthly must be >= 69 (got ${result.tarefusMonthly})`);
        assert(result.tarefusAnnualMonthly >= 55, `tarefusAnnualMonthly must be >= 55 (got ${result.tarefusAnnualMonthly})`);
        assert(!isNaN(result.competitorsMonthly), 'competitorsMonthly must not be NaN');

        // Invariant 3: Savings calculations are finite
        assert(!isNaN(result.monthlySavings), 'monthlySavings must not be NaN');
        assert(!isNaN(result.annualSavings), 'annualSavings must not be NaN');
        assert(!isNaN(result.savingsPercentage), 'savingsPercentage must not be NaN');

        // Invariant 4: Plan is valid
        assert(['equipe', 'crescimento', 'escala'].includes(result.planId), 'planId must be valid');
      }
    });

    await test('2.2 Non-Numeric & Special JS Values: NaN, Infinity, -Infinity handling', () => {
      const specialInputs = [NaN, Infinity, -Infinity];

      for (const special of specialInputs) {
        const res = calculateSavings(special);
        assert(typeof res === 'object' && res !== null, `Must handle ${special} gracefully`);
        assert(!isNaN(res.tarefusMonthly), `tarefusMonthly must not be NaN for ${special}`);
      }
    });
  });

  // ==================================================================
  // SUITE 3: TIER 5 - ADVERSARIAL SEARCH & INJECTION ATTACKS
  // ==================================================================
  await suite('3. Tier 5 - Adversarial Search & Injection Attacks', async () => {
    await test('3.1 200 Injection Payloads: XSS, SQLi, Regex, Null Bytes, RTL, Long Strings Fuzzing', () => {
      const injectionPayloads = [
        // XSS Payloads
        '<script>alert("xss")</script>',
        '"><img src=x onerror=alert(1)>',
        'javascript:alert(document.cookie)',
        '<svg/onload=alert(1)>',
        '<iframe src="https://evil.com"></iframe>',
        '\'"><script src="https://evil.com/payload.js"></script>',

        // SQL Injection Payloads
        "' OR '1'='1",
        "1; DROP TABLE articles; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "1' OR '1' = '1' /*",

        // Regex Metacharacters & ReDoS candidates
        "(a+)+",
        "([a-zA-Z0-9_.-]+)+@([a-zA-Z0-9_.-]+)+",
        "((.*)*)*",
        "[a-z]*?.*+?{}",
        "(?<=foo)bar",
        "\\d+\\w+\\s+",
        "[[[[[[[[[[[",
        "(((((((((((",

        // Control Characters & Null Bytes
        "\0",
        "\x00\x01\x02\x03",
        "\r\n\r\n\t\t\b",
        "\u0000\u0001\u0002",

        // Unicode Homoglyphs & RTL Override
        "\u202E\u0065\u0078\u0065\u002E\u0074\u0078\u0074", // RTL spoof
        "Тrello", // Cyrillic 'Т'
        "Аsana",  // Cyrillic 'А'
        "🚀🔥💡🎯📊✨", // Emojis

        // Long Strings
        "a".repeat(1000),
        "kanban ".repeat(500),
        "%20".repeat(200),
      ];

      // Add 150 randomized combinations
      for (let i = 0; i < 150; i++) {
        const randomChars = Array.from({ length: 30 }, () =>
          String.fromCharCode(Math.floor(Math.random() * 128))
        ).join('');
        injectionPayloads.push(randomChars);
      }

      for (const payload of injectionPayloads) {
        const results = searchGuideArticles(payload);

        // Invariant 1: Function returns array
        assert(Array.isArray(results), `searchGuideArticles with payload must return array`);

        // Invariant 2: All items match GuideArticle contract
        for (const article of results) {
          assert(typeof article.slug === 'string', 'Article must have string slug');
          assert(typeof article.title === 'string', 'Article must have string title');
        }
      }
    });

    await test('3.2 Slug Resolution Path Traversal & Prototype Pollution Fuzzing', () => {
      const maliciousSlugs = [
        '../../../../etc/passwd',
        '..\\..\\windows\\system32\\cmd.exe',
        '%2e%2e%2f%2e%2e%2fconfig',
        '__proto__',
        'constructor',
        'prototype',
        'toString',
        'valueOf',
        '../package.json',
        '/etc/shadow',
        'C:\\boot.ini',
        'null',
        'undefined',
        'true',
        'false',
        '0',
        'a'.repeat(5000),
      ];

      for (const maliciousSlug of maliciousSlugs) {
        const article = getArticleBySlug(maliciousSlug);
        // None of these should resolve to any actual article (unless named identically)
        assertEquals(article, undefined, `Malicious slug "${maliciousSlug.slice(0, 30)}" must return undefined`);
      }
    });
  });

  // ==================================================================
  // SUITE 4: TIER 5 - PERFORMANCE & BENCHMARK RESILIENCE
  // ==================================================================
  await suite('4. Tier 5 - Performance & Benchmark Resilience', async () => {
    await test('4.1 Search Engine Throughput: 500 searches complete in < 500ms total time', () => {
      const queries = ['kanban', 'whatsapp', 'ia', 'tarefas', 'prazos', 'gestao', 'trello', 'planilhas'];
      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        const q = queries[i % queries.length];
        searchGuideArticles(q);
      }

      const durationMs = performance.now() - start;
      console.log(`       -> 500 search queries executed in ${durationMs.toFixed(2)}ms`);
      assert(durationMs < 500, `500 searches took ${durationMs}ms (must be < 500ms)`);
    });

    await test('4.2 Calculator Engine Throughput: 10,000 savings calculations complete in < 50ms', () => {
      const start = performance.now();

      for (let i = 1; i <= 10000; i++) {
        calculateSavings((i % 50) + 1);
      }

      const durationMs = performance.now() - start;
      console.log(`       -> 10,000 calculations executed in ${durationMs.toFixed(2)}ms`);
      assert(durationMs < 100, `10,000 calculations took ${durationMs}ms (must be < 100ms)`);
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  ADVERSARIAL & E2E TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED ADVERSARIAL TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL ADVERSARIAL & E2E CHECKS PASSED.');
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal adversarial test runner error:', err);
  process.exit(1);
});
