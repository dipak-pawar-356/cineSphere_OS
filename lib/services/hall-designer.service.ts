/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Domain Service (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Central domain service managing the immutable Layout Definition lifecycle,
 * version creation, draft updates, mathematical validation prior to publish,
 * seat coordinate integrity, and theatre-specific canvas configuration.
 *
 * Architecture:
 * 1. The Hall Designer NEVER edits live layouts directly.
 * 2. All draft operations are contained within isolated Draft Versions.
 * 3. Live shows and bookings only read the published layout version.
 * 4. Publishing requires successful validation through the LayoutValidator.
 * 5. Every theatre stores its own customizable canvas grid preferences.
 * ==============================================================================
 */

import {
  LayoutDefinition,
  LayoutVersion,
  LayoutValidationResult,
  CanvasPreferences,
  HallSectionDefinition,
  SeatDefinition,
} from "@/types/hall-designer.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { LayoutValidator } from "@/lib/engine/layout-validator";
import { AuthorizationError, NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("HallDesignerService");

export class HallDesignerService {
  private static instance: HallDesignerService | null = null;
  private repository: HallDesignerRepository;

  private constructor() {
    this.repository = HallDesignerRepository.getInstance();
  }

  public static getInstance(): HallDesignerService {
    if (!HallDesignerService.instance) {
      HallDesignerService.instance = new HallDesignerService();
    }
    return HallDesignerService.instance;
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

  // ----------------------------------------------------------------------------
  // 1. Layout Definition Lifecycle
  // ----------------------------------------------------------------------------

  public createLayoutDefinition(
    actor: SecurityActorContext,
    input: {
      theatreId: string;
      hallId: string;
      name: string;
      description?: string;
    }
  ): { definition: LayoutDefinition; initialDraft: LayoutVersion } {
    const effectiveTheatreId = this.resolveTheatreId(actor, input.theatreId);

    logger.info("SYSTEM", "Creating layout definition", {
      theatreId: effectiveTheatreId,
      userId: actor.userId,
      metadata: {
        hallId: input.hallId,
        name: input.name,
      },
    });

    const definition = this.repository.createLayoutDefinition(
      {
        ...input,
        theatreId: effectiveTheatreId,
      },
      actor
    );

    const initialDraft = this.repository.getLayoutVersionById(
      definition.activeDraftVersionId!,
      effectiveTheatreId
    )!;

    return { definition, initialDraft };
  }

  public getLayoutDefinition(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    requestedTheatreId?: string
  ): {
    definition: LayoutDefinition;
    versions: LayoutVersion[];
    currentPublishedVersion?: LayoutVersion;
    activeDraftVersion?: LayoutVersion;
  } {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const definition = this.repository.getLayoutDefinitionById(layoutDefinitionId, theatreId);

    if (!definition) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const versions = this.repository.listVersionsByDefinition(layoutDefinitionId, theatreId);
    const currentPublishedVersion = definition.currentPublishedVersionId
      ? this.repository.getLayoutVersionById(definition.currentPublishedVersionId, theatreId)
      : undefined;
    const activeDraftVersion = definition.activeDraftVersionId
      ? this.repository.getLayoutVersionById(definition.activeDraftVersionId, theatreId)
      : undefined;

    return {
      definition,
      versions,
      currentPublishedVersion,
      activeDraftVersion,
    };
  }

  public listLayoutDefinitions(
    actor: SecurityActorContext,
    hallId?: string,
    requestedTheatreId?: string
  ): LayoutDefinition[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.listLayoutDefinitions(theatreId, hallId);
  }

  // ----------------------------------------------------------------------------
  // 2. Layout Version Lifecycle & Editing
  // ----------------------------------------------------------------------------

  public getLayoutVersion(
    actor: SecurityActorContext,
    versionId: string,
    requestedTheatreId?: string
  ): LayoutVersion {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const version = this.repository.getLayoutVersionById(versionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${versionId}' not found.`);
    }
    return version;
  }

  public listLayoutVersions(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    requestedTheatreId?: string
  ): LayoutVersion[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.listVersionsByDefinition(layoutDefinitionId, theatreId);
  }

  public createDraftVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    notes: string,
    requestedTheatreId?: string
  ): LayoutVersion {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    logger.info("SYSTEM", "Creating new draft version", {
      theatreId,
      userId: actor.userId,
      metadata: {
        layoutDefinitionId,
      },
    });

    return this.repository.createDraftVersion(layoutDefinitionId, theatreId, notes, actor);
  }

  public updateDraftLayout(
    actor: SecurityActorContext,
    versionId: string,
    payload: {
      sections?: HallSectionDefinition[];
      seats?: SeatDefinition[];
      walkways?: any[];
      emergencyExits?: any[];
      gridConfig?: { rows: number; columns: number; totalCapacity: number };
      versionNotes?: string;
    },
    requestedTheatreId?: string
  ): LayoutVersion {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    logger.info("SYSTEM", "Updating draft layout version", {
      theatreId,
      userId: actor.userId,
      metadata: {
        versionId,
        seatCount: payload.seats?.length,
        sectionCount: payload.sections?.length,
      },
    });

    return this.repository.updateDraftLayout(versionId, theatreId, payload, actor);
  }

  public validateLayoutVersion(
    actor: SecurityActorContext,
    versionId: string,
    requestedTheatreId?: string
  ): LayoutValidationResult {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const version = this.repository.getLayoutVersionById(versionId, theatreId);

    if (!version) {
      throw new NotFoundError(`Layout version '${versionId}' not found.`);
    }

    return LayoutValidator.validateLayoutVersion(version);
  }

  public publishLayoutVersion(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    versionId: string,
    requestedTheatreId?: string
  ): { definition: LayoutDefinition; publishedVersion: LayoutVersion } {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    logger.info("AUDIT", "Attempting to publish layout version", {
      theatreId,
      userId: actor.userId,
      metadata: {
        layoutDefinitionId,
        versionId,
      },
    });

    // 1. Validate layout integrity before publishing
    const version = this.repository.getLayoutVersionById(versionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${versionId}' not found.`);
    }

    // Status transition check
    const transition = LayoutValidator.isValidStatusTransition(version.status, "PUBLISHED");
    if (!transition.allowed) {
      throw new ValidationError(transition.reason || "Illegal status transition to PUBLISHED.");
    }

    // Full structural validation
    const validationResult = LayoutValidator.validateLayoutVersion(version);
    if (!validationResult.isValid) {
      throw new ValidationError(
        `Cannot publish invalid layout: ${validationResult.errors.join("; ")}`
      );
    }

    // 2. Perform publishing atomically in repository
    const result = this.repository.publishLayoutVersion(
      layoutDefinitionId,
      versionId,
      theatreId,
      actor
    );

    logger.info("AUDIT", "Layout version published successfully", {
      theatreId,
      userId: actor.userId,
      metadata: {
        layoutDefinitionId,
        versionId,
        versionNumber: result.publishedVersion.versionNumber,
        totalCapacity: result.publishedVersion.seats.length,
      },
    });

    return result;
  }

  public archiveLayout(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    requestedTheatreId?: string
  ): LayoutDefinition {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.archiveLayout(layoutDefinitionId, theatreId, actor);
  }

  public restoreLayout(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    versionId: string,
    requestedTheatreId?: string
  ): LayoutVersion {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.restoreLayout(layoutDefinitionId, versionId, theatreId, actor);
  }

  public duplicateLayout(
    actor: SecurityActorContext,
    layoutDefinitionId: string,
    newName: string,
    requestedTheatreId?: string
  ): { definition: LayoutDefinition; initialVersion: LayoutVersion } {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.duplicateLayout(layoutDefinitionId, theatreId, newName, actor);
  }

  /**
   * Critical API for Show Seat Inventory generation and Booking Engine:
   * Returns only the current published layout version for an auditorium.
   */
  public getPublishedLayoutForHall(
    actor: SecurityActorContext,
    hallId: string,
    requestedTheatreId?: string
  ): LayoutVersion | undefined {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.getPublishedLayoutForHall(hallId, theatreId);
  }

  // ----------------------------------------------------------------------------
  // 3. Canvas Preferences (Part 2)
  // ----------------------------------------------------------------------------

  public getCanvasPreferences(
    actor: SecurityActorContext,
    requestedTheatreId?: string
  ): CanvasPreferences {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.getCanvasPreferences(theatreId);
  }

  public saveCanvasPreferences(
    actor: SecurityActorContext,
    preferences: Partial<CanvasPreferences>,
    requestedTheatreId?: string
  ): CanvasPreferences {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.saveCanvasPreferences(theatreId, preferences);
  }

  public resetCanvasPreferences(
    actor: SecurityActorContext,
    requestedTheatreId?: string
  ): CanvasPreferences {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.resetCanvasPreferences(theatreId);
  }
}

export const hallDesignerService = HallDesignerService.getInstance();
