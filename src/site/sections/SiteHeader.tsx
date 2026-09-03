import React, { useEffect, useRef, useState } from 'react';
import { CheckSquare2, Menu, X } from 'lucide-react';
import { CtaButton } from '../ui/CtaButton';
import { cn } from '../ui/cn';
import { home } from '../../content/home';

/**
 * S0 — Barra de navegação.
 * Fixa apenas depois de 120px de rolagem, para não roubar altura da primeira dobra.
 */
export const SiteHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'z-40 w-full border-b border-line bg-surface transition-shadow',
        scrolled ? 'sticky top-0 shadow-sm' : 'relative'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <a href="/" className="flex items-center gap-2 rounded-lg" aria-label="Tarefus, página inicial">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <CheckSquare2 className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">Tarefus</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {home.header.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={home.header.loginHref}
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Entrar
          </a>
          <CtaButton
            label={home.header.cta.label}
            href={home.header.cta.href}
            size="md"
            ctaId="nav_primary"
            sectionId="nav"
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CtaButton
            label={home.header.cta.label}
            href={home.header.cta.href}
            size="md"
            ctaId="nav_primary_mobile"
            sectionId="nav"
          />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line text-muted"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-line bg-surface px-5 py-4 md:hidden">
          <ul className="space-y-1">
            {home.header.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={home.header.loginHref}
                className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-ink"
              >
                Entrar
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
