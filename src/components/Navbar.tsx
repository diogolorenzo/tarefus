import React, { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { NotificationCenter } from './NotificationCenter';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import {
  CheckSquare2,
  LayoutGrid,
  UserCheck,
  Plus,
  RotateCcw,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  ShieldCheck,
  Briefcase,
  User as UserIcon,
  LogOut,
  KeyRound,
  Lock,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { getBoardColorStyles } from '../utils/helpers';
import { getEffectiveRole, getRoleBadgeInfo, canCreateBoard } from '../utils/rbac';

export const Navbar: React.FC = () => {
  const {
    boards,
    company,
    currentUser,
    activeTab,
    setActiveTab,
    selectedBoardId,
    setSelectedBoardId,
    tasks,
    openTaskModal,
    setIsBoardModalOpen,
    setIsHelpCenterOpen,
    startTour,
    resetDemoData,
    theme,
    toggleTheme,
    logout,
    showToast,
  } = useTaskContext();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click-outside and Escape key handler for user avatar dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const myPendingTasksCount = tasks.filter(
    (t) =>
      (t.assigneeId === currentUser?.id || t.assigneeIds?.includes(currentUser?.id || '')) &&
      t.status !== 'done'
  ).length;

  const role = getEffectiveRole(currentUser);
  const roleBadge = getRoleBadgeInfo(role);
  const canAddBoard = canCreateBoard(currentUser);

  const handleNewBoardClick = () => {
    if (!canAddBoard) {
      showToast('Apenas Gestores e Administradores podem criar novos quadros.', 'error');
      return;
    }
    setIsBoardModalOpen(true);
  };

  return (
    <>
      <header className="bg-surface/90 backdrop-blur-md border-b border-line sticky top-0 z-30 transition-colors duration-200">
        {/* Top Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative flex items-center justify-between h-14 gap-3">
            {/* Esquerda: marca (só o símbolo) + abas */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white cursor-pointer shrink-0"
                onClick={() => setActiveTab('board')}
                title="Ir para os quadros"
                aria-label="Ir para os quadros"
              >
                <CheckSquare2 className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Abaixo de xl não há espaço simétrico para centralizar
                  (medido: 58px em 768px), então o nome fica aqui. */}
              <span
                className="hidden sm:block xl:hidden text-sm font-semibold text-ink truncate"
                title={company.name}
              >
                {company.name}
              </span>

              {/* Main Navigation Tabs */}
              <nav
                id="tour-nav-tabs"
                className="hidden lg:flex items-center gap-1 bg-sunken border border-line p-1 rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('board')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'board'
                      ? 'bg-surface text-ink shadow-xs border border-line'
                      : 'text-muted hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Quadros por Área</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('my-tasks')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'my-tasks'
                      ? 'bg-surface text-ink shadow-xs border border-line'
                      : 'text-muted hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Minhas Tarefas</span>
                  {myPendingTasksCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                      {myPendingTasksCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Nome da empresa centralizado na barra.
                Substitui o nome do produto: para quem já está logado, o que
                importa é confirmar em qual empresa está trabalhando.
                Absoluto para centralizar de fato — as laterais têm larguras
                bem diferentes, então um layout em colunas sairia torto. */}
            <span
              className="hidden xl:block absolute left-1/2 -translate-x-1/2 max-w-[200px] text-sm font-semibold text-ink truncate text-center pointer-events-none"
              title={company.name}
            >
              {company.name}
            </span>

            {/* Direita: ações da sessão */}
            <div id="tour-help-user" className="flex items-center justify-end gap-2 sm:gap-2.5">
              {/* Notifications & Due Dates Center */}
              <NotificationCenter />

              {/* Help Center Button */}
              <button
                type="button"
                onClick={() => setIsHelpCenterOpen(true)}
                title="Central de Ajuda & Atalhos (?)"
                aria-label="Abrir Central de Ajuda"
                className="p-2 text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/20"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Dark Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mudar para modo claro (D)' : 'Mudar para modo escuro (D)'}
                aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                className="p-2 text-slate-500 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-amber-400/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-line dark:bg-white/[0.03]"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* "+ Nova Tarefa" Primary Button */}
              <button
                id="tour-new-task-btn"
                type="button"
                onClick={() => openTaskModal(null, 'todo')}
                title="Nova Tarefa (N)"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Nova Tarefa</span>
                <span className="sm:hidden">Criar</span>
              </button>

              {/* Authenticated User Session Pill & Dropdown */}
              {currentUser && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-2 p-1.5 pl-2 rounded-xl border transition-all text-left cursor-pointer ${
                      isUserMenuOpen || activeTab === 'settings'
                        ? 'bg-indigo-50/60 dark:bg-white/[0.08] border-indigo-500/50 dark:border-indigo-400/50 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-white/[0.05] border-line dark:bg-white/[0.02]'
                    }`}
                    title="Menu de sessão e perfil corporativo"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${currentUser.avatarColor}`}
                    >
                      {currentUser.initials}
                    </div>
                    <div className="hidden sm:block leading-tight pr-1">
                      <div className="text-xs font-bold text-ink flex items-center gap-1">
                        <span>{currentUser.name.split(' ')[0]}</span>
                        <ChevronDown
                          className={`w-3 h-3 text-subtle transition-transform duration-200 ${
                            isUserMenuOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                          }`}
                        />
                      </div>
                      <div className="text-[10px] text-muted truncate max-w-[95px] flex items-center gap-1">
                        {role === 'admin' && <ShieldCheck className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                        {role === 'manager' && <Briefcase className="w-2.5 h-2.5 text-purple-500 shrink-0" />}
                        {role === 'member' && <UserIcon className="w-2.5 h-2.5 text-blue-500 shrink-0" />}
                        <span>{roleBadge.shortLabel}</span>
                      </div>
                    </div>
                  </button>

                  {/* Authenticated User Popover Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-overlay rounded-2xl shadow-2xl border border-line-strong py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-white/[0.06]">
                      {/* User details & RBAC badge */}
                      <div className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0 ${currentUser.avatarColor}`}
                          >
                            {currentUser.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-ink truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {currentUser.email}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadge.color}`}
                              >
                                {role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                                {role === 'manager' && <Briefcase className="w-3 h-3" />}
                                {role === 'member' && <UserIcon className="w-3 h-3" />}
                                {roleBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Actions */}
                      <div className="p-1.5 space-y-0.5">
                        {/* Central de Ajuda & FAQ */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsHelpCenterOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-ink hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold">Central de Ajuda & FAQ</span>
                            <p className="text-[10px] text-muted truncate">
                              Dúvidas, atalhos e guia de IA
                            </p>
                          </div>
                        </button>

                        {/* Iniciar Tour Guiado */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            startTour();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-ink hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold">Tour Interativo</span>
                            <p className="text-[10px] text-muted truncate">
                              Rever o passo a passo do sistema
                            </p>
                          </div>
                        </button>

                        {/* Meu Perfil & Configurações */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('settings');
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                            activeTab === 'settings'
                              ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'text-ink hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold">Painel de Configurações</span>
                            <p className="text-[10px] text-muted truncate">
                              Perfil, empresa, membros e permissões
                            </p>
                          </div>
                        </button>

                        {/* Alterar Senha */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsPasswordModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-ink hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold">Alterar Senha</span>
                            <p className="text-[10px] text-muted truncate">
                              Redefinir credencial de acesso
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Ações de consequência: restaurar dados e sair */}
                      <div className="p-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (
                              window.confirm(
                                'Isto apaga as tarefas, quadros e membros atuais e recarrega os dados de exemplo. Deseja continuar?'
                              )
                            ) {
                              resetDemoData();
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-muted hover:bg-sunken hover:text-ink transition-all text-left cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 text-subtle shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold">Restaurar Dados de Exemplo</span>
                            <p className="text-[10px] text-subtle truncate">
                              Substitui o conteúdo atual pelo seed inicial
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Encerrar Sessão (Sair)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="flex lg:hidden items-center justify-center gap-2 pb-2.5 pt-1 border-t border-line">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'board'
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20'
                  : 'text-muted'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quadros</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-tasks')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'my-tasks'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20'
                  : 'text-muted'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Tarefas ({myPendingTasksCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20'
                  : 'text-muted'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Board Areas Navigation (only visible in 'board' view) */}
        {activeTab === 'board' && (
          <div className="bg-app/90 backdrop-blur-md border-t border-line px-4 sm:px-6 py-2 overflow-x-auto">
            <div className="w-[1232px] max-w-7xl mx-auto flex items-center gap-2 min-w-max">
              {/* "Todas as Áreas" Button */}
              <button
                type="button"
                onClick={() => setSelectedBoardId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedBoardId === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                    : 'bg-surface text-muted hover:text-ink border border-line hover:border-line-strong'
                }`}
              >
                Todas as Áreas ({tasks.length})
              </button>

              {/* Individual Boards */}
              {boards.map((board) => {
                const isSelected = selectedBoardId === board.id;
                const boardCount = tasks.filter((t) => t.boardId === board.id).length;
                const styles = getBoardColorStyles(board.color);

                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => setSelectedBoardId(board.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? styles.activeTab
                        : 'bg-surface text-muted hover:text-ink border border-line hover:border-line-strong'
                    }`}
                  >
                    <span>{board.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {boardCount}
                    </span>
                  </button>
                );
              })}

              {/* "+ Novo Quadro" Button with RBAC Protection */}
              <button
                type="button"
                onClick={handleNewBoardClick}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ml-1 cursor-pointer ${
                  canAddBoard
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20'
                    : 'text-subtle bg-slate-100 dark:bg-white/[0.04] border border-line opacity-75'
                }`}
                title={canAddBoard ? 'Criar novo quadro' : 'Apenas Gestores ou Administradores'}
              >
                {canAddBoard ? <Plus className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>Novo Quadro</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
