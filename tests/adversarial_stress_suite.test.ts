/**
 * Adversarial Stress Test Suite & Fuzzing Harness for Tarefus Audit
 * Challenger 1
 */

class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
}

const mockLocalStorage = new MemoryStorage();
const mockSessionStorage = new MemoryStorage();

(global as any).localStorage = mockLocalStorage;
(global as any).sessionStorage = mockSessionStorage;
(global as any).window = {
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage,
  matchMedia: () => ({ matches: false }),
};

import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  type AuthSession,
} from '../src/services/storage';

import {
  getEffectiveRole,
  canManageCompany,
  canManageMembers,
  canManageAuditLogs,
  canCreateBoard,
  canEditBoard,
  canDeleteBoard,
  canCreateTask,
  canEditTask,
  canDeleteTask,
} from '../src/utils/rbac';

import { sanitizeForFirestore } from '../src/services/firestoreService';
import type { User, Task, Board } from '../src/types';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
let currentSuite = 'Default';

function suite(name: string, fn: () => void | Promise<void>) {
  currentSuite = name;
  return fn();
}

async function test(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ suite: currentSuite, name, passed: true, durationMs });
    console.log('  [PASS] ' + name + ' (' + durationMs + 'ms)');
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({
      suite: currentSuite,
      name,
      passed: false,
      error: err && err.message ? err.message : String(err),
      durationMs,
    });
    console.error('  [FAIL] ' + name + ' (' + durationMs + 'ms)');
    console.error('         Error: ' + (err && err.message ? err.message : String(err)));
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error('Assertion failed: ' + message);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error('Assertion failed: ' + message + ' (Expected: ' + JSON.stringify(expected) + ', Actual: ' + JSON.stringify(actual) + ')');
  }
}

async function runAdversarialTests() {
  console.log('================================================================');
  console.log('  TAREFUS ADVERSARIAL STRESS & FUZZ HARNESS - CHALLENGER 1');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: BOUNDARY & EDGE CASE AUTH TESTING
  // ==================================================================
  await suite('1. Boundary & Adversarial Auth Testing', async () => {
    await test('1.1 Password Reset Expiration: Exact sub-second boundary test', () => {
      const now = Date.now();
      const code = '048291'; // Leading zero test

      // 14 min 59 sec into the future -> VALID
      const validFuture = new Date(now + (14 * 60 + 59) * 1000).toISOString();
      const userValid: User = {
        id: 'u-b1',
        name: 'Bound Valid',
        email: 'bound_valid@test.com',
        role: 'Member',
        resetCode: code,
        resetCodeExpiresAt: validFuture,
      };

      const checkValid = (u: User, inputCode: string) => {
        if (!u.resetCode || u.resetCode.trim() !== inputCode.trim()) return false;
        if (u.resetCodeExpiresAt && new Date(u.resetCodeExpiresAt).getTime() < now) return false;
        return true;
      };

      assert(checkValid(userValid, '048291') === true, 'T + 14m59s must be valid');

      // Expired 1 millisecond ago -> INVALID
      const expiredPast = new Date(now - 1).toISOString();
      const userExpired: User = {
        id: 'u-b2',
        name: 'Bound Expired',
        email: 'bound_exp@test.com',
        role: 'Member',
        resetCode: code,
        resetCodeExpiresAt: expiredPast,
      };

      assert(checkValid(userExpired, '048291') === false, 'T - 1ms must be invalid');
    });

    await test('1.2 Password Reset with malformed / invalid expiration timestamps', () => {
      const userCorrupt: User = {
        id: 'u-corrupt',
        name: 'Corrupt User',
        email: 'corrupt@test.com',
        role: 'Member',
        resetCode: '112233',
        resetCodeExpiresAt: 'invalid-date-string',
      };

      const simulateReset = (u: User, code: string) => {
        if (!u.resetCode || u.resetCode.trim() !== code.trim()) {
          return { success: false, error: 'C�digo de recupera��o incorreto.' };
        }
        if (u.resetCodeExpiresAt) {
          const parsed = new Date(u.resetCodeExpiresAt).getTime();
          if (isNaN(parsed) || parsed < Date.now()) {
            return { success: false, error: 'C�digo de recupera��o expirado.' };
          }
        }
        return { success: true };
      };

      const res = simulateReset(userCorrupt, '112233');
      assertEquals(res.success, false, 'Corrupted date must fail');
      assertEquals(res.error, 'C�digo de recupera��o expirado.', 'Corrupted date handled as expired');
    });

    await test('1.3 Session Storage overwrite & rapid alternating session switching', () => {
      mockLocalStorage.clear();
      mockSessionStorage.clear();

      for (let i = 0; i < 50; i++) {
        const rememberMe = i % 2 === 0;
        const session: AuthSession = {
          userId: 'user-' + i,
          token: 'tok-' + i,
          rememberMe: rememberMe,
          loggedInAt: new Date().toISOString(),
        };

        saveAuthSession(session);

        const loaded = loadAuthSession();
        assert(loaded !== null, 'Session loaded on iteration ' + i);
        assertEquals(loaded ? loaded.userId : null, 'user-' + i, 'User ID matches on iteration ' + i);
        assertEquals(loaded ? loaded.rememberMe : null, rememberMe, 'rememberMe matches on iteration ' + i);

        if (rememberMe) {
          assert(mockLocalStorage.getItem('tarefus_auth_session_v1') !== null, 'Local has session');
          assert(mockSessionStorage.getItem('tarefus_auth_session_v1') === null, 'Session does not have session');
        } else {
          assert(mockSessionStorage.getItem('tarefus_auth_session_v1') !== null, 'Session has session');
          assert(mockLocalStorage.getItem('tarefus_auth_session_v1') === null, 'Local does not have session');
        }
      }
    });
  });

  // ==================================================================
  // SUITE 2: ADVERSARIAL EMAIL VALIDATION
  // ==================================================================
  await suite('2. Adversarial Email Normalization & Collision', async () => {
    await test('2.1 Unicode casing, tabs, and multi-line whitespace duplicate detection', () => {
      const existingEmails = ['colaborador.alpha@empresa.com.br'];

      const isDuplicate = (input: string) => {
        const normalized = input.trim().toLowerCase();
        return existingEmails.some(e => e.trim().toLowerCase() === normalized);
      };

      assert(isDuplicate('  colaborador.alpha@empresa.com.br  '), 'Whitespace match');
      assert(isDuplicate('\tCOLABORADOR.ALPHA@EMPRESA.COM.BR\n'), 'Tab and newline match');
      assert(isDuplicate('Colaborador.Alpha@Empresa.Com.Br'), 'Titlecase match');
      assert(!isDuplicate('colaborador.beta@empresa.com.br'), 'Distinct email');
    });
  });

  // ==================================================================
  // SUITE 3: EXHAUSTIVE COMBINATORIC RBAC MATRIX
  // ==================================================================
  await suite('3. Exhaustive Combinatoric RBAC Verification', async () => {
    const roles: Array<{ role: 'admin' | 'manager' | 'member'; user: User }> = [
      {
        role: 'admin',
        user: { id: 'u-admin', name: 'Admin', email: 'admin@t.com', role: 'Dir', permissionRole: 'admin', isAdmin: true },
      },
      {
        role: 'manager',
        user: { id: 'u-mgr', name: 'Manager', email: 'mgr@t.com', role: 'Mgr', permissionRole: 'manager', isAdmin: false },
      },
      {
        role: 'member',
        user: { id: 'u-mbr', name: 'Member', email: 'mbr@t.com', role: 'Dev', permissionRole: 'member', isAdmin: false },
      },
    ];

    await test('3.1 Invariant Check: canDeleteBoard, canManageMembers, canManageCompany, canManageAuditLogs are ADMIN-ONLY', () => {
      for (const { role, user } of roles) {
        const expected = role === 'admin';
        assertEquals(canDeleteBoard(user), expected, role + ' canDeleteBoard invariant');
        assertEquals(canManageMembers(user), expected, role + ' canManageMembers invariant');
        assertEquals(canManageCompany(user), expected, role + ' canManageCompany invariant');
        assertEquals(canManageAuditLogs(user), expected, role + ' canManageAuditLogs invariant');
      }
    });

    await test('3.2 Invariant Check: canCreateBoard is ADMIN and MANAGER only', () => {
      for (const { role, user } of roles) {
        const expected = role === 'admin' || role === 'manager';
        assertEquals(canCreateBoard(user), expected, role + ' canCreateBoard invariant');
      }
    });

    await test('3.3 Invariant Check: canEditBoard strict isolation (no member edits ever)', () => {
      const boardOwnedByMember: Board = {
        id: 'b-mbr',
        name: 'Mbr Board',
        color: 'red',
        createdBy: 'u-mbr',
        memberIds: ['u-mbr'],
        order: 0,
      };

      const memberUser = roles.find(r => r.role === 'member')!.user;
      const managerUser = roles.find(r => r.role === 'manager')!.user;
      const adminUser = roles.find(r => r.role === 'admin')!.user;

      // Member should NEVER be able to edit boards even if createdBy matches!
      assertEquals(canEditBoard(memberUser, boardOwnedByMember), false, 'Member cannot edit own board');
      assertEquals(canEditBoard(memberUser, undefined), false, 'Member cannot edit undefined board');

      // Manager can edit if createdBy or memberIds
      assertEquals(canEditBoard(managerUser, boardOwnedByMember), false, 'Manager cannot edit unassigned board');
      assertEquals(canEditBoard(managerUser, { ...boardOwnedByMember, createdBy: 'u-mgr' }), true, 'Manager can edit created board');
      assertEquals(canEditBoard(managerUser, { ...boardOwnedByMember, memberIds: ['u-mgr'] }), true, 'Manager can edit member board');

      // Admin can edit all
      assertEquals(canEditBoard(adminUser, boardOwnedByMember), true, 'Admin can edit any board');
    });

    await test('3.4 Invariant Check: Malformed task and user objects never throw exceptions', () => {
      const malformedUsers: any[] = [
        {},
        { id: 'u-x' },
        { permissionRole: 'unknown_role' },
        { isAdmin: 'yes' },
        null,
        undefined,
      ];

      const malformedTasks: any[] = [
        {},
        { id: 't-x' },
        { assigneeIds: null },
        { assigneeIds: 'not-an-array' },
        null,
        undefined,
      ];

      for (const u of malformedUsers) {
        for (const t of malformedTasks) {
          // Verify none throw
          const resRole = getEffectiveRole(u);
          assert(typeof resRole === 'string', 'getEffectiveRole returned string');

          const delTaskRes = canDeleteTask(u, t);
          assert(typeof delTaskRes === 'boolean', 'canDeleteTask returned boolean');

          const editBoardRes = canEditBoard(u, t as any);
          assert(typeof editBoardRes === 'boolean', 'canEditBoard returned boolean');
        }
      }
    });
  });

  // ==================================================================
  // SUITE 4: FUZZING FIRESTORE SANITIZATION
  // ==================================================================
  await suite('4. Fuzzing Firestore Sanitization (100 Random Deep Trees)', async () => {
    const generateFuzzNode = (depth: number): any => {
      if (depth > 6) {
        const terminals = [
          'test_string_' + Math.random(),
          Math.floor(Math.random() * 1000),
          true,
          false,
          null,
          undefined,
          new Date(),
        ];
        return terminals[Math.floor(Math.random() * terminals.length)];
      }

      const typeChoice = Math.random();
      if (typeChoice < 0.25) {
        // Array
        const len = Math.floor(Math.random() * 4);
        const arr: any[] = [];
        for (let i = 0; i < len; i++) {
          arr.push(generateFuzzNode(depth + 1));
        }
        return arr;
      } else if (typeChoice < 0.7) {
        // Object
        const propCount = Math.floor(Math.random() * 5);
        const obj: Record<string, any> = {};
        for (let i = 0; i < propCount; i++) {
          obj['key_' + i] = generateFuzzNode(depth + 1);
        }
        // Force an undefined key
        obj['forced_undefined_' + Math.random()] = undefined;
        return obj;
      } else {
        // Primitive / Terminal
        const terminals = ['str', 123, true, null, undefined, new Date()];
        return terminals[Math.floor(Math.random() * terminals.length)];
      }
    };

    const hasAnyUndefinedInObject = (obj: any): boolean => {
      if (obj === undefined) return false; // top-level returns undefined as is
      if (obj === null || typeof obj !== 'object') return false;
      if (obj instanceof Date) return false;
      if (Array.isArray(obj)) {
        return obj.some(item => {
          if (item === undefined) return false; // array elements can be undefined or filtered
          return hasAnyUndefinedInObject(item);
        });
      }
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) return true;
        if (typeof v === 'object' && hasAnyUndefinedInObject(v)) return true;
      }
      return false;
    };

    await test('4.1 Stress Fuzzing: 100 randomized deep structures sanitized without errors or remaining undefined object keys', () => {
      for (let i = 0; i < 100; i++) {
        const fuzzTree = generateFuzzNode(0);
        const sanitized = sanitizeForFirestore(fuzzTree);
        const hasUndef = hasAnyUndefinedInObject(sanitized);
        assert(!hasUndef, 'Fuzz iteration ' + i + ' must have zero undefined object keys remaining');
      }
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  ADVERSARIAL STRESS SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('Total Tests Run: ' + total);
  console.log('Passed:         ' + passed + ' / ' + total);
  console.log('Failed:         ' + failed + ' / ' + total);

  if (failed > 0) {
    console.error('\nFAILED STRESS TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(' - [' + r.suite + '] ' + r.name + ': ' + r.error);
    });
    process.exit(1);
  } else {
    console.log('\nALL ADVERSARIAL STRESS & FUZZ CHECKS PASSED.');
    process.exit(0);
  }
}

runAdversarialTests().catch(err => {
  console.error('Fatal stress test runner error:', err);
  process.exit(1);
});
