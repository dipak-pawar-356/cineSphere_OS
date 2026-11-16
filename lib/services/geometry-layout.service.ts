import {
  GeometrySettings,
  GeometryTransformCommand,
  LayoutPublishPreflightResult,
  SymmetryAxis,
  BaseLayoutObject,
} from "@/types/geometry-layout.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { GeometryLayoutRepository, geometryLayoutRepository } from "@/lib/repositories/geometry-layout.repository";
import { StructuralObjectRepository, structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { SectionRowRepository } from "@/lib/repositories/section-row.repository";
import { SeatGeneratorRepository } from "@/lib/repositories/seat-generator.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { GeometryEngine } from "@/lib/engine/geometry-engine";
import { AuthorizationError, ConflictError, NotFoundError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("GeometryLayoutService");

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Domain Service (Phase 4 – Part 8)
 * ==============================================================================
 * Advanced computational geometry domain service:
 * 1. Unified Layout Object transformations and command execution pipeline.
 * 2. Layout mirroring, symmetrical duplicity, and alignment tools.
 * 3. Pre-flight validation gate before publication.
 * ==============================================================================
 */

export class GeometryLayoutService {
  private static instance: GeometryLayoutService | null = null;
  private hallDesignerRepo: HallDesignerRepository;
  private sectionRowRepo: SectionRowRepository;

  private constructor() {
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
    this.sectionRowRepo = SectionRowRepository.getInstance();
  }

  public static getInstance(): GeometryLayoutService {
    if (!GeometryLayoutService.instance) {
      GeometryLayoutService.instance = new GeometryLayoutService();
    }
    return GeometryLayoutService.instance;
  }

  /**
   * Resolve and enforce theatre tenant context.
   */
  private resolveTheatreId(actor: SecurityActorContext, requestedTheatreId?: string): string {
    if (actor.role === "SUPER_ADMIN") {
      return requestedTheatreId || actor.theatreId || "th-pun-001";
    }
    if (!actor.theatreId) {
      throw new AuthorizationError("Actor is not associated with any cinema theatre.");
    }
    if (requestedTheatreId && requestedTheatreId !== actor.theatreId) {
      throw new AuthorizationError(
        `Cross-tenant access violation: Cannot operate on theatre '${requestedTheatreId}' from theatre '${actor.theatreId}'.`
      );
    }
    return actor.theatreId;
  }

  /**
   * Enforce editable DRAFT layout status.
   */
  private ensureDraftStatus(layoutVersionId: string, theatreId: string): void {
    const version = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!version) return;
    if (version.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Layout Violation: Cannot transform layout version '${layoutVersionId}' because its status is '${version.status}'. Only 'DRAFT' versions may be transformed.`
      );
    }
  }

  public async getGeometrySettings(
    actor: SecurityActorContext,
    theatreId?: string
  ): Promise<GeometrySettings> {
    const tid = this.resolveTheatreId(actor, theatreId);
    return geometryLayoutRepository.getSettings(tid);
  }

  public async saveGeometrySettings(
    actor: SecurityActorContext,
    settings: Partial<Omit<GeometrySettings, "id" | "theatreId" | "createdAt">>,
    theatreId?: string
  ): Promise<GeometrySettings> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const updated = await geometryLayoutRepository.saveSettings(tid, settings);

    logger.info("AUDIT", "Geometry settings saved", {
      metadata: {
        module: "GEOMETRY_LAYOUT",
        action: "SAVE_SETTINGS",
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return updated;
  }

  public async applyTransform(
    actor: SecurityActorContext,
    command: Omit<GeometryTransformCommand, "id" | "timestamp" | "appliedBy"> & {
      theatreId?: string;
    }
  ): Promise<GeometryTransformCommand> {
    const tid = this.resolveTheatreId(actor, command.theatreId);
    this.ensureDraftStatus(command.layoutVersionId, tid);

    const recorded = await geometryLayoutRepository.recordTransform({
      ...command,
      id: `cmd-${crypto.randomUUID()}`,
      theatreId: tid,
      appliedBy: actor.userId,
      timestamp: new Date().toISOString(),
    });

    logger.info("AUDIT", "Geometry transformation applied", {
      metadata: {
        module: "GEOMETRY_LAYOUT",
        action: "APPLY_TRANSFORM",
        type: command.type,
        layoutVersionId: command.layoutVersionId,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return recorded;
  }

  public async mirrorLayout(
    actor: SecurityActorContext,
    params: {
      layoutVersionId: string;
      axis: SymmetryAxis;
      axisCoord?: number;
      theatreId?: string;
    }
  ): Promise<{ mirroredObjectsCount: number }> {
    const tid = this.resolveTheatreId(actor, params.theatreId);
    this.ensureDraftStatus(params.layoutVersionId, tid);

    const axisCoord = params.axisCoord ?? (params.axis === "HORIZONTAL" ? 800 : 600);

    // Structural objects mirror
    const objects = await structuralObjectRepository.listByLayoutVersion(tid, params.layoutVersionId);
    let mirroredCount = 0;

    for (const obj of objects) {
      if (obj.isLocked) continue;

      const center = {
        x: obj.position.x + obj.width / 2,
        y: obj.position.y + obj.height / 2,
      };
      const mirrored = GeometryEngine.mirrorPoint(center, params.axis, axisCoord);
      const newX = Math.round(mirrored.x - obj.width / 2);
      const newY = Math.round(mirrored.y - obj.height / 2);

      await structuralObjectRepository.update(tid, obj.id, {
        position: { ...obj.position, x: newX, y: newY },
      });
      mirroredCount++;
    }

    logger.info("AUDIT", "Layout mirrored", {
      metadata: {
        module: "GEOMETRY_LAYOUT",
        action: "MIRROR_LAYOUT",
        axis: params.axis,
        axisCoord,
        layoutVersionId: params.layoutVersionId,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return { mirroredObjectsCount: mirroredCount };
  }

  public async duplicateSelection(
    actor: SecurityActorContext,
    params: {
      layoutVersionId: string;
      objectIds: string[];
      offsetDx?: number;
      offsetDy?: number;
      theatreId?: string;
    }
  ): Promise<BaseLayoutObject[]> {
    const tid = this.resolveTheatreId(actor, params.theatreId);
    this.ensureDraftStatus(params.layoutVersionId, tid);

    const dx = params.offsetDx ?? 30;
    const dy = params.offsetDy ?? 30;
    const duplicated: BaseLayoutObject[] = [];

    for (const id of params.objectIds) {
      const obj = await structuralObjectRepository.getById(tid, id);
      if (obj) {
        const copy = await structuralObjectRepository.duplicate(tid, id);
        // Apply custom offset
        const updatedCopy = await structuralObjectRepository.update(tid, copy.id, {
          position: {
            ...copy.position,
            x: obj.position.x + dx,
            y: obj.position.y + dy,
          },
        });
        duplicated.push({
          id: updatedCopy.id,
          layoutVersionId: updatedCopy.layoutVersionId,
          theatreId: updatedCopy.theatreId,
          objectType: "STRUCTURAL",
          name: updatedCopy.objectName,
          displayName: updatedCopy.displayName,
          position: updatedCopy.position,
          width: updatedCopy.width,
          height: updatedCopy.height,
          rotation: updatedCopy.rotation,
          layer: updatedCopy.layer,
          zIndex: updatedCopy.zIndex,
          isVisible: updatedCopy.visibility === "VISIBLE",
          isLocked: updatedCopy.isLocked,
          metadata: updatedCopy.metadata as unknown as Record<string, unknown>,
        });
      }
    }

    logger.info("AUDIT", "Objects duplicated with offset", {
      metadata: {
        module: "GEOMETRY_LAYOUT",
        action: "DUPLICATE_SELECTION",
        count: duplicated.length,
        layoutVersionId: params.layoutVersionId,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return duplicated;
  }

  public async validateLayoutBeforePublish(
    actor: SecurityActorContext,
    layoutVersionId: string,
    theatreId?: string
  ): Promise<LayoutPublishPreflightResult> {
    const tid = this.resolveTheatreId(actor, theatreId);

    const layoutVersion = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, tid) || {
      id: layoutVersionId,
      theatreId: tid,
    };

    const sections = await this.sectionRowRepo.listSectionsByVersion(tid, layoutVersionId);
    const seats = SeatGeneratorRepository.loadSeatsByVersion(layoutVersionId, tid);
    const structuralObjects = await structuralObjectRepository.listByLayoutVersion(tid, layoutVersionId);

    const result = GeometryEngine.validateLayoutBeforePublish({
      layoutVersion,
      sections,
      seats,
      structuralObjects,
    });

    logger.info("AUDIT", "Preflight layout validation evaluated", {
      metadata: {
        module: "GEOMETRY_LAYOUT",
        action: "VALIDATE_BEFORE_PUBLISH",
        canPublish: result.canPublish,
        blockingErrorsCount: result.blockingErrors.length,
        warningsCount: result.complianceWarnings.length,
        layoutVersionId,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return result;
  }
}

export const geometryLayoutService = GeometryLayoutService.getInstance();
