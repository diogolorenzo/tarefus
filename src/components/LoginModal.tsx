import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { X, Users, Check, UserPlus } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    users,
    currentUser,
    setCurrentUserById,
    addUser,
  } = useTaskContext();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSelectUser = (userId: string) => {
    setCurrentUserById(userId);
    setIsLoginModalOpen(false);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const userEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`;
    const newUser = addUser(name, role, userEmail);
    setCurrentUserById(newUser.id);
    setName('');
    setRole('');
    setEmail('');
    setIsAddingNew(false);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white dark:bg-[#121826] rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-white/[0.08] overflow-hidden dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#161F32]/80">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Trocar de Usuário</h3>
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
        <div className="p-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Selecione qual funcionário está utilizando o sistema para ver o espaço personalizado de tarefas:
          </p>

          {/* User List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {users.map((user) => {
              const isSelected = currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-[#1A2234] border-indigo-300 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xs shrink-0 ${user.avatarColor}`}
                    >
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</h4>
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Entrar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New User Toggle/Form */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            {!isAddingNew ? (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2.5 px-3 border border-dashed border-slate-300 dark:border-white/[0.08] hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="w-full px-3 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Cargo / Área (ex: Financeiro)..."
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs shadow-indigo-600/20"
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
