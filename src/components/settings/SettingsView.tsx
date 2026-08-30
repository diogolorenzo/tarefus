import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { ProfileSettings } from './ProfileSettings';
import { CompanyGeneralSettings } from './CompanyGeneralSettings';
import { AreasSettings } from './AreasSettings';
import { MembersSettings } from './MembersSettings';
import {
  User,
  Building2,
  LayoutGrid,
  Users,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export type SettingsSubTab = 'profile' | 'company' | 'areas' | 'members';

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
    ],
  },
  {
    group: 'Empresa',
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
        adminOnly: true,
      },
      {
        id: 'members',
        label: 'Membros & Permissões',
        description: 'Equipe, convites e administradores',
        icon: Users,
        adminOnly: true,
      },
    ],
  },
];

export const SettingsView: React.FC = () => {
  const { currentUser, setActiveTab } = useTaskContext();
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>('profile');

  const isAdmin = Boolean(currentUser?.isAdmin);

  // RBAC Guard: If user is not admin and tries to view admin tabs, fallback to 'profile'
  const effectiveSubTab: SettingsSubTab = !isAdmin && activeSubTab !== 'profile' ? 'profile' : activeSubTab;

  const activeTabDetails =
    NAV_ITEMS.flatMap((g) => g.items).find((item) => item.id === effectiveSubTab) || NAV_ITEMS[0].items[0];
  const ActiveIcon = activeTabDetails.icon;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
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
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Configurações do Sistema
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeTabDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* Return to Board Button */}
        <button
          type="button"
          onClick={() => setActiveTab('board')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#121826] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar para os Quadros</span>
        </button>
      </div>

      {/* Mobile Horizontal Segmented Tabs */}
      <div className="lg:hidden mb-6 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] min-w-max">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              effectiveSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Meu Perfil</span>
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('company')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'company'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Empresa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('areas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'areas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Áreas & Quadros</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('members')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  effectiveSubTab === 'members'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Membros</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout: Sidebar on Left, Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-4 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-5">
            {NAV_ITEMS.map((group) => {
              // Hide group if it's admin-only and user is not admin
              if (group.adminOnly && !isAdmin) return null;

              return (
                <div key={group.group} className="space-y-1.5">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{group.group}</span>
                    {group.adminOnly && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" /> Admin
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {group.items.map((item) => {
                      if (item.adminOnly && !isAdmin) return null;
                      const isSelected = effectiveSubTab === item.id;
                      const IconComponent = item.icon;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveSubTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <IconComponent
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-[#161F32]/50 rounded-3xl p-4.5 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Painel Central</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Todas as modificações são gravadas automaticamente no seu navegador com persistência LocalStorage.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="lg:col-span-9 min-w-0">
          {effectiveSubTab === 'profile' && <ProfileSettings key={currentUser?.id || 'profile'} />}
          {effectiveSubTab === 'company' && isAdmin && <CompanyGeneralSettings />}
          {effectiveSubTab === 'areas' && isAdmin && <AreasSettings />}
          {effectiveSubTab === 'members' && isAdmin && <MembersSettings />}
        </section>
      </div>
    </div>
  );
};
