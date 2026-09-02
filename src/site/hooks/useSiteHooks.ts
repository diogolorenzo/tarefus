import { useEffect, useRef, useState } from 'react';

/**
 * Observa um elemento e avisa uma única vez quando ele fica visível.
 * Usado para o evento `section_view` (50% visível, ver plano 8.2).
 */
export function useInViewOnce<T extends HTMLElement>(
  onFirstView?: () => void,
  threshold = 0.5
): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || firedRef.current || !onFirstView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true;
            onFirstView();
            observer.disconnect();
          }
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onFirstView, threshold]);

  return ref;
}

/** Respeita a preferência do sistema por menos movimento (critério de acessibilidade 9.1). */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(query.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefers;
}

/**
 * Verdadeiro depois que `targetId` sai da tela e enquanto `hideOnId` não entra.
 * Usado pela barra fixa do celular: ela aparece quando o herói sai e some quando
 * a chamada final chega, para não duplicar o mesmo botão na mesma tela.
 *
 * Usa medição direta em vez de IntersectionObserver: o estado depende de duas
 * condições combinadas, e ler as duas no mesmo quadro evita a ordem de disparo
 * entre observadores separados.
 */
export function useScrolledPast(targetId: string, hideOnId?: string): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const targetGone = target.getBoundingClientRect().bottom <= 0;

      const hideOn = hideOnId ? document.getElementById(hideOnId) : null;
      const hideOnVisible = hideOn ? hideOn.getBoundingClientRect().top < window.innerHeight : false;

      setVisible(targetGone && !hideOnVisible);
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [targetId, hideOnId]);

  return visible;
}
