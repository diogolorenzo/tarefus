import {
  hashIdempotencyFingerprint,
  hashTaskDraftBody,
  hashTaskDraftResult,
  TASK_DRAFT_OPERATION_KEY,
  type TaskDraft,
} from './ai-task-draft-policy';
import type { AiOperationMetadata, AiUsageLedger } from './ai-usage-ledger';
import type { GeminiTaskDraftClient } from './gemini-task-draft-client';

export type AiTaskDraftServiceResult =
  | { kind: 'succeeded'; operationId: string; draft: TaskDraft }
  | { kind: 'blocked'; reason: 'actions' | 'cost' | 'rate' | 'concurrency' | 'entitlement' }
  | { kind: 'forbidden' }
  | { kind: 'conflict'; operationId: string }
  | { kind: 'pending'; operationId: string }
  | { kind: 'failed'; operationId: string; errorCode: string }
  | { kind: 'unknown'; operationId: string; errorCode: string };

export interface AiOperationResultStore {
  read(operationId: string): Promise<Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }> | null>;
  write(result: Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }>): Promise<void>;
}

export interface AiTaskDraftServiceDependencies {
  ledger: AiUsageLedger;
  client: GeminiTaskDraftClient;
  results: AiOperationResultStore;
  now?: () => number;
}

export interface GenerateTaskDraftCommand {
  organizationId: string;
  uid: string;
  idempotencyKey: string;
  description: string;
}

export class AiTaskDraftService {
  private readonly now: () => number;

  constructor(private readonly dependencies: AiTaskDraftServiceDependencies) {
    this.now = dependencies.now ?? Date.now;
  }

  async generate(command: GenerateTaskDraftCommand): Promise<AiTaskDraftServiceResult> {
    const reservation = await this.dependencies.ledger.reserve({
      organizationId: command.organizationId,
      uid: command.uid,
      operationKey: TASK_DRAFT_OPERATION_KEY,
      idempotencyFingerprint: hashIdempotencyFingerprint(command),
      bodyHash: hashTaskDraftBody(command.description),
      nowMs: this.now(),
    });

    if (reservation.kind === 'replay') return this.replay(reservation.operation);
    if (reservation.kind !== 'reserved') return reservation;

    const operationId = reservation.operation.operationId;
    let providerResult;
    try {
      providerResult = await this.dependencies.client.generateTaskDraft({
        description: command.description,
      });
    } catch {
      await this.dependencies.ledger.markUnknown({
        operationId,
        failureCode: 'provider_ambiguous_error',
        nowMs: this.now(),
      });
      return { kind: 'unknown', operationId, errorCode: 'provider_ambiguous_error' };
    }

    if (providerResult.kind === 'rejected_before_send') {
      await this.dependencies.ledger.releaseBeforeProvider({
        operationId,
        failureCode: providerResult.errorCode,
        nowMs: this.now(),
      });
      return { kind: 'failed', operationId, errorCode: providerResult.errorCode };
    }
    if (providerResult.kind === 'unknown') {
      await this.dependencies.ledger.markUnknown({
        operationId,
        failureCode: providerResult.errorCode,
        nowMs: this.now(),
      });
      return { kind: 'unknown', operationId, errorCode: providerResult.errorCode };
    }

    const result: Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }> = {
      kind: 'succeeded',
      operationId,
      draft: structuredClone(providerResult.draft),
    };
    try {
      await this.dependencies.results.write(result);
      await this.dependencies.ledger.settle({
        operationId,
        actualCostMicrounits: providerResult.usage.costMicrounits,
        inputTokens: providerResult.usage.inputTokens,
        outputTokens: providerResult.usage.outputTokens,
        resultHash: hashTaskDraftResult(providerResult.draft),
        nowMs: this.now(),
      });
      return result;
    } catch {
      await this.dependencies.ledger.markUnknown({
        operationId,
        failureCode: 'settlement_ambiguous',
        nowMs: this.now(),
      });
      return { kind: 'unknown', operationId, errorCode: 'settlement_ambiguous' };
    }
  }

  private async replay(operation: AiOperationMetadata): Promise<AiTaskDraftServiceResult> {
    if (operation.status === 'succeeded') {
      const stored = await this.dependencies.results.read(operation.operationId);
      if (!stored) return { kind: 'unknown', operationId: operation.operationId, errorCode: 'result_unavailable' };
      return stored;
    }
    if (operation.status === 'failed') {
      return {
        kind: 'failed',
        operationId: operation.operationId,
        errorCode: operation.failureCode ?? 'provider_unavailable',
      };
    }
    if (operation.status === 'unknown') {
      return {
        kind: 'unknown',
        operationId: operation.operationId,
        errorCode: operation.failureCode ?? 'provider_ambiguous_error',
      };
    }
    return { kind: 'pending', operationId: operation.operationId };
  }
}

/** Test fake only; default server composition deliberately does not use it. */
export class InMemoryAiOperationResultStore implements AiOperationResultStore {
  private readonly values = new Map<string, Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }>>();

  async read(operationId: string): Promise<Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }> | null> {
    const result = this.values.get(operationId);
    return result ? structuredClone(result) : null;
  }

  async write(result: Extract<AiTaskDraftServiceResult, { kind: 'succeeded' }>): Promise<void> {
    this.values.set(result.operationId, structuredClone(result));
  }
}

export function createUnavailableAiOperationResultStore(): AiOperationResultStore {
  const unavailable = async (): Promise<never> => {
    throw new Error('A durable server-owned AI result store is not configured');
  };
  return { read: unavailable, write: unavailable };
}
