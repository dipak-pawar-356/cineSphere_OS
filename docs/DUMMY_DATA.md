# CineSphere OS - Centralized Mock Data Guide

## 1. Overview & Data Conventions

The mock data layer in `data/` provides deterministic, production-realistic test data designed to fuel every UI view without external backend dependencies.

### Key Conventions
- **Currency:** Strictly Indian Rupee (INR `₹`) with `en-IN` numbering (`formatCurrency(86450200)` -> `"₹8.64 Cr"` or `"₹8,64,50,200"`).
- **Timezone:** `Asia/Kolkata` (IST - UTC+05:30).
- **Flagship Cinema ID:** `th-pun-001` (*CineSphere Grand Cinemas*, Phoenix Marketcity, Pune).
- **Foreign Keys:** All theatre halls, shows, bookings, transactions, staff records, and local offers cross-reference `theatreId: "th-pun-001"`.

---

## 2. Directory Layout & Modules

```
data/
├── utils/
│   ├── mock-constants.ts     # Locale, Currency, Timezone
│   └── mock-formatters.ts    # formatCurrency, formatNumber, formatPercent
├── common/
│   ├── locations.ts          # 12 Indian metropolitan cities (Mumbai, Pune, Delhi NCR...)
│   ├── amenities.ts          # Cinema hardware amenities & guest facilities
│   └── users.ts              # Mock user profiles for all 5 enterprise roles
├── public/
│   ├── movies.ts             # 15 complete movie profiles (synopsis, cast, crew, ratings)
│   ├── theatres.ts           # 10 premier Indian cinema venues
│   ├── events.ts             # 8 live events (comedy, concerts, F1, sports)
│   ├── offers.ts             # 8 promotional coupon bundles & student passes
│   ├── testimonials.ts       # 6 customer & filmmaker reviews
│   ├── partners.ts           # 10 industry partners (Barco, Dolby, IMAX, Razorpay)
│   ├── faqs.ts               # 20 FAQs across 7 categories
│   └── navigation.ts         # Public header & luxury footer configurations
├── platform/
│   ├── platform-overview.ts   # Macro platform metrics (₹8.64 Cr revenue, 1.24L bookings)
│   ├── platform-statistics.ts # Monthly growth trends, city-wise splits, format share
│   ├── platform-status.ts     # 7 core infrastructure health indicators
│   └── activities.ts          # Immutable platform-wide audit log trail
├── theatre/                  # Flagship Cinema (th-pun-001) datasets
│   ├── theatre-info.ts       # Current cinema metadata
│   ├── halls.ts              # 8 auditoriums (IMAX Laser, Dolby Cinema, 4DX, Royal Suite)
│   ├── shows.ts              # Daily 10-show schedule matrix
│   ├── bookings.ts           # Customer ticket bookings stream
│   ├── customers.ts          # Registered local patrons & VIP members
│   ├── staff.ts              # Operational roster & employee codes
│   ├── revenue.ts            # Daily/monthly box office & concessions split
│   ├── transactions.ts       # Gateway transaction audit trail
│   ├── offers.ts             # Local venue promotional discounts
│   ├── events.ts             # Venue live events
│   ├── notifications.ts      # Equipment & housefull operational alerts
│   ├── reports.ts            # Box office reconciliation & GST filings
│   └── support-tickets.ts    # Guest care helpdesk tickets
├── dashboard/
│   ├── super-admin.ts        # Super Admin metric cards & pending approvals
│   └── theatre-admin.ts      # Theatre Admin metric cards & hall occupancy summary
└── index.ts                  # Master barrel export
```

---

## 3. Consuming Mock Data in Components

Always import mock data directly from `@/data` or models from `@/types`:

```typescript
import { MOCK_MOVIES, formatCurrency } from "@/data";
import type { Movie } from "@/types";

export function FeaturedMovies() {
  const featured = MOCK_MOVIES.filter((m) => m.isFeatured);
  
  return (
    <div>
      {featured.map((movie) => (
        <span key={movie.id}>{movie.title}</span>
      ))}
    </div>
  );
}
```
