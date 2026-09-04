import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { ProfileSettings } from './ProfileSettings';
import { CompanyGeneralSettings } from './CompanyGeneralSettings';
import { AreasSettings } from './AreasSettings';
import { MembersSettings } from './MembersSettings';
import { AuditLogsSettings } from './AuditLogsSettings';
import { PlanUsageSettings } from './PlanUsageSettings';
import { canManageCompany, canManageAuditLogs, isAdminOrManager as checkIsAdminOrManager } from '../../utils/rbac';
import {
  User,
  Building2,
  LayoutGrid,
  Users,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  History,
  Gauge,
} from 'lucide-react';

export type SettingsSubTab = 'profile' | 'company' | 'areas' | 'members' | 'audit' | 'plan-usage';

interface NavItem {
  id: SettingsSubTab;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: { group: string; adminOnly?: boolean; items: NavItem[] }[] = [
  {
    group: 'Geral',
    items: [
      {
        id: 'profile',
        label: 'Meu Perfil',
        description: 'Informações pessoais e avatar',
        icon: User,
      },
      {
        id: 'plan-usage',
        label: 'Plano & Uso',
        description: 'Assinatura e cota de IA',
        icon: Gauge,
      },
    ],
  },
  {
    group: 'Empresa & Equipe',
    adminOnly: true,
    items: [
      {
        id: 'company',
        label: 'Dados da Empresa',
        description: 'Razão social, contatos e dados gerais',
        icon: Building2,
        adminOnly: true,
      },
      {
        id: 'areas',
        label: 'Áreas & Quadros',
        description: 'Setores, fluxos e quadros Kanban',
        icon: LayoutGrid,
      },
      {
        id: 'members',
        label: 'Membros & Permissões',
        description: 'Equipe, convites e perfis de acesso',
        icon: Users,
      },
      {
        id: 'audit',
        label: 'Auditoria de Atividades',
        description: 'Histórico e logs de eventos operacionais',
        icon: History,
        adminOnly: true,
      },
    ],
  },
];

export const SettingsView: React.FC = () => {
  const { currentUser, setActiveTab } = useTaskContext();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');

  const isAdminOrManager = checkIsAdminOrManager(currentUser);
  const canCompany = canManageCompany(currentUser);
  const canAudit = canManageAuditLogs(currentUser);

  const isItemVisible = (item: NavItem) => {
    if (item.id === 'company') return canCompany;
    if (item.id === 'audit') return canAudit;
    if (item.id === 'members' || item.id === 'areas') return isAdminOrManager;
    return true;
  };

  // RBAC Guard on active subtab
  let effectiveSubTab: SettingsSubTab = activeSubTab;
  if (effectiveSubTab === 'company' && !canCompany) {
    effectiveSubTab = 'profile';
  } else if (effectiveSubTab === 'audit' && !canAudit) {
    effectiveSubTab = 'profile';
  } else if (!isAdminOrManager && effectiveSubTab !== 'profile' && effectiveSubTab !== 'plan-usage') {
    effectiveSubTab = 'profile';
  }

  const allVisibleItems = NAV_ITEMS.flatMap((g) => g.items.filter(isItemVisible));
  const activeTabDetails = allVisibleItems.find((item) => item.id === effectiveSubTab) || NAV_ITEMS[0].items[0];
  const ActiveIcon = activeTabDetails.icon;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-line">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-subtle mb-1.5 font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600 dark:text-slate-300">Configurações</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">{activeTabDetails.label}</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink tracking-tight leading-none">
                Configurações Corporativas
              </h1>
              <p className="text-xs text-muted mt-1">
                {activeTabDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Return to Board Button */}
        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-ink rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Quadro</span>
        </button>
      </div>

      {/* Main Settings Layout (Sidebar Navigation + Dynamic Content Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {NAV_ITEMS.map((group) => {
            const visibleGroupItems = group.items.filter(isItemVisible);
            if (visibleGroupItems.length === 0) return null;

            return (
              <div
                key={group.group}
                className="bg-surface rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-3 shadow-xs"
              >
                <div className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-subtle flex items-center justify-between">
                  <span>{group.group}</span>
                  {group.adminOnly && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-bold">
                      <ShieldCheck className="w-3 h-3" /> Gestão
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1">
                  {visibleGroupItems.map((item) => {
                    const isItemActive = effectiveSubTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSubTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isItemActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                            : 'text-muted hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-medium'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-white' : 'text-subtle'}`} />
                        <span className="text-xs truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9 bg-surface rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-xs min-h-[500px]">
          {effectiveSubTab === 'profile' && <ProfileSettings />}
          {effectiveSubTab === 'company' && <CompanyGeneralSettings />}
          {effectiveSubTab === 'areas' && <AreasSettings />}
          {effectiveSubTab === 'members' && <MembersSettings />}
          {effectiveSubTab === 'audit' && <AuditLogsSettings />}
          {effectiveSubTab === 'plan-usage' && <PlanUsageSettings />}
        </div>
      </div>
    </div>
  );
};
