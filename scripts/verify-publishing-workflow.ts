/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 12: Publishing Workflow Verification Suite
 * ==============================================================================
 * Comprehensive test runner validating the atomic layout publishing pipeline,
 * preflight checklist audits, version locking, multi-tenant publishing policies,
 * and the Show Compatibility Layer.
 * ==============================================================================
 */

import { publishingWorkflowService } from "../lib/services/publishing-workflow.service";
import { layoutVersioningService } from "../lib/services/layout-versioning.service";
import { PublishingWorkflowRepository } from "../lib/repositories/publishing-workflow.repository";
import { HallDesignerRepository } from "../lib/repositories/hall-designer.repository";
import { PublishingPipelineEngine } from "../lib/engine/publishing-pipeline-engine";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  publishVersionWorkflowAction,
  unpublishVersionWorkflowAction,
  loadPublishStatusAction,
  loadPublishHistoryAction,
  loadPublishingConfigAction,
  savePublishingConfigAction,
  assignLayoutToShowAction,
  getLayoutForShowAction,
  migrateShowLayoutAction,
} from "../actions/publishing-workflow-actions";

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

async function runPublishingWorkflowVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 12: PUBLISHING WORKFLOW VERIFICATION");
  console.log("==================================================================\n");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage", "layout:publish", "show:manage"],
    correlationId: "corr-test-pub-pune",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mumbai-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage", "layout:publish"],
    correlationId: "corr-test-pub-mumbai",
  };

  const superAdmin: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-test-pub-super",
  };

  const publishingRepo = PublishingWorkflowRepository.getInstance();
  const designerRepo = HallDesignerRepository.getInstance();

  // ----------------------------------------------------------------------------
  // Section 1: Preflight Checklist Verification
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Preflight Checklist Verification ---");
  const def = designerRepo.getLayoutDefinitionById("layout-pun-aud1-main", "th-pun-001")!;
  const draftVer = await layoutVersioningService.createDraftVersion(
    puneAdmin,
    "layout-pun-aud1-main",
    "th-pun-001",
    "Preflight test draft",
    "ver-layout-pun-aud1-main-v3"
  );

  const config = publishingRepo.getPublishingConfig("th-pun-001");

  // A draft with no screen fails checklist
  const failingPreflight = PublishingPipelineEngine.evaluatePreflightChecklist({
    layoutDef: def,
    version: draftVer,
    structuralObjects: [], // no screen or exits
    config,
  });
  assert(failingPreflight.canPublish === false, "Checklist correctly blocks layout missing screen & exits");
  assert(failingPreflight.blockingReasons.length >= 2, "Checklist identifies specific blocking reasons");

  // ----------------------------------------------------------------------------
  // Section 2: Atomic Publishing Pipeline Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Atomic Publishing Pipeline Execution ---");
  const publishRes = await publishingWorkflowService.publishVersion(puneAdmin, {
    theatreId: "th-pun-001",
    layoutDefinitionId: "layout-pun-aud1-main",
    versionId: draftVer.id,
    publishNotes: "Automated test production publish",
  });

  assert(publishRes.success === true, "Publishing pipeline completed successfully");
  assert(publishRes.publishedVersionNumber === draftVer.versionNumber, "Published target version matches draft");
  assert(publishRes.liveStatus === "ACTIVE", "Live layout status is set to ACTIVE");

  // Verify Version Lock enforcement
  const publishedVer = designerRepo.getLayoutVersionById(draftVer.id, "th-pun-001")!;
  let lockBlocked = false;
  try {
    PublishingPipelineEngine.enforceVersionLock(publishedVer);
  } catch (err: any) {
    lockBlocked = err.name === "ConflictError" || err.message.includes("Immutable Layout Policy");
  }
  assert(lockBlocked, "Published version is locked: enforceVersionLock rejects mutations");

  // Verify Publishing History record
  const history = await publishingWorkflowService.getPublishHistory(
    puneAdmin,
    "layout-pun-aud1-main",
    "th-pun-001"
  );
  assert(history.length >= 1, `Publishing audit log recorded entries (Found: ${history.length})`);
  assert(history[0].publishedBy === "usr-pune-admin", "History tracks author user ID");

  // ----------------------------------------------------------------------------
  // Section 3: Show Compatibility Layer (Invariant Rules)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Show Compatibility Layer (Invariant Rules) ---");
  // Rule 1: Existing legacy show retains v2 layout assignment
  const legacyShowLayout = await publishingWorkflowService.getLayoutForShow(
    puneAdmin,
    "show-pun-morning-legacy",
    "th-pun-001"
  );
  assert(legacyShowLayout.versionNumber === 2, "Historical show preserves locked v2 layout version");

  // Rule 2: Newly scheduled show binds to current active layout
  const newShowAssignment = await publishingWorkflowService.assignLayoutToShow(
    puneAdmin,
    "show-pun-new-matinee",
    "hall-pun-aud1",
    "th-pun-001"
  );
  assert(newShowAssignment.layoutVersionNumber === draftVer.versionNumber, "New show automatically binds to current active layout");

  // Rule 3: Explicit Show Migration
  const migrationRes = await publishingWorkflowService.migrateShowLayout(
    puneAdmin,
    {
      showId: "show-pun-morning-legacy",
      theatreId: "th-pun-001",
      targetLayoutVersionId: draftVer.id,
      migrationReason: "Upgraded auditorium to 4K accessible seating layout",
    },
    20 // 20 booked seats
  );
  assert(migrationRes.success === true, "Show layout migration executed cleanly");
  assert(migrationRes.previousVersionId === "ver-layout-pun-aud1-main-v2", "Tracks previous layout version");
  assert(migrationRes.newVersionId === draftVer.id, "Tracks upgraded layout version");

  // Verify migrated show now returns new layout version
  const migratedShowLayout = await publishingWorkflowService.getLayoutForShow(
    puneAdmin,
    "show-pun-morning-legacy",
    "th-pun-001"
  );
  assert(migratedShowLayout.versionNumber === draftVer.versionNumber, "Migrated show now serves new seat inventory");

  // ----------------------------------------------------------------------------
  // Section 4: Multi-Tenant Publishing Policies
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Multi-Tenant Publishing Policies ---");
  const puneConfig = await publishingWorkflowService.getPublishingConfig(puneAdmin, "th-pun-001");
  assert(puneConfig.instantPublishEnabled === true, "Pune supports Instant Publish");
  assert(puneConfig.approvalRequired === false, "Pune does not require pre-approval");

  const mumbaiConfig = await publishingWorkflowService.getPublishingConfig(mumbaiAdmin, "th-mum-002");
  assert(mumbaiConfig.approvalRequired === true, "Mumbai requires administrative approval");
  assert(mumbaiConfig.publishWindow === "BUSINESS_HOURS", "Mumbai restricts to BUSINESS_HOURS");

  const dubaiConfig = await publishingWorkflowService.getPublishingConfig(superAdmin, "th-dxb-003");
  assert(dubaiConfig.scheduledPublishEnabled === true, "Dubai supports Scheduled Publish");
  assert(dubaiConfig.rollbackEnabled === true, "Dubai has rollback enabled");

  // Verify cross-tenant access rejection
  let crossTenantBlocked = false;
  try {
    await publishingWorkflowService.getPublishHistory(
      mumbaiAdmin,
      "layout-pun-aud1-main",
      "th-pun-001"
    );
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError" || err.message.includes("Security Violation");
  }
  assert(crossTenantBlocked, "Cross-tenant publishing operations rejected with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 5: Unpublish / Inactivate Operations
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Unpublish / Inactivate Operations ---");
  const unpublishRes = await publishingWorkflowService.unpublishVersion(
    puneAdmin,
    "layout-pun-aud1-main",
    "th-pun-001",
    "Routine auditorium renovation closure"
  );
  assert(unpublishRes.liveStatus === "INACTIVE", "Unpublished layout transitioned to INACTIVE");

  // ----------------------------------------------------------------------------
  // Section 6: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Protected Server Actions Execution ---");
  const actStatus = await loadPublishStatusAction(
    {
      theatreId: "th-pun-001",
      layoutDefinitionId: "layout-pun-aud1-main",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actStatus.success === true, "loadPublishStatusAction executed cleanly");
  assert(actStatus.data?.layoutDefinitionId === "layout-pun-aud1-main", "Action returned status for Pune");

  const actHistory = await loadPublishHistoryAction(
    {
      theatreId: "th-pun-001",
      layoutDefinitionId: "layout-pun-aud1-main",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actHistory.success === true, "loadPublishHistoryAction executed cleanly");
  assert(Array.isArray(actHistory.data), "Action returned publishing history entries");

  const actConfig = await loadPublishingConfigAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actConfig.success === true, "loadPublishingConfigAction executed cleanly");
  assert(actConfig.data?.instantPublishEnabled === true, "Action loaded configuration");

  const actSaveConfig = await savePublishingConfigAction(
    {
      theatreId: "th-pun-001",
      instantPublishEnabled: true,
      approvalRequired: false,
      scheduledPublishEnabled: true,
      rollbackEnabled: true,
      publishWindow: "ANYTIME",
      requirePublishNotes: false,
      notifyOnPublish: true,
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSaveConfig.success === true, "savePublishingConfigAction executed cleanly");
  assert(actSaveConfig.data?.scheduledPublishEnabled === true, "Action saved updated config");

  const actAssign = await assignLayoutToShowAction(
    {
      theatreId: "th-pun-001",
      showId: "show-action-test-01",
      hallId: "hall-pun-aud1",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actAssign.success === true, "assignLayoutToShowAction executed cleanly");
  assert(actAssign.data?.showId === "show-action-test-01", "Action assigned layout to show");

  const actGetLayout = await getLayoutForShowAction(
    {
      theatreId: "th-pun-001",
      showId: "show-action-test-01",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actGetLayout.success === true, "getLayoutForShowAction executed cleanly");
  assert(actGetLayout.data?.versionNumber === draftVer.versionNumber, "Action retrieved bound layout version");

  console.log("\n==================================================================");
  console.log(`PUBLISHING WORKFLOW VERIFICATION COMPLETED`);
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runPublishingWorkflowVerification().catch((err) => {
  console.error("FATAL ERROR IN PUBLISHING WORKFLOW VERIFICATION:", err);
  process.exit(1);
});
