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
  Section (Phase 4 – Part 3)
        │
        ▼
  Row (Phase 4 – Part 4)
        │
        ▼
  Seat
```

### Core Architecture Rules:
1. **Sections Own Rows:** Rows belong strictly to Sections, never directly to the Hall or Layout Definition.
2. **Immutable Live Layouts:** Modifying sections or rows requires the layout version to be in `DRAFT` status. Any mutation against a `PUBLISHED` version is rejected with `ConflictError` ("Immutable Version Policy").
3. **Independent Per-Theatre Conventions:** Each cinema venue maintains its own structural conventions:
   - **Galaxy Multiplex (Pune - `th-pun-001`):** VIP Red Suites, Rows A–C, 35px (~1.0m) spacing, Alphabetical numbering.
   - **Mumbai Royale IMAX (Mumbai - `th-mum-002`):** Premium Left & Right Luxury Purple, Rows 1–20, Arc geometry (750px radius), 40px (~0.9m) spacing, Numeric numbering.
   - **Dubai Grand Screen (Dubai - `th-dxb-003`):** Balcony East & West Economy Blue, Rows AA–AZ, 45px (~1.2m) spacing, Custom double-letter sequence.

---

## 2. Section Designer (Phase 4 – Part 3)

The Section Designer manages independent structural seating zones within a hall layout version.

### 2.1 Section Attributes
- **Identification:** Unique `id`, `layoutVersionId`, `theatreId`, `name` (e.g. "VIP Prime"), `displayName` (e.g. "VIP Prime Recliner Suite"), and `internalCode` (e.g. "SEC-VIP-RED").
- **Visual Styling:** `color` (hex string), `seatCategory` (`Standard`, `Recliner`, `VIP`, `Couple`, `Wheelchair`, `Sofa`).
- **Ordering & Priority:** `priority` tier (1 = highest luxury), `displayOrder` (sequence for rendering, tickets, and booking engine).
- **Spatial Positioning:** `position { x, y }`, `rotation` (0–360°), `visibility` (`VISIBLE`, `HIDDEN`).
- **Geometry Shapes:**
  - `RECTANGLE`: Standard rectilinear grid layout.
  - `CURVED`: Circular arc curvature with defined `curvatureRadius` and `arcAngle`.
  - `ARC`: Radial sector arc for panoramic seating.
  - `POLYGON` / `IRREGULAR`: Custom convex or irregular boundary shapes.
- **Label Orientation:** `TOP`, `BOTTOM`, `LEFT`, `RIGHT`, `CENTER`, `HIDDEN`.
- **Capacity Parity:** `capacity` metric strictly synchronized with contained row seat totals.

### 2.2 Reordering & Priority Engine
Sections support four directional reordering operations:
- `UP`: Swaps `displayOrder` with the preceding section.
- `DOWN`: Swaps `displayOrder` with the subsequent section.
- `TOP`: Elevates section to `displayOrder: 1` and shifts all others down.
- `BOTTOM`: Depresses section to the highest `displayOrder` index.

---

## 3. Row Designer (Phase 4 – Part 4)

The Row Designer operates strictly within the context of a Section, managing the sequencing, physical coordinate generation, spacing, and accessibility classifications of seats.

### 3.1 Row Sequencing & Auto-Numbering Strategies
Row seat labels are dynamically calculated through `SectionRowEngine`:
- **ALPHABETICAL:** 1 -> `A`, 26 -> `Z`, 27 -> `AA`, 28 -> `AB`. Seat format: `{prefix}{rowName}{seatCol}{suffix}` (e.g., `A1`, `A2`, `A10`).
- **NUMERIC:** Row seat format `{prefix}{rowName}-{seatCol}{suffix}` (e.g., `1-1`, `1-2`, `1-15`).
- **ROMAN:** 1 -> `I`, 4 -> `IV`, 9 -> `IX`, 10 -> `X`, 40 -> `XL`. Seat format: `BIII`, `BIV`.
- **CUSTOM:** Venue-specific sequences (e.g., `AA`, `AB`, `AC` for Dubai Balcony).
- **REVERSE NUMBERING:** Supports right-to-left seat incrementation (`isReversed: true`) for auditoriums with reverse entrance perspectives.
- **PREFIX & SUFFIX:** Optional decorators (e.g., `VIP-A1`, `A1-W`).

### 3.2 Physical Coordinate Calculation & Curvature Math
The mathematical engine computes exact physical seat coordinates based on geometry:
- **Straight Row:**
  $$\begin{aligned}
  x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \\
  y_c &= y_{\text{origin}}
  \end{aligned}$$
  where $\text{pitch} = \text{seatWidth} + \text{seatGap}$.
- **Curved / Arc Row:**
  $$\begin{aligned}
  \theta_c &= \left(c - 1 - \frac{N - 1}{2}\right) \cdot \frac{\text{arcAngle}}{N - 1} \cdot \frac{\pi}{180} \\
  x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \\
  y_c &= y_{\text{origin}} + R \cdot (1 - \cos \theta_c)
  \end{aligned}$$
  where $R$ is the curvature radius and $R(1 - \cos \theta_c)$ represents the arc sagitta.
- **Angled Row:**
  $$\begin{aligned}
  x_c &= x_{\text{origin}} + (c - 1) \cdot \text{pitch} \cdot \cos \theta \\
  y_c &= y_{\text{origin}} + (c - 1) \cdot \text{pitch} \cdot \sin \theta
  \end{aligned}$$

### 3.3 Row Accessibility Tiers
- `STANDARD`: Standard patron seating.
- `WHEELCHAIR`: Dedicated wheelchair berths (e.g., front/middle accessible tier).
- `COMPANION`: Designated companion seats adjacent to wheelchair bays.
- `RESERVED`: House or VIP holding seats.
- `EMERGENCY_CLEARANCE`: Non-bookable buffer seats along egress pathways.

---

## 4. Multi-Tenant Isolation & Security Hardening

All Section and Row operations enforce:
1. **Tenant Isolation:** Enforced via `SecurityActorContext` and `resolveTheatreId`. Cross-tenant queries are blocked with `AuthorizationError`.
2. **Audit Logging:** Every section/row mutation is logged with structured metadata via `StructuredLogger` under audit modules `SECTION_DESIGNER` and `ROW_DESIGNER`.
3. **Protected Server Actions:** Wrapped with `createProtectedAction` providing schema validation, rate limiting, and RBAC authorization (`SUPER_ADMIN`, `THEATRE_ADMIN`, `HALL_MANAGER`).

---

## 5. Verification Suite & Test Coverage

The automated verification suite (`scripts/verify-section-row-designer.ts`) tests 68 assertions across:
1. Pure sequencing engine (Roman, alphabetical, reversed, prefixes, suffixes).
2. Physical geometry calculations (straight, curved arc sagitta, angled inclination).
3. Section & row integrity validation (unique names, unique codes, positive spacing).
4. Multi-tenant seeds and isolation (Pune, Mumbai, Dubai).
5. Cascading deletion and duplication.
6. Immutability policy enforcement against published versions.
