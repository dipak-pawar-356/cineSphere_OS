/**
 * ==============================================================================
 * CineSphere OS — Policy-Based Authorization Engine (Phase 3 – Part 14)
 * ==============================================================================
 * Reusable, declarative security policy rules replacing scattered role checks.
 * Integrates directly with Phase 2 RBAC matrix and role hierarchy while enforcing
 * strict tenant-scoped authority and least-privilege principles.
 * ==============================================================================
 */

import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  TheatreSecurityPolicyKey,
  PolicyEvaluationContext,
  PolicyEvaluationResult,
} from "@/types/theatre-security-governance.types";
import { AuthorizationError, TenantAccessError } from "@/lib/errors/app-error";
import { isRoleAtLeast } from "@/auth/roles/role-hierarchy";
import { securityMonitoringHooks } from "../monitoring-hooks";

type PolicyEvaluator = (
  actor: SecurityActorContext,
  context?: PolicyEvaluationContext
) => { allowed: boolean; reason?: string };

// ------------------------------------------------------------------------------
// Policy Definition Matrix
// ------------------------------------------------------------------------------
export const THEATRE_SECURITY_POLICIES: Record<TheatreSecurityPolicyKey, PolicyEvaluator> = {
  // 1. Overall Complex Management
  canManageTheatre: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cross-tenant theatre management is prohibited." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN or SUPER_ADMIN role." };
  },

  // 2. Publication to Public Portal
  canPublishTheatre: (actor) => {
    // Only Super Admin can approve and publish a venue to public consumers
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    return {
      allowed: false,
      reason: "Publishing a theatre to the public portal requires platform SUPER_ADMIN compliance approval.",
    };
  },

  // 3. Suspension of Multiplex
  canSuspendTheatre: (actor) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    return { allowed: false, reason: "Suspending theatre operations requires platform SUPER_ADMIN authority." };
  },

  // 4. Archival of Multiplex
  canArchiveTheatre: (actor) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    return { allowed: false, reason: "Archiving theatre lifecycle records requires platform SUPER_ADMIN authority." };
  },

  // 5. Deletion / Purging of Complex
  canDeleteTheatre: (actor) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    return { allowed: false, reason: "Permanent cinema deletion requires platform SUPER_ADMIN authority." };
  },

  // 6. Branding & Creative Assets
  canEditBranding: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit branding of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Insufficient permissions to edit theatre branding." };
  },

  // 7. Media Uploading
  canUploadMedia: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (isRoleAtLeast(actor.role, "HALL_MANAGER")) {
      if (ctx?.targetTenantId && actor.theatreId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot upload media to another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires at least HALL_MANAGER role to upload media." };
  },

  // 8. Profile Editing
  canEditProfile: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit profile of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to modify profile." };
  },

  // 9. Location & Address
  canEditLocation: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit location of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to modify address." };
  },

  // 10. Amenities & Facilities
  canManageAmenities: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (isRoleAtLeast(actor.role, "HALL_MANAGER")) {
      if (ctx?.targetTenantId && actor.theatreId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot manage amenities for another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires at least HALL_MANAGER role to configure amenities." };
  },

  // 11. Contact Directory
  canManageContacts: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit contacts for another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to manage communication directory." };
  },

  // 12. Business Profile & Invoicing
  canManageBusinessInfo: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit corporate identity for another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to manage statutory business data." };
  },

  // 13. Operating Hours & Special Events
  canManageOperatingHours: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit operating hours for another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to manage operating schedules." };
  },

  // 14. Configuration & Feature Flags
  canEditConfiguration: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot edit configuration of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to configure cinema parameters." };
  },

  // 15. Staff & Custom RBAC
  canManageStaff: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot manage staff of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to manage staff roster." };
  },

  // 16. Operational Dashboard
  canViewDashboard: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (isRoleAtLeast(actor.role, "STAFF")) {
      if (ctx?.targetTenantId && actor.theatreId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot view operational dashboard of another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Patrons and guests cannot access operational dashboard." };
  },

  // 17. Search Index Queries
  canSearchResources: (actor, ctx) => {
    // Public guests can query public resources
    if (actor.role === "CUSTOMER" || (actor.role as string) === "GUEST") {
      if (ctx?.metadata?.includeUnpublished === true) {
        return { allowed: false, reason: "Public consumers cannot search unpublished resources." };
      }
      return { allowed: true };
    }
    return { allowed: true };
  },

  // 18. Soft Delete
  canSoftDeleteResource: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot soft-delete resources belonging to another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to soft-delete resources." };
  },

  // 19. Resource Restoration
  canRestoreResource: (actor, ctx) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    if (actor.role === "THEATRE_ADMIN") {
      if (ctx?.targetTenantId && actor.theatreId !== ctx.targetTenantId) {
        return { allowed: false, reason: "Cannot restore resources belonging to another tenant." };
      }
      return { allowed: true };
    }
    return { allowed: false, reason: "Requires THEATRE_ADMIN role to restore resources." };
  },

  // 20. Permanent Purge
  canPurgeResource: (actor) => {
    if (actor.role === "SUPER_ADMIN") return { allowed: true };
    return { allowed: false, reason: "Permanently purging records requires platform SUPER_ADMIN authority." };
  },
};

/**
 * Evaluates a security policy against an actor and operational context.
 */
export function evaluateSecurityPolicy(
  policyKey: TheatreSecurityPolicyKey,
  actor: SecurityActorContext,
  context?: PolicyEvaluationContext
): PolicyEvaluationResult {
  const evaluator = THEATRE_SECURITY_POLICIES[policyKey];
  if (!evaluator) {
    return {
      allowed: false,
      policyKey,
      reason: `Unknown security policy key: '${policyKey}'`,
      evaluatedAt: new Date().toISOString(),
    };
  }

  const { allowed, reason } = evaluator(actor, context);

  return {
    allowed,
    policyKey,
    reason,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Asserts that an actor satisfies a security policy.
 * Throws AuthorizationError or TenantAccessError if evaluation fails.
 */
export function assertSecurityPolicy(
  policyKey: TheatreSecurityPolicyKey,
  actor: SecurityActorContext,
  context?: PolicyEvaluationContext
): void {
  const result = evaluateSecurityPolicy(policyKey, actor, context);

  if (!result.allowed) {
    securityMonitoringHooks.dispatch("onPolicyDenied", policyKey, actor, result.reason);

    if (result.reason?.toLowerCase().includes("tenant")) {
      throw new TenantAccessError(result.reason, {
        attemptedTenantId: context?.targetTenantId,
        userTenantId: actor.theatreId,
        correlationId: actor.correlationId,
      });
    }

    throw new AuthorizationError(
      result.reason || `Security policy '${policyKey}' was violated by actor '${actor.userId}' (${actor.role})`,
      actor.correlationId
    );
  }
}
