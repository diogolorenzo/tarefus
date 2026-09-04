import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { ProofFrame } from '../ui/ProofFrame';
import { KanbanMock, MyTasksMock, DeadlinesMock } from '../mock/ProductMocks';
import { cn } from '../ui/cn';
import { home } from '../../content/home';

/**
 * S5 — O produto por dentro (Interativo).
 * O visitante pode interagir diretamente com o Kanban (trocar de quadro, mover cards),
 * com a visão individual (concluir tarefas, alternar membros) e com a central de prazos.
 */
export const InsideSection: React.FC = () => {
  const columns = home.porDentro.columns;
  const [activeId, setActiveId] = useState<string>(columns[0].id);
  const active = columns.find((column) => column.id === activeId) ?? columns[0];

  return (
    <SectionShell id="por-dentro" density="normal" surface="app">
      <SectionHeading eyebrow={home.porDentro.eyebrow} title={home.porDentro.title} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Telas do produto">
            {columns.map((column) => (
              <button
                key={column.id}
                type="button"
                role="tab"
                aria-selected={column.id === activeId}
                onClick={() => setActiveId(column.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  column.id === activeId
                    ? 'border-emphasis bg-emphasis text-emphasis-ink font-semibold'
                    : 'border-line bg-surface text-muted hover:text-ink'
                )}
              >
                {column.title}
              </button>
            ))}
          </div>

          <ul className="mt-6 space-y-3">
            {active.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <Check
                  className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-sm leading-relaxed text-muted">{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-line bg-surface p-3 text-xs text-subtle">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Demonstração 100% interativa
            </span>
            <p className="mt-1 leading-relaxed">
              Experimente mover cartões pelas colunas, alternar entre os quadros das áreas e marcar checklists em tempo real.
            </p>
          </div>
        </div>

        <ProofFrame label={active.proofLabel} caption={active.proofCaption}>
          {active.id === 'quadros' && <KanbanMock bare />}
          {active.id === 'minhas' && <MyTasksMock bare />}
          {active.id === 'prazos' && <DeadlinesMock />}
        </ProofFrame>
      </div>
    </SectionShell>
  );
};
