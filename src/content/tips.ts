/**
 * Dicas de como escrever uma boa tarefa, para o carrossel da home.
 *
 * Cada cartão é a versão curta de uma recomendação que já está publicada por
 * extenso em um dos 12 artigos do Guia (`src/data/guideArticles.ts`), e o
 * `articleSlug` leva exatamente para esse artigo. O carrossel é a porta de
 * entrada do assunto; o Guia continua sendo onde o assunto se aprofunda.
 *
 * Regra de conteúdo: cada dica descreve algo que o produto realmente faz.
 * Nada aqui promete recurso que não existe.
 */

export interface Tip {
  id: string;
  /** Numeração visível no cartão, para dar ritmo à faixa. */
  index: number;
  title: string;
  body: string;
  /** Slug do artigo do Guia de onde a recomendação veio. */
  articleSlug: string;
  articleLabel: string;
}

export const TIPS: readonly Tip[] = [
  {
    id: 'dono',
    index: 1,
    title: 'Uma tarefa, um dono.',
    body: 'Tarefa com dois responsáveis é tarefa de ninguém. Escolha uma pessoa para responder por ela — quem ajuda entra no checklist, não no campo de responsável.',
    articleSlug: 'responsavel-por-tarefa-clareza',
    articleLabel: 'Quem faz o quê',
  },
  {
    id: 'verbo',
    index: 2,
    title: 'Comece o título com um verbo.',
    body: '"Cliente Alpha" não é tarefa, é assunto. "Enviar proposta revisada ao cliente Alpha" é. Quem lê o cartão precisa saber o que fazer sem abrir nada.',
    articleSlug: 'como-organizar-tarefas-equipe',
    articleLabel: 'Organizar as tarefas da equipe',
  },
  {
    id: 'prazo',
    index: 3,
    title: 'Prazo é uma data, não "urgente".',
    body: 'Urgente é opinião e muda de dono para dono. Uma data no cartão é fato: o quadro destaca o que vence hoje e conta o que atrasou, sem ninguém precisar cobrar.',
    articleSlug: 'como-definir-prazos-tarefas',
    articleLabel: 'Prazos realistas',
  },
  {
    id: 'checklist',
    index: 4,
    title: 'Mais de um passo? Vira checklist.',
    body: 'Quebrar a tarefa em itens tira o peso de começar e mostra o progresso enquanto ela anda. E se a pessoa faltar, outra assume sabendo onde parou.',
    articleSlug: 'checklists-padronizacao-processos',
    articleLabel: 'Checklists que padronizam',
  },
  {
    id: 'frase',
    index: 5,
    title: 'Escreva a frase inteira e deixe a IA montar.',
    body: '"Preparar contrato para a Alpha até quinta com o Carlos" já tem o que a IA precisa: título, responsável, prazo e checklist voltam prontos para você aprovar.',
    articleSlug: 'inteligencia-artificial-gestao-tarefas',
    articleLabel: 'IA na gestão de tarefas',
  },
  {
    id: 'whatsapp',
    index: 6,
    title: 'O que combinou na mensagem vira tarefa na hora.',
    body: 'Mensagem é passageira: sobe na conversa e some. Se o combinado não virou cartão no mesmo minuto, ele só existe na memória de quem estava ali.',
    articleSlug: 'delegar-tarefas-whatsapp-erros',
    articleLabel: 'Delegar pelo WhatsApp',
  },
  {
    id: 'area',
    index: 7,
    title: 'Cada área no seu quadro.',
    body: 'Comercial, operações, financeiro e marketing têm ritmos diferentes. Separar em quadros deixa cada equipe com a própria tela — e você com todas elas.',
    articleSlug: 'gestao-tarefas-por-setor-empresa',
    articleLabel: 'Gestão por setor',
  },
  {
    id: 'comeco',
    index: 8,
    title: 'Comece com dez tarefas, não com a planilha inteira.',
    body: 'Migrar tudo de uma vez é o jeito mais rápido de desistir. Leve as dez ou quinze demandas prioritárias de cada área no primeiro dia; o resto vem sozinho.',
    articleSlug: 'como-migrar-planilhas-para-tarefus',
    articleLabel: 'Sair das planilhas',
  },
];
