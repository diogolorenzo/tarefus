import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { home } from '../../content/home';

/**
 * S9 — Perguntas frequentes.
 * As respostas ficam no HTML desde o carregamento (ocultas por `hidden`), para
 * serem indexadas e corresponderem ao dado estruturado FAQPage.
 *
 * Bloco denso: onze perguntas em uma pilha de filetes finos, alinhada à
 * esquerda como texto corrido. Centralizar uma lista longa faz cada linha
 * começar num lugar diferente e cansa a leitura.
 */
export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(home.faq.items[0].id);

  const toggle = (id: string) => {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) track({ name: 'faq_open', props: { questionId: id } });
  };

  return (
    <SectionShell id="perguntas" density="dense" surface="sunken">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
        <SectionHeading
          eyebrow={home.faq.eyebrow}
          title={home.faq.title}
          className="lg:sticky lg:top-24 lg:self-start"
        />

        <div className="divide-y divide-line border-y border-line">
          {home.faq.items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`resposta-${item.id}`}
                    className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-ink sm:text-base">
                      {item.question}
                    </span>
                    <Plus
                      className={cn(
                        'h-4 w-4 shrink-0 text-subtle transition-transform duration-200',
                        isOpen && 'rotate-45'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={`resposta-${item.id}`} hidden={!isOpen}>
                  <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-muted">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
};
