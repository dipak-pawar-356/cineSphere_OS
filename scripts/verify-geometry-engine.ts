/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Comprehensive Test Suite
 * Phase 4 – Part 8: Geometry & Advanced Layout Engine
 * ==============================================================================
 * Tests:
 * 1. 2D Affine Transformations (Translate, Rotate, Scale, Mirror, Matrix).
 * 2. Curvature & Arc Mathematics (Sagitta, Chord, Radius, Arc Rows).
 * 3. Spatial Alignment & Equal Distribution algorithms.
 * 4. Transformation Pipeline Command Execution & Audit Trail.
 * 5. Preflight Layout Validation Gate before Publication.
 * 6. Theatre-specific Geometry Preferences.
 * 7. Protected Server Actions & Security Enforcements.
 * ==============================================================================
 */

import { GeometryEngine } from "../lib/engine/geometry-engine";
import { geometryLayoutService } from "../lib/services/geometry-layout.service";
import { geometryLayoutRepository } from "../lib/repositories/geometry-layout.repository";
import { structuralObjectRepository } from "../lib/repositories/structural-object.repository";
import {
  BaseLayoutObject,
  GeometryTransformCommand,
  Point2D,
} from "../types/geometry-layout.types";
import { HallSection } from "../types/section-row-designer.types";
import { SeatTemplate } from "../types/seat-generator.types";
import { StructuralObject } from "../types/structural-objects.types";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  applyTransformAction,
  mirrorLayoutAction,
  duplicateSelectionAction,
  saveGeometrySettingsAction,
  loadGeometrySettingsAction,
  validateLayoutBeforePublishAction,
} from "../actions/geometry-layout-actions";

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

async function runTestSuite() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 8: GEOMETRY ENGINE VERIFICATION");
  console.log("==================================================================\n");

  const puneActor: SecurityActorContext = {
    userId: "usr-theatre-admin-pune",
    theatreId: "th-pun-001",
    role: "THEATRE_ADMIN",
    permissions: ["*"],
    correlationId: "corr-pune-geom-test",
  };

  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-admin",
    theatreId: "th-pun-001",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-super-admin-geom-test",
  };

  // ----------------------------------------------------------------------------
  // SECTION 1: AFFINE 2D TRANSFORMATIONS (MATH PRIMITIVES)
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: 2D Point & Affine Matrix Transformations ---");

  // Translation
  const origPoint: Point2D = { x: 100, y: 150 };
  const translated = GeometryEngine.translatePoint(origPoint, 40, -50);
  assert(translated.x === 140 && translated.y === 100, "translatePoint translates (100, 150) + (40, -50) = (140, 100)");

  // Rotation
  const pivot: Point2D = { x: 100, y: 100 };
  const pToRotate: Point2D = { x: 200, y: 100 };
  const rotated90 = GeometryEngine.rotatePoint(pToRotate, 90, pivot);
  assert(rotated90.x === 100 && rotated90.y === 200, "rotatePoint rotates 90 degrees around pivot to (100, 200)");

  const rotated360 = GeometryEngine.rotatePoint(pToRotate, 360, pivot);
  assert(rotated360.x === pToRotate.x && rotated360.y === pToRotate.y, "360 degree rotation returns identical point");

  // Scaling
  const anchor: Point2D = { x: 50, y: 50 };
  const pToScale: Point2D = { x: 150, y: 100 };
  const scaled = GeometryEngine.scalePoint(pToScale, 2, 3, anchor);
  assert(scaled.x === 250 && scaled.y === 200, "scalePoint scales relative to anchor to (250, 200)");

  // Mirroring
  const horizMirrored = GeometryEngine.mirrorPoint({ x: 300, y: 400 }, "HORIZONTAL", 500);
  assert(horizMirrored.x === 700 && horizMirrored.y === 400, "Horizontal mirror reflects x across axis (x=300 across 500 -> 700)");

  const vertMirrored = GeometryEngine.mirrorPoint({ x: 300, y: 400 }, "VERTICAL", 600);
  assert(vertMirrored.x === 300 && vertMirrored.y === 800, "Vertical mirror reflects y across axis (y=400 across 600 -> 800)");

  // Affine Matrix
  const matrixResult = GeometryEngine.applyAffineMatrix({ x: 10, y: 20 }, [2, 0, 0, 3, 5, 10]);
  assert(matrixResult.x === 25 && matrixResult.y === 70, "applyAffineMatrix applies [2, 0, 0, 3, 5, 10] correctly");

  // ----------------------------------------------------------------------------
  // SECTION 2: CURVATURE & ARC MATHEMATICS
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Sagitta, Chord & Curved Row Geometry ---");

  // Sagitta computation: s = R * (1 - cos(theta / 2))
  // For R = 1000, arcAngle = 60 deg -> halfAngle = 30 deg -> cos(30) = 0.866025 -> s = 1000 * 0.133975 ~ 134
  const sagitta60 = GeometryEngine.calculateSagitta(1000, 60);
  assert(Math.abs(sagitta60 - 134) <= 1, `Sagitta calculation accurate (~134px, got ${sagitta60})`);

  // Inverse radius calculation: R = (s / 2) + (W^2 / (8 * s))
  // Chord W = 1000, s = 134 -> R should reconstruct ~ 1000
  const reconstructedR = GeometryEngine.calculateRadiusFromSagitta(1000, sagitta60);
  assert(Math.abs(reconstructedR - 1000) <= 50, `Radius reconstructed from sagitta and chord (~1000, got ${reconstructedR})`);

  // Arc points generation
  const arcPoints = GeometryEngine.generateArcPoints({ x: 0, y: 0 }, 500, -30, 30, 5);
  assert(arcPoints.length === 5, "generateArcPoints generates specified number of steps");
  assert(arcPoints[2].x === 500 && arcPoints[2].y === 0, "Apex point at 0 degrees is on circumference (500, 0)");

  // Arc row coordinates
  const arcRowSeats = GeometryEngine.calculateArcRowCoordinates(
    { x: 500, y: 200 },
    7, // 7 seats
    50, // 50px spacing
    600, // 600px radius
    30 // 30 deg arc
  );
  assert(arcRowSeats.length === 7, "Generates 7 seats for arc row");
  assert(arcRowSeats[3].x === 500, "Center seat (index 3) is aligned with row origin X (500)");
  assert(arcRowSeats[0].rotation === -15, "First seat rotation is -15 degrees");
  assert(arcRowSeats[6].rotation === 15, "Last seat rotation is +15 degrees");

  // ----------------------------------------------------------------------------
  // SECTION 3: SPATIAL ALIGNMENT & DISTRIBUTION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Alignment & Equal Distribution Tools ---");

  const testItems = [
    { id: "1", position: { x: 50, y: 100 }, width: 40, height: 40 },
    { id: "2", position: { x: 120, y: 200 }, width: 40, height: 40 },
    { id: "3", position: { x: 300, y: 150 }, width: 40, height: 40 },
  ];

  // Align Left
  const alignedLeft = GeometryEngine.alignObjects(testItems, "LEFT");
  assert(
    alignedLeft.every((o) => o.position.x === 50),
    "alignObjects(LEFT) sets all objects position.x to minimum (50)"
  );

  // Align Top
  const alignedTop = GeometryEngine.alignObjects(testItems, "TOP");
  assert(
    alignedTop.every((o) => o.position.y === 100),
    "alignObjects(TOP) sets all objects position.y to minimum (100)"
  );

  // Align Center X
  const alignedCenterX = GeometryEngine.alignObjects(testItems, "CENTER_X");
  const expectedCenterX = Math.round((50 + 340) / 2 - 20); // (minX + maxX) / 2 - width/2
  assert(
    alignedCenterX.every((o) => o.position.x === expectedCenterX),
    "alignObjects(CENTER_X) centers all objects horizontally"
  );

  // Equal Distribution Horizontal
  const distributedH = GeometryEngine.distributeObjects(testItems, "HORIZONTAL");
  const gap1 = distributedH[1].position.x - (distributedH[0].position.x + distributedH[0].width);
  const gap2 = distributedH[2].position.x - (distributedH[1].position.x + distributedH[1].width);
  assert(Math.abs(gap1 - gap2) <= 1, `distributeObjects(HORIZONTAL) creates equal spacing (${gap1}px vs ${gap2}px)`);

  // ----------------------------------------------------------------------------
  // SECTION 4: BATCH TRANSFORMATION COMMAND PIPELINE (INVARIANT 2)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Geometry Transformation Command Pipeline ---");

  const layoutObjects: BaseLayoutObject[] = [
    {
      id: "obj-a",
      layoutVersionId: "ver-draft-1",
      theatreId: "th-pun-001",
      objectType: "STRUCTURAL",
      name: "Screen",
      displayName: "Main Screen",
      position: { x: 300, y: 100 },
      width: 400,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      isVisible: true,
      isLocked: false,
      metadata: {},
    },
    {
      id: "obj-b",
      layoutVersionId: "ver-draft-1",
      theatreId: "th-pun-001",
      objectType: "STRUCTURAL",
      name: "Locked Pillar",
      displayName: "Pillar A",
      position: { x: 500, y: 500 },
      width: 40,
      height: 40,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      isVisible: true,
      isLocked: true, // LOCKED: MUST NOT MOVE
      metadata: {},
    },
  ];

  // Move command
  const moveCmd: GeometryTransformCommand = {
    id: "cmd-move-1",
    layoutVersionId: "ver-draft-1",
    theatreId: "th-pun-001",
    type: "MOVE",
    targetObjectIds: ["obj-a", "obj-b"],
    params: { dx: 50, dy: 30 },
    timestamp: new Date().toISOString(),
    appliedBy: "usr-admin",
  };

  const moved = GeometryEngine.applyTransformationToObjects(layoutObjects, moveCmd);
  const movedObjA = moved.find((o) => o.id === "obj-a");
  const movedObjB = moved.find((o) => o.id === "obj-b");

  assert(movedObjA?.position.x === 350 && movedObjA?.position.y === 130, "Unlocked object successfully moved (+50, +30)");
  assert(movedObjB?.position.x === 500 && movedObjB?.position.y === 500, "Locked object remained completely untouched");

  // Scale command
  const scaleCmd: GeometryTransformCommand = {
    id: "cmd-scale-1",
    layoutVersionId: "ver-draft-1",
    theatreId: "th-pun-001",
    type: "SCALE",
    targetObjectIds: ["obj-a"],
    params: { scaleX: 1.5, scaleY: 2.0 },
    timestamp: new Date().toISOString(),
    appliedBy: "usr-admin",
  };

  const scaledObjects = GeometryEngine.applyTransformationToObjects(layoutObjects, scaleCmd);
  const scaledObjA = scaledObjects.find((o) => o.id === "obj-a");
  assert(scaledObjA?.width === 600, "Scale command scaled width 400 * 1.5 = 600");
  assert(scaledObjA?.height === 60, "Scale command scaled height 30 * 2.0 = 60");

  // ----------------------------------------------------------------------------
  // SECTION 5: PREFLIGHT LAYOUT VALIDATION ENGINE (INVARIANT 3)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Preflight Publication Validation Gate ---");

  // Mock complete compliant layout
  const mockSections: HallSection[] = [
    {
      id: "sec-vip",
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
      name: "VIP Prime",
      displayName: "VIP Recliners",
      internalCode: "SEC-VIP",
      color: "#EF4444",
      seatCategory: "VIP",
      priority: 1,
      rotation: 0,
      position: { x: 200, y: 300 },
      visibility: "VISIBLE",
      geometry: { shapeType: "RECTANGLE" },
      labelPosition: "TOP",
      capacity: 10,
      displayOrder: 1,
      rows: [
        {
          id: "row-1",
          sectionId: "sec-vip",
          theatreId: "th-pun-001",
          rowName: "A",
          displayName: "Row A",
          seatCount: 10,
          sequence: 1,
          spacing: 10,
          rotation: 0,
          visibility: "VISIBLE",
          accessibility: "STANDARD",
          geometry: { geometryType: "STRAIGHT" },
          configuration: {
            numberingStrategy: "ALPHABETICAL",
            isReversed: false,
            startIndex: 1,
            endIndex: 10,
          },
          seats: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockSeats: SeatTemplate[] = Array.from({ length: 10 }, (_, i) => ({
    id: `seat-${i + 1}`,
    theatreId: "th-pun-001",
    layoutVersionId: "ver-pune-screen1-v1",
    sectionId: "sec-vip",
    rowId: "row-1",
    seatNumber: `A${i + 1}`,
    columnNumber: i + 1,
    categoryCode: "VIP",
    categoryName: "VIP Prime",
    categoryColor: "#EF4444",
    coordinates: {
      id: `coord-${i + 1}`,
      seatTemplateId: `seat-${i + 1}`,
      x: 300 + i * 45,
      y: 400,
      rotation: 0,
      width: 40,
      height: 40,
      spacing: 10,
    },
    metadata: {
      id: `meta-${i + 1}`,
      seatTemplateId: `seat-${i + 1}`,
      seatName: `A${i + 1}`,
      displayName: `Seat A${i + 1}`,
      seatCode: `VIP-A${i + 1}`,
      rowId: "row-1",
      rowName: "A",
      sectionId: "sec-vip",
      sectionName: "VIP Prime",
      categoryCode: "VIP",
      status: "ACTIVE",
    },
    accessibility: {
      id: `acc-${i + 1}`,
      seatTemplateId: `seat-${i + 1}`,
      accessibilityType: i === 0 ? "WHEELCHAIR" : "STANDARD",
      isWheelchairAccessible: i === 0,
      hasCompanionSeat: i === 1,
      hasAccessibleRoute: true,
    },
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const mockStructuralObjects: StructuralObject[] = [
    {
      id: "str-scr",
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
      objectName: "Screen",
      displayName: "Main Screen",
      objectType: "SCREEN",
      internalCode: "STR-SCR",
      position: { x: 300, y: 50, z: 0 },
      width: 600,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: "#0284C7",
      isLocked: true,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      geometry: { shape: "RECTANGLE" },
    },
    {
      id: "str-emg",
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
      objectName: "Emergency Exit",
      displayName: "Exit",
      objectType: "EMERGENCY_EXIT",
      internalCode: "STR-EMG",
      position: { x: 50, y: 200, z: 0 },
      width: 60,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 15,
      visibility: "VISIBLE",
      color: "#16A34A",
      isLocked: false,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
      geometry: { shape: "RECTANGLE" },
    },
    {
      id: "str-ent",
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
      objectName: "Main Entrance",
      displayName: "Entrance",
      objectType: "ENTRANCE",
      internalCode: "STR-ENT",
      position: { x: 500, y: 900, z: 0 },
      width: 100,
      height: 35,
      rotation: 0,
      layer: 1,
      zIndex: 15,
      visibility: "VISIBLE",
      color: "#2563EB",
      isLocked: false,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
      geometry: { shape: "RECTANGLE" },
    },
    {
      id: "str-pth",
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
      objectName: "ADA Ramp",
      displayName: "Accessible Route",
      objectType: "ACCESSIBLE_PATH",
      internalCode: "STR-PTH",
      position: { x: 100, y: 220, z: 0 },
      width: 70,
      height: 500,
      rotation: 0,
      layer: 1,
      zIndex: 3,
      visibility: "VISIBLE",
      color: "#6366F1",
      isLocked: false,
      metadata: { isStatic: false, isCollisionObstacle: false, isReservedArea: true },
      geometry: { shape: "RECTANGLE" },
    },
  ];

  // 1. Valid compliant preflight check
  const preflightCompliant = GeometryEngine.validateLayoutBeforePublish({
    layoutVersion: { id: "ver-pune-screen1-v1", status: "DRAFT" },
    sections: mockSections,
    seats: mockSeats,
    structuralObjects: mockStructuralObjects,
  });

  assert(preflightCompliant.canPublish === true, "Fully compliant layout passes preflight check (canPublish: true)");
  assert(preflightCompliant.blockingErrors.length === 0, "Zero blocking errors on compliant layout");
  assert(preflightCompliant.checklist.hasScreen === true, "Preflight checklist confirms screen presence");
  assert(preflightCompliant.checklist.hasEmergencyExit === true, "Preflight checklist confirms emergency exits");
  assert(preflightCompliant.checklist.hasAccessiblePath === true, "Preflight checklist confirms ADA route");
  assert(preflightCompliant.checklist.hasNoStructuralCollisions === true, "Preflight confirms zero structural collisions");

  // 2. Preflight check with missing screen
  const preflightMissingScreen = GeometryEngine.validateLayoutBeforePublish({
    layoutVersion: { id: "ver-pune-screen1-v1" },
    sections: mockSections,
    seats: mockSeats,
    structuralObjects: mockStructuralObjects.filter((o) => o.objectType !== "SCREEN"),
  });
  assert(preflightMissingScreen.canPublish === false, "Missing screen blocks publication (canPublish: false)");
  assert(preflightMissingScreen.checklist.hasScreen === false, "Checklist correctly flags missing screen");

  // 3. Preflight check with out of bounds seats
  const outOfBoundsSeats = [
    ...mockSeats,
    {
      ...mockSeats[0],
      id: "seat-oob",
      coordinates: { ...mockSeats[0].coordinates, x: 2500, y: 3000 }, // outside 1600x1200
    },
  ];
  const preflightOOB = GeometryEngine.validateLayoutBeforePublish({
    layoutVersion: { id: "ver-pune-screen1-v1" },
    sections: mockSections,
    seats: outOfBoundsSeats,
    structuralObjects: mockStructuralObjects,
  });
  assert(preflightOOB.canPublish === false, "Out of bounds seats block publication");
  assert(preflightOOB.checklist.hasNoOutOfBounds === false, "Checklist correctly flags out-of-bounds seats");

  // ----------------------------------------------------------------------------
  // SECTION 6: THEATRE-SPECIFIC GEOMETRY PREFERENCES
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Theatre-Specific Geometry Settings ---");

  const puneSettings = await geometryLayoutRepository.getSettings("th-pun-001");
  assert(puneSettings.allowCurvedVIP === true, "Pune allows curved VIP sections");
  assert(puneSettings.enableSymmetry === false, "Pune has symmetry disabled");

  const mumbaiSettings = await geometryLayoutRepository.getSettings("th-mum-002");
  assert(mumbaiSettings.enableSymmetry === true, "Mumbai has symmetry enabled");
  assert(mumbaiSettings.allowCurvedVIP === false, "Mumbai has curved VIP disabled (straight preferred)");

  const dubaiSettings = await geometryLayoutRepository.getSettings("th-dxb-003");
  assert(dubaiSettings.defaultCurveRadius === 1000, "Dubai uses 1000px default curvature radius");

  // Update Pune geometry preferences
  const updatedPune = await geometryLayoutService.saveGeometrySettings(puneActor, {
    defaultCurveRadius: 850,
    enableSymmetry: true,
  });
  assert(updatedPune.defaultCurveRadius === 850, "Successfully updated defaultCurveRadius to 850");
  assert(updatedPune.enableSymmetry === true, "Successfully updated enableSymmetry to true");

  // ----------------------------------------------------------------------------
  // SECTION 7: PROTECTED SERVER ACTIONS
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");

  const settingsActionRes = await loadGeometrySettingsAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(settingsActionRes.success === true, "loadGeometrySettingsAction executed cleanly");
  assert(settingsActionRes.data?.theatreId === "th-pun-001", "Action returned settings for requested theatre");

  const preflightActionRes = await validateLayoutBeforePublishAction(
    {
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(preflightActionRes.success === true, "validateLayoutBeforePublishAction executed cleanly");
  assert(preflightActionRes.data?.checklist.hasScreen === true, "Preflight action confirms screen presence");

  // Mirror action on draft version
  const mirrorActionRes = await mirrorLayoutAction(
    {
      layoutVersionId: "ver-pune-screen1-draft",
      theatreId: "th-pun-001",
      axis: "HORIZONTAL",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(mirrorActionRes.success === true, "mirrorLayoutAction executed cleanly on DRAFT layout");

  console.log("\n==================================================================");
  console.log(`GEOMETRY ENGINE VERIFICATION COMPLETED`);
  console.log(`Passed: ${testsPassed} | Failed: ${testsFailed}`);
  console.log("==================================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Unhandled test failure:", err);
  process.exit(1);
});
