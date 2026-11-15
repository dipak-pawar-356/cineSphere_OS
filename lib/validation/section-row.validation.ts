/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Validation Schemas (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Zod validation schemas for Hall Sections and Rows:
 * - Part 3: Section Designer (Geometry, Priority, Labels, Ordering, Capacity)
 * - Part 4: Row Designer (Geometry, Auto-Numbering, Spacing, Accessibility)
 * ==============================================================================
 */

import { z } from "zod";

// ------------------------------------------------------------------------------
// 1. Shared Enums & Primitives
// ------------------------------------------------------------------------------

export const SeatCategoryEnum = z.enum([
  "Standard",
  "Recliner",
  "VIP",
  "Couple",
  "Wheelchair",
  "Sofa",
]);

export const SectionGeometryTypeEnum = z.enum([
  "RECTANGLE",
  "CURVED",
  "ARC",
  "POLYGON",
  "IRREGULAR",
]);

export const SectionLabelPositionEnum = z.enum([
  "TOP",
  "BOTTOM",
  "LEFT",
  "RIGHT",
  "CENTER",
  "HIDDEN",
]);

export const SectionVisibilityEnum = z.enum(["VISIBLE", "HIDDEN"]);

export const SectionOrderingDirectionEnum = z.enum(["UP", "DOWN", "TOP", "BOTTOM"]);

export const RowGeometryTypeEnum = z.enum(["STRAIGHT", "CURVED", "ARC", "ANGLED"]);

export const RowNumberingStrategyEnum = z.enum([
  "ALPHABETICAL",
  "NUMERIC",
  "ROMAN",
  "CUSTOM",
]);

export const RowAccessibilityTypeEnum = z.enum([
  "STANDARD",
  "WHEELCHAIR",
  "COMPANION",
  "RESERVED",
  "EMERGENCY_CLEARANCE",
  "HIDDEN",
]);

export const SectionGeometrySchema = z.object({
  shapeType: SectionGeometryTypeEnum,
  curvatureRadius: z.number().optional(),
  arcAngle: z.number().optional(),
  polygonPoints: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  isMirrored: z.boolean().optional(),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
});

export const RowGeometrySchema = z.object({
  geometryType: RowGeometryTypeEnum,
  curveRadius: z.number().optional(),
  angle: z.number().optional(),
  offsetX: z.number().optional(),
  offsetY: z.number().optional(),
  isMirrored: z.boolean().optional(),
});

export const RowConfigurationSchema = z.object({
  numberingStrategy: RowNumberingStrategyEnum,
  isReversed: z.boolean().default(false),
  startIndex: z.number().int().positive().default(1),
  endIndex: z.number().int().positive().default(10),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

// ------------------------------------------------------------------------------
// 2. Section Designer Schemas (Part 3)
// ------------------------------------------------------------------------------

export const CreateSectionSchema = z.object({
  theatreId: z.string().optional(),
  layoutVersionId: z.string().min(1, "Layout Version ID is required"),
  name: z.string().min(1, "Section name is required").max(100),
  displayName: z.string().min(1, "Display name is required").max(100),
  internalCode: z.string().min(1, "Internal code is required").max(50),
  color: z.string().min(1, "Color is required").max(30),
  seatCategory: SeatCategoryEnum,
  capacity: z.number().int().nonnegative("Capacity must be non-negative").default(0),
  priority: z.number().int().positive("Priority must be positive").default(1),
  displayOrder: z.number().int().nonnegative().default(0),
  rotation: z.number().default(0),
  position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  visibility: SectionVisibilityEnum.default("VISIBLE"),
  geometry: SectionGeometrySchema.default({ shapeType: "RECTANGLE" }),
  labelPosition: SectionLabelPositionEnum.default("TOP"),
  notes: z.string().max(500).optional(),
});

export const GetSectionSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
});

export const ListSectionsSchema = z.object({
  theatreId: z.string().optional(),
  layoutVersionId: z.string().min(1, "Layout Version ID is required"),
});

export const UpdateSectionSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
  updates: z.object({
    name: z.string().min(1).max(100).optional(),
    displayName: z.string().min(1).max(100).optional(),
    internalCode: z.string().min(1).max(50).optional(),
    color: z.string().optional(),
    seatCategory: SeatCategoryEnum.optional(),
    capacity: z.number().int().nonnegative().optional(),
    priority: z.number().int().positive().optional(),
    displayOrder: z.number().int().nonnegative().optional(),
    rotation: z.number().optional(),
    position: z.object({ x: z.number(), y: z.number() }).optional(),
    visibility: SectionVisibilityEnum.optional(),
    geometry: SectionGeometrySchema.optional(),
    labelPosition: SectionLabelPositionEnum.optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const DeleteSectionSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
});

export const DuplicateSectionSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
});

export const ReorderSectionsSchema = z.object({
  theatreId: z.string().optional(),
  layoutVersionId: z.string().min(1, "Layout Version ID is required"),
  sectionId: z.string().min(1, "Section ID is required"),
  direction: SectionOrderingDirectionEnum,
});

export const ValidateSectionsSchema = z.object({
  theatreId: z.string().optional(),
  layoutVersionId: z.string().min(1, "Layout Version ID is required"),
});

// ------------------------------------------------------------------------------
// 3. Row Designer Schemas (Part 4)
// ------------------------------------------------------------------------------

export const CreateRowSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
  rowName: z.string().min(1, "Row name is required").max(20),
  displayName: z.string().min(1, "Display name is required").max(100),
  sequence: z.number().int().positive("Sequence must be a positive integer").default(1),
  seatCount: z.number().int().positive("Seat count must be positive").default(10),
  spacing: z.number().positive("Row spacing must be positive").default(30),
  rotation: z.number().default(0),
  visibility: SectionVisibilityEnum.default("VISIBLE"),
  accessibility: RowAccessibilityTypeEnum.default("STANDARD"),
  geometry: RowGeometrySchema.default({ geometryType: "STRAIGHT" }),
  configuration: RowConfigurationSchema.default({
    numberingStrategy: "ALPHABETICAL",
    isReversed: false,
    startIndex: 1,
    endIndex: 10,
  }),
  categoryOverride: SeatCategoryEnum.optional(),
});

export const GetRowSchema = z.object({
  theatreId: z.string().optional(),
  rowId: z.string().min(1, "Row ID is required"),
});

export const ListRowsSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
});

export const UpdateRowSchema = z.object({
  theatreId: z.string().optional(),
  rowId: z.string().min(1, "Row ID is required"),
  updates: z.object({
    rowName: z.string().min(1).max(20).optional(),
    displayName: z.string().min(1).max(100).optional(),
    sequence: z.number().int().positive().optional(),
    seatCount: z.number().int().positive().optional(),
    spacing: z.number().positive().optional(),
    rotation: z.number().optional(),
    visibility: SectionVisibilityEnum.optional(),
    accessibility: RowAccessibilityTypeEnum.optional(),
    geometry: RowGeometrySchema.optional(),
    configuration: RowConfigurationSchema.optional(),
    categoryOverride: SeatCategoryEnum.optional(),
  }),
});

export const DeleteRowSchema = z.object({
  theatreId: z.string().optional(),
  rowId: z.string().min(1, "Row ID is required"),
});

export const DuplicateRowSchema = z.object({
  theatreId: z.string().optional(),
  rowId: z.string().min(1, "Row ID is required"),
});

export const ReorderRowsSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
  rowId: z.string().min(1, "Row ID is required"),
  direction: z.enum(["UP", "DOWN"]),
});

export const ValidateRowsSchema = z.object({
  theatreId: z.string().optional(),
  sectionId: z.string().min(1, "Section ID is required"),
});
