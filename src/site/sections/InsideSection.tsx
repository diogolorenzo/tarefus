import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { ProofFrame } from '../ui/ProofFrame';
import { KanbanMock, MyTasksMock, DeadlinesMock } from '../mock/ProductMocks';
import { cn } from '../ui/cn';
import { home } from '../../content/home';

const VISUALS: Record<string, React.ReactNode> = {
  quadros: <KanbanMock bare />,
  minhas: <MyTasksMock bare />,
  prazos: <DeadlinesMock />,
};

/**
 * S5 — O produto por dentro.
 *
 * Antes eram duas seções seguidas ("No dia a dia" e "Prazos"), cada uma com
 * título, olho-de-seção, lista e imagem, no mesmo compasso — quase 1.400px para
 * dizer duas coisas.
 *
 * Aqui elas dividem uma moldura só, trocada por abas. A altura do bloco passa a
 * ser a da maior tela, não a soma das duas, e o visitante compara as duas
 * telas no mesmo lugar em vez de rolar de uma até a outra. As abas repetem o
 * gesto da demonstração da IA logo acima: a página ensina uma interação e
 * reaproveita.
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
                    ? 'border-emphasis bg-emphasis text-emphasis-ink'
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
        </div>

        <ProofFrame label={active.proofLabel} caption={active.proofCaption}>
          {VISUALS[active.id]}
        </ProofFrame>
      </div>
    </SectionShell>
  );
};
