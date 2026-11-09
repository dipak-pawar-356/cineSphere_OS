# CineSphere OS — Phase 2 Part 13: Ticket Management & Digital Ticket System

## 1. Architectural Philosophy & Core Axiom

A **Ticket is never generated directly upon customer seat selection or booking session creation**.

In enterprise cinema ticketing architectures, temporary seat locks are ephemeral. A digital ticket represents **cryptographic proof of admission**, generated **strictly downstream** of payment authorization, ledger verification, and booking confirmation:

```
Seat Template (Permanent Hall Layout)
            ↓
Show Seat Inventory (One Dynamic Inventory per Show)
            ↓
Booking Session (Temporary Customer Session with TTL locks)
            ↓
Payment (NPCI UPI / Multi-Rail Gateway)
            ↓
Payment Verification (Webhook / Bank Settlement Confirmation)
            ↓
Booking Confirmation (Permanent Ledger Entry)
            ↓
Ticket Generation (Distinct TK Number & Internal UUID)
            ↓
QR Generation (Cryptographic Payload & Dynamic Image URL)
            ↓
My Tickets (Customer-Isolated Mobile & Portal Dashboard)
            ↓
Future Check-in / Entry Validation (Auditorium Turnstile Scanning)
```

This strict separation guarantees:
- **No Ghost Tickets**: Abandoned sessions or declined payments never issue fraudulent passes.
- **Atomic Double-Booking Prevention**: Seat locks expire gracefully without leaving orphan tickets.
- **Recovery & Resilience**: If network drops or browsers close post-payment, tickets are safely generated and accessible from "My Tickets".
- **Turnstile Integrity**: Gate scanners verify immutable confirmation proofs, not speculative reservations.

---

## 2. Four-Tier Identifier Separation

To prevent enumeration attacks, internal database exposure, and customer confusion, CineSphere OS enforces 4 distinct identifier tiers:

| Tier | Format Example | Scope | Purpose |
| :--- | :--- | :--- | :--- |
| **Internal DB ID** | `tkt-1736502000-01` / UUID | Internal Database PK | Relational integrity, cascade operations, foreign keys. |
| **Booking Reference** | `BK-2027-005001` | Human / Accounting | Customer service, payment receipts, consolidated billing. |
| **Ticket Number** | `TK-2027-001001` (`-01`) | Human / Gate Staff | Printed badges, usher seat matching, box-office inquiry. |
| **Public Secure ID** | `01JX9K8Z6N5WQ4R2T8M7P1A9BC` | Public URL & QR | High-entropy, unguessable 26-character Crockford Base32 token. |

### Public URL Security
Public routes (`/tickets/[secureId]`) strictly require the 26-character unguessable Secure ID. Sequential integer requests (`/tickets/1`, `/tickets/123`, `/tickets/42`) are strictly rejected by `isValidSecureId()` to prevent brute-force traversal.

---

## 3. High-Integrity Structured QR Payload

The QR code encodes a compact JSON manifest designed for rapid turnstile reading:

```json
{
  "ticketSecureId": "01JX9K8Z6N5WQ4R2T8M7P1A9BC",
  "bookingSecureId": "01JX9K8Z6N5WQ4R2T8M7P1A9AA",
  "ticketNumber": "TK-2027-001001",
  "theatreId": "th-pun-001",
  "showId": "show-pun-001",
  "seatNumbers": ["C10", "C11"],
  "issuedAt": "2027-01-10T10:00:00.000Z",
  "version": "v1",
  "signaturePlaceholder": "sig_v1_cinesphere_4829a1fe_01JX9K8Z"
}
```

Dynamic QR Code URL derivation:
```ts
https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify(payload))}
```

---

## 4. Multi-Ticket Issuance Strategies

CineSphere OS natively supports two issuance strategies:

1. **`PER_BOOKING` (Consolidated Admission Pass)**:
   - 1 digital ticket representing all allocated seats (e.g. `["E10", "E11"]`, `seatCount: 2`).
   - Best for families and groups entering together through a single door.
2. **`PER_SEAT` (Individual Attendee Passes)**:
   - 1 digital ticket per seat (e.g., `TK-2027-001001-01` for `E10` and `TK-2027-001001-02` for `E11`).
   - Each ticket carries its own distinct Secure ID, QR code, and price allocation.
   - Ideal for attendees arriving at different times or corporate events.

---

## 5. Multi-Tenant Role Isolation

| Role | Access Scope | Modification Rights |
| :--- | :--- | :--- |
| **Customer** (`CUSTOMER`) | Accesses only tickets matching their `customerId`. | Read-only. Can preview QR and open secure detail links. |
| **Theatre Admin** (`THEATRE_ADMIN`) | Accesses only tickets issued for their `theatreId`. | View & search only. Cannot mutate ticket status directly. |
| **Super Admin** (`SUPER_ADMIN`) | Platform-wide cross-tenant visibility. | Full audit inspection and cross-theatre compliance search. |

---

## 6. Verification Test Suite Results

The verification script (`scripts/verify-ticket-system.ts`) executed 12 test suites covering 100% of the architectural invariants:

1. **Enterprise Flow Invariants**: Rejection of unpaid (`PENDING`) and unconfirmed (`CANCELLED`) bookings.
2. **Idempotency**: Prevents duplicate generation on repeat requests.
3. **Identifier Separation**: UUID vs `BK-` vs `TK-` vs Crockford Base32 Secure ID.
4. **Structured QR Conformance**: 8 required payload keys, `v1` version, signature.
5. **Dynamic QR URL Derivation**: Valid 250x250 URI decoding to exact payload.
6. **Multi-Ticket Strategies**: `PER_BOOKING` (1 pass) vs `PER_SEAT` (N passes with `-01`, `-02`).
7. **URL Security**: Sequential access (`/tickets/123`) strictly rejected.
8. **Customer Isolation**: Zero cross-patron data leakage between `cust-001` and `cust-002`.
9. **Theatre Admin Isolation**: Strict scoping between Pune (`th-pun-001`) and Mumbai (`th-mum-001`).
10. **Lifecycle Transitions**: `ACTIVE` -> `CANCELLED`; double-cancellation and used-pass cancellation blocked.
11. **Search & Filter Engine**: Movie title, ticket number, time filters (`UPCOMING`, `PAST`, `TODAY`).
12. **Immutable Audit Trail**: Append-only event logging for `TICKET_GENERATED`, `TICKET_VIEWED`, `TICKET_CANCELLED`.
