/**
 * ==============================================================================
 * CineSphere OS — Theatre Address & Location Repository (Phase 3 – Part 4)
 * ==============================================================================
 * Data access layer managing normalized TheatreLocation, TheatreCoordinates,
 * TheatreGeoMetadata, and TheatreLocationVersion stores.
 * Ready for Drizzle PostgreSQL swap.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { MOCK_THEATRES } from "@/data";
import { paginateArray } from "@/lib/performance/cache-strategy";
import {
  PaginatedTheatreLocationResult,
  SearchTheatreLocationFilters,
  TheatreCoordinatesRecord,
  TheatreGeoMetadataRecord,
  TheatreLocationAuditRecord,
  TheatreLocationBundle,
  TheatreLocationRecord,
  TheatreLocationStatus,
  TheatreLocationVerificationStatus,
  TheatreLocationVersionRecord,
} from "@/types/theatre-location.types";
import {
  formatStandardAddress,
  generateDisplayAddress,
} from "@/lib/validation/theatre-location.validation";

const locationStore = new Map<string, TheatreLocationRecord>();
const coordinatesStore = new Map<string, TheatreCoordinatesRecord>();
const geoMetadataStore = new Map<string, TheatreGeoMetadataRecord>();
const versionStore: TheatreLocationVersionRecord[] = [];
const auditStore: TheatreLocationAuditRecord[] = [];

/**
 * Seed initial locations from mock theatres if store is empty.
 */
function initializeLocationStore() {
  if (locationStore.size > 0) return;

  MOCK_THEATRES.forEach((th) => {
    const locationId = `loc-${th.id}`;
    const lat = th.id === "th-pun-001" ? 18.562145 : th.id === "th-mum-001" ? 18.995281 : 28.613939;
    const lng = th.id === "th-pun-001" ? 73.916723 : th.id === "th-mum-001" ? 72.824982 : 77.209021;
    const area = th.id === "th-pun-001" ? "Viman Nagar" : th.id === "th-mum-001" ? "Lower Parel" : "Connaught Place";
    const landmark = th.id === "th-pun-001" ? "Phoenix Marketcity Level 4" : "High Street Phoenix Mall";

    const formattedAddress = formatStandardAddress({
      addressLine1: th.address,
      area,
      city: th.city,
      state: th.state,
      country: th.country || "India",
      postalCode: th.pinCode || "411014",
      landmark,
    });

    const displayAddress = generateDisplayAddress({
      area,
      city: th.city,
      state: th.state,
      landmark,
    });

    const record: TheatreLocationRecord = {
      id: locationId,
      theatreId: th.id,
      locationName: "Main Complex",
      isPrimary: true,
      status: "PUBLISHED",
      version: 1,
      addressLine1: th.address,
      addressLine2: "Multiplex Wing",
      area,
      city: th.city,
      district: th.city,
      state: th.state,
      country: th.country || "India",
      postalCode: th.pinCode || "411014",
      landmark,
      locality: area,
      neighbourhood: `${area} Ward`,
      displayAddress,
      formattedAddress,
      googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
      placeId: `ChIJ_${th.id.toUpperCase()}_CINESPHERE`,
      mapEmbedUrl: `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      mapShareLink: `https://maps.app.goo.gl/${th.slug}`,
      navigationLink: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      drivingDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      walkingDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`,
      transitDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`,
      rideBookingUrl: `uber://?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(th.name)}`,
      verificationStatus: "VERIFIED",
      verifiedBy: "usr-super-1",
      verifiedAt: "2026-11-01T00:00:00.000Z",
      verificationNotes: "Physical premises & fire safety clearance verified by Super Admin.",
      publishedBy: "usr-super-1",
      publishedAt: "2026-11-01T00:00:00.000Z",
      createdBy: "usr-super-1",
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    };

    locationStore.set(locationId, record);

    coordinatesStore.set(locationId, {
      id: `coord-${locationId}`,
      locationId,
      theatreId: th.id,
      latitude: lat,
      longitude: lng,
      coordinateSource: "GEOCODED",
      accuracyMeters: 5.0,
      geohash: "te7u0x",
      spatialIndexPlaceholder: `POINT(${lng} ${lat})`,
      elevationMeters: 560.0,
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    });

    geoMetadataStore.set(locationId, {
      id: `geo-${locationId}`,
      locationId,
      theatreId: th.id,
      countryCode: "IND",
      stateCode: th.state === "Maharashtra" ? "MH" : "DL",
      citySlug: th.city.toLowerCase(),
      districtCode: th.city.toUpperCase().slice(0, 3),
      timezone: "Asia/Kolkata",
      serviceRadiusKm: 25.0,
      servedPostalCodes: [th.pinCode || "411014"],
      nearestLandmarkDistanceMeters: 120,
      geoSearchKeywords: [th.name.toLowerCase(), th.city.toLowerCase(), area.toLowerCase()],
      geoFencePolygonPlaceholder: [
        { lat: lat + 0.002, lng: lng - 0.002 },
        { lat: lat + 0.002, lng: lng + 0.002 },
        { lat: lat - 0.002, lng: lng + 0.002 },
        { lat: lat - 0.002, lng: lng - 0.002 },
      ],
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-01T00:00:00.000Z",
    });

    versionStore.push({
      id: `ver-${locationId}-1`,
      locationId,
      theatreId: th.id,
      versionNumber: 1,
      previousValues: {},
      nextValues: { ...record },
      updatedFields: ["initial_seed"],
      changeSummary: "Initial location baseline established",
      updatedBy: "usr-super-1",
      updatedByRole: "SUPER_ADMIN",
      updatedAt: "2026-11-01T00:00:00.000Z",
    });
  });
}

initializeLocationStore();

export class TheatreLocationRepository extends BaseRepository<TheatreLocationRecord> {
  protected entityName = "TheatreLocation";

  public resetStore(): void {
    locationStore.clear();
    coordinatesStore.clear();
    geoMetadataStore.clear();
    versionStore.length = 0;
    auditStore.length = 0;
    initializeLocationStore();
  }

  public async findAll(filters?: Record<string, unknown>): Promise<TheatreLocationRecord[]> {
    initializeLocationStore();
    let list = Array.from(locationStore.values());
    if (filters?.theatreId) {
      list = list.filter((l) => l.theatreId === filters.theatreId);
    }
    return structuredClone(list);
  }

  public async create(): Promise<TheatreLocationRecord> {
    throw new Error("Use createLocation for complete validated theatre location creation.");
  }

  public async update(
    id: string,
    data: Partial<TheatreLocationRecord>
  ): Promise<TheatreLocationRecord | null> {
    initializeLocationStore();
    const existing = locationStore.get(id);
    if (!existing) return null;
    const updated: TheatreLocationRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    locationStore.set(id, structuredClone(updated));
    return structuredClone(updated);
  }

  public async delete(id: string): Promise<boolean> {
    initializeLocationStore();
    coordinatesStore.delete(id);
    geoMetadataStore.delete(id);
    return locationStore.delete(id);
  }

  public async findByTheatreId(theatreId: string): Promise<TheatreLocationRecord[]> {
    initializeLocationStore();
    return Array.from(locationStore.values()).filter((l) => l.theatreId === theatreId);
  }

  public async getPrimaryLocation(theatreId: string): Promise<TheatreLocationRecord | null> {
    initializeLocationStore();
    const list = await this.findByTheatreId(theatreId);
    return list.find((l) => l.isPrimary) || list[0] || null;
  }

  public async findById(locationId: string): Promise<TheatreLocationRecord | null> {
    initializeLocationStore();
    return locationStore.get(locationId) || null;
  }

  public async getCoordinates(locationId: string): Promise<TheatreCoordinatesRecord | null> {
    initializeLocationStore();
    return coordinatesStore.get(locationId) || null;
  }

  public async getGeoMetadata(locationId: string): Promise<TheatreGeoMetadataRecord | null> {
    initializeLocationStore();
    return geoMetadataStore.get(locationId) || null;
  }

  public async getLocationBundle(locationId: string): Promise<TheatreLocationBundle | null> {
    initializeLocationStore();
    const loc = locationStore.get(locationId);
    if (!loc) return null;

    const coords = coordinatesStore.get(locationId) || null;
    const geo = geoMetadataStore.get(locationId) || null;
    const th = MOCK_THEATRES.find((t) => t.id === loc.theatreId);

    return {
      location: { ...loc },
      coordinates: coords ? { ...coords } : null,
      geoMetadata: geo ? { ...geo } : null,
      theatreName: th?.name || "Cinema Complex",
      theatreSlug: th?.slug || loc.theatreId,
    };
  }

  public async getPrimaryBundle(theatreId: string): Promise<TheatreLocationBundle | null> {
    initializeLocationStore();
    const primary = await this.getPrimaryLocation(theatreId);
    if (!primary) return null;
    return this.getLocationBundle(primary.id);
  }

  public async createLocation(
    location: TheatreLocationRecord,
    coordinates?: TheatreCoordinatesRecord,
    geoMetadata?: TheatreGeoMetadataRecord
  ): Promise<TheatreLocationRecord> {
    initializeLocationStore();

    // If this is marked as primary, un-mark existing primary locations for this theatre
    if (location.isPrimary) {
      for (const existing of locationStore.values()) {
        if (existing.theatreId === location.theatreId && existing.isPrimary) {
          locationStore.set(existing.id, {
            ...existing,
            isPrimary: false,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    locationStore.set(location.id, { ...location });

    if (coordinates) {
      coordinatesStore.set(location.id, { ...coordinates });
    }
    if (geoMetadata) {
      geoMetadataStore.set(location.id, { ...geoMetadata });
    }

    return { ...location };
  }

  public async updateLocationWithOptimisticLock(params: {
    locationId: string;
    expectedVersion?: number;
    updates: Partial<TheatreLocationRecord>;
    actorUserId?: string | null;
    actorRole: string;
    changeSummary?: string;
  }): Promise<TheatreLocationRecord> {
    initializeLocationStore();
    const current = locationStore.get(params.locationId);
    if (!current) {
      throw new Error(`Location '${params.locationId}' not found.`);
    }

    if (
      params.expectedVersion !== undefined &&
      current.version !== params.expectedVersion
    ) {
      throw new Error(
        `Optimistic lock collision on Location '${params.locationId}'. Expected version v${params.expectedVersion}, but found v${current.version}.`
      );
    }

    const nextVersion = current.version + 1;
    const updatedFields = Object.keys(params.updates);
    const updatedRecord: TheatreLocationRecord = {
      ...current,
      ...params.updates,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: params.actorUserId || current.updatedBy,
    };

    // If made primary, downgrade others
    if (params.updates.isPrimary) {
      for (const existing of locationStore.values()) {
        if (
          existing.theatreId === current.theatreId &&
          existing.id !== current.id &&
          existing.isPrimary
        ) {
          locationStore.set(existing.id, {
            ...existing,
            isPrimary: false,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    locationStore.set(params.locationId, updatedRecord);

    // Save snapshot in versionStore
    const versionRecord: TheatreLocationVersionRecord = {
      id: `ver-${params.locationId}-${nextVersion}`,
      locationId: params.locationId,
      theatreId: current.theatreId,
      versionNumber: nextVersion,
      previousValues: { ...current },
      nextValues: { ...updatedRecord },
      updatedFields,
      changeSummary: params.changeSummary || `Updated fields: ${updatedFields.join(", ")}`,
      updatedBy: params.actorUserId || null,
      updatedByRole: params.actorRole,
      updatedAt: new Date().toISOString(),
    };
    versionStore.push(versionRecord);

    return { ...updatedRecord };
  }

  public async updateCoordinates(
    coordinates: TheatreCoordinatesRecord
  ): Promise<TheatreCoordinatesRecord> {
    initializeLocationStore();
    coordinatesStore.set(coordinates.locationId, { ...coordinates });
    return { ...coordinates };
  }

  public async updateGeoMetadata(
    geoMetadata: TheatreGeoMetadataRecord
  ): Promise<TheatreGeoMetadataRecord> {
    initializeLocationStore();
    geoMetadataStore.set(geoMetadata.locationId, { ...geoMetadata });
    return { ...geoMetadata };
  }

  public async searchAndPaginate(
    filters: SearchTheatreLocationFilters
  ): Promise<PaginatedTheatreLocationResult> {
    initializeLocationStore();

    let list = Array.from(locationStore.values());

    // Pre-pagination tenant isolation scoping
    if (filters.scopedTenantId) {
      list = list.filter((l) => l.theatreId === filters.scopedTenantId);
    }

    if (filters.status) {
      list = list.filter((l) => l.status === filters.status);
    }

    if (filters.verificationStatus) {
      list = list.filter((l) => l.verificationStatus === filters.verificationStatus);
    }

    if (filters.country) {
      const c = filters.country.toLowerCase();
      list = list.filter((l) => l.country.toLowerCase().includes(c));
    }

    if (filters.state) {
      const s = filters.state.toLowerCase();
      list = list.filter((l) => l.state.toLowerCase().includes(s));
    }

    if (filters.city) {
      const c = filters.city.toLowerCase();
      list = list.filter((l) => l.city.toLowerCase().includes(c));
    }

    if (filters.area) {
      const a = filters.area.toLowerCase();
      list = list.filter((l) => l.area?.toLowerCase().includes(a));
    }

    if (filters.postalCode) {
      list = list.filter((l) => l.postalCode.includes(filters.postalCode!));
    }

    if (filters.landmark) {
      const lm = filters.landmark.toLowerCase();
      list = list.filter((l) => l.landmark?.toLowerCase().includes(lm));
    }

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter((l) => {
        const th = MOCK_THEATRES.find((t) => t.id === l.theatreId);
        return (
          l.locationName.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.postalCode.includes(q) ||
          (l.area && l.area.toLowerCase().includes(q)) ||
          (l.landmark && l.landmark.toLowerCase().includes(q)) ||
          (l.addressLine1 && l.addressLine1.toLowerCase().includes(q)) ||
          (th && th.name.toLowerCase().includes(q))
        );
      });
    }

    // Sort: primary first, then most recently updated
    list.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const paginated = paginateArray(list, { page, pageSize });

    // Hydrate to bundles
    const items: TheatreLocationBundle[] = paginated.items.map((loc) => {
      const th = MOCK_THEATRES.find((t) => t.id === loc.theatreId);
      return {
        location: { ...loc },
        coordinates: coordinatesStore.get(loc.id) || null,
        geoMetadata: geoMetadataStore.get(loc.id) || null,
        theatreName: th?.name || "Cinema Complex",
        theatreSlug: th?.slug || loc.theatreId,
      };
    });

    return {
      items,
      total: paginated.total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
      hasNext: paginated.hasNext,
      hasPrev: paginated.hasPrev,
    };
  }

  public async getVersions(locationId: string): Promise<TheatreLocationVersionRecord[]> {
    initializeLocationStore();
    return versionStore
      .filter((v) => v.locationId === locationId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
  }

  public async insertVersion(version: TheatreLocationVersionRecord): Promise<void> {
    versionStore.push(version);
  }

  public async insertAudit(audit: TheatreLocationAuditRecord): Promise<void> {
    auditStore.push(audit);
  }

  public async getAuditHistory(locationId: string): Promise<TheatreLocationAuditRecord[]> {
    return auditStore
      .filter((a) => a.locationId === locationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const theatreLocationRepository = new TheatreLocationRepository();
