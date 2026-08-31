import React from 'react';
import { ChevronDown } from 'lucide-react';

type SelectSize = 'sm' | 'md';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Ícone opcional exibido à esquerda (componente Lucide). */
  icon?: React.ComponentType<{ className?: string }>;
  selectSize?: SelectSize;
  /** Classes extras aplicadas ao <select> (útil para variações de cor). */
  className?: string;
  /** Classes aplicadas ao wrapper. */
  wrapperClassName?: string;
}

const SIZES: Record<SelectSize, { base: string; withIcon: string; text: string }> = {
  sm: { base: 'py-1.5 pl-3 pr-8', withIcon: 'pl-8', text: 'text-xs' },
  md: { base: 'py-2.5 pl-3.5 pr-9', withIcon: 'pl-9', text: 'text-sm' },
};

/**
 * Dropdown padrão do Tarefus.
 *
 * Usa o <select> nativo de propósito: no celular abre a roleta do sistema
 * (mais simples e acessível que um menu customizado) e, como o app define
 * `color-scheme`, o popup já é renderizado escuro no modo escuro.
 * A seta é desenhada por nós para ficar igual em todos os navegadores.
 */
export const Select: React.FC<SelectProps> = ({
  icon: Icon,
  selectSize = 'md',
  className = '',
  wrapperClassName = '',
  children,
  ...props
}) => {
  const size = SIZES[selectSize];

  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon className="w-4 h-4 text-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}

      <select
        {...props}
        className={`w-full appearance-none bg-surface border border-line rounded-xl font-medium text-ink
          hover:border-line-strong focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer
          ${size.base} ${size.text} ${Icon ? size.withIcon : ''} ${className}`}
      >
        {children}
      </select>

      <ChevronDown className="w-4 h-4 text-subtle absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
