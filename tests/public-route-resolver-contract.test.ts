/**
 * Tarefus Public Route Resolver Contract Test Suite
 * Verifies the canonical public-route contract exposed by TaskContext.
 */

import { isPublicRoute, resolveClientRoute } from '../src/context/TaskContext';

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
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
    );
  }
}

async function runPublicRouteResolverContractTests() {
  console.log('================================================================');
  console.log('  TAREFUS PUBLIC ROUTE RESOLVER CONTRACT TEST SUITE');
  console.log('================================================================\n');

  await test('1.1 Pricing route aliases resolve as public pricing pages', () => {
    for (const pathname of ['/planos', '/pricing']) {
      const route = resolveClientRoute(pathname);
      assertEquals(route, { type: 'pricing' }, `"${pathname}" must resolve to pricing`);
      assert(isPublicRoute(route), `"${pathname}" must be accessible without authentication`);
    }
  });

  await test('1.2 Guide landing route aliases resolve as public pages', () => {
    for (const pathname of ['/guia', '/guide']) {
      const route = resolveClientRoute(pathname);
      assertEquals(route, { type: 'guide-landing' }, `"${pathname}" must resolve to the guide landing page`);
      assert(isPublicRoute(route), `"${pathname}" must be accessible without authentication`);
    }
  });

  await test('1.3 Guide article slugs resolve as public article pages', () => {
    const slugs = [
      'como-organizar-tarefas-equipe',
      'quadro-kanban-pequenas-empresas',
      'delegar-tarefas-whatsapp-erros',
      'trello-vs-asana-vs-tarefus-comparativo',
    ];

    for (const slug of slugs) {
      const route = resolveClientRoute(`/guia/${slug}`);
      assertEquals(route, { type: 'guide-article', slug }, `Guide slug "${slug}" must be preserved`);
      assert(isPublicRoute(route), `Guide article "${slug}" must be accessible without authentication`);
    }
  });

  await test('1.4 App, authentication, and unknown routes are not public', () => {
    const privatePaths = [
      '/',
      '/my-tasks',
      '/settings',
      '/entrar',
      '/login',
      '/cadastro',
      '/register',
      '/rota-desconhecida',
      '/api/internal/test',
    ];

    for (const pathname of privatePaths) {
      const route = resolveClientRoute(pathname);
      assert(!isPublicRoute(route), `"${pathname}" must not be accessible as a public route`);
    }
  });

  console.log('\n================================================================');
  console.log('  PUBLIC ROUTE RESOLVER CONTRACT TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((result) => result.passed).length;
  const failed = results.filter((result) => !result.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED PUBLIC ROUTE RESOLVER CONTRACT TESTS:');
    results
      .filter((result) => !result.passed)
      .forEach((result) => {
        console.error(` - ${result.name}: ${result.error}`);
      });
    process.exit(1);
  }

  console.log('\nALL PUBLIC ROUTE RESOLVER CONTRACT CHECKS PASSED.');
}

runPublicRouteResolverContractTests().catch((err) => {
  console.error('Fatal public route resolver contract test runner error:', err);
  process.exit(1);
});
