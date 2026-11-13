# 🎬 CineSphere OS

> **The Operating System for Modern Cinemas**  
> *An enterprise-grade, Multi-Tenant SaaS platform engineered for global cinema circuits, multiplex chains, and boutique luxury auditoriums.*

[![Version](https://img.shields.io/badge/Version-0.1.0--Phase%201%20Complete-E50914?style=for-the-badge&logo=film)](https://github.com/dipak-pawar-356/cineSphere_OS)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-v10-F69220?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

---

## 📌 1. Project Overview

**CineSphere OS** is NOT just another consumer movie booking website. It is an enterprise-grade Cinema Management Platform and Operating System engineered to unite the entire cinematic exhibition lifecycle into one synchronized, high-performance ecosystem.

### Enterprise Role Hierarchy
```
                      ┌────────────────────────────────┐
                      │          Super Admin           │
                      │  (Platform Owner & Governance) │
                      └───────────────┬────────────────┘
                                      │
                      ┌───────────────▼────────────────┐
                      │         Theatre Admin          │
                      │ (Multiplex General Operations) │
                      └───────────────┬────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            │                                                   │
┌───────────▼───────────┐                           ┌───────────▼───────────┐
│     Hall Manager      │                           │      Floor Staff      │
│ (Screen Ops & Audio)  │                           │  (Concessions & Gate) │
└───────────┬───────────┘                           └───────────┬───────────┘
            │                                                   │
            └─────────────────────────┬─────────────────────────┘
                                      │
                      ┌───────────────▼────────────────┐
                      │            Customer            │
                      │  (Guest Discovery & Ticketing) │
                      └────────────────────────────────┘
```

1. **Super Admin:** Platform owner overseeing multi-tenant cinema circuits, distributor KDM licenses, edge health, and macro financial reconciliations.
2. **Theatre Admin:** Multiplex General Manager managing daily operations, 8+ screens, schedule programming, dynamic seat pricing, local promotions, and F&B concessions.
3. **Hall Manager:** Technical lead overseeing projection lamp hours, Barco/Dolby acoustic calibration, and seating layout turnaround.
4. **Floor & Concession Staff:** Frontline team managing turnstile QR validations, VIP lounge butler orders, and box office ticket counter sales.
5. **Customer / Guest:** Cinephile discovering showtimes, booking premium seats across luxury tiers, and accessing mobile m-tickets.

---

## ⚡ 2. Phase 1 Accomplishments (Current Release: v0.1.0)

Phase 1 establishes the complete frontend architecture, design system, layout hierarchy, dashboard UIs, responsive motion, and centralized mock data engine:

- ✅ **Part 1: Foundation & Tooling:** Next.js 15 App Router, React 19, TypeScript 5.9, strict path aliases, zero-drift `tsconfig.json`.
- ✅ **Part 2: Luxury Cinema Design System:** True OLED Void (`#050507`), Cinema Red (`#E50914`), Cinema Gold, glassmorphism, and Geist typography.
- ✅ **Part 3: Navigation & Layouts:** Route groups `(public)`, `(admin)`, and `(theatre-admin)` with sticky headers, mobile drawers, breadcrumbs, and sidebars.
- ✅ **Part 4: Public Guest Portal:** 10 responsive pages (Billboard, Movies, Movie Details, Theatres, Theatre Details, Events, Offers, About, Contact).
- ✅ **Part 5: Super Admin Control Plane:** Master dashboard, cinema onboarding, distributor catalog, network analytics, and live infrastructure telemetry.
- ✅ **Part 6: Reusable Component Library:** 25+ UI primitives (`Button`, `Badge`, `Card`, `Modal`, `Tabs`, `Table`, `Drawer`) and cinema domain components (`MovieCard`, `TheatreCard`, `ShowtimeChip`, `SeatLegend`, `MetricCard`, `StatusBadge`).
- ✅ **Part 7: Multi-Tenant Theatre Admin Console:** Flagship console for *CineSphere Grand Cinemas* (Phoenix Marketcity, Pune - `th-pun-001`) with 25+ operational routes, mobile-to-ultrawide (320px to 2560px) responsive layout primitives, and Lenis/GSAP motion engine.
- ✅ **Part 8: Centralized Mock Data & Documentation:** Fully typed TypeScript domain models (`types/`), comprehensive Indian cinema mock data layer (`data/`), placeholder asset tree (`public/placeholders/`), and 8 detailed architecture guides (`docs/`).

---

## 🏛️ 2.1 Multi-Tenant Domain Hierarchy: Why the Show is the Central Entity

```
Platform (Super Admin)
   ↓
Multiple Independent Theatres (Tenants)
   ↓
Each Theatre has multiple Halls
   ↓
Each Hall has one reusable Hall Layout (Designed Once, Reused by Future Shows)
   ↓
Each Show belongs to one Movie + one Hall + Date & Time
   ↓
Each Show generates its own Seat Inventory & Section-Based Pricing
   ↓
Bookings belong to Shows
   ↓
Payments belong to the Theatre hosting the Show (Tenant Isolated UPI / Gateway)
   ↓
Tickets belong to Bookings
```

> **Architectural Law:** In CineSphere OS, **Movies never own seat pricing, and Hall Layouts never permanently store seat prices**. Instead, **The Show is the central connector** of the entire platform. Pricing belongs to the Show (e.g. Morning Show Section A = ₹200 vs. Night Show Section A = ₹250). Seat availability belongs to the Show. This allows unlimited theatres, unlimited halls, and reusable layouts without code changes.

### Dynamic Hall Design & Automatic Seat Generation Engine
- **No Manual Seat Placement:** Theatre Admin defines sections (e.g., Section A: 20 seats, Section B: 30 seats, Section C: 50 seats).
- **Automatic Matrix Calculation:** The engine in `lib/engine/seat-generator.ts` automatically generates `A1..A20`, `B1..B30`, `C1..C50` with coordinates, rows, walkways, and exit markers.
- **Dynamic Seating Visualization:** [`components/cinema-engine/`](./components/cinema-engine) dynamically renders any hall capacity (50, 100, 240, 400+ seats) with live seat selection, tooltips, price calculations, and tenant-isolated UPI details.

> [!NOTE]
> **Strict Phase 1 Scope Boundary**: Phase 1 contains **zero backend, zero database, zero external APIs, zero authentication logic, zero CRUD mutations, zero booking state logic, and zero Three.js code**. Everything is static, local, deterministic, and type-safe.

---

## 🛠️ 3. Technology Stack

### Frontend Architecture
- **Framework:** [Next.js 15.5](https://nextjs.org/) (App Router, Server Components & Client Boundaries)
- **Library:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/) (Strict mode, zero implicit `any`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with CSS Custom Property Design Tokens
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Motion & Interactions:** [GSAP 3](https://gsap.com/) & [@studio-freight/lenis](https://github.com/darkroomengineering/lenis) Smooth Scroll
- **Package Manager:** [pnpm v10+](https://pnpm.io/)

### Code Standards & Conventions
- **Currency:** Indian Rupee (INR `₹`) with `en-IN` numbering (`formatCurrency(86450200)` -> `"₹8.64 Cr"`).
- **Timezone:** `Asia/Kolkata` (IST - UTC+05:30).
- **Locale:** `en-IN`.

---

## 🗺️ 4. Comprehensive Route Map

### 🌐 Public Guest Portal (`app/(public)`)
- `/` — Cinema Landing Billboard & Quick Discovery
- `/movies` — Filterable Movie Directory (IMAX, Dolby Cinema, 4DX, ScreenX)
- `/movies/[id]` — Movie Overview, Cast & Crew, Trailer Previews, Showtimes
- `/theatres` — Cinema Locator with City Filter & Distance Indicators
- `/theatres/[id]` — Multiplex Profile, Hall Specifications & Amenities
- `/events` — Live Concerts, Stand-Up Comedy & Motorsports (F1)
- `/offers` — Festive Deals, Student Passes, Bank BOGO Discounts
- `/about` — Platform Architectural Vision & Tech Stack
- `/contact` — 24/7 Guest Care Helpline, Office Map & FAQs

### 🛡️ Super Admin Control Plane (`app/(admin)`)
- `/admin` — Network Overview, Gross Box Office (₹8.64 Cr), Admissions
- `/admin/theatres` — Multiplex Onboarding, KYC & Exhibition Licenses
- `/admin/movies` — Global Movie Distribution & CBFC Ingestion
- `/admin/analytics` — Macro Box Office Splits & City Revenue Share
- `/admin/system` — Edge Telemetry (Envoy, Postgres, Redis, Cloudflare, Razorpay)
- `/admin/settings` — Platform Multi-Tenancy Governance, GST Rates & Audit Logs

### 🏢 Multi-Tenant Theatre Admin Console (`app/(theatre-admin)`)
*Flagship Circuit: CineSphere Grand Cinemas (`th-pun-001`, Phoenix Marketcity, Pune)*
- `/theatre` — Operational Overview & Today's Box Office (₹4.82 L)
- `/theatre/profile` — Multiplex Profile, Contact & Operating Hours
- `/theatre/compliance` — Fire NOC, Health Permits & DCI Certificates
- `/theatre/gallery` — High-Resolution Foyer & Hall Photography
- `/theatre/amenities` — Barco 4K Laser, Dolby Atmos 64-Channel Specs
- `/theatre/halls` — 8 Auditoriums Overview & Live Occupancy
- `/theatre/halls/[id]` — Individual Hall Seating Layout & Hardware Specs
- `/theatre/movies` — Active Exhibition Licenses & Ingested DCP Prints
- `/theatre/shows` — Daily Schedule Grid & Showtime Allocations
- `/theatre/shows/create` — Program New Showtime with Screen Assignment
- `/theatre/bookings` — Live Ticket Bookings Stream & Turnstile Status
- `/theatre/customers` — Guest Relations CRM, Loyalty Tiers & Spend
- `/theatre/staff` — Roster, Shift Allocations & Employee Badges
- `/theatre/revenue` — Financial Dashboard & F&B Concession SPH
- `/theatre/payments` — Razorpay / Pine Labs Settlement Reconciliations
- `/theatre/transactions` — Real-Time Payment Log with Gateway References
- `/theatre/offers` — Local Venue Promotions & Food Combos
- `/theatre/events` — Live Concert & Comedy Venue Bookings
- `/theatre/analytics` — Peak Hours, Occupancy Heatmap & ATP Tracking
- `/theatre/reports` — Box Office Reconciliation, Occupancy & GST Exports
- `/theatre/notifications` — Real-time Equipment & Housefull Alerts
- `/theatre/support` — Guest Helpdesk & Lost-and-Found Records
- `/theatre/settings` — Operational Parameters & Turnstile QR Gate Rules

---

## 🎨 5. Design System & Tokens

### True OLED Void Palette
```css
--background: #050507;        /* Deepest OLED black */
--surface-1:  #0A0B10;        /* Base container surface */
--surface-2:  #12131A;        /* Elevated card surface */
--surface-3:  #1A1B24;        /* Hover and input field surface */
--border:     #262730;        /* Subtle divider border */
--primary:    #E50914;        /* Cinema Red accent */
--gold:       #F59E0B;        /* VIP Recliner & Loyalty Gold */
--success:    #10B981;        /* Operational & Confirmed */
--warning:    #F59E0B;        /* Maintenance & Filling Fast */
--danger:     #EF4444;        /* Housefull & Cancelled */
```

### Seating Tiers & Visual Identifiers
- **Silver Tier:** Standard viewing angle (`text-zinc-400`, `border-zinc-700`)
- **Gold Tier:** Center acoustic sweet spot (`text-amber-400`, `border-amber-500/50`)
- **Platinum Tier:** Premium motorized ergonomic rockers (`text-sky-400`, `border-sky-500/50`)
- **VIP Recliner:** Motorized zero-gravity recliner (`text-purple-400`, `border-purple-500/50`)
- **Royal Suite Lounger:** Private viewing cubicle with butler dining (`text-yellow-300`, `border-yellow-400`)

---

## 💾 6. Centralized Mock Data Engine (`data/`)

All mock data is deterministic, strongly typed, and centralized:

```typescript
import { 
  MOCK_MOVIES, 
  MOCK_THEATRES, 
  THEATRE_HALLS, 
  THEATRE_SHOWS, 
  THEATRE_BOOKINGS,
  SUPER_ADMIN_DASHBOARD,
  formatCurrency 
} from "@/data";
```

- **Movies (`data/public/movies.ts`):** 15 complete blockbusters with cast, crew, synopsis, certifications, and trailers.
- **Theatres (`data/public/theatres.ts`):** 10 flagship cinemas across Mumbai, Delhi, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh.
- **Assigned Venue (`th-pun-001`):** *CineSphere Grand Cinemas* (Phoenix Marketcity, Pune) acts as the cross-referenced anchor for all theatre datasets.
- **Formatting Utilities (`data/utils/mock-formatters.ts`):** `formatCurrency(val)` (INR with Lakhs/Crores), `formatNumber(val)`, `formatPercent(val)`.

---

## 📱 7. Responsive System & Motion

### Breakpoint Matrix
- **`xs`:** 320px — Compact smartphones
- **`sm`:** 640px — Large smartphones
- **`md`:** 768px — Tablets
- **`lg`:** 1024px — Small laptops
- **`xl`:** 1280px — Standard desktops
- **`2xl`:** 1536px — High-res monitors
- **`3xl`:** 1920px — Full HD displays
- **`ultrawide`:** 2560px — Cinema & multi-window ultrawide displays

### Motion Engine
- **Lenis Smooth Scroll:** Native-feeling inertia scrolling, disabled automatically when users enable `prefers-reduced-motion`.
- **GSAP Easing Tokens:** Hardware-accelerated easing curves configured for luxury feel (`transitions.ts`).
- **Future Hooks:** Pre-architected hooks for future 3D modules (`use3DHeroMotion`, `use3DTheatreMotion`, `useSeatSelectionMotion`, `useHallDesignerMotion`).

---

## 🚀 8. Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- pnpm v10+ (recommended) or npm v9+

### Installation
```bash
# Clone the repository
git clone https://github.com/dipak-pawar-356/cineSphere_OS.git
cd cineSphere_OS

# Install dependencies using pnpm
pnpm install
```

### Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience CineSphere OS.

### Quality Assurance & Type-Checking
```bash
# Run strict TypeScript compiler verification
pnpm run type-check

# Run Next.js ESLint verification
pnpm run lint

# Build for production
pnpm run build
```

---

## 🔐 2.2 Phase 2 - Part 1: Authentication, Clerk Integration & Multi-Tenant Authorization

Phase 2 - Part 1 establishes the production-grade authentication and authorization foundation for CineSphere OS:

- 🛡️ **Clerk Authentication Architecture:** Ready for Clerk (`@clerk/nextjs`) with resilient wrapper providers, environment variable validation, and seamless mock fallbacks.
- 👥 **5-Tier Role Hierarchy:** `SUPER_ADMIN` (100) > `THEATRE_ADMIN` (80) > `HALL_MANAGER` (60) > `STAFF` (40) > `CUSTOMER` (10).
- 🏢 **Multi-Tenant Isolation:** Architectural verification `User -> Role -> Theatre -> Permission`. Theatre Admins are strictly scoped to their assigned `theatreId` (`th-pun-001`, `th-mum-001`).
- 🚦 **Centralized Next.js Middleware (`middleware.ts`):** Evaluates every incoming request, validates route constraints, injects `x-tenant-id` and `x-user-role` headers, and redirects unauthenticated or forbidden access attempts.
- ⚡ **Instant Role Simulator:** Built-in 1-click test switcher on `/login` to test all 5 roles and cross-tenant boundaries without external email verification.
- 🎨 **Enterprise Auth Pages:** Fully responsive, accessible Sign In, Sign Up, Forgot Password, Reset Password, Verify Email, Verify Phone, 401 Unauthorized, 403 Forbidden, and Session Expired views.
- 📚 **Comprehensive Auth Architecture Guide:** Detailed specification available in [`docs/AUTH_AND_AUTHORIZATION.md`](./docs/AUTH_AND_AUTHORIZATION.md).

---

## 🏛️ 2.3 Phase 2 - Part 2: Database Architecture & Multi-Tenant Data Model

Phase 2 - Part 2 establishes the production-ready PostgreSQL database architecture and normalized multi-tenant data model using Drizzle ORM and Neon Serverless:

- 🗄️ **38 Tables & 26 Enums:** Normalized 3NF entity schema across Geographic, Identity, Multi-Tenant Theatres, Payments, CAD Halls, Movie Catalog, Show Scheduling, Dynamic Inventory, Bookings, Tickets, and System Marts.
- 🔒 **Zero Cross-Tenant Leakage:** The Theatre is the atomic operational tenant. All physical auditoriums, shows, pricing, seat inventory, payment configurations, and bookings are strictly scoped by `theatreId`.
- 🎟️ **Show-Centric Decoupling:** Movies never connect directly to seats or pricing. Hall layouts are designed once and reused. Pricing and real-time seat availability belong exclusively to the **Show**.
- 💳 **Independent Merchant Rails:** Payment configuration belongs strictly to the Theatre (`upiId`, merchant names, Razorpay/PhonePe/Paytm/Stripe credentials), never platform-wide.
- 🚀 **Serverless Neon PostgreSQL:** Drizzle ORM HTTP driver integration with connection pooling, strict type inference (`InferSelectModel`, `InferInsertModel`), and composite performance indexes.
- 🛠️ **Drizzle Kit CLI Tooling:** Fully integrated migration engine (`pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:studio`).
- 📚 **Exhaustive Database Architecture Guide:** Complete ER diagrams, table schemas, indexes, and constraints documented in [`docs/DATABASE_ARCHITECTURE.md`](./docs/DATABASE_ARCHITECTURE.md).

---

## 🛡️ 2.4 Phase 2 - Part 3: Super Admin Platform Management

Phase 2 - Part 3 delivers the comprehensive, enterprise-grade Super Admin Platform Control Plane under `/dashboard/...`:

- 🎛️ **16 Enterprise Platform Views:** Executive KPI Command Center (`/dashboard`), Edge Telemetry Studio (`/dashboard/platform`), Theatre Approval Workflow Studio (`/dashboard/theatres`), Deep-Dive Multi-Tab Cinema Inspector (`/dashboard/theatres/[id]`), SaaS Subscription Management (`/dashboard/subscriptions`), Cross-Tenant Payments Ledger (`/dashboard/payments`), Global Bookings (`/dashboard/bookings`), Unified User & Role Directory (`/dashboard/users`), Cross-Platform Reporting Studio (`/dashboard/reports`), System Settings (`/dashboard/settings`), Geographic Hubs (`/dashboard/cities`), Luxury Amenities Catalog (`/dashboard/amenities`), System Announcements (`/dashboard/announcements`), Enterprise Support (`/dashboard/support`), Tamper-Evident Audit Logs (`/dashboard/audit`), and Digital Media Vault (`/dashboard/media`).
- 🔄 **Theatre Lifecycle State Machine:** Strict multi-tenant verification pipeline (`Pending Approval` → `Active` or `Rejected` with logged justification; `Active` ↔ `Suspended` ↔ `Maintenance`).
- 💼 **4-Tier Commercial SaaS Plans:** Free (₹0/mo, 1 screen, 4% cut), Starter (₹4,999/mo, 3 screens, 2.5% cut), Professional (₹14,999/mo, 8 screens, 1.5% cut), Enterprise (₹39,999/mo, unlimited screens, 0.8% cut).
- 💾 **Centralized Platform State (`usePlatformStore`):** Persistent Zustand store managing all administrative actions, cinema approvals, settings changes, and immutable security audit logs with instant reactivity and local storage sync.
- 🔒 **Zero Cross-Role Leakage:** Strict route guards in `auth/guards/route-guards.ts` and Next.js middleware restricting all `/dashboard` paths exclusively to `SUPER_ADMIN` (level 100).
- 📚 **Exhaustive Platform Documentation:** Comprehensive architecture, state machine diagrams, and route guides in [`docs/SUPER_ADMIN_PLATFORM.md`](./docs/SUPER_ADMIN_PLATFORM.md).

---

## 🏢 2.5 Phase 2 - Part 4: Theatre Admin Onboarding & Management

Phase 2 - Part 4 establishes the production-ready Theatre Admin Management Module under `/theatre/...`:

- 🔒 **Absolute Multi-Tenant Isolation:** Each Theatre Admin securely manages ONLY their assigned cinema complex. Zero cross-tenant data leakage between cinema operators (e.g. Pune `th-pun-001` vs Mumbai `th-mum-001`).
- 🎟️ **Customer-Driven Admissions Law:** Theatre Admins do **not** manually create bookings. All bookings originate exclusively from customer checkouts. The Admin's role is to monitor reservations, QR turnstile scans, seat fill rates, and settlements.
- 💳 **Independent UPI & Payment Rails (`/theatre/upi`):** Every cinema operates an independent merchant account with validated UPI VPA (`name@bank`), auto-generated NPCI standard QR code, nodal bank settlement details, and auxiliary card gateways (Razorpay, PhonePe, Paytm, Stripe).
- 🖼️ **Media & Creative Asset Vault (`/theatre/media`):** Upload, organize, and delete logos, billboard banners, auditorium photography, lobby shots, and promotional videos with storage usage meters.
- 📍 **Theatre Profile & GPS Pin (`/theatre/profile`):** Interactive editing of complex operating hours, manager desk email, customer care hotline, master luxury amenities, and GPS coordinates.
- 🎞️ **Movie Catalog & Showtime Dispatch (`/theatre/movies` & `/theatre/shows`):** Feature film licensing, DCP ingestion status, and timetable programming linking Movie, Hall, Date/Time, and Base Starting Price.
- 👥 **Crew Staff Roster (`/theatre/staff`):** Onboard Hall Managers, Projectionists, and Floor Ushers with duty status toggles (`On Duty` ↔ `Off Duty` ↔ `On Leave`).
- 📊 **Audit-Grade Reports (`/theatre/reports`):** Daily Box Office Collections, Occupancy telemetry, Movie format yields, and GST returns with working **PDF**, **Excel**, and **CSV** export simulations.
- 💾 **Tenant Persistent Store (`useTheatreStore`):** Persistent Zustand store managing all tenant-scoped operations, real-time metrics, and immutable audit trails.
- 📚 **Comprehensive Onboarding Documentation:** Full architecture and developer specification in [`docs/THEATRE_ADMIN_ONBOARDING.md`](./docs/THEATRE_ADMIN_ONBOARDING.md).

---

## 🏛️ 2.6 Phase 2 - Part 5: Hall Management & Dynamic Hall Configuration

Phase 2 - Part 5 implements the complete **Hall Management & Dynamic Hall Configuration Module** under `/theatre/halls/...`:

- 📐 **Dynamic Section Architecture:** Theatre Admins configure high-level seating tiers (`Silver`, `Gold`, `Platinum`, `VIP`, `Recliner`, `Wheelchair`, `Royal Suite`) rather than manually constructing thousands of individual seats.
- 🎨 **Centralized Seating Design System:** Section colors and glowing styling are **never** stored as static business strings. Instead, colors, badges, and tints are derived dynamically from the design system ([`lib/constants/seating-design-system.ts`](./lib/constants/seating-design-system.ts)), guaranteeing uniform appearance across 2D schematics and tickets.
- ⚖️ **Strict Capacity Balance Validation:** Mathematically enforces $\text{Hall Capacity} \equiv \sum \text{Section Seats}$. If there is any under-allocation or overage, the live capacity barometer shows visual alerts and prevents saving until balanced.
- 🗺️ **Live 2D Floor Plan Schematic Preview (`HallPreview2D`):** Real-time architectural visualization displaying a curved screen aperture, audio channel outputs (Left, Center, Right), proportional section tier blocks, audience center aisles, and emergency exits.
- 🎥 **Future 3D Frustum Readiness:** Prepared for Phase 6 Three.js and React Three Fiber visualizers by embedding camera presets ($60^\circ$ FOV, $1.2\,\text{m}$ spectator eye level, screen curvature) without requiring database or schema changes.
- 📋 **Enterprise Fleet Management & Views:** Supports Grid Cards and Enterprise Table views with text search, capacity filters, screen type filters, operating status toggles, hall duplication (`-COPY`), and soft archiving.
- 🔒 **Absolute Multi-Tenant Isolation:** Server actions and state mutations guarantee that every Theatre Admin can only create, edit, duplicate, or delete auditoriums belonging to their own cinema complex.
- 📚 **Hall Management Architecture Guide:** Detailed technical documentation in [`docs/HALL_MANAGEMENT_ARCHITECTURE.md`](./docs/HALL_MANAGEMENT_ARCHITECTURE.md).

---

## 🪑 2.7 Phase 2 - Part 6: Automatic Seat Generation Engine

Phase 2 - Part 6 implements the core **Automatic Seat Generation Engine** for CineSphere OS:

- 🧮 **Deterministic Generation Algorithm:** Identical hall and section configurations generate mathematically identical seat layouts, spatial metrics, and immutable identifiers without database flakiness.
- 🆔 **Immutable UUIDs Decoupled from Display Labels:** Every seat receives an immutable internal UUID (`id`) generated via 64-bit seed hashing, completely separated from mutable human-readable display labels (`seatLabel`: `A1..A20`, `B1..B30`, `C1..C50`). Renaming sections or renumbering seats never breaks historical booking records or foreign key relationships.
- 🏷️ **Zero Embedded Pricing Law:** Seat templates store physical layout geometry, categories, and 3D camera vectors. Ticket prices are **never** stored in the seat template. Show Pricing is combined with templates dynamically via `generateShowInventoryFromTemplate` to create show inventories.
- 📐 **Spatial 3D & Camera Anchors:** Calculates physical metric coordinates ($x, y, z$), tier elevation rises ($0.35\,\text{m}$ to $0.45\,\text{m}$), and viewer camera eye-level anchors ($1.2\,\text{m}$ eye elevation looking at $[0, 2.5, 0]$ with $60^\circ$ FOV) calibrated for future Phase 6 3D auditorium preview.
- ⚖️ **Capacity Conservation Invariant:** Strictly validates $\text{Hall Capacity} \equiv \sum \text{Section Seats} \equiv |\text{Generated Seats}|$ before committing or returning templates.
- 🖥️ **Interactive Seat Preview Grid (`SeatPreviewGrid`):** Features an architectural curved screen header, category-themed tier containers, live seat search by label (e.g. `B14`), section and type filters, and an interactive **Seat Inspector Card** revealing UUIDs, 3D coordinates, and flags.
- 🔄 **CAD Designer & Hall Fleet Integration:** Fully integrated with the Hall Detail View (`/theatre/halls/[id]`), Dynamic Hall Designer (`/theatre/halls/designer`), and multi-tenant Zustand store (`useTheatreStore`).
- 📚 **Automatic Seat Generation Engine Guide:** Detailed technical documentation in [`docs/AUTOMATIC_SEAT_GENERATION_ENGINE.md`](./docs/AUTOMATIC_SEAT_GENERATION_ENGINE.md).

---

## 🎬 2.8 Phase 2 - Part 7: Movie Management System

Phase 2 - Part 7 implements the **Movie Management System** for CineSphere OS, strictly enforcing the platform-level master entity pattern:

- 🌐 **Platform-Level Master Entity Pattern:** A Movie is a platform-wide master film (title, canonical synopsis, media vault, trailer links, runtime, certificate, cast & crew roster). Movies are **never** owned by individual theatres, completely eliminating data duplication when the same film is screened across hundreds of cinema complexes.
- 🔗 **Decoupled Show Connector Invariant:** $\text{Movie} \rightarrow \text{Multiple Shows} \rightarrow \text{Different Theatres} \rightarrow \text{Different Halls} \rightarrow \text{Different Prices}$. Movies **never** permanently embed ticket prices, physical seat templates, or booking records.
- 🎛️ **Two-Layer Movie Architecture:**
  1. **Global Master Movie Library (`/dashboard/movies`):** Super Admin control plane for canonical movie ingestion, multi-tab modal (`MasterMovieFormModal`), media asset vault, video trailer embeds (YouTube/Vimeo), and cast/crew directories.
  2. **Theatre Exhibition Catalog (`/theatre/movies`):** Theatre Admin exhibition roster managing licensed screening titles without metadata duplication, DCI/SMPTE **KDM decryption key status tracking** (`Valid`, `Pending`, `Expired`), and 1-click global catalog discovery (`TheatreMovieCatalogBrowserModal`).
- ⚡ **Server Actions & Security Auditing:** Typed server actions (`createMovieAction`, `updateMovieAction`, `archiveMovieAction`, `restoreMovieAction`, `deleteMovieAction`, `duplicateMovieAction`, `linkMovieToTheatreAction`) with tamper-evident audit logging.
- 🎨 **Cinematic UI & Inspector Views:** Dedicated movie inspection routes (`/dashboard/movies/[id]`), interactive hero backdrops, format badges, and live search/filtering.
- 📚 **Movie Management System Architecture Guide:** Detailed technical documentation in [`docs/MOVIE_MANAGEMENT_SYSTEM.md`](./docs/MOVIE_MANAGEMENT_SYSTEM.md).

---

## 🎟️ 2.9 Phase 2 - Part 8: Show Management & Scheduling System

Phase 2 - Part 8 implements the comprehensive **Show Management & Scheduling System** for CineSphere OS, establishing the Show as the central business entity:

- 🎟️ **Central Business Entity Law:** A Show is **NOT** simply `Movie + Hall + Date + Time`. It represents a complete screening event: $\text{Movie} + \text{Theatre} + \text{Hall} + \text{Date} + \text{Start Time} + \text{End Time} + \text{Language} + \text{Format} + \text{Pricing Profile} + \text{Seat Inventory} + \text{Booking Status} + \text{Sales Status} = \text{Show}$. All bookings, payments, QR tickets, occupancy, and box office yields reference the Show directly.
- 💳 **Reusable Pricing Profiles Subsystem:** Instead of embedding static pricing into Shows or Halls, Shows reference reusable **Pricing Profiles** (`Morning Weekday Economy`, `Weekday Matinee Regular`, `Prime Evening`, `Weekend Blockbuster Prime`, `IMAX Laser Special`). Section prices (`Silver`, `Gold`, `Platinum`, `VIP`, `Recliner`, `Royal Suite`) are derived dynamically per show.
- ⏱️ **Turnaround & Conflict Detection Engine:** Automatically calculates total occupied time ($\text{Runtime} + \text{Intermission} + \text{Cleaning Buffer}$). Prevents auditorium scheduling collisions and enforces turnaround buffers with 1-click earliest safe slot recommendations.
- 🪑 **Dynamic Show Seat Inventory Preparation:** Combines the Hall's immutable Seat Template with the assigned Pricing Profile to synthesize show-specific seat inventories where each seat possesses independent availability (`Available`, `Locked`, `Reserved`, `Booked`, `Blocked`), tier, price, and 3D camera anchor.
- 🎛️ **Dispatch Control Plane & Visual Calendar:**
  - Table View & Grid View with multi-faceted search (Movie, Hall, Show Code, Audio, Format) and filtering.
  - Multi-Screen Showtime Dispatch Matrix (`/theatre/shows/calendar`) with horizontal hall tracks and 7-day switcher.
  - Dedicated Full-Page Dispatch Route (`/theatre/shows/create`) and Telemetry Inspection View (`/theatre/shows/[id]`).
- ⚡ **Server Actions & Security Auditing:** Typed server actions (`createShowAction`, `updateShowAction`, `cancelShowAction`, `archiveShowAction`, `duplicateShowAction`, `validateScheduleAction`) with tamper-evident audit logging.
- 📚 **Show Management & Scheduling Architecture Guide:** Detailed technical documentation in [`docs/SHOW_MANAGEMENT_AND_SCHEDULING.md`](./docs/SHOW_MANAGEMENT_AND_SCHEDULING.md).

### 2.10 Phase 2 - Part 9: Dynamic Pricing Engine (Completed)
- 💰 **The Fundamental Separation Law:**
  - Movies **never** store ticket prices.
  - Halls **never** store ticket prices.
  - Seat layout templates **never** store ticket prices.
  - Pricing belongs strictly to **Auditorium Sections** via reusable **Pricing Profiles** ($\text{Platform} \to \text{Theatre} \to \text{Pricing Profile} \to \text{Section Pricing} \to \text{Show} \to \text{Show Seat Inventory} \to \text{Customer Booking}$).
- 🏷️ **Reusable Pricing Profiles Subsystem:**
  - Pre-seeded with 7 production profiles: *Morning Weekday Economy*, *Weekday Matinee Regular*, *Prime Evening (Mon - Thu)*, *Weekend Morning Family*, *Weekend Blockbuster Prime*, *Holiday & Festival Premium*, and *IMAX Laser Special Experience*.
  - Tier pricing for Silver, Gold, Platinum, VIP, Recliner, Wheelchair, and Royal Suite with full support for adding custom section tiers.
  - Configurable Convenience Fees (₹) and statutory GST (18%) with floor and ceiling price boundaries.
  - Theatre Default Profile designation for zero-touch show scheduling.
- ⚡ **Seat Selection Pricing Pipeline:**
  - Deterministic calculation: $\text{Seat Selection } (A3, C4) \longrightarrow \text{Identify Section} \longrightarrow \text{Lookup Pricing Profile} \longrightarrow \text{Compute Grand Total}$.
  - Computes: $\text{Seat Subtotal} + \text{Convenience Fee Total} + \text{GST Tax} - \text{Discounts} = \text{Grand Total}$.
- 🎮 **Dynamic Seat Pricing Simulator:**
  - Interactive auditorium floor plan with curved screen horizon, row letters ($A \dots H$), and seat buttons.
  - Live profile switcher and dynamic multiplier simulation (1.0x Standard, 0.95x Early Bird, 1.15x High-Demand Surge).
  - Real-time calculation breakdown pane displaying itemized seats, subtotal, convenience fee, GST, and bold emerald grand total.
- 🎛️ **Dedicated Pricing Studio Control Plane (`/theatre/pricing`):**
  - KPI Stat Cards: Total Profiles, Theatre Default, Average Ticket Price (ATP), and Peak Tier Yield.
  - Multi-faceted filter and search toolbar (Day classification, Time slot, Status, Search).
  - Switchable **Grid Cards View** and **Detailed Table View** with 1-click actions: Test in Simulator, Set Default, Duplicate, Edit, and Delete.
  - **Gross Box Office Yield Projection Simulator Widget:** Simulates 100% (Housefull), 75%, and 50% occupancy collections across any auditorium and profile pairing.
- 🛡️ **Validation & Server Actions:**
  - Typed server actions (`createPricingProfileAction`, `updatePricingProfileAction`, `deletePricingProfileAction`, `duplicatePricingProfileAction`, `calculateTicketPricingAction`).
  - Robust validation rules preventing negative rates, rates $> ₹15,000$, deleting the default profile, or deleting profiles attached to active shows.
- 📚 **Dynamic Pricing Engine Architecture Guide:** Detailed technical documentation in [`docs/DYNAMIC_PRICING_ENGINE.md`](./docs/DYNAMIC_PRICING_ENGINE.md).

### 2.11 Phase 2 - Part 10: Customer Discovery & Booking Flow (Completed)
- 🧭 **Multi-Journey Convergence to Central Show ID:**
  - Replaces rigid linear flows (`City → Movie → Theatre → Date → Show → Seats`) with 4 distinct discovery paths that all converge into the central **Show ID**:
    1. **Journey 1 (City-First):** `City → Movie → Theatre → Date/Time → Show ID → Seats`
    2. **Journey 2 (Movie-First):** `Movie → City → Theatre → Date/Time → Show ID → Seats`
    3. **Journey 3 (Theatre-First):** `Theatre → Movie → Showtimes → Show ID → Seats`
    4. **Journey 4 (Show-First / Deep-Link):** `Promotional Link / QR / Push → Show ID → Seats`
- 🎯 **Single Show ID Resolution Law:**
  - Loading `/booking/[showId]` resolves Movie, Theatre, Hall, Reusable Layout, Seat Inventory, Dynamic Pricing, Section Legends, and Capacity Metrics in **one unified snapshot** (`getUnifiedCustomerShowDetails`), eliminating multi-hop client roundtrips.
- 🏙️ **City Discovery & Geolocation Subsystem:**
  - Client-side persistent Zustand store (`store/city-store.ts`) managing active city, recent cities, search query, and modal visibility.
  - Global `CitySelectorModal` with search, popular city chips, and auto-detect placeholder accessible from top navigation.
- 🎬 **Multi-Facet Movie Discovery (`/movies` & `/movie/[slug]`):**
  - 5 Discovery Tabs: *Now Showing*, *Coming Soon*, *Trending*, *Recommended*, *Recently Viewed*.
  - Facet filters for Genre, Language, Format, and Certificate with city-level theatre availability.
  - 7-Day Date Tab Selector with showtime pills grouped by Theatre.
- 🏛️ **Multiplex Exhibition Hub (`/theatres` & `/theatre/[slug]`):**
  - City-aware theatre discovery with geo-distance indicators, screen formats, amenities, and starting ticket prices.
  - Theatre detail page with 7-day date switcher, auditorium fleet overview, and movies running at the complex with showtime pills linking to `/booking/[showId]`.
- 🪑 **Interactive 2D Seating Layout (`/booking/[showId]`):**
  - Multi-show switcher pill bar to toggle alternate daily showtimes.
  - Curved screen position bar ("Auditorium Screen — All Eyes This Way"), acoustic sweet spot, and emergency exit markers.
  - Section-colored seat buttons (Silver Blue `#38BDF8`, Gold Yellow `#FBBF24`, Platinum Red `#EF4444`, VIP Purple `#A855F7`, Recliner Green `#10B981`, Royal Suite Rose `#F43F5E`).
  - Interactive selection state with Amber glow and checkmark, booked (sold) state, wheelchair, and recliner badges.
  - Section legend bar displaying prices in ₹, total seats, and remaining seats counter.
  - Real-time Price Summary Sidebar calculating Ticket Subtotal, Convenience Fee (₹35 × seats), GST (18%), and Grand Total in bold Emerald INR.
- 📚 **Customer Discovery Architecture Guide:** Detailed technical documentation in [`docs/CUSTOMER_DISCOVERY_AND_BOOKING_FLOW.md`](./docs/CUSTOMER_DISCOVERY_AND_BOOKING_FLOW.md).

### 2.12 Phase 2 - Part 11: Booking Engine & Seat Reservation Architecture (Completed)
- 🏛️ **3-Tier Inventory & Reservation Layering Model:**
  - Strictly decouples physical infrastructure from customer reservations:
    ```
    Seat Template (Permanent Hall Layout)
                ↓
    Show Seat Inventory (One Isolated Inventory per Show)
                ↓
    Booking Session (Temporary Customer Session with Temporary Seat Locks)
                ↓
    Confirmed Booking (Created strictly AFTER payment confirmation — Phase 2 Part 12)
    ```
- 🆔 **Two Distinct Identifiers:**
  - **Booking Session ID (`sessionCode` / `id`):** Created immediately when entering seat selection. Holds temporary seat locks with a strict countdown timer (10 minutes default).
  - **Booking ID (`bookingId` / `referenceCode`):** Issued strictly **after** payment confirmation in Part 12.
- ⏱️ **Temporary Seat Locks & Countdown Expirations:**
  - Client and server synchronized countdown timer with real-time second-by-second ticks (`store/booking-session-store.ts`).
  - Interactive `<BookingTimerBadge />` with visual pulse warning (< 120s) and 1-click `+5m` lock extension button.
  - Automatic release of locked seats when the timer hits zero with an informative `<BookingSessionExpiredModal />`.
- 🛡️ **Atomic Double-Booking Prevention & Concurrency Protection:**
  - Concurrency collision guard preventing simultaneous locks on the same seat across multiple guest sessions.
  - Collision events rejected server-side with audit logging (`CONFLICT_REJECTED`) and real-time conflict banners.
  - Other users' active locks rendered as distinct disabled locks on the interactive 2D auditorium grid.
- 💰 **Dynamic Price & Fee Breakdown Pipeline:**
  - Itemized calculation: Tickets Subtotal + Convenience Fee (₹35 × seats) + Integrated GST (18%) = Grand Total.
  - Pre-payment snapshot modal (`BookingReviewModal`) detailing film, hall, showtime, locked seats, and payment handoff notice.
- 🏢 **Theatre Admin Live Booking Engine & Concurrency Monitor (`/theatre/bookings`):**
  - Segmented view controller toggling between **Live Booking Sessions & Concurrency Locks** and **Confirmed Admissions & Issued Tickets**.
  - Real-time KPI cards for active sessions, currently locked seats, and collision protection status.
  - Supervisor override action (`Expire Lock`) to manually release locks and return seats to public sale.
  - Tamper-evident reservation engine audit trail (`BookingAuditLog`) logging every session lifecycle event.
- 📚 **Booking Engine Architecture Guide:** Detailed technical documentation in [`docs/BOOKING_ENGINE_AND_RESERVATION_ARCHITECTURE.md`](./docs/BOOKING_ENGINE_AND_RESERVATION_ARCHITECTURE.md).

### 2.13 Phase 2 - Part 12: Theatre Payment Configuration & Architecture (Completed)
- 💳 **Clean Architectural Separation of Configuration from Transactions:**
  - Decouples the physical theatre entity from payment rails and payment transactions:
    ```
    Platform → Theatre → Payment Configuration (1:N) → Payment Provider → Booking → Payment Transaction
    ```
- ⚡ **The Dynamic QR Invariant (Zero Static Image Blobs):**
  - Storing static QR images is replaced with dynamic NPCI UPI Intent URI generation on the fly:
    `upi://pay?pa=${upiId}&pn=${merchantName}&mc=7832&cu=INR&am=${amount}&tr=${ref}&tn=${note}`
  - Renders QR dynamically from metadata (Merchant Name, UPI ID, MCC 7832, Version), guaranteeing zero staleness upon VPA or price changes.
- 🎯 **Multi-Rail & Multi-Provider Orchestration:**
  - Supports 1:N payment configurations per theatre (e.g. Primary Box Office UPI, F&B Concessions Stand UPI, Razorpay Gateway, PhonePe Direct, Stripe International, Cash Counter Drawer).
  - Primary Rail designation with automatic demotion of previous primary configuration.
- 🛡️ **Multi-Tenant Isolation & Role Security:**
  - Theatre Admins manage strictly their own cinema's payment rails; cross-tenant updates/deletions throw strict authorization violations.
  - Customer role automatically sanitizes private credentials, secret keys, and internal settlement bank accounts.
- 📜 **Configuration Versioning & Audit Ledger:**
  - Automated version increments (`configVersion: v1 -> v2`) and tamper-evident audit logs (`PaymentAuditLog`) tracking all state transitions.
- 🖥️ **Theatre Admin Payment Hub (`/theatre/upi` & `/theatre/payments`):**
  - Multi-rail configuration manager with live dynamic QR previewer and test amount synthesizer.
  - Direct integration cards for supplementary gateways (Razorpay, PhonePe, Paytm, Stripe, Cash Drawer).
  - Multi-rail daily settlement reconciliation tracking volume, count, and zero-MDR UPI advantages.
- 📚 **Payment Architecture Guide:** Detailed technical documentation in [`docs/THEATRE_PAYMENT_CONFIGURATION_ARCHITECTURE.md`](./docs/THEATRE_PAYMENT_CONFIGURATION_ARCHITECTURE.md).

### 2.14 Phase 2 - Part 13: Ticket Management & Digital Ticket System (Completed)
- 🎟️ **The Digital Ticket Lifecycle Invariant:**
  - A ticket is **never** created upon initial seat clicking or temporary reservation.
  - Strict unidirectional flow:
    ```
    Booking Session → Payment → Payment Verification → Booking Confirmation → Ticket Generation → QR Generation → My Tickets → Future Check-in
    ```
- 🆔 **Four-Tier Distinct Identifiers:**
  - **Internal DB ID (`id`):** UUID primary key for database relational graph.
  - **Booking Reference (`bookingReference`):** Human-readable billing code (e.g. `BK-2027-005001`).
  - **Ticket Number (`ticketNumber`):** Human-readable entry code (e.g. `TK-2027-001001` or `TK-2027-001001-01`).
  - **Public Secure ID (`secureId`):** High-entropy, unguessable 26-character Crockford Base32 cryptographic token for tamper-proof public URLs.
- 🛡️ **Public URL Traversal Protection:**
  - Route `/tickets/[secureId]` strictly resolves unguessable tokens; sequential integer requests (e.g. `/tickets/123`, `/tickets/1`) are rejected server-side to prevent scraping.
- ⚡ **Structured High-Integrity QR Payload:**
  - Encodes `ticketSecureId`, `bookingSecureId`, `ticketNumber`, `theatreId`, `showId`, `seatNumbers`, `issuedAt`, `version: "v1"`, and cryptographic `signaturePlaceholder`.
  - Dynamic QR URI derivation via `api.qrserver.com` at 250×250 resolution.
- 👥 **Multi-Ticket Issuance Strategies:**
  - `PER_BOOKING`: Consolidated admission pass covering all seats in the booking (`seatCount: N`).
  - `PER_SEAT`: Individual admission pass per seat with indexed sub-tickets (`-01`, `-02`), distinct QR codes, and split amounts.
- 📱 **Customer "My Tickets" Portal (`/profile/tickets`):**
  - Real-time customer isolation, search toolbar, tabs (Upcoming, Past, Today, All), dynamic status pills, modal QR previewer, and 1-click navigation to full digital passes.
- 🔍 **Interactive Cryptographic QR Payload Inspector (`<QrPayloadInspector />`):**
  - Live inspection dialog allowing patrons and turnstile managers to decode and verify the raw JSON cryptographic payload directly from the ticket view.
- 📚 **Digital Ticketing Architecture Guide:** Detailed technical documentation in [`docs/TICKET_MANAGEMENT_AND_DIGITAL_TICKETS.md`](./docs/TICKET_MANAGEMENT_AND_DIGITAL_TICKETS.md).

### 2.15 Phase 2 - Part 14: Centralized Notification & Communication System (Completed)
- 🔔 **Event-Driven Decoupled Architecture Law:**
  - Modules (Booking, Payment, Show, Ticket, Admin) **never** send messages directly.
  - Every module publishes domain events (`DomainEvent<T>`) to the Central Notification Engine.
  - Pipeline:
    ```
    Domain Modules → Domain Event Bus → Central Notification Service → Channels (In-App live; Email/SMS/Push placeholders) → Role Inboxes
    ```
- 📝 **Centralized Template Engine (`renderTemplate`):**
  - Reusable templates with dynamic token replacement (`{customerName}`, `{movieTitle}`, `{showTime}`, `{amount}`, `{bookingRef}`, etc.) and fallback values.
- ⚙️ **User Notification Preferences Matrix (`NotificationPreferences`):**
  - Configurable delivery channels (`inApp`, `email`, `sms`, `push`, `whatsapp`).
  - Configurable event categories (`bookingUpdates`, `paymentReceipts`, `ticketPasses`, `showReminders`, `promotionalOffers`, `securityAlerts`).
  - Automatic status propagation: channel opt-out maps to `"OPTED_OUT"`; category opt-out maps to `"SUPPRESSED"`.
- 📡 **Multi-Channel Dispatch Manifest (`channelDispatches`):**
  - Live In-App notifications delivered immediately (`DELIVERED`).
  - External channels maintained as structured architecture placeholders (`QUEUED_PLACEHOLDER`) without mock delivery hacks.
- 👥 **Role-Isolated Notification Centers:**
  - **Patron Portal (`/profile/notifications`):** Live unread counter, multi-criteria filtering, channel telemetry, and interactive Notification Preferences modal.
  - **Theatre Admin Portal (`/theatre/notifications`):** Operations queue for turnstiles, laser projector SNMP telemetry, box office alerts, and single-click acknowledgement.
  - **Super Admin Portal (`/dashboard/notifications`):** Platform-wide incident notifications, security advisories, onboarding review triggers, and live dispatch audit trail stream.
- 📚 **Notification System Guide:** Detailed architecture in [`docs/NOTIFICATION_AND_COMMUNICATION_SYSTEM.md`](./docs/NOTIFICATION_AND_COMMUNICATION_SYSTEM.md).

### 2.16 Phase 2 - Part 15: Reporting, Analytics & Business Intelligence (Completed)
- 📊 **Decoupled Analytics Layer Architecture:**
  - Dashboards **never** query raw transactional tables directly on refresh; pre-aggregated summary entities (`analyticsSummaries`, `reportSnapshots`) eliminate database lock contention and scale to millions of bookings.
- 📐 **Centralized KPI Calculation Engine:**
  - Standardized mathematical formulas across all dashboards: Occupancy %, Average Ticket Price (ATP), Average Booking Value (ABV), Revenue per Available Seat (RevPAS), Revenue per Show, Conversion Rate, Cancellation Rate, and Customer LTV.
- 🏢 **Tenant-Isolated Theatre Admin Analytics (`/theatre/analytics`):**
  - Live operational KPI cards, movie box office share, hall and section fill rates, peak operating hours (18:00 & 21:00 spikes), payment method breakdown (NPCI UPI 68%, Cards 24%), customer cohort velocity, and live telemetry placeholders.
- 🌐 **Super Admin Platform Control Plane (`/dashboard/analytics`):**
  - Cross-circuit national performance (25 multiplexes, ₹8.45 Cr revenue), metropolitan market shares (Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad), and top-grossing movie titles.
- 🔍 **Hierarchical Performance Trace Navigator:**
  - Natural drill-down hierarchy:
    ```
    Platform → Theatre → Hall → Show → Booking → Ticket
    ```
- 📈 **Reusable Zero-Dependency Chart Components:**
  - Pure SVG & Tailwind components: `AreaChart`, `LineChart`, `BarChart`, `DonutChart`, `PieChart`, `HeatmapChart`, and `TrendMetricCard`.
- 📋 **Configurable Reports Engine (`/theatre/reports` & `/dashboard/reports`):**
  - Point-in-time immutable report snapshot generation with customizable dimensions, metrics, and date ranges.
- 📚 **Reporting & BI Architecture Guide:** Detailed technical documentation in [`docs/REPORTING_ANALYTICS_AND_BUSINESS_INTELLIGENCE.md`](./docs/REPORTING_ANALYTICS_AND_BUSINESS_INTELLIGENCE.md).

### 2.17 Phase 2 - Part 16: Enterprise Security, Production Readiness & Platform Hardening (Completed)
- 🛡️ **8-Tier Layered Security Pipeline:**
  - Strict defense-in-depth: $\text{Client Security} \to \text{Edge Security} \to \text{Application Security} \to \text{Business Authorization} \to \text{Tenant Isolation} \to \text{Database Protection} \to \text{Observability} \to \text{Performance Optimization}$.
- 🧩 **Domain Service & Repository Architecture Pattern:**
  - Decouples Next.js React Server Actions from database tables:
    ```
    UI → Server Actions (@/actions/*) → Domain Services (@/lib/services/*) → Repositories (@/lib/repositories/*) → Drizzle ORM → PostgreSQL
    ```
  - Isolates core business rules (booking validation, pricing resolution, payment configuration lookup, optimistic locking, and tenant checks) from framework transport details.
- 🧹 **Comprehensive Input Sanitization Engine:**
  - Sanitizes Strings, HTML, URLs, Emails, Phone Numbers, Search Queries, Headers, and nested Objects while strictly neutralizing Prototype Pollution (`__proto__`, `prototype`, `constructor`), XSS script tags, SQL injection characters, and CRLF response splitting.
- 🔒 **CSRF & Request Origin Defense:**
  - Double-submit cryptographic CSRF tokens with timing-safe comparison (`verifyCsrfToken`) and host-origin validation across state-changing HTTP methods.
- ⏱️ **Sliding-Window Rate Limiting Engine:**
  - Per-action bucket thresholds (Login: 5/15m, Registration: 3/h, Booking: 15/m, Payment: 10/m, Admin: 120/m, Public: 100/m) with automatic retry countdowns and `RATE_LIMIT_TRIGGERED` security event emission.
- 🌐 **Enterprise Hardened Security Headers:**
  - Strict Content-Security-Policy (CSP), HSTS (`max-age=63072000`), X-Content-Type-Options (`nosniff`), X-Frame-Options (`DENY`), Permissions-Policy, Cross-Origin-Opener-Policy, and Cross-Origin-Resource-Policy.
- 🏢 **Multi-Tenant Boundary Enforcement:**
  - Theatre Admins are strictly scoped to their assigned multiplex complex (`th-pun-001`). Cross-tenant access attempts immediately throw `TenantAccessError` and record tamper-evident `TENANT_VIOLATION` security events.
- 🔄 **Booking Optimistic Locking Concurrency:**
  - Version-based concurrency column (`version: integer`) preventing lost updates or race conditions, accompanied by automatic exponential jitter retry loops (`executeWithOptimisticRetry`).
- 💳 **Payment Architecture Abstraction:**
  - Maintains strict abstraction: $\text{Platform} \to \text{Theatre} \to \text{Payment Configuration} \to \text{Booking} \to \text{Transaction}$.
  - The booking engine never references raw UPI VPAs or merchant secrets; resolves active rails (UPI, Razorpay, PhonePe, Paytm, Stripe) dynamically.
- 📝 **Structured JSON Logging & Credential Scrubbing:**
  - Structured logs with Correlation IDs, Request IDs, Log Levels (`DEBUG` to `FATAL`), Categories, and automatic scrubbing of passwords, tokens, secrets, and card numbers.
- 🚨 **Intrusion & Security Events Tracker:**
  - Live monitoring for failed logins, permission violations, cross-tenant breaches, rate limit triggers, and optimistic locking collisions with resolution workflows.
- 🩺 **System Health & Observability Probes:**
  - Production-ready endpoints: `/api/health` (deep diagnostics), `/api/health/live` (container liveness), and `/api/health/ready` (database readiness).
- 📚 **Enterprise Security Guide:** Detailed technical documentation in [`docs/ENTERPRISE_SECURITY_AND_PLATFORM_HARDENING.md`](./docs/ENTERPRISE_SECURITY_AND_PLATFORM_HARDENING.md).

### 2.18 Phase 3 - Part 1: Theatre Lifecycle Management (Completed)
- 🔄 **Finite State Machine Governance (`ALLOWED_TRANSITIONS`):**
  - Strictly enforces lifecycle progression: `DRAFT` → `PENDING_APPROVAL` → `APPROVED` → `ACTIVE` ↔ `SUSPENDED` → `ARCHIVED` → `SOFT_DELETED` (plus `INACTIVE`), preventing shortcut transitions into live production.
- 🗄️ **Normalized Lifecycle Schema (`db/schema/theatres.ts`):**
  - Extends `theatres` with `publicId`, `approvalStatus`, optimistic locking `version`, suspension/archival/soft-delete fields, plus dedicated `theatreLifecycle`, `theatreStatusHistory`, `theatreApprovals`, and `theatreSlugHistory` tables.
- ✅ **Multi-Stage KYC Approval & Revision Loop:**
  - Formal onboarding review workflow supporting `APPROVE`, `REJECT`, and `REQUEST_REVISION` with reviewer comments and append-only `theatreApprovals` ledger records.
- ⛔ **Operational Lockouts, Archival & Soft Delete Invariants:**
  - `SUSPENDED` strictly locks bookings, shows, and payment processing (`allowBookings`, `allowShows`, `allowPayments`).
  - `ARCHIVED` puts multiplexes into read-only mode (`isReadOnly = true`) while preserving restore capability.
  - `SOFT_DELETED` never performs destructive deletion, records `deletedBy`, `deletedAt`, and `deleteReason`, and explicitly blocks deletion while a complex is `ACTIVE`.
- 🔗 **Unique Slug Management & Optimistic Concurrency:**
  - Auto-generates collision-free slugs (`cineplex-royal-satara-satara`), validates manual overrides against active and historical slugs (`theatreSlugHistory`), and enforces `expectedVersion` optimistic locking (`ConflictError` on stale edits).
- 🔒 **Multi-Tenant Field RBAC & Portal Integration:**
  - `SUPER_ADMIN` oversees platform-wide fleet search, filtering, pagination, and transitions in `/dashboard/theatres` and `/dashboard/theatres/[id]`.
  - `THEATRE_ADMIN` views read-only lifecycle governance and edits strictly permitted profile fields (`TheatreAdminEditableFields`) on their assigned complex in `/theatre/profile`.
- 📚 **Theatre Lifecycle Guide:** Detailed technical documentation in [`docs/THEATRE_LIFECYCLE_MANAGEMENT.md`](./docs/THEATRE_LIFECYCLE_MANAGEMENT.md).

### 2.19 Phase 3 - Part 2: Theatre Branding & Media Management (Completed)
- 🎨 **Decoupled Digital Asset Management (DAM) Hierarchy (`db/schema/theatre-media.ts`):**
  - Implements $\text{Platform} \to \text{Theatre} \to \text{TheatreMediaCollection} \to \text{TheatreMedia}$ with companion tables `theatreMediaMetadata`, `theatreMediaVersions`, and `theatreMediaReferences` instead of embedding raw asset paths directly on `theatres`.
- 🖼️ **Single-Active Brand Slots & Unlimited Ordered Gallery:**
  - Enforces single-active invariants across `LOGO`, `BANNER`, `COVER_IMAGE`, `HERO_IMAGE`, and `THUMBNAIL` slots (auto-archiving superseded active assets) alongside unlimited `GALLERY_IMAGE` assets.
  - Supports HTML5 drag-and-drop reordering, keyboard arrow moves, and automatic contiguous re-sequencing (`displayOrder`).
- 🕰️ **Immutable Media Versioning & Rollback (`TheatreMediaVersion`):**
  - Preserves previous versions (`v1`, `v2`, ...) on asset replacement with full SHA-256 checksums, dimensions, dominant palette hex, and change reasons, supporting one-click forward version restoration.
- 🛡️ **Server-Side Upload Validation & Security Controls:**
  - Never trusts client metadata blindly: enforces per-type MIME allowlists, file size ceilings, minimum/maximum dimensions, XSS URL filtering, corrupted signature detection placeholders, SHA-256 duplicate prevention, and strict rejection of raw video binary uploads while reserving `FUTURE_VIDEO_PLACEHOLDER` & `FUTURE_PANORAMA_PLACEHOLDER` stubs (`PROMOTIONAL_VIDEO`, `THEATRE_WALKTHROUGH`, `HALL_PREVIEW`, `VIDEO_360`, `VIRTUAL_TOUR`).
- 🌐 **Prepared Optimization, Caching & Public Projection:**
  - Prepares `compressionPlaceholder` metadata (`WebP`, `AVIF`, `JPEG`, responsive widths), CDN URL pattern stubs, `withQueryCache` / `CACHE_TAGS.THEATRE_MEDIA` invalidation hooks, and public active-only resolution across `/theatres` and `/theatre/[slug]`.
- 🔒 **Multi-Tenant Ownership & Immutable Audits:**
  - Reusable workspace (`TheatreBrandingMediaWorkspace`) integrated into `/dashboard/media`, `/dashboard/theatres/[id]`, `/theatre/media`, and `/theatre/gallery`, tracking `MEDIA_UPLOADED`, `MEDIA_REPLACED`, `MEDIA_VERSION_RESTORED`, `GALLERY_REORDERED`, `METADATA_UPDATED`, and `MEDIA_DELETED`.
- 📚 **Theatre Media Guide:** Detailed technical documentation in [`docs/THEATRE_MEDIA_MANAGEMENT.md`](./docs/THEATRE_MEDIA_MANAGEMENT.md).

### 2.20 Phase 3 - Part 3: Theatre Profile Management (Completed)
- 🏢 **Decoupled Theatre Profile Entity (`db/schema/theatre-profile.ts`):**
  - Extends `theatres` without modifying core tenant columns via `theatreProfiles`, `theatreLanguages`, `theatreSocialLinks`, and `theatreProfileVersions`.
  - Maintains independent `publicSlug` branding URLs separate from internal tenant routing slugs.
- 📊 **Business Metrics, Completion Score & Localization Readiness:**
  - Validates `Theatre Name`, `Legal Name`, `Established Year`, `Theatre Type` (`Multiplex`, `Single Screen`, `Luxury Cinema`, `Drive-In`, `Mini Theatre`, `Independent`, `Chain`, `Custom`), `Screens Count`, `Total Seating Capacity`, auto-calculated `Average Capacity Per Screen`, website URLs, and multi-locale `localizedFields` maps.
  - Dynamically calculates `completionScore` (`0–100`) incorporating live Logo & Banner upload presence from Phase 3 Part 2.
- 🗣️ **Languages & Social Presence Governance:**
  - Manages multi-language exhibition catalogs (`English`, `Hindi`, `Marathi`, `Tamil`, `Telugu`, `Kannada`, `Malayalam`, `Gujarati`, `Punjabi`, `Bengali`, plus custom codes) with single-primary enforcement, and validated social links (`Website`, `Facebook`, `Instagram`, `X`, `YouTube`, `LinkedIn`, `Threads`, `Custom`).
- 🕰️ **Immutable Profile Versioning & Rollback:**
  - Records `previousValues`, `updatedFields`, `updatedBy`, and `updatedAt` in `TheatreProfileVersion` on every mutation, supporting non-destructive forward version rollbacks and full audit logging across Super Admin (`/dashboard/theatres/profiles`, `/dashboard/theatres/[id]`), Theatre Admin (`/theatre/profile`), and Public Pages (`/theatre/[slug]`).
- 📚 **Theatre Profile Guide:** Detailed technical documentation in [`docs/THEATRE_PROFILE_MANAGEMENT.md`](./docs/THEATRE_PROFILE_MANAGEMENT.md).

### 2.21 Phase 3 - Part 4: Theatre Address & Location Management (Completed)
- 📍 **Decoupled Multi-Location Fleet Architecture (`db/schema/theatre-location.ts`):**
  - Models $\text{Platform} \to \text{Theatre} \to \text{Theatre Location}$ with 1:N fleet branch support (`theatres 1:N theatre_locations`), primary complex assignment (`isPrimary`), and dedicated child tables `theatreCoordinates`, `theatreGeoMetadata`, and `theatreLocationVersions`.
- 🗺️ **Coordinate Governance & Spatial Index Readiness:**
  - Decimal degree bounding constraints ($\text{Lat} \in [-90, 90]$, $\text{Lon} \in [-180, 180]$), coordinate provenance source tagging (`GPS`, `MAP_PIN`, `GEOCODED`, `MANUAL`), PostGIS SRID 4326 standard spatial index placeholder (`SRID=4326;POINT(lon lat)`), and 8-character geohash calculation (`tek9d50s`).
- 🛡️ **Super Admin Location Verification Workflow & Publication Gate:**
  - Strict lifecycle transition: `DRAFT` \(\to\) `VERIFIED` \(\to\) `PUBLISHED` \(\to\) `ARCHIVED`. Theatre Admins create locations in `UNVERIFIED` state; only Super Admins hold authority to review and verify physical addresses. Attempting to publish an unverified location is strictly rejected by the domain publication gate.
- 🧭 **Turn-by-Turn Navigation & URL Sanitization:**
  - Secure Google Maps URL, Place ID, driving/walking/transit direction links, and embedded map placeholders with complete XSS protocol sanitization (`javascript:`, `data:`, `vbscript:` stripping).
- 🔍 **Pre-Pagination Tenant Isolation & Public Projection:**
  - Pre-pagination filters strictly protect cross-tenant boundaries. Public cinema pages (`/theatre/[slug]`) project verified, published addresses while keeping draft or unverified addresses protected from public view.
- 📚 **Theatre Location Guide:** Detailed technical documentation in [`docs/THEATRE_LOCATION_MANAGEMENT.md`](./docs/THEATRE_LOCATION_MANAGEMENT.md).

### 2.22 Phase 3 - Part 5: Theatre Amenities & Facilities Management (Completed)
- 🛋️ **Decoupled Platform Catalog Architecture (`db/schema/theatre-amenity.ts`):**
  - Models $\text{Platform} \to \text{Amenity Catalog} \to \text{Amenity Categories} \to \text{Theatre} \to \text{Theatre Amenities}$. Super Admin introduces new global amenities across categories (`technology`, `comfort`, `accessibility`, `food-beverage`, `safety`) without database schema modifications.
- 🔄 **Rich Availability Modes & Operating Status Governance:**
  - Replaces binary flags with domain states: `AVAILABLE`, `TEMPORARILY_UNAVAILABLE`, `SEASONAL`, and `UNDER_MAINTENANCE` with local operating notes and screen-level restrictions.
- 🌐 **Multilingual Localization & Future Entity Extensibility:**
  - First-class support for multilingual names and descriptions (Hindi, Marathi) in JSONB structures. Generic entity mapping (`entityType`: `THEATRE`, `HALL`, `LOUNGE`, `PREMIUM_SCREEN`) prepares the platform for sub-entity auditorium/lounge amenity attachment without schema redesign.
- 🚗 **Facility Specifications & Capacity Metadata:**
  - Dedicated child table `theatre_amenity_metadata` tracks parking bays, EV chargers, guest Wi-Fi SSIDs, accessibility pathway notes, food court details, and custom attributes.
- ⚡ **Sequential Reordering, Optimistic Concurrency Control & Public Projection:**
  - Supports 1..N contiguous display sequence reordering, version ledger snapshots with optimistic locking, and active-only public patron discovery on `/theatre/[slug]`.
- 📚 **Theatre Amenities Guide:** Detailed technical documentation in [`docs/THEATRE_AMENITIES_AND_FACILITIES_MANAGEMENT.md`](./docs/THEATRE_AMENITIES_AND_FACILITIES_MANAGEMENT.md).

### 2.23 Phase 3 - Part 6: Theatre Contact Management (Completed)
- 📞 **Decoupled Contact Directory Architecture (`db/schema/theatre-contact.ts`):**
  - Models $\text{Platform} \to \text{Theatre} \to \text{Theatre Contact Directory} \to \text{Contact Channels} \to \text{Contact Roles}$. Decouples communication channels into 10 structured channel types (`PHONE`, `EMAIL`, `WEBSITE`, `SOCIAL_LINK`, `EMERGENCY`, `MANAGER`, `WHATSAPP`, `TELEGRAM`, `LIVE_CHAT`, `CALL_CENTER`) across 9 operational roles (`CUSTOMER_SUPPORT`, `GENERAL_ENQUIRY`, `EMERGENCY_DESK`, `DUTY_MANAGER`, `BOOKING_BOX_OFFICE`, etc.).
- 🔄 **Operating Availability Modes & Verification Lifecycle:**
  - Rich availability states (`STANDARD_BUSINESS_HOURS`, `TWENTY_FOUR_SEVEN`, `EMERGENCY_ONLY`, `SHOWTIME_ONLY`, `TEMPORARILY_INACTIVE`) and verification badges (`UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`) displaying authenticated checkmarks to patrons.
- 🛡️ **Phone / Email Governance & Single-Primary Rule:**
  - E.164 and country code validation (+91, +1, +44), departmental email inboxes, and automatic single-primary enforcement guaranteeing exactly one primary voice line and primary email per cinema.
- 🌐 **Safe URL Sanitization, Website Governance & Social Links:**
  - Complete stored XSS defense rejecting `javascript:`, `data:`, and `vbscript:` URI protocols for official multiplex web portals and verified social media presences (Instagram, Facebook, X, YouTube, LinkedIn, Threads, Custom).
- 🚨 **24/7 Emergency Incident Command & Duty Manager Escalation:**
  - Dedicated emergency desk tracking incident commander, primary/alternate phone lines, dispatch availability, and muster protocols. Duty manager profiles tracking shift hours and escalation tiers (Tier 1..3).
- ⚡ **Sequential Reordering, Pre-Pagination Tenant Isolation & Public Projection:**
  - 1..N contiguous sequential ordering with optimistic locking (`ConflictError`), strict pre-pagination multi-tenant isolation, immutable version ledger snapshots, and Section 9 public patron discovery on `/theatre/[slug]`.
- 📚 **Theatre Contact Guide:** Detailed technical documentation in [`docs/THEATRE_CONTACT_MANAGEMENT.md`](./docs/THEATRE_CONTACT_MANAGEMENT.md).

---

## ☁️ 9. Vercel Deployment Settings

For zero-configuration deployment to Vercel:

| Setting | Value |
|---|---|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `./` |
| **Build Command** | `npm run build` (or `pnpm run build`) |
| **Output Directory** | `.next` (default) |
| **Install Command** | `pnpm install` |

---

## 📚 10. Developer Documentation Suite

Detailed architecture and engineering guides are available in the [`docs/`](./docs) directory:

- 📞 [`docs/THEATRE_CONTACT_MANAGEMENT.md`](./docs/THEATRE_CONTACT_MANAGEMENT.md) — Multi-Channel Theatre Contact Directory Architecture (`TheatreContact`, Availability Modes, Verification Badges, Single-Primary Rule, 24/7 Emergency Command Desk, Duty Manager Escalation, Reordering & OCC) (Phase 3 - Part 6).
- 🛋️ [`docs/THEATRE_AMENITIES_AND_FACILITIES_MANAGEMENT.md`](./docs/THEATRE_AMENITIES_AND_FACILITIES_MANAGEMENT.md) — Centralized Amenity Catalog & Theatre Facilities Architecture (`AmenityCatalog`, Availability Modes, Localization, Facility Metadata, Sequential Reordering & OCC) (Phase 3 - Part 5).
- 📍 [`docs/THEATRE_LOCATION_MANAGEMENT.md`](./docs/THEATRE_LOCATION_MANAGEMENT.md) — Multi-Location Theatre Address & Location Architecture (`TheatreLocation`, Coordinates Governance, PostGIS & Geohash Placeholders, Super Admin Verification Gate, Turn-by-Turn Navigation & Version Rollback) (Phase 3 - Part 4).
- 🏢 [`docs/THEATRE_PROFILE_MANAGEMENT.md`](./docs/THEATRE_PROFILE_MANAGEMENT.md) — Decoupled Theatre Profile Management Architecture (`TheatreProfile`, Business Capacity Metrics, Public Profile Slug Separation, Completion Scoring, Multi-Language & Social Link Governance, Version History & Localization) (Phase 3 - Part 3).
- 🎨 [`docs/THEATRE_MEDIA_MANAGEMENT.md`](./docs/THEATRE_MEDIA_MANAGEMENT.md) — Theatre Branding & Digital Media Management Architecture (`TheatreMediaCollection`, Single-Active Brand Slots, Drag-and-Drop Gallery Ordering, Version History & Rollback, Server Validation & Future Video Support) (Phase 3 - Part 2).
- 🏛️ [`docs/THEATRE_LIFECYCLE_MANAGEMENT.md`](./docs/THEATRE_LIFECYCLE_MANAGEMENT.md) — Theatre Lifecycle Governance, Finite State Machine (`DRAFT` → `PENDING_APPROVAL` → `APPROVED` → `ACTIVE` ↔ `SUSPENDED` → `ARCHIVED` → `SOFT_DELETED`), Approval Workflows, Operational Lockouts, Slug History & Optimistic Locking (Phase 3 - Part 1).
- 🛡️ [`docs/ENTERPRISE_SECURITY_AND_PLATFORM_HARDENING.md`](./docs/ENTERPRISE_SECURITY_AND_PLATFORM_HARDENING.md) — Enterprise Security Architecture, Layered Defense Pipeline, Domain Service & Repository Pattern, Booking Optimistic Locking, Threat Monitoring & Health Probes (Phase 2 - Part 16).
- 📊 [`docs/REPORTING_ANALYTICS_AND_BUSINESS_INTELLIGENCE.md`](./docs/REPORTING_ANALYTICS_AND_BUSINESS_INTELLIGENCE.md) — Reporting, Analytics & Business Intelligence Architecture, Decoupled Aggregation Marts, Centralized KPI Engine, Hierarchical Trace Navigator & Configurable Snapshots (Phase 2 - Part 15).
- 🔔 [`docs/NOTIFICATION_AND_COMMUNICATION_SYSTEM.md`](./docs/NOTIFICATION_AND_COMMUNICATION_SYSTEM.md) — Centralized Notification & Communication System, Event-Driven Decoupled Bus, Template Engine, Multi-Channel Manifest & Preferences Matrix (Phase 2 - Part 14).
- 🎟️ [`docs/TICKET_MANAGEMENT_AND_DIGITAL_TICKETS.md`](./docs/TICKET_MANAGEMENT_AND_DIGITAL_TICKETS.md) — Digital Ticket Management & QR Architecture, 4-Tier Identifier Separation, Dynamic QR Payload, Multi-Ticket Strategies & Public URL Security (Phase 2 - Part 13).
- 💳 [`docs/THEATRE_PAYMENT_CONFIGURATION_ARCHITECTURE.md`](./docs/THEATRE_PAYMENT_CONFIGURATION_ARCHITECTURE.md) — Theatre Payment Configuration & Payment Architecture, 1:N Rails, Dynamic NPCI QR Derivation, Multi-Tenant Isolation & Audit Trail (Phase 2 - Part 12).
- 🎟️ [`docs/BOOKING_ENGINE_AND_RESERVATION_ARCHITECTURE.md`](./docs/BOOKING_ENGINE_AND_RESERVATION_ARCHITECTURE.md) — Booking Engine & Seat Reservation Architecture, 3-Tier Layering Model, Session vs Booking ID, Concurrency Locks & Audit Trail (Phase 2 - Part 11).
- 🧭 [`docs/CUSTOMER_DISCOVERY_AND_BOOKING_FLOW.md`](./docs/CUSTOMER_DISCOVERY_AND_BOOKING_FLOW.md) — Customer Discovery & Booking Flow Architecture, Multi-Journey Convergence (City, Movie, Theatre, Direct), Unified Single Show ID Snapshot & Interactive 2D Seat Matrix (Phase 2 - Part 10).
- 💰 [`docs/DYNAMIC_PRICING_ENGINE.md`](./docs/DYNAMIC_PRICING_ENGINE.md) — Dynamic Pricing Engine Architecture, Fundamental Separation Law, Reusable Profiles, Section Hierarchy & Seat Calculation Simulator (Phase 2 - Part 9).
- 🎟️ [`docs/SHOW_MANAGEMENT_AND_SCHEDULING.md`](./docs/SHOW_MANAGEMENT_AND_SCHEDULING.md) — Show Management System, Screening Event Architecture, Conflict Detection Engine, Reusable Pricing Profiles & Dynamic Seat Inventory (Phase 2 - Part 8).
- 🎬 [`docs/MOVIE_MANAGEMENT_SYSTEM.md`](./docs/MOVIE_MANAGEMENT_SYSTEM.md) — Movie Management System, Master Entity Architecture, Two-Layer Global Library & Theatre Exhibition Catalog (Phase 2 - Part 7).
- 🪑 [`docs/AUTOMATIC_SEAT_GENERATION_ENGINE.md`](./docs/AUTOMATIC_SEAT_GENERATION_ENGINE.md) — Automatic Seat Generation Engine, Immutable UUIDs, Zero Embedded Pricing & 3D Spatial Geometry (Phase 2 - Part 6).
- 🏛️ [`docs/HALL_MANAGEMENT_ARCHITECTURE.md`](./docs/HALL_MANAGEMENT_ARCHITECTURE.md) — Hall Fleet Management, Dynamic Section Editor & 2D Floor Plan Schematic (Phase 2 - Part 5).
- 🏢 [`docs/THEATRE_ADMIN_ONBOARDING.md`](./docs/THEATRE_ADMIN_ONBOARDING.md) — Theatre Admin Management, Multi-Tenant Isolation & Independent UPI Rails (Phase 2 - Part 4).
- 🛡️ [`docs/SUPER_ADMIN_PLATFORM.md`](./docs/SUPER_ADMIN_PLATFORM.md) — Super Admin Platform Control Plane, Governance Architecture & State Machine (Phase 2 - Part 3).
- 🗄️ [`docs/DATABASE_ARCHITECTURE.md`](./docs/DATABASE_ARCHITECTURE.md) — Production PostgreSQL Architecture, Drizzle ORM Schema, Relational Graph & Multi-Tenant Model (Phase 2 - Part 2).
- 🏢 [`docs/AUTH_AND_AUTHORIZATION.md`](./docs/AUTH_AND_AUTHORIZATION.md) — Enterprise Authentication, Clerk Integration, Multi-Tenant Isolation & RBAC Architecture (Phase 2 - Part 1).
- 🏢 [`docs/MULTI_TENANT_ARCHITECTURE.md`](./docs/MULTI_TENANT_ARCHITECTURE.md) — Comprehensive Multi-Tenant Cinema OS Specification & Layout Engine.
- 📖 [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md) — Strategic vision and core personas.
- 🏗️ [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Codebase architecture and directory map.
- 🎨 [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) — Complete tokens, colors, and typography guide.
- 🗺️ [`docs/ROUTES.md`](./docs/ROUTES.md) — Exhaustive route inventory across all 3 portals.
- 🧩 [`docs/COMPONENT_LIBRARY.md`](./docs/COMPONENT_LIBRARY.md) — Reusable component documentation and props.
- 📊 [`docs/DUMMY_DATA.md`](./docs/DUMMY_DATA.md) — Centralized mock data models and consumption guide.
- 💻 [`docs/DEVELOPMENT_GUIDELINES.md`](./docs/DEVELOPMENT_GUIDELINES.md) — Engineering standards and verification.
- 🚀 [`docs/ROADMAP.md`](./docs/ROADMAP.md) — Multi-phase development roadmap (Phases 1 through 7).

---

## 📄 11. License

Proprietary enterprise software developed for modern cinema management. All rights reserved.
