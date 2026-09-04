import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { PRICING_FAQS } from '../../data/pricingData';
import type { PricingFaqItem } from '../../types/pricing';

interface PricingFAQProps {
  items?: PricingFaqItem[];
  defaultOpenIndex?: number;
}

export const PricingFAQ: React.FC<PricingFAQProps> = ({
  items = PRICING_FAQS,
  defaultOpenIndex = 0,
}) => {
  const [openId, setOpenId] = useState<string | null>(() => {
    if (items.length > 0 && defaultOpenIndex >= 0 && defaultOpenIndex < items.length) {
      return items[defaultOpenIndex].id;
    }
    return null;
  });

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openId === item.id;
          const questionId = `faq-q-${item.id}`;
          const answerId = `faq-a-${item.id}`;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-surface border-indigo-500/50 dark:border-indigo-400/50 shadow-sm'
                  : 'bg-surface border-line hover:border-line-strong'
              }`}
            >
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggleItem(item.id)}
                className="w-full py-4 px-5 sm:px-6 flex items-center justify-between gap-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none"
              >
                <span className="flex items-center gap-3 font-semibold text-sm sm:text-base text-ink">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sunken border border-line text-xs font-bold text-muted shrink-0 tnum">
                    {index + 1}
                  </span>
                  {item.question}
                </span>

                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-muted'
                  }`}
                />
              </button>

              <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-line/50">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Contact Callout */}
      <div className="mt-8 p-5 rounded-2xl bg-sunken border border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Ainda ficou com alguma dúvida?</h4>
            <p className="text-xs text-muted">
              Nosso time de especialistas está pronto para conversar sobre as necessidades da sua equipe.
            </p>
          </div>
        </div>
        <a
          href="mailto:contato@tarefus.com.br"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface border border-line hover:bg-surface/80 hover:border-line-strong text-ink transition-colors shrink-0"
        >
          Falar com Suporte
        </a>
      </div>
    </div>
  );
};
