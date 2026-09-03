import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  CheckSquare2,
  Moon,
  Sun,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  BookOpen,
  CreditCard,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { getEffectiveRole, getRoleBadgeInfo } from '../../utils/rbac';

export interface PublicNavbarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onStartTrial?: () => void;
  onLogin?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  currentPath: propPath,
  onNavigate,
  onStartTrial,
  onLogin,
}) => {
  const {
    theme,
    toggleTheme,
    isAuthenticated,
    currentUser,
    currentPath: contextPath,
    navigateTo: contextNavigateTo,
  } = useTaskContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentPath =
    propPath ||
    contextPath ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else if (contextNavigateTo) {
      contextNavigateTo(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleStartTrial = () => {
    setIsMobileMenuOpen(false);
    if (onStartTrial) {
      onStartTrial();
    } else {
      handleNavigate('/register');
    }
  };

  const handleLogin = () => {
    setIsMobileMenuOpen(false);
    if (onLogin) {
      onLogin();
    } else {
      handleNavigate('/login');
    }
  };

  // Close mobile menu on resize to desktop or Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const isPricingActive = currentPath === '/planos' || currentPath === '/pricing';
  const isGuideActive = currentPath.startsWith('/guia') || currentPath.startsWith('/guide');

  const role = getEffectiveRole(currentUser);
  const roleBadge = getRoleBadgeInfo(role);

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
              title="Ir para a página inicial"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                <CheckSquare2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Tarefus
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted -mt-1 hidden sm:inline-block">
                  Gestão para PMEs
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-sunken/80 border border-line p-1 rounded-2xl shadow-2xs">
            <button
              type="button"
              onClick={() => handleNavigate('/planos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isPricingActive
                  ? 'bg-surface text-ink shadow-xs border border-line text-indigo-600 dark:text-indigo-400'
                  : 'text-muted hover:text-ink hover:bg-surface/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Planos & Preços</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/guia')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isGuideActive
                  ? 'bg-surface text-ink shadow-xs border border-line text-indigo-600 dark:text-indigo-400'
                  : 'text-muted hover:text-ink hover:bg-surface/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Guia de Boas Práticas</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                12 Artigos
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para modo claro (D)' : 'Mudar para modo escuro (D)'}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="p-2.5 text-slate-500 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-amber-400/10 rounded-xl transition-all cursor-pointer border border-line dark:bg-white/[0.02]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Authenticated User Status vs Unauthenticated CTAs */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('/')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition-all shadow-2xs cursor-pointer"
                  title="Voltar para a área logada de quadros"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">← Voltar ao Quadro</span>
                  <span className="sm:hidden">Quadro</span>
                </button>

                <div
                  onClick={() => handleNavigate('/settings')}
                  className="hidden sm:flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-line bg-surface hover:bg-sunken transition-all cursor-pointer"
                  title="Ir para o perfil"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs ${currentUser.avatarColor}`}
                  >
                    {currentUser.initials}
                  </div>
                  <div className="text-left leading-tight pr-1.5">
                    <span className="block text-xs font-bold text-ink truncate max-w-[85px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-0.5">
                      {role === 'admin' && <ShieldCheck className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                      {role === 'manager' && <Briefcase className="w-2.5 h-2.5 text-purple-500 shrink-0" />}
                      {role === 'member' && <UserIcon className="w-2.5 h-2.5 text-blue-500 shrink-0" />}
                      {roleBadge.shortLabel}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-ink hover:bg-sunken border border-line hover:border-line-strong transition-all cursor-pointer"
                >
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={handleStartTrial}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Testar 14 Dias Grátis</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2.5 text-muted hover:text-ink hover:bg-sunken rounded-xl border border-line transition-all cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-surface/98 backdrop-blur-xl px-4 py-5 shadow-2xl animate-fade-in space-y-4">
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleNavigate('/planos')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                isPricingActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-ink hover:bg-sunken border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Planos & Preços</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/guia')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                isGuideActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-ink hover:bg-sunken border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Guia de Boas Práticas</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                12 Artigos
              </span>
            </button>
          </nav>

          {/* Auth & CTAs for Mobile */}
          <div className="pt-3 border-t border-line space-y-2.5">
            {isAuthenticated && currentUser ? (
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Voltar ao Quadro Kanban</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStartTrial}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Testar 14 Dias Grátis</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-ink bg-sunken hover:bg-surface border border-line text-center transition-all cursor-pointer"
                >
                  Entrar na Conta
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
