import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useTaskContext } from '../context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import type { TaskStatus } from '../types';
import { Search, UserCheck, X } from 'lucide-react';
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
      {/* Board Title & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isAllBoards ? 'Todos os Quadros da Empresa' : currentBoard?.name}
            </h1>
            {!isAllBoards && currentBoard && (
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${boardStyles?.bg}`}
              >
                {filteredTasks.length} tarefas
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isAllBoards
              ? 'Visão geral de todas as áreas e departamentos em um só lugar.'
              : currentBoard?.description || 'Quadro de atividades e demandas da equipe.'}
          </p>
        </div>

        {/* Search & Assignee Filter */}
        <div id="tour-filters-bar" className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tarefa ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Assignee Filter Dropdown */}
          <div className="relative">
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-2xs cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">Todos os Colaboradores</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">
                  {u.name}
                </option>
              ))}
            </select>
            <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAssignee('all');
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtros
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
