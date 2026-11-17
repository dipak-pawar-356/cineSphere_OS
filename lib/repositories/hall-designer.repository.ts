/**
 * ==============================================================================
 * CineSphere OS — Hall Designer Repository (Phase 4 – Parts 1 & 2)
 * ==============================================================================
 * Dedicated persistence and domain data layer for Layout Definitions, immutable
 * Layout Versions, and theatre-specific Canvas Preferences.
 *
 * Guarantees:
 * 1. Strict multi-tenant boundary isolation (cross-theatre access blocked).
 * 2. In-flight shows and bookings query only the current published version.
 * 3. Hall Designer works purely on draft versions until publication.
 * ==============================================================================
 */

import {
  LayoutDefinition,
  LayoutVersion,
  LayoutStatus,
  CanvasPreferences,
  HallSectionDefinition,
  SeatDefinition,
} from "@/types/hall-designer.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { TenantAccessError, NotFoundError, ConflictError } from "@/lib/errors/app-error";

export class HallDesignerRepository {
  private static instance: HallDesignerRepository | null = null;

  // In-memory data stores
  private definitions: Map<string, LayoutDefinition> = new Map();
  private versions: Map<string, LayoutVersion> = new Map();
  private canvasPreferences: Map<string, CanvasPreferences> = new Map();

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): HallDesignerRepository {
    if (!HallDesignerRepository.instance) {
      HallDesignerRepository.instance = new HallDesignerRepository();
    }
    return HallDesignerRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Layout Definitions (Source of Truth)
  // ----------------------------------------------------------------------------

  public createLayoutDefinition(
    data: {
      theatreId: string;
      hallId: string;
      name: string;
      description?: string;
    },
    actor: SecurityActorContext
  ): LayoutDefinition {
    // Unique layout name per hall check
    const existing = Array.from(this.definitions.values()).find(
      (d) =>
        d.theatreId === data.theatreId &&
        d.hallId === data.hallId &&
        d.name.toLowerCase() === data.name.toLowerCase()
    );
    if (existing) {
      throw new ConflictError(
        `A layout named '${data.name}' already exists for this auditorium.`
      );
    }

    const id = `layout-def-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const def: LayoutDefinition = {
      id,
      theatreId: data.theatreId,
      hallId: data.hallId,
      name: data.name,
      description: data.description,
      status: "DRAFT",
      totalVersionsCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    // Create initial v1 Draft Version
    const v1Id = `ver-${id}-v1`;
    const v1: LayoutVersion = {
      id: v1Id,
      layoutDefinitionId: id,
      theatreId: data.theatreId,
      versionNumber: 1,
      name: `${data.name} (v1 Draft)`,
      status: "DRAFT",
      versionNotes: "Initial draft version",
      sections: [
        {
          id: `sec-${id}-standard`,
          name: "Standard Section",
          displayOrder: 1,
          seatCount: 40,
          seatType: "Standard",
          displayColor: "#FBBF24",
          rowLabels: ["A", "B", "C", "D"],
          seatsPerRow: 10,
        },
      ],
      seats: this.generateDefaultSeats(v1Id, `sec-${id}-standard`, ["A", "B", "C", "D"], 10, "Standard"),
      walkways: [],
      vipZones: [],
      wheelchairAreas: [],
      emergencyExits: [
        { id: `exit-1`, position: "TOP_LEFT", label: "Exit A", widthUnits: 2 },
        { id: `exit-2`, position: "TOP_RIGHT", label: "Exit B", widthUnits: 2 },
      ],
      gridConfig: {
        rows: 8,
        columns: 12,
        totalCapacity: 40,
      },
      metadata: {
        createdBy: actor.userId,
        updatedBy: actor.userId,
        seatCountSummary: {
          standard: 40,
          vip: 0,
          recliner: 0,
          sofa: 0,
          wheelchair: 0,
          total: 40,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    def.activeDraftVersionId = v1Id;

    this.definitions.set(id, def);
    this.versions.set(v1Id, v1);

    return def;
  }

  public getLayoutDefinitionById(
    id: string,
    theatreId?: string
  ): LayoutDefinition | undefined {
    const def = this.definitions.get(id);
    if (!def) return undefined;
    if (theatreId && def.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Cross-tenant layout access blocked: Layout '${id}' belongs to another theatre.`
      );
    }
    return def;
  }

  public listLayoutDefinitions(theatreId: string, hallId?: string): LayoutDefinition[] {
    const list = Array.from(this.definitions.values()).filter(
      (d) => d.theatreId === theatreId
    );
    if (!hallId) return list;
    return list.filter((d) => d.hallId === hallId);
  }

  // ----------------------------------------------------------------------------
  // 2. Layout Versions Management
  // ----------------------------------------------------------------------------

  public getLayoutVersionById(
    versionId: string,
    theatreId?: string
  ): LayoutVersion | undefined {
    const ver = this.versions.get(versionId);
    if (!ver) return undefined;
    if (theatreId && ver.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Cross-tenant layout version access blocked: Version '${versionId}' belongs to another theatre.`
      );
    }
    return ver;
  }

  public listVersionsByDefinition(
    layoutDefinitionId: string,
    theatreId: string
  ): LayoutVersion[] {
    const def = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    return Array.from(this.versions.values())
      .filter((v) => v.layoutDefinitionId === layoutDefinitionId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public createDraftVersion(
    layoutDefinitionId: string,
    theatreId: string,
    notes: string,
    actor: SecurityActorContext
  ): LayoutVersion {
    const def = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    // Get current source version (either active draft or latest published)
    const sourceVerId = def.activeDraftVersionId || def.currentPublishedVersionId;
    const sourceVer = sourceVerId ? this.versions.get(sourceVerId) : undefined;

    const nextVerNumber = def.totalVersionsCount + 1;
    const now = new Date().toISOString();
    const newVerId = `ver-${def.id}-v${nextVerNumber}`;

    const newVer: LayoutVersion = {
      id: newVerId,
      layoutDefinitionId: def.id,
      theatreId: def.theatreId,
      versionNumber: nextVerNumber,
      name: `${def.name} (v${nextVerNumber} Draft)`,
      status: "DRAFT",
      versionNotes: notes,
      sections: sourceVer ? JSON.parse(JSON.stringify(sourceVer.sections)) : [],
      seats: sourceVer ? JSON.parse(JSON.stringify(sourceVer.seats)) : [],
      walkways: sourceVer ? JSON.parse(JSON.stringify(sourceVer.walkways)) : [],
      vipZones: sourceVer ? [...sourceVer.vipZones] : [],
      wheelchairAreas: sourceVer ? [...sourceVer.wheelchairAreas] : [],
      emergencyExits: sourceVer ? JSON.parse(JSON.stringify(sourceVer.emergencyExits)) : [],
      gridConfig: sourceVer ? { ...sourceVer.gridConfig } : { rows: 10, columns: 12, totalCapacity: 0 },
      metadata: {
        createdBy: actor.userId,
        updatedBy: actor.userId,
        versionNotes: notes,
        seatCountSummary: sourceVer
          ? { ...sourceVer.metadata.seatCountSummary }
          : { standard: 0, vip: 0, recliner: 0, sofa: 0, wheelchair: 0, total: 0 },
      },
      createdAt: now,
      updatedAt: now,
    };

    def.activeDraftVersionId = newVerId;
    def.totalVersionsCount = nextVerNumber;
    def.updatedAt = now;

    this.versions.set(newVerId, newVer);
    return newVer;
  }

  public updateDraftLayout(
    versionId: string,
    theatreId: string,
    payload: {
      sections?: HallSectionDefinition[];
      seats?: SeatDefinition[];
      walkways?: any[];
      emergencyExits?: any[];
      gridConfig?: { rows: number; columns: number; totalCapacity: number };
      versionNotes?: string;
    },
    actor: SecurityActorContext
  ): LayoutVersion {
    const ver = this.getLayoutVersionById(versionId, theatreId);
    if (!ver) {
      throw new NotFoundError(`Layout version '${versionId}' not found.`);
    }

    if (ver.status !== "DRAFT") {
      throw new ConflictError(
        `Immutable Version Policy: Layout version '${versionId}' has status '${ver.status}' and cannot be edited. Create a new draft version to make changes.`
      );
    }

    const now = new Date().toISOString();

    if (payload.sections) ver.sections = payload.sections;
    if (payload.seats) ver.seats = payload.seats;
    if (payload.walkways) ver.walkways = payload.walkways;
    if (payload.emergencyExits) ver.emergencyExits = payload.emergencyExits;
    if (payload.gridConfig) ver.gridConfig = payload.gridConfig;
    if (payload.versionNotes !== undefined) ver.versionNotes = payload.versionNotes;

    // Recalculate summary
    const summary = {
      standard: ver.seats.filter((s) => s.seatType === "Standard").length,
      vip: ver.seats.filter((s) => s.seatType === "VIP").length,
      recliner: ver.seats.filter((s) => s.seatType === "Recliner").length,
      sofa: ver.seats.filter((s) => s.seatType === "Sofa").length,
      wheelchair: ver.seats.filter((s) => s.seatType === "Wheelchair" || s.isAccessible).length,
      total: ver.seats.length,
    };

    ver.metadata.seatCountSummary = summary;
    ver.metadata.updatedBy = actor.userId;
    ver.updatedAt = now;

    const def = this.definitions.get(ver.layoutDefinitionId);
    if (def) def.updatedAt = now;

    return ver;
  }

  public publishLayoutVersion(
    layoutDefinitionId: string,
    versionId: string,
    theatreId: string,
    actor: SecurityActorContext
  ): { definition: LayoutDefinition; publishedVersion: LayoutVersion } {
    const def = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const ver = this.getLayoutVersionById(versionId, theatreId);
    if (!ver || ver.layoutDefinitionId !== layoutDefinitionId) {
      throw new NotFoundError(`Layout version '${versionId}' does not belong to definition '${layoutDefinitionId}'.`);
    }

    const now = new Date().toISOString();

    // 1. Archive previously published version if any
    if (def.currentPublishedVersionId && def.currentPublishedVersionId !== versionId) {
      const prevPublished = this.versions.get(def.currentPublishedVersionId);
      if (prevPublished) {
        prevPublished.status = "ARCHIVED";
        prevPublished.archivedAt = now;
        prevPublished.updatedAt = now;
      }
    }

    // 2. Mark target version as PUBLISHED
    ver.status = "PUBLISHED";
    ver.publishedAt = now;
    ver.updatedAt = now;
    ver.metadata.publishedBy = actor.userId;

    // 3. Update master layout definition pointer
    def.currentPublishedVersionId = versionId;
    def.status = "PUBLISHED";
    def.updatedAt = now;

    // If active draft was the published version, clear active draft
    if (def.activeDraftVersionId === versionId) {
      def.activeDraftVersionId = undefined;
    }

    return { definition: def, publishedVersion: ver };
  }

  public archiveLayout(
    layoutDefinitionId: string,
    theatreId: string,
    actor: SecurityActorContext
  ): LayoutDefinition {
    const def = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const now = new Date().toISOString();
    def.status = "ARCHIVED";
    def.updatedAt = now;

    // Mark current versions as archived
    for (const v of this.versions.values()) {
      if (v.layoutDefinitionId === layoutDefinitionId) {
        v.status = "ARCHIVED";
        v.archivedAt = now;
        v.updatedAt = now;
      }
    }

    return def;
  }

  public restoreLayout(
    layoutDefinitionId: string,
    versionId: string,
    theatreId: string,
    actor: SecurityActorContext
  ): LayoutVersion {
    const def = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!def) {
      throw new NotFoundError(`Layout definition '${layoutDefinitionId}' not found.`);
    }

    const sourceVer = this.getLayoutVersionById(versionId, theatreId);
    if (!sourceVer) {
      throw new NotFoundError(`Source version '${versionId}' not found.`);
    }

    // Create a new active draft derived from the restored version
    return this.createDraftVersion(
      layoutDefinitionId,
      theatreId,
      `Restored from v${sourceVer.versionNumber}`,
      actor
    );
  }

  public duplicateLayout(
    layoutDefinitionId: string,
    theatreId: string,
    newName: string,
    actor: SecurityActorContext
  ): { definition: LayoutDefinition; initialVersion: LayoutVersion } {
    const sourceDef = this.getLayoutDefinitionById(layoutDefinitionId, theatreId);
    if (!sourceDef) {
      throw new NotFoundError(`Source layout definition '${layoutDefinitionId}' not found.`);
    }

    // Find best version to copy (published version first, fallback to active draft)
    const sourceVerId = sourceDef.currentPublishedVersionId || sourceDef.activeDraftVersionId;
    const sourceVer = sourceVerId ? this.versions.get(sourceVerId) : undefined;

    const newDef = this.createLayoutDefinition(
      {
        theatreId,
        hallId: sourceDef.hallId,
        name: newName,
        description: `Duplicated from '${sourceDef.name}'`,
      },
      actor
    );

    const initialDraft = this.versions.get(newDef.activeDraftVersionId!)!;
    if (sourceVer) {
      initialDraft.sections = JSON.parse(JSON.stringify(sourceVer.sections));
      initialDraft.seats = JSON.parse(JSON.stringify(sourceVer.seats));
      initialDraft.walkways = JSON.parse(JSON.stringify(sourceVer.walkways));
      initialDraft.emergencyExits = JSON.parse(JSON.stringify(sourceVer.emergencyExits));
      initialDraft.gridConfig = { ...sourceVer.gridConfig };
      initialDraft.metadata.seatCountSummary = { ...sourceVer.metadata.seatCountSummary };
    }

    return { definition: newDef, initialVersion: initialDraft };
  }

  /**
   * Get the current published layout version for an auditorium.
   * This is what in-flight shows, seat inventory generator, and booking engines read.
   */
  public getPublishedLayoutForHall(hallId: string, theatreId: string): LayoutVersion | undefined {
    const def = Array.from(this.definitions.values()).find(
      (d) => d.hallId === hallId && d.theatreId === theatreId && d.status === "PUBLISHED"
    );
    if (!def || !def.currentPublishedVersionId) return undefined;
    return this.versions.get(def.currentPublishedVersionId);
  }

  // ----------------------------------------------------------------------------
  // 3. Canvas Preferences (Part 2)
  // ----------------------------------------------------------------------------

  public getCanvasPreferences(theatreId: string): CanvasPreferences {
    const existing = this.canvasPreferences.get(theatreId);
    if (existing) return existing;

    // Default configuration
    const defaultPrefs: CanvasPreferences = {
      theatreId,
      gridSize: 20,
      gridDensity: "MEDIUM",
      gridVisible: true,
      gridColor: "#2A3445",
      gridOpacity: 50,
      snapEnabled: true,
      snapStrength: 8,
      defaultZoom: 100,
      measurementUnit: "PX",
      canvasWidth: 2400,
      canvasHeight: 1800,
      backgroundColor: "#070B12",
      showMiniMap: true,
      showSmartGuides: true,
      updatedAt: new Date().toISOString(),
    };

    this.canvasPreferences.set(theatreId, defaultPrefs);
    return defaultPrefs;
  }

  public saveCanvasPreferences(
    theatreId: string,
    updates: Partial<Omit<CanvasPreferences, "theatreId" | "updatedAt">>
  ): CanvasPreferences {
    const current = this.getCanvasPreferences(theatreId);
    const updated: CanvasPreferences = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.canvasPreferences.set(theatreId, updated);
    return updated;
  }

  public resetCanvasPreferences(theatreId: string): CanvasPreferences {
    this.canvasPreferences.delete(theatreId);
    return this.getCanvasPreferences(theatreId);
  }

  // ----------------------------------------------------------------------------
  // Helper: Seat Generation & Initial Seeding
  // ----------------------------------------------------------------------------

  private generateDefaultSeats(
    layoutId: string,
    sectionId: string,
    rows: string[],
    seatsPerRow: number,
    seatType: any
  ): SeatDefinition[] {
    const seats: SeatDefinition[] = [];
    const seatWidth = 36;
    const seatHeight = 36;
    const gapX = 12;
    const gapY = 16;
    const startX = 120;
    const startY = 160;

    rows.forEach((row, rIdx) => {
      for (let c = 1; c <= seatsPerRow; c++) {
        seats.push({
          id: `seat-${layoutId}-${row}${c}`,
          seatNumber: `${row}${c}`,
          row,
          column: c,
          sectionId,
          seatType,
          coordinates: {
            x: startX + (c - 1) * (seatWidth + gapX),
            y: startY + rIdx * (seatHeight + gapY),
          },
          isActive: true,
        });
      }
    });

    return seats;
  }

  private seedInitialData(): void {
    const now = "2026-11-01T00:00:00Z";

    // 1. Pune Flagship Venue (th-pun-001), Auditorium 1 (hall-pun-aud1)
    const puneDefId = "layout-pun-aud1-main";
    const puneV2Id = "ver-layout-pun-aud1-main-v2";
    const puneV3Id = "ver-layout-pun-aud1-main-v3";
    const puneV4Id = "ver-layout-pun-aud1-main-v4";

    const puneDef: LayoutDefinition = {
      id: puneDefId,
      theatreId: "th-pun-001",
      hallId: "hall-pun-aud1",
      name: "IMAX Laser Master Blueprint",
      description: "Official 100-seat IMAX Laser auditorium configuration with VIP recliners.",
      currentPublishedVersionId: puneV3Id,
      activeDraftVersionId: puneV4Id,
      status: "PUBLISHED",
      totalVersionsCount: 4,
      createdAt: now,
      updatedAt: "2026-11-14T00:00:00Z",
    };

    // Archived Version 2 (Legacy Production Baseline)
    const puneV2: LayoutVersion = {
      id: puneV2Id,
      layoutDefinitionId: puneDefId,
      theatreId: "th-pun-001",
      versionNumber: 2,
      name: "IMAX Laser Master (v2 Legacy)",
      status: "ARCHIVED",
      versionNotes: "Initial legacy rollout version with 100 Standard seats.",
      sections: [
        {
          id: "sec-pun-std",
          name: "Club Standard",
          displayOrder: 1,
          seatCount: 100,
          seatType: "Standard",
          displayColor: "#FBBF24",
          rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
          seatsPerRow: 10,
        },
      ],
      seats: [
        ...this.generateDefaultSeats(puneV2Id, "sec-pun-std", ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], 10, "Standard"),
      ],
      walkways: [
        { id: "ww-1", afterColumn: 5, widthUnits: 2, label: "Center Aisle" },
      ],
      vipZones: [],
      wheelchairAreas: [],
      emergencyExits: [
        { id: "exit-pun-1", position: "TOP_LEFT", label: "Exit Gate 1", widthUnits: 2 },
      ],
      gridConfig: {
        rows: 10,
        columns: 10,
        totalCapacity: 100,
      },
      metadata: {
        createdBy: "usr-admin-pune",
        updatedBy: "usr-admin-pune",
        publishedBy: "usr-admin-pune",
        versionNotes: "Legacy production version",
        seatCountSummary: {
          standard: 100,
          vip: 0,
          recliner: 0,
          sofa: 0,
          wheelchair: 0,
          total: 100,
        },
      },
      publishedAt: "2026-10-01T08:00:00Z",
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-01T08:00:00Z",
    };

    // Published Version 3
    const puneV3: LayoutVersion = {
      id: puneV3Id,
      layoutDefinitionId: puneDefId,
      theatreId: "th-pun-001",
      versionNumber: 3,
      name: "IMAX Laser Master (v3 Live)",
      status: "PUBLISHED",
      versionNotes: "Certified commercial release with 20 VIP and 80 Standard seats.",
      sections: [
        {
          id: "sec-pun-vip",
          name: "VIP Prime Recliners",
          displayOrder: 1,
          seatCount: 20,
          seatType: "VIP",
          displayColor: "#38BDF8",
          rowLabels: ["A", "B"],
          seatsPerRow: 10,
        },
        {
          id: "sec-pun-std",
          name: "Club Standard",
          displayOrder: 2,
          seatCount: 80,
          seatType: "Standard",
          displayColor: "#FBBF24",
          rowLabels: ["C", "D", "E", "F", "G", "H", "I", "J"],
          seatsPerRow: 10,
        },
      ],
      seats: [
        ...this.generateDefaultSeats(puneV3Id, "sec-pun-vip", ["A", "B"], 10, "VIP"),
        ...this.generateDefaultSeats(puneV3Id, "sec-pun-std", ["C", "D", "E", "F", "G", "H", "I", "J"], 10, "Standard"),
      ],
      walkways: [
        { id: "ww-1", afterColumn: 5, widthUnits: 2, label: "Center Aisle" },
      ],
      vipZones: ["sec-pun-vip"],
      wheelchairAreas: ["A1", "A10"],
      emergencyExits: [
        { id: "exit-pun-1", position: "TOP_LEFT", label: "Exit Gate 1", widthUnits: 2 },
        { id: "exit-pun-2", position: "TOP_RIGHT", label: "Exit Gate 2", widthUnits: 2 },
      ],
      gridConfig: {
        rows: 10,
        columns: 12,
        totalCapacity: 100,
      },
      metadata: {
        createdBy: "usr-admin-pune",
        updatedBy: "usr-admin-pune",
        publishedBy: "usr-admin-pune",
        versionNotes: "Live operational layout for active shows",
        seatCountSummary: {
          standard: 80,
          vip: 20,
          recliner: 0,
          sofa: 0,
          wheelchair: 2,
          total: 100,
        },
      },
      publishedAt: "2026-11-10T00:00:00Z",
      createdAt: now,
      updatedAt: "2026-11-10T00:00:00Z",
    };

    // Active Draft Version 4 (being designed in Hall Designer without touching live v3 shows)
    const puneV4: LayoutVersion = {
      id: puneV4Id,
      layoutDefinitionId: puneDefId,
      theatreId: "th-pun-001",
      versionNumber: 4,
      name: "IMAX Laser Master (v4 Draft Redesign)",
      status: "DRAFT",
      versionNotes: "Draft redesign adding premium D-BOX motion seats in row C.",
      sections: JSON.parse(JSON.stringify(puneV3.sections)),
      seats: JSON.parse(JSON.stringify(puneV3.seats)),
      walkways: JSON.parse(JSON.stringify(puneV3.walkways)),
      vipZones: [...puneV3.vipZones],
      wheelchairAreas: [...puneV3.wheelchairAreas],
      emergencyExits: JSON.parse(JSON.stringify(puneV3.emergencyExits)),
      gridConfig: { ...puneV3.gridConfig },
      metadata: {
        createdBy: "usr-admin-pune",
        updatedBy: "usr-admin-pune",
        versionNotes: "Work in progress draft",
        seatCountSummary: { ...puneV3.metadata.seatCountSummary },
      },
      createdAt: "2026-11-14T00:00:00Z",
      updatedAt: "2026-11-14T00:00:00Z",
    };

    this.definitions.set(puneDefId, puneDef);
    this.versions.set(puneV2Id, puneV2);
    this.versions.set(puneV3Id, puneV3);
    this.versions.set(puneV4Id, puneV4);

    // 2. Theatre Canvas Preferences (Theatre A vs Theatre B vs Theatre C)
    // Theatre A: Pune (Grid 20px, 100% Zoom, Snap Enabled, Pixels)
    this.canvasPreferences.set("th-pun-001", {
      theatreId: "th-pun-001",
      gridSize: 20,
      gridDensity: "MEDIUM",
      gridVisible: true,
      gridColor: "#2A3445",
      gridOpacity: 50,
      snapEnabled: true,
      snapStrength: 8,
      defaultZoom: 100,
      measurementUnit: "PX",
      canvasWidth: 2400,
      canvasHeight: 1800,
      backgroundColor: "#070B12",
      showMiniMap: true,
      showSmartGuides: true,
      updatedAt: now,
    });

    // Theatre B: Mumbai (Grid 10px, 75% Zoom, Snap Disabled, Centimeters)
    this.canvasPreferences.set("th-mum-002", {
      theatreId: "th-mum-002",
      gridSize: 10,
      gridDensity: "SMALL",
      gridVisible: true,
      gridColor: "#1E293B",
      gridOpacity: 40,
      snapEnabled: false,
      snapStrength: 4,
      defaultZoom: 75,
      measurementUnit: "CM",
      canvasWidth: 2800,
      canvasHeight: 2000,
      backgroundColor: "#050507",
      showMiniMap: true,
      showSmartGuides: false,
      updatedAt: now,
    });

    // Theatre C: Dubai (Grid 25px, 125% Zoom, Snap Enabled, Feet)
    this.canvasPreferences.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      gridSize: 25,
      gridDensity: "LARGE",
      gridVisible: true,
      gridColor: "#334155",
      gridOpacity: 60,
      snapEnabled: true,
      snapStrength: 10,
      defaultZoom: 125,
      measurementUnit: "FT",
      canvasWidth: 3200,
      canvasHeight: 2400,
      backgroundColor: "#0A0D14",
      showMiniMap: true,
      showSmartGuides: true,
      updatedAt: now,
    });
  }

  /**
   * Reset repository to clean seed state (for testing).
   */
  public reset(): void {
    this.definitions.clear();
    this.versions.clear();
    this.canvasPreferences.clear();
    this.seedInitialData();
  }
}

export const hallDesignerRepository = HallDesignerRepository.getInstance();
