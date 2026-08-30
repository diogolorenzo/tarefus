import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { InviteMemberModal } from './InviteMemberModal';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Search,
  Check,
  Mail,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export const MembersSettings: React.FC = () => {
  const { users, currentUser, toggleUserAdmin, deleteUser } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'collaborator'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const adminCount = users.filter((u) => u.isAdmin).length;
  const collaboratorCount = users.filter((u) => !u.isAdmin).length;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'admin') return Boolean(user.isAdmin);
    if (roleFilter === 'collaborator') return !user.isAdmin;
    return true;
  });

  const handleDeleteUser = (user: { id: string; name: string; isAdmin?: boolean }) => {
    if (user.id === currentUser?.id) return;
    if (user.isAdmin && adminCount <= 1) return;

    if (
      window.confirm(
        `Deseja realmente remover o colaborador "${user.name}" da equipe?\n\nAs tarefas atribuídas a ele serão mantidas no sistema.`
      )
    ) {
      deleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Membros & Permissões</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie colaboradores, convide novos membros e controle privilégios de administrador
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/25 active:scale-98 cursor-pointer flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Convidar Membro</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total de Membros
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {users.length}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Administradores
            </span>
            <h4 className="text-lg font-black text-blue-600 dark:text-blue-400 leading-tight">
              {adminCount}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Colaboradores
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {collaboratorCount}
            </h4>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, email ou cargo..."
            className="w-full pl-9.5 pr-4 py-2 bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl border border-transparent dark:border-white/[0.05]">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white dark:bg-[#1A2234] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-white dark:bg-[#1A2234] text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('collaborator')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'collaborator'
                ? 'bg-white dark:bg-[#1A2234] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Colaboradores ({collaboratorCount})
          </button>
        </div>
      </div>

      {/* Members List Table / Cards */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#121826] rounded-3xl border border-slate-200/80 dark:border-white/[0.08]">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nenhum membro encontrado</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Tente outro termo de busca ou convide um novo colaborador.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#121826] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#161F32]/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Colaborador</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Cargo / Função</th>
                  <th className="py-3.5 px-4">Permissão</th>
                  <th className="py-3.5 px-4 text-center">Status Admin</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-xs">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  const isLastAdmin = Boolean(user.isAdmin && adminCount <= 1);

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Avatar & Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white shadow-xs shrink-0 ${user.avatarColor}`}
                          >
                            {user.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {user.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-medium">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Permission Badge */}
                      <td className="py-4 px-4">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-700/40 text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Administrador</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                            <span>Colaborador</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => toggleUserAdmin(user.id)}
                            disabled={isLastAdmin}
                            title={
                              isLastAdmin
                                ? 'A empresa precisa de ao menos 1 administrador'
                                : user.isAdmin
                                ? 'Revogar acesso de administrador'
                                : 'Tornar administrador'
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              user.isAdmin ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                            } ${isLastAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                                user.isAdmin ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            >
                              {user.isAdmin ? (
                                <Check className="w-3 h-3 text-blue-600 stroke-[3]" />
                              ) : null}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Remove Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isCurrent || isLastAdmin}
                          title={
                            isCurrent
                              ? 'Você não pode remover a si mesmo'
                              : isLastAdmin
                              ? 'Não é possível remover o único administrador'
                              : 'Remover colaborador da equipe'
                          }
                          className={`p-2 rounded-xl transition-colors ${
                            isCurrent || isLastAdmin
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40'
                              : 'text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last admin notice */}
      {adminCount <= 1 && (
        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/30 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            🛡️ <strong>Regra de Segurança:</strong> Ao menos um colaborador deve manter permissões de Administrador ativas no sistema.
          </p>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}
    </div>
  );
};
