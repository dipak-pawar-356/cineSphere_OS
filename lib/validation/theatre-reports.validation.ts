/**
 * ==============================================================================
 * CineSphere OS — Reports & Analytics Validation Schemas (Phase 3 – Part 15)
 * ==============================================================================
 * Zod validation schemas for report generation, analytics filtering, and exports.
 * ==============================================================================
 */

import { z } from "zod";

export const ReportFilterStateSchema = z.object({
  dateRangePreset: z.enum([
    "TODAY",
    "YESTERDAY",
    "THIS_WEEK",
    "THIS_MONTH",
    "THIS_YEAR",
    "CUSTOM",
  ]).default("THIS_MONTH"),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  movieId: z.string().trim().max(100).optional(),
  hallId: z.string().trim().max(100).optional(),
  showId: z.string().trim().max(100).optional(),
  paymentMethod: z.string().trim().max(50).optional(),
  language: z.string().trim().max(50).optional(),
  format: z.string().trim().max(50).optional(),
});

export const GenerateReportSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  definitionId: z.string().trim().min(1, "Report definition ID is required").max(100),
  filters: ReportFilterStateSchema.default({ dateRangePreset: "THIS_MONTH" }),
});

export const LoadAnalyticsSummarySchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  category: z.enum([
    "REVENUE_REPORTS",
    "OCCUPANCY_REPORTS",
    "HALL_PERFORMANCE",
    "MOVIE_PERFORMANCE",
    "BOOKING_TRENDS",
    "CUSTOMER_ANALYTICS",
    "PAYMENT_ANALYTICS",
    "THEATRE_GROWTH",
    "OPERATIONAL_KPIS",
    "EXECUTIVE_SUMMARY",
  ]),
  filters: ReportFilterStateSchema.default({ dateRangePreset: "THIS_MONTH" }),
});

export const ExportReportSchema = z.object({
  theatreId: z.string().trim().min(1, "Theatre ID is required").max(100),
  definitionId: z.string().trim().min(1, "Report definition ID is required").max(100),
  format: z.enum(["CSV", "JSON", "PDF_PLACEHOLDER"]).default("CSV"),
  filters: ReportFilterStateSchema.default({ dateRangePreset: "THIS_MONTH" }),
});
