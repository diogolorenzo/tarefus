import React, { useEffect } from 'react';
import { SiteHeader } from './sections/SiteHeader';
import { HeroSection } from './sections/HeroSection';
import { FactStrip } from './sections/FactStrip';
import { AiDemoSection } from './sections/AiDemoSection';
import { StepsSection } from './sections/StepsSection';
import { FeatureShowcase } from './sections/FeatureShowcase';
import { RolesSection } from './sections/RolesSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { TrustSection } from './sections/TrustSection';
import { TrialSection } from './sections/TrialSection';
import { FaqSection } from './sections/FaqSection';
import { FinalCtaSection } from './sections/FinalCtaSection';
import { SiteFooter } from './sections/SiteFooter';
import { StickyMobileCta } from './sections/StickyMobileCta';
import { KanbanMock, MyTasksMock, DeadlinesMock } from './mock/ProductMocks';
import { trackHomeView } from '../analytics/track';
import { home } from '../content/home';

/**
 * Homepage pública do Tarefus.
 * Ordem das seções conforme docs/commercial/01-homepage-plan.md, seção 3.1.
 */
export const HomePage: React.FC = () => {
  useEffect(() => {
    trackHomeView();
  }, []);

  return (
    <div className="min-h-screen bg-app font-sans text-ink antialiased">
      <a
        href="#hero"
        className="sr-only rounded-lg bg-indigo-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <SiteHeader />

      <main>
        <HeroSection />
        <FactStrip />
        <AiDemoSection />
        <StepsSection />

        <FeatureShowcase
          id="dia-a-dia"
          eyebrow={home.dayToDay.eyebrow}
          title={home.dayToDay.title}
          bullets={home.dayToDay.bullets}
          cta={home.dayToDay.cta}
          visualSide="right"
          visual={
            <div className="space-y-4">
              <KanbanMock />
              <div className="mx-auto max-w-sm lg:ml-auto lg:mr-0">
                <MyTasksMock />
              </div>
            </div>
          }
        />

        <FeatureShowcase
          id="prazos"
          surface="sunken"
          eyebrow={home.deadlines.eyebrow}
          title={home.deadlines.title}
          bullets={home.deadlines.bullets}
          visualSide="left"
          visual={<DeadlinesMock />}
        />

        <RolesSection />
        <ComparisonSection />
        <TrustSection />
        <TrialSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <SiteFooter />
      <StickyMobileCta />
    </div>
  );
};
