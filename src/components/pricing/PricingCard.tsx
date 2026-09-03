import React from 'react';
import { Check, Sparkles, Star, ArrowRight, Users, LayoutGrid, Zap, ShieldCheck } from 'lucide-react';
import type { PricingPlan, BillingInterval, PricingPlanId } from '../../types/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  billingInterval: BillingInterval;
  onSelectPlan?: (planId: PricingPlanId) => void;
  isCurrentPlan?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingInterval,
  onSelectPlan,
  isCurrentPlan = false,
}) => {
  const isAnnual = billingInterval === 'annual';
  const isHighlighted = plan.isHighlighted;

  const currentPrice = isAnnual ? plan.priceAnnualMonthly : plan.priceMonthly;

  const handleSelect = () => {
    if (onSelectPlan) {
      onSelectPlan(plan.id);
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl transition-all duration-200 ${
        isHighlighted
          ? 'bg-surface border-2 border-indigo-500/80 dark:border-indigo-400 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-950/40 ring-1 ring-indigo-500/20 md:-translate-y-2'
          : 'bg-surface border border-line shadow-sm hover:border-line-strong hover:shadow-md'
      }`}
    >
      {/* Top Highlight Badge */}
      {isHighlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full shadow-md shadow-indigo-500/30">
            <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
            {plan.badge || 'MAIS ESCOLHIDO PELAS PMEs'}
          </span>
        </div>
      )}

      {!isHighlighted && plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase bg-sunken border border-line-strong text-muted rounded-full">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Card Header */}
      <div className={`p-6 sm:p-7 ${isHighlighted ? 'pt-7' : ''}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xl font-bold text-ink flex items-center gap-2">
            {plan.name}
            {isHighlighted && <Sparkles className="w-4 h-4 text-indigo-500" />}
          </h3>
          {isAnnual && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              {plan.annualSavingsMonthsDescription}
            </span>
          )}
        </div>

        <p className="text-xs text-muted leading-relaxed min-h-[36px]">{plan.tagline}</p>

        {/* Price Section */}
        <div className="mt-5 pb-5 border-b border-line">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-muted">R$</span>
            <span className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight tnum">
              {currentPrice}
            </span>
            <span className="text-xs font-medium text-muted">/més</span>
          </div>

          <div className="mt-2 min-h-[44px] text-xs text-muted flex flex-col justify-center">
            {isAnnual ? (
              <>
                <p className="font-medium text-ink">
                  12x de R$ {plan.priceAnnualMonthly} no cartão (R$ {plan.priceAnnualInstallmentTotal}/ano)
                </p>
                <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ou R$ {plan.priceAnnualPix}/ano à vista no PIX
                </p>
              </>
            ) : (
              <p className="text-muted">
                Faturamento mensal de R$ {plan.priceMonthly} sem contrato de fidelidade.
              </p>
            )}
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mt-5 text-xs text-muted">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sunken border border-line/60">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-medium text-ink">Até {plan.maxMembers} membros</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sunken border border-line/60">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-medium text-ink">
              {plan.maxBoards === 'unlimited' ? 'Quadros ilimitados' : `Até ${plan.maxBoards} quadros`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sunken border border-line/60">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium text-ink">{plan.aiMonthlyCreations} IA/més</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sunken border border-line/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium text-ink">
              {plan.auditLogDays === 'unlimited' ? 'Logs ilimitados' : `${plan.auditLogDays}d de logs`}
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">
            O que está incluído:
          </p>
          <ul className="space-y-2.5">
            {plan.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-ink leading-relaxed">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Card Footer & CTA */}
      <div className="p-6 sm:p-7 pt-2 border-t border-line/50 mt-auto">
        <button
          type="button"
          onClick={handleSelect}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
            isHighlighted
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.99]'
              : 'bg-surface border border-line-strong hover:bg-sunken text-ink active:scale-[0.99]'
          }`}
        >
          {isCurrentPlan ? 'Seu Plano Atual' : plan.ctaText}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-center text-muted mt-2.5">
          14 dias de teste grátis • Sem cartão de crédito
        </p>
      </div>
    </div>
  );
};
