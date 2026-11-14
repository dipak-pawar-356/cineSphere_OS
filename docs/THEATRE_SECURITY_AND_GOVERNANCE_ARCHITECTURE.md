# CineSphere OS — Theatre Validation & Security Architecture (Phase 3 – Part 14)

```
========================================================================================
Platform
        │
        ▼
Security & Governance Layer (TheatreGovernanceService)
        │
        ├── 1. Authentication (Identity & Session Verification)
        ├── 2. Authorization (Policy-Based RBAC: canManageTheatre, canPublishTheatre, etc.)
        ├── 3. Tenant Boundary Isolation (assertTenantAccess & Cross-Tenant Prevention)
        ├── 4. Resource Ownership Validation (Cross-Module Tenant Scoping)
        ├── 5. Input Validation Pipeline (Zod Schema & XSS/SQLi Sanitization)
        ├── 6. Theatre-Specific Rule Engine (Upload Quotas, Staff Headcount Caps)
        ├── 7. Optimistic Concurrency Control (Version Checking & 409 Conflict Detection)
        ├── 8. Domain Operation Execution (Clean Architectural Handlers)
        ├── 9. Domain Event Audit Engine (Structured Event Emission & Ledger)
        ├── 10. Chronological Activity History (Audited Operator Event Timeline)
        ├── 11. Soft Delete & Restoration (Non-Destructive Storage & Purge Protection)
        └── 12. Media Validation Engine (MIME, Extension, Size, Virus Stubs)
                │
                ▼
All CineSphere OS Modules (Theatres, Movies, Halls, Shows, Staff, Bookings, Payments)
========================================================================================
```

---

## 1. Architectural Philosophy & The Problem Solved

### The Anti-Pattern
In distributed cinema enterprise architectures, implementing RBAC, tenant isolation, ownership validation, soft deletion, and audit logging independently inside every theatre module leads to severe architectural debt:
1. **Validation Fragmentation:** Subtly different validation logic across modules (`theatre-profile`, `theatre-media`, `theatre-staff`, `theatre-configuration`, `theatre-shows`).
2. **Security Drift:** Newer modules receive updated security practices while older modules suffer from missing ownership or tenant checks.
3. **Hardcoded Platform Assumptions:** Hardcoding upload sizes, staff limits, or authorization roles prevents supporting international venues with diverse regulatory, corporate, or operational constraints.
4. **Scattered Auditing:** Auditing directly from controllers or UI actions misses internal domain events, batch tasks, and automated background jobs.

### The Solution: Reusable Platform Security & Governance Layer
CineSphere OS implements a centralized, reusable **Platform Security & Governance Layer** (`TheatreGovernanceService`, `theatreGovernanceRepository`, `ValidationPipeline`).
- All theatre operations route through a **centralized 9-stage pipeline** executing in deterministic order.
- Authorization is decoupled into **reusable, declarative policies** evaluated against the Phase 2 RBAC matrix.
- Audit records are emitted from **domain events**, ensuring guaranteed consistency across UI actions, server actions, background workers, and APIs.
- Security configurations are **dynamically resolved per tenant** (e.g. Pune 20MB / 100 staff vs Mumbai 50MB / 300 staff vs Dubai 10MB / 50 staff).

---

## 2. Central 9-Stage Validation Pipeline

Every domain mutation executes through `ValidationPipeline.execute(...)` ([`lib/security/validation-pipeline.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/security/validation-pipeline.ts)) in strict sequential order:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION CHECK                                                     │
│    Verifies actor.userId exists and active session context is valid.         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. POLICY-BASED AUTHORIZATION                                               │
│    Evaluates declarative policies (e.g. canManageTheatre, canPublishTheatre).│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. TENANT BOUNDARY ISOLATION                                                │
│    Enforces actor.theatreId === targetTenantId (Super Admin bypass).        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. RESOURCE OWNERSHIP VALIDATION                                            │
│    Asserts target resource belongs to targetTenantId in ownership registry.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. INPUT SANITIZATION & SCHEMA VALIDATION                                   │
│    Sanitizes XSS/SQLi injection and validates against typed Zod schemas.    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. THEATRE-SPECIFIC BUSINESS RULES                                          │
│    Validates dynamic upload limits, staff quotas, and custom rule callbacks.│
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. OPTIMISTIC CONCURRENCY CHECK (OCC)                                       │
│    Compares expectedVersion with current version; throws 409 ConflictError. │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. DOMAIN OPERATION EXECUTION                                               │
│    Invokes the business logic handler with sanitized, validated inputs.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. DOMAIN EVENT AUDIT & ACTIVITY HISTORY                                    │
│    Emits structured DomainSecurityEvent and logs to ActivityHistory ledger.  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Policy-Based Authorization Engine

Rather than scattering role checks throughout UI actions, authorization is encapsulated in declarative policies ([`lib/security/policies/theatre-security-policies.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/security/policies/theatre-security-policies.ts)):

| Policy Key | Allowed Roles / Scope | Denial Behavior |
| :--- | :--- | :--- |
| **`canManageTheatre`** | `SUPER_ADMIN` (any), `THEATRE_ADMIN` (own tenant) | Denies cross-tenant operations; denies Hall Managers/Staff/Customers |
| **`canPublishTheatre`** | `SUPER_ADMIN` exclusively | Denies Theatre Admins (prevents unauthorized publication of unapproved venues) |
| **`canSuspendTheatre`** | `SUPER_ADMIN` exclusively | Denies Theatre Admins (prevents self-suspension without platform oversight) |
| **`canArchiveTheatre`** | `SUPER_ADMIN` exclusively | Denies Theatre Admins |
| **`canUploadMedia`** | `SUPER_ADMIN`, `THEATRE_ADMIN`, `HALL_MANAGER` (own tenant) | Denies frontline staff, customers, and guests |
| **`canEditConfiguration`** | `SUPER_ADMIN`, `THEATRE_ADMIN` (own tenant) | Denies Hall Managers, staff, and customers |
| **`canManageStaff`** | `SUPER_ADMIN`, `THEATRE_ADMIN` (own tenant) | Denies Hall Managers and subordinate crew |
| **`canViewDashboard`** | `SUPER_ADMIN`, `THEATRE_ADMIN`, `HALL_MANAGER`, `STAFF` (own) | Denies public patrons and unauthenticated guests |
| **`canSoftDeleteResource`**| `SUPER_ADMIN`, `THEATRE_ADMIN` (own tenant) | Denies Hall Managers, staff, customers |
| **`canRestoreResource`** | `SUPER_ADMIN`, `THEATRE_ADMIN` (own tenant) | Denies Hall Managers, staff, customers |
| **`canPurgeResource`** | `SUPER_ADMIN` exclusively | Strictly prevents Theatre Admins from permanently deleting production records |

---

## 4. Multi-Tenant Boundary Isolation & Ownership Validation

The `OwnershipValidator` ([`lib/security/ownership-validator.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/security/ownership-validator.ts)) asserts that every resource belongs to the target cinema before reading or mutating:

```typescript
OwnershipValidator.assertResourceOwnership(targetTenantId, resourceType, resourceId, actor);
// Throws OwnershipError if resource belongs to another theatre complex
```

Supported Resource Modules:
- `THEATRE` (core complex entity)
- `MEDIA` (branding logos, billboard banners, auditorium gallery)
- `CONTACT` (voice desks, customer care hotlines, emergency dispatch)
- `AMENITY` (IMAX, Dolby Atmos, recliners, valet parking)
- `BUSINESS_INFO` (corporate identity, GSTIN, PAN, CIN, tax configurations)
- `OPERATING_HOURS` (weekly rotations, holiday exceptions, maintenance downtime)
- `CONFIGURATION` (ticketing quotas, seat hold locks, cancellation formulas)
- `STAFF` (custom roles, crew assignments, shifts)
- `HALL` (auditorium geometries, seating tiers, projection hardware)
- `SHOW` (programmed timetables, localized price profiles)

---

## 5. Dynamic Theatre-Specific Security Configurations

Security policies dynamically respect each theatre's active configuration ([`lib/repositories/theatre-governance.repository.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/repositories/theatre-governance.repository.ts)):

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Theatre A: Pune Flagship    │   │    Theatre B: Mumbai Luxury     │   │      Theatre C: Dubai Palms     │
│          (th-pun-001)           │   │          (th-mum-001)           │   │          (th-dxb-001)           │
├─────────────────────────────────┤   ├─────────────────────────────────┤   ├─────────────────────────────────┤
│ • Media Upload Limit: 20 MB     │   │ • Media Upload Limit: 50 MB     │   │ • Media Upload Limit: 10 MB     │
│ • Maximum Staff Count: 100      │   │ • Maximum Staff Count: 300      │   │ • Maximum Staff Count: 50       │
│ • Configuration Version: 12     │   │ • Configuration Version: 35     │   │ • Configuration Version: 8      │
│ • Soft Delete Retention: 30 days│   │ • Soft Delete Retention: 90 days│   │ • Soft Delete Retention: 15 days│
│ • Allowed MIME Types: Images+MP4│   │ • Allowed MIME Types: Images+MP4│   │ • Allowed MIME Types: Images    │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 6. Media Validation Engine

The `MediaValidator` ([`lib/security/media-validator.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/security/media-validator.ts)) inspects all media uploads prior to storage:
1. **Dynamic Quota Check:** Validates file size against the active theatre limit (e.g. Pune 20MB, Mumbai 50MB, Dubai 10MB).
2. **MIME & Extension Enforcement:** Verifies declared MIME against permitted types (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`) and checks extension concordance.
3. **Path Traversal Defense:** Flags and blocks illegal characters (`..`, `/`, `\`, null bytes, control characters).
4. **Duplicate Detection Placeholder:** Inspects SHA-256 file hashes to detect redundant assets.
5. **Virus Scanning Stub:** Flags malicious payloads (e.g. EICAR test string) with `virusScanStatus: "INFECTED"`.
6. **CDN Ingestion Stub:** Flags verified assets for edge distribution with `cdnValidationStatus: "VALID"`.

---

## 7. Optimistic Concurrency Control (OCC) & Soft Delete Engine

### Optimistic Concurrency Control
- Every governable resource tracks `version`, `eTagPlaceholder` (e.g. `W/"v14-timestamp"`), `updatedAt`, and `updatedBy`.
- When an operator submits an update with `expectedVersion`, the engine compares:
  $$\text{expectedVersion} \equiv \text{currentVersion}$$
- If a background process or concurrent operator modified the record in the meantime, the pipeline immediately aborts with `ConflictError` (`OPTIMISTIC_LOCK_CONFLICT`, HTTP 409), preventing silent overwrites.

### Enterprise Soft Delete
- Production data is **never permanently deleted by default**.
- Calling `softDeleteResource(...)`:
  - Sets `isDeleted: true`, `deletedAt`, `deletedBy`, `deleteReasonPlaceholder`.
  - Calculates `permanentDeleteEligibleAt` based on the theatre's retention window.
  - Increments resource version and records domain events.
- Calling `restoreResource(...)`:
  - Sets `isDeleted: false`, `restoredAt`, `restoredBy`.
  - Clears deletion metadata and restores entity visibility.
- Calling `purgeResource(...)`:
  - Restricted strictly to `SUPER_ADMIN` to prevent operational data loss.

---

## 8. Domain Event Auditing & Activity History

- State transitions automatically produce typed `DomainSecurityEvent` objects ([`types/theatre-security-governance.types.ts`](file:///d:/Project_2k24_25/cineSphere_OS/types/theatre-security-governance.types.ts)):
  - `THEATRE_CREATED`, `THEATRE_UPDATED`, `THEATRE_STATUS_CHANGED`, `THEATRE_PUBLISHED`, `THEATRE_SUSPENDED`, `THEATRE_SOFT_DELETED`, `THEATRE_RESTORED`, `MEDIA_UPLOADED`, `STAFF_ASSIGNED`, `CONFIGURATION_UPDATED`, etc.
- Captured in an immutable in-memory ledger and recorded to the chronological **Activity History** timeline with operator details, affected modules, previous/current version numbers, and correlation IDs.

---

## 9. Reusable Server Actions

The governance layer exposes 7 server actions in [`actions/theatre-governance-actions.ts`](file:///d:/Project_2k24_25/cineSphere_OS/actions/theatre-governance-actions.ts):

1. `validateResourceOwnershipAction`: Validates ownership across any cinema resource.
2. `softDeleteResourceAction`: Performs soft deletion with reason tracking.
3. `restoreResourceAction`: Restores soft-deleted resources.
4. `validateMediaUploadAction`: Validates media against dynamic theatre quotas.
5. `getActivityHistoryAction`: Queries the chronological operator activity history.
6. `evaluatePolicyAction`: Evaluates security policies for client components.
7. `updateSecurityConfigAction`: Updates theatre-specific security configurations.

---

## 10. Verification Matrix & Test Results

The automated test suite in [`scripts/verify-theatre-security-governance.ts`](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-theatre-security-governance.ts) verified **12 / 12 test suites (62 assertions)**:
1. **Test 1:** Reusable Platform Security & Governance Layer Architecture.
2. **Test 2:** Policy-Based Authorization Engine (Super Admin, Theatre Admin, Hall Manager, Customer, Guest).
3. **Test 3:** Multi-Tenant Boundary Isolation & Cross-Tenant Access Prevention (`TenantAccessError`).
4. **Test 4:** Resource Ownership Validation across Modules (`OwnershipError`).
5. **Test 5:** Central 9-Stage Validation Pipeline Execution Order & Stage Benchmarking.
6. **Test 6:** Media Validation with Dynamic Upload Limits (Pune 20MB vs Mumbai 50MB vs Dubai 10MB).
7. **Test 7:** Dynamic Staff Quota Enforcement (`STAFF_QUOTA_EXCEEDED`).
8. **Test 8:** Optimistic Concurrency Control (OCC) & Stale Version Conflict Detection (HTTP 409).
9. **Test 9:** Soft Delete, Non-Destructive Storage, Restoration & Super Admin Purge Protection.
10. **Test 10:** Domain Security Event Auditing.
11. **Test 11:** Chronological Activity History Tracking.
12. **Test 12:** Server Actions & Error Handling Consistency.
