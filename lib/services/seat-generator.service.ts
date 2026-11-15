import {
  SeatTemplate,
  SeatCategoryRegistryItem,
  SeatGenerationConfig,
  BulkSeatGenerationResult,
  SeatValidationResult,
  SeatMetadata,
  SeatAccessibility,
} from "@/types/seat-generator.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { SeatGeneratorRepository } from "@/lib/repositories/seat-generator.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { AuthorizationError, ConflictError, ValidationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("SeatGeneratorService");

/**
 * ==============================================================================
 * CineSphere OS — Seat Generator & Category Domain Service
 * Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories)
 * ==============================================================================
 * Central domain service managing:
 * 1. Part 5: Seat Template generation, regeneration, deletion, coordinates, metadata.
 * 2. Part 6: Seat Category dynamic registry (unlimited custom categories, decoupled pricing).
 *
 * Invariants Enforced:
 * - Tenant Boundary Isolation across all operations.
 * - Immutable Version Policy: mutations restricted strictly to 'DRAFT' layout versions.
 * - Decoupled Pricing: Categories define classification ONLY; prices are never embedded.
 * - Audit Trail logging for all creation, mutation, and deletion events.
 * ==============================================================================
 */

export class SeatGeneratorService {
  private static instance: SeatGeneratorService | null = null;
  private hallDesignerRepo: HallDesignerRepository;

  private constructor() {
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
  }

  public static getInstance(): SeatGeneratorService {
    if (!SeatGeneratorService.instance) {
      SeatGeneratorService.instance = new SeatGeneratorService();
    }
    return SeatGeneratorService.instance;
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
   * Enforce that the target layout version is strictly in editable DRAFT status.
   */
  private ensureDraftStatus(layoutVersionId: string, theatreId: string): void {
    const version = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!version) return;
    if (version.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Version Policy: Layout version '${layoutVersionId}' has status '${version.status}' and cannot be modified. Only DRAFT versions permit seat generation or metadata updates.`
      );
    }
  }

  // ----------------------------------------------------------------------------
  // Part 5: Seat Generator Operations
  // ----------------------------------------------------------------------------

  public generateSeats(
    actor: SecurityActorContext,
    config: SeatGenerationConfig,
    rowContext: {
      rowName: string;
      sectionName: string;
      categoryName?: string;
      categoryColor?: string;
    }
  ): BulkSeatGenerationResult {
    const theatreId = this.resolveTheatreId(actor, config.theatreId);
    this.ensureDraftStatus(config.layoutVersionId, theatreId);

    if (config.seatCount <= 0 || config.seatCount > 100) {
      throw new ValidationError("Seat count must be between 1 and 100 per row.");
    }

    const result = SeatGeneratorRepository.generateSeats(
      { ...config, theatreId },
      rowContext
    );

    logger.info("AUDIT", "Seats automatically generated for row", {
      userId: actor.userId,
      theatreId,
      metadata: {
        rowId: config.rowId,
        seatCount: result.generatedCount,
        isValid: result.validation.isValid,
      },
    });

    return result;
  }

  public regenerateSeats(
    actor: SecurityActorContext,
    rowId: string,
    layoutVersionId: string,
    config: SeatGenerationConfig,
    rowContext: {
      rowName: string;
      sectionName: string;
      categoryName?: string;
      categoryColor?: string;
    },
    requestedTheatreId?: string
  ): BulkSeatGenerationResult {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId || config.theatreId);
    this.ensureDraftStatus(layoutVersionId, theatreId);

    const result = SeatGeneratorRepository.regenerateSeats(
      rowId,
      theatreId,
      { ...config, theatreId },
      rowContext
    );

    logger.info("AUDIT", "Seats regenerated for row", {
      userId: actor.userId,
      theatreId,
      metadata: {
        rowId,
        newSeatCount: result.generatedCount,
      },
    });

    return result;
  }

  public deleteGeneratedSeats(
    actor: SecurityActorContext,
    rowId: string,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): { deletedCount: number } {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    this.ensureDraftStatus(layoutVersionId, theatreId);

    const deletedCount = SeatGeneratorRepository.deleteGeneratedSeats(rowId, theatreId);

    logger.info("AUDIT", "Deleted generated seats for row", {
      userId: actor.userId,
      theatreId,
      metadata: {
        rowId,
        deletedCount,
      },
    });

    return { deletedCount };
  }

  public loadSeats(
    actor: SecurityActorContext,
    rowId: string,
    requestedTheatreId?: string
  ): SeatTemplate[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return SeatGeneratorRepository.loadSeatsByRow(rowId, theatreId);
  }

  public loadSeatsByVersion(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): SeatTemplate[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return SeatGeneratorRepository.loadSeatsByVersion(layoutVersionId, theatreId);
  }

  public updateSeatMetadata(
    actor: SecurityActorContext,
    seatId: string,
    layoutVersionId: string,
    updates: {
      metadata?: Partial<SeatMetadata>;
      accessibility?: Partial<SeatAccessibility>;
      coordinates?: Partial<SeatTemplate["coordinates"]>;
      categoryCode?: string;
      status?: SeatTemplate["status"];
    },
    requestedTheatreId?: string
  ): SeatTemplate {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    this.ensureDraftStatus(layoutVersionId, theatreId);

    const updated = SeatGeneratorRepository.updateSeatMetadata(
      seatId,
      theatreId,
      updates
    );

    logger.info("AUDIT", "Updated seat metadata", {
      userId: actor.userId,
      theatreId,
      metadata: {
        seatId,
        seatNumber: updated.seatNumber,
      },
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // Part 6: Dynamic Seat Category Registry Operations
  // ----------------------------------------------------------------------------

  public loadCategories(
    actor: SecurityActorContext,
    requestedTheatreId?: string,
    includeArchived = false
  ): SeatCategoryRegistryItem[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return SeatGeneratorRepository.loadCategories(theatreId, includeArchived);
  }

  public getCategory(
    actor: SecurityActorContext,
    categoryId: string,
    requestedTheatreId?: string
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return SeatGeneratorRepository.getCategoryById(categoryId, theatreId);
  }

  public createCategory(
    actor: SecurityActorContext,
    category: Omit<SeatCategoryRegistryItem, "id" | "createdAt" | "updatedAt">
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, category.theatreId);

    // Architectural Invariant: Pricing separation check
    const rawCat = category as unknown as Record<string, unknown>;
    if (
      rawCat.price !== undefined ||
      rawCat.basePrice !== undefined ||
      rawCat.ticketPrice !== undefined
    ) {
      throw new ValidationError(
        "Architectural Violation: Seat Categories must NEVER contain ticket prices. Pricing is dynamically resolved through the Show Pricing engine."
      );
    }

    if (!category.code || !category.name) {
      throw new ValidationError("Category code and name are required.");
    }

    const created = SeatGeneratorRepository.createCategory({
      ...category,
      theatreId,
    });

    logger.info("AUDIT", "Created seat category in registry", {
      userId: actor.userId,
      theatreId,
      metadata: {
        categoryId: created.id,
        code: created.code,
      },
    });

    return created;
  }

  public updateCategory(
    actor: SecurityActorContext,
    categoryId: string,
    updates: Partial<Omit<SeatCategoryRegistryItem, "id" | "theatreId" | "createdAt">>,
    requestedTheatreId?: string
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);

    // Architectural Invariant: Pricing separation check
    const rawUpdates = updates as unknown as Record<string, unknown>;
    if (
      rawUpdates.price !== undefined ||
      rawUpdates.basePrice !== undefined ||
      rawUpdates.ticketPrice !== undefined
    ) {
      throw new ValidationError(
        "Architectural Violation: Seat Categories must NEVER contain ticket prices."
      );
    }

    const updated = SeatGeneratorRepository.updateCategory(
      categoryId,
      theatreId,
      updates
    );

    logger.info("AUDIT", "Updated seat category in registry", {
      userId: actor.userId,
      theatreId,
      metadata: {
        categoryId,
        code: updated.code,
      },
    });

    return updated;
  }

  public archiveCategory(
    actor: SecurityActorContext,
    categoryId: string,
    requestedTheatreId?: string
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const archived = SeatGeneratorRepository.archiveCategory(categoryId, theatreId);

    logger.info("AUDIT", "Archived seat category", {
      userId: actor.userId,
      theatreId,
      metadata: { categoryId },
    });

    return archived;
  }

  public restoreCategory(
    actor: SecurityActorContext,
    categoryId: string,
    requestedTheatreId?: string
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const restored = SeatGeneratorRepository.restoreCategory(categoryId, theatreId);

    logger.info("AUDIT", "Restored seat category", {
      userId: actor.userId,
      theatreId,
      metadata: { categoryId },
    });

    return restored;
  }

  public duplicateCategory(
    actor: SecurityActorContext,
    categoryId: string,
    requestedTheatreId?: string
  ): SeatCategoryRegistryItem {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const duplicated = SeatGeneratorRepository.duplicateCategory(categoryId, theatreId);

    logger.info("AUDIT", "Duplicated seat category", {
      userId: actor.userId,
      theatreId,
      metadata: {
        sourceCategoryId: categoryId,
        newCategoryId: duplicated.id,
      },
    });

    return duplicated;
  }
}

export const seatGeneratorService = SeatGeneratorService.getInstance();
