import type {
  GuideCategory,
  GuideCategoryKey,
  GuideArticle,
  GuideAuthor,
} from '../types/guide';

export const GUIDE_AUTHORS: Record<string, GuideAuthor> = {
  diogo: {
    id: 'diogo-lorenzo',
    name: 'Diogo Lorenzo',
    role: 'Especialista em Gestão de PMEs & Produto no Tarefus',
    avatar: 'DL',
    bio: 'Engenheiro de produto e consultor de processos para micro e pequenas empresas brasileiras, focado em produtividade sem complexidade.',
  },
  beatriz: {
    id: 'beatriz-silveira',
    name: 'Beatriz Silveira',
    role: 'Head de Operações & Metodologias Ágeis',
    avatar: 'BS',
    bio: 'Especialista em implantação de métodos ágeis e cultura de entrega com mais de 10 anos de atuação em equipes operacionais e de vendas.',
  },
  carlos: {
    id: 'carlos-mendes',
    name: 'Carlos Eduardo Mendes',
    role: 'Especialista em IA Aplicada & Eficiência Operacional',
    avatar: 'CM',
    bio: 'Pesquisador de inteligência artificial generativa aplicada a negócios e rotinas cotidianas de equipes de alto desempenho.',
  },
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    key: 'gestao-tarefas-prazos',
    title: 'Gestão de Tarefas & Prazos',
    description:
      'Técnicas, métodos visuais e práticas comprovadas para organizar demandas, evitar atrasos e manter prazos sempre sob controle.',
    icon: 'CheckSquare',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    popularTags: ['organizacao', 'prazos', 'checklists', 'prioridades', 'produtividade'],
  },
  {
    key: 'lideranca-delegacao',
    title: 'Liderança & Delegação',
    description:
      'Como distribuir responsabilidades com clareza, acompanhar entregas sem microgerenciamento e capacitar a equipe para entregar com autonomia.',
    icon: 'Users',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    popularTags: ['delegacao', 'lideranca', 'responsabilidade', 'gestao-de-equipes', 'autonomia'],
  },
  {
    key: 'ia-produtividade',
    title: 'IA & Produtividade no Trabalho',
    description:
      'Como utilizar Inteligência Artificial generativa, comandos de voz e automações práticas para poupar horas de trabalho operacional todos os dias.',
    icon: 'Sparkles',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    popularTags: ['ia-generativa', 'ditado-por-voz', 'produtividade-com-ia', 'automacao', 'gemini'],
  },
  {
    key: 'metodos-ageis',
    title: 'Métodos Ágeis para PMEs',
    description:
      'Conceitos de Kanban, Scrum simplificado e melhoria contínua adaptados para a realidade enxuta e dinâmica das empresas brasileiras.',
    icon: 'LayoutGrid',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    popularTags: ['kanban', 'quadro-visual', 'melhoria-continua', 'scrum-simplificado', 'comparativo'],
  },
  {
    key: 'rotinas-equipe',
    title: 'Rotinas de Equipe & Comunicação',
    description:
      'Alinhamentos rápidos de 10 minutos, ritos semanais, comunicação assíncrona e estratégias definitivas para aposentar o WhatsApp na gestão.',
    icon: 'MessageSquare',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    popularTags: ['reunioes-diarias', 'alinhamento', 'comunicacao', 'whatsapp', 'migracao'],
  },
];

export const GUIDE_ARTICLES: GuideArticle[] = [
  // 1. Como Organizar as Tarefas da Sua Equipe em 5 Passos Práticos
  {
    id: 'art-1',
    slug: 'como-organizar-tarefas-equipe',
    title: 'Como Organizar as Tarefas da Sua Equipe em 5 Passos Práticos',
    subtitle:
      'Acabe com o caos operacional, centralize pedidos soltos e crie ritos semanais que mantêm todos alinhados sem microgerenciamento.',
    category: 'Gestão de Tarefas & Prazos',
    categoryKey: 'gestao-tarefas-prazos',
    tags: ['organizacao', 'prazos', 'gestao-de-equipes', 'produtividade', 'kanban'],
    readTimeMinutes: 6,
    funnelStage: 'ToFu',
    targetAudience: 'Donos de PMEs e gerentes com equipes sobrecarregadas',
    primaryKeyword: 'como organizar tarefas da equipe',
    publishedAt: '2026-08-15',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.beatriz,
    summary:
      'Um passo a passo objetivo para identificar gargalos, centralizar demandas dispersas no WhatsApp e e-mail, definir responsáveis únicos e manter entregas no prazo com ritos simples.',
    coverIcon: 'ClipboardList',
    isFeatured: true,
    tableOfContents: [
      { id: 'diagnostico-sobrecarga', title: 'O Diagnóstico da Sobrecarga nas Pequenas Empresas', level: 2 },
      { id: 'passo-1-mapeamento', title: 'Passo 1: Mapear Demandas Invisíveis', level: 2 },
      { id: 'passo-2-centralizacao', title: 'Passo 2: Centralizar Pedidos em um Único Canal', level: 2 },
      { id: 'passo-3-responsavel-unico', title: 'Passo 3: Definir um Único Responsável por Tarefa', level: 2 },
      { id: 'passo-4-prazos-criterios', title: 'Passo 4: Estabelecer Prazos Reais e Critérios de Pronto', level: 2 },
      { id: 'passo-5-ritos-curtos', title: 'Passo 5: Criar Ritos Curtos de Acompanhamento', level: 2 },
      { id: 'conclusao-pratica', title: 'Colocando a Casa em Ordem na Prática', level: 2 },
    ],
    sections: [
      {
        id: 'diagnostico-sobrecarga',
        title: 'O Diagnóstico da Sobrecarga nas Pequenas Empresas',
        content: [
          'Se você já sentiu que passa o dia inteiro apagando incêndios, respondendo mensagens urgentes e cobrando o time sobre prazos esquecidos, saiba que essa é a dor número um de 8 em cada 10 gestores de pequenas e médias empresas no Brasil.',
          'A sobrecarga quase nunca é resultado de falta de esforço da equipe. Na maioria das vezes, o problema é a dispersão de informações: pedidos que chegam por WhatsApp, combinados verbais no corredor, e-mails esquecidos na caixa de entrada e post-its espalhados pela mesa.',
          'Quando não há um local único de verdade compartilhada, cada colaborador prioriza o que parece mais barulhento no momento, gerando atrasos em cascata e estresse generalizado.',
        ],
        tips: [
          'O primeiro passo para organizar a equipe não é contratar mais pessoas, mas dar visibilidade ao trabalho que já existe.',
        ],
      },
      {
        id: 'passo-1-mapeamento',
        title: 'Passo 1: Mapear Demandas Invisíveis',
        content: [
          'Tire as tarefas da cabeça da liderança e dos colaboradores. Faça um exercício de 30 minutos com toda a equipe reunida e responda à pergunta: "O que está pendente de entrega nesta semana em cada setor?".',
          'Liste tudo sem julgar a complexidade: propostas comerciais para enviar, notas fiscais para emitir, chamados de suporte abertos e manutenções agendadas. Você ficará surpreso com a quantidade de tarefas que existiam apenas na memória das pessoas.',
        ],
      },
      {
        id: 'passo-2-centralizacao',
        title: 'Passo 2: Centralizar Pedidos em um Único Canal',
        content: [
          'Estabeleça uma regra inegociável na empresa: se não está no gerenciador de tarefas, a tarefa não existe oficialmente. Isso protege o time contra interrupções constantes e impede que demandas importantes se percam em conversas de WhatsApp.',
          'Quando um cliente ou colega pedir algo por mensagem ou telefone, a primeira reação deve ser registrar a demanda no sistema antes de iniciar a execução.',
        ],
        tips: [
          'Use o recurso de criação rápida por voz ou texto do Tarefus para lançar uma nova tarefa em menos de 10 segundos.',
        ],
      },
      {
        id: 'passo-3-responsavel-unico',
        title: 'Passo 3: Definir um Único Responsável por Tarefa',
        content: [
          'Tarefa com dois donos é tarefa que ninguém assume. Para cada cartão criado, defina sempre um Único Responsável Direto (o capitão da entrega). Outros membros podem ajudar ou colaborar no checklist, mas a responsabilidade de garantir que o prazo seja cumprido é de apenas uma pessoa.',
          'Isso elimina a clássica desculpa do "achei que fulano ia fazer" e empodera o colaborador com autonomia real sobre seu trabalho.',
        ],
      },
      {
        id: 'passo-4-prazos-criterios',
        title: 'Passo 4: Estabelecer Prazos Reais e Critérios de Pronto',
        content: [
          'Evite prazos vagos como "assim que der" ou "para a próxima semana". Toda tarefa precisa de uma data de vencimento concreta e um checklist com o que precisa ser feito para ser considerada pronta (Definition of Done).',
          'Se a tarefa for muito grande (ex: "Criar novo catálogo"), desmembre-a em subtarefas menores de 2 a 4 horas de duração cada. Isso reduz a procrastinação e facilita o acompanhamento.',
        ],
      },
      {
        id: 'passo-5-ritos-curtos',
        title: 'Passo 5: Criar Ritos Curtos de Acompanhamento',
        content: [
          'Não espere o fim do mês para descobrir que um prazo estourou. Institua dois ritos simples: uma reunião diária de 10 minutos (Daily) em frente ao quadro Kanban para remover impedimentos e um alinhamento semanal de 20 minutos na segunda-feira para definir prioridades.',
          'Quando o quadro visual é a pauta central da reunião, as conversas ficam objetivas e ninguém perde tempo com relatórios manuais.',
        ],
      },
      {
        id: 'conclusao-pratica',
        title: 'Colocando a Casa em Ordem na Prática',
        content: [
          'A organização de equipe é um hábito construído diariamente. Comece aplicando esses 5 passos em um único departamento da sua empresa (como Vendas ou Operações) e expanda para os demais conforme os resultados aparecerem.',
        ],
        callout: {
          type: 'tip',
          title: 'Experimente na sua empresa hoje',
          text: 'Você pode criar o quadro visual da sua equipe no Tarefus em menos de 2 minutos e começar seus 14 dias de teste grátis sem precisar cadastrar cartão de crédito.',
        },
      },
    ],
    cta: {
      title: 'Pronto para organizar sua equipe em 5 passos?',
      description: 'Crie seus quadros, convide seus colaboradores e experimente o Tarefus grátis por 14 dias sem cartão de crédito.',
      buttonText: 'Começar Teste Grátis de 14 Dias',
      targetUrl: '/planos',
    },
  },

  // 2. Quadro Kanban para Pequenas Empresas: O Que É e Como Usar Sem Complicação
  {
    id: 'art-2',
    slug: 'quadro-kanban-pequenas-empresas',
    title: 'Quadro Kanban para Pequenas Empresas: O Que É e Como Usar Sem Complicação',
    subtitle:
      'Entenda o método visual japonês que conquistou o mundo: colunas essenciais, limite de trabalho em progresso e clareza total da operação.',
    category: 'Métodos Ágeis para PMEs',
    categoryKey: 'metodos-ageis',
    tags: ['kanban', 'quadro-visual', 'melhoria-continua', 'scrum-simplificado', 'gestao-visual'],
    readTimeMinutes: 5,
    funnelStage: 'ToFu',
    targetAudience: 'Gestores que conhecem post-its mas sofrem com desorganização digital',
    primaryKeyword: 'quadro kanban pequenas empresas',
    publishedAt: '2026-08-16',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.beatriz,
    summary:
      'Aprenda como o Kanban organiza tarefas em colunas visuais, elimina o acúmulo de trabalho inacabado e dá visibilidade instantânea do que está acontecendo na sua empresa.',
    coverIcon: 'Kanban',
    tableOfContents: [
      { id: 'o-que-e-kanban', title: 'O Que É o Método Kanban e Por Que Funciona?', level: 2 },
      { id: 'tres-colunas-classicas', title: 'As 3 Colunas Fundamentais de um Quadro Visual', level: 2 },
      { id: 'segredo-wip', title: 'O Segredo do WIP: Limite o Trabalho em Andamento', level: 2 },
      { id: 'modelos-por-setor', title: 'Exemplos de Quadros Kanban para Diferentes Setores', level: 2 },
      { id: 'erros-comuns-kanban', title: 'Os 3 Erros Mais Comuns ao Adotar Kanban', level: 2 },
    ],
    sections: [
      {
        id: 'o-que-e-kanban',
        title: 'O Que É o Método Kanban e Por Que Funciona?',
        content: [
          'Criado originalmente nos anos 1950 pela montadora japonesa Toyota, o termo Kanban significa literalmente "cartão visual" ou "placa". O método foi concebido para equilibrar a linha de produção, garantindo que nada fosse produzido antes da etapa anterior estar concluída.',
          'No ambiente corporativo moderno, o Kanban se tornou o formato favorito de gestão de tarefas porque o cérebro humano processa informações visuais 60.000 vezes mais rápido do que textos corridos ou tabelas complexas.',
          'Em vez de rolar planilhas infinitas com dezenas de linhas estáticas, toda a equipe enxerga cartões coloridos que se movem da esquerda para a direita conforme avançam em direção à conclusão.',
        ],
      },
      {
        id: 'tres-colunas-classicas',
        title: 'As 3 Colunas Fundamentais de um Quadro Visual',
        content: [
          'A estrutura básica e mais eficiente de um quadro Kanban é composta por três colunas:',
          '1. **A Fazer (To Do):** O backlog de demandas aprovadas e priorizadas que aguardam início. Organizadas de cima para baixo por ordem de urgência.',
          '2. **Em Andamento (In Progress):** Tarefas que estão sendo executadas ativamente neste exato momento pelos responsáveis.',
          '3. **Concluído (Done):** Demandas finalizadas e entregues com sucesso, servindo como histórico de produtividade e conquista.',
        ],
        tips: [
          'Mantenha a coluna "Concluído" visível para alimentar o senso de progresso e celebração das pequenas vitórias da equipe.',
        ],
      },
      {
        id: 'segredo-wip',
        title: 'O Segredo do WIP: Limite o Trabalho em Andamento',
        content: [
          'A regra de ouro do Kanban é: pare de começar e comece a terminar. Um dos maiores problemas nas PMEs é o excesso de tarefas na coluna "Em Andamento". Quando um colaborador tem 8 tarefas abertas ao mesmo tempo, ele não executa nenhuma com excelência e perde tempo trocando de contexto.',
          'Ao limitar o número máximo de itens em progresso (WIP - Work in Progress) por pessoa (por exemplo, no máximo 2 tarefas ativas simultâneas), a velocidade média de entrega de toda a empresa aumenta dramaticamente.',
        ],
      },
      {
        id: 'modelos-por-setor',
        title: 'Exemplos de Quadros Kanban para Diferentes Setores',
        content: [
          'Embora as 3 colunas clássicas funcionem para a maioria das necessidades, você pode customizar quadros para áreas específicas:',
          '- **Comercial / Vendas:** Novos Leads → Proposta Enviada → Em Negociação → Fechado / Ganho.',
          '- **Financeiro:** Contas a Receber → Faturado → Cobrança Pendente → Liquidado.',
          '- **Operacional / Projetos:** Triagem → Em Produção → Revisão de Qualidade → Entregue ao Cliente.',
        ],
      },
      {
        id: 'erros-comuns-kanban',
        title: 'Os 3 Erros Mais Comuns ao Adotar Kanban',
        content: [
          '1. **Deixar o quadro desatualizado:** O quadro só tem valor se refletir a realidade em tempo real. Mover os cartões deve ser um hábito natural durante o dia.',
          '2. **Acúmulo de cartões esquecidos:** Faça uma limpeza periódica de tarefas que perderam a relevância para evitar poluição visual.',
          '3. **Falta de responsáveis e prazos:** Um cartão no Kanban precisa ter um dono e uma data limite claros para não ficar estagnado eternamente na coluna.',
        ],
        callout: {
          type: 'tip',
          title: 'Kanban nativo no Tarefus',
          text: 'No Tarefus você move tarefas por arrastar e soltar, filtra instantaneamente por "Minhas Tarefas" e recebe alertas visuais de prazo.',
        },
      },
    ],
    cta: {
      title: 'Monte seu primeiro Kanban em 2 minutos',
      description: 'Experimente a simplicidade do Kanban no Tarefus com IA integrada e 14 dias de teste grátis sem compromisso.',
      buttonText: 'Criar Meu Primeiro Quadro',
      targetUrl: '/planos',
    },
  },

  // 3. Por Que Delegar pelo WhatsApp Está Destruindo a Produtividade da Sua Empresa
  {
    id: 'art-3',
    slug: 'delegar-tarefas-whatsapp-erros',
    title: 'Por Que Delegar pelo WhatsApp Está Destruindo a Produtividade da Sua Empresa',
    subtitle:
      'Descubra as 4 maiores armadilhas de usar o WhatsApp como gerenciador de tarefas e como separar mensagens rápidas de gestão estruturada.',
    category: 'Rotinas de Equipe & Comunicação',
    categoryKey: 'rotinas-equipe',
    tags: ['whatsapp', 'comunicacao', 'delegacao', 'produtividade', 'saude-mental'],
    readTimeMinutes: 7,
    funnelStage: 'ToFu',
    targetAudience: 'Empresários e líderes que passam o dia cobrando mensagens perdidas em grupos',
    primaryKeyword: 'delegar tarefas no whatsapp',
    publishedAt: '2026-08-17',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.diogo,
    summary:
      'Entenda por que grupos de WhatsApp geram ansiedade, esquecimento de prazos e retrabalho, e como adotar uma separação saudável entre chat e gerenciador de tarefas.',
    coverIcon: 'MessageCircleOff',
    tableOfContents: [
      { id: 'ilusao-da-agilidade', title: 'A Ilusão da Falsa Agilidade', level: 2 },
      { id: 'armadilha-1-soterramento', title: 'Armadilha 1: Mensagens Soterradas e Tarefas Esquecidas', level: 2 },
      { id: 'armadilha-2-sem-prazos', title: 'Armadilha 2: Ausência de Prazos e Alertas Inteligentes', level: 2 },
      { id: 'armadilha-3-falta-historico', title: 'Armadilha 3: Falta de Histórico e Contexto Centralizado', level: 2 },
      { id: 'armadilha-4-ansiedade', title: 'Armadilha 4: Ansiedade e Trabalho Ininterrupto', level: 2 },
      { id: 'papel-correto-ferramentas', title: 'O Papel Correto de Cada Ferramenta na Empresa', level: 2 },
    ],
    sections: [
      {
        id: 'ilusao-da-agilidade',
        title: 'A Ilusão da Falsa Agilidade',
        content: [
          'O WhatsApp é o aplicativo mais popular do Brasil e uma ferramenta extraordinária para atendimento rápido a clientes e avisos pontuais. No entanto, utilizá-lo como sistema de controle de tarefas e projetos é uma das receitas mais perigosas para o caos operacional.',
          'Muitos gestores acreditam que mandar um áudio de 2 minutos em um grupo com 10 pessoas equivale a delegar uma tarefa. Na prática, a mensagem é lida rapidamente, novos memes e dúvidas chegam logo em seguida e, em poucas horas, o pedido afunda no histórico infinito de mensagens.',
        ],
      },
      {
        id: 'armadilha-1-soterramento',
        title: 'Armadilha 1: Mensagens Soterradas e Tarefas Esquecidas',
        content: [
          'Em um dia movimentado, um grupo de trabalho no WhatsApp recebe facilmente mais de 100 mensagens. Se uma demanda foi solicitada às 09h da manhã, às 16h ela já foi soterrada por conversas paralelas.',
          'O colaborador não tem como marcar a mensagem com status "Em Andamento" ou anexar arquivos de forma estruturada. O resultado? A tarefa só é lembrada quando o cliente reclama ou quando o gestor cobra com urgência.',
        ],
        tips: [
          'Mensagens no WhatsApp têm caráter efêmero; tarefas precisam de persistência, status e visibilidade contínua.',
        ],
      },
      {
        id: 'armadilha-2-sem-prazos',
        title: 'Armadilha 2: Ausência de Prazos e Alertas Inteligentes',
        content: [
          'No WhatsApp não existe campo de data de entrega nem sistema que avise que uma tarefa vence hoje ou está atrasada há 2 dias. Toda a responsabilidade de lembrar prazos fica dependente da memória humana ou de anotações soltas em cadernos.',
          'Isso força o gestor a atuar como um "cobrador profissional", enviando mensagens estressantes como "Já viu aquilo?" ou "Como está a proposta?".',
        ],
      },
      {
        id: 'armadilha-3-falta-historico',
        title: 'Armadilha 3: Falta de Histórico e Contexto Centralizado',
        content: [
          'Quando um novo colaborador entra na equipe ou quando alguém precisa cobrir férias, o histórico de mensagens do WhatsApp não serve como documentação de processos. Informações críticas ficam dispersas em conversas privadas (privadas de contexto) ou áudios perdidos.',
          'Em um gerenciador de tarefas adequado, todo o histórico de decisões, checklists e arquivos fica anexado diretamente no cartão da tarefa.',
        ],
      },
      {
        id: 'armadilha-4-ansiedade',
        title: 'Armadilha 4: Ansiedade e Trabalho Ininterrupto',
        content: [
          'Misturar grupos de trabalho com mensagens de amigos e familiares cria uma sensação constante de que o trabalho nunca termina. Colaboradores recebem notificações à noite e aos finais de semana, gerando sobrecarga mental e esgotamento precoce.',
        ],
      },
      {
        id: 'papel-correto-ferramentas',
        title: 'O Papel Correto de Cada Ferramenta na Empresa',
        content: [
          'A solução não é proibir o WhatsApp, mas delimitar claramente o papel de cada canal:',
          '- **WhatsApp:** Para avisos urgentes em tempo real, links rápidos e comunicação externa com clientes.',
          '- **Tarefus (Gerenciador de Tarefas):** Para registrar o trabalho, definir responsáveis, controlar prazos, armazenar checklists e acompanhar o progresso visual de toda a operação.',
        ],
        callout: {
          type: 'tip',
          title: 'Transição suave',
          text: 'Você pode ditar no Tarefus o que diria no WhatsApp e a inteligência artificial cria o cartão estruturado para o responsável automaticamente.',
        },
      },
    ],
    cta: {
      title: 'Tire as tarefas do WhatsApp e traga paz para sua equipe',
      description: 'Centralize todas as demandas no Tarefus com preço fixo em Reais e 14 dias de teste grátis sem cartão.',
      buttonText: 'Testar Tarefus Grátis',
      targetUrl: '/planos',
    },
  },

  // 4. Como Definir Prazos Realistas e Acabar com os Atrasos no Trabalho
  {
    id: 'art-4',
    slug: 'como-definir-prazos-tarefas',
    title: 'Como Definir Prazos Realistas e Acabar com os Atrasos no Trabalho',
    subtitle:
      'Aprenda técnicas práticas de estimativa para pequenas equipes, quebra de tarefas em subtarefas gerenciáveis e o uso de alertas visuais.',
    category: 'Gestão de Tarefas & Prazos',
    categoryKey: 'gestao-tarefas-prazos',
    tags: ['prazos', 'organizacao', 'checklists', 'gestao-de-equipes', 'estimativas'],
    readTimeMinutes: 6,
    funnelStage: 'MoFu',
    targetAudience: 'Coordenadores e líderes de projetos com entregas frequentemente atrasadas',
    primaryKeyword: 'como definir prazos de tarefas',
    publishedAt: '2026-08-18',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.beatriz,
    summary:
      'Descubra como aplicar a decomposição de tarefas, adicionar margens de segurança estratégicas e utilizar alertas visuais para eliminar atrasos crônicos na sua operação.',
    coverIcon: 'CalendarClock',
    tableOfContents: [
      { id: 'por-que-prazos-estouram', title: 'Por Que os Prazos Quase Sempre Estouram?', level: 2 },
      { id: 'regra-da-decomposicao', title: 'A Regra da Decomposição em Subtarefas', level: 2 },
      { id: 'margens-de-seguranca', title: 'Margens de Segurança Estratégicas (Buffers)', level: 2 },
      { id: 'alertas-visuais', title: 'Alertas Visuais: Vence Hoje vs. Atrasada', level: 2 },
      { id: 'comunicacao-preventiva', title: 'Comunicação Preventiva de Imprevistos', level: 2 },
    ],
    sections: [
      {
        id: 'por-que-prazos-estouram',
        title: 'Por Que os Prazos Quase Sempre Estouram?',
        content: [
          'No universo da administração existem dois fenômenos bem documentados: a Lei de Parkinson (o trabalho se expande até preencher todo o tempo disponível para sua conclusão) e a Falácia do Planejamento (a tendência psicológica de subestimar o tempo necessário para executar qualquer atividade futura).',
          'Quando um líder define um prazo no achismo ("Acho que até sexta-feira você termina"), ele ignora interrupções rotineiras, dúvidas técnicas e dependências de terceiros. Sem método, os atrasos viram regra e minam a confiança dos clientes.',
        ],
      },
      {
        id: 'regra-da-decomposicao',
        title: 'A Regra da Decomposição em Subtarefas',
        content: [
          'É quase impossível estimar com precisão o prazo de uma tarefa genérica de 30 horas. No entanto, é muito fácil estimar 5 subtarefas de 2 horas cada.',
          'Sempre que uma demanda for complexa, divida-a em etapas lógicas através de um checklist. Por exemplo, em vez de criar apenas "Emitir relatório trimestral", quebre em: 1. Coletar dados de faturamento; 2. Cruzar com despesas operacionais; 3. Gerar gráficos comparativos; 4. Revisar com a diretoria.',
        ],
        tips: [
          'Tarefas com checklists detalhados reduzem a ansiedade de começar e facilitam a medição do progresso em tempo real.',
        ],
      },
      {
        id: 'margens-de-seguranca',
        title: 'Margens de Segurança Estratégicas (Buffers)',
        content: [
          'Imprevistos acontecem em qualquer empresa: um fornecedor atrasa, um cliente pede alteração de última hora ou a internet oscila. Por isso, nunca comprometa 100% da capacidade horária da sua equipe.',
          'Adicione uma margem de segurança de 20% a 30% no prazo prometido para o cliente externo. Se a estimativa interna de produção é quinta-feira às 12h, combine a entrega final para sexta-feira às 17h. Se entregar antes, você supera as expectativas.',
        ],
      },
      {
        id: 'alertas-visuais',
        title: 'Alertas Visuais: Vence Hoje vs. Atrasada',
        content: [
          'Um bom sistema de gestão deve destacar visualmente o status temporal das tarefas:',
          '- **Badge Âmbar / Amarelo:** Tarefa com vencimento para o dia de hoje, exigindo prioridade na esteira.',
          '- **Badge Vermelho Vivo:** Tarefa atrasada que requer intervenção imediata da liderança para desbloqueio.',
          '- **Badge Neutro / Azul:** Prazos futuros dentro do cronograma esperado.',
        ],
      },
      {
        id: 'comunicacao-preventiva',
        title: 'Comunicação Preventiva de Imprevistos',
        content: [
          'Incentive a cultura de avisar sobre atrasos antes do prazo expirar. Se uma entrega vence às 18h e às 14h o executor percebe um bloqueio, ele deve sinalizar imediatamente no cartão para que outros membros possam apoiar no checklist.',
        ],
        callout: {
          type: 'tip',
          title: 'Alertas automáticos no Tarefus',
          text: 'O Tarefus destaca automaticamente em cores vibrantes as tarefas que vencem hoje e as pendências atrasadas, garantindo que nada passe despercebido.',
        },
      },
    ],
    cta: {
      title: 'Elimine os atrasos crônicos na sua operação',
      description: 'Tenha controle total de datas e alertas inteligentes no Tarefus. Teste 14 dias grátis sem cartão de crédito.',
      buttonText: 'Garantir Controle de Prazos',
      targetUrl: '/planos',
    },
  },

  // 5. Quem Faz o Quê? A Importância de Ter um Único Responsável por Tarefa
  {
    id: 'art-5',
    slug: 'responsavel-por-tarefa-clareza',
    title: 'Quem Faz o Quê? A Importância de Ter um Único Responsável por Tarefa',
    subtitle:
      'O princípio do DRI (Directly Responsible Individual) e como a clareza sobre o executor principal elimina o "achava que o outro ia fazer".',
    category: 'Liderança & Delegação',
    categoryKey: 'lideranca-delegacao',
    tags: ['responsabilidade', 'delegacao', 'lideranca', 'gestao-de-equipes', 'papeis'],
    readTimeMinutes: 5,
    funnelStage: 'MoFu',
    targetAudience: 'Gestores que enfrentam responsabilidade difusa e falta de prestação de contas',
    primaryKeyword: 'responsável por tarefa',
    publishedAt: '2026-08-19',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.diogo,
    summary:
      'Conheça a metodologia DRI adotada por gigantes da tecnologia e veja como aplicá-la em pequenas empresas para garantir que cada entrega tenha um capitão responsável.',
    coverIcon: 'UserCheck',
    tableOfContents: [
      { id: 'paradoxo-responsabilidade-difusa', title: 'O Paradoxo da Responsabilidade Difusa', level: 2 },
      { id: 'metodologia-dri', title: 'A Metodologia DRI (Directly Responsible Individual)', level: 2 },
      { id: 'executor-vs-apoiadores', title: 'Diferença Entre Executor Principal e Apoiadores', level: 2 },
      { id: 'formula-delegacao-perfeita', title: 'A Fórmula da Delegação Clara e Eficaz', level: 2 },
      { id: 'autonomia-sem-microgestao', title: 'Acompanhando o Progresso Sem Cair no Microgerenciamento', level: 2 },
    ],
    sections: [
      {
        id: 'paradoxo-responsabilidade-difusa',
        title: 'O Paradoxo da Responsabilidade Difusa',
        content: [
          'Há um ditado clássico na administração corporativa: "Cachorro que tem dois donos morre de fome". Quando uma tarefa importante é atribuída coletivamente a "todo o departamento" ou a duas pessoas ao mesmo tempo, a responsabilidade psicológica se dilui.',
          'Cada membro assume internamente que o outro dará o primeiro passo ou fará o acompanhamento final. Quando o prazo vence e a entrega não aconteceu, o diálogo inevitável é: "Mas eu achei que você estava cuidando disso".',
        ],
      },
      {
        id: 'metodologia-dri',
        title: 'A Metodologia DRI (Directly Responsible Individual)',
        content: [
          'Popularizada pela Apple e replicada pelas empresas mais eficientes do mundo, a metodologia DRI prega que para absolutamente qualquer projeto, reunião ou tarefa exista apenas um Indivíduo Diretamente Responsável.',
          'O DRI não precisa fazer todo o trabalho sozinho, mas é a pessoa cujo nome está no cabeçalho do cartão. Se houver dúvidas, é com ele que se alinha; se a entrega atrasar, é ele quem responde pelos motivos e propõe a solução.',
        ],
        tips: [
          'Designar um DRI claro dá orgulho e senso de propriedade ao colaborador, aumentando seu engajamento com a qualidade da entrega.',
        ],
      },
      {
        id: 'executor-vs-apoiadores',
        title: 'Diferença Entre Executor Principal e Apoiadores',
        content: [
          'Muitas tarefas dependem de contribuições de mais de um setor. Por exemplo, a criação de uma proposta comercial pode envolver o vendedor (DRI) e o analista técnico (apoiador).',
          'No Tarefus, o vendedor permanece como o responsável principal pelo prazo final da proposta, enquanto os pontos técnicos específicos são distribuídos como itens individuais no checklist interno da tarefa.',
        ],
      },
      {
        id: 'formula-delegacao-perfeita',
        title: 'A Fórmula da Delegação Clara e Eficaz',
        content: [
          'Para delegar com maestria sem deixar margem para dúvidas, certifique-se de que a tarefa contenha 3 pilares obrigatórios:',
          '1. **Objetivo claro:** O que exatamente precisa ser entregue (ex: "Apresentação comercial em PDF de 8 slides para o cliente X").',
          '2. **Critérios de sucesso:** Checklist com requisitos obrigatórios de qualidade.',
          '3. **Prazo e Responsável:** Data de vencimento e nome do colaborador definidos.',
        ],
      },
      {
        id: 'autonomia-sem-microgestao',
        title: 'Acompanhando o Progresso Sem Cair no Microgerenciamento',
        content: [
          'Microgerenciamento é perguntar a cada 20 minutos "o que você está fazendo?". Gestão moderna é abrir a aba "Minhas Tarefas" ou o quadro geral, ver o cartão se mover e os itens do checklist sendo marcados com tranquilidade.',
        ],
        callout: {
          type: 'tip',
          title: 'Visão individualizada no Tarefus',
          text: 'Com o filtro "Minhas Tarefas", cada colaborador enxerga exatamente a sua lista de prioridades do dia, sem distrações com demandas alheias.',
        },
      },
    ],
    cta: {
      title: 'Traga clareza de papéis para toda a sua equipe',
      description: 'Defina responsáveis únicos e acompanhe entregas com facilidade no Tarefus. Teste 14 dias grátis sem cartão.',
      buttonText: 'Experimentar Tarefus Grátis',
      targetUrl: '/planos',
    },
  },

  // 6. Inteligência Artificial na Gestão de Tarefas: Como Criar e Estruturar Demandas em Segundos
  {
    id: 'art-6',
    slug: 'inteligencia-artificial-gestao-tarefas',
    title: 'Inteligência Artificial na Gestão de Tarefas: Como Criar e Estruturar Demandas em Segundos',
    subtitle:
      'Veja como a IA generativa integrada transforma comandos de voz e rascunhos rápidos em tarefas detalhadas com checklists e prazos automáticos.',
    category: 'IA & Produtividade no Trabalho',
    categoryKey: 'ia-produtividade',
    tags: ['ia-generativa', 'ditado-por-voz', 'produtividade-com-ia', 'automacao', 'gemini'],
    readTimeMinutes: 6,
    funnelStage: 'MoFu',
    targetAudience: 'Líderes curiosos por produtividade e inovação prática',
    primaryKeyword: 'inteligencia artificial gestao de tarefas',
    publishedAt: '2026-08-20',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.carlos,
    summary:
      'Descubra como o Tarefus utiliza o Google Gemini nativamente em português para transformar áudios rápidos do dia a dia em cartões estruturados com checklists completos.',
    coverIcon: 'Sparkles',
    tableOfContents: [
      { id: 'alem-do-chatbot', title: 'A IA Além do Chatbot: Automação Integrada ao Fluxo', level: 2 },
      { id: 'barreira-formularios', title: 'O Fim da Barreira do Preenchimento de Formulários', level: 2 },
      { id: 'ditado-por-voz', title: 'Ditado por Voz Inteligente em Português', level: 2 },
      { id: 'checklists-automaticos', title: 'Geração Automática de Checklists e Subtarefas', level: 2 },
      { id: 'exemplos-prompts', title: '5 Exemplos de Comandos que Economizam Horas por Semana', level: 2 },
      { id: 'privacidade-dados', title: 'Segurança e Privacidade dos Dados Empresariais', level: 2 },
    ],
    sections: [
      {
        id: 'alem-do-chatbot',
        title: 'A IA Além do Chatbot: Automação Integrada ao Fluxo',
        content: [
          'A maioria das pessoas conhece a Inteligência Artificial através de interfaces de chat genéricas (como ChatGPT). Embora sejam úteis para redação de textos, copiar e colar prompts o dia inteiro cria atrito e tira o usuário do seu ambiente de trabalho.',
          'A verdadeira revolução da IA nas empresas acontece quando o modelo de linguagem está profundamente conectado aos dados da operação: quadros, membros da equipe, prioridades e calendários.',
        ],
      },
      {
        id: 'barreira-formularios',
        title: 'O Fim da Barreira do Preenchimento de Formulários',
        content: [
          'O principal motivo pelo qual gestores desistem de usar ferramentas tradicionais (como Jira ou Asana) é o tempo gasto preenchendo dezenas de campos obrigatórios: selecionar projeto, escolher tipo de issue, definir severidade, marcar tags e selecionar datas em calendários lentos.',
          'Com a IA generativa do Tarefus, você só precisa digitar uma frase ou falar um comando natural. O sistema interpreta a intenção e faz todo o trabalho estrutural para você.',
        ],
        tips: [
          'Frases simples como "Preparar contrato para a Alpha Tech até quinta-feira, prioridade alta com o Carlos" geram a tarefa 100% preenchida.',
        ],
      },
      {
        id: 'ditado-por-voz',
        title: 'Ditado por Voz Inteligente em Português',
        content: [
          'Imagine sair de uma reunião com cliente no carro, clicar no microfone do aplicativo Tarefus no celular e falar: "Revisar cláusula de entrega da proposta da Metalúrgica Silva, solicitar aprovação do jurídico e mandar por e-mail até amanhã às 15h".',
          'O modelo Gemini processa o áudio, remove gagueiras e vícios de linguagem e cria o cartão no quadro Comercial com o checklist pronto e prazo ajustado para amanhã.',
        ],
      },
      {
        id: 'checklists-automaticos',
        title: 'Geração Automática de Checklists e Subtarefas',
        content: [
          'Mesmo que você forneça apenas um título genérico como "Onboarding do novo analista de marketing", a IA do Tarefus sugere automaticamente um checklist completo de 6 etapas recomendadas para admissão e integração na empresa.',
        ],
      },
      {
        id: 'exemplos-prompts',
        title: '5 Exemplos de Comandos que Economizam Horas por Semana',
        content: [
          '1. **Financeiro:** "Emitir notas de fechamento do mês para os 12 clientes do plano anual até sexta-feira com a Juliana."',
          '2. **Operacional:** "Agendar revisão preventiva dos equipamentos da filial Campinas até dia 15 com checklist de inspeção."',
          '3. **Marketing:** "Lançar campanha de e-mail marketing da promoção de primavera na terça com revisão de cópia."',
          '4. **Comercial:** "Fazer follow-up com os 5 leads da feira de negócios e atualizar status no CRM até amanhã."',
          '5. **Recursos Humanos:** "Preparar kit de boas-vindas e acesso aos sistemas para o novo desenvolvedor."',
        ],
      },
      {
        id: 'privacidade-dados',
        title: 'Segurança e Privacidade dos Dados Empresariais',
        content: [
          'Todas as requisições de IA no Tarefus utilizam canais criptografados de nível corporativo e os dados das suas tarefas nunca são utilizados para treinar modelos públicos.',
        ],
        callout: {
          type: 'tip',
          title: 'IA inclusa em todos os planos',
          text: 'Todos os planos do Tarefus contam com cotas generosas de criação por IA para você e sua equipe usarem sem receio.',
        },
      },
    ],
    cta: {
      title: 'Experimente a criação de tarefas com IA na prática',
      description: 'Dite ou digite suas tarefas em linguagem natural. Teste o Tarefus grátis por 14 dias sem cartão de crédito.',
      buttonText: 'Criar Tarefas com IA Agora',
      targetUrl: '/planos',
    },
  },

  // 7. Reunião Diária de 10 Minutos: Como Fazer o Alinhamento Perfeito com a Equipe
  {
    id: 'art-7',
    slug: 'reuniao-diaria-alinhamento-equipe',
    title: 'Reunião Diária de 10 Minutos: Como Fazer o Alinhamento Perfeito com a Equipe',
    subtitle:
      'O roteiro de 3 perguntas para a reunião matinal (Daily Standup) adaptado para PMEs: mantenha o time sincronizado sem reuniões intermináveis.',
    category: 'Rotinas de Equipe & Comunicação',
    categoryKey: 'rotinas-equipe',
    tags: ['reunioes-diarias', 'alinhamento', 'trabalho-hibrido', 'produtividade', 'rotinas'],
    readTimeMinutes: 5,
    funnelStage: 'MoFu',
    targetAudience: 'Gerentes de operações, supervisores e líderes de pequenas equipes ágeis',
    primaryKeyword: 'reuniao diaria de alinhamento',
    publishedAt: '2026-08-21',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.beatriz,
    summary:
      'Aprenda como estruturar a reunião diária de 10 minutos (Daily) usando o quadro Kanban como centro visual, eliminando a reunionite e acelerando a resolução de bloqueios.',
    coverIcon: 'Clock3',
    tableOfContents: [
      { id: 'o-mal-da-reunionite', title: 'O Mal da "Reunionite" nas Empresas', level: 2 },
      { id: 'anatomia-daily-10-minutos', title: 'A Anatomia da Daily de 10 Minutos', level: 2 },
      { id: 'tres-perguntas-fundamentais', title: 'As 3 Perguntas Obrigatórias', level: 2 },
      { id: 'quadro-centro-atencoes', title: 'O Quadro Visual Como Centro das Atenções', level: 2 },
      { id: 'impedimentos-fora-reuniao', title: 'A Regra de Ouro: Bloqueios se Resolvem Fora da Daily', level: 2 },
    ],
    sections: [
      {
        id: 'o-mal-da-reunionite',
        title: 'O Mal da "Reunionite" nas Empresas',
        content: [
          'Pesquisas de produtividade mostram que profissionais gastam em média 31 horas por mês em reuniões improdutivas. Reuniões longas, sem pauta definida e que começam com conversas paralelas drenam a energia criativa da equipe e atrasam as entregas reais.',
          'A reunião diária de alinhamento (inspirada no rito Daily Scrum) não foi feita para debater estratégias de 5 anos, mas para sincronizar o dia em no máximo 10 a 15 minutos.',
        ],
      },
      {
        id: 'anatomia-daily-10-minutos',
        title: 'A Anatomia da Daily de 10 Minutos',
        content: [
          'Para garantir que a reunião seja realmente rápida e eficiente, adote regras simples:',
          '- **Mesmo horário todos os dias:** Preferencialmente no início da manhã (ex: 09h00 ou 09h15).',
          '- **Reunião em pé (ou objetiva no vídeo):** Ficar em pé fisicamente estimula a concisão e desencoraja discursos prolixos.',
          '- **Tempo limite rígido:** Cada participante fala no máximo 1 a 2 minutos.',
        ],
        tips: [
          'Comece rigorosamente no horário marcado, mesmo que alguém esteja atrasado. Isso constrói pontualidade cultural.',
        ],
      },
      {
        id: 'tres-perguntas-fundamentais',
        title: 'As 3 Perguntas Obrigatórias',
        content: [
          'Cada membro da equipe deve responder apenas a 3 perguntas objetivas:',
          '1. **O que eu concluí ontem** que ajudou o time a avançar?',
          '2. **O que eu vou fazer hoje** para cumprir os prazos da semana?',
          '3. **Existe algum impedimento ou bloqueio** no meu caminho que exige ajuda?',
        ],
      },
      {
        id: 'quadro-centro-atencoes',
        title: 'O Quadro Visual Como Centro das Atenções',
        content: [
          'Projete o quadro do Tarefus na TV da sala de reuniões ou compartilhe a tela na chamada de vídeo. Conforme o colaborador fala, os cartões da coluna "Em Andamento" são atualizados ou movidos para "Concluído".',
          'Isso elimina a necessidade de redigir atas de reunião ou relatórios de status paralelos: o próprio sistema é o reflexo da verdade.',
        ],
      },
      {
        id: 'impedimentos-fora-reuniao',
        title: 'A Regra de Ouro: Bloqueios se Resolvem Fora da Daily',
        content: [
          'Se alguém relatar um impedimento técnico complexo (ex: "O servidor de pagamentos está instável"), o líder deve anotar o ponto e dizer: "Perfeito, Diogo e Carlos se alinham imediatamente após a daily para resolver isso".',
          'Nunca prenda as outras 8 pessoas da equipe ouvindo uma discussão técnica que diz respeito a apenas duas delas.',
        ],
        callout: {
          type: 'tip',
          title: 'Daily integrada no Tarefus',
          text: 'Abra o quadro do seu setor no Tarefus durante a reunião matinal e mantenha toda a empresa sincronizada sem enrolação.',
        },
      },
    ],
    cta: {
      title: 'Transforme suas reuniões em 10 minutos de pura ação',
      description: 'Abra seu quadro visual no Tarefus e alinhe a equipe sem perda de tempo. Teste 14 dias grátis sem cartão.',
      buttonText: 'Sincronizar Minha Equipe',
      targetUrl: '/planos',
    },
  },

  // 8. Como Criar Checklists Eficientes para Padronizar Processos na Sua Empresa
  {
    id: 'art-8',
    slug: 'checklists-padronizacao-processos',
    title: 'Como Criar Checklists Eficientes para Padronizar Processos na Sua Empresa',
    subtitle:
      'A diferença entre tarefas e etapas de processo; como subtarefas evitam retrabalho no onboarding de clientes, fechamento financeiro e entregas.',
    category: 'Gestão de Tarefas & Prazos',
    categoryKey: 'gestao-tarefas-prazos',
    tags: ['checklists', 'processos', 'organizacao', 'padronizacao', 'qualidade'],
    readTimeMinutes: 5,
    funnelStage: 'MoFu',
    targetAudience: 'Gestores que sofrem com erros operacionais recorrentes e retrabalho',
    primaryKeyword: 'checklists para empresas',
    publishedAt: '2026-08-22',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.diogo,
    summary:
      'Entenda como checklists simples reduzem falhas humanas, garantem qualidade padrão em todas as entregas e tornam a integração de novos funcionários 3x mais rápida.',
    coverIcon: 'CheckCheck',
    tableOfContents: [
      { id: 'licao-aviacao-medicina', title: 'A Lição da Aviação e da Medicina', level: 2 },
      { id: 'tarefa-vs-subtarefa', title: 'A Diferença Entre Tarefa Macro e Etapa (Checklist)', level: 2 },
      { id: 'tres-processos-chave', title: '3 Processos Empresariais que Exigem Checklists Imediatos', level: 2 },
      { id: 'boas-praticas-redacao', title: 'Boas Práticas para Redigir Itens de Verificação', level: 2 },
      { id: 'checklists-com-ia', title: 'Gerando Checklists Inteligentes em 1 Clique com IA', level: 2 },
    ],
    sections: [
      {
        id: 'licao-aviacao-medicina',
        title: 'A Lição da Aviação e da Medicina',
        content: [
          'No clássico livro "O Efeito Checklist", o cirurgião Atul Gawande demonstra como a introdução de uma lista de verificação simples de 90 segundos nas salas cirúrgicas reduziu pela metade as complicações médicas e mortes em hospitais do mundo inteiro.',
          'Pilotos de aviação com 20 anos de experiência também nunca decolam sem seguir o checklist passo a passo. Se até os profissionais mais treinados do planeta dependem de checklists para não cometer falhas por cansaço ou distração, por que a sua equipe deveria confiar apenas na memória para emitir notas fiscais ou entregar projetos?',
        ],
      },
      {
        id: 'tarefa-vs-subtarefa',
        title: 'A Diferença Entre Tarefa Macro e Etapa (Checklist)',
        content: [
          'Um dos erros mais comuns de organização é criar um único cartão genérico com o título "Ativar Novo Cliente" sem detalhar as etapas necessárias.',
          'A tarefa macro representa o objetivo final. O checklist interno representa a sequência lógica de micro-entregas necessárias para alcançar esse objetivo sem esquecer detalhes cruciais.',
        ],
        tips: [
          'Subtarefas em checklist funcionam como um mapa visual que qualquer membro da equipe pode assumir em caso de emergência ou ausência.',
        ],
      },
      {
        id: 'tres-processos-chave',
        title: '3 Processos Empresariais que Exigem Checklists Imediatos',
        content: [
          '1. **Onboarding de Novo Cliente:** Coletar dados cadastrais, criar contrato, emitir primeira fatura, configurar acessos no sistema e agendar reunião de boas-vindas.',
          '2. **Fechamento Financeiro Mensal:** Conciliar extrato bancário, verificar notas fiscais pendentes, calcular comissões e enviar documentação para a contabilidade.',
          '3. **Entrega de Pedido / Serviço:** Revisar itens do pedido, embalar com etiqueta de envio, emitir código de rastreio e disparar aviso de entrega para o cliente.',
        ],
      },
      {
        id: 'boas-praticas-redacao',
        title: 'Boas Práticas para Redigir Itens de Verificação',
        content: [
          '- Inicie cada item com um verbo de ação no infinitivo (ex: "Verificar CNPJ", "Anexar comprovante", "Enviar e-mail de confirmação").',
          '- Seja específico: evite itens vagos como "Conferir tudo". Prefira "Conferir se o valor da NF coincide com o pedido de compra".',
          '- Mantenha listas com entre 4 e 8 itens por tarefa para não tornar a checagem exaustiva.',
        ],
      },
      {
        id: 'checklists-com-ia',
        title: 'Gerando Checklists Inteligentes em 1 Clique com IA',
        content: [
          'No Tarefus, ao criar uma nova tarefa, a inteligência artificial do Google Gemini sugere instantaneamente o checklist recomendado para aquele tipo de demanda, economizando tempo e garantindo conformidade com as melhores práticas de mercado.',
        ],
        callout: {
          type: 'tip',
          title: 'Acompanhamento por barra de progresso',
          text: 'No Tarefus, cada item marcado no checklist atualiza automaticamente uma barra visual de progresso de 0 a 100% no cartão da tarefa.',
        },
      },
    ],
    cta: {
      title: 'Padronize seus processos e acabe com os erros de entrega',
      description: 'Crie tarefas com checklists inteligentes no Tarefus e mantenha o padrão de excelência da sua empresa.',
      buttonText: 'Criar Checklists no Tarefus',
      targetUrl: '/planos',
    },
  },

  // 9. Gestão de Tarefas por Setor: Como Organizar Financeiro, Vendas e Operação no Mesmo Lugar
  {
    id: 'art-9',
    slug: 'gestao-tarefas-por-setor-empresa',
    title: 'Gestão de Tarefas por Setor: Como Organizar Financeiro, Vendas e Operação no Mesmo Lugar',
    subtitle:
      'Como estruturar múltiplos quadros por área com permissões específicas para cada equipe ver o que precisa sem poluição visual.',
    category: 'Liderança & Delegação',
    categoryKey: 'lideranca-delegacao',
    tags: ['gestao-de-equipes', 'quadros-por-area', 'lideranca', 'organizacao', 'governanca'],
    readTimeMinutes: 6,
    funnelStage: 'MoFu',
    targetAudience: 'Sócios, diretores gerais e gerentes buscando visão macro da empresa',
    primaryKeyword: 'gestao de tarefas por departamento',
    publishedAt: '2026-08-23',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.beatriz,
    summary:
      'Aprenda como estruturar múltiplos quadros por departamento, configurar papéis de acesso (Admin, Gestor, Membro) e integrar a passagem de bastão entre setores.',
    coverIcon: 'Network',
    tableOfContents: [
      { id: 'perigo-quadro-unico', title: 'O Perigo do Quadro Único Poluído', level: 2 },
      { id: 'arquitetura-quadros-setor', title: 'Arquitetura de Quadros por Setor da Empresa', level: 2 },
      { id: 'governanca-permissoes', title: 'Governança e Níveis de Acesso (RBAC)', level: 2 },
      { id: 'passagem-de-bastao', title: 'A Passagem de Bastão Entre Vendas e Operação', level: 2 },
      { id: 'visao-consolidada-diretoria', title: 'A Visão Consolidada da Diretoria em Tempo Real', level: 2 },
    ],
    sections: [
      {
        id: 'perigo-quadro-unico',
        title: 'O Perigo do Quadro Único Poluído',
        content: [
          'Quando uma pequena empresa começa a usar um software de gestão, a tentação inicial é colocar todas as tarefas de todos os funcionários em um único quadro gigante.',
          'Em poucas semanas, o financeiro fica incomodado com dezenas de cartões de propostas de vendas, a equipe de marketing não encontra seus prazos editoriais e os diretores não conseguem enxergar prioridades. Esse excesso de ruído visual faz com que as pessoas abandonem a ferramenta.',
        ],
      },
      {
        id: 'arquitetura-quadros-setor',
        title: 'Arquitetura de Quadros por Setor da Empresa',
        content: [
          'A melhor prática é criar quadros independentes e temáticos para cada área fundamental da empresa:',
          '- 💼 **Quadro Comercial & Vendas:** Pipeline de negociações e propostas.',
          '- ⚙️ **Quadro Operações & Entregas:** Execução dos serviços e atendimento a clientes.',
          '- 💰 **Quadro Financeiro & Administrativo:** Contas a pagar/receber, emissão de NFs e compras.',
          '- 🚀 **Quadro Marketing & Crescimento:** Produção de conteúdo, anúncios e eventos.',
          '- 👥 **Quadro RH & Gestão de Pessoas:** Recrutamento, férias e treinamentos.',
        ],
        tips: [
          'Personalize cada quadro com cores e ícones distintos para que os membros identifiquem sua área instantaneamente.',
        ],
      },
      {
        id: 'governanca-permissoes',
        title: 'Governança e Níveis de Acesso (RBAC)',
        content: [
          'Nem todos os colaboradores precisam (ou devem) visualizar dados sensíveis como extratos financeiros ou negociações salariais. Uma boa estrutura de governança divide os usuários em 3 papéis claros:',
          '1. **Administrador:** Acesso total a configurações, faturamento, membros e todos os quadros da organização.',
          '2. **Gestor:** Pode criar e gerenciar tarefas, quadros e convidar membros dentro da sua área de atuação.',
          '3. **Membro / Colaborador:** Focado na visualização e execução das tarefas atribuídas a ele ou ao seu setor.',
        ],
      },
      {
        id: 'passagem-de-bastao',
        title: 'A Passagem de Bastão Entre Vendas e Operação',
        content: [
          'O ponto mais crítico de atrito nas PMEs ocorre quando uma venda é fechada e precisa ser entregue pela equipe operacional. Sem um processo claro, a operação reclama que não recebeu os dados do cliente e o cliente reclama de demora no início do serviço.',
          'No Tarefus, assim que o cartão de venda atinge a coluna "Fechado / Ganho", cria-se uma tarefa vinculada no quadro de Operações com todo o briefing anexado, garantindo uma transição impecável.',
        ],
      },
      {
        id: 'visao-consolidada-diretoria',
        title: 'A Visão Consolidada da Diretoria em Tempo Real',
        content: [
          'Com múltiplos quadros organizados, a liderança executiva pode navegar entre as áreas em 1 clique ou usar filtros globais para inspecionar gargalos de qualquer departamento sem interromper ninguém com reuniões de status.',
        ],
        callout: {
          type: 'tip',
          title: 'Quadros para toda a sua empresa',
          text: 'O plano Crescimento do Tarefus inclui até 20 quadros e o plano Escala oferece quadros ilimitados para organizar todos os seus setores.',
        },
      },
    ],
    cta: {
      title: 'Organize todos os setores da sua empresa no mesmo sistema',
      description: 'Crie quadros dedicados para Vendas, Operação e Financeiro no Tarefus com 14 dias de teste grátis sem cartão.',
      buttonText: 'Estruturar Meus Quadros',
      targetUrl: '/planos',
    },
  },

  // 10. Trello vs. Asana vs. Tarefus: Qual a Melhor Ferramenta para Pequenas Empresas no Brasil?
  {
    id: 'art-10',
    slug: 'trello-vs-asana-vs-tarefus-comparativo',
    title: 'Trello vs. Asana vs. Tarefus: Qual a Melhor Ferramenta para Pequenas Empresas no Brasil?',
    subtitle:
      'Comparativo honesto de recursos, facilidade de uso, suporte em português, cobrança em Reais por empresa vs. cobrança em dólar por usuário individual.',
    category: 'Métodos Ágeis para PMEs',
    categoryKey: 'metodos-ageis',
    tags: ['comparativo', 'trello', 'asana', 'gestao-tarefas', 'saas-brasil'],
    readTimeMinutes: 8,
    funnelStage: 'BoFu',
    targetAudience: 'Tomadores de decisão comparando opções de contratação de software de gestão',
    primaryKeyword: 'trello vs asana brasil',
    publishedAt: '2026-08-24',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.diogo,
    summary:
      'Uma análise aprofundada dos pontos fortes e limitações de Trello, Asana e Tarefus, com comparativo de custos reais em Reais, impacto do IOF e suporte para o mercado brasileiro.',
    coverIcon: 'Scale',
    tableOfContents: [
      { id: 'panorama-mercado', title: 'O Panorama dos Gerenciadores de Tarefas no Brasil', level: 2 },
      { id: 'analise-trello', title: 'Análise do Trello: Simplicidade vs. Limitações de Escala', level: 2 },
      { id: 'analise-asana', title: 'Análise do Asana: Recursos Avançados vs. Complexidade e Custo', level: 2 },
      { id: 'posicionamento-tarefus', title: 'O Posicionamento do Tarefus: Feito Sob Medida para PMEs Brasileiras', level: 2 },
      { id: 'tabela-comparativa', title: 'Tabela Comparativa Direta (Recursos, Moeda e Faturas)', level: 2 },
      { id: 'veredito-escolha', title: 'Veredito: Qual a Escolha Certa para Sua Empresa Hoje?', level: 2 },
    ],
    sections: [
      {
        id: 'panorama-mercado',
        title: 'O Panorama dos Gerenciadores de Tarefas no Brasil',
        content: [
          'Escolher o gerenciador de tarefas correto é uma das decisões mais estratégicas para a produtividade e a saúde financeira de uma pequena empresa. Uma ferramenta muito simples se torna insuficiente quando a equipe cresce; uma ferramenta excessivamente complexa é abandonada pelos colaboradores na primeira semana.',
          'Além disso, no Brasil há um componente crítico quase sempre ignorado nos comparativos internacionais: o modelo de cobrança em moeda estrangeira (dólar) cobrado por assento individual (per-seat), que encarece desproporcionalmente o software e sujeita a empresa a variações cambiais e IOF.',
        ],
      },
      {
        id: 'analise-trello',
        title: 'Análise do Trello: Simplicidade vs. Limitações de Escala',
        content: [
          '- **Pontos Fortes:** O Trello é pioneiro no conceito visual de Kanban. É fácil de usar e muito intuitivo para uso pessoal ou microtimes de 2 pessoas.',
          '- **Limitações:** O Trello se torna limitado quando a empresa precisa de controle de permissões por área, histórico longo de auditoria e automação nativa com IA em português sem precisar instalar dezenas de "Power-Ups" pagos à parte.',
          '- **Preço:** Cobrado em dólares (a partir de US$ 5,00 por usuário/mês no plano Standard), totalizando cerca de R$ 380/mês para 12 pessoas.',
        ],
      },
      {
        id: 'analise-asana',
        title: 'Análise do Asana: Recursos Avançados vs. Complexidade e Custo',
        content: [
          '- **Pontos Fortes:** Excelente para grandes corporações com centenas de funcionários que exigem diagramas de Gantt avançados e dependências complexas de tarefas.',
          '- **Limitações:** Interface pesada com curvas de aprendizado íngremes que exigem semanas de treinamento da equipe. O suporte é majoritariamente em inglês.',
          '- **Preço:** Extremamente elevado para o padrão brasileiro. O plano Starter custa US$ 13,49 por usuário/mês. Para 12 colaboradores, a fatura ultrapassa **R$ 1.000 por mês** no cartão de crédito.',
        ],
      },
      {
        id: 'posicionamento-tarefus',
        title: 'O Posicionamento do Tarefus: Feito Sob Medida para PMEs Brasileiras',
        content: [
          'O Tarefus nasceu para unir o melhor dos dois mundos: a simplicidade visual e fluida do Kanban com recursos poderosos de inteligência artificial nativa em português (Gemini) e gestão por setores.',
          'O grande diferencial é a política comercial: cobrança com **preço fixo em Reais por empresa**, com faixas generosas de colaboradores inclusos, emissão de Nota Fiscal automática e sem custos por assento extra.',
        ],
        tips: [
          'No Tarefus, você coloca estagiários, terceirizados e lideranças no mesmo sistema sem ver sua fatura mensal disparar.',
        ],
      },
      {
        id: 'tabela-comparativa',
        title: 'Tabela Comparativa Direta (Recursos, Moeda e Faturas)',
        content: [
          '| Critério de Comparação | Trello | Asana | Tarefus |\n' +
          '|---|---|---|---|\n' +
          '| **Moeda de Cobrança** | Dólar americano (USD) | Dólar americano (USD) | **100% em Reais (R$)** |\n' +
          '| **Modelo de Faturamento** | Por usuário individual | Por usuário individual | **Por empresa com pacote** |\n' +
          '| **Custo p/ 12 pessoas** | ~R$ 380/mês + IOF | ~R$ 1.020/mês + IOF | **R$ 139/mês fixo** |\n' +
          '| **Incidência de IOF (5%)** | ⚠️ Sim (Cartão Int.) | ⚠️ Sim (Cartão Int.) | **🚫 Não (Nacional)** |\n' +
          '| **Nota Fiscal (NFS-e)** | Difícil / Burocrático | Difícil / Burocrático | **✅ Automática no CNPJ** |\n' +
          '| **IA Nativa por Voz em PT** | ❌ Não | ❌ Não | **✅ Sim (Gemini)** |\n' +
          '| **Suporte em Português** | E-mail traduzido | Fórum em inglês | **✅ WhatsApp e Chat BR** |',
        ],
      },
      {
        id: 'veredito-escolha',
        title: 'Veredito: Qual a Escolha Certa para Sua Empresa Hoje?',
        content: [
          'Se você lidera uma pequena ou média empresa brasileira (5 a 35 pessoas) e busca uma ferramenta rápida, inteligente, com suporte local e custo previsível em Reais, o Tarefus é a escolha que oferece o melhor retorno sobre o investimento.',
        ],
        callout: {
          type: 'tip',
          title: 'Migração descomplicada',
          text: 'Você pode importar e criar seus quadros no Tarefus em menos de 1 tarde com o apoio da nossa equipe.',
        },
      },
    ],
    cta: {
      title: 'Experimente a melhor alternativa brasileira ao Trello e Asana',
      description: 'Faça o teste grátis de 14 dias no Tarefus e veja na prática a diferença na produtividade da sua equipe.',
      buttonText: 'Testar Tarefus Grátis',
      targetUrl: '/planos',
    },
  },

  // 11. Quanto Custa um Gerenciador de Tarefas? A Armadilha da Cobrança por Usuário
  {
    id: 'art-11',
    slug: 'quanto-custa-gerenciador-tarefas-brasil',
    title: 'Quanto Custa um Gerenciador de Tarefas? A Armadilha da Cobrança por Usuário',
    subtitle:
      'Simulação detalhada de faturas anuais com IOF, o impacto de novas contratações e por que o preço fixo por empresa economiza milhares de reais.',
    category: 'IA & Produtividade no Trabalho',
    categoryKey: 'ia-produtividade',
    tags: ['precos', 'custo-software', 'planejamento-financeiro', 'economia', 'saas'],
    readTimeMinutes: 7,
    funnelStage: 'BoFu',
    targetAudience: 'Diretores financeiros, controllers e empresários calculando custos de software',
    primaryKeyword: 'preço gerenciador de tarefas',
    publishedAt: '2026-08-25',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.carlos,
    summary:
      'Uma análise financeira completa sobre os custos ocultos do modelo per-seat em dólar (IOF, variação cambial, spread) e como o modelo por empresa do Tarefus economiza até R$ 8.000 por ano.',
    coverIcon: 'Coins',
    tableOfContents: [
      { id: 'matematica-oculta', title: 'A Matemática Oculta do Modelo Por Usuário (Per-Seat)', level: 2 },
      { id: 'peso-iof-cambio', title: 'O Peso do IOF e da Variação Cambial no Orçamento', level: 2 },
      { id: 'efeitos-colaterais-perigosos', title: 'Os Efeitos Colaterais Operacionais do Custo Por Assento', level: 2 },
      { id: 'simulacao-12-meses', title: 'Simulação Financeira Real em 12 Meses (5, 12 e 25 Colaboradores)', level: 2 },
      { id: 'vantagem-nf-brasileira', title: 'A Vantagem Fiscal da Nota Fiscal de Serviço (NFS-e)', level: 2 },
      { id: 'modelo-previsivel-tarefus', title: 'O Modelo Previsível do Tarefus: Até R$ 8.000 de Economia Anual', level: 2 },
    ],
    sections: [
      {
        id: 'matematica-oculta',
        title: 'A Matemática Oculta do Modelo Por Usuário (Per-Seat)',
        content: [
          'Quando você entra na página de preços de um software SaaS estrangeiro, o valor parece inofensivo: "Apenas $10 por usuário/mês". No entanto, para uma empresa brasileira com 15 colaboradores, a conta real é assustadora:',
          '15 usuários × US$ 10 = US$ 150/mês. Com o dólar a R$ 5,60 + IOF de 4,38% do cartão corporativo + spread bancário de 4%, essa fatura chega a aproximadamente **R$ 910 por mês**, totalizando quase **R$ 11.000 por ano**.',
        ],
      },
      {
        id: 'peso-iof-cambio',
        title: 'O Peso do IOF e da Variação Cambial no Orçamento',
        content: [
          'O maior inimigo do planejamento financeiro é a imprevisibilidade. Quando o dólar sobe, a fatura de software da empresa sobe automaticamente, sem que o negócio tenha contratado nenhum recurso adicional.',
          'Além disso, o IOF sobre compras internacionais não gera crédito tributário para a empresa, representando custo puro perdido no fechamento contábil.',
        ],
        tips: [
          'Softwares faturados no Brasil em Reais garantem estabilidade total no fluxo de caixa do seu departamento financeiro.',
        ],
      },
      {
        id: 'efeitos-colaterais-perigosos',
        title: 'Os Efeitos Colaterais Operacionais do Custo Por Assento',
        content: [
          'O modelo per-seat induz comportamentos operacionais perigosos nas empresas:',
          '- **Compartilhamento de senhas:** Dois ou três funcionários usando o mesmo login de administrador, destruindo os logs de auditoria e a segurança da informação.',
          '- **Exclusão de colaboradores:** Estagiários e operadores de chão de fábrica ficam de fora do sistema por economia, recorrendo a planilhas paralelas e WhatsApp.',
          '- **Medo de contratar:** Cada nova contratação na empresa é vista como uma nova penalidade na fatura de TI.',
        ],
      },
      {
        id: 'simulacao-12-meses',
        title: 'Simulação Financeira Real em 12 Meses (5, 12 e 25 Colaboradores)',
        content: [
          'Veja o comparativo de gastos anuais em ferramentas internacionais vs. o plano anual do Tarefus:',
          '- **Para 5 Colaboradores:**\n  - Concorrente USD (~US$ 10/user): ~R$ 3.360/ano\n  - Tarefus Plano Equipe: **R$ 660/ano** *(Economia de R$ 2.700/ano)*\n\n' +
          '- **Para 12 Colaboradores:**\n  - Concorrente USD (~US$ 12/user): ~R$ 9.670/ano\n  - Tarefus Plano Crescimento: **R$ 1.308/ano** *(Economia de R$ 8.362/ano)*\n\n' +
          '- **Para 25 Colaboradores:**\n  - Concorrente USD (~US$ 12/user): ~R$ 20.160/ano\n  - Tarefus Plano Escala: **R$ 2.580/ano** *(Economia de R$ 17.580/ano)*',
        ],
      },
      {
        id: 'vantagem-nf-brasileira',
        title: 'A Vantagem Fiscal da Nota Fiscal de Serviço (NFS-e)',
        content: [
          'Contratar um software nacional permite a emissão de Nota Fiscal de Serviço (NFS-e) emitida no seu CNPJ, facilitando a escrituração contábil, permitindo deduções tributárias legais e evitando transtornos com a Receita Federal na comprovação de despesas internacionais.',
        ],
      },
      {
        id: 'modelo-previsivel-tarefus',
        title: 'O Modelo Previsível do Tarefus: Até R$ 8.000 de Economia Anual',
        content: [
          'Com o Tarefus você investe um valor fixo e previsível em Reais, inclui toda a equipe e aproveita a melhor tecnologia de IA sem sustos no fim do mês.',
        ],
        callout: {
          type: 'tip',
          title: 'Calculadora de economia em tempo real',
          text: 'Acesse nossa página de planos e use a calculadora interativa para simular o valor exato que sua empresa economizará ao migrar para o Tarefus.',
        },
      },
    ],
    cta: {
      title: 'Calcule a economia da sua empresa e troque o dólar pelo Tarefus',
      description: 'Preço fixo em Reais, sem cobrança por usuário e 14 dias de teste grátis sem cartão de crédito.',
      buttonText: 'Ver Planos e Simular Economia',
      targetUrl: '/planos',
    },
  },

  // 12. Guia Rápido de Migração: Como Sair de Planilhas e do WhatsApp para o Tarefus em 1 Tarde
  {
    id: 'art-12',
    slug: 'como-migrar-planilhas-para-tarefus',
    title: 'Guia Rápido de Migração: Como Sair de Planilhas e do WhatsApp para o Tarefus em 1 Tarde',
    subtitle:
      'O passo a passo de 4 etapas para transferir pendências, engajar a equipe no primeiro dia e evitar resistência à mudança.',
    category: 'Rotinas de Equipe & Comunicação',
    categoryKey: 'rotinas-equipe',
    tags: ['migracao', 'planilhas', 'onboarding', 'implantacao', 'mudanca-cultural'],
    readTimeMinutes: 6,
    funnelStage: 'BoFu',
    targetAudience: 'Gestores prontos para a transição digital mas preocupados com atritos na equipe',
    primaryKeyword: 'migrar planilhas para gerenciador tarefas',
    publishedAt: '2026-08-26',
    updatedAt: '2026-09-01',
    author: GUIDE_AUTHORS.diogo,
    summary:
      'Um roteiro prático e acolhedor para fazer a transição de planilhas do Excel e grupos de WhatsApp para o Tarefus em poucas horas, garantindo 100% de adesão dos colaboradores.',
    coverIcon: 'ArrowRightLeft',
    tableOfContents: [
      { id: 'superando-resistencia', title: 'Superando a Resistência à Mudança na Equipe', level: 2 },
      { id: 'etapa-1-faxina-previa', title: 'Etapa 1: A Faxina Prévia das Planilhas Antigas', level: 2 },
      { id: 'etapa-2-criando-quadros', title: 'Etapa 2: Criando os Quadros e Convidando os Membros', level: 2 },
      { id: 'etapa-3-alimentando-ia', title: 'Etapa 3: Alimentando as Primeiras Tarefas com IA', level: 2 },
      { id: 'etapa-4-reuniao-lancamento', title: 'Etapa 4: A Reunião de 15 Minutos de Lançamento', level: 2 },
      { id: 'garantindo-disciplina', title: 'Como Garantir a Disciplina nos Primeiros 14 Dias', level: 2 },
    ],
    sections: [
      {
        id: 'superando-resistencia',
        title: 'Superando a Resistência à Mudança na Equipe',
        content: [
          'O ser humano é naturalmente apegado aos seus hábitos. Quando um gestor anuncia "vamos adotar um novo sistema", a reação imediata de muitos colaboradores é o receio: "Será que é difícil de usar?", "Vou gastar mais tempo preenchendo isso do que trabalhando?".',
          'Por isso, a migração não deve ser apresentada como uma ferramenta de vigilância, mas como um aliado que vai eliminar a cobrança chata, organizar o dia e evitar mensagens de trabalho fora do horário comercial.',
        ],
      },
      {
        id: 'etapa-1-faxina-previa',
        title: 'Etapa 1: A Faxina Prévia das Planilhas Antigas',
        content: [
          'Não tente transferir tudo o que está nas suas planilhas antigas. Planilhas acumulam tarefas de 2 anos atrás que já perderam o sentido.',
          'Faça uma triagem rápida: transfira apenas o que está ativo no momento ou o que vence nas próximas 3 semanas. Começar com um quadro limpo e objetivo traz leveza e motivação para o time.',
        ],
        tips: [
          'Menos é mais: comece transferindo no máximo 10 a 15 tarefas prioritárias por setor no primeiro dia.',
        ],
      },
      {
        id: 'etapa-2-criando-quadros',
        title: 'Etapa 2: Criando os Quadros e Convidando os Membros',
        content: [
          'No Tarefus, crie de 2 a 4 quadros principais (ex: Vendas, Operações, Administrativo). Em seguida, acesse as configurações e envie os convites por e-mail para todos os colaboradores.',
          'O cadastro do colaborador é instantâneo: ele clica no link recebido, define seu nome e já cai direto na visualização do seu quadro.',
        ],
      },
      {
        id: 'etapa-3-alimentando-ia',
        title: 'Etapa 3: Alimentando as Primeiras Tarefas com IA',
        content: [
          'Em vez de digitar manualmente cada campo, use a IA do Tarefus: copie uma linha da sua planilha ou dite um áudio rápido e deixe a inteligência artificial estruturar o cartão com título, responsável, prazo e checklist de subtarefas em segundos.',
        ],
      },
      {
        id: 'etapa-4-reuniao-lancamento',
        title: 'Etapa 4: A Reunião de 15 Minutos de Lançamento',
        content: [
          'Reúna toda a equipe para uma apresentação rápida de 15 minutos:',
          '1. Mostre onde fica o quadro do setor.',
          '2. Demonstre como arrastar um cartão de "A Fazer" para "Em Andamento" e depois "Concluído".',
          '3. Ensine a usar a aba "Minhas Tarefas" para focar no trabalho do dia.',
          '4. Deixe claro que a partir daquele momento todos os novos pedidos devem ser registrados ali.',
        ],
      },
      {
        id: 'garantindo-disciplina',
        title: 'Como Garantir a Disciplina nos Primeiros 14 Dias',
        content: [
          'A postura da liderança nos primeiros 14 dias é decisiva. Quando alguém pedir uma tarefa pelo WhatsApp, o líder deve responder gentilmente: "Excelente, pode registrar no Tarefus para definirmos o prazo?". Em menos de duas semanas o hábito estará 100% enraizado na cultura da empresa.',
        ],
        callout: {
          type: 'tip',
          title: 'Tour guiado interativo',
          text: 'O Tarefus possui um tour interativo integrado que ensina cada membro da sua equipe a utilizar a plataforma em menos de 3 minutos.',
        },
      },
    ],
    cta: {
      title: 'Migre sua equipe para o Tarefus em apenas 1 tarde',
      description: 'Deixe as planilhas para trás e comece seus 14 dias de teste grátis com suporte completo no Tarefus.',
      buttonText: 'Começar Migração Grátis',
      targetUrl: '/planos',
    },
  },
];

// Funções utilitárias e de busca do catálogo editorial do Guia

export function getFeaturedArticle(): GuideArticle {
  return GUIDE_ARTICLES.find((article) => article.isFeatured) ?? GUIDE_ARTICLES[0];
}

export function getArticleBySlug(slug: string): GuideArticle | undefined {
  if (!slug) return undefined;
  const cleanSlug = slug.trim().replace(/^\/guia\//, '').replace(/^\//, '');
  return GUIDE_ARTICLES.find((article) => article.slug === cleanSlug);
}

export function getArticlesByCategory(categoryKey: GuideCategoryKey): GuideArticle[] {
  return GUIDE_ARTICLES.filter((article) => article.categoryKey === categoryKey);
}

export function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit: number = 3
): GuideArticle[] {
  const current = getArticleBySlug(currentSlug);
  const currentId = current?.id;

  // Primeiro busca outros artigos da mesma categoria
  const sameCategory = GUIDE_ARTICLES.filter(
    (a) => a.id !== currentId && (a.category === category || a.categoryKey === current?.categoryKey)
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Se faltar para completar o limit, complementa com outros artigos populares
  const otherArticles = GUIDE_ARTICLES.filter(
    (a) => a.id !== currentId && !sameCategory.some((sc) => sc.id === a.id)
  );

  return [...sameCategory, ...otherArticles].slice(0, limit);
}

function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function searchGuideArticles(
  query: string = '',
  categoryKey?: string,
  tag?: string
): GuideArticle[] {
  const normalizedQuery = normalizeSearchText(query.trim());

  return GUIDE_ARTICLES.filter((article) => {
    // Filtro por Categoria se especificado e não for 'all'
    if (categoryKey && categoryKey !== 'all') {
      if (article.categoryKey !== categoryKey) {
        return false;
      }
    }

    // Filtro por Tag se especificado
    if (tag && tag.trim()) {
      const normalizedTag = normalizeSearchText(tag.trim());
      const hasTag = article.tags.some((t) => normalizeSearchText(t).includes(normalizedTag));
      if (!hasTag) {
        return false;
      }
    }

    // Se não houver query de busca, passa
    if (!normalizedQuery) {
      return true;
    }

    // Busca textual com normalização de acentos em título, subtítulo, resumo, palavras-chave, tags e conteúdo das seções
    const inTitle = normalizeSearchText(article.title).includes(normalizedQuery);
    const inSubtitle = normalizeSearchText(article.subtitle).includes(normalizedQuery);
    const inSummary = normalizeSearchText(article.summary).includes(normalizedQuery);
    const inKeyword = normalizeSearchText(article.primaryKeyword).includes(normalizedQuery);
    const inTags = article.tags.some((t) => normalizeSearchText(t).includes(normalizedQuery));
    const inAuthor = normalizeSearchText(article.author.name).includes(normalizedQuery);
    const inContent = article.sections.some(
      (sec) =>
        normalizeSearchText(sec.title).includes(normalizedQuery) ||
        sec.content.some((p) => normalizeSearchText(p).includes(normalizedQuery))
    );

    return inTitle || inSubtitle || inSummary || inKeyword || inTags || inAuthor || inContent;
  });
}

export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  GUIDE_ARTICLES.forEach((article) => {
    article.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}
