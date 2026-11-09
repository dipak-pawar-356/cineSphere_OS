# CineSphere OS — Customer Discovery & Booking Flow Architecture

## Phase 2 – Part 10: Technical Documentation

### 1. Executive Summary & Architectural Law

In enterprise cinema ticketing architectures (such as BookMyShow, Vista Cinema, PVR, and INOX), user exploration is not restricted to a single rigid linear funnel (`City → Movie → Theatre → Date → Show → Seats`). Customers exhibit varied behavioural entry points and intents.

CineSphere OS natively supports **four customer discovery journeys** that all mathematically and logically converge to the central **Show ID**:

```
Journey 1 (City-First):
   City ────────► Movie ────────► Theatre ────────► Date/Time ────────► Show ID ────────► Seat Map

Journey 2 (Movie-First):
   Movie ───────► City ─────────► Theatre ────────► Date/Time ────────► Show ID ────────► Seat Map

Journey 3 (Theatre-First):
   Theatre ─────► Movie ────────► Showtimes ──────────────────────────► Show ID ────────► Seat Map

Journey 4 (Show-First / Deep-Link):
   Promotional Link / QR / Push ──────────────────────────────────────► Show ID ────────► Seat Map
```

---

### 2. The Single Show ID Resolution Law

The fundamental database and domain design principle established in Phase 2 Part 8 and Part 9 dictates:
> **The Show is the central operational entity.**
> Movies, auditoriums (halls), and seat templates NEVER store ticket prices or live booking state. A Hall layout is a reusable physical asset. A Movie is a platform-wide creative asset.
>
> When a customer hits `/booking/[showId]`, CineSphere OS resolves **all necessary dependencies in one unified snapshot** directly from that single `Show ID`:
> - Movie metadata (Title, Poster, Certificate, Duration, Language, Format)
> - Theatre details (Name, Address, City, Amenities, Direct UPI rails)
> - Hall & Physical Layout (Rows, Columns, Capacity, Screen Curvature)
> - Seat Inventory (Show-specific seats with generated labels and assigned section prices)
> - Pricing Profile (Base prices, Section tiers, Convenience fee, GST)
> - Section Legends & Availability (Color palette, total seats, remaining seats)
> - Capacity Metrics (Occupancy %, available seats, booked seats)

This eliminates multi-hop client roundtrips, prevents partial data mismatch, and ensures strict tenant isolation.

---

### 3. Core Components Implemented

#### 3.1 Domain Types (`types/customer-discovery.types.ts`)
- `CustomerCity`: City location with slug, state, theatre count, and popular tags.
- `CustomerMovieDTO`: Public-safe movie payload with genres, formats, certificates, and starting prices.
- `CustomerTheatreDTO`: Public-safe theatre payload with distance, screen formats, and amenities.
- `CustomerShowDTO`: Canonical show screening event linking film, auditorium, date, and section prices.
- `CustomerSeatDTO`: 2D seat coordinate with row, column, section tier, unit price, and wheelchair/recliner traits.
- `CustomerSectionLegendDTO`: Palette mapping, price, and remaining inventory counter.
- `CustomerShowDetailsResponse`: Unified single-payload DTO returned for `/booking/[showId]`.
- `CustomerPriceSummaryDTO`: Real-time calculation DTO for UI seat selection, subtotal, convenience fee, and GST.

#### 3.2 State Management (`store/city-store.ts`)
- Client-side persistent Zustand store (`cinesphere-customer-city-storage`).
- Manages:
  - `selectedCity` (Default: Pune, Maharashtra).
  - `cities` catalogue (Pune, Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai, Ahmedabad, Kolkata).
  - `recentCities` history.
  - `isCityModalOpen` modal visibility.
  - GPS auto-detection placeholder.

#### 3.3 Discovery Engine (`lib/engine/customer-discovery-engine.ts`)
- Pure, deterministic engine providing:
  - `getAllPublishedMovies()` & `getFilteredMovies()`
  - `getAllPublishedTheatres()` & `getFilteredTheatres()`
  - `getAllPublishedShows()` & `getFilteredShows()`
  - `getUnifiedCustomerShowDetails(showId)`: Central resolver for single Show ID snapshot.
  - `calculateCustomerPriceSummary(selectedSeats, showDetails)`: Computes subtotal, convenience fee (₹35/seat), GST (18%), and grand total.

#### 3.4 User Interface Upgrades

1. **Global City Selector Modal (`components/navigation/city-selector-modal.tsx`)**:
   - Search by city or state name.
   - Popular city quick-select chips.
   - Recent search history chips.
   - Keyboard accessible and responsive.
   - Connected globally in `components/layout/navbar.tsx`.

2. **Movie Discovery Hub (`app/(public)/movies/page.tsx`)**:
   - 5 Discovery Tabs: *Now Showing*, *Coming Soon*, *Trending*, *Recommended*, *Recently Viewed*.
   - Filter Facets: Genre, Language, Format, Certificate, City badge with "Change City" button.
   - Search input with instant client filtering.
   - Pagination and empty states.

3. **Movie Detail & Show Selection (`app/(public)/movie/[slug]/page.tsx`)**:
   - Breadcrumb navigation (`Home > Movies > [Movie]`).
   - Active city switcher pill.
   - 7-Day Date Selector Strip (Today, Tomorrow, and subsequent days).
   - Format & Language filter pills.
   - Multiplex cards grouped by Theatre, featuring showtime pills linking to `/booking/[showId]`.

4. **Theatre Discovery Hub (`app/(public)/theatres/page.tsx`)**:
   - Active city context bar with toggle to view complexes in active city or browse nationwide.
   - Format filters: IMAX with Laser, Dolby Cinema, 4DX Motion, VIP Recliners, Gourmet Dining, Valet Parking.
   - Cards displaying: Complex Name, Address, Geo-calibrated Distance (`2.4 km away`), Screen Types, Amenities, Lowest Ticket Price (`From ₹200`), Available Shows count, and direct link to `/theatre/[slug]`.

5. **Theatre Detail & Showtimes (`app/(public)/theatre/[slug]/page.tsx`)**:
   - High-res hero banner with chain badge, rating, and address.
   - 7-Day Date Tab Selector.
   - Movies grouped with showtime pills displaying start time, format, auditorium name, ticket price, and availability status (`Available` or `Filling Fast`).
   - Auditorium fleet breakdown with screen types, projection, and sound systems.
   - Multiplex amenities (Gourmet food court, Valet parking, Accessibility services).

6. **Unified Seat Selection & Layout (`app/(public)/booking/[showId]/page.tsx`)**:
   - Resolves exclusively from `showId`.
   - Top breadcrumb: `Home > [City] > [Movie Title] > [Theatre Name] > [Show Time] > Seat Selection`.
   - Multi-show switcher pill bar to toggle alternate showtimes.
   - Curved screen indicator ("Auditorium Screen — All Eyes This Way").
   - Acoustic sweet spot & emergency exits.
   - 2D Interactive Seating Grid grouped by Sections:
     - Section colors adhering to design tokens:
       - Silver: Blue (`#38BDF8`)
       - Gold: Yellow (`#FBBF24`)
       - Platinum: Red (`#EF4444`)
       - VIP: Purple (`#A855F7`)
       - Recliner: Green (`#10B981`)
       - Royal Suite: Rose (`#F43F5E`)
     - Real-time seat selection with Amber checkmark badge.
     - Booked (muted cross) and Reserved seat status.
     - Wheelchair and Recliner markers.
   - Dynamic Section Legends with pricing and remaining seat counts.
   - Real-time Price Summary Sidebar:
     - Selected seats line items with quick remove.
     - Subtotal, Convenience fee, GST, and Grand total in bold Emerald INR.
     - Proceed to Reserve button with Phase 2 Part 10 architectural completion modal.

---

### 4. Verification & Scope Boundaries

- **Strict Scope Boundaries Maintained**:
  - No database schema modifications.
  - No booking confirmation or payment gateway processed (reserved for Phase 2 Part 11).
  - No realtime concurrency locks or Three.js 3D meshes (reserved for subsequent phases).
  - Strict tenant isolation: customer discovery only queries published, active entities.

