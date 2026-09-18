# Tarefus

Tarefus é uma aplicação web de gestão de tarefas para pequenas empresas brasileiras. A experiência combina quadros Kanban, prazos, checklists, múltiplos responsáveis, autenticação corporativa, persistência em Firebase/Firestore e criação assistida por Gemini.

## Stack atual

- React 19 + TypeScript 6
- Vite 8 + Tailwind CSS v4
- Firebase Authentication e Firestore
- Express para o servidor local e proxy de IA
- Google Gemini para rascunhos de tarefas
- `@hello-pangea/dnd` para arrastar e soltar

## Executar localmente

Requisitos: Node.js compatível com o projeto e npm.

```powershell
npm.cmd ci
Copy-Item .env.example .env
# preencha as variáveis necessárias no .env
npm.cmd run dev
```

O servidor de desenvolvimento fica em `http://localhost:3000` (o Vite é servido pelo Express). Para gerar a versão de produção:

```powershell
npm.cmd run build
npm.cmd start
```

Nunca comite chaves, tokens, certificados ou o conteúdo do `.env`. O arquivo `.env.example` contém somente placeholders.

## Configuração

O servidor usa `GEMINI_API_KEY` para criação de rascunhos com IA. O cliente Firebase usa a configuração pública presente em `firebase-applet-config.json`; regras de segurança e credenciais administrativas continuam sendo responsabilidade do projeto Firebase.

`VITE_TAREFUS_LAUNCH_PHASE` controla a etapa comercial:

- ausente ou diferente de `trial`: modo `waitlist`, sem cadastro público;
- `trial`: habilita o fluxo de teste de 14 dias conforme os gates comerciais.

Variáveis administrativas opcionais para o servidor incluem `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` e os segredos de billing definidos no código. Elas devem ser fornecidas apenas pelo ambiente de execução.

## Rotas principais

- `/` — workspace autenticado;
- `/login` e `/entrar` — login;
- `/register` e `/cadastro` — cadastro quando o lançamento permite;
- `/planos` e `/pricing` — planos públicos;
- `/guia` e `/guide` — hub público do guia;
- `/guia/:slug` — artigo público do guia.

As rotas públicas podem ser acessadas diretamente, inclusive por usuários já autenticados.

## Testes e validação

Os testes são executáveis individualmente com `tsx`. Os comandos mais usados são:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run test:commercial
npm.cmd run test:commercial-persistence
npm.cmd run test:ai
npx.cmd tsx tests/routing_theme_integration.test.ts
npx.cmd tsx tests/experience_hygiene.test.ts
npx.cmd tsx tests/assignee_multi_select.test.ts
npm.cmd run build
```

O lint pode reportar avisos em suítes adversariais antigas; eles não devem ser confundidos com erros de compilação. Build, typecheck e os testes relevantes precisam ser verificados juntos antes de uma publicação.

## Arquitetura resumida

- `src/context/TaskContext.tsx` concentra estado de rota, autenticação, tarefas, quadros, membros e persistência;
- `src/services/firestoreService.ts` integra dados corporativos com Firestore;
- `src/server/` contém política de IA, ledger de uso, billing e migração comercial;
- `src/site/` contém homepage e conteúdo público;
- `src/components/` contém workspace autenticado, configurações, planos e guia;
- `server.ts` compõe o servidor Express e o endpoint de rascunho de tarefa.

## Limites operacionais

Os comandos locais validam código, testes e build; eles não comprovam que Firebase, Gemini, billing, DNS ou o ambiente de produção estejam operacionais. Deploy, configuração de segredos e ativação comercial exigem uma verificação separada no ambiente real.
