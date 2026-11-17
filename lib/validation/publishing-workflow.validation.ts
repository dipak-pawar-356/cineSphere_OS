import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Publishing Workflow Zod Validation Schemas (Phase 4 – Part 12)
 * ==============================================================================
 */

export const publishVersionActionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
  publishNotes: z.string().optional(),
  schedulePublishAt: z.string().optional(),
});

export const unpublishVersionActionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
  notes: z.string().optional(),
});

export const loadPublishStatusSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

export const loadPublishHistorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

export const loadPublishingConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const savePublishingConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  instantPublishEnabled: z.boolean().default(true),
  approvalRequired: z.boolean().default(false),
  scheduledPublishEnabled: z.boolean().default(false),
  rollbackEnabled: z.boolean().default(true),
  publishWindow: z.enum(["ANYTIME", "BUSINESS_HOURS", "MAINTENANCE_WINDOW", "OFF_PEAK"]).default("ANYTIME"),
  requirePublishNotes: z.boolean().default(false),
  notifyOnPublish: z.boolean().default(true),
});

export const assignLayoutToShowSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
});

export const getLayoutForShowSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
});

export const migrateShowLayoutSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  showId: z.string().min(1, "Show ID is required"),
  targetLayoutVersionId: z.string().min(1, "Target Version ID is required"),
  migrationReason: z.string().min(1, "Migration reason is required"),
  bookedSeatsCount: z.number().int().min(0).default(0),
});

export const saveDraftActionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  notes: z.string().optional(),
  sourceVersionId: z.string().optional(),
});

export const archivePublishVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  notes: z.string().optional(),
});

export const restorePublishVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  targetVersionId: z.string().min(1, "Target Version ID is required"),
  notes: z.string().optional(),
});
