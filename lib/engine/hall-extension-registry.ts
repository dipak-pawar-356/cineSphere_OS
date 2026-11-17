import {
  IHallDesignerExtension,
  ExtensionManifest,
  HallDesignerExtensionCategory,
  LayoutSceneGraph,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Plugin-Based Hall Extension Registry (Phase 4 – Part 16)
 * ==============================================================================
 * Decoupled plugin kernel where 3D, WebGL, Three.js, VR, AR, AI, Collaboration,
 * Digital Twin, CAD/BIM, IoT, and Enterprise Template modules register against
 * stable interfaces without tightly coupling to the Hall Designer Layout Core.
 * ==============================================================================
 */

export class HallExtensionRegistry {
  private static instance: HallExtensionRegistry | null = null;
  private extensions: Map<string, IHallDesignerExtension> = new Map();

  private constructor() {
    this.registerBuiltInArchitecturalAdapters();
  }

  public static getInstance(): HallExtensionRegistry {
    if (!HallExtensionRegistry.instance) {
      HallExtensionRegistry.instance = new HallExtensionRegistry();
    }
    return HallExtensionRegistry.instance;
  }

  public async register(extension: IHallDesignerExtension): Promise<ExtensionManifest> {
    const manifest = {
      ...extension.manifest,
      updatedAt: new Date().toISOString(),
    };
    this.extensions.set(manifest.key, { ...extension, manifest });
    if (extension.onRegister) {
      await extension.onRegister();
    }
    return manifest;
  }

  public getByKey(key: string): IHallDesignerExtension | undefined {
    return this.extensions.get(key);
  }

  public listManifests(category?: HallDesignerExtensionCategory): ExtensionManifest[] {
    return Array.from(this.extensions.values())
      .map((e) => e.manifest)
      .filter((m) => (category ? m.category === category : true));
  }

  public async notifySceneGraphCompiled(sceneGraph: LayoutSceneGraph): Promise<number> {
    let notifiedCount = 0;
    for (const ext of this.extensions.values()) {
      if (ext.manifest.status === "ACTIVE" || ext.manifest.status === "REGISTERED") {
        if (ext.onSceneGraphCompiled) {
          try {
            await ext.onSceneGraphCompiled(sceneGraph);
            notifiedCount++;
          } catch (err) {
            console.error(
              `[HallExtensionRegistry] Isolated error in extension '${ext.manifest.key}':`,
              err
            );
          }
        }
      }
    }
    return notifiedCount;
  }

  public async triggerLifecycleHook(
    key: string,
    hook: "onEnable" | "onDisable",
    theatreId: string
  ): Promise<void> {
    const ext = this.extensions.get(key);
    if (!ext) return;
    const fn = ext[hook];
    if (fn) {
      await fn(theatreId);
    }
  }

  /**
   * Registers the 12 core architectural extension adapters defined in the
   * Phase 4 – Part 16 Enterprise Hall Designer blueprint.
   */
  private registerBuiltInArchitecturalAdapters(): void {
    const now = "2026-11-18T00:00:00Z";
    const builtIns: ExtensionManifest[] = [
      {
        id: "ext-3d-engine",
        key: "cinesphere.3d.engine",
        name: "3D Spatial Hall Engine",
        version: "1.0.0",
        category: "3D_ENGINE",
        description: "Consumes LayoutSceneGraph to manage 3D camera rigs, stadium raking, and seat POV previews.",
        provider: "CineSphere Core",
        requiredFeatureKeys: ["THREE_D_PREVIEW"],
        supportedCapabilities: ["SCENE_GRAPH_CONSUMER", "SEAT_POV_CAMERA", "MULTI_FLOOR_ELEVATION"],
        status: "ACTIVE",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-webgl-renderer",
        key: "cinesphere.webgl.renderer",
        name: "WebGL2 / WebGPU Hardware Renderer Adapter",
        version: "1.0.0",
        category: "WEBGL_RENDERER",
        description: "Hardware-accelerated instanced seat rendering and LOD pipeline placeholder.",
        provider: "CineSphere Graphics",
        requiredFeatureKeys: ["THREE_D_PREVIEW", "WEBGL_HARDWARE_ACCELERATION"],
        supportedCapabilities: ["INSTANCED_MESHING", "LOD_PIPELINE", "PBR_SHADING"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-threejs-adapter",
        key: "cinesphere.threejs.adapter",
        name: "Three.js / React Three Fiber Scene Adapter",
        version: "1.0.0",
        category: "THREEJS_ADAPTER",
        description: "Translates LayoutSceneGraph nodes, lighting rigs, and animation hooks into Three.js objects.",
        provider: "CineSphere Graphics",
        requiredFeatureKeys: ["THREE_D_PREVIEW", "THREEJS_SCENE_EXPORT"],
        supportedCapabilities: ["GLTF_EXPORT_PLACEHOLDER", "ORBIT_CONTROLS", "PBR_MATERIALS"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-vr-engine",
        key: "cinesphere.vr.engine",
        name: "WebXR / VR Auditorium Preview Engine",
        version: "1.0.0",
        category: "VR_ENGINE",
        description: "Stereoscopic virtual reality seat walkthrough adapter for headsets.",
        provider: "CineSphere XR",
        requiredFeatureKeys: ["VR_PREVIEW"],
        supportedCapabilities: ["STEREO_CAMERA", "TELEPORT_SEAT_HOP"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-ar-engine",
        key: "cinesphere.ar.engine",
        name: "AR Architectural Overlay Engine",
        version: "1.0.0",
        category: "AR_ENGINE",
        description: "Augmented reality venue overlay placeholder for on-site cinema construction inspection.",
        provider: "CineSphere XR",
        requiredFeatureKeys: ["AR_PREVIEW"],
        supportedCapabilities: ["WORLD_ANCHOR_PLACEHOLDER", "MOBILE_AR_PREVIEW"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-ai-engine",
        key: "cinesphere.ai.layout-advisor",
        name: "AI Layout & Revenue Optimization Engine",
        version: "1.0.0",
        category: "AI_ENGINE",
        description: "Extension contract for AI-assisted seating density, ADA compliance, and RevPAS recommendations.",
        provider: "CineSphere Intelligence",
        requiredFeatureKeys: ["AI_LAYOUT_SUGGESTIONS"],
        supportedCapabilities: ["LAYOUT_SUGGESTIONS", "ACCESSIBILITY_OPTIMIZATION", "REVENUE_OPTIMIZATION"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-collab-engine",
        key: "cinesphere.collaboration.realtime",
        name: "Real-Time Collaborative Editing Engine",
        version: "1.0.0",
        category: "COLLABORATION_ENGINE",
        description: "Live presence, multi-cursor sharing, section locking, and CRDT version merge placeholder.",
        provider: "CineSphere Collab",
        requiredFeatureKeys: ["COLLABORATIVE_EDITING", "REALTIME_PRESENCE"],
        supportedCapabilities: ["LIVE_PRESENCE", "CURSOR_SHARING", "CONFLICT_RESOLUTION"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-digital-twin",
        key: "cinesphere.digital-twin.core",
        name: "Auditorium Digital Twin Telemetry Adapter",
        version: "1.0.0",
        category: "DIGITAL_TWIN",
        description: "Synchronizes live physical cinema state (HVAC, lighting, seat occupancy) onto LayoutSceneGraph nodes.",
        provider: "CineSphere IoT",
        requiredFeatureKeys: ["DIGITAL_TWIN_SYNC"],
        supportedCapabilities: ["LIVE_TELEMETRY_BINDING", "EVENT_STREAM_PLACEHOLDER"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-cad-import",
        key: "cinesphere.cad.importer",
        name: "CAD / DXF / SVG Blueprint Importer",
        version: "1.0.0",
        category: "CAD_IMPORT",
        description: "Ingests architectural DXF and SVG floorplans with unit conversion to canonical meters.",
        provider: "CineSphere CAD",
        requiredFeatureKeys: ["CAD_DXF_IMPORT"],
        supportedCapabilities: ["DXF_PLACEHOLDER", "SVG_PLACEHOLDER", "COORDINATE_CONVERSION"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-bim-adapter",
        key: "cinesphere.bim.ifc-adapter",
        name: "BIM / IFC Building Information Adapter",
        version: "1.0.0",
        category: "BIM_ADAPTER",
        description: "Enterprise BIM IFC schema integration placeholder for multi-level architectural complexes.",
        provider: "CineSphere CAD",
        requiredFeatureKeys: ["BIM_IFC_PLACEHOLDER", "MULTI_FLOOR_SUPPORT"],
        supportedCapabilities: ["IFC_METADATA_PLACEHOLDER", "STRUCTURAL_BIM_LAYERS"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-iot-sensors",
        key: "cinesphere.iot.seat-sensors",
        name: "IoT Seat & Environmental Sensor Hub",
        version: "1.0.0",
        category: "IOT_INTEGRATION",
        description: "Device registry and MQTT/WebSocket telemetry interfaces for pressure, occupancy, and CO2 sensors.",
        provider: "CineSphere IoT",
        requiredFeatureKeys: ["IOT_SEAT_SENSORS"],
        supportedCapabilities: ["SEAT_SENSORS", "OCCUPANCY_SENSORS", "ENVIRONMENTAL_SENSORS"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
      {
        id: "ext-ent-templates",
        key: "cinesphere.templates.enterprise-marketplace",
        name: "Enterprise Layout Template Exchange",
        version: "1.0.0",
        category: "ENTERPRISE_TEMPLATES",
        description: "Cross-region circuit template distribution and marketplace syndication placeholder.",
        provider: "CineSphere Platform",
        requiredFeatureKeys: ["ENTERPRISE_TEMPLATE_MARKETPLACE"],
        supportedCapabilities: ["MARKETPLACE_SYNDICATION", "CROSS_REGION_SYNC"],
        status: "REGISTERED",
        isBuiltInPlaceholder: true,
        configSchemaVersion: "1.0",
        registeredBy: "system",
        registeredAt: now,
        updatedAt: now,
      },
    ];

    for (const manifest of builtIns) {
      this.extensions.set(manifest.key, { manifest });
    }
  }
}

export const hallExtensionRegistry = HallExtensionRegistry.getInstance();
