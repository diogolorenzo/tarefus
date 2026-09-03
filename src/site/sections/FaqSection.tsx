import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { home } from '../../content/home';

/**
 * S11 — Perguntas frequentes.
 * As respostas ficam no HTML desde o carregamento (ocultas por `hidden`), para
 * serem indexadas e corresponderem ao dado estruturado FAQPage.
 */
export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(home.faq.items[0].id);

  const toggle = (id: string) => {
    const willOpen = openId !== id;
    setOpenId(willOpen ? id : null);
    if (willOpen) track({ name: 'faq_open', props: { questionId: id } });
  };

  return (
    <SectionShell id="perguntas" surface="raised">
      <SectionHeading title={home.faq.title} align="center" />

      <div className="mx-auto mt-10 max-w-3xl divide-y divide-line border-y border-line">
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
                  <span className="text-sm font-semibold text-ink sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 text-subtle transition-transform',
                      isOpen && 'rotate-180'
                    )}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div id={`resposta-${item.id}`} hidden={!isOpen}>
                <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
