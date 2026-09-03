import React from 'react';
import { SectionShell } from '../ui/SectionShell';
import { CtaButton } from '../ui/CtaButton';
import { home } from '../../content/home';

/** S12 — Chamada final. Alto respiro, nenhuma imagem competindo com o botão. */
export const FinalCtaSection: React.FC = () => (
  <SectionShell id="chamada-final" surface="app" className="py-20 lg:py-28">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
        {home.finalCta.title}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
        {home.finalCta.supportLine}
      </p>
      <div className="mt-8 flex justify-center">
        <CtaButton
          label={home.finalCta.cta.label}
          href={home.finalCta.cta.href}
          ctaId="final_primary"
          sectionId="chamada-final"
          fullWidth
          className="sm:w-auto"
        />
      </div>
    </div>
  </SectionShell>
);
