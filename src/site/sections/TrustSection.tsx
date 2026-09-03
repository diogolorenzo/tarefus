import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';
import { home } from '../../content/home';

/**
 * S9 — Dados e acessos. Somente o que é verificável hoje.
 * Sem selo de certificação e sem afirmação de isolamento de dados: o produto
 * ainda é single-tenant (riscos R1 e R2 do plano).
 */
export const TrustSection: React.FC = () => (
  <SectionShell id="seguranca" surface="raised">
    <SectionHeading title={home.trust.title} />

    <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {home.trust.items.map((item) => (
        <div key={item.title} className="flex gap-3">
          <Icon name={item.icon} className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
          <div>
            <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionShell>
);
