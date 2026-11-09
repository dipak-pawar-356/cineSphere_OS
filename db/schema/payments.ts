import {
  pgTable,
  varchar,
  text,
  boolean,
  decimal,
  timestamp,
  jsonb,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  paymentProviderEnum,
  paymentProviderStatusEnum,
  paymentStatusEnum,
  paymentMethodEnum,
  settlementPeriodEnum,
} from "./enums";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS - Multi-Tenant Payment Configurations & Ledger Schema
 * Payment rails strictly belong to the hosting Theatre, NEVER to Platform
 * Separates Payment Configurations from Payment Transactions
 * ==============================================================================
 */

export const paymentConfigurations = pgTable(
  "payment_configurations",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    businessName: varchar("business_name", { length: 150 }).notNull(),
    merchantName: varchar("merchant_name", { length: 150 }).notNull(),
    merchantDisplayName: varchar("merchant_display_name", { length: 150 }),
    provider: paymentProviderEnum("provider").notNull().default("UPI"),
    upiId: varchar("upi_id", { length: 100 }).notNull(),
    merchantCode: varchar("merchant_code", { length: 20 }).notNull().default("7832"), // MCC 7832: Motion Picture Theatres
    configVersion: integer("config_version").notNull().default(1),
    qrPlaceholder: text("qr_placeholder").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: paymentProviderStatusEnum("status").notNull().default("ACTIVE"),
    bankName: varchar("bank_name", { length: 100 }).notNull().default("HDFC Bank"),
    accountNumberMasked: varchar("account_number_masked", { length: 50 }),
    ifscCode: varchar("ifsc_code", { length: 20 }),
    settlementPeriod: settlementPeriodEnum("settlement_period")
      .notNull()
      .default("T_PLUS_1_DAILY"),
    description: text("description"),
    credentials: jsonb("credentials").$type<Record<string, unknown>>().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    
    // Future Gateway Rail Credentials (Encrypted/Masked)
    razorpayKeyId: varchar("razorpay_key_id", { length: 120 }),
    razorpaySecretEncrypted: text("razorpay_secret_encrypted"),
    phonepeMerchantId: varchar("phonepe_merchant_id", { length: 120 }),
    phonepeSaltKeyEncrypted: text("phonepe_salt_key_encrypted"),
    paytmMid: varchar("paytm_mid", { length: 120 }),
    paytmKeyEncrypted: text("paytm_key_encrypted"),
    stripePublishableKey: varchar("stripe_publishable_key", { length: 150 }),
    stripeSecretKeyEncrypted: text("stripe_secret_key_encrypted"),

    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payment_configurations_theatre_id_idx").on(table.theatreId),
    index("payment_configurations_provider_idx").on(table.provider),
    index("payment_configurations_status_idx").on(table.status),
    index("payment_configurations_upi_id_idx").on(table.upiId),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookingId: varchar("booking_id", { length: 36 }).notNull(), // Cross-domain reference to bookings.id
    theatreId: varchar("theatre_id", { length: 36 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    paymentConfigId: varchar("payment_config_id", { length: 36 })
      .references(() => paymentConfigurations.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("UPI"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    transactionReference: varchar("transaction_reference", { length: 120 }).notNull().unique(),
    gatewayRef: varchar("gateway_ref", { length: 120 }),
    gatewayData: jsonb("gateway_data").$type<Record<string, unknown>>().default({}),
    theatreShare: decimal("theatre_share", { precision: 10, scale: 2 }),
    platformFeeShare: decimal("platform_fee_share", { precision: 10, scale: 2 }),
    taxBreakup: jsonb("tax_breakup").$type<{
      cgst: number;
      sgst: number;
      igst: number;
    }>(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("payments_tx_ref_idx").on(table.transactionReference),
    index("payments_booking_id_idx").on(table.bookingId),
    index("payments_theatre_id_idx").on(table.theatreId),
    index("payments_status_idx").on(table.status),
    index("payments_created_at_idx").on(table.createdAt),
  ]
);

