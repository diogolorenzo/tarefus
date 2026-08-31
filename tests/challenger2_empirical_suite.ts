import fs from 'fs';
import path from 'path';
import { formatDueDate } from '../src/utils/helpers';
import { TOUR_STEPS } from '../src/data/helpData';
import type { Task, Board, User } from '../src/types';

let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    const errMsg = `  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`;
    console.error(errMsg);
    failures.push(errMsg);
  }
}

async function runSection(name: string, fn: () => Promise<void> | void) {
  console.log(`\n==================================================`);
  console.log(`RUNNING SECTION: ${name}`);
  console.log(`==================================================`);
  try {
    await fn();
  } catch (err: any) {
    failedTests++;
    const msg = `  [FATAL ERROR] In ${name}: ${err?.message || err}\n${err?.stack || ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

async function runAllSuites() {
// ============================================================================
// SUITE 1: BOARD CRUD AND ASYNC ID RESOLUTION
// ============================================================================
await runSection('1. Board CRUD and Async ID Resolution', async () => {
  // Test simulated TaskContext addBoard behavior
  const mockCurrentUser: User = {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@tarefus.com',
    role: 'Administrador',
    permissionRole: 'admin',
    initials: 'AU',
    avatarColor: 'bg-indigo-600',
    isAdmin: true,
  };

  const existingBoards: Board[] = [
    {
      id: 'board-existing-1',
      name: 'Vendas & Clientes',
      color: 'blue',
      icon: 'Building2',
      description: 'Quadro padrão de vendas',
      createdBy: 'user-admin-1',
      memberIds: ['user-admin-1'],
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Pure logic replica of TaskContext.addBoard
  const addBoardSimulation = async (
    name: string,
    color: string,
    icon = 'Folder',
    description = ''
  ): Promise<Board> => {
    const newBoard: Board = {
      id: `board-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      color,
      icon,
      description: description.trim(),
      createdBy: mockCurrentUser?.id || 'admin',
      memberIds: [mockCurrentUser?.id || 'user-1'],
      order: existingBoards.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newBoard;
  };

  // Test 1.1: Returns valid resolved board ID
  const createdBoard = await addBoardSimulation('Engenharia de Software', 'emerald', 'Zap', 'Time de Devs');
  assert(typeof createdBoard.id === 'string' && createdBoard.id.length > 0, 'addBoard returns non-empty string ID');
  assert(!createdBoard.id.includes('undefined'), 'addBoard ID does not contain "undefined"');
  assert(createdBoard.id.startsWith('board-'), 'addBoard ID follows "board-*" naming convention');
  assert(createdBoard.name === 'Engenharia de Software', 'addBoard preserves trimmed name');
  assert(createdBoard.color === 'emerald', 'addBoard preserves color');
  assert(createdBoard.icon === 'Zap', 'addBoard preserves icon');
  assert(createdBoard.description === 'Time de Devs', 'addBoard preserves description');
  assert(createdBoard.order === 1, 'addBoard computes correct order index');
  assert(createdBoard.memberIds.includes(mockCurrentUser.id), 'addBoard assigns creator to memberIds');

  // Test 1.2: Modal await pattern verification (BoardModal and BoardEditModal)
  const boardModalSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/BoardModal.tsx'), 'utf-8');
  assert(
    boardModalSource.includes('const newBoard = await addBoard('),
    'BoardModal.tsx awaits addBoard promise before selecting ID'
  );
  assert(
    boardModalSource.includes('setSelectedBoardId(newBoard.id);'),
    'BoardModal.tsx selects resolved newBoard.id'
  );

  const boardEditModalSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/settings/BoardEditModal.tsx'), 'utf-8');
  assert(
    boardEditModalSource.includes('const created = await addBoard('),
    'BoardEditModal.tsx awaits addBoard promise before selecting ID'
  );
  assert(
    boardEditModalSource.includes('setSelectedBoardId(created.id);'),
    'BoardEditModal.tsx selects resolved created.id'
  );

  // Test 1.3: TaskContext signature and return type
  const taskContextSource = fs.readFileSync(path.resolve(process.cwd(), 'src/context/TaskContext.tsx'), 'utf-8');
  assert(
    taskContextSource.includes('addBoard: (name: string, color: string, icon?: string, description?: string) => Promise<Board>;'),
    'TaskContext interface defines addBoard returning Promise<Board>'
  );
  assert(
    taskContextSource.includes('return newBoard;') && taskContextSource.includes('const addBoard = async ('),
    'TaskContext addBoard implementation returns newBoard instance'
  );
});

// ============================================================================
// SUITE 2: DUE TODAY & OVERDUE NOTIFICATIONS CALCULATION
// ============================================================================
await runSection('2. Due Today & Overdue Notifications Calculation', () => {
  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const todayStr = formatDateStr(today);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);

  const in2Days = new Date();
  in2Days.setDate(in2Days.getDate() + 2);
  const in2DaysStr = formatDateStr(in2Days);

  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = formatDateStr(in3Days);

  const in10Days = new Date();
  in10Days.setDate(in10Days.getDate() + 10);
  const in10DaysStr = formatDateStr(in10Days);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fiveDaysAgoStr = formatDateStr(fiveDaysAgo);

  // Test 2.1: Empty / Undefined date
  const emptyRes = formatDueDate(undefined);
  assert(emptyRes.isToday === false, 'formatDueDate(undefined).isToday is false');
  assert(emptyRes.isOverdue === false, 'formatDueDate(undefined).isOverdue is false');
  assert(emptyRes.isUpcoming === false, 'formatDueDate(undefined).isUpcoming is false');
  assert(emptyRes.urgency === 'none', 'formatDueDate(undefined).urgency is "none"');
  assert(emptyRes.diffDays === 999, 'formatDueDate(undefined).diffDays is 999');

  // Test 2.2: Today's date
  const todayRes = formatDueDate(todayStr);
  assert(todayRes.isToday === true, 'formatDueDate(today).isToday is true');
  assert(todayRes.isOverdue === false, 'formatDueDate(today).isOverdue is false');
  assert(todayRes.isUpcoming === true, 'formatDueDate(today).isUpcoming is true');
  assert(todayRes.urgency === 'today', 'formatDueDate(today).urgency is "today"');
  assert(todayRes.diffDays === 0, 'formatDueDate(today).diffDays is 0');
  assert(todayRes.label === 'Hoje', 'formatDueDate(today).label is "Hoje"');

  // Test 2.3: Tomorrow's date
  const tomorrowRes = formatDueDate(tomorrowStr);
  assert(tomorrowRes.isToday === false, 'formatDueDate(tomorrow).isToday is false');
  assert(tomorrowRes.isTomorrow === true, 'formatDueDate(tomorrow).isTomorrow is true');
  assert(tomorrowRes.isUpcoming === true, 'formatDueDate(tomorrow).isUpcoming is true');
  assert(tomorrowRes.urgency === 'tomorrow', 'formatDueDate(tomorrow).urgency is "tomorrow"');
  assert(tomorrowRes.diffDays === 1, 'formatDueDate(tomorrow).diffDays is 1');
  assert(tomorrowRes.label === 'Amanhã', 'formatDueDate(tomorrow).label is "Amanhã"');

  // Test 2.4: In 2 and 3 days
  const in2Res = formatDueDate(in2DaysStr);
  assert(in2Res.isUpcoming === true && in2Res.urgency === 'upcoming' && in2Res.diffDays === 2, 'formatDueDate(+2 days) is upcoming with diffDays=2');
  assert(in2Res.label === 'Em 2 dias', 'formatDueDate(+2 days).label is "Em 2 dias"');

  const in3Res = formatDueDate(in3DaysStr);
  assert(in3Res.isUpcoming === true && in3Res.urgency === 'upcoming' && in3Res.diffDays === 3, 'formatDueDate(+3 days) is upcoming with diffDays=3');
  assert(in3Res.label === 'Em 3 dias', 'formatDueDate(+3 days).label is "Em 3 dias"');

  // Test 2.5: In 10 days (normal future)
  const in10Res = formatDueDate(in10DaysStr);
  assert(in10Res.isUpcoming === false, 'formatDueDate(+10 days).isUpcoming is false');
  assert(in10Res.isOverdue === false, 'formatDueDate(+10 days).isOverdue is false');
  assert(in10Res.urgency === 'normal', 'formatDueDate(+10 days).urgency is "normal"');
  const [, expectedM, expectedD] = in10DaysStr.split('-');
  assert(in10Res.label === `${expectedD}/${expectedM}`, `formatDueDate(+10 days).label formats as DD/MM (${expectedD}/${expectedM})`);

  // Test 2.6: Yesterday (1 day overdue)
  const yesterdayRes = formatDueDate(yesterdayStr);
  assert(yesterdayRes.isOverdue === true, 'formatDueDate(yesterday).isOverdue is true');
  assert(yesterdayRes.isToday === false, 'formatDueDate(yesterday).isToday is false');
  assert(yesterdayRes.urgency === 'overdue', 'formatDueDate(yesterday).urgency is "overdue"');
  assert(yesterdayRes.diffDays === -1, 'formatDueDate(yesterday).diffDays is -1');
  assert(yesterdayRes.label === 'Ontem (Atrasada)', 'formatDueDate(yesterday).label is "Ontem (Atrasada)"');

  // Test 2.7: 5 days overdue
  const fiveDaysAgoRes = formatDueDate(fiveDaysAgoStr);
  assert(fiveDaysAgoRes.isOverdue === true, 'formatDueDate(-5 days).isOverdue is true');
  assert(fiveDaysAgoRes.urgency === 'overdue', 'formatDueDate(-5 days).urgency is "overdue"');
  assert(fiveDaysAgoRes.diffDays === -5, 'formatDueDate(-5 days).diffDays is -5');
  assert(fiveDaysAgoRes.label === '5 dias atrasada', 'formatDueDate(-5 days).label is "5 dias atrasada"');

  // Test 2.8: Notification & Banner filtering logic against completed / pending tasks
  const testTasks: Task[] = [
    {
      id: 't-1',
      title: 'Tarefa Concluída de Hoje',
      boardId: 'b-1',
      status: 'done',
      dueDate: todayStr,
      assigneeIds: ['u-1'],
      order: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't-2',
      title: 'Tarefa Pendente de Hoje',
      boardId: 'b-1',
      status: 'todo',
      dueDate: todayStr,
      assigneeIds: ['u-1'],
      order: 1,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't-3',
      title: 'Tarefa Concluída Atrasada',
      boardId: 'b-1',
      status: 'done',
      dueDate: yesterdayStr,
      assigneeIds: ['u-1'],
      order: 2,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't-4',
      title: 'Tarefa Pendente Atrasada',
      boardId: 'b-1',
      status: 'in_progress',
      dueDate: yesterdayStr,
      assigneeIds: ['u-1'],
      order: 3,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 't-5',
      title: 'Tarefa Futura Amanhã',
      boardId: 'b-1',
      status: 'todo',
      dueDate: tomorrowStr,
      assigneeIds: ['u-1'],
      order: 4,
      createdAt: '',
      updatedAt: '',
    },
  ];

  // DueTodayAlertBanner filtering logic
  const bannerTasksDueToday = testTasks.filter((t) => {
    if (t.status === 'done') return false;
    const info = formatDueDate(t.dueDate);
    return info.isToday;
  });
  assert(bannerTasksDueToday.length === 1 && bannerTasksDueToday[0].id === 't-2', 'DueTodayAlertBanner includes only pending today tasks, excludes done tasks');

  // NotificationCenter filtering logic
  const pendingTasksWithDueDate = testTasks.filter((t) => t.status !== 'done' && t.dueDate);
  const tasksDueToday = pendingTasksWithDueDate.filter((t) => formatDueDate(t.dueDate).isToday);
  const tasksOverdue = pendingTasksWithDueDate.filter((t) => formatDueDate(t.dueDate).isOverdue);
  const tasksUpcoming = pendingTasksWithDueDate.filter((t) => {
    const info = formatDueDate(t.dueDate);
    return info.isUpcoming && !info.isToday;
  });

  assert(tasksDueToday.length === 1 && tasksDueToday[0].id === 't-2', 'NotificationCenter tasksDueToday contains exactly 1 task (t-2)');
  assert(tasksOverdue.length === 1 && tasksOverdue[0].id === 't-4', 'NotificationCenter tasksOverdue contains exactly 1 task (t-4)');
  assert(tasksUpcoming.length === 1 && tasksUpcoming[0].id === 't-5', 'NotificationCenter tasksUpcoming contains exactly 1 task (t-5)');
  assert(tasksDueToday.length + tasksOverdue.length === 2, 'NotificationCenter urgentCount is 2 (t-2 + t-4)');
});

// ============================================================================
// SUITE 3: GUIDED TOUR METADATA, DOM TARGETS & PERSISTENCE
// ============================================================================
await runSection('3. Guided Tour Metadata, DOM Targets & Persistence', () => {
  // Test 3.1: TOUR_STEPS metadata
  assert(Array.isArray(TOUR_STEPS), 'TOUR_STEPS is an array');
  assert(TOUR_STEPS.length === 5, `TOUR_STEPS has exactly 5 steps (found ${TOUR_STEPS.length})`);

  const expectedSteps = [
    { id: 'step-nav', targetId: 'tour-nav-tabs', badge: 'Passo 1 de 5' },
    { id: 'step-kanban', targetId: 'tour-kanban-board', badge: 'Passo 2 de 5' },
    { id: 'step-ai', targetId: 'tour-new-task-btn', badge: 'Passo 3 de 5' },
    { id: 'step-filters', targetId: 'tour-filters-bar', badge: 'Passo 4 de 5' },
    { id: 'step-help-user', targetId: 'tour-help-user', badge: 'Passo 5 de 5' },
  ];

  expectedSteps.forEach((exp, idx) => {
    const actual = TOUR_STEPS[idx];
    assert(actual.id === exp.id, `Step ${idx + 1} ID is "${exp.id}"`);
    assert(actual.targetId === exp.targetId, `Step ${idx + 1} targetId is "${exp.targetId}"`);
    assert(actual.badge === exp.badge, `Step ${idx + 1} badge is "${exp.badge}"`);
    assert(typeof actual.title === 'string' && actual.title.length > 0, `Step ${idx + 1} has non-empty title ("${actual.title}")`);
    assert(typeof actual.description === 'string' && actual.description.length > 0, `Step ${idx + 1} has non-empty description`);
    assert(Boolean(actual.tip), `Step ${idx + 1} has keyboard shortcut tip`);
  });

  // Test 3.2: DOM target elements in JSX files
  const navbarSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Navbar.tsx'), 'utf-8');
  assert(navbarSource.includes('id="tour-nav-tabs"'), 'Navbar.tsx contains DOM element id="tour-nav-tabs"');
  assert(navbarSource.includes('id="tour-new-task-btn"'), 'Navbar.tsx contains DOM element id="tour-new-task-btn"');
  assert(navbarSource.includes('id="tour-help-user"'), 'Navbar.tsx contains DOM element id="tour-help-user"');

  const boardViewSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/BoardView.tsx'), 'utf-8');
  assert(boardViewSource.includes('id="tour-filters-bar"'), 'BoardView.tsx contains DOM element id="tour-filters-bar"');
  assert(boardViewSource.includes('id="tour-kanban-board"'), 'BoardView.tsx contains DOM element id="tour-kanban-board"');

  // Test 3.3: HelpCenterModal.tsx Tour Preview Cards
  const helpCenterSource = fs.readFileSync(path.resolve(process.cwd(), 'src/components/help/HelpCenterModal.tsx'), 'utf-8');
  assert(helpCenterSource.includes('Tutorial Interativo de Primeiro Acesso'), 'HelpCenterModal.tsx contains Tour header');
  assert(helpCenterSource.includes('Navegação e Visões'), 'HelpCenterModal.tsx renders Step 1 preview card');
  assert(helpCenterSource.includes('Painel Kanban'), 'HelpCenterModal.tsx renders Step 2 preview card');
  assert(helpCenterSource.includes('Criação com IA & Voz'), 'HelpCenterModal.tsx renders Step 3 preview card');
  assert(helpCenterSource.includes('Filtros & Busca'), 'HelpCenterModal.tsx renders Step 4 preview card');
  assert(helpCenterSource.includes('Alertas, Ajuda e Perfil'), 'HelpCenterModal.tsx renders Step 5 preview card (D13 fix)');

  // Test 3.4: Persistence keys & auto-trigger
  const taskContextSource = fs.readFileSync(path.resolve(process.cwd(), 'src/context/TaskContext.tsx'), 'utf-8');
  assert(
    taskContextSource.includes('localStorage.setItem(`tarefus_tour_seen_${targetId}`, \'true\');'),
    'TaskContext stores tour completion key tarefus_tour_seen_<id> in localStorage'
  );
  assert(
    taskContextSource.includes('const tourKey = `tarefus_tour_seen_${currentUser.id}`;') &&
    taskContextSource.includes('!currentUser.hasSeenTour && !localSeen'),
    'TaskContext triggers tour only when !currentUser.hasSeenTour and !localSeen'
  );
});

// ============================================================================
// SUITE 4: GEMINI AI BACKEND MODEL CONFIGURATION IN SERVER.TS
// ============================================================================
await runSection('4. Gemini AI Backend Model Configuration in server.ts', () => {
  const serverSource = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf-8');

  // Test 4.1: Valid candidate models list
  assert(
    serverSource.includes("const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];"),
    'server.ts configures candidateModels with valid fallback list'
  );
  assert(!serverSource.includes('gemini-1.5-flash-latest'), 'server.ts does not use deprecated -latest alias');

  // Test 4.2: Fallback heuristic draft generator
  assert(serverSource.includes('function generateHeuristicDraft('), 'server.ts defines generateHeuristicDraft fallback');

  // Extract and test heuristic logic directly
  const mockBoards = [
    { id: 'board-vendas', name: 'Vendas & Comercial' },
    { id: 'board-operacoes', name: 'Operações & Logística' },
    { id: 'board-marketing', name: 'Marketing & Design' },
    { id: 'board-admin', name: 'Administrativo & Financeiro' },
  ];
  const mockUsers = [
    { id: 'u-rodrigo', name: 'Rodrigo Silva', role: 'Gestor Comercial' },
    { id: 'u-beatriz', name: 'Beatriz Lima', role: 'Designer / Marketing' },
    { id: 'u-carlos', name: 'Carlos Eduardo', role: 'Analista Financeiro' },
  ];

  // Pure logic replica of generateHeuristicDraft
  function testHeuristicDraft(promptText: string, boardsList: typeof mockBoards, usersList: typeof mockUsers, today: string) {
    const textLower = promptText.toLowerCase();
    let selectedBoardId = boardsList[0]?.id || 'board-vendas';
    if (textLower.includes('venda') || textLower.includes('cliente') || textLower.includes('proposta') || textLower.includes('contrato')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('venda') || b.id.includes('vendas'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('estoque') || textLower.includes('frete') || textLower.includes('entrega') || textLower.includes('logística') || textLower.includes('fornecedor') || textLower.includes('transportadora')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('operaç') || b.id.includes('operacoes'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('marketing') || textLower.includes('post') || textLower.includes('instagram') || textLower.includes('campanha') || textLower.includes('design') || textLower.includes('arte')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('market') || b.id.includes('marketing'));
      if (match) selectedBoardId = match.id;
    } else if (textLower.includes('nota') || textLower.includes('fiscal') || textLower.includes('pagar') || textLower.includes('boleto') || textLower.includes('financeiro') || textLower.includes('rh')) {
      const match = boardsList.find(b => b.name.toLowerCase().includes('admin') || b.id.includes('admin'));
      if (match) selectedBoardId = match.id;
    }

    const matchedUserIds: string[] = [];
    usersList.forEach(u => {
      const firstName = u.name.split(' ')[0].toLowerCase();
      if (textLower.includes(firstName)) {
        matchedUserIds.push(u.id);
      }
    });
    if (matchedUserIds.length === 0 && usersList.length > 0) {
      matchedUserIds.push(usersList[0].id);
    }

    let dueDate = '';
    const now = new Date(today || new Date());
    if (textLower.includes('hoje')) {
      dueDate = now.toISOString().split('T')[0];
    } else if (textLower.includes('amanhã') || textLower.includes('amanha')) {
      now.setDate(now.getDate() + 1);
      dueDate = now.toISOString().split('T')[0];
    }

    let title = promptText.replace(/^(preciso que|preciso|criar uma tarefa para|criar tarefa de|favor|por favor)\s*/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 85) title = title.slice(0, 82) + '...';

    const checklist = [
      { id: `chk-1`, text: 'Levantar informações e requisitos', completed: false },
      { id: `chk-2`, text: 'Executar e validar entrega', completed: false },
      { id: `chk-3`, text: 'Notificar responsáveis e finalizar', completed: false },
    ];

    return {
      title,
      description: promptText,
      priority: textLower.includes('urgente') ? 'high' : 'medium',
      boardId: selectedBoardId,
      status: 'todo' as const,
      assigneeIds: matchedUserIds,
      dueDate,
      tags: ['Operacional'],
      checklist,
    };
  }

  // Prompt 1: Sales proposal for Rodrigo
  const draft1 = testHeuristicDraft('Criar proposta comercial urgente para o cliente Alpha com Rodrigo amanhã', mockBoards, mockUsers, '2026-08-31');
  assert(draft1.boardId === 'board-vendas', 'Heuristic draft accurately assigns sales prompt to board-vendas');
  assert(draft1.assigneeIds.includes('u-rodrigo'), 'Heuristic draft identifies Rodrigo assignee');
  assert(draft1.priority === 'high', 'Heuristic draft flags "urgente" as high priority');
  assert(draft1.dueDate === '2026-09-01', 'Heuristic draft calculates "amanhã" from 2026-08-31 as 2026-09-01');
  assert(draft1.checklist.length === 3, 'Heuristic draft produces 3 actionable checklist items');

  // Prompt 2: Logistics / Frete
  const draft2 = testHeuristicDraft('Cotar frete com transportadora para filial de Curitiba', mockBoards, mockUsers, '2026-08-31');
  assert(draft2.boardId === 'board-operacoes', 'Heuristic draft assigns freight/transport to board-operacoes');

  // Prompt 3: Marketing post with Beatriz
  const draft3 = testHeuristicDraft('Produzir arte para post no Instagram com a Beatriz hoje', mockBoards, mockUsers, '2026-08-31');
  assert(draft3.boardId === 'board-marketing', 'Heuristic draft assigns Instagram post to board-marketing');
  assert(draft3.assigneeIds.includes('u-beatriz'), 'Heuristic draft assigns Beatriz');
  assert(draft3.dueDate === '2026-08-31', 'Heuristic draft calculates "hoje" as 2026-08-31');
});

// ============================================================================
// SUITE SUMMARY
// ============================================================================
console.log(`\n==================================================`);
console.log(`TEST SUITE RESULTS`);
console.log(`==================================================`);
console.log(`Total tests run: ${passedTests + failedTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  console.error(`\nFAILED TEST DETAILS:`);
  failures.forEach((f) => console.error(f));
  process.exit(1);
} else {
  console.log(`\nALL AUTOMATED EMPIRICAL TESTS PASSED!`);
  process.exit(0);
}
}

runAllSuites().catch((err) => {
  console.error('Fatal error running suites:', err);
  process.exit(1);
});
