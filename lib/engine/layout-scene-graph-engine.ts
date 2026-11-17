import { LayoutVersion } from "@/types/hall-designer.types";
import { StructuralObject } from "@/types/structural-objects.types";
import {
  LayoutSceneGraph,
  SceneGraphNode,
  FloorLevelDefinition,
  MaterialDefinition,
  CameraRigInterface,
  LightingRigInterface,
  LodPlaceholderConfig,
  AnimationHookDescriptor,
  BoundingBox3D,
  CadImportPlanPlaceholder,
  AiLayoutSuggestion,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Platform-Agnostic Scene Graph Engine (Phase 4 – Part 16)
 * ==============================================================================
 * Compiles any LayoutVersion + StructuralObjects into a single canonical,
 * renderer-agnostic Scene Graph (Layout Core). Both the existing 2D canvas and
 * future WebGL / Three.js / VR / AR engines consume this exact representation,
 * eliminating duplicate geometry or rendering logic.
 * ==============================================================================
 */

const PIXELS_PER_METER = 40;

export class LayoutSceneGraphEngine {
  /**
   * Default PBR Material Library shared across 2D and 3D renderers.
   */
  public static getDefaultMaterials(): MaterialDefinition[] {
    return [
      {
        id: "mat-seat-standard",
        name: "Cinema Plush Velvet (Standard)",
        shaderType: "FABRIC_VELVET",
        baseColorHex: "#2563EB",
        roughness: 0.85,
        metalness: 0.05,
        opacity: 1,
      },
      {
        id: "mat-seat-vip",
        name: "Crimson Luxury Leather (VIP)",
        shaderType: "PBR_STANDARD",
        baseColorHex: "#DC2626",
        roughness: 0.45,
        metalness: 0.15,
        opacity: 1,
      },
      {
        id: "mat-seat-recliner",
        name: "Imperial Gold Suede (Recliner)",
        shaderType: "FABRIC_VELVET",
        baseColorHex: "#D97706",
        roughness: 0.65,
        metalness: 0.1,
        opacity: 1,
      },
      {
        id: "mat-seat-wheelchair",
        name: "ADA Accessible High-Contrast Cyan",
        shaderType: "PBR_STANDARD",
        baseColorHex: "#06B6D4",
        roughness: 0.5,
        metalness: 0.2,
        opacity: 1,
      },
      {
        id: "mat-screen-surface",
        name: "Perforated DCI Cinema Screen",
        shaderType: "EMISSIVE_SCREEN",
        baseColorHex: "#F8FAFC",
        roughness: 0.9,
        metalness: 0.0,
        opacity: 1,
      },
      {
        id: "mat-structural-wall",
        name: "Acoustic Matte Charcoal Panel",
        shaderType: "LAMBERT",
        baseColorHex: "#1E293B",
        roughness: 0.95,
        metalness: 0.05,
        opacity: 1,
      },
      {
        id: "mat-emergency-exit",
        name: "Photoluminescent Safety Egress",
        shaderType: "PBR_STANDARD",
        baseColorHex: "#10B981",
        roughness: 0.4,
        metalness: 0.1,
        opacity: 1,
      },
    ];
  }

  /**
   * Compiles a LayoutVersion + StructuralObjects into a unified LayoutSceneGraph.
   * Supports multi-level halls (Main Floor, Balcony, Sky Box) via optional levels.
   */
  public static compileSceneGraph(params: {
    theatreId: string;
    hallId: string;
    layoutVersion: LayoutVersion;
    structuralObjects: StructuralObject[];
    multiLevelEnabled?: boolean;
    customLevels?: FloorLevelDefinition[];
    lodConfig?: LodPlaceholderConfig;
  }): LayoutSceneGraph {
    const { theatreId, hallId, layoutVersion, structuralObjects, multiLevelEnabled = false } = params;
    const now = new Date().toISOString();

    const materials = this.getDefaultMaterials();

    // 1. Construct Floor Levels (Main Orchestra + optional Balcony / Sky Box)
    const levels: FloorLevelDefinition[] =
      params.customLevels && params.customLevels.length > 0
        ? params.customLevels
        : this.deriveFloorLevels(layoutVersion, multiLevelEnabled);

    const sectionToLevelMap = new Map<string, FloorLevelDefinition>();
    for (const lvl of levels) {
      for (const secId of lvl.sectionIds) {
        sectionToLevelMap.set(secId, lvl);
      }
    }

    // 2. Build Root & Level Nodes
    const rootId = `node-root-${layoutVersion.id}`;
    const levelNodes = new Map<number, SceneGraphNode>();

    for (const lvl of levels) {
      levelNodes.set(lvl.levelIndex, {
        id: `node-level-${lvl.levelIndex}-${layoutVersion.id}`,
        parentId: rootId,
        type: lvl.levelType === "BALCONY" ? "BALCONY_LEVEL" : "FLOOR_LEVEL",
        label: lvl.name,
        floorLevelIndex: lvl.levelIndex,
        position: { x: 0, y: lvl.elevationMeters, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        metadata: {
          code: lvl.code,
          levelType: lvl.levelType,
          rakeAngleDegrees: lvl.rakeAngleDegrees,
          ceilingHeightMeters: lvl.ceilingHeightMeters,
          accessibleElevatorConnected: lvl.accessibleElevatorConnected,
        },
        children: [],
      });
    }

    // 3. Build Section Groups & Seat Mesh Nodes (with stadium rake elevation math)
    let seatMeshCount = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    const expandBounds = (x: number, y: number, z: number) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    };

    for (const sec of layoutVersion.sections) {
      const level = sectionToLevelMap.get(sec.id) || levels[0];
      const levelNode = levelNodes.get(level.levelIndex)!;
      const sectionNodeId = `node-sec-${sec.id}`;

      const sectionSeats = layoutVersion.seats.filter((s) => s.sectionId === sec.id);
      const seatNodes: SceneGraphNode[] = sectionSeats.map((seat) => {
        const xMeters = Number(((seat.coordinates?.x ?? seat.column * 40) / PIXELS_PER_METER).toFixed(3));
        const zMeters = Number(((seat.coordinates?.y ?? 100) / PIXELS_PER_METER).toFixed(3));

        // Stadium rake elevation: deeper Z rows elevate along rakeAngleDegrees
        const rakeRadians = (level.rakeAngleDegrees * Math.PI) / 180;
        const rowElevation = Number((level.elevationMeters + Math.max(0, zMeters - 2) * Math.tan(rakeRadians)).toFixed(3));

        expandBounds(xMeters, rowElevation, zMeters);
        seatMeshCount++;

        const materialId =
          seat.seatType === "VIP"
            ? "mat-seat-vip"
            : seat.seatType === "Recliner"
            ? "mat-seat-recliner"
            : seat.seatType === "Wheelchair" || seat.isAccessible
            ? "mat-seat-wheelchair"
            : "mat-seat-standard";

        // Sightline pitch angle toward screen center at (screenZ = 1.5m, screenCenterY = 4.0m)
        const distToScreen = Math.max(2, zMeters - 1.5);
        const verticalDelta = 4.0 - (rowElevation + 1.1);
        const sightlineAngleDegrees = Number(((Math.atan2(verticalDelta, distToScreen) * 180) / Math.PI).toFixed(2));

        return {
          id: `node-seat-${seat.id}`,
          parentId: sectionNodeId,
          type: "SEAT_MESH",
          label: seat.seatNumber || `${seat.row}${seat.column}`,
          floorLevelIndex: level.levelIndex,
          position: { x: xMeters, y: rowElevation, z: zMeters },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: seat.isActive,
          materialId,
          seatMesh: {
            seatId: seat.id,
            seatNumber: seat.seatNumber || `${seat.row}${seat.column}`,
            sectionId: sec.id,
            rowLabel: seat.row,
            seatType: seat.seatType,
            isAccessible: Boolean(seat.isAccessible || seat.seatType === "Wheelchair"),
            meshAssetKey: `mesh:seat:${seat.seatType.toLowerCase()}_v1`,
            materialId,
            dimensions: { x: 0.65, y: 1.05, z: 0.72 },
            sightlineAngleDegrees,
            elevationY: rowElevation,
          },
          children: [],
        };
      });

      levelNode.children.push({
        id: sectionNodeId,
        parentId: levelNode.id,
        type: "SECTION_GROUP",
        label: sec.name,
        floorLevelIndex: level.levelIndex,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        metadata: {
          sectionId: sec.id,
          displayColor: sec.displayColor,
          seatType: sec.seatType,
        },
        children: seatNodes,
      });
    }

    // 4. Add Structural Mesh Nodes (Screen, Exits, Walls, Stairs, Accessible Paths)
    let structuralMeshCount = 0;
    const groundNode = levelNodes.get(0)!;
    for (const obj of structuralObjects) {
      const xMeters = Number(((obj.position?.x ?? 0) / PIXELS_PER_METER).toFixed(3));
      const zMeters = Number(((obj.position?.y ?? 0) / PIXELS_PER_METER).toFixed(3));
      const yMeters = Number(((obj.position?.z ?? 0) / PIXELS_PER_METER).toFixed(3));
      const wMeters = Number(((obj.width || 80) / PIXELS_PER_METER).toFixed(3));
      const dMeters = Number(((obj.height || 20) / PIXELS_PER_METER).toFixed(3));
      const hMeters = obj.objectType === "SCREEN" ? 6.5 : obj.objectType === "WALL" ? 8.0 : 2.4;

      expandBounds(xMeters + wMeters, yMeters + hMeters, zMeters + dMeters);
      structuralMeshCount++;

      const materialId =
        obj.objectType === "SCREEN"
          ? "mat-screen-surface"
          : obj.objectType === "EMERGENCY_EXIT" || obj.objectType === "EXIT"
          ? "mat-emergency-exit"
          : "mat-structural-wall";

      groundNode.children.push({
        id: `node-struct-${obj.id}`,
        parentId: groundNode.id,
        type: obj.objectType === "SCREEN" ? "SCREEN_SURFACE" : "STRUCTURAL_MESH",
        label: obj.displayName || obj.objectName,
        floorLevelIndex: 0,
        position: { x: xMeters, y: yMeters, z: zMeters },
        rotation: { x: 0, y: obj.rotation || 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: obj.visibility === "VISIBLE",
        materialId,
        structuralMesh: {
          structuralObjectId: obj.id,
          objectType: obj.objectType,
          displayName: obj.displayName || obj.objectName,
          meshAssetKey: `mesh:struct:${obj.objectType.toLowerCase()}_v1`,
          materialId,
          dimensions: { x: wMeters, y: hMeters, z: dMeters },
          isCollisionObstacle: Boolean(obj.metadata?.isCollisionObstacle),
        },
        children: [],
      });
    }

    if (!Number.isFinite(minX)) {
      minX = 0; maxX = 20; minY = 0; maxY = 8; minZ = 0; maxZ = 20;
    }

    const bounds: BoundingBox3D = {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      width: Number(Math.max(1, maxX - minX).toFixed(2)),
      height: Number(Math.max(3, maxY - minY).toFixed(2)),
      depth: Number(Math.max(1, maxZ - minZ).toFixed(2)),
    };

    const centerX = Number(((bounds.min.x + bounds.max.x) / 2).toFixed(2));
    const centerZ = Number(((bounds.min.z + bounds.max.z) / 2).toFixed(2));

    // 5. Standard Camera Rigs (2D Orthographic Top-Down + 3D Orbit + Seat POV + VR Stereo)
    const cameras: CameraRigInterface[] = [
      {
        id: "cam-top-down-2d",
        name: "2D CAD Blueprint Orthographic",
        projection: "ORTHOGRAPHIC",
        fovDegrees: 0,
        nearPlane: 0.1,
        farPlane: 200,
        position: { x: centerX, y: 40, z: centerZ },
        target: { x: centerX, y: 0, z: centerZ },
        presetType: "TOP_DOWN_2D",
      },
      {
        id: "cam-orbit-3d",
        name: "3D Auditorium Orbit Overview",
        projection: "PERSPECTIVE",
        fovDegrees: 50,
        nearPlane: 0.1,
        farPlane: 250,
        position: { x: centerX, y: bounds.height + 6, z: bounds.max.z + 8 },
        target: { x: centerX, y: 2.5, z: bounds.min.z + 2 },
        presetType: "ORBIT_OVERVIEW",
      },
      {
        id: "cam-seat-pov",
        name: "Sweet-Spot Patron POV",
        projection: "PERSPECTIVE",
        fovDegrees: 62,
        nearPlane: 0.1,
        farPlane: 150,
        position: { x: centerX, y: 2.4, z: centerZ + bounds.depth * 0.15 },
        target: { x: centerX, y: 3.5, z: bounds.min.z },
        presetType: "SEAT_POV",
      },
      {
        id: "cam-vr-stereo",
        name: "WebXR / VR Stereo Rig",
        projection: "PERSPECTIVE",
        fovDegrees: 95,
        nearPlane: 0.05,
        farPlane: 150,
        position: { x: centerX, y: 2.4, z: centerZ },
        target: { x: centerX, y: 3.2, z: bounds.min.z },
        presetType: "VR_STEREO",
      },
    ];

    const lighting: LightingRigInterface = {
      id: `light-rig-${layoutVersion.id}`,
      ambientColorHex: "#1E293B",
      ambientIntensity: 0.45,
      screenEmissiveIntensity: 1.25,
      aisleStepLightsEnabled: true,
      shadowsEnabled: true,
      presetMode: "HOUSE_LIGHTS_UP",
    };

    const lodConfig: LodPlaceholderConfig = params.lodConfig || {
      enabled: true,
      highDetailDistanceMeters: 12,
      mediumDetailDistanceMeters: 28,
      lowDetailDistanceMeters: 50,
      instancedMeshThreshold: 80,
    };

    const animationHooks: AnimationHookDescriptor[] = [
      { hookId: "anim-seat-hover", trigger: "ON_SEAT_HOVER", durationMs: 180, easing: "SPRING" },
      { hookId: "anim-seat-select", trigger: "ON_SEAT_SELECT", durationMs: 240, easing: "EASE_IN_OUT" },
      { hookId: "anim-cam-flyto", trigger: "ON_CAMERA_FLYTO", durationMs: 650, easing: "EASE_IN_OUT" },
      { hookId: "anim-house-dim", trigger: "ON_SHOW_START_DIMMING", durationMs: 2400, easing: "LINEAR" },
    ];

    const root: SceneGraphNode = {
      id: rootId,
      parentId: null,
      type: "ROOT",
      label: `Scene Graph — ${layoutVersion.name}`,
      floorLevelIndex: 0,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      children: Array.from(levelNodes.values()),
    };

    const countNodes = (node: SceneGraphNode): number =>
      1 + node.children.reduce((acc, c) => acc + countNodes(c), 0);

    return {
      schemaVersion: "1.0",
      sceneId: `sg-${layoutVersion.id}-${Date.now().toString(36)}`,
      theatreId,
      hallId,
      layoutDefinitionId: layoutVersion.layoutDefinitionId,
      layoutVersionId: layoutVersion.id,
      layoutVersionNumber: layoutVersion.versionNumber,
      coordinateUnit: "METERS",
      bounds,
      levels,
      materials,
      cameras,
      lighting,
      lodConfig,
      animationHooks,
      root,
      stats: {
        totalNodes: countNodes(root),
        seatMeshCount,
        structuralMeshCount,
        floorLevelCount: levels.length,
      },
      compiledAt: now,
    };
  }

  /**
   * Derives single-floor or multi-level (Orchestra + Balcony) floor definitions.
   */
  private static deriveFloorLevels(
    layoutVersion: LayoutVersion,
    multiLevelEnabled: boolean
  ): FloorLevelDefinition[] {
    if (!multiLevelEnabled || layoutVersion.sections.length < 3) {
      return [
        {
          levelIndex: 0,
          code: "L0_ORCHESTRA",
          name: "Main Auditorium Floor",
          levelType: "MAIN_FLOOR",
          elevationMeters: 0,
          ceilingHeightMeters: 9.5,
          rakeAngleDegrees: 11,
          accessibleElevatorConnected: true,
          sectionIds: layoutVersion.sections.map((s) => s.id),
        },
      ];
    }

    const sortedSections = [...layoutVersion.sections].sort((a, b) => a.displayOrder - b.displayOrder);
    const mainFloorSections = sortedSections.slice(0, -1).map((s) => s.id);
    const balconySections = sortedSections.slice(-1).map((s) => s.id);

    return [
      {
        levelIndex: 0,
        code: "L0_ORCHESTRA",
        name: "Lower Orchestra Floor",
        levelType: "MAIN_FLOOR",
        elevationMeters: 0,
        ceilingHeightMeters: 5.2,
        rakeAngleDegrees: 10,
        accessibleElevatorConnected: true,
        sectionIds: mainFloorSections,
      },
      {
        levelIndex: 1,
        code: "L1_BALCONY",
        name: "Upper VIP Balcony Tier",
        levelType: "BALCONY",
        elevationMeters: 4.8,
        ceilingHeightMeters: 4.5,
        rakeAngleDegrees: 15,
        accessibleElevatorConnected: true,
        sectionIds: balconySections,
      },
    ];
  }

  /**
   * CAD / DXF / SVG / BIM Coordinate Conversion Placeholder Utility
   */
  public static createCadImportPlanPlaceholder(params: {
    theatreId: string;
    sourceFormat: CadImportPlanPlaceholder["sourceFormat"];
    sourceUnit: CadImportPlanPlaceholder["sourceUnit"];
    detectedLayers?: string[];
  }): CadImportPlanPlaceholder {
    const scaleToMeters: Record<CadImportPlanPlaceholder["sourceUnit"], number> = {
      MM: 0.001,
      CM: 0.01,
      FT: 0.3048,
      M: 1.0,
      PX: 1 / PIXELS_PER_METER,
    };

    return {
      importId: `cad-plan-${Date.now().toString(36)}`,
      theatreId: params.theatreId,
      sourceFormat: params.sourceFormat,
      sourceUnit: params.sourceUnit,
      targetUnit: "METERS",
      scaleFactor: scaleToMeters[params.sourceUnit],
      detectedLayers: params.detectedLayers || ["A-SEATS", "A-WALLS", "A-SCREEN", "A-EGRESS"],
      status: "READY_FOR_CONVERSION",
    };
  }

  /**
   * AI Layout Advisor Architectural Placeholder analyzing Scene Graph geometry.
   */
  public static generateAiSuggestionsPlaceholder(sceneGraph: LayoutSceneGraph): AiLayoutSuggestion[] {
    const suggestions: AiLayoutSuggestion[] = [];

    if (sceneGraph.stats.floorLevelCount === 1 && sceneGraph.stats.seatMeshCount >= 120) {
      suggestions.push({
        suggestionId: `ai-sug-balcony-${sceneGraph.layoutVersionNumber}`,
        domain: "LAYOUT",
        confidenceScore: 0.84,
        title: "Evaluate Upper Balcony Tier Expansion",
        rationale: `Hall contains ${sceneGraph.stats.seatMeshCount} single-level seats. Introducing an L1 Balcony at 4.8m elevation can increase VIP sightline comfort and capacity.`,
        proposedActionPlaceholder: { targetLevel: "L1_BALCONY", suggestedElevationMeters: 4.8 },
      });
    }

    suggestions.push({
      suggestionId: `ai-sug-sightline-${sceneGraph.layoutVersionNumber}`,
      domain: "SEAT_DENSITY",
      confidenceScore: 0.91,
      title: "Optimal Rake Angle Sightline Calibration",
      rationale: `Scene Graph bounds (${sceneGraph.bounds.width}m × ${sceneGraph.bounds.depth}m) align with THX viewing angle envelope under 11°–14° stadium raking.`,
      proposedActionPlaceholder: { recommendedRakeDegrees: 12.5 },
    });

    return suggestions;
  }
}
