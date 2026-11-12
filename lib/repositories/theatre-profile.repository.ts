/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Repository (Phase 3 – Part 3)
 * ==============================================================================
 * Data access layer managing normalized TheatreProfile, TheatreLanguage,
 * TheatreSocialLink, and TheatreProfileVersion stores. Collaborates read-only
 * with TheatreMediaRepository for live branding completion scoring and logo/banner
 * public identity resolution. Ready for Drizzle PostgreSQL swap.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { MOCK_THEATRES } from "@/data";
import { paginateArray } from "@/lib/performance/cache-strategy";
import { theatreMediaRepository } from "./theatre-media.repository";
import {
  PaginatedTheatreProfileResult,
  ProfileCompletionChecklist,
  ProfileCompletionSummary,
  SearchTheatreProfileFilters,
  TheatreCategoryType,
  TheatreLanguageRecord,
  TheatreOwnershipModel,
  TheatreProfileAuditRecord,
  TheatreProfileRecord,
  TheatreProfileStatus,
  TheatreProfileVersionRecord,
  TheatreSocialLinkRecord,
} from "@/types/theatre-profile.types";

const profileStore = new Map<string, TheatreProfileRecord>();
const versionStore: TheatreProfileVersionRecord[] = [];
const auditStore: TheatreProfileAuditRecord[] = [];

/**
 * Computes average capacity per screen safely.
 */
export function computeAverageCapacity(screensCount: number, totalCapacity: number): number {
  if (!screensCount || screensCount <= 0) return 0;
  return Math.round(totalCapacity / screensCount);
}

/**
 * Calculates deterministic Profile Completion Score (0..100) using both
 * profile configuration and active Branding Logo/Banner presence.
 */
export async function computeProfileCompletion(params: {
  theatreId: string;
  theatreName: string;
  legalName: string;
  shortDescription?: string;
  aboutTheatre?: string;
  website?: string;
  screensCount: number;
  totalSeatingCapacity: number;
  languagesCount: number;
  socialLinksCount: number;
}): Promise<ProfileCompletionSummary> {
  const collection = theatreMediaRepository.getCollection(params.theatreId);
  const assets = await theatreMediaRepository.findByTheatre(params.theatreId, false);

  const hasLogoUploaded = Boolean(
    collection?.activeLogoMediaId ||
      assets.some((a) => a.mediaType === "LOGO" && a.status === "ACTIVE")
  );
  const hasBannerUploaded = Boolean(
    collection?.activeBannerMediaId ||
      assets.some((a) => a.mediaType === "BANNER" && a.status === "ACTIVE")
  );

  const checklist: ProfileCompletionChecklist = {
    hasBasicIdentity: Boolean(params.theatreName.trim() && params.legalName.trim()),
    hasDescriptions: Boolean(
      (params.shortDescription && params.shortDescription.trim().length >= 10) ||
        (params.aboutTheatre && params.aboutTheatre.trim().length >= 20)
    ),
    hasLogoUploaded,
    hasBannerUploaded,
    hasWebsiteConfigured: Boolean(params.website && params.website.trim().length >= 8),
    hasSocialLinks: params.socialLinksCount > 0,
    hasLanguagesConfigured: params.languagesCount > 0,
    hasCapacitySpecs: params.screensCount > 0 && params.totalSeatingCapacity >= 10,
  };

  const labels: Array<[keyof ProfileCompletionChecklist, string, number]> = [
    ["hasBasicIdentity", "Complete basic theatre identity & legal name", 15],
    ["hasDescriptions", "Add tagline, short description & about theatre narrative", 15],
    ["hasLogoUploaded", "Upload active theatre logo in Branding Studio", 15],
    ["hasBannerUploaded", "Upload active theatre banner in Branding Studio", 10],
    ["hasWebsiteConfigured", "Configure official theatre website URL", 15],
    ["hasSocialLinks", "Connect at least one social media presence link", 10],
    ["hasLanguagesConfigured", "Configure supported languages & primary language", 10],
    ["hasCapacitySpecs", "Confirm screens count & total seating capacity", 10],
  ];

  let score = 0;
  let completedSteps = 0;
  const missingRecommendations: string[] = [];

  for (const [key, prompt, weight] of labels) {
    if (checklist[key]) {
      score += weight;
      completedSteps++;
    } else {
      missingRecommendations.push(prompt);
    }
  }

  return {
    score: Math.min(100, score),
    completedSteps,
    totalSteps: labels.length,
    checklist,
    missingRecommendations,
  };
}

function deriveCategoryForSeed(theatreId: string, name: string, pricingTier?: string): TheatreCategoryType {
  if (theatreId === "th-pun-001" || pricingTier === "Luxury") return "LUXURY_CINEMA";
  if (name.toLowerCase().includes("imax") || name.toLowerCase().includes("megaplex")) return "MULTIPLEX";
  if (theatreId === "th-blr-001") return "CHAIN_THEATRE";
  return "MULTIPLEX";
}

function deriveOwnershipForSeed(chain?: string): TheatreOwnershipModel {
  if (!chain || chain.toLowerCase().includes("independent")) return "INDEPENDENT";
  return "CHAIN";
}

function initializeProfileStore() {
  profileStore.clear();
  versionStore.length = 0;
  auditStore.length = 0;

  MOCK_THEATRES.forEach((th, idx) => {
    const profileId = `prof-${th.id}`;
    const now = new Date(Date.now() - idx * 86400000).toISOString();
    const theatreType = deriveCategoryForSeed(th.id, th.name, th.pricingTier);
    const ownershipModel = deriveOwnershipForSeed(th.chain);
    const status: TheatreProfileStatus =
      th.id === "th-del-001"
        ? "HIDDEN"
        : th.id === "th-hyd-001"
        ? "DRAFT"
        : "PUBLISHED";

    const establishedYear = 2012 + ((idx * 2) % 12);
    const screensCount = th.hallCount || 6;
    const totalSeatingCapacity = th.totalSeats || screensCount * 210;
    const website =
      th.contact?.website ||
      `https://www.cinesphere.os/cinemas/${th.slug}`;
    const publicSlug = `${th.slug}-official`;

    const languages: TheatreLanguageRecord[] = [
      {
        id: `lang-${th.id}-en`,
        profileId,
        theatreId: th.id,
        languageCode: "en",
        displayName: "English",
        isPrimary: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `lang-${th.id}-hi`,
        profileId,
        theatreId: th.id,
        languageCode: "hi",
        displayName: "Hindi",
        isPrimary: false,
        createdAt: now,
        updatedAt: now,
      },
      ...(th.city === "Pune" || th.city === "Mumbai"
        ? [
            {
              id: `lang-${th.id}-mr`,
              profileId,
              theatreId: th.id,
              languageCode: "mr",
              displayName: "Marathi",
              isPrimary: false,
              createdAt: now,
              updatedAt: now,
            },
          ]
        : th.city === "Chennai"
        ? [
            {
              id: `lang-${th.id}-ta`,
              profileId,
              theatreId: th.id,
              languageCode: "ta",
              displayName: "Tamil",
              isPrimary: false,
              createdAt: now,
              updatedAt: now,
            },
          ]
        : th.city === "Bengaluru"
        ? [
            {
              id: `lang-${th.id}-kn`,
              profileId,
              theatreId: th.id,
              languageCode: "kn",
              displayName: "Kannada",
              isPrimary: false,
              createdAt: now,
              updatedAt: now,
            },
          ]
        : []),
    ];

    const socialLinks: TheatreSocialLinkRecord[] = [
      {
        id: `soc-${th.id}-web`,
        profileId,
        theatreId: th.id,
        platform: "WEBSITE",
        label: "Official Box Office Portal",
        url: website,
        isActive: true,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `soc-${th.id}-ig`,
        profileId,
        theatreId: th.id,
        platform: "INSTAGRAM",
        label: `@${th.slug.replace(/-/g, "")}`,
        url: `https://instagram.com/${th.slug.replace(/-/g, "")}`,
        isActive: true,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `soc-${th.id}-yt`,
        profileId,
        theatreId: th.id,
        platform: "YOUTUBE",
        label: `${th.name} Trailers`,
        url: `https://youtube.com/@${th.slug.replace(/-/g, "")}`,
        isActive: true,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const shortDesc = th.tagline || `${th.name} flagship cinema experience in ${th.city}`;
    const fullDesc =
      th.description ||
      `${th.name} delivers next-generation laser projection, immersive spatial audio, and hospitality in ${th.city}, ${th.state}.`;

    const completionSummary: ProfileCompletionSummary = {
      score: 100,
      completedSteps: 8,
      totalSteps: 8,
      checklist: {
        hasBasicIdentity: true,
        hasDescriptions: true,
        hasLogoUploaded: true,
        hasBannerUploaded: true,
        hasWebsiteConfigured: true,
        hasSocialLinks: true,
        hasLanguagesConfigured: true,
        hasCapacitySpecs: true,
      },
      missingRecommendations: [],
    };

    const record: TheatreProfileRecord = {
      id: profileId,
      theatreId: th.id,
      internalTheatreSlug: th.slug,
      publicSlug,
      theatreName: th.name,
      legalName: `${th.name} Exhibition Pvt. Ltd.`,
      displayName: th.name,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      aboutTheatre: `${fullDesc} Established in ${establishedYear}, operated under ${th.chain || "Independent Exhibition"} standards.`,
      tagline: th.tagline,
      defaultLocale: "en",
      localizedFields: {
        en: {
          theatreName: th.name,
          displayName: th.name,
          shortDescription: shortDesc,
          fullDescription: fullDesc,
          tagline: th.tagline,
        },
        ...(th.city === "Pune" || th.city === "Mumbai"
          ? {
              hi: {
                displayName: `${th.name} (${th.city})`,
                tagline: th.tagline,
              },
            }
          : {}),
      },
      establishedYear,
      theatreType,
      ownershipModel,
      chainName: th.chain,
      screensCount,
      totalSeatingCapacity,
      averageCapacityPerScreen: computeAverageCapacity(screensCount, totalSeatingCapacity),
      primaryLanguageCode: "en",
      website,
      businessEmailPlaceholder: th.contact?.email || `concierge@${th.slug}.cinesphere.os`,
      businessPhonePlaceholder: th.contact?.phone || "+91 20 6689 4500",
      languages,
      socialLinks,
      status,
      version: 1,
      completionScore: completionSummary.score,
      completionSummary,
      publishedAt: status === "PUBLISHED" ? now : undefined,
      publishedBy: status === "PUBLISHED" ? "usr-super-1" : undefined,
      createdBy: "usr-super-1",
      updatedBy: "usr-super-1",
      createdAt: now,
      updatedAt: now,
    };

    profileStore.set(profileId, record);

    versionStore.push({
      id: `pver-${th.id}-1`,
      profileId,
      theatreId: th.id,
      versionNumber: 1,
      previousValues: {},
      nextValues: {
        theatreName: record.theatreName,
        legalName: record.legalName,
        publicSlug: record.publicSlug,
        status: record.status,
      },
      updatedFields: ["initial_profile_created"],
      changeSummary: "Initial seeded theatre profile baseline",
      updatedBy: "usr-super-1",
      updatedByRole: "SUPER_ADMIN",
      updatedAt: now,
    });

    auditStore.push({
      id: `paud-${th.id}-1`,
      profileId,
      theatreId: th.id,
      eventType: "PROFILE_CREATED",
      actorId: "usr-super-1",
      actorName: "Platform Seeder",
      actorRole: "SUPER_ADMIN",
      summary: `Seeded theatre profile '${record.displayName}' (/${record.publicSlug})`,
      timestamp: now,
      metadata: { status: record.status, version: 1 },
    });
  });
}

initializeProfileStore();

export class TheatreProfileRepository extends BaseRepository<TheatreProfileRecord> {
  protected entityName = "TheatreProfile";

  public resetStore(): void {
    initializeProfileStore();
  }

  async findById(id: string): Promise<TheatreProfileRecord | null> {
    this.logQuery("findById", { id });
    const found = profileStore.get(id);
    return found ? structuredClone(found) : null;
  }

  async findByTheatreId(theatreId: string): Promise<TheatreProfileRecord | null> {
    this.logQuery("findByTheatreId", { theatreId });
    for (const p of profileStore.values()) {
      if (p.theatreId === theatreId) {
        return structuredClone(p);
      }
    }
    return null;
  }

  async findByPublicSlug(slug: string): Promise<TheatreProfileRecord | null> {
    this.logQuery("findByPublicSlug", { slug });
    const normalized = slug.trim().toLowerCase();
    for (const p of profileStore.values()) {
      if (
        p.publicSlug.toLowerCase() === normalized ||
        p.internalTheatreSlug.toLowerCase() === normalized ||
        p.theatreId.toLowerCase() === normalized
      ) {
        return structuredClone(p);
      }
    }
    return null;
  }

  async findByTheatreName(name: string, excludeProfileId?: string): Promise<TheatreProfileRecord | null> {
    const normalized = name.trim().toLowerCase();
    for (const p of profileStore.values()) {
      if (excludeProfileId && p.id === excludeProfileId) continue;
      if (p.theatreName.trim().toLowerCase() === normalized) {
        return structuredClone(p);
      }
    }
    return null;
  }

  async findAll(filters?: Partial<TheatreProfileRecord>): Promise<TheatreProfileRecord[]> {
    let items = Array.from(profileStore.values());
    if (filters?.theatreId) {
      items = items.filter((p) => p.theatreId === filters.theatreId);
    }
    if (filters?.status) {
      items = items.filter((p) => p.status === filters.status);
    }
    return structuredClone(items);
  }

  async create(): Promise<TheatreProfileRecord> {
    throw new Error("Use insertProfile for complete validated theatre profile creation.");
  }

  async insertProfile(record: TheatreProfileRecord): Promise<TheatreProfileRecord> {
    this.logQuery("insertProfile", {
      profileId: record.id,
      theatreId: record.theatreId,
      publicSlug: record.publicSlug,
    });
    profileStore.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  async update(
    id: string,
    payload: Partial<TheatreProfileRecord>
  ): Promise<TheatreProfileRecord | null> {
    const existing = profileStore.get(id);
    if (!existing) return null;
    const updated: TheatreProfileRecord = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    profileStore.set(id, structuredClone(updated));
    return structuredClone(updated);
  }

  async saveProfile(record: TheatreProfileRecord): Promise<TheatreProfileRecord> {
    profileStore.set(record.id, structuredClone(record));
    return structuredClone(record);
  }

  async delete(id: string): Promise<boolean> {
    return profileStore.delete(id);
  }

  async searchAndPaginate(
    filters: SearchTheatreProfileFilters,
    scopedTenantId?: string
  ): Promise<PaginatedTheatreProfileResult> {
    this.logQuery("searchAndPaginate", {
      query: filters.query,
      theatreType: filters.theatreType,
      ownershipModel: filters.ownershipModel,
      status: filters.status,
      languageCode: filters.languageCode,
      scopedTenantId,
      page: filters.page,
      pageSize: filters.pageSize,
    });

    // Strict pre-pagination tenant isolation
    const baseScope = Array.from(profileStore.values()).filter((p) => {
      if (scopedTenantId) {
        return p.theatreId === scopedTenantId;
      }
      if (filters.theatreId && filters.theatreId !== "ALL") {
        return p.theatreId === filters.theatreId;
      }
      return true;
    });

    const summary = {
      totalProfiles: baseScope.length,
      publishedCount: baseScope.filter((p) => p.status === "PUBLISHED").length,
      draftCount: baseScope.filter((p) => p.status === "DRAFT").length,
      hiddenCount: baseScope.filter((p) => p.status === "HIDDEN").length,
      archivedCount: baseScope.filter((p) => p.status === "ARCHIVED").length,
      averageCompletionScore:
        baseScope.length > 0
          ? Math.round(
              baseScope.reduce((acc, item) => acc + item.completionScore, 0) / baseScope.length
            )
          : 0,
    };

    let filtered = [...baseScope];

    if (filters.theatreType && filters.theatreType !== "ALL") {
      filtered = filtered.filter((p) => p.theatreType === filters.theatreType);
    }

    if (filters.ownershipModel && filters.ownershipModel !== "ALL") {
      filtered = filtered.filter((p) => p.ownershipModel === filters.ownershipModel);
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.languageCode && filters.languageCode.trim()) {
      const code = filters.languageCode.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        p.languages.some(
          (l) =>
            l.languageCode.toLowerCase() === code ||
            l.displayName.toLowerCase().includes(code)
        )
      );
    }

    if (filters.establishedYearFrom !== undefined) {
      filtered = filtered.filter(
        (p) => (p.establishedYear ?? 0) >= filters.establishedYearFrom!
      );
    }

    if (filters.establishedYearTo !== undefined) {
      filtered = filtered.filter(
        (p) => (p.establishedYear ?? 9999) <= filters.establishedYearTo!
      );
    }

    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const langMatch = p.languages.some(
          (l) =>
            l.displayName.toLowerCase().includes(q) ||
            l.languageCode.toLowerCase().includes(q)
        );
        return (
          p.theatreName.toLowerCase().includes(q) ||
          p.legalName.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.theatreType.toLowerCase().includes(q) ||
          (p.customTheatreType?.toLowerCase().includes(q) ?? false) ||
          (p.website?.toLowerCase().includes(q) ?? false) ||
          p.publicSlug.toLowerCase().includes(q) ||
          langMatch
        );
      });
    }

    const sortBy = filters.sortBy || "theatreName";
    const sortDir = filters.sortOrder === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      if (sortBy === "completionScore") {
        return (a.completionScore - b.completionScore) * sortDir;
      }
      if (sortBy === "establishedYear") {
        return ((a.establishedYear || 0) - (b.establishedYear || 0)) * sortDir;
      }
      if (sortBy === "screensCount") {
        return (a.screensCount - b.screensCount) * sortDir;
      }
      if (sortBy === "updatedAt") {
        return a.updatedAt.localeCompare(b.updatedAt) * sortDir;
      }
      return a.theatreName.localeCompare(b.theatreName) * sortDir;
    });

    const paginated = paginateArray(
      structuredClone(filtered),
      { page: filters.page || 1, pageSize: filters.pageSize || 12 },
      12,
      100
    );

    return {
      ...paginated,
      summary,
    };
  }

  async addVersion(record: TheatreProfileVersionRecord): Promise<void> {
    versionStore.push(structuredClone(record));
  }

  async getVersionsByProfileId(profileId: string): Promise<TheatreProfileVersionRecord[]> {
    return structuredClone(
      versionStore
        .filter((v) => v.profileId === profileId)
        .sort((a, b) => b.versionNumber - a.versionNumber)
    );
  }

  async addAudit(record: TheatreProfileAuditRecord): Promise<void> {
    auditStore.push(structuredClone(record));
  }

  async getAuditsByTheatreId(theatreId: string, limit = 50): Promise<TheatreProfileAuditRecord[]> {
    return structuredClone(
      auditStore
        .filter((a) => a.theatreId === theatreId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit)
    );
  }
}

export const theatreProfileRepository = new TheatreProfileRepository();
