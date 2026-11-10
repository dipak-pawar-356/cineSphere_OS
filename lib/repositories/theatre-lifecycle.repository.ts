/**
 * ==============================================================================
 * CineSphere OS — Theatre Lifecycle Repository (Phase 3 – Part 1)
 * ==============================================================================
 * Data access layer encapsulating multi-tenant theatre lifecycle entities,
 * optimistic locking updates, status transitions, approvals, slug history, and
 * compliance audit trails. Ready for Drizzle PostgreSQL swap without modifying business logic.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { MOCK_THEATRES } from "@/data";
import {
  ManagedTheatreEntity,
  TheatreLifecycleState,
  TheatreApprovalState,
  TheatreLifecycleCapabilities,
  TheatreStatusTransitionRecord,
  TheatreApprovalRecord,
  TheatreSlugHistoryRecord,
  TheatreLifecycleAuditRecord,
  TheatreSearchFilters,
  PaginatedTheatresResult,
} from "@/types/theatre-lifecycle.types";
import { OptimisticLockResult } from "@/types/security-hardening.types";
import { paginateArray } from "@/lib/performance/cache-strategy";

// Deterministic capability computation per lifecycle state
export function deriveCapabilitiesForState(
  state: TheatreLifecycleState
): TheatreLifecycleCapabilities {
  switch (state) {
    case "ACTIVE":
      return {
        allowBookings: true,
        allowShows: true,
        allowPayments: true,
        isReadOnly: false,
      };
    case "ARCHIVED":
    case "SOFT_DELETED":
      return {
        allowBookings: false,
        allowShows: false,
        allowPayments: false,
        isReadOnly: true,
      };
    case "SUSPENDED":
    case "INACTIVE":
    case "APPROVED":
    case "PENDING_APPROVAL":
    case "DRAFT":
    default:
      return {
        allowBookings: false,
        allowShows: false,
        allowPayments: false,
        isReadOnly: false,
      };
  }
}

function generatePublicId(seedIndex?: number): string {
  if (seedIndex !== undefined) {
    const code = (100000 + seedIndex * 7919).toString(36).toUpperCase().padStart(6, "X");
    return `TH-PUB-${code}`;
  }
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TH-PUB-${rand}`;
}

function normalizePricingTier(
  tier?: string
): "LUXURY" | "PREMIUM" | "STANDARD" | "BUDGET" {
  const upper = (tier || "STANDARD").toUpperCase();
  if (upper === "LUXURY" || upper === "PREMIUM" || upper === "BUDGET") {
    return upper;
  }
  return "STANDARD";
}

// In-memory Datamart Stores
const theatreStore = new Map<string, ManagedTheatreEntity>();
const statusHistoryStore: TheatreStatusTransitionRecord[] = [];
const approvalStore: TheatreApprovalRecord[] = [];
const slugHistoryStore: TheatreSlugHistoryRecord[] = [];
const lifecycleAuditStore: TheatreLifecycleAuditRecord[] = [];

function initializeLifecycleStore() {
  theatreStore.clear();
  statusHistoryStore.length = 0;
  approvalStore.length = 0;
  slugHistoryStore.length = 0;
  lifecycleAuditStore.length = 0;

  // Seed from MOCK_THEATRES (ensuring th-pun-001, th-mum-001, th-blr-001 exist natively)
  MOCK_THEATRES.forEach((th, idx) => {
    const status: TheatreLifecycleState =
      th.id === "th-del-001"
        ? "SUSPENDED"
        : th.id === "th-hyd-001"
        ? "PENDING_APPROVAL"
        : th.id === "th-chn-001"
        ? "APPROVED"
        : "ACTIVE";

    const approvalStatus: TheatreApprovalState =
      status === "PENDING_APPROVAL" ? "PENDING" : "APPROVED";

    const now = new Date(Date.now() - idx * 86400000).toISOString();

    const entity: ManagedTheatreEntity = {
      id: th.id,
      publicId: generatePublicId(idx + 1),
      slug: th.slug,
      name: th.name,
      chain: th.chain,
      code: th.code || `CS-CODE-${idx + 1}`,
      tagline: th.tagline,
      description: th.description,
      gstNumber: th.gstNumber || `27AABCP${1000 + idx}C1Z5`,
      pricingTier: normalizePricingTier(th.pricingTier),
      subscriptionPlan: idx === 0 ? "Enterprise" : idx % 2 === 0 ? "Professional" : "Starter",
      contactEmail: th.contact?.email || `desk@${th.slug}.cinesphere.io`,
      contactNumber: th.contact?.phone || "+91 20 6689 4500",
      adminName:
        th.id === "th-pun-001"
          ? "Rajesh Kulkarni"
          : th.id === "th-mum-001"
          ? "Ananya Deshmukh"
          : `General Manager (${th.city})`,
      adminEmail:
        th.id === "th-pun-001"
          ? "gm.pune@cinesphere.io"
          : `gm.${th.city.toLowerCase().replace(/\s+/g, "")}@cinesphere.io`,
      address: th.address,
      city: th.city,
      state: th.state,
      pinCode: th.pinCode || "411014",
      country: th.country || "India",
      branding: {
        logoUrl: th.logo,
        bannerUrl: th.banner,
        primaryColor: th.brandColors?.primary || "#E50914",
        secondaryColor: th.brandColors?.secondary || "#0A0B10",
        accentColor: th.brandColors?.accent || "#F59E0B",
      },
      defaultConfig: {
        timezone: th.timezone || "Asia/Kolkata",
        currency: th.currency || "INR",
        openingTime: th.openingTime || "08:00 AM",
        closingTime: th.closingTime || "01:30 AM",
        convenienceFeeDefault: 35,
        allowSelfCheckIn: true,
        maxSeatsPerBooking: 10,
      },
      hallCount: th.hallCount,
      screenTypes: th.screenTypes,
      rating: th.rating,
      grossRevenueMonthly: 4820000 + idx * 450000,
      totalBookings: 14200 + idx * 910,
      status,
      approvalStatus,
      capabilities: deriveCapabilitiesForState(status),
      version: 1,
      suspension:
        status === "SUSPENDED"
          ? {
              reason: "Annual Fire NOC inspection renewal pending municipal clearance",
              startTime: now,
              suspendedBy: "usr-super-1",
              suspendedAt: now,
            }
          : undefined,
      softDelete: { isDeleted: false },
      createdBy: "usr-super-1",
      createdAt: "2026-09-01T08:00:00.000Z",
      updatedAt: now,
    };

    theatreStore.set(entity.id, entity);

    // Seed initial history records
    statusHistoryStore.push({
      id: `hist-seed-${entity.id}`,
      theatreId: entity.id,
      fromStatus: "APPROVED",
      toStatus: status,
      reason:
        status === "SUSPENDED"
          ? "Temporary suspension for annual Fire NOC verification"
          : "Platform onboarding lifecycle progression",
      changedBy: "usr-super-1",
      changedByRole: "SUPER_ADMIN",
      timestamp: now,
    });

    approvalStore.push({
      id: `appr-seed-${entity.id}`,
      theatreId: entity.id,
      status: approvalStatus,
      approverId: approvalStatus === "APPROVED" ? "usr-super-1" : undefined,
      approverName: approvalStatus === "APPROVED" ? "Vikram Singhania" : undefined,
      comments:
        approvalStatus === "APPROVED"
          ? "KYC, GSTIN, and Fire NOC documentation verified."
          : "Awaiting final compliance inspection sign-off.",
      reviewedAt: approvalStatus === "APPROVED" ? now : undefined,
      createdAt: "2026-09-01T08:00:00.000Z",
    });
  });

  // Add Draft & Archived lifecycle examples so every state is testable out of the box
  const draftTheatre: ManagedTheatreEntity = {
    id: "th-kol-draft-01",
    publicId: generatePublicId(91),
    slug: "inox-kolhapur-royal",
    name: "INOX Royal Kolhapur",
    chain: "INOX Leisure",
    code: "INX-KOL-01",
    tagline: "Luxury Laser Exhibition Coming to Kolhapur",
    description: "6-screen multiplex complex currently completing interior fit-out and DCP calibration.",
    gstNumber: "27AAACI9920M1Z2",
    pricingTier: "PREMIUM",
    subscriptionPlan: "Professional",
    contactEmail: "launch.kolhapur@inox.example",
    contactNumber: "+91 231 265 8900",
    adminName: "Sanket Joshi",
    adminEmail: "sanket.joshi@inox.example",
    address: "DY Patil City Mall, Kasaba Bawada",
    city: "Kolhapur",
    state: "Maharashtra",
    pinCode: "416006",
    country: "India",
    branding: {
      logoUrl: "/placeholders/theatres/default-logo.png",
      bannerUrl: "/placeholders/theatres/default-banner.png",
      primaryColor: "#E50914",
      secondaryColor: "#0A0B10",
      accentColor: "#F59E0B",
    },
    defaultConfig: {
      timezone: "Asia/Kolkata",
      currency: "INR",
      openingTime: "09:00 AM",
      closingTime: "12:30 AM",
      convenienceFeeDefault: 30,
      allowSelfCheckIn: true,
      maxSeatsPerBooking: 8,
    },
    hallCount: 6,
    screenTypes: ["IMAX", "Dolby Atmos"],
    rating: 0,
    grossRevenueMonthly: 0,
    totalBookings: 0,
    status: "DRAFT",
    approvalStatus: "PENDING",
    capabilities: deriveCapabilitiesForState("DRAFT"),
    version: 1,
    softDelete: { isDeleted: false },
    createdBy: "usr-super-1",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  };

  const archivedTheatre: ManagedTheatreEntity = {
    id: "th-nag-arch-01",
    publicId: generatePublicId(92),
    slug: "cineplex-nagpur-heritage",
    name: "Cineplex Heritage Nagpur",
    chain: "CineSphere Heritage",
    code: "CSH-NAG-01",
    tagline: "Classic Cinema Complex (Archived for Historical Audits)",
    description: "Decommissioned property preserved read-only for GST and distributor box-office reports.",
    gstNumber: "27AABCH4412P1Z8",
    pricingTier: "STANDARD",
    subscriptionPlan: "Starter",
    contactEmail: "archive.nagpur@cinesphere.io",
    contactNumber: "+91 712 244 1000",
    adminName: "Prashant Deshpande",
    adminEmail: "prashant.d@cinesphere.io",
    address: "Sitabuldi Main Road",
    city: "Nagpur",
    state: "Maharashtra",
    pinCode: "440012",
    country: "India",
    branding: {
      logoUrl: "/placeholders/theatres/default-logo.png",
      bannerUrl: "/placeholders/theatres/default-banner.png",
      primaryColor: "#E50914",
      secondaryColor: "#0A0B10",
      accentColor: "#F59E0B",
    },
    defaultConfig: {
      timezone: "Asia/Kolkata",
      currency: "INR",
      openingTime: "09:00 AM",
      closingTime: "11:30 PM",
      convenienceFeeDefault: 25,
      allowSelfCheckIn: false,
      maxSeatsPerBooking: 6,
    },
    hallCount: 3,
    screenTypes: ["Dolby 7.1"],
    rating: 4.3,
    grossRevenueMonthly: 0,
    totalBookings: 94210,
    status: "ARCHIVED",
    approvalStatus: "APPROVED",
    capabilities: deriveCapabilitiesForState("ARCHIVED"),
    version: 2,
    archival: {
      archivedAt: "2026-10-15T10:00:00.000Z",
      archivedBy: "usr-super-1",
      reason: "Lease concluded; preserved read-only for FY 2026-27 GST audits.",
      previousState: "INACTIVE",
    },
    softDelete: { isDeleted: false },
    createdBy: "usr-super-1",
    createdAt: "2025-05-10T08:00:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
  };

  theatreStore.set(draftTheatre.id, draftTheatre);
  theatreStore.set(archivedTheatre.id, archivedTheatre);
}

// Initialize immediately on load
initializeLifecycleStore();

export class TheatreLifecycleRepository extends BaseRepository<ManagedTheatreEntity> {
  protected entityName = "TheatreLifecycle";

  resetStore(): void {
    initializeLifecycleStore();
  }

  async findById(id: string): Promise<ManagedTheatreEntity | null> {
    this.logQuery("findById", { id });
    return theatreStore.get(id) || null;
  }

  async findBySlug(slug: string): Promise<ManagedTheatreEntity | null> {
    this.logQuery("findBySlug", { slug });
    const normalized = slug.trim().toLowerCase();
    for (const th of theatreStore.values()) {
      if (th.slug.toLowerCase() === normalized) return th;
    }
    return null;
  }

  async findByNameCaseInsensitive(name: string): Promise<ManagedTheatreEntity | null> {
    const normalized = name.trim().toLowerCase();
    for (const th of theatreStore.values()) {
      if (!th.softDelete.isDeleted && th.name.trim().toLowerCase() === normalized) {
        return th;
      }
    }
    return null;
  }

  async isSlugPreviouslyUsed(slug: string): Promise<boolean> {
    const normalized = slug.trim().toLowerCase();
    if (await this.findBySlug(normalized)) return true;
    return slugHistoryStore.some(
      (h) => h.oldSlug.toLowerCase() === normalized || h.newSlug.toLowerCase() === normalized
    );
  }

  async findAll(): Promise<ManagedTheatreEntity[]> {
    return Array.from(theatreStore.values());
  }

  async searchAndPaginate(filters: TheatreSearchFilters): Promise<PaginatedTheatresResult> {
    this.logQuery("searchAndPaginate", filters as Record<string, unknown>);
    const all = Array.from(theatreStore.values());

    const summaryMetrics = {
      totalActiveFleets: all.filter((t) => !t.softDelete.isDeleted).length,
      draftCount: all.filter((t) => t.status === "DRAFT").length,
      pendingApprovalCount: all.filter((t) => t.status === "PENDING_APPROVAL").length,
      approvedCount: all.filter((t) => t.status === "APPROVED").length,
      activeCount: all.filter((t) => t.status === "ACTIVE").length,
      suspendedCount: all.filter((t) => t.status === "SUSPENDED").length,
      archivedCount: all.filter((t) => t.status === "ARCHIVED").length,
      softDeletedCount: all.filter((t) => t.status === "SOFT_DELETED" || t.softDelete.isDeleted).length,
    };

    let list = all.filter((th) => {
      if (!filters.includeDeleted && (th.softDelete.isDeleted || th.status === "SOFT_DELETED")) {
        return false;
      }

      if (filters.query && filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        const matches =
          th.name.toLowerCase().includes(q) ||
          th.slug.toLowerCase().includes(q) ||
          th.city.toLowerCase().includes(q) ||
          th.chain.toLowerCase().includes(q) ||
          th.adminName.toLowerCase().includes(q) ||
          th.status.toLowerCase().includes(q) ||
          th.publicId.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filters.status && filters.status !== "ALL" && th.status !== filters.status) {
        return false;
      }

      if (
        filters.approvalStatus &&
        filters.approvalStatus !== "ALL" &&
        th.approvalStatus !== filters.approvalStatus
      ) {
        return false;
      }

      if (filters.onlySuspended && th.status !== "SUSPENDED") return false;
      if (filters.onlyArchived && th.status !== "ARCHIVED") return false;

      if (filters.createdFrom && th.createdAt < filters.createdFrom) return false;
      if (filters.createdTo && th.createdAt > filters.createdTo) return false;
      if (filters.updatedFrom && th.updatedAt < filters.updatedFrom) return false;
      if (filters.updatedTo && th.updatedAt > filters.updatedTo) return false;

      return true;
    });

    // Deterministic sorting
    const sortBy = filters.sortBy || "name";
    const dir = filters.sortOrder === "desc" ? -1 : 1;

    list.sort((a, b) => {
      switch (sortBy) {
        case "city":
          return a.city.localeCompare(b.city) * dir;
        case "createdAt":
          return a.createdAt.localeCompare(b.createdAt) * dir;
        case "updatedAt":
          return a.updatedAt.localeCompare(b.updatedAt) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "hallCount":
          return (a.hallCount - b.hallCount) * dir;
        case "name":
        default:
          return a.name.localeCompare(b.name) * dir;
      }
    });

    const paginated = paginateArray(
      list,
      { page: filters.page || 1, pageSize: filters.pageSize || 10 },
      10,
      100
    );

    return {
      ...paginated,
      summaryMetrics,
    };
  }

  async create(data: Partial<ManagedTheatreEntity>): Promise<ManagedTheatreEntity> {
    const id = data.id || `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const initialStatus: TheatreLifecycleState = data.status || "DRAFT";

    const entity: ManagedTheatreEntity = {
      id,
      publicId: data.publicId || generatePublicId(),
      slug: data.slug || id,
      name: data.name || "Untitled Theatre",
      chain: data.chain || "Independent",
      code: data.code || `CS-${Date.now().toString(36).toUpperCase().slice(-5)}`,
      tagline: data.tagline,
      description: data.description,
      gstNumber: data.gstNumber,
      pricingTier: data.pricingTier || "STANDARD",
      subscriptionPlan: data.subscriptionPlan || "Starter",
      contactEmail: data.contactEmail || "",
      contactNumber: data.contactNumber || "",
      adminName: data.adminName || "",
      adminEmail: data.adminEmail || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pinCode: data.pinCode,
      country: data.country || "India",
      branding: data.branding || {
        logoUrl: "/placeholders/theatres/default-logo.png",
        bannerUrl: "/placeholders/theatres/default-banner.png",
        primaryColor: "#E50914",
        secondaryColor: "#0A0B10",
        accentColor: "#F59E0B",
      },
      defaultConfig: data.defaultConfig || {
        timezone: "Asia/Kolkata",
        currency: "INR",
        openingTime: "09:00 AM",
        closingTime: "01:00 AM",
        convenienceFeeDefault: 35,
        allowSelfCheckIn: true,
        maxSeatsPerBooking: 10,
      },
      hallCount: data.hallCount || 0,
      screenTypes: data.screenTypes || ["2D", "Dolby Atmos"],
      rating: data.rating || 0,
      grossRevenueMonthly: 0,
      totalBookings: 0,
      status: initialStatus,
      approvalStatus: data.approvalStatus || "PENDING",
      capabilities: deriveCapabilitiesForState(initialStatus),
      version: 1,
      softDelete: { isDeleted: false },
      createdBy: data.createdBy || "system",
      createdAt: now,
      updatedAt: now,
    };

    theatreStore.set(id, entity);
    return entity;
  }

  async update(
    id: string,
    data: Partial<ManagedTheatreEntity>
  ): Promise<ManagedTheatreEntity | null> {
    const existing = theatreStore.get(id);
    if (!existing) return null;
    const updated: ManagedTheatreEntity = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    theatreStore.set(id, updated);
    return updated;
  }

  /**
   * Optimistic Locking Update enforcing version checks to prevent lost updates.
   */
  async updateWithOptimisticLock(
    id: string,
    expectedVersion: number,
    patch: Partial<ManagedTheatreEntity>
  ): Promise<OptimisticLockResult<ManagedTheatreEntity>> {
    this.logQuery("updateWithOptimisticLock", { id, expectedVersion });
    const existing = theatreStore.get(id);

    if (!existing) {
      return { success: false, error: `Theatre '${id}' was not found.` };
    }

    if (existing.version !== expectedVersion) {
      return {
        success: false,
        conflict: true,
        currentVersion: existing.version,
        expectedVersion,
        error: `Concurrency conflict: Theatre '${id}' version is ${existing.version}, expected ${expectedVersion}.`,
      };
    }

    const nextVersion = existing.version + 1;
    const updated: ManagedTheatreEntity = {
      ...existing,
      ...patch,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
    };

    theatreStore.set(id, updated);
    return {
      success: true,
      data: updated,
      currentVersion: nextVersion,
    };
  }

  async delete(_id: string): Promise<boolean> {
    // Hard delete is strictly forbidden; always use Soft Delete through Domain Service!
    throw new Error("Physical deletion of theatres is strictly prohibited. Use softDelete instead.");
  }

  // ----------------------------------------------------------------------------
  // History, Approvals, Slug Ledgers & Lifecycle Audit Trails
  // ----------------------------------------------------------------------------

  recordStatusHistory(record: Omit<TheatreStatusTransitionRecord, "id">): TheatreStatusTransitionRecord {
    const entry: TheatreStatusTransitionRecord = {
      id: `st-hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...record,
    };
    statusHistoryStore.unshift(entry);
    return entry;
  }

  getStatusHistory(theatreId: string): TheatreStatusTransitionRecord[] {
    return statusHistoryStore.filter((h) => h.theatreId === theatreId);
  }

  recordApproval(record: Omit<TheatreApprovalRecord, "id">): TheatreApprovalRecord {
    const entry: TheatreApprovalRecord = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...record,
    };
    approvalStore.unshift(entry);
    return entry;
  }

  getApprovals(theatreId: string): TheatreApprovalRecord[] {
    return approvalStore.filter((a) => a.theatreId === theatreId);
  }

  recordSlugHistory(record: Omit<TheatreSlugHistoryRecord, "id">): TheatreSlugHistoryRecord {
    const entry: TheatreSlugHistoryRecord = {
      id: `slug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...record,
    };
    slugHistoryStore.unshift(entry);
    return entry;
  }

  getSlugHistory(theatreId: string): TheatreSlugHistoryRecord[] {
    return slugHistoryStore.filter((s) => s.theatreId === theatreId);
  }

  recordLifecycleAudit(
    record: Omit<TheatreLifecycleAuditRecord, "id">
  ): TheatreLifecycleAuditRecord {
    const entry: TheatreLifecycleAuditRecord = {
      id: `th-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...record,
    };
    lifecycleAuditStore.unshift(entry);
    return entry;
  }

  getLifecycleAudits(theatreId?: string): TheatreLifecycleAuditRecord[] {
    if (!theatreId) return [...lifecycleAuditStore];
    return lifecycleAuditStore.filter((a) => a.theatreId === theatreId);
  }
}

export const theatreLifecycleRepository = new TheatreLifecycleRepository();

