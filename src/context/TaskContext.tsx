import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ActiveTab, Board, CompanyInfo, PermissionRole, Task, TaskStatus, User, ActivityLog } from '../types';
import {
  loadBoards,
  loadCompany,
  loadCurrentUserId,
  loadTasks,
  loadTheme,
  loadUsers,
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  resetAllData,
  saveBoards,
  saveCompany,
  saveCurrentUserId,
  saveTasks,
  saveTheme,
  saveUsers,
} from '../services/storage';
import { logoutFirebase } from '../lib/firebase';
import {
  ensureDatabaseSeeded,
  saveTaskToFirestore,
  batchSaveTasksToFirestore,
  deleteTaskFromFirestore,
  saveBoardToFirestore,
  deleteBoardFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  saveCompanyToFirestore,
  logActivityToFirestore,
  subscribeToTasks,
  subscribeToBoards,
  subscribeToUsers,
  subscribeToActivityLogs,
  seedCorporateData,
} from '../services/firestoreService';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface TaskModalState {
  isOpen: boolean;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  defaultBoardId?: string;
}

export interface TaskContextType {
  tasks: Task[];
  boards: Board[];
  users: User[];
  currentUser: User | null;
  company: CompanyInfo;
  activityLogs: ActivityLog[];
  isCloudSynced: boolean;
  updateCompany: (updates: Partial<CompanyInfo>) => Promise<void>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedBoardId: string; // 'all' or specific board id
  setSelectedBoardId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterAssignee: string; // 'all' or user id
  setFilterAssignee: (userId: string) => void;

  // Auth & Session
  isAuthenticated: boolean;
  sessionToken: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: string; permissionRole?: PermissionRole }) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Modals & Help & Tour
  taskModal: TaskModalState;
  openTaskModal: (task?: Task | null, defaultStatus?: TaskStatus, defaultBoardId?: string) => void;
  closeTaskModal: () => void;
  isBoardModalOpen: boolean;
  setIsBoardModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isHelpCenterOpen: boolean;
  setIsHelpCenterOpen: (open: boolean) => void;
  isTourActive: boolean;
  tourStep: number;
  setTourStep: (step: number) => void;
  startTour: () => void;
  endTour: (markAsCompleted?: boolean) => void;
  markTourAsCompleted: (userId?: string) => Promise<void>;

  // Actions
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, destinationStatus: TaskStatus, newIndex?: number) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleChecklistItem: (taskId: string, itemId: string) => Promise<void>;
  addChecklistItem: (taskId: string, text: string) => Promise<void>;
  removeChecklistItem: (taskId: string, itemId: string) => Promise<void>;

  // Boards
  addBoard: (name: string, color: string, icon?: string, description?: string) => Promise<Board>;
  updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;

  // Users
  setCurrentUserById: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserAdmin: (userId: string) => Promise<void>;
  addUser: (name: string, role: string, email: string, permissionRole?: PermissionRole, isAdmin?: boolean, password?: string) => Promise<User>;

  // System & Logs
  resetDemoData: () => Promise<void>;
  reseedDatabase: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [boards, setBoards] = useState<Board[]>(() => loadBoards());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [company, setCompany] = useState<CompanyInfo>(() => loadCompany());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const initialSession = loadAuthSession();
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => initialSession?.userId || loadCurrentUserId());
  
  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(initialSession?.userId);
  });
  const [sessionToken, setSessionToken] = useState<string | null>(() => initialSession?.token || null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const [taskModal, setTaskModal] = useState<TaskModalState>({ isOpen: false, task: null });
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => loadTheme());

  // Initialize and Sync with Firestore
  useEffect(() => {
    let unsubscribeTasks: (() => void) | undefined;
    let unsubscribeBoards: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeLogs: (() => void) | undefined;

    const initCloudDatabase = async () => {
      try {
        await ensureDatabaseSeeded();
        setIsCloudSynced(true);

        // Subscribe to real-time updates
        unsubscribeTasks = subscribeToTasks((cloudTasks) => {
          if (Array.isArray(cloudTasks)) {
            setTasks(cloudTasks);
            saveTasks(cloudTasks);
          }
        });

        unsubscribeBoards = subscribeToBoards((cloudBoards) => {
          if (Array.isArray(cloudBoards) && cloudBoards.length > 0) {
            setBoards(cloudBoards);
            saveBoards(cloudBoards);
          }
        });

        unsubscribeUsers = subscribeToUsers((cloudUsers) => {
          if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
            setUsers(cloudUsers);
            saveUsers(cloudUsers);
          }
        });

        unsubscribeLogs = subscribeToActivityLogs((cloudLogs) => {
          if (cloudLogs) {
            setActivityLogs(cloudLogs);
          }
        });
      } catch (err) {
        console.warn('Usando armazenamento local/híbrido com fallback:', err);
      }
    };

    initCloudDatabase();

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeBoards) unsubscribeBoards();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeLogs) unsubscribeLogs();
    };
  }, []);

  // Sync theme with HTML documentElement and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado', 'info');
  };

  const currentUser = isAuthenticated
    ? (users.find((u) => u.id === currentUserId) || users[0] || null)
    : null;

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openTaskModal = (task: Task | null = null, defaultStatus: TaskStatus = 'todo', defaultBoardId?: string) => {
    setTaskModal({
      isOpen: true,
      task,
      defaultStatus,
      defaultBoardId: defaultBoardId || (selectedBoardId !== 'all' ? selectedBoardId : boards[0]?.id),
    });
  };

  const closeTaskModal = () => {
    setTaskModal({ isOpen: false, task: null });
  };

  const markTourAsCompleted = async (userId?: string) => {
    const targetId = userId || currentUser?.id;
    if (!targetId) return;
    try {
      localStorage.setItem(`tarefus_tour_seen_${targetId}`, 'true');
      await updateUser(targetId, { hasSeenTour: true });
    } catch {
      // ignore
    }
  };

  const startTour = () => {
    setActiveTab('board');
    setIsHelpCenterOpen(false);
    setTourStep(0);
    setIsTourActive(true);
  };

  const endTour = (markAsCompleted = true) => {
    setIsTourActive(false);
    if (markAsCompleted && currentUser?.id) {
      markTourAsCompleted(currentUser.id);
    }
  };

  // Auto trigger tour on user's first login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const tourKey = `tarefus_tour_seen_${currentUser.id}`;
      const localSeen = localStorage.getItem(tourKey) === 'true';
      if (!currentUser.hasSeenTour && !localSeen) {
        const timer = setTimeout(() => {
          setIsTourActive(true);
          setTourStep(0);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.hasSeenTour]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ignore shortcut if user is currently typing in an input, textarea or select
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        if (isTourActive) {
          endTour(true);
        } else if (isHelpCenterOpen) {
          setIsHelpCenterOpen(false);
        } else if (taskModal.isOpen) {
          closeTaskModal();
        } else if (isBoardModalOpen) {
          setIsBoardModalOpen(false);
        }
        return;
      }

      if (isInput) return;

      // '?' -> Open Help Center
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsHelpCenterOpen((prev) => !prev);
        return;
      }

      // 'N' or 'n' -> Open New Task Modal
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        openTaskModal(null, 'todo');
        return;
      }

      // '1' -> View Boards
      if (e.key === '1' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTab('board');
        return;
      }

      // '2' -> View My Tasks
      if (e.key === '2' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTab('my-tasks');
        return;
      }

      // '3' -> View Settings
      if (e.key === '3' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveTab('settings');
        return;
      }

      // 'd' or 'D' -> Toggle Dark Mode
      if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // '/' -> Focus search input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement | null;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isTourActive, isHelpCenterOpen, taskModal.isOpen, isBoardModalOpen, toggleTheme, openTaskModal, setActiveTab]);

  // ==========================================
  // TASKS ACTIONS
  // ==========================================
  const addTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Task> => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // Save to Firestore
    try {
      await saveTaskToFirestore(newTask);
      await logActivityToFirestore({
        taskId: newTask.id,
        taskTitle: newTask.title,
        boardId: newTask.boardId,
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'Colaborador',
        action: 'create',
        details: `Criou a tarefa "${newTask.title}"`,
      });
    } catch (err) {
      console.warn('Erro ao sincronizar tarefa com Firestore:', err);
    }

    showToast('Tarefa criada e sincronizada no banco!', 'success');
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...targetTask,
      ...updates,
      updatedAt: now,
    };

    const updatedTasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    try {
      await saveTaskToFirestore(updatedTask);
      if (updates.status && updates.status !== targetTask.status) {
        await logActivityToFirestore({
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          boardId: updatedTask.boardId,
          userId: currentUser?.id || 'user-1',
          userName: currentUser?.name || 'Colaborador',
          action: updatedTask.status === 'done' ? 'complete' : 'status_change',
          details: `Moveu status para "${updatedTask.status === 'done' ? 'Concluído' : updatedTask.status === 'in_progress' ? 'Em Andamento' : 'A Fazer'}"`,
        });
      }
    } catch (err) {
      console.warn('Erro ao atualizar tarefa no Firestore:', err);
    }

    showToast('Tarefa atualizada!', 'info');
  };

  const deleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    try {
      await deleteTaskFromFirestore(taskId);
      if (taskToDelete) {
        await logActivityToFirestore({
          taskId,
          taskTitle: taskToDelete.title,
          boardId: taskToDelete.boardId,
          userId: currentUser?.id || 'user-1',
          userName: currentUser?.name || 'Colaborador',
          action: 'delete',
          details: `Excluiu a tarefa "${taskToDelete.title}"`,
        });
      }
    } catch (err) {
      console.warn('Erro ao excluir tarefa do Firestore:', err);
    }

    showToast('Tarefa excluída!', 'info');
  };

  const moveTask = async (taskId: string, destinationStatus: TaskStatus, newIndex?: number) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (targetTask.status === destinationStatus && newIndex === undefined) return;

    const updatedTask = {
      ...targetTask,
      status: destinationStatus,
      updatedAt: new Date().toISOString(),
    };

    const otherTasks = tasks.filter((t) => t.id !== taskId);
    let newTasksList: Task[];

    if (newIndex !== undefined) {
      const destStatusTasks = otherTasks.filter((t) => t.status === destinationStatus);
      const remainingTasks = otherTasks.filter((t) => t.status !== destinationStatus);
      destStatusTasks.splice(newIndex, 0, updatedTask);
      newTasksList = [...remainingTasks, ...destStatusTasks];
    } else {
      newTasksList = [updatedTask, ...otherTasks];
    }

    setTasks(newTasksList);
    saveTasks(newTasksList);

    try {
      await saveTaskToFirestore(updatedTask);
      await logActivityToFirestore({
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        boardId: updatedTask.boardId,
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'Colaborador',
        action: 'move',
        details: `Moveu tarefa para "${destinationStatus === 'done' ? 'Concluído' : destinationStatus === 'in_progress' ? 'Em Andamento' : 'A Fazer'}"`,
      });
    } catch (err) {
      console.warn('Erro ao mover tarefa no Firestore:', err);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(taskId, { status: newStatus });
    if (newStatus === 'done') {
      showToast('🎉 Parabéns! Tarefa concluída!', 'success');
    }
  };

  const toggleChecklistItem = async (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await updateTask(taskId, { checklist: updatedChecklist });
  };

  const addChecklistItem = async (taskId: string, text: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !text.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: text.trim(),
      completed: false,
    };

    await updateTask(taskId, { checklist: [...task.checklist, newItem] });
  };

  const removeChecklistItem = async (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.filter((item) => item.id !== itemId);
    await updateTask(taskId, { checklist: updatedChecklist });
  };

  // ==========================================
  // COMPANY ACTIONS
  // ==========================================
  const updateCompany = async (updates: Partial<CompanyInfo>) => {
    const updated: CompanyInfo = {
      ...company,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setCompany(updated);
    saveCompany(updated);

    try {
      await saveCompanyToFirestore(updated);
    } catch (err) {
      console.warn('Erro ao atualizar empresa no Firestore:', err);
    }

    showToast('Informações da empresa atualizadas!', 'success');
  };

  // ==========================================
  // BOARDS ACTIONS
  // ==========================================
  const addBoard = async (name: string, color: string, icon = 'Folder', description = ''): Promise<Board> => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      description: description.trim(),
      createdBy: currentUser?.id || 'admin',
      memberIds: [currentUser?.id || 'user-1'],
      order: boards.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);
    saveBoards(updatedBoards);

    try {
      await saveBoardToFirestore(newBoard);
      await logActivityToFirestore({
        boardId: newBoard.id,
        userId: currentUser?.id || 'user-1',
        userName: currentUser?.name || 'Administrador',
        action: 'create',
        details: `Criou novo quadro de área: "${newBoard.name}"`,
      });
    } catch (err) {
      console.warn('Erro ao salvar quadro no Firestore:', err);
    }

    showToast(`Quadro "${name}" criado com sucesso!`, 'success');
    return newBoard;
  };

  const updateBoard = async (boardId: string, updates: Partial<Board>) => {
    const updatedBoards = boards.map((b) =>
      b.id === boardId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    setBoards(updatedBoards);
    saveBoards(updatedBoards);

    const target = updatedBoards.find((b) => b.id === boardId);
    if (target) {
      try {
        await saveBoardToFirestore(target);
      } catch (err) {
        console.warn('Erro ao atualizar quadro no Firestore:', err);
      }
    }

    showToast('Quadro atualizado com sucesso!', 'info');
  };

  const deleteBoard = async (boardId: string) => {
    if (boards.length <= 1) {
      showToast('Não é possível excluir o único quadro existente.', 'error');
      return;
    }

    const targetBoard = boards.find((b) => b.id === boardId);
    const updatedBoards = boards.filter((b) => b.id !== boardId);
    const fallbackBoardId = updatedBoards[0].id;
    const updatedTasks = tasks.map((t) =>
      t.boardId === boardId ? { ...t, boardId: fallbackBoardId } : t
    );

    setBoards(updatedBoards);
    setTasks(updatedTasks);
    saveBoards(updatedBoards);
    saveTasks(updatedTasks);

    try {
      await deleteBoardFromFirestore(boardId);
      const reassignedTasks = updatedTasks.filter((t) => t.boardId === fallbackBoardId);
      if (reassignedTasks.length > 0) {
        await batchSaveTasksToFirestore(reassignedTasks);
      }
      if (targetBoard) {
        await logActivityToFirestore({
          boardId,
          userId: currentUser?.id || 'user-1',
          userName: currentUser?.name || 'Administrador',
          action: 'delete',
          details: `Removeu o quadro "${targetBoard.name}"`,
        });
      }
    } catch (err) {
      console.warn('Erro ao excluir quadro do Firestore:', err);
    }

    if (selectedBoardId === boardId) {
      setSelectedBoardId('all');
    }
    showToast('Quadro removido.', 'info');
  };

  // ==========================================
  // USERS ACTIONS
  // ==========================================
  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
    saveCurrentUserId(userId);
    const user = users.find((u) => u.id === userId);
    if (user) {
      showToast(`Conectado como ${user.name}`, 'info');
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    let updatedInitials = updates.initials;
    if (updates.name && !updates.initials) {
      updatedInitials = updates.name
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }

    let updatedTarget: User | null = null;
    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        updatedTarget = {
          ...u,
          ...updates,
          ...(updatedInitials ? { initials: updatedInitials } : {}),
          updatedAt: new Date().toISOString(),
        };
        return updatedTarget;
      }
      return u;
    });

    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    if (updatedTarget) {
      try {
        await saveUserToFirestore(updatedTarget);
      } catch (err) {
        console.warn('Erro ao atualizar usuário no Firestore:', err);
      }
    }

    showToast('Perfil de usuário atualizado!', 'success');
  };

  const deleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (!userToDelete) return;

    if (userToDelete.isAdmin || userToDelete.permissionRole === 'admin') {
      const adminCount = users.filter((u) => u.isAdmin || u.permissionRole === 'admin').length;
      if (adminCount <= 1) {
        showToast('A empresa precisa ter pelo menos um administrador ativo.', 'error');
        return;
      }
    }

    if (users.length <= 1) {
      showToast('Não é possível remover o único usuário cadastrado.', 'error');
      return;
    }

    const updatedUsers = users.filter((u) => u.id !== userId);

    const updatedTasks = tasks.map((t) => {
      const hasInList = t.assigneeIds?.includes(userId);
      const isSingle = t.assigneeId === userId;
      if (!hasInList && !isSingle) return t;

      const newAssigneeIds = (t.assigneeIds || []).filter((id) => id !== userId);
      return {
        ...t,
        assigneeIds: newAssigneeIds,
        assigneeId: isSingle ? (newAssigneeIds[0] || undefined) : t.assigneeId,
        updatedAt: new Date().toISOString(),
      };
    });

    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    try {
      await deleteUserFromFirestore(userId);
      const affectedTasks = updatedTasks.filter((t) =>
        tasks.some((orig) => orig.id === t.id && (orig.assigneeIds?.includes(userId) || orig.assigneeId === userId))
      );
      if (affectedTasks.length > 0) {
        await batchSaveTasksToFirestore(affectedTasks);
      }
      await logActivityToFirestore({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.name || 'Administrador',
        action: 'delete',
        details: `Removeu o colaborador "${userToDelete.name}"`,
      });
    } catch (err) {
      console.warn('Erro ao excluir usuário no Firestore:', err);
    }

    if (currentUserId === userId) {
      const fallbackUserId = updatedUsers[0].id;
      setCurrentUserId(fallbackUserId);
      saveCurrentUserId(fallbackUserId);
    }

    showToast(`Colaborador ${userToDelete.name} removido.`, 'info');
  };

  const toggleUserAdmin = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const isCurrentlyAdmin = targetUser.isAdmin || targetUser.permissionRole === 'admin';
    if (isCurrentlyAdmin) {
      const adminCount = users.filter((u) => u.isAdmin || u.permissionRole === 'admin').length;
      if (adminCount <= 1) {
        showToast('A empresa precisa ter pelo menos um administrador ativo.', 'error');
        return;
      }
    }

    const newAdminStatus = !isCurrentlyAdmin;
    const newRole: PermissionRole = newAdminStatus ? 'admin' : 'member';

    await updateUser(userId, {
      isAdmin: newAdminStatus,
      permissionRole: newRole,
    });

    showToast(
      newAdminStatus
        ? `${targetUser.name} agora é Administrador.`
        : `${targetUser.name} agora é Membro.`,
      'info'
    );
  };

  // ==========================================
  // AUTHENTICATION & SESSION METHODS
  // ==========================================
  const login = async (
    email: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!matchedUser) {
      return {
        success: false,
        error: 'Nenhum colaborador encontrado com este e-mail corporativo.',
      };
    }

    if (matchedUser.status === 'inactive') {
      return {
        success: false,
        error: 'Este usuário corporativo está desativado. Contate o administrador.',
      };
    }

    // Verify password: matches user.password OR default 123456
    const expectedPassword = matchedUser.password || '123456';
    if (password !== expectedPassword) {
      return {
        success: false,
        error: 'Senha incorreta. Verifique os dados ou utilize o link de recuperação.',
      };
    }

    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session = {
      userId: matchedUser.id,
      token,
      rememberMe,
      loggedInAt: new Date().toISOString(),
    };

    saveAuthSession(session);
    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);
    setSessionToken(token);

    // Update lastLoginAt
    const updatedUser: User = {
      ...matchedUser,
      lastLoginAt: new Date().toISOString(),
    };
    await updateUser(matchedUser.id, { lastLoginAt: updatedUser.lastLoginAt });

    try {
      await logActivityToFirestore({
        userId: matchedUser.id,
        userName: matchedUser.name,
        action: 'edit',
        details: `Colaborador "${matchedUser.name}" efetuou login no sistema corporativo`,
      });
    } catch {
      // ignore
    }

    showToast(`Bem-vindo(a) de volta, ${matchedUser.name}!`, 'success');
    return { success: true };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    permissionRole?: PermissionRole;
  }): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = data.email.trim().toLowerCase();
    const exists = users.some(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (exists) {
      return {
        success: false,
        error: 'Já existe um colaborador cadastrado com este e-mail corporativo.',
      };
    }

    const permissionRole: PermissionRole = data.permissionRole || 'member';
    const isAdmin = permissionRole === 'admin';

    const newUser = await addUser(
      data.name,
      data.role,
      data.email,
      permissionRole,
      isAdmin,
      data.password
    );

    // Auto login
    const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session = {
      userId: newUser.id,
      token,
      rememberMe: true,
      loggedInAt: new Date().toISOString(),
    };
    saveAuthSession(session);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    setSessionToken(token);

    showToast(`Conta corporativa de ${newUser.name} criada com sucesso!`, 'success');
    return { success: true };
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; code?: string; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!matchedUser) {
      return {
        success: false,
        error: 'E-mail corporativo não encontrado na base de dados.',
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await updateUser(matchedUser.id, {
      resetCode: code,
      resetCodeExpiresAt: expiresAt,
    });

    return { success: true, code };
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );

    if (!matchedUser) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    if (!matchedUser.resetCode || matchedUser.resetCode.trim() !== code.trim()) {
      return { success: false, error: 'Código de recuperação incorreto.' };
    }

    if (matchedUser.resetCodeExpiresAt && new Date(matchedUser.resetCodeExpiresAt).getTime() < Date.now()) {
      return { success: false, error: 'Código de recuperação expirado.' };
    }

    await updateUser(matchedUser.id, {
      password: newPassword,
      resetCode: '',
      resetCodeExpiresAt: '',
    });

    try {
      await logActivityToFirestore({
        userId: matchedUser.id,
        userName: matchedUser.name,
        action: 'edit',
        details: `Redefiniu a senha corporativa`,
      });
    } catch {
      // ignore
    }

    return { success: true };
  };

  const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const expected = targetUser.password || '123456';
    if (currentPassword !== expected) {
      return { success: false, error: 'A senha atual informada está incorreta.' };
    }

    await updateUser(userId, {
      password: newPassword,
    });

    return { success: true };
  };

  const logout = () => {
    logoutFirebase().catch(() => {});
    clearAuthSession();
    setIsAuthenticated(false);
    setSessionToken(null);
    showToast('Sessão corporativa encerrada.', 'info');
  };

  const addUser = async (
    name: string,
    role: string,
    email: string,
    permissionRole: PermissionRole = 'member',
    isAdmin = false,
    password = '123456'
  ): Promise<User> => {
    const trimmedEmail = email.trim().toLowerCase();
    const exists = users.some(
      (u) => u.email.trim().toLowerCase() === trimmedEmail
    );
    if (exists) {
      showToast('Já existe um colaborador cadastrado com este e-mail.', 'error');
      throw new Error('E-mail corporativo já cadastrado.');
    }

    const initials = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

    const colors = [
      'bg-indigo-600',
      'bg-emerald-500',
      'bg-blue-600',
      'bg-violet-600',
      'bg-amber-600',
      'bg-rose-500',
      'bg-cyan-600',
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      email: email.trim(),
      password: password || '123456',
      passwordHash: '$2a$10$wW4wL6q6jYq2WqY2Y6w6eu9Yw2Y6w6eu9Yw2Y6w6eu9Yw2Y6w6eu.',
      permissionRole,
      initials,
      avatarColor,
      isAdmin: Boolean(isAdmin || permissionRole === 'admin'),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    try {
      await saveUserToFirestore(newUser);
      await logActivityToFirestore({
        userId: currentUser?.id || 'admin',
        userName: currentUser?.name || 'Administrador',
        action: 'create',
        details: `Cadastrou o colaborador "${newUser.name}" (${newUser.role})`,
      });
    } catch (err) {
      console.warn('Erro ao salvar usuário no Firestore:', err);
    }

    showToast(`Colaborador ${name} cadastrado no banco!`, 'success');
    return newUser;
  };

  const resetDemoData = async () => {
    const fresh = resetAllData();
    setTasks(fresh.tasks);
    setBoards(fresh.boards);
    setUsers(fresh.users);
    setCompany(fresh.company);
    setCurrentUserId(fresh.currentUserId);
    setSelectedBoardId('all');

    try {
      await seedCorporateData();
    } catch (err) {
      console.warn('Erro ao restaurar banco no Firestore:', err);
    }

    showToast('Dados de exemplo e banco de dados corporativo restaurados!', 'info');
  };

  const reseedDatabase = async () => {
    try {
      await seedCorporateData();
      showToast('Banco de dados Firestore repovoado com dados corporativos!', 'success');
    } catch {
      showToast('Erro ao repovoar banco no Firestore', 'error');
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        boards,
        users,
        currentUser,
        company,
        activityLogs,
        isCloudSynced,
        updateCompany,
        activeTab,
        setActiveTab,
        selectedBoardId,
        setSelectedBoardId,
        searchQuery,
        setSearchQuery,
        filterAssignee,
        setFilterAssignee,
        isAuthenticated,
        sessionToken,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        changePassword,
        logout,
        theme,
        toggleTheme,
        setTheme,
        taskModal,
        openTaskModal,
        closeTaskModal,
        isBoardModalOpen,
        setIsBoardModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isHelpCenterOpen,
        setIsHelpCenterOpen,
        isTourActive,
        tourStep,
        setTourStep,
        startTour,
        endTour,
        markTourAsCompleted,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        toggleTaskComplete,
        toggleChecklistItem,
        addChecklistItem,
        removeChecklistItem,
        addBoard,
        updateBoard,
        deleteBoard,
        setCurrentUserById,
        updateUser,
        deleteUser,
        toggleUserAdmin,
        addUser,
        resetDemoData,
        reseedDatabase,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext deve ser usado dentro de um TaskProvider');
  }
  return context;
};
