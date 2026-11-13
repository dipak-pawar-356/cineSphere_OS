import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { theatres } from "./theatres";
import {
  businessCategoryEnum,
  businessOwnershipTypeEnum,
  businessComplianceStatusEnum,
  taxSystemTypeEnum,
  pricingTaxModelEnum,
  taxStatusEnum,
  businessDocumentTypeEnum,
  businessDocumentVerificationStatusEnum,
} from "./enums";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Information Management Schema (Phase 3 – Part 7)
 * ==============================================================================
 * Centralized, multi-tenant enterprise business profile storing legal identity,
 * registration details (GST, PAN, CIN), tax configuration, invoice preferences,
 * compliance verification workflows, document attachments, and audit versions.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. THEATRE BUSINESS PROFILES (Primary Business Identity)
// ------------------------------------------------------------------------------
export const theatreBusinessProfiles = pgTable(
  "theatre_business_profiles",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    legalBusinessName: varchar("legal_business_name", { length: 255 }).notNull(),
    registeredEntityName: varchar("registered_entity_name", { length: 255 }),
    businessCategory: businessCategoryEnum("business_category")
      .notNull()
      .default("PRIVATE_LIMITED"),
    customCategory: varchar("custom_category", { length: 100 }),
    businessType: varchar("business_type", { length: 100 })
      .notNull()
      .default("CINEMA_EXHIBITION"),
    businessDescription: text("business_description"),
    industry: varchar("industry", { length: 100 })
      .notNull()
      .default("Media & Entertainment / Cinema Exhibition"),
    status: businessComplianceStatusEnum("status").notNull().default("DRAFT"),
    version: integer("version").notNull().default(1),
    createdBy: varchar("created_by", { length: 40 }),
    updatedBy: varchar("updated_by", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_business_profiles_theatre_id_unique").on(table.theatreId),
    index("theatre_business_profiles_legal_name_idx").on(table.legalBusinessName),
    index("theatre_business_profiles_category_idx").on(table.businessCategory),
    index("theatre_business_profiles_status_idx").on(table.status),
  ]
);

// ------------------------------------------------------------------------------
// 2. THEATRE BUSINESS REGISTRATIONS (GST, PAN, CIN, Trade Registration)
// ------------------------------------------------------------------------------
export const theatreBusinessRegistrations = pgTable(
  "theatre_business_registrations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    gstNumber: varchar("gst_number", { length: 20 }),
    panNumber: varchar("pan_number", { length: 20 }),
    cinNumber: varchar("cin_number", { length: 30 }),
    businessRegistrationNumber: varchar("business_registration_number", { length: 100 }),
    registrationDate: varchar("registration_date", { length: 30 }),
    registrationAuthority: varchar("registration_authority", { length: 255 }),
    certificateUrl: text("certificate_url"),
    isGstVerified: boolean("is_gst_verified").notNull().default(false),
    isPanVerified: boolean("is_pan_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_business_registrations_profile_id_unique").on(table.businessProfileId),
    index("theatre_business_registrations_theatre_id_idx").on(table.theatreId),
    index("theatre_business_registrations_gst_idx").on(table.gstNumber),
    index("theatre_business_registrations_pan_idx").on(table.panNumber),
    index("theatre_business_registrations_cin_idx").on(table.cinNumber),
  ]
);

// ------------------------------------------------------------------------------
// 3. THEATRE BUSINESS OWNERS (Principal Owners & Managing Authority)
// ------------------------------------------------------------------------------
export const theatreBusinessOwners = pgTable(
  "theatre_business_owners",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    ownerName: varchar("owner_name", { length: 255 }).notNull(),
    ownershipType: businessOwnershipTypeEnum("ownership_type")
      .notNull()
      .default("DIRECT_OWNERSHIP"),
    businessContactPhone: varchar("business_contact_phone", { length: 50 }),
    businessEmail: varchar("business_email", { length: 255 }),
    managingDirector: varchar("managing_director", { length: 255 }),
    authorizedSignatory: varchar("authorized_signatory", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_business_owners_profile_id_unique").on(table.businessProfileId),
    index("theatre_business_owners_theatre_id_idx").on(table.theatreId),
    index("theatre_business_owners_name_idx").on(table.ownerName),
  ]
);

// ------------------------------------------------------------------------------
// 4. THEATRE TAX CONFIGURATIONS (Country-Aware Compliance: GST, VAT, Sales Tax)
// ------------------------------------------------------------------------------
export const theatreTaxConfigurations = pgTable(
  "theatre_tax_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    taxSystemType: taxSystemTypeEnum("tax_system_type").notNull().default("GST"),
    taxJurisdictionCountry: varchar("tax_jurisdiction_country", { length: 3 })
      .notNull()
      .default("IND"),
    taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("18.00"),
    pricingTaxModel: pricingTaxModelEnum("pricing_tax_model")
      .notNull()
      .default("TAX_INCLUSIVE"),
    isTaxExempt: boolean("is_tax_exempt").notNull().default(false),
    exemptionReason: text("exemption_reason"),
    regionalTaxCode: varchar("regional_tax_code", { length: 50 }).default("MH-27"),
    internationalTaxNumber: varchar("international_tax_number", { length: 100 }),
    taxStatus: taxStatusEnum("tax_status").notNull().default("ACTIVE"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_tax_configurations_profile_id_unique").on(table.businessProfileId),
    index("theatre_tax_configurations_theatre_id_idx").on(table.theatreId),
    index("theatre_tax_configurations_tax_status_idx").on(table.taxStatus),
  ]
);

// ------------------------------------------------------------------------------
// 5. THEATRE INVOICE CONFIGURATIONS (Billing Sequence, Prefixes & Headers)
// ------------------------------------------------------------------------------
export const theatreInvoiceConfigurations = pgTable(
  "theatre_invoice_configurations",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    invoicePrefix: varchar("invoice_prefix", { length: 20 }).notNull().default("CSP-"),
    invoiceSequenceNext: integer("invoice_sequence_next").notNull().default(10001),
    invoiceHeader: varchar("invoice_header", { length: 255 })
      .notNull()
      .default("Tax Invoice / Entertainment Receipt"),
    invoiceFooter: text("invoice_footer").default(
      "Thank you for choosing CineSphere. Subject to municipal and entertainment tax jurisdiction."
    ),
    invoiceNotes: text("invoice_notes"),
    invoiceLogoUrl: text("invoice_logo_url"),
    enableEInvoice: boolean("enable_e_invoice").notNull().default(false),
    enablePdfInvoice: boolean("enable_pdf_invoice").notNull().default(true),
    enableCreditNotes: boolean("enable_credit_notes").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_invoice_configurations_profile_id_unique").on(table.businessProfileId),
    index("theatre_invoice_configurations_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// 6. THEATRE BUSINESS COMPLIANCES (Verification Lifecycle & Remarks)
// ------------------------------------------------------------------------------
export const theatreBusinessCompliances = pgTable(
  "theatre_business_compliances",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    verificationStatus: businessComplianceStatusEnum("verification_status")
      .notNull()
      .default("DRAFT"),
    verifiedBy: varchar("verified_by", { length: 40 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verificationRemarks: text("verification_remarks"),
    riskScore: varchar("risk_score", { length: 20 }).notNull().default("LOW"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("theatre_business_compliances_profile_id_unique").on(table.businessProfileId),
    index("theatre_business_compliances_theatre_id_idx").on(table.theatreId),
    index("theatre_business_compliances_status_idx").on(table.verificationStatus),
  ]
);

// ------------------------------------------------------------------------------
// 7. THEATRE BUSINESS DOCUMENTS (Decoupled Document Attachments & Vault)
// ------------------------------------------------------------------------------
export const theatreBusinessDocuments = pgTable(
  "theatre_business_documents",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 })
      .notNull()
      .references(() => theatreBusinessProfiles.id, { onDelete: "cascade" }),
    theatreId: varchar("theatre_id", { length: 40 })
      .notNull()
      .references(() => theatres.id, { onDelete: "cascade" }),
    documentType: businessDocumentTypeEnum("document_type").notNull(),
    documentTitle: varchar("document_title", { length: 255 }).notNull(),
    documentNumber: varchar("document_number", { length: 100 }),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 100 }).notNull().default("application/pdf"),
    verificationStatus: businessDocumentVerificationStatusEnum("verification_status")
      .notNull()
      .default("PENDING"),
    expiryDate: varchar("expiry_date", { length: 30 }),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_business_documents_profile_id_idx").on(table.businessProfileId),
    index("theatre_business_documents_theatre_id_idx").on(table.theatreId),
    index("theatre_business_documents_type_idx").on(table.documentType),
  ]
);

// ------------------------------------------------------------------------------
// 8. THEATRE BUSINESS VERSIONS (Immutable Audit Ledger Snapshots)
// ------------------------------------------------------------------------------
export const theatreBusinessVersions = pgTable(
  "theatre_business_versions",
  {
    id: varchar("id", { length: 40 }).primaryKey(),
    businessProfileId: varchar("business_profile_id", { length: 40 }),
    theatreId: varchar("theatre_id", { length: 40 }),
    versionNumber: integer("version_number").notNull(),
    changeType: varchar("change_type", { length: 50 }).notNull(),
    changeSummary: text("change_summary"),
    snapshot: jsonb("snapshot").notNull(),
    changedBy: varchar("changed_by", { length: 40 }),
    changedRole: varchar("changed_role", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("theatre_business_versions_profile_id_idx").on(table.businessProfileId),
    index("theatre_business_versions_theatre_id_idx").on(table.theatreId),
  ]
);

// ------------------------------------------------------------------------------
// Semantic Aliases
// ------------------------------------------------------------------------------
export const TheatreBusinessProfile = theatreBusinessProfiles;
export const BusinessRegistration = theatreBusinessRegistrations;
export const BusinessOwner = theatreBusinessOwners;
export const TaxConfiguration = theatreTaxConfigurations;
export const InvoiceConfiguration = theatreInvoiceConfigurations;
export const BusinessCompliance = theatreBusinessCompliances;
export const BusinessDocument = theatreBusinessDocuments;
export const BusinessVersion = theatreBusinessVersions;
