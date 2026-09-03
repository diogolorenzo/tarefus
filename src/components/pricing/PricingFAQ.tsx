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
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (items.length > 0 && defaultOpenIndex >= 0 && defaultOpenIndex < items.length) {
      initial[items[defaultOpenIndex].id] = true;
    }
    return initial;
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = !!openItems[item.id];
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
                  className={`w-5 h-5 text-muted shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-line/50"
                >
                  <p>{item.answer}</p>
                </div>
              )}
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
