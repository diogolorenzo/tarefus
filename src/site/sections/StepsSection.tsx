import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { home } from '../../content/home';

/** S4 — Como funciona em 3 passos. Responde "quanto trabalho dá começar?". */
export const StepsSection: React.FC = () => (
  <SectionShell id="passos">
    <SectionHeading
      eyebrow={home.steps.eyebrow}
      title={home.steps.title}
      subtitle={home.steps.subtitle}
    />

    <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
      {home.steps.items.map((step) => (
        <li key={step.number} className="flex gap-4 sm:block">
          <span className="text-3xl font-bold leading-none text-subtle tnum sm:mb-4 sm:block sm:text-4xl">
            {step.number}
          </span>
          <div>
            <h3 className="text-base font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>

    <p className="mt-8 border-t border-line pt-6 text-sm text-subtle">{home.steps.supportLine}</p>
  </SectionShell>
);
