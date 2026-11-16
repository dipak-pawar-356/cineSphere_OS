import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Zod Schemas
 * Phase 4 – Part 10: Pluggable Rule-Based Preflight Validation Framework
 * ==============================================================================
 */

export const SeverityLevelSchema = z.enum(["ERROR", "WARNING", "INFO", "SUGGESTION"]);
export const PolicyLevelSchema = z.enum(["STRICT", "STANDARD", "PREMIUM"]);
export const GeometryStrictnessSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const RunValidationSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().optional(),
});

export const ValidateLayoutSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().optional(),
});

export const LoadValidationRulesSchema = z.object({
  theatreId: z.string().optional(),
});

export const SaveValidationConfigSchema = z.object({
  theatreId: z.string().optional(),
  strictMode: z.boolean().optional(),
  requireAccessibility: z.boolean().optional(),
  requireEmergencyExit: z.boolean().optional(),
  requireScreen: z.boolean().optional(),
  geometryStrictness: GeometryStrictnessSchema.optional(),
  allowPublishWithWarnings: z.boolean().optional(),
  maxSeatCapacityLimit: z.number().int().positive().optional(),
});

export const ValidateBeforePublishSchema = z.object({
  layoutVersionId: z.string().min(1, "Layout version ID is required"),
  theatreId: z.string().optional(),
});

export const SaveValidationPolicySchema = z.object({
  theatreId: z.string().optional(),
  name: z.string().min(1, "Policy name is required").optional(),
  policyLevel: PolicyLevelSchema.optional(),
  ruleSeverityOverrides: z.record(SeverityLevelSchema).optional(),
  description: z.string().optional(),
});
