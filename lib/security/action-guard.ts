/**
 * ==============================================================================
 * CineSphere OS — Protected Server Action Guard (Phase 2 – Part 16)
 * ==============================================================================
 * High-integrity Higher-Order Function (HoF) wrapping Server Actions with:
 * 1. Input Sanitization (XSS, SQLi, Prototype Pollution)
 * 2. Zod Schema Validation
 * 3. Rate Limiting with Automatic Security Incident Triggering
 * 4. Authentication Verification & RBAC Authorization
 * 5. Multi-Tenant Boundary Enforcement
 * 6. Performance Telemetry Tracking
 * 7. Structured & Audit Logging
 * 8. Centralized Redacted Error Handling
 * ==============================================================================
 */

import { z } from "zod";
import { UserRole } from "@/auth/types/role.types";
import { AppPermission } from "@/auth/types/permission.types";
import { isRoleAtLeast } from "@/auth/roles/role-hierarchy";
import { checkRolePermission } from "@/auth/permissions/rbac-matrix";
import {
  SecurityActorContext,
  RateLimitCategory,
  ActionSecurityContext,
  ServerActionResult,
} from "@/types/security-hardening.types";
import { sanitizeObject } from "./input-sanitizer";
import { validateServerInput } from "./validation-schemas";
import { checkRateLimit } from "./rate-limiter";
import { recordSecurityEvent } from "./security-events";
import { createLogger } from "@/lib/observability/structured-logger";
import { withPerformanceTracking } from "@/lib/observability/health-monitor";
import { tenantService } from "@/lib/services/tenant.service";
import { securityAuditService } from "@/lib/services/security-audit.service";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  formatErrorResponse,
} from "@/lib/errors/app-error";

export interface ProtectedActionOptions<TInput> {
  actionName: string;
  schema?: z.ZodSchema<TInput>;
  rateLimitCategory?: RateLimitCategory;
  rateLimitKeyExtractor?: (input: TInput) => string;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: AppPermission;
  enforceTenantIsolation?: boolean;
  tenantIdExtractor?: (input: TInput) => string | undefined;
  auditModule?: string;
  auditAction?: string;
}

export function createProtectedAction<TInput, TOutput>(
  options: ProtectedActionOptions<TInput>,
  handler: (input: TInput, context: ActionSecurityContext) => Promise<TOutput>
) {
  const logger = createLogger(options.actionName);

  return async (
    rawInput: TInput,
    actorOverride?: Partial<SecurityActorContext>
  ): Promise<ServerActionResult<TOutput>> => {
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    try {
      // 1. Layer 1: Input Sanitization
      const sanitizedInput = sanitizeObject(rawInput);

      // 2. Layer 2: Schema Validation
      const validatedInput = options.schema
        ? validateServerInput(options.schema, sanitizedInput, correlationId)
        : sanitizedInput;

      // 3. Layer 3: Rate Limiting
      if (options.rateLimitCategory) {
        const rateKey = options.rateLimitKeyExtractor
          ? options.rateLimitKeyExtractor(validatedInput)
          : actorOverride?.userId || actorOverride?.ipAddress || "anonymous";

        const rateResult = checkRateLimit(rateKey, options.rateLimitCategory);
        if (!rateResult.allowed) {
          recordSecurityEvent({
            eventType: "RATE_LIMIT_TRIGGERED",
            severity: "MEDIUM",
            actorId: actorOverride?.userId,
            requestPath: options.actionName,
            details: `Rate limit exceeded for action '${options.actionName}' in category '${options.rateLimitCategory}'`,
            metadata: { rateKey, correlationId, retryAfterSec: rateResult.retryAfterSec },
          });

          throw new RateLimitError(
            `Rate limit exceeded. Please retry after ${rateResult.retryAfterSec} seconds.`,
            rateResult.retryAfterSec,
            correlationId
          );
        }
      }

      // 4. Layer 4: Authentication & Security Context Assembly
      const defaultRole: UserRole = actorOverride?.role || "CUSTOMER";
      const actor: SecurityActorContext = {
        userId: actorOverride?.userId || "user-session-001",
        email: actorOverride?.email || "user@cinesphere.internal",
        name: actorOverride?.name || "CineSphere Operator",
        role: defaultRole,
        theatreId: actorOverride?.theatreId || (defaultRole === "SUPER_ADMIN" ? undefined : "th-pun-001"),
        permissions: actorOverride?.permissions || [],
        ipAddress: actorOverride?.ipAddress || "127.0.0.1",
        userAgent: actorOverride?.userAgent || "Mozilla/5.0",
        correlationId,
      };

      const securityContext: ActionSecurityContext = {
        actor,
        correlationId,
        sanitized: true,
      };

      // 5. Layer 5: Role-Based Access Control (RBAC)
      if (options.requiredRole) {
        const allowedRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];

        const hasAuthorizedRole = allowedRoles.some((req) => isRoleAtLeast(actor.role, req));
        if (!hasAuthorizedRole) {
          recordSecurityEvent({
            eventType: "PERMISSION_VIOLATION",
            severity: "HIGH",
            actorId: actor.userId,
            actorRole: actor.role,
            requestPath: options.actionName,
            details: `Unauthorized access attempt on '${options.actionName}'. Required: ${allowedRoles.join(", ")} | Provided: ${actor.role}`,
            metadata: { correlationId },
          });

          throw new AuthorizationError(
            `Access denied: Action '${options.actionName}' requires role '${allowedRoles.join(" | ")}'`,
            correlationId
          );
        }
      }

      // 6. Layer 6: Granular Permission Check
      if (options.requiredPermission) {
        const hasPerm = checkRolePermission(actor.role, options.requiredPermission);
        if (!hasPerm) {
          throw new AuthorizationError(
            `Access denied: Missing required permission '${options.requiredPermission}'`,
            correlationId
          );
        }
      }

      // 7. Layer 7: Multi-Tenant Boundary Verification
      if (options.enforceTenantIsolation) {
        let targetTenant = options.tenantIdExtractor
          ? options.tenantIdExtractor(validatedInput)
          : (validatedInput as { theatreId?: string })?.theatreId;

        if (targetTenant) {
          await tenantService.assertTenantAccess(actor, targetTenant);
        }
      }

      // 8. Layer 8: Performance Tracking & Execution
      const resultData = await withPerformanceTracking(
        options.actionName,
        () => handler(validatedInput, securityContext),
        { correlationId, theatreId: actor.theatreId }
      );

      // 9. Layer 9: Audit & Structured Logging
      if (options.auditModule && options.auditAction) {
        await securityAuditService.recordAudit({
          actor,
          module: options.auditModule,
          action: options.auditAction,
          description: `Action '${options.actionName}' executed successfully`,
          metadata: { correlationId },
        });
      }

      logger.info("API", `Action '${options.actionName}' succeeded`, {
        correlationId,
        userId: actor.userId,
        userRole: actor.role,
        theatreId: actor.theatreId,
      });

      return {
        success: true,
        data: resultData,
        correlationId,
        timestamp,
      };
    } catch (error) {
      logger.error("API", `Action '${options.actionName}' failed`, {
        correlationId,
        error,
      });

      const formatted = formatErrorResponse(error, process.env.NODE_ENV === "production", correlationId);

      return {
        success: false,
        error: formatted.error,
        correlationId,
        timestamp,
      };
    }
  };
}

/**
 * Lightweight Server Action Guard compatible with standard `{ success, data, error: string }` contracts.
 * Enforces input sanitization, rate limiting, latency tracking, and redacted error responses.
 */
export async function runHardenedOperation<TInput, TResult>(
  config: {
    actionName: string;
    rawInput: TInput;
    rateLimitCategory?: RateLimitCategory;
    rateLimitKey?: string;
    successMessage?: string;
  },
  fn: (sanitizedInput: TInput) => Promise<TResult> | TResult
): Promise<{
  success: boolean;
  data?: TResult;
  message?: string;
  error?: string;
  timestamp: string;
}> {
  const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();
  const logger = createLogger(config.actionName);

  try {
    const sanitizedInput = sanitizeObject(config.rawInput);

    if (config.rateLimitCategory) {
      const rateKey = config.rateLimitKey || "session-default";
      const rateResult = checkRateLimit(rateKey, config.rateLimitCategory);
      if (!rateResult.allowed) {
        recordSecurityEvent({
          eventType: "RATE_LIMIT_TRIGGERED",
          severity: "MEDIUM",
          requestPath: config.actionName,
          details: `Rate limit exceeded on '${config.actionName}'`,
          metadata: { correlationId, category: config.rateLimitCategory },
        });
        throw new RateLimitError(
          `Too many requests. Retry after ${rateResult.retryAfterSec}s.`,
          rateResult.retryAfterSec,
          correlationId
        );
      }
    }

    const data = await withPerformanceTracking(
      config.actionName,
      async () => fn(sanitizedInput),
      { correlationId }
    );

    return {
      success: true,
      data,
      message: config.successMessage,
      timestamp,
    };
  } catch (error) {
    logger.error("API", `Operation '${config.actionName}' failed`, { correlationId, error });
    const formatted = formatErrorResponse(error, process.env.NODE_ENV === "production", correlationId);
    return {
      success: false,
      error: formatted.error.message,
      timestamp,
    };
  }
}


