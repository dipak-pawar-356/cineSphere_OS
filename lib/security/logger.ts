/**
 * CineSphere OS - Enterprise Structured Logger Bridge (Phase 2 - Part 16)
 */

import { createLogger } from "@/lib/observability/structured-logger";

const structuredLogger = createLogger("LegacyLogger");

export type LogLevel = "debug" | "info" | "warn" | "error";

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    structuredLogger.debug("SYSTEM", message, { metadata: context });
  },
  info: (message: string, context?: Record<string, unknown>) => {
    structuredLogger.info("SYSTEM", message, { metadata: context });
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    structuredLogger.warn("SYSTEM", message, { metadata: context });
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    structuredLogger.error("SYSTEM", message, { error, metadata: context });
  },
};
