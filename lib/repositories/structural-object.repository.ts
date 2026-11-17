import {
  StructuralObject,
  StructuralObjectType,
  StructuralObjectVisibility,
  StructuralObjectMetadata,
  StructuralObjectGeometry,
} from "@/types/structural-objects.types";
import { NotFoundError, ConflictError } from "@/lib/errors";

/**
 * ==============================================================================
 * CineSphere OS — Structural Object Repository (Phase 4 – Part 7)
 * ==============================================================================
 * Multi-tenant repository managing physical hall infrastructure:
 * Screens, Stages, Entrances, Exits, Walls, Aisles, Stairs, Pillars, Balconies,
 * Control Rooms, and Accessible Paths.
 * ==============================================================================
 */

export class StructuralObjectRepository {
  private static objectsStore = new Map<string, StructuralObject>();
  private static isInitialized = false;

  public static initializeSeeds(): void {
    if (this.isInitialized) return;

    // --------------------------------------------------------------------------
    // 1. Seed Pune Galaxy Multiplex (th-pun-001)
    // --------------------------------------------------------------------------
    const puneObjects: StructuralObject[] = [
      {
        id: "str-pun-001",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Front Presentation Stage",
        displayName: "Main Stage",
        objectType: "STAGE",
        internalCode: "STR-STG-01",
        position: { x: 280, y: 90, z: 0 },
        width: 840,
        height: 50,
        rotation: 0,
        layer: 1,
        zIndex: 5,
        visibility: "VISIBLE",
        color: "#78350F",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: true,
          isReservedArea: false,
          notes: "Raised platform for cinema screen and live announcements",
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#92400E",
          fillColor: "#78350F",
          strokeWidth: 2,
          cornerRadius: 4,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-002",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Curved 4K Laser Screen",
        displayName: "Main Cinema Screen",
        objectType: "SCREEN",
        internalCode: "STR-SCR-01",
        position: { x: 300, y: 40, z: 0 },
        width: 800,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 10,
        visibility: "VISIBLE",
        color: "#0284C7",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: false,
          isReservedArea: false,
          notes: "Curved perforated acoustic projection surface",
        },
        geometry: {
          shape: "CURVED",
          strokeColor: "#38BDF8",
          fillColor: "#0284C7",
          strokeWidth: 3,
          arcProperties: {
            radius: 1200,
            startAngle: -20,
            endAngle: 20,
            sagitta: 15,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-003",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Emergency Exit West",
        displayName: "Exit West (Door 1)",
        objectType: "EMERGENCY_EXIT",
        internalCode: "STR-EMG-01",
        position: { x: 40, y: 180, z: 0 },
        width: 60,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 15,
        visibility: "VISIBLE",
        color: "#16A34A",
        isLocked: false,
        metadata: {
          isStatic: true,
          isCollisionObstacle: false,
          isReservedArea: true,
          safety: {
            fireRatingHours: 2,
            extinguisherNearby: true,
            emergencyLightingPresent: true,
          },
          emergencyRoute: {
            egressWidthMm: 1200,
            directionalArrow: "LEFT",
            leadsDirectlyToExit: true,
            exitCapacityPeoplePerMin: 120,
          },
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#22C55E",
          fillColor: "#16A34A",
          strokeWidth: 2,
          cornerRadius: 3,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-004",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Emergency Exit East",
        displayName: "Exit East (Door 2)",
        objectType: "EMERGENCY_EXIT",
        internalCode: "STR-EMG-02",
        position: { x: 1300, y: 180, z: 0 },
        width: 60,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 15,
        visibility: "VISIBLE",
        color: "#16A34A",
        isLocked: false,
        metadata: {
          isStatic: true,
          isCollisionObstacle: false,
          isReservedArea: true,
          safety: {
            fireRatingHours: 2,
            extinguisherNearby: true,
            emergencyLightingPresent: true,
          },
          emergencyRoute: {
            egressWidthMm: 1200,
            directionalArrow: "RIGHT",
            leadsDirectlyToExit: true,
            exitCapacityPeoplePerMin: 120,
          },
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#22C55E",
          fillColor: "#16A34A",
          strokeWidth: 2,
          cornerRadius: 3,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-005",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Grand Foyer Entrance",
        displayName: "Main Entrance",
        objectType: "ENTRANCE",
        internalCode: "STR-ENT-01",
        position: { x: 650, y: 850, z: 0 },
        width: 100,
        height: 35,
        rotation: 0,
        layer: 1,
        zIndex: 15,
        visibility: "VISIBLE",
        color: "#2563EB",
        isLocked: false,
        metadata: {
          isStatic: true,
          isCollisionObstacle: false,
          isReservedArea: true,
          accessibility: {
            hasRamp: true,
            clearanceWidthMm: 1800,
            tactilePaving: true,
          },
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#3B82F6",
          fillColor: "#2563EB",
          strokeWidth: 2,
          cornerRadius: 4,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-006",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Accessible Wheelchair Ramp",
        displayName: "ADA Route 1",
        objectType: "ACCESSIBLE_PATH",
        internalCode: "STR-PTH-01",
        position: { x: 120, y: 220, z: 0 },
        width: 70,
        height: 580,
        rotation: 0,
        layer: 1,
        zIndex: 3,
        visibility: "VISIBLE",
        color: "#6366F1",
        isLocked: false,
        metadata: {
          isStatic: false,
          isCollisionObstacle: false,
          isReservedArea: true,
          accessibility: {
            hasRamp: true,
            rampInclineDegrees: 4.8,
            tactilePaving: true,
            clearanceWidthMm: 1500,
            wheelchairTurningRadiusMm: 1600,
          },
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#818CF8",
          fillColor: "#4338CA",
          strokeWidth: 2,
          dashPattern: [6, 4],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-007",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "West Boundary Wall",
        displayName: "West Wall",
        objectType: "WALL",
        internalCode: "STR-WAL-01",
        position: { x: 20, y: 30, z: 0 },
        width: 16,
        height: 860,
        rotation: 0,
        layer: 1,
        zIndex: 1,
        visibility: "VISIBLE",
        color: "#475569",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: true,
          isReservedArea: false,
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#64748B",
          fillColor: "#475569",
          strokeWidth: 1,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-008",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "East Boundary Wall",
        displayName: "East Wall",
        objectType: "WALL",
        internalCode: "STR-WAL-02",
        position: { x: 1364, y: 30, z: 0 },
        width: 16,
        height: 860,
        rotation: 0,
        layer: 1,
        zIndex: 1,
        visibility: "VISIBLE",
        color: "#475569",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: true,
          isReservedArea: false,
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#64748B",
          fillColor: "#475569",
          strokeWidth: 1,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-009",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "Rear Support Pillar",
        displayName: "Acoustic Pillar A",
        objectType: "PILLAR",
        internalCode: "STR-PIL-01",
        position: { x: 900, y: 820, z: 0 },
        width: 32,
        height: 32,
        rotation: 0,
        layer: 1,
        zIndex: 20,
        visibility: "VISIBLE",
        color: "#94A3B8",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: true,
          isReservedArea: false,
        },
        geometry: {
          shape: "CIRCLE",
          strokeColor: "#CBD5E1",
          fillColor: "#94A3B8",
          strokeWidth: 2,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-pun-010",
        layoutVersionId: "ver-pune-screen1-v1",
        theatreId: "th-pun-001",
        objectName: "AV Booth & Projectionist Room",
        displayName: "Control Room",
        objectType: "CONTROL_ROOM",
        internalCode: "STR-CTL-01",
        position: { x: 620, y: 910, z: 0 },
        width: 160,
        height: 45,
        rotation: 0,
        layer: 2,
        zIndex: 10,
        visibility: "VISIBLE",
        color: "#334155",
        isLocked: true,
        metadata: {
          isStatic: true,
          isCollisionObstacle: true,
          isReservedArea: true,
          notes: "Sound console, lighting rig controls, and laser projection port",
        },
        geometry: {
          shape: "RECTANGLE",
          strokeColor: "#475569",
          fillColor: "#334155",
          strokeWidth: 2,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Duplicate seeds for Pune draft and published versions
    for (const obj of puneObjects) {
      this.objectsStore.set(obj.id, { ...obj });
      const draftObj: StructuralObject = {
        ...obj,
        id: `draft-${obj.id}`,
        layoutVersionId: "ver-pune-screen1-draft",
      };
      this.objectsStore.set(draftObj.id, draftObj);
      const v3Obj: StructuralObject = {
        ...obj,
        id: `v3-${obj.id}`,
        layoutVersionId: "ver-layout-pun-aud1-main-v3",
      };
      this.objectsStore.set(v3Obj.id, v3Obj);
      const v4Obj: StructuralObject = {
        ...obj,
        id: `v4-${obj.id}`,
        layoutVersionId: "ver-layout-pun-aud1-main-v4",
      };
      this.objectsStore.set(v4Obj.id, v4Obj);
    }

    // --------------------------------------------------------------------------
    // 2. Seed Mumbai IMAX (th-mum-002)
    // --------------------------------------------------------------------------
    const mumbaiObjects: StructuralObject[] = [
      {
        id: "str-mum-001",
        layoutVersionId: "ver-mum-imax-v1",
        theatreId: "th-mum-002",
        objectName: "IMAX Giant Screen",
        displayName: "IMAX Screen",
        objectType: "SCREEN",
        internalCode: "STR-SCR-02",
        position: { x: 250, y: 30, z: 0 },
        width: 900,
        height: 35,
        rotation: 0,
        layer: 1,
        zIndex: 10,
        visibility: "VISIBLE",
        color: "#0284C7",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
        geometry: { shape: "CURVED", strokeColor: "#38BDF8", fillColor: "#0284C7" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-mum-002",
        layoutVersionId: "ver-mum-imax-v1",
        theatreId: "th-mum-002",
        objectName: "Upper Balcony Railing",
        displayName: "Balcony Mezzanine",
        objectType: "BALCONY",
        internalCode: "STR-BAL-01",
        position: { x: 200, y: 700, z: 2 },
        width: 1000,
        height: 25,
        rotation: 0,
        layer: 2,
        zIndex: 8,
        visibility: "VISIBLE",
        color: "#A855F7",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: true, isReservedArea: false },
        geometry: { shape: "RECTANGLE", strokeColor: "#C084FC", fillColor: "#A855F7" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-mum-003",
        layoutVersionId: "ver-mum-imax-v1",
        theatreId: "th-mum-002",
        objectName: "Emergency Exit North",
        displayName: "Emergency Exit",
        objectType: "EMERGENCY_EXIT",
        internalCode: "STR-EMG-03",
        position: { x: 50, y: 150, z: 0 },
        width: 60,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 15,
        visibility: "VISIBLE",
        color: "#16A34A",
        isLocked: false,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
        geometry: { shape: "RECTANGLE" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-mum-004",
        layoutVersionId: "ver-mum-imax-v1",
        theatreId: "th-mum-002",
        objectName: "Stairway to Balcony",
        displayName: "Balcony Stairs",
        objectType: "STAIRS",
        internalCode: "STR-STR-01",
        position: { x: 1250, y: 650, z: 1 },
        width: 50,
        height: 120,
        rotation: 0,
        layer: 1,
        zIndex: 6,
        visibility: "VISIBLE",
        color: "#F59E0B",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: true, isReservedArea: false },
        geometry: { shape: "RECTANGLE" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const obj of mumbaiObjects) {
      this.objectsStore.set(obj.id, { ...obj });
    }

    // --------------------------------------------------------------------------
    // 3. Seed Dubai Grand Mall (th-dxb-003)
    // --------------------------------------------------------------------------
    const dubaiObjects: StructuralObject[] = [
      {
        id: "str-dxb-001",
        layoutVersionId: "ver-dxb-gold-v1",
        theatreId: "th-dxb-003",
        objectName: "Majlis Screen",
        displayName: "Majlis Screen",
        objectType: "SCREEN",
        internalCode: "STR-SCR-03",
        position: { x: 300, y: 40, z: 0 },
        width: 800,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 10,
        visibility: "VISIBLE",
        color: "#0284C7",
        isLocked: true,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: false },
        geometry: { shape: "RECTANGLE" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-dxb-002",
        layoutVersionId: "ver-dxb-gold-v1",
        theatreId: "th-dxb-003",
        objectName: "Royal Majlis Acoustic Divider",
        displayName: "Majlis Divider",
        objectType: "DIVIDER",
        internalCode: "STR-DIV-01",
        position: { x: 700, y: 300, z: 0 },
        width: 12,
        height: 400,
        rotation: 0,
        layer: 1,
        zIndex: 7,
        visibility: "VISIBLE",
        color: "#D97706",
        isLocked: false,
        metadata: { isStatic: true, isCollisionObstacle: true, isReservedArea: false },
        geometry: { shape: "RECTANGLE" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "str-dxb-003",
        layoutVersionId: "ver-dxb-gold-v1",
        theatreId: "th-dxb-003",
        objectName: "Dubai VIP Emergency Exit",
        displayName: "VIP Exit",
        objectType: "EMERGENCY_EXIT",
        internalCode: "STR-EMG-04",
        position: { x: 1280, y: 200, z: 0 },
        width: 60,
        height: 30,
        rotation: 0,
        layer: 1,
        zIndex: 15,
        visibility: "VISIBLE",
        color: "#16A34A",
        isLocked: false,
        metadata: { isStatic: true, isCollisionObstacle: false, isReservedArea: true },
        geometry: { shape: "RECTANGLE" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const obj of dubaiObjects) {
      this.objectsStore.set(obj.id, { ...obj });
    }

    this.isInitialized = true;
  }

  public async listByLayoutVersion(
    theatreId: string,
    layoutVersionId: string
  ): Promise<StructuralObject[]> {
    StructuralObjectRepository.initializeSeeds();
    const results: StructuralObject[] = [];

    for (const obj of StructuralObjectRepository.objectsStore.values()) {
      if (obj.theatreId === theatreId && obj.layoutVersionId === layoutVersionId) {
        results.push({ ...obj });
      }
    }

    return results.sort((a, b) => a.layer - b.layer || a.zIndex - b.zIndex);
  }

  public async getById(theatreId: string, id: string): Promise<StructuralObject | null> {
    StructuralObjectRepository.initializeSeeds();
    const obj = StructuralObjectRepository.objectsStore.get(id);
    if (!obj || obj.theatreId !== theatreId) {
      return null;
    }
    return { ...obj };
  }

  public async create(
    theatreId: string,
    data: Omit<StructuralObject, "id" | "theatreId" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<StructuralObject> {
    StructuralObjectRepository.initializeSeeds();

    // Check code uniqueness within layout version
    const existing = await this.listByLayoutVersion(theatreId, data.layoutVersionId);
    if (existing.some((o) => o.internalCode.toUpperCase() === data.internalCode.toUpperCase())) {
      throw new ConflictError(
        `Structural object with internal code '${data.internalCode}' already exists in this layout version.`
      );
    }

    const id = data.id || `str-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newObj: StructuralObject = {
      ...data,
      id,
      theatreId,
      createdAt: now,
      updatedAt: now,
    };

    StructuralObjectRepository.objectsStore.set(id, newObj);
    return { ...newObj };
  }

  public async update(
    theatreId: string,
    id: string,
    data: Partial<Omit<StructuralObject, "id" | "theatreId" | "layoutVersionId" | "createdAt">>
  ): Promise<StructuralObject> {
    StructuralObjectRepository.initializeSeeds();

    const existing = await this.getById(theatreId, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found for theatre '${theatreId}'.`);
    }

    // Check code uniqueness if code is modified
    if (data.internalCode && data.internalCode.toUpperCase() !== existing.internalCode.toUpperCase()) {
      const peers = await this.listByLayoutVersion(theatreId, existing.layoutVersionId);
      if (peers.some((p) => p.id !== id && p.internalCode.toUpperCase() === data.internalCode!.toUpperCase())) {
        throw new ConflictError(`Internal code '${data.internalCode}' is already taken by another structural object.`);
      }
    }

    const updated: StructuralObject = {
      ...existing,
      ...data,
      metadata: {
        ...existing.metadata,
        ...(data.metadata || {}),
      },
      geometry: {
        ...existing.geometry,
        ...(data.geometry || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    StructuralObjectRepository.objectsStore.set(id, updated);
    return { ...updated };
  }

  public async delete(theatreId: string, id: string): Promise<boolean> {
    StructuralObjectRepository.initializeSeeds();

    const existing = await this.getById(theatreId, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found for theatre '${theatreId}'.`);
    }

    return StructuralObjectRepository.objectsStore.delete(id);
  }

  public async duplicate(theatreId: string, id: string): Promise<StructuralObject> {
    StructuralObjectRepository.initializeSeeds();

    const source = await this.getById(theatreId, id);
    if (!source) {
      throw new NotFoundError(`Source structural object with ID '${id}' not found.`);
    }

    const newCode = `${source.internalCode}_COPY_${Date.now().toString().slice(-4)}`;
    const newName = `${source.objectName} (Copy)`;
    const newDisplayName = `${source.displayName} (Copy)`;

    return this.create(theatreId, {
      layoutVersionId: source.layoutVersionId,
      objectName: newName,
      displayName: newDisplayName,
      objectType: source.objectType,
      internalCode: newCode,
      position: {
        x: source.position.x + 30,
        y: source.position.y + 30,
        z: source.position.z,
      },
      width: source.width,
      height: source.height,
      rotation: source.rotation,
      layer: source.layer,
      zIndex: source.zIndex + 1,
      visibility: source.visibility,
      color: source.color,
      isLocked: false,
      metadata: { ...source.metadata },
      geometry: { ...source.geometry },
    });
  }

  public async reorder(
    theatreId: string,
    layoutVersionId: string,
    orderedIds: string[]
  ): Promise<StructuralObject[]> {
    StructuralObjectRepository.initializeSeeds();

    const objects = await this.listByLayoutVersion(theatreId, layoutVersionId);
    const objectMap = new Map(objects.map((o) => [o.id, o]));

    orderedIds.forEach((id, index) => {
      const obj = objectMap.get(id);
      if (obj) {
        obj.zIndex = (index + 1) * 5;
        obj.updatedAt = new Date().toISOString();
        StructuralObjectRepository.objectsStore.set(id, obj);
      }
    });

    return this.listByLayoutVersion(theatreId, layoutVersionId);
  }

  public async toggleLock(theatreId: string, id: string): Promise<StructuralObject> {
    const existing = await this.getById(theatreId, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    return this.update(theatreId, id, { isLocked: !existing.isLocked });
  }

  public async toggleVisibility(theatreId: string, id: string): Promise<StructuralObject> {
    const existing = await this.getById(theatreId, id);
    if (!existing) {
      throw new NotFoundError(`Structural object with ID '${id}' not found.`);
    }

    const nextVis: StructuralObjectVisibility = existing.visibility === "VISIBLE" ? "HIDDEN" : "VISIBLE";
    return this.update(theatreId, id, { visibility: nextVis });
  }

  public async clearForLayoutVersion(theatreId: string, layoutVersionId: string): Promise<void> {
    StructuralObjectRepository.initializeSeeds();

    const objects = await this.listByLayoutVersion(theatreId, layoutVersionId);
    for (const obj of objects) {
      StructuralObjectRepository.objectsStore.delete(obj.id);
    }
  }

  public async copyObjectsToVersion(
    theatreId: string,
    sourceVersionId: string,
    targetVersionId: string
  ): Promise<StructuralObject[]> {
    StructuralObjectRepository.initializeSeeds();
    const sourceObjs = await this.listByLayoutVersion(theatreId, sourceVersionId);
    const copied: StructuralObject[] = [];
    for (const obj of sourceObjs) {
      const newId = `str-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newObj: StructuralObject = {
        ...obj,
        id: newId,
        layoutVersionId: targetVersionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      StructuralObjectRepository.objectsStore.set(newId, newObj);
      copied.push(newObj);
    }
    return copied;
  }
}

export const structuralObjectRepository = new StructuralObjectRepository();
