/**
 * ==============================================================================
 * CineSphere OS — Theatre Contact Management Types (Phase 3 – Part 6)
 * ==============================================================================
 * Comprehensive TypeScript contracts for the Theatre Contact Directory:
 * Multi-channel directory, role-based contacts, availability modes, verification
 * placeholders, and generic entity mapping.
 * ==============================================================================
 */

import { VersionedEntity } from "./security-hardening.types";
import type { TheatreSocialPlatform } from "./theatre-profile.types";

// ------------------------------------------------------------------------------
// Enums & Domain Literals
// ------------------------------------------------------------------------------

export type ContactChannelType =
  | "PHONE"
  | "EMAIL"
  | "WEBSITE"
  | "SOCIAL_LINK"
  | "EMERGENCY"
  | "MANAGER"
  | "WHATSAPP"
  | "TELEGRAM"
  | "LIVE_CHAT"
  | "CALL_CENTER";

export type ContactRole =
  | "CUSTOMER_SUPPORT"
  | "GENERAL_ENQUIRY"
  | "EMERGENCY_DESK"
  | "DUTY_MANAGER"
  | "BUSINESS_DEVELOPMENT"
  | "CORPORATE_OFFICE"
  | "BOOKING_BOX_OFFICE"
  | "TECHNICAL_OPERATIONS"
  | "LOST_AND_FOUND";

export type ContactAvailabilityMode =
  | "STANDARD_BUSINESS_HOURS"
  | "TWENTY_FOUR_SEVEN"
  | "EMERGENCY_ONLY"
  | "SHOWTIME_ONLY"
  | "TEMPORARILY_INACTIVE";

export type ContactVerificationStatus =
  | "UNVERIFIED"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED";

export type ContactVisibility = "PUBLIC" | "HIDDEN" | "INTERNAL_ONLY";

export type ContactStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";

export type ContactEntityType =
  | "THEATRE"
  | "CHAIN"
  | "CORPORATE"
  | "VENDOR"
  | "SUPPORT_CENTER";

// TheatreSocialPlatform is imported from ./theatre-profile.types to ensure domain consistency

// ------------------------------------------------------------------------------
// Relational Entity Records
// ------------------------------------------------------------------------------

export interface TheatreContactRecord extends VersionedEntity {
  id: string;
  theatreId: string;
  channelType: ContactChannelType;
  contactRole: ContactRole;
  title: string;
  description: string | null;
  isPrimary: boolean;
  visibility: ContactVisibility;
  availabilityMode: ContactAvailabilityMode;
  businessHours: string | null;
  verificationStatus: ContactVerificationStatus;
  status: ContactStatus;
  displayOrder: number;
  entityType: ContactEntityType;
  entityId: string | null;
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatrePhoneRecord {
  id: string;
  contactId: string;
  theatreId: string;
  countryCode: string;
  phoneNumber: string;
  extension: string | null;
  phoneType: string;
  isPrimary: boolean;
  isSmsEnabled: boolean;
  isWhatsappEnabled: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreEmailRecord {
  id: string;
  contactId: string;
  theatreId: string;
  email: string;
  emailType: string;
  department: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreWebsiteRecord {
  id: string;
  contactId: string;
  theatreId: string;
  url: string;
  websiteType: string;
  title: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreContactSocialLinkRecord {
  id: string;
  contactId: string;
  theatreId: string;
  platform: TheatreSocialPlatform;
  customPlatform: string | null;
  url: string;
  handle: string | null;
  displayOrder: number;
  status: ContactStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreEmergencyContactRecord {
  id: string;
  contactId: string;
  theatreId: string;
  contactPersonName: string;
  roleOrDesignation: string;
  primaryPhone: string;
  alternatePhone: string | null;
  availabilityHours: string;
  emergencyType: string;
  operatingProcedures: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreManagerContactRecord {
  id: string;
  contactId: string;
  theatreId: string;
  managerName: string;
  designation: string;
  phone: string;
  email: string;
  department: string;
  shiftHours: string | null;
  escalationTier: number;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreContactVersionRecord {
  id: string;
  contactId: string | null;
  theatreId: string | null;
  versionNumber: number;
  changeType: string;
  changeSummary: string | null;
  snapshot: Record<string, unknown>;
  changedBy: string | null;
  changedRole: string | null;
  createdAt: string;
}

// ------------------------------------------------------------------------------
// Composite / Enriched DTOs
// ------------------------------------------------------------------------------

export interface TheatreContactWithDetails extends TheatreContactRecord {
  phone?: TheatrePhoneRecord | null;
  email?: TheatreEmailRecord | null;
  website?: TheatreWebsiteRecord | null;
  socialLink?: TheatreContactSocialLinkRecord | null;
  emergencyContact?: TheatreEmergencyContactRecord | null;
  managerContact?: TheatreManagerContactRecord | null;
}

export interface PublicTheatreContactDTO {
  id: string;
  theatreId: string;
  title: string;
  channelType: ContactChannelType;
  contactRole: ContactRole;
  isPrimary: boolean;
  availabilityMode: ContactAvailabilityMode;
  businessHours: string | null;
  isVerified: boolean;
  phone?: {
    countryCode: string;
    phoneNumber: string;
    extension?: string | null;
    formattedPhone: string;
    phoneType: string;
  } | null;
  email?: {
    email: string;
    emailType: string;
    department?: string | null;
  } | null;
  website?: {
    url: string;
    websiteType: string;
    title?: string | null;
  } | null;
  socialLink?: {
    platform: TheatreSocialPlatform;
    customPlatform?: string | null;
    url: string;
    handle?: string | null;
  } | null;
  emergencyContact?: {
    contactPersonName: string;
    roleOrDesignation: string;
    primaryPhone: string;
    alternatePhone?: string | null;
    availabilityHours: string;
  } | null;
  managerContact?: {
    managerName: string;
    designation: string;
    phone: string;
    email: string;
    department: string;
  } | null;
}

export interface PublicTheatreContactDirectoryBundle {
  theatreId: string;
  theatreName: string;
  primaryPhone: PublicTheatreContactDTO | null;
  supportEmail: PublicTheatreContactDTO | null;
  officialWebsite: PublicTheatreContactDTO | null;
  emergencyDesk: PublicTheatreContactDTO | null;
  dutyManager: PublicTheatreContactDTO | null;
  socialLinks: PublicTheatreContactDTO[];
  allPublicContacts: PublicTheatreContactDTO[];
}

export interface TheatreContactDirectoryBundle {
  theatreId: string;
  totalContacts: number;
  activeCount: number;
  verifiedCount: number;
  primaryPhone: TheatreContactWithDetails | null;
  primaryEmail: TheatreContactWithDetails | null;
  primaryWebsite: TheatreContactWithDetails | null;
  contacts: TheatreContactWithDetails[];
}

// ------------------------------------------------------------------------------
// Input Payloads & Action Contracts
// ------------------------------------------------------------------------------

export interface CreateTheatreContactInput {
  theatreId: string;
  channelType: ContactChannelType;
  contactRole: ContactRole;
  title: string;
  description?: string | null;
  isPrimary?: boolean;
  visibility?: ContactVisibility;
  availabilityMode?: ContactAvailabilityMode;
  businessHours?: string | null;
  displayOrder?: number;
  status?: ContactStatus;
  entityType?: ContactEntityType;
  entityId?: string | null;

  phone?: {
    countryCode?: string;
    phoneNumber: string;
    extension?: string | null;
    phoneType?: string;
    isSmsEnabled?: boolean;
    isWhatsappEnabled?: boolean;
  };
  email?: {
    email: string;
    emailType?: string;
    department?: string | null;
  };
  website?: {
    url: string;
    websiteType?: string;
    title?: string | null;
  };
  socialLink?: {
    platform: TheatreSocialPlatform;
    customPlatform?: string | null;
    url: string;
    handle?: string | null;
  };
  emergencyContact?: {
    contactPersonName: string;
    roleOrDesignation: string;
    primaryPhone: string;
    alternatePhone?: string | null;
    availabilityHours?: string;
    emergencyType?: string;
    operatingProcedures?: string | null;
  };
  managerContact?: {
    managerName: string;
    designation: string;
    phone: string;
    email: string;
    department?: string;
    shiftHours?: string | null;
    escalationTier?: number;
  };
}

export interface UpdateTheatreContactInput {
  contactId: string;
  theatreId: string;
  expectedVersion?: number;
  title?: string;
  description?: string | null;
  contactRole?: ContactRole;
  isPrimary?: boolean;
  visibility?: ContactVisibility;
  availabilityMode?: ContactAvailabilityMode;
  businessHours?: string | null;
  displayOrder?: number;
  status?: ContactStatus;
  verificationStatus?: ContactVerificationStatus;

  phone?: Partial<Omit<TheatrePhoneRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
  email?: Partial<Omit<TheatreEmailRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
  website?: Partial<Omit<TheatreWebsiteRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
  socialLink?: Partial<Omit<TheatreContactSocialLinkRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
  emergencyContact?: Partial<Omit<TheatreEmergencyContactRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
  managerContact?: Partial<Omit<TheatreManagerContactRecord, "id" | "contactId" | "theatreId" | "createdAt" | "updatedAt">>;
}

export interface UpdateTheatreWebsiteInput {
  theatreId: string;
  contactId?: string;
  url: string;
  title?: string;
  websiteType?: string;
  isPrimary?: boolean;
  visibility?: ContactVisibility;
}

export interface UpdateTheatreContactSocialLinksInput {
  theatreId: string;
  socialLinks: Array<{
    platform: TheatreSocialPlatform;
    customPlatform?: string | null;
    url: string;
    handle?: string | null;
    displayOrder?: number;
    status?: ContactStatus;
  }>;
}

export interface ReorderTheatreContactsInput {
  theatreId: string;
  orderedContactIds: string[];
}

export interface TheatreContactFilterParams {
  theatreId?: string;
  scopedTenantId?: string;
  channelType?: ContactChannelType;
  contactRole?: ContactRole;
  status?: ContactStatus;
  isPrimary?: boolean;
  isVerified?: boolean;
  visibility?: ContactVisibility;
  query?: string;
  page?: number;
  pageSize?: number;
}
