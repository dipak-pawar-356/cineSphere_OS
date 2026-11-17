/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 15: Hall Analytics Verification Suite
 * ==============================================================================
 * Verifies Analytics Projection Model (immutable published layouts & inventory
 * snapshots), Draft Rejection Invariant, Capacity/Section/Distribution/ADA
 * Analytics, Read-Only Occupancy & Revenue Simulations, Layout Health Scoring,
 * Per-Theatre Configs (Pune/Mumbai/Dubai), Tenant Isolation, Event-Driven
 * Auto-Projection, and Protected Server Actions.
 * ==============================================================================
 */

import { hallAnalyticsService } from "../lib/services/hall-analytics.service";
import { HallDesignerRepository } from "../lib/repositories/hall-designer.repository";
import { seatInventoryIntegrationService } from "../lib/services/seat-inventory-integration.service";
import { hallDesignerEventBus } from "../lib/engine/hall-designer-event-bus";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  generateHallAnalyticsAction,
  refreshHallAnalyticsAction,
  runHallSimulationsAction,
  loadHallAnalyticsDashboardAction,
  exportHallAnalyticsAction,
  loadHallAnalyticsConfigAction,
  saveHallAnalyticsConfigAction,
} from "../actions/hall-analytics-actions";

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string): void {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runHallAnalyticsVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 15: HALL ANALYTICS VERIFICATION");
  console.log("==================================================================\n");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["analytics:view", "analytics:manage"],
    correlationId: "corr-pune-analytics-test",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mum-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["analytics:view", "analytics:manage"],
    correlationId: "corr-mum-analytics-test",
  };

  const dubaiAdmin: SecurityActorContext = {
    userId: "usr-dxb-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-dxb-003",
    permissions: ["analytics:view", "analytics:manage"],
    correlationId: "corr-dxb-analytics-test",
  };

  // ----------------------------------------------------------------------------
  // Section 1: Immutable Projection Invariant (Reject Editable DRAFT Layouts)
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Immutable Analytics Projection Invariant ---");
  const designerRepo = HallDesignerRepository.getInstance();
  const draftDef = designerRepo.createLayoutDefinition(
    {
      theatreId: "th-pun-001",
      hallId: "hall-pun-draft-only",
      name: "Unpublished Draft Hall",
      description: "Editable draft layout that must not feed official analytics",
    },
    puneAdmin
  );

  let draftBlocked = false;
  try {
    await hallAnalyticsService.generateAnalytics(puneAdmin, {
      theatreId: "th-pun-001",
      hallId: "hall-pun-draft-only",
      layoutVersionId: draftDef.activeDraftVersionId!,
    });
  } catch (err: any) {
    draftBlocked =
      err.name === "ValidationError" && err.message.includes("Immutable Projection Invariant");
  }
  assert(draftBlocked, "Editable DRAFT layout strictly rejected from Analytics Projection Layer");

  // ----------------------------------------------------------------------------
  // Section 2: Generate Analytics from Published Layout + Inventory Snapshot
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Analytics from Published Layout & Inventory Snapshot ---");
  const invRes = await seatInventoryIntegrationService.generateInventory(puneAdmin, {
    theatreId: "th-pun-001",
    showId: "show-pun-analytics-01",
    hallId: "hall-pun-aud1",
  });
  assert(invRes.items.length === 100, "Generated 100-seat immutable inventory snapshot for analytics test");

  const report = await hallAnalyticsService.generateAnalytics(puneAdmin, {
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    showId: "show-pun-analytics-01",
    forceRefresh: true,
  });

  assert(report.theatreId === "th-pun-001", "Analytics report scoped to Pune theatre");
  assert(report.capacity.totalSeats === 100, `Capacity analytics tracks 100 total seats (Found: ${report.capacity.totalSeats})`);
  assert(report.capacity.availableSeats === 100, "Capacity analytics reflects inventory available seats");
  assert(report.sections.length > 0, `Section analytics generated for ${report.sections.length} section(s)`);
  assert(report.seatDistribution.categoryBreakdown.length > 0, "Seat distribution computes category breakdown");
  assert(
    report.seatDistribution.heatmapPlaceholder.status === "READY_FOR_HISTORICAL_INGESTION",
    "Heatmap placeholder initialized and ready for ingestion"
  );
  assert(report.seatDistribution.zoneStatistics.length === 6, "Zone statistics cover all 6 spatial zones");

  // ----------------------------------------------------------------------------
  // Section 3: Accessibility & Layout Health Scoring
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Accessibility & Layout Health Scoring ---");
  assert(
    report.accessibility.accessibilityScore >= 0 && report.accessibility.accessibilityScore <= 100,
    `Accessibility score within [0..100] (${report.accessibility.accessibilityScore})`
  );
  assert(
    report.accessibility.compliancePlaceholder.standard === "ADA_2010_AND_ISO_21542",
    "Accessibility compliance placeholder evaluates ADA 2010 & ISO 21542"
  );
  assert(
    report.layoutHealth.overallDesignHealth >= 0 && report.layoutHealth.overallDesignHealth <= 100,
    `Overall Design Health computed (${report.layoutHealth.overallDesignHealth}/100, Grade ${report.layoutHealth.grade})`
  );
  assert(report.layoutHealth.seatDensityScore > 0, "Seat Density score computed");
  assert(report.layoutHealth.geometryQuality > 0, "Geometry Quality score computed");
  assert(report.layoutHealth.sectionBalance > 0, "Section Balance score computed");
  assert(report.layoutHealth.validationScore > 0, "Validation score integrated");

  // ----------------------------------------------------------------------------
  // Section 4: Occupancy & Read-Only Revenue Simulations
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Occupancy & Read-Only Revenue Simulations ---");
  assert(report.occupancySimulation.scenarios.length === 5, "Occupancy simulation evaluates 25%, 50%, 75%, 100% & Peak Load");
  assert(
    report.occupancySimulation.emergencyEvacuationPlaceholder.estimatedFullClearanceSeconds > 0,
    "Emergency evacuation placeholder estimates clearance seconds"
  );
  assert(report.revenueSimulation.isReadOnlyProjection === true, "Revenue simulation guarantees read-only projection");
  assert(report.revenueSimulation.maxPotentialGrossRevenue > 0, `Max potential gross revenue > 0 (₹${report.revenueSimulation.maxPotentialGrossRevenue})`);
  assert(report.revenueSimulation.scenarios.length === 4, "Revenue simulation calculates 4 occupancy tiers");

  // Run dynamic weekend prime simulation
  const simRes = await hallAnalyticsService.runSimulations(puneAdmin, {
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    baseShowPrice: 300,
    showTimeMultiplier: 1.25,
    dayTypeMultiplier: 1.2,
    occupancyPercentages: [25, 50, 75, 100],
  });
  assert(Boolean(simRes.occupancy), "Pune occupancy simulation executed");
  assert(Boolean(simRes.revenue), "Pune revenue simulation executed");
  assert(
    simRes.revenue!.maxPotentialGrossRevenue > report.revenueSimulation.maxPotentialGrossRevenue,
    "Weekend prime multiplier increases projected revenue without mutating baseline"
  );

  // ----------------------------------------------------------------------------
  // Section 5: Multi-Tenant Analytics Policies & Isolation
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Multi-Tenant Analytics Policies & Isolation ---");
  const puneCfg = await hallAnalyticsService.getConfiguration(puneAdmin, "th-pun-001");
  const mumCfg = await hallAnalyticsService.getConfiguration(mumbaiAdmin, "th-mum-002");
  const dxbCfg = await hallAnalyticsService.getConfiguration(dubaiAdmin, "th-dxb-003");

  assert(puneCfg.revenueSimulationEnabled === true && puneCfg.vipAnalyticsEnabled === true, "Pune has Revenue Simulation & VIP Analytics enabled");
  assert(mumCfg.revenueSimulationEnabled === false && mumCfg.premiumLayoutMetricsEnabled === true && mumCfg.occupancySimulationEnabled === true, "Mumbai has Premium Metrics & Occupancy Simulation enabled, Revenue Simulation disabled");
  assert(dxbCfg.customKpiDashboardEnabled === true && dxbCfg.advancedCapacityAnalysisEnabled === true, "Dubai has Custom KPI Dashboard & Advanced Capacity Analysis enabled");

  let crossTenantBlocked = false;
  try {
    await hallAnalyticsService.loadDashboard(mumbaiAdmin, "th-pun-001");
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError";
  }
  assert(crossTenantBlocked, "Cross-tenant analytics dashboard access blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 6: Event-Driven Auto-Projection on LayoutPublished
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Event-Driven Auto-Projection ---");
  const pubEvent = await hallDesignerEventBus.publish({
    eventType: "LayoutPublished",
    theatreId: "th-pun-001",
    hallId: "hall-pun-aud1",
    actorId: "usr-pune-admin",
    payload: {
      hallId: "hall-pun-aud1",
      publishedVersionId: report.layoutVersionId,
    },
  });
  assert(pubEvent.eventType === "LayoutPublished", "Published LayoutPublished domain event");
  const refreshedEvents = hallDesignerEventBus.getEventLog("th-pun-001", "AnalyticsProjectionRefreshed");
  assert(refreshedEvents.length > 0, "Analytics engine automatically reacted and emitted AnalyticsProjectionRefreshed");

  // ----------------------------------------------------------------------------
  // Section 7: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");
  const actGen = await generateHallAnalyticsAction(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actGen.success === true, "generateHallAnalyticsAction executed cleanly");

  const actRefresh = await refreshHallAnalyticsAction(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actRefresh.success === true, "refreshHallAnalyticsAction executed cleanly");

  const actSim = await runHallSimulationsAction(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1", occupancyPercentages: [50, 100] },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSim.success === true, "runHallSimulationsAction executed cleanly");
  assert(actSim.data?.revenue?.scenarios.length === 2, "Simulation action honored custom occupancy tiers");

  const actDash = await loadHallAnalyticsDashboardAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actDash.success === true, "loadHallAnalyticsDashboardAction executed cleanly");
  assert((actDash.data?.aggregateMetrics.totalHallsAnalyzed ?? 0) >= 1, "Dashboard aggregated hall metrics");

  const actExport = await exportHallAnalyticsAction(
    { theatreId: "th-pun-001", format: "JSON" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actExport.success === true, "exportHallAnalyticsAction executed cleanly");
  assert(actExport.data?.schemaVersion === "1.0", "Export envelope uses schema v1.0");

  const actLoadCfg = await loadHallAnalyticsConfigAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoadCfg.success === true, "loadHallAnalyticsConfigAction executed cleanly");

  const actSaveCfg = await saveHallAnalyticsConfigAction(
    { theatreId: "th-pun-001", customKpiDashboardEnabled: true },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSaveCfg.success === true, "saveHallAnalyticsConfigAction executed cleanly");
  assert(actSaveCfg.data?.customKpiDashboardEnabled === true, "Updated customKpiDashboardEnabled to true");

  console.log("\n==================================================================");
  console.log("HALL ANALYTICS VERIFICATION COMPLETED");
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runHallAnalyticsVerification().catch((err) => {
  console.error("FATAL ERROR IN HALL ANALYTICS VERIFICATION:", err);
  process.exit(1);
});
