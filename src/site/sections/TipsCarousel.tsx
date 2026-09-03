import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SectionShell } from '../ui/SectionShell';
import { SectionHeading } from '../ui/SectionHeading';
import { cn } from '../ui/cn';
import { track } from '../../analytics/track';
import { TIPS } from '../../content/tips';
import { home } from '../../content/home';

/**
 * S7 — Carrossel de dicas.
 *
 * Faixa de cartões deslizantes no lugar de uma seção alta: o assunto "como
 * escrever uma boa tarefa" cabe em oito cartões curtos, e quem quiser o texto
 * inteiro segue para o artigo do Guia de onde a dica saiu.
 *
 * A rolagem é nativa, com `scroll-snap` — arrasta no celular, roda no trackpad
 * e anda de Tab em Tab no teclado, sem depender de JavaScript para funcionar.
 * As setas são um atalho do desktop, não o único caminho: elas somem quando não
 * há mais para onde ir.
 */
export const TipsCarousel: React.FC = () => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= max - 8);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  const scrollBy = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    // Um cartão e meio por clique: o meio cartão que sobra na borda avisa que a
    // faixa continua.
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.7), behavior: 'smooth' });
    track({ name: 'tips_scroll', props: { direction: direction === 1 ? 'next' : 'prev' } });
  };

  return (
    <SectionShell id="dicas" density="dense" surface="sunken">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow={home.dicas.eyebrow}
          title={home.dicas.title}
          subtitle={home.dicas.subtitle}
        />

        <div className="hidden shrink-0 gap-2 sm:flex">
          {(
            [
              { dir: -1 as const, Icon: ArrowLeft, label: 'Dicas anteriores', disabled: atStart },
              { dir: 1 as const, Icon: ArrowRight, label: 'Próximas dicas', disabled: atEnd },
            ]
          ).map(({ dir, Icon, label, disabled }) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollBy(dir)}
              disabled={disabled}
              aria-label={label}
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition',
                disabled ? 'opacity-35' : 'hover:border-line-strong hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {/* A faixa sangra até a borda da tela: o cartão cortado é o que diz que dá para arrastar. */}
      <ul
        ref={trackRef}
        onScroll={sync}
        className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 scroll-pl-5 sm:-mx-6 sm:px-6 sm:scroll-pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TIPS.map((tip) => (
          <li
            key={tip.id}
            className="flex w-[17rem] shrink-0 snap-start flex-col rounded-2xl border border-line bg-surface p-5 sm:w-[19rem]"
          >
            <span className="text-xs font-semibold text-subtle tnum">
              {String(tip.index).padStart(2, '0')}
            </span>

            <h3 className="mt-3 text-base font-semibold leading-snug text-ink text-balance">
              {tip.title}
            </h3>

            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{tip.body}</p>

            <a
              href={`/guia/${tip.articleSlug}`}
              onClick={() =>
                track({ name: 'tip_article_click', props: { tipId: tip.id, slug: tip.articleSlug } })
              }
              className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
            >
              {tip.articleLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      <a
        href={home.dicas.guideCta.href}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        {home.dicas.guideCta.label}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </SectionShell>
  );
};
