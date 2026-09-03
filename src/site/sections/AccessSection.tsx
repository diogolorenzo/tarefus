import React from 'react';
import { History } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading, Eyebrow } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';
import { home } from '../../content/home';

/**
 * S8 — Acessos e dados, em um bloco só.
 *
 * Antes eram duas seções seguidas (Papéis e Segurança) com o mesmo compasso,
 * respondendo à mesma pergunta do influenciador técnico: quem acessa o quê e o
 * que acontece com os dados. Juntas, viram um bloco dedicado a essa pergunta.
 *
 * O conteúdo continua sendo só o verificável hoje: sem selo de certificação e
 * sem afirmação de isolamento de dados, porque o produto ainda é single-tenant
 * (riscos R1 e R2 do plano).
 */
export const AccessSection: React.FC = () => (
  <SectionShell id="acessos" density="normal" surface="app">
    <SectionHeading eyebrow={home.acessos.eyebrow} title={home.acessos.title} />

    <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
      {home.acessos.roles.map((role) => (
        <div key={role.name} className="border-t border-line-strong pt-5">
          <div className="flex items-center gap-2">
            <Icon name={role.icon} className="h-4 w-4 text-muted" />
            <h3 className="text-base font-semibold text-ink">{role.name}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{role.summary}</p>
          <ul className="mt-4 space-y-1.5">
            {role.abilities.map((ability) => (
              <li key={ability} className="text-xs leading-relaxed text-subtle">
                {ability}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="mt-12 border-t border-line pt-8">
      <Eyebrow>{home.acessos.dataTitle}</Eyebrow>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {home.acessos.dataItems.map((item) => (
          <div key={item.title} className="flex gap-3">
            <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <div>
              <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-7 flex items-start gap-2.5 text-sm leading-relaxed text-subtle">
        <History className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {home.acessos.historyNote}
      </p>
    </div>
  </SectionShell>
);
