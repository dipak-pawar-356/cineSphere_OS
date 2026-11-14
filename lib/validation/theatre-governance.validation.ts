/**
 * ==============================================================================
 * CineSphere OS — Theatre Governance Validation Schemas (Phase 3 – Part 14)
 * ==============================================================================
 * Zod validation schemas for ownership, soft delete, restore, media validation,
 * activity history querying, and security policy evaluation.
 * ==============================================================================
 */

import { z } from "zod";

export const ValidateOwnershipSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  resourceType: z.string().trim().min(1, "Resource type is required").max(50),
  resourceId: z.string().trim().min(1, "Resource ID is required").max(100),
});

export const SoftDeleteResourceSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  resourceType: z.string().trim().min(1, "Resource type is required").max(50),
  resourceId: z.string().trim().min(1, "Resource ID is required").max(100),
  reason: z.string().trim().max(250).optional(),
});

export const RestoreResourceSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  resourceType: z.string().trim().min(1, "Resource type is required").max(50),
  resourceId: z.string().trim().min(1, "Resource ID is required").max(100),
});

export const MediaValidationInputSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  fileName: z.string().trim().min(1, "File name is required").max(255),
  fileSizeBytes: z.number().int().positive("File size must be positive"),
  mimeType: z.string().trim().min(1, "MIME type is required").max(100),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sha256Checksum: z.string().length(64).optional(),
});

export const ActivityHistoryQuerySchema = z.object({
  theatreId: z.string().trim().max(100).optional(),
  resourceType: z.string().trim().max(50).optional(),
  resourceId: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(100).optional(),
  action: z.string().trim().max(50).optional(),
  module: z.string().trim().max(50).optional(),
  fromTimestamp: z.string().datetime().optional(),
  toTimestamp: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const EvaluatePolicySchema = z.object({
  policyKey: z.string().trim().min(1, "Policy key is required").max(50),
  targetTenantId: z.string().trim().max(100).optional(),
  resourceType: z.string().trim().max(50).optional(),
  resourceId: z.string().trim().max(100).optional(),
});

export const UpdateSecurityConfigSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  mediaUploadLimitMb: z.number().int().min(1).max(100).optional(),
  maxStaffCount: z.number().int().min(1).max(1000).optional(),
  allowedMimeTypes: z.array(z.string()).optional(),
  requireMfaForSensitiveActions: z.boolean().optional(),
});

export const CheckRateLimitSchema = z.object({
  endpoint: z.enum([
    "AUTH_REQUESTS",
    "MEDIA_UPLOADS",
    "SEARCH_REQUESTS",
    "CONFIGURATION_UPDATES",
    "DASHBOARD_REFRESH",
    "PUBLIC_PAGE_REQUESTS",
  ]),
  key: z.string().trim().min(1, "Rate limit key is required").max(100),
  customConfig: z
    .object({
      windowMs: z.number().int().positive().optional(),
      maxRequests: z.number().int().positive().optional(),
      blockDurationMs: z.number().int().positive().optional(),
    })
    .optional(),
});

