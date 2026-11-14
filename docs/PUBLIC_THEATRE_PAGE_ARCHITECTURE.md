# CineSphere OS — Public Theatre Page Architecture (Phase 3 – Part 13)

```
========================================================================================
Platform
        │
        ▼
Public Content Layer
        │
        ▼
Theatre Public View (Read Model: PublicTheatreView)
        │
        ├── 1. Branding (Logo, Banner, Hero, Sequenced Gallery)
        ├── 2. Theatre Profile (Display Name, About, Specs, Classification)
        ├── 3. Location (Complete Address, Coordinates, Turn-by-turn Navigation)
        ├── 4. Contact (Box Office Phone, Guest Email, Emergency Desk, Manager Escalation)
        ├── 5. Amenities (Technology, Comfort, Accessibility, Hospitality)
        ├── 6. Running Movies (Now Showing with Posters, Certifications, Durations)
        ├── 7. Upcoming Movies (Premieres Showcase with Release Dates)
        ├── 8. Available Shows (Timetable, Formats, Localized Currency Prices, Seat Quotas)
        ├── 9. Hall Summary (Auditorium Fleet, Laser 4K, 64-Channel Spatial Audio)
        ├── 10. Operating Hours (Live Open/Closed Status, Weekly Rotations, Timezone)
        ├── 11. Reviews Summary Placeholder (4.8 Score, Distribution, Verified Feedback)
        ├── 12. Configuration (Multi-tenant Currency, Number Formatting, Timezone)
        └── 13. SEO Metadata & Schema.org JSON-LD (MovieTheater Structured Data)
                │
                ▼
        Public Theatre Page (/theatre/[slug])
========================================================================================
```

---

## 1. Architectural Philosophy & The Problem Solved

### The Anti-Pattern
A common architectural flaw in enterprise multiplex SaaS platforms is treating the **Public Theatre Page** as a simple page that directly joins or queries raw transactional tables and internal micro-services (`theatres`, `movies`, `halls`, `shows`, `amenities`, `contacts`, `business_profiles`, `payments`, etc.) on every request.

This approach creates severe issues:
1. **Performance Bottlenecks:** Under heavy consumer traffic (such as premiere ticket drops), querying relational tables directly causes database connection pool exhaustion and high query latency.
2. **Accidental Information Disclosure:** Internal corporate details (such as GSTIN, PAN, corporate CIN, staff employee codes, internal payment merchant VPAs, gateway secrets, seat hold timers, and internal refund formulas) can easily leak into public JSON responses or hydration payloads.
3. **Fragile Coupling:** UI changes or domain schema refactorings in back-office modules break public consumer routes.
4. **Poor CDN / SSR Performance:** Inability to leverage Incremental Static Regeneration (ISR) and Edge CDN caching due to fragmented data sources.

### The Solution: Public Content Layer & Dedicated Read Model
CineSphere OS implements a dedicated **Public Content Layer** powered by the **`PublicTheatreView` Read Model** (`types/public-theatre.types.ts`).

- The public view model is an **aggregated, sanitized, immutable read model** containing *only* what the public consumer needs.
- Assembled asynchronously by `PublicTheatreService` (`lib/services/public-theatre.service.ts`).
- Cached in high-speed Redis / in-memory cache with tag-based invalidation (`PUBLIC_THEATRE_VIEW:<slug-or-id>`).
- Rendered via Next.js 15 Server Components with `revalidate = 3600` (ISR) and schema-compliant JSON-LD structured data.

---

## 2. Core Domain Contracts (`types/public-theatre.types.ts`)

The master public read model is decomposed into 13 decoupled sub-models:

```typescript
export interface PublicTheatreView {
  theatreId: string;
  slug: string;
  branding: PublicBrandingView;
  profile: PublicTheatreProfileView;
  location: PublicLocationView;
  contact: PublicContactView;
  amenities: PublicAmenityItem[];
  runningMovies: PublicMovieSummary[];
  upcomingMovies: PublicMovieSummary[];
  shows: PublicShowItem[];
  halls: PublicHallSummary[];
  operatingHours: PublicOperatingHoursView;
  reviewsSummary: PublicReviewsSummaryPlaceholder;
  configuration: PublicTheatreConfigurationView;
  seo: PublicTheatreSEO;
  generatedAt: string;
}
```

### Sub-Models Detail:

1. **`PublicBrandingView`:**
   - Pre-sanitized CDN URLs for logo, banner, hero banner, cover image, and thumbnail.
   - Sequential, active-only gallery images sorted by `displayOrder`.
2. **`PublicTheatreProfileView`:**
   - Display name, established year, theatre type (`PREMIUM`, `IMAX`, `MULTIPLEX`), chain affiliation, tagline, and full description.
3. **`PublicLocationView`:**
   - Complete human-readable address, city, state, postal code, GPS coordinates, and direct links to Google Maps navigation and turn-by-turn routing.
4. **`PublicContactView`:**
   - Box office phone number with international dial codes, guest relations support email, 24/7 priority emergency line, duty cinema manager escalation contact, and verified social media links.
5. **`PublicAmenityItem`:**
   - Categorized under `TECHNOLOGY`, `COMFORT`, `ACCESSIBILITY`, `HOSPITALITY`.
   - Feature flags, descriptive copy, and structured capacity metrics (e.g. 1,200 parking bays, 24 EV charging stations, Wi-Fi SSID).
6. **`PublicMovieSummary`:**
   - Segregated into **Running Movies** (`NOW_SHOWING`) and **Upcoming Movies** (`COMING_SOON`).
   - Includes high-res poster, rating, runtime, censorship certification (`UA`, `A`, `PG-13`), release date, and format badges.
7. **`PublicShowItem`:**
   - Scheduled showtimes with format tags (`IMAX 2D`, `Dolby Atmos`, `VIP Dining Experience`).
   - Autonomous multi-tenant ticket price formatting (`₹280`, `$18.50`, `AED 45`).
   - Real-time seat inventory indicators (`SCHEDULED`, `FILLING_FAST`, `SOLD_OUT`).
8. **`PublicHallSummary`:**
   - Auditorium fleet breakdown specifying flagship technologies (e.g., Commercial Laser 4K, 12-channel spatial audio, 64-channel Dolby Atmos, 4DX motion simulators).
9. **`PublicOperatingHoursView`:**
   - Dynamic real-time calculation of multiplex open/closed status.
   - 7-day weekly schedule with overnight indicator (e.g. 09:00 to 01:30 Overnight) and holiday notices.
10. **`PublicReviewsSummaryPlaceholder`:**
    - Non-functional architectural stub delivering 4.8 aggregate rating, 5-tier distribution percentages, patron experience photos, and verified ticket feedback cards.
11. **`PublicTheatreConfigurationView`:**
    - Multi-tenant localization rules: currency, currency symbol, timezone, number format (`INDIAN` vs `INTERNATIONAL`), and time format (`12H` vs `24H`).
12. **`PublicTheatreSEO`:**
    - Dynamic title, meta description, canonical URL, OpenGraph, Twitter card tags, and Schema.org `MovieTheater` JSON-LD specification.

---

## 3. Strict Security & Information Disclosure Prevention

The `PublicTheatreService` enforces a strict perimeter around internal data. It guarantees **zero leakage** of sensitive back-office entities:

| Sensitive Category | Internal Origin | Public Status | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **Statutory Credentials** | `theatreBusinessService` | **STRICTLY BLOCKED** | Never mapped to read model; PAN, GSTIN, CIN excluded from DTO |
| **Staff & RBAC Hierarchy** | `theatreStaffService` | **STRICTLY BLOCKED** | No employee codes, internal salaries, shifts, or permissions exposed |
| **Payment Configurations** | `theatrePaymentService` | **STRICTLY BLOCKED** | Zero gateway secrets, merchant VPAs, or webhook tokens exposed |
| **Internal Booking Config** | `theatreConfigurationService` | **STRICTLY BLOCKED** | Seat hold lock timers, cancellation fee formulas, and buffer mins withheld |
| **Audit Logs & Security** | `securityAuditService` | **STRICTLY BLOCKED** | Zero actor IDs, IP addresses, or internal change logs exposed |
| **Private Media Assets** | `theatreMediaService` | **STRICTLY BLOCKED** | Only assets marked `isPublic: true` and `status: "ACTIVE"` are included |

---

## 4. Content Visibility & Approval State Machine

A cinema multiplex is strictly hidden from the public portal unless it meets compliance criteria:

```
┌─────────────────┐       Approval        ┌─────────────────┐
│      DRAFT      │ ────────────────────► │ PENDING_APPROVAL│
└─────────────────┘                       └─────────────────┘
         │                                         │
         │ (Hidden from Public)                    │ (Hidden from Public)
         ▼                                         ▼
┌─────────────────┐      Activation       ┌─────────────────┐
│    SUSPENDED    │ ◄───────────────────► │     ACTIVE      │ ──► [ PUBLIC EXPOSURE ]
└─────────────────┘                       │   isVerified    │
         ▲                                └─────────────────┘
         │
┌─────────────────┐
│    ARCHIVED     │ (Hidden from Public)
└─────────────────┘
```

- **Public Guests:** Attempting to view any theatre in `DRAFT`, `PENDING_APPROVAL`, `SUSPENDED`, or `ARCHIVED` status immediately returns a `404 NotFoundError` (`NotFoundError: Theatre is not published or undergoing compliance verification`).
- **Administrative Preview Mode:** Authorized administrators (`SUPER_ADMIN` or `THEATRE_ADMIN`) can preview unapproved venues by passing `previewMode: true`.
- **Security Audit:** Every administrative preview request is immutably logged via `securityAuditService.recordAudit` with severity `INFO` and category `AUDIT`.

---

## 5. Autonomous Multi-Tenant Localization

Every multiplex on CineSphere OS operates under its own tenant localization profile without hardcoded platform assumptions:

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     Theatre A: Pune Flagship    │   │    Theatre B: Mumbai Luxury     │   │      Theatre C: Dubai Palms     │
│          (th-pun-001)           │   │          (th-mum-001)           │   │          (th-dxb-001)           │
├─────────────────────────────────┤   ├─────────────────────────────────┤   ├─────────────────────────────────┤
│ • Currency: INR                 │   │ • Currency: USD                 │   │ • Currency: AED                 │
│ • Symbol: ₹                     │   │ • Symbol: $                     │   │ • Symbol: AED                   │
│ • Timezone: Asia/Kolkata        │   │ • Timezone: America/New_York    │   │ • Timezone: Asia/Dubai          │
│ • Number Format: INDIAN         │   │ • Number Format: INTERNATIONAL  │   │ • Number Format: INTERNATIONAL  │
│   (₹1,25,000 / Lakhs & Crores)  │   │   ($8,420 / Millions)           │   │   (AED 32,400 / Millions)       │
│ • Show Price: ₹280              │   │ • Show Price: $18.50            │   │ • Show Price: AED 45            │
└─────────────────────────────────┘   └─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 6. SSR / ISR, Caching & Performance Architecture

The public theatre page is built on modern Next.js 15 Server Component capabilities:

```
Client HTTP Request: /theatre/cinesphere-grand-pune
        │
        ▼
Next.js 15 Server Component (app/(public)/theatre/[slug]/page.tsx)
        │
        ├─► generateMetadata() ─────────► Generates SEO Title, OG Tags & Canonical URL
        │
        ├─► Query Cache Strategy ───────► withQueryCache(CACHE_TAGS.PUBLIC_THEATRE_VIEW)
        │     │
        │     ├─ [HIT]  ──► Returns cached PublicTheatreView instantly (<5ms)
        │     └─ [MISS] ──► PublicTheatreService aggregates sub-models from repositories
        │
        ├─► Inject Structured Data ─────► <script type="application/ld+json"> (MovieTheater)
        │
        └─► Revalidation ───────────────► export const revalidate = 3600 (ISR 1-Hour)
```

### Cache Invalidation Hooks:
When a theatre admin modifies their branding, profile, address, operating hours, amenities, or configuration in the back office, the public cache is atomically purged:
```typescript
publicTheatreService.invalidatePublicTheatreView(theatreIdOrSlug);
// Automatically invalidates CACHE_TAGS.PUBLIC_THEATRE_VIEW(theatreId)
// and CACHE_TAGS.THEATRE(theatreId)
```

---

## 7. Modular UI Component Hierarchy (`components/public-theatre/`)

The public interface is designed with a luxury cinema aesthetic and composed of 12 modular components:

```
PublicTheatreViewContainer
  │
  ├── PublicTheatreHero
  │     └── Hero Banner, Cinema Logo, Verification Badge, Rating, Address, Maps CTA
  ├── PublicTheatreSpecs
  │     └── 4-Card Quick Specs (Screens, Flagship Tech, Capacity, Shows Count)
  ├── PublicTheatreAbout
  │     └── Established Year, Tagline, Story, Languages, Classification Badges
  ├── PublicTheatreShowsSection
  │     └── 7-Day Date Tabs, Format Filters, Movie Cards, Localized Showtime Pills
  ├── PublicTheatreUpcomingMovies
  │     └── Upcoming Premieres Carousel/Grid with Release Countdown Badges
  ├── PublicTheatreHallsSection
  │     └── Auditorium Fleet Breakdown (Laser 4K, 12-ch / 64-ch sound, capacity)
  ├── PublicTheatreAmenitiesSection
  │     └── Verified Facility Badges by Category (Tech, Comfort, Accessibility, Food)
  ├── PublicTheatreGallerySection
  │     └── Architectural Photography Grid with Lightbox Modal
  ├── PublicTheatreOperatingHoursSection
  │     └── Live Status Pill (Open/Closed), Today's Hours, 7-Day Weekly Grid
  ├── PublicTheatreContactSection
  │     └── Box Office Voice Desk, Support Email, 24/7 Emergency, Duty Manager
  └── PublicTheatreReviewsPlaceholder
        └── Visual Architecture Stub (4.8 Score, Distribution, Verified Badges)
```

---

## 8. Verification & Quality Assurance

The implementation was validated against a 12-suite automated test matrix (`scripts/verify-public-theatre-page.ts`) with **99 passing assertions**:

1. **Test 1:** Public Read Model Aggregation & Entity Decoupling (All 13 sub-models present).
2. **Test 2:** Strict Security & Information Disclosure Prevention (Zero leakage of GSTIN, PAN, CIN, staff, or payment credentials).
3. **Test 3:** Content Visibility & Approval State Machine (Strict 404 on DRAFT, SUSPENDED, ARCHIVED; Admin preview audit).
4. **Test 4:** Dynamic Branding & Sequential Gallery Delivery.
5. **Test 5:** Running Movies vs. Upcoming Movies Separation.
6. **Test 6:** Available Shows with Seat Quotas & Localized Formatted Prices.
7. **Test 7:** Auditorium Fleet Specifications (Laser Dual 4K, 12-channel sound).
8. **Test 8:** Public Amenities & Verified Facility Categories.
9. **Test 9:** Geographic Location, Direction URLs & Public Contact Desks.
10. **Test 10:** Operating Hours, Today's Status & Weekly Rotations.
11. **Test 11:** SEO Metadata & Schema.org `MovieTheater` JSON-LD Structured Data.
12. **Test 12:** Multi-Tenant Autonomous Localization (Pune INR vs Mumbai USD vs Dubai AED).
