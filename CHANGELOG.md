# Changelog

All notable changes to the **CineSphere OS** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-08

### Phase 1: Foundation, Design System, Layouts, Dashboard UIs, Responsive Motion & Mock Data Architecture

This release marks the successful completion of **Phase 1** of CineSphere OS — *The Operating System for Modern Cinemas*. Phase 1 delivers the full frontend architectural foundation, tokenized design system, comprehensive layout hierarchy, public guest portal, enterprise Super Admin dashboard, multi-tenant Theatre Admin console, mobile-to-ultrawide responsive framework, accessible motion orchestration, and a centralized, type-safe mock data layer.

#### Added

##### Part 1: Project Architecture & Environment Foundation
- Modern Next.js 15 (App Router), React 19, TypeScript 5.9, and Tailwind CSS v4 setup.
- Strict Path Aliases: `@/components`, `@/lib`, `@/types`, `@/data`, `@/styles`, `@/hooks`, `@/assets`.
- Zero-drift TypeScript configuration (`tsconfig.json`) with strict type-checking and no implicit any.
- Git configuration with comprehensive `.gitignore` and `.gitattributes`.
- Initial deployment configuration for Vercel edge runtime and build settings.

##### Part 2: Luxury Cinema Design System
- Custom CSS custom-property design tokens inspired by premium cinema aesthetics:
  - Cinema Red brand accent (`hsl(356, 92%, 52%)`).
  - True OLED Void Dark Mode (`#050507`, `#0A0B10`, `#12131A`).
  - Cinema Gold & Amber highlights (`hsl(43, 96%, 56%)`).
- Modern typography scale with `Geist Sans` and `Geist Mono`.
- Ultra-smooth glassmorphism effects (`backdrop-blur-xl`, subtle border gradients, noise overlays).
- Cinema state colors: Live, Running, Housefull, Maintenance, Success, Warning, Danger, Info.

##### Part 3: Layouts & Navigation Framework
- Role-based routing matrix for 5 key enterprise roles: Super Admin, Theatre Admin, Hall Manager, Staff, Customer.
- Public Layout (`app/(public)/layout.tsx`) featuring Sticky Cinema Header, Mobile Navigation Drawer, and Comprehensive Luxury Footer.
- Super Admin Dashboard Layout (`app/(admin)/layout.tsx`) featuring Collapsible Sidebar, Breadcrumbs, System Alerts Banner, and Profile Concierge.
- Breadcrumb navigation engine with automatic segment parsing and route-label mapping.

##### Part 4: Public Guest Portal Pages
- **Home Landing Page** (`app/(public)/page.tsx`): Hero cinema billboard carousel, quick city locator, now showing rail, format showcases (IMAX, Dolby Cinema, 4DX, ScreenX), customer testimonials, and luxury newsletter banner.
- **Movies Directory** (`app/(public)/movies/page.tsx`): Filterable grid by format, genre, language, and status with rich metadata tags.
- **Movie Details Page** (`app/(public)/movies/[id]/page.tsx`): Comprehensive movie hub with synopsis, cast & crew cards, trailer modal preview, format badges, and interactive showtime schedules.
- **Theatres Directory** (`app/(public)/theatres/page.tsx`): Multiplex locator with city filters, amenity chips, screen counts, and distance indicators.
- **Theatre Details Page** (`app/(public)/theatres/[id]/page.tsx`): Auditorium specifications, Barco/Dolby hardware badges, valet/EV parking details, and hall listings.
- **Live Events Hub** (`app/(public)/events/page.tsx`): Concert screenings, live stand-up comedy specials, motorsports (F1), and international film galas.
- **Promotions & Offers** (`app/(public)/offers/page.tsx`): Card grid with coupon code copy triggers, student passes, food combos, and bank BOGO perks.
- **About CineSphere OS** (`app/(public)/about/page.tsx`): Platform mission, architectural vision, executive leadership, and technology stack.
- **Contact & Enterprise Inquiries** (`app/(public)/contact/page.tsx`): Interactive inquiry form, 24/7 guest helpline, office locations, and FAQ accordions.

##### Part 5: Super Admin Control Plane
- **Overview Dashboard** (`app/(admin)/page.tsx`): Platform gross box office (₹8.64 Cr), network screen health, admission volume, and live transaction stream.
- **Theatre Onboarding & Approval Hub** (`app/(admin)/theatres/page.tsx`): Multi-tenant cinema circuit registry, KYC/DCI license approvals, and status toggles.
- **Global Movie Catalog** (`app/(admin)/movies/page.tsx`): Master distribution repository, censor certifications (CBFC/MPAA), and trailer links.
- **Platform Analytics & Box Office Split** (`app/(admin)/analytics/page.tsx`): City-wise revenue distribution, screen format performance, and admissions graphs.
- **System Health & Edge Infrastructure** (`app/(admin)/system/page.tsx`): Live health telemetry for Envoy API Gateway, PostgreSQL cluster, Redis seat cache, Cloudflare CDN, and Razorpay payment rails.
- **Platform Settings & Role-Based Access Control** (`app/(admin)/settings/page.tsx`): Global currency, tax configurations (GST), security policies, and audit logs.

##### Part 6: Enterprise Reusable Component Library
- **Core UI Primitives**: `Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Tabs`, `Table`, `Drawer`, `Avatar`, `Skeleton`, `Tooltip`, `DropdownMenu`, `Switch`, `Progress`, `Accordion`.
- **Domain Cinema Components**:
  - `MovieCard`: Poster aspect ratio 2:3, format badges, release countdown, hover sheen.
  - `TheatreCard`: Distance indicator, rating stars, format pills, hall count.
  - `ShowtimeChip`: Format indicator, audio language tag, filling fast / housefull status badges.
  - `SeatLegend`: Interactive visual guide for Silver, Gold, Platinum, VIP Recliner, and Royal Suite tiers.
  - `MetricCard`: Enterprise dashboard card with positive/negative trend pills, delta metrics, and Lucide icons.
  - `DataTable`: Generic typed table with sorting, pagination, and multi-state empty renderers.
  - `StatusBadge`: Unified variant mapping for Active, Running, Maintenance, Housefull, Cancelled, Paid, Refunded.
  - `OfferCard` & `EventCard`: Promotional cards with coupon triggers, event categories, and venue tags.

##### Part 7: Multi-Tenant Theatre Admin, Responsive Framework & Motion
- **Flagship Theatre Admin Console** for *CineSphere Grand Cinemas* (Phoenix Marketcity, Pune - `th-pun-001`):
  - 25+ dedicated operational routes covering Halls, Movies, Shows, Bookings, Customers, Staff, Revenue, Payments, Transactions, Offers, Events, Analytics, Reports, Notifications, Support, and Settings.
- **Responsive Layout Framework**:
  - Breakpoint tokens: `xs` (320px), `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px), `3xl` (1920px), `ultrawide` (2560px).
  - Responsive primitives: `FluidContainer`, `FixedContainer`, `WideContainer`, `DashboardContainer`, `PageContainer`, `SectionContainer`.
  - Grid primitives: `Grid1Col` through `Grid6Col`, `AutoGrid`, `DashboardGrid`, `MovieGrid`, `AnalyticsGrid`.
  - React hook: `useResponsive` with breakpoint matchers, device types (`isMobile`, `isTablet`, `isDesktop`), and orientation flags.
- **Motion & Smooth Scroll System**:
  - Lenis smooth scrolling with `prefers-reduced-motion` compliance.
  - GSAP easing tokens and animation variants (`transitions.ts`, `gsap.ts`).
  - Future module hooks: `use3DHeroMotion`, `use3DTheatreMotion`, `useSeatSelectionMotion`, `useHallDesignerMotion`, `usePanoramaCarousel`.

##### Part 8: Centralized Mock Data Layer, TypeScript Models & Documentation
- **TypeScript Domain Models** (`types/`):
  - `common.types.ts`, `movie.types.ts`, `theatre.types.ts`, `hall.types.ts`, `show.types.ts`, `booking.types.ts`, `customer.types.ts`, `staff.types.ts`, `offer.types.ts`, `event.types.ts`, `payment.types.ts`, `notification.types.ts`, `report.types.ts`, `dashboard.types.ts`, `faq.types.ts`, `navigation.types.ts`.
- **Mock Data Engine** (`data/`):
  - Strict Indian currency formatting (INR `₹`), `en-IN` numeric formatting, and `Asia/Kolkata` time zone.
  - 15 complete movie profiles with cast, crew, trailers, and certifications.
  - 10 premier cinema locations across major Indian metropolitan hubs.
  - Consistent foreign key relationships pointing to flagship venue `th-pun-001`.
  - Platform audit logs, service telemetry, and financial statistics.
- **Placeholder Assets** (`public/placeholders/`):
  - Clean vector SVG templates and directory hierarchy for posters, backdrops, logos, avatars, and empty states.
- **Developer Documentation Suite** (`docs/`):
  - 8 architecture and operational manuals covering project structure, design system, component APIs, data schemas, and future roadmap.

