import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Sparkles, Loader2, Mic, Check, CheckSquare } from 'lucide-react';
import { CtaButton } from '../ui/CtaButton';
import { Icon } from '../ui/Icon';
import { ProofFrame } from '../ui/ProofFrame';
import { Avatar } from '../mock/ProductMocks';
import { home } from '../../content/home';
import { requestTaskDraftFromAi, type GeneratedTaskDraft } from '../services/aiDraftService';
import { cn } from '../ui/cn';

const HERO_CHIPS = [
  { label: 'Proposta Alpha', text: 'Enviar proposta comercial revisada para o cliente Alpha até sexta com Rodrigo' },
  { label: 'Cotar frete Curitiba', text: 'Cotar frete de 5 pallets para a filial de Curitiba até sexta com a Beatriz' },
  { label: '3 posts LinkedIn', text: 'Produzir 3 carrosséis institucionais para o LinkedIn sobre o novo produto' },
  { label: 'Conciliar extrato', text: 'Reconciliar faturamento do mês e emitir notas pendentes até o fim da semana' },
];

export const HeroInteractiveDemo: React.FC = () => {
  const [prompt, setPrompt] = useState('Enviar proposta revisada para o cliente Alpha até sexta');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [draft, setDraft] = useState<GeneratedTaskDraft>({
    title: 'Enviar proposta comercial revisada ao cliente Alpha',
    description: 'Revisar valores, aplicar o desconto aprovado e enviar minuta formal para assinatura.',
    tags: ['Comercial', 'Proposta'],
    dueDateLabel: 'sexta-feira, 5/9',
    assignee: {
      id: 'user-rodrigo',
      name: 'Rodrigo Souza',
      initials: 'RS',
      role: 'Comercial',
      tone: 'indigo',
    },
    checklist: [
      { id: 'h1', text: 'Revisar escopo e desconto aprovado', completed: true },
      { id: 'h2', text: 'Enviar minuta ao decisor', completed: false },
      { id: 'h3', text: 'Acompanhar confirmação de recebimento', completed: false },
    ],
    priority: 'medium',
    boardId: 'board-vendas',
    boardName: 'Comercial',
    source: 'gemini',
  });

  const handleGenerate = async (textToUse?: string) => {
    const text = (textToUse || prompt).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    try {
      const generated = await requestTaskDraftFromAi(text);
      setDraft(generated);
    } catch (err) {
      console.error('Erro na geração:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChecklist = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
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
          handleGenerate(speechResult);
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

    // Fallback if browser doesn't permit microphone inside iframe
    const voiceSample = 'Agendar reunião com diretoria amanhã às 15h para validar orçamento';
    setPrompt(voiceSample);
    handleGenerate(voiceSample);
  };

  const completedCount = draft.checklist.filter((c) => c.completed).length;
  const totalChecklist = draft.checklist.length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <ProofFrame
      label={`Tarefus · ${draft.boardName || 'Comercial'}`}
      caption={home.hero.proofCaption}
    >
      <div className="space-y-3">
        {/* Assistant Input Box */}
        <div className="rounded-xl border border-line bg-surface p-3.5 shadow-xs transition-colors focus-within:border-indigo-500">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Assistente com IA
            </span>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              ⚡ Interativo em tempo real
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Descreva o que precisa ser feito..."
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>

          {/* Quick chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-line/60">
            <span className="text-[10px] font-medium text-subtle">Sugestões:</span>
            {HERO_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setPrompt(chip.text);
                  handleGenerate(chip.text);
                }}
                className="rounded-md border border-line bg-app px-2 py-0.5 text-[10px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              title="Ditar por voz"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                isListening
                  ? 'border-red-400 bg-red-50 text-red-700 animate-pulse dark:bg-red-950/30 dark:text-red-300'
                  : 'text-muted hover:border-line-strong hover:text-ink'
              )}
            >
              <Mic className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{isListening ? 'Ouvindo…' : 'Ditar por voz'}</span>
            </button>

            <button
              type="button"
              disabled={isLoading || !prompt.trim()}
              onClick={() => handleGenerate()}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-[0.98]',
                (isLoading || !prompt.trim()) && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>IA pensando…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  <span>Gerar com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Divider transition */}
        <div className="flex items-center justify-center gap-2 py-0.5 text-subtle">
          <span className="h-px w-8 bg-line-strong" />
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-[11px] font-medium uppercase tracking-wider">
            {isLoading ? 'IA estruturando' : 'vira tarefa pronta'}
          </span>
          <span className="h-px w-8 bg-line-strong" />
        </div>

        {/* Generated Interactive Task Card */}
        <article className="rounded-xl border border-line bg-surface p-4 shadow-sm transition-all hover:border-line-strong">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold leading-snug text-ink">{draft.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">
                {draft.description}
              </p>
            </div>
            <Avatar initials={draft.assignee.initials} tone={draft.assignee.tone} />
          </div>

          {draft.tags && draft.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-sunken px-2 py-0.5 text-[10px] font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                {draft.boardName}
              </span>
            </div>
          )}

          {/* Checklist with clickable items */}
          <div className="mt-3.5 border-t border-line pt-2.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                Checklist ({completedCount}/{totalChecklist})
              </span>
              <span className="text-[10px] text-subtle">Clique para marcar etapas</span>
            </div>

            <ul className="mt-2 space-y-1.5">
              {draft.checklist.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors hover:bg-sunken"
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                      item.completed
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-line-strong bg-app'
                    )}
                  >
                    {item.completed && <Check className="h-3 w-3" />}
                  </span>
                  <span
                    className={cn(
                      'text-xs leading-relaxed transition-colors',
                      item.completed ? 'line-through text-subtle' : 'text-ink'
                    )}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Progress Bar */}
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-line text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-muted font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              <span>Prazo: {draft.dueDateLabel}</span>
            </div>

            <span className="text-[11px] font-medium text-subtle">
              Responsável: <strong className="text-ink">{draft.assignee.name.split(' ')[0]}</strong>
            </span>
          </div>
        </article>
      </div>
    </ProofFrame>
  );
};

export const HeroSection: React.FC = () => (
  <section
    id="hero"
    className="relative overflow-hidden bg-app px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24 lg:pt-28"
  >
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <h1 className="text-[2.375rem] font-bold leading-[1.02] tracking-[-0.035em] text-ink text-balance sm:text-5xl lg:text-6xl">
          {home.hero.headline}
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {home.hero.subheadline}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton
            label={home.hero.primaryCta.label}
            href={home.hero.primaryCta.href}
            ctaId="hero_primary"
            sectionId="hero"
            fullWidth
            className="sm:w-auto"
          />
          <a
            href={home.hero.secondaryCta.href}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-base font-semibold text-muted transition-colors hover:text-ink"
          >
            {home.hero.secondaryCta.label}
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-subtle">
          {home.hero.reassurance.join(' · ')}
        </p>
      </div>

      <div className="relative w-full">
        <HeroInteractiveDemo />
      </div>
    </div>

    {/* S2 — os fatos fecham o herói */}
    <ul className="mx-auto mt-16 grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-7 sm:grid-cols-4">
      {home.hero.facts.map((fact) => (
        <li key={fact.label} className="flex items-start gap-2.5">
          <Icon name={fact.icon} className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
          <span className="text-xs font-medium leading-snug text-muted sm:text-sm">{fact.label}</span>
        </li>
      ))}
    </ul>
  </section>
);
