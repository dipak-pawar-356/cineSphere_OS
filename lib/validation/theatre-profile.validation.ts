/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Validation Rules (Phase 3 – Part 3)
 * ==============================================================================
 * Strict server-side Zod validation & business rule guards for theatre
 * identity, business metrics, languages, social links, localization, and slugs.
 * ==============================================================================
 */

import { z } from "zod";
import { TheatreCategoryType, TheatreSocialPlatform } from "@/types/theatre-profile.types";

export const SUPPORTED_PROFILE_LANGUAGES = [
  { code: "en", displayName: "English" },
  { code: "hi", displayName: "Hindi" },
  { code: "mr", displayName: "Marathi" },
  { code: "ta", displayName: "Tamil" },
  { code: "te", displayName: "Telugu" },
  { code: "kn", displayName: "Kannada" },
  { code: "ml", displayName: "Malayalam" },
  { code: "gu", displayName: "Gujarati" },
  { code: "pa", displayName: "Punjabi" },
  { code: "bn", displayName: "Bengali" },
] as const;

export const THEATRE_CATEGORY_LABELS: Record<TheatreCategoryType, string> = {
  MULTIPLEX: "Multiplex",
  SINGLE_SCREEN: "Single Screen",
  LUXURY_CINEMA: "Luxury Cinema",
  DRIVE_IN_CINEMA: "Drive-In Cinema",
  MINI_THEATRE: "Mini Theatre",
  INDEPENDENT_THEATRE: "Independent Theatre",
  CHAIN_THEATRE: "Chain Theatre",
  CUSTOM: "Custom Category",
};

export const SOCIAL_PLATFORM_LABELS: Record<TheatreSocialPlatform, string> = {
  WEBSITE: "Official Website",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  X_TWITTER: "X (Twitter)",
  YOUTUBE: "YouTube",
  LINKEDIN: "LinkedIn",
  THREADS: "Threads",
  CUSTOM: "Custom Platform",
};

export const SOCIAL_PLATFORM_DOMAIN_HINTS: Partial<Record<TheatreSocialPlatform, string[]>> = {
  FACEBOOK: ["facebook.com", "fb.com"],
  INSTAGRAM: ["instagram.com", "instagr.am"],
  X_TWITTER: ["x.com", "twitter.com"],
  YOUTUBE: ["youtube.com", "youtu.be"],
  LINKEDIN: ["linkedin.com"],
  THREADS: ["threads.net"],
};

const CURRENT_YEAR = new Date().getFullYear();
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LOCALE_REGEX = /^[a-z]{2}(?:-[A-Z]{2})?$/;

export const TheatreProfileStatusSchema = z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]);

export const TheatreCategoryTypeSchema = z.enum([
  "MULTIPLEX",
  "SINGLE_SCREEN",
  "LUXURY_CINEMA",
  "DRIVE_IN_CINEMA",
  "MINI_THEATRE",
  "INDEPENDENT_THEATRE",
  "CHAIN_THEATRE",
  "CUSTOM",
]);

export const TheatreOwnershipModelSchema = z.enum(["CHAIN", "INDEPENDENT"]);

export const TheatreSocialPlatformSchema = z.enum([
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "X_TWITTER",
  "YOUTUBE",
  "LINKEDIN",
  "THREADS",
  "CUSTOM",
]);

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export const HttpUrlSchema = z
  .string()
  .trim()
  .min(8, "URL must be at least 8 characters")
  .max(500, "URL cannot exceed 500 characters")
  .refine(isValidHttpUrl, {
    message: "Must be a valid http:// or https:// web URL with a domain",
  });

export const LocalizedTextFieldsSchema = z.object({
  theatreName: z.string().min(2).max(150).optional(),
  displayName: z.string().min(2).max(150).optional(),
  shortDescription: z.string().max(400).optional(),
  fullDescription: z.string().max(4000).optional(),
  aboutTheatre: z.string().max(4000).optional(),
  tagline: z.string().max(255).optional(),
});

export const TheatreLanguageInputSchema = z.object({
  languageCode: z
    .string()
    .trim()
    .min(2, "Language code must be at least 2 characters")
    .max(16)
    .regex(/^[a-z]{2,8}(?:-[A-Za-z0-9]{2,8})?$/, "Invalid ISO language code"),
  displayName: z.string().trim().min(2, "Language display name is required").max(80),
  isPrimary: z.boolean(),
});

export const TheatreSocialLinkInputSchema = z
  .object({
    platform: TheatreSocialPlatformSchema,
    customPlatformName: z.string().trim().max(80).optional(),
    label: z.string().trim().max(120).optional(),
    url: HttpUrlSchema,
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().min(1).max(100).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.platform === "CUSTOM" && (!val.customPlatformName || val.customPlatformName.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customPlatformName"],
        message: "Custom platform name is required when platform is CUSTOM",
      });
    }
    const hints = SOCIAL_PLATFORM_DOMAIN_HINTS[val.platform];
    if (hints && isValidHttpUrl(val.url)) {
      const host = new URL(val.url).hostname.toLowerCase();
      const matched = hints.some((d) => host === d || host.endsWith(`.${d}`));
      if (!matched) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["url"],
          message: `URL domain for ${val.platform} should match (${hints.join(" or ")})`,
        });
      }
    }
  });

export const CreateTheatreProfileSchema = z
  .object({
    theatreId: z.string().min(1, "Theatre ID is required"),
    publicSlug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(SLUG_REGEX, "Public slug may contain only lowercase letters, numbers, and hyphens")
      .optional(),
    theatreName: z.string().trim().min(2, "Theatre Name must be at least 2 characters").max(150),
    legalName: z.string().trim().min(2, "Legal Name must be at least 2 characters").max(200),
    displayName: z.string().trim().min(2).max(150).optional(),
    shortDescription: z.string().trim().max(400).optional(),
    fullDescription: z.string().trim().max(4000).optional(),
    aboutTheatre: z.string().trim().max(4000).optional(),
    tagline: z.string().trim().max(255).optional(),
    defaultLocale: z.string().regex(LOCALE_REGEX).optional(),
    localizedFields: z.record(z.string(), LocalizedTextFieldsSchema).optional(),
    establishedYear: z
      .number()
      .int()
      .min(1895, "Established year cannot be earlier than 1895")
      .max(CURRENT_YEAR + 1, `Established year cannot exceed ${CURRENT_YEAR + 1}`)
      .optional(),
    theatreType: TheatreCategoryTypeSchema,
    customTheatreType: z.string().trim().max(100).optional(),
    ownershipModel: TheatreOwnershipModelSchema,
    chainName: z.string().trim().max(120).optional(),
    screensCount: z
      .number()
      .int()
      .min(1, "Screens count must be at least 1")
      .max(100, "Screens count cannot exceed 100"),
    totalSeatingCapacity: z
      .number()
      .int()
      .min(10, "Total seating capacity must be at least 10 seats")
      .max(25000, "Total seating capacity cannot exceed 25,000 seats"),
    website: HttpUrlSchema.optional().or(z.literal("")),
    businessEmailPlaceholder: z
      .string()
      .trim()
      .email("Invalid business email format")
      .max(255)
      .optional()
      .or(z.literal("")),
    businessPhonePlaceholder: z.string().trim().max(40).optional(),
    status: TheatreProfileStatusSchema.optional(),
    languages: z.array(TheatreLanguageInputSchema).min(1).max(30).optional(),
    socialLinks: z.array(TheatreSocialLinkInputSchema).max(20).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.theatreType === "CUSTOM" && (!val.customTheatreType || val.customTheatreType.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customTheatreType"],
        message: "Custom theatre type label is required when Theatre Type is CUSTOM",
      });
    }
    if (val.totalSeatingCapacity < val.screensCount * 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalSeatingCapacity"],
        message: `Total capacity (${val.totalSeatingCapacity}) is too low for ${val.screensCount} screen(s) (minimum 10 seats/screen)`,
      });
    }
  });

export const UpdateTheatreProfileSchema = z
  .object({
    theatreId: z.string().min(1, "Theatre ID is required"),
    expectedVersion: z.number().int().positive().optional(),
    publicSlug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(SLUG_REGEX, "Public slug may contain only lowercase letters, numbers, and hyphens")
      .optional(),
    theatreName: z.string().trim().min(2).max(150).optional(),
    legalName: z.string().trim().min(2).max(200).optional(),
    displayName: z.string().trim().min(2).max(150).optional(),
    shortDescription: z.string().trim().max(400).optional(),
    fullDescription: z.string().trim().max(4000).optional(),
    aboutTheatre: z.string().trim().max(4000).optional(),
    tagline: z.string().trim().max(255).optional(),
    defaultLocale: z.string().regex(LOCALE_REGEX).optional(),
    localizedFields: z.record(z.string(), LocalizedTextFieldsSchema).optional(),
    establishedYear: z
      .number()
      .int()
      .min(1895)
      .max(CURRENT_YEAR + 1)
      .optional(),
    theatreType: TheatreCategoryTypeSchema.optional(),
    customTheatreType: z.string().trim().max(100).optional(),
    ownershipModel: TheatreOwnershipModelSchema.optional(),
    chainName: z.string().trim().max(120).optional(),
    screensCount: z.number().int().min(1).max(100).optional(),
    totalSeatingCapacity: z.number().int().min(10).max(25000).optional(),
    website: HttpUrlSchema.optional().or(z.literal("")),
    businessEmailPlaceholder: z.string().trim().email().max(255).optional().or(z.literal("")),
    businessPhonePlaceholder: z.string().trim().max(40).optional(),
    changeSummary: z.string().trim().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    if (
      val.screensCount !== undefined &&
      val.totalSeatingCapacity !== undefined &&
      val.totalSeatingCapacity < val.screensCount * 10
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalSeatingCapacity"],
        message: "Total capacity must be at least 10 seats per screen",
      });
    }
  });

export const ProfileStatusTransitionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  reason: z.string().trim().max(500).optional(),
});

export const UpdateTheatreLanguagesSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  languages: z
    .array(TheatreLanguageInputSchema)
    .min(1, "At least one supported language is required")
    .max(30),
  changeSummary: z.string().trim().max(500).optional(),
});

export const UpdateTheatreSocialLinksSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  socialLinks: z.array(TheatreSocialLinkInputSchema).max(20),
  changeSummary: z.string().trim().max(500).optional(),
});

export const RetrieveTheatreProfileSchema = z.object({
  theatreId: z.string().optional(),
  query: z.string().max(120).optional(),
  theatreType: z
    .enum([
      "ALL",
      "MULTIPLEX",
      "SINGLE_SCREEN",
      "LUXURY_CINEMA",
      "DRIVE_IN_CINEMA",
      "MINI_THEATRE",
      "INDEPENDENT_THEATRE",
      "CHAIN_THEATRE",
      "CUSTOM",
    ])
    .optional(),
  ownershipModel: z.enum(["ALL", "CHAIN", "INDEPENDENT"]).optional(),
  status: z.enum(["ALL", "DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]).optional(),
  languageCode: z.string().max(16).optional(),
  establishedYearFrom: z.number().int().min(1895).max(CURRENT_YEAR + 1).optional(),
  establishedYearTo: z.number().int().min(1895).max(CURRENT_YEAR + 1).optional(),
  sortBy: z
    .enum(["theatreName", "completionScore", "establishedYear", "screensCount", "updatedAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

