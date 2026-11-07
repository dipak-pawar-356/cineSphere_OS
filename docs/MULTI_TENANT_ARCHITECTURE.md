# CineSphere OS — Multi-Tenant Cinema Operating System Architecture

> **Tagline:** The Operating System for Modern Cinemas  
> **Architecture Spec:** Enterprise Multi-Tenant Domain Driven Hierarchy  
> **Status:** Production-Ready Configuration Architecture

---

## 1. Multi-Tenant Architectural Hierarchy

CineSphere OS is NOT a traditional movie-booking website. It is an enterprise-grade Multi-Tenant Cinema Operating System.

In this platform, the platform owner (**Super Admin**) owns the software infrastructure. Each cinema chain or independent theatre operates completely autonomously inside the platform with zero data leakage.

```
                      ┌─────────────────────────────────────────┐
                      │          Platform (Super Admin)         │
                      │  Global Infrastructure & Governance     │
                      └────────────────────┬────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
┌────────▼────────┐               ┌────────▼────────┐               ┌────────▼────────┐
│    Theatre A    │               │    Theatre B    │               │    Theatre C    │
│ (e.g. Pune 100) │               │ (e.g. Mumbai 240│               │ (e.g. Ahd 68)   │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
┌────────▼────────┐               ┌────────▼────────┐               ┌────────▼────────┐
│     Hall 1      │               │     Hall 1      │               │     Hall 1      │
│  (IMAX Laser)   │               │ (Royale Dolby)  │               │ (Boutique Club) │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
┌────────▼────────┐               ┌────────▼────────┐               ┌────────▼────────┐
│   Hall Layout   │               │   Hall Layout   │               │   Hall Layout   │
│ (Designed Once) │               │ (Designed Once) │               │ (Designed Once) │
└────────┬────────┘               └────────┬────────┘               └────────┬────────┘
         │                                 │                                 │
         │  ◄──────────────────────────────┼──────────────────────────────►  │
         │                                 │                                 │
┌────────▼─────────────────────────────────▼─────────────────────────────────▼────────┐
│                                       Movie                                         │
│                Global / Licensed Cinematic Catalog (Dune, Kalki, Pushpa)            │
└──────────────────────────────────────────┬──────────────────────────────────────────┘
                                           │
                      ┌────────────────────▼────────────────────┐
                      │                  SHOW                   │
                      │      THE CENTRAL ENTITY OF THE SYSTEM   │
                      │   (Movie + Theatre + Hall + Date/Time)  │
                      └────────────────────┬────────────────────┘
                                           │
                      ┌────────────────────▼────────────────────┐
                      │           Show Pricing & Inventory      │
                      │     Section-Based Show Pricing (A, B, C)│
                      │    Generated Seat Inventory for Show    │
                      └────────────────────┬────────────────────┘
                                           │
                      ┌────────────────────▼────────────────────┐
                      │                 Booking                 │
                      │  Selected Seats + Live Price Summary    │
                      └────────────────────┬────────────────────┘
                                           │
                      ┌────────────────────▼────────────────────┐
                      │                 Payment                 │
                      │      Theatre-Specific Payee (UPI / QR)  │
                      └────────────────────┬────────────────────┘
                                           │
                      ┌────────────────────▼────────────────────┐
                      │                 Ticket                  │
                      │      Encrypted Dynamic Digital Pass     │
                      └─────────────────────────────────────────┘
```

---

## 2. Why the Show is the Central Entity

A frequent architectural flaw in cinema software is attaching pricing or seat availability directly to the **Movie** or permanently to the **Hall**.

In CineSphere OS:
1. **One Hall plays many different movies at different times:**
   - Hall 1 plays *Pushpa 2* in the morning, *Kalki 2898 AD* in the afternoon, and *Dune: Part Two* at night.
2. **The Hall Layout is designed once and reused:**
   - Theatre Admin configures the auditorium physical geometry (capacity, sections, rows, aisles, emergency exits, wheelchair spaces) once.
   - Future shows reuse this identical physical layout without redesign.
3. **Seat prices belong strictly to the Show, NEVER the Hall:**
   - Morning Show in Hall 1: Section A = ₹200, Section B = ₹300, Section C = ₹250.
   - Night Show in Hall 1: Section A = ₹250, Section B = ₹350, Section C = ₹300.
4. **Seat availability belongs strictly to the Show:**
   - A seat booked for the 10:30 AM show remains completely available for the 09:45 PM show.
5. **Bookings, Payments, and Tickets belong to the Show:**
   - A customer books tickets for a specific showtime.

---

## 3. Dynamic Hall Design & Automatic Seat Generation

Theatre Admins never manually place individual seats. The system dynamically generates the complete seat matrix from high-level section rules.

### Input Configuration Example
```typescript
Hall Capacity: 100 Seats
Sections:
  - Section A: 20 Seats (Row A, 20 seats/row, Blue, Standard)
  - Section B: 30 Seats (Row B, 30 seats/row, Gold, VIP)
  - Section C: 50 Seats (Rows C & D, 25 seats/row, Green, Recliner)
```

### Automatic Generation Engine Output
The engine automatically computes:
- `A1` $\rightarrow$ `A20`
- `B1` $\rightarrow$ `B30`
- `C1` $\rightarrow$ `C50` (or `C1`..`C25`, `D1`..`D25`)
- Row labels, column numbers, seat types, section colors, and coordinates.
- Total capacity verified: $20 + 30 + 50 = 100$ seats.

The layout adapts responsively whether the hall capacity is 50, 100, 240, or 400 seats.

---

## 4. Section-Based Show Pricing & Live Price Calculation

### Inheritance Rule
Whenever a customer clicks a seat, the seat price is dynamically inherited from its section for that specific show:

$$\text{Seat Price} = \text{Show.pricing.sectionPricing}[\text{Seat.sectionId}]$$

### Real-Time Live Calculation
```
Selected Seats: A1 (₹200) + A2 (₹200) + B5 (₹350)
  Seat Subtotal:      ₹750
  Convenience Fee:    ₹105  (3 seats × ₹35)
  Integrated GST:     ₹154  (18% on Subtotal + Convenience)
  ------------------------
  Grand Total:      ₹1,009
```

---

## 5. Tenant Isolation & Theatre-Specific Payments

In CineSphere OS multi-tenancy:
- **No Shared Payment Gateway:** During ticket checkout, payment belongs directly to the **Theatre hosting the show**, NOT the central platform.
- **Independent UPI & Banking Rails:**
  - *Theatre A (Pune):* `cinesphere.pune@icici` (ICICI Bank)
  - *Theatre B (Mumbai):* `palladium.mumbai@hdfcbank` (HDFC Bank)
  - *Theatre C (Ahmedabad):* `heritage.ahd@axisbank` (Axis Bank)
- **Role Isolation:**
  - A Theatre Admin in Mumbai cannot view, manage, or alter Pune's halls, shows, bookings, revenue, or customer data.

---

## 6. Concurrency Architecture & Temporary Seat Locking

To prevent race conditions where two customers attempt to purchase the same seat simultaneously:

```
Customer A selects Seat B12
     │
     ▼
[ Temporary Seat Lock Request ]
     │
     ├─► Check: Is Seat B12 Available?
     │     │
     │     ├── YES: Acquire In-Memory Lock (10:00 Timer)
     │     │        Seat status -> "Selected" for Customer A
     │     │        Broadcast status -> "Locked / Unavailable" to all other sessions
     │     │
     │     └── NO: Reject with "Seat recently reserved by another patron"
     │
     ▼
[ Checkout Window (600 seconds) ]
     │
     ├── Payment Successful:
     │     Convert Lock -> Confirmed Booking
     │     Status -> "Booked"
     │     Generate Digital Ticket QR Pass
     │
     └── Timer Expires / User Abandons:
           Auto-Release Lock
           Seat status -> "Available"
           Re-enter public pool
```

---

## 7. Reusable Cinema Engine Component Suite

Located in [`components/cinema-engine/`](file:///d:/Project_2k24_25/cineSphere_OS/components/cinema-engine/):

| Component | Responsibility |
|---|---|
| `HallLayoutRenderer` | Dynamic responsive container rendering screen curve, sections, walkways, and exit doors. |
| `SectionRenderer` | Section header with color badge, show pricing, and row-by-row seat grid. |
| `SeatRenderer` | Interactive seat button supporting all 9 states (Available, Selected, Booked, Reserved, Blocked, Maintenance, Wheelchair, Recliner, Couple). |
| `SeatLegend` | Dynamic legend displaying hall sections, color keys, show pricing, and status symbols. |
| `SeatSummary` | List of selected seats with quick-remove buttons. |
| `PriceSummary` | Live calculation of ticket subtotal, convenience fee, GST, and grand total. |
| `BookingSidebar` | Full checkout panel combining Movie, Schedule, SeatSummary, PriceSummary, and Theatre UPI rail. |
| `SeatTooltip` | Micro-tooltip showing seat number, section name, price, and tier on hover. |
| `SectionBadge` | Color-coded pill reflecting section name and tier. |
| `SeatBadge` | Compact selected seat pill (e.g. `B12 · Gold · ₹350`). |
