import React from 'react';

interface AiMarkProps {
  className?: string;
  /** Rótulo acessível; o desenho é puramente decorativo. */
  title?: string;
}

/**
 * Marca de "gerado com IA" do Tarefus.
 *
 * Substitui a estrelinha de brilho (✨ / Sparkles), que virou clichê visual
 * de app feito por IA. Aqui a IA é indicada por um glifo geométrico próprio:
 * um traço em diagonal com dois pontos, sugerindo "de um rascunho para a
 * tarefa pronta". Herda currentColor, então funciona em qualquer contexto.
 */
export const AiMark: React.FC<AiMarkProps> = ({ className = 'w-4 h-4', title }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role={title ? 'img' : 'presentation'}
    aria-hidden={title ? undefined : true}
  >
    {title && <title>{title}</title>}
    <path d="M2.5 13.5 L9 7" />
    <path d="M9.5 2.5 L12 5" />
    <circle cx="11" cy="10.5" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="4" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Selo textual "IA" — usado quando é melhor dizer com todas as letras
 * (ex.: badge em um cartão de tarefa criado por IA).
 */
export const AiBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide
      bg-indigo-50 text-indigo-700 border border-indigo-200
      dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/25 ${className}`}
  >
    <AiMark className="w-3 h-3" />
    IA
  </span>
);
