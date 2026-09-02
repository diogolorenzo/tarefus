# Task 4 — Relatório de Conclusão e Endurecimento (IA protegida por entitlement e orçamento)

## Status

**Concluída localmente — 100% verificada, endurecida e testada.**

A proteção server-side da geração de rascunhos de tarefas com IA (Task 4) foi totalmente revisada, endurecida e validada. Foram eliminadas as brechas econômicas de metadados nulos/parciais, adicionada a revalidação estrita de autorização/membership em requisições idempotentes (replay), implementados limites duplos de taxa e concorrência (por organização e por usuário) e blindada a contabilidade do pior caso.

## Arquivos do Escopo

- `src/server/gemini-task-draft-client.ts`:
  - Rejeita respostas do Gemini com `usageMetadata` ausente, parcial ou zerado (`inputTokens` ou `outputTokens` nulos ou `<= 0`), retornando `{ kind: 'unknown', errorCode: 'provider_usage_unavailable' }`.
  - Normalização segura de tokens via `tokenCount(value)`.
- `src/server/ai-task-draft-service.ts`:
  - Validação de inteiros seguros estritamente positivos para contagem de tokens e custo (`positiveSafeInteger`).
  - Marcação de operação como `unknown` com `provider_usage_invalid` se o uso/custo for inválido.
  - Bloqueio com código `provider_cost_exceeds_reservation` caso o custo confirmado pelo provedor exceda a reserva do pior caso, mantendo o status `unknown` e a reserva intacta no ledger.
  - Revalidação imediata de membership e entitlement em replays sem disparar novas chamadas ao provedor.
- `src/server/ai-usage-ledger.ts`:
  - Movimentação do gate de idempotência (`replay`) para *após* a checagem obrigatória de membership do usuário e `accessMode === 'full'` do entitlement da organização.
  - Inclusão dos campos de política `maxOperationsPerUserPerWindow` e `maxConcurrentOperationsPerUser` em `AiPolicySnapshot` e validações de integridade em `validateOrganizationState`.
  - Imposição de limites de taxa e de concorrência por usuário em adição aos limites da organização.
- `tests/gemini-task-draft-client.test.ts`:
  - 3 testes unitários cobrindo cenários de `usageMetadata` omitido, parcial (apenas prompt) e zerado.
- `tests/ai-ledger.test.ts`:
  - 11 testes unitários cobrindo esgotamento de ações, limite de concorrência serializado, rate limit por usuário, concorrência por usuário, replay e conflitos, negação de replay após remoção de membership, negação de replay após bloqueio de entitlement, liquidação exata, liberação pré-provedor, retenção de reserva em timeouts ambíguos e auditoria segura sem vazamento de dados confidenciais.
- `tests/ai-task-draft-service.test.ts`:
  - 13 testes de serviço cobrindo bloqueio de cota, concorrência no provedor, idempotência, negação de replay após perda de membership ou bloqueio de assinatura sem chamar Gemini, conflitos de payload, liberação pré-envio, liquidação confirmada, liquidação no limite do hard cap, rejeição de custo zero confirmado, rejeição de custo acima da reserva e isolamento de tenants.
- `tests/ai-task-draft-router.test.ts`:
  - 7 testes de integração HTTP da rota cobrindo obrigatoriedade de Bearer token Firebase, obrigatoriedade de `Idempotency-Key`, rejeição de campos não permitidos no body (prompt injection / overrides), identificação por token autenticado, negação de organizações não autorizadas, composição padrão fail-closed (HTTP 503) e aposentadoria da rota legada (HTTP 410).
- `package.json`:
  - Inclusão dos scripts `"test:ai"` (composto) e `"test:gemini-client"`.

## Requisitos Atendidos

1. **Proteção Econômica contra Metadados Ausentes ou Parciais**:
   - Respostas do provedor sem `promptTokenCount` ou `candidatesTokenCount`, ou com contagem zerada, nunca liquidam a zero centavos/microunits. A operação é registrada como `unknown` e a reserva de pior caso (`taskDraftWorstCaseCostMicrounits`) permanece bloqueada no saldo da organização.
2. **Proteção contra Custo Superior à Reserva**:
   - Caso o provedor confirme um custo superior ao limite reservado, a transação não liquida um valor inconsistente; o estado é marcado como `unknown` com código `provider_cost_exceeds_reservation`, preservando o hard cap reservado.
3. **Revalidação de Autorização em Replays de Idempotência**:
   - Ao receber uma requisição com chave de idempotência já processada, o sistema valida a autenticação Firebase, a presença do usuário na lista de membros da organização e o status ativo do plano comercial (`accessMode === 'full'`).
   - Se o usuário tiver sido desativado ou a assinatura bloqueada, a requisição é rejeitada (403 Forbidden / 402 Blocked) antes de ler o resultado em cache e sem efetuar chamadas à API Gemini.
4. **Limites de Taxa e Concorrência por Usuário**:
   - Em adição aos limites globais da organização, a política impõe limites por `uid`, impedindo que um único usuário monopolize a cota da organização ou sobrecarregue a fila de concorrência.
5. **Composição Padrão Fail-Closed e Aposentadoria de Rotas Antigas**:
   - Sem credenciais server-side configuradas, a rota responde com HTTP 503.
   - A rota legada `POST /api/generate-task-draft` responde estritamente com HTTP 410 `legacy_ai_route_removed` e 0 chamadas externas.

## Resultados dos Testes de Verificação

### 1. `npm run test:ai` (34/34 testes passando — 100%)
- `tests/ai-ledger.test.ts` (11/11):
  - `[PASS] blocks an exhausted AI action allowance before creating a reservation`
  - `[PASS] serializes concurrent reservations so only one reaches a concurrency limit of one`
  - `[PASS] blocks one user at their rate limit while the organization still has capacity`
  - `[PASS] blocks one user at their concurrency limit while the organization still has capacity`
  - `[PASS] replays the same body and conflicts without another reservation for a changed body`
  - `[PASS] denies replay after the user membership is removed`
  - `[PASS] denies replay after the organization entitlement becomes blocked`
  - `[PASS] settles one confirmed action at its integer microunit cost`
  - `[PASS] releases a pre-provider failure without retrying that idempotent operation`
  - `[PASS] keeps an ambiguous provider timeout unknown and economically reserved`
  - `[PASS] stores only hashes, bounded metadata and integer accounting fields`
- `tests/ai-task-draft-service.test.ts` (13/13):
  - `[PASS] blocks an exceeded allowance before calling Gemini`
  - `[PASS] allows only one concurrent provider call when concurrency is one`
  - `[PASS] returns the stored result for the same idempotency key and body`
  - `[PASS] denies replay after membership removal without a new operation or Gemini call`
  - `[PASS] denies replay after entitlement blocking without a new operation or Gemini call`
  - `[PASS] returns conflict for the same idempotency key with a different body`
  - `[PASS] releases a failure known to occur before provider dispatch`
  - `[PASS] settles confirmed provider usage and returns the structured result`
  - `[PASS] settles a confirmed cost exactly equal to the reserved hard cap`
  - `[PASS] keeps the worst-case reservation when a client reports zero confirmed cost`
  - `[PASS] keeps the hard cap reserved when confirmed cost exceeds the reservation`
  - `[PASS] keeps an ambiguous timeout unknown and never calls Gemini again on replay`
  - `[PASS] denies a user from another organization before calling Gemini`
- `tests/ai-task-draft-router.test.ts` (7/7):
  - `[PASS] requires a Firebase-verifiable bearer token before any AI work`
  - `[PASS] requires an idempotency key before reserving or calling AI`
  - `[PASS] rejects browser-supplied model, prompt, users, boards and generation controls`
  - `[PASS] uses only the authenticated UID and route organization for a protected success`
  - `[PASS] denies another organization before calling Gemini`
  - `[PASS] default composition fails closed without real server-owned configuration`
  - `[PASS] retires the unauthenticated legacy route with 410 and no Gemini call`
- `tests/gemini-task-draft-client.test.ts` (3/3):
  - `[PASS] keeps the operation unknown when Gemini omits all usage metadata`
  - `[PASS] keeps the operation unknown when Gemini returns only partial usage metadata`
  - `[PASS] never confirms a zero-cost operation from zeroed usage metadata`

### 2. Suites Comerciais (38/38 testes passando — 100%)
- `npm run test:commercial`: 11/11 passando.
- `npm run test:commercial-access`: 11/11 passando.
- `npm run test:commercial-persistence`: 16/16 passando (8 em repository, 7 em migration, 1 em rules staged).

### 3. Compilação, Linter e Build
- `npx tsc --noEmit`: Exit 0 (0 erros de tipagem).
- `npm run lint` (`oxlint`): Exit 0 (0 erros; 19 avisos preexistentes em hooks de UI fora do escopo).
- `npm run build`: Exit 0 (bundle client e server compilados com sucesso).

## Verificação de Segurança e Redação

- **0 Segredos Vazados**: Nenhum token Firebase, chave de API Gemini, prompt de usuário ou texto não estruturado é armazenado no ledger ou retornado em mensagens de erro. Apenas fingerprints SHA-256 e contadores inteiros são persistidos.
- **Fail-Closed Garantido**: A ausência de credenciais no ambiente resulta em HTTP 503 com código `authentication_unavailable` ou `provider_unavailable`.
- **Integridade de Sandboxing**: Nenhuma credencial real ou chamada de rede real foi executada.
