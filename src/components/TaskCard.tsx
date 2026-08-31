import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';
import { formatDueDate, getBoardColorStyles } from '../utils/helpers';
import { Check, Calendar, CheckSquare, AlignLeft, AlertCircle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  showBoardBadge?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, showBoardBadge = false }) => {
  const { users, boards, toggleTaskComplete, openTaskModal } = useTaskContext();

  const taskAssigneeIds = task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []);
  const assignees = users.filter((u) => taskAssigneeIds.includes(u.id));
  const board = boards.find((b) => b.id === task.boardId);
  const isDone = task.status === 'done';

  const dueInfo = formatDueDate(task.dueDate);

  const checklistTotal = task.checklist.length;
  const checklistCompleted = task.checklist.filter((item) => item.completed).length;

  const boardStyles = board ? getBoardColorStyles(board.color) : null;

  const visibleAssignees = assignees.slice(0, 3);
  const extraAssigneesCount = assignees.length - visibleAssignees.length;
  const assigneesTooltip =
    assignees.length > 0
      ? `Responsáveis (${assignees.length}): ${assignees.map((a) => `${a.name} (${a.role.split('&')[0].trim()})`).join(', ')}`
      : 'Sem responsável atribuído';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => openTaskModal(task)}
          className={`group relative bg-white dark:bg-[#151D2C] rounded-xl p-4 border transition-all duration-200 cursor-grab active:cursor-grabbing select-none overflow-hidden ${
            snapshot.isDragging
              ? 'shadow-2xl ring-2 ring-indigo-500 border-indigo-400 rotate-1 scale-102 z-50 bg-white dark:bg-[#1E293B] dark:ring-indigo-400 dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)]'
              : 'shadow-xs hover:shadow-lg dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6),0_0_0_1px_rgba(99,102,241,0.25)] border-slate-200/90 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-[#192336]'
          } ${isDone ? 'bg-slate-50/70 dark:bg-[#101724]/60 border-slate-200 dark:border-white/[0.04]' : ''} ${
            !isDone && dueInfo.isToday ? 'ring-1 ring-amber-400/40 dark:ring-amber-500/30' : ''
          }`}
        >
          {/* Left indicator stripe for urgent/today tasks */}
          {!isDone && dueInfo.isToday && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500 dark:bg-amber-400" />
          )}
          {!isDone && dueInfo.isOverdue && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500 dark:bg-rose-400" />
          )}

          {/* Top Row: Board Tag & Quick Complete Checkbox */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {showBoardBadge && board && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    boardStyles?.bg || 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  {board.name}
                </span>
              )}

              {/* Due Today Quick Tag */}
              {!isDone && dueInfo.isToday && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Vence Hoje
                </span>
              )}
            </div>

            {/* Quick Complete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskComplete(task.id);
              }}
              title={isDone ? 'Marcar como não concluída' : 'Marcar como concluída'}
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                isDone
                  ? 'bg-emerald-500 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-600 text-white shadow-xs'
                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:bg-white/[0.03] text-transparent hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Title */}
          <h4
            className={`text-sm font-semibold leading-snug break-words transition-colors ${
              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
            }`}
          >
            {task.title}
          </h4>

          {/* Description Excerpt */}
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Card Footer: Badges (Prazo, Checklist, Assignee) */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Due Date Badge */}
              {task.dueDate && (
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${
                    isDone
                      ? 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-slate-500 border-transparent dark:border-white/[0.04]'
                      : dueInfo.badgeClasses
                  }`}
                >
                  {!isDone && dueInfo.isToday ? (
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  ) : !isDone && dueInfo.isOverdue ? (
                    <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Calendar className="w-3 h-3" />
                  )}
                  <span>{dueInfo.label}</span>
                </div>
              )}

              {/* Checklist Count Badge */}
              {checklistTotal > 0 && (
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium text-[11px] border ${
                    checklistCompleted === checklistTotal
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25'
                      : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] border-transparent dark:border-white/[0.05]'
                  }`}
                  title={`${checklistCompleted} de ${checklistTotal} subitens concluídos`}
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>
                    {checklistCompleted}/{checklistTotal}
                  </span>
                </div>
              )}

              {/* Has description icon if no text preview */}
              {task.description && (
                <span className="text-slate-400 dark:text-slate-500" title="Possui descrição detalhada">
                  <AlignLeft className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Assignees Avatar Stack */}
            {assignees.length > 0 && (
              <div
                className="flex items-center -space-x-1.5 shrink-0 overflow-hidden py-0.5"
                title={assigneesTooltip}
              >
                {visibleAssignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs ring-2 ring-white dark:ring-[#151D2C] shrink-0 ${
                      assignee.avatarColor || 'bg-indigo-600'
                    }`}
                  >
                    {assignee.initials}
                  </div>
                ))}
                {extraAssigneesCount > 0 && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-700 dark:bg-slate-700 text-white shadow-2xs ring-2 ring-white dark:ring-[#151D2C] shrink-0">
                    +{extraAssigneesCount}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
