/**
 * ==============================================================================
 * CineSphere OS — Centralized Enterprise Error Hierarchy (Phase 2 – Part 16)
 * ==============================================================================
 * Strongly typed application exceptions. In production, internal stack traces
 * and database connection internals are strictly redacted from responses.
 * ==============================================================================
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly correlationId?: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code = "INTERNAL_ERROR",
    statusCode = 500,
    options?: { correlationId?: string; metadata?: Record<string, unknown> }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.correlationId = options?.correlationId;
    this.metadata = options?.metadata;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message = "Input validation failed",
    fieldErrors?: Record<string, string[]>,
    correlationId?: string
  ) {
    super(message, "VALIDATION_ERROR", 400, { correlationId, metadata: { fieldErrors } });
    this.fieldErrors = fieldErrors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required to perform this action", correlationId?: string) {
    super(message, "AUTHENTICATION_REQUIRED", 401, { correlationId });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions for this operation", correlationId?: string) {
    super(message, "FORBIDDEN", 403, { correlationId });
  }
}

export class TenantAccessError extends AppError {
  public readonly attemptedTenantId?: string;
  public readonly userTenantId?: string;

  constructor(
    message = "Cross-tenant access violation: Action denied",
    options?: { attemptedTenantId?: string; userTenantId?: string; correlationId?: string }
  ) {
    super(message, "TENANT_ACCESS_DENIED", 403, {
      correlationId: options?.correlationId,
      metadata: {
        attemptedTenantId: options?.attemptedTenantId,
        userTenantId: options?.userTenantId,
      },
    });
    this.attemptedTenantId = options?.attemptedTenantId;
    this.userTenantId = options?.userTenantId;
  }
}

export class NotFoundError extends AppError {
  public readonly entity?: string;
  public readonly entityId?: string;

  constructor(entity = "Resource", entityId?: string, correlationId?: string) {
    super(`${entity}${entityId ? ` with ID '${entityId}'` : ""} was not found`, "NOT_FOUND", 404, {
      correlationId,
      metadata: { entity, entityId },
    });
    this.entity = entity;
    this.entityId = entityId;
  }
}

export class ConflictError extends AppError {
  public readonly entity?: string;
  public readonly currentVersion?: number;
  public readonly expectedVersion?: number;

  constructor(
    message = "Record was modified concurrently by another process. Please refresh and retry.",
    options?: {
      entity?: string;
      currentVersion?: number;
      expectedVersion?: number;
      correlationId?: string;
    }
  ) {
    super(message, "OPTIMISTIC_LOCK_CONFLICT", 409, {
      correlationId: options?.correlationId,
      metadata: options,
    });
    this.entity = options?.entity;
    this.currentVersion = options?.currentVersion;
    this.expectedVersion = options?.expectedVersion;
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSec: number;

  constructor(
    message = "Too many requests. Rate limit threshold exceeded.",
    retryAfterSec = 60,
    correlationId?: string
  ) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, {
      correlationId,
      metadata: { retryAfterSec },
    });
    this.retryAfterSec = retryAfterSec;
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database operation error occurred", correlationId?: string) {
    // In production, database error details are masked
    const isProd = process.env.NODE_ENV === "production";
    const safeMessage = isProd ? "Database query execution failure" : message;
    super(safeMessage, "DATABASE_ERROR", 500, { correlationId });
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code = "BUSINESS_RULE_VIOLATION", correlationId?: string) {
    super(message, code, 422, { correlationId });
  }
}

// ------------------------------------------------------------------------------
// Production-Safe Error Formatter
// ------------------------------------------------------------------------------

export interface FormattedErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    correlationId?: string;
  };
  timestamp: string;
}

export function formatErrorResponse(
  error: unknown,
  isProduction = process.env.NODE_ENV === "production",
  fallbackCorrelationId = `corr-${Date.now()}`
): FormattedErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
        correlationId: error.correlationId || fallbackCorrelationId,
      },
      timestamp,
    };
  }

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        correlationId: error.correlationId || fallbackCorrelationId,
      },
      timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "UNHANDLED_EXCEPTION",
        message: isProduction ? "An unexpected operational error occurred" : error.message,
        correlationId: fallbackCorrelationId,
      },
      timestamp,
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unexpected system anomaly occurred",
      correlationId: fallbackCorrelationId,
    },
    timestamp,
  };
}

