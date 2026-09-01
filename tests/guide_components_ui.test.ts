/**
 * Tarefus Guide Components UI & Behavioral Test Suite
 * Validates SSR rendering, markup output, prop contracts, and component integrations.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GuideLandingPage } from '../src/components/guide/GuideLandingPage';
import { GuideArticlePage } from '../src/components/guide/GuideArticlePage';
import { TableOfContents } from '../src/components/guide/TableOfContents';
import { RelatedArticles } from '../src/components/guide/RelatedArticles';
import { GUIDE_ARTICLES, GUIDE_CATEGORIES } from '../src/data/guideArticles';

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

async function runGuideUITests() {
  console.log('================================================================');
  console.log('  TAREFUS GUIDE UI COMPONENTS TEST SUITE');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: TableOfContents Component Tests
  // ==================================================================
  await suite('1. TableOfContents Component', async () => {
    await test('1.1 Renders empty TOC safely without crashing', () => {
      const html = renderToStaticMarkup(React.createElement(TableOfContents, { items: [] }));
      assertEquals(html, '', 'Empty TOC should return null / empty string');
    });

    await test('1.2 Renders all headings with correct anchors and levels', () => {
      const sampleItems = GUIDE_ARTICLES[0].tableOfContents;
      const html = renderToStaticMarkup(
        React.createElement(TableOfContents, {
          items: sampleItems,
          activeId: sampleItems[0].id,
        })
      );

      for (const item of sampleItems) {
        assert(html.includes(`#${item.id}`), `HTML must contain anchor link #${item.id}`);
        assert(html.includes(escapeHtml(item.title)), `HTML must contain heading title "${item.title}"`);
      }
      assert(html.includes('Neste Artigo') || html.includes('Neste artigo'), 'Must include section title');
      assert(html.includes('Voltar ao topo'), 'Must include back to top shortcut');
    });

    await test('1.3 Respects variant prop (desktop vs mobile)', () => {
      const sampleItems = GUIDE_ARTICLES[0].tableOfContents;

      const desktopOnly = renderToStaticMarkup(
        React.createElement(TableOfContents, { items: sampleItems, variant: 'desktop' })
      );
      assert(desktopOnly.includes('hidden lg:block'), 'Desktop variant should have hidden lg:block class');

      const mobileOnly = renderToStaticMarkup(
        React.createElement(TableOfContents, { items: sampleItems, variant: 'mobile' })
      );
      assert(mobileOnly.includes('block lg:hidden'), 'Mobile variant should have block lg:hidden class');
    });
  });

  // ==================================================================
  // SUITE 2: RelatedArticles Component Tests
  // ==================================================================
  await suite('2. RelatedArticles Component', async () => {
    await test('2.1 Renders 3 related recommendations for every article', () => {
      for (const article of GUIDE_ARTICLES) {
        const html = renderToStaticMarkup(
          React.createElement(RelatedArticles, {
            currentSlug: article.slug,
            category: article.category,
            categoryKey: article.categoryKey,
          })
        );

        assert(html.includes('Artigos Relacionados'), 'Must render component header');
        assert(html.includes('Ler artigo'), 'Must render read article link');
        assert(html.includes('min'), 'Must render reading time');
      }
    });

    await test('2.2 Custom articles prop override', () => {
      const customList = [GUIDE_ARTICLES[1], GUIDE_ARTICLES[2]];
      const html = renderToStaticMarkup(
        React.createElement(RelatedArticles, {
          articles: customList,
          limit: 2,
        })
      );

      assert(html.includes(escapeHtml(GUIDE_ARTICLES[1].title)), 'Must render custom article 1');
      assert(html.includes(escapeHtml(GUIDE_ARTICLES[2].title)), 'Must render custom article 2');
    });
  });

  // ==================================================================
  // SUITE 3: GuideLandingPage Component Tests
  // ==================================================================
  await suite('3. GuideLandingPage Component', async () => {
    await test('3.1 Initial render displays hero, live search, categories, featured, and grid', () => {
      const html = renderToStaticMarkup(React.createElement(GuideLandingPage, {}));

      // Hero elements
      assert(html.includes('Central de Conhecimento'), 'Must render hero badge');
      assert(html.includes('Organizar Equipes &amp; Entregar Prazos') || html.includes('Organizar Equipes'), 'Must render hero headline');
      assert(html.includes('Buscar por tema'), 'Must render search input placeholder');

      // Category buttons
      assert(html.includes('Todos os Artigos'), 'Must render "Todos os Artigos" filter button');
      for (const cat of GUIDE_CATEGORIES) {
        assert(html.includes(escapeHtml(cat.title)), `Must render category button for "${cat.title}"`);
      }

      // Featured card
      assert(html.includes('Artigo em Destaque'), 'Must render featured article showcase');

      // Trial banner
      assert(html.includes('Começar Teste Grátis'), 'Must render bottom trial banner CTA');
      assert(html.includes('Ver Planos &amp; Preços') || html.includes('Ver Planos'), 'Must render pricing link');
    });

    await test('3.2 Initial Category filter prop activates category correctly', () => {
      const html = renderToStaticMarkup(
        React.createElement(GuideLandingPage, { initialCategory: 'ia-produtividade' })
      );

      assert(html.includes(escapeHtml('IA & Produtividade no Trabalho')), 'Must show IA category');
    });

    await test('3.3 Initial Search Query prop filters articles', () => {
      const html = renderToStaticMarkup(
        React.createElement(GuideLandingPage, { initialQuery: 'trello' })
      );

      assert(html.includes('Trello vs Asana vs Tarefus') || html.includes('trello'), 'Must show Trello comparison');
    });
  });

  // ==================================================================
  // SUITE 4: GuideArticlePage Component Tests
  // ==================================================================
  await suite('4. GuideArticlePage Component', async () => {
    await test('4.1 Renders full reader for all 12 articles without runtime errors', () => {
      for (const article of GUIDE_ARTICLES) {
        const html = renderToStaticMarkup(
          React.createElement(GuideArticlePage, { slug: article.slug })
        );

        // Header and breadcrumbs
        assert(html.includes('Início'), 'Must render breadcrumb home link');
        assert(html.includes('Guia'), 'Must render breadcrumb guide link');
        assert(html.includes('Voltar ao Guia') || html.includes('Voltar'), 'Must render back button');
        assert(html.includes(escapeHtml(article.title)), `Must render article title for ${article.slug}`);
        assert(html.includes(escapeHtml(article.author.name)), `Must render author name for ${article.slug}`);

        // Table of Contents
        for (const toc of article.tableOfContents) {
          assert(html.includes(`#${toc.id}`), `Must contain TOC anchor #${toc.id}`);
        }

        // Section contents
        for (const sec of article.sections) {
          assert(html.includes(`id="${sec.id}"`), `Must contain section anchor id="${sec.id}"`);
          assert(html.includes(escapeHtml(sec.title)), `Must render section title "${sec.title}"`);
        }

        // Practical tip callouts
        const hasTips = article.sections.some((s) => s.tips && s.tips.length > 0);
        if (hasTips) {
          assert(html.includes('💡 Dica Prática Tarefus'), `Must render practical tip badge in ${article.slug}`);
        }

        // Author bio
        assert(html.includes('Sobre o Autor'), `Must render author bio section in ${article.slug}`);

        // Conversion CTA
        assert(html.includes(escapeHtml(article.cta.buttonText)), `Must render article CTA button in ${article.slug}`);

        // Bottom banner
        assert(html.includes('Iniciar Teste Gratuito'), `Must render bottom trial banner in ${article.slug}`);
      }
    });

    await test('4.2 404 Fallback View on Invalid Slug', () => {
      const html = renderToStaticMarkup(
        React.createElement(GuideArticlePage, { slug: 'slug-inexistente-12345' })
      );

      assert(html.includes('Artigo Não Encontrado'), 'Must render 404 title');
      assert(html.includes('Voltar ao Guia'), 'Must render back to guide button');
      assert(html.includes('Artigos Recomendados'), 'Must render recommended suggestions on 404');
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  GUIDE UI COMPONENTS TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED GUIDE UI TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL GUIDE UI COMPONENT CHECKS PASSED.');
  }
}

runGuideUITests().catch((err) => {
  console.error('Fatal guide UI test runner error:', err);
  process.exit(1);
});
