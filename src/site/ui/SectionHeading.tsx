import React from 'react';
import { cn } from './cn';

/**
 * Três registros, e só três.
 *
 * `display` é reservado ao herói e aos dois momentos de declaração da página —
 * se tudo pode ser grande, nada é hierarquia. `section` abre os blocos comuns.
 * O olho-de-seção saiu do índigo: o índigo agora pertence ao CTA primário.
 */
export type HeadingSize = 'display' | 'section';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  size?: HeadingSize;
  align?: 'left' | 'center';
  /** `h1` só no herói (hierarquia 7.3 do plano). */
  as?: 'h1' | 'h2';
  className?: string;
}

const SIZE: Record<HeadingSize, string> = {
  display: 'text-[2.125rem] leading-[1.04] sm:text-5xl lg:text-6xl tracking-[-0.035em]',
  section: 'text-[1.75rem] leading-[1.1] sm:text-4xl lg:text-[2.75rem] tracking-[-0.025em]',
};

export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      'text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle',
      className
    )}
  >
    {children}
  </p>
);

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  size = 'section',
  align = 'left',
  as = 'h2',
  className,
}) => {
  const Tag = as;

  return (
    <div
      className={cn(
        size === 'display' ? 'max-w-3xl' : 'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}

      <Tag className={cn('font-bold text-ink text-balance', SIZE[size])}>{title}</Tag>

      {subtitle && (
        <p
          className={cn(
            'mt-5 leading-relaxed text-muted',
            size === 'display' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
