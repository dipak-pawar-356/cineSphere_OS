/**
 * ==============================================================================
 * CineSphere OS — Theatre Address & Location Domain Service (Phase 3 – Part 4)
 * ==============================================================================
 * Core business logic for Theatre Address & Location Management:
 * - Structured address normalization, display formatting, and geographic hierarchy
 * - Latitude & Longitude coordinate governance with accuracy & geohash placeholders
 * - Google Maps & Navigation routing link validation
 * - Super Admin Verification governance workflow (UNVERIFIED -> VERIFIED / REJECTED)
 * - Multi-location chain readiness (Theatre 1:N Locations with primary designation)
 * - Immutable version snapshots and forward rollback
 * - Strict RBAC, tenant isolation, XSS/URL sanitization, audit logs, and cache tagging
 * ==============================================================================
 */

import {
  CACHE_TAGS,
  invalidateCacheByTag,
  withQueryCache,
} from "@/lib/performance/cache-strategy";
import { createLogger } from "@/lib/observability/structured-logger";
import {
  sanitizeString,
  sanitizeUrl,
  stripHtml,
} from "@/lib/security/input-sanitizer";
import { securityAuditService } from "./security-audit.service";
import { tenantService } from "./tenant.service";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { theatreLocationRepository } from "@/lib/repositories/theatre-location.repository";
import {
  CreateTheatreLocationSchema,
  formatStandardAddress,
  generateDisplayAddress,
  isValidGoogleMapsUrl,
  isValidHttpUrl,
  LocationStatusTransitionSchema,
  RetrieveTheatreLocationSchema,
  UpdateCoordinatesSchema,
  UpdateTheatreLocationSchema,
  ValidateAddressInputSchema,
  VerifyLocationSchema,
} from "@/lib/validation/theatre-location.validation";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  AddressValidationResult,
  CreateTheatreLocationInput,
  LocationStatusTransitionInput,
  PaginatedTheatreLocationResult,
  PublicTheatreLocationView,
  SearchTheatreLocationFilters,
  TheatreCoordinatesRecord,
  TheatreGeoMetadataRecord,
  TheatreLocationAuditRecord,
  TheatreLocationBundle,
  TheatreLocationRecord,
  TheatreLocationStatus,
  TheatreLocationVersionRecord,
  UpdateCoordinatesInput,
  UpdateTheatreLocationInput,
  ValidateAddressInput,
  VerifyLocationInput,
} from "@/types/theatre-location.types";

const logger = createLogger("TheatreLocationService");

function formatZodIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "form";
    if (!map[key]) map[key] = [];
    map[key].push(issue.message);
  }
  return map;
}

/**
 * Generates deterministic 8-character Geohash placeholder from coordinates.
 */
export function computeGeohashPlaceholder(lat: number, lng: number): string {
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;
  let hash = "";
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (hash.length < 8) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        minLng = mid;
      } else {
        maxLng = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        minLat = mid;
      } else {
        maxLat = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

/**
 * Returns WKT spatial representation placeholder for PostGIS ST_MakePoint.
 */
export function computeSpatialIndexPlaceholder(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng.toFixed(7)} ${lat.toFixed(7)})`;
}

export class TheatreLocationService {
  /**
   * 1. CREATE LOCATION
   * Creates a dedicated location profile for a theatre.
   */
  public async createLocation(
    input: CreateTheatreLocationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    const correlationId = actor?.correlationId || `corr-loc-${Date.now()}`;
    logger.info("API", "Creating Theatre Location profile", {
      correlationId,
      theatreId: input.theatreId,
    });

    // Validate Zod schema
    const parsed = CreateTheatreLocationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid theatre location details provided.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }
    const data = parsed.data;

    // Tenant Isolation & RBAC
    if (actor) {
      tenantService.assertTenantAccess(actor, data.theatreId);
    }

    // Verify parent theatre exists
    const theatre = await theatreLifecycleRepository.findById(data.theatreId);
    if (!theatre) {
      throw new NotFoundError(
        `Theatre tenant '${data.theatreId}' does not exist.`,
        correlationId
      );
    }

    // Sanitize text inputs
    const addressLine1 = sanitizeString(stripHtml(data.addressLine1));
    const addressLine2 = data.addressLine2 ? sanitizeString(stripHtml(data.addressLine2)) : null;
    const area = data.area ? sanitizeString(stripHtml(data.area)) : null;
    const city = sanitizeString(stripHtml(data.city));
    const district = data.district ? sanitizeString(stripHtml(data.district)) : city;
    const state = sanitizeString(stripHtml(data.state));
    const country = sanitizeString(stripHtml(data.country || "India"));
    const postalCode = sanitizeString(data.postalCode);
    const landmark = data.landmark ? sanitizeString(stripHtml(data.landmark)) : null;
    const locality = data.locality ? sanitizeString(stripHtml(data.locality)) : area;
    const neighbourhood = data.neighbourhood ? sanitizeString(stripHtml(data.neighbourhood)) : null;

    // URL sanitization
    const googleMapsUrl = data.googleMapsUrl ? sanitizeUrl(data.googleMapsUrl) : null;
    const navigationLink = data.navigationLink ? sanitizeUrl(data.navigationLink) : null;

    // Compute pre-formatted address views
    const formattedAddress = formatStandardAddress({
      addressLine1,
      addressLine2,
      area,
      city,
      district,
      state,
      country,
      postalCode,
      landmark,
    });

    const displayAddress = generateDisplayAddress({
      area,
      city,
      state,
      landmark,
    });

    const locationId = `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    // Verification: if Super Admin creates it, mark VERIFIED; otherwise UNVERIFIED
    const isSuperAdmin = actor?.role === "SUPER_ADMIN";
    const verificationStatus = isSuperAdmin ? "VERIFIED" : "UNVERIFIED";

    const record: TheatreLocationRecord = {
      id: locationId,
      theatreId: data.theatreId,
      locationName: sanitizeString(stripHtml(data.locationName || "Main Complex")),
      isPrimary: Boolean(data.isPrimary),
      status: isSuperAdmin ? "VERIFIED" : "DRAFT",
      version: 1,
      addressLine1,
      addressLine2,
      area,
      city,
      district,
      state,
      country,
      postalCode,
      landmark,
      locality,
      neighbourhood,
      displayAddress,
      formattedAddress,
      googleMapsUrl,
      placeId: data.placeId ? sanitizeString(data.placeId) : null,
      mapEmbedUrl: googleMapsUrl ? `${googleMapsUrl}&output=embed` : null,
      mapShareLink: googleMapsUrl,
      navigationLink,
      drivingDirectionsUrl: navigationLink ? `${navigationLink}&mode=driving` : null,
      walkingDirectionsUrl: navigationLink ? `${navigationLink}&mode=walking` : null,
      transitDirectionsUrl: navigationLink ? `${navigationLink}&mode=transit` : null,
      rideBookingUrl: null,
      verificationStatus,
      verifiedBy: isSuperAdmin ? actor.userId : null,
      verifiedAt: isSuperAdmin ? nowIso : null,
      verificationNotes: isSuperAdmin ? "Directly created by Super Admin." : null,
      rejectedReason: null,
      publishedBy: null,
      publishedAt: null,
      archivedBy: null,
      archivedAt: null,
      archivedReason: null,
      createdBy: actor?.userId || null,
      updatedBy: actor?.userId || null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Prepare Coordinates record
    let coordinatesRecord: TheatreCoordinatesRecord | undefined;
    if (data.latitude !== undefined && data.longitude !== undefined) {
      coordinatesRecord = {
        id: `coord-${locationId}`,
        locationId,
        theatreId: data.theatreId,
        latitude: data.latitude,
        longitude: data.longitude,
        coordinateSource: data.coordinateSource || "MANUAL",
        accuracyMeters: 5.0,
        geohash: computeGeohashPlaceholder(data.latitude, data.longitude),
        spatialIndexPlaceholder: computeSpatialIndexPlaceholder(data.latitude, data.longitude),
        elevationMeters: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
    }

    // Prepare GeoMetadata record
    const geoMetadataRecord: TheatreGeoMetadataRecord = {
      id: `geo-${locationId}`,
      locationId,
      theatreId: data.theatreId,
      countryCode: country === "India" ? "IND" : "INT",
      stateCode: state.slice(0, 3).toUpperCase(),
      citySlug: city.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      districtCode: district ? district.slice(0, 3).toUpperCase() : null,
      timezone: theatre.defaultConfig?.timezone || "Asia/Kolkata",
      serviceRadiusKm: 15.0,
      servedPostalCodes: [postalCode],
      nearestLandmarkDistanceMeters: landmark ? 150 : null,
      geoSearchKeywords: [
        record.locationName.toLowerCase(),
        city.toLowerCase(),
        state.toLowerCase(),
        postalCode,
        ...(area ? [area.toLowerCase()] : []),
        ...(landmark ? [landmark.toLowerCase()] : []),
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const created = await theatreLocationRepository.createLocation(
      record,
      coordinatesRecord,
      geoMetadataRecord
    );

    // Initial version ledger
    await theatreLocationRepository.insertVersion({
      id: `ver-${locationId}-1`,
      locationId,
      theatreId: data.theatreId,
      versionNumber: 1,
      previousValues: {},
      nextValues: { ...created },
      updatedFields: ["initial_create"],
      changeSummary: "Initial location created",
      updatedBy: actor?.userId || null,
      updatedByRole: actor?.role || "THEATRE_ADMIN",
      updatedAt: nowIso,
    });

    // Audit Logging
    await this.logAudit({
      locationId,
      theatreId: data.theatreId,
      action: "LOCATION_CREATED",
      actorUserId: actor?.userId,
      actorRole: actor?.role || "SYSTEM",
      metadata: { locationName: created.locationName, city: created.city },
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_LOCATION",
      action: "CREATE",
      description: `Created location '${created.locationName}' for theatre '${theatre.name}'`,
      metadata: { locationId, isPrimary: created.isPrimary },
    });

    this.invalidateLocationCache(data.theatreId, theatre.slug);

    return created;
  }

  /**
   * 2. UPDATE LOCATION
   * Updates physical address, navigation links, and operational parameters with optimistic concurrency.
   */
  public async updateLocation(
    input: UpdateTheatreLocationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    const correlationId = actor?.correlationId || `corr-loc-upd-${Date.now()}`;
    logger.info("API", "Updating Theatre Location profile", {
      correlationId,
      metadata: { locationId: input.locationId },
    });

    const parsed = UpdateTheatreLocationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid update data for theatre location.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }
    const data = parsed.data;

    // Tenant Isolation
    if (actor) {
      tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const current = await theatreLocationRepository.findById(data.locationId);
    if (!current) {
      throw new NotFoundError(`Location '${data.locationId}' does not exist.`, correlationId);
    }

    if (current.theatreId !== data.theatreId) {
      throw new BusinessRuleError(
        "Location does not belong to the specified theatre tenant.",
        correlationId
      );
    }

    // Read-only freeze for archived locations
    if (current.status === "ARCHIVED") {
      throw new ValidationError(
        "Archived locations are frozen in read-only mode and cannot be modified.",
        { status: ["Cannot modify an archived location."] },
        correlationId
      );
    }

    const updates: Partial<TheatreLocationRecord> = {};

    if (data.locationName !== undefined) {
      updates.locationName = sanitizeString(stripHtml(data.locationName));
    }
    if (data.isPrimary !== undefined) {
      updates.isPrimary = Boolean(data.isPrimary);
    }

    // Address fields
    const addr1 = data.addressLine1 !== undefined ? sanitizeString(stripHtml(data.addressLine1)) : current.addressLine1;
    const addr2 = data.addressLine2 !== undefined ? (data.addressLine2 ? sanitizeString(stripHtml(data.addressLine2)) : null) : current.addressLine2;
    const area = data.area !== undefined ? (data.area ? sanitizeString(stripHtml(data.area)) : null) : current.area;
    const city = data.city !== undefined ? sanitizeString(stripHtml(data.city)) : current.city;
    const district = data.district !== undefined ? (data.district ? sanitizeString(stripHtml(data.district)) : null) : current.district;
    const state = data.state !== undefined ? sanitizeString(stripHtml(data.state)) : current.state;
    const country = data.country !== undefined ? sanitizeString(stripHtml(data.country)) : current.country;
    const postalCode = data.postalCode !== undefined ? sanitizeString(data.postalCode) : current.postalCode;
    const landmark = data.landmark !== undefined ? (data.landmark ? sanitizeString(stripHtml(data.landmark)) : null) : current.landmark;
    const locality = data.locality !== undefined ? (data.locality ? sanitizeString(stripHtml(data.locality)) : null) : current.locality;
    const neighbourhood = data.neighbourhood !== undefined ? (data.neighbourhood ? sanitizeString(stripHtml(data.neighbourhood)) : null) : current.neighbourhood;

    updates.addressLine1 = addr1;
    updates.addressLine2 = addr2;
    updates.area = area;
    updates.city = city;
    updates.district = district;
    updates.state = state;
    updates.country = country;
    updates.postalCode = postalCode;
    updates.landmark = landmark;
    updates.locality = locality;
    updates.neighbourhood = neighbourhood;

    // Recompute pre-formatted views
    updates.formattedAddress = formatStandardAddress({
      addressLine1: addr1,
      addressLine2: addr2,
      area,
      city,
      district,
      state,
      country,
      postalCode,
      landmark,
    });
    updates.displayAddress = generateDisplayAddress({
      area,
      city,
      state,
      landmark,
    });

    // Maps & Navigation
    if (data.googleMapsUrl !== undefined) {
      updates.googleMapsUrl = data.googleMapsUrl ? sanitizeUrl(data.googleMapsUrl) : null;
    }
    if (data.placeId !== undefined) {
      updates.placeId = data.placeId ? sanitizeString(data.placeId) : null;
    }
    if (data.mapEmbedUrl !== undefined) {
      updates.mapEmbedUrl = data.mapEmbedUrl ? sanitizeUrl(data.mapEmbedUrl) : null;
    }
    if (data.mapShareLink !== undefined) {
      updates.mapShareLink = data.mapShareLink ? sanitizeUrl(data.mapShareLink) : null;
    }
    if (data.navigationLink !== undefined) {
      updates.navigationLink = data.navigationLink ? sanitizeUrl(data.navigationLink) : null;
    }
    if (data.drivingDirectionsUrl !== undefined) {
      updates.drivingDirectionsUrl = data.drivingDirectionsUrl ? sanitizeUrl(data.drivingDirectionsUrl) : null;
    }
    if (data.walkingDirectionsUrl !== undefined) {
      updates.walkingDirectionsUrl = data.walkingDirectionsUrl ? sanitizeUrl(data.walkingDirectionsUrl) : null;
    }
    if (data.transitDirectionsUrl !== undefined) {
      updates.transitDirectionsUrl = data.transitDirectionsUrl ? sanitizeUrl(data.transitDirectionsUrl) : null;
    }
    if (data.rideBookingUrl !== undefined) {
      updates.rideBookingUrl = data.rideBookingUrl ? sanitizeUrl(data.rideBookingUrl) : null;
    }

    // Re-verification governance: If Theatre Admin edits verified address, reset to PENDING_REVIEW
    if (
      actor?.role === "THEATRE_ADMIN" &&
      current.verificationStatus === "VERIFIED" &&
      (data.addressLine1 !== undefined ||
        data.city !== undefined ||
        data.postalCode !== undefined ||
        data.state !== undefined)
    ) {
      updates.verificationStatus = "PENDING_REVIEW";
      updates.verificationNotes = "Address was modified by Theatre Admin. Re-verification required.";
    }

    let updated: TheatreLocationRecord;
    try {
      updated = await theatreLocationRepository.updateLocationWithOptimisticLock({
        locationId: data.locationId,
        expectedVersion: data.expectedVersion,
        updates,
        actorUserId: actor?.userId,
        actorRole: actor?.role || "THEATRE_ADMIN",
        changeSummary: `Updated location properties: ${Object.keys(updates).join(", ")}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Optimistic lock collision")) {
        throw new ConflictError(msg, {
          entity: "TheatreLocation",
          currentVersion: current.version,
          expectedVersion: data.expectedVersion,
          correlationId,
        });
      }
      throw err;
    }

    // Update GeoMetadata if service radius or served postal codes supplied
    if (data.serviceRadiusKm !== undefined || data.servedPostalCodes !== undefined) {
      const currentGeo = await theatreLocationRepository.getGeoMetadata(data.locationId);
      if (currentGeo) {
        await theatreLocationRepository.updateGeoMetadata({
          ...currentGeo,
          serviceRadiusKm: data.serviceRadiusKm ?? currentGeo.serviceRadiusKm,
          servedPostalCodes: data.servedPostalCodes ?? currentGeo.servedPostalCodes,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await this.logAudit({
      locationId: data.locationId,
      theatreId: data.theatreId,
      action: "LOCATION_UPDATED",
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      metadata: { updatedFields: Object.keys(updates), nextVersion: updated.version },
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "THEATRE_ADMIN", permissions: [], correlationId },
      module: "THEATRE_LOCATION",
      action: "UPDATE",
      description: `Updated location '${updated.locationName}' to version v${updated.version}`,
      metadata: { locationId: data.locationId, version: updated.version },
    });

    const th = await theatreLifecycleRepository.findById(data.theatreId);
    this.invalidateLocationCache(data.theatreId, th?.slug);

    return updated;
  }

  /**
   * 3. UPDATE COORDINATES
   * Sets latitude and longitude, computing geohash and spatial index placeholders.
   */
  public async updateCoordinates(
    input: UpdateCoordinatesInput,
    actor?: SecurityActorContext
  ): Promise<TheatreCoordinatesRecord> {
    const correlationId = actor?.correlationId || `corr-loc-coords-${Date.now()}`;
    logger.info("API", "Updating coordinates", {
      correlationId,
      metadata: { locationId: input.locationId },
    });

    const parsed = UpdateCoordinatesSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid coordinates provided.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }
    const data = parsed.data;

    if (actor) {
      tenantService.assertTenantAccess(actor, data.theatreId);
    }

    const location = await theatreLocationRepository.findById(data.locationId);
    if (!location) {
      throw new NotFoundError(`Location '${data.locationId}' does not exist.`, correlationId);
    }

    if (location.status === "ARCHIVED") {
      throw new ValidationError(
        "Cannot update coordinates on an archived location.",
        { status: ["Archived location is read-only."] },
        correlationId
      );
    }

    const geohash = computeGeohashPlaceholder(data.latitude, data.longitude);
    const spatialIndexPlaceholder = computeSpatialIndexPlaceholder(data.latitude, data.longitude);
    const nowIso = new Date().toISOString();

    const existingCoords = await theatreLocationRepository.getCoordinates(data.locationId);

    const record: TheatreCoordinatesRecord = {
      id: existingCoords?.id || `coord-${data.locationId}`,
      locationId: data.locationId,
      theatreId: data.theatreId,
      latitude: data.latitude,
      longitude: data.longitude,
      coordinateSource: data.coordinateSource || "MANUAL",
      accuracyMeters: data.accuracyMeters !== undefined ? data.accuracyMeters : existingCoords?.accuracyMeters ?? 5.0,
      geohash,
      spatialIndexPlaceholder,
      elevationMeters: data.elevationMeters !== undefined ? data.elevationMeters : existingCoords?.elevationMeters ?? null,
      createdAt: existingCoords?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const saved = await theatreLocationRepository.updateCoordinates(record);

    // Also auto-sync google maps URL and navigation link if not present
    const mapsUrl = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;

    await theatreLocationRepository.updateLocationWithOptimisticLock({
      locationId: data.locationId,
      updates: {
        googleMapsUrl: location.googleMapsUrl || mapsUrl,
        navigationLink: location.navigationLink || navUrl,
      },
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      changeSummary: "Coordinates updated",
    });

    await this.logAudit({
      locationId: data.locationId,
      theatreId: data.theatreId,
      action: "COORDINATES_UPDATED",
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      metadata: { latitude: data.latitude, longitude: data.longitude, geohash },
    });

    const th = await theatreLifecycleRepository.findById(data.theatreId);
    this.invalidateLocationCache(data.theatreId, th?.slug);

    return saved;
  }

  /**
   * 4. VERIFY LOCATION
   * Super Admin review workflow validating physical location authenticity.
   */
  public async verifyLocation(
    input: VerifyLocationInput,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    const correlationId = actor?.correlationId || `corr-loc-ver-${Date.now()}`;
    logger.info("AUDIT", "Verifying location", {
      correlationId,
      metadata: { locationId: input.locationId },
    });

    if (actor && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Access denied: Only Super Admin has authority to verify theatre locations.",
        correlationId
      );
    }

    const parsed = VerifyLocationSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid verification payload.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }
    const data = parsed.data;

    const location = await theatreLocationRepository.findById(data.locationId);
    if (!location) {
      throw new NotFoundError(`Location '${data.locationId}' does not exist.`, correlationId);
    }

    const nowIso = new Date().toISOString();
    const isApproved = data.decision === "VERIFY";

    const updates: Partial<TheatreLocationRecord> = {
      verificationStatus: isApproved ? "VERIFIED" : "REJECTED",
      verifiedBy: actor?.userId || null,
      verifiedAt: nowIso,
      verificationNotes: data.notes ? sanitizeString(stripHtml(data.notes)) : null,
      rejectedReason: !isApproved && data.reason ? sanitizeString(stripHtml(data.reason)) : null,
      status: isApproved && location.status === "DRAFT" ? "VERIFIED" : location.status,
    };

    const updated = await theatreLocationRepository.updateLocationWithOptimisticLock({
      locationId: data.locationId,
      updates,
      actorUserId: actor?.userId,
      actorRole: "SUPER_ADMIN",
      changeSummary: `Location ${isApproved ? "verified" : "rejected"} by Super Admin`,
    });

    await this.logAudit({
      locationId: data.locationId,
      theatreId: location.theatreId,
      action: "LOCATION_VERIFIED",
      actorUserId: actor?.userId,
      actorRole: "SUPER_ADMIN",
      metadata: { decision: data.decision, verificationStatus: updated.verificationStatus },
    });

    await securityAuditService.recordAudit({
      actor: actor || { userId: "SYSTEM", role: "SUPER_ADMIN", permissions: [], correlationId },
      module: "THEATRE_LOCATION",
      action: "UPDATE",
      description: `Location '${updated.locationName}' verification decision: ${data.decision}`,
      metadata: { locationId: data.locationId, decision: data.decision },
    });

    const th = await theatreLifecycleRepository.findById(location.theatreId);
    this.invalidateLocationCache(location.theatreId, th?.slug);

    return updated;
  }

  /**
   * 5. CHANGE LOCATION STATUS
   * Lifecycle transitions: DRAFT -> VERIFIED -> PUBLISHED -> ARCHIVED.
   */
  public async changeLocationStatus(
    locationId: string,
    targetStatus: TheatreLocationStatus,
    reason: string | undefined,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    const correlationId = actor?.correlationId || `corr-loc-stat-${Date.now()}`;
    logger.info("AUDIT", "Transitioning location status", {
      correlationId,
      metadata: { locationId, targetStatus },
    });

    const location = await theatreLocationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundError(`Location '${locationId}' does not exist.`, correlationId);
    }

    if (actor) {
      tenantService.assertTenantAccess(actor, location.theatreId);
    }

    // Archived is terminal unless restored by Super Admin
    if (location.status === "ARCHIVED" && actor?.role !== "SUPER_ADMIN") {
      throw new ValidationError(
        "Archived locations cannot be re-activated except by Super Admin.",
        { status: ["Permission denied."] },
        correlationId
      );
    }

    // Publication governance rule: Must be VERIFIED before it can be PUBLISHED to patrons
    if (targetStatus === "PUBLISHED" && location.verificationStatus !== "VERIFIED") {
      throw new ValidationError(
        "Cannot publish an unverified location. Theatre location must be verified by Super Admin first.",
        { verificationStatus: ["Location requires Super Admin verification before publication."] },
        correlationId
      );
    }

    const nowIso = new Date().toISOString();
    const sanitizedReason = reason ? sanitizeString(stripHtml(reason)) : undefined;
    const updates: Partial<TheatreLocationRecord> = {
      status: targetStatus,
    };

    if (targetStatus === "PUBLISHED") {
      updates.publishedBy = actor?.userId || null;
      updates.publishedAt = nowIso;
    } else if (targetStatus === "ARCHIVED") {
      updates.archivedBy = actor?.userId || null;
      updates.archivedAt = nowIso;
      updates.archivedReason = sanitizedReason;
    }

    const updated = await theatreLocationRepository.updateLocationWithOptimisticLock({
      locationId,
      updates,
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      changeSummary: `Status changed: ${location.status} -> ${targetStatus}${reason ? ` (${reason})` : ""}`,
    });

    const auditAction =
      targetStatus === "PUBLISHED"
        ? "LOCATION_PUBLISHED"
        : targetStatus === "ARCHIVED"
        ? "LOCATION_ARCHIVED"
        : "LOCATION_UPDATED";

    await this.logAudit({
      locationId,
      theatreId: location.theatreId,
      action: auditAction,
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      metadata: { fromStatus: location.status, toStatus: targetStatus, reason: sanitizedReason },
    });

    const th = await theatreLifecycleRepository.findById(location.theatreId);
    this.invalidateLocationCache(location.theatreId, th?.slug);

    return updated;
  }

  /**
   * 6. ARCHIVE LOCATION
   */
  public async archiveLocation(
    locationId: string,
    reason: string | undefined,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    return this.changeLocationStatus(locationId, "ARCHIVED", reason, actor);
  }

  /**
   * 7. RETRIEVE LOCATIONS
   * Multi-faceted search, hierarchical filtering, and pre-pagination tenant isolation.
   */
  public async retrieveLocations(
    filters: SearchTheatreLocationFilters,
    actor?: SecurityActorContext
  ): Promise<PaginatedTheatreLocationResult> {
    const correlationId = actor?.correlationId || `corr-loc-ret-${Date.now()}`;
    logger.debug("API", "Retrieving theatre locations", {
      correlationId,
      metadata: { ...filters },
    });

    const parsed = RetrieveTheatreLocationSchema.safeParse(filters);
    if (!parsed.success) {
      throw new ValidationError(
        "Invalid retrieval parameters.",
        formatZodIssues(parsed.error.issues),
        correlationId
      );
    }

    // Role-based scoping: Theatre Admin restricted to own theatre
    let scopedTenantId = filters.scopedTenantId || filters.theatreId;
    if (actor && actor.role === "THEATRE_ADMIN") {
      if (actor.theatreId) {
        if (scopedTenantId && scopedTenantId !== actor.theatreId) {
          throw new AuthorizationError(
            `Cross-tenant access denied: You cannot view locations for theatre '${scopedTenantId}'.`,
            correlationId
          );
        }
        scopedTenantId = actor.theatreId;
      }
    }

    return theatreLocationRepository.searchAndPaginate({
      ...filters,
      scopedTenantId,
    });
  }

  /**
   * 8. GET LOCATION BUNDLE
   */
  public async getLocationBundle(
    locationId: string,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationBundle> {
    const correlationId = actor?.correlationId || `corr-loc-bnd-${Date.now()}`;
    const bundle = await theatreLocationRepository.getLocationBundle(locationId);
    if (!bundle) {
      throw new NotFoundError(`Location '${locationId}' does not exist.`, correlationId);
    }

    if (actor) {
      tenantService.assertTenantAccess(actor, bundle.location.theatreId);
    }

    return bundle;
  }

  /**
   * 9. GET PUBLIC THEATRE LOCATION
   * Resolves primary published location for public patrons.
   */
  public async getPublicTheatreLocation(
    theatreIdOrSlug: string
  ): Promise<PublicTheatreLocationView | null> {
    const cacheKey = `public:theatre-location:${theatreIdOrSlug}`;

    return withQueryCache(
      cacheKey,
      async () => {
        // Resolve theatre by ID or slug
        let theatre = await theatreLifecycleRepository.findById(theatreIdOrSlug);
        if (!theatre) {
          theatre = await theatreLifecycleRepository.findBySlug(theatreIdOrSlug);
        }
        if (!theatre) return null;

        const primary = await theatreLocationRepository.getPrimaryLocation(theatre.id);
        if (!primary) return null;

        // Patron visibility rule: Only PUBLISHED locations are accessible
        if (primary.status !== "PUBLISHED") {
          return null;
        }

        const coords = await theatreLocationRepository.getCoordinates(primary.id);

        return {
          theatreId: theatre.id,
          theatreName: theatre.name,
          theatreSlug: theatre.slug,
          locationId: primary.id,
          locationName: primary.locationName,
          isPrimary: primary.isPrimary,
          completeAddress: primary.formattedAddress || primary.addressLine1,
          displayAddress: primary.displayAddress || `${primary.city}, ${primary.state}`,
          formattedAddress: primary.formattedAddress || primary.addressLine1,
          landmark: primary.landmark,
          city: primary.city,
          state: primary.state,
          country: primary.country,
          postalCode: primary.postalCode,
          coordinates: coords
            ? {
                latitude: Number(coords.latitude),
                longitude: Number(coords.longitude),
              }
            : null,
          googleMapsUrl: primary.googleMapsUrl,
          navigationLink: primary.navigationLink,
        };
      },
      {
        ttlSeconds: 60,
        tags: [
          CACHE_TAGS.PUBLIC_THEATRE_LOCATION(theatreIdOrSlug),
          CACHE_TAGS.THEATRE(theatreIdOrSlug),
        ],
      }
    );
  }

  /**
   * 10. VALIDATE ADDRESS
   * Helper utility for UI forms validating mandatory lines and postal codes.
   */
  public async validateAddress(
    input: ValidateAddressInput
  ): Promise<AddressValidationResult> {
    const parsed = ValidateAddressInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        isValid: false,
        normalizedAddress: "",
        formattedDisplay: "",
        fieldErrors: formatZodIssues(parsed.error.issues),
      };
    }

    const data = parsed.data;
    const normalized = formatStandardAddress({
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      country: data.country || "India",
      postalCode: data.postalCode,
    });

    const display = generateDisplayAddress({
      city: data.city,
      state: data.state,
    });

    const warnings: string[] = [];
    if (data.country === "India" && !/^[1-9][0-9]{5}$/.test(data.postalCode)) {
      warnings.push("Postal code does not conform to the 6-digit Indian PIN format.");
    }

    return {
      isValid: true,
      normalizedAddress: normalized,
      formattedDisplay: display,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * 11. ROLLBACK TO VERSION
   * Restores historical snapshot values as a new forward version without mutating history.
   */
  public async rollbackToVersion(
    locationId: string,
    versionNumber: number,
    actor?: SecurityActorContext
  ): Promise<TheatreLocationRecord> {
    const correlationId = actor?.correlationId || `corr-loc-rb-${Date.now()}`;
    logger.info("AUDIT", "Rolling back location version", {
      correlationId,
      metadata: { locationId, versionNumber },
    });

    const location = await theatreLocationRepository.findById(locationId);
    if (!location) {
      throw new NotFoundError(`Location '${locationId}' does not exist.`, correlationId);
    }

    if (actor) {
      tenantService.assertTenantAccess(actor, location.theatreId);
    }

    const versions = await theatreLocationRepository.getVersions(locationId);
    const target = versions.find((v) => v.versionNumber === versionNumber);
    if (!target) {
      throw new NotFoundError(
        `Version v${versionNumber} not found for location '${locationId}'.`,
        correlationId
      );
    }

    const snapshot = target.nextValues as Partial<TheatreLocationRecord>;
    const restoredUpdates: Partial<TheatreLocationRecord> = {
      locationName: snapshot.locationName || location.locationName,
      addressLine1: snapshot.addressLine1 || location.addressLine1,
      addressLine2: snapshot.addressLine2,
      area: snapshot.area,
      city: snapshot.city || location.city,
      district: snapshot.district,
      state: snapshot.state || location.state,
      country: snapshot.country || location.country,
      postalCode: snapshot.postalCode || location.postalCode,
      landmark: snapshot.landmark,
      locality: snapshot.locality,
      neighbourhood: snapshot.neighbourhood,
      googleMapsUrl: snapshot.googleMapsUrl,
      placeId: snapshot.placeId,
      navigationLink: snapshot.navigationLink,
      formattedAddress: snapshot.formattedAddress,
      displayAddress: snapshot.displayAddress,
    };

    const rolledBack = await theatreLocationRepository.updateLocationWithOptimisticLock({
      locationId,
      updates: restoredUpdates,
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      changeSummary: `Rolled back to version v${versionNumber} snapshot`,
    });

    await this.logAudit({
      locationId,
      theatreId: location.theatreId,
      action: "LOCATION_UPDATED",
      actorUserId: actor?.userId,
      actorRole: actor?.role || "THEATRE_ADMIN",
      metadata: { rollbackFromVersion: location.version, rollbackToVersion: versionNumber },
    });

    const th = await theatreLifecycleRepository.findById(location.theatreId);
    this.invalidateLocationCache(location.theatreId, th?.slug);

    return rolledBack;
  }

  private async logAudit(record: Omit<TheatreLocationAuditRecord, "id" | "timestamp">) {
    try {
      await theatreLocationRepository.insertAudit({
        id: `aud-loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        ...record,
      });
    } catch (err) {
      logger.error("API", "Failed to persist location audit log", { error: err });
    }
  }

  private invalidateLocationCache(theatreId: string, slug?: string) {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_LOCATION(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_LOCATION(theatreId));
    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    if (slug) {
      invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_LOCATION(slug));
      invalidateCacheByTag(CACHE_TAGS.THEATRE(slug));
    }
  }
}

export const theatreLocationService = new TheatreLocationService();
