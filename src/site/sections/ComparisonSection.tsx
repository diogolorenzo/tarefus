import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { home } from '../../content/home';

/**
 * S8 — Comparativo com o concorrente real do público.
 * Nenhuma marca de software é citada: "grupo de mensagens" cobre a realidade.
 * Abaixo de 768px a tabela vira blocos — nunca rolagem horizontal.
 */
export const ComparisonSection: React.FC = () => (
  <SectionShell id="comparativo">
    <SectionHeading title={home.comparison.title} subtitle={home.comparison.subtitle} />

    <div className="mt-10 hidden overflow-hidden rounded-2xl border border-line md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-sunken">
            <th scope="col" className="p-4 text-xs font-semibold uppercase tracking-wide text-subtle">
              Critério
            </th>
            <th scope="col" className="p-4 text-xs font-semibold uppercase tracking-wide text-subtle">
              Planilha
            </th>
            <th scope="col" className="p-4 text-xs font-semibold uppercase tracking-wide text-subtle">
              Grupo de mensagens
            </th>
            <th scope="col" className="bg-indigo-50 p-4 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              Tarefus
            </th>
          </tr>
        </thead>
        <tbody>
          {home.comparison.rows.map((row) => (
            <tr key={row.criterion} className="border-t border-line">
              <th scope="row" className="p-4 align-top text-sm font-semibold text-ink">
                {row.criterion}
              </th>
              <td className="p-4 align-top text-sm text-muted">{row.spreadsheet}</td>
              <td className="p-4 align-top text-sm text-muted">{row.messaging}</td>
              <td className="bg-indigo-50/50 p-4 align-top text-sm font-medium text-ink dark:bg-indigo-500/5">
                {row.tarefus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-8 space-y-4 md:hidden">
      {home.comparison.rows.map((row) => (
        <div key={row.criterion} className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-ink">{row.criterion}</p>
          <dl className="mt-3 space-y-2 text-xs leading-relaxed">
            <div>
              <dt className="font-medium text-subtle">Planilha</dt>
              <dd className="text-muted">{row.spreadsheet}</dd>
            </div>
            <div>
              <dt className="font-medium text-subtle">Grupo de mensagens</dt>
              <dd className="text-muted">{row.messaging}</dd>
            </div>
            <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-500/10">
              <dt className="font-semibold text-indigo-700 dark:text-indigo-300">Tarefus</dt>
              <dd className="text-ink">{row.tarefus}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>

    <div className="mt-8">
      <CtaButton
        label={home.comparison.cta.label}
        href={home.comparison.cta.href}
        ctaId="comparativo_primary"
        sectionId="comparativo"
        fullWidth
        className="sm:w-auto"
      />
    </div>
  </SectionShell>
);
