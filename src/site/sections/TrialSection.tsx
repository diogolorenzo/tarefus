import React from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { CtaButton } from '../ui/CtaButton';
import { home } from '../../content/home';

/**
 * S10 — Teste e modelo de cobrança.
 * Sem valores: /planos é a fonte única (decisão D8). As regras vêm de
 * 02-pricing-and-guide-plan.md (seção 0.D do plano da homepage).
 */
export const TrialSection: React.FC = () => (
  <SectionShell id="teste">
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-6 text-center shadow-sm sm:p-10">
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{home.trial.title}</h2>

      <ul className="mx-auto mt-6 max-w-md space-y-2.5 text-left">
        {home.trial.included.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check
              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed text-muted">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3 border-t border-line pt-6 text-left">
        <p className="text-sm leading-relaxed text-muted">{home.trial.afterTrial}</p>
        <p className="text-sm leading-relaxed text-muted">{home.trial.cancellation}</p>
        <p className="text-sm font-medium leading-relaxed text-ink">{home.trial.billingNote}</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <CtaButton
          label={home.trial.primaryCta.label}
          href={home.trial.primaryCta.href}
          ctaId="teste_primary"
          sectionId="teste"
          fullWidth
          className="sm:w-auto"
        />
        {home.trial.pricingCta && (
          <CtaButton
            label={home.trial.pricingCta.label}
            href={home.trial.pricingCta.href}
            variant="secondary"
            ctaId="teste_pricing"
            sectionId="teste"
            fullWidth
            className="sm:w-auto"
          />
        )}
      </div>
    </div>
  </SectionShell>
);
