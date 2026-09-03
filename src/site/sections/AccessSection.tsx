import React from 'react';
import { History } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { Icon } from '../ui/Icon';
import { home } from '../../content/home';

/**
 * S6 — Acessos e dados.
 *
 * Antes eram duas seções seguidas (Papéis e Segurança) respondendo à mesma
 * pergunta do influenciador técnico: quem acessa o quê e o que acontece com os
 * dados. Aqui viram um bloco só, e apertado de propósito — é informação de
 * conferência, não de convencimento. Quem quiser o detalhe encontra em "Onde
 * ficam os dados da minha empresa?", no FAQ logo abaixo.
 *
 * O conteúdo continua sendo só o verificável hoje: sem selo de certificação e
 * sem afirmação de isolamento de dados, porque o produto ainda é single-tenant
 * (riscos R1 e R2 do plano).
 */
export const AccessSection: React.FC = () => (
  <SectionShell id="acessos" density="normal" surface="app">
    <SectionHeading eyebrow={home.acessos.eyebrow} title={home.acessos.title} />

    <div className="mt-9 grid gap-x-10 gap-y-6 sm:grid-cols-3">
      {home.acessos.roles.map((role) => (
        <div key={role.name} className="border-t border-line-strong pt-4">
          <div className="flex items-center gap-2">
            <Icon name={role.icon} className="h-4 w-4 text-muted" />
            <h3 className="text-sm font-semibold text-ink">{role.name}</h3>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{role.summary}</p>
          <p className="mt-2 text-xs leading-relaxed text-subtle">
            {role.abilities.join(' · ')}
          </p>
        </div>
      ))}
    </div>

    <div className="mt-8 grid gap-x-10 gap-y-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
      {home.acessos.dataItems.map((item) => (
        <div key={item.title} className="flex gap-3">
          <Icon name={item.icon} className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-semibold text-ink">{item.title}.</span> {item.description}
          </p>
        </div>
      ))}

      <p className="flex gap-3 text-sm leading-relaxed text-muted">
        <History className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <span>
          <span className="font-semibold text-ink">Histórico.</span> {home.acessos.historyNote}
        </span>
      </p>
    </div>
  </SectionShell>
);
