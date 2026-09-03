/**
 * Pure commercial billing domain types & provider contracts.
 * Agnostic of external payment gateway SDKs (Asaas, iugu, Mercado Pago, Pagar.me).
 */

export type BillingProviderName =
  | 'fake_provider'
  | 'asaas'
  | 'iugu'
  | 'mercadopago'
  | 'pagarme';

export interface BillingCustomer {
  providerCustomerId: string;
  organizationId: string;
  email: string;
  name: string;
  documentNumber?: string;
  createdAt?: string;
}

export interface BillingCheckoutSession {
  sessionId: string;
  providerSessionId: string;
  organizationId: string;
  planId: string;
  checkoutUrl: string;
  expiresAt: string;
  status: 'open' | 'completed' | 'expired';
}

export interface BillingSubscription {
  providerSubscriptionId: string;
  organizationId: string;
  planId: string;
  status: 'active' | 'payment_pending' | 'canceled' | 'expired' | 'trialing';
  currentPeriodStartAt: string;
  currentPeriodEndAt: string;
  cancelAtPeriodEnd: boolean;
}

export interface BillingInvoice {
  providerInvoiceId: string;
  providerSubscriptionId?: string;
  organizationId: string;
  amountCents: number;
  currency: 'BRL';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'chargeback';
  dueAt: string;
  paidAt?: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
}

export type BillingEventType =
  | 'checkout.completed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.renewed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'charge.refunded'
  | 'charge.chargeback';

export interface NormalizedBillingEvent {
  provider: BillingProviderName;
  providerEventId: string;
  eventType: BillingEventType;
  organizationId: string;
  resourceId: string;
  occurredAt: string;
  payloadHash: string;
  data: {
    customer?: BillingCustomer;
    subscription?: BillingSubscription;
    invoice?: BillingInvoice;
    amountCents?: number;
    currency?: 'BRL';
    currentPeriodEndAt?: string;
    [key: string]: unknown;
  };
}

export interface WebhookVerificationInput {
  rawBody: Buffer | string;
  headers: Record<string, string | string[] | undefined>;
  secret: string;
  toleranceMs?: number;
  nowMs?: number;
}

export type WebhookVerificationFailureReason =
  | 'invalid_signature'
  | 'timestamp_out_of_tolerance'
  | 'missing_headers'
  | 'tampered_payload';

export interface WebhookVerificationResult {
  valid: boolean;
  reason?: WebhookVerificationFailureReason;
}

export interface CreateCustomerInput {
  organizationId: string;
  email: string;
  name: string;
  documentNumber?: string;
}

export interface CreateCheckoutSessionInput {
  organizationId: string;
  planId: string;
  returnUrl: string;
  customerId?: string;
}

export interface BillingProvider {
  readonly providerName: BillingProviderName;

  createCustomer(input: CreateCustomerInput): Promise<BillingCustomer>;

  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<BillingCheckoutSession>;

  verifyWebhookSignature(input: WebhookVerificationInput): WebhookVerificationResult;

  parseWebhookEvent(
    rawBody: string | Buffer,
    headers?: Record<string, string | string[] | undefined>,
  ): NormalizedBillingEvent;
}
