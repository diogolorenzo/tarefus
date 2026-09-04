import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { isAdminOrManager } from '../../utils/rbac';
import { getAiUsageRemainingRatio, shouldShowUpgradeCta } from '../../utils/planUsage';
import { Gauge, Sparkles, Users, ArrowUpRight } from 'lucide-react';

export const PlanUsageSettings: React.FC = () => {
  const { currentUser, entitlements, navigateTo } = useTaskContext();
  const canSeePlanDetails = isAdminOrManager(currentUser);

  if (!entitlements) {
    return (
      <div className="space-y-6">
        <div className="pb-5 border-b border-line">
          <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Plano & Uso</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Assinatura e cota de IA
          </p>
        </div>
        <div className="bg-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-8 text-center">
          <p className="text-sm font-bold text-ink">Carregando informações do plano...</p>
          <p className="text-xs text-subtle mt-1">
            Assim que os dados estiverem disponíveis, sua cota de uso será exibida aqui.
          </p>
        </div>
      </div>
    );
  }

  const { ai, seats, planId } = entitlements;
  const usageRatio = getAiUsageRemainingRatio(entitlements);
  const usedRatio = usageRatio === null ? 0 : 1 - usageRatio;
  const usedPercent = Math.round(Math.min(1, Math.max(0, usedRatio)) * 100);
  const showUpgradeCta = shouldShowUpgradeCta(entitlements);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="pb-5 border-b border-line">
        <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
          <Gauge className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Plano & Uso</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-0.5">
          Assinatura e cota de IA
        </p>
      </div>

      {/* AI Usage Card (visible to everyone) */}
      <div className="bg-surface p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
              Uso de IA no mês
            </span>
            <h4 className="text-lg font-black text-ink leading-tight">
              {ai.usedActions} <span className="text-xs font-normal text-muted">/ {ai.maxActionsPerMonth} ações</span>
            </h4>
          </div>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usedPercent >= 100
                ? 'bg-rose-500'
                : usedPercent >= 80
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${usedPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-2">
          {ai.remainingActions} {ai.remainingActions === 1 ? 'ação restante' : 'ações restantes'} neste ciclo.
        </p>
      </div>

      {/* Admin/Manager-only details */}
      {canSeePlanDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
                Plano Atual
              </span>
              <h4 className="text-lg font-black text-ink leading-tight capitalize">
                {planId || 'Sem plano ativo'}
              </h4>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
                Assentos
              </span>
              <h4 className="text-lg font-black text-ink leading-tight">
                {seats.assignedSeats} <span className="text-xs font-normal text-muted">/ {seats.maxSeats}</span>
              </h4>
            </div>
          </div>
        </div>
      )}

      {canSeePlanDetails && showUpgradeCta && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4">
          <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200">
            Sua empresa está próxima ou já atingiu os limites do plano atual.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('/planos')}
            className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>Ver planos</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
