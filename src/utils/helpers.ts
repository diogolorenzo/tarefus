export interface DueDateInfo {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isUpcoming: boolean; // Due today, tomorrow, or within next 3 days
  diffDays: number;
  urgency: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'normal' | 'none';
  badgeClasses: string;
}

export const formatDueDate = (dateString?: string): DueDateInfo => {
  if (!dateString) {
    return {
      label: '',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      diffDays: 999,
      urgency: 'none',
      badgeClasses: '',
    };
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      label: 'Hoje',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      isUpcoming: true,
      diffDays,
      urgency: 'today',
      badgeClasses: 'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 ring-1 ring-amber-400/30 font-semibold',
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Amanhã',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      isUpcoming: true,
      diffDays,
      urgency: 'tomorrow',
      badgeClasses: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/25 font-medium',
    };
  }

  if (diffDays === 2) {
    return {
      label: 'Em 2 dias',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: true,
      diffDays,
      urgency: 'upcoming',
      badgeClasses: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25 font-medium',
    };
  }

  if (diffDays === 3) {
    return {
      label: 'Em 3 dias',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      isUpcoming: true,
      diffDays,
      urgency: 'upcoming',
      badgeClasses: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/25 font-medium',
    };
  }

  if (diffDays === -1) {
    return {
      label: 'Ontem (Atrasada)',
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      diffDays,
      urgency: 'overdue',
      badgeClasses: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold',
    };
  }

  if (diffDays < -1) {
    return {
      label: `${Math.abs(diffDays)} dias atrasada`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      isUpcoming: false,
      diffDays,
      urgency: 'overdue',
      badgeClasses: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold',
    };
  }

  // Format as DD/MM for future dates (> 3 days)
  const formatted = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
  return {
    label: formatted,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    isUpcoming: false,
    diffDays,
    urgency: 'normal',
    badgeClasses: 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.06] font-medium',
  };
};

export const getBoardColorStyles = (color: string) => {
  switch (color) {
    case 'emerald':
    case 'green':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25',
        pill: 'bg-emerald-500',
        activeTab: 'bg-emerald-600 text-white shadow-emerald-200 dark:bg-emerald-600 dark:text-white dark:shadow-emerald-950/50',
      };
    case 'blue':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25',
        pill: 'bg-blue-600',
        activeTab: 'bg-blue-600 text-white shadow-blue-200 dark:bg-blue-600 dark:text-white dark:shadow-blue-950/50',
      };
    case 'violet':
    case 'purple':
      return {
        bg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/25',
        pill: 'bg-violet-600',
        activeTab: 'bg-violet-600 text-white shadow-violet-200 dark:bg-violet-600 dark:text-white dark:shadow-violet-950/50',
      };
    case 'amber':
    case 'yellow':
    case 'orange':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25',
        pill: 'bg-amber-500',
        activeTab: 'bg-amber-600 text-white shadow-amber-200 dark:bg-amber-600 dark:text-white dark:shadow-amber-950/50',
      };
    case 'rose':
    case 'red':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25',
        pill: 'bg-rose-500',
        activeTab: 'bg-rose-600 text-white shadow-rose-200 dark:bg-rose-600 dark:text-white dark:shadow-rose-950/50',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-white/10',
        pill: 'bg-slate-500',
        activeTab: 'bg-slate-800 text-white shadow-slate-200 dark:bg-slate-100 dark:text-slate-900',
      };
  }
};
