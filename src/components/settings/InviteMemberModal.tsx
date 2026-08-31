import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { PermissionRole } from '../../types';
import {
  X,
  UserPlus,
  User,
  Mail,
  Briefcase,
  ShieldCheck,
  Check,
  Shield,
  UserCheck,
} from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { addUser } = useTaskContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [permissionRole, setPermissionRole] = useState<PermissionRole>('member');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) return;

    addUser(name.trim(), role.trim(), email.trim(), permissionRole, permissionRole === 'admin');
    setName('');
    setEmail('');
    setRole('');
    setPermissionRole('member');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('');
    setPermissionRole('member');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/80 dark:border-white/[0.08] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-line bg-slate-50/70 dark:bg-[#161F32]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Convidar / Cadastrar Membro</h3>
              <p className="text-xs text-muted">Adicione um novo colaborador ao banco de dados corporativo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Nome Completo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Mariana Costa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> E-mail Corporativo <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="mariana.costa@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Cargo / Função <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Coordenador de Logística, Designer UI/UX..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle"
            />
          </div>

          {/* Role Selection (Admin, Gestor, Membro) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Perfil de Permissão <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPermissionRole('member')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  permissionRole === 'member'
                    ? 'bg-blue-50/80 dark:bg-blue-900/25 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-2xs ring-1 ring-blue-500/30'
                    : 'bg-sunken border-line text-ink hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <UserCheck className="w-4 h-4 text-muted" />
                  {permissionRole === 'member' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Membro</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Acesso básico e execução</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPermissionRole('manager')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  permissionRole === 'manager'
                    ? 'bg-purple-50/80 dark:bg-purple-900/25 border-purple-500 dark:border-purple-500 text-purple-700 dark:text-purple-300 shadow-2xs ring-1 ring-purple-500/30'
                    : 'bg-sunken border-line text-ink hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Briefcase className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  {permissionRole === 'manager' && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Gestor</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Gerencia quadros e times</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPermissionRole('admin')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  permissionRole === 'admin'
                    ? 'bg-amber-50/80 dark:bg-amber-900/25 border-amber-500 dark:border-amber-500 text-amber-700 dark:text-amber-300 shadow-2xs ring-1 ring-amber-500/30'
                    : 'bg-sunken border-line text-ink hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  {permissionRole === 'admin' && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Admin</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Acesso e controle total</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-ink border border-transparent rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Cadastrar Membro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
