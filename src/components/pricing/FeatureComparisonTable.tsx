import React, { useState } from 'react';
import {
  Check,
  Minus,
  Sparkles,
  Users,
  LayoutGrid,
  ShieldCheck,
  Headphones,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FEATURE_COMPARISON_CATEGORIES, PRICING_PLANS } from '../../data/pricingData';
import type {
  FeatureCategoryKey,
  FeatureComparisonValue,
  BillingInterval,
  PricingPlanId,
} from '../../types/pricing';

interface FeatureComparisonTableProps {
  billingInterval?: BillingInterval;
  onSelectPlan?: (planId: PricingPlanId) => void;
}

const CATEGORY_ICONS: Record<FeatureCategoryKey, React.ComponentType<{ className?: string }>> = {
  users_team: Users,
  boards_tasks: LayoutGrid,
  ai_gemini: Sparkles,
  security_governance: ShieldCheck,
  support_training: Headphones,
};

export const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  billingInterval = 'annual',
  onSelectPlan,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const renderValue = (val: FeatureComparisonValue, isHighlightColumn: boolean = false) => {
    if (typeof val === 'boolean') {
      if (val) {
        return (
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isHighlightColumn
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30'
                  : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center text-subtle">
          <Minus className="w-4 h-4" />
        </div>
      );
    }

    return (
      <span
        className={`text-xs sm:text-sm ${
          isHighlightColumn ? 'font-semibold text-ink' : 'text-ink font-medium'
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full text-left border-collapse min-w-[640px]">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-line bg-sunken/60">
              <th className="py-5 px-4 sm:px-6 w-2/5 text-sm font-semibold text-ink">
                Recursos & Capacidades
              </th>
              {PRICING_PLANS.map((plan) => {
                const isHighlight = plan.isHighlighted;
                const price =
                  billingInterval === 'annual'
                    ? plan.priceAnnualMonthly
                    : plan.priceMonthly;

                return (
                  <th
                    key={plan.id}
                    className={`py-5 px-4 w-1/5 text-center align-top ${
                      isHighlight
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-x-2 border-t-2 border-indigo-500/80'
                      : ''
                    }`}
                  >
                    <div className="space-y-1">
                      {isHighlight && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white mb-1">
                          Mais Escolhido
                        </span>
                      )}
                      <h4 className="text-base font-bold text-ink">{plan.name}</h4>
                      <p className="text-xs text-muted">
                        <strong className="text-ink text-sm font-extrabold tnum">
                          R$ {price}
                        </strong>
                        /més
                      </p>
                      {onSelectPlan && (
                        <button
                          type="button"
                          onClick={() => onSelectPlan(plan.id)}
                          className={`mt-2 text-xs font-semibold py-1.5 px-3 rounded-lg w-full transition-colors cursor-pointer ${
                            isHighlight
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                              : 'bg-surface border border-line hover:bg-sunken text-ink'
                          }`}
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {FEATURE_COMPARISON_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] || Sparkles;
            const isCollapsed = !!collapsedCategories[category.id];

            return (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <tr
                  onClick={() => toggleCategory(category.id)}
                  className="bg-sunken/80 border-y border-line cursor-pointer hover:bg-sunken select-none transition-colors"
                >
                  <td
                    colSpan={4}
                    className="py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider text-ink"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-indigo-500" />
                        <span>{category.title}</span>
                        <span className="text-xs font-normal text-muted lowercase">
                          ({category.rows.length} itens)
                        </span>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      )}
                    </div>
                  </td>
                </tr>

                {/* Category Rows */}
                {!isCollapsed &&
                  category.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-line/60 hover:bg-sunken/40 transition-colors ${
                        idx % 2 === 1 ? 'bg-sunken/20' : ''
                      }`}
                    >
                      {/* Feature Name & Tooltip */}
                      <td className="py-3.5 px-4 sm:px-6 text-xs sm:text-sm text-ink">
                        <div className="flex items-center gap-1.5 relative group">
                          <span>{row.name}</span>
                          {row.tooltip && (
                            <button
                              type="button"
                              aria-label={`Detalhes sobre ${row.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltip(
                                  activeTooltip === row.name ? null : row.name
                                );
                              }}
                              className="text-subtle hover:text-ink focus:outline-none"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Floating Tooltip Bubble */}
                          {row.tooltip && activeTooltip === row.name && (
                            <div className="absolute left-0 bottom-full mb-2 z-30 w-64 p-2.5 text-xs text-white bg-slate-900 rounded-lg shadow-xl border border-slate-700 leading-normal">
                              {row.tooltip}
                              <div className="text-[10px] text-slate-400 mt-1">
                                Clique no ícone para fechar
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Equipe Cell */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        {renderValue(row.equipe, false)}
                      </td>

                      {/* Crescimento (Highlighted) Cell */}
                      <td className="py-3.5 px-4 text-center align-middle bg-indigo-500/5 dark:bg-indigo-500/10 border-x-2 border-indigo-500/80">
                        {renderValue(row.crescimento, true)}
                      </td>

                      {/* Escala Cell */}
                      <td className="py-3.5 px-4 text-center align-middle">
                        {renderValue(row.escala, false)}
                      </td>
                    </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Bottom helper note */}
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted px-2">
      <p>Todos os planos contam com criptografia de ponta a ponta e servidores no Brasil.</p>
      <p className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        IA Gemini integrada em português sem custo adicional de API
      </p>
    </div>
  </div>
  );
};
