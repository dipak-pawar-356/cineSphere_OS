/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Comprehensive Verification Test Suite
 * Phase 4 – Part 9: Multi-Mode Production-Ready Hall Preview & Simulation
 * ==============================================================================
 */

import { hallPreviewRepository } from "../lib/repositories/hall-preview.repository";
import { hallPreviewService } from "../lib/services/hall-preview.service";
import { HallPreviewEngine } from "../lib/engine/hall-preview-engine";
import { SeatTemplate } from "../types/seat-generator.types";
import { StructuralObject } from "../types/structural-objects.types";
import { HallSection } from "../types/section-row-designer.types";
import { BookingSimulationState } from "../types/hall-preview.types";
import {
  loadPreviewAction,
  refreshPreviewAction,
  loadPreviewConfigAction,
  savePreviewPreferencesAction,
  runBookingSimulationAction,
} from "../actions/hall-preview-actions";
import { SecurityActorContext } from "../types/security-hardening.types";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runPreviewVerificationSuite() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 9: HALL PREVIEW ENGINE VERIFICATION");
  console.log("==================================================================");

  // ----------------------------------------------------------------------------
  // SECTION 1: VIEWPORT FIT & SCALING MATH
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 1: Viewport Fit & Scaling Calculations ---");

  const container = { width: 1400, height: 900 };
  const canvas = { width: 1600, height: 1200 };

  const desktopFit = HallPreviewEngine.computeViewportTransform("DESKTOP", container, canvas);
  assert(desktopFit.fitZoom > 0.5 && desktopFit.fitZoom <= 1.5, `Desktop fitZoom (${desktopFit.fitZoom}) within safe range [0.5, 1.5]`);
  assert(desktopFit.panOffset.x !== undefined && desktopFit.panOffset.y !== undefined, "Computed valid pan centering offsets");

  const mobileFit = HallPreviewEngine.computeViewportTransform("MOBILE", { width: 390, height: 844 }, canvas);
  assert(mobileFit.fitZoom <= desktopFit.fitZoom, "Mobile viewport computes smaller scale factor than desktop");

  // ----------------------------------------------------------------------------
  // SECTION 2: OBJECT FILTERING & MODE DECORATION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Mode-Specific Object Filtering & Decoration ---");

  const mockSeats: SeatTemplate[] = [
    {
      id: "seat-standard-1",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      sectionId: "sec-std",
      rowId: "row-A",
      seatNumber: "A1",
      columnNumber: 1,
      categoryCode: "STANDARD",
      categoryName: "Standard",
      categoryColor: "#3B82F6",
      coordinates: { id: "c1", seatTemplateId: "seat-standard-1", x: 100, y: 200, rotation: 0, width: 36, height: 36, spacing: 10 },
      metadata: { id: "m1", seatTemplateId: "seat-standard-1", seatName: "A1", displayName: "Seat A1", seatCode: "STD-A1", rowId: "row-A", rowName: "A", sectionId: "sec-std", sectionName: "Standard Section", categoryCode: "STANDARD", status: "ACTIVE" },
      accessibility: { id: "a1", seatTemplateId: "seat-standard-1", accessibilityType: "STANDARD", isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "seat-wheelchair-1",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      sectionId: "sec-vip",
      rowId: "row-W",
      seatNumber: "W1",
      columnNumber: 1,
      categoryCode: "WHEELCHAIR",
      categoryName: "Wheelchair Bay",
      categoryColor: "#06B6D4",
      coordinates: { id: "c2", seatTemplateId: "seat-wheelchair-1", x: 300, y: 200, rotation: 0, width: 44, height: 44, spacing: 10 },
      metadata: { id: "m2", seatTemplateId: "seat-wheelchair-1", seatName: "W1", displayName: "Seat W1", seatCode: "WC-W1", rowId: "row-W", rowName: "W", sectionId: "sec-vip", sectionName: "VIP Section", categoryCode: "WHEELCHAIR", status: "ACTIVE" },
      accessibility: { id: "a2", seatTemplateId: "seat-wheelchair-1", accessibilityType: "WHEELCHAIR", isWheelchairAccessible: true, hasCompanionSeat: false, hasAccessibleRoute: true },
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "seat-companion-1",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      sectionId: "sec-vip",
      rowId: "row-W",
      seatNumber: "W2",
      columnNumber: 2,
      categoryCode: "VIP",
      categoryName: "VIP Companion",
      categoryColor: "#EF4444",
      coordinates: { id: "c3", seatTemplateId: "seat-companion-1", x: 350, y: 200, rotation: 0, width: 36, height: 36, spacing: 10 },
      metadata: { id: "m3", seatTemplateId: "seat-companion-1", seatName: "W2", displayName: "Seat W2", seatCode: "VIP-W2", rowId: "row-W", rowName: "W", sectionId: "sec-vip", sectionName: "VIP Section", categoryCode: "VIP", status: "ACTIVE" },
      accessibility: { id: "a3", seatTemplateId: "seat-companion-1", accessibilityType: "COMPANION", isWheelchairAccessible: false, hasCompanionSeat: true, hasAccessibleRoute: true },
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const previewConfig = {
    theatreId: "th-pun-001",
    defaultMode: "CUSTOMER" as const,
    showLabels: true,
    showGrid: true,
    seatColorMode: "CATEGORY" as const,
    backgroundTheme: "DARK" as const,
    isFullscreen: false,
    zoom: 100,
    pan: { x: 0, y: 0 },
    accessibilityOverlay: false,
    enableBookingSimulation: true,
    highContrastMode: false,
    fullscreenDefault: false,
  };

  // Customer Mode decoration
  const customerSeats = HallPreviewEngine.filterAndDecorateSeats(mockSeats, "CUSTOMER", previewConfig);
  assert(customerSeats.length === 3, "Customer mode returns all seats");
  assert(customerSeats[0].renderColor === "#3B82F6", "Standard seat rendered with category color in customer mode");
  assert(customerSeats[0].displayLabel === "A1", "Seat label visible when showLabels is true");

  // Accessibility Mode decoration
  const accessibilitySeats = HallPreviewEngine.filterAndDecorateSeats(mockSeats, "ACCESSIBILITY", previewConfig);
  assert(accessibilitySeats[1].renderColor === "#06B6D4", "Wheelchair seat highlighted in cyan in Accessibility mode");
  assert(accessibilitySeats[1].isHighlighted === true, "Wheelchair seat marked as highlighted in Accessibility mode");
  assert(accessibilitySeats[1].accessibilityBadge === "♿", "Wheelchair seat decorated with wheelchair badge");
  assert(accessibilitySeats[2].accessibilityBadge === "★", "Companion seat decorated with companion star badge");
  assert(accessibilitySeats[0].renderColor.includes("rgba"), "Standard non-ADA seat de-emphasized in Accessibility mode");

  // ----------------------------------------------------------------------------
  // SECTION 3: INTERACTIVE BOOKING SIMULATION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Interactive Booking Simulation Engine ---");

  let simState: BookingSimulationState = {
    selectedSeatIds: [],
    selectedSeats: [],
    totalPrice: 0,
    categoryBreakdown: {},
    maxSeatsAllowed: 10,
    activeStep: "SELECTING",
  };

  // Select seat 1 (Standard: 200)
  simState = HallPreviewEngine.simulateSeatToggle(simState, mockSeats[0]);
  assert(simState.selectedSeatIds.length === 1, "Toggled 1 seat into simulation cart");
  assert(simState.totalPrice === 200, "Calculated total price ₹200 for 1 Standard seat");
  assert(simState.simulatedHoldExpiresAt !== undefined, "Generated 10-minute hold expiration timestamp");

  // Select seat 2 (VIP Companion: 450)
  simState = HallPreviewEngine.simulateSeatToggle(simState, mockSeats[2]);
  assert(simState.selectedSeatIds.length === 2, "Toggled second seat into simulation cart");
  assert(simState.totalPrice === 650, "Calculated total price ₹650 (200 + 450)");
  assert(simState.categoryBreakdown["Standard"]?.count === 1, "Category breakdown counts 1 Standard seat");
  assert(simState.categoryBreakdown["VIP Companion"]?.count === 1, "Category breakdown counts 1 VIP Companion seat");

  // Deselect seat 1
  simState = HallPreviewEngine.simulateSeatToggle(simState, mockSeats[0]);
  assert(simState.selectedSeatIds.length === 1, "Deselecting seat removes it from cart");
  assert(simState.totalPrice === 450, "Total price updated to ₹450 after deselection");

  // Deselect remaining seat -> empty cart
  simState = HallPreviewEngine.simulateSeatToggle(simState, mockSeats[2]);
  assert(simState.selectedSeatIds.length === 0, "Cart is now completely empty");
  assert(simState.totalPrice === 0, "Total price reset to 0");
  assert(simState.simulatedHoldExpiresAt === undefined, "Hold expiration cleared when cart is empty");

  // ----------------------------------------------------------------------------
  // SECTION 4: PREVIEW STATISTICS & STRUCTURAL OBJECT FILTERING
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Statistics Generation & Structural Filtering ---");

  const mockSections: HallSection[] = [
    {
      id: "sec-std",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      name: "Standard Section",
      displayName: "Standard Section",
      internalCode: "SEC-STD",
      color: "#3B82F6",
      seatCategory: "Standard",
      capacity: 10,
      priority: 2,
      displayOrder: 1,
      rotation: 0,
      position: { x: 50, y: 100 },
      visibility: "VISIBLE",
      geometry: { shapeType: "RECTANGLE" },
      labelPosition: "TOP",
      rows: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockStructs: StructuralObject[] = [
    {
      id: "str-scr",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      objectName: "Main Screen",
      displayName: "Screen 1",
      objectType: "SCREEN",
      internalCode: "SCR-1",
      position: { x: 200, y: 40, z: 0 },
      width: 600,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: "#0284C7",
      isLocked: true,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      geometry: { shape: "RECTANGLE", strokeColor: "#0284C7", fillColor: "#0284C7" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "str-pillar",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      objectName: "Support Pillar",
      displayName: "Pillar A",
      objectType: "PILLAR",
      internalCode: "PIL-A",
      position: { x: 100, y: 300, z: 0 },
      width: 40,
      height: 40,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: "#64748B",
      isLocked: true,
      metadata: { isStatic: true, isCollisionObstacle: true, isReservedArea: false },
      geometry: { shape: "RECTANGLE", strokeColor: "#64748B", fillColor: "#64748B" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "str-exit",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-pune-screen1-draft",
      objectName: "Fire Exit",
      displayName: "Emergency Exit North",
      objectType: "EMERGENCY_EXIT",
      internalCode: "EXT-N",
      position: { x: 50, y: 500, z: 0 },
      width: 100,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: "#10B981",
      isLocked: true,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      geometry: { shape: "RECTANGLE", strokeColor: "#10B981", fillColor: "#10B981" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const stats = HallPreviewEngine.generateStatistics(mockSections, mockSeats, mockStructs);
  assert(stats.totalSeats === 3, "Statistics counted 3 total seats");
  assert(stats.wheelchairSeatsCount === 1, "Statistics counted 1 wheelchair bay");
  assert(stats.companionSeatsCount === 1, "Statistics counted 1 companion seat");
  assert(stats.screenCount === 1, "Statistics detected 1 screen");
  assert(stats.emergencyExitCount === 1, "Statistics detected 1 emergency exit");
  assert(stats.estimatedFullGross > 0, "Calculated estimated full gross for auditorium");

  // Customer view filters out internal pillars
  const customerStructs = HallPreviewEngine.filterStructuralObjects(mockStructs, "CUSTOMER", previewConfig);
  assert(customerStructs.length === 2, "Customer structural filtering displays SCREEN & EMERGENCY_EXIT");
  assert(!customerStructs.some((s) => s.objectType === "PILLAR"), "Internal support pillar excluded from customer view");

  // ----------------------------------------------------------------------------
  // SECTION 5: THEATRE-SPECIFIC PREVIEW PREFERENCES
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Multi-Tenant Preview Preferences Repository ---");

  const punePrefs = await hallPreviewRepository.getPreferences("th-pun-001");
  assert(punePrefs.seatLabelsVisible === true, "Pune has seat labels visible");
  assert(punePrefs.sectionColorsEnabled === true, "Pune has section colors enabled");
  assert(punePrefs.accessibilityOverlayEnabled === true, "Pune has accessibility overlay enabled");
  assert(punePrefs.defaultMode === "CUSTOMER", "Pune default mode is CUSTOMER");

  const mumbaiPrefs = await hallPreviewRepository.getPreferences("th-mum-002");
  assert(mumbaiPrefs.seatLabelsVisible === false, "Mumbai has seat labels hidden");
  assert(mumbaiPrefs.darkThemeEnabled === true, "Mumbai has dark theme enabled");
  assert(mumbaiPrefs.bookingSimulationEnabled === true, "Mumbai has booking simulation enabled");
  assert(mumbaiPrefs.defaultMode === "BOOKING_SIMULATION", "Mumbai default mode is BOOKING_SIMULATION");

  const dubaiPrefs = await hallPreviewRepository.getPreferences("th-dxb-003");
  assert(dubaiPrefs.categoryLabelsVisible === true, "Dubai has category labels visible");
  assert(dubaiPrefs.highContrastMode === true, "Dubai has high contrast mode enabled");
  assert(dubaiPrefs.fullscreenDefault === true, "Dubai has fullscreen default enabled");

  // Update Pune preferences
  const updatedPune = await hallPreviewRepository.savePreferences("th-pun-001", {
    defaultZoom: 125,
    seatLabelsVisible: false,
  });
  assert(updatedPune.defaultZoom === 125, "Successfully updated Pune defaultZoom to 125%");
  assert(updatedPune.seatLabelsVisible === false, "Successfully updated Pune seatLabelsVisible to false");

  // Theme Catalog
  const themes = await hallPreviewRepository.listThemes();
  assert(themes.length >= 4, `Themes catalog contains at least 4 visual palettes (Found: ${themes.length})`);
  assert(themes.some((t) => t.themeName === "DARK"), "Includes OLED Cinema Void theme");
  assert(themes.some((t) => t.themeName === "HIGH_CONTRAST"), "Includes High Contrast Accessibility theme");

  // ----------------------------------------------------------------------------
  // SECTION 6: DOMAIN SERVICE & SECURITY
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Hall Preview Domain Service & Security ---");

  const puneActor: SecurityActorContext = {
    userId: "usr-pune-admin",
    email: "admin@galaxy.pune.internal",
    name: "Pune Admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage"],
    ipAddress: "127.0.0.1",
    userAgent: "CineSphere-Preview-Agent",
    correlationId: "corr-prev-001",
  };

  const mumbaiActor: SecurityActorContext = {
    userId: "usr-mumbai-admin",
    email: "admin@imax.mumbai.internal",
    name: "Mumbai Admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage"],
    ipAddress: "127.0.0.1",
    userAgent: "CineSphere-Preview-Agent",
    correlationId: "corr-prev-002",
  };

  // Cross-tenant access blocked
  let crossTenantBlocked = false;
  try {
    await hallPreviewService.loadPreview(mumbaiActor, "ver-layout-pun-aud1-main-v3", "th-pun-001");
  } catch (err: any) {
    if (err.name === "AuthorizationError") crossTenantBlocked = true;
  }
  assert(crossTenantBlocked, "Cross-tenant access violation blocked with AuthorizationError");

  // Load preview bundle for Pune
  const bundle = await hallPreviewService.loadPreview(puneActor, "ver-layout-pun-aud1-main-v3", "th-pun-001");
  assert(bundle.layoutDefinition.id === "layout-pun-aud1-main", "Loaded layout definition for Pune Hall 1");
  assert(bundle.layoutVersion.versionNumber === 3, "Loaded layout version v3 for Pune Hall 1");
  assert(bundle.statistics.totalSeats > 0, `Bundle calculated statistics for ${bundle.statistics.totalSeats} seats`);

  // Run simulation via service
  const simRes = await hallPreviewService.runBookingSimulation(
    puneActor,
    "ver-layout-pun-aud1-main-v3",
    [bundle.seats[0].id, bundle.seats[1].id],
    "th-pun-001"
  );
  assert(simRes.selectedSeats.length === 2, "Simulation service accurately toggled 2 seats");
  assert(simRes.totalPrice > 0, "Simulation service calculated non-zero total booking price");

  // ----------------------------------------------------------------------------
  // SECTION 7: PROTECTED SERVER ACTIONS
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");

  const actionRes = await loadPreviewAction(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v3",
      theatreId: "th-pun-001",
      mode: "CUSTOMER",
      viewport: "DESKTOP",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actionRes.success === true, "loadPreviewAction executed cleanly");
  assert(actionRes.data?.layoutVersion.id === "ver-layout-pun-aud1-main-v3", "Action returned bundle for requested version");

  const configRes = await loadPreviewConfigAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(configRes.success === true, "loadPreviewConfigAction executed cleanly");
  assert(configRes.data?.theatreId === "th-pun-001", "Action returned preferences for Pune");

  const simActionRes = await runBookingSimulationAction(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v3",
      seatIdsToToggle: [bundle.seats[0].id],
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(simActionRes.success === true, "runBookingSimulationAction executed cleanly");
  assert(simActionRes.data?.selectedSeatIds.length === 1, "Action confirmed simulated seat selection");

  // ----------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("HALL PREVIEW VERIFICATION COMPLETED");
  console.log(`Passed: ${testsPassed} | Failed: ${testsFailed}`);
  console.log("==================================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPreviewVerificationSuite().catch((err) => {
  console.error("FATAL: Test suite crashed:", err);
  process.exit(1);
});
