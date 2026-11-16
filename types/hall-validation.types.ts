/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Engine Types
 * Phase 4 – Part 10: Pluggable Rule-Based Preflight Validation Framework
 * ==============================================================================
 */

/**
 * Severity level of a validation rule or evaluated check
 */
export type ValidationSeverity = "ERROR" | "WARNING" | "INFO" | "SUGGESTION";

/**
 * Categorical domains for validation rules
 */
export type ValidationCategory =
  | "SCREEN"
  | "ENTRANCE_EXIT"
  | "SEAT"
  | "ROW"
  | "SECTION"
  | "STRUCTURAL"
  | "ACCESSIBILITY"
  | "GEOMETRY"
  | "PUBLISH"
  | "TENANT";

/**
 * Strictness policy level configured per theatre
 */
export type ValidationPolicyLevel = "STRICT" | "STANDARD" | "PREMIUM";

/**
 * Pluggable Validation Rule Definition
 */
export interface ValidationRule {
  id: string;
  ruleCode: string;
  name: string;
  description: string;
  category: ValidationCategory;
  defaultSeverity: ValidationSeverity;
  isSystemRule: boolean;
  isActive: boolean;
  remediationGuidance: string;
}

/**
 * Theatre-specific validation policy with severity overrides
 */
export interface ValidationPolicy {
  id: string;
  theatreId: string;
  name: string;
  policyLevel: ValidationPolicyLevel;
  ruleSeverityOverrides: Record<string, ValidationSeverity>; // ruleCode -> override severity
  isDefault: boolean;
  description?: string;
}

/**
 * Result of a single rule execution against a layout
 */
export interface ValidationResultItem {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  affectedObjectIds: string[];
  affectedObjectNames: string[];
  remediationGuidance: string;
  timestamp: string;
}

/**
 * Machine-readable and UI-friendly consolidated validation report
 */
export interface ValidationReport {
  reportId: string;
  layoutVersionId: string;
  theatreId: string;
  policyApplied: {
    id: string;
    name: string;
    level: ValidationPolicyLevel;
  };
  canPublish: boolean;
  summary: {
    totalRulesEvaluated: number;
    passedRulesCount: number;
    errorsCount: number;
    warningsCount: number;
    infoCount: number;
    suggestionsCount: number;
    blockingIssuesCount: number;
  };
  results: ValidationResultItem[];
  generatedAt: string;
  evaluatedBy?: string;
}

/**
 * Theatre validation preferences and configuration
 */
export interface ValidationConfiguration {
  id?: string;
  theatreId: string;
  strictMode: boolean;
  requireAccessibility: boolean;
  requireEmergencyExit: boolean;
  requireScreen: boolean;
  geometryStrictness: "LOW" | "MEDIUM" | "HIGH";
  allowPublishWithWarnings: boolean;
  maxSeatCapacityLimit?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Context input passed to rule execution delegates
 */
export interface ValidationRuleContext {
  theatreId: string;
  layoutVersionId: string;
  layoutDefinitionName?: string;
  canvasBounds: { width: number; height: number };
  sections: Array<{
    id: string;
    name: string;
    capacity: number;
    category: string;
    rows: Array<{
      id: string;
      rowName: string;
      seatCount: number;
      spacing: number;
    }>;
  }>;
  seats: Array<{
    id: string;
    seatNumber: string;
    rowId: string;
    sectionId: string;
    coordinates: { x: number; y: number; width: number; height: number; rotation: number };
    accessibility: { isWheelchairAccessible: boolean; hasCompanionSeat: boolean; hasAccessibleRoute?: boolean };
    categoryCode: string;
    status: string;
  }>;
  structuralObjects: Array<{
    id: string;
    objectName: string;
    displayName: string;
    objectType: string;
    internalCode: string;
    position: { x: number; y: number; z?: number };
    width: number;
    height: number;
    rotation: number;
    visibility: string;
    isLocked: boolean;
    metadata: {
      isStatic?: boolean;
      isCollisionObstacle?: boolean;
      isReservedArea?: boolean;
    };
  }>;
}
