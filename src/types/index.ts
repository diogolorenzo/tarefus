export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type ActiveTab = 'board' | 'my-tasks' | 'settings';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: string; // Tailwind color class or hex
  isAdmin?: boolean;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  status: TaskStatus;
  assigneeIds: string[];
  assigneeId?: string; // Mantido como opcional para retrocompatibilidade
  dueDate?: string; // ISO date format YYYY-MM-DD
  checklist: ChecklistItem[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface CompanyInfo {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  segment?: string;
  description?: string;
  updatedAt?: string;
}

