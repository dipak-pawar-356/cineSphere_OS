# CineSphere OS — Enterprise Extension Framework Architecture (Phase 3 – Part 16)

## 1. Executive Architectural Philosophy

As CineSphere OS expands from single-venue operations to multinational exhibition circuits, enterprise requirements emerge across two fundamentally different vectors:
1. **Business Capabilities:** VIP memberships, reward points, B2B corporate billing, franchise royalty accounting, and yield pricing.
2. **Infrastructure Capabilities:** IoT auditorium hardware, digital poster signage, unattended self-service kiosks, external developer REST/webhook APIs, and multi-region tax/currency stacks.

Rather than coupling these future enterprise requirements directly into core cinema operation modules (Theatres, Halls, Movies, Shows, Bookings, Payments), CineSphere OS establishes an **Enterprise Extension Framework**.

This architectural boundary guarantees that:
- **Core Stability:** The platform core remains clean, high-performance, and resilient.
- **Pluggability:** Enterprise capabilities plug in modularly via declarative manifests, formal lifecycle hooks (`onInstall`, `onEnable`, `onDisable`, `onUpgrade`), and decoupled event subscriptions.
- **Tenant Autonomy:** A boutique single-screen cinema can operate with zero enterprise overhead, while an international chain (e.g., PVR-INOX, CineSphere Global) can enable circuits, surge pricing, IoT telemetry, and developer APIs.

---

## 2. High-Level System Architecture

```
Platform Core (Theatres, Halls, Movies, Shows, Bookings, Payments)
        │
        ▼
Enterprise Extension Framework
        │
        ├── Organization Platform     ─── Multi-branch circuits, regional offices, franchise royalties, corporate accounts
        ├── Customer Experience       ─── VIP Cinema Passports, loyalty points ledger, digital gift cards
        ├── Pricing Platform          ─── Rule-based demand surge, occupancy thresholds, holiday multipliers
        ├── Device Platform (IoT)     ─── Auditorium sensors, lamp hour telemetry, digital signage, kiosks
        ├── AI Platform (Stubs)       ─── Recommendation engines, seat selection, concession upsell
        ├── Integration Platform      ─── Third-party developer API keys, granular scopes, webhook dispatcher
        ├── Regional Platform         ─── Multi-currency, statutory tax frameworks (GST, VAT), data residency
        └── Extension SDK Kernel      ─── Lifecycle runtime, dynamic route injection, permission aggregation
                │
                ▼
Pluggable Enterprise Modules (Independent Plugins)
```

---

## 3. The Three Scalability Pillars

### Pillar 1: Decoupled Domain Event Bus (`EnterpriseDomainEventBus`)
- Asynchronous pub/sub architecture.
- Dispatches domain events (`BOOKING_CREATED`, `BOOKING_CONFIRMED`, `SHOW_CREATED`, `THEATRE_ACTIVATED`, `DEVICE_TELEMETRY_RECORDED`, `PRICING_SURGE_TRIGGERED`, etc.).
- **Subscriber Priority Ordering:** Subscribers execute in descending order of priority (100 -> 50 -> 10).
- **Predicate Filtering:** Subscribers filter events by tenant, show format, or custom conditions.
- **Error Isolation:** Exceptions thrown in a subscriber handler do not crash the bus or impede delivery to sibling subscribers.
- **Audit & Replay:** In-memory circular buffer for telemetry replay, diagnostics, and audit logging.

### Pillar 2: 4-Tier Hierarchical Feature Flags (`EnterpriseFeatureFlagManager`)
Feature flags resolve dynamically using cascading precedence:
1. **Tier 1 (USER):** Per-user or staff override (highest priority).
2. **Tier 2 (THEATRE):** Per-venue override (venue autonomy).
3. **Tier 3 (ORGANIZATION):** Circuit-wide override (enterprise circuit policy).
4. **Tier 4 (PLATFORM):** Global core switch.
5. **Fallback (DEFAULT):** Standard default configuration.
- **Canary Deployments:** Supports `rolloutPercentage` (0–100%) using deterministic hashing of entity keys for phased releases.

### Pillar 3: Pluggable Extension SDK (`EnterpriseExtensionRegistry`)
- Module manifests declare `moduleId`, `platformKey`, `version`, `dependencies`, and minimum core version.
- **Lifecycle Hooks:** `onInstall`, `onEnable`, `onDisable`, `onUpgrade`.
- **Dynamic Routing:** Registered modules contribute admin and venue routes (`registerRoutes`) filtered by actor role.
- **Dynamic Security Permissions:** Modules inject permissions (`registerPermissions`) into platform RBAC.
- **Background Jobs:** Modules register recurring cron schedules (`registerBackgroundJobs`) for automated processing.

---

## 4. The 8 Enterprise Sub-Platforms

| Sub-Platform | Key Entities / Contracts | Description |
|---|---|---|
| **1. Organization Platform** | `Organization`, `Branch`, `RegionalOffice`, `FranchiseAgreement`, `CorporateAccount` | Multi-branch circuits, territory directorates, franchise revenue sharing (e.g., 12.5% royalty), and B2B corporate credit invoicing. |
| **2. Customer Experience** | `MembershipPlan`, `GiftCard`, `LoyaltyProgram`, `RewardPointsLedger` | Tiered Cinema Passports (Gold, VIP Black), promotional gift cards, and spend-based reward points earn/burn. |
| **3. Pricing Engine** | `DynamicPricingRule`, `IPricingRuleEngine` | Rule-based occupancy surges (+25% peak weekend), morning early-bird discounts (-15%), and format multipliers. |
| **4. Device Platform (IoT)** | `DeviceRegistry`, `DeviceTelemetry`, `ISmartKioskController`, `IDigitalSignageController` | Auditorium environmental sensors, projector lamp telemetry, lobby digital signage playlists, and smart ticketing kiosks. |
| **5. AI Platform (Stubs)** | `IMovieRecommendationEngine`, `ISeatRecommendationEngine`, `IUpsellEngine` | Personalized movie suggestions, optimal seat group allocation, and concession upsell recommendations. |
| **6. Integration Platform** | `APIClient`, `ApiScope`, `WebhookSubscription` | Developer partner API keys, granular API scopes (`SHOWS_READ`, `BOOKINGS_WRITE`), and asynchronous webhook delivery. |
| **7. Regional Platform** | `RegionalDeploymentConfig` | Cross-border compliance, multi-currency stacks (INR, USD, AED), statutory tax frameworks (GST, VAT), and data residency. |
| **8. Extension SDK** | `ExtensionManifest`, `ExtensionLifecycleHooks`, `EnterpriseExtensionRegistry` | Pluggable runtime kernel managing module installation, activation, dependency validation, and background workers. |

---

## 5. Security & Multi-Tenant Governance Integration

1. **Role-Based Access Control (RBAC):**
   - Super Admins have circuit-wide governance: install/toggle modules, configure global flags, manage organization hierarchy.
   - Theatre Admins have venue-scoped governance: manage venue devices, toggle theatre-level feature flag overrides.
   - Theatre Staff and Customers are restricted to read-only operational interfaces.
2. **Rate Limiting & Audit Logging:**
   - Server actions enforce `ADMIN_API` rate limiting and audit logging via `createProtectedAction`.
3. **Decoupled Persistence:**
   - Drizzle ORM schema defined in `db/schema/enterprise-extensions.ts`.
   - Domain repository pattern implemented in `lib/repositories/enterprise-extensions.repository.ts`.
