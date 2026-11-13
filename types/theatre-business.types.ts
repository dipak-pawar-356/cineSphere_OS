/**
 * ==============================================================================
 * CineSphere OS — Theatre Business Information Management Types (Phase 3 – Part 7)
 * ==============================================================================
 * Comprehensive TypeScript contracts for the Theatre Business Profile:
 * Legal identity, corporate registrations (GST/PAN/CIN), ownership structure,
 * country-aware tax configuration, invoice sequence/layout preferences,
 * compliance verification workflows, document attachments, and versioning.
 * ==============================================================================
 */

import { VersionedEntity } from "./security-hardening.types";

// ------------------------------------------------------------------------------
// Domain Enums & Literals
// ------------------------------------------------------------------------------

export type BusinessCategory =
  | "MULTIPLEX"
  | "SINGLE_SCREEN"
  | "ENTERTAINMENT_COMPANY"
  | "CINEMA_CHAIN"
  | "PRIVATE_LIMITED"
  | "LLP"
  | "PARTNERSHIP"
  | "PROPRIETORSHIP"
  | "TRUST"
  | "GOVERNMENT"
  | "CUSTOM";

export type BusinessOwnershipType =
  | "DIRECT_OWNERSHIP"
  | "LEASE_OPERATED"
  | "FRANCHISE"
  | "JOINT_VENTURE"
  | "MANAGEMENT_CONTRACT";

export type BusinessComplianceStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "ARCHIVED";

export type TaxSystemType = "GST" | "VAT" | "SALES_TAX" | "CUSTOM";

export type PricingTaxModel = "TAX_INCLUSIVE" | "TAX_EXCLUSIVE";

export type TaxStatus = "ACTIVE" | "EXEMPT" | "SUSPENDED" | "PENDING_REVISION";

export type BusinessDocumentType =
  | "REGISTRATION_CERTIFICATE"
  | "GST_CERTIFICATE"
  | "PAN_CARD"
  | "AUTHORIZATION_LETTER"
  | "BOARD_RESOLUTION"
  | "CIN_INCORPORATION"
  | "MUNICIPAL_TRADE_LICENSE"
  | "FIRE_SAFETY_NOC"
  | "ENTERTAINMENT_TAX_PERMIT"
  | "OTHER";

export type BusinessDocumentVerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

// ------------------------------------------------------------------------------
// Relational Entity Records
// ------------------------------------------------------------------------------

export interface TheatreBusinessProfileRecord extends VersionedEntity {
  id: string;
  theatreId: string;
  legalBusinessName: string;
  registeredEntityName: string | null;
  businessCategory: BusinessCategory;
  customCategory: string | null;
  businessType: string;
  businessDescription: string | null;
  industry: string;
  status: BusinessComplianceStatus;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreBusinessRegistrationRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  gstNumber: string | null;
  panNumber: string | null;
  cinNumber: string | null;
  businessRegistrationNumber: string | null;
  registrationDate: string | null;
  registrationAuthority: string | null;
  certificateUrl: string | null;
  isGstVerified: boolean;
  isPanVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreBusinessOwnerRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  ownerName: string;
  ownershipType: BusinessOwnershipType;
  businessContactPhone: string | null;
  businessEmail: string | null;
  managingDirector: string | null;
  authorizedSignatory: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreTaxConfigurationRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  taxSystemType: TaxSystemType;
  taxJurisdictionCountry: string; // ISO 3166-1 alpha-3, e.g. "IND", "USA", "GBR"
  taxPercentage: string | null; // e.g. "18.00"
  pricingTaxModel: PricingTaxModel;
  isTaxExempt: boolean;
  exemptionReason: string | null;
  regionalTaxCode: string | null; // e.g. "MH-27"
  internationalTaxNumber: string | null;
  taxStatus: TaxStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreInvoiceConfigurationRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  invoicePrefix: string;
  invoiceSequenceNext: number;
  invoiceHeader: string;
  invoiceFooter: string | null;
  invoiceNotes: string | null;
  invoiceLogoUrl: string | null;
  enableEInvoice: boolean;
  enablePdfInvoice: boolean;
  enableCreditNotes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreBusinessComplianceRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  verificationStatus: BusinessComplianceStatus;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  verificationRemarks: string | null;
  riskScore: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreBusinessDocumentRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  documentType: BusinessDocumentType;
  documentTitle: string;
  documentNumber: string | null;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string;
  verificationStatus: BusinessDocumentVerificationStatus;
  expiryDate: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TheatreBusinessVersionRecord {
  id: string;
  businessProfileId: string;
  theatreId: string;
  versionNumber: number;
  changeType: string;
  changeSummary: string | null;
  snapshot: Record<string, unknown>;
  changedBy: string | null;
  changedRole: string | null;
  createdAt: Date;
}

// ------------------------------------------------------------------------------
// Aggregate & Detail Models
// ------------------------------------------------------------------------------

export interface TheatreBusinessBundle {
  profile: TheatreBusinessProfileRecord | null;
  registration: TheatreBusinessRegistrationRecord | null;
  owner: TheatreBusinessOwnerRecord | null;
  taxConfiguration: TheatreTaxConfigurationRecord | null;
  invoiceConfiguration: TheatreInvoiceConfigurationRecord | null;
  compliance: TheatreBusinessComplianceRecord | null;
  documents: TheatreBusinessDocumentRecord[];
  versions?: TheatreBusinessVersionRecord[];
}

export interface TheatreBusinessProfileWithDetails extends TheatreBusinessProfileRecord {
  registration: TheatreBusinessRegistrationRecord | null;
  owner: TheatreBusinessOwnerRecord | null;
  taxConfiguration: TheatreTaxConfigurationRecord | null;
  invoiceConfiguration: TheatreInvoiceConfigurationRecord | null;
  compliance: TheatreBusinessComplianceRecord | null;
  documents: TheatreBusinessDocumentRecord[];
  recentVersions?: TheatreBusinessVersionRecord[];
}

// ------------------------------------------------------------------------------
// Search & Filter Query Inputs
// ------------------------------------------------------------------------------

export interface SearchTheatreBusinessFilters {
  theatreId?: string;
  query?: string;
  category?: BusinessCategory;
  complianceStatus?: BusinessComplianceStatus;
  taxSystemType?: TaxSystemType;
  isTaxExempt?: boolean;
  registrationStatus?: "VERIFIED" | "PENDING" | "UNVERIFIED";
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}

// ------------------------------------------------------------------------------
// Input Payloads (Mutations)
// ------------------------------------------------------------------------------

export interface CreateTheatreBusinessProfileInput {
  theatreId: string;
  legalBusinessName: string;
  registeredEntityName?: string | null;
  businessCategory?: BusinessCategory;
  customCategory?: string | null;
  businessType?: string;
  businessDescription?: string | null;
  industry?: string;
  // Optional initial child components
  registration?: {
    gstNumber?: string | null;
    panNumber?: string | null;
    cinNumber?: string | null;
    businessRegistrationNumber?: string | null;
    registrationDate?: string | null;
    registrationAuthority?: string | null;
    certificateUrl?: string | null;
  };
  owner?: {
    ownerName: string;
    ownershipType?: BusinessOwnershipType;
    businessContactPhone?: string | null;
    businessEmail?: string | null;
    managingDirector?: string | null;
    authorizedSignatory?: string | null;
  };
  taxConfiguration?: {
    taxSystemType?: TaxSystemType;
    taxJurisdictionCountry?: string;
    taxPercentage?: string | null;
    pricingTaxModel?: PricingTaxModel;
    isTaxExempt?: boolean;
    exemptionReason?: string | null;
    regionalTaxCode?: string | null;
    internationalTaxNumber?: string | null;
    taxStatus?: TaxStatus;
    notes?: string | null;
  };
  invoiceConfiguration?: {
    invoicePrefix?: string;
    invoiceSequenceNext?: number;
    invoiceHeader?: string;
    invoiceFooter?: string | null;
    invoiceNotes?: string | null;
    invoiceLogoUrl?: string | null;
    enableEInvoice?: boolean;
    enablePdfInvoice?: boolean;
    enableCreditNotes?: boolean;
  };
}

export interface UpdateTheatreBusinessProfileInput {
  theatreId: string;
  expectedVersion?: number;
  legalBusinessName?: string;
  registeredEntityName?: string | null;
  businessCategory?: BusinessCategory;
  customCategory?: string | null;
  businessType?: string;
  businessDescription?: string | null;
  industry?: string;
  // Optional child updates
  registration?: {
    gstNumber?: string | null;
    panNumber?: string | null;
    cinNumber?: string | null;
    businessRegistrationNumber?: string | null;
    registrationDate?: string | null;
    registrationAuthority?: string | null;
    certificateUrl?: string | null;
    isGstVerified?: boolean;
    isPanVerified?: boolean;
  };
  owner?: {
    ownerName?: string;
    ownershipType?: BusinessOwnershipType;
    businessContactPhone?: string | null;
    businessEmail?: string | null;
    managingDirector?: string | null;
    authorizedSignatory?: string | null;
  };
}

export interface UpdateTheatreTaxConfigurationInput {
  theatreId: string;
  taxSystemType?: TaxSystemType;
  taxJurisdictionCountry?: string;
  taxPercentage?: string | null;
  pricingTaxModel?: PricingTaxModel;
  isTaxExempt?: boolean;
  exemptionReason?: string | null;
  regionalTaxCode?: string | null;
  internationalTaxNumber?: string | null;
  taxStatus?: TaxStatus;
  notes?: string | null;
}

export interface UpdateTheatreInvoiceConfigurationInput {
  theatreId: string;
  invoicePrefix?: string;
  invoiceSequenceNext?: number;
  invoiceHeader?: string;
  invoiceFooter?: string | null;
  invoiceNotes?: string | null;
  invoiceLogoUrl?: string | null;
  enableEInvoice?: boolean;
  enablePdfInvoice?: boolean;
  enableCreditNotes?: boolean;
}

export interface VerifyTheatreBusinessProfileInput {
  theatreId: string;
  verificationStatus: BusinessComplianceStatus;
  verificationRemarks?: string | null;
  riskScore?: string;
}

export interface ArchiveTheatreBusinessProfileInput {
  theatreId: string;
  reason?: string;
}

export interface AddTheatreBusinessDocumentInput {
  theatreId: string;
  documentType: BusinessDocumentType;
  documentTitle: string;
  documentNumber?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string;
  expiryDate?: string | null;
  displayOrder?: number;
}

export interface DeleteTheatreBusinessDocumentInput {
  theatreId: string;
  documentId: string;
}

// ------------------------------------------------------------------------------
// Summary DTO for Quick Views & Dashboards
// ------------------------------------------------------------------------------

export interface TheatreBusinessSummaryDTO {
  theatreId: string;
  legalBusinessName: string;
  businessCategory: BusinessCategory;
  gstNumber: string | null;
  panNumber: string | null;
  cinNumber: string | null;
  ownerName: string | null;
  taxSystemType: TaxSystemType;
  taxPercentage: string | null;
  pricingTaxModel: PricingTaxModel;
  complianceStatus: BusinessComplianceStatus;
  documentCount: number;
  updatedAt: Date;
}
