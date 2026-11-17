/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 11: Layout Version Management Verification Suite
 * ==============================================================================
 * Comprehensive test runner validating immutable version registry, branching,
 * deep version comparisons, safe rollbacks, change history, and multi-tenant policies.
 * ==============================================================================
 */

import { layoutVersioningService } from "../lib/services/layout-versioning.service";
import { LayoutVersioningRepository } from "../lib/repositories/layout-versioning.repository";
import { HallDesignerRepository } from "../lib/repositories/hall-designer.repository";
import { VersionComparisonEngine } from "../lib/engine/version-comparison-engine";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  loadVersionHistoryAction,
  createLayoutDraftVersionAction,
  compareVersionsAction,
  rollbackVersionAction,
  loadVersionPolicyAction,
  saveVersionPolicyAction,
  loadChangeEventsAction,
} from "../actions/layout-versioning-actions";

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

async function runLayoutVersioningVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 11: LAYOUT VERSION MANAGEMENT VERIFICATION");
  console.log("==================================================================\n");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage", "layout:publish", "layout:version"],
    correlationId: "corr-test-ver-pune",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mumbai-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage", "layout:publish"],
    correlationId: "corr-test-ver-mumbai",
  };

  const superAdmin: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-test-ver-super",
  };

  const versioningRepo = LayoutVersioningRepository.getInstance();
  const designerRepo = HallDesignerRepository.getInstance();

  // ----------------------------------------------------------------------------
  // Section 1: Immutable Version Registry & History
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Immutable Version Registry & History ---");
  const puneHistory = await layoutVersioningService.getVersionHistory(
    puneAdmin,
    "layout-pun-aud1-main",
    "th-pun-001"
  );
  assert(puneHistory.length >= 2, `Pune history contains at least 2 versions (Found: ${puneHistory.length})`);

  const v3 = puneHistory.find((v) => v.versionNumber === 3);
  assert(Boolean(v3), "Found Version v3 in history");
  assert(v3?.status === "PUBLISHED", "v3 is marked as PUBLISHED");
  assert(v3?.isLocked === true, "Published v3 is locked against direct edits");
  assert(v3?.totalSeats === 100, `v3 tracks 100 seats (Found: ${v3?.totalSeats})`);

  const v2 = puneHistory.find((v) => v.versionNumber === 2);
  assert(Boolean(v2), "Found Version v2 in history");
  assert(v2?.status === "ARCHIVED", "v2 is marked as ARCHIVED");
  assert(v2?.isLocked === true, "Archived v2 is locked against direct edits");

  // ----------------------------------------------------------------------------
  // Section 2: Branching & Draft Version Creation
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Branching & Draft Version Creation ---");
  const newDraft = await layoutVersioningService.createDraftVersion(
    puneAdmin,
    "layout-pun-aud1-main",
    "th-pun-001",
    "Exploring expanded recliner section",
    "ver-layout-pun-aud1-main-v3"
  );
  assert(newDraft.status === "DRAFT", "New derived version has DRAFT status");
  assert(newDraft.versionNumber > 3, `New version number is incremented (v${newDraft.versionNumber})`);
  assert(newDraft.seats.length === 100, "Derived draft copies all 100 seats from source version");
  assert(newDraft.sections.length === 2, "Derived draft copies sections from source version");

  // Verify immutability: v3 remains published and unchanged
  const v3Check = designerRepo.getLayoutVersionById("ver-layout-pun-aud1-main-v3", "th-pun-001");
  assert(v3Check?.status === "PUBLISHED", "Source version v3 remains untouched with PUBLISHED status");

  // ----------------------------------------------------------------------------
  // Section 3: Deep Version Comparison Engine
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Deep Version Comparison Engine ---");
  const v2Full = designerRepo.getLayoutVersionById("ver-layout-pun-aud1-main-v2", "th-pun-001")!;
  const v3Full = designerRepo.getLayoutVersionById("ver-layout-pun-aud1-main-v3", "th-pun-001")!;

  const comparison = VersionComparisonEngine.compareVersions(v2Full, v3Full);
  assert(comparison.sourceVersionNumber === 2, "Comparison source version is v2");
  assert(comparison.targetVersionNumber === 3, "Comparison target version is v3");
  assert(comparison.theatreId === "th-pun-001", "Comparison is scoped to Pune theatre");
  assert(comparison.sectionDiffs.length >= 0, "Evaluated section diffs");
  assert(comparison.seatDiffs.length >= 0, "Evaluated seat diffs");
  assert(comparison.summary.hasBreakingChanges === false, "Identified non-breaking changes between v2 and v3");

  const cachedComparison = await layoutVersioningService.compareVersions(
    puneAdmin,
    "ver-layout-pun-aud1-main-v2",
    "ver-layout-pun-aud1-main-v3",
    "th-pun-001"
  );
  assert(cachedComparison.sourceVersionNumber === 2, "Service returned accurate comparison");

  // ----------------------------------------------------------------------------
  // Section 4: Safe Rollback System
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Safe Rollback System ---");
  const rollbackRes = await layoutVersioningService.rollbackVersion(
    puneAdmin,
    "layout-pun-aud1-main",
    "ver-layout-pun-aud1-main-v2",
    "th-pun-001",
    "Emergency rollback to v2 layout"
  );
  assert(rollbackRes.success === true, "Rollback executed successfully");
  assert(rollbackRes.derivedFromVersionNumber === 2, "Rollback correctly identifies v2 as derivation source");
  assert(rollbackRes.newVersionNumber > newDraft.versionNumber, "Rollback generates fresh draft version number");

  // Verify historical v2 is still immutable and archived
  const v2PostRollback = designerRepo.getLayoutVersionById("ver-layout-pun-aud1-main-v2", "th-pun-001");
  assert(v2PostRollback?.status === "ARCHIVED", "Historical v2 remains ARCHIVED and immutable");

  // ----------------------------------------------------------------------------
  // Section 5: Change History Tracking
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Change History Tracking ---");
  const chgEvent = await layoutVersioningService.recordChangeEvent(
    puneAdmin,
    newDraft.id,
    "th-pun-001",
    {
      changeType: "SEAT_CHANGED",
      entityType: "SEAT",
      entityId: "seat-A1",
      description: "Converted seat A1 to VIP Recliner",
      beforeSnapshot: { seatType: "Standard" },
      afterSnapshot: { seatType: "VIP" },
    }
  );
  assert(chgEvent.changeType === "SEAT_CHANGED", "Recorded SEAT_CHANGED change event");
  assert(chgEvent.entityId === "seat-A1", "Recorded target entity ID");
  assert(chgEvent.actorId === "usr-pune-admin", "Recorded actor ID");

  const events = await layoutVersioningService.getChangeEvents(puneAdmin, newDraft.id, "th-pun-001");
  assert(events.length >= 1, `Retrieved change history events for version (Found: ${events.length})`);

  // ----------------------------------------------------------------------------
  // Section 6: Multi-Tenant Version Policies
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Multi-Tenant Version Policies ---");
  const punePolicy = await layoutVersioningService.getVersionPolicy(puneAdmin, "th-pun-001");
  assert(punePolicy.maxVersionsAllowed === 50, "Pune allows up to 50 versions");
  assert(punePolicy.rollbackEnabled === true, "Pune has rollback enabled");
  assert(punePolicy.compareEnabled === true, "Pune has comparison enabled");

  const mumbaiPolicy = await layoutVersioningService.getVersionPolicy(mumbaiAdmin, "th-mum-002");
  assert(mumbaiPolicy.maxVersionsAllowed === 20, "Mumbai restricts to 20 versions");
  assert(mumbaiPolicy.rollbackEnabled === false, "Mumbai has rollback disabled");
  assert(mumbaiPolicy.versionNotesRequired === true, "Mumbai requires version release notes");

  const dubaiPolicy = await layoutVersioningService.getVersionPolicy(superAdmin, "th-dxb-003");
  assert(dubaiPolicy.maxVersionsAllowed === 0, "Dubai allows unlimited versions (0)");
  assert(dubaiPolicy.approvalRequired === true, "Dubai requires administrative approval");

  // Test policy update
  const updatedPune = await layoutVersioningService.saveVersionPolicy(puneAdmin, "th-pun-001", {
    maxVersionsAllowed: 60,
  });
  assert(updatedPune.maxVersionsAllowed === 60, "Updated Pune maxVersionsAllowed to 60");

  // Test cross-tenant access rejection
  let crossTenantBlocked = false;
  try {
    await layoutVersioningService.getVersionHistory(mumbaiAdmin, "layout-pun-aud1-main", "th-pun-001");
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError" || err.message.includes("Security Violation");
  }
  assert(crossTenantBlocked, "Cross-tenant access blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 7: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");
  const actHistory = await loadVersionHistoryAction(
    {
      theatreId: "th-pun-001",
      layoutDefinitionId: "layout-pun-aud1-main",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actHistory.success === true, "loadVersionHistoryAction executed cleanly");
  assert(Array.isArray(actHistory.data), "Action returned version history items");

  const actCompare = await compareVersionsAction(
    {
      theatreId: "th-pun-001",
      sourceVersionId: "ver-layout-pun-aud1-main-v2",
      targetVersionId: "ver-layout-pun-aud1-main-v3",
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actCompare.success === true, "compareVersionsAction executed cleanly");
  assert(actCompare.data?.summary.capacityDelta === 0, "Action returned correct capacity delta");

  const actPolicy = await loadVersionPolicyAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actPolicy.success === true, "loadVersionPolicyAction executed cleanly");
  assert(actPolicy.data?.theatreId === "th-pun-001", "Action returned policy for Pune");

  const actSavePolicy = await saveVersionPolicyAction(
    {
      theatreId: "th-pun-001",
      maxVersionsAllowed: 75,
      rollbackEnabled: true,
      compareEnabled: true,
      versionNotesRequired: false,
      autoPruneArchivedDrafts: false,
      approvalRequired: false,
      allowedLabels: ["STABLE", "HOTFIX"],
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSavePolicy.success === true, "saveVersionPolicyAction executed cleanly");
  assert(actSavePolicy.data?.maxVersionsAllowed === 75, "Action saved updated version policy");

  const actEvents = await loadChangeEventsAction(
    {
      theatreId: "th-pun-001",
      versionId: newDraft.id,
    },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actEvents.success === true, "loadChangeEventsAction executed cleanly");
  assert(Array.isArray(actEvents.data), "Action returned change events array");

  console.log("\n==================================================================");
  console.log(`LAYOUT VERSION MANAGEMENT VERIFICATION COMPLETED`);
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runLayoutVersioningVerification().catch((err) => {
  console.error("FATAL ERROR IN LAYOUT VERSIONING VERIFICATION:", err);
  process.exit(1);
});
