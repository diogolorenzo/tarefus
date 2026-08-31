import React, { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { formatDueDate } from '../utils/helpers';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ExternalLink,
  Flame,
  CheckCheck,
} from 'lucide-react';
import type { Task } from '../types';

export const NotificationCenter: React.FC = () => {
  const {
    tasks,
    boards,
    currentUser,
    openTaskModal,
    toggleTaskComplete,
    showToast,
  } = useTaskContext();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'today' | 'overdue' | 'upcoming' | 'all'>('today');
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter tasks with deadlines that are NOT done
  const pendingTasksWithDueDate = tasks.filter((t) => t.status !== 'done' && t.dueDate);

  // Category splits
  const tasksDueToday = pendingTasksWithDueDate.filter((t) => {
    const info = formatDueDate(t.dueDate);
    return info.isToday;
  });

  const tasksOverdue = pendingTasksWithDueDate.filter((t) => {
    const info = formatDueDate(t.dueDate);
    return info.isOverdue;
  });

  const tasksUpcoming = pendingTasksWithDueDate.filter((t) => {
    const info = formatDueDate(t.dueDate);
    return info.isUpcoming && !info.isToday;
  });

  // Filter based on active tab
  const getFilteredTasks = (): Task[] => {
    switch (activeFilter) {
      case 'today':
        return tasksDueToday;
      case 'overdue':
        return tasksOverdue;
      case 'upcoming':
        return tasksUpcoming;
      case 'all':
      default:
        return pendingTasksWithDueDate.filter((t) => {
          const info = formatDueDate(t.dueDate);
          return info.isToday || info.isOverdue || info.isUpcoming;
        });
    }
  };

  const currentDisplayList = getFilteredTasks().filter((t) => !dismissedTaskIds.includes(t.id));

  // Urgent count = tasks due today + tasks overdue
  const urgentCount = tasksDueToday.length + tasksOverdue.length;
  const hasTasksToday = tasksDueToday.length > 0;

  const handleDismissAll = () => {
    const allIds = pendingTasksWithDueDate.map((t) => t.id);
    setDismissedTaskIds((prev) => Array.from(new Set([...prev, ...allIds])));
    showToast('Notificações de prazos silenciadas temporariamente.', 'info');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Central de Notificações de Prazos"
        aria-expanded={isOpen}
        title={
          hasTasksToday
            ? `Você tem ${tasksDueToday.length} tarefa(s) que vencem hoje!`
            : urgentCount > 0
            ? `${urgentCount} tarefas exigem sua atenção`
            : 'Nenhuma notificação urgente'
        }
        className={`relative p-2 rounded-xl transition-all cursor-pointer border ${
          hasTasksToday
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300/60 dark:border-amber-500/30 hover:bg-amber-500/20'
            : urgentCount > 0
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300/60 dark:border-rose-500/30 hover:bg-rose-500/20'
            : 'text-muted hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] border-transparent'
        }`}
      >
        <Bell className="w-4 h-4" />

        {/* Badge counter */}
        {urgentCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-xs ${
              hasTasksToday ? 'bg-amber-500 ring-2 ring-white dark:ring-[#090D16]' : 'bg-rose-500 ring-2 ring-white dark:ring-[#090D16]'
            }`}
          >
            {urgentCount}
          </span>
        )}

        {/* Pulsing beacon if due today */}
        {hasTasksToday && (
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-[-48px] sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-sm sm:w-96 bg-surface border border-slate-200 dark:border-white/[0.09] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-line bg-slate-50/70 dark:bg-[#151D2C]/70 backdrop-blur-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink leading-tight flex items-center gap-1.5">
                  Notificações & Prazos
                  {tasksDueToday.length > 0 && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-amber-500 text-white rounded-full">
                      {tasksDueToday.length} hoje
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-muted">
                  Acompanhe vencimentos de hoje e próximos dias
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="p-2.5 bg-slate-100/60 dark:bg-white/[0.02] border-b border-line flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('today')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'today'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-muted hover:bg-slate-200 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Vencem Hoje ({tasksDueToday.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('overdue')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-muted hover:bg-slate-200 dark:hover:bg-white/[0.06]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Atrasadas ({tasksOverdue.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('upcoming')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeFilter === 'upcoming'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-muted hover:bg-slate-200 dark:hover:bg-white/[0.06]'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Próximas ({tasksUpcoming.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-muted hover:bg-slate-200 dark:hover:bg-white/[0.06]'
              }`}
            >
              Todas ({pendingTasksWithDueDate.length})
            </button>
          </div>

          {/* List of Tasks */}
          <div className="divide-y divide-slate-100 dark:divide-white/[0.05] overflow-y-auto max-h-80">
            {currentDisplayList.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-ink">
                  {activeFilter === 'today'
                    ? 'Nenhuma tarefa com vencimento para hoje!'
                    : activeFilter === 'overdue'
                    ? 'Nenhuma tarefa atrasada!'
                    : 'Nenhuma tarefa encontrada nesta categoria.'}
                </p>
                <p className="text-[11px] text-subtle mt-0.5">
                  Tudo organizado e em dia.
                </p>
              </div>
            ) : (
              currentDisplayList.map((task) => {
                const board = boards.find((b) => b.id === task.boardId);
                const info = formatDueDate(task.dueDate);
                const isAssignedToMe =
                  currentUser &&
                  (task.assigneeIds?.includes(currentUser.id) || task.assigneeId === currentUser.id);

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] flex items-start gap-3 group ${
                      info.isToday ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]' : ''
                    }`}
                  >
                    {/* Quick Complete Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      title="Marcar como concluída"
                      className="mt-0.5 w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-transparent hover:text-emerald-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                    </button>

                    {/* Task Info Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        openTaskModal(task);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {/* Due Date Indicator Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${info.badgeClasses}`}
                        >
                          {info.isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{info.isToday ? 'VENCE HOJE' : info.label}</span>
                        </span>

                        {/* Board Name */}
                        {board && (
                          <span className="text-[10px] text-muted font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.05] rounded-md">
                            {board.name}
                          </span>
                        )}

                        {isAssignedToMe && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                            Minha tarefa
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-ink leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {task.title}
                      </h4>
                    </div>

                    {/* Open details arrow button */}
                    <button
                      type="button"
                      onClick={() => {
                        openTaskModal(task);
                        setIsOpen(false);
                      }}
                      title="Abrir detalhes"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with summary and dismiss */}
          <div className="p-2.5 border-t border-line bg-slate-50/70 dark:bg-[#151D2C]/70 text-[11px] flex items-center justify-between">
            <span className="text-muted font-medium">
              {pendingTasksWithDueDate.length} pendentes com prazo
            </span>
            {pendingTasksWithDueDate.length > 0 && (
              <button
                type="button"
                onClick={handleDismissAll}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                Limpar alertas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
