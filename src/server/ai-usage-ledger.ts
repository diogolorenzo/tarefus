import { randomUUID } from 'node:crypto';

export type AiOperationKey = 'task_draft';
export type AiOperationStatus = 'reserved' | 'succeeded' | 'failed' | 'unknown';
export type AiBlockReason = 'actions' | 'cost' | 'rate' | 'concurrency' | 'entitlement';

export interface AiEntitlementSnapshot {
  accessMode: 'full' | 'read_only' | 'blocked';
  ai: {
    usedActions: number;
    maxActionsPerMonth: number;
    remainingActions: number;
    canUseAction: boolean;
  };
}

export interface AiPolicySnapshot {
  periodId: string;
  maxCostMicrounitsPerPeriod: number;
  maxOperationsPerWindow: number;
  rateWindowMs: number;
  maxConcurrentOperations: number;
  taskDraftWorstCaseCostMicrounits: number;
}

export interface AiOperationMetadata {
  operationId: string;
  organizationId: string;
  uid: string;
  operationKey: AiOperationKey;
  idempotencyFingerprint: string;
  bodyHash: string;
  periodId: string;
  status: AiOperationStatus;
  reservedCostMicrounits: number;
  actualCostMicrounits?: number;
  inputTokens?: number;
  outputTokens?: number;
  resultHash?: string;
  failureCode?: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface ReserveAiOperationCommand {
  organizationId: string;
  uid: string;
  operationKey: AiOperationKey;
  idempotencyFingerprint: string;
  bodyHash: string;
  nowMs: number;
}

export type ReserveAiOperationResult =
  | { kind: 'reserved'; operation: AiOperationMetadata }
  | { kind: 'replay'; operation: AiOperationMetadata }
  | { kind: 'conflict'; operationId: string }
  | { kind: 'forbidden' }
  | { kind: 'blocked'; reason: AiBlockReason };

export interface SettleAiOperationCommand {
  operationId: string;
  actualCostMicrounits: number;
  inputTokens: number;
  outputTokens: number;
  resultHash: string;
  nowMs: number;
}

export interface FinishAiOperationCommand {
  operationId: string;
  failureCode: string;
  nowMs: number;
}

export interface AiUsageLedger {
  reserve(command: ReserveAiOperationCommand): Promise<ReserveAiOperationResult>;
  settle(command: SettleAiOperationCommand): Promise<void>;
  releaseBeforeProvider(command: FinishAiOperationCommand): Promise<void>;
  markUnknown(command: FinishAiOperationCommand): Promise<void>;
}

export interface InMemoryAiOrganizationState {
  memberships: readonly string[];
  entitlement: AiEntitlementSnapshot;
  policy: AiPolicySnapshot;
  usedCostMicrounits?: number;
}

export interface InMemoryAiUsageLedgerOptions {
  organizations: Record<string, InMemoryAiOrganizationState>;
  operationId?: () => string;
}

export interface AiLedgerSnapshot {
  operations: readonly AiOperationMetadata[];
  totalsByOrganization: Record<string, {
    confirmedActions: number;
    confirmedCostMicrounits: number;
    reservedActions: number;
    reservedCostMicrounits: number;
  }>;
}

/**
 * Deterministic transactional fake for tests. Production composition must use
 * a durable, server-owned implementation and never this in-memory ledger.
 */
export class InMemoryAiUsageLedger implements AiUsageLedger {
  private readonly organizations: ReadonlyMap<string, InMemoryAiOrganizationState>;
  private readonly operations = new Map<string, AiOperationMetadata>();
  private readonly operationIdsByFingerprint = new Map<string, string>();
  private readonly createOperationId: () => string;
  private transactionTail: Promise<void> = Promise.resolve();

  constructor(options: InMemoryAiUsageLedgerOptions) {
    this.organizations = new Map(
      Object.entries(options.organizations).map(([organizationId, state]) => [
        organizationId,
        structuredClone(state),
      ]),
    );
    this.createOperationId = options.operationId ?? randomUUID;
  }

  async reserve(command: ReserveAiOperationCommand): Promise<ReserveAiOperationResult> {
    return this.inTransaction(() => {
      validateReserveCommand(command);
      const priorId = this.operationIdsByFingerprint.get(command.idempotencyFingerprint);
      if (priorId) {
        const prior = requireOperation(this.operations, priorId);
        return prior.bodyHash === command.bodyHash
          ? { kind: 'replay', operation: cloneOperation(prior) }
          : { kind: 'conflict', operationId: prior.operationId };
      }

      const organization = this.organizations.get(command.organizationId);
      if (!organization || !organization.memberships.includes(command.uid)) {
        return { kind: 'forbidden' };
      }

      const { entitlement, policy } = organization;
      validateOrganizationState(organization);
      if (entitlement.accessMode !== 'full') {
        return { kind: 'blocked', reason: 'entitlement' };
      }

      const organizationOperations = [...this.operations.values()].filter(
        (operation) =>
          operation.organizationId === command.organizationId && operation.periodId === policy.periodId,
      );
      const consumingOperations = organizationOperations.filter(
        (operation) => operation.status !== 'failed',
      );
      if (consumingOperations.length >= entitlement.ai.remainingActions) {
        return { kind: 'blocked', reason: 'actions' };
      }
      if (!entitlement.ai.canUseAction) {
        return { kind: 'blocked', reason: 'entitlement' };
      }

      const committedCost = organizationOperations.reduce(
        (total, operation) =>
          total + (operation.status === 'succeeded' ? operation.actualCostMicrounits ?? 0 : 0),
        organization.usedCostMicrounits ?? 0,
      );
      const reservedCost = organizationOperations.reduce(
        (total, operation) =>
          total + (operation.status === 'reserved' || operation.status === 'unknown'
            ? operation.reservedCostMicrounits
            : 0),
        0,
      );
      if (
        committedCost + reservedCost + policy.taskDraftWorstCaseCostMicrounits >
        policy.maxCostMicrounitsPerPeriod
      ) {
        return { kind: 'blocked', reason: 'cost' };
      }

      const rateWindowStart = command.nowMs - policy.rateWindowMs;
      const operationsInWindow = organizationOperations.filter(
        (operation) => operation.createdAtMs > rateWindowStart && operation.createdAtMs <= command.nowMs,
      ).length;
      if (operationsInWindow >= policy.maxOperationsPerWindow) {
        return { kind: 'blocked', reason: 'rate' };
      }

      const concurrentOperations = organizationOperations.filter(
        (operation) => operation.status === 'reserved',
      ).length;
      if (concurrentOperations >= policy.maxConcurrentOperations) {
        return { kind: 'blocked', reason: 'concurrency' };
      }

      const operation: AiOperationMetadata = {
        operationId: this.createOperationId(),
        organizationId: command.organizationId,
        uid: command.uid,
        operationKey: command.operationKey,
        idempotencyFingerprint: command.idempotencyFingerprint,
        bodyHash: command.bodyHash,
        periodId: policy.periodId,
        status: 'reserved',
        reservedCostMicrounits: policy.taskDraftWorstCaseCostMicrounits,
        createdAtMs: command.nowMs,
        updatedAtMs: command.nowMs,
      };
      this.operations.set(operation.operationId, operation);
      this.operationIdsByFingerprint.set(operation.idempotencyFingerprint, operation.operationId);
      return { kind: 'reserved', operation: cloneOperation(operation) };
    });
  }

  async settle(command: SettleAiOperationCommand): Promise<void> {
    await this.inTransaction(() => {
      validateFinishTime(command.nowMs);
      validateHash(command.resultHash, 'resultHash');
      const operation = requireReservedOperation(this.operations, command.operationId);
      const actualCost = nonNegativeInteger(command.actualCostMicrounits, 'actualCostMicrounits');
      if (actualCost > operation.reservedCostMicrounits) {
        throw new Error('actualCostMicrounits exceeds the reserved worst-case cost');
      }
      operation.status = 'succeeded';
      operation.actualCostMicrounits = actualCost;
      operation.inputTokens = nonNegativeInteger(command.inputTokens, 'inputTokens');
      operation.outputTokens = nonNegativeInteger(command.outputTokens, 'outputTokens');
      operation.resultHash = command.resultHash;
      operation.updatedAtMs = command.nowMs;
    });
  }

  async releaseBeforeProvider(command: FinishAiOperationCommand): Promise<void> {
    await this.inTransaction(() => {
      const operation = requireReservedOperation(this.operations, command.operationId);
      operation.status = 'failed';
      operation.failureCode = boundedCode(command.failureCode);
      operation.updatedAtMs = validateFinishTime(command.nowMs);
    });
  }

  async markUnknown(command: FinishAiOperationCommand): Promise<void> {
    await this.inTransaction(() => {
      const operation = requireReservedOperation(this.operations, command.operationId);
      operation.status = 'unknown';
      operation.failureCode = boundedCode(command.failureCode);
      operation.updatedAtMs = validateFinishTime(command.nowMs);
    });
  }

  snapshot(): AiLedgerSnapshot {
    const operations = [...this.operations.values()].map(cloneOperation);
    const totalsByOrganization: AiLedgerSnapshot['totalsByOrganization'] = {};
    for (const organizationId of this.organizations.keys()) {
      const relevant = operations.filter((operation) => operation.organizationId === organizationId);
      totalsByOrganization[organizationId] = {
        confirmedActions: relevant.filter((operation) => operation.status === 'succeeded').length,
        confirmedCostMicrounits: relevant.reduce(
          (total, operation) => total + (operation.status === 'succeeded' ? operation.actualCostMicrounits ?? 0 : 0),
          0,
        ),
        reservedActions: relevant.filter(
          (operation) => operation.status === 'reserved' || operation.status === 'unknown',
        ).length,
        reservedCostMicrounits: relevant.reduce(
          (total, operation) =>
            total + (operation.status === 'reserved' || operation.status === 'unknown'
              ? operation.reservedCostMicrounits
              : 0),
          0,
        ),
      };
    }
    return { operations, totalsByOrganization };
  }

  private async inTransaction<T>(execute: () => T | Promise<T>): Promise<T> {
    let release: (() => void) | undefined;
    const previous = this.transactionTail;
    this.transactionTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await execute();
    } finally {
      release?.();
    }
  }
}

export class AiUsageLedgerUnavailableError extends Error {
  constructor() {
    super('A durable server-owned AI usage ledger is not configured');
    this.name = 'AiUsageLedgerUnavailableError';
  }
}

export function createUnavailableAiUsageLedger(): AiUsageLedger {
  const unavailable = async (): Promise<never> => {
    throw new AiUsageLedgerUnavailableError();
  };
  return {
    reserve: unavailable,
    settle: unavailable,
    releaseBeforeProvider: unavailable,
    markUnknown: unavailable,
  };
}

function validateReserveCommand(command: ReserveAiOperationCommand): void {
  boundedIdentifier(command.organizationId, 'organizationId');
  boundedIdentifier(command.uid, 'uid');
  if (command.operationKey !== 'task_draft') throw new Error('operationKey is not allowed');
  validateHash(command.idempotencyFingerprint, 'idempotencyFingerprint');
  validateHash(command.bodyHash, 'bodyHash');
  validateFinishTime(command.nowMs);
}

function validateOrganizationState(organization: InMemoryAiOrganizationState): void {
  const { entitlement, policy } = organization;
  nonNegativeInteger(entitlement.ai.usedActions, 'entitlement.ai.usedActions');
  nonNegativeInteger(entitlement.ai.maxActionsPerMonth, 'entitlement.ai.maxActionsPerMonth');
  nonNegativeInteger(entitlement.ai.remainingActions, 'entitlement.ai.remainingActions');
  nonNegativeInteger(organization.usedCostMicrounits ?? 0, 'usedCostMicrounits');
  positiveInteger(policy.maxCostMicrounitsPerPeriod, 'policy.maxCostMicrounitsPerPeriod');
  positiveInteger(policy.maxOperationsPerWindow, 'policy.maxOperationsPerWindow');
  positiveInteger(policy.rateWindowMs, 'policy.rateWindowMs');
  positiveInteger(policy.maxConcurrentOperations, 'policy.maxConcurrentOperations');
  positiveInteger(policy.taskDraftWorstCaseCostMicrounits, 'policy.taskDraftWorstCaseCostMicrounits');
  boundedIdentifier(policy.periodId, 'policy.periodId');
}

function requireReservedOperation(
  operations: ReadonlyMap<string, AiOperationMetadata>,
  operationId: string,
): AiOperationMetadata {
  const operation = requireOperation(operations, operationId);
  if (operation.status !== 'reserved') throw new Error('AI operation is not reserved');
  return operation;
}

function requireOperation(
  operations: ReadonlyMap<string, AiOperationMetadata>,
  operationId: string,
): AiOperationMetadata {
  const operation = operations.get(operationId);
  if (!operation) throw new Error('AI operation does not exist');
  return operation;
}

function cloneOperation(operation: AiOperationMetadata): AiOperationMetadata {
  return { ...operation };
}

function validateHash(value: string, field: string): void {
  if (!/^sha256:[a-f0-9]{64}$/.test(value)) throw new Error(`${field} must be a SHA-256 digest`);
}

function boundedIdentifier(value: string, field: string): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 160 || value.includes('/')) {
    throw new Error(`${field} must be a bounded identifier`);
  }
  return value;
}

function boundedCode(value: string): string {
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(value) || value.length > 80) {
    throw new Error('failureCode must be a bounded machine code');
  }
  return value;
}

function validateFinishTime(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('nowMs must be a non-negative safe integer');
  return value;
}

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${field} must be a non-negative safe integer`);
  return value;
}

function positiveInteger(value: number, field: string): number {
  const normalized = nonNegativeInteger(value, field);
  if (normalized === 0) throw new Error(`${field} must be greater than zero`);
  return normalized;
}
