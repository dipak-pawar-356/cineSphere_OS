/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard & Analytics Service (Phase 3 – Part 11)
 * ==============================================================================
 * Enterprise domain service powering real-time operational dashboard analytics.
 * Enforces strict multi-tenant boundary checks, pre-aggregated materialized
 * metric extraction, capability-based widget registry filtering, and per-user
 * layout preference governance.
 * ==============================================================================
 */

import {
  DashboardFilterInput,
  TheatreDashboardBundle,
  UpdateUserDashboardPreferencesInput,
  UserDashboardPreferences,
  DashboardActivityItem,
} from "@/types/theatre-dashboard.types";
import { theatreDashboardRepository } from "@/lib/repositories/theatre-dashboard.repository";
import { theatreConfigurationRepository } from "@/lib/repositories/theatre-configuration.repository";
import { theatreProfileRepository } from "@/lib/repositories/theatre-profile.repository";
import { getPermittedWidgets } from "@/lib/dashboard/widget-registry";
import { tenantService } from "@/lib/services/tenant.service";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { createLogger } from "@/lib/observability/structured-logger";
import { invalidateCacheByTag, CACHE_TAGS } from "@/lib/performance/cache-strategy";
import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  dashboardFilterSchema,
  updateUserDashboardPreferencesSchema,
} from "@/lib/validation/theatre-dashboard.validation";
import { ValidationError } from "@/lib/errors";

const logger = createLogger("TheatreDashboardService");

function formatZodIssues(issues: Array<{ path: (string | number)[]; message: string }>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const issue of issues) {
    const path = issue.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export class TheatreDashboardService {
  private invalidateDashboardCache(theatreId: string, userId?: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_DASHBOARD(theatreId));
    invalidateCacheByTag(CACHE_TAGS.ANALYTICS(theatreId));
    if (userId) {
      invalidateCacheByTag(CACHE_TAGS.DASHBOARD_PREFERENCES(userId, theatreId));
    }
  }

  // ----------------------------------------------------------------------------
  // 1. Get Aggregated Operational Dashboard Bundle
  // ----------------------------------------------------------------------------
  public async getDashboardBundle(
    theatreId: string,
    filterInput?: Partial<DashboardFilterInput>,
    actor?: SecurityActorContext
  ): Promise<TheatreDashboardBundle> {
    // Multi-tenant boundary check
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const rawFilter = {
      theatreId,
      periodPreset: filterInput?.periodPreset || "TODAY",
      from: filterInput?.from,
      to: filterInput?.to,
      hallId: filterInput?.hallId,
      movieId: filterInput?.movieId,
      showId: filterInput?.showId,
    };

    const parsedFilter = dashboardFilterSchema.safeParse(rawFilter);
    if (!parsedFilter.success) {
      throw new ValidationError("Invalid dashboard query filter parameters", formatZodIssues(parsedFilter.error.issues));
    }
    const filter = parsedFilter.data;

    // Fetch tenant profile and localization configuration
    let theatreName = "CineSphere Cinema";
    let theatreCode = theatreId.toUpperCase();
    try {
      const profile = await theatreProfileRepository.findByTheatreId(theatreId);
      if (profile) {
        theatreName = profile.theatreName;
        theatreCode = profile.publicSlug?.toUpperCase() || theatreCode;
      }
    } catch {
      // Graceful fallback to default name
    }

    // Default configuration fallbacks based on theatre
    let currency = "INR";
    let currencySymbol = "₹";
    let numberFormat: "INDIAN" | "INTERNATIONAL" = "INDIAN";
    let timezone = "Asia/Kolkata";
    let timeFormat: "12H" | "24H" = "12H";

    try {
      const configBundle = await theatreConfigurationRepository.findBundle(theatreId);
      if (configBundle?.localization) {
        currency = configBundle.localization.currency;
        timezone = configBundle.localization.timezone;
        numberFormat = configBundle.localization.numberFormat === "INTERNATIONAL" ? "INTERNATIONAL" : "INDIAN";
        timeFormat = configBundle.localization.timeFormat === "24H" ? "24H" : "12H";
        currencySymbol = currency === "USD" ? "$" : currency === "AED" ? "AED " : "₹";
      }
    } catch {
      // Keep tenant-specific defaults if bundle not yet published
      if (theatreId === "th-mum-001") {
        currency = "USD";
        currencySymbol = "$";
        numberFormat = "INTERNATIONAL";
        timezone = "America/New_York";
      } else if (theatreId === "th-dxb-001") {
        currency = "AED";
        currencySymbol = "AED ";
        numberFormat = "INTERNATIONAL";
        timezone = "Asia/Dubai";
        timeFormat = "24H";
      }
    }

    // Materialized metrics
    const metrics = await theatreDashboardRepository.getMetrics(theatreId, filter);

    // Permitted widgets based on RBAC
    const permittedWidgets = getPermittedWidgets(actor?.permissions || ["*"], actor?.role || "THEATRE_ADMIN");

    // User layout preferences
    const userId = actor?.userId || "usr-operator";
    const userPrefs = await theatreDashboardRepository.getUserPreferences(theatreId, userId);

    // Activity feed
    const activities = await theatreDashboardRepository.getRecentActivities(theatreId, 10);

    // Available filter dimensions
    const availableFilters = await theatreDashboardRepository.getAvailableFilterOptions(theatreId);

    // Structured observability logging
    logger.info("API", `Retrieved dashboard bundle for theatre ${theatreId}`, {
      theatreId,
      metadata: {
        period: filter.periodPreset,
        currency,
        activeHalls: metrics.halls.occupiedHalls,
        runningShows: metrics.shows.runningShowsCount,
      },
    });

    // Security audit logging
    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-dash-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_DASHBOARD",
      action: "VIEW",
      description: `Viewed operational dashboard for ${theatreName} (${theatreId}) - Period: ${filter.periodPreset}`,
      metadata: {
        theatreId,
        period: filter.periodPreset,
        hallId: filter.hallId,
        movieId: filter.movieId,
      },
    });

    return {
      theatreId,
      theatreName,
      theatreCode,
      currency: metrics.meta.currency || currency,
      currencySymbol: metrics.meta.currencySymbol || currencySymbol,
      numberFormat: metrics.meta.numberFormat || numberFormat,
      timezone: metrics.meta.timezone || timezone,
      timeFormat: metrics.meta.timeFormat || timeFormat,
      filter,
      revenue: metrics.revenue,
      bookings: metrics.bookings,
      shows: metrics.shows,
      halls: metrics.halls,
      occupancy: metrics.occupancy,
      payments: metrics.payments,
      alerts: metrics.alerts,
      activities,
      availableFilters,
      userPreferences: userPrefs,
      registeredWidgets: permittedWidgets,
      lastUpdated: new Date().toISOString(),
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Update User Personalization Preferences
  // ----------------------------------------------------------------------------
  public async updateUserPreferences(
    input: UpdateUserDashboardPreferencesInput,
    actor?: SecurityActorContext
  ): Promise<UserDashboardPreferences> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = updateUserDashboardPreferencesSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid dashboard preferences payload", formatZodIssues(parsed.error.issues));
    }

    const data = parsed.data;
    const userId = data.userId || actor?.userId || "usr-operator";

    const current = await theatreDashboardRepository.getUserPreferences(data.theatreId, userId);

    const updated: UserDashboardPreferences = {
      userId,
      theatreId: data.theatreId,
      visibleWidgetIds: data.visibleWidgetIds || current.visibleWidgetIds,
      widgetOrder: data.widgetOrder || current.widgetOrder,
      collapsedWidgetIds: data.collapsedWidgetIds || current.collapsedWidgetIds,
      favoriteWidgetIds: data.favoriteWidgetIds || current.favoriteWidgetIds,
      defaultDatePreset: data.defaultDatePreset || current.defaultDatePreset,
      updatedAt: new Date(),
    };

    const saved = await theatreDashboardRepository.saveUserPreferences(updated);
    this.invalidateDashboardCache(data.theatreId, userId);

    const auditActor: SecurityActorContext = actor || {
      userId,
      role: "THEATRE_ADMIN",
      permissions: ["*"],
      correlationId: `corr-pref-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_DASHBOARD",
      action: "UPDATE_PREFERENCES",
      description: `Updated dashboard personalization layout for user ${userId}`,
      metadata: { theatreId: data.theatreId, userId },
    });

    return saved;
  }

  // ----------------------------------------------------------------------------
  // 3. Refresh Dashboard (Cache Invalidation & Fresh Metric Pull)
  // ----------------------------------------------------------------------------
  public async refreshDashboard(
    theatreId: string,
    filterInput?: Partial<DashboardFilterInput>,
    actor?: SecurityActorContext
  ): Promise<TheatreDashboardBundle> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    this.invalidateDashboardCache(theatreId, actor?.userId);

    const auditActor: SecurityActorContext = actor || {
      userId: "usr-system",
      role: "SUPER_ADMIN",
      permissions: ["*"],
      correlationId: `corr-refresh-${Date.now()}`,
    };

    await securityAuditService.recordAudit({
      actor: auditActor,
      module: "THEATRE_DASHBOARD",
      action: "REFRESH",
      description: `Triggered manual dashboard metric refresh for theatre ${theatreId}`,
      metadata: { theatreId },
    });

    return this.getDashboardBundle(theatreId, filterInput, actor);
  }

  // ----------------------------------------------------------------------------
  // 4. Record Real-time Activity
  // ----------------------------------------------------------------------------
  public async recordActivity(
    theatreId: string,
    activity: Omit<DashboardActivityItem, "id" | "timestamp">,
    actor?: SecurityActorContext
  ): Promise<DashboardActivityItem> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const item = await theatreDashboardRepository.recordActivity(theatreId, activity);
    this.invalidateDashboardCache(theatreId);
    return item;
  }
}

export const theatreDashboardService = new TheatreDashboardService();
