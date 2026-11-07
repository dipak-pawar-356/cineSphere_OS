import { z } from "zod";

/**
 * CineSphere OS - Core Schema Validators Placeholder
 */

export const TenantIdentifierSchema = z.object({
  tenantId: z.string().min(3).max(64),
  subdomain: z.string().min(2).max(32).optional(),
});

export const UserCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
