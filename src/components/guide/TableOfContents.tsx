import React, { useState, useEffect } from 'react';
import type { TableOfContentsItem } from '../../types/guide';
import { List, ChevronDown, ChevronUp, ArrowUp, Bookmark } from 'lucide-react';

export interface TableOfContentsProps {
  items: TableOfContentsItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
  variant?: 'desktop' | 'mobile' | 'both';
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  activeId: controlledActiveId,
  onItemClick,
  className = '',
  variant = 'both',
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string>(
    items.length > 0 ? items[0].id : ''
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const currentActiveId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  // Track active heading on scroll & calculate reading progress
  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate progress percentage
      const totalScrollable = documentHeight - windowHeight;
      if (totalScrollable > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollY / totalScrollable) * 100)));
        setReadProgress(progress);
      }

      // Detect active heading
      const headingElements = items
        .map((item) => {
          const el = document.getElementById(item.id);
          return el ? { id: item.id, top: el.getBoundingClientRect().top } : null;
        })
        .filter((item): item is { id: string; top: number } => item !== null);

      if (headingElements.length === 0) return;

      // Find the heading that is closest to top of viewport (threshold 140px for header offset)
      const offsetThreshold = 140;
      let active = headingElements[0].id;

      for (let i = 0; i < headingElements.length; i++) {
        if (headingElements[i].top <= offsetThreshold) {
          active = headingElements[i].id;
        } else {
          break;
        }
      }

      setInternalActiveId(active);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items]);

  const handleHeadingClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setInternalActiveId(id);
    if (onItemClick) {
      onItemClick(id);
    }

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL hash without jumping
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch {
        // Ignore if restricted
      }
    }

    // Close mobile dropdown after selecting
    setIsMobileOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) {
    return null;
  }

  const activeItemTitle =
    items.find((item) => item.id === currentActiveId)?.title || items[0]?.title || 'Sumário';

  const renderContent = () => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = currentActiveId === item.id;
        const isH3 = item.level === 3;

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleHeadingClick(item.id, e)}
            className={`group flex items-start gap-2 py-1.5 px-3 rounded-lg text-sm transition-all duration-150 leading-snug ${
              isH3 ? 'pl-6 text-xs' : 'font-medium'
            } ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                : 'text-muted hover:text-ink hover:bg-slate-100/70 dark:hover:bg-white/[0.04]'
            }`}
          >
            <span
              className={`mt-1.5 shrink-0 rounded-full transition-all duration-150 ${
                isH3 ? 'w-1.5 h-1.5' : 'w-2 h-2'
              } ${
                isActive
                  ? 'bg-indigo-600 dark:bg-indigo-400 scale-110'
                  : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 dark:group-hover:bg-slate-600'
              }`}
            />
            <span className="flex-1 truncate group-hover:text-clip">{item.title}</span>
          </a>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      {/* Mobile Collapsible TOC Drawer / Card */}
      {(variant === 'mobile' || variant === 'both') && (
        <div className="block lg:hidden w-full mb-6">
          <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-xs transition-all">
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
              aria-expanded={isMobileOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                  <List className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Neste artigo ({items.length} tópicos)
                  </div>
                  <div className="text-sm font-medium text-ink truncate max-w-[240px] sm:max-w-[360px]">
                    {activeItemTitle}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {readProgress > 0 && (
                  <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    {readProgress}%
                  </span>
                )}
                <div className="text-muted p-1">
                  {isMobileOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>

            {/* Mobile Expandable List */}
            {isMobileOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-line/60 bg-slate-50/50 dark:bg-slate-900/30">
                {renderContent()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sticky Floating TOC */}
      {(variant === 'desktop' || variant === 'both') && (
        <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs">
            {/* Header with Reading Progress */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Neste Artigo
                </h4>
              </div>
              <span className="text-xs font-mono font-medium text-muted">
                {readProgress}% lido
              </span>
            </div>

            {/* Reading Progress Line */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mb-4 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${readProgress}%` }}
              />
            </div>

            {/* Navigation items list */}
            <nav className="space-y-0.5" aria-label="Sumário do Artigo">
              {renderContent()}
            </nav>

            {/* Back to top shortcut */}
            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Voltar ao topo
              </button>
              <span className="text-[11px] text-subtle">
                {items.length} tópicos
              </span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
