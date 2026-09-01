import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PricingCard } from '../src/components/pricing/PricingCard';
import { SavingsCalculator } from '../src/components/pricing/SavingsCalculator';
import { FeatureComparisonTable } from '../src/components/pricing/FeatureComparisonTable';
import { PricingFAQ } from '../src/components/pricing/PricingFAQ';
import { PricingPage } from '../src/components/pricing/PricingPage';
import { PRICING_PLANS, PRICING_FAQS, PRICING_HERO_COPY } from '../src/data/pricingData';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
    console.log('  [PASS] ' + testName);
  } else {
    failCount++;
    console.error('  [FAIL] ' + testName + (detail ? ' (' + detail + ')' : ''));
  }
}

console.log('================================================================');
console.log('  TAREFUS PRICING UI COMPONENTS TEST SUITE');
console.log('================================================================\n');

// 1. PricingCard Component Tests
console.log('--- 1. PricingCard Component Rendering ---');
{
  const cardMonthly = renderToStaticMarkup(
    React.createElement(PricingCard, { plan: PRICING_PLANS[0], billingInterval: 'monthly' })
  );
  assert(cardMonthly.includes('Equipe'), 'PricingCard: Renders Equipe plan name');
  assert(cardMonthly.includes('69'), 'PricingCard: Renders monthly price 69');
  assert(cardMonthly.includes('Até 5 membros'), 'PricingCard: Displays 5 members limit');
  assert(cardMonthly.includes('Até 5 quadros'), 'PricingCard: Displays 5 quadros limit');
  assert(cardMonthly.includes('14 dias de teste grátis'), 'PricingCard: Displays trial guarantee');

  const cardAnnual = renderToStaticMarkup(
    React.createElement(PricingCard, { plan: PRICING_PLANS[1], billingInterval: 'annual' })
  );
  assert(cardAnnual.includes('Crescimento'), 'PricingCard: Renders Crescimento plan name');
  assert(cardAnnual.includes('MAIS ESCOLHIDO PELAS PMEs'), 'PricingCard: Displays highlight badge');
  assert(cardAnnual.includes('109'), 'PricingCard: Displays annual monthly price 109');
  assert(cardAnnual.includes('12x de R$ 109'), 'PricingCard: Displays 12x installment info');
  assert(cardAnnual.includes('PIX'), 'PricingCard: Displays PIX cash discount');
}

// 2. SavingsCalculator Component Tests
console.log('\n--- 2. SavingsCalculator Component Rendering ---');
{
  const calcHtml = renderToStaticMarkup(
    React.createElement(SavingsCalculator, { billingInterval: 'annual' })
  );
  assert(calcHtml.includes('SIMULADOR DE ECONOMIA REAL'), 'SavingsCalculator: Displays header badge');
  assert(calcHtml.includes('Pessoas na sua equipe'), 'SavingsCalculator: Displays seats selector label');
  assert(calcHtml.includes('Atalhos rápidos'), 'SavingsCalculator: Displays preset pills label');
  assert(calcHtml.includes('Asana Starter'), 'SavingsCalculator: Displays Asana competitor breakdown');
  assert(calcHtml.includes('Monday Std'), 'SavingsCalculator: Displays Monday competitor breakdown');
  assert(calcHtml.includes('Trello Std'), 'SavingsCalculator: Displays Trello competitor breakdown');
  assert(calcHtml.includes('Economia Anual Estimada'), 'SavingsCalculator: Displays annual savings block');
  assert(calcHtml.includes('Sem pegadinha por assento'), 'SavingsCalculator: Displays anti-seat trap copy');
  assert(calcHtml.includes('Zero IOF'), 'SavingsCalculator: Displays zero IOF advantage');
}

// 3. FeatureComparisonTable Component Tests
console.log('\n--- 3. FeatureComparisonTable Component Rendering ---');
{
  const tableHtml = renderToStaticMarkup(
    React.createElement(FeatureComparisonTable, { billingInterval: 'annual' })
  );
  assert(tableHtml.includes('Recursos'), 'FeatureComparisonTable: Displays header title');
  assert(tableHtml.includes('Equipe'), 'FeatureComparisonTable: Displays Equipe column header');
  assert(tableHtml.includes('Crescimento'), 'FeatureComparisonTable: Displays Crescimento column header');
  assert(tableHtml.includes('Escala'), 'FeatureComparisonTable: Displays Escala column header');
  assert(tableHtml.includes('Usuários'), 'FeatureComparisonTable: Displays Users category');
  assert(tableHtml.includes('Quadros'), 'FeatureComparisonTable: Displays Boards category');
  assert(tableHtml.includes('IA Gemini'), 'FeatureComparisonTable: Displays IA category');
  assert(tableHtml.includes('Segurança'), 'FeatureComparisonTable: Displays Security category');
  assert(tableHtml.includes('Suporte'), 'FeatureComparisonTable: Displays Support category');
}

// 4. PricingFAQ Component Tests
console.log('\n--- 4. PricingFAQ Component Rendering ---');
{
  const faqHtml = renderToStaticMarkup(
    React.createElement(PricingFAQ, { items: PRICING_FAQS })
  );
  assert(faqHtml.includes('cartão de crédito'), 'PricingFAQ: Renders credit card trial FAQ');
  assert(faqHtml.includes('membros do plano'), 'PricingFAQ: Renders members limit FAQ');
  assert(faqHtml.includes('por empresa ou por usuário'), 'PricingFAQ: Renders per-company vs per-user FAQ');
  assert(faqHtml.includes('formas de pagamento'), 'PricingFAQ: Renders payment methods FAQ');
  assert(faqHtml.includes('Inteligência Artificial'), 'PricingFAQ: Renders AI Gemini FAQ');
  assert(faqHtml.includes('cancelar a qualquer momento'), 'PricingFAQ: Renders cancellation FAQ');
  assert(faqHtml.includes('Nota Fiscal'), 'PricingFAQ: Renders NFS-e FAQ');
  assert(faqHtml.includes('Falar com Suporte'), 'PricingFAQ: Renders direct contact button');
}

// 5. PricingPage Integration Tests
console.log('\n--- 5. PricingPage Landing Page Integration ---');
{
  const pageHtml = renderToStaticMarkup(
    React.createElement(PricingPage, {})
  );
  assert(pageHtml.includes('Planos simples e previsíveis para a sua'), 'PricingPage: Renders Hero main title');
  assert(pageHtml.includes('empresa inteira'), 'PricingPage: Renders gradient title suffix');
  assert(pageHtml.includes(PRICING_HERO_COPY.monthlyToggleLabel), 'PricingPage: Renders monthly toggle button');
  assert(pageHtml.includes(PRICING_HERO_COPY.annualToggleLabel), 'PricingPage: Renders annual toggle button');
  assert(pageHtml.includes(PRICING_HERO_COPY.annualDiscountBadge), 'PricingPage: Renders annual discount badge');
  assert(pageHtml.includes('Equipe') && pageHtml.includes('Crescimento') && pageHtml.includes('Escala'), 'PricingPage: Contains all 3 pricing cards');
  assert(pageHtml.includes('SIMULADOR DE ECONOMIA REAL'), 'PricingPage: Contains savings calculator section');
  assert(pageHtml.includes('QUEM USA RECOMENDA'), 'PricingPage: Contains customer testimonials section');
  assert(pageHtml.includes('Pequenas empresas brasileiras'), 'PricingPage: Testimonials header');
  assert(pageHtml.includes('MATRIZ COMPLETA DE RECURSOS'), 'PricingPage: Contains feature comparison section');
  assert(pageHtml.includes('DÚVIDAS FREQUENTES'), 'PricingPage: Contains FAQ section');
  assert(pageHtml.includes('Sua equipe organizada em 14 dias ou nada a pagar'), 'PricingPage: Contains final CTA banner');
  assert(pageHtml.includes('Começar Teste de 14 Dias Grátis'), 'PricingPage: Contains final CTA action button');
}

console.log('\n================================================================');
console.log('  PRICING COMPONENTS TEST SUMMARY');
console.log('================================================================');
console.log('Total Tests Run: ' + (passCount + failCount));
console.log('Passed:         ' + passCount + ' / ' + (passCount + failCount));
console.log('Failed:         ' + failCount + ' / ' + (passCount + failCount));

if (failCount > 0) {
  console.error('\nPRICING COMPONENT CHECKS FAILED!');
  process.exit(1);
} else {
  console.log('\nALL PRICING UI COMPONENT CHECKS PASSED SUCCESSFULLY.');
}
