import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import type { Task, TaskStatus } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatDueDate, getBoardColorStyles } from '../utils/helpers';

export const MyTasksView: React.FC = () => {
  const {
    tasks,
    boards,
    users,
    currentUser,
    openTaskModal,
    toggleTaskComplete,
    updateTask,
  } = useTaskContext();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'today' | 'done'>('all');

  if (!currentUser) return null;

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => {
    const taskAssigneeIds = t.assigneeIds || (t.assigneeId ? [t.assigneeId] : []);
    return taskAssigneeIds.includes(currentUser.id);
  });

  const todoTasks = myTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = myTasks.filter((t) => t.status === 'done');
  const pendingTasks = myTasks.filter((t) => t.status !== 'done');

  const todayTasks = myTasks.filter((t) => {
    if (t.status === 'done') return false;
    const { isToday, isOverdue } = formatDueDate(t.dueDate);
    return isToday || isOverdue;
  });

  const displayedTasks = myTasks.filter((t) => {
    if (activeFilter === 'pending') return t.status !== 'done';
    if (activeFilter === 'today') {
      const { isToday, isOverdue } = formatDueDate(t.dueDate);
      return (isToday || isOverdue) && t.status !== 'done';
    }
    if (activeFilter === 'done') return t.status === 'done';
    return true;
  });

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  return (
    <div className="flex flex-col flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-[#131B2E] to-slate-900 dark:from-[#0F172A] dark:via-[#161F32] dark:to-[#0B101D] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800/60 dark:border-white/[0.08] mb-6 relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-md border-2 border-white/20 shrink-0 ${currentUser.avatarColor}`}
            >
              {currentUser.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Olá, {currentUser.name.split(' ')[0]}!
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Meu Espaço
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentUser.role} • Você tem{' '}
                <strong className="text-white font-semibold">{pendingTasks.length}</strong> {pendingTasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => openTaskModal(null, 'todo')}
            className="self-start sm:self-auto px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 hover:shadow-indigo-500/25 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Tarefa</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveFilter('today')}
            className={`text-left p-3 rounded-2xl transition-all cursor-pointer border border-transparent ${
              activeFilter === 'today'
                ? 'bg-white/20 ring-2 ring-amber-400'
                : 'bg-white/5 hover:bg-white/10 dark:hover:bg-white/[0.08] dark:border-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">
                Hoje / Atrasadas
              </span>
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{todayTasks.length}</p>
          </button>

          <button
            onClick={() => setActiveFilter('pending')}
            className={`text-left p-3 rounded-2xl transition-all cursor-pointer border border-transparent ${
              activeFilter === 'pending'
                ? 'bg-white/20 ring-2 ring-blue-400'
                : 'bg-white/5 hover:bg-white/10 dark:hover:bg-white/[0.08] dark:border-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-blue-300 uppercase tracking-wider">
                Fazendo
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{inProgressTasks.length}</p>
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`text-left p-3 rounded-2xl transition-all cursor-pointer border border-transparent ${
              activeFilter === 'all'
                ? 'bg-white/20 ring-2 ring-slate-400'
                : 'bg-white/5 hover:bg-white/10 dark:hover:bg-white/[0.08] dark:border-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">
                A Fazer
              </span>
              <Circle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{todoTasks.length}</p>
          </button>

          <button
            onClick={() => setActiveFilter('done')}
            className={`text-left p-3 rounded-2xl transition-all cursor-pointer border border-transparent ${
              activeFilter === 'done'
                ? 'bg-white/20 ring-2 ring-emerald-400'
                : 'bg-white/5 hover:bg-white/10 dark:hover:bg-white/[0.08] dark:border-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">
                Concluídas
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{doneTasks.length}</p>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.05] rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-[#151D2C] text-slate-900 dark:text-white shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Todas ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-white dark:bg-[#151D2C] text-slate-900 dark:text-white shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Pendentes ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'today'
                ? 'bg-white dark:bg-[#151D2C] text-amber-900 dark:text-amber-300 shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Hoje / Atrasadas ({todayTasks.length})
          </button>
          <button
            onClick={() => setActiveFilter('done')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'done'
                ? 'bg-white dark:bg-[#151D2C] text-emerald-900 dark:text-emerald-300 shadow-xs dark:shadow-md dark:border dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Concluídas ({doneTasks.length})
          </button>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          Exibindo {displayedTasks.length} {displayedTasks.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {displayedTasks.length === 0 ? (
          <div className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {activeFilter === 'done'
                ? 'Nenhuma tarefa concluída ainda'
                : 'Tudo em dia por aqui!'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              {activeFilter === 'done'
                ? 'Quando você concluir suas atividades, elas aparecerão aqui.'
                : 'Você não tem tarefas pendentes com esse filtro selecionado.'}
            </p>
            {activeFilter !== 'done' && (
              <button
                onClick={() => openTaskModal(null, 'todo')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                + Criar nova tarefa
              </button>
            )}
          </div>
        ) : (
          displayedTasks.map((task) => {
            const board = boards.find((b) => b.id === task.boardId);
            const isDone = task.status === 'done';
            const { label: dateLabel, isOverdue, isToday } = formatDueDate(task.dueDate);
            const checklistTotal = task.checklist.length;
            const checklistCompleted = task.checklist.filter((i) => i.completed).length;
            const boardStyles = board ? getBoardColorStyles(board.color) : null;

            const taskAssigneeIds = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);
            const assignees = users.filter((u) => taskAssigneeIds.includes(u.id));
            const otherAssignees = assignees.filter((u) => u.id !== currentUser.id);

            return (
              <div
                key={task.id}
                onClick={() => openTaskModal(task)}
                className={`group bg-white dark:bg-[#151D2C] rounded-2xl p-4 border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/70 dark:bg-[#101724]/60 border-slate-200 dark:border-white/[0.04] opacity-80'
                    : 'border-slate-200/90 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-[#192336]'
                }`}
              >
                {/* Left part: Checkbox + Title + Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Quick Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    title={isDone ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:bg-white/[0.03] text-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {board && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                            boardStyles?.bg || 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.06]'
                          }`}
                        >
                          {board.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                            isDone
                              ? 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-slate-500 border-transparent dark:border-white/[0.04]'
                              : isOverdue
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/25 font-semibold'
                              : isToday
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/25 font-semibold'
                              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 border-transparent dark:border-white/[0.05]'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {dateLabel}
                        </span>
                      )}

                      {otherAssignees.length > 0 && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
                          title={`Dividida com: ${otherAssignees.map((a) => a.name).join(', ')}`}
                        >
                          <span className="flex items-center -space-x-1">
                            {otherAssignees.slice(0, 2).map((a) => (
                              <span
                                key={a.id}
                                className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center ring-1 ring-white dark:ring-[#151D2C] ${
                                  a.avatarColor || 'bg-indigo-600'
                                }`}
                              >
                                {a.initials}
                              </span>
                            ))}
                          </span>
                          <span>+{otherAssignees.length} co-responsável</span>
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}

                    {checklistTotal > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>
                          {checklistCompleted} de {checklistTotal} subitens concluídos
                        </span>
                        <div className="w-20 bg-slate-100 dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden ml-1">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{
                              width: `${(checklistCompleted / checklistTotal) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right part: Status selector & Action */}
                <div
                  className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06] shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-hidden cursor-pointer transition-all ${
                      task.status === 'todo'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/25'
                        : task.status === 'in_progress'
                        ? 'bg-blue-50 dark:bg-sky-500/10 text-blue-800 dark:text-sky-300 border-blue-200 dark:border-sky-500/25'
                        : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/25'
                    }`}
                  >
                    <option value="todo" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">A Fazer</option>
                    <option value="in_progress" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">Fazendo</option>
                    <option value="done" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">Concluída</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => openTaskModal(task)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                    title="Ver detalhes"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
