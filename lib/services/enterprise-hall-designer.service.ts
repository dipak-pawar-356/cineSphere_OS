import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  ExtensionManifest,
  HallDesignerExtensionCategory,
  EnterpriseFeatureKey,
  EnterpriseFeatureDefinition,
  EnterpriseHallConfiguration,
  ThreeDConfigurationRecord,
  CollaborationConfigurationRecord,
  LayoutSceneGraph,
  CadImportPlanPlaceholder,
  AiLayoutSuggestion,
  HallDesignerDomainEvent,
  HallDesignerDomainEventType,
  IoTDeviceDescriptor,
} from "@/types/enterprise-hall-designer.types";
import { hallExtensionRegistry } from "@/lib/engine/hall-extension-registry";
import { LayoutSceneGraphEngine } from "@/lib/engine/layout-scene-graph-engine";
import { hallDesignerEventBus } from "@/lib/engine/hall-designer-event-bus";
import { enterpriseHallDesignerRepository } from "@/lib/repositories/enterprise-hall-designer.repository";
import { HallDesignerRepository } from "@/lib/repositories/hall-designer.repository";
import { structuralObjectRepository } from "@/lib/repositories/structural-object.repository";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  TenantAccessError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/lib/errors/app-error";

/**
 * ==============================================================================
 * CineSphere OS — Enterprise Hall Designer Service (Phase 4 – Part 16)
 * ==============================================================================
 * Orchestrates the plugin-based Enterprise Extension Layer, Platform-Agnostic
 * Scene Graph compilation, per-theatre enterprise capability toggles (3D, VR,
 * AR, AI, Collaboration, Multi-Floor, CAD/BIM, Digital Twin & IoT), and the
 * Phase 4 Domain Event Bus.
 * ==============================================================================
 */

export class EnterpriseHallDesignerService {
  private static instance: EnterpriseHallDesignerService | null = null;
  private entRepo = enterpriseHallDesignerRepository;
  private extensionRegistry = hallExtensionRegistry;
  private designerRepo = HallDesignerRepository.getInstance();
  private structuralRepo = structuralObjectRepository;
  private eventBus = hallDesignerEventBus;
  private auditService = securityAuditService;

  private constructor() {}

  public static getInstance(): EnterpriseHallDesignerService {
    if (!EnterpriseHallDesignerService.instance) {
      EnterpriseHallDesignerService.instance = new EnterpriseHallDesignerService();
    }
    return EnterpriseHallDesignerService.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Plugin-Based Extension Registry Management
  // ----------------------------------------------------------------------------

  public async registerExtension(
    actor: SecurityActorContext,
    payload: {
      key: string;
      name: string;
      version: string;
      category: HallDesignerExtensionCategory;
      description: string;
      provider: string;
      requiredFeatureKeys: EnterpriseFeatureKey[];
      supportedCapabilities: string[];
    }
  ): Promise<ExtensionManifest> {
    if (actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only Platform Super Admins can register new Hall Designer extensions."
      );
    }

    const now = new Date().toISOString();
    const manifest: ExtensionManifest = {
      id: `ext-${payload.key.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now().toString(36)}`,
      key: payload.key,
      name: payload.name,
      version: payload.version,
      category: payload.category,
      description: payload.description,
      provider: payload.provider,
      requiredFeatureKeys: payload.requiredFeatureKeys,
      supportedCapabilities: payload.supportedCapabilities,
      status: "REGISTERED",
      isBuiltInPlaceholder: false,
      configSchemaVersion: "1.0",
      registeredBy: actor.userId,
      registeredAt: now,
      updatedAt: now,
    };

    const registered = await this.extensionRegistry.register({ manifest });

    await this.auditService.recordAudit({
      actor,
      module: "ENTERPRISE_HALL_DESIGNER",
      action: "REGISTER_EXTENSION",
      description: `Registered enterprise Hall Designer extension '${registered.name}' (${registered.key} v${registered.version})`,
      metadata: { extensionKey: registered.key, category: registered.category },
    });

    return registered;
  }

  public async loadExtensionConfiguration(
    actor: SecurityActorContext,
    theatreId: string,
    category?: HallDesignerExtensionCategory
  ): Promise<{
    theatreId: string;
    extensions: Array<ExtensionManifest & { isEnabledForTheatre: boolean }>;
    featuresCatalog: EnterpriseFeatureDefinition[];
    iotDevices: IoTDeviceDescriptor[];
  }> {
    this.assertTenantAccess(actor, theatreId);
    this.assertEnterpriseAccessRole(actor);

    const config = this.entRepo.getConfiguration(theatreId);
    const manifests = this.extensionRegistry.listManifests(category);

    const extensions = manifests.map((m) => ({
      ...m,
      isEnabledForTheatre:
        m.requiredFeatureKeys.length === 0 ||
        m.requiredFeatureKeys.every((fk) => Boolean(config.enabledFeatures[fk])),
    }));

    return {
      theatreId,
      extensions,
      featuresCatalog: this.entRepo.listFeatures(),
      iotDevices: this.entRepo.listIoTDevices(theatreId),
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Enable / Disable Enterprise Features Per Theatre
  // ----------------------------------------------------------------------------

  public async enableFeature(
    actor: SecurityActorContext,
    theatreId: string,
    featureKey: EnterpriseFeatureKey
  ): Promise<EnterpriseHallConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertFeatureManagerRole(actor);

    const feat = this.entRepo.getFeature(featureKey);
    if (!feat) {
      throw new NotFoundError(`Enterprise feature '${featureKey}' does not exist in catalog.`);
    }

    const updated = this.entRepo.setFeatureEnabled(theatreId, featureKey, true);

    // Notify any registered extensions that depend on this feature
    for (const m of this.extensionRegistry.listManifests()) {
      if (m.requiredFeatureKeys.includes(featureKey)) {
        await this.extensionRegistry.triggerLifecycleHook(m.key, "onEnable", theatreId);
      }
    }

    await this.auditService.recordAudit({
      actor,
      module: "ENTERPRISE_HALL_DESIGNER",
      action: "ENABLE_FEATURE",
      description: `Enabled enterprise capability '${featureKey}' for theatre '${theatreId}'`,
      metadata: { theatreId, featureKey },
    });

    await this.eventBus.publish({
      eventType: "EnterpriseFeatureToggled",
      theatreId,
      actorId: actor.userId,
      correlationId: actor.correlationId,
      payload: { featureKey, enabled: true },
    });

    return updated;
  }

  public async disableFeature(
    actor: SecurityActorContext,
    theatreId: string,
    featureKey: EnterpriseFeatureKey
  ): Promise<EnterpriseHallConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertFeatureManagerRole(actor);

    const feat = this.entRepo.getFeature(featureKey);
    if (!feat) {
      throw new NotFoundError(`Enterprise feature '${featureKey}' does not exist in catalog.`);
    }

    const updated = this.entRepo.setFeatureEnabled(theatreId, featureKey, false);

    for (const m of this.extensionRegistry.listManifests()) {
      if (m.requiredFeatureKeys.includes(featureKey)) {
        await this.extensionRegistry.triggerLifecycleHook(m.key, "onDisable", theatreId);
      }
    }

    await this.auditService.recordAudit({
      actor,
      module: "ENTERPRISE_HALL_DESIGNER",
      action: "DISABLE_FEATURE",
      description: `Disabled enterprise capability '${featureKey}' for theatre '${theatreId}'`,
      metadata: { theatreId, featureKey },
    });

    await this.eventBus.publish({
      eventType: "EnterpriseFeatureToggled",
      theatreId,
      actorId: actor.userId,
      correlationId: actor.correlationId,
      payload: { featureKey, enabled: false },
    });

    return updated;
  }

  // ----------------------------------------------------------------------------
  // 3. Enterprise Settings, 3D Config & Collaboration Config
  // ----------------------------------------------------------------------------

  public async loadEnterpriseSettings(
    actor: SecurityActorContext,
    theatreId: string
  ): Promise<EnterpriseHallConfiguration> {
    this.assertTenantAccess(actor, theatreId);
    this.assertEnterpriseAccessRole(actor);
    return this.entRepo.getConfiguration(theatreId);
  }

  public async saveThreeDConfig(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<ThreeDConfigurationRecord>
  ): Promise<ThreeDConfigurationRecord> {
    this.assertTenantAccess(actor, theatreId);
    this.assertFeatureManagerRole(actor);

    const saved = this.entRepo.updateThreeDConfig(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "ENTERPRISE_HALL_DESIGNER",
      action: "UPDATE_3D_CONFIG",
      description: `Updated 3D/WebGL rendering configuration for theatre '${theatreId}'`,
      metadata: { theatreId, renderingBackend: saved.renderingBackend },
    });

    return saved;
  }

  public async saveCollaborationConfig(
    actor: SecurityActorContext,
    theatreId: string,
    updates: Partial<CollaborationConfigurationRecord>
  ): Promise<CollaborationConfigurationRecord> {
    this.assertTenantAccess(actor, theatreId);
    this.assertFeatureManagerRole(actor);

    const saved = this.entRepo.updateCollaborationConfig(theatreId, updates);

    await this.auditService.recordAudit({
      actor,
      module: "ENTERPRISE_HALL_DESIGNER",
      action: "UPDATE_COLLAB_CONFIG",
      description: `Updated real-time collaboration settings for theatre '${theatreId}'`,
      metadata: { theatreId, enabled: saved.enabled, conflictStrategy: saved.conflictStrategy },
    });

    return saved;
  }

  // ----------------------------------------------------------------------------
  // 4. Platform-Agnostic Scene Graph Compilation, CAD Plan & AI Hook
  // ----------------------------------------------------------------------------

  public async compileSceneGraph(
    actor: SecurityActorContext,
    params: { theatreId: string; hallId: string; layoutVersionId?: string }
  ): Promise<LayoutSceneGraph> {
    const { theatreId, hallId } = params;
    this.assertTenantAccess(actor, theatreId);
    this.assertEnterpriseAccessRole(actor);

    const config = this.entRepo.getConfiguration(theatreId);

    let targetVersionId = params.layoutVersionId;
    if (!targetVersionId) {
      const published = this.designerRepo.getPublishedLayoutForHall(hallId, theatreId);
      if (published) {
        targetVersionId = published.id;
      } else {
        const defs = this.designerRepo.listLayoutDefinitions(theatreId, hallId);
        targetVersionId = defs[0]?.currentPublishedVersionId || defs[0]?.activeDraftVersionId;
      }
    }

    if (!targetVersionId) {
      throw new NotFoundError(`No layout version found for hall '${hallId}' to compile Scene Graph.`);
    }

    const version = this.designerRepo.getLayoutVersionById(targetVersionId, theatreId);
    if (!version) {
      throw new NotFoundError(`Layout version '${targetVersionId}' not found.`);
    }

    const structuralObjects = await this.structuralRepo.listByLayoutVersion(theatreId, version.id);

    const sceneGraph = LayoutSceneGraphEngine.compileSceneGraph({
      theatreId,
      hallId,
      layoutVersion: version,
      structuralObjects,
      multiLevelEnabled: config.multiLevelConfig.enabled,
      lodConfig: config.threeDConfig.lodConfig,
    });

    await this.extensionRegistry.notifySceneGraphCompiled(sceneGraph);
    return sceneGraph;
  }

  public async createCadImportPlan(
    actor: SecurityActorContext,
    params: {
      theatreId: string;
      sourceFormat: CadImportPlanPlaceholder["sourceFormat"];
      sourceUnit: CadImportPlanPlaceholder["sourceUnit"];
      detectedLayers?: string[];
    }
  ): Promise<CadImportPlanPlaceholder> {
    this.assertTenantAccess(actor, params.theatreId);
    this.assertFeatureManagerRole(actor);

    const config = this.entRepo.getConfiguration(params.theatreId);
    if (!config.enabledFeatures.CAD_DXF_IMPORT && !config.enabledFeatures.BIM_IFC_PLACEHOLDER) {
      throw new ValidationError(
        `CAD/BIM import capability is disabled for theatre '${params.theatreId}'. Enable CAD_DXF_IMPORT first.`
      );
    }

    return LayoutSceneGraphEngine.createCadImportPlanPlaceholder(params);
  }

  public async getAiSuggestionsPlaceholder(
    actor: SecurityActorContext,
    params: { theatreId: string; hallId: string; layoutVersionId?: string }
  ): Promise<AiLayoutSuggestion[]> {
    this.assertTenantAccess(actor, params.theatreId);
    this.assertEnterpriseAccessRole(actor);

    const config = this.entRepo.getConfiguration(params.theatreId);
    if (!config.enabledFeatures.AI_LAYOUT_SUGGESTIONS) {
      throw new ValidationError(
        `AI Layout Suggestions are disabled for theatre '${params.theatreId}'. Enable AI_LAYOUT_SUGGESTIONS first.`
      );
    }

    const sceneGraph = await this.compileSceneGraph(actor, params);
    return LayoutSceneGraphEngine.generateAiSuggestionsPlaceholder(sceneGraph);
  }

  public async getDomainEventLog(
    actor: SecurityActorContext,
    theatreId: string,
    eventType?: HallDesignerDomainEventType,
    limit = 50
  ): Promise<HallDesignerDomainEvent[]> {
    this.assertTenantAccess(actor, theatreId);
    this.assertEnterpriseAccessRole(actor);
    return this.eventBus.getEventLog(theatreId, eventType, limit);
  }

  // ----------------------------------------------------------------------------
  // Security Helpers
  // ----------------------------------------------------------------------------

  private assertTenantAccess(actor: SecurityActorContext, theatreId: string): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Security Violation: User '${actor.userId}' cannot access enterprise settings for theatre '${theatreId}'.`
      );
    }
  }

  private assertFeatureManagerRole(actor: SecurityActorContext): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        "Action forbidden: Only Super Admins or Theatre Admins can modify enterprise feature settings."
      );
    }
  }

  private assertEnterpriseAccessRole(actor: SecurityActorContext): void {
    if (
      actor.role !== "SUPER_ADMIN" &&
      actor.role !== "THEATRE_ADMIN" &&
      actor.role !== "HALL_MANAGER"
    ) {
      throw new AuthorizationError(
        "Action forbidden: Enterprise Hall Designer tools require Super Admin, Theatre Admin, or Hall Manager access."
      );
    }
  }
}

export const enterpriseHallDesignerService = EnterpriseHallDesignerService.getInstance();
