import type { Express } from 'express';
import { FirebaseAdminTokenVerifier } from './commercial-access';
import { createAiTaskDraftRouter } from './ai-task-draft-router';
import {
  AiTaskDraftService,
  createUnavailableAiOperationResultStore,
} from './ai-task-draft-service';
import { createUnavailableAiUsageLedger } from './ai-usage-ledger';
import { GoogleGeminiTaskDraftClient } from './gemini-task-draft-client';

export function mountAiTaskDraftRouter(app: Express): void {
  app.use(createAiTaskDraftRouter({
    verifier: new FirebaseAdminTokenVerifier(),
    service: new AiTaskDraftService({
      ledger: createUnavailableAiUsageLedger(),
      results: createUnavailableAiOperationResultStore(),
      client: new GoogleGeminiTaskDraftClient({ apiKey: process.env.GEMINI_API_KEY }),
    }),
  }));
}
