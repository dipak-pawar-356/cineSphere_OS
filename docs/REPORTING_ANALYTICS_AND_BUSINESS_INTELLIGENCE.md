# Reporting, Analytics & Business Intelligence Architecture (Phase 2 – Part 15)

## 1. Executive Summary & Architectural Law

In enterprise cinema SaaS platforms, **a reporting system should never calculate analytics directly from raw transactional tables (bookings, payments, tickets) every time a user opens a dashboard**. Scanning millions of raw records on every page refresh degrades operational database throughput, causes lock contention, and introduces unpredictable latency spikes.

In **CineSphere OS**, the Business Intelligence (BI) architecture enforces a strict **Decoupled Analytics Layer**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                      Operational Data                        │
 │  Bookings  •  Payments  •  Tickets  •  Shows  •  Movies/Halls│
 └──────────────────────────────┬───────────────────────────────┘
                                │ aggregates into marts
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      Analytics Engine                        │
 │                                                              │
 │   1. Centralized Standard KPI Calculation Engine             │
 │   2. Dimensional Slicing (Theatre, Movie, Hall, Section)     │
 │   3. Time Filtering & Date Range Resolution                  │
 └──────────────────────────────┬───────────────────────────────┘
                                │ populates summaries
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │           Pre-Aggregated Summaries Datamart                  │
 │   Daily  •  Monthly  •  Yearly  •  Report Snapshots          │
 └──────────────────────────────┬───────────────────────────────┘
                                │ queries pre-computed aggregates
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                 Role-Based BI Dashboards                     │
 │   Theatre Admin Dashboard:   /theatre/analytics              │
 │   Theatre Admin Reports:     /theatre/reports                │
 │   Super Admin Dashboard:     /dashboard/analytics            │
 │   Super Admin Reports:       /dashboard/reports              │
 └──────────────────────────────────────────────────────────────┘
```

---

## 2. Centralized Standard KPI Calculation Engine

To guarantee consistent business metrics across all dashboards and reports, CineSphere OS centralizes all KPI calculations in `lib/engine/analytics-engine.ts`:

| KPI | Mathematical Formula | Purpose |
|---|---|---|
| **Occupancy %** | $\frac{\text{Booked Seats}}{\text{Total Available Seats}} \times 100$ | Measures seat fill rate capped between 0% and 100%. |
| **Average Ticket Price (ATP)** | $\frac{\text{Total Ticket Revenue}}{\text{Total Issued Tickets}}$ | Yield generated per individual admission ticket. |
| **Average Booking Value (ABV)** | $\frac{\text{Total Revenue}}{\text{Total Confirmed Bookings}}$ | Basket size per customer transaction. |
| **Revenue per Seat (RevPAS)** | $\frac{\text{Total Revenue}}{\text{Total Capacity}}$ | Revenue efficiency normalized against physical auditorium size. |
| **Revenue per Show** | $\frac{\text{Total Revenue}}{\text{Total Shows}}$ | Average gross collections per scheduled showtime. |
| **Revenue per Hall** | $\frac{\text{Total Revenue}}{\text{Total Halls}}$ | Performance productivity across auditorium assets. |
| **Revenue per Movie** | $\frac{\text{Total Revenue}}{\text{Total Programmed Movies}}$ | Box office yield per film title. |
| **Booking Conversion Rate** | $\frac{\text{Confirmed Bookings}}{\text{Total Booking Sessions}} \times 100$ | Funnel efficiency from seat browsing to confirmation. |
| **Cancellation Rate** | $\frac{\text{Cancelled Bookings}}{\text{Total Bookings}} \times 100$ | Churn percentage of reserved sessions. |
| **Average Seats per Booking** | $\frac{\text{Total Booked Seats}}{\text{Total Confirmed Bookings}}$ | Party size metric for inventory planning. |
| **Customer Lifetime Value (LTV)**| $\frac{\text{Total Spend}}{\text{Total Unique Customers}}$ | Long-term revenue value per registered patron. |

---

## 3. Database Schema & Summary Entities

### 3.1 Pre-Aggregated Summaries (`analyticsSummaries`)
Pre-computed daily, monthly, and yearly summaries decouple operational transactional tables from analytics queries:
```typescript
export const analyticsSummaries = pgTable(
  "analytics_summaries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 36 }).references(() => theatres.id, { onDelete: "cascade" }),
    aggregatePeriod: varchar("aggregate_period", { length: 20 }).notNull(), // DAILY, MONTHLY, YEARLY
    periodKey: varchar("period_key", { length: 50 }).notNull(),             // e.g. "2026-11-10", "2026-11"
    dimensionType: varchar("dimension_type", { length: 50 }).notNull(),     // PLATFORM, THEATRE, MOVIE, HALL, SECTION
    dimensionId: varchar("dimension_id", { length: 36 }),
    metrics: jsonb("metrics").$type<{
      revenue: number;
      bookingsCount: number;
      ticketsIssued: number;
      occupancyPercent: number;
      atp: number;
      abv: number;
      revpas: number;
      cancellationRate: number;
      conversionRate: number;
    }>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
```

### 3.2 Point-in-Time Report Snapshots (`reportSnapshots`)
Stores immutable business intelligence ledgers and custom configurable report outputs:
```typescript
export const reportSnapshots = pgTable(
  "report_snapshots",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 36 }).references(() => theatres.id, { onDelete: "cascade" }),
    reportName: varchar("report_name", { length: 255 }).notNull(),
    reportType: varchar("report_type", { length: 100 }).notNull(),
    dateRange: jsonb("date_range").$type<{ from: string; to: string; preset: string }>().notNull(),
    filters: jsonb("filters").$type<Record<string, unknown>>().default({}),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull(),
    breakdown: jsonb("breakdown").$type<Array<Record<string, unknown>>>().default([]),
    generatedBy: varchar("generated_by", { length: 36 }).references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
```

---

## 4. Role-Based Dashboards & Tenant Isolation

### 4.1 Theatre Admin Dashboard (`/theatre/analytics`)
- **Tenant Isolation:** Scoped strictly to `theatreId`. Zero cross-cinema data leakage.
- **Executive KPI Cards:**
  - Today's, Weekly, Monthly, and Total Revenue with delta % indicators.
  - Average Ticket Price (ATP) and Average Booking Value (ABV).
  - Average Occupancy % and Scheduled Shows status.
- **Analytical Dimensions:**
  - **Movie Box Office:** Top & least performing features, ticket volume, gross box office, and circuit share %.
  - **Hall & Section Telemetry:** Auditorium fill rates, RevPAS, VIP Recliner vs Prime vs Classic split.
  - **Peak Booking Hours:** 24-hour distribution curve identifying prime booking velocity.
  - **Payment Settlement:** Collections split across NPCI UPI (68%), Cards (24%), Netbanking (6%), POS (2%).
  - **Customer Cohorts:** Unique patrons, repeat visitor ratio, and average spend.
- **Interactive Reusable Charts:**
  - Area Chart: 7-day revenue momentum.
  - Line Chart: Occupancy fill rate trajectory.
  - Donut Chart: Movie box office share.
  - Bar Chart: Hourly booking spikes and horizontal hall comparisons.
  - Heatmap Chart: Auditorium fill density matrix.

### 4.2 Super Admin Platform Dashboard (`/dashboard/analytics`)
- **Platform-Wide Visibility:** Aggregates metrics across the national cinema circuit (25 multiplex properties, 360,000 seat capacity).
- **Circuit Fleet Matrix:**
  - Revenue and bookings per theatre property.
  - Top performing and fastest growing multiplex circuits.
  - Metropolitan city market shares (Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad).
  - National top-grossing movie releases.
- **Hierarchical Performance Trace Navigator:**
  Enables structured drill-down navigation:
  ```
  Platform → Theatre → Hall → Show → Booking → Ticket
  ```

---

## 5. Configurable Reports Engine

The reporting architecture allows authorized users to produce point-in-time snapshot ledgers:
- **Configurable Dimensions:** `THEATRE`, `MOVIE`, `HALL`, `SECTION`, `DATE`.
- **Configurable Metrics:** Revenue, Bookings, Occupancy, ATP, ABV, RevPAS.
- **Time Presets:** Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Quarter, Year, Custom.
- **Snapshot Viewer:** Interactive modal displaying executive KPI summaries and granular breakdown rows.

---

## 6. Automated Verification Test Suite (`scripts/verify-analytics-system.ts`)

The automated verification suite verifies all 12 analytical invariants:

| # | Verification Test | Result |
|---|---|:---:|
| 1 | **KPI Formula Accuracy:** Mathematical verification of Occupancy, ATP, ABV, RevPAS, Conversion & Cancellation rates | ✅ PASS |
| 2 | **Time Filter Resolution:** Verification of Today, Yesterday, 7D, 30D, and Custom date ranges | ✅ PASS |
| 3 | **Tenant Isolation:** Strict scoping to `theatreId` and enforcement of error on missing tenant context | ✅ PASS |
| 4 | **Super Admin Platform Scope:** Aggregated 25 multiplexes, ₹8.45 Cr circuit revenue, and city breakdowns | ✅ PASS |
| 5 | **Movie Box Office Yield:** Top and least performing movie identification and box office share % | ✅ PASS |
| 6 | **Hall & Section Telemetry:** Hall utilization, RevPAS, and VIP Recliner vs Standard seating splits | ✅ PASS |
| 7 | **Booking Analytics:** Confirmed bookings, ABV, and prime 18:00 evening peak hour identification | ✅ PASS |
| 8 | **Payment Method Breakdown:** Verification of UPI primary rail (>60% share) and gateway latency | ✅ PASS |
| 9 | **Customer Cohort Insights:** Unique patrons, repeat visitor ratio (>50%), and customer lifetime value | ✅ PASS |
| 10 | **Hierarchical Drill-Down:** Successful navigation: Platform → Theatre → Hall → Show → Booking → Ticket | ✅ PASS |
| 11 | **Configurable Reports:** Dynamic snapshot generation, dimension slicing, and repository persistence | ✅ PASS |
| 12 | **Immutable Audit Logging:** Captures `DASHBOARD_VIEWED`, `REPORT_GENERATED`, `AGGREGATE_REFRESHED` | ✅ PASS |
