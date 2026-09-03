import React from 'react';
import { Check } from 'lucide-react';
import { SectionShell, type Density, type Surface } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { ProofFrame } from '../ui/ProofFrame';
import { cn } from '../ui/cn';
import type { SectionId } from '../../content/home';

interface FeatureShowcaseProps {
  id: SectionId;
  surface?: Surface;
  density?: Density;
  eyebrow?: string;
  title: string;
  bullets: readonly string[];
  visual: React.ReactNode;
  /** Rótulo e legenda da moldura: é o que faz a tela virar prova. */
  proofLabel: string;
  proofCaption: string;
  visualSide?: 'left' | 'right';
  cta?: { label: string; href: string };
}

/**
 * S6 e S7 — blocos de texto e imagem alternados.
 * No celular a imagem vem primeiro; no desktop o lado alterna a cada bloco.
 *
 * A tela agora ocupa a coluna inteira dentro de uma moldura, com legenda. Antes
 * ela ficava pequena no meio da coluna e sobrava um vão morto ao lado — o
 * espaço vazio acidental mais visível da página.
 */
export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  id,
  surface = 'app',
  density = 'normal',
  eyebrow,
  title,
  bullets,
  visual,
  proofLabel,
  proofCaption,
  visualSide = 'right',
  cta,
}) => (
  <SectionShell id={id} surface={surface} density={density}>
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn('order-2', visualSide === 'left' ? 'lg:order-2' : 'lg:order-1')}>
        <SectionHeading eyebrow={eyebrow} title={title} />

        <ul className="mt-7 space-y-3.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <Check
                className="mt-1 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-muted sm:text-base">{bullet}</span>
            </li>
          ))}
        </ul>

        {cta && (
          <div className="mt-8">
            <CtaButton
              label={cta.label}
              href={cta.href}
              variant="secondary"
              size="md"
              ctaId={`${id}_secondary`}
              sectionId={id}
            />
          </div>
        )}
      </div>

      <div className={cn('order-1', visualSide === 'left' ? 'lg:order-1' : 'lg:order-2')}>
        <ProofFrame label={proofLabel} caption={proofCaption}>
          {visual}
        </ProofFrame>
      </div>
    </div>
  </SectionShell>
);
