/**
 * ==============================================================================
 * CineSphere OS — Central 9-Stage Validation Pipeline Engine (Phase 3 – Part 14)
 * ==============================================================================
 * Guarantees uniform, deterministic security execution across all current and future
 * CineSphere OS modules. Executes in strict sequential order:
 *
 * 1. Authentication Check
 * 2. Policy-Based Authorization (RBAC)
 * 3. Tenant Boundary Isolation
 * 4. Resource Ownership Validation
 * 5. Input Sanitization & Schema Validation (Zod)
 * 6. Theatre-Specific Business Rule Validation
 * 7. Optimistic Concurrency Control Check (OCC)
 * 8. Domain Operation Execution
 * 9. Domain Event Auditing & Activity History Recording
 * ==============================================================================
 */

import { z } from "zod";
import {
  PipelineStage,
  PipelineStageResult,
  PipelineContext,
  ValidationPipelineInput,
  ValidationPipelineResult,
  DomainSecurityEvent,
} from "@/types/theatre-security-governance.types";
import { assertSecurityPolicy } from "./policies/theatre-security-policies";
import { OwnershipValidator } from "./ownership-validator";
import { tenantService } from "@/lib/services/tenant.service";
import { theatreGovernanceRepository } from "@/lib/repositories/theatre-governance.repository";
import { sanitizeObject } from "./input-sanitizer";
import { validateServerInput } from "./validation-schemas";
import { createLogger } from "@/lib/observability/structured-logger";
import {
  AppError,
  AuthenticationError,
  BusinessRuleError,
} from "@/lib/errors/app-error";

const logger = createLogger("ValidationPipeline");

export class ValidationPipeline {
  /**
   * Executes a domain operation through the standardized 9-stage validation pipeline.
   */
  public static async execute<TInput, TOutput>(
    input: ValidationPipelineInput<TInput>,
    handler: (validatedInput: TInput, ctx: PipelineContext) => Promise<TOutput>
  ): Promise<ValidationPipelineResult<TOutput>> {
    const startTime = Date.now();
    const correlationId = input.actor.correlationId || `corr-${Date.now()}`;
    const stageResults: PipelineStageResult[] = [];

    // Helper to benchmark each stage
    const runStage = async (
      stage: PipelineStage,
      fn: () => Promise<void> | void
    ): Promise<void> => {
      const sStart = Date.now();
      try {
        await fn();
        stageResults.push({
          stage,
          passed: true,
          durationMs: Date.now() - sStart,
        });
      } catch (err: unknown) {
        stageResults.push({
          stage,
          passed: false,
          durationMs: Date.now() - sStart,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
    };

    let sanitizedInput: TInput = input.rawInput;
    let validatedInput: TInput = input.rawInput;
    let resultData: TOutput | undefined;
    let previousVersion: number | undefined;
    let newVersion: number | undefined;

    // Resolve active theatre security configuration
    const theatreConfig =
      input.theatreConfig ||
      theatreGovernanceRepository.getSecurityConfiguration(input.targetTenantId);

    const pipelineContext: PipelineContext = {
      actor: input.actor,
      correlationId,
      targetTenantId: input.targetTenantId,
      theatreConfig,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      expectedVersion: input.expectedVersion,
    };

    try {
      // ------------------------------------------------------------------------
      // Stage 1: Authentication Check
      // ------------------------------------------------------------------------
      await runStage("1_AUTHENTICATION", () => {
        if (!input.actor || !input.actor.userId || input.actor.userId.trim() === "") {
          throw new AuthenticationError(
            "Authentication required: Invalid or missing actor identity in security context.",
            correlationId
          );
        }
      });

      // ------------------------------------------------------------------------
      // Stage 2: Policy-Based Authorization (RBAC)
      // ------------------------------------------------------------------------
      await runStage("2_POLICY_AUTHORIZATION", () => {
        assertSecurityPolicy(input.policyKey, input.actor, {
          targetTenantId: input.targetTenantId,
          resourceId: input.resourceId,
          resourceType: input.resourceType,
          theatreConfig,
        });
      });

      // ------------------------------------------------------------------------
      // Stage 3: Tenant Boundary Isolation
      // ------------------------------------------------------------------------
      await runStage("3_TENANT_ISOLATION", async () => {
        await tenantService.assertTenantAccess(input.actor, input.targetTenantId);
      });

      // ------------------------------------------------------------------------
      // Stage 4: Resource Ownership Validation
      // ------------------------------------------------------------------------
      await runStage("4_OWNERSHIP_VALIDATION", () => {
        if (input.resourceId) {
          OwnershipValidator.assertResourceOwnership(
            input.targetTenantId,
            input.resourceType,
            input.resourceId,
            input.actor
          );
        }
      });

      // ------------------------------------------------------------------------
      // Stage 5: Input Sanitization & Schema Validation (Zod)
      // ------------------------------------------------------------------------
      await runStage("5_INPUT_VALIDATION", () => {
        sanitizedInput = sanitizeObject(input.rawInput);
        validatedInput = input.schema
          ? validateServerInput(input.schema, sanitizedInput, correlationId)
          : sanitizedInput;
      });

      // ------------------------------------------------------------------------
      // Stage 6: Theatre-Specific Business Rule Validation
      // ------------------------------------------------------------------------
      await runStage("6_THEATRE_RULES", async () => {
        // Enforce max staff limit if action is staff assignment/creation
        if (
          input.module === "THEATRE_STAFF" &&
          (input.action.includes("CREATE") || input.action.includes("ASSIGN") || input.action.includes("INVITE"))
        ) {
          const currentStaff = (sanitizedInput as any)?.currentStaffCount || 10;
          if (currentStaff >= theatreConfig.maxStaffCount) {
            throw new BusinessRuleError(
              `Theatre '${input.targetTenantId}' has reached its maximum staff capacity (${theatreConfig.maxStaffCount} active members). Upgrade tier or modify quota.`,
              "STAFF_QUOTA_EXCEEDED",
              correlationId
            );
          }
        }

        // Run custom business rule callbacks
        if (input.customBusinessRules) {
          for (const rule of input.customBusinessRules) {
            await rule(validatedInput, pipelineContext);
          }
        }
      });

      // ------------------------------------------------------------------------
      // Stage 7: Optimistic Concurrency Control Check (OCC)
      // ------------------------------------------------------------------------
      await runStage("7_CONCURRENCY_CHECK", () => {
        if (input.resourceId) {
          const existingVersion = theatreGovernanceRepository.getResourceVersion(
            input.targetTenantId,
            input.resourceType,
            input.resourceId
          );
          previousVersion = existingVersion?.version;

          if (input.expectedVersion !== undefined) {
            const updatedRecord = theatreGovernanceRepository.checkAndIncrementVersion(
              input.targetTenantId,
              input.resourceType,
              input.resourceId,
              input.expectedVersion,
              input.actor
            );
            newVersion = updatedRecord.version;
            pipelineContext.currentVersion = newVersion;
          }
        }
      });

      // ------------------------------------------------------------------------
      // Stage 8: Domain Operation Execution
      // ------------------------------------------------------------------------
      await runStage("8_EXECUTION", async () => {
        resultData = await handler(validatedInput, pipelineContext);
      });

      // ------------------------------------------------------------------------
      // Stage 9: Domain Event Auditing & Activity History Recording
      // ------------------------------------------------------------------------
      await runStage("9_DOMAIN_AUDIT", () => {
        const domainEvent: DomainSecurityEvent = {
          eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventType: this.inferEventType(input.action, input.module),
          theatreId: input.targetTenantId,
          resourceType: input.resourceType,
          resourceId: input.resourceId || "primary",
          actor: input.actor,
          action: input.action,
          module: input.module,
          previousVersion,
          currentVersion: newVersion || (previousVersion ? previousVersion + 1 : 1),
          metadata: {
            operationName: input.operationName,
            correlationId,
            durationMs: Date.now() - startTime,
          },
          timestamp: new Date().toISOString(),
        };

        // Record to in-memory immutable audit ledger
        theatreGovernanceRepository.recordDomainEvent(domainEvent);

        // Record to chronological activity history
        theatreGovernanceRepository.recordActivity({
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          theatreId: input.targetTenantId,
          resourceType: input.resourceType,
          resourceId: input.resourceId || "primary",
          action: input.action,
          module: input.module,
          userId: input.actor.userId,
          userName: input.actor.name || "CineSphere Operator",
          userRole: input.actor.role,
          timestamp: new Date().toISOString(),
          previousVersionPlaceholder: previousVersion,
          currentVersionPlaceholder: newVersion || (previousVersion ? previousVersion + 1 : 1),
          details: `[${input.module}] Executed '${input.operationName}' on '${input.resourceType}'`,
          metadata: { correlationId },
        });

        logger.info("AUDIT", `[GOVERNANCE] ${input.action} on ${input.resourceType} (${input.targetTenantId})`, {
          theatreId: input.targetTenantId,
          userId: input.actor.userId,
          userRole: input.actor.role,
          correlationId,
          durationMs: Date.now() - startTime,
        });
      });

      return {
        success: true,
        data: resultData,
        stageResults,
        totalDurationMs: Date.now() - startTime,
        correlationId,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorObj = err instanceof AppError ? err : new AppError(String(err));
      const failedStage = stageResults.find((s) => !s.passed)?.stage;

      logger.warn("SECURITY", `[GOVERNANCE_BLOCKED] Operation '${input.operationName}' failed at stage '${failedStage}': ${errorObj.message}`, {
        theatreId: input.targetTenantId,
        userId: input.actor.userId,
        userRole: input.actor.role,
        correlationId,
        error: errorObj.message,
      });

      return {
        success: false,
        error: {
          code: errorObj.code,
          message: errorObj.message,
          fieldErrors: (errorObj as any).fieldErrors,
          stage: failedStage,
        },
        stageResults,
        totalDurationMs: Date.now() - startTime,
        correlationId,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static inferEventType(action: string, module: string): any {
    const upper = action.toUpperCase();
    if (upper.includes("CREATE")) return "THEATRE_CREATED";
    if (upper.includes("DELETE") || upper.includes("SOFT_DELETE")) return "THEATRE_SOFT_DELETED";
    if (upper.includes("RESTORE")) return "THEATRE_RESTORED";
    if (upper.includes("PUBLISH")) return "THEATRE_PUBLISHED";
    if (upper.includes("SUSPEND")) return "THEATRE_SUSPENDED";
    if (upper.includes("ARCHIVE")) return "THEATRE_ARCHIVED";
    if (module === "THEATRE_MEDIA") return "MEDIA_UPLOADED";
    if (module === "THEATRE_STAFF") return "STAFF_ASSIGNED";
    if (module === "THEATRE_BUSINESS") return "BUSINESS_INFO_UPDATED";
    if (module === "THEATRE_HOURS") return "OPERATING_HOURS_UPDATED";
    if (module === "THEATRE_CONFIG") return "CONFIGURATION_UPDATED";
    return "THEATRE_UPDATED";
  }
}
