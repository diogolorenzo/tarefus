# Tarefus Project Maintenance Design

## Goal

Bring the repository back to a reliable, understandable development baseline by preserving dependency reproducibility, documenting the current Firebase/Gemini architecture, addressing actionable React lint warnings, and reducing the initial client bundle without changing product behavior.

## Scope

1. Review the remote animation refactor already present on `origin/main`; retain its behavior and restore a committed `package-lock.json` generated from the existing `package.json`.
2. Replace the outdated MVP README with current setup, environment, architecture, routes, test commands, and launch-phase guidance.
3. Fix actionable warnings in application code only where the behavior is clear: effect dependency stability, state derivation, and unsafe render-time randomness. Existing test-fixture unused-import warnings remain out of scope unless touched by the refactor.
4. Split public pricing/guide routes with dynamic imports where the current router permits it, measure the largest chunks, and preserve direct-route behavior.

## Constraints

- Work only in `codex/project-maintenance` and do not merge, push, or activate production.
- Do not add runtime dependencies. `package-lock.json` must match the checked-in `package.json`.
- Keep the existing React 19, TypeScript, Vite, Tailwind, Firebase, and Express architecture.
- Preserve public route URLs, waitlist/trial behavior, authentication, billing gates, and task assignment semantics.
- Use tests to lock down each behavior change before implementation; run lint, typecheck, test suites, and production build before completion.

## Design

The documentation changes are isolated to `README.md` and provide commands based on `npm.cmd`, an `.env.example` mapping, Firebase/Gemini prerequisites, and known operational boundaries. The lockfile is regenerated rather than hand-edited.

Warning cleanup will favor small, local changes: move values that are derived from existing inputs into render-time derivation, stabilize callbacks used by effects, and inject or memoize values that must not be regenerated during render. No broad Context rewrite is planned.

Bundle work will use route-level `import()` boundaries for public pricing/guide code only if the existing router can render a loading fallback without changing URL history. If the resulting build does not improve the initial chunk or introduces route regressions, retain the current synchronous path and document the measured result instead of forcing a risky split.

## Verification

- Existing targeted tests plus new regression tests for any changed behavior.
- `npm.cmd run lint` with no new application warnings.
- `npx.cmd tsc --noEmit`.
- Full available test scripts, including commercial, AI, routing/theme, hygiene, and assignee suites.
- `npm.cmd run build` and comparison of generated chunk sizes.
- `git diff --check` and clean/expected worktree status.
