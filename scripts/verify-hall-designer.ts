/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Verification Suite (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Comprehensive automated verification testing:
 * 1. Part 1 (Hall Designer Foundation):
 *    - Layout Definition layer as immutable source of truth
 *    - Draft vs Published vs Archived separation
 *    - Show seat inventory isolation (in-flight shows unaffected by draft edits)
 *    - Layout validation engine (duplicate seats, out-of-bounds, invalid transitions)
 *    - Publish workflow, automatic archiving, version history
 *    - Duplication, restore, and multi-tenant isolation
 * 2. Part 2 (Canvas & Grid System):
 *    - Multi-density grid snapping (10px, 20px, 40px) with snapStrength threshold
 *    - Unit conversion engine (PX, CM, FT, M)
 *    - Fit to screen mathematical viewport bounds and zoom clamping
 *    - Geometric seat alignments (Left, Right, Top, Bottom, Center H, Center V, Distribute)
 *    - Smart alignment guides detection
 *    - Theatre-specific canvas preferences persistence (Pune, Mumbai, Dubai)
 * ==============================================================================
 */

import { hallDesignerService } from "../lib/services/hall-designer.service";
import { CanvasGridEngine } from "../lib/engine/canvas-grid-engine";
import { LayoutValidator } from "../lib/engine/layout-validator";
import { SecurityActorContext } from "../types/security-hardening.types";
import { SeatDefinition, HallSectionDefinition } from "../types/hall-designer.types";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✅ PASSED: ${message}`);
}

async function runTestSuite() {
  console.log("==============================================================================");
  console.log("🎬 CineSphere OS — Phase 4 Parts 1 & 2 Verification Suite");
  console.log("==============================================================================\n");

  const puneActor: SecurityActorContext = {
    userId: "usr-pune-admin",
    theatreId: "th-pun-001",
    role: "THEATRE_ADMIN",
    permissions: ["hall:manage", "layout:edit", "layout:publish"],
    correlationId: "corr-pune-test",
  };

  const mumbaiActor: SecurityActorContext = {
    userId: "usr-mum-admin",
    theatreId: "th-mum-002",
    role: "THEATRE_ADMIN",
    permissions: ["hall:manage", "layout:edit"],
    correlationId: "corr-mum-test",
  };

  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-super-test",
  };

  // ============================================================================
  // PART 1: Hall Designer Foundation & Versioning Engine
  // ============================================================================
  console.log("--- 1. Testing Layout Definition Foundation & Seed Data ---");
  const puneDefs = hallDesignerService.listLayoutDefinitions(puneActor, "hall-pun-aud1");
  assert(puneDefs.length >= 1, "Pune Hall 1 has initial seeded Layout Definition");

  const layoutDefId = puneDefs[0].id;
  const defDetails = hallDesignerService.getLayoutDefinition(puneActor, layoutDefId);
  assert(defDetails.definition.name === "IMAX Laser Master Blueprint", "Layout Definition name matched");
  assert(defDetails.versions.length >= 2, "Contains multiple version revisions in history (v3 published, v4 draft)");
  assert(defDetails.currentPublishedVersion !== undefined, "Currently has a published live version (v3)");
  assert(defDetails.currentPublishedVersion?.versionNumber === 3, "Current live version is v3");
  assert(defDetails.activeDraftVersion !== undefined, "Currently has an active draft version (v4)");
  assert(defDetails.activeDraftVersion?.versionNumber === 4, "Current active draft is v4");

  console.log("\n--- 2. Testing Isolation: Live Layout vs In-Progress Draft ---");
  // In-flight shows and bookings query getPublishedLayoutForHall
  const liveForHall = hallDesignerService.getPublishedLayoutForHall(puneActor, "hall-pun-aud1");
  assert(liveForHall !== undefined, "Published layout retrieved for hall");
  assert(liveForHall?.versionNumber === 3, "In-flight shows read published version v3");
  assert(liveForHall?.seats.length === 100, "Published version v3 has exactly 100 seats (Galaxy Hall 1 standard)");

  // Draft version can be modified without altering published version
  const draftVer = defDetails.activeDraftVersion!;
  assert(draftVer.status === "DRAFT", "Draft version status is strictly 'DRAFT'");
  const updatedDraft = hallDesignerService.updateDraftLayout(puneActor, draftVer.id, {
    versionNotes: "Draft renovation: added 2 additional recliners",
    seats: [
      ...draftVer.seats,
      {
        id: "seat-extra-1",
        seatNumber: "VIP-X1",
        row: "VIP",
        column: 11,
        sectionId: "sec-pun-vip",
        seatType: "Recliner",
        coordinates: { x: 300, y: 140 },
        isActive: true,
      },
    ],
  });
  assert(updatedDraft.seats.length === 101, "Draft now contains 101 seats");

  // Re-verify that live published version remains untouched at 100 seats
  const liveAfterDraftUpdate = hallDesignerService.getPublishedLayoutForHall(puneActor, "hall-pun-aud1");
  assert(liveAfterDraftUpdate?.seats.length === 100, "CRITICAL: Live published layout remains completely isolated and unchanged at 100 seats!");

  console.log("\n--- 3. Testing Immutability Protection ---");
  let immutableErrorThrown = false;
  try {
    // Attempting to edit a PUBLISHED version directly must throw ConflictError
    hallDesignerService.updateDraftLayout(puneActor, defDetails.currentPublishedVersion!.id, {
      versionNotes: "Illegal edit to live version",
    });
  } catch (err: any) {
    immutableErrorThrown = true;
    assert(err.message.includes("Immutable Version Policy"), "Direct modification of published version strictly blocked by policy");
  }
  assert(immutableErrorThrown, "Immutable protection verified");

  console.log("\n--- 4. Testing Layout Validation Engine ---");
  // Test duplicate seat numbers
  const invalidSeats: SeatDefinition[] = [
    {
      id: "s1",
      seatNumber: "A1",
      row: "A",
      column: 1,
      sectionId: "sec-1",
      seatType: "Standard",
      coordinates: { x: 100, y: 100 },
      isActive: true,
    },
    {
      id: "s2",
      seatNumber: "A1", // Duplicate!
      row: "A",
      column: 1,
      sectionId: "sec-1",
      seatType: "Standard",
      coordinates: { x: 140, y: 100 },
      isActive: true,
    },
  ];
  const valResultDup = LayoutValidator.validateLayoutVersion({
    sections: [{ id: "sec-1", name: "Sec 1", displayOrder: 1, seatCount: 2, seatType: "Standard", displayColor: "#fff", rowLabels: ["A"], seatsPerRow: 2 }],
    seats: invalidSeats,
    gridConfig: { rows: 5, columns: 5, totalCapacity: 2 },
  });
  assert(!valResultDup.isValid, "Validation correctly caught duplicate seat number 'A1'");
  assert(valResultDup.summary.duplicateSeatNumbers.includes("A1"), "Summary lists duplicate seat 'A1'");

  // Test coordinate collision
  const collisionSeats: SeatDefinition[] = [
    {
      id: "s1",
      seatNumber: "A1",
      row: "A",
      column: 1,
      sectionId: "sec-1",
      seatType: "Standard",
      coordinates: { x: 100, y: 100 },
      isActive: true,
    },
    {
      id: "s2",
      seatNumber: "A2",
      row: "A",
      column: 2,
      sectionId: "sec-1",
      seatType: "Standard",
      coordinates: { x: 100, y: 100 }, // Collision at (100, 100)
      isActive: true,
    },
  ];
  const valResultCollision = LayoutValidator.validateLayoutVersion({
    sections: [{ id: "sec-1", name: "Sec 1", displayOrder: 1, seatCount: 2, seatType: "Standard", displayColor: "#fff", rowLabels: ["A"], seatsPerRow: 2 }],
    seats: collisionSeats,
    gridConfig: { rows: 5, columns: 5, totalCapacity: 2 },
  });
  assert(!valResultCollision.isValid, "Validation correctly caught coordinate collision at (100, 100)");

  // Test legal vs illegal status transitions
  assert(LayoutValidator.isValidStatusTransition("DRAFT", "PUBLISHED").allowed, "Transition DRAFT -> PUBLISHED is allowed");
  assert(LayoutValidator.isValidStatusTransition("PUBLISHED", "ARCHIVED").allowed, "Transition PUBLISHED -> ARCHIVED is allowed");
  assert(!LayoutValidator.isValidStatusTransition("PUBLISHED", "DRAFT").allowed, "Transition PUBLISHED -> DRAFT is strictly forbidden");

  console.log("\n--- 5. Testing Layout Publishing & Lifecycle Transitions ---");
  // Clean valid draft for publication
  const validDraftSeats: SeatDefinition[] = [];
  for (let r = 0; r < 2; r++) {
    const rowChar = String.fromCharCode(65 + r);
    for (let c = 1; c <= 5; c++) {
      validDraftSeats.push({
        id: `seat-${rowChar}${c}`,
        seatNumber: `${rowChar}${c}`,
        row: rowChar,
        column: c,
        sectionId: "sec-new",
        seatType: "Standard",
        coordinates: { x: c * 40, y: (r + 1) * 40 },
        isActive: true,
      });
    }
  }
  const validSections: HallSectionDefinition[] = [
    {
      id: "sec-new",
      name: "New Hall Section",
      displayOrder: 1,
      seatCount: 10,
      seatType: "Standard",
      displayColor: "#10B981",
      rowLabels: ["A", "B"],
      seatsPerRow: 5,
    },
  ];

  hallDesignerService.updateDraftLayout(puneActor, draftVer.id, {
    sections: validSections,
    seats: validDraftSeats,
    gridConfig: { rows: 2, columns: 5, totalCapacity: 10 },
  });

  const publishRes = hallDesignerService.publishLayoutVersion(puneActor, layoutDefId, draftVer.id);
  assert(publishRes.publishedVersion.status === "PUBLISHED", "Published version status changed to 'PUBLISHED'");
  assert(publishRes.definition.currentPublishedVersionId === draftVer.id, "Definition pointer updated to v4");

  // Verify previous version (v3) was automatically archived
  const v3Check = hallDesignerService.getLayoutVersion(puneActor, defDetails.currentPublishedVersion!.id);
  assert(v3Check.status === "ARCHIVED", "Previous live version (v3) automatically transitioned to 'ARCHIVED'");

  // Verify that new bookings now see v4 (10 seats)
  const newLiveLayout = hallDesignerService.getPublishedLayoutForHall(puneActor, "hall-pun-aud1");
  assert(newLiveLayout?.versionNumber === 4, "In-flight shows now seamlessly use published version v4");
  assert(newLiveLayout?.seats.length === 10, "New live layout has exactly 10 seats");

  console.log("\n--- 6. Testing Duplication, Creation, and Tenant Isolation ---");
  // Duplication
  const dupRes = hallDesignerService.duplicateLayout(puneActor, layoutDefId, "Duplicated Summer Layout");
  assert(dupRes.definition.name === "Duplicated Summer Layout", "Duplicated layout created with new name");
  assert(dupRes.initialVersion.seats.length === 10, "Duplicated version copied seat structure");

  // Conflict error on duplicate layout name
  let conflictThrown = false;
  try {
    hallDesignerService.createLayoutDefinition(puneActor, {
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      name: "Duplicated Summer Layout", // Conflict!
    });
  } catch (err: any) {
    conflictThrown = true;
    assert(err.message.includes("already exists"), "Duplicate layout name rejected with ConflictError");
  }
  assert(conflictThrown, "Layout name uniqueness per hall enforced");

  // Tenant Boundary Check: Mumbai admin cannot access Pune layout
  let tenantViolationThrown = false;
  try {
    hallDesignerService.getLayoutDefinition(mumbaiActor, layoutDefId, "th-pun-001");
  } catch (err: any) {
    tenantViolationThrown = true;
    assert(err.message.includes("Cross-tenant access violation"), "Cross-tenant access violation caught");
  }
  assert(tenantViolationThrown, "Tenant boundary isolation enforced");

  // ============================================================================
  // PART 2: Visual Canvas & Grid System Engine
  // ============================================================================
  console.log("\n--- 7. Testing Canvas Coordinate Snapping ---");
  // Grid size 20, threshold 8
  assert(CanvasGridEngine.snapCoordinate(19, 20, 8) === 20, "19 snaps to nearest 20 (delta 1 <= 8)");
  assert(CanvasGridEngine.snapCoordinate(22, 20, 8) === 20, "22 snaps to nearest 20 (delta 2 <= 8)");
  assert(CanvasGridEngine.snapCoordinate(11, 20, 8) === 11, "11 does NOT snap to 20 or 0 (delta 9 > 8)");
  assert(CanvasGridEngine.snapCoordinate(30, 20, 8) === 30, "30 is equidistant (delta 10 > 8), stays 30");

  const snapped2D = CanvasGridEngine.snapPosition(39, 61, 20, 8);
  assert(snapped2D.x === 40 && snapped2D.y === 60, "2D position (39, 61) correctly snaps to (40, 60)");

  console.log("\n--- 8. Testing Measurement Unit Conversions ---");
  // PX to CM
  const cmVal = CanvasGridEngine.convertUnit(377.95, "PX", "CM");
  assert(Math.abs(cmVal - 10) < 0.1, "377.95 PX converts to ~10.0 CM");

  // CM to PX and back
  const pxVal = CanvasGridEngine.convertUnit(10, "CM", "PX");
  assert(Math.abs(pxVal - 377.95) < 0.1, "10 CM converts back to ~377.95 PX");

  // PX to FT
  const ftVal = CanvasGridEngine.convertUnit(115.2, "PX", "FT");
  assert(Math.abs(ftVal - 1.0) < 0.05, "115.2 PX converts to 1.0 FT");

  // Identity conversion
  assert(CanvasGridEngine.convertUnit(150, "PX", "PX") === 150, "PX to PX identity holds");

  console.log("\n--- 9. Testing Viewport Fit-To-Screen Bounds Calculation ---");
  const fit = CanvasGridEngine.calculateFitToScreen(2400, 1800, 1200, 800, 50);
  assert(fit.zoom >= 0.25 && fit.zoom <= 1.5, "Computed fit zoom is safely clamped within [0.25, 1.5]");
  assert(typeof fit.panX === "number" && typeof fit.panY === "number", "Calculated valid panX and panY centering coordinates");

  console.log("\n--- 10. Testing Geometric Seat Alignment Operations ---");
  const unalignedSeats: SeatDefinition[] = [
    { id: "s1", seatNumber: "A1", row: "A", column: 1, sectionId: "sec", seatType: "Standard", coordinates: { x: 120, y: 100 }, isActive: true },
    { id: "s2", seatNumber: "A2", row: "A", column: 2, sectionId: "sec", seatType: "Standard", coordinates: { x: 250, y: 150 }, isActive: true },
    { id: "s3", seatNumber: "A3", row: "A", column: 3, sectionId: "sec", seatType: "Standard", coordinates: { x: 400, y: 200 }, isActive: true },
  ];

  // Align Left -> all selected seats should take min X (120)
  const leftAligned = CanvasGridEngine.alignSeats(unalignedSeats, "ALIGN_LEFT");
  assert(leftAligned.every((s) => s.coordinates.x === 120), "ALIGN_LEFT aligned all seats to min x=120");

  // Align Top -> all selected seats should take min Y (100)
  const topAligned = CanvasGridEngine.alignSeats(unalignedSeats, "ALIGN_TOP");
  assert(topAligned.every((s) => s.coordinates.y === 100), "ALIGN_TOP aligned all seats to min y=100");

  // Center Horizontal -> all seats set to avg center X ((120+400)/2 = 260)
  const centerH = CanvasGridEngine.alignSeats(unalignedSeats, "CENTER_HORIZONTAL");
  assert(centerH[0].coordinates.x === 260, `CENTER_HORIZONTAL placed seats at center x=260`);

  // Distribute Horizontally
  const distributed = CanvasGridEngine.alignSeats(unalignedSeats, "DISTRIBUTE_HORIZONTALLY");
  assert(distributed[0].coordinates.x === 120, "First distributed seat at min X=120");
  assert(distributed[2].coordinates.x === 400, "Last distributed seat at max X=400");
  assert(distributed[1].coordinates.x === 260, "Middle distributed seat spaced exactly at center X=260");

  console.log("\n--- 11. Testing Smart Alignment Guides Detection ---");
  const guideSeats: SeatDefinition[] = [
    { id: "g1", seatNumber: "A1", row: "A", column: 1, sectionId: "sec", seatType: "Standard", coordinates: { x: 100, y: 200 }, isActive: true },
    { id: "g2", seatNumber: "A2", row: "A", column: 2, sectionId: "sec", seatType: "Standard", coordinates: { x: 300, y: 202 }, isActive: true },
  ];
  const draggedSeat: SeatDefinition = {
    id: "g3",
    seatNumber: "A3",
    row: "A",
    column: 3,
    sectionId: "sec",
    seatType: "Standard",
    coordinates: { x: 102, y: 500 }, // within 4px of x=100
    isActive: true,
  };
  const guides = CanvasGridEngine.calculateSmartGuides(guideSeats, draggedSeat, 4);
  assert(guides.some((g) => g.type === "VERTICAL" && g.coordinate === 100), "Smart guide detected vertical alignment at x=100");

  console.log("\n--- 12. Testing Theatre-Specific Canvas Preferences ---");
  // Pune: 20px, 100%, PX, snap true
  const punePrefs = hallDesignerService.getCanvasPreferences(puneActor, "th-pun-001");
  assert(punePrefs.gridSize === 20, "Pune theatre grid size is 20px");
  assert(punePrefs.measurementUnit === "PX", "Pune theatre unit is PX");
  assert(punePrefs.snapEnabled === true, "Pune theatre snapping is enabled");

  // Mumbai: 10px, 75%, CM, snap false
  const mumPrefs = hallDesignerService.getCanvasPreferences(superAdminActor, "th-mum-002");
  assert(mumPrefs.gridSize === 10, "Mumbai theatre grid size is 10px (high density)");
  assert(mumPrefs.measurementUnit === "CM", "Mumbai theatre unit is CM");
  assert(mumPrefs.snapEnabled === false, "Mumbai theatre snapping is disabled by custom preference");
  assert(mumPrefs.defaultZoom === 75, "Mumbai theatre default zoom is 75%");

  // Dubai: 25px, 125%, FT, snap true
  const dxbPrefs = hallDesignerService.getCanvasPreferences(superAdminActor, "th-dxb-003");
  assert(dxbPrefs.measurementUnit === "FT", "Dubai theatre unit is FT");
  assert(dxbPrefs.defaultZoom === 125, "Dubai theatre default zoom is 125%");

  // Update Pune Preferences
  const updatedPunePrefs = hallDesignerService.saveCanvasPreferences(
    puneActor,
    { gridSize: 40, gridDensity: "LARGE", snapStrength: 12 },
    "th-pun-001"
  );
  assert(updatedPunePrefs.gridSize === 40, "Updated Pune grid size to 40px");
  assert(updatedPunePrefs.snapStrength === 12, "Updated Pune snap strength to 12px");

  // Reset Pune Preferences
  const resetPune = hallDesignerService.resetCanvasPreferences(puneActor, "th-pun-001");
  assert(resetPune.gridSize === 20, "Reset restored Pune grid size to factory default 20px");

  console.log("\n==============================================================================");
  console.log(`🎉 ALL TESTS PASSED! (${passedTests}/${totalTests} checks verified)`);
  console.log("==============================================================================");
}

runTestSuite().catch((err) => {
  console.error("Verification suite failed:", err);
  process.exit(1);
});
