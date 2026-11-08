# 🎬 CineSphere OS — Phase 2 - Part 7: Movie Management System Architecture

## 📌 Executive Summary & Architectural Mandate

In enterprise multi-tenant cinema SaaS platforms (such as BookMyShow, Vista Cinema, PVR INOX, AMC Theatres), **a Movie is a platform-level master entity, NOT a theatre-owned entity**. 

A single blockbuster film (such as *Dune: Part Two* or *Interstellar*) is screened across hundreds of independent cinema complexes, multiplexes, and auditoriums worldwide. If theatres were permitted to define their own independent movie records, the platform would suffer from:
1. **Severe Data Duplication & Divergence:** Different theatres would enter conflicting runtimes, inconsistent posters, misspelled director/actor names, and broken trailer links.
2. **Fragmented Search & Customer Experience:** Platform-wide search engines and discovery portals would return 50 duplicate instances of the same film.
3. **Broken Global Analytics:** Box-office aggregators and licensing distributors would be unable to aggregate collections for a canonical film title across tenant complexes.

To eliminate redundancy and establish enterprise integrity, CineSphere OS enforces a strict **Two-Layer Movie Architecture**:

```
                              ┌──────────────────────────────────────────┐
                              │       GLOBAL MASTER MOVIE LIBRARY        │
                              │   (Platform Layer / Super Admin View)    │
                              │            /dashboard/movies             │
                              └────────────────────┬─────────────────────┘
                                                   │
                  One Master Record                │  1-Click Exhibition Licensing
               (Canonical Metadata,                │  (Zero Metadata Duplication)
               Media Vault, Cast/Crew)             │
                                                   ▼
                              ┌──────────────────────────────────────────┐
                              │        THEATRE EXHIBITION CATALOG        │
                              │   (Tenant Layer / Theatre Admin View)    │
                              │             /theatre/movies              │
                              └────────────────────┬─────────────────────┘
                                                   │
                                                   │  Connects Canonical Film
                                                   │  to Physical Aud & Timetable
                                                   ▼
                                         ┌────────────────────┐
                                         │   SHOW SCHEDULING  │
                                         │ (Phase 2 - Part 8) │
                                         └─────────┬──────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        ┌─────────────────────┐                                         ┌─────────────────────┐
        │  PVR Phoenix (Pune) │                                         │ INOX Megaplex (MUM) │
        │    IMAX Laser 3D    │                                         │       4DX 3D        │
        │      10:00 AM       │                                         │       02:30 PM      │
        │   Pricing: ₹350+    │                                         │    Pricing: ₹450+   │
        └─────────────────────┘                                         └─────────────────────┘
```

---

## 🏛️ 1. Two-Layer Architecture Overview

### Layer 1: Global Master Movie Library (`/dashboard/movies`)
- **Authority:** Managed exclusively by the **Super Admin** (`SUPER_ADMIN`, Role Level 100).
- **Scope:** Canonical platform-wide master film records.
- **Responsibilities:**
  - Standardized film specifications (official title, slug, runtime in minutes, censor certification `U`, `UA 13+`, `UA 16+`, `A`, `S`).
  - Synopsis, short marketing pitch, production house, international distributor, release date.
  - High-resolution media vault (official portrait poster, 21:9 landscape billboard, high-res gallery stills).
  - Official trailer integration (YouTube / Vimeo embed identifiers, promotional teasers).
  - Complete Cast & Crew roster with character names, departments, and profile headshots.
  - Global exhibition status (`Draft`, `Upcoming`, `Now Showing`, `Archived`).

### Layer 2: Theatre Exhibition Catalog (`/theatre/movies`)
- **Authority:** Managed by **Theatre Admins** (`THEATRE_ADMIN`, Role Level 80).
- **Scope:** Tenant-scoped exhibition licenses for a specific physical cinema venue (e.g., `th-pun-001`).
- **Responsibilities:**
  - Browses the platform's Global Master Library via a 1-click discovery modal (`TheatreMovieCatalogBrowserModal`).
  - Ingests canonical films into the cinema's local roster **without duplicating metadata**.
  - Manages tenant-specific exhibition status (`Now Showing`, `Upcoming`, `Archived`).
  - Tracks DCI / SMPTE digital cinema security: **KDM (Key Delivery Message)** decryption key status (`Valid`, `Pending`, `Expired`) and cryptographic key IDs.
  - Specifies locally licensed screening formats (e.g. `IMAX 3D`, `Dolby Atmos`, `Standard 2D`) and dubbed language audio streams.

---

## 📐 2. The Golden Invariant: Decoupled Show Connector

In CineSphere OS:
$$\text{Movie} \neq \text{Show} \neq \text{Hall} \neq \text{Pricing}$$

```
Movie (Dune: Part Two)
  │
  ├── Show 1: Theatre A (Pune)   ── Hall 1 (IMAX)   ── 10:00 AM ── [Template + Pricing A]
  │
  ├── Show 2: Theatre A (Pune)   ── Hall 2 (Dolby)  ── 02:30 PM ── [Template + Pricing B]
  │
  └── Show 3: Theatre B (Mumbai) ── Hall 5 (4DX)    ── 08:00 PM ── [Template + Pricing C]
```

### Prohibited Invariants in Movie Entities:
1. ❌ **No Hall Allocations:** Movies do not store auditorium IDs.
2. ❌ **No Showtimes:** Movies do not store dates, screening times, or schedules.
3. ❌ **No Seat Pricing:** Movies do not store ticket prices, convenience fees, or discounts.
4. ❌ **No Bookings or Tickets:** Bookings belong strictly to a specific Show inventory.

---

## 🗃️ 3. Data Structures & Type Contracts (`types/movie-management.types.ts`)

### Global Master Movie Contract
```typescript
export interface GlobalMasterMovie {
  id: string; // e.g. "mov-dune-2"
  slug: string; // e.g. "dune-part-two-2024"
  title: string;
  originalTitle?: string;
  synopsis: string;
  shortDescription?: string;
  fullDescription?: string;
  durationMinutes: number; // e.g. 166
  releaseDate: string; // YYYY-MM-DD
  certificate: MovieCertificate; // "U" | "UA" | "UA 13+" | "UA 16+" | "A" | "S"
  status: MasterMovieStatus; // "Draft" | "Upcoming" | "Now Showing" | "Archived"
  primaryLanguage: string; // e.g. "English"
  availableLanguages: string[]; // ["English", "Hindi", "Tamil", "Telugu"]
  formats: MovieScreenFormat[]; // ["2D", "3D", "IMAX 2D", "IMAX 3D", "4DX", "Dolby Cinema"]
  genres: string[]; // ["Sci-Fi", "Adventure", "Action"]
  productionHouse: string;
  distributor?: string;
  country: string;
  imdbRating?: number;
  websiteUrl?: string;

  // Media Vault
  posterUrl: string;
  bannerUrl: string;
  landscapeBannerUrl?: string;
  portraitBannerUrl?: string;
  galleryImages: MovieGalleryImage[];

  // Trailers
  trailers: MovieTrailerItem[];

  // Cast & Crew Roster
  cast: MovieCastItem[];
  crew: MovieCrewItem[];

  // Metadata
  rating?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Theatre Catalog Item Contract
```typescript
export interface TheatreMovieCatalogItem {
  id: string; // e.g. "tmc-th-pun-001-mov-dune-2"
  theatreId: string; // e.g. "th-pun-001"
  movieId: string; // References GlobalMasterMovie.id
  status: "Now Showing" | "Upcoming" | "Archived";
  licensedFormats: MovieScreenFormat[];
  licensedLanguages: string[];
  kdmStatus: "Valid" | "Pending" | "Expired";
  kdmKeyId?: string;
  kdmExpiresAt?: string;
  ingestedAt: string;
  updatedAt: string;
}
```

---

## ⚡ 4. Server Actions & Audit Trail (`actions/movie-actions.ts`)

All state modifications are protected by enterprise Next.js Server Actions with tamper-evident audit logging:

| Server Action | Description | RBAC Level | Audit Log Action |
|---|---|---|---|
| `createMovieAction` | Validates specifications and generates a canonical master film | `SUPER_ADMIN` (100) | `MOVIE_CREATED` |
| `updateMovieAction` | Modifies canonical metadata, media links, and rosters | `SUPER_ADMIN` (100) | `MOVIE_UPDATED` |
| `archiveMovieAction` | Transitions exhibition status to `Archived` | `SUPER_ADMIN` (100) | `MOVIE_ARCHIVED` |
| `restoreMovieAction` | Restores archived film to `Upcoming` or `Now Showing` | `SUPER_ADMIN` (100) | `MOVIE_RESTORED` |
| `deleteMovieAction` | Soft-deletes film (`isDeleted: true`) preserving audit history | `SUPER_ADMIN` (100) | `MOVIE_DELETED` |
| `duplicateMovieAction` | Clones master record with unique `-COPY` slug for fast drafting | `SUPER_ADMIN` (100) | `MOVIE_DUPLICATED` |
| `uploadMovieMediaAction` | Registers promotional assets and poster URLs into Media Vault | `SUPER_ADMIN` (100) | `MOVIE_MEDIA_UPLOADED` |
| `linkMovieToTheatreAction` | Acquires exhibition rights for tenant cinema without data duplication | `THEATRE_ADMIN` (80) | `THEATRE_MOVIE_LINKED` |
| `toggleTheatreMovieStatusAction` | Updates local cinema exhibition status (`Now Showing` / `Archived`) | `THEATRE_ADMIN` (80) | `THEATRE_MOVIE_STATUS_CHANGED` |

---

## 🖥️ 5. User Interface & Control Planes

### Super Admin Control Plane (`/dashboard/movies`)
1. **Executive Telemetry Cards:**
   - Total Platform Films (Active catalog count).
   - Now Showing Releases (Current theatrical run).
   - Upcoming Releases (Advance booking pipeline).
   - IMAX / Premium Format Catalog Coverage.
2. **Multi-Faceted Search & Discovery:**
   - Real-time text search across Title, Original Title, and Synopsis.
   - Filter pills by Censor Certificate, Screening Format, and Status.
   - Grid View (movie poster cards with format chips) and Enterprise Table View.
3. **Master Movie Ingestion Modal (`MasterMovieFormModal`):**
   - 5 structured tabs: *General Specs*, *Languages & Formats*, *Media Vault*, *Trailers & Teasers*, and *Cast & Crew Roster*.
   - Live client-side validation for slug uniqueness, URL protocols, and required fields.
4. **Master Movie Inspector (`/dashboard/movies/[id]` & `MasterMovieDetailModal`):**
   - 21:9 cinematic backdrop with floating poster art.
   - Interactive cast & crew grid with profile thumbnails.
   - Embedded video trailer launcher supporting YouTube and Vimeo feeds.

### Theatre Admin Control Plane (`/theatre/movies`)
1. **Tenant Exhibition Roster:**
   - Displays movies licensed specifically to the current cinema venue.
   - Shows DCI KDM security decryption key status badges (`Valid`, `Pending`, `Expired`).
   - Format and language tags indicating local auditorium compatibility.
2. **1-Click Global Catalog Browser (`TheatreMovieCatalogBrowserModal`):**
   - Allows Theatre Admins to search the global master movie database.
   - Filters by title, genre, and available formats.
   - Ingests films directly into the cinema's local lineup with a single click.
   - Disables already-licensed titles to prevent accidental duplicate licensing.

---

## 🧪 6. Quality Assurance & Verification

The Movie Management System has passed rigorous verification:
- **TypeScript Strict Mode:** Verified with `tsc --noEmit` (0 errors).
- **ESLint Validation:** Verified with `next lint` (0 errors).
- **Zustand Hydration:** Hydration-safe state access across Super Admin and Theatre Admin stores.
- **Responsive Ergonomics:** 100% styled in CineSphere OLED Void Palette (`#050507`), with glassmorphic cards, gold highlights, and responsive breakpoints from mobile to ultrawide displays.

