/**
 * ==============================================================================
 * CineSphere OS — Publishing Pipeline Engine (Phase 4 – Part 12)
 * ==============================================================================
 * Pure state machine and preflight enforcement rules for hall layout publishing.
 * Validates invariant prerequisites, locks published versions, and resolves
 * show compatibility bindings.
 * ==============================================================================
 */

import { LayoutVersion, LayoutDefinition } from "@/types/hall-designer.types";
import { ValidationReport } from "@/types/hall-validation.types";
import {
  PublishingPreflightChecklist,
  PublishingConfiguration,
  ShowLayoutAssignment,
  ShowLayoutCompatibilityResolution,
} from "@/types/publishing-workflow.types";
import { StructuralObject } from "@/types/structural-objects.types";
import { ConflictError, ValidationError } from "@/lib/errors/app-error";

export class PublishingPipelineEngine {
  /**
   * Evaluate preflight checklist before allowing layout publication.
   */
  public static evaluatePreflightChecklist(params: {
    layoutDef: LayoutDefinition;
    version: LayoutVersion;
    structuralObjects: StructuralObject[];
    validationReport?: ValidationReport;
    config: PublishingConfiguration;
  }): PublishingPreflightChecklist {
    const { layoutDef, version, structuralObjects, validationReport, config } = params;
    const blockingReasons: string[] = [];

    // 1. Version Draft State Check
    const isVersionDraft = version.status === "DRAFT" || (version.status as string) === "APPROVED";
    if (!isVersionDraft) {
      blockingReasons.push(
        `Version v${version.versionNumber} has status '${version.status}'. Only DRAFT or APPROVED versions can be published.`
      );
    }

    // 2. Validation Engine Report Check
    const hasPassedValidation = Boolean(validationReport && validationReport.canPublish);
    if (!hasPassedValidation) {
      const errCount = validationReport?.summary.errorsCount || 1;
      blockingReasons.push(
        `Validation Engine reported ${errCount} blocking errors. Resolve all critical errors before publishing.`
      );
    }

    // 3. Screen Presence Check
    const hasScreenDefined = structuralObjects.some(
      (o) => o.objectType === "SCREEN" && o.visibility !== "HIDDEN"
    );
    if (!hasScreenDefined) {
      blockingReasons.push("Layout must contain at least one visible SCREEN structural object.");
    }

    // 4. Emergency Exits Presence Check
    const hasEmergencyExits =
      version.emergencyExits.length > 0 ||
      structuralObjects.some(
        (o) => o.objectType === "EMERGENCY_EXIT" && o.visibility !== "HIDDEN"
      );
    if (!hasEmergencyExits) {
      blockingReasons.push("Layout must contain at least one designated emergency fire exit.");
    }

    // 5. Duplicate Seat Codes Check
    const seatCodes = new Set<string>();
    let hasZeroDuplicateSeatCodes = true;
    for (const s of version.seats) {
      const code = s.seatNumber.trim().toUpperCase();
      if (seatCodes.has(code)) {
        hasZeroDuplicateSeatCodes = false;
        blockingReasons.push(`Duplicate seat code detected: '${code}'.`);
        break;
      }
      seatCodes.add(code);
    }

    // 6. Section Capacity Consistency
    let hasConsistentSectionCapacity = true;
    for (const sec of version.sections) {
      const seatsInSec = version.seats.filter((s) => s.sectionId === sec.id).length;
      if (sec.seatCount > 0 && Math.abs(sec.seatCount - seatsInSec) > 5) {
        hasConsistentSectionCapacity = false;
        blockingReasons.push(
          `Section '${sec.name}' capacity mismatch: declared ${sec.seatCount}, found ${seatsInSec} seats.`
        );
      }
    }

    // 7. Ownership & Conflicts
    const hasOwnershipVerified = version.theatreId === layoutDef.theatreId;
    if (!hasOwnershipVerified) {
      blockingReasons.push("Tenant ownership mismatch between layout version and definition.");
    }

    // 8. Physical Obstacle Collisions Check
    const hasZeroObstacleCollisions =
      !validationReport ||
      !validationReport.results.some(
        (r) => r.ruleCode === "RULE_STRUCTURAL_OBSTACLE_COLLISION" && !r.passed
      );
    if (!hasZeroObstacleCollisions) {
      blockingReasons.push("Physical collisions between obstacle structures and customer seats detected.");
    }

    // 9. Theatre Approval Policy Check
    if (config.approvalRequired && (version.metadata as any)?.approvalStatus !== "APPROVED") {
      blockingReasons.push(
        "Theatre publishing policy requires formal administrative approval before publication."
      );
    }

    const canPublish = blockingReasons.length === 0;

    return {
      hasPassedValidation,
      hasScreenDefined,
      hasEmergencyExits,
      hasZeroObstacleCollisions,
      hasZeroDuplicateSeatCodes,
      hasConsistentSectionCapacity,
      hasOwnershipVerified,
      hasNoPublishConflicts: true,
      isVersionDraft,
      canPublish,
      blockingReasons,
    };
  }

  /**
   * Enforce version lock: Reject mutations on published or archived versions.
   */
  public static enforceVersionLock(version: LayoutVersion): void {
    if (version.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Layout Policy: Version v${version.versionNumber} is ${version.status} and locked against direct edits. Create a new draft version to make changes.`
      );
    }
  }

  /**
   * Resolve which layout version a show must use.
   * Guarantees historical shows keep their assigned layout version,
   * while new shows get the latest published layout.
   */
  public static resolveShowCompatibility(params: {
    showId: string;
    existingAssignment?: ShowLayoutAssignment;
    currentPublishedVersion?: LayoutVersion;
  }): ShowLayoutCompatibilityResolution {
    const { showId, existingAssignment, currentPublishedVersion } = params;

    if (existingAssignment) {
      return {
        showId,
        theatreId: existingAssignment.theatreId,
        hallId: existingAssignment.hallId,
        layoutVersionId: existingAssignment.layoutVersionId,
        layoutVersionNumber: existingAssignment.layoutVersionNumber,
        status: "LOCKED_TO_SHOW",
        isHistoricalPreserved: true,
      };
    }

    if (!currentPublishedVersion) {
      throw new ValidationError(
        `Cannot schedule show: No published layout version exists for this auditorium.`
      );
    }

    return {
      showId,
      theatreId: currentPublishedVersion.theatreId,
      hallId: (currentPublishedVersion as any).hallId || "",
      layoutVersionId: currentPublishedVersion.id,
      layoutVersionNumber: currentPublishedVersion.versionNumber,
      status: "ACTIVE_LIVE",
      isHistoricalPreserved: false,
    };
  }

  /**
   * Validate show migration eligibility to a new published layout.
   */
  public static validateShowMigration(params: {
    currentAssignment: ShowLayoutAssignment;
    targetVersion: LayoutVersion;
    bookedSeatsCount: number;
  }): void {
    const { currentAssignment, targetVersion, bookedSeatsCount } = params;

    if (targetVersion.status !== "PUBLISHED") {
      throw new ValidationError(
        `Target layout version v${targetVersion.versionNumber} is not PUBLISHED.`
      );
    }

    if (targetVersion.seats.length < bookedSeatsCount) {
      throw new ConflictError(
        `Cannot migrate show to v${targetVersion.versionNumber}: Target layout capacity (${targetVersion.seats.length}) is less than current booked seats (${bookedSeatsCount}).`
      );
    }
  }
}
