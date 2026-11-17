import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Hall Templates Zod Validation Schemas (Phase 4 – Part 14)
 * ==============================================================================
 */

export const templateCategorySchema = z.enum([
  "SMALL_THEATRE",
  "MULTIPLEX",
  "PREMIUM",
  "IMAX",
  "4DX",
  "OPEN_AIR",
  "MINI_THEATRE",
  "AUDITORIUM",
  "CUSTOM",
]);

export const loadTemplatesSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  category: templateCategorySchema.optional(),
});

export const getTemplateDetailsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  templateId: z.string().min(1, "Template ID is required"),
});

export const createTemplateSchema = z.object({
  theatreId: z.string().optional(),
  name: z.string().min(2, "Template name is required"),
  code: z.string().min(2, "Template code is required"),
  category: templateCategorySchema,
  description: z.string().min(5, "Description is required"),
  parentTemplateId: z.string().optional(),
  canvasSettings: z.object({
    width: z.number().int().min(400),
    height: z.number().int().min(400),
    gridSize: z.number().int().min(10),
    snapToGrid: z.boolean(),
    showGrid: z.boolean(),
    showLabels: z.boolean(),
    theme: z.enum(["dark", "light"]),
  }),
  gridConfig: z.object({
    rows: z.number().int().min(1),
    columns: z.number().int().min(1),
    seatWidth: z.number().min(10),
    seatHeight: z.number().min(10),
    seatSpacingX: z.number().min(0),
    seatSpacingY: z.number().min(0),
    rowSpacing: z.number().min(0),
    totalCapacity: z.number().int().min(1),
  }),
  sections: z.array(z.any()),
  seats: z.array(z.any()),
  structuralObjects: z.array(z.any()),
  tags: z.array(z.string()).optional(),
});

export const updateTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  theatreId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  category: templateCategorySchema.optional(),
  canvasSettings: z.any().optional(),
  gridConfig: z.any().optional(),
  sections: z.array(z.any()).optional(),
  seats: z.array(z.any()).optional(),
  structuralObjects: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export const duplicateTemplateSchema = z.object({
  sourceTemplateId: z.string().min(1, "Source template ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  newName: z.string().min(2, "New template name is required"),
  newCode: z.string().min(2, "New template code is required"),
  customNotes: z.string().optional(),
});

export const archiveTemplateSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  templateId: z.string().min(1, "Template ID is required"),
});

export const generateLayoutFromTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  theatreId: z.string().min(1, "Theatre ID is required"),
  targetHallId: z.string().min(1, "Target Hall ID is required"),
  layoutName: z.string().min(2, "Layout name is required"),
  layoutDescription: z.string().optional(),
});

export const loadTemplateConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const saveTemplateConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  allowCustomTemplates: z.boolean().optional(),
  maxCustomTemplates: z.number().int().min(0).optional(),
  defaultBaseTemplateId: z.string().optional(),
  autoInheritPlatformUpdates: z.boolean().optional(),
  restrictedCategories: z.array(templateCategorySchema).optional(),
});
