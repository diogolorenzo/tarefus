import React from 'react';
import { Icon } from '../ui/Icon';
import { home } from '../../content/home';

/**
 * S2 — Faixa de fatos.
 * Ocupa o lugar da prova social, que só entra quando houver clientes reais (decisão D6).
 */
export const FactStrip: React.FC = () => (
  <section id="fatos" className="border-y border-line bg-sunken px-5 py-6 sm:px-6">
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
      {home.facts.map((fact) => (
        <li key={fact.label} className="flex items-center gap-2.5">
          <Icon name={fact.icon} className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-medium leading-snug text-ink sm:text-sm">{fact.label}</span>
        </li>
      ))}
    </ul>
  </section>
);
