import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { home } from '../../content/home';

const { columns, rows } = home.comparison;

/**
 * S3 — Comparativo com o concorrente real do público.
 * Nenhuma marca de software é citada: "grupo de mensagens" cobre a realidade.
 * Abaixo de 768px a tabela vira blocos — nunca rolagem horizontal.
 *
 * Este é o bloco mais denso e o único que usa a superfície de ênfase: a coluna
 * do Tarefus atravessa a tabela inteira como um bloco sólido. É onde a página
 * decide alguma coisa, então é onde o contraste forte se justifica — e por isso
 * ele não aparece em nenhum outro lugar.
 */
export const ComparisonSection: React.FC = () => (
  <SectionShell id="comparativo" density="dense" surface="sunken">
    <SectionHeading
      eyebrow={home.comparison.eyebrow}
      title={home.comparison.title}
      subtitle={home.comparison.subtitle}
    />

    <div className="mt-10 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th
              scope="col"
              className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle"
            >
              {columns.criterion}
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle"
            >
              {columns.spreadsheet}
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle"
            >
              {columns.messaging}
            </th>
            <th
              scope="col"
              className="bg-emphasis px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-emphasis-ink"
            >
              {columns.tarefus}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.criterion} className="border-t border-line">
              <th scope="row" className="px-5 py-4 align-top text-sm font-semibold text-ink">
                {row.criterion}
              </th>
              <td className="px-5 py-4 align-top text-sm leading-relaxed text-muted">
                {row.spreadsheet}
              </td>
              <td className="px-5 py-4 align-top text-sm leading-relaxed text-muted">
                {row.messaging}
              </td>
              <td className="bg-emphasis px-5 py-4 align-top text-sm font-medium leading-relaxed text-emphasis-ink">
                {row.tarefus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-8 space-y-3 md:hidden">
      {rows.map((row) => (
        <div key={row.criterion} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <p className="px-4 pb-3 pt-3.5 text-sm font-semibold text-ink">{row.criterion}</p>
          <dl className="text-xs leading-relaxed">
            <div className="px-4 pb-2.5">
              <dt className="font-medium text-subtle">{columns.spreadsheet}</dt>
              <dd className="text-muted">{row.spreadsheet}</dd>
            </div>
            <div className="px-4 pb-4">
              <dt className="font-medium text-subtle">{columns.messaging}</dt>
              <dd className="text-muted">{row.messaging}</dd>
            </div>
            <div className="bg-emphasis px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emphasis-muted">
                {columns.tarefus}
              </dt>
              <dd className="mt-1 text-xs font-medium leading-relaxed text-emphasis-ink">
                {row.tarefus}
              </dd>
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
