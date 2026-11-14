/**
 * ==============================================================================
 * CineSphere OS — Security Monitoring & Telemetry Hooks (Phase 3 – Part 14)
 * ==============================================================================
 * Reusable monitoring hooks dispatcher connecting security and governance events
 * with platform observability, telemetry, and external monitoring adapters.
 * ==============================================================================
 */

import {
  SecurityMonitoringHooks,
  DomainSecurityEvent,
  PolicyEvaluationResult,
  TheatreSecurityPolicyKey,
  TheatreRateLimitEndpoint,
} from "@/types/theatre-security-governance.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("SecurityMonitoringHooks");

export class SecurityMonitoringHookRegistry {
  private hooks: SecurityMonitoringHooks[] = [];

  /**
   * Registers a security monitoring hook subscriber.
   * Returns an unregister callback for clean disposal.
   */
  public register(hook: SecurityMonitoringHooks): () => void {
    this.hooks.push(hook);
    return () => {
      this.hooks = this.hooks.filter((h) => h !== hook);
    };
  }

  /**
   * Clears all registered hooks (useful for testing isolation).
   */
  public clear(): void {
    this.hooks = [];
  }

  /**
   * Dispatches a hook across all registered subscribers.
   */
  public dispatch<K extends keyof SecurityMonitoringHooks>(
    hookName: K,
    ...args: any[]
  ): void {
    for (const hook of this.hooks) {
      const fn = hook[hookName];
      if (typeof fn === "function") {
        try {
          const res = (fn as any)(...args);
          if (res && typeof res.catch === "function") {
            res.catch((err: unknown) => {
              logger.warn(
                "SECURITY",
                `Async hook '${String(hookName)}' failed: ${
                  err instanceof Error ? err.message : String(err)
                }`
              );
            });
          }
        } catch (err) {
          logger.warn(
            "SECURITY",
            `Hook '${String(hookName)}' subscriber failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }
    }
  }
}

export const securityMonitoringHooks = new SecurityMonitoringHookRegistry();
