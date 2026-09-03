import React, { useEffect } from 'react';
import { SiteHeader } from './sections/SiteHeader';
import { HeroSection } from './sections/HeroSection';
import { StatementSection } from './sections/StatementSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { AiDemoSection } from './sections/AiDemoSection';
import { StepsSection } from './sections/StepsSection';
import { FeatureShowcase } from './sections/FeatureShowcase';
import { AccessSection } from './sections/AccessSection';
import { FaqSection } from './sections/FaqSection';
import { ClosingSection } from './sections/ClosingSection';
import { SiteFooter } from './sections/SiteFooter';
import { StickyMobileCta } from './sections/StickyMobileCta';
import { KanbanMock, MyTasksMock, DeadlinesMock } from './mock/ProductMocks';
import { trackHomeView } from '../analytics/track';
import { home } from '../content/home';

/**
 * Homepage pública do Tarefus.
 *
 * A ordem das seções vem de docs/commercial/01-homepage-plan.md, seção 3.1.
 * As doze seções originais viraram nove blocos: os fatos entraram no herói,
 * Papéis e Segurança viraram "Acessos e dados", e Teste e Chamada final fecham
 * juntos.
 *
 * O ritmo é a regra de composição desta página, e ela se lê aqui de cima a
 * baixo — densidade e superfície andam sempre juntas:
 *
 *   air    + raised  → os dois momentos de declaração (Diagnóstico, Fechamento)
 *   normal + app     → os blocos de prova (Demonstração, Dia a dia, Acessos)
 *   dense  + sunken  → os blocos de informação (Comparativo, Passos, Prazos, FAQ)
 *
 * Nenhum bloco repete a densidade do vizinho. É isso que faz a compactação
 * virar ritmo em vez de aperto: o espaço que sai dos blocos densos é o mesmo
 * que sobra para os dois momentos de respiro.
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
        <StatementSection />
        <ComparisonSection />
        <AiDemoSection />
        <StepsSection />

        <FeatureShowcase
          id="dia-a-dia"
          surface="app"
          density="normal"
          eyebrow={home.dayToDay.eyebrow}
          title={home.dayToDay.title}
          bullets={home.dayToDay.bullets}
          cta={home.dayToDay.cta}
          visualSide="right"
          proofLabel="Tarefus · Quadro da área e Minhas Tarefas"
          proofCaption={home.dayToDay.proofCaption}
          visual={
            <div className="space-y-3">
              <KanbanMock bare />
              <div className="rounded-xl border border-line bg-surface p-4">
                <MyTasksMock bare />
              </div>
            </div>
          }
        />

        <FeatureShowcase
          id="prazos"
          surface="sunken"
          density="dense"
          eyebrow={home.deadlines.eyebrow}
          title={home.deadlines.title}
          bullets={home.deadlines.bullets}
          visualSide="left"
          proofLabel="Tarefus · Faixa do dia e notificações"
          proofCaption={home.deadlines.proofCaption}
          visual={<DeadlinesMock />}
        />

        <AccessSection />
        <FaqSection />
        <ClosingSection />
      </main>

      <SiteFooter />
      <StickyMobileCta />
    </div>
  );
};
