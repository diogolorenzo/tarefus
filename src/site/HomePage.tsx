import React, { useEffect } from 'react';
import { SiteHeader } from './sections/SiteHeader';
import { HeroSection } from './sections/HeroSection';
import { StatementSection } from './sections/StatementSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { AiDemoSection } from './sections/AiDemoSection';
import { InsideSection } from './sections/InsideSection';
import { AccessSection } from './sections/AccessSection';
import { TipsCarousel } from './sections/TipsCarousel';
import { FaqSection } from './sections/FaqSection';
import { PricingSection } from './sections/PricingSection';
import { ClosingSection } from './sections/ClosingSection';
import { SiteFooter } from './sections/SiteFooter';
import { StickyMobileCta } from './sections/StickyMobileCta';
import { trackHomeView } from '../analytics/track';

/**
 * Homepage pública do Tarefus.
 *
 * A página inteira em nove blocos, planos incluídos: quem chega aqui entende o
 * produto, vê o preço e decide sem trocar de rota. `/planos` e `/guia`
 * continuam publicados, mas como aprofundamento, não como etapa obrigatória —
 * o que também evita que um visitante baixe o bundle da aplicação só para ver
 * quanto custa.
 *
 * O ritmo é a regra de composição, e ela se lê aqui de cima a baixo —
 * densidade e superfície andam sempre juntas:
 *
 *   air    + raised  → os dois momentos de declaração (Diagnóstico, Fechamento)
 *   normal + app     → os blocos de prova (Demonstração, Por dentro, Acessos, Planos)
 *   dense  + sunken  → os blocos de informação (Comparativo, Dicas, Perguntas)
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
        <InsideSection />
        <AccessSection />
        <TipsCarousel />
        <FaqSection />
        <PricingSection />
        <ClosingSection />
      </main>

      <SiteFooter />
      <StickyMobileCta />
    </div>
  );
};
