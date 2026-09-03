import React, { useState, useMemo } from 'react';
import type { GuideArticle } from '../../types/guide';
import { getArticleBySlug, GUIDE_ARTICLES } from '../../data/guideArticles';
import { TableOfContents } from './TableOfContents';
import { RelatedArticles } from './RelatedArticles';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Check,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Info,
  Quote,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  ChevronRight,
  MessageCircle,
  Zap,
  FileQuestion,
} from 'lucide-react';

export interface GuideArticlePageProps {
  slug?: string;
  article?: GuideArticle;
  onNavigate?: (path: string) => void;
  onArticleClick?: (slug: string) => void;
  onBack?: () => void;
  onStartTrial?: () => void;
  onNavigatePricing?: () => void;
  className?: string;
}

const CATEGORY_COLOR_MAP: Record<
  string,
  { badge: string; text: string; bg: string; border: string }
> = {
  'gestao-tarefas-prazos': {
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500',
    border: 'border-blue-500/30',
  },
  'lideranca-delegacao': {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/30',
  },
  'ia-produtividade': {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/30',
  },
  'metodos-ageis': {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
  },
  'rotinas-equipe': {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500/30',
  },
};

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${day} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  } catch {
    return dateStr;
  }
}

export const GuideArticlePage: React.FC<GuideArticlePageProps> = ({
  slug = '',
  article: propArticle,
  onNavigate,
  onArticleClick,
  onBack,
  onStartTrial,
  onNavigatePricing,
  className = '',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Resolve article data from prop or slug
  const article = useMemo(() => {
    if (propArticle) return propArticle;
    if (slug) return getArticleBySlug(slug);
    return undefined;
  }, [propArticle, slug]);

  const handleBackToGuide = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('/guia');
    } else if (typeof window !== 'undefined') {
      window.location.assign('/guia');
    }
  };

  const handleCategoryClick = () => {
    if (onNavigate && article) {
      onNavigate(`/guia?category=${article.categoryKey}`);
    } else if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.location.assign('/guia');
    }
  };

  const handleShareCopy = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== 'undefined' && article) {
      const text = encodeURIComponent(
        `Confira este artigo do Tarefus: "${article.title}"\n${window.location.href}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTrialClick = () => {
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

  // ---------------------------------------------------------------------------
  // 404 / ARTICLE NOT FOUND FALLBACK VIEW
  // ---------------------------------------------------------------------------
  if (!article) {
    const popularArticles = GUIDE_ARTICLES.slice(0, 3);

    return (
      <div className={`min-h-screen bg-app text-ink py-16 px-4 font-sans ${className}`}>
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBackToGuide}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Guia</span>
          </button>

          {/* 404 Container */}
          <div className="bg-surface border border-line rounded-3xl p-8 sm:p-12 text-center shadow-lg mb-12">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-500/20 shadow-xs">
              <FileQuestion className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-3">
              Artigo Não Encontrado
            </h1>

            <p className="text-base text-muted max-w-md mx-auto mb-8 leading-relaxed">
              O artigo que você procurava não existe ou foi movido. Explore outros artigos
              práticos em nossa Central de Conhecimento.
            </p>

            <button
              type="button"
              onClick={handleBackToGuide}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Todos os Artigos do Guia</span>
            </button>
          </div>

          {/* Suggested Articles */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-ink mb-6">Artigos Recomendados:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularArticles.map((sug) => (
                <article
                  key={sug.id}
                  onClick={() => {
                    if (onArticleClick) onArticleClick(sug.slug);
                    else if (onNavigate) onNavigate(`/guia/${sug.slug}`);
                  }}
                  className="bg-surface border border-line rounded-2xl p-5 shadow-xs hover:border-indigo-500/40 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 block">
                    {sug.category}
                  </span>
                  <h3 className="text-sm font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 mb-2">
                    {sug.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2">{sug.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ARTICLE FOUND: RENDER FULL READER VIEW
  // ---------------------------------------------------------------------------
  const colorScheme =
    CATEGORY_COLOR_MAP[article.categoryKey] || {
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500',
      border: 'border-indigo-500/30',
    };

  return (
    <div className={`min-h-screen bg-app text-ink font-sans ${className}`}>
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & BACK NAVIGATION */}
      {/* ========================================================================= */}
      <div className="border-b border-line bg-surface/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-muted overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => (onNavigate ? onNavigate('/') : (window.location.assign('/')))}
              className="hover:text-ink transition-colors shrink-0 cursor-pointer"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-subtle shrink-0" />
            <button
              type="button"
              onClick={handleBackToGuide}
              className="hover:text-ink transition-colors shrink-0 cursor-pointer"
            >
              Guia
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-subtle shrink-0" />
            <button
              type="button"
              onClick={handleCategoryClick}
              className="hover:text-ink transition-colors truncate max-w-[140px] sm:max-w-[200px] shrink-0 cursor-pointer"
            >
              {article.category}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-subtle shrink-0 hidden md:inline-block" />
            <span className="text-ink font-medium truncate max-w-[220px] hidden md:inline-block">
              {article.title}
            </span>
          </nav>

          {/* Quick Back Button */}
          <button
            type="button"
            onClick={handleBackToGuide}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Guia</span>
            <span className="sm:hidden">Voltar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ARTICLE HEADER SECTION */}
      {/* ========================================================================= */}
      <header className="pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-line bg-gradient-to-b from-surface via-app to-app">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Category & Read Time Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleCategoryClick}
              className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border transition-transform hover:scale-105 cursor-pointer ${colorScheme.badge}`}
            >
              {article.category}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium bg-slate-100 dark:bg-white/[0.04] px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTimeMinutes} min de leitura</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight leading-[1.2] mb-6">
            {article.title}
          </h1>

          {/* Article Subtitle / Lead */}
          <p className="text-base sm:text-lg md:text-xl text-muted leading-relaxed mb-8">
            {article.subtitle}
          </p>

          {/* Author Bar & Social Sharing */}
          <div className="pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Author details */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {article.author.avatar || article.author.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-ink">
                  {article.author.name}
                </div>
                <div className="text-xs text-muted">
                  {article.author.role}
                </div>
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={handleShareCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-surface border border-line text-muted hover:text-ink hover:border-line-strong px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Copiar link do artigo"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN ARTICLE LAYOUT: 2 COLUMNS (CONTENT + FLOATING TOC) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          {/* MAIN ARTICLE BODY (8 Columns) */}
          <main className="lg:col-span-8 flex flex-col">
            {/* Mobile TOC Drawer */}
            <TableOfContents
              items={article.tableOfContents}
              variant="mobile"
              className="lg:hidden"
            />

            {/* Summary Lead Box */}
            <div className="bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 mb-10 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Bookmark className="w-4 h-4" />
                <span>Resumo Executivo</span>
              </div>
              <p className="text-sm sm:text-base text-ink/90 leading-relaxed font-normal">
                {article.summary}
              </p>
            </div>

            {/* Render Article Sections */}
            <div className="space-y-12 text-ink">
              {article.sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 space-y-5"
                >
                  {/* Section Heading */}
                  <div className="group flex items-center justify-between pb-3 border-b border-line/70">
                    <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight leading-snug">
                      {section.title}
                    </h2>
                    <a
                      href={`#${section.id}`}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-indigo-600 dark:hover:text-indigo-400 p-1 transition-opacity text-xs font-mono"
                      title="Link permanente para esta seção"
                    >
                      #
                    </a>
                  </div>

                  {/* Section Paragraphs */}
                  <div className="space-y-4 text-base sm:text-lg text-ink/85 leading-relaxed font-normal">
                    {section.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Subsections if any */}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="space-y-6 pt-2 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                      {section.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="space-y-3">
                          <h3 className="text-lg font-bold text-ink">
                            {sub.title}
                          </h3>
                          {sub.content.map((subP, subPIdx) => (
                            <p
                              key={subPIdx}
                              className="text-base text-ink/80 leading-relaxed"
                            >
                              {subP}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Practical Tip Callout (💡 Dica Prática Tarefus) */}
                  {section.tips && section.tips.length > 0 && (
                    <div className="my-6 p-5 sm:p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-l-4 border-indigo-600 dark:border-indigo-500 rounded-r-2xl shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <span>💡 Dica Prática Tarefus</span>
                      </div>
                      <div className="space-y-2 text-sm sm:text-base text-ink/90 leading-relaxed">
                        {section.tips.map((tip, tipIdx) => (
                          <p key={tipIdx}>{tip}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Custom Callout */}
                  {section.callout && (
                    <div
                      className={`my-6 p-5 sm:p-6 rounded-2xl border shadow-xs flex items-start gap-4 ${
                        section.callout.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                          : section.callout.type === 'quote'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-900 dark:text-purple-200 italic'
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {section.callout.type === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                        {section.callout.type === 'quote' && (
                          <Quote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                        {(section.callout.type === 'info' || section.callout.type === 'tip') && (
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        {section.callout.title && (
                          <h4 className="font-bold text-sm sm:text-base">
                            {section.callout.title}
                          </h4>
                        )}
                        <p className="text-sm leading-relaxed">
                          {section.callout.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mid-Article Inline Contextual CTA (e.g. after Section 2) */}
                  {idx === 1 && (
                    <div className="my-8 p-6 bg-surface border border-line rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Aplique isso no seu time
                          </div>
                          <div className="text-sm sm:text-base font-bold text-ink">
                            Crie fluxos de trabalho visuais no Tarefus em menos de 3 minutos.
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTrialClick}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all shrink-0 cursor-pointer"
                      >
                        Testar 14 Dias Grátis
                      </button>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Tags Cloud */}
            <div className="mt-12 pt-6 border-t border-line">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Tags do Artigo:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-xs font-mono text-muted bg-surface border border-line px-3 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio Box */}
            <div className="mt-10 p-6 sm:p-8 bg-surface border border-line rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {article.author.avatar || article.author.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Sobre o Autor
                  </div>
                  <h3 className="text-lg font-bold text-ink">
                    {article.author.name}
                  </h3>
                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {article.author.role}
                  </div>
                  {article.author.bio && (
                    <p className="text-sm text-muted leading-relaxed pt-1">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contextual CTA Card from Article Definition */}
            {article.cta && (
              <div className="mt-10 p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-indigo-500/30 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{article.cta.badge || 'Transforme sua Gestão'}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {article.cta.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                    {article.cta.description}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTrialClick}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>{article.cta.buttonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* DESKTOP STICKY SIDEBAR (4 Columns) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8">
            {/* Sticky Table of Contents */}
            <TableOfContents
              items={article.tableOfContents}
              variant="desktop"
            />

            {/* Quick Product Promo Card */}
            <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs sticky top-[480px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>

              <h4 className="text-base font-bold text-ink mb-2">
                Experimente o Tarefus
              </h4>

              <p className="text-xs text-muted leading-relaxed mb-4">
                Crie quadros, organize tarefas da equipe e dite demandas por voz ou IA.
                Teste completo por 14 dias sem cartão.
              </p>

              <button
                type="button"
                onClick={handleTrialClick}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sem cartão
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  14 dias grátis
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* ========================================================================= */}
        {/* 4. RELATED ARTICLES RECOMMENDATION SECTION */}
        {/* ========================================================================= */}
        <div className="mt-16">
          <RelatedArticles
            currentSlug={article.slug}
            category={article.category}
            categoryKey={article.categoryKey}
            onArticleClick={onArticleClick}
            onNavigate={onNavigate}
          />
        </div>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CONVERSION TRIAL BANNER */}
        {/* ========================================================================= */}
        <section className="mt-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-indigo-500/30">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chega de esquecer prazos e demandas soltas</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                Comece a organizar sua equipe hoje mesmo
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                Junte-se a centenas de empresas brasileiras que escalaram suas entregas
                com o Tarefus. Teste grátis por 14 dias sem compromisso.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  14 dias de teste grátis
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Suporte em português
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleTrialClick}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Iniciar Teste Gratuito</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handlePricingClick}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
              >
                Ver Tabela de Planos
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
