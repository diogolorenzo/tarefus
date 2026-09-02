import { Router, type Request, type Response } from 'express';
import type { BillingProvider } from '../domain/commercial';
import type { BillingInboxStore } from './billing-inbox';
import type { BillingWorker } from './billing-worker';

export interface BillingWebhookRouterOptions {
  provider?: BillingProvider;
  webhookSecret?: string;
  inboxStore?: BillingInboxStore;
  worker?: BillingWorker;
  toleranceMs?: number;
}

export interface BillingRouterOptions {
  provider?: BillingProvider;
  webhookSecret?: string;
  inboxStore?: BillingInboxStore;
  worker?: BillingWorker;
}

/**
 * Creates the inert webhook router for billing providers.
 * Fails closed (503) if webhook secrets or providers are not configured.
 */
export function createBillingWebhookRouter(options: BillingWebhookRouterOptions = {}): Router {
  const router = Router();

  // Webhook handler mounted at /:provider or /billing/:provider
  const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const providerParam = req.params.provider;

    // Fail closed if provider or secret is unconfigured
    if (!options.provider || !options.webhookSecret || options.webhookSecret.trim().length === 0) {
      res.status(503).json({
        error: 'billing_provider_unavailable',
        message: 'Billing provider webhook secret is not configured.',
      });
      return;
    }

    if (providerParam && providerParam !== options.provider.providerName && providerParam !== 'billing') {
      res.status(400).json({
        error: 'unsupported_billing_provider',
        message: `Billing provider '${providerParam}' is not supported.`,
      });
      return;
    }

    // Retrieve raw body buffer
    const rawBodyBuffer = getRawBodyBuffer(req);
    if (!rawBodyBuffer || rawBodyBuffer.length === 0) {
      res.status(400).json({
        error: 'missing_request_body',
        message: 'Webhook request body is empty or missing.',
      });
      return;
    }

    // Verify HMAC signature & timestamp tolerance
    const verification = options.provider.verifyWebhookSignature({
      rawBody: rawBodyBuffer,
      headers: req.headers,
      secret: options.webhookSecret,
      toleranceMs: options.toleranceMs,
    });

    if (!verification.valid) {
      if (verification.reason === 'missing_headers') {
        res.status(400).json({
          error: 'missing_webhook_signature',
          message: 'Webhook signature header is missing.',
        });
        return;
      }
      if (verification.reason === 'timestamp_out_of_tolerance') {
        res.status(401).json({
          error: 'timestamp_out_of_tolerance',
          message: 'Webhook timestamp is outside the allowed tolerance window.',
        });
        return;
      }
      res.status(401).json({
        error: 'invalid_signature',
        message: 'Webhook signature verification failed.',
      });
      return;
    }

    // Parse normalized event
    let event;
    try {
      event = options.provider.parseWebhookEvent(rawBodyBuffer, req.headers);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({
        error: 'invalid_webhook_payload',
        message: `Failed to parse webhook event: ${msg}`,
      });
      return;
    }

    const correlationId = `wh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Record in inbox (deduplication)
    if (options.inboxStore) {
      const { isDuplicate } = await options.inboxStore.recordEvent({
        provider: event.provider,
        providerEventId: event.providerEventId,
        eventType: event.eventType,
        organizationId: event.organizationId,
        occurredAt: event.occurredAt,
        rawBody: rawBodyBuffer,
        correlationId,
      });

      if (isDuplicate) {
        res.status(200).json({
          success: true,
          status: 'duplicate',
          message: 'Event already recorded and processed.',
        });
        return;
      }
    }

    // Process event via worker
    if (options.worker) {
      const result = await options.worker.processEvent(event, correlationId);
      if (result.status === 'processed') {
        res.status(200).json({
          success: true,
          status: 'processed',
          organizationId: result.organizationId,
          eventType: result.eventType,
        });
        return;
      }
      if (result.status === 'duplicate') {
        res.status(200).json({
          success: true,
          status: 'duplicate',
        });
        return;
      }
      if (result.status === 'ignored') {
        res.status(200).json({
          success: true,
          status: 'ignored',
          reason: result.reason,
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: result.reason,
        message: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'received',
      eventId: event.providerEventId,
    });
  };

  // Support both /:provider and /billing/:provider
  router.post('/billing/:provider', handleWebhook);
  router.post('/:provider', handleWebhook);
  router.post('/', handleWebhook);

  return router;
}

/**
 * General billing router including checkout sessions and inert return redirects.
 */
export function createBillingRouter(options: BillingRouterOptions = {}): Router {
  const router = Router();

  // Checkout redirect return endpoint - GUARANTEED INERT: never activates entitlements or modifies subscription!
  const handleReturn = (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || req.body?.orgId || req.body?.organizationId || null;
    const sessionId = (req.query.session_id as string) || req.body?.sessionId || null;

    res.status(200).json({
      status: 'pending_confirmation',
      message: 'Checkout completed. Entitlements will update automatically upon webhook confirmation.',
      organizationId: orgId,
      sessionId,
      note: 'Return redirects never alter subscription or entitlement state directly.',
    });
  };

  router.get('/return', handleReturn);
  router.post('/return', handleReturn);

  // Checkout session creation endpoint
  router.post('/checkout-sessions', async (req: Request, res: Response) => {
    if (!options.provider) {
      res.status(503).json({
        error: 'billing_provider_unavailable',
        message: 'Billing provider is not configured.',
      });
      return;
    }

    const { organizationId, planId, returnUrl, customerId } = req.body || {};
    if (!organizationId || !planId) {
      res.status(400).json({
        error: 'invalid_request',
        message: 'organizationId and planId are required.',
      });
      return;
    }

    try {
      const session = await options.provider.createCheckoutSession({
        organizationId,
        planId,
        returnUrl: returnUrl || 'https://tarefus.local/billing/return',
        customerId,
      });
      res.status(200).json({ success: true, session });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'checkout_session_failed', message: msg });
    }
  });

  return router;
}

function getRawBodyBuffer(req: Request): Buffer | null {
  const customRaw = (req as unknown as { rawBody?: Buffer | string }).rawBody;
  if (Buffer.isBuffer(customRaw)) {
    return customRaw;
  }
  if (typeof customRaw === 'string') {
    return Buffer.from(customRaw, 'utf8');
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }
  if (req.body && typeof req.body === 'object') {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }
  return null;
}
