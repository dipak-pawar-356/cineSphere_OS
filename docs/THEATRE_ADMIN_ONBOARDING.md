# 🏢 CineSphere OS — Phase 2 Part 4: Theatre Admin Onboarding & Management

> **The Operating System for Modern Cinemas**  
> **Enterprise Multi-Tenant Cinema Management Platform**  
> *Tenant Isolation Architecture · Customer-Driven Admissions · Independent UPI Rail · TypeScript 5.7+*

---

## 1. Executive Summary

Phase 2 – Part 4 establishes the production-grade **Theatre Admin Management Module** for CineSphere OS.

Each Theatre Admin securely manages **ONLY their assigned cinema complex** (`/theatre/...`). In full accordance with enterprise multi-tenancy principles, operational data, physical assets (halls, screens), movie prints, show schedules, staff rosters, media vaults, and financial configurations (UPI VPAs, nodal bank accounts) are isolated per tenant.

### Fundamental Architectural Laws of Phase 2 Part 4
1. **Zero Cross-Tenant Leakage**: A Theatre Admin assigned to *CineSphere Grand Cinemas, Pune* (`th-pun-001`) cannot view, query, or mutate records belonging to *CineSphere Royale Palladium, Mumbai* (`th-mum-001`).
2. **Customer-Driven Booking Ingestion**: **Theatre Admins do not manually create ticket bookings.** Bookings originate exclusively through customer checkouts. The Theatre Admin's responsibility is to monitor real-time admissions, verify QR turnstile scans, inspect seat fill rates, and handle cancellations/settlements.
3. **Independent Merchant & UPI Rails**: Every cinema owns its independent payment credentials (`upiId`, merchant display names, and payment gateway keys). Customer ticket funds flow directly to the hosting cinema's bank account, not a centralized platform pool.
4. **Decoupled Pricing & Inventory**: Movies never connect directly to seats or pricing. Hall layouts are designed once and reused across shows. The **Show** is the central connector uniting Hall, Movie, Date, Time, Base Starting Price, and real-time Seat Inventory.

---

## 2. Separation of Responsibilities Across Personas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Enterprise Persona Scope                         │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Persona         │ Core Operational Domain & Architectural Responsibilities │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ **Super Admin** │ Governs platform health, approves/rejects new cinemas,   │
│                 │ configures SaaS subscription plans, and manages macro BI. │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ **Theatre Admin**│ Manages ONE cinema complex: operating hours, profile,    │
│                 │ UPI rail, movie catalog, show programming, crew roster,   │
│                 │ media vault, and monitors patron admissions.              │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ **Hall Manager**│ (Phase 2 Part 5) Specializes in auditorium hardware,     │
│                 │ acoustic calibration, Barco/Dolby lasers, and 2D/3D CAD.  │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ **Customer**    │ Discovers showtimes, selects seats, remits UPI payments,  │
│                 │ and receives mobile QR m-tickets. Bookings originate here.│
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 3. Theatre Admin Route Inventory & Capabilities

All Theatre Admin routes are hosted under the `app/(theatre-admin)/theatre/` directory tree:

```
app/(theatre-admin)/theatre/
├── page.tsx                     # Tenant Dashboard & Operations Command Center
├── dashboard/
│   └── page.tsx                 # Alias route linking to main Tenant Dashboard
├── profile/
│   └── page.tsx                 # Theatre Profile & Geographic Coordinates Studio
├── media/
│   └── page.tsx                 # Digital Media & Creative Asset Vault
├── upi/
│   └── page.tsx                 # Dedicated UPI Rail & Payment Configuration Studio
├── halls/
│   ├── page.tsx                 # Auditoriums & Screen Fleet Management Entry
│   └── designer/                # (Phase 2 Part 5) CAD Hall Designer Entry Point
├── movies/
│   └── page.tsx                 # Feature Film Catalog & Exhibition License Ingestion
├── shows/
│   └── page.tsx                 # Showtime Dispatch & Timetable Programming Studio
├── bookings/
│   ├── page.tsx                 # Live Patron Bookings Stream & Admission Monitor
│   └── today/                   # Turnstile QR Check-in & Gate Admissions Log
├── staff/
│   ├── page.tsx                 # Field Crew Roster, Shifts & Role Assignments
│   └── managers/                # Dedicated Hall Managers Management Desk
├── reports/
│   └── page.tsx                 # Operational Box Office Audits, Margins & Tax Exports
└── settings/
    └── page.tsx                 # Turnstile Gate Protocols, Buffer Rules & Policies
```

### Detailed Route Specifications

#### 1. Tenant Operations Dashboard (`/theatre` & `/theatre/dashboard`)
- **Key Real-Time Telemetry**:
  - Today's Shows count (e.g., 25 Scheduled)
  - Today's Bookings volume (e.g., 1,842 Tickets)
  - Today's Revenue (e.g., ₹4,85,250)
  - Active Movies screening (e.g., 12 Titles)
  - Upcoming Movies queue (e.g., 3 Titles)
  - Total Halls fleet count (e.g., 5 Screens)
  - Seat Occupancy percentage (e.g., 92.4% Average)
- **#1 Popular Movie Highlight**: Dynamic highlight displaying top-grossing weekend blockbuster (e.g., *Pushpa 2: The Rule* grossing ₹2.84 L across Hall 1 & 2).
- **Recent Bookings Admissions Stream**: Read-only stream displaying incoming customer purchases with ticket reference, customer details, allocated seats, amount, and receipt inspector.
- **Tenant Isolation Simulator**: Quick toggle allowing immediate testing of isolated tenant datasets between Pune (`th-pun-001`) and Mumbai (`th-mum-001`).

#### 2. Theatre Profile Management (`/theatre/profile`)
- **Editable Facility Parameters**:
  - Operating Cinema Name, Slug, Code, and Marketing Tagline.
  - Physical Address, City, State, PIN Code, and Country.
  - Manager Desk Email and 24/7 Guest Care Phone.
  - Complex Operating Schedule (Box office opening time and late show cut-off).
  - High-accuracy GPS Pin (Latitude & Longitude) for customer distance calculations.
  - Master Luxury Amenities (selectable pills synchronized with the platform amenities catalog).

#### 3. Media & Creative Asset Vault (`/theatre/media`)
- **Categorized Digital Vault**:
  - Logo variants, Billboard Banners, Auditorium Hall photography, Foyer/Lobby panoramas, Promotional banners, and Trailer videos.
  - Reusable upload modal capturing title, category, dimensions, and asset URL.
  - Instant client-side deletion with reactive store updates.
  - Storage allocation telemetry (e.g., 16.4 MB / 500 MB utilized).

#### 4. UPI & Independent Payment Rails (`/theatre/upi`)
- **Dedicated Payment Configuration**:
  - Registered Business Entity Name.
  - Customer-Facing Merchant Display Name.
  - Direct UPI VPA with strict regex validation (`^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$`).
  - Auto-generated NPCI standard QR intent code (`upi://pay?pa=...&pn=...&cu=INR`).
  - Nodal settlement bank account details (Bank name, masked account number, IFSC code, settlement period).
  - Status cards for auxiliary card/netbanking rails (Razorpay, PhonePe, Paytm, Stripe).

#### 5. Hall Fleet Management Entry (`/theatre/halls`)
- **Auditorium Directory**: Lists all halls with screen type (IMAX Laser, Dolby Cinema, 4DX, Prime Club), seat capacity, projector model, audio specifications, and occupancy fill rate.
- **Roadmap Boundary**: Explicit navigation pill to the **CAD Hall Designer** with architectural note: *"Dynamic 2D/3D matrix customization launches in Phase 2 Part 5."*

#### 6. Movie Exhibition Catalog (`/theatre/movies`)
- **DCP Ingestion Studio**:
  - Tabbed filters: `All Movies`, `Now Showing`, `Upcoming`, `Archived`.
  - Add Movie Modal: Title, Director, Languages (Hindi, English, etc.), Projection Formats (2D, 3D, IMAX, 4DX, Dolby Atmos), Poster URI, and Trailer URL.
  - 1-Click Archive action to retire prints from active run.
  - Zero booking logic; strictly focused on film licensing and catalog management.

#### 7. Showtime Dispatch & Scheduling (`/theatre/shows`)
- **Decoupled Programming Studio**:
  - Programs feature film timetables into specific auditoriums.
  - Defines show date, start/end times, audio language, format, and **Base Starting Price** (e.g., ₹250 or ₹380).
  - Status management: `Upcoming`, `Running`, `Housefull`, `Completed`, `Cancelled`.
  - Cancel showtime action with recorded tenant audit logs.

#### 8. Patron Bookings Ledger (`/theatre/bookings`)
- **Admissions Stream**:
  - Displays customer bookings with Booking ID, Customer name, email, phone, movie title, auditorium, showtime, allocated seats, amount, and payment status.
  - Search by reference code or customer name.
  - Filter by status (`Confirmed`, `Checked-in`, `Cancelled`).
  - Ticket reservation modal with full seat breakdown and remitted amount.
  - **Zero Manual Creation**: Adheres strictly to the architectural rule that Theatre Admins monitor rather than create bookings.

#### 9. Audit & Operational Reports (`/theatre/reports`)
- **Pre-Computed Reporting Suites**:
  1. Daily Box Office Revenue & Settlement Ledger
  2. Auditorium Occupancy & Seat Utilization
  3. Movie Performance & Format Yield Split
  4. Hall Engineering & Projection Telemetry
  5. Popular Showtimes & Peak Hour Analysis
  6. GST Entertainment Tax Monthly Return (18% output liability)
- **Multi-Format Generators**: Simulated downloads with toast notifications for **PDF**, **Excel (.xlsx)**, and **CSV**.

#### 10. Field Staff Roster (`/theatre/staff`)
- **Crew Management Desk**:
  - Roster of Hall Managers, Projectionists, Floor Ushers, and Concession Leads.
  - Add Crew Member modal capturing employee code, designation, assigned hall, and shift.
  - 1-Click duty status toggle (`On Duty` ↔ `Off Duty` ↔ `On Leave`).

#### 11. Operational Settings Studio (`/theatre/settings`)
- **Configurable Venue Policies**:
  - Daily complex opening and closing hours.
  - Intermission window (default: 15 minutes) and cleaning turnaround buffer (default: 20 minutes).
  - Turnstile QR gate late-entry grace period (default: 20 minutes).
  - Ticket cancellation cut-off window (default: 2 hours prior to showtime).

---

## 4. Multi-Tenant State Store (`store/theatre-store.ts`)

The Theatre Admin console uses a centralized, reactive, and persistent Zustand store (`useTheatreStore`):

```typescript
// store/theatre-store.ts excerpt
export interface TheatreState {
  activeTheatreId: string;
  profile: TheatreProfileState;
  paymentConfig: PaymentRailConfig;
  halls: ManagedHall[];
  movies: ManagedMovie[];
  shows: ManagedShow[];
  bookings: MonitoredBooking[];
  staff: ManagedStaff[];
  media: ManagedMediaAsset[];
  notifications: TheatreNotification[];
  auditLogs: TheatreAuditLog[];

  // Tenant Isolation Actions
  switchTenant: (theatreId: string) => void;

  // Profile Management
  updateProfile: (updates: Partial<TheatreProfileState>) => void;

  // Payment & UPI Configuration
  updatePaymentConfig: (updates: Partial<PaymentRailConfig>) => void;

  // Movie CRUD (Catalog entry point)
  addMovie: (movie: Omit<ManagedMovie, "id">) => void;
  updateMovie: (id: string, updates: Partial<ManagedMovie>) => void;
  archiveMovie: (id: string) => void;

  // Show Programming
  addShow: (show: Omit<ManagedShow, "id" | "seatsBooked">) => void;
  updateShow: (id: string, updates: Partial<ManagedShow>) => void;
  cancelShow: (id: string) => void;

  // Staff Management
  addStaff: (staffMember: Omit<ManagedStaff, "id">) => void;
  toggleStaffStatus: (id: string) => void;
  updateStaffRole: (id: string, role: ManagedStaff["role"]) => void;

  // Media Library
  uploadMedia: (asset: Omit<ManagedMediaAsset, "id" | "uploadedAt">) => void;
  deleteMedia: (id: string) => void;

  // Operational Notifications & Audit
  markNotificationRead: (id: string) => void;
  logTenantAudit: (action: string, module: string, details: string) => void;
}
```

### Persistence & Tenant Switching
- Utilizes `persist` from `zustand/middleware` targeting `cinesphere-theatre-storage`.
- Provides `switchTenant(theatreId)` enabling instantaneous verification of tenant isolation between *CineSphere Grand Cinemas, Pune* (`th-pun-001`) and *CineSphere Royale Palladium, Mumbai* (`th-mum-001`).

---

## 5. Security & Tenant Isolation Enforcement

1. **Role Guard Verification**: Enforced in `auth/guards/route-guards.ts`:
   ```typescript
   if (pathname.startsWith("/theatre")) {
     return isRoleAtLeast(userRole, "THEATRE_ADMIN");
   }
   ```
2. **Tenant Scoping Guard**: Evaluated in `auth/guards/tenant-guard.ts` via `validateTenantAccess(user, targetTheatreId)`. Non-Super-Admin roles attempting cross-tenant access are blocked.
3. **Session Header Injection**: Next.js middleware automatically extracts the authenticated tenant ID from the JWT session and injects `x-tenant-id` downstream into all API routes and server actions. Client-supplied IDs are never trusted.
4. **Tenant Audit Trail**: Administrative actions (profile updates, show scheduling, UPI reconfiguration) log immutable records with timestamp, actor email, and affected module.

---

## 6. Verification & Quality Assurance

- ✅ **TypeScript Strict Mode**: `pnpm run type-check` (`tsc --noEmit`) passes with **0 errors**.
- ✅ **ESLint Verification**: `pnpm run lint` passes with **0 errors**.
- ✅ **Production Next.js Build**: All **106 routes** compile and prerender cleanly.
- ✅ **Clean Scope Boundary**: Zero Hall Designer CAD code, zero automatic seat generation, zero booking engine mutations, and zero Three.js dependencies in this phase.
