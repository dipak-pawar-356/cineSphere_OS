# CineSphere OS — Hall Designer Architecture & Canvas Grid System (Phase 4 – Parts 1 & 2)

## 1. Architectural Philosophy: The Immutable Layout Definition Layer

In enterprise cinema operations, editing an auditorium's seating geometry while active shows and live bookings are underway is a critical operational hazard.

Traditional cinema software allows operators to directly mutate the live hall layout. When seats are moved, re-categorized, or deleted, in-flight ticket reservations experience ghost seating, coordinate desynchronization, and seat collision bugs.

**CineSphere OS solves this with an Immutable Layout Definition Layer:**

```
Theatre
  │
  ▼
Hall
  │
  ▼
Layout Definition
  │
  ├── Draft Version (In-Progress Redesigns)
  ├── Published Version (Current Live Blueprint)
  ├── Archived Versions (Historical Blueprints)
  └── Version History (Audit Trails)
          │
          ▼
    Validation Engine (Collision, Bounds, Section Checks)
          │
          ▼
   Published Layout
          │
          ▼
    Seat Inventory (Master Seat Mapping)
          │
          ▼
 Show Seat Inventory (Per-Show ShowSeat Entities)
          │
          ▼
    Booking Engine
          │
          ▼
    Ticket System
```

### Key Architectural Guarantees

1. **Hall Designer Never Edits Live Layouts:**
   All redesigns occur exclusively within an isolated `DRAFT` version (`LayoutVersion`).
2. **In-Flight Shows & Bookings Isolation:**
   Show seat inventory generators and booking queries invoke `getPublishedLayoutForHall(hallId, theatreId)`. They only read the current `PUBLISHED` version. Draft edits have zero impact on live commercial operations.
3. **Seamless Cutover Upon Publishing:**
   When a new version is validated and published:
   - Only future scheduled shows instantiate seats from the new version.
   - Existing tickets and shows remain permanently bonded to the version they were booked on.
   - The previous live version automatically transitions to `ARCHIVED`, preserving complete legal auditability.
4. **Immutability Enforcement:**
   Once a layout version reaches `PUBLISHED`, `ARCHIVED`, or `DEPRECATED`, direct edits are strictly rejected by the domain policy (`ConflictError: Immutable Version Policy`). To modify, a new draft revision must be branched.

---

## 2. Domain Entities & Type Contracts

### 2.1 Layout Statuses
```typescript
export type LayoutStatus =
  | "DRAFT"       // Editable, non-commercial staging
  | "PUBLISHED"   // Active commercial blueprint used for new shows
  | "ARCHIVED"    // Historical superseded blueprint
  | "INACTIVE"    // Temporarily disabled layout
  | "DEPRECATED"; // Permanently retired layout
```

### 2.2 Layout Definition (`LayoutDefinition`)
```typescript
export interface LayoutDefinition {
  id: string;
  theatreId: string;
  hallId: string;
  name: string;
  description?: string;
  currentPublishedVersionId?: string;
  activeDraftVersionId?: string;
  status: LayoutStatus;
  totalVersionsCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 Layout Version (`LayoutVersion`)
```typescript
export interface LayoutVersion {
  id: string;
  layoutDefinitionId: string;
  theatreId: string;
  versionNumber: number;
  name: string;
  status: LayoutStatus;
  versionNotes?: string;
  sections: HallSectionDefinition[];
  seats: SeatDefinition[];
  walkways: LayoutWalkway[];
  vipZones: string[];
  wheelchairAreas: string[];
  emergencyExits: LayoutEmergencyExit[];
  gridConfig: {
    rows: number;
    columns: number;
    totalCapacity: number;
  };
  metadata: LayoutMetadata;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Pure Validation Engine (`LayoutValidator`)

Before any layout draft can be published to live cinema operations, it must pass the rigorous mathematical validation engine:

- **Duplicate Seat Numbers:** Guarantees no two seats share the same identifier (e.g. two `A1` seats).
- **Coordinate Collisions:** Prohibits multiple seats from occupying the same `(x, y)` coordinate.
- **Section Integrity:** Ensures all seats link to a valid section in the layout definition.
- **Seat Count Parity:** Validates that the sum of section `seatCount` matches the total seat entities.
- **Grid Boundary Clearance:** Flags out-of-bounds seats exceeding configured row/column limits.
- **Auditorium Facilities:** Validates curved screen orientation and emergency exit clearances.
- **Legal Status Transitions:**
  - `DRAFT` ➔ `PUBLISHED` (Allowed)
  - `DRAFT` ➔ `ARCHIVED` (Allowed)
  - `PUBLISHED` ➔ `ARCHIVED` (Allowed)
  - `PUBLISHED` ➔ `DRAFT` (Forbidden)

---

## 4. Visual Canvas & Grid System Engine (Part 2)

The Canvas & Grid Engine provides mathematical precision for visual hall layout modeling:

### 4.1 Multi-Density Grid & Snapping
- **Grid Densities:** Small (`10px`), Medium (`20px`), Large (`40px`).
- **Snapping Threshold:** Pure snapping algorithm `snapCoordinate(val, gridSize, snapStrength)`. If coordinate falls within `snapStrength` (e.g. 8px) of a grid line, it automatically snaps to the line.
- **Configurable Visibility & Opacity:** Theatres can customize grid line color and opacity.

### 4.2 Multi-Unit Measurement Conversions
Cinema halls across regions utilize different architectural measurement standards. The engine seamlessly converts between:
- **`PX` (Pixels):** Base coordinate unit (96 DPI standard).
- **`CM` (Centimeters):** 1 cm = 37.795 px.
- **`FT` (Feet):** 1 ft = 115.2 px (scaled architectural cinema foot).
- **`M` (Meters):** 1 m = 377.95 px.

### 4.3 Viewport Fit-To-Screen (`calculateFitToScreen`)
Dynamically calculates bounding boxes of all seats in the auditorium, scales the layout to fit within the operator's viewport, clamps zoom between `0.25x` and `1.5x`, and centers `(panX, panY)` with padding.

### 4.4 Geometric Seat Alignment Tools (`alignSeats`)
Provides one-click alignment across multi-selected seats:
- `ALIGN_LEFT`: Aligns seats to minimum X coordinate.
- `ALIGN_RIGHT`: Aligns seats to maximum X coordinate.
- `ALIGN_TOP`: Aligns seats to minimum Y coordinate.
- `ALIGN_BOTTOM`: Aligns seats to maximum Y coordinate.
- `CENTER_HORIZONTAL`: Aligns seats to average center X coordinate.
- `CENTER_VERTICAL`: Aligns seats to average center Y coordinate.
- `DISTRIBUTE_HORIZONTALLY`: Evenly spaces seats across the horizontal span.
- `DISTRIBUTE_VERTICALLY`: Evenly spaces seats across the vertical span.

### 4.5 Smart Alignment Guides (`calculateSmartGuides`)
Detects when a dragged seat aligns with existing seats within a threshold (e.g. 4–6px), generating horizontal and vertical visual guide lines with coordinate labels.

---

## 5. Theatre-Specific Canvas Preferences Persistence

Every cinema venue in the CineSphere OS network maintains its own distinct architectural preferences:

| Venue | City / Country | Grid Density | Default Zoom | Measurement Unit | Snap to Grid |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Galaxy Multiplex** | Pune, India | `20px` (Medium) | `100%` | `PX` | Enabled (8px) |
| **Mumbai Royale IMAX** | Mumbai, India | `10px` (Small) | `75%` | `CM` | Disabled |
| **Dubai Grand Screen** | Dubai, UAE | `25px` (Large) | `125%` | `FT` | Enabled (10px) |

These preferences are persisted in the `canvasPreferences` table and loaded dynamically whenever a theatre admin accesses the Hall Designer.
