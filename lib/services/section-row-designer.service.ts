/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Domain Service (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Central domain service managing:
 * 1. Part 3: Section Designer (Layout Version ──► Sections)
 * 2. Part 4: Row Designer (Section ──► Rows ──► Seats)
 *
 * Enforces:
 * - Immutability: Mutating sections or rows requires the layout version to be 'DRAFT'.
 * - Multi-tenant boundary isolation across cinema venues.
 * - Validation of section name/code uniqueness, row name uniqueness, and capacity parity.
 * ==============================================================================
 */

import {
  HallSection,
  HallRow,
  SectionOrderingDirection,
  SectionValidationResult,
  RowValidationResult,
} from "@/types/section-row-designer.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { SectionRowRepository } from "@/lib/repositories/section-row.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { SectionRowValidator } from "@/lib/engine/section-row-validator";
import { AuthorizationError, NotFoundError, ConflictError, ValidationError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("SectionRowDesignerService");

export class SectionRowDesignerService {
  private static instance: SectionRowDesignerService | null = null;
  private repository: SectionRowRepository;
  private hallDesignerRepo: HallDesignerRepository;

  private constructor() {
    this.repository = SectionRowRepository.getInstance();
    this.hallDesignerRepo = HallDesignerRepository.getInstance();
  }

  public static getInstance(): SectionRowDesignerService {
    if (!SectionRowDesignerService.instance) {
      SectionRowDesignerService.instance = new SectionRowDesignerService();
    }
    return SectionRowDesignerService.instance;
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
   * Verify that layout version is in editable DRAFT status.
   */
  private ensureDraftStatus(layoutVersionId: string, theatreId: string): void {
    const version = this.hallDesignerRepo.getLayoutVersionById(layoutVersionId, theatreId);
    if (!version) return; // if version not yet tracked in designer repo, allow initial composition
    if (version.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Version Policy: Layout version '${layoutVersionId}' has status '${version.status}' and cannot be modified. Create a new draft revision to alter sections or rows.`
      );
    }
  }

  // ----------------------------------------------------------------------------
  // 1. Section Designer Operations (Part 3)
  // ----------------------------------------------------------------------------

  public createSection(
    actor: SecurityActorContext,
    input: Omit<HallSection, "id" | "rows" | "createdAt" | "updatedAt">
  ): HallSection {
    const theatreId = this.resolveTheatreId(actor, input.theatreId);
    this.ensureDraftStatus(input.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Creating hall section", {
      theatreId,
      userId: actor.userId,
      metadata: {
        name: input.name,
        code: input.internalCode,
        category: input.seatCategory,
      },
    });

    return this.repository.createSection({ ...input, theatreId }, actor);
  }

  public getSection(
    actor: SecurityActorContext,
    sectionId: string,
    requestedTheatreId?: string
  ): HallSection {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const section = this.repository.getSectionById(sectionId, theatreId);
    if (!section) {
      throw new NotFoundError(`Section '${sectionId}' not found.`);
    }
    return section;
  }

  public listSections(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): HallSection[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.listSectionsByVersion(layoutVersionId, theatreId);
  }

  public updateSection(
    actor: SecurityActorContext,
    sectionId: string,
    updates: Partial<Omit<HallSection, "id" | "layoutVersionId" | "theatreId" | "rows">>,
    requestedTheatreId?: string
  ): HallSection {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const sec = this.getSection(actor, sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Updating hall section", {
      theatreId,
      userId: actor.userId,
      metadata: { sectionId, updates },
    });

    return this.repository.updateSection(sectionId, theatreId, updates, actor);
  }

  public deleteSection(
    actor: SecurityActorContext,
    sectionId: string,
    requestedTheatreId?: string
  ): boolean {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const sec = this.getSection(actor, sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Deleting hall section", {
      theatreId,
      userId: actor.userId,
      metadata: { sectionId, name: sec.name },
    });

    return this.repository.deleteSection(sectionId, theatreId, actor);
  }

  public duplicateSection(
    actor: SecurityActorContext,
    sectionId: string,
    requestedTheatreId?: string
  ): HallSection {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const sec = this.getSection(actor, sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    return this.repository.duplicateSection(sectionId, theatreId, actor);
  }

  public reorderSections(
    actor: SecurityActorContext,
    layoutVersionId: string,
    sectionId: string,
    direction: SectionOrderingDirection,
    requestedTheatreId?: string
  ): HallSection[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    this.ensureDraftStatus(layoutVersionId, theatreId);

    return this.repository.reorderSections(layoutVersionId, theatreId, sectionId, direction, actor);
  }

  public validateSections(
    actor: SecurityActorContext,
    layoutVersionId: string,
    requestedTheatreId?: string
  ): SectionValidationResult {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const sections = this.repository.listSectionsByVersion(layoutVersionId, theatreId);
    return SectionRowValidator.validateSections(sections);
  }

  // ----------------------------------------------------------------------------
  // 2. Row Designer Operations (Part 4)
  // ----------------------------------------------------------------------------

  public createRow(
    actor: SecurityActorContext,
    input: Omit<HallRow, "id" | "seats" | "createdAt" | "updatedAt">
  ): HallRow {
    const theatreId = this.resolveTheatreId(actor, input.theatreId);
    const sec = this.getSection(actor, input.sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Creating row in section", {
      theatreId,
      userId: actor.userId,
      metadata: {
        sectionId: input.sectionId,
        rowName: input.rowName,
        seatCount: input.seatCount,
      },
    });

    return this.repository.createRow({ ...input, theatreId }, actor);
  }

  public getRow(
    actor: SecurityActorContext,
    rowId: string,
    requestedTheatreId?: string
  ): HallRow {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const row = this.repository.getRowById(rowId, theatreId);
    if (!row) {
      throw new NotFoundError(`Row '${rowId}' not found.`);
    }
    return row;
  }

  public listRows(
    actor: SecurityActorContext,
    sectionId: string,
    requestedTheatreId?: string
  ): HallRow[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    return this.repository.listRowsBySection(sectionId, theatreId);
  }

  public updateRow(
    actor: SecurityActorContext,
    rowId: string,
    updates: Partial<Omit<HallRow, "id" | "sectionId" | "theatreId">>,
    requestedTheatreId?: string
  ): HallRow {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const row = this.getRow(actor, rowId, theatreId);
    const sec = this.getSection(actor, row.sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Updating row", {
      theatreId,
      userId: actor.userId,
      metadata: { rowId, updates },
    });

    return this.repository.updateRow(rowId, theatreId, updates, actor);
  }

  public deleteRow(
    actor: SecurityActorContext,
    rowId: string,
    requestedTheatreId?: string
  ): boolean {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const row = this.getRow(actor, rowId, theatreId);
    const sec = this.getSection(actor, row.sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    logger.info("SYSTEM", "Deleting row", {
      theatreId,
      userId: actor.userId,
      metadata: { rowId, rowName: row.rowName },
    });

    return this.repository.deleteRow(rowId, theatreId, actor);
  }

  public duplicateRow(
    actor: SecurityActorContext,
    rowId: string,
    requestedTheatreId?: string
  ): HallRow {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const row = this.getRow(actor, rowId, theatreId);
    const sec = this.getSection(actor, row.sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    return this.repository.duplicateRow(rowId, theatreId, actor);
  }

  public reorderRows(
    actor: SecurityActorContext,
    sectionId: string,
    rowId: string,
    direction: "UP" | "DOWN",
    requestedTheatreId?: string
  ): HallRow[] {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const sec = this.getSection(actor, sectionId, theatreId);
    this.ensureDraftStatus(sec.layoutVersionId, theatreId);

    return this.repository.reorderRows(sectionId, theatreId, rowId, direction, actor);
  }

  public validateRows(
    actor: SecurityActorContext,
    sectionId: string,
    requestedTheatreId?: string
  ): RowValidationResult {
    const theatreId = this.resolveTheatreId(actor, requestedTheatreId);
    const rows = this.repository.listRowsBySection(sectionId, theatreId);
    return SectionRowValidator.validateRows(sectionId, rows);
  }
}

export const sectionRowDesignerService = SectionRowDesignerService.getInstance();
