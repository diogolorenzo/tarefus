import React, { useCallback } from 'react';
import { cn } from './cn';
import { track } from '../../analytics/track';
import { useInViewOnce } from '../hooks/useSiteHooks';
import type { SectionId } from '../../content/home';

interface SectionShellProps {
  id: SectionId;
  surface?: 'app' | 'raised' | 'sunken';
  className?: string;
  children: React.ReactNode;
}

/**
 * Moldura padrão das seções: alterna superfície (nunca cor de marca),
 * mantém a largura de leitura e dispara `section_view` uma única vez.
 */
export const SectionShell: React.FC<SectionShellProps> = ({
  id,
  surface = 'app',
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
      className={cn(
        'scroll-mt-20 px-5 py-16 sm:px-6 sm:py-20 lg:py-24',
        surface === 'app' && 'bg-app',
        surface === 'raised' && 'bg-surface',
        surface === 'sunken' && 'bg-sunken',
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
};
