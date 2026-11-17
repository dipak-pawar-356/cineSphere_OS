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

### 2.24 Phase 3 - Part 7: Theatre Business Information Management (Completed)
- 🏢 **Business Profile Architecture (`db/schema/theatre-business.ts`):**
  - Models $\text{Platform} \to \text{Theatre} \to \text{Theatre Business Profile} \to \text{Legal Information} \to \text{Registration Information} \to \text{Tax Configuration} \to \text{Invoice Configuration} \to \text{Compliance Status}$.
  - Decouples corporate entity identity into dedicated child tables: `theatre_business_profiles` (`TheatreBusinessProfile`), `theatre_business_registrations` (`BusinessRegistration`), `theatre_business_owners` (`BusinessOwner`), `theatre_tax_configurations` (`TaxConfiguration`), `theatre_invoice_configurations` (`InvoiceConfiguration`), `theatre_business_compliances` (`BusinessCompliance`), `theatre_business_documents` (`BusinessDocument`), and `theatre_business_versions` (`BusinessVersion`).
  - Stores Legal Business Name, Business Category (`MULTIPLEX`, `SINGLE_SCREEN`, `ENTERTAINMENT_COMPANY`, `CINEMA_CHAIN`, `PRIVATE_LIMITED`, `LLP`, `PARTNERSHIP`, `PROPRIETORSHIP`, `TRUST`, `GOVERNMENT`, `CUSTOM`), Registered Entity Name, Business Description, and Industry.
- 🛡️ **Registration Information:**
  - Validates standard statutory regex rules: GST Number (15-character statutory alphanumeric `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`), PAN Number (10-character `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`), and corporate CIN Number (21-character `^([LUu])[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$`).
  - Stores Business Registration Number, Registration Date, Registration Authority, and Registration Certificate references with uppercase normalization.
- 🌍 **Tax Configuration:**
  - Designed for country-aware compliance without database schema modifications: `GST` (India/Australia/Singapore), `VAT` (UK/EU/UAE), `SALES_TAX` (US), and `CUSTOM` systems.
  - Supports `TAX_INCLUSIVE` (ticket face value includes taxes) and `TAX_EXCLUSIVE` (taxes calculated on top at checkout) ticket pricing models, tax percentage decimals, regional state codes (e.g., `MH-27`), international tax numbers, and statutory exemption waivers. (Strictly config-only; no tax calculation engine).
- 🧾 **Invoice Configuration:**
  - Configurable invoice prefix (e.g. `CSP-PUN-`), monotonically incrementing sequence counters (`invoiceSequenceNext`), customizable statutory header/footer disclosures, invoice notes, brand invoice logo URLs, and feature flags for E-Invoice schema compliance, PDF delivery, and credit notes. (Strictly config-only; no PDF generator).
- ⚖️ **Compliance Workflow:**
  - Formal multi-stage verification state machine: `DRAFT` ➔ `PENDING_VERIFICATION` ➔ `VERIFIED` / `REJECTED` / `ARCHIVED`.
  - Captures `verificationStatus`, `verifiedBy` (Super Admin ID), `verifiedAt`, `remarks`, and `riskScore`.
  - Strict platform role authorization gates verification authority to `SUPER_ADMIN` accounts only; attempts by Theatre Admins are strictly rejected with `AuthorizationError`.
- 💻 **Developer Notes:**
  - **Decoupled Document Attachment Vault:** Stores binary document references (`theatre_business_documents`) across statutory types (`GST_CERTIFICATE`, `PAN_CARD`, `CIN_CERTIFICATE`, `TRADE_LICENSE`, `INCORPORATION_CERTIFICATE`, `AUTHORIZATION_LETTER`, `BOARD_RESOLUTION`, `OTHER`) with independent verification status and expiry tracking.
  - **Financial Identity Separation:** Keeps business identity, payment gateway configuration (Phase 2), and invoice configuration as separate domains so payment providers, tax rules, and invoicing evolve independently.
  - **Multi-Tenant Isolation & Optimistic Locking:** Strict pre-pagination tenant isolation via `tenantService.assertTenantAccess`. Concurrency control via `version` bumping (`ConflictError` on stale `expectedVersion`).
  - **Immutable Version Ledger:** Maintains full cryptographic snapshots in `theatre_business_versions` on every mutation with structured change types.
- 📚 **Theatre Business Profile Architecture Guide:** Detailed technical documentation in [`docs/THEATRE_BUSINESS_INFORMATION_MANAGEMENT.md`](./docs/THEATRE_BUSINESS_INFORMATION_MANAGEMENT.md).

### 2.25 Phase 3 - Part 8: Theatre Operating Hours Management (Completed)
- ⏰ **Decoupled Operating Hours Architecture (`db/schema/theatre-operating-hours.ts`):**
  - Models $\text{Platform} \to \text{Theatre} \to \text{Theatre Operating Profile} \to \text{Weekly Schedule} \mid \text{Holiday Calendar} \mid \text{Maintenance Calendar} \mid \text{Special Events} \mid \text{Version History}$.
  - Normalizes operating times into discrete tables: `theatre_operating_profiles` (`TheatreOperatingProfile`), `theatre_weekly_schedules` (`TheatreWeeklySchedule`), `theatre_holiday_schedules` (`TheatreHolidaySchedule`), `theatre_maintenance_schedules` (`TheatreMaintenanceSchedule`), `theatre_special_operating_events` (`TheatreSpecialOperatingEvent`), and `theatre_operating_profile_versions` (`TheatreOperatingProfileVersion`).
- 🗓️ **Weekly Schedule Rotations & Timezone Governance:**
  - Day-by-day weekly configuration across all 7 days with `isOpen`, `openTime`, `closeTime`, `isOvernight` midnight rollover, and time slots.
  - Strict timezone normalization using standard IANA timezone identifiers (e.g. `Asia/Kolkata`, `America/New_York`).
- 🏖️ **Holiday Calendars & Exception Overrides:**
  - Manages calendar-specific holidays (`holidayDate`), full closure flags, or custom partial operating hours (`partialOpenTime`, `partialCloseTime`) with administrative notes.
- 🔧 **Facility & Auditorium Maintenance Windows:**
  - Schedules planned technical downtime (e.g., laser projector optical alignment, Dolby Atmos calibration, acoustic tuning) with affected screen multi-selectors (`affectedHalls: string[]`), execution dates, time ranges, and tracking states (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- 🌟 **Special Midnight Releases & Film Festivals:**
  - Accommodates blockbuster midnight fan screenings and multi-day festival marathons with custom date horizons and early box-office gate cutoffs.
- 💻 **Developer Notes:**
  - **Multi-Tenant Boundary Isolation:** Pre-pagination tenant isolation via `tenantService.assertTenantAccess`.
  - **Input Validation Invariants:** Strict 24-hour time format verification (`^([01]\d|2[0-3]):[0-5]\d$`), ISO calendar dates, and overnight opening/closing logic.
  - **Audit Trail & Optimistic Concurrency:** Immutable snapshots stored in `theatre_operating_profile_versions` on every change; cache invalidation via `THEATRE_OPERATING_HOURS` tag.
- 📚 **Theatre Operating Hours Guide:** Detailed technical documentation in [`docs/THEATRE_OPERATING_HOURS_MANAGEMENT.md`](./docs/THEATRE_OPERATING_HOURS_MANAGEMENT.md).

### 2.26 Phase 3 - Part 9: Dynamic Theatre Configuration Management (Completed)
- ⚙️ **Decoupled Relational Configuration Domain (`db/schema/theatre-configuration.ts`):**
  - Models $\text{Platform} \to \text{Theatre} \to \text{Theatre Configuration} \to \text{Localization} \mid \text{Booking Rules} \mid \text{Cancellation Rules} \mid \text{Refund Rules} \mid \text{Customer Rules} \mid \text{Feature Flags} \mid \text{Terms} \mid \text{Version History}$.
  - Avoids single monolithic JSON blobs by decomposing configuration into strongly typed relational child entities: `theatre_configurations` (`TheatreConfiguration`), `theatre_localization_configurations` (`LocalizationConfiguration`), `theatre_booking_configurations` (`BookingConfiguration`), `theatre_cancellation_configurations` (`CancellationConfiguration`), `theatre_refund_configurations` (`RefundConfiguration`), `theatre_age_restriction_configurations` (`AgeRestrictionConfiguration`), `theatre_feature_flag_configurations` (`FeatureFlagConfiguration`), `theatre_configuration_terms` (`ConfigurationTerms`), and `theatre_configuration_versions` (`ConfigurationVersion`).
- 🌐 **Localization & Formatting:**
  - ISO 4217 Currency (e.g. `INR`, `USD`, `EUR`, `AED`), IANA Timezone, primary and supported languages, configurable date formats, `12H`/`24H` time formats, `INDIAN` (Lakhs/Crores) vs `INTERNATIONAL` (Millions/Billions) number formatting, and `METRIC`/`IMPERIAL` units.
- 🎟️ **Booking Quotas & Seat Hold Locks:**
  - Max seats per booking (1–50), min seats per booking (1–10), advance booking horizon (1–365 days), gate cutoff minutes (0–1440), max concurrent bookings per user, and temporary seat hold lock timer (30–3600 seconds, e.g. 600s = 10 mins).
- ❌ **Cancellation Policies & Auto-Forfeiture:**
  - Customer cancellation toggle (`cancellationAllowed`), advance notice deadline (minutes before show), percentage cancellation fee deduction (e.g. `15.00%`), and automated unpaid reservation hold timeout releases.
- 💵 **Refund Settlement & Payment Gateway Routing:**
  - Refund eligibility window hours, payout percentages, destination routing (`ORIGINAL_PAYMENT`, `WALLET`, `STORE_CREDIT`), turnaround processing days, and automated payment gateway reversal switch (`gatewayAutoRefund`).
- 🛡️ **Age Restrictions & Censor Rating Matrix:**
  - Formal censor certification thresholds enforcing $U \le UA \le A \le S$, minor guardian accompaniment age floors, mandatory gate ID verification, and custom auditorium age disclaimers.
- ✨ **Modular Feature Flags & Capabilities:**
  - One-click commercial capability toggles: Loyalty points, promo coupons, digital gift cards, VIP memberships, demand-based dynamic pricing, AI personalized recommendations, and sold-out show waitlisting.
- 📜 **Customer Legal Agreements:**
  - Legally binding customer terms, refund caveats, privacy notices, and checkout covenants displayed on confirmation vouchers and digital M-Tickets.
- 🕰️ **Publishing Workflow & One-Click Rollback:**
  - Draft-to-publish release cycle (`DRAFT` → `PUBLISHED` / `ARCHIVED`). Publishing stores immutable snapshots in `theatre_configuration_versions` and updates live booking engines.
  - One-click rollback restores prior snapshots as reviewable working drafts with monotonic version increments.
- 💻 **Developer Notes:**
  - **Multi-Tenant Boundary Isolation:** Pre-pagination isolation enforced via `tenantService.assertTenantAccess`.
  - **Audit Logging & Caching:** Full audit logging through `securityAuditService` with invalidation of `THEATRE_CONFIGURATION` and `PUBLIC_THEATRE_CONFIGURATION` cache tags.
- 📚 **Dynamic Theatre Configuration Guide:** Detailed technical documentation in [`docs/DYNAMIC_THEATRE_CONFIGURATION_MANAGEMENT.md`](./docs/DYNAMIC_THEATRE_CONFIGURATION_MANAGEMENT.md).

### 2.27 Phase 3 - Part 10: Theatre Staff Management & Dynamic RBAC Hierarchy (Completed)
- 👥 **Staff Architecture (`db/schema/theatre-staff.ts`):**
  - Establishes an enterprise multi-tenant staff organizational hierarchy: $\text{Platform} \to \text{Permission Catalog} \to \text{Role Templates} \to \text{Theatre} \to \text{Staff Organization} \to \text{Departments} \to \text{Roles} \to \text{Permissions} \to \text{Staff Members} \to \text{Future Scheduling}$.
  - Supported by 8 normalized Drizzle tables: `role_templates`, `theatre_roles`, `theatre_permissions`, `staff_departments`, `theatre_staff`, `staff_role_assignments`, `staff_role_history`, and `future_shift_placeholders`.
- 📋 **Role Templates:**
  - Platform-provided standard templates (`TEMPLATE_THEATRE_ADMIN`, `TEMPLATE_HALL_MGR`, `TEMPLATE_TICKET_COUNTER`, `TEMPLATE_SUPPORT`, `TEMPLATE_PROJECTION`, `TEMPLATE_SECURITY`, `TEMPLATE_MAINTENANCE`, `TEMPLATE_CLEANER`, `TEMPLATE_FOOD_COURT`, `TEMPLATE_OPS_MGR`, `TEMPLATE_SUPERVISOR`, `TEMPLATE_CASHIER`).
  - Supports one-click instantiation into tenant-owned roles with customizable display names, descriptions, hierarchy weighting, and overridden capability grants.
- 🔑 **Permission Model:**
  - 20+ granular capability keys across all core modules: `DASHBOARD`, `BOOKINGS`, `PAYMENTS`, `MOVIES`, `SHOWS`, `REPORTS`, `HALLS`, `TICKETS`, `SETTINGS`, `MEDIA`, `BUSINESS_PROFILE`, `STAFF`, and `PLATFORM`.
  - Permission-based authorization checks (`theatreStaffService.hasPermission(staffId, permissionKey)`), ensuring capability enforcement rather than brittle role string comparisons.
- 🏢 **Department Structure:**
  - Supports standard and custom organizational departments: `OPERATIONS`, `PROJECTION`, `CUSTOMER_SUPPORT`, `SECURITY`, `MAINTENANCE`, `FOOD_COURT`, `ADMINISTRATION`, `FINANCE` (placeholder), `MARKETING` (placeholder), and `CUSTOM`.
  - Tracks department head references, custom department names, unique codes, and headcount statistics.
- 🔄 **Role Assignment & History:**
  - Dynamic primary and secondary role assignments with expiration dates and authorization reason tracking.
  - Lifecycle state machine: `INVITED` → `ACTIVE` ↔ `SUSPENDED` → `RESIGNED` / `ARCHIVED`. Immediate capability revocation upon suspension or archival.
  - Immutable audit trail ledger in `staff_role_history` recording all transitions (`ASSIGNED`, `PROMOTED`, `DEMOTED`, `TRANSFERRED`, `REVOKED`) with authorizers and timestamps.
- 🛡️ **Tenant Isolation:**
  - Every staff member, role, permission grant, and department strictly belongs to exactly one `theatreId`.
  - Cross-tenant lookups and mutations are prevented via `tenantService.assertTenantAccess` and `createProtectedAction({ enforceTenantIsolation: true })`.
- 🔮 **Future Scheduling Architecture:**
  - Architectural stub table `future_shift_placeholders` and extensible interfaces ready for future shift planning, weekly scheduling, attendance, leave management, holiday assignments, payroll integrations, and biometric turnstile integration without requiring future schema redesign.
- 💻 **Developer Notes:**
  - **Performance & Cache Invalidation:** Pre-pagination multi-attribute searching (name, code, email, phone, role, department), server-side pagination, and automatic invalidation of `THEATRE_STAFF` and `PUBLIC_THEATRE_STAFF` cache tags.
  - **Audit Logging:** Tamper-evident logging through `securityAuditService.recordAudit` across all staff creation, invitation, suspension, archival, role assignment, and permission update events.
- 📚 **Theatre Staff Management Guide:** Detailed technical documentation in [`docs/THEATRE_STAFF_MANAGEMENT.md`](./docs/THEATRE_STAFF_MANAGEMENT.md).

### 2.28 Phase 3 - Part 11: Theatre Dashboard & Analytics Layer (Completed)
- 📊 **Dedicated Dashboard Analytics Layer (`db/schema/theatre-dashboard.ts`):**
  - Models $\text{Platform} \to \text{Analytics Engine} \to \text{Materialized Metrics} \to \text{Widget Registry} \to \text{User Preferences} \to \text{Theatre Dashboard}$.
  - Decoupled from transactional database tables (`bookings`, `payments`, `shows`, `halls`, `tickets`); pre-aggregates operational metrics into `theatre_dashboard_materialized_metrics`, eliminating database lock contention and query latency under peak box-office traffic.
- 🧩 **Metadata-Driven Widget Registry (`lib/dashboard/widget-registry.ts`):**
  - Declarative widget registry defining 10 core operational widgets: Revenue Overview, Booking Quotas, Auditorium Occupancy, Screen Status Summary, Live Shows & Starting Soon, Payment Settlements, Operational Alerts, Activity Stream, Quick Actions, and System Health.
  - Gated by capability-based RBAC permissions (e.g. `reports:read`, `shows:read`, `halls:read`, `payments:read`, `settings:read`); automatically conceals financial widgets from screen managers.
- 🎨 **Per-User Dashboard Personalization (`user_dashboard_preferences`):**
  - Decoupled layout preferences stored per operator: visible widgets, customized display order, collapsed widget states, pinned favorites, and default date preset filters (`TODAY`, `YESTERDAY`, `THIS_WEEK`, `THIS_MONTH`).
  - Completely decoupled from theatre configuration, ensuring every operator customizes their operational workspace independently.
- 🌍 **Multi-Tenant Autonomous Localization:**
  - Automatically formats metrics according to each theatre's profile:
    - **Theatre A (Pune `th-pun-001`):** INR (`₹`), Indian numbering (Lakhs/Crores), `Asia/Kolkata` (12H), ₹1,25,000 Today's Revenue, 420 Bookings, 82% Occupancy.
    - **Theatre B (Mumbai `th-mum-001`):** USD (`$`), International numbering (Millions), `America/New_York` (12H), $8,420 Today's Revenue, 215 Bookings, 61% Occupancy.
    - **Theatre C (Dubai `th-dxb-001`):** AED (`AED `), International numbering, `Asia/Dubai` (24H), AED 32,400 Today's Revenue, 170 Bookings, 74% Occupancy.
- 🚨 **Real-Time Operational Alerts & Activity Stream (`dashboard_activity_feed`):**
  - Highlights screenings starting in $<60\text{m}$ with $>90\%$ seat occupancy, hardware maintenance alerts, and live operational activity audit stream.
- 💻 **Developer Notes:**
  - **Multi-Tenant Isolation:** Enforced via `tenantService.assertTenantAccess`; cross-tenant requests are strictly blocked and logged to the security audit bus.
  - **Audit Logging & Caching:** Invalidation of `THEATRE_DASHBOARD` and `DASHBOARD_PREFERENCES` cache tags upon mutations.
- 📚 **Theatre Dashboard Architecture Guide:** Detailed technical documentation in [`docs/THEATRE_DASHBOARD_ARCHITECTURE.md`](./docs/THEATRE_DASHBOARD_ARCHITECTURE.md).

### 2.29 Phase 3 - Part 12: Theatre Search & Filters Engine (Completed)
- 🔍 **Dedicated Search Index Layer (`TheatreSearchDocument`, `theatre_search_index`):**
  - Models $\text{Platform} \to \text{Search Engine} \to \text{Theatre Search Index} \to \text{Search API} \to \text{Theatre Search UI}$.
  - Completely decouples search from slow, locking multi-table SQL `LIKE` queries by aggregating searchable data from Theatre Profile, Location & Geography, Business Identity, Technical Amenities, Lifecycle/Approval Status, Primary Staff Admin, and Operating Localization Parameters into an indexed document structure.
- 🏗️ **Generic Search Framework & Contracts (`types/theatre-search.types.ts`):**
  - Defines generic search contracts (`GenericSearchQuery`, `GenericSearchResults`, `FacetBucket`, `GenericPaginationResult`) engineered for plug-and-play migration to dedicated search engines (Elasticsearch, Meilisearch, Algolia) without modifying UI components or server actions.
- ⚡ **Weighted Relevance Scoring & Punctuation-Preserving Tokenizer (`lib/search/search-query-builder.ts`):**
  - Tokenizes queries while preserving email dots/at-symbols and statutory tax identifiers; scores matches by field weight: Names & Slugs ($W=10$), Codes & Legal Names ($W=8$), Tax/GST credentials ($W=7$), Cities/Addresses ($W=5$), Primary Admin contact ($W=4$), and Technical Amenities ($W=3$).
- 🎛️ **Multi-Faceted Filtering & Dynamic Bucket Distributions:**
  - Real-time multi-select facets for Lifecycle Status (`ACTIVE`, `PENDING_APPROVAL`, `SUSPENDED`, `ARCHIVED`, `DRAFT`), Verification Badge, Circuit Tier (`PREMIUM` vs `STANDARD`), Chain Type (`CHAIN` vs `INDEPENDENT`), Business Categories, Geographic Regions (State/City/Country), Amenities (Dolby Atmos, IMAX, 4DX, VIP Lounge), Screen Count range, and Seating Capacity bounds.
- 🔄 **Deterministic Multi-Attribute Sorting:**
  - 8 distinct sorting strategies: `NEWEST` (Creation Date Desc), `OLDEST` (Creation Date Asc), `NAME_ASC` (A-Z), `NAME_DESC` (Z-A), `MOST_SCREENS`, `LARGEST_CAPACITY`, `RECENTLY_UPDATED`, and future distance sort placeholder (`DISTANCE_ASC`).
- 💾 **Enterprise Saved Searches & Presets Management (`SavedSearchPreset`):**
  - Per-operator search filter and sort presets persisted and recalled seamlessly (e.g. *"Pending Approval Theatres"*, *"Premium Circuits in Maharashtra"*).
- 🛡️ **Strict RBAC & Tenant Boundary Gating:**
  - Public patrons/guests are strictly restricted to `ACTIVE` and `isVerified: true` venues at the domain service layer. Super Administrators retain full visibility across pre-launch, suspended, and archived multiplexes.
  - Full audit logging via `securityAuditService.recordAudit` and high-resolution latency tracking (`tookMs`).
- 📚 **Theatre Search & Filters Guide:** Detailed technical documentation in [`docs/THEATRE_SEARCH_AND_FILTERS_ARCHITECTURE.md`](./docs/THEATRE_SEARCH_AND_FILTERS_ARCHITECTURE.md).

### 2.30 Phase 3 - Part 13: Public Theatre Page Read Model (Completed)
- 🌐 **Dedicated Public Content Layer & Read Model (`PublicTheatreView`):**
  - Models $\text{Platform} \to \text{Public Content Layer} \to \text{Theatre Public View} \to \text{Public Theatre Page}$.
  - Completely decouples the customer-facing website from raw operational modules (`theatres`, `movies`, `halls`, `shows`, `amenities`, `contacts`, `business`, `payments`) by aggregating an immutable, sanitized read model containing only public-facing information.
- 🛡️ **Zero Sensitive Data Leakage Perimeter:**
  - Guarantees complete information disclosure protection: strictly excludes internal corporate credentials (GSTIN, PAN, CIN), staff rosters, payment merchant VPAs, gateway secrets, internal seat hold lock intervals, refund policy formulas, and audit logs.
- 🚦 **Content Visibility & Compliance State Machine:**
  - Strict publication gating: public guests are immediately served `404 NotFoundError` for non-published venues (`DRAFT`, `PENDING_APPROVAL`, `SUSPENDED`, `ARCHIVED`). Authorized administrators (`SUPER_ADMIN` or `THEATRE_ADMIN`) can preview unapproved venues in preview mode with full audit logging (`securityAuditService.recordAudit`).
- 🌍 **Autonomous Multi-Tenant Localization:**
  - Displayed values automatically use the venue's own configuration without platform hardcoding:
    - **Theatre A (Pune `th-pun-001`):** Currency `INR` (`₹`), Timezone `Asia/Kolkata`, Indian number formatting (Lakhs/Crores), Ticket price displayed like `₹280`.
    - **Theatre B (Mumbai `th-mum-001`):** Currency `USD` (`$`), Timezone `America/New_York`, International formatting (Millions), Ticket price displayed like `$18.50`.
    - **Theatre C (Dubai `th-dxb-001`):** Currency `AED` (`AED `), Timezone `Asia/Dubai`, International formatting, Ticket price displayed like `AED 45`.
- ⚡ **Next.js 15 Server Component with ISR & Schema.org JSON-LD:**
  - Server-rendered page route (`/theatre/[slug]`) with `revalidate = 3600` (1-hour ISR) and tagged cache invalidation (`PUBLIC_THEATRE_VIEW:<slug-or-id>`).
  - Dynamic SEO metadata generation and Schema.org `MovieTheater` JSON-LD structured data injection.
- 🎨 **Modular Luxury UI Components (`components/public-theatre/`):**
  - Hero with verification badge and Google Maps routing, 4-card Quick Specs, About & Story, Running Movies & Premieres separation, Available Shows with format tags & seat quotas, Auditorium Fleet breakdown (Laser 4K, 12-ch / 64-ch spatial audio), Public Amenities with facility metadata, Lightbox Architectural Gallery, Live Operating Hours with 7-day schedule, Multi-desk Public Contact directory, and Non-functional Reviews architecture placeholder.
- 📚 **Public Theatre Page Architecture Guide:** Detailed technical documentation in [`docs/PUBLIC_THEATRE_PAGE_ARCHITECTURE.md`](./docs/PUBLIC_THEATRE_PAGE_ARCHITECTURE.md).

### 2.31 Phase 3 - Part 14: Platform Security & Governance Layer (Completed)
- 🛡️ **Unified Security & Governance Architecture (`TheatreGovernanceService`, `theatre_governance`):**
  - Models $\text{Platform} \to \text{Security \& Governance Layer} \to \text{Authorization} \to \text{Validation Pipeline} \to \text{Audit Engine} \to \text{Activity History} \to \text{Version Control} \to \text{Soft Delete} \to \text{Monitoring Hooks} \to \text{All Modules}$.
  - Centralizes security, ownership validation, policy authorization, and audit logging into a single source of truth across all cinema modules (Theatres, Movies, Halls, Shows, Staff, Bookings, Payments).
- 📜 **Policy-Based Authorization Framework (`theatre-security-policies.ts`):**
  - Declarative policy rules (`canManageTheatre`, `canPublishTheatre`, `canUploadMedia`, `canManageStaff`, `canSoftDeleteResource`, etc.) evaluated against the Phase 2 RBAC matrix and role hierarchy, eliminating scattered ad-hoc role checks.
- 🚦 **Central 9-Stage Validation Pipeline Engine (`ValidationPipeline`):**
  - Executes mutations in strict, deterministic order:
    1. Authentication Check $\to$ 2. Policy-Based Authorization $\to$ 3. Tenant Boundary Isolation $\to$ 4. Resource Ownership Validation $\to$ 5. Input Sanitization & Zod Validation $\to$ 6. Theatre-Specific Business Rules $\to$ 7. Optimistic Concurrency Control (OCC) $\to$ 8. Domain Operation Execution $\to$ 9. Domain Event Auditing & Activity History Recording.
- 🏢 **Multi-Tenant Boundary Isolation & Ownership Validation (`OwnershipValidator`):**
  - Strictly asserts that resources belong to the target theatre complex before mutation. Prevents cross-tenant access with `OwnershipError` and `TenantAccessError`.
- 📁 **Media Validation with Dynamic Theatre Limits (`MediaValidator`):**
  - Dynamically enforces upload quotas configured per venue: Theatre A (Pune) 20 MB, Theatre B (Mumbai) 50 MB, Theatre C (Dubai) 10 MB; path traversal defense, allowed MIME validation, virus scanning, and CDN validation stubs.
- 🧮 **Optimistic Concurrency Control (OCC) & Soft Delete Engine:**
  - Resource version increments with ETag placeholders and automatic $409$ `ConflictError` detection preventing concurrent overwrite anomalies.
  - Reusable soft delete with `deletedAt`, `deletedBy`, and non-destructive restoration (`isDeleted: false`). Permanent purge is strictly restricted to Super Admin.
- 📜 **Domain Event Auditing & Chronological Activity History:**
  - Emits structured `DomainSecurityEvent` records to an immutable audit store and updates operator activity history with full correlation tracking.
- ⏱️ **Endpoint-Specific Sliding-Window Rate Limiting (`checkEndpointRateLimit`):**
  - Configurable rate limits across `AUTH_REQUESTS`, `MEDIA_UPLOADS`, `SEARCH_REQUESTS`, `CONFIGURATION_UPDATES`, `DASHBOARD_REFRESH`, and `PUBLIC_PAGE_REQUESTS` with automatic 429 `RateLimitError` mitigation and retry windows.
- 📡 **Platform Security Monitoring Hooks (`SecurityMonitoringHookRegistry`):**
  - Extensible telemetry hooks (`onDomainSecurityEvent`, `onPolicyDenied`, `onTenantViolation`, `onOwnershipViolation`, `onRateLimitExceeded`, `onConcurrencyConflict`) for external monitoring, alerting, and SIEM readiness.
- 📚 **Platform Security & Governance Guide:** Detailed technical documentation in [`docs/THEATRE_SECURITY_AND_GOVERNANCE_ARCHITECTURE.md`](./docs/THEATRE_SECURITY_AND_GOVERNANCE_ARCHITECTURE.md).

### 2.32 Phase 3 - Part 15: Reports & Analytics Layer (Completed)
- 📊 **Dedicated Analytics & Reporting Layer (`theatre_analytics_aggregates`, `theatre_reports`):**
  - Models $\text{Platform} \to \text{Analytics Engine} \to \text{Revenue / Occupancy / Halls / Movies / Bookings / Customers / Payments / Growth / KPIs / Report Builder} \to \text{Reports UI}$.
  - Strictly decouples historical reporting from real-time operational dashboards (Part 11) and transactional tables (`Bookings`, `Payments`, `Shows`, `Halls`), preventing database lock contention and query degradation.
- 🧮 **Centralized Metric Registry & Canonical KPI Formulas (`lib/analytics/`):**
  - Defines pure, immutable mathematical formulas in `KpiEngine`: Occupancy Rate %, Average Ticket Value (ATV), Revenue Per Available Seat (RevPAS), Hall Utilization %, Cancellation Rate %, Payment Gateway Success Rate %, and Period Growth Rate (MoM/YoY).
  - Central `MetricRegistry` catalog mapping measures, canonical formulas, and localized formatting engines.
- 📋 **Configurable Report Definitions Registry (`ReportDefinitionRegistry`):**
  - Declarative metadata templates spanning 10 strategic categories:
    1. `REVENUE_REPORTS`: Daily, weekly, monthly, yearly gross/net revenue, ATV, RevPAS, and dimensional splits.
    2. `OCCUPANCY_REPORTS`: Seat occupancy %, capacity audits, peak (18:00–21:00) vs low (10:00–13:00) periods.
    3. `HALL_PERFORMANCE`: Screen-by-screen gross revenue, ticket yield, and top vs least performing screens.
    4. `MOVIE_PERFORMANCE`: Box office collections, admissions, show counts, and attendance matrices.
    5. `BOOKING_TRENDS`: Confirmed admissions vs cancellations, cancellation rates, and hourly booking demand.
    6. `CUSTOMER_ANALYTICS`: New vs returning patron retention, visit frequency, and average customer spend.
    7. `PAYMENT_ANALYTICS`: Payment rails (UPI, Card, NetBanking, Cash), gateway success rates, and reconciliations.
    8. `THEATRE_GROWTH`: Month-over-month growth rates for revenue, bookings, customers, and occupancy.
    9. `OPERATIONAL_KPIS`: Screen turnaround efficiency, turnstile throughput, and staff productivity metrics.
    10. `EXECUTIVE_SUMMARY`: Board briefings, headline KPIs, top revenue drivers, and ranking scorecards.
- 🌍 **Autonomous Multi-Tenant Boundary Isolation & Venue Localization:**
  - Strict tenant scoping prevents cross-theatre data leakage (`TenantAccessError`). Multi-venue localization preserves local currency, timezone, and number formats:
    - **Theatre A (Pune `th-pun-001`):** Currency `INR` (`₹`), Timezone `Asia/Kolkata`, Indian numbering (Lakhs & Crores: `₹1,84,50,000`).
    - **Theatre B (Mumbai `th-mum-001`):** Currency `USD` (`$`), Timezone `America/New_York`, International numbering (`$479,700`).
    - **Theatre C (Dubai `th-dxb-001`):** Currency `AED` (`AED `), Timezone `Asia/Dubai`, Arabic/English language formatting.
- 📤 **Universal Report Builder & Export Serializers:**
  - Dynamically synthesizes headline KPI summary cards, visual chart series (Line, Bar, Pie), and granular breakdown rows.
  - Multi-format export engine supporting CSV (with quoted headers and venue metadata), JSON, and PDF stubs.
- 🖥️ **Responsive Luxury Operator Workspace (`app/(theatre-admin)/theatre/reports/`):**
  - Horizontal category selector across 10 strategic domains, date range presets (`TODAY`, `YESTERDAY`, `THIS_WEEK`, `THIS_MONTH`, `THIS_YEAR`), live telemetry refresh, CSV download trigger, historical snapshot archives, and modal inspector.
- 📚 **Reports & Analytics Guide:** Detailed technical documentation in [`docs/THEATRE_REPORTS_AND_ANALYTICS_ARCHITECTURE.md`](./docs/THEATRE_REPORTS_AND_ANALYTICS_ARCHITECTURE.md).

### 2.33 Phase 3 - Part 16: Enterprise Extension Framework (Completed)
- 🧩 **Enterprise Extension Framework Architecture (`lib/enterprise/`):**
  - Models $\text{Platform Core} \to \text{Enterprise Extension Framework} \to \text{8 Sub-Platforms} \to \text{Independent Enterprise Modules}$.
  - Strictly decouples future business capabilities (VIP memberships, loyalty rewards, franchise management, dynamic pricing) and infrastructure capabilities (IoT auditorium hardware, digital signage, kiosks, external developer APIs, multi-region stacks) from core cinema operations.
- 📡 **Decoupled Domain Event Bus (`EnterpriseDomainEventBus`):**
  - Asynchronous event pub/sub kernel dispatching domain events (`BOOKING_CREATED`, `PAYMENT_COMPLETED`, `SHOW_CREATED`, `THEATRE_ACTIVATED`, `DEVICE_TELEMETRY_RECORDED`, `PRICING_SURGE_TRIGGERED`, etc.).
  - Supports priority subscriber execution (100 -> 50 -> 10), predicate-based filtering, subscriber error isolation, and historical event replay buffer.
- 🎛️ **4-Tier Hierarchical Feature Flag Precedence (`EnterpriseFeatureFlagManager`):**
  - Centralized feature flag evaluation cascading through 5 levels:
    $$\text{Tier 1: User / Staff Override} \succ \text{Tier 2: Theatre Override} \succ \text{Tier 3: Organization Override} \succ \text{Tier 4: Platform Switch} \succ \text{Default}$$
  - Deterministic canary rollout hashing for phased staged deployments (0% to 100%).
- 🔌 **Pluggable Extension SDK Kernel (`EnterpriseExtensionRegistry`):**
  - Declarative manifests, dependency validation, and formal lifecycle hooks (`onInstall`, `onEnable`, `onDisable`, `onUpgrade`).
  - Dynamic route aggregation (`registerRoutes`), security permission injection (`registerPermissions`), and background recurring cron jobs (`registerBackgroundJobs`).
- 🏢 **8 Enterprise Sub-Platforms & Reference Module Implementations:**
  1. **Organization Platform:** Multi-branch circuits, regional offices, branch groups, franchise revenue sharing (e.g. 12.5% royalty), and B2B corporate credit accounts.
  2. **Customer Experience:** VIP Cinema Passports (Gold, VIP Black), spend-based reward points ledger, and promotional digital gift cards.
  3. **Pricing Engine:** Rule-based demand surge (+25% peak weekend), occupancy thresholds, and early-bird morning discounts (-15%).
  4. **Device Platform (IoT):** Auditorium environmental sensors, projector lamp hours telemetry, lobby digital signage playlists, and smart ticketing kiosks.
  5. **AI Platform (Stubs):** Collaborative movie recommendation, optimal seat allocation, and concession upsell recommendation stubs.
  6. **Integration Platform:** Developer API keys, granular API scopes (`SHOWS_READ`, `BOOKINGS_WRITE`), and asynchronous webhook subscriptions.
  7. **Regional Platform:** Multi-region deployment configurations, statutory tax frameworks (GST, VAT, Sales Tax), and multi-currency stacks.
  8. **Extension SDK:** Pluggable runtime kernel managing lifecycle execution and background cron tasks.
- 🖥️ **Super Admin Enterprise Workspace (`app/(super-admin)/dashboard/extensions/`):**
  - 8-Platform Architecture Matrix, Installed Extension Modules Manager with live toggles, Interactive 4-Tier Feature Flag Hierarchy Simulator with real-time override injection, Dynamic Pricing Surge Evaluator, Connected IoT Hardware Registry, and Live Domain Event Bus Telemetry Stream.
- 📚 **Enterprise Extension Framework Guide:** Detailed technical documentation in [`docs/ENTERPRISE_EXTENSION_FRAMEWORK_ARCHITECTURE.md`](./docs/ENTERPRISE_EXTENSION_FRAMEWORK_ARCHITECTURE.md).

### 2.34 Phase 4 - Part 1: Hall Designer Foundation & Immutable Layout Definition Layer (Completed)
- 🏛️ **Immutable Layout Definition Layer (`lib/repositories/hall-designer.repository.ts`):**
  - Establishes the Layout Definition layer as the immutable source of truth:
    $$\text{Theatre} \to \text{Hall} \to \text{Layout Definition} \to \text{Draft / Published / Archived Versions} \to \text{Validation Engine} \to \text{Published Layout} \to \text{Seat Inventory} \to \text{Show Seat Inventory} \to \text{Booking Engine} \to \text{Ticket System}$$
  - The Hall Designer strictly never edits live layouts directly; all in-progress changes are isolated in `DRAFT` versions, guaranteeing that in-flight shows and active customer bookings query only the current `PUBLISHED` version without experiencing ghost seating or coordinate desynchronization.
- 🔄 **Layout Versioning Lifecycle State Machine:**
  - `DRAFT` ➔ `PUBLISHED` ➔ `ARCHIVED` ➔ `INACTIVE` ➔ `DEPRECATED`.
  - Publishing automatically transitions the previous live version to `ARCHIVED`, maintaining a complete audit trail. Future shows instantiate seats from the new version, while existing bookings remain permanently linked to the version they were booked with.
- 🛡️ **Pure Layout Validation Engine (`lib/engine/layout-validator.ts`):**
  - Mathematical integrity verification before publishing: duplicate seat numbers, coordinate collisions, section referential integrity, seat count parity, grid boundary clearance, curved screen orientation, and legal status transitions.
- 🗄️ **Multi-Tenant Persistence Schema (`db/schema/hall-designer.ts`):**
  - PostgreSQL schema for `layoutDefinitions` and `layoutVersions` with foreign keys to `theatres` and `halls`, UUID tracking, and optimistic version incrementing.

### 2.35 Phase 4 - Part 2: Visual Canvas & Multi-Density Grid System Engine (Completed)
- 📐 **Visual Canvas & Grid Engine (`lib/engine/canvas-grid-engine.ts`):**
  - Infinite canvas with smooth pan & zoom viewport controls (0.2x to 3.0x zoom, dynamic fit-to-screen bounds calculation, reset).
  - Multi-density snapping grid: Small (10px), Medium (20px), and Large (40px) with configurable snap strength threshold.
  - Multi-unit measurement conversion engine converting between Pixels (`PX`), Centimeters (`CM`), Feet (`FT`), and Meters (`M`).
  - Geometric seat alignment tools: Align Left, Align Right, Align Top, Align Bottom, Center Horizontally, Center Vertically, Distribute Horizontally, and Distribute Vertically.
  - Smart alignment guides detecting horizontal and vertical alignments within guide thresholds.
- 🏢 **Theatre-Specific Canvas Preferences Persistence (`canvasPreferences`):**
  - Stores custom grid defaults per theatre:
    - **Pune Venue (`th-pun-001`):** 20px grid (Medium), 100% zoom, `PX` unit, Snap ON (8px).
    - **Mumbai Venue (`th-mum-002`):** 10px grid (Small/High-density), 75% zoom, `CM` unit, Snap OFF.
    - **Dubai Venue (`th-dxb-003`):** 25px grid (Large), 125% zoom, `FT` unit, Snap ON (10px).
- 🖥️ **Interactive Luxury Hall Designer Canvas (`app/(theatre-admin)/theatre/halls/designer/`):**
  - Visual cinema screen banner, multi-section color-coded seating matrix, emergency exit indicators, walkway guides, viewport HUD, and collapsible sidebars for Version History, Section Capacity, and Theatre Preferences.
- 📚 **Hall Designer Architecture Guide:** Detailed technical documentation in [`docs/HALL_DESIGNER_ARCHITECTURE.md`](./docs/HALL_DESIGNER_ARCHITECTURE.md).

### 2.36 Phase 4 - Part 3: Section Designer Studio (Completed)
- 🏛️ **Hierarchical DDD Section Layer (`lib/repositories/section-row.repository.ts`, `lib/services/section-row-designer.service.ts`):**
  - Establishes the structural section layer between Hall Layout Definitions and Rows:
    $$\text{Layout Definition} \to \text{Section} \to \text{Row} \to \text{Seat}$$
  - Rows belong strictly to Sections (never directly to the Hall or Layout Definition), allowing each section to maintain completely independent geometries, category tiers, and naming behaviors without polluting the hall model.
  - Multi-tenant Section CRUD, duplication, cascading row deletion, priority ranking, and spatial positioning `(x, y)`.
  - Multi-geometry boundaries: `RECTANGLE`, `CURVED` (radius & arc angle), `ARC`, `POLYGON`, and `IRREGULAR`.
  - Configurable section label orientations: `TOP`, `BOTTOM`, `LEFT`, `RIGHT`, `CENTER`, and `HIDDEN`.
  - Seat category tier assignments: `Standard`, `Recliner`, `VIP`, `Couple`, `Wheelchair`, and `Sofa`.
  - Display reordering operations: `UP`, `DOWN`, `TOP`, and `BOTTOM`.

### 2.37 Phase 4 - Part 4: Row Designer Engine & Sequencing Studio (Completed)
- 🪑 **Row Designer & Mathematical Geometry Engine (`lib/engine/section-row-engine.ts`, `lib/engine/section-row-validator.ts`):**
  - Scope-isolated row generation belonging strictly to sections.
  - Auto-numbering and sequencing engine:
    - `ALPHABETICAL`: Standard single/double-letter progression (`A`–`Z`, `AA`–`AZ`).
    - `NUMERIC`: Sequential integer progression (`1`–`20`).
    - `ROMAN`: Roman numeral sequencing (`I`–`XX`).
    - `CUSTOM`: Venue-specific sequences with custom start/end indices.
    - Reverse numbering support (`isReversed: true`) for flipped patron perspective.
    - Configurable prefixes and suffixes (e.g. `VIP-A1`, `A1-W`).
  - Spatial Coordinate Mathematics:
    - Straight rows: Uniform horizontal pitch progression.
    - Curved / Arc rows: Circular arc radial distribution conforming to arc sagitta $R(1 - \cos \theta_c)$.
    - Angled rows: Inclined coordinate vectors applying trigonometric rotation $\cos \theta, \sin \theta$.
  - Row accessibility tiers: `STANDARD`, `WHEELCHAIR` ♿, `COMPANION`, `RESERVED`, `EMERGENCY_CLEARANCE`, and `HIDDEN`.
  - Row-level category overrides (e.g., wheelchair berth in standard section).
  - Validation engine: Unique row name within section, strictly positive spacing ($>0$), non-zero seat counts, sequence consistency, and tenant isolation.
  - Multi-venue initial seeds: Pune (VIP Red, A–C, 1.0m spacing, Alphabetical), Mumbai (Luxury Purple, 1–20, 0.9m spacing, Numeric), Dubai (Balcony Blue, AA–AZ, 1.2m spacing, Custom).
- 📚 **Section & Row Designer Architecture Guide:** Detailed technical documentation in [`docs/SECTION_AND_ROW_DESIGNER_ARCHITECTURE.md`](./docs/SECTION_AND_ROW_DESIGNER_ARCHITECTURE.md).

### 2.38 Phase 4 - Part 5: Automatic Seat Generator & Physical Coordinates (Completed)
- 🪑 **Automatic Seat Generation Engine (`lib/engine/seat-generator-engine.ts`, `lib/repositories/seat-generator.repository.ts`):**
  - Decouples editable Seat Templates from physical runtime Seat Inventory.
  - Generates immutable permanent internal UUIDs for every seat template (`crypto.randomUUID()`).
  - Mathematical Coordinate Precision:
    - Straight rows: Uniform horizontal pitch progression.
    - Curved rows: Circular arc sagitta depth calculation $y_c = y_0 + R(1 - \cos \theta_c)$ and tangential rotation.
    - Angled rows: Coordinate projection along vector angles $(\cos \phi, \sin \phi)$.
  - Configurable numbering styles: Numeric, Alphabetic, Alphanumeric, Roman numerals, Custom, reversed, and skip numbers (e.g. skip 13).
  - Accessibility classification: Wheelchair berths, companion seat anchoring, accessible route tags, reserved tiers, and technical hidden seats.
  - Spatial collision detection checking Euclidean distances and duplicate seat code prevention.

### 2.39 Phase 4 - Part 6: Dynamic Seat Category Registry & Decoupled Pricing (Completed)
- 🏷️ **Dynamic Category Registry System (`db/schema/seat-generator.ts`, `lib/services/seat-generator.service.ts`):**
  - Database-driven registry replacing hardcoded enums, allowing circuits to define unlimited custom categories (*Kids*, *Luxury*, *Executive*, *Private Box*, *Accessible Premium*).
  - **Decoupled Pricing Law:** Categories define classification, spatial aesthetics, and priorities only; ticket pricing is strictly resolved per show by the Show Pricing Engine.
  - Category lifecycle management: Create, update, duplicate, archive, and restore.
  - Multi-venue category configurations: Pune (VIP Red, Recliner Gold, Executive Green, Standard Blue, Wheelchair Purple), Mumbai (Luxury Purple, IMAX Prime Indigo, Economy Slate), Dubai (Majlis Private Box Gold, Grand Recliner Rose, Balcony Blue).
  - Caching performance hook [`useSeatGenerator`](./lib/hooks/use-seat-generator.ts) with in-memory cache refs and optimistic UI updates.
- 📚 **Seat Generator & Category Architecture Guide:** Detailed technical documentation in [`docs/SEAT_GENERATOR_AND_CATEGORIES_ARCHITECTURE.md`](./docs/SEAT_GENERATOR_AND_CATEGORIES_ARCHITECTURE.md).

### 2.40 Phase 4 - Part 7: Structural Objects & Physical Architecture (Completed)
- 🏛️ **Unified Layout Object Model (`types/structural-objects.types.ts`, `db/schema/structural-objects.ts`):**
  - Models structural infrastructure as polymorphic, first-class layout objects independent from sections, rows, and seats:
    $$\text{Layout Definition} \longrightarrow \text{Layout Objects} \longrightarrow \text{Structural Objects} \longrightarrow \text{Validation Engine} \longrightarrow \text{Published Layout}$$
  - Full support for 13 architectural structural objects: `STAGE`, `SCREEN`, `ENTRANCE`, `EXIT`, `EMERGENCY_EXIT`, `WALL`, `DIVIDER`, `BALCONY`, `STAIRS`, `AISLE`, `ACCESSIBLE_PATH`, `PILLAR`, and `CONTROL_ROOM`.
  - Object configuration: `objectName`, `displayName`, `internalCode`, `position (x, y, z)`, `width`, `height`, `rotation`, `layer`, `zIndex`, `visibility`, `color`, and `metadata`.
  - Behavior & Safety Flags: `isStatic`, `isCollisionObstacle`, `isReservedArea`, fire ratings, egress capacity, and ADA wheelchair turning clearance.
  - Spatial math engine ([`lib/engine/structural-object-engine.ts`](./lib/engine/structural-object-engine.ts)): Rotated 2D bounding boxes and Separating Axis Theorem (SAT) collision detection between structural obstacles and seat templates.
  - Caching performance hook [`useStructuralObjects`](./lib/hooks/use-structural-objects.ts) with in-memory cache refs, memoized selectors, and optimistic UI updates.

### 2.41 Phase 4 - Part 8: Geometry & Advanced Layout Engine (Completed)
- 📐 **Computational Geometry Engine (`lib/engine/geometry-engine.ts`, `db/schema/geometry-layout.ts`):**
  - 2D Affine transformation pipeline: Translation, Rotation, Scaling, Reflection/Mirroring, and Affine Matrix transforms.
  - Curvature & Sagitta Arc Mathematics: Sagitta depth $s = R(1 - \cos(\Delta\theta / 2))$, inverse radius $R = \frac{s}{2} + \frac{W^2}{8s}$, and arc row seat coordinate generation.
  - Spatial Alignment & Equal Distribution: Align Left, Top, Right, Bottom, Center X, Center Y; Distribute Horizontally and Vertically.
  - Reversible command history stack (`GeometryTransformCommand`) with full Undo/Redo pipeline and structured audit logging.
  - **Preflight Publication Validation Gate (`validateLayoutBeforePublish`):**
    - Mandatory Screen check, Emergency Exit presence, Entrance/Foyer check, Wheelchair Accessible Path clearance, zero structural obstacle collisions, bounds compliance, and section/row capacity parity.
  - Theatre-specific geometry configurations: Pune (Curved VIP & Arc Rows allowed), Mumbai (Straight layout & Symmetrical mirroring enabled), Dubai (Curved Balcony & Custom shapes enabled).
  - Caching hook [`useGeometryEngine`](./lib/hooks/use-geometry-engine.ts) for transform pipelines and preflight audits.
- 📚 **Structural Objects & Geometry Architecture Guide:** Detailed technical documentation in [`docs/STRUCTURAL_OBJECTS_AND_GEOMETRY_ARCHITECTURE.md`](./docs/STRUCTURAL_OBJECTS_AND_GEOMETRY_ARCHITECTURE.md).

### 2.42 Phase 4 - Part 9: Multi-Mode Hall Preview Engine & Simulation Studio (Completed)
- 🖥️ **Multi-Mode Hall Preview Engine (`lib/engine/hall-preview-engine.ts`, `db/schema/hall-preview.ts`):**
  - Decoupled preview engine supporting 5 dedicated operational modes:
    - `CUSTOMER`: Patron booking portal experience; hides internal pillars, backstage doors; categorizes seats with prices and colors.
    - `THEATRE`: Usher and on-site staff operations; renders all doors, aisles, stairs; colors seats by section.
    - `ADMIN`: Engineering and technical inspection; displays 100% of physical objects, bounding boxes, and maintenance statuses.
    - `ACCESSIBILITY`: Regulatory ADA inspection; de-emphasizes standard seats; highlights wheelchair bays (cyan + ♿) and companion seats (gold + ⭐).
    - `BOOKING_SIMULATION`: Interactive booking simulation cart; allows clicking seats, calculates pricing sub-totals, and tracks 10-minute hold expiration timer.
  - Responsive Viewport Scaling: `DESKTOP`, `LAPTOP`, `TABLET`, `MOBILE` with mathematical `fitZoom` and pan centering calculations.
  - Visual Theme Customization: OLED Cinema Void (`DARK`), Architectural Blueprint (`LIGHT`), High-Contrast Gold (`HIGH_CONTRAST`), and Deep Sapphire (`MIDNIGHT`).
  - Real-time Auditorium Statistics: Total seats, wheelchair bays, companion seats, screens, emergency exits, and estimated maximum auditorium gross revenue.
  - Multi-tenant preview preferences (`th-pun-001`, `th-mum-002`, `th-dxb-003`) and caching React hook [`useHallPreview`](./lib/hooks/use-hall-preview.ts).

### 2.43 Phase 4 - Part 10: Pluggable Rule-Based Preflight Validation Engine & Publish Gate (Completed)
- 🛡️ **Pluggable Rule-Based Validation Engine (`lib/engine/hall-validation-engine.ts`, `db/schema/hall-validation.ts`):**
  - Central `ValidationRuleRegistry` singleton evaluating 10 built-in core rules:
    - `RULE_SCREEN_EXISTS` (ERROR): Enforces presence of at least 1 visible screen.
    - `RULE_EMERGENCY_EXIT_EXISTS` (WARNING): Enforces fire egress exits.
    - `RULE_ENTRANCE_EXIT_EXISTS` (WARNING): Validates foyer entrances and exits for customer wayfinding.
    - `RULE_ACCESSIBLE_PATH_CONNECTIVITY` (WARNING): Ensures wheelchair seats have designated accessible ramp paths.
    - `RULE_SEAT_DUPLICATE_CODES` (ERROR): Enforces strictly unique seat numbering.
    - `RULE_SEAT_COORDINATES_BOUNDS` (ERROR): Enforces canvas boundary containment.
    - `RULE_STRUCTURAL_OBSTACLE_COLLISION` (ERROR): Uses Separating Axis Theorem (SAT) to detect physical collisions between obstacles and seating.
    - `RULE_SECTION_CAPACITY_PARITY` (WARNING): Validates section capacity vs constituent row seats.
    - `RULE_SEAT_CATEGORY_ASSIGNMENT` (ERROR): Ensures all seats have assigned pricing categories.
    - `RULE_ROW_SPACING_INTEGRITY` (ERROR): Enforces positive legroom spacing ($\ge 20$px).
  - Multi-tenant regulatory policies: Pune Strict Municipal Code (`STRICT`), Mumbai Standard Cinema Code (`STANDARD`), Dubai Civil Defense & Luxury Code (`PREMIUM`).
  - Strict Pre-Publish Enforcement Gate (`validateBeforePublish`): Rejects publication with `ValidationError` if any `ERROR` severity rule fails.
  - Structured machine-readable and UI-friendly audit reports with affected objects and actionable remediation guidance.
  - Caching React hook [`useHallValidation`](./lib/hooks/use-hall-validation.ts) with real-time audit score cards and severity filters.
- 📚 **Hall Preview & Validation Architecture Guide:** Detailed technical documentation in [`docs/HALL_PREVIEW_AND_VALIDATION_ARCHITECTURE.md`](./docs/HALL_PREVIEW_AND_VALIDATION_ARCHITECTURE.md).

### 2.44 Phase 4 - Part 11: Layout Version Management (Completed)
- 📜 **Immutable Layout Versioning & Deep Diff Engine (`types/layout-versioning.types.ts`, `lib/engine/version-comparison-engine.ts`, `db/schema/layout-versioning.ts`):**
  - Production-grade immutable version registry: Published layout versions are permanently locked against direct editing (`isLocked: true`).
  - Modifications branch into clean, derived draft versions (`DRAFT` → `REVIEW` → `APPROVED` → `PUBLISHED` → `ARCHIVED` → `DEPRECATED`).
  - Pure mathematical `VersionComparisonEngine` evaluating deep section diffs, seat attribute/accessibility changes, structural infrastructure changes, grid geometries, and capacity delta with automatic breaking change detection.
  - Safe Rollback Engine: Restores previous configurations by generating a fresh derived draft version without mutating historical records.
  - Granular change history stream (`SEAT_CHANGED`, `SECTION_CHANGED`, `OBJECT_CHANGED`, `POLICY_CHANGED`, `ROLLBACK_EXECUTED`) with full actor attribution and security auditing.
  - Multi-tenant version policies: Pune (50 versions, rollback enabled), Mumbai (20 versions, release notes required), Dubai (unlimited versions, approval required).
  - Caching React hook [`useLayoutVersioning`](./lib/hooks/use-layout-versioning.ts) with version history fetching, draft branching, and visual diff analysis.

### 2.45 Phase 4 - Part 12: Publishing Workflow & Show Compatibility Layer (Completed)
- 🚀 **Atomic Publishing Pipeline & Show Compatibility Layer (`types/publishing-workflow.types.ts`, `lib/engine/publishing-pipeline-engine.ts`, `db/schema/publishing-workflow.ts`):**
  - Atomic publishing pipeline executing 9-point preflight validation gate: draft state, validation reports (0 blocking errors), screen presence, emergency fire exits, SAT obstacle collisions, unique seat numbering, section capacity parity, tenant ownership, and approval gates.
  - Strict Version Locking (`enforceVersionLock`) guarding published and archived layouts against direct mutation.
  - Multi-tenant publishing governance: Pune Instant (`ANYTIME`), Mumbai Regulated (`BUSINESS_HOURS` + approval), Dubai Strict (`OFF_PEAK` + scheduled publish).
  - Permanent publishing audit log tracking timestamps, publisher user ID, validation reports, and release notes.
  - **The Show Compatibility Layer (`show_layout_assignments`):**
    - **Historical Invariance:** Existing and completed shows continue serving the layout version assigned at creation time; layout modifications never alter past bookings or seat maps.
    - **Automatic Active Binding:** Newly created shows automatically bind to the active published layout version.
    - **Explicit Show Migration:** Supported, audited migration path for transferring existing shows to new layout versions with seat re-mapping and safety checks.
  - Caching React hook [`usePublishingWorkflow`](./lib/hooks/use-publishing-workflow.ts) managing live layout statuses, history timelines, and publishing execution.
- 📚 **Layout Versioning & Publishing Workflow Architecture Guide:** Detailed technical documentation in [`docs/LAYOUT_VERSIONING_AND_PUBLISHING_WORKFLOW_ARCHITECTURE.md`](./docs/LAYOUT_VERSIONING_AND_PUBLISHING_WORKFLOW_ARCHITECTURE.md).

### 2.46 Phase 4 - Part 13: Seat Inventory Integration (Completed)
- 🪑 **Blueprint-Driven Show Seat Inventory Snapshots (`types/seat-inventory-integration.types.ts`, `lib/engine/seat-inventory-engine.ts`, `db/schema/seat-inventory-integration.ts`):**
  - Decouples show seat inventory from CAD layouts:
    $$\text{Layout Definition} \longrightarrow \text{Published Layout Version} \longrightarrow \text{Seat Inventory Blueprint} \longrightarrow \text{Show Seat Inventory} \longrightarrow \text{Pricing / Booking / Ticket / Availability / Maintenance}$$
  - **Deterministic Internal Seat ID Derivation:** Computes SHA-256 hash digests (`isid-...`) from `theatreId:hallId:sectionId:rowName:seatNumber`, ensuring cross-module referential integrity.
  - **Dynamic Pricing Integration:** Does not hardcode prices; dynamically evaluates base pricing, show-time modifiers, and section fees via the Show Dynamic Pricing Engine.
  - **Granular Operational Statuses:** `AVAILABLE`, `RESERVED`, `BOOKED`, `BLOCKED`, `MAINTENANCE`, `DISABLED`. Maintenance seats are automatically hidden from patron booking.
  - **Strict Regeneration Guard:** Enforces that inventory cannot be regenerated or overwritten if active bookings exist (`bookedSeatsCount > 0`).
  - **Multi-Tenant Governance:** Pune (`th-pun-001` Automatic, Maintenance ON), Mumbai (`th-mum-002` Manual Approval, Maintenance OFF), Dubai (`th-dxb-003` Automatic, Strict).
  - Caching React hook [`useSeatInventoryIntegration`](./lib/hooks/use-seat-inventory-integration.ts) for real-time inventory inspection and status management.

### 2.47 Phase 4 - Part 14: Hall Templates (Completed)
- 🏛️ **Reusable Blueprint Engine & Template Inheritance (`types/hall-templates.types.ts`, `lib/engine/hall-template-engine.ts`, `db/schema/hall-templates.ts`):**
  - Generates independent `LayoutDefinition` and initial `LayoutVersion` (v1) entities from blueprint templates, mapping sections, seats, and structural objects with isolated IDs.
  - **Source Template Immutability:** Editing a generated layout never modifies the source blueprint template.
  - **8 Built-in Platform Templates Catalog:**
    1. `SMALL_THEATRE` (40 seats, 2 sections, boutique art-house cinema)
    2. `MULTIPLEX` (120 seats, 3 sections, standard commercial auditorium)
    3. `PREMIUM` (60 seats, 2 sections, luxury motorized recliner suite)
    4. `IMAX` (180 seats, 3 sections, curved stadium seating with massive screen)
    5. `4DX` (80 seats, 2 sections, motion-synchronized quad pods)
    6. `OPEN_AIR` (150 seats, 2 sections, outdoor amphitheatre / drive-in)
    7. `MINI_THEATRE` (24 seats, 1 section, private screening lounge / VIP suite)
    8. `AUDITORIUM` (250 seats, 4 sections, tiered flagship hall with presentation stage)
  - **Template Inheritance & Custom Templates:** Theatres can author custom templates or inherit from platform templates (`parentTemplateId`).
  - **Platform Read-Only Enforcement:** Platform templates are strictly immutable (`isBuiltIn: true`); mutations throw `TenantAccessError`.
  - **Multi-Tenant Isolation:** Custom venue templates are strictly isolated between theatre circuits.
  - Caching React hook [`useHallTemplates`](./lib/hooks/use-hall-templates.ts) managing template catalogs, duplication, archiving, and layout generation.
- 📚 **Seat Inventory & Hall Templates Architecture Guide:** Detailed technical documentation in [`docs/SEAT_INVENTORY_AND_HALL_TEMPLATES_ARCHITECTURE.md`](./docs/SEAT_INVENTORY_AND_HALL_TEMPLATES_ARCHITECTURE.md).


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

- 🪑 [`docs/SEAT_INVENTORY_AND_HALL_TEMPLATES_ARCHITECTURE.md`](./docs/SEAT_INVENTORY_AND_HALL_TEMPLATES_ARCHITECTURE.md) — Seat Inventory Integration & Hall Templates Architecture (Blueprint-Driven Show Seat Inventory Snapshots, Deterministic SHA-256 Internal Seat IDs, Decoupled Dynamic Pricing, Maintenance Statuses, Regeneration Guard, 8 Built-in Platform Templates Catalog, Template Inheritance, and Reusable Blueprint Layout Generation) (Phase 4 - Parts 13 & 14).
- 🚀 [`docs/LAYOUT_VERSIONING_AND_PUBLISHING_WORKFLOW_ARCHITECTURE.md`](./docs/LAYOUT_VERSIONING_AND_PUBLISHING_WORKFLOW_ARCHITECTURE.md) — Layout Version Management & Publishing Workflow Architecture (Immutable Version Registry, Deep Two-Way Diff Engine, Safe Rollback Branching, 9-Point Preflight Publishing Gate, Version Locking, Multi-Tenant Policies, and Show Compatibility Layer Guarantee) (Phase 4 - Parts 11 & 12).
- 🖥️ [`docs/HALL_PREVIEW_AND_VALIDATION_ARCHITECTURE.md`](./docs/HALL_PREVIEW_AND_VALIDATION_ARCHITECTURE.md) — Multi-Mode Hall Preview & Pluggable Preflight Validation Architecture (5 Operational Modes, Responsive Viewport Transformations, Visual Themes, Live Booking Simulation Cart, Central Rule Registry, 10 Core Validation Rules, Per-Theatre Policies, and Pre-Publish Gate) (Phase 4 - Parts 9 & 10).
- 📐 [`docs/STRUCTURAL_OBJECTS_AND_GEOMETRY_ARCHITECTURE.md`](./docs/STRUCTURAL_OBJECTS_AND_GEOMETRY_ARCHITECTURE.md) — Structural Objects & Advanced Geometry Architecture (First-Class Physical Infrastructure, Rotated SAT Collision Math, 2D Affine Transforms, Curvature & Sagitta Arc Mathematics, and Reversible Command History Pipeline) (Phase 4 - Parts 7 & 8).

- 🪑 [`docs/SEAT_GENERATOR_AND_CATEGORIES_ARCHITECTURE.md`](./docs/SEAT_GENERATOR_AND_CATEGORIES_ARCHITECTURE.md) — Automatic Seat Generator & Dynamic Category Registry Architecture (Immutable Seat UUID Identity, Straight/Curved/Angled Spatial Coordinates, Dynamic Category Registry, and Strict Decoupled Pricing Architecture) (Phase 4 - Parts 5 & 6).
- 🪑 [`docs/SECTION_AND_ROW_DESIGNER_ARCHITECTURE.md`](./docs/SECTION_AND_ROW_DESIGNER_ARCHITECTURE.md) — Section & Row Designer Architecture (Hierarchical DDD Section Layer, Row Sequencing & Auto-Numbering Engine, Straight/Curved/Arc/Angled Geometries, Accessibility Tiers, and Independent Venue Conventions) (Phase 4 - Parts 3 & 4).
- 🏛️ [`docs/HALL_DESIGNER_ARCHITECTURE.md`](./docs/HALL_DESIGNER_ARCHITECTURE.md) — Auditorium Hall Designer & Canvas Grid System Architecture (Immutable Layout Definition Layer, Draft vs Published vs Archived State Machine, In-Flight Booking Isolation, Pure Layout Validator, Multi-Density Grid Snapping, Unit Conversion Engine, Viewport Fit-To-Screen, Geometric Seat Alignment Tools & Per-Theatre Canvas Preferences) (Phase 4 - Parts 1 & 2).
- 🧩 [`docs/ENTERPRISE_EXTENSION_FRAMEWORK_ARCHITECTURE.md`](./docs/ENTERPRISE_EXTENSION_FRAMEWORK_ARCHITECTURE.md) — Enterprise Extension Framework Architecture (Pluggable 8 Sub-Platforms, Extension SDK Kernel, Lifecycle Hooks, 4-Tier Hierarchical Feature Flag Cascading, Deterministic Canary Rollouts, Decoupled Domain Event Bus Pub/Sub, IoT Device Registry & Multi-Region Stacks) (Phase 3 - Part 16).
- 📊 [`docs/THEATRE_REPORTS_AND_ANALYTICS_ARCHITECTURE.md`](./docs/THEATRE_REPORTS_AND_ANALYTICS_ARCHITECTURE.md) — Multi-Tenant Theatre Reports & Analytics Layer Architecture (Decoupled Historical BI Read-Model Store, Metric Registry, Pure KPI Engine, 10 Core Report Categories, Dimensional Slicing, Universal Report Builder, CSV/JSON Exporters & Multi-Tenant Boundary Isolation) (Phase 3 - Part 15).
- 🛡️ [`docs/THEATRE_SECURITY_AND_GOVERNANCE_ARCHITECTURE.md`](./docs/THEATRE_SECURITY_AND_GOVERNANCE_ARCHITECTURE.md) — Platform Security & Governance Layer Architecture (Policy-Based Authorization, Central 9-Stage Validation Pipeline, Multi-Tenant Boundary Isolation, Resource Ownership Validation, Dynamic Quota Engine, OCC Version Checks, Soft Delete & Domain Event Auditing) (Phase 3 - Part 14).
- 🌐 [`docs/PUBLIC_THEATRE_PAGE_ARCHITECTURE.md`](./docs/PUBLIC_THEATRE_PAGE_ARCHITECTURE.md) — Public Theatre Page Read Model Architecture (Public Content Layer, Read Model Aggregation, Zero Sensitive Data Leakage, Content Visibility State Machine, Multi-Tenant Localization, Next.js 15 ISR & Schema.org MovieTheater JSON-LD) (Phase 3 - Part 13).
- 🔍 [`docs/THEATRE_SEARCH_AND_FILTERS_ARCHITECTURE.md`](./docs/THEATRE_SEARCH_AND_FILTERS_ARCHITECTURE.md) — Multi-Tenant Theatre Search & Filters Engine Architecture (`TheatreSearchDocument`, `theatre_search_index`, Generic Search Framework, Weighted Multi-Field Scoring, Dynamic Facets, Multi-Attribute Sorter, Enterprise Saved Presets & RBAC Gating) (Phase 3 - Part 12).
- 📊 [`docs/THEATRE_DASHBOARD_ARCHITECTURE.md`](./docs/THEATRE_DASHBOARD_ARCHITECTURE.md) — Multi-Tenant Theatre Dashboard & Dedicated Analytics Layer Architecture (`theatre_dashboard_materialized_metrics`, `user_dashboard_preferences`, `dashboard_activity_feed`, Pre-Aggregated Operational Metrics, Declarative Metadata-Driven Widget Registry, Capability RBAC Gating, Multi-Tenant Localization & Urgent Start Alerts) (Phase 3 - Part 11).
- 👥 [`docs/THEATRE_STAFF_MANAGEMENT.md`](./docs/THEATRE_STAFF_MANAGEMENT.md) — Multi-Tenant Theatre Staff Management & Dynamic RBAC Architecture (`role_templates`, `theatre_roles`, `theatre_permissions`, `staff_departments`, `theatre_staff`, `staff_role_assignments`, `staff_role_history`, `future_shift_placeholders`, Capability Authorization & Lifecycle Governance) (Phase 3 - Part 10).
- ⚙️ [`docs/DYNAMIC_THEATRE_CONFIGURATION_MANAGEMENT.md`](./docs/DYNAMIC_THEATRE_CONFIGURATION_MANAGEMENT.md) — Dynamic Theatre Configuration Management Architecture (`TheatreConfiguration`, Decoupled Relational Entities, Localization, Booking Quotas, Cancellation Penalties, Refund Settlements, Age Ratings, Modular Feature Flags, Terms & OCC Rollback) (Phase 3 - Part 9).
- ⏰ [`docs/THEATRE_OPERATING_HOURS_MANAGEMENT.md`](./docs/THEATRE_OPERATING_HOURS_MANAGEMENT.md) — Multi-Tenant Theatre Operating Hours & Schedules Architecture (`TheatreOperatingProfile`, Weekly Rotations, Holiday Calendars, Facility Maintenance Downtime, Midnight Premieres, Timezone Governance & OCC) (Phase 3 - Part 8).
- 🏢 [`docs/THEATRE_BUSINESS_INFORMATION_MANAGEMENT.md`](./docs/THEATRE_BUSINESS_INFORMATION_MANAGEMENT.md) — Multi-Tenant Theatre Business & Legal Information Architecture (`TheatreBusinessProfile`, Statutory GST/PAN/CIN Validation, Country-Aware Tax Configuration, Billing Sequence & Invoicing Governance, Decoupled Document Vault, Super Admin Compliance Workflow & OCC) (Phase 3 - Part 7).
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
