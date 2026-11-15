/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extensions Domain Service (Phase 3 – Part 16)
 * ==============================================================================
 * Central domain service unifying enterprise sub-platforms, extension lifecycle
 * execution, 4-tier feature flag cascading, IoT telemetry recording, dynamic
 * pricing evaluation, and decoupled domain event broadcasting.
 * ==============================================================================
 */

import {
  EnterprisePlatformKey,
  EnterpriseModuleId,
  EnterpriseFeatureFlag,
  ResolvedFeatureFlag,
  FeatureFlagScope,
  FeatureFlagLevel,
  EnterpriseDomainEventType as DomainEventType,
  DomainEventPayload,
  Organization,
  Branch,
  DeviceRegistry,
  DeviceTelemetry,
} from "@/types/enterprise-extension-framework.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { enterpriseExtensionsRepository } from "@/lib/repositories/enterprise-extensions.repository";
import { featureFlags } from "@/lib/enterprise/feature-flags";
import { extensionRegistry } from "@/lib/enterprise/extension-sdk";
import { eventBus } from "@/lib/enterprise/event-bus";
import { registerDefaultEnterpriseModules } from "@/lib/enterprise/mock-modules";
import { AuthorizationError, NotFoundError } from "@/lib/errors/app-error";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("EnterpriseExtensionsService");

export interface EnterpriseOverviewSummary {
  totalOrganizations: number;
  totalBranches: number;
  totalRegisteredModules: number;
  enabledModulesCount: number;
  totalDevices: number;
  onlineDevicesCount: number;
  activePricingRulesCount: number;
  totalFeatureFlags: number;
  totalHistoricalEvents: number;
}

export class EnterpriseExtensionsService {
  private static instance: EnterpriseExtensionsService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): EnterpriseExtensionsService {
    if (!EnterpriseExtensionsService.instance) {
      EnterpriseExtensionsService.instance = new EnterpriseExtensionsService();
    }
    return EnterpriseExtensionsService.instance;
  }

  /**
   * Ensure default enterprise modules are registered into the extension registry.
   */
  public async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await registerDefaultEnterpriseModules(extensionRegistry, true);
      this.initialized = true;
    }
  }

  /**
   * Verify that the calling actor has Super Admin authorization.
   */
  private assertSuperAdmin(actor: SecurityActorContext, actionDescription: string): void {
    if (actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        `Unauthorized: Only Super Administrators can ${actionDescription}. Current role: ${actor.role}`
      );
    }
  }

  /**
   * Verify that the calling actor has administrative authorization (Super Admin or Theatre Admin).
   */
  private assertAdminAccess(actor: SecurityActorContext, actionDescription: string): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        `Unauthorized: Administrative privileges required to ${actionDescription}. Current role: ${actor.role}`
      );
    }
  }

  // ----------------------------------------------------------------------------
  // 1. Organization & Branch Hierarchy
  // ----------------------------------------------------------------------------

  public async getOrganizationHierarchy(
    actor: SecurityActorContext,
    organizationId?: string
  ): Promise<{
    organizations: Organization[];
    branches: Branch[];
    regionalOffices: unknown[];
    franchiseAgreements: unknown[];
    corporateAccounts: unknown[];
  }> {
    this.assertAdminAccess(actor, "view enterprise organization hierarchy");

    const organizations = organizationId
      ? [enterpriseExtensionsRepository.getOrganizationById(organizationId)].filter(Boolean) as Organization[]
      : enterpriseExtensionsRepository.listOrganizations();

    const branches = enterpriseExtensionsRepository.listBranches(organizationId);
    const regionalOffices = enterpriseExtensionsRepository.listRegionalOffices(organizationId);
    const franchiseAgreements = enterpriseExtensionsRepository.listFranchiseAgreements(organizationId);
    const corporateAccounts = enterpriseExtensionsRepository.listCorporateAccounts(organizationId);

    return {
      organizations,
      branches,
      regionalOffices,
      franchiseAgreements,
      corporateAccounts,
    };
  }

  // ----------------------------------------------------------------------------
  // 2. Extension Modules Management
  // ----------------------------------------------------------------------------

  public async listExtensions(
    actor: SecurityActorContext,
    platformKey?: EnterprisePlatformKey
  ) {
    this.assertAdminAccess(actor, "view installed enterprise extensions");
    await this.ensureInitialized();
    return extensionRegistry.listModules(platformKey);
  }

  public async toggleExtensionModule(
    actor: SecurityActorContext,
    moduleId: EnterpriseModuleId,
    enable: boolean
  ): Promise<{ success: boolean; state: string; error?: string }> {
    this.assertSuperAdmin(actor, `${enable ? "enable" : "disable"} enterprise extension '${moduleId}'`);
    await this.ensureInitialized();

    const currentModule = extensionRegistry.getModule(moduleId);
    if (!currentModule) {
      throw new NotFoundError(`Extension module '${moduleId}' is not registered in the Extension SDK.`);
    }

    if (enable) {
      const success = await extensionRegistry.enableModule(moduleId, actor);
      if (!success) {
        const depCheck = extensionRegistry.validateDependencies(moduleId);
        const errorMsg = !depCheck.isValid
          ? `Missing required module dependencies: ${depCheck.missingDependencies.join(", ")}`
          : `Module '${moduleId}' onEnable lifecycle hook returned false.`;
        return { success: false, state: extensionRegistry.getModuleState(moduleId), error: errorMsg };
      }
      logger.info("SYSTEM", `Enabled enterprise module: ${moduleId}`, { metadata: { actor: actor.userId } });
      return { success: true, state: "ENABLED" };
    } else {
      const success = await extensionRegistry.disableModule(moduleId, actor);
      logger.info("SYSTEM", `Disabled enterprise module: ${moduleId}`, { metadata: { actor: actor.userId } });
      return { success, state: extensionRegistry.getModuleState(moduleId) };
    }
  }

  // ----------------------------------------------------------------------------
  // 3. 4-Tier Feature Flags Management
  // ----------------------------------------------------------------------------

  public listFeatureFlags(actor: SecurityActorContext): EnterpriseFeatureFlag[] {
    this.assertAdminAccess(actor, "list enterprise feature flags");
    return featureFlags.listFlags();
  }

  public resolveFeatureFlag(
    actor: SecurityActorContext,
    flagKey: string,
    scope: FeatureFlagScope = {}
  ): ResolvedFeatureFlag {
    // If not provided in scope, infer from actor
    const effectiveScope: FeatureFlagScope = {
      userId: scope.userId || actor.userId,
      theatreId: scope.theatreId || actor.theatreId,
      organizationId: scope.organizationId,
    };

    return featureFlags.resolveFlag(flagKey, effectiveScope);
  }

  public setFeatureFlagOverride(
    actor: SecurityActorContext,
    flagKey: string,
    level: FeatureFlagLevel,
    targetId: string,
    value: boolean | string | number | Record<string, unknown>
  ): boolean {
    if (level === "PLATFORM") {
      this.assertSuperAdmin(actor, "modify platform-wide feature flags");
      return featureFlags.setPlatformFlag(flagKey, Boolean(value));
    }

    this.assertAdminAccess(actor, `set ${level} feature flag override`);

    if (level === "ORGANIZATION") {
      this.assertSuperAdmin(actor, "modify organization-level feature flag overrides");
      return featureFlags.setOrganizationOverride(flagKey, targetId, value);
    }

    if (level === "THEATRE") {
      // Theatre Admin can only modify override for their own theatre
      if (actor.role === "THEATRE_ADMIN" && actor.theatreId !== targetId) {
        throw new AuthorizationError("Theatre Administrators can only configure feature flags for their own venue.");
      }
      return featureFlags.setTheatreOverride(flagKey, targetId, value);
    }

    if (level === "USER") {
      return featureFlags.setUserOverride(flagKey, targetId, value);
    }

    return false;
  }

  public removeFeatureFlagOverride(
    actor: SecurityActorContext,
    flagKey: string,
    level: FeatureFlagLevel,
    targetId: string
  ): boolean {
    this.assertAdminAccess(actor, `remove ${level} feature flag override`);
    return featureFlags.removeOverride(flagKey, level, targetId);
  }

  // ----------------------------------------------------------------------------
  // 4. Dynamic Pricing Engine
  // ----------------------------------------------------------------------------

  public evaluateDynamicPricing(
    actor: SecurityActorContext,
    context: {
      basePrice: number;
      theatreId: string;
      showTime: string;
      currentOccupancyPercent: number;
      format: string;
    }
  ) {
    // Check if dynamic pricing is enabled for this venue
    const flagResolution = featureFlags.resolveFlag("enterprise.dynamic_pricing", {
      theatreId: context.theatreId,
    });

    if (!flagResolution.effectiveValue) {
      // Dynamic pricing disabled -> return untouched base price
      return {
        effectivePrice: context.basePrice,
        appliedRuleIds: [],
        priceMultiplier: 1.0,
        dynamicPricingEnabled: false,
      };
    }

    const evaluation = enterpriseExtensionsRepository.evaluatePricing(context);
    return {
      ...evaluation,
      dynamicPricingEnabled: true,
    };
  }

  // ----------------------------------------------------------------------------
  // 5. Device Platform (IoT & Signage)
  // ----------------------------------------------------------------------------

  public listDevices(actor: SecurityActorContext, theatreId?: string): DeviceRegistry[] {
    this.assertAdminAccess(actor, "view device hardware registry");
    const targetTheatre = theatreId || (actor.role === "THEATRE_ADMIN" ? actor.theatreId : undefined);
    return enterpriseExtensionsRepository.listDevices(targetTheatre);
  }

  public registerDevice(actor: SecurityActorContext, device: DeviceRegistry): DeviceRegistry {
    this.assertAdminAccess(actor, "register new hardware device");
    return enterpriseExtensionsRepository.registerDevice(device);
  }

  public async recordDeviceTelemetry(
    actor: SecurityActorContext,
    telemetry: DeviceTelemetry
  ): Promise<void> {
    enterpriseExtensionsRepository.recordTelemetry(telemetry);

    // Broadcast telemetry event over event bus
    const device = enterpriseExtensionsRepository.getDeviceById(telemetry.deviceId);
    await eventBus.publish({
      eventType: "DEVICE_TELEMETRY_RECORDED",
      correlationId: `telem_${telemetry.deviceId}_${Date.now()}`,
      tenantId: device?.theatreId,
      actor,
      data: telemetry,
    });
  }

  // ----------------------------------------------------------------------------
  // 6. Domain Event Bus Integration & Audit Replay
  // ----------------------------------------------------------------------------

  public async dispatchDomainEvent(
    actor: SecurityActorContext,
    eventInput: {
      eventType: DomainEventType;
      data: unknown;
      tenantId?: string;
      organizationId?: string;
      correlationId?: string;
    }
  ) {
    return eventBus.publish({
      eventType: eventInput.eventType,
      correlationId: eventInput.correlationId || `corr_${Date.now()}`,
      tenantId: eventInput.tenantId || actor.theatreId,
      organizationId: eventInput.organizationId,
      actor,
      data: eventInput.data,
    });
  }

  public getEventBusHistory(
    actor: SecurityActorContext,
    filter?: { eventType?: DomainEventType; tenantId?: string; limit?: number }
  ): DomainEventPayload[] {
    this.assertAdminAccess(actor, "inspect domain event bus audit history");
    return eventBus.getEventHistory(filter);
  }

  // ----------------------------------------------------------------------------
  // 7. Enterprise Overview & Diagnostics
  // ----------------------------------------------------------------------------

  public async getEnterpriseOverview(actor: SecurityActorContext): Promise<EnterpriseOverviewSummary> {
    this.assertAdminAccess(actor, "view enterprise framework overview");
    await this.ensureInitialized();

    const orgs = enterpriseExtensionsRepository.listOrganizations();
    const branches = enterpriseExtensionsRepository.listBranches();
    const modules = extensionRegistry.listModules();
    const enabledModules = modules.filter((m) => m.state === "ENABLED");
    const devices = enterpriseExtensionsRepository.listDevices();
    const onlineDevices = devices.filter((d) => d.status === "ONLINE");
    const pricingRules = enterpriseExtensionsRepository.listPricingRules().filter((r) => r.isActive);
    const flags = featureFlags.listFlags();
    const events = eventBus.getEventHistory();

    return {
      totalOrganizations: orgs.length,
      totalBranches: branches.length,
      totalRegisteredModules: modules.length,
      enabledModulesCount: enabledModules.length,
      totalDevices: devices.length,
      onlineDevicesCount: onlineDevices.length,
      activePricingRulesCount: pricingRules.length,
      totalFeatureFlags: flags.length,
      totalHistoricalEvents: events.length,
    };
  }

  /**
   * Reset service and underlying singletons (for testing).
   */
  public reset(): void {
    enterpriseExtensionsRepository.reset();
    featureFlags.reset();
    extensionRegistry.reset();
    eventBus.reset();
    this.initialized = false;
  }
}

export const enterpriseExtensionsService = EnterpriseExtensionsService.getInstance();
