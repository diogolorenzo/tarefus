import React from 'react';
import { cn } from './cn';
import { track } from '../../analytics/track';
import type { SectionId } from '../../content/home';

/**
 * `onEmphasis` é a variante para a superfície de ênfase, onde o índigo perde
 * contraste: ali o botão inverte em vez de mudar de cor.
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'onEmphasis';

interface CtaButtonProps {
  label: string;
  href: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  ctaId: string;
  sectionId: SectionId | 'nav' | 'footer';
  className?: string;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-muted hover:text-ink',
  onEmphasis: 'bg-emphasis-ink text-emphasis hover:opacity-90',
};

/**
 * Único botão de ação da homepage. O índigo é reservado ao CTA primário
 * (regra de hierarquia 3.0 do plano) — olho-de-seção, ícones e cabeçalho de
 * tabela usam texto neutro, justamente para que este botão seja o ponto mais
 * forte de cada tela. O clique alimenta `cta_click`.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  label,
  href,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  ctaId,
  sectionId,
  className,
}) => {
  const handleClick = () => {
    track({ name: 'cta_click', props: { ctaId, sectionId, label, destination: href } });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-4 py-2.5 text-sm',
        fullWidth && 'w-full',
        VARIANT[variant],
        className
      )}
    >
      {label}
    </a>
  );
};
