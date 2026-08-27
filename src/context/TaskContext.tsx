import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Board, Task, TaskStatus, User } from '../types';
import {
  loadBoards,
  loadCurrentUserId,
  loadTasks,
  loadTheme,
  loadUsers,
  resetAllData,
  saveBoards,
  saveCurrentUserId,
  saveTasks,
  saveTheme,
  saveUsers,
} from '../services/storage';

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

interface TaskContextType {
  tasks: Task[];
  boards: Board[];
  users: User[];
  currentUser: User | null;
  activeTab: 'board' | 'my-tasks';
  setActiveTab: (tab: 'board' | 'my-tasks') => void;
  selectedBoardId: string; // 'all' or specific board id
  setSelectedBoardId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterAssignee: string; // 'all' or user id
  setFilterAssignee: (userId: string) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Modals
  taskModal: TaskModalState;
  openTaskModal: (task?: Task | null, defaultStatus?: TaskStatus, defaultBoardId?: string) => void;
  closeTaskModal: () => void;
  isBoardModalOpen: boolean;
  setIsBoardModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Actions
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, destinationStatus: TaskStatus, newIndex?: number) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addChecklistItem: (taskId: string, text: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;

  // Boards
  addBoard: (name: string, color: string, icon?: string, description?: string) => Board;
  deleteBoard: (boardId: string) => void;

  // Users
  setCurrentUserById: (userId: string) => void;
  addUser: (name: string, role: string, email: string) => User;

  // System
  resetDemoData: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [boards, setBoards] = useState<Board[]>(() => loadBoards());
  const [users, setUsers] = useState<User[]>(() => loadUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadCurrentUserId());
  const [activeTab, setActiveTab] = useState<'board' | 'my-tasks'>('board');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const [taskModal, setTaskModal] = useState<TaskModalState>({ isOpen: false, task: null });
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => loadTheme());

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

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${performance.now().toString(36)}`;
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

  const addTask = (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Task => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast('Tarefa criada com sucesso!', 'success');
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates, updatedAt: now } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast('Tarefa atualizada!', 'info');
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast('Tarefa excluída!', 'info');
  };

  const moveTask = (taskId: string, destinationStatus: TaskStatus, newIndex?: number) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (targetTask.status === destinationStatus && newIndex === undefined) return;

    const updatedTask = {
      ...targetTask,
      status: destinationStatus,
      updatedAt: new Date().toISOString(),
    };

    // Reorder array
    const otherTasks = tasks.filter((t) => t.id !== taskId);
    let newTasksList: Task[];

    if (newIndex !== undefined) {
      // Find all tasks with destination status
      const destStatusTasks = otherTasks.filter((t) => t.status === destinationStatus);
      const remainingTasks = otherTasks.filter((t) => t.status !== destinationStatus);

      destStatusTasks.splice(newIndex, 0, updatedTask);
      newTasksList = [...remainingTasks, ...destStatusTasks];
    } else {
      newTasksList = [updatedTask, ...otherTasks];
    }

    setTasks(newTasksList);
    saveTasks(newTasksList);
  };

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(taskId, { status: newStatus });
    if (newStatus === 'done') {
      showToast('🎉 Parabéns! Tarefa concluída!', 'success');
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    updateTask(taskId, { checklist: updatedChecklist });
  };

  const addChecklistItem = (taskId: string, text: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !text.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: text.trim(),
      completed: false,
    };

    updateTask(taskId, { checklist: [...task.checklist, newItem] });
  };

  const removeChecklistItem = (taskId: string, itemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.filter((item) => item.id !== itemId);
    updateTask(taskId, { checklist: updatedChecklist });
  };

  const addBoard = (name: string, color: string, icon = 'Folder', description = ''): Board => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      description: description.trim(),
    };

    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);
    saveBoards(updatedBoards);
    showToast(`Quadro "${name}" criado com sucesso!`, 'success');
    return newBoard;
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      showToast('Não é possível excluir o único quadro existente.', 'error');
      return;
    }

    const updatedBoards = boards.filter((b) => b.id !== boardId);
    // Move tasks in this board to the first available board
    const fallbackBoardId = updatedBoards[0].id;
    const updatedTasks = tasks.map((t) =>
      t.boardId === boardId ? { ...t, boardId: fallbackBoardId } : t
    );

    setBoards(updatedBoards);
    setTasks(updatedTasks);
    saveBoards(updatedBoards);
    saveTasks(updatedTasks);

    if (selectedBoardId === boardId) {
      setSelectedBoardId('all');
    }
    showToast('Quadro removido.', 'info');
  };

  const setCurrentUserById = (userId: string) => {
    setCurrentUserId(userId);
    saveCurrentUserId(userId);
    const user = users.find((u) => u.id === userId);
    if (user) {
      showToast(`Conectado como ${user.name}`, 'info');
    }
  };

  const addUser = (name: string, role: string, email: string): User => {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

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
      initials,
      avatarColor,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    showToast(`Colaborador ${name} cadastrado!`, 'success');
    return newUser;
  };

  const resetDemoData = () => {
    const fresh = resetAllData();
    setTasks(fresh.tasks);
    setBoards(fresh.boards);
    setUsers(fresh.users);
    setCurrentUserId(fresh.currentUserId);
    setSelectedBoardId('all');
    showToast('Dados de exemplo restaurados com sucesso!', 'info');
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        boards,
        users,
        currentUser,
        activeTab,
        setActiveTab,
        selectedBoardId,
        setSelectedBoardId,
        searchQuery,
        setSearchQuery,
        filterAssignee,
        setFilterAssignee,
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
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        toggleTaskComplete,
        toggleChecklistItem,
        addChecklistItem,
        removeChecklistItem,
        addBoard,
        deleteBoard,
        setCurrentUserById,
        addUser,
        resetDemoData,
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
