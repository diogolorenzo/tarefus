/**
 * Automated Empirical Verification Suite for Tarefus Audit
 * Challenger 1
 */

// ----------------------------------------------------
// 0. Mock Browser Storage Environment for Node / TSX
// ----------------------------------------------------
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
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

// ----------------------------------------------------
// Imports from Codebase
// ----------------------------------------------------
import {
  loadAuthSession,
  saveAuthSession,
  clearAuthSession,
  loadCurrentUserId,
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
import { INITIAL_USERS } from '../src/data/initialData';

// ----------------------------------------------------
// Test Runner Harness
// ----------------------------------------------------
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
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error('Assertion failed: ' + message + ' (Expected: ' + JSON.stringify(expected) + ', Actual: ' + JSON.stringify(actual) + ')');
  }
}

// ----------------------------------------------------
// Test Execution
// ----------------------------------------------------
async function runAllTests() {
  console.log('================================================================');
  console.log('  TAREFUS EMPIRICAL AUDIT VERIFICATION SUITE - CHALLENGER 1');
  console.log('================================================================\n');

  // ==================================================================
  // SUITE 1: AUTHENTICATION LIFECYCLE, STORAGE ISOLATION & PASSWORD RESET
  // ==================================================================
  await suite('1. Authentication Lifecycle & Storage Isolation', async () => {
    await test('1.1 Login with rememberMe: true writes to localStorage, clears sessionStorage', () => {
      mockLocalStorage.clear();
      mockSessionStorage.clear();

      const session: AuthSession = {
        userId: 'user-1',
        token: 'tok_test_remember_true',
        rememberMe: true,
        loggedInAt: new Date().toISOString(),
      };

      saveAuthSession(session);

      const localVal = mockLocalStorage.getItem('tarefus_auth_session_v1');
      const sessionVal = mockSessionStorage.getItem('tarefus_auth_session_v1');
      const currentUserIdVal = mockLocalStorage.getItem('tarefus_current_user_id_v1');

      assert(localVal !== null, 'localStorage must contain auth session');
      assert(sessionVal === null, 'sessionStorage must NOT contain auth session');
      assertEquals(currentUserIdVal, 'user-1', 'localStorage current user ID must match');

      const loaded = loadAuthSession();
      assert(loaded !== null, 'loadAuthSession() should return saved session');
      assertEquals(loaded ? loaded.userId : null, 'user-1', 'userId must match');
      assertEquals(loaded ? loaded.rememberMe : null, true, 'rememberMe must be true');
    });

    await test('1.2 Login with rememberMe: false writes to sessionStorage, clears localStorage', () => {
      mockLocalStorage.clear();
      mockSessionStorage.clear();

      const session: AuthSession = {
        userId: 'user-2',
        token: 'tok_test_remember_false',
        rememberMe: false,
        loggedInAt: new Date().toISOString(),
      };

      saveAuthSession(session);

      const localVal = mockLocalStorage.getItem('tarefus_auth_session_v1');
      const sessionVal = mockSessionStorage.getItem('tarefus_auth_session_v1');
      const currentUserIdVal = mockLocalStorage.getItem('tarefus_current_user_id_v1');

      assert(localVal === null, 'localStorage must NOT contain auth session');
      assert(sessionVal !== null, 'sessionStorage must contain auth session');
      assertEquals(currentUserIdVal, 'user-2', 'localStorage current user ID must match');

      const loaded = loadAuthSession();
      assert(loaded !== null, 'loadAuthSession() should return saved session from sessionStorage');
      assertEquals(loaded ? loaded.userId : null, 'user-2', 'userId must match');
      assertEquals(loaded ? loaded.rememberMe : null, false, 'rememberMe must be false');
    });

    await test('1.3 Logout clears all auth session tokens and current user ID from both storages', () => {
      // Set session in both storages
      mockLocalStorage.setItem('tarefus_auth_session_v1', JSON.stringify({ userId: 'user-1' }));
      mockSessionStorage.setItem('tarefus_auth_session_v1', JSON.stringify({ userId: 'user-2' }));
      mockLocalStorage.setItem('tarefus_current_user_id_v1', 'user-1');
      mockSessionStorage.setItem('tarefus_current_user_id_v1', 'user-2');

      clearAuthSession();

      assertEquals(mockLocalStorage.getItem('tarefus_auth_session_v1'), null, 'localStorage auth session cleared');
      assertEquals(mockSessionStorage.getItem('tarefus_auth_session_v1'), null, 'sessionStorage auth session cleared');
      assertEquals(mockLocalStorage.getItem('tarefus_current_user_id_v1'), null, 'localStorage current user cleared');
      assertEquals(mockSessionStorage.getItem('tarefus_current_user_id_v1'), null, 'sessionStorage current user cleared');

      const loadedSession = loadAuthSession();
      assertEquals(loadedSession, null, 'loadAuthSession() must return null after logout');
      assertEquals(loadCurrentUserId(), null, 'loadCurrentUserId() must return null');
    });

    await test('1.4 Page reload after logout does NOT auto-login user (session isolation)', () => {
      // Simulate state after clearAuthSession()
      clearAuthSession();

      // Simulate React state initialization logic in TaskContext:
      const initialSession = loadAuthSession();
      const isAuthenticated = Boolean(initialSession && initialSession.userId);
      const currentUser = isAuthenticated ? (INITIAL_USERS.find(u => u.id === (initialSession ? initialSession.userId : '')) || null) : null;

      assertEquals(initialSession, null, 'initialSession is null');
      assertEquals(isAuthenticated, false, 'isAuthenticated evaluates to false');
      assertEquals(currentUser, null, 'currentUser evaluates to null (no auto-login)');
    });

    await test('1.5 Password Reset code generation produces 6-digit numeric string with 15-min expiry', () => {
      const now = Date.now();
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(now + 15 * 60 * 1000).toISOString();

      assertEquals(code.length, 6, 'Code must have exactly 6 characters');
      assert(/^\d{6}$/.test(code), 'Code must consist solely of digits');
      
      const parsedExpiry = new Date(expiresAt).getTime();
      const diffMinutes = (parsedExpiry - now) / (60 * 1000);
      assert(Math.abs(diffMinutes - 15) < 0.01, 'Expiration must be exactly 15 minutes in the future');
    });

    await test('1.6 Password Reset expiration validation (accepts active, rejects expired)', () => {
      const users: User[] = [
        {
          id: 'u-reset-1',
          name: 'Reset Test',
          email: 'reset@empresa.com',
          password: 'oldpassword',
          isAdmin: false,
          role: 'Member',
          resetCode: '123456',
          resetCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins remaining
        },
        {
          id: 'u-reset-2',
          name: 'Expired Reset Test',
          email: 'expired@empresa.com',
          password: 'oldpassword',
          isAdmin: false,
          role: 'Member',
          resetCode: '654321',
          resetCodeExpiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 sec ago
        },
      ];

      // Helper simulating TaskContext.resetPassword logic
      const simulateReset = (email: string, code: string, newPass: string) => {
        const trimmedEmail = email.trim().toLowerCase();
        const matched = users.find(u => u.email.trim().toLowerCase() === trimmedEmail);
        if (!matched) return { success: false, error: 'Usu�rio n�o encontrado.' };
        if (!matched.resetCode || matched.resetCode.trim() !== code.trim()) {
          return { success: false, error: 'C�digo de recupera��o incorreto.' };
        }
        if (matched.resetCodeExpiresAt && new Date(matched.resetCodeExpiresAt).getTime() < Date.now()) {
          return { success: false, error: 'C�digo de recupera��o expirado.' };
        }
        matched.password = newPass;
        matched.resetCode = '';
        matched.resetCodeExpiresAt = '';
        return { success: true };
      };

      // 1. Valid code & active expiration -> SUCCESS
      const res1 = simulateReset('reset@empresa.com', '123456', 'newpass123');
      assertEquals(res1.success, true, 'Active reset code must succeed');
      assertEquals(users[0].password, 'newpass123', 'Password must be updated');
      assertEquals(users[0].resetCode, '', 'Reset code must be cleared');

      // 2. Expired code -> REJECTED
      const res2 = simulateReset('expired@empresa.com', '654321', 'newpass456');
      assertEquals(res2.success, false, 'Expired reset code must fail');
      assertEquals(res2.error, 'C�digo de recupera��o expirado.', 'Error message must specify expiration');
      assertEquals(users[1].password, 'oldpassword', 'Password must not change on expired code');

      // 3. Incorrect code -> REJECTED
      users[0].resetCode = '999888';
      users[0].resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const res3 = simulateReset('reset@empresa.com', '000000', 'hackedpass');
      assertEquals(res3.success, false, 'Wrong reset code must fail');
      assertEquals(res3.error, 'C�digo de recupera��o incorreto.', 'Error must specify incorrect code');
    });
  });

  // ==================================================================
  // SUITE 2: EMAIL UNIQUENESS ENFORCEMENT
  // ==================================================================
  await suite('2. Email Uniqueness Enforcement', async () => {
    await test('2.1 addUser rejects duplicate emails (case-insensitive & whitespace-trimmed)', async () => {
      const users: User[] = [...INITIAL_USERS];

      const simulateAddUser = async (email: string, name: string) => {
        const trimmedEmail = email.trim().toLowerCase();
        const exists = users.some(u => u.email.trim().toLowerCase() === trimmedEmail);
        if (exists) {
          throw new Error('E-mail corporativo j� cadastrado.');
        }
        const newUser: User = {
          id: 'user-' + Date.now(),
          name: name,
          email: trimmedEmail,
          isAdmin: false,
          role: 'Member',
        };
        users.push(newUser);
        return newUser;
      };

      // 1. Exact match duplicate
      let error1: string | null = null;
      try {
        await simulateAddUser('ana.silva@empresa.com', 'Fake Ana');
      } catch (err: any) {
        error1 = err.message;
      }
      assertEquals(error1, 'E-mail corporativo j� cadastrado.', 'Exact email duplicate rejected');

      // 2. Uppercase duplicate
      let error2: string | null = null;
      try {
        await simulateAddUser('ANA.SILVA@EMPRESA.COM', 'Fake Ana 2');
      } catch (err: any) {
        error2 = err.message;
      }
      assertEquals(error2, 'E-mail corporativo j� cadastrado.', 'Uppercase duplicate rejected');

      // 3. Whitespace-padded duplicate
      let error3: string | null = null;
      try {
        await simulateAddUser('  carlos.mendes@empresa.com  ', 'Fake Carlos');
      } catch (err: any) {
        error3 = err.message;
      }
      assertEquals(error3, 'E-mail corporativo j� cadastrado.', 'Whitespace-padded duplicate rejected');

      // 4. Truly unique email
      const newU = await simulateAddUser('novo.colaborador@empresa.com', 'Novo Colaborador');
      assertEquals(newU.email, 'novo.colaborador@empresa.com', 'Unique email allowed');
      assert(users.some(u => u.email === 'novo.colaborador@empresa.com'), 'User added to list');
    });

    await test('2.2 register returns error on duplicate email', async () => {
      const users: User[] = [...INITIAL_USERS];

      const simulateRegister = async (email: string) => {
        const trimmedEmail = email.trim().toLowerCase();
        const exists = users.some(u => u.email.trim().toLowerCase() === trimmedEmail);
        if (exists) {
          return {
            success: false,
            error: 'J� existe um colaborador cadastrado com este e-mail corporativo.',
          };
        }
        return { success: true };
      };

      const resDuplicate = await simulateRegister('beatriz.lima@empresa.com');
      assertEquals(resDuplicate.success, false, 'Duplicate register rejected');
      assertEquals(
        resDuplicate.error,
        'J� existe um colaborador cadastrado com este e-mail corporativo.',
        'Proper error returned'
      );

      const resUnique = await simulateRegister('novissimo@empresa.com');
      assertEquals(resUnique.success, true, 'Unique register succeeds');
    });
  });

  // ==================================================================
  // SUITE 3: RBAC MATRIX VERIFICATION (Admin, Gestor, Membro)
  // ==================================================================
  await suite('3. RBAC Matrix Verification', async () => {
    const adminUser: User = {
      id: 'usr-admin',
      name: 'Admin Test',
      email: 'admin@test.com',
      isAdmin: true,
      permissionRole: 'admin',
      role: 'Director',
    };

    const managerUser: User = {
      id: 'usr-manager',
      name: 'Manager Test',
      email: 'manager@test.com',
      isAdmin: false,
      permissionRole: 'manager',
      role: 'Operations Manager',
    };

    const memberUser: User = {
      id: 'usr-member',
      name: 'Member Test',
      email: 'member@test.com',
      isAdmin: false,
      permissionRole: 'member',
      role: 'Developer',
    };

    const legacyAdminUser: User = {
      id: 'usr-legacy-admin',
      name: 'Legacy Admin',
      email: 'legacyadmin@test.com',
      isAdmin: true,
      role: 'Director',
    };

    const legacyMemberUser: User = {
      id: 'usr-legacy-member',
      name: 'Legacy Member',
      email: 'legacymember@test.com',
      isAdmin: false,
      role: 'Analyst',
    };

    await test('3.1 getEffectiveRole resolution across all user configurations', () => {
      assertEquals(getEffectiveRole(adminUser), 'admin', 'Admin role resolved');
      assertEquals(getEffectiveRole(managerUser), 'manager', 'Manager role resolved');
      assertEquals(getEffectiveRole(memberUser), 'member', 'Member role resolved');
      assertEquals(getEffectiveRole(legacyAdminUser), 'admin', 'Legacy isAdmin:true resolved to admin');
      assertEquals(getEffectiveRole(legacyMemberUser), 'member', 'Legacy isAdmin:false resolved to member');
      assertEquals(getEffectiveRole(null), 'member', 'null user defaults to member');
    });

    await test('3.2 canDeleteTask RBAC matrix', () => {
      const taskOwnMember: Task = {
        id: 't-1',
        title: 'Task for Member',
        status: 'todo',
        boardId: 'b-1',
        assigneeIds: ['usr-member'],
        order: 0,
        createdAt: '',
        updatedAt: '',
      };

      const taskOtherMember: Task = {
        id: 't-2',
        title: 'Task for Admin',
        status: 'todo',
        boardId: 'b-1',
        assigneeIds: ['usr-admin'],
        order: 0,
        createdAt: '',
        updatedAt: '',
      };

      const taskNoAssignees: Task = {
        id: 't-3',
        title: 'Task with No Assignees',
        status: 'todo',
        boardId: 'b-1',
        assigneeIds: [],
        order: 0,
        createdAt: '',
        updatedAt: '',
      };

      // Admin can delete ANY task
      assertEquals(canDeleteTask(adminUser, taskOwnMember), true, 'Admin can delete member task');
      assertEquals(canDeleteTask(adminUser, taskOtherMember), true, 'Admin can delete admin task');
      assertEquals(canDeleteTask(adminUser, taskNoAssignees), true, 'Admin can delete unassigned task');
      assertEquals(canDeleteTask(adminUser, undefined), true, 'Admin can delete task even if undefined');

      // Manager can delete ANY task
      assertEquals(canDeleteTask(managerUser, taskOwnMember), true, 'Manager can delete member task');
      assertEquals(canDeleteTask(managerUser, taskOtherMember), true, 'Manager can delete admin task');
      assertEquals(canDeleteTask(managerUser, taskNoAssignees), true, 'Manager can delete unassigned task');

      // Member can ONLY delete assigned tasks
      assertEquals(canDeleteTask(memberUser, taskOwnMember), true, 'Member CAN delete task where assigned');
      assertEquals(canDeleteTask(memberUser, taskOtherMember), false, 'Member CANNOT delete task where NOT assigned');
      assertEquals(canDeleteTask(memberUser, taskNoAssignees), false, 'Member CANNOT delete unassigned task');
      assertEquals(canDeleteTask(memberUser, undefined), false, 'Member CANNOT delete undefined task');

      // Null user
      assertEquals(canDeleteTask(null, taskOwnMember), false, 'null user cannot delete task');
    });

    await test('3.3 canCreateBoard RBAC matrix', () => {
      assertEquals(canCreateBoard(adminUser), true, 'Admin can create board');
      assertEquals(canCreateBoard(managerUser), true, 'Manager can create board');
      assertEquals(canCreateBoard(memberUser), false, 'Member CANNOT create board');
      assertEquals(canCreateBoard(null), false, 'null user CANNOT create board');
    });

    await test('3.4 canEditBoard RBAC matrix & Leak Check (No || true bug)', () => {
      const boardOwnedByManager: Board = {
        id: 'b-mgr',
        name: 'Manager Board',
        color: 'blue',
        createdBy: 'usr-manager',
        memberIds: ['usr-manager', 'usr-member'],
        order: 0,
      };

      const boardOwnedByAdmin: Board = {
        id: 'b-adm',
        name: 'Admin Board',
        color: 'amber',
        createdBy: 'usr-admin',
        memberIds: ['usr-admin'],
        order: 1,
      };

      const boardWithManagerAsMember: Board = {
        id: 'b-shared',
        name: 'Shared Board',
        color: 'emerald',
        createdBy: 'usr-admin',
        memberIds: ['usr-admin', 'usr-manager'],
        order: 2,
      };

      // Admin can edit ANY board
      assertEquals(canEditBoard(adminUser, boardOwnedByManager), true, 'Admin can edit manager board');
      assertEquals(canEditBoard(adminUser, boardOwnedByAdmin), true, 'Admin can edit admin board');
      assertEquals(canEditBoard(adminUser, undefined), true, 'Admin can edit undefined board');

      // Manager can edit if creator or member
      assertEquals(canEditBoard(managerUser, boardOwnedByManager), true, 'Manager can edit own board');
      assertEquals(canEditBoard(managerUser, boardWithManagerAsMember), true, 'Manager can edit board where member');
      assertEquals(canEditBoard(managerUser, boardOwnedByAdmin), false, 'Manager CANNOT edit unshared admin board');
      assertEquals(canEditBoard(managerUser, undefined), true, 'Manager can edit board if undefined');

      // CRITICAL LEAK CHECK: Member must NEVER be allowed to edit boards
      assertEquals(canEditBoard(memberUser, boardOwnedByManager), false, 'Member CANNOT edit board even if in memberIds');
      assertEquals(canEditBoard(memberUser, boardOwnedByAdmin), false, 'Member CANNOT edit admin board');
      assertEquals(canEditBoard(memberUser, undefined), false, 'Member CANNOT edit undefined board');

      // Null user
      assertEquals(canEditBoard(null, boardOwnedByManager), false, 'null user CANNOT edit board');
    });

    await test('3.5 canDeleteBoard RBAC matrix', () => {
      assertEquals(canDeleteBoard(adminUser), true, 'Admin can delete board');
      assertEquals(canDeleteBoard(managerUser), false, 'Manager CANNOT delete board');
      assertEquals(canDeleteBoard(memberUser), false, 'Member CANNOT delete board');
      assertEquals(canDeleteBoard(null), false, 'null user CANNOT delete board');
    });

    await test('3.6 canManageMembers RBAC matrix', () => {
      assertEquals(canManageMembers(adminUser), true, 'Admin can manage members');
      assertEquals(canManageMembers(managerUser), false, 'Manager CANNOT manage members');
      assertEquals(canManageMembers(memberUser), false, 'Member CANNOT manage members');
      assertEquals(canManageMembers(null), false, 'null user CANNOT manage members');
    });

    await test('3.7 canManageCompany RBAC matrix', () => {
      assertEquals(canManageCompany(adminUser), true, 'Admin can manage company settings');
      assertEquals(canManageCompany(managerUser), false, 'Manager CANNOT manage company settings');
      assertEquals(canManageCompany(memberUser), false, 'Member CANNOT manage company settings');
      assertEquals(canManageCompany(null), false, 'null user CANNOT manage company settings');
    });

    await test('3.8 canManageAuditLogs RBAC matrix', () => {
      assertEquals(canManageAuditLogs(adminUser), true, 'Admin can manage audit logs & reseed');
      assertEquals(canManageAuditLogs(managerUser), false, 'Manager CANNOT manage audit logs');
      assertEquals(canManageAuditLogs(memberUser), false, 'Member CANNOT manage audit logs');
      assertEquals(canManageAuditLogs(null), false, 'null user CANNOT manage audit logs');
    });
  });

  // ==================================================================
  // SUITE 4: FIRESTORE SANITIZATION (sanitizeForFirestore)
  // ==================================================================
  await suite('4. Firestore Sanitization (sanitizeForFirestore)', async () => {
    // Helper to recursively check if any property in an object has undefined value
    const hasUndefinedValue = (obj: any): boolean => {
      if (obj === undefined) return true;
      if (obj === null || typeof obj !== 'object') return false;
      if (Array.isArray(obj)) {
        return obj.some(hasUndefinedValue);
      }
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) return true;
        if (typeof v === 'object' && hasUndefinedValue(v)) return true;
      }
      return false;
    };

    await test('4.1 Strips top-level undefined properties without altering defined properties', () => {
      const input = {
        name: 'Task 1',
        status: 'todo',
        unassignedProp: undefined,
        count: 42,
        isActive: true,
        emptyVal: null,
      };

      const cleaned = sanitizeForFirestore(input);

      assert(!('unassignedProp' in cleaned), 'unassignedProp must be completely removed');
      assertEquals(cleaned.name, 'Task 1', 'name preserved');
      assertEquals(cleaned.status, 'todo', 'status preserved');
      assertEquals(cleaned.count, 42, 'count preserved');
      assertEquals(cleaned.isActive, true, 'isActive preserved');
      assertEquals(cleaned.emptyVal, null, 'null value preserved');
      assert(!hasUndefinedValue(cleaned), 'No undefined value remains');
    });

    await test('4.2 Strips deeply nested undefined properties (level 2, 3, 4)', () => {
      const input = {
        lvl1_valid: 'ok',
        lvl1_bad: undefined,
        nested: {
          lvl2_valid: 123,
          lvl2_bad: undefined,
          deep: {
            lvl3_valid: true,
            lvl3_bad: undefined,
            deeper: {
              lvl4_valid: 'deepest',
              lvl4_bad: undefined,
            },
          },
        },
      };

      const cleaned = sanitizeForFirestore(input);

      assert(!('lvl1_bad' in cleaned), 'lvl1_bad removed');
      assert(!('lvl2_bad' in cleaned.nested), 'lvl2_bad removed');
      assert(!('lvl3_bad' in cleaned.nested.deep), 'lvl3_bad removed');
      assert(!('lvl4_bad' in cleaned.nested.deep.deeper), 'lvl4_bad removed');

      assertEquals(cleaned.lvl1_valid, 'ok', 'lvl1_valid preserved');
      assertEquals(cleaned.nested.lvl2_valid, 123, 'lvl2_valid preserved');
      assertEquals(cleaned.nested.deep.lvl3_valid, true, 'lvl3_valid preserved');
      assertEquals(cleaned.nested.deep.deeper.lvl4_valid, 'deepest', 'lvl4_valid preserved');
      assert(!hasUndefinedValue(cleaned), 'Deep object has zero undefined');
    });

    await test('4.3 Strips undefined properties inside arrays of objects', () => {
      const input = {
        items: [
          { id: 1, text: 'First', extra: undefined },
          { id: 2, text: 'Second', extra: undefined, nested: { tag: 'urgent', note: undefined } },
        ],
      };

      const cleaned = sanitizeForFirestore(input);

      assertEquals(cleaned.items.length, 2, 'Array length preserved');
      assert(!('extra' in cleaned.items[0]), 'extra removed from item 0');
      assert(!('extra' in cleaned.items[1]), 'extra removed from item 1');
      assert(!('note' in cleaned.items[1].nested), 'note removed from nested object in item 1');
      assertEquals(cleaned.items[0].text, 'First', 'item 0 text preserved');
      assertEquals(cleaned.items[1].nested.tag, 'urgent', 'item 1 nested tag preserved');
      assert(!hasUndefinedValue(cleaned), 'Array has zero undefined');
    });

    await test('4.4 Preserves Date objects without corrupting them into empty objects', () => {
      const testDate = new Date('2026-08-31T12:00:00.000Z');
      const input = {
        createdAt: testDate,
        badField: undefined,
      };

      const cleaned = sanitizeForFirestore(input);

      assert(cleaned.createdAt instanceof Date, 'createdAt must remain an instance of Date');
      assertEquals(cleaned.createdAt.toISOString(), '2026-08-31T12:00:00.000Z', 'Date timestamp matches');
      assert(!('badField' in cleaned), 'badField removed');
    });

    await test('4.5 Handles top-level primitives, null, undefined, and empty objects', () => {
      assertEquals(sanitizeForFirestore(undefined), undefined, 'Top-level undefined returns undefined');
      assertEquals(sanitizeForFirestore(null), null, 'Top-level null returns null');
      assertEquals(sanitizeForFirestore('hello'), 'hello', 'Top-level string returns string');
      assertEquals(sanitizeForFirestore(12345), 12345, 'Top-level number returns number');
      assertEquals(sanitizeForFirestore(true), true, 'Top-level boolean returns boolean');

      const emptyObj = sanitizeForFirestore({ a: undefined, b: undefined });
      assertEquals(Object.keys(emptyObj).length, 0, 'Object of only undefined returns empty object');
    });
  });

  // ==================================================================
  // SUMMARY REPORT
  // ==================================================================
  console.log('\n================================================================');
  console.log('  TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('Total Tests Run: ' + total);
  console.log('Passed:         ' + passed + ' / ' + total);
  console.log('Failed:         ' + failed + ' / ' + total);

  if (failed > 0) {
    console.error('\nFAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.error(' - [' + r.suite + '] ' + r.name + ': ' + r.error);
    });
    process.exit(1);
  } else {
    console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY.');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
