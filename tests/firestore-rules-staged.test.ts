import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rules = readFileSync(resolve('firestore.rules'), 'utf8');
const withoutComments = rules.replace(/\/\/.*$/gm, '');

assert.doesNotMatch(
  withoutComments,
  /match\s+\/{document=\*\*}\s*{[\s\S]*?allow\s+(?:read,\s*write|write,\s*read)\s*:\s*if\s+true\s*;/,
  'a permissive recursive wildcard would override staged organization isolation',
);

for (const collection of ['users', 'boards', 'columns', 'tasks', 'activity_logs', 'company']) {
  assert.match(
    withoutComments,
    new RegExp(`match\\s+\\/${collection}\\/\\{[^}]+}\\s*\\{\\s*allow\\s+read,\\s*write\\s*:\\s*if\\s+true\\s*;`),
    `legacy compatibility path ${collection} must remain explicit during the rollout blockade`,
  );
}

assert.match(rules, /ROLLOUT BLOCKER/i, 'rules must name the legacy compatibility rollout blockade');
assert.match(withoutComments, /match\s+\/organizations\/\{orgId}/);
assert.match(
  withoutComments,
  /get\(\/databases\/\$\(database\)\/documents\/organizations\/\$\(orgId\)\/memberships\/\$\(request\.auth\.uid\)\)\.data\.status\s*==\s*'active'/,
  'entitlement reads must require an active membership in the requested organization',
);
assert.match(
  withoutComments,
  /match\s+\/entitlements\/\{entitlementId}\s*{\s*allow\s+read\s*:\s*if\s+entitlementId\s*==\s*'current'\s*&&\s*hasActiveMembership\(orgId\)\s*;\s*allow\s+write\s*:\s*if\s+false\s*;/,
  'only the current entitlement projection may be read by an active member and it is never client-writable',
);

for (const collection of ['memberships', 'subscriptions', 'usagePeriods', 'auditEvents']) {
  assert.match(
    withoutComments,
    new RegExp(`match\\s+\\/${collection}\\/\\{[^}]+}\\s*\\{\\s*allow\\s+read,\\s*write\\s*:\\s*if\\s+false\\s*;`),
    `${collection} must deny all client access in the staged policy`,
  );
}

assert.match(
  withoutComments,
  /match\s+\/\{document=\*\*}\s*{\s*allow\s+read,\s*write\s*:\s*if\s+false\s*;\s*}/,
  'unmatched documents must deny by default',
);

console.log('[PASS] staged Firestore rules preserve only explicit legacy compatibility and deny new commercial writes');
