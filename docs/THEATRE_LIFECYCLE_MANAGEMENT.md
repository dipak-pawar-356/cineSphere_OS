# CineSphere OS — Theatre Lifecycle Management Architecture (Phase 3 – Part 1)

## 1. Executive Summary

The **Theatre Lifecycle Management** subsystem establishes enterprise governance for multi-tenant cinema properties across their complete operational lifespan—from initial draft creation and KYC verification to live box office exhibition, temporary suspension, read-only archival, and compliant soft deletion.

Designed strictly around **Domain-Driven Design (DDD)** principles and CineSphere OS's layered architecture, all lifecycle state transitions, optimistic concurrency locks, unique slug rules, and multi-tenant authorization checks live exclusively inside `TheatreLifecycleService` and `TheatreLifecycleRepository`, exposed to Next.js UI layers solely through security-hardened Server Actions.

---

## 2. Lifecycle Finite State Machine

Every cinema complex adheres to a deterministic Finite State Machine enforced via `ALLOWED_TRANSITIONS` in `lib/services/theatre-lifecycle.service.ts`:

```
   ┌────────────────────────────────────────────────────────────┐
   ▼                                                            │
[DRAFT] ──(Submit KYC)──► [PENDING_APPROVAL] ──(Reject/Rev)─────┘
   │                             │
   │                             └──(Approve)──► [APPROVED]
   │                                                 │
   │                                            (Activate)
   │                                                 ▼
   │                                             [ACTIVE] ◄───(Resume)─── [SUSPENDED]
   │                                              │    │                       │
   │                                       (Deactivate) └───(Suspend)──────────┘
   │                                              ▼                            │
   │                                          [INACTIVE]                       │
   │                                              │                            │
   ▼                                              ▼                            ▼
[SOFT_DELETED] ◄───────────────────────────── [ARCHIVED] ◄─────────────────────┘
  (Terminal)                                  (Read-Only; Restorable to ACTIVE/INACTIVE)
```

### State Transition & Capability Matrix

| Lifecycle State | Bookings Allowed | Shows Allowed | Payments Allowed | Read-Only Mode | Permitted Next States |
|---|---|---|---|---|---|
| `DRAFT` | No | No | No | No | `PENDING_APPROVAL`, `SOFT_DELETED` |
| `PENDING_APPROVAL` | No | No | No | No | `APPROVED`, `DRAFT`, `SOFT_DELETED` |
| `APPROVED` | No | No | No | No | `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `SOFT_DELETED` |
| `ACTIVE` | **Yes** | **Yes** | **Yes** | No | `INACTIVE`, `SUSPENDED`, `ARCHIVED` |
| `INACTIVE` | No | No | No | No | `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `SOFT_DELETED` |
| `SUSPENDED` | **Locked** | **Locked** | **Locked** | No | `ACTIVE`, `ARCHIVED`, `SOFT_DELETED` |
| `ARCHIVED` | No | No | No | **Yes** | `ACTIVE`, `INACTIVE`, `SOFT_DELETED` |
| `SOFT_DELETED` | No | No | No | **Yes** | *(Terminal — no transitions allowed)* |

> **Critical Invariant:** An `ACTIVE` theatre **cannot** be soft-deleted directly. Operators must first deactivate, suspend, or archive the complex before initiating soft deletion. Hard `DELETE` operations are never exposed.

---

## 3. Database Schema & Relational Tables

Defined in `db/schema/enums.ts`, `db/schema/theatres.ts`, and wired in `db/schema/relations.ts`:

1. **`theatres` (Extended Tenant Root)**
   - Adds `publicId` (e.g., `TH-PUB-8K92X1`), `approvalStatus` (`theatreApprovalStatusEnum`), `version` (optimistic locking counter), suspension metadata (`suspendedAt`, `suspendedBy`, `suspensionReason`, `suspensionEndTime`), archival metadata (`archivedAt`, `archivedBy`), and soft-delete fields (`deletedBy`, `deleteReason`, `deletedAt`, `isDeleted`).
2. **`theatreLifecycle` (`theatre_lifecycle`)**
   - 1:1 authoritative state machine & capability flags (`currentState`, `previousState`, `approvalState`, `allowBookings`, `allowShows`, `allowPayments`, `isReadOnly`, `defaultConfiguration`, `lastTransitionAt`, `lastTransitionBy`, `version`).
3. **`theatreStatusHistory` (`theatre_status_history`)**
   - Immutable append-only transition ledger tracking `fromStatus`, `toStatus`, `reason`, `changedBy`, `changedByRole`, `metadata`, and `createdAt`.
4. **`theatreApprovals` (`theatre_approvals`)**
   - Tracks formal KYC verification reviews (`PENDING`, `APPROVED`, `REJECTED`, `REVISION_REQUESTED`), `approverId`, `approverName`, reviewer comments, and `reviewedAt`.
5. **`theatreSlugHistory` (`theatre_slug_history`)**
   - Preserves historical `oldSlug -> newSlug` transitions with `redirectEnabled` placeholder flag for future HTTP 301 SEO redirects and duplicate collision blocking.

---

## 4. Core Capabilities & Governance Rules

### 4.1 Optimistic Locking (`version`)
Every theatre update (`updateTheatre`) requires `expectedVersion`. `TheatreLifecycleRepository.updateWithOptimisticLock` atomically compares the stored `version` against `expectedVersion` and increments `version + 1` on success, throwing `ConflictError` if stale data is submitted concurrently.

### 4.2 SEO Slug Management
- **Auto-Generation:** Generates sanitized slugs from `name` and optional `city` (e.g., `cineplex-royal-satara-satara`), automatically appending numeric suffixes (`-2`, `-3`, …) upon natural collisions.
- **Manual Override & Collision Protection:** Allows explicit slug overrides validated against `SLUG_REGEX` (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) and rejects collisions against both active theatre slugs and historical slugs reserved in `theatreSlugHistory`.

### 4.3 Multi-Stage Approval Workflow
- **Submit:** Transitions `DRAFT -> PENDING_APPROVAL` and logs a `PENDING` entry in `theatreApprovals`.
- **Approve:** Transitions `PENDING_APPROVAL -> APPROVED` with `approvalStatus = "APPROVED"` and review comments.
- **Reject / Request Revision:** Transitions `PENDING_APPROVAL -> DRAFT` with mandatory review comments and sets `approvalStatus` to `REJECTED` or `REVISION_REQUESTED`.

### 4.4 Suspension, Archival & Soft Delete
- **Suspend (`ACTIVE -> SUSPENDED`):** Captures mandatory `reason`, `startTime`, optional `endTimePlaceholder`, `suspendedBy`, and locks `allowBookings`, `allowShows`, and `allowPayments`. Resuming restores `ACTIVE` capabilities.
- **Archive (`* -> ARCHIVED`):** Stores `previousState` and sets `isReadOnly = true`. Standard field edits are blocked on archived properties until restored via `restoreTheatre`.
- **Soft Delete (`!ACTIVE -> SOFT_DELETED`):** Captures `deletedBy`, `deletedAt`, and mandatory `deleteReason`. Excluded from default fleet queries unless `includeDeleted: true` is supplied.

---

## 5. Multi-Tenant RBAC & Layer Architecture

### Role Boundaries
- **`SUPER_ADMIN`:** Full lifecycle authority across all cinema properties (create, edit any field, submit/approve/reject/request revision, activate, suspend/resume, archive/restore, soft delete, search fleet including deleted/archived).
- **`THEATRE_ADMIN`:** Strictly scoped by `tenantService.assertTenantAccess` to their assigned complex (e.g., `th-pun-001`):
  - **Allowed Edits (`TheatreAdminEditableFields`):** `tagline`, `description`, `contactEmail`, `contactNumber`, `address`, `pinCode`, `branding`, `defaultConfig`.
  - **Blocked Actions:** Cannot mutate `name`, `slug`, `chain`, `gstNumber`, `pricingTier`, `subscriptionPlan`, or invoke any lifecycle governance transition. Cross-tenant requests immediately log critical `TENANT_VIOLATION` events.

### Clean Layered Execution Flow

```
Next.js UI Components (@/components/theatre-lifecycle/*, /dashboard/theatres/*, /theatre/profile)
        │
        ▼
Protected Server Actions (@/actions/theatre-lifecycle-actions.ts via createProtectedAction)
        │
        ▼
Domain Service (@/lib/services/theatre-lifecycle.service.ts — state machine, RBAC, slug, locks)
        │
        ▼
Repository (@/lib/repositories/theatre-lifecycle.repository.ts — optimistic locking, ledgers)
        │
        ▼
PostgreSQL / Drizzle Schema (@/db/schema/theatres.ts & @/db/schema/relations.ts)
```

### Exposed Server Actions (`actions/theatre-lifecycle-actions.ts`)
- `createTheatreLifecycleAction`
- `updateTheatreLifecycleAction`
- `submitTheatreForApprovalAction`
- `approveTheatreLifecycleAction`
- `rejectTheatreLifecycleAction`
- `requestTheatreRevisionAction`
- `activateTheatreLifecycleAction`
- `suspendTheatreLifecycleAction`
- `resumeTheatreLifecycleAction`
- `archiveTheatreLifecycleAction`
- `restoreTheatreLifecycleAction`
- `softDeleteTheatreLifecycleAction`
- `generateTheatreSlugAction`
- `validateTheatreSlugAction`
- `searchTheatresLifecycleAction`
- `getTheatreLifecycleDetailAction`

---

## 6. UI Integrations & Verification

- **Reusable Components (`components/theatre-lifecycle/*`):**
  - `LifecycleStatusBadge` & `ApprovalStatusBadge`
  - `LifecycleActionModal` (Approve, Reject, Request Revision, Suspend, Archive, Restore, Soft Delete — accessible `role="dialog"` with `Escape` support & lazy-loaded via `next/dynamic`)
  - `CreateEditTheatreModal` (role-aware field locking, live slug generation/validation, branding & default config, WAI-ARIA `tablist`/`tab` navigation, lazy-loaded via `next/dynamic`)
  - `TheatreLifecyclePanel` (interactive state machine pipeline, operational locks, immutable status/approval/slug/audit timelines)
- **Portal Routes Integrated:**
  - Super Admin Directory (`app/(super-admin)/dashboard/theatres/page.tsx`) — Server-Action-backed search, multi-faceted filters (`Status`, `Approval Status`, `Created ≥`, `Updated ≥`, `Suspended Only`, `Archived Only`, `Show Deleted`), pagination, KPI cards, and lazy-mounted lifecycle modals.
  - Super Admin Inspector (`app/(super-admin)/dashboard/theatres/[id]/page.tsx`) — Added `"lifecycle"` governance tab displaying lazy-loaded `TheatreLifecyclePanel` and header transition actions.
  - Theatre Admin Profile (`app/(theatre-admin)/theatre/profile/page.tsx`) — Read-only lifecycle governance & capability banner (`th-pun-001`) plus restricted lazy-loaded `THEATRE_ADMIN` edit modal.
- **Verification Suite (`scripts/verify-theatre-lifecycle.ts`):**
  - Run `npx tsx scripts/verify-theatre-lifecycle.ts` (or `.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-theatre-lifecycle.ts`) to execute 10 verification suites covering creation, slug collision prevention, transition matrix rules, approval revision loops, suspension lockouts, optimistic locking conflicts, archive read-only guards, soft-delete protection, RBAC/tenant isolation, and complete audit trails.

