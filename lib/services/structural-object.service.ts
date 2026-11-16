import {
  StructuralObject,
  StructuralObjectValidationResult,
  StructuralObjectType,
  StructuralObjectVisibility,
} from "@/types/structural-objects.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { StructuralObjectRepository, structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { SeatGeneratorRepository } from "@/lib/repositories/seat-generator.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { StructuralObjectEngine } from "@/lib/engine/structural-object-engine";
import { AuthorizationError, ConflictError, ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("StructuralObjectService");

/**
 * ==============================================================================
 * CineSphere OS — Structural Object Domain Service (Phase 4 – Part 7)
 * ==============================================================================
 * Enterprise domain service for hall infrastructure management:
 * 1. Multi-tenant boundaries and RBAC permission checks.
 * 2. Immutable draft-only modifications guard.
 * 3. Obstacle collision detection and egress safety validations.
 * 4. Audit logging for compliance and historical tracking.
 * ==============================================================================
 */

export class StructuralObjectService {
  private static instance: StructuralObjectService | null = null;
  private hallDesignerRepo: HallDesignerRepository;

  private constructor() {
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
  }

  public static getInstance(): StructuralObjectService {
    if (!StructuralObjectService.instance) {
      StructuralObjectService.instance = new StructuralObjectService();
    }
    return StructuralObjectService.instance;
  }

  /**
   * Resolve and enforce tenant isolation boundary.
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
   * Ensure mutations are applied strictly to editable DRAFT layouts.
   */
  private ensureDraftStatus(layoutVersionId: string, theatreId: string): void {
    const version = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!version) return;
    if (version.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Layout Violation: Cannot modify structural objects for layout version '${layoutVersionId}' because its status is '${version.status}'. Only 'DRAFT' versions may be edited.`
      );
    }
  }

  public async listObjects(
    actor: SecurityActorContext,
    layoutVersionId: string,
    theatreId?: string
  ): Promise<StructuralObject[]> {
    const tid = this.resolveTheatreId(actor, theatreId);
    return structuralObjectRepository.listByLayoutVersion(tid, layoutVersionId);
  }

  public async getObject(
    actor: SecurityActorContext,
    id: string,
    theatreId?: string
  ): Promise<StructuralObject | null> {
    const tid = this.resolveTheatreId(actor, theatreId);
    return structuralObjectRepository.getById(tid, id);
  }

  public async createObject(
    actor: SecurityActorContext,
    input: Omit<StructuralObject, "id" | "theatreId" | "createdAt" | "updatedAt"> & { id?: string; theatreId?: string }
  ): Promise<StructuralObject> {
    const tid = this.resolveTheatreId(actor, input.theatreId);
    this.ensureDraftStatus(input.layoutVersionId, tid);

    if (!input.objectName || !input.internalCode) {
      throw new ValidationError("Structural object must define an objectName and internalCode.");
    }

    const created = await structuralObjectRepository.create(tid, input);

    logger.info("AUDIT", "Structural object created", {
      metadata: {
        module: "STRUCTURAL_OBJECTS",
        action: "CREATE_OBJECT",
        objectId: created.id,
        theatreId: tid,
        layoutVersionId: created.layoutVersionId,
        actorId: actor.userId,
      },
    });

    return created;
  }

  public async updateObject(
    actor: SecurityActorContext,
    id: string,
    input: Partial<Omit<StructuralObject, "id" | "theatreId" | "layoutVersionId" | "createdAt">> & { theatreId?: string }
  ): Promise<StructuralObject> {
    const tid = this.resolveTheatreId(actor, input.theatreId);
    const existing = await structuralObjectRepository.getById(tid, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    this.ensureDraftStatus(existing.layoutVersionId, tid);

    const updated = await structuralObjectRepository.update(tid, id, input);

    logger.info("AUDIT", "Structural object updated", {
      metadata: {
        module: "STRUCTURAL_OBJECTS",
        action: "UPDATE_OBJECT",
        objectId: id,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return updated;
  }

  public async deleteObject(
    actor: SecurityActorContext,
    id: string,
    theatreId?: string
  ): Promise<boolean> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const existing = await structuralObjectRepository.getById(tid, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    this.ensureDraftStatus(existing.layoutVersionId, tid);

    const deleted = await structuralObjectRepository.delete(tid, id);

    logger.info("AUDIT", "Structural object deleted", {
      metadata: {
        module: "STRUCTURAL_OBJECTS",
        action: "DELETE_OBJECT",
        objectId: id,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return deleted;
  }

  public async duplicateObject(
    actor: SecurityActorContext,
    id: string,
    theatreId?: string
  ): Promise<StructuralObject> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const existing = await structuralObjectRepository.getById(tid, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    this.ensureDraftStatus(existing.layoutVersionId, tid);

    const duplicated = await structuralObjectRepository.duplicate(tid, id);

    logger.info("AUDIT", "Structural object duplicated", {
      metadata: {
        module: "STRUCTURAL_OBJECTS",
        action: "DUPLICATE_OBJECT",
        sourceId: id,
        newId: duplicated.id,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return duplicated;
  }

  public async reorderObjects(
    actor: SecurityActorContext,
    layoutVersionId: string,
    orderedIds: string[],
    theatreId?: string
  ): Promise<StructuralObject[]> {
    const tid = this.resolveTheatreId(actor, theatreId);
    this.ensureDraftStatus(layoutVersionId, tid);

    const reordered = await structuralObjectRepository.reorder(tid, layoutVersionId, orderedIds);

    logger.info("AUDIT", "Structural objects reordered", {
      metadata: {
        module: "STRUCTURAL_OBJECTS",
        action: "REORDER_OBJECTS",
        layoutVersionId,
        theatreId: tid,
        actorId: actor.userId,
      },
    });

    return reordered;
  }

  public async toggleLock(
    actor: SecurityActorContext,
    id: string,
    theatreId?: string
  ): Promise<StructuralObject> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const existing = await structuralObjectRepository.getById(tid, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    this.ensureDraftStatus(existing.layoutVersionId, tid);
    return structuralObjectRepository.toggleLock(tid, id);
  }

  public async toggleVisibility(
    actor: SecurityActorContext,
    id: string,
    theatreId?: string
  ): Promise<StructuralObject> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const existing = await structuralObjectRepository.getById(tid, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    this.ensureDraftStatus(existing.layoutVersionId, tid);
    return structuralObjectRepository.toggleVisibility(tid, id);
  }

  public async validateObjects(
    actor: SecurityActorContext,
    layoutVersionId: string,
    theatreId?: string
  ): Promise<StructuralObjectValidationResult> {
    const tid = this.resolveTheatreId(actor, theatreId);
    const objects = await structuralObjectRepository.listByLayoutVersion(tid, layoutVersionId);
    const seats = SeatGeneratorRepository.loadSeatsByVersion(layoutVersionId, tid);

    return StructuralObjectEngine.validateStructuralObjects(objects, seats);
  }
}

export const structuralObjectService = StructuralObjectService.getInstance();
