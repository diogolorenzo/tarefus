/**
 * Tarefus Guide Catalog & Search Engine Test Suite
 * Tiers 1 & 2: Schema validation for all 12 articles, TOC integrity, Accent-insensitive Search, and Related Articles Logic.
 */

import {
  GUIDE_CATEGORIES,
  GUIDE_ARTICLES,
  searchGuideArticles,
  getArticleBySlug,
  getRelatedArticles,
} from '../src/data/guideArticles';
import type { GuideCategoryKey } from '../src/types/guide';

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

const EXPECTED_SLUGS = [
  'como-organizar-tarefas-equipe',
  'quadro-kanban-pequenas-empresas',
  'delegar-tarefas-whatsapp-erros',
  'como-definir-prazos-tarefas',
  'responsavel-por-tarefa-clareza',
  'inteligencia-artificial-gestao-tarefas',
  'reuniao-diaria-alinhamento-equipe',
  'checklists-padronizacao-processos',
  'gestao-tarefas-por-setor-empresa',
  'trello-vs-asana-vs-tarefus-comparativo',
  'quanto-custa-gerenciador-tarefas-brasil',
  'como-migrar-planilhas-para-tarefus',
];

const VALID_CATEGORY_KEYS: GuideCategoryKey[] = [
  'gestao-tarefas-prazos',
  'lideranca-delegacao',
  'ia-produtividade',
  'metodos-ageis',
  'rotinas-equipe',
];

async function runGuideCatalogTests() {
  console.log('================================================================');
  console.log('  TAREFUS GUIDE CATALOG & SEARCH TEST SUITE');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: TIER 1 - 12 ARTICLES CATALOG SCHEMA & TAXONOMY
  // ==================================================================
  await suite('1. Tier 1 - 12 Strategic Articles Catalog Schema & Completeness', async () => {
    await test('1.1 Article Count: Exactly 12 strategic articles present in catalog', () => {
      assertEquals(GUIDE_ARTICLES.length, 12, 'Catalog must contain exactly 12 articles');
    });

    await test('1.2 Category Taxonomy: 5 distinct operational categories defined', () => {
      assertEquals(GUIDE_CATEGORIES.length, 5, 'Must have exactly 5 categories defined');
      for (const cat of GUIDE_CATEGORIES) {
        assert(VALID_CATEGORY_KEYS.includes(cat.key), `Category key ${cat.key} must be valid`);
        assert(cat.title.length > 0, `Category ${cat.key} must have a title`);
        assert(cat.description.length > 0, `Category ${cat.key} must have a description`);
        assert(cat.popularTags.length >= 2, `Category ${cat.key} must have at least 2 popular tags`);
      }
    });

    await test('1.3 Slug Completeness & Uniqueness: All 12 required editorial slugs exist and are unique', () => {
      const actualSlugs = GUIDE_ARTICLES.map((a) => a.slug);
      const uniqueSlugs = new Set(actualSlugs);
      assertEquals(uniqueSlugs.size, 12, 'All slugs must be unique');

      for (const expectedSlug of EXPECTED_SLUGS) {
        assert(
          actualSlugs.includes(expectedSlug),
          `Required editorial slug "${expectedSlug}" is missing from catalog`
        );
      }
    });

    await test('1.4 Funnel Stage Distribution: Full funnel coverage (ToFu, MoFu, BoFu)', () => {
      const tofu = GUIDE_ARTICLES.filter((a) => a.funnelStage === 'ToFu');
      const mofu = GUIDE_ARTICLES.filter((a) => a.funnelStage === 'MoFu');
      const bofu = GUIDE_ARTICLES.filter((a) => a.funnelStage === 'BoFu');

      assert(tofu.length >= 3, `Must have at least 3 ToFu articles (actual: ${tofu.length})`);
      assert(mofu.length >= 5, `Must have at least 5 MoFu articles (actual: ${mofu.length})`);
      assert(bofu.length >= 3, `Must have at least 3 BoFu articles (actual: ${bofu.length})`);
      assertEquals(tofu.length + mofu.length + bofu.length, 12, 'Sum of all stages must equal 12');
    });

    await test('1.5 Schema Integrity: Every article has mandatory metadata, author, read time, and tags', () => {
      for (const article of GUIDE_ARTICLES) {
        assert(article.id && article.id.length > 0, `Article ${article.slug} must have an id`);
        assert(article.title && article.title.length > 10, `Article ${article.slug} title must be descriptive`);
        assert(article.subtitle && article.subtitle.length > 10, `Article ${article.slug} subtitle must be descriptive`);
        assert(article.summary && article.summary.length > 20, `Article ${article.slug} summary must be informative`);
        assert(VALID_CATEGORY_KEYS.includes(article.categoryKey), `Article ${article.slug} has invalid categoryKey`);
        assert(article.tags && article.tags.length >= 2, `Article ${article.slug} must have at least 2 tags`);
        assert(article.readTimeMinutes >= 3 && article.readTimeMinutes <= 20, `Article ${article.slug} readTime must be 3-20m`);
        assert(article.targetAudience.length > 0, `Article ${article.slug} must define targetAudience`);
        assert(article.primaryKeyword.length > 0, `Article ${article.slug} must define primaryKeyword`);
        assert(article.author && article.author.name.length > 0, `Article ${article.slug} must have author name`);
        assert(article.author && article.author.role.length > 0, `Article ${article.slug} must have author role`);
        assert(article.coverIcon.length > 0, `Article ${article.slug} must have coverIcon`);
      }
    });

    await test('1.6 Table of Contents (TOC) & Section Anchors Consistency', () => {
      for (const article of GUIDE_ARTICLES) {
        assert(
          article.tableOfContents && article.tableOfContents.length >= 2,
          `Article ${article.slug} must have at least 2 TOC entries`
        );
        assert(
          article.sections && article.sections.length >= 2,
          `Article ${article.slug} must have at least 2 content sections`
        );

        const sectionIds = new Set(article.sections.map((s) => s.id));
        for (const tocItem of article.tableOfContents) {
          assert(
            sectionIds.has(tocItem.id),
            `TOC anchor #${tocItem.id} in article ${article.slug} does not match any section id`
          );
          assert(
            tocItem.level === 2 || tocItem.level === 3,
            `TOC item #${tocItem.id} level must be 2 or 3 (actual: ${tocItem.level})`
          );
        }

        for (const sec of article.sections) {
          assert(sec.title.length > 0, `Section in ${article.slug} must have title`);
          assert(sec.content && sec.content.length >= 1, `Section ${sec.id} in ${article.slug} must have content paragraphs`);
          for (const p of sec.content) {
            assert(p.length > 20, `Paragraph in ${article.slug} section ${sec.id} is too short (<20 chars)`);
          }
        }
      }
    });

    await test('1.7 Contextual Trial CTAs: Every article includes high-converting trial CTA block', () => {
      for (const article of GUIDE_ARTICLES) {
        const cta = article.cta;
        assert(!!cta, `Article ${article.slug} must define a CTA block`);
        assert(cta.title.length > 0, `CTA in ${article.slug} must have title`);
        assert(cta.description.length > 0, `CTA in ${article.slug} must have description`);
        assert(cta.buttonText.length > 0, `CTA in ${article.slug} must have buttonText`);
        assert(
          cta.targetUrl.includes('planos') || cta.targetUrl.includes('trial') || cta.targetUrl.includes('cadastro') || cta.targetUrl.includes('auth'),
          `CTA in ${article.slug} targetUrl should point to conversion destination (actual: ${cta.targetUrl})`
        );
      }
    });
  });

  // ==================================================================
  // SUITE 2: TIER 2 - SEARCH ALGORITHM & FILTERING ENGINE
  // ==================================================================
  await suite('2. Tier 2 - Search Algorithm & Filtering Engine', async () => {
    await test('2.1 Exact Keyword Search: Search by distinct domain terms', () => {
      const kanbanResults = searchGuideArticles('kanban');
      assert(kanbanResults.length >= 1, 'Search for "kanban" must return matching articles');
      assert(
        kanbanResults.some((a) => a.slug === 'quadro-kanban-pequenas-empresas'),
        'Kanban search must include quadro-kanban-pequenas-empresas'
      );

      const whatsappResults = searchGuideArticles('whatsapp');
      assert(whatsappResults.length >= 1, 'Search for "whatsapp" must return matching articles');
      assert(
        whatsappResults.some((a) => a.slug === 'delegar-tarefas-whatsapp-erros'),
        'WhatsApp search must include delegar-tarefas-whatsapp-erros'
      );

      const aiResults = searchGuideArticles('inteligência artificial');
      assert(aiResults.length >= 1, 'Search for "inteligência artificial" must return matching articles');
      assert(
        aiResults.some((a) => a.slug === 'inteligencia-artificial-gestao-tarefas'),
        'AI search must include inteligencia-artificial-gestao-tarefas'
      );
    });

    await test('2.2 Accent & Diacritics Insensitivity: Searches work flawlessly without accents', () => {
      // Searching "gestao" without accent should find "Gestão"
      const gestaoResults = searchGuideArticles('gestao');
      const gestaoAccentResults = searchGuideArticles('gestão');
      assertEquals(
        gestaoResults.length,
        gestaoAccentResults.length,
        'Search "gestao" must return identical count as "gestão"'
      );
      assert(gestaoResults.length >= 2, 'Search "gestao" must match multiple articles');

      // Searching "inteligencia" without accent
      const aiNoAccent = searchGuideArticles('inteligencia');
      const aiAccent = searchGuideArticles('inteligência');
      assertEquals(
        aiNoAccent.length,
        aiAccent.length,
        'Search "inteligencia" must match "inteligência"'
      );

      // Searching "reuniao" without accent
      const reuniaoNoAccent = searchGuideArticles('reuniao');
      const reuniaoAccent = searchGuideArticles('reunião');
      assertEquals(
        reuniaoNoAccent.length,
        reuniaoAccent.length,
        'Search "reuniao" must match "reunião"'
      );

      // Searching "padronizacao" without accent
      const padronizacaoNoAccent = searchGuideArticles('padronizacao');
      const padronizacaoAccent = searchGuideArticles('padronização');
      assertEquals(
        padronizacaoNoAccent.length,
        padronizacaoAccent.length,
        'Search "padronizacao" must match "padronização"'
      );
    });

    await test('2.3 Case Insensitivity: UPPERCASE, MixedCase and lowercase produce identical results', () => {
      const lower = searchGuideArticles('trello');
      const upper = searchGuideArticles('TRELLO');
      const mixed = searchGuideArticles('TrElLo');

      assertEquals(lower.length, upper.length, 'Lower and Upper case must match');
      assertEquals(lower.length, mixed.length, 'Lower and Mixed case must match');
      assert(lower.length >= 1, 'Search "trello" must find comparison article');
    });

    await test('2.4 Category Filtering: Single-category isolation and "all" filter', () => {
      for (const catKey of VALID_CATEGORY_KEYS) {
        const filtered = searchGuideArticles('', catKey);
        assert(filtered.length >= 1, `Category ${catKey} must contain at least 1 article`);
        for (const article of filtered) {
          assertEquals(
            article.categoryKey,
            catKey,
            `Article ${article.slug} categoryKey must strictly match filter ${catKey}`
          );
        }
      }

      const allArticles = searchGuideArticles('', 'all');
      assertEquals(allArticles.length, 12, 'Category "all" must return all 12 articles');

      const undefinedFilter = searchGuideArticles('');
      assertEquals(undefinedFilter.length, 12, 'Empty query with no filter must return all 12 articles');
    });

    await test('2.5 Combined Search Query + Category Filter Intersection', () => {
      // Search for "tarefas" within "gestao-tarefas-prazos"
      const combined = searchGuideArticles('tarefas', 'gestao-tarefas-prazos');
      assert(combined.length >= 1, 'Combined search must return results');
      for (const a of combined) {
        assertEquals(a.categoryKey, 'gestao-tarefas-prazos', 'Must only return articles in the filtered category');
      }

      // Search for "kanban" in a non-matching category (e.g. "lideranca-delegacao")
      const disjoint = searchGuideArticles('kanban', 'lideranca-delegacao');
      assertEquals(disjoint.length, 0, 'Disjoint search and category should yield empty array');
    });

    await test('2.6 Non-matching and Special Query Edge Cases', () => {
      const nonExistent = searchGuideArticles('xyznonexistentquery999');
      assertEquals(nonExistent.length, 0, 'Non-existent term must return empty array');

      const whitespaceOnly = searchGuideArticles('     ');
      assertEquals(whitespaceOnly.length, 12, 'Whitespace query should return all articles');

      const specialChars = searchGuideArticles('!@#$%^&*()_+-=[]{}|;:,.<>?');
      assert(Array.isArray(specialChars), 'Special characters query must return array without crashing');
    });
  });

  // ==================================================================
  // SUITE 3: TIER 2 - ARTICLE LOOKUP & RELATED RECOMMENDATIONS
  // ==================================================================
  await suite('3. Tier 2 - Article Lookup & Related Recommendations Logic', async () => {
    await test('3.1 getArticleBySlug: Accurate retrieval for all 12 slugs and undefined for invalid', () => {
      for (const slug of EXPECTED_SLUGS) {
        const article = getArticleBySlug(slug);
        assert(!!article, `getArticleBySlug must find article for slug "${slug}"`);
        assertEquals(article!.slug, slug, `Retrieved article slug must match`);
      }

      const nonExistent = getArticleBySlug('slug-que-nao-existe');
      assertEquals(nonExistent, undefined, 'Non-existent slug must return undefined');

      const emptySlug = getArticleBySlug('');
      assertEquals(emptySlug, undefined, 'Empty slug must return undefined');
    });

    await test('3.2 getRelatedArticles: Never includes self, prioritizes category, and respects limit', () => {
      for (const article of GUIDE_ARTICLES) {
        const related = getRelatedArticles(article.slug, article.categoryKey, 3);
        assert(related.length <= 3, `Related articles count must be <= 3 (actual: ${related.length})`);
        assert(related.length >= 1, `Related articles should recommend at least 1 article`);

        // Strict non-self invariant
        for (const rel of related) {
          assert(
            rel.slug !== article.slug,
            `Related articles for "${article.slug}" must NOT include itself`
          );
        }

        // Uniqueness check: no duplicate recommendations
        const relatedSlugs = related.map((r) => r.slug);
        const uniqueRelated = new Set(relatedSlugs);
        assertEquals(
          uniqueRelated.size,
          related.length,
          `Related articles for "${article.slug}" must be unique`
        );
      }
    });

    await test('3.3 getRelatedArticles Custom Limits: limit = 1, limit = 5, limit = 0', () => {
      const sample = GUIDE_ARTICLES[0];

      const limit1 = getRelatedArticles(sample.slug, sample.categoryKey, 1);
      assertEquals(limit1.length, 1, 'Limit = 1 should return exactly 1 article');

      const limit5 = getRelatedArticles(sample.slug, sample.categoryKey, 5);
      assert(limit5.length <= 5 && limit5.length >= 1, 'Limit = 5 should return up to 5 articles');

      const limit0 = getRelatedArticles(sample.slug, sample.categoryKey, 0);
      assertEquals(limit0.length, 0, 'Limit = 0 should return 0 articles');
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  GUIDE CATALOG & SEARCH TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED GUIDE TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL GUIDE CATALOG & SEARCH CHECKS PASSED.');
  }
}

runGuideCatalogTests().catch((err) => {
  console.error('Fatal guide test runner error:', err);
  process.exit(1);
});
