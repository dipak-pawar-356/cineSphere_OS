/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Domain Service
 * Phase 4 – Part 10: Pluggable Rule-Based Preflight Validation Framework
 * ==============================================================================
 */

import {
  ValidationReport,
  ValidationRule,
  ValidationPolicy,
  ValidationConfiguration,
  ValidationRuleContext,
} from "@/types/hall-validation.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { SectionRowRepository } from "@/lib/repositories/section-row.repository";
import { SeatGeneratorRepository } from "@/lib/repositories/seat-generator.repository";
import { SeatTemplate } from "@/types/seat-generator.types";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { hallValidationRepository, HallValidationRepository } from "@/lib/repositories/hall-validation.repository";
import { HallValidationEngine } from "@/lib/engine/hall-validation-engine";
import { AuthorizationError, NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("HallValidationService");

export class HallValidationService {
  private static instance: HallValidationService | null = null;
  private hallDesignerRepo: HallDesignerRepository;
  private sectionRowRepo: SectionRowRepository;
  private validationRepo: HallValidationRepository;

  private constructor() {
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
    this.sectionRowRepo = SectionRowRepository.getInstance();
    this.validationRepo = hallValidationRepository;
  }

  public static getInstance(): HallValidationService {
    if (!HallValidationService.instance) {
      HallValidationService.instance = new HallValidationService();
    }
    return HallValidationService.instance;
  }

  /**
   * Resolve and enforce tenant isolation boundary.
   */
  private resolveTheatreId(actor: SecurityActorContext, requestedTheatreId?: string): string {
    if (actor.role === "SUPER_ADMIN") {
      return requestedTheatreId || actor.theatreId || "th-pun-001";
    }

    if (!actor.theatreId) {
      throw new AuthorizationError("Actor has no associated theatre context.");
    }

    if (requestedTheatreId && requestedTheatreId !== actor.theatreId) {
      throw new AuthorizationError(
        `Cross-tenant access violation: Cannot validate layout for theatre '${requestedTheatreId}'`
      );
    }

    return actor.theatreId;
  }

  /**
   * 1. Run Complete Validation on Layout Version
   */
  public async runValidation(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): Promise<ValidationReport> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    // Fetch Version and Layout
    const layoutVersion = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!layoutVersion) {
      throw new NotFoundError(`Layout version '${layoutVersionId}' not found.`);
    }

    // Fetch Sections, Rows, Seats, Structural Objects
    const sections = await this.sectionRowRepo.listSectionsByVersion(theatreId, layoutVersionId);
    let seats = SeatGeneratorRepository.loadSeatsByVersion(layoutVersionId, theatreId);

    // Fallback: If no dedicated seat templates exist yet, adapt legacy layout seats
    if (seats.length === 0 && layoutVersion.seats && layoutVersion.seats.length > 0) {
      seats = layoutVersion.seats.map((s) => ({
        id: s.id,
        theatreId,
        layoutVersionId,
        sectionId: s.sectionId,
        rowId: `row-${s.row}`,
        seatNumber: s.seatNumber,
        columnNumber: s.column,
        categoryCode: s.seatType?.toUpperCase() || "STANDARD",
        categoryName: s.seatType || "Standard",
        categoryColor: "#3B82F6",
        coordinates: {
          id: `coord-${s.id}`,
          seatTemplateId: s.id,
          x: s.coordinates.x,
          y: s.coordinates.y,
          rotation: 0,
          width: 36,
          height: 36,
          spacing: 10,
        },
        metadata: {
          id: `meta-${s.id}`,
          seatTemplateId: s.id,
          seatName: s.seatNumber,
          displayName: `Seat ${s.seatNumber}`,
          seatCode: s.seatNumber,
          rowId: `row-${s.row}`,
          rowName: s.row,
          sectionId: s.sectionId,
          sectionName: "Standard",
          categoryCode: s.seatType?.toUpperCase() || "STANDARD",
          status: s.isActive ? "ACTIVE" : "INACTIVE",
        },
        accessibility: {
          id: `acc-${s.id}`,
          seatTemplateId: s.id,
          accessibilityType: "STANDARD",
          isWheelchairAccessible: false,
          hasCompanionSeat: false,
          hasAccessibleRoute: true,
        },
        status: s.isActive ? "ACTIVE" : "INACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }
    const structuralObjects = await structuralObjectRepository.listByLayoutVersion(
      theatreId,
      layoutVersionId
    );

    // Fetch Theatre Policy
    const policy = await this.validationRepo.getPolicy(theatreId);

    const canvasBounds =
      layoutVersion.gridConfig && layoutVersion.gridConfig.columns
        ? {
            width: Math.max(1600, layoutVersion.gridConfig.columns * 40),
            height: Math.max(1200, layoutVersion.gridConfig.rows * 40),
          }
        : { width: 1600, height: 1200 };

    // Assemble Validation Context
    const ctx: ValidationRuleContext = {
      theatreId,
      layoutVersionId,
      layoutDefinitionName: layoutVersion.name,
      canvasBounds,
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        capacity: s.capacity,
        category: s.seatCategory,
        rows: s.rows.map((r) => ({
          id: r.id,
          rowName: r.rowName,
          seatCount: r.seatCount,
          spacing: r.spacing,
        })),
      })),
      seats: seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        rowId: s.rowId,
        sectionId: s.sectionId,
        coordinates: {
          x: s.coordinates.x,
          y: s.coordinates.y,
          width: s.coordinates.width,
          height: s.coordinates.height,
          rotation: s.coordinates.rotation,
        },
        accessibility: {
          isWheelchairAccessible: s.accessibility.isWheelchairAccessible,
          hasCompanionSeat: s.accessibility.hasCompanionSeat,
          hasAccessibleRoute: s.accessibility.hasAccessibleRoute,
        },
        categoryCode: s.categoryCode,
        status: s.status,
      })),
      structuralObjects: structuralObjects.map((o) => ({
        id: o.id,
        objectName: o.objectName,
        displayName: o.displayName,
        objectType: o.objectType,
        internalCode: o.internalCode,
        position: o.position,
        width: o.width,
        height: o.height,
        rotation: o.rotation,
        visibility: o.visibility,
        isLocked: o.isLocked,
        metadata: {
          isStatic: o.metadata.isStatic,
          isCollisionObstacle: o.metadata.isCollisionObstacle,
          isReservedArea: o.metadata.isReservedArea,
        },
      })),
    };

    // Run Engine
    const report = await HallValidationEngine.evaluateLayout(ctx, policy);
    report.evaluatedBy = actor.userId;

    // Save report to audit history
    await this.validationRepo.saveReport(report);

    logger.info("AUDIT", "Layout validation evaluated", {
      metadata: {
        module: "HALL_VALIDATION",
        action: "RUN_VALIDATION",
        reportId: report.reportId,
        layoutVersionId,
        theatreId,
        canPublish: report.canPublish,
        errorsCount: report.summary.errorsCount,
        warningsCount: report.summary.warningsCount,
        actorId: actor.userId,
      },
    });

    return report;
  }

  /**
   * 2. Pre-Publish Validation Gate
   * Strictly blocks layout publication if any critical errors exist.
   */
  public async validateBeforePublish(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): Promise<ValidationReport> {
    const report = await this.runValidation(actor, layoutVersionId, requestedTheatreId);

    if (!report.canPublish) {
      const errorMessages = report.results
        .filter((r) => !r.passed && r.severity === "ERROR")
        .map((r) => r.message)
        .join("; ");

      throw new ValidationError(
        `Pre-publish validation blocked layout publication: ${errorMessages}`
      );
    }

    return report;
  }

  /**
   * 3. Load Active Validation Rules
   */
  public async loadValidationRules(
    actor: SecurityActorContext,
    requestedTheatreId?: string
  ): Promise<ValidationRule[]> {
    this.resolveTheatreId(actor, requestedTheatreId);
    return this.validationRepo.listRules();
  }

  /**
   * 4. Save Theatre Validation Configuration
   */
  public async saveValidationConfiguration(
    actor: SecurityActorContext,
    updates: Partial<ValidationConfiguration>,
    requestedTheatreId?: string
  ): Promise<ValidationConfiguration> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const updated = await this.validationRepo.saveConfiguration(theatreId, updates);

    logger.info("AUDIT", "Validation configuration saved", {
      metadata: {
        module: "HALL_VALIDATION",
        action: "SAVE_CONFIG",
        theatreId,
        actorId: actor.userId,
      },
    });

    return updated;
  }

  /**
   * 5. Save Theatre Validation Policy Overrides
   */
  public async saveValidationPolicy(
    actor: SecurityActorContext,
    policyUpdates: Partial<ValidationPolicy>,
    requestedTheatreId?: string
  ): Promise<ValidationPolicy> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const updated = await this.validationRepo.savePolicy(theatreId, policyUpdates);

    logger.info("AUDIT", "Validation policy saved", {
      metadata: {
        module: "HALL_VALIDATION",
        action: "SAVE_POLICY",
        theatreId,
        policyLevel: updated.policyLevel,
        actorId: actor.userId,
      },
    });

    return updated;
  }
}

export const hallValidationService = HallValidationService.getInstance();
