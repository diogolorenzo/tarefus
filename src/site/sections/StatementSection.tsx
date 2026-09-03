import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { Eyebrow } from '../ui/SectionHeading';
import { home } from '../../content/home';

/**
 * S2 — Declaração. O primeiro dos dois momentos de respiro da página.
 *
 * Nenhuma imagem, nenhum cartão, nenhum botão: só o problema, dito em tipo
 * grande. É o bloco que dá sentido à compactação dos vizinhos — o comparativo
 * logo abaixo é o mais denso da página justamente porque este é o mais vazio.
 *
 * A copy descreve a rotina do decisor levantada na seção 1.1 do plano. Nada
 * aqui promete funcionalidade.
 */
export const StatementSection: React.FC = () => (
  <SectionShell id="diagnostico" density="air" width="text" surface="raised">
    <div className="text-center">
      <Eyebrow>{home.diagnostico.eyebrow}</Eyebrow>

      <h2 className="mt-6 text-[2rem] font-bold leading-[1.05] tracking-[-0.035em] text-ink text-balance sm:text-5xl lg:text-6xl">
        {home.diagnostico.title}
      </h2>

      <div className="mx-auto mt-8 max-w-xl space-y-5">
        {home.diagnostico.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-muted sm:text-lg">
            {paragraph}
          </p>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-base font-semibold leading-relaxed text-ink sm:text-lg">
        {home.diagnostico.kicker}
      </p>
    </div>
  </SectionShell>
);
