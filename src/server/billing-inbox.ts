import type { BillingProviderName } from '../domain/commercial';
import { computeSha256 } from './billing-crypto';
import type { CommercialFirestore } from './commercial-repository';

export type BillingProcessingState =
  | 'received'
  | 'processing'
  | 'processed'
  | 'ignored'
  | 'failed'
  | 'duplicate';

export interface BillingInboxRecord {
  inboxKey: string;
  provider: BillingProviderName;
  providerEventId: string;
  eventType: string;
  organizationId: string;
  receivedAt: string;
  occurredAt: string;
  payloadHash: string;
  maskedPayload: Record<string, unknown>;
  processingState: BillingProcessingState;
  correlationId: string;
  version: number;
  error?: string;
  updatedAt: string;
}

export interface RecordEventInput {
  provider: BillingProviderName;
  providerEventId: string;
  eventType: string;
  organizationId: string;
  occurredAt: string;
  rawBody: string | Buffer;
  correlationId: string;
  now?: string;
}

export interface BillingInboxStore {
  recordEvent(input: RecordEventInput): Promise<{ record: BillingInboxRecord; isDuplicate: boolean }>;
  updateProcessingState(inboxKey: string, state: BillingProcessingState, error?: string): Promise<BillingInboxRecord>;
  getEvent(inboxKey: string): Promise<BillingInboxRecord | null>;
  listEvents(organizationId?: string): Promise<readonly BillingInboxRecord[]>;
}

const SENSITIVE_KEY_PATTERNS = [
  /card_?number/i,
  /credit_?card/i,
  /cvv/i,
  /cvc/i,
  /security_?code/i,
  /^pan$/i,
  /primary_?account/i,
  /secret/i,
  /webhook_?secret/i,
  /password/i,
  /api_?key/i,
  /private_?key/i,
  /access_?token/i,
  /token/i,
  /bearer/i,
];

/**
 * Recursively masks sensitive fields (credit card PAN, CVV, passwords, secrets, tokens).
 */
export function maskSensitiveData(input: unknown, depth = 0): unknown {
  if (depth > 20) return '[TRUNCATED]';
  if (input === null || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => maskSensitiveData(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      if (typeof value === 'string' && value.length >= 4 && /card_?number|pan|credit_?card/i.test(key)) {
        result[key] = `**** **** **** ${value.slice(-4)}`;
      } else {
        result[key] = '[REDACTED]';
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = maskSensitiveData(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export class InMemoryBillingInboxStore implements BillingInboxStore {
  private readonly records = new Map<string, BillingInboxRecord>();
  private versionCounter = 1;

  async recordEvent(input: RecordEventInput): Promise<{ record: BillingInboxRecord; isDuplicate: boolean }> {
    const inboxKey = `${input.provider}:${input.providerEventId}`;
    const existing = this.records.get(inboxKey);

    if (existing) {
      return { record: existing, isDuplicate: true };
    }

    const rawString = typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8');
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawString);
    } catch {
      parsedBody = { raw: rawString };
    }

    const masked = maskSensitiveData(parsedBody) as Record<string, unknown>;
    const payloadHash = computeSha256(input.rawBody);
    const now = input.now || new Date().toISOString();

    const record: BillingInboxRecord = {
      inboxKey,
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      organizationId: input.organizationId,
      receivedAt: now,
      occurredAt: input.occurredAt || now,
      payloadHash,
      maskedPayload: masked,
      processingState: 'received',
      correlationId: input.correlationId,
      version: this.versionCounter++,
      updatedAt: now,
    };

    this.records.set(inboxKey, record);
    return { record, isDuplicate: false };
  }

  async updateProcessingState(
    inboxKey: string,
    state: BillingProcessingState,
    error?: string,
  ): Promise<BillingInboxRecord> {
    const existing = this.records.get(inboxKey);
    if (!existing) {
      throw new Error(`Inbox record not found for key: ${inboxKey}`);
    }

    const updated: BillingInboxRecord = {
      ...existing,
      processingState: state,
      error: error || undefined,
      version: this.versionCounter++,
      updatedAt: new Date().toISOString(),
    };

    this.records.set(inboxKey, updated);
    return updated;
  }

  async getEvent(inboxKey: string): Promise<BillingInboxRecord | null> {
    return this.records.get(inboxKey) || null;
  }

  async listEvents(organizationId?: string): Promise<readonly BillingInboxRecord[]> {
    const list = Array.from(this.records.values());
    if (organizationId) {
      return list.filter((r) => r.organizationId === organizationId);
    }
    return list;
  }
}

export class FirestoreBillingInboxStore implements BillingInboxStore {
  private readonly firestore: CommercialFirestore;

  constructor(firestore: CommercialFirestore) {
    this.firestore = firestore;
  }

  async recordEvent(input: RecordEventInput): Promise<{ record: BillingInboxRecord; isDuplicate: boolean }> {
    const inboxKey = `${input.provider}:${input.providerEventId}`;
    const docRef = this.firestore.doc(`billingEvents/${inboxKey}`);

    const rawString = typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8');
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawString);
    } catch {
      parsedBody = { raw: rawString };
    }

    const masked = maskSensitiveData(parsedBody) as Record<string, unknown>;
    const payloadHash = computeSha256(input.rawBody);
    const now = input.now || new Date().toISOString();

    return this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (snapshot.exists) {
        return {
          record: snapshot.data() as unknown as BillingInboxRecord,
          isDuplicate: true,
        };
      }

      const record: BillingInboxRecord = {
        inboxKey,
        provider: input.provider,
        providerEventId: input.providerEventId,
        eventType: input.eventType,
        organizationId: input.organizationId,
        receivedAt: now,
        occurredAt: input.occurredAt || now,
        payloadHash,
        maskedPayload: masked,
        processingState: 'received',
        correlationId: input.correlationId,
        version: 1,
        updatedAt: now,
      };

      transaction.create(docRef, record as unknown as Record<string, unknown>);
      return { record, isDuplicate: false };
    });
  }

  async updateProcessingState(
    inboxKey: string,
    state: BillingProcessingState,
    error?: string,
  ): Promise<BillingInboxRecord> {
    const docRef = this.firestore.doc(`billingEvents/${inboxKey}`);
    const now = new Date().toISOString();

    return this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      if (!snapshot.exists) {
        throw new Error(`Inbox record not found for key: ${inboxKey}`);
      }

      const current = snapshot.data() as unknown as BillingInboxRecord;
      const updated: BillingInboxRecord = {
        ...current,
        processingState: state,
        error: error || undefined,
        version: (current.version || 1) + 1,
        updatedAt: now,
      };

      transaction.set(docRef, updated as unknown as Record<string, unknown>);
      return updated;
    });
  }

  async getEvent(inboxKey: string): Promise<BillingInboxRecord | null> {
    const snapshot = await this.firestore.doc(`billingEvents/${inboxKey}`).get();
    if (!snapshot.exists) return null;
    return snapshot.data() as unknown as BillingInboxRecord;
  }

  async listEvents(organizationId?: string): Promise<readonly BillingInboxRecord[]> {
    if (organizationId) {
      const query = await this.firestore.collection('billingEvents').where('organizationId', '==', organizationId).get();
      return query.docs.map((d) => d.data() as unknown as BillingInboxRecord);
    }
    const query = await this.firestore.collection('billingEvents').get();
    return query.docs.map((d) => d.data() as unknown as BillingInboxRecord);
  }
}
