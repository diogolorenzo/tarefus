import express from 'express';
import path from 'path';
import { readFile } from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { mountCommercialAccessRouter } from './src/server/commercial-access-default';
import { mountAiTaskDraftRouter } from './src/server/ai-task-draft-default';
import { mountBillingRouter } from './src/server/billing-default';
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

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

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

  // ========================================================
  // AI TASK GENERATION API
  // ========================================================
  app.post('/api/generate-task-draft', async (req, res) => {
    try {
      const { prompt, boards = [], users = [], currentDate } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'O prompt da tarefa é obrigatório.' });
      }

      const client = getGeminiClient();

      const boardsContext = Array.isArray(boards)
        ? boards.map((b: { id: string; name: string; description?: string }) => `- ID: "${b.id}", Nome: "${b.name}", Descrição: "${b.description || ''}"`).join('\n')
        : '';

      const usersContext = Array.isArray(users)
        ? users.map((u: { id: string; name: string; role?: string }) => `- ID: "${u.id}", Nome: "${u.name}", Cargo/Área: "${u.role || ''}"`).join('\n')
        : '';

      const todayStr = currentDate || new Date().toISOString().split('T')[0];

      if (client) {
        try {
          const systemInstruction = `Você é um assistente de produtividade e gestão de tarefas em português (pt-BR).
O usuário fornecerá um comando, ditado por voz ou descrição informal em linguagem natural sobre uma tarefa que precisa ser feita.
Sua missão é transformar essa descrição em um rascunho de tarefa bem estruturado, profissional e detalhado.

Informações do sistema:
Data de hoje: ${todayStr}

Quadros/Áreas disponíveis:
${boardsContext || 'Nenhum quadro específico'}

Membros da equipe disponíveis:
${usersContext || 'Nenhum usuário específico'}

Diretrizes para o JSON de saída:
1. "title": Título claro, objetivo e iniciado por verbo de ação (ex: "Entrar em contato com distribuidora Alpha", "Criar peças gráficas para campanha de maio").
2. "description": Texto explicativo detalhado, organizando o contexto, requisitos e notas importantes com base no que o usuário disse.
3. "priority": "low", "medium" ou "high" com base na urgência identificada.
4. "boardId": O ID do quadro que melhor se encaixa no tema (ex: board-vendas, board-operacoes, board-marketing, board-admin). Escolha um dos IDs listados ou o primeiro disponível.
5. "status": "todo" (padrão) ou "in_progress" se o usuário mencionar que já começou.
6. "assigneeIds": Array com os IDs dos usuários mais adequados mencionados ou cujo cargo/área coincida com a tarefa. Se não houver certeza, selecione o mais apropriado.
7. "dueDate": Data estimada no formato YYYY-MM-DD (calcule com base em referências temporais como "hoje", "amanhã", "sexta-feira", "na próxima semana", "em 3 dias", etc. relativos a ${todayStr}). Se não houver menção de prazo, pode ser null ou uma data sugerida razoável.
8. "tags": Lista de 1 a 3 tags/etiquetas categorizando a tarefa.
9. "checklist": Lista de strings com 2 a 5 subtarefas / passos práticos e acionáveis para concluir essa tarefa.
10. "aiNotes": Uma breve observação ou dica estratégica para quem for executar a tarefa.

Retorne SEMPRE e EXCLUSIVAMENTE um objeto JSON válido.`;

          const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
          let response: any = null;
          let lastErr: any = null;

          for (const model of candidateModels) {
            try {
              response = await client.models.generateContent({
                model,
                contents: `Descrição do usuário: "${prompt.trim()}"`,
                config: {
                  systemInstruction,
                  responseMimeType: 'application/json',
                  temperature: 0.3,
                },
              });
              if (response && response.text) {
                break;
              }
            } catch (err: any) {
              lastErr = err;
              console.warn(`Tentativa com ${model} falhou, tentando próximo modelo...`, err?.message || err);
            }
          }

          if (!response || !response.text) {
            throw lastErr || new Error('Nenhum modelo Gemini respondeu com sucesso.');
          }

          const rawText = response.text || '{}';
          const parsed = JSON.parse(rawText);

          return res.json({
            success: true,
            draft: {
              title: parsed.title || prompt.trim().slice(0, 80),
              description: parsed.description || prompt.trim(),
              priority: parsed.priority || 'medium',
              boardId: parsed.boardId || (boards[0]?.id || 'board-vendas'),
              status: parsed.status === 'in_progress' || parsed.status === 'done' ? parsed.status : 'todo',
              assigneeIds: Array.isArray(parsed.assigneeIds) ? parsed.assigneeIds : [],
              dueDate: parsed.dueDate || '',
              tags: Array.isArray(parsed.tags) ? parsed.tags : ['IA'],
              checklist: Array.isArray(parsed.checklist)
                ? parsed.checklist.map((item: string | { text: string }, idx: number) => ({
                    id: `chk-ai-${Date.now()}-${idx}`,
                    text: typeof item === 'string' ? item : item.text || '',
                    completed: false,
                  })).filter((item: { text: string }) => item.text.trim().length > 0)
                : [],
              aiNotes: parsed.aiNotes || undefined,
            },
            source: 'gemini',
          });
        } catch (apiError) {
          console.error('Erro na chamada Gemini, usando gerador heurístico:', apiError);
        }
      }

      // Fallback Heuristic Generator if API key is not present or API call fails
      const fallbackDraft = generateHeuristicDraft(prompt, boards, users, todayStr);
      return res.json({
        success: true,
        draft: fallbackDraft,
        source: 'heuristic',
        message: !client ? 'Rascunho gerado com analisador local inteligente.' : undefined,
      });
    } catch (error) {
      console.error('Erro na rota /api/generate-task-draft:', error);
      res.status(500).json({ error: 'Erro ao gerar rascunho com IA.' });
    }
  });

  // Helper heuristic fallback with domain-specific intelligence
  function generateHeuristicDraft(
    promptText: string,
    boardsList: Array<{ id: string; name: string }>,
    usersList: Array<{ id: string; name: string; role?: string }>,
    today: string
  ) {
    const textLower = promptText.toLowerCase();

    // Detect board & category
    let selectedBoardId = boardsList[0]?.id || 'board-vendas';
    let category = 'geral';
    let tags = ['Operacional'];
    let aiNotes = 'Dica da IA: Manter comunicação alinhada com os envolvidos para evitar retrabalho.';

    if (textLower.includes('venda') || textLower.includes('cliente') || textLower.includes('proposta') || textLower.includes('contrato') || textLower.includes('negocia') || textLower.includes('alpha') || textLower.includes('desconto')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('venda') || b.id.includes('vendas'));
      if (match) selectedBoardId = match.id;
      category = 'vendas';
      tags = ['Comercial', 'Proposta'];
      aiNotes = 'Dica da IA: Confirme a aprovação do desconto antes do envio formal e monitore a leitura.';
    } else if (textLower.includes('estoque') || textLower.includes('frete') || textLower.includes('entrega') || textLower.includes('logística') || textLower.includes('fornecedor') || textLower.includes('transportadora') || textLower.includes('curitiba') || textLower.includes('coleta')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('operaç') || b.id.includes('operacoes'));
      if (match) selectedBoardId = match.id;
      category = 'operacoes';
      tags = ['Operações', 'Logística'];
      aiNotes = 'Dica da IA: Compare o lead time e seguro de carga de ao menos 2 transportadoras homologadas.';
    } else if (textLower.includes('marketing') || textLower.includes('post') || textLower.includes('instagram') || textLower.includes('campanha') || textLower.includes('design') || textLower.includes('arte') || textLower.includes('linkedin') || textLower.includes('redes') || textLower.includes('conteúdo') || textLower.includes('conteudo')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('market') || b.id.includes('marketing'));
      if (match) selectedBoardId = match.id;
      category = 'marketing';
      tags = ['Marketing', 'Conteúdo'];
      aiNotes = 'Dica da IA: Garanta a validação visual do criativo e teste o link de rastreamento (UTM).';
    } else if (textLower.includes('nota') || textLower.includes('fiscal') || textLower.includes('pagar') || textLower.includes('boleto') || textLower.includes('financeiro') || textLower.includes('faturamento') || textLower.includes('banco') || textLower.includes('rh') || textLower.includes('reconciliar')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('admin') || b.id.includes('admin') || b.name.toLowerCase().includes('financ'));
      if (match) selectedBoardId = match.id;
      category = 'financeiro';
      tags = ['Financeiro', 'Fiscal'];
      aiNotes = 'Dica da IA: Conferir comprovantes e conciliar lançamentos com o extrato bancário oficial.';
    }

    // Detect users
    const matchedUserIds: string[] = [];
    usersList.forEach(u => {
      const firstName = u.name.split(' ')[0].toLowerCase();
      if (textLower.includes(firstName)) {
        matchedUserIds.push(u.id);
      }
    });

    if (matchedUserIds.length === 0 && usersList.length > 0) {
      if (category === 'vendas') {
        const salesUser = usersList.find(u => u.name.toLowerCase().includes('rodrigo') || (u.role && u.role.toLowerCase().includes('venda')));
        matchedUserIds.push(salesUser ? salesUser.id : usersList[0].id);
      } else if (category === 'marketing') {
        const mktUser = usersList.find(u => u.name.toLowerCase().includes('beatriz') || (u.role && u.role.toLowerCase().includes('market')));
        matchedUserIds.push(mktUser ? mktUser.id : usersList[0].id);
      } else if (category === 'operacoes') {
        const opsUser = usersList.find(u => u.name.toLowerCase().includes('carlos') || (u.role && u.role.toLowerCase().includes('opera')));
        matchedUserIds.push(opsUser ? opsUser.id : usersList[0].id);
      } else {
        matchedUserIds.push(usersList[0].id);
      }
    }

    // Detect dates
    let dueDate = '';
    const now = new Date(today || new Date());
    if (textLower.includes('hoje')) {
      dueDate = now.toISOString().split('T')[0];
    } else if (textLower.includes('amanhã') || textLower.includes('amanha')) {
      now.setDate(now.getDate() + 1);
      dueDate = now.toISOString().split('T')[0];
    } else if (textLower.includes('sexta')) {
      now.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
      dueDate = now.toISOString().split('T')[0];
    } else if (textLower.includes('quarta')) {
      now.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
      dueDate = now.toISOString().split('T')[0];
    } else if (textLower.includes('semana que vem') || textLower.includes('+7')) {
      now.setDate(now.getDate() + 7);
      dueDate = now.toISOString().split('T')[0];
    } else {
      now.setDate(now.getDate() + 2);
      dueDate = now.toISOString().split('T')[0];
    }

    // Clean and professional title
    let title = promptText
      .replace(/^(preciso que|preciso|criar uma tarefa para|criar tarefa de|favor|por favor|gostaria de|tem que|tem como)\s*/i, '')
      .trim();
    if (!/^(enviar|elaborar|preparar|agendar|revisar|cotar|ligar|organizar|publicar|reconciliar|validar|aprovar|cobrar|conferir|falar|entrar em contato)/i.test(title)) {
      if (category === 'vendas') title = `Enviar proposta e negociar: ${title}`;
      else if (category === 'marketing') title = `Desenvolver e publicar: ${title}`;
      else if (category === 'operacoes') title = `Cotar e alinhar logística: ${title}`;
      else if (category === 'financeiro') title = `Revisar e liquidar: ${title}`;
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 85) {
      title = title.slice(0, 82) + '...';
    }

    // Detailed subtasks / checklist based on category
    let checklist: Array<{ id: string; text: string; completed: boolean }> = [];
    if (category === 'vendas') {
      checklist = [
        { id: `chk-${Date.now()}-1`, text: 'Revisar escopo e condições comerciais', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Validar margem e alçadas de desconto', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Enviar minuta ao decisor e acompanhar aceite', completed: false },
      ];
    } else if (category === 'operacoes') {
      checklist = [
        { id: `chk-${Date.now()}-1`, text: 'Cotar frete com 2 transportadoras parceiras', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Conferir prazo de entrega e seguro de carga', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Emitir ordem de coleta e cadastrar rastreio', completed: false },
      ];
    } else if (category === 'marketing') {
      checklist = [
        { id: `chk-${Date.now()}-1`, text: 'Definir briefing e formatos das peças', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Criar variações gráficas e textos de apoio', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Aprovar copy final e agendar publicação', completed: false },
      ];
    } else if (category === 'financeiro') {
      checklist = [
        { id: `chk-${Date.now()}-1`, text: 'Conferir faturas e relatórios de fechamento', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Conciliar divergências com extratos bancários', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Arquivar comprovantes para auditoria mensal', completed: false },
      ];
    } else {
      checklist = [
        { id: `chk-${Date.now()}-1`, text: 'Levantar informações e requisitos chave', completed: false },
        { id: `chk-${Date.now()}-2`, text: 'Executar etapas e validar qualidade da entrega', completed: false },
        { id: `chk-${Date.now()}-3`, text: 'Notificar responsáveis e documentar conclusão', completed: false },
      ];
    }

    return {
      title,
      description: `Rascunho gerado a partir do comando: "${promptText.trim()}". Contexto validado para a área de ${category}.`,
      priority: textLower.includes('urgente') || textLower.includes('hoje') ? ('high' as const) : ('medium' as const),
      boardId: selectedBoardId,
      status: (textLower.includes('comecei') || textLower.includes('andamento') ? 'in_progress' : 'todo') as 'todo' | 'in_progress',
      assigneeIds: matchedUserIds,
      dueDate,
      tags,
      checklist,
      aiNotes,
    };
  }

  // Duas entradas HTML (decisão D1 do plano da homepage):
  // - index.html: site público, com <head> completo e indexável
  // - app.html: aplicação, com noindex
  const SITE_ROUTES = new Set(['/', '/index.html']);
  const entryFor = (pathname: string) => (SITE_ROUTES.has(pathname) ? 'index.html' : 'app.html');

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*all', async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      try {
        const raw = await readFile(path.join(process.cwd(), entryFor(req.path)), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, raw);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, entryFor(req.path)));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
