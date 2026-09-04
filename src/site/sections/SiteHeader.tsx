import React, { useEffect, useRef, useState } from 'react';
import { CheckSquare2, ChevronDown, Menu, X } from 'lucide-react';
import { CtaButton } from '../ui/CtaButton';
import { cn } from '../ui/cn';
import { home } from '../../content/home';

/**
 * S0 — Barra de navegação em pílula flutuante.
 *
 * A barra não ocupa mais a largura da tela: é uma pílula centralizada que
 * flutua sobre o herói e só ganha sombra depois de 120px de rolagem, quando
 * passa a cobrir conteúdo e o contorno vira função, não enfeite.
 *
 * "Recursos" é um menu suspenso que abre no clique — não no hover, que no
 * celular não existe e no desktop dispara sem intenção. Fecha por três
 * caminhos, um para cada forma de sair dele: Esc, clique fora (ponteiro) e
 * perda de foco (teclado).
 */
export const SiteHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Esc fecha o painel aberto e devolve o foco a quem o abriu.
  useEffect(() => {
    if (!menuOpen && !mobileOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, mobileOpen]);

  // Clique fora fecha o suspenso do desktop.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    closeAll();
    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 76;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', href);
      }
    }
  };

  const itemClass =
    'block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink';

  return (
    <header className="pointer-events-none sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="pointer-events-auto mx-auto w-full max-w-5xl">
        <div
          className={cn(
            'flex h-14 items-center justify-between gap-3 rounded-full border px-3 pl-4 transition-shadow',
            scrolled
              ? 'border-line bg-surface/90 shadow-[0_8px_28px_-12px_rgba(15,23,42,0.28)] backdrop-blur-md dark:shadow-[0_8px_28px_-10px_rgba(0,0,0,0.7)]'
              : 'border-transparent bg-surface/70 backdrop-blur-sm'
          )}
        >
          <a
            href="/"
            onClick={closeAll}
            className="flex shrink-0 items-center gap-2 rounded-lg"
            aria-label="Tarefus, página inicial"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emphasis">
              <CheckSquare2 className="h-4 w-4 text-emphasis-ink" aria-hidden="true" />
            </span>
            <span className="text-base font-bold tracking-tight text-ink">Tarefus</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            <div
              ref={menuRef}
              className="relative"
              // `pointerdown` fora só cobre mouse e toque. Quem abre o menu
              // pelo teclado e passa do último item com Tab não gera evento de
              // ponteiro nenhum: sem isto, o painel fica aberto por cima do
              // conteúdo com o foco já em outro lugar da página.
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
              }}
            >
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="menu-recursos"
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {home.header.menu.label}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform duration-200', menuOpen && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>

              <div
                id="menu-recursos"
                className={cn(
                  'absolute left-0 top-full z-50 mt-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-[0_20px_48px_-20px_rgba(15,23,42,0.35)] dark:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.75)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left',
                  menuOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none invisible'
                )}
                aria-hidden={!menuOpen}
              >
                <ul>
                  {home.header.menu.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={(e) => handleAnchorClick(e, item.href)}
                        className={itemClass}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {home.header.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1 md:flex">
            <a
              href={home.header.loginHref}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Entrar
            </a>
            <CtaButton
              label={home.header.cta.label}
              href={home.header.cta.href}
              size="md"
              ctaId="nav_primary"
              sectionId="nav"
              className="rounded-full"
            />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <CtaButton
              label={home.header.cta.label}
              href={home.header.cta.href}
              size="md"
              ctaId="nav_primary_mobile"
              sectionId="nav"
              className="rounded-full"
            />
            <button
              ref={mobileButtonRef}
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="menu-mobile"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5 transition-transform duration-200" /> : <Menu className="h-5 w-5 transition-transform duration-200" />}
            </button>
          </div>
        </div>

        <div
          id="menu-mobile"
          aria-hidden={!mobileOpen}
          className={cn(
            'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden',
            mobileOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl border border-line bg-surface p-2 shadow-[0_20px_48px_-20px_rgba(15,23,42,0.35)] dark:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.75)]">
              <ul>
                {[...home.header.menu.items, ...home.header.links].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink transition-colors hover:bg-sunken"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={home.header.loginHref}
                    className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-muted transition-colors hover:bg-sunken hover:text-ink"
                  >
                    Entrar
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
