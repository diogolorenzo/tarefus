import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Board, CompanyInfo, KanbanColumn, Task, User, ActivityLog } from '../types';
import {
  INITIAL_BOARDS,
  INITIAL_COMPANY,
  INITIAL_TASKS,
  INITIAL_USERS,
  INITIAL_COLUMNS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  BOARDS: 'boards',
  COLUMNS: 'columns',
  TASKS: 'tasks',
  ACTIVITY_LOGS: 'activity_logs',
  COMPANY: 'company',
} as const;

// Single-tenant company doc ID
const COMPANY_DOC_ID = 'single_tenant_company';

/**
 * Check if the database has already been seeded. If empty, automatically seeds with initial corporate data.
 */
export const ensureDatabaseSeeded = async (force: boolean = false): Promise<boolean> => {
  try {
    const tasksSnapshot = await getDocs(collection(db, COLLECTIONS.TASKS));
    if (tasksSnapshot.empty || force) {
      console.log('🌱 Inicializando/Populando banco de dados Firestore (Seed Corporativo)...');
      await seedCorporateData();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar/popular seed no Firestore:', error);
    return false;
  }
};

/**
 * Seed all initial corporate data into Firestore in batches
 */
export const seedCorporateData = async (): Promise<void> => {
  const batch = writeBatch(db);

  // 1. Company
  const companyRef = doc(db, COLLECTIONS.COMPANY, COMPANY_DOC_ID);
  batch.set(companyRef, { ...INITIAL_COMPANY, id: COMPANY_DOC_ID });

  // 2. Users
  for (const user of INITIAL_USERS) {
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    batch.set(userRef, user);
  }

  // 3. Boards
  for (const board of INITIAL_BOARDS) {
    const boardRef = doc(db, COLLECTIONS.BOARDS, board.id);
    batch.set(boardRef, board);
  }

  // 4. Columns
  for (const col of INITIAL_COLUMNS) {
    const colRef = doc(db, COLLECTIONS.COLUMNS, col.id);
    batch.set(colRef, col);
  }

  // 5. Tasks
  for (const task of INITIAL_TASKS) {
    const taskRef = doc(db, COLLECTIONS.TASKS, task.id);
    batch.set(taskRef, task);
  }

  // 6. Activity Logs
  for (const log of INITIAL_ACTIVITY_LOGS) {
    const logRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, log.id);
    batch.set(logRef, log);
  }

  await batch.commit();
  console.log('✅ Banco de dados corporativo Firestore populado com sucesso.');
};

// ==========================================
// USERS CRUD
// ==========================================
export const fetchUsersFromFirestore = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    if (querySnapshot.empty) return INITIAL_USERS;
    const users: User[] = [];
    querySnapshot.forEach((d) => users.push(d.data() as User));
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários do Firestore:', error);
    return INITIAL_USERS;
  }
};

export const saveUserToFirestore = async (user: User): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, user.id);
  await setDoc(userRef, {
    ...user,
    updatedAt: new Date().toISOString(),
    createdAt: user.createdAt || new Date().toISOString(),
  }, { merge: true });
};

export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await deleteDoc(userRef);
};

export const subscribeToUsers = (onUpdate: (users: User[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    if (!snapshot.empty) {
      const users: User[] = [];
      snapshot.forEach((d) => users.push(d.data() as User));
      onUpdate(users);
    }
  }, (error) => {
    console.warn('Erro na subscription de usuários Firestore:', error);
  });
};

// ==========================================
// BOARDS CRUD
// ==========================================
export const fetchBoardsFromFirestore = async (): Promise<Board[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.BOARDS));
    if (querySnapshot.empty) return INITIAL_BOARDS;
    const boards: Board[] = [];
    querySnapshot.forEach((d) => boards.push(d.data() as Board));
    return boards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error('Erro ao buscar quadros do Firestore:', error);
    return INITIAL_BOARDS;
  }
};

export const saveBoardToFirestore = async (board: Board): Promise<void> => {
  const boardRef = doc(db, COLLECTIONS.BOARDS, board.id);
  await setDoc(boardRef, {
    ...board,
    updatedAt: new Date().toISOString(),
    createdAt: board.createdAt || new Date().toISOString(),
  }, { merge: true });
};

export const deleteBoardFromFirestore = async (boardId: string): Promise<void> => {
  const boardRef = doc(db, COLLECTIONS.BOARDS, boardId);
  await deleteDoc(boardRef);
};

export const subscribeToBoards = (onUpdate: (boards: Board[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.BOARDS), (snapshot) => {
    if (!snapshot.empty) {
      const boards: Board[] = [];
      snapshot.forEach((d) => boards.push(d.data() as Board));
      onUpdate(boards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }
  }, (error) => {
    console.warn('Erro na subscription de quadros Firestore:', error);
  });
};

// ==========================================
// COLUMNS CRUD
// ==========================================
export const fetchColumnsFromFirestore = async (): Promise<KanbanColumn[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COLUMNS));
    if (querySnapshot.empty) return INITIAL_COLUMNS;
    const cols: KanbanColumn[] = [];
    querySnapshot.forEach((d) => cols.push(d.data() as KanbanColumn));
    return cols.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Erro ao buscar colunas do Firestore:', error);
    return INITIAL_COLUMNS;
  }
};

export const saveColumnToFirestore = async (column: KanbanColumn): Promise<void> => {
  const colRef = doc(db, COLLECTIONS.COLUMNS, column.id);
  await setDoc(colRef, {
    ...column,
    updatedAt: new Date().toISOString(),
    createdAt: column.createdAt || new Date().toISOString(),
  }, { merge: true });
};

// ==========================================
// TASKS CRUD
// ==========================================
export const fetchTasksFromFirestore = async (): Promise<Task[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TASKS));
    if (querySnapshot.empty) return INITIAL_TASKS;
    const tasks: Task[] = [];
    querySnapshot.forEach((d) => tasks.push(d.data() as Task));
    return tasks.map((t) => ({
      ...t,
      assigneeIds: Array.isArray(t.assigneeIds)
        ? t.assigneeIds
        : t.assigneeId
        ? [t.assigneeId]
        : [],
    }));
  } catch (error) {
    console.error('Erro ao buscar tarefas do Firestore:', error);
    return INITIAL_TASKS;
  }
};

export const saveTaskToFirestore = async (task: Task): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, task.id);
  await setDoc(taskRef, {
    ...task,
    updatedAt: new Date().toISOString(),
    createdAt: task.createdAt || new Date().toISOString(),
  }, { merge: true });
};

export const updateTaskStatusInFirestore = async (
  taskId: string,
  newStatus: Task['status']
): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  await updateDoc(taskRef, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTaskFromFirestore = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
  await deleteDoc(taskRef);
};

export const subscribeToTasks = (onUpdate: (tasks: Task[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.TASKS), (snapshot) => {
    if (!snapshot.empty) {
      const tasks: Task[] = [];
      snapshot.forEach((d) => {
        const t = d.data() as Task;
        tasks.push({
          ...t,
          assigneeIds: Array.isArray(t.assigneeIds)
            ? t.assigneeIds
            : t.assigneeId
            ? [t.assigneeId]
            : [],
        });
      });
      onUpdate(tasks);
    }
  }, (error) => {
    console.warn('Erro na subscription de tarefas Firestore:', error);
  });
};

// ==========================================
// ACTIVITY LOGS CRUD
// ==========================================
export const logActivityToFirestore = async (
  log: Omit<ActivityLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<ActivityLog> => {
  const id = log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = log.timestamp || new Date().toISOString();
  const fullLog: ActivityLog = { ...log, id, timestamp };

  try {
    const logRef = doc(db, COLLECTIONS.ACTIVITY_LOGS, id);
    await setDoc(logRef, fullLog);
  } catch (error) {
    console.warn('Erro ao salvar log no Firestore:', error);
  }

  return fullLog;
};

export const fetchActivityLogsFromFirestore = async (limitCount: number = 50): Promise<ActivityLog[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.ACTIVITY_LOGS), orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return INITIAL_ACTIVITY_LOGS;
    const logs: ActivityLog[] = [];
    snapshot.forEach((d) => logs.push(d.data() as ActivityLog));
    return logs;
  } catch (error) {
    console.warn('Erro ao buscar logs do Firestore:', error);
    return INITIAL_ACTIVITY_LOGS;
  }
};

export const subscribeToActivityLogs = (onUpdate: (logs: ActivityLog[]) => void, limitCount: number = 40) => {
  const q = query(collection(db, COLLECTIONS.ACTIVITY_LOGS), orderBy('timestamp', 'desc'), limit(limitCount));
  return onSnapshot(q, (snapshot) => {
    const logs: ActivityLog[] = [];
    snapshot.forEach((d) => logs.push(d.data() as ActivityLog));
    onUpdate(logs);
  }, (error) => {
    console.warn('Erro na subscription de logs:', error);
  });
};

// ==========================================
// COMPANY INFO CRUD
// ==========================================
export const fetchCompanyFromFirestore = async (): Promise<CompanyInfo> => {
  try {
    const docRef = doc(db, COLLECTIONS.COMPANY, COMPANY_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...INITIAL_COMPANY, ...(docSnap.data() as CompanyInfo) };
    }
    return INITIAL_COMPANY;
  } catch (error) {
    console.error('Erro ao buscar dados da empresa no Firestore:', error);
    return INITIAL_COMPANY;
  }
};

export const saveCompanyToFirestore = async (company: CompanyInfo): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.COMPANY, COMPANY_DOC_ID);
  await setDoc(docRef, {
    ...company,
    id: COMPANY_DOC_ID,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};
