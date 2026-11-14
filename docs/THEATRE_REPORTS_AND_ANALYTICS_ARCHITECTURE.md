# CineSphere OS — Reports & Analytics Architecture (Phase 3 – Part 15)

## 1. Executive Summary & Architectural Philosophy

In enterprise cinema operations, a fundamental failure mode is coupling operational dashboards with analytical reporting. 
- **Operational Dashboard (Phase 3 – Part 11):** Focuses on low-latency, real-time telemetry (today's bookings, gate check-in throughput, active auditorium status, and incident alerting). Queries must be write-optimized and instantaneous.
- **Reports & Analytics (Phase 3 – Part 15):** Focuses on historical, aggregated, deeply filterable business intelligence spanning days, weeks, months, quarters, and years across multiple venues, distributor splits, tax ledgers, and demographic segments.

Querying transactional tables (`Bookings`, `Payments`, `Shows`, `Halls`, `AuditLogs`) directly for historical BI queries results in table lock contention, database degradation, and inconsistent metric reporting.

CineSphere OS resolves this through a dedicated, decoupled **Analytics & Reporting Layer** structured around:
1. **Decoupled Read-Model Aggregation Store:** Analytical read models separated from transactional write operations.
2. **Central Metric Registry:** A single source of truth for canonical KPI formulas (ATV, RevPAS, Occupancy %, Cancellation Rate, Screen Efficiency, MoM Growth Rates).
3. **Configurable Report Definitions Registry:** Metadata-driven templates defining supported dimensions, metrics, time presets, and RBAC permissions.
4. **Universal Report Builder & Exporters:** Generating formatted payloads, chart series distributions, and CSV/JSON/PDF serialization formats.
5. **Multi-Tenant Isolation & Autonomous Localization:** Strict tenant scoping preventing cross-theatre data leakage while supporting multi-currency, timezone, and numbering formats (e.g., Pune `INR` Lakhs vs Mumbai `USD` vs Dubai `AED`).

```
Platform
   │
   ▼
Analytics Engine
   │
   ├── Revenue Analytics
   ├── Booking Analytics
   ├── Occupancy Analytics
   ├── Customer Analytics
   ├── Payment Analytics
   ├── Movie Analytics
   ├── Hall Analytics
   ├── Theatre Growth Analytics
   ├── KPI Engine
   └── Report Builder
           │
           ▼
       Reports UI
```

---

## 2. The 10 Core Report Categories

| # | Category Key | Report Definition | Key Dimensions | Key Metrics & Formulas |
|---|--------------|-------------------|----------------|------------------------|
| 1 | `REVENUE_REPORTS` | Comprehensive Box Office & Revenue Breakdown | Date, Movie, Hall, Show, Payment Method | Daily, Weekly, Monthly Gross & Net Revenue, Average Ticket Value (ATV), RevPAS |
| 2 | `OCCUPANCY_REPORTS` | Auditorium Seat Occupancy & Capacity Audit | Date, Hall, Show, Format | Occupancy Rate %, Hall Utilization %, Average Attendance, Peak (18:00–21:00) vs Low (10:00–13:00) slots |
| 3 | `HALL_PERFORMANCE` | Auditorium Fleet Yield & Screen Utilization | Hall, Screen Format, Date | Bookings per hall, Revenue per hall, Screen Efficiency Rate, Top vs Least Performing Screen |
| 4 | `MOVIE_PERFORMANCE` | Film Exhibition Box Office & Attendance Matrix | Movie, Language, Format, Date | Box office gross, Admissions count, Average attendance per show, Screening count |
| 5 | `BOOKING_TRENDS` | Booking Velocity & Cancellation Curves | Date, Show | Confirmed vs Cancelled admissions, Cancellation Rate %, Average Booking Value (ABV), Channel sources |
| 6 | `CUSTOMER_ANALYTICS` | Patron Retention, Frequency & Spend Profiles | Date | New vs Returning patrons, Customer Return Rate %, Average spend per customer, Visit frequency |
| 7 | `PAYMENT_ANALYTICS` | Payment Gateway Settlements & Rail Reconciliation | Payment Method, Date | Gateway Success Rate %, Failures count, Rail breakdown (UPI, Card, NetBanking, Cash), Settled volume |
| 8 | `THEATRE_GROWTH` | Theatre MoM Growth & Expansion Telemetry | Date | Revenue MoM %, Booking MoM %, Occupancy MoM %, Customer MoM %, Multi-year comparisons |
| 9 | `OPERATIONAL_KPIS` | Daily Operational Efficiency & Screen Productivity | Hall, Date | Total admissions, Screen efficiency rate, Turnstile throughput, Interval turnaround minutes |
| 10 | `EXECUTIVE_SUMMARY` | Executive Board Briefing & High-Level Scorecard | Date, Movie, Hall | Headline KPIs, Top revenue drivers, Operational highlights, Hall ranking scorecard |

---

## 3. Metric Registry & Pure KPI Engine

All metric calculations are pure functions defined within `lib/analytics/kpi-engine.ts` and registered in `lib/analytics/metric-registry.ts`:

- **Occupancy Rate:**
  $$\text{Occupancy Rate} = \left(\frac{\text{Seats Booked}}{\text{Total Available Seats}}\right) \times 100$$
- **Average Ticket Value (ATV):**
  $$\text{ATV} = \frac{\text{Total Gross Revenue}}{\text{Total Confirmed Tickets}}$$
- **Revenue Per Available Seat (RevPAS):**
  $$\text{RevPAS} = \frac{\text{Total Gross Revenue}}{\text{Total Hall Capacity}}$$
- **Hall Utilization:**
  $$\text{Hall Utilization} = \left(\frac{\text{Active Screen Hours}}{\text{Total Operating Hours}}\right) \times 100$$
- **Cancellation Rate:**
  $$\text{Cancellation Rate} = \left(\frac{\text{Cancelled Bookings}}{\text{Total Bookings}}\right) \times 100$$
- **Payment Gateway Success Rate:**
  $$\text{Success Rate} = \left(\frac{\text{Successful Payments}}{\text{Total Payment Attempts}}\right) \times 100$$
- **Period Growth Rate (MoM / YoY):**
  $$\text{Growth Rate} = \left(\frac{\text{Current Period} - \text{Previous Period}}{\text{Previous Period}}\right) \times 100$$

---

## 4. Multi-Tenant Isolation & Localization Parity

Every analytical query and report generation undergoes strict tenant boundary validation:

```typescript
// Strict Cross-Tenant Guard
if (actor.role !== "SUPER_ADMIN" && actor.theatreId !== requestedTheatreId) {
  throw new TenantAccessError(
    `Cross-tenant analytics access denied: Actor from '${actor.theatreId}' cannot view reports for '${requestedTheatreId}'`
  );
}
```

Autonomous venue localization parameters are preserved across all report outputs:
- **Pune Grand Cinemas (`th-pun-001`):** Currency `INR` (`₹`), Timezone `Asia/Kolkata`, Indian numbering format (Lakhs & Crores: `₹1,84,50,000`).
- **Mumbai Royale Palladium (`th-mum-001`):** Currency `USD` (`$`), Timezone `America/New_York`, International numbering format (`$479,700`).
- **Dubai Palms (`th-dxb-001`):** Currency `AED` (`AED `), Timezone `Asia/Dubai`, Arabic/English language formatting.

---

## 5. Security & Protected Server Actions

All server actions in `actions/theatre-reports-actions.ts` are gated by `createProtectedAction`:
- `generateReportAction`: Gated to `STAFF`, `HALL_MANAGER`, `THEATRE_ADMIN`, `SUPER_ADMIN`.
- `loadAnalyticsSummaryAction`: Gated to `STAFF`, `HALL_MANAGER`, `THEATRE_ADMIN`, `SUPER_ADMIN`.
- `exportReportAction`: Gated to `HALL_MANAGER`, `THEATRE_ADMIN`, `SUPER_ADMIN`.
- `getAvailableReportDefinitionsAction`: Gated to authenticated operational roles.
- `getMetricRegistryAction`: Gated to authenticated operational roles.

---

## 6. Verification & Test Coverage

The test suite in `scripts/verify-theatre-reports-analytics.ts` validates 88 test assertions across 12 distinct test cases:
1. Metric Registry & Pure KPI Engine Formulas
2. Configurable Report Definitions Registry
3. Revenue Analytics Aggregations & Slicing
4. Occupancy Analytics & Peak / Low Slot Detection
5. Hall Fleet Performance & Screen Yield Ranking
6. Movie Performance Analytics & Attendance
7. Booking Demand Curves & Cancellation Rates
8. Customer Cohort Retention, Frequency & Spend
9. Payment Analytics & Gateway Reconciliations
10. Theatre Growth Analytics & MoM Telemetry
11. Multi-Tenant Isolation & Cross-Tenant Access Prevention
12. Universal Report Builder, CSV Exporter & Snapshots
