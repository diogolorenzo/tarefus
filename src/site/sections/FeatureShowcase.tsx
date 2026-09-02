import React from 'react';
import { Check } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { CtaButton } from '../ui/CtaButton';
import { cn } from '../ui/cn';
import type { SectionId } from '../../content/home';

interface FeatureShowcaseProps {
  id: SectionId;
  surface?: 'app' | 'raised' | 'sunken';
  eyebrow?: string;
  title: string;
  bullets: readonly string[];
  visual: React.ReactNode;
  visualSide?: 'left' | 'right';
  cta?: { label: string; href: string };
}

/**
 * S5 e S6 — blocos de texto e imagem alternados.
 * No celular a imagem vem primeiro; no desktop o lado alterna a cada bloco.
 */
export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  id,
  surface = 'app',
  eyebrow,
  title,
  bullets,
  visual,
  visualSide = 'right',
  cta,
}) => (
  <SectionShell id={id} surface={surface}>
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <div className={cn('order-2', visualSide === 'left' ? 'lg:order-2' : 'lg:order-1')}>
        <SectionHeading eyebrow={eyebrow} title={title} />

        <ul className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <Check
                className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-muted sm:text-base">{bullet}</span>
            </li>
          ))}
        </ul>

        {cta && (
          <div className="mt-7">
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

      <div className={cn('order-1', visualSide === 'left' ? 'lg:order-1' : 'lg:order-2')}>{visual}</div>
    </div>
  </SectionShell>
);
