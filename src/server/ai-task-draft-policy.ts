import { createHash } from 'node:crypto';

export const TASK_DRAFT_OPERATION_KEY = 'task_draft' as const;
export const TASK_DRAFT_MODEL = 'gemini-2.5-flash' as const;
export const TASK_DRAFT_DESCRIPTION_MAX_LENGTH = 2_000;
export const TASK_DRAFT_MAX_OUTPUT_TOKENS = 600;

export interface TaskDraft {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress';
  checklist: string[];
}

export type TaskDraftBodyResult =
  | { ok: true; description: string }
  | { ok: false; error: 'invalid_request' | 'description_required' | 'description_too_long' };

export function parseTaskDraftBody(body: unknown): TaskDraftBodyResult {
  if (!isRecord(body) || Object.keys(body).some((key) => key !== 'description')) {
    return { ok: false, error: 'invalid_request' };
  }
  if (typeof body.description !== 'string' || body.description.trim().length === 0) {
    return { ok: false, error: 'description_required' };
  }
  if (body.description.length > TASK_DRAFT_DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: 'description_too_long' };
  }
  return { ok: true, description: body.description.trim() };
}

export function validateIdempotencyKey(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 200 && !/[\r\n]/.test(value);
}

export function hashTaskDraftBody(description: string): string {
  return sha256(JSON.stringify({ description }));
}

export function hashIdempotencyFingerprint(input: {
  organizationId: string;
  uid: string;
  idempotencyKey: string;
}): string {
  return sha256(JSON.stringify([
    input.organizationId,
    input.uid,
    TASK_DRAFT_OPERATION_KEY,
    input.idempotencyKey,
  ]));
}

export function hashTaskDraftResult(draft: TaskDraft): string {
  return sha256(JSON.stringify(draft));
}

export function isTaskDraft(value: unknown): value is TaskDraft {
  if (!isRecord(value)) return false;
  if (
    typeof value.title !== 'string' ||
    value.title.trim().length === 0 ||
    value.title.length > 160 ||
    typeof value.description !== 'string' ||
    value.description.length > 4_000 ||
    (value.priority !== 'low' && value.priority !== 'medium' && value.priority !== 'high') ||
    (value.status !== 'todo' && value.status !== 'in_progress') ||
    !Array.isArray(value.checklist) ||
    value.checklist.length > 8
  ) {
    return false;
  }
  return value.checklist.every(
    (item) => typeof item === 'string' && item.trim().length > 0 && item.length <= 240,
  );
}

function sha256(value: string): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
