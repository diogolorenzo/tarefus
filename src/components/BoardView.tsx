import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useTaskContext } from '../context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import type { TaskStatus } from '../types';
import { Search, UserCheck, X } from 'lucide-react';
import { Select } from './ui/Select';
import { getBoardColorStyles } from '../utils/helpers';

export const BoardView: React.FC = () => {
  const {
    tasks,
    boards,
    users,
    selectedBoardId,
    searchQuery,
    setSearchQuery,
    filterAssignee,
    setFilterAssignee,
    moveTask,
  } = useTaskContext();

  const currentBoard = boards.find((b) => b.id === selectedBoardId);
  const isAllBoards = selectedBoardId === 'all';

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const taskAssigneeIds = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);

    // Board filter
    if (!isAllBoards && task.boardId !== selectedBoardId) {
      return false;
    }

    // Assignee filter
    if (filterAssignee !== 'all' && !taskAssigneeIds.includes(filterAssignee)) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description?.toLowerCase().includes(query);
      const assignees = users.filter((u) => taskAssigneeIds.includes(u.id));
      const matchAssignee = assignees.some((u) => u.name.toLowerCase().includes(query));

      if (!matchTitle && !matchDesc && !matchAssignee) {
        return false;
      }
    }

    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destinationStatus = destination.droppableId as TaskStatus;
    moveTask(draggableId, destinationStatus, destination.index);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || filterAssignee !== 'all';
  const boardStyles = currentBoard ? getBoardColorStyles(currentBoard.color) : null;

  return (
    <div className="flex flex-col flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
      {/* Barra única: contexto do quadro à esquerda, filtros à direita.
          O nome do quadro já aparece selecionado na sub-barra da Navbar, então
          aqui ele é um rótulo discreto — não um título de página. */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-bold text-ink tracking-tight truncate">
            {isAllBoards ? 'Todas as áreas' : currentBoard?.name}
          </h1>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border tnum ${
              !isAllBoards && boardStyles ? boardStyles.bg : 'bg-sunken border-line text-muted'
            }`}
          >
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
          {currentBoard?.description && (
            <span
              className="hidden lg:block text-xs text-muted truncate"
              title={currentBoard.description}
            >
              · {currentBoard.description}
            </span>
          )}
        </div>

        {/* Busca & filtro por responsável */}
        <div id="tour-filters-bar" className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tarefa ou pessoa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-surface border border-line rounded-xl text-xs sm:text-sm text-ink placeholder:text-subtle hover:border-line-strong focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle hover:text-ink cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select
            value={filterAssignee}
            onChange={setFilterAssignee}
            icon={UserCheck}
            size="sm"
            ariaLabel="Filtrar por responsável"
            wrapperClassName="w-full sm:w-52"
            options={[
              { value: 'all', label: 'Todos os colaboradores' },
              ...users.map((u) => ({ value: u.id, label: u.name, hint: u.role })),
            ]}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterAssignee('all');
              }}
              className="text-xs text-muted hover:text-ink font-medium px-2 py-1.5 hover:bg-sunken rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board with 3 Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div id="tour-kanban-board" className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start overflow-x-auto pb-6">
          <KanbanColumn
            id="todo"
            title="A Fazer"
            tasks={todoTasks}
            showBoardBadge={isAllBoards}
          />
          <KanbanColumn
            id="in_progress"
            title="Fazendo"
            tasks={inProgressTasks}
            showBoardBadge={isAllBoards}
          />
          <KanbanColumn
            id="done"
            title="Concluído"
            tasks={doneTasks}
            showBoardBadge={isAllBoards}
          />
        </div>
      </DragDropContext>
    </div>
  );
};
