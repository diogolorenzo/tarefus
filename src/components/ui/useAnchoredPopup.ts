import { useCallback, useEffect, useRef, useState } from 'react';

export interface AnchoredPosition {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top';
}

interface Options {
  /** Altura estimada do painel, usada para decidir se abre para cima. */
  estimatedHeight?: number;
  /** Largura mínima do painel; por padrão acompanha a do gatilho. */
  minWidth?: number;
  gap?: number;
}

/**
 * Ancora um painel flutuante a um gatilho e controla sua abertura.
 *
 * O painel é renderizado em portal com `position: fixed` porque os nossos
 * popups vivem dentro de modais que têm `overflow-y-auto` — posicionado
 * de forma absoluta ali dentro, ele seria cortado pela área de rolagem.
 *
 * A posição é medida no próprio handler de abertura, e não num efeito
 * após a renderização, para não disparar um segundo render só para
 * posicionar.
 *
 * O fechamento por clique externo escuta `mousedown`, e não `click`, de
 * propósito: ao clicar num dia do calendário ou numa opção da lista, o
 * React re-renderiza e troca o nó clicado antes do `click` subir até o
 * document. Nesse momento `contains(alvo)` já responderia `false` e o
 * painel se fecharia sozinho. Em `mousedown` o nó original ainda está no
 * documento. A checagem de `isConnected` cobre o caso residual de um nó
 * que saia do DOM entre os dois eventos.
 */
export const useAnchoredPopup = ({
  estimatedHeight = 300,
  minWidth,
  gap = 6,
}: Options = {}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<AnchoredPosition | null>(null);

  const isOpen = position !== null;

  const measure = useCallback((): AnchoredPosition | null => {
    const trigger = triggerRef.current;
    if (!trigger) return null;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    const width = Math.max(rect.width, minWidth ?? 0);

    // Mantém o painel dentro da janela na horizontal.
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));

    return {
      top: openUpward ? rect.top - gap : rect.bottom + gap,
      left,
      width,
      placement: openUpward ? 'top' : 'bottom',
    };
  }, [estimatedHeight, minWidth, gap]);

  const open = useCallback(() => setPosition(measure()), [measure]);
  const close = useCallback(() => setPosition(null), []);
  const toggle = useCallback(
    () => setPosition((current) => (current ? null : measure())),
    [measure]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Nó já removido do DOM (grade recriada): não é um clique "fora".
      if (!target.isConnected) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };

    const reposition = () => setPosition(measure());

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', reposition);
    // `true` para acompanhar a rolagem de qualquer ancestral, não só da janela.
    window.addEventListener('scroll', reposition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen, close, measure]);

  return { isOpen, open, close, toggle, triggerRef, panelRef, position };
};
