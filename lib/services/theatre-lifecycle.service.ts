/**
 * ==============================================================================
 * CineSphere OS — Theatre Lifecycle Domain Service (Phase 3 – Part 1)
 * ==============================================================================
 * Pure enterprise Domain-Driven Design (DDD) service encapsulating all multi-tenant
 * theatre lifecycle rules: state transitions, approval governance, slug management,
 * suspension/archival/soft-delete invariants, optimistic locking & tenant isolation.
 * Completely independent of Next.js HTTP/UI transport.
 * ==============================================================================
 */

import {
  ManagedTheatreEntity,
  TheatreLifecycleState,
  CreateTheatreInput,
  UpdateTheatreInput,
  TheatreSearchFilters,
  PaginatedTheatresResult,
  TheatreLifecycleDetailBundle,
} from "@/types/theatre-lifecycle.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  theatreLifecycleRepository,
  deriveCapabilitiesForState,
} from "@/lib/repositories/theatre-lifecycle.repository";
import { tenantService } from "./tenant.service";
import { securityAuditService } from "./security-audit.service";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import { TheatreAdminEditableFields, SLUG_REGEX } from "@/lib/validation/theatre-lifecycle.validation";
import { createLogger } from "@/lib/observability/structured-logger";
import { CACHE_TAGS, invalidateCacheByTag } from "@/lib/performance/cache-strategy";

const logger = createLogger("TheatreLifecycleService");

// Authoritative Finite State Machine Matrix
export const ALLOWED_TRANSITIONS: Record<TheatreLifecycleState, TheatreLifecycleState[]> = {
  DRAFT: ["PENDING_APPROVAL", "SOFT_DELETED"],
  PENDING_APPROVAL: ["APPROVED", "DRAFT", "SOFT_DELETED"],
  APPROVED: ["ACTIVE", "SUSPENDED", "ARCHIVED", "SOFT_DELETED"],
  ACTIVE: ["INACTIVE", "SUSPENDED", "ARCHIVED"],
  INACTIVE: ["ACTIVE", "SUSPENDED", "ARCHIVED", "SOFT_DELETED"],
  SUSPENDED: ["ACTIVE", "ARCHIVED", "SOFT_DELETED"],
  ARCHIVED: ["ACTIVE", "INACTIVE", "SOFT_DELETED"],
  SOFT_DELETED: [],
};

export class TheatreLifecycleService {
  /**
   * Generates a clean URL slug string from a cinema name and optional city.
   */
  generateSlugString(name: string, city?: string): string {
    const raw = city ? `${name}-${city}` : name;
    return raw
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  /**
   * Validates slug syntax & checks global uniqueness across current & historical slugs.
   */
  async validateSlugAvailability(
    slug: string,
    excludeTheatreId?: string
  ): Promise<{ isValid: boolean; isAvailable: boolean; error?: string }> {
    const normalized = slug.trim().toLowerCase();
    if (!SLUG_REGEX.test(normalized) || normalized.length < 3) {
      return {
        isValid: false,
        isAvailable: false,
        error: "Slug must be at least 3 lowercase alphanumeric characters with hyphens only.",
      };
    }

    const existing = await theatreLifecycleRepository.findBySlug(normalized);
    if (existing && existing.id !== excludeTheatreId) {
      return {
        isValid: true,
        isAvailable: false,
        error: `Slug '${normalized}' is already assigned to another cinema property.`,
      };
    }

    const usedBefore = await theatreLifecycleRepository.isSlugPreviouslyUsed(normalized);
    if (usedBefore && (!existing || existing.id !== excludeTheatreId)) {
      return {
        isValid: true,
        isAvailable: false,
        error: `Slug '${normalized}' was previously used and reserved for redirect history.`,
      };
    }

    return { isValid: true, isAvailable: true };
  }

  /**
   * Generates a guaranteed unique slug, supporting manual override collision checking.
   */
  async generateUniqueSlug(
    name: string,
    city?: string,
    manualOverride?: string,
    excludeTheatreId?: string
  ): Promise<string> {
    if (manualOverride && manualOverride.trim()) {
      const check = await this.validateSlugAvailability(manualOverride, excludeTheatreId);
      if (!check.isValid) {
        throw new ValidationError(check.error || "Invalid slug syntax");
      }
      if (!check.isAvailable) {
        throw new BusinessRuleError(
          check.error || `Duplicate slug '${manualOverride}' detected.`,
          "DUPLICATE_SLUG"
        );
      }
      return manualOverride.trim().toLowerCase();
    }

    const base = this.generateSlugString(name, city) || `theatre-${Date.now()}`;
    let candidate = base;
    let counter = 1;

    while (true) {
      const check = await this.validateSlugAvailability(candidate, excludeTheatreId);
      if (check.isAvailable) {
        return candidate;
      }
      counter++;
      candidate = `${base}-${counter}`;
    }
  }

  /**
   * Asserts that actor possesses SUPER_ADMIN privileges for lifecycle governance.
   */
  private assertSuperAdmin(actor: SecurityActorContext, action: string): void {
    if (actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        `Permission Denied: Only SUPER_ADMIN can execute '${action}'.`,
        actor.correlationId
      );
    }
  }

  /**
   * Validates transition legality against the lifecycle finite state machine.
   */
  private assertValidTransition(
    currentState: TheatreLifecycleState,
    targetState: TheatreLifecycleState,
    correlationId?: string
  ): void {
    const allowed = ALLOWED_TRANSITIONS[currentState] || [];
    if (!allowed.includes(targetState)) {
      throw new BusinessRuleError(
        `Invalid State Transition: Cannot transition theatre from '${currentState}' to '${targetState}'. Allowed: [${allowed.join(", ") || "NONE"}]`,
        "INVALID_STATE_TRANSITION",
        correlationId
      );
    }
  }

  /**
   * 1. CREATE THEATRE
   * Creates a new multi-tenant theatre in DRAFT (or PENDING_APPROVAL if submitted).
   */
  async createTheatre(
    input: CreateTheatreInput,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "CREATE_THEATRE");

    // Validate duplicate theatre name
    const duplicateName = await theatreLifecycleRepository.findByNameCaseInsensitive(input.name);
    if (duplicateName) {
      throw new BusinessRuleError(
        `Duplicate Theatre: A cinema named '${input.name}' already exists (${duplicateName.id}).`,
        "DUPLICATE_THEATRE",
        actor.correlationId
      );
    }

    // Generate guaranteed unique slug
    const uniqueSlug = await this.generateUniqueSlug(input.name, input.city, input.slug);
    const initialStatus: TheatreLifecycleState = input.submitImmediately
      ? "PENDING_APPROVAL"
      : "DRAFT";

    const created = await theatreLifecycleRepository.create({
      name: input.name.trim(),
      chain: input.chain?.trim() || "CineSphere Partner",
      slug: uniqueSlug,
      tagline: input.tagline?.trim(),
      description: input.description?.trim(),
      gstNumber: input.gstNumber?.trim(),
      pricingTier: input.pricingTier || "STANDARD",
      subscriptionPlan: input.subscriptionPlan || "Starter",
      contactEmail: input.contactEmail.trim(),
      contactNumber: input.contactNumber.trim(),
      adminName: input.adminName.trim(),
      adminEmail: input.adminEmail.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      pinCode: input.pinCode?.trim(),
      country: input.country?.trim() || "India",
      branding: {
        logoUrl: input.branding?.logoUrl || "/placeholders/theatres/default-logo.png",
        bannerUrl: input.branding?.bannerUrl || "/placeholders/theatres/default-banner.png",
        primaryColor: input.branding?.primaryColor || "#E50914",
        secondaryColor: input.branding?.secondaryColor || "#0A0B10",
        accentColor: input.branding?.accentColor || "#F59E0B",
      },
      defaultConfig: {
        timezone: input.defaultConfig?.timezone || "Asia/Kolkata",
        currency: input.defaultConfig?.currency || "INR",
        openingTime: input.defaultConfig?.openingTime || "09:00 AM",
        closingTime: input.defaultConfig?.closingTime || "01:00 AM",
        convenienceFeeDefault: input.defaultConfig?.convenienceFeeDefault ?? 35,
        allowSelfCheckIn: input.defaultConfig?.allowSelfCheckIn ?? true,
        maxSeatsPerBooking: input.defaultConfig?.maxSeatsPerBooking ?? 10,
      },
      status: initialStatus,
      approvalStatus: "PENDING",
      createdBy: actor.userId,
    });

    // Record status history
    theatreLifecycleRepository.recordStatusHistory({
      theatreId: created.id,
      fromStatus: null,
      toStatus: initialStatus,
      reason: input.submitImmediately
        ? "Created and submitted directly for platform KYC approval."
        : "Initialized in DRAFT workspace.",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: created.createdAt,
    });

    if (input.submitImmediately) {
      theatreLifecycleRepository.recordApproval({
        theatreId: created.id,
        status: "PENDING",
        comments: "Initial submission upon onboarding creation.",
        createdAt: created.createdAt,
      });
    }

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId: created.id,
      action: "THEATRE_CREATED",
      actorId: actor.userId,
      actorRole: actor.role,
      newState: initialStatus,
      metadata: { name: created.name, slug: created.slug, publicId: created.publicId },
      timestamp: created.createdAt,
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_LIFECYCLE",
      action: "CREATE",
      description: `Created cinema tenant '${created.name}' (${created.slug}) in state ${initialStatus}`,
      metadata: { theatreId: created.id, publicId: created.publicId },
    });

    invalidateCacheByTag(CACHE_TAGS.PLATFORM_METRICS);
    return created;
  }

  /**
   * 2. EDIT / UPDATE THEATRE (with Optimistic Locking & Role Field Guards)
   */
  async updateTheatre(
    theatreId: string,
    input: UpdateTheatreInput,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    await tenantService.assertTenantAccess(actor, theatreId);

    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) {
      throw new NotFoundError("Theatre", theatreId, actor.correlationId);
    }

    if (existing.softDelete.isDeleted || existing.status === "SOFT_DELETED") {
      throw new BusinessRuleError(
        "Cannot update a soft-deleted theatre.",
        "THEATRE_SOFT_DELETED",
        actor.correlationId
      );
    }

    if (existing.capabilities.isReadOnly || existing.status === "ARCHIVED") {
      throw new BusinessRuleError(
        "Archived theatres are strictly read-only. Restore the theatre before editing.",
        "THEATRE_READ_ONLY",
        actor.correlationId
      );
    }

    // Role Field Restriction: Theatre Admins may ONLY edit designated allowed fields
    if (actor.role === "THEATRE_ADMIN") {
      const restrictedKeys = [
        "name",
        "chain",
        "slug",
        "gstNumber",
        "pricingTier",
        "subscriptionPlan",
        "adminName",
        "adminEmail",
        "city",
        "state",
        "country",
      ] as const;

      for (const rk of restrictedKeys) {
        if (input[rk] !== undefined) {
          throw new AuthorizationError(
            `Permission Denied: Theatre Admins are restricted from altering governance field '${rk}'. Allowed fields: ${TheatreAdminEditableFields.join(", ")}.`,
            actor.correlationId
          );
        }
      }
    } else if (actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError("Insufficient permissions to edit theatre profile.", actor.correlationId);
    }

    // Check Duplicate Name if changing
    if (input.name && input.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const dupName = await theatreLifecycleRepository.findByNameCaseInsensitive(input.name);
      if (dupName && dupName.id !== theatreId) {
        throw new BusinessRuleError(
          `Duplicate Theatre: Name '${input.name}' is already in use.`,
          "DUPLICATE_THEATRE",
          actor.correlationId
        );
      }
    }

    // Handle Slug Modification & History Recording
    let nextSlug = existing.slug;
    if (input.slug && input.slug.trim().toLowerCase() !== existing.slug.toLowerCase()) {
      nextSlug = await this.generateUniqueSlug(
        input.name || existing.name,
        input.city || existing.city,
        input.slug,
        theatreId
      );

      theatreLifecycleRepository.recordSlugHistory({
        theatreId,
        oldSlug: existing.slug,
        newSlug: nextSlug,
        changedBy: actor.userId,
        redirectEnabled: true,
        createdAt: new Date().toISOString(),
      });

      theatreLifecycleRepository.recordLifecycleAudit({
        theatreId,
        action: "SLUG_CHANGED",
        actorId: actor.userId,
        actorRole: actor.role,
        previousState: existing.slug,
        newState: nextSlug,
        reason: "Manual tenant slug update",
        timestamp: new Date().toISOString(),
      });
    }

    const patch: Partial<ManagedTheatreEntity> = {
      name: input.name !== undefined ? input.name.trim() : existing.name,
      chain: input.chain !== undefined ? input.chain.trim() : existing.chain,
      slug: nextSlug,
      tagline: input.tagline !== undefined ? input.tagline.trim() : existing.tagline,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      gstNumber: input.gstNumber !== undefined ? input.gstNumber.trim() : existing.gstNumber,
      pricingTier: input.pricingTier || existing.pricingTier,
      subscriptionPlan: input.subscriptionPlan || existing.subscriptionPlan,
      contactEmail: input.contactEmail !== undefined ? input.contactEmail.trim() : existing.contactEmail,
      contactNumber: input.contactNumber !== undefined ? input.contactNumber.trim() : existing.contactNumber,
      adminName: input.adminName !== undefined ? input.adminName.trim() : existing.adminName,
      adminEmail: input.adminEmail !== undefined ? input.adminEmail.trim() : existing.adminEmail,
      address: input.address !== undefined ? input.address.trim() : existing.address,
      city: input.city !== undefined ? input.city.trim() : existing.city,
      state: input.state !== undefined ? input.state.trim() : existing.state,
      pinCode: input.pinCode !== undefined ? input.pinCode.trim() : existing.pinCode,
      country: input.country !== undefined ? input.country.trim() : existing.country,
      branding: input.branding ? { ...existing.branding, ...input.branding } : existing.branding,
      defaultConfig: input.defaultConfig
        ? { ...existing.defaultConfig, ...input.defaultConfig }
        : existing.defaultConfig,
    };

    const lockResult = await theatreLifecycleRepository.updateWithOptimisticLock(
      theatreId,
      input.expectedVersion,
      patch
    );

    if (!lockResult.success || lockResult.conflict) {
      throw new ConflictError(
        `Optimistic Lock Conflict: Theatre '${existing.name}' was modified concurrently (Current v${lockResult.currentVersion}, Expected v${lockResult.expectedVersion}).`,
        {
          entity: "Theatre",
          currentVersion: lockResult.currentVersion,
          expectedVersion: lockResult.expectedVersion,
          correlationId: actor.correlationId,
        }
      );
    }

    const updated = lockResult.data!;
    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_UPDATED",
      actorId: actor.userId,
      actorRole: actor.role,
      metadata: { version: updated.version },
      timestamp: updated.updatedAt,
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_LIFECYCLE",
      action: "UPDATE",
      description: `Updated theatre '${updated.name}' to version v${updated.version}`,
      metadata: { theatreId, version: updated.version },
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 3. SUBMIT DRAFT FOR APPROVAL (DRAFT -> PENDING_APPROVAL)
   */
  async submitForApproval(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "SUBMIT_FOR_APPROVAL");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "PENDING_APPROVAL", actor.correlationId);

    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "PENDING_APPROVAL",
      approvalStatus: "PENDING",
      capabilities: deriveCapabilitiesForState("PENDING_APPROVAL"),
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "PENDING_APPROVAL",
      reason: "Submitted for Super Admin compliance & KYC review",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: updated.updatedAt,
    });

    theatreLifecycleRepository.recordApproval({
      theatreId,
      status: "PENDING",
      comments: "Submitted for approval review.",
      createdAt: updated.updatedAt,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_SUBMITTED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "PENDING_APPROVAL",
      timestamp: updated.updatedAt,
    });

    return updated;
  }

  /**
   * 4. APPROVE THEATRE (PENDING_APPROVAL -> APPROVED)
   */
  async approveTheatre(
    theatreId: string,
    comments: string | undefined,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "APPROVE_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "APPROVED", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "APPROVED",
      approvalStatus: "APPROVED",
      capabilities: deriveCapabilitiesForState("APPROVED"),
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "APPROVED",
      reason: comments || "Approved by Platform Super Admin",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordApproval({
      theatreId,
      status: "APPROVED",
      approverId: actor.userId,
      approverName: actor.name || "Super Admin",
      comments: comments || "KYC & Exhibition compliance verified.",
      reviewedAt: now,
      createdAt: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_APPROVED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "APPROVED",
      reason: comments,
      timestamp: now,
    });

    return updated;
  }

  /**
   * 5. REJECT OR REQUEST REVISION (PENDING_APPROVAL -> DRAFT)
   */
  async rejectOrRequestRevision(
    theatreId: string,
    decision: "REJECTED" | "REVISION_REQUESTED",
    comments: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, decision);
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "DRAFT", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "DRAFT",
      approvalStatus: decision,
      capabilities: deriveCapabilitiesForState("DRAFT"),
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "DRAFT",
      reason: `[${decision}] ${comments}`,
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordApproval({
      theatreId,
      status: decision,
      approverId: actor.userId,
      approverName: actor.name || "Super Admin",
      comments,
      reviewedAt: now,
      createdAt: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: decision === "REJECTED" ? "THEATRE_REJECTED" : "THEATRE_REVISION_REQUESTED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "DRAFT",
      reason: comments,
      timestamp: now,
    });

    return updated;
  }

  /**
   * 6. ACTIVATE THEATRE (APPROVED | INACTIVE -> ACTIVE)
   */
  async activateTheatre(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "ACTIVATE_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "ACTIVE", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "ACTIVE",
      capabilities: deriveCapabilitiesForState("ACTIVE"),
      suspension: undefined,
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "ACTIVE",
      reason: "Activated for public bookings, show programming & payment processing",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_ACTIVATED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "ACTIVE",
      timestamp: now,
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 7. SUSPEND THEATRE (* -> SUSPENDED)
   * Locks new bookings, show programming, and payments while keeping historical records accessible.
   */
  async suspendTheatre(
    theatreId: string,
    reason: string,
    endTimePlaceholder: string | undefined,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "SUSPEND_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "SUSPENDED", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "SUSPENDED",
      capabilities: deriveCapabilitiesForState("SUSPENDED"),
      suspension: {
        reason,
        startTime: now,
        endTimePlaceholder,
        suspendedBy: actor.userId,
        suspendedAt: now,
      },
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "SUSPENDED",
      reason,
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_SUSPENDED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "SUSPENDED",
      reason,
      timestamp: now,
    });

    logger.warn("SECURITY", `Theatre '${existing.name}' (${theatreId}) suspended: ${reason}`, {
      theatreId,
      userId: actor.userId,
      correlationId: actor.correlationId,
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 8. RESUME SUSPENDED THEATRE (SUSPENDED -> ACTIVE)
   */
  async resumeTheatre(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "RESUME_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    if (existing.status !== "SUSPENDED") {
      throw new BusinessRuleError(
        `Cannot resume theatre in status '${existing.status}'. Only SUSPENDED theatres can be resumed.`,
        "INVALID_STATE_TRANSITION",
        actor.correlationId
      );
    }

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "ACTIVE",
      capabilities: deriveCapabilitiesForState("ACTIVE"),
      suspension: undefined,
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: "SUSPENDED",
      toStatus: "ACTIVE",
      reason: "Suspension lifted; normal booking & payment operations resumed",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_RESUMED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: "SUSPENDED",
      newState: "ACTIVE",
      timestamp: now,
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 9. ARCHIVE THEATRE (* -> ARCHIVED)
   * Makes theatre strictly read-only while preserving historical reports & box office audits.
   */
  async archiveTheatre(
    theatreId: string,
    reason: string | undefined,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "ARCHIVE_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    this.assertValidTransition(existing.status, "ARCHIVED", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "ARCHIVED",
      capabilities: deriveCapabilitiesForState("ARCHIVED"),
      archival: {
        archivedAt: now,
        archivedBy: actor.userId,
        reason: reason || "Archived into read-only retention store.",
        previousState: existing.status,
      },
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "ARCHIVED",
      reason: reason || "Archived read-only",
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_ARCHIVED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "ARCHIVED",
      reason,
      timestamp: now,
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 10. RESTORE ARCHIVED THEATRE (ARCHIVED -> INACTIVE or previousState)
   */
  async restoreTheatre(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "RESTORE_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    if (existing.status !== "ARCHIVED") {
      throw new BusinessRuleError(
        `Cannot restore theatre in state '${existing.status}'. Only ARCHIVED theatres can be restored.`,
        "INVALID_STATE_TRANSITION",
        actor.correlationId
      );
    }

    const targetState: TheatreLifecycleState =
      existing.archival?.previousState === "ACTIVE" ? "ACTIVE" : "INACTIVE";
    const now = new Date().toISOString();

    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: targetState,
      capabilities: deriveCapabilitiesForState(targetState),
      archival: undefined,
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: "ARCHIVED",
      toStatus: targetState,
      reason: `Restored from archival store back to '${targetState}'`,
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_RESTORED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: "ARCHIVED",
      newState: targetState,
      timestamp: now,
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 11. SOFT DELETE THEATRE (* -> SOFT_DELETED)
   * Never physically removes record. Blocks deleting an ACTIVE theatre directly.
   */
  async softDeleteTheatre(
    theatreId: string,
    deleteReason: string,
    actor: SecurityActorContext
  ): Promise<ManagedTheatreEntity> {
    this.assertSuperAdmin(actor, "SOFT_DELETE_THEATRE");
    const existing = await theatreLifecycleRepository.findById(theatreId);
    if (!existing) throw new NotFoundError("Theatre", theatreId, actor.correlationId);

    if (existing.status === "ACTIVE") {
      throw new BusinessRuleError(
        "Deletion Blocked: Active theatres accepting live shows/bookings cannot be deleted directly. Suspend or archive operations first.",
        "ACTIVE_THEATRE_DELETE_BLOCKED",
        actor.correlationId
      );
    }

    this.assertValidTransition(existing.status, "SOFT_DELETED", actor.correlationId);

    const now = new Date().toISOString();
    const updated = (await theatreLifecycleRepository.update(theatreId, {
      status: "SOFT_DELETED",
      capabilities: deriveCapabilitiesForState("SOFT_DELETED"),
      softDelete: {
        isDeleted: true,
        deletedAt: now,
        deletedBy: actor.userId,
        deleteReason,
      },
    }))!;

    theatreLifecycleRepository.recordStatusHistory({
      theatreId,
      fromStatus: existing.status,
      toStatus: "SOFT_DELETED",
      reason: deleteReason,
      changedBy: actor.userId,
      changedByRole: actor.role,
      timestamp: now,
    });

    theatreLifecycleRepository.recordLifecycleAudit({
      theatreId,
      action: "THEATRE_SOFT_DELETED",
      actorId: actor.userId,
      actorRole: actor.role,
      previousState: existing.status,
      newState: "SOFT_DELETED",
      reason: deleteReason,
      timestamp: now,
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_LIFECYCLE",
      action: "SOFT_DELETE",
      description: `Soft deleted theatre '${existing.name}' (${theatreId}): ${deleteReason}`,
      metadata: { theatreId, deleteReason },
    });

    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    return updated;
  }

  /**
   * 12. SEARCH & FILTER WITH TENANT ISOLATION
   */
  async searchTheatres(
    filters: TheatreSearchFilters,
    actor: SecurityActorContext
  ): Promise<PaginatedTheatresResult> {
    // Enforce multi-tenant isolation BEFORE metric aggregation and pagination
    const scopedTenantId =
      actor.role === "SUPER_ADMIN" ? undefined : actor.theatreId || "__UNASSIGNED_TENANT__";
    return theatreLifecycleRepository.searchAndPaginate(filters, scopedTenantId);
  }

  /**
   * 13. FULL LIFECYCLE INSPECTOR DETAIL BUNDLE
   */
  async getTheatreLifecycleDetails(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<TheatreLifecycleDetailBundle> {
    await tenantService.assertTenantAccess(actor, theatreId);

    const theatre = await theatreLifecycleRepository.findById(theatreId);
    if (!theatre) {
      throw new NotFoundError("Theatre", theatreId, actor.correlationId);
    }

    return {
      theatre,
      statusHistory: theatreLifecycleRepository.getStatusHistory(theatreId),
      approvals: theatreLifecycleRepository.getApprovals(theatreId),
      slugHistory: theatreLifecycleRepository.getSlugHistory(theatreId),
      auditLogs: theatreLifecycleRepository.getLifecycleAudits(theatreId),
      allowedTransitions: ALLOWED_TRANSITIONS[theatre.status] || [],
    };
  }
}

export const theatreLifecycleService = new TheatreLifecycleService();

