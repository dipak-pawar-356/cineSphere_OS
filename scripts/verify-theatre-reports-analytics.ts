/**
 * ==============================================================================
 * CineSphere OS — Verification Test Suite for Phase 3 Part 15: Reports & Analytics
 * ==============================================================================
 * Comprehensive test runner validating:
 * 1. Metric Registry & Pure KPI Engine Formulas (ATV, RevPAS, Occupancy, Growth, etc.)
 * 2. Report Definitions Registry (10 Categories, RBAC permissions, Dimensions, Presets)
 * 3. Revenue Analytics Aggregations & Slicing (Daily, Weekly, Monthly, Yearly, by Dimension)
 * 4. Occupancy Analytics & Peak / Off-Peak Interval Detection
 * 5. Hall Performance Analytics & Screen Yield Benchmarks (Top vs Least Performing)
 * 6. Movie Performance Analytics & Box Office Collections
 * 7. Booking Velocity, Demand Curves, and Cancellation Rates
 * 8. Customer Analytics, Patron Cohort Retention, Frequency, and Spend Profiles
 * 9. Payment Rail Analytics, Gateway Success Rates, and Reconciliations
 * 10. Theatre Growth Analytics, MoM Variances, and Multi-Year Trajectories
 * 11. Multi-Tenant Isolation & Cross-Tenant Access Prevention (Pune vs Mumbai vs Dubai)
 * 12. Universal Report Builder, CSV Exporter, and Protected Server Actions Integration
 * ==============================================================================
 */

import { KpiEngine } from "../lib/analytics/kpi-engine";
import { MetricRegistry } from "../lib/analytics/metric-registry";
import { ReportDefinitionRegistry } from "../lib/analytics/report-definitions";
import { theatreReportsRepository } from "../lib/repositories/theatre-reports.repository";
import { theatreAnalyticsService } from "../lib/services/theatre-analytics.service";
import { SecurityActorContext } from "../types/security-hardening.types";
import { TenantAccessError } from "../lib/errors/app-error";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${totalTests}]: ${testName}`);
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m [${totalTests}]: ${testName}`);
    if (detail) console.error(`    \x1b[33mDetail: ${detail}\x1b[0m`);
    process.exitCode = 1;
  }
}

async function runReportsAnalyticsVerification() {
  console.log("\n\x1b[36m================================================================================");
  console.log("  CINESPHERE OS — PHASE 3 PART 15: REPORTS & ANALYTICS LAYER VERIFICATION");
  console.log("================================================================================\x1b[0m\n");

  const actorPuneAdmin: SecurityActorContext = {
    userId: "usr-admin-pune",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["REPORTS_VIEW", "REPORTS_EXPORT", "ANALYTICS_VIEW"],
    correlationId: "corr-test-pune",
  };

  const actorMumbaiAdmin: SecurityActorContext = {
    userId: "usr-admin-mumbai",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-001",
    permissions: ["REPORTS_VIEW", "REPORTS_EXPORT", "ANALYTICS_VIEW"],
    correlationId: "corr-test-mumbai",
  };

  const actorDubaiAdmin: SecurityActorContext = {
    userId: "usr-admin-dubai",
    role: "THEATRE_ADMIN",
    theatreId: "th-dxb-001",
    permissions: ["REPORTS_VIEW", "REPORTS_EXPORT", "ANALYTICS_VIEW"],
    correlationId: "corr-test-dubai",
  };

  const actorSuperAdmin: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["REPORTS_VIEW", "REPORTS_EXPORT", "ANALYTICS_VIEW", "AUDIT_VIEW"],
    correlationId: "corr-test-super",
  };

  const defaultFilters = { dateRangePreset: "THIS_MONTH" as const };

  // ----------------------------------------------------------------------------
  // TEST 1: Metric Registry & Canonical KPI Formulas
  // ----------------------------------------------------------------------------
  console.log("\x1b[35m[1/12] Testing Metric Registry & Pure KPI Engine Formulas...\x1b[0m");
  {
    // 1.1 Occupancy Formula
    const occ = KpiEngine.calculateOccupancyPercent(750, 1000);
    assert(occ === 75.0, "KpiEngine.calculateOccupancyPercent(750, 1000) === 75.0%");

    // 1.2 Average Ticket Value (ATV)
    const atv = KpiEngine.calculateAverageTicketValue(300000, 1000);
    assert(atv === 300.0, "KpiEngine.calculateAverageTicketValue(300000, 1000) === 300.0");

    // 1.3 RevPAS (Revenue per available seat)
    const revPas = KpiEngine.calculateRevPAS(300000, 1500);
    assert(revPas === 200.0, "KpiEngine.calculateRevPAS(300000, 1500) === 200.0");

    // 1.4 Hall Utilization
    const util = KpiEngine.calculateHallUtilization(12, 16);
    assert(util === 75.0, "KpiEngine.calculateHallUtilization(12, 16) === 75.0%");

    // 1.5 Cancellation Rate
    const cancelRate = KpiEngine.calculateCancellationRate(50, 1000);
    assert(cancelRate === 5.0, "KpiEngine.calculateCancellationRate(50, 1000) === 5.0%");

    // 1.6 Payment Success Rate
    const payRate = KpiEngine.calculatePaymentSuccessRate(980, 1000);
    assert(payRate === 98.0, "KpiEngine.calculatePaymentSuccessRate(980, 1000) === 98.0%");

    // 1.7 MoM Growth Rate
    const growth = KpiEngine.calculateGrowthRate(120000, 100000);
    assert(growth === 20.0, "KpiEngine.calculateGrowthRate(120000, 100000) === 20.0%");

    // 1.8 Metric Registry Lookup & Localized Formatting
    const def = MetricRegistry.get("AVERAGE_TICKET_VALUE");
    assert(def !== undefined && def.key === "AVERAGE_TICKET_VALUE", "MetricRegistry contains 'AVERAGE_TICKET_VALUE'");

    const inrFormatted = MetricRegistry.format(18450000, "CURRENCY", "INR", "INDIAN");
    assert(inrFormatted.includes("₹") && inrFormatted.includes("1,84,50,000"), "MetricRegistry formats Indian Currency Lakhs/Crores correctly");

    const usdFormatted = MetricRegistry.format(479700, "CURRENCY", "USD", "INTERNATIONAL");
    assert(usdFormatted.includes("$") && usdFormatted.includes("479,700"), "MetricRegistry formats International Currency correctly");
  }

  // ----------------------------------------------------------------------------
  // TEST 2: Report Definitions Registry
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[2/12] Testing Configurable Report Definitions Registry...\x1b[0m");
  {
    const allDefs = ReportDefinitionRegistry.list();
    assert(allDefs.length >= 10, `Registry contains ${allDefs.length} report definitions (expected >= 10)`);

    const expectedCategories = [
      "REVENUE_REPORTS",
      "OCCUPANCY_REPORTS",
      "HALL_PERFORMANCE",
      "MOVIE_PERFORMANCE",
      "BOOKING_TRENDS",
      "CUSTOMER_ANALYTICS",
      "PAYMENT_ANALYTICS",
      "THEATRE_GROWTH",
      "OPERATIONAL_KPIS",
      "EXECUTIVE_SUMMARY",
    ];

    for (const cat of expectedCategories) {
      const match = ReportDefinitionRegistry.getByCategory(cat as any);
      assert(match !== undefined, `Report definition registered for category '${cat}'`);
    }

    const staffDefs = ReportDefinitionRegistry.list("STAFF");
    const adminDefs = ReportDefinitionRegistry.list("THEATRE_ADMIN");
    assert(staffDefs.length < adminDefs.length, "Staff has restricted report definitions compared to Theatre Admin");
  }

  // ----------------------------------------------------------------------------
  // TEST 3: Revenue Analytics Aggregation & Multi-Dimensional Slicing
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[3/12] Testing Revenue Analytics & Multi-Dimensional Slicing...\x1b[0m");
  {
    const rev = await theatreAnalyticsService.getRevenueAnalytics("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(rev.totalGrossRevenue > 0, `Total gross revenue is positive (${rev.totalGrossRevenue})`);
    assert(rev.dailyRevenue.length > 0, `Contains daily revenue series (${rev.dailyRevenue.length} days)`);
    assert(rev.weeklyRevenue.length > 0, `Contains weekly revenue series (${rev.weeklyRevenue.length} weeks)`);
    assert(rev.monthlyRevenue.length > 0, `Contains monthly revenue series (${rev.monthlyRevenue.length} months)`);
    assert(rev.yearlyRevenue.length > 0, `Contains yearly revenue series (${rev.yearlyRevenue.length} years)`);
    assert(rev.revenueByMovie.length > 0, `Contains revenue sliced by movie (${rev.revenueByMovie.length} movies)`);
    assert(rev.revenueByHall.length > 0, `Contains revenue sliced by hall (${rev.revenueByHall.length} halls)`);
    assert(rev.revenueByShow.length > 0, `Contains revenue sliced by show (${rev.revenueByShow.length} shows)`);
    assert(rev.revenueByPaymentMethod.length > 0, `Contains revenue sliced by payment method (${rev.revenueByPaymentMethod.length} methods)`);
    assert(rev.averageTicketValue > 0, `Computed valid Average Ticket Value (${rev.averageTicketValue})`);
    assert(rev.revenuePerAvailableSeat > 0, `Computed valid RevPAS (${rev.revenuePerAvailableSeat})`);
  }

  // ----------------------------------------------------------------------------
  // TEST 4: Occupancy Analytics & Peak/Off-Peak Detection
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[4/12] Testing Occupancy Analytics & Peak Time Slot Detection...\x1b[0m");
  {
    const occ = await theatreAnalyticsService.getOccupancyAnalytics("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(occ.overallOccupancyPercent > 50 && occ.overallOccupancyPercent <= 100, `Overall occupancy percentage is valid (${occ.overallOccupancyPercent}%)`);
    assert(occ.dailyOccupancy.length === 7, `Daily occupancy tracks 7 continuous days (${occ.dailyOccupancy.length})`);
    assert(occ.peakHours.length > 0, `Identified peak occupancy hours (${occ.peakHours.length} slots)`);
    assert(occ.peakHours.some((p) => p.timeSlot.includes("18:00")), "Peak hour list includes evening 18:00-21:00 slot");
    assert(occ.lowOccupancyPeriods.length > 0, `Identified low occupancy periods (${occ.lowOccupancyPeriods.length} slots)`);
    assert(occ.lowOccupancyPeriods.some((l) => l.timeSlot.includes("10:00")), "Low occupancy list includes morning 10:00-13:00 slot");
  }

  // ----------------------------------------------------------------------------
  // TEST 5: Hall Performance & Screen Yield Ranking
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[5/12] Testing Hall Fleet Performance & Yield Ranking...\x1b[0m");
  {
    const hallPerf = await theatreAnalyticsService.getHallPerformance("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(hallPerf.halls.length >= 4, `Evaluates entire fleet of halls (${hallPerf.halls.length} halls)`);
    assert(hallPerf.topPerformingHall !== null, `Top performing hall identified (${hallPerf.topPerformingHall?.hallName})`);
    assert(hallPerf.leastPerformingHall !== null, `Least performing hall identified (${hallPerf.leastPerformingHall?.hallName})`);
    assert(
      (hallPerf.topPerformingHall?.revenue || 0) >= (hallPerf.leastPerformingHall?.revenue || 0),
      "Top performing hall generated higher revenue than least performing hall"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 6: Movie Performance & Box Office Matrix
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[6/12] Testing Film Exhibition Box Office & Attendance Matrix...\x1b[0m");
  {
    const movPerf = await theatreAnalyticsService.getMoviePerformance("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(movPerf.movies.length > 0, `Tracks movies in catalog (${movPerf.movies.length} movies)`);
    assert(movPerf.topMovies.length > 0, `Top grossing movie identified (${movPerf.topMovies[0]?.movieTitle})`);
    assert(movPerf.movies[0].averageAttendancePerShow > 0, "Average attendance metric is calculated");
    assert(movPerf.movies[0].revenue > 0, "Movie revenue is tracked");
  }

  // ----------------------------------------------------------------------------
  // TEST 7: Booking Velocity & Cancellation Analytics
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[7/12] Testing Booking Demand Curves & Cancellation Analytics...\x1b[0m");
  {
    const booking = await theatreAnalyticsService.getBookingAnalytics("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(booking.confirmedBookingsCount > 0, `Confirmed bookings count is positive (${booking.confirmedBookingsCount})`);
    assert(booking.cancelledBookingsCount >= 0, `Cancelled bookings count is tracked (${booking.cancelledBookingsCount})`);
    assert(booking.cancellationRatePercent >= 0 && booking.cancellationRatePercent <= 100, `Cancellation rate is a valid percentage (${booking.cancellationRatePercent}%)`);
    assert(booking.averageBookingValue > 0, `Average booking value (ABV) is positive (${booking.averageBookingValue})`);
    assert(booking.bookingSourcesPlaceholder.length > 0, `Booking channel sources tracked (${booking.bookingSourcesPlaceholder.length} channels)`);
  }

  // ----------------------------------------------------------------------------
  // TEST 8: Customer Cohorts & Retention Analytics
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[8/12] Testing Customer Cohort Retention, Frequency & Spend...\x1b[0m");
  {
    const cust = await theatreAnalyticsService.getCustomerAnalytics("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(cust.newCustomersCount > 0, `New customers tracked (${cust.newCustomersCount})`);
    assert(cust.returningCustomersCount > 0, `Returning customers tracked (${cust.returningCustomersCount})`);
    assert(cust.customerReturnRatePercent > 0 && cust.customerReturnRatePercent <= 100, `Valid customer return rate (${cust.customerReturnRatePercent}%)`);
    assert(cust.averageCustomerSpend > 0, `Valid average spend per patron (${cust.averageCustomerSpend})`);
    assert(cust.averageCustomerFrequencyPerMonth > 0, `Valid average visit frequency (${cust.averageCustomerFrequencyPerMonth})`);
  }

  // ----------------------------------------------------------------------------
  // TEST 9: Payment Analytics & Gateway Reconciliations
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[9/12] Testing Payment Rail Reconciliations & Gateway Success Rates...\x1b[0m");
  {
    const pay = await theatreAnalyticsService.getPaymentAnalytics("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(pay.paymentSuccessRatePercent >= 90 && pay.paymentSuccessRatePercent <= 100, `High payment gateway success rate (${pay.paymentSuccessRatePercent}%)`);
    assert(pay.paymentMethodsBreakdown.length >= 4, `All 4 payment rails present (UPI, Card, NetBanking, Cash)`);
    assert(pay.settlementStatusPlaceholder.settledVolume > 0, `Total settled volume recorded (${pay.settlementStatusPlaceholder.settledVolume})`);
    assert(pay.refundsCountPlaceholder >= 0, `Refunds tracked (${pay.refundsCountPlaceholder})`);
  }

  // ----------------------------------------------------------------------------
  // TEST 10: Theatre Growth Analytics & MoM Telemetry
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[10/12] Testing Theatre Growth Analytics & MoM Telemetry...\x1b[0m");
  {
    const growth = await theatreAnalyticsService.getTheatreGrowth("th-pun-001", defaultFilters, actorPuneAdmin);
    assert(typeof growth.revenueGrowthMoM.growthRatePercent === "number", `Revenue MoM growth recorded (${growth.revenueGrowthMoM.growthRatePercent}%)`);
    assert(typeof growth.bookingGrowthMoM.growthRatePercent === "number", `Booking MoM growth recorded (${growth.bookingGrowthMoM.growthRatePercent}%)`);
    assert(typeof growth.occupancyGrowthMoM.growthRatePercent === "number", `Occupancy MoM growth recorded (${growth.occupancyGrowthMoM.growthRatePercent}%)`);
    assert(typeof growth.customerGrowthMoM.growthRatePercent === "number", `Customer MoM growth recorded (${growth.customerGrowthMoM.growthRatePercent}%)`);
    assert(growth.historicalTrendComparison.length >= 4, `Monthly historical trend comparisons tracked (${growth.historicalTrendComparison.length} months)`);
  }

  // ----------------------------------------------------------------------------
  // TEST 11: Multi-Tenant Isolation & Cross-Tenant Access Prevention
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[11/12] Testing Multi-Tenant Boundary Isolation & Autonomous Localization...\x1b[0m");
  {
    // 11.1 Allowed own tenant access
    const puneReport = await theatreAnalyticsService.generateReport("th-pun-001", "DEF_REVENUE_PERFORMANCE", defaultFilters, actorPuneAdmin);
    assert(puneReport.theatreId === "th-pun-001", "Pune Admin successfully queries Pune reports");
    assert(puneReport.localization.currency === "INR", "Pune localization uses INR");
    assert(puneReport.localization.numberFormat === "INDIAN", "Pune localization uses Indian number format");

    // 11.2 Block cross-tenant access: Pune Admin querying Mumbai
    let blockedPuneToMum = false;
    try {
      await theatreAnalyticsService.generateReport("th-mum-001", "DEF_REVENUE_PERFORMANCE", defaultFilters, actorPuneAdmin);
    } catch (err) {
      if (err instanceof TenantAccessError) blockedPuneToMum = true;
    }
    assert(blockedPuneToMum, "Cross-Tenant Access DENIED: Pune Admin strictly blocked from querying Mumbai reports");

    // 11.3 Block cross-tenant access: Dubai Admin querying Pune
    let blockedDxbToPun = false;
    try {
      await theatreAnalyticsService.generateReport("th-pun-001", "DEF_REVENUE_PERFORMANCE", defaultFilters, actorDubaiAdmin);
    } catch (err) {
      if (err instanceof TenantAccessError) blockedDxbToPun = true;
    }
    assert(blockedDxbToPun, "Cross-Tenant Access DENIED: Dubai Admin strictly blocked from querying Pune reports");

    // 11.4 Super Admin has omni-tenant access across all venues
    const superMum = await theatreAnalyticsService.generateReport("th-mum-001", "DEF_REVENUE_PERFORMANCE", defaultFilters, actorSuperAdmin);
    assert(superMum.theatreId === "th-mum-001", "Super Admin successfully queries Mumbai reports");
    assert(superMum.localization.currency === "USD", "Mumbai venue localizes to USD");

    const superDxb = await theatreAnalyticsService.generateReport("th-dxb-001", "DEF_REVENUE_PERFORMANCE", defaultFilters, actorSuperAdmin);
    assert(superDxb.theatreId === "th-dxb-001", "Super Admin successfully queries Dubai reports");
    assert(superDxb.localization.currency === "AED", "Dubai venue localizes to AED");
  }

  // ----------------------------------------------------------------------------
  // TEST 12: Universal Report Builder & CSV Exporter
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[35m[12/12] Testing Universal Report Builder, CSV Exporter & Snapshots...\x1b[0m");
  {
    // 12.1 Universal Report Builder
    const report = await theatreAnalyticsService.generateReport("th-pun-001", "DEF_EXECUTIVE_SUMMARY", defaultFilters, actorPuneAdmin);
    assert(report.reportId.startsWith("rep-"), `Generated report has valid ID (${report.reportId})`);
    assert(report.summaryCards.length > 0, `Report contains headline summary KPI cards (${report.summaryCards.length} cards)`);
    assert(report.chartSeries.length > 0, `Report contains visual chart series (${report.chartSeries.length} series)`);
    assert(report.tableColumns.length > 0, `Report contains table schema (${report.tableColumns.length} columns)`);
    assert(report.detailedTableData.length > 0, `Report contains granular breakdown records (${report.detailedTableData.length} rows)`);

    // 12.2 CSV Export Serializer
    const csvExport = await theatreAnalyticsService.exportReport(report, "CSV", actorPuneAdmin);
    assert(csvExport.format === "CSV", "Exporter produces CSV format");
    assert(csvExport.mimeType === "text/csv", "Exporter produces text/csv MIME type");
    assert(csvExport.content.includes("Report: Executive Board Briefing"), "CSV contains title header");
    assert(csvExport.content.includes("Currency: INR (₹)"), "CSV contains localized currency header");
    assert(csvExport.content.split("\n").length > 5, "CSV contains structured data rows");

    // 12.3 JSON Export Serializer
    const jsonExport = await theatreAnalyticsService.exportReport(report, "JSON", actorPuneAdmin);
    assert(jsonExport.format === "JSON", "Exporter produces JSON format");
    assert(jsonExport.mimeType === "application/json", "Exporter produces application/json MIME type");
    const parsed = JSON.parse(jsonExport.content);
    assert(parsed.reportId === report.reportId, "JSON export accurately preserves report payload structure");
  }

  // ----------------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------------
  console.log("\n\x1b[36m================================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("================================================================================\x1b[0m\n");

  if (passedTests === totalTests) {
    console.log("  \x1b[32m✔ ALL PHASE 3 PART 15 REPORTS & ANALYTICS SPECIFICATIONS SATISFIED!\x1b[0m\n");
  } else {
    console.error("  \x1b[31m✖ SOME TESTS FAILED. CHECK LOGS ABOVE.\x1b[0m\n");
    process.exit(1);
  }
}

runReportsAnalyticsVerification().catch((err) => {
  console.error("Unhandled error during verification:", err);
  process.exit(1);
});
