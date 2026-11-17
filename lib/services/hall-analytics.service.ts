import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  HallAnalyticsReport,
  HallAnalyticsConfiguration,
  HallAnalyticsDashboardData,
  HallAnalyticsExportEnvelope,
  HallAnalyticsSnapshot,
  OccupancySimulationResult,
  RevenueSimulationInput,
  RevenueSimulationResult,
} from "@/types/hall-analytics.types";
import { HallAnalyticsEngine } from "@/lib/engine/hall-analytics-engine";
import { hallAnalyticsRepository } from "@/lib/repositories/hall-analytics.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { seatInventoryIntegrationRepository } from "@/lib/repositories/seat-inventory-integration.repository";
import { hallDesignerEventBus } from "@/lib/engine/hall-designer-event-bus";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Domain Service (Phase 4 – Part 15)
 * ==============================================================================
 * Consumes immutable published layout versions and seat inventory snapshots
 * through the Analytics Projection Layer. Supports precomputed caching,
 * incremental refresh, read-only revenue/occupancy simulations, per-theatre
 * policies, and event-driven auto-projection on LayoutPublished events.
 * ==============================================================================
 */

export class HallAnalyticsService {
  private static instance: HallAnalyticsService | null = null;
  private analyticsRepo = hallAnalyticsRepository;
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private inventoryRepo = seatInventoryIntegrationRepository;
  private eventBus = hallDesignerEventBus;
  private auditService = securityAuditService;

  private constructor() {
    this.registerEventSubscribers();
  }

  public static getInstance(): HallAnalyticsService {
    if (!HallAnalyticsService.instance) {
      HallAnalyticsService.instance = new HallAnalyticsService();
    }
    return HallAnalyticsService.instance;
  }

  // ----------------------------------------------------------------------------
  // Event-Driven Projection Subscription
  // ----------------------------------------------------------------------------

  private registerEventSubscribers(): void {
    this.eventBus.subscribe<{ hallId?: string; publishedVersionId?: string }>({
      eventType: "LayoutPublished",
      subscriberName: "HallAnalyticsAutoProjection",
      priority: 20,
      listener: async (event) => {
        const cfg = this.analyticsRepo.getConfiguration(event.theatreId);
        if (!cfg.autoRefreshOnPublish) return;
        const hallId = event.hallId || event.payload.hallId;
        const versionId = event.payload.publishedVersionId;
        if (!hallId || !versionId) return;

        const systemActor: SecurityActorContext = {
          userId: event.actorId || "system-analytics",
          role: "SUPER_ADMIN",
          theatreId: event.theatreId,
          permissions: ["analytics:manage"],
          correlationId: event.correlationId || event.eventId,
        };
        await this.generateAnalytics(systemActor, {
          theatreId: event.theatreId,
          hallId,
          layoutVersionId: versionId,
          forceRefresh: true,
        });
      },
    });
  }

  // ----------------------------------------------------------------------------
  // 1. Generate & Refresh Analytics (Projection Layer)
  // ----------------------------------------------------------------------------

  public async generateAnalytics(
    actor: SecurityActorContext,
    params: {
      theatreId: string;
      hallId: string;
      layoutVersionId?: string;
      showId?: string;
      forceRefresh?: boolean;
    }
  ): Promise<HallAnalyticsReport> {
    const { theatreId, hallId, showId, forceRefresh = false } = params;
    this.assertTenantAccess(actor, theatreId);
    this.assertAnalyticsViewerRole(actor);

    const config = this.analyticsRepo.getConfiguration(theatreId);

    // 1. Resolve Published (or Archived) Immutable Layout Version
    let targetVersionId = params.layoutVersionId;
    if (!targetVersionId) {
      const published = this.designerRepo.getPublishedLayoutForHall(hallId, theatreId);
      if (published) {
        targetVersionId = published.id;
      } else {
        const defs = this.designerRepo.listLayoutDefinitions(theatreId, hallId);
        const primary = defs[0];
        if (!primary || !primary.currentPublishedVersionId) {
          throw new NotFoundError(
            `Cannot generate analytics: No published layout version exists for hall '${hallId}'.`
          );
        }
        targetVersionId = primary.currentPublishedVersionId;
      }
    }

    // 2. Precomputed Cache Hit (when not force-refreshing)
    if (!forceRefresh && !showId) {
      const cached = this.analyticsRepo.getReportByVersion(theatreId, targetVersionId);
      if (cached) {
        return cached;
      }
    }

    const version = this.designerRepo.getLayoutVersionById(targetVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${targetVersionId}' not found for theatre '${theatreId}'.`);
    }

    // Enforce Immutable Source Invariant (reject editable DRAFT layouts)
    if (version.status !== "PUBLISHED" && version.status !== "ARCHIVED") {
      throw new ValidationError(
        `Immutable Projection Invariant Violation: Analytics cannot operate on '${version.status}' layout '${version.id}'. Only PUBLISHED or ARCHIVED versions are eligible.`
      );
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(theatreId, version.id);

    // 3. Optionally bind Immutable Seat Inventory Snapshot
    const snapshots = showId
      ? this.inventoryRepo.getSnapshots(showId, theatreId)
      : this.inventoryRepo.listSnapshotsByTheatre(theatreId).filter((s) => s.hallId === hallId);
    const latestInventorySnapshot = snapshots[0];

    // 4. Build historical trend from previous analytics snapshots
    const prevSnaps = this.analyticsRepo.listSnapshotsByHall(theatreId, hallId);
    const historicalTrend = prevSnaps.slice(0, 10).map((s) => ({
      layoutVersionNumber: s.layoutVersionNumber,
      layoutVersionId: s.layoutVersionId,
      recordedAt: s.createdAt,
      totalSeats: s.totalSeats,
      vipRatioPercent: s.snapshotPayload.capacity.vipRatioPercent,
      overallDesignHealth: s.overallDesignHealth,
      maxPotentialRevenue: s.maxPotentialRevenue,
    }));

    // 5. Compute Complete Projection & Report
    const { projection, report } = HallAnalyticsEngine.generateCompleteReport({
      theatreId,
      hallId,
      layoutVersion: version,
      structuralObjects,
      inventorySnapshot: latestInventorySnapshot,
      historicalTrend: historicalTrend.length > 0 ? historicalTrend : undefined,
      currency: config.defaultCurrency,
      baseShowPrice: config.defaultBaseShowPrice,
      actorId: actor.userId,
    });

    this.analyticsRepo.saveProjection(projection);
    this.analyticsRepo.saveReport(report);

    const snapshot: HallAnalyticsSnapshot = {
      id: `asnap-${report.id}`,
      analyticsId: report.id,
      projectionId: projection.id,
      theatreId,
      hallId,
      layoutVersionId: version.id,
      layoutVersionNumber: version.versionNumber,
      totalSeats: report.capacity.totalSeats,
      overallDesignHealth: report.layoutHealth.overallDesignHealth,
      maxPotentialRevenue: report.revenueSimulation.maxPotentialGrossRevenue,
      snapshotPayload: report,
      createdAt: report.generatedAt,
      createdBy: actor.userId,
    };
    this.analyticsRepo.recordSnapshot(snapshot);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_ANALYTICS",
      action: forceRefresh ? "REFRESH_ANALYTICS" : "GENERATE_ANALYTICS",
      description: `Projected immutable hall analytics for hall '${hallId}' (v${version.versionNumber}, Health: ${report.layoutHealth.overallDesignHealth}/100)`,
      metadata: {
        hallId,
        layoutVersionId: version.id,
        projectionId: projection.id,
        overallDesignHealth: report.layoutHealth.overallDesignHealth,
      },
    });

    await this.eventBus.publish({
      eventType: "AnalyticsProjectionRefreshed",
      theatreId,
      hallId,
      actorId: actor.userId,
      correlationId: actor.correlationId,
      payload: {
        analyticsId: report.id,
        projectionId: projection.id,
        layoutVersionId: version.id,
        overallDesignHealth: report.layoutHealth.overallDesignHealth,
      },
    });

    return report;
  }

  public async refreshAnalytics(
    actor: SecurityActorContext,
    params: { theatreId: string; hallId: string; layoutVersionId?: string; showId?: string }
  ): Promise<HallAnalyticsReport> {
    return this.generateAnalytics(actor, { ...params, forceRefresh: true });
  }

  // ----------------------------------------------------------------------------
  // 2. Run On-Demand Occupancy & Revenue Simulations (Strictly Read-Only)
  // ----------------------------------------------------------------------------

  public async runSimulations(
    actor: SecurityActorContext,
    input: RevenueSimulationInput
  ): Promise<{
    occupancy: OccupancySimulationResult | null;
    revenue: RevenueSimulationResult | null;
  }> {
    this.assertTenantAccess(actor, input.theatreId);
    this.assertAnalyticsViewerRole(actor);

    const config = this.analyticsRepo.getConfiguration(input.theatreId);

    let targetVersionId = input.layoutVersionId;
    if (!targetVersionId) {
      const published = this.designerRepo.getPublishedLayoutForHall(input.hallId, input.theatreId);
      if (!published) {
        throw new NotFoundError(`No published layout found for hall '${input.hallId}'.`);
      }
      targetVersionId = published.id;
    }

    const version = this.designerRepo.getLayoutVersionById(targetVersionId, input.theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${targetVersionId}' not found.`);
    }
    if (version.status !== "PUBLISHED" && version.status !== "ARCHIVED") {
      throw new ValidationError(
        `Simulations require an immutable PUBLISHED or ARCHIVED layout version (received '${version.status}').`
      );
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(
      input.theatreId,
      version.id
    );

    const occupancy = config.occupancySimulationEnabled
      ? HallAnalyticsEngine.runOccupancySimulation(input.hallId, version, structuralObjects)
      : null;

    const revenue = config.revenueSimulationEnabled
      ? HallAnalyticsEngine.runRevenueSimulation(version, {
          ...input,
          layoutVersionId: version.id,
          currency: input.currency || config.defaultCurrency,
          baseShowPrice: input.baseShowPrice ?? config.defaultBaseShowPrice,
        })
      : null;

    await this.auditService.recordAudit({
      actor,
      module: "HALL_ANALYTICS",
      action: "RUN_SIMULATIONS",
      description: `Executed read-only occupancy/revenue simulations for hall '${input.hallId}'`,
      metadata: {
        hallId: input.hallId,
        layoutVersionId: version.id,
        occupancyRan: Boolean(occupancy),
        revenueRan: Boolean(revenue),
      },
    });

    return { occupancy, revenue };
  }

  // ----------------------------------------------------------------------------
  // 3. Load Multi-Hall Analytics Dashboard & Export Placeholder
  // ----------------------------------------------------------------------------

  public async loadDashboard(
    actor: SecurityActorContext,
    theatreId: string,
    hallId?: string
  ): Promise<HallAnalyticsDashboardData> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAnalyticsViewerRole(actor);

    const configuration = this.analyticsRepo.getConfiguration(theatreId);
    let reports = this.analyticsRepo.listReportsByTheatre(theatreId, hallId);

    // Lazily project any published layout definitions that don't yet have a report
    if (reports.length === 0) {
      const defs = this.designerRepo.listLayoutDefinitions(theatreId, hallId);
      for (const def of defs) {
        if (def.currentPublishedVersionId) {
          await this.generateAnalytics(actor, {
            theatreId,
            hallId: def.hallId,
            layoutVersionId: def.currentPublishedVersionId,
          });
        }
      }
      reports = this.analyticsRepo.listReportsByTheatre(theatreId, hallId);
    }

    const totalHallsAnalyzed = reports.length;
    const totalCircuitSeats = reports.reduce((acc, r) => acc + r.capacity.totalSeats, 0);
    const averageDesignHealth =
      totalHallsAnalyzed > 0
        ? Math.round(
            reports.reduce((acc, r) => acc + r.layoutHealth.overallDesignHealth, 0) /
              totalHallsAnalyzed
          )
        : 0;
    const averageAccessibilityScore =
      totalHallsAnalyzed > 0
        ? Math.round(
            reports.reduce((acc, r) => acc + r.accessibility.accessibilityScore, 0) /
              totalHallsAnalyzed
          )
        : 0;
    const averageVipRatioPercent =
      totalHallsAnalyzed > 0
        ? Number(
            (
              reports.reduce((acc, r) => acc + r.capacity.vipRatioPercent, 0) /
              totalHallsAnalyzed
            ).toFixed(2)
          )
        : 0;
    const combinedMaxPotentialRevenue = Number(
      reports
        .reduce((acc, r) => acc + r.revenueSimulation.maxPotentialGrossRevenue, 0)
        .toFixed(2)
    );

    return {
      theatreId,
      configuration,
      reports,
      latestSnapshotCount: this.analyticsRepo.countSnapshotsByTheatre(theatreId),
      aggregateMetrics: {
        totalHallsAnalyzed,
        totalCircuitSeats,
        averageDesignHealth,
        averageAccessibilityScore,
        averageVipRatioPercent,
        combinedMaxPotentialRevenue,
        currency: configuration.defaultCurrency,
      },
      loadedAt: new Date().toISOString(),
    };
  }

  public async exportAnalyticsPlaceholder(
    actor: SecurityActorContext,
    theatreId: string,
    format: HallAnalyticsExportEnvelope["format"] = "JSON",
    hallId?: string
  ): Promise<HallAnalyticsExportEnvelope> {
    const dashboard = await this.loadDashboard(actor, theatreId, hallId);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_ANALYTICS",
      action: "EXPORT_ANALYTICS",
      description: `Exported ${dashboard.reports.length} hall analytics report(s) in '${format}' format`,
      metadata: { theatreId, format, reportsCount: dashboard.reports.length },
    });

    return {
      schemaVersion: "1.0",
      format,
      theatreId,
      exportedAt: new Date().toISOString(),
      exportedBy: actor.userId,
      reportsCount: dashboard.reports.length,
      reports: dashboard.reports,
    };
  }

  // ----------------------------------------------------------------------------
  // 4. Per-Theatre Configuration
  // ----------------------------------------------------------------------------

  public async getConfiguration(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<HallAnalyticsConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertAnalyticsViewerRole(actor);
    return this.analyticsRepo.getConfiguration(theatreId);
  }

  public async updateConfiguration(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<HallAnalyticsConfiguration>
  ): Promise<HallAnalyticsConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError("Only Super Admins or Theatre Admins can update analytics policies.");
    }

    const updated = this.analyticsRepo.updateConfiguration(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "HALL_ANALYTICS",
      action: "UPDATE_CONFIG",
      description: `Updated Hall Analytics configuration for theatre '${theatreId}'`,
      metadata: { theatreId },
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Security Helpers
  // ----------------------------------------------------------------------------

  private assertTenantAccess(actor: SecurityActorContext, theatreId: string): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Security Violation: User '${actor.userId}' cannot access hall analytics for theatre '${theatreId}'.`
      );
    }
  }

  private assertAnalyticsViewerRole(actor: SecurityActorContext): void {
    if (
      actor.role !== "SUPER_ADMIN" &&
      actor.role !== "THEATRE_ADMIN" &&
      actor.role !== "HALL_MANAGER"
    ) {
      throw new AuthorizationError(
        "Action forbidden: Hall analytics are restricted to Super Admins, Theatre Admins, and Hall Managers."
      );
    }
  }
}

export const hallAnalyticsService = HallAnalyticsService.getInstance();
