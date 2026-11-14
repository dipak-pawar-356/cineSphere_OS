# CineSphere OS — Phase 3 Part 11: Theatre Dashboard & Analytics Layer Architecture

## 1. Architectural Philosophy & Executive Summary

In an enterprise multi-tenant cinema SaaS platform, the **Theatre Operational Dashboard** must never be treated as an ad-hoc UI page that directly queries transactional tables (`bookings`, `payments`, `shows`, `halls`, `tickets`). Directly issuing real-time transactional table scans across high-velocity operational tables under peak weekend traffic introduces catastrophic lock contention, query latency spikes, high database CPU usage, and poor scalability.

Instead, CineSphere OS decouples the operational dashboard through a dedicated **Analytics Layer & Materialized Metrics Layer**. The UI strictly consumes pre-aggregated metrics snapshots rather than querying raw transactional records directly:

```
Platform
        │
        ▼
Analytics Engine
        │
        ├── Revenue Metrics
        ├── Booking Metrics
        ├── Occupancy Metrics
        ├── Hall Metrics
        ├── Payment Metrics
        ├── Show Metrics
        ├── Notification Metrics
        └── Dashboard Widgets
                │
                ▼
        Theatre Dashboard
```

This decoupled architecture provides:
1. **Predictable Query Latency:** Pre-aggregated metric snapshots resolve in $<15\text{ms}$ regardless of historical transaction table sizes.
2. **Metadata-Driven Widget Registry:** Widgets are registered declaratively with capability-based RBAC permissions, layout categories, and sizing rather than being hardcoded into page JSX.
3. **Decoupled User Personalization:** User dashboard preferences (visible widgets, custom widget order, collapsed state, default date presets) are stored per operator, completely independent of theatre-level configuration.
4. **Autonomous Multi-Tenant Localization:** Operational metrics automatically reflect each theatre's native localization profile (Currency: INR vs USD vs AED; Timezone: Asia/Kolkata vs America/New_York vs Asia/Dubai; Number formatting: Indian vs International).

---

## 2. Architecture & Domain Model

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CineSphere OS Platform                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        Tenant Boundary Guard (theatreId)
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Analytics Engine & Materialized Layer                │
├────────────────────────────────────────────────────────────────────────┤
│  Pre-Aggregated Operational Metrics:                                   │
│  - Revenue: Today, Yesterday, Growth %, Payment Rail Breakdown, Trends │
│  - Bookings: Volume, Quotas, Confirmed/Cancelled/Pending, Unique Users │
│  - Shows: Running, Upcoming, Completed, Urgent Starting Soon (<60m)    │
│  - Halls: Screen Status (Available, Occupied, Maintenance, Inactive)   │
│  - Occupancy: Live Seat Utilization %, Daily/Weekly Avg, Peak Hours    │
│  - Payments: Completed, Pending, Failed, Refund Reconciliation         │
│  - Alerts: High Occupancy, Optical Maintenance, Unpaid Holds           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Metadata-Driven Widget Registry                      │
├────────────────────────────────────────────────────────────────────────┤
│  Declarative Widget Definitions:                                       │
│  - widget-revenue-metric     (METRIC,  reports:read)                   │
│  - widget-booking-metric     (METRIC,  bookings:read)                  │
│  - widget-occupancy-metric   (METRIC,  shows:read)                     │
│  - widget-halls-status       (STATUS,  halls:read)                     │
│  - widget-shows-overview     (SUMMARY, shows:read)                     │
│  - widget-payments-overview  (SUMMARY, payments:read)                  │
│  - widget-operational-alerts (ALERT,   dashboard:read)                 │
│  - widget-activity-feed      (FEED,    dashboard:read)                 │
│  - widget-quick-actions      (ACTION,  dashboard:read)                 │
│  - widget-system-health      (STATUS,  settings:read)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Per-User Personalization Layer                       │
├────────────────────────────────────────────────────────────────────────┤
│  User Dashboard Preferences:                                           │
│  - visibleWidgetIds: string[]                                          │
│  - widgetOrder: string[]                                               │
│  - collapsedWidgetIds: string[]                                        │
│  - favoriteWidgetIds: string[]                                         │
│  - defaultDatePreset: "TODAY" | "YESTERDAY" | "THIS_WEEK" | "MONTH"    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Theatre Operator Workspace                        │
│                (/theatre and /theatre/dashboard)                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Design

The theatre dashboard persistence tier introduces three dedicated tables in `db/schema/theatre-dashboard.ts`:

### 3.1. `theatre_dashboard_materialized_metrics`
Persists point-in-time materialized analytics snapshots:
- `id`: Primary key (`uuid`).
- `theatreId`: Foreign key to `theatres.id` (multi-tenant boundary index).
- `periodType`: Period type enum (`TODAY`, `YESTERDAY`, `THIS_WEEK`, `THIS_MONTH`, `CUSTOM`).
- `periodStart`, `periodEnd`: Temporal boundaries in UTC.
- `currency`: ISO 4217 currency code.
- `timezone`: IANA timezone string.
- `revenueMetrics`: Structured JSON containing gross revenue, comparisons, average ticket price, and payment rail breakdowns.
- `bookingMetrics`: Structured JSON containing bookings count, cancellations, tickets sold, and customer reach.
- `showMetrics`: Structured JSON containing active screenings, upcoming timetable, and starting-soon alerts.
- `hallMetrics`: Structured JSON containing screen operational status and capacity allocation.
- `occupancyMetrics`: Structured JSON containing seat utilization and peak load metrics.
- `paymentMetrics`: Structured JSON containing gateway reconciliation balances.
- `operationalAlerts`: Structured JSON containing actionable alert flags.
- `computedAt`: Timestamp when materialized aggregation was performed.

### 3.2. `user_dashboard_preferences`
Isolates operator personalization from tenant configurations:
- `id`: Primary key (`uuid`).
- `theatreId`: Scoped theatre ID.
- `userId`: Operator identity (`text`).
- `visibleWidgetIds`: Array of permitted widget IDs visible to this operator.
- `widgetOrder`: Custom display order array.
- `collapsedWidgetIds`: Array of widgets currently minimized.
- `favoriteWidgetIds`: Array of quick-pinned widgets.
- `defaultDatePreset`: Default period preset (`TODAY`, `YESTERDAY`, etc.).
- `updatedAt`: Last personalization timestamp.

### 3.3. `dashboard_activity_feed`
Real-time tenant operational audit stream:
- `id`: Primary key (`uuid`).
- `theatreId`: Scoped theatre ID.
- `activityType`: Activity enum (`NEW_BOOKING`, `PAYMENT_RECEIVED`, `SHOW_STARTED`, `SHOW_COMPLETED`, `MAINTENANCE_ALERT`, `SYSTEM_ALERT`, `STAFF_DUTY`).
- `title`, `description`: Human-readable activity descriptions.
- `severity`: Visual classification (`INFO`, `SUCCESS`, `WARNING`, `CRITICAL`).
- `metadata`: Flexible payload JSON for deep-linking.
- `createdAt`: Event timestamp.

---

## 4. Multi-Tenant Localization Isolation

Each theatre automatically inherits localization formatting from its `theatre_localization_configurations` and `theatre_operating_profiles`:

| Metric Dimension | Theatre A (`th-pun-001`) | Theatre B (`th-mum-001`) | Theatre C (`th-dxb-001`) |
| :--- | :--- | :--- | :--- |
| **Cinema Name** | CineSphere Grand Cinemas | CineSphere Royale Palladium | CineSphere Dubai Palms |
| **Base Currency** | INR (`₹`) | USD (`$`) | AED (`AED `) |
| **Number Format** | Indian (Lakhs/Crores) | International (Millions) | International (Millions) |
| **Timezone** | `Asia/Kolkata` (UTC+05:30) | `America/New_York` (UTC-05:00) | `Asia/Dubai` (UTC+04:00) |
| **Time Format** | 12-Hour (`02:30 PM`) | 12-Hour (`02:30 PM`) | 24-Hour (`14:30`) |
| **Today's Revenue**| ₹1,25,000 | $8,420 | AED 32,400 |
| **Today's Bookings** | 420 | 215 | 170 |
| **Live Occupancy** | 82.0% | 61.0% | 74.0% |
| **Active Screens** | 4 Occupied / 1 Avail / 1 Maint | 2 Occupied / 2 Avail | 3 Occupied / 2 Avail |

Cross-tenant data leakage is strictly blocked by `tenantService.assertTenantAccess(actor, theatreId)`. Any attempt by an operator from Mumbai to view Pune metrics raises a `ForbiddenError` and logs a critical `TENANT_VIOLATION` security event.

---

## 5. Widget Registry & RBAC Permission Gating

The dashboard renders widgets dynamically based on the operator's effective RBAC capabilities:

```typescript
export const DASHBOARD_WIDGET_REGISTRY: DashboardWidgetDefinition[] = [
  {
    id: "widget-revenue-metric",
    title: "Revenue Overview",
    category: "METRIC",
    requiredPermissions: ["reports:read", "dashboard:read"],
    defaultSize: "sm",
  },
  {
    id: "widget-halls-status",
    title: "Hall Status Summary",
    category: "STATUS",
    requiredPermissions: ["halls:read", "dashboard:read"],
    defaultSize: "sm",
  },
  {
    id: "widget-shows-overview",
    title: "Live Shows & Starting Soon",
    category: "SUMMARY",
    requiredPermissions: ["shows:read", "dashboard:read"],
    defaultSize: "lg",
  },
  ...
];
```

When an Auditorium Duty Lead (`HALL_MANAGER`) with permissions `["halls:read", "shows:read", "dashboard:read"]` opens the dashboard:
- **Allowed:** Hall Status Widget, Shows Overview Widget, Activity Feed, Quick Actions.
- **Strictly Denied:** Revenue Metric Widget, Payment Settlements Widget (missing `reports:read` and `payments:read`).

---

## 6. Verification & Automated Test Suites

The test suite in `scripts/verify-theatre-dashboard.ts` validates 12 rigorous suites:
1. **Pre-aggregated Materialized Metrics Layer:** Ensures fast querying from aggregated domain bundles.
2. **Revenue Metrics & Localization:** Validates currency symbols, growth calculation, and payment rails.
3. **Booking Metrics & Ticket Quotas:** Validates confirmed, cancelled, and pending counts.
4. **Show Lifecycle & Urgent Start Alerts:** Validates detection of screenings starting in $<60\text{m}$ with $>90\%$ occupancy.
5. **Auditorium Hall Status:** Tracks Available, Occupied, Maintenance, and Inactive screens.
6. **Real-Time Occupancy Rate:** Computes live seat utilization, peak hours, and timezone synchronization.
7. **Payment Status & Settlement:** Reconciles gross revenue across UPI, Cards, and Net Banking.
8. **Widget Registry RBAC Filtering:** Proves capability-based filtering denies revenue widgets to Hall Managers.
9. **Per-User Dashboard Preferences:** Verifies customized layouts and date presets persist per operator.
10. **Multi-Criteria Filtering:** Verifies slicing by date periods and individual auditoriums.
11. **Multi-Tenant Boundary Isolation:** Proves Mumbai admin is strictly blocked from accessing Pune data.
12. **Multi-Theatre Isolation Matrix:** Verifies Pune, Mumbai, and Dubai maintain completely distinct metrics and localization.
