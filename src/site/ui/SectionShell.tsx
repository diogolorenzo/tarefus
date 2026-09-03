import React, { useCallback } from 'react';
import { cn } from './cn';
import { track } from '../../analytics/track';
import { useInViewOnce } from '../hooks/useSiteHooks';
import type { SectionId } from '../../content/home';

/**
 * A densidade é o instrumento de ritmo da página.
 *
 * Antes toda seção usava o mesmo `py-20`, e a variação ficava por conta da troca
 * de superfície — que quase não aparece, porque `--app`, `--raised` e `--sunken`
 * são valores vizinhos. O resultado eram doze blocos no mesmo compasso.
 *
 * Agora o espaço vertical é escolhido: `air` para os dois momentos que merecem
 * silêncio, `dense` para os blocos de informação que devem parecer compactos de
 * propósito. Regra de uso, verificada em `HomePage.tsx`: duas seções vizinhas
 * nunca repetem a mesma densidade.
 */
export type Density = 'air' | 'normal' | 'dense';

export type Surface = 'app' | 'raised' | 'sunken';

interface SectionShellProps {
  id: SectionId;
  /** Âncora extra, quando o id de analytics e o destino de link diferem. */
  anchorId?: string;
  surface?: Surface;
  density?: Density;
  /** `text` estreita para largura de leitura; `wide` mantém a grade cheia. */
  width?: 'wide' | 'text';
  className?: string;
  children: React.ReactNode;
}

const DENSITY: Record<Density, string> = {
  air: 'py-20 sm:py-24 lg:py-28',
  normal: 'py-16 sm:py-20 lg:py-24',
  dense: 'py-10 sm:py-12 lg:py-16',
};

const SURFACE: Record<Surface, string> = {
  app: 'bg-app',
  raised: 'bg-surface',
  sunken: 'bg-sunken',
};

/**
 * Moldura padrão das seções: escolhe a densidade, alterna superfície (nunca cor
 * de marca), mantém a largura de leitura e dispara `section_view` uma só vez.
 */
export const SectionShell: React.FC<SectionShellProps> = ({
  id,
  anchorId,
  surface = 'app',
  density = 'normal',
  width = 'wide',
  className,
  children,
}) => {
  const onFirstView = useCallback(() => {
    track({ name: 'section_view', props: { sectionId: id } });
  }, [id]);

  const ref = useInViewOnce<HTMLElement>(onFirstView);

  return (
    <section
      id={id}
      ref={ref}
      className={cn('scroll-mt-20 px-5 sm:px-6', DENSITY[density], SURFACE[surface], className)}
    >
      {anchorId && <span id={anchorId} className="block scroll-mt-24" aria-hidden="true" />}
      <div className={cn('mx-auto w-full', width === 'text' ? 'max-w-3xl' : 'max-w-6xl')}>
        {children}
      </div>
    </section>
  );
};
