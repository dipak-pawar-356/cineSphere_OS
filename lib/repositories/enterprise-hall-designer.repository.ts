import {
  EnterpriseFeatureDefinition,
  EnterpriseFeatureKey,
  EnterpriseHallConfiguration,
  ThreeDConfigurationRecord,
  CollaborationConfigurationRecord,
  IoTDeviceDescriptor,
} from "@/types/enterprise-hall-designer.types";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Repository (Phase 4 – Part 16)
 * ==============================================================================
 * Multi-tenant persistence store for Enterprise Feature Catalog, per-theatre
 * capability configurations, 3D WebGL/Three.js configs, Collaboration settings,
 * and IoT/Digital Twin device registry placeholders.
 * ==============================================================================
 */

export class EnterpriseHallDesignerRepository {
  private static instance: EnterpriseHallDesignerRepository | null = null;

  private features: Map<EnterpriseFeatureKey, EnterpriseFeatureDefinition> = new Map();
  private configurations: Map<string, EnterpriseHallConfiguration> = new Map(); // Key: theatreId
  private iotDevices: Map<string, IoTDeviceDescriptor[]> = new Map(); // Key: theatreId

  private constructor() {
    this.seedInitialData();
  }

  public static getInstance(): EnterpriseHallDesignerRepository {
    if (!EnterpriseHallDesignerRepository.instance) {
      EnterpriseHallDesignerRepository.instance = new EnterpriseHallDesignerRepository();
    }
    return EnterpriseHallDesignerRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Platform Enterprise Feature Catalog
  // ----------------------------------------------------------------------------

  public listFeatures(): EnterpriseFeatureDefinition[] {
    return Array.from(this.features.values());
  }

  public getFeature(featureKey: EnterpriseFeatureKey): EnterpriseFeatureDefinition | undefined {
    return this.features.get(featureKey);
  }

  // ----------------------------------------------------------------------------
  // 2. Per-Theatre Enterprise Configurations
  // ----------------------------------------------------------------------------

  public getConfiguration(theatreId: string): EnterpriseHallConfiguration {
    const existing = this.configurations.get(theatreId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const defaultEnabledFeatures = this.buildDefaultFeatureMap();

    const fallback: EnterpriseHallConfiguration = {
      theatreId,
      enabledFeatures: defaultEnabledFeatures,
      multiLevelConfig: {
        enabled: false,
        maxSupportedFloors: 1,
        balconyDesignEnabled: false,
        skyBoxDesignEnabled: false,
        vipLoungeDesignEnabled: false,
      },
      performanceConfig: {
        gpuRenderingReady: true,
        backgroundWorkerPoolPlaceholder: true,
        streamingAssetsEnabled: true,
        incrementalLoadingEnabled: true,
        sceneGraphCacheTtlSeconds: 300,
      },
      threeDConfig: {
        theatreId,
        renderingBackend: "WEBGL2",
        defaultCameraPreset: "ORBIT_OVERVIEW",
        shadowsEnabled: true,
        antiAliasingEnabled: true,
        maxTargetFps: 60,
        lodConfig: {
          enabled: true,
          highDetailDistanceMeters: 12,
          mediumDetailDistanceMeters: 28,
          lowDetailDistanceMeters: 50,
          instancedMeshThreshold: 80,
        },
        streamingAssetsEnabled: true,
        updatedAt: now,
      },
      collaborationConfig: {
        theatreId,
        enabled: false,
        livePresenceEnabled: true,
        cursorSharingEnabled: true,
        maxConcurrentEditors: 8,
        conflictStrategy: "CRDT_MERGE_PLACEHOLDER",
        presenceTransportPlaceholder: "WEBSOCKET_CLUSTER",
        autoVersionMergePlaceholder: false,
        updatedAt: now,
      },
      updatedAt: now,
    };

    this.configurations.set(theatreId, fallback);
    return fallback;
  }

  public setFeatureEnabled(
    theatreId: string,
    featureKey: EnterpriseFeatureKey,
    enabled: boolean
  ): EnterpriseHallConfiguration {
    const config = this.getConfiguration(theatreId);
    const now = new Date().toISOString();
    const updated: EnterpriseHallConfiguration = {
      ...config,
      enabledFeatures: {
        ...config.enabledFeatures,
        [featureKey]: enabled,
      },
      multiLevelConfig:
        featureKey === "MULTI_FLOOR_SUPPORT"
          ? {
              ...config.multiLevelConfig,
              enabled,
              maxSupportedFloors: enabled ? Math.max(2, config.multiLevelConfig.maxSupportedFloors) : 1,
              balconyDesignEnabled: enabled,
            }
          : config.multiLevelConfig,
      collaborationConfig:
        featureKey === "COLLABORATIVE_EDITING"
          ? {
              ...config.collaborationConfig,
              enabled,
              updatedAt: now,
            }
          : config.collaborationConfig,
      updatedAt: now,
    };
    this.configurations.set(theatreId, updated);
    return updated;
  }

  public updateThreeDConfig(
    theatreId: string,
    updates: Partial<ThreeDConfigurationRecord>
  ): ThreeDConfigurationRecord {
    const config = this.getConfiguration(theatreId);
    const now = new Date().toISOString();
    const updated3D: ThreeDConfigurationRecord = {
      ...config.threeDConfig,
      ...updates,
      theatreId,
      lodConfig: updates.lodConfig
        ? { ...config.threeDConfig.lodConfig, ...updates.lodConfig }
        : config.threeDConfig.lodConfig,
      updatedAt: now,
    };
    config.threeDConfig = updated3D;
    config.updatedAt = now;
    this.configurations.set(theatreId, config);
    return updated3D;
  }

  public updateCollaborationConfig(
    theatreId: string,
    updates: Partial<CollaborationConfigurationRecord>
  ): CollaborationConfigurationRecord {
    const config = this.getConfiguration(theatreId);
    const now = new Date().toISOString();
    const updatedCollab: CollaborationConfigurationRecord = {
      ...config.collaborationConfig,
      ...updates,
      theatreId,
      updatedAt: now,
    };
    config.collaborationConfig = updatedCollab;
    config.enabledFeatures.COLLABORATIVE_EDITING = updatedCollab.enabled;
    config.updatedAt = now;
    this.configurations.set(theatreId, config);
    return updatedCollab;
  }

  // ----------------------------------------------------------------------------
  // 3. IoT & Digital Twin Device Registry Placeholder
  // ----------------------------------------------------------------------------

  public listIoTDevices(theatreId: string, hallId?: string): IoTDeviceDescriptor[] {
    const list = this.iotDevices.get(theatreId) || [];
    return hallId ? list.filter((d) => d.hallId === hallId) : list;
  }

  public registerIoTDevice(device: IoTDeviceDescriptor): IoTDeviceDescriptor {
    const list = this.iotDevices.get(device.theatreId) || [];
    list.push(device);
    this.iotDevices.set(device.theatreId, list);
    return device;
  }

  // ----------------------------------------------------------------------------
  // Seed Data
  // ----------------------------------------------------------------------------

  private buildDefaultFeatureMap(
    overrides: Partial<Record<EnterpriseFeatureKey, boolean>> = {}
  ): Record<EnterpriseFeatureKey, boolean> {
    return {
      THREE_D_PREVIEW: false,
      WEBGL_HARDWARE_ACCELERATION: false,
      THREEJS_SCENE_EXPORT: false,
      VR_PREVIEW: false,
      AR_PREVIEW: false,
      AI_LAYOUT_SUGGESTIONS: false,
      COLLABORATIVE_EDITING: false,
      REALTIME_PRESENCE: false,
      MULTI_FLOOR_SUPPORT: false,
      DIGITAL_TWIN_SYNC: false,
      CAD_DXF_IMPORT: false,
      BIM_IFC_PLACEHOLDER: false,
      IOT_SEAT_SENSORS: false,
      ENTERPRISE_TEMPLATE_MARKETPLACE: false,
      ...overrides,
    };
  }

  private seedInitialData(): void {
    const now = "2026-11-18T00:00:00Z";

    const featureList: EnterpriseFeatureDefinition[] = [
      {
        id: "feat-3d-preview",
        featureKey: "THREE_D_PREVIEW",
        displayName: "3D Spatial Hall Preview",
        category: "3D_ENGINE",
        description: "Interactive 3D auditorium visualization consuming LayoutSceneGraph.",
        maturityStage: "FOUNDATION_READY",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-webgl",
        featureKey: "WEBGL_HARDWARE_ACCELERATION",
        displayName: "WebGL2 / WebGPU Hardware Acceleration",
        category: "WEBGL_RENDERER",
        description: "GPU instanced seat mesh rendering with automatic LOD.",
        maturityStage: "FOUNDATION_READY",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-threejs",
        featureKey: "THREEJS_SCENE_EXPORT",
        displayName: "Three.js Scene Adapter",
        category: "THREEJS_ADAPTER",
        description: "Three.js / React Three Fiber compatible scene graph export.",
        maturityStage: "FOUNDATION_READY",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-vr",
        featureKey: "VR_PREVIEW",
        displayName: "VR Headset Preview",
        category: "VR_ENGINE",
        description: "Stereoscopic WebXR patron seat sightline walkthrough.",
        maturityStage: "BETA_PLACEHOLDER",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-ar",
        featureKey: "AR_PREVIEW",
        displayName: "AR Architectural Overlay",
        category: "AR_ENGINE",
        description: "Augmented reality venue floorplan projection.",
        maturityStage: "FUTURE_ROADMAP",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-ai",
        featureKey: "AI_LAYOUT_SUGGESTIONS",
        displayName: "AI Layout & Revenue Suggestions",
        category: "AI_ENGINE",
        description: "Automated seating density, sightline, and yield optimization hooks.",
        maturityStage: "BETA_PLACEHOLDER",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-collab",
        featureKey: "COLLABORATIVE_EDITING",
        displayName: "Real-Time Collaborative Editing",
        category: "COLLABORATION_ENGINE",
        description: "Multi-architect live editing with conflict resolution placeholders.",
        maturityStage: "BETA_PLACEHOLDER",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-presence",
        featureKey: "REALTIME_PRESENCE",
        displayName: "Live Presence & Cursor Sharing",
        category: "COLLABORATION_ENGINE",
        description: "Shows active editors, cursors, and floor levels in real time.",
        maturityStage: "BETA_PLACEHOLDER",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-multifloor",
        featureKey: "MULTI_FLOOR_SUPPORT",
        displayName: "Multi-Floor, Balcony & Sky Box Architecture",
        category: "3D_ENGINE",
        description: "Multi-level auditorium floors, balconies, VIP lounges, and elevator anchors.",
        maturityStage: "FOUNDATION_READY",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-digital-twin",
        featureKey: "DIGITAL_TWIN_SYNC",
        displayName: "Auditorium Digital Twin",
        category: "DIGITAL_TWIN",
        description: "Live telemetry synchronization between physical halls and LayoutSceneGraph.",
        maturityStage: "FUTURE_ROADMAP",
        requiresGpuAcceleration: true,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-cad",
        featureKey: "CAD_DXF_IMPORT",
        displayName: "CAD / DXF / SVG Floorplan Import",
        category: "CAD_IMPORT",
        description: "Architectural CAD ingestion and unit scaling pipeline.",
        maturityStage: "BETA_PLACEHOLDER",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-bim",
        featureKey: "BIM_IFC_PLACEHOLDER",
        displayName: "BIM / IFC Integration Placeholder",
        category: "BIM_ADAPTER",
        description: "Enterprise building information modeling schema hook.",
        maturityStage: "FUTURE_ROADMAP",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-iot",
        featureKey: "IOT_SEAT_SENSORS",
        displayName: "IoT Seat & Environmental Sensors",
        category: "IOT_INTEGRATION",
        description: "Live pressure, occupancy, HVAC CO2, and acoustic telemetry adapters.",
        maturityStage: "FUTURE_ROADMAP",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
      {
        id: "feat-ent-tpl",
        featureKey: "ENTERPRISE_TEMPLATE_MARKETPLACE",
        displayName: "Enterprise Layout Template Exchange",
        category: "ENTERPRISE_TEMPLATES",
        description: "Cross-region circuit blueprint sharing and marketplace syndication.",
        maturityStage: "FUTURE_ROADMAP",
        requiresGpuAcceleration: false,
        defaultEnabled: false,
        createdAt: now,
      },
    ];

    for (const f of featureList) {
      this.features.set(f.featureKey, f);
    }

    // Theatre A (Pune — th-pun-001): 3D Preview ENABLED, AI Suggestions DISABLED
    this.configurations.set("th-pun-001", {
      theatreId: "th-pun-001",
      enabledFeatures: this.buildDefaultFeatureMap({
        THREE_D_PREVIEW: true,
        WEBGL_HARDWARE_ACCELERATION: true,
        THREEJS_SCENE_EXPORT: true,
        AI_LAYOUT_SUGGESTIONS: false,
      }),
      multiLevelConfig: {
        enabled: false,
        maxSupportedFloors: 1,
        balconyDesignEnabled: false,
        skyBoxDesignEnabled: false,
        vipLoungeDesignEnabled: true,
      },
      performanceConfig: {
        gpuRenderingReady: true,
        backgroundWorkerPoolPlaceholder: true,
        streamingAssetsEnabled: true,
        incrementalLoadingEnabled: true,
        sceneGraphCacheTtlSeconds: 300,
      },
      threeDConfig: {
        theatreId: "th-pun-001",
        renderingBackend: "WEBGL2",
        defaultCameraPreset: "ORBIT_OVERVIEW",
        shadowsEnabled: true,
        antiAliasingEnabled: true,
        maxTargetFps: 60,
        lodConfig: {
          enabled: true,
          highDetailDistanceMeters: 12,
          mediumDetailDistanceMeters: 28,
          lowDetailDistanceMeters: 50,
          instancedMeshThreshold: 80,
        },
        streamingAssetsEnabled: true,
        updatedAt: now,
      },
      collaborationConfig: {
        theatreId: "th-pun-001",
        enabled: false,
        livePresenceEnabled: false,
        cursorSharingEnabled: false,
        maxConcurrentEditors: 4,
        conflictStrategy: "OPTIMISTIC_LOCK",
        presenceTransportPlaceholder: "WEBSOCKET_CLUSTER",
        autoVersionMergePlaceholder: false,
        updatedAt: now,
      },
      updatedAt: now,
    });

    // Theatre B (Mumbai — th-mum-002): VR Preview ENABLED, Collaborative Editing ENABLED
    this.configurations.set("th-mum-002", {
      theatreId: "th-mum-002",
      enabledFeatures: this.buildDefaultFeatureMap({
        THREE_D_PREVIEW: true,
        VR_PREVIEW: true,
        COLLABORATIVE_EDITING: true,
        REALTIME_PRESENCE: true,
      }),
      multiLevelConfig: {
        enabled: true,
        maxSupportedFloors: 2,
        balconyDesignEnabled: true,
        skyBoxDesignEnabled: false,
        vipLoungeDesignEnabled: true,
      },
      performanceConfig: {
        gpuRenderingReady: true,
        backgroundWorkerPoolPlaceholder: true,
        streamingAssetsEnabled: true,
        incrementalLoadingEnabled: true,
        sceneGraphCacheTtlSeconds: 240,
      },
      threeDConfig: {
        theatreId: "th-mum-002",
        renderingBackend: "WEBGL2",
        defaultCameraPreset: "VR_STEREO",
        shadowsEnabled: true,
        antiAliasingEnabled: true,
        maxTargetFps: 90,
        lodConfig: {
          enabled: true,
          highDetailDistanceMeters: 15,
          mediumDetailDistanceMeters: 30,
          lowDetailDistanceMeters: 60,
          instancedMeshThreshold: 60,
        },
        streamingAssetsEnabled: true,
        updatedAt: now,
      },
      collaborationConfig: {
        theatreId: "th-mum-002",
        enabled: true,
        livePresenceEnabled: true,
        cursorSharingEnabled: true,
        maxConcurrentEditors: 12,
        conflictStrategy: "CRDT_MERGE_PLACEHOLDER",
        presenceTransportPlaceholder: "WEBSOCKET_CLUSTER",
        autoVersionMergePlaceholder: true,
        updatedAt: now,
      },
      updatedAt: now,
    });

    // Theatre C (Dubai — th-dxb-003): Multi-Floor Support ENABLED, IoT Ready ENABLED, Digital Twin ENABLED
    this.configurations.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      enabledFeatures: this.buildDefaultFeatureMap({
        THREE_D_PREVIEW: true,
        WEBGL_HARDWARE_ACCELERATION: true,
        THREEJS_SCENE_EXPORT: true,
        MULTI_FLOOR_SUPPORT: true,
        IOT_SEAT_SENSORS: true,
        DIGITAL_TWIN_SYNC: true,
        AI_LAYOUT_SUGGESTIONS: true,
        CAD_DXF_IMPORT: true,
        BIM_IFC_PLACEHOLDER: true,
      }),
      multiLevelConfig: {
        enabled: true,
        maxSupportedFloors: 4,
        balconyDesignEnabled: true,
        skyBoxDesignEnabled: true,
        vipLoungeDesignEnabled: true,
      },
      performanceConfig: {
        gpuRenderingReady: true,
        backgroundWorkerPoolPlaceholder: true,
        streamingAssetsEnabled: true,
        incrementalLoadingEnabled: true,
        sceneGraphCacheTtlSeconds: 120,
      },
      threeDConfig: {
        theatreId: "th-dxb-003",
        renderingBackend: "WEBGPU_PLACEHOLDER",
        defaultCameraPreset: "SEAT_POV",
        shadowsEnabled: true,
        antiAliasingEnabled: true,
        maxTargetFps: 120,
        lodConfig: {
          enabled: true,
          highDetailDistanceMeters: 20,
          mediumDetailDistanceMeters: 40,
          lowDetailDistanceMeters: 80,
          instancedMeshThreshold: 100,
        },
        streamingAssetsEnabled: true,
        assetCdnBaseUrlPlaceholder: "https://cdn.cinesphere.example/3d-assets/dxb",
        updatedAt: now,
      },
      collaborationConfig: {
        theatreId: "th-dxb-003",
        enabled: true,
        livePresenceEnabled: true,
        cursorSharingEnabled: true,
        maxConcurrentEditors: 16,
        conflictStrategy: "CRDT_MERGE_PLACEHOLDER",
        presenceTransportPlaceholder: "WEBRTC_MESH",
        autoVersionMergePlaceholder: true,
        updatedAt: now,
      },
      updatedAt: now,
    });

    // Seed Dubai IoT device placeholders
    this.iotDevices.set("th-dxb-003", [
      {
        deviceId: "iot-dxb-co2-01",
        theatreId: "th-dxb-003",
        hallId: "hall-dxb-aud1",
        deviceType: "CO2_HVAC_SENSOR",
        protocol: "MQTT",
        status: "PROVISIONED_PLACEHOLDER",
        lastTelemetryAt: now,
      },
      {
        deviceId: "iot-dxb-seat-vip-a1",
        theatreId: "th-dxb-003",
        hallId: "hall-dxb-aud1",
        deviceType: "SEAT_PRESSURE_SENSOR",
        protocol: "MQTT",
        status: "PROVISIONED_PLACEHOLDER",
        lastTelemetryAt: now,
      },
    ]);
  }
}

export const enterpriseHallDesignerRepository = EnterpriseHallDesignerRepository.getInstance();
