import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
  User,
  Mail,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Palette,
  Check,
  Save,
} from 'lucide-react';
import { AiMark } from '../ui/AiMark';

const AVATAR_COLORS = [
  { id: 'bg-blue-600', label: 'Azul Tarefus', hex: '#2563EB' },
  { id: 'bg-indigo-600', label: 'Índigo', hex: '#4F46E5' },
  { id: 'bg-emerald-500', label: 'Esmeralda', hex: '#10B981' },
  { id: 'bg-violet-600', label: 'Violeta', hex: '#7C3AED' },
  { id: 'bg-amber-600', label: 'Âmbar / Laranja', hex: '#D97706' },
  { id: 'bg-rose-500', label: 'Rosa / Carmim', hex: '#F43F5E' },
  { id: 'bg-cyan-600', label: 'Ciano', hex: '#0891B2' },
  { id: 'bg-slate-700', label: 'Grafite', hex: '#334155' },
];

export const ProfileSettings: React.FC = () => {
  const { currentUser, updateUser } = useTaskContext();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || '');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || 'bg-blue-600');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-surface rounded-3xl border border-slate-200/80 dark:border-white/[0.08]">
        <p className="text-sm text-muted">Nenhum usuário conectado no momento.</p>
      </div>
    );
  }

  // Compute live initials
  const liveInitials =
    name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      avatarColor,
      initials: liveInitials,
    });

    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-line">
        <div>
          <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Meu Perfil</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Gerencie suas informações pessoais, avatar e identificação na equipe
          </p>
        </div>

        {/* Role Badge Indicator */}
        <div className="self-start sm:self-auto">
          {currentUser.isAdmin ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40 text-xs font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Administrador do Sistema</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-ink border border-line text-xs font-semibold">
              <User className="w-4 h-4 text-slate-500" />
              <span>Colaborador</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Preview Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Edit Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="bg-surface rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4.5">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <AiMark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Informações Pessoais</span>
            </h3>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Nome Completo</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo..."
                className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>E-mail Corporativo</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
              />
            </div>

            {/* Role Input */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Cargo / Função</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Desenvolvedor Front-end, Gerente de Projetos..."
                className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
              />
            </div>

            {/* Avatar Color Picker */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Cor do Avatar</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVATAR_COLORS.map((c) => {
                  const isSelected = avatarColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setAvatarColor(c.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/25 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                          : 'border-line text-ink hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-lg shadow-xs shrink-0 ${c.id}`} />
                      <span className="truncate">{c.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 ml-auto text-blue-600 dark:text-blue-400 shrink-0 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-line flex items-center justify-between">
              <span className="text-xs text-muted">
                {isSavedRecently && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Alterações salvas com sucesso!
                  </span>
                )}
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface rounded-3xl p-6 border border-slate-200/80 dark:border-white/[0.08] shadow-xs relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
                Pré-visualização do Cartão
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                Ao Vivo
              </span>
            </div>

            {/* Preview Card */}
            <div className="flex flex-col items-center text-center p-4 bg-slate-50/80 dark:bg-[#0D121E]/60 rounded-2xl border border-line">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg mb-3.5 transition-all transform hover:scale-105 duration-200 ${avatarColor}`}
              >
                {liveInitials}
              </div>

              <h4 className="text-base font-extrabold text-ink truncate max-w-full">
                {name || 'Nome do Usuário'}
              </h4>

              <p className="text-xs text-muted font-medium truncate max-w-full mt-0.5">
                {email || 'usuario@empresa.com'}
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-slate-200/80 dark:border-white/[0.08] text-xs font-semibold text-ink shadow-2xs">
                  <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{role || 'Cargo Não Definido'}</span>
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-line w-full flex items-center justify-center">
                {currentUser.isAdmin ? (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Administrador com Acesso Total
                  </span>
                ) : (
                  <span className="text-[11px] text-muted font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Acesso Padrão de Colaborador
                  </span>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong>Dica:</strong> A cor e iniciais selecionadas são exibidas nos cartões de tarefas atribuídas a você e no menu superior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
