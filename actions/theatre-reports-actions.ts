"use server";

import { z } from "zod";
import { createProtectedAction } from "@/lib/security/action-guard";
import { theatreAnalyticsService } from "@/lib/services/theatre-analytics.service";
import {
  ReportFilterStateSchema,
  GenerateReportSchema,
  LoadAnalyticsSummarySchema,
  ExportReportSchema,
} from "@/lib/validation/theatre-reports.validation";
import {
  GeneratedReportPayload,
  ReportDefinition,
  MetricDefinition,
  ReportExportFormat,
  ReportFilterState,
  ReportDateRangePreset,
} from "@/types/theatre-reports-analytics.types";

const resolveFilters = (f?: z.input<typeof ReportFilterStateSchema>): ReportFilterState => ({
  dateRangePreset: (f?.dateRangePreset as ReportDateRangePreset) || "THIS_MONTH",
  startDate: f?.startDate,
  endDate: f?.endDate,
  movieId: f?.movieId,
  hallId: f?.hallId,
  showId: f?.showId,
  paymentMethod: f?.paymentMethod,
  language: f?.language,
  format: f?.format,
});

/**
 * ==============================================================================
 * CineSphere OS — Reports & Analytics Server Actions (Phase 3 – Part 15)
 * ==============================================================================
 * Protected server actions for generating historical reports, querying analytical
 * aggregates, inspecting metric definitions, and triggering export serializers.
 * Gated by authentication, role-based access control, and multi-tenant isolation.
 * ==============================================================================
 */

// 1. Generate Report Action
export const generateReportAction = createProtectedAction<
  z.input<typeof GenerateReportSchema>,
  GeneratedReportPayload
>(
  {
    actionName: "generateReportAction",
    schema: GenerateReportSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ANALYTICS_REPORTING",
    auditAction: "GENERATE_REPORT",
  },
  async (input, context) => {
    const filters = resolveFilters(input.filters);
    return theatreAnalyticsService.generateReport(
      input.theatreId,
      input.definitionId,
      filters,
      context.actor
    );
  }
);

// 2. Load Category Analytics Summary Action
export const loadAnalyticsSummaryAction = createProtectedAction<
  z.input<typeof LoadAnalyticsSummarySchema>,
  any
>(
  {
    actionName: "loadAnalyticsSummaryAction",
    schema: LoadAnalyticsSummarySchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
  },
  async (input, context) => {
    const filters = resolveFilters(input.filters);
    switch (input.category) {
      case "REVENUE_REPORTS":
        return theatreAnalyticsService.getRevenueAnalytics(input.theatreId, filters, context.actor);
      case "OCCUPANCY_REPORTS":
        return theatreAnalyticsService.getOccupancyAnalytics(input.theatreId, filters, context.actor);
      case "HALL_PERFORMANCE":
        return theatreAnalyticsService.getHallPerformance(input.theatreId, filters, context.actor);
      case "MOVIE_PERFORMANCE":
        return theatreAnalyticsService.getMoviePerformance(input.theatreId, filters, context.actor);
      case "BOOKING_TRENDS":
        return theatreAnalyticsService.getBookingAnalytics(input.theatreId, filters, context.actor);
      case "CUSTOMER_ANALYTICS":
        return theatreAnalyticsService.getCustomerAnalytics(input.theatreId, filters, context.actor);
      case "PAYMENT_ANALYTICS":
        return theatreAnalyticsService.getPaymentAnalytics(input.theatreId, filters, context.actor);
      case "THEATRE_GROWTH":
        return theatreAnalyticsService.getTheatreGrowth(input.theatreId, filters, context.actor);
      case "OPERATIONAL_KPIS":
        return theatreAnalyticsService.getOperationalKpis(input.theatreId, filters, context.actor);
      case "EXECUTIVE_SUMMARY":
      default:
        return theatreAnalyticsService.getExecutiveSummary(input.theatreId, filters, context.actor);
    }
  }
);

// 3. Export Report Action
export const exportReportAction = createProtectedAction<
  z.input<typeof ExportReportSchema>,
  { format: ReportExportFormat; mimeType: string; content: string }
>(
  {
    actionName: "exportReportAction",
    schema: ExportReportSchema,
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
    enforceTenantIsolation: true,
    tenantIdExtractor: (input) => input.theatreId,
    auditModule: "ANALYTICS_REPORTING",
    auditAction: "EXPORT_REPORT",
  },
  async (input, context) => {
    const filters = resolveFilters(input.filters);
    const report = await theatreAnalyticsService.generateReport(
      input.theatreId,
      input.definitionId,
      filters,
      context.actor
    );
    return theatreAnalyticsService.exportReport(report, input.format as ReportExportFormat, context.actor);
  }
);

// 4. Get Available Report Definitions Action
export const getAvailableReportDefinitionsAction = createProtectedAction<
  void,
  ReportDefinition[]
>(
  {
    actionName: "getAvailableReportDefinitionsAction",
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async (_input, context) => {
    return theatreAnalyticsService.getAvailableReportDefinitions(context.actor);
  }
);

// 5. Get Metric Registry Action
export const getMetricRegistryAction = createProtectedAction<
  void,
  MetricDefinition[]
>(
  {
    actionName: "getMetricRegistryAction",
    rateLimitCategory: "ADMIN_API",
    requiredRole: ["STAFF", "HALL_MANAGER", "THEATRE_ADMIN", "SUPER_ADMIN"],
  },
  async () => {
    return theatreAnalyticsService.getMetricRegistry();
  }
);
