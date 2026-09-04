import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Users, X } from 'lucide-react';
import type { User } from '../../types';
import {
  getAssigneeSelectionSummary,
  getVisibleAssignees,
  toggleAssignee,
} from '../../utils/assigneeSelection';
import { useAnchoredPopup } from './useAnchoredPopup';

interface AssigneeMultiSelectProps {
  users: User[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  currentUserId?: string;
  label?: string;
  description?: string;
}

export const AssigneeMultiSelect: React.FC<AssigneeMultiSelectProps> = ({
  users,
  selectedIds,
  onChange,
  currentUserId,
  label = 'Responsáveis',
  description = 'Selecione as pessoas responsáveis por esta tarefa',
}) => {
  const [query, setQuery] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogId = useId();
  const searchId = useId();
  const liveId = useId();
  const { isOpen, open, close, toggle, triggerRef, panelRef, position } = useAnchoredPopup({
    estimatedHeight: 470,
    minWidth: 360,
  });

  const visibleAssignees = useMemo(
    () => getVisibleAssignees({ users, selectedIds, currentUserId, query }),
    [users, selectedIds, currentUserId, query]
  );
  const selectedSummary = useMemo(
    () => getAssigneeSelectionSummary(users, selectedIds),
    [users, selectedIds]
  );
  const allSelectedUsers = useMemo(
    () =>
      selectedIds
        .map((id) => users.find((user) => user.id === id))
        .filter((user): user is User => Boolean(user)),
    [users, selectedIds]
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)');
    const updateIsMobile = () => setIsMobile(media.matches);
    updateIsMobile();
    media.addEventListener('change', updateIsMobile);
    return () => media.removeEventListener('change', updateIsMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isOpen]);

  const updateSelection = (userId: string) => {
    onChange(toggleAssignee(selectedIds, userId));
  };

  const handleOpen = () => {
    setQuery('');
    open();
  };

  const handleClose = () => {
    close();
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isMobile || event.key !== 'Tab') return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const panelStyle = isMobile
    ? undefined
    : {
        top: position?.placement === 'bottom' ? position.top : undefined,
        bottom: position?.placement === 'top' ? window.innerHeight - (position?.top ?? 0) : undefined,
        left: position?.left,
        width: position?.width,
      };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-subtle" />
          {label}
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 normal-case tracking-normal">
            {selectedIds.length} {selectedIds.length === 1 ? 'selecionado' : 'selecionados'}
          </span>
        </div>
        <span className="text-[11px] text-subtle">{description}</span>
      </div>

      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? dialogId : undefined}
        aria-describedby={liveId}
        onClick={() => (isOpen ? toggle() : handleOpen())}
        className="w-full min-h-12 flex items-center gap-2 rounded-xl border border-line bg-sunken/70 px-3 py-2 text-left transition-colors hover:border-line-strong focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30 cursor-pointer"
      >
        {selectedSummary.visible.length > 0 ? (
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedSummary.visible.map((user) => (
              <span
                key={user.id}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-surface border border-line px-1.5 py-1 text-xs font-semibold text-ink"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white ${
                    user.avatarColor || 'bg-indigo-600'
                  }`}
                >
                  {user.initials}
                </span>
                <span className="truncate">{user.name}</span>
              </span>
            ))}
            {selectedSummary.extraCount > 0 && (
              <span className="inline-flex items-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                +{selectedSummary.extraCount}
              </span>
            )}
          </span>
        ) : (
          <span className="flex-1 text-sm text-subtle">Selecionar responsáveis</span>
        )}
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 shrink-0">Selecionar</span>
      </button>
      <span id={liveId} className="sr-only" aria-live="polite">
        {selectedIds.length} {selectedIds.length === 1 ? 'responsável selecionado' : 'responsáveis selecionados'}
      </span>

      {isOpen &&
        createPortal(
          <>
            {isMobile && (
              <div
                aria-hidden="true"
                onMouseDown={handleClose}
                className="fixed inset-0 z-[60] cursor-default bg-slate-950/45 backdrop-blur-[1px]"
              />
            )}
            <div
              ref={panelRef}
              id={dialogId}
              role="dialog"
              aria-modal={isMobile}
              aria-label="Selecionar responsáveis"
              onKeyDown={handlePanelKeyDown}
              style={panelStyle}
              className={`fixed z-[61] flex flex-col border border-line bg-overlay shadow-[0_20px_60px_-16px_rgba(15,23,42,0.4)] dark:shadow-[0_24px_72px_-18px_rgba(0,0,0,0.8)] ${
                isMobile
                  ? 'inset-x-0 bottom-0 max-h-[82dvh] rounded-t-3xl'
                  : 'max-h-[min(32rem,calc(100vh-1rem))] rounded-2xl'
              }`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-line px-4 pb-3 pt-4">
                <div>
                  <h4 className="text-sm font-extrabold text-ink">Selecionar responsáveis</h4>
                  <p className="mt-0.5 text-xs text-muted">Busque por nome, e-mail ou cargo.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-subtle hover:bg-sunken hover:text-ink focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  aria-label="Fechar seleção de responsáveis"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 px-4 py-3">
                {allSelectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5" aria-label="Responsáveis selecionados">
                    {allSelectedUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => updateSelection(user.id)}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 px-2 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                        aria-label={`Remover ${user.name} dos responsáveis`}
                      >
                        <span className="truncate">{user.name}</span>
                        {user.status === 'inactive' && <span className="text-[10px]">Inativo</span>}
                        <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    ref={searchInputRef}
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Buscar responsáveis por nome, e-mail ou cargo"
                    placeholder="Buscar responsável..."
                    className="w-full rounded-xl border border-line bg-sunken py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-subtle focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto border-t border-line p-2" aria-label="Lista de responsáveis">
                {visibleAssignees.length > 0 ? (
                  <div className="space-y-1">
                    {visibleAssignees.map(({ user, isSelected, isInactive }) => (
                      <label
                        key={user.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${
                          isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-sunken'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => updateSelection(user.id)}
                          className="h-4 w-4 shrink-0 accent-indigo-600"
                        />
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${
                            user.avatarColor || 'bg-indigo-600'
                          }`}
                        >
                          {user.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                            <span className="truncate">{user.name}</span>
                            {user.id === currentUserId && <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">Você</span>}
                            {isInactive && <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Inativo</span>}
                          </span>
                          <span className="block truncate text-xs text-muted">{user.role} · {user.email}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-muted">Nenhum colaborador encontrado.</p>
                )}
              </div>

              {isMobile && (
                <div className="border-t border-line p-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                  >
                    Concluir seleção
                  </button>
                </div>
              )}
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
