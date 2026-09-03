export type PricingPlanId = 'equipe' | 'crescimento' | 'escala';

export type BillingInterval = 'monthly' | 'annual';

export interface PricingPlan {
  id: PricingPlanId;
  name: string;
  badge?: string;
  isHighlighted?: boolean;
  tagline: string;
  description: string;
  priceMonthly: number; // 69, 139, 269
  priceAnnualMonthly: number; // 55, 109, 215
  priceAnnualPix: number; // 590, 1180, 2290
  priceAnnualInstallmentTotal: number; // 660, 1308, 2580
  annualSavingsPercentage: number; // 20, 21, 22
  annualSavingsMonthsDescription: string; // "2 meses grátis", etc.
  maxMembers: number; // 5, 15, 35
  maxBoards: number | 'unlimited'; // 5, 20, 'unlimited'
  aiMonthlyCreations: number; // 100, 400, 1200
  auditLogDays: number | 'unlimited'; // 30, 180, 'unlimited'
  supportTier: string;
  features: string[];
  ctaText: string;
  ctaSecondary?: boolean;
}

export type FeatureCategoryKey =
  | 'users_team'
  | 'boards_tasks'
  | 'ai_gemini'
  | 'security_governance'
  | 'support_training';

export type FeatureComparisonValue = boolean | string | number;

export interface FeatureComparisonRow {
  name: string;
  tooltip?: string;
  equipe: FeatureComparisonValue;
  crescimento: FeatureComparisonValue;
  escala: FeatureComparisonValue;
}

export interface FeatureComparisonCategory {
  id: FeatureCategoryKey;
  title: string;
  iconName?: string;
  rows: FeatureComparisonRow[];
}

export interface PricingFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface UsdCompetitorBreakdown {
  asanaBrl: number;
  mondayBrl: number;
  trelloBrl: number;
}

export interface SavingsCalculation {
  seats: number;
  planId: PricingPlanId;
  planName: string;
  tarefusMonthly: number;
  tarefusAnnualMonthly: number;
  competitorsMonthly: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercentage: number;
  usdCompetitorBreakdown?: UsdCompetitorBreakdown;
}

export interface PricingTestimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  seats: number;
  avatarColor: string;
}
