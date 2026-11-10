/**
 * ==============================================================================
 * CineSphere OS — Automated Verification Suite: Theatre Lifecycle Management
 * Phase 3 – Part 1
 * ==============================================================================
 */

import { theatreLifecycleService } from "../lib/services/theatre-lifecycle.service";
import { theatreLifecycleRepository } from "../lib/repositories/theatre-lifecycle.repository";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  TenantAccessError,
} from "../lib/errors/app-error";
import { SecurityActorContext } from "../types/security-hardening.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

const superAdmin: SecurityActorContext = {
  userId: "usr-super-1",
  name: "Vikram Singhania",
  role: "SUPER_ADMIN",
  permissions: ["*"],
  correlationId: "corr-lc-super",
};

const puneAdmin: SecurityActorContext = {
  userId: "usr-th-pun",
  name: "Rajesh Kulkarni",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["theatres:read", "theatres:write_allowed"],
  correlationId: "corr-lc-pune",
};

async function runTheatreLifecycleVerification() {
  console.log("\n==============================================================================");
  console.log("🏛️  CineSphere OS — Phase 3 Part 1 Theatre Lifecycle Verification Suite");
  console.log("==============================================================================\n");

  theatreLifecycleRepository.resetStore();

  // ----------------------------------------------------------------------------
  // Test 1: Create Theatre, Slug Generation & Default Config
  // ----------------------------------------------------------------------------
  console.log("👉 Test 1: Theatre Creation, Public ID, Unique Slug & Default Config");
  const created = await theatreLifecycleService.createTheatre(
    {
      name: "Cineplex Royal Satara",
      chain: "CineSphere Partner",
      contactEmail: "launch@cineplexsatara.in",
      contactNumber: "+91 2162 230 900",
      adminName: "Amol Deshmukh",
      adminEmail: "amol@cineplexsatara.in",
      address: "Powai Naka Plaza, Near Rajwada",
      city: "Satara",
      state: "Maharashtra",
      pinCode: "415001",
    },
    superAdmin
  );

  assert(Boolean(created.id) && created.publicId.startsWith("TH-PUB-"), "Generates Theatre ID and Secure Public ID");
  assert(created.slug === "cineplex-royal-satara-satara", `Auto-generates unique slug: ${created.slug}`);
  assert(created.status === "DRAFT", "Initializes theatre in DRAFT state");
  assert(created.version === 1, "Starts optimistic lock version at v1");
  assert(!created.capabilities.allowBookings, "DRAFT theatre blocks live patron bookings");

  // ----------------------------------------------------------------------------
  // Test 2: Duplicate Theatre Name & Duplicate Manual Slug Prevention
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 2: Duplicate Name & Slug Collision Prevention");
  let dupNameRejected = false;
  try {
    await theatreLifecycleService.createTheatre(
      {
        name: "Cineplex Royal Satara",
        contactEmail: "dup@test.in",
        contactNumber: "+91 90000 00001",
        adminName: "Test Admin",
        adminEmail: "admin@test.in",
        address: "123 Street",
        city: "Satara",
        state: "Maharashtra",
      },
      superAdmin
    );
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "DUPLICATE_THEATRE") {
      dupNameRejected = true;
    }
  }
  assert(dupNameRejected, "Rejects duplicate theatre name creation");

  let dupSlugRejected = false;
  try {
    await theatreLifecycleService.createTheatre(
      {
        name: "Distinct Cinema Name",
        slug: created.slug, // Collides manually!
        contactEmail: "dup2@test.in",
        contactNumber: "+91 90000 00002",
        adminName: "Test Admin 2",
        adminEmail: "admin2@test.in",
        address: "456 Avenue",
        city: "Satara",
        state: "Maharashtra",
      },
      superAdmin
    );
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "DUPLICATE_SLUG") {
      dupSlugRejected = true;
    }
  }
  assert(dupSlugRejected, "Rejects manual slug override matching existing slug");

  // Auto-suffix slug generation on natural collision
  const autoSuffixSlug = await theatreLifecycleService.generateUniqueSlug("Cineplex Royal Satara", "Satara");
  assert(autoSuffixSlug === "cineplex-royal-satara-satara-2", `Appends numeric suffix on natural slug collision: ${autoSuffixSlug}`);

  // ----------------------------------------------------------------------------
  // Test 3: Invalid State Transition Blocking
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 3: Lifecycle State Machine Transition Rules");
  let invalidTransitionCaught = false;
  try {
    // Cannot jump straight from DRAFT to ACTIVE bypassing approval!
    await theatreLifecycleService.activateTheatre(created.id, superAdmin);
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "INVALID_STATE_TRANSITION") {
      invalidTransitionCaught = true;
    }
  }
  assert(invalidTransitionCaught, "Strictly blocks DRAFT -> ACTIVE shortcut bypassing KYC approval");

  // ----------------------------------------------------------------------------
  // Test 4: Approval Workflow (Submit -> Revision Requested -> Submit -> Reject -> Submit -> Approve)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 4: Multi-Stage Approval Workflow & Revision Loop");
  const pending1 = await theatreLifecycleService.submitForApproval(created.id, superAdmin);
  assert(pending1.status === "PENDING_APPROVAL", "Transitions DRAFT -> PENDING_APPROVAL");

  const revReq = await theatreLifecycleService.rejectOrRequestRevision(
    created.id,
    "REVISION_REQUESTED",
    "Please update GSTIN and attach local Fire NOC certificate.",
    superAdmin
  );
  assert(revReq.status === "DRAFT" && revReq.approvalStatus === "REVISION_REQUESTED", "Returns theatre to DRAFT with REVISION_REQUESTED status");

  await theatreLifecycleService.submitForApproval(created.id, superAdmin);
  const rejected = await theatreLifecycleService.rejectOrRequestRevision(
    created.id,
    "REJECTED",
    "Incorrect corporate address proof supplied.",
    superAdmin
  );
  assert(rejected.status === "DRAFT" && rejected.approvalStatus === "REJECTED", "Returns theatre to DRAFT with REJECTED status");

  await theatreLifecycleService.submitForApproval(created.id, superAdmin);
  const approved = await theatreLifecycleService.approveTheatre(
    created.id,
    "All KYC, GSTIN & safety permits verified.",
    superAdmin
  );
  assert(approved.status === "APPROVED" && approved.approvalStatus === "APPROVED", "Transitions PENDING_APPROVAL -> APPROVED");

  // ----------------------------------------------------------------------------
  // Test 5: Activate, Suspend Operational Lockouts, and Resume
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 5: Activation, Suspension Lockouts & Resume");
  const active = await theatreLifecycleService.activateTheatre(created.id, superAdmin);
  assert(active.status === "ACTIVE", "Transitions APPROVED -> ACTIVE");
  assert(
    active.capabilities.allowBookings && active.capabilities.allowShows && active.capabilities.allowPayments,
    "ACTIVE state enables bookings, show programming & payments"
  );

  // Suspension
  const suspended = await theatreLifecycleService.suspendTheatre(
    created.id,
    "Scheduled Dolby Atmos calibration & transformer replacement",
    "2026-12-01T18:00",
    superAdmin
  );
  assert(suspended.status === "SUSPENDED", "Transitions ACTIVE -> SUSPENDED");
  assert(
    !suspended.capabilities.allowBookings &&
      !suspended.capabilities.allowShows &&
      !suspended.capabilities.allowPayments,
    "SUSPENDED state strictly locks bookings, shows, and payment processing"
  );
  assert(Boolean(suspended.suspension?.reason) && suspended.suspension?.suspendedBy === "usr-super-1", "Records suspension reason & actor");

  // Resume
  const resumed = await theatreLifecycleService.resumeTheatre(created.id, superAdmin);
  assert(resumed.status === "ACTIVE" && resumed.capabilities.allowBookings, "Resumes SUSPENDED -> ACTIVE and restores capabilities");

  // ----------------------------------------------------------------------------
  // Test 6: Slug Change History & Optimistic Locking
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 6: Slug Change History & Optimistic Locking");
  const edited = await theatreLifecycleService.updateTheatre(
    created.id,
    {
      expectedVersion: resumed.version,
      slug: "cineplex-satara-flagship",
      tagline: "Satara's Premier 4K Laser Experience",
    },
    superAdmin
  );
  assert(edited.slug === "cineplex-satara-flagship", "Updates manual slug cleanly");
  assert(edited.version === resumed.version + 1, "Increments optimistic lock version on edit");

  const slugHist = theatreLifecycleRepository.getSlugHistory(created.id);
  assert(
    slugHist.length === 1 && slugHist[0].oldSlug === "cineplex-royal-satara-satara" && slugHist[0].redirectEnabled,
    "Records old slug -> new slug redirect history"
  );

  // Stale optimistic lock version test
  let staleConflictCaught = false;
  try {
    await theatreLifecycleService.updateTheatre(
      created.id,
      { expectedVersion: resumed.version, tagline: "Stale write attempt" }, // outdated version!
      superAdmin
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      staleConflictCaught = true;
    }
  }
  assert(staleConflictCaught, "Rejects stale theatre edit via Optimistic Locking (ConflictError)");

  // ----------------------------------------------------------------------------
  // Test 7: Archive Read-Only Enforcement & Restore
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 7: Archive Read-Only Mode & Restore");
  const archived = await theatreLifecycleService.archiveTheatre(
    created.id,
    "Seasonal renovation archival",
    superAdmin
  );
  assert(archived.status === "ARCHIVED" && archived.capabilities.isReadOnly, "ARCHIVED sets strict Read-Only mode");

  let readOnlyEditBlocked = false;
  try {
    await theatreLifecycleService.updateTheatre(
      created.id,
      { expectedVersion: archived.version, tagline: "Attempt edit while archived" },
      superAdmin
    );
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "THEATRE_READ_ONLY") {
      readOnlyEditBlocked = true;
    }
  }
  assert(readOnlyEditBlocked, "Blocks mutations on read-only archived theatres");

  const restored = await theatreLifecycleService.restoreTheatre(created.id, superAdmin);
  assert(restored.status === "ACTIVE" && !restored.capabilities.isReadOnly, "Restores archived theatre back to operational previous state");

  // ----------------------------------------------------------------------------
  // Test 8: Soft Delete Business Rules (Never Hard Deleted)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 8: Soft Delete Governance & Active Block Rule");
  let activeDeleteBlocked = false;
  try {
    await theatreLifecycleService.softDeleteTheatre(created.id, "Attempt illegal active delete", superAdmin);
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "ACTIVE_THEATRE_DELETE_BLOCKED") {
      activeDeleteBlocked = true;
    }
  }
  assert(activeDeleteBlocked, "Blocks soft deletion while theatre is ACTIVE");

  await theatreLifecycleService.suspendTheatre(created.id, "Decommissioning multiplex", undefined, superAdmin);
  const softDeleted = await theatreLifecycleService.softDeleteTheatre(
    created.id,
    "Permanent closure per board resolution",
    superAdmin
  );
  assert(
    softDeleted.status === "SOFT_DELETED" &&
      softDeleted.softDelete.isDeleted &&
      softDeleted.softDelete.deletedBy === superAdmin.userId,
    "Soft deletes safely while preserving deletedBy, deletedAt, and deleteReason"
  );

  // Verify excluded from default search, included when requested
  const defaultSearch = await theatreLifecycleService.searchTheatres({ query: "cineplex-satara-flagship" }, superAdmin);
  assert(defaultSearch.items.length === 0, "Excludes soft-deleted theatres from default searches");

  const withDeletedSearch = await theatreLifecycleService.searchTheatres(
    { query: "cineplex-satara-flagship", includeDeleted: true },
    superAdmin
  );
  assert(withDeletedSearch.items.length === 1, "Returns tombstoned theatre when includeDeleted=true");

  // ----------------------------------------------------------------------------
  // Test 9: Role Permissions & Multi-Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 9: Role Permissions & Cross-Tenant Isolation");
  // Pune Admin views & edits allowed field on own theatre (th-pun-001)
  const puneDetail = await theatreLifecycleService.getTheatreLifecycleDetails("th-pun-001", puneAdmin);
  assert(puneDetail.theatre.id === "th-pun-001", "Theatre Admin views own complex th-pun-001");

  const puneUpdated = await theatreLifecycleService.updateTheatre(
    "th-pun-001",
    { expectedVersion: puneDetail.theatre.version, tagline: "Pune's Best IMAX Laser Experience" },
    puneAdmin
  );
  assert(puneUpdated.tagline === "Pune's Best IMAX Laser Experience", "Theatre Admin edits allowed tagline field on own complex");

  // Theatre Admin blocked from restricted governance fields (e.g. gstNumber or name)
  let restrictedFieldDenied = false;
  try {
    await theatreLifecycleService.updateTheatre(
      "th-pun-001",
      { expectedVersion: puneUpdated.version, name: "Hijacked Cinema Name" },
      puneAdmin
    );
  } catch (err) {
    if (err instanceof AuthorizationError) restrictedFieldDenied = true;
  }
  assert(restrictedFieldDenied, "Blocks Theatre Admin from altering restricted governance fields");

  // Theatre Admin blocked from accessing another tenant (th-mum-001)
  let crossTenantDenied = false;
  try {
    await theatreLifecycleService.getTheatreLifecycleDetails("th-mum-001", puneAdmin);
  } catch (err) {
    if (err instanceof TenantAccessError) crossTenantDenied = true;
  }
  assert(crossTenantDenied, "Blocks Theatre Admin from accessing another theatre complex");

  // Theatre Admin blocked from approving / suspending
  let approvalDenied = false;
  try {
    await theatreLifecycleService.approveTheatre("th-hyd-001", "Unauthorized self-approval", puneAdmin);
  } catch (err) {
    if (err instanceof AuthorizationError) approvalDenied = true;
  }
  assert(approvalDenied, "Blocks Theatre Admin from platform approval transitions");

  // ----------------------------------------------------------------------------
  // Test 10: Search, Multi-Faceted Filters & Audit Trails
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 10: Search, Filters & Complete Lifecycle Audit Trail");
  const puneScopedList = await theatreLifecycleService.searchTheatres({}, puneAdmin);
  assert(puneScopedList.items.length === 1 && puneScopedList.items[0].id === "th-pun-001", "Search returns strictly assigned tenant for Theatre Admin");

  const fullAuditDetail = await theatreLifecycleService.getTheatreLifecycleDetails(created.id, superAdmin);
  assert(fullAuditDetail.statusHistory.length >= 9, `Records complete status history (${fullAuditDetail.statusHistory.length} transitions)`);
  assert(fullAuditDetail.approvals.length >= 4, `Records full approval decision history (${fullAuditDetail.approvals.length} entries)`);
  assert(fullAuditDetail.auditLogs.length >= 10, `Records full compliance audit trail (${fullAuditDetail.auditLogs.length} events)`);

  console.log("\n==============================================================================");
  console.log("🎉 ALL 10 THEATRE LIFECYCLE VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runTheatreLifecycleVerification().catch((err) => {
  console.error("FATAL: Lifecycle Verification Failed:", err);
  process.exit(1);
});

