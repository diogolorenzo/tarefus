# Task 2 — relatório de execução

## Status

Concluída localmente. A nova fronteira de organização está limitada a uma única rota de leitura:

`GET /api/organizations/:orgId/entitlements`

Ela exige um Bearer token, extrai o UID somente do token verificado e busca membership/papel somente por um repositório server-side. Não há leitura de sessão local, corpo, `x-user-id`, `x-role` ou outro dado de identidade controlado pelo cliente.

## Arquivos alterados

- `package.json`: adiciona `firebase-admin` e o script `test:commercial-access`; não foi criado lockfile.
- `server.ts`: monta a nova rota sem substituir ou remover rotas legadas.
- `src/server/commercial-access.ts`: contratos injetáveis, guard, verificador Firebase Admin preguiçoso e repositórios explicitamente indisponíveis.
- `src/server/commercial-access-default.ts`: composição de produção que falha fechada até existirem repositórios server-side reais.
- `tests/commercial-access.test.ts`: testes HTTP com fakes para as fronteiras externas.

## Decisões e fronteiras de segurança

- `FirebaseAdminTokenVerifier` só carrega/inicializa Firebase Admin após receber um Bearer token. Sem as três credenciais `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL` e `FIREBASE_ADMIN_PRIVATE_KEY`, responde com indisponibilidade (`503`) e não autentica ninguém.
- A verificação usa `verifyIdToken(token, true)`, portanto solicita checagem de revogação. Token inválido ou revogado retorna `401`.
- `MembershipRepository.findMembershipsByUid(uid)` é a fonte de membership e dos papéis permitidos: `member`, `admin` e `billing_admin`. O `orgId` da rota é comparado ao membership retornado para esse UID.
- A composição padrão não inventa membership nem entitlement. Depois de autenticação, a ausência de implementações reais retorna `membership_unavailable` ou `entitlements_unavailable` (`503`).
- O endpoint retorna somente o diagnóstico/entitlement da organização autorizada; nenhuma rota legada foi modificada em seu comportamento.

## TDD (RED → GREEN)

1. Criei `tests/commercial-access.test.ts` antes do módulo de produção e executei `npx.cmd tsx tests/commercial-access.test.ts`.
   - RED observado: `ERR_MODULE_NOT_FOUND` para `src/server/commercial-access`.
2. Implementei o guard mínimo e executei o mesmo teste.
   - GREEN: 7/7 casos passaram.
3. Adicionei o teste da montagem padrão antes do módulo de composição e executei novamente.
   - RED observado: `ERR_MODULE_NOT_FOUND` para `src/server/commercial-access-default`.
4. Montei a composição no servidor e reexecutei.
   - GREEN final: 8/8 casos passaram.

Casos cobertos: token ausente, inválido, revogado, configuração indisponível, ausência de membership, acesso cruzado entre organizações, montagem fail-closed e acesso permitido com fake. O caso permitido também envia `x-user-id`/`x-role` conflitantes e confirma que o resultado usa o UID/papel server-side.

## Comandos e resultados

| Comando | Resultado |
| --- | --- |
| `npm.cmd install --package-lock=false firebase-admin@13.7.0` | Dependência instalada; `npm.cmd ls firebase-admin --depth=0` confirmou `firebase-admin@13.7.0`; `package-lock.json` não existe. |
| `npm.cmd run test:commercial-access` | Passou: 8/8. |
| `npm.cmd run test:commercial` | Passou: 11/11. |
| `npx.cmd tsc --build` | Passou. |
| `npx.cmd tsc --ignoreConfig --noEmit --target es2023 --module esnext --moduleResolution bundler --esModuleInterop --skipLibCheck src/server/commercial-access.ts src/server/commercial-access-default.ts` | Passou. |
| `npm.cmd run build` | Passou; Vite e esbuild concluídos. |
| `npm.cmd run lint` | Exit 0, com avisos preexistentes em testes e componentes fora deste escopo. |
| `git diff --check` | Passou. |

## Commit

- `b8754a3 feat(access): add protected organization entitlement route`

## Concerns / próximos passos deliberadamente fora de escopo

- Ainda não há implementação real de `MembershipRepository` ou `EntitlementReader`; por segurança, tokens autenticados recebem `503` em vez de acesso padrão até esses repositórios existirem.
- A integração não foi validada com credenciais Firebase reais, contas externas ou produção. Os testes usam fakes por projeto, e a ausência de credenciais é um estado suportado e fechado.
- As rotas legadas continuam com o modelo de autenticação atual, pois sua migração/removal não pertence a esta task.

## Correção após revisão da Task 2

### Correções

- O `FirebaseAdminTokenVerifier` agora recebe um `FirebaseAdminModuleLoader` injetável e mantém o cache de auth por instância do verificador.
- A inicialização usa exclusivamente a app nomeada `tarefus-admin:<FIREBASE_ADMIN_PROJECT_ID>`. Ela cria a app com `projectId` explícito e reutiliza somente uma app de mesmo nome cuja opção `projectId` também coincida; uma app homônima vinculada a outro projeto falha fechada antes de verificar token.
- A guarda das três variáveis de credencial continua antes do carregamento dos módulos Firebase Admin. Assim, sem configuração, nenhum módulo é importado/inicializado e o resultado é `unavailable`.

### TDD de regressão (RED → GREEN)

1. Adicionei os testes da implementação real com loader injetado e executei `npm.cmd run test:commercial-access`.
   - RED observado: a app de outro projeto foi usada e o teste retornou `{ ok: true, identity: { uid: 'user-1' } }` em vez de `unavailable`.
2. Substituí a seleção por `getApps()[0]` por lookup de nome + validação de `projectId`, e incluí o loader injetável.
   - GREEN final: 11/11 testes de acesso passaram.

Os testes adicionais cobrem: (a) ausência das três variáveis, com restauração de `process.env` e prova de zero carregamentos Firebase Admin; (b) reutilização da app nomeada do projeto configurado, ignorando uma app externa; e (c) rejeição de app homônima ligada a outro projeto sem chamada de verificação.

### Comandos e resultados da correção

| Comando | Resultado |
| --- | --- |
| `npm.cmd run test:commercial-access` | Passou: 11/11. |
| `npm.cmd run test:commercial` | Passou: 11/11. |
| `npx.cmd tsc --build` | Passou. |
| `npx.cmd tsc --ignoreConfig --noEmit --target es2023 --module esnext --moduleResolution bundler --esModuleInterop --skipLibCheck src/server/commercial-access.ts src/server/commercial-access-default.ts tests/commercial-access.test.ts` | Passou. |
| `git diff --check` | Passou. |

### Commit da correção

- `ae6c600 fix(access): isolate Firebase Admin app by project`

### Concerns remanescentes

- A validação usa o nome e o `projectId` registrado na app Admin; se outro código do mesmo processo ocupar esse mesmo nome com projeto distinto, a autenticação falha fechada em vez de reutilizá-la.
- Não foram usadas credenciais, Firebase real, contas externas ou produção; o comportamento foi coberto com implementações injetadas de módulos Admin.
