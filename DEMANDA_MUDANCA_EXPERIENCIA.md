# Especificação de Demanda: Mudança de Experiência do Tarefus

> **Objetivo:** Refatorar a experiência do usuário do Tarefus para um ambiente corporativo profissional e limpo, desacoplando rotas comerciais/públicas da área autenticada, removendo resquícios de demonstração/desenvolvimento da interface e garantindo a estabilidade estrutural da nova homepage.

---

## 1. Visão Geral das Mudanças

1. **Desacoplamento de Rotas Públicas da Navegação Autenticada:**
   - Remover links para `/planos` e `/guia` da barra de navegação superior e do menu do avatar após o login.
   - Preservar rigorosamente `/planos`, `/pricing`, `/guia`, `/guide` e `/guia/:slug` como rotas públicas e abertas (com `PublicNavbar`).
2. **Higienização de Elementos de Demonstração e Infraestrutura:**
   - Remover atalhos de login rápido em 1 clique e perfis fictícios na tela de login (`AuthPage.tsx`).
   - Remover e descontinuar o modal legado `LoginModal.tsx` montado em `App.tsx`.
   - Remover o banner de desenvolvimento/demonstração (`CommercialStatusBanner.tsx`) montado no topo do workspace quando o backend comercial responde 503 ou opera offline.
   - Remover botão destrutivo de "Repovoar Banco (Seed)" e o banner de infraestrutura do Firestore da tela de configurações (`AuditLogsSettings.tsx`).
   - Renomear a subaba de configurações para `'Auditoria de Atividades'`.
3. **Higienização do Modal de Ajuda (`HelpCenterModal.tsx`):**
   - Remover os cards promocionais de topo que direcionam o usuário logado para `/planos` e `/guia`.
4. **Garantia de Qualidade e Atualização de Testes:**
   - Criar testes automatizados de higiene de UI para navegação, login, configurações e rotas.
   - Corrigir a suíte de testes de integração de rotas e tema para consumir as funções e constantes canônicas de `TaskContext.tsx` e `storage.ts`.

---

## 2. Tarefas Detalhadas por Módulo

---

### Tarefa 1: Navegação Autenticada (`src/components/Navbar.tsx`)

- **1.1. Barra de Navegação Desktop:**
  - Localização: `src/components/Navbar.tsx` (linhas 164-193).
  - Ação: Remover o separador vertical `<div className="h-4 w-px bg-line mx-1 hidden xl:block" />` e os dois botões "Planos" e "Guia".
  - Verificação: A barra `#tour-nav-tabs` deve conter exclusivamente os botões "Quadros por Área" e "Minhas Tarefas (N)".
  - Cuidados: Preservar o alinhamento absoluto centralizado do nome da organização (`absolute left-1/2 -translate-x-1/2`).

- **1.2. Menu Dropdown do Avatar:**
  - Localização: `src/components/Navbar.tsx` (linhas 360-395 e 438-460).
  - Ação:
    1. Remover o item `Planos & Preços (R$)`.
    2. Remover o item `Guia de Boas Práticas`.
    3. Remover a ação `Restaurar Dados de Exemplo` e seu diálogo `resetDemoData()`.
  - Cuidados com Imports:
    - Remover `RotateCcw` dos imports de `lucide-react` caso não haja outro uso.
    - Se `CreditCard` e `BookOpen` não forem mais usados em `Navbar.tsx`, removê-los também.

- **1.3. Navegação Móvel:**
  - Localização: `src/components/Navbar.tsx` (linhas 481-522).
  - Ação: Manter as 3 abas operacionais (`Quadros`, `Tarefas`, `Ajustes`). Nenhuma alteração necessária aqui.

---

### Tarefa 2: Links Internos no `HelpCenterModal.tsx`

- Localização: `src/components/help/HelpCenterModal.tsx`.
- Ação:
  1. Remover o grid de dois cards promocionais ("Planos & Preços" e "Guia de Boas Práticas") no início da aba FAQ (linhas 187-244).
  2. Na linha 35, remover `navigateTo` da desestruturação de `useTaskContext()`.
  3. Remover `CreditCard` dos imports de `lucide-react`.
  4. **ATENÇÃO:** **NÃO remover `BookOpen`** dos imports, pois é usado como ícone da aba FAQ na linha 137 (`<BookOpen className="w-4 h-4" />`).
- Verificação: Ao abrir o Help Center, a aba FAQ deve iniciar diretamente com o campo de busca de dúvidas frequentes.

---

### Tarefa 3: Login Limpo em `AuthPage.tsx` e Descontinuação de `LoginModal.tsx`

- **3.1. `src/components/auth/AuthPage.tsx`:**
  - Ação:
    1. Remover a função `handleQuickLogin` (linhas 102-107).
    2. Remover a seção visual "Acesso rápido para demonstração (1 clique)" com os 3 perfis fictícios (linhas 320-371).
    3. **ATENÇÃO:** **NÃO remover `ShieldCheck` e `Briefcase`** dos imports, pois eles continuam em uso no cabeçalho do formulário.
  - Verificação: A tela de login exibe apenas o formulário corporativo padrão (e-mail, senha, lembrar, recuperar senha, botão de entrar).

- **3.2. `src/components/LoginModal.tsx` & `src/App.tsx`:**
  - Ação:
    1. Em `src/App.tsx` (linha 222), remover a tag `<LoginModal />` e seu import.
    2. Excluir ou descontinuar o componente órfão `src/components/LoginModal.tsx`.
    3. Em `src/context/TaskContext.tsx` (linha 292), remover o estado órfão `isLoginModalOpen` e `setIsLoginModalOpen` do contexto se não for consumido em nenhum outro lugar.

---

### Tarefa 4: Remoção do Banner Comercial de Desenvolvimento

- **4.1. `src/App.tsx`:**
  - Localização: `src/App.tsx` (linha 211).
  - Ação: Remover a linha `<CommercialStatusBanner />` e o import correspondente.
- **4.2. Suporte Interno em `src/context/TaskContext.tsx`:**
  - **MANTER INTACTO:** O mecanismo de resiliência em memória (`resolveEntitlements` e `createTrialSubscription` nas linhas 343-356) continua ativo para garantir que o workspace funcione offline e sob erro 503 sem interromper o usuário.

---

### Tarefa 5: Ações de Seed/Reseed e Configurações (`Settings`)

- **5.1. `src/components/settings/AuditLogsSettings.tsx`:**
  - Ação:
    1. Remover o botão "Repovoar Banco (Seed)" (linhas 63-75).
    2. Remover o banner informativo do Firestore "Google Cloud Firestore (Single-Tenant) - Conectado & Ativo" (linhas 78-98).
    3. Limpar imports: remover `Database` e `RefreshCw` de `lucide-react`; remover `reseedDatabase` e `canReseed` de `useTaskContext()`.
    4. **ATENÇÃO:** **NÃO remover `CheckCircle2`**, pois é utilizado na listagem de logs (linha 192).

- **5.2. `src/components/settings/SettingsView.tsx`:**
  - Localização: `src/components/settings/SettingsView.tsx` (linhas 66-71).
  - Ação:
    - Alterar `label` de `'Auditoria & Banco'` para `'Auditoria de Atividades'`.
    - Alterar `description` de `'Logs de atividades e status do Firestore'` para `'Histórico e logs de eventos operacionais'`.

- **5.3. Suporte Interno:**
  - **NÃO REMOVER:** A função `ensureDatabaseSeeded()` em `src/context/TaskContext.tsx` (linha 372) e `src/services/firestoreService.ts` (linha 63) é indispensável para criar os quadros padrão quando um banco novo é inicializado.

---

### Tarefa 6: Preservação de Rotas Públicas e Decisão de Tema

- **6.1. Rotas Públicas em `src/App.tsx`:**
  - Assegurar que as rotas `/planos`, `/pricing`, `/guia`, `/guide`, `/guia/:slug` continuem sendo resolvidas por `resolveClientRoute` e renderizadas **antes** da guarda `if (!isAuthenticated || !currentUser)`.
  - Garantir que usuários com sessão ativa continuem conseguindo navegar para `/planos` e `/guia` via URL direta, renderizando a casca pública correspondente.

- **6.2. Tema:**
  - Manter a chave de persistência `'tarefus_theme_v1'` definida em `src/services/storage.ts` e a sincronização da classe `.dark` no elemento `<html>`.

---

### Tarefa 7: Integridade da Nova Homepage (`src/site/`)

- Confirmar que todas as âncoras da página inicial correspondem a elementos reais no DOM com seus respectivos IDs:
  - `#hero` (HeroSection)
  - `#diagnostico` (StatementSection)
  - `#comparativo` (ComparisonSection)
  - `#demonstracao` (AiDemoSection)
  - `#passos` (StepsSection)
  - `#dia-a-dia` (FeatureShowcase)
  - `#prazos` (FeatureShowcase)
  - `#acessos` (AccessSection)
  - `#perguntas` (FaqSection)
  - `#comecar` / `#lista-de-espera` (ClosingSection)

---

## 3. Testes Automatizados

### 3.1. Novos Testes a Criar
1. **`tests/authenticated-navigation-hygiene.test.ts`**:
   - Assegurar que a barra superior e o menu suspenso não contenham texto ou links para "Planos", "Guia" ou "Restaurar Dados de Exemplo".
2. **`tests/auth-page-clean-login.test.ts`**:
   - Assegurar que a página de login não contenha `handleQuickLogin` ou botões com perfis fictícios pré-preenchidos.
3. **`tests/help-center-modal-hygiene.test.ts`**:
   - Assegurar que o HelpCenterModal não exiba cards comerciais no topo do FAQ.
4. **`tests/settings-view-clean-audit.test.ts`**:
   - Assegurar que o painel de configurações exiba "Auditoria de Atividades" e não apresente botão de seed ou banner técnico do Firestore.
5. **`tests/public-route-resolver-contract.test.ts`**:
   - Testar diretamente as funções `resolveClientRoute` e `isPublicRoute` importadas de `src/context/TaskContext.tsx` cobrindo todas as rotas públicas.

### 3.2. Testes Existentes a Corrigir
- **`tests/routing_theme_integration.test.ts`**:
  - Atualizar o teste para usar a chave oficial `'tarefus_theme_v1'` de `storage.ts` em vez de `'tarefus_theme'`.
  - Substituir resolvers locais mockados por chamadas reais aos contratos de rota de `TaskContext.tsx`.

---

## 4. Comandos Obrigatórios de Validação

Ao concluir as modificações, executar obrigatoriamente:

```powershell
# 1. Checagem estática do TypeScript (deve retornar 0 erros)
npx tsc -p tsconfig.app.json --noEmit

# 2. Linter (deve retornar 0 erros)
npm.cmd run lint

# 3. Build de produção (deve completar com exit code 0)
npm.cmd run build

# 4. Suítes de testes de roteamento e navegação
npx tsx tests/routing_theme_integration.test.ts
npx tsx tests/public-route-resolver-contract.test.ts
npm.cmd run test:commercial-access
npm.cmd run test:commercial-gates
```

---

## 5. Critérios de Aceite Final

1. **Build & Tipos:** `npm run build`, `npm run lint` e `npx tsc -p tsconfig.app.json --noEmit` passam com zero erros.
2. **Área Autenticada:** Não há menção a "Planos", "Guia", "Restaurar Dados de Exemplo", nem banners de desenvolvimento no workspace pós-login.
3. **Rotas Públicas:** `/planos` e `/guia` abrem perfeitamente com `PublicNavbar`, tanto para anônimos quanto para usuários logados.
4. **Autenticação:** A tela de login não possui atalhos de 1 clique ou dados fictícios.
5. **Configurações:** O menu exibe "Auditoria de Atividades" sem ações destrutivas ou detalhes de Firestore expostos.
