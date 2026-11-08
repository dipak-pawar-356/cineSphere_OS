# 💰 CineSphere OS — Phase 2 - Part 9: Dynamic Pricing Engine Architecture

## 📌 Executive Summary & Architectural Mandate

In enterprise cinema and SaaS ticketing platforms (such as BookMyShow, Vista Cinema, PVR INOX, AMC Theatres), **hardcoding ticket prices into movies, auditoriums, or seat layout templates is an architectural anti-pattern**.

CineSphere OS enforces the **Fundamental Separation Law**:
1. **Movies NEVER store prices** — A film represents creative metadata (title, runtime, certificate, trailer, audio tracks).
2. **Halls NEVER store prices** — An auditorium represents physical infrastructure (projection hardware, sound system, geometric capacity).
3. **Seat templates NEVER store prices** — A seat template represents physical geometry ($A1, A2, A3 \dots$).
4. **Pricing belongs strictly to SECTIONS via reusable Pricing Profiles** — All seats in a section inherit that section's price dynamically from the scheduled Show's attached Pricing Profile.

---

## 🏛️ 1. Complete Architectural Hierarchy

$$\text{Platform} \longrightarrow \text{Theatre Tenant} \longrightarrow \text{Pricing Profile} \longrightarrow \text{Section Pricing} \longrightarrow \text{Show} \longrightarrow \text{Seat Inventory} \longrightarrow \text{Customer Booking}$$

```
                                  ┌───────────────────────────────┐
                                  │       PLATFORM ENTERPRISE     │
                                  │          CineSphere OS        │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │        THEATRE TENANT         │
                                  │   Multi-Tenant Partitioned    │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │    REUSABLE PRICING PROFILE   │
                                  │  e.g. "Weekend Blockbuster"   │
                                  │  Day: Weekend | Slot: Prime   │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │        SECTION PRICING        │
                                  │  Silver: ₹280 | Gold: ₹360    │
                                  │  Platinum: ₹460 | VIP: ₹650   │
                                  │  Recliner: ₹800 | Royal: ₹1200│
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │        SCREENING EVENT        │
                                  │            (SHOW)             │
                                  │ Links Movie + Hall + Profile  │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │      SHOW SEAT INVENTORY      │
                                  │ Dynamic inheritance per seat: │
                                  │ A1, A2, A3 → Inherit Section  │
                                  └───────────────────────────────┘
```

This clean decoupling allows the **exact same auditorium** to be reused across thousands of shows with completely different pricing tariffs:
- **10:00 AM Monday**: *Morning Weekday Economy* (Silver ₹180, Gold ₹240, VIP ₹450)
- **02:30 PM Wednesday**: *Weekday Matinee Regular* (Silver ₹220, Gold ₹280, VIP ₹500)
- **08:00 PM Friday**: *Weekend Blockbuster Prime* (Silver ₹350, Gold ₹450, VIP ₹800)
- **07:30 PM Diwali**: *Holiday & Festival Premium* (Silver ₹400, Gold ₹520, VIP ₹900)

---

## ⚡ 2. Price Calculation Pipeline

When a customer or box office counter selects seats, CineSphere OS executes the following deterministic calculation pipeline:

$$\text{Seat Selection } (A3, B5, VIP\text{-}1) \longrightarrow \text{Identify Section Tier} \longrightarrow \text{Lookup Pricing Profile} \longrightarrow \text{Compute Grand Total}$$

$$\text{Seat Subtotal} = \sum_{i=1}^{n} \text{UnitPrice}(\text{Seat}_i)$$

$$\text{Convenience Fee Total} = n \times \text{ConvenienceFeePerSeat}$$

$$\text{GST Integrated Tax} = \left\lfloor \frac{\text{Convenience Fee Total} \times \text{GST\%}}{100} \right\rfloor$$

$$\text{Grand Total} = \max(0, \text{Seat Subtotal} + \text{Convenience Fee Total} + \text{GST Tax} - \text{Discount})$$

### Concrete Example:
- **Selected Seats**: `C3` (Gold Tier: ₹280), `C4` (Gold Tier: ₹280)
- **Profile Applied**: *Weekday Matinee Regular*
- **Convenience Fee**: ₹35 / seat ($2 \times 35 = ₹70$)
- **Integrated GST**: 18% on convenience fee ($₹70 \times 18\% = ₹12.60 \approx ₹13$)
- **Subtotal**: $₹280 + ₹280 = ₹560$
- **Grand Total Payable**: $₹560 + ₹70 + ₹13 = ₹643$

---

## 🗄️ 3. Type Definitions & Data Structures

Located in [`types/pricing-engine.types.ts`](file:///d:/Project_2k24_25/cineSphere_OS/types/pricing-engine.types.ts):

```typescript
export interface DynamicPricingProfile {
  id: string; // e.g. "pp-morning-weekday"
  theatreId: string; // Scoped strictly to Theatre Tenant
  code: string; // e.g. "PRF-MW-01"
  name: string; // e.g. "Morning Weekday Economy"
  description: string;
  status: PricingProfileStatus; // "Draft" | "Active" | "Inactive" | "Archived"
  isDefault: boolean; // Auto-selected for newly scheduled shows
  isActive?: boolean;
  dayType: PricingDayType; // "Weekday" | "Weekend" | "Holiday" | "All"
  slotType: PricingSlotType; // "Morning" | "Matinee" | "Evening" | "Night" | "All"

  /** Section / Category Tier Pricing Map (INR ₹) */
  tierPricing: Record<string, number>;

  /** Auxiliary fees & statutory taxes */
  convenienceFee: number; // e.g. ₹35.00
  gstPercent: number; // e.g. 18.00%
  currency: string; // "INR"

  /** Safety guardrails */
  minPrice: number;
  maxPrice: number;

  /** Architectural hooks for future dynamic rule engines */
  futureRules?: DynamicPricingRuleDescriptor[];

  createdAt: string;
  updatedAt: string;
}
```

---

## 🛠️ 4. Calculation & Simulation Engine

Located in [`lib/engine/pricing-engine.ts`](file:///d:/Project_2k24_25/cineSphere_OS/lib/engine/pricing-engine.ts):

- **`calculateShowTicketPrice(seatSelections, profile, options)`**:
  Computes itemized seat lines, subtotal, convenience fees, GST, discounts, and grand total.
- **`simulateShowRevenue(sections, profile)`**:
  Computes auditorium revenue projections across 100% (Housefull), 75%, and 50% occupancy, as well as Average Ticket Price (ATP) and section yield breakdowns.
- **`INITIAL_DYNAMIC_PRICING_PROFILES`**:
  10 pre-seeded production profiles covering *Morning Weekday Economy*, *Weekday Matinee Regular*, *Prime Evening (Mon - Thu)*, *Weekend Morning Family*, *Weekend Blockbuster Prime*, *Holiday & Festival Premium*, *IMAX Laser Special Experience*, *Festival Special*, *Corporate Event*, and *Special Screening*.

- **Server Actions Suite** ([`actions/pricing-actions.ts`](file:///d:/Project_2k24_25/cineSphere_OS/actions/pricing-actions.ts)):
  - `createPricingProfileAction`: Validates and creates a new reusable profile.
  - `updatePricingProfileAction`: Merges changes and tracks audit logs.
  - `deletePricingProfileAction`: Enforces dependency checking (cannot delete default profile or profile attached to active shows).
  - `duplicatePricingProfileAction`: Clones an existing profile as a Draft copy.
  - `assignPricingProfileToShowAction`: Connects a Pricing Profile to a specific Show screening event with tenant isolation validation.
  - `validatePricingAction`: Standalone validation of pricing input, boundaries, currencies, and decimal amounts.
  - `activatePricingProfileAction`: Transitions profile status to `Active`.
  - `archivePricingProfileAction`: Archives profile (with protection against archiving the default profile).
  - `calculateTicketPricingAction`: Runs the complete seat calculation pipeline.

---

## 🖥️ 5. Dedicated Control Plane UI

### 5.1 Pricing Studio Route: `/theatre/pricing`
Located in [`app/(theatre-admin)/theatre/pricing/page.tsx`](file:///d:/Project_2k24_25/cineSphere_OS/app/(theatre-admin)/theatre/pricing/page.tsx):
- **Executive KPI Cards**: Total profiles, Default profile, Average Ticket Price (ATP), and Peak Tier yield.
- **Search & Multi-Faceted Filters**: Real-time text search, Day classification pills (All, Weekday, Weekend, Holiday), Time slot pills (Morning, Matinee, Evening), and Status dropdown.
- **Dual View Modes**: Switch seamlessly between interactive **Grid Cards View** and structured **Detailed Table View**.
- **Yield Analysis Widget**: Select any hall and pricing profile to project housefull gross box office collections.

### 5.2 Pricing Profile Management Modal
Located in [`components/pricing/pricing-profile-modal.tsx`](file:///d:/Project_2k24_25/cineSphere_OS/components/pricing/pricing-profile-modal.tsx):
- Create and edit dynamic pricing profiles.
- Set rates for Silver, Gold, Platinum, VIP, Recliner, Wheelchair, and Royal Suite sections.
- Add and remove custom section tiers.
- Configure convenience fee, GST %, min price, and max price boundaries.
- Live checkout calculation preview card with 2-ticket breakdown.

### 5.3 Interactive Seat Pricing Simulator Modal
Located in [`components/pricing/pricing-simulator-modal.tsx`](file:///d:/Project_2k24_25/cineSphere_OS/components/pricing/pricing-simulator-modal.tsx):
- Visual auditorium floor plan with curved screen horizon.
- Click individual seats ($A1, C4, G2 \dots$) or click row headers to batch select.
- Switch active Pricing Profiles and test dynamic multipliers (1.0x, 0.95x Early Bird, 1.15x High Demand Surge).
- Real-time calculation breakdown pane showing itemized seats, subtotal, convenience fee, GST, and bold Emerald grand total.

---

## 🔒 6. Security, Isolation & Validation

1. **Multi-Tenant Scoping**: All pricing profiles are partitioned by `theatreId`. No tenant can query or mutate another theatre's pricing configurations.
2. **Input Guardrails**:
   - Section rates must be strictly $\ge 0$ and $\le ₹15,000$.
   - Convenience fee must be between ₹0 and ₹500.
   - GST percentage must be between 0% and 28%.
   - Profile names must be non-empty and between 2 and 100 characters.
3. **Deletion Safeguards**:
   - The theatre default profile **cannot** be deleted (another profile must be marked as default first).
   - Profiles currently assigned to active shows **cannot** be deleted until those shows are reassigned or cancelled.
4. **Audit Logging**: Every mutation (`PRICING_PROFILE_CREATED`, `PRICING_PROFILE_UPDATED`, `PRICING_PROFILE_DELETED`, `PRICING_PROFILE_DUPLICATED`, `PRICING_PROFILE_DEFAULT_CHANGED`) is appended to the tenant audit log.

---

## ✅ 7. Quality & Verification Gates Passed

- `tsc --noEmit`: **0 errors** (100% strict TypeScript compliance).
- `next lint`: **0 errors** across all pricing engine modules.
- Dynamic navigation badge registered under `THEATRE_ADMIN.PRICING` in [`config/routes.ts`](file:///d:/Project_2k24_25/cineSphere_OS/config/routes.ts) and [`config/navigation.ts`](file:///d:/Project_2k24_25/cineSphere_OS/config/navigation.ts).

