# 📍 Phase 3 – Part 4: Theatre Address & Location Management

## 1. Architectural Overview

Phase 3 Part 4 establishes enterprise-grade **Theatre Address & Location Management** for CineSphere OS. As a multi-tenant cinema SaaS platform, theatres operate across diverse metropolitan circuits, shopping malls, and standalone complexes. Decoupling address and geographic metadata from the core `theatres` table into dedicated, versioned entities enables multi-location theatre chains, precise geospatial discovery, and strict compliance verification before public publication.

```
Platform
    │
    ▼
Theatre
    │
    ▼
Theatre Location (1:N Fleet Support)
    │
    ├── Address (Line 1/2, Area, Landmark, City, State, Country, Postal Code)
    ├── Coordinates (Latitude, Longitude, Source, Accuracy, Spatial Point, Geohash)
    ├── Geographic Hierarchy (Country Code, State Code, City Slug, District)
    ├── Navigation (Google Maps URL, Directions Link, Embed URL)
    ├── Service Area (Service Radius Km, Served Postal Codes)
    └── Future Geo Index (PostGIS SRID 4326 WKT, 8-Char Geohash)
```

---

## 2. Relational Schema & Storage Engine

The location architecture is defined across four PostgreSQL tables in [theatre-location.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-location.ts):

### 2.1 Tables

1. **`theatre_locations`**:
   - `id`: Unique identifier (prefixed with `loc-`).
   - `theatre_id`: Foreign key referencing `theatres.id` (tenant boundary).
   - `location_name`: Human-readable branch/complex name (e.g., "Phoenix Marketcity Flagship").
   - `is_primary`: Flag distinguishing primary flagship from branch annexes (`theatres 1:N theatre_locations`).
   - `address_line1`, `address_line2`, `area`, `city`, `district`, `state`, `country`, `postal_code`, `landmark`, `locality`, `neighbourhood`.
   - `formatted_address`: Standardized postal address string for invoices and tickets.
   - `display_address`: Compact representation for badges and search cards.
   - `google_maps_url`, `place_id`, `map_embed_url`, `map_share_link`.
   - `navigation_link`, `driving_directions_url`, `walking_directions_url`, `transit_directions_url`.
   - `verification_status`: Enum (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`).
   - `status`: Enum (`DRAFT`, `VERIFIED`, `PUBLISHED`, `ARCHIVED`).
   - `version`: Monotonically incrementing optimistic concurrency control integer.
   - Audit stamps: `created_by`, `updated_by`, `verified_by`, `verified_at`, `published_by`, `published_at`, `archived_by`, `archived_at`.

2. **`theatre_coordinates`**:
   - `id`: `coord-loc-...`
   - `location_id`: References `theatre_locations.id`.
   - `theatre_id`: References `theatres.id`.
   - `latitude`, `longitude`: Decimal coordinates bounded to \([-90, 90]\) and \([-180, 180]\).
   - `coordinate_source`: `MANUAL`, `GEOCODED`, `GPS`, `SYSTEM`, `MAP_PIN`.
   - `accuracy_meters`: Confidence radius in meters.
   - `geohash`: 8-character geohash string for grid-based geospatial indexing.
   - `spatial_index_placeholder`: WKT string formatted for PostGIS SRID 4326 (`SRID=4326;POINT(lon lat)`).

3. **`theatre_geo_metadata`**:
   - `id`: `geo-loc-...`
   - `location_id`, `theatre_id`.
   - `country_code` (e.g., `IND`), `state_code` (e.g., `MAH`), `city_slug` (e.g., `pune`).
   - `timezone`: IANA timezone identifier (default `Asia/Kolkata`).
   - `service_radius_km`: Delivery/radius coverage for theatre marketing.
   - `served_postal_codes`: JSON array of serviceable postal codes.

4. **`theatre_location_versions`**:
   - Append-only immutable version ledger storing complete snapshots of previous location revisions, actor identity, and change summaries for point-in-time recovery and compliance auditing.

---

## 3. Governance, Security & Validation

### 3.1 Super Admin Verification Gate & Publication Protocol
- **Creation by Theatre Admin**: Initialized with `verificationStatus = UNVERIFIED` and `status = DRAFT`.
- **Publication Gate**: A location *cannot* transition to `PUBLISHED` unless its `verificationStatus` is `VERIFIED`. Attempting to publish an unverified location throws a `BusinessRuleError`.
- **Super Admin Sole Authority**: Only `SUPER_ADMIN` can execute `verifyLocation`. Theatre Admins attempting verification are blocked with an `AuthorizationError`.
- **Verification Decision**: Super Admin can `VERIFY` (setting status to `VERIFIED` and permitting publication) or `REJECT` (requiring remediation notes).

### 3.2 Anti-Corruption & Threat Neutralization
- **URL Sanitization**: Validates all navigation and map links against safe schemes (`https://`, `http://`). Dangerous pseudo-protocols (`javascript:`, `data:`, `vbscript:`) are rejected with `ValidationError`.
- **XSS Stripping**: All textual address inputs (lines, area, landmark, city, state) are sanitized and stripped of HTML tags via `stripHtml` and `sanitizeString`.
- **Range Constraints**: Latitudes outside \([-90, 90]\) and longitudes outside \([-180, 180]\) are rejected.
- **Postal Code Validation**: Strictly formatted with regex validation (`^[A-Za-z0-9\s-]{3,20}$`).

### 3.3 Multi-Tenant Isolation
- Pre-pagination filtering ensures `THEATRE_ADMIN` can only view, search, and update locations belonging to their assigned `theatreId`.
- Cross-tenant mutations trigger immediate `TENANT_VIOLATION` security events in [security-events.service.ts](file:///d:/Project_2k24_25/cineSphere_OS/lib/services/security-events.service.ts).

---

## 4. Domain Service & Public Projections

The service layer in [theatre-location.service.ts](file:///d:/Project_2k24_25/cineSphere_OS/lib/services/theatre-location.service.ts) provides 12 core operations:

1. `createLocation`: Normalizes addresses, derives geohashes, persists coordinates and geo-metadata, and logs immutable audit trails.
2. `updateLocation`: Validates inputs, handles optimistic concurrency checking, re-normalizes formatted addresses, and captures rollback snapshots.
3. `updateCoordinates`: Validates coordinate ranges, computes PostGIS WKT and geohashes, and updates map links.
4. `verifyLocation`: Super Admin workflow validating physical accuracy and setting verification metadata.
5. `changeLocationStatus`: Governs state transitions (`DRAFT` \(\to\) `VERIFIED` \(\to\) `PUBLISHED` \(\to\) `ARCHIVED`), enforcing the verification gate.
6. `archiveLocation`: Freezes the location in read-only mode, recording archival reasons.
7. `retrieveLocations`: Provides multi-faceted searching by name, city, state, postal code, verification status, and publication status with pre-pagination tenant isolation.
8. `getLocationBundle`: Aggregates the primary location, secondary fleet branches, coordinates, metadata, and version count.
9. `getPublicTheatreLocation`: Customer projection. Strictly returns data *only* when the location is `PUBLISHED` and the parent theatre is `ACTIVE`. Draft, unverified, or archived locations return `null`.
10. `validateAddress`: Interactive verification helper for testing street address integrity and completeness.
11. `rollbackToVersion`: Creates a new forward version snapshot with restored historic state, preserving audit continuity.
12. `computeGeohashPlaceholder` & `computeSpatialIndexPlaceholder`: Standalone GIS helpers formatting standard geohashes and PostGIS points.

---

## 5. UI Architecture

Built strictly with CineSphere's existing Design System components (`Card`, `Badge`, `Button`, `Input`, `Dialog`, `StatusBadge`, `Table`):

- **[location-status-badge.tsx](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-location/location-status-badge.tsx)**: Visual chips for publication status (`DRAFT`, `VERIFIED`, `PUBLISHED`, `ARCHIVED`), verification status (`UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED`), and coordinate sources.
- **[theatre-coordinates-panel.tsx](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-location/theatre-coordinates-panel.tsx)**: Displays latitude, longitude, PostGIS spatial index placeholder, geohash, and one-click navigation links.
- **[theatre-location-form-modal.tsx](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-location/theatre-location-form-modal.tsx)**: Comprehensive editing modal supporting address details, landmark hints, coordinates, and navigation links.
- **[theatre-location-version-modal.tsx](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-location/theatre-location-version-modal.tsx)**: Version timeline displaying historical snapshots and one-click rollbacks.
- **[theatre-location-workspace.tsx](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-location/theatre-location-workspace.tsx)**: Primary operational hub featuring verification status banners, publication toggles, address cards, coordinates cards, service area metrics, and multi-branch fleet explorer.

### Portal Integrations
- **Super Admin Fleet Registry**: [dashboard/theatres/locations/page.tsx](file:///d:/Project_2k24_25/cineSphere_OS/app/(super-admin)/dashboard/theatres/locations/page.tsx) provides a global registry across all registered theatres with filtering by city, state, and verification status.
- **Super Admin Theatre Hub**: [dashboard/theatres/[id]/page.tsx](file:///d:/Project_2k24_25/cineSphere_OS/app/(super-admin)/dashboard/theatres/[id]/page.tsx) integrates an "Address & Location" tab with Super Admin verification and status controls.
- **Theatre Admin Workspace**: [theatre/location/page.tsx](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/location/page.tsx) offers tenant-scoped location editing and branch creation.
- **Public Cinema Page**: [theatre/[slug]/page.tsx](file:///d:/Project_2k24_25/cineSphere_OS/app/(public)/theatre/[slug]/page.tsx) projects verified location details, landmark, and turn-by-turn navigation directly to ticket buyers.

---

## 6. Verification Suite

The dedicated test suite in [scripts/verify-theatre-location.ts](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-theatre-location.ts) verifies 10 critical operational dimensions:
1. `Test 1`: Location Creation, Structured Address Normalization & Primary Branch Assignment.
2. `Test 2`: Coordinate Governance, Range Validation & Spatial Index / Geohash Placeholders.
3. `Test 3`: Google Maps & Navigation Link Verification & Anti-Corruption Protocol.
4. `Test 4`: Super Admin Location Verification Workflow & Publication Gate.
5. `Test 5`: Optimistic Concurrency Control & Version Conflict Detection.
6. `Test 6`: Immutable Version Snapshots & Forward Rollback Recovery.
7. `Test 7`: Multi-Location Chains Readiness (Theatre 1:N Locations).
8. `Test 8`: Multi-Faceted Search, Hierarchical Filtering & Pre-Pagination Tenant Isolation.
9. `Test 9`: Public Theatre Page Location Projection & Privacy Guard.
10. `Test 10`: Immutable Audit Logging & Structured Telemetry.
