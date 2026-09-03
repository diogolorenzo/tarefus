/**
 * Camada única de analytics da homepage.
 * Referência: docs/commercial/01-homepage-plan.md, seção 8.
 *
 * Os componentes chamam `track`, nunca o fornecedor. Hoje a implementação apenas
 * registra no console em desenvolvimento; trocar por um provedor sem cookies
 * (decisão D9) é alterar somente este arquivo.
 */

import type { SectionId } from '../content/home';

export type AnalyticsEvent =
  | {
      name: 'home_view';
      props: {
        referrer: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        device: 'mobile' | 'tablet' | 'desktop';
      };
    }
  | { name: 'section_view'; props: { sectionId: SectionId } }
  | {
      name: 'cta_click';
      props: { ctaId: string; sectionId: SectionId | 'nav' | 'footer'; label: string; destination: string };
    }
  | { name: 'ai_demo_run'; props: { exampleId: string } }
  | { name: 'faq_open'; props: { questionId: string } }
  | { name: 'tips_scroll'; props: { direction: 'prev' | 'next' } }
  | { name: 'tip_article_click'; props: { tipId: string; slug: string } }
  | { name: 'pricing_interval_change'; props: { interval: 'monthly' | 'annual' } }
  | { name: 'scroll_depth'; props: { percent: 25 | 50 | 75 | 100 } };

export function track(event: AnalyticsEvent): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info('[analytics]', event.name, event.props);
  }
}

function getDevice(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/** Dispara `home_view` uma vez, lendo referrer e parâmetros UTM da URL. */
export function trackHomeView(): void {
  const params = new URLSearchParams(window.location.search);
  track({
    name: 'home_view',
    props: {
      referrer: document.referrer || 'direto',
      utmSource: params.get('utm_source') ?? undefined,
      utmMedium: params.get('utm_medium') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
      device: getDevice(),
    },
  });
}
