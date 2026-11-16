/**
 * ==============================================================================
 * CineSphere OS — Hall Validation Engine
 * Phase 4 – Part 10: Pluggable Rule-Based Preflight Validation Framework
 * ==============================================================================
 */

import {
  ValidationRule,
  ValidationCategory,
  ValidationSeverity,
  ValidationPolicy,
  ValidationResultItem,
  ValidationReport,
  ValidationRuleContext,
} from "@/types/hall-validation.types";
import { StructuralObjectEngine } from "./structural-object-engine";

export type RuleEvaluationDelegate = (
  ctx: ValidationRuleContext
) => Promise<Omit<ValidationResultItem, "ruleId" | "ruleCode" | "ruleName" | "category" | "timestamp">>;

export class HallValidationEngine {
  private static registeredRules: Map<string, ValidationRule> = new Map();
  private static ruleDelegates: Map<string, RuleEvaluationDelegate> = new Map();

  static {
    HallValidationEngine.registerBuiltInRules();
  }

  /**
   * 1. Register a pluggable validation rule
   */
  public static registerRule(rule: ValidationRule, delegate: RuleEvaluationDelegate): void {
    this.registeredRules.set(rule.ruleCode, rule);
    this.ruleDelegates.set(rule.ruleCode, delegate);
  }

  /**
   * 2. List all currently registered rules
   */
  public static listRegisteredRules(): ValidationRule[] {
    return Array.from(this.registeredRules.values());
  }

  /**
   * 3. Evaluate all rules against a layout context with theatre policy overrides
   */
  public static async evaluateLayout(
    ctx: ValidationRuleContext,
    policy?: ValidationPolicy
  ): Promise<ValidationReport> {
    const reportId = `val-rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const results: ValidationResultItem[] = [];
    const timestamp = new Date().toISOString();

    for (const [ruleCode, rule] of this.registeredRules.entries()) {
      if (!rule.isActive) continue;

      const delegate = this.ruleDelegates.get(ruleCode);
      if (!delegate) continue;

      try {
        const evalRes = await delegate(ctx);

        // Apply theatre severity override if specified
        const effectiveSeverity: ValidationSeverity =
          policy?.ruleSeverityOverrides?.[ruleCode] || evalRes.severity || rule.defaultSeverity;

        results.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          ruleName: rule.name,
          category: rule.category,
          severity: effectiveSeverity,
          passed: evalRes.passed,
          message: evalRes.message,
          affectedObjectIds: evalRes.affectedObjectIds || [],
          affectedObjectNames: evalRes.affectedObjectNames || [],
          remediationGuidance: evalRes.remediationGuidance || rule.remediationGuidance,
          timestamp,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error during evaluation";
        results.push({
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          ruleName: rule.name,
          category: rule.category,
          severity: "ERROR",
          passed: false,
          message: `Evaluation failed: ${errorMessage}`,
          affectedObjectIds: [],
          affectedObjectNames: [],
          remediationGuidance: "Review layout components and retry validation.",
          timestamp,
        });
      }
    }

    // Compute summary metrics
    const totalRulesEvaluated = results.length;
    const passedRulesCount = results.filter((r) => r.passed).length;
    const errorsCount = results.filter((r) => !r.passed && r.severity === "ERROR").length;
    const warningsCount = results.filter((r) => !r.passed && r.severity === "WARNING").length;
    const infoCount = results.filter((r) => !r.passed && r.severity === "INFO").length;
    const suggestionsCount = results.filter((r) => !r.passed && r.severity === "SUGGESTION").length;

    // Any failed ERROR severity rule strictly blocks publication
    const canPublish = errorsCount === 0;

    return {
      reportId,
      layoutVersionId: ctx.layoutVersionId,
      theatreId: ctx.theatreId,
      policyApplied: {
        id: policy?.id || "default-standard",
        name: policy?.name || "Standard Cinema Egress Policy",
        level: policy?.policyLevel || "STANDARD",
      },
      canPublish,
      summary: {
        totalRulesEvaluated,
        passedRulesCount,
        errorsCount,
        warningsCount,
        infoCount,
        suggestionsCount,
        blockingIssuesCount: errorsCount,
      },
      results,
      generatedAt: timestamp,
    };
  }

  /**
   * 4. Register Built-in Core Rules
   */
  private static registerBuiltInRules(): void {
    // --------------------------------------------------------------------------
    // RULE 1: SCREEN_EXISTS
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-screen-exists",
        ruleCode: "RULE_SCREEN_EXISTS",
        name: "Cinema Screen Presence Verification",
        description: "Verifies the layout defines at least one visible SCREEN structural object.",
        category: "SCREEN",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Add a visible SCREEN structural object from the Objects Studio palette.",
      },
      async (ctx) => {
        const screens = ctx.structuralObjects.filter(
          (o) => o.objectType === "SCREEN" && o.visibility === "VISIBLE"
        );
        const passed = screens.length > 0;
        return {
          passed,
          severity: "ERROR",
          message: passed
            ? `Found ${screens.length} visible screen object(s).`
            : "No visible SCREEN structural object defined in the auditorium layout.",
          affectedObjectIds: screens.map((s) => s.id),
          affectedObjectNames: screens.map((s) => s.displayName),
          remediationGuidance: "Place a SCREEN element at the front of the auditorium.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 2: EMERGENCY_EXIT_EXISTS
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-emergency-exit",
        ruleCode: "RULE_EMERGENCY_EXIT_EXISTS",
        name: "Emergency Fire Egress Verification",
        description: "Ensures the hall layout defines visible emergency fire exit routes.",
        category: "ENTRANCE_EXIT",
        defaultSeverity: "WARNING",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Place an EMERGENCY_EXIT door element near lateral aisles.",
      },
      async (ctx) => {
        const exits = ctx.structuralObjects.filter(
          (o) => o.objectType === "EMERGENCY_EXIT" && o.visibility === "VISIBLE"
        );
        const passed = exits.length > 0;
        return {
          passed,
          severity: "WARNING",
          message: passed
            ? `Found ${exits.length} visible emergency exit(s).`
            : "Auditorium has no visible EMERGENCY_EXIT doors specified. Safety compliance recommends at least 1 exit.",
          affectedObjectIds: exits.map((e) => e.id),
          affectedObjectNames: exits.map((e) => e.displayName),
          remediationGuidance: "Add emergency fire exits along the hall boundary.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 3: ENTRANCE_EXIT_EXISTS
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-entrance-exists",
        ruleCode: "RULE_ENTRANCE_EXIT_EXISTS",
        name: "Patron Foyer Entrance & Exit Verification",
        description: "Validates patron foyer entrance and exit doors are present.",
        category: "ENTRANCE_EXIT",
        defaultSeverity: "WARNING",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Add an ENTRANCE or EXIT structural object.",
      },
      async (ctx) => {
        const doors = ctx.structuralObjects.filter(
          (o) => (o.objectType === "ENTRANCE" || o.objectType === "EXIT") && o.visibility === "VISIBLE"
        );
        const passed = doors.length > 0;
        return {
          passed,
          severity: "WARNING",
          message: passed
            ? `Found ${doors.length} foyer entrance/exit door(s).`
            : "No foyer ENTRANCE or EXIT door objects defined for customer wayfinding.",
          affectedObjectIds: doors.map((d) => d.id),
          affectedObjectNames: doors.map((d) => d.displayName),
          remediationGuidance: "Define foyer entrance and egress points for wayfinding.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 4: ACCESSIBLE_PATH_CONNECTIVITY (ADA)
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-accessible-path",
        ruleCode: "RULE_ACCESSIBLE_PATH_CONNECTIVITY",
        name: "Wheelchair Accessible Route Connectivity",
        description: "Checks that layouts containing wheelchair seating include designated ACCESSIBLE_PATH infrastructure.",
        category: "ACCESSIBILITY",
        defaultSeverity: "WARNING",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Add an ACCESSIBLE_PATH ramp object connecting foyer to wheelchair seating bays.",
      },
      async (ctx) => {
        const wheelchairSeats = ctx.seats.filter((s) => s.accessibility.isWheelchairAccessible);
        const paths = ctx.structuralObjects.filter(
          (o) => o.objectType === "ACCESSIBLE_PATH" && o.visibility === "VISIBLE"
        );

        if (wheelchairSeats.length === 0) {
          return {
            passed: true,
            severity: "INFO",
            message: "No wheelchair seats configured in this layout.",
            affectedObjectIds: [],
            affectedObjectNames: [],
            remediationGuidance: "Consider allocating designated wheelchair seating positions.",
          };
        }

        const passed = paths.length > 0;
        return {
          passed,
          severity: "WARNING",
          message: passed
            ? `Found ${paths.length} ACCESSIBLE_PATH route(s) serving ${wheelchairSeats.length} wheelchair seat(s).`
            : `Layout contains ${wheelchairSeats.length} wheelchair seat(s), but lacks an ACCESSIBLE_PATH ramp route.`,
          affectedObjectIds: wheelchairSeats.map((s) => s.id),
          affectedObjectNames: wheelchairSeats.map((s) => s.seatNumber),
          remediationGuidance: "Add an ACCESSIBLE_PATH object to ensure regulatory ADA egress compliance.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 5: SEAT_DUPLICATE_CODES
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-seat-duplicates",
        ruleCode: "RULE_SEAT_DUPLICATE_CODES",
        name: "Unique Seat Identifiers & Numbering",
        description: "Enforces strictly unique seat numbering across the entire auditorium.",
        category: "SEAT",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Renumber conflicting seats using the Automatic Seat Generator.",
      },
      async (ctx) => {
        const seen = new Map<string, string>();
        const duplicates: Array<{ id: string; num: string }> = [];

        for (const s of ctx.seats) {
          const num = s.seatNumber.trim().toUpperCase();
          if (seen.has(num)) {
            duplicates.push({ id: s.id, num });
          } else {
            seen.set(num, s.id);
          }
        }

        const passed = duplicates.length === 0;
        return {
          passed,
          severity: "ERROR",
          message: passed
            ? "All seat numbers are globally unique."
            : `Detected ${duplicates.length} duplicate seat number(s): ${duplicates.map((d) => d.num).slice(0, 5).join(", ")}.`,
          affectedObjectIds: duplicates.map((d) => d.id),
          affectedObjectNames: duplicates.map((d) => d.num),
          remediationGuidance: "Run the row seat renumbering tool to eliminate duplicate identifiers.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 6: SEAT_COORDINATES_BOUNDS
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-seat-bounds",
        ruleCode: "RULE_SEAT_COORDINATES_BOUNDS",
        name: "Seat Canvas Boundary Containment",
        description: "Verifies all seat templates reside within the allowable canvas dimensions.",
        category: "GEOMETRY",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Move out-of-bounds seats inside the canvas boundary.",
      },
      async (ctx) => {
        const outOfBounds: Array<{ id: string; num: string }> = [];

        for (const s of ctx.seats) {
          if (
            s.coordinates.x < 0 ||
            s.coordinates.y < 0 ||
            s.coordinates.x > ctx.canvasBounds.width ||
            s.coordinates.y > ctx.canvasBounds.height
          ) {
            outOfBounds.push({ id: s.id, num: s.seatNumber });
          }
        }

        const passed = outOfBounds.length === 0;
        return {
          passed,
          severity: "ERROR",
          message: passed
            ? "All seats are contained within legal canvas dimensions."
            : `${outOfBounds.length} seat(s) placed outside canvas bounds (${ctx.canvasBounds.width}x${ctx.canvasBounds.height}).`,
          affectedObjectIds: outOfBounds.map((o) => o.id),
          affectedObjectNames: outOfBounds.map((o) => o.num),
          remediationGuidance: "Drag out-of-bounds seats back onto the active grid.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 7: STRUCTURAL_OBSTACLE_COLLISION (SAT Math)
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-obstacle-collision",
        ruleCode: "RULE_STRUCTURAL_OBSTACLE_COLLISION",
        name: "Structural Obstacle Physical Collision Avoidance",
        description: "Uses the Separating Axis Theorem (SAT) to detect collisions between structural obstacles and seats.",
        category: "STRUCTURAL",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Move colliding seats or obstacles to clear physical clearances.",
      },
      async (ctx) => {
        // Map ctx seats and structural objects to engine types
        const collisionObstacles = ctx.structuralObjects.filter(
          (o) => o.metadata.isCollisionObstacle && o.visibility !== "HIDDEN"
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCollisions = StructuralObjectEngine.detectObstacleSeatCollisions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collisionObstacles as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ctx.seats as any
        );

        const passed = rawCollisions.length === 0;
        return {
          passed,
          severity: "ERROR",
          message: passed
            ? "Zero physical collisions detected between structural obstacles and seating."
            : `Detected ${rawCollisions.length} collision(s) between seats and physical obstacles (e.g., ${rawCollisions[0]?.description}).`,
          affectedObjectIds: rawCollisions.map((c) => c.collidingTargetId),
          affectedObjectNames: rawCollisions.map((c) => `${c.objectName} vs ${c.collidingTargetId}`),
          remediationGuidance: "Ensure pillars, stages, and partition walls do not overlap customer seats.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 8: SECTION_CAPACITY_PARITY
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-section-capacity",
        ruleCode: "RULE_SECTION_CAPACITY_PARITY",
        name: "Section Capacity & Row Seat Count Parity",
        description: "Validates that declared section capacities match the actual sum of row seats.",
        category: "SECTION",
        defaultSeverity: "WARNING",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Synchronize section capacity with row seat count.",
      },
      async (ctx) => {
        const disparities: string[] = [];
        const affectedIds: string[] = [];

        for (const sec of ctx.sections) {
          const rowSeatsSum = sec.rows.reduce((sum, r) => sum + r.seatCount, 0);
          if (sec.capacity !== rowSeatsSum && sec.rows.length > 0) {
            disparities.push(`Section '${sec.name}' capacity (${sec.capacity}) != row seats (${rowSeatsSum})`);
            affectedIds.push(sec.id);
          }
        }

        const passed = disparities.length === 0;
        return {
          passed,
          severity: "WARNING",
          message: passed
            ? "All section capacities match their constituent row seats."
            : `Capacity mismatch: ${disparities.join("; ")}.`,
          affectedObjectIds: affectedIds,
          affectedObjectNames: disparities,
          remediationGuidance: "Update section capacity or adjust row seat counts in Section Designer.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 9: SEAT_CATEGORY_ASSIGNMENT
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-seat-category",
        ruleCode: "RULE_SEAT_CATEGORY_ASSIGNMENT",
        name: "Seat Category Assignment Integrity",
        description: "Verifies every seat template has a valid category code assigned.",
        category: "SEAT",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Assign a pricing category to all unassigned seats.",
      },
      async (ctx) => {
        const unassigned = ctx.seats.filter(
          (s) =>
            (!s.categoryCode || s.categoryCode.trim() === "") &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !(s as any).seatType
        );
        const passed = unassigned.length === 0;

        return {
          passed,
          severity: "ERROR",
          message: passed
            ? "Every seat has a valid seat category assigned."
            : `${unassigned.length} seat(s) lack a pricing category assignment.`,
          affectedObjectIds: unassigned.map((s) => s.id),
          affectedObjectNames: unassigned.map((s) => s.seatNumber),
          remediationGuidance: "Select unassigned seats and apply a category in the Category Registry.",
        };
      }
    );

    // --------------------------------------------------------------------------
    // RULE 10: ROW_SPACING_INTEGRITY
    // --------------------------------------------------------------------------
    this.registerRule(
      {
        id: "rule-row-spacing",
        ruleCode: "RULE_ROW_SPACING_INTEGRITY",
        name: "Row Spacing & Pitch Integrity",
        description: "Ensures positive vertical pitch and legroom spacing between rows.",
        category: "ROW",
        defaultSeverity: "ERROR",
        isSystemRule: true,
        isActive: true,
        remediationGuidance: "Set row spacing to at least 20px (~0.8m legroom).",
      },
      async (ctx) => {
        const invalidRows: Array<{ id: string; name: string }> = [];

        for (const sec of ctx.sections) {
          for (const row of sec.rows) {
            if (row.spacing <= 0) {
              invalidRows.push({ id: row.id, name: row.rowName });
            }
          }
        }

        const passed = invalidRows.length === 0;
        return {
          passed,
          severity: "ERROR",
          message: passed
            ? "All rows maintain valid legroom spacing pitch."
            : `${invalidRows.length} row(s) specify non-positive legroom spacing.`,
          affectedObjectIds: invalidRows.map((r) => r.id),
          affectedObjectNames: invalidRows.map((r) => r.name),
          remediationGuidance: "Adjust row pitch in the Row Designer to a positive value.",
        };
      }
    );
  }
}
