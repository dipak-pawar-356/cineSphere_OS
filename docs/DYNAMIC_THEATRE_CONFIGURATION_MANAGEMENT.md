# CineSphere OS — Phase 3 Part 9: Dynamic Theatre Configuration Management

## 1. Architectural Philosophy & Overview

In an enterprise SaaS platform, **Dynamic Configuration & Rules** must be modeled as an independent configuration domain rather than simple fields on the Theatre entity or a single unstructured JSON blob because:
- **Relational Integrity & Schema Evolution**: Strongly typed normalized entities allow independent index creation, foreign key relations, and granular migrations.
- **Tenant Autonomy**: Every cinema branch can have distinct currency, ticketing rules, refund structures, age ratings, and feature flags.
- **Immutable Version Ledger & Instant Rollback**: Configuration releases are snapshot-versioned, auditable, and can be restored to prior states without code redeployment.
- **Dynamic Feature Flags**: Modular capabilities (e.g., dynamic surge pricing, VIP memberships, sold-out show waitlisting) can be toggled on/off per exhibitor.

### Relational Hierarchy
```
Platform
    │
    ▼
Theatre
    │
    ▼
Theatre Configuration
    │
    ├── Localization (Currency, Timezone, Languages, Number/Time formats)
    ├── Booking Rules (Min/Max seats, advance booking window, seat hold locks)
    ├── Cancellation Rules (Deadlines, deduction fee %, unpaid hold auto-forfeiture)
    ├── Refund Rules (Refund %, payout destinations, payment gateway auto-settlement)
    ├── Customer Rules (Age rating matrix, guardian requirements, gate ID checks)
    ├── Feature Flags (Dynamic pricing, loyalty, coupons, gift cards, memberships)
    ├── Configuration Terms (Booking conditions, refund caveats, privacy covenants)
    └── Configuration Versions (Immutable snapshot audit ledger with rollback support)
```

---

## 2. Database Schema Design

Implemented in [db/schema/theatre-configuration.ts](file:///d:/Project_2k24_25/cineSphere_OS/db/schema/theatre-configuration.ts):

| Table Name | Entity Description | Key Columns |
|---|---|---|
| `theatre_configurations` | Root configuration release | `id`, `theatre_id`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `version`, `published_at` |
| `theatre_localization_configurations` | Regional & formatting parameters | `currency` (ISO 4217), `timezone` (IANA), `primary_language`, `supported_languages`, `number_format`, `time_format` |
| `theatre_booking_configurations` | Ticketing quotas & seat lock limits | `min_seats_per_booking`, `max_seats_per_booking`, `advance_booking_days`, `booking_cutoff_minutes`, `seat_hold_duration_seconds` |
| `theatre_cancellation_configurations` | Customer cancellation governance | `cancellation_allowed`, `cancellation_deadline_minutes`, `cancellation_fee_percent`, `auto_cancellation_enabled`, `auto_cancellation_timeout_minutes` |
| `theatre_refund_configurations` | Financial settlement parameters | `refund_window_hours`, `refund_percentage`, `refund_method` (`ORIGINAL_PAYMENT`, `WALLET`, `STORE_CREDIT`), `gateway_auto_refund` |
| `theatre_age_restriction_configurations` | Censor rating matrix & minor safeguards | `min_age_u`, `min_age_ua`, `min_age_a`, `min_age_s`, `guardian_required_under_age`, `require_age_verification_at_gate` |
| `theatre_feature_flag_configurations` | Commercial toggles & engine switches | `enable_loyalty`, `enable_coupons`, `enable_gift_cards`, `enable_memberships`, `enable_dynamic_pricing`, `enable_ai_recommendations`, `enable_waitlist` |
| `theatre_configuration_terms` | Customer legal agreements | `booking_terms`, `refund_terms`, `privacy_notice`, `customer_agreement`, `version` |
| `theatre_configuration_versions` | Immutable snapshot ledger | `id`, `configuration_id`, `theatre_id`, `version_number`, `snapshot`, `change_summary`, `changed_by`, `changed_role` |

---

## 3. Security, Multi-Tenancy & Governance

1. **Multi-Tenant Boundary Isolation**:
   - Every mutation is gated by `tenantService.assertTenantAccess(actor, theatreId)`.
   - Theatre administrators can only modify their own tenant configuration; unauthorized attempts are recorded with critical security audit alerts.
2. **Domain Invariants & Validation Rules**:
   - Currency: Strict 3-letter ISO 4217 uppercase string (e.g., `INR`, `USD`, `EUR`).
   - Censor Rating Hierarchy: Strictly verifies $U \le UA \le A$.
   - Booking Quotas: Strictly enforces $minSeats \le maxSeats$.
   - Cancellation Fee: Clamped to statutory limits between $0.00\%$ and $100.00\%$.
3. **Publishing & Instant Rollback**:
   - Changes are iteratively authored in `DRAFT` status.
   - Calling `publishConfiguration` freezes an immutable snapshot in `theatre_configuration_versions` and stamps `published_at`.
   - Calling `restoreConfigurationVersion` pulls any historical snapshot and activates it as a working draft with an incremented version counter.

---

## 4. UI Components & Operator Experience

Located in [components/theatre-configuration/](file:///d:/Project_2k24_25/cineSphere_OS/components/theatre-configuration/):
- `ConfigurationStatusBadge`: Badges for `PUBLISHED`, `DRAFT`, and `ARCHIVED` statuses, alongside feature toggle badges.
- `LocalizationConfigModal`: Form modal for currency, timezone, languages, and date/time formatting.
- `BookingConfigModal`: Ticket limits, advance reservation windows, and hold timers.
- `CancellationConfigModal`: Customer cancellation toggles, deadlines, and auto-forfeiture timeouts.
- `RefundConfigModal`: Refund percentages, gateway routing, and processing turnaround days.
- `AgeRestrictionModal`: Censor board ratings, minor guardian requirements, and gate ID checks.
- `FeatureFlagsModal`: One-click toggles for loyalty, dynamic surge pricing, and AI recommendation engines.
- `ConfigurationTermsModal`: Legal checkout contracts and disclaimers.
- `TheatreConfigurationWorkspace`: Full tabbed workspace with KPI summary cards, overview matrix, and version history ledger with instant rollback.
- `ConnectedConfigurationWorkspace`: Client-server action connector.
- Route: `/theatre/configuration` accessible via Theatre Admin navigation and Profile Hub.
