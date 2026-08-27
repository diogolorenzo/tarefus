import React, { useState, useCallback } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { formatDueDate, getBoardColorStyles } from '../utils/helpers';
import type { ChecklistItem, Task, TaskStatus } from '../types';
import {
  Sparkles,
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
  Lightbulb,
  Info,
} from 'lucide-react';

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

const EXAMPLE_PROMPTS = [
  'Ligar para a transportadora e cotar frete para filial de Curitiba com urgência até sexta-feira',
  'Criar 3 posts para o Instagram sobre o lançamento do novo plano semestral até amanhã com a Beatriz',
  'Enviar proposta comercial atualizada com 10% de desconto para o Cliente Beta hoje com a Ana',
  'Emitir e validar notas fiscais pendentes dos pedidos faturados com o Rodrigo até amanhã',
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
  const [generationSource, setGenerationSource] = useState<string>('');

  const handleTranscript = useCallback((text: string) => {
    setPromptText(text);
  }, []);

  // Speech recognition
  const {
    isListening,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onTranscriptChange: handleTranscript,
  });

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
      setError('Por favor, digite ou dite o que precisa ser feito na tarefa.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    setIsLoading(true);
    setError(null);

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
        setGenerationSource(data.source || 'gemini');
        showToast('✨ Rascunho inteligente gerado!', 'success');
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
      checklist: draft.checklist,
    });
  };

  const handleRecriar = () => {
    setDraft(null);
  };

  const handleApplyExample = (example: string) => {
    setPromptText(example);
    setError(null);
    handleGenerateDraft(example);
  };

  // Find board details for draft
  const currentDraftBoard = boards.find((b) => b.id === draft?.boardId) || boards[0];
  const draftBoardStyle = currentDraftBoard ? getBoardColorStyles(currentDraftBoard.color) : null;
  const draftAssignedUsers = users.filter((u) => draft?.assigneeIds.includes(u.id));
  const dueInfo = draft?.dueDate ? formatDueDate(draft.dueDate) : null;

  return (
    <div className="p-6 space-y-6">
      {/* If No Draft has been generated yet, show input & dictation view */}
      {!draft ? (
        <div className="space-y-5">
          {/* Header banner */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/20 dark:via-purple-500/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Criar Tarefa com Inteligência Artificial
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Voz & Texto
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Fale pelo microfone ou descreva em linguagem natural. A IA definirá o título ideal, quadro/área, responsáveis, prazo e checklist passo a passo.
              </p>
            </div>
          </div>

          {/* Voice status banner if recording */}
          {isListening && (
            <div className="bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/40 p-3.5 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                </span>
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  🎙️ Gravando áudio... Fale naturalmente sobre a sua tarefa
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
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
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Digite o comando abaixo
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Exemplo: Preciso que o Carlos e a Ana cotem o frete urgente para Curitiba até sexta-feira, conferindo o peso das 3 caixas e comparando 2 transportadoras..."
                className={`w-full p-4 bg-slate-50 dark:bg-[#0D121E] border rounded-2xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-[#111728] transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-500/20 dark:border-rose-500'
                    : 'border-slate-200 dark:border-white/[0.08]'
                }`}
                disabled={isLoading}
                autoFocus
              />

              {promptText && (
                <button
                  type="button"
                  onClick={() => {
                    setPromptText('');
                    resetTranscript();
                  }}
                  className="absolute bottom-3 right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-white/80 dark:bg-[#161F32]/80 backdrop-blur-xs rounded-lg border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Optional Board selector hint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Quadro preferido:</span>
              <select
                value={selectedBoardPreference}
                onChange={(e) => setSelectedBoardPreference(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              >
                <option value="">✨ IA detecta automaticamente</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Sugestões rápidas para testar:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLE_PROMPTS.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyExample(ex)}
                  className="text-left p-2.5 rounded-xl bg-slate-100/70 hover:bg-indigo-50/80 dark:bg-white/[0.03] dark:hover:bg-indigo-500/10 border border-slate-200/70 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-start gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  <span className="line-clamp-2 leading-relaxed">{ex}</span>
                </button>
              ))}
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
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onSwitchToManual}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer underline-offset-4 hover:underline"
            >
              Prefiro preencher manualmente
            </button>

            <button
              type="button"
              disabled={isLoading || !promptText.trim()}
              onClick={() => handleGenerateDraft()}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando rascunho com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Rascunho com IA</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* DRAFT REVIEW STATE (Aprovar, Editar, Recriar) */
        <div className="space-y-5 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Rascunho Inteligente Gerado com Sucesso!
                </h4>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  Revise a sugestão abaixo. Você pode aprovar imediatamente, editar detalhes ou recriar.
                </p>
              </div>
            </div>
            {generationSource === 'gemini' && (
              <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Gemini AI
              </span>
            )}
          </div>

          {/* Draft Preview Card */}
          <div className="bg-slate-50 dark:bg-[#0D121E] p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-xs">
            {/* Title */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Título sugerido:
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {draft.title}
              </h3>
            </div>

            {/* Badges / Key info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
              {/* Board */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F32] border border-slate-200/70 dark:border-white/[0.06]">
                <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Quadro / Área
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${draftBoardStyle?.pill || 'bg-indigo-500'}`} />
                  {currentDraftBoard?.name}
                </div>
              </div>

              {/* Status */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F32] border border-slate-200/70 dark:border-white/[0.06]">
                <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  Status
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
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
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F32] border border-slate-200/70 dark:border-white/[0.06]">
                <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Prazo
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {dueInfo ? `${dueInfo.label} (${draft.dueDate})` : 'Sem prazo definido'}
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
              <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" /> Responsáveis Identificados
              </div>
              <div className="flex flex-wrap gap-2">
                {draftAssignedUsers.length > 0 ? (
                  draftAssignedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-[#161F32] border border-slate-200/80 dark:border-white/[0.08] rounded-xl shadow-2xs"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                          u.avatarColor || 'bg-indigo-600'
                        }`}
                      >
                        {u.initials}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
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
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Descrição / Contexto:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white/70 dark:bg-[#161F32]/70 p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.06]">
                  {draft.description}
                </p>
              </div>
            )}

            {/* Checklist */}
            {draft.checklist && draft.checklist.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" /> Subtarefas Geradas ({draft.checklist.length}):
                </span>
                <div className="space-y-1.5">
                  {draft.checklist.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-[#161F32] rounded-xl border border-slate-200/60 dark:border-white/[0.06] text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold">{idx + 1}</span>
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar with the 3 required options: Aprovar, Editar Sugestão, Recriar */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRecriar}
              className="px-4 py-2.5 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer order-3 sm:order-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recriar / Ajustar</span>
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
