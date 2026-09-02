# Plano da Homepage Pública do Tarefus

| Campo | Valor |
|---|---|
| Documento | `docs/commercial/01-homepage-plan.md` |
| Autor | Agente 1 — Planejamento comercial |
| Data | 2026-09-01 |
| Status | Pronto para execução em Fase 0 (9.3). A abertura do cadastro depende dos itens da seção 0.C |
| Escopo | Estratégia de mensagem, arquitetura da homepage, copy inicial, componentes futuros, SEO, analytics, aceite e riscos |
| Fora de escopo | Implementação de código, definição de preço, cobrança, infraestrutura, credenciais |
| Documento irmão | `02-pricing-and-guide-plan.md` (Agente 2 — planos, preços e Guia), na branch `plan_pricing_guide_strategy` |
| Última revisão | 2026-09-01 — copy alinhada às regras comerciais confirmadas pelo Agente 2 (seção 0.D) |

## Como este documento foi construído

Toda afirmação de produto usada na copy foi verificada diretamente no código deste repositório
(`src/`, `server.ts`, `firestore.rules`). O inventário está na seção 1.4, com o arquivo de origem
de cada funcionalidade. A regra editorial é simples: **se não está no código, não entra na
homepage**. Onde a funcionalidade existe mas ainda não está pronta para uso público, o item
aparece na seção 9 como risco — nunca como promessa.

---

## 0. Para você resolver depois

Esta seção separa o que já está resolvido do que ainda depende de você. **Nada aqui bloqueia o
início da execução da homepage.** Se você não responder nada, a Fase 0 (seção 9.3) vai ao ar com os
padrões da tabela B.

### A. Já resolvido — a execução pode começar sem você

Posicionamento e mensagem (2), estrutura das 14 seções (3), copy final de todas as seções (4),
princípios de hierarquia visual (3.0), componentes e contratos de props (6), arquitetura da rota
pública (6.1), SEO completo com metadados e JSON-LD (7), catálogo de eventos (8), critérios de
aceite (9.1), lista de capturas de tela a produzir (4.6) e os arquivos prontos do Anexo A.

### B. Decidido com um padrão — confirme quando puder

Se você discordar de qualquer linha, muda só o ponto indicado; nada mais do plano se desfaz.

| ID | Padrão adotado | Onde muda se você discordar |
|---|---|---|
| P2 | Exportação e exclusão de dados em até 30 dias | FAQ 2 e 9 (4.4) |
| P3 | Suporte por e-mail com resposta em até 24 horas úteis — confirmado pelo Agente 2, com prazos menores nos planos superiores | FAQ e rodapé |
| P4 | Nada é afirmado sobre localização dos dados | S9 (4.5) |
| P5 | Faixa de fatos no lugar de depoimentos, até haver três clientes identificados | S2 (4.5) |
| P7 | Preços já definidos pelo Agente 2; a homepage continua sem exibir valores | S10 (4.5) |
| D1 | Site público como segunda entrada do Vite, sem dependência nova | 6.1 |
| D3 | Demonstração da IA pré-computada, sem chamar a API | S3 (3) |
| D9 | Analytics anônimo, sem cookies e sem banner de consentimento | 8.1 |
| D10 | Lançar primeiro em Fase 0 (lista de espera) e depois abrir o teste | 9.3 |

### C. Só você resolve — e a Fase 1 depende disso

| ID | O que falta | Por que trava | O que fazemos enquanto isso |
|---|---|---|---|
| P6 | Domínio definitivo | Canônica, OG e JSON-LD precisam da URL real | Marcador `SEU-DOMINIO` no código |
| P1 | Razão social, CNPJ e endereço | Rodapé e dado estruturado `Organization` | Fase 0 publica o rodapé sem esses campos |
| P2 | Política de Privacidade e Termos publicados | Obrigatórios para abrir cadastro | Fase 0 usa apenas a linha de privacidade da lista de espera |
| R1–R4 | Isolamento por empresa, regras do Firestore, remoção das contas de demonstração e estado do teste de 14 dias | São de produto, não de comunicação | Fase 0 não abre cadastro, então nenhum desses riscos é exposto |

### Se você tiver dez minutos agora

Responder **P6 (domínio)**, **P1 (razão social e CNPJ)** e **P3 (e-mail de suporte)** é o que
destrava mais trabalho por minuto: com esses três, a homepage sai do marcador e vira página
publicável. Pode responder editando a coluna "Padrão adotado" deste próprio arquivo.

### D. Alinhamento com o plano de Planos e Guia (Agente 2)

Confirmado em 2026-09-01 a partir de `02-pricing-and-guide-plan.md` (branch
`plan_pricing_guide_strategy`). **Estas regras são a fonte de verdade da copy comercial desta
página** e já estão aplicadas em todas as seções indicadas.

| Regra confirmada | Como aparece na homepage | Onde |
|---|---|---|
| Página de planos em `/planos`, com o rótulo de menu "Planos" | Todos os links e rótulos usam `/planos`; "Preços" sai do menu | S0, 4.2, 6.4, 7.1 |
| Teste de 14 dias, sem cartão, com acesso completo ao plano; o cadastro já inicia no Crescimento | "Plano completo durante o teste" — nunca "todos os recursos do produto" | S1, S10, FAQ 1 e 11 |
| Três planos por faixa de membros (até 5, 15 e 35) | "Convide a equipe até o limite de membros do plano"; proibido dizer "pessoas ilimitadas" | S10, 1.5, FAQ 3 |
| Cobrança por empresa, em reais, com nota fiscal | Vira fato na faixa S2 e linha de cobrança em S10 | S2, S10, FAQ 10 |
| Sem fidelidade no mensal; anual parcelado em 12x ou à vista no PIX | Linha de cancelamento em S10; "cancele quando quiser" sai do herói | S10, 4.1, 1.5 |
| Modo somente leitura por 30 dias após o teste, antes do bloqueio | Substitui "o acesso é encerrado" | S10, FAQ 2 e 9 |
| Exportação em JSON ou CSV a qualquer momento | Resposta de exportação do FAQ | FAQ 9, S9 |
| Cotas mensais de IA por plano (100, 400 e 1.200 criações) | Proibição de dizer "IA ilimitada" | 1.5, R8 |
| Histórico de 30 dias, 180 dias ou completo, conforme o plano | Proibição de dizer "histórico completo" sem qualificar | 1.5, S7 |
| Suporte por e-mail em até 24 horas úteis, com prazos menores nos planos superiores | Base do compromisso de suporte | P3, rodapé |
| Guia em `/guia` e `/guia/[slug]`, com pauta de 12 artigos | Links "Ver o Guia" e estratégia de cauda longa | S9, S11, 7.6 |

**Divergência consciente.** A matriz de recursos do Agente 2 lista "Conformidade com LGPD" como
item de plano. Esta homepage continua sem exibir esse selo até a Política de Privacidade estar
publicada e revisada (P2): descrever práticas é permitido, declarar conformidade não.

**Os valores continuam fora da homepage.** Os preços existem, mas são hipóteses a validar com os
primeiros clientes, e `/planos` é a fonte única (D8). Isso vale inclusive para o dado estruturado:
`offers` fica de fora até os valores estarem validados.

---

## 1. Público e proposta de valor

### 1.1 Quem decide e quem usa

O Tarefus é comprado por uma pessoa e usado por várias. A homepage precisa falar com as duas,
nessa ordem.

| Papel | Quem é | O que sente hoje | O que precisa ver na homepage |
|---|---|---|---|
| **Decisor** (dono, sócio, gerente) | Comanda uma empresa de 3 a 35 pessoas, acumula funções, decide sozinho e rápido | Não sabe o que está em andamento sem perguntar; descobre o atraso quando o cliente cobra; pede status por WhatsApp várias vezes ao dia | Que ele passa a enxergar tarefa, responsável e prazo sem cobrar ninguém |
| **Usuário** (vendas, operações, marketing, financeiro, atendimento) | Recebe demanda por WhatsApp, e-mail, telefone e corredor | Não sabe a prioridade do dia; recebe pedido sem prazo; refaz trabalho | Que a ferramenta é simples, abre no celular e mostra só o que é dele |
| **Influenciador técnico** (quando existe) | Sócio mais ligado a tecnologia, estagiário de TI, contador ou agência parceira | Avalia se a empresa vai ficar refém da ferramenta | Onde os dados ficam, quem acessa o quê, como sair da ferramenta |

Contexto brasileiro que condiciona o desenho da página:

- **Avaliação em uma sessão única.** O decisor abre a página entre duas reuniões. A promessa
  precisa ser compreendida na primeira dobra, sem rolagem.
- **Celular como tela principal da equipe.** O decisor pode avaliar no desktop; a equipe usa no
  celular. A página é planejada mobile-first (seção 3).
- **Baixa tolerância a ferramenta complexa.** A objeção real não é preço, é "minha equipe não vai
  usar". A página responde isso explicitamente.
- **Desconfiança com cartão de crédito antecipado.** O teste de 14 dias precisa dizer, na primeira
  dobra, que não pede cartão.
- **A referência mental é planilha e grupo de WhatsApp**, não Trello ou ClickUp. O comparativo da
  seção S8 usa a referência real do público.

### 1.2 As três dores que o produto resolve hoje

1. **Trabalho espalhado.** A demanda vive em WhatsApp, e-mail, planilha e na cabeça das pessoas.
2. **Responsabilidade difusa.** "Achei que era você quem ia fazer."
3. **Prazo invisível.** Ninguém enxerga o atraso antes do cliente.

### 1.3 Proposta de valor

**Frase-mestra (uso interno, base de toda a copy):**

> O Tarefus organiza o trabalho da sua equipe em quadros por área, com responsável e prazo em cada
> tarefa — e transforma um pedido escrito ou falado em tarefa pronta para você aprovar.

Três pilares, na ordem em que a página os apresenta:

| Pilar | O que significa | Prova na página |
|---|---|---|
| **Clareza** | Toda tarefa tem responsável, prazo e etapa visíveis | Cartão real com avatar, data e checklist |
| **Velocidade** | Descrever em linguagem natural gera um rascunho estruturado | Demonstração da IA com resultado visível |
| **Organização** | Quadros por área da empresa e uma visão só do que é seu | Quadro Kanban e tela "Minhas Tarefas" |

### 1.4 Inventário verificado: o que podemos afirmar

Esta tabela é a fonte de verdade da copy. A coluna "Afirmação permitida" é o texto máximo que pode
ser dito na homepage sobre cada item.

| # | Funcionalidade | Onde está no código | Afirmação permitida |
|---|---|---|---|
| F1 | Quadro Kanban com três etapas (A Fazer, Fazendo, Concluído) | `src/components/KanbanColumn.tsx`, `src/types/index.ts` (`TaskStatus`) | "Três etapas: a fazer, fazendo e concluído" |
| F2 | Arrastar e soltar cartões, com suporte a toque | `@hello-pangea/dnd` em `src/components/BoardView.tsx` | "Arraste o cartão de uma etapa para outra, no computador ou no celular" |
| F3 | Quadros por área da empresa | `src/types/index.ts` (`Board`), `src/data/initialData.ts` | "Um quadro para cada área: comercial, operações, marketing, financeiro, atendimento" |
| F4 | Responsáveis múltiplos por tarefa | `Task.assigneeIds` em `src/types/index.ts` | "Uma tarefa pode ter um ou mais responsáveis" |
| F5 | Prazo com destaque de hoje e de atraso | `src/components/TaskCard.tsx`, `src/components/DueTodayAlertBanner.tsx` | "O cartão mostra o prazo e destaca o que vence hoje e o que atrasou" |
| F6 | Checklist com progresso | `Task.checklist`, `src/components/TaskCard.tsx` | "Cada tarefa pode ter uma lista de etapas com progresso" |
| F7 | Tela "Minhas Tarefas" | `src/components/MyTasksView.tsx` | "Cada pessoa tem uma tela só com as tarefas dela" |
| F8 | Central de notificações com contagem de vencimentos e atrasos | `src/components/NotificationCenter.tsx` | "Um painel mostra quantas tarefas vencem hoje e quantas estão atrasadas" |
| F9 | Criação de tarefa por IA a partir de texto ou voz | `src/components/TaskAICreator.tsx`, `server.ts` (`POST /api/generate-task-draft`) | "Descreva a tarefa em uma frase e a IA sugere título, descrição, responsável, prazo, etiquetas e checklist" |
| F10 | Aprovação humana obrigatória do rascunho da IA | `onApprove` / `onEditSuggestion` em `src/components/TaskAICreator.tsx` | "Nada é salvo sem a sua aprovação: você revisa e edita antes de criar" |
| F11 | Ditado por voz | `src/hooks/useSpeechRecognition.ts` | "Ditado por voz no Chrome e no Edge" — sempre com a ressalva do navegador |
| F12 | Perfis de acesso: administrador, gestor, colaborador | `src/utils/rbac.ts` | "Três níveis de acesso: administrador, gestor e colaborador" |
| F13 | Histórico de atividades | `ActivityLog` em `src/types/index.ts`, `src/components/settings/AuditLogsSettings.tsx` | "Histórico de quem criou, moveu, concluiu ou excluiu cada tarefa" |
| F14 | Entrar com Google | `src/lib/firebase.ts`, `src/components/LoginModal.tsx` | "Entre com a conta Google da empresa" |
| F15 | Tour guiado de 5 passos e Central de Ajuda | `src/components/tour/GuidedTour.tsx`, `src/components/help/HelpCenterModal.tsx` | "Um tour de 5 passos na primeira entrada e uma central de ajuda dentro do sistema" |
| F16 | Tema claro e escuro | `src/index.css`, `index.html` | "Tema claro e escuro" |
| F17 | Atalhos de teclado | `src/data/helpData.ts` (`KEYBOARD_SHORTCUTS`) | "Atalhos de teclado para criar tarefa e navegar" |
| F18 | Dados na nuvem do Google (Firestore) | `src/lib/firebase.ts`, `src/services/firestoreService.ts` | "Os dados ficam na infraestrutura do Google Cloud" — sem afirmar região nem certificação |

### 1.5 O que a homepage **não** pode afirmar

| Afirmação proibida | Por quê |
|---|---|
| "Os dados da sua empresa ficam isolados" | O sistema é hoje single-tenant (`COMPANY_DOC_ID = 'single_tenant_company'` em `src/services/firestoreService.ts`) e `firestore.rules` libera leitura e escrita para qualquer requisição. Riscos R1 e R2. |
| "Dados hospedados no Brasil" | A região do Firestore não está confirmada neste repositório. Pendência P4. |
| "Em conformidade com a LGPD" como selo | Podemos descrever práticas; não podemos declarar conformidade sem política de privacidade publicada e revisada. |
| "Aumente sua produtividade em X%" / "Economize N horas por semana" | Não há medição. A copy usa benefícios verificáveis, não números inventados. |
| "Usado por centenas de empresas" | Não há base de clientes. Ver decisão D6. |
| "Integra com WhatsApp, e-mail ou Google Agenda" | Não existe integração no código. |
| "Funciona offline" | Existe persistência local como retaguarda, não um modo offline garantido. |
| "Relatórios" ou "dashboards" | Existe contagem de prazos, não relatório. |
| "Pessoas ilimitadas", "toda a equipe sem limite" | Os planos têm faixa de membros (até 5, 15 e 35). Ver 0.D. |
| "IA ilimitada" | Cada plano tem cota mensal de criações por IA. |
| "Histórico completo", sem qualificar | O período do histórico varia por plano. |
| "Cancele quando quiser", isolado | Vale para o mensal; o anual é um compromisso de 12 meses, parcelado ou à vista. |

---

## 2. Posicionamento: três opções e recomendação

### Opção A — "O quadro de tarefas que a equipe toda usa"

- **Eixo:** simplicidade e adoção.
- **Manifesto:** "Simples o bastante para todo mundo usar na segunda-feira."
- **A favor:** ataca a objeção número um do público ("minha equipe não vai usar") e é coerente com
  o produto real, que é enxuto.
- **Contra:** simplicidade é a promessa mais copiada do mercado, não sustenta preço sozinha e joga
  o Tarefus na comparação direta com o plano gratuito de concorrentes maiores.

### Opção B — "Toda tarefa com dono e prazo"

- **Eixo:** clareza de responsabilidade e execução.
- **Manifesto:** "Você para de perguntar em que pé está."
- **A favor:** é a dor que o decisor sente e paga para resolver; é inteiramente verificável no
  produto (responsáveis, prazos, alertas, histórico); diferencia de planilha e grupo de WhatsApp,
  que é a referência mental real do público.
- **Contra:** é uma promessa de gestão; precisa da camada de simplicidade para não soar como
  vigilância sobre a equipe.

### Opção C — "Descreveu, virou tarefa"

- **Eixo:** velocidade de captura com IA.
- **Manifesto:** "Fale ou escreva o pedido. O Tarefus monta a tarefa."
- **A favor:** é o diferencial mais visível em 30 segundos, rende demonstração forte na primeira
  dobra e está alinhado com a expectativa atual do mercado.
- **Contra:** sozinha é promessa de recurso, não de resultado; depende de serviço externo (Gemini)
  e de chave configurada; se a IA for o único motivo de compra, o produto perde valor no dia em que
  o concorrente tiver a mesma coisa.

### Recomendação

**Opção B como espinha dorsal, Opção C como diferencial no herói e Opção A como resposta explícita
à objeção de adoção.**

| Camada | Papel na página | Onde aparece |
|---|---|---|
| B — dono e prazo | Promessa central: H1, título de SEO, CTA final | S1, S5, S6, S12 |
| C — descreveu, virou tarefa | Diferencial demonstrado | S1 (visual), S3, S4 |
| A — simples de adotar | Tratamento de objeção | S4, S8, FAQ |

**Justificativa.** O decisor paga pela clareza (B); a IA (C) é o que o faz parar de rolar a página
e o que separa o Tarefus de um Kanban comum; a simplicidade (A) destrava o "sim" depois que ele já
quis. Colocar C como espinha dorsal transformaria o Tarefus em "mais um app de IA" e deixaria a
promessa refém de um serviço externo. Colocar A como espinha dorsal comoditizaria o produto.

**Alternativas descartadas:** posicionamento por segmento único (só agências, só clínicas),
descartado porque o produto será comunicado de forma genérica; posicionamento por preço ("o mais
barato"), descartado porque não há preço definido e porque atrai o público de menor retenção;
posicionamento como "substituto do Trello", descartado porque puxa uma comparação de recursos que
hoje o Tarefus perderia.

---

## 3. Estrutura da página, seção a seção

### 3.0 Princípios de hierarquia visual e narrativa de conversão

A página segue uma narrativa única, em cinco movimentos, e nenhuma seção existe fora dela:

1. **Prometer** (S1) — o que muda na sua empresa.
2. **Provar rápido** (S2, S3) — mostre o produto antes de explicá-lo.
3. **Explicar o mínimo** (S4, S5, S6) — como isso funciona no dia a dia.
4. **Remover risco** (S7, S8, S9, S10) — adoção, comparação, segurança, preço.
5. **Fechar** (S11, S12) — dúvidas finais e chamada.

Regras de hierarquia aplicadas em toda a página:

- **Um H1, um assunto por seção.** Cada seção tem uma única ideia e um único CTA.
- **Escala tipográfica em quatro degraus.** H1 (herói), H2 (título de seção), corpo, apoio. Nada
  entre eles. Peso e tamanho fazem a hierarquia; cor não é usada sozinha para hierarquizar.
- **Uma cor de ação.** O índigo já usado no produto (`selection:bg-indigo-500`, foco em
  `src/index.css`) é reservado ao CTA primário. Nenhum elemento decorativo usa essa cor.
- **Alternância de superfície, não de cor de marca.** Fundos alternam entre `--app` e `--raised`
  (tokens já existentes) para separar seções, evitando faixas coloridas.
- **Densidade decrescente.** Do topo para a base, o texto encurta e o espaço aumenta.
- **Movimento discreto.** Entrada por opacidade e 8px de deslocamento, no máximo; sempre respeitando
  `prefers-reduced-motion`. Nada com autoplay sonoro, nada que se mova em loop perto do CTA.
- **Orçamento de rolagem:** o decisor precisa entender promessa, prova e preço em até quatro
  rolagens completas no celular.

### 3.1 Mapa das seções

| ID | Seção | Movimento | CTA presente |
|---|---|---|---|
| S0 | Barra de navegação | — | CTA secundário permanente |
| S1 | Herói | Prometer | CTA primário |
| S2 | Faixa de fatos | Provar | — |
| S3 | Demonstração da IA | Provar | CTA primário |
| S4 | Como funciona em 3 passos | Explicar | — |
| S5 | O dia a dia da equipe | Explicar | CTA secundário |
| S6 | Prazos que aparecem sozinhos | Explicar | — |
| S7 | Cada pessoa vê o que precisa | Remover risco | — |
| S8 | Tarefus x planilha e grupo de WhatsApp | Remover risco | CTA primário |
| S9 | Seus dados e seus acessos | Remover risco | Link para o Guia |
| S10 | Teste 14 dias, depois escolha o plano | Remover risco | CTA primário + link para Planos |
| S11 | Perguntas frequentes | Fechar | Link para o Guia |
| S12 | Chamada final | Fechar | CTA primário |
| S13 | Rodapé | — | Links institucionais |
| SF | Barra fixa de CTA no celular | — | CTA primário |

---

### S0 — Barra de navegação

- **Objetivo.** Dar orientação e manter o CTA sempre a um toque, sem competir com o herói.
- **Mensagem.** A marca, quatro destinos e uma ação. Nada mais.
- **CTA.** Primário compacto "Testar grátis"; ao lado, "Entrar" como link de texto — quem já é
  cliente não deve caçar o login.
- **Evidência / visual.** Logotipo Tarefus à esquerda; itens: Recursos, Planos, Guia; à direita
  "Entrar" e o botão. Barra com fundo `--raised`, borda inferior `--line` de 1px, sem sombra. Fica
  fixa no topo somente após 120px de rolagem, para não roubar altura da primeira dobra.
- **Comportamento mobile.** Colapsa em: logotipo + botão "Testar grátis" + ícone de menu. O menu
  abre em painel de tela cheia com os quatro destinos e o "Entrar", com alvos de toque de 48px.
  O botão do menu tem `aria-expanded` e devolve o foco ao fechar.

---

### S1 — Herói

- **Objetivo.** Fazer o decisor entender, em menos de oito segundos, o que muda na empresa dele e
  começar o teste sem fricção.
- **Mensagem.** Clareza (dono e prazo) como promessa, IA como forma de chegar lá rápido. Copy
  completa na seção 4.1.
- **CTA.** Primário: **"Começar teste grátis de 14 dias"**. Secundário: **"Ver como funciona"**,
  rolagem suave até S3 (não abre vídeo, não abre modal).
  Microcopy sob os botões: "14 dias grátis · Não pedimos cartão de crédito · Plano completo durante
  o teste."
- **Evidência / visual.** Composição em duas partes, lado a lado no desktop:
  1. **campo de captura** reproduzindo o Assistente de IA do produto, com o efeito de digitação já
     existente (`TYPEWRITER_EXAMPLES` em `src/components/TaskAICreator.tsx`) e ícone de microfone;
  2. **cartão resultante** — o `TaskCard` real, com título, responsável com avatar, prazo e
     checklist com progresso.
  Uma seta curta liga os dois. O conjunto é imagem estática otimizada, com dimensões declaradas
  para não gerar deslocamento de layout; a versão interativa mora em S3. Sem mockup de notebook,
  sem foto de banco de imagens, sem pessoas sorrindo.
- **Comportamento mobile.** Empilha: H1, subtítulo, CTA primário em largura total, CTA secundário
  como link de texto, microcopy, depois o visual reduzido ao cartão de tarefa (o campo de captura
  vira uma linha de texto simulada acima do cartão). O H1 nunca ultrapassa três linhas em 360px.
  O visual carrega com `loading="eager"` e prioridade alta por ser o LCP.

---

### S2 — Faixa de fatos

- **Objetivo.** Substituir a prova social que ainda não existe por fatos verificáveis, reduzindo o
  risco percebido logo após a promessa. Decisão D6.
- **Mensagem.** Quatro fatos curtos, em uma linha cada: "14 dias grátis", "Sem cartão de crédito",
  "Preço por empresa, não por pessoa", "Entre com a conta Google". Texto canônico em 4.5.
- **CTA.** Nenhum. É uma faixa de leitura, não de ação.
- **Evidência / visual.** Faixa de baixa altura, fundo `--sunken`, quatro itens com ícone Lucide
  (já instalado) e texto curto. Sem números inventados, sem logotipos de empresas, sem selos que
  não podemos comprovar.
- **Comportamento mobile.** Grade de 2x2, texto reduzido, sem rolagem horizontal. Nunca vira
  carrossel: carrossel esconde conteúdo e não é lido por quem passa rápido.
- **Quando houver clientes reais.** Esta faixa cede lugar a depoimentos com nome, empresa e cargo
  (pendência P5); até lá, nada de "empresas de todo o Brasil confiam".

---

### S3 — Demonstração da IA: "Descreveu, virou tarefa"

- **Objetivo.** Provar o diferencial em 30 segundos, sem cadastro, e transformar interesse em
  clique.
- **Mensagem.** "Escreva o pedido do jeito que você falaria. O Tarefus devolve a tarefa montada —
  e você aprova antes de salvar." A aprovação humana é parte da mensagem, não uma nota de rodapé:
  é o que diferencia de "IA que faz coisa sozinha" e é o que o código realmente faz (F10).
- **CTA.** Primário "Começar teste grátis de 14 dias", posicionado logo abaixo do resultado.
- **Evidência / visual.** Demonstração encenada, sem chamar a API em produção:
  - três a quatro exemplos prontos em abas ou pílulas por área (Comercial, Operações, Financeiro,
    Marketing), reaproveitando `AI_PROMPT_EXAMPLES` de `src/data/helpData.ts`;
  - ao escolher um exemplo, o texto é "digitado" no campo e, após ~600ms de estado de carregamento,
    aparece o cartão estruturado com título, responsável sugerido, prazo calculado, etiquetas e
    checklist;
  - abaixo do resultado, dois botões inertes reproduzindo a interface real — "Aprovar e criar" e
    "Editar sugestão" — com a legenda "Assim é no produto: nada é salvo sem a sua aprovação".
  - **Decisão D3:** a demonstração é pré-computada, não conectada ao endpoint. Motivos: custo por
    visitante desconhecido, exposição do endpoint a abuso anônimo, latência variável na primeira
    dobra e risco de resultado ruim justamente no momento de maior atenção.
- **Comportamento mobile.** Exemplos viram uma lista de pílulas com rolagem horizontal contida
  (com indicação visual de que há mais itens); campo e resultado empilhados; a animação de digitação
  é suprimida sob `prefers-reduced-motion` e substituída pelo texto final imediato.

---

### S4 — Como funciona em 3 passos

- **Objetivo.** Responder "quanto trabalho dá começar?" e neutralizar a objeção de adoção.
- **Mensagem.** Três passos, um verbo cada:
  1. **Crie os quadros das suas áreas** — comercial, operações, marketing, financeiro. Já vêm
     sugeridos.
  2. **Descreva as tarefas** — por texto ou por voz. A IA monta; você aprova.
  3. **Acompanhe prazos e responsáveis** — o painel mostra o que vence hoje e o que atrasou.
  Linha de apoio: "A equipe entra com a conta Google e recebe um tour de 5 passos na primeira vez."
- **CTA.** Nenhum próprio. A seção alimenta o CTA de S5.
- **Evidência / visual.** Três colunas numeradas, cada uma com um recorte real de tela do produto
  (não ilustração genérica). Numeração tipográfica grande e discreta, em `--text-subtle`.
- **Comportamento mobile.** Empilha em três blocos com a numeração à esquerda do título; recortes
  de tela em largura total, com altura fixa reservada para evitar deslocamento.

---

### S5 — O dia a dia da equipe

- **Objetivo.** Mostrar o produto funcionando: quadro por área e visão individual.
- **Mensagem.** "Cada área tem seu quadro. Cada pessoa tem sua lista." O gestor vê o todo, o
  colaborador vê o que é dele.
- **CTA.** Secundário: "Ver o Tarefus por dentro" (âncora para S6/S7 ou, quando existir, para a página
  de Recursos). O CTA primário não se repete aqui para não saturar.
- **Evidência / visual.** Bloco duplo, alternando lado da imagem:
  - **Quadro por área** — Kanban com as três colunas e cartões reais, com avatares e prazos;
  - **Minhas Tarefas** — a mesma base de dados, filtrada por pessoa.
  Imagens em tema claro por padrão (o produto abre no claro, conforme `index.html`), com variante
  escura servida por `<picture>` quando o visitante estiver em tema escuro.
- **Comportamento mobile.** Imagem primeiro, texto depois, em cada bloco. O Kanban é apresentado
  recortado na primeira coluna com sugestão visual de continuidade lateral — é assim que ele aparece
  no celular de verdade, e mostrar isso é mais honesto do que espremer três colunas em 360px.

---

### S6 — Prazos que aparecem sozinhos

- **Objetivo.** Entregar o momento "é disso que eu preciso" para o decisor.
- **Mensagem.** "Você não precisa perguntar o que atrasou. O Tarefus mostra." Faixa de tarefas que
  vencem hoje no topo do sistema, contagem de atrasadas no sino de notificações, destaque de prazo
  no próprio cartão.
- **CTA.** Nenhum. Seção de convencimento, não de ação.
- **Evidência / visual.** Recorte da faixa de alerta e do painel de notificações com contagens
  ("Vencem hoje", "Atrasadas"), exatamente como em `src/components/NotificationCenter.tsx`. Os
  números da captura devem ser plausíveis para uma empresa pequena (unidades, não centenas).
- **Comportamento mobile.** Um único recorte, o do sino aberto, que é o mais legível em tela
  estreita. O texto explicativo vem antes da imagem.

---

### S7 — Cada pessoa vê o que precisa

- **Objetivo.** Responder à preocupação de governança do decisor sem transformar a página em
  documento técnico.
- **Mensagem.** Três níveis de acesso, descritos em linguagem de dono de empresa:
  - **Administrador** — configura a empresa, gerencia pessoas e vê o histórico;
  - **Gestor** — cria e organiza os quadros da área e distribui as tarefas;
  - **Colaborador** — executa, atualiza o status e marca o checklist.
  Linha de apoio: "Todo movimento de tarefa fica registrado no histórico."
- **CTA.** Nenhum próprio; link discreto "Ver detalhes de permissões no Guia".
- **Evidência / visual.** Três cartões com o mesmo peso visual (nenhum "plano recomendado" aqui),
  usando as descrições reais de `getRoleBadgeInfo` em `src/utils/rbac.ts` como base, reescritas em
  linguagem simples.
- **Comportamento mobile.** Empilha em três cartões; a linha do histórico vira um bloco de destaque
  abaixo deles.

---

### S8 — Tarefus x planilha e grupo de WhatsApp

- **Objetivo.** Vencer o concorrente real do público, que não é outro software, e fazer isso sem
  atacar nenhuma marca.
- **Mensagem.** "Você já organiza o trabalho de algum jeito. A pergunta é quanto isso custa em
  retrabalho." Comparação em quatro linhas: onde a tarefa vive, quem é o responsável, o que
  acontece com o prazo, o que sobra de histórico.
- **CTA.** Primário: "Testar grátis por 14 dias".
- **Evidência / visual.** Tabela de três colunas (Planilha · Grupo de mensagens · Tarefus) com
  linguagem factual e sem ironia. Não citar marcas de concorrentes de software por nome; "grupo de
  mensagens" cobre a realidade sem depender de marca.
- **Comportamento mobile.** A tabela vira uma lista de quatro blocos, cada um com o critério em
  negrito e as três respostas em linhas curtas. Nunca rolagem horizontal de tabela.

---

### S9 — Seus dados e seus acessos

- **Objetivo.** Reduzir o risco percebido de confiar o trabalho da empresa a um produto novo.
- **Mensagem.** Somente o que é verificável hoje: dados na infraestrutura do Google Cloud
  (Firestore); acesso por e-mail e senha ou conta Google; três níveis de permissão; histórico de
  atividades; exportação em JSON ou CSV a qualquer momento; e exclusão dos dados a pedido.
- **CTA.** "Ler no Guia" e, no rodapé, Política de Privacidade e Termos.
- **Evidência / visual.** Bloco sóbrio, três a quatro itens com ícone. Sem escudos, cadeados
  gigantes ou selos falsos de certificação.
- **Comportamento mobile.** Lista simples, um item por linha.
- **Bloqueio.** Esta seção **não pode ir ao ar** enquanto `firestore.rules` estiver com
  `allow read, write: if true` e o sistema for single-tenant. Riscos R1 e R2 na seção 9.

---

### S10 — Teste 14 dias, depois escolha o plano

- **Objetivo.** Antecipar a pergunta do preço e conduzir para a página de Planos sem perder o
  visitante.
- **Mensagem.** "Comece com 14 dias grátis, sem cartão e com o plano completo. No fim do teste você
  escolhe se continua — e o que já está no sistema fica visível por mais 30 dias."
- **CTA.** Primário "Começar teste grátis"; secundário "Ver os planos" → `/planos`.
- **Evidência / visual.** Bloco único, centralizado, com três marcadores: o que está incluso no
  teste, o que acontece no 15º dia e como cancelar. **Sem valores nesta página**, mesmo com os
  preços já definidos: a página de Planos é a fonte única (decisão D8).
- **Comportamento mobile.** Bloco em largura total, CTAs empilhados, primário acima.

---

### S11 — Perguntas frequentes

- **Objetivo.** Derrubar as últimas objeções e capturar busca de cauda longa.
- **Mensagem.** Onze perguntas, respondidas em no máximo três linhas. Copy na seção 4.4.
- **CTA.** Ao final: "Não achou sua dúvida? Veja o Guia" → `/guia`.
- **Evidência / visual.** Acordeão com o primeiro item aberto. Todas as respostas presentes no HTML
  desde o carregamento (ocultas por `hidden`, não por remoção do DOM), para que sejam indexadas e
  correspondam ao dado estruturado `FAQPage`.
- **Comportamento mobile.** Mesmo acordeão; cabeçalhos com alvo de toque de 48px e `aria-expanded`.

---

### S12 — Chamada final

- **Objetivo.** Fechar com quem rolou a página inteira.
- **Mensagem.** Repetir a promessa central em uma frase e remover a última fricção.
- **CTA.** Primário "Começar teste grátis de 14 dias" + microcopy de risco zero.
- **Evidência / visual.** Bloco de respiro alto, fundo `--raised`, sem imagem concorrendo com o
  botão.
- **Comportamento mobile.** Botão em largura total; a barra fixa (SF) é ocultada enquanto esta
  seção está visível, para não duplicar o mesmo botão na tela.

---

### S13 — Rodapé

- **Objetivo.** Fechar a navegação, sustentar credibilidade institucional e atender exigências
  legais.
- **Mensagem.** Quatro colunas: Produto (Recursos, Planos, Guia), Empresa (Sobre, Contato),
  Legal (Política de Privacidade, Termos de Uso, Encarregado de dados/LGPD), Acesso (Entrar,
  Criar conta).
- **CTA.** Nenhum destacado; links de texto.
- **Evidência / visual.** Razão social e CNPJ em texto pequeno (pendência P1), e-mail de contato,
  ano corrente. Sem ícones de redes sociais vazias — link para rede sem conteúdo tira credibilidade.
- **Comportamento mobile.** Colunas empilhadas na ordem Produto, Empresa, Legal, Acesso.

---

### SF — Barra fixa de CTA no celular

- **Objetivo.** Recuperar o clique de quem rolou muito e não quer voltar ao topo.
- **Mensagem.** Rótulo curto: "Testar grátis · 14 dias".
- **CTA.** Primário, ocupando a largura menos as margens.
- **Evidência / visual.** Barra inferior com fundo `--raised`, borda superior `--line`, respeitando
  `env(safe-area-inset-bottom)`.
- **Comportamento.** Aparece somente abaixo de 768px, depois que o herói sai da tela; some quando
  S12 entra em cena; nunca cobre conteúdo interativo (o `<main>` recebe `padding-bottom` do tamanho
  da barra). Não é dispensável por engano — não usar botão de fechar minúsculo.

---

## 4. Copy inicial

### 4.0 Tom de voz

- **Segunda pessoa, direta.** "Você vê", "sua equipe", não "os usuários".
- **Frase curta.** Máximo de 20 palavras por frase na primeira dobra.
- **Verbo concreto.** "Mostra", "avisa", "sugere", "registra" — não "potencializa", "revoluciona".
- **Português brasileiro comercial, sem gírias e sem inglês desnecessário.** "Quadro", não "board";
  "etapa", não "coluna do workflow"; "IA", não "AI". Exceções aceitas por serem correntes:
  "Kanban", "checklist", "e-mail".
- **Nunca prometer resultado não medido.** Benefício é o que o software faz, não o que a empresa
  vai ganhar.
- **Linguagem neutra de gênero** para pessoas não identificadas: "quem faz", "a pessoa
  responsável", "a equipe".

**Palavras e construções banidas:** "aumente sua produtividade", "produtividade 10x", "revolucione
sua gestão", "solução completa", "plataforma all-in-one", "transforme seu negócio", "nunca mais
perca um prazo" (promessa absoluta que o produto não garante), "economize horas por semana",
"líder de mercado", "milhares de empresas".

---

### 4.1 Herói

**H1 recomendado**

> Cada tarefa da sua equipe com um dono e um prazo

**Variantes para teste posterior** (uma por vez, mínimo de duas semanas ou 1.000 visitantes por
variante — o que vier depois):

- B: `Você para de perguntar em que pé está cada tarefa`
- C: `Descreva a tarefa. O Tarefus monta e você aprova.`

**Subtítulo (recomendado)**

> O Tarefus organiza o trabalho da sua pequena empresa em quadros por área. Descreva a tarefa por
> texto ou por voz: a IA sugere título, responsável, prazo e checklist — e nada é salvo antes da
> sua aprovação.

**Microcopy sob os botões**

> 14 dias grátis · Não pedimos cartão de crédito · Plano completo durante o teste

**Legenda do visual (acessível a leitores de tela, `alt`)**

> Campo de texto do assistente com a frase "Enviar proposta revisada para o cliente Alpha até
> sexta" e, ao lado, o cartão de tarefa gerado com responsável, prazo de sexta-feira e checklist de
> três itens.

---

### 4.2 Biblioteca de CTAs

Um único rótulo primário em toda a página evita diluir a mensagem e simplifica a leitura dos
eventos de analytics.

| Uso | Rótulo | Destino | Observação |
|---|---|---|---|
| Primário (herói, S3, S8, S10, S12, barra fixa) | **Começar teste grátis de 14 dias** | `/cadastro` | Em espaços estreitos (nav, barra fixa): **Testar grátis** |
| Secundário do herói | **Ver como funciona** | âncora `#demonstracao` (S3) | Rolagem suave; sem modal |
| Secundário de recursos | **Ver o Tarefus por dentro** | âncora `#dia-a-dia` | — |
| Planos | **Ver os planos** | `/planos` | Rótulo do menu: **Planos** (alinhado ao Agente 2) |
| Ajuda | **Ver o Guia** | `/guia` | — |
| Login | **Entrar** | `/entrar` | Link de texto, nunca botão preenchido |

**Microcopy de apoio reutilizável**

- Curta: "Sem cartão de crédito."
- Média: "14 dias grátis, com o plano completo. Sem cartão de crédito."
- Fechamento (S12): "Comece hoje. Se não for para a sua empresa, é só não escolher um plano no fim
  do teste — não cobramos nada."

---

### 4.3 Benefícios

Seis blocos. Cada título é um resultado; cada frase é verificável no inventário 1.4.

| # | Título | Texto | Verificação |
|---|---|---|---|
| B1 | Um quadro para cada área | Comercial, operações, marketing, financeiro e atendimento têm quadros separados — e você pode ver todos de uma vez. | F3 |
| B2 | Responsável e prazo no cartão | Toda tarefa mostra quem é responsável, quando vence e em que etapa está. | F1, F4, F5 |
| B3 | Descreveu, virou tarefa | Escreva ou dite uma frase e a IA sugere título, descrição, responsável, prazo, etiquetas e checklist. Você revisa e aprova antes de salvar. | F9, F10, F11 |
| B4 | O atraso aparece sozinho | Uma faixa no topo mostra o que vence hoje e o sino mostra quantas tarefas estão atrasadas. | F5, F8 |
| B5 | Cada pessoa vê a lista dela | A tela "Minhas Tarefas" mostra só o que é daquela pessoa, sem o barulho dos outros quadros. | F7 |
| B6 | Quem pode o quê fica claro | Administrador, gestor e colaborador têm permissões diferentes, e todo movimento fica no histórico. | F12, F13 |

**Variações curtas para uso em grade compacta no celular** (uma linha cada):

- Quadros por área da empresa
- Responsável e prazo em cada cartão
- Tarefa criada a partir de uma frase, com sua aprovação
- Alerta de vencimento e de atraso
- Lista individual por pessoa
- Três níveis de acesso e histórico de atividades

---

### 4.4 Perguntas frequentes

Onze perguntas. As respostas alimentam o dado estruturado `FAQPage` (seção 7) e devem ser idênticas
ao texto exibido. As regras comerciais citadas nas respostas 2, 3, 9, 10 e 11 vêm do plano do
Agente 2 (seção 0.D).

**1. Preciso de cartão de crédito para testar?**
Não. O teste de 14 dias começa com e-mail e senha ou com a sua conta Google, sem cartão. Ao final,
você decide se quer continuar.

**2. O que acontece quando o teste de 14 dias termina?**
Você escolhe um plano para continuar. Se não escolher, o seu espaço entra em modo somente leitura
por 30 dias: dá para consultar e exportar tudo, mas não criar nem editar. Depois disso o acesso é
bloqueado. Nada é cobrado sem a sua escolha.

**3. Minha equipe é pequena. Compensa?**
O Tarefus foi feito para equipes de 3 a 35 pessoas. Se hoje as tarefas vivem em planilha e em grupo
de mensagens, o ganho aparece já na primeira semana: cada demanda passa a ter dono, prazo e etapa.
E como a cobrança é por empresa, colocar mais gente para colaborar não muda a fatura dentro do
limite do plano.

**4. Minha equipe vai conseguir usar?**
São três etapas — a fazer, fazendo e concluído — e um cartão por tarefa. Quem entra pela primeira
vez recebe um tour de 5 passos, e há uma central de ajuda dentro do sistema.

**5. Como funciona a criação de tarefas com IA?**
Você descreve o que precisa ser feito, por texto ou por voz. A IA devolve um rascunho com título,
descrição, responsável sugerido, prazo, etiquetas e checklist. Você revisa, edita se quiser e
aprova. Nada é salvo sem a sua aprovação.

**6. O ditado por voz funciona no meu computador?**
O ditado usa o reconhecimento de voz do navegador e funciona no Google Chrome e no Microsoft Edge.
Em outros navegadores, você digita a descrição normalmente.

**7. Dá para usar no celular?**
Sim. O Tarefus abre no navegador do celular, e os cartões podem ser movidos com o toque.

**8. Onde ficam os dados da minha empresa?**
Os dados ficam na infraestrutura de nuvem do Google (Firestore). O acesso é feito por e-mail e
senha ou por conta Google, com três níveis de permissão, e as ações ficam registradas no histórico.

**9. Consigo exportar ou apagar meus dados?**
Sim. A exportação em JSON ou CSV fica disponível a qualquer momento, inclusive durante os 30 dias
de modo somente leitura depois do teste. Para excluir a conta e os dados, basta pedir pelo e-mail
de suporte; a exclusão é concluída em até 30 dias.

**10. Quanto custa depois do teste?**
Os valores ficam na página de Planos. A cobrança é por empresa, não por pessoa: um valor fixo em
reais pelo plano, com a equipe toda dentro do limite de membros dele.

**11. Preciso escolher o plano antes de testar?**
Não. O teste já começa com um plano completo liberado e você só decide qual assinar no fim dos 14
dias. A troca de plano é feita pelo próprio painel.

> **Nota de execução.** As respostas 2, 8 e 9 declaram compromissos operacionais (prazo de
> exportação, exclusão e suporte). Elas só podem ir ao ar depois de confirmadas com o responsável
> pelo produto e refletidas na Política de Privacidade — pendências P2 e P3.

---

### 4.5 Copy final das demais seções

As seções 4.1 a 4.4 trazem herói, CTAs, benefícios e FAQ. Abaixo está o texto definitivo do
restante da página, organizado conforme os contratos de props da seção 6.3. **Onde a seção 3 traz
uma versão resumida do texto, vale o que está aqui.** Nada precisa ser escrito do zero na
implementação.

#### S2 — Faixa de fatos (`FactStripProps.facts`)

| Ícone (Lucide) | Texto |
|---|---|
| `CalendarClock` | 14 dias grátis |
| `CreditCard` | Sem cartão de crédito |
| `Building2` | Preço por empresa, não por pessoa |
| `LogIn` | Entre com a conta Google |

#### S4 — Comece em três passos (`StepsSectionProps`)

- **Eyebrow:** Como funciona
- **Título:** Comece em três passos
- **Subtítulo:** Sem implantação, sem consultoria e sem migrar planilha.

| # | Título | Descrição |
|---|---|---|
| 1 | Crie os quadros das suas áreas | Comercial, operações, marketing, financeiro, atendimento. Você renomeia, adiciona ou remove quando quiser. |
| 2 | Descreva as tarefas | Escreva ou dite uma frase. A IA sugere título, responsável, prazo e checklist — e você aprova antes de salvar. |
| 3 | Acompanhe prazos e responsáveis | O quadro mostra em que etapa cada tarefa está, e o painel avisa o que vence hoje e o que atrasou. |

- **Linha de apoio:** Quem entra pela primeira vez recebe um tour de 5 passos e tem uma central de
  ajuda dentro do sistema.

#### S5 — O dia a dia da equipe (`FeatureShowcaseProps`, `id: 'dia-a-dia'`)

- **Eyebrow:** No dia a dia
- **Título:** Cada área com seu quadro, cada pessoa com sua lista
- **Bullets:**
  - Um quadro por área — ou todas as áreas em uma tela só.
  - Três etapas, a fazer, fazendo e concluído: o cartão muda de etapa arrastando, no computador ou no celular.
  - Em "Minhas Tarefas", cada pessoa vê apenas o que é dela.
- **CTA:** Ver o Tarefus por dentro → `#prazos`

#### S6 — Prazos (`FeatureShowcaseProps`, `id: 'prazos'`, imagem à esquerda)

- **Eyebrow:** Prazos
- **Título:** O atraso aparece antes de o cliente cobrar
- **Bullets:**
  - O cartão mostra a data de entrega e destaca o que vence hoje.
  - Uma faixa no topo avisa as tarefas do dia assim que alguém entra no sistema.
  - O sino mostra quantas tarefas estão atrasadas e quantas vencem hoje.

#### S7 — Cada pessoa vê o que precisa (`RolesSectionProps`)

- **Eyebrow:** Acessos
- **Título:** Cada pessoa vê o que precisa
- **Subtítulo:** Três níveis de acesso, definidos por você.

| Papel | Ícone | Resumo | O que pode fazer |
|---|---|---|---|
| Administrador | `ShieldCheck` | Cuida da empresa dentro do sistema. | Configura os dados da empresa · Adiciona, remove e muda o nível de acesso das pessoas · Vê o histórico completo |
| Gestor | `Briefcase` | Organiza o trabalho da área. | Cria e edita os quadros da área · Distribui tarefas e define prazos · Acompanha o andamento da equipe |
| Colaborador | `UserCheck` | Toca as tarefas do dia. | Cria e edita tarefas · Move o cartão entre as etapas · Marca os itens do checklist |

- **Nota de histórico:** Criação, movimentação, conclusão e exclusão de tarefas ficam registradas,
  com autor e data.
- **Link:** Ver detalhes de permissões no Guia → `/guia`

#### S8 — Planilha, grupo de mensagens e Tarefus (`ComparisonSectionProps`)

- **Título:** Planilha, grupo de mensagens e Tarefus
- **Subtítulo:** Você já organiza o trabalho de algum jeito. A pergunta é quanto isso custa em retrabalho.

| Critério | Planilha | Grupo de mensagens | Tarefus |
|---|---|---|---|
| Onde a tarefa fica | Em uma linha, se alguém lembrar de escrever | No meio da conversa, até alguém rolar para cima | Em um cartão, dentro do quadro da área |
| Quem é o responsável | Uma coluna que nem sempre é preenchida | Quem respondeu por último — ou ninguém | Um ou mais responsáveis, com avatar no cartão |
| O que acontece com o prazo | Só aparece se alguém abrir o arquivo | Depende de alguém lembrar de cobrar | Destaque no cartão, faixa do dia e contagem de atrasadas |
| O que sobra de histórico | A última versão salva | A conversa inteira, sem separar o que era tarefa | Registro de quem criou, moveu, concluiu ou excluiu |
| O que a pessoa nova encontra | Um arquivo que alguém precisa explicar | Meses de mensagens | Os quadros da área e a lista dela |

- **CTA:** Começar teste grátis de 14 dias → `/cadastro`

#### S9 — Seus dados e seus acessos (`TrustSectionProps`)

**Versão Fase 1** (só depois de R1 e R2 resolvidos):

- **Título:** Seus dados e seus acessos

| Ícone | Título | Descrição |
|---|---|---|
| `LogIn` | Acesso com conta própria | Cada pessoa entra com e-mail e senha ou com a conta Google da empresa. |
| `ShieldCheck` | Três níveis de permissão | Você define quem configura, quem organiza e quem executa. |
| `History` | Histórico de atividades | Criação, movimentação e exclusão de tarefas ficam registradas. |
| `Cloud` | Infraestrutura do Google Cloud | O Tarefus roda sobre a nuvem do Google. |
| `Download` | Seus dados são seus | Exportação em JSON ou CSV a qualquer momento, e exclusão dos dados da empresa a pedido. |

**Versão Fase 0** (enquanto não há cadastro aberto — não faz afirmação de segurança):

- **Título:** Como vamos tratar seus dados
- Itens: apenas `Cloud` (infraestrutura do Google Cloud) e `Download` (exportação e exclusão a
  pedido), mais o link para a Política de Privacidade.

#### S10 — Teste e preço (`TrialTeaserSectionProps`)

- **Título:** Teste 14 dias e depois escolha o plano
- **Incluído no teste:**
  - Plano completo liberado durante os 14 dias, sem cartão de crédito
  - Tarefas e checklists ilimitados, em qualquer plano
  - Convide a equipe até o limite de membros do plano
- **Depois do teste:** No 15º dia você escolhe um plano. Se não escolher, o seu espaço fica em modo
  somente leitura por 30 dias — dá para consultar e exportar tudo — e só depois o acesso é
  bloqueado. Nada é cobrado sem a sua escolha.
- **Cancelamento:** No mensal não há fidelidade e o cancelamento é feito pelo painel. No anual, o
  pagamento pode ser parcelado no cartão ou feito à vista por PIX.
- **Preço:** A cobrança é por empresa, não por pessoa, em reais e com nota fiscal.
- **CTAs:** Começar teste grátis → `/cadastro` · Ver os planos → `/planos`

> **Origem das regras.** Teste com plano completo, faixa de membros por plano, modo somente leitura
> de 30 dias, ausência de fidelidade no mensal e parcelamento/PIX no anual vêm de
> `02-pricing-and-guide-plan.md`. Nenhum valor aparece aqui (D8). "Nota fiscal" e "cancelamento
> pelo painel" dependem da implementação de cobrança — se ela não estiver pronta no lançamento,
> remova essas duas linhas em vez de reescrevê-las.

**Versão Fase 0:** título "Vai começar com 14 dias grátis"; corpo: "Quando abrirmos, o teste vai
liberar o plano completo e não vai pedir cartão de crédito. Quem estiver na lista entra primeiro."

#### S12 — Chamada final (`FinalCtaSectionProps`)

- **Título:** Comece hoje com a sua equipe
- **Linha de apoio:** Crie os quadros das suas áreas, descreva a primeira tarefa e veja o trabalho
  se organizar. 14 dias grátis, sem cartão de crédito.
- **CTA:** Começar teste grátis de 14 dias → `/cadastro`

#### S13 — Rodapé (`SiteFooterProps`)

| Coluna | Links |
|---|---|
| Produto | Recursos (`#dia-a-dia`) · Planos (`/planos`) · Guia (`/guia`) |
| Acesso | Entrar (`/entrar`) · Criar conta (`/cadastro`) |
| Legal | Política de Privacidade (`/politica-de-privacidade`) · Termos de Uso (`/termos`) |
| Contato | E-mail de suporte (pendência P3) |

- **Linha final:** Tarefus — [razão social], CNPJ [pendência P1]. © [ano corrente].
- Colunas cujos destinos ainda não existem são omitidas, não desativadas (decisão D13).

#### SF — Barra fixa do celular (`StickyMobileCtaProps`)

- **Fase 1:** "Testar grátis · 14 dias" → `/cadastro`
- **Fase 0:** "Quero ser avisado" → `#lista-de-espera`

#### Variantes da Fase 0 (lista de espera)

Só estes elementos mudam entre as fases; o resto da página é idêntico.

| Elemento | Fase 0 | Fase 1 |
|---|---|---|
| Rótulo do CTA primário | Quero ser avisado quando abrir | Começar teste grátis de 14 dias |
| Destino do CTA primário | `#lista-de-espera` | `/cadastro` |
| Microcopy do herói | Estamos abrindo o acesso aos poucos. Deixe seu e-mail e avisamos quando chegar a sua vez. | 14 dias grátis · Não pedimos cartão de crédito · Plano completo durante o teste |
| S9 | Versão reduzida | Versão completa |
| S10 | "Vai começar com 14 dias grátis" | "Teste 14 dias e depois escolha o plano" |

**Formulário da lista de espera**

| Elemento | Texto |
|---|---|
| Título do bloco | Entre na lista e seja avisado primeiro |
| Rótulo do campo | Seu e-mail de trabalho |
| Placeholder | voce@suaempresa.com.br |
| Campo opcional | Quantas pessoas na sua equipe? (1 a 5 · 6 a 15 · 16 a 30 · mais de 30) |
| Botão | Entrar na lista |
| Sucesso | Pronto. Avisamos assim que o acesso abrir. |
| Erro de validação | Digite um e-mail válido. |
| Erro de envio | Não consegui salvar agora. Tente de novo em alguns instantes. |
| Linha de privacidade | Usamos seu e-mail apenas para avisar sobre a abertura. Sem spam, e você pode pedir a remoção quando quiser. |

> **Decisão de implementação pendente:** onde guardar os e-mails. Recomendação padrão: uma coleção
> `waitlist` no Firestore já existente, com regra que permita **apenas criação** de documento e
> nenhuma leitura pública — é o caminho de menor custo e não depende de serviço novo. A alternativa
> (formulário externo) evita mexer nas regras, mas tira o dado do seu controle.

---

### 4.6 Capturas de tela e textos alternativos

**Regras para todas as capturas**

- Dados fictícios plausíveis para uma empresa pequena: use os nomes já existentes no sistema (Ana
  Silva, Carlos Mendes, Beatriz Lima, Rodrigo Souza, Juliana Costa) e um nome de empresa fictício
  na barra superior. Nenhum e-mail, telefone ou cliente real.
- Números pequenos e coerentes: 4 a 8 cartões por quadro, 1 a 3 tarefas atrasadas.
- **Nenhuma captura pode exibir o bloco de acesso rápido de demonstração** nem qualquer senha.
- Tema claro como padrão e uma variante escura de cada imagem, servidas por `<picture>`.
- Exportar em AVIF com alternativa WebP, 2x para telas de alta densidade, largura máxima de
  1200px, e sempre com `width` e `height` declarados.

| ID do arquivo | Seção | O que capturar | Texto alternativo |
|---|---|---|---|
| `hero-composicao` | S1 | Campo do assistente com a frase de exemplo, seta e o cartão de tarefa gerado | Campo de texto do assistente com a frase "Enviar proposta revisada para o cliente Alpha até sexta" e, ao lado, o cartão de tarefa gerado com responsável, prazo de sexta-feira e checklist de três itens |
| `passo-1-quadros` | S4 | Seletor de quadros por área na barra superior | Barra de quadros do Tarefus com as áreas comercial, operações, marketing e financeiro |
| `passo-2-assistente` | S4 | Assistente de IA com o rascunho já preenchido e os botões de aprovar e editar | Tela do assistente com o rascunho da tarefa preenchido e os botões "Aprovar e criar" e "Editar sugestão" |
| `passo-3-prazos` | S4 | Faixa de tarefas que vencem hoje no topo do sistema | Faixa amarela no topo do Tarefus avisando que há tarefas com vencimento para hoje |
| `quadro-por-area` | S5 | Kanban completo com as três colunas e cartões com avatar e prazo | Quadro Kanban do Tarefus com as colunas a fazer, fazendo e concluído e cartões mostrando responsável e prazo |
| `minhas-tarefas` | S5 | Tela "Minhas Tarefas" de um colaborador | Tela "Minhas Tarefas" mostrando apenas as tarefas atribuídas a uma pessoa |
| `alertas-prazo` | S6 | Painel de notificações aberto, com as contagens de hoje e atrasadas | Painel de notificações do Tarefus mostrando a contagem de tarefas que vencem hoje e de tarefas atrasadas |
| `og-tarefus` | Compartilhamento | Composição 1200×630 com o quadro em destaque e a marca discreta no canto | Quadro do Tarefus com cartões de tarefa mostrando responsável e prazo |

---

## 5. Recomendações inspiradas nas referências

**Regra de originalidade, válida para todo o time de execução.** As referências entram como
princípio de comunicação, nunca como fonte de texto, layout, grade, ilustração, paleta,
tipografia ou nome de seção. É proibido: copiar frases (mesmo traduzidas), reproduzir estrutura de
página seção a seção, imitar identidade visual ou usar marcas de terceiros na página. Antes do
lançamento, cada bloco de copy passa por uma verificação de originalidade (busca literal das frases
do herói e dos títulos de seção).

| Referência | Princípio a aprender | Como aplicamos no Tarefus | O que **não** copiar |
|---|---|---|---|
| **ElevenLabs** | Demonstrar o produto na própria página, antes de explicar | S3 entrega o "descreveu, virou tarefa" com exemplos prontos e resultado visível | Estética de laboratório de IA e vocabulário técnico de modelos |
| **Superhuman** | Posicionamento afiado e uma promessa que exclui gente | Assumimos "pequenas empresas de 3 a 35 pessoas" e recusamos falar com todos | Tom de exclusividade e lista de espera; nosso público quer entrar hoje |
| **Tactiq** | Clareza sobre o que entra e o que sai, sem prometer mágica | Toda seção diz o que o software faz, não o que a empresa vai ganhar | Ênfase em integrações que não temos |
| **Cursor** | A tela do produto é o herói; o visual mostra trabalho real | Herói com cartão de tarefa real e recortes reais em S4/S5/S6 | Estética escura de ferramenta para desenvolvedor |
| **ChatGPT** | Um único campo de entrada como convite óbvio à ação | O campo do assistente organiza o herói e S3 | Interface de chat aberto; o Tarefus não é um chat |
| **monday.com** | Falar a língua do dia a dia e mostrar times de verdade | Quadros nomeados por área de empresa brasileira em todos os exemplos | Excesso cromático, carrosséis longos e formulário de contato como CTA |
| **Notion** | Blocos modulares e biblioteca de exemplos que ensina o uso | Exemplos por área em S3 e o Guia como destino de aprofundamento | Página longuíssima com dezenas de seções; nossa meta é quatro rolagens |

**Três decisões editoriais derivadas das referências**

1. **Mostrar antes de contar.** A primeira dobra tem produto visível, não ilustração abstrata.
2. **Uma promessa, não um catálogo.** Recursos entram como prova da promessa, nunca como lista.
3. **Honestidade como diferencial competitivo.** Sem prova social inventada, sem selo não
   comprovado, sem número sem medição. Para um produto novo no mercado brasileiro, ser pego
   exagerando custa mais do que qualquer ganho de conversão.

---

## 6. Componentes e contratos de props

### 6.1 Decisão de arquitetura da rota pública

O aplicativo hoje não tem roteador: `src/App.tsx` renderiza `AuthPage` quando não há sessão, e
`server.ts` devolve `dist/index.html` para qualquer caminho (`app.get('*all', ...)`). Uma homepage
pública precisa de HTML próprio, com `<title>`, descrição e dados estruturados corretos, e não
deveria carregar `TaskProvider`, Firebase e o pacote de arrastar e soltar só para mostrar texto.

**Recomendação (decisão D1): transformar o projeto em MPA do Vite, com duas entradas.**

| Entrada | Arquivo | Serve | Observação |
|---|---|---|---|
| Site público | `index.html` | `/`, `/planos`, `/guia`, páginas legais | `<head>` estático completo; sem Firebase no pacote |
| Aplicação | `app.html` | `/app`, `/entrar`, `/cadastro` e o restante | `<meta name="robots" content="noindex">` |

No Express, servir `dist/index.html` para as rotas públicas e `dist/app.html` como fallback das
demais, mantendo `express.static(distPath)` antes de ambos.

**Por que assim.** Não adiciona dependência; entrega HTML real com as metatags certas na primeira
resposta (o que resolve a maior parte do SEO básico e o compartilhamento em redes); mantém o pacote
JavaScript da homepage pequeno; e é reversível — voltar a uma única entrada é um ajuste de
configuração.

**Alternativas descartadas.** (a) `react-router` com a home dentro do mesmo SPA: adiciona
dependência, mantém o `<head>` genérico e faz o visitante baixar o aplicativo inteiro para ler uma
página de vendas. (b) Migrar para um framework com renderização no servidor (Next.js, Astro):
resolve SEO de forma superior, mas é uma migração de porte incompatível com esta etapa. (c) HTML
estático puro sem React: mais rápido, porém duplica o sistema visual e impede reaproveitar tokens e
componentes. **Caminho de evolução:** se o tráfego orgânico virar canal principal, pré-renderizar a
rota `/` com `react-dom/server` no build, sem trocar de framework.

**Regras de implementação para o agente que for construir:**

- Nenhuma dependência nova. Usar o que já existe: `react`, `lucide-react`, `clsx`,
  `tailwind-merge`, Tailwind v4.
- Usar os tokens de `src/index.css` (`bg-app`, `bg-surface`, `bg-sunken`, `text-ink`, `text-muted`,
  `text-subtle`, `border-line`). Nenhuma cor solta na homepage.
- Reaproveitar `src/components/ui/AiMark.tsx` na identificação de conteúdo gerado por IA.
- Todo o texto vive em `src/content/home.ts`, tipado. Componentes não contêm frases.
- Nenhum componente da homepage importa `TaskContext`, `firebase` ou `@hello-pangea/dnd`.
- Imagens em `public/site/`, formato AVIF/WebP, com `width`, `height` e `alt` obrigatórios.

### 6.2 Mapa de arquivos proposto

```
src/site/
  HomePage.tsx                 // composição da rota "/"
  sections/
    SiteHeader.tsx
    HeroSection.tsx
    FactStrip.tsx
    AiDemoSection.tsx
    StepsSection.tsx
    FeatureShowcase.tsx        // usado por S5 e S6
    RolesSection.tsx
    ComparisonSection.tsx
    TrustSection.tsx
    TrialTeaserSection.tsx
    FaqSection.tsx
    FinalCtaSection.tsx
    SiteFooter.tsx
    StickyMobileCta.tsx
  ui/
    CtaButton.tsx
    SectionShell.tsx
    SectionHeading.tsx
    ScreenshotFigure.tsx
    Accordion.tsx
  hooks/
    useInViewOnce.ts
    usePrefersReducedMotion.ts
src/content/home.ts            // toda a copy, tipada
src/analytics/track.ts         // camada única de eventos
```

### 6.3 Contratos de props

```ts
// ---------- Tipos compartilhados ----------

/** Identificadores estáveis de seção: usados em âncoras, `section_view` e `cta_click`. */
export type SectionId =
  | 'hero' | 'fatos' | 'demonstracao' | 'passos' | 'dia-a-dia' | 'prazos'
  | 'papeis' | 'comparativo' | 'seguranca' | 'teste' | 'perguntas' | 'chamada-final';

export type CtaVariant = 'primary' | 'secondary' | 'ghost';
export type CtaSize = 'md' | 'lg';

/** Origem do clique; alimenta `cta_click` sem que o componente conheça o analytics. */
export interface CtaTracking {
  ctaId: string;              // ex.: 'hero_primary'
  sectionId: SectionId;
}

export interface ImageAsset {
  src: string;                // AVIF/WebP em /site/
  srcDark?: string;           // variante para tema escuro
  alt: string;                // obrigatório; vazio só em imagem puramente decorativa
  width: number;
  height: number;
}

// ---------- Primitivos ----------

export interface CtaButtonProps {
  label: string;
  href: string;
  variant?: CtaVariant;       // padrão: 'primary'
  size?: CtaSize;             // padrão: 'lg'
  fullWidth?: boolean;        // padrão: false; true no mobile
  tracking: CtaTracking;
  external?: boolean;         // adiciona rel="noopener noreferrer"
  className?: string;
}

export interface SectionShellProps {
  id: SectionId;
  surface?: 'app' | 'raised' | 'sunken';   // padrão: 'app'
  as?: 'section' | 'footer' | 'header';    // padrão: 'section'
  onFirstView?: (id: SectionId) => void;   // dispara `section_view` uma única vez
  children: React.ReactNode;
}

export interface SectionHeadingProps {
  eyebrow?: string;           // rótulo curto acima do título
  title: string;              // vira <h2>; o <h1> só existe no herói
  subtitle?: string;
  align?: 'left' | 'center';  // padrão: 'left'
  headingLevel?: 2 | 3;       // padrão: 2
}

export interface ScreenshotFigureProps {
  image: ImageAsset;
  caption?: string;
  frame?: 'none' | 'browser' | 'phone';  // padrão: 'none'
  priority?: boolean;                     // true apenas no LCP do herói
}

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;             // texto puro; sem HTML, para espelhar o JSON-LD
}

export interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenId?: string;
  onToggle?: (id: string, isOpen: boolean) => void;  // alimenta `faq_open`
}

// ---------- Seções ----------

export interface NavLink { label: string; href: string; }

export interface SiteHeaderProps {
  links: NavLink[];                 // Recursos, Planos, Guia
  loginHref: string;                // '/entrar'
  cta: { label: string; href: string };
  stickyAfterPx?: number;           // padrão: 120
}

export interface HeroSectionProps {
  headline: string;                 // <h1> — único na página
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };  // âncora '#demonstracao'
  reassurance: string[];            // ['14 dias grátis', 'Sem cartão de crédito', ...]
  visual: ImageAsset;
}

export interface FactItem { icon: string; label: string; }   // `icon` = nome do ícone Lucide
export interface FactStripProps { facts: FactItem[]; }       // exatamente 4 itens

export interface AiDemoExample {
  id: string;                       // 'comercial' | 'operacoes' | ...
  areaLabel: string;
  prompt: string;
  draft: {
    title: string;
    description: string;
    assignee: { name: string; initials: string; colorToken: string };
    dueDateLabel: string;           // já formatado: 'sexta-feira, 5/9'
    tags: string[];
    checklist: string[];            // 2 a 5 itens
  };
}

export interface AiDemoSectionProps {
  heading: SectionHeadingProps;
  examples: AiDemoExample[];              // 3 a 4
  defaultExampleId?: string;
  typingSpeedMs?: number;                 // padrão: 28; 0 sob prefers-reduced-motion
  approvalNote: string;                   // 'Nada é salvo sem a sua aprovação'
  cta: { label: string; href: string };
  onExampleRun?: (exampleId: string) => void;   // alimenta `ai_demo_run`
}

export interface StepItem { number: 1 | 2 | 3; title: string; description: string; image?: ImageAsset; }
export interface StepsSectionProps { heading: SectionHeadingProps; steps: StepItem[]; }

export interface FeatureShowcaseProps {
  id: SectionId;
  heading: SectionHeadingProps;
  bullets: string[];                      // 2 a 4, uma linha cada
  image: ImageAsset;
  imageSide?: 'left' | 'right';           // padrão: 'right'; ignorado no mobile
  cta?: { label: string; href: string };
}

export interface RoleCard { name: string; summary: string; abilities: string[]; icon: string; }
export interface RolesSectionProps {
  heading: SectionHeadingProps;
  roles: RoleCard[];                      // exatamente 3
  historyNote: string;
  guideLink?: NavLink;
}

export interface ComparisonRow {
  criterion: string;                      // 'Onde a tarefa fica'
  spreadsheet: string;
  messagingGroup: string;
  tarefus: string;
}
export interface ComparisonSectionProps {
  heading: SectionHeadingProps;
  rows: ComparisonRow[];                  // 4 a 5
  cta: { label: string; href: string };
}

export interface TrustItem { icon: string; title: string; description: string; }
export interface TrustSectionProps {
  heading: SectionHeadingProps;
  items: TrustItem[];                     // 3 a 4
  guideLink: NavLink;
  legalLinks: NavLink[];
}

export interface TrialTeaserSectionProps {
  heading: SectionHeadingProps;
  included: string[];                     // o que entra no teste
  afterTrial: string;                     // o que acontece no 15º dia
  cancellation: string;
  billingNote?: string;             // 'A cobrança é por empresa, não por pessoa...'
  primaryCta: { label: string; href: string };
  pricingCta: { label: string; href: string };
  // Sem campo de preço por decisão: /planos é a fonte única de valores.
}

export interface FaqSectionProps {
  heading: SectionHeadingProps;
  items: AccordionItemData[];             // 10 a 12
  guideLink: NavLink;
}

export interface FinalCtaSectionProps {
  headline: string;
  supportLine: string;
  cta: { label: string; href: string };
}

export interface FooterColumn { title: string; links: NavLink[]; }
export interface SiteFooterProps {
  columns: FooterColumn[];                // Produto, Empresa, Legal, Acesso
  legalName?: string;                     // razão social — pendência P1
  taxId?: string;                         // CNPJ — pendência P1
  contactEmail: string;
  year: number;
}

export interface StickyMobileCtaProps {
  label: string;
  href: string;
  showAfterSelector: string;              // '#hero' — aparece quando sai da tela
  hideOnSelector: string;                 // '#chamada-final'
}

// ---------- Conteúdo e instrumentação ----------

export interface HomeContent {
  meta: { title: string; description: string; canonical: string; ogImage: ImageAsset };
  header: SiteHeaderProps;
  hero: HeroSectionProps;
  facts: FactStripProps;
  aiDemo: AiDemoSectionProps;
  steps: StepsSectionProps;
  dayToDay: FeatureShowcaseProps;
  deadlines: FeatureShowcaseProps;
  roles: RolesSectionProps;
  comparison: ComparisonSectionProps;
  trust: TrustSectionProps;
  trial: TrialTeaserSectionProps;
  faq: FaqSectionProps;
  finalCta: FinalCtaSectionProps;
  footer: SiteFooterProps;
  stickyCta: StickyMobileCtaProps;
}

/** Camada única de analytics: os componentes chamam `track`, nunca o fornecedor. */
export type AnalyticsEvent =
  | { name: 'home_view'; props: { referrer: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; device: 'mobile' | 'tablet' | 'desktop' } }
  | { name: 'section_view'; props: { sectionId: SectionId } }
  | { name: 'cta_click'; props: { ctaId: string; sectionId: SectionId; label: string; destination: string } }
  | { name: 'ai_demo_run'; props: { exampleId: string } }
  | { name: 'faq_open'; props: { questionId: string } }
  | { name: 'scroll_depth'; props: { percent: 25 | 50 | 75 | 100 } }
  | { name: 'outbound_click'; props: { href: string } }
  | { name: 'web_vitals'; props: { metric: 'LCP' | 'CLS' | 'INP'; value: number } };

export function track(event: AnalyticsEvent): void;
```

### 6.4 Ligações com o restante do produto

| Destino | Rota | O que precisa existir | Dono sugerido |
|---|---|---|---|
| Cadastro (CTA primário) | `/cadastro` | `AuthPage` deve abrir já em modo "criar conta". Hoje o modo inicial é fixo em `login` (`useState<AuthMode>('login')` em `src/components/auth/AuthPage.tsx`). Sugestão: ler o caminho ou um parâmetro e iniciar em `register`. | Agente de implementação |
| Login | `/entrar` | Mesma tela, modo `login`. | Agente de implementação |
| Planos | `/planos` | Estrutura, copy e tabela comparativa definidas em `02-pricing-and-guide-plan.md`. Enquanto a página não existir, o link do menu fica oculto. | Agente 2 |
| Guia | `/guia` e `/guia/[slug]` | Arquitetura, taxonomia e pauta editorial definidas em `02-pricing-and-guide-plan.md`; conteúdo base em `src/data/helpData.ts`. Enquanto não existir, os links "Ver o Guia" são removidos, não desativados. | Agente 2 |
| Legal | `/politica-de-privacidade`, `/termos` | Obrigatórios para o lançamento com cadastro aberto. | Responsável pelo produto |

---

## 7. Estratégia de SEO

### 7.1 Mapa de URLs

| URL | Página | Indexação | Título |
|---|---|---|---|
| `/` | Homepage | Indexar | ver 7.2 |
| `/planos` | Planos | Indexar | definido pelo Agente 2 |
| `/guia` | Guia público | Indexar | definido pelo Agente 2 |
| `/politica-de-privacidade` | Legal | Indexar | — |
| `/termos` | Legal | Indexar | — |
| `/entrar`, `/cadastro` | Autenticação | `noindex, follow` | — |
| `/app/*` | Aplicação | `noindex, nofollow` | — |

Padrões: caminhos em português, minúsculos, com hífen; sem parâmetros na URL canônica; sem barra
final; um único domínio canônico com redirecionamento 301 das demais variações (com e sem `www`).

### 7.2 Metadados da homepage

```html
<html lang="pt-BR">
<title>Tarefus — organize as tarefas da sua equipe com dono e prazo</title>
<meta name="description" content="Quadros por área, responsável e prazo em cada tarefa e criação por IA a partir de uma frase. Teste grátis por 14 dias, sem cartão de crédito.">
<link rel="canonical" href="https://SEU-DOMINIO/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0f17" media="(prefers-color-scheme: dark)">

<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Tarefus">
<meta property="og:title" content="Tarefus — tarefas da equipe com dono e prazo">
<meta property="og:description" content="Quadros por área, responsável e prazo em cada tarefa e criação por IA a partir de uma frase. Teste grátis por 14 dias.">
<meta property="og:url" content="https://SEU-DOMINIO/">
<meta property="og:image" content="https://SEU-DOMINIO/site/og-tarefus.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Quadro do Tarefus com cartões de tarefa mostrando responsável e prazo">
<meta name="twitter:card" content="summary_large_image">
```

Título com 62 caracteres e descrição com 151 — dentro do que costuma ser exibido sem corte.
`SEU-DOMINIO` é substituído quando o domínio for definido (pendência P6). A imagem de
compartilhamento mostra o produto, não o logotipo isolado.

### 7.3 Hierarquia de títulos

Um `<h1>`, nove `<h2>`, `<h3>` apenas dentro de cartões e do acordeão. Nenhum nível é pulado e
nenhum título existe só para efeito visual.

```
h1  Cada tarefa da sua equipe com um dono e um prazo            (S1)
h2  Descreveu, virou tarefa                                      (S3)
h2  Comece em três passos                                        (S4)
  h3 Crie os quadros das suas áreas / Descreva as tarefas / Acompanhe prazos
h2  O dia a dia da sua equipe                                    (S5)
h2  O atraso aparece antes de o cliente cobrar                   (S6)
h2  Cada pessoa vê o que precisa                                 (S7)
  h3 Administrador / Gestor / Colaborador
h2  Planilha, grupo de mensagens e Tarefus                       (S8)
h2  Seus dados e seus acessos                                    (S9)
h2  Teste 14 dias e depois escolha o plano                       (S10)
h2  Perguntas frequentes                                         (S11)
  h3 (uma por pergunta)
h2  Comece hoje com a sua equipe                                 (S12)
```

### 7.4 Dados estruturados (JSON-LD)

Três blocos na homepage: `Organization`, `SoftwareApplication` e `FAQPage`. **`offers` fica fora
até haver preço publicado** — declarar preço falso em dado estruturado é motivo de penalização e
gera desalinhamento com a página de Planos.

```jsonc
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://SEU-DOMINIO/#organizacao",
      "name": "Tarefus",
      "url": "https://SEU-DOMINIO/",
      "logo": "https://SEU-DOMINIO/site/logo-tarefus.png",
      "contactPoint": [{
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "suporte@SEU-DOMINIO",
        "availableLanguage": ["pt-BR"]
      }]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Tarefus",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "inLanguage": "pt-BR",
      "url": "https://SEU-DOMINIO/",
      "publisher": { "@id": "https://SEU-DOMINIO/#organizacao" },
      "description": "Gestão de tarefas para pequenas empresas: quadros por área, responsável e prazo em cada tarefa e criação de tarefas por IA com aprovação humana."
      // "offers" fica fora mesmo com os preços já definidos: eles ainda são hipóteses a validar
      // com os primeiros clientes, e a página de Planos é a fonte única (D8).
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Preciso de cartão de crédito para testar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Não. O teste de 14 dias começa com e-mail e senha ou com a sua conta Google, sem cartão. Ao final, você decide se quer continuar."
          }
        }
        // ... demais perguntas da seção 4.4, com texto idêntico ao exibido
      ]
    }
  ]
}
```

### 7.5 SEO técnico

- `robots.txt` liberando `/`, `/planos`, `/guia` e as páginas legais; bloqueando `/app`, `/entrar`
  e `/cadastro`; apontando o `sitemap.xml`.
- `sitemap.xml` com as páginas públicas e `lastmod` real.
- Imagens com `width`/`height`, `loading="lazy"` abaixo da dobra e `decoding="async"`; somente o
  visual do herói com prioridade alta.
- A fonte Inter já tem `preconnect` e `display=swap` em `index.html`; manter e limitar a dois pesos
  para não penalizar o LCP.
- Nada de conteúdo essencial atrás de interação: todas as respostas do FAQ e o texto das seções
  ficam no HTML desde o carregamento.
- `<noscript>` com a promessa central, os benefícios e o link de cadastro — é a rede de segurança
  para rastreadores e para conexões que falham.
- Sem `hreflang`: a página é pt-BR única.

### 7.6 Termos de busca prioritários

Uso natural, sem repetição forçada, distribuídos entre título, subtítulo, títulos de seção e FAQ:
"organizar tarefas da equipe", "gestão de tarefas para pequenas empresas", "quadro kanban para
equipe", "controlar prazos e responsáveis", "aplicativo de tarefas em português". Termos de cauda
longa entram pelo FAQ e, principalmente, pelo Guia — que é o ativo de conteúdo com maior potencial
orgânico. A pauta editorial de doze artigos já está definida em `02-pricing-and-guide-plan.md`.

---

## 8. Eventos analíticos necessários antes do lançamento

### 8.1 Decisão de ferramenta

**Recomendação (decisão D9): analytics sem cookies e sem identificador pessoal** (Plausible, Umami
ou equivalente autogerenciado), com uma camada própria `track()` que isola o fornecedor.

Motivos: medição estritamente anônima e agregada dispensa banner de consentimento, o que remove uma
barreira visual logo na primeira dobra e reduz o esforço de conformidade com a LGPD; o custo é baixo
e previsível; e a camada `track()` permite trocar de fornecedor sem tocar em componente.

**Alternativa descartada:** GA4 como ferramenta principal — exige banner de consentimento,
transfere dados de comportamento para finalidade publicitária e complica a base legal do
tratamento. Se marketing pago exigir GA4 ou Meta Pixel no futuro, eles entram **atrás de
consentimento explícito** e nunca disparam antes do aceite.

Convenções: nomes em `snake_case`, sem dado pessoal em propriedade, parâmetros UTM lidos da URL e
nunca reescritos, um evento por intenção (não um evento por botão).

### 8.2 Catálogo de eventos

| Evento | Quando dispara | Propriedades | Para que serve |
|---|---|---|---|
| `home_view` | Carregamento da `/` | `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `device`, `theme` | Base do funil e leitura de canal |
| `section_view` | Seção 50% visível por 1s, uma vez por sessão | `section_id` | Descobrir onde a leitura morre |
| `scroll_depth` | 25%, 50%, 75%, 100% | `percent` | Validar o orçamento de quatro rolagens |
| `cta_click` | Clique em qualquer CTA | `cta_id`, `section_id`, `label`, `destination` | Saber qual seção converte |
| `ai_demo_run` | Visitante escolhe um exemplo em S3 | `example_id` | Medir se a demonstração é usada |
| `ai_demo_result_view` | Resultado da demonstração exibido | `example_id` | Separar curiosidade de leitura efetiva |
| `faq_open` | Abertura de uma pergunta | `question_id` | Mapear objeções reais |
| `pricing_link_click` | Clique para `/planos` | `section_id` | Medir a pressão por preço |
| `guide_link_click` | Clique para `/guia` | `section_id` | Medir a demanda por aprofundamento |
| `outbound_click` | Clique para fora do domínio | `href` | Detectar vazamento de tráfego |
| `web_vitals` | Coleta de LCP, CLS e INP | `metric`, `value`, `device` | Guardar a performance real, não só a de laboratório |
| `signup_start` | Abertura de `/cadastro` | `source_section`, `utm_*` | Primeira etapa fora da homepage |
| `signup_submit` | Envio do formulário | `method` (`email` \| `google`) | Medir fricção do formulário |
| `signup_success` | Conta criada | `method` | Conversão principal da homepage |
| `signup_error` | Falha no cadastro | `reason` (código, nunca a mensagem bruta) | Detectar quebra silenciosa |
| `trial_started` | Início efetivo do teste de 14 dias | `plan` (plano em que o teste começou) | Só existe quando o teste for implementado (R4) |
| `activation_first_board_created` | Primeiro quadro criado | — | Ativação |
| `activation_first_task_created` | Primeira tarefa criada | `origin` (`ai` \| `manual`) | Ativação, e mede o peso real da IA |
| `activation_first_ai_task_approved` | Primeira tarefa da IA aprovada | — | Prova de valor do diferencial |
| `activation_second_member_joined` | Segundo membro entra na empresa | — | Sinal mais forte de retenção em equipe |
| `trial_readonly_entered` | Espaço entra em modo somente leitura no 15º dia | `plan` | Mede quantas contas seguem recuperáveis depois do teste |
| `subscription_started` | Assinatura de um plano | `plan`, `cycle` (`mensal` \| `anual`) | Conversão comercial de fato |

Os eventos de `signup_*` e `activation_*` ficam fora da homepage, mas **precisam existir antes do
lançamento**: sem eles, a homepage não tem denominador nem numerador, e qualquer otimização vira
palpite.

### 8.3 Funil e indicadores

```
home_view
  → cta_click                              (interesse)
    → signup_start                         (intenção)
      → signup_success                     (conversão da homepage)
        → trial_started                    (teste iniciado)
          → activation_first_task_created  (valor entregue)
            → subscription_started         (conversão comercial)
```

| Indicador | Definição | Como usar |
|---|---|---|
| Conversão da homepage | `signup_success` ÷ `home_view` | Métrica principal da página |
| Intenção | `cta_click` ÷ `home_view` | Separa problema de mensagem de problema de formulário |
| Perda no cadastro | 1 − (`signup_success` ÷ `signup_start`) | Se alta, o problema não é a homepage |
| Ativação em 24h | `activation_first_task_created` ÷ `trial_started` | Qualidade do tráfego que a página traz |
| Teste para assinatura | `subscription_started` ÷ `trial_started` | Fecha o ciclo; é o número que a estratégia de planos precisa acompanhar |
| Recuperáveis | `trial_readonly_entered` ÷ `trial_started` | Tamanho da base ainda reconquistável nos 30 dias de leitura |
| Profundidade de leitura | `section_view` por seção | Diz qual seção cortar ou reescrever |

**Sobre metas.** Não há histórico próprio nem base para citar números de mercado como se fossem
nossos. A recomendação é rodar as **quatro primeiras semanas sem meta**, apenas medindo, e definir
os alvos a partir da linha de base observada. Meta inventada agora só produziria decisão ruim
depois.

### 8.4 Privacidade na medição

- Nenhum evento carrega e-mail, nome, telefone ou conteúdo digitado pelo visitante.
- `ai_demo_run` registra apenas o identificador do exemplo escolhido; se um campo livre for
  adicionado à demonstração no futuro, o texto **não** pode ser enviado ao analytics.
- IP não é armazenado; agregação no nível de país é suficiente.
- A Política de Privacidade descreve a medição em uma frase, mesmo sendo anônima.

---

## 9. Critérios de aceite e riscos

### 9.1 Critérios de aceite

**Conteúdo e mensagem**

- [ ] Cada afirmação da página tem correspondência na tabela 1.4, ou não está na página.
- [ ] Nenhuma expressão da lista banida (4.0) aparece no texto final.
- [ ] Um único `<h1>`; um único rótulo de CTA primário em toda a página.
- [ ] A primeira dobra comunica: o que é, para quem é, quanto custa começar (grátis, sem cartão).
- [ ] Revisão ortográfica e gramatical em pt-BR concluída por pessoa, não só por ferramenta.
- [ ] Verificação de originalidade feita sobre H1, subtítulo e títulos de seção.

**Funcionamento**

- [ ] Todos os CTAs primários levam a `/cadastro` e a página abre em modo "criar conta".
- [ ] Nenhum link aponta para página inexistente; links de `/planos` e `/guia` ficam ocultos até as
      páginas existirem.
- [ ] A demonstração de S3 funciona sem rede após o carregamento e sem chamar a API.
- [ ] A barra fixa do celular aparece e some conforme especificado e não cobre conteúdo.
- [ ] A página funciona com JavaScript desabilitado no essencial (conteúdo do `<noscript>`).

**Performance** (medida em Lighthouse mobile, rede 4G simulada, e confirmada em campo por
`web_vitals`)

- [ ] LCP ≤ 2,5s; CLS ≤ 0,1; INP ≤ 200ms.
- [ ] JavaScript da rota `/` ≤ 150 KB comprimido; nenhum pacote do aplicativo (Firebase, dnd)
      presente no pacote da homepage.
- [ ] Peso total da primeira dobra ≤ 500 KB, imagens incluídas.
- [ ] Nenhuma imagem sem `width`/`height`.

**Acessibilidade** (WCAG 2.1 nível AA)

- [ ] Contraste mínimo de 4,5:1 para texto e 3:1 para componentes, nos temas claro e escuro.
- [ ] Navegação completa por teclado, com foco visível (o estilo de `:focus-visible` já existe em
      `src/index.css`) e ordem lógica.
- [ ] Link "pular para o conteúdo" como primeiro elemento focável.
- [ ] Acordeão e menu com `aria-expanded`, `aria-controls` e devolução de foco.
- [ ] `prefers-reduced-motion` respeitado em todas as animações, incluindo o efeito de digitação.
- [ ] Toda imagem informativa com `alt` descritivo; imagem decorativa com `alt=""`.
- [ ] Alvos de toque de no mínimo 44×44px no celular.
- [ ] Zoom até 200% sem perda de conteúdo ou rolagem horizontal.

**Responsividade**

- [ ] Verificado em 360, 390, 768, 1024, 1280 e 1440px de largura.
- [ ] Nenhuma rolagem horizontal em nenhuma largura.
- [ ] Tabela do comparativo convertida em blocos abaixo de 768px.
- [ ] Temas claro e escuro conferidos em todas as seções, incluindo capturas de tela.

**SEO**

- [ ] Título, descrição, canônica, OG e Twitter Card presentes e corretos.
- [ ] JSON-LD válido no Rich Results Test, sem `offers`.
- [ ] `robots.txt` e `sitemap.xml` publicados; `/app`, `/entrar` e `/cadastro` com `noindex`.
- [ ] Hierarquia de títulos idêntica à da seção 7.3.

**Analytics**

- [ ] Todos os eventos da seção 8.2 disparando e visíveis no painel.
- [ ] Funil montado ponta a ponta, de `home_view` a `activation_first_task_created`.
- [ ] Nenhum dado pessoal em propriedade de evento (verificado por inspeção das requisições).

**Jurídico e confiança**

- [ ] Política de Privacidade e Termos de Uso publicados e enlaçados no rodapé.
- [ ] Razão social, CNPJ e e-mail de contato no rodapé.
- [ ] Nenhum selo, certificação ou logotipo de terceiro sem comprovação.

### 9.2 Riscos

Ordenados por gravidade. A coluna "Impede o lançamento?" é a que importa para o cronograma.

| ID | Risco | Impacto | Impede o lançamento? | Mitigação |
|---|---|---|---|---|
| **R1** | **Sistema single-tenant.** `firestoreService.ts` usa um documento único de empresa (`single_tenant_company`) e `initialData.ts` traz `company-single-tenant`. Um cadastro público colocaria empresas diferentes no mesmo espaço de dados. | Crítico: exposição de dados entre clientes, incidente de LGPD, perda de confiança irreversível | **Sim** | Isolamento por empresa antes de qualquer cadastro público. Enquanto não existir, a homepage vai ao ar em modo pré-lançamento (9.3) |
| **R2** | **Regras do Firestore abertas.** `firestore.rules` está com `allow read, write: if true` em todas as coleções. | Crítico: qualquer pessoa com a configuração pública do Firebase lê e escreve a base | **Sim** | Regras por autenticação e por empresa. A seção S9 não pode ir ao ar antes disso |
| **R3** | **Contas de demonstração com senha fixa** exibidas na tela de acesso (`handleQuickLogin` com `123456` em `AuthPage.tsx`). | Alto: qualquer visitante entra na base compartilhada; contradiz a seção de segurança | **Sim** | Remover o bloco de acesso rápido do fluxo público ou restringi-lo a um ambiente de demonstração isolado |
| **R4** | **O teste de 14 dias não existe no produto.** As regras já estão definidas (0.D), mas não há estado de teste, contagem de dias, aviso de expiração, modo somente leitura nem limite de membros por plano. | Alto: a promessa central da homepage não tem contrapartida no sistema | **Sim** | Implementar o estado do teste conforme `02-pricing-and-guide-plan.md`: início, fim, avisos dos dias 10 a 14, modo somente leitura por 30 dias e bloqueio |
| **R5** | **A IA depende de chave externa.** Sem `GEMINI_API_KEY`, `server.ts` cai em um analisador local mais simples. | Médio: quem chega pela promessa de IA pode ter resultado inferior ao demonstrado | Não | Monitorar a taxa de uso do fallback; manter a copy em "sugere" e "rascunho"; nunca prometer precisão |
| **R6** | **Ditado por voz só em Chrome e Edge** (`useSpeechRecognition.ts`). | Médio: frustração de quem chega pela promessa de voz | Não | A ressalva do navegador acompanha toda menção a voz, inclusive no FAQ (pergunta 6) |
| **R7** | **Ausência de prova social.** Sem clientes, depoimentos ou casos. | Médio: menor conversão | Não | Faixa de fatos (S2) no lugar; substituir por depoimentos reais assim que houver três clientes dispostos a se identificar |
| **R8** | **Custo de IA durante o teste.** Contas de teste consumindo a API sem limite. | Médio: custo variável imprevisível e vetor de abuso | Não | Cotas mensais por plano já definidas pelo Agente 2 (100, 400 e 1.200 criações); aplicá-las também durante o teste, somadas a um teto diário por conta no endpoint de geração |
| **R9** | **SEO limitado por renderização no cliente**, mesmo com o `<head>` estático. | Médio: indexação mais lenta e ranqueamento pior em conteúdo longo | Não | Metatags e `<noscript>` já resolvem o básico; pré-renderizar `/` se o orgânico virar canal principal |
| **R10** | **As páginas `/planos` e `/guia` ainda não existem.** O planejamento das duas está pronto (Agente 2), mas nenhuma foi construída. | Médio: links quebrados ou seções órfãs | Não | Ocultar o link enquanto a página não existir; nunca publicar link para página inexistente (D13) |
| **R11** | **Semelhança excessiva com as referências.** | Baixo/Médio: risco de imagem e de marca | Não | Regra de originalidade da seção 5 e verificação no aceite |
| **R12** | **Promessas operacionais no FAQ** (exportação em 30 dias, suporte, exclusão). | Médio: promessa sem processo por trás vira reclamação | Não | Confirmar cada compromisso com o responsável antes de publicar (P2, P3) |

### 9.3 Recomendação de lançamento em duas fases

Os riscos R1 a R4 não são de comunicação, são de produto — e três deles bloqueiam o cadastro
público. Em vez de segurar a homepage até que tudo esteja pronto, a recomendação é publicar em duas
fases, com a mesma página e uma única troca de CTA:

**Fase 0 — pré-lançamento** (disponível assim que a página estiver pronta)
Página completa no ar, com uma única diferença: o CTA primário vira **"Quero ser avisado quando
abrir"**, com captura apenas de e-mail e um campo opcional de tamanho da equipe. Ganha-se
indexação, teste de mensagem, lista de interessados e leitura real do funil de topo — sem expor
dados de ninguém. As seções S9 (segurança) e S10 (teste) exibem a versão reduzida, sem afirmações
de isolamento de dados.

**Fase 1 — teste aberto** (após R1, R2, R3 e R4 resolvidos)
O CTA volta a ser "Começar teste grátis de 14 dias", S9 e S10 assumem a versão completa e a lista
da Fase 0 é convidada primeiro — o que dá volume inicial controlado para observar custo de IA (R8)
e ativação antes de investir em aquisição paga.

O trabalho de implementação é praticamente o mesmo: a diferença entre as fases é o destino do CTA
primário e o conteúdo de duas seções, o que justifica prever essa alternância desde o início
(`HomeContent` já permite trocar rótulo e destino sem tocar em componente).

---

## 10. Registro de decisões assumidas

Decisões tomadas dentro da autonomia deste planejamento, com a alternativa descartada.

| ID | Decisão | Justificativa | Alternativa descartada |
|---|---|---|---|
| **D1** | Site público em uma segunda entrada do Vite (`index.html` para o site, `app.html` para o aplicativo) | HTML real com metatags corretas, pacote pequeno, nenhuma dependência nova, reversível | `react-router` no mesmo SPA (mantém `<head>` genérico e carrega o app inteiro); migração para framework com SSR (porte incompatível com esta etapa) |
| **D2** | Página desenhada mobile-first, com orçamento de quatro rolagens no celular | A equipe do cliente usa celular e o decisor lê com pressa | Página longa com dez a quinze seções, no estilo de páginas de referência maiores |
| **D3** | Demonstração da IA pré-computada, sem chamar `/api/generate-task-draft` | Custo por visitante desconhecido, endpoint exposto a abuso anônimo, latência e risco de resultado ruim na hora de maior atenção | Demonstração ao vivo com a API real; vídeo gravado (pesa mais e converte menos que interação) |
| **D4** | Um único rótulo de CTA primário em toda a página | Mensagem consistente e leitura limpa dos eventos | Rótulos variados por seção ("Experimente", "Crie sua conta", "Comece agora") |
| **D5** | Comparativo contra planilha e grupo de mensagens, sem citar marcas de software | É o concorrente real do público e evita comparação de recursos que hoje perderíamos, além de risco de marca | Tabela "Tarefus x Trello x ClickUp" |
| **D6** | Faixa de fatos verificáveis no lugar de prova social | Não há clientes; prova social inventada é o erro mais caro para um produto novo | Depoimentos genéricos, logotipos ilustrativos, "mais de X empresas" |
| **D7** | Posicionamento: clareza (dono e prazo) como espinha dorsal, IA como diferencial, simplicidade como resposta à objeção | É o que o decisor paga, o que prende a atenção e o que destrava o sim, nessa ordem | IA como promessa central; simplicidade como promessa central |
| **D8** | Nenhum valor de preço na homepage; `/planos` é a fonte única | O preço não está definido e duplicar valores gera divergência entre páginas | "A partir de R$ X" no herói ou em S10 |
| **D9** | Analytics anônimo e sem cookies, atrás de uma camada `track()` própria | Dispensa banner de consentimento, simplifica a LGPD, permite trocar de fornecedor sem tocar em componente | GA4 como ferramenta principal (exige consentimento e muda a base legal do tratamento) |
| **D10** | Lançamento em duas fases: pré-lançamento com lista de espera, depois teste aberto | Permite publicar, indexar e testar a mensagem sem esperar o isolamento de dados, que é o bloqueio real | Segurar a homepage até o produto estar multiempresa; abrir cadastro com o produto no estado atual |
| **D11** | Toda a copy centralizada em `src/content/home.ts`, tipada | Permite revisar texto sem mexer em componente e trocar o modo de lançamento sem alterar código de interface | Texto embutido em cada componente |
| **D12** | Capturas de tela em tema claro por padrão, com variante escura via `<picture>` | O produto abre no claro (`index.html`), então a captura corresponde ao que a pessoa verá | Capturas só em tema escuro, por estética |
| **D13** | Links para páginas ainda inexistentes ficam ocultos, não desativados | Link morto ou botão inerte destrói confiança e polui o funil | Publicar `/planos` e `/guia` como "em breve" |

---

## 11. Pendências que dependem do responsável pelo produto

Cada pendência traz uma recomendação padrão para que a execução não pare enquanto a resposta não
vem. A leitura rápida — o que trava o quê — está na **seção 0**.

| ID | Pendência | Recomendação padrão até a resposta |
|---|---|---|
| **P1** | Razão social, CNPJ e endereço para o rodapé e para o dado estruturado `Organization` | Publicar o rodapé sem esses campos apenas na Fase 0; na Fase 1, com cadastro aberto, eles são obrigatórios |
| **P2** | Política de Privacidade e Termos de Uso (quem redige, prazos de exclusão e de exportação) | Assumir exclusão e exportação em até 30 dias, como consta no FAQ, e confirmar antes de publicar a Fase 1 |
| **P3** | Endereço de e-mail de suporte (o prazo já está definido) | O Agente 2 fixou e-mail com resposta em até 24 horas úteis no plano de entrada, com prazos menores nos superiores e WhatsApp apenas no plano Escala. Falta só o endereço, que depende do domínio (P6) |
| **P4** | Região do Firestore e o que pode ser dito sobre localização dos dados | Não afirmar nada sobre localização; dizer apenas "infraestrutura de nuvem do Google" |
| **P5** | Existência de clientes-piloto dispostos a depoimento identificado | Manter a faixa de fatos (S2) até haver pelo menos três depoimentos com nome, cargo e empresa |
| **P6** | Domínio definitivo e e-mail de contato | Deixar `SEU-DOMINIO` como marcador nos metadados; a canônica e o JSON-LD precisam do domínio real antes de publicar |
| **P7** | ~~Faixa de preço pretendida~~ — **resolvido.** Planos e valores definidos pelo Agente 2, ainda como hipótese a validar com os primeiros clientes | A homepage continua sem citar valores (D8); S10 fala de teste e modelo de cobrança, nunca de preço |

---

## 12. Encaminhamento

**Ordem de execução recomendada**

1. ~~Agente 2~~ — **concluído.** Planos, preços, regras do teste e arquitetura do Guia entregues em
   `02-pricing-and-guide-plan.md`. A copy desta homepage já está alinhada (0.D).
2. **Agente de implementação** constrói a homepage conforme as seções 3 a 7, em modo Fase 0.
3. **Páginas `/planos` e `/guia`** entram no ar a partir do plano do Agente 2; até lá, os links
   ficam ocultos (D13).
4. **Correções de produto** (R1 a R4) liberam a virada para a Fase 1 — checklist no Anexo B.

**O que este documento entrega para os próximos**

- Inventário verificado de afirmações permitidas (1.4) e proibidas (1.5) — vale para todas as
  páginas comerciais, não só para a homepage.
- Biblioteca de CTAs e regras de tom de voz (4.0 e 4.2), reutilizáveis em Planos e Guia.
- Contratos de props e mapa de arquivos (6.2 e 6.3), prontos para implementação.
- Catálogo de eventos (8.2) que precisa existir antes de qualquer investimento em aquisição.
- Copy final de todas as seções (4.5), incluindo as variantes da Fase 0, e a especificação das
  capturas de tela com textos alternativos (4.6) — não há nada de criativo pendente.
- `robots.txt`, `sitemap.xml`, `<noscript>` e a especificação da imagem de compartilhamento
  (Anexo A), o checklist de virada de fase (Anexo B) e o roteiro de implementação em seis etapas
  (Anexo C).

**O que ainda não está resolvido e não deveria ser esquecido**

- O produto ainda não separa empresas; nenhuma comunicação comercial deve sugerir o contrário até
  que isso mude.
- Não existe medição de resultado do cliente. Enquanto não existir, a copy permanece descritiva —
  o que o software faz — e não promissora de ganho.

---

## Anexo A — Arquivos prontos

Trocar `SEU-DOMINIO` pelo domínio real (pendência P6) é a única edição necessária.

### A.1 `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /app
Disallow: /entrar
Disallow: /cadastro

Sitemap: https://SEU-DOMINIO/sitemap.xml
```

### A.2 `public/sitemap.xml`

Incluir apenas páginas que já existem; `lastmod` com a data real da última publicação.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://SEU-DOMINIO/</loc>
    <lastmod>2026-09-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Adicionar /planos quando a página for publicada -->
  <!-- Adicionar /guia e cada /guia/[slug] conforme os artigos forem ao ar -->
  <!-- Adicionar /politica-de-privacidade e /termos quando publicados -->
</urlset>
```

### A.3 Conteúdo do `<noscript>` da homepage

Rede de segurança para rastreadores e para conexões que falham. Texto curto, com a promessa, os
benefícios e um caminho de ação.

```html
<noscript>
  <h1>Cada tarefa da sua equipe com um dono e um prazo</h1>
  <p>
    O Tarefus organiza o trabalho da sua pequena empresa em quadros por área. Descreva a tarefa
    por texto ou por voz: a IA sugere título, responsável, prazo e checklist — e nada é salvo
    antes da sua aprovação.
  </p>
  <ul>
    <li>Um quadro para cada área da empresa</li>
    <li>Responsável e prazo em cada cartão</li>
    <li>Alerta do que vence hoje e do que atrasou</li>
    <li>Tela individual com as tarefas de cada pessoa</li>
    <li>Três níveis de acesso e histórico de atividades</li>
  </ul>
  <p><a href="/cadastro">Começar teste grátis de 14 dias</a> — sem cartão de crédito.</p>
</noscript>
```

Na Fase 0, o último parágrafo aponta para `#lista-de-espera` com o rótulo "Quero ser avisado
quando abrir".

### A.4 Especificação da imagem de compartilhamento

| Item | Valor |
|---|---|
| Arquivo | `public/site/og-tarefus.png` |
| Dimensões | 1200 × 630 px |
| Peso máximo | 300 KB |
| Conteúdo | Quadro do Tarefus com três a quatro cartões legíveis mostrando avatar e prazo; marca discreta em um canto |
| Texto na imagem | No máximo seis palavras, com o mesmo sentido do H1 |
| Contraste | Legível como miniatura de 400px de largura |
| O que evitar | Logotipo isolado sobre fundo liso, textos longos, capturas ilegíveis quando reduzidas |

---

## Anexo B — Checklist de virada da Fase 0 para a Fase 1

Só vire a chave quando todas as linhas estiverem marcadas. As quatro primeiras são de produto e
são as que realmente travam.

- [ ] **R1** — Dados isolados por empresa: cada cadastro cria a própria empresa e nenhuma consulta
      cruza empresas.
- [ ] **R2** — `firestore.rules` exige autenticação e restringe o acesso à empresa da pessoa;
      testado com uma conta de outra empresa.
- [ ] **R3** — Bloco de acesso rápido de demonstração removido do fluxo público, e as contas de
      exemplo sem senha padrão.
- [ ] **R4** — Estado do teste de 14 dias no produto: data de início, data de término, avisos dos
      dias 10 a 14 e encerramento.
- [ ] **R4** — Modo somente leitura por 30 dias após o teste, com consulta e exportação liberadas
      e criação bloqueada.
- [ ] **R4** — Limite de membros por plano aplicado, já que a copy promete faixa e não pessoas
      ilimitadas.
- [ ] **R8** — Cotas mensais de criação por IA por plano aplicadas, inclusive durante o teste.
- [ ] **R8** — Limite de uso da geração por IA por conta e por dia.
- [ ] **P2** — Política de Privacidade e Termos de Uso publicados e enlaçados no rodapé.
- [ ] **P1** — Razão social, CNPJ e e-mail de contato no rodapé e no JSON-LD `Organization`.
- [ ] **P6** — Domínio definitivo aplicado na canônica, no OG, no JSON-LD, no `robots.txt` e no
      `sitemap.xml`.
- [ ] Eventos `signup_*`, `trial_started` e `activation_*` disparando e visíveis no funil.
- [ ] Textos trocados conforme a tabela "Variantes da Fase 0" (4.5): CTA, microcopy, S9 e S10.
- [ ] E-mail de aviso enviado para a lista da Fase 0, antes de qualquer investimento em mídia.

---

## Anexo C — Roteiro de implementação em seis etapas

Sequência recomendada para quem for construir, com um critério objetivo de conclusão por etapa.
Cada etapa entrega algo verificável, então dá para parar entre uma e outra sem deixar trabalho pela
metade.

| Etapa | Escopo | Pronto quando |
|---|---|---|
| 1. Fundação | Segunda entrada do Vite (D1), rotas no Express, `src/content/home.ts` com toda a copy das seções 4.1 a 4.5, camada `track()` | `/` responde com HTML próprio, `<head>` correto, e o aplicativo continua funcionando em `app.html` |
| 2. Primitivos | `CtaButton`, `SectionShell`, `SectionHeading`, `ScreenshotFigure`, `Accordion`, hooks de visibilidade e de movimento reduzido | Primitivos renderizam nos dois temas e passam na navegação por teclado |
| 3. Dobra principal | S0, S1, S2 e SF, com a imagem do herói otimizada | LCP medido em ≤ 2,5s no Lighthouse mobile |
| 4. Prova e explicação | S3 (demonstração pré-computada), S4, S5, S6 | A demonstração roda sem rede e respeita `prefers-reduced-motion` |
| 5. Objeção e fechamento | S7, S8, S9, S10, S11, S12, S13 | A tabela do comparativo vira blocos abaixo de 768px e o FAQ espelha o JSON-LD |
| 6. Instrumentação e aceite | Eventos da seção 8.2, `robots.txt`, `sitemap.xml`, JSON-LD, `<noscript>` | Checklist 9.1 inteiro marcado |

**Não faça na mesma etapa:** capturas de tela e código. As imagens da seção 4.6 podem ser
produzidas em paralelo, com placeholders do tamanho final no lugar — assim o layout nunca é
ajustado duas vezes.
