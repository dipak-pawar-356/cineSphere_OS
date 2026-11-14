/**
 * ==============================================================================
 * CineSphere OS — Theatre Analytics & Reporting Domain Service (Phase 3 – Part 15)
 * ==============================================================================
 * Central domain service for historical business intelligence, decoupled from
 * operational dashboards. Coordinates metric calculations, report generation,
 * multi-dimensional filtering, export serializations, and compliance audits.
 * ==============================================================================
 */

import {
  ReportCategoryKey,
  ReportFilterState,
  GeneratedReportPayload,
  ReportDefinition,
  MetricDefinition,
  RevenueAnalyticsData,
  OccupancyAnalyticsData,
  HallPerformanceData,
  MoviePerformanceData,
  BookingAnalyticsData,
  CustomerAnalyticsData,
  PaymentAnalyticsData,
  TheatreGrowthData,
  OperationalKpiData,
  ExecutiveSummaryData,
  ReportExportFormat,
} from "@/types/theatre-reports-analytics.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { theatreReportsRepository } from "@/lib/repositories/theatre-reports.repository";
import { ReportDefinitionRegistry } from "@/lib/analytics/report-definitions";
import { MetricRegistry } from "@/lib/analytics/metric-registry";
import { theatreGovernanceRepository } from "@/lib/repositories/theatre-governance.repository";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("TheatreAnalyticsService");

export class TheatreAnalyticsService {
  /**
   * Retrieves all report definitions accessible to the current user role.
   */
  public getAvailableReportDefinitions(actor: SecurityActorContext): ReportDefinition[] {
    return ReportDefinitionRegistry.list(actor.role);
  }

  /**
   * Retrieves the centralized metric definitions registry.
   */
  public getMetricRegistry(): MetricDefinition[] {
    return Object.values(MetricRegistry.listByCategory("REVENUE"))
      .concat(MetricRegistry.listByCategory("OCCUPANCY"))
      .concat(MetricRegistry.listByCategory("HALL"))
      .concat(MetricRegistry.listByCategory("MOVIE"))
      .concat(MetricRegistry.listByCategory("BOOKING"))
      .concat(MetricRegistry.listByCategory("CUSTOMER"))
      .concat(MetricRegistry.listByCategory("PAYMENT"))
      .concat(MetricRegistry.listByCategory("GROWTH"));
  }

  /**
   * Generates a fully aggregated, localized historical business intelligence report.
   */
  public async generateReport(
    theatreId: string,
    definitionId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): Promise<GeneratedReportPayload> {
    const report = theatreReportsRepository.buildReport(theatreId, definitionId, filters, actor);

    // Record domain security audit event
    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-rep-${Date.now()}`,
      eventType: "THEATRE_UPDATED",
      theatreId,
      resourceType: "REPORT",
      resourceId: report.reportId,
      actor,
      action: "GENERATE_REPORT",
      module: "ANALYTICS_REPORTING",
      metadata: {
        definitionId,
        category: report.category,
        dateRangePreset: filters.dateRangePreset,
        executionTimeMs: report.executionTimeMs,
      },
      timestamp: new Date().toISOString(),
    });

    // Record chronological activity history
    theatreGovernanceRepository.recordActivity({
      id: `act-rep-${Date.now()}`,
      theatreId,
      resourceType: "REPORT",
      resourceId: report.reportId,
      action: "GENERATE_REPORT",
      module: "ANALYTICS_REPORTING",
      userId: actor.userId,
      userName: actor.name || "Operator",
      userRole: actor.role,
      timestamp: new Date().toISOString(),
      details: `Generated '${report.reportTitle}' (${report.category}) with date preset '${filters.dateRangePreset}'`,
      metadata: { definitionId },
    });

    logger.info(
      "AUDIT",
      `[ANALYTICS] Generated '${report.reportTitle}' for theatre ${theatreId}`,
      {
        theatreId,
        userId: actor.userId,
        userRole: actor.role,
        correlationId: actor.correlationId,
        durationMs: report.executionTimeMs,
      }
    );

    return report;
  }

  // ----------------------------------------------------------------------------
  // Specialized Analytical Fetchers
  // ----------------------------------------------------------------------------
  public getRevenueAnalytics(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): RevenueAnalyticsData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getRevenueAnalytics(theatreId, filters);
  }

  public getOccupancyAnalytics(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): OccupancyAnalyticsData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getOccupancyAnalytics(theatreId, filters);
  }

  public getHallPerformance(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): HallPerformanceData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getHallPerformance(theatreId, filters);
  }

  public getMoviePerformance(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): MoviePerformanceData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getMoviePerformance(theatreId, filters);
  }

  public getBookingAnalytics(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): BookingAnalyticsData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getBookingAnalytics(theatreId, filters);
  }

  public getCustomerAnalytics(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): CustomerAnalyticsData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getCustomerAnalytics(theatreId, filters);
  }

  public getPaymentAnalytics(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): PaymentAnalyticsData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getPaymentAnalytics(theatreId, filters);
  }

  public getTheatreGrowth(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): TheatreGrowthData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getTheatreGrowth(theatreId, filters);
  }

  public getOperationalKpis(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): OperationalKpiData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getOperationalKpis(theatreId, filters);
  }

  public getExecutiveSummary(
    theatreId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): ExecutiveSummaryData {
    theatreReportsRepository.assertTenantAccess(theatreId, actor);
    return theatreReportsRepository.getExecutiveSummary(theatreId, filters);
  }

  /**
   * Serializes a generated report into the requested export format.
   */
  public exportReport(
    report: GeneratedReportPayload,
    format: ReportExportFormat,
    actor: SecurityActorContext
  ): { format: ReportExportFormat; mimeType: string; content: string } {
    theatreReportsRepository.assertTenantAccess(report.theatreId, actor);

    // Audit log export action
    theatreGovernanceRepository.recordDomainEvent({
      eventId: `evt-exp-${Date.now()}`,
      eventType: "THEATRE_UPDATED",
      theatreId: report.theatreId,
      resourceType: "REPORT",
      resourceId: report.reportId,
      actor,
      action: "EXPORT_REPORT",
      module: "ANALYTICS_REPORTING",
      metadata: { format },
      timestamp: new Date().toISOString(),
    });

    if (format === "CSV") {
      return {
        format: "CSV",
        mimeType: "text/csv",
        content: theatreReportsRepository.exportToCsv(report),
      };
    }

    if (format === "JSON") {
      return {
        format: "JSON",
        mimeType: "application/json",
        content: JSON.stringify(report, null, 2),
      };
    }

    // PDF placeholder stub
    return {
      format: "PDF_PLACEHOLDER",
      mimeType: "application/pdf",
      content: Buffer.from(`%PDF-1.4 Placeholder Report: ${report.reportTitle}`).toString("base64"),
    };
  }
}

export const theatreAnalyticsService = new TheatreAnalyticsService();
