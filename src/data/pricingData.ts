import type {
  PricingPlan,
  FeatureComparisonCategory,
  PricingFaqItem,
  SavingsCalculation,
  PricingTestimonial,
  UsdCompetitorBreakdown,
} from '../types/pricing';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'equipe',
    name: 'Equipe',
    tagline: 'Ideal para microempresas, consultorias e escritórios enxutos.',
    description:
      'Organize sua equipe de até 5 pessoas com quadros visuais, tarefas ilimitadas e assistente de IA nativo.',
    priceMonthly: 69,
    priceAnnualMonthly: 55,
    priceAnnualPix: 590,
    priceAnnualInstallmentTotal: 660,
    annualSavingsPercentage: 20,
    annualSavingsMonthsDescription: '2 meses grátis',
    maxMembers: 5,
    maxBoards: 5,
    aiMonthlyCreations: 100,
    auditLogDays: 30,
    supportTier: 'E-mail (resposta em até 24h úteis)',
    isHighlighted: false,
    ctaText: 'Começar Teste de 14 Dias',
    ctaSecondary: true,
    features: [
      'Até 5 membros inclusos sem custo por assento',
      'Até 5 quadros / áreas ativas simultâneas',
      'Tarefas e subtarefas ilimitadas',
      '100 criações de tarefas com IA Gemini/mês',
      'Filtro Minhas Tarefas e alertas de prazo',
      'Histórico de atividades dos últimos 30 dias',
      'Suporte via e-mail em até 24h úteis',
    ],
  },
  {
    id: 'crescimento',
    name: 'Crescimento',
    badge: 'MAIS ESCOLHIDO PELAS PMEs',
    tagline: 'O plano âncora para empresas em expansão que conectam múltiplos setores.',
    description:
      'Perfeito para equipes de 6 a 15 pessoas que precisam de visibilidade total, prazos sob controle e automação com IA.',
    priceMonthly: 139,
    priceAnnualMonthly: 109,
    priceAnnualPix: 1180,
    priceAnnualInstallmentTotal: 1308,
    annualSavingsPercentage: 21,
    annualSavingsMonthsDescription: '2,5 meses grátis',
    maxMembers: 15,
    maxBoards: 20,
    aiMonthlyCreations: 400,
    auditLogDays: 180,
    supportTier: 'E-mail prioritário & Chat (até 8h úteis)',
    isHighlighted: true,
    ctaText: 'Experimentar Grátis por 14 Dias',
    features: [
      'Até 15 membros inclusos (sem punição por contratar)',
      'Até 20 quadros para organizar todas as áreas da empresa',
      'Tarefas e subtarefas ilimitadas',
      '400 criações de tarefas com IA Gemini/mês',
      'Geração automática de checklists e subtarefas com IA',
      'Logs de auditoria e histórico de 180 dias',
      'Suporte prioritário via chat e e-mail em até 8h úteis',
    ],
  },
  {
    id: 'escala',
    name: 'Escala',
    badge: 'MÁXIMA CAPACIDADE',
    tagline: 'Para operações estruturadas com alta demanda e múltiplos departamentos.',
    description:
      'Para empresas de até 35 colaboradores que precisam de quadros ilimitados, histórico completo e atendimento VIP.',
    priceMonthly: 269,
    priceAnnualMonthly: 215,
    priceAnnualPix: 2290,
    priceAnnualInstallmentTotal: 2580,
    annualSavingsPercentage: 22,
    annualSavingsMonthsDescription: 'quase 3 meses grátis',
    maxMembers: 35,
    maxBoards: 'unlimited',
    aiMonthlyCreations: 1200,
    auditLogDays: 'unlimited',
    supportTier: 'WhatsApp dedicado & Onboarding VIP',
    isHighlighted: false,
    ctaText: 'Começar Teste de 14 Dias',
    ctaSecondary: true,
    features: [
      'Até 35 membros inclusos (+10 membros por R$ 60/mês)',
      'Quadros e áreas de trabalho ilimitados',
      'Tarefas e subtarefas ilimitadas',
      '1.200 criações de tarefas com IA Gemini/mês',
      'Histórico de auditoria completo e irrestrito',
      'Exportação completa de dados (JSON/CSV) e backup diário',
      'WhatsApp dedicado & Onboarding VIP consultivo',
    ],
  },
];

export const FEATURE_COMPARISON_CATEGORIES: FeatureComparisonCategory[] = [
  {
    id: 'users_team',
    title: 'Usuários & Equipe',
    iconName: 'Users',
    rows: [
      {
        name: 'Membros incluídos no plano',
        tooltip: 'Quantidade de colaboradores que podem acessar o workspace sem custo adicional.',
        equipe: 'Até 5 membros',
        crescimento: 'Até 15 membros',
        escala: 'Até 35 membros',
      },
      {
        name: 'Pacote de membros adicionais',
        tooltip: 'Opção de expansão sem precisar migrar de plano abruptamente.',
        equipe: 'Não disponível',
        crescimento: '+5 membros por R$ 35/mês',
        escala: '+10 membros por R$ 60/mês',
      },
      {
        name: 'Papéis de acesso (Admin, Gestor, Membro)',
        tooltip: 'Controle de quem pode criar quadros, gerenciar membros ou apenas executar tarefas.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Convite de membros por e-mail em 1 clique',
        tooltip: 'Adicione funcionários e colaboradores externos instantaneamente.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Controle de visibilidade por quadro',
        tooltip: 'Restrinja o acesso a quadros estratégicos ou financeiros para grupos específicos.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
    ],
  },
  {
    id: 'boards_tasks',
    title: 'Quadros & Tarefas',
    iconName: 'LayoutGrid',
    rows: [
      {
        name: 'Tarefas e subtarefas (checklists)',
        tooltip: 'Crie quantas tarefas e itens de checagem sua operação precisar.',
        equipe: 'Ilimitadas',
        crescimento: 'Ilimitadas',
        escala: 'Ilimitadas',
      },
      {
        name: 'Quadros / Áreas ativas',
        tooltip: 'Espaços dedicados para setores como Vendas, Operação, Financeiro e Marketing.',
        equipe: 'Até 5 quadros',
        crescimento: 'Até 20 quadros',
        escala: 'Quadros Ilimitados',
      },
      {
        name: 'Filtro "Minhas Tarefas" individual',
        tooltip: 'Visão personalizada de cada membro com tudo o que está sob sua responsabilidade.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Alertas visuais de prazos (Hoje / Atrasadas)',
        tooltip: 'Indicadores coloridos automáticos que evitam que prazos sejam perdidos.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Etiquetas coloridas e Tags customizáveis',
        tooltip: 'Categorize tarefas por cliente, urgência, projeto ou tipo de demanda.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Anexos, links e descrições ricas',
        tooltip: 'Centralize documentos e instruções claras em cada cartão.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Filtros rápidos por prioridade e responsável',
        tooltip: 'Encontre qualquer pendência em segundos na visão Kanban.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
    ],
  },
  {
    id: 'ai_gemini',
    title: 'Inteligência Artificial (Gemini)',
    iconName: 'Sparkles',
    rows: [
      {
        name: 'Criação de tarefas por texto e voz',
        tooltip: 'Digite uma frase ou dite um áudio rápido e a IA estrutura o cartão completo.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Cota mensal de geração de tarefas por IA',
        tooltip: 'Quantidade de gerações inteligentes renovadas a cada ciclo de faturamento.',
        equipe: '100 criações / mês',
        crescimento: '400 criações / mês',
        escala: '1.200 criações / mês',
      },
      {
        name: 'Geração automática de checklists e subtarefas',
        tooltip: 'A IA decompõe a tarefa em etapas lógicas e critérios de conclusão.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Identificação inteligente de responsáveis',
        tooltip: 'O Tarefus sugere automaticamente quem deve executar a demanda com base no texto.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Sugestão automática de prioridade e prazo',
        tooltip: 'Detecção de urgência contextual a partir de termos como "urgente", "amanhã" ou datas.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
    ],
  },
  {
    id: 'security_governance',
    title: 'Segurança & Governança',
    iconName: 'ShieldCheck',
    rows: [
      {
        name: 'Histórico de atividades e Logs de Auditoria',
        tooltip: 'Rastreie quem criou, moveu, editou ou concluiu qualquer tarefa no workspace.',
        equipe: 'Últimos 30 dias',
        crescimento: 'Últimos 180 dias',
        escala: 'Histórico Completo (Ilimitado)',
      },
      {
        name: 'Exportação completa de dados (JSON/CSV)',
        tooltip: 'Exporte todos os seus dados a qualquer momento sem travas de fornecedor.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Backup diário automático na nuvem',
        tooltip: 'Seus dados salvos em redundância geográfica com máxima proteção contra perdas.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Conformidade com a LGPD',
        tooltip: 'Tratamento de dados e privacidade em conformidade com a legislação brasileira.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Preservação pós-trial em modo leitura',
        tooltip: 'Seus dados continuam acessíveis para consulta e exportação por 30 dias após o teste.',
        equipe: '30 dias garantidos',
        crescimento: '30 dias garantidos',
        escala: '30 dias garantidos',
      },
    ],
  },
  {
    id: 'support_training',
    title: 'Suporte & Treinamento',
    iconName: 'Headphones',
    rows: [
      {
        name: 'Central de Ajuda & Guia de Boas Práticas',
        tooltip: 'Biblioteca com artigos, modelos de quadros e dicas práticas de produtividade.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Tour Interativo de onboarding para novos membros',
        tooltip: 'Passo a passo guiado para que sua equipe aprenda a usar o app em 3 minutos.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Canal de atendimento e SLA',
        tooltip: 'Canais de suporte disponíveis e prazo médio de primeira resposta.',
        equipe: 'E-mail (até 24h úteis)',
        crescimento: 'E-mail prioritário & Chat (até 8h úteis)',
        escala: 'WhatsApp dedicado & Onboarding VIP',
      },
      {
        name: 'Emissão automática de Nota Fiscal (NFS-e)',
        tooltip: 'Documento fiscal eletrônico emitido para CNPJ ou CPF em todas as faturas.',
        equipe: true,
        crescimento: true,
        escala: true,
      },
      {
        name: 'Orientação para migração de planilhas e Trello',
        tooltip: 'Modelos e suporte dedicado para transferir pendências sem perder histórico.',
        equipe: 'Guias e modelos prontos',
        crescimento: 'Assistência prioritária',
        escala: 'Consultoria VIP 1-on-1',
      },
    ],
  },
];

export const PRICING_FAQS: PricingFaqItem[] = [
  {
    id: 'faq-1',
    category: 'trial',
    question: 'Preciso colocar meu cartão de crédito para fazer o teste grátis?',
    answer:
      'Não. O teste de 14 dias é 100% livre de compromisso. Você cria a conta da sua empresa, convida seus colaboradores e começa a usar todos os recursos do plano imediatamente em menos de 2 minutos. Só solicitaremos dados de pagamento se você decidir continuar utilizando o Tarefus após o término do período de avaliação.',
  },
  {
    id: 'faq-2',
    category: 'members',
    question: 'O que acontece se minha equipe passar do número de membros do plano?',
    answer:
      'Você receberá um aviso claro e discreto no painel do administrador. É possível realizar o upgrade instantâneo para a faixa seguinte com recálculo proporcional (pro-rata) do valor já pago, ou contratar um pacote adicional de membros, sem qualquer interrupção no fluxo de trabalho ou bloqueio repentino da equipe.',
  },
  {
    id: 'faq-3',
    category: 'pricing_model',
    question: 'A cobrança é realmente por empresa ou por usuário individual?',
    answer:
      'A cobrança é por empresa! Ao assinar o Tarefus, você tem direito ao pacote completo de membros do plano contratado sem pagar um centavo a mais por cada funcionário, estagiário ou prestador adicionado. Isso elimina o hábito perigoso de compartilhar senhas e incentiva toda a equipe a colaborar no mesmo lugar.',
  },
  {
    id: 'faq-4',
    category: 'payment',
    question: 'Quais são as formas de pagamento aceitas?',
    answer:
      'Aceitamos Cartão de Crédito (cobrado em Reais no plano mensal ou parcelado em até 12x no plano anual) e PIX à vista com liberação imediata da sua conta.',
  },
  {
    id: 'faq-5',
    category: 'cancellation',
    question: 'Posso cancelar a qualquer momento? Há contrato de fidelidade?',
    answer:
      'Sim, você pode cancelar a renovação da sua assinatura a qualquer momento com apenas 1 clique no painel, sem taxas rescisórias, multas ou burocracia de retenção. No plano mensal, seu acesso continuará ativo até o final do ciclo já pago. Seus dados ficam protegidos em modo leitura por 30 dias para que você possa exportá-los em JSON/CSV.',
  },
  {
    id: 'faq-6',
    category: 'ai',
    question: 'Como funciona a criação de tarefas com Inteligência Artificial?',
    answer:
      'Você pode digitar um resumo rápido em linguagem natural ou ditar um áudio no celular. A IA nativa do Tarefus (Google Gemini) analisa o contexto em português e preenche automaticamente o título da tarefa, descrição detalhada, quadro de destino, responsável sugerido, prioridade e um checklist com subtarefas executáveis. Cada plano conta com uma cota mensal generosa de criações.',
  },
  {
    id: 'faq-7',
    category: 'fiscal',
    question: 'Vocês emitem Nota Fiscal de Serviço (NFS-e) para a minha empresa?',
    answer:
      'Sim! Emitimos Nota Fiscal de Serviço eletrônica (NFS-e) automaticamente para todas as assinaturas, vinculadas ao CNPJ ou CPF informado no cadastro. A nota é enviada por e-mail a cada renovação para facilitar a rotina do seu departamento financeiro e contábil.',
  },
];

export const PRICING_TESTIMONIALS: PricingTestimonial[] = [
  {
    id: 't-1',
    quote:
      'Pagávamos mais de R$ 900 por mês em software em dólar para 11 pessoas. Com o Tarefus, reduzimos para R$ 109/mês no plano anual e conseguimos colocar até os auxiliares no sistema. A equipe inteira agora sabe o que precisa fazer.',
    author: 'Renata Vasconcelos',
    role: 'Sócia-Diretora',
    company: 'Vanguard Engenharia & Projetos (Curitiba, PR)',
    seats: 12,
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 't-2',
    quote:
      'O comando de voz com IA é surreal. Entro no carro após uma reunião com cliente, gravo 30 segundos de áudio e a tarefa já aparece no quadro do comercial com checklist e prazo definidos.',
    author: 'Marcelo Pimentel',
    role: 'Fundador & COO',
    company: 'Agência Alfa Digital (Belo Horizonte, MG)',
    seats: 8,
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 't-3',
    quote:
      'Acabamos de vez com as mensagens perdidas no WhatsApp. Cada entrega tem um único responsável e os prazos em vermelho não deixam ninguém esquecer o que vence hoje.',
    author: 'Camila Drummond',
    role: 'Gerente Operacional',
    company: 'Logística & Distribuição Express (Campinas, SP)',
    seats: 22,
    avatarColor: 'bg-amber-600',
  },
];

/**
 * Preço médio estimado por usuário/mês de ferramentas concorrentes internacionais
 * cotadas em dólar (Asana US$ 13.49 ≈ R$ 80, Monday US$ 12.00 ≈ R$ 72, Trello US$ 5.00 ≈ R$ 32),
 * considerando taxa cambial média, IOF (4,38% a 5,38%) e spread de cartão.
 */
export const COMPETITOR_BENCHMARK_SEAT_PRICE_BRL = 75;

export function getRecommendedPlan(seats: number): PricingPlan {
  const normalizedSeats = Math.max(1, Math.round(seats));
  if (normalizedSeats <= 5) {
    return PRICING_PLANS[0]; // Equipe
  }
  if (normalizedSeats <= 15) {
    return PRICING_PLANS[1]; // Crescimento
  }
  return PRICING_PLANS[2]; // Escala
}

export function calculateSavings(seats: number): SavingsCalculation {
  const normalizedSeats = Math.max(1, Math.round(seats));
  const plan = getRecommendedPlan(normalizedSeats);

  // Custo base do Tarefus
  let tarefusMonthly = plan.priceMonthly;
  let tarefusAnnualMonthly = plan.priceAnnualMonthly;

  // Se exceder a capacidade do plano Escala (35 membros), adiciona pacote extra (+10 membros por R$ 60/mês)
  if (normalizedSeats > 35) {
    const extraSeats = normalizedSeats - 35;
    const extraPacks = Math.ceil(extraSeats / 10);
    tarefusMonthly += extraPacks * 60;
    tarefusAnnualMonthly += extraPacks * 48;
  }

  // Custo concorrente estimado: R$ 75 por assento por mês
  const competitorsMonthly = normalizedSeats * COMPETITOR_BENCHMARK_SEAT_PRICE_BRL;

  const monthlySavings = Math.max(0, competitorsMonthly - tarefusMonthly);
  const annualSavings = Math.max(0, competitorsMonthly * 12 - tarefusAnnualMonthly * 12);
  const savingsPercentage = Math.round(
    ((competitorsMonthly - tarefusMonthly) / competitorsMonthly) * 100
  );

  const usdCompetitorBreakdown: UsdCompetitorBreakdown = {
    asanaBrl: Math.round(normalizedSeats * 80.5), // US$ 13.49 + IOF
    mondayBrl: Math.round(normalizedSeats * 72.0), // US$ 12.00 + IOF
    trelloBrl: Math.round(normalizedSeats * 31.5), // US$ 5.00 + IOF
  };

  return {
    seats: normalizedSeats,
    planId: plan.id,
    planName: plan.name,
    tarefusMonthly,
    tarefusAnnualMonthly,
    competitorsMonthly,
    monthlySavings,
    annualSavings,
    savingsPercentage: Math.max(10, Math.min(95, savingsPercentage)),
    usdCompetitorBreakdown,
  };
}

export const PRICING_HERO_COPY = {
  badge: '✨ PREÇO TRANSPARENTE EM REAIS',
  title: 'Planos simples e previsíveis para a sua empresa inteira.',
  subtitle:
    'Chega de pagar em dólar por cada funcionário. Pague um valor fixo mensal em Reais, sem IOF e com 14 dias de teste grátis sem cartão de crédito.',
  monthlyToggleLabel: 'Mensal',
  annualToggleLabel: 'Anual',
  annualDiscountBadge: 'Economize até 22%',
  annualSubtext: 'Parcelamento em até 12x no cartão de crédito ou desconto especial no PIX à vista.',
  trialGuaranteeText: '14 dias de teste grátis • Sem cartão de crédito • Cancele quando quiser',
};
