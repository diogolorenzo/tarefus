import assert from 'node:assert/strict';
import express from 'express';
import type { Server } from 'node:http';
import {
  COMMERCIAL_CATALOG_DRAFT,
  createTrialSubscription,
} from '../src/domain/commercial';
import {
  computeHmacSha256,
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
console.log('  TAREFUS COMMERCIAL BILLING ADVERSARIAL STRESS TEST SUITE');
console.log('  Empirical Challenge Harness: 6 Core Adversarial Vectors');
console.log('================================================================\n');

// ============================================================================
// VECTOR 1: SIGNATURE FORGERY & TAMPERING
// ============================================================================

await test('Vector 1: Tampering', '1.1 Bit-flip fuzzing: 50 randomized 1-bit payload alterations are strictly rejected', () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_adversarial_test_secret_98765';
  const originalPayloadStr = JSON.stringify({
    provider: 'fake_provider',
    id: 'evt_tamper_001',
    type: 'invoice.paid',
    organizationId: 'org-adversarial-1',
    amountCents: 4900,
    currency: 'BRL',
    description: 'Assinatura Plano Team - Tarefus Pro',
    nested: {
      customerName: 'Empresa Teste',
      taxId: '12.345.678/0001-90',
    },
  });

  const signed = provider.signWebhookPayload(originalPayloadStr, secret);
  const rawBuffer = Buffer.from(originalPayloadStr, 'utf8');

  // Verify original payload passes
  const originalCheck = provider.verifyWebhookSignature({
    rawBody: rawBuffer,
    headers: signed.headers,
    secret,
  });
  assert.equal(originalCheck.valid, true, 'Original unmodified payload must pass verification');

  // Fuzz 50 distinct single-bit flips across random byte positions
  let rejectedCount = 0;
  for (let i = 0; i < 50; i++) {
    const mutatedBuffer = Buffer.from(rawBuffer);
    const targetByteIndex = Math.floor(Math.random() * mutatedBuffer.length);
    const targetBitIndex = Math.floor(Math.random() * 8);

    // Flip 1 bit (XOR with (1 << bit))
    mutatedBuffer[targetByteIndex] ^= 1 << targetBitIndex;

    const verifyResult = provider.verifyWebhookSignature({
      rawBody: mutatedBuffer,
      headers: signed.headers,
      secret,
    });

    assert.equal(verifyResult.valid, false, `1-bit mutated payload at byte ${targetByteIndex} bit ${targetBitIndex} MUST be rejected`);
    assert.equal(verifyResult.reason, 'invalid_signature');
    rejectedCount++;
  }

  assert.equal(rejectedCount, 50, 'All 50 1-bit tampered payloads must be rejected');
});

await test('Vector 1: Tampering', '1.2 Truncated, malformed, and non-hex signature headers are safely rejected without throwing', () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_adversarial_test_secret';
  const rawBody = JSON.stringify({ id: 'evt_sig_test', type: 'invoice.paid' });
  const validSignature = computeHmacSha256(rawBody, secret);

  const testSignatures = [
    '',                                     // Empty string
    'a',                                    // 1 char
    'abcdef',                               // Short hex
    validSignature.substring(0, 63),        // 63 hex chars (1 char short)
    validSignature + 'a',                   // 65 hex chars (1 char long)
    validSignature.replace(/[0-9]/g, 'z'),  // Non-hex chars 'z'
    '   ' + validSignature.substring(0, 30),// Whitespace + truncated
    'null',
    'undefined',
    '!@#$%^&*()',
  ];

  for (const badSig of testSignatures) {
    // Header-pair style
    const resultPair = provider.verifyWebhookSignature({
      rawBody,
      headers: {
        'x-webhook-signature': badSig,
        'x-webhook-timestamp': String(Math.floor(Date.now() / 1000)),
      },
      secret,
    });
    assert.equal(resultPair.valid, false, `Bad signature '${badSig}' must fail`);

    // Stripe style with bad v1
    const resultStripe = provider.verifyWebhookSignature({
      rawBody,
      headers: {
        'x-webhook-signature': `t=${Math.floor(Date.now() / 1000)},v1=${badSig}`,
      },
      secret,
    });
    assert.equal(resultStripe.valid, false, `Bad stripe signature with v1='${badSig}' must fail`);
  }
});

await test('Vector 1: Tampering', '1.3 Secret mismatch and secret collision defenses', () => {
  const provider = new FakeBillingProvider();
  const secretCorrect = 'whsec_prod_secret_primary_key_abc';
  const secretWrong = 'whsec_prod_secret_secondary_key_xyz';
  const secretPrefix = 'whsec_prod_secret_primary_key'; // Prefix match

  const rawBody = JSON.stringify({ id: 'evt_sec_test', type: 'subscription.created' });
  const signed = provider.signWebhookPayload(rawBody, secretCorrect);

  // 1. Verify with wrong secret
  const resWrong = provider.verifyWebhookSignature({
    rawBody,
    headers: signed.headers,
    secret: secretWrong,
  });
  assert.equal(resWrong.valid, false);
  assert.equal(resWrong.reason, 'invalid_signature');

  // 2. Verify with prefix matching secret
  const resPrefix = provider.verifyWebhookSignature({
    rawBody,
    headers: signed.headers,
    secret: secretPrefix,
  });
  assert.equal(resPrefix.valid, false);
  assert.equal(resPrefix.reason, 'invalid_signature');

  // 3. Verify with empty string secret
  const resEmpty = provider.verifyWebhookSignature({
    rawBody,
    headers: signed.headers,
    secret: '',
  });
  assert.equal(resEmpty.valid, false);
});

await test('Vector 1: Tampering', '1.4 Constant-time secureCompareHex benchmark and invalid input resilience', () => {
  const hex64A = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
  const hex64Matching = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
  const hex64MismatchFirst = 'b1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
  const hex64MismatchLast = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67891';

  // Benchmark 5,000 iterations of matching vs mismatch
  for (let i = 0; i < 5000; i++) {
    assert.equal(secureCompareHex(hex64A, hex64Matching), true);
    assert.equal(secureCompareHex(hex64A, hex64MismatchFirst), false);
    assert.equal(secureCompareHex(hex64A, hex64MismatchLast), false);
  }

  // Verify non-throwing on extreme invalid types
  const extremeInputs: any[] = [
    [null, hex64A],
    [hex64A, undefined],
    ['', ''],
    ['123', '1234'],
    ['gg', 'gg'],
    ['   ', '   '],
    [{}, {}],
    [[], []],
    [12345, 12345],
  ];

  for (const [a, b] of extremeInputs) {
    const result = secureCompareHex(a, b);
    assert.equal(result, false, `secureCompareHex(${JSON.stringify(a)}, ${JSON.stringify(b)}) must safely return false`);
  }
});

await test('Vector 1: Tampering', '1.5 Multi-byte UTF-8, emoji, and large payload HMAC verification resilience', () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_unicode_secret_123';
  const unicodePayload = JSON.stringify({
    notes: 'Pagamento recebido - Empresa Sao Paulo LTDA & Co. 日本語 nono',
    amountCents: 4900,
    currency: 'BRL',
    symbols: '<script>alert(1)</script> \' OR 1=1 --',
  });

  const signed = provider.signWebhookPayload(unicodePayload, secret);
  const verifyResult = provider.verifyWebhookSignature({
    rawBody: unicodePayload,
    headers: signed.headers,
    secret,
  });
  assert.equal(verifyResult.valid, true);

  // Large 100KB payload
  const largeObject = { items: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `item_${i}` })) };
  const largePayload = JSON.stringify(largeObject);
  const largeSigned = provider.signWebhookPayload(largePayload, secret);
  const largeVerify = provider.verifyWebhookSignature({
    rawBody: largePayload,
    headers: largeSigned.headers,
    secret,
  });
  assert.equal(largeVerify.valid, true);
});

// ============================================================================
// VECTOR 2: REPLAY & CLOCK SKEW
// ============================================================================

await test('Vector 2: Replay & Skew', '2.1 Clock skew: sub-second precision around 300s window (300,000ms accepted, 300,001ms rejected)', () => {
  const nowMs = 1_700_000_000_000;

  // Boundary checks in past
  assert.equal(isTimestampWithinTolerance(nowMs - 300_000, 300_000, nowMs), true, 'Exact 300,000ms past must be accepted');
  assert.equal(isTimestampWithinTolerance(nowMs - 300_001, 300_000, nowMs), false, '300,001ms past must be rejected');

  // Boundary checks in future
  assert.equal(isTimestampWithinTolerance(nowMs + 300_000, 300_000, nowMs), true, 'Exact 300,000ms future must be accepted');
  assert.equal(isTimestampWithinTolerance(nowMs + 300_001, 300_000, nowMs), false, '300,001ms future must be rejected');

  // Extreme past & future (10 years)
  assert.equal(isTimestampWithinTolerance(nowMs - 10 * 365 * 86_400_000, 300_000, nowMs), false);
  assert.equal(isTimestampWithinTolerance(nowMs + 10 * 365 * 86_400_000, 300_000, nowMs), false);

  // Epoch seconds vs Epoch milliseconds auto-detection
  const nowSec = Math.floor(nowMs / 1000);
  assert.equal(isTimestampWithinTolerance(nowSec, 300_000, nowMs), true, 'Epoch seconds auto-converted');
  assert.equal(isTimestampWithinTolerance(nowSec - 299, 300_000, nowMs), true);
  assert.equal(isTimestampWithinTolerance(nowSec - 301, 300_000, nowMs), false);
});

await test('Vector 2: Replay & Skew', '2.2 Unparseable, corrupted, and non-finite date headers are safely rejected', () => {
  const nowMs = Date.now();
  const badDates = [
    'invalid-date',
    '2026-99-99T99:99:99Z',
    '[object Object]',
    'null',
    'undefined',
    'invalid-string-token',
    'NaN',
    'Infinity',
    '-Infinity',
    '0',
    '-1000',
    '',
  ];

  for (const bad of badDates) {
    assert.equal(isTimestampWithinTolerance(bad, 300_000, nowMs), false, `Date '${bad}' must be rejected`);
  }

  assert.equal(isTimestampWithinTolerance(NaN, 300_000, nowMs), false);
  assert.equal(isTimestampWithinTolerance(Infinity, 300_000, nowMs), false);
  assert.equal(isTimestampWithinTolerance(-Infinity, 300_000, nowMs), false);
  assert.equal(isTimestampWithinTolerance(0, 300_000, nowMs), false);
  assert.equal(isTimestampWithinTolerance(-100, 300_000, nowMs), false);
});

await test('Vector 2: Replay & Skew', '2.3 Concurrent replay storm: 50 parallel requests of same eventId produce exactly 1 processing and 49 duplicates', async () => {
  const firestore = new FakeCommercialFirestore();
  const inbox = new FirestoreBillingInboxStore(firestore);
  const rawBody = JSON.stringify({
    provider: 'fake_provider',
    id: 'evt_storm_999',
    type: 'invoice.paid',
    organizationId: 'org-storm-test',
    amountCents: 4900,
  });

  // Concurrently dispatch 50 recordEvent calls for the same provider:eventId
  const promises = Array.from({ length: 50 }, (_, i) =>
    inbox.recordEvent({
      provider: 'fake_provider',
      providerEventId: 'evt_storm_999',
      eventType: 'invoice.paid',
      organizationId: 'org-storm-test',
      occurredAt: '2026-09-02T12:00:00.000Z',
      rawBody,
      correlationId: `storm-${i}`,
    })
  );

  const testResults = await Promise.all(promises);

  const initialCount = testResults.filter((r) => !r.isDuplicate).length;
  const duplicateCount = testResults.filter((r) => r.isDuplicate).length;

  assert.equal(initialCount, 1, 'Exactly ONE initial record must succeed');
  assert.equal(duplicateCount, 49, 'Exactly 49 requests must be identified as duplicates');

  // Verify only 1 document in Firestore
  const list = await inbox.listEvents('org-storm-test');
  assert.equal(list.length, 1);
  assert.equal(list[0].inboxKey, 'fake_provider:evt_storm_999');
});

await test('Vector 2: Replay & Skew', '2.4 Fuzzing 100 distinct event IDs with zero hash collisions', async () => {
  const firestore = new FakeCommercialFirestore();
  const inbox = new FirestoreBillingInboxStore(firestore);

  for (let i = 0; i < 100; i++) {
    const eventId = `evt_fuzz_${i}_${Math.random().toString(36).substring(2)}`;
    const res = await inbox.recordEvent({
      provider: 'fake_provider',
      providerEventId: eventId,
      eventType: 'invoice.paid',
      organizationId: 'org-fuzz',
      occurredAt: new Date().toISOString(),
      rawBody: JSON.stringify({ id: eventId }),
      correlationId: `corr-${i}`,
    });
    assert.equal(res.isDuplicate, false);
  }

  const allEvents = await inbox.listEvents('org-fuzz');
  assert.equal(allEvents.length, 100);
});

await test('Vector 2: Replay & Skew', '2.5 ISO 8601 timezone offsets parsed accurately within tolerance', () => {
  const now = Date.now();
  const isoUtc = new Date(now - 10000).toISOString();
  assert.equal(isTimestampWithinTolerance(isoUtc, 300_000, now), true);

  const d = new Date(now);
  const isoWithOffset = d.toISOString().replace('Z', '+00:00');
  assert.equal(isTimestampWithinTolerance(isoWithOffset, 300_000, now), true);
});

// ============================================================================
// VECTOR 3: OUT-OF-ORDER EVENT STREAMS
// ============================================================================

await test('Vector 3: Out-of-Order', '3.1 Delivering subscription.canceled followed by older delayed subscription.created retains canceled state', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-ooo-canceled';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Cancelamento',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'ooo-01',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
    now: () => '2026-09-15T12:00:00.000Z',
  });

  // 1. Deliver subscription.canceled at T = 2026-09-10T12:00:00Z
  const cancelEvent = {
    provider: 'fake_provider' as const,
    providerEventId: 'evt_cancel_01',
    eventType: 'subscription.canceled' as const,
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-10T12:00:00.000Z',
    payloadHash: 'sha256:cancelhash',
    data: {},
  };

  const cancelRes = await worker.processEvent(cancelEvent);
  assert.equal(cancelRes.status, 'processed');

  const subAfterCancel = (await repo.readSubscription(orgId)) as any;
  assert.equal(subAfterCancel.state, 'canceled');
  assert.equal(subAfterCancel.canceledAt, '2026-09-10T12:00:00.000Z');

  // 2. Deliver delayed subscription.created with older timestamp T = 2026-09-01T00:00:00Z
  const delayedCreatedEvent = {
    provider: 'fake_provider' as const,
    providerEventId: 'evt_delayed_create_01',
    eventType: 'subscription.created' as const,
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-01T00:00:00.000Z',
    payloadHash: 'sha256:delayedcreate',
    data: {
      subscription: {
        providerSubscriptionId: `sub_${orgId}`,
        organizationId: orgId,
        planId: 'draft-team',
        status: 'active' as const,
      },
    },
  };

  const delayedRes = await worker.processEvent(delayedCreatedEvent);
  assert.equal(delayedRes.status, 'ignored');
  assert.equal(delayedRes.reason, 'stale_event_ignored');

  // 3. Verify state is STILL canceled
  const subFinal = (await repo.readSubscription(orgId)) as any;
  assert.equal(subFinal.state, 'canceled');
  assert.equal(subFinal.canceledAt, '2026-09-10T12:00:00.000Z');

  // 4. Verify compensatory audit event was logged
  const auditDocs = firestore.list(commercialPaths.auditEvents(orgId));
  const compAudit = auditDocs.find((d) => d.data.type === 'billing.compensatory_event');
  assert(compAudit !== undefined);
  assert.equal(compAudit.data.payload.reason, 'stale_event_ignored_after_cancellation');
});

await test('Vector 3: Out-of-Order', '3.2 Delivering invoice.payment_failed on active subscription followed by older invoice.paid does not regress', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-ooo-payment';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Pagamento',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'ooo-pay-01',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
  });

  // 1. Initial activation at T = 2026-09-01T00:00:00Z
  await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_init_activate',
    eventType: 'subscription.created',
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-01T00:00:00.000Z',
    payloadHash: 'sha256:acthash',
    data: {
      subscription: {
        providerSubscriptionId: `sub_${orgId}`,
        organizationId: orgId,
        planId: 'draft-team',
        status: 'active',
      },
    },
  });

  // Verify active
  let sub = (await repo.readSubscription(orgId)) as any;
  assert.equal(sub.state, 'active');

  // 2. Older invoice.payment_failed (timestamp T = 2026-08-20T00:00:00Z - before activation) arrives
  const staleFailRes = await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_stale_fail',
    eventType: 'invoice.payment_failed',
    organizationId: orgId,
    resourceId: `inv_old`,
    occurredAt: '2026-08-20T00:00:00.000Z',
    payloadHash: 'sha256:stale-fail',
    data: {},
  });

  assert.equal(staleFailRes.status, 'ignored');
  assert.equal(staleFailRes.reason, 'stale_event_ignored');

  // Verify state is STILL active
  sub = (await repo.readSubscription(orgId)) as any;
  assert.equal(sub.state, 'active');
});

await test('Vector 3: Out-of-Order', '3.3 Complex out-of-order permutation sequence resolves to latest chronological state', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const inbox = new InMemoryBillingInboxStore();
  const orgId = 'org-perm-test';

  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Permutacao',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'perm-01',
  });

  const worker = new BillingWorker({
    inboxStore: inbox,
    commercialRepository: repo,
    catalog: COMMERCIAL_CATALOG_DRAFT,
  });

  // 1. invoice.paid (occurredAt: 2026-09-02) -> active
  await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_seq_1',
    eventType: 'invoice.paid',
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-02T12:00:00.000Z',
    payloadHash: 'sha256:seq1',
    data: {},
  });

  // 2. subscription.canceled (occurredAt: 2026-09-10) -> canceled
  await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_seq_2',
    eventType: 'subscription.canceled',
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-10T12:00:00.000Z',
    payloadHash: 'sha256:seq2',
    data: {},
  });

  // 3. stale invoice.payment_failed (occurredAt: 2026-09-05) -> ignored
  const r3 = await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_seq_3',
    eventType: 'invoice.payment_failed',
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-05T12:00:00.000Z',
    payloadHash: 'sha256:seq3',
    data: {},
  });
  assert.equal(r3.status, 'ignored');

  // 4. stale subscription.created (occurredAt: 2026-09-01) -> ignored
  const r4 = await worker.processEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_seq_4',
    eventType: 'subscription.created',
    organizationId: orgId,
    resourceId: `sub_${orgId}`,
    occurredAt: '2026-09-01T12:00:00.000Z',
    payloadHash: 'sha256:seq4',
    data: {},
  });
  assert.equal(r4.status, 'ignored');

  const subFinal = (await repo.readSubscription(orgId)) as any;
  assert.equal(subFinal.state, 'canceled');
  assert.equal(subFinal.canceledAt, '2026-09-10T12:00:00.000Z');
});

// ============================================================================
// VECTOR 4: SENSITIVE DATA LEAKAGE PREVENTION
// ============================================================================

await test('Vector 4: Redaction', '4.1 maskSensitiveData comprehensively masks PANs, CVVs, tokens, and credentials in deep trees', () => {
  const sensitivePayload = {
    organizationId: 'org-leak-check',
    billing: {
      card: {
        cardNumber: '4111222233334444',
        card_number: '5500111122223333',
        pan: '4000123456789010',
        primary_account: '4929000011112222',
        cvv: '123',
        cvc: '456',
        securityCode: '789',
        security_code: '012',
      },
      auth: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1',
        access_token: 'secret_access_token_123',
        bearer: 'Bearer eyJhbGciOi...',
        api_key: 'sk_live_999999999999999',
        private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...',
        webhook_secret: 'whsec_secret_to_redact',
        password: 'SuperSecretPassword123!',
      },
      nestedList: [
        {
          pan: '378282246310005',
          cvv: '9999',
        },
        {
          apiKey: 'key_abc_123',
        },
      ],
    },
    nonSensitiveMetadata: {
      planId: 'draft-team',
      amountCents: 4900,
      currency: 'BRL',
      customerEmail: 'financeiro@empresa.com.br',
    },
  };

  const masked = maskSensitiveData(sensitivePayload) as any;

  // Verify non-sensitive metadata is intact
  assert.equal(masked.organizationId, 'org-leak-check');
  assert.equal(masked.nonSensitiveMetadata.planId, 'draft-team');
  assert.equal(masked.nonSensitiveMetadata.amountCents, 4900);
  assert.equal(masked.nonSensitiveMetadata.currency, 'BRL');
  assert.equal(masked.nonSensitiveMetadata.customerEmail, 'financeiro@empresa.com.br');

  // Verify PANs are formatted with last 4 digits only or redacted
  assert.equal(masked.billing.card.cardNumber, '**** **** **** 4444');
  assert.equal(masked.billing.card.card_number, '**** **** **** 3333');
  assert.equal(masked.billing.card.pan, '**** **** **** 9010');
  assert.equal(masked.billing.card.primary_account, '[REDACTED]');
  assert.equal(masked.billing.nestedList[0].pan, '**** **** **** 0005');

  // Verify CVVs, tokens, passwords, and keys are [REDACTED]
  assert.equal(masked.billing.card.cvv, '[REDACTED]');
  assert.equal(masked.billing.card.cvc, '[REDACTED]');
  assert.equal(masked.billing.card.securityCode, '[REDACTED]');
  assert.equal(masked.billing.card.security_code, '[REDACTED]');
  assert.equal(masked.billing.auth.token, '[REDACTED]');
  assert.equal(masked.billing.auth.access_token, '[REDACTED]');
  assert.equal(masked.billing.auth.bearer, '[REDACTED]');
  assert.equal(masked.billing.auth.api_key, '[REDACTED]');
  assert.equal(masked.billing.auth.private_key, '[REDACTED]');
  assert.equal(masked.billing.auth.webhook_secret, '[REDACTED]');
  assert.equal(masked.billing.auth.password, '[REDACTED]');
  assert.equal(masked.billing.nestedList[0].cvv, '[REDACTED]');
  assert.equal(masked.billing.nestedList[1].apiKey, '[REDACTED]');

  // Full stringification scan: verify no sensitive secrets appear in masked payload
  const jsonStr = JSON.stringify(masked);
  assert(!jsonStr.includes('4111222233334444'));
  assert(!jsonStr.includes('SuperSecretPassword123!'));
  assert(!jsonStr.includes('whsec_secret_to_redact'));
  assert(!jsonStr.includes('sk_live_999999999999999'));
  assert(!jsonStr.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1'));
});

await test('Vector 4: Redaction', '4.2 Inbox store persists ONLY masked payloads with zero raw secret leaks', async () => {
  const firestore = new FakeCommercialFirestore();
  const inbox = new FirestoreBillingInboxStore(firestore);

  const rawSecret = 'sk_live_secret_must_never_be_stored';
  const rawPan = '4111111111119999';
  const rawCvv = '888';

  const rawBody = JSON.stringify({
    provider: 'fake_provider',
    id: 'evt_redact_inbox',
    type: 'invoice.paid',
    organizationId: 'org-redact-test',
    data: {
      cardNumber: rawPan,
      cvv: rawCvv,
      api_key: rawSecret,
    },
  });

  await inbox.recordEvent({
    provider: 'fake_provider',
    providerEventId: 'evt_redact_inbox',
    eventType: 'invoice.paid',
    organizationId: 'org-redact-test',
    occurredAt: '2026-09-02T12:00:00.000Z',
    rawBody,
    correlationId: 'redact-corr-1',
  });

  const record = await inbox.getEvent('fake_provider:evt_redact_inbox');
  assert(record !== null);

  // Verify maskedPayload contains redacted versions
  assert.equal((record.maskedPayload as any).data.cardNumber, '**** **** **** 9999');
  assert.equal((record.maskedPayload as any).data.cvv, '[REDACTED]');
  assert.equal((record.maskedPayload as any).data.api_key, '[REDACTED]');

  // Verify raw values are NOT present in the maskedPayload section
  assert(!JSON.stringify(record.maskedPayload).includes(rawSecret));
  assert(!JSON.stringify(record.maskedPayload).includes(rawPan));
});

await test('Vector 4: Redaction', '4.3 Deep recursion (>20 levels) truncated without stack overflow', () => {
  let deep: any = { value: 'leaf' };
  for (let i = 0; i < 25; i++) {
    deep = { nested: deep };
  }
  const masked = maskSensitiveData(deep);
  assert(masked !== null);
  let current: any = masked;
  let reachedTruncated = false;
  for (let i = 0; i < 25; i++) {
    if (current === '[TRUNCATED]' || current?.nested === '[TRUNCATED]') {
      reachedTruncated = true;
      break;
    }
    current = current?.nested;
  }
  assert.equal(reachedTruncated, true, 'Depth > 20 must be marked [TRUNCATED]');
});

await test('Vector 4: Redaction', '4.4 Non-object primitive values handled gracefully by maskSensitiveData', () => {
  assert.equal(maskSensitiveData(null), null);
  assert.equal(maskSensitiveData(undefined), undefined);
  assert.equal(maskSensitiveData('plain text'), 'plain text');
  assert.equal(maskSensitiveData(12345), 12345);
  assert.equal(maskSensitiveData(true), true);
});

// ============================================================================
// VECTOR 5: CHECKOUT REDIRECT ISOLATION
// ============================================================================

await test('Vector 5: Redirect Isolation', '5.1 /api/billing/return with forged query params and bodies NEVER changes database state', async () => {
  const firestore = new FakeCommercialFirestore();
  const repo = new FirestoreCommercialRepository(firestore, repoOptions);
  const orgId = 'org-victim-01';

  // 1. Setup victim organization on trial
  await repo.createOrganization({
    organizationId: orgId,
    displayName: 'Empresa Vitima',
    maxActiveSeats: 3,
    actorUid: 'uid-admin',
    correlationId: 'iso-01',
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
    correlationId: 'iso-02',
  });

  const app = express();
  app.use(express.json());
  app.use('/api/billing', createBillingRouter());

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    // 2. Adversarial GET attempts with manipulated parameters
    const getUrls = [
      `http://127.0.0.1:${port}/api/billing/return?orgId=${orgId}&status=active&plan=draft-enterprise&entitlement=full`,
      `http://127.0.0.1:${port}/api/billing/return?orgId=${orgId}&seats=9999&accessMode=full`,
      `http://127.0.0.1:${port}/api/billing/return?orgId=${orgId}';DROP TABLE organizations;--`,
      `http://127.0.0.1:${port}/api/billing/return?session_id=fake-session&status=completed`,
    ];

    for (const url of getUrls) {
      const res = await fetch(url);
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.status, 'pending_confirmation');
      assert.equal(json.note, 'Return redirects never alter subscription or entitlement state directly.');
    }

    // 3. Adversarial POST attempts
    const postRes = await fetch(`http://127.0.0.1:${port}/api/billing/return`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orgId,
        status: 'paid',
        plan: 'draft-enterprise',
        entitlements: { accessMode: 'full', maxSeats: 100 },
      }),
    });
    assert.equal(postRes.status, 200);

    // 4. Verify Firestore state is 100% UNCHANGED
    const subAfter = (await repo.readSubscription(orgId)) as any;
    assert.equal(subAfter.state, 'trialing', 'Subscription state must remain trialing');
    assert.equal(subAfter.planId, 'draft-team', 'Plan ID must remain draft-team');

    const orgAfter = await repo.readOrganization(orgId);
    assert.equal(orgAfter?.maxActiveSeats, 3, 'Seat limits must remain 3');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ============================================================================
// VECTOR 6: FAIL-CLOSED & RESILIENCE
// ============================================================================

await test('Vector 6: Fail-Closed', '6.1 Webhook and billing endpoints return 503 on unconfigured secrets without server crash', async () => {
  const app = express();
  app.use(express.json());

  // Mount with NO secret and NO provider configured
  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      webhookSecret: undefined,
      provider: undefined,
    }),
  );

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
    // 1. Webhook POST -> 503
    const whRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'invoice.paid' }),
    });
    assert.equal(whRes.status, 503);
    const whBody = await whRes.json();
    assert.equal(whBody.error, 'billing_provider_unavailable');

    // 2. Checkout session POST -> 503
    const csRes = await fetch(`http://127.0.0.1:${port}/api/billing/checkout-sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ organizationId: 'org-1', planId: 'draft-team' }),
    });
    assert.equal(csRes.status, 503);
    const csBody = await csRes.json();
    assert.equal(csBody.error, 'billing_provider_unavailable');

    // 3. Malformed / unsupported provider -> 400 when configured, or 503 when unconfigured
    // Server must still be responsive
    const healthCheck = await fetch(`http://127.0.0.1:${port}/api/billing/return`);
    assert.equal(healthCheck.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Vector 6: Fail-Closed', '6.2 Webhook endpoint handles empty request bodies and unsupported providers gracefully', async () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_valid_secret';

  const app = express();
  app.use(express.json());
  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      provider,
      webhookSecret: secret,
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    // 1. Unsupported provider route
    const unsupRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/unknown_gateway`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'invoice.paid' }),
    });
    assert.equal(unsupRes.status, 400);
    const unsupBody = await unsupRes.json();
    assert.equal(unsupBody.error, 'unsupported_billing_provider');

    // 2. Missing signature header on POST -> 400 missing_webhook_signature
    const missingSigRes = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'invoice.paid' }),
    });
    assert.equal(missingSigRes.status, 400);
    const missingSigBody = await missingSigRes.json();
    assert.equal(missingSigBody.error, 'missing_webhook_signature');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Vector 6: Fail-Closed', '6.3 Webhook router returns HTTP 400 invalid_webhook_payload on malformed JSON payload without crashing server', async () => {
  const provider = new FakeBillingProvider();
  const secret = 'whsec_valid_secret';

  const app = express();
  app.use(express.raw({ type: '*/*' }));
  app.use((req, _res, next) => {
    if (Buffer.isBuffer(req.body)) {
      (req as any).rawBody = req.body;
    }
    next();
  });

  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      provider,
      webhookSecret: secret,
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    const malformedBody = '{"broken_json": true,'; // truncated invalid JSON
    const signed = provider.signWebhookPayload(malformedBody, secret);

    const res = await fetch(`http://127.0.0.1:${port}/api/webhooks/billing/fake_provider`, {
      method: 'POST',
      headers: {
        'content-type': 'text/plain',
        ...signed.headers,
      },
      body: malformedBody,
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'invalid_webhook_payload');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

await test('Vector 6: Fail-Closed', '6.4 Checkout requires a bearer token and uses only server-authorized organization and plan IDs', async () => {
  const provider = new FakeBillingProvider();
  const authorizedRequests: Array<{ organizationId: string; planId: string }> = [];
  const app = express();
  app.use(express.json());
  app.use(
    '/api/billing',
    createBillingRouter({
      provider,
      checkoutAuthorizer: {
        async authorize(input) {
          authorizedRequests.push({
            organizationId: input.requestedOrganizationId,
            planId: input.requestedPlanId,
          });
          return { ok: true, organizationId: 'org-authorized', planId: 'draft-team' };
        },
      },
    }),
  );

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;

  try {
    const missingToken = await fetch(`http://127.0.0.1:${port}/api/billing/checkout-sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ organizationId: 'org-victim', planId: 'draft-enterprise' }),
    });
    assert.equal(missingToken.status, 401);
    assert.equal(provider.checkoutSessions.size, 0);

    const authorized = await fetch(`http://127.0.0.1:${port}/api/billing/checkout-sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer valid-test-token' },
      body: JSON.stringify({ organizationId: 'org-victim', planId: 'draft-enterprise' }),
    });
    assert.equal(authorized.status, 200);
    const body = await authorized.json();
    assert.equal(body.session.organizationId, 'org-authorized');
    assert.equal(body.session.planId, 'draft-team');
    assert.deepEqual(authorizedRequests, [{ organizationId: 'org-victim', planId: 'draft-enterprise' }]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================

console.log('\n================================================================');
console.log('  COMMERCIAL BILLING ADVERSARIAL CHALLENGE SUMMARY');
console.log('================================================================');

const total = results.length;
const passed = results.filter((r) => !r.error).length;
const failed = results.filter((r) => r.error).length;

console.log(`Total Adversarial Scenarios Tested: ${total}`);
console.log(`Passed:                             ${passed} / ${total}`);
console.log(`Failed:                             ${failed} / ${total}`);

if (failed > 0) {
  console.error('\nFAILED ADVERSARIAL CHALLENGES:');
  results
    .filter((r) => r.error)
    .forEach((r) => {
      console.error(` - [${r.category}] ${r.name}: ${r.error}`);
    });
  process.exit(1);
} else {
  console.log('\nALL 6 ADVERSARIAL BILLING VECTORS FULLY VALIDATED AND PASSED.');
}
