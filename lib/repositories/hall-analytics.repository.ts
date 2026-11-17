import {
  HallAnalyticsProjection,
  HallAnalyticsReport,
  HallAnalyticsSnapshot,
  HallAnalyticsConfiguration,
} from "@/types/hall-analytics.types";
import { TenantAccessError } from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Repository (Phase 4 – Part 15)
 * ==============================================================================
 * Multi-tenant persistence store for immutable analytics projections,
 * precomputed materialized analytics reports, historical snapshots, and
 * independent per-theatre analytics governance configurations.
 * ==============================================================================
 */

export class HallAnalyticsRepository {
  private static instance: HallAnalyticsRepository | null = null;

  private projections: Map<string, HallAnalyticsProjection> = new Map();
  private reportsByVersionKey: Map<string, HallAnalyticsReport> = new Map(); // Key: `${theatreId}:${layoutVersionId}`
  private snapshotsByHallKey: Map<string, HallAnalyticsSnapshot[]> = new Map(); // Key: `${theatreId}:${hallId}`
  private configurations: Map<string, HallAnalyticsConfiguration> = new Map(); // Key: theatreId

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): HallAnalyticsRepository {
    if (!HallAnalyticsRepository.instance) {
      HallAnalyticsRepository.instance = new HallAnalyticsRepository();
    }
    return HallAnalyticsRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Projections & Precomputed Reports
  // ----------------------------------------------------------------------------

  public saveProjection(projection: HallAnalyticsProjection): HallAnalyticsProjection {
    this.projections.set(projection.id, projection);
    return projection;
  }

  public getProjectionById(projectionId: string, theatreId: string): HallAnalyticsProjection | undefined {
    const proj = this.projections.get(projectionId);
    if (!proj) return undefined;
    if (proj.theatreId !== theatreId) {
      throw new TenantAccessError(`Projection '${projectionId}' is restricted to theatre '${proj.theatreId}'.`);
    }
    return proj;
  }

  public saveReport(report: HallAnalyticsReport): HallAnalyticsReport {
    const key = `${report.theatreId}:${report.layoutVersionId}`;
    this.reportsByVersionKey.set(key, report);
    return report;
  }

  public getReportByVersion(theatreId: string, layoutVersionId: string): HallAnalyticsReport | undefined {
    return this.reportsByVersionKey.get(`${theatreId}:${layoutVersionId}`);
  }

  public listReportsByTheatre(theatreId: string, hallId?: string): HallAnalyticsReport[] {
    return Array.from(this.reportsByVersionKey.values())
      .filter((r) => {
        if (r.theatreId !== theatreId) return false;
        if (hallId && r.hallId !== hallId) return false;
        return true;
      })
      .sort((a, b) => b.refreshedAt.localeCompare(a.refreshedAt));
  }

  // ----------------------------------------------------------------------------
  // 2. Append-Only Immutable Snapshots
  // ----------------------------------------------------------------------------

  public recordSnapshot(snapshot: HallAnalyticsSnapshot): HallAnalyticsSnapshot {
    const key = `${snapshot.theatreId}:${snapshot.hallId}`;
    const list = this.snapshotsByHallKey.get(key) || [];
    list.unshift(snapshot);
    this.snapshotsByHallKey.set(key, list);
    return snapshot;
  }

  public listSnapshotsByHall(theatreId: string, hallId: string): HallAnalyticsSnapshot[] {
    return this.snapshotsByHallKey.get(`${theatreId}:${hallId}`) || [];
  }

  public countSnapshotsByTheatre(theatreId: string): number {
    let total = 0;
    for (const [key, list] of this.snapshotsByHallKey.entries()) {
      if (key.startsWith(`${theatreId}:`)) {
        total += list.length;
      }
    }
    return total;
  }

  // ----------------------------------------------------------------------------
  // 3. Per-Theatre Analytics Configurations
  // ----------------------------------------------------------------------------

  public getConfiguration(theatreId: string): HallAnalyticsConfiguration {
    const existing = this.configurations.get(theatreId);
    if (existing) return existing;

    const standard: HallAnalyticsConfiguration = {
      theatreId,
      revenueSimulationEnabled: true,
      accessibilityReportsEnabled: true,
      vipAnalyticsEnabled: true,
      premiumLayoutMetricsEnabled: true,
      occupancySimulationEnabled: true,
      customKpiDashboardEnabled: false,
      advancedCapacityAnalysisEnabled: false,
      autoRefreshOnPublish: true,
      cacheTtlSeconds: 300,
      defaultCurrency: "INR",
      defaultBaseShowPrice: 250,
      backgroundJobSchedulePlaceholder: "0 */6 * * *",
      customKpiKeys: ["REVPAS", "VIP_RATIO", "DESIGN_HEALTH"],
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(theatreId, standard);
    return standard;
  }

  public updateConfiguration(
    theatreId: string,
    updates: Partial<HallAnalyticsConfiguration>
  ): HallAnalyticsConfiguration {
    const current = this.getConfiguration(theatreId);
    const updated: HallAnalyticsConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configurations.set(theatreId, updated);
    return updated;
  }

  // ----------------------------------------------------------------------------
  // Seed Initial Multi-Tenant Analytics Policies
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    const now = "2026-11-18T00:00:00Z";

    // Theatre A (Pune — th-pun-001): Revenue Simulation ON, Accessibility Reports ON, VIP Analytics ON
    this.configurations.set("th-pun-001", {
      theatreId: "th-pun-001",
      revenueSimulationEnabled: true,
      accessibilityReportsEnabled: true,
      vipAnalyticsEnabled: true,
      premiumLayoutMetricsEnabled: true,
      occupancySimulationEnabled: true,
      customKpiDashboardEnabled: false,
      advancedCapacityAnalysisEnabled: true,
      autoRefreshOnPublish: true,
      cacheTtlSeconds: 300,
      defaultCurrency: "INR",
      defaultBaseShowPrice: 250,
      backgroundJobSchedulePlaceholder: "0 */4 * * *",
      customKpiKeys: ["REVPAS", "VIP_RATIO", "ACCESSIBILITY_SCORE", "DESIGN_HEALTH"],
      updatedAt: now,
    });

    // Theatre B (Mumbai — th-mum-002): Premium Layout Metrics ON, Occupancy Simulation ON
    this.configurations.set("th-mum-002", {
      theatreId: "th-mum-002",
      revenueSimulationEnabled: false,
      accessibilityReportsEnabled: true,
      vipAnalyticsEnabled: false,
      premiumLayoutMetricsEnabled: true,
      occupancySimulationEnabled: true,
      customKpiDashboardEnabled: false,
      advancedCapacityAnalysisEnabled: false,
      autoRefreshOnPublish: true,
      cacheTtlSeconds: 600,
      defaultCurrency: "USD",
      defaultBaseShowPrice: 18,
      backgroundJobSchedulePlaceholder: "0 2 * * *",
      customKpiKeys: ["PREMIUM_DISTRIBUTION", "OCCUPANCY_EGRESS"],
      updatedAt: now,
    });

    // Theatre C (Dubai — th-dxb-003): Custom KPI Dashboard ON, Advanced Capacity Analysis ON
    this.configurations.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      revenueSimulationEnabled: true,
      accessibilityReportsEnabled: true,
      vipAnalyticsEnabled: true,
      premiumLayoutMetricsEnabled: true,
      occupancySimulationEnabled: true,
      customKpiDashboardEnabled: true,
      advancedCapacityAnalysisEnabled: true,
      autoRefreshOnPublish: true,
      cacheTtlSeconds: 180,
      defaultCurrency: "AED",
      defaultBaseShowPrice: 65,
      backgroundJobSchedulePlaceholder: "*/30 * * * *",
      customKpiKeys: [
        "REVPAS",
        "LUXURY_BOX_YIELD",
        "ADVANCED_CAPACITY_RATIO",
        "VIP_RATIO",
        "DESIGN_HEALTH",
      ],
      updatedAt: now,
    });
  }
}

export const hallAnalyticsRepository = HallAnalyticsRepository.getInstance();
