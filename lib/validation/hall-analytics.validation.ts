import { z } from "zod";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Zod Validation Schemas (Phase 4 – Part 15)
 * ==============================================================================
 */

export const generateHallAnalyticsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
  showId: z.string().optional(),
  forceRefresh: z.boolean().optional(),
});

export const refreshHallAnalyticsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
  showId: z.string().optional(),
});

export const runHallSimulationsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().min(1, "Hall ID is required"),
  layoutVersionId: z.string().optional(),
  showId: z.string().optional(),
  occupancyPercentages: z.array(z.number().min(1).max(100)).optional(),
  baseShowPrice: z.number().positive().optional(),
  showTimeMultiplier: z.number().min(0.5).max(3.0).optional(),
  dayTypeMultiplier: z.number().min(0.5).max(3.0).optional(),
  currency: z.string().min(3).max(5).optional(),
  convenienceFeePerSeat: z.number().min(0).optional(),
  gstPercent: z.number().min(0).max(50).optional(),
});

export const loadHallAnalyticsDashboardSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  hallId: z.string().optional(),
});

export const exportHallAnalyticsSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  format: z.enum(["JSON", "CSV_PLACEHOLDER", "PDF_PLACEHOLDER"]).optional(),
  hallId: z.string().optional(),
});

export const loadHallAnalyticsConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
});

export const saveHallAnalyticsConfigSchema = z.object({
  theatreId: z.string().min(1, "Theatre ID is required"),
  revenueSimulationEnabled: z.boolean().optional(),
  accessibilityReportsEnabled: z.boolean().optional(),
  vipAnalyticsEnabled: z.boolean().optional(),
  premiumLayoutMetricsEnabled: z.boolean().optional(),
  occupancySimulationEnabled: z.boolean().optional(),
  customKpiDashboardEnabled: z.boolean().optional(),
  advancedCapacityAnalysisEnabled: z.boolean().optional(),
  autoRefreshOnPublish: z.boolean().optional(),
  cacheTtlSeconds: z.number().int().min(30).max(86400).optional(),
  defaultCurrency: z.string().min(3).max(5).optional(),
  defaultBaseShowPrice: z.number().positive().optional(),
  backgroundJobSchedulePlaceholder: z.string().optional(),
  customKpiKeys: z.array(z.string()).optional(),
});
