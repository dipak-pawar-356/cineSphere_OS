# 🎬 CineSphere OS
> **The Operating System for Modern Cinemas**  
> *An enterprise-grade, luxury platform engineered to orchestrate cinema chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing.*

---

## 🌟 Executive Vision

**CineSphere OS** is designed from the ground up as a mission-critical operating system for modern cinema exhibition circuits. Whether operating flagship metropolitan IMAX megaplexes, boutique cocktail cinema lounges, historic 70mm screening halls, or drive-in festivals, CineSphere OS unifies physical hardware telemetry, auditorium spatial ergonomics, distributor manifests, and high-concurrency ticket reservations into a single, cohesive interface.

This repository represents **Commit #1 (Phase 1: Architecture & Design System Foundation)**. It establishes an enterprise-grade UI/UX foundation, modular layout engine, typed design system, and realistic local datasets—ready for seamless scaling into backend services and 3D WebGL hall visualization in Phase 2.

---

## 🎨 Design Philosophy & Aesthetics

CineSphere OS embodies an original design language inspired by the precision of **Apple**, the minimal ergonomics of **Linear**, the financial typography of **Stripe**, and the sleek dark aesthetics of **Vercel** and **Framer**, fused with cinema-grade entertainment patterns from **BookMyShow** and **Cineverse**.

### Color Palette & Design Tokens

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Background** | `#070B12` | Deep cinema void background |
| **Surface** | `#111827` | Structural panels & floating navigation |
| **Card** | `#161F2E` | High-contrast glassmorphic card containers |
| **Primary** | `#FBBF24` | Luxury amber gold accent (highlights, ratings, CTA glows) |
| **Secondary** | `#2563EB` | Enterprise cobalt blue (analytics & technical badges) |
| **Success** | `#22C55E` | Optimal system health & confirmed status telemetry |
| **Danger** | `#EF4444` | Alerts, attention metrics & cancellations |
| **Text Primary**| `#F9FAFB` | Crisp, legible headings & critical data |
| **Text Muted** | `#9CA3AF` | Secondary metadata, subtitles & timestamps |

### Typography & Spacing
- **Typography**: Geometric Sans (Geist & system fallback hierarchy) with high contrast tracking and tabular numbers for financial telemetry.
- **Micro-interactions**: Subtle hover lifts (`-translate-y-1`), ambient radial backlights, glassmorphism (`backdrop-blur-md`), and non-distracting spring transitions.

---

## 🛠️ Tech Stack (Phase 1 Foundation)

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router, React Server & Client Components)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/) (Strict typing across all models and props)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom `@layer base` tokens and luxury utilities
- **Motion & Physics**: `motion` & `framer-motion` v12
- **Animation Orchestration**: `gsap` (installed & ready for Phase 2 timelines)
- **Smooth Inertial Scrolling**: `lenis` (installed & ready for Phase 2 spatial canvases)
- **State Store**: `zustand` (installed for Phase 2 booking state)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Code Quality**: ESLint 9 & Prettier

---

## 📂 Project Structure

```
cineSphere_OS/
├── app/
│   ├── (Home)                   # page.tsx - Landing page & ecosystem showcase
│   ├── movies/                  # page.tsx - 10-movie grid with multi-filter sidebar
│   ├── theatres/                # page.tsx - 8-theatre complex index with city chips & search
│   ├── offers/                  # page.tsx - 6 promotional vouchers, coupons & passes
│   ├── events/                  # page.tsx - 6 live sports, concert & stand-up simulcasts
│   ├── dashboard/               # page.tsx - Super Admin control center (Stats, Charts, Tables)
│   ├── layout.tsx               # Root layout with sticky navbar, footer & theme
│   ├── loading.tsx              # Luxury CS pulsating loader
│   ├── not-found.tsx            # Cinematic 404 screen
│   └── globals.css              # Tailwind v4 configuration, CSS variables & glassmorphism
│
├── components/
│   ├── badges/                  # StatusBadge, FormatBadge (IMAX, 4DX, Atmos, 70mm)
│   ├── buttons/                 # Button, ActionButton, ComingSoonButton
│   ├── cards/                   # MovieCard, TheatreCard, OfferCard, EventCard, DashboardMetricCard
│   ├── charts/                  # RevenueChartPreview, OccupancyChartPreview
│   ├── empty-states/            # EmptyState for search and filter fallbacks
│   ├── layout/                  # Navbar, Footer, MobileNav, DashboardSidebar, DashboardHeader
│   ├── modals/                  # ComingSoonModal (Phase 2 preview & newsletter capture)
│   ├── navigation/              # LocationSelector, SearchDialog (⌘K Spotlight)
│   ├── sections/                # HeroSection, StatsStrip, FeaturedMovies, PopularTheatres,
│   │                            # PlatformFeatures, UpcomingEvents, CtaBanner
│   ├── tables/                  # RecentBookingsTable, RecentTheatresTable, RecentMoviesTable
│   └── ui/                      # Button, Card, Badge, SearchBar, FilterChip, StatCard,
│                                # FeatureCard, SectionHeading, Skeleton
│
├── lib/
│   ├── constants/               # Local typed mock data (10 Movies, 8 Theatres, 6 Offers,
│   │                            # 6 Events, 9 Platform Features, Dashboard Telemetry)
│   ├── hooks/                   # useMediaQuery, useClickOutside
│   ├── types/                   # Movie, Theatre, Offer, Event, Metric, Booking interfaces
│   └── utils.ts                 # cn (clsx + twMerge), formatCurrency, formatDuration
│
├── public/
│   ├── images/                  # High-res cinematic backgrounds & illustrations
│   ├── logos/                   # CineSphere OS SVG vector marks & badges
│   └── posters/                 # High-definition movie posters & event graphics
│
├── next.config.ts               # Next.js configuration (remote image optimization)
├── postcss.config.mjs           # PostCSS for Tailwind v4
├── tsconfig.json                # TypeScript strict configuration
└── package.json                 # Core dependencies and scripts
```

---

## 🚀 Current Implementation Scope (Phase 1)

### 1. Unified Navigation & Sticky Blur Header
- **Dynamic Brand Mark**: Gold glowing orbital logo badge with responsive subtitle.
- **Live Location Selector**: Switch across 8 major metropolitan regions (NYC, LA, SF, Chicago, Atlanta, Boston, Dallas, Seattle).
- **Global Search Spotlight (⌘K)**: Instant dialog search indexing movies, theatres, and venues.
- **Notification & Profile Drawers**: Preview popovers explaining Phase 2 SSO and real-time operations.
- **Responsive Mobile Drawer**: Off-canvas menu tailored for touch devices.

### 2. Immersive Home Page
- **Hero Section**: Architectural headline, subtitle, dual CTAs, and a detailed Spatial Hall simulation dashboard preview.
- **Circuit Telemetry Strip**: 150+ Theatres, 650+ Screens, 240K+ Bookings, 25+ Cities.
- **Featured Horizontal Movie Cards**: Curated theatrical releases with format badges, runtime, certification, and ratings.
- **Popular Multiplex Complexes**: Highlighting flagship locations with screen counts, sound systems, and VIP amenities.
- **9 Core Platform Features**: Multi-Theatre, 3D Hall Designer, Yield Analytics, Booking Engine, Seat Management, Scheduling Matrix, Payments, Patron CRM, and AI Hall Acoustics.
- **Live Stage & Simulcasts**: Concerts, championship boxing, and theatre feeds.
- **Enterprise Conversion Banner & Footer**: Global status beacon (99.99% Uptime) and comprehensive architecture sitemap.

### 3. Movie Exploration Hub (`/movies`)
- Grid of 10 curated films featuring high-resolution cinematic artwork.
- Interactive filter sidebar: Genre, Experience Format (IMAX, 4DX, Dolby, 3D), Language, and Critic Rating thresholds.
- Dynamic search bar with realtime title/cast matching and zero-result empty state.

### 4. Theatre Complex Explorer (`/theatres`)
- 8 detailed multiplex complexes across the United States.
- Large search input with metropolitan filter chips.
- Facility checklists (Laser 4K, 128-channel Atmos, Recliner Lounges, Dine-in Concierge).

### 5. Promotional & Membership Hub (`/offers`)
- 6 luxury vouchers spanning coupons, wallet cashbacks, annual gold passes, and festival promos.
- One-click copy-to-clipboard functionality with feedback states.
- Terms & conditions and expiration trackers.

### 6. Stage & Event Broadcasts (`/events`)
- 6 live entertainment events (Orchestras, Championship Boxing, Stand-up Comedy tours, Shakespeare simulcasts, Formula 1 Grand Prix).
- Ticket tier starting prices, venue mapping, and calendar badges.

### 7. Super Admin Executive Command Console (`/dashboard`)
- **Executive Sidebar**: 8 management routes (Dashboard, Theatres, Halls, Movies, Bookings, Users, Reports, Settings).
- **Telemetry Cards**: Active Theatres, Current Releases, Monthly Admissions, and Gross Box Office revenue.
- **Interactive Chart Previews**:
  - 12-month revenue bar visualizer with breakdown tooltips and ticket vs. F&B distribution.
  - Screen format occupancy fill gauges (IMAX 94.2%, 4DX 88.5%, Dolby 91.0%).
- **Circuit Operations Tables**:
  - Live Bookings Table with booking references, seat codes, and transaction status pills.
  - Connected Theatres Table with screen counts, occupancy meters, and health indicators.
  - Top Performing Releases Table with show allocations and box office trends.

---

## 🔮 Phase 2 Roadmap (Future Commits)

- [ ] **Interactive 3D WebGL Hall Designer**: Three.js viewport to arrange screen curvature, row risers, and Dolby Atmos audio cones.
- [ ] **High-Velocity Booking Engine**: Sub-second seat selection with distributed locking via Redis.
- [ ] **Box Office POS & Concession Synchronization**: Real-time kitchen display and counter barcode scanning.
- [ ] **Multi-Currency Payment Orchestration**: Stripe, Apple Pay, Google Pay, and localized digital wallets.
- [ ] **Enterprise SSO & RBAC**: Okta, SAML 2.0, and granular roles for theatre managers, projectionists, and cashiers.

---

## 📸 Screenshots & UI Previews

*(Visual placeholders for deployment documentation)*

| Landing Page & Hero Section | Executive Admin Console |
| :---: | :---: |
| `[ Hero Section Preview Placeholder ]` | `[ Super Admin Dashboard Preview Placeholder ]` |

| Movies Catalogue & Filter Engine | Theatre Circuit Explorer |
| :---: | :---: |
| `[ Movies Grid Preview Placeholder ]` | `[ Theatres Directory Preview Placeholder ]` |

---

## ⚡ Getting Started

### Prerequisites
- Node.js `v20.x` or higher
- `pnpm` (recommended), `npm`, or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cineSphere_OS.git
cd cineSphere_OS

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience **CineSphere OS**.

### Quality Assurance

```bash
# Verify TypeScript & Production Build
pnpm run build

# Run Code Linter
pnpm run lint
```

---

## 📄 License
Internal Enterprise Architecture — Copyright © 2026 CineSphere OS Inc. All rights reserved.
