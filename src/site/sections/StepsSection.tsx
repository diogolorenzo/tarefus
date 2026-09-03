import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { home } from '../../content/home';

/**
 * S5 — Como funciona em 3 passos. Responde "quanto trabalho dá começar?".
 *
 * Bloco denso: os três passos são separados por um filete no topo, não por
 * cartões e não por um vão vertical grande. A informação é simples, então ela
 * ocupa pouco espaço de propósito.
 */
export const StepsSection: React.FC = () => (
  <SectionShell id="passos" density="dense" surface="sunken">
    <SectionHeading
      eyebrow={home.steps.eyebrow}
      title={home.steps.title}
      subtitle={home.steps.subtitle}
    />

    <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
      {home.steps.items.map((step) => (
        <li key={step.number} className="bg-surface p-5 sm:p-6">
          <span className="text-2xl font-bold leading-none text-subtle tnum">{step.number}</span>
          <h3 className="mt-4 text-base font-semibold text-ink">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
        </li>
      ))}
    </ol>

    <p className="mt-6 text-sm leading-relaxed text-subtle">{home.steps.supportLine}</p>
  </SectionShell>
);
