/**
 * Client service to communicate with the real AI Task Draft generator endpoint.
 * Supports calling Gemini through /api/generate-task-draft with instant fallback.
 */

export interface GeneratedTaskDraft {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  boardId: string;
  boardName: string;
  dueDateLabel: string;
  rawDueDate?: string;
  assignee: {
    id: string;
    name: string;
    initials: string;
    role: string;
    tone: 'indigo' | 'emerald' | 'amber' | 'purple';
  };
  tags: string[];
  checklist: Array<{ id: string; text: string; completed: boolean }>;
  aiNotes?: string;
  source: 'gemini' | 'heuristic';
}

export const DEMO_BOARDS = [
  { id: 'board-vendas', name: 'Comercial & Vendas', description: 'Propostas, clientes e negociações' },
  { id: 'board-operacoes', name: 'Operações & Logística', description: 'Fretes, entregas e estoque' },
  { id: 'board-marketing', name: 'Marketing & Conteúdo', description: 'Campanhas, redes sociais e design' },
  { id: 'board-admin', name: 'Financeiro & Administrativo', description: 'Faturamento, fiscal e notas' },
];

export const DEMO_USERS = [
  { id: 'user-rodrigo', name: 'Rodrigo Souza', role: 'Comercial', initials: 'RS', tone: 'indigo' as const },
  { id: 'user-beatriz', name: 'Beatriz Lima', role: 'Marketing', initials: 'BL', tone: 'purple' as const },
  { id: 'user-carlos', name: 'Carlos Mendes', role: 'Operações', initials: 'CM', tone: 'amber' as const },
  { id: 'user-ana', name: 'Ana Silva', role: 'Financeiro', initials: 'AS', tone: 'emerald' as const },
];

function formatDueDateLabel(dateStr?: string): string {
  if (!dateStr) return 'sem prazo definido';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);

      const weekdays = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      const weekday = weekdays[date.getDay()];
      return `${weekday}, ${day}/${month + 1}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export async function requestTaskDraftFromAi(prompt: string): Promise<GeneratedTaskDraft> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error('O comando da tarefa não pode estar vazio.');
  }

  try {
    const res = await fetch('/api/generate-task-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: trimmed,
        boards: DEMO_BOARDS,
        users: DEMO_USERS,
        currentDate: new Date().toISOString().split('T')[0],
      }),
    });

    if (!res.ok) {
      throw new Error(`Servidor retornou status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.draft) {
      throw new Error(data.error || 'Falha ao processar resposta da IA.');
    }

    const rawDraft = data.draft;

    // Find board
    const board = DEMO_BOARDS.find((b) => b.id === rawDraft.boardId) || DEMO_BOARDS[0];

    // Find assignee
    const rawAssigneeId = rawDraft.assigneeIds?.[0];
    let assignee = DEMO_USERS.find((u) => u.id === rawAssigneeId);
    if (!assignee) {
      const promptLower = trimmed.toLowerCase();
      if (promptLower.includes('beatriz') || board.id === 'board-marketing') {
        assignee = DEMO_USERS.find((u) => u.initials === 'BL') || DEMO_USERS[1];
      } else if (promptLower.includes('carlos') || board.id === 'board-operacoes') {
        assignee = DEMO_USERS.find((u) => u.initials === 'CM') || DEMO_USERS[2];
      } else if (promptLower.includes('ana') || board.id === 'board-admin') {
        assignee = DEMO_USERS.find((u) => u.initials === 'AS') || DEMO_USERS[3];
      } else {
        assignee = DEMO_USERS[0];
      }
    }

    const checklist = Array.isArray(rawDraft.checklist)
      ? rawDraft.checklist.map((item: any, idx: number) => ({
          id: item.id || `chk-${idx}`,
          text: typeof item === 'string' ? item : item.text,
          completed: Boolean(item.completed),
        }))
      : [
          { id: 'chk-1', text: 'Levantar informações e requisitos chave', completed: false },
          { id: 'chk-2', text: 'Executar e validar entrega', completed: false },
          { id: 'chk-3', text: 'Notificar responsáveis e finalizar', completed: false },
        ];

    return {
      title: rawDraft.title || trimmed,
      description: rawDraft.description || trimmed,
      priority: rawDraft.priority || 'medium',
      boardId: board.id,
      boardName: board.name,
      dueDateLabel: formatDueDateLabel(rawDraft.dueDate),
      rawDueDate: rawDraft.dueDate,
      assignee,
      tags: Array.isArray(rawDraft.tags) && rawDraft.tags.length > 0 ? rawDraft.tags : [board.name.split(' ')[0]],
      checklist,
      aiNotes: rawDraft.aiNotes,
      source: data.source || 'gemini',
    };
  } catch (err) {
    console.warn('Erro ao chamar /api/generate-task-draft, gerando localmente com fallback:', err);
    // Safe client-side fallback
    const lower = trimmed.toLowerCase();
    const isMkt = lower.includes('marketing') || lower.includes('post') || lower.includes('linkedin');
    const isOps = lower.includes('frete') || lower.includes('entrega') || lower.includes('curitiba') || lower.includes('estoque');
    const isFin = lower.includes('nota') || lower.includes('faturamento') || lower.includes('banc') || lower.includes('reconciliar');

    const assignee = isMkt ? DEMO_USERS[1] : isOps ? DEMO_USERS[2] : isFin ? DEMO_USERS[3] : DEMO_USERS[0];
    const board = isMkt ? DEMO_BOARDS[2] : isOps ? DEMO_BOARDS[1] : isFin ? DEMO_BOARDS[3] : DEMO_BOARDS[0];

    return {
      title: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      description: `Rascunho criado a partir do comando: "${trimmed}".`,
      priority: lower.includes('urgente') ? 'high' : 'medium',
      boardId: board.id,
      boardName: board.name,
      dueDateLabel: 'sexta-feira, 5/9',
      assignee,
      tags: isMkt ? ['Marketing', 'Conteúdo'] : isOps ? ['Operações', 'Logística'] : isFin ? ['Financeiro'] : ['Comercial'],
      checklist: [
        { id: 'chk-fb-1', text: 'Revisar escopo e detalhes operacionais', completed: false },
        { id: 'chk-fb-2', text: 'Executar alinhamento com a equipe', completed: false },
        { id: 'chk-fb-3', text: 'Finalizar entrega e comunicar cliente', completed: false },
      ],
      aiNotes: 'Dica da IA: Manter os envolvidos avisados no quadro.',
      source: 'heuristic',
    };
  }
}
