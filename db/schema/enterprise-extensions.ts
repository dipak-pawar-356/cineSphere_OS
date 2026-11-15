import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extension Framework Schema (Phase 3 – Part 16)
 * ==============================================================================
 * Placeholder persistence schema for multi-branch organizations, franchise contracts,
 * corporate accounts, customer memberships, loyalty ledgers, dynamic pricing rules,
 * IoT/kiosk device registries, 4-tier hierarchical feature flags, and API clients.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. ORGANIZATIONS (Multi-Branch Chains & Corporate Headquarters)
// ------------------------------------------------------------------------------
export const enterpriseOrganizations = pgTable(
  "enterprise_organizations",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    brandName: varchar("brand_name", { length: 255 }).notNull(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    tier: varchar("tier", { length: 64 }).notNull().default("STANDARD_CHAIN"),
    corporateHqAddress: jsonb("corporate_hq_address").notNull(),
    primaryContact: jsonb("primary_contact").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_orgs_code").on(table.code),
    index("idx_ent_orgs_status").on(table.status),
  ]
);

// ------------------------------------------------------------------------------
// 2. BRANCHES (Linking Organizations to CineSphere Theatres)
// ------------------------------------------------------------------------------
export const enterpriseBranches = pgTable(
  "enterprise_branches",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 128 })
      .notNull()
      .references(() => enterpriseOrganizations.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 128 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    branchCode: varchar("branch_code", { length: 64 }).notNull(),
    branchName: varchar("branch_name", { length: 255 }).notNull(),
    regionalOfficeId: varchar("regional_office_id", { length: 128 }),
    branchGroupId: varchar("branch_group_id", { length: 128 }),
    sharedBrandingEnabled: boolean("shared_branding_enabled").notNull().default(true),
    sharedConfigurationEnabled: boolean("shared_configuration_enabled").notNull().default(true),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_ent_branch_theatre").on(table.theatreId),
    index("idx_ent_branch_org").on(table.organizationId),
  ]
);

// ------------------------------------------------------------------------------
// 3. FRANCHISE AGREEMENTS & CORPORATE ACCOUNTS
// ------------------------------------------------------------------------------
export const enterpriseFranchiseAgreements = pgTable(
  "enterprise_franchise_agreements",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 128 }).notNull(),
    franchiseOwnerName: varchar("franchise_owner_name", { length: 255 }).notNull(),
    theatreId: varchar("theatre_id", { length: 128 }).notNull(),
    agreementNumber: varchar("agreement_number", { length: 128 }).notNull().unique(),
    revenueSharingPercent: numeric("revenue_sharing_percent", { precision: 5, scale: 2 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    complianceStatus: varchar("compliance_status", { length: 32 }).notNull().default("COMPLIANT"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_franchise_theatre").on(table.theatreId),
    index("idx_ent_franchise_org").on(table.organizationId),
  ]
);

export const enterpriseCorporateAccounts = pgTable(
  "enterprise_corporate_accounts",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 128 }),
    theatreId: varchar("theatre_id", { length: 128 }),
    corporateName: varchar("corporate_name", { length: 255 }).notNull(),
    contractNumber: varchar("contract_number", { length: 128 }).notNull().unique(),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).notNull(),
    currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).notNull().default("0"),
    billingCycle: varchar("billing_cycle", { length: 32 }).notNull().default("MONTHLY"),
    discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull().default("10"),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_corp_name").on(table.corporateName),
  ]
);

// ------------------------------------------------------------------------------
// 4. CUSTOMER EXPERIENCE (Membership Plans, Gift Cards, Loyalty)
// ------------------------------------------------------------------------------
export const enterpriseMembershipPlans = pgTable(
  "enterprise_membership_plans",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    planCode: varchar("plan_code", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    tierLevel: varchar("tier_level", { length: 32 }).notNull(),
    theatreId: varchar("theatre_id", { length: 128 }),
    organizationId: varchar("organization_id", { length: 128 }),
    priceAmount: integer("price_amount").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("INR"),
    billingPeriodMonths: integer("billing_period_months").notNull().default(12),
    benefits: jsonb("benefits").notNull(),
    expiryRules: jsonb("expiry_rules").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_membership_tier").on(table.tierLevel),
  ]
);

export const enterpriseGiftCards = pgTable(
  "enterprise_gift_cards",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    cardCodeMasked: varchar("card_code_masked", { length: 64 }).notNull(),
    cardType: varchar("card_type", { length: 32 }).notNull().default("DIGITAL"),
    theatreId: varchar("theatre_id", { length: 128 }),
    organizationId: varchar("organization_id", { length: 128 }),
    initialAmount: integer("initial_amount").notNull(),
    currentBalance: integer("current_balance").notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("INR"),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  },
  (table) => [
    index("idx_ent_giftcard_status").on(table.status),
  ]
);

export const enterpriseLoyaltyPrograms = pgTable(
  "enterprise_loyalty_programs",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    programName: varchar("program_name", { length: 255 }).notNull(),
    theatreId: varchar("theatre_id", { length: 128 }),
    organizationId: varchar("organization_id", { length: 128 }),
    pointsEarnRate: integer("points_earn_rate").notNull().default(1),
    pointsToCurrencyRatio: numeric("points_to_currency_ratio", { precision: 5, scale: 2 }).notNull().default("0.10"),
    tiers: jsonb("tiers").notNull(),
    pointExpiryMonths: integer("point_expiry_months").notNull().default(12),
    status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// ------------------------------------------------------------------------------
// 5. PRICING PLATFORM (Dynamic Pricing Rules)
// ------------------------------------------------------------------------------
export const enterprisePricingRules = pgTable(
  "enterprise_pricing_rules",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    ruleCode: varchar("rule_code", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    ruleType: varchar("rule_type", { length: 64 }).notNull(),
    theatreId: varchar("theatre_id", { length: 128 }),
    organizationId: varchar("organization_id", { length: 128 }),
    priority: integer("priority").notNull().default(50),
    priceMultiplier: numeric("price_multiplier", { precision: 4, scale: 2 }).notNull().default("1.00"),
    conditions: jsonb("conditions").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_pricing_type").on(table.ruleType),
    index("idx_ent_pricing_priority").on(table.priority),
  ]
);

// ------------------------------------------------------------------------------
// 6. DEVICE PLATFORM (Hardware Registry: IoT, Digital Signage, Smart Kiosks)
// ------------------------------------------------------------------------------
export const enterpriseDevices = pgTable(
  "enterprise_devices",
  {
    deviceId: varchar("device_id", { length: 128 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 128 }).notNull(),
    hallId: varchar("hall_id", { length: 128 }),
    deviceType: varchar("device_type", { length: 64 }).notNull(),
    model: varchar("model", { length: 128 }).notNull(),
    ipAddress: varchar("ip_address", { length: 64 }),
    macAddress: varchar("mac_address", { length: 64 }),
    status: varchar("status", { length: 32 }).notNull().default("ONLINE"),
    lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }).defaultNow().notNull(),
    firmwareVersion: varchar("firmware_version", { length: 64 }).notNull().default("1.0.0"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
  },
  (table) => [
    index("idx_ent_devices_theatre").on(table.theatreId),
    index("idx_ent_devices_type").on(table.deviceType),
  ]
);

// ------------------------------------------------------------------------------
// 7. 4-TIER HIERARCHICAL FEATURE FLAGS
// ------------------------------------------------------------------------------
export const enterpriseFeatureFlags = pgTable(
  "enterprise_feature_flags",
  {
    flagKey: varchar("flag_key", { length: 128 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    valueType: varchar("value_type", { length: 32 }).notNull().default("BOOLEAN"),
    defaultValue: jsonb("default_value").notNull(),
    platformEnabled: boolean("platform_enabled").notNull().default(true),
    organizationOverrides: jsonb("organization_overrides").notNull().default({}),
    theatreOverrides: jsonb("theatre_overrides").notNull().default({}),
    userOverrides: jsonb("user_overrides").notNull().default({}),
    rolloutPercentage: integer("rollout_percentage").notNull().default(100),
    moduleId: varchar("module_id", { length: 64 }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_ent_flags_mod").on(table.moduleId),
  ]
);

// ------------------------------------------------------------------------------
// 8. ENTERPRISE MODULES (Installed Extension Registry)
// ------------------------------------------------------------------------------
export const enterpriseModules = pgTable(
  "enterprise_modules",
  {
    moduleId: varchar("module_id", { length: 64 }).primaryKey(),
    platformKey: varchar("platform_key", { length: 64 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("INSTALLED"),
    installedAt: timestamp("installed_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    configuration: jsonb("configuration").$type<Record<string, unknown>>().default({}),
  }
);

// ------------------------------------------------------------------------------
// 9. INTEGRATION PLATFORM (API Clients & Webhooks)
// ------------------------------------------------------------------------------
export const enterpriseApiClients = pgTable(
  "enterprise_api_clients",
  {
    clientId: varchar("client_id", { length: 128 }).primaryKey(),
    clientName: varchar("client_name", { length: 255 }).notNull(),
    organizationId: varchar("organization_id", { length: 128 }),
    theatreId: varchar("theatre_id", { length: 128 }),
    keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),
    hashedSecret: varchar("hashed_secret", { length: 255 }).notNull(),
    allowedScopes: jsonb("allowed_scopes").$type<string[]>().notNull(),
    rateLimitTier: varchar("rate_limit_tier", { length: 32 }).notNull().default("STANDARD"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  }
);

export const enterpriseWebhooks = pgTable(
  "enterprise_webhooks",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: varchar("organization_id", { length: 128 }),
    theatreId: varchar("theatre_id", { length: 128 }),
    targetUrl: text("target_url").notNull(),
    subscribedEvents: jsonb("subscribed_events").$type<string[]>().notNull(),
    secretSignatureKey: varchar("secret_signature_key", { length: 128 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
