/**
 * Tarefus Routing & Theme Integration Test Suite
 * Tier 3: Client-side URL History Routing, Public/Auth Route Guards, Slug Extraction, and Theme Token Verification.
 */

import * as fs from 'fs';
import * as path from 'path';

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

// ====================================================================
// Pure Client-Side Route Resolver Specification Implementation
// ====================================================================
export type AppRoute =
  | { type: 'app'; tab: 'board' | 'my-tasks' | 'settings' }
  | { type: 'pricing' }
  | { type: 'guide-landing' }
  | { type: 'guide-article'; slug: string }
  | { type: 'not-found' };

export function resolveClientRoute(pathname: string): AppRoute {
  // Normalize pathname: remove duplicate slashes, trailing slash (unless root), strip query/hash
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

// Theme Manager Emulator
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

async function runRoutingThemeIntegrationTests() {
  console.log('================================================================');
  console.log('  TAREFUS ROUTING & THEME INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: TIER 3 - CLIENT-SIDE URL HISTORY ROUTING & PATH RESOLUTION
  // ==================================================================
  await suite('1. Tier 3 - Client-Side URL History Routing & Path Resolution', async () => {
    await test('1.1 Root & Standard Public Routes Resolution', () => {
      const rootRoute = resolveClientRoute('/');
      assertEquals(rootRoute, { type: 'app', tab: 'board' }, 'Root "/" should resolve to board app view');

      const pricingRoute = resolveClientRoute('/planos');
      assertEquals(pricingRoute, { type: 'pricing' }, '"/planos" should resolve to pricing route');

      const guideLandingRoute = resolveClientRoute('/guia');
      assertEquals(guideLandingRoute, { type: 'guide-landing' }, '"/guia" should resolve to guide-landing route');
    });

    await test('1.2 Trailing Slashes & URL Variations Normalization', () => {
      const pricingSlash = resolveClientRoute('/planos/');
      assertEquals(pricingSlash, { type: 'pricing' }, '"/planos/" must resolve to pricing route');

      const guideSlash = resolveClientRoute('/guia/');
      assertEquals(guideSlash, { type: 'guide-landing' }, '"/guia/" must resolve to guide-landing route');

      const doubleSlash = resolveClientRoute('//planos');
      assertEquals(doubleSlash, { type: 'pricing' }, '"//planos" must resolve to pricing route');

      const withQuery = resolveClientRoute('/planos?utm_source=google&plan=crescimento');
      assertEquals(withQuery, { type: 'pricing' }, 'URL with query params must resolve to pricing route');

      const withHash = resolveClientRoute('/guia#search');
      assertEquals(withHash, { type: 'guide-landing' }, 'URL with hash fragment must resolve to guide-landing route');
    });

    await test('1.3 Guide Article Slug Parameter Extraction', () => {
      const sampleSlugs = [
        'como-organizar-tarefas-equipe',
        'quadro-kanban-pequenas-empresas',
        'delegar-tarefas-whatsapp-erros',
        'trello-vs-asana-vs-tarefus-comparativo',
      ];

      for (const slug of sampleSlugs) {
        const route = resolveClientRoute(`/guia/${slug}`);
        assertEquals(route, { type: 'guide-article', slug }, `Must resolve slug "${slug}"`);
      }

      // Slug with trailing slash
      const routeWithSlash = resolveClientRoute('/guia/como-organizar-tarefas-equipe/');
      assertEquals(
        routeWithSlash,
        { type: 'guide-article', slug: 'como-organizar-tarefas-equipe' },
        'Slug with trailing slash must resolve correctly'
      );
    });

    await test('1.4 Public vs Authenticated Route Access Guard Logic', () => {
      // Unauthenticated visitor access rules
      const publicRoutes = [
        resolveClientRoute('/planos'),
        resolveClientRoute('/guia'),
        resolveClientRoute('/guia/como-organizar-tarefas-equipe'),
        resolveClientRoute('/guia/quadro-kanban-pequenas-empresas'),
      ];

      for (const r of publicRoutes) {
        assert(isPublicRoute(r), `Route ${JSON.stringify(r)} must be classified as public (no auth required)`);
      }

      // Protected app routes
      const privateRoutes = [
        resolveClientRoute('/'),
        resolveClientRoute('/my-tasks'),
        resolveClientRoute('/settings'),
      ];

      for (const r of privateRoutes) {
        assert(!isPublicRoute(r), `Route ${JSON.stringify(r)} must require authentication`);
      }
    });

    await test('1.5 Unknown & 404 Route Handling', () => {
      const unknown1 = resolveClientRoute('/rota-desconhecida');
      assertEquals(unknown1, { type: 'not-found' }, 'Unknown route should return not-found');

      const unknown2 = resolveClientRoute('/api/internal/test');
      assertEquals(unknown2, { type: 'not-found' }, 'Unknown deep route should return not-found');
    });
  });

  // ==================================================================
  // SUITE 2: TIER 3 - THEME ENGINE & DESIGN TOKENS INTEGRITY
  // ==================================================================
  await suite('2. Tier 3 - Theme Engine & Design Tokens Integrity', async () => {
    await test('2.1 CSS Custom Property Tokens in src/index.css', () => {
      const cssPath = path.join(process.cwd(), 'src', 'index.css');
      assert(fs.existsSync(cssPath), 'src/index.css must exist');

      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Verify essential surfaces
      assert(cssContent.includes('--app:'), 'Missing --app surface token');
      assert(cssContent.includes('--raised:'), 'Missing --raised surface token');
      assert(cssContent.includes('--sunken:'), 'Missing --sunken surface token');
      assert(cssContent.includes('--overlay:'), 'Missing --overlay surface token');

      // Verify typography & ink tokens
      assert(cssContent.includes('--text:'), 'Missing --text token');
      assert(cssContent.includes('--text-muted:'), 'Missing --text-muted token');
      assert(cssContent.includes('--text-subtle:'), 'Missing --text-subtle token');

      // Verify border / line tokens
      assert(cssContent.includes('--line:'), 'Missing --line token');
      assert(cssContent.includes('--line-strong:'), 'Missing --line-strong token');

      // Verify dark theme block
      assert(
        cssContent.includes(':root.dark') || cssContent.includes('.dark'),
        'Dark mode overrides block must be defined'
      );

      // Verify inline theme mappings for Tailwind v4
      assert(cssContent.includes('@theme inline'), 'Missing @theme inline directive');
      assert(cssContent.includes('--color-app: var(--app);'), 'Missing --color-app mapping');
      assert(cssContent.includes('--color-surface: var(--raised);'), 'Missing --color-surface mapping');
      assert(cssContent.includes('--color-ink: var(--text);'), 'Missing --color-ink mapping');
      assert(cssContent.includes('--color-line: var(--line);'), 'Missing --color-line mapping');
    });

    await test('2.2 Theme Switching Logic & DOM Class Synchronization', () => {
      const themeManager = new ThemeManager('light');
      assertEquals(themeManager.getTheme(), 'light', 'Initial theme should be light');
      assertEquals(themeManager.hasDarkClass(), false, 'DOM should not have dark class in light mode');
      assertEquals(themeManager.getStoredTheme(), 'light', 'Stored theme should be light');

      // Switch to dark
      themeManager.toggleTheme();
      assertEquals(themeManager.getTheme(), 'dark', 'Toggled theme should be dark');
      assertEquals(themeManager.hasDarkClass(), true, 'DOM must have .dark class in dark mode');
      assertEquals(themeManager.getStoredTheme(), 'dark', 'Stored theme should be updated to dark');

      // Switch back to light
      themeManager.toggleTheme();
      assertEquals(themeManager.getTheme(), 'light', 'Toggled back should be light');
      assertEquals(themeManager.hasDarkClass(), false, 'DOM .dark class must be removed');
      assertEquals(themeManager.getStoredTheme(), 'light', 'Stored theme should be light');

      // Explicit setTheme
      themeManager.setTheme('dark');
      assertEquals(themeManager.getTheme(), 'dark', 'Explicit setTheme to dark');
      assertEquals(themeManager.hasDarkClass(), true, 'DOM has .dark class');
    });

    await test('2.3 Color Contrast & Dark Mode Token Specifications', () => {
      const cssPath = path.join(process.cwd(), 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // In dark mode:
      // --app background is deep (#0b0f17 or #090d16)
      // --text is high contrast (#e8ecf4 or #f8fafc)
      assert(
        cssContent.includes('#0b0f17') || cssContent.includes('#090d16') || cssContent.includes('#0f172a'),
        'Dark mode background should use deep slate/zinc tones'
      );
      assert(
        cssContent.includes('#e8ecf4') || cssContent.includes('#f1f5f9') || cssContent.includes('#ffffff'),
        'Dark mode text should use high contrast light tones'
      );
    });
  });

  // ==================================================================
  // SUITE 3: TIER 3 - CROSS-MODULE NAVIGATION & HELP CENTER INTEGRATION
  // ==================================================================
  await suite('3. Tier 3 - Cross-Module Navigation & Help Center Integration', async () => {
    await test('3.1 Help Center Modal & App Navigation Targets', () => {
      const helpPath = path.join(process.cwd(), 'src', 'data', 'helpData.ts');
      assert(fs.existsSync(helpPath), 'src/data/helpData.ts must exist');

      const helpContent = fs.readFileSync(helpPath, 'utf8');
      assert(helpContent.includes('FAQ_ITEMS'), 'helpData.ts must export FAQ_ITEMS');
      assert(helpContent.includes('FAQ_CATEGORIES'), 'helpData.ts must export FAQ_CATEGORIES');
    });

    await test('3.2 Public URL Links Conform to Canonical Standards', () => {
      const publicUrls = ['/planos', '/guia'];
      for (const url of publicUrls) {
        const route = resolveClientRoute(url);
        assert(isPublicRoute(route), `URL "${url}" must be public`);
      }
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  ROUTING & THEME INTEGRATION TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED ROUTING/THEME TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL ROUTING & THEME INTEGRATION CHECKS PASSED.');
  }
}

runRoutingThemeIntegrationTests().catch((err) => {
  console.error('Fatal routing/theme test runner error:', err);
  process.exit(1);
});
