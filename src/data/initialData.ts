import type { Board, CompanyInfo, Task, User } from '../types';

export const INITIAL_COMPANY: CompanyInfo = {
  name: 'Tarefus Organização Ltda',
  cnpj: '12.345.678/0001-90',
  email: 'contato@empresa.com',
  phone: '(11) 98765-4321',
  segment: 'Serviços & Tecnologia',
  description: 'Ambiente central de gestão de tarefas e produtividade da equipe.',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    role: 'Vendas & Comercial',
    initials: 'AS',
    avatarColor: 'bg-emerald-500',
    isAdmin: true,
  },
  {
    id: 'user-2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@empresa.com',
    role: 'Operações & Logística',
    initials: 'CM',
    avatarColor: 'bg-blue-600',
    isAdmin: false,
  },
  {
    id: 'user-3',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@empresa.com',
    role: 'Marketing & Conteúdo',
    initials: 'BL',
    avatarColor: 'bg-violet-600',
    isAdmin: false,
  },
  {
    id: 'user-4',
    name: 'Rodrigo Souza',
    email: 'rodrigo.souza@empresa.com',
    role: 'Administrativo & Financeiro',
    initials: 'RS',
    avatarColor: 'bg-amber-600',
    isAdmin: true,
  },
  {
    id: 'user-5',
    name: 'Juliana Costa',
    email: 'juliana.costa@empresa.com',
    role: 'Atendimento & Suporte',
    initials: 'JC',
    avatarColor: 'bg-rose-500',
    isAdmin: false,
  },
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-vendas',
    name: 'Vendas',
    icon: 'TrendingUp',
    color: 'emerald',
    description: 'Propostas comerciais, reuniões com clientes e fechamentos.',
  },
  {
    id: 'board-operacoes',
    name: 'Operações',
    icon: 'Package',
    color: 'blue',
    description: 'Gestão de estoque, entregas e fornecedores.',
  },
  {
    id: 'board-marketing',
    name: 'Marketing',
    icon: 'Megaphone',
    color: 'violet',
    description: 'Campanhas, redes sociais, lançamentos e materiais gráficos.',
  },
  {
    id: 'board-admin',
    name: 'Administrativo',
    icon: 'Building2',
    color: 'amber',
    description: 'Contas a pagar, notas fiscais, contratos e RH.',
  },
];

// Helper to format date offset from today
const getDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  // VENDAS
  {
    id: 'task-1',
    title: 'Enviar proposta comercial para Cliente Beta',
    description: 'Ajustar valores com desconto de 10% acordado na reunião de ontem e enviar em PDF por e-mail.',
    boardId: 'board-vendas',
    status: 'in_progress',
    assigneeIds: ['user-1', 'user-5'], // Ana Silva e Juliana Costa
    dueDate: getDate(0), // Hoje
    checklist: [
      { id: 'c1', text: 'Revisar tabela de preços com a gerência', completed: true },
      { id: 'c2', text: 'Gerar PDF no modelo atualizado', completed: true },
      { id: 'c3', text: 'Enviar e-mail e confirmar recebimento pelo WhatsApp', completed: false },
    ],
    order: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Ligar para os 5 clientes inativos da lista de Maio',
    description: 'Oferecer as novas condições do plano semestral.',
    boardId: 'board-vendas',
    status: 'todo',
    assigneeIds: ['user-1'],
    dueDate: getDate(2),
    checklist: [
      { id: 'c4', text: 'Pegar contatos na planilha do CRM', completed: false },
      { id: 'c5', text: 'Registrar feedback no histórico', completed: false },
    ],
    order: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Fechar contrato anual com distribuidora Alpha',
    description: 'Contrato já assinado digitalmente, enviar cópia para o financeiro.',
    boardId: 'board-vendas',
    status: 'done',
    assigneeIds: ['user-1', 'user-4'], // Ana Silva e Rodrigo Souza
    dueDate: getDate(-2),
    checklist: [],
    order: 0,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },

  // OPERAÇÕES
  {
    id: 'task-4',
    title: 'Contatar transportadora para cotação de frete urgente',
    description: 'Envio para filial de Curitiba precisa ser despachado até sexta-feira.',
    boardId: 'board-operacoes',
    status: 'todo',
    assigneeIds: ['user-2', 'user-4'], // Carlos Mendes e Rodrigo Souza
    dueDate: getDate(1),
    checklist: [
      { id: 'c6', text: 'Calcular peso e cubagem das 3 caixas', completed: true },
      { id: 'c7', text: 'Comparar valores de 2 transportadoras', completed: false },
    ],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Conferência de estoque do galpão principal',
    description: 'Contagem física das caixas de embalagens para reposição do mês.',
    boardId: 'board-operacoes',
    status: 'in_progress',
    assigneeIds: ['user-2'],
    dueDate: getDate(0), // Hoje
    checklist: [
      { id: 'c8', text: 'Contar caixas tipo A', completed: true },
      { id: 'c9', text: 'Contar fitas adesivas e plástico bolha', completed: false },
      { id: 'c10', text: 'Atualizar planilha de compras', completed: false },
    ],
    order: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Troca de lâmpadas do setor de expedição',
    description: 'Manutenção realizada pelo eletricista predial.',
    boardId: 'board-operacoes',
    status: 'done',
    assigneeIds: ['user-2'],
    dueDate: getDate(-3),
    checklist: [],
    order: 1,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },

  // MARKETING
  {
    id: 'task-7',
    title: 'Criar artes dos posts da semana para o Instagram',
    description: 'Foco na nova funcionalidade de entrega rápida.',
    boardId: 'board-marketing',
    status: 'in_progress',
    assigneeIds: ['user-3', 'user-1'], // Beatriz Lima e Ana Silva
    dueDate: getDate(1),
    checklist: [
      { id: 'c11', text: 'Post 1: Carrossel explicativo', completed: true },
      { id: 'c12', text: 'Post 2: Depoimento de cliente satisfeito', completed: true },
      { id: 'c13', text: 'Post 3: Dúvidas frequentes', completed: false },
    ],
    order: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-8',
    title: 'Configurar campanha de e-mail marketing do mês',
    description: 'Disparar para a base de 1.200 clientes cadastrados.',
    boardId: 'board-marketing',
    status: 'todo',
    assigneeIds: ['user-3'],
    dueDate: getDate(4),
    checklist: [],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ADMINISTRATIVO
  {
    id: 'task-9',
    title: 'Emitir notas fiscais dos pedidos faturados ontem',
    description: 'Verificar se todos os CNPJs estão com cadastro validado na SEFAZ.',
    boardId: 'board-admin',
    status: 'todo',
    assigneeIds: ['user-4'],
    dueDate: getDate(-1), // Atrasada de exemplo!
    checklist: [
      { id: 'c14', text: 'Lote 1 (12 notas)', completed: true },
      { id: 'c15', text: 'Lote 2 (8 notas pendentes de validação)', completed: false },
    ],
    order: 3,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-10',
    title: 'Agendar pagamento de boletos de fornecedores',
    description: 'Contas de energia, internet e fornecedores de papelaria.',
    boardId: 'board-admin',
    status: 'done',
    assigneeIds: ['user-4'],
    dueDate: getDate(0),
    checklist: [
      { id: 'c16', text: 'Conferir valores no extrato', completed: true },
      { id: 'c17', text: 'Autorizar no internet banking', completed: true },
    ],
    order: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ATENDIMENTO
  {
    id: 'task-11',
    title: 'Responder tickets pendentes no suporte via WhatsApp',
    description: 'Zerar a fila de atendimento da manhã.',
    boardId: 'board-vendas',
    status: 'in_progress',
    assigneeIds: ['user-5', 'user-1'], // Juliana Costa e Ana Silva
    dueDate: getDate(0),
    checklist: [],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
