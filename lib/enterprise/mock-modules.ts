/**
 * ==============================================================================
 * CineSphere OS — Reference Enterprise Modules (Phase 3 – Part 16)
 * ==============================================================================
 * Reference extension plugins demonstrating plug-and-play architecture with
 * declarative manifests, lifecycle hooks, route registration, permission injection,
 * and background job definitions.
 * ==============================================================================
 */

import {
  EnterpriseModuleDefinition,
  ExtensionRouteDefinition,
  ExtensionPermissionDefinition,
  ExtensionBackgroundJobDefinition,
} from "@/types/enterprise-extension-framework.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { extensionRegistry } from "./extension-sdk";

/**
 * 1. Organization Management Reference Module
 */
export const OrganizationManagementModule: EnterpriseModuleDefinition = {
  manifest: {
    moduleId: "ORG_MANAGEMENT",
    platformKey: "ORGANIZATION_PLATFORM",
    name: "Enterprise Circuit & Franchise Management",
    version: "1.0.0",
    description: "Hierarchical circuit governance, regional offices, branch groups, and franchise agreements.",
    author: "CineSphere OS Core Team",
    dependencies: [],
    minPlatformCoreVersion: "3.16.0",
  },
  onInstall: async (context: SecurityActorContext) => {
    return true;
  },
  onEnable: async (context: SecurityActorContext) => {
    return true;
  },
  onDisable: async (context: SecurityActorContext) => {
    return true;
  },
  registerRoutes: (): ExtensionRouteDefinition[] => [
    {
      path: "/admin/organizations",
      label: "Circuits & Chains",
      iconName: "Building2",
      requiredRoles: ["SUPER_ADMIN"],
      requiredPermissions: ["ORG_VIEW", "ORG_MANAGE"],
      portalScope: "SUPER_ADMIN",
    },
    {
      path: "/admin/franchises",
      label: "Franchise Agreements",
      iconName: "FileSpreadsheet",
      requiredRoles: ["SUPER_ADMIN"],
      requiredPermissions: ["FRANCHISE_MANAGE"],
      portalScope: "SUPER_ADMIN",
    },
  ],
  registerPermissions: (): ExtensionPermissionDefinition[] => [
    {
      permissionKey: "ORG_VIEW",
      label: "View Organization Hierarchy",
      description: "Permission to view enterprise circuits, regional offices, and branches.",
      category: "Organization Platform",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    },
    {
      permissionKey: "ORG_MANAGE",
      label: "Manage Organization Structure",
      description: "Permission to create or modify organizations and branch links.",
      category: "Organization Platform",
      defaultRoles: ["SUPER_ADMIN"],
    },
    {
      permissionKey: "FRANCHISE_MANAGE",
      label: "Manage Franchise Agreements",
      description: "Permission to configure royalty revenue sharing and contracts.",
      category: "Organization Platform",
      defaultRoles: ["SUPER_ADMIN"],
    },
  ],
  registerBackgroundJobs: (): ExtensionBackgroundJobDefinition[] => [
    {
      jobName: "sync-branch-hierarchies",
      cronSchedule: "0 0 * * *",
      concurrencyLimit: 1,
      timeoutSeconds: 300,
      handlerStub: "OrganizationSyncWorker",
    },
  ],
};

/**
 * 2. Loyalty & Memberships Reference Module (depends on ORG_MANAGEMENT)
 */
export const LoyaltyAndMembershipsModule: EnterpriseModuleDefinition = {
  manifest: {
    moduleId: "LOYALTY_PROGRAMS",
    platformKey: "CUSTOMER_EXPERIENCE_PLATFORM",
    name: "Customer Loyalty & Cinema Passports",
    version: "1.2.0",
    description: "Points earn/burn ledger, recurring VIP memberships, and promotional gift cards.",
    author: "CineSphere Experience Team",
    dependencies: ["ORG_MANAGEMENT"],
    minPlatformCoreVersion: "3.16.0",
  },
  onInstall: async (context: SecurityActorContext) => {
    return true;
  },
  onEnable: async (context: SecurityActorContext) => {
    return true;
  },
  onDisable: async (context: SecurityActorContext) => {
    return true;
  },
  registerRoutes: (): ExtensionRouteDefinition[] => [
    {
      path: "/experience/loyalty",
      label: "Loyalty Programs",
      iconName: "Award",
      requiredRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requiredPermissions: ["LOYALTY_VIEW"],
      portalScope: "THEATRE_ADMIN",
    },
    {
      path: "/experience/memberships",
      label: "Membership Plans",
      iconName: "CreditCard",
      requiredRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requiredPermissions: ["MEMBERSHIP_MANAGE"],
      portalScope: "THEATRE_ADMIN",
    },
  ],
  registerPermissions: (): ExtensionPermissionDefinition[] => [
    {
      permissionKey: "LOYALTY_VIEW",
      label: "View Loyalty Programs",
      description: "Permission to view customer loyalty tiers and points balances.",
      category: "Customer Experience",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN", "STAFF"],
    },
    {
      permissionKey: "LOYALTY_REDEEM",
      label: "Redeem Loyalty Points",
      description: "Permission to execute points burn at checkout counters.",
      category: "Customer Experience",
      defaultRoles: ["STAFF", "THEATRE_ADMIN"],
    },
    {
      permissionKey: "MEMBERSHIP_MANAGE",
      label: "Manage Membership Tiers",
      description: "Permission to create or adjust VIP subscription tiers.",
      category: "Customer Experience",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    },
  ],
  registerBackgroundJobs: (): ExtensionBackgroundJobDefinition[] => [
    {
      jobName: "expire-stale-loyalty-points",
      cronSchedule: "0 2 * * *",
      concurrencyLimit: 2,
      timeoutSeconds: 600,
      handlerStub: "LoyaltyPointsExpiryWorker",
    },
    {
      jobName: "renew-membership-passes",
      cronSchedule: "0 1 * * *",
      concurrencyLimit: 1,
      timeoutSeconds: 1200,
      handlerStub: "MembershipBillingWorker",
    },
  ],
};

/**
 * 3. Dynamic Pricing Rules Reference Module
 */
export const DynamicPricingRulesModule: EnterpriseModuleDefinition = {
  manifest: {
    moduleId: "DYNAMIC_PRICING_RULES",
    platformKey: "PRICING_PLATFORM",
    name: "Intelligent Surge & Yield Pricing",
    version: "2.0.0",
    description: "Occupancy thresholds, weekend peak surges, and early-bird dynamic multipliers.",
    author: "CineSphere Revenue Science",
    dependencies: [],
    minPlatformCoreVersion: "3.16.0",
  },
  onInstall: async (context: SecurityActorContext) => {
    return true;
  },
  onEnable: async (context: SecurityActorContext) => {
    return true;
  },
  onDisable: async (context: SecurityActorContext) => {
    return true;
  },
  registerRoutes: (): ExtensionRouteDefinition[] => [
    {
      path: "/pricing/dynamic-rules",
      label: "Surge & Dynamic Rules",
      iconName: "TrendingUp",
      requiredRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requiredPermissions: ["PRICING_MANAGE"],
      portalScope: "THEATRE_ADMIN",
    },
  ],
  registerPermissions: (): ExtensionPermissionDefinition[] => [
    {
      permissionKey: "PRICING_MANAGE",
      label: "Manage Dynamic Pricing Rules",
      description: "Configure occupancy thresholds and surge multipliers.",
      category: "Pricing Platform",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    },
  ],
  registerBackgroundJobs: (): ExtensionBackgroundJobDefinition[] => [
    {
      jobName: "recalculate-occupancy-pricing",
      cronSchedule: "*/15 * * * *",
      concurrencyLimit: 4,
      timeoutSeconds: 180,
      handlerStub: "OccupancyPricingRecalculator",
    },
  ],
};

/**
 * 4. Device & IoT Platform Reference Module
 */
export const DeviceAndIoTModule: EnterpriseModuleDefinition = {
  manifest: {
    moduleId: "IOT_DEVICE_PLATFORM",
    platformKey: "DEVICE_PLATFORM",
    name: "Connected Auditorium & Device Hub",
    version: "1.1.0",
    description: "Auditorium environmental sensors, projector lamp monitors, digital posters, and smart kiosks.",
    author: "CineSphere Hardware Systems",
    dependencies: [],
    minPlatformCoreVersion: "3.16.0",
  },
  onInstall: async (context: SecurityActorContext) => {
    return true;
  },
  onEnable: async (context: SecurityActorContext) => {
    return true;
  },
  onDisable: async (context: SecurityActorContext) => {
    return true;
  },
  registerRoutes: (): ExtensionRouteDefinition[] => [
    {
      path: "/iot/devices",
      label: "Device Registry",
      iconName: "Cpu",
      requiredRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requiredPermissions: ["IOT_MANAGE"],
      portalScope: "THEATRE_ADMIN",
    },
    {
      path: "/iot/signage",
      label: "Digital Signage",
      iconName: "MonitorPlay",
      requiredRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
      requiredPermissions: ["SIGNAGE_MANAGE"],
      portalScope: "THEATRE_ADMIN",
    },
  ],
  registerPermissions: (): ExtensionPermissionDefinition[] => [
    {
      permissionKey: "IOT_MANAGE",
      label: "Manage IoT Hardware",
      description: "Permission to register, reboot, and inspect sensor devices.",
      category: "Device Platform",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    },
    {
      permissionKey: "SIGNAGE_MANAGE",
      label: "Manage Digital Signage Displays",
      description: "Permission to schedule movie trailer playlists on lobby displays.",
      category: "Device Platform",
      defaultRoles: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    },
  ],
  registerBackgroundJobs: (): ExtensionBackgroundJobDefinition[] => [
    {
      jobName: "poll-device-heartbeats",
      cronSchedule: "*/5 * * * *",
      concurrencyLimit: 2,
      timeoutSeconds: 60,
      handlerStub: "DeviceHeartbeatMonitor",
    },
  ],
};

/**
 * 5. Enterprise API & Integrations Reference Module
 */
export const EnterpriseApiModule: EnterpriseModuleDefinition = {
  manifest: {
    moduleId: "ENTERPRISE_APIS",
    platformKey: "INTEGRATION_PLATFORM",
    name: "Enterprise Developer APIs & Webhooks",
    version: "2.1.0",
    description: "Third-party developer credentials, granular API scopes, and event webhook subscriptions.",
    author: "CineSphere Platform Integration",
    dependencies: [],
    minPlatformCoreVersion: "3.16.0",
  },
  onInstall: async (context: SecurityActorContext) => {
    return true;
  },
  onEnable: async (context: SecurityActorContext) => {
    return true;
  },
  onDisable: async (context: SecurityActorContext) => {
    return true;
  },
  registerRoutes: (): ExtensionRouteDefinition[] => [
    {
      path: "/developer/api-keys",
      label: "API Access Keys",
      iconName: "Key",
      requiredRoles: ["SUPER_ADMIN"],
      requiredPermissions: ["API_CLIENT_MANAGE"],
      portalScope: "SUPER_ADMIN",
    },
    {
      path: "/developer/webhooks",
      label: "Webhook Subscriptions",
      iconName: "Webhook",
      requiredRoles: ["SUPER_ADMIN"],
      requiredPermissions: ["API_CLIENT_MANAGE"],
      portalScope: "SUPER_ADMIN",
    },
  ],
  registerPermissions: (): ExtensionPermissionDefinition[] => [
    {
      permissionKey: "API_CLIENT_MANAGE",
      label: "Manage API Clients & Webhooks",
      description: "Provision developer API credentials and configure external HTTP hooks.",
      category: "Integration Platform",
      defaultRoles: ["SUPER_ADMIN"],
    },
  ],
  registerBackgroundJobs: (): ExtensionBackgroundJobDefinition[] => [
    {
      jobName: "flush-webhook-delivery-log",
      cronSchedule: "0 4 * * *",
      concurrencyLimit: 1,
      timeoutSeconds: 300,
      handlerStub: "WebhookLogFlusher",
    },
  ],
};

/**
 * Register all reference enterprise modules into the registry.
 */
export async function registerDefaultEnterpriseModules(
  registry = extensionRegistry,
  enableByDefault: boolean = true
): Promise<void> {
  const modules = [
    OrganizationManagementModule,
    LoyaltyAndMembershipsModule,
    DynamicPricingRulesModule,
    DeviceAndIoTModule,
    EnterpriseApiModule,
  ];

  const systemContext: SecurityActorContext = {
    userId: "system-bootstrap",
    role: "SUPER_ADMIN",
    theatreId: undefined,
    permissions: ["*"],
    correlationId: "system-bootstrap-corr",
  };

  for (const mod of modules) {
    registry.registerModule(mod);
    if (enableByDefault) {
      // If module has dependencies, enable dependency first
      if (mod.manifest.moduleId === "LOYALTY_PROGRAMS") {
        await registry.enableModule("ORG_MANAGEMENT", systemContext);
      }
      await registry.enableModule(mod.manifest.moduleId, systemContext);
    }
  }
}
