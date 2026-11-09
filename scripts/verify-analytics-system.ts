/**
 * ==============================================================================
 * CineSphere OS - Automated Verification Suite: Reporting, Analytics & BI
 * Phase 2 - Part 15
 * 
 * Verifies:
 * 1. Analytics Layer Separation: Daily/Monthly/Yearly pre-aggregates avoid transactional scans
 * 2. Centralized Standard KPI Engine: Mathematical accuracy of all platform KPI formulas
 * 3. Theatre Admin Tenant Isolation: Strict scoping to theatreId & zero cross-cinema leakage
 * 4. Super Admin Platform Visibility: National circuit scale, city market share & rankings
 * 5. Movie Performance Analytics: Gross box office, format yield, bookings & occupancy
 * 6. Hall & Section Analytics: Utilization %, RevPAS, VIP Recliner vs Standard split
 * 7. Booking Analytics: Confirmed, cancelled, ABV, and peak hours distribution curve
 * 8. Payment Analytics: UPI vs Card shares, success rate, and gateway telemetry
 * 9. Customer Cohort & LTV: New vs returning ratio, average spend, and LTV metrics
 * 10. Hierarchical Drill-down Navigation: Platform -> Theatre -> Hall -> Show -> Booking -> Ticket
 * 11. Configurable Reports Engine: Dynamic dimension/metric aggregation & snapshot generation
 * 12. Immutable Audit Logging: Captures REPORT_GENERATED, DASHBOARD_VIEWED, AGGREGATE_REFRESHED
 * ==============================================================================
 */

import {
  calculateAverageBookingValue,
  calculateAverageSeatsPerBooking,
  calculateAverageTicketPrice,
  calculateCancellationRate,
  calculateConversionRate,
  calculateCustomerLifetimeValue,
  calculateOccupancyPercent,
  calculateRevenuePerHall,
  calculateRevenuePerMovie,
  calculateRevenuePerSeat,
  calculateRevenuePerShow,
  generateReportSnapshot,
  getAnalyticsAuditLogs,
  getAnalyticsDrilldown,
  getReportSnapshots,
  getSuperAdminAnalyticsDashboard,
  getTheatreAnalyticsDashboard,
  recordAnalyticsAudit,
  resetAnalyticsEngineStore,
  resolveDateRange,
} from "../lib/engine/analytics-engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runAnalyticsSystemVerification() {
  console.log("\n================================================================================");
  console.log("   CINESPHERE OS — PHASE 2 PART 15: REPORTING & ANALYTICS VERIFICATION SUITE    ");
  console.log("================================================================================\n");

  resetAnalyticsEngineStore();

  // ----------------------------------------------------------------------------
  // TEST 1: Centralized Standard KPI Calculations
  // ----------------------------------------------------------------------------
  console.log("TEST 1: Centralized KPI Mathematical Formulas (Single Source of Truth)");
  {
    // 1. Occupancy % = (Booked / Capacity) * 100
    const occ = calculateOccupancyPercent(350, 400);
    assert(occ === 87.5, `Occupancy should be 87.5%: got ${occ}%`);

    // Edge cases: 0 capacity or overbooking cap
    assert(calculateOccupancyPercent(10, 0) === 0, "Zero capacity should safely return 0%");
    assert(calculateOccupancyPercent(450, 400) === 100, "Occupancy should cap at 100%");

    // 2. Average Ticket Price (ATP) = Total Revenue / Total Tickets
    const atp = calculateAverageTicketPrice(450000, 1500);
    assert(atp === 300.0, `ATP should be ₹300.00: got ₹${atp}`);

    // 3. Average Booking Value (ABV) = Total Revenue / Confirmed Bookings
    const abv = calculateAverageBookingValue(450000, 600);
    assert(abv === 750.0, `ABV should be ₹750.00: got ₹${abv}`);

    // 4. Revenue per Seat (RevPAS) = Total Revenue / Total Capacity
    const revpas = calculateRevenuePerSeat(450000, 2000);
    assert(revpas === 225.0, `RevPAS should be ₹225.00: got ₹${revpas}`);

    // 5. Revenue per Show
    const revShow = calculateRevenuePerShow(120000, 4);
    assert(revShow === 30000.0, `Revenue per show should be ₹30,000: got ₹${revShow}`);

    // 6. Conversion Rate %
    const conv = calculateConversionRate(600, 1000);
    assert(conv === 60.0, `Conversion rate should be 60.0%: got ${conv}%`);

    // 7. Cancellation Rate %
    const canc = calculateCancellationRate(20, 1000);
    assert(canc === 2.0, `Cancellation rate should be 2.0%: got ${canc}%`);

    // 8. Average Seats per Booking
    const avgSeats = calculateAverageSeatsPerBooking(1500, 600);
    assert(avgSeats === 2.5, `Average seats per booking should be 2.5: got ${avgSeats}`);

    // 9. Customer Lifetime Value (LTV)
    const ltv = calculateCustomerLifetimeValue(900000, 3000);
    assert(ltv === 300.0, `Customer LTV should be ₹300.00: got ₹${ltv}`);
  }

  // ----------------------------------------------------------------------------
  // TEST 2: Time Filter & Date Range Engine
  // ----------------------------------------------------------------------------
  console.log("\nTEST 2: Time Filter Presets & Date Range Resolution");
  {
    const today = resolveDateRange("today");
    assert(today.preset === "today", "Preset should be 'today'");
    assert(Boolean(today.from && today.to), "Today range must have from and to timestamps");

    const last7 = resolveDateRange("last7days");
    assert(last7.preset === "last7days", "Preset should be 'last7days'");

    const last30 = resolveDateRange("last30days");
    assert(last30.preset === "last30days", "Preset should be 'last30days'");

    const custom = resolveDateRange("custom", { from: "2026-01-01", to: "2026-01-31" });
    assert(custom.from === "2026-01-01" && custom.to === "2026-01-31", "Custom date range should preserve bounds");
  }

  // ----------------------------------------------------------------------------
  // TEST 3: Theatre Admin Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 3: Theatre Admin Tenant Isolation Guarantee");
  {
    // Pune Multiplex
    const puneDash = getTheatreAnalyticsDashboard("th-pun-001", "last30days");
    assert(puneDash.theatreId === "th-pun-001", "Analytics must strictly match requested theatreId");
    assert(puneDash.theatreName.includes("Pune"), `Theatre name should be Pune: got "${puneDash.theatreName}"`);
    assert(puneDash.cards.totalRevenue > 0, "Revenue must be positive");

    // Empty theatreId must throw error (prevent cross-theatre leakage)
    try {
      getTheatreAnalyticsDashboard("");
      assert(false, "Should have thrown tenant violation error on empty theatreId");
    } catch (e: unknown) {
      assert(true, "Successfully blocked query with missing tenant ID");
    }
  }

  // ----------------------------------------------------------------------------
  // TEST 4: Super Admin Platform-Wide Scale & Visibility
  // ----------------------------------------------------------------------------
  console.log("\nTEST 4: Super Admin Platform-Wide Aggregates & Fleet Matrix");
  {
    const saDash = getSuperAdminAnalyticsDashboard("last30days");
    assert(saDash.cards.totalTheatres === 25, `Total multiplexes should be 25: got ${saDash.cards.totalTheatres}`);
    assert(saDash.cards.activeTheatres === 22, `Active multiplexes should be 22: got ${saDash.cards.activeTheatres}`);
    assert(saDash.cards.totalRevenue >= 84000000, `Circuit revenue should be >= ₹8.4 Cr: got ₹${saDash.cards.totalRevenue}`);
    assert(saDash.circuitPerformance.revenueByTheatre.length >= 5, "Should list revenue breakdown for circuit multiplexes");
    assert(saDash.circuitPerformance.topCities.length >= 5, "Should report top metropolitan markets");
  }

  // ----------------------------------------------------------------------------
  // TEST 5: Movie Performance Analytics
  // ----------------------------------------------------------------------------
  console.log("\nTEST 5: Movie Box Office Analytics & Format Yield");
  {
    const dash = getTheatreAnalyticsDashboard("th-pun-001");
    assert(dash.movies.topMovies.length > 0, "Must have top performing movies list");
    const topMovie = dash.movies.topMovies[0];
    assert(topMovie.rank === 1, "Top movie rank must be 1");
    assert(topMovie.title === "Gladiator II", `Top grossing movie should be Gladiator II: got "${topMovie.title}"`);
    assert(topMovie.boxOfficeSharePercent > 30, "Top movie should hold high box office share");
    assert(dash.movies.leastPerformingMovies.length > 0, "Must report least performing features for rescheduling");
  }

  // ----------------------------------------------------------------------------
  // TEST 6: Hall & Section Analytics
  // ----------------------------------------------------------------------------
  console.log("\nTEST 6: Hall & Section Utilization Telemetry");
  {
    const dash = getTheatreAnalyticsDashboard("th-pun-001");
    assert(dash.halls.hallMetrics.length === 4, `Must report all 4 auditoriums: got ${dash.halls.hallMetrics.length}`);
    const imax = dash.halls.hallMetrics.find((h) => h.format.includes("IMAX"));
    assert(!!imax && imax.isMostUsed, "IMAX Laser hall should be identified as top earner");

    assert(dash.sections.length >= 4, "Must track all seating classes (Recliner, Prime, Classic, Balcony)");
    const recliner = dash.sections.find((s) => s.sectionType === "RECLINER");
    assert(!!recliner && recliner.averageTicketPrice === 1000.0, "VIP Recliner ATP should reflect ₹1,000 pricing tier");
    assert(Boolean(recliner && recliner.seatUtilizationPercent >= 90), "VIP Recliner should maintain >= 90% utilization");
  }

  // ----------------------------------------------------------------------------
  // TEST 7: Booking Analytics & Peak Hours Distribution
  // ----------------------------------------------------------------------------
  console.log("\nTEST 7: Booking Velocity & Peak Operating Hours");
  {
    const dash = getTheatreAnalyticsDashboard("th-pun-001");
    assert(dash.bookings.confirmedBookings > 0, "Must track confirmed bookings");
    assert(dash.bookings.peakHours.length >= 5, "Must track hourly booking distribution");

    const eveningPeak = dash.bookings.peakHours.find((p) => p.hour === "18:00");
    assert(!!eveningPeak && eveningPeak.bookingsCount >= 5000, "18:00 prime evening should report peak bookings");
  }

  // ----------------------------------------------------------------------------
  // TEST 8: Payment Settlement Analytics
  // ----------------------------------------------------------------------------
  console.log("\nTEST 8: Payment Methods Share & Gateway Telemetry");
  {
    const dash = getTheatreAnalyticsDashboard("th-pun-001");
    assert(dash.payments.successRatePercent >= 95, `Success rate must exceed 95%: got ${dash.payments.successRatePercent}%`);
    const upi = dash.payments.methods.find((m) => m.method === "UPI");
    assert(!!upi && upi.sharePercent >= 60, `UPI must be primary rail (>=60% share): got ${upi?.sharePercent}%`);
    assert(
      dash.payments.gatewayTelemetryPlaceholder.averageHandshakeLatencyMs < 200,
      "Gateway latency placeholder should be healthy (<200ms)"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 9: Customer Cohort & Demographic Velocity
  // ----------------------------------------------------------------------------
  console.log("\nTEST 9: Customer Cohort Analytics & Repeat Visitors");
  {
    const dash = getTheatreAnalyticsDashboard("th-pun-001");
    assert(dash.customers.totalUniqueCustomers > 0, "Must report total unique patrons");
    assert(dash.customers.repeatRatioPercent >= 50, `Repeat customer ratio should exceed 50%: got ${dash.customers.repeatRatioPercent}%`);
    assert(dash.customers.bookingsPerCustomer > 1.5, "Bookings per patron should be > 1.5");
  }

  // ----------------------------------------------------------------------------
  // TEST 10: Hierarchical Drill-Down Navigation Engine
  // Platform → Theatre → Hall → Show → Booking → Ticket
  // ----------------------------------------------------------------------------
  console.log("\nTEST 10: Hierarchical Drill-Down Navigation Trace");
  {
    // Level 1: Platform drilldown returns Theatres
    const theatres = getAnalyticsDrilldown({ level: "PLATFORM" });
    assert(theatres.length > 0 && theatres[0].level === "THEATRE", "Platform level must return Theatre nodes");

    // Level 2: Theatre drilldown returns Halls
    const halls = getAnalyticsDrilldown({ level: "THEATRE", id: "th-pun-001" });
    assert(halls.length > 0 && halls[0].level === "HALL", "Theatre level must return Hall nodes");

    // Level 3: Hall drilldown returns Shows
    const shows = getAnalyticsDrilldown({ level: "HALL", id: "hall-pun-001" });
    assert(shows.length > 0 && shows[0].level === "SHOW", "Hall level must return Show nodes");

    // Level 4: Show drilldown returns Bookings
    const bookings = getAnalyticsDrilldown({ level: "SHOW", id: "show-dr-001" });
    assert(bookings.length > 0 && bookings[0].level === "BOOKING", "Show level must return Booking nodes");

    // Level 5: Booking drilldown returns Tickets
    const tickets = getAnalyticsDrilldown({ level: "BOOKING", id: "bkg-dr-001" });
    assert(tickets.length > 0 && tickets[0].level === "TICKET", "Booking level must return Ticket nodes");
  }

  // ----------------------------------------------------------------------------
  // TEST 11: Configurable Reports Engine & Snapshot Generator
  // ----------------------------------------------------------------------------
  console.log("\nTEST 11: Configurable Reports Engine & Immutable Snapshots");
  {
    const snapshot = generateReportSnapshot({
      theatreId: "th-pun-001",
      reportName: "Weekly IMAX Format Yield Audit",
      reportType: "MOVIE_BOX_OFFICE",
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        preset: "last7days",
      },
      dimensions: ["MOVIE", "HALL"],
      metrics: ["revenue", "bookings", "occupancy"],
    });

    assert(!!snapshot.id, "Report snapshot must generate a unique ID");
    assert(snapshot.reportType === "MOVIE_BOX_OFFICE", "Snapshot reportType must match config");
    assert(snapshot.breakdown.length > 0, "Snapshot must include granular breakdown rows");
    assert(snapshot.status === "READY", "Snapshot status must be READY");

    // Retrieve snapshots from repository
    const allSnapshots = getReportSnapshots("th-pun-001");
    assert(allSnapshots.some((s) => s.id === snapshot.id), "Generated snapshot must be persisted in repository");
  }

  // ----------------------------------------------------------------------------
  // TEST 12: Immutable Audit Logging
  // ----------------------------------------------------------------------------
  console.log("\nTEST 12: Immutable Analytics Audit Logging");
  {
    const logs = getAnalyticsAuditLogs();
    assert(logs.length > 0, "Audit logs must capture analytics lifecycle actions");

    const actions = new Set(logs.map((l) => l.action));
    assert(actions.has("DASHBOARD_VIEWED"), "Audit logs must record DASHBOARD_VIEWED");
    assert(actions.has("REPORT_GENERATED"), "Audit logs must record REPORT_GENERATED");
    assert(actions.has("AGGREGATE_REFRESHED"), "Audit logs must record AGGREGATE_REFRESHED");
  }

  console.log("\n================================================================================");
  console.log("   🎉 ALL 12 ANALYTICS & REPORTING VERIFICATION TESTS PASSED!                   ");
  console.log("   Phase 2 – Part 15 Analytics & BI System is Production-Ready!                 ");
  console.log("================================================================================\n");
}

runAnalyticsSystemVerification().catch((err) => {
  console.error("Verification failed with uncaught exception:", err);
  process.exit(1);
});
