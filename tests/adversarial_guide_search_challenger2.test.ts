/**
 * Tarefus Challenger 2 - Exhaustive Empirical Adversarial Test Suite
 * Stress-testing:
 *  1. Diacritics & Accents Normalization in Portuguese Search
 *  2. Case-Insensitive Search Queries
 *  3. Injection & Malicious Payloads (HTML, Script, Regex, SQLi, Control Chars, Proto)
 *  4. TOC Anchor Integrity for all 12 articles
 *  5. Slug Resolution & Route Traversal Edge Cases
 *  6. Related Articles Recommendation Invariants
 */

import {
  GUIDE_CATEGORIES,
  GUIDE_ARTICLES,
  GUIDE_AUTHORS,
  searchGuideArticles,
  getArticleBySlug,
  getRelatedArticles,
  getAllTags,
  getFeaturedArticle,
  getArticlesByCategory,
} from '../src/data/guideArticles';
import { resolveClientRoute, isPublicRoute } from '../src/context/TaskContext';
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
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
    );
  }
}

async function runChallenger2Suite() {
  console.log('================================================================');
  console.log('  CHALLENGER 2: ADVERSARIAL GUIDE CATALOG & SEARCH HARNESS');
  console.log('================================================================\n');

  // ==================================================================
  // 1. DIACRITICS & ACCENTS NORMALIZATION IN PORTUGUESE SEARCH
  // ==================================================================
  await suite('1. Portuguese Diacritics & Accents Normalization', async () => {
    const diacriticsPairs = [
      { unaccented: 'gestao', accented: 'gestão' },
      { unaccented: 'inteligencia', accented: 'inteligência' },
      { unaccented: 'reuniao', accented: 'reunião' },
      { unaccented: 'padronizacao', accented: 'padronização' },
      { unaccented: 'metodos', accented: 'métodos' },
      { unaccented: 'ageis', accented: 'ágeis' },
      { unaccented: 'lideranca', accented: 'liderança' },
      { unaccented: 'delegacao', accented: 'delegação' },
      { unaccented: 'organizacao', accented: 'organização' },
      { unaccented: 'comunicacao', accented: 'comunicação' },
      { unaccented: 'estrategia', accented: 'estratégia' },
      { unaccented: 'preco', accented: 'preço' },
      { unaccented: 'criterios', accented: 'critérios' },
      { unaccented: 'diagnostico', accented: 'diagnóstico' },
      { unaccented: 'conclusao', accented: 'conclusão' },
      { unaccented: 'unico', accented: 'único' },
      { unaccented: 'visao', accented: 'visão' },
      { unaccented: 'secao', accented: 'seção' },
      { unaccented: 'notificacoes', accented: 'notificações' },
      { unaccented: 'automacao', accented: 'automação' },
      { unaccented: 'gerenciador', accented: 'gerenciador' },
    ];

    await test('1.1 Symmetrical Parity: Accented vs Unaccented queries return identical result sets', () => {
      for (const pair of diacriticsPairs) {
        const unaccentedResults = searchGuideArticles(pair.unaccented);
        const accentedResults = searchGuideArticles(pair.accented);

        assertEquals(
          unaccentedResults.length,
          accentedResults.length,
          `Query "${pair.unaccented}" (${unaccentedResults.length}) must return same count as "${pair.accented}" (${accentedResults.length})`
        );

        const unaccentedSlugs = unaccentedResults.map((a) => a.slug).sort();
        const accentedSlugs = accentedResults.map((a) => a.slug).sort();
        assertEquals(
          unaccentedSlugs,
          accentedSlugs,
          `Result slugs for "${pair.unaccented}" and "${pair.accented}" must be identical`
        );
      }
    });

    await test('1.2 Unicode Canonical Decomposed (NFD) vs Precomposed (NFC) Queries', () => {
      const sampleQueries = ['gestão', 'inteligência', 'reunião', 'ágeis', 'automação'];
      for (const q of sampleQueries) {
        const nfcQuery = q.normalize('NFC');
        const nfdQuery = q.normalize('NFD');
        const nfkcQuery = q.normalize('NFKC');
        const nfkdQuery = q.normalize('NFKD');

        const rNfc = searchGuideArticles(nfcQuery);
        const rNfd = searchGuideArticles(nfdQuery);
        const rNfkc = searchGuideArticles(nfkcQuery);
        const rNfkd = searchGuideArticles(nfkdQuery);

        assertEquals(rNfc.length, rNfd.length, `NFC vs NFD count mismatch for "${q}"`);
        assertEquals(rNfc.length, rNfkc.length, `NFC vs NFKC count mismatch for "${q}"`);
        assertEquals(rNfc.length, rNfkd.length, `NFC vs NFKD count mismatch for "${q}"`);
      }
    });

    await test('1.3 Portuguese Special Characters (ç, ã, õ, á, é, í, ó, ú, â, ê, ô, à)', () => {
      const charTests = [
        { char: 'ç', base: 'c', termA: 'liderança', termB: 'lideranca' },
        { char: 'ã', base: 'a', termA: 'reunião', termB: 'reuniao' },
        { char: 'é', base: 'e', termA: 'ágeis', termB: 'ageis' },
        { char: 'í', base: 'i', termA: 'inteligência', termB: 'inteligencia' },
        { char: 'ó', base: 'o', termA: 'diagnóstico', termB: 'diagnostico' },
        { char: 'ú', base: 'u', termA: 'único', termB: 'unico' },
        { char: 'ê', base: 'e', termA: 'experiência', termB: 'experiencia' },
        { char: 'ô', base: 'o', termA: 'metodológico', termB: 'metodologico' },
      ];

      for (const t of charTests) {
        const rA = searchGuideArticles(t.termA);
        const rB = searchGuideArticles(t.termB);
        assertEquals(rA.length, rB.length, `Character test failed for "${t.termA}" vs "${t.termB}"`);
      }
    });
  });

  // ==================================================================
  // 2. CASE-INSENSITIVE SEARCH QUERIES
  // ==================================================================
  await suite('2. Case-Insensitive Search Queries', async () => {
    await test('2.1 UPPERCASE, lowercase, TitleCase, and InVeRsE cAsE queries', () => {
      const testCases = [
        'KANBAN',
        'kanban',
        'Kanban',
        'kAnBaN',
        'TRELLO',
        'trello',
        'Trello',
        'TrElLo',
        'WHATSAPP',
        'whatsapp',
        'WhatsApp',
        'wHaTsApP',
        'INTELIGÊNCIA ARTIFICIAL',
        'inteligência artificial',
        'Inteligência Artificial',
        'iNtElIgÊnCiA aRtIfIcIaL',
        'GESTAO',
        'gestao',
        'Gestao',
        'gEsTaO',
      ];

      const baselineKanban = searchGuideArticles('kanban').length;
      assert(searchGuideArticles('KANBAN').length === baselineKanban, 'KANBAN mismatch');
      assert(searchGuideArticles('Kanban').length === baselineKanban, 'Kanban mismatch');
      assert(searchGuideArticles('kAnBaN').length === baselineKanban, 'kAnBaN mismatch');

      const baselineTrello = searchGuideArticles('trello').length;
      assert(searchGuideArticles('TRELLO').length === baselineTrello, 'TRELLO mismatch');
      assert(searchGuideArticles('Trello').length === baselineTrello, 'Trello mismatch');
      assert(searchGuideArticles('TrElLo').length === baselineTrello, 'TrElLo mismatch');
    });

    await test('2.2 Full Title Exact Match in Screaming Uppercase for all 12 articles', () => {
      for (const article of GUIDE_ARTICLES) {
        const uppercaseTitle = article.title.toUpperCase();
        const results = searchGuideArticles(uppercaseTitle);
        assert(
          results.some((a) => a.slug === article.slug),
          `Uppercase search for "${uppercaseTitle}" must find article "${article.slug}"`
        );
      }
    });
  });

  // ==================================================================
  // 3. INJECTION & MALICIOUS PAYLOADS
  // ==================================================================
  await suite('3. Injection & Malicious Payload Resilience', async () => {
    await test('3.1 XSS & HTML Payloads (must not throw or cause script execution)', () => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<body onload=alert(1)>',
        '<input type="text" autofocus onfocus="alert(1)">',
        '"><script>alert(document.cookie)</script>',
        '\'><script>alert(1)</script>',
        '<a href="javascript:alert(1)">click me</a>',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>',
        '<script/xss src="data:text/javascript,alert(1)"></script>',
        '<IMG SRC="jav&#x09;ascript:alert(\'XSS\');">',
      ];

      for (const payload of xssPayloads) {
        const res = searchGuideArticles(payload);
        assert(Array.isArray(res), `XSS payload "${payload}" failed to return array`);
      }
    });

    await test('3.2 Regex Metacharacters (must not cause RegExp compilation or ReDoS errors)', () => {
      const regexPayloads = [
        '.*',
        '.+',
        '^',
        '$',
        '?',
        '+',
        '*',
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        '|',
        '\\',
        '/',
        '(a+)+',
        '([a-zA-Z0-9]+)+',
        '(((((((.*)*)*)*)*)*)*)',
        '[a-z]*?.*+?{}()^$|\\',
        '(?<=foo)bar',
        '(?<!foo)bar',
        '(?:foo|bar)+',
        '\\d+\\s+\\w+',
        '\\\\\\\\\\\\\\\\',
        '[[[[[[[[[[[[[[[[[[',
        '(((((((((((((((((',
      ];

      for (const regexPayload of regexPayloads) {
        const res = searchGuideArticles(regexPayload);
        assert(Array.isArray(res), `Regex payload "${regexPayload}" threw error or failed to return array`);
      }
    });

    await test('3.3 SQL Injection & Command Injection Payloads', () => {
      const sqliPayloads = [
        "' OR '1'='1",
        "' OR 1=1 --",
        "admin'--",
        "'; DROP TABLE articles; --",
        "' UNION SELECT * FROM users --",
        "1; WAITFOR DELAY '0:0:5'--",
        "' OR ''='",
        "1' OR '1' = '1' /*",
        "` OR 1=1 --",
        "$(whoami)",
        "; cat /etc/passwd",
        "| ping -c 4 127.0.0.1",
      ];

      for (const payload of sqliPayloads) {
        const res = searchGuideArticles(payload);
        assert(Array.isArray(res), `SQLi payload "${payload}" failed to return array`);
      }
    });

    await test('3.4 Control Characters, Null Bytes & Zero-Width Unicode', () => {
      const controlPayloads = [
        '\0',
        '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f',
        '\u0000',
        '\u200B', // Zero-width space
        '\u200C', // Zero-width non-joiner
        '\u200D', // Zero-width joiner
        '\uFEFF', // BOM
        '\u202E', // RTL override
        '\r\n\r\n\t\t\b',
        'kanban\0injection',
        'gestão\u200Bcom\u200Bzero\u200Bwidth',
      ];

      for (const payload of controlPayloads) {
        const res = searchGuideArticles(payload);
        assert(Array.isArray(res), `Control character payload failed`);
      }
    });

    await test('3.5 Prototype Pollution Keys', () => {
      const protoKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty'];
      for (const key of protoKeys) {
        const res = searchGuideArticles(key);
        assert(Array.isArray(res), `Prototype key search "${key}" failed`);
        const article = getArticleBySlug(key);
        assertEquals(article, undefined, `Slug lookup for prototype key "${key}" must be undefined`);
      }
    });

    await test('3.6 Massive String Fuzzing (1K, 10K, 50K chars)', () => {
      const lengths = [1000, 10000, 50000];
      for (const len of lengths) {
        const longStr = 'a'.repeat(len);
        const start = performance.now();
        const res = searchGuideArticles(longStr);
        const duration = performance.now() - start;
        assert(Array.isArray(res), `Long string (${len} chars) failed`);
        assertEquals(res.length, 0, `Long string of 'a' should match 0 articles`);
        assert(duration < 100, `Search with ${len} chars took ${duration}ms (must be < 100ms)`);
      }
    });
  });

  // ==================================================================
  // 4. TOC ANCHOR INTEGRITY FOR ALL 12 ARTICLES
  // ==================================================================
  await suite('4. Table of Contents (TOC) & Section Anchor Integrity', async () => {
    await test('4.1 Completeness: All 12 articles have valid TOC and Sections', () => {
      assertEquals(GUIDE_ARTICLES.length, 12, 'Must have exactly 12 articles');

      for (const article of GUIDE_ARTICLES) {
        assert(
          Array.isArray(article.tableOfContents) && article.tableOfContents.length >= 3,
          `Article ${article.slug} must have >= 3 TOC items (actual: ${article.tableOfContents?.length})`
        );
        assert(
          Array.isArray(article.sections) && article.sections.length >= 3,
          `Article ${article.slug} must have >= 3 sections (actual: ${article.sections?.length})`
        );
      }
    });

    await test('4.2 100% TOC-to-Section ID Mapping: Every TOC anchor points to an existing section', () => {
      let totalTocItems = 0;

      for (const article of GUIDE_ARTICLES) {
        const sectionIdSet = new Set(article.sections.map((s) => s.id));
        const sectionIdsList = article.sections.map((s) => s.id);

        // Check for duplicate section IDs
        const uniqueSectionIds = new Set(sectionIdsList);
        assertEquals(
          uniqueSectionIds.size,
          sectionIdsList.length,
          `Article ${article.slug} contains duplicate section IDs: ${sectionIdsList.join(', ')}`
        );

        // Check each TOC item
        for (const tocItem of article.tableOfContents) {
          totalTocItems++;
          assert(
            sectionIdSet.has(tocItem.id),
            `Broken TOC Anchor! Article "${article.slug}" has TOC item #${tocItem.id} ("${tocItem.title}") which does not exist in article sections`
          );
          assert(
            tocItem.title && tocItem.title.trim().length > 0,
            `Article "${article.slug}" TOC item #${tocItem.id} has empty title`
          );
          assert(
            tocItem.level === 2 || tocItem.level === 3,
            `Article "${article.slug}" TOC item #${tocItem.id} has invalid level ${tocItem.level}`
          );
        }
      }

      console.log(`       -> Validated ${totalTocItems} TOC navigation anchors across all 12 articles`);
      assert(totalTocItems >= 60, `Must have >= 60 total TOC items across 12 articles (found: ${totalTocItems})`);
    });

    await test('4.3 Section Schema Rigor: Titles, contents, and URL hash compatibility', () => {
      const slugIdRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

      for (const article of GUIDE_ARTICLES) {
        for (const section of article.sections) {
          assert(
            slugIdRegex.test(section.id),
            `Section ID "${section.id}" in article "${article.slug}" is not a valid URL slug (must be kebab-case lowercase alphanumeric)`
          );
          assert(
            section.title && section.title.trim().length > 0,
            `Section "${section.id}" in article "${article.slug}" has empty title`
          );
          assert(
            Array.isArray(section.content) && section.content.length > 0,
            `Section "${section.id}" in article "${article.slug}" has no content paragraphs`
          );
          for (const p of section.content) {
            assert(
              typeof p === 'string' && p.trim().length >= 20,
              `Paragraph in section "${section.id}" of "${article.slug}" is too short (< 20 chars)`
            );
          }
        }
      }
    });
  });

  // ==================================================================
  // 5. SLUG RESOLUTION & ROUTE TRAVERSAL EDGE CASES
  // ==================================================================
  await suite('5. Slug Resolution & Route Traversal Edge Cases', async () => {
    await test('5.1 Valid Slug Retrieval for all 12 editorial articles', () => {
      const expectedSlugs = [
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

      for (const slug of expectedSlugs) {
        // Direct slug
        const direct = getArticleBySlug(slug);
        assert(!!direct, `getArticleBySlug failed for direct slug "${slug}"`);
        assertEquals(direct!.slug, slug, `Retrieved article slug must match`);

        // Slug with leading /guia/
        const withPrefix = getArticleBySlug(`/guia/${slug}`);
        assert(!!withPrefix, `getArticleBySlug failed for prefixed slug "/guia/${slug}"`);
        assertEquals(withPrefix!.slug, slug, `Retrieved article slug with prefix must match`);

        // Slug with leading slash
        const withSlash = getArticleBySlug(`/${slug}`);
        assert(!!withSlash, `getArticleBySlug failed for slash slug "/${slug}"`);
      }
    });

    await test('5.2 Path Traversal & Invalid Slugs in getArticleBySlug', () => {
      const hostileSlugs = [
        '',
        '   ',
        '/',
        '/guia/',
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '/var/log/nginx/access.log',
        '%2e%2e%2f%2e%2e%2fconfig',
        '__proto__',
        'constructor',
        'prototype',
        'toString',
        'valueOf',
        'article-does-not-exist',
        'trello-vs-jira',
        'null',
        'undefined',
        'NaN',
        'true',
        'false',
        '0',
        'como-organizar-tarefas-equipe/extra-path',
        'como-organizar-tarefas-equipe?query=123',
      ];

      for (const badSlug of hostileSlugs) {
        const article = getArticleBySlug(badSlug);
        assertEquals(article, undefined, `Hostile slug "${badSlug}" should resolve to undefined`);
      }
    });

    await test('5.3 resolveClientRoute: Edge cases, path normalization, query & hash stripping', () => {
      // 1. Root & basic routes
      assertEquals(resolveClientRoute('/'), { type: 'app', tab: 'board' }, 'Root path');
      assertEquals(resolveClientRoute(''), { type: 'app', tab: 'board' }, 'Empty path');
      assertEquals(resolveClientRoute('/planos'), { type: 'pricing' }, '/planos');
      assertEquals(resolveClientRoute('/pricing'), { type: 'pricing' }, '/pricing');
      assertEquals(resolveClientRoute('/guia'), { type: 'guide-landing' }, '/guia');
      assertEquals(resolveClientRoute('/guide'), { type: 'guide-landing' }, '/guide');

      // 2. Guide articles
      assertEquals(
        resolveClientRoute('/guia/como-organizar-tarefas-equipe'),
        { type: 'guide-article', slug: 'como-organizar-tarefas-equipe' },
        'Guide article route'
      );

      // 3. Trailing slashes
      assertEquals(resolveClientRoute('/planos/'), { type: 'pricing' }, 'Trailing slash /planos/');
      assertEquals(resolveClientRoute('/guia/'), { type: 'guide-landing' }, 'Trailing slash /guia/');
      assertEquals(
        resolveClientRoute('/guia/quadro-kanban-pequenas-empresas/'),
        { type: 'guide-article', slug: 'quadro-kanban-pequenas-empresas' },
        'Trailing slash on article'
      );

      // 4. Duplicate slashes
      assertEquals(resolveClientRoute('///planos///'), { type: 'pricing' }, 'Multiple slashes');
      assertEquals(resolveClientRoute('///guia///'), { type: 'guide-landing' }, 'Multiple slashes on guia');
      assertEquals(
        resolveClientRoute('//guia//como-organizar-tarefas-equipe//'),
        { type: 'guide-article', slug: 'como-organizar-tarefas-equipe' },
        'Multiple slashes in article route'
      );

      // 5. Query parameters & hashes
      assertEquals(
        resolveClientRoute('/planos?billing=annual&seats=15#calculator'),
        { type: 'pricing' },
        'Query params and hash on pricing'
      );
      assertEquals(
        resolveClientRoute('/guia?category=metodos-ageis&q=kanban#results'),
        { type: 'guide-landing' },
        'Query params on guide landing'
      );
      assertEquals(
        resolveClientRoute('/guia/como-definir-prazos-tarefas?ref=email#passo-3'),
        { type: 'guide-article', slug: 'como-definir-prazos-tarefas' },
        'Query and hash on guide article'
      );

      // 6. Unknown 404 routes
      assertEquals(resolveClientRoute('/invalid-route-xyz'), { type: 'not-found' }, 'Unknown route');
      assertEquals(resolveClientRoute('/admin/secrets'), { type: 'not-found' }, 'Protected unknown route');
    });

    await test('5.4 isPublicRoute Guard Function', () => {
      assert(isPublicRoute({ type: 'pricing' }), 'Pricing is public');
      assert(isPublicRoute({ type: 'guide-landing' }), 'Guide landing is public');
      assert(isPublicRoute({ type: 'guide-article', slug: 'art' }), 'Guide article is public');
      assert(!isPublicRoute({ type: 'app', tab: 'board' }), 'Board is private');
      assert(!isPublicRoute({ type: 'app', tab: 'my-tasks' }), 'My Tasks is private');
      assert(!isPublicRoute({ type: 'app', tab: 'settings' }), 'Settings is private');
      assert(!isPublicRoute({ type: 'not-found' }), 'Not found is not public app route');
    });
  });

  // ==================================================================
  // 6. RELATED ARTICLES RECOMMENDATION INVARIANTS
  // ==================================================================
  await suite('6. Related Articles Recommendation Invariants', async () => {
    await test('6.1 Invariant: No article recommends itself in related articles', () => {
      for (const article of GUIDE_ARTICLES) {
        const related = getRelatedArticles(article.slug, article.categoryKey, 3);
        for (const rel of related) {
          assert(
            rel.slug !== article.slug,
            `Self-recommendation detected! Article "${article.slug}" recommended itself`
          );
          assert(
            rel.id !== article.id,
            `Self-recommendation by ID detected! Article "${article.id}" recommended itself`
          );
        }
      }
    });

    await test('6.2 Invariant: No duplicates in recommendations', () => {
      for (const article of GUIDE_ARTICLES) {
        const related = getRelatedArticles(article.slug, article.categoryKey, 5);
        const slugs = related.map((r) => r.slug);
        const uniqueSlugs = new Set(slugs);
        assertEquals(
          uniqueSlugs.size,
          slugs.length,
          `Duplicate recommendations found for article "${article.slug}": ${slugs.join(', ')}`
        );
      }
    });

    await test('6.3 Fallback behavior when slug is invalid or limit is edge value', () => {
      const invalidSlugRel = getRelatedArticles('non-existent-slug', 'gestao-tarefas-prazos', 3);
      assertEquals(invalidSlugRel.length, 3, 'Non-existent slug should still return related articles by category');

      const zeroLimit = getRelatedArticles('como-organizar-tarefas-equipe', 'gestao-tarefas-prazos', 0);
      assertEquals(zeroLimit.length, 0, 'Limit 0 should return empty array');

      const largeLimit = getRelatedArticles('como-organizar-tarefas-equipe', 'gestao-tarefas-prazos', 100);
      assertEquals(largeLimit.length, 11, 'Limit 100 should return all other 11 articles');
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  CHALLENGER 2 TEST SUMMARY REPORT');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED CHALLENGER 2 TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL CHALLENGER 2 EMPIRICAL ADVERSARIAL CHECKS PASSED.');
  }
}

runChallenger2Suite().catch((err) => {
  console.error('Fatal challenger 2 test runner error:', err);
  process.exit(1);
});
