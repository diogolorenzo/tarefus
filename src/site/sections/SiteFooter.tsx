import React from 'react';
import { CheckSquare2 } from 'lucide-react';
import { home } from '../../content/home';

/**
 * S13 — Rodapé.
 * Colunas cujos destinos ainda não existem ficam de fora, não desativadas (decisão D13).
 * Razão social e CNPJ entram antes do lançamento com cadastro aberto (pendência P1).
 */
export const SiteFooter: React.FC = () => (
  <footer className="border-t border-line bg-sunken px-5 py-12 sm:px-6">
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <CheckSquare2 className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-bold tracking-tight text-ink">Tarefus</span>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
            Gestão de tarefas para pequenas empresas brasileiras.
          </p>
        </div>

        {home.footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Contato</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <a
                href={`mailto:${home.footer.contactEmail}`}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {home.footer.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-10 border-t border-line pt-6 text-xs text-subtle">
        © {new Date().getFullYear()} {home.footer.legalNote}
      </p>
    </div>
  </footer>
);
