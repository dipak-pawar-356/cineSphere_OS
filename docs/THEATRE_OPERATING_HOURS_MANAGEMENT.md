# CineSphere OS — Phase 3 Part 8: Theatre Operating Hours Management

## 1. Architectural Philosophy & Overview

In an enterprise multi-tenant cinema SaaS platform, **Operating Hours & Schedules** cannot be modeled as a flat set of static fields on the `theatre` entity. Operating profiles require temporal dynamics, calendar overrides, and maintenance downtime planning:
- Every cinema location operates on localized timezones (e.g., `Asia/Kolkata`, `America/New_York`, `Europe/London`).
- Daily operating schedules vary across the week (e.g., weekend midnight screenings, holiday rotations, or Monday closures).
- Public holidays, national observances, and emergency municipal curfews require calendar-specific overrides.
- Routine technical maintenance (laser projector optical alignment, Dolby Atmos calibration, HVAC servicing) requires scheduling auditorium downtime without impacting other operational halls.
- Midnight blockbusters, film festivals, and fan conventions require special operating schedules with customized gate cutoffs.

### Relational Hierarchy
```
Platform
    │
    ▼
Theatre
    │
    ▼
Theatre Operating Profile
    │
    ├── Weekly Schedule (Monday – Sunday)
    ├── Holiday Calendar (Specific date overrides & partial closures)
    ├── Maintenance Calendar (Auditorium & projector servicing downtime)
    ├── Special Events (Midnight premieres, festival marathons)
    └── Operating Profile Versions (Immutable audit ledger & change history)
```

---

## 2. Database Schema Design

Implemented in [db/schema/theatre-operating-hours.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-operating-hours.ts):

| Table Name | Entity Description | Key Columns |
|---|---|---|
| `theatre_operating_profiles` | Root operating configuration | `id`, `theatre_id`, `timezone`, `regular_opening_time`, `regular_closing_time`, `is_24x7`, `late_night_closing`, `status`, `version` |
| `theatre_weekly_schedules` | Day-of-week rotations | `id`, `operating_profile_id`, `theatre_id`, `day_of_week`, `is_open`, `open_time`, `close_time`, `is_overnight`, `time_slots` |
| `theatre_holiday_schedules` | Calendar holiday exceptions | `id`, `operating_profile_id`, `theatre_id`, `holiday_name`, `holiday_date`, `is_closed`, `partial_open_time`, `partial_close_time`, `notes` |
| `theatre_maintenance_schedules`| Downtime & outage windows | `id`, `operating_profile_id`, `theatre_id`, `maintenance_date`, `start_time`, `end_time`, `affected_halls`, `reason`, `status` |
| `theatre_special_operating_events`| Midnight releases & festivals | `id`, `operating_profile_id`, `theatre_id`, `event_name`, `event_type`, `start_date`, `end_date`, `open_time`, `close_time`, `notes` |
| `theatre_operating_profile_versions`| Immutable snapshot ledger | `id`, `operating_profile_id`, `theatre_id`, `version_number`, `change_type`, `change_summary`, `snapshot`, `changed_by`, `changed_role` |

---

## 3. Security, Multi-Tenancy & Validation

1. **Multi-Tenant Boundary Isolation**:
   - `tenantService.assertTenantAccess(actor, theatreId)` strictly enforces that a `THEATRE_ADMIN` can only inspect or modify their assigned cinema tenant.
   - Cross-tenant access triggers a `CRITICAL` security audit event and raises `TenantAccessError`.
2. **Input Sanitization & Zod Guards**:
   - Strict 24-hour time validation regex (`^([01]\d|2[0-3]):[0-5]\d$`).
   - Strict ISO 8601 calendar date regex (`^\d{4}-\d{2}-\d{2}$`).
   - Overnight schedule logic: ensures closing times earlier than opening times are only permitted when `lateNightClosing` or `isOvernight` is explicitly set.
3. **Auditing & Cache Invalidation**:
   - Every mutation is logged via `securityAuditService.recordAudit` with metadata details.
   - Cache tags `THEATRE_OPERATING_HOURS` and `PUBLIC_THEATRE_OPERATING_HOURS` are invalidated automatically.

---

## 4. UI Components & Operator Experience

Located in [components/theatre-operating-hours/](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-operating-hours/):
- `OperatingStatusBadge`: Badges for profile status (`ACTIVE`, `INACTIVE`, `DRAFT`, `SUSPENDED`), maintenance status, and special event types.
- `RegularHoursModal`: Configures daily opening/closing times, active timezone, 24x7 mode, and late-night closing.
- `HolidayScheduleModal`: Manages holiday calendar dates, full closures, and custom festival hours.
- `MaintenanceScheduleModal`: Schedules planned facility or hall maintenance windows with affected screen selectors.
- `SpecialEventModal`: Configures multi-day film festivals, red-carpet premieres, and midnight screenings.
- `TheatreOperatingHoursWorkspace`: Tabbed responsive workspace for overview matrix, weekly schedules, holiday calendars, facility maintenance, and audit ledger.
- `ConnectedOperatingHoursWorkspace`: Server Action bridge fetching and synchronizing live data.
- Route: `/theatre/operating-hours` accessible via the Theatre Admin portal.
