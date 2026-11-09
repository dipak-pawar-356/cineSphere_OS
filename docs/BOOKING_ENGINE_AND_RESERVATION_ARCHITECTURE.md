# CineSphere OS — Booking Engine & Seat Reservation Architecture

## Phase 2 – Part 11 Documentation

---

## 1. Executive Summary & Core Architectural Law

In enterprise cinema ticketing architectures, the **Booking Engine** does not commence when a customer clicks a seat, nor does it directly mutate the underlying hall seating layout. To support high-throughput concurrent browsing and prevent double-booking collisions, CineSphere OS establishes a strict **3-Tier Inventory & Reservation Layering Model**:

```
Seat Template (Permanent Physical Hall Layout)
            ↓
Show Seat Inventory (One Isolated Inventory per Show)
            ↓
Booking Session (Temporary Customer Session with Temporary Seat Locks)
            ↓
Confirmed Booking (Created strictly AFTER payment confirmation — Phase 2 Part 12)
            ↓
Payment Settlement (Phase 2 Part 12)
            ↓
Issued Ticket QR (Phase 2 Part 12)
```

### Core Architectural Laws:
1. **Permanent Assets Remain Immutable**: The physical hall layout and seat templates (`halls`, `hall_layouts`, `seats`) are never mutated during booking operations.
2. **Show-Specific Isolation**: Availability and state belong to the show's ephemeral inventory (`showId`), isolating shows from one another.
3. **Session vs. Booking Separation**:
   - **Booking Session ID (`sessionCode` / `id`)**: Created the moment a customer enters the reservation flow. Holds temporary seat locks with a strict countdown timer (10 minutes default).
   - **Booking ID (`bookingId` / `referenceCode`)**: Generated strictly **after** payment confirmation in Part 12.
4. **Server-Side Atomic Concurrency Enforcement**: Concurrency conflicts are validated and resolved server-side. Stale frontend states or concurrent clicks on the same seat are rejected with an explicit conflict audit trail (`CONFLICT_REJECTED`).

---

## 2. Key Architecture Components

### 2.1 Domain Types (`types/booking-engine.types.ts`)
- `BookingSessionStatus`: `"Active" | "Expired" | "Cancelled" | "Confirmed"`
- `SeatLockState`: Concurrency state (`"Available" | "Locked" | "Booked" | "Held"`)
- `SelectedSeatItem`: Enriched seat metadata within a temporary session (ID, seat number, row, col, section, tier, unit price, timestamps).
- `BookingSession`: The central session model tracking customer identity, locked seats, countdown timer, financial subtotals, convenience fees, and taxes.
- `BookingEngineRules`: Configurable rules (Max 10 seats, min 1 seat, 10-minute session TTL, ₹35/seat convenience fee, 18% GST).
- `SeatLockDTO`: Active lock descriptor holding `showId`, `seatNumber`, `lockedBySessionId`, and expiration timestamp.
- `DoubleBookingValidationResult`: Concurrency collision analysis result.
- `BookingReviewDTO`: Pre-payment review snapshot.
- `BookingAuditLog`: Tamper-evident ledger tracking `SESSION_CREATED`, `SEAT_ADDED`, `SEAT_REMOVED`, `CONFLICT_REJECTED`, `LOCK_RENEWED`, `SESSION_EXPIRED`, `SESSION_CANCELLED`.

### 2.2 In-Memory Distributed Engine (`lib/engine/booking-engine.ts`)
- **Session Registry**: Manages session state and lifecycle.
- **Seat Locks Registry**: Keyed by `${showId}:${seatNumber}`. Automatically expires locks when sessions expire.
- **Atomic Double-Booking Prevention**:
  ```ts
  const lockKey = `${session.showId}:${seatNumber}`;
  const existingLock = seatLocksRegistry.get(lockKey);
  if (existingLock && existingLock.lockedBySessionId !== sessionId && new Date(existingLock.expiresAt).getTime() > now) {
    logAudit(sessionId, session.showId, session.theatreId, "CONFLICT_REJECTED", { seatNumber });
    return { success: false, error: "Seat is temporarily reserved by another guest." };
  }
  ```
- **Live Lock Renewal (`renewSessionLock`)**: Extends active session locks by 5 minutes.
- **Auto-Expiration (`expireBookingSession`)**: Releases locked seats back to public inventory when the countdown reaches zero.

### 2.3 Production Server Actions (`actions/booking-engine-actions.ts`)
- `createBookingSessionAction`: Starts a new reservation session.
- `getBookingSessionAction`: Retrieves active session state.
- `addSeatToSessionAction`: Locks a seat atomically for the session.
- `removeSeatFromSessionAction`: Releases a locked seat back into circulation.
- `renewSessionLockAction`: Extends lock duration.
- `expireBookingSessionAction`: Explicit or automated timeout purge.
- `cancelBookingSessionAction`: Customer abort handler.
- `validateSeatsAvailabilityAction`: Pre-flight concurrency validator.
- `getActiveSeatLocksAction`: Returns all active locks for a show.
- `getBookingReviewAction`: Prepares pre-payment review snapshot.
- `searchBookingSessionsAction`: Multi-tenant inspection query engine.
- `getBookingAuditLogsAction`: Retrieves the concurrency audit trail.

### 2.4 State Management (`store/booking-session-store.ts`)
A persistent Zustand store managing:
- `currentSession`: Active session data with selected seats and totals.
- `timeRemainingSeconds`: Second-by-second countdown with automatic trigger of `expireCurrentSession()`.
- `isReviewModalOpen` & `isExpiredModalOpen`: Modal orchestrators.
- Actions: `initSession`, `selectSeat`, `deselectSeat`, `extendSessionLock`, `expireCurrentSession`, `openReviewModal`, `resetSession`.

### 2.5 Customer UI Components (`components/booking/`)
- `BookingTimerBadge`: Live `mm:ss` countdown badge with low-timer warning (< 120s) and 1-click `+5m` extension button.
- `BookingReviewModal`: Pre-payment checkout review dialog detailing film, hall, showtime, itemized seats, convenience fee, 18% GST, grand total, and Part 12 gateway handoff notice.
- `BookingSessionExpiredModal`: Explains expired reservation TTL, informs patron that seats have been restored to general inventory, and provides 1-click "Restart Reservation" action.

### 2.6 Theatre Admin Operations (`app/(theatre-admin)/theatre/bookings/page.tsx`)
- Segmented view controller:
  1. **Live Booking Sessions & Concurrency Locks**: Real-time visibility into active browsing sessions, held seat numbers, remaining TTLs, collision protection status, and supervisor override button ("Expire Lock").
  2. **Confirmed Admissions & Issued Tickets**: The existing ledger of scanned QR admissions, payment reconciliation, and ticket statuses.
- **Audit Trail Viewer**: Real-time display of tamper-evident lock events.

---

## 3. Financial Calculation Pipeline

All session prices adhere to the enterprise ticketing fee schedule:
$$\text{Tickets Subtotal} = \sum (\text{Seat Unit Price} \times \text{Dynamic Multiplier})$$
$$\text{Convenience Fee} = \text{Seat Count} \times ₹35$$
$$\text{GST Tax} = \text{round}\left(\frac{\text{Convenience Fee} \times 18}{100}\right)$$
$$\text{Session Grand Total} = \text{Tickets Subtotal} + \text{Convenience Fee} + \text{GST Tax}$$

---

## 4. Verification & Validation Summary

| Requirement | Implementation | Status |
| :--- | :--- | :--- |
| **Layered Architecture** | Hall Layout → Show Inventory → Temporary Session → Confirmed Booking | Verified |
| **Two Distinct IDs** | `sessionCode` (temporary) vs `bookingId` (strictly post-payment) | Verified |
| **Seat Locking TTL** | 10-minute timer with second-precision countdown & auto-release | Verified |
| **Lock Extension** | 1-click `+5m` extension with server validation | Verified |
| **Double-Booking Guard** | Atomic conflict rejection & audit log (`CONFLICT_REJECTED`) | Verified |
| **Pre-payment Review** | `BookingReviewDTO` modal with complete financial breakdown | Verified |
| **Session Expired Modal** | Informs user of inventory release with 1-click restart | Verified |
| **Theatre Admin Oversight** | Live Sessions & Locks tab with supervisor override action | Verified |
| **Audit Trail** | Tamper-evident logging of all session and lock lifecycle events | Verified |

