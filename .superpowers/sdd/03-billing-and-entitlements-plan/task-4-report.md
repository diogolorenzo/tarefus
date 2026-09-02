# Task 4 — IA protegida por entitlement e orçamento

## Status

Concluída no escopo local e testável. A nova rota só alcança o cliente Gemini depois de autenticação Firebase-verificável, autorização de membership e reserva transacional de ação/custo. A composição padrão permanece deliberadamente indisponível até existirem persistência e configuração server-owned reais. Nenhum serviço externo foi configurado ou chamado.

## Arquivos

- `src/server/ai-task-draft-policy.ts`: operação/modelo/configuração fixos no servidor, validação estrita do body e hashes SHA-256.
- `src/server/ai-usage-ledger.ts`: contratos de reserva/liquidação e fake transacional em memória apenas para testes.
- `src/server/gemini-task-draft-client.ts`: cliente Gemini injetável, um único modelo/chamada, sem retry/fallback de modelos e com erro pós-envio conservador como `unknown`.
- `src/server/ai-task-draft-service.ts`: orquestra reserva, chamada, liquidação, liberação pré-envio, `unknown` e replay.
- `src/server/ai-task-draft-router.ts`: rota protegida `POST /api/organizations/:orgId/ai/task-drafts`.
- `src/server/ai-task-draft-default.ts`: composição fail-closed sem ledger/result store duráveis.
- `src/server/legacy-ai-router.ts`: rota antiga removida com resposta HTTP 410.
- `server.ts`: monta as rotas nova e aposentada; remove a chamada Gemini legada e o fallback heurístico.
- `tests/ai-ledger.test.ts`, `tests/ai-task-draft-service.test.ts`, `tests/ai-task-draft-router.test.ts`: cobertura dos comportamentos obrigatórios com fakes.
- `package.json`: scripts de teste focados da Task 4.

## Decisões

- O request aceita exclusivamente `{ "description": string }`, limitada a 2.000 caracteres; chaves extras como `prompt`, `boards`, `users`, `model`, `systemPrompt`, `temperature`, tools ou limites são recusadas.
- A única operação é `task_draft`; modelo e parâmetros são constantes server-side. O cliente faz exatamente uma tentativa.
- `Idempotency-Key` é obrigatório. O ledger recebe somente o fingerprint SHA-256 de organização + UID autenticado + operação + chave e o hash do body normalizado.
- Membership, entitlement, ação, pior custo, taxa e concorrência são verificados dentro da mesma seção transacional da reserva.
- O ledger contém somente hashes, metadados de operação, contagens/tokens e custos inteiros em microunits. O resultado estruturado fica em contrato de store separado; a implementação em memória desse store também é somente fake de teste.
- Falha conhecida antes de envio libera a reserva, mas permanece terminal/idempotente. Timeout ou erro ambíguo depois da tentativa mantém a reserva econômica em `unknown` e replay não chama o provedor.
- A rota legada não tem acesso a cliente Gemini e retorna `410 legacy_ai_route_removed`.

## TDD RED

1. `npm.cmd run test:ai-ledger` falhou inicialmente com `ERR_MODULE_NOT_FOUND` para `ai-usage-ledger`; após a primeira implementação mínima, houve RED comportamental de `6/7`, pois esgotamento retornava `entitlement` em vez de `actions`. A ordem de decisão foi corrigida e chegou a `7/7`.
2. `npm.cmd run test:ai-service` falhou com `ERR_MODULE_NOT_FOUND` para `ai-task-draft-service`; a implementação posterior chegou a `8/8`.
3. `npm.cmd run test:ai-router` falhou com `ERR_MODULE_NOT_FOUND` para `ai-task-draft-router`; a implementação posterior chegou a `7/7`.

## Comandos e resultados

- `npm.cmd run test:ai-ledger` — 7/7 passaram.
- `npm.cmd run test:ai-service` — 8/8 passaram.
- `npm.cmd run test:ai-router` — 7/7 passaram.
- `npm.cmd run test:commercial` — 11/11 passaram.
- `npm.cmd run test:commercial-access` — 11/11 passaram.
- `npm.cmd run test:commercial-persistence` — repositório 8/8, migração 7/7 e regras staged passaram.
- `npm.cmd run build` — exit 0; Vite e bundle server concluídos.
- `npm.cmd run lint` — exit 0; 19 warnings preexistentes, sem erro e sem warning nos arquivos da Task 4.
- `git diff --check` — sem erro de whitespace.

Total dos testes executados: 60/60 passaram, sendo 22/22 novos da Task 4.

## Commits

- `6dd2e06` — `feat: protect AI task draft generation`
- O relatório é versionado em commit local separado, sem amend; o hash consta no handoff final.

## Concerns / pendências deliberadas

- A composição padrão retorna 503 até serem fornecidos Firebase Admin real, ledger transacional durável, store durável de resultados e credencial Gemini server-owned. Isso é o fail-closed exigido, não uma ativação incompleta.
- O frontend ainda chama `/api/generate-task-draft` e passará a receber 410 até a task posterior de integração de UI.
- Nenhum teste chama Gemini/Firebase/Firestore reais; o adapter Google foi apenas compilado. Não houve deploy, migration, push, merge ou PR.
- O build preserva o warning já existente de chunk frontend maior que 500 kB. O lint preserva os 19 warnings preexistentes fora dos arquivos desta task.
