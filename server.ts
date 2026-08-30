import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // AI Task Generation API
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
3. "boardId": O ID do quadro que melhor se encaixa no tema (ex: vendas, operacoes, marketing, admin). Escolha um dos IDs listados ou o primeiro disponível.
4. "status": "todo" (padrão) ou "in_progress" se o usuário mencionar que já começou.
5. "assigneeIds": Array com os IDs dos usuários mais adequados mencionados ou cujo cargo/área coincida com a tarefa. Se não houver certeza, selecione o mais apropriado.
6. "dueDate": Data estimada no formato YYYY-MM-DD (calcule com base em referências temporais como "hoje", "amanhã", "sexta-feira", "na próxima semana", "em 3 dias", etc. relativos a ${todayStr}). Se não houver menção de prazo, pode ser null ou uma data sugerida razoável.
7. "checklist": Lista de strings com 2 a 5 subtarefas / passos práticos e acionáveis para concluir essa tarefa.

Retorne SEMPRE e EXCLUSIVAMENTE um objeto JSON válido.`;

          const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
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
              boardId: parsed.boardId || (boards[0]?.id || 'board-vendas'),
              status: parsed.status === 'in_progress' || parsed.status === 'done' ? parsed.status : 'todo',
              assigneeIds: Array.isArray(parsed.assigneeIds) ? parsed.assigneeIds : [],
              dueDate: parsed.dueDate || '',
              checklist: Array.isArray(parsed.checklist)
                ? parsed.checklist.map((item: string | { text: string }, idx: number) => ({
                    id: `chk-ai-${Date.now()}-${idx}`,
                    text: typeof item === 'string' ? item : item.text || '',
                    completed: false,
                  })).filter((item: { text: string }) => item.text.trim().length > 0)
                : [],
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
        message: !client ? 'Rascunho gerado com analisador local (defina GEMINI_API_KEY no .env para IA completa).' : undefined,
      });
    } catch (error) {
      console.error('Erro na rota /api/generate-task-draft:', error);
      res.status(500).json({ error: 'Erro ao gerar rascunho com IA.' });
    }
  });

  // Helper heuristic fallback
  function generateHeuristicDraft(
    promptText: string,
    boardsList: Array<{ id: string; name: string }>,
    usersList: Array<{ id: string; name: string; role?: string }>,
    today: string
  ) {
    const textLower = promptText.toLowerCase();

    // Detect board
    let selectedBoardId = boardsList[0]?.id || 'board-vendas';
    if (textLower.includes('venda') || textLower.includes('cliente') || textLower.includes('proposta') || textLower.includes('contrato')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('venda') || b.id.includes('vendas'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('estoque') || textLower.includes('frete') || textLower.includes('entrega') || textLower.includes('logística') || textLower.includes('fornecedor') || textLower.includes('transportadora')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('operaç') || b.id.includes('operacoes'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('marketing') || textLower.includes('post') || textLower.includes('instagram') || textLower.includes('campanha') || textLower.includes('design') || textLower.includes('arte')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('market') || b.id.includes('marketing'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('nota') || textLower.includes('fiscal') || textLower.includes('pagar') || textLower.includes('boleto') || textLower.includes('financeiro') || textLower.includes('rh')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('admin') || b.id.includes('admin'));
      if (match) selectedBoardId = match.id;
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
      matchedUserIds.push(usersList[0].id);
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
    } else if (textLower.includes('semana que vem') || textLower.includes('+7')) {
      now.setDate(now.getDate() + 7);
      dueDate = now.toISOString().split('T')[0];
    }

    // Clean title
    let title = promptText.replace(/^(preciso que|preciso|criar uma tarefa para|criar tarefa de|favor|por favor)\s*/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 85) {
      title = title.slice(0, 82) + '...';
    }

    // Subtasks
    const checklist = [
      { id: `chk-${Date.now()}-1`, text: 'Levantar informações e requisitos', completed: false },
      { id: `chk-${Date.now()}-2`, text: 'Executar e validar entrega', completed: false },
      { id: `chk-${Date.now()}-3`, text: 'Notificar responsáveis e finalizar', completed: false },
    ];

    return {
      title,
      description: promptText,
      boardId: selectedBoardId,
      status: 'todo' as const,
      assigneeIds: matchedUserIds,
      dueDate,
      checklist,
    };
  }

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
