/**
 * ==============================================================================
 * CineSphere OS — Resource Ownership Validator (Phase 3 – Part 14)
 * ==============================================================================
 * Enforces cross-module resource ownership and multi-tenant scoping prior to
 * mutating or accessing sensitive cinema resources.
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import { OwnershipValidationResult } from "@/types/theatre-security-governance.types";
import { theatreGovernanceRepository } from "@/lib/repositories/theatre-governance.repository";
import { OwnershipError } from "@/lib/errors/app-error";

export class OwnershipValidator {
  /**
   * Validates that an actor has legitimate tenant ownership over a target resource.
   */
  public static validateResourceOwnership(
    targetTenantId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): OwnershipValidationResult {
    // 1. Super Admin possesses circuit-wide override authority
    if (actor.role === "SUPER_ADMIN") {
      const existing = theatreGovernanceRepository.getResourceOwnership(
        targetTenantId,
        resourceType,
        resourceId
      );
      return {
        isOwner: true,
        resourceExists: Boolean(existing),
        ownerTenantId: existing?.ownerTenantId || targetTenantId,
        actorTenantId: actor.theatreId,
      };
    }

    // 2. Non-Super-Admins cannot operate on unassigned tenants
    if (actor.theatreId && actor.theatreId !== targetTenantId) {
      const errorMsg = `Cross-tenant ownership violation: User from tenant '${actor.theatreId}' attempted operation on '${resourceType}' '${resourceId}' in tenant '${targetTenantId}'`;
      return {
        isOwner: false,
        resourceExists: true,
        ownerTenantId: targetTenantId,
        actorTenantId: actor.theatreId,
        error: errorMsg,
      };
    }

    // 3. Lookup ownership record
    const ownership = theatreGovernanceRepository.getResourceOwnership(
      targetTenantId,
      resourceType,
      resourceId
    );

    if (ownership) {
      if (ownership.ownerTenantId !== targetTenantId) {
        return {
          isOwner: false,
          resourceExists: true,
          ownerTenantId: ownership.ownerTenantId,
          actorTenantId: actor.theatreId,
          error: `Resource ownership mismatch: '${resourceType}' '${resourceId}' belongs to '${ownership.ownerTenantId}', not '${targetTenantId}'`,
        };
      }

      return {
        isOwner: true,
        resourceExists: true,
        ownerTenantId: ownership.ownerTenantId,
        actorTenantId: actor.theatreId,
      };
    }

    // 4. Default: resource is owned if tenant matches
    return {
      isOwner: true,
      resourceExists: false,
      ownerTenantId: targetTenantId,
      actorTenantId: actor.theatreId,
    };
  }

  /**
   * Asserts ownership and throws an OwnershipError if invalid.
   */
  public static assertResourceOwnership(
    targetTenantId: string,
    resourceType: string,
    resourceId: string,
    actor: SecurityActorContext
  ): void {
    const result = this.validateResourceOwnership(
      targetTenantId,
      resourceType,
      resourceId,
      actor
    );

    if (!result.isOwner) {
      throw new OwnershipError(result.error || "Resource ownership validation failed", {
        resourceType,
        resourceId,
        ownerTenantId: result.ownerTenantId,
        actorTenantId: result.actorTenantId,
        correlationId: actor.correlationId,
      });
    }
  }
}
