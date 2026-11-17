# CineSphere OS — Layout Version Management & Publishing Workflow Architecture
## Phase 4 – Part 11 (Layout Version Management) & Part 12 (Publishing Workflow)

---

## 1. Executive Summary & Core Design Principles

In an enterprise cinema platform operating thousands of concurrent screens across multiple territories, auditorium physical geometry evolves over time: recliners are upgraded, wheelchair bays are expanded, aisles are reconfigured, and audio-visual structural boundaries shift. 

Traditional naive systems treat hall layouts as mutable database records where updating a layout immediately mutates the seating configuration for all associated shows—corrupting existing customer reservations, invalidating printed tickets, and introducing seat collision hazards.

**CineSphere OS eliminates layout mutation entirely.** The Layout Version Management and Publishing Workflow architecture introduces a production-grade, event-driven, immutable layout versioning system coupled with an atomic publishing pipeline and an explicit **Show Compatibility Layer**.

```
Layout Definition (Auditorium Source of Truth)
        │
        ├── Version Registry (Immutable Event Log)
        │       ├── v1 (Archived)
        │       ├── v2 (Archived / Serving Historical Shows)
        │       ├── v3 (Currently Active / Published)
        │       └── v4 (Draft / Branching & Modifications)
        │
        ├── Version Comparison Engine
        │       ├── Section Diff & Capacity Delta
        │       ├── Seat Attribute & Accessibility Diff
        │       ├── Structural Object Transformations
        │       └── Breaking Change Detection
        │
        ├── Publishing Pipeline Engine
        │       ├── Preflight Checklist Evaluation
        │       ├── Validation Engine Gate Check
        │       ├── Version Lock Enforcement
        │       └── Atomic Live Pointer Transition
        │
        └── Show Compatibility Layer
                ├── Historical Shows: Locked to Assigned Version
                ├── Newly Created Shows: Automatically Bind to Active Version
                └── Explicit Show Migration: Audited Upgrade Path
```

---

## 2. Immutable Version Lifecycle & State Machine

Every layout modification creates a new draft version. Once published, a layout version is permanently locked and becomes read-only (`isLocked: true`).

```
                ┌────────────────────────────────────────────────────────┐
                │                                                        │
                ▼                                                        │
         ┌─────────────┐       Review Request      ┌──────────────┐      │
         │    DRAFT    │ ────────────────────────> │    REVIEW    │      │
         └─────────────┘                           └──────────────┘      │
                │                                         │              │
                │ Direct Publish                          │ Approval     │
                │ (If Allowed by Policy)                  ▼              │
                │                                  ┌──────────────┐      │
                └────────────────────────────────> │   APPROVED   │      │
                                                   └──────────────┘      │
                                                          │              │
                                                          │ Publish      │
                                                          ▼              │
                                                   ┌──────────────┐      │
                                                   │  PUBLISHED   │      │
                                                   └──────────────┘      │
                                                          │              │
                                                          │ Superseded   │
                                                          ▼              │
                                                   ┌──────────────┐      │
                                                   │   ARCHIVED   │      │
                                                   └──────────────┘      │
                                                          │              │
                                                          │ Safe Branch  │
                                                          │ / Rollback   │
                                                          └──────────────┘
```

### Lifecycle States
1. **`DRAFT`**: Active development version editable in Hall Designer. Changes trigger audit change events.
2. **`REVIEW`**: Submitted for supervisor or architectural review.
3. **`APPROVED`**: Formally approved by cinema operations; eligible for publishing in regulated theatres.
4. **`PUBLISHED`**: Currently active version for booking inventory generation. Locked against any direct mutation.
5. **`ARCHIVED`**: Previous published version superseded by a newer version. Kept immutable to serve existing historical shows.
6. **`DEPRECATED`**: Older layout marked as retired.

---

## 3. Deep Version Comparison Engine (`VersionComparisonEngine`)

The `VersionComparisonEngine` performs deep two-way diffing between any two layout versions (historical, draft, or published):

```typescript
export interface VersionComparisonDiff {
  sourceVersionId: string;
  sourceVersionNumber: number;
  targetVersionId: string;
  targetVersionNumber: number;
  theatreId: string;
  calculatedAt: string;
  summary: {
    sectionsAdded: number;
    sectionsRemoved: number;
    sectionsModified: number;
    seatsAdded: number;
    seatsRemoved: number;
    seatsModified: number;
    structuralAdded: number;
    structuralRemoved: number;
    structuralModified: number;
    capacityDelta: number;
    hasBreakingChanges: boolean;
  };
  sectionDiffs: SectionDiffItem[];
  seatDiffs: SeatDiffItem[];
  structuralDiffs: StructuralObjectDiffItem[];
  geometrySummary: {
    sourceGrid: GridConfig;
    targetGrid: GridConfig;
  };
  metadataDiff: {
    sourceNotes?: string;
    targetNotes?: string;
    sourceStatus: VersionLifecycleStatus;
    targetStatus: VersionLifecycleStatus;
  };
}
```

### Breaking Change Rules
- Removing any section or seat that existed in the baseline version is flagged as a **breaking change** (`hasBreakingChanges: true`).
- Decreasing total seating capacity is flagged as a potential operational impact.
- Structural obstacle relocations that reduce aisle egress width are tracked in structural diffs.

---

## 4. Safe Rollback System

Because published layouts are strictly immutable, rollback in CineSphere OS **never reverts database records in place**. 

Instead, rollback executes an audited branching operation:
1. The operator selects a historical target version (e.g., v2).
2. The system creates a **fresh draft version** (e.g., v5) whose geometry, sections, seats, and structural objects are deep-copied from v2.
3. The historical version v2 remains untouched and archived.
4. The operator can inspect, validate, and publish v5 through the standard publishing pipeline.

```typescript
const rollbackRes = await layoutVersioningService.rollbackVersion(
  actor,
  layoutDefinitionId,
  targetHistoricalVersionId,
  theatreId,
  "Emergency rollback: restoring certified v2 configuration"
);
// Generated fresh draft v5 derived from historical v2
```

---

## 5. Atomic Publishing Pipeline (`PublishingPipelineEngine`)

Publishing a layout version executes as an atomic transaction that transitions the active live layout without downtime or race conditions:

### Preflight Checklist Verification
Before publication can proceed, `PublishingPipelineEngine.evaluatePreflightChecklist` verifies 9 invariant criteria:
1. **Draft State Verification**: Target version must be `DRAFT` or `APPROVED` (already-published versions cannot be re-published).
2. **Validation Engine Report**: Must pass all critical validation rules with 0 blocking errors (`errorsCount === 0`).
3. **Screen Presence**: Layout must define at least one visible `SCREEN` structural object.
4. **Emergency Egress**: Layout must designate at least one fire emergency exit.
5. **Zero Obstacle Collisions**: SAT spatial math must confirm 0 physical collisions between obstacle structures and customer seats.
6. **Unique Seat Codes**: No duplicate seat identifiers across rows and sections.
7. **Capacity Parity**: Declared section capacities must align with physical seat counts.
8. **Tenant Ownership**: Verification that the layout version belongs to the caller's authorized theatre.
9. **Approval Policy**: If the theatre mandates administrative approval, the version must hold `approvalStatus: "APPROVED"`.

### Version Locking (`enforceVersionLock`)
Once published, `PublishingPipelineEngine.enforceVersionLock` guards the version:
```typescript
if (version.status === "PUBLISHED" || version.status === "ARCHIVED") {
  throw new ConflictError(
    `Immutable Layout Policy: Version v${version.versionNumber} is locked (${version.status}). Create a new draft version to make modifications.`
  );
}
```

---

## 6. Show Compatibility Layer

The Show Compatibility Layer solves the fundamental challenge of cinema operations: **how to change auditorium geometry without altering existing bookings or historical ticket sales.**

```
                 Publish Layout v4 (Active)
                             │
                             ├──────────────────────────┐
                             │                          │
                             ▼                          ▼
               Newly Created Show 101         Existing Show 100
             ┌─────────────────────────┐    ┌─────────────────────────┐
             │ Assigned: Layout v4     │    │ Assigned: Layout v3     │
             │ Status: Active Live     │    │ Status: Locked / Legacy │
             │ Capacity: 100 Seats     │    │ Capacity: 100 Seats     │
             └─────────────────────────┘    └─────────────────────────┘
```

### Invariant Rules
1. **Historical Show Invariance**: Existing shows continue using the layout version assigned at creation time.
2. **Automatic Active Binding**: Newly created shows automatically bind to the active published version.
3. **Explicit Show Migration**: If an auditorium layout is upgraded and the theatre operator wishes to move an existing show to the new layout, an explicit migration workflow (`migrateShowLayout`) is executed with seat mapping verification and audit logging.

---

## 7. Multi-Tenant Publishing Policies

CineSphere OS enforces theatre-specific governance policies across corporate chains and geographic regions:

| Theatre Profile | Tenant ID | Instant Publish | Approval Required | Publish Window | Rollback Enabled |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pune Galaxy Multiplex** | `th-pun-001` | Enabled (Instant) | No | `ANYTIME` | Enabled |
| **Mumbai Royale IMAX** | `th-mum-002` | Disabled | Yes (Admin Required) | `BUSINESS_HOURS` | Disabled |
| **Dubai Grand Mall** | `th-dxb-003` | Disabled | Yes (Multi-Level) | `OFF_PEAK` | Enabled (Scheduled) |

---

## 8. Database Schema & Persistence (Drizzle PostgreSQL)

### Layout Versioning Schema (`db/schema/layout-versioning.ts`)
- `version_history`: Immutable log of every created, branched, and published layout version.
- `version_comparisons`: Cached diff results between version pairs.
- `version_change_events`: Granular change stream capturing seat conversions, geometry shifts, and section modifications.
- `version_policies`: Per-theatre governance parameters (max versions, rollback policies, release notes requirements).

### Publishing Workflow Schema (`db/schema/publishing-workflow.ts`)
- `publishing_configurations`: Multi-tenant publishing rules (approval gates, publishing windows, allowed roles).
- `publishing_history`: Permanent audit log tracking who published each version, when, preflight summary, and release notes.
- `publishing_status`: Live pointer table recording current published version ID and active show counts.
- `show_layout_assignments`: Show Compatibility Layer mapping connecting each show to its specific immutable layout version.

---

## 9. Verification Suite & Test Evidence

Two dedicated verification runners validate 100% of the implementation:

1. **`scripts/verify-layout-versioning.ts` (Phase 4 – Part 11)**:
   - Section 1: Immutable Version Registry & History (Pune, Mumbai, Dubai seeds).
   - Section 2: Branching & Draft Version Creation with deep seat/section cloning.
   - Section 3: Deep Version Comparison Engine (Section, seat, structural diffs).
   - Section 4: Safe Rollback System (generating fresh draft v6 from v2).
   - Section 5: Change History Tracking (`SEAT_CHANGED` audit stream).
   - Section 6: Multi-Tenant Version Policies (Pune 50 vs Mumbai 20 vs Dubai unlimited).
   - Section 7: Protected Server Actions Execution with security context.
   - **Result: 48 / 48 Assertions Passed (100%)**.

2. **`scripts/verify-publishing-workflow.ts` (Phase 4 – Part 12)**:
   - Section 1: Preflight Checklist Verification (blocks missing screen & fire exits).
   - Section 2: Atomic Publishing Pipeline Execution (version lock, live pointer swap).
   - Section 3: Show Compatibility Layer (historical show locked to v2, new show bound to v5, explicit show migration).
   - Section 4: Multi-Tenant Publishing Policies (Pune Instant vs Mumbai Regulated vs Dubai Strict).
   - Section 5: Unpublish / Inactivate Operations.
   - Section 6: Protected Server Actions Execution with RBAC guard.
   - **Result: 34 / 34 Assertions Passed (100%)**.

3. **Regression Test Verification**:
   - `scripts/verify-hall-preview.ts`: 59 / 59 Passed (100%).
   - `scripts/verify-hall-validation.ts`: 50 / 50 Passed (100%).
   - `scripts/verify-structural-objects.ts`: 50 / 50 Passed (100%).
   - `pnpm run type-check` (`tsc --noEmit`): 0 TypeScript errors.
   - `pnpm exec next lint`: 0 warnings or errors.
