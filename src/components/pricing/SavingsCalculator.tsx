import React, { useState } from 'react';
import {
  Users,
  TrendingDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  DollarSign,
  Layers,
} from 'lucide-react';
import { calculateSavings } from '../../data/pricingData';
import type { BillingInterval, PricingPlanId } from '../../types/pricing';

interface SavingsCalculatorProps {
  billingInterval?: BillingInterval;
  onSelectPlan?: (planId: PricingPlanId) => void;
}

const PRESET_SEATS = [5, 10, 15, 20, 35, 50];

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({
  billingInterval = 'annual',
  onSelectPlan,
}) => {
  const [seats, setSeats] = useState<number>(12);

  const calc = calculateSavings(seats);
  const isAnnual = billingInterval === 'annual';
  const tarefusActiveCost = isAnnual ? calc.tarefusAnnualMonthly : calc.tarefusMonthly;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeats(parseInt(e.target.value, 10) || 1);
  };

  const handleIncrement = () => {
    setSeats((prev) => Math.min(60, prev + 1));
  };

  const handleDecrement = () => {
    setSeats((prev) => Math.max(3, prev - 1));
  };

  const handleSelectPreset = (val: number) => {
    setSeats(val);
  };

  const handleCta = () => {
    if (onSelectPlan) {
      onSelectPlan(calc.planId);
    }
  };

  return (
    <div className="w-full bg-surface border border-line rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
          <TrendingDown className="w-3.5 h-3.5" />
          SIMULADOR DE ECONOMIA REAL
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Quanto sua empresa economiza com o Tarefus?
        </h3>
        <p className="text-sm text-muted mt-2">
          Compare o custo fixo em Reais por empresa contra o modelo tradicional de cobrança em dólar
          por usuário (com IOF e oscilação cambial).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Seats Selector Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-sunken border border-line">
            <div className="flex items-center justify-between gap-4 mb-4">
              <label htmlFor="seats-slider" className="text-sm font-semibold text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Pessoas na sua equipe:
              </label>

              {/* Stepper Controls */}
              <div className="flex items-center gap-2 bg-surface border border-line rounded-xl p-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={seats <= 3}
                  aria-label="Diminuir membros"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sunken disabled:opacity-30 disabled:cursor-not-allowed text-ink transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-base font-bold text-ink tnum">
                  {seats}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={seats >= 60}
                  aria-label="Aumentar membros"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sunken disabled:opacity-30 disabled:cursor-not-allowed text-ink transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <input
              id="seats-slider"
              type="range"
              min="3"
              max="50"
              step="1"
              value={seats > 50 ? 50 : seats}
              onChange={handleSliderChange}
              className="w-full h-2.5 bg-line-strong rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-medium text-subtle">
              <span>3 pessoas</span>
              <span>15 pessoas</span>
              <span>35 pessoas</span>
              <span>50+ pessoas</span>
            </div>
          </div>

          {/* Preset Pills */}
          <div className="mt-5 pt-4 border-t border-line/70">
            <span className="text-xs font-medium text-muted block mb-2">Atalhos rápidos:</span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {PRESET_SEATS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    seats === preset
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-surface border border-line text-ink hover:bg-surface/80 hover:border-line-strong'
                  }`}
                >
                  {preset} {preset === 1 ? 'membro' : 'membros'}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Competitor Cost Breakdown */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-subtle" />
              Estimativa de ferramentas em dólar ({seats} usuários):
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-sunken border border-line text-center">
                <p className="text-[11px] font-medium text-subtle">Asana Starter</p>
                <p className="text-sm font-bold text-ink mt-0.5 tnum">
                  R$ {calc.usdCompetitorBreakdown?.asanaBrl.toLocaleString('pt-BR')}
                </p>
                <span className="text-[10px] text-muted">~US$ 13.49/user</span>
              </div>
              <div className="p-3 rounded-xl bg-sunken border border-line text-center">
                <p className="text-[11px] font-medium text-subtle">Monday Std</p>
                <p className="text-sm font-bold text-ink mt-0.5 tnum">
                  R$ {calc.usdCompetitorBreakdown?.mondayBrl.toLocaleString('pt-BR')}
                </p>
                <span className="text-[10px] text-muted">~US$ 12.00/user</span>
              </div>
              <div className="p-3 rounded-xl bg-sunken border border-line text-center">
                <p className="text-[11px] font-medium text-subtle">Trello Std</p>
                <p className="text-sm font-bold text-ink mt-0.5 tnum">
                  R$ {calc.usdCompetitorBreakdown?.trelloBrl.toLocaleString('pt-BR')}
                </p>
                <span className="text-[10px] text-muted">~US$ 5.00/user</span>
              </div>
            </div>
            <p className="text-[11px] text-subtle text-right">
              *Valores médios com IOF (4,38%) e taxa cambial.
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Results Card */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 text-white border border-indigo-800/50 shadow-2xl relative">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Economia de {calc.savingsPercentage}%
              </span>
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Plano sugerido: <strong className="text-white font-bold">{calc.planName}</strong>
              </span>
            </div>

            {/* Main Annual Savings Number */}
            <div className="mt-2 mb-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Economia Anual Estimada:
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400">R$</span>
                <span className="text-4xl sm:text-5xl lg:text-6xl font-black text-emerald-400 tracking-tight tnum">
                  {calc.annualSavings.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs sm:text-sm text-slate-300">/ano</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Equivalente a uma economia de {' '}
                <strong className="text-emerald-300">
                  R$ {calc.monthlySavings.toLocaleString('pt-BR')}/més
                </strong>{' '}
                para a sua empresa.
              </p>
            </div>

            {/* Visual Comparison Bar */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Tarefus Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Tarefus ({calc.planName})
                  </span>
                  <span className="font-bold text-indigo-300 tnum">
                    R$ {tarefusActiveCost.toLocaleString('pt-BR')}/més
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(12, Math.round((tarefusActiveCost / calc.competitorsMonthly) * 100)))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Competitors Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-400">Média concorrentes em dólar</span>
                  <span className="font-bold text-slate-300 tnum">
                    R$ {calc.competitorsMonthly.toLocaleString('pt-BR')}/més
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                  <div className="bg-rose-500/80 h-full rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Advantage Highlights */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sem pegadinha por assento:</strong> contrate estagiários ou novos funcionários sem se preocupar com a fatura.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero IOF e cobrança 100% em Reais:</strong> emissão automática de NFS-e para a contabilidade.
                </span>
              </div>
            </div>
          </div>

          {/* Calculator CTA */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleCta}
              className="w-full py-3.5 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              Testar no Plano {calc.planName} por 14 Dias Grátis
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Sem cartão de crédito • Liberação imediata em 2 minutos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
