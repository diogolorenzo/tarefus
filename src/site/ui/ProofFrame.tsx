import React from 'react';
import { cn } from './cn';

interface ProofFrameProps {
  /** Rótulo da barra da janela: diz que tela do produto está sendo mostrada. */
  label: string;
  /** Legenda abaixo da moldura. É o que transforma imagem em prova. */
  caption?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Moldura única de todas as capturas do produto.
 *
 * Antes cada mock trazia a própria borda e flutuava solto no meio da coluna, em
 * escala de enfeite. Um tratamento só — uma borda, um raio, uma sombra, uma
 * legenda — faz as telas lerem como um sistema e como evidência, não decoração.
 *
 * Os mocks entram aqui sem casca própria (`bare`), para não empilhar bordas.
 */
export const ProofFrame: React.FC<ProofFrameProps> = ({ label, caption, className, children }) => (
  <figure className={cn('m-0', className)}>
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-surface',
        'shadow-[0_28px_70px_-32px_rgba(15,23,42,0.35)]',
        'dark:shadow-[0_28px_70px_-30px_rgba(0,0,0,0.75)]'
      )}
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </span>
        <span className="truncate text-[11px] font-medium text-subtle">{label}</span>
      </div>

      <div className="bg-app p-3 sm:p-4">{children}</div>
    </div>

    {caption && (
      <figcaption className="mt-3 text-xs leading-relaxed text-subtle">{caption}</figcaption>
    )}
  </figure>
);
