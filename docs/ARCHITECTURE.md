# CineSphere OS - Architecture Guide

## 1. System Philosophy

CineSphere OS is built on three architectural pillars:
1. **Separation of Concerns:** Strict isolation between presentation layouts, reusable UI primitives, domain logic, and data schemas.
2. **Domain-Driven Design (DDD):** Modular data boundaries reflecting real-world cinema operations (Halls, Shows, Bookings, Concessions, Distributors).
3. **Progressive Enhancement:** Fully accessible, performant static foundations that seamlessly integrate real-time APIs, WebSockets, and 3D WebGL viewers in future phases.

---

## 2. Directory Structure

```
cineSphere_OS/
├── app/                          # Next.js 15 App Router route tree
│   ├── (admin)/                  # Super Admin Control Plane
│   │   ├── admin/                # Platform management, analytics, system health
│   │   └── layout.tsx            # Super Admin layout with sidebar & command bar
│   ├── (public)/                 # Guest discovery portal
│   │   ├── movies/               # Catalog, filters, movie details
│   │   ├── theatres/             # Multiplex locator & screen specs
│   │   ├── events/               # Live events, stand-up comedy, sports
│   │   ├── offers/               # Promotional deals & student passes
│   │   ├── about/                # Vision & technology stack
│   │   ├── contact/              # Support, helpline & FAQs
│   │   ├── layout.tsx            # Sticky cinema header, drawer, footer
│   │   └── page.tsx              # Public home billboard
│   ├── (theatre-admin)/          # Multi-Tenant Cinema Manager Console
│   │   ├── theatre/              # 25+ operational screens (Phoenix Marketcity Pune)
│   │   └── layout.tsx            # Theatre Admin layout with operational nav
│   ├── globals.css               # Design tokens, theme variables & utilities
│   └── layout.tsx                # Root layout with Geist fonts & Lenis scroll
├── components/                   # Reusable UI component library
│   ├── cards/                    # MovieCard, TheatreCard, OfferCard, EventCard, MetricCard
│   ├── common/                   # SeatLegend, StatusBadge, SectionHeader, EmptyState
│   ├── layout/                   # Headers, footers, sidebars, breadcrumbs
│   ├── navigation/               # Nav links, mobile drawer, role switcher
│   ├── motion/                   # Responsive containers, grid primitives, Lenis provider
│   └── ui/                       # Button, Input, Select, Modal, Tabs, Table, Badge
├── data/                         # Centralized mock data layer
│   ├── common/                   # Cities, amenities, facilities, mock users
│   ├── dashboard/                # Super Admin & Theatre Admin metric data
│   ├── platform/                 # Platform overview, growth metrics, system health, audit logs
│   ├── public/                   # Movies (15), theatres (10), events (8), offers (8), faqs (20)
│   ├── theatre/                  # Flagship cinema (th-pun-001) halls, shows, bookings, staff
│   ├── utils/                    # Formatters (currency, numbers, percent) & constants
│   └── index.ts                  # Master barrel export
├── docs/                         # Comprehensive developer guides & architecture manuals
├── lib/                          # Internal utilities, helpers & animations
│   ├── motion/                   # Breakpoints, transitions, GSAP configs, future hooks
│   └── utils/                    # Tailwind class merger (cn)
├── public/                       # Static public assets
│   ├── placeholders/             # Organized placeholder SVGs and folders
│   └── manifest.json             # Web App Manifest
├── types/                        # Centralized TypeScript domain interfaces
│   ├── common.types.ts           # IDs, addresses, media assets, filters
│   ├── movie.types.ts            # Movie, format, language, crew, cast
│   ├── theatre.types.ts          # Theatre, amenity, facility, pricing tier
│   ├── hall.types.ts             # Hall, screen type, seat categories, sections
│   ├── show.types.ts             # Show, status, language, format
│   ├── booking.types.ts          # Booking, payment status, tickets, methods
│   ├── customer.types.ts         # Customer, loyalty tiers, spend history
│   ├── staff.types.ts            # Staff, employee codes, shifts, roles
│   ├── offer.types.ts            # Promotional offers, coupon codes, terms
│   ├── event.types.ts            # Live events, categories, artists, venues
│   ├── payment.types.ts          # Transactions, payment rails, gateway refs
│   ├── notification.types.ts     # System notifications, severities, read state
│   ├── report.types.ts           # Box office, occupancy, GST reports
│   ├── dashboard.types.ts        # Metrics, pending approvals, service status
│   ├── faq.types.ts              # FAQs, testimonials, technology partners
│   ├── navigation.types.ts       # Navigation items, roles, permissions
│   └── index.ts                  # Master types barrel export
├── package.json                  # Dependencies & npm scripts
├── tsconfig.json                 # Strict TypeScript configuration
└── README.md                     # Master project manual
```

---

## 3. Route Groups & Routing Matrix

Next.js 15 route groups isolate layouts without affecting URL structures:
- `(public)`: Public-facing guest routes (`/`, `/movies`, `/theatres`, `/events`, `/offers`, `/about`, `/contact`).
- `(admin)`: Platform-wide Super Admin routes (`/admin`, `/admin/theatres`, `/admin/movies`, `/admin/analytics`, `/admin/system`, `/admin/settings`).
- `(theatre-admin)`: Tenant-specific Theatre Admin routes (`/theatre`, `/theatre/halls`, `/theatre/shows`, `/theatre/bookings`, `/theatre/customers`, `/theatre/staff`, `/theatre/revenue`, `/theatre/reports`, etc.).

---

## 4. Multi-Tenancy Architecture

CineSphere OS enforces a strict tenant boundary. In Phase 1:
- The default tenant is assigned ID `th-pun-001` (*CineSphere Grand Cinemas*, Phoenix Marketcity, Pune).
- All halls, shows, bookings, revenue streams, staff shifts, and audit logs cross-reference this foreign key.
- In future phases, tenant contexts will be resolved dynamically via custom domain routing (`subdomain.cinesphere.os`) or request headers.
