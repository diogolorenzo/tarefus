import React, { useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Clock,
  Mic,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../ui/cn';

/**
 * Reconstruções fiéis e interativas da interface do Tarefus em JSX.
 * Permite ao visitante experimentar de verdade o fluxo de quadros, tarefas e notificações.
 */

const shell = (bare: boolean | undefined, chrome: string): string => (bare ? '' : chrome);

export interface AvatarProps {
  initials: string;
  tone?: 'indigo' | 'emerald' | 'amber' | 'purple';
  size?: 'sm' | 'md';
}

const TONES: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
};

export const Avatar: React.FC<AvatarProps> = ({ initials, tone = 'indigo', size = 'md' }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
      TONES[tone],
      size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-7 w-7 text-[11px]'
    )}
  >
    {initials}
  </span>
);

export interface TaskCardMockProps {
  id?: string;
  title: string;
  description?: string;
  tags?: readonly string[];
  dueLabel: string;
  dueTone?: 'today' | 'late' | 'normal';
  assignee: { initials: string; name: string };
  tone?: 'indigo' | 'emerald' | 'amber' | 'purple';
  checklist?: { done: number; total: number };
  className?: string;
  onMoveForward?: () => void;
  onMoveBackward?: () => void;
  onToggleChecklist?: () => void;
  isCompleted?: boolean;
}

export const TaskCardMock: React.FC<TaskCardMockProps> = ({
  title,
  description,
  tags,
  dueLabel,
  dueTone = 'normal',
  assignee,
  tone = 'indigo',
  checklist,
  className,
  onMoveForward,
  onMoveBackward,
  onToggleChecklist,
  isCompleted = false,
}) => (
  <article
    className={cn(
      'group relative rounded-xl border border-line bg-surface p-3.5 shadow-sm transition-all hover:border-line-strong hover:shadow',
      isCompleted && 'opacity-75',
      className
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <h3
        className={cn(
          'text-sm font-semibold leading-snug text-ink transition-colors',
          isCompleted && 'line-through text-muted'
        )}
      >
        {title}
      </h3>
      {/* Quick Move Buttons */}
      <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100 sm:opacity-40">
        {onMoveBackward && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveBackward();
            }}
            title="Voltar etapa"
            aria-label="Voltar etapa"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-app text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>
        )}
        {onMoveForward && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveForward();
            }}
            title="Avançar etapa"
            aria-label="Avançar etapa"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>

    {description && (
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{description}</p>
    )}

    {tags && tags.length > 0 && (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-sunken px-2 py-0.5 text-[10px] font-medium text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium tnum',
            dueTone === 'today' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
            dueTone === 'late' && 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
            dueTone === 'normal' && 'bg-sunken text-muted'
          )}
        >
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          {dueLabel}
        </span>

        {checklist && (
          <button
            type="button"
            onClick={onToggleChecklist}
            title="Clique para avançar subetapa"
            className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-line tnum"
          >
            <CheckSquare className="h-3 w-3" aria-hidden="true" />
            {checklist.done}/{checklist.total}
          </button>
        )}
      </div>

      <Avatar initials={assignee.initials} tone={tone} />
    </div>

    {checklist && (
      <div
        className="mt-2.5 h-1 cursor-pointer overflow-hidden rounded-full bg-sunken"
        onClick={onToggleChecklist}
        title="Progresso do checklist (clique para alternar)"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            checklist.done === checklist.total ? 'bg-emerald-500' : 'bg-indigo-500'
          )}
          style={{ width: `${Math.round((checklist.done / checklist.total) * 100)}%` }}
        />
      </div>
    )}
  </article>
);

interface BoardCardData {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  dueLabel: string;
  dueTone: 'today' | 'late' | 'normal';
  assignee: { initials: string; name: string };
  tone: 'indigo' | 'emerald' | 'amber' | 'purple';
  checklist?: { done: number; total: number };
  status: 'todo' | 'doing' | 'done';
}

const INITIAL_BOARDS_DATA: Record<string, { label: string; cards: BoardCardData[] }> = {
  comercial: {
    label: 'Comercial',
    cards: [
      {
        id: 'c1',
        title: 'Enviar proposta revisada ao cliente Alpha',
        description: 'Aplicar desconto aprovado de 10% e enviar minuta.',
        dueLabel: 'Vence hoje',
        dueTone: 'today',
        assignee: { initials: 'RS', name: 'Rodrigo Souza' },
        tone: 'indigo',
        checklist: { done: 1, total: 3 },
        status: 'todo',
      },
      {
        id: 'c2',
        title: 'Agendar call de demonstração com Lead Beta',
        description: 'Alinhar agenda com diretor financeiro.',
        dueLabel: 'Amanhã',
        dueTone: 'normal',
        assignee: { initials: 'RS', name: 'Rodrigo Souza' },
        tone: 'indigo',
        status: 'todo',
      },
      {
        id: 'c3',
        title: 'Negociar renovação de contrato Grupo Sul',
        dueLabel: 'Atrasada',
        dueTone: 'late',
        assignee: { initials: 'AS', name: 'Ana Silva' },
        tone: 'emerald',
        checklist: { done: 2, total: 3 },
        status: 'doing',
      },
      {
        id: 'c4',
        title: 'Assinatura digital fechada com Delta Corp',
        dueLabel: '1/9',
        dueTone: 'normal',
        assignee: { initials: 'RS', name: 'Rodrigo Souza' },
        tone: 'indigo',
        checklist: { done: 3, total: 3 },
        status: 'done',
      },
    ],
  },
  operacoes: {
    label: 'Operações',
    cards: [
      {
        id: 'o1',
        title: 'Cotar frete para a filial de Curitiba',
        description: 'Consultar no mínimo 3 transportadoras homologadas.',
        dueLabel: '5/9',
        dueTone: 'normal',
        assignee: { initials: 'BL', name: 'Beatriz Lima' },
        tone: 'purple',
        checklist: { done: 1, total: 3 },
        status: 'todo',
      },
      {
        id: 'o2',
        title: 'Conferir inventário de estoque mensal',
        description: 'Bater contagem física de galpão.',
        dueLabel: 'Vence hoje',
        dueTone: 'today',
        assignee: { initials: 'CM', name: 'Carlos Mendes' },
        tone: 'amber',
        checklist: { done: 3, total: 4 },
        status: 'doing',
      },
      {
        id: 'o3',
        title: 'Emissão de guias de transporte Lote 42',
        dueLabel: 'Ontem',
        dueTone: 'normal',
        assignee: { initials: 'CM', name: 'Carlos Mendes' },
        tone: 'amber',
        checklist: { done: 2, total: 2 },
        status: 'done',
      },
    ],
  },
  marketing: {
    label: 'Marketing',
    cards: [
      {
        id: 'm1',
        title: 'Produzir 3 carrosséis para LinkedIn',
        description: 'Divulgar novos recursos de IA e fluxo de aprovação.',
        dueLabel: 'Vence hoje',
        dueTone: 'today',
        assignee: { initials: 'BL', name: 'Beatriz Lima' },
        tone: 'purple',
        checklist: { done: 2, total: 3 },
        status: 'todo',
      },
      {
        id: 'm2',
        title: 'Disparar newsletter semanal para clientes',
        dueLabel: 'Sexta',
        dueTone: 'normal',
        assignee: { initials: 'BL', name: 'Beatriz Lima' },
        tone: 'purple',
        status: 'doing',
      },
      {
        id: 'm3',
        title: 'Atualizar banners do site institucional',
        dueLabel: '1/9',
        dueTone: 'normal',
        assignee: { initials: 'AS', name: 'Ana Silva' },
        tone: 'emerald',
        checklist: { done: 2, total: 2 },
        status: 'done',
      },
    ],
  },
  financeiro: {
    label: 'Financeiro',
    cards: [
      {
        id: 'f1',
        title: 'Reconciliar faturamento e extrato bancário',
        description: 'Conferir pedidos faturados com extratos.',
        dueLabel: 'Atrasada',
        dueTone: 'late',
        assignee: { initials: 'CM', name: 'Carlos Mendes' },
        tone: 'amber',
        checklist: { done: 1, total: 3 },
        status: 'todo',
      },
      {
        id: 'f2',
        title: 'Emitir NFS-e dos contratos mensais',
        dueLabel: 'Vence hoje',
        dueTone: 'today',
        assignee: { initials: 'AS', name: 'Ana Silva' },
        tone: 'emerald',
        checklist: { done: 2, total: 3 },
        status: 'doing',
      },
      {
        id: 'f3',
        title: 'Pagamento de fornecedores homologados',
        dueLabel: 'Ontem',
        dueTone: 'normal',
        assignee: { initials: 'AS', name: 'Ana Silva' },
        tone: 'emerald',
        checklist: { done: 4, total: 4 },
        status: 'done',
      },
    ],
  },
};

export const KanbanMock: React.FC<{ bare?: boolean }> = ({ bare }) => {
  const [activeBoardKey, setActiveBoardKey] = useState<string>('comercial');
  const [boardsData, setBoardsData] = useState(INITIAL_BOARDS_DATA);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const currentBoard = boardsData[activeBoardKey] || boardsData.comercial;

  const moveCard = (cardId: string, nextStatus: 'todo' | 'doing' | 'done') => {
    setBoardsData((prev) => {
      const board = prev[activeBoardKey];
      if (!board) return prev;
      const updatedCards = board.cards.map((card) => {
        if (card.id === cardId) {
          return { ...card, status: nextStatus };
        }
        return card;
      });
      return {
        ...prev,
        [activeBoardKey]: { ...board, cards: updatedCards },
      };
    });
  };

  const toggleChecklist = (cardId: string) => {
    setBoardsData((prev) => {
      const board = prev[activeBoardKey];
      if (!board) return prev;
      const updatedCards = board.cards.map((card) => {
        if (card.id === cardId && card.checklist) {
          const nextDone = card.checklist.done >= card.checklist.total ? 0 : card.checklist.done + 1;
          return {
            ...card,
            checklist: { ...card.checklist, done: nextDone },
          };
        }
        return card;
      });
      return {
        ...prev,
        [activeBoardKey]: { ...board, cards: updatedCards },
      };
    });
  };

  const handleAddQuickCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    const newCard: BoardCardData = {
      id: `custom-${Date.now()}`,
      title: newCardTitle.trim(),
      dueLabel: 'Hoje',
      dueTone: 'today',
      assignee: { initials: 'EU', name: 'Você' },
      tone: 'indigo',
      status: 'todo',
      checklist: { done: 0, total: 2 },
    };

    setBoardsData((prev) => {
      const board = prev[activeBoardKey];
      return {
        ...prev,
        [activeBoardKey]: {
          ...board,
          cards: [newCard, ...board.cards],
        },
      };
    });
    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const resetBoard = () => {
    setBoardsData(INITIAL_BOARDS_DATA);
  };

  const todoCards = currentBoard.cards.filter((c) => c.status === 'todo');
  const doingCards = currentBoard.cards.filter((c) => c.status === 'doing');
  const doneCards = currentBoard.cards.filter((c) => c.status === 'done');

  const columns = [
    {
      status: 'todo' as const,
      title: 'A Fazer',
      accent: 'bg-slate-400',
      cards: todoCards,
    },
    {
      status: 'doing' as const,
      title: 'Fazendo',
      accent: 'bg-indigo-500',
      cards: doingCards,
    },
    {
      status: 'done' as const,
      title: 'Concluído',
      accent: 'bg-emerald-500',
      cards: doneCards,
    },
  ];

  return (
    <div className={shell(bare, 'rounded-2xl border border-line bg-app p-3 shadow-sm sm:p-4')}>
      {/* Board Navigation */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Quadros">
          {Object.entries(boardsData).map(([key, board]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveBoardKey(key)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors',
                activeBoardKey === key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-surface text-muted hover:text-ink'
              )}
            >
              {board.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-subtle sm:inline">
            Clique nas setas para mover cartões
          </span>
          <button
            type="button"
            onClick={resetBoard}
            title="Restaurar dados do quadro"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-subtle transition-colors hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Resetar</span>
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', column.accent)} />
                <span className="text-xs font-semibold text-ink">{column.title}</span>
                <span className="text-xs font-medium text-subtle tnum">
                  {column.cards.length}
                </span>
              </div>

              {column.status === 'todo' && !isAddingCard && (
                <button
                  type="button"
                  onClick={() => setIsAddingCard(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nova</span>
                </button>
              )}
            </div>

            {/* Quick Add Form */}
            {column.status === 'todo' && isAddingCard && (
              <form
                onSubmit={handleAddQuickCard}
                className="rounded-xl border border-indigo-300 bg-surface p-2.5 shadow-xs dark:border-indigo-700"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome da tarefa..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="w-full rounded-md border border-line bg-app px-2.5 py-1.5 text-xs text-ink placeholder:text-subtle focus:border-indigo-500 focus:outline-none"
                />
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }}
                    className="rounded-md px-2 py-1 text-[11px] text-muted hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700"
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            )}

            {/* Cards List */}
            <div className="space-y-2.5 min-h-[80px]">
              {column.cards.map((card) => (
                <TaskCardMock
                  key={card.id}
                  {...card}
                  isCompleted={column.status === 'done'}
                  onMoveBackward={
                    column.status === 'doing'
                      ? () => moveCard(card.id, 'todo')
                      : column.status === 'done'
                      ? () => moveCard(card.id, 'doing')
                      : undefined
                  }
                  onMoveForward={
                    column.status === 'todo'
                      ? () => moveCard(card.id, 'doing')
                      : column.status === 'doing'
                      ? () => moveCard(card.id, 'done')
                      : undefined
                  }
                  onToggleChecklist={() => toggleChecklist(card.id)}
                />
              ))}

              {column.cards.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-line text-[11px] text-subtle">
                  Nenhuma tarefa aqui
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface MyTaskItem {
  id: string;
  title: string;
  description?: string;
  dueLabel: string;
  dueTone: 'today' | 'late' | 'normal';
  userKey: 'BL' | 'CM' | 'RS';
  checklist?: { done: number; total: number };
  completed: boolean;
}

const INITIAL_MY_TASKS: MyTaskItem[] = [
  {
    id: 't1',
    title: 'Criar peças do lançamento de setembro',
    description: 'Artes no padrão visual do novo produto e carrossel.',
    dueLabel: 'Vence hoje',
    dueTone: 'today',
    userKey: 'BL',
    checklist: { done: 2, total: 4 },
    completed: false,
  },
  {
    id: 't2',
    title: 'Cotar frete para a filial de Curitiba',
    dueLabel: '5/9',
    dueTone: 'normal',
    userKey: 'BL',
    completed: false,
  },
  {
    id: 't3',
    title: 'Revisar métricas de campanhas de e-mail',
    dueLabel: 'Ontem',
    dueTone: 'normal',
    userKey: 'BL',
    completed: true,
  },
  {
    id: 't4',
    title: 'Reconciliar extrato bancário de faturamento',
    dueLabel: 'Atrasada',
    dueTone: 'late',
    userKey: 'CM',
    checklist: { done: 1, total: 3 },
    completed: false,
  },
  {
    id: 't5',
    title: 'Conferir recebimentos de fretes pendentes',
    dueLabel: 'Vence hoje',
    dueTone: 'today',
    userKey: 'CM',
    completed: false,
  },
  {
    id: 't6',
    title: 'Ligar para cliente Alpha sobre minuta aprovada',
    dueLabel: 'Vence hoje',
    dueTone: 'today',
    userKey: 'RS',
    checklist: { done: 2, total: 3 },
    completed: false,
  },
];

export const MyTasksMock: React.FC<{ bare?: boolean }> = ({ bare }) => {
  const [selectedUser, setSelectedUser] = useState<'BL' | 'CM' | 'RS'>('BL');
  const [filter, setFilter] = useState<'all' | 'today' | 'done'>('all');
  const [tasks, setTasks] = useState<MyTaskItem[]>(INITIAL_MY_TASKS);
  const [quickTitle, setQuickTitle] = useState('');

  const usersInfo = {
    BL: { name: 'Beatriz Lima', role: 'Marketing & Conteúdo', tone: 'purple' as const },
    CM: { name: 'Carlos Mendes', role: 'Operações & Logística', tone: 'amber' as const },
    RS: { name: 'Rodrigo Souza', role: 'Comercial & Vendas', tone: 'indigo' as const },
  };

  const currentUser = usersInfo[selectedUser];

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    const newTask: MyTaskItem = {
      id: `mt-${Date.now()}`,
      title: quickTitle.trim(),
      dueLabel: 'Vence hoje',
      dueTone: 'today',
      userKey: selectedUser,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setQuickTitle('');
  };

  const userTasks = tasks.filter((t) => t.userKey === selectedUser);
  const filteredTasks = userTasks.filter((t) => {
    if (filter === 'today') return t.dueTone === 'today' && !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const pendingTodayCount = userTasks.filter((t) => t.dueTone === 'today' && !t.completed).length;

  return (
    <div className={shell(bare, 'rounded-2xl border border-line bg-app p-4 shadow-sm')}>
      {/* User Switcher Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar initials={selectedUser} tone={currentUser.tone} size="md" />
          <div>
            <p className="text-sm font-semibold text-ink">{currentUser.name}</p>
            <p className="text-xs text-muted">{currentUser.role}</p>
          </div>
        </div>

        {/* Member selector */}
        <div className="flex items-center gap-1.5">
          {(['BL', 'RS', 'CM'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedUser(key)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                selectedUser === key
                  ? 'border border-emphasis bg-emphasis text-emphasis-ink font-semibold'
                  : 'border border-line bg-surface text-muted hover:text-ink'
              )}
            >
              {key === 'BL' ? 'Beatriz' : key === 'RS' ? 'Rodrigo' : 'Carlos'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              filter === 'all' ? 'bg-sunken text-ink font-semibold' : 'text-muted hover:text-ink'
            )}
          >
            Todas ({userTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('today')}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              filter === 'today' ? 'bg-amber-100 text-amber-900 font-semibold dark:bg-amber-900/40 dark:text-amber-300' : 'text-muted hover:text-ink'
            )}
          >
            Hoje ({pendingTodayCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('done')}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              filter === 'done' ? 'bg-emerald-100 text-emerald-900 font-semibold dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-muted hover:text-ink'
            )}
          >
            Concluídas ({userTasks.filter((t) => t.completed).length})
          </button>
        </div>

        <span className="text-[11px] text-subtle">Clique no card para concluir</span>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className="cursor-pointer transition-transform active:scale-[0.99]"
          >
            <TaskCardMock
              title={t.title}
              description={t.description}
              dueLabel={t.dueLabel}
              dueTone={t.dueTone}
              assignee={{ initials: selectedUser, name: currentUser.name }}
              tone={currentUser.tone}
              checklist={t.checklist}
              isCompleted={t.completed}
            />
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-line text-xs text-muted">
            <Check className="mb-1 h-5 w-5 text-emerald-500" />
            <span>Nenhuma tarefa pendente neste filtro!</span>
          </div>
        )}
      </div>

      {/* Quick Add Line */}
      <form onSubmit={handleAddTask} className="mt-3.5 flex items-center gap-2">
        <input
          type="text"
          placeholder={`Adicionar tarefa rápida para ${currentUser.name.split(' ')[0]}...`}
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink placeholder:text-subtle focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </form>
    </div>
  );
};

interface DeadlineNotice {
  id: string;
  title: string;
  timeLabel: string;
  category: 'today' | 'late' | 'upcoming';
  assignee: string;
}

const INITIAL_NOTICES: DeadlineNotice[] = [
  { id: 'n1', title: 'Reconciliar faturamento do mês', timeLabel: 'Atrasada desde ontem', category: 'late', assignee: 'Carlos Mendes' },
  { id: 'n2', title: 'Enviar proposta revisada ao cliente Alpha', timeLabel: 'Vence hoje às 17h', category: 'today', assignee: 'Rodrigo Souza' },
  { id: 'n3', title: 'Inventário de estoque mensal', timeLabel: 'Vence hoje às 18h', category: 'today', assignee: 'Carlos Mendes' },
  { id: 'n4', title: 'Cotar frete filial Curitiba', timeLabel: 'Vence em 2 dias', category: 'upcoming', assignee: 'Beatriz Lima' },
];

export const DeadlinesMock: React.FC = () => {
  const [notices, setNotices] = useState<DeadlineNotice[]>(INITIAL_NOTICES);
  const [showAlert, setShowAlert] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'today' | 'late'>('all');

  const resolveNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const postponeNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, category: 'upcoming', timeLabel: 'Adiada (+1 dia)' } : n
      )
    );
  };

  const todayCount = notices.filter((n) => n.category === 'today').length;
  const lateCount = notices.filter((n) => n.category === 'late').length;

  const visibleNotices = notices.filter((n) => {
    if (selectedCategory === 'today') return n.category === 'today';
    if (selectedCategory === 'late') return n.category === 'late';
    return true;
  });

  return (
    <div className="space-y-3">
      {showAlert && (todayCount > 0 || lateCount > 0) && (
        <div className="flex items-start justify-between gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-900/25">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              Você tem <strong className="tnum">{todayCount} tarefa{todayCount !== 1 ? 's' : ''}</strong> que vence{todayCount === 1 ? '' : 'm'} hoje
              {lateCount > 0 && <span> e <strong className="tnum">{lateCount} atrasada{lateCount !== 1 ? 's' : ''}</strong></span>}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAlert(false)}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 dark:text-amber-300"
          >
            Dispensar
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        {/* Header with real counters */}
        <div className="mb-3.5 flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="text-sm font-semibold text-ink">Central de Prazos &amp; Alertas</span>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 tnum dark:bg-amber-900/40 dark:text-amber-300">
            {todayCount} hoje
          </span>
        </div>

        {/* Filter Badges */}
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              selectedCategory === 'all' ? 'bg-sunken text-ink font-semibold' : 'text-muted hover:text-ink'
            )}
          >
            Todas ({notices.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('today')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              selectedCategory === 'today' ? 'bg-amber-100 text-amber-900 font-semibold dark:bg-amber-900/40 dark:text-amber-300' : 'text-muted hover:text-ink'
            )}
          >
            <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            Hoje ({todayCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('late')}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
              selectedCategory === 'late' ? 'bg-red-100 text-red-900 font-semibold dark:bg-red-900/40 dark:text-red-300' : 'text-muted hover:text-ink'
            )}
          >
            <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
            Atrasadas ({lateCount})
          </button>
        </div>

        {/* Notices Interactive List */}
        <div className="space-y-2">
          {visibleNotices.map((notice) => (
            <div
              key={notice.id}
              className="flex flex-col gap-2 rounded-xl border border-line bg-app p-3 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-2.5">
                {notice.category === 'late' ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                ) : (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <div>
                  <p className="text-xs font-semibold text-ink">{notice.title}</p>
                  <p className="text-[11px] text-muted">
                    {notice.assignee} · <span className="font-medium text-subtle">{notice.timeLabel}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => postponeNotice(notice.id)}
                  className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:text-ink"
                  title="Adiar prazo por 1 dia"
                >
                  +1 dia
                </button>
                <button
                  type="button"
                  onClick={() => resolveNotice(notice.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
                  title="Concluir tarefa"
                >
                  <Check className="h-3 w-3" />
                  Feita
                </button>
              </div>
            </div>
          ))}

          {visibleNotices.length === 0 && (
            <div className="flex h-20 flex-col items-center justify-center rounded-xl border border-dashed border-line text-xs text-muted">
              <Check className="mb-1 h-4 w-4 text-emerald-500" />
              <span>Sem prazos críticos nesta lista!</span>
            </div>
          )}
        </div>

        {notices.length < INITIAL_NOTICES.length && (
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setNotices(INITIAL_NOTICES)}
              className="inline-flex items-center gap-1 text-[11px] text-subtle hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" />
              Restaurar avisos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export interface AssistantMockProps {
  text: string;
  showCursor?: boolean;
  bare?: boolean;
  onGenerate?: (text: string) => void;
  onChangeText?: (text: string) => void;
  isLoading?: boolean;
  editable?: boolean;
}

export const AssistantMock: React.FC<AssistantMockProps> = ({
  text,
  showCursor = false,
  bare,
  onGenerate,
  onChangeText,
  isLoading = false,
  editable = false,
}) => (
  <div className={shell(bare, 'rounded-2xl border border-line bg-surface p-4 shadow-sm')}>
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Assistente com IA
        </span>
        <span className="text-[11px] text-subtle">Descreva a tarefa em português claro</span>
      </div>
      <span className="hidden text-[10px] font-medium text-indigo-600 dark:text-indigo-400 sm:inline">
        ⚡ IA Ativa
      </span>
    </div>

    <div
      className={cn(
        'min-h-[76px] rounded-xl border border-line-strong p-3 transition-colors focus-within:border-indigo-500',
        bare ? 'bg-surface' : 'bg-app'
      )}
    >
      {editable ? (
        <textarea
          rows={3}
          value={text}
          onChange={(e) => onChangeText?.(e.target.value)}
          placeholder="Ex: Enviar proposta comercial revisada ao cliente Alpha até sexta..."
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-subtle focus:outline-none"
        />
      ) : (
        <p className="text-sm leading-relaxed text-ink">
          {text}
          {showCursor && (
            <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-indigo-500" />
          )}
        </p>
      )}
    </div>

    <div className="mt-3 flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
        <Mic className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        texto ou voz
      </span>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => onGenerate?.(text)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-[0.98]',
          isLoading && 'opacity-70 cursor-not-allowed'
        )}
      >
        <Sparkles className="h-3 w-3" />
        {isLoading ? 'Gerando com IA…' : 'Gerar tarefa'}
      </button>
    </div>
  </div>
);
