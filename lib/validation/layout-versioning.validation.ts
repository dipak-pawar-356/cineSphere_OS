import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Layout Versioning Zod Validation Schemas (Phase 4 – Part 11)
 * ==============================================================================
 */

export const loadVersionHistorySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
});

export const createDraftVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  notes: z.string().default(""),
  sourceVersionId: z.string().optional(),
});

export const compareVersionsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  sourceVersionId: z.string().min(1, "Source Version ID is required"),
  targetVersionId: z.string().min(1, "Target Version ID is required"),
});

export const rollbackVersionSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  layoutDefinitionId: z.string().min(1, "Layout Definition ID is required"),
  targetVersionId: z.string().min(1, "Target Version ID is required"),
  notes: z.string().default("Rollback to historical version"),
});

export const saveVersionPolicySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  maxVersionsAllowed: z.number().int().min(0).default(50),
  rollbackEnabled: z.boolean().default(true),
  compareEnabled: z.boolean().default(true),
  versionNotesRequired: z.boolean().default(false),
  autoPruneArchivedDrafts: z.boolean().default(false),
  approvalRequired: z.boolean().default(false),
  allowedLabels: z.array(z.string()).default([]),
});

export const getVersionPolicySchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const getChangeEventsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  versionId: z.string().min(1, "Version ID is required"),
});
