# Changelog

Todas as mudanças relevantes do produto são registradas neste arquivo.

## [Comercial] - 2026-09-03

### Adicionado

- Homepage pública do Tarefus, com posicionamento para pequenas empresas brasileiras e caminhos claros para planos, guia e acesso.
- Página pública de `/planos`, com cobrança por empresa, membros incluídos e comunicação do teste de 14 dias.
- Guia público em `/guia`, com 12 artigos sobre criação e gestão de tarefas.

### Comportamento de lançamento

- O produto inicia em modo waitlist por padrão. O teste de 14 dias e os cadastros públicos só são habilitados com `VITE_TAREFUS_LAUNCH_PHASE=trial`.

### Segurança comercial

- Fundação de organizações, limites de membros, entitlements e controle de uso de IA.
- Checkout, webhooks e atualizações de assinatura seguem o princípio fail-closed; mudanças de acesso dependem de eventos verificados pelo servidor.
