/**
 * Experience Hygiene Acceptance Test Suite
 * Validates R1-R7: Authenticated Navigation, Help Center cleanup,
 * AuthPage demo removal, LoginModal deprecation, CommercialStatusBanner removal,
 * Settings/Audit hygiene, and Public Route contract preservation.
 */

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TaskProvider } from '../src/context/TaskContext';
import { AuthPage } from '../src/components/auth/AuthPage';
import { AuditLogsSettings } from '../src/components/settings/AuditLogsSettings';
import { SettingsView } from '../src/components/settings/SettingsView';
import { Navbar } from '../src/components/Navbar';
import { HelpCenterModal } from '../src/components/help/HelpCenterModal';

if (typeof (globalThis as any).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
}

if (typeof (globalThis as any).sessionStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
}

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

async function runExperienceHygieneTests() {
  console.log('================================================================');
  console.log('  TAREFUS EXPERIENCE HYGIENE TEST SUITE');
  console.log('================================================================\n');

  // Suite 1: R2 - Authenticated Navigation Hygiene in Navbar.tsx
  await suite('1. Authenticated Navigation Hygiene (R2)', async () => {
    const navbarPath = path.join(process.cwd(), 'src', 'components', 'Navbar.tsx');
    assert(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
    const content = fs.readFileSync(navbarPath, 'utf8');

    await test('1.1 Desktop navbar does not contain Planos or Guia buttons or separator', () => {
      assert(!content.includes("navigateTo('/planos')"), 'Navbar must not navigate to /planos');
      assert(!content.includes("navigateTo('/guia')"), 'Navbar must not navigate to /guia');
      assert(!content.includes('Conheça os Planos & Preços'), 'Navbar must not contain Planos tooltip');
      assert(!content.includes('Explorar o Guia de Boas Práticas'), 'Navbar must not contain Guia tooltip');
      assert(!content.includes('h-4 w-px bg-line mx-1 hidden xl:block'), 'Navbar must not have vertical separator for removed buttons');
    });

    await test('1.2 Avatar dropdown does not contain marketing links or demo reset', () => {
      assert(!content.includes('Planos & Preços (R$)'), 'Dropdown must not contain Planos & Preços');
      assert(!content.includes('Guia de Boas Práticas'), 'Dropdown must not contain Guia de Boas Práticas');
      assert(!content.includes('Restaurar Dados de Exemplo'), 'Dropdown must not contain Restaurar Dados de Exemplo');
      assert(!content.includes('resetDemoData();'), 'Navbar must not call resetDemoData');
    });

    await test('1.3 Navbar preserves core operational navigation', () => {
      assert(content.includes('Quadros por Área'), 'Navbar must preserve Quadros por Área tab');
      assert(content.includes('Minhas Tarefas'), 'Navbar must preserve Minhas Tarefas tab');
      assert(content.includes('myPendingTasksCount'), 'Navbar must preserve pending tasks count badge');
      assert(content.includes("activeTab === 'board'"), 'Navbar must preserve board active tab check');
      assert(content.includes("activeTab === 'my-tasks'"), 'Navbar must preserve my-tasks active tab check');
      assert(content.includes('Central de Ajuda & FAQ'), 'Dropdown must preserve Central de Ajuda & FAQ');
      assert(content.includes('Tour Interativo'), 'Dropdown must preserve Tour Interativo');
      assert(content.includes('Painel de Configurações'), 'Dropdown must preserve Painel de Configurações');
      assert(content.includes('Alterar Senha'), 'Dropdown must preserve Alterar Senha');
      assert(content.includes('Encerrar Sessão (Sair)'), 'Dropdown must preserve Encerrar Sessão');
    });

    await test('1.4 TaskContext preserves internal resetDemoData capability', () => {
      const taskContextPath = path.join(process.cwd(), 'src', 'context', 'TaskContext.tsx');
      const taskContextContent = fs.readFileSync(taskContextPath, 'utf8');
      assert(taskContextContent.includes('resetDemoData: () => Promise<void>'), 'TaskContext must define resetDemoData in interface');
      assert(taskContextContent.includes('const resetDemoData = async () =>'), 'TaskContext must implement resetDemoData');
      assert(taskContextContent.includes('resetDemoData,'), 'TaskContext must export resetDemoData in provider');
    });
  });

  // Suite 2: R3 - Help Center Modal Cleanup (HelpCenterModal.tsx)
  await suite('2. Help Center Modal Cleanup (R3)', async () => {
    const helpModalPath = path.join(process.cwd(), 'src', 'components', 'help', 'HelpCenterModal.tsx');
    assert(fs.existsSync(helpModalPath), 'HelpCenterModal.tsx must exist');
    const content = fs.readFileSync(helpModalPath, 'utf8');

    await test('2.1 Promotional cards are removed from FAQ tab', () => {
      assert(!content.includes('Quick Strategy Action Cards'), 'FAQ tab must not contain Quick Strategy Action Cards');
      assert(!content.includes('Planos & Preços (R$)'), 'HelpCenterModal must not contain Planos & Preços card');
      assert(!content.includes('Tabela comparativa, economia em reais'), 'HelpCenterModal must not contain pricing promo text');
      assert(!content.includes('12 artigos estratégicos cobrindo métodos ágeis'), 'HelpCenterModal must not contain guide promo text');
      assert(!content.includes("navigateTo('/planos')"), 'HelpCenterModal must not call navigateTo /planos');
      assert(!content.includes("navigateTo('/guia')"), 'HelpCenterModal must not call navigateTo /guia');
    });

    await test('2.2 Help Center preserves FAQ search, categories, shortcuts, AI guide, and tour', () => {
      assert(content.includes('BookOpen'), 'HelpCenterModal must keep BookOpen import for FAQ tab');
      assert(content.includes('Search'), 'HelpCenterModal must keep search capability');
      assert(content.includes('FAQ_CATEGORIES'), 'HelpCenterModal must keep FAQ categories');
      assert(content.includes('KEYBOARD_SHORTCUTS'), 'HelpCenterModal must keep shortcuts');
      assert(content.includes('AI_PROMPT_EXAMPLES'), 'HelpCenterModal must keep AI prompt examples');
      assert(content.includes('startTour'), 'HelpCenterModal must keep tour integration');
    });
  });

  // Suite 3: R4 - Demo Login Removal and LoginModal Deprecation
  await suite('3. Demo Login Removal & LoginModal Deprecation (R4)', async () => {
    const authPath = path.join(process.cwd(), 'src', 'components', 'auth', 'AuthPage.tsx');
    assert(fs.existsSync(authPath), 'AuthPage.tsx must exist');
    const authContent = fs.readFileSync(authPath, 'utf8');

    await test('3.1 AuthPage does not contain handleQuickLogin or 1-click demo profiles', () => {
      assert(!authContent.includes('handleQuickLogin'), 'AuthPage must not have handleQuickLogin function');
      assert(!authContent.includes('Acesso rápido para demonstração'), 'AuthPage must not contain demo access banner');
      assert(!authContent.includes("('ana.silva@empresa.com')"), 'AuthPage must not contain 1-click demo admin preset');
      assert(!authContent.includes("('carlos.mendes@empresa.com')"), 'AuthPage must not contain 1-click demo manager preset');
      assert(!authContent.includes("('beatriz.lima@empresa.com')"), 'AuthPage must not contain 1-click demo member preset');
    });

    await test('3.2 AuthPage preserves clean corporate form and security badges', () => {
      assert(authContent.includes('handleLoginSubmit'), 'AuthPage must have standard corporate login submit');
      assert(authContent.includes('handleRegisterSubmit'), 'AuthPage must have standard corporate register submit');
      assert(authContent.includes('handleRequestReset'), 'AuthPage must have password reset');
      assert(authContent.includes('ShieldCheck'), 'AuthPage must preserve ShieldCheck import/usage');
      assert(authContent.includes('Briefcase'), 'AuthPage must preserve Briefcase import/usage');
    });

    await test('3.3 LoginModal is removed from disk and decoupled from App.tsx and TaskContext', () => {
      const loginModalPath = path.join(process.cwd(), 'src', 'components', 'LoginModal.tsx');
      assert(!fs.existsSync(loginModalPath), 'src/components/LoginModal.tsx must not exist on disk');

      const appPath = path.join(process.cwd(), 'src', 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');
      assert(!appContent.includes('LoginModal'), 'src/App.tsx must not import or mount LoginModal');

      const taskContextPath = path.join(process.cwd(), 'src', 'context', 'TaskContext.tsx');
      const taskContextContent = fs.readFileSync(taskContextPath, 'utf8');
      assert(!taskContextContent.includes('isLoginModalOpen'), 'TaskContext must not contain isLoginModalOpen');
      assert(!taskContextContent.includes('setIsLoginModalOpen'), 'TaskContext must not contain setIsLoginModalOpen');
    });
  });

  // Suite 4: R5 - Development Banner Removal
  await suite('4. Development Banner Removal (R5)', async () => {
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    await test('4.1 App.tsx does not mount CommercialStatusBanner', () => {
      assert(!appContent.includes('<CommercialStatusBanner'), 'App.tsx must not mount CommercialStatusBanner');
      assert(!appContent.includes("from './components/CommercialStatusBanner'"), 'App.tsx must not import CommercialStatusBanner');
    });

    await test('4.2 TaskContext preserves commercial fallback and memory resilience', () => {
      const taskContextPath = path.join(process.cwd(), 'src', 'context', 'TaskContext.tsx');
      const taskContextContent = fs.readFileSync(taskContextPath, 'utf8');
      assert(taskContextContent.includes('resolveEntitlements'), 'TaskContext must preserve resolveEntitlements');
      assert(taskContextContent.includes('createTrialSubscription'), 'TaskContext must preserve createTrialSubscription');
    });
  });

  // Suite 5: R6 - Settings and Audit Hygiene
  await suite('5. Settings and Audit Hygiene (R6)', async () => {
    const auditPath = path.join(process.cwd(), 'src', 'components', 'settings', 'AuditLogsSettings.tsx');
    assert(fs.existsSync(auditPath), 'AuditLogsSettings.tsx must exist');
    const auditContent = fs.readFileSync(auditPath, 'utf8');

    await test('5.1 AuditLogsSettings does not contain seed button or technical Firestore banner', () => {
      assert(!auditContent.includes('Repovoar Banco (Seed)'), 'AuditLogsSettings must not contain seed button');
      assert(!auditContent.includes('Google Cloud Firestore (Single-Tenant)'), 'AuditLogsSettings must not contain Firestore banner');
      assert(!auditContent.includes('Database,'), 'AuditLogsSettings must not import Database icon');
      assert(!auditContent.includes('RefreshCw,'), 'AuditLogsSettings must not import RefreshCw icon');
      assert(!auditContent.includes('reseedDatabase'), 'AuditLogsSettings must not call reseedDatabase');
    });

    await test('5.2 AuditLogsSettings header matches sanitized naming and keeps CheckCircle2', () => {
      assert(auditContent.includes('Auditoria de Atividades'), 'AuditLogsSettings header must be "Auditoria de Atividades"');
      assert(auditContent.includes('Histórico e logs de eventos operacionais'), 'AuditLogsSettings subtitle must match');
      assert(auditContent.includes('CheckCircle2'), 'AuditLogsSettings must keep CheckCircle2 for completed action logs');
    });

    await test('5.3 SettingsView subtab is renamed to Auditoria de Atividades', () => {
      const settingsPath = path.join(process.cwd(), 'src', 'components', 'settings', 'SettingsView.tsx');
      const settingsContent = fs.readFileSync(settingsPath, 'utf8');
      assert(settingsContent.includes("label: 'Auditoria de Atividades'"), 'SettingsView subtab label must be "Auditoria de Atividades"');
      assert(settingsContent.includes("description: 'Histórico e logs de eventos operacionais'"), 'SettingsView subtab description must match');
      assert(!settingsContent.includes("label: 'Auditoria & Banco'"), 'SettingsView must not contain old subtab label');
    });

    await test('5.4 TaskContext preserves reseedDatabase and ensureDatabaseSeeded internally', () => {
      const taskContextPath = path.join(process.cwd(), 'src', 'context', 'TaskContext.tsx');
      const taskContextContent = fs.readFileSync(taskContextPath, 'utf8');
      assert(taskContextContent.includes('reseedDatabase: () => Promise<void>'), 'TaskContext must declare reseedDatabase');
      assert(taskContextContent.includes('ensureDatabaseSeeded'), 'TaskContext must preserve ensureDatabaseSeeded');
    });
  });

  // Suite 6: R7 - Strict Preservation of Public Routes and Theme
  await suite('6. Strict Preservation of Public Routes and Theme (R7)', async () => {
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    await test('6.1 Public routes (/planos, /pricing, /guia, /guide, /guia/:slug) are rendered before auth guard', () => {
      const pricingPos = appContent.indexOf("currentRoute.type === 'pricing'");
      const guideLandingPos = appContent.indexOf("currentRoute.type === 'guide-landing'");
      const guideArticlePos = appContent.indexOf("currentRoute.type === 'guide-article'");
      const authGuardPos = appContent.indexOf('!isAuthenticated || !currentUser');

      assert(pricingPos !== -1, 'Pricing route check must exist in App.tsx');
      assert(guideLandingPos !== -1, 'Guide landing route check must exist in App.tsx');
      assert(guideArticlePos !== -1, 'Guide article route check must exist in App.tsx');
      assert(authGuardPos !== -1, 'Auth guard check must exist in App.tsx');

      assert(pricingPos < authGuardPos, 'Pricing route must be handled BEFORE authentication guard');
      assert(guideLandingPos < authGuardPos, 'Guide landing route must be handled BEFORE authentication guard');
      assert(guideArticlePos < authGuardPos, 'Guide article route must be handled BEFORE authentication guard');
    });

    await test('6.2 Public site components in src/site/ are untouched and intact', () => {
      const siteDir = path.join(process.cwd(), 'src', 'site');
      assert(fs.existsSync(siteDir), 'src/site/ directory must exist');
      const files = fs.readdirSync(siteDir);
      assert(files.length > 0, 'src/site/ must contain marketing site files');
    });
  });

  // Suite 7: UI Static Rendering & Markup Verification
  await suite('7. UI Static Rendering & DOM Markup Verification', async () => {
    await test('7.1 AuthPage renders corporate form without demo profiles in DOM', () => {
      const html = renderToStaticMarkup(
        React.createElement(TaskProvider, null, React.createElement(AuthPage, null))
      );
      assert(html.includes('Tarefus Corporativo'), 'Rendered AuthPage must include branding');
      assert(html.includes('Entrar na Plataforma'), 'Rendered AuthPage must include submit button');
      assert(!html.includes('Acesso rápido para demonstração'), 'Rendered AuthPage must not contain quick demo profile banner');
      assert(!html.includes('Diretora'), 'Rendered AuthPage must not contain Ana Silva demo profile');
      assert(!html.includes('Marketing'), 'Rendered AuthPage must not contain Beatriz demo profile');
    });

    await test('7.2 AuditLogsSettings renders clean header without seed button or banner in DOM', () => {
      const html = renderToStaticMarkup(
        React.createElement(TaskProvider, null, React.createElement(AuditLogsSettings, null))
      );
      assert(html.includes('Auditoria de Atividades'), 'Rendered AuditLogsSettings must have new title');
      assert(html.includes('Histórico e logs de eventos operacionais'), 'Rendered AuditLogsSettings must have new subtitle');
      assert(!html.includes('Repovoar Banco'), 'Rendered AuditLogsSettings must not contain seed button');
      assert(!html.includes('Google Cloud Firestore (Single-Tenant)'), 'Rendered AuditLogsSettings must not contain Firestore banner');
    });

    await test('7.3 SettingsView renders Auditoria de Atividades navigation tab in DOM', () => {
      globalThis.localStorage.setItem(
        'tarefus_auth_session_v1',
        JSON.stringify({ userId: 'user-1', token: 'token-admin', rememberMe: true, loggedInAt: new Date().toISOString() })
      );
      globalThis.localStorage.setItem('tarefus_current_user_id_v1', 'user-1');
      const html = renderToStaticMarkup(
        React.createElement(TaskProvider, null, React.createElement(SettingsView, null))
      );
      assert(html.includes('Auditoria de Atividades'), 'Rendered SettingsView must contain "Auditoria de Atividades" tab');
      assert(!html.includes('Auditoria &amp; Banco') && !html.includes('Auditoria & Banco'), 'Rendered SettingsView must not contain old tab name');
    });

    await test('7.4 Navbar renders Quadros and Minhas Tarefas without desktop Planos/Guia in DOM', () => {
      const html = renderToStaticMarkup(
        React.createElement(TaskProvider, null, React.createElement(Navbar, null))
      );
      assert(html.includes('Quadros por Área'), 'Rendered Navbar must include Quadros por Área');
      assert(html.includes('Minhas Tarefas'), 'Rendered Navbar must include Minhas Tarefas');
      assert(!html.includes('Conheça os Planos &amp; Preços') && !html.includes('Conheça os Planos & Preços'), 'Rendered Navbar must not have Planos button tooltip');
    });

    await test('7.5 HelpCenterModal renders without promotional cards in DOM', () => {
      const html = renderToStaticMarkup(
        React.createElement(TaskProvider, null, React.createElement(HelpCenterModal, { isOpen: true, onClose: () => {} }))
      );
      assert(html.includes('Central de Ajuda &amp; Conhecimento') || html.includes('Central de Ajuda & Conhecimento'), 'Rendered HelpCenterModal must have header');
      assert(!html.includes('Tabela comparativa, economia em reais'), 'Rendered HelpCenterModal must not have pricing card');
      assert(!html.includes('12 artigos estratégicos cobrindo métodos ágeis'), 'Rendered HelpCenterModal must not have guide card');
    });
  });

  // SUMMARY REPORT
  console.log('\n================================================================');
  console.log('  EXPERIENCE HYGIENE TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED EXPERIENCE HYGIENE TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.error(` - [${r.suite}] ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\nALL EXPERIENCE HYGIENE ACCEPTANCE CHECKS PASSED.');
  }
}

runExperienceHygieneTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
