# SDD ledger - plan: docs/commercial/03-billing-and-entitlements-plan.md

Execution branch: codex/billing-entitlements-foundation
Execution base after planning commits: bc4b0ae
Baseline: lint passed with pre-existing warnings; 141 legacy test assertions passed; build passed when run outside the sandbox, whose native esbuild filesystem access is restricted.

Task 1: fix round 1/5 (2 addressed, 0 open - expiração de active e comparação de timestamps; commits 4467e76..99e9993)
Task 1: complete (commits bc4b0ae..99e9993, review clean)
Task 2: fix round 1/5 (2 addressed, 0 open - app Firebase nomeada por projeto e teste real de credenciais ausentes; commits 8ddeefc..3607fc9)
Task 2: complete (commits 99e9993..3607fc9, review clean)
Task 3: minor (deferred): use comparator ordinal instead of localeCompare for deterministic migration order/planId.
Task 3: minor (deferred): generalize static Rules test so permissive recursive wildcard variable name is not fixed to `document`.
Task 3: fix round 1/5 (1 addressed, 0 open - invalid runtime type for legacy active flag; commits 1687904..7173b5f)
Task 3: complete (commits 3607fc9..7173b5f, 2 deferred minors)
Task 4: complete (missing/partial usageMetadata protection, replay membership revalidation, dual rate/concurrency limits)
Task 5: complete (BillingProvider abstraction, HMAC constant-time verification, raw event inbox with SHA-256 and PAN/CVV masking, idempotent worker with out-of-order defense, inert 503 webhooks, and checkout redirect entitlement shield)
Task 6: complete (product integration, seat capacity admission gate, AI quota admission gate with clean Portuguese error mapping, CommercialStatusBanner non-blocking fallback, comprehensive tests in tests/commercial-gates.test.ts, docs update with External Dependencies Register, zero client authority)
