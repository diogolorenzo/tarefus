# Tarefus Project Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a reproducible, documented, warning-cleaner Tarefus development baseline while preserving product behavior and measuring bundle impact.

**Architecture:** Work on `codex/project-maintenance` from the current `origin/main` commit. Regenerate the lockfile from the existing manifest, update documentation, apply narrowly scoped React warning fixes, and add route-level lazy loading only where the existing router supports a stable fallback. Validate each behavior with existing standalone TypeScript tests plus full build checks.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Firebase, Express, Gemini, oxlint, tsx.

## Global Constraints

- Do not add runtime dependencies.
- Preserve `/`, `/planos`, `/pricing`, `/guia`, `/guide`, `/guia/:slug`, `/login`, and `/register` behavior.
- Preserve Firebase authentication, Firestore persistence, commercial gates, waitlist/trial launch phase, and assignee selection.
- Do not push, merge, deploy, or modify production.
- Keep the lockfile generated from the checked-in `package.json` and validate with `npm.cmd ci --ignore-scripts` if feasible.

---

### Task 1: Lockfile and remote animation baseline

**Files:**
- Create: `package-lock.json`
- Inspect: `src/components/**/*.tsx`, `src/index.css`, `package.json`

- [ ] **Step 1: Generate the lockfile without changing dependency intent**

Run `npm.cmd install --package-lock-only --ignore-scripts` from the worktree and inspect `git diff -- package.json package-lock.json`.

- [ ] **Step 2: Verify the remote animation commit is represented**

Check the modal/dropdown class changes and CSS keyframes in the current branch; do not rewrite them unless typecheck or tests show a regression.

- [ ] **Step 3: Validate reproducible installation**

Run `npm.cmd ci --ignore-scripts` and confirm it exits successfully without changing `package.json` or the lockfile.

- [ ] **Step 4: Commit the dependency baseline**

Run `git add package-lock.json` and `git commit -m "chore: restore dependency lockfile"`.

### Task 2: Current README and development operations

**Files:**
- Modify: `README.md`
- Reference: `.env.example`, `package.json`, `server.ts`, `src/lib/firebase.ts`, `src/content/home.ts`

- [ ] **Step 1: Write documentation acceptance checks**

Use `rg` checks to require the README to mention Firebase, Gemini, Express, `VITE_TAREFUS_LAUNCH_PHASE`, `npm.cmd run dev`, `npm.cmd run build`, public routes, and that production credentials are not committed.

- [ ] **Step 2: Replace the stale MVP README**

Document current architecture, local setup, environment variables, launch phases, public/authenticated routes, test commands, known limitations, and the distinction between local validation and production operation.

- [ ] **Step 3: Run the documentation checks and commit**

Run the `rg` checks, `git diff --check`, then commit `git add README.md; git commit -m "docs: document current application architecture"`.

### Task 3: Actionable React warning cleanup

**Files:**
- Modify: `src/components/guide/GuideLandingPage.tsx`
- Modify: `src/site/hooks/useSiteHooks.ts`
- Modify: `src/components/auth/AuthPage.tsx`
- Modify: `src/context/TaskContext.tsx`
- Test: existing routing/theme, hygiene, and assignee suites; add a focused regression test only if a behavior change cannot be covered by existing tests.

- [ ] **Step 1: Capture the warning baseline**

Run `npm.cmd run lint > lint-before.txt` and record application warnings separately from test-fixture warnings.

- [ ] **Step 2: Write or identify behavior checks before each production edit**

For route/query synchronization, assert the existing guide route tests. For auth navigation, assert the existing auth/routing tests. For TaskContext changes, run the assignee and hygiene tests before changing code.

- [ ] **Step 3: Apply minimal fixes**

Derive query state where safe instead of synchronously setting state in an effect; stabilize callbacks or dependencies rather than suppressing lint; and remove render-time randomness only when the change preserves generated IDs/session semantics. Do not rewrite the Context architecture.

- [ ] **Step 4: Verify warning reduction**

Run `npm.cmd run lint` and compare application warning count to the baseline. Any remaining warning must be documented with its reason and risk.

- [ ] **Step 5: Commit the warning cleanup**

Run `git add src tests; git commit -m "refactor: clean actionable react warnings"`.

### Task 4: Safe public-route code splitting

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx` only if the lazy fallback boundary requires it.
- Test: `tests/routing_theme_integration.test.ts`, `tests/public-route-resolver-contract.test.ts`, `tests/pricing_components.test.ts`, `tests/guide_components_ui.test.ts`.

- [ ] **Step 1: Add a regression assertion for the public route contract**

Run the existing route tests and add only the smallest assertion needed to prove the loading fallback does not replace the resolved route.

- [ ] **Step 2: Implement route-level lazy loading**

Use `React.lazy` and `Suspense` for pricing and guide page modules while leaving shared navigation and `TaskProvider` eager. The fallback must use the existing app tokens and be accessible.

- [ ] **Step 3: Verify route behavior and measure chunks**

Run route/component suites and `npm.cmd run build`; record the largest initial and public-route chunks before/after. Revert the split if it increases initial payload or causes route failures.

- [ ] **Step 4: Commit the accepted bundle change**

Run `git diff --check`, then commit `git add src tests; git commit -m "perf: split public route bundles"`.

### Task 5: Full verification and handoff

**Files:**
- Inspect: all changed files and Git status.

- [ ] **Step 1: Run validation**

Run `npm.cmd run lint`, `npx.cmd tsc --noEmit`, all relevant standalone `tsx` suites, and `npm.cmd run build`.

- [ ] **Step 2: Check repository integrity**

Run `git diff --check`, `git status --short --branch`, and confirm the worktree contains only intentional commits/files.

- [ ] **Step 3: Report evidence and limits**

Report branch, commits, tests, remaining warnings, bundle measurements, and explicitly state that no push, merge, deployment, or live Firebase/Gemini validation was performed.
