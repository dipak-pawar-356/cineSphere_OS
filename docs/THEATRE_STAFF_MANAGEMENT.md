# CineSphere OS — Phase 3 Part 10: Theatre Staff Management & Dynamic RBAC Hierarchy

## 1. Executive Architectural Overview

In traditional or legacy single-tier systems, staff roles are frequently hardcoded into static enumerations (e.g., `ROLE = 'ADMIN' | 'MANAGER' | 'COUNTER'`). In a modern, enterprise multi-tenant cinema SaaS platform like **CineSphere OS**, hardcoding roles breaks down immediately:
- **Tenant Autonomy:** Theatre A (e.g., a luxury boutique cine-lounge) requires bespoke roles like *VIP Lounge Concierge*, *Sommelier*, and *Butler Dining Chef Lead*.
- **Operational Variations:** Theatre B (e.g., an IMAX multiplex chain) requires *IMAX Projection Engineer*, *Turnstile Operator*, and *Laser Optical Specialist*.
- **Multi-Branch Hierarchy:** Chain organizations require central standard templates that can be customized or overridden at individual cinema branches without global schema migrations.
- **Dynamic Granular Capabilities:** Permissions must be decoupled from role titles. Authorization is strictly **capability-based** (e.g., `bookings:read`, `halls:calibrate`), not string-based role checks.

### Recommended Architectural Hierarchy
```
Platform
   │
   ▼
Permission Catalog (Standard Granular Capabilities across all Modules)
   │
   ▼
Role Templates (Curated Starting Points provided by Platform Super Admins)
   │
   ▼
Theatre (Tenant)
   │
   ▼
Staff Organization
   ├── Staff Members (Employee Code, Designation, Status, Contact)
   ├── Theatre Roles (Tenant-Owned Roles & Instantiated Templates)
   ├── Permission Sets (Granular Module Mappings per Role)
   ├── Department Units (Operations, Projection, Security, Food Court, etc.)
   ├── Role History Ledger (Immutable Transition Log: Promoted, Transferred, Assigned)
   └── Future Scheduling Placeholders (Shifts, Biometric, Payroll Extensibility)
```

---

## 2. Core Architectural Pillars

### 2.1 Dynamic RBAC & Capability-Based Access Control
- **Zero Hardcoded Theatre Roles:** Roles belong to the specific `theatreId` tenant.
- **Platform Permission Catalog:** 20+ granular, module-scoped capabilities:
  - `THEATRE`: `theatres:read`, `theatres:update`, `theatres:lifecycle`
  - `STAFF`: `staff:read`, `staff:create`, `staff:update`, `staff:roles:manage`
  - `HALLS`: `halls:read`, `halls:update`, `halls:calibrate`
  - `SHOWS`: `shows:read`, `shows:create`, `shows:cancel`
  - `BOOKINGS`: `bookings:read`, `bookings:create`, `bookings:override`
  - `CONCESSIONS`: `concessions:read`, `concessions:pos`
  - `ANALYTICS`: `analytics:read`, `analytics:export`
  - `PLATFORM`: `platform:manage` (strictly reserved for Super Admins)
- **Multi-Role Capability:** A crew member can hold multiple operational roles simultaneously (e.g., Primary: *Hall Manager*, Secondary: *Butler Dining Chef Lead*).
- **Status Override:** When a staff member is transitioned to `SUSPENDED`, `INACTIVE`, `RESIGNED`, or `ARCHIVED`, all capability permissions are revoked instantaneously regardless of assigned roles.

### 2.2 Template-to-Tenant Instantiation
- Platform Super Admins maintain standard **Role Templates** (e.g., `TEMPLATE_THEATRE_ADMIN`, `TEMPLATE_HALL_MGR`, `TEMPLATE_FOOD_COURT`, `TEMPLATE_PROJECTION`).
- A Theatre Admin can instantiate any template with one click, giving it custom naming, custom hierarchy levels, and overriding individual permission toggles without mutating the upstream template.

### 2.3 Strict Multi-Tenant Isolation
- Every staff member, department, role, permission grant, and role assignment is bounded by `theatreId`.
- Cross-tenant lookups or mutations are intercepted at both the **Action Guard** (`enforceTenantIsolation: true`) and **Domain Service** (`tenantService.assertTenantAccess`) levels, generating high-priority `TENANT_VIOLATION` security audit records upon unauthorized attempts.

### 2.4 Staff Lifecycle Governance
Staff members move through a formalized state machine:
```
INVITED ──► ACTIVE ◄──► SUSPENDED
              │
              ├──► RESIGNED
              └──► ARCHIVED
```
- **INVITED:** Staff invited via email dispatch, assigned an invitation token and temporary code (`INV-XXXXXX`).
- **ACTIVE:** Fully onboarded crew member with unique employee code (e.g., `EMP-PUN-001`).
- **SUSPENDED:** Temporarily locked out pending safety review or disciplinary inquiry; permissions immediately blocked.
- **ARCHIVED:** Off-boarded from active duty; profile retained for statutory labor audit trails.

### 2.5 Immutable Role Transition History
Every role grant, revocation, promotion, or transfer is logged to `staff_role_history` with:
- `staffId`, `theatreId`, `roleId`
- `changeType`: `ASSIGNED`, `PROMOTED`, `DEMOTED`, `TRANSFERRED`, `REVOKED`
- `reason`, `authorizedBy`, `authorizedRole`, `effectiveDate`, `timestamp`

---

## 3. Relational Schema Architecture (Drizzle ORM)

Located at [db/schema/theatre-staff.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-staff.ts):

| Table Name | Description | Key Constraints & Relations |
| :--- | :--- | :--- |
| `role_templates` | Platform-level role templates | Global scope, system curated |
| `theatre_roles` | Tenant-scoped dynamic roles | `theatreId` FK, unique `(theatreId, roleCode)` |
| `theatre_permissions` | Role-to-module permission grants | `theatreId` FK, `roleId` FK, unique `(roleId, permissionKey)` |
| `staff_departments` | Organizational functional departments | `theatreId` FK, unique `(theatreId, code)` |
| `theatre_staff` | Staff profiles & employee registry | `theatreId` FK, unique `(theatreId, employeeCode)`, unique `email` |
| `staff_role_assignments` | Staff-to-role associations | `theatreId` FK, `staffId` FK, `roleId` FK, `isPrimary` |
| `staff_role_history` | Immutable transition ledger | `staffId` FK, `theatreId` FK, audit metadata |
| `future_shift_placeholders` | Architectural extension stub | Prepared for future shift planning, payroll & biometrics |

---

## 4. Protected Server Actions

Located at [actions/theatre-staff-actions.ts](file:///d:/Project_2k24_25/cineSphere_OS/actions/theatre-staff-actions.ts):

1. `getTheatreStaffBundleAction`: Retrieves complete tenant staff organization bundle.
2. `retrieveStaffAction`: Fetches individual staff record by ID with active roles and permissions.
3. `searchStaffAction`: Multi-faceted search by keyword, employee code, department, and role.
4. `createStaffAction`: Direct crew member onboarding with auto-generated or manual employee codes.
5. `inviteStaffAction`: Dispatches email invitations with auto-generated credentials and initial role.
6. `updateStaffAction`: Updates employee profile, contact numbers, and emergency contact details.
7. `suspendStaffAction`: Temporarily suspends staff access and logs justification to security audit.
8. `archiveStaffAction`: Retires crew member from active rosters while preserving compliance records.
9. `assignRoleAction`: Grants new role to staff member with reason tracking and primary role election.
10. `removeRoleAction`: Revokes specific role assignment from staff member.
11. `updateRolePermissionsAction`: Granular toggle of capability keys for a tenant role.
12. `createTheatreRoleAction`: Defines a completely bespoke tenant role.
13. `updateTheatreRoleAction`: Updates role naming, description, or hierarchy weighting.
14. `instantiateRoleFromTemplateAction`: Copies a platform template into tenant scope.
15. `getRoleTemplatesAction`: Retrieves platform-wide curated role templates.
16. `createDepartmentAction` / `updateDepartmentAction`: Manages organizational divisions.

---

## 5. UI Architecture & Enterprise Operator Experience

Located at [components/theatre-staff/](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-staff/):

- **`TheatreStaffWorkspace`:** Main administrative canvas with:
  - 4 Real-time KPI Cards (Total Crew, Active Staff, Custom Roles, Departments).
  - Multi-Criteria Search & Filter Bar (Text search, Department dropdown, Role filter).
  - 4 Dedicated Tabs:
    1. **Staff Directory:** Tabular roster with employee codes, designations, status badges, assigned roles, and quick actions.
    2. **Roles & Permissions:** Hierarchy card view of custom & template-derived roles with permission count pills and edit access.
    3. **Department Structure:** Functional divisions with department heads and headcount tallies.
    4. **Platform Templates:** Catalog of standard templates ready for one-click instantiation.
- **`OnboardStaffModal`:** Tabbed modal supporting both *Direct Onboarding* and *Email Invitation Dispatch*.
- **`StaffDetailDrawer`:** Side-sheet providing comprehensive profile inspection, emergency contacts, role assignments, effective capability permissions breakdown, suspension controls, and archival flows.
- **`AssignRoleModal`:** Role assignment workflow with reason input and primary role designation.
- **`CustomRoleModal`:** Creation modal supporting custom role codes or template instantiation.
- **`StaffPermissionsModal`:** Interactive capability matrix organizing permissions by module with bulk select/deselect.
