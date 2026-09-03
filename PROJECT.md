# Project: Tarefus Pricing & Guide Public Strategy

## Architecture
- **Framework & Runtime**: React 19.2 + TypeScript 6 + Vite 8 + Tailwind CSS v4.
- **Routing & State**: Zero-dependency client-side routing synchronized with HTML5 History API (`window.location.pathname`, `pushState`, `popstate`), integrated into `TaskContext` and `App.tsx`.
- **Theme System**: Tailwind v4 with CSS native tokens (`var(--app)`, `var(--raised)`, `var(--text)`, `var(--line)`, etc.) supporting both Light Mode and Dark Mode (`.dark` class on `document.documentElement`).
- **Data Layer**: Strongly-typed static TypeScript modules (`src/data/pricingData.ts` and `src/data/guideArticles.ts`) delivering zero-latency, SEO-friendly, and offline-capable public content.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Data Types & Interfaces | TypeScript definitions for plans, comparisons, FAQ, categories, 12 articles, TOC, and calculator | M1 | `02-pricing-and-guide-plan.md` |
| 2 | Pricing Data & Formulas | Constants for 3 plans (Equipe, Crescimento ⭐, Escala), comparison table, FAQ, and savings calculator math | M1 | `02-pricing-and-guide-plan.md` §3, §4, §5 |
| 3 | 12 Strategic Articles Catalog | Full 12 articles with rich content sections, practical tip callouts, TOC anchors, tags, authors, CTAs | M1 | `02-pricing-and-guide-plan.md` §8 |
| 4 | Pricing Header & Billing Toggle | Interactive Monthly vs Annual billing switch (~20-22% savings, 12x installments notice) | M2 | `02-pricing-and-guide-plan.md` §3.1 |
| 5 | 3 Plan Pricing Cards | Responsive tier cards with R$ pricing, seat limits, AI quotas, highlight on Crescimento, and 14-day trial CTAs | M2 | `02-pricing-and-guide-plan.md` §3.1 |
| 6 | Interactive Savings Calculator | Dynamic slider (3 to 35+ seats), USD/IOF competitor benchmark comparison, real-time savings display | M2 | `02-pricing-and-guide-plan.md` §3.2 |
| 7 | Feature Comparison Table | Detailed category matrix (Users, Boards, AI Gemini, Security, Support) with expandable accordion | M2 | `02-pricing-and-guide-plan.md` §4 |
| 8 | Pricing FAQ Accordion | 7 interactive objection-handling Q&As with smooth expand/collapse transitions | M2 | `02-pricing-and-guide-plan.md` §5.2 |
| 9 | Guide Landing Hub | Hero with instant live search, 5 category filter pills, featured article card, responsive article grid | M3 | `02-pricing-and-guide-plan.md` §7.1 |
| 10 | Guide Article Reader | Full article page with breadcrumb, estimated read time, floating TOC, rich formatting, tip callouts | M3 | `02-pricing-and-guide-plan.md` §7.2 |
| 11 | Related Articles & CTAs | 3 related article recommendations by category + inline & footer 14-day trial conversion banners | M3 | `02-pricing-and-guide-plan.md` §7.2, §7.4 |
| 12 | Public Layout & Navigation | `PublicNavbar` (brand, links, theme switch, trial CTA) and `PublicFooter` (brand, compliance, links) | M4 | `02-pricing-and-guide-plan.md` §6 |
| 13 | App & Help Center Links | Navigation links to `/planos` and `/guia` in app Navbar, user menu, and HelpCenterModal | M4 | `ORIGINAL_REQUEST.md` §R4 |
| 14 | Responsive UI & Theme Engine | 100% Mobile/Tablet/Desktop responsiveness and flawless Dark/Light mode styling across all views | M4 | `ORIGINAL_REQUEST.md` §R4 |
| 15 | E2E & Adversarial Verification | 100% passing test suite across Tiers 1-5, adversarial fuzzing, build & typecheck validation | M5 | `TEST_INFRA.md` |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Data Models & 12 Articles Catalog | `src/types/pricing.ts`, `src/types/guide.ts`, `src/data/pricingData.ts`, `src/data/guideArticles.ts`, unit tests | none | DONE |
| M2 | Pricing Page & Calculator UI | `src/components/pricing/*` (PricingPage, PricingCard, SavingsCalculator, FeatureComparisonTable, PricingFAQ) | M1 | DONE |
| M3 | Guide Landing & Article Reader UI | `src/components/guide/*` (GuideLandingPage, GuideArticlePage, TableOfContents, RelatedArticles) | M1 | DONE |
| M4 | Navigation, Routing & Theme Integration | `PublicNavbar`, `PublicFooter`, `App.tsx`, `Navbar.tsx`, `HelpCenterModal.tsx`, URL history routing | M2, M3 | DONE |
| M5 | E2E Test Pass & Adversarial Hardening | Full 5-tier test validation, fuzzing, forensic audit, build verification | M1, M2, M3, M4 | DONE |

## Code Layout
```
src/
├── types/
│   ├── index.ts               # Core app types & routing definitions
│   ├── pricing.ts             # Pricing and calculator types
│   └── guide.ts               # Guide articles, categories and TOC types
├── data/
│   ├── pricingData.ts         # Plans, feature comparisons, FAQs, calculator engine
│   └── guideArticles.ts       # 12 comprehensive strategic articles & search utilities
├── components/
│   ├── public/
│   │   ├── PublicNavbar.tsx   # Public header with branding, theme switcher and trial CTAs
│   │   └── PublicFooter.tsx   # Public footer with links, security badges and compliance info
│   ├── pricing/
│   │   ├── PricingPage.tsx    # Main Pricing landing page
│   │   ├── PricingCard.tsx    # Tier card component with monthly/annual switch
│   │   ├── SavingsCalculator.tsx # Interactive seat slider & savings visualizer
│   │   ├── FeatureComparisonTable.tsx # Full feature matrix breakdown
│   │   └── PricingFAQ.tsx     # Accordion FAQ component
│   ├── guide/
│   │   ├── GuideLandingPage.tsx  # Hub with instant search, filters, featured & grid
│   │   ├── GuideArticlePage.tsx  # Full reader with breadcrumbs, TOC, rich body, CTAs
│   │   ├── TableOfContents.tsx   # Floating/collapsible TOC navigation
│   │   └── RelatedArticles.tsx   # Recommended articles widget
│   ├── help/
│   │   └── HelpCenterModal.tsx   # Integrated with direct links to /planos and /guia
│   ├── Navbar.tsx             # Integrated with public page navigation links
│   └── ...
├── context/
│   └── TaskContext.tsx        # Active route / navigation state integration
├── App.tsx                    # Client-side URL router & view orchestrator
└── index.css                  # Tailwind CSS v4 design tokens and utilities
tests/
├── pricing_unit.test.ts       # Unit tests for pricing calculations and limits (15 tests)
├── guide_catalog.test.ts      # Catalog integrity tests for all 12 articles and search (16 tests)
├── routing_theme_integration.test.ts # Routing, theme switching, and layout tests (10 tests)
├── adversarial_e2e_suite.test.ts # Fuzzing, boundary checks, and error resilience tests (9 tests)
├── pricing_components.test.ts # Component UI tests (49 tests)
└── guide_components_ui.test.ts # Guide component rendering tests (10 tests)
```
