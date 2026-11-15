import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Seat Generator & Category Validation Schemas
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Part 5: Seat Generator Schemas
// ------------------------------------------------------------------------------

export const SeatNumberingConfigSchema = z.object({
  style: z.enum(["NUMERIC", "ALPHABETIC", "ALPHANUMERIC", "ROMAN", "CUSTOM"]),
  prefix: z.string().max(20).optional(),
  suffix: z.string().max(20).optional(),
  startNumber: z.number().int().min(1).default(1),
  endNumber: z.number().int().min(1).optional(),
  isReversed: z.boolean().default(false),
  skipNumbers: z.array(z.number().int()).default([]),
  customNames: z.array(z.string()).optional(),
});

export const SeatAccessibilityConfigSchema = z.object({
  wheelchairSeatIndices: z.array(z.number().int().min(1)).optional(),
  companionSeatIndices: z.array(z.number().int().min(1)).optional(),
  reservedSeatIndices: z.array(z.number().int().min(1)).optional(),
  hiddenSeatIndices: z.array(z.number().int().min(1)).optional(),
  accessibleRouteIndices: z.array(z.number().int().min(1)).optional(),
});

export const SeatGeometryConfigSchema = z.object({
  type: z.enum(["STRAIGHT", "CURVED", "ARC", "ANGLED"]).default("STRAIGHT"),
  radius: z.number().positive().optional(),
  arcAngle: z.number().optional(),
  angle: z.number().optional(),
  isMirrored: z.boolean().default(false),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
});

export const GenerateSeatsSchema = z.object({
  theatreId: z.string().min(1),
  layoutVersionId: z.string().min(1),
  sectionId: z.string().min(1),
  rowId: z.string().min(1),
  rowName: z.string().min(1),
  sectionName: z.string().min(1),
  categoryCode: z.string().min(1),
  categoryName: z.string().optional(),
  categoryColor: z.string().optional(),
  seatCount: z.number().int().min(1).max(100),
  seatWidth: z.number().min(10).max(200).default(40),
  seatHeight: z.number().min(10).max(200).default(40),
  spacing: z.number().min(0).max(100).default(10),
  startX: z.number().default(100),
  startY: z.number().default(100),
  rotation: z.number().min(-360).max(360).default(0),
  numbering: SeatNumberingConfigSchema,
  accessibility: SeatAccessibilityConfigSchema.optional(),
  geometry: SeatGeometryConfigSchema.optional(),
});

export const RegenerateSeatsSchema = GenerateSeatsSchema;

export const DeleteGeneratedSeatsSchema = z.object({
  theatreId: z.string().min(1),
  layoutVersionId: z.string().min(1),
  rowId: z.string().min(1),
});

export const LoadSeatsSchema = z.object({
  theatreId: z.string().min(1),
  rowId: z.string().min(1),
});

export const LoadSeatsByVersionSchema = z.object({
  theatreId: z.string().min(1),
  layoutVersionId: z.string().min(1),
});

export const UpdateSeatMetadataSchema = z.object({
  theatreId: z.string().min(1),
  layoutVersionId: z.string().min(1),
  seatId: z.string().min(1),
  categoryCode: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "RESERVED", "HIDDEN"]).optional(),
  metadata: z
    .object({
      seatName: z.string().optional(),
      displayName: z.string().optional(),
      sightlineQuality: z.enum(["EXCELLENT", "GOOD", "STANDARD", "RESTRICTED"]).optional(),
      legroomRating: z.string().optional(),
      soundZone: z.string().optional(),
      customAttributes: z.record(z.unknown()).optional(),
    })
    .optional(),
  accessibility: z
    .object({
      accessibilityType: z
        .enum([
          "STANDARD",
          "WHEELCHAIR",
          "COMPANION",
          "ACCESSIBLE_ROUTE",
          "RESERVED_ACCESSIBILITY",
          "RESERVED",
          "HIDDEN",
        ])
        .optional(),
      isWheelchairAccessible: z.boolean().optional(),
      hasCompanionSeat: z.boolean().optional(),
      hasAccessibleRoute: z.boolean().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  coordinates: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
      rotation: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      spacing: z.number().optional(),
    })
    .optional(),
});

// ------------------------------------------------------------------------------
// Part 6: Seat Category Registry Schemas
// ------------------------------------------------------------------------------

export const CreateCategorySchema = z.object({
  theatreId: z.string().min(1),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_]+$/, "Code must contain only alphanumeric characters and underscores"),
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid 6-character hex code"),
  icon: z.string().max(50).optional(),
  priority: z.number().int().min(1).default(1),
  visibility: z.enum(["VISIBLE", "HIDDEN"]).default("VISIBLE"),
  accessibility: z
    .enum([
      "STANDARD",
      "WHEELCHAIR",
      "COMPANION",
      "ACCESSIBLE_ROUTE",
      "RESERVED_ACCESSIBILITY",
      "RESERVED",
      "HIDDEN",
    ])
    .default("STANDARD"),
  isPremium: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export const UpdateCategorySchema = z.object({
  theatreId: z.string().min(1),
  categoryId: z.string().min(1),
  updates: z.object({
    code: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[A-Za-z0-9_]+$/)
      .optional(),
    name: z.string().min(1).max(100).optional(),
    displayName: z.string().min(1).max(150).optional(),
    description: z.string().max(500).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icon: z.string().max(50).optional(),
    priority: z.number().int().min(1).optional(),
    visibility: z.enum(["VISIBLE", "HIDDEN"]).optional(),
    accessibility: z
      .enum([
        "STANDARD",
        "WHEELCHAIR",
        "COMPANION",
        "ACCESSIBLE_ROUTE",
        "RESERVED_ACCESSIBILITY",
        "RESERVED",
        "HIDDEN",
      ])
      .optional(),
    isPremium: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  }),
});

export const ArchiveCategorySchema = z.object({
  theatreId: z.string().min(1),
  categoryId: z.string().min(1),
});

export const RestoreCategorySchema = z.object({
  theatreId: z.string().min(1),
  categoryId: z.string().min(1),
});

export const DuplicateCategorySchema = z.object({
  theatreId: z.string().min(1),
  categoryId: z.string().min(1),
});

export const LoadCategoriesSchema = z.object({
  theatreId: z.string().min(1),
  includeArchived: z.boolean().default(false),
});

export const GetCategorySchema = z.object({
  theatreId: z.string().min(1),
  categoryId: z.string().min(1),
});
