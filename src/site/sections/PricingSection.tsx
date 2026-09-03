import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { PRICING_PLANS } from '../../data/pricingData';
import type { PricingPlan } from '../../types/pricing';
import { home } from '../../content/home';

type Interval = 'monthly' | 'annual';

const brl = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const int = (value: number): string => new Intl.NumberFormat('pt-BR').format(value);

/**
 * As três linhas de capacidade que decidem a escolha do plano. A `tagline` de
 * cada plano ficou de fora: quem está comparando decide por número de membros,
 * quadros e cota de IA, não por adjetivo.
 */
const specsOf = (plan: PricingPlan): string[] => [
  `Até ${plan.maxMembers} membros inclusos`,
  plan.maxBoards === 'unlimited' ? 'Quadros ilimitados' : `Até ${plan.maxBoards} quadros`,
  `${int(plan.aiMonthlyCreations)} criações com IA por mês`,
];

/**
 * S9 — Planos, na própria home.
 *
 * Nenhum valor é escrito aqui: tudo vem de `PRICING_PLANS`, a mesma fonte que
 * alimenta a página `/planos`. Duplicar preço em dois lugares é garantir que
 * um dos dois vai ficar desatualizado.
 *
 * Na fase de lista de espera o botão continua sendo o da lista: não faz sentido
 * oferecer assinatura de um cadastro que ainda está fechado — por isso o
 * `ctaText` de cada plano é ignorado enquanto `PHASE` não for `trial`.
 */
export const PricingSection: React.FC = () => {
  const [interval, setInterval] = useState<Interval>('monthly');
  const annual = interval === 'annual';

  return (
    <SectionShell id="planos" density="normal" surface="app">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow={home.planos.eyebrow}
          title={home.planos.title}
          subtitle={home.planos.subtitle}
        />

        <div
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-line bg-surface p-1 lg:self-end"
          role="group"
          aria-label="Periodicidade da cobrança"
        >
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setInterval(option);
                track({ name: 'pricing_interval_change', props: { interval: option } });
              }}
              aria-pressed={interval === option}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                interval === option ? 'bg-emphasis text-emphasis-ink' : 'text-muted hover:text-ink'
              )}
            >
              {home.planos.intervals[option]}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-subtle" aria-live="polite">
        {annual ? home.planos.annualHint : ' '}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const featured = Boolean(plan.isHighlighted);
          const monthly = annual ? plan.priceAnnualMonthly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border p-5',
                featured
                  ? 'border-emphasis bg-emphasis shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)]'
                  : 'border-line bg-surface'
              )}
            >
              <div className="flex min-h-6 items-center gap-2">
                <h3
                  className={cn(
                    'text-base font-bold',
                    featured ? 'text-emphasis-ink' : 'text-ink'
                  )}
                >
                  {plan.name}
                </h3>
                {plan.badge && featured && (
                  <span className="rounded-full bg-emphasis-ink/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emphasis-ink">
                    Mais escolhido
                  </span>
                )}
              </div>

              <p className="mt-4 flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-4xl font-bold tracking-tight tnum',
                    featured ? 'text-emphasis-ink' : 'text-ink'
                  )}
                >
                  {brl(monthly)}
                </span>
                <span className={cn('text-sm', featured ? 'text-emphasis-muted' : 'text-muted')}>
                  {home.planos.perMonthSuffix}
                </span>
              </p>

              <p
                className={cn(
                  'mt-1.5 min-h-8 text-xs leading-relaxed',
                  featured ? 'text-emphasis-muted' : 'text-subtle'
                )}
              >
                {/*
                  A mesma frase repetida nos três cartões vira ruído. No mensal
                  a linha mostra o que o anual economiza naquele plano; no anual,
                  como ele é pago.
                */}
                {annual
                  ? `${brl(plan.priceAnnualPix)} à vista no PIX, ou 12x de ${brl(
                      Math.round(plan.priceAnnualInstallmentTotal / 12)
                    )} — ${plan.annualSavingsMonthsDescription}`
                  : `${brl(plan.priceAnnualMonthly)}/mês no plano anual`}
              </p>

              <ul
                className={cn(
                  'mt-4 space-y-1.5 border-t pt-4',
                  featured ? 'border-emphasis-line' : 'border-line'
                )}
              >
                {specsOf(plan).map((spec) => (
                  <li
                    key={spec}
                    className={cn(
                      'text-sm font-medium',
                      featured ? 'text-emphasis-ink' : 'text-ink'
                    )}
                  >
                    {spec}
                  </li>
                ))}
              </ul>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.slice(4, 5).map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check
                      className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0',
                        featured ? 'text-emphasis-ink' : 'text-emerald-600 dark:text-emerald-400'
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        'text-xs leading-relaxed',
                        featured ? 'text-emphasis-muted' : 'text-muted'
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <CtaButton
                  label={home.phase === 'trial' ? plan.ctaText : home.planos.waitlistCtaLabel}
                  href={home.comecar.primaryCta.href}
                  variant={featured ? 'onEmphasis' : 'secondary'}
                  size="md"
                  fullWidth
                  ctaId={`planos_${plan.id}`}
                  sectionId="planos"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <div className="max-w-3xl space-y-2">
          {home.planos.fineprint.map((line, index) => (
            <p
              key={line}
              className={cn(
                'text-xs leading-relaxed',
                index === 0 ? 'font-medium text-muted' : 'text-subtle'
              )}
            >
              {line}
            </p>
          ))}
        </div>

        <a
          href={home.planos.fullComparisonCta.href}
          className="shrink-0 text-sm font-semibold text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          {home.planos.fullComparisonCta.label}
        </a>
      </div>
    </SectionShell>
  );
};
