# Task 3 — relatório de execução

## Status

**Concluída localmente — DONE_WITH_CONCERNS.**

A base server-owned de tenancy comercial foi materializada com repositório injetável, paths limitados ao namespace `organizations/{orgId}`, invariantes transacionais de assentos, auditoria append-only, Rules staged e planejador puro de migração seca.

A composição padrão da Task 2 não foi alterada: ela continua usando os repositórios indisponíveis e, portanto, continua fail-closed em `503` até uma integração de persistência real ser deliberadamente configurada. Nenhum Firebase real foi acessado, nenhuma Rule foi aplicada e nenhuma migração foi executada.

## Arquivos

- `src/server/commercial-repository.ts`: contrato Firestore estrutural/injetável, serializadores server-owned, paths comerciais, transações, assentos, assinatura, entitlement, usage, leitura compatível com os contratos da Task 2 e auditoria append-only.
- `src/server/commercial-migration.ts`: planejador puro, determinístico e idempotente de migração seca.
- `firestore.rules`: política staged para `organizations`, compatibilidade temporária explícita dos seis paths legados e deny-by-default.
- `tests/support/fake-commercial-firestore.ts`: fake Firestore transacional e serializável, sem credenciais.
- `tests/commercial-repository.test.ts`: paths, allowlists, isolamento de org, concorrência/assentos, downgrade, contratos de acesso, subscription/entitlement/usage e auditoria.
- `tests/commercial-migration.test.ts`: repetibilidade, criação condicional, UID ausente/duplicado, capacidade inicial e papel inválido.
- `tests/firestore-rules-staged.test.ts`: contrato estático da política staged, incluindo ausência de wildcard permissivo.
- `tests/commercial-firestore-admin-compatibility.type-test.ts`: compatibilidade estrutural compile-only com `firebase-admin/firestore`, sem inicializar o Admin SDK.
- `package.json`: script `test:commercial-persistence`.

Nenhum arquivo em `docs/commercial`, rota/UI legada ou composição padrão de acesso foi modificado.

## Decisões implementadas

### Repositório server-owned

- O repositório só constrói documentos nos paths:
  - `organizations/{orgId}`;
  - `organizations/{orgId}/memberships/{uid}`;
  - `organizations/{orgId}/subscriptions/current`;
  - `organizations/{orgId}/entitlements/current`;
  - `organizations/{orgId}/usagePeriods/{periodId}`;
  - `organizations/{orgId}/auditEvents/{eventId}`.
- Todos os identificadores de path são validados como um único segmento. Os serializadores usam allowlists; campos extras como `createdAt`, `activeSeats`, `organizationId`, `workspaceId`, papel ou estado injetados em objetos não são copiados como autoridade.
- `createdAt`, `updatedAt` e `occurredAt` vêm exclusivamente do callback `serverTimestamp` injetado. Uma integração futura com Admin SDK deve fornecer `FieldValue.serverTimestamp()`.
- `FirestoreCommercialRepository` implementa `MembershipRepository` e `EntitlementReader` da Task 2. `findMembershipsByUid` retorna apenas memberships `active`, valida o UID do documento contra o path e deriva o `organizationId` do path.
- A interface Firestore é estruturalmente compatível com `firebase-admin/firestore`, mas não instancia SDK, app ou projeto. O teste compile-only confirma essa fronteira.

### Transações e assentos

- Criação de organização, ativação/desativação de membership, mudança de limite, escrita de assinatura, escrita de entitlement e incremento de usage são transacionais.
- Apenas memberships `human` e `active` consomem assentos.
- Ativação/criação de mais um humano falha com `seat_limit_reached` quando `activeSeats >= maxActiveSeats`.
- Reativar um membership que já consome assento não incrementa a contagem outra vez; memberships `service` não consomem assento.
- Downgrade do limite preserva `activeSeats` e todos os memberships existentes, inclusive quando o novo limite fica abaixo do uso. Somente ativações humanas posteriores são bloqueadas.
- O fake serializa transações concorrentes; duas ativações simultâneas com um assento disponível resultam em uma ativação e uma rejeição, sem oversubscription.

### Auditoria append-only

- IDs são gerados pelo `collection(...).doc()` server-side.
- Eventos contêm tipo validado, ator, correlação, payload JSON normalizado/limitado, hash SHA-256 estável e timestamp server-owned.
- Mutação comercial gera auditoria dentro da mesma transação.
- O evento manual usa `create`, nunca overwrite. Não existe API para editar ou remover eventos de auditoria.

### Rules staged

- Não existe mais wildcard recursivo permissivo.
- Cliente não pode ler/escrever organization root, memberships, subscriptions, usage, audit ou documentos comerciais desconhecidos.
- A única leitura nova permitida é `organizations/{orgId}/entitlements/current`, autenticada e condicionada a `memberships/{request.auth.uid}.status == 'active'` no mesmo org.
- Toda escrita de cliente no namespace comercial é negada.
- `users`, `boards`, `columns`, `tasks`, `activity_logs` e `company` permanecem explicitamente permissivos como compatibilidade temporária.
- O comentário `ROLLOUT BLOCKER` registra que essa compatibilidade impede alegar isolamento completo antes da migração validada.
- O restante nega por padrão.

### Migração seca

- `planLegacyCommercialMigration` é pura: não importa/instancia Admin SDK, não chama Firestore, não escreve, não apaga e não executa migração.
- Cada usuário legado exige mapeamento explícito `legacyUserId -> Firebase UID`; o ID legado nunca é promovido implicitamente a UID.
- O plano bloqueia integralmente em UID ausente/duplicado, usuário duplicado, identificador inválido, papel inválido ou capacidade inicial excedida.
- Operações prontas têm paths determinísticos e modo `create_if_absent`; a ordem e o `planId` SHA-256 são estáveis entre execuções equivalentes.
- Timestamps de persistência não fazem parte do plano seco e devem ser adicionados pelo repositório no eventual executor server-side.

## TDD — RED → GREEN

1. Os testes do repositório foram escritos antes de `src/server/commercial-repository.ts`.
   - RED observado: `ERR_MODULE_NOT_FOUND` para `src/server/commercial-repository`.
   - GREEN: 8/8 casos passaram com o fake Firestore/transação.
2. Os testes da migração foram escritos antes de `src/server/commercial-migration.ts`.
   - RED observado: `ERR_MODULE_NOT_FOUND` para `src/server/commercial-migration`.
   - GREEN inicial: 4/4 casos passaram.
3. O teste staged das Rules foi executado contra a política legada.
   - RED observado: capturou `match /{document=**}` com `allow read, write: if true`.
   - GREEN: contrato estático staged passou depois da alteração.
4. No self-review foi escrito primeiro o caso de papel comercial inválido na migração.
   - RED observado: plano retornava `ready` e omitia silenciosamente o membership.
   - GREEN final: 5/5 casos de migração passaram após produzir blocker explícito.
5. O primeiro typecheck direto encontrou um narrowing inválido no payload de auditoria (`TS2345`). O tipo de array JSON foi corrigido e o typecheck direto final passou.

## Comandos e resultados finais

| Comando | Resultado |
| --- | --- |
| `npm.cmd run test:commercial-persistence` | Passou: repositório 8/8, migração 5/5 e Rules staged. |
| `npm.cmd run test:commercial` | Passou: 11/11. |
| `npm.cmd run test:commercial-access` | Passou: 11/11; composição padrão fail-closed preservada. |
| `npx.cmd tsc --build` | Passou. |
| `npx.cmd tsc --ignoreConfig --noEmit ...` para produção, fakes, testes e compatibilidade Admin | Passou. |
| `npm.cmd run lint` | Exit 0; somente avisos preexistentes fora do escopo após remover o único aviso inicialmente introduzido pelo type-test. |
| `npm.cmd run build` | Passou; Vite e esbuild concluíram. Permanece o aviso preexistente de chunk maior que 500 kB. |
| `git diff --check` / `git diff --cached --check` | Passou; apenas avisos de normalização LF→CRLF do ambiente Windows. |

## Commits locais

- `f7073b0 feat(commercial): add tenant persistence foundation`
- O relatório é registrado em commit separado, sem amend.

Nenhum push, PR, merge ou deploy foi feito.

## Lacunas e concerns

- Não há Firebase Emulator configurado neste worktree. As Rules receberam somente validação estática local; **não estão aprovadas pelo Emulator** e não foram aplicadas.
- Os seis paths legados continuam permissivos por decisão staged. Enquanto existirem, o sistema não possui isolamento completo de tenant.
- O repositório não foi conectado à composição padrão e a rota comercial real continua em `503`. Isso é intencional nesta task.
- Não houve teste de integração contra Firestore real, credencial, projeto, índice de collection-group ou semântica runtime de `FieldValue.serverTimestamp()`.
- A futura composição real deve validar os índices necessários para a consulta collection-group de memberships, configurar o sentinel de timestamp e repetir os testes com Emulator antes de qualquer rollout.
- A migração entregue é somente um plano. Falta, fora deste escopo, aprovar mapeamentos reais, criar um executor separado e validar reconciliação antes de gravar qualquer dado.
