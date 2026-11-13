import { theatreAmenityRepository } from "@/lib/repositories/theatre-amenity.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { tenantService } from "@/lib/services/tenant.service";
import { securityAuditService } from "@/lib/services/security-audit.service";
import { createLogger } from "@/lib/observability/structured-logger";
import {
  withQueryCache,
  invalidateCacheByTag,
  CACHE_TAGS,
} from "@/lib/performance/cache-strategy";
import {
  sanitizeString,
  stripHtml,
  sanitizeUrl,
} from "@/lib/security/input-sanitizer";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
  BusinessRuleError,
} from "@/lib/errors/app-error";
import {
  CreateAmenityCatalogSchema,
  UpdateAmenityCatalogSchema,
  CreateAmenityCategorySchema,
  AssignAmenityToTheatreSchema,
  UpdateTheatreAmenitySchema,
  ReorderTheatreAmenitiesSchema,
} from "@/lib/validation/theatre-amenity.validation";
import type {
  AmenityCategoryRecord,
  AmenityCatalogRecord,
  TheatreAmenityRecord,
  TheatreAmenityWithCatalog,
  PublicTheatreAmenityDTO,
  TheatreAmenityBundle,
  CreateAmenityCatalogInput,
  UpdateAmenityCatalogInput,
  CreateAmenityCategoryInput,
  AssignAmenityToTheatreInput,
  UpdateTheatreAmenityInput,
  ReorderTheatreAmenitiesInput,
  AmenityCatalogFilterParams,
  TheatreAmenityFilterParams,
} from "@/types/theatre-amenity.types";
import type { SecurityActorContext } from "@/types/security-hardening.types";

const logger = createLogger("TheatreAmenityService");

function formatZodIssues(issues: { path: (string | number)[]; message: string }[]): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of issues) {
    const field = issue.path.join(".") || "form";
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  }
  return errors;
}

/**
 * ==============================================================================
 * CineSphere OS — Theatre Amenities & Facilities Service (Phase 3 – Part 5)
 * ==============================================================================
 * Domain service governing the global amenity catalog, dynamic categories,
 * tenant-level amenity assignments, facility metadata, and public projections.
 * ==============================================================================
 */
export class TheatreAmenityService {
  // ----------------------------------------------------------------------------
  // 1. CATEGORY MANAGEMENT (Super Admin Master)
  // ----------------------------------------------------------------------------
  public async createCategory(
    input: CreateAmenityCategoryInput,
    actor?: SecurityActorContext
  ): Promise<AmenityCategoryRecord> {
    const correlationId = actor?.correlationId || `corr-cat-${Date.now()}`;
    logger.info("API", "Creating amenity category", {
      correlationId,
      metadata: { code: input.code, name: input.name },
    });

    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only Super Admins can create global amenity categories.",
        correlationId
      );
    }

    const parsed = CreateAmenityCategorySchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid category payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const category = await theatreAmenityRepository.createCategory({
      code: sanitizeString(data.code.toLowerCase()),
      name: sanitizeString(data.name),
      displayName: data.displayName ? sanitizeString(data.displayName) : sanitizeString(data.name),
      description: data.description ? sanitizeString(stripHtml(data.description)) : null,
      defaultIcon: sanitizeString(data.defaultIcon || "Sparkles"),
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "SUPER_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "CREATE",
      description: `Created amenity category '${category.name}' (${category.code})`,
      metadata: { categoryId: category.id, code: category.code },
    });

    invalidateCacheByTag(CACHE_TAGS.AMENITY_CATALOG);
    return category;
  }

  public async listCategories(): Promise<AmenityCategoryRecord[]> {
    return theatreAmenityRepository.findAllCategories();
  }

  // ----------------------------------------------------------------------------
  // 2. CATALOG MANAGEMENT (Super Admin Master)
  // ----------------------------------------------------------------------------
  public async createCatalogItem(
    input: CreateAmenityCatalogInput,
    actor?: SecurityActorContext
  ): Promise<AmenityCatalogRecord> {
    const correlationId = actor?.correlationId || `corr-cat-item-${Date.now()}`;
    logger.info("API", "Creating catalog amenity item", {
      correlationId,
      metadata: { code: input.code, name: input.name },
    });

    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only Super Admins can manage the global Amenity Catalog.",
        correlationId
      );
    }

    const parsed = CreateAmenityCatalogSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid amenity catalog payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const category = await theatreAmenityRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID '${data.categoryId}' not found.`, correlationId);
    }

    const item = await theatreAmenityRepository.createCatalogItem({
      code: sanitizeString(data.code.toLowerCase()),
      name: sanitizeString(data.name),
      displayName: data.displayName ? sanitizeString(data.displayName) : sanitizeString(data.name),
      description: data.description ? sanitizeString(stripHtml(data.description)) : null,
      categoryId: data.categoryId,
      categoryCode: category.code,
      defaultIcon: sanitizeString(data.defaultIcon || category.defaultIcon || "Sparkles"),
      customIconUrl: data.customIconUrl ? sanitizeUrl(data.customIconUrl) : null,
      svgPlaceholder: null,
      iconLibraryPlaceholder: `lucide:${(data.defaultIcon || "sparkles").toLowerCase()}`,
      priority: data.priority || "STANDARD",
      isFeatured: Boolean(data.isFeatured),
      displayOrder: data.displayOrder ?? 0,
      status: data.status || "ACTIVE",
      localizedNames: data.localizedNames || {},
      localizedDescriptions: data.localizedDescriptions || {},
    });

    await theatreAmenityRepository.recordVersion({
      amenityId: item.id,
      theatreAmenityId: null,
      theatreId: null,
      versionNumber: 1,
      changeType: "CATALOG_CREATED",
      changeSummary: `Created master catalog amenity '${item.name}'`,
      snapshot: item as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "SUPER_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "SUPER_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "CREATE",
      description: `Created catalog amenity '${item.name}' (${item.code})`,
      metadata: { amenityId: item.id, code: item.code, categoryCode: category.code },
    });

    invalidateCacheByTag(CACHE_TAGS.AMENITY_CATALOG);
    return item;
  }

  public async updateCatalogItem(
    input: UpdateAmenityCatalogInput,
    actor?: SecurityActorContext
  ): Promise<AmenityCatalogRecord> {
    const correlationId = actor?.correlationId || `corr-cat-upd-${Date.now()}`;
    logger.info("API", "Updating catalog amenity item", {
      correlationId,
      metadata: { id: input.id },
    });

    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only Super Admins can update items in the global Amenity Catalog.",
        correlationId
      );
    }

    const parsed = UpdateAmenityCatalogSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid update payload for catalog amenity.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const current = await theatreAmenityRepository.findCatalogById(data.id);
    if (!current) {
      throw new NotFoundError(`Catalog amenity '${data.id}' does not exist.`, correlationId);
    }

    const updates: Partial<Omit<AmenityCatalogRecord, "id" | "createdAt" | "version">> = {};
    if (data.code !== undefined) updates.code = sanitizeString(data.code.toLowerCase());
    if (data.name !== undefined) updates.name = sanitizeString(data.name);
    if (data.displayName !== undefined) updates.displayName = sanitizeString(data.displayName);
    if (data.description !== undefined) updates.description = data.description ? sanitizeString(stripHtml(data.description)) : null;
    if (data.categoryId !== undefined) {
      const cat = await theatreAmenityRepository.findCategoryById(data.categoryId);
      if (!cat) throw new NotFoundError(`Category '${data.categoryId}' not found.`, correlationId);
      updates.categoryId = data.categoryId;
      updates.categoryCode = cat.code;
    }
    if (data.defaultIcon !== undefined) updates.defaultIcon = sanitizeString(data.defaultIcon);
    if (data.customIconUrl !== undefined) updates.customIconUrl = data.customIconUrl ? sanitizeUrl(data.customIconUrl) : null;
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.isFeatured !== undefined) updates.isFeatured = Boolean(data.isFeatured);
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.status !== undefined) updates.status = data.status;
    if (data.localizedNames !== undefined) updates.localizedNames = data.localizedNames;
    if (data.localizedDescriptions !== undefined) updates.localizedDescriptions = data.localizedDescriptions;

    let updated: AmenityCatalogRecord;
    try {
      updated = await theatreAmenityRepository.updateCatalogItemWithLock({
        id: data.id,
        expectedVersion: data.expectedVersion,
        updates,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Optimistic lock collision")) {
        throw new ConflictError(msg, {
          entity: "AmenityCatalog",
          currentVersion: current.version,
          expectedVersion: data.expectedVersion,
          correlationId,
        });
      }
      throw err;
    }

    await theatreAmenityRepository.recordVersion({
      amenityId: updated.id,
      theatreAmenityId: null,
      theatreId: null,
      versionNumber: updated.version,
      changeType: "CATALOG_UPDATED",
      changeSummary: `Updated catalog amenity '${updated.name}' to v${updated.version}`,
      snapshot: updated as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "SUPER_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "SUPER_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "UPDATE",
      description: `Updated catalog amenity '${updated.name}' (v${updated.version})`,
      metadata: { amenityId: updated.id, nextVersion: updated.version },
    });

    invalidateCacheByTag(CACHE_TAGS.AMENITY_CATALOG);
    return updated;
  }

  public async archiveCatalogItem(id: string, actor?: SecurityActorContext): Promise<AmenityCatalogRecord> {
    const correlationId = actor?.correlationId || `corr-cat-arc-${Date.now()}`;
    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError("Only Super Admins can archive catalog amenities.", correlationId);
    }
    const archived = await theatreAmenityRepository.archiveCatalogItem(id);

    await theatreAmenityRepository.recordVersion({
      amenityId: archived.id,
      theatreAmenityId: null,
      theatreId: null,
      versionNumber: archived.version,
      changeType: "CATALOG_ARCHIVED",
      changeSummary: `Archived catalog amenity '${archived.name}'`,
      snapshot: archived as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "SUPER_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "SUPER_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "ARCHIVE",
      description: `Archived catalog amenity '${archived.name}'`,
      metadata: { amenityId: archived.id },
    });

    invalidateCacheByTag(CACHE_TAGS.AMENITY_CATALOG);
    return archived;
  }

  public async getCatalogItems(params?: AmenityCatalogFilterParams) {
    return theatreAmenityRepository.findAllCatalog(params);
  }

  public async getCatalogItemById(id: string) {
    return theatreAmenityRepository.findCatalogById(id);
  }

  // ----------------------------------------------------------------------------
  // 3. THEATRE AMENITY ASSIGNMENTS (Tenant-Scoped)
  // ----------------------------------------------------------------------------
  public async assignAmenityToTheatre(
    input: AssignAmenityToTheatreInput,
    actor?: SecurityActorContext
  ): Promise<TheatreAmenityWithCatalog> {
    const correlationId = actor?.correlationId || `corr-asgn-${Date.now()}`;
    logger.info("API", "Assigning amenity to theatre", {
      correlationId,
      theatreId: input.theatreId,
      metadata: { amenityId: input.amenityId },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = AssignAmenityToTheatreSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid amenity assignment payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    if (!theatre) {
      throw new NotFoundError(`Theatre tenant '${data.theatreId}' does not exist.`, correlationId);
    }

    const catalog = await theatreAmenityRepository.findCatalogById(data.amenityId);
    if (!catalog) {
      throw new NotFoundError(`Catalog amenity '${data.amenityId}' does not exist.`, correlationId);
    }

    if (catalog.status === "ARCHIVED") {
      throw new ValidationError(
        "Cannot assign an archived catalog amenity to a theatre.",
        { amenityId: ["Catalog amenity is archived."] },
        correlationId
      );
    }

    const assignment = await theatreAmenityRepository.assignAmenity(
      {
        theatreId: data.theatreId,
        amenityId: data.amenityId,
        availability: data.availability || "AVAILABLE",
        notes: data.notes ? sanitizeString(stripHtml(data.notes)) : null,
        displayOrder: data.displayOrder ?? 0,
        visibility: data.visibility || "PUBLIC",
        status: data.status || "ACTIVE",
        isFeatured: Boolean(data.isFeatured),
        entityType: data.entityType || "THEATRE",
        entityId: data.entityId || data.theatreId,
        assignedBy: actor?.userId || null,
        updatedBy: actor?.userId || null,
      },
      data.metadata
    );

    await theatreAmenityRepository.recordVersion({
      amenityId: catalog.id,
      theatreAmenityId: assignment.id,
      theatreId: data.theatreId,
      versionNumber: 1,
      changeType: "THEATRE_ASSIGNED",
      changeSummary: `Assigned amenity '${catalog.name}' to theatre '${theatre.name}'`,
      snapshot: assignment as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "CREATE",
      description: `Assigned amenity '${catalog.name}' to theatre '${theatre.name}' (${assignment.availability})`,
      metadata: {
        assignmentId: assignment.id,
        theatreId: data.theatreId,
        amenityCode: catalog.code,
      },
    });

    this.invalidateAmenityCache(data.theatreId, theatre.slug);
    return assignment;
  }

  public async updateTheatreAmenity(
    input: UpdateTheatreAmenityInput,
    actor?: SecurityActorContext
  ): Promise<TheatreAmenityWithCatalog> {
    const correlationId = actor?.correlationId || `corr-asgn-upd-${Date.now()}`;
    logger.info("API", "Updating theatre amenity assignment", {
      correlationId,
      theatreId: input.theatreId,
      metadata: { assignmentId: input.assignmentId },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = UpdateTheatreAmenitySchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid update payload for theatre amenity.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const data = parsed.data;
    const current = await theatreAmenityRepository.findById(data.assignmentId);
    if (!current) {
      throw new NotFoundError(`Assignment with ID '${data.assignmentId}' not found.`, correlationId);
    }

    if (current.theatreId !== data.theatreId) {
      throw new AuthorizationError(
        "Cross-tenant violation: Assignment does not belong to specified theatre.",
        correlationId
      );
    }

    const updates: Partial<Omit<TheatreAmenityRecord, "id" | "theatreId" | "amenityId" | "createdAt" | "version">> = {
      updatedBy: actor?.userId || null,
    };
    if (data.availability !== undefined) updates.availability = data.availability;
    if (data.notes !== undefined) updates.notes = data.notes ? sanitizeString(stripHtml(data.notes)) : null;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.visibility !== undefined) updates.visibility = data.visibility;
    if (data.status !== undefined) updates.status = data.status;
    if (data.isFeatured !== undefined) updates.isFeatured = Boolean(data.isFeatured);

    let updated: TheatreAmenityWithCatalog;
    try {
      updated = await theatreAmenityRepository.updateAssignmentWithLock({
        assignmentId: data.assignmentId,
        theatreId: data.theatreId,
        expectedVersion: data.expectedVersion,
        updates,
        metadata: data.metadata,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Optimistic lock collision")) {
        throw new ConflictError(msg, {
          entity: "TheatreAmenity",
          currentVersion: current.version,
          expectedVersion: data.expectedVersion,
          correlationId,
        });
      }
      throw err;
    }

    await theatreAmenityRepository.recordVersion({
      amenityId: updated.amenityId,
      theatreAmenityId: updated.id,
      theatreId: data.theatreId,
      versionNumber: updated.version,
      changeType: "THEATRE_UPDATED",
      changeSummary: `Updated assignment for '${updated.amenity.name}' (availability=${updated.availability}, v${updated.version})`,
      snapshot: updated as unknown as Record<string, unknown>,
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "UPDATE",
      description: `Updated theatre amenity '${updated.amenity.name}' to v${updated.version}`,
      metadata: {
        assignmentId: updated.id,
        theatreId: data.theatreId,
        version: updated.version,
      },
    });

    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    this.invalidateAmenityCache(data.theatreId, theatre?.slug);

    return updated;
  }

  public async removeTheatreAmenity(
    assignmentId: string,
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<boolean> {
    const correlationId = actor?.correlationId || `corr-asgn-rm-${Date.now()}`;
    logger.info("AUDIT", "Removing theatre amenity assignment", {
      correlationId,
      theatreId,
      metadata: { assignmentId },
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const current = await theatreAmenityRepository.findById(assignmentId);
    if (!current) {
      throw new NotFoundError(`Assignment '${assignmentId}' does not exist.`, correlationId);
    }

    if (current.theatreId !== theatreId) {
      throw new AuthorizationError(
        "Cross-tenant violation: Assignment does not belong to specified theatre.",
        correlationId
      );
    }

    const catalog = await theatreAmenityRepository.findCatalogById(current.amenityId);
    await theatreAmenityRepository.delete(assignmentId);

    await theatreAmenityRepository.recordVersion({
      amenityId: current.amenityId,
      theatreAmenityId: assignmentId,
      theatreId,
      versionNumber: current.version + 1,
      changeType: "THEATRE_REMOVED",
      changeSummary: `Removed amenity '${catalog?.name || current.amenityId}' from theatre`,
      snapshot: { deletedAssignmentId: assignmentId, theatreId },
      changedBy: actor?.userId || "SYSTEM",
      changedRole: actor?.role || "THEATRE_ADMIN",
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "DELETE",
      description: `Removed amenity '${catalog?.name || current.amenityId}' from theatre '${theatreId}'`,
      metadata: { assignmentId, theatreId },
    });

    const theatre = await theatreLifecycleRepository.findById(theatreId);
    this.invalidateAmenityCache(theatreId, theatre?.slug);

    return true;
  }

  public async reorderTheatreAmenities(
    input: ReorderTheatreAmenitiesInput,
    actor?: SecurityActorContext
  ): Promise<TheatreAmenityRecord[]> {
    const correlationId = actor?.correlationId || `corr-asgn-reorder-${Date.now()}`;
    logger.info("API", "Reordering theatre amenities", {
      correlationId,
      theatreId: input.theatreId,
    });

    if (actor) {
      await tenantService.assertTenantAccess(actor, input.theatreId);
    }

    const parsed = ReorderTheatreAmenitiesSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid reorder payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    const reordered = await theatreAmenityRepository.reorderAssignments(
      input.theatreId,
      input.orderedAssignmentIds
    );

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_AMENITY",
      action: "UPDATE",
      description: `Reordered ${reordered.length} amenities for theatre '${input.theatreId}'`,
      metadata: { theatreId: input.theatreId, count: reordered.length },
    });

    const theatre = await theatreLifecycleRepository.findById(input.theatreId);
    this.invalidateAmenityCache(input.theatreId, theatre?.slug);

    return reordered;
  }

  public async getTheatreAmenities(
    theatreId: string,
    filters?: TheatreAmenityFilterParams,
    actor?: SecurityActorContext
  ): Promise<TheatreAmenityWithCatalog[]> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }
    return theatreAmenityRepository.findAssignmentsByTheatre(theatreId, filters);
  }

  public async getTheatreAmenityBundle(
    theatreId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreAmenityBundle> {
    if (actor) {
      await tenantService.assertTenantAccess(actor, theatreId);
    }

    const [categories, assignments] = await Promise.all([
      theatreAmenityRepository.findAllCategories(),
      theatreAmenityRepository.findAssignmentsByTheatre(theatreId),
    ]);

    const activeCount = assignments.filter((a) => a.status === "ACTIVE").length;
    const availableCount = assignments.filter((a) => a.availability === "AVAILABLE").length;
    const underMaintenanceCount = assignments.filter((a) => a.availability === "UNDER_MAINTENANCE").length;

    return {
      theatreId,
      totalAssigned: assignments.length,
      activeCount,
      availableCount,
      underMaintenanceCount,
      categories,
      assignments,
    };
  }

  // ----------------------------------------------------------------------------
  // 4. PUBLIC PATRON PROJECTION (Cached & Privacy-Guarded)
  // ----------------------------------------------------------------------------
  public async getPublicTheatreAmenities(theatreIdOrSlug: string): Promise<PublicTheatreAmenityDTO[]> {
    const cacheKey = `public:amenities:${theatreIdOrSlug}`;

    return withQueryCache(
      cacheKey,
      async () => {
        let theatre = await theatreLifecycleRepository.findById(theatreIdOrSlug);
        if (!theatre) {
          theatre = await theatreLifecycleRepository.findBySlug(theatreIdOrSlug);
        }
        if (!theatre) {
          return [];
        }

        // Only ACTIVE theatres project public amenities
        if (theatre.status !== "ACTIVE") {
          return [];
        }

        const assignments = await theatreAmenityRepository.findAssignmentsByTheatre(theatre.id, {
          status: "ACTIVE",
          visibility: "PUBLIC",
        });

        return assignments.map((a) => ({
          id: a.amenity.id,
          assignmentId: a.id,
          code: a.amenity.code,
          name: a.amenity.name,
          displayName: a.amenity.displayName,
          description: a.amenity.description,
          category: a.category?.displayName || a.amenity.categoryCode,
          categoryCode: a.amenity.categoryCode,
          icon: a.amenity.defaultIcon,
          priority: a.amenity.priority,
          isFeatured: a.isFeatured || a.amenity.isFeatured,
          availability: a.availability,
          notes: a.notes,
          displayOrder: a.displayOrder,
          metadata: a.metadata
            ? {
                parkingCapacity: a.metadata.parkingCapacity,
                evChargerCount: a.metadata.evChargerCount,
                wifiSsid: a.metadata.wifiSsid,
                accessibilityNotes: a.metadata.accessibilityNotes,
                foodCourtInfo: a.metadata.foodCourtInfo,
                waitingAreaDetails: a.metadata.waitingAreaDetails,
              }
            : null,
        }));
      },
      {
        ttlSeconds: 300,
        tags: [
          CACHE_TAGS.THEATRE_AMENITIES(theatreIdOrSlug),
          CACHE_TAGS.PUBLIC_THEATRE_AMENITIES(theatreIdOrSlug),
        ],
      }
    );
  }

  // ----------------------------------------------------------------------------
  // Helper: Cache Invalidation
  // ----------------------------------------------------------------------------
  public invalidateAmenityCache(theatreId: string, slug?: string): void {
    const tags = [
      CACHE_TAGS.THEATRE_AMENITIES(theatreId),
      CACHE_TAGS.PUBLIC_THEATRE_AMENITIES(theatreId),
    ];
    if (slug) {
      tags.push(CACHE_TAGS.PUBLIC_THEATRE_AMENITIES(slug));
    }
    tags.forEach((t) => invalidateCacheByTag(t));
  }
}

export const theatreAmenityService = new TheatreAmenityService();
