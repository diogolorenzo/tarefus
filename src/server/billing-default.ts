import type { Express } from 'express';
import { createBillingRouter, createBillingWebhookRouter } from './billing-router';
import { InMemoryBillingInboxStore } from './billing-inbox';

export function mountBillingRouter(app: Express): void {
  const webhookSecret = process.env.BILLING_WEBHOOK_SECRET;

  // Mount billing webhooks at /api/webhooks (e.g. /api/webhooks/billing/:provider and /api/webhooks/:provider)
  app.use(
    '/api/webhooks',
    createBillingWebhookRouter({
      webhookSecret,
      inboxStore: new InMemoryBillingInboxStore(),
    }),
  );

  // Mount general billing endpoints at /api/billing (e.g. /api/billing/return, /api/billing/checkout-sessions)
  app.use(
    '/api/billing',
    createBillingRouter({
      webhookSecret,
      inboxStore: new InMemoryBillingInboxStore(),
    }),
  );
}
