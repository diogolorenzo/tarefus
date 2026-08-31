import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { TaskAICreator } from './TaskAICreator';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { ChecklistItem, Task, TaskStatus } from '../types';
import {
  X,
  Trash2,
  Calendar,
  CheckSquare,
  Plus,
  AlignLeft,
  Building2,
  Users,
  Clock,
  Check,
  Edit3,
  Mic,
  MicOff,
} from 'lucide-react';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { AiMark } from './ui/AiMark';
import { formatDueDate } from '../utils/helpers';

interface TaskModalFormProps {
  task: Task | null;
  defaultStatus: TaskStatus;
  defaultBoardId?: string;
  onClose: () => void;
}

const TaskModalForm: React.FC<TaskModalFormProps> = ({
  task,
  defaultStatus,
  defaultBoardId,
  onClose,
}) => {
  const { boards, users, currentUser, addTask, updateTask, deleteTask } = useTaskContext();

  const isEditing = Boolean(task);

  // Tab mode: 'ai' or 'manual'
  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>(
    isEditing ? 'manual' : 'ai'
  );

  // Form State
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [boardId, setBoardId] = useState(
    task?.boardId || defaultBoardId || boards[0]?.id || ''
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || defaultStatus || 'todo');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(() => {
    if (task?.assigneeIds && task.assigneeIds.length > 0) {
      return task.assigneeIds;
    }
    if (task?.assigneeId) {
      return [task.assigneeId];
    }
    if (currentUser?.id) {
      return [currentUser.id];
    }
    return users[0]?.id ? [users[0].id] : [];
  });
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task?.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Voice dictation for title in manual mode
  const {
    isListening: isTitleListening,
    toggleListening: toggleTitleListening,
  } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setTitle(text);
    },
  });

  // Voice dictation for description in manual mode
  const {
    isListening: isDescListening,
    toggleListening: toggleDescListening,
  } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setDescription(text);
    },
  });

  const handleToggleAssignee = (userId: string) => {
    setAssigneeIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalAssignees =
      assigneeIds.length > 0
        ? assigneeIds
        : currentUser?.id
        ? [currentUser.id]
        : users[0]?.id
        ? [users[0].id]
        : [];

    if (isEditing && task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        boardId,
        status,
        assigneeIds: finalAssignees,
        dueDate: dueDate || undefined,
        checklist,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        boardId: boardId || boards[0]?.id,
        status,
        assigneeIds: finalAssignees,
        dueDate: dueDate || undefined,
        checklist,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  // Callback when AI draft is approved directly
  const handleApproveAIDraft = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    addTask(taskData);
    onClose();
  };

  // Callback when user wants to edit AI draft in manual form
  const handleEditAISuggestion = (draft: {
    title: string;
    description: string;
    boardId: string;
    status: TaskStatus;
    assigneeIds: string[];
    dueDate: string;
    checklist: ChecklistItem[];
  }) => {
    setTitle(draft.title);
    setDescription(draft.description);
    setBoardId(draft.boardId);
    setStatus(draft.status);
    setAssigneeIds(draft.assigneeIds);
    setDueDate(draft.dueDate);
    setChecklist(draft.checklist);
    setActiveMode('manual');
  };

  return (
    <div
      className="bg-surface rounded-3xl shadow-2xl max-w-xl w-full border border-line overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-line bg-sunken/80">
        <div className="flex items-center gap-3">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === 'todo'
                ? 'bg-amber-500 shadow-xs shadow-amber-500/50'
                : status === 'in_progress'
                ? 'bg-blue-500 shadow-xs shadow-blue-500/50'
                : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
            }`}
          />
          <h3 className="text-base font-bold text-ink">
            {isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
          </h3>
        </div>

        {/* Mode Switcher Tabs (when creating new task) */}
        {!isEditing && (
          <div className="flex items-center bg-sunken p-1 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setActiveMode('ai')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'ai'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AiMark className="w-3.5 h-3.5" />
              <span>Criar com IA</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('manual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'manual'
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-subtle hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content depending on Active Mode */}
      {activeMode === 'ai' && !isEditing ? (
        <div className="flex-1 overflow-y-auto">
          <TaskAICreator
            defaultBoardId={boardId}
            defaultStatus={status}
            onApprove={handleApproveAIDraft}
            onEditSuggestion={handleEditAISuggestion}
            onSwitchToManual={() => setActiveMode('manual')}
          />
        </div>
      ) : (
        /* Manual Form */
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Title Input + Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">
                Título da Tarefa <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={toggleTitleListening}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isTitleListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
                title="Ditar título por voz"
              >
                {isTitleListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>{isTitleListening ? 'Ouvindo...' : 'Ditar título'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Entrar em contato com distribuidora Alpha..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-surface transition-all shadow-2xs placeholder:text-subtle"
            />
          </div>

          {/* Grid: Quadro (Área) & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-subtle" /> Quadro / Área
              </label>
              <Select
                value={boardId}
                onChange={setBoardId}
                ariaLabel="Quadro / Área"
                options={boards.map((b) => ({ value: b.id, label: b.name }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-subtle" /> Coluna / Status
              </label>
              <Select
                value={status}
                onChange={(v) => setStatus(v as TaskStatus)}
                ariaLabel="Coluna / Status"
                options={[
                  { value: 'todo', label: 'A Fazer' },
                  { value: 'in_progress', label: 'Fazendo' },
                  { value: 'done', label: 'Concluído' },
                ]}
              />
            </div>
          </div>

          {/* Prazo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-subtle" /> Prazo (Opcional)
              </label>
              {dueDate && (
                (() => {
                  const info = formatDueDate(dueDate);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${info.badgeClasses}`}
                    >
                      {info.isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                      <span>{info.isToday ? 'Vence Hoje' : info.label}</span>
                    </span>
                  );
                })()
              )}
            </div>
            <DatePicker
              value={dueDate}
              onChange={setDueDate}
              ariaLabel="Prazo da tarefa"
              wrapperClassName="sm:max-w-xs"
            />
          </div>

          {/* Responsáveis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-subtle" />
                Responsáveis
                <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                  {assigneeIds.length} {assigneeIds.length === 1 ? 'selecionado' : 'selecionados'}
                </span>
              </label>
              <span className="text-[11px] text-subtle">
                Clique nos colaboradores para marcar/desmarcar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-sunken/70 p-2.5 rounded-2xl border border-line">
              {users.map((u) => {
                const isSelected = assigneeIds.includes(u.id);

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleToggleAssignee(u.id)}
                    className={`flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-white dark:bg-[#192336] border-indigo-500/80 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white/60 dark:bg-[#131B2B]/60 border-line hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white dark:hover:bg-[#192336]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0 ${
                          u.avatarColor || 'bg-indigo-600'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-ink truncate leading-tight">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-muted truncate leading-tight">
                          {u.role.split('&')[0]}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-white/[0.15] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description + Voice Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                <AlignLeft className="w-3.5 h-3.5 text-subtle" /> Descrição ou Observações
              </label>
              <button
                type="button"
                onClick={toggleDescListening}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isDescListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
                title="Ditar descrição por voz"
              >
                {isDescListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>{isDescListening ? 'Ouvindo...' : 'Ditar descrição'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Adicione detalhes, links ou instruções para quem vai executar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-sunken border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-surface transition-all shadow-2xs resize-none placeholder:text-subtle"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-subtle" /> Checklist (Subitens)
              </label>
              {checklist.length > 0 && (
                <span className="text-xs text-subtle">
                  {checklist.filter((i) => i.completed).length} de {checklist.length} feitos
                </span>
              )}
            </div>

            {/* Checklist Items List */}
            {checklist.length > 0 && (
              <div className="space-y-1.5 mb-2 bg-sunken/70 p-2.5 rounded-xl border border-line">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-1.5 hover:bg-white dark:hover:bg-[#161F32] rounded-lg transition-colors group/item"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span
                        className={`text-xs break-words ${
                          item.completed
                            ? 'line-through text-subtle'
                            : 'text-ink font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="text-subtle hover:text-rose-600 dark:hover:text-rose-400 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Checklist Item Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar item à checklist..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-2 bg-sunken border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-surface transition-all placeholder:text-subtle"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] text-ink border border-transparent dark:border-white/[0.06] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-ink border border-transparent dark:border-white/[0.06] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer"
              >
                {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export const TaskModal: React.FC = () => {
  const { taskModal, closeTaskModal } = useTaskContext();

  if (!taskModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <TaskModalForm
        key={taskModal.task?.id || 'new-task'}
        task={taskModal.task || null}
        defaultStatus={taskModal.defaultStatus || 'todo'}
        defaultBoardId={taskModal.defaultBoardId}
        onClose={closeTaskModal}
      />
    </div>
  );
};
