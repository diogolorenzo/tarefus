import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnchoredPopup } from './useAnchoredPopup';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** 'YYYY-MM-DD' -> Date local (evita o deslocamento de fuso do construtor ISO). */
const parse = (value?: string): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const format = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  wrapperClassName?: string;
  /** Datas selecionáveis. Fora do conjunto, o dia fica riscado e inerte. */
  enabledDates?: Set<string>;
  /** Menor data selecionável, em 'YYYY-MM-DD'. */
  min?: string;
  /** 'bare' remove moldura e altura fixa, para uso dentro de um cartão. */
  variant?: 'default' | 'bare';
}

/**
 * Seletor de data do Tarefus.
 *
 * Substitui o `<input type="date">`, cujo calendário é desenhado pelo
 * navegador e ignora o tema e a tipografia do app.
 *
 * É de data única — não de intervalo — porque o app usa data só para o
 * prazo de uma tarefa. Por isso não há botão "Aplicar": com uma única
 * data o clique no dia já é a confirmação, e pedir um segundo clique só
 * adicionaria etapa.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Sem prazo definido',
  ariaLabel,
  wrapperClassName = '',
  enabledDates,
  min,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = useMemo(() => parse(value), [value]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const minDate = useMemo(() => parse(min), [min]);

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const close = React.useCallback(() => setIsOpen(false), []);
  const { triggerRef, panelRef, position } = useAnchoredPopup({
    isOpen,
    onClose: close,
    estimatedHeight: 380,
    minWidth: 300,
  });

  // Grade de 6 semanas: a altura do popup não muda ao trocar de mês.
  const cells = useMemo(() => {
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [viewMonth]);

  const isUnavailable = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (enabledDates && !enabledDates.has(format(date))) return true;
    return false;
  };

  const openPicker = () => {
    const base = selected ?? today;
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setIsOpen(true);
  };

  const shiftMonth = (delta: number) =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const choose = (date: Date) => {
    if (isUnavailable(date)) return;
    onChange(format(date));
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const setRelative = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    choose(d);
  };

  const label = selected
    ? selected.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : placeholder;

  const statusText = selected
    ? isSameDay(selected, today)
      ? 'Vence hoje'
      : `${Math.round((selected.getTime() - today.getTime()) / 86400000)} dias a partir de hoje`
    : 'Escolha uma data ou use um atalho';

  return (
    <div className={`relative ${wrapperClassName}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
        className={
          variant === 'bare'
            ? 'w-full flex items-center gap-2 text-left text-xs font-bold cursor-pointer rounded-lg focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30'
            : `w-full h-11 flex items-center gap-2.5 pl-3.5 pr-3 rounded-xl border text-left text-sm font-medium
              transition-colors cursor-pointer bg-surface
              focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30
              ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-line hover:border-line-strong'}`
        }
      >
        {variant === 'default' && <CalendarDays className="w-4 h-4 text-subtle shrink-0" />}
        <span className={`flex-1 truncate ${selected ? 'text-ink' : 'text-subtle'}`}>{label}</span>
        <ChevronDown
          className={`w-4 h-4 text-subtle shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Selecionar data"
            style={{
              position: 'fixed',
              top: position.placement === 'bottom' ? position.top : undefined,
              bottom: position.placement === 'top' ? window.innerHeight - position.top : undefined,
              left: position.left,
              width: Math.max(position.width, 300),
            }}
            className="z-[60] rounded-2xl border border-line bg-overlay p-3
              shadow-[0_20px_50px_-12px_rgba(15,23,42,0.3)] dark:shadow-[0_20px_56px_-12px_rgba(0,0,0,0.75)]
              animate-fade-in"
          >
            {/* Navegação de mês */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Mês anterior"
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm font-semibold text-ink">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Próximo mês"
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-sunken transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d, i) => (
                <span
                  key={`${d}-${i}`}
                  className="text-center text-[11px] font-semibold text-subtle py-1"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {cells.map((date) => {
                const outsideMonth = date.getMonth() !== viewMonth.getMonth();
                const unavailable = isUnavailable(date);
                const isSelected = selected ? isSameDay(date, selected) : false;
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={date.getTime()}
                    type="button"
                    disabled={unavailable}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => choose(date)}
                    className={`h-9 rounded-xl text-[13px] tnum transition-colors
                      ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold'
                          : unavailable
                          ? 'text-subtle line-through opacity-50 cursor-not-allowed'
                          : outsideMonth
                          ? 'text-subtle hover:bg-sunken cursor-pointer'
                          : 'text-ink hover:bg-sunken cursor-pointer'
                      }
                      ${isToday && !isSelected ? 'ring-1 ring-inset ring-indigo-400/70 font-semibold' : ''}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Rodapé: estado atual, atalhos e limpar */}
            <div className="mt-2.5 pt-2.5 border-t border-line space-y-2">
              <p className="text-[11px] text-muted px-0.5">{statusText}</p>

              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Hoje', days: 0 },
                  { label: 'Amanhã', days: 1 },
                  { label: '+7 dias', days: 7 },
                ].map((shortcut) => (
                  <button
                    key={shortcut.label}
                    type="button"
                    onClick={() => setRelative(shortcut.days)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-muted
                      bg-sunken hover:text-ink hover:bg-line transition-colors cursor-pointer"
                  >
                    {shortcut.label}
                  </button>
                ))}

                {value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                    }}
                    className="ml-auto px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                      text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10
                      transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
