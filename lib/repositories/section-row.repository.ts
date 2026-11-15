/**
 * ==============================================================================
 * CineSphere OS — Section & Row Repository (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Dedicated multi-tenant repository managing the hierarchical design objects:
 * Layout Definition ──► Section ──► Row ──► Seats.
 *
 * Guarantees:
 * 1. Strict tenant boundary isolation across cinema complexes.
 * 2. Rows belong strictly to Sections (never directly to the Hall).
 * 3. Seed data populated for Pune, Mumbai, and Dubai auditoriums.
 * ==============================================================================
 */

import {
  HallSection,
  HallRow,
  SectionOrderingDirection,
} from "@/types/section-row-designer.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { SectionRowEngine } from "@/lib/engine/section-row-engine";
import { SectionRowValidator } from "@/lib/engine/section-row-validator";
import { TenantAccessError, NotFoundError, ConflictError } from "@/lib/errors/app-error";

export class SectionRowRepository {
  private static instance: SectionRowRepository | null = null;

  // In-memory relational collections
  private sections: Map<string, HallSection> = new Map();
  private rows: Map<string, HallRow> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): SectionRowRepository {
    if (!SectionRowRepository.instance) {
      SectionRowRepository.instance = new SectionRowRepository();
    }
    return SectionRowRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Section Management (Part 3)
  // ----------------------------------------------------------------------------

  public createSection(
    data: Omit<HallSection, "id" | "rows" | "createdAt" | "updatedAt">,
    actor: SecurityActorContext
  ): HallSection {
    // Check unique section name/code in this layout version
    const existing = Array.from(this.sections.values()).find(
      (s) =>
        s.layoutVersionId === data.layoutVersionId &&
        (s.name.toLowerCase() === data.name.toLowerCase() ||
          s.internalCode.toLowerCase() === data.internalCode.toLowerCase())
    );
    if (existing) {
      throw new ConflictError(
        `A section with name '${data.name}' or code '${data.internalCode}' already exists in this layout.`
      );
    }

    const id = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const section: HallSection = {
      ...data,
      id,
      rows: [],
      capacity: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.sections.set(id, section);
    return section;
  }

  public getSectionById(sectionId: string, theatreId?: string): HallSection | undefined {
    const sec = this.sections.get(sectionId);
    if (!sec) return undefined;
    if (theatreId && sec.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Cross-tenant access blocked: Section '${sectionId}' belongs to another cinema.`
      );
    }
    // Return with associated rows
    const sectionRows = Array.from(this.rows.values())
      .filter((r) => r.sectionId === sectionId)
      .sort((a, b) => a.sequence - b.sequence);
    return {
      ...sec,
      rows: sectionRows,
      capacity: SectionRowEngine.calculateSectionCapacity(sectionRows),
    };
  }

  public listSectionsByVersion(layoutVersionId: string, theatreId: string): HallSection[] {
    return Array.from(this.sections.values())
      .filter((s) => s.layoutVersionId === layoutVersionId && s.theatreId === theatreId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => {
        const sectionRows = Array.from(this.rows.values())
          .filter((r) => r.sectionId === s.id)
          .sort((a, b) => a.sequence - b.sequence);
        return {
          ...s,
          rows: sectionRows,
          capacity: SectionRowEngine.calculateSectionCapacity(sectionRows),
        };
      });
  }

  public updateSection(
    sectionId: string,
    theatreId: string,
    updates: Partial<Omit<HallSection, "id" | "layoutVersionId" | "theatreId" | "rows">>,
    actor: SecurityActorContext
  ): HallSection {
    const sec = this.getSectionById(sectionId, theatreId);
    if (!sec) {
      throw new NotFoundError(`Section '${sectionId}' not found.`);
    }

    const now = new Date().toISOString();
    const updated: HallSection = {
      ...sec,
      ...updates,
      updatedAt: now,
    };

    this.sections.set(sectionId, updated);
    return updated;
  }

  public deleteSection(sectionId: string, theatreId: string, actor: SecurityActorContext): boolean {
    const sec = this.getSectionById(sectionId, theatreId);
    if (!sec) {
      throw new NotFoundError(`Section '${sectionId}' not found.`);
    }

    // Cascade delete rows
    for (const [rowId, row] of this.rows.entries()) {
      if (row.sectionId === sectionId) {
        this.rows.delete(rowId);
      }
    }

    this.sections.delete(sectionId);
    return true;
  }

  public duplicateSection(
    sectionId: string,
    theatreId: string,
    actor: SecurityActorContext
  ): HallSection {
    const original = this.getSectionById(sectionId, theatreId);
    if (!original) {
      throw new NotFoundError(`Section '${sectionId}' not found.`);
    }

    const newSecId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const duplicatedSection: HallSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: newSecId,
      name: `${original.name} (Copy)`,
      displayName: `${original.displayName} (Copy)`,
      internalCode: `${original.internalCode}-COPY`,
      displayOrder: original.displayOrder + 1,
      rows: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sections.set(newSecId, duplicatedSection);

    // Duplicate all rows belonging to the original section
    original.rows.forEach((row) => {
      const newRowId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const duplicatedRow: HallRow = {
        ...JSON.parse(JSON.stringify(row)),
        id: newRowId,
        sectionId: newSecId,
        theatreId,
        createdAt: now,
        updatedAt: now,
      };
      this.rows.set(newRowId, duplicatedRow);
      duplicatedSection.rows.push(duplicatedRow);
    });

    return duplicatedSection;
  }

  public reorderSections(
    layoutVersionId: string,
    theatreId: string,
    sectionId: string,
    direction: SectionOrderingDirection,
    actor: SecurityActorContext
  ): HallSection[] {
    const all = this.listSectionsByVersion(layoutVersionId, theatreId);
    const reordered = SectionRowEngine.reorderSections(all, sectionId, direction);
    reordered.forEach((sec) => {
      this.sections.set(sec.id, sec);
    });
    return reordered;
  }

  // ----------------------------------------------------------------------------
  // 2. Row Management (Part 4)
  // ----------------------------------------------------------------------------

  public createRow(
    data: Omit<HallRow, "id" | "seats" | "createdAt" | "updatedAt">,
    actor: SecurityActorContext
  ): HallRow {
    const sec = this.getSectionById(data.sectionId, data.theatreId);
    if (!sec) {
      throw new NotFoundError(`Parent section '${data.sectionId}' not found.`);
    }

    // Check unique row name within section
    const existing = Array.from(this.rows.values()).find(
      (r) =>
        r.sectionId === data.sectionId &&
        r.rowName.toLowerCase() === data.rowName.toLowerCase()
    );
    if (existing) {
      throw new ConflictError(
        `Row '${data.rowName}' already exists within section '${sec.name}'.`
      );
    }

    const id = `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const rowOrigin = {
      x: sec.position.x,
      y: sec.position.y + (data.sequence - 1) * data.spacing,
    };

    const newRow: HallRow = {
      ...data,
      id,
      seats: [],
      createdAt: now,
      updatedAt: now,
    };

    // Calculate physical seats
    newRow.seats = SectionRowEngine.calculateRowSeats(
      sec.id,
      newRow,
      rowOrigin,
      data.categoryOverride || sec.seatCategory
    );

    this.rows.set(id, newRow);

    // Update parent section capacity
    sec.rows.push(newRow);
    sec.capacity = SectionRowEngine.calculateSectionCapacity(sec.rows);
    this.sections.set(sec.id, sec);

    return newRow;
  }

  public getRowById(rowId: string, theatreId?: string): HallRow | undefined {
    const row = this.rows.get(rowId);
    if (!row) return undefined;
    if (theatreId && row.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Cross-tenant access blocked: Row '${rowId}' belongs to another cinema.`
      );
    }
    return row;
  }

  public listRowsBySection(sectionId: string, theatreId: string): HallRow[] {
    const sec = this.getSectionById(sectionId, theatreId);
    if (!sec) {
      throw new NotFoundError(`Section '${sectionId}' not found.`);
    }

    return Array.from(this.rows.values())
      .filter((r) => r.sectionId === sectionId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  public updateRow(
    rowId: string,
    theatreId: string,
    updates: Partial<Omit<HallRow, "id" | "sectionId" | "theatreId">>,
    actor: SecurityActorContext
  ): HallRow {
    const row = this.getRowById(rowId, theatreId);
    if (!row) {
      throw new NotFoundError(`Row '${rowId}' not found.`);
    }

    const sec = this.getSectionById(row.sectionId, theatreId);
    const now = new Date().toISOString();

    const updated: HallRow = {
      ...row,
      ...updates,
      updatedAt: now,
    };

    // Recalculate seats if seatCount, geometry, configuration or spacing changed
    if (
      updates.seatCount !== undefined ||
      updates.geometry !== undefined ||
      updates.configuration !== undefined ||
      updates.spacing !== undefined ||
      updates.rowName !== undefined
    ) {
      const rowOrigin = {
        x: sec?.position.x || 100,
        y: (sec?.position.y || 100) + (updated.sequence - 1) * updated.spacing,
      };
      updated.seats = SectionRowEngine.calculateRowSeats(
        row.sectionId,
        updated,
        rowOrigin,
        updated.categoryOverride || sec?.seatCategory || "Standard"
      );
    }

    this.rows.set(rowId, updated);

    // Update section capacity
    if (sec) {
      const allRows = this.listRowsBySection(sec.id, theatreId);
      sec.capacity = SectionRowEngine.calculateSectionCapacity(allRows);
      this.sections.set(sec.id, sec);
    }

    return updated;
  }

  public deleteRow(rowId: string, theatreId: string, actor: SecurityActorContext): boolean {
    const row = this.getRowById(rowId, theatreId);
    if (!row) {
      throw new NotFoundError(`Row '${rowId}' not found.`);
    }

    this.rows.delete(rowId);

    // Recalculate section capacity
    const sec = this.getSectionById(row.sectionId, theatreId);
    if (sec) {
      const remainingRows = this.listRowsBySection(sec.id, theatreId);
      sec.capacity = SectionRowEngine.calculateSectionCapacity(remainingRows);
      this.sections.set(sec.id, sec);
    }

    return true;
  }

  public duplicateRow(rowId: string, theatreId: string, actor: SecurityActorContext): HallRow {
    const original = this.getRowById(rowId, theatreId);
    if (!original) {
      throw new NotFoundError(`Row '${rowId}' not found.`);
    }

    const sec = this.getSectionById(original.sectionId, theatreId);
    const allRows = this.listRowsBySection(original.sectionId, theatreId);
    const nextSequence = allRows.length + 1;
    const nextRowName = `${original.rowName}-Copy`;

    return this.createRow(
      {
        sectionId: original.sectionId,
        theatreId,
        rowName: nextRowName,
        displayName: `${original.displayName} (Copy)`,
        sequence: nextSequence,
        seatCount: original.seatCount,
        spacing: original.spacing,
        rotation: original.rotation,
        visibility: original.visibility,
        accessibility: original.accessibility,
        geometry: { ...original.geometry },
        configuration: { ...original.configuration },
        categoryOverride: original.categoryOverride,
      },
      actor
    );
  }

  public reorderRows(
    sectionId: string,
    theatreId: string,
    rowId: string,
    direction: "UP" | "DOWN",
    actor: SecurityActorContext
  ): HallRow[] {
    const rows = this.listRowsBySection(sectionId, theatreId);
    const reordered = SectionRowEngine.reorderRows(rows, rowId, direction);
    reordered.forEach((r) => {
      this.rows.set(r.id, r);
    });
    return reordered;
  }

  // ----------------------------------------------------------------------------
  // 3. Initial Seed Data
  // ----------------------------------------------------------------------------

  private seedInitialData(): void {
    const now = "2026-11-01T00:00:00Z";

    // 1. Pune Flagship (th-pun-001) -> layout-pun-aud1-main -> ver-layout-pun-aud1-main-v4 (Draft)
    const puneVersionId = "ver-layout-pun-aud1-main-v4";

    // Section 1: VIP Prime Recliners (Curved, Red, Priority 1)
    const puneVipSecId = "sec-pun-vip-001";
    const puneVipSec: HallSection = {
      id: puneVipSecId,
      layoutVersionId: puneVersionId,
      theatreId: "th-pun-001",
      name: "VIP Prime",
      displayName: "VIP Prime Recliner Suite",
      internalCode: "SEC-VIP-RED",
      color: "#EF4444", // Red
      seatCategory: "VIP",
      capacity: 20,
      priority: 1,
      displayOrder: 1,
      rotation: 0,
      position: { x: 120, y: 160 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "CURVED",
        curvatureRadius: 600,
        arcAngle: 30,
      },
      labelPosition: "TOP",
      notes: "Ultra-luxury electric recliners with food tray tables.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(puneVipSecId, puneVipSec);

    // Rows for VIP Section: Row A (10 seats), Row B (10 seats), Row C (10 seats)
    ["A", "B", "C"].forEach((rowLetter, idx) => {
      const rowId = `row-pun-vip-${rowLetter}`;
      const row: HallRow = {
        id: rowId,
        sectionId: puneVipSecId,
        theatreId: "th-pun-001",
        rowName: rowLetter,
        displayName: `Row ${rowLetter} (VIP)`,
        sequence: idx + 1,
        seatCount: 10,
        spacing: 35,
        rotation: 0,
        visibility: "VISIBLE",
        accessibility: "STANDARD",
        geometry: {
          geometryType: "CURVED",
          curveRadius: 600,
        },
        configuration: {
          numberingStrategy: "ALPHABETICAL",
          isReversed: false,
          startIndex: 1,
          endIndex: 10,
        },
        categoryOverride: "VIP",
        seats: [],
        createdAt: now,
        updatedAt: now,
      };
      row.seats = SectionRowEngine.calculateRowSeats(
        puneVipSecId,
        row,
        { x: puneVipSec.position.x, y: puneVipSec.position.y + idx * 50 },
        "VIP"
      );
      this.rows.set(rowId, row);
      puneVipSec.rows.push(row);
    });

    // Section 2: Club Standard (Straight, Gold, Priority 2)
    const puneStdSecId = "sec-pun-std-002";
    const puneStdSec: HallSection = {
      id: puneStdSecId,
      layoutVersionId: puneVersionId,
      theatreId: "th-pun-001",
      name: "Club Standard",
      displayName: "Club Standard Seating",
      internalCode: "SEC-STD-PUN",
      color: "#FBBF24", // Gold
      seatCategory: "Standard",
      capacity: 80,
      priority: 2,
      displayOrder: 2,
      rotation: 0,
      position: { x: 120, y: 300 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "RECTANGLE",
      },
      labelPosition: "TOP",
      notes: "Premium stadium-tiered seating.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(puneStdSecId, puneStdSec);

    // Section 3: Executive Green (Rectangle, Green, Priority 3)
    const puneExecSecId = "sec-pun-exec-003";
    const puneExecSec: HallSection = {
      id: puneExecSecId,
      layoutVersionId: puneVersionId,
      theatreId: "th-pun-001",
      name: "Section Executive Green",
      displayName: "Executive Lounge Seating",
      internalCode: "SEC-EXEC-GREEN",
      color: "#10B981", // Green
      seatCategory: "VIP",
      capacity: 30,
      priority: 3,
      displayOrder: 3,
      rotation: 0,
      position: { x: 120, y: 500 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "RECTANGLE",
      },
      labelPosition: "TOP",
      notes: "Executive premium lounge section.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(puneExecSecId, puneExecSec);

    // Rows for Club Standard: Rows C through J (10 seats each)
    ["C", "D", "E", "F", "G", "H", "I", "J"].forEach((rowLetter, idx) => {
      const rowId = `row-pun-std-${rowLetter}`;
      const isWheelchairRow = rowLetter === "J";
      const row: HallRow = {
        id: rowId,
        sectionId: puneStdSecId,
        theatreId: "th-pun-001",
        rowName: rowLetter,
        displayName: `Row ${rowLetter}`,
        sequence: idx + 1,
        seatCount: 10,
        spacing: 45,
        rotation: 0,
        visibility: "VISIBLE",
        accessibility: isWheelchairRow ? "WHEELCHAIR" : "STANDARD",
        geometry: {
          geometryType: "STRAIGHT",
        },
        configuration: {
          numberingStrategy: "ALPHABETICAL",
          isReversed: false,
          startIndex: 1,
          endIndex: 10,
        },
        categoryOverride: isWheelchairRow ? "Wheelchair" : undefined,
        seats: [],
        createdAt: now,
        updatedAt: now,
      };
      row.seats = SectionRowEngine.calculateRowSeats(
        puneStdSecId,
        row,
        { x: puneStdSec.position.x, y: puneStdSec.position.y + idx * 45 },
        "Standard"
      );
      this.rows.set(rowId, row);
      puneStdSec.rows.push(row);
    });

    // 2. Mumbai Royale (th-mum-002) -> Arc Geometry & Numeric Numbering (1..20)
    const mumSecId = "sec-mum-luxury-001";
    const mumSec: HallSection = {
      id: mumSecId,
      layoutVersionId: "ver-layout-mum-aud1-v1",
      theatreId: "th-mum-002",
      name: "Premium Left",
      displayName: "Luxury Recliner Section",
      internalCode: "SEC-PREM-LEFT",
      color: "#8B5CF6", // Purple
      seatCategory: "Recliner",
      capacity: 30,
      priority: 1,
      displayOrder: 1,
      rotation: 10,
      position: { x: 100, y: 150 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "ARC",
        curvatureRadius: 750,
        arcAngle: 45,
      },
      labelPosition: "LEFT",
      notes: "Mumbai Royale curved luxury seating tier.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(mumSecId, mumSec);

    const mumRow: HallRow = {
      id: "row-mum-lux-1",
      sectionId: mumSecId,
      theatreId: "th-mum-002",
      rowName: "1",
      displayName: "Row 1 (Luxury)",
      sequence: 1,
      seatCount: 15,
      spacing: 40,
      rotation: 10,
      visibility: "VISIBLE",
      accessibility: "STANDARD",
      geometry: { geometryType: "ARC", curveRadius: 750 },
      configuration: { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 15 },
      seats: [],
      createdAt: now,
      updatedAt: now,
    };
    mumRow.seats = SectionRowEngine.calculateRowSeats(
      mumSecId,
      mumRow,
      { x: mumSec.position.x, y: mumSec.position.y },
      "Recliner"
    );
    this.rows.set(mumRow.id, mumRow);
    mumSec.rows.push(mumRow);

    const mumRightSecId = "sec-mum-luxury-002";
    const mumRightSec: HallSection = {
      id: mumRightSecId,
      layoutVersionId: "ver-layout-mum-aud1-v1",
      theatreId: "th-mum-002",
      name: "Premium Right",
      displayName: "Luxury Right Recliner Section",
      internalCode: "SEC-PREM-RIGHT",
      color: "#8B5CF6",
      seatCategory: "Recliner",
      capacity: 30,
      priority: 1,
      displayOrder: 2,
      rotation: -10,
      position: { x: 400, y: 150 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "ARC",
        curvatureRadius: 750,
        arcAngle: 45,
      },
      labelPosition: "RIGHT",
      notes: "Mumbai Royale right curved luxury tier.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(mumRightSecId, mumRightSec);

    // 3. Dubai Grand (th-dxb-003) -> Angled Geometry & Custom Numbering (AA..AZ)
    const dxbSecId = "sec-dxb-balcony-001";
    const dxbSec: HallSection = {
      id: dxbSecId,
      layoutVersionId: "ver-layout-dxb-aud1-v1",
      theatreId: "th-dxb-003",
      name: "Balcony East",
      displayName: "Balcony Economy",
      internalCode: "SEC-BALC-EAST",
      color: "#3B82F6", // Blue
      seatCategory: "Standard",
      capacity: 40,
      priority: 3,
      displayOrder: 1,
      rotation: 0,
      position: { x: 150, y: 180 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "IRREGULAR",
      },
      labelPosition: "RIGHT",
      notes: "Dubai Grand upper tier balcony.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(dxbSecId, dxbSec);

    const dxbRow: HallRow = {
      id: "row-dxb-balc-1",
      sectionId: dxbSecId,
      theatreId: "th-dxb-003",
      rowName: "AA",
      displayName: "Row AA (Balcony)",
      sequence: 1,
      seatCount: 20,
      spacing: 45,
      rotation: 0,
      visibility: "VISIBLE",
      accessibility: "STANDARD",
      geometry: { geometryType: "STRAIGHT" },
      configuration: { numberingStrategy: "CUSTOM", isReversed: false, startIndex: 1, endIndex: 20 },
      seats: [],
      createdAt: now,
      updatedAt: now,
    };
    dxbRow.seats = SectionRowEngine.calculateRowSeats(
      dxbSecId,
      dxbRow,
      { x: dxbSec.position.x, y: dxbSec.position.y },
      "Standard"
    );
    this.rows.set(dxbRow.id, dxbRow);
    dxbSec.rows.push(dxbRow);

    const dxbWestSecId = "sec-dxb-balcony-002";
    const dxbWestSec: HallSection = {
      id: dxbWestSecId,
      layoutVersionId: "ver-layout-dxb-aud1-v1",
      theatreId: "th-dxb-003",
      name: "Balcony West",
      displayName: "Balcony Economy West",
      internalCode: "SEC-BALC-WEST",
      color: "#3B82F6",
      seatCategory: "Standard",
      capacity: 40,
      priority: 3,
      displayOrder: 2,
      rotation: 0,
      position: { x: 500, y: 180 },
      visibility: "VISIBLE",
      geometry: {
        shapeType: "IRREGULAR",
      },
      labelPosition: "LEFT",
      notes: "Dubai Grand west balcony.",
      rows: [],
      createdAt: now,
      updatedAt: now,
    };
    this.sections.set(dxbWestSecId, dxbWestSec);
  }

  public reset(): void {
    this.sections.clear();
    this.rows.clear();
    this.seedInitialData();
  }
}

export const sectionRowRepository = SectionRowRepository.getInstance();
