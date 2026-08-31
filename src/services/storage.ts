import type { Board, CompanyInfo, Task, User } from '../types';
import { INITIAL_BOARDS, INITIAL_COMPANY, INITIAL_TASKS, INITIAL_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  TASKS: 'tarefus_tasks_v1',
  BOARDS: 'tarefus_boards_v1',
  USERS: 'tarefus_users_v1',
  CURRENT_USER_ID: 'tarefus_current_user_id_v1',
  AUTH_SESSION: 'tarefus_auth_session_v1',
  THEME: 'tarefus_theme_v1',
  COMPANY: 'tarefus_company_v1',
};

export interface AuthSession {
  userId: string;
  token: string;
  rememberMe: boolean;
  loggedInAt: string;
}

export const loadAuthSession = (): AuthSession | null => {
  try {
    // Check localStorage first (rememberMe: true)
    const local = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (local) {
      return JSON.parse(local);
    }
    // Check sessionStorage (rememberMe: false)
    const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (session) {
      return JSON.parse(session);
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler sessão de autenticação:', error);
    return null;
  }
};

export const saveAuthSession = (session: AuthSession): void => {
  try {
    const raw = JSON.stringify(session);
    if (session.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, raw);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, raw);
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, session.userId);
  } catch (error) {
    console.error('Erro ao salvar sessão de autenticação:', error);
  }
};

export const clearAuthSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed: Task[] = JSON.parse(raw);
    return parsed.map((t) => ({
      ...t,
      assigneeIds: Array.isArray(t.assigneeIds)
        ? t.assigneeIds
        : t.assigneeId
        ? [t.assigneeId]
        : [],
    }));
  } catch (error) {
    console.error('Erro ao carregar tarefas do LocalStorage', error);
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Erro ao salvar tarefas no LocalStorage', error);
  }
};

export const loadBoards = (): Board[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOARDS);
    if (!raw) {
      saveBoards(INITIAL_BOARDS);
      return INITIAL_BOARDS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao carregar quadros do LocalStorage', error);
    return INITIAL_BOARDS;
  }
};

export const saveBoards = (boards: Board[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  } catch (error) {
    console.error('Erro ao salvar quadros no LocalStorage', error);
  }
};

export const loadCompany = (): CompanyInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (!raw) {
      saveCompany(INITIAL_COMPANY);
      return INITIAL_COMPANY;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_COMPANY,
      ...parsed,
    };
  } catch (error) {
    console.error('Erro ao carregar dados da empresa do LocalStorage', error);
    return INITIAL_COMPANY;
  }
};

export const saveCompany = (company: CompanyInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  } catch (error) {
    console.error('Erro ao salvar dados da empresa no LocalStorage', error);
  }
};

export const loadUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }

    let needsSave = false;
    const migratedUsers: User[] = parsed.map((u, index) => {
      if (u.isAdmin === undefined) {
        needsSave = true;
        return {
          ...u,
          isAdmin: u.id === 'user-1' || u.id === 'user-4' || index === 0,
        };
      }
      return u;
    });

    // Ensure at least one admin exists
    if (!migratedUsers.some((u) => u.isAdmin === true)) {
      migratedUsers[0].isAdmin = true;
      needsSave = true;
    }

    if (needsSave) {
      saveUsers(migratedUsers);
    }

    return migratedUsers;
  } catch (error) {
    console.error('Erro ao carregar usuários do LocalStorage', error);
    return INITIAL_USERS;
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Erro ao salvar usuários no LocalStorage', error);
  }
};

export const loadCurrentUserId = (): string => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!raw) {
      const defaultId = INITIAL_USERS[0].id;
      saveCurrentUserId(defaultId);
      return defaultId;
    }
    return raw;
  } catch {
    return INITIAL_USERS[0].id;
  }
};

export const saveCurrentUserId = (userId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  } catch (error) {
    console.error('Erro ao salvar usuário atual no LocalStorage', error);
  }
};

export const loadTheme = (): 'light' | 'dark' => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Erro ao salvar tema no LocalStorage', error);
  }
};

export const resetAllData = (): {
  tasks: Task[];
  boards: Board[];
  users: User[];
  currentUserId: string;
  company: CompanyInfo;
} => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.BOARDS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.COMPANY);
  } catch (error) {
    console.error('Erro ao limpar LocalStorage', error);
  }
  return {
    tasks: INITIAL_TASKS,
    boards: INITIAL_BOARDS,
    users: INITIAL_USERS,
    currentUserId: INITIAL_USERS[0].id,
    company: INITIAL_COMPANY,
  };
};
