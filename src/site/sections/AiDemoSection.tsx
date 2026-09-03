import React, { useEffect, useState } from 'react';
import { Check, Edit3, Loader2 } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { AssistantMock, Avatar } from '../mock/ProductMocks';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { usePrefersReducedMotion } from '../hooks/useSiteHooks';
import { home } from '../../content/home';

type Stage = 'typing' | 'loading' | 'result';

/**
 * S3 — Demonstração da IA.
 * Pré-computada, sem chamar /api/generate-task-draft (decisão D3 do plano):
 * evita custo por visitante, abuso do endpoint e latência na primeira dobra.
 */
export const AiDemoSection: React.FC = () => {
  const examples = home.aiDemo.examples;
  const [activeId, setActiveId] = useState<string>(examples[0].id);
  const [stage, setStage] = useState<Stage>('result');
  const [typed, setTyped] = useState<string>(examples[0].prompt);
  const reducedMotion = usePrefersReducedMotion();

  const active = examples.find((example) => example.id === activeId) ?? examples[0];

  useEffect(() => {
    if (reducedMotion) {
      setTyped(active.prompt);
      setStage('result');
      return;
    }

    setTyped('');
    setStage('typing');

    let index = 0;
    const typing = window.setInterval(() => {
      index += 1;
      setTyped(active.prompt.slice(0, index));
      if (index >= active.prompt.length) {
        window.clearInterval(typing);
        setStage('loading');
      }
    }, 22);

    return () => window.clearInterval(typing);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (stage !== 'loading') return;
    const timer = window.setTimeout(() => setStage('result'), 600);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    track({ name: 'ai_demo_run', props: { exampleId: id } });
  };

  return (
    <SectionShell id="demonstracao" surface="raised">
      <SectionHeading
        eyebrow={home.aiDemo.eyebrow}
        title={home.aiDemo.title}
        subtitle={home.aiDemo.subtitle}
      />

      <div className="mt-8 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1" role="tablist" aria-label="Exemplos por área">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              role="tab"
              aria-selected={example.id === activeId}
              onClick={() => handleSelect(example.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                example.id === activeId
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-line bg-app text-muted hover:text-ink'
              )}
            >
              {example.areaLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        <AssistantMock text={typed} showCursor={stage === 'typing'} />

        <div className="rounded-2xl border border-line bg-app p-4 shadow-sm">
          {stage === 'loading' ? (
            <div className="flex min-h-[260px] items-center justify-center gap-2 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">Montando a tarefa…</span>
            </div>
          ) : (
            <div className="min-h-[260px]">
              <h3 className="text-base font-semibold leading-snug text-ink">{active.draft.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{active.draft.description}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                    Responsável
                  </dt>
                  <dd className="mt-1.5 flex items-center gap-2">
                    <Avatar initials={active.draft.assignee.initials} size="sm" />
                    <span className="text-xs font-medium text-ink">{active.draft.assignee.name}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-subtle">Prazo</dt>
                  <dd className="mt-1.5 text-xs font-medium text-ink tnum">{active.draft.dueDateLabel}</dd>
                </div>
              </dl>

              <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-subtle">Checklist</p>
              <ul className="mt-2 space-y-1.5">
                {active.draft.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                    <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded border border-line-strong" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                  <Check className="h-3.5 w-3.5" />
                  Aprovar e criar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-muted">
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar sugestão
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm text-subtle">{home.aiDemo.approvalNote}</p>

      <div className="mt-7">
        <CtaButton
          label={home.aiDemo.cta.label}
          href={home.aiDemo.cta.href}
          ctaId="demo_primary"
          sectionId="demonstracao"
          fullWidth
          className="sm:w-auto"
        />
      </div>
    </SectionShell>
  );
};
