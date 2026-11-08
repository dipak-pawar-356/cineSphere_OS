# 🎬 CineSphere OS — Phase 2 - Part 8: Show Management & Scheduling Architecture

## 📌 Executive Summary & Architectural Mandate

In enterprise cinema operations (such as BookMyShow, Vista Cinema, PVR INOX, AMC Theatres), **a Show is NOT simply `Movie + Hall + Date + Time`**. 

A Show represents a **complete screening event** that acts as the central business entity of the entire platform:

$$\text{Show} = \text{Movie} + \text{Theatre} + \text{Hall} + \text{Date} + \text{Start Time} + \text{End Time} + \text{Language} + \text{Format} + \text{Pricing Profile} + \text{Seat Inventory} + \text{Booking Status} + \text{Sales Status}$$

```
                                  ┌───────────────────────────┐
                                  │      CANONICAL MOVIE      │
                                  │   (Phase 2 - Part 7)      │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │      SCREENING EVENT      │
                                  │          (SHOW)           │
                                  │    Central Business Hub   │
                                  └───────┬───────────┬───────┘
                                          │           │
                     ┌────────────────────┘           └────────────────────┐
                     ▼                                                     ▼
      ┌─────────────────────────────┐                       ┌─────────────────────────────┐
      │       PRICING PROFILE       │                       │     SHOW SEAT INVENTORY     │
      │   Section Rates:            │                       │   Derived from Hall Layout  │
      │   Silver: ₹180 | Gold: ₹240 │                       │   Independent Availability: │
      │   VIP: ₹450 | Recliner: ₹550│                       │   Available, Booked, Blocked│
      └─────────────────────────────┘                       └─────────────────────────────┘
```

Every downstream business subsystem in CineSphere OS—including **customer seat selection, bookings, payments, QR tickets, turnstile telemetry, hall occupancy heatmaps, ATP tracking, and GST reporting**—references the **Show**, never the Movie or Hall directly.

---

## 🏛️ 1. Core Architectural Pillars

### 1.1 Show as the Central Business Entity
- **Decoupled Film Assets**: The Movie provides creative metadata (runtime, certificate, audio tracks, formats, posters, trailers), but never stores prices, dates, or auditoriums.
- **Decoupled Auditoriums**: The Hall provides physical geometry, audio/projection hardware, and reusable seat layout templates, but never stores show-specific availability or pricing.
- **The Show Connects Them**:
  ```typescript
  export interface EnrichedShow {
    id: string;
    showCode: string; // e.g. "SH-PUN-01-DUNE2-1915"
    movieId: string;
    theatreId: string;
    hallId: string;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    intermissionMinutes: number;
    cleaningBufferMinutes: number;
    totalOccupiedMinutes: number;
    language: string;
    format: string;
    status: ShowStatus;
    bookingStatus: BookingAvailabilityStatus;
    salesStatus: ShowSalesStatus;
    pricingProfileId: string;
    sectionPricing: Record<string, number>;
    ticketPrice: number;
    totalSeats: number;
    seatsBooked: number;
    seatsAvailable: number;
  }
  ```

---

### 1.2 Reusable Pricing Profiles Subsystem
Rather than permanently embedding pricing into the Show record or Hall layout, CineSphere OS introduces **Reusable Pricing Profiles**:

```
Movie
  ↓
Show
  ↓
Pricing Profile
  ↓
Section Prices (Silver, Gold, Platinum, VIP, Recliner)
```

#### Pre-Configured Pricing Profiles:
1. **Morning Weekday Economy (`pp-morning-weekday`)**: Mon–Thu before 13:00 (Silver: ₹180, Gold: ₹240, VIP: ₹450).
2. **Weekday Matinee Regular (`pp-weekday-matinee`)**: Mon–Thu 13:00–17:00 (Silver: ₹220, Gold: ₹280, VIP: ₹500).
3. **Prime Evening (`pp-weekday-evening`)**: Mon–Thu 17:00–23:00 (Silver: ₹280, Gold: ₹360, VIP: ₹650).
4. **Weekend Blockbuster Prime (`pp-weekend-blockbuster`)**: Fri–Sun high demand (Silver: ₹350, Gold: ₹450, VIP: ₹800).
5. **IMAX Laser Special Experience (`pp-imax-laser-special`)**: Flagship laser format (Silver: ₹400, Gold: ₹550, VIP: ₹950).

---

### 1.3 Deterministic Conflict Detection & Turnaround Engine
The Scheduling Engine mathematically enforces that **no auditorium can host overlapping shows or violate cleaning turnarounds**:

$$\text{Screening End Time} = \text{Start Time} + \text{Movie Duration} + \text{Intermission}$$
$$\text{Auditorium Available} = \text{Screening End Time} + \text{Cleaning Buffer}$$

- **Collision Condition**:
  An overlap occurs if for any existing show in the same hall:
  $$\text{Candidate}_{\text{Start}} < \text{Existing}_{\text{TurnaroundEnd}} \quad \land \quad \text{Candidate}_{\text{TurnaroundEnd}} > \text{Existing}_{\text{Start}}$$
- **Smart Remediation**:
  When a collision is detected, the engine instantly computes the earliest safe turnaround slot and displays a 1-click auto-apply button (e.g. *"Earliest safe turnaround slot: 22:05"*).

---

### 1.4 Dynamic Show Seat Inventory Synthesis
When a Show is scheduled:
1. The engine loads the Hall's immutable Seat Template (from Phase 2 Part 6).
2. It cross-references the assigned Pricing Profile to inject dynamic section prices per seat.
3. It generates an independent `ShowSeat[]` inventory array where each seat maintains its own status (`Available`, `Locked`, `Reserved`, `Booked`, `Blocked`), tier, price, and 3D camera anchor.
4. The master Hall Seat Template remains 100% pristine and reusable for thousands of subsequent shows.

---

## 🎛️ 2. User Interfaces & Dispatch Views

### 2.1 Showtime Dispatch Control Plane (`/theatre/shows`)
- **Executive Telemetry**: Active screenings today, overall seat occupancy barometer, estimated box office yield, and active auditoriums.
- **Multi-Faceted Search & Filters**: Search across Movie, Hall, Show Code, Language, Format, and Date; filter pills for Hall, Screen Format, Audio Track, Status, and Booking State.
- **View Modes**:
  - **Table View**: Comprehensive operational ledger showing movie art, hall, timetable, format chip, pricing profile, seat occupancy progress bar, lifecycle badges, and quick actions.
  - **Grid Cards View**: Card-based gallery with poster art, turnaround meters, and occupancy barometers.

### 2.2 Visual Multi-Screen Calendar & Timeline Matrix (`/theatre/shows/calendar`)
- **Multi-Screen Horizontal Tracks**: Visual timeline rows for each physical auditorium.
- **Date Switcher**: 7-day calendar navigation tabs with Day and Date badges.
- **Visual Show Blocks**: Color-coded blocks displaying screening hours, format badges, language tags, and turnaround buffers.
- **Direct Slot Programming**: 1-click slot insertion per auditorium.

### 2.3 Standalone Program Screening Route (`/theatre/shows/create`)
- Dedicated full-page screening dispatcher with real-time conflict detection banner and side-by-side Live Screening Card preview.

### 2.4 Deep-Dive Screening Event Inspector (`/theatre/shows/[id]` & `ShowDetailModal`)
- Detailed telemetry view with cinematic backdrop, auditorium hardware specs (projector, sound processor, aspect ratio), timetable breakdown, pricing profile rates table, and seat inventory meters.

---

## ⚡ 3. Server Actions & Security Architecture (`actions/show-actions.ts`)

| Server Action | Description | RBAC Level | Audit Log Action |
|---|---|---|---|
| `createShowAction` | Validates turnaround, checks hall conflicts, maps pricing, creates show, and seeds inventory | `THEATRE_ADMIN` (80) | `SHOW_PROGRAMMED` |
| `updateShowAction` | Re-evaluates timetable changes for collisions and updates schedule parameters | `THEATRE_ADMIN` (80) | `SHOW_UPDATED` |
| `cancelShowAction` | Cancels screening, updates booking status to `Cancelled`, and logs justification | `THEATRE_ADMIN` (80) | `SHOW_CANCELLED` |
| `archiveShowAction` | Archives completed or off-sale screening event | `THEATRE_ADMIN` (80) | `SHOW_ARCHIVED` |
| `duplicateShowAction` | Clones screening event to another date or timetable slot with conflict checking | `THEATRE_ADMIN` (80) | `SHOW_PROGRAMMED` |
| `validateScheduleAction` | Real-time conflict validation API for reactive UI banners | `THEATRE_ADMIN` (80) | — |

---

## 🧪 4. Quality Assurance & Build Verification

- **TypeScript Compilation**: `pnpm run type-check` (`tsc --noEmit`) $\rightarrow$ **0 errors**.
- **Next.js Linting**: `pnpm run lint` $\rightarrow$ **0 errors**.
- **Tenant Isolation**: All operations are strictly partitioned by `theatreId` (`th-pun-001`), guaranteeing zero cross-tenant data leakage.
- **Zero Pricing Invariant**: Canonical movies remain 100% free of pricing, hall, and booking data.

