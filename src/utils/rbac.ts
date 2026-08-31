import type { PermissionRole, Task, User, Board } from '../types';

export const getEffectiveRole = (user: User | null): PermissionRole => {
  if (!user) return 'member';
  if (user.permissionRole) return user.permissionRole;
  if (user.isAdmin) return 'admin';
  return 'member';
};

export const canManageCompany = (user: User | null): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin';
};

export const canManageMembers = (user: User | null): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin';
};

export const canManageAuditLogs = (user: User | null): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin';
};

export const canCreateBoard = (user: User | null): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin' || role === 'manager';
};

export const canEditBoard = (user: User | null, board?: Board): boolean => {
  if (!user) return false;
  const role = getEffectiveRole(user);
  if (role === 'admin') return true;
  if (role === 'manager') {
    if (!board || !board.createdBy) return true;
    return board.createdBy === user.id || (board.memberIds && board.memberIds.includes(user.id)) || true;
  }
  return false;
};

export const canDeleteBoard = (user: User | null): boolean => {
  const role = getEffectiveRole(user);
  return role === 'admin';
};

export const canCreateTask = (user: User | null): boolean => {
  return Boolean(user);
};

export const canEditTask = (user: User | null, _task?: Task): boolean => {
  if (!user) return false;
  return true;
};

export const canDeleteTask = (user: User | null, task?: Task): boolean => {
  if (!user) return false;
  const role = getEffectiveRole(user);
  if (role === 'admin' || role === 'manager') return true;
  if (task && task.assigneeIds && task.assigneeIds.includes(user.id)) return true;
  return false;
};

export const getRoleBadgeInfo = (role: PermissionRole) => {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrador',
        shortLabel: 'Admin',
        color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50',
        description: 'Acesso irrestrito a configurações, membros, auditoria e todos os quadros.',
      };
    case 'manager':
      return {
        label: 'Gestor de Equipe',
        shortLabel: 'Gestor',
        color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700/50',
        description: 'Criação e administração de quadros setoriais, delegação e acompanhamento.',
      };
    case 'member':
    default:
      return {
        label: 'Colaborador / Membro',
        shortLabel: 'Membro',
        color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/50',
        description: 'Execução de tarefas, movimentação de status e participação nos fluxos.',
      };
  }
};
