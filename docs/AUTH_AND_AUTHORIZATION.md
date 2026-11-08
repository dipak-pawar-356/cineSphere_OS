# CineSphere OS — Authentication & Multi-Tenant Authorization Architecture

> **Specification Version:** 2.0.0 (Phase 2 - Part 1)  
> **Status:** Production-Ready Foundation  
> **Identity Provider:** Clerk (`@clerk/nextjs`) & CineSphere RBAC Engine  
> **Multi-Tenant Model:** Strict Context Isolation (`Platform -> Theatres -> Halls -> Shows`)

---

## 1. Architectural Overview & Security Hierarchy

CineSphere OS implements an enterprise multi-tenant Role-Based Access Control (RBAC) and session management system designed for unlimited cinema exhibition circuits with complete tenant data isolation.

```
                  ┌────────────────────────────────────────────────┐
                  │              CineSphere Platform               │
                  │             (Super Admin / Global)             │
                  └───────────────────────┬────────────────────────┘
                                          │ Unrestricted Cross-Circuit
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
       ┌───────────────────────────┐             ┌───────────────────────────┐
       │   Theatre Circuit A       │             │   Theatre Circuit B       │
       │   Tenant: th-pun-001      │             │   Tenant: th-mum-001      │
       │   (CineSphere Grand Pune) │             │   (Royale Palladium Mum)  │
       └─────────────┬─────────────┘             └─────────────┬─────────────┘
                     │ Strict Isolation                        │ Strict Isolation
         ┌───────────┴───────────┐                 ┌───────────┴───────────┐
         ▼                       ▼                 ▼                       ▼
   ┌───────────┐           ┌───────────┐     ┌───────────┐           ┌───────────┐
   │  Hall 1   │           │  Hall 2   │     │  Hall 1   │           │  Hall 2   │
   └───────────┘           └───────────┘     └───────────┘           └───────────┘
```

---

## 2. User Roles & Hierarchy Matrix

Every authenticated actor is assigned exactly one role possessing numerical hierarchy weight and strict operational scope.

| Role | Hierarchy Weight | Tenant Scoped | Landing Route | Access Boundaries |
| :--- | :---: | :---: | :--- | :--- |
| **`SUPER_ADMIN`** | `100` | No (Global) | `/dashboard` | Unrestricted platform governance, all circuits, financial ledgers, audit logs. |
| **`THEATRE_ADMIN`** | `80` | **Yes (`theatreId`)** | `/theatre/dashboard` | Total authority over **only their assigned cinema** (Halls, Shows, Pricing, Staff, UPI). |
| **`HALL_MANAGER`** | `60` | **Yes (`theatreId`)** | `/theatre/halls` | Assigned auditorium hardware calibration, schedule transitions, seat maintenance. |
| **`STAFF`** | `40` | **Yes (`theatreId`)** | `/staff` | Box office ticketing, turnstile QR ticket scanning, concessions POS operations. |
| **`CUSTOMER`** | `10` | No (Patron) | `/profile` | Ticket reservations, watchlist, booking history, customer profile. |

---

## 3. Strict Multi-Tenant Isolation: The Core Invariant

The fundamental security rule of CineSphere OS is:
> **Theatre Admin A can NEVER view, edit, delete, query, or access Theatre Admin B's data.**

### Enforcement Mechanics:
1. **User Identity Binding**: Every `THEATRE_ADMIN`, `HALL_MANAGER`, and `STAFF` possesses a mandatory non-nullable `theatreId`.
2. **Context Resolution**: In incoming HTTP requests, `middleware.ts` extracts and validates the tenant from headers (`x-tenant-id`), domain hostnames (`subdomain.cinesphere.io`), or secure cookies.
3. **Guard Evaluation**:
   ```typescript
   validateTenantAccess(user, targetTheatreId);
   ```
   * If `user.role === 'SUPER_ADMIN'`: Authorized (Platform owner).
   * If `user.role === 'CUSTOMER'`: Authorized (Public patron).
   * If `user.theatreId !== targetTheatreId`: **403 Forbidden** access violation logged with audit telemetry.

---

## 4. Granular RBAC Permissions Catalog

The platform defines fine-grained permissions categorized into operational modules:

### Platform & Governance
* `platform:manage` — Global platform infrastructure and cluster orchestration.
* `platform:settings` — Global commissions, tax presets, and circuit policies.
* `theatres:create` / `theatres:manage_all` / `theatres:delete` — Circuit provisioning.
* `admins:manage` — Provisioning and role assignment for Theatre Admins.
* `audit_logs:view` — Immutable security event audit stream.
* `analytics:view_all` / `reports:view_all` — Cross-tenant revenue aggregation.

### Theatre Operations (Tenant-Scoped)
* `theatre:read_own` / `theatre:update_own` / `theatre:settings_own` — Cinema venue metadata.
* `theatre:upi_configure` — Direct merchant VPA, bank accounts, and settlement rules.
* `theatre:financials_view` — Real-time box office collections and GST splits.
* `halls:create` / `halls:update` / `halls:design_layout` — Parametric auditorium design.
* `movies:schedule` / `shows:create` / `shows:price_sections` — Show-centric pricing matrix.
* `bookings:view_own` / `bookings:refund` — Reservation and cancellation workflows.
* `reports:view_own` — Cinema GST returns and occupancy reports.

### Auditoriums & Hardware
* `halls:view_assigned` — Monitor screen status and projector lamp telemetry.
* `halls:calibrate_hardware` — Warmup cycles, Dolby Atmos sound sweeps, and laser alignment.
* `seats:view_occupancy` / `seats:block_maintenance` — Real-time seat maintenance flags.

### Operations & Box Office
* `tickets:scan` / `tickets:validate` — Optical barcode and turnstile access control.
* `concessions:pos_access` — F&B seat-delivery register.

### Patron Self-Service
* `profile:view_own` / `profile:update_own` — Personal account details.
* `bookings:create` / `bookings:view_own` / `bookings:cancel_eligible` — Ticket bookings.
* `tickets:download_qr` — Dynamic Apple Wallet and PDF QR tickets.

---

## 5. Route Protection & Centralized Middleware

Every route in CineSphere OS is guarded by `middleware.ts` using centralized matching logic:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  return handleAuthMiddleware(request);
}
```

### Route Scope Matrix:

| Route Path | Access Constraint | Unauthenticated Action | Insufficient Role Action |
| :--- | :--- | :--- | :--- |
| `/dashboard/*` | `SUPER_ADMIN` only | Redirect to `/login?redirectUrl=...` | Redirect to `/forbidden` |
| `/theatre/*` | `THEATRE_ADMIN` (or `SUPER_ADMIN`) | Redirect to `/login?redirectUrl=...` | Redirect to `/forbidden` |
| `/hall/*` | `HALL_MANAGER` (or higher) | Redirect to `/login?redirectUrl=...` | Redirect to `/forbidden` |
| `/staff/*` | `STAFF` (or higher) | Redirect to `/login?redirectUrl=...` | Redirect to `/forbidden` |
| `/profile/*` | `CUSTOMER` (or any authenticated user) | Redirect to `/login?redirectUrl=...` | Redirect to `/forbidden` |
| `/*` (Public) | Publicly accessible | Render without impediment | Render without impediment |

---

## 6. Directory Structure

```
auth/
├── constants/
│   ├── auth-routes.ts            # Route patterns, public route arrays, landing paths
│   └── security.constants.ts     # Cookie names, password rules, token timeouts
├── types/
│   ├── role.types.ts             # UserRole union and metadata contracts
│   ├── permission.types.ts       # AppPermission granular catalog
│   ├── user.types.ts             # AuthUser and PostgreSQL DbUser schemas
│   ├── session.types.ts          # TenantContext, UserSession, Clerk claims
│   └── auth.types.ts             # Credentials and API response contracts
├── roles/
│   ├── role-definitions.ts       # Visual metadata, badges, descriptions
│   └── role-hierarchy.ts         # Numerical hierarchy weights and comparisons
├── permissions/
│   ├── permission-definitions.ts # Permission descriptions and module grouping
│   └── rbac-matrix.ts            # Role-to-permission mapping engine
├── guards/
│   ├── route-guards.ts           # Route pattern evaluator and role requirements
│   └── tenant-guard.ts           # Strict tenant-isolation validator
├── helpers/
│   └── auth-helpers.ts           # hasRole, hasPermission, isAuthenticated, etc.
├── services/
│   ├── password-validator.ts     # Complexity checker with actionable feedback
│   ├── mock-auth-service.ts      # Fast developer test identities
│   └── session-service.ts        # LocalStorage and secure cookie management
├── providers/
│   ├── auth-provider.tsx         # Universal AuthContext provider
│   ├── tenant-provider.tsx       # Dedicated TenantContext provider
│   └── clerk-wrapper.tsx         # Resilient ClerkProvider wrapper
├── hooks/
│   ├── use-auth.ts               # Hook for session, signIn, signOut
│   ├── use-role.ts               # Hook for role checks and hierarchy
│   ├── use-tenant.ts             # Hook for tenant identification
│   └── use-permission.ts         # Hook for granular capability checks
├── middleware/
│   └── auth-middleware.ts        # Central Next.js middleware implementation
└── index.ts                      # Barrel export
```

---

## 7. Developer & Architect Test Suite (Fast Role Switcher)

To allow reviewers and architects to evaluate the entire security perimeter without needing multiple external email inboxes:

On the `/login` page, the **Instant Role Simulator** provides one-click authorization into:
1. **Super Admin** (`Vikramaditya Singhania`) -> Unrestricted access to `/dashboard`.
2. **Theatre Admin (Pune)** (`Rajesh Kulkarni`) -> Access to `/theatre` for `th-pun-001` (Galaxy Multiplex).
3. **Theatre Admin (Mumbai)** (`Ananya Deshmukh`) -> Access to `/theatre` for `th-mum-001` (Royale Palladium).
4. **Hall Manager** (`Rohan Shinde`) -> Access to `/theatre/halls` hardware calibration.
5. **Cinema Staff** (`Priya Sharma`) -> Access to `/staff` turnstiles and concessions POS.
6. **Patron / Customer** (`Aarav Mehta`) -> Access to `/profile` and ticket reservations.

---

## 8. Environment Variables

Configure in `.env.local`:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile
```

