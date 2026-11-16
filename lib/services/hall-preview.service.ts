/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Domain Service
 * Phase 4 – Part 9: Multi-Mode Production-Ready Hall Preview Service
 * ==============================================================================
 */

import {
  PreviewMode,
  PreviewViewport,
  PreviewPreferences,
  HallPreviewBundle,
  BookingSimulationState,
} from "@/types/hall-preview.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { SectionRowRepository } from "@/lib/repositories/section-row.repository";
import { SeatGeneratorRepository } from "@/lib/repositories/seat-generator.repository";
import { SeatTemplate } from "@/types/seat-generator.types";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { hallPreviewRepository, HallPreviewRepository } from "@/lib/repositories/hall-preview.repository";
import { HallPreviewEngine } from "@/lib/engine/hall-preview-engine";
import { AuthorizationError, NotFoundError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("HallPreviewService");

export class HallPreviewService {
  private static instance: HallPreviewService | null = null;
  private hallDesignerRepo: HallDesignerRepository;
  private sectionRowRepo: SectionRowRepository;
  private previewRepo: HallPreviewRepository;

  private constructor() {
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
    this.sectionRowRepo = SectionRowRepository.getInstance();
    this.previewRepo = hallPreviewRepository;
  }

  public static getInstance(): HallPreviewService {
    if (!HallPreviewService.instance) {
      HallPreviewService.instance = new HallPreviewService();
    }
    return HallPreviewService.instance;
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
        `Cross-tenant access violation: Cannot access preview for theatre '${requestedTheatreId}'`
      );
    }

    return actor.theatreId;
  }

  /**
   * 1. Load Complete Preview Bundle
   */
  public async loadPreview(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string,
    mode: PreviewMode = "CUSTOMER",
    viewport: PreviewViewport = "DESKTOP"
  ): Promise<HallPreviewBundle> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    // Fetch Version and Layout Definition
    const layoutVersion = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!layoutVersion) {
      throw new NotFoundError(`Layout version '${layoutVersionId}' not found.`);
    }

    const layoutDef = this.hallDesignerRepo.getLayoutDefinitionById(
      layoutVersion.layoutDefinitionId,
      theatreId
    );
    if (!layoutDef) {
      throw new NotFoundError(
        `Layout definition '${layoutVersion.layoutDefinitionId}' not found.`
      );
    }

    // Fetch Sections, Rows, Seats, Structural Objects
    const sections = await this.sectionRowRepo.listSectionsByVersion(theatreId, layoutVersionId);
    const rows = sections.flatMap((s) => s.rows || []);
    const seats = this.getSeatsForVersion(layoutVersionId, theatreId, layoutVersion);
    const structuralObjects = await structuralObjectRepository.listByLayoutVersion(
      theatreId,
      layoutVersionId
    );

    // Fetch Theatre Preview Preferences
    const preferences = await this.previewRepo.getPreferences(theatreId);

    // Compute Viewport Transformation
    const canvasDimensions =
      layoutVersion.gridConfig && layoutVersion.gridConfig.columns
        ? {
            width: Math.max(1600, layoutVersion.gridConfig.columns * 40),
            height: Math.max(1200, layoutVersion.gridConfig.rows * 40),
          }
        : { width: 1600, height: 1200 };

    const viewportTransform = HallPreviewEngine.computeViewportTransform(
      viewport,
      canvasDimensions,
      canvasDimensions
    );

    // Generate Statistics
    const statistics = HallPreviewEngine.generateStatistics(sections, seats, structuralObjects);

    logger.info("AUDIT", "Hall preview bundle loaded", {
      metadata: {
        module: "HALL_PREVIEW",
        action: "LOAD_PREVIEW",
        layoutVersionId,
        theatreId,
        mode,
        viewport,
        seatsCount: seats.length,
        actorId: actor.userId,
      },
    });

    return {
      layoutDefinition: layoutDef,
      layoutVersion,
      sections,
      rows,
      seats,
      structuralObjects,
      preferences,
      statistics,
      viewportConfig: {
        targetViewport: viewport,
        canvasDimensions,
        scaleFactor: viewportTransform.scaleFactor,
        fitZoom: viewportTransform.fitZoom,
      },
    };
  }

  /**
   * 2. Refresh Preview Bundle (Cache Buster)
   */
  public async refreshPreview(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): Promise<HallPreviewBundle> {
    return this.loadPreview(actor, layoutVersionId, requestedTheatreId);
  }

  /**
   * 3. Load Theatre Preview Configuration
   */
  public async loadPreviewConfiguration(
    actor: SecurityActorContext,
    requestedTheatreId?: string
  ): Promise<PreviewPreferences> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.previewRepo.getPreferences(theatreId);
  }

  /**
   * 4. Save Theatre Preview Preferences
   */
  public async savePreviewPreferences(
    actor: SecurityActorContext,
    preferences: Partial<PreviewPreferences>,
    requestedTheatreId?: string
  ): Promise<PreviewPreferences> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const updated = await this.previewRepo.savePreferences(theatreId, preferences);

    logger.info("AUDIT", "Theatre preview preferences saved", {
      metadata: {
        module: "HALL_PREVIEW",
        action: "SAVE_PREFERENCES",
        theatreId,
        actorId: actor.userId,
      },
    });

    return updated;
  }

  /**
   * Helper: Resolves seat templates for a version, adapting legacy seats if templates have not yet been generated
   */
  private getSeatsForVersion(
    layoutVersionId: string,
    theatreId: string,
    existingLayoutVersion?: any
  ): SeatTemplate[] {
    let seats = SeatGeneratorRepository.loadSeatsByVersion(layoutVersionId, theatreId);
    if (seats.length === 0) {
      const version =
        existingLayoutVersion ||
        this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
      if (version?.seats && version.seats.length > 0) {
        seats = version.seats.map((s: any) => ({
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
    }
    return seats;
  }

  /**
   * 5. Run Interactive Booking Simulation
   */
  public async runBookingSimulation(
    actor: SecurityActorContext,
    layoutVersionId: string,
    seatIdsToToggle: string[],
    requestedTheatreId?: string
  ): Promise<BookingSimulationState> {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const seats = this.getSeatsForVersion(layoutVersionId, theatreId);

    let state: BookingSimulationState = {
      selectedSeatIds: [],
      selectedSeats: [],
      totalPrice: 0,
      categoryBreakdown: {},
      maxSeatsAllowed: 10,
      activeStep: "SELECTING",
    };

    for (const seatId of seatIdsToToggle) {
      const targetSeat = seats.find((s) => s.id === seatId);
      if (targetSeat) {
        state = HallPreviewEngine.simulateSeatToggle(state, targetSeat);
      }
    }

    return state;
  }
}

export const hallPreviewService = HallPreviewService.getInstance();
