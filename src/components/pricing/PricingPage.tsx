import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  Quote,
  ArrowRight,
  CreditCard,
  Building2,
  Lock,
} from 'lucide-react';
import { PRICING_PLANS, PRICING_TESTIMONIALS, PRICING_HERO_COPY } from '../../data/pricingData';
import { PricingCard } from './PricingCard';
import { SavingsCalculator } from './SavingsCalculator';
import { FeatureComparisonTable } from './FeatureComparisonTable';
import { PricingFAQ } from './PricingFAQ';
import type { BillingInterval, PricingPlanId } from '../../types/pricing';

interface PricingPageProps {
  onSelectPlan?: (planId: PricingPlanId) => void;
  onStartTrial?: (planId?: PricingPlanId) => void;
  onNavigate?: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onSelectPlan,
  onStartTrial,
  onNavigate,
}) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');

  const handlePlanSelection = (planId: PricingPlanId) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else if (onStartTrial) {
      onStartTrial(planId);
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  const handleGeneralTrial = () => {
    if (onStartTrial) {
      onStartTrial('crescimento');
    } else if (onSelectPlan) {
      onSelectPlan('crescimento');
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  return (
    <div className="w-full min-h-screen bg-app text-ink transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Decorative Top Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Currency Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase shadow-xs mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          {PRICING_HERO_COPY.badge}
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-ink tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Planos simples e previsíveis para a sua {' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 bg-clip-text text-transparent">
            empresa inteira.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          {PRICING_HERO_COPY.subtitle}
        </p>

        {/* Billing Switch (Monthly / Annual) */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-sunken border border-line shadow-inner">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {PRICING_HERO_COPY.monthlyToggleLabel}
            </button>

            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                billingInterval === 'annual'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <span>{PRICING_HERO_COPY.annualToggleLabel}</span>
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                  billingInterval === 'annual'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {PRICING_HERO_COPY.annualDiscountBadge}
              </span>
            </button>
          </div>

          <p className="text-xs text-muted max-w-md">
            {PRICING_HERO_COPY.annualSubtext}
          </p>
        </div>
      </section>

      {/* 2. PRICING CARDS GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingInterval={billingInterval}
              onSelectPlan={handlePlanSelection}
            />
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 p-4 rounded-2xl bg-sunken border border-line max-w-2xl mx-auto text-center flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-muted">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            14 dias de teste grátis
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-line-strong" />
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-4 h-4" />
            Sem cartão de crédito no cadastro
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-line-strong" />
          <span className="flex items-center gap-1.5 text-ink">
            <Lock className="w-4 h-4 text-emerald-500" />
            Cancele a qualquer momento
          </span>
        </div>
      </section>

      {/* 3. SAVINGS CALCULATOR SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 sm:pb-28">
        <SavingsCalculator
          billingInterval={billingInterval}
          onSelectPlan={handlePlanSelection}
        />
      </section>

      {/* 4. SOCIAL PROOF & TESTIMONIALS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 sm:pb-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            QUEM USA RECOMENDA
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Pequenas empresas brasileiras organizadas e sem estresse
          </h2>
          <p className="text-sm text-muted mt-2">
            Veja como gestores de diferentes setores reduziram custos e colocaram 100% da equipe na mesma página.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-6 sm:p-7 rounded-2xl bg-surface border border-line shadow-sm flex flex-col justify-between relative hover:border-line-strong transition-colors"
            >
              <Quote className="w-8 h-8 text-indigo-500/20 absolute top-5 right-5" />

              <p className="text-sm text-ink leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-line/60">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${t.avatarColor}`}
                >
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-ink">{t.author}</h4>
                  <p className="text-[11px] text-muted">
                    {t.role} • {t.company}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {t.seats} colaboradores ativos
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURE COMPARISON MATRIX */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 sm:pb-28">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sunken border border-line text-xs font-semibold text-muted mb-3">
            <Building2 className="w-3.5 h-3.5" />
            MATRIZ COMPLETA DE RECURSOS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Compare todos os recursos e limites lado a lado
          </h2>
          <p className="text-sm text-muted mt-2">
            Transparência total em cada recurso, sem letras mínudas ou custos escondidos.
          </p>
        </div>

        <FeatureComparisonTable
          billingInterval={billingInterval}
          onSelectPlan={handlePlanSelection}
        />
      </section>

      {/* 6. FAQ SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 sm:pb-28">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sunken border border-line text-xs font-semibold text-muted mb-3">
            <Clock className="w-3.5 h-3.5" />
            DÚVIDAS FREQUENTES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Perguntas Frequentes sobre Planos e Pagamento
          </h2>
          <p className="text-sm text-muted mt-2">
            Tudo o que você precisa saber sobre a contratação, faturamento e teste grátis.
          </p>
        </div>

        <PricingFAQ />
      </section>

      {/* 7. FINAL CLOSING CTA BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-700/40 shadow-2xl relative overflow-hidden text-center">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              EXPERIÊNCIA COMPLETA EM 2 MINUTOS
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sua equipe organizada em 14 dias ou nada a pagar.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Junte-se a centenas de pequenas empresas brasileiras que abandonaram as planilhas soltas e o estresse de mensagens perdidas no WhatsApp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleGeneralTrial}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                Começar Teste de 14 Dias Grátis
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Configuração em 2 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Suporte em português
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
