import React from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { CtaButton } from '../ui/CtaButton';
import { home } from '../../content/home';

/**
 * S10 — Fechamento. O segundo e último momento de respiro da página.
 *
 * Junta o que antes eram duas seções seguidas (Teste e Chamada final), que
 * repetiam o mesmo botão a poucos pixels de distância. As regras comerciais em
 * letra miúda saíram daqui para o bloco de planos, que é onde são lidas: aqui
 * ficou só o encerramento.
 *
 * A âncora `lista-de-espera` é o destino dos CTAs primários na fase 0.
 */
export const ClosingSection: React.FC = () => (
  <SectionShell id="comecar" anchorId="lista-de-espera" density="air" surface="raised">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-[2rem] font-bold leading-[1.05] tracking-[-0.035em] text-ink text-balance sm:text-5xl lg:text-6xl">
        {home.comecar.title}
      </h2>

      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {home.comecar.lead}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <CtaButton
          label={home.comecar.primaryCta.label}
          href={home.comecar.primaryCta.href}
          ctaId="comecar_primary"
          sectionId="comecar"
          fullWidth
          className="sm:w-auto"
        />
      </div>

      <ul className="mx-auto mt-10 grid max-w-xl gap-2.5 text-left sm:grid-cols-1">
        {home.comecar.included.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-muted">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </SectionShell>
);
