/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Domain Types (Phase 4 – Part 15)
 * ==============================================================================
 * Analytics Projection Model: Analytics strictly consume immutable published
 * layout versions and seat inventory snapshots rather than editable drafts.
 * Ensures historical accuracy, scalability, and zero mutation of live pricing.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Capacity & Section Analytics
// ------------------------------------------------------------------------------

export interface CapacityAnalytics {
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  bookedSeats: number;
  blockedSeats: number;
  maintenanceSeats: number;
  premiumSeats: number;
  standardSeats: number;
  vipSeats: number;
  reclinerSeats: number;
  coupleSeats: number;
  accessibleSeats: number;
  companionSeats: number;
  vipRatioPercent: number;
  premiumRatioPercent: number;
  accessibilityRatioPercent: number;
  sectionCapacities: Array<{
    sectionId: string;
    sectionName: string;
    seatCount: number;
    sharePercent: number;
  }>;
  rowCapacities: Array<{
    sectionId: string;
    rowCode: string;
    seatCount: number;
  }>;
}

export interface SectionAnalyticsItem {
  sectionId: string;
  sectionName: string;
  primarySeatType: string;
  displayColor: string;
  seatCount: number;
  shareOfHallPercent: number;
  categoryDistribution: Record<string, number>;
  accessibleSeatCount: number;
  accessibilityCoveragePercent: number;
  premiumSeatCount: number;
  premiumDistributionPercent: number;
  averageDensityPerRow: number;
  rowCount: number;
}

// ------------------------------------------------------------------------------
// 2. Seat Distribution & Accessibility Analytics
// ------------------------------------------------------------------------------

export interface SeatDistributionZoneStat {
  zone: "FRONT" | "MIDDLE" | "REAR" | "LEFT_WING" | "CENTER" | "RIGHT_WING";
  seatCount: number;
  sharePercent: number;
  premiumSeats: number;
}

export interface SeatHeatmapCellPlaceholder {
  gridX: number;
  gridY: number;
  seatCount: number;
  intensityScore: number; // 0..100 placeholder for future occupancy heatmaps
}

export interface SeatDistributionAnalytics {
  categoryBreakdown: Array<{
    category: string;
    count: number;
    ratioPercent: number;
  }>;
  seatRatios: Record<string, number>;
  zoneStatistics: SeatDistributionZoneStat[];
  heatmapPlaceholder: {
    status: "READY_FOR_HISTORICAL_INGESTION";
    gridColumns: number;
    gridRows: number;
    cells: SeatHeatmapCellPlaceholder[];
  };
}

export interface AccessibilityAnalytics {
  accessibleSeats: number;
  companionSeats: number;
  accessibleRoutesCount: number;
  emergencyExitsCount: number;
  accessibilityRatioPercent: number;
  accessibilityScore: number; // 0..100
  compliancePlaceholder: {
    standard: "ADA_2010_AND_ISO_21542";
    minimumRequiredAccessibleSeats: number;
    meetsMinimumSeatCount: boolean;
    hasCompanionPairing: boolean;
    hasAccessiblePath: boolean;
    status: "COMPLIANT" | "NEEDS_REVIEW" | "NON_COMPLIANT";
    notes: string[];
  };
}

// ------------------------------------------------------------------------------
// 3. Occupancy & Revenue Simulations (Strictly Read-Only)
// ------------------------------------------------------------------------------

export type OccupancyScenarioCode =
  | "LOW_25"
  | "MODERATE_50"
  | "HIGH_75"
  | "FULL_100"
  | "PEAK_LOAD";

export interface OccupancySimulationScenario {
  code: OccupancyScenarioCode;
  label: string;
  targetOccupancyPercent: number;
  occupiedSeats: number;
  emptySeats: number;
  vipOccupiedSeats: number;
  accessibleOccupiedSeats: number;
  estimatedEgressSecondsPlaceholder: number;
  congestionRiskLevel: "LOW" | "MODERATE" | "ELEVATED" | "PEAK";
}

export interface OccupancySimulationResult {
  hallId: string;
  layoutVersionId: string;
  totalSellableSeats: number;
  scenarios: OccupancySimulationScenario[];
  emergencyEvacuationPlaceholder: {
    exitCount: number;
    estimatedFullClearanceSeconds: number;
    complianceThresholdSeconds: number;
    status: "ESTIMATED_SAFE" | "REQUIRES_ENGINEER_REVIEW";
  };
  simulatedAt: string;
}

export interface RevenueSimulationInput {
  theatreId: string;
  hallId: string;
  layoutVersionId?: string;
  showId?: string;
  occupancyPercentages?: number[]; // e.g. [25, 50, 75, 100]
  baseShowPrice?: number;
  showTimeMultiplier?: number;     // e.g. 1.0 (Standard), 1.25 (Prime Evening)
  dayTypeMultiplier?: number;      // e.g. 1.0 (Weekday), 1.20 (Weekend)
  currency?: string;
  convenienceFeePerSeat?: number;
  gstPercent?: number;
}

export interface RevenueSimulationTierBreakdown {
  category: string;
  seatCount: number;
  averageUnitPrice: number;
  grossTicketRevenueAt100: number;
}

export interface RevenueSimulationScenario {
  occupancyPercent: number;
  projectedSeatsSold: number;
  netTicketRevenue: number;
  convenienceFeeRevenue: number;
  estimatedTaxAmount: number;
  grossProjectedRevenue: number;
  averageTicketPrice: number;
  revPAS: number; // Revenue Per Available Seat
}

export interface RevenueSimulationResult {
  theatreId: string;
  hallId: string;
  layoutVersionId: string;
  currency: string;
  isReadOnlyProjection: true; // Guarantees zero mutation to pricing/bookings
  maxPotentialGrossRevenue: number;
  categoryBreakdown: RevenueSimulationTierBreakdown[];
  scenarios: RevenueSimulationScenario[];
  businessRulesApplied: {
    baseShowPrice: number;
    showTimeMultiplier: number;
    dayTypeMultiplier: number;
    convenienceFeePerSeat: number;
    gstPercent: number;
  };
  simulatedAt: string;
}

// ------------------------------------------------------------------------------
// 4. Layout Health, Optimization & Historical Trend Placeholders
// ------------------------------------------------------------------------------

export interface OptimizationSuggestionPlaceholder {
  id: string;
  category: "CAPACITY" | "ACCESSIBILITY" | "REVENUE" | "GEOMETRY" | "SAFETY";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  estimatedImpact: string;
}

export interface HistoricalTrendPointPlaceholder {
  layoutVersionNumber: number;
  layoutVersionId: string;
  recordedAt: string;
  totalSeats: number;
  vipRatioPercent: number;
  overallDesignHealth: number;
  maxPotentialRevenue: number;
}

export interface LayoutHealthScore {
  seatDensityScore: number;       // 0..100
  accessibilityScore: number;     // 0..100
  geometryQuality: number;        // 0..100
  sectionBalance: number;         // 0..100
  validationScore: number;        // 0..100
  overallDesignHealth: number;    // 0..100 weighted composite
  grade: "A+" | "A" | "B" | "C" | "D";
  optimizationSuggestions: OptimizationSuggestionPlaceholder[];
}

// ------------------------------------------------------------------------------
// 5. Projection, Snapshot, Analytics Report & Per-Theatre Configuration
// ------------------------------------------------------------------------------

export interface HallAnalyticsProjection {
  id: string;
  theatreId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  sourceStatus: "PUBLISHED" | "ARCHIVED";
  inventorySnapshotId?: string;
  showId?: string;
  projectedAt: string;
  projectedBy: string;
  seatCount: number;
  sectionCount: number;
  structuralObjectCount: number;
  checksum: string;
}

export interface HallAnalyticsReport {
  id: string;
  projectionId: string;
  theatreId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  inventorySnapshotId?: string;
  capacity: CapacityAnalytics;
  sections: SectionAnalyticsItem[];
  seatDistribution: SeatDistributionAnalytics;
  accessibility: AccessibilityAnalytics;
  occupancySimulation: OccupancySimulationResult;
  revenueSimulation: RevenueSimulationResult;
  layoutHealth: LayoutHealthScore;
  historicalTrendPlaceholder: HistoricalTrendPointPlaceholder[];
  generatedAt: string;
  generatedBy: string;
  refreshedAt: string;
  isPrecomputed: boolean;
}

export interface HallAnalyticsSnapshot {
  id: string;
  analyticsId: string;
  projectionId: string;
  theatreId: string;
  hallId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  totalSeats: number;
  overallDesignHealth: number;
  maxPotentialRevenue: number;
  snapshotPayload: HallAnalyticsReport;
  createdAt: string;
  createdBy: string;
}

export interface HallAnalyticsConfiguration {
  theatreId: string;
  revenueSimulationEnabled: boolean;
  accessibilityReportsEnabled: boolean;
  vipAnalyticsEnabled: boolean;
  premiumLayoutMetricsEnabled: boolean;
  occupancySimulationEnabled: boolean;
  customKpiDashboardEnabled: boolean;
  advancedCapacityAnalysisEnabled: boolean;
  autoRefreshOnPublish: boolean;
  cacheTtlSeconds: number;
  defaultCurrency: string;
  defaultBaseShowPrice: number;
  backgroundJobSchedulePlaceholder: string; // e.g. "0 */6 * * *"
  customKpiKeys: string[];
  updatedAt: string;
}

export interface HallAnalyticsDashboardData {
  theatreId: string;
  configuration: HallAnalyticsConfiguration;
  reports: HallAnalyticsReport[];
  latestSnapshotCount: number;
  aggregateMetrics: {
    totalHallsAnalyzed: number;
    totalCircuitSeats: number;
    averageDesignHealth: number;
    averageAccessibilityScore: number;
    averageVipRatioPercent: number;
    combinedMaxPotentialRevenue: number;
    currency: string;
  };
  loadedAt: string;
}

export interface HallAnalyticsExportEnvelope {
  schemaVersion: "1.0";
  format: "JSON" | "CSV_PLACEHOLDER" | "PDF_PLACEHOLDER";
  theatreId: string;
  exportedAt: string;
  exportedBy: string;
  reportsCount: number;
  reports: HallAnalyticsReport[];
}
