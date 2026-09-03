# Tarefus Commercial & Entitlements Test Infrastructure Specification (TEST_INFRA.md)

**Document Version:** 1.0.0
**Date:** 2026-09-02
**Author:** `test_writer_e2e`
**Target Repository:** Tarefus (`codex/billing-entitlements-foundation`)
**Scope:** Commercial Foundation, Billing Provider, Raw Event Inbox, Inert Webhooks, Admission Gates, and Product Projections (Tasks 4, 5, 6).

---

## 1. Executive Summary & Test Philosophy

The commercial architecture of Tarefus enforces five uncompromising security, tenancy, and financial invariants:
1. **Zero Client Authority:** The frontend client has zero permission or capability to write commercial state (plans, subscriptions, seats, AI balance, usage records, or audit logs).
2. **Fail-Closed Operation:** In the absence of server credentials (Firebase Admin, Gemini API Key, Billing Webhook Secrets), all commercial and AI operations respond with explicit unavailability (HTTP 503 / disabled state) without exposing mock tokens or bypassing security.
3. **Pure Provider Agnosticism:** Payment providers (Asaas, iugu, Mercado Pago, Pagar.me) are abstracted behind a domain-level `BillingProvider` interface, exercisable deterministically via local in-memory test adapters without external network calls or third-party SDK dependencies.
4. **Idempotency & Replay Immunity:** Every state change requires deduplication (`provider:eventId` or idempotency fingerprints), constant-time HMAC verification, timestamp freshness checks (300s window), and strict membership/entitlement revalidation on replays.
5. **Strict Data Redaction:** No prompts, raw responses, API keys, webhook secrets, card PANs, or CVVs are ever written to Firestore documents, logs, or client responses.

This document establishes the authoritative **4-Tier E2E & Integration Test Architecture** designed to rigorously verify these invariants across all features in Tasks 4, 5, and 6.

---

## 2. Test Runners, Tooling & Package.json Execution Scripts

### 2.1 Tooling Stack
- **Runtime & Execution:** `tsx` (TypeScript Execute) on Node.js v20+ with native `node:assert/strict` and `node:crypto`.
- **Static Analysis:** `oxlint` (116 rules) and `tsc --noEmit` (strict type checking).
- **HTTP / Service Harness:** `express` in-memory instances bound to ephemeral localhost ports with native `fetch`.
- **Database Simulation:** `FakeCommercialFirestore` with transactional locks, snapshot isolation, and collection group queries.
- **Provider Simulation:** Deterministic `FakeBillingProviderAdapter` simulating Pix, Boleto, Credit Card, webhook signing, and replay behaviors.

### 2.2 Standard Test Scripts (`package.json`)

```json
{
  "scripts": {
    "test:commercial": "tsx tests/commercial-domain.test.ts",
    "test:commercial-access": "tsx tests/commercial-access.test.ts",
    "test:commercial-persistence": "tsx tests/commercial-repository.test.ts && tsx tests/commercial-migration.test.ts && tsx tests/firestore-rules-staged.test.ts",
    "test:ai-ledger": "tsx tests/ai-ledger.test.ts",
    "test:ai-service": "tsx tests/ai-task-draft-service.test.ts",
    "test:ai-router": "tsx tests/ai-task-draft-router.test.ts",
    "test:gemini-client": "tsx tests/gemini-task-draft-client.test.ts",
    "test:commercial-billing": "tsx tests/commercial-billing.test.ts",
    "test:commercial-gates": "tsx tests/commercial-gates.test.ts",
    "test:commercial-e2e": "tsx tests/commercial-e2e-scenarios.test.ts",
    "test:all-commercial": "npm run test:commercial && npm run test:commercial-access && npm run test:commercial-persistence && npm run test:ai-ledger && npm run test:ai-service && npm run test:ai-router && npm run test:gemini-client && npm run test:commercial-billing && npm run test:commercial-gates && npm run test:commercial-e2e"
  }
}
```

---

## 3. The 4-Tier Testing Methodology

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 4: REAL-WORLD WORKLOAD SCENARIOS                │
│  Multi-Tenant Agency Lifecycles, Concurrency Storms, Chaos Recovery   │
├────────────────────────────────────────────────────────────────────────┤
│                TIER 3: CROSS-FEATURE COMBINATORIAL MATRICES             │
│   Pairwise Interactions: Checkout + Webhooks, Downgrade + Seat Gates   │
├────────────────────────────────────────────────────────────────────────┤
│                 TIER 2: BOUNDARY & ADVERSARIAL CORNER CASES            │
│  Tampered HMAC, Clock Skew, Out-of-Order Events, Replay Exploits (>=5) │
├────────────────────────────────────────────────────────────────────────┤
│                     TIER 1: CORE FEATURE COVERAGE                       │
│    Happy Path Verification for all 18 Identified Features (>=5 each)   │
└────────────────────────────────────────────────────────────────────────┘
```

- **Tier 1 — Core Feature Coverage (Happy Path):** Ensures every functional component satisfies its primary specification with at least 5 distinct valid input variations.
- **Tier 2 — Boundary & Corner Cases:** Stresses limits, extreme inputs, missing fields, malformed metadata, clock drift, tampered cryptographic signatures, replay attempts, and out-of-order event streams (minimum 5 test cases per feature).
- **Tier 3 — Cross-Feature Combinations:** Evaluates pairwise and multi-module interactions across billing, identity, admission gates, and AI usage.
- **Tier 4 — Real-World Workload Scenarios:** Multi-step, end-to-end multi-tenant lifecycle flows executing realistic agency and team journeys from onboarding to high-scale usage, seat contention, payment failure, recovery, and audit reconciliation.

---

## 4. Comprehensive Feature Inventory (Tasks 4, 5, 6)

| # | Task | Category | Feature Identifier | Description | Target Test Suite |
|---|------|----------|-------------------|-------------|-------------------|
| 1 | 4 | AI | `F01_AI_USAGE_METADATA_GUARD` | Operations with missing, 0, or partial token counts are marked `unknown` with worst-case cost retained. | `tests/gemini-task-draft-client.test.ts`, `tests/ai-task-draft-service.test.ts` |
| 2 | 4 | AI | `F02_AI_OVER_RESERVATION_GUARD` | Operations where confirmed cost exceeds reserved amount are marked `unknown` holding hard cap. | `tests/ai-task-draft-service.test.ts` |
| 3 | 4 | AI | `F03_AI_REPLAY_AUTH_REVALIDATION` | Replay revalidates user membership and org entitlement before reading cached draft. | `tests/ai-task-draft-service.test.ts`, `tests/ai-ledger.test.ts` |
| 4 | 4 | AI | `F04_AI_DUAL_RATE_LIMIT` | Enforces rate limits per sliding window for both organization and individual user. | `tests/ai-ledger.test.ts` |
| 5 | 4 | AI | `F05_AI_DUAL_CONCURRENCY_LIMIT` | Enforces max concurrent reservations for both organization and individual user. | `tests/ai-ledger.test.ts`, `tests/ai-task-draft-service.test.ts` |
| 6 | 5 | Billing | `F06_BILLING_PROVIDER_CONTRACT` | Agnostic interface for customer, checkout, subscription, invoice, and webhooks. | `tests/commercial-billing.test.ts` |
| 7 | 5 | Billing | `F07_FAKE_BILLING_ADAPTER` | Pure in-memory deterministic test adapter simulating payment provider operations. | `tests/commercial-billing.test.ts` |
| 8 | 5 | Billing | `F08_RAW_EVENT_INBOX` | Append-only raw event inbox storing SHA-256 hash, masked payload, and processing state. | `tests/commercial-billing.test.ts` |
| 9 | 5 | Billing | `F09_HMAC_SIGNATURE_VERIFICATION` | Constant-time HMAC SHA-256 verification over preserved raw body bytes. | `tests/commercial-billing.test.ts` |
| 10 | 5 | Billing | `F10_WEBHOOK_REPLAY_TIMESTAMP` | Rejects webhook events outside the 300-second freshness window and deduplicates IDs. | `tests/commercial-billing.test.ts` |
| 11 | 5 | Billing | `F11_EVENT_DEDUPLICATION_ENGINE` | Deduplicates events by `provider + eventId` preventing duplicate domain side-effects. | `tests/commercial-billing.test.ts` |
| 12 | 5 | Billing | `F12_OUT_OF_ORDER_EVENT_GUARD` | Prevents older events from regressing newer subscription/invoice states. | `tests/commercial-billing.test.ts` |
| 13 | 5 | Billing | `F13_CHECKOUT_REDIRECT_SHIELD` | Guarantees browser redirect returns never alter subscription state or grant entitlements. | `tests/commercial-billing.test.ts` |
| 14 | 5 | Billing | `F14_INERT_FAIL_CLOSED_ENDPOINTS` | Billing and webhook routes return HTTP 503 when credentials/secrets are unconfigured. | `tests/commercial-billing.test.ts` |
| 15 | 6 | Product | `F15_SERVER_PROJECTION_GUARD` | UI consumes commercial status exclusively via authenticated server projections. | `tests/commercial-gates.test.ts` |
| 16 | 6 | Product | `F16_SEAT_ADMISSION_GATE` | Blocks member invitations when `activeSeats >= maxSeats` with clear upgrade feedback. | `tests/commercial-gates.test.ts` |
| 17 | 6 | Product | `F17_AI_QUOTA_ADMISSION_GATE` | Verifies AI entitlements in UI, displays remaining credits, and provides graceful limit feedback. | `tests/commercial-gates.test.ts` |
| 18 | 6 | Product | `F18_UNAVAILABILITY_FEEDBACK` | Renders graceful non-blocking UI indicators when backend services are unconfigured. | `tests/commercial-gates.test.ts` |

---

## 5. Tier 1: Core Feature Coverage (Happy Path — >=5 Test Cases per Feature)

Every feature is exercised with >=5 valid operational scenarios covering its complete functional contract:

### Feature F01: Zero/Partial Usage Metadata Guard
- `T1.01.01`: Normal Gemini response with standard token counts (`inputTokens: 120, outputTokens: 45`) settles confirmed cost accurately.
- `T1.01.02`: Large generation response (`inputTokens: 500, outputTokens: 250`) within limits settles confirmed cost.
- `T1.01.03`: Short generation response (`inputTokens: 30, outputTokens: 15`) settles minimum positive cost.
- `T1.01.04`: Exact upper boundary generation (`outputTokens: 768`) settles successfully within cost bounds.
- `T1.01.05`: Consecutive valid Gemini calls settle cumulative confirmed costs monotonically in ledger.

### Feature F02: Over-Reservation Cost Cap Guard
- `T1.02.01`: Provider cost exactly matches estimated reservation -> settles at reservation price.
- `T1.02.02`: Provider cost is 50% of estimated reservation -> settles at confirmed lower price and releases difference.
- `T1.02.03`: Provider cost is 90% of estimated reservation -> settles and updates ledger totals cleanly.
- `T1.02.04`: Provider cost is 1 microunit below reservation -> settles without triggering over-cost guard.
- `T1.02.05`: Multi-operation batch where all provider costs are within bounds -> settles each operation independently.

### Feature F03: Replay Auth & Entitlement Revalidation
- `T1.03.01`: Same user replays identical request with valid membership and active plan -> returns cached draft instantly without Gemini call.
- `T1.03.02`: Admin user replays identical request with valid credentials -> returns cached draft.
- `T1.03.03`: User replays request after 1 hour with active session -> returns cached draft.
- `T1.03.04`: User replays multiple identical requests in succession -> returns identical cached result for all replays.
- `T1.03.05`: Distinct idempotency keys for identical prompt text execute separate operations with independent results.

### Feature F04: Dual Rate Limiting (Org & User)
- `T1.04.01`: User submits request below user rate limit -> permitted.
- `T1.04.02`: Organization submits requests below org rate limit across distinct users -> permitted.
- `T1.04.03`: User submits request at rate limit boundary (`N` operations in window) -> permitted.
- `T1.04.04`: User waits for rate window expiration -> subsequent request permitted.
- `T1.04.05`: Multiple users in same org submit requests staggered within window -> all permitted while under limits.

### Feature F05: Dual Concurrency Limiting (Org & User)
- `T1.05.01`: Single user starts operation with concurrency limit = 2 -> permitted.
- `T1.05.02`: Second user in org starts operation within org concurrency limit = 5 -> permitted.
- `T1.05.03`: User starts second concurrent operation when user limit = 2 -> permitted.
- `T1.05.04`: First operation completes -> subsequent concurrent request from user is permitted.
- `T1.05.05`: Org with 5 concurrent slots runs 5 simultaneous requests from 5 distinct users -> all permitted.

### Feature F06: Agnostic `BillingProvider` Contract
- `T1.06.01`: `createCustomer` returns normalized `BillingCustomer` with valid provider ID.
- `T1.06.02`: `createCheckoutSession` returns valid checkout URL and expiration timestamp.
- `T1.06.03`: `getSubscription` returns normalized `BillingSubscription` with accurate period timestamps.
- `T1.06.04`: `getInvoice` returns normalized `BillingInvoice` with BRL currency and payment status.
- `T1.06.05`: `parseWebhookEvent` transforms raw payload into strongly typed `NormalizedBillingEvent`.

### Feature F07: Deterministic Fake Billing Adapter
- `T1.07.01`: Simulates successful credit card checkout session creation.
- `T1.07.02`: Simulates Pix checkout generation with QR code payload reference.
- `T1.07.03`: Simulates Boleto checkout generation with barcode line.
- `T1.07.04`: Generates cryptographically valid HMAC webhook payloads on demand for testing.
- `T1.07.05`: Emits deterministic sequence of subscription state transitions in memory.

### Feature F08: Immutable Raw Event Inbox
- `T1.08.01`: Stores valid incoming webhook payload with computed SHA-256 hash.
- `T1.08.02`: Masks credit card PAN and CVV fields in stored payload while preserving metadata.
- `T1.08.03`: Records initial `received` processing state with server timestamp.
- `T1.08.04`: Transitions processing state from `received` -> `processing` -> `processed`.
- `T1.08.05`: Assigns monotonic sequence version and correlation ID to every inbox record.

### Feature F09: Constant-Time HMAC Signature Verification
- `T1.09.01`: Valid HMAC SHA-256 signature generated with standard secret passes verification.
- `T1.09.02`: Valid HMAC signature with multi-byte UTF-8 characters in payload passes verification.
- `T1.09.03`: Valid HMAC signature with large JSON payload (50KB) passes verification.
- `T1.09.04`: Valid HMAC signature using secondary signing secret during rotation passes verification.
- `T1.09.05`: Constant-time comparison `timingSafeEqual` executes without error on matching hex buffers.

### Feature F10: Webhook Replay Protection Window (Timestamp Freshness)
- `T1.10.01`: Webhook timestamp matching server time exactly (`diff = 0s`) is accepted.
- `T1.10.02`: Webhook timestamp 60 seconds in the past (`diff = -60s`) is accepted within 300s window.
- `T1.10.03`: Webhook timestamp 290 seconds in the past (`diff = -290s`) is accepted within 300s window.
- `T1.10.04`: Webhook timestamp 30 seconds in the future (minor clock drift) is accepted within 300s window.
- `T1.10.05`: Webhook timestamp formatted as Unix epoch seconds or ISO 8601 string is parsed correctly.

### Feature F11: Event Deduplication Engine
- `T1.11.01`: First delivery of `provider + eventId` transitions state and stores inbox record.
- `T1.11.02`: Second delivery of identical `provider + eventId` returns HTTP 200/202 acknowledgment.
- `T1.11.03`: Second delivery does not re-invoke domain state transitions or increment counters.
- `T1.11.04`: Second delivery does not duplicate audit events in the repository.
- `T1.11.05`: Distinct `eventId` from same provider with identical payload content processes normally.

### Feature F12: Out-of-Order Event Protection
- `T1.12.01`: `subscription.created` followed by `invoice.paid` transitions state cleanly to `active`.
- `T1.12.02`: `invoice.paid` arriving before `subscription.created` resolves to consistent `active` state.
- `T1.12.03`: `subscription.canceled` sets state to `canceled` while keeping period active.
- `T1.12.04`: Stale event with older `occurredAt` timestamp does not overwrite newer state.
- `T1.12.05`: Compensatory audit event recorded whenever an out-of-order event is reconciled.

### Feature F13: Checkout Redirect Shield
- `T1.13.01`: User navigates to `/billing/return?session_id=fake-123&status=success` -> returns informational status.
- `T1.13.02`: Direct return URL navigation leaves organization subscription in prior state (`trialing` or `payment_pending`).
- `T1.13.03`: Organization entitlements remain un-upgraded until webhook event arrives from server.
- `T1.13.04`: Return URL with forged query params (`status=paid&plan=enterprise`) does not trigger database writes.
- `T1.13.05`: UI polling after return reflects true server projection state once webhook settles.

### Feature F14: Inert Fail-Closed Billing Endpoints
- `T1.14.01`: Webhook endpoint with configured test secret responds HTTP 200 on valid event.
- `T1.14.02`: Checkout session creation endpoint with configured provider returns checkout URL.
- `T1.14.03`: Plan change endpoint with valid credentials schedules change in domain repository.
- `T1.14.04`: Cancellation endpoint with valid credentials transitions subscription cleanly.
- `T1.14.05`: Webhook router unmounts or responds 503 cleanly when secret environment variable is cleared.

### Feature F15: Server-Side Projection Guard
- `T1.15.01`: `GET /api/organizations/:orgId/entitlements` returns sanitized snapshot for active member.
- `T1.15.02`: Projection includes `accessMode`, `seats`, `ai`, and `planId`.
- `T1.15.03`: Projection masks internal database identifiers and payment gateway customer IDs.
- `T1.15.04`: Projection reflects plan downgrades and upgrades immediately upon server mutation.
- `T1.15.05`: Client reads snapshot into memory store without making direct Firestore writes.

### Feature F16: Seat Capacity Admission Gate
- `T1.16.01`: Org with 1/3 seats assigned allows inviting a 2nd member -> active seats becomes 2/3.
- `T1.16.02`: Org with 2/3 seats assigned allows inviting a 3rd member -> active seats becomes 3/3.
- `T1.16.03`: Projection reports `canAssignSeat: true` and `isAtOrOverLimit: false` when 2/3 assigned.
- `T1.16.04`: Deactivating a member reduces active count (3/3 -> 2/3) and re-enables `canAssignSeat`.
- `T1.16.05`: Inviting member with existing deactivated record reactivates without exceeding seat quota.

### Feature F17: AI Quota Admission Gate
- `T1.17.01`: Org with 10/100 AI actions used allows draft generation -> used actions becomes 11/100.
- `T1.17.02`: Projection reports `canUseAction: true` and `remainingActions: 89`.
- `T1.17.03`: UI renders remaining AI quota badge clearly to user.
- `T1.17.04`: Successful draft response populates task creation modal fields smoothly.
- `T1.17.05`: AI generation with 1 action remaining executes successfully and transitions remaining actions to 0.

### Feature F18: Unavailability Feedback Banner & Graceful Fallback
- `T1.18.01`: When backend returns 503 `authentication_unavailable`, UI renders graceful offline notice.
- `T1.18.02`: When backend returns 503 `ai_unavailable`, UI hides AI button and keeps manual task creation active.
- `T1.18.03`: When backend returns 503 `billing_provider_unavailable`, UI displays friendly maintenance banner on billing page.
- `T1.18.04`: Unavailability banner does not crash React component tree or disrupt navigation.
- `T1.18.05`: When credentials are restored, subsequent refresh loads commercial status normally.

---

## 6. Tier 2: Boundary & Adversarial Corner Cases (>=5 Test Cases per Feature)

Stress tests, extreme bounds, malformed inputs, clock drift, cryptographic attacks, and race conditions:

### Feature F01: Zero/Partial Usage Metadata Guard (Corner Cases)
- `T2.01.01`: Gemini returns `usageMetadata` object with `promptTokenCount: 0, candidatesTokenCount: 0` -> marked `unknown`, worst-case cost retained.
- `T2.01.02`: Gemini returns `usageMetadata` with missing `candidatesTokenCount` -> marked `unknown`, worst-case cost retained.
- `T2.01.03`: Gemini returns completely omitted `usageMetadata` field -> marked `unknown`, worst-case cost retained.
- `T2.01.04`: Gemini returns negative integer token count (`promptTokenCount: -5`) -> rejected as invalid, marked `unknown`.
- `T2.01.05`: Gemini returns non-numeric token count (`promptTokenCount: "NaN"`) -> rejected as invalid, marked `unknown`.

### Feature F02: Over-Reservation Cost Cap Guard (Corner Cases)
- `T2.02.01`: Gemini returns confirmed cost exceeding reservation by 1 microunit -> marked `unknown` (`provider_cost_exceeds_reservation`), hard cap held.
- `T2.02.02`: Gemini returns confirmed cost 10x higher than reservation -> marked `unknown`, hard cap held.
- `T2.02.03`: Gemini returns floating point cost string (`cost: 12.3456`) -> sanitized to integer microunits or rejected.
- `T2.02.04`: Confirmed cost overflows `MAX_SAFE_INTEGER` -> marked `unknown`, hard cap held.
- `T2.02.05`: Confirmed cost reported as `0` while token count > 0 -> marked `unknown` (`provider_usage_invalid`), worst-case cost held.

### Feature F03: Replay Auth & Entitlement Revalidation (Corner Cases)
- `T2.03.01`: User deactivated/removed from org between initial call and replay -> HTTP 403 Forbidden without Gemini call or cached result.
- `T2.03.02`: Organization subscription expires between initial call and replay -> HTTP 402/403 Blocked without Gemini call.
- `T2.03.03`: Idempotency key replayed with modified request description -> HTTP 409 Conflict with prior operation ID.
- `T2.03.04`: Idempotency key replayed by different user in same org -> isolated by fingerprint (`org:uid:op:key`), executes new operation.
- `T2.03.05`: Idempotency key containing SQL injection / directory traversal chars (`../../key`, `' OR 1=1`) -> hashed safely via SHA-256 without path escape.

### Feature F04: Dual Rate Limiting (Corner Cases)
- `T2.04.01`: Single user fires `N + 1` requests in 1 second when limit is `N/min` -> `N+1`-th request blocked (`kind: 'blocked', reason: 'rate'`).
- `T2.04.02`: User at limit blocked while peer user in same org with 0 requests is permitted.
- `T2.04.03`: Org-wide limit reached while individual user has remaining personal quota -> request blocked at org level.
- `T2.04.04`: Rate limit sliding window evaluated with sub-millisecond precision -> unlocks immediately upon window roll.
- `T2.04.05`: Clock rollback / NTP step backwards -> handled gracefully without permanently locking rate limits.

### Feature F05: Dual Concurrency Limiting (Corner Cases)
- `T2.05.01`: User with concurrency limit = 1 fires 2 requests simultaneously -> 2nd request blocked before network call.
- `T2.05.02`: Org with concurrency limit = 2 fires 3 requests across 3 users -> 3rd request blocked at org level.
- `T2.05.03`: Hanging/stalled provider call releases concurrency slot upon timeout cleanup.
- `T2.05.04`: Rapid burst of 20 concurrent requests -> exactly `limit` admitted, remaining 20 - `limit` rejected with 429/blocked.
- `T2.05.05`: Zero concurrency limit configured (`maxConcurrentOperations = 0`) -> fails closed, blocks all operations safely.

### Feature F06: Agnostic `BillingProvider` Contract (Corner Cases)
- `T2.06.01`: Unsupported provider identifier passed to factory -> throws domain error `unsupported_billing_provider`.
- `T2.06.02`: Customer creation with special characters in name (emojis, unicode, quotes) -> sanitized and processed.
- `T2.06.03`: Checkout session request for non-existent plan ID -> rejected with domain error `invalid_plan_id`.
- `T2.06.04`: Subscription period dates with non-standard ISO offset (`+05:30`, `-03:00`) -> normalized to UTC.
- `T2.06.05`: Null/undefined optional parameters in domain contracts do not cause runtime null pointer exceptions.

### Feature F07: Deterministic Fake Billing Adapter (Corner Cases)
- `T2.07.01`: Simulated network failure injection in fake adapter -> returns controlled `provider_network_error`.
- `T2.07.02`: Simulated malformed provider JSON payload -> handled by webhook parser without unhandled crash.
- `T2.07.03`: Simulated signature calculation with empty secret string -> handled securely.
- `T2.07.04`: Fake adapter handles rapid generation of 1,000 webhook events in memory without memory leak.
- `T2.07.05`: Resetting fake adapter state clears all in-memory customers, sessions, and invoices cleanly.

### Feature F08: Raw Event Inbox (Corner Cases)
- `T2.08.01`: Webhook payload with deeply nested JSON (depth > 20) -> masked and hashed without stack overflow.
- `T2.08.02`: Webhook payload containing credit card PAN in non-standard field names (`cc_num`, `primary_account`) -> masked.
- `T2.08.03`: Empty body (`0 bytes`) received at webhook endpoint -> rejected with HTTP 400 Bad Request before inbox write.
- `T2.08.04`: Huge payload (exceeding 1MB limit) -> rejected with HTTP 413 Payload Too Large.
- `T2.08.05`: Non-JSON raw payload (XML/binary) -> hashed, masked safely, marked `unsupported_payload_format`.

### Feature F09: Constant-Time HMAC Signature Verification (Corner Cases)
- `T2.09.01`: Signature header missing completely -> rejected with HTTP 400/401 (`missing_headers`).
- `T2.09.02`: Signature header contains incorrect hex length (63 or 65 chars instead of 64) -> rejected without exception.
- `T2.09.03`: Payload altered by exactly 1 bit after signature generation -> rejected with HTTP 401 (`invalid_signature`).
- `T2.09.04`: Secret mismatch (webhook signed with secret A, verified with secret B) -> rejected with HTTP 401.
- `T2.09.05`: Timing comparison attack simulation: comparing valid vs invalid signatures shows no timing delta variance.

### Feature F10: Webhook Replay Protection Window (Corner Cases)
- `T2.10.01`: Webhook timestamp 301 seconds in the past -> rejected with HTTP 401 (`timestamp_out_of_tolerance`).
- `T2.10.02`: Webhook timestamp 2 hours in the past -> rejected with HTTP 401.
- `T2.10.03`: Webhook timestamp 301 seconds in the future -> rejected with HTTP 401 (`timestamp_out_of_tolerance`).
- `T2.10.04`: Webhook timestamp header formatted as unparseable string (`"invalid-date"`) -> rejected with HTTP 400/401.
- `T2.10.05`: Webhook timestamp header missing when required by provider -> rejected with HTTP 400/401.

### Feature F11: Event Deduplication Engine (Corner Cases)
- `T2.11.01`: 10 identical webhook requests delivered concurrently in parallel -> exactly 1 processed, 9 recognized as duplicate.
- `T2.11.02`: Duplicate event delivered while first instance is still in `'processing'` state -> held or acknowledged idempotently.
- `T2.11.03`: Duplicate event delivered with altered payload hash -> flagged as suspicious duplicate mismatch in audit log.
- `T2.11.04`: Provider event ID containing special characters (`evt:123/456#abc`) -> sanitized in deduplication key.
- `T2.11.05`: Deduplication ledger handles 10,000 distinct event IDs without hash collisions.

### Feature F12: Out-of-Order Event Protection (Corner Cases)
- `T2.12.01`: `subscription.canceled` received, followed by older delayed `subscription.created` -> state remains `canceled`.
- `T2.12.02`: `invoice.payment_failed` received with timestamp `T+1`, older `invoice.paid` with timestamp `T` arrives later -> state remains failed.
- `T2.12.03`: Event received with identical timestamp but lower monotonic version -> lower version event ignored.
- `T2.12.04`: Rapid out-of-order sequence (`paid` -> `created` -> `renewed` -> `canceled`) resolves to latest chronological state.
- `T2.12.05`: Unknown event type from provider -> stored in inbox as `'ignored'`, state machine unchanged.

### Feature F13: Checkout Redirect Shield (Corner Cases)
- `T2.13.01`: User manually injects `?status=active&entitlement=full` on return URL -> server returns 200 with unchanged snapshot.
- `T2.13.02`: User reloads return URL 50 times in rapid succession -> no database state mutations triggered.
- `T2.13.03`: Return URL called with sessionId belonging to different organization -> no cross-tenant entitlement leakage.
- `T2.13.04`: Return URL called with expired checkout session ID -> UI displays expiration notice, plan unchanged.
- `T2.13.05`: Return URL visited before webhook arrival -> UI indicates pending status, entitlements remain in trial/pending.

### Feature F14: Inert Fail-Closed Billing Endpoints (Corner Cases)
- `T2.14.01`: Webhook endpoint called when `BILLING_WEBHOOK_SECRET` is empty string `""` -> returns HTTP 503 `billing_provider_unavailable`.
- `T2.14.02`: Checkout endpoint called when provider API key is undefined -> returns HTTP 503 `billing_provider_unavailable`.
- `T2.14.03`: Endpoints do not log missing secrets or throw unhandled promise rejections on 503 failure.
- `T2.14.04`: HTTP 503 response body contains clean error `{ error: 'billing_provider_unavailable' }` without stack trace.
- `T2.14.05`: Client requests to unmounted commercial endpoints return standard 404/503 without leaking server paths.

### Feature F15: Server-Side Projection Guard (Corner Cases)
- `T2.15.01`: Request with malformed Bearer token (`Bearer abc.def`) -> HTTP 401 `invalid_token`.
- `T2.15.02`: Authenticated user requesting projections for organization they do not belong to -> HTTP 403 `organization_forbidden`.
- `T2.15.03`: Authenticated user with role `member` (non-admin) requesting projection -> returns read-only projection without billing details.
- `T2.15.04`: Firestore rules attempt direct client write to `/organizations/:orgId/entitlements/current` -> permission denied.
- `T2.15.05`: Firestore rules attempt direct client write to `/organizations/:orgId/auditEvents/:id` -> permission denied.

### Feature F16: Seat Capacity Admission Gate (Corner Cases)
- `T2.16.01`: Organization with 3/3 seats assigned: admin attempts invite via API -> rejected with HTTP 409 `seat_limit_reached`.
- `T2.16.02`: Concurrent race condition: 2 admins invite members simultaneously when 1 seat is left -> exactly 1 succeeds, 1 gets 409.
- `T2.16.03`: Organization on Solo plan (1 seat): owner cannot add any secondary members (`maxSeats = 1`).
- `T2.16.04`: Plan downgraded from Team (3 seats) to Solo (1 seat) with 3 existing members -> existing 3 remain active, all new invites blocked.
- `T2.16.05`: System NEVER automatically deletes or deactivates members upon seat limit downgrade.

### Feature F17: AI Quota Admission Gate (Corner Cases)
- `T2.17.01`: User attempts AI generation when `remainingActions = 0` -> blocked client-side and server-side with 403 `ai_not_entitled`.
- `T2.17.02`: User in read-only organization (e.g. payment overdue) attempts AI generation -> blocked with 403.
- `T2.17.03`: Client attempts to bypass gate by sending extra fields (`prompt`, `temperature`, `model`) -> rejected with HTTP 400.
- `T2.17.04`: Client sends empty description (`""`) or whitespace description -> rejected with HTTP 400.
- `T2.17.05`: Client sends description exceeding 2,000 characters -> rejected with HTTP 400 `description_too_long`.

### Feature F18: Unavailability Feedback Banner (Corner Cases)
- `T2.18.01`: Network drop during projection fetch -> UI renders non-blocking retry indicator without unhandled error.
- `T2.18.02`: Server responds 500 internal error -> UI degrades gracefully to local task mode.
- `T2.18.03`: Rapid tab switching while backend is unavailable -> does not trigger memory leak or state update on unmounted component.
- `T2.18.04`: Local storage corrupted or cleared -> UI defaults to unauthenticated/unavailable state safely.
- `T2.18.05`: Error messages rendered in UI are localized in friendly Portuguese and never contain English stack traces.

---

## 7. Tier 3: Cross-Feature Combinations & Pairwise Matrices

Cross-feature tests verify interactions between independent subsystems:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CROSS-FEATURE INTERACTION MATRIX                          │
├──────────────────────┬────────────────────────┬────────────────────────────────────────┤
│ Feature A            │ Feature B              │ Pairwise Interaction Scenario          │
├──────────────────────┼────────────────────────┼────────────────────────────────────────┤
│ Checkout Redirect    │ Webhook Arrival        │ Race between user return & webhook     │
│ Trial Expiration     │ Seat Downgrade         │ Period end triggers read-only + cap    │
│ AI Quota Exhausted   │ User Rate Limit        │ Simultaneous quota & rate exhaustion   │
│ Webhook Replay       │ Out-of-Order Refund    │ Stale chargeback after replay attempt  │
│ Concurrent Invites   │ Seat Limit Enforcement │ 2 Admins invite 1 seat left in org     │
│ Plan Upgrade Webhook │ AI Quota Expansion     │ Webhook increases AI limit immediately │
│ Member Deactivation  │ AI Replay Authorization│ Cached AI draft denied to fired member │
│ Fail-Closed Endpoint │ Credential Restoration │ 503 recovers to 200 on config reload   │
└──────────────────────┴────────────────────────┴────────────────────────────────────────┘
```

### Matrix Scenarios & Invariant Verification:

1. **`T3.01` — Checkout Redirect + Webhook Arrival Race:**
   - *Flow:* User completes checkout and is redirected to `/billing/return` at `T=0`. Webhook arrives at `T+500ms`.
   - *Invariant:* At `T=0`, projection is still `trialing`. At `T+500ms`, webhook settles and updates projection to `active`. UI polling transitions state cleanly without double charging or state corruption.

2. **`T3.02` — Trial Expiration + Seat Downgrade + Member Reactivation:**
   - *Flow:* 14-day trial expires for org with 3 members on `draft-team`. Org transitions to `expired` (accessMode `blocked`). User attempts to reactivate a deactivated member.
   - *Invariant:* Member reactivation is blocked because `accessMode !== 'full'`. Once subscription is renewed via webhook, reactivation succeeds up to plan limit.

3. **`T3.03` — AI Quota Exhaustion + Per-User Rate Limit + Idempotency Replay:**
   - *Flow:* User exhausts personal rate limit (10 req/min), simultaneously hitting monthly AI quota (100 actions). User attempts replay of previously successful draft.
   - *Invariant:* Replay of prior cached draft succeeds because replay does not consume new quota or count against rate limits. New generation request fails with `actions` limit.

4. **`T3.04` — Webhook Replay + Out-of-Order Chargeback + Subscription Renewal:**
   - *Flow:* Webhook delivers `invoice.paid` (v1). Webhook delivers duplicate `invoice.paid` (v1). Webhook delivers `charge.chargeback` (v2). Late-arriving duplicate `invoice.paid` (v1) arrives.
   - *Invariant:* Duplicate v1 is ignored. Chargeback v2 marks subscription as `payment_pending`/`canceled`. Late v1 does not overwrite chargeback. Audit trail logs all events in order.

5. **`T3.05` — Concurrent Multi-Admin Invitation Race under Seat Ceiling:**
   - *Flow:* Org on Team plan has 2 active members (limit 3). Admin 1 invites `user-3`. Admin 2 concurrently invites `user-4`.
   - *Invariant:* Firestore atomic transaction ensures exactly one invitation succeeds (assignedSeats = 3) and the second fails with `seat_limit_reached`.

6. **`T3.06` — Plan Upgrade Webhook + Immediate AI Quota Expansion:**
   - *Flow:* Org on Solo plan (10 AI actions/month) exhausts quota (10/10). Org upgrades to Team plan (100 AI actions/month). Webhook `subscription.updated` arrives.
   - *Invariant:* Server updates plan policy immediately. User generates 11th task draft; service admits request immediately without waiting for billing cycle rollover.

7. **`T3.07` — Member Removal + Idempotent AI Request Replay Defense:**
   - *Flow:* Member A generates a task draft (operationId `op-1`). Member A is deactivated from organization. Member A replays identical request with valid Idempotency-Key.
   - *Invariant:* Replay middleware authenticates token, checks active membership, finds Member A inactive, and rejects with HTTP 403 Forbidden without returning cached draft.

8. **`T3.08` — Fail-Closed Backend + Graceful UI Fallback + Live Credential Recovery:**
   - *Flow:* Backend starts with unconfigured billing secrets -> endpoints return 503, UI displays friendly development banner. Billing secrets are configured -> endpoints transition to 200, UI reflects real commercial status without server restart.

---

## 8. Tier 4: Real-World Workload Scenarios & Multi-Tenant E2E Lifecycles

### Scenario 1: Multi-Tenant Agency Growth & Contraction Lifecycle
- **Tenant:** `agencia-criativa-sp`
- **Step 1 (Trial Onboarding):** Agency signs up, receives 14-day `draft-team` trial (3 seats, 100 AI drafts).
- **Step 2 (Team Expansion):** Admin invites 2 designers. Total active seats: 3/3.
- **Step 3 (Seat Ceiling Hit):** Admin attempts to invite 4th team member (copywriter). System blocks invite with clear upgrade notice.
- **Step 4 (Hosted Checkout):** Admin initiates upgrade to `draft-enterprise` (10 seats).
- **Step 5 (Webhook Activation):** Asaas webhook delivers `checkout.completed` and `subscription.created`. Plan updates to Enterprise.
- **Step 6 (Admit Remaining Team):** Admin successfully invites copywriter and 2 project managers (total 6/10 seats).
- **Step 7 (Scheduled Downgrade):** Agency schedules downgrade to Team plan (3 seats) effective next month.
- **Step 8 (Effective Downgrade Transition):** Next billing period arrives. Plan switches to Team (maxSeats = 3).
- **Step 9 (Over-Capacity Preservation):** All 6 existing members remain active and able to work. New invitations are blocked until active members <= 2.
- **Step 10 (Audit Verification):** Full audit log verifies every state change, seat count, and transaction with immutable SHA-256 hashes.

### Scenario 2: High-Velocity AI Sprint Under Heavy Team Contention
- **Tenant:** `startup-acelerada`
- **Step 1 (Sprint Planning):** 5 product managers simultaneously generate task drafts using Gemini.
- **Step 2 (Concurrency Throttling):** Concurrency limit (2 simultaneous calls) ensures 2 calls proceed, 3 queue or reject cleanly with 429.
- **Step 3 (Token Usage Accounting):** Completed calls settle confirmed token costs in integer microunits in ledger.
- **Step 4 (Partial Metadata Simulation):** 1 call returns partial Gemini metadata -> marked `unknown`, worst-case cost held.
- **Step 5 (Replay Defense):** PM 1 double-clicks submit -> 2nd click replays idempotency key, returns cached draft without double charge.
- **Step 6 (Monthly Cap Depletion):** Team reaches 100/100 AI drafts for the billing period.
- **Step 7 (Graceful UI Degradation):** UI renders friendly "Limite de IA atingido" badge and seamlessly directs users to standard manual task creation.
- **Step 8 (Billing Rollover):** Webhook `invoice.paid` arrives for new month -> AI quota resets to 100, unlocking intelligent draft generation.

### Scenario 3: Chaos & Adversarial Webhook Reconciliation
- **Tenant:** Global Webhook Pipeline
- **Step 1 (Replay Attack):** Malicious actor intercepts valid webhook and replays it 100 times. Inbox deduplicates all 100 without side effects.
- **Step 2 (Tampered Payload):** Malicious actor modifies 1 character of payload -> constant-time HMAC check rejects with 401.
- **Step 3 (Clock Skew Storm):** Attacker sends webhooks with timestamps 10 minutes in the past -> rejected by 300s freshness window.
- **Step 4 (Out-of-Order Stream):** Network delays deliver `payment_failed` after `subscription_canceled`. Monotonic state machine preserves correct terminal status.
- **Step 5 (Compensatory Audit):** Every rejected and reconciled event is written to append-only audit trail with stable SHA-256 payload hash.

### Scenario 4: Multi-Tenant Zero-Authority Client Attack
- **Attacker Tenant:** `org-attacker` (User `uid-evil`)
- **Target Tenant:** `org-victim`
- **Attack 1 (Direct Plan Elevation):** `uid-evil` attempts direct Firestore write to `/organizations/org-victim/subscription` -> Denied by Firestore rules.
- **Attack 2 (Cross-Tenant Projection Snoop):** `uid-evil` requests `GET /api/organizations/org-victim/entitlements` -> Denied with HTTP 403 `organization_forbidden`.
- **Attack 3 (URL Query Param Injection):** `uid-evil` accesses `/billing/return?status=active&plan=enterprise&orgId=org-victim` -> Ignored, no mutation.
- **Attack 4 (AI Token Smuggling):** `uid-evil` calls AI endpoint with injected prompt `{ description: "test", model: "gpt-4", systemPrompt: "override" }` -> Denied with HTTP 400.
- **Attack 5 (Deactivated User Replay):** `uid-evil` is removed from `org-victim` and attempts to replay cached idempotency token -> Denied with HTTP 403.

---

## 9. Test Suite Specifications & Implementation Blueprints

### 9.1 `tests/commercial-billing.test.ts` (Task 5 Test Suite)
- **Target Module:** `src/domain/commercial/billing-types.ts`, `src/server/billing-crypto.ts`, `src/server/billing-fake-provider.ts`, `src/server/billing-inbox.ts`, `src/server/billing-worker.ts`, `src/server/billing-router.ts`.
- **Test Categories:**
  1. HMAC cryptographic generation and constant-time verification.
  2. Timestamp freshness and replay tolerance window.
  3. Raw body preservation before JSON parsing.
  4. Immutable inbox persistence and sensitive data masking (PAN, CVV, tokens).
  5. Deduplication by `provider:eventId`.
  6. Idempotent worker execution and out-of-order event protection.
  7. Fail-closed 503 behavior on unconfigured endpoints.
  8. Checkout redirect state mutation immunity.

### 9.2 `tests/commercial-gates.test.ts` (Task 6 Test Suite)
- **Target Module:** `src/server/commercial-access.ts`, `src/server/commercial-repository.ts`, `src/context/TaskContext.tsx`, `src/components/MembersSettings.tsx`, `src/components/InviteMemberModal.tsx`, `src/components/TaskAICreator.tsx`.
- **Test Categories:**
  1. Server projection endpoint (`GET /api/organizations/:orgId/entitlements`) sanitization and access control.
  2. Seat capacity admission gate (server-side atomic locking + UI gate).
  3. AI quota admission gate (server-side allowance + UI quota display and limit feedback).
  4. Development / unconfigured backend graceful unavailability banner.
  5. Zero client authority (Firestore security rules enforcement).

### 9.3 `tests/commercial-e2e-scenarios.test.ts` (Tiers 3 & 4 E2E Test Suite)
- **Target Module:** Full integrated system (Express, Fake Firestore, Fake Provider, AI Ledger, Repository).
- **Test Categories:**
  1. Cross-feature pairwise interaction test matrices (T3.01 to T3.08).
  2. Real-world multi-tenant agency growth lifecycle (Scenario 1).
  3. High-velocity team AI sprint under contention (Scenario 2).
  4. Chaos webhook reconciliation and adversarial attack defense (Scenario 3).
  5. Zero-authority client penetration and tamper defense (Scenario 4).

---

## 10. Quality Gates & Verification Standards

To achieve full commercial sign-off and milestone completion:
1. **100% Pass Rate:** All test suites (`test:commercial*`, `test:ai*`, `test:gemini-client`, `test:commercial-billing`, `test:commercial-gates`, `test:commercial-e2e`) must pass with 0 failures.
2. **Strict Static Analysis:** `npm run lint` (`oxlint`) and `npx tsc --noEmit` must pass with 0 errors.
3. **Production Build:** `npm run build` must complete cleanly without bundler or TypeScript warnings.
4. **Zero Secret Leakage:** Code review and test verification confirm no API keys, private keys, PANs, CVVs, or Bearer tokens are logged or stored unmasked.
5. **Formal Register of External Dependencies:** Documented in `docs/commercial/03-billing-and-entitlements-plan.md` (Firebase Admin production project, Gemini Paid Tier, Payment Gateway sandbox, Municipal NFS-e rules, Pricing table).
