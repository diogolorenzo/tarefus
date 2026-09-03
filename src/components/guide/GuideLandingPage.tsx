import React, { useEffect, useMemo, useState } from 'react';
import type { GuideCategoryKey } from '../../types/guide';
import {
  GUIDE_CATEGORIES,
  GUIDE_ARTICLES,
  searchGuideArticles,
  getFeaturedArticle,
  getAllTags,
} from '../../data/guideArticles';
import {
  Search,
  X,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Users,
  LayoutGrid,
  MessageSquare,
  Star,
  CheckCircle2,
  Tag as TagIcon,
  RotateCcw,
  Zap,
} from 'lucide-react';

export interface GuideLandingPageProps {
  onArticleClick?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onStartTrial?: () => void;
  onNavigatePricing?: () => void;
  initialCategory?: GuideCategoryKey | 'all';
  initialQuery?: string;
  currentPath?: string;
  className?: string;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  'gestao-tarefas-prazos': CheckSquare,
  'lideranca-delegacao': Users,
  'ia-produtividade': Sparkles,
  'metodos-ageis': LayoutGrid,
  'rotinas-equipe': MessageSquare,
};

const CATEGORY_COLOR_MAP: Record<
  string,
  {
    badge: string;
    text: string;
    bg: string;
    border: string;
    active: string;
  }
> = {
  'gestao-tarefas-prazos': {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500',
    border: 'border-blue-500/30',
    active: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  },
  'lideranca-delegacao': {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    active: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
  },
  'ia-produtividade': {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/30',
    active: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white',
  },
  'metodos-ageis': {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    active: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white',
  },
  'rotinas-equipe': {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500/30',
    active: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white',
  },
};

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    return `${day} ${months[parseInt(month, 10) - 1]}, ${year}`;
  } catch {
    return dateStr;
  }
}

export const GuideLandingPage: React.FC<GuideLandingPageProps> = ({
  onArticleClick,
  onNavigate,
  onStartTrial,
  onNavigatePricing,
  initialCategory = 'all',
  initialQuery = '',
  currentPath = '',
  className = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GuideCategoryKey | 'all'>(
    initialCategory
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(currentPath.split('?')[1] || '');
    const category = params.get('category');
    const query = params.get('q');
    const validCategory = GUIDE_CATEGORIES.some((item) => item.key === category)
      ? (category as GuideCategoryKey)
      : 'all';
    setSelectedCategory(validCategory);
    setSelectedTag(null);
    setSearchQuery(query || '');
  }, [currentPath]);

  const featuredArticle = useMemo(() => getFeaturedArticle(), []);
  const allPopularTags = useMemo(() => getAllTags().slice(0, 10), []);

  // Filter articles based on search query, category, and tag
  const filteredArticles = useMemo(() => {
    return searchGuideArticles(
      searchQuery,
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedTag || undefined
    );
  }, [searchQuery, selectedCategory, selectedTag]);

  // Compute category count statistics
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: GUIDE_ARTICLES.length,
    };
    GUIDE_CATEGORIES.forEach((cat) => {
      counts[cat.key] = GUIDE_ARTICLES.filter((a) => a.categoryKey === cat.key).length;
    });
    return counts;
  }, []);

  const handleArticleSelect = (slug: string) => {
    if (onArticleClick) {
      onArticleClick(slug);
    } else if (onNavigate) {
      onNavigate(`/guia/${slug}`);
    } else if (typeof window !== 'undefined') {
      window.location.assign(`/guia/${slug}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
  };

  const handleStartTrialClick = () => {
    if (onStartTrial) {
      onStartTrial();
    } else if (onNavigate) {
      onNavigate('/planos');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/planos');
    }
  };

  const handlePricingClick = () => {
    if (onNavigatePricing) {
      onNavigatePricing();
    } else if (onNavigate) {
      onNavigate('/planos');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/planos');
    }
  };

  const showFeaturedSection =
    selectedCategory === 'all' &&
    !searchQuery.trim() &&
    !selectedTag &&
    featuredArticle !== undefined;

  // If showing featured card, exclude it from main grid to prevent duplicate on initial landing view
  const gridArticles = showFeaturedSection
    ? filteredArticles.filter((a) => a.id !== featuredArticle.id)
    : filteredArticles;

  return (
    <div className={`min-h-screen bg-app text-ink font-sans ${className}`}>
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & LIVE SEARCH */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-line bg-gradient-to-b from-surface via-app to-app">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shadow-xs mb-6 animate-fade-in">
            <BookOpen className="w-4 h-4" />
            <span>Central de Conhecimento & Boas Práticas Tarefus</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-ink tracking-tight leading-[1.15] mb-6">
            Estratégias Práticas para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300">
              Organizar Equipes & Entregar Prazos
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            Guias completos, métodos ágeis sem burocracia, técnicas de delegação e
            automações com IA projetados para a realidade de gestores e pequenas empresas brasileiras.
          </p>

          {/* Instant Live Search Input */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              <div className="absolute left-4.5 text-muted pointer-events-none group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                <Search className="w-5 h-5" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tema, dúvida, método (ex: Kanban, delegação, IA, WhatsApp)..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-surface border border-line focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 shadow-md text-ink placeholder:text-muted/70 text-sm sm:text-base transition-all outline-none"
                aria-label="Buscar artigos do guia"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1.5 rounded-lg text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Status Bar */}
            <div className="flex items-center justify-between text-xs text-muted mt-3 px-2">
              <span>
                {filteredArticles.length === 1
                  ? '1 artigo encontrado'
                  : `${filteredArticles.length} artigos disponíveis`}
              </span>
              <span className="hidden sm:inline-block">
                Dica: A busca funciona mesmo sem acentos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CATEGORY PILLS & POPULAR TAGS FILTER */}
      {/* ========================================================================= */}
      <section className="py-6 border-b border-line bg-surface/50 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Category Filter Pills (Horizontal Scrolling on mobile) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
            {/* All Category Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-indigo-500/20'
                  : 'bg-surface border border-line text-muted hover:text-ink hover:border-line-strong'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Todos os Artigos</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-white/[0.06] text-muted'
                }`}
              >
                {categoryCounts.all}
              </span>
            </button>

            {/* Individual Category Buttons */}
            {GUIDE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICON_MAP[category.key] || BookOpen;
              const isSelected = selectedCategory === category.key;
              const colorConfig = CATEGORY_COLOR_MAP[category.key];

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.key);
                    setSelectedTag(null);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer shadow-xs ${
                    isSelected
                      ? `${colorConfig.active} shadow-md`
                      : 'bg-surface border border-line text-muted hover:text-ink hover:border-line-strong'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.title}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-white/[0.06] text-muted'
                    }`}
                  >
                    {categoryCounts[category.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Popular Tag Filters Carousel */}
          <div className="mt-3 pt-3 border-t border-line/60 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-subtle font-medium shrink-0 flex items-center gap-1 mr-1">
              <TagIcon className="w-3 h-3" />
              Tags populares:
            </span>

            {allPopularTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-semibold'
                      : 'bg-slate-100 dark:bg-white/[0.04] text-muted hover:text-ink hover:bg-slate-200/60 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  #{tag}
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}

            {(searchQuery || selectedCategory !== 'all' || selectedTag) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 ml-auto cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: FEATURED CARD & ARTICLE GRID */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* SHOWCASE FEATURED ARTICLE (When on "All" with no active query) */}
        {showFeaturedSection && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Artigo em Destaque
              </span>
            </div>

            <div
              onClick={() => handleArticleSelect(featuredArticle.slug)}
              className="group relative bg-surface border-2 border-indigo-500/30 hover:border-indigo-500/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Decorative Gradient Background */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left content: Category, title, summary, author */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {featuredArticle.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredArticle.readTimeMinutes} min de leitura</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(featuredArticle.publishedAt)}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight mb-4">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-base sm:text-lg text-muted line-clamp-3 mb-6 leading-relaxed">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  {/* Author and Read CTA */}
                  <div className="pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-xs">
                        {featuredArticle.author.avatar ||
                          featuredArticle.author.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink">
                          {featuredArticle.author.name}
                        </div>
                        <div className="text-xs text-muted">
                          {featuredArticle.author.role}
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Ler artigo completo</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Right side visual callout */}
                <div className="lg:col-span-4 bg-indigo-500/5 dark:bg-white/[0.02] border border-indigo-500/10 rounded-2xl p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-xs">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-ink mb-2">
                      Principais Tópicos Abordados:
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-muted">
                      {featuredArticle.tableOfContents.slice(0, 4).map((toc) => (
                        <li key={toc.id} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{toc.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-line/60 flex flex-wrap gap-1.5">
                    {featuredArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono text-muted bg-surface px-2 py-0.5 rounded-md border border-line"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION HEADER FOR GRID */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-line">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">
              {searchQuery || selectedCategory !== 'all' || selectedTag
                ? 'Resultados da Busca'
                : 'Todos os Artigos do Guia'}
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              {gridArticles.length === 1
                ? '1 artigo listado'
                : `${gridArticles.length} artigos listados`}
              {selectedCategory !== 'all' && ` na categoria "${selectedCategory}"`}
              {selectedTag && ` com a tag "#${selectedTag}"`}
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedTag) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Ver catálogo completo
            </button>
          )}
        </div>

        {/* RESPONSIVE GRID OF ARTICLES */}
        {gridArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gridArticles.map((article) => {
              const colorConfig =
                CATEGORY_COLOR_MAP[article.categoryKey] || {
                  badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                  text: 'text-indigo-600 dark:text-indigo-400',
                  bg: 'bg-indigo-500',
                  border: 'border-slate-200',
                  active: 'bg-indigo-600 text-white',
                };

              return (
                <article
                  key={article.id}
                  onClick={() => handleArticleSelect(article.slug)}
                  className="group relative flex flex-col bg-surface border border-line rounded-2xl p-6 shadow-xs hover:shadow-lg hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Subtle top indicator hover line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Header badges: Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${colorConfig.badge}`}
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

                  {/* Tags */}
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
                        {article.author.avatar ||
                          article.author.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-ink truncate">
                          {article.author.name}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0">
                      Ler artigo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* EMPTY SEARCH STATE */
          <div className="text-center py-16 px-4 bg-surface border border-line rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-500/20 shadow-xs">
              <Search className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-ink mb-2">
              Nenhum artigo encontrado
            </h3>

            <p className="text-sm text-muted max-w-md mx-auto mb-6">
              Não encontramos nenhum artigo para{' '}
              <strong className="text-ink">"{searchQuery || selectedTag}"</strong>. Tente
              buscar por termos mais genéricos como "tarefas", "equipe", "kanban" ou
              redefina seus filtros.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar filtros e ver todos os artigos
            </button>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM CONVERSION BANNER */}
      {/* ========================================================================= */}
      <section className="border-t border-line bg-gradient-to-b from-app via-surface to-surface py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-indigo-500/30">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-4">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Coloque a teoria em prática agora</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                  Pronto para transformar a produtividade da sua equipe?
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                  Experimente o Tarefus por 14 dias grátis. Quadros Kanban visuais, criação
                  de demandas por IA e relatórios em tempo real sem cartão de crédito.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>14 dias grátis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Configuração em 3 minutos</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleStartTrialClick}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Começar Teste Grátis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handlePricingClick}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                >
                  Ver Planos & Preços
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
