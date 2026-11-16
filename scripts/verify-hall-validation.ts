/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Comprehensive Verification Test Suite
 * Phase 4 – Part 10: Pluggable Rule-Based Layout Validation Engine & Publish Gate
 * ==============================================================================
 */

import { HallValidationEngine } from "../lib/engine/hall-validation-engine";
import { hallValidationRepository } from "../lib/repositories/hall-validation.repository";
import { hallValidationService } from "../lib/services/hall-validation.service";
import {
  runValidationAction,
  validateHallLayoutAction,
  loadValidationRulesAction,
  saveValidationConfigAction,
  validateBeforePublishAction,
} from "../actions/hall-validation-actions";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  ValidationRule,
  ValidationRuleContext,
  ValidationPolicy,
} from "../types/hall-validation.types";

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

async function runValidationVerificationSuite() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 10: HALL VALIDATION ENGINE VERIFICATION");
  console.log("==================================================================");

  // ----------------------------------------------------------------------------
  // SECTION 1: VALIDATION RULE REGISTRY & CATALOG
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 1: Validation Rule Registry & Catalog ---");

  const allRules = HallValidationEngine.listRegisteredRules();
  assert(allRules.length >= 10, `Registry contains at least 10 core rules (Found: ${allRules.length})`);

  const screenRules = allRules.filter((r) => r.category === "SCREEN");
  assert(screenRules.length >= 1, `Screen category contains rules (Found: ${screenRules.length})`);

  const egressRules = allRules.filter((r) => r.category === "ENTRANCE_EXIT");
  assert(egressRules.length >= 2, `Entrance/Exit category contains rules (Found: ${egressRules.length})`);

  const accessibilityRules = allRules.filter((r) => r.category === "ACCESSIBILITY");
  assert(accessibilityRules.length >= 1, `Accessibility category contains rules (Found: ${accessibilityRules.length})`);

  const geometryRules = allRules.filter((r) => r.category === "GEOMETRY");
  assert(geometryRules.length >= 1, `Geometry category contains rules (Found: ${geometryRules.length})`);

  const structuralRules = allRules.filter((r) => r.category === "STRUCTURAL");
  assert(structuralRules.length >= 1, `Structural category contains rules (Found: ${structuralRules.length})`);

  const seatRules = allRules.filter((r) => r.category === "SEAT");
  assert(seatRules.length >= 2, `Seat category contains rules (Found: ${seatRules.length})`);

  // Test pluggable custom rule registration
  const customRule: ValidationRule = {
    id: "rule-custom-acoustic",
    ruleCode: "RULE_ACOUSTIC_BAFFLE_CHECK",
    name: "Acoustic Wall Baffle Density",
    description: "Verifies the presence of sound-dampening acoustic wall treatments.",
    category: "STRUCTURAL",
    defaultSeverity: "INFO",
    isSystemRule: false,
    isActive: true,
    remediationGuidance: "Add acoustic wall baffles along rear and lateral surfaces.",
  };

  HallValidationEngine.registerRule(customRule, async (ctx) => {
    return {
      passed: true,
      severity: "INFO",
      message: "Acoustic baffle density complies with cinema audio standards.",
      affectedObjectIds: [],
      affectedObjectNames: [],
      remediationGuidance: "Ensure acoustic treatments are maintained.",
    };
  });

  const updatedRules = HallValidationEngine.listRegisteredRules();
  assert(
    updatedRules.some((r) => r.ruleCode === "RULE_ACOUSTIC_BAFFLE_CHECK"),
    "Successfully registered custom pluggable validation rule"
  );

  // ----------------------------------------------------------------------------
  // SECTION 2: PURE RULE EXECUTION & EDGE CASE DETECTION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Pure Rule Execution & Edge Case Detection ---");

  // Fixture A: Layout missing projection screen
  const ctxNoScreen: ValidationRuleContext = {
    theatreId: "th-pun-001",
    layoutVersionId: "ver-mock-001",
    layoutDefinitionName: "Mock Screen Missing",
    canvasBounds: { width: 1600, height: 1200 },
    sections: [],
    seats: [],
    structuralObjects: [], // Zero structural objects -> no screen!
  };

  const reportNoScreen = await HallValidationEngine.evaluateLayout(ctxNoScreen);
  assert(reportNoScreen.canPublish === false, "Layout without screen fails publication gate (canPublish: false)");
  assert(reportNoScreen.summary.errorsCount >= 1, "Report flagged at least 1 critical error");
  const screenFail = reportNoScreen.results.find((r) => r.ruleCode === "RULE_SCREEN_EXISTS");
  assert(screenFail !== undefined && screenFail.passed === false, "RULE_SCREEN_EXISTS failed as expected");
  assert(screenFail?.severity === "ERROR", "Missing screen triggers ERROR severity");
  assert(
    screenFail?.remediationGuidance.toLowerCase().includes("screen") ?? false,
    "Provides actionable remediation guidance for missing screen"
  );

  // Fixture B: Duplicate seat numbers
  const ctxDuplicateSeats: ValidationRuleContext = {
    theatreId: "th-pun-001",
    layoutVersionId: "ver-mock-002",
    layoutDefinitionName: "Mock Duplicate Seats",
    canvasBounds: { width: 1600, height: 1200 },
    sections: [],
    seats: [
      {
        id: "seat-1",
        seatNumber: "A1",
        rowId: "row-A",
        sectionId: "sec-1",
        coordinates: { x: 100, y: 100, width: 36, height: 36, rotation: 0 },
        accessibility: { isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
        categoryCode: "STANDARD",
        status: "ACTIVE",
      },
      {
        id: "seat-2",
        seatNumber: "A1", // Duplicate!
        rowId: "row-A",
        sectionId: "sec-1",
        coordinates: { x: 150, y: 100, width: 36, height: 36, rotation: 0 },
        accessibility: { isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
        categoryCode: "STANDARD",
        status: "ACTIVE",
      },
    ],
    structuralObjects: [
      {
        id: "scr-1",
        objectName: "Screen",
        displayName: "Screen 1",
        objectType: "SCREEN",
        internalCode: "STR-SCR-01",
        position: { x: 200, y: 50, z: 0 },
        width: 800,
        height: 30,
        rotation: 0,
        visibility: "VISIBLE",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      },
    ],
  };

  const reportDupSeats = await HallValidationEngine.evaluateLayout(ctxDuplicateSeats);
  const dupResult = reportDupSeats.results.find((r) => r.ruleCode === "RULE_SEAT_DUPLICATE_CODES");
  assert(dupResult !== undefined && dupResult.passed === false, "RULE_SEAT_DUPLICATE_CODES detected duplicate seats");
  assert(dupResult?.severity === "ERROR", "Duplicate seats trigger blocking ERROR severity");
  assert(dupResult?.affectedObjectIds.includes("seat-2") ?? false, "Report identifies offending duplicate seat ID");

  // Fixture C: Canvas boundary overflow
  const ctxOutOfBounds: ValidationRuleContext = {
    theatreId: "th-pun-001",
    layoutVersionId: "ver-mock-003",
    layoutDefinitionName: "Mock Bounds Overflow",
    canvasBounds: { width: 1600, height: 1200 },
    sections: [],
    seats: [
      {
        id: "seat-oob",
        seatNumber: "Z99",
        rowId: "row-Z",
        sectionId: "sec-1",
        coordinates: { x: 2200, y: 1800, width: 36, height: 36, rotation: 0 }, // Out of bounds
        accessibility: { isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
        categoryCode: "STANDARD",
        status: "ACTIVE",
      },
    ],
    structuralObjects: [],
  };

  const reportOOB = await HallValidationEngine.evaluateLayout(ctxOutOfBounds);
  const boundsResult = reportOOB.results.find((r) => r.ruleCode === "RULE_SEAT_COORDINATES_BOUNDS");
  assert(boundsResult !== undefined && boundsResult.passed === false, "Detected seat extending outside canvas bounds");
  assert(boundsResult?.severity === "ERROR", "Canvas overflow triggers ERROR severity");

  // Fixture D: Fully Compliant Valid Layout
  const ctxCompliant: ValidationRuleContext = {
    theatreId: "th-pun-001",
    layoutVersionId: "ver-mock-clean",
    layoutDefinitionName: "Compliant Layout",
    canvasBounds: { width: 1600, height: 1200 },
    sections: [
      {
        id: "sec-1",
        name: "Standard Section",
        capacity: 2,
        category: "REGULAR",
        rows: [
          {
            id: "row-A",
            rowName: "A",
            seatCount: 2,
            spacing: 80,
          },
        ],
      },
    ],
    seats: [
      {
        id: "seat-c1",
        seatNumber: "A1",
        rowId: "row-A",
        sectionId: "sec-1",
        coordinates: { x: 200, y: 300, width: 36, height: 36, rotation: 0 },
        accessibility: { isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
        categoryCode: "STANDARD",
        status: "ACTIVE",
      },
      {
        id: "seat-c2",
        seatNumber: "A2",
        rowId: "row-A",
        sectionId: "sec-1",
        coordinates: { x: 250, y: 300, width: 36, height: 36, rotation: 0 },
        accessibility: { isWheelchairAccessible: false, hasCompanionSeat: false, hasAccessibleRoute: true },
        categoryCode: "STANDARD",
        status: "ACTIVE",
      },
    ],
    structuralObjects: [
      {
        id: "scr-clean",
        objectName: "Main Screen",
        displayName: "Screen 1",
        objectType: "SCREEN",
        internalCode: "STR-SCR-01",
        position: { x: 200, y: 50, z: 0 },
        width: 800,
        height: 30,
        rotation: 0,
        visibility: "VISIBLE",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      },
      {
        id: "exit-clean",
        objectName: "Emergency Exit",
        displayName: "Exit 1",
        objectType: "EMERGENCY_EXIT",
        internalCode: "STR-EMG-01",
        position: { x: 50, y: 400, z: 0 },
        width: 60,
        height: 30,
        rotation: 0,
        visibility: "VISIBLE",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
      },
      {
        id: "door-clean",
        objectName: "Main Foyer Entrance",
        displayName: "Entrance 1",
        objectType: "ENTRANCE",
        internalCode: "STR-ENT-01",
        position: { x: 700, y: 900, z: 0 },
        width: 100,
        height: 40,
        rotation: 0,
        visibility: "VISIBLE",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
      },
    ],
  };

  const cleanReport = await HallValidationEngine.evaluateLayout(ctxCompliant);
  assert(cleanReport.canPublish === true, "Compliant layout passes publication gate (canPublish: true)");
  assert(cleanReport.summary.errorsCount === 0, "Compliant layout has 0 errors");
  assert(cleanReport.summary.blockingIssuesCount === 0, "Compliant layout has 0 blocking issues");

  // ----------------------------------------------------------------------------
  // SECTION 3: MULTI-TENANT VALIDATION REPOSITORY
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Multi-Tenant Validation Repository ---");

  const punePolicy = await hallValidationRepository.getPolicy("th-pun-001");
  assert(punePolicy.theatreId === "th-pun-001", "Retrieved Pune Strict compliance policy");
  assert(punePolicy.policyLevel === "STRICT", "Pune policy configured with STRICT compliance level");
  assert(
    punePolicy.ruleSeverityOverrides["RULE_EMERGENCY_EXIT_EXISTS"] === "ERROR",
    "Pune strictly overrides EMERGENCY_EXIT to ERROR"
  );

  const mumbaiPolicy = await hallValidationRepository.getPolicy("th-mum-002");
  assert(mumbaiPolicy.theatreId === "th-mum-002", "Retrieved Mumbai Standard safety policy");
  assert(mumbaiPolicy.policyLevel === "STANDARD", "Mumbai policy configured with STANDARD level");
  assert(
    mumbaiPolicy.ruleSeverityOverrides["RULE_EMERGENCY_EXIT_EXISTS"] === "WARNING",
    "Mumbai treats EMERGENCY_EXIT as WARNING"
  );

  const dubaiPolicy = await hallValidationRepository.getPolicy("th-dxb-003");
  assert(dubaiPolicy.theatreId === "th-dxb-003", "Retrieved Dubai Luxury & VIP policy");
  assert(dubaiPolicy.policyLevel === "PREMIUM", "Dubai policy configured with PREMIUM level");
  assert(
    dubaiPolicy.ruleSeverityOverrides["RULE_SECTION_CAPACITY_PARITY"] === "ERROR",
    "Dubai strictly overrides SECTION_CAPACITY_PARITY to ERROR"
  );

  const puneConfig = await hallValidationRepository.getConfiguration("th-pun-001");
  assert(puneConfig.theatreId === "th-pun-001", "Retrieved Pune validation configuration");
  assert(puneConfig.strictMode === true, "Pune has strictMode enabled");
  assert(puneConfig.geometryStrictness === "HIGH", "Pune enforces HIGH geometry strictness");

  // Test updating theatre policy
  const customPolicyUpdates: Partial<ValidationPolicy> = {
    name: "Pune Municipal Safety Code (Updated v2)",
  };
  const updatedPolicy = await hallValidationRepository.savePolicy("th-pun-001", customPolicyUpdates);
  assert(updatedPolicy.name === "Pune Municipal Safety Code (Updated v2)", "Updated theatre policy in repository");

  // Test report audit persistence
  await hallValidationRepository.saveReport(cleanReport);
  const fetchedReport = await hallValidationRepository.getLatestReport("th-pun-001", "ver-mock-clean");
  assert(fetchedReport !== null, "Successfully retrieved persisted audit report");
  assert(fetchedReport?.reportId === cleanReport.reportId, "Retrieved report matches saved report ID");

  // ----------------------------------------------------------------------------
  // SECTION 4: HALL VALIDATION DOMAIN SERVICE & SECURITY
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Hall Validation Domain Service & Security ---");

  const puneActor: SecurityActorContext = {
    userId: "usr-pune-admin",
    email: "admin@galaxy.pune.internal",
    name: "Pune Admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage"],
    ipAddress: "127.0.0.1",
    userAgent: "CineSphere-Validation-Agent",
    correlationId: "corr-val-001",
  };

  const mumbaiActor: SecurityActorContext = {
    userId: "usr-mumbai-admin",
    email: "admin@imax.mumbai.internal",
    name: "Mumbai Admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage"],
    ipAddress: "127.0.0.1",
    userAgent: "CineSphere-Validation-Agent",
    correlationId: "corr-val-002",
  };

  // Cross-tenant access blocked
  let crossTenantBlocked = false;
  try {
    await hallValidationService.runValidation(mumbaiActor, "ver-layout-pun-aud1-main-v3", "th-pun-001");
  } catch (err: any) {
    if (err.name === "AuthorizationError") crossTenantBlocked = true;
  }
  assert(crossTenantBlocked, "Cross-tenant validation blocked with AuthorizationError");

  // Validate Pune Layout Version v3
  const serviceReport = await hallValidationService.runValidation(
    puneActor,
    "ver-layout-pun-aud1-main-v3",
    "th-pun-001"
  );
  assert(serviceReport.theatreId === "th-pun-001", "Report generated for Pune theatre");
  assert(serviceReport.layoutVersionId === "ver-layout-pun-aud1-main-v3", "Report matches version ID");
  assert(typeof serviceReport.canPublish === "boolean", "Report includes canPublish boolean flag");
  assert(serviceReport.summary.totalRulesEvaluated >= 10, "Service evaluated all core rules");

  // Test loadValidationRules via service
  const rulesList = await hallValidationService.loadValidationRules(puneActor, "th-pun-001");
  assert(rulesList.length >= 10, "Service returned complete list of validation rules");

  // Pre-publish gate validation
  if (serviceReport.canPublish) {
    const prePublishGate = await hallValidationService.validateBeforePublish(
      puneActor,
      "ver-layout-pun-aud1-main-v3",
      "th-pun-001"
    );
    assert(prePublishGate.canPublish === true, "Pre-publish gate allows valid layout publication");
  } else {
    let publishBlocked = false;
    try {
      await hallValidationService.validateBeforePublish(
        puneActor,
        "ver-layout-pun-aud1-main-v3",
        "th-pun-001"
      );
    } catch (err: any) {
      if (err.name === "ValidationError") publishBlocked = true;
    }
    assert(publishBlocked, "Pre-publish gate strictly threw ValidationError for invalid layout");
  }

  // ----------------------------------------------------------------------------
  // SECTION 5: PROTECTED SERVER ACTIONS EXECUTION
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Protected Server Actions Execution ---");

  const runActionRes = await runValidationAction(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v3",
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(runActionRes.success === true, "runValidationAction executed cleanly");
  assert(runActionRes.data?.theatreId === "th-pun-001", "Action returned report for Pune");

  const validateHallRes = await validateHallLayoutAction(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v3",
      theatreId: "th-pun-001",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(validateHallRes.success === true, "validateHallLayoutAction executed cleanly");

  const rulesActionRes = await loadValidationRulesAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(rulesActionRes.success === true, "loadValidationRulesAction executed cleanly");
  assert((rulesActionRes.data?.length ?? 0) >= 10, "Action loaded full rules catalog");

  const saveConfigActionRes = await saveValidationConfigAction(
    {
      theatreId: "th-pun-001",
      strictMode: true,
      geometryStrictness: "HIGH",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(saveConfigActionRes.success === true, "saveValidationConfigAction executed cleanly");
  assert(saveConfigActionRes.data?.strictMode === true, "Action saved updated configuration");

  // ----------------------------------------------------------------------------
  console.log("\n==================================================================");
  console.log("HALL VALIDATION VERIFICATION COMPLETED");
  console.log(`Passed: ${testsPassed} | Failed: ${testsFailed}`);
  console.log("==================================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runValidationVerificationSuite().catch((err) => {
  console.error("FATAL: Validation test suite crashed:", err);
  process.exit(1);
});
