# CineSphere OS — Phase 2 · Part 5: Hall Management & Dynamic Hall Configuration

## 1. Executive Summary & Architectural Overview

Phase 2 – Part 5 establishes the **Hall Management & Dynamic Hall Configuration** architecture for CineSphere OS. Every Theatre Admin can create and manage unlimited cinema auditoriums strictly scoped to their own cinema complex with absolute multi-tenant isolation.

```
Theatre Admin (Authenticated Multi-Tenant Session)
      │
      ├── Hall Information (Name, Code, Screen Number, Capacity, Optics, Sound, Floor)
      │
      ├── Dynamic Section Configuration (Silver, Gold, Platinum, VIP, Recliner, Wheelchair)
      │     └── Centralized Design System (Colors, Badges, Borders derived from Category)
      │
      ├── Strict Capacity Balance Validation (Hall Capacity == Sum of Section Seats)
      │     └── Real-time Barometer & Save Guard
      │
      ├── Live 2D Floor Plan Schematic Preview (Curved Screen, Audio Channels, Exits, Aisle)
      │
      └── Future 3D Cinema Readiness (Camera Presets, 60° FOV, Eye-Level 1.2m, Three.js Schema)
```

---

## 2. Centralized Design System: Category-Driven Color Derivation

> [!IMPORTANT]
> **Architectural Recommendation Enforced**:
> Section colors are **never** stored as static business strings (e.g. `"Blue"` or `"#38BDF8"`). Instead, each section stores a high-level **Category Tier** (`Silver`, `Gold`, `Platinum`, `VIP`, `Recliner`, `Wheelchair`, `Royal Suite`). Visual styling, background tints, border glowing, and legend colors are derived dynamically from the centralized design system ([`lib/constants/seating-design-system.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/constants/seating-design-system.ts)).

### Design System Token Registry

| Category Tier | Hex Color | Tailwind Tint | Tailwind Border | Text Class | Icon | Default Pitch |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Silver** | `#38BDF8` | `bg-sky-500/15` | `border-sky-500/40` | `text-sky-400` | `Armchair` | 10 seats/row |
| **Gold** | `#FBBF24` | `bg-amber-500/15` | `border-amber-500/40` | `text-amber-400` | `Sparkles` | 12 seats/row |
| **Platinum** | `#EF4444` | `bg-rose-500/15` | `border-rose-500/40` | `text-rose-400` | `Crown` | 12 seats/row |
| **VIP** | `#A855F7` | `bg-purple-500/15` | `border-purple-500/40` | `text-purple-400` | `Star` | 8 seats/row |
| **VIP Recliner** | `#8B5CF6` | `bg-violet-500/15` | `border-violet-500/40` | `text-violet-400` | `Star` | 8 seats/row |
| **Recliner** | `#10B981` | `bg-emerald-500/15` | `border-emerald-500/40` | `text-emerald-400` | `Sofa` | 6 seats/row |
| **Wheelchair** | `#06B6D4` | `bg-cyan-500/15` | `border-cyan-500/40` | `text-cyan-400` | `Accessibility` | 4 seats/row |
| **Royal Suite** | `#EC4899` | `bg-pink-500/15` | `border-pink-500/40` | `text-pink-400` | `Gem` | 6 seats/row |

This abstraction ensures that a global theme change or dark/light mode toggle updates all 2D schematics, tickets, and future 3D viewports without altering persistent database records.

---

## 3. Strict Capacity Validation Rule

$$\text{Hall Capacity} \equiv \sum_{i=1}^{N} \text{Section Seats}_i$$

The Theatre Admin should never manually construct individual seat matrices. Instead, the admin defines sections with assigned seat counts. The system enforces strict mathematical balance:

1. **Balanced** ($\sum \text{Seats} = \text{Capacity}$): The "Save Auditorium" button is enabled with a green badge: *"Capacity Balanced: All X seats are precisely allocated."*
2. **Under-Allocated** ($\sum \text{Seats} < \text{Capacity}$): Saving is disabled with an amber alert: *"Under-allocated: Y seats remaining to reach Hall Capacity of X."*
3. **Over-Allocated** ($\sum \text{Seats} > \text{Capacity}$): Saving is disabled with a crimson alert: *"Over-allocated: Sections total Y seats, which exceeds Hall Capacity (X) by Z seats."*

---

## 4. Live 2D Floor Plan Schematic Preview

The interactive component [`components/theatre/hall-preview-2d.tsx`](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre/hall-preview-2d.tsx) updates reactively as the admin alters sections:
- **Curved Screen Aperture**: Torus projection arc with glowing ambient light and audio channel outputs (`L-Channel`, `C-Channel`, `R-Channel`).
- **Proportional Section Blocks**: Section heights and widths reflect relative seat counts ($\text{Seats} / \text{Capacity} \times 100\%$).
- **Dynamic Row Spans**: Displays calculated rows (e.g. `Rows A – C`, 10 seats/row).
- **Aisles & Egress**: Center audience aisle and emergency exit doors (`EXIT 1 Stage Left`, `EXIT 2 Stage Right`, `EXIT 3 Lobby Concourse`).
- **Future 3D Frustum Indicator**: Toggleable wireframe cone displaying the camera focal cone ($60^\circ$ FOV, eye height $1.2\,\text{m}$) indicating future 3D viewer readiness.

---

## 5. Future 3D Viewport & Seat Generation Readiness

No heavy Three.js bundles or seat matrix loops were added in this phase, preserving clean separation of concerns:
- **Phase 2 Part 6 (Upcoming)**: The Automatic Seat Generation Engine will ingest these balanced sections and generate discrete seat records (`A1`..`A20`, `B1`..`B30`, `C1`..`C50`) with $(x, y, z)$ coordinates.
- **Phase 6 (Future)**: The React Three Fiber viewer will bind directly to the stored `future3DConfig` camera presets:
  - *Center Sweetspot*: `[0, 4.5, 14]` looking at `[0, 2, 0]` ($60^\circ$ FOV).
  - *Screen Horizon View*: `[0, 1.5, 1]` looking at `[0, 5, 20]` ($75^\circ$ FOV).
  - *VIP Elevation Tier*: `[-5, 6, 18]` looking at `[0, 3, 0]` ($55^\circ$ FOV).

---

## 6. Multi-Tenant Isolation & Route Inventory

| Route | View | Description |
| :--- | :--- | :--- |
| [`/theatre/halls`](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/halls/page.tsx) | Fleet Overview | Search, filters (capacity, projection, screen, status), Grid vs. Enterprise Table view, duplicate, archive, and status toggles. |
| [`/theatre/halls/[id]`](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/halls/[id]/page.tsx) | Detail View | 2D schematic, sections breakdown, hardware diagnostics, future 3D readiness, programmed showtimes, and audit logs. |
| [`/theatre/halls/designer`](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/halls/designer/page.tsx) | CAD Studio | Dedicated section and capacity layout studio. |

### Server Actions
- `createHallAction`: Server-side capacity validation, unique hall code check, and tenant ownership check.
- `updateHallAction`: Prevents cross-tenant modifications and validates section balance.
- `archiveHallAction`: Soft-archives auditorium and logs audit event.
- `toggleHallStatusAction`: Switches state between `Active`, `Inactive`, and `Maintenance`.
- `duplicateHallAction`: Clones hall with unique code suffix (`-COPY`) and `Draft` status.
