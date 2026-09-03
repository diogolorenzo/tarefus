import React from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { GUIDE_CATEGORIES } from '../../data/guideArticles';
import {
  CheckSquare2,
  ShieldCheck,
  Receipt,
  FileCheck2,
  Building2,
  Lock,
  ArrowRight,
  Heart,
  Sparkles,
} from 'lucide-react';

export interface PublicFooterProps {
  onNavigate?: (path: string) => void;
  onStartTrial?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onNavigate,
  onStartTrial,
}) => {
  const { navigateTo: contextNavigateTo, setIsHelpCenterOpen } = useTaskContext();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (contextNavigateTo) {
      contextNavigateTo(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleStartTrial = () => {
    if (onStartTrial) {
      onStartTrial();
    } else {
      handleNavigate('/register');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-line text-ink transition-colors duration-200">
      {/* 1. TRUST & COMPLIANCE BADGES STRIP */}
      <div className="border-b border-line/70 bg-sunken/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              Garantia & Conformidade Brasileira
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Badge 1: Preço em Reais */}
            <div className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <span className="font-extrabold text-sm">R$</span>
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-ink">Preço em Reais</span>
                <span className="text-[11px] text-muted">Sem flutuação cambial</span>
              </div>
            </div>

            {/* Badge 2: Sem IOF */}
            <div className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-ink">Sem IOF</span>
                <span className="text-[11px] text-muted">Economia de até 4,38%</span>
              </div>
            </div>

            {/* Badge 3: Nota Fiscal (NFS-e) */}
            <div className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-ink">Nota Fiscal (NFS-e)</span>
                <span className="text-[11px] text-muted">Emissão 100% automática</span>
              </div>
            </div>

            {/* Badge 4: Conformidade LGPD */}
            <div className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-ink">Conformidade LGPD</span>
                <span className="text-[11px] text-muted">Privacidade de dados</span>
              </div>
            </div>

            {/* Badge 5: Cobrança por Empresa */}
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-xs font-bold text-ink">Cobrança por Empresa</span>
                <span className="text-[11px] text-muted">Preço fixo previsível</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER SITEMAP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <CheckSquare2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-ink">
                Tarefus
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-sm">
              A plataforma de gestão de tarefas e fluxos operacionais feita sob medida para a realidade das PMEs brasileiras.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartTrial}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Iniciar Teste Grátis de 14 Dias</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Links Col 1: Produto & Navegação */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Produto & Planos
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/planos')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Planos & Preços (R$)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/planos')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Calculadora de Economia
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/guia')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Guia de Boas Práticas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Acessar Quadros Kanban
                </button>
              </li>
            </ul>
          </div>

          {/* Links Col 2: Categorias do Guia */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Tópicos do Guia
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted">
              {GUIDE_CATEGORIES.map((cat) => (
                <li key={cat.key}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(`/guia?category=${cat.key}`)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left cursor-pointer"
                  >
                    {cat.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 3: Suporte & Recursos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              Ajuda & Suporte
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted">
              <li>
                <button
                  type="button"
                  onClick={() => setIsHelpCenterOpen(true)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Central de Ajuda & FAQ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsHelpCenterOpen(true)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Atalhos de Teclado
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('/guia/trello-vs-asana-vs-tarefus-comparativo')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Comparativo Trello vs Asana
                </button>
              </li>
              <li>
                <span className="text-xs text-subtle flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  Ambiente Protegido
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM COPYRIGHT & LEGAL NOTICE */}
      <div className="border-t border-line py-6 px-4 sm:px-6 lg:px-8 bg-sunken/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            © {currentYear} Tarefus Tecnologia. Todos os direitos reservados. CNPJ e NF-e automáticos para o Brasil.
          </p>
          <div className="flex items-center gap-2">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>para impulsionar a gestão de pequenas empresas no Brasil.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
