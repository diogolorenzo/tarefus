export type GuideCategoryKey =
  | 'gestao-tarefas-prazos'
  | 'lideranca-delegacao'
  | 'ia-produtividade'
  | 'metodos-ageis'
  | 'rotinas-equipe';

export type FunnelStage = 'ToFu' | 'MoFu' | 'BoFu';

export interface GuideCategory {
  key: GuideCategoryKey;
  title: string;
  description: string;
  icon: string;
  color: string;
  popularTags: string[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface GuideAuthor {
  id?: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export interface GuideArticleCta {
  title: string;
  description: string;
  buttonText: string;
  targetUrl: string;
  badge?: string;
}

export interface GuideArticleSubsection {
  id?: string;
  title: string;
  content: string[];
}

export interface GuideArticleSection {
  id: string; // anchor id for TOC
  title: string;
  content: string[]; // rich paragraphs
  tips?: string[]; // practical tip callouts
  subsections?: GuideArticleSubsection[];
  callout?: {
    type: 'tip' | 'warning' | 'info' | 'quote';
    title?: string;
    text: string;
  };
}

export interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  categoryKey: GuideCategoryKey;
  tags: string[];
  readTimeMinutes: number;
  funnelStage: FunnelStage;
  targetAudience: string;
  primaryKeyword: string;
  publishedAt: string;
  updatedAt: string;
  author: GuideAuthor;
  summary: string;
  coverIcon: string;
  tableOfContents: TableOfContentsItem[];
  sections: GuideArticleSection[];
  cta: GuideArticleCta;
  isFeatured?: boolean;
}

export interface GuideFilterParams {
  query?: string;
  categoryKey?: GuideCategoryKey | 'all';
  tag?: string;
}
