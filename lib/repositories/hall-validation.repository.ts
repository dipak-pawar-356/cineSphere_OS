/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Repository
 * Phase 4 – Part 10: Pluggable Rule Registry, Policies & Audit Logs
 * ==============================================================================
 */

import {
  ValidationRule,
  ValidationPolicy,
  ValidationReport,
  ValidationConfiguration,
} from "@/types/hall-validation.types";
import { HallValidationEngine } from "../engine/hall-validation-engine";

export class HallValidationRepository {
  private static instance: HallValidationRepository | null = null;

  private policiesStore: Map<string, ValidationPolicy> = new Map();
  private configurationsStore: Map<string, ValidationConfiguration> = new Map();
  private auditReportsStore: Map<string, ValidationReport> = new Map();

  private constructor() {
    this.seedTheatrePolicies();
  }

  public static getInstance(): HallValidationRepository {
    if (!HallValidationRepository.instance) {
      HallValidationRepository.instance = new HallValidationRepository();
    }
    return HallValidationRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Pluggable Rules Registry
  // ----------------------------------------------------------------------------

  public async listRules(): Promise<ValidationRule[]> {
    return HallValidationEngine.listRegisteredRules();
  }

  // ----------------------------------------------------------------------------
  // 2. Validation Policies (Per Theatre)
  // ----------------------------------------------------------------------------

  public async getPolicy(theatreId: string): Promise<ValidationPolicy> {
    const existing = Array.from(this.policiesStore.values()).find(
      (p) => p.theatreId === theatreId && p.isDefault
    );
    if (existing) return { ...existing };

    // Fallback standard policy
    const fallback: ValidationPolicy = {
      id: `pol-${theatreId}-standard`,
      theatreId,
      name: "Standard Safety & Egress Policy",
      policyLevel: "STANDARD",
      ruleSeverityOverrides: {},
      isDefault: true,
      description: "Default cinema hall validation policy enforcing screen presence and zero collisions.",
    };
    this.policiesStore.set(fallback.id, fallback);
    return fallback;
  }

  public async savePolicy(
    theatreId: string,
    policy: Partial<ValidationPolicy>
  ): Promise<ValidationPolicy> {
    const current = await this.getPolicy(theatreId);
    const updated: ValidationPolicy = {
      ...current,
      ...policy,
      theatreId,
    };
    this.policiesStore.set(updated.id, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // 3. Validation Configurations
  // ----------------------------------------------------------------------------

  public async getConfiguration(theatreId: string): Promise<ValidationConfiguration> {
    const existing = this.configurationsStore.get(theatreId);
    if (existing) return { ...existing };

    const fallback: ValidationConfiguration = {
      theatreId,
      strictMode: false,
      requireAccessibility: true,
      requireEmergencyExit: true,
      requireScreen: true,
      geometryStrictness: "MEDIUM",
      allowPublishWithWarnings: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.configurationsStore.set(theatreId, fallback);
    return fallback;
  }

  public async saveConfiguration(
    theatreId: string,
    updates: Partial<ValidationConfiguration>
  ): Promise<ValidationConfiguration> {
    const current = await this.getConfiguration(theatreId);
    const updated: ValidationConfiguration = {
      ...current,
      ...updates,
      theatreId,
      updatedAt: new Date().toISOString(),
    };
    this.configurationsStore.set(theatreId, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // 4. Persisted Validation Reports & Audit Trail
  // ----------------------------------------------------------------------------

  public async saveReport(report: ValidationReport): Promise<ValidationReport> {
    this.auditReportsStore.set(report.reportId, { ...report });
    return { ...report };
  }

  public async getLatestReport(
    theatreId: string,
    layoutVersionId: string
  ): Promise<ValidationReport | null> {
    const reports = Array.from(this.auditReportsStore.values())
      .filter((r) => r.theatreId === theatreId && r.layoutVersionId === layoutVersionId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return reports[0] ? { ...reports[0] } : null;
  }

  // ----------------------------------------------------------------------------
  // 5. Default Seeds
  // ----------------------------------------------------------------------------

  private seedTheatrePolicies(): void {
    // --------------------------------------------------------------------------
    // Theatre A: Pune Galaxy Multiplex (th-pun-001)
    // Strict Validation: Enabled, Accessibility Required: Yes (ERROR), Emergency Exit: Yes (ERROR)
    // --------------------------------------------------------------------------
    this.policiesStore.set("pol-pune-strict", {
      id: "pol-pune-strict",
      theatreId: "th-pun-001",
      name: "Pune Municipal Safety Code (Strict)",
      policyLevel: "STRICT",
      ruleSeverityOverrides: {
        RULE_ACCESSIBLE_PATH_CONNECTIVITY: "ERROR", // Promoted to blocking error
        RULE_EMERGENCY_EXIT_EXISTS: "ERROR", // Promoted to blocking error
      },
      isDefault: true,
      description: "Strict safety code requiring dedicated wheelchair paths and dual emergency fire exits.",
    });

    this.configurationsStore.set("th-pun-001", {
      theatreId: "th-pun-001",
      strictMode: true,
      requireAccessibility: true,
      requireEmergencyExit: true,
      requireScreen: true,
      geometryStrictness: "HIGH",
      allowPublishWithWarnings: false, // Strict mode blocks on any critical warning
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // --------------------------------------------------------------------------
    // Theatre B: Mumbai IMAX (th-mum-002)
    // Standard Validation, Accessibility Required: Yes, Geometry Strictness: Medium
    // --------------------------------------------------------------------------
    this.policiesStore.set("pol-mumbai-standard", {
      id: "pol-mumbai-standard",
      theatreId: "th-mum-002",
      name: "Mumbai Standard Cinema Code",
      policyLevel: "STANDARD",
      ruleSeverityOverrides: {
        RULE_ACCESSIBLE_PATH_CONNECTIVITY: "ERROR",
        RULE_EMERGENCY_EXIT_EXISTS: "WARNING",
      },
      isDefault: true,
      description: "Standard cinema egress rules requiring wheelchair accessible routes.",
    });

    this.configurationsStore.set("th-mum-002", {
      theatreId: "th-mum-002",
      strictMode: false,
      requireAccessibility: true,
      requireEmergencyExit: false,
      requireScreen: true,
      geometryStrictness: "MEDIUM",
      allowPublishWithWarnings: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // --------------------------------------------------------------------------
    // Theatre C: Dubai Grand Mall (th-dxb-003)
    // Premium Validation, Maximum Strictness, Additional Internal Rules Enabled
    // --------------------------------------------------------------------------
    this.policiesStore.set("pol-dubai-premium", {
      id: "pol-dubai-premium",
      theatreId: "th-dxb-003",
      name: "Dubai Civil Defense & Luxury Code (Premium)",
      policyLevel: "PREMIUM",
      ruleSeverityOverrides: {
        RULE_ACCESSIBLE_PATH_CONNECTIVITY: "ERROR",
        RULE_EMERGENCY_EXIT_EXISTS: "ERROR",
        RULE_ENTRANCE_EXIT_EXISTS: "ERROR",
        RULE_SECTION_CAPACITY_PARITY: "ERROR", // Strict capacity parity
      },
      isDefault: true,
      description: "Premium hospitality and safety policy enforcing total regulatory compliance.",
    });

    this.configurationsStore.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      strictMode: true,
      requireAccessibility: true,
      requireEmergencyExit: true,
      requireScreen: true,
      geometryStrictness: "HIGH",
      allowPublishWithWarnings: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

export const hallValidationRepository = HallValidationRepository.getInstance();
