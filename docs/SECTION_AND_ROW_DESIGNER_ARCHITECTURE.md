# CineSphere OS — Section & Row Designer Architecture (Phase 4 – Parts 3 & 4)

## 1. Executive Summary & Domain-Driven Design (DDD) Hierarchy

In CineSphere OS, the legacy auditorium model coupled rows directly to the hall or flat layout definitions. In enterprise cinema complexes spanning multiple countries, different seating tiers within the same hall exhibit radically divergent spatial geometries, seating categories, row curvature, numbering strategies, and accessibility constraints.

To eliminate coupling and enable infinite layout flexibility, CineSphere OS Phase 4 introduces a strict hierarchical design object tree:

```
Theatre
  │
  ▼
Hall
  │
  ▼
Layout Definition
  │
  ├── Draft Version (Interactive, Mutating)
  ├── Published Version (Immutable Source of Truth)
  └── Archived Versions (Historic Lineage)
        │
        ▼
  Section (Phase 4 – Part 3: Structural Layer)
        │
        ▼
  Row (Phase 4 – Part 4: Sequencing & Accessibility)
        │
        ▼
  Seat
```

### Core Architecture Rules:
1. **Sections Own Rows:** Rows belong strictly to Sections, never directly to the Hall or Layout Definition. Each section manages its own row behaviors (curved, angled, hidden, wheelchair-only, VIP, couple, irregular, custom naming, spacing) without complicating the hall model.
2. **Immutable Live Layouts:** Modifying sections or rows requires the layout version to be in `DRAFT` status. Any mutation against a `PUBLISHED` version is rejected with `ConflictError` ("Immutable Version Policy"), protecting in-flight shows and live bookings from ghost seating or coordinate desynchronization.
3. **Independent Per-Theatre Conventions:** Each cinema venue maintains its own structural conventions:
   - **Galaxy Multiplex (Pune - `th-pun-001`):** VIP Red Suites, Rows A–C, 35px (~1.0m) spacing, Alphabetical numbering.
   - **Mumbai Royale IMAX (Mumbai - `th-mum-002`):** Premium Left & Right Luxury Purple, Rows 1–20, Arc geometry (750px radius), 40px (~0.9m) spacing, Numeric numbering.
   - **Dubai Grand Screen (Dubai - `th-dxb-003`):** Balcony East & West Economy Blue, Rows AA–AZ, 45px (~1.2m) spacing, Custom double-letter sequence.

---

## 2. Phase 4 – Part 3: Section Designer Architecture

The Section Designer acts as the structural layer between Hall Layout Definitions and Rows. Every section belongs to one Layout Definition, is completely configurable, and serves as an independent design object.

### 2.1 Section Configuration & Schema
Every section stores:
- **Identification:** Unique `id`, `layoutVersionId`, `theatreId`, `name` (e.g. `"VIP Prime"`), `displayName` (e.g. `"VIP Prime Recliner Suite"`), and `internalCode` (e.g. `"SEC-VIP-RED"`).
- **Color:** Hex string (e.g. `#EF4444`, `#8B5CF6`, `#3B82F6`, `#10B981`, `#F59E0B`).
- **Seat Category (`SectionCategory`):** `"Standard"` | `"Recliner"` | `"VIP"` | `"Couple"` | `"Wheelchair"` | `"Sofa"`.
- **Capacity:** Integer total seats dynamically calculated and synchronized from contained rows.
- **Priority:** Integer tier ranking (`1` is highest luxury/priority).
- **Display Order:** Integer sequence index determining rendering order and ticket hierarchy.
- **Rotation:** Rotation angle in degrees (`0` to `360`).
- **Position:** Physical coordinates `{ x, y }` relative to auditorium canvas origin.
- **Visibility:** `"VISIBLE"` | `"HIDDEN"`.
- **Notes Placeholder:** Freeform administrative notes string.
- **Metadata (`SectionMetadata`):** Extensible JSONB payload capturing `notes`, `soundZone` (e.g. `"OVERHEAD_ATMOS"`), `acousticProfile`, `tags`, and `customAttributes`.

### 2.2 Section Geometry Model
Supports:
- **`RECTANGLE`:** Traditional rectilinear seating tier.
- **`CURVED`:** Concentric circular curve with customizable `curvatureRadius` (e.g. `600px`) and `arcAngle` (e.g. `30°`).
- **`ARC`:** Panoramic radial arc with angular spread.
- **`POLYGON`:** Polygon vertices array `[{ x, y }, ...]` for asymmetrical tiers.
- **`IRREGULAR`:** Organic shapes for balconies, VIP lounges, or historic auditorium tiers.
- **`Mirror Placeholder`:** `isMirrored: boolean` flag allowing layout mirroring across the central screen axis.
- **`Offset Placeholder`:** `offsetX`, `offsetY` coordinates for micro-staggering tiers.

### 2.3 Section Labels
Orientation options:
- `TOP`: Rendered above the section tier.
- `BOTTOM`: Rendered below the section tier.
- `LEFT`: Displayed along the left aisle boundary.
- `RIGHT`: Displayed along the right aisle boundary.
- `CENTER`: Centered within the section footprint.
- `HIDDEN`: Suppressed on customer views while visible to operators.

### 2.4 Section Ordering System
Supports:
- `UP`: Swaps `displayOrder` with the preceding section.
- `DOWN`: Swaps `displayOrder` with the subsequent section.
- `TOP` (`Bring Forward`): Elevates section to `displayOrder: 1`, normalizing all others.
- `BOTTOM` (`Send Backward`): Depresses section to the lowest priority index.
- `AUTO_SORT`: Deterministic sorting prioritizing tier luxury (`priority: 1` first), then alphabetical section name.

### 2.5 Validation Engine (Sections)
Validates before persistence:
1. **Unique Section Name:** Case-insensitive uniqueness within layout version.
2. **Unique Section Code:** Compound uniqueness (`layoutVersionId + internalCode`).
3. **Capacity Parity:** Compares section capacity against sum of contained row seats with warning flags.
4. **Positive Curvature Radius:** Curvature radius must be strictly positive for curved/arc sections.
5. **Tenant Ownership:** Rejects cross-tenant requests via `resolveTheatreId`.

### 2.6 Server Actions & Database Model (Sections)
- **Database Tables (`db/schema/section-row-designer.ts`):** `designerHallSections` with PostgreSQL indexes `designer_hall_sections_version_idx`, `designer_hall_sections_theatre_idx`, and compound unique index `designer_hall_sections_code_idx`.
- **Server Actions (`actions/section-row-actions.ts`):**
  - `createSectionAction`
  - `updateSectionAction`
  - `deleteSectionAction`
  - `duplicateSectionAction`
  - `reorderSectionsAction`
  - `listSectionsAction` / `loadSectionsAction`
  - `validateSectionsAction`

---

## 3. Phase 4 – Part 4: Row Designer Architecture

The Row Designer provides dynamic, reusable row management. Rows belong strictly to Sections and never directly to the Hall or Layout Definition.

### 3.1 Row Configuration & Schema
Every row stores:
- **Identification:** Unique `id`, `sectionId`, `theatreId`, `rowName` (e.g. `"A"`, `"1"`, `"AA"`), `displayName` (e.g. `"Row A - Premium Recliners"`).
- **Sequence:** Integer sequence order (`1`, `2`, `3`...) from front to back.
- **Seat Count:** Total seats generated in this row.
- **Spacing:** Physical distance to next row in pixels or meters (strictly $> 0$).
- **Rotation:** Individual row rotation angle in degrees.
- **Visibility:** `"VISIBLE"` | `"HIDDEN"`.
- **Accessibility (`RowAccessibilityType`):** `"STANDARD"` | `"WHEELCHAIR"` ♿ | `"COMPANION"` | `"RESERVED"` | `"EMERGENCY_CLEARANCE"` | `"HIDDEN"`.
- **Category Override:** Optional row-level override (e.g. Wheelchair row inside a VIP section).
- **Metadata (`RowMetadata`):** JSONB payload with `sightlineScore`, `legroomRating`, `soundDelayMs`, and `customAttributes`.
- **Seats:** Contained `SeatDefinition[]` collection computed dynamically.

### 3.2 Row Numbering Strategies (`RowConfiguration`)
- **`ALPHABETICAL`:** `1 ➔ A`, `26 ➔ Z`, `27 ➔ AA`, `28 ➔ AB`.
  - Format: `{prefix}{rowName}{seatCol}{suffix}` (e.g. `VIP-A1`).
- **`NUMERIC`:** `1 ➔ 1`, `5 ➔ 5`, `20 ➔ 20`.
  - Format: `{prefix}{rowName}-{seatCol}{suffix}` (e.g. `1-1`, `1-10`).
- **`ROMAN`:** `1 ➔ I`, `4 ➔ IV`, `9 ➔ IX`, `10 ➔ X`, `40 ➔ XL`.
  - Format: `{prefix}{rowName}{romanCol}{suffix}` (e.g. `BIII`, `BIV`).
- **`CUSTOM`:** Venue-defined custom alphanumeric convention (e.g. Dubai `AA`–`AZ`).
- **`Reverse Numbering`:** `isReversed: true` inverts seat enumeration from right-to-left.
- **`Start Index` & `End Index`:** Custom column ranges (e.g. start at `5` for split rows).
- **`Prefix` & `Suffix`:** Decorator tokens (e.g. `VIP-`, `-W`).

### 3.3 Row Mathematical Geometry Engine
The engine computes physical seat coordinates based on row geometry:
1. **Straight Row:**
   $$\begin{aligned}
   x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \\
   y_c &= y_{\text{origin}}
   \end{aligned}$$
   where $\text{pitch} = \text{seatWidth} + \text{seatGap}$.
2. **Curved / Arc Row:**
   $$\begin{aligned}
   \theta_c &= \left(c - 1 - \frac{N - 1}{2}\right) \cdot \frac{\text{arcAngle}}{N - 1} \cdot \frac{\pi}{180} \\
   x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \\
   y_c &= y_{\text{origin}} + R \cdot (1 - \cos \theta_c)
   \end{aligned}$$
   where $R$ is the curvature radius and $R(1 - \cos \theta_c)$ represents the arc sagitta.
3. **Angled Row:**
   $$\begin{aligned}
   x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \cdot \cos \theta \\
   y_c &= y_{\text{origin}} + (c - 1) \cdot \text{pitch} \cdot \sin \theta
   \end{aligned}$$

### 3.4 Row Accessibility Classifications
- `STANDARD`: General admission seating.
- `WHEELCHAIR`: Designated wheelchair berths with zero-step roll-in access.
- `COMPANION`: Companion seats situated immediately adjacent to wheelchair bays.
- `RESERVED`: Held inventory for house management, VIP guests, or press.
- `EMERGENCY_CLEARANCE`: Empty buffer seats along emergency evacuation routes.

### 3.5 Validation Engine (Rows)
1. **Unique Row Name within Section:** No two rows within the same section may share a name.
2. **Strictly Positive Spacing:** `spacing > 0` (flags negative or zero spacing).
3. **Non-Zero Seat Count:** `seatCount > 0`.
4. **Valid Sequence Ordering:** Monotonically increasing sequence integers.

### 3.6 Server Actions & Database Model (Rows)
- **Database Tables (`db/schema/section-row-designer.ts`):** `hallRows` with foreign key cascade to `designerHallSections`, indexed on `sectionId`, `theatreId`, and compound unique index `hall_rows_section_row_name_idx`.
- **Server Actions (`actions/section-row-actions.ts`):**
  - `createRowAction`
  - `updateRowAction`
  - `deleteRowAction`
  - `duplicateRowAction`
  - `reorderRowsAction`
  - `listRowsAction` / `loadRowsAction`
  - `validateRowsAction`

---

## 4. Theatre-Specific Venue Configurations

Each cinema theatre complex stores its own section and row conventions independently:

| Theatre Complex | Tier / Section | Geometry | Naming Convention | Spacing | Accessibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Galaxy Multiplex (Pune - `th-pun-001`)** | VIP Prime (Red) | Curved (600px radius) | Alphabetical (Rows A–C) | 35px (~1.0m) | Standard + Wheelchair |
| | Club Standard (Gold) | Rectangle | Alphabetical (Rows D–J) | 30px (~0.85m) | Standard |
| | Executive Balcony (Green) | Rectangle | Alphabetical (Rows K–N) | 35px (~1.0m) | Standard + Companion |
| **Mumbai Royale IMAX (`th-mum-002`)** | Premium Left (Purple) | Radial Arc (750px radius, +10°) | Numeric (Rows 1–20) | 40px (~0.9m) | Wheelchair Front Tier |
| | Premium Right (Purple) | Radial Arc (750px radius, -10°) | Numeric (Rows 1–20) | 40px (~0.9m) | Standard |
| **Dubai Grand Screen (`th-dxb-003`)** | Balcony East (Blue) | Irregular | Custom (Rows AA–AZ) | 45px (~1.2m) | VIP Suites + Wheelchair |
| | Balcony West (Blue) | Irregular | Custom (Rows AA–AZ) | 45px (~1.2m) | VIP Suites |

---

## 5. Security Hardening & Role Permissions

1. **Super Admin:** Can inspect and manage layouts, sections, and rows across all theatres.
2. **Theatre Admin:** Strictly restricted to sections and rows within their own `theatreId`. Cross-tenant requests are intercepted with `AuthorizationError` / `TenantAccessError`.
3. **Hall Manager:** Authorized to manage permitted layout versions within their assigned theatre.
4. **Audit Logging:** Every section creation, update, deletion, reordering, and duplication logs structured audit records via `StructuredLogger` under modules `SECTION_DESIGNER` and `ROW_DESIGNER`.

---

## 6. Performance & React Caching Hooks

- **Optimized Caching Hook (`lib/hooks/use-section-row-designer.ts`):**
  - In-memory `versionCache` ref prevents redundant round-trips when switching between sections.
  - Optimistic updates for section and row CRUD operations with immediate state reconciliation.
  - Memoized aggregate selectors: `totalSeats`, `totalRows`, `sectionsByCategory`, `wheelchairRows`.
  - Re-exported cleanly from `@/hooks`.
- **Canvas Rendering Studio (`app/(theatre-admin)/theatre/halls/designer/hall-designer-canvas-client.tsx`):**
  - Integrated Section & Row Designer Studio inside Tab 2.
  - Interactive section cards with color swatches, geometry tags, and up/down ordering.
  - Drill-down row accordion displaying row seat counts, numbering strategies, spacing, and wheelchair badges (♿).
  - Add Section and Add Row modal forms with live seat calculation.

---

## 7. Verification & Automated Test Suite

The verification suite [scripts/verify-section-row-designer.ts](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-section-row-designer.ts) runs **72 automated assertions**:
- **Suite 1:** Sequencing & Geometry Engine (Roman numerals, alphabetical labeling, seat numbering with prefix/suffix/reverse, straight/curved/angled seat coordinates, section reordering).
- **Suite 2:** Section & Row Validation (unique section names/codes, capacity discrepancies, duplicate row names, invalid spacing).
- **Suite 3:** Repository CRUD & Multi-Tenant Seeds (Pune, Mumbai, Dubai seeds, cross-tenant isolation, section/row duplication, cascading deletes).
- **Suite 4:** Domain Service & Security Hardening (immutability enforcement on PUBLISHED versions, draft mutations, row reordering, AUTO_SORT prioritization, and metadata persistence).
