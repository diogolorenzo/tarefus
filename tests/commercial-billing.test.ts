import assert from 'node:assert/strict';
import express from 'express';
import type { Server } from 'node:http';
import {
  COMMERCIAL_CATALOG_DRAFT,
  createTrialSubscription,
  type SubscriptionSnapshot,
} from '../src/domain/commercial';
import {
  computeHmacSha256,
  computeSha256,
  isTimestampWithinTolerance,
  secureCompareHex,
} from '../src/server/billing-crypto';
import { FakeBillingProvider } from '../src/server/billing-fake-provider';
import {
  FirestoreBillingInboxStore,
  InMemoryBillingInboxStore,
  maskSensitiveData,
} from '../src/server/billing-inbox';
import { BillingWorker } from '../src/server/billing-worker';
import {
  createBillingRouter,
  createBillingWebhookRouter,
} from '../src/server/billing-router';
import {
  FirestoreCommercialRepository,
  commercialPaths,
} from '../src/server/commercial-repository';
import { FakeCommercialFirestore } from './support/fake-commercial-firestore';

interface TestResult {
  name: string;
  category: string;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(category: string, name: string, execute: () => Promise<void> | void): Promise<void> {
  const start = performance.now();
  try {
    await execute();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ category, name, durationMs });
    console.log(`[PASS] [${category}] ${name} (${durationMs}ms)`);
  } catch (error) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ category, name, error: message, durationMs });
    console.error(`[FAIL] [${category}] ${name}: ${message}`);
  }
}

const repoOptions = { serverTimestamp: () => '2026-09-02T12:00:00.000Z' };

console.log('================================================================');
console.log('  TAREFUS COMMERCIAL BILLING & INBOX TEST SUITE (TASK 5)');
console.log('  Provider Abstraction, HMAC Crypto, Inbox, Worker & Webhooks');
console.log('================================================================\n');

// ============================================================================
// 1. CRYPTO & CONSTANT-TIME SIGNATURE VERIFICATION
// ============================================================================

await test('Crypto', 'Valid HMAC SHA-256 signature generated with standard secret passes verification', () => {
  const secret = 'whsec_test_secret_key_12345';
  const payload = JSON.stringify({ event: 'checkout.completed', id: 'evt_123' });
  const signature = computeHmacSha256(payload, secret);

  assert.equal(typeof signature, 'string');
  assert.equal(signature.length, 64);
  assert(secureCompareHex(signature, computeHmacSha256(payload, secret)));
});

await test('Crypto', 'HMAC verification with incorrect secret is strictly rejected', () => {
  const secretA = 'whsec_secret_A';
  const secretB = 'whsec_secret_B';
  const payload = JSON.stringify({ event: 'invoice.paid', id: 'evt_456' });
  const sigA = computeHmacSha256(payload, secretA);
  const sigB = computeHmacSha256(payload, secretB);

  assert.notEqual(sigA, sigB);
  assert.equal(secureCompareHex(sigA, sigB), false);
});

await test('Crypto', 'HMAC verification with payload tampered by 1 single bit is strictly rejected', () => {
  const secret = 'whsec_super_secret';
  const originalPayload = JSON.stringify({ amountCents: 4900, currency: 'BRL' });
  const signature = computeHmacSha256(originalPayload, secret);

  // Alter 1 character
  const tamperedPayload = JSON.stringify({ amountCents: 4901, currency: 'BRL' });
  const tamperedSignature = computeHmacSha256(tamperedPayload, secret);

  assert.equal(secureCompareHex(signature, tamperedSignature), false);
});

await test('Crypto', 'Constant-time secureCompareHex handles mismatched lengths and invalid hex safely without exceptions', () => {
  assert.equal(secureCompareHex('', ''), false);
  assert.equal(secureCompareHex('abcdef', 'abcde'), false);
  assert.equal(secureCompareHex('not-a-hex-string!!', 'not-a-hex-string!!'), false);
  assert.equal(secureCompareHex(null as unknown as string, 'abc'), false);
  assert.equal(secureCompareHex('abc', undefined as unknown as string), false);
});

await test('Crypto', 'Timestamp tolerance checks: within 300s window is accepted, >300s rejected', () => {
  const nowMs = 1_700_000_000_000;

  // Exact now
  assert.equal(isTimestampWithinTolerance(nowMs, 300_000, nowMs), true);

  // 60 seconds in the past
  assert.equal(isTimestampWithinTolerance(nowMs - 60_000, 300_000, nowMs), true);

  // 299 seconds in the past
  assert.equal(isTimestampWithinTolerance(nowMs - 299_000, 300_000, nowMs), true);

  // 30 seconds in the future
  assert.equal(isTimestampWithinTolerance(nowMs + 30_000, 300_000, nowMs), true);

  // 301 seconds in the past (> 5 minutes) -> rejected
  assert.equal(isTimestampWithinTolerance(nowMs - 301_000, 300_000, nowMs), false);

  // 1 hour in the past -> rejected
  assert.equal(isTimestampWithinTolerance(nowMs - 3600_000, 300_000, nowMs), false);

  // 301 seconds in the future -> rejected
  assert.equal(isTimestampWithinTolerance(nowMs + 301_000, 300_000, nowMs), false);

  // ISO 8601 string parsing
  const isoRecent = new Date(nowMs - 50_000).toISOString();
  assert.equal(isTimestampWithinTolerance(isoRecent, 300_000, nowMs), true);

  const isoExpired = new Date(nowMs - 500_000).toISOString();
  assert.equal(isTimestampWithinTolerance(isoExpired, 300_000, nowMs), false);

  // Invalid date string
  assert.equal(isTimestampWithinTolerance('invalid-date-format', 300_000, nowMs), false);
});

// ============================================================================
// 2. FAKE BILLING PROVIDER ADAPTER CONTRACTS
// ============================================================================

await test('FakeProvider', 'createCustomer generates valid normalized customer record in memory', async () => {
  const provider = new FakeBillingProvider();
  const customer = await provider.createCustomer({
    organizationId: 'org-test-cust',
    email: 'financeiro@empresa.com.br',
    name: 'Empresa Teste LTDA',
    documentNumber: '12.345.678/0001-90',
  });

  assert(customer.providerCustomerId.startsWith('cust_fake_'));
  assert.equal(customer.organizationId, 'org-test-cust');
  assert.equal(customer.email, 'financeiro@empresa.com.br');
  assert.equal(customer.name, 'Empresa Teste LTDA');
  assert.equal(customer.documentNumber, '12.345.678/0001-90');
});

await test('FakeProvider', 'createCheckoutSession generates hosted checkout URL and open session', async () => {
  const provider = new FakeBillingProvider();
  const session = await provider.createCheckoutSession({
    organizationId: 'org-test-checkout',
    planId: 'draft-team',
    returnUrl: 'https://tarefus.local/billing/return',
  });

  assert(session.sessionId.startsWith('sess_fake_'));
  assert(session.providerSessionId.startsWith('psess_fake_'));
  assert.equal(session.organizationId, 'org-test-checkout');
  assert.equal(session.planId, 'draft-team');
  assert(session.checkoutUrl.includes('https://fake-billing.local/checkout/'));
  assert.equal(session.status, 'open');
});

await test('FakeProvider', 'verifyWebhookSignature accepts valid signature headers and rejects altered payloads', () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_provider_signing_secret';
  const rawBody = JSON.stringify({ type: 'invoice.paid', id: 'evt_inv_999' });

  // 1. Header-pair style (x-webhook-signature + x-webhook-timestamp)
  const signed = provider.signWebhookPayload(rawBody, secret);
  const verifyResult = provider.verifyWebhookSignature({
    rawBody,
    headers: signed.headers,
    secret,
  });
  assert.equal(verifyResult.valid, true);

  // 2. Stripe style (t=...,v1=...)
  const stripeSigned = provider.signWebhookPayload(rawBody, secret, { headerStyle: 'stripe-style' });
  const stripeVerify = provider.verifyWebhookSignature({
    rawBody,
    headers: stripeSigned.headers,
    secret,
  });
  assert.equal(stripeVerify.valid, true);

  // 3. Altered body with same signature -> invalid_signature
  const alteredBody = JSON.stringify({ type: 'invoice.paid', id: 'evt_inv_1000' });
  const failVerify = provider.verifyWebhookSignature({
    rawBody: alteredBody,
    headers: signed.headers,
    secret,
  });
  assert.equal(failVerify.valid, false);
  assert.equal(failVerify.reason, 'invalid_signature');

  // 4. Missing headers -> missing_headers
  const missingHeadersVerify = provider.verifyWebhookSignature({
    rawBody,
    headers: {},
    secret,
  });
  assert.equal(missingHeadersVerify.valid, false);
  assert.equal(missingHeadersVerify.reason, 'missing_headers');
});

await test('FakeProvider', 'parseWebhookEvent extracts normalized event structure with SHA-256 hash', () => {
  const provider = new FakeBillingProvider();
  const mockCard = provider.createMockCardPayload('org-card-sub', 4900);
  const rawBody = JSON.stringify(mockCard);

  const event = provider.parseWebhookEvent(rawBody);
  assert.equal(event.provider, 'fake_provider');
  assert.equal(event.organizationId, 'org-card-sub');
  assert.equal(event.eventType, 'subscription.created');
  assert(event.payloadHash.startsWith('sha256:'));
  assert.equal(event.payloadHash, computeSha256(rawBody));
});

// ============================================================================
// 3. RAW EVENT INBOX & SENSITIVE DATA MASKING
// ============================================================================

await test('Inbox', 'maskSensitiveData masks PAN, CVV, passwords, and tokens while preserving general data', () => {
  const payload = {
    organizationId: 'org-123',
    customer: {
      name: 'Joï¿½o Silva',
      email: 'joao@example.com',
      cardNumber: '4111111111111234',
      cvv: '999',
      securityCode: '123',
      pan: '5500000000005678',
    },
    auth: {
      webhookSecret: 'top-secret-key',
      api_key: 'sk_live_12345',
      password: 'myPassword123',
      token: 'jwt.token.here',
    },
    amountCents: 9900,
    currency: 'BRL',
  };

  const masked = maskSensitiveData(payload) as any;

  // Preserved
  assert.equal(masked.organizationId, 'org-123');
  assert.equal(masked.customer.name, 'Joï¿½o Silva');
  assert.equal(masked.customer.email, 'joao@example.com');
  assert.equal(masked.amountCents, 9900);
  assert.equal(masked.currency, 'BRL');

  // Masked
  assert.equal(masked.customer.cardNumber, '**** **** **** 1234');
  assert.equal(masked.customer.cvv, '[REDACTED]');
  assert.equal(masked.customer.securityCode, '[REDACTED]');
  assert.equal(masked.customer.pan, '**** **** **** 5678');
  assert.equal(masked.auth.webhookSecret, '[REDACTED]');
  assert.equal(masked.auth.api_key, '[REDACTED]');
  assert.equal(masked.auth.password, '[REDACTED]');
  assert.equal(masked.auth.token, '[REDACTED]');
});

await test('Inbox', 'InMemoryBillingInboxStore records event, computes hash and identifies duplicates idempotently', async () => {
  const inbox = new InMemoryBillingInboxStore();
  const rawBody = JSON.stringify({
    id: 'evt_inbox_01',
    type: 'invoice.paid',
    organizationId: 'org-inbox-test',
    cardNumber: '4111222233334444',
  });

  // 1. First reception: records event with status 'received'
  const first = await inbox.recordEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_inbox_01',
    eventType: 'invoice.paid',
    organizationId: 'org-inbox-test',
    occurredAt: '2026-09-02T12:00:00.000Z',
    rawBody,
    correlationId: 'corr-inbox-1',
  });

  assert.equal(first.isDuplicate, false);
  assert.equal(first.record.inboxKey, 'fake_provider:evt_inbox_01');
  assert.equal(first.record.processingState, 'received');
  assert(first.record.payloadHash.startsWith('sha256:'));
  assert.equal(first.record.maskedPayload.cardNumber, '**** **** **** 4444');

  // 2. Second reception with same provider + eventId: returns isDuplicate = true
  const second = await inbox.recordEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_inbox_01',
    eventType: 'invoice.paid',
    organizationId: 'org-inbox-test',
    occurredAt: '2026-09-02T12:00:00.000Z',
    rawBody,
    correlationId: 'corr-inbox-2',
  });

  assert.equal(second.isDuplicate, true);
  assert.equal(second.record.inboxKey, first.record.inboxKey);
});

await test('Inbox', 'FirestoreBillingInboxStore operates with snapshot isolation in Firestore', async () => {
  const firestore = new FakeCommercialFirestore();
  const inbox = new FirestoreBillingInboxStore(firestore);
  const rawBody = JSON.stringify({
    id: 'evt_fs_01',
    type: 'checkout.completed',
    organizationId: 'org-fs-test',
  });

  const first = await inbox.recordEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_fs_01',
    eventType: 'checkout.completed',
    organizationId: 'org-fs-test',
    occurredAt: '2026-09-02T12:00:00.000Z',
    rawBody,
    correlationId: 'corr-fs-1',
  });
  assert.equal(first.isDuplicate, false);

  const second = await inbox.recordEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_fs_01',
    eventType: 'checkout.completed',
    organizationId: 'org-fs-test',
    occurredAt: '2026-09-02T12:00:00.000Z',
    rawBody,
    correlationId: 'corr-fs-2',
  });
  assert.equal(second.isDuplicate, true);

  const updated = await inbox.updateProcessingState('fake_provider:evt_fs_01', 'processed');
  assert.equal(updated.processingState, 'processed');

  const retrieved = await inbox.getEvent('fake_provider:evt_fs_01');
  assert.equal(retrieved?.processingState, 'processed');
});

// ============================================================================
// 4. IDEMPOTENT WORKER & OUT-OF-ORDER DEFENSE
// ============================================================================

await test('Worker', 'checkout.completed transitions trial subscription to active and unlocks entitlements', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-worker-activate';

  // 1. Setup organization in repository on 14-day trial
  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Ativada',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'setup-01',
  });

  const trialSub = createTrialSubscription({
    subscriptionId: `sub_${orgId}`,
    workspaceId: orgId,
    planId: 'draft-team',
    startedAt: '2026-09-01T00:00:00.000Z',
  });
  await repo.writeSubscription({
    organizationId: orgId,
    subscription: trialSub,
    actorUid: 'uid-admin',
    correlationId: 'setup-02',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
    now: () => '2026-09-02T12:00:00.000Z',
  });

  // 2. Incoming webhook: checkout.completed
  const event = {
    provider: 'fake_provider' as const,
    providerEventId: 'evt_checkout_success_01',
    eventType: 'checkout.completed' as const,
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-02T12:00:00.000Z',
    payloadHash: 'sha256:fakehash123',
    data: {
      subscription: {
        providerSubscriptionId: `sub_${orgId}`,
        organizationId: orgId,
        planId: 'draft-team',
        status: 'active' as const,
        currentPeriodStartAt: '2026-09-02T12:00:00.000Z',
        currentPeriodEndAt: '2026-10-02T12:00:00.000Z',
        cancelAtPeriodEnd: false,
      },
    },
  };

  const res = await worker.processEvent(event);
  assert.equal(res.status, 'processed');

  // Verify subscription is now active
  const subAfter = (await repo.readSubscription(orgId)) as any;
  assert.equal(subAfter.state, 'active');
  assert.equal(subAfter.currentPeriodEndsAt, '2026-10-02T12:00:00.000Z');

  // Verify entitlement projection is full
  const entAfter = (await repo.readEntitlements(orgId)) as any;
  assert.equal(entAfter.accessMode, 'full');
  assert.equal(entAfter.seats.canAssignSeat, true);

  // Verify audit event written
  const auditDocs = firestore.list(commercialPaths.auditEvents(orgId));
  const webhookAudit = auditDocs.find((d) => d.data.type === 'billing.webhook_processed');
  assert(webhookAudit !== undefined);
  assert.equal(webhookAudit.data.payload.subscriptionState, 'active');
});

await test('Worker', 'Duplicate event delivery returns status: duplicate without mutating domain state twice', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-worker-dup';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Dup',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'dup-01',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
  });

  const event = {
    provider: 'fake_provider' as const,
    providerEventId: 'evt_dup_999',
    eventType: 'invoice.paid' as const,
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-02T12:00:00.000Z',
    payloadHash: 'sha256:fakehash999',
    data: {
      invoice: {
        providerInvoiceId: 'inv_999',
        organizationId: orgId,
        amountCents: 4900,
        currency: 'BRL' as const,
        status: 'paid' as const,
        dueAt: '2026-09-02T12:00:00.000Z',
        paidAt: '2026-09-02T12:00:00.000Z',
        paymentMethod: 'pix' as const,
      },
    },
  };

  // First process
  const firstRes = await worker.processEvent(event);
  assert.equal(firstRes.status, 'processed');

  const auditCountFirst = firestore.list(commercialPaths.auditEvents(orgId)).length;

  // Second process of same event
  const secondRes = await worker.processEvent(event);
  assert.equal(secondRes.status, 'duplicate');

  // Verify no extra audit events written on duplicate
  const auditCountSecond = firestore.list(commercialPaths.auditEvents(orgId)).length;
  assert.equal(auditCountSecond, auditCountFirst);
});

await test('Worker', 'Out-of-order defense: stale event arriving after cancellation does not regress state', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-out-of-order';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Ordem',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'order-01',
  });

  // Subscription was canceled at T = 2026-09-10T12:00:00Z
  const canceledSub: SubscriptionSnapshot = {
    subscriptionId: `sub_${orgId}`,
    workspaceId: orgId,
    planId: 'draft-team',
    state: 'canceled',
    startedAt: '2026-09-01T00:00:00.000Z',
    currentPeriodEndsAt: '2026-10-01T00:00:00.000Z',
    canceledAt: '2026-09-10T12:00:00.000Z',
  };
  await repo.writeSubscription({
    organizationId: orgId,
    subscription: canceledSub,
    actorUid: 'uid-admin',
    correlationId: 'order-02',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
  });

  // Delayed / out-of-order event from past: subscription.created with occurredAt = 2026-09-05T00:00:00Z (before cancel)
  const staleEvent = {
    provider: 'fake_provider' as const,
    providerEventId: 'evt_delayed_created_01',
    eventType: 'subscription.created' as const,
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-05T00:00:00.000Z',
    payloadHash: 'sha256:stalehash',
    data: {},
  };

  const res = await worker.processEvent(staleEvent);
  assert.equal(res.status, 'ignored');
  assert.equal(res.reason, 'stale_event_ignored');

  // Verify subscription is STILL canceled
  const subCurrent = (await repo.readSubscription(orgId)) as any;
  assert.equal(subCurrent.state, 'canceled');
  assert.equal(subCurrent.canceledAt, '2026-09-10T12:00:00.000Z');

  // Verify compensatory audit event written
  const auditDocs = firestore.list(commercialPaths.auditEvents(orgId));
  const compAudit = auditDocs.find((d) => d.data.type === 'billing.compensatory_event');
  assert(compAudit !== undefined);
  assert.equal(compAudit.data.payload.reason, 'stale_event_ignored_after_cancellation');
});

// ============================================================================
// 5. INERT FAIL-CLOSED BILLING ENDPOINTS & RAW BODY PRESERVATION
// ============================================================================

await test('Router', 'Webhook endpoint fails closed with HTTP 503 when webhook secret is unconfigured', async () => {
  const app = express();
  app.use(express.json());

  // Mount with NO secret configured
  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      provider: new FakeBillingProvider(),
      webhookSecret: undefined, // Unconfigured
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.completed' }),
    });

    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.error, 'billing_provider_unavailable');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Router', 'Checkout session endpoint fails closed with HTTP 503 when provider is unconfigured', async () => {
  const app = express();
  app.use(express.json());

  // Mount with NO provider
  app.use(
    '/api/billing',
    createBillingRouter({
      provider: undefined,
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/billing/checkout-sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ organizationId: 'org-test', planId: 'draft-team' }),
    });

    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.error, 'billing_provider_unavailable');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Router', 'Checkout redirect /api/billing/return is purely informational and NEVER mutates state', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/billing', createBillingRouter());

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    // GET return with forged params
    const getRes = await fetch(`http://127.0.0.1:${port}/api/billing/return?orgId=org-victim&status=active&entitlement=full&plan=enterprise`);
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.status, 'pending_confirmation');
    assert.equal(getBody.organizationId, 'org-victim');

    // POST return
    const postRes = await fetch(`http://127.0.0.1:${port}/api/billing/return`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orgId: 'org-victim', status: 'paid' }),
    });
    assert.equal(postRes.status, 200);
    const postBody = await postRes.json();
    assert.equal(postBody.status, 'pending_confirmation');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Router', 'End-to-End Express Webhook dispatch with rawBody preservation, HMAC verification and Inbox settlement', async () => {
  const secret = 'whsec_e2e_express_secret_xyz';
  const provider = new FakeBillingProvider();
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-express-e2e';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Express E2E',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'e2e-setup',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
  });

  const app = express();
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      provider,
      webhookSecret: secret,
      inboxStore: inbox,
      worker,
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    const cardPayload = provider.createMockCardPayload(orgId, 4900);
    const rawBody = JSON.stringify(cardPayload);
    const signed = provider.signWebhookPayload(rawBody, secret);

    // 1. Send valid webhook
    const validRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...signed.headers,
      },
      body: rawBody,
    });

    assert.equal(validRes.status, 200);
    const validJson = await validRes.json();
    assert.equal(validJson.success, true);
    assert.equal(validJson.status, 'processed');

    // Verify subscription activated in database
    const sub = (await repo.readSubscription(orgId)) as any;
    assert.equal(sub.state, 'active');

    // 2. Replay same webhook -> returns duplicate 200 OK
    const replayRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...signed.headers,
      },
      body: rawBody,
    });

    assert.equal(replayRes.status, 200);
    const replayJson = await replayRes.json();
    assert.equal(replayJson.status, 'duplicate');

    // 3. Send tampered webhook -> returns 401 Unauthorized
    const tamperedPayload = JSON.stringify({ ...cardPayload, amountCents: 99999 });
    const tamperedRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...signed.headers, // signature computed for original rawBody, not tampered!
      },
      body: tamperedPayload,
    });

    assert.equal(tamperedRes.status, 401);
    const tamperedJson = await tamperedRes.json();
    assert.equal(tamperedJson.error, 'invalid_signature');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================

console.log('\n================================================================');
console.log('  COMMERCIAL BILLING TEST SUMMARY');
console.log('================================================================');

const total = results.length;
const passed = results.filter((r) => !r.error).length;
const failed = results.filter((r) => r.error).length;

console.log(`Total Billing Tests Run: ${total}`);
console.log(`Passed:                  ${passed} / ${total}`);
console.log(`Failed:                  ${failed} / ${total}`);

if (failed > 0) {
  console.error('\nFAILED TESTS:');
  results
    .filter((r) => r.error)
    .forEach((r) => {
      console.error(` - [${r.category}] ${r.name}: ${r.error}`);
    });
  process.exit(1);
} else {
  console.log('\nALL COMMERCIAL BILLING & INBOX TESTS PASSED.');
  // clean exit
}

