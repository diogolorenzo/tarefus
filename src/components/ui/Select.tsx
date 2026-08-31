import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useAnchoredPopup } from './useAnchoredPopup';

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundário opcional, exibido abaixo do rótulo. */
  hint?: string;
  disabled?: boolean;
}

type SelectSize = 'sm' | 'md';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ComponentType<{ className?: string }>;
  size?: SelectSize;
  disabled?: boolean;
  placeholder?: string;
  /** Rótulo acessível quando não há <label> associado. */
  ariaLabel?: string;
  /** Classes extras no gatilho (usado para variações de cor por status). */
  className?: string;
  wrapperClassName?: string;
}

const SIZES: Record<SelectSize, { trigger: string; text: string; withIcon: string }> = {
  sm: { trigger: 'h-9 pl-3 pr-9', text: 'text-xs', withIcon: 'pl-8' },
  md: { trigger: 'h-11 pl-3.5 pr-10', text: 'text-sm', withIcon: 'pl-9' },
};

/**
 * Lista suspensa do Tarefus.
 *
 * Desenhada por nós em vez de usar o popup do `<select>` nativo, que é
 * renderizado pelo sistema operacional e por isso ignora tema, tipografia
 * e raio de borda do app (a "cara de Windows"). Aqui o painel segue os
 * mesmos tokens do resto da interface.
 *
 * Acessibilidade: o gatilho é um combobox e o painel um listbox, com
 * navegação por setas, Home/End, busca por digitação, Enter/Espaço para
 * escolher e Esc para fechar.
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  icon: Icon,
  size = 'md',
  disabled = false,
  placeholder = 'Selecione...',
  ariaLabel,
  className = '',
  wrapperClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typeahead = useRef({ query: '', at: 0 });
  const listId = useRef(`listbox-${Math.random().toString(36).slice(2, 9)}`);

  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const close = React.useCallback(() => setIsOpen(false), []);
  const { triggerRef, panelRef, position } = useAnchoredPopup({
    isOpen,
    onClose: close,
    estimatedHeight: 280,
    minWidth: 180,
  });

  const sizes = SIZES[size];

  const open = () => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const pick = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const step = (from: number, delta: number) => {
    if (options.length === 0) return -1;
    let next = from;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + delta + options.length) % options.length;
      if (!options[next].disabled) return next;
    }
    return -1;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => step(i, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => step(i, -1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(step(-1, 1));
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(step(0, -1));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        pick(activeIndex);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        // Busca por digitação: "ma" salta para "Marketing".
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
          const now = Date.now();
          const state = typeahead.current;
          state.query = now - state.at > 800 ? event.key : state.query + event.key;
          state.at = now;
          const match = options.findIndex(
            (o) => !o.disabled && o.label.toLowerCase().startsWith(state.query.toLowerCase())
          );
          if (match >= 0) setActiveIndex(match);
        }
    }
  };

  // Mantém a opção destacada visível ao navegar por teclado.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    panelRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, panelRef]);

  return (
    <div className={`relative ${wrapperClassName}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId.current : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center gap-2 rounded-xl border text-left font-medium transition-colors cursor-pointer
          bg-surface text-ink
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30
          ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-line hover:border-line-strong'}
          ${sizes.trigger} ${sizes.text} ${Icon ? sizes.withIcon : ''} ${className}`}
      >
        {Icon && (
          <Icon className="w-4 h-4 text-subtle absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
        <span className={`flex-1 truncate ${selected ? '' : 'text-subtle'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-subtle absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            id={listId.current}
            role="listbox"
            aria-activedescendant={activeIndex >= 0 ? `${listId.current}-${activeIndex}` : undefined}
            style={{
              position: 'fixed',
              top: position.placement === 'bottom' ? position.top : undefined,
              bottom:
                position.placement === 'top' ? window.innerHeight - position.top : undefined,
              left: position.left,
              minWidth: position.width,
            }}
            className="z-[60] max-h-[280px] overflow-y-auto rounded-2xl border border-line bg-overlay p-1.5
              shadow-[0_16px_40px_-12px_rgba(15,23,42,0.28)] dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)]
              animate-fade-in"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <div
                  key={option.value}
                  id={`${listId.current}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                  onClick={() => pick(index)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-colors
                    ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    ${isActive && !option.disabled ? 'bg-sunken' : ''}
                    ${isSelected ? 'font-semibold text-ink' : 'text-muted'}`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && (
                      <span className="block text-[11px] text-subtle truncate">{option.hint}</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
