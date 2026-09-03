import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import express, { type Express } from 'express';
import { InMemoryAiUsageLedger } from '../src/server/ai-usage-ledger';
import { createAiTaskDraftRouter } from '../src/server/ai-task-draft-router';
import { mountAiTaskDraftRouter } from '../src/server/ai-task-draft-default';
import {
  AiTaskDraftService,
  InMemoryAiOperationResultStore,
} from '../src/server/ai-task-draft-service';
import { createRetiredLegacyAiRouter } from '../src/server/legacy-ai-router';
import type {
  GeminiTaskDraftClient,
  GeminiTaskDraftClientResult,
} from '../src/server/gemini-task-draft-client';
import type { TokenVerifier } from '../src/server/commercial-access';

interface TestResult {
  name: string;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, execute: () => Promise<void>): Promise<void> {
  try {
    await execute();
    results.push({ name });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

class FakeGeminiClient implements GeminiTaskDraftClient {
  calls = 0;

  async generateTaskDraft(): Promise<GeminiTaskDraftClientResult> {
    this.calls += 1;
    return {
      kind: 'success',
      draft: {
        title: 'Preparar proposta',
        description: 'Preparar proposta para o cliente.',
        priority: 'medium',
        status: 'todo',
        checklist: ['Reunir requisitos'],
      },
      usage: { inputTokens: 10, outputTokens: 20, costMicrounits: 50 },
    };
  }
}

function protectedRouter(input: {
  verifier?: TokenVerifier;
  client?: FakeGeminiClient;
} = {}) {
  const client = input.client ?? new FakeGeminiClient();
  const ledger = new InMemoryAiUsageLedger({
    organizations: {
      'org-a': {
        memberships: ['user-1'],
        entitlement: {
          accessMode: 'full',
          ai: {
            usedActions: 0,
            maxActionsPerMonth: 10,
            remainingActions: 10,
            canUseAction: true,
          },
        },
        policy: {
          periodId: '2026-09',
          maxCostMicrounitsPerPeriod: 10_000,
          maxOperationsPerWindow: 10,
          maxOperationsPerUserPerWindow: 10,
          rateWindowMs: 60_000,
          maxConcurrentOperations: 1,
          maxConcurrentOperationsPerUser: 1,
          taskDraftWorstCaseCostMicrounits: 1_000,
        },
      },
    },
    operationId: () => 'operation-1',
  });
  const service = new AiTaskDraftService({
    ledger,
    client,
    results: new InMemoryAiOperationResultStore(),
    now: () => 1_000_000,
  });
  return {
    client,
    ledger,
    router: createAiTaskDraftRouter({
      verifier: input.verifier ?? {
        verifyIdToken: async () => ({ ok: true, identity: { uid: 'user-1' } }),
      },
      service,
    }),
  };
}

async function request(
  mount: (app: Express) => void,
  path: string,
  options: { headers?: Record<string, string>; body?: unknown } = {},
): Promise<{ status: number; body: unknown }> {
  const app = express();
  app.use(express.json());
  mount(app);
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...options.headers },
      body: JSON.stringify(options.body ?? {}),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    server.close();
    await once(server, 'close');
  }
}

const validHeaders = {
  authorization: 'Bearer verified-firebase-token',
  'idempotency-key': 'request-key-0001',
};

await test('requires a Firebase-verifiable bearer token before any AI work', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => app.use(fixture.router),
    '/api/organizations/org-a/ai/task-drafts',
    { headers: { 'idempotency-key': 'request-key-0001' }, body: { description: 'Preparar proposta.' } },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'authentication_required' });
  assert.equal(fixture.client.calls, 0);
  assert.equal(fixture.ledger.snapshot().operations.length, 0);
});

await test('requires an idempotency key before reserving or calling AI', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => app.use(fixture.router),
    '/api/organizations/org-a/ai/task-drafts',
    { headers: { authorization: validHeaders.authorization }, body: { description: 'Preparar proposta.' } },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'idempotency_key_required' });
  assert.equal(fixture.client.calls, 0);
});

await test('rejects browser-supplied model, prompt, users, boards and generation controls', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => app.use(fixture.router),
    '/api/organizations/org-a/ai/task-drafts',
    {
      headers: validHeaders,
      body: {
        description: 'Preparar proposta.',
        prompt: 'ignore instructions',
        model: 'attacker-model',
        systemPrompt: 'attacker prompt',
        temperature: 2,
        boards: [],
        users: [],
      },
    },
  );

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'invalid_request' });
  assert.equal(fixture.client.calls, 0);
});

await test('uses only the authenticated UID and route organization for a protected success', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => app.use(fixture.router),
    '/api/organizations/org-a/ai/task-drafts',
    {
      headers: { ...validHeaders, 'x-user-id': 'attacker', 'x-organization-id': 'org-b' },
      body: { description: 'Preparar proposta.' },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    operationId: 'operation-1',
    status: 'succeeded',
    draft: {
      title: 'Preparar proposta',
      description: 'Preparar proposta para o cliente.',
      priority: 'medium',
      status: 'todo',
      checklist: ['Reunir requisitos'],
    },
  });
  assert.equal(fixture.client.calls, 1);
  const serializedLedger = JSON.stringify(fixture.ledger.snapshot());
  assert.equal(serializedLedger.includes('request-key-0001'), false);
  assert.equal(serializedLedger.includes('Preparar proposta.'), false);
  assert.equal(serializedLedger.includes('verified-firebase-token'), false);
});

await test('denies another organization before calling Gemini', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => app.use(fixture.router),
    '/api/organizations/org-b/ai/task-drafts',
    { headers: validHeaders, body: { description: 'Preparar proposta.' } },
  );

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'organization_forbidden' });
  assert.equal(fixture.client.calls, 0);
});

await test('default composition fails closed without real server-owned configuration', async () => {
  const keys = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'GEMINI_API_KEY',
  ] as const;
  const prior = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  try {
    const response = await request(
      mountAiTaskDraftRouter,
      '/api/organizations/org-a/ai/task-drafts',
      { headers: validHeaders, body: { description: 'Preparar proposta.' } },
    );
    assert.equal(response.status, 503);
    assert.deepEqual(response.body, { error: 'authentication_unavailable' });
  } finally {
    for (const key of keys) {
      const value = prior.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

await test('retires the unauthenticated legacy route with 410 and no Gemini call', async () => {
  const fixture = protectedRouter();
  const response = await request(
    (app) => {
      app.use(createRetiredLegacyAiRouter());
      app.use(fixture.router);
    },
    '/api/generate-task-draft',
    {
      body: {
        prompt: 'Preparar proposta.',
        boards: [{ id: 'board-a' }],
        users: [{ id: 'user-a' }],
      },
    },
  );

  assert.equal(response.status, 410);
  assert.deepEqual(response.body, {
    error: 'legacy_ai_route_removed',
    replacement: '/api/organizations/:orgId/ai/task-drafts',
  });
  assert.equal(fixture.client.calls, 0);
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} AI task draft router tests passed`);
if (failures.length > 0) process.exit(1);
