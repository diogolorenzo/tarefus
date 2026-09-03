import type {
  BillingCheckoutSession,
  BillingCustomer,
  BillingInvoice,
  BillingProvider,
  BillingProviderName,
  BillingSubscription,
  CreateCheckoutSessionInput,
  CreateCustomerInput,
  NormalizedBillingEvent,
  WebhookVerificationInput,
  WebhookVerificationResult,
} from '../domain/commercial';
import { computeHmacSha256, computeSha256, isTimestampWithinTolerance, secureCompareHex } from './billing-crypto';

export class FakeBillingProvider implements BillingProvider {
  readonly providerName: BillingProviderName = 'fake_provider';

  private customerCounter = 1;
  private sessionCounter = 1;
  private invoiceCounter = 1;
  private subscriptionCounter = 1;

  readonly customers = new Map<string, BillingCustomer>();
  readonly checkoutSessions = new Map<string, BillingCheckoutSession>();
  readonly subscriptions = new Map<string, BillingSubscription>();
  readonly invoices = new Map<string, BillingInvoice>();

  async createCustomer(input: CreateCustomerInput): Promise<BillingCustomer> {
    const customerId = `cust_fake_${String(this.customerCounter++).padStart(5, '0')}`;
    const customer: BillingCustomer = {
      providerCustomerId: customerId,
      organizationId: input.organizationId,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      documentNumber: input.documentNumber,
      createdAt: new Date().toISOString(),
    };
    this.customers.set(customerId, customer);
    return customer;
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingCheckoutSession> {
    const sessionId = `sess_fake_${String(this.sessionCounter++).padStart(5, '0')}`;
    const providerSessionId = `psess_fake_${sessionId}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const session: BillingCheckoutSession = {
      sessionId,
      providerSessionId,
      organizationId: input.organizationId,
      planId: input.planId,
      checkoutUrl: `https://fake-billing.local/checkout/${sessionId}?return_url=${encodeURIComponent(input.returnUrl)}`,
      expiresAt,
      status: 'open',
    };
    this.checkoutSessions.set(sessionId, session);
    return session;
  }

  /**
   * Helper for tests to create an HMAC signature and header.
   */
  signWebhookPayload(
    rawBody: string | Buffer,
    secret: string,
    options?: { timestamp?: string | number; headerStyle?: 'header-pair' | 'stripe-style' | 'raw-hex' },
  ): { signature: string; timestamp: string; signatureHeader: string; headers: Record<string, string> } {
    const ts = options?.timestamp !== undefined ? String(options.timestamp) : String(Math.floor(Date.now() / 1000));
    const headerStyle = options?.headerStyle ?? 'header-pair';

    if (headerStyle === 'stripe-style') {
      const payloadToSign = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
      const combined = Buffer.concat([Buffer.from(`${ts}.`, 'utf8'), payloadToSign]);
      const signature = computeHmacSha256(combined, secret);
      const signatureHeader = `t=${ts},v1=${signature}`;
      return {
        signature,
        timestamp: ts,
        signatureHeader,
        headers: {
          'x-webhook-signature': signatureHeader,
        },
      };
    }

    const signature = computeHmacSha256(rawBody, secret);
    return {
      signature,
      timestamp: ts,
      signatureHeader: signature,
      headers: {
        'x-webhook-signature': signature,
        'x-webhook-timestamp': ts,
      },
    };
  }

  verifyWebhookSignature(input: WebhookVerificationInput): WebhookVerificationResult {
    const rawBody = input.rawBody;
    const secret = input.secret;
    const headers = input.headers;
    const toleranceMs = input.toleranceMs ?? 300_000;
    const nowMs = input.nowMs ?? Date.now();

    if (!secret || typeof secret !== 'string') {
      return { valid: false, reason: 'invalid_signature' };
    }

    // Lookup signature header case-insensitively
    const signatureHeader = getHeader(headers, [
      'x-webhook-signature',
      'x-signature',
      'tarefus-signature',
      'stripe-signature',
    ]);

    if (!signatureHeader || typeof signatureHeader !== 'string') {
      return { valid: false, reason: 'missing_headers' };
    }

    // Check for 't=timestamp,v1=signature' format
    if (signatureHeader.includes('t=') && signatureHeader.includes('v1=')) {
      const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split('=');
        if (k && v) acc[k.trim()] = v.trim();
        return acc;
      }, {});

      const timestampStr = parts.t;
      const signatureHex = parts.v1;

      if (!timestampStr || !signatureHex) {
        return { valid: false, reason: 'missing_headers' };
      }

      if (!isTimestampWithinTolerance(timestampStr, toleranceMs, nowMs)) {
        return { valid: false, reason: 'timestamp_out_of_tolerance' };
      }

      const payloadToSign = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
      const combined = Buffer.concat([Buffer.from(`${timestampStr}.`, 'utf8'), payloadToSign]);
      const expectedSignature = computeHmacSha256(combined, secret);

      if (!secureCompareHex(signatureHex, expectedSignature)) {
        return { valid: false, reason: 'invalid_signature' };
      }

      return { valid: true };
    }

    // Direct header-pair format (x-webhook-signature + x-webhook-timestamp)
    const timestampHeader = getHeader(headers, [
      'x-webhook-timestamp',
      'x-timestamp',
      'tarefus-timestamp',
    ]);

    if (timestampHeader) {
      if (!isTimestampWithinTolerance(String(timestampHeader), toleranceMs, nowMs)) {
        return { valid: false, reason: 'timestamp_out_of_tolerance' };
      }
    }

    const expectedSignature = computeHmacSha256(rawBody, secret);
    if (!secureCompareHex(signatureHeader.trim(), expectedSignature)) {
      return { valid: false, reason: 'invalid_signature' };
    }

    return { valid: true };
  }

  parseWebhookEvent(
    rawBody: string | Buffer,
    _headers?: Record<string, string | string[] | undefined>,
  ): NormalizedBillingEvent {
    const rawString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const parsed = JSON.parse(rawString);

    const provider: BillingProviderName = parsed.provider || this.providerName;
    const providerEventId: string = parsed.id || parsed.eventId || parsed.providerEventId || `evt_${Date.now()}`;
    const eventType = parsed.type || parsed.eventType || 'checkout.completed';
    const organizationId: string = parsed.organizationId || parsed.data?.organizationId || parsed.data?.subscription?.organizationId || '';
    const resourceId: string = parsed.resourceId || parsed.data?.id || parsed.data?.subscription?.providerSubscriptionId || providerEventId;
    const occurredAt: string = parsed.occurredAt || parsed.created || parsed.createdAt || new Date().toISOString();
    const payloadHash = computeSha256(rawBody);

    return {
      provider,
      providerEventId,
      eventType,
      organizationId,
      resourceId,
      occurredAt,
      payloadHash,
      data: parsed.data || parsed,
    };
  }

  /**
   * Helper to create mock payment payloads for Pix, Boleto, and Card.
   */
  createMockPixPayload(organizationId: string, amountCents = 4900): Record<string, unknown> {
    const invoiceId = `inv_pix_${String(this.invoiceCounter++).padStart(5, '0')}`;
    return {
      provider: this.providerName,
      id: `evt_${invoiceId}`,
      type: 'invoice.paid',
      organizationId,
      occurredAt: new Date().toISOString(),
      data: {
        invoice: {
          providerInvoiceId: invoiceId,
          organizationId,
          amountCents,
          currency: 'BRL',
          status: 'paid',
          dueAt: new Date().toISOString(),
          paidAt: new Date().toISOString(),
          paymentMethod: 'pix',
        },
        pix: {
          qrCodeText: '00020126580014BR.GOV.BCB.PIX0136fake-key-5204000053039865802BR5913Tarefus6009SaoPaulo62070503***6304ABCD',
          qrCodeImageUrl: 'https://fake-billing.local/pix/qr.png',
        },
      },
    };
  }

  createMockBoletoPayload(organizationId: string, amountCents = 4900): Record<string, unknown> {
    const invoiceId = `inv_bol_${String(this.invoiceCounter++).padStart(5, '0')}`;
    return {
      provider: this.providerName,
      id: `evt_${invoiceId}`,
      type: 'invoice.created',
      organizationId,
      occurredAt: new Date().toISOString(),
      data: {
        invoice: {
          providerInvoiceId: invoiceId,
          organizationId,
          amountCents,
          currency: 'BRL',
          status: 'pending',
          dueAt: new Date(Date.now() + 3 * 86400000).toISOString(),
          paymentMethod: 'boleto',
        },
        boleto: {
          barcodeNumber: '23793.38128 60000.123456 12345.678901 1 90000000004900',
          pdfUrl: 'https://fake-billing.local/boleto/inv.pdf',
        },
      },
    };
  }

  createMockCardPayload(organizationId: string, amountCents = 4900): Record<string, unknown> {
    const subId = `sub_card_${String(this.subscriptionCounter++).padStart(5, '0')}`;
    const invoiceId = `inv_card_${String(this.invoiceCounter++).padStart(5, '0')}`;
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 86400000);

    return {
      provider: this.providerName,
      id: `evt_${subId}`,
      type: 'subscription.created',
      organizationId,
      occurredAt: now.toISOString(),
      data: {
        subscription: {
          providerSubscriptionId: subId,
          organizationId,
          planId: 'draft-team',
          status: 'active',
          currentPeriodStartAt: now.toISOString(),
          currentPeriodEndAt: nextMonth.toISOString(),
          cancelAtPeriodEnd: false,
        },
        invoice: {
          providerInvoiceId: invoiceId,
          providerSubscriptionId: subId,
          organizationId,
          amountCents,
          currency: 'BRL',
          status: 'paid',
          dueAt: now.toISOString(),
          paidAt: now.toISOString(),
          paymentMethod: 'credit_card',
        },
        creditCard: {
          cardNumber: '4111111111111234',
          cvv: '123',
          brand: 'visa',
          last4: '1234',
          holderName: 'Cliente Teste',
        },
      },
    };
  }
}

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  names: readonly string[],
): string | undefined {
  for (const name of names) {
    const direct = headers[name];
    if (typeof direct === 'string') return direct;
    if (Array.isArray(direct) && typeof direct[0] === 'string') return direct[0];

    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === lower) {
        if (typeof value === 'string') return value;
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      }
    }
  }
  return undefined;
}
