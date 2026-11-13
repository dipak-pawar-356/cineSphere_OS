import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Validation Schemas (Phase 3 – Part 7)
 * ==============================================================================
 * Strict Zod validation schemas for theatre business profile management:
 * Legal information, registration credentials (GST, PAN, CIN), tax configuration,
 * invoice settings, compliance verification workflows, and document vault.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------------------

export const BusinessCategoryEnum = z.enum([
  "MULTIPLEX",
  "SINGLE_SCREEN",
  "ENTERTAINMENT_COMPANY",
  "CINEMA_CHAIN",
  "PRIVATE_LIMITED",
  "LLP",
  "PARTNERSHIP",
  "PROPRIETORSHIP",
  "TRUST",
  "GOVERNMENT",
  "CUSTOM",
]);

export const BusinessOwnershipTypeEnum = z.enum([
  "DIRECT_OWNERSHIP",
  "LEASE_OPERATED",
  "FRANCHISE",
  "JOINT_VENTURE",
  "MANAGEMENT_CONTRACT",
]);

export const BusinessComplianceStatusEnum = z.enum([
  "DRAFT",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "ARCHIVED",
]);

export const TaxSystemTypeEnum = z.enum([
  "GST",
  "VAT",
  "SALES_TAX",
  "CUSTOM",
]);

export const PricingTaxModelEnum = z.enum([
  "TAX_INCLUSIVE",
  "TAX_EXCLUSIVE",
]);

export const TaxStatusEnum = z.enum([
  "ACTIVE",
  "EXEMPT",
  "SUSPENDED",
  "PENDING_REVISION",
]);

export const BusinessDocumentTypeEnum = z.enum([
  "REGISTRATION_CERTIFICATE",
  "GST_CERTIFICATE",
  "PAN_CARD",
  "AUTHORIZATION_LETTER",
  "BOARD_RESOLUTION",
  "CIN_INCORPORATION",
  "MUNICIPAL_TRADE_LICENSE",
  "FIRE_SAFETY_NOC",
  "ENTERTAINMENT_TAX_PERMIT",
  "OTHER",
]);

export const BusinessDocumentVerificationStatusEnum = z.enum([
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

// ------------------------------------------------------------------------------
// Regex & Format Validators
// ------------------------------------------------------------------------------

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const CIN_REGEX = /^([LUu])[0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
export const INVOICE_PREFIX_REGEX = /^[A-Za-z0-9\-_]{2,10}$/;
export const PHONE_REGEX = /^\+?[0-9\s\-().]{7,25}$/;

const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith("https://") || val.startsWith("http://") || val.startsWith("/"),
    { message: "Must be a valid HTTP/HTTPS URL or root-relative path" }
  );

// ------------------------------------------------------------------------------
// Child Schemas
// ------------------------------------------------------------------------------

export const BusinessRegistrationInputSchema = z.object({
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => !val || GSTIN_REGEX.test(val), {
      message: "Invalid GSTIN format. Expected 15 characters (e.g., 27AABCU9603R1ZM)",
    })
    .nullable()
    .optional(),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => !val || PAN_REGEX.test(val), {
      message: "Invalid PAN format. Expected 10 characters (e.g., AABCU9603R)",
    })
    .nullable()
    .optional(),
  cinNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => !val || CIN_REGEX.test(val), {
      message: "Invalid Corporate Identification Number (CIN) format (e.g., U92100MH2021PTC358912)",
    })
    .nullable()
    .optional(),
  businessRegistrationNumber: z.string().trim().max(100).nullable().optional(),
  registrationDate: z.string().trim().max(30).nullable().optional(),
  registrationAuthority: z.string().trim().max(255).nullable().optional(),
  certificateUrl: safeUrlSchema.nullable().optional(),
  isGstVerified: z.boolean().optional(),
  isPanVerified: z.boolean().optional(),
});

export const BusinessOwnerInputSchema = z.object({
  ownerName: z
    .string()
    .trim()
    .min(2, "Owner/entity principal name must be at least 2 characters")
    .max(255, "Owner name cannot exceed 255 characters"),
  ownershipType: BusinessOwnershipTypeEnum.default("DIRECT_OWNERSHIP"),
  businessContactPhone: z
    .string()
    .trim()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: "Invalid contact phone number format",
    })
    .nullable()
    .optional(),
  businessEmail: z
    .string()
    .trim()
    .email("Invalid business email address")
    .max(255)
    .nullable()
    .optional()
    .or(z.literal("")),
  managingDirector: z.string().trim().max(255).nullable().optional(),
  authorizedSignatory: z.string().trim().max(255).nullable().optional(),
});

export const TaxConfigurationInputSchema = z.object({
  taxSystemType: TaxSystemTypeEnum.default("GST"),
  taxJurisdictionCountry: z
    .string()
    .trim()
    .min(2)
    .max(3)
    .toUpperCase()
    .default("IND"),
  taxPercentage: z
    .string()
    .trim()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), {
      message: "Tax percentage must be between 0.00 and 100.00",
    })
    .nullable()
    .optional(),
  pricingTaxModel: PricingTaxModelEnum.default("TAX_INCLUSIVE"),
  isTaxExempt: z.boolean().default(false),
  exemptionReason: z.string().trim().max(500).nullable().optional(),
  regionalTaxCode: z.string().trim().max(50).nullable().optional(),
  internationalTaxNumber: z.string().trim().max(100).nullable().optional(),
  taxStatus: TaxStatusEnum.default("ACTIVE"),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const InvoiceConfigurationInputSchema = z.object({
  invoicePrefix: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(INVOICE_PREFIX_REGEX, "Invoice prefix must be 2-10 alphanumeric or dash characters (e.g. 'CSP-')")
    .default("CSP-"),
  invoiceSequenceNext: z.number().int().min(1).default(10001),
  invoiceHeader: z.string().trim().min(3).max(255).default("Tax Invoice / Entertainment Receipt"),
  invoiceFooter: z.string().trim().max(1000).nullable().optional(),
  invoiceNotes: z.string().trim().max(1000).nullable().optional(),
  invoiceLogoUrl: safeUrlSchema.nullable().optional(),
  enableEInvoice: z.boolean().default(false),
  enablePdfInvoice: z.boolean().default(true),
  enableCreditNotes: z.boolean().default(false),
});

// ------------------------------------------------------------------------------
// Mutation Request Schemas
// ------------------------------------------------------------------------------

export const CreateTheatreBusinessProfileSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  legalBusinessName: z
    .string()
    .trim()
    .min(2, "Legal business name must be at least 2 characters")
    .max(255, "Legal business name cannot exceed 255 characters"),
  registeredEntityName: z.string().trim().max(255).nullable().optional(),
  businessCategory: BusinessCategoryEnum.default("PRIVATE_LIMITED"),
  customCategory: z.string().trim().max(100).nullable().optional(),
  businessType: z.string().trim().max(100).default("CINEMA_EXHIBITION"),
  businessDescription: z.string().trim().max(2000).nullable().optional(),
  industry: z.string().trim().max(100).default("Media & Entertainment / Cinema Exhibition"),
  registration: BusinessRegistrationInputSchema.optional(),
  owner: BusinessOwnerInputSchema.optional(),
  taxConfiguration: TaxConfigurationInputSchema.optional(),
  invoiceConfiguration: InvoiceConfigurationInputSchema.optional(),
});

export const UpdateTheatreBusinessProfileSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  expectedVersion: z.number().int().min(1).optional(),
  legalBusinessName: z
    .string()
    .trim()
    .min(2, "Legal business name must be at least 2 characters")
    .max(255, "Legal business name cannot exceed 255 characters")
    .optional(),
  registeredEntityName: z.string().trim().max(255).nullable().optional(),
  businessCategory: BusinessCategoryEnum.optional(),
  customCategory: z.string().trim().max(100).nullable().optional(),
  businessType: z.string().trim().max(100).optional(),
  businessDescription: z.string().trim().max(2000).nullable().optional(),
  industry: z.string().trim().max(100).optional(),
  registration: BusinessRegistrationInputSchema.optional(),
  owner: BusinessOwnerInputSchema.partial().optional(),
});

export const UpdateTheatreTaxConfigurationSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  taxSystemType: TaxSystemTypeEnum.optional(),
  taxJurisdictionCountry: z.string().trim().min(2).max(3).toUpperCase().optional(),
  taxPercentage: z
    .string()
    .trim()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), {
      message: "Tax percentage must be between 0.00 and 100.00",
    })
    .nullable()
    .optional(),
  pricingTaxModel: PricingTaxModelEnum.optional(),
  isTaxExempt: z.boolean().optional(),
  exemptionReason: z.string().trim().max(500).nullable().optional(),
  regionalTaxCode: z.string().trim().max(50).nullable().optional(),
  internationalTaxNumber: z.string().trim().max(100).nullable().optional(),
  taxStatus: TaxStatusEnum.optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
});

export const UpdateTheatreInvoiceConfigurationSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  invoicePrefix: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(INVOICE_PREFIX_REGEX, "Invoice prefix must be 2-10 alphanumeric or dash characters")
    .optional(),
  invoiceSequenceNext: z.number().int().min(1).optional(),
  invoiceHeader: z.string().trim().min(3).max(255).optional(),
  invoiceFooter: z.string().trim().max(1000).nullable().optional(),
  invoiceNotes: z.string().trim().max(1000).nullable().optional(),
  invoiceLogoUrl: safeUrlSchema.nullable().optional(),
  enableEInvoice: z.boolean().optional(),
  enablePdfInvoice: z.boolean().optional(),
  enableCreditNotes: z.boolean().optional(),
});

export const VerifyTheatreBusinessProfileSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  verificationStatus: BusinessComplianceStatusEnum,
  verificationRemarks: z.string().trim().max(1000).nullable().optional(),
  riskScore: z.string().trim().max(20).default("LOW"),
});

export const ArchiveTheatreBusinessProfileSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  reason: z.string().trim().max(500).optional(),
});

export const AddTheatreBusinessDocumentSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  documentType: BusinessDocumentTypeEnum,
  documentTitle: z.string().trim().min(2).max(255),
  documentNumber: z.string().trim().max(100).nullable().optional(),
  fileUrl: safeUrlSchema,
  fileSize: z.number().int().positive().nullable().optional(),
  mimeType: z.string().trim().max(100).default("application/pdf"),
  expiryDate: z.string().trim().max(30).nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

export const DeleteTheatreBusinessDocumentSchema = z.object({
  theatreId: z.string().trim().min(1, "theatreId is required"),
  documentId: z.string().trim().min(1, "documentId is required"),
});

export const SearchTheatreBusinessFiltersSchema = z.object({
  theatreId: z.string().trim().optional(),
  query: z.string().trim().optional(),
  category: BusinessCategoryEnum.optional(),
  complianceStatus: BusinessComplianceStatusEnum.optional(),
  taxSystemType: TaxSystemTypeEnum.optional(),
  isTaxExempt: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});
