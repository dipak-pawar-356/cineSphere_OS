/**
 * ==============================================================================
 * CineSphere OS — Structured Logging & Observability Engine (Phase 2 – Part 16)
 * ==============================================================================
 * Enterprise JSON structured logging with correlation tracking, severity levels,
 * in-memory telemetry buffer, and production secret redaction.
 * ==============================================================================
 */

import {
  LogLevel,
  LogCategory,
  StructuredLogEntry,
} from "@/types/security-hardening.types";

const MAX_LOG_BUFFER_SIZE = 1000;
const logBuffer: StructuredLogEntry[] = [];

// Sensitive field keys to scrub from logs
const REDACTED_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "key",
  "razorpaySecretEncrypted",
  "phonepeSaltKeyEncrypted",
  "stripeSecretKeyEncrypted",
  "paytmKeyEncrypted",
  "accountNumber",
]);

function scrubMetadata(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const scrubbed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      scrubbed[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      scrubbed[key] = scrubMetadata(value as Record<string, unknown>);
    } else {
      scrubbed[key] = value;
    }
  }

  return scrubbed;
}

export class StructuredLogger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private emit(
    severity: LogLevel,
    category: LogCategory,
    message: string,
    options?: {
      requestId?: string;
      correlationId?: string;
      userId?: string;
      userRole?: string;
      theatreId?: string;
      durationMs?: number;
      metadata?: Record<string, unknown>;
      error?: unknown;
    }
  ): StructuredLogEntry {
    const timestamp = new Date().toISOString();
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const correlationId = options?.correlationId || `corr-${Date.now()}`;
    const requestId = options?.requestId || `req-${Date.now()}`;

    let errorDetails: StructuredLogEntry["error"] | undefined;
    if (options?.error instanceof Error) {
      errorDetails = {
        name: options.error.name,
        message: options.error.message,
        code: (options.error as { code?: string }).code,
        // In production, stack traces are omitted or preserved as internal trace marker
        stack: process.env.NODE_ENV === "production" ? undefined : options.error.stack,
      };
    } else if (options?.error) {
      errorDetails = {
        name: "UnknownError",
        message: String(options.error),
      };
    }

    const entry: StructuredLogEntry = {
      logId,
      requestId,
      correlationId,
      traceId: `trace-${correlationId.replace("corr-", "")}`,
      userId: options?.userId,
      userRole: options?.userRole,
      theatreId: options?.theatreId,
      severity,
      category,
      module: this.module,
      message,
      timestamp,
      durationMs: options?.durationMs,
      metadata: scrubMetadata(options?.metadata),
      error: errorDetails,
    };

    // Append to in-memory ring buffer
    if (logBuffer.length >= MAX_LOG_BUFFER_SIZE) {
      logBuffer.shift();
    }
    logBuffer.push(entry);

    // Standard output formatting in JSON for log collectors
    const jsonOutput = JSON.stringify(entry);
    switch (severity) {
      case "DEBUG":
        if (process.env.NODE_ENV !== "production") {
          console.debug(jsonOutput);
        }
        break;
      case "INFO":
        console.info(jsonOutput);
        break;
      case "WARN":
        console.warn(jsonOutput);
        break;
      case "ERROR":
      case "FATAL":
        console.error(jsonOutput);
        break;
    }

    return entry;
  }

  debug(category: LogCategory, message: string, options?: Parameters<StructuredLogger["emit"]>[3]): StructuredLogEntry {
    return this.emit("DEBUG", category, message, options);
  }

  info(category: LogCategory, message: string, options?: Parameters<StructuredLogger["emit"]>[3]): StructuredLogEntry {
    return this.emit("INFO", category, message, options);
  }

  warn(category: LogCategory, message: string, options?: Parameters<StructuredLogger["emit"]>[3]): StructuredLogEntry {
    return this.emit("WARN", category, message, options);
  }

  error(category: LogCategory, message: string, options?: Parameters<StructuredLogger["emit"]>[3]): StructuredLogEntry {
    return this.emit("ERROR", category, message, options);
  }

  fatal(category: LogCategory, message: string, options?: Parameters<StructuredLogger["emit"]>[3]): StructuredLogEntry {
    return this.emit("FATAL", category, message, options);
  }
}

/**
 * Creates or retrieves a scoped logger instance.
 */
export function createLogger(module: string): StructuredLogger {
  return new StructuredLogger(module);
}

/**
 * Query recent structured logs from the telemetry buffer.
 */
export function getRecentStructuredLogs(filter?: {
  theatreId?: string;
  category?: LogCategory;
  severity?: LogLevel;
  limit?: number;
}): StructuredLogEntry[] {
  let results = [...logBuffer];

  if (filter?.theatreId) {
    results = results.filter((l) => l.theatreId === filter.theatreId || !l.theatreId);
  }
  if (filter?.category) {
    results = results.filter((l) => l.category === filter.category);
  }
  if (filter?.severity) {
    results = results.filter((l) => l.severity === filter.severity);
  }

  const limit = filter?.limit || 100;
  return results.slice(-limit).reverse();
}

