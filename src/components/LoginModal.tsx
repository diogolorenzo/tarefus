import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { signInWithGoogle } from '../lib/firebase';
import { X, Users, Check, UserPlus, ShieldCheck, Briefcase, UserCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    users,
    currentUser,
    setCurrentUserById,
    addUser,
    showToast,
  } = useTaskContext();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSelectUser = (userId: string) => {
    setCurrentUserById(userId);
    setIsLoginModalOpen(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningInGoogle(true);
      const googleUser = await signInWithGoogle();
      if (googleUser) {
        // Check if user already exists
        const existing = users.find(
          (u) => u.email.toLowerCase() === (googleUser.email || '').toLowerCase()
        );
        if (existing) {
          setCurrentUserById(existing.id);
          showToast(`Conectado com Google como ${existing.name}!`, 'success');
        } else {
          const userName = googleUser.displayName || 'Usuário Google';
          const userEmail = googleUser.email || 'usuario@empresa.com';
          const newUser = await addUser(userName, 'Colaborador', userEmail, 'member', false);
          setCurrentUserById(newUser.id);
          showToast(`Conta criada com Google para ${userName}!`, 'success');
        }
        setIsLoginModalOpen(false);
      }
    } catch {
      showToast('Aviso: Login com Google requer configuração de popups ou ambiente autenticado.', 'info');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const userEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`;
    const newUser = await addUser(name.trim(), role.trim(), userEmail, 'member', false);
    setCurrentUserById(newUser.id);
    setName('');
    setRole('');
    setEmail('');
    setIsAddingNew(false);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white dark:bg-[#121826] rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#161F32]/80">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Identificação & Acesso Corporativo</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Google Sign-in Option */}
          <button
            type="button"
            disabled={isSigningInGoogle}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white dark:bg-[#182032] hover:bg-slate-50 dark:hover:bg-[#1f2a42] border border-slate-200 dark:border-white/[0.1] rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningInGoogle ? 'Conectando...' : 'Entrar com Google (Firebase Auth)'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 dark:bg-white/[0.08] flex-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ou selecione seu perfil
            </span>
            <div className="h-px bg-slate-200 dark:bg-white/[0.08] flex-1" />
          </div>

          {/* User List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {users.map((user) => {
              const isSelected = currentUser?.id === user.id;
              const roleType = user.permissionRole || (user.isAdmin ? 'admin' : 'member');

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-[#1A2234] border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${user.avatarColor}`}
                    >
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</h4>
                        {roleType === 'admin' ? (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : roleType === 'manager' ? (
                          <span className="text-[9px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Briefcase className="w-2.5 h-2.5" /> Gestor
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Membro
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Acessar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New User Toggle/Form */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            {!isAddingNew ? (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 px-3 border border-dashed border-slate-300 dark:border-white/[0.08] hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar novo colaborador</span>
              </button>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-3 bg-slate-50 dark:bg-[#0D121E]/60 p-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Novo Colaborador</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nome completo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Cargo / Setor (ex: Suporte Técnico)..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs shadow-blue-600/20"
                >
                  Salvar e Conectar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
