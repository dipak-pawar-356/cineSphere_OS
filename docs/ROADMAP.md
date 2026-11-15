# CineSphere OS - Multi-Phase Engineering Roadmap

```
Phase 1: Architecture & Static Foundation ──────────► [ COMPLETED ]
Phase 2: Core Operating System Services (Parts 1-16) ► [ COMPLETED ]
Phase 3: Enterprise Governance & Real-Time Infra ────► [ IN PROGRESS ]
  ├─ Part 1: Theatre Lifecycle Management ───────────► [ COMPLETED ]
  ├─ Part 2: Theatre Branding & Media Management ────► [ COMPLETED ]
  ├─ Part 3: Theatre Profile Management ─────────────► [ COMPLETED ]
  ├─ Part 4: Theatre Address & Location Management ──► [ COMPLETED ]
  ├─ Part 5: Theatre Amenities & Facilities ─────────► [ COMPLETED ]
  ├─ Part 6: Theatre Contact Directory Management ───► [ COMPLETED ]
  ├─ Part 7: Theatre Business Information Management ─► [ COMPLETED ]
  ├─ Part 8: Theatre Operating Hours Management ─────► [ COMPLETED ]
  ├─ Part 9: Dynamic Theatre Configuration Mgmt ─────► [ COMPLETED ]
  ├─ Part 10: Theatre Staff & Dynamic RBAC Mgmt ─────► [ COMPLETED ]
  ├─ Part 11: Theatre Dashboard & Analytics Layer ───► [ COMPLETED ]
  ├─ Part 12: Theatre Search & Filters Engine ───────► [ COMPLETED ]
  ├─ Part 13: Public Theatre Page Read Model ────────► [ COMPLETED ]
  ├─ Part 14: Platform Security & Governance Layer ──► [ COMPLETED ]
  ├─ Part 15: Reports & Analytics Layer ─────────────► [ COMPLETED ]
  └─ Part 16: Enterprise Extension Framework ────────► [ COMPLETED ]
Phase 4: Hall Designer & Spatial Auditorium Engine ──► [ IN PROGRESS ]
  ├─ Part 1: Hall Designer Foundation ───────────────► [ COMPLETED ]
  ├─ Part 2: Canvas & Grid System Engine ────────────► [ COMPLETED ]
  ├─ Part 3: Section Designer Studio ────────────────► [ COMPLETED ]
  ├─ Part 4: Row Designer Engine ────────────────────► [ COMPLETED ]
  ├─ Part 5: Seat Inventory & Show Seat Generator ───► [ PLANNED ]
  └─ Part 6: F&B Concessions & Butler In-Seat Dining ► [ PLANNED ]
Phase 5: 3D WebGL Hall Designer (Three.js) ─────────► [ PLANNED ]
Phase 6: Distributor KDM Key Ingestion & DCI ───────► [ PLANNED ]
Phase 7: Mobile Kiosk Native PWA & Turnstile ───────► [ PLANNED ]
```

---

## Phase 1: Architecture & Static Foundation (COMPLETED)
- [x] Next.js 15 App Router foundation with TypeScript 5.9 and Tailwind CSS v4.
- [x] Luxury Cinema Design System with OLED Void, Cinema Red, and Glassmorphism tokens.
- [x] Full navigation layouts for Public Portal, Super Admin, and Theatre Admin.
- [x] 10 Public guest routes (Billboard, Movies, Theatres, Events, Offers, About, Contact).
- [x] Super Admin Control Plane with platform health, distributor approvals, and macro analytics.
- [x] Flagship Theatre Admin Console (`th-pun-001`, Phoenix Marketcity, Pune) with 25+ operational routes.
- [x] Responsive layout primitives (320px to 2560px) and accessible GSAP/Lenis motion system.
- [x] Centralized, type-safe mock data layer (`data/`) and domain models (`types/`).

---

## Phase 2: Core Operating System Services & Platform Hardening (COMPLETED)
- [x] **Part 1: Authentication & Authorization:** Clerk integration, 5-tier role hierarchy (SUPER_ADMIN > THEATRE_ADMIN > HALL_MANAGER > STAFF > CUSTOMER), centralized middleware.
- [x] **Part 2: Database Architecture:** Normalized PostgreSQL schema with Drizzle ORM and Neon Serverless.
- [x] **Part 3: Super Admin Platform Management:** Master control plane under `/dashboard/...` with cinema approvals and audit logs.
- [x] **Part 4: Theatre Admin Onboarding:** Isolated cinema complex console under `/theatre/...`.
- [x] **Part 5: Hall Management & Dynamic Configuration:** Flexible auditorium section editor and 2D floor plans.
- [x] **Part 6: Automatic Seat Generation Engine:** Deterministic seat synthesis with immutable UUIDs and zero embedded pricing.
- [x] **Part 7: Movie Management System:** Master platform film catalog with multi-tenant exhibition licensing and KDM tracking.
- [x] **Part 8: Show Management & Scheduling System:** Turnaround conflict detection, timetable programming, and dynamic show seat inventory.
- [x] **Part 9: Dynamic Pricing Engine:** Reusable pricing profiles and section-based seat pricing calculations.
- [x] **Part 10: Customer Discovery & Booking Flow:** 4-journey convergence, unified single Show ID resolution, and 2D auditorium selection.
- [x] **Part 11: Booking Engine & Seat Reservation:** 3-tier inventory layering, temporary seat locks with countdown timer, and collision protection.
- [x] **Part 12: Theatre Payment Configuration & Architecture:** 1:N payment rails per cinema, dynamic NPCI UPI QR generation, and settlement ledgers.
- [x] **Part 13: Ticket Management & Digital Ticket System:** Unidirectional ticket lifecycle, 4-tier identifier hierarchy, unguessable secure IDs, and QR inspection.
- [x] **Part 14: Centralized Notification System:** Event-driven decoupled notification bus, template engine, and user preferences matrix.
- [x] **Part 15: Reporting, Analytics & Business Intelligence:** Decoupled aggregation datamarts, standardized KPI engine, hierarchical drill-down trace, and point-in-time snapshots.
- [x] **Part 16: Enterprise Security & Platform Hardening:** 8-tier security pipeline, Domain Service & Repository pattern, optimistic locking, input sanitization, rate limiting, secure headers, structured logging, threat monitoring, and health probes.

---

## Phase 3: Enterprise Governance & Real-Time Production Infrastructure
- [x] **Part 1: Theatre Lifecycle Management:** Finite state machine governance (`DRAFT` → `PENDING_APPROVAL` → `APPROVED` → `ACTIVE` ↔ `SUSPENDED` → `ARCHIVED` → `SOFT_DELETED`), KYC approvals & revision loops, operational lockouts, read-only archival, non-destructive soft delete, unique slug history, optimistic locking, and multi-tenant field RBAC.
- [x] **Part 2: Theatre Branding & Media Management:** Decoupled `TheatreMediaCollection` Digital Asset Management (Logo, Banner, Cover, Hero, Thumbnail, ordered Gallery), immutable version history & restore, SHA-256 checksum duplicate protection, server-side policy validation, future video/panorama stubs, and dynamic public venue projection.
- [x] **Part 3: Theatre Profile Management:** Dedicated decoupled `TheatreProfile` entity with public profile slug separation, business capacity & completion score tracking, multi-language (`isPrimary`) & social presence governance, multi-locale field readiness, immutable version history with rollback support, and multi-tenant RBAC.
- [x] **Part 4: Theatre Address & Location Management:** Decoupled multi-location fleet architecture (`theatres 1:N theatre_locations`), primary/secondary branch hierarchy, coordinate governance & range validation, PostGIS SRID 4326 spatial index placeholders & 8-character geohash generation, Super Admin verification workflow & publication gates, Google Maps URL sanitization, pre-pagination tenant isolation, forward version rollback, and customer-facing address projections.
- [x] **Part 5: Theatre Amenities & Facilities Management:** Dynamic Master Catalog & category governance (Technology, Comfort, Accessibility, Hospitality), tenant-scoped amenity assignments with rich availability modes (`AVAILABLE`, `TEMPORARILY_UNAVAILABLE`, `SEASONAL`, `UNDER_MAINTENANCE`), multilingual localization readiness, generic entity mapping (`THEATRE`, `HALL`, `LOUNGE`, `PREMIUM_SCREEN`), facility capacity metadata (parking bays, EV chargers, Wi-Fi, accessibility notes), sequential reordering, optimistic locking, and active-only public patron discovery.
- [x] **Part 6: Theatre Contact Management:** Multi-channel communication directory (Phone, Email, Website, Social Links, Emergency Desk, Duty Manager, WhatsApp, Telegram, Live Chat, Call Center), contact availability modes (`STANDARD_BUSINESS_HOURS`, `TWENTY_FOUR_SEVEN`, `EMERGENCY_ONLY`, `SHOWTIME_ONLY`, `TEMPORARILY_INACTIVE`), verification status workflow & trusted badges (`UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`), single-primary voice/email enforcement, safe URL sanitization & stored XSS defense, 24/7 emergency incident command & muster protocols, duty manager escalation tiers (Tier 1..3), sequential directory reordering, pre-pagination multi-tenant isolation, optimistic locking (`ConflictError`), immutable version ledger snapshots, and Section 9 public patron contact directory projection.
- [x] **Part 7: Theatre Business Information Management:** Multi-tenant enterprise corporate identity, government registration credentials (15-char GSTIN, 10-char PAN, 21-char CIN/LLPIN, ROC Authority), ownership structure (Direct Ownership, Lease Operated, Franchise, Joint Venture, Management Contract), country-aware tax frameworks (GST 18%, VAT, Sales Tax, Custom, Tax Inclusive/Exclusive pricing models), consumer billing layout & sequence governance (configurable prefixes, sequence counters, statutory legal footer disclaimers, E-Invoice IRN schema, PDF generation), Super Admin compliance verification workflow with strict authorization gates, decoupled document attachment vault (incorporation certificates, trade licenses, municipal fire NOCs), multi-faceted search & scoped queries, pre-pagination tenant isolation, and cryptographic immutable version ledger snapshots with optimistic locking.
- [x] **Part 8: Theatre Operating Hours Management:** Decoupled temporal operating profile architecture (`theatre_operating_profiles`, `theatre_weekly_schedules`, `theatre_holiday_schedules`, `theatre_maintenance_schedules`, `theatre_special_operating_events`, `theatre_operating_profile_versions`), timezone parsing & IANA verification, standard daily opening/closing schedules, late-night midnight rollover handling, 7-day weekly schedule rotations, public holiday full/partial exception calendars, planned facility/auditorium technical maintenance windows with affected screen selectors, special midnight blockbuster fan premieres & multi-day festival schedules, 24-hour time & ISO date validation guards, pre-pagination multi-tenant boundary isolation, cryptographic immutable version snapshots with optimistic concurrency control, responsive operator workspace, and Super Admin cross-tenant visibility.
- [x] **Part 9: Dynamic Theatre Configuration Management:** Fully decoupled relational configuration domain architecture (`theatre_configurations`, `theatre_localization_configurations`, `theatre_booking_configurations`, `theatre_cancellation_configurations`, `theatre_refund_configurations`, `theatre_age_restriction_configurations`, `theatre_feature_flag_configurations`, `theatre_configuration_terms`, `theatre_configuration_versions`), ISO 4217 currency & IANA timezone localization with Indian/International number formatting and multi-language support, ticketing quotas & 8-to-10 minute temporary seat hold lock durations, customer-initiated cancellation policies with notice deadlines and automatic unpaid hold forfeiture, financial refund calculation & automated payment gateway routing (Razorpay/Stripe reversal), Indian censor board ratings hierarchy ($U \le UA \le A \le S$) with minor protections & gate ID verification, modular commercial feature flags (loyalty points, dynamic surge pricing, AI recommendations, memberships, sold-out waitlisting), legally binding customer terms & checkout agreements, draft-to-publish snapshot workflows with instant one-click rollback restoration, and multi-tenant isolation.
- [x] **Part 10: Theatre Staff Management & Dynamic RBAC:** Decoupled tenant-owned staff organization hierarchy (`role_templates`, `theatre_roles`, `theatre_permissions`, `staff_departments`, `theatre_staff`, `staff_role_assignments`, `staff_role_history`, `future_shift_placeholders`), zero hardcoded theatre roles, platform permission catalog (20+ granular capability keys across all modules), template-to-tenant role instantiation with customizable naming and hierarchy weighting, multi-role crew capabilities with primary role designation, staff lifecycle state machine (`INVITED` → `ACTIVE` ↔ `SUSPENDED` → `RESIGNED` / `ARCHIVED`), instant capability revocation upon suspension, immutable role transition history ledger, multi-faceted search & pagination, pre-pagination multi-tenant isolation, and responsive operator workspace.
- [x] **Part 11: Theatre Dashboard & Analytics Layer:** Dedicated decoupled Analytics Engine and materialized metrics snapshots (`theatre_dashboard_materialized_metrics`, `user_dashboard_preferences`, `dashboard_activity_feed`), zero transactional table scanning from UI, pre-aggregated revenue, bookings, shows, halls, occupancy, payments, and alerts bundles, declarative metadata-driven Widget Registry with capability-based RBAC gating, per-user personalization preferences (visible widgets, layout ordering, collapsed states, default date presets) decoupled from theatre configuration, multi-tenant localization auto-formatting (INR/USD/AED, 12H/24H, Indian/International numbering, timezones), urgent show alerts (<60m start time), and comprehensive test suites.
- [x] **Part 12: Theatre Search & Filters Engine:** Dedicated decoupled Search Index Layer (`TheatreSearchDocument`, `theatre_search_index`) aggregating theatre profiles, geographic coordinates, business profiles, technical amenities, lifecycle/approval statuses, primary administrative contacts, and operating localization parameters; zero direct multi-table SQL `LIKE` queries; generic, search-engine-agnostic contracts (`GenericSearchQuery`, `GenericSearchResults`, `FacetBucket`) ready for future Elasticsearch/Meilisearch drop-in; weighted multi-field relevance scoring engine; multi-faceted filtering (status, tier, chain, amenities, screens, capacity, geography, localization); deterministic sorting (Newest, Oldest, A-Z, Z-A, Screens, Capacity, Updated); enterprise saved search presets management (`SavedSearchPreset`); strict RBAC gating restricting public guests to `ACTIVE` and `isVerified: true` venues; and comprehensive 12-suite verification matrix.
- [x] **Part 13: Public Theatre Page Read Model:** Dedicated Public Content Layer and aggregated `PublicTheatreView` read model decoupling public consumer website from raw internal operational modules; aggregates Branding, Profile, Location, Contact Desks, Amenities, Running Movies, Upcoming Premieres, Available Shows with localized prices, Auditorium Fleet Summary, Live Operating Hours, Reviews architecture placeholder, Multi-tenant Configuration, and SEO Metadata; strict information disclosure protection (zero leakage of GSTIN, PAN, CIN, staff, merchant VPAs, or internal formulas); content visibility state machine (strict 404 for DRAFT/PENDING/SUSPENDED/ARCHIVED venues with audited Super Admin preview mode); autonomous multi-tenant localization (Pune INR vs Mumbai USD vs Dubai AED); Next.js 15 Server Component with ISR (`revalidate = 3600`) and Schema.org `MovieTheater` JSON-LD structured data; and 12-suite automated verification matrix.
- [x] **Part 14: Platform Security & Governance Layer:** Centralized, reusable security and governance engine shared across all CineSphere OS modules; policy-based authorization framework (`canManageTheatre`, `canPublishTheatre`, `canUploadMedia`, etc.) replacing scattered role checks; strict cross-module resource ownership validation (`OwnershipValidator`); central 9-stage validation pipeline (`ValidationPipeline`) executing in deterministic sequence (Auth → Policy → Tenant → Ownership → Input → Theatre Rules → OCC → Execution → Audit); media validation with dynamic tenant-specific upload quotas (Pune 20MB, Mumbai 50MB, Dubai 10MB) and path traversal defense; dynamic staff headcount quota enforcement; optimistic concurrency control (OCC) with version increments and 409 conflict detection; enterprise soft delete with retention windows, non-destructive storage, restoration, and Super Admin purge protection; domain security event auditing (`DomainSecurityEvent`); chronological operator activity history ledger; and 12-suite automated verification matrix.
- [x] **Part 15: Reports & Analytics Layer:** Dedicated historical business intelligence architecture decoupled from real-time operational dashboards (Part 11); decoupled analytical aggregates store (`theatre_analytics_aggregates`, `theatre_historical_report_snapshots`, `theatre_report_definitions`, `theatre_metric_registry`); centralized pure Metric Registry & KPI Engine (occupancy %, ATV, RevPAS, hall utilization %, cancellation rate %, payment success rate %, MoM growth rates); configurable Report Definitions Registry spanning 10 strategic categories (`REVENUE_REPORTS`, `OCCUPANCY_REPORTS`, `HALL_PERFORMANCE`, `MOVIE_PERFORMANCE`, `BOOKING_TRENDS`, `CUSTOMER_ANALYTICS`, `PAYMENT_ANALYTICS`, `THEATRE_GROWTH`, `OPERATIONAL_KPIS`, `EXECUTIVE_SUMMARY`); dimensional slicing (date, movie, hall, show, payment method); universal Report Builder & CSV/JSON export serializers; autonomous multi-tenant localization (Pune INR Lakhs vs Mumbai USD vs Dubai AED); and 12-suite automated verification matrix.
- [x] **Part 16: Future Enterprise Features Architecture (Enterprise Extension Framework):** Pluggable 8 sub-platform enterprise extension runtime kernel (`EnterpriseExtensionRegistry`), formal module manifests & lifecycle hooks (`onInstall`, `onEnable`, `onDisable`, `onUpgrade`), 4-tier hierarchical feature flag resolution engine with cascading precedence (User > Theatre > Organization > Platform > Default) and deterministic canary rollouts, decoupled asynchronous Domain Event Bus (`EnterpriseDomainEventBus`) with priority subscriber sorting, predicate-based tenant filtering, and error isolation; multi-branch circuits, regional offices, franchise agreements (revenue sharing), and corporate B2B credit accounts; VIP tiered memberships (Gold, VIP Black) and spend-based loyalty points ledger; dynamic demand surge & early-bird yield pricing rules engine (`IPricingRuleEngine`); IoT auditorium device registry, environmental telemetry, digital signage playlists, and smart kiosk session controllers; developer partner API keys, granular API scopes, and asynchronous webhook delivery; multi-region tax frameworks (GST, VAT) and multi-currency stacks; Super Admin control console under `/dashboard/extensions`; and comprehensive 15-suite automated verification matrix (124/124 passed).
- [ ] Redis in-memory seat reservation locks (5-minute countdown hold).
- [ ] Interactive SVG auditorium seat maps with live socket updates.
- [ ] Webhook payment capture (Razorpay, PhonePe, Stripe, Paytm).
- [ ] Live turnstile validation streaming and anti-passback enforcement.

---

## Phase 4: Hall Designer & Spatial Auditorium Engine
- [x] **Part 1: Hall Designer Foundation & Immutable Layout Definition Layer:** Dedicated Layout Definition layer acting as the immutable source of truth; live layout is always a published version derived from a layout definition; isolated Draft editing protects in-flight shows and bookings from ghost seating or desynchronization; status state machine (`DRAFT`, `PUBLISHED`, `ARCHIVED`, `INACTIVE`, `DEPRECATED`); pure mathematical `LayoutValidator` checking duplicate seat numbers, coordinate collisions, grid boundaries, section capacity parity, and legal status transitions; atomic publishing workflow with automatic archival of previous versions; duplication and version history restore; and strict multi-tenant boundary isolation.
- [x] **Part 2: Visual Canvas & Multi-Density Grid System Engine:** Interactive infinite canvas with pan & zoom viewport controls (0.2x to 3.0x, fit-to-screen bounds calculation, reset); multi-density snapping grid (Small 10px, Medium 20px, Large 40px) with configurable snap strength threshold; unit conversion engine (`PX`, `CM`, `FT`, `M`); geometric seat alignment tools (`ALIGN_LEFT`, `ALIGN_RIGHT`, `ALIGN_TOP`, `ALIGN_BOTTOM`, `CENTER_HORIZONTAL`, `CENTER_VERTICAL`, `DISTRIBUTE_HORIZONTALLY`, `DISTRIBUTE_VERTICALLY`); smart alignment guides; and persisted per-theatre canvas preferences (Pune 20px PX snap ON, Mumbai 10px CM snap OFF, Dubai 25px FT snap ON).
- [x] **Part 3: Section Designer Studio (Structural Layer):** Multi-tenant Section Designer establishing the hierarchical DDD structural layer (`Layout Definition -> Section -> Row -> Seat`); section CRUD, duplication, cascading deletion, color coding, display ordering (`UP`, `DOWN`, `TOP`, `BOTTOM`), capacity calculation, and spatial positioning; support for `RECTANGLE`, `CURVED`, `ARC`, `POLYGON`, and `IRREGULAR` boundary geometries; label placement (`TOP`, `BOTTOM`, `LEFT`, `RIGHT`, `CENTER`, `HIDDEN`); seat category assignments (`Standard`, `Recliner`, `VIP`, `Couple`, `Wheelchair`, `Sofa`); and venue-specific configurations (Pune VIP Red, Mumbai Luxury Purple, Dubai Balcony Blue).
- [x] **Part 4: Row Designer Engine (Sequencing & Accessibility):** Dynamic row generation scoped strictly to sections; auto-numbering strategies (`ALPHABETICAL` A-Z/AA-AZ, `NUMERIC` 1-20, `ROMAN` I-X, `CUSTOM`); reverse sequencing, prefix, and suffix formatting; physical coordinate calculations for Straight, Curved (arc sagitta math), Arc, and Angled geometries; positive row spacing constraints; accessibility classifications (`STANDARD`, `WHEELCHAIR` ♿, `COMPANION`, `RESERVED`, `EMERGENCY_CLEARANCE`); row duplication, cascading reordering; and validation engine.
- [x] **Part 5: Automatic Seat Generator & Physical Coordinates:** Decouples editable Seat Templates from physical runtime Seat Inventory; assigns permanent immutable internal UUIDs for every seat template; precision mathematical coordinate engines for Straight, Curved arc sagitta ($y_c = y_0 + R(1 - \cos \theta_c)$), and Angled topologies; auto-numbering with prefixes, suffixes, start numbers, reverse ordering, and gap skips; accessibility tiers (Wheelchair bays, companion pairings, accessible route tags); spatial coordinate collision and duplicate code detection; and draft-only immutability enforcement.
- [x] **Part 6: Dynamic Seat Category Registry & Decoupled Pricing:** Database-driven registry replacing hardcoded enums, allowing circuits to define unlimited custom categories (*Kids*, *Luxury*, *Executive*, *Private Box*, *Accessible Premium*); strict Decoupled Pricing architecture ensuring categories define classification and spatial layout only while ticket pricing is resolved dynamically per show; category lifecycle management (Create, Update, Duplicate, Archive, Restore); independent per-theatre categories (Pune, Mumbai, Dubai); and caching performance hook `useSeatGenerator` with optimistic UI updates.
- [ ] **Part 7: Seat Inventory & Show Seat Generator:** High-performance seat inventory generator instantiating per-show ShowSeat entities from published layouts with Redis cache synchronization.
- [ ] **Part 8: F&B Concessions & In-Seat Butler Dispatch:** In-seat dining menu with real-time pantry inventory deduction, Butler kitchen display system (KDS), and automated dispatch notifications.

---

## Phase 5: 3D WebGL Hall Designer (Three.js / React Three Fiber)
- [ ] Interactive 3D auditorium preview allowing patrons to view the screen from their chosen seat.
- [ ] 3D Hall Designer for cinema owners to drag-and-drop screen curvature, speakers, and seat tiers.
- [ ] Acoustic reflection simulation and sightline obstruction heatmaps.

---

## Phase 6: DCI KDM Key Ingestion & Automated Projection
- [ ] Integration with Barco and Christie digital cinema server APIs.
- [ ] Automated Key Delivery Message (KDM) ingestion and validation before premiere shows.
- [ ] Smart auditorium HVAC and ambient lighting automation triggers.

---

## Phase 7: Mobile Kiosk PWA & Hardware Turnstile Integration
- [ ] Turnstile optical barcode/facial scanner driver integration.
- [ ] Offline-capable progressive web application (PWA) for ticket ushers and floor staff.
- [ ] High-volume self-service box office kiosk touch interface.
