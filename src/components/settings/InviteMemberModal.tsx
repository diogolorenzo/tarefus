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
  AlertCircle,
} from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose }) => {
  const { addUser, users, entitlements, showToast } = useTaskContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [permissionRole, setPermissionRole] = useState<PermissionRole>('member');
  const [formError, setFormError] = useState<string | null>(null);

  const activeSeats = users.filter((u) => u.status !== 'inactive').length;
  const assignedSeats = entitlements?.seats.assignedSeats ?? activeSeats;
  const maxSeats = entitlements?.seats.maxSeats ?? 3;
  const isAtOrOverLimit = entitlements ? entitlements.seats.isAtOrOverLimit : (assignedSeats >= maxSeats);
  const canAssignSeat = entitlements ? entitlements.seats.canAssignSeat : (assignedSeats < maxSeats);

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
    setFormError(null);

    if (isAtOrOverLimit || !canAssignSeat) {
      const limitMsg = 'O limite de membros do plano atual foi atingido. Para adicionar novos colaboradores, solicite um upgrade de plano.';
      setFormError(limitMsg);
      showToast(limitMsg, 'error');
      return;
    }

    if (!name.trim() || !email.trim() || !role.trim()) return;

    try {
      addUser(name.trim(), role.trim(), email.trim(), permissionRole, permissionRole === 'admin');
      setName('');
      setEmail('');
      setRole('');
      setPermissionRole('member');
      setFormError(null);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar membro.');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('');
    setPermissionRole('member');
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface rounded-3xl shadow-2xl max-w-md w-full border border-slate-200/80 dark:border-white/[0.08] overflow-hidden transition-all animate-modal-pop"
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
          {/* Seat Capacity Warning Banner */}
          {(isAtOrOverLimit || !canAssignSeat) && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  Limite de Membros Atingido ({assignedSeats}/{maxSeats})
                </span>
                <span>
                  O limite de membros do plano atual foi atingido. Para adicionar novos colaboradores, solicite um upgrade de plano.
                </span>
              </div>
            </div>
          )}

          {/* Form Error */}
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

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
              disabled={isAtOrOverLimit || !canAssignSeat}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
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
              disabled={isAtOrOverLimit || !canAssignSeat}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
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
              disabled={isAtOrOverLimit || !canAssignSeat}
              className="w-full px-4 py-2.5 bg-sunken border border-line rounded-xl text-sm font-semibold text-ink focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 focus:bg-surface transition-all placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
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
                disabled={isAtOrOverLimit || !canAssignSeat}
                onClick={() => setPermissionRole('member')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
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
                disabled={isAtOrOverLimit || !canAssignSeat}
                onClick={() => setPermissionRole('manager')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
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
                disabled={isAtOrOverLimit || !canAssignSeat}
                onClick={() => setPermissionRole('admin')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
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
              disabled={isAtOrOverLimit || !canAssignSeat}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
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
