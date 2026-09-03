import React from 'react';
import { History } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';
import { home } from '../../content/home';

/** S7 — Papéis de acesso, em linguagem de dono de empresa. */
export const RolesSection: React.FC = () => (
  <SectionShell id="papeis" surface="raised">
    <SectionHeading
      eyebrow={home.roles.eyebrow}
      title={home.roles.title}
      subtitle={home.roles.subtitle}
    />

    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {home.roles.items.map((role) => (
        <div key={role.name} className="rounded-2xl border border-line bg-app p-5">
          <Icon name={role.icon} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="mt-3 text-base font-semibold text-ink">{role.name}</h3>
          <p className="mt-1 text-sm text-muted">{role.summary}</p>
          <ul className="mt-4 space-y-2 border-t border-line pt-4">
            {role.abilities.map((ability) => (
              <li key={ability} className="text-xs leading-relaxed text-muted">
                {ability}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-sunken p-4 text-sm text-muted">
      <History className="mt-0.5 h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
      {home.roles.historyNote}
    </p>
  </SectionShell>
);
