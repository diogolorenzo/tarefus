import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
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
} from 'lucide-react';

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

  // Form State initialized directly
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

  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDueDate(d.toISOString().split('T')[0]);
  };

  return (
    <div
      className="bg-white dark:bg-[#121826] rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 dark:border-white/[0.08] overflow-hidden my-8 animate-fade-in dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#161F32]/80">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === 'todo'
                ? 'bg-amber-500 shadow-xs shadow-amber-500/50'
                : status === 'in_progress'
                ? 'bg-blue-500 shadow-xs shadow-blue-500/50'
                : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
            }`}
          />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSave} className="p-6 space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Título da Tarefa <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="Ex: Entrar em contato com distribuidora Alpha..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all shadow-2xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Grid: Quadro (Área) & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Quadro / Área
            </label>
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all cursor-pointer"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Coluna / Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all cursor-pointer"
            >
              <option value="todo" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">🟡 A Fazer</option>
              <option value="in_progress" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">🔵 Fazendo (Em Andamento)</option>
              <option value="done" className="bg-white dark:bg-[#121826] text-slate-900 dark:text-slate-100">🟢 Concluído</option>
            </select>
          </div>
        </div>

        {/* Prazo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Prazo (Opcional)
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all cursor-pointer flex-1 sm:max-w-xs"
            />
            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.05] rounded-lg font-medium cursor-pointer transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.05] rounded-lg font-medium cursor-pointer transition-colors"
              >
                Amanhã
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.05] rounded-lg font-medium cursor-pointer transition-colors"
              >
                +7 dias
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="px-2 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium cursor-pointer transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Responsáveis (Múltipla Seleção) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Responsáveis
              <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                {assigneeIds.length} {assigneeIds.length === 1 ? 'selecionado' : 'selecionados'}
              </span>
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Clique nos colaboradores para marcar/desmarcar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/70 dark:bg-[#0D121E]/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
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
                      : 'bg-white/60 dark:bg-[#131B2B]/60 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-white dark:hover:bg-[#192336]'
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
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
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

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Descrição ou Observações
          </label>
          <textarea
            rows={2}
            placeholder="Adicione detalhes, links ou instruções para quem vai executar..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all shadow-2xs resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Checklist */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> Checklist (Subitens)
            </label>
            {checklist.length > 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {checklist.filter((i) => i.completed).length} de {checklist.length} feitos
              </span>
            )}
          </div>

          {/* Checklist Items List */}
          {checklist.length > 0 && (
            <div className="space-y-1.5 mb-2 bg-slate-50/70 dark:bg-[#0D121E]/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06]">
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
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer"
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
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-3 py-2 bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 border border-transparent dark:border-white/[0.06] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
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
              className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/[0.06] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
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
