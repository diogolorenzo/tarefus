import React, { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { InviteMemberModal } from './InviteMemberModal';
import type { PermissionRole, User } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Briefcase,
  Trash2,
  Search,
  Mail,
  UserCheck,
} from 'lucide-react';

export const MembersSettings: React.FC = () => {
  const { users, currentUser, updateUser, deleteUser } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'member'>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const adminCount = users.filter((u) => u.isAdmin || u.permissionRole === 'admin').length;
  const managerCount = users.filter((u) => u.permissionRole === 'manager').length;
  const memberCount = users.filter((u) => (!u.isAdmin && u.permissionRole !== 'manager') || u.permissionRole === 'member').length;

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'admin') return Boolean(user.isAdmin || user.permissionRole === 'admin');
    if (roleFilter === 'manager') return user.permissionRole === 'manager';
    if (roleFilter === 'member') return !user.isAdmin && user.permissionRole !== 'manager';
    return true;
  });

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) return;
    if ((user.isAdmin || user.permissionRole === 'admin') && adminCount <= 1) return;

    if (
      window.confirm(
        `Deseja realmente remover o colaborador "${user.name}" da equipe?\n\nAs tarefas atribuídas a ele serão mantidas no sistema.`
      )
    ) {
      deleteUser(user.id);
    }
  };

  const handleRoleChange = (userId: string, newRole: PermissionRole) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if ((target.isAdmin || target.permissionRole === 'admin') && newRole !== 'admin' && adminCount <= 1) {
      alert('A empresa precisa ter pelo menos um administrador ativo.');
      return;
    }

    updateUser(userId, {
      permissionRole: newRole,
      isAdmin: newRole === 'admin',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Membros & Permissões Corporativas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gerencie colaboradores, convites e perfis de acesso (Admin, Gestor e Membro)
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
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

        <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Administradores
            </span>
            <h4 className="text-lg font-black text-amber-600 dark:text-amber-400 leading-tight">
              {adminCount}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gestores
            </span>
            <h4 className="text-lg font-black text-purple-600 dark:text-purple-400 leading-tight">
              {managerCount}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121826] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Membros / Executores
            </span>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {memberCount}
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
                ? 'bg-white dark:bg-[#1A2234] text-amber-600 dark:text-amber-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('manager')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'manager'
                ? 'bg-white dark:bg-[#1A2234] text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gestores ({managerCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('member')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              roleFilter === 'member'
                ? 'bg-white dark:bg-[#1A2234] text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Membros ({memberCount})
          </button>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          {filteredUsers.map((user) => {
            const isMe = user.id === currentUser?.id;
            const currentRole: PermissionRole = user.permissionRole || (user.isAdmin ? 'admin' : 'member');

            return (
              <div
                key={user.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* User Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 ${
                      user.avatarColor || 'bg-blue-600'
                    }`}
                  >
                    {user.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                          Você
                        </span>
                      )}
                      {currentRole === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : currentRole === 'manager' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> Gestor
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Membro
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        {user.role}
                      </span>
                      <span className="hidden sm:inline opacity-40">•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher & Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                  {/* Select Role */}
                  <select
                    value={currentRole}
                    disabled={isMe && currentRole === 'admin' && adminCount <= 1}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as PermissionRole)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-[#0D121E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="member">Membro</option>
                    <option value="manager">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>

                  {/* Delete User */}
                  <button
                    type="button"
                    disabled={isMe || ((user.isAdmin || currentRole === 'admin') && adminCount <= 1)}
                    onClick={() => handleDeleteUser(user)}
                    title={
                      isMe
                        ? 'Você não pode excluir sua própria conta'
                        : (user.isAdmin || currentRole === 'admin') && adminCount <= 1
                        ? 'Não é possível remover o único administrador'
                        : 'Remover colaborador'
                    }
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
