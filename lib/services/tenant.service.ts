/**
 * ==============================================================================
 * CineSphere OS — Tenant Isolation Domain Service (Phase 2 – Part 16)
 * ==============================================================================
 * Architectural enforcement of absolute multi-tenant isolation.
 * Theatre Admins are strictly scoped to their assigned theatreId.
 * Cross-tenant access attempts immediately record security violation events.
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import { TenantAccessError } from "@/lib/errors/app-error";
import { recordSecurityEvent } from "@/lib/security/security-events";
import { theatreRepository } from "@/lib/repositories/theatre.repository";

export class TenantService {
  /**
   * Asserts that the actor has legitimate authority to access or mutate
   * records belonging to the target tenant (theatreId).
   */
  async assertTenantAccess(
    actor: SecurityActorContext,
    targetTenantId?: string
  ): Promise<void> {
    // Platform Super Admin retains circuit-wide authority
    if (actor.role === "SUPER_ADMIN") {
      return;
    }

    if (!targetTenantId) {
      // Non-super-admins cannot perform un-scoped tenant actions
      recordSecurityEvent({
        eventType: "TENANT_VIOLATION",
        severity: "HIGH",
        actorId: actor.userId,
        actorRole: actor.role,
        details: `Non-Super-Admin actor '${actor.userId}' attempted un-scoped multi-tenant operation`,
        metadata: { correlationId: actor.correlationId },
      });
      throw new TenantAccessError("Tenant ID is required for this operational scope", {
        correlationId: actor.correlationId,
      });
    }

    // Customer role is allowed to view public theatre details and make bookings
    if (actor.role === "CUSTOMER") {
      return;
    }

    // Multiplex Staff & Theatre Admins must match assigned complex
    if (actor.theatreId !== targetTenantId) {
      recordSecurityEvent({
        eventType: "TENANT_VIOLATION",
        severity: "CRITICAL",
        actorId: actor.userId,
        actorRole: actor.role,
        theatreId: actor.theatreId,
        details: `Cross-tenant violation: User assigned to '${actor.theatreId}' attempted access to tenant '${targetTenantId}'`,
        metadata: {
          userAssignedTenant: actor.theatreId,
          targetTenant: targetTenantId,
          correlationId: actor.correlationId,
        },
      });

      throw new TenantAccessError(
        `Cross-tenant access denied: You do not have permission to manage theatre complex '${targetTenantId}'`,
        {
          attemptedTenantId: targetTenantId,
          userTenantId: actor.theatreId,
          correlationId: actor.correlationId,
        }
      );
    }
  }

  /**
   * Verifies whether a given theatre ID exists and is currently active.
   */
  async verifyTheatreActive(theatreId: string): Promise<boolean> {
    const theatre = await theatreRepository.findById(theatreId);
    return Boolean(theatre && theatre.isActive);
  }
}

export const tenantService = new TenantService();

