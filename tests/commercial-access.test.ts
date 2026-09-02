import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import express from 'express';
import {
  createCommercialAccessRouter,
  type EntitlementReader,
  type MembershipRepository,
  type TokenVerifier,
} from '../src/server/commercial-access';
import { mountCommercialAccessRouter } from '../src/server/commercial-access-default';

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
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, error: message });
    console.error(`[FAIL] ${name}: ${message}`);
  }
}

function dependencies(input: {
  verifier?: TokenVerifier;
  memberships?: MembershipRepository;
  entitlements?: EntitlementReader;
} = {}) {
  return {
    verifier: input.verifier ?? { verifyIdToken: async () => ({ ok: true, identity: { uid: 'user-1' } }) },
    memberships: input.memberships ?? {
      findMembershipsByUid: async () => [{ organizationId: 'org-a', uid: 'user-1', role: 'billing_admin' }],
    },
    entitlements: input.entitlements ?? {
      readEntitlements: async () => ({ accessMode: 'full', planId: 'draft-team' }),
    },
  };
}

async function request(
  path: string,
  injected = dependencies(),
  headers: Record<string, string> = {},
): Promise<{ status: number; body: unknown }> {
  const app = express();
  app.use(createCommercialAccessRouter(injected));
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { headers });
    return { status: response.status, body: await response.json() };
  } finally {
    server.close();
    await once(server, 'close');
  }
}

async function requestWithDefaultMount(path: string): Promise<{ status: number; body: unknown }> {
  const app = express();
  mountCommercialAccessRouter(app);
  const server = createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const address = server.address();
    assert(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
    return { status: response.status, body: await response.json() };
  } finally {
    server.close();
    await once(server, 'close');
  }
}

await test('denies a request with no bearer token', async () => {
  const response = await request('/api/organizations/org-a/entitlements');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'authentication_required' });
});

await test('mounts the protected route with fail-closed production dependencies', async () => {
  const response = await requestWithDefaultMount('/api/organizations/org-a/entitlements');

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'authentication_required' });
});

await test('denies an invalid bearer token', async () => {
  const response = await request(
    '/api/organizations/org-a/entitlements',
    dependencies({ verifier: { verifyIdToken: async () => ({ ok: false, reason: 'invalid' }) } }),
    { authorization: 'Bearer invalid-token' },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'invalid_token' });
});

await test('denies a revoked bearer token', async () => {
  const response = await request(
    '/api/organizations/org-a/entitlements',
    dependencies({ verifier: { verifyIdToken: async () => ({ ok: false, reason: 'revoked' }) } }),
    { authorization: 'Bearer revoked-token' },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'invalid_token' });
});

await test('reports authentication configuration as unavailable without accepting the token', async () => {
  const response = await request(
    '/api/organizations/org-a/entitlements',
    dependencies({ verifier: { verifyIdToken: async () => ({ ok: false, reason: 'unavailable' }) } }),
    { authorization: 'Bearer token' },
  );

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { error: 'authentication_unavailable' });
});

await test('denies an authenticated user with no server-side membership', async () => {
  const response = await request(
    '/api/organizations/org-a/entitlements',
    dependencies({ memberships: { findMembershipsByUid: async () => [] } }),
    { authorization: 'Bearer token' },
  );

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'membership_required' });
});

await test('denies a member attempting to read another organization', async () => {
  const response = await request(
    '/api/organizations/org-b/entitlements',
    dependencies({ memberships: { findMembershipsByUid: async () => [{ organizationId: 'org-a', uid: 'user-1', role: 'member' }] } }),
    { authorization: 'Bearer token' },
  );

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'organization_forbidden' });
});

await test('allows a billing administrator from the matching server-side membership', async () => {
  const response = await request(
    '/api/organizations/org-a/entitlements',
    dependencies(),
    { authorization: 'Bearer token', 'x-user-id': 'other-user', 'x-role': 'admin' },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    organizationId: 'org-a',
    role: 'billing_admin',
    entitlements: { accessMode: 'full', planId: 'draft-team' },
  });
});

const failures = results.filter((result) => result.error);
console.log(`\n${results.length - failures.length}/${results.length} commercial access tests passed`);
if (failures.length > 0) process.exit(1);
