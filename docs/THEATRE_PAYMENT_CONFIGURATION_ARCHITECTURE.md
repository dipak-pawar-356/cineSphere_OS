# Phase 2 — Part 12: Theatre Payment Configuration & Architecture

## Executive Architectural Summary

In enterprise cinema ticketing platforms, hardcoding payment details directly onto the theatre record or coupling payment transactions to the theatre entity introduces severe fragility. **CineSphere OS Phase 2 – Part 12** introduces a decoupled, multi-rail **Payment Architecture** that cleanly separates **Payment Configurations** from **Payment Transactions**.

```
Platform
   │
   ▼
Theatre (Tenant)
   │
   ├─► Payment Configuration 1 (Direct UPI - Primary Box Office Rail)
   ├─► Payment Configuration 2 (Direct UPI - Concessions F&B Rail)
   ├─► Payment Configuration 3 (Razorpay Multi-Rail Gateway)
   ├─► Payment Configuration 4 (Stripe International Currencies)
   └─► Payment Configuration 5 (Box Office Cash Counter)
          │
          ▼
   Payment Provider Rail (NPCI UPI / Aggregator Gateway / Cash Drawer)
          │
          ▼
   Booking Session / Confirmed Booking
          │
          ▼
   Payment Transaction (Ledger Record)
```

---

## 1. Core Architectural Capabilities

### 1.1 One Theatre to Many Payment Configurations (1:N)
* A cinema operator is not constrained to a single merchant ID or static UPI QR code.
* Separate payment rails can be designated for different operational zones (Box Office tickets vs Concessions lounge vs VIP corporate booking).
* Supporting future payment gateways (Razorpay, PhonePe, Paytm, Stripe) does not alter the theatre schema.

### 1.2 The Dynamic QR Invariant (Zero Static Image Blobs)
* **Anti-Pattern**: Storing static image URLs or image blobs in the database causes immediate desynchronization when fees, amounts, merchant VPAs, or brand details change.
* **CineSphere Standard**: The database stores **only** the underlying payment metadata:
  * Merchant Name (`merchantName`, `merchantDisplayName`)
  * Designated UPI Virtual Payment Address (`upiId`)
  * Merchant Category Code (`merchantCode = 7832` for Motion Picture Theatres, `5812` for Eating Places)
  * Configuration Version (`configVersion`)
* **Dynamic Derivation**: The system computes the **NPCI UPI Intent URI** dynamically:
  ```
  upi://pay?pa=cinesphere.pune@icici&pn=CineSphere+Grand+Cinemas&mc=7832&cu=INR&am=520.50&tr=TXN-9901&tn=Ticket+Booking
  ```
  The QR code is generated on the fly from this URI vector, allowing instantaneous rotation and zero image staleness.

### 1.3 Primary Rail Orchestration & Auto-Demotion
* Exactly **one** active configuration can be designated as `isPrimary = true` per theatre for default checkout routing.
* Setting any configuration to primary automatically demotes all other configurations for that theatre to non-primary in a single transactional operation.
* Immediate fallback to any active rail if no primary is flagged.

### 1.4 Strict Multi-Tenant Isolation
* **Theatre Admins** can only view, create, mutate, or delete payment configurations belonging to their authenticated `theatreId`.
* **Cross-Tenant Guard**: Attempts by Tenant A to alter or delete Tenant B's payment configuration throw a strict cross-tenant violation.
* **Customer Role Sanitization**: When customers fetch available payment rails during checkout, sensitive fields (masked account numbers, gateway private keys, webhooks) are automatically stripped.

### 1.5 Configuration Versioning & Immutable Audit Trail
* Every update to a payment configuration increments `configVersion` (`v1 -> v2 -> v3`).
* Every state transition (`CONFIG_CREATED`, `CONFIG_UPDATED`, `CONFIG_SET_PRIMARY`, `CONFIG_ACTIVATED`, `CONFIG_DEACTIVATED`, `CONFIG_DELETED`, `PAYMENT_SESSION_PREPARED`) is recorded in the immutable audit ledger with timestamps, actor IDs, and state diffs.

---

## 2. Database Schema Reference

### 2.1 Enums (`db/schema/enums.ts`)
* `paymentProviderEnum`: `["UPI", "RAZORPAY", "PHONEPE", "PAYTM", "STRIPE", "CASH_COUNTER", "CORPORATE_BILLING", "GIFT_CARD", "FUTURE_PROVIDER"]`
* `paymentProviderStatusEnum`: `["DRAFT", "ACTIVE", "INACTIVE", "DISABLED", "ARCHIVED"]`
* `paymentStatusEnum`: `["PENDING", "AUTHORIZED", "CAPTURED", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED", "EXPIRED"]`
* `paymentMethodEnum`: `["UPI", "CARDS", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "WALLET", "EMI", "CASH_COUNTER", "CASH", "CORPORATE_BILLING", "GIFT_VOUCHER", "MEMBERSHIP_WALLET"]`

### 2.2 Payment Configurations (`db/schema/payments.ts`)
```ts
export const paymentConfigurations = pgTable(
  "payment_configurations",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 36 }).notNull().references(() => theatres.id),
    businessName: varchar("business_name", { length: 150 }).notNull(),
    merchantName: varchar("merchant_name", { length: 150 }).notNull(),
    merchantDisplayName: varchar("merchant_display_name", { length: 150 }),
    provider: paymentProviderEnum("provider").notNull().default("UPI"),
    upiId: varchar("upi_id", { length: 100 }).notNull(),
    merchantCode: varchar("merchant_code", { length: 20 }).notNull().default("7832"),
    configVersion: integer("config_version").notNull().default(1),
    qrPlaceholder: text("qr_placeholder").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: paymentProviderStatusEnum("status").notNull().default("ACTIVE"),
    bankName: varchar("bank_name", { length: 100 }).notNull().default("HDFC Bank"),
    accountNumberMasked: varchar("account_number_masked", { length: 50 }),
    ifscCode: varchar("ifsc_code", { length: 20 }),
    settlementPeriod: settlementPeriodEnum("settlement_period").notNull().default("T_PLUS_1_DAILY"),
    description: text("description"),
    credentials: jsonb("credentials"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);
```

### 2.3 Payment Transactions (`db/schema/payments.ts`)
```ts
export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    bookingId: varchar("booking_id", { length: 36 }).notNull(),
    theatreId: varchar("theatre_id", { length: 36 }).notNull(),
    paymentConfigId: varchar("payment_config_id", { length: 36 }).references(() => paymentConfigurations.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("UPI"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    transactionReference: varchar("transaction_reference", { length: 120 }).notNull().unique(),
    gatewayRef: varchar("gateway_ref", { length: 120 }),
    theatreShare: decimal("theatre_share", { precision: 10, scale: 2 }),
    platformFeeShare: decimal("platform_fee_share", { precision: 10, scale: 2 }),
    taxBreakup: jsonb("tax_breakup"),
    paidAt: timestamp("paid_at"),
  }
);
```

---

## 3. Server Actions & Engine API

| Server Action | Description |
|---|---|
| `validateUpiAction(upiId)` | Validates UPI VPA syntax against NPCI rules |
| `deriveUpiQrAction(params)` | Generates dynamic NPCI URI and QR endpoint URL |
| `createPaymentConfigurationAction(input)` | Registers new payment rail for theatre |
| `updatePaymentConfigurationAction(id, input)` | Modifies rail, increments config version |
| `deletePaymentConfigurationAction(id, theatreId)` | Removes rail with cross-tenant check |
| `activatePaymentConfigurationAction(id)` | Sets status to `ACTIVE` |
| `deactivatePaymentConfigurationAction(id)` | Sets status to `INACTIVE` |
| `setPrimaryPaymentConfigurationAction(id, theatreId)` | Designates as primary checkout rail |
| `getTheatrePaymentConfigurationsAction(theatreId, role)` | Returns rails with role sanitization |
| `prepareBookingPaymentSessionAction(params)` | Generates dynamic checkout session DTO |
| `getPaymentAuditLogsAction(theatreId, role)` | Returns immutable state change history |

---

## 4. Test & Verification Suite

The verification suite in `scripts/verify-payment-config.ts` validates all 9 enterprise requirements:
* **Point 1**: 1:N payment configurations per theatre.
* **Point 2**: Provider enum (`UPI`, `RAZORPAY`, `CASH_COUNTER`) and status lifecycle.
* **Point 3**: Primary designation and auto-demotion of previous primary.
* **Point 4**: NPCI URI payload derivation (`upi://pay?pa=...&mc=7832&am=...`).
* **Point 5**: UPI VPA format validation (valid vs invalid regex test cases).
* **Point 6**: Cross-tenant isolation violation prevention.
* **Point 7**: Dynamic Booking Payment Session generation with 10-minute expiry.
* **Point 8**: Role-based sanitization of private credentials under `CUSTOMER` role.
* **Point 9**: Configuration versioning (`v1 -> v2`) and audit logging.

**Verification Result**: 9/9 Checks Passed (0 Failures).
