import React from 'react';
import { cn } from './cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Título de seção. O <h1> existe apenas no herói (hierarquia 7.3 do plano). */
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}) => (
  <div
    className={cn(
      'max-w-2xl',
      align === 'center' && 'mx-auto text-center',
      className
    )}
  >
    {eyebrow && (
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        {eyebrow}
      </p>
    )}
    <h2 className="text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
      {title}
    </h2>
    {subtitle && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
  </div>
);
