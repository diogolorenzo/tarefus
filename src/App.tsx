import React from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { DueTodayAlertBanner } from './components/DueTodayAlertBanner';
import { CommercialStatusBanner } from './components/CommercialStatusBanner';
import { BoardView } from './components/BoardView';
import { MyTasksView } from './components/MyTasksView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/TaskModal';
import { BoardModal } from './components/BoardModal';
import { LoginModal } from './components/LoginModal';
import { HelpCenterModal } from './components/help/HelpCenterModal';
import { GuidedTour } from './components/tour/GuidedTour';
import { AuthPage } from './components/auth/AuthPage';
import { ToastContainer } from './components/ToastContainer';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { PricingPage } from './components/pricing/PricingPage';
import { GuideLandingPage } from './components/guide/GuideLandingPage';
import { GuideArticlePage } from './components/guide/GuideArticlePage';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { PHASE } from './content/home';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isAuthenticated,
    currentUser,
    isHelpCenterOpen,
    setIsHelpCenterOpen,
    currentRoute,
    currentPath,
    navigateTo,
    setAuthMode,
    showToast,
  } = useTaskContext();

  const handleStartTrial = () => {
    if (PHASE === 'waitlist') {
      window.location.href = 'mailto:suporte@tarefus.com.br?subject=Quero%20acesso%20antecipado%20ao%20Tarefus';
      return;
    }
    if (isAuthenticated && currentUser) {
      showToast('Você já possui uma conta corporativa ativa no Tarefus!', 'info');
      navigateTo('/');
    } else {
      setAuthMode('register');
      navigateTo('/register');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated && currentUser) {
      navigateTo('/');
    } else {
      setAuthMode('login');
      navigateTo('/login');
    }
  };

  // 1. PUBLIC ROUTE: Pricing Page (/planos ou /pricing)
  if (currentRoute.type === 'pricing') {
    return (
      <div className="min-h-screen bg-app text-ink flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative">
        <PublicNavbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartTrial={handleStartTrial}
          onLogin={handleLogin}
        />
        <main className="flex-1 flex flex-col">
          <PricingPage
            onNavigate={navigateTo}
            onStartTrial={handleStartTrial}
            onSelectPlan={() => handleStartTrial()}
          />
        </main>
        <PublicFooter onNavigate={navigateTo} onStartTrial={handleStartTrial} />

        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      </div>
    );
  }

  // 2. PUBLIC ROUTE: Guide Hub / Landing (/guia ou /guide)
  if (currentRoute.type === 'guide-landing') {
    return (
      <div className="min-h-screen bg-app text-ink flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative">
        <PublicNavbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartTrial={handleStartTrial}
          onLogin={handleLogin}
        />
        <main className="flex-1 flex flex-col">
          <GuideLandingPage
            currentPath={currentPath}
            onArticleClick={(slug) => navigateTo(`/guia/${slug}`)}
            onNavigate={navigateTo}
            onStartTrial={handleStartTrial}
            onNavigatePricing={() => navigateTo('/planos')}
          />
        </main>
        <PublicFooter onNavigate={navigateTo} onStartTrial={handleStartTrial} />

        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      </div>
    );
  }

  // 3. PUBLIC ROUTE: Guide Article Full Reader (/guia/:slug)
  if (currentRoute.type === 'guide-article') {
    return (
      <div className="min-h-screen bg-app text-ink flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative">
        <PublicNavbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartTrial={handleStartTrial}
          onLogin={handleLogin}
        />
        <main className="flex-1 flex flex-col">
          <GuideArticlePage
            slug={currentRoute.slug}
            onNavigate={navigateTo}
            onArticleClick={(slug) => navigateTo(`/guia/${slug}`)}
            onBack={() => navigateTo('/guia')}
            onStartTrial={handleStartTrial}
            onNavigatePricing={() => navigateTo('/planos')}
          />
        </main>
        <PublicFooter onNavigate={navigateTo} onStartTrial={handleStartTrial} />

        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
        />
      </div>
    );
  }

  if (currentRoute.type === 'auth') {
    return (
      <AuthPage
        initialMode={PHASE === 'trial' ? currentRoute.mode : 'login'}
        allowRegistration={PHASE === 'trial'}
        onNavigate={navigateTo}
      />
    );
  }

  // 4. UNKNOWN 404 ROUTE (Not Found)
  if (currentRoute.type === 'not-found') {
    return (
      <div className="min-h-screen bg-app text-ink flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative">
        <PublicNavbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartTrial={handleStartTrial}
          onLogin={handleLogin}
        />
        <main className="flex-1 flex items-center justify-center p-6 py-20">
          <div className="max-w-md w-full bg-surface border border-line rounded-3xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-500/20 shadow-xs">
              <FileQuestion className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-ink mb-2">
              Página Não Encontrada (404)
            </h1>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              O endereço acessado não existe ou foi modificado. Utilize os links abaixo para continuar navegando.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ir para o Início</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/planos')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-sunken hover:bg-surface text-ink border border-line transition-all cursor-pointer"
              >
                Ver Planos & Preços
              </button>
            </div>
          </div>
        </main>
        <PublicFooter onNavigate={navigateTo} onStartTrial={handleStartTrial} />
      </div>
    );
  }

  // 5. PROTECTED APP ROUTE: If not authenticated, render AuthPage
  if (!isAuthenticated || !currentUser) {
    return <AuthPage allowRegistration={PHASE === 'trial'} onNavigate={navigateTo} />;
  }

  // 6. PROTECTED APP ROUTE: Authenticated Workspace View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200 relative">
      <Navbar />
      <CommercialStatusBanner />
      <DueTodayAlertBanner />
      <main className="flex-1 flex flex-col">
        {activeTab === 'board' && <BoardView />}
        {activeTab === 'my-tasks' && <MyTasksView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals & Overlays */}
      <TaskModal />
      <BoardModal />
      <LoginModal />
      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
      />
      <GuidedTour />
    </div>
  );
};

function App() {
  return (
    <TaskProvider>
      <MainContent />
      <ToastContainer />
    </TaskProvider>
  );
}

export default App;
