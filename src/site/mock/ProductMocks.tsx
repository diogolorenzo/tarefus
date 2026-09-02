import React from 'react';
import { Bell, CalendarDays, CheckSquare, Clock, Mic, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '../ui/cn';

/**
 * Reconstruções fiéis da interface do Tarefus, em JSX.
 *
 * O plano (4.6) prevê capturas de tela reais do produto. Enquanto elas não são
 * produzidas, estes componentes mostram a mesma interface sem inventar recursos:
 * cada elemento aqui corresponde a algo que existe em src/components.
 */

interface AvatarProps {
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

interface TaskCardMockProps {
  title: string;
  description?: string;
  tags?: readonly string[];
  dueLabel: string;
  dueTone?: 'today' | 'late' | 'normal';
  assignee: { initials: string; name: string };
  tone?: 'indigo' | 'emerald' | 'amber' | 'purple';
  checklist?: { done: number; total: number };
  className?: string;
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
}) => (
  <article
    className={cn(
      'rounded-xl border border-line bg-surface p-4 shadow-sm',
      className
    )}
  >
    <h3 className="text-sm font-semibold leading-snug text-ink">{title}</h3>
    {description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{description}</p>}

    {tags && tags.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
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
      <div className="flex items-center gap-2">
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
          <span className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-1 text-[11px] font-medium text-muted tnum">
            <CheckSquare className="h-3 w-3" aria-hidden="true" />
            {checklist.done}/{checklist.total}
          </span>
        )}
      </div>

      <Avatar initials={assignee.initials} tone={tone} />
    </div>

    {checklist && (
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${Math.round((checklist.done / checklist.total) * 100)}%` }}
        />
      </div>
    )}
  </article>
);

const COLUMNS = [
  {
    title: 'A Fazer',
    accent: 'bg-slate-400',
    cards: [
      {
        title: 'Enviar proposta revisada ao cliente Alpha',
        dueLabel: 'Vence hoje',
        dueTone: 'today' as const,
        assignee: { initials: 'RS', name: 'Rodrigo Souza' },
        tone: 'indigo' as const,
        checklist: { done: 1, total: 3 },
      },
      {
        title: 'Cotar frete para a filial de Curitiba',
        dueLabel: '5/9',
        dueTone: 'normal' as const,
        assignee: { initials: 'BL', name: 'Beatriz Lima' },
        tone: 'purple' as const,
      },
    ],
  },
  {
    title: 'Fazendo',
    accent: 'bg-indigo-500',
    cards: [
      {
        title: 'Reconciliar faturamento do mês',
        dueLabel: 'Atrasada',
        dueTone: 'late' as const,
        assignee: { initials: 'CM', name: 'Carlos Mendes' },
        tone: 'amber' as const,
        checklist: { done: 2, total: 3 },
      },
    ],
  },
  {
    title: 'Concluído',
    accent: 'bg-emerald-500',
    cards: [
      {
        title: 'Publicar posts de lançamento no LinkedIn',
        dueLabel: '1/9',
        dueTone: 'normal' as const,
        assignee: { initials: 'AS', name: 'Ana Silva' },
        tone: 'emerald' as const,
        checklist: { done: 3, total: 3 },
      },
    ],
  },
];

export const KanbanMock: React.FC = () => (
  <div className="rounded-2xl border border-line bg-app p-3 shadow-sm sm:p-4">
    <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
      <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">
        Comercial
      </span>
      <span className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted">Operações</span>
      <span className="hidden rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted sm:inline">
        Marketing
      </span>
      <span className="hidden rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted sm:inline">
        Financeiro
      </span>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {COLUMNS.map((column, index) => (
        <div
          key={column.title}
          className={cn('space-y-2.5', index > 0 && 'hidden sm:block')}
        >
          <div className="flex items-center gap-2 px-1">
            <span className={cn('h-2 w-2 rounded-full', column.accent)} />
            <span className="text-xs font-semibold text-ink">{column.title}</span>
            <span className="text-xs text-subtle tnum">{column.cards.length}</span>
          </div>
          {column.cards.map((card) => (
            <TaskCardMock key={card.title} {...card} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const MyTasksMock: React.FC = () => (
  <div className="rounded-2xl border border-line bg-app p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <Avatar initials="BL" tone="purple" />
      <div>
        <p className="text-sm font-semibold text-ink">Minhas Tarefas</p>
        <p className="text-xs text-muted">Beatriz Lima · Marketing &amp; Conteúdo</p>
      </div>
    </div>
    <div className="space-y-2.5">
      <TaskCardMock
        title="Criar peças do lançamento de setembro"
        dueLabel="Vence hoje"
        dueTone="today"
        assignee={{ initials: 'BL', name: 'Beatriz Lima' }}
        tone="purple"
        checklist={{ done: 2, total: 4 }}
      />
      <TaskCardMock
        title="Cotar frete para a filial de Curitiba"
        dueLabel="5/9"
        assignee={{ initials: 'BL', name: 'Beatriz Lima' }}
        tone="purple"
      />
    </div>
  </div>
);

export const DeadlinesMock: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-900/25">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
        Você tem <strong className="tnum">2 tarefas</strong> que vencem hoje.
      </p>
    </div>

    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 border-b border-line pb-3">
        <Bell className="h-4 w-4 text-muted" aria-hidden="true" />
        <span className="text-sm font-semibold text-ink">Notificações</span>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 tnum dark:bg-amber-900/40 dark:text-amber-300">
          2 hoje
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-sunken px-3 py-2">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span className="text-xs font-medium text-ink">Vencem hoje</span>
          <span className="ml-auto text-xs font-semibold text-ink tnum">2</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-sunken px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" aria-hidden="true" />
          <span className="text-xs font-medium text-ink">Atrasadas</span>
          <span className="ml-auto text-xs font-semibold text-ink tnum">1</span>
        </div>
      </div>
    </div>
  </div>
);

interface AssistantMockProps {
  text: string;
  showCursor?: boolean;
}

export const AssistantMock: React.FC<AssistantMockProps> = ({ text, showCursor = false }) => (
  <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Assistente
      </span>
      <span className="text-[11px] text-subtle">Descreva a tarefa como você falaria</span>
    </div>

    <div className="min-h-[76px] rounded-xl border border-line-strong bg-app p-3">
      <p className="text-sm leading-relaxed text-ink">
        {text}
        {showCursor && (
          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-indigo-500" />
        )}
      </p>
    </div>

    <div className="mt-3 flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
        <Mic className="h-3.5 w-3.5" aria-hidden="true" />
        ou dite por voz
      </span>
      <span className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white">
        Gerar tarefa
      </span>
    </div>
  </div>
);
