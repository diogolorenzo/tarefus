import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { CtaButton } from '../ui/CtaButton';
import { Icon } from '../ui/Icon';
import { ProofFrame } from '../ui/ProofFrame';
import { AssistantMock, TaskCardMock } from '../mock/ProductMocks';
import { home } from '../../content/home';

/**
 * S1 — Herói. Promessa, prova visual e o único CTA primário da primeira dobra.
 *
 * Duas mudanças de composição em relação à versão anterior:
 *
 * 1. A antiga faixa de fatos era uma seção inteira logo abaixo. Virou a linha
 *    fina no fim deste bloco — sai uma banda de página e a dobra respira.
 * 2. No desktop a prova do produto sangra pela direita, em vez de flutuar
 *    pequena dentro de meia coluna. A largura da coluna de texto (36rem) é a
 *    mesma conta do contêiner `max-w-6xl`, então texto e faixa de fatos
 *    permanecem alinhados em qualquer largura de tela.
 */
export const HeroSection: React.FC = () => (
  <section
    id="hero"
    className="relative overflow-hidden bg-app px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-0 lg:pb-24 lg:pt-28"
  >
    <div className="lg:grid lg:grid-cols-2 lg:items-center">
      <div className="lg:pl-6">
        <div className="lg:ml-auto lg:max-w-[36rem] lg:pr-12">
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
      </div>

      <div className="mt-14 lg:mt-0 lg:pl-12">
        <ProofFrame
          label="Tarefus · Comercial"
          caption={home.hero.proofCaption}
          className="lg:-mr-12 xl:-mr-24"
        >
          <div className="space-y-3">
            <AssistantMock
              bare
              text="Enviar proposta revisada para o cliente Alpha até sexta"
            />

            <div className="flex items-center justify-center gap-2 py-0.5 text-subtle">
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
        </ProofFrame>
      </div>
    </div>

    {/* S2 — os fatos, antes uma seção própria, agora fecham o herói. */}
    <ul className="mx-auto mt-16 grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-7 sm:grid-cols-4 lg:px-6">
      {home.hero.facts.map((fact) => (
        <li key={fact.label} className="flex items-start gap-2.5">
          <Icon name={fact.icon} className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
          <span className="text-xs font-medium leading-snug text-muted sm:text-sm">{fact.label}</span>
        </li>
      ))}
    </ul>
  </section>
);
