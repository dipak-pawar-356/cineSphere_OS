/**
 * ==============================================================================
 * CineSphere OS — 4-Tier Enterprise Feature Flag Manager (Phase 3 – Part 16)
 * ==============================================================================
 * Centralized hierarchical feature flag resolution engine with cascading inheritance
 * and overrides across 4 tiers:
 *   Tier 1: User / Staff Override (highest priority)
 *   Tier 2: Theatre / Venue Override
 *   Tier 3: Organization / Circuit Override
 *   Tier 4: Global Platform Core Switch
 * Fallback: Default Flag Configuration
 * Also supports canary rollout percentages for phased enterprise releases.
 * ==============================================================================
 */

import {
  EnterpriseFeatureFlag,
  FeatureFlagLevel,
  FeatureFlagScope,
  ResolvedFeatureFlag,
} from "@/types/enterprise-extension-framework.types";

export class EnterpriseFeatureFlagManager {
  private static instance: EnterpriseFeatureFlagManager | null = null;
  private flags: Map<string, EnterpriseFeatureFlag> = new Map();

  private constructor() {
    this.seedDefaultFlags();
  }

  public static getInstance(): EnterpriseFeatureFlagManager {
    if (!EnterpriseFeatureFlagManager.instance) {
      EnterpriseFeatureFlagManager.instance = new EnterpriseFeatureFlagManager();
    }
    return EnterpriseFeatureFlagManager.instance;
  }

  /**
   * Deterministic hash function for canary percentage rollouts.
   */
  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Register or update a feature flag definition.
   */
  public registerFlag(flag: EnterpriseFeatureFlag): void {
    this.flags.set(flag.flagKey, { ...flag });
  }

  /**
   * Retrieve a feature flag definition.
   */
  public getFlag(flagKey: string): EnterpriseFeatureFlag | undefined {
    return this.flags.get(flagKey);
  }

  /**
   * List all registered feature flags.
   */
  public listFlags(): EnterpriseFeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Resolve effective flag value using 4-Tier cascading precedence:
   * 1. USER override
   * 2. THEATRE override
   * 3. ORGANIZATION override
   * 4. PLATFORM global switch
   * 5. DEFAULT value
   */
  public resolveFlag<T = boolean | string | number | Record<string, unknown>>(
    flagKey: string,
    scope: FeatureFlagScope = {}
  ): ResolvedFeatureFlag & { value: T } {
    const flag = this.flags.get(flagKey);

    if (!flag) {
      return {
        flagKey,
        effectiveValue: false,
        resolvedLevel: "DEFAULT",
        scope,
        isOverridden: false,
        value: false as unknown as T,
      };
    }

    // 1. Tier 1: User / Staff Override
    if (scope.userId && flag.userOverrides[scope.userId] !== undefined) {
      const val = flag.userOverrides[scope.userId];
      return {
        flagKey,
        effectiveValue: val,
        resolvedLevel: "USER",
        scope,
        isOverridden: true,
        value: val as T,
      };
    }

    // 2. Tier 2: Theatre / Venue Override
    if (scope.theatreId && flag.theatreOverrides[scope.theatreId] !== undefined) {
      const val = flag.theatreOverrides[scope.theatreId];
      return {
        flagKey,
        effectiveValue: val,
        resolvedLevel: "THEATRE",
        scope,
        isOverridden: true,
        value: val as T,
      };
    }

    // 3. Tier 3: Organization / Circuit Override
    if (scope.organizationId && flag.organizationOverrides[scope.organizationId] !== undefined) {
      const val = flag.organizationOverrides[scope.organizationId];
      return {
        flagKey,
        effectiveValue: val,
        resolvedLevel: "ORGANIZATION",
        scope,
        isOverridden: true,
        value: val as T,
      };
    }

    // Canary rollout percentage check if platform is enabled but rollout is constrained
    if (
      flag.platformEnabled &&
      flag.rolloutPercentage !== undefined &&
      flag.rolloutPercentage < 100
    ) {
      const targetEntity = scope.userId || scope.theatreId || scope.organizationId;
      if (targetEntity) {
        const hashVal = this.hashKey(`${flagKey}:${targetEntity}`);
        const inCanary = hashVal < flag.rolloutPercentage;
        return {
          flagKey,
          effectiveValue: inCanary,
          resolvedLevel: "PLATFORM",
          scope,
          isOverridden: false,
          value: inCanary as unknown as T,
        };
      }
    }

    // 4. Tier 4: Platform Core Switch
    if (!flag.platformEnabled) {
      return {
        flagKey,
        effectiveValue: false,
        resolvedLevel: "PLATFORM",
        scope,
        isOverridden: false,
        value: false as unknown as T,
      };
    }

    // 5. Default Fallback
    return {
      flagKey,
      effectiveValue: flag.defaultValue,
      resolvedLevel: "DEFAULT",
      scope,
      isOverridden: false,
      value: flag.defaultValue as T,
    };
  }

  /**
   * Set the global Platform-level switch for a flag.
   */
  public setPlatformFlag(flagKey: string, enabled: boolean): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    flag.platformEnabled = enabled;
    return true;
  }

  /**
   * Set Organization-level override.
   */
  public setOrganizationOverride(
    flagKey: string,
    organizationId: string,
    value: boolean | string | number | Record<string, unknown>
  ): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    flag.organizationOverrides[organizationId] = value;
    return true;
  }

  /**
   * Set Theatre-level override.
   */
  public setTheatreOverride(
    flagKey: string,
    theatreId: string,
    value: boolean | string | number | Record<string, unknown>
  ): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    flag.theatreOverrides[theatreId] = value;
    return true;
  }

  /**
   * Set User-level override.
   */
  public setUserOverride(
    flagKey: string,
    userId: string,
    value: boolean | string | number | Record<string, unknown>
  ): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;
    flag.userOverrides[userId] = value;
    return true;
  }

  /**
   * Remove an override at a specified tier.
   */
  public removeOverride(
    flagKey: string,
    level: FeatureFlagLevel,
    targetId: string
  ): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag) return false;

    if (level === "USER") {
      delete flag.userOverrides[targetId];
      return true;
    }
    if (level === "THEATRE") {
      delete flag.theatreOverrides[targetId];
      return true;
    }
    if (level === "ORGANIZATION") {
      delete flag.organizationOverrides[targetId];
      return true;
    }
    return false;
  }

  /**
   * Seed default feature flags for all enterprise sub-platforms.
   */
  private seedDefaultFlags(): void {
    const defaultFlags: EnterpriseFeatureFlag[] = [
      {
        flagKey: "enterprise.organization_hierarchy",
        name: "Enterprise Multi-Branch Organization Hierarchy",
        description: "Enables multi-branch cinema chains, regional offices, and branch grouping.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "ORG_MANAGEMENT",
      },
      {
        flagKey: "enterprise.franchise_management",
        name: "Franchise Operations & Revenue Sharing",
        description: "Enables franchise owner accounts and automated royalty revenue splits.",
        valueType: "BOOLEAN",
        defaultValue: false,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "FRANCHISE_MANAGEMENT",
      },
      {
        flagKey: "enterprise.corporate_accounts",
        name: "B2B Corporate Credit Accounts",
        description: "Enables post-paid corporate invoicing and bulk credit balances.",
        valueType: "BOOLEAN",
        defaultValue: false,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "CORPORATE_ACCOUNTS",
      },
      {
        flagKey: "enterprise.memberships",
        name: "Cinema Passport & Recurring Memberships",
        description: "Enables VIP tiered customer subscriptions and monthly complimentary tickets.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "MEMBERSHIPS",
      },
      {
        flagKey: "enterprise.loyalty_rewards",
        name: "Customer Loyalty Points & Tiering",
        description: "Enables points accrual per booking and concession burn redemption.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "LOYALTY_PROGRAMS",
      },
      {
        flagKey: "enterprise.dynamic_pricing",
        name: "Rule-Based Dynamic & Surge Pricing",
        description: "Evaluates demand surge, holiday multipliers, and occupancy pricing rules.",
        valueType: "BOOLEAN",
        defaultValue: false,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "DYNAMIC_PRICING_RULES",
      },
      {
        flagKey: "enterprise.ai_recommendations",
        name: "AI-Powered Movie & Seat Recommendations",
        description: "Enables ML-driven personalized movie suggestions and concession upsells.",
        valueType: "BOOLEAN",
        defaultValue: false,
        platformEnabled: false, // Canary/experimental
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        rolloutPercentage: 20,
        moduleId: "AI_RECOMMENDATIONS",
      },
      {
        flagKey: "enterprise.iot_device_platform",
        name: "IoT Hardware & Telemetry Monitoring",
        description: "Enables hardware registry, environmental sensors, and projector telemetry.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "IOT_DEVICE_PLATFORM",
      },
      {
        flagKey: "enterprise.digital_signage",
        name: "Lobby Digital Signage & Poster Sync",
        description: "Enables automated digital poster boards and auditorium entrance displays.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "DIGITAL_SIGNAGE",
      },
      {
        flagKey: "enterprise.smart_kiosks",
        name: "Self-Service Smart Kiosks & QR Scanning",
        description: "Enables unattended ticketing kiosks and gate turnstiles.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "SMART_KIOSKS",
      },
      {
        flagKey: "enterprise.facial_recognition",
        name: "Biometric Facial Check-In (Privacy Compliant)",
        description: "Opt-in VIP patron recognition and hands-free turnstile validation.",
        valueType: "BOOLEAN",
        defaultValue: false,
        platformEnabled: false,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "FACIAL_RECOGNITION_STUB",
      },
      {
        flagKey: "enterprise.developer_apis",
        name: "Enterprise Developer REST & Webhook APIs",
        description: "Enables secure external API keys and asynchronous webhook delivery.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "ENTERPRISE_APIS",
      },
      {
        flagKey: "enterprise.multi_region",
        name: "Multi-Region Jurisdictions & Currency Stacks",
        description: "Enables cross-border compliance, multi-currency pricing, and tax frameworks.",
        valueType: "BOOLEAN",
        defaultValue: true,
        platformEnabled: true,
        organizationOverrides: {},
        theatreOverrides: {},
        userOverrides: {},
        moduleId: "MULTI_REGION_DEPLOYMENT",
      },
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.flagKey, flag);
    }
  }

  /**
   * Reset all flags to defaults (for testing).
   */
  public reset(): void {
    this.flags.clear();
    this.seedDefaultFlags();
  }
}

export const featureFlags = EnterpriseFeatureFlagManager.getInstance();
