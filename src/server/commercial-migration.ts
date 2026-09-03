import { createHash } from 'node:crypto';
import type { CommercialRole } from './commercial-access';

export interface LegacyCommercialUser {
  legacyUserId: string;
  active: boolean;
}

export interface LegacyCommercialSnapshot {
  users: readonly LegacyCommercialUser[];
}

export interface LegacyCommercialMigrationInput {
  organization: {
    organizationId: string;
    displayName: string;
    maxActiveSeats: number;
  };
  legacySnapshot: LegacyCommercialSnapshot;
  uidByLegacyUserId: Readonly<Record<string, string>>;
  roleByLegacyUserId?: Readonly<Record<string, CommercialRole>>;
}

export type MigrationBlocker =
  | {
      code: 'missing_firebase_uid';
      legacyUserId: string;
      message: string;
    }
  | {
      code: 'duplicate_firebase_uid';
      firebaseUid: string;
      legacyUserIds: readonly string[];
      message: string;
    }
  | {
      code: 'duplicate_legacy_user';
      legacyUserId: string;
      message: string;
    }
  | {
      code: 'invalid_input';
      field: string;
      message: string;
    }
  | {
      code: 'active_seats_exceed_limit';
      message: string;
    };

export interface DryMigrationOperation {
  key: string;
  mode: 'create_if_absent';
  path: string;
  data: Readonly<Record<string, unknown>>;
}

export interface DryMigrationPlan {
  kind: 'dry_run';
  status: 'ready' | 'blocked';
  planId: string;
  blockers: readonly MigrationBlocker[];
  operations: readonly DryMigrationOperation[];
}

/**
 * Pure planner only. It performs no Admin SDK initialization, Firestore call,
 * write, delete, or migration execution. Persistence timestamps are omitted
 * intentionally and must be supplied later by the server-owned repository.
 */
export function planLegacyCommercialMigration(input: LegacyCommercialMigrationInput): DryMigrationPlan {
  const blockers: MigrationBlocker[] = [];
  const organizationId = validateSegment(input.organization.organizationId, 'organization.organizationId', blockers);
  const displayName = validateText(input.organization.displayName, 'organization.displayName', blockers);
  const maxActiveSeats = validateSeatLimit(input.organization.maxActiveSeats, blockers);
  const users = [...input.legacySnapshot.users].sort((left, right) =>
    String(left.legacyUserId).localeCompare(String(right.legacyUserId)),
  );

  const seenLegacyUsers = new Set<string>();
  const legacyUsersByFirebaseUid = new Map<string, string[]>();
  for (const user of users) {
    const legacyUserId = validateSegment(user.legacyUserId, 'legacySnapshot.users[].legacyUserId', blockers);
    if (!legacyUserId) continue;
    if (seenLegacyUsers.has(legacyUserId)) {
      blockers.push({
        code: 'duplicate_legacy_user',
        legacyUserId,
        message: `Legacy user ${legacyUserId} appears more than once.`,
      });
      continue;
    }
    seenLegacyUsers.add(legacyUserId);

    if (typeof user.active !== 'boolean') {
      const field = `legacySnapshot.users[${legacyUserId}].active`;
      blockers.push({
        code: 'invalid_input',
        field,
        message: `${field} must be boolean.`,
      });
    }

    const mappedRole = input.roleByLegacyUserId?.[legacyUserId];
    if (mappedRole !== undefined && !isCommercialRole(mappedRole)) {
      const field = `roleByLegacyUserId.${legacyUserId}`;
      blockers.push({
        code: 'invalid_input',
        field,
        message: `${field} must be member, admin, or billing_admin.`,
      });
    }

    const mappedUid = input.uidByLegacyUserId[legacyUserId];
    if (mappedUid === undefined) {
      blockers.push({
        code: 'missing_firebase_uid',
        legacyUserId,
        message: `Legacy user ${legacyUserId} has no explicit Firebase UID mapping.`,
      });
      continue;
    }
    const firebaseUid = validateSegment(mappedUid, `uidByLegacyUserId.${legacyUserId}`, blockers);
    if (!firebaseUid) continue;
    const mappedLegacyUsers = legacyUsersByFirebaseUid.get(firebaseUid) ?? [];
    mappedLegacyUsers.push(legacyUserId);
    legacyUsersByFirebaseUid.set(firebaseUid, mappedLegacyUsers);
  }

  for (const [firebaseUid, legacyUserIds] of [...legacyUsersByFirebaseUid].sort(([left], [right]) => left.localeCompare(right))) {
    if (legacyUserIds.length > 1) {
      blockers.push({
        code: 'duplicate_firebase_uid',
        firebaseUid,
        legacyUserIds: [...legacyUserIds].sort(),
        message: `Firebase UID ${firebaseUid} is mapped from more than one legacy user.`,
      });
    }
  }

  const activeSeats = users.filter((user) => user.active === true).length;
  if (maxActiveSeats !== null && activeSeats > maxActiveSeats) {
    blockers.push({
      code: 'active_seats_exceed_limit',
      message: `The legacy snapshot has ${activeSeats} active human membership${activeSeats === 1 ? '' : 's'} but the organization limit is ${maxActiveSeats}.`,
    });
  }

  const sortedBlockers = blockers.sort(compareBlockers);
  if (sortedBlockers.length > 0 || !organizationId || !displayName || maxActiveSeats === null) {
    return finalizedPlan('blocked', sortedBlockers, []);
  }

  const operations: DryMigrationOperation[] = [
    {
      key: `organization:${organizationId}`,
      mode: 'create_if_absent',
      path: `organizations/${organizationId}`,
      data: { displayName, activeSeats, maxActiveSeats },
    },
  ];

  const membershipOperations = users
    .map((user): DryMigrationOperation | null => {
      const uid = input.uidByLegacyUserId[user.legacyUserId];
      if (!uid) return null;
      const role = input.roleByLegacyUserId?.[user.legacyUserId] ?? 'member';
      if (!isCommercialRole(role)) {
        return null;
      }
      return {
        key: `membership:${organizationId}:${uid}`,
        mode: 'create_if_absent',
        path: `organizations/${organizationId}/memberships/${uid}`,
        data: {
          uid,
          kind: 'human',
          role,
          status: user.active === true ? 'active' : 'inactive',
        },
      };
    })
    .filter((operation): operation is DryMigrationOperation => operation !== null)
    .sort((left, right) => left.path.localeCompare(right.path));

  operations.push(...membershipOperations);
  return finalizedPlan('ready', [], operations);
}

function finalizedPlan(
  status: 'ready' | 'blocked',
  blockers: readonly MigrationBlocker[],
  operations: readonly DryMigrationOperation[],
): DryMigrationPlan {
  const body = stableJson({ kind: 'dry_run', status, blockers, operations });
  return {
    kind: 'dry_run',
    status,
    planId: `dry-commercial-migration:sha256:${createHash('sha256').update(body).digest('hex')}`,
    blockers,
    operations,
  };
}

function validateSegment(value: unknown, field: string, blockers: MigrationBlocker[]): string | null {
  const normalized = validateText(value, field, blockers);
  if (!normalized) return null;
  if (normalized === '.' || normalized === '..' || normalized.includes('/')) {
    blockers.push({ code: 'invalid_input', field, message: `${field} must be a single Firestore path segment.` });
    return null;
  }
  return normalized;
}

function validateText(value: unknown, field: string, blockers: MigrationBlocker[]): string | null {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 160) {
    blockers.push({ code: 'invalid_input', field, message: `${field} must be a non-empty string of at most 160 characters.` });
    return null;
  }
  return value;
}

function validateSeatLimit(value: unknown, blockers: MigrationBlocker[]): number | null {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    blockers.push({
      code: 'invalid_input',
      field: 'organization.maxActiveSeats',
      message: 'organization.maxActiveSeats must be a non-negative safe integer.',
    });
    return null;
  }
  return value;
}

function compareBlockers(left: MigrationBlocker, right: MigrationBlocker): number {
  const leftKey = `${left.code}:${'legacyUserId' in left ? left.legacyUserId : ''}:${'firebaseUid' in left ? left.firebaseUid : ''}:${'field' in left ? left.field : ''}`;
  const rightKey = `${right.code}:${'legacyUserId' in right ? right.legacyUserId : ''}:${'firebaseUid' in right ? right.firebaseUid : ''}:${'field' in right ? right.field : ''}`;
  return leftKey.localeCompare(rightKey);
}

function isCommercialRole(value: unknown): value is CommercialRole {
  return value === 'member' || value === 'admin' || value === 'billing_admin';
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}
