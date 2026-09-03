import { Router, type Response } from 'express';
import { parseTaskDraftBody, validateIdempotencyKey } from './ai-task-draft-policy';
import type { AiTaskDraftService, AiTaskDraftServiceResult } from './ai-task-draft-service';
import type { TokenVerificationResult, TokenVerifier } from './commercial-access';

export interface AiTaskDraftRouterDependencies {
  verifier: TokenVerifier;
  service: AiTaskDraftService;
}

export function createAiTaskDraftRouter(dependencies: AiTaskDraftRouterDependencies): Router {
  const router = Router();

  router.post('/api/organizations/:orgId/ai/task-drafts', async (request, response) => {
    const authorization = request.header('authorization');
    const token = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!token) {
      response.status(401).json({ error: 'authentication_required' });
      return;
    }

    let verification: TokenVerificationResult;
    try {
      verification = await dependencies.verifier.verifyIdToken(token);
    } catch {
      verification = { ok: false, reason: 'unavailable' };
    }
    if (!verification.ok) {
      response.status(verification.reason === 'unavailable' ? 503 : 401).json({
        error: verification.reason === 'unavailable' ? 'authentication_unavailable' : 'invalid_token',
      });
      return;
    }

    const idempotencyKey = request.header('idempotency-key');
    if (!validateIdempotencyKey(idempotencyKey)) {
      response.status(400).json({ error: 'idempotency_key_required' });
      return;
    }

    const body = parseTaskDraftBody(request.body);
    if (!body.ok) {
      response.status(400).json({ error: body.error });
      return;
    }

    try {
      const result = await dependencies.service.generate({
        organizationId: request.params.orgId,
        uid: verification.identity.uid,
        idempotencyKey,
        description: body.description,
      });
      respond(response, result);
    } catch {
      // Deliberately avoid logging request, token, provider response or error payload.
      response.status(503).json({ error: 'ai_unavailable' });
    }
  });

  return router;
}

function respond(response: Response, result: AiTaskDraftServiceResult): void {
  switch (result.kind) {
    case 'succeeded':
      response.json({ operationId: result.operationId, status: 'succeeded', draft: result.draft });
      return;
    case 'forbidden':
      response.status(403).json({ error: 'organization_forbidden' });
      return;
    case 'blocked':
      response.status(result.reason === 'entitlement' ? 403 : 429).json({
        error: result.reason === 'entitlement' ? 'ai_not_entitled' : 'ai_limit_exceeded',
        reason: result.reason,
      });
      return;
    case 'conflict':
      response.status(409).json({ error: 'idempotency_conflict', operationId: result.operationId });
      return;
    case 'pending':
      response.status(202).json({ operationId: result.operationId, status: 'pending' });
      return;
    case 'unknown':
      response.status(202).json({
        operationId: result.operationId,
        status: 'unknown',
        error: 'ai_result_unknown',
      });
      return;
    case 'failed':
      response.status(503).json({
        operationId: result.operationId,
        status: 'failed',
        error: 'ai_unavailable',
      });
  }
}
