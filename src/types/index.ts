export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Priority = 'low' | 'medium' | 'high';

export type PermissionRole = 'admin' | 'manager' | 'member';

export type ActiveTab = 'board' | 'my-tasks' | 'settings';

export type AppRoute =
  | { type: 'app'; tab: 'board' | 'my-tasks' | 'settings' }
  | { type: 'auth'; mode: 'login' | 'register' }
  | { type: 'pricing' }
  | { type: 'guide-landing' }
  | { type: 'guide-article'; slug: string }
  | { type: 'not-found' };

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: string;
  permissionRole?: PermissionRole;
  initials: string;
  avatarColor: string; // Tailwind color class or hex
  avatarUrl?: string;
  isAdmin?: boolean;
  status?: 'active' | 'inactive';
  lastLoginAt?: string;
  hasSeenTour?: boolean;
  resetCode?: string;
  resetCodeExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  createdBy?: string;
  memberIds?: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface KanbanColumn {
  id: string;
  boardId: string;
  title: string;
  statusKey: TaskStatus;
  order: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: Priority;
  boardId: string;
  status: TaskStatus;
  assigneeIds: string[];
  assigneeId?: string; // Mantido como opcional para retrocompatibilidade
  dueDate?: string; // ISO date format YYYY-MM-DD
  tags?: string[];
  checklist: ChecklistItem[];
  aiNotes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  boardId?: string;
  userId: string;
  userName: string;
  action: 'create' | 'move' | 'status_change' | 'complete' | 'reopen' | 'edit' | 'delete' | 'comment' | 'seed';
  details: string;
  timestamp: string;
}

export interface CompanyInfo {
  id?: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  segment?: string;
  description?: string;
  updatedAt?: string;
}


