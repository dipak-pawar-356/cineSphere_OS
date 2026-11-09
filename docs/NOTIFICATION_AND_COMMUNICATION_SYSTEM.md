# Notification & Communication System Architecture (Phase 2 – Part 14)

## 1. Executive Summary & Architectural Law

In enterprise cinema SaaS platforms, **modules must never send notifications or customer messages directly**. When modules like Booking, Payment, or Show scheduling make direct external API calls to email, SMS, or push providers, the system degrades rapidly into tight coupling, duplicated business logic, untracked dispatches, and fragile error boundaries.

In **CineSphere OS**, the communication architecture enforces a strict **Event-Driven Decoupled Pipeline**:

```
 ┌──────────────────────────────────────────────────────────────┐
 │                        Domain Modules                        │
 │   Booking  •  Payment  •  Show  •  Ticket  •  Administration │
 └──────────────────────────────┬───────────────────────────────┘
                                │ publishes DomainEvent<T>
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      Domain Event Bus                        │
 │                  (publishDomainEvent API)                    │
 └──────────────────────────────┬───────────────────────────────┘
                                │ routes event payload
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │              Central Notification Service                    │
 │                                                              │
 │   1. Template Engine (Dynamic Token Replacement)             │
 │   2. Notification Preferences Matrix (User Opt-in/Opt-out)   │
 │   3. Multi-Channel Dispatch Evaluator                        │
 └──────────────────────────────┬───────────────────────────────┘
                                │ dispatches multi-channel manifest
       ┌────────────────┬───────┴────────┬──────────────┐
       ▼                ▼                ▼              ▼
  ┌──────────┐    ┌───────────┐    ┌───────────┐  ┌───────────┐
  │  In-App  │    │  Email*   │    │   SMS*    │  │   Push*   │
  │(Live UI) │    │(Queued PH)│    │(Queued PH)│  │(Queued PH)│
  └────┬─────┘    └───────────┘    └───────────┘  └───────────┘
       │
       ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                     Recipient UI Portals                     │
 │   Patron (/profile/notifications)                            │
 │   Theatre Admin (/theatre/notifications)                     │
 │   Super Admin (/dashboard/notifications)                     │
 └──────────────────────────────────────────────────────────────┘
 (* Architecture Placeholders — ready for future production gateway integration)
```

---

## 2. The Three Future-Proof Enhancements

### 2.1 Dynamic Notification Templates (`renderTemplate`)
Notification messages and titles are decoupled from business logic and governed by a centralized dictionary of reusable templates:
- **Token Replacement:** Replaces dynamic tokens such as `{customerName}`, `{movieTitle}`, `{theatreName}`, `{hallName}`, `{showTime}`, `{seatLabels}`, `{amount}`, `{bookingRef}`, `{qrLink}`.
- **Graceful Fallbacks:** Missing variables default to human-readable strings (e.g. `Valued Patron`, `Upcoming Feature`).
- **Target Role Mapping:** Templates define target roles (`CUSTOMER`, `THEATRE_ADMIN`, `SUPER_ADMIN`), default priorities, and notification categories.

### 2.2 User Notification Preferences Matrix (`NotificationPreferences`)
Patrons and staff retain granular control over which channels and categories can contact them:
- **Delivery Channels:**
  - `inApp`: Live dashboard feed and web alerts (active in CineSphere OS).
  - `email`: Automated booking summaries and tax invoice attachments.
  - `sms`: Fast text messages with turnstile QR pass access links.
  - `push`: Mobile push notifications (e.g. door opening 15 mins prior).
  - `whatsapp`: WhatsApp concierge passes and venue directions.
- **Event Categories:**
  - `bookingUpdates`: Reservations, locks, and cancellation receipts.
  - `paymentReceipts`: UPI, Card, and Netbanking verification slips.
  - `ticketPasses`: Dynamic HMAC QR admission passes.
  - `showReminders`: Auditorium door-opening advisories.
  - `promotionalOffers`: F&B combos and premiere invites.
  - `securityAlerts`: Device logins, password resets, and suspicious session flags.
- **Opt-Out Propagation:** If a user opts out of SMS, the SMS dispatch manifest marks the status as `"OPTED_OUT"`. If a user opts out of the `MARKETING` category, marketing notifications receive `"SUPPRESSED"` status.

### 2.3 Decoupled Consumer Event Subscription (`publishDomainEvent`)
Modules emit lightweight domain events (`DomainEvent<T>`) containing:
- `id`: Event UUID.
- `type`: E.g. `BookingConfirmed`, `PaymentSucceeded`, `TicketIssued`, `ShowCancelled`, `LowSeatAvailability`, `NewTheatreRegistered`.
- `sourceModule`: Originating domain (`BOOKING`, `PAYMENT`, `SHOW`, `TICKET`, `THEATRE`, `ADMIN`, `SYSTEM`).
- `occurredAt`: ISO 8601 timestamp.
- `actor`: User ID and role responsible for triggering the action.
- `payload`: Relevant domain metadata.

The event consumer evaluates all business subscribers, renders targeted templates for each stakeholder, and generates independent recipient records.

---

## 3. Database Schema & Multi-Channel Manifest

### 3.1 Schema Definition (`db/schema/operations.ts`)
```typescript
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: text("recipient_id").notNull(),
    recipientRole: text("recipient_role").notNull(),
    theatreId: text("theatre_id"),
    type: text("type").notNull(),
    category: text("category").default("SYSTEM").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    priority: text("priority").default("NORMAL").notNull(),
    status: text("status").default("UNREAD").notNull(),
    sourceModule: text("source_module").default("SYSTEM").notNull(),
    referenceEntity: jsonb("reference_entity"),
    channelDispatches: jsonb("channel_dispatches").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [
    index("idx_notifications_recipient").on(table.recipientId, table.status),
    index("idx_notifications_theatre").on(table.theatreId, table.status),
    index("idx_notifications_role_status").on(table.recipientRole, table.status),
  ]
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    channels: jsonb("channels").notNull(),
    categories: jsonb("categories").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);
```

### 3.2 Channel Dispatch Manifest Structure
Each notification stores an immutable manifest record of all evaluated channels:
```json
{
  "IN_APP": "DELIVERED",
  "EMAIL": "QUEUED_PLACEHOLDER",
  "SMS": "QUEUED_PLACEHOLDER",
  "PUSH": "QUEUED_PLACEHOLDER",
  "WHATSAPP": "QUEUED_PLACEHOLDER",
  "TELEGRAM": "QUEUED_PLACEHOLDER",
  "WEBHOOK": "QUEUED_PLACEHOLDER"
}
```
If a customer disables SMS in preferences, `SMS` is automatically dispatched as `"OPTED_OUT"`. If a category is turned off, `IN_APP` transitions to `"SUPPRESSED"`.

---

## 4. Multi-Tenant Role Isolation & In-App UI

CineSphere OS provides purpose-built notification centers across all three core platform roles:

### 4.1 Customer Notification Center (`/profile/notifications`)
- **Isolation Rule:** Customers strictly view notifications matching `recipientId === customerId`. Cross-customer notification leakage is prevented at engine and database level.
- **Interactive Capabilities:**
  - Real-time unread badge counter.
  - "Mark All Read" batch synchronization.
  - Multi-criteria filter tabs: All Active, Unread, Read, Archived.
  - Category selectors: Booking, Payment, Ticket, Show, Marketing, Security, System.
  - Priority pills: Critical, High, Normal, Low.
  - Multi-channel delivery telemetry badges on every notification card.
  - Direct contextual links to admission passes (`/profile/tickets`) and active bookings.
  - Interactive **Notification Preferences Modal** allowing patrons to toggle communication channels and event categories with instant live persistence.

### 4.2 Theatre Admin Notification Center (`/theatre/notifications`)
- **Isolation Rule:** Scoped to `theatreId === adminTheatreId && recipientRole === 'THEATRE_ADMIN'`. Theatre admins cannot access notifications of competing cinema properties or private patron inboxes.
- **Interactive Capabilities:**
  - Operations Queue monitoring Turnstile check-ins, Projector SNMP traps, and Box Office milestones.
  - Filter tabs: All Alerts, Unread Alerts, Box Office & Bookings, Auditorium Telemetry, Archived.
  - "Acknowledge" button to mark operational alerts as read.
  - "Mark All as Read" batch operation.

### 4.3 Super Admin Platform Notification Center (`/dashboard/notifications`)
- **Isolation Rule:** System-wide governance matching `recipientRole === 'SUPER_ADMIN'`.
- **Interactive Capabilities:**
  - System alerts, hardware warnings, distributor KDM advisories, and security incidents.
  - "Clear Resolved" batch archiving.
  - Live **Audit Trail Drawer** streaming immutable dispatch records (`NotificationAuditLog`).
  - Search and filter by criticality, status, and source module.

---

## 5. Automated Verification Suite (`scripts/verify-notification-system.ts`)

A dedicated 12-point automated test suite verifies all system invariants:

| # | Verification Test | Result |
|---|---|:---:|
| 1 | **Template Engine:** Dynamic placeholder token replacement (`{movieTitle}`, `{customerName}`, `{bookingRef}`) | ✅ PASS |
| 2 | **Event Bus Decoupling:** `BookingConfirmed` publishes decoupled notifications to Customer and Theatre Admin | ✅ PASS |
| 3 | **Dispatch Manifest:** In-App marked `DELIVERED`; Email/SMS/Push marked `QUEUED_PLACEHOLDER` | ✅ PASS |
| 4 | **User Preferences:** Channel opt-out marks `OPTED_OUT`; Category opt-out marks `SUPPRESSED` | ✅ PASS |
| 5 | **Customer Isolation:** Zero cross-customer notification leakage between independent patrons | ✅ PASS |
| 6 | **Theatre Admin Isolation:** Zero cross-cinema leakage between Pune and Mumbai properties | ✅ PASS |
| 7 | **Super Admin Visibility:** Platform-wide telemetry and onboarding approval alerts | ✅ PASS |
| 8 | **Status Lifecycle:** Transitions `UNREAD` → `READ` → `ARCHIVED` → `DELETED` with timestamps | ✅ PASS |
| 9 | **Batch Operations:** `markAllNotificationsAsRead` synchronizes all alerts and sets unread count to 0 | ✅ PASS |
| 10 | **Search & Filtering:** Text query, priority filter, category filter, and status filter accuracy | ✅ PASS |
| 11 | **Unread Calculation:** Increments and decrements dynamically with notification mutations | ✅ PASS |
| 12 | **Immutable Audit Logging:** Captures `CREATED`, `READ`, `ARCHIVED`, `DELETED`, `PREFERENCES_UPDATED` | ✅ PASS |
