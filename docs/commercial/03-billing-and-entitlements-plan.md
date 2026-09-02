# Plano de Billing, Entitlements e Controle de IA — Tarefus

> **Situação:** planejamento arquitetural; nenhuma cobrança, integração, credencial ou infraestrutura foi criada nesta etapa.
>
> **Escopo temporal:** mercado inicial Brasil, moeda BRL, assinatura por empresa e teste grátis de 14 dias sem plano gratuito permanente.
> **Data da pesquisa de provedores:** 1º de setembro de 2026. Tarifas, disponibilidade e requisitos contratuais devem ser reconfirmados antes da contratação.

## 0. Premissas, decisões arquiteturais e fronteiras

O Tarefus deve cobrar pela organização, e não por pessoa. A organização é a fronteira de dados, autorização, assinatura, limite de membros e orçamento de IA. Um membro pode ter um papel operacional, como administrador, gestor ou membro, e também um papel comercial separado, como proprietário ou administrador de cobrança.

O estado comercial é sempre decidido pelo backend. O provedor de pagamento informa fatos financeiros; o domínio Tarefus os normaliza; o resolvedor de entitlements decide o que cada organização pode usar. Nenhum redirecionamento de checkout, campo enviado pelo navegador, status em cache ou mensagem de webhook isolada concede acesso.

| Decisão assumida | Justificativa | Alternativa descartada agora | Quando revisar |
|---|---|---|---|
| Um trial interno de 14 dias, sem cartão obrigatório, começa na criação da organização. | Reduz fricção para pequenas empresas e evita depender da semântica de trial de um provedor. | Criar assinatura financeira já no cadastro ou exigir cartão. | Se a taxa de abuso ou de conversão justificar cartão antecipado. |
| O trial não cria direito a renovação gratuita e não é reiniciado em reativação. | Mantém a promessa de não haver plano grátis permanente e evita serialização de testes. | Reiniciar trial após cancelamento ou trocar de plano. | Somente por concessão manual, auditada, de suporte. |
| O plano comercial, o preço e os limites são versionados pelo Tarefus e independentes do catálogo do provedor. | Evita lock-in, permite migrar provedor e preserva o preço aceito em uma fatura histórica. | Usar o ID de plano do provedor como fonte de verdade. | Nunca para a autorização do produto. |
| Na primeira versão comercial, upgrade e downgrade são agendados para o próximo período, sem pró-rata automático. | É a regra mais simples, auditável e consistente entre cartão, Pix e boleto. | Cobrança ou reembolso proporcional imediato. | Após validação de volume, suporte e comportamento de cada método de pagamento. |
| Cancelamento padrão é ao fim do período pago; não há exclusão automática de dados ao cancelar. | Evita surpresa ao cliente e separa o encerramento da cobrança da retenção de dados. | Cancelamento imediato com remoção de acesso e dados. | Quando houver política de reembolso e retenção aprovada. |
| O primeiro provedor recomendado é Asaas, atrás de um adaptador interno. | É o melhor encaixe inicial encontrado para SaaS brasileiro com Pix, boleto, cartão, assinatura, reconciliação e NFS-e. | Acoplar a implementação ao Asaas ou escolher apenas pelo menor percentual anunciado. | Após sandbox, proposta comercial e validação fiscal. |
| IA é um entitlement com crédito de experiência e teto financeiro reservado antes da chamada. | Um limite apenas de requisições não controla custo de prompts longos, saída, cache ou concorrência. | Confiar nos limites globais da Gemini API ou cobrar excedentes sem medição. | Quando houver preço de overage e maturidade operacional. |
| Dados de cartão ficam em checkout hospedado ou tokenização do provedor. | Reduz escopo PCI, superfície de ataque e responsabilidade operacional. | Receber PAN e CVV no Express. | Não recomendado. |

### Bloqueador identificado no estado atual

O repositório atual ainda é single-tenant: usa coleções globais, uma empresa fixa, persistência híbrida cliente/Firestore e autorização principalmente no frontend. As regras atuais do Firestore também permitem leitura e escrita sem restrição. Há Firebase no projeto, mas o fluxo principal de sessão ainda não fornece uma fronteira de backend baseada em Firebase ID token verificado.

Portanto, nenhuma funcionalidade de pagamento, entitlement, medição de IA, webhook ou auditoria financeira pode ser habilitada antes de a Fase 0 deste plano estabelecer organizações, membership vinculada ao UID, backend autenticado e regras Firestore restritivas. Esta é uma condição de segurança, não uma melhoria opcional.

---

## 1. Requisitos funcionais e não funcionais

### Requisitos funcionais

1. Cada organização possui no máximo uma assinatura comercial principal ativa por vez, cobrada em BRL e associada a um plano versionado.
2. A organização recém-criada recebe um trial único de 14 dias, sem plano gratuito permanente.
3. O sistema deve suportar os estados trialing, active, payment_pending, canceled e expired, além de um bloqueio de acesso separado para fraude, chargeback ou incidente operacional.
4. Somente um proprietário ou administrador de cobrança da organização pode iniciar checkout, trocar plano, cancelar, reativar, consultar faturas e administrar meios de pagamento.
5. O plano deve definir entitlements de recursos, assentos incluídos e limites técnicos de IA. A aplicação consulta um snapshot de entitlements, nunca o provedor diretamente.
6. A criação, convite, ativação e reativação de membros devem verificar o limite de assentos no servidor antes de persistir a mudança.
7. Toda cobrança, fatura, pagamento, tentativa, estorno, chargeback, mudança de plano, concessão manual e recalculo de entitlement deve gerar evento de auditoria correlacionável.
8. O backend deve receber, autenticar, deduplicar e processar webhooks assíncronos; uma reconciliação recorrente deve recuperar divergências e eventos perdidos.
9. A IA Gemini deve ser chamada apenas pelo backend, com medição por organização, usuário, operação, período e modelo.
10. A organização deve receber uma mensagem compreensível quando estiver em trial próximo do fim, em cobrança pendente, no limite de assentos ou na cota de IA.
11. Os fluxos devem suportar Pix, boleto e cartão, sem prometer que todos terão débito automático: Pix e boleto podem exigir pagamento manual a cada ciclo.
12. O domínio deve suportar troca futura de provedor sem reescrever regras de plano, acesso, assentos, uso de IA ou histórico interno.

### Requisitos não funcionais

| Categoria | Requisito |
|---|---|
| Segurança | Toda rota comercial e de IA verifica Firebase ID token no backend, membership da organização e papel comercial. O cliente não grava estado financeiro, preço, entitlement, uso ou auditoria. |
| Consistência | Valores monetários são inteiros em centavos BRL; custos Gemini usam microunits inteiros de USD. Datas são armazenadas em UTC com exibição em America/Sao_Paulo. |
| Idempotência | Toda ação mutável de cliente recebe chave de idempotência; todo webhook é deduplicado persistentemente por provedor e ID de evento. |
| Auditabilidade | Cada transição guarda ator ou origem, motivo, correlação, estado anterior, estado posterior, referência externa, horário e versão de catálogo. |
| Disponibilidade | Falha ou atraso de webhook não pode conceder acesso indevido. O acesso já pago mantém a janela definida; a reconciliação recupera atrasos. |
| Privacidade | Logs não retêm cartão, CVV, tokens de autenticação, segredo de webhook, prompt e resposta completos de IA ou PII desnecessária. |
| Portabilidade | O produto usa IDs e estados internos normalizados; IDs de provedor ficam como referências, não como chaves de regra de negócio. |
| Operação | Há alertas para falha de webhook, fila morta, divergência de reconciliação, pico de IA, orçamento global e alteração manual. |
| Experiência mobile | Checkout hospedado, faturas e telas de limite devem ser responsivos, curtos e apresentar status inequívoco; nunca depender apenas de retorno de navegador. |

---

## 2. Glossário de domínio

| Termo | Definição |
|---|---|
| Organização | Tenant comercial do Tarefus. É a empresa cliente que possui dados, membros, assinatura, orçamento de IA e entitlements próprios. |
| Plano | Definição comercial versionada de preço, periodicidade e pacote de entitlements. Um plano não é o objeto de plano do provedor. |
| Assinatura | Contrato interno que vincula uma organização a uma versão de plano e a um período de acesso. Pode ter uma referência a assinatura externa do provedor. |
| Período de teste | Janela única de 14 dias iniciada pelo servidor na criação elegível de uma organização. Dá acesso ao pacote de trial e não cria cobrança por si só. |
| Cobrança | Unidade financeira com valor, vencimento, método, status e referência externa. Para recorrência, cada ciclo pode gerar uma cobrança própria. |
| Fatura | Representação interna da cobrança de um ciclo, incluindo valor contratado, impostos ou documento fiscal quando aplicável, tentativas e conciliação. |
| Entitlement | Direito efetivo de usar um recurso ou consumir uma quantidade. É calculado pelo Tarefus a partir do plano, estado comercial, período e exceções aprovadas. |
| Assento incluído | Quantidade máxima de membros humanos ativos que a organização pode ter sem add-on. Convite pendente, conta desativada e conta técnica explicitamente marcada não contam. |
| Uso de IA | Uma solicitação lógica de IA, sua reserva de orçamento, tentativas externas, metadados de uso, custo estimado, resultado e ajuste de reconciliação. |
| Evento de billing | Fato imutável recebido de um provedor ou produzido internamente, por exemplo pagamento confirmado, falha, estorno, alteração de plano ou expiração de trial. |
| Papel comercial | Permissão para gerir cobrança. Proprietário e billing_admin são distintos de administrador, gestor e membro operacionais. |
| Período de graça | Intervalo curto depois de uma falha de pagamento no qual o acesso pode continuar conforme a política definida, enquanto ocorre a régua de cobrança. |
| Reconciliação | Comparação periódica entre o ledger interno e os recursos autorizados do provedor para detectar evento perdido, duplicado, fora de ordem ou divergência. |

---

## 3. Entidades, campos, Firestore e fonte de verdade

### 3.1 Princípios do modelo

- Toda referência de organização é derivada de membership verificada no backend; um orgId enviado pelo cliente é apenas uma solicitação, não autorização.
- Documentos com preço, cobrança, assinatura, limite, consumo, auditoria e segredo são escritos somente pelo backend com credenciais de servidor.
- O catálogo e o snapshot de entitlement são imutáveis por versão. Uma alteração cria nova versão e evento de migração; não reescreve a história.
- Valores financeiros usam amountCents, currency = BRL e nunca ponto flutuante. Preço, desconto e imposto aceitos são copiados para a fatura do ciclo.
- Timestamps relevantes usam relógio de servidor. Datas fornecidas pelo provedor são preservadas como dados externos e não substituem o horário de recebimento.

### 3.2 Coleções propostas

| Caminho Firestore | Campos essenciais | Leitura permitida | Escrita permitida | Finalidade |
|---|---|---|---|---|
| organizations/{orgId} | legalName, displayName, cnpjHash, status, createdAt, ownerUid | Membros da própria organização, sem dados financeiros sensíveis | Backend | Perfil do tenant; não mistura estado de billing. |
| organizations/{orgId}/members/{uid} | uid, operationalRole, commercialRole, status, activatedAt, deactivatedAt, seatClass | Próprio membro e administradores autorizados | Backend | Fonte de membership e de contagem de assentos. |
| organizations/{orgId}/entitlements/current | entitlementVersion, sourcePlanVersion, subscriptionState, accessMode, validFromAt, validUntilAt, grants, limits, updatedAt | Membros da própria organização | Backend | Projeção segura e somente leitura do direito atual. |
| organizations/{orgId}/aiUsagePeriods/{periodId} | policySnapshot, periodStartAt, periodEndAt, actionsSucceeded, settledCostMicrosUsd, heldWorstCaseCostMicrosUsd, unknownCostMicrosUsd, version | Proprietário e billing_admin podem ver resumo sanitizado | Backend | Portão transacional de orçamento de IA. |
| organizations/{orgId}/aiRequests/{requestFingerprint} | requestId, actorUid, operationKey, idempotencyKeyHash, bodyHash, status, reservationMicrosUsd, usageMetadata, estimatedCostMicrosUsd, resultReference | Somente autor e administradores, em visão sanitizada | Backend | Uma execução lógica de IA por chave idempotente. |
| organizations/{orgId}/aiUsageEvents/{eventId} | type, requestId, amountMicrosUsd, actorUid, reason, previousHash, auditHash, createdAt | Somente visão agregada autorizada | Backend | Ledger append-only de reserva, liquidação, liberação e ajuste. |
| billingPlanVersions/{planVersionId} | planKey, version, activeForNewSales, interval, amountCents, taxBehavior, limits, featureGrants, effectiveFromAt, retiredAt | Backend; uma projeção pública mínima pode ser publicada separadamente | Backend administrativo | Catálogo interno e versionado de ofertas. |
| billingSubscriptions/{subscriptionId} | organizationId, state, planVersionId, provider, providerCustomerId, providerSubscriptionId, currentPeriodStartAt, currentPeriodEndAt, cancelAtPeriodEnd, accessUntilAt, trialEndAt, version | Resumo ao billing_admin da própria organização | Backend | Assinatura canônica do Tarefus. |
| billingInvoices/{invoiceId} | organizationId, subscriptionId, amountCents, currency, dueAt, paidAt, status, paymentMethod, providerInvoiceId, providerChargeId, planSnapshot, fiscalDocumentRef | Billing_admin da própria organização, com dados mínimos | Backend | Histórico financeiro e conciliação por ciclo. |
| billingEvents/{providerEventKey} | provider, providerEventId, eventType, resourceId, receivedAt, verifiedAt, verificationResult, payloadHash, rawPayloadEncryptedRef, processingState, correlationId | Nenhuma leitura de cliente | Backend e worker | Inbox imutável de webhook e eventos internos. |
| billingIdempotency/{requestKey} | scope, organizationId, actorUid, bodyHash, resultReference, createdAt, expiresAt | Nenhuma leitura de cliente | Backend | Impede checkout, cancelamento ou troca duplicados. |
| billingAuditEvents/{auditEventId} | eventType, organizationId, actorType, actorId, requestId, correlationId, before, after, reason, sourceRef, createdAt, previousHash, auditHash | Apenas operação autorizada; cliente recebe visão resumida quando necessário | Backend | Trilha comercial append-only, separada de activity_logs do produto. |
| aiPriceCatalogs/{priceVersion} | modelId, inputMicrosUsdPerToken, cachedInputMicrosUsdPerToken, outputMicrosUsdPerToken, thinkingMicrosUsdPerToken, toolFees, sourceUrl, effectiveFromAt | Backend | Backend administrativo | Tabela de custo imutável usada na liquidação de cada request. |
| billingReconciliations/{runId} | provider, windowStartAt, windowEndAt, result, mismatches, watermark, operator, createdAt | Operação autorizada | Worker e operação | Evidência de varredura, divergência e resolução. |

### 3.3 Campos que nunca podem ser confiados ao cliente

O cliente pode solicitar uma intenção, mas nunca determina:

- organização efetiva, papel comercial, membership, quantidade de assentos ativos ou elegibilidade de trial;
- preço, moeda, desconto, periodicidade, plano, catálogo, imposto, data de vencimento, pró-rata ou acesso até;
- IDs de customer, assinatura, cobrança, fatura, transação, cartão tokenizado ou meio de pagamento externo;
- status de pagamento, pagamento aprovado, chargeback, reembolso, estorno ou validade de documento fiscal;
- estado da assinatura, accessMode, grants, limites, saldo de IA, contador de uso, custo ou ajuste manual;
- modelo Gemini, instruções de sistema, ferramentas, contexto de outra organização, maxOutputTokens ou política de retry;
- ID de evento de webhook, assinatura de webhook, origem, data de entrega ou resultado de conciliação.

Mesmo uma informação que o frontend pode ler, como assentos restantes ou créditos de IA, é somente uma projeção. O backend recalcula e verifica novamente no instante da ação.

### 3.4 Proteção e migração de tenancy

Antes de criar estas coleções, os dados atuais de usuários, tarefas, quadros e empresa precisam passar a conter uma fronteira de organização. A proposta é usar documentos subordinados à organização ou consultas obrigatoriamente filtradas por organizationId, com membership baseada em Firebase UID. A decisão de forma física deve ser feita junto à migração, mas as seguintes regras não mudam:

1. Firestore Rules passam a negar por padrão.
2. Billing, usage, entitlements, webhooks e auditoria não aceitam escrita do SDK cliente.
3. O backend verifica ID token, organização, membership e papel antes de usar credenciais administrativas.
4. O estado atual permissivo não pode coexistir com dados comerciais reais.
5. O activity log atual não é reaproveitado como livro financeiro, pois não possui integridade, origem de servidor ou controle de escrita suficientes.

---

## 4. Máquina de estados de trial e assinatura

O campo principal é subscriptionState. A autorização final é accessMode, derivada de subscriptionState, accessUntilAt, janela de graça e um possível accessHold de segurança. Um cancelamento agendado é um atributo, cancelAtPeriodEnd = true, enquanto a assinatura continua active até o fim do período.

~~~mermaid
stateDiagram-v2
    [*] --> trialing: organização criada pelo servidor
    trialing --> payment_pending: checkout ou primeira cobrança iniciada
    trialing --> active: pagamento confirmado antes do fim do trial
    trialing --> expired: trialEndAt sem pagamento confirmado

    active --> payment_pending: renovação falhou ou cobrança aguarda pagamento
    payment_pending --> active: pagamento confirmado e conciliado
    payment_pending --> expired: graceEndAt sem pagamento confirmado

    active --> canceled: período termina com cancelAtPeriodEnd
    canceled --> expired: acesso do período encerra
    canceled --> payment_pending: reativação após término inicia nova cobrança
    expired --> payment_pending: reativação inicia nova cobrança
    payment_pending --> canceled: cancelamento de cobrança ainda não paga
~~~

| Estado | Significado interno | AccessMode normal | Entrada permitida | Saídas principais |
|---|---|---|---|---|
| trialing | Organização está dentro dos 14 dias de teste único. Não há recebimento confirmado necessário. | full, limitado pelo pacote de trial | Criação elegível de organização | active, payment_pending ou expired |
| active | Existe período pago e conciliado. Pode ter cancelAtPeriodEnd marcado. | full | Pagamento confirmado, migração manual auditada ou reativação confirmada | payment_pending ou canceled |
| payment_pending | Há primeira cobrança ou renovação que aguarda pagamento, foi recusada ou está na régua de cobrança. | full até trialEndAt; grace para renovação paga anteriormente; read_only após o prazo | Checkout criado, boleto ou Pix pendente, falha de cartão, chargeback em revisão | active, canceled ou expired |
| canceled | Cobranças futuras foram interrompidas. O estado é registrado no encerramento da assinatura; não implica nova tentativa de cobrança. | full somente até accessUntilAt se houver período já pago; depois read_only | Cancelamento efetivado ou cancelamento de cobrança pendente | expired ou payment_pending em nova reativação |
| expired | Não há trial ou período pago vigente. Não existe plano grátis contínuo. | read_only por padrão recomendado | Fim de trial, fim de graça, fim de acesso cancelado | payment_pending e depois active |

### Regras de precedência

1. Um pagamento só muda para active depois de webhook autenticado, busca do recurso no provedor e transação interna concluída.
2. O retorno do navegador após checkout é somente uma tela de acompanhamento; não muda o estado.
3. Evento fora de ordem não regride estado: o normalizador consulta o recurso atual do provedor e compara versão ou updatedAt antes de gravar.
4. Chargeback, suspeita de fraude, violação contratual ou incidente podem aplicar accessHold separado. Ele pode reduzir acesso imediatamente sem destruir o histórico da assinatura.
5. Uma organização expirada conserva seus dados segundo a política de retenção, mas não pode criar ou editar dados, convidar membros, usar IA ou iniciar recursos pagos.

---

## 5. Regras de ciclo de vida

### 5.1 Criação de empresa e início do trial

1. O backend recebe uma solicitação autenticada para criar organização.
2. Em transação, ele cria organização, membership do criador com owner e billing_admin, assinatura interna em trialing e snapshot de entitlements de trial.
3. O servidor define trialStartAt e trialEndAt = trialStartAt + 14 vezes 24 horas. A interface apresenta a data em horário de São Paulo.
4. A elegibilidade é única por organização. A prevenção inicial combina UID autenticado, e-mail verificado quando disponível e indícios de conta já convertida; depois da implantação comercial, pode incluir CNPJ normalizado e customer externo. Não bloquear automaticamente casos ambíguos sem trilha de suporte.
5. Nenhuma assinatura externa é criada nesse ponto. Isso evita cliente, cobrança e cartão órfãos.
6. Uma exceção de trial precisa criar um evento manual com operador, motivo, novo prazo e aprovação definida pela operação.

### 5.2 Membros e assentos

- Conta como assento todo membro humano com status active, incluindo owner, billing_admin, admin, manager e member.
- Convite pending, membro deactivated e conta técnica marcada explicitamente como service não contam; contas de serviço não podem ser usadas para contornar o limite de pessoas.
- Antes de aceitar convite, reativar membro ou mudar status para active, o backend calcula activeSeats + 1 e verifica members.maxActive no entitlement atual.
- Quando não houver assento, a operação falha de modo explicável e oferece o fluxo de upgrade ou de desativação de outro membro. Nunca remove ou desativa alguém automaticamente.
- A contagem é feita no servidor em transação, não por uma lista mantida no navegador.

### 5.3 Upgrade

Regra padrão de lançamento: o administrador de cobrança escolhe o plano de destino, o backend valida que o plano existe no catálogo e agenda a troca para currentPeriodEndAt. O preço exibido vem do servidor, é copiado para a instrução de cobrança e fica congelado no evento.

O upgrade não é efetivo antes da data agendada e de confirmação financeira correspondente. Isso evita pró-rata, crédito parcial, refund e diferença de comportamento entre cartão, Pix e boleto. Em caso de necessidade comercial urgente, a operação pode criar uma exceção manual auditada; ela não deve existir como caminho silencioso de produto.

### 5.4 Downgrade

O downgrade é sempre agendado para o fim do período atual. Antes de permitir o agendamento, o backend executa preflight:

- membros ativos devem caber no limite futuro;
- recursos que serão bloqueados devem possuir regra de preservação ou exportação;
- o orçamento de IA do próximo período deve mudar no snapshot futuro, sem alterar consumo histórico;
- não pode haver cobrança ou alteração incompatível em curso.

Se houver membros acima do limite, o downgrade não é agendado até que a organização desative ou remova os membros necessários. Não há redução automática de equipe nem cobrança surpresa pelo plano anterior.

### 5.5 Cancelamento

O padrão é cancelamento ao fim do período pago. O backend envia a instrução ao provedor, marca cancelAtPeriodEnd, registra o motivo opcional e mantém active até accessUntilAt. Na data de término, muda para canceled e, sem novo período, para expired.

Cancelamento imediato, reembolso, crédito ou exceção fiscal exige fluxo operacional separado, com política comercial e financeira definida. Não é parte do caminho automático inicial.

### 5.6 Falha de pagamento

1. Falha, vencimento ou recusa cria ou mantém payment_pending.
2. O backend registra tentativa, método, motivo normalizado e fatura; o provedor pode continuar suas retentativas próprias, mas o Tarefus não presume sucesso.
3. Para renovação de cliente antes ativo, a recomendação é janela de graça de 7 dias, com mensagens no dia da falha, no terceiro dia e no último dia. O valor exato é decisão comercial pendente.
4. Para primeira cobrança após trial, o acesso termina em trialEndAt; não existe graça adicional implícita.
5. Ao fim da graça sem pagamento conciliado, accessMode passa a read_only e subscriptionState a expired.
6. Chargeback aplica accessHold e abre revisão operacional; não deve ser tratado como uma simples recusa de cartão.

### 5.7 Reativação

- Antes do fim do período, se o provedor confirmar reversão do cancelamento, cancelAtPeriodEnd é removido e o estado continua active.
- Após canceled ou expired, a reativação cria nova intenção idempotente de checkout. Só muda para active após pagamento confirmado e conciliado.
- Reativação não reinicia trial, não zera histórico de IA e não apaga faturas anteriores.

### 5.8 Política recomendada após o trial

Até que o produto aprove outra regra, a recomendação é: no primeiro instante após trialEndAt sem pagamento, a organização entra em read_only; dados permanecem preservados por 30 dias para conversão, consulta e exportação; depois entram em archived, sem exclusão automática até que a retenção seja definida com orientação contábil e de privacidade. Essa recomendação é deliberadamente separada da decisão de retenção final na seção 14.

---

## 6. Interface de entitlements desacoplada do provedor

### 6.1 Catálogo de grants

O plano não deve ser testado por nome na UI. Toda verificação usa uma chave estável e uma quantidade ou booleano resolvidos no servidor.

| Chave de entitlement | Tipo | Uso |
|---|---|---|
| members.maxActive | inteiro | Máximo de membros humanos ativos. |
| members.included | inteiro | Assentos incluídos no preço-base; inicialmente igual a maxActive enquanto não houver add-on. |
| tasks.aiDraft.enabled | booleano | Libera a assistência de criação de tarefa. |
| tasks.aiDraft.actionsPerPeriod | inteiro | Créditos de ações de IA no período. |
| tasks.aiDraft.maxInputTokensPerRequest | inteiro | Limite técnico por solicitação. |
| tasks.aiDraft.maxOutputTokensPerRequest | inteiro | Limite técnico de saída. |
| tasks.aiDraft.maxConcurrentRequests | inteiro | Proteção contra concorrência e gasto em rajada. |
| tasks.aiDraft.hardCostCapMicrosUsd | inteiro | Teto financeiro do período, aplicado no backend. |
| billing.selfService | booleano | Libera checkout, fatura e troca de plano pelo administrador comercial. |
| support.priority | enum | Nível de atendimento contratado, sem ser usado como controle de segurança. |

O trial usa sua própria versão de grants. Ele pode espelhar o plano de entrada, mas não deve liberar recursos empresariais apenas para mostrar valor. Toda alteração de limite cria nova versão de catálogo e novo snapshot futuro.

### 6.2 Contrato interno

O domínio expõe as seguintes operações conceituais:

| Operação | Entrada | Saída | Regra |
|---|---|---|---|
| resolveEntitlements | organização, horário | snapshot versionado | Lê assinatura interna, política e exceções; não chama provedor. |
| authorizeCommercialAction | ator, organização, ação | permitido ou negado com motivo | Verifica ID token, membership, papel comercial e entitlement. |
| authorizeSeatChange | organização, alteração proposta | permitido ou negado com assentos restantes | Calcula assentos no servidor dentro de transação. |
| reserveAiUsage | ator, organização, operação, chave idempotente | reserva ou negação | Confere crédito, limite de taxa, concorrência e pior custo antes de Gemini. |
| settleAiUsage | requestId, usageMetadata | custo realizado e saldo | Troca reserva por custo estimado com catálogo de preço versionado. |
| recomputeEntitlements | subscriptionId, evento normalizado | novo snapshot e auditoria | É a única forma de refletir pagamento, mudança ou expiração. |

O provedor é visto por uma interface BillingProvider com capacidades para criar customer, iniciar checkout, buscar assinatura, buscar cobrança ou fatura, cancelar, retomar quando suportado, verificar webhook e normalizar evento. O restante do produto desconhece os status, endpoints e IDs específicos de Asaas, Mercado Pago, Pagar.me ou iugu.

### 6.3 Snapshot de entitlement

O documento current deve carregar, no mínimo:

~~~text
organizationId
entitlementVersion
sourcePlanVersion
subscriptionState
accessMode
validFromAt
validUntilAt
grants e limits
aiPolicyVersion
lastBillingEventReference
updatedAt
~~~

O cliente pode usar o snapshot para renderizar tela, mas toda mutação reavalia a mesma decisão no servidor. O snapshot também é guardado junto de cada solicitação de IA e fatura relevante, impedindo que uma mudança futura altere a interpretação histórica.

---

## 7. Comparação de provedores adequados ao Brasil

### 7.1 Critérios e leitura de custos

Os provedores abaixo atendem integração REST e webhooks em backend Node/Express. A comparação considera a operação de SaaS B2B brasileiro, não marketplace. Tarifas são referências públicas consultadas em 1º de setembro de 2026; contrato, volume, prazo de recebimento, antecipação, estorno, antifraude, emissão fiscal e método de pagamento podem alterá-las.

Pix recorrente merece uma distinção: gerar um Pix mensal não é o mesmo que débito automático. Para Pix Automático, o pagador precisa consentir e o fluxo possui eventos próprios. Boleto normalmente é pago manualmente em cada ciclo.

| Critério | Asaas | Mercado Pago | Pagar.me / Stone | iugu |
|---|---|---|---|---|
| Pix, cartão e boleto | Assinaturas suportam os três meios. | O ecossistema e a visão geral de Assinaturas divulgam Pix, boleto e cartão; validar o fluxo exato da assinatura no Brasil. | Pix, cartão e boleto existem para cobranças; recorrência v5 não deve ser assumida como Pix recorrente. | Suporta cartão, boleto e Pix; comportamento de recorrência depende do método. |
| Recorrência automática | Cartão automático; Pix Automático quando houver consentimento. Pix e boleto padrão podem gerar cobrança por ciclo. | Cartão com cobrança recorrente e retentativas; validar Pix e boleto em sandbox antes de prometer automação. | Cartão automático, boleto por ciclo; documentação de checkout recorrente informa Pix indisponível para recorrência. | Cartão automático; Pix Automático é opção para PJ elegível, e Pix comum tende a ser por ciclo. |
| Trial e primeira cobrança | Pode postergar primeiro vencimento, mas o trial deve continuar interno ao Tarefus. | Documenta trial em Assinaturas. | Oferece trial_period_days no plano. | Pode agendar início; manter fonte de verdade interna reduz acoplamento. |
| Webhooks e segurança | Eventos de cobrança e assinatura, autenticação por token de acesso configurado; entrega pelo menos uma vez exige deduplicação. | Webhooks com assinatura secreta no header x-signature e tópicos de pagamento e assinatura. | Webhooks, reenvio e logs; confirmar mecanismo de assinatura da API v5 em sandbox. | Gatilhos de cobrança e reenvio; confirmar mecanismo atual de autenticação antes do contrato. |
| Conciliação | IDs de assinatura e cobrança, externalReference, listagens e eventos; cada cobrança aponta para assinatura de origem. | Busca de assinatura, faturas autorizadas e pagamentos; external_reference e exportação. | Charges, faturas, metadata e logs de webhook. | Faturas, subscription_id, referência externa e reenvio de gatilhos. |
| Nota fiscal de serviço | Emissão automática de NFS-e para assinatura é documentada, sujeita a habilitação fiscal e cobertura municipal. | Não há fluxo técnico de NFS-e automática por API de assinatura confirmado para este caso; tratar emissor fiscal como separado. | NFS-e via NFe.io é integração separada, não a fonte de cobrança. | eNotas é parceria ou integração separada. |
| Custos públicos de referência | Pix ou boleto R$ 1,99 por cobrança recebida; cartão 1x R$ 0,49 + 2,99% na tabela padrão publicada. | Varia por prazo de recebimento, produto, volume e conta; solicitar cotação de assinatura. | Ofertas públicas: Pix 1,19%, boleto R$ 3,49 e cartão 1x entre 4,39% e 5,59%, conforme plano; confirmar aplicabilidade à recorrência. | Página pública informa Pix R$ 0,99, boleto R$ 2,19 e cartão 1x 3,34%, com condições e tarifas adicionais a confirmar. |
| Suporte | Documentação, sandbox e suporte multicanal divulgado; bom foco em pequenas empresas. | Ecossistema grande, documentação madura e SDKs; SLA comercial precisa ser negociado. | REST v5 e perfil mais orientado a pagamentos avançados; suporte e SLA dependem do contrato. | API de recorrência madura; SLA e suporte precisam de validação comercial. |
| Compatibilidade técnica | REST, checkout ou fatura, webhooks, cliente e assinatura se encaixam bem em Express. | REST, webhooks e checkout hospedado se encaixam; demanda prova de fluxo de assinatura escolhido. | REST v5 compatível, mas lacuna de Pix recorrente reduz adequação inicial. | REST e webhooks compatíveis; boa alternativa se requisitos fiscais forem atendidos externamente. |

### 7.2 Fontes oficiais consultadas

- Asaas: [Assinaturas](https://docs.asaas.com/docs/assinaturas), [criação de assinatura](https://docs.asaas.com/reference/criar-nova-assinatura), [Pix Automático](https://docs.asaas.com/docs/pix-automatico), [Webhooks](https://docs.asaas.com/docs/about-webhooks), [NFS-e automática por assinatura](https://docs.asaas.com/docs/emitir-notas-fiscais-automaticamente-para-assinaturas) e [preços e taxas](https://www.asaas.com/precos-e-taxas).
- Mercado Pago: [Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview), [assinatura com plano associado](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration/subscription-associated-plan), [notificações](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications) e [custos dependentes de prazo](https://www.mercadopago.com.br/ferramentas-para-vender/check-out).
- Pagar.me: [Assinaturas v5](https://docs.pagar.me/reference/assinaturas-1), [checkout de recorrência](https://docs.pagar.me/reference/criar-link), [webhooks](https://docs.pagar.me/docs/webhooks), [NFe.io](https://docs.pagar.me/docs/nfeio) e [ofertas](https://www.pagar.me/ofertas).
- iugu: [Pix Automático](https://dev.iugu.com/docs/cobran%C3%A7as-recorrentes-por-api-pix-autom%C3%A1tico), [cobranças recorrentes](https://dev.iugu.com/docs/realizar-cobran%C3%A7as-recorrentes-por-api), [gatilhos](https://dev.iugu.com/docs/gatilhos-da-iugu), [reenvio](https://dev.iugu.com/docs/reenviar-gatilhos-para-o-webhook), [integrações fiscais](https://dev.iugu.com/docs/integra%C3%A7%C3%B5es) e [tarifas](https://www.iugu.com/saiba-mais).

---

## 8. Recomendação de provedor

### Decisão recomendada

Adotar **Asaas como provedor inicial candidato**, sem contratá-lo nem integrá-lo nesta etapa, e construir desde o começo o adaptador BillingProvider interno descrito na seção 6.

Ele é a escolha mais coerente para o contexto porque reúne:

- assinaturas com Pix, boleto e cartão;
- separação clara entre assinatura e cobranças de cada ciclo;
- Pix Automático como evolução explícita;
- recursos de conciliação e webhooks;
- documentação de emissão automática de NFS-e para assinatura;
- foco operacional próximo ao de pequenas empresas brasileiras.

O fluxo inicial recomendado usa checkout ou fatura hospedada pelo provedor e mantém trial, estado interno, entitlements e auditoria no Tarefus. O Tarefus não recebe cartão, não usa o provedor como autorização de recurso e não espelha o catálogo do provedor como catálogo de produto.

### Validações obrigatórias antes da escolha contratual

1. Aprovação de cadastro da pessoa jurídica, KYC e conta de recebimento.
2. Teste sandbox de cartão recorrente, Pix mensal, boleto mensal, expiração, falha, retentativa, estorno e chargeback.
3. Confirmação de que Pix Automático é necessário ou se Pix por cobrança mensal atende o lançamento.
4. Validação de NFS-e para CNPJ, município, regime tributário, código de serviço, dados do tomador e momento de emissão com contador. NFS-e não é comprovante de pagamento.
5. Cotação com volume esperado, mix de meios, antecipação, saque, boleto, Pix, cartão, emissão fiscal, estorno e suporte.
6. Confirmação do mecanismo atual de autenticação de webhook, retenção, reenvio, limites e exportação de conciliação.
7. Revisão de contrato, LGPD, suboperadores, suporte e SLA.

### Alternativas de contingência

- **iugu:** primeira alternativa se a contratação ou a fiscalidade do Asaas não atender; exige emissor fiscal separado ou parceria validada.
- **Mercado Pago:** candidato forte se a prioridade comercial for conversão via carteira e ecossistema, desde que sandbox comprove recorrência escolhida para Pix e boleto.
- **Pagar.me:** adequado para cenários avançados de pagamentos, mas não é o primeiro candidato enquanto Pix recorrente fizer parte da experiência desejada.

---

## 9. Arquitetura de backend, webhooks, idempotência e segredos

### 9.1 Componentes propostos

~~~mermaid
flowchart LR
    U[Frontend autenticado] --> A[Express: Auth e autorização]
    A --> B[Billing Application Service]
    B --> E[Resolvedor de entitlements]
    B --> P[BillingProvider Adapter]
    P --> X[Provedor de pagamento]
    X --> W[Webhook com corpo bruto]
    W --> I[Inbox de eventos deduplicada]
    I --> Q[Worker ou outbox]
    Q --> P
    Q --> S[Firestore: assinatura, fatura, entitlement e auditoria]
    R[Reconciliação agendada] --> P
    R --> S
    A --> G[Serviço Gemini com reserva de orçamento]
    G --> S
~~~

O Express atual precisa deixar de aceitar a identidade e os limites do cliente como verdade. As novas rotas devem verificar Firebase ID token, resolver organização e membership no servidor e usar credenciais de servidor apenas depois de autorização.

### 9.2 Endpoints planejados

| Rota | Quem pode chamar | Responsabilidade | Idempotência |
|---|---|---|---|
| POST /api/billing/checkout-sessions | owner ou billing_admin | Validar plano interno, criar intenção e pedir checkout ao adaptador. Retorna somente URL ou token seguro. | Obrigatória por ação lógica. |
| GET /api/billing/summary | Membro da própria organização; detalhes por papel | Retornar estado, próxima data e visão segura de entitlements. | Não aplicável. |
| GET /api/billing/invoices | owner ou billing_admin | Listar faturas internas e links seguros quando existentes. | Não aplicável. |
| POST /api/billing/plan-changes | owner ou billing_admin | Executar preflight, agendar upgrade ou downgrade e auditar. | Obrigatória. |
| POST /api/billing/cancel | owner ou billing_admin | Agendar cancelamento ao fim do período e enviar instrução ao adaptador. | Obrigatória. |
| POST /api/billing/reactivate | owner ou billing_admin | Reverter cancelamento suportado ou criar nova intenção de checkout. | Obrigatória. |
| POST /api/ai/task-drafts | Membro elegível da própria organização | Validar contexto, reservar orçamento, chamar Gemini e liquidar uso. | Obrigatória. |
| POST /api/webhooks/{provider} | Somente provedor | Receber corpo bruto, verificar autenticidade, persistir inbox e responder rápido. | Por provider + eventId. |

As URLs são contrato de planejamento, não instrução para criar rotas nesta etapa. O formato exato de resposta deve omitir segredos, payload bruto, metadados financeiros sensíveis e toda referência que permita atravessar organizações.

### 9.3 Processamento de webhook

1. A rota de webhook recebe corpo bruto antes de qualquer parser JSON que possa alterar bytes usados na validação.
2. O verificador do adaptador valida o segredo ou assinatura específica do provedor em comparação de tempo constante, confirma timestamp quando disponível e aplica limite de tamanho e Content-Type.
3. O backend cria, em transação, um documento inbox com chave provider:eventId. Para provedor sem ID confiável, usa hash HMAC de campos canônicos e do corpo, sem tratá-lo como garantia perfeita.
4. Caso já exista documento processado ou em processamento, responde 2xx sem repetir efeito.
5. O webhook grava apenas fato recebido e agenda worker ou outbox. Ele não muda acesso diretamente.
6. O worker busca assinatura, cobrança ou fatura no endpoint autenticado do provedor, normaliza o estado atual, confere organização por referência gerada pelo servidor e grava fatura, assinatura, entitlement e auditoria em transação.
7. Falhas transitórias usam backoff exponencial com jitter, tentativa limitada, fila morta e alerta operacional. Falha permanente exige resolução manual auditada.
8. Evento antigo ou repetido nunca substitui estado mais novo. O normalizador compara versão, data externa e estado permitido.

### 9.4 Idempotência de ações iniciadas pelo cliente

- O cliente manda Idempotency-Key aleatória por ação lógica.
- O servidor calcula HMAC de organização, ator, escopo e chave; guarda também hash do corpo normalizado.
- Mesma chave e mesmo corpo devolvem o resultado original; mesma chave com corpo diferente retorna conflito, sem nova cobrança.
- A criação de checkout, cancelamento, reativação, alteração de plano, convite de membro e requisição Gemini seguem essa regra.
- Ação externa é executada somente depois de persistir a intenção. Nunca chamar provedor dentro de uma transação Firestore que pode ser repetida automaticamente.

### 9.5 Reconciliação

Um job diário consulta, desde um watermark persistente e com sobreposição de segurança, assinaturas, cobranças, pagamentos, estornos, chargebacks e cancelamentos recentes. Ele compara:

- recursos financeiros do provedor versus billingSubscriptions e billingInvoices;
- evento esperado versus evento recebido;
- pagamento pago versus entitlement ativo;
- fatura em aberto versus payment_pending;
- conta fiscal ou documento emitido versus regra aprovada.

Divergência abre registro billingReconciliations, conserva a evidência, alerta a operação e só corrige por evento compensatório auditado. A reconciliação é obrigatória mesmo quando o provedor oferece webhook.

### 9.6 Logs, correlação e segredos

Cada request recebe correlationId e requestId. Logs estruturados registram organização pseudonimizada, rota, ator, resultado, latência, referência externa mascarada e classificação de erro. Não registram cartão, CVV, token Firebase, API key, segredo de webhook, conteúdo de prompt ou resposta Gemini.

Segredos de produção ficam em cofre de segredos e não em bundle, Firestore, histórico Git ou arquivo de configuração versionado:

- credenciais de API do provedor por ambiente;
- segredo ou token de autenticação de webhook por ambiente;
- GEMINI_API_KEY ou identidade de runtime equivalente;
- credenciais administrativas Firebase e chaves de criptografia ou HMAC.

Ambientes dev, staging e produção usam projetos, credenciais e URLs de webhook separados. Rotação tem procedimento que cria a nova chave, valida em ambiente alvo, troca referência, monitora e revoga a antiga depois da confirmação.

---

## 10. Regras de segurança, autorização e auditoria

### 10.1 Autenticação e autorização

1. Toda rota protegida verifica Firebase ID token no backend e deriva o uid exclusivamente dele.
2. O backend consulta membership da organização para confirmar status active, papel operacional e papel comercial.
3. owner e billing_admin fazem operações comerciais; admin operacional não ganha automaticamente acesso a cobrança. Essa separação reduz risco de quem gerencia tarefa também mudar meio de pagamento.
4. O orgId pedido pelo cliente só é aceito após membership; IDs de tarefa, membro, quadro e fatura também precisam pertencer à mesma organização.
5. As decisões críticas falham fechadas: token inválido, membership ausente, entitlement indisponível, webhook não verificável ou referência externa sem organização conhecida não produzem efeito comercial.

### 10.2 Firestore e dados de cliente

- Regras Firestore negam por padrão.
- Membros podem ler somente os documentos da própria organização permitidos pelo papel.
- Nenhum cliente pode escrever em billingSubscriptions, billingInvoices, billingEvents, billingIdempotency, billingAuditEvents, aiUsagePeriods, aiRequests, aiUsageEvents, aiPriceCatalogs ou entitlements.
- O cliente não pode elevar a si mesmo a owner ou billing_admin; mudanças de membership e papel passam pelo backend.
- A interface não é uma fronteira de segurança. Toda regra visual precisa de equivalente no backend e nas Rules.

### 10.3 Verificação de webhook e replay protection

- Validar assinatura ou token do provedor sobre o corpo bruto com segredo do ambiente correto.
- Rejeitar timestamp fora da janela aceita quando o provedor fornecer timestamp assinado.
- Deduplicar por provider:eventId em armazenamento durável antes de qualquer efeito.
- Verificar assinatura ou cobrança no endpoint do provedor antes de conceder, restaurar ou reduzir acesso.
- Não permitir que IP allowlist seja a única defesa; ela é complemento quando o provedor a publica.
- Registrar falha de validação sem registrar o segredo ou corpo completo em log.

### 10.4 Auditoria e operação sensível

BillingAuditEvents é append-only e contém antes, depois, motivo, origem, ator, aprovação quando aplicável e referências correlacionadas. Ajustes manuais usam evento compensatório; nunca edição silenciosa de fatura, estado ou consumo.

Para alteração manual de preço, crédito, prazo, entitlement, reembolso ou baixa financeira, exigir ao menos operador autenticado, justificativa, escopo explícito e revisão por segundo papel operacional quando o processo comercial passar a ter equipe. Uma cadeia de hash HMAC entre eventos e snapshots periódicos aumenta a detecção de adulteração, mas não substitui controle de acesso e backup.

### 10.5 Privacidade e minimização

- CNPJ, e-mail e dados de tomador são coletados apenas quando necessários para cobrança ou nota fiscal.
- IDs externos são preferidos a payloads brutos em documentos consultáveis.
- Corpo completo de webhook é criptografado ou mantido em referência de armazenamento restrito, com prazo de retenção definido.
- Ledger de IA guarda hashes, metadados e contagens; não guarda prompt ou resposta completos.
- A política de retenção, exportação, exclusão e resposta a incidente deve ser validada com responsável jurídico, contador e política LGPD antes da produção.

---

## 11. Estratégia de medição e limite de custo Gemini

### 11.1 Princípios

A chave Gemini nunca vai ao frontend. A própria documentação da Gemini orienta não expor chaves em apps cliente e usar proxy de backend; o [guia de chaves](https://ai.google.dev/gemini-api/docs/api-key) também recomenda variável de ambiente, Secret Manager e restrição da chave.

Para produção B2B, a recomendação é Gemini API Paid Tier: a [página de preços](https://ai.google.dev/gemini-api/docs/pricing) informa que o Free Tier pode usar conteúdo para aprimorar produtos Google, enquanto o Paid Tier não. Projetos Gemini devem ser separados por ambiente, não por organização, porque limites do provedor são aplicados por projeto e não por chave; os limites por empresa precisam existir no Tarefus.

Na primeira versão de IA, habilitar somente:

- texto estruturado para assistência de tarefas;
- modelo estável, de custo baixo e allowlistado no servidor, como gemini-2.5-flash;
- thinkingBudget = 0;
- sem modelos preview ou aliases latest;
- sem Search Grounding, Maps, URL context, cache, arquivos, imagem, áudio, vídeo, código, function calling ou ferramentas externas.

Cada recurso adicional altera custo, privacidade, quota e superfície de abuso e deve receber política própria antes de ser ativado.

### 11.2 Medição e reserva financeira

A Gemini API fornece contagem prévia de input pelo método countTokens e devolve usageMetadata na resposta. O [guia de tokens](https://ai.google.dev/gemini-api/docs/tokens) documenta contagens de entrada, saída, thinking, cache, ferramentas e total. O fluxo deve ser:

1. Validar ID token, App Check nas rotas de custo, membership e entitlement.
2. Aceitar somente operationKey permitida; modelo, instruções de sistema, contexto e parâmetros de geração são definidos pelo servidor.
3. Construir contexto mínimo a partir de dados da mesma organização; IDs fornecidos pelo cliente são revalidados.
4. Rejeitar payload acima do limite de bytes e estimar tokens de entrada.
5. Em transação Firestore, criar ou reutilizar aiRequest idempotente e reservar o pior custo possível com o catálogo de preço versionado.
6. Chamar Gemini apenas depois de persistir a reserva. Nunca chamar Gemini dentro de transação Firestore.
7. Ao receber resposta, gravar usageMetadata, custo estimado, modelo, política, finishReason e referência segura ao resultado; trocar a reserva por custo realizado.
8. Em erro antes de enviar ao provedor, liberar reserva. Em timeout ambíguo depois de possível envio, marcar unknown, não repetir automaticamente e conservar a reserva até reconciliação ou ajuste auditado.

A condição transacional é:

~~~text
settledCost + heldWorstCaseCost + novaReserva <= hardCostCap
açõesBemSucedidas + novaAção <= actionLimit
~~~

Isso torna a ultrapassagem por chamadas concorrentes impossível dentro da granularidade do documento de período. Em contenção excessiva, a rota falha de modo seguro com 429 ou 503 e não chama Gemini.

### 11.3 Política de uso por período

O período de IA deve acompanhar o período de assinatura ou o trial, e não a meia-noite de um provedor. O snapshot guarda:

~~~text
policyVersion
priceVersion
actionLimit
actionsSucceeded
hardCostCapMicrosUsd
settledCostMicrosUsd
heldWorstCaseCostMicrosUsd
unknownCostMicrosUsd
maxInputTokensPerRequest
maxOutputTokensPerRequest
requestsPerMinutePerOrg
requestsPerMinutePerUser
maxConcurrentRequests
overagePolicy = deny
~~~

Os créditos dão feedback compreensível ao cliente; o teto de custo, token, taxa e concorrência protege margem. Não haverá overage automático, recarga paga ou cobrança surpresa no lançamento. Ao atingir qualquer limite, o backend responde código de produto, resetAt e mensagem clara sem chamar Gemini.

### 11.4 Guardrails técnicos iniciais recomendados

Estes são limites técnicos provisórios, não promessa de plano ou preço. Partem de geração curta de tarefa em texto, máximo de 8.000 tokens de entrada e 768 de saída, sem thinking ou ferramentas. A tabela deve ser aprovada junto dos planos comerciais na seção 14.

| Pacote provisório | Créditos de IA | Taxa por organização | Concorrência | Teto técnico por período |
|---|---:|---:|---:|---:|
| Trial de 14 dias | 30 totais | 3 por minuto | 1 | US$ 0,20 |
| Plano de entrada | 250 por período | 6 por minuto | 1 | US$ 1,50 |
| Plano intermediário | 1.000 por período | 12 por minuto | 2 | US$ 6,00 |
| Plano avançado | 3.500 por período | 20 por minuto | 3 | US$ 20,00 |

O custo é registrado em microunits de USD porque a fonte Gemini é em USD, e pode ser apresentado em BRL com taxa de câmbio informativa versionada. Não recalcular custos históricos com uma tabela nova: alteração de modelo ou preço cria priceVersion nova.

### 11.5 Retry, abuso, alertas e reconciliação

- Aplicar limite por usuário, por organização e por IP, além do limite técnico do projeto Gemini.
- App Check e replay protection são recomendados para a rota de IA por envolver custo; ativar replay seletivamente por causa da latência adicional.
- A mesma Idempotency-Key com mesmo corpo devolve o mesmo request ou resultado; a mesma chave com corpo diferente retorna conflito.
- Para 429, 408 e 5xx, usar no máximo uma repetição controlada com backoff e jitter, contabilizando tentativa. Não deixar retry invisível do SDK gastar orçamento.
- Em resposta de segurança bloqueada antes de custo, não consumir crédito; qualquer custo confirmado consome o teto financeiro.
- Implementar kill switch global, teto global diário e por janela curta, alertas em 50%, 80% e 100% por organização e alerta operacional para picos, unknowns e discrepâncias.
- Conciliar diariamente o ledger estimado por projeto, modelo e dia com exportação de billing do Google quando disponível. Essa exportação possui atraso e é controle de auditoria, não portão em tempo real.

---

## 12. Plano de evolução técnica em fases

Nenhuma fase abaixo está sendo implementada por este documento. Cada fase tem uma porta de saída verificável antes da seguinte.

| Fase | Entregável futuro | Dependências | Porta de saída |
|---|---|---|---|
| 0. Fundação de segurança e tenancy | Firebase Auth efetivamente verificado no backend, organização e membership por UID, migração de dados, Rules restritivas, papéis comerciais e gestão de segredos. | Decisão de modelo de organização e estratégia de migração. | Cliente não escreve dados comerciais e não atravessa organizações; endpoints rejeitam sessão local não verificável. |
| 1. Domínio interno sem cobrança real | Catálogo de planos versionado, assinatura interna, trial de 14 dias, resolvedor de entitlements, contagem de assentos, audit ledger e projeção de leitura. | Fase 0. | Simulação de estados e assentos passa em emulator e testes de transição, sem provedor externo. |
| 2. Prova de provedor em sandbox | Adaptador Asaas, cliente, checkout hospedado, webhook bruto, inbox, worker, idempotência e reconciliação em sandbox. | Fase 1, conta sandbox aprovada e segredo de ambiente. | Cartão, Pix, boleto, falha, cancelamento e evento duplicado passam em sandbox sem liberar acesso pelo redirect. |
| 3. Cobrança controlada | Fluxos de checkout, troca agendada, cancelamento, reativação, régua de pagamento pendente e visualização de faturas para piloto. | Fase 2, decisão de preço, assentos, graça e política de pós-trial. | Conciliação sem divergência crítica e suporte consegue investigar toda transição por correlationId. |
| 4. IA com controle econômico | Política de IA por plano, reserva, usageMetadata, limite de taxa, App Check, kill switch, price catalog e relatório por organização. | Fases 0 e 1; Paid Tier, modelo aprovado e orçamento global configurado. | Nenhuma chamada Gemini sai sem reserva e ledger; concorrência não supera teto; chave não aparece em cliente ou logs. |
| 5. Operação financeira e fiscal | Emissão fiscal validada, retenção, exportação, processo de ajuste manual, dashboards, alertas e runbooks de incidentes. | Fase 3, contador e requisitos fiscais aprovados. | Operação fecha mês com conciliação, trilha de auditoria e política de exceção documentada. |

### Dependências críticas

- Fase 0 bloqueia qualquer pagamento e qualquer entitlement confiável.
- Fase 1 bloqueia a interface de pagamento: não há acesso comercial seguro sem modelo interno.
- Fase 2 bloqueia produção: webhook, idempotência e reconciliação não podem ser adicionados depois de clientes pagantes.
- Fase 4 pode ser desenvolvida em paralelo à Fase 3, mas não pode liberar IA paga sem Fase 0 e Fase 1 completas.
- A emissão fiscal não deve atrasar a prova de billing, mas bloqueia a produção comercial quando houver obrigação de nota aplicável.

---

## 13. Matriz de testes e critérios de aceite

### 13.1 Matriz de testes

| Área | Cenários mínimos | Resultado esperado |
|---|---|---|
| Máquina de estados | Criação, fim de trial, primeira cobrança, pagamento aprovado, falha, graça, cancelamento, reativação, chargeback e evento fora de ordem. | Apenas transições permitidas; accessMode segue regra e evento de auditoria existe. |
| Planos e preço | Catálogo aposentado, nova versão, preço copiado para fatura, moeda BRL, centavos inteiros e troca agendada. | Cliente não altera preço; história não muda quando catálogo novo é publicado. |
| Assentos | Convite no último assento, convites concorrentes, reativação, downgrade abaixo do uso e conta técnica. | Uma única operação concorrente ganha quando só há um assento; ninguém é removido automaticamente. |
| Autenticação e tenancy | Token inválido, revogado, sem membership, membro de outra organização, orgId forjado e admin operacional sem papel comercial. | Todas as operações são negadas sem acesso ou vazamento entre organizações. |
| Firestore Rules | Leitura e escrita cliente para billing, entitlements, usage, audit, organização de terceiro e mudança de papel. | Escrita comercial é negada; somente projeção própria permitida. |
| Checkout e idempotência | Duplo clique, repetição de rede, mesma chave com corpo diferente, retorno de navegador sem webhook e checkout abandonado. | Uma intenção externa no máximo; redirect não ativa assinatura; conflito não cobra de novo. |
| Webhook | Assinatura válida, segredo inválido, payload alterado, timestamp expirado, duplicado, fora de ordem, payload grande e recurso externo inexistente. | Somente evento autenticado entra na inbox; efeito é único e conciliado com API do provedor. |
| Reconciliação | Webhook perdido, pagamento pago sem evento, evento recebido sem recurso atual, estorno e chargeback. | Divergência é detectada, evidenciada e corrigida por evento compensatório, nunca por edição silenciosa. |
| Pagamento pendente | Boleto e Pix não pagos, cartão recusado, retentativa aprovada, fim de graça e primeira cobrança pós-trial. | Acesso respeita trial e graça; não há plano gratuito após expiração. |
| IA: autorização | Token inválido, App Check ausente, membro de outra organização, modelo forjado, prompt de sistema forjado e ID de tarefa externo. | A chamada é negada antes de Gemini e não cria custo. |
| IA: orçamento | Reserva que excede teto, duas chamadas concorrentes, mesma chave, erro antes do provedor, timeout ambíguo, usageMetadata completo e bloqueio de segurança. | Nenhum excesso por concorrência; uma execução lógica; reserva é liquidada, liberada ou mantida como unknown. |
| IA: custos | Entrada, cache, saída, thinking, preço versionado, arredondamento inteiro e troca de modelo. | Custo usa priceVersion correta sem float e não altera histórico. |
| Privacidade e logs | Busca de segredos, cartão, CVV, token, prompt, resposta e PII em logs, documentos e erros. | Dados proibidos não aparecem; referências e hashes permitem auditoria. |
| Operação | Fila morta, indisponibilidade do provedor, rotação de segredo, kill switch, alerta de orçamento e ajuste manual. | Sistema falha fechado, gera alerta e conserva trilha investigável. |

### 13.2 Critérios de aceite

1. Não existe rota ou regra cliente que consiga conceder plano, assento, entitlement ou crédito de IA.
2. Toda chamada externa de pagamento e Gemini tem requestId, idempotência, correlação e evento de auditoria.
3. Nenhuma assinatura muda para active por retorno de checkout; somente confirmação e consulta ao provedor podem fazê-lo.
4. Todo webhook válido é deduplicado e processado uma vez; todo webhook inválido é rejeitado sem efeito.
5. Um job de reconciliação encontra e abre incidente para divergência simulada.
6. A organização nunca ultrapassa assentos ou teto IA sob concorrência.
7. Trial expira exatamente conforme relógio de servidor e não pode ser renovado automaticamente.
8. Cancelamento, reativação, pagamento pendente, downgrade e chargeback exibem estado e acesso coerentes.
9. Firestore emulator prova isolamento de organização e bloqueio de escrita comercial pelo cliente.
10. Não há chaves, tokens, cartão, CVV ou corpo sensível de IA em bundle, Git, resposta de API ou logs.
11. O sandbox do provedor cobre cartão, Pix, boleto, cancelamento, falha, webhook duplicado e reconciliação antes de produção.
12. O runbook operacional consegue localizar qualquer decisão comercial por correlationId, organização e referência externa mascarada.

Nenhum teste foi executado nesta etapa, pois o entregável é exclusivamente de planejamento e nenhuma implementação foi autorizada.

---

## 14. Decisões de negócio ainda necessárias

As decisões abaixo não bloqueiam este documento; a recomendação padrão permite continuar o desenho. Elas precisam ser formalizadas antes da Fase 3.

| Decisão necessária | Recomendação padrão adotada no plano | Por que o responsável pelo produto precisa decidir |
|---|---|---|
| Nomes, quantidade e preço dos planos | Três planos pagos mais trial, preço mensal em BRL e catálogo versionado. | Define posicionamento, margem, checkout e comunicação. |
| Valores mensais e anuais, desconto anual, impostos e promoções | Não anunciar preço até haver modelo de margem com custos de pagamento, suporte, nota e IA. | É decisão de produto e financeira, não técnica. |
| Membros incluídos e máximo de membros por plano | Usar members.maxActive, sem overage no lançamento; impedir convite além do teto. | Deve refletir tamanho real das pequenas empresas atendidas. |
| Definição de assento | Contar todo humano active; não contar pending, deactivated nem conta técnica auditada. | Exceções comerciais podem afetar receita e abuso. |
| Trial com ou sem cartão e elegibilidade | Sem cartão, uma vez por organização, 14 dias; concessão extra somente manual e auditada. | Afeta conversão, fraude e suporte. |
| Pacote de trial | Trial limitado e orientado ao plano de entrada, sem recursos empresariais irrestritos. | Precisa equilibrar demonstração de valor e custo. |
| Política após trial | Read-only imediato, dados por 30 dias e depois archived; sem exclusão automática até política aprovada. | Define conversão, retenção, suporte, LGPD e experiência do cliente. |
| Janela de graça e régua de cobrança | Sete dias para renovação paga; nenhuma graça adicional para primeira cobrança após trial. | Afeta inadimplência, conversão e tom da comunicação. |
| Upgrade, downgrade e pró-rata | Trocas no próximo período, sem pró-rata automático no lançamento. | Uma política de aplicação imediata exige regras de crédito, refund e suporte. |
| Cancelamento, reembolso e crédito | Cancelar ao fim do período; exceções operacionais auditadas. | Regras legais, comerciais e de atendimento precisam de aprovação. |
| Métodos de pagamento apresentados | Cartão, Pix e boleto; não prometer Pix Automático antes da validação de consentimento e oferta do provedor. | Impacta funil, suporte e contrato do provedor. |
| Provedor e contrato | Asaas como candidato inicial; iugu como contingência. | Exige cotação, KYC, SLA, análise de contrato e validação em sandbox. |
| Emissão de nota fiscal | Validar NFS-e com contador e município; manter fiscal separado do entitlement. | Regime tributário, código de serviço e prazo de emissão são decisões externas ao software. |
| Limites de IA por plano | Usar a tabela técnica provisória, sem overage; modelo estável de baixo custo. | É necessário definir valor percebido, margem e tolerância a abuso. |
| Política de dados de IA | Paid Tier, sem ferramentas ou multimodal no lançamento, logs só com hashes e metadados. | Requer decisão de privacidade e comunicação ao cliente. |
| Retenção de auditoria, faturas e payloads | Configurável, com referência inicial de cinco anos apenas após validação contábil e jurídica. | Não deve ser definida como obrigação legal por inferência técnica. |
| Processo de exceção operacional | Ajuste manual com motivo, ator e revisão; sem edição silenciosa. | Define equipe, SLA, alçadas e suporte. |

Com essas decisões registradas, o Tarefus pode evoluir para cobrança por empresa sem transformar o provedor de pagamento, o frontend ou uma chave Gemini em autoridade comercial.
