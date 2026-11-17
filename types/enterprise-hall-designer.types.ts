/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Architecture Types (Phase 4 – Part 16)
 * ==============================================================================
 * Modular, plugin-based Enterprise Extension Architecture & Platform-Agnostic
 * Scene Graph Abstraction. Decouples future 3D, WebGL, Three.js, VR, AR, AI,
 * Collaboration, Digital Twin, CAD/BIM, and IoT engines from the 2D Layout Core.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Platform-Agnostic Scene Graph Abstraction (2D Canvas & 3D WebGL/Three.js)
// ------------------------------------------------------------------------------

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox3D {
  min: Vector3D;
  max: Vector3D;
  width: number;
  height: number;
  depth: number;
}

export type SceneGraphNodeType =
  | "ROOT"
  | "FLOOR_LEVEL"
  | "BALCONY_LEVEL"
  | "SECTION_GROUP"
  | "ROW_GROUP"
  | "SEAT_MESH"
  | "STRUCTURAL_MESH"
  | "SCREEN_SURFACE"
  | "LIGHTING_NODE"
  | "CAMERA_ANCHOR"
  | "IOT_SENSOR_ANCHOR";

export interface MaterialDefinition {
  id: string;
  name: string;
  shaderType: "PBR_STANDARD" | "LAMBERT" | "EMISSIVE_SCREEN" | "GLASS_ACOUSTIC" | "FABRIC_VELVET";
  baseColorHex: string;
  roughness: number;      // 0..1
  metalness: number;      // 0..1
  opacity: number;        // 0..1
  textureUrlPlaceholder?: string;
}

export interface LodPlaceholderConfig {
  enabled: boolean;
  highDetailDistanceMeters: number;
  mediumDetailDistanceMeters: number;
  lowDetailDistanceMeters: number;
  instancedMeshThreshold: number;
}

export interface AnimationHookDescriptor {
  hookId: string;
  trigger: "ON_SEAT_HOVER" | "ON_SEAT_SELECT" | "ON_CAMERA_FLYTO" | "ON_SHOW_START_DIMMING";
  durationMs: number;
  easing: "EASE_IN_OUT" | "SPRING" | "LINEAR";
}

export interface CameraRigInterface {
  id: string;
  name: string;
  projection: "PERSPECTIVE" | "ORTHOGRAPHIC";
  fovDegrees: number;
  nearPlane: number;
  farPlane: number;
  position: Vector3D;
  target: Vector3D;
  presetType: "ORBIT_OVERVIEW" | "SEAT_POV" | "DIRECTOR_STAGE" | "TOP_DOWN_2D" | "VR_STEREO";
}

export interface LightingRigInterface {
  id: string;
  ambientColorHex: string;
  ambientIntensity: number;
  screenEmissiveIntensity: number;
  aisleStepLightsEnabled: boolean;
  shadowsEnabled: boolean;
  presetMode: "HOUSE_LIGHTS_UP" | "TRAILER_DIM" | "FEATURE_DARK" | "ARCHITECTURAL_BRIGHT";
}

export interface SeatMeshDescriptor {
  seatId: string;
  seatNumber: string;
  sectionId: string;
  rowLabel: string;
  seatType: string;
  isAccessible: boolean;
  meshAssetKey: string; // e.g. "mesh:seat:recliner_v1"
  materialId: string;
  dimensions: Vector3D;
  sightlineAngleDegrees: number;
  elevationY: number;
}

export interface StructuralMeshDescriptor {
  structuralObjectId: string;
  objectType: string;
  displayName: string;
  meshAssetKey: string;
  materialId: string;
  dimensions: Vector3D;
  isCollisionObstacle: boolean;
}

export interface SceneGraphNode {
  id: string;
  parentId: string | null;
  type: SceneGraphNodeType;
  label: string;
  floorLevelIndex: number;
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  visible: boolean;
  materialId?: string;
  seatMesh?: SeatMeshDescriptor;
  structuralMesh?: StructuralMeshDescriptor;
  metadata?: Record<string, unknown>;
  children: SceneGraphNode[];
}

export interface FloorLevelDefinition {
  levelIndex: number;
  code: string;         // e.g. "L0_ORCHESTRA", "L1_BALCONY", "L2_SKYBOX"
  name: string;
  levelType: "MAIN_FLOOR" | "BALCONY" | "MEZZANINE" | "SKY_BOX" | "VIP_LOUNGE";
  elevationMeters: number;
  ceilingHeightMeters: number;
  rakeAngleDegrees: number;
  accessibleElevatorConnected: boolean;
  sectionIds: string[];
}

export interface LayoutSceneGraph {
  schemaVersion: "1.0";
  sceneId: string;
  theatreId: string;
  hallId: string;
  layoutDefinitionId: string;
  layoutVersionId: string;
  layoutVersionNumber: number;
  coordinateUnit: "METERS";
  bounds: BoundingBox3D;
  levels: FloorLevelDefinition[];
  materials: MaterialDefinition[];
  cameras: CameraRigInterface[];
  lighting: LightingRigInterface;
  lodConfig: LodPlaceholderConfig;
  animationHooks: AnimationHookDescriptor[];
  root: SceneGraphNode;
  stats: {
    totalNodes: number;
    seatMeshCount: number;
    structuralMeshCount: number;
    floorLevelCount: number;
  };
  compiledAt: string;
}

// ------------------------------------------------------------------------------
// 2. Enterprise Extension Categories & Plugin Contracts
// ------------------------------------------------------------------------------

export type HallDesignerExtensionCategory =
  | "3D_ENGINE"
  | "WEBGL_RENDERER"
  | "THREEJS_ADAPTER"
  | "VR_ENGINE"
  | "AR_ENGINE"
  | "AI_ENGINE"
  | "COLLABORATION_ENGINE"
  | "DIGITAL_TWIN"
  | "CAD_IMPORT"
  | "BIM_ADAPTER"
  | "IOT_INTEGRATION"
  | "ENTERPRISE_TEMPLATES";

export type EnterpriseFeatureKey =
  | "THREE_D_PREVIEW"
  | "WEBGL_HARDWARE_ACCELERATION"
  | "THREEJS_SCENE_EXPORT"
  | "VR_PREVIEW"
  | "AR_PREVIEW"
  | "AI_LAYOUT_SUGGESTIONS"
  | "COLLABORATIVE_EDITING"
  | "REALTIME_PRESENCE"
  | "MULTI_FLOOR_SUPPORT"
  | "DIGITAL_TWIN_SYNC"
  | "CAD_DXF_IMPORT"
  | "BIM_IFC_PLACEHOLDER"
  | "IOT_SEAT_SENSORS"
  | "ENTERPRISE_TEMPLATE_MARKETPLACE";

export interface ExtensionManifest {
  id: string;
  key: string;
  name: string;
  version: string;
  category: HallDesignerExtensionCategory;
  description: string;
  provider: string;
  requiredFeatureKeys: EnterpriseFeatureKey[];
  supportedCapabilities: string[];
  status: "REGISTERED" | "ACTIVE" | "DISABLED" | "DEPRECATED";
  isBuiltInPlaceholder: boolean;
  configSchemaVersion: string;
  registeredBy: string;
  registeredAt: string;
  updatedAt: string;
}

export interface IHallDesignerExtension {
  manifest: ExtensionManifest;
  onRegister?: () => void | Promise<void>;
  onEnable?: (theatreId: string) => void | Promise<void>;
  onDisable?: (theatreId: string) => void | Promise<void>;
  onSceneGraphCompiled?: (sceneGraph: LayoutSceneGraph) => void | Promise<void>;
}

// ------------------------------------------------------------------------------
// 3. Specialized Enterprise Architecture Interfaces (Placeholders / Contracts)
// ------------------------------------------------------------------------------

export interface AiLayoutSuggestion {
  suggestionId: string;
  domain: "LAYOUT" | "ACCESSIBILITY" | "REVENUE" | "SEAT_DENSITY";
  confidenceScore: number; // 0..1
  title: string;
  rationale: string;
  proposedActionPlaceholder: Record<string, unknown>;
}

export interface IAiLayoutAdvisor {
  advisorId: string;
  analyzeSceneGraph(sceneGraph: LayoutSceneGraph): Promise<AiLayoutSuggestion[]>;
}

export interface CollaborationPresenceState {
  sessionId: string;
  userId: string;
  displayName: string;
  role: string;
  colorHex: string;
  cursorPosition: Vector3D;
  activeFloorLevel: number;
  selectedNodeIds: string[];
  lastHeartbeatAt: string;
}

export interface CollaborationConflictPlaceholder {
  conflictId: string;
  nodeId: string;
  localVersion: number;
  remoteVersion: number;
  resolutionStrategy: "LAST_WRITE_WINS" | "CRDT_MERGE_PLACEHOLDER" | "MANUAL_REVIEW";
}

export interface CadImportPlanPlaceholder {
  importId: string;
  theatreId: string;
  sourceFormat: "DXF" | "DWG_PLACEHOLDER" | "SVG" | "BIM_IFC_PLACEHOLDER";
  sourceUnit: "MM" | "CM" | "FT" | "M" | "PX";
  targetUnit: "METERS";
  scaleFactor: number;
  detectedLayers: string[];
  status: "PARSED_PLACEHOLDER" | "READY_FOR_CONVERSION";
}

export interface IoTDeviceDescriptor {
  deviceId: string;
  theatreId: string;
  hallId: string;
  deviceType: "SEAT_PRESSURE_SENSOR" | "OCCUPANCY_CAMERA" | "CO2_HVAC_SENSOR" | "AMBIENT_LUX_SENSOR" | "ACOUSTIC_DB_METER";
  boundNodeId?: string;
  protocol: "MQTT" | "WEBSOCKET" | "BACNET_PLACEHOLDER";
  status: "ONLINE" | "OFFLINE" | "PROVISIONED_PLACEHOLDER";
  lastTelemetryAt?: string;
}

export interface IoTTelemetryEventPlaceholder {
  eventId: string;
  deviceId: string;
  theatreId: string;
  hallId: string;
  metricKey: string;
  metricValue: number | boolean | string;
  unit?: string;
  recordedAt: string;
}

// ------------------------------------------------------------------------------
// 4. Persisted Enterprise Governance & Configuration Models
// ------------------------------------------------------------------------------

export interface EnterpriseFeatureDefinition {
  id: string;
  featureKey: EnterpriseFeatureKey;
  displayName: string;
  category: HallDesignerExtensionCategory;
  description: string;
  maturityStage: "FOUNDATION_READY" | "BETA_PLACEHOLDER" | "FUTURE_ROADMAP";
  requiresGpuAcceleration: boolean;
  defaultEnabled: boolean;
  createdAt: string;
}

export interface ThreeDConfigurationRecord {
  theatreId: string;
  renderingBackend: "WEBGL2" | "WEBGPU_PLACEHOLDER" | "CANVAS_2D_FALLBACK";
  defaultCameraPreset: CameraRigInterface["presetType"];
  shadowsEnabled: boolean;
  antiAliasingEnabled: boolean;
  maxTargetFps: number;
  lodConfig: LodPlaceholderConfig;
  streamingAssetsEnabled: boolean;
  assetCdnBaseUrlPlaceholder?: string;
  updatedAt: string;
}

export interface CollaborationConfigurationRecord {
  theatreId: string;
  enabled: boolean;
  livePresenceEnabled: boolean;
  cursorSharingEnabled: boolean;
  maxConcurrentEditors: number;
  conflictStrategy: "CRDT_MERGE_PLACEHOLDER" | "OPTIMISTIC_LOCK" | "SECTION_LOCKING";
  presenceTransportPlaceholder: "WEBSOCKET_CLUSTER" | "WEBRTC_MESH";
  autoVersionMergePlaceholder: boolean;
  updatedAt: string;
}

export interface EnterpriseHallConfiguration {
  theatreId: string;
  enabledFeatures: Record<EnterpriseFeatureKey, boolean>;
  multiLevelConfig: {
    enabled: boolean;
    maxSupportedFloors: number;
    balconyDesignEnabled: boolean;
    skyBoxDesignEnabled: boolean;
    vipLoungeDesignEnabled: boolean;
  };
  performanceConfig: {
    gpuRenderingReady: boolean;
    backgroundWorkerPoolPlaceholder: boolean;
    streamingAssetsEnabled: boolean;
    incrementalLoadingEnabled: boolean;
    sceneGraphCacheTtlSeconds: number;
  };
  threeDConfig: ThreeDConfigurationRecord;
  collaborationConfig: CollaborationConfigurationRecord;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// 5. Phase 4 Event-Driven Domain Architecture Contracts
// ------------------------------------------------------------------------------

export type HallDesignerDomainEventType =
  | "LayoutPublished"
  | "SeatInventoryGenerated"
  | "TemplateCreated"
  | "ValidationPassed"
  | "LayoutArchived"
  | "AnalyticsProjectionRefreshed"
  | "EnterpriseFeatureToggled";

export interface HallDesignerDomainEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: HallDesignerDomainEventType;
  theatreId: string;
  hallId?: string;
  actorId: string;
  correlationId?: string;
  occurredAt: string;
  payload: T;
}
