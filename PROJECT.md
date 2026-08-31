# Project: Tarefus — Codebase Inspection, Architectural Audit & Remediation

## Architecture Overview
- **Frontend Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + `@hello-pangea/dnd` + Lucide Icons
- **Backend & Persistence**:
  - Hybrid persistence: LocalStorage (primary offline fallback) + Firebase Cloud Firestore BaaS
  - Express server (`server.ts`) for Gemini AI task creation proxy and static assets
- **Security & RBAC**:
  - Role-Based Access Control matrix (`admin`, `manager`, `member`)
  - Session tokens persisted in `localStorage` (rememberMe: true) or `sessionStorage` (rememberMe: false)
  - Last-Admin safety invariant: system must always have >= 1 active admin
- **Onboarding & Usability**:
  - 5-step interactive Guided Tour with SVG spotlight mask and localStorage/Firestore completion flag
  - Central de Ajuda (Help Center) with FAQ search, keyboard shortcuts, and AI guide
  - Due today / overdue notification banners and drawer

## Feature Inventory & Defect Catalog
| # | Feature / Defect | Description | Milestone | Source |
|---|------------------|-------------|-----------|--------|
| 1 | D1: Auth Session & Auto-Login Bypass | Fix login bypass on refresh and ensure clean logout in `storage.ts` & `TaskContext.tsx` | M1 (Auth & Session) | DONE |
| 2 | D2: Firestore `undefined` Values on Password Reset | Sanitize Firestore objects and eliminate `undefined` fields in `firestoreService.ts` / `TaskContext.tsx` | M1 (Auth & Session) | DONE |
| 3 | D3: Password Reset Code Expiration | Enforce 15-min expiration on reset code in `TaskContext.tsx` | M1 (Auth & Session) | DONE |
| 4 | D4: Email Uniqueness in `addUser` | Validate duplicate email before adding user in `TaskContext.tsx` | M1 (Auth & Session) | DONE |
| 5 | D5: Firebase Auth Session Cleanup | Call `logoutFirebase` during `logout()` in `TaskContext.tsx` | M1 (Auth & Session) | DONE |
| 6 | D6: RBAC `canEditBoard` Logic Bug | Remove `|| true` short-circuit in `src/utils/rbac.ts` | M2 (RBAC & Security) | DONE |
| 7 | D7: Task Deletion Permission Enforcement | Guard "Excluir" button in `TaskModal.tsx` with `canDeleteTask` | M2 (RBAC & Security) | DONE |
| 8 | D8: Company Settings Admin Restriction | Guard `company` tab in `SettingsView.tsx` and form in `CompanyGeneralSettings.tsx` | M2 (RBAC & Security) | DONE |
| 9 | D9: Member Promotion & Deletion RBAC | Restrict role selector and user delete in `MembersSettings.tsx` to Admins only | M2 (RBAC & Security) | DONE |
| 10 | D10: Board Deletion RBAC in Areas Settings | Check `canDeleteBoard` in `AreasSettings.tsx` | M2 (RBAC & Security) | DONE |
| 11 | D11: Audit Logs & Reseed Protection | Restrict `audit` tab in `SettingsView.tsx` and reseed in `AuditLogsSettings.tsx` to Admins | M2 (RBAC & Security) | DONE |
| 12 | D12: Async `addBoard` `await` Fix | Add `await` to `addBoard` calls in `BoardModal.tsx` and `BoardEditModal.tsx` | M3 (Usability & Modals) | DONE |
| 13 | D13: Help Center 5-step Preview Card | Render 5th card in Tour preview of `HelpCenterModal.tsx` | M3 (Usability & Modals) | DONE |
| 14 | D14: Audit Log Filter Mapping | Map `status_change` under `move` filter in `AuditLogsSettings.tsx` | M3 (Usability & Modals) | DONE |
| 15 | D15: Empty Collection Handling & Seed Metadata | Support empty task lists in `subscribeToTasks` and use metadata marker for seeding in `firestoreService.ts` | M4 (Data Sync & Backend) | DONE |
| 16 | D16: Cloud Cascade on Board/User Delete | Batch update tasks in Firestore when deleting board or user in `TaskContext.tsx` | M4 (Data Sync & Backend) | DONE |
| 17 | D17: Gemini Model Names Fix | Update candidate models to valid IDs in `server.ts` | M4 (Data Sync & Backend) | DONE |
| 18 | D18: Build, Lint & Type Safety Verification | Ensure zero TypeScript errors, clean oxlint, and clean production build | M5 (Final Verification) | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Auth & Session Integrity | D1, D2, D3, D4, D5 in `storage.ts`, `TaskContext.tsx`, `firestoreService.ts` | none | DONE |
| M2 | RBAC Permissions Hardening | D6, D7, D8, D9, D10, D11 in `rbac.ts`, `TaskModal.tsx`, `SettingsView.tsx`, `CompanyGeneralSettings.tsx`, `MembersSettings.tsx`, `AreasSettings.tsx`, `AuditLogsSettings.tsx` | M1 | DONE |
| M3 | Usability, Modals & Help Center | D12, D13, D14 in `BoardModal.tsx`, `BoardEditModal.tsx`, `HelpCenterModal.tsx`, `AuditLogsSettings.tsx` | M1 | DONE |
| M4 | Persistence Sync & AI Backend | D15, D16, D17 in `firestoreService.ts`, `TaskContext.tsx`, `server.ts` | M1 | DONE |
| M5 | Quality Gate & Usability Verification | Build, lint, 2 Reviewers, 2 Challengers, 1 Forensic Auditor | M1, M2, M3, M4 | DONE |

## Code Layout
- `src/types/index.ts`: Core domain interfaces (`User`, `Task`, `Board`, `CompanyInfo`, `ActivityLog`, `PermissionRole`)
- `src/utils/rbac.ts`: Pure RBAC authorization predicates
- `src/services/storage.ts`: LocalStorage and SessionStorage serialization
- `src/services/firestoreService.ts`: Firestore BaaS CRUD and subscriptions
- `src/context/TaskContext.tsx`: Global React Context provider for state management
- `src/components/auth/AuthPage.tsx`: Login, Register, Password Reset views
- `src/components/help/HelpCenterModal.tsx`: FAQ, Shortcuts, AI guide, Tour trigger
- `src/components/tour/GuidedTour.tsx`: 5-step spotlight onboarding
- `src/components/settings/*`: Settings sub-views with RBAC guards
- `src/components/BoardView.tsx`, `KanbanBoard.tsx`, `TaskModal.tsx`: Kanban workflows
- `server.ts`: Node/Express backend with Gemini AI endpoint
