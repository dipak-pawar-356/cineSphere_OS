# CineSphere OS — Automatic Seat Generator & Seat Category Registry Architecture
## Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)

---

## 1. Executive Summary & Domain-Driven Design (DDD) Hierarchy

Traditional cinema exhibition software tightly couples seat layouts with real-time seat inventory. In enterprise circuits operating multiplexes across varying geographical markets, this coupling creates severe operational vulnerabilities:
- Renaming or reclassifying a seat retroactively breaks historical booking records and audit trails.
- Dynamic pricing logic pollutes the auditorium design blueprint.
- Hardcoded category enums prevent theatre operators from introducing novel seat types (e.g., *Kids Beanbags*, *Family Cabanas*, *Majlis Enclosed Boxes*, or *Sensory Accessible Pods*).

To solve these enterprise challenges, CineSphere OS Phase 4 decouples the **Auditorium Blueprint (Seat Templates)** from the **Operational Show Inventory (Seat Inventory)**:

```
Layout Definition
        │
        ▼
Section
        │
        ▼
Row
        │
        ▼
Seat Template
        │
        ├── Seat Geometry (Coordinates, Width, Height, Spacing, Sagitta)
        ├── Seat Category (Classification Key -> Registry Item)
        ├── Seat Metadata (Sightline, Legroom, Sound Zone, Tags)
        ├── Accessibility (Wheelchair, Companion, Accessible Route)
        └── Coordinates (x, y, rotation, pitch)
                │
                ▼
Published Layout (Immutable Version Milestone)
                │
                ▼
Seat Inventory (Hall Physical Inventory Snapshot)
                │
                ▼
Show Seat Inventory (Show-Specific Reservation State)
                │
                ▼
Booking Engine (Locks, Expirations, Payments)
                │
                ▼
Ticket System (Issued Digital QR Tickets)
```

### Core Separation Invariant
The Hall Designer produces **Seat Templates** inside active draft layout versions. Once published, the layout version becomes an **Immutable Source of Truth**. When a screening event is scheduled, the system generates an independent **Show Seat Inventory**. If a seat's classification or label is modified in a subsequent layout version, historical bookings and financial reports remain completely unaffected.

---

## 2. Three Pillars of the Enterprise Seat Architecture

### 2.1 Immutable Seat Identity
- **Permanent Internal UUIDs:** Every generated seat is assigned an immutable UUID upon generation (`crypto.randomUUID()`).
- **Stable References:** Display names (e.g., `A12`, `VIP-07`) and codes may change between layout revisions, but the internal UUID identity remains constant within the layout version. All booking references, analytics traces, and audit logs anchor to this permanent ID.

### 2.2 Dynamic Category Registry (Decoupled from Enums)
- **Database-Driven Registry:** Categories are modeled as dynamic entities in `seat_category_registry` rather than rigid TypeScript unions or PostgreSQL enums.
- **Circuit Customization:** Any cinema chain can define unlimited custom categories (*Kids*, *Luxury*, *Executive*, *Business*, *Private Box*, *Family*, *Festival*, *Accessible Premium*) through UI configuration without requiring code deployments or database migrations.
- **Independent Color & Priority:** Each category specifies a custom 6-character hex color code, priority tier (1 = highest luxury), premium flag, and accessibility classification.

### 2.3 Strict Pricing Decoupling
- **Fundamental Law:** Seat Categories define **classification and spatial layout only**.
- **No Embedded Prices:** Seat templates and category entities are architecturally barred from storing ticket prices (`price`, `ticketPrice`, `basePrice`).
- **Dynamic Resolution:** Show ticket prices are resolved exclusively by the **Show Pricing Engine** (Phase 2 Part 9) at runtime:
  $$\text{Final Ticket Price} = f(\text{Theatre}, \text{Hall}, \text{Show}, \text{Seat Category}, \text{Day/Time}, \text{Business Rules})$$

---

## 3. Phase 4 – Part 5: Automatic Seat Generator Architecture

The Automatic Seat Generator (`SeatGeneratorEngine`) generates physical 2D/3D seat templates for any row based on geometric topologies, spacing constraints, and numbering conventions.

### 3.1 Spatial Coordinate Mathematics

1. **Straight Row Topology:**
   Seats advance uniformly along the horizontal axis with constant elevation:
   $$\begin{aligned}
   x_c &= x_0 + (c - 1) \cdot (w + s) \\
   y_c &= y_0 \\
   \text{rotation}_c &= 0^\circ
   \end{aligned}$$
   where $w$ is seat width (default 40px), $s$ is spacing (default 10px), and $w + s$ is the horizontal pitch.

2. **Curved Arc Topology (Arc Sagitta Displacement):**
   Seats conform to a concentric circular arc facing the screen focal point. Each seat's vertical displacement is calculated using circular arc sagitta:
   $$\begin{aligned}
   \text{midpoint} &= \frac{N - 1}{2} \\
   \theta_c &= (c - 1 - \text{midpoint}) \cdot \frac{\text{arcAngle}}{N - 1} \cdot \frac{\pi}{180} \\
   \text{sagitta}_c &= R \cdot (1 - \cos \theta_c) \\
   x_c &= x_0 + (c - 1) \cdot (w + s) \\
   y_c &= y_0 + \text{round}(\text{sagitta}_c) \\
   \text{rotation}_c &= \text{round}(\theta_c \cdot \frac{180}{\pi})
   \end{aligned}$$
   where $R$ is curvature radius (e.g., 600px) and $\text{arcAngle}$ is the angular spread (e.g., 30°).

3. **Angled Incline Topology:**
   Seats project along an inclined vector angled at $\phi$ degrees:
   $$\begin{aligned}
   x_c &= x_0 + (c - 1) \cdot (w + s) \cdot \cos \phi \\
   y_c &= y_0 + (c - 1) \cdot (w + s) \cdot \sin \phi \\
   \text{rotation}_c &= \phi
   \end{aligned}$$

### 3.2 Auto-Numbering Strategies
- **`ALPHABETIC`:** Bijective Excel-style column progression (`1` $\to$ `A`, `26` $\to$ `Z`, `27` $\to$ `AA`, `28` $\to$ `AB`).
- **`NUMERIC`:** Standard sequential integers (`1`, `2`, `3`...).
- **`ALPHANUMERIC`:** Combined row-column tokens (e.g. `A1`, `A2`).
- **`ROMAN`:** Roman numerals (`I`, `IV`, `IX`, `XIV`, `XX`, `XL`).
- **`CUSTOM`:** Custom name arrays configured per row.
- **Prefixes & Suffixes:** Configurable string decorators (e.g., `VIP-` + `A1` + `-W` $\to$ `VIP-A1-W`).
- **Reverse Numbering (`isReversed`):** Flips numbering direction for right-to-left patron perspective.
- **Skip Numbers (`skipNumbers`):** Skips superstition or technical gaps (e.g., skipping `13` increments subsequent seats: `12` $\to$ `14`).

### 3.3 Accessibility Classifications
- **`WHEELCHAIR`:** Zero-step ADA roll-in parking berth.
- **`COMPANION`:** Fixed rocker immediately adjacent to a wheelchair bay, programmatically paired via `companionSeatTemplateId`.
- **`ACCESSIBLE_ROUTE`:** Seats bordering main step-free auditorium aisles.
- **`RESERVED`:** Executive or house management holds.
- **`HIDDEN`:** Technical seats suppressed on customer floor plans.

---

## 4. Phase 4 – Part 6: Seat Category Registry Architecture

The Seat Category Registry (`SeatCategoryRegistryItem`) provides dynamic classification without code modifications.

### 4.1 Independent Per-Theatre Configuration

| Theatre Circuit | Seeded Categories | Color Codes | Premium Flags | Accessibility Tiers |
| :--- | :--- | :--- | :--- | :--- |
| **Galaxy Multiplex (Pune - `th-pun-001`)** | VIP Prime, Recliner Gold, Executive Balcony, Standard Club, Wheelchair Berth | `#EF4444`, `#F59E0B`, `#10B981`, `#3B82F6`, `#8B5CF6` | VIP & Recliner | Standard, Wheelchair |
| **Mumbai Royale IMAX (`th-mum-002`)** | Royale Luxury Suite, IMAX Prime Rocker, Economy Tier | `#8B5CF6`, `#6366F1`, `#64748B` | Luxury Suite | Standard, Wheelchair |
| **Dubai Grand Screen (`th-dxb-003`)** | Majlis Private Box, Grand Leather Recliner, Balcony Economy | `#EAB308`, `#F43F5E`, `#3B82F6` | Private Box, Recliner | Standard, Accessible VIP |

### 4.2 Category Lifecycle State Machine
- **Create:** Defines code, name, display name, color, and priority. Enforces unique code per theatre.
- **Update:** Edits labels, priority order, and colors with immediate propagation.
- **Duplicate:** Clones category specification with automatic `_COPY` code suffix.
- **Archive (`ARCHIVED`):** Soft-deactivates category, hiding it from future seat generation while preserving existing templates.
- **Restore (`ACTIVE`):** Re-activates archived category.

---

## 5. Protected Server Actions

All actions are protected by `createProtectedAction`, enforcing RBAC permissions (`SUPER_ADMIN`, `THEATRE_ADMIN`, `HALL_MANAGER`), rate limiting, tenant boundary validation, and structured audit logs:

### Part 5: Seat Generator Actions
- `generateSeatsAction`: Automatically generates seat templates for a row.
- `regenerateSeatsAction`: Clears existing row seats and recalculates fresh templates.
- `deleteGeneratedSeatsAction`: Deletes generated seats for a row.
- `loadSeatsAction`: Loads seat templates by row.
- `loadSeatsByVersionAction`: Loads all seat templates for an auditorium layout version.
- `updateSeatMetadataAction`: Updates sightline, legroom, and accessibility attributes.

### Part 6: Seat Category Registry Actions
- `createCategoryAction`: Adds a new category to the theatre's dynamic registry.
- `updateCategoryAction`: Updates category metadata and display properties.
- `archiveCategoryAction`: Archives a category.
- `restoreCategoryAction`: Restores an archived category.
- `duplicateCategoryAction`: Clones an existing category.
- `loadCategoriesAction`: Retrieves the category registry for a theatre.
- `getCategoryAction`: Fetches a single category definition.

---

## 6. Performance Caching Hook & UI Canvas Integration

### 6.1 `useSeatGenerator` Hook ([use-seat-generator.ts](file:///d:/Project_2k24_25/cineSphere_OS/lib/hooks/use-seat-generator.ts))
- **In-Memory Cache Ref (`rowSeatsCacheRef`):** Prevents redundant database queries when alternating between rows.
- **Optimistic UI Updates:** Instant visual feedback during seat generation and category mutations with automatic rollback on rejection.
- **Memoized Aggregate Selectors:** `totalGeneratedSeats`, `wheelchairCount`, `companionCount`, `seatsByCategory`, and `activeCategoryList`.

### 6.2 Visual Canvas Studio ([hall-designer-canvas-client.tsx](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/halls/designer/hall-designer-canvas-client.tsx))
- **Tab 3 ("Seats & Categories"):**
  - Row target selector grouping rows by parent section.
  - Numbering parameters toolbar (style, prefix, suffix, skip numbers, reverse).
  - Curvature and topology controls (straight, curved arc, angled).
  - Accessibility assignment inputs for wheelchair (♿) and companion seats.
  - "Auto Generate Seats", "Regenerate", and "Clear" actions.
  - Dynamic Category Registry manager displaying color badges, priority ranks, and custom category creation forms.

---

## 7. Automated Test Suite & Verification Results

The automated test suite ([verify-seat-generator.ts](file:///d:/Project_2k24_25/cineSphere_OS/scripts/verify-seat-generator.ts)) validates all requirements across **60 assertions**:
- **Suite 1 (SeatGeneratorEngine):** Roman numerals, alphabetical conversion, numbering formatting, skip numbers, straight/curved/angled coordinate calculations, collision detection, and decoupled pricing assertion.
- **Suite 2 (SeatGeneratorRepository):** Pune, Mumbai, Dubai category seeds, tenant isolation, bulk seat generation, regeneration, metadata updates, companion anchoring, and category CRUD lifecycle.
- **Suite 3 (SeatGeneratorService):** Cross-tenant protection, draft-only immutability policy, and pricing violation rejection.

```
==============================================================================
🎬 CineSphere OS — Phase 4 Parts 5 & 6 Verification Suite
   Automatic Seat Generator (Part 5) & Seat Categories (Part 6)
==============================================================================
--- 1. Testing SeatGeneratorEngine (Sequencing & Formats)     --- [24 PASSED]
--- 2. Testing SeatGeneratorRepository (Multi-Tenant & CRUD) --- [32 PASSED]
--- 3. Testing SeatGeneratorService (Security & Invariants)  --- [ 4 PASSED]
==============================================================================
🎉 ALL 60/60 TESTS PASSED SUCCESSFULLY! (100%)
==============================================================================
```
