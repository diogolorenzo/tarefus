import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { ShieldCheck, X } from 'lucide-react';

export const CommercialStatusBanner: React.FC = () => {
  const { isCommercialUnavailable } = useTaskContext();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isCommercialUnavailable || isDismissed) {
    return null;
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-2 pb-1 animate-fade-in">
      <div className="bg-slate-100/90 dark:bg-[#131B2E]/90 border border-slate-300/80 dark:border-white/[0.08] rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-ink">
                Modo de Desenvolvimento / Demonstração
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/40 px-2 py-0.2 rounded-full border border-blue-200 dark:border-blue-800/40">
                Projeções Locais Ativas
              </span>
            </div>
            <p className="text-[11px] text-muted truncate mt-0.5">
              Operando com controle de assentos e limites em memória. Conexões de nuvem funcionam em modo seguro.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dispensar aviso"
          title="Dispensar aviso"
          className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
