import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { mountCommercialAccessRouter } from './src/server/commercial-access-default';
import { mountAiTaskDraftRouter } from './src/server/ai-task-draft-default';
import { mountBillingRouter } from './src/server/billing-default';
import { createRetiredLegacyAiRouter } from './src/server/legacy-ai-router';
import {
  INITIAL_BOARDS,
  INITIAL_COMPANY,
  INITIAL_TASKS,
  INITIAL_USERS,
  INITIAL_COLUMNS,
  INITIAL_ACTIVITY_LOGS,
} from './src/data/initialData';
import type { Board, CompanyInfo, KanbanColumn, Task, User, ActivityLog } from './src/types';

dotenv.config();

// In-Memory Database Store (Single-Tenant Corporate State)
let dbUsers: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));
let dbBoards: Board[] = JSON.parse(JSON.stringify(INITIAL_BOARDS));
let dbColumns: KanbanColumn[] = JSON.parse(JSON.stringify(INITIAL_COLUMNS));
let dbTasks: Task[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
let dbActivityLogs: ActivityLog[] = JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LOGS));
let dbCompany: CompanyInfo = JSON.parse(JSON.stringify(INITIAL_COMPANY));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as unknown as { rawBody: Buffer }).rawBody = buf;
      },
    }),
  );
  mountCommercialAccessRouter(app);
  mountAiTaskDraftRouter(app);
  mountBillingRouter(app);
  app.use(createRetiredLegacyAiRouter());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      database: 'single_tenant_firestore_ready',
      stats: {
        usersCount: dbUsers.length,
        boardsCount: dbBoards.length,
        tasksCount: dbTasks.length,
        activityLogsCount: dbActivityLogs.length,
      },
    });
  });

  // ========================================================
  // USERS CRUD ENDPOINTS
  // ========================================================
  app.get('/api/users', (req, res) => {
    res.json({ success: true, data: dbUsers });
  });

  app.post('/api/users', (req, res) => {
    const { name, email, role, permissionRole, avatarColor, avatarUrl } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: '$2a$10$wW4wL6q6jYq2WqY2Y6w6eu9Yw2Y6w6eu9Yw2Y6w6eu9Yw2Y6w6eu.',
      role: role ? role.trim() : 'Membro da Equipe',
      permissionRole: permissionRole || 'member',
      initials,
      avatarColor: avatarColor || 'bg-indigo-600',
      avatarUrl: avatarUrl || undefined,
      isAdmin: permissionRole === 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbUsers.push(newUser);

    // Audit log
    dbActivityLogs.unshift({
      id: `log-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      action: 'create',
      details: `Novo usuário criado: ${newUser.name} (${newUser.role})`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newUser });
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const index = dbUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const { name, email, role, permissionRole, avatarColor, avatarUrl } = req.body;
    const existing = dbUsers[index];

    let initials = existing.initials;
    if (name) {
      initials = name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0].toUpperCase())
        .slice(0, 2)
        .join('');
    }

    const updatedUser: User = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      email: email !== undefined ? email.trim().toLowerCase() : existing.email,
      role: role !== undefined ? role.trim() : existing.role,
      permissionRole: permissionRole !== undefined ? permissionRole : existing.permissionRole,
      avatarColor: avatarColor !== undefined ? avatarColor : existing.avatarColor,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : existing.avatarUrl,
      initials,
      isAdmin: permissionRole !== undefined ? permissionRole === 'admin' : existing.isAdmin,
      updatedAt: new Date().toISOString(),
    };

    dbUsers[index] = updatedUser;
    res.json({ success: true, data: updatedUser });
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = dbUsers.length;
    dbUsers = dbUsers.filter((u) => u.id !== id);
    if (dbUsers.length === initialLen) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ success: true, message: 'Usuário excluído com sucesso.' });
  });

  // ========================================================
  // BOARDS CRUD ENDPOINTS
  // ========================================================
  app.get('/api/boards', (req, res) => {
    res.json({ success: true, data: dbBoards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) });
  });

  app.post('/api/boards', (req, res) => {
    const { name, description, icon, color, createdBy, memberIds } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome do quadro é obrigatório.' });
    }

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      name: name.trim(),
      description: description ? description.trim() : '',
      icon: icon || 'LayoutGrid',
      color: color || 'indigo',
      createdBy: createdBy || 'admin',
      memberIds: Array.isArray(memberIds) ? memberIds : [],
      order: dbBoards.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbBoards.push(newBoard);

    dbActivityLogs.unshift({
      id: `log-${Date.now()}`,
      boardId: newBoard.id,
      userId: createdBy || 'admin',
      userName: 'Gestão de Quadros',
      action: 'create',
      details: `Novo quadro de área criado: "${newBoard.name}"`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newBoard });
  });

  app.put('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    const index = dbBoards.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quadro não encontrado.' });
    }

    const { name, description, icon, color, memberIds, order } = req.body;
    const existing = dbBoards[index];

    const updatedBoard: Board = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      description: description !== undefined ? description.trim() : existing.description,
      icon: icon !== undefined ? icon : existing.icon,
      color: color !== undefined ? color : existing.color,
      memberIds: memberIds !== undefined ? memberIds : existing.memberIds,
      order: order !== undefined ? order : existing.order,
      updatedAt: new Date().toISOString(),
    };

    dbBoards[index] = updatedBoard;
    res.json({ success: true, data: updatedBoard });
  });

  app.delete('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    dbBoards = dbBoards.filter((b) => b.id !== id);
    // Also remove or reassign tasks of this board
    dbTasks = dbTasks.filter((t) => t.boardId !== id);
    res.json({ success: true, message: 'Quadro excluído com sucesso.' });
  });

  // ========================================================
  // KANBAN COLUMNS CRUD ENDPOINTS
  // ========================================================
  app.get('/api/columns', (req, res) => {
    const { boardId } = req.query;
    if (boardId) {
      const filtered = dbColumns.filter((c) => c.boardId === boardId || c.boardId === 'global');
      return res.json({ success: true, data: filtered.sort((a, b) => a.order - b.order) });
    }
    res.json({ success: true, data: dbColumns.sort((a, b) => a.order - b.order) });
  });

  app.post('/api/columns', (req, res) => {
    const { boardId, title, statusKey, order, color } = req.body;
    if (!title || !statusKey) {
      return res.status(400).json({ error: 'Título e statusKey da coluna são obrigatórios.' });
    }

    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      boardId: boardId || 'global',
      title: title.trim(),
      statusKey,
      order: typeof order === 'number' ? order : dbColumns.length,
      color: color || 'slate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbColumns.push(newColumn);
    res.status(201).json({ success: true, data: newColumn });
  });

  // ========================================================
  // TASKS CRUD ENDPOINTS
  // ========================================================
  app.get('/api/tasks', (req, res) => {
    const { boardId, status, assigneeId } = req.query;
    let result = [...dbTasks];

    if (boardId && typeof boardId === 'string') {
      result = result.filter((t) => t.boardId === boardId);
    }
    if (status && typeof status === 'string') {
      result = result.filter((t) => t.status === status);
    }
    if (assigneeId && typeof assigneeId === 'string') {
      result = result.filter((t) => t.assigneeIds.includes(assigneeId) || t.assigneeId === assigneeId);
    }

    res.json({ success: true, data: result });
  });

  app.post('/api/tasks', (req, res) => {
    const {
      title,
      description,
      priority,
      boardId,
      status,
      assigneeIds,
      assigneeId,
      dueDate,
      tags,
      checklist,
      aiNotes,
    } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ error: 'Título e quadro da tarefa são obrigatórios.' });
    }

    const finalAssignees = Array.isArray(assigneeIds)
      ? assigneeIds
      : assigneeId
      ? [assigneeId]
      : [];

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      boardId,
      status: status || 'todo',
      assigneeIds: finalAssignees,
      assigneeId: finalAssignees[0] || undefined,
      dueDate: dueDate || undefined,
      tags: Array.isArray(tags) ? tags : [],
      checklist: Array.isArray(checklist) ? checklist : [],
      aiNotes: aiNotes || undefined,
      order: dbTasks.filter((t) => t.boardId === boardId && t.status === (status || 'todo')).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbTasks.push(newTask);

    // Audit log
    dbActivityLogs.unshift({
      id: `log-${Date.now()}`,
      taskId: newTask.id,
      taskTitle: newTask.title,
      boardId: newTask.boardId,
      userId: finalAssignees[0] || 'user-1',
      userName: 'Colaborador',
      action: 'create',
      details: `Criou a tarefa "${newTask.title}"`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newTask });
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const index = dbTasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const existing = dbTasks[index];
    const updates = req.body;

    const finalAssignees =
      updates.assigneeIds !== undefined
        ? Array.isArray(updates.assigneeIds)
          ? updates.assigneeIds
          : updates.assigneeId
          ? [updates.assigneeId]
          : []
        : existing.assigneeIds;

    const statusChanged = updates.status !== undefined && updates.status !== existing.status;

    const updatedTask: Task = {
      ...existing,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      priority: updates.priority !== undefined ? updates.priority : existing.priority,
      boardId: updates.boardId !== undefined ? updates.boardId : existing.boardId,
      status: updates.status !== undefined ? updates.status : existing.status,
      assigneeIds: finalAssignees,
      assigneeId: finalAssignees[0] || undefined,
      dueDate: updates.dueDate !== undefined ? updates.dueDate : existing.dueDate,
      tags: updates.tags !== undefined ? updates.tags : existing.tags,
      checklist: updates.checklist !== undefined ? updates.checklist : existing.checklist,
      aiNotes: updates.aiNotes !== undefined ? updates.aiNotes : existing.aiNotes,
      order: updates.order !== undefined ? updates.order : existing.order,
      updatedAt: new Date().toISOString(),
    };

    dbTasks[index] = updatedTask;

    if (statusChanged) {
      dbActivityLogs.unshift({
        id: `log-${Date.now()}`,
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        boardId: updatedTask.boardId,
        userId: finalAssignees[0] || 'user-1',
        userName: 'Colaborador',
        action: updatedTask.status === 'done' ? 'complete' : 'status_change',
        details: `Alterou o status para "${updatedTask.status === 'done' ? 'Concluído' : updatedTask.status === 'in_progress' ? 'Em Andamento' : 'A Fazer'}"`,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ success: true, data: updatedTask });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskToDelete = dbTasks.find((t) => t.id === id);
    if (!taskToDelete) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    dbTasks = dbTasks.filter((t) => t.id !== id);

    dbActivityLogs.unshift({
      id: `log-${Date.now()}`,
      taskId: id,
      taskTitle: taskToDelete.title,
      boardId: taskToDelete.boardId,
      userId: 'user-1',
      userName: 'Colaborador',
      action: 'delete',
      details: `Excluiu a tarefa "${taskToDelete.title}"`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Tarefa excluída com sucesso.' });
  });

  // ========================================================
  // ACTIVITY LOGS ENDPOINTS
  // ========================================================
  app.get('/api/activity-logs', (req, res) => {
    const limitNum = Number(req.query.limit) || 50;
    res.json({ success: true, data: dbActivityLogs.slice(0, limitNum) });
  });

  app.post('/api/activity-logs', (req, res) => {
    const { taskId, taskTitle, boardId, userId, userName, action, details } = req.body;
    if (!userId || !action || !details) {
      return res.status(400).json({ error: 'userId, action e details são obrigatórios.' });
    }

    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      taskTitle,
      boardId,
      userId,
      userName: userName || 'Usuário',
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    dbActivityLogs.unshift(newLog);
    res.status(201).json({ success: true, data: newLog });
  });

  // ========================================================
  // COMPANY INFO ENDPOINTS
  // ========================================================
  app.get('/api/company', (req, res) => {
    res.json({ success: true, data: dbCompany });
  });

  app.put('/api/company', (req, res) => {
    const updates = req.body;
    dbCompany = {
      ...dbCompany,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: dbCompany });
  });

  // ========================================================
  // DATABASE SEED ENDPOINT
  // ========================================================
  app.post('/api/seed', (req, res) => {
    dbUsers = JSON.parse(JSON.stringify(INITIAL_USERS));
    dbBoards = JSON.parse(JSON.stringify(INITIAL_BOARDS));
    dbColumns = JSON.parse(JSON.stringify(INITIAL_COLUMNS));
    dbTasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    dbActivityLogs = JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LOGS));
    dbCompany = JSON.parse(JSON.stringify(INITIAL_COMPANY));

    res.json({
      success: true,
      message: 'Banco de dados corporativo reinicializado com seed padrão com sucesso.',
      stats: {
        users: dbUsers.length,
        boards: dbBoards.length,
        columns: dbColumns.length,
        tasks: dbTasks.length,
        activityLogs: dbActivityLogs.length,
      },
    });
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
