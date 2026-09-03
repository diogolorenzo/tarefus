import {
  COMMERCIAL_CATALOG_DRAFT,
  type CommercialCatalog,
  resolveEntitlements,
  type SubscriptionSnapshot,
  type SubscriptionState,
  transitionSubscription,
} from '../domain/commercial';
import type { NormalizedBillingEvent } from '../domain/commercial/billing-types';
import type { BillingInboxStore } from './billing-inbox';
import type { FirestoreCommercialRepository } from './commercial-repository';

export interface BillingWorkerOptions {
  inboxStore: BillingInboxStore;
  commercialRepository: FirestoreCommercialRepository;
  catalog?: CommercialCatalog;
  now?: () => string;
  actorUid?: string;
}

export type BillingWorkerResult =
  | { status: 'processed'; organizationId: string; eventType: string }
  | { status: 'duplicate'; inboxKey: string }
  | { status: 'ignored'; reason: string }
  | { status: 'error'; reason: string; error?: string };

export class BillingWorker {
  private readonly inboxStore: BillingInboxStore;
  private readonly repo: FirestoreCommercialRepository;
  private readonly catalog: CommercialCatalog;
  private readonly now: () => string;
  private readonly actorUid: string;

  constructor(options: BillingWorkerOptions) {
    this.inboxStore = options.inboxStore;
    this.repo = options.commercialRepository;
    this.catalog = options.catalog || COMMERCIAL_CATALOG_DRAFT;
    this.now = options.now || (() => new Date().toISOString());
    this.actorUid = options.actorUid || 'system-billing-worker';
  }

  async processEvent(
    event: NormalizedBillingEvent,
    correlationId = `worker-corr-${Date.now()}`,
  ): Promise<BillingWorkerResult> {
    const inboxKey = `${event.provider}:${event.providerEventId}`;
    const serverNow = this.now();

    // Step 1: Record / check inbox deduplication
    const rawBodyForInbox = typeof event.data === 'string' ? event.data : JSON.stringify(event.data || {});
    const { record: inboxRecord, isDuplicate } = await this.inboxStore.recordEvent({
      provider: event.provider,
      providerEventId: event.providerEventId,
      eventType: event.eventType,
      organizationId: event.organizationId,
      occurredAt: event.occurredAt || serverNow,
      rawBody: rawBodyForInbox,
      correlationId,
    });

    if (isDuplicate && (inboxRecord.processingState === 'processed' || inboxRecord.processingState === 'duplicate')) {
      return { status: 'duplicate', inboxKey };
    }

    // Mark as processing
    await this.inboxStore.updateProcessingState(inboxKey, 'processing');

    const orgId = event.organizationId;
    if (!orgId) {
      await this.inboxStore.updateProcessingState(inboxKey, 'ignored', 'missing_organization_id');
      return { status: 'ignored', reason: 'missing_organization_id' };
    }

    // Step 2: Read organization
    const organization = await this.repo.readOrganization(orgId);
    if (!organization) {
      await this.inboxStore.updateProcessingState(inboxKey, 'failed', 'organization_not_found');
      return { status: 'error', reason: 'organization_not_found' };
    }

    const currentSubDoc = await this.repo.readSubscription(orgId);
    const eventTime = Date.parse(event.occurredAt);

    // Step 3: Out-of-order defense
    if (currentSubDoc) {
      const currentSubState = currentSubDoc.state as SubscriptionState;
      const lastProviderEventMs = currentSubDoc.lastProviderEventAt
        ? Date.parse(currentSubDoc.lastProviderEventAt as string)
        : Number.NaN;
      const startedAtMs = currentSubDoc.startedAt ? Date.parse(currentSubDoc.startedAt as string) : 0;
      const canceledAtMs = currentSubDoc.canceledAt ? Date.parse(currentSubDoc.canceledAt as string) : 0;
      const lastUpdateMs = Math.max(startedAtMs, canceledAtMs);

      if (!Number.isNaN(eventTime) && !Number.isNaN(lastProviderEventMs) && eventTime < lastProviderEventMs) {
        await this.inboxStore.updateProcessingState(inboxKey, 'ignored', 'stale_event_ignored');
        return { status: 'ignored', reason: 'stale_event_ignored' };
      }

      // If subscription was canceled after this event occurred, do not regress back to active
      if (currentSubState === 'canceled' && !Number.isNaN(eventTime) && !Number.isNaN(canceledAtMs) && eventTime < canceledAtMs) {
        await this.repo.appendAuditEvent({
          organizationId: orgId,
          actorUid: this.actorUid,
          correlationId,
          type: 'billing.compensatory_event',
          payload: {
            reason: 'stale_event_ignored_after_cancellation',
            eventType: event.eventType,
            occurredAt: event.occurredAt,
            canceledAt: currentSubDoc.canceledAt as string,
            currentState: currentSubState,
          },
        });
        await this.inboxStore.updateProcessingState(inboxKey, 'ignored', 'stale_event_ignored');
        return { status: 'ignored', reason: 'stale_event_ignored' };
      }

      // If subscription is currently active and an older payment_failed or stale event arrives
      if (currentSubState === 'active' && !Number.isNaN(eventTime) && !Number.isNaN(lastUpdateMs) && eventTime < lastUpdateMs) {
        if (event.eventType === 'invoice.payment_failed' || event.eventType === 'subscription.created') {
          await this.repo.appendAuditEvent({
            organizationId: orgId,
            actorUid: this.actorUid,
            correlationId,
            type: 'billing.compensatory_event',
            payload: {
              reason: 'stale_event_ignored_on_active_subscription',
              eventType: event.eventType,
              occurredAt: event.occurredAt,
              currentState: currentSubState,
            },
          });
          await this.inboxStore.updateProcessingState(inboxKey, 'ignored', 'stale_event_ignored');
          return { status: 'ignored', reason: 'stale_event_ignored' };
        }
      }
    }

    // Step 4: Perform domain state transitions
    try {
      let nextSubscription: SubscriptionSnapshot;
      const currentSnapshot: SubscriptionSnapshot = currentSubDoc
        ? {
            subscriptionId: (currentSubDoc.subscriptionId as string) || `sub_${orgId}`,
            workspaceId: orgId,
            planId: (currentSubDoc.planId as string) || 'draft-team',
            state: currentSubDoc.state as SubscriptionState,
            startedAt: (currentSubDoc.startedAt as string) || serverNow,
            trialEndsAt: currentSubDoc.trialEndsAt as string | undefined,
            currentPeriodEndsAt: currentSubDoc.currentPeriodEndsAt as string | undefined,
            canceledAt: currentSubDoc.canceledAt as string | undefined,
          }
        : {
            subscriptionId: event.resourceId || `sub_${orgId}`,
            workspaceId: orgId,
            planId: (event.data?.subscription?.planId as string) || 'draft-team',
            state: 'trialing',
            startedAt: event.occurredAt || serverNow,
          };

      const eventPeriodEnd =
        (event.data?.subscription?.currentPeriodEndAt as string) ||
        (event.data?.currentPeriodEndAt as string) ||
        new Date(Date.parse(event.occurredAt || serverNow) + 30 * 86_400_000).toISOString();

      switch (event.eventType) {
        case 'checkout.completed':
        case 'subscription.created': {
          const planId = (event.data?.subscription?.planId as string) || currentSnapshot.planId || 'draft-team';
          nextSubscription = {
            ...currentSnapshot,
            planId,
            state: 'active',
            currentPeriodEndsAt: eventPeriodEnd,
          };
          break;
        }

        case 'subscription.renewed':
        case 'invoice.paid': {
          if (currentSnapshot.state === 'trialing' || currentSnapshot.state === 'payment_pending') {
            const res = transitionSubscription(currentSnapshot, {
              type: 'ACTIVATE',
              occurredAt: event.occurredAt || serverNow,
              currentPeriodEndsAt: eventPeriodEnd,
            });
            nextSubscription = res.ok ? res.value : { ...currentSnapshot, state: 'active', currentPeriodEndsAt: eventPeriodEnd };
          } else {
            nextSubscription = {
              ...currentSnapshot,
              state: 'active',
              currentPeriodEndsAt: eventPeriodEnd,
            };
          }
          break;
        }

        case 'invoice.payment_failed': {
          if (currentSnapshot.state === 'active' || currentSnapshot.state === 'trialing') {
            const res = transitionSubscription(currentSnapshot, {
              type: 'PAYMENT_PENDING',
              occurredAt: event.occurredAt || serverNow,
            });
            nextSubscription = res.ok ? res.value : { ...currentSnapshot, state: 'payment_pending' };
          } else {
            nextSubscription = currentSnapshot;
          }
          break;
        }

        case 'subscription.canceled': {
          if (currentSnapshot.state !== 'canceled' && currentSnapshot.state !== 'expired') {
            const res = transitionSubscription(currentSnapshot, {
              type: 'CANCEL',
              occurredAt: event.occurredAt || serverNow,
            });
            nextSubscription = res.ok ? res.value : { ...currentSnapshot, state: 'canceled', canceledAt: event.occurredAt || serverNow };
          } else {
            nextSubscription = currentSnapshot;
          }
          break;
        }

        case 'charge.chargeback':
        case 'charge.refunded': {
          nextSubscription = {
            ...currentSnapshot,
            state: 'payment_pending',
          };
          break;
        }

        case 'subscription.updated': {
          const planId = (event.data?.subscription?.planId as string) || currentSnapshot.planId;
          nextSubscription = {
            ...currentSnapshot,
            planId,
            currentPeriodEndsAt: eventPeriodEnd,
          };
          break;
        }

        default:
          nextSubscription = currentSnapshot;
          break;
      }

      // Step 5: Write subscription & entitlements
      const storedSubscription = {
        ...nextSubscription,
        lastProviderEventAt: event.occurredAt || serverNow,
      };

      await this.repo.writeSubscription({
        organizationId: orgId,
        subscription: storedSubscription,
        actorUid: this.actorUid,
        correlationId,
      });

      const assignedSeats = Number(organization.activeSeats) || 0;
      const resolved = resolveEntitlements({
        catalog: this.catalog,
        subscription: nextSubscription,
        seatUsage: { assignedSeats },
        now: serverNow,
      });

      await this.repo.writeEntitlements({
        organizationId: orgId,
        entitlements: resolved,
        actorUid: this.actorUid,
        correlationId,
      });

      // Step 6: Log audit event
      await this.repo.appendAuditEvent({
        organizationId: orgId,
        actorUid: this.actorUid,
        correlationId,
        type: 'billing.webhook_processed',
        payload: {
          provider: event.provider,
          providerEventId: event.providerEventId,
          eventType: event.eventType,
          planId: nextSubscription.planId,
          subscriptionState: nextSubscription.state,
          accessMode: resolved.accessMode,
        },
      });

      await this.inboxStore.updateProcessingState(inboxKey, 'processed');

      return {
        status: 'processed',
        organizationId: orgId,
        eventType: event.eventType,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await this.inboxStore.updateProcessingState(inboxKey, 'failed', errorMessage);
      return {
        status: 'error',
        reason: 'processing_failed',
        error: errorMessage,
      };
    }
  }
}
