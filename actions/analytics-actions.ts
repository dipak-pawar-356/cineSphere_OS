"use server";

import { revalidatePath } from "next/cache";
import {
  AnalyticsAuditLog,
  AnalyticsDrilldownLevel,
  AnalyticsDrilldownNode,
  BookingAnalyticsSummary,
  ChartDatapoint,
  ConfigurableReportConfig,
  HallPerformanceMetric,
  MoviePerformanceMetric,
  ReportSnapshot,
  SuperAdminDashboardAnalytics,
  TheatreDashboardAnalytics,
  TimeFilterPreset,
} from "@/types/analytics.types";
import {
  generateReportSnapshot,
  getAnalyticsAuditLogs,
  getAnalyticsDrilldown,
  getReportSnapshots,
  getSuperAdminAnalyticsDashboard,
  getTheatreAnalyticsDashboard,
} from "@/lib/engine/analytics-engine";

export interface AnalyticsActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Fetches comprehensive analytics for a Theatre Admin.
 * Strictly enforces tenant isolation: only metrics belonging to theatreId are returned.
 */
export async function fetchTheatreDashboardMetricsAction(
  theatreId: string,
  timeFilter: TimeFilterPreset = "last30days",
  customRange?: { from: string; to: string }
): Promise<AnalyticsActionResponse<TheatreDashboardAnalytics>> {
  try {
    if (!theatreId) {
      return {
        success: false,
        error: "Tenant violation: theatreId is required.",
        timestamp: new Date().toISOString(),
      };
    }

    const data = getTheatreAnalyticsDashboard(theatreId, timeFilter, customRange);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch theatre analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches circuit-wide platform analytics for Super Admin.
 */
export async function fetchSuperAdminDashboardMetricsAction(
  timeFilter: TimeFilterPreset = "last30days",
  customRange?: { from: string; to: string }
): Promise<AnalyticsActionResponse<SuperAdminDashboardAnalytics>> {
  try {
    const data = getSuperAdminAnalyticsDashboard(timeFilter, customRange);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch platform analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches movie performance analytics.
 */
export async function fetchMovieAnalyticsAction(
  theatreId?: string,
  timeFilter: TimeFilterPreset = "last30days"
): Promise<AnalyticsActionResponse<MoviePerformanceMetric[]>> {
  try {
    if (theatreId) {
      const data = getTheatreAnalyticsDashboard(theatreId, timeFilter);
      return {
        success: true,
        data: data.movies.allMovies,
        timestamp: new Date().toISOString(),
      };
    } else {
      const sa = getSuperAdminAnalyticsDashboard(timeFilter);
      const movies = sa.circuitPerformance.topPlatformMovies.map((m, idx) => ({
        movieId: m.movieId,
        title: m.title,
        format: "Cross-Circuit",
        releaseDate: "2026-10-01",
        bookingsCount: m.totalBookings,
        ticketsSold: Math.round(m.totalBookings * 2.1),
        totalRevenue: m.grossRevenue,
        occupancyPercent: 88.5,
        averageRatingPlaceholder: 4.8,
        boxOfficeSharePercent: idx === 0 ? 42.0 : idx === 1 ? 32.0 : 18.0,
        rank: idx + 1,
      }));
      return {
        success: true,
        data: movies,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch movie analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches hall performance analytics for a cinema.
 */
export async function fetchHallAnalyticsAction(
  theatreId: string,
  timeFilter: TimeFilterPreset = "last30days"
): Promise<AnalyticsActionResponse<HallPerformanceMetric[]>> {
  try {
    if (!theatreId) {
      return {
        success: false,
        error: "theatreId is required for hall analytics.",
        timestamp: new Date().toISOString(),
      };
    }
    const data = getTheatreAnalyticsDashboard(theatreId, timeFilter);
    return {
      success: true,
      data: data.halls.hallMetrics,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch hall analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches booking trends and peak hour analytics.
 */
export async function fetchBookingAnalyticsAction(
  theatreId?: string,
  timeFilter: TimeFilterPreset = "last30days"
): Promise<AnalyticsActionResponse<BookingAnalyticsSummary>> {
  try {
    const tid = theatreId || "th-pun-001";
    const data = getTheatreAnalyticsDashboard(tid, timeFilter);
    return {
      success: true,
      data: data.bookings,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch booking analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches revenue trends and breakdown.
 */
export async function fetchRevenueAnalyticsAction(
  theatreId?: string,
  timeFilter: TimeFilterPreset = "last30days"
): Promise<AnalyticsActionResponse<{ totalRevenue: number; trend: ChartDatapoint[] }>> {
  try {
    if (theatreId) {
      const data = getTheatreAnalyticsDashboard(theatreId, timeFilter);
      return {
        success: true,
        data: {
          totalRevenue: data.cards.totalRevenue,
          trend: data.charts.revenueTrend,
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      const sa = getSuperAdminAnalyticsDashboard(timeFilter);
      return {
        success: true,
        data: {
          totalRevenue: sa.cards.totalRevenue,
          trend: sa.charts.circuitRevenueTrend,
        },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch revenue analytics.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Generates a point-in-time Configurable Report Snapshot.
 */
export async function generateReportAction(
  config: ConfigurableReportConfig
): Promise<AnalyticsActionResponse<ReportSnapshot>> {
  try {
    const snapshot = generateReportSnapshot(config);

    if (config.theatreId) {
      revalidatePath("/theatre/reports");
      revalidatePath("/theatre/analytics");
    } else {
      revalidatePath("/dashboard/reports");
      revalidatePath("/dashboard/analytics");
    }

    return {
      success: true,
      message: `Report "${snapshot.reportName}" generated successfully.`,
      data: snapshot,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate report.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Navigates hierarchical drill-down nodes:
 * Platform → Theatre → Hall → Show → Booking → Ticket
 */
export async function fetchDrilldownAction(params: {
  level: AnalyticsDrilldownLevel;
  id?: string;
  theatreId?: string;
}): Promise<AnalyticsActionResponse<AnalyticsDrilldownNode[]>> {
  try {
    const nodes = getAnalyticsDrilldown(params);
    return {
      success: true,
      data: nodes,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics drilldown.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Fetches immutable audit logs for analytics operations.
 */
export async function fetchAnalyticsAuditLogsAction(
  theatreId?: string
): Promise<AnalyticsActionResponse<AnalyticsAuditLog[]>> {
  try {
    const logs = getAnalyticsAuditLogs(theatreId);
    return {
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch analytics audit logs.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}
