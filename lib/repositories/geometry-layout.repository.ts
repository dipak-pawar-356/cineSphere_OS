import {
  GeometrySettings,
  GeometryTransformCommand,
} from "@/types/geometry-layout.types";

/**
 * ==============================================================================
 * CineSphere OS — Geometry & Advanced Layout Repository (Phase 4 – Part 8)
 * ==============================================================================
 * Manages persistence for theatre-specific geometry settings, transformation
 * pipeline execution history, and custom parametric geometry definitions.
 * ==============================================================================
 */

export class GeometryLayoutRepository {
  private static settingsStore = new Map<string, GeometrySettings>();
  private static transformsStore = new Map<string, GeometryTransformCommand>();
  private static isInitialized = false;

  public static initializeSeeds(): void {
    if (this.isInitialized) return;

    // 1. Pune Galaxy Multiplex (th-pun-001): Curved VIP Section, Arc Rows, Symmetry Disabled
    this.settingsStore.set("th-pun-001", {
      id: "geom-set-pun",
      theatreId: "th-pun-001",
      allowCurvedVIP: true,
      allowArcRows: true,
      allowPolygonSections: true,
      enableOffset: true,
      enableSymmetry: false,
      defaultCurveRadius: 800,
      defaultArcAngle: 40,
      gridSnapTolerance: 10,
      angleSnapDegrees: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 2. Mumbai IMAX (th-mum-002): Straight Layout, Polygon Sections, Offset Enabled
    this.settingsStore.set("th-mum-002", {
      id: "geom-set-mum",
      theatreId: "th-mum-002",
      allowCurvedVIP: false,
      allowArcRows: false,
      allowPolygonSections: true,
      enableOffset: true,
      enableSymmetry: true,
      defaultCurveRadius: 600,
      defaultArcAngle: 30,
      gridSnapTolerance: 10,
      angleSnapDegrees: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Dubai Grand Mall (th-dxb-003): Premium Curved Balcony, Custom Shapes, Symmetry Enabled
    this.settingsStore.set("th-dxb-003", {
      id: "geom-set-dxb",
      theatreId: "th-dxb-003",
      allowCurvedVIP: true,
      allowArcRows: true,
      allowPolygonSections: true,
      enableOffset: true,
      enableSymmetry: true,
      defaultCurveRadius: 1000,
      defaultArcAngle: 50,
      gridSnapTolerance: 10,
      angleSnapDegrees: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.isInitialized = true;
  }

  public async getSettings(theatreId: string): Promise<GeometrySettings> {
    GeometryLayoutRepository.initializeSeeds();

    const existing = GeometryLayoutRepository.settingsStore.get(theatreId);
    if (existing) {
      return { ...existing };
    }

    // Default configuration for new theatres
    const defaultSettings: GeometrySettings = {
      id: `geom-set-${theatreId}`,
      theatreId,
      allowCurvedVIP: true,
      allowArcRows: true,
      allowPolygonSections: true,
      enableOffset: true,
      enableSymmetry: true,
      defaultCurveRadius: 700,
      defaultArcAngle: 45,
      gridSnapTolerance: 10,
      angleSnapDegrees: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    GeometryLayoutRepository.settingsStore.set(theatreId, defaultSettings);
    return { ...defaultSettings };
  }

  public async saveSettings(
    theatreId: string,
    settings: Partial<Omit<GeometrySettings, "id" | "theatreId" | "createdAt">>
  ): Promise<GeometrySettings> {
    const current = await this.getSettings(theatreId);

    const updated: GeometrySettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    GeometryLayoutRepository.settingsStore.set(theatreId, updated);
    return { ...updated };
  }

  public async recordTransform(command: GeometryTransformCommand): Promise<GeometryTransformCommand> {
    GeometryLayoutRepository.initializeSeeds();

    const record: GeometryTransformCommand = {
      ...command,
      id: command.id || `trans-${crypto.randomUUID()}`,
      timestamp: command.timestamp || new Date().toISOString(),
    };

    GeometryLayoutRepository.transformsStore.set(record.id, record);
    return { ...record };
  }

  public async listTransformsByVersion(
    theatreId: string,
    layoutVersionId: string
  ): Promise<GeometryTransformCommand[]> {
    GeometryLayoutRepository.initializeSeeds();

    const results: GeometryTransformCommand[] = [];
    for (const cmd of GeometryLayoutRepository.transformsStore.values()) {
      if (cmd.theatreId === theatreId && cmd.layoutVersionId === layoutVersionId) {
        results.push({ ...cmd });
      }
    }

    return results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public async getTransform(theatreId: string, id: string): Promise<GeometryTransformCommand | null> {
    GeometryLayoutRepository.initializeSeeds();

    const cmd = GeometryLayoutRepository.transformsStore.get(id);
    if (!cmd || cmd.theatreId !== theatreId) return null;
    return { ...cmd };
  }
}

export const geometryLayoutRepository = new GeometryLayoutRepository();
