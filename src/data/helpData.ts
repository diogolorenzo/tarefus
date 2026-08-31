export interface FaqItem {
  id: string;
  category: 'general' | 'tasks' | 'ai' | 'boards' | 'rbac' | 'shortcuts';
  categoryLabel: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ShortcutItem {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'tasks' | 'views' | 'system';
  categoryLabel: string;
}

export interface AiPromptExample {
  title: string;
  department: string;
  departmentColor: string;
  prompt: string;
  resultSummary: string;
  checklistItems: string[];
}

export interface TourStep {
  id: string;
  targetId: string; // DOM element id or selector
  title: string;
  description: string;
  badge: string;
  tip?: string;
  position: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'Todas as Dúvidas' },
  { id: 'tasks', label: 'Tarefas & Kanban' },
  { id: 'ai', label: 'Assistente com IA' },
  { id: 'boards', label: 'Quadros & Áreas' },
  { id: 'rbac', label: 'Cargos & Permissões' },
  { id: 'shortcuts', label: 'Atalhos & Dicas' },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'ai',
    categoryLabel: 'Assistente com IA',
    question: 'Como funciona a criação de tarefas com Inteligência Artificial e voz?',
    answer: 'Ao clicar no botão "+ Nova Tarefa" ou usar o atalho "N", a aba do Assistente de IA estará ativa. Você pode ditar no microfone ou digitar uma frase em linguagem natural (ex: "Enviar relatório financeiro para o Rodrigo até sexta-feira com checklist de validação"). O Tarefus identifica automaticamente o título, prazo, responsável, quadro correspondente e gera itens de checklist.',
    tags: ['ia', 'voz', 'microfone', 'criar tarefa', 'automação'],
  },
  {
    id: 'faq-2',
    category: 'tasks',
    categoryLabel: 'Tarefas & Kanban',
    question: 'Como mover tarefas entre as etapas do Kanban?',
    answer: 'Você pode arrastar e soltar (drag and drop) os cartões de tarefa entre as colunas "A Fazer", "Fazendo" e "Concluído". Também é possível clicar no botão de status rápido dentro do cartão ou abrir a tarefa para alterar o status diretamente.',
    tags: ['kanban', 'arrastar', 'mover', 'status', 'colunas'],
  },
  {
    id: 'faq-3',
    category: 'tasks',
    categoryLabel: 'Tarefas & Kanban',
    question: 'Posso atribuir mais de um responsável para uma mesma tarefa?',
    answer: 'Sim! O Tarefus suporta atribuição individual ou múltipla. Ao criar ou editar uma tarefa, você pode selecionar vários colaboradores da lista, permitindo que toda a equipe envolvida acompanhe a entrega.',
    tags: ['responsável', 'múltiplos', 'equipe', 'atribuição'],
  },
  {
    id: 'faq-4',
    category: 'boards',
    categoryLabel: 'Quadros & Áreas',
    question: 'Quem pode criar e gerenciar novos quadros por área?',
    answer: 'Por padrão de governança corporativa (RBAC), apenas Gestores e Administradores possuem permissão para criar, renomear ou excluir quadros da empresa. Colaboradores têm acesso de visualização e movimentação de demandas atribuídas.',
    tags: ['quadros', 'gestor', 'admin', 'permissões', 'criar quadro'],
  },
  {
    id: 'faq-5',
    category: 'rbac',
    categoryLabel: 'Cargos & Permissões',
    question: 'Qual a diferença entre Administrador, Gestor e Colaborador?',
    answer: '• Administrador: Acesso total ao sistema, configurações da empresa, gerenciamento e convite de membros, logs de auditoria e exclusões.\n• Gestor (💼): Cria e organiza quadros de áreas, gerencia fluxos de trabalho e delega tarefas.\n• Colaborador (⚡): Executa tarefas, atualiza status, marca checklists e visualiza os quadros da empresa.',
    tags: ['rbac', 'perfis', 'cargos', 'segurança', 'admin'],
  },
  {
    id: 'faq-6',
    category: 'tasks',
    categoryLabel: 'Tarefas & Kanban',
    question: 'Como funcionam os alertas de prazos e vencimentos?',
    answer: 'O sistema monitora automaticamente as datas de entrega de todas as tarefas. No topo da tela, uma faixa amarela alerta sobre tarefas vencendo hoje. No sino de notificações, você encontra a contagem de tarefas atrasadas, para hoje e para a semana, com filtros rápidos.',
    tags: ['prazos', 'vencimento', 'notificações', 'atrasadas', 'alerta'],
  },
  {
    id: 'faq-7',
    category: 'shortcuts',
    categoryLabel: 'Atalhos & Dicas',
    question: 'Existe modo escuro (Dark Mode)?',
    answer: 'Sim! Você pode alternar entre o tema claro e escuro a qualquer momento clicando no ícone de Sol/Lua na barra superior ou pressionando o atalho de teclado "D". Sua preferência fica salva automaticamente.',
    tags: ['tema', 'dark mode', 'modo escuro', 'aparência'],
  },
  {
    id: 'faq-8',
    category: 'general',
    categoryLabel: 'Geral & Conta',
    question: 'Como alterar minha senha ou recuperar acesso?',
    answer: 'Você pode alterar sua senha a qualquer momento clicando no seu avatar no canto superior direito e selecionando "Alterar Senha". Se esqueceu sua senha, na tela de login clique em "Esqueci minha senha" para gerar o código de redefinição.',
    tags: ['senha', 'segurança', 'recuperação', 'perfil'],
  },
];

export const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  {
    id: 'sc-1',
    keys: ['N'],
    description: 'Abrir modal para criar Nova Tarefa (IA / Manual)',
    category: 'tasks',
    categoryLabel: 'Gestão de Tarefas',
  },
  {
    id: 'sc-2',
    keys: ['/'],
    description: 'Focar na barra de busca de tarefas no quadro ativo',
    category: 'tasks',
    categoryLabel: 'Gestão de Tarefas',
  },
  {
    id: 'sc-3',
    keys: ['1'],
    description: 'Navegar para a visão "Quadros por Área"',
    category: 'navigation',
    categoryLabel: 'Navegação',
  },
  {
    id: 'sc-4',
    keys: ['2'],
    description: 'Navegar para a visão "Minhas Tarefas"',
    category: 'navigation',
    categoryLabel: 'Navegação',
  },
  {
    id: 'sc-5',
    keys: ['3'],
    description: 'Navegar para "Painel de Configurações"',
    category: 'navigation',
    categoryLabel: 'Navegação',
  },
  {
    id: 'sc-6',
    keys: ['?'],
    description: 'Abrir a Central de Ajuda & Atalhos',
    category: 'system',
    categoryLabel: 'Ajuda & Sistema',
  },
  {
    id: 'sc-7',
    keys: ['D'],
    description: 'Alternar entre Modo Escuro e Modo Claro',
    category: 'views',
    categoryLabel: 'Visualização',
  },
  {
    id: 'sc-8',
    keys: ['Esc'],
    description: 'Fechar modais, gavetas ou tour interativo',
    category: 'system',
    categoryLabel: 'Ajuda & Sistema',
  },
];

export const AI_PROMPT_EXAMPLES: AiPromptExample[] = [
  {
    title: 'Comercial & Vendas',
    department: 'Comercial',
    departmentColor: 'from-blue-600 to-cyan-500',
    prompt: 'Agendar reunião com o cliente Alpha amanhã às 15h com o Rodrigo para apresentar proposta de 30k e incluir checklist de apresentação, contrato e cronograma',
    resultSummary: 'Define prazo para amanhã, atribui a Rodrigo, aloca no quadro Comercial e desmembra 3 etapas no checklist.',
    checklistItems: [
      'Apresentar proposta comercial de R$ 30.000',
      'Validar minuta do contrato de prestação',
      'Definir cronograma inicial de implantação',
    ],
  },
  {
    title: 'Operações & Logística',
    department: 'Operações',
    departmentColor: 'from-emerald-600 to-teal-500',
    prompt: 'Cotar frete de 5 pallets para filial de Curitiba até sexta com a Beatriz com checklist de peso, transportadoras e seguro de carga',
    resultSummary: 'Calcula a próxima sexta-feira como vencimento, direciona para Beatriz e cria passos de cotação e seguro.',
    checklistItems: [
      'Checar cubagem e peso dos 5 pallets',
      'Consultar mínimo de 3 transportadoras',
      'Confirmar cobertura de seguro da apólice',
    ],
  },
  {
    title: 'Financeiro & Fiscal',
    department: 'Financeiro',
    departmentColor: 'from-amber-500 to-orange-500',
    prompt: 'Reconciliar faturamento do mês e emitir notas pendentes até o final da semana com o Carlos',
    resultSummary: 'Direciona ao quadro Financeiro, agenda para o fim da semana útil e cria tarefas de conferência.',
    checklistItems: [
      'Conferir extratos bancários com pedidos faturados',
      'Emitir NFS-e dos contratos vigentes',
      'Enviar espelhos aos clientes',
    ],
  },
  {
    title: 'Marketing & Conteúdo',
    department: 'Marketing',
    departmentColor: 'from-purple-600 to-pink-500',
    prompt: 'Produzir 3 postagens no LinkedIn sobre nosso novo produto com a Beatriz e agendar para próxima terça',
    resultSummary: 'Envia para Marketing, calcula a próxima terça-feira e sugere fluxo de copy, artes e aprovação.',
    checklistItems: [
      'Redigir copy dos 3 posts institucionais',
      'Criar carrosséis visuais no padrão da marca',
      'Programar agendamento na ferramenta',
    ],
  },
];

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-nav',
    targetId: 'tour-nav-tabs',
    title: 'Navegação de Visões',
    description: 'Alterne instantaneamente entre os "Quadros por Área" (visão colaborativa por departamento) e "Minhas Tarefas" (sua central individual com contador de pendências).',
    badge: 'Passo 1 de 5',
    tip: 'Use os atalhos "1" e "2" no teclado para alternar rapidamente entre as visões.',
    position: 'bottom',
  },
  {
    id: 'step-kanban',
    targetId: 'tour-kanban-board',
    title: 'Painel Kanban Interativo',
    description: 'Visualize suas atividades organizadas nas colunas "A Fazer", "Fazendo" e "Concluído". Arraste e solte os cartões facilmente para atualizar o progresso da equipe em tempo real.',
    badge: 'Passo 2 de 5',
    tip: 'Cartões exibem responsáveis, etiquetas coloridas, checklist de etapas e avisos de prazos.',
    position: 'top',
  },
  {
    id: 'step-ai',
    targetId: 'tour-new-task-btn',
    title: 'Criação com Inteligência Artificial',
    description: 'Crie tarefas em segundos! Basta ditar por voz ou digitar um texto livre. A IA do Tarefus preenche automaticamente responsável, prazo, quadro e checklist de sub-etapas.',
    badge: 'Passo 3 de 5',
    tip: 'Pressione a tecla "N" em qualquer tela para abrir a criação inteligente de tarefas.',
    position: 'bottom',
  },
  {
    id: 'step-filters',
    targetId: 'tour-filters-bar',
    title: 'Busca Rápida & Filtros',
    description: 'Localize qualquer demanda instantaneamente por palavra-chave ou filtre por colaborador específico para reuniões de alinhamento e acompanhamento 1-a-1.',
    badge: 'Passo 4 de 5',
    tip: 'Pressione "/" no teclado para focar diretamente na caixa de busca.',
    position: 'bottom',
  },
  {
    id: 'step-help-user',
    targetId: 'tour-help-user',
    title: 'Central de Ajuda, Alertas e Perfil',
    description: 'Aqui você acessa o centro de notificações de prazos, a Central de Ajuda com FAQ e atalhos, alternância de Modo Escuro e seu perfil corporativo com permissões RBAC.',
    badge: 'Passo 5 de 5',
    tip: 'Pressione "?" a qualquer momento para abrir o guia de dúvidas e atalhos rápidos.',
    position: 'bottom',
  },
];
