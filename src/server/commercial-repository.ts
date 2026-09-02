import { createHash } from 'node:crypto';
import type { EntitlementSnapshot, SubscriptionSnapshot } from '../domain/commercial';
import type {
  CommercialRole,
  EntitlementReader,
  MembershipRepository,
  OrganizationMembership,
} from './commercial-access';

export type CommercialDocumentData = Record<string, unknown>;

export interface CommercialDocumentSnapshot {
  readonly exists: boolean;
  readonly id: string;
  readonly ref: CommercialDocumentReference;
  data(): CommercialDocumentData | undefined;
}

export interface CommercialDocumentReference {
  readonly id: string;
  readonly path: string;
  get(): Promise<CommercialDocumentSnapshot>;
  create(data: CommercialDocumentData): Promise<unknown>;
}

export interface CommercialQuerySnapshot {
  readonly docs: readonly CommercialDocumentSnapshot[];
}

export interface CommercialQuery {
  where(field: string, operator: '==', value: unknown): CommercialQuery;
  get(): Promise<CommercialQuerySnapshot>;
}

export interface CommercialCollectionReference extends CommercialQuery {
  readonly path: string;
  doc(id?: string): CommercialDocumentReference;
}

export interface CommercialTransaction {
  get(reference: CommercialDocumentReference): Promise<CommercialDocumentSnapshot>;
  get(query: CommercialQuery): Promise<CommercialQuerySnapshot>;
  create(reference: CommercialDocumentReference, data: CommercialDocumentData): void;
  set(reference: CommercialDocumentReference, data: CommercialDocumentData): void;
  update(reference: CommercialDocumentReference, data: CommercialDocumentData): void;
}

/**
 * Narrow structural boundary implemented by firebase-admin Firestore and by
 * the deterministic in-memory fake used in local tests. This module never
 * initializes the Admin SDK or chooses a Firebase project.
 */
export interface CommercialFirestore {
  doc(path: string): CommercialDocumentReference;
  collection(path: string): CommercialCollectionReference;
  collectionGroup(collectionId: string): CommercialQuery;
  runTransaction<T>(execute: (transaction: CommercialTransaction) => Promise<T>): Promise<T>;
}

export type MembershipKind = 'human' | 'service';
export type MembershipStatus = 'active' | 'inactive';

export type AuditValue = string | number | boolean | null | AuditValue[] | AuditPayload;
export interface AuditPayload {
  readonly [key: string]: AuditValue;
}

export type CommercialRepositoryErrorCode =
  | 'invalid_command'
  | 'organization_exists'
  | 'organization_not_found'
  | 'seat_limit_reached'
  | 'document_not_found'
  | 'corrupt_document';

export class CommercialRepositoryError extends Error {
  readonly code: CommercialRepositoryErrorCode;

  constructor(code: CommercialRepositoryErrorCode, message: string) {
    super(message);
    this.name = 'CommercialRepositoryError';
    this.code = code;
  }
}

interface ServerMutationIdentity {
  organizationId: string;
  actorUid: string;
  correlationId: string;
}

export interface CreateOrganizationCommand extends ServerMutationIdentity {
  displayName: string;
  maxActiveSeats: number;
}

export interface ActivateMembershipCommand extends ServerMutationIdentity {
  uid: string;
  role: CommercialRole;
  kind: MembershipKind;
}

export interface DeactivateMembershipCommand extends ServerMutationIdentity {
  uid: string;
}

export interface SetMaximumActiveSeatsCommand extends ServerMutationIdentity {
  maxActiveSeats: number;
}

export interface WriteSubscriptionCommand extends ServerMutationIdentity {
  subscription: SubscriptionSnapshot;
}

export interface WriteEntitlementsCommand extends ServerMutationIdentity {
  entitlements: EntitlementSnapshot;
}

export interface IncrementUsagePeriodCommand extends ServerMutationIdentity {
  periodId: string;
  aiActions: number;
}

export interface AppendAuditEventCommand extends ServerMutationIdentity {
  type: string;
  payload: AuditPayload;
}

export interface AuditEventReference {
  eventId: string;
  path: string;
}

export interface FirestoreCommercialRepositoryOptions {
  /** Supply FieldValue.serverTimestamp for a real Admin SDK adapter. */
  serverTimestamp(): unknown;
}

export const commercialPaths = {
  organization(organizationId: string): string {
    return `organizations/${pathSegment(organizationId, 'organizationId')}`;
  },
  membership(organizationId: string, uid: string): string {
    return `${commercialPaths.organization(organizationId)}/memberships/${pathSegment(uid, 'uid')}`;
  },
  subscription(organizationId: string): string {
    return `${commercialPaths.organization(organizationId)}/subscriptions/current`;
  },
  entitlement(organizationId: string): string {
    return `${commercialPaths.organization(organizationId)}/entitlements/current`;
  },
  usagePeriod(organizationId: string, periodId: string): string {
    return `${commercialPaths.organization(organizationId)}/usagePeriods/${pathSegment(periodId, 'periodId')}`;
  },
  auditEvents(organizationId: string): string {
    return `${commercialPaths.organization(organizationId)}/auditEvents`;
  },
  auditEvent(organizationId: string, eventId: string): string {
    return `${commercialPaths.auditEvents(organizationId)}/${pathSegment(eventId, 'eventId')}`;
  },
};

/**
 * Commercial persistence is server-owned. Callers provide narrow commands,
 * never arbitrary Firestore documents, and every persisted shape is rebuilt
 * from an allowlist below.
 */
export class FirestoreCommercialRepository implements MembershipRepository, EntitlementReader {
  private readonly firestore: CommercialFirestore;
  private readonly options: FirestoreCommercialRepositoryOptions;

  constructor(firestore: CommercialFirestore, options: FirestoreCommercialRepositoryOptions) {
    this.firestore = firestore;
    this.options = options;
  }

  async createOrganization(command: CreateOrganizationCommand): Promise<void> {
    validateMutationIdentity(command);
    const displayName = requiredText(command.displayName, 'displayName', 160);
    const maxActiveSeats = nonNegativeInteger(command.maxActiveSeats, 'maxActiveSeats');
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    await this.firestore.runTransaction(async (transaction) => {
      const existing = await transaction.get(organization);
      if (existing.exists) {
        throw new CommercialRepositoryError('organization_exists', 'Organization already exists.');
      }

      transaction.create(organization, {
        displayName,
        activeSeats: 0,
        maxActiveSeats,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      this.createAuditInTransaction(transaction, audit, command, 'organization.created', {
        maxActiveSeats,
      }, timestamp);
    });
  }

  async activateMembership(command: ActivateMembershipCommand): Promise<void> {
    validateMutationIdentity(command);
    const uid = pathSegment(command.uid, 'uid');
    const role = commercialRole(command.role);
    const kind = membershipKind(command.kind);
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const membership = this.firestore.doc(commercialPaths.membership(command.organizationId, uid));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    await this.firestore.runTransaction(async (transaction) => {
      const [organizationSnapshot, membershipSnapshot] = await Promise.all([
        transaction.get(organization),
        transaction.get(membership),
      ]);
      const seats = seatState(organizationSnapshot);
      const current = membershipSnapshot.exists ? membershipData(membershipSnapshot) : null;
      const currentConsumesSeat = current?.status === 'active' && current.kind === 'human';
      const nextConsumesSeat = kind === 'human';
      const seatDelta = Number(nextConsumesSeat) - Number(currentConsumesSeat);

      if (seatDelta > 0 && seats.activeSeats >= seats.maxActiveSeats) {
        throw new CommercialRepositoryError(
          'seat_limit_reached',
          `Cannot activate another human membership in ${command.organizationId}.`,
        );
      }

      transaction.set(membership, {
        uid,
        role,
        kind,
        status: 'active',
        createdAt: current?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
      if (seatDelta !== 0) {
        transaction.update(organization, {
          activeSeats: seats.activeSeats + seatDelta,
          updatedAt: timestamp,
        });
      }
      this.createAuditInTransaction(transaction, audit, command, 'membership.activated', {
        membershipUid: uid,
        kind,
        role,
        previousStatus: current?.status ?? null,
      }, timestamp);
    });
  }

  async deactivateMembership(command: DeactivateMembershipCommand): Promise<boolean> {
    validateMutationIdentity(command);
    const uid = pathSegment(command.uid, 'uid');
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const membership = this.firestore.doc(commercialPaths.membership(command.organizationId, uid));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    return this.firestore.runTransaction(async (transaction) => {
      const [organizationSnapshot, membershipSnapshot] = await Promise.all([
        transaction.get(organization),
        transaction.get(membership),
      ]);
      const seats = seatState(organizationSnapshot);
      if (!membershipSnapshot.exists) return false;
      const current = membershipData(membershipSnapshot);
      if (current.status === 'inactive') return false;

      transaction.set(membership, {
        uid,
        role: current.role,
        kind: current.kind,
        status: 'inactive',
        createdAt: current.createdAt,
        updatedAt: timestamp,
      });
      if (current.kind === 'human') {
        transaction.update(organization, {
          activeSeats: Math.max(0, seats.activeSeats - 1),
          updatedAt: timestamp,
        });
      }
      this.createAuditInTransaction(transaction, audit, command, 'membership.deactivated', {
        membershipUid: uid,
        kind: current.kind,
      }, timestamp);
      return true;
    });
  }

  async setMaximumActiveSeats(command: SetMaximumActiveSeatsCommand): Promise<void> {
    validateMutationIdentity(command);
    const maxActiveSeats = nonNegativeInteger(command.maxActiveSeats, 'maxActiveSeats');
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    await this.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(organization);
      const seats = seatState(snapshot);
      transaction.update(organization, { maxActiveSeats, updatedAt: timestamp });
      this.createAuditInTransaction(transaction, audit, command, 'organization.seat_limit_changed', {
        activeSeats: seats.activeSeats,
        previousMaxActiveSeats: seats.maxActiveSeats,
        maxActiveSeats,
      }, timestamp);
    });
  }

  async writeSubscription(command: WriteSubscriptionCommand): Promise<void> {
    validateMutationIdentity(command);
    const subscription = serializeSubscription(command.organizationId, command.subscription);
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const reference = this.firestore.doc(commercialPaths.subscription(command.organizationId));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    await this.firestore.runTransaction(async (transaction) => {
      await requireOrganization(transaction, organization);
      const current = await transaction.get(reference);
      transaction.set(reference, {
        ...subscription,
        createdAt: current.data()?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
      this.createAuditInTransaction(transaction, audit, command, 'subscription.written', {
        subscriptionId: subscription.subscriptionId,
        planId: subscription.planId,
        state: subscription.state,
      }, timestamp);
    });
  }

  async writeEntitlements(command: WriteEntitlementsCommand): Promise<void> {
    validateMutationIdentity(command);
    const entitlements = serializeEntitlements(command.entitlements);
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const reference = this.firestore.doc(commercialPaths.entitlement(command.organizationId));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    await this.firestore.runTransaction(async (transaction) => {
      await requireOrganization(transaction, organization);
      const current = await transaction.get(reference);
      transaction.set(reference, {
        ...entitlements,
        createdAt: current.data()?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
      this.createAuditInTransaction(transaction, audit, command, 'entitlements.written', {
        accessMode: entitlements.accessMode,
        planId: entitlements.planId,
        catalogVersion: entitlements.catalogVersion,
      }, timestamp);
    });
  }

  async incrementUsagePeriod(command: IncrementUsagePeriodCommand): Promise<number> {
    validateMutationIdentity(command);
    const periodId = pathSegment(command.periodId, 'periodId');
    const increment = positiveInteger(command.aiActions, 'aiActions');
    const organization = this.firestore.doc(commercialPaths.organization(command.organizationId));
    const reference = this.firestore.doc(commercialPaths.usagePeriod(command.organizationId, periodId));
    const audit = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();

    return this.firestore.runTransaction(async (transaction) => {
      await requireOrganization(transaction, organization);
      const current = await transaction.get(reference);
      const currentUsed = current.exists
        ? nonNegativeInteger(current.data()?.aiActionsUsed, 'stored aiActionsUsed')
        : 0;
      const aiActionsUsed = currentUsed + increment;
      transaction.set(reference, {
        aiActionsUsed,
        createdAt: current.data()?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });
      this.createAuditInTransaction(transaction, audit, command, 'usage.incremented', {
        periodId,
        aiActions: increment,
        aiActionsUsed,
      }, timestamp);
      return aiActionsUsed;
    });
  }

  async appendAuditEvent(command: AppendAuditEventCommand): Promise<AuditEventReference> {
    validateMutationIdentity(command);
    const type = auditType(command.type);
    const payload = normalizeAuditPayload(command.payload);
    const reference = this.newAuditReference(command.organizationId);
    const timestamp = this.options.serverTimestamp();
    await reference.create(auditDocument(command, type, payload, timestamp));
    return { eventId: reference.id, path: reference.path };
  }

  async readOrganization(organizationId: string): Promise<CommercialDocumentData | null> {
    const snapshot = await this.firestore.doc(commercialPaths.organization(organizationId)).get();
    return snapshot.data() ?? null;
  }

  async readMembership(organizationId: string, uid: string): Promise<CommercialDocumentData | null> {
    const snapshot = await this.firestore.doc(commercialPaths.membership(organizationId, uid)).get();
    return snapshot.data() ?? null;
  }

  async readSubscription(organizationId: string): Promise<CommercialDocumentData | null> {
    const snapshot = await this.firestore.doc(commercialPaths.subscription(organizationId)).get();
    return snapshot.data() ?? null;
  }

  async readEntitlements(organizationId: string): Promise<unknown> {
    const snapshot = await this.firestore.doc(commercialPaths.entitlement(organizationId)).get();
    const data = snapshot.data();
    if (!data) {
      throw new CommercialRepositoryError('document_not_found', 'Entitlement projection does not exist.');
    }
    return data;
  }

  async readUsagePeriod(organizationId: string, periodId: string): Promise<CommercialDocumentData | null> {
    const snapshot = await this.firestore.doc(commercialPaths.usagePeriod(organizationId, periodId)).get();
    return snapshot.data() ?? null;
  }

  async findMembershipsByUid(uidInput: string): Promise<readonly OrganizationMembership[]> {
    const uid = pathSegment(uidInput, 'uid');
    const snapshot = await this.firestore
      .collectionGroup('memberships')
      .where('uid', '==', uid)
      .where('status', '==', 'active')
      .get();

    return snapshot.docs
      .flatMap((document): OrganizationMembership[] => {
        const segments = document.ref.path.split('/');
        const data = document.data();
        if (
          segments.length !== 4 ||
          segments[0] !== 'organizations' ||
          segments[2] !== 'memberships' ||
          segments[3] !== uid ||
          data?.uid !== uid ||
          !isCommercialRole(data.role)
        ) {
          return [];
        }
        return [{ organizationId: segments[1], uid, role: data.role }];
      })
      .sort((left, right) => left.organizationId.localeCompare(right.organizationId));
  }

  private newAuditReference(organizationId: string): CommercialDocumentReference {
    pathSegment(organizationId, 'organizationId');
    return this.firestore.collection(commercialPaths.auditEvents(organizationId)).doc();
  }

  private createAuditInTransaction(
    transaction: CommercialTransaction,
    reference: CommercialDocumentReference,
    command: ServerMutationIdentity,
    type: string,
    payload: AuditPayload,
    timestamp: unknown,
  ): void {
    transaction.create(reference, auditDocument(command, type, normalizeAuditPayload(payload), timestamp));
  }
}

async function requireOrganization(
  transaction: CommercialTransaction,
  reference: CommercialDocumentReference,
): Promise<CommercialDocumentSnapshot> {
  const snapshot = await transaction.get(reference);
  if (!snapshot.exists) {
    throw new CommercialRepositoryError('organization_not_found', 'Organization does not exist.');
  }
  return snapshot;
}

function seatState(snapshot: CommercialDocumentSnapshot): { activeSeats: number; maxActiveSeats: number } {
  if (!snapshot.exists) {
    throw new CommercialRepositoryError('organization_not_found', 'Organization does not exist.');
  }
  try {
    return {
      activeSeats: nonNegativeInteger(snapshot.data()?.activeSeats, 'stored activeSeats'),
      maxActiveSeats: nonNegativeInteger(snapshot.data()?.maxActiveSeats, 'stored maxActiveSeats'),
    };
  } catch {
    throw new CommercialRepositoryError('corrupt_document', 'Organization seat counters are invalid.');
  }
}

function membershipData(snapshot: CommercialDocumentSnapshot): {
  role: CommercialRole;
  kind: MembershipKind;
  status: MembershipStatus;
  createdAt: unknown;
} {
  const data = snapshot.data();
  if (!data || !isCommercialRole(data.role) || !isMembershipKind(data.kind) || !isMembershipStatus(data.status)) {
    throw new CommercialRepositoryError('corrupt_document', 'Membership document is invalid.');
  }
  return { role: data.role, kind: data.kind, status: data.status, createdAt: data.createdAt };
}

function serializeSubscription(
  organizationId: string,
  subscription: SubscriptionSnapshot,
): CommercialDocumentData & { subscriptionId: string; planId: string; state: string } {
  const output: CommercialDocumentData & { subscriptionId: string; planId: string; state: string } = {
    subscriptionId: requiredText(subscription.subscriptionId, 'subscriptionId', 160),
    workspaceId: pathSegment(organizationId, 'organizationId'),
    planId: requiredText(subscription.planId, 'planId', 160),
    state: subscriptionState(subscription.state),
    startedAt: isoTimestamp(subscription.startedAt, 'startedAt'),
  };
  copyOptionalTimestamp(output, 'trialEndsAt', subscription.trialEndsAt);
  copyOptionalTimestamp(output, 'currentPeriodEndsAt', subscription.currentPeriodEndsAt);
  copyOptionalTimestamp(output, 'canceledAt', subscription.canceledAt);
  if (subscription.scheduledPlanChange) {
    output.scheduledPlanChange = {
      planId: requiredText(subscription.scheduledPlanChange.planId, 'scheduledPlanChange.planId', 160),
      effectiveAt: isoTimestamp(subscription.scheduledPlanChange.effectiveAt, 'scheduledPlanChange.effectiveAt'),
    };
  }
  return output;
}

function serializeEntitlements(entitlements: EntitlementSnapshot): CommercialDocumentData & {
  accessMode: string;
  planId: string | null;
  catalogVersion: string;
} {
  const accessMode = entitlements.accessMode;
  if (accessMode !== 'full' && accessMode !== 'read_only' && accessMode !== 'blocked') {
    throw invalidCommand('entitlements.accessMode is invalid.');
  }
  return {
    accessMode,
    planId: entitlements.planId === null ? null : requiredText(entitlements.planId, 'entitlements.planId', 160),
    catalogVersion: requiredText(entitlements.catalogVersion, 'entitlements.catalogVersion', 160),
    seats: {
      assignedSeats: nonNegativeInteger(entitlements.seats.assignedSeats, 'entitlements.seats.assignedSeats'),
      maxSeats: nonNegativeInteger(entitlements.seats.maxSeats, 'entitlements.seats.maxSeats'),
      availableSeats: nonNegativeInteger(entitlements.seats.availableSeats, 'entitlements.seats.availableSeats'),
      isAtOrOverLimit: Boolean(entitlements.seats.isAtOrOverLimit),
      canAssignSeat: Boolean(entitlements.seats.canAssignSeat),
    },
    ai: {
      usedActions: nonNegativeInteger(entitlements.ai.usedActions, 'entitlements.ai.usedActions'),
      maxActionsPerMonth: nonNegativeInteger(entitlements.ai.maxActionsPerMonth, 'entitlements.ai.maxActionsPerMonth'),
      remainingActions: nonNegativeInteger(entitlements.ai.remainingActions, 'entitlements.ai.remainingActions'),
      canUseAction: Boolean(entitlements.ai.canUseAction),
    },
  };
}

function auditDocument(
  command: ServerMutationIdentity,
  typeInput: string,
  payload: AuditPayload,
  timestamp: unknown,
): CommercialDocumentData {
  const type = auditType(typeInput);
  return {
    type,
    actorUid: pathSegment(command.actorUid, 'actorUid'),
    correlationId: requiredText(command.correlationId, 'correlationId', 160),
    payload,
    payloadHash: `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`,
    occurredAt: timestamp,
  };
}

function normalizeAuditPayload(input: AuditPayload): AuditPayload {
  const normalized = normalizeAuditObject(input, 0);
  if (Buffer.byteLength(stableJson(normalized), 'utf8') > 4096) {
    throw invalidCommand('audit payload must be at most 4096 bytes.');
  }
  return normalized;
}

function normalizeAuditObject(input: AuditPayload, depth: number): AuditPayload {
  if (depth > 4 || typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw invalidCommand('audit payload must be a shallow JSON object.');
  }
  return Object.fromEntries(
    Object.keys(input)
      .sort()
      .map((key) => [requiredText(key, 'audit payload key', 80), normalizeAuditValue(input[key], depth + 1)]),
  );
}

function normalizeAuditValue(value: AuditValue, depth: number): AuditValue {
  if (depth > 4) throw invalidCommand('audit payload nesting is too deep.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw invalidCommand('audit payload numbers must be finite.');
    return value;
  }
  if (Array.isArray(value)) return value.map((entry) => normalizeAuditValue(entry, depth + 1));
  return normalizeAuditObject(value, depth);
}

function stableJson(value: AuditValue): string {
  return JSON.stringify(value);
}

function validateMutationIdentity(command: ServerMutationIdentity): void {
  pathSegment(command.organizationId, 'organizationId');
  pathSegment(command.actorUid, 'actorUid');
  requiredText(command.correlationId, 'correlationId', 160);
}

function pathSegment(value: unknown, field: string): string {
  const normalized = requiredText(value, field, 160);
  if (normalized === '.' || normalized === '..' || normalized.includes('/')) {
    throw invalidCommand(`${field} must be a single Firestore path segment.`);
  }
  return normalized;
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
    throw invalidCommand(`${field} must be a non-empty string with at most ${maxLength} characters.`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw invalidCommand(`${field} must be a non-negative safe integer.`);
  }
  return value;
}

function positiveInteger(value: unknown, field: string): number {
  const normalized = nonNegativeInteger(value, field);
  if (normalized === 0) throw invalidCommand(`${field} must be greater than zero.`);
  return normalized;
}

function commercialRole(value: unknown): CommercialRole {
  if (!isCommercialRole(value)) throw invalidCommand('role is invalid.');
  return value;
}

function isCommercialRole(value: unknown): value is CommercialRole {
  return value === 'member' || value === 'admin' || value === 'billing_admin';
}

function membershipKind(value: unknown): MembershipKind {
  if (!isMembershipKind(value)) throw invalidCommand('membership kind is invalid.');
  return value;
}

function isMembershipKind(value: unknown): value is MembershipKind {
  return value === 'human' || value === 'service';
}

function isMembershipStatus(value: unknown): value is MembershipStatus {
  return value === 'active' || value === 'inactive';
}

function subscriptionState(value: unknown): string {
  if (
    value !== 'trialing' &&
    value !== 'active' &&
    value !== 'payment_pending' &&
    value !== 'canceled' &&
    value !== 'expired'
  ) {
    throw invalidCommand('subscription.state is invalid.');
  }
  return value;
}

function isoTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw invalidCommand(`${field} must be a valid ISO timestamp.`);
  }
  return value;
}

function copyOptionalTimestamp(
  target: CommercialDocumentData,
  field: string,
  value: string | undefined,
): void {
  if (value !== undefined) target[field] = isoTimestamp(value, field);
}

function auditType(value: unknown): string {
  const normalized = requiredText(value, 'audit type', 80);
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(normalized)) {
    throw invalidCommand('audit type must be a lowercase namespaced identifier.');
  }
  return normalized;
}

function invalidCommand(message: string): CommercialRepositoryError {
  return new CommercialRepositoryError('invalid_command', message);
}
