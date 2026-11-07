/**
 * CineSphere OS - Enterprise Structured Logger Placeholder
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context || "");
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context || "");
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, error, context || "");
  },
};

