/**
 * Toda a copy da homepage pública, em um lugar só.
 * Referência: docs/commercial/01-homepage-plan.md (seções 4.1 a 4.5).
 *
 * Os componentes não contêm frases: revisar texto é editar este arquivo.
 *
 * Regra editorial herdada do plano: se não está no código do produto, não entra
 * aqui. A direção de arte mudou o enquadramento e o ritmo das seções, nunca o
 * que o Tarefus afirma fazer.
 */

export type Phase = 'waitlist' | 'trial';

/**
 * Fase 0 = lista de espera (recomendada para o lançamento, ver 9.3 do plano).
 * Fase 1 = teste aberto. Só pode ser ligada depois de R1 a R4 resolvidos.
 */
// O lançamento permanece fechado por padrão. A ativação do trial exige a
// configuração explícita da variável de ambiente após a migração multiempresa.
export const PHASE: Phase = import.meta.env.VITE_TAREFUS_LAUNCH_PHASE === 'trial' ? 'trial' : 'waitlist';

/**
 * Nove blocos, não doze seções. Os fatos entraram no herói, Papéis e Segurança
 * viraram um bloco só, e Teste e Chamada final fecham juntos: a compactação
 * existe para que o respiro que sobra caia onde significa alguma coisa.
 */
export type SectionId =
  | 'hero'
  | 'diagnostico'
  | 'comparativo'
  | 'demonstracao'
  | 'passos'
  | 'dia-a-dia'
  | 'prazos'
  | 'acessos'
  | 'perguntas'
  | 'comecar';

export interface Cta {
  label: string;
  href: string;
}

/**
 * Na fase de lista de espera o destino é o bloco de fechamento, que carrega o
 * id `lista-de-espera`. Sem essa âncora o botão principal da página não leva a
 * lugar nenhum.
 */
const WAITLIST_HREF = '#lista-de-espera';

const CTA_PRIMARY: Cta =
  PHASE === 'trial'
    ? { label: 'Começar teste grátis de 14 dias', href: '/cadastro' }
    : { label: 'Quero ser avisado quando abrir', href: WAITLIST_HREF };

const CTA_PRIMARY_SHORT: Cta =
  PHASE === 'trial'
    ? { label: 'Testar grátis', href: '/cadastro' }
    : { label: 'Quero ser avisado', href: WAITLIST_HREF };

export const home = {
  phase: PHASE,

  meta: {
    title: 'Tarefus — organize as tarefas da sua equipe com dono e prazo',
    description:
      'Quadros por área, responsável e prazo em cada tarefa e criação por IA a partir de uma frase. Teste grátis por 14 dias, sem cartão de crédito.',
  },

  header: {
    links: [
      { label: 'Recursos', href: '#dia-a-dia' },
      { label: 'Planos', href: '/planos' },
      { label: 'Guia', href: '/guia' },
    ],
    loginHref: '/entrar',
    cta: CTA_PRIMARY_SHORT,
  },

  hero: {
    headline: 'Cada tarefa com um dono e um prazo.',
    subheadline:
      'O Tarefus organiza o trabalho da sua pequena empresa em quadros por área. Descreva a tarefa por texto ou por voz: a IA sugere título, responsável, prazo e checklist — e nada é salvo antes da sua aprovação.',
    primaryCta: CTA_PRIMARY,
    secondaryCta: { label: 'Ver como funciona', href: '#demonstracao' },
    reassurance:
      PHASE === 'trial'
        ? ['14 dias grátis', 'Não pedimos cartão de crédito', 'Plano completo durante o teste']
        : ['Estamos abrindo o acesso aos poucos', 'Deixe seu e-mail e avisamos quando chegar a sua vez'],
    /** A antiga faixa de fatos: agora uma linha fina dentro do próprio herói. */
    facts: [
      { icon: 'CalendarClock', label: '14 dias grátis' },
      { icon: 'CreditCard', label: 'Sem cartão de crédito' },
      { icon: 'Building2', label: 'Preço por empresa, não por pessoa' },
      { icon: 'LogIn', label: 'Entre com a conta Google' },
    ],
    proofCaption: 'Uma frase vira uma tarefa com responsável, prazo e checklist.',
  },

  /**
   * O momento de declaração da página: só tipografia, sem imagem competindo.
   * Descreve o problema do decisor levantado na seção 1.1 do plano — nenhuma
   * funcionalidade nova é prometida aqui.
   */
  diagnostico: {
    eyebrow: 'O problema real',
    title: 'Hoje o sistema é você.',
    paragraphs: [
      'Ninguém na sua empresa está de má vontade. O trabalho é que não mora em lugar nenhum: o pedido chega por mensagem, o prazo fica combinado no corredor e a planilha só é aberta quando alguém lembra.',
      'Aí a única memória do que está em andamento é a sua. Você é quem sabe quem ficou com o quê, o que já foi entregue e o que atrasou — e remonta esse mapa toda vez que alguém pergunta.',
    ],
    kicker: 'O Tarefus tira esse mapa da sua cabeça e põe na tela.',
  },

  aiDemo: {
    eyebrow: 'Assistente com IA',
    title: 'Descreveu, virou tarefa.',
    subtitle:
      'Escreva o pedido do jeito que você falaria. O Tarefus devolve a tarefa montada — e você aprova antes de salvar.',
    approvalNote: 'Assim é no produto: nada é salvo sem a sua aprovação.',
    cta: CTA_PRIMARY,
    examples: [
      {
        id: 'comercial',
        areaLabel: 'Comercial',
        prompt:
          'Agendar reunião com o cliente Alpha amanhã às 15h com o Rodrigo para apresentar a proposta de 30k',
        draft: {
          title: 'Apresentar proposta comercial ao cliente Alpha',
          description:
            'Reunião de apresentação da proposta de R$ 30.000, com validação de contrato e cronograma inicial de implantação.',
          assignee: { name: 'Rodrigo Souza', initials: 'RS' },
          dueDateLabel: 'amanhã, 3/9',
          tags: ['Comercial', 'Proposta'],
          checklist: [
            'Apresentar proposta comercial de R$ 30.000',
            'Validar minuta do contrato de prestação',
            'Definir cronograma inicial de implantação',
          ],
        },
      },
      {
        id: 'operacoes',
        areaLabel: 'Operações',
        prompt:
          'Cotar frete de 5 pallets para a filial de Curitiba até sexta com a Beatriz, com seguro de carga',
        draft: {
          title: 'Cotar frete de 5 pallets para a filial de Curitiba',
          description:
            'Cotação com no mínimo três transportadoras, conferindo cubagem, peso e cobertura de seguro da carga.',
          assignee: { name: 'Beatriz Lima', initials: 'BL' },
          dueDateLabel: 'sexta-feira, 5/9',
          tags: ['Logística'],
          checklist: [
            'Checar cubagem e peso dos 5 pallets',
            'Consultar mínimo de 3 transportadoras',
            'Confirmar cobertura de seguro da apólice',
          ],
        },
      },
      {
        id: 'financeiro',
        areaLabel: 'Financeiro',
        prompt: 'Reconciliar faturamento do mês e emitir notas pendentes até o fim da semana com o Carlos',
        draft: {
          title: 'Reconciliar faturamento do mês e emitir notas pendentes',
          description:
            'Conferência dos extratos contra os pedidos faturados e emissão das notas dos contratos vigentes.',
          assignee: { name: 'Carlos Mendes', initials: 'CM' },
          dueDateLabel: 'sexta-feira, 5/9',
          tags: ['Financeiro', 'Fiscal'],
          checklist: [
            'Conferir extratos bancários com pedidos faturados',
            'Emitir NFS-e dos contratos vigentes',
            'Enviar espelhos aos clientes',
          ],
        },
      },
      {
        id: 'marketing',
        areaLabel: 'Marketing',
        prompt: 'Produzir 3 posts no LinkedIn sobre o novo produto com a Beatriz e agendar para terça',
        draft: {
          title: 'Produzir 3 posts de lançamento para o LinkedIn',
          description:
            'Três publicações institucionais sobre o novo produto, com copy, artes no padrão da marca e agendamento.',
          assignee: { name: 'Beatriz Lima', initials: 'BL' },
          dueDateLabel: 'terça-feira, 9/9',
          tags: ['Marketing', 'Conteúdo'],
          checklist: [
            'Redigir copy dos 3 posts institucionais',
            'Criar carrosséis visuais no padrão da marca',
            'Programar agendamento na ferramenta',
          ],
        },
      },
    ],
  },

  steps: {
    eyebrow: 'Como funciona',
    title: 'Começar leva três passos.',
    subtitle: 'Sem implantação, sem consultoria e sem migrar planilha.',
    items: [
      {
        number: 1 as const,
        title: 'Crie os quadros das suas áreas',
        description:
          'Comercial, operações, marketing, financeiro, atendimento. Você renomeia, adiciona ou remove quando quiser.',
      },
      {
        number: 2 as const,
        title: 'Descreva as tarefas',
        description:
          'Escreva ou dite uma frase. A IA sugere título, responsável, prazo e checklist — e você aprova antes de salvar.',
      },
      {
        number: 3 as const,
        title: 'Acompanhe prazos e responsáveis',
        description:
          'O quadro mostra em que etapa cada tarefa está, e o painel avisa o que vence hoje e o que atrasou.',
      },
    ],
    supportLine:
      'Quem entra pela primeira vez recebe um tour de 5 passos e tem uma central de ajuda dentro do sistema.',
  },

  dayToDay: {
    eyebrow: 'No dia a dia',
    title: 'Cada área com seu quadro, cada pessoa com sua lista.',
    bullets: [
      'Um quadro por área — ou todas as áreas em uma tela só.',
      'Três etapas, a fazer, fazendo e concluído: o cartão muda de etapa arrastando, no computador ou no celular.',
      'Em "Minhas Tarefas", cada pessoa vê apenas o que é dela.',
    ],
    cta: { label: 'Ver o Tarefus por dentro', href: '#prazos' },
    proofCaption: 'O quadro da área e a lista de uma pessoa, lado a lado.',
  },

  deadlines: {
    eyebrow: 'Prazos',
    title: 'O atraso aparece antes de o cliente cobrar.',
    bullets: [
      'O cartão mostra a data de entrega e destaca o que vence hoje.',
      'Uma faixa no topo avisa as tarefas do dia assim que alguém entra no sistema.',
      'O sino mostra quantas tarefas estão atrasadas e quantas vencem hoje.',
    ],
    proofCaption: 'A faixa do dia e o sino de notificações, como aparecem ao entrar.',
  },

  comparison: {
    eyebrow: 'Comparativo',
    title: 'Você já organiza de algum jeito.',
    subtitle: 'A pergunta é quanto esse jeito custa em retrabalho.',
    columns: {
      criterion: 'Critério',
      spreadsheet: 'Planilha',
      messaging: 'Grupo de mensagens',
      tarefus: 'Tarefus',
    },
    rows: [
      {
        criterion: 'Onde a tarefa fica',
        spreadsheet: 'Em uma linha, se alguém lembrar de escrever',
        messaging: 'No meio da conversa, até alguém rolar para cima',
        tarefus: 'Em um cartão, dentro do quadro da área',
      },
      {
        criterion: 'Quem é o responsável',
        spreadsheet: 'Uma coluna que nem sempre é preenchida',
        messaging: 'Quem respondeu por último — ou ninguém',
        tarefus: 'Um ou mais responsáveis, com avatar no cartão',
      },
      {
        criterion: 'O que acontece com o prazo',
        spreadsheet: 'Só aparece se alguém abrir o arquivo',
        messaging: 'Depende de alguém lembrar de cobrar',
        tarefus: 'Destaque no cartão, faixa do dia e contagem de atrasadas',
      },
      {
        criterion: 'O que sobra de histórico',
        spreadsheet: 'A última versão salva',
        messaging: 'A conversa inteira, sem separar o que era tarefa',
        tarefus: 'Registro de quem criou, moveu, concluiu ou excluiu',
      },
      {
        criterion: 'O que a pessoa nova encontra',
        spreadsheet: 'Um arquivo que alguém precisa explicar',
        messaging: 'Meses de mensagens',
        tarefus: 'Os quadros da área e a lista dela',
      },
    ],
    cta: CTA_PRIMARY,
  },

  /**
   * Papéis e dados no mesmo bloco: as duas perguntas são a mesma pergunta do
   * influenciador técnico — quem acessa o quê, e o que acontece com os dados.
   */
  acessos: {
    eyebrow: 'Acessos e dados',
    title: 'Cada pessoa vê o que precisa. Os dados continuam seus.',
    roles: [
      {
        name: 'Administrador',
        icon: 'ShieldCheck',
        summary: 'Cuida da empresa dentro do sistema.',
        abilities: [
          'Configura os dados da empresa',
          'Adiciona, remove e muda o nível de acesso das pessoas',
          'Vê o histórico completo',
        ],
      },
      {
        name: 'Gestor',
        icon: 'Briefcase',
        summary: 'Organiza o trabalho da área.',
        abilities: [
          'Cria e edita os quadros da área',
          'Distribui tarefas e define prazos',
          'Acompanha o andamento da equipe',
        ],
      },
      {
        name: 'Colaborador',
        icon: 'UserCheck',
        summary: 'Toca as tarefas do dia.',
        abilities: [
          'Cria e edita tarefas',
          'Move o cartão entre as etapas',
          'Marca os itens do checklist',
        ],
      },
    ],
    dataTitle: PHASE === 'trial' ? 'Seus dados e seus acessos' : 'Como vamos tratar seus dados',
    dataItems:
      PHASE === 'trial'
        ? [
            {
              icon: 'LogIn',
              title: 'Acesso com conta própria',
              description: 'Cada pessoa entra com e-mail e senha ou com a conta Google da empresa.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Três níveis de permissão',
              description: 'Você define quem configura, quem organiza e quem executa.',
            },
            {
              icon: 'History',
              title: 'Histórico de atividades',
              description: 'Criação, movimentação e exclusão de tarefas ficam registradas.',
            },
            {
              icon: 'Cloud',
              title: 'Infraestrutura do Google Cloud',
              description: 'O Tarefus roda sobre a nuvem do Google.',
            },
            {
              icon: 'Download',
              title: 'Seus dados são seus',
              description:
                'Exportação em JSON ou CSV a qualquer momento, e exclusão dos dados da empresa a pedido.',
            },
          ]
        : [
            {
              icon: 'Cloud',
              title: 'Infraestrutura do Google Cloud',
              description: 'O Tarefus roda sobre a nuvem do Google.',
            },
            {
              icon: 'Download',
              title: 'Seus dados são seus',
              description:
                'Exportação em JSON ou CSV a qualquer momento, e exclusão dos dados da empresa a pedido.',
            },
          ],
    historyNote:
      'Criação, movimentação, conclusão e exclusão de tarefas ficam registradas, com autor e data.',
  },

  faq: {
    eyebrow: 'Perguntas frequentes',
    title: 'O que costumam perguntar antes de decidir.',
    items: [
      {
        id: 'faq-cartao',
        question: 'Preciso de cartão de crédito para testar?',
        answer:
          'Não. O teste de 14 dias começa com e-mail e senha ou com a sua conta Google, sem cartão. Ao final, você decide se quer continuar.',
      },
      {
        id: 'faq-fim-teste',
        question: 'O que acontece quando o teste de 14 dias termina?',
        answer:
          'Você escolhe um plano para continuar. Se não escolher, o seu espaço entra em modo somente leitura por 30 dias: dá para consultar e exportar tudo, mas não criar nem editar. Depois disso o acesso é bloqueado. Nada é cobrado sem a sua escolha.',
      },
      {
        id: 'faq-equipe-pequena',
        question: 'Minha equipe é pequena. Compensa?',
        answer:
          'O Tarefus foi feito para equipes de 3 a 35 pessoas. Se hoje as tarefas vivem em planilha e em grupo de mensagens, o ganho aparece já na primeira semana: cada demanda passa a ter dono, prazo e etapa. E como a cobrança é por empresa, colocar mais gente para colaborar não muda a fatura dentro do limite do plano.',
      },
      {
        id: 'faq-adocao',
        question: 'Minha equipe vai conseguir usar?',
        answer:
          'São três etapas — a fazer, fazendo e concluído — e um cartão por tarefa. Quem entra pela primeira vez recebe um tour de 5 passos, e há uma central de ajuda dentro do sistema.',
      },
      {
        id: 'faq-ia',
        question: 'Como funciona a criação de tarefas com IA?',
        answer:
          'Você descreve o que precisa ser feito, por texto ou por voz. A IA devolve um rascunho com título, descrição, responsável sugerido, prazo, etiquetas e checklist. Você revisa, edita se quiser e aprova. Nada é salvo sem a sua aprovação.',
      },
      {
        id: 'faq-voz',
        question: 'O ditado por voz funciona no meu computador?',
        answer:
          'O ditado usa o reconhecimento de voz do navegador e funciona no Google Chrome e no Microsoft Edge. Em outros navegadores, você digita a descrição normalmente.',
      },
      {
        id: 'faq-celular',
        question: 'Dá para usar no celular?',
        answer:
          'Sim. O Tarefus abre no navegador do celular, e os cartões podem ser movidos com o toque.',
      },
      {
        id: 'faq-dados',
        question: 'Onde ficam os dados da minha empresa?',
        answer:
          'Os dados ficam na infraestrutura de nuvem do Google (Firestore). O acesso é feito por e-mail e senha ou por conta Google, com três níveis de permissão, e as ações ficam registradas no histórico.',
      },
      {
        id: 'faq-exportar',
        question: 'Consigo exportar ou apagar meus dados?',
        answer:
          'Sim. A exportação em JSON ou CSV fica disponível a qualquer momento, inclusive durante os 30 dias de modo somente leitura depois do teste. Para excluir a conta e os dados, basta pedir pelo e-mail de suporte; a exclusão é concluída em até 30 dias.',
      },
      {
        id: 'faq-preco',
        question: 'Quanto custa depois do teste?',
        answer:
          'A cobrança é por empresa, não por pessoa: um valor fixo em reais pelo plano, com a equipe toda dentro do limite de membros dele. Os valores ficam na página de Planos.',
      },
      {
        id: 'faq-escolher-plano',
        question: 'Preciso escolher o plano antes de testar?',
        answer:
          'Não. O teste já começa com um plano completo liberado e você só decide qual assinar no fim dos 14 dias. A troca de plano é feita pelo próprio painel.',
      },
    ],
  },

  /**
   * Fecha o que antes eram duas seções (Teste e Chamada final). O bloco carrega
   * o id `lista-de-espera`, destino dos CTAs na fase 0.
   */
  comecar: {
    title:
      PHASE === 'trial'
        ? 'Comece hoje com a sua equipe.'
        : 'Entre na fila e comece com 14 dias grátis.',
    lead:
      PHASE === 'trial'
        ? 'Crie os quadros das suas áreas, descreva a primeira tarefa e veja o trabalho se organizar.'
        : 'Estamos abrindo o acesso aos poucos. Deixe seu e-mail e avisamos quando chegar a sua vez.',
    included: [
      'Plano completo liberado durante os 14 dias, sem cartão de crédito',
      'Tarefas e checklists ilimitados, em qualquer plano',
      'Convide a equipe até o limite de membros do plano',
    ],
    fineprint: [
      'No 15º dia você escolhe um plano. Se não escolher, o seu espaço fica em modo somente leitura por 30 dias — dá para consultar e exportar tudo — e só depois o acesso é bloqueado. Nada é cobrado sem a sua escolha.',
      'No mensal não há fidelidade e o cancelamento é feito pelo painel. No anual, o pagamento pode ser parcelado no cartão ou feito à vista por PIX.',
    ],
    billingNote: 'A cobrança é por empresa, não por pessoa, em reais e com nota fiscal.',
    primaryCta: CTA_PRIMARY,
    // O link para /planos fica oculto até a página existir (D13).
    pricingCta: null as Cta | null,
  },

  footer: {
    columns: [
      {
        title: 'Produto',
        links: [{ label: 'Recursos', href: '#dia-a-dia' }],
      },
      {
        title: 'Acesso',
        links: [{ label: 'Entrar', href: '/entrar' }],
      },
    ],
    contactEmail: 'suporte@tarefus.com.br',
    legalNote: 'Tarefus. Razão social e CNPJ a definir antes do lançamento.',
  },

  stickyCta: CTA_PRIMARY_SHORT,
} as const;

export type HomeContent = typeof home;
