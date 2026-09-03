import React from 'react';
import { CtaButton } from '../ui/CtaButton';
import { cn } from '../ui/cn';
import { useScrolledPast } from '../hooks/useSiteHooks';
import { home } from '../../content/home';

/**
 * SF — Barra fixa do celular.
 * Aparece depois que o herói sai da tela e some quando o bloco de fechamento entra,
 * para não duplicar o mesmo botão na mesma tela.
 */
export const StickyMobileCta: React.FC = () => {
  const visible = useScrolledPast('hero', 'comecar');

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-3 md:hidden',
        'pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]',
        'transition-transform duration-200',
        // Fora da tela, a barra também não recebe toque.
        !visible && 'pointer-events-none'
      )}
      style={{ transform: visible ? 'translateY(0)' : 'translateY(120%)' }}
      aria-hidden={!visible}
    >
      <CtaButton
        label={home.stickyCta.label}
        href={home.stickyCta.href}
        ctaId="sticky_primary"
        sectionId="hero"
        fullWidth
      />
    </div>
  );
};
