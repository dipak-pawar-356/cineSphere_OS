/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 11: Theatre Dashboard Verification Suite
 * ==============================================================================
 * Comprehensive verification of:
 * 1. Materialized Metrics Analytics Layer vs Direct Transactional Queries
 * 2. Revenue Metrics & Localization Currency Formatting (INR, USD, AED)
 * 3. Booking Metrics & Ticket Quota Aggregation
 * 4. Show Lifecycle Metrics & "Starting Soon" Alerts
 * 5. Auditorium Hall Status & Capacity Utilization
 * 6. Occupancy Rate Computations & Timezone Alignment
 * 7. Payment Status & Settlement Summaries
 * 8. Widget Registry & Capability-Based Widget Filtering
 * 9. Per-User Dashboard Preferences & Personalization
 * 10. Multi-Criteria Filtering (Today, Yesterday, Week, Month, Hall)
 * 11. Multi-Tenant Boundary Isolation & Cross-Tenant Guards
 * 12. Multi-Theatre Isolation Matrix (Theatre A vs Theatre B vs Theatre C)
 * ==============================================================================
 */

import { theatreDashboardService } from "@/lib/services/theatre-dashboard.service";
import { theatreDashboardRepository } from "@/lib/repositories/theatre-dashboard.repository";
import { getRegisteredWidgets, getPermittedWidgets } from "@/lib/dashboard/widget-registry";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { TenantAccessError, ValidationError } from "@/lib/errors";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  email: "superadmin@cinesphere.io",
  name: "Global Platform Director",
  role: "SUPER_ADMIN",
  permissions: ["*"],
  correlationId: "corr-dash-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  email: "pune.admin@cinesphere.in",
  name: "Pune General Manager",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: [
    "dashboard:read",
    "reports:read",
    "bookings:read",
    "shows:read",
    "halls:read",
    "payments:read",
    "settings:read",
  ],
  correlationId: "corr-dash-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  email: "mumbai.admin@cinesphere.com",
  name: "Mumbai Complex Director",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["*"],
  correlationId: "corr-dash-mumbai",
};

const HALL_MANAGER: SecurityActorContext = {
  userId: "usr-hall-mgr",
  email: "hall.manager@cinesphere.in",
  name: "Auditorium Duty Lead",
  role: "THEATRE_ADMIN", // User role in system
  theatreId: "th-pun-001",
  permissions: ["halls:read", "shows:read", "dashboard:read"], // Limited capability permissions
  correlationId: "corr-dash-hall-mgr",
};

async function runDashboardVerification() {
  console.log("\n==============================================================================");
  console.log("📊  CineSphere OS — Phase 3 Part 11 Theatre Dashboard Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Materialized Metrics Layer vs Transactional Query Isolation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Pre-aggregated Materialized Metrics Layer");
  const puneBundle = await theatreDashboardService.getDashboardBundle("th-pun-001", undefined, PUNE_ADMIN);

  assert(puneBundle !== null, "Dashboard bundle successfully retrieved");
  assert(puneBundle.theatreId === "th-pun-001", "Bundle strictly scoped to Pune tenant");
  assert(puneBundle.revenue !== undefined, "Revenue domain metrics present in aggregated bundle");
  assert(puneBundle.bookings !== undefined, "Booking domain metrics present in aggregated bundle");
  assert(puneBundle.shows !== undefined, "Show domain metrics present in aggregated bundle");
  assert(puneBundle.halls !== undefined, "Hall domain metrics present in aggregated bundle");
  assert(puneBundle.occupancy !== undefined, "Occupancy domain metrics present in aggregated bundle");
  assert(puneBundle.payments !== undefined, "Payment domain metrics present in aggregated bundle");
  assert(puneBundle.alerts !== undefined, "Operational alert metrics present in aggregated bundle");
  assert(puneBundle.registeredWidgets.length > 0, "Widget registry metadata attached to response");

  // --------------------------------------------------------------------------
  // TEST 2: Revenue Metrics & Localization Currency Formatting (INR, USD, AED)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Revenue Metrics & Tenant Localization Formatting");
  assert(puneBundle.currency === "INR", "Pune currency is INR");
  assert(puneBundle.currencySymbol === "₹", "Pune currency symbol is ₹");
  assert(puneBundle.numberFormat === "INDIAN", "Pune number format is INDIAN (Lakhs/Crores)");
  assert(puneBundle.revenue.todayRevenue === 125000, "Pune today's gross revenue is ₹1,25,000");
  assert(puneBundle.revenue.yesterdayRevenue === 112500, "Pune yesterday's gross revenue was ₹1,12,500");
  assert(puneBundle.revenue.revenueGrowthPercent === 11.1, "Revenue growth rate calculated (+11.1%)");
  assert(puneBundle.revenue.averageTicketValue > 0, "Average ticket price derived from tickets sold");
  assert(puneBundle.revenue.revenueByPaymentMethod.length >= 3, "Revenue breakdown by payment rail populated");

  // --------------------------------------------------------------------------
  // TEST 3: Booking Metrics & Ticket Quota Aggregation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Booking Metrics & Ticket Quota Aggregation");
  assert(puneBundle.bookings.todayBookings === 420, "Today's bookings total is 420");
  assert(puneBundle.bookings.confirmedBookings === 405, "Confirmed bookings is 405");
  assert(puneBundle.bookings.cancelledBookings === 12, "Cancelled bookings is 12");
  assert(puneBundle.bookings.pendingBookings === 3, "Pending bookings is 3");
  assert(puneBundle.bookings.todayTicketsSold === 980, "Total tickets issued is 980");
  assert(puneBundle.bookings.todayCustomersCount === 365, "Unique patrons count is 365");
  assert(puneBundle.bookings.bookingTrend.length > 0, "Hourly booking trend datapoints generated");

  // --------------------------------------------------------------------------
  // TEST 4: Show Lifecycle Metrics & "Starting Soon" Alerts
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Show Lifecycle Metrics & Urgent Start Alerts");
  assert(puneBundle.shows.runningShowsCount === 4, "Running shows count is 4");
  assert(puneBundle.shows.upcomingShowsCount === 12, "Upcoming shows count is 12");
  assert(puneBundle.shows.showsStartingSoon.length >= 1, "Shows starting in <60m detected");
  const soonShow = puneBundle.shows.showsStartingSoon[0];
  assert(soonShow.minutesUntilStart <= 60, `Show '${soonShow.movieTitle}' starting in ${soonShow.minutesUntilStart}m`);
  assert(soonShow.occupancyPercent >= 90, `High occupancy alert triggered (${soonShow.occupancyPercent.toFixed(1)}%)`);

  // --------------------------------------------------------------------------
  // TEST 5: Auditorium Hall Status & Capacity Utilization
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Auditorium Hall Status & Capacity Utilization");
  assert(puneBundle.halls.totalHalls === 6, "Total screens count is 6");
  assert(puneBundle.halls.occupiedHalls === 4, "Occupied running screens is 4");
  assert(puneBundle.halls.availableHalls === 1, "Available screen is 1");
  assert(puneBundle.halls.maintenanceHalls === 1, "Maintenance screen is 1");
  const maintenanceHall = puneBundle.halls.hallsSummary.find((h) => h.status === "MAINTENANCE");
  assert(maintenanceHall !== undefined, "Maintenance screen located");
  assert(maintenanceHall!.maintenanceReason!.includes("Laser Optic"), "Maintenance reason tracked");

  // --------------------------------------------------------------------------
  // TEST 6: Real-Time Occupancy Rate Computations & Timezone Alignment
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Real-Time Occupancy Rate Computations & Timezone");
  assert(puneBundle.occupancy.currentOccupancyPercent === 82.0, "Pune live seat occupancy is 82.0%");
  assert(puneBundle.occupancy.dailyOccupancyPercent === 79.5, "Daily average occupancy is 79.5%");
  assert(puneBundle.occupancy.peakOccupancyHour === "20:00", "Peak occupancy hour identified as 20:00");
  assert(puneBundle.occupancy.peakOccupancyPercent === 94.0, "Peak occupancy rate is 94.0%");
  assert(puneBundle.timezone === "Asia/Kolkata", "Operating timezone aligned with Asia/Kolkata");

  // --------------------------------------------------------------------------
  // TEST 7: Payment Status & Settlement Summaries
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Payment Status & Settlement Summaries");
  assert(puneBundle.payments.completedPaymentsCount === 405, "Completed transactions count is 405");
  assert(puneBundle.payments.completedPaymentsAmount === 125000, "Completed transactions amount is ₹1,25,000");
  assert(puneBundle.payments.pendingPaymentsCount === 3, "Pending payments count is 3");
  assert(puneBundle.payments.failedPaymentsCount >= 0, "Failed payments tracked");
  const upiMethod = puneBundle.revenue.revenueByPaymentMethod.find((m) => m.method === "UPI");
  assert(upiMethod !== undefined, "UPI payment rail tracked");
  assert(upiMethod!.percentage === 68.0, "UPI represents 68.0% of total venue revenue");

  // --------------------------------------------------------------------------
  // TEST 8: Widget Registry & Capability-Based Widget Filtering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Widget Registry & Capability-Based Widget Filtering");
  const allWidgets = getRegisteredWidgets();
  assert(allWidgets.length === 10, "Widget registry contains 10 standardized widgets");

  // Hall Manager permissions test (only halls, shows, dashboard)
  const hallManagerWidgets = getPermittedWidgets(HALL_MANAGER.permissions, "HALL_MANAGER");
  assert(hallManagerWidgets.length < allWidgets.length, "Hall Manager receives filtered widget subset");
  assert(hallManagerWidgets.some((w) => w.id === "widget-halls-status"), "Hall Manager permitted for hall status widget");
  assert(hallManagerWidgets.some((w) => w.id === "widget-shows-overview"), "Hall Manager permitted for shows widget");
  assert(!hallManagerWidgets.some((w) => w.id === "widget-revenue-metric"), "Hall Manager strictly DENIED revenue widget");
  assert(!hallManagerWidgets.some((w) => w.id === "widget-payments-overview"), "Hall Manager strictly DENIED payments widget");

  // --------------------------------------------------------------------------
  // TEST 9: Per-User Dashboard Preferences & Personalization
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Per-User Dashboard Preferences & Personalization");
  const updatedPrefs = await theatreDashboardService.updateUserPreferences(
    {
      theatreId: "th-pun-001",
      userId: "usr-custom-operator",
      defaultDatePreset: "THIS_WEEK",
      visibleWidgetIds: ["widget-revenue-metric", "widget-booking-metric"],
    },
    PUNE_ADMIN
  );

  assert(updatedPrefs.defaultDatePreset === "THIS_WEEK", "User default date preset saved as THIS_WEEK");
  assert(updatedPrefs.visibleWidgetIds.length === 2, "Custom visible widgets saved");
  assert(updatedPrefs.userId === "usr-custom-operator", "Preference belongs strictly to specified operator");

  // Verify other operators do not have their default preferences overwritten
  const defaultPrefs = await theatreDashboardRepository.getUserPreferences("th-pun-001", "usr-other-operator");
  assert(defaultPrefs.defaultDatePreset === "TODAY", "Other user retains independent default preset TODAY");
  assert(defaultPrefs.visibleWidgetIds.length === 10, "Other user retains all 10 visible widgets");

  // --------------------------------------------------------------------------
  // TEST 10: Multi-Criteria Filtering (Today, Yesterday, Week, Month, Hall)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Multi-Criteria Filtering & Dimension Slices");
  const yesterdayBundle = await theatreDashboardService.getDashboardBundle(
    "th-pun-001",
    { periodPreset: "YESTERDAY" },
    PUNE_ADMIN
  );
  assert(yesterdayBundle.revenue.todayRevenue === 112500, "Yesterday filter returned yesterday's revenue ₹1,12,500");

  const hallSliceBundle = await theatreDashboardService.getDashboardBundle(
    "th-pun-001",
    { hallId: "hall-pun-01" },
    PUNE_ADMIN
  );
  assert(hallSliceBundle.halls.totalHalls === 1, "Hall dimension filter sliced bundle to 1 screen");
  assert(hallSliceBundle.halls.hallsSummary[0].id === "hall-pun-01", "Sliced to Audi 1 (Laser IMAX)");

  // --------------------------------------------------------------------------
  // TEST 11: Multi-Tenant Boundary Isolation & Cross-Tenant Guards
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 11: Multi-Tenant Boundary Isolation & Cross-Tenant Guards");
  let crossTenantBlocked = false;
  try {
    // Mumbai Admin attempting to read Pune dashboard
    await theatreDashboardService.getDashboardBundle("th-pun-001", undefined, MUMBAI_ADMIN);
  } catch (err: unknown) {
    crossTenantBlocked = true;
    assert(
      err instanceof TenantAccessError,
      "Multi-tenant boundary strictly blocked Mumbai admin from accessing Pune dashboard"
    );
  }
  assert(crossTenantBlocked, "Cross-tenant dashboard read strictly forbidden");

  // --------------------------------------------------------------------------
  // TEST 12: Multi-Theatre Isolation Matrix (Theatre A vs Theatre B vs Theatre C)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 12: Multi-Theatre Isolation Matrix (Theatre A vs B vs C)");
  const mumbaiBundle = await theatreDashboardService.getDashboardBundle("th-mum-001", undefined, SUPER_ADMIN);
  const dubaiBundle = await theatreDashboardService.getDashboardBundle("th-dxb-001", undefined, SUPER_ADMIN);

  // Theatre A (Pune)
  assert(puneBundle.currency === "INR", "Theatre A currency is INR");
  assert(puneBundle.revenue.todayRevenue === 125000, "Theatre A today's revenue is ₹1,25,000");
  assert(puneBundle.bookings.todayBookings === 420, "Theatre A today's bookings is 420");
  assert(puneBundle.occupancy.currentOccupancyPercent === 82.0, "Theatre A occupancy is 82.0%");

  // Theatre B (Mumbai / Intl)
  assert(mumbaiBundle.currency === "USD", "Theatre B currency is USD");
  assert(mumbaiBundle.currencySymbol === "$", "Theatre B currency symbol is $");
  assert(mumbaiBundle.revenue.todayRevenue === 8420, "Theatre B today's revenue is $8,420");
  assert(mumbaiBundle.bookings.todayBookings === 215, "Theatre B today's bookings is 215");
  assert(mumbaiBundle.occupancy.currentOccupancyPercent === 61.0, "Theatre B occupancy is 61.0%");
  assert(mumbaiBundle.timezone === "America/New_York", "Theatre B timezone is America/New_York");

  // Theatre C (Dubai)
  assert(dubaiBundle.currency === "AED", "Theatre C currency is AED");
  assert(dubaiBundle.currencySymbol === "AED ", "Theatre C currency symbol is AED ");
  assert(dubaiBundle.revenue.todayRevenue === 32400, "Theatre C today's revenue is AED 32,400");
  assert(dubaiBundle.bookings.todayBookings === 170, "Theatre C today's bookings is 170");
  assert(dubaiBundle.occupancy.currentOccupancyPercent === 74.0, "Theatre C occupancy is 74.0%");
  assert(dubaiBundle.timezone === "Asia/Dubai", "Theatre C timezone is Asia/Dubai");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 12 THEATRE DASHBOARD TEST SUITES PASSED SUCCESSFULLY!");
  console.log("==============================================================================\n");
}

runDashboardVerification().catch((err) => {
  console.error("FATAL ERROR in Theatre Dashboard verification:", err);
  process.exit(1);
});
