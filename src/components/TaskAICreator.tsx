import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getBoardColorStyles } from '../utils/helpers';
import type { ChecklistItem, Task, TaskStatus } from '../types';
import {
  Mic,
  MicOff,
  RotateCcw,
  Check,
  Edit3,
  Loader2,
  Calendar,
  Building2,
  Users,
  CheckSquare,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Select } from './ui/Select';
import { DatePicker } from './ui/DatePicker';
import { AiMark } from './ui/AiMark';

interface TaskDraft {
  title: string;
  description: string;
  boardId: string;
  status: TaskStatus;
  assigneeIds: string[];
  dueDate: string;
  checklist: ChecklistItem[];
}

interface TaskAICreatorProps {
  defaultBoardId?: string;
  defaultStatus?: TaskStatus;
  onApprove: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  onEditSuggestion: (draft: TaskDraft) => void;
  onSwitchToManual: () => void;
}

const TYPEWRITER_EXAMPLES = [
  'Ligar para o cliente João da Silva amanhã para alinhar a proposta comercial de 50k...',
  'Cotar frete com a transportadora para a filial de Curitiba com urgência até sexta...',
  'Criar 3 posts para o Instagram sobre o lançamento do novo plano com a Beatriz...',
  'Emitir e validar notas fiscais pendentes dos pedidos faturados com o Rodrigo...',
  'Agendar reunião de alinhamento com a equipe de operações amanhã às 14h...',
  'Enviar proposta comercial atualizada com 10% de desconto para o Cliente Beta...',
  'Revisar contrato de prestação de serviços com o departamento financeiro até hoje...',
];

export const TaskAICreator: React.FC<TaskAICreatorProps> = ({
  defaultBoardId,
  defaultStatus = 'todo',
  onApprove,
  onEditSuggestion,
  onSwitchToManual,
}) => {
  const { boards, users, showToast } = useTaskContext();

  const [promptText, setPromptText] = useState('');
  const [selectedBoardPreference, setSelectedBoardPreference] = useState<string>(
    defaultBoardId || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [includeChecklist, setIncludeChecklist] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');

  // Voice Hook
  const {
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
    error: speechError,
  } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setPromptText(text);
    },
  });

  // Typewriter effect in background looping through realistic task examples
  useEffect(() => {
    if (promptText || isListening) {
      return;
    }

    let promptIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: any;

    const tick = () => {
      const currentExample = TYPEWRITER_EXAMPLES[promptIdx];

      if (!isDeleting) {
        // Typing character by character
        charIdx++;
        setPlaceholderText(currentExample.slice(0, charIdx));

        if (charIdx >= currentExample.length) {
          // Finished typing full phrase, hold for a moment
          isDeleting = true;
          timeoutId = setTimeout(tick, 2200);
          return;
        }
        timeoutId = setTimeout(tick, 35);
      } else {
        // Deleting character by character as if rethinking
        charIdx--;
        setPlaceholderText(currentExample.slice(0, charIdx));

        if (charIdx <= 0) {
          // Finished deleting, switch to next example
          isDeleting = false;
          promptIdx = (promptIdx + 1) % TYPEWRITER_EXAMPLES.length;
          timeoutId = setTimeout(tick, 450);
          return;
        }
        timeoutId = setTimeout(tick, 20);
      }
    };

    timeoutId = setTimeout(tick, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [promptText, isListening]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleGenerateDraft = async (customPrompt?: string) => {
    const textToUse = (customPrompt || promptText).trim();
    if (!textToUse) {
      setError('Por favor, descreva ou dite os detalhes da tarefa antes de gerar.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsLoading(true);
    setError(null);
    setIncludeChecklist(false);

    try {
      const response = await fetch('/api/generate-task-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse,
          boards: boards.map((b) => ({ id: b.id, name: b.name, description: b.description })),
          users: users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
          currentDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao conectar com o assistente inteligente.');
      }

      const data = await response.json();
      if (data.draft) {
        // If user explicitly picked a board preference, override if desired
        const finalBoardId = selectedBoardPreference || data.draft.boardId || boards[0]?.id;

        const finalDraft: TaskDraft = {
          title: data.draft.title || textToUse.slice(0, 80),
          description: data.draft.description || textToUse,
          boardId: finalBoardId,
          status: data.draft.status || defaultStatus,
          assigneeIds: Array.isArray(data.draft.assigneeIds) && data.draft.assigneeIds.length > 0
            ? data.draft.assigneeIds
            : users[0]?.id ? [users[0].id] : [],
          dueDate: data.draft.dueDate || '',
          checklist: Array.isArray(data.draft.checklist) ? data.draft.checklist : [],
        };

        setDraft(finalDraft);
        showToast('Rascunho gerado. Revise antes de criar a tarefa.', 'success');
      } else {
        throw new Error(data.error || 'Não foi possível estruturar a tarefa.');
      }
    } catch (err: any) {
      console.error('Erro na criação com IA:', err);
      setError(err.message || 'Ocorreu um erro ao gerar a tarefa. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDraft = () => {
    if (!draft) return;
    onApprove({
      title: draft.title,
      description: draft.description || undefined,
      boardId: draft.boardId,
      status: draft.status,
      assigneeIds: draft.assigneeIds,
      dueDate: draft.dueDate || undefined,
      checklist: includeChecklist ? draft.checklist : [],
    });
  };

  const handleRecriar = () => {
    setDraft(null);
  };

  // Find board details for draft
  const currentDraftBoard = boards.find((b) => b.id === draft?.boardId) || boards[0];
  const draftBoardStyle = currentDraftBoard ? getBoardColorStyles(currentDraftBoard.color) : null;
  const draftAssignedUsers = users.filter((u) => draft?.assigneeIds.includes(u.id));

  return (
    <div className="p-6 space-y-6">
      {/* If No Draft has been generated yet, show input & dictation view */}
      {!draft ? (
        <div className="space-y-5">
          {/* Voice status banner if recording */}
          {isListening && (
            <div className="bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/40 p-3.5 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Gravando... fale naturalmente sobre a sua tarefa
                </div>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Parar Gravação
              </button>
            </div>
          )}

          {/* Speech error message */}
          {speechError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          {/* Main Textarea + Dictation Integration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                O que precisa ser feito? <span className="text-rose-500">*</span>
              </label>

              {/* Mic Dictation Trigger Button */}
              {isSpeechSupported ? (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  }`}
                  title={isListening ? 'Parar gravação' : 'Ditar por voz'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 animate-spin" />
                      <span>Parar Ditado</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Ditar com Microfone</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-subtle flex items-center gap-1">
                  <Info className="w-3 h-3" /> Digite o comando abaixo
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={isListening ? 'Ouvindo sua voz...' : (placeholderText || 'Descreva o que precisa ser feito...')}
                className={`w-full p-4 bg-sunken border rounded-2xl text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-surface transition-all resize-none placeholder:text-subtle leading-relaxed ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-500/20 dark:border-rose-500'
                    : 'border-line'
                }`}
                disabled={isLoading || isListening}
                autoFocus
              />

              {promptText && !isListening && !isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setPromptText('');
                    resetTranscript();
                  }}
                  className="absolute bottom-3 right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-xs rounded-lg border border-line transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Optional Board selector hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted font-medium">Quadro:</span>
              <Select
                value={selectedBoardPreference}
                onChange={setSelectedBoardPreference}
                size="sm"
                ariaLabel="Quadro de destino"
                wrapperClassName="w-56"
                options={[
                  { value: '', label: 'Detectar automaticamente' },
                  ...boards.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSwitchToManual}
              className="text-xs text-muted hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer underline-offset-4 hover:underline"
            >
              Prefiro preencher manualmente
            </button>

            <button
              type="button"
              disabled={isLoading || !promptText.trim()}
              onClick={() => handleGenerateDraft()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando rascunho com IA...</span>
                </>
              ) : (
                <>
                  <AiMark className="w-4 h-4" />
                  <span>Gerar Rascunho com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* DRAFT REVIEW STATE (Aprovar, Editar, Recriar) */
        <div className="space-y-5 animate-fade-in">
          {/* Draft Preview Card */}
          <div className="bg-sunken p-5 rounded-2xl border border-line space-y-4 shadow-xs">
            {/* Title */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">
                Título sugerido:
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-ink leading-snug">
                {draft.title}
              </h3>
            </div>

            {/* Badges / Key info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-line">
              {/* Board */}
              <div className="p-2.5 rounded-xl bg-surface border border-line">
                <div className="text-[10px] font-bold uppercase text-muted mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Quadro / Área
                </div>
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${draftBoardStyle?.pill || 'bg-indigo-500'}`} />
                  {currentDraftBoard?.name}
                </div>
              </div>

              {/* Status */}
              <div className="p-2.5 rounded-xl bg-surface border border-line">
                <div className="text-[10px] font-bold uppercase text-muted mb-1 flex items-center gap-1">
                  Status
                </div>
                <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      draft.status === 'todo'
                        ? 'bg-amber-500'
                        : draft.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  {draft.status === 'todo'
                    ? 'A Fazer'
                    : draft.status === 'in_progress'
                    ? 'Fazendo'
                    : 'Concluído'}
                </div>
              </div>

              {/* Due Date */}
              <div className="p-2.5 rounded-xl bg-surface border border-line">
                <div className="text-[10px] font-bold uppercase text-muted mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Prazo</span>
                </div>
                <div className="mt-1">
                  <DatePicker
                    variant="bare"
                    value={draft.dueDate || ''}
                    onChange={(v) => setDraft({ ...draft, dueDate: v })}
                    ariaLabel="Prazo sugerido"
                    placeholder="Sem prazo"
                  />
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="pt-2 border-t border-line">
              <div className="text-[10px] font-bold uppercase text-muted mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" /> Responsáveis Identificados
              </div>
              <div className="flex flex-wrap gap-2">
                {draftAssignedUsers.length > 0 ? (
                  draftAssignedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 px-2.5 py-1 bg-surface border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-2xs"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                          u.avatarColor || 'bg-indigo-600'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <span className="text-xs font-bold text-ink">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-subtle">
                        ({u.role.split('&')[0]})
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Nenhum responsável específico atribuído</span>
                )}
              </div>
            </div>

            {/* Description */}
            {draft.description && (
              <div className="pt-2 border-t border-line">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">
                  Descrição / Contexto:
                </span>
                <p className="text-xs text-ink whitespace-pre-line leading-relaxed bg-white/70 dark:bg-[#161F32]/70 p-3 rounded-xl border border-line">
                  {draft.description}
                </p>
              </div>
            )}

            {/* Checklist */}
            {draft.checklist && draft.checklist.length > 0 && (
              <div className="pt-2 border-t border-line space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckSquare
                      className={`w-3.5 h-3.5 transition-colors ${
                        includeChecklist
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-subtle'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        includeChecklist
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-muted'
                      }`}
                    >
                      Subtarefas Geradas ({draft.checklist.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIncludeChecklist(!includeChecklist)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      includeChecklist
                        ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                        : 'bg-slate-200/80 hover:bg-slate-300 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full transition-colors ${
                        includeChecklist ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                    />
                    {includeChecklist ? 'Incluídas na tarefa' : 'Incluir subtarefas'}
                  </button>
                </div>

                {/* Subtask list always visible with dim vs vibrant styling */}
                <div
                  onClick={() => !includeChecklist && setIncludeChecklist(true)}
                  className={`space-y-1.5 transition-all duration-300 ${
                    includeChecklist
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-60 cursor-pointer'
                  }`}
                  title={!includeChecklist ? 'Clique para incluir as subtarefas na tarefa' : undefined}
                >
                  {draft.checklist.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                        includeChecklist
                          ? 'bg-surface border-indigo-200/80 dark:border-indigo-500/30 font-semibold text-ink shadow-2xs'
                          : 'bg-slate-100/60 dark:bg-white/[0.02] border-dashed border-line text-muted'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          includeChecklist
                            ? 'bg-indigo-600 text-white text-[10px] font-bold shadow-xs'
                            : 'bg-slate-200/70 dark:bg-white/[0.06] text-subtle text-[10px] font-semibold'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="leading-snug">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar with the 3 required options: Aprovar, Editar Sugestão, Ajustar */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRecriar}
              className="px-4 py-2.5 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-ink rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer order-3 sm:order-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ajustar</span>
            </button>

            <div className="flex items-center gap-2.5 order-1 sm:order-2">
              <button
                type="button"
                onClick={() => onEditSuggestion(draft)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar Sugestão</span>
              </button>

              <button
                type="button"
                onClick={handleApproveDraft}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/25 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprovar e Criar Tarefa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
