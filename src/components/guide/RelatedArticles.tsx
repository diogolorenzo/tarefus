import React, { useMemo } from 'react';
import type { GuideArticle, GuideCategoryKey } from '../../types/guide';
import { getRelatedArticles } from '../../data/guideArticles';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

export interface RelatedArticlesProps {
  currentSlug?: string;
  category?: string;
  categoryKey?: GuideCategoryKey;
  articles?: GuideArticle[];
  limit?: number;
  title?: string;
  subtitle?: string;
  onArticleClick?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  className?: string;
}

const CATEGORY_COLOR_MAP: Record<string, { badge: string; text: string; bg: string }> = {
  'gestao-tarefas-prazos': {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500',
  },
  'lideranca-delegacao': {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
  },
  'ia-produtividade': {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500',
  },
  'metodos-ageis': {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
  },
  'rotinas-equipe': {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500',
  },
};

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  currentSlug = '',
  category = '',
  categoryKey,
  articles: customArticles,
  limit = 3,
  title = 'Artigos Relacionados',
  subtitle = 'Continue aprimorando a gestão e produtividade da sua equipe com estes conteúdos complementares.',
  onArticleClick,
  onNavigate,
  className = '',
}) => {
  // Determine articles to display
  const items: GuideArticle[] = useMemo(() => {
    if (customArticles && customArticles.length > 0) {
      return customArticles.slice(0, limit);
    }
    const cat = category || (categoryKey ? categoryKey : '');
    return getRelatedArticles(currentSlug, cat, limit);
  }, [customArticles, currentSlug, category, categoryKey, limit]);

  if (items.length === 0) {
    return null;
  }

  const handleCardClick = (slug: string) => {
    if (onArticleClick) {
      onArticleClick(slug);
    } else if (onNavigate) {
      onNavigate(`/guia/${slug}`);
    } else if (typeof window !== 'undefined') {
      window.location.assign(`/guia/${slug}`);
    }
  };

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate('/guia');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/guia');
    }
  };

  return (
    <section className={`py-12 border-t border-line ${className}`} aria-labelledby="related-articles-title">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Aprofunde seus conhecimentos</span>
            </div>
            <h2 id="related-articles-title" className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group shrink-0 cursor-pointer"
          >
            <span>Ver todos os artigos do guia</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((article) => {
            const colorScheme =
              CATEGORY_COLOR_MAP[article.categoryKey] || {
                badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                text: 'text-indigo-600 dark:text-indigo-400',
                bg: 'bg-indigo-500',
              };

            return (
              <article
                key={article.id}
                onClick={() => handleCardClick(article.slug)}
                className="group relative flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Top Accent Line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Metadata badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${colorScheme.badge}`}
                  >
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTimeMinutes} min</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 mb-3">
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-muted line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {article.summary}
                </p>

                {/* Tags snippet */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center text-[11px] text-muted bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer: Author & Read CTA */}
                <div className="pt-4 border-t border-line flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {article.author.avatar || article.author.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-ink truncate">
                        {article.author.name}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Ler artigo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
