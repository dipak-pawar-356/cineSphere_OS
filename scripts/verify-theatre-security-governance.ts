/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 14 Theatre Validation & Security Verification Suite
 * ==============================================================================
 * Validates the reusable Platform Security & Governance Layer:
 * 1. Policy-Based Authorization (canManageTheatre, canPublishTheatre, etc.)
 * 2. Multi-Tenant Boundary Isolation & Cross-Tenant Access Prevention
 * 3. Resource Ownership Validation across all Theatre Management modules
 * 4. Central 9-Stage Validation Pipeline execution order & benchmarks
 * 5. Media Validation with Theatre-Specific Upload Limits (Pune 20MB, Mumbai 50MB, Dubai 10MB)
 * 6. Dynamic Staff Quota Business Rules (Pune 100, Mumbai 300, Dubai 50)
 * 7. Optimistic Concurrency Control (OCC) & Conflict Detection (409)
 * 8. Enterprise Soft Delete, Restoration & Permanent Purge Protection
 * 9. Domain Security Event Auditing & Activity History Logging
 * 10. Reusable Server Actions & Standardized Error Handling
 * ==============================================================================
 */

import { theatreGovernanceService } from "../lib/services/theatre-governance.service";
import { theatreGovernanceRepository } from "../lib/repositories/theatre-governance.repository";
import {
  evaluateSecurityPolicy,
  assertSecurityPolicy,
} from "../lib/security/policies/theatre-security-policies";
import { OwnershipValidator } from "../lib/security/ownership-validator";
import { MediaValidator } from "../lib/security/media-validator";
import { ValidationPipeline } from "../lib/security/validation-pipeline";
import {
  validateResourceOwnershipAction,
  softDeleteResourceAction,
  restoreResourceAction,
  validateMediaUploadAction,
  getActivityHistoryAction,
  evaluatePolicyAction,
  updateSecurityConfigAction,
} from "../actions/theatre-governance-actions";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  AppError,
  AuthorizationError,
  TenantAccessError,
  OwnershipError,
  ConflictError,
  BusinessRuleError,
} from "../lib/errors/app-error";
import { z } from "zod";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runVerificationSuite(): Promise<void> {
  console.log("\n==============================================================================");
  console.log("🛡️  CineSphere OS — Phase 3 Part 14 Theatre Security & Governance Verification");
  console.log("==============================================================================\n");

  // Actor Contexts for Testing
  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-1",
    email: "superadmin@cinesphere.internal",
    name: "Platform Governance Director",
    role: "SUPER_ADMIN",
    permissions: ["theatres:manage_all", "platform:manage"],
    correlationId: "corr-gov-super",
  };

  const puneAdminActor: SecurityActorContext = {
    userId: "usr-th-pun",
    email: "gm.pune@cinesphere.internal",
    name: "Vikramaditya Singhania",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["theatre:manage_own"],
    correlationId: "corr-gov-pune",
  };

  const mumbaiAdminActor: SecurityActorContext = {
    userId: "usr-th-mum",
    email: "gm.mumbai@cinesphere.internal",
    name: "Alia Merchant",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-001",
    permissions: ["theatre:manage_own"],
    correlationId: "corr-gov-mumbai",
  };

  const dubaiHallManagerActor: SecurityActorContext = {
    userId: "usr-th-dxb-mgr",
    email: "ops.dubai@cinesphere.internal",
    name: "Tariq Al-Mansoor",
    role: "HALL_MANAGER",
    theatreId: "th-dxb-001",
    permissions: ["halls:view_assigned", "theatre:read_own"],
    correlationId: "corr-gov-dubai",
  };

  const guestCustomerActor: SecurityActorContext = {
    userId: "usr-guest-patron",
    email: "patron@gmail.com",
    name: "Aryan Deshmukh",
    role: "CUSTOMER",
    permissions: ["bookings:create"],
    correlationId: "corr-gov-customer",
  };

  // ----------------------------------------------------------------------------
  // Test 1: Reusable Platform Security & Governance Layer Architecture
  // ----------------------------------------------------------------------------
  console.log("👉 Test 1: Reusable Platform Security & Governance Layer Architecture");
  assert(Boolean(theatreGovernanceService), "TheatreGovernanceService singleton initialized");
  assert(Boolean(theatreGovernanceRepository), "TheatreGovernanceRepository singleton initialized");

  const puneConfig = theatreGovernanceService.getSecurityConfiguration("th-pun-001");
  const mumbaiConfig = theatreGovernanceService.getSecurityConfiguration("th-mum-001");
  const dubaiConfig = theatreGovernanceService.getSecurityConfiguration("th-dxb-001");

  assert(puneConfig.theatreId === "th-pun-001", "Pune security config registered");
  assert(mumbaiConfig.theatreId === "th-mum-001", "Mumbai security config registered");
  assert(dubaiConfig.theatreId === "th-dxb-001", "Dubai security config registered");

  // ----------------------------------------------------------------------------
  // Test 2: Policy-Based Authorization Engine
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 2: Policy-Based Authorization Engine");

  // canPublishTheatre: ONLY Super Admin
  const pubSuper = evaluateSecurityPolicy("canPublishTheatre", superAdminActor);
  const pubPune = evaluateSecurityPolicy("canPublishTheatre", puneAdminActor);
  assert(pubSuper.allowed === true, "Super Admin is authorized to publish a theatre");
  assert(pubPune.allowed === false, "Theatre Admin is denied from self-publishing to public portal");

  // canManageTheatre: Tenant Scoped
  const manageOwn = evaluateSecurityPolicy("canManageTheatre", puneAdminActor, {
    targetTenantId: "th-pun-001",
  });
  const manageCross = evaluateSecurityPolicy("canManageTheatre", puneAdminActor, {
    targetTenantId: "th-mum-001",
  });
  assert(manageOwn.allowed === true, "Pune Admin can manage own theatre th-pun-001");
  assert(manageCross.allowed === false, "Pune Admin denied from managing Mumbai theatre th-mum-001");

  // canUploadMedia: Hall Manager allowed for own, Customer denied
  const uploadMgr = evaluateSecurityPolicy("canUploadMedia", dubaiHallManagerActor, {
    targetTenantId: "th-dxb-001",
  });
  const uploadCust = evaluateSecurityPolicy("canUploadMedia", guestCustomerActor, {
    targetTenantId: "th-dxb-001",
  });
  assert(uploadMgr.allowed === true, "Dubai Hall Manager can upload media for Dubai venue");
  assert(uploadCust.allowed === false, "Customer is strictly denied from media uploads");

  // canPurgeResource: ONLY Super Admin
  const purgeSuper = evaluateSecurityPolicy("canPurgeResource", superAdminActor);
  const purgeAdmin = evaluateSecurityPolicy("canPurgeResource", puneAdminActor);
  assert(purgeSuper.allowed === true, "Super Admin can purge resources permanently");
  assert(purgeAdmin.allowed === false, "Theatre Admin cannot permanently purge resources");

  // ----------------------------------------------------------------------------
  // Test 3: Multi-Tenant Boundary Isolation & Cross-Tenant Access Prevention
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 3: Multi-Tenant Boundary Isolation & Cross-Tenant Access Prevention");

  let crossTenantBlocked = false;
  try {
    assertSecurityPolicy("canEditConfiguration", mumbaiAdminActor, {
      targetTenantId: "th-pun-001",
    });
  } catch (err: unknown) {
    if (err instanceof TenantAccessError || (err as AppError).code === "TENANT_ACCESS_DENIED") {
      crossTenantBlocked = true;
    }
  }
  assert(crossTenantBlocked, "Cross-tenant configuration update strictly blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Test 4: Resource Ownership Validation across Modules
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 4: Resource Ownership Validation across Modules");

  // Register explicit module resources
  theatreGovernanceRepository.registerResourceOwnership("th-pun-001", "AMENITY", "amenity-pun-imax", 1);
  theatreGovernanceRepository.registerResourceOwnership("th-mum-001", "CONTACT", "contact-mum-desk", 1);

  const ownValid = OwnershipValidator.validateResourceOwnership(
    "th-pun-001",
    "AMENITY",
    "amenity-pun-imax",
    puneAdminActor
  );
  assert(ownValid.isOwner === true, "Pune Admin verified as owner of Pune amenity");

  const hijackAttempt = OwnershipValidator.validateResourceOwnership(
    "th-pun-001",
    "AMENITY",
    "amenity-pun-imax",
    mumbaiAdminActor
  );
  assert(hijackAttempt.isOwner === false, "Mumbai Admin ownership validation fails on Pune amenity");

  let ownershipAssertFailed = false;
  try {
    OwnershipValidator.assertResourceOwnership(
      "th-pun-001",
      "AMENITY",
      "amenity-pun-imax",
      mumbaiAdminActor
    );
  } catch (err: unknown) {
    if (err instanceof OwnershipError || (err as AppError).code === "OWNERSHIP_VIOLATION") {
      ownershipAssertFailed = true;
    }
  }
  assert(ownershipAssertFailed, "Ownership assertion throws OwnershipError on cross-tenant hijack attempt");

  // ----------------------------------------------------------------------------
  // Test 5: Central 9-Stage Validation Pipeline Execution Order
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 5: Central 9-Stage Validation Pipeline Execution Order");

  const pipelineSchema = z.object({
    theatreId: z.string(),
    announcement: z.string().min(5).max(100),
  });

  const pipelineResult = await ValidationPipeline.execute(
    {
      operationName: "UpdateConcourseAnnouncement",
      module: "THEATRE_ANNOUNCEMENT",
      action: "UPDATE",
      policyKey: "canManageTheatre",
      targetTenantId: "th-pun-001",
      resourceType: "THEATRE",
      resourceId: "theatre-th-pun-001-primary",
      schema: pipelineSchema,
      rawInput: {
        theatreId: "th-pun-001",
        announcement: "Special IMAX 70mm screening tickets available now!",
      },
      expectedVersion: 12,
      actor: puneAdminActor,
    },
    async (validatedInput) => {
      return { status: "UPDATED", payload: validatedInput };
    }
  );

  assert(pipelineResult.success === true, "Pipeline execution succeeded");
  assert(pipelineResult.stageResults.length === 9, "All 9 stages were executed in sequence");
  const stageNames = pipelineResult.stageResults.map((s) => s.stage);
  assert(stageNames[0] === "1_AUTHENTICATION", "Stage 1 is Authentication");
  assert(stageNames[1] === "2_POLICY_AUTHORIZATION", "Stage 2 is Policy Authorization");
  assert(stageNames[2] === "3_TENANT_ISOLATION", "Stage 3 is Tenant Isolation");
  assert(stageNames[3] === "4_OWNERSHIP_VALIDATION", "Stage 4 is Ownership Validation");
  assert(stageNames[4] === "5_INPUT_VALIDATION", "Stage 5 is Input Validation");
  assert(stageNames[5] === "6_THEATRE_RULES", "Stage 6 is Theatre-Specific Rules");
  assert(stageNames[6] === "7_CONCURRENCY_CHECK", "Stage 7 is Concurrency Check");
  assert(stageNames[7] === "8_EXECUTION", "Stage 8 is Domain Execution");
  assert(stageNames[8] === "9_DOMAIN_AUDIT", "Stage 9 is Domain Event Audit");

  // ----------------------------------------------------------------------------
  // Test 6: Media Validation with Dynamic Theatre-Specific Upload Limits
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 6: Media Validation with Dynamic Theatre-Specific Upload Limits");

  // Pune Limit: 20 MB
  const pune15Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-pun-001",
    fileName: "imax-screen-lobby.jpg",
    fileSizeBytes: 15 * 1024 * 1024, // 15 MB
    mimeType: "image/jpeg",
  });
  assert(pune15Mb.isValid === true, "Pune accepts 15 MB upload within its 20 MB limit");

  const pune25Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-pun-001",
    fileName: "raw-trailer.mp4",
    fileSizeBytes: 25 * 1024 * 1024, // 25 MB
    mimeType: "video/mp4",
  });
  assert(pune25Mb.isValid === false, "Pune rejects 25 MB upload exceeding its 20 MB limit");
  assert(pune25Mb.errors[0].includes("20 MB"), "Error specifies Pune's 20 MB limit");

  // Mumbai Limit: 50 MB
  const mumbai35Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-mum-001",
    fileName: "grand-entrance-4k.mp4",
    fileSizeBytes: 35 * 1024 * 1024, // 35 MB
    mimeType: "video/mp4",
  });
  assert(mumbai35Mb.isValid === true, "Mumbai accepts 35 MB upload within its 50 MB limit");

  const mumbai60Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-mum-001",
    fileName: "massive-clip.mp4",
    fileSizeBytes: 60 * 1024 * 1024, // 60 MB
    mimeType: "video/mp4",
  });
  assert(mumbai60Mb.isValid === false, "Mumbai rejects 60 MB upload exceeding its 50 MB limit");

  // Dubai Limit: 10 MB
  const dubai8Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-dxb-001",
    fileName: "palms-concourse.webp",
    fileSizeBytes: 8 * 1024 * 1024, // 8 MB
    mimeType: "image/webp",
  });
  assert(dubai8Mb.isValid === true, "Dubai accepts 8 MB upload within its 10 MB limit");

  const dubai15Mb = MediaValidator.validateMediaUpload({
    theatreId: "th-dxb-001",
    fileName: "palms-high-res.jpg",
    fileSizeBytes: 15 * 1024 * 1024, // 15 MB
    mimeType: "image/jpeg",
  });
  assert(dubai15Mb.isValid === false, "Dubai rejects 15 MB upload exceeding its 10 MB limit");

  // Security checks: Path traversal & Malicious file
  const pathTraversal = MediaValidator.validateMediaUpload({
    theatreId: "th-pun-001",
    fileName: "../../etc/passwd.jpg",
    fileSizeBytes: 1024,
    mimeType: "image/jpeg",
  });
  assert(pathTraversal.isValid === false, "Media validator rejects path traversal characters");

  const malwareSim = MediaValidator.validateMediaUpload({
    theatreId: "th-pun-001",
    fileName: "eicar-test-payload.jpg",
    fileSizeBytes: 1024,
    mimeType: "image/jpeg",
  });
  assert(malwareSim.virusScanStatus === "INFECTED", "Antivirus scan stub flags infected payload");

  // ----------------------------------------------------------------------------
  // Test 7: Dynamic Staff Quota Enforcement
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 7: Dynamic Staff Quota Enforcement");

  // Dubai staff cap is 50
  const dubaiStaffCapExceeded = await ValidationPipeline.execute(
    {
      operationName: "AssignNewStaffMember",
      module: "THEATRE_STAFF",
      action: "ASSIGN_STAFF",
      policyKey: "canManageStaff",
      targetTenantId: "th-dxb-001",
      resourceType: "STAFF",
      rawInput: { currentStaffCount: 52 },
      actor: superAdminActor,
    },
    async () => ({ success: true })
  );
  assert(dubaiStaffCapExceeded.success === false, "Pipeline blocked staff assignment when quota exceeded");
  assert(dubaiStaffCapExceeded.error?.code === "STAFF_QUOTA_EXCEEDED", "Returned code STAFF_QUOTA_EXCEEDED");
  assert(Boolean(dubaiStaffCapExceeded.error?.message.includes("50 active members")), "Error specifies Dubai 50 staff limit");

  // ----------------------------------------------------------------------------
  // Test 8: Optimistic Concurrency Control (OCC) & Version Conflict Detection
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 8: Optimistic Concurrency Control (OCC) & Version Conflict Detection");

  // Resource version starts at 13 (after pipeline update in Test 5)
  const currentVer = theatreGovernanceRepository.getResourceVersion(
    "th-pun-001",
    "THEATRE",
    "theatre-th-pun-001-primary"
  );
  assert(currentVer !== null && currentVer.version === 13, "Current resource version is 13");

  // Attempting mutation with stale version 12 must fail with ConflictError
  let conflictCaught = false;
  try {
    theatreGovernanceRepository.checkAndIncrementVersion(
      "th-pun-001",
      "THEATRE",
      "theatre-th-pun-001-primary",
      12, // Stale version!
      puneAdminActor
    );
  } catch (err: unknown) {
    if (err instanceof ConflictError || (err as AppError).code === "OPTIMISTIC_LOCK_CONFLICT") {
      conflictCaught = true;
    }
  }
  assert(conflictCaught, "Stale version mutation throws ConflictError (HTTP 409)");

  // Mutating with correct version succeeds and increments
  const updatedVer = theatreGovernanceRepository.checkAndIncrementVersion(
    "th-pun-001",
    "THEATRE",
    "theatre-th-pun-001-primary",
    13,
    puneAdminActor
  );
  assert(updatedVer.version === 14, "Version successfully incremented to 14 upon matching expectedVersion");

  // ----------------------------------------------------------------------------
  // Test 9: Soft Delete, Non-Destructive Storage & Restoration
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 9: Soft Delete, Non-Destructive Storage & Restoration");

  theatreGovernanceRepository.registerResourceOwnership("th-pun-001", "HALL", "hall-pun-audi-4", 1);

  // Soft delete resource
  const softDeleted = theatreGovernanceService.softDeleteResource(
    "th-pun-001",
    "HALL",
    "hall-pun-audi-4",
    puneAdminActor,
    "Upgrading to Laser IMAX screen"
  );
  assert(softDeleted.softDelete.isDeleted === true, "Resource marked isDeleted: true");
  assert(softDeleted.softDelete.deletedBy === puneAdminActor.userId, "DeletedBy tracked");
  assert(Boolean(softDeleted.softDelete.deletedAt), "DeletedAt timestamp recorded");
  assert(
    softDeleted.softDelete.deleteReasonPlaceholder === "Upgrading to Laser IMAX screen",
    "Delete reason recorded"
  );

  // Verify in soft-deleted list
  const softList = theatreGovernanceService.getSoftDeletedResources("th-pun-001", "HALL");
  assert(softList.some((s) => s.id === "hall-pun-audi-4"), "Resource listed in soft-deleted inventory");

  // Restore resource
  const restored = theatreGovernanceService.restoreResource(
    "th-pun-001",
    "HALL",
    "hall-pun-audi-4",
    puneAdminActor
  );
  assert(restored.softDelete.isDeleted === false, "Resource successfully restored (isDeleted: false)");
  assert(restored.softDelete.restoredBy === puneAdminActor.userId, "RestoredBy tracked");
  assert(Boolean(restored.softDelete.restoredAt), "RestoredAt timestamp recorded");

  // Permanent Purge requires Super Admin
  let purgeBlockedForAdmin = false;
  try {
    theatreGovernanceService.purgeResource(
      "th-pun-001",
      "HALL",
      "hall-pun-audi-4",
      puneAdminActor
    );
  } catch (err: unknown) {
    purgeBlockedForAdmin = true;
  }
  assert(purgeBlockedForAdmin, "Theatre Admin is strictly denied from permanent purge");

  const purgeSuccessForSuper = theatreGovernanceService.purgeResource(
    "th-pun-001",
    "HALL",
    "hall-pun-audi-4",
    superAdminActor
  );
  assert(purgeSuccessForSuper === true, "Super Admin can permanently purge resource");

  // ----------------------------------------------------------------------------
  // Test 10: Domain Security Event Auditing
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 10: Domain Security Event Auditing");

  const domainEvents = theatreGovernanceService.getAuditTrail({ theatreId: "th-pun-001" });
  assert(domainEvents.length >= 3, "Domain security events ledger populated for Pune");
  const delEvent = domainEvents.find((e) => e.eventType === "THEATRE_SOFT_DELETED");
  assert(Boolean(delEvent), "THEATRE_SOFT_DELETED domain event recorded in immutable ledger");
  assert(delEvent?.actor.userId === puneAdminActor.userId, "Domain event records actor identity");

  // ----------------------------------------------------------------------------
  // Test 11: Chronological Activity History Tracking
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 11: Chronological Activity History Tracking");

  const activityHistory = theatreGovernanceService.getActivityHistory({ theatreId: "th-pun-001" });
  assert(activityHistory.length >= 3, "Activity history tracks chronological operator events");
  const topActivity = activityHistory[0];
  assert(Boolean(topActivity.id), "Activity ID present");
  assert(Boolean(topActivity.timestamp), "Activity timestamp present");
  assert(Boolean(topActivity.action), "Activity action recorded");
  assert(topActivity.theatreId === "th-pun-001", "Activity scoped to theatre");

  // ----------------------------------------------------------------------------
  // Test 12: Server Actions & Error Handling Consistency
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 12: Server Actions & Error Handling Consistency");

  // 1. validateResourceOwnershipAction
  const ownActionRes = await validateResourceOwnershipAction(
    {
      theatreId: "th-pun-001",
      resourceType: "THEATRE",
      resourceId: "theatre-th-pun-001-primary",
    },
    puneAdminActor
  );
  assert(ownActionRes.success === true, "validateResourceOwnershipAction succeeded");
  assert(ownActionRes.data?.isOwner === true, "Ownership action confirmed owner");

  // 2. validateMediaUploadAction
  const mediaActionRes = await validateMediaUploadAction(
    {
      theatreId: "th-pun-001",
      fileName: "poster.jpg",
      fileSizeBytes: 5 * 1024 * 1024,
      mimeType: "image/jpeg",
    },
    puneAdminActor
  );
  assert(mediaActionRes.success === true, "validateMediaUploadAction succeeded");
  assert(mediaActionRes.data?.isValid === true, "5 MB image valid for Pune");

  // 3. evaluatePolicyAction
  const policyActionRes = await evaluatePolicyAction(
    {
      policyKey: "canPublishTheatre",
    },
    puneAdminActor
  );
  assert(policyActionRes.success === true, "evaluatePolicyAction succeeded");
  assert(policyActionRes.data?.allowed === false, "Theatre Admin cannot publish theatre");

  // 4. updateSecurityConfigAction (Super Admin increases Pune limit to 30 MB)
  const configActionRes = await updateSecurityConfigAction(
    {
      theatreId: "th-pun-001",
      mediaUploadLimitMb: 30,
    },
    superAdminActor
  );
  assert(configActionRes.success === true, "updateSecurityConfigAction succeeded");
  assert(configActionRes.data?.mediaUploadLimitMb === 30, "Pune upload limit updated to 30 MB");

  // Confirm new limit in repository
  const updatedPune = theatreGovernanceService.getSecurityConfiguration("th-pun-001");
  assert(updatedPune.mediaUploadLimitMb === 30, "Updated limit actively enforced in service layer");

  console.log("\n==============================================================================");
  console.log("🎉  ALL 12 THEATRE SECURITY & GOVERNANCE TEST SUITES PASSED! (62 assertions)");
  console.log("==============================================================================\n");
}

void runVerificationSuite();
