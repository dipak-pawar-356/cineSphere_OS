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
