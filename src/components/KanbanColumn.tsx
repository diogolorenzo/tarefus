import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import type { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { useTaskContext } from '../context/TaskContext';
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  showBoardBadge?: boolean;
}

const COLUMN_CONFIG: Record<
  TaskStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    dropActiveBg: string;
  }
> = {
  todo: {
    icon: Circle,
    accentColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-500/20',
    dropActiveBg: 'bg-amber-50/50 dark:bg-amber-500/[0.04] border-amber-300 dark:border-amber-500/40 ring-2 ring-amber-400/20',
  },
  in_progress: {
    icon: Clock,
    accentColor: 'text-blue-600 dark:text-sky-400',
    badgeBg: 'bg-blue-100 dark:bg-sky-500/10 text-blue-800 dark:text-sky-300 border border-transparent dark:border-sky-500/20',
    dropActiveBg: 'bg-blue-50/50 dark:bg-sky-500/[0.04] border-blue-300 dark:border-sky-500/40 ring-2 ring-sky-400/20',
  },
  done: {
    icon: CheckCircle2,
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-500/20',
    dropActiveBg: 'bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-emerald-300 dark:border-emerald-500/40 ring-2 ring-emerald-400/20',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  showBoardBadge = false,
}) => {
  const { openTaskModal } = useTaskContext();
  const config = COLUMN_CONFIG[id];
  const Icon = config.icon;

  return (
    <div className="flex flex-col w-full min-w-[280px] sm:min-w-[320px] max-w-full bg-sunken/80 rounded-2xl p-3.5 border border-line shadow-xs flex-1 transition-colors duration-200">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.accentColor}`} />
          <h3 className="text-sm font-bold text-ink tracking-tight">{title}</h3>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badgeBg}`}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => openTaskModal(null, id)}
          className="text-subtle hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-white/[0.05] p-1.5 rounded-lg transition-all cursor-pointer"
          title={`Adicionar nova tarefa em "${title}"`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2.5 min-h-[140px] p-1 rounded-xl transition-all duration-200 ${
              snapshot.isDraggingOver ? config.dropActiveBg : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                showBoardBadge={showBoardBadge}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 border-2 border-dashed border-slate-200/90 dark:border-white/[0.08] dark:bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center p-3 text-subtle text-xs">
                <span>Nenhuma tarefa aqui</span>
                <button
                  type="button"
                  onClick={() => openTaskModal(null, id)}
                  className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  + Criar tarefa
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Quick Add Button at bottom */}
      <button
        type="button"
        onClick={() => openTaskModal(null, id)}
        className="mt-2.5 py-2 px-3 border border-dashed border-line-strong hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-white/80 dark:hover:bg-white/[0.04] rounded-xl text-xs font-medium text-muted hover:text-indigo-600 dark:hover:text-indigo-300 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Adicionar tarefa</span>
      </button>
    </div>
  );
};
