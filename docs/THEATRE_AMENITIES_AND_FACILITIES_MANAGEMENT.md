# 🛋️ Phase 3 – Part 5: Theatre Amenities & Facilities Management

## 1. Architectural Overview

Phase 3 Part 5 establishes the enterprise-grade **Theatre Amenities & Facilities Management** subsystem for CineSphere OS. As a multi-tenant cinema SaaS platform, theatres offer an evolving array of premium projection hardware, sound engineering, luxury seating, accessibility accommodations, and hospitality services. 

Decoupling amenity definitions into a centralized, dynamic **Platform Catalog** while enabling individual **Theatre Tenant Assignments** empowers Super Admins to roll out circuit-wide amenity options without database schema changes, while granting Theatre Admins granular autonomy over availability, operating restrictions, localized notes, and facility metrics.

```
Platform
    │
    ▼
Amenity Catalog (Master Registry)
    │
    ├── Category (Technology, Comfort, Accessibility, Food & Beverage, etc.)
    ├── Icon (Decoupled SVG / Lucide Identifier)
    ├── Priority (Critical, Featured, High, Medium, Standard, Low)
    ├── Visibility (Public, Hidden, Internal)
    └── Status (Active, Inactive, Draft, Archived)
            │
            ▼
Theatre Amenity Assignment (Tenant-Scoped)
            │
            ├── Theatre ID (Tenant Isolation Boundary)
            ├── Amenity ID (Catalog Reference)
            ├── Availability Mode (Available, Temporarily Unavailable, Seasonal, Under Maintenance)
            ├── Operational Notes (Screen-specific restrictions, valet gates, etc.)
            ├── Facility Metadata (Parking bays, EV chargers, Wi-Fi SSID, ramp routes)
            ├── Display Sequence (1..N Sequential Ordering)
            └── Entity Mapping (Future extension: THEATRE, HALL, LOUNGE, PREMIUM_SCREEN)
```

---

## 2. Core Architectural Capabilities

### 2.1 Capability 1: Rich Availability Modes (Not a Binary Boolean)
Rather than a naive `is_available` boolean, amenities transition through four operational states via `AmenityAvailabilityMode`:
1. `AVAILABLE`: Fully operational for patron booking and facility utilization.
2. `TEMPORARILY_UNAVAILABLE`: Briefly suspended due to unexpected outage, cleaning, or localized equipment recalibration.
3. `SEASONAL`: Offered during specific seasons (e.g., rooftop dining, open-air screens, summer festivals).
4. `UNDER_MAINTENANCE`: Scheduled hardware maintenance or refit (e.g., laser projector lamp replacement, soundproofing adjustments).

### 2.2 Capability 2: Localization Readiness
Master catalog items feature first-class multilingual dictionaries (`localizedNames`, `localizedDescriptions`) enabling multi-lingual discovery in Hindi (हिंदी), Marathi (मराठी), and other regional languages without altering relational schema columns.

### 2.3 Capability 3: Generic Entity Mapping (Future Sub-Entity Attachment)
Assignments support generic `entityType` (`THEATRE`, `HALL`, `LOUNGE`, `PREMIUM_SCREEN`) and `entityId`, allowing amenities to attach directly to auditoriums, VIP lounges, or IMAX halls in future phases without schema migration.

### 2.4 Capability 4: Dedicated Facility Metadata & Capacity Specifications
The `theatre_amenity_metadata` table tracks physical facility details:
- **Parking Capacity**: Total bays available.
- **EV Fast Chargers**: Active charging stalls.
- **Guest Wi-Fi**: SSID network name and coverage details.
- **Accessibility Notes**: Wheelchair ramp paths, companion seating, and elevator guidance.
- **Food Court & Lounge Information**: Dining hours, counter delivery, and liquor license details.
- **Waiting Areas**: Seating counts and play zone notes.

### 2.5 Capability 5: Priority, Visibility & Contiguous Reordering
- **Priority**: `CRITICAL` (ADA/emergency), `FEATURED` (showcase hero), `HIGH`, `MEDIUM`, `STANDARD`, `LOW`.
- **Public Visibility**: `PUBLIC` (patron web app), `HIDDEN` (temporarily suppressed), `INTERNAL` (staff/manager back-of-house only).
- **Sequential Reordering**: Drag-and-drop or batch reordering updating contiguous 1..N sequence orders with automatic cache invalidation.

---

## 3. Relational Schema & Storage Engine

The amenity architecture is defined across five PostgreSQL tables in [theatre-amenity.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-amenity.ts):

### 3.1 Tables

1. **`amenity_categories`**:
   - `id`: Unique identifier (`cat-am-...`).
   - `code`: Normalized category slug (e.g., `technology`, `comfort`, `accessibility`, `food-beverage`, `safety`).
   - `name`, `display_name`, `description`, `default_icon`.
   - `display_order`, `is_active`.

2. **`amenity_catalog`**:
   - `id`: `am-cat-...`.
   - `category_id`, `category_code`.
   - `code`: Unique system code across circuit (e.g., `dolby-atmos`, `wheelchair-accessible`, `valet-parking`).
   - `name`, `display_name`, `description`.
   - `default_icon`, `custom_icon_url`.
   - `priority`, `is_featured`, `display_order`, `status`.
   - `localized_names`, `localized_descriptions` (JSONB).
   - `version`: Monotonically incrementing optimistic lock version integer.

3. **`theatre_amenity_assignments`**:
   - `id`: `asgn-...`.
   - `theatre_id`: Foreign key referencing `theatres.id` (tenant isolation boundary).
   - `amenity_id`: Foreign key referencing `amenity_catalog.id`.
   - `availability`: `AVAILABLE`, `TEMPORARILY_UNAVAILABLE`, `SEASONAL`, `UNDER_MAINTENANCE`.
   - `notes`: Operational guidelines and restrictions.
   - `display_order`, `visibility`, `status`, `is_featured`.
   - `entity_type`, `entity_id`.
   - `version`: Optimistic lock version integer.

4. **`theatre_amenity_metadata`**:
   - `id`: `am-meta-...`.
   - `theatre_amenity_id`, `theatre_id`.
   - `parking_capacity`, `ev_charger_count`, `wifi_ssid`, `accessibility_notes`, `food_court_info`, `waiting_area_details`.
   - `custom_attributes` (JSONB).

5. **`theatre_amenity_versions`**:
   - Immutable audit ledger recording snapshot states, actor IDs, roles, and change types (`CATALOG_CREATED`, `CATALOG_UPDATED`, `THEATRE_ASSIGNED`, `THEATRE_UPDATED`, `THEATRE_REMOVED`).

---

## 4. Multi-Tenant Governance & Security

### 4.1 Strict RBAC Boundaries
- **Super Admin**: Full circuit authority to create dynamic categories, add/update master catalog items, archive catalog entries, and manage any theatre complex.
- **Theatre Admin**: Scoped strictly to their assigned `theatreId`. Forbidden from modifying master catalog items. Attempts to manage amenities of another theatre immediately trigger `TENANT_VIOLATION` security incident events and throw `TenantAccessError`.
- **Public / Customer**: Read-only projection exposing only `ACTIVE` assignments marked `PUBLIC`. Excludes draft, archived, hidden, and internal amenities.

### 4.2 Optimistic Concurrency Control (OCC)
All mutations require `expectedVersion`. If another administrator modifies the assignment concurrently, the update is rejected with `ConflictError`, preventing lost updates.

---

## 5. UI Architecture & Portals

1. **Super Admin Amenity Catalog Studio** (`/dashboard/amenities`):
   - Dynamic category creation & management.
   - Master catalog management (CRUD, localization, icon selection, priorities).
   - Circuit-wide assignment distribution analytics.

2. **Theatre Admin Amenity Workspace** (`/theatre/amenities`):
   - Metric cards: Total Assigned, Active Facilities, In Maintenance, Critical/ADA.
   - Dynamic Category filter tabs.
   - Availability mode dropdown filter & keyword search.
   - One-click Enable Amenity Modal with facility metadata inputs.
   - Configure Facility Modal for adjusting operating notes and capacity specifications.
   - Contiguous display reordering.

3. **Public Theatre Page** (`/theatre/[slug]`):
   - Section 7b: "Featured Amenities & Complex Facilities".
   - Renders category badges, dynamic icons, availability indicators, and patron-relevant notes.

---

## 6. Verification Suite

All 10 comprehensive test suites in [verify-theatre-amenity.ts](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-theatre-amenity.ts) pass with 100% success:
- Test 1: Master Catalog & Dynamic Category Hierarchy
- Test 2: Role-Based Access Control (RBAC) & Governance Guard
- Test 3: Theatre Amenity Assignment & Availability Modes
- Test 4: Facility Metadata & Custom Specifications
- Test 5: Optimistic Concurrency Control & Version Conflict
- Test 6: Sequential Reordering & Contiguous Display Sequences
- Test 7: Cross-Tenant Isolation & Pre-Pagination Security
- Test 8: Multi-Faceted Search, Dynamic Category Filtering & Pagination
- Test 9: Public Patron Projection, Active-Only Visibility & Privacy Guard
- Test 10: Immutable Version Ledger & Audit Logging
