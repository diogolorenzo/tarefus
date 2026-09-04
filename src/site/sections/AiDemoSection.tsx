import React, { useState } from 'react';
import {
  Check,
  Edit3,
  Loader2,
  Sparkles,
  Mic,
  RotateCcw,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { ProofFrame } from '../ui/ProofFrame';
import { Avatar } from '../mock/ProductMocks';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { home } from '../../content/home';
import { requestTaskDraftFromAi, type GeneratedTaskDraft } from '../services/aiDraftService';

export const AiDemoSection: React.FC = () => {
  const examples = home.aiDemo.examples;
  const [activeId, setActiveId] = useState<string>(examples[0].id);
  const [prompt, setPrompt] = useState<string>(examples[0].prompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [approvedNotice, setApprovedNotice] = useState<boolean>(false);

  // The draft is initially null so the task is ONLY created after the user clicks the button!
  const [draft, setDraft] = useState<GeneratedTaskDraft | null>(null);

  const handleSelectExample = (exampleId: string) => {
    setActiveId(exampleId);
    setApprovedNotice(false);
    setIsEditing(false);
    setDraft(null); // Reset draft so user is invited to click and create it!

    const found = examples.find((e) => e.id === exampleId);
    if (found) {
      setPrompt(found.prompt);
    }
    track({ name: 'ai_demo_run', props: { exampleId } });
  };

  const handleRunAi = async (textToRun?: string, _areaHint?: string) => {
    const text = (textToRun || prompt).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setApprovedNotice(false);

    try {
      const result = await requestTaskDraftFromAi(text);
      setDraft(result);
    } catch (err) {
      console.error('Falha ao gerar com IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklist = (id: string) => {
    if (!draft) return;
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            checklist: prev.checklist.map((c) =>
              c.id === id ? { ...c, completed: !c.completed } : c
            ),
          }
        : null
    );
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setPrompt(speechResult);
          setIsListening(false);
          handleRunAi(speechResult);
        };
        recognition.onerror = () => {
          setIsListening(false);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
        return;
      } catch {
        setIsListening(false);
      }
    }

    // Fallback if browser blocks microphone in iframe
    const sample = 'Cobrar relatório de conciliação bancária do Carlos até quinta às 16h';
    setPrompt(sample);
    handleRunAi(sample);
  };

  const completedChecklistCount = draft ? draft.checklist.filter((c) => c.completed).length : 0;

  return (
    <SectionShell id="demonstracao" density="normal" surface="app">
      <SectionHeading
        eyebrow={home.aiDemo.eyebrow}
        title={home.aiDemo.title}
        subtitle={home.aiDemo.subtitle}
      />

      {/* Preset tabs */}
      <div className="-mx-5 mt-8 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 pb-1" role="tablist" aria-label="Exemplos por área">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              role="tab"
              aria-selected={example.id === activeId}
              onClick={() => handleSelectExample(example.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                example.id === activeId
                  ? 'border-emphasis bg-emphasis text-emphasis-ink font-semibold'
                  : 'border-line bg-surface text-muted hover:text-ink'
              )}
            >
              {example.areaLabel}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setActiveId('custom');
              setPrompt('');
              setIsEditing(false);
              setApprovedNotice(false);
              setDraft(null);
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeId === 'custom'
                ? 'border-emphasis bg-emphasis text-emphasis-ink font-semibold'
                : 'border-line bg-surface text-muted hover:text-ink'
            )}
          >
            ✨ Escrever pedido livre
          </button>
        </div>
      </div>

      <ProofFrame
        label={draft ? `Tarefus · IA atuando ao vivo (${draft.boardName})` : 'Tarefus · Teste interativo com IA'}
        caption={home.aiDemo.approvalNote}
        className="mt-6"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Real Interactive Input Side */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <Sparkles className="h-3 w-3" />
                  Assistente Inteligente
                </span>
                <span className="text-[11px] text-subtle">Digite ou dite em linguagem natural</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                IA Conectada
              </span>
            </div>

            <div className="rounded-xl border border-line-strong bg-app p-3 transition-colors focus-within:border-indigo-500">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRunAi();
                  }
                }}
                placeholder="Exemplo: Preciso que o Carlos confira o faturamento de maio com os extratos bancários até amanhã urgente..."
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-subtle focus:outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium transition-colors',
                  isListening
                    ? 'border-red-400 bg-red-50 text-red-700 animate-pulse dark:bg-red-950/40 dark:text-red-300'
                    : 'text-muted hover:border-line-strong hover:text-ink'
                )}
              >
                <Mic className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isListening ? 'Ouvindo microfone…' : 'Ditar por voz'}</span>
              </button>

              <div className="flex items-center gap-2">
                {prompt && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      setDraft(null);
                    }}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-subtle hover:text-ink"
                  >
                    Limpar
                  </button>
                )}
                <button
                  type="button"
                  disabled={isLoading || !prompt.trim()}
                  onClick={() => handleRunAi()}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]',
                    (isLoading || !prompt.trim()) && 'opacity-60 cursor-not-allowed',
                    !draft && prompt.trim() && 'ring-2 ring-indigo-500/40 shadow-indigo-500/20 shadow-md animate-pulse'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Processando na IA…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Executar com IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="mt-2.5 text-[11px] text-subtle">
              💡 Dica: mencione pessoas, prazos como &ldquo;sexta&rdquo; ou &ldquo;amanhã&rdquo;, e palavras como &ldquo;urgente&rdquo;.
            </p>
          </div>

          {/* Real AI Result Side */}
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center gap-3 text-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Sparkles className="h-6 w-6 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-ink">IA estruturando sua tarefa corporativa…</p>
                  <p className="text-xs text-muted max-w-xs">
                    Analisando comando em linguagem natural, selecionando responsável, calculando prazo e estruturando checklist acionável.
                  </p>
                </div>
              </div>
            ) : draft ? (
              <div className="min-h-[380px] flex flex-col justify-between">
                <div>
                  {/* Result header & badges */}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        Quadro: {draft.boardName}
                      </span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-[10px] font-semibold',
                          draft.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-sunken text-muted'
                        )}
                      >
                        Prioridade: {draft.priority === 'high' ? 'Alta' : 'Média'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      Tarefa criada pela IA
                    </span>
                  </div>

                  {/* Editable or display title */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                        Editar Título da Tarefa
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        className="w-full rounded-lg border border-line bg-app px-3 py-1.5 text-sm font-semibold text-ink focus:border-indigo-500 focus:outline-none"
                      />
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                        Editar Descrição
                      </label>
                      <textarea
                        rows={2}
                        value={draft.description}
                        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        className="w-full rounded-lg border border-line bg-app px-3 py-1.5 text-xs text-ink focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-base font-semibold leading-snug text-ink">{draft.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{draft.description}</p>
                    </>
                  )}

                  {/* Assignee and Due Date grid */}
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                        Responsável sugerido
                      </dt>
                      <dd className="mt-1.5 flex items-center gap-2">
                        <Avatar initials={draft.assignee.initials} tone={draft.assignee.tone} size="sm" />
                        <div>
                          <span className="block text-xs font-semibold text-ink">
                            {draft.assignee.name}
                          </span>
                          <span className="block text-[10px] text-subtle">
                            {draft.assignee.role}
                          </span>
                        </div>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                        Prazo calculado
                      </dt>
                      <dd className="mt-1.5 text-xs font-medium text-ink tnum">
                        {draft.dueDateLabel}
                      </dd>
                    </div>
                  </dl>

                  {/* Interactive Checklist */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                        Checklist gerado ({completedChecklistCount}/{draft.checklist.length})
                      </p>
                      <span className="text-[10px] text-subtle">Clique para marcar etapas</span>
                    </div>

                    <ul className="mt-2 space-y-1.5">
                      {draft.checklist.map((item) => (
                        <li
                          key={item.id}
                          onClick={() => handleToggleChecklist(item.id)}
                          className="flex cursor-pointer items-start gap-2 rounded-lg p-1 transition-colors hover:bg-sunken text-xs leading-relaxed"
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors',
                              item.completed
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-line-strong bg-app'
                            )}
                          >
                            {item.completed && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span
                            className={cn(
                              'transition-colors',
                              item.completed ? 'line-through text-subtle' : 'text-ink'
                            )}
                          >
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Notes if present */}
                  {draft.aiNotes && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-[11px] leading-relaxed font-medium">{draft.aiNotes}</p>
                    </div>
                  )}

                  {/* Feedback notice if approved */}
                  {approvedNotice && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Rascunho pronto! Crie sua conta para salvá-lo nos seus quadros.</span>
                      </div>
                      <a
                        href="/cadastro"
                        className="shrink-0 font-semibold underline hover:no-underline"
                      >
                        Criar conta &rarr;
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setApprovedNotice(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprovar e criar
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {isEditing ? 'Salvar edição' : 'Editar sugestão'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      setApprovedNotice(false);
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle transition-colors hover:border-line-strong hover:text-ink"
                    title="Testar outro exemplo"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Testar outro</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Invitation State - user has not created the task yet */
              <div className="flex min-h-[380px] flex-col justify-between rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-surface to-surface p-5 dark:border-indigo-900/60 dark:from-indigo-950/20">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Aguardando seu comando
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      Pronto para criar
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-base font-bold text-ink sm:text-lg">
                      Clique no botão para criar a tarefa com IA
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      A tarefa <strong>só será criada após você clicar no botão</strong>. A inteligência artificial vai analisar a frase, identificar a área, calcular o prazo e gerar o checklist automaticamente.
                    </p>
                  </div>

                  {/* Preview Card of Selected Prompt */}
                  <div className="mt-4 rounded-xl border border-line bg-app p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-subtle">
                      <span>Comando pronto para converter:</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">1 clique para gerar</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium italic text-ink line-clamp-2">
                      &ldquo;{prompt.trim() || 'Digite uma ordem de serviço ou selecione um exemplo acima...'}&rdquo;
                    </p>
                  </div>

                  {/* What AI will extract badges */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface p-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-xs dark:bg-indigo-950/50">🎯</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">Quadro certo</p>
                        <p className="text-[10px] text-subtle truncate">Comercial, Operações...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface p-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-50 text-xs dark:bg-purple-950/50">👤</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">Responsável</p>
                        <p className="text-[10px] text-subtle truncate">Alocação por função</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface p-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-xs dark:bg-amber-950/50">📅</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">Prazo real</p>
                        <p className="text-[10px] text-subtle truncate">Calcula vencimento</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-line/60 bg-surface p-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-xs dark:bg-emerald-950/50">☑️</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink truncate">Checklist</p>
                        <p className="text-[10px] text-subtle truncate">Passos acionáveis</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Inviting CTA Button */}
                <div className="mt-5 border-t border-line/80 pt-3">
                  <button
                    type="button"
                    disabled={isLoading || !prompt.trim()}
                    onClick={() => handleRunAi()}
                    className={cn(
                      'group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-[0.98]',
                      (!prompt.trim() || isLoading) && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125" />
                    <span>Clique aqui para criar a tarefa com IA</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <p className="mt-2 text-center text-[10px] text-subtle">
                    Ou clique no botão &ldquo;Executar com IA&rdquo; no formulário ao lado.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ProofFrame>

      {/* S4 footer */}
      <div className="mt-10 border-t border-line pt-7">
        <p className="text-sm font-semibold text-ink">{home.steps.title}</p>

        <ol className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {home.steps.items.map((step) => (
            <li key={step.number} className="flex gap-3">
              <span className="text-sm font-bold leading-6 text-subtle tnum">{step.number}</span>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-ink">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs leading-relaxed text-subtle">{home.steps.supportLine}</p>
      </div>
    </SectionShell>
  );
};
