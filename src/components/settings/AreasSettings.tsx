import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { canDeleteBoard, canCreateBoard, canEditBoard } from '../../utils/rbac';
import type { Board } from '../../types';
import { BoardEditModal } from './BoardEditModal';
import {
  LayoutGrid,
  Building2,
  Folder,
  Briefcase,
  Shield,
  Zap,
  BarChart3,
  Layers,
  Globe,
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getBoardColorStyles } from '../../utils/helpers';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  LayoutGrid,
  Folder,
  Briefcase,
  Shield,
  Zap,
  BarChart3,
  Layers,
  Globe,
  Tag,
};

export const AreasSettings: React.FC = () => {
  const { boards, tasks, currentUser, deleteBoard } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = () => {
    if (!canCreateBoard(currentUser)) return;
    setSelectedBoard(null);
    setIsModalOpen(true);
  };

  const handleEdit = (board: Board) => {
    if (!canEditBoard(currentUser, board)) return;
    setSelectedBoard(board);
    setIsModalOpen(true);
  };

  const handleDelete = (board: Board) => {
    if (!canDeleteBoard(currentUser) || boards.length <= 1) return;

    const boardTasks = tasks.filter((t) => t.boardId === board.id);
    const otherBoard = boards.find((b) => b.id !== board.id);
    const fallbackName = otherBoard ? otherBoard.name : 'outro quadro';

    let confirmMsg = `Deseja realmente excluir a área "${board.name}"?`;
    if (boardTasks.length > 0) {
      confirmMsg += `\n\nAs ${boardTasks.length} tarefa(s) vinculada(s) a esta área serão transferidas automaticamente para a área "${fallbackName}".`;
    }

    if (window.confirm(confirmMsg)) {
      deleteBoard(board.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-line">
        <div>
          <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Áreas & Quadros</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Cadastre, edite e organize os setores da empresa e seus fluxos de tarefas
          </p>
        </div>

        {canCreateBoard(currentUser) && (
          <button
            type="button"
            onClick={handleCreate}
            className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nova Área</span>
          </button>
        )}
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-9.5 pr-4 py-2 bg-surface border border-line rounded-xl text-xs font-semibold text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500"
          />
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 text-xs text-muted self-end sm:self-auto">
          <span>
            Total: <strong className="text-ink">{boards.length}</strong> {boards.length === 1 ? 'área' : 'áreas'}
          </span>
          <span>•</span>
          <span>
            <strong className="text-ink">{tasks.length}</strong> {tasks.length === 1 ? 'tarefa' : 'tarefas'} no sistema
          </span>
        </div>
      </div>

      {/* Areas Grid */}
      {filteredBoards.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-3xl border border-slate-200/80 dark:border-white/[0.08]">
          <LayoutGrid className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-ink">Nenhuma área encontrada</h4>
          <p className="text-xs text-subtle mt-1">
            Tente outro termo de busca ou crie uma nova área.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredBoards.map((board) => {
            const taskCount = tasks.filter((t) => t.boardId === board.id).length;
            const completedCount = tasks.filter((t) => t.boardId === board.id && t.status === 'done').length;
            const styles = getBoardColorStyles(board.color);
            const IconComponent = ICON_MAP[board.icon] || Folder;
            const isOnlyBoard = boards.length <= 1;

            return (
              <div
                key={board.id}
                className="bg-surface rounded-3xl p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.14] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Icon + Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-2.5 rounded-2xl border ${styles.bg} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      {canEditBoard(currentUser, board) && (
                        <button
                          type="button"
                          onClick={() => handleEdit(board)}
                          title="Editar / Renomear Área"
                          className="p-2 text-subtle hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {canDeleteBoard(currentUser) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(board)}
                          disabled={isOnlyBoard}
                          title={
                            isOnlyBoard
                              ? 'Mínimo de 1 área obrigatória no sistema'
                              : 'Excluir área'
                          }
                          className={`p-2 rounded-xl transition-colors ${
                            isOnlyBoard
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                              : 'text-subtle hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-ink group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {board.name}
                  </h3>

                  <p className="text-xs text-muted mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                    {board.description || 'Sem descrição definida para este setor.'}
                  </p>
                </div>

                {/* Footer: Metrics Badges */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                    <span className={`w-2 h-2 rounded-full ${styles.pill}`} />
                    <span>{taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}</span>
                  </div>

                  {taskCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completedCount}/{taskCount} concluídas</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Notice about minimum area */}
      {boards.length <= 1 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            O sistema requer ao menos uma área ativa. Para excluir esta área, cadastre uma nova área substituta primeiro.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <BoardEditModal
          key={selectedBoard ? `edit-${selectedBoard.id}` : 'new-board'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          board={selectedBoard}
        />
      )}
    </div>
  );
};
