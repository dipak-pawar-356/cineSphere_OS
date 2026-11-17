# Seat Inventory Integration & Hall Templates Architecture

**CineSphere OS — Phase 4: Parts 13 & 14**  
*Enterprise Domain Architecture for Blueprint-Driven Show Seat Inventory and Reusable Multi-Tenant Hall Blueprint Templates*

---

## 1. Executive Summary & Architectural Invariants

In modern cinema management systems, naive architectures tightly couple the physical auditorium CAD layout directly to ticketing and booking inventory:

```
[Naive Anti-Pattern]
Hall Layout (CAD) ───► Seat Inventory ───► Real-Time Booking
```

This direct linkage creates critical production vulnerabilities:
- Redesigning or adjusting seat coordinates in an auditorium breaks in-flight shows or historical booking records.
- Hall layout updates cannot easily introduce staged maintenance blocks without risking live public inventory corruption.
- Creating new halls requires manual layout authoring from scratch or rudimentary row copying that does not isolate structural elements (screens, fire exits, aisles) or accessibility paths.

CineSphere OS enforces a **Blueprint-Driven Snapshot Architecture** coupled with an **Immutable Template Blueprint Engine**:

```
[CineSphere OS Production Architecture]

  Hall Template Blueprint (Built-in or Custom)
              │
              ▼ (Instantiate Layout)
      Layout Definition
              │
              ▼ (Atomic Publish Pipeline)
    Published Layout Version (v1, v2, ...)
              │
              ▼ (Generate Blueprint)
    Seat Inventory Blueprint (Canonical Master)
              │
              ▼ (Snapshot Per Show)
      Show Seat Inventory
              ├── Dynamic Pricing Resolution
              ├── Real-Time Booking Engine
              ├── Digital Ticket Generation
              ├── Live Availability Matrix
              └── Maintenance & Disability Holds
```

### Key Architectural Invariants
1. **Show Inventory Immutability:** Once a show is scheduled and associated with an inventory snapshot, its seat configuration is permanently immutable. Hall redesigns generate new layout versions affecting future shows only.
2. **Strict Regeneration Guard:** Regenerating an inventory snapshot is strictly forbidden (`ValidationError`) if any seat within that show has active bookings (`bookedSeatsCount > 0` or active reservations).
3. **Deterministic Seat Identification:** Internal seat IDs are generated via deterministic SHA-256 hash digests (`seat:hallId:sectionId:rowName:seatNumber`), ensuring cross-module referential integrity.
4. **Decoupled Pricing Law:** Seat Inventory defines seating geometry, categories, and availability status only. Real-time pricing is evaluated dynamically by the Show Pricing Engine without hardcoded values.
5. **Template Immutability:** Built-in platform templates are strictly read-only (`isBuiltIn: true`). Editing a layout generated from a template never mutates the parent blueprint.
6. **Multi-Tenant Library Isolation:** Theatres can author custom templates or inherit from platform templates; tenant templates are strictly isolated from cross-tenant discovery.

---

## 2. Phase 4 – Part 13: Seat Inventory Integration

### 2.1 The Show Seat Inventory Snapshot Model

Each show operates on its own dedicated `SeatInventory` header and `SeatInventoryItem[]` collection stored in PostgreSQL (`seat_inventories` and `seat_inventory_items`).

#### Entity Hierarchy
```
SeatInventory (1)
  ├── id (UUID)
  ├── showId (UUID, Unique)
  ├── hallId (UUID)
  ├── theatreId (UUID)
  ├── layoutVersionId (UUID)
  ├── totalSeats (Integer)
  ├── availableSeatsCount (Integer)
  ├── reservedSeatsCount (Integer)
  ├── bookedSeatsCount (Integer)
  ├── blockedSeatsCount (Integer)
  ├── maintenanceSeatsCount (Integer)
  ├── status ("ACTIVE" | "LOCKED" | "ARCHIVED" | "DEPRECATED")
  │
  └── SeatInventoryItem (1:N)
        ├── id (UUID)
        ├── inventoryId (UUID -> seat_inventories.id)
        ├── seatDefinitionId (String)
        ├── internalSeatId (Deterministic Hash)
        ├── sectionId (String)
        ├── sectionName (String)
        ├── rowName (String)
        ├── seatNumber (Integer)
        ├── seatType ("Standard" | "Recliner" | "VIP" | "Couple" | "Wheelchair")
        ├── categoryId (String)
        ├── bookingStatus ("AVAILABLE" | "RESERVED" | "BOOKED" | "BLOCKED" | "MAINTENANCE" | "DISABLED")
        ├── isAccessible (Boolean)
        ├── basePrice (Decimal / Number)
        ├── pricingTier (String)
        ├── pricingRuleId (String | null)
        └── coordinates ({ x: number, y: number })
```

### 2.2 Deterministic Internal Seat ID Derivation

To guarantee that the Booking Engine, Digital Ticket System, and Analytics Marts can uniquely reference a seat across lifecycle states without relying on transient auto-increment integers:

$$\text{Seed} = \text{theatreId} : \text{hallId} : \text{sectionId} : \text{rowName} : \text{seatNumber}$$
$$\text{Digest} = \text{SHA256}(\text{Seed})$$
$$\text{internalSeatId} = \text{"isid-" } + \text{Digest}[0..16]$$

This mathematical derivation guarantees that:
- Identical physical coordinates and row/seat numbers produce identical internal IDs across regenerations before booking.
- Different seat positions produce distinct, collision-free identifiers.

### 2.3 Dynamic Non-Hardcoded Pricing Resolution

The Seat Inventory Engine does not hardcode ticket prices. When generating or synchronizing inventory, it invokes the **Show Dynamic Pricing Engine** resolving:
1. Base price for the assigned seat category (`VIP`, `Standard`, `Recliner`, etc.).
2. Show-time modifiers (Morning Matinee, Prime Evening, Late Night).
3. Section-level multipliers and statutory convenience fees with integrated GST.

```typescript
// Dynamic Pricing Resolution Pipeline
const resolvedPrice = await this.pricingService.calculateSeatPrice({
  theatreId,
  showId,
  categoryId: seat.categoryId,
  seatType: seat.seatType,
  sectionId: seat.sectionId,
  bookingDate: show.showDate,
  showTime: show.startTime,
});
```

### 2.4 Maintenance & Operational Seat Statuses

Seats support granular lifecycle statuses:
- `AVAILABLE`: Ready for customer discovery and reservation.
- `RESERVED`: Temporarily held in an active booking session (with lock countdown timer).
- `BOOKED`: Confirmed admission pass issued following successful payment.
- `BLOCKED`: Held by theatre management (e.g. VIP guest reservation, distributor seats).
- `MAINTENANCE`: Mechanically defective (e.g. broken recliner motor, torn upholstery). Maintenance seats are automatically excluded from the public booking engine.
- `DISABLED`: Inactive or removed from the seating plan for acoustic or technical clearance.

### 2.5 Multi-Tenant Inventory Governance Policies

Venue-specific inventory operational policies are defined in `inventory_configurations`:

| Policy Dimension | Pune Cineplex (`th-pun-001`) | Mumbai Grand (`th-mum-002`) | Dubai Luxury (`th-dxb-003`) |
|---|---|---|---|
| **Generation Mode** | `AUTOMATIC` (on show create) | `MANUAL_APPROVAL` | `AUTOMATIC` |
| **Maintenance Holds** | Enabled (Allows flagging) | Disabled (Maintenance off) | Enabled |
| **Strict Regeneration** | Enabled (`true`) | Enabled (`true`) | Enabled (`true`) |
| **Seat Lock Duration** | 600 seconds (10 min) | 480 seconds (8 min) | 720 seconds (12 min) |
| **Default Currency** | `INR` (₹) | `USD` ($) | `AED` (د.إ) |

---

## 3. Phase 4 – Part 14: Hall Templates Architecture

### 3.1 Reusable Blueprint Engine

Hall Templates eliminate redundant CAD layout drafting by providing standardized, production-validated auditorium configurations. When a template is instantiated:
1. It creates an independent `LayoutDefinition` and its initial `LayoutVersion` (v1).
2. All sections and seats are cloned with fresh isolated identifiers (`sec-layoutDefId-N`, `seat-versionId-N`).
3. Structural objects (Screen, Exits, Walls, Aisles) are cloned and registered with the hall's layout version.
4. **Source Template Immutability:** Future edits, row removals, or category customizations on the generated layout never mutate the source template.

### 3.2 The 8 Built-in Platform Templates Catalog

CineSphere OS provides 8 built-in platform templates covering diverse commercial exhibition requirements:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                  BUILT-IN PLATFORM TEMPLATES CATALOG                         │
├────────────────────┬───────┬──────────┬──────────────────────────────────────┤
│ Template Category  │ Seats │ Sections │ Architectural Focus                  │
├────────────────────┼───────┼──────────┼──────────────────────────────────────┤
│ 1. SMALL_THEATRE   │ 40    │ 2        │ Boutique / Art-House cinema          │
│ 2. MULTIPLEX       │ 120   │ 3        │ Standard commercial multiplex screen │
│ 3. PREMIUM         │ 60    │ 2        │ Luxury recliner auditorium           │
│ 4. IMAX            │ 180   │ 3        │ Curved stadium seating + huge screen │
│ 5. 4DX             │ 80    │ 2        │ Motion-base modular seating          │
│ 6. OPEN_AIR        │ 150   │ 2        │ Outdoor / Drive-in amphitheatre      │
│ 7. MINI_THEATRE    │ 24    │ 1        │ Private screening lounge / VIP room  │
│ 8. AUDITORIUM      │ 250   │ 4        │ Massive multi-tier flagship hall     │
└────────────────────┴───────┴──────────┴──────────────────────────────────────┘
```

#### Detailed Built-in Specifications

1. **Art-House Small Theatre (`SMALL_THEATRE`):**
   - **Capacity:** 40 seats.
   - **Sections:** Front Standard (20 seats, Rows A–B), Rear Premium (20 seats, Rows C–D).
   - **Infrastructure:** Compact Screen, Main Entrance, Fire Exit, Center Aisle.

2. **Commercial Multiplex (`MULTIPLEX`):**
   - **Capacity:** 120 seats.
   - **Sections:** Silver (40 seats, Rows A–D), Gold (50 seats, Rows E–I), VIP Lounge (30 seats, Rows J–L).
   - **Infrastructure:** Wide Curved Screen, Foyer Entrance, Emergency Exit, Twin Aisles.

3. **Luxury Recliner Suite (`PREMIUM`):**
   - **Capacity:** 60 motorized recliner seats.
   - **Sections:** Club Recliner (30 seats, Rows A–C), Royal Recliner (30 seats, Rows D–F).
   - **Infrastructure:** Deep Acoustic Screen, Service Aisle, Dedicated Foyer, Wide Legroom Clearance.

4. **IMAX Experience (`IMAX`):**
   - **Capacity:** 180 seats.
   - **Sections:** Lower Tier (50 seats), Middle Prime (80 seats), High Balcony (50 seats).
   - **Infrastructure:** Massive Curved IMAX Screen, Dual Emergency Fire Exits, Sound Dampening Dividers.

5. **4DX Immersive Hall (`4DX`):**
   - **Capacity:** 80 motion-synchronized seats arranged in 4-seat quad pods.
   - **Sections:** Standard 4DX (40 seats), Prime 4DX (40 seats).
   - **Infrastructure:** Curved Screen, Wind/Fog Rig Boundaries, Emergency Safety Aisles.

6. **Open-Air Amphitheatre (`OPEN_AIR`):**
   - **Capacity:** 150 seats with wide row pitch.
   - **Sections:** Lawn Front (75 seats), Terrace Back (75 seats).
   - **Infrastructure:** Outdoor Truss Screen, Perimeter Fencing, Wide Emergency Egress Gates.

7. **Private VIP Screening Lounge (`MINI_THEATRE`):**
   - **Capacity:** 24 luxury plush seats.
   - **Sections:** Majlis Royal VIP (24 seats, Rows A–C).
   - **Infrastructure:** Acoustic Wall Panels, Private Bar Entrance, Stage / Presentation Podium.

8. **Grand Flagship Auditorium (`AUDITORIUM`):**
   - **Capacity:** 250 seats across 4 tiered sections.
   - **Sections:** Orchestra (80 seats), Mezzanine (70 seats), Dress Circle (60 seats), Royal Box (40 seats).
   - **Infrastructure:** Grand Presentation Stage, Main Curved Screen, Balcony Stairs, Multi-Aisle Egress.

### 3.3 Template Inheritance & Custom Templates

Theatres can create custom templates from scratch or inherit from an existing base template:
- `parentTemplateId`: Records derivation lineage (`th-pun-001-custom-vip` derived from `tpl-built-in-multiplex`).
- `isBuiltIn: false`: Identifies custom templates, enabling theatre-level mutation, duplication, and archiving.
- **Platform Read-Only Enforcement:** Attempting to update or delete a built-in template throws `TenantAccessError("Immutable Platform Template")`.

```typescript
// Template Inheritance Workflow
const customInherited = await hallTemplatesService.createTemplate(actor, {
  theatreId: "th-pun-001",
  name: "Pune VIP Gold Multiplex",
  code: "PUN_VIP_GOLD",
  category: "MULTIPLEX",
  parentTemplateId: "tpl-built-in-multiplex",
  canvasSettings: { ...baseMultiplex.canvasSettings, theme: "dark" },
  gridConfig: { ...baseMultiplex.gridConfig },
  sections: customizedSections,
  seats: customizedSeats,
  structuralObjects: baseMultiplex.structuralObjects,
});
```

---

## 4. Protected Server Actions & React Hooks

### 4.1 Part 13 Server Actions (`actions/seat-inventory-integration-actions.ts`)

| Action Name | Description | Security Guards |
|---|---|---|
| `generateInventoryAction` | Generates show inventory from published layout | `theatre:manage`, `show:manage` |
| `regenerateInventoryAction` | Recreates inventory (blocked if active bookings) | `theatre:manage`, `show:manage`, Zero Bookings Guard |
| `syncInventoryAction` | Synchronizes inventory with latest active layout | `theatre:manage`, `show:manage` |
| `loadInventoryAction` | Fetches show inventory and all item statuses | `theatre:view` |
| `validateInventoryAction` | Audits inventory integrity against layout | `theatre:view` |
| `updateSeatStatusAction` | Toggles maintenance/blocked seat flags | `theatre:manage`, Admin Role |
| `loadInventoryConfigAction` | Retrieves theatre inventory governance policy | `theatre:view` |
| `saveInventoryConfigAction` | Updates theatre inventory governance policy | `theatre:manage`, Admin Role |

### 4.2 Part 14 Server Actions (`actions/hall-templates-actions.ts`)

| Action Name | Description | Security Guards |
|---|---|---|
| `loadTemplatesAction` | Fetches platform built-ins + theatre custom templates | `theatre:view` |
| `getTemplateDetailsAction`| Loads detailed sections, seats, and objects | `theatre:view` |
| `createTemplateAction` | Creates custom template (direct or inherited) | `template:manage`, Quota Check |
| `updateTemplateAction` | Updates custom template (rejects built-ins) | `template:manage`, Non-BuiltIn Guard |
| `duplicateTemplateAction` | Clones template into fresh custom blueprint | `template:manage` |
| `archiveTemplateAction` | Soft-archives custom template | `template:manage` |
| `generateLayoutFromTemplateAction` | Instantiates LayoutDefinition & LayoutVersion | `hall:manage`, `theatre:manage` |
| `loadTemplateConfigAction`| Retrieves theatre template policy | `theatre:view` |
| `saveTemplateConfigAction`| Updates theatre template policy | `template:manage`, Admin Role |

---

## 5. Automated Verification Suites

Both modules feature comprehensive, production-grade automated test runners verifying all architectural invariants:

### Part 13 Verification (`scripts/verify-seat-inventory-integration.ts`)
- **Suite Coverage:** 33 assertions covering:
  - Blueprint snapshot generation from published layout version.
  - Deterministic SHA-256 internal seat ID generation.
  - Dynamic non-hardcoded pricing resolution.
  - Invariant protection: strict regeneration guard on booked shows.
  - Maintenance seat marking and exclusion.
  - Multi-tenant policy enforcement (Pune vs Mumbai vs Dubai).
  - Protected React Server Actions execution and audit trail logging.
- **Result:** `Passed: 33 | Failed: 0` (100% Pass).

### Part 14 Verification (`scripts/verify-hall-templates.ts`)
- **Suite Coverage:** 42 assertions covering:
  - Catalog verification for all 8 built-in platform templates.
  - Seat count and section parity across all 8 templates.
  - Template inheritance and parent tracking.
  - Platform template immutability (rejection of mutation attempts).
  - Blueprint layout generation (`LayoutDefinition` and `LayoutVersion` v1).
  - Source template immutability (layout edits do not mutate template).
  - Template duplication and archiving.
  - Multi-tenant library isolation between venues.
  - Protected React Server Actions execution.
- **Result:** `Passed: 42 | Failed: 0` (100% Pass).

---

## 6. Verification Commands

```powershell
# Type check all TypeScript source code
pnpm run type-check

# Run Part 13 verification suite
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-seat-inventory-integration.ts

# Run Part 14 verification suite
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-hall-templates.ts

# Regression check layout versioning and publishing
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-layout-versioning.ts
.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-publishing-workflow.ts
```
