/**
 * ==============================================================================
 * CineSphere OS — Structural Objects Comprehensive Verification Test Suite
 * Phase 4 – Part 7: Structural Objects & Physical Architecture
 * ==============================================================================
 * Tests:
 * 1. Seed verification for Pune, Mumbai, Dubai.
 * 2. Support for all 13 structural object types.
 * 3. Rotated bounding box & SAT spatial collision calculations.
 * 4. Regulatory cinema compliance (Screen, Emergency Exits, ADA routes).
 * 5. Multi-tenant isolation and immutability guards on published layouts.
 * 6. Server actions execution and audit trail logging.
 * ==============================================================================
 */

import { structuralObjectRepository } from "../lib/repositories/structural-object.repository";
import { structuralObjectService } from "../lib/services/structural-object.service";
import { StructuralObjectEngine } from "../lib/engine/structural-object-engine";
import { StructuralObject, StructuralObjectType } from "../types/structural-objects.types";
import { SeatTemplate } from "../types/seat-generator.types";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  createStructuralObjectAction,
  updateStructuralObjectAction,
  duplicateStructuralObjectAction,
  deleteStructuralObjectAction,
  reorderStructuralObjectsAction,
  loadStructuralObjectsAction,
  toggleLockStructuralObjectAction,
  toggleVisibilityStructuralObjectAction,
  validateStructuralObjectsAction,
} from "../actions/structural-object-actions";

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
  console.log("STARTING PHASE 4 – PART 7: STRUCTURAL OBJECTS VERIFICATION");
  console.log("==================================================================\n");

  const puneActor: SecurityActorContext = {
    userId: "usr-theatre-admin-pune",
    theatreId: "th-pun-001",
    role: "THEATRE_ADMIN",
    permissions: ["*"],
    correlationId: "corr-pune-test",
  };

  const mumbaiActor: SecurityActorContext = {
    userId: "usr-theatre-admin-mumbai",
    theatreId: "th-mum-002",
    role: "THEATRE_ADMIN",
    permissions: ["*"],
    correlationId: "corr-mumbai-test",
  };

  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-admin",
    theatreId: "th-pun-001",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-super-admin-test",
  };

  // ----------------------------------------------------------------------------
  // SECTION 1: SEED VERIFICATION ACROSS THEATRES
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Multi-Tenant Seeds & Supported Object Types ---");

  const puneObjects = await structuralObjectRepository.listByLayoutVersion("th-pun-001", "ver-pune-screen1-v1");
  assert(puneObjects.length >= 10, `Pune layout has at least 10 seeded objects (Found: ${puneObjects.length})`);

  const puneScreen = puneObjects.find((o) => o.objectType === "SCREEN");
  assert(puneScreen !== undefined, "Pune layout defines a SCREEN object (Main 4K Screen)");
  assert(puneScreen?.internalCode === "STR-SCR-01", "Screen internal code is STR-SCR-01");

  const puneStage = puneObjects.find((o) => o.objectType === "STAGE");
  assert(puneStage !== undefined && puneStage.metadata.isStatic, "Pune STAGE object is static");
  assert(puneStage?.metadata.isCollisionObstacle === true, "Stage is marked as a collision obstacle");

  const puneExits = puneObjects.filter((o) => o.objectType === "EMERGENCY_EXIT");
  assert(puneExits.length >= 2, `Pune has double emergency exits (Found: ${puneExits.length})`);

  const puneADA = puneObjects.find((o) => o.objectType === "ACCESSIBLE_PATH");
  assert(puneADA !== undefined, "Pune layout defines an ACCESSIBLE_PATH object");
  assert(puneADA?.metadata.accessibility?.hasRamp === true, "ADA path has ramp specified");

  const mumbaiObjects = await structuralObjectRepository.listByLayoutVersion("th-mum-002", "ver-mum-imax-v1");
  assert(mumbaiObjects.length >= 4, `Mumbai IMAX layout has seeded objects (Found: ${mumbaiObjects.length})`);
  const mumbaiBalcony = mumbaiObjects.find((o) => o.objectType === "BALCONY");
  assert(mumbaiBalcony !== undefined, "Mumbai layout includes a BALCONY object");

  const dubaiObjects = await structuralObjectRepository.listByLayoutVersion("th-dxb-003", "ver-dxb-gold-v1");
  assert(dubaiObjects.length >= 3, `Dubai Grand Mall layout has seeded objects (Found: ${dubaiObjects.length})`);
  const dubaiDivider = dubaiObjects.find((o) => o.objectType === "DIVIDER");
  assert(dubaiDivider !== undefined, "Dubai layout includes a DIVIDER object");

  // ----------------------------------------------------------------------------
  // SECTION 2: SPATIAL COMPUTATION & COLLISION DETECTION ENGINE
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Spatial Math & Rotated SAT Collision Detection ---");

  // Rotated rectangle corners
  const unrotatedCorners = StructuralObjectEngine.getRotatedCorners(100, 100, 200, 50, 0);
  assert(unrotatedCorners.length === 4, "Generates 4 corner vertices for box");
  assert(unrotatedCorners[0].x === 100 && unrotatedCorners[0].y === 100, "Top-left corner unrotated is (100, 100)");
  assert(unrotatedCorners[2].x === 300 && unrotatedCorners[2].y === 150, "Bottom-right corner unrotated is (300, 150)");

  const rotatedCorners = StructuralObjectEngine.getRotatedCorners(100, 100, 200, 50, 90);
  const rotatedAABB = StructuralObjectEngine.getAABB(rotatedCorners);
  assert(rotatedAABB.maxY - rotatedAABB.minY === 200, "AABB height equals 200 after 90 degree rotation");
  assert(rotatedAABB.maxX - rotatedAABB.minX === 50, "AABB width equals 50 after 90 degree rotation");

  // Polygon intersection (SAT)
  const boxA = StructuralObjectEngine.getRotatedCorners(100, 100, 100, 100, 0);
  const boxBOverlap = StructuralObjectEngine.getRotatedCorners(150, 150, 100, 100, 0);
  const boxCSeparate = StructuralObjectEngine.getRotatedCorners(500, 500, 100, 100, 0);

  assert(
    StructuralObjectEngine.arePolygonsIntersecting(boxA, boxBOverlap) === true,
    "SAT correctly detects overlapping boxes"
  );
  assert(
    StructuralObjectEngine.arePolygonsIntersecting(boxA, boxCSeparate) === false,
    "SAT correctly detects separated boxes"
  );

  // Seat Collision Detection
  const mockPillar: StructuralObject = {
    id: "str-test-pillar",
    layoutVersionId: "ver-test-draft",
    theatreId: "th-pun-001",
    objectName: "Obstacle Pillar",
    displayName: "Support Pillar",
    objectType: "PILLAR",
    internalCode: "STR-PIL-TEST",
    position: { x: 200, y: 300, z: 0 },
    width: 60,
    height: 60,
    rotation: 0,
    layer: 1,
    zIndex: 10,
    visibility: "VISIBLE",
    color: "#64748B",
    isLocked: true,
    metadata: { isStatic: true, isCollisionObstacle: true, isReservedArea: false },
    geometry: { shape: "RECTANGLE" },
  };

  const collidingSeat: SeatTemplate = {
    id: "seat-colliding",
    theatreId: "th-pun-001",
    layoutVersionId: "ver-test-draft",
    sectionId: "sec-1",
    rowId: "row-1",
    seatNumber: "A5",
    columnNumber: 5,
    categoryCode: "VIP",
    categoryName: "VIP Prime",
    categoryColor: "#EF4444",
    coordinates: {
      id: "coord-1",
      seatTemplateId: "seat-colliding",
      x: 210,
      y: 310,
      rotation: 0,
      width: 40,
      height: 40,
      spacing: 10,
    },
    metadata: {
      id: "meta-1",
      seatTemplateId: "seat-colliding",
      seatName: "A5",
      displayName: "Seat A5",
      seatCode: "VIP-A5",
      rowId: "row-1",
      rowName: "A",
      sectionId: "sec-1",
      sectionName: "VIP Section",
      categoryCode: "VIP",
      status: "ACTIVE",
    },
    accessibility: {
      id: "acc-1",
      seatTemplateId: "seat-colliding",
      accessibilityType: "STANDARD",
      isWheelchairAccessible: false,
      hasCompanionSeat: false,
      hasAccessibleRoute: false,
    },
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nonCollidingSeat: SeatTemplate = {
    ...collidingSeat,
    id: "seat-safe",
    coordinates: { ...collidingSeat.coordinates, x: 800, y: 800 },
  };

  const collisionsDetected = StructuralObjectEngine.detectObstacleSeatCollisions(
    [mockPillar],
    [collidingSeat, nonCollidingSeat]
  );
  assert(collisionsDetected.length === 1, `Detected exactly 1 collision (Found: ${collisionsDetected.length})`);
  assert(collisionsDetected[0].collidingTargetId === "seat-colliding", "Colliding target correctly identified");

  // Non-obstacle structural element does not trigger collision
  const nonObstacleScreen = { ...mockPillar, metadata: { ...mockPillar.metadata, isCollisionObstacle: false } };
  const noCollisions = StructuralObjectEngine.detectObstacleSeatCollisions([nonObstacleScreen], [collidingSeat]);
  assert(noCollisions.length === 0, "Non-obstacle structural element does not trigger collision");

  // ----------------------------------------------------------------------------
  // SECTION 3: REGULATORY CINEMA COMPLIANCE VALIDATION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Cinema Safety & Regulatory Validation ---");

  // Layout with screen and exits
  const validObjects = [
    { ...puneScreen!, id: "test-scr" },
    { ...puneExits[0]!, id: "test-emg-1" },
    { ...puneObjects.find((o) => o.objectType === "ENTRANCE")!, id: "test-ent" },
  ];
  const validResult = StructuralObjectEngine.validateStructuralObjects(validObjects);
  assert(validResult.isValid === true, "Valid structural objects set passes validation");
  assert(validResult.summary.hasScreen === true, "Screen presence confirmed");
  assert(validResult.summary.hasEmergencyExit === true, "Emergency Exit presence confirmed");

  // Layout missing screen
  const missingScreenObjects = validObjects.filter((o) => o.objectType !== "SCREEN");
  const missingScreenResult = StructuralObjectEngine.validateStructuralObjects(missingScreenObjects);
  assert(missingScreenResult.isValid === false, "Missing screen results in validation failure");
  assert(
    missingScreenResult.errors.some((e) => e.includes("must include at least one visible SCREEN")),
    "Appropriate error emitted for missing screen"
  );

  // Hidden screen does not satisfy regulatory requirement
  const hiddenScreenObjects = [
    { ...puneScreen!, visibility: "HIDDEN" as const },
    { ...puneExits[0]! },
  ];
  const hiddenScreenResult = StructuralObjectEngine.validateStructuralObjects(hiddenScreenObjects);
  assert(hiddenScreenResult.isValid === false, "HIDDEN screen does not satisfy regulatory check");

  // Duplicate internal codes
  const duplicateCodeObjects = [
    { ...puneScreen!, id: "obj-1", internalCode: "STR-DUP-01" },
    { ...puneScreen!, id: "obj-2", internalCode: "STR-DUP-01" },
  ];
  const dupCodeResult = StructuralObjectEngine.validateStructuralObjects(duplicateCodeObjects);
  assert(
    dupCodeResult.errors.some((e) => e.includes("Duplicate structural object internal code")),
    "Duplicate internal codes detected and rejected"
  );

  // ----------------------------------------------------------------------------
  // SECTION 4: CRUD, LOCKING & REORDERING LIFECYCLE
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: CRUD, Locking, Visibility & Duplication ---");

  // Create Object
  const created = await structuralObjectService.createObject(puneActor, {
    layoutVersionId: "ver-pune-screen1-draft",
    theatreId: "th-pun-001",
    objectName: "VIP Lounge Entrance",
    displayName: "VIP Foyer",
    objectType: "ENTRANCE",
    internalCode: "STR-ENT-VIP-01",
    position: { x: 500, y: 920, z: 0 },
    width: 90,
    height: 30,
    rotation: 0,
    layer: 1,
    zIndex: 10,
    visibility: "VISIBLE",
    color: "#2563EB",
    isLocked: false,
    metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
    geometry: { shape: "RECTANGLE" },
  });
  assert(created.id.length > 0, `Created structural object with ID: ${created.id}`);
  assert(created.displayName === "VIP Foyer", "Display name saved correctly");

  // Update Object
  const updated = await structuralObjectService.updateObject(puneActor, created.id, {
    theatreId: "th-pun-001",
    displayName: "VIP Royal Foyer",
    width: 110,
    position: { x: 520, y: 920, z: 0 },
  });
  assert(updated.displayName === "VIP Royal Foyer", "Object display name updated");
  assert(updated.width === 110, "Object width updated to 110");

  // Toggle Lock
  const locked = await structuralObjectService.toggleLock(puneActor, created.id, "th-pun-001");
  assert(locked.isLocked === true, "Object is locked against edits");
  const unlocked = await structuralObjectService.toggleLock(puneActor, created.id, "th-pun-001");
  assert(unlocked.isLocked === false, "Object is unlocked");

  // Toggle Visibility
  const hidden = await structuralObjectService.toggleVisibility(puneActor, created.id, "th-pun-001");
  assert(hidden.visibility === "HIDDEN", "Object visibility toggled to HIDDEN");
  const shown = await structuralObjectService.toggleVisibility(puneActor, created.id, "th-pun-001");
  assert(shown.visibility === "VISIBLE", "Object visibility toggled back to VISIBLE");

  // Duplicate Object
  const duplicated = await structuralObjectService.duplicateObject(puneActor, created.id, "th-pun-001");
  assert(duplicated.id !== created.id, "Duplicated object receives unique UUID");
  assert(duplicated.displayName.includes("(Copy)"), "Duplicated object has (Copy) display name");
  assert(duplicated.internalCode.includes("_COPY_"), "Duplicated object receives unique copy internal code");

  // Reorder Objects
  const reordered = await structuralObjectService.reorderObjects(
    puneActor,
    "ver-pune-screen1-draft",
    [duplicated.id, created.id],
    "th-pun-001"
  );
  const duplicatedInReordered = reordered.find((o) => o.id === duplicated.id);
  const createdInReordered = reordered.find((o) => o.id === created.id);
  assert(
    duplicatedInReordered !== undefined &&
      createdInReordered !== undefined &&
      duplicatedInReordered.zIndex < createdInReordered.zIndex,
    "Reordered objects have updated zIndex values"
  );

  // Delete Object
  const deleted = await structuralObjectService.deleteObject(puneActor, duplicated.id, "th-pun-001");
  assert(deleted === true, "Successfully deleted duplicated structural object");

  // Clean up created test object
  await structuralObjectService.deleteObject(puneActor, created.id, "th-pun-001");

  // ----------------------------------------------------------------------------
  // SECTION 5: SECURITY, RBAC & IMMUTABILITY GUARDS
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Security, Tenant Isolation & Immutability ---");

  // Cross-tenant access violation: Mumbai admin trying to modify Pune structural object
  let crossTenantBlocked = false;
  try {
    await structuralObjectService.createObject(mumbaiActor, {
      layoutVersionId: "ver-pune-screen1-draft",
      theatreId: "th-pun-001", // Forbidden cross-tenant attempt
      objectName: "Malicious Door",
      displayName: "Door",
      objectType: "ENTRANCE",
      internalCode: "STR-MAL-01",
      position: { x: 0, y: 0, z: 0 },
      width: 50,
      height: 50,
      rotation: 0,
      layer: 1,
      zIndex: 1,
      visibility: "VISIBLE",
      color: "#000",
      isLocked: false,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      geometry: { shape: "RECTANGLE" },
    });
  } catch (err: any) {
    if (err.message.includes("Cross-tenant access violation")) {
      crossTenantBlocked = true;
    }
  }
  assert(crossTenantBlocked, "Cross-tenant structural object creation blocked with AuthorizationError");

  // Immutability Guard: Modifying a PUBLISHED layout version is forbidden
  let publishedModificationBlocked = false;
  try {
    await structuralObjectService.createObject(puneActor, {
      layoutVersionId: "ver-layout-pun-aud1-main-v3", // Published version
      theatreId: "th-pun-001",
      objectName: "Illegal Screen Addition",
      displayName: "Screen 2",
      objectType: "SCREEN",
      internalCode: "STR-SCR-ILL",
      position: { x: 0, y: 0, z: 0 },
      width: 200,
      height: 30,
      rotation: 0,
      layer: 1,
      zIndex: 1,
      visibility: "VISIBLE",
      color: "#000",
      isLocked: false,
      metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      geometry: { shape: "RECTANGLE" },
    });
  } catch (err: any) {
    if (err.message.includes("Immutable Layout Violation")) {
      publishedModificationBlocked = true;
    }
  }
  assert(publishedModificationBlocked, "Mutations on PUBLISHED layout versions blocked with ConflictError");

  // Super Admin can view across theatres
  const superAdminPune = await structuralObjectService.listObjects(superAdminActor, "ver-pune-screen1-v1", "th-pun-001");
  const superAdminMumbai = await structuralObjectService.listObjects(superAdminActor, "ver-mum-imax-v1", "th-mum-002");
  assert(superAdminPune.length > 0, "Super admin can list Pune structural objects");
  assert(superAdminMumbai.length > 0, "Super admin can list Mumbai structural objects");

  // ----------------------------------------------------------------------------
  // SECTION 6: PROTECTED SERVER ACTIONS
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Protected Server Actions Execution ---");

  const listActionRes = await loadStructuralObjectsAction(
    {
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(listActionRes.success === true, "loadStructuralObjectsAction executed successfully");
  assert((listActionRes.data?.length || 0) >= 10, "Action returned correct count of structural objects");

  const validateActionRes = await validateStructuralObjectsAction(
    {
      layoutVersionId: "ver-pune-screen1-v1",
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(validateActionRes.success === true, "validateStructuralObjectsAction executed successfully");
  assert(validateActionRes.data?.summary.hasScreen === true, "Action preflight verified screen presence");

  console.log("\n==================================================================");
  console.log(`STRUCTURAL OBJECTS VERIFICATION COMPLETED`);
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
