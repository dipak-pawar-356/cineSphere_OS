/**
 * ==============================================================================
 * CineSphere OS — Enterprise Extension SDK & Module Registry (Phase 3 – Part 16)
 * ==============================================================================
 * Pluggable runtime kernel that registers, validates, installs, enables, disables,
 * and upgrades enterprise extensions without touching the platform core codebase.
 * Provides aggregated route registration, dynamic permission injection, and
 * background job scheduling contracts.
 * ==============================================================================
 */

import {
  EnterpriseModuleDefinition,
  EnterpriseModuleId,
  EnterprisePlatformKey,
  ExtensionLifecycleState,
  ExtensionRouteDefinition,
  ExtensionPermissionDefinition,
  ExtensionBackgroundJobDefinition,
} from "@/types/enterprise-extension-framework.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { UserRole } from "@/auth/types/role.types";
import { eventBus } from "./event-bus";

export class EnterpriseExtensionRegistry {
  private static instance: EnterpriseExtensionRegistry | null = null;
  private modules: Map<EnterpriseModuleId, EnterpriseModuleDefinition> = new Map();
  private states: Map<EnterpriseModuleId, ExtensionLifecycleState> = new Map();

  private constructor() {}

  public static getInstance(): EnterpriseExtensionRegistry {
    if (!EnterpriseExtensionRegistry.instance) {
      EnterpriseExtensionRegistry.instance = new EnterpriseExtensionRegistry();
    }
    return EnterpriseExtensionRegistry.instance;
  }

  /**
   * Register a new enterprise extension module in the runtime registry.
   */
  public registerModule(module: EnterpriseModuleDefinition): boolean {
    const { moduleId } = module.manifest;
    this.modules.set(moduleId, module);
    if (!this.states.has(moduleId)) {
      this.states.set(moduleId, "INSTALLED");
    }
    return true;
  }

  /**
   * Retrieve module definition by ID.
   */
  public getModule(moduleId: EnterpriseModuleId): EnterpriseModuleDefinition | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Retrieve current lifecycle state of a module.
   */
  public getModuleState(moduleId: EnterpriseModuleId): ExtensionLifecycleState {
    return this.states.get(moduleId) || "UNINSTALLED";
  }

  /**
   * List all registered modules, optionally filtered by platform key.
   */
  public listModules(platformKey?: EnterprisePlatformKey): Array<{
    module: EnterpriseModuleDefinition;
    state: ExtensionLifecycleState;
  }> {
    const list: Array<{
      module: EnterpriseModuleDefinition;
      state: ExtensionLifecycleState;
    }> = [];

    for (const [moduleId, module] of this.modules.entries()) {
      if (!platformKey || module.manifest.platformKey === platformKey) {
        list.push({
          module,
          state: this.states.get(moduleId) || "UNINSTALLED",
        });
      }
    }

    return list;
  }

  /**
   * Validate whether all dependencies of a module are registered and enabled.
   */
  public validateDependencies(moduleId: EnterpriseModuleId): {
    isValid: boolean;
    missingDependencies: EnterpriseModuleId[];
  } {
    const mod = this.modules.get(moduleId);
    if (!mod) {
      return { isValid: false, missingDependencies: [] };
    }

    const missing: EnterpriseModuleId[] = [];
    for (const depId of mod.manifest.dependencies) {
      const depState = this.states.get(depId);
      if (!depState || depState !== "ENABLED") {
        missing.push(depId);
      }
    }

    return {
      isValid: missing.length === 0,
      missingDependencies: missing,
    };
  }

  /**
   * Execute onInstall hook and mark module as INSTALLED.
   */
  public async installModule(
    moduleId: EnterpriseModuleId,
    context: SecurityActorContext
  ): Promise<boolean> {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;

    if (mod.onInstall) {
      const success = await mod.onInstall(context);
      if (!success) {
        this.states.set(moduleId, "ERROR");
        return false;
      }
    }

    this.states.set(moduleId, "INSTALLED");
    return true;
  }

  /**
   * Execute onEnable hook, validate dependencies, and transition to ENABLED.
   */
  public async enableModule(
    moduleId: EnterpriseModuleId,
    context: SecurityActorContext
  ): Promise<boolean> {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;

    // Validate dependencies
    const depCheck = this.validateDependencies(moduleId);
    if (!depCheck.isValid) {
      return false;
    }

    if (mod.onEnable) {
      const success = await mod.onEnable(context);
      if (!success) {
        this.states.set(moduleId, "ERROR");
        return false;
      }
    }

    this.states.set(moduleId, "ENABLED");

    // Publish module enabled event
    await eventBus.publish({
      eventType: "ENTERPRISE_MODULE_ENABLED",
      correlationId: `enable_${moduleId}_${Date.now()}`,
      actor: context,
      data: {
        moduleId,
        version: mod.manifest.version,
        platformKey: mod.manifest.platformKey,
      },
    });

    return true;
  }

  /**
   * Execute onDisable hook and transition module to DISABLED.
   */
  public async disableModule(
    moduleId: EnterpriseModuleId,
    context: SecurityActorContext
  ): Promise<boolean> {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;

    if (mod.onDisable) {
      const success = await mod.onDisable(context);
      if (!success) {
        this.states.set(moduleId, "ERROR");
        return false;
      }
    }

    this.states.set(moduleId, "DISABLED");
    return true;
  }

  /**
   * Execute onUpgrade hook and update version metadata.
   */
  public async upgradeModule(
    moduleId: EnterpriseModuleId,
    toVersion: string,
    context: SecurityActorContext
  ): Promise<boolean> {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;

    const currentVersion = mod.manifest.version;
    if (mod.onUpgrade) {
      const success = await mod.onUpgrade(currentVersion, toVersion, context);
      if (!success) return false;
    }

    mod.manifest.version = toVersion;
    return true;
  }

  /**
   * Aggregates dynamic route navigation across all ENABLED enterprise extensions.
   * Can be filtered according to current actor role.
   */
  public getAggregatedRoutes(actorRole?: UserRole): ExtensionRouteDefinition[] {
    const routes: ExtensionRouteDefinition[] = [];

    for (const [moduleId, mod] of this.modules.entries()) {
      if (this.states.get(moduleId) === "ENABLED" && mod.registerRoutes) {
        const modRoutes = mod.registerRoutes();
        for (const route of modRoutes) {
          if (!actorRole || route.requiredRoles.includes(actorRole)) {
            routes.push(route);
          }
        }
      }
    }

    return routes;
  }

  /**
   * Aggregates security permissions across all ENABLED enterprise extensions.
   */
  public getAggregatedPermissions(): ExtensionPermissionDefinition[] {
    const permissions: ExtensionPermissionDefinition[] = [];

    for (const [moduleId, mod] of this.modules.entries()) {
      if (this.states.get(moduleId) === "ENABLED" && mod.registerPermissions) {
        permissions.push(...mod.registerPermissions());
      }
    }

    return permissions;
  }

  /**
   * Aggregates scheduled background jobs across all ENABLED enterprise extensions.
   */
  public getAggregatedBackgroundJobs(): ExtensionBackgroundJobDefinition[] {
    const jobs: ExtensionBackgroundJobDefinition[] = [];

    for (const [moduleId, mod] of this.modules.entries()) {
      if (this.states.get(moduleId) === "ENABLED" && mod.registerBackgroundJobs) {
        jobs.push(...mod.registerBackgroundJobs());
      }
    }

    return jobs;
  }

  /**
   * Reset registry to clean slate (for testing).
   */
  public reset(): void {
    this.modules.clear();
    this.states.clear();
  }
}

export const extensionRegistry = EnterpriseExtensionRegistry.getInstance();
