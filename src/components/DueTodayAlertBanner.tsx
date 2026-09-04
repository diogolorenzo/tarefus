import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { formatDueDate } from '../utils/helpers';
import { Flame, ArrowRight, X, Calendar } from 'lucide-react';

export const DueTodayAlertBanner: React.FC = () => {
  const { tasks, currentUser, openTaskModal, setActiveTab } = useTaskContext();
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([]);

  // Filter tasks due today that are not done
  const tasksDueToday = tasks.filter((t) => {
    if (t.status === 'done') return false;
    const info = formatDueDate(t.dueDate);
    return info.isToday;
  });

  const myTasksDueToday = tasksDueToday.filter((t) => {
    if (!currentUser) return true;
    const taskAssigneeIds = t.assigneeIds || (t.assigneeId ? [t.assigneeId] : []);
    return taskAssigneeIds.includes(currentUser.id);
  });

  const activeTaskIdsKey = tasksDueToday.map((t) => t.id).sort().join('-');
  const currentBannerKey = `${currentUser?.id || 'all'}-${activeTaskIdsKey}`;
  const isDismissed = dismissedKeys.includes(currentBannerKey);

  if (isDismissed || tasksDueToday.length === 0) {
    return null;
  }

  const firstTask = myTasksDueToday[0] || tasksDueToday[0];
  const count = myTasksDueToday.length > 0 ? myTasksDueToday.length : tasksDueToday.length;
  const isMine = myTasksDueToday.length > 0;

  const handleDismiss = () => {
    setDismissedKeys((prev) => [...prev, currentBannerKey]);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 pb-1">
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 dark:from-amber-500/15 dark:via-amber-500/10 dark:to-orange-500/15 border border-amber-300/80 dark:border-amber-500/30 rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 shadow-xs animate-slide-up">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                {isMine
                  ? `Você tem ${count} ${count === 1 ? 'tarefa com vencimento para hoje' : 'tarefas com vencimento para hoje'}!`
                  : `Há ${count} ${count === 1 ? 'tarefa na equipe que vence hoje' : 'tarefas na equipe que vencem hoje'}!`}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-500/20 px-2 py-0.2 rounded-full border border-amber-300 dark:border-amber-500/30">
                <Calendar className="w-2.5 h-2.5" /> Prazo Hoje
              </span>
            </div>
            {firstTask && (
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 truncate mt-0.5">
                Destaque: <strong className="font-semibold text-amber-950 dark:text-amber-100">{firstTask.title}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isMine) {
                setActiveTab('my-tasks');
              } else if (firstTask) {
                openTaskModal(firstTask);
              }
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <span>{isMine ? 'Ver Minhas Tarefas' : 'Ver Tarefa'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dispensar aviso"
            title="Dispensar aviso de vencimento de hoje"
            className="p-1 text-amber-800/70 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-200/40 dark:hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
