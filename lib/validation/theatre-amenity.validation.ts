import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities & Facilities Validation (Phase 3 – Part 5)
 * ==============================================================================
 * Robust Zod validation schemas, input sanitizers, and anti-corruption guards.
 * ==============================================================================
 */

export const AmenityStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DRAFT", "ARCHIVED"], {
  errorMap: () => ({ message: "Status must be ACTIVE, INACTIVE, DRAFT, or ARCHIVED" }),
});

export const AmenityAvailabilityModeSchema = z.enum(
  ["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "SEASONAL", "UNDER_MAINTENANCE"],
  {
    errorMap: () => ({
      message: "Availability must be AVAILABLE, TEMPORARILY_UNAVAILABLE, SEASONAL, or UNDER_MAINTENANCE",
    }),
  }
);

export const AmenityVisibilitySchema = z.enum(["PUBLIC", "HIDDEN", "INTERNAL"], {
  errorMap: () => ({ message: "Visibility must be PUBLIC, HIDDEN, or INTERNAL" }),
});

export const AmenityPrioritySchema = z.enum(
  ["CRITICAL", "FEATURED", "HIGH", "MEDIUM", "STANDARD", "LOW"],
  {
    errorMap: () => ({
      message: "Priority must be CRITICAL, FEATURED, HIGH, MEDIUM, STANDARD, or LOW",
    }),
  }
);

export const AmenityEntityTypeSchema = z.enum(
  ["THEATRE", "HALL", "LOUNGE", "PREMIUM_SCREEN"],
  {
    errorMap: () => ({
      message: "Entity type must be THEATRE, HALL, LOUNGE, or PREMIUM_SCREEN",
    }),
  }
);

export const AmenityCodeSchema = z
  .string()
  .trim()
  .min(2, "Code must be at least 2 characters")
  .max(80, "Code cannot exceed 80 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Code must be lowercase alphanumeric with hyphens (e.g. dolby-atmos)");

// ------------------------------------------------------------------------------
// Category Schemas
// ------------------------------------------------------------------------------
export const CreateAmenityCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Category code must be at least 2 characters")
    .max(60, "Category code cannot exceed 60 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Category code must be lowercase alphanumeric with hyphens"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name cannot exceed 120 characters"),
  displayName: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  defaultIcon: z.string().trim().min(1).max(60).default("Sparkles"),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// ------------------------------------------------------------------------------
// Catalog Item Schemas
// ------------------------------------------------------------------------------
export const CreateAmenityCatalogSchema = z.object({
  code: AmenityCodeSchema,
  name: z.string().trim().min(2, "Amenity name must be at least 2 characters").max(150, "Name cannot exceed 150 characters"),
  displayName: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  categoryId: z.string().trim().min(1, "Category ID is required"),
  categoryCode: z.string().trim().optional(),
  defaultIcon: z.string().trim().min(1).max(60).default("Sparkles"),
  customIconUrl: z
    .string()
    .trim()
    .url("Custom icon URL must be a valid URL")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "Custom icon URL must use https:// or http:// protocol",
    })
    .optional()
    .nullable(),
  priority: AmenityPrioritySchema.default("STANDARD"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  status: AmenityStatusSchema.default("ACTIVE"),
  localizedNames: z.record(z.string()).optional().default({}),
  localizedDescriptions: z.record(z.string()).optional().default({}),
});

export const UpdateAmenityCatalogSchema = z.object({
  id: z.string().trim().min(1, "Amenity Catalog ID is required"),
  expectedVersion: z.number().int().positive().optional(),
  code: AmenityCodeSchema.optional(),
  name: z.string().trim().min(2).max(150).optional(),
  displayName: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  categoryId: z.string().trim().min(1).optional(),
  categoryCode: z.string().trim().optional(),
  defaultIcon: z.string().trim().min(1).max(60).optional(),
  customIconUrl: z
    .string()
    .trim()
    .url("Custom icon URL must be a valid URL")
    .refine((url) => /^https?:\/\//i.test(url), {
      message: "Custom icon URL must use https:// or http:// protocol",
    })
    .optional()
    .nullable(),
  priority: AmenityPrioritySchema.optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  status: AmenityStatusSchema.optional(),
  localizedNames: z.record(z.string()).optional(),
  localizedDescriptions: z.record(z.string()).optional(),
});

// ------------------------------------------------------------------------------
// Facility Metadata Schema
// ------------------------------------------------------------------------------
export const FacilityMetadataSchema = z.object({
  parkingCapacity: z.number().int().min(0).optional().nullable(),
  evChargerCount: z.number().int().min(0).optional().nullable(),
  wifiSsid: z.string().trim().max(100).optional().nullable(),
  wifiAvailability: z.string().trim().max(500).optional().nullable(),
  accessibilityNotes: z.string().trim().max(1000).optional().nullable(),
  foodCourtInfo: z.string().trim().max(1000).optional().nullable(),
  waitingAreaDetails: z.string().trim().max(1000).optional().nullable(),
  customAttributes: z.record(z.unknown()).optional().default({}),
});

// ------------------------------------------------------------------------------
// Theatre Assignment Schemas
// ------------------------------------------------------------------------------
export const AssignAmenityToTheatreSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  amenityId: z.string().trim().min(1, "Amenity ID is required"),
  availability: AmenityAvailabilityModeSchema.default("AVAILABLE"),
  notes: z.string().trim().max(1000).optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  visibility: AmenityVisibilitySchema.default("PUBLIC"),
  status: AmenityStatusSchema.default("ACTIVE"),
  isFeatured: z.boolean().default(false),
  entityType: AmenityEntityTypeSchema.default("THEATRE"),
  entityId: z.string().trim().optional(),
  metadata: FacilityMetadataSchema.optional(),
});

export const UpdateTheatreAmenitySchema = z.object({
  assignmentId: z.string().trim().min(1, "Assignment ID is required"),
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  expectedVersion: z.number().int().positive().optional(),
  availability: AmenityAvailabilityModeSchema.optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  visibility: AmenityVisibilitySchema.optional(),
  status: AmenityStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  metadata: FacilityMetadataSchema.optional(),
});

export const ReorderTheatreAmenitiesSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required"),
  orderedAssignmentIds: z
    .array(z.string().trim().min(1))
    .min(1, "At least one assignment ID is required"),
});
