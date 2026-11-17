import crypto from "crypto";
import { LayoutVersion } from "@/types/hall-designer.types";
import { StructuralObject } from "@/types/structural-objects.types";
import {
  InventorySnapshotRecord,
  SeatInventoryItem,
} from "@/types/seat-inventory-integration.types";
import { SeatInventoryEngine } from "@/lib/engine/seat-inventory-engine";
import {
  HallAnalyticsProjection,
  HallAnalyticsReport,
  CapacityAnalytics,
  SectionAnalyticsItem,
  SeatDistributionAnalytics,
  SeatDistributionZoneStat,
  SeatHeatmapCellPlaceholder,
  AccessibilityAnalytics,
  OccupancySimulationResult,
  OccupancySimulationScenario,
  RevenueSimulationInput,
  RevenueSimulationResult,
  RevenueSimulationScenario,
  RevenueSimulationTierBreakdown,
  LayoutHealthScore,
  OptimizationSuggestionPlaceholder,
  HistoricalTrendPointPlaceholder,
} from "@/types/hall-analytics.types";
import { ValidationError } from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Hall Analytics Projection & Simulation Engine (Phase 4 – Part 15)
 * ==============================================================================
 * Pure, stateless mathematical analytics engine operating strictly on immutable
 * published layout versions and seat inventory snapshots. Never reads editable
 * drafts and never mutates live pricing or booking state.
 * ==============================================================================
 */

export class HallAnalyticsEngine {
  /**
   * Step 1: Build an immutable Analytics Projection from a published/archived
   * LayoutVersion and optional immutable SeatInventorySnapshot.
   */
  public static buildProjection(params: {
    theatreId: string;
    hallId: string;
    layoutVersion: LayoutVersion;
    structuralObjects: StructuralObject[];
    inventorySnapshot?: InventorySnapshotRecord;
    actorId: string;
  }): HallAnalyticsProjection {
    const { theatreId, hallId, layoutVersion, structuralObjects, inventorySnapshot, actorId } = params;

    if (layoutVersion.status !== "PUBLISHED" && layoutVersion.status !== "ARCHIVED") {
      throw new ValidationError(
        `Immutable Projection Invariant Violation: Analytics cannot project from '${layoutVersion.status}' layout version '${layoutVersion.id}'. Publish the layout first.`
      );
    }

    const checksumSeed = `${theatreId}:${hallId}:${layoutVersion.id}:${layoutVersion.seats.length}:${structuralObjects.length}:${inventorySnapshot?.id || "none"}`;
    const checksum = crypto.createHash("sha256").update(checksumSeed).digest("hex").substring(0, 24);

    return {
      id: `proj-${layoutVersion.id}-${Date.now().toString(36)}`,
      theatreId,
      hallId,
      layoutDefinitionId: layoutVersion.layoutDefinitionId,
      layoutVersionId: layoutVersion.id,
      layoutVersionNumber: layoutVersion.versionNumber,
      sourceStatus: layoutVersion.status,
      inventorySnapshotId: inventorySnapshot?.id,
      showId: inventorySnapshot?.showId,
      projectedAt: new Date().toISOString(),
      projectedBy: actorId,
      seatCount: layoutVersion.seats.length,
      sectionCount: layoutVersion.sections.length,
      structuralObjectCount: structuralObjects.length,
      checksum,
    };
  }

  /**
   * Step 2: Capacity Analytics (Total, Available, Reserved, Booked, Premium, Accessible, Companion)
   */
  public static computeCapacityAnalytics(
    layoutVersion: LayoutVersion,
    inventoryItems?: SeatInventoryItem[]
  ): CapacityAnalytics {
    const seats = layoutVersion.seats;
    const totalSeats = seats.length;

    const availableSeats = inventoryItems
      ? inventoryItems.filter((i) => i.status === "AVAILABLE").length
      : totalSeats;
    const reservedSeats = inventoryItems
      ? inventoryItems.filter((i) => i.status === "RESERVED").length
      : 0;
    const bookedSeats = inventoryItems
      ? inventoryItems.filter((i) => i.status === "BOOKED").length
      : 0;
    const blockedSeats = inventoryItems
      ? inventoryItems.filter((i) => i.status === "BLOCKED").length
      : 0;
    const maintenanceSeats = inventoryItems
      ? inventoryItems.filter((i) => i.status === "MAINTENANCE" || i.status === "DISABLED").length
      : 0;

    const standardSeats = seats.filter((s) => s.seatType === "Standard").length;
    const vipSeats = seats.filter((s) => s.seatType === "VIP").length;
    const reclinerSeats = seats.filter((s) => s.seatType === "Recliner").length;
    const coupleSeats = seats.filter((s) => s.seatType === "Couple").length;
    const accessibleSeats = seats.filter((s) => s.seatType === "Wheelchair" || s.isAccessible).length;
    const companionSeats = seats.filter((s) => Boolean(s.companionSeatId)).length;
    const premiumSeats = vipSeats + reclinerSeats + coupleSeats;

    const pct = (n: number) => (totalSeats > 0 ? Number(((n / totalSeats) * 100).toFixed(2)) : 0);

    const sectionNameMap = new Map(layoutVersion.sections.map((s) => [s.id, s.name]));
    const sectionCounts = new Map<string, number>();
    const rowCounts = new Map<string, { sectionId: string; rowCode: string; seatCount: number }>();

    for (const seat of seats) {
      sectionCounts.set(seat.sectionId, (sectionCounts.get(seat.sectionId) || 0) + 1);
      const rk = `${seat.sectionId}::${seat.row}`;
      const existingRow = rowCounts.get(rk);
      if (existingRow) {
        existingRow.seatCount++;
      } else {
        rowCounts.set(rk, { sectionId: seat.sectionId, rowCode: seat.row, seatCount: 1 });
      }
    }

    const sectionCapacities = layoutVersion.sections.map((sec) => {
      const count = sectionCounts.get(sec.id) || 0;
      return {
        sectionId: sec.id,
        sectionName: sectionNameMap.get(sec.id) || sec.name,
        seatCount: count,
        sharePercent: pct(count),
      };
    });

    return {
      totalSeats,
      availableSeats,
      reservedSeats,
      bookedSeats,
      blockedSeats,
      maintenanceSeats,
      premiumSeats,
      standardSeats,
      vipSeats,
      reclinerSeats,
      coupleSeats,
      accessibleSeats,
      companionSeats,
      vipRatioPercent: pct(vipSeats),
      premiumRatioPercent: pct(premiumSeats),
      accessibilityRatioPercent: pct(accessibleSeats),
      sectionCapacities,
      rowCapacities: Array.from(rowCounts.values()),
    };
  }

  /**
   * Step 3: Per-Section Analytics (Seat Count, Category Distribution, Accessibility, Density)
   */
  public static computeSectionAnalytics(layoutVersion: LayoutVersion): SectionAnalyticsItem[] {
    const totalHallSeats = layoutVersion.seats.length;

    return layoutVersion.sections.map((sec) => {
      const sectionSeats = layoutVersion.seats.filter((s) => s.sectionId === sec.id);
      const seatCount = sectionSeats.length;

      const categoryDistribution: Record<string, number> = {};
      const distinctRows = new Set<string>();
      let accessibleSeatCount = 0;
      let premiumSeatCount = 0;

      for (const s of sectionSeats) {
        const key = s.seatType || "Standard";
        categoryDistribution[key] = (categoryDistribution[key] || 0) + 1;
        distinctRows.add(s.row);
        if (s.seatType === "Wheelchair" || s.isAccessible) accessibleSeatCount++;
        if (s.seatType === "VIP" || s.seatType === "Recliner" || s.seatType === "Couple") {
          premiumSeatCount++;
        }
      }

      const rowCount = Math.max(distinctRows.size, 1);

      return {
        sectionId: sec.id,
        sectionName: sec.name,
        primarySeatType: sec.seatType,
        displayColor: sec.displayColor,
        seatCount,
        shareOfHallPercent:
          totalHallSeats > 0 ? Number(((seatCount / totalHallSeats) * 100).toFixed(2)) : 0,
        categoryDistribution,
        accessibleSeatCount,
        accessibilityCoveragePercent:
          seatCount > 0 ? Number(((accessibleSeatCount / seatCount) * 100).toFixed(2)) : 0,
        premiumSeatCount,
        premiumDistributionPercent:
          seatCount > 0 ? Number(((premiumSeatCount / seatCount) * 100).toFixed(2)) : 0,
        averageDensityPerRow: Number((seatCount / rowCount).toFixed(2)),
        rowCount: distinctRows.size,
      };
    });
  }

  /**
   * Step 4: Seat Distribution, Zone Statistics & Heatmap Placeholder
   */
  public static computeSeatDistribution(layoutVersion: LayoutVersion): SeatDistributionAnalytics {
    const seats = layoutVersion.seats;
    const total = seats.length;

    const counts: Record<string, number> = {};
    for (const s of seats) {
      const cat = s.seatType || "Standard";
      counts[cat] = (counts[cat] || 0) + 1;
    }

    const categoryBreakdown = Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      ratioPercent: total > 0 ? Number(((count / total) * 100).toFixed(2)) : 0,
    }));

    const seatRatios: Record<string, number> = {};
    for (const item of categoryBreakdown) {
      seatRatios[item.category] = item.ratioPercent;
    }

    // Spatial bounds for Front/Middle/Rear and Left/Center/Right zone stats
    const xs = seats.map((s) => s.coordinates?.x ?? s.column * 40);
    const ys = seats.map((s) => s.coordinates?.y ?? 100);
    const minX = xs.length ? Math.min(...xs) : 0;
    const maxX = xs.length ? Math.max(...xs) : 100;
    const minY = ys.length ? Math.min(...ys) : 0;
    const maxY = ys.length ? Math.max(...ys) : 100;
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);

    const zones: Record<SeatDistributionZoneStat["zone"], { count: number; premium: number }> = {
      FRONT: { count: 0, premium: 0 },
      MIDDLE: { count: 0, premium: 0 },
      REAR: { count: 0, premium: 0 },
      LEFT_WING: { count: 0, premium: 0 },
      CENTER: { count: 0, premium: 0 },
      RIGHT_WING: { count: 0, premium: 0 },
    };

    const gridCols = 6;
    const gridRows = 4;
    const cellMap = new Map<string, SeatHeatmapCellPlaceholder>();

    for (const s of seats) {
      const x = s.coordinates?.x ?? s.column * 40;
      const y = s.coordinates?.y ?? 100;
      const normX = (x - minX) / spanX;
      const normY = (y - minY) / spanY;
      const isPrem = s.seatType === "VIP" || s.seatType === "Recliner" || s.seatType === "Couple";

      const depthZone: "FRONT" | "MIDDLE" | "REAR" =
        normY < 0.33 ? "FRONT" : normY < 0.67 ? "MIDDLE" : "REAR";
      const horizZone: "LEFT_WING" | "CENTER" | "RIGHT_WING" =
        normX < 0.33 ? "LEFT_WING" : normX < 0.67 ? "CENTER" : "RIGHT_WING";

      zones[depthZone].count++;
      if (isPrem) zones[depthZone].premium++;
      zones[horizZone].count++;
      if (isPrem) zones[horizZone].premium++;

      const gx = Math.min(gridCols - 1, Math.floor(normX * gridCols));
      const gy = Math.min(gridRows - 1, Math.floor(normY * gridRows));
      const ck = `${gx}:${gy}`;
      const existingCell = cellMap.get(ck);
      if (existingCell) {
        existingCell.seatCount++;
      } else {
        // Sweet-spot center-middle seats get higher baseline placeholder intensity
        const distFromSweetSpot = Math.hypot(normX - 0.5, normY - 0.6);
        const baselineIntensity = Math.max(20, Math.min(100, Math.round(100 - distFromSweetSpot * 90)));
        cellMap.set(ck, {
          gridX: gx,
          gridY: gy,
          seatCount: 1,
          intensityScore: baselineIntensity,
        });
      }
    }

    const zoneStatistics: SeatDistributionZoneStat[] = (
      Object.entries(zones) as Array<[SeatDistributionZoneStat["zone"], { count: number; premium: number }]>
    ).map(([zone, val]) => ({
      zone,
      seatCount: val.count,
      sharePercent: total > 0 ? Number(((val.count / total) * 100).toFixed(2)) : 0,
      premiumSeats: val.premium,
    }));

    return {
      categoryBreakdown,
      seatRatios,
      zoneStatistics,
      heatmapPlaceholder: {
        status: "READY_FOR_HISTORICAL_INGESTION",
        gridColumns: gridCols,
        gridRows,
        cells: Array.from(cellMap.values()),
      },
    };
  }

  /**
   * Step 5: Accessibility Analytics & ADA/ISO Compliance Placeholder
   */
  public static computeAccessibilityAnalytics(
    layoutVersion: LayoutVersion,
    structuralObjects: StructuralObject[]
  ): AccessibilityAnalytics {
    const seats = layoutVersion.seats;
    const totalSeats = seats.length;
    const accessibleSeats = seats.filter((s) => s.seatType === "Wheelchair" || s.isAccessible).length;
    const companionSeats = seats.filter((s) => Boolean(s.companionSeatId)).length;
    const accessibleRoutesCount = structuralObjects.filter(
      (o) => o.objectType === "ACCESSIBLE_PATH"
    ).length;
    const emergencyExitsCount = structuralObjects.filter(
      (o) => o.objectType === "EMERGENCY_EXIT" || o.objectType === "EXIT"
    ).length;

    // ADA 2010 standard baseline approximation: >= 2% or minimum 2 seats for halls <= 100
    const minimumRequiredAccessibleSeats =
      totalSeats <= 50 ? 2 : totalSeats <= 150 ? 4 : Math.max(6, Math.ceil(totalSeats * 0.02));
    const meetsMinimumSeatCount = accessibleSeats >= minimumRequiredAccessibleSeats;
    const hasCompanionPairing = accessibleSeats === 0 ? false : companionSeats >= Math.min(1, accessibleSeats);
    const hasAccessiblePath = accessibleRoutesCount > 0;

    let score = 40;
    if (meetsMinimumSeatCount) score += 30;
    else if (accessibleSeats > 0) score += 15;
    if (hasAccessiblePath) score += 20;
    if (hasCompanionPairing) score += 10;
    score = Math.min(100, score);

    const notes: string[] = [];
    if (!meetsMinimumSeatCount) {
      notes.push(
        `Recommended at least ${minimumRequiredAccessibleSeats} wheelchair-accessible bays (currently ${accessibleSeats}).`
      );
    }
    if (!hasAccessiblePath) {
      notes.push("Add at least one ACCESSIBLE_PATH structural ramp connecting entry foyer to wheelchair bays.");
    }
    if (!hasCompanionPairing) {
      notes.push("Link adjacent companion seat IDs to wheelchair bays for ADA parity.");
    }
    if (notes.length === 0) {
      notes.push("Layout satisfies baseline ADA 2010 & ISO 21542 accessible seating and path heuristics.");
    }

    const status =
      meetsMinimumSeatCount && hasAccessiblePath
        ? "COMPLIANT"
        : accessibleSeats > 0 || hasAccessiblePath
        ? "NEEDS_REVIEW"
        : "NON_COMPLIANT";

    return {
      accessibleSeats,
      companionSeats,
      accessibleRoutesCount,
      emergencyExitsCount,
      accessibilityRatioPercent:
        totalSeats > 0 ? Number(((accessibleSeats / totalSeats) * 100).toFixed(2)) : 0,
      accessibilityScore: score,
      compliancePlaceholder: {
        standard: "ADA_2010_AND_ISO_21542",
        minimumRequiredAccessibleSeats,
        meetsMinimumSeatCount,
        hasCompanionPairing,
        hasAccessiblePath,
        status,
        notes,
      },
    };
  }

  /**
   * Step 6: Occupancy Simulation (25%, 50%, 75%, 100%, Peak Load + Evacuation Placeholder)
   */
  public static runOccupancySimulation(
    hallId: string,
    layoutVersion: LayoutVersion,
    structuralObjects: StructuralObject[]
  ): OccupancySimulationResult {
    const seats = layoutVersion.seats;
    const totalSellableSeats = seats.length;
    const vipCount = seats.filter((s) => s.seatType === "VIP" || s.seatType === "Recliner").length;
    const accessibleCount = seats.filter((s) => s.seatType === "Wheelchair" || s.isAccessible).length;

    const exitCount = Math.max(
      1,
      structuralObjects.filter((o) => o.objectType === "EMERGENCY_EXIT" || o.objectType === "EXIT").length
    );

    // NFPA 101 baseline egress flow estimate (~1.2 persons/sec per standard exit door)
    const flowRatePerSecond = exitCount * 1.2;

    const defs: Array<{
      code: OccupancySimulationScenario["code"];
      label: string;
      pct: number;
      risk: OccupancySimulationScenario["congestionRiskLevel"];
    }> = [
      { code: "LOW_25", label: "25% Matinee / Off-Peak", pct: 25, risk: "LOW" },
      { code: "MODERATE_50", label: "50% Standard Weekday", pct: 50, risk: "MODERATE" },
      { code: "HIGH_75", label: "75% Prime Evening", pct: 75, risk: "ELEVATED" },
      { code: "FULL_100", label: "100% Sold-Out Screening", pct: 100, risk: "PEAK" },
      { code: "PEAK_LOAD", label: "Peak Load (100% + Foyer Queue Factor)", pct: 100, risk: "PEAK" },
    ];

    const scenarios: OccupancySimulationScenario[] = defs.map((d) => {
      const occupied = Math.round((totalSellableSeats * d.pct) / 100);
      const loadFactor = d.code === "PEAK_LOAD" ? 1.15 : 1.0;
      const egressSeconds = Math.ceil((occupied * loadFactor) / flowRatePerSecond) + 15;
      return {
        code: d.code,
        label: d.label,
        targetOccupancyPercent: d.pct,
        occupiedSeats: occupied,
        emptySeats: Math.max(0, totalSellableSeats - occupied),
        vipOccupiedSeats: Math.round((vipCount * d.pct) / 100),
        accessibleOccupiedSeats: Math.round((accessibleCount * d.pct) / 100),
        estimatedEgressSecondsPlaceholder: egressSeconds,
        congestionRiskLevel: d.risk,
      };
    });

    const fullClearance = scenarios.find((s) => s.code === "PEAK_LOAD")!.estimatedEgressSecondsPlaceholder;
    const complianceThresholdSeconds = 180; // 3-minute cinema egress benchmark

    return {
      hallId,
      layoutVersionId: layoutVersion.id,
      totalSellableSeats,
      scenarios,
      emergencyEvacuationPlaceholder: {
        exitCount,
        estimatedFullClearanceSeconds: fullClearance,
        complianceThresholdSeconds,
        status: fullClearance <= complianceThresholdSeconds ? "ESTIMATED_SAFE" : "REQUIRES_ENGINEER_REVIEW",
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  /**
   * Step 7: Revenue Simulation (Read-Only Projection using Dynamic Pricing Engine)
   * Strictly NEVER mutates actual pricing tables, show configurations, or bookings.
   */
  public static runRevenueSimulation(
    layoutVersion: LayoutVersion,
    input: RevenueSimulationInput
  ): RevenueSimulationResult {
    const baseShowPrice = input.baseShowPrice ?? 250;
    const showTimeMultiplier = input.showTimeMultiplier ?? 1.0;
    const dayTypeMultiplier = input.dayTypeMultiplier ?? 1.0;
    const convenienceFeePerSeat = input.convenienceFeePerSeat ?? 35;
    const gstPercent = input.gstPercent ?? 18;
    const currency = input.currency ?? "INR";
    const occupancyPercentages = input.occupancyPercentages?.length
      ? input.occupancyPercentages
      : [25, 50, 75, 100];

    const effectiveBase = Math.round(baseShowPrice * showTimeMultiplier * dayTypeMultiplier);

    const tierAgg = new Map<string, { seatCount: number; totalNet: number; totalGross: number }>();
    let fullNetTicketRevenue = 0;
    let fullConvenienceFee = 0;
    let fullTax = 0;
    let fullGross = 0;

    for (const seat of layoutVersion.seats) {
      const resolved = SeatInventoryEngine.resolveSeatPricing(
        {
          category: seat.seatType,
          type: seat.seatType,
          sectionId: seat.sectionId,
          isWheelchair: seat.seatType === "Wheelchair" || Boolean(seat.isAccessible),
          isCompanion: Boolean(seat.companionSeatId),
          isRecliner: seat.seatType === "Recliner",
        },
        {
          theatreId: input.theatreId,
          hallId: input.hallId,
          showId: input.showId || "sim-show",
          sectionId: seat.sectionId,
          seatCategoryId: `cat-${seat.seatType.toLowerCase()}`,
        },
        {
          baseShowPrice: effectiveBase,
          convenienceFee: convenienceFeePerSeat,
          gstPercent,
          currency,
        }
      );

      const tax = Number((((resolved.basePrice + resolved.convenienceFee) * gstPercent) / 100).toFixed(2));
      fullNetTicketRevenue += resolved.basePrice;
      fullConvenienceFee += resolved.convenienceFee;
      fullTax += tax;
      fullGross += resolved.calculatedPrice;

      const key = seat.seatType || "Standard";
      const existing = tierAgg.get(key) || { seatCount: 0, totalNet: 0, totalGross: 0 };
      existing.seatCount++;
      existing.totalNet += resolved.basePrice;
      existing.totalGross += resolved.calculatedPrice;
      tierAgg.set(key, existing);
    }

    const totalSeats = layoutVersion.seats.length;

    const categoryBreakdown: RevenueSimulationTierBreakdown[] = Array.from(tierAgg.entries()).map(
      ([category, agg]) => ({
        category,
        seatCount: agg.seatCount,
        averageUnitPrice: agg.seatCount > 0 ? Number((agg.totalNet / agg.seatCount).toFixed(2)) : 0,
        grossTicketRevenueAt100: Number(agg.totalGross.toFixed(2)),
      })
    );

    const scenarios: RevenueSimulationScenario[] = occupancyPercentages.map((pct) => {
      const ratio = pct / 100;
      const projectedSeatsSold = Math.round(totalSeats * ratio);
      const netTicketRevenue = Number((fullNetTicketRevenue * ratio).toFixed(2));
      const convenienceFeeRevenue = Number((fullConvenienceFee * ratio).toFixed(2));
      const estimatedTaxAmount = Number((fullTax * ratio).toFixed(2));
      const grossProjectedRevenue = Number((fullGross * ratio).toFixed(2));
      const averageTicketPrice =
        projectedSeatsSold > 0 ? Number((netTicketRevenue / projectedSeatsSold).toFixed(2)) : 0;
      const revPAS = totalSeats > 0 ? Number((grossProjectedRevenue / totalSeats).toFixed(2)) : 0;

      return {
        occupancyPercent: pct,
        projectedSeatsSold,
        netTicketRevenue,
        convenienceFeeRevenue,
        estimatedTaxAmount,
        grossProjectedRevenue,
        averageTicketPrice,
        revPAS,
      };
    });

    return {
      theatreId: input.theatreId,
      hallId: input.hallId,
      layoutVersionId: layoutVersion.id,
      currency,
      isReadOnlyProjection: true,
      maxPotentialGrossRevenue: Number(fullGross.toFixed(2)),
      categoryBreakdown,
      scenarios,
      businessRulesApplied: {
        baseShowPrice,
        showTimeMultiplier,
        dayTypeMultiplier,
        convenienceFeePerSeat,
        gstPercent,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  /**
   * Step 8: Layout Design Health Score & Optimization Suggestions Placeholder
   */
  public static computeLayoutHealth(params: {
    layoutVersion: LayoutVersion;
    structuralObjects: StructuralObject[];
    accessibility: AccessibilityAnalytics;
    sections: SectionAnalyticsItem[];
    validationScore?: number;
  }): LayoutHealthScore {
    const { layoutVersion, structuralObjects, accessibility, sections, validationScore = 95 } = params;
    const totalSeats = layoutVersion.seats.length;

    // 1. Seat Density Score: penalize overcrowded rows (>24 seats/row) or sparse micro-rows (<4 seats/row)
    const avgRowDensity =
      sections.length > 0
        ? sections.reduce((acc, s) => acc + s.averageDensityPerRow, 0) / sections.length
        : 0;
    const seatDensityScore =
      avgRowDensity >= 6 && avgRowDensity <= 20
        ? 95
        : avgRowDensity >= 4 && avgRowDensity <= 24
        ? 82
        : 65;

    // 2. Geometry Quality: verify screen presence, exits, and non-overlapping coordinates
    const hasScreen = structuralObjects.some((o) => o.objectType === "SCREEN");
    const hasEmergencyExit = structuralObjects.some(
      (o) => o.objectType === "EMERGENCY_EXIT" || o.objectType === "EXIT"
    );
    const coordKeys = new Set(
      layoutVersion.seats.map((s) => `${Math.round(s.coordinates?.x ?? 0)}:${Math.round(s.coordinates?.y ?? 0)}`)
    );
    const hasCollisions = coordKeys.size < totalSeats;

    let geometryQuality = 70;
    if (hasScreen) geometryQuality += 12;
    if (hasEmergencyExit) geometryQuality += 10;
    if (!hasCollisions) geometryQuality += 8;
    geometryQuality = Math.min(100, geometryQuality);

    // 3. Section Balance: measure distribution evenness across sections
    let sectionBalance = 90;
    if (sections.length > 1) {
      const shares = sections.map((s) => s.shareOfHallPercent);
      const maxShare = Math.max(...shares);
      const minShare = Math.min(...shares);
      const spread = maxShare - minShare;
      sectionBalance = Math.max(55, Math.min(100, Math.round(100 - spread * 0.45)));
    }

    // 4. Composite Weighted Overall Design Health
    const overallDesignHealth = Math.round(
      seatDensityScore * 0.2 +
        accessibility.accessibilityScore * 0.25 +
        geometryQuality * 0.2 +
        sectionBalance * 0.15 +
        validationScore * 0.2
    );

    const grade: LayoutHealthScore["grade"] =
      overallDesignHealth >= 92
        ? "A+"
        : overallDesignHealth >= 84
        ? "A"
        : overallDesignHealth >= 74
        ? "B"
        : overallDesignHealth >= 60
        ? "C"
        : "D";

    const optimizationSuggestions: OptimizationSuggestionPlaceholder[] = [];
    if (accessibility.accessibilityScore < 85) {
      optimizationSuggestions.push({
        id: "opt-ada-01",
        category: "ACCESSIBILITY",
        priority: "HIGH",
        title: "Expand ADA Wheelchair & Companion Pairing",
        description:
          "Increasing wheelchair bays with dedicated accessible path routing elevates regulatory compliance and Design Health.",
        estimatedImpact: "+15 Accessibility Score",
      });
    }
    if (!hasEmergencyExit) {
      optimizationSuggestions.push({
        id: "opt-safety-01",
        category: "SAFETY",
        priority: "HIGH",
        title: "Add Dedicated Emergency Fire Egress Exits",
        description: "Place at least two opposing EMERGENCY_EXIT structural objects for optimal evacuation clearance.",
        estimatedImpact: "-35% Estimated Evacuation Time",
      });
    }
    const vipCount = layoutVersion.seats.filter((s) => s.seatType === "VIP" || s.seatType === "Recliner").length;
    if (totalSeats >= 60 && vipCount / Math.max(1, totalSeats) < 0.15) {
      optimizationSuggestions.push({
        id: "opt-rev-01",
        category: "REVENUE",
        priority: "MEDIUM",
        title: "Convert Rear Center Rows to VIP / Recliner Tier",
        description:
          "Premium seat share is below 15%. Upgrading the rear sweet-spot row increases RevPAS without sacrificing visibility.",
        estimatedImpact: "+8% to +14% Potential Show Revenue",
      });
    }

    return {
      seatDensityScore,
      accessibilityScore: accessibility.accessibilityScore,
      geometryQuality,
      sectionBalance,
      validationScore,
      overallDesignHealth,
      grade,
      optimizationSuggestions,
    };
  }

  /**
   * Complete Orchestrated Projection -> Analytics Report Pipeline
   */
  public static generateCompleteReport(params: {
    theatreId: string;
    hallId: string;
    layoutVersion: LayoutVersion;
    structuralObjects: StructuralObject[];
    inventorySnapshot?: InventorySnapshotRecord;
    historicalTrend?: HistoricalTrendPointPlaceholder[];
    currency?: string;
    baseShowPrice?: number;
    actorId: string;
  }): { projection: HallAnalyticsProjection; report: HallAnalyticsReport } {
    const projection = this.buildProjection({
      theatreId: params.theatreId,
      hallId: params.hallId,
      layoutVersion: params.layoutVersion,
      structuralObjects: params.structuralObjects,
      inventorySnapshot: params.inventorySnapshot,
      actorId: params.actorId,
    });

    const inventoryItems = params.inventorySnapshot?.snapshotPayload.items;
    const capacity = this.computeCapacityAnalytics(params.layoutVersion, inventoryItems);
    const sections = this.computeSectionAnalytics(params.layoutVersion);
    const seatDistribution = this.computeSeatDistribution(params.layoutVersion);
    const accessibility = this.computeAccessibilityAnalytics(
      params.layoutVersion,
      params.structuralObjects
    );
    const occupancySimulation = this.runOccupancySimulation(
      params.hallId,
      params.layoutVersion,
      params.structuralObjects
    );
    const revenueSimulation = this.runRevenueSimulation(params.layoutVersion, {
      theatreId: params.theatreId,
      hallId: params.hallId,
      layoutVersionId: params.layoutVersion.id,
      showId: params.inventorySnapshot?.showId,
      currency: params.currency ?? "INR",
      baseShowPrice: params.baseShowPrice ?? 250,
    });
    const layoutHealth = this.computeLayoutHealth({
      layoutVersion: params.layoutVersion,
      structuralObjects: params.structuralObjects,
      accessibility,
      sections,
    });

    const now = new Date().toISOString();
    const report: HallAnalyticsReport = {
      id: `han-${params.layoutVersion.id}-${Date.now().toString(36)}`,
      projectionId: projection.id,
      theatreId: params.theatreId,
      hallId: params.hallId,
      layoutDefinitionId: params.layoutVersion.layoutDefinitionId,
      layoutVersionId: params.layoutVersion.id,
      layoutVersionNumber: params.layoutVersion.versionNumber,
      inventorySnapshotId: params.inventorySnapshot?.id,
      capacity,
      sections,
      seatDistribution,
      accessibility,
      occupancySimulation,
      revenueSimulation,
      layoutHealth,
      historicalTrendPlaceholder: params.historicalTrend || [
        {
          layoutVersionNumber: params.layoutVersion.versionNumber,
          layoutVersionId: params.layoutVersion.id,
          recordedAt: now,
          totalSeats: capacity.totalSeats,
          vipRatioPercent: capacity.vipRatioPercent,
          overallDesignHealth: layoutHealth.overallDesignHealth,
          maxPotentialRevenue: revenueSimulation.maxPotentialGrossRevenue,
        },
      ],
      generatedAt: now,
      generatedBy: params.actorId,
      refreshedAt: now,
      isPrecomputed: true,
    };

    return { projection, report };
  }
}
