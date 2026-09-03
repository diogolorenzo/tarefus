import { Router } from 'express';

export function createRetiredLegacyAiRouter(): Router {
  const router = Router();
  router.post('/api/generate-task-draft', (_request, response) => {
    response.status(410).json({
      error: 'legacy_ai_route_removed',
      replacement: '/api/organizations/:orgId/ai/task-drafts',
    });
  });
  return router;
}
