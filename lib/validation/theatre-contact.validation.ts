import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Contact Validation Schemas (Phase 3 – Part 6)
 * ==============================================================================
 * Strict Zod input validation schemas for contact creation, mutation,
 * phone formatting, email validation, URL security, and directory reordering.
 * ==============================================================================
 */

export const ContactChannelTypeEnum = z.enum([
  "PHONE",
  "EMAIL",
  "WEBSITE",
  "SOCIAL_LINK",
  "EMERGENCY",
  "MANAGER",
  "WHATSAPP",
  "TELEGRAM",
  "LIVE_CHAT",
  "CALL_CENTER",
]);

export const ContactRoleEnum = z.enum([
  "CUSTOMER_SUPPORT",
  "GENERAL_ENQUIRY",
  "EMERGENCY_DESK",
  "DUTY_MANAGER",
  "BUSINESS_DEVELOPMENT",
  "CORPORATE_OFFICE",
  "BOOKING_BOX_OFFICE",
  "TECHNICAL_OPERATIONS",
  "LOST_AND_FOUND",
]);

export const ContactAvailabilityModeEnum = z.enum([
  "STANDARD_BUSINESS_HOURS",
  "TWENTY_FOUR_SEVEN",
  "EMERGENCY_ONLY",
  "SHOWTIME_ONLY",
  "TEMPORARILY_INACTIVE",
]);

export const ContactVerificationStatusEnum = z.enum([
  "UNVERIFIED",
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
]);

export const ContactVisibilityEnum = z.enum([
  "PUBLIC",
  "HIDDEN",
  "INTERNAL_ONLY",
]);

export const ContactStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "ARCHIVED",
]);

export const ContactEntityTypeEnum = z.enum([
  "THEATRE",
  "CHAIN",
  "CORPORATE",
  "VENDOR",
  "SUPPORT_CENTER",
]);

export const TheatreSocialPlatformEnum = z.enum([
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "X_TWITTER",
  "YOUTUBE",
  "LINKEDIN",
  "THREADS",
  "CUSTOM",
]);

// URL validation that rejects javascript: or data: dangerous protocols
const safeUrlSchema = z
  .string()
  .trim()
  .url("Please enter a valid URL with https:// or http://")
  .refine(
    (url) => !/^(javascript|data|vbscript):/i.test(url),
    "URL contains unsafe protocol. Only http:// and https:// URLs are permitted."
  );

// Phone number validation: allows numbers, spaces, hyphens, parentheses (7 to 25 chars)
const phoneNumberSchema = z
  .string()
  .trim()
  .min(6, "Phone number must be at least 6 characters")
  .max(25, "Phone number cannot exceed 25 characters")
  .regex(
    /^\+?[0-9\s\-()]+$/,
    "Phone number can only contain digits, spaces, hyphens, parentheses, and optional leading +."
  );

// Country code validation: + followed by 1 to 4 digits
const countryCodeSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{0,3}$/, "Country code must be formatted as +91, +1, +44, etc.");

// ------------------------------------------------------------------------------
// Sub-Schemas
// ------------------------------------------------------------------------------

export const PhonePayloadSchema = z.object({
  countryCode: countryCodeSchema.default("+91"),
  phoneNumber: phoneNumberSchema,
  extension: z.string().trim().max(20).nullish(),
  phoneType: z.string().trim().max(50).default("MOBILE"),
  isSmsEnabled: z.boolean().default(false),
  isWhatsappEnabled: z.boolean().default(false),
});

export const EmailPayloadSchema = z.object({
  email: z.string().trim().email("Invalid email address format").max(255),
  emailType: z.string().trim().max(50).default("SUPPORT"),
  department: z.string().trim().max(100).nullish(),
});

export const WebsitePayloadSchema = z.object({
  url: safeUrlSchema,
  websiteType: z.string().trim().max(50).default("OFFICIAL"),
  title: z.string().trim().max(150).nullish(),
});

export const SocialLinkPayloadSchema = z.object({
  platform: TheatreSocialPlatformEnum,
  customPlatform: z.string().trim().max(80).nullish(),
  url: safeUrlSchema,
  handle: z.string().trim().max(100).nullish(),
});

export const EmergencyContactPayloadSchema = z.object({
  contactPersonName: z.string().trim().min(2, "Name is required").max(150),
  roleOrDesignation: z.string().trim().min(2, "Designation is required").max(120),
  primaryPhone: phoneNumberSchema,
  alternatePhone: phoneNumberSchema.nullish(),
  availabilityHours: z.string().trim().max(120).default("24/7 Priority Emergency Line"),
  emergencyType: z.string().trim().max(80).default("MEDICAL_FIRE_SAFETY"),
  operatingProcedures: z.string().trim().max(2000).nullish(),
});

export const ManagerContactPayloadSchema = z.object({
  managerName: z.string().trim().min(2, "Manager name is required").max(150),
  designation: z.string().trim().min(2, "Designation is required").max(120),
  phone: phoneNumberSchema,
  email: z.string().trim().email("Invalid manager email format").max(255),
  department: z.string().trim().max(100).default("Operations"),
  shiftHours: z.string().trim().max(100).nullish(),
  escalationTier: z.number().int().min(1).max(5).default(1),
});

// ------------------------------------------------------------------------------
// Action Payloads
// ------------------------------------------------------------------------------

export const CreateTheatreContactSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  channelType: ContactChannelTypeEnum,
  contactRole: ContactRoleEnum,
  title: z.string().trim().min(2, "Contact title is required").max(150),
  description: z.string().trim().max(1000).nullish(),
  isPrimary: z.boolean().default(false),
  visibility: ContactVisibilityEnum.default("PUBLIC"),
  availabilityMode: ContactAvailabilityModeEnum.default("STANDARD_BUSINESS_HOURS"),
  businessHours: z.string().trim().max(255).nullish(),
  displayOrder: z.number().int().min(0).default(1),
  status: ContactStatusEnum.default("ACTIVE"),
  entityType: ContactEntityTypeEnum.default("THEATRE"),
  entityId: z.string().trim().max(36).nullish(),

  phone: PhonePayloadSchema.optional(),
  email: EmailPayloadSchema.optional(),
  website: WebsitePayloadSchema.optional(),
  socialLink: SocialLinkPayloadSchema.optional(),
  emergencyContact: EmergencyContactPayloadSchema.optional(),
  managerContact: ManagerContactPayloadSchema.optional(),
});

export const UpdateTheatreContactSchema = z.object({
  contactId: z.string().trim().min(1, "Contact ID is required"),
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  expectedVersion: z.number().int().positive().optional(),
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).nullish(),
  contactRole: ContactRoleEnum.optional(),
  isPrimary: z.boolean().optional(),
  visibility: ContactVisibilityEnum.optional(),
  availabilityMode: ContactAvailabilityModeEnum.optional(),
  businessHours: z.string().trim().max(255).nullish(),
  displayOrder: z.number().int().min(0).optional(),
  status: ContactStatusEnum.optional(),
  verificationStatus: ContactVerificationStatusEnum.optional(),

  phone: PhonePayloadSchema.partial().optional(),
  email: EmailPayloadSchema.partial().optional(),
  website: WebsitePayloadSchema.partial().optional(),
  socialLink: SocialLinkPayloadSchema.partial().optional(),
  emergencyContact: EmergencyContactPayloadSchema.partial().optional(),
  managerContact: ManagerContactPayloadSchema.partial().optional(),
});

export const UpdateTheatreWebsiteSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  contactId: z.string().trim().optional(),
  url: safeUrlSchema,
  title: z.string().trim().max(150).optional(),
  websiteType: z.string().trim().max(50).default("OFFICIAL"),
  isPrimary: z.boolean().default(true),
  visibility: ContactVisibilityEnum.optional().default("PUBLIC"),
});

export const UpdateTheatreSocialLinksSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  socialLinks: z
    .array(
      z.object({
        platform: TheatreSocialPlatformEnum,
        customPlatform: z.string().trim().max(80).nullish(),
        url: safeUrlSchema,
        handle: z.string().trim().max(100).nullish(),
        displayOrder: z.number().int().min(1).default(1),
        status: ContactStatusEnum.default("ACTIVE"),
      })
    )
    .min(0),
});

export const ReorderTheatreContactsSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  orderedContactIds: z.array(z.string().trim().min(1)).min(1, "At least one ID is required"),
});

export const DeleteTheatreContactSchema = z.object({
  contactId: z.string().trim().min(1, "Contact ID is required"),
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  reason: z.string().trim().max(500).optional(),
});

export const ArchiveTheatreContactSchema = z.object({
  contactId: z.string().trim().min(1, "Contact ID is required"),
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
});
