import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import {
  CheckSquare2,
  LayoutGrid,
  UserCheck,
  Plus,
  RotateCcw,
  ChevronDown,
  Building2,
  Moon,
  Sun,
} from 'lucide-react';
import { getBoardColorStyles } from '../utils/helpers';

export const Navbar: React.FC = () => {
  const {
    boards,
    currentUser,
    activeTab,
    setActiveTab,
    selectedBoardId,
    setSelectedBoardId,
    tasks,
    openTaskModal,
    setIsBoardModalOpen,
    setIsLoginModalOpen,
    resetDemoData,
    theme,
    toggleTheme,
  } = useTaskContext();

  const myPendingTasksCount = tasks.filter(
    (t) =>
      (t.assigneeId === currentUser?.id || t.assigneeIds?.includes(currentUser?.id || '')) &&
      t.status !== 'done'
  ).length;

  return (
    <header className="bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/[0.06] sticky top-0 z-30 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors duration-200">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('board')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <CheckSquare2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  Tarefus
                </span>
                <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Simples & Direto
                </span>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.05] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'board'
                    ? 'bg-white dark:bg-[#151D2C] text-slate-900 dark:text-white shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
                    ? 'bg-white dark:bg-[#151D2C] text-slate-900 dark:text-white shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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

          {/* Right Section: Theme Toggle, Reset, "+ Nova Tarefa", User Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="p-2 text-slate-500 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-amber-400/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:border-white/[0.06] dark:bg-white/[0.03]"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de exemplo do sistema?')) {
                  resetDemoData();
                }
              }}
              title="Restaurar dados de exemplo iniciais"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Exemplo</span>
            </button>

            {/* "+ Nova Tarefa" Primary Button */}
            <button
              type="button"
              onClick={() => openTaskModal(null, 'todo')}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Criar</span>
            </button>

            {/* Active User Switcher Pill */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 p-1.5 pl-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl border border-slate-200 dark:border-white/[0.08] dark:bg-white/[0.02] transition-all text-left cursor-pointer"
                title="Clique para trocar de usuário ou gerenciar equipe"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${currentUser.avatarColor}`}
                >
                  {currentUser.initials}
                </div>
                <div className="hidden sm:block leading-tight pr-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
                    {currentUser.role.split('&')[0]}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-center gap-2 pb-2.5 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'board'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400'
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
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Minhas Tarefas ({myPendingTasksCount})</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Board Areas Navigation (only visible in 'board' view) */}
      {activeTab === 'board' && (
        <div className="bg-slate-50/90 dark:bg-[#0D121F]/90 backdrop-blur-md border-t border-slate-200/70 dark:border-white/[0.05] px-4 sm:px-6 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Áreas:
            </span>

            {/* "Todas as Áreas" Button */}
            <button
              type="button"
              onClick={() => setSelectedBoardId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedBoardId === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-[#121826] text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#1A2234] border border-slate-200 dark:border-white/[0.06]'
              }`}
            >
              🏢 Todas as Áreas ({tasks.length})
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
                      : 'bg-white dark:bg-[#121826] text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-[#1A2234] border border-slate-200 dark:border-white/[0.06]'
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

            {/* "+ Novo Quadro" Button */}
            <button
              type="button"
              onClick={() => setIsBoardModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-colors ml-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Novo Quadro</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
