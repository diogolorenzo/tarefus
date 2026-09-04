/**
 * Tarefus Assignee Multi-Select Behavior Test Suite
 * Verifies the user-selection behavior that backs the responsive assignee picker.
 */

import type { User } from '../src/types';
import {
  getAssigneeSelectionSummary,
  getVisibleAssignees,
  toggleAssignee,
} from '../src/utils/assigneeSelection';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

const users: User[] = [
  {
    id: 'u-ana',
    name: 'Ana Silva',
    email: 'ana@tarefus.com',
    role: 'Administradora',
    initials: 'AS',
    avatarColor: 'bg-indigo-600',
    status: 'active',
  },
  {
    id: 'u-bruno',
    name: 'Bruno Costa',
    email: 'bruno@tarefus.com',
    role: 'Operações',
    initials: 'BC',
    avatarColor: 'bg-blue-600',
    status: 'active',
  },
  {
    id: 'u-carla',
    name: 'Carla Mendes',
    email: 'carla@tarefus.com',
    role: 'Financeiro',
    initials: 'CM',
    avatarColor: 'bg-emerald-600',
    status: 'inactive',
  },
  {
    id: 'u-diego',
    name: 'Diego Lima',
    email: 'diego@tarefus.com',
    role: 'Gestor Comercial',
    initials: 'DL',
    avatarColor: 'bg-amber-600',
    status: 'active',
  },
];

async function test(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    results.push({ name, passed: true, durationMs });
    console.log(`  [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const error = err && err.message ? err.message : String(err);
    results.push({ name, passed: false, error, durationMs });
    console.error(`  [FAIL] ${name} (${durationMs}ms)`);
    console.error(`         Error: ${error}`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

function assertEquals<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion failed: ${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`
    );
  }
}

async function runAssigneeMultiSelectTests() {
  console.log('================================================================');
  console.log('  TAREFUS ASSIGNEE MULTI-SELECT BEHAVIOR TEST SUITE');
  console.log('================================================================\n');

  await test('1.1 Hides inactive users unless they are historically selected', () => {
    const withoutInactive = getVisibleAssignees({ users, selectedIds: [], currentUserId: 'u-ana', query: '' });
    assertEquals(withoutInactive.map((option) => option.user.id), ['u-ana', 'u-bruno', 'u-diego'], 'Unselected inactive users stay hidden');

    const withHistoricalInactive = getVisibleAssignees({
      users,
      selectedIds: ['u-carla'],
      currentUserId: 'u-ana',
      query: '',
    });
    assertEquals(withHistoricalInactive[0].user.id, 'u-carla', 'Selected inactive user stays available at the top');
    assert(withHistoricalInactive[0].isInactive, 'Selected inactive user is marked inactive');
  });

  await test('1.2 Sorts selected users first and the current user before other active users', () => {
    const options = getVisibleAssignees({
      users,
      selectedIds: ['u-diego', 'u-bruno'],
      currentUserId: 'u-ana',
      query: '',
    });

    assertEquals(
      options.map((option) => option.user.id),
      ['u-bruno', 'u-diego', 'u-ana'],
      'Selected users are sorted first, followed by the current user'
    );
  });

  await test('1.3 Searches by name, email, and role', () => {
    assertEquals(
      getVisibleAssignees({ users, selectedIds: [], currentUserId: 'u-ana', query: 'bruno' }).map((option) => option.user.id),
      ['u-bruno'],
      'Name search finds the matching user'
    );
    assertEquals(
      getVisibleAssignees({ users, selectedIds: [], currentUserId: 'u-ana', query: 'diego@' }).map((option) => option.user.id),
      ['u-diego'],
      'Email search finds the matching user'
    );
    assertEquals(
      getVisibleAssignees({ users, selectedIds: [], currentUserId: 'u-ana', query: 'comercial' }).map((option) => option.user.id),
      ['u-diego'],
      'Role search finds the matching user'
    );
  });

  await test('1.4 Toggles individual assignees without duplicates', () => {
    assertEquals(toggleAssignee(['u-ana'], 'u-bruno'), ['u-ana', 'u-bruno'], 'Selecting adds a user once');
    assertEquals(toggleAssignee(['u-ana', 'u-bruno'], 'u-ana'), ['u-bruno'], 'Selecting again removes that user');
  });

  await test('1.5 Closed-field summary exposes two names and an overflow count', () => {
    const summary = getAssigneeSelectionSummary(users, ['u-diego', 'u-ana', 'u-bruno']);
    assertEquals(summary.visible.map((user) => user.id), ['u-diego', 'u-ana'], 'Summary keeps selected order for the first two people');
    assertEquals(summary.extraCount, 1, 'Summary reports remaining selected people as an overflow count');
  });

  console.log('\n================================================================');
  console.log('  ASSIGNEE MULTI-SELECT TEST SUMMARY');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((result) => result.passed).length;
  const failed = results.filter((result) => !result.passed).length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total}`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.error('\nFAILED ASSIGNEE MULTI-SELECT TESTS:');
    results.filter((result) => !result.passed).forEach((result) => {
      console.error(` - ${result.name}: ${result.error}`);
    });
    process.exit(1);
  }

  console.log('\nALL ASSIGNEE MULTI-SELECT CHECKS PASSED.');
}

runAssigneeMultiSelectTests().catch((err) => {
  console.error('Fatal assignee multi-select test runner error:', err);
  process.exit(1);
});
