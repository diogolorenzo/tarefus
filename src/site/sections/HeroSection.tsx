import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { CtaButton } from '../ui/CtaButton';
import { AssistantMock, TaskCardMock } from '../mock/ProductMocks';
import { home } from '../../content/home';

/** S1 — Herói. Promessa, prova visual e o único CTA primário da primeira dobra. */
export const HeroSection: React.FC = () => (
  <section id="hero" className="bg-app px-5 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {home.hero.headline}
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {home.hero.subheadline}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CtaButton
            label={home.hero.primaryCta.label}
            href={home.hero.primaryCta.href}
            ctaId="hero_primary"
            sectionId="hero"
            fullWidth
            className="sm:w-auto"
          />
          {home.hero.secondaryCta && (
            <a
              href={home.hero.secondaryCta.href}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-base font-semibold text-muted transition-colors hover:text-ink"
            >
              {home.hero.secondaryCta.label}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>

        <p className="mt-5 text-sm text-subtle">{home.hero.reassurance.join(' · ')}</p>
      </div>

      <div className="relative">
        <div className="space-y-3">
          <AssistantMock text="Enviar proposta revisada para o cliente Alpha até sexta" />

          <div className="flex items-center justify-center gap-2 py-1 text-subtle">
            <span className="h-px w-8 bg-line-strong" />
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-[11px] font-medium uppercase tracking-wider">vira tarefa</span>
            <span className="h-px w-8 bg-line-strong" />
          </div>

          <TaskCardMock
            title="Enviar proposta comercial revisada ao cliente Alpha"
            description="Revisar valores, aplicar o desconto aprovado e enviar para assinatura."
            tags={['Comercial', 'Proposta']}
            dueLabel="sexta-feira, 5/9"
            assignee={{ initials: 'RS', name: 'Rodrigo Souza' }}
            checklist={{ done: 1, total: 3 }}
          />
        </div>
      </div>
    </div>
  </section>
);
