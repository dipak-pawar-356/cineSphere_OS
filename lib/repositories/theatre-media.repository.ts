/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Repository (Phase 3 – Part 2)
 * ==============================================================================
 * Encapsulates multi-tenant TheatreMediaCollection, TheatreMedia assets,
 * immutable MediaVersion snapshots, MediaMetadata, reusable MediaReferences,
 * gallery ordering, search/filtering, and immutable media audit trails.
 * ==============================================================================
 */

import crypto from "crypto";
import { BaseRepository } from "./base.repository";
import { theatreLifecycleRepository } from "./theatre-lifecycle.repository";
import { paginateArray } from "@/lib/performance/cache-strategy";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { DUMMY_THEATRES } from "@/lib/constants/theatres";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import {
  MediaCollectionSummaryMetrics,
  PaginatedTheatreMediaResult,
  SINGLE_ACTIVE_MEDIA_TYPES,
  TheatreMediaAsset,
  TheatreMediaAuditRecord,
  TheatreMediaCollectionRecord,
  TheatreMediaReferenceRecord,
  TheatreMediaSearchFilters,
  TheatreMediaStatus,
  TheatreMediaType,
  TheatreMediaVersionRecord,
} from "@/types/theatre-media.types";

const collectionStore = new Map<string, TheatreMediaCollectionRecord>();
const mediaStore = new Map<string, TheatreMediaAsset>();
const auditStore: TheatreMediaAuditRecord[] = [];

export function computeMediaChecksum(input: {
  url: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}): string {
  return crypto
    .createHash("sha256")
    .update(`${input.url}|${input.mimeType}|${input.width}x${input.height}|${input.fileSizeBytes}`)
    .digest("hex");
}

export function computeAspectRatioLabel(width: number, height: number): string {
  if (!width || !height) return "16:9";
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.1) return "1:1";
  if (Math.abs(ratio - 16 / 9) < 0.15) return "16:9";
  if (Math.abs(ratio - 21 / 9) < 0.2) return "21:9";
  if (Math.abs(ratio - 3 / 2) < 0.12) return "3:2";
  if (Math.abs(ratio - 4 / 3) < 0.12) return "4:3";
  if (Math.abs(ratio - 2 / 1) < 0.15) return "2:1";
  return `${ratio.toFixed(2)}:1`;
}

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `media-${Date.now()}`
  );
}

function getSlotKeyForMediaType(mediaType: TheatreMediaType): string {
  switch (mediaType) {
    case "LOGO":
      return "THEATRE_LOGO";
    case "BANNER":
      return "THEATRE_BANNER";
    case "COVER_IMAGE":
      return "THEATRE_COVER";
    case "HERO_IMAGE":
      return "THEATRE_HERO";
    case "THUMBNAIL":
      return "THEATRE_THUMBNAIL";
    case "GALLERY_IMAGE":
      return "THEATRE_GALLERY_SLOT";
    case "FUTURE_VIDEO_PLACEHOLDER":
      return "THEATRE_FUTURE_VIDEO";
    case "FUTURE_PANORAMA_PLACEHOLDER":
      return "THEATRE_FUTURE_PANORAMA";
  }
}

function createInitialCollection(
  theatreId: string,
  theatreSlug: string
): TheatreMediaCollectionRecord {
  const now = "2026-10-01T08:00:00.000Z";
  return {
    id: `col-${theatreId}`,
    theatreId,
    collectionCode: `TMC-${theatreSlug.toUpperCase().slice(0, 14)}-${theatreId.slice(-4).toUpperCase()}`,
    storageDriver: "LOCAL_VIRTUAL_VAULT",
    cdnBaseUrlPlaceholder: undefined,
    storageQuotaBytes: 524288000, // 500 MB tenant quota
    usedStorageBytes: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

function buildSeedMediaAsset(params: {
  id: string;
  collectionId: string;
  theatreId: string;
  theatreName: string;
  theatreSlug: string;
  mediaType: TheatreMediaType;
  futureVideoSubtype?: TheatreMediaAsset["futureVideoSubtype"];
  title: string;
  url: string;
  altText: string;
  caption?: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  dominantColor: string;
  displayOrder?: number;
  status?: TheatreMediaStatus;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt?: string;
}): TheatreMediaAsset {
  const now = params.createdAt || "2026-10-05T10:00:00.000Z";
  const checksum = computeMediaChecksum({
    url: params.url,
    mimeType: params.mimeType,
    width: params.width,
    height: params.height,
    fileSizeBytes: params.fileSizeBytes,
  });

  const versionRecord: TheatreMediaVersionRecord = {
    id: `ver-${params.id}-v1`,
    mediaId: params.id,
    versionNumber: 1,
    url: params.url,
    checksum,
    mimeType: params.mimeType,
    fileSizeBytes: params.fileSizeBytes,
    width: params.width,
    height: params.height,
    dominantColor: params.dominantColor,
    altText: params.altText,
    caption: params.caption,
    changeReason: "Initial verified asset upload",
    replacedBy: params.uploadedBy || "usr-super-1",
    createdAt: now,
  };

  const refRecord: TheatreMediaReferenceRecord = {
    id: `ref-${params.id}`,
    theatreId: params.theatreId,
    mediaId: params.id,
    targetEntityType: "THEATRE",
    targetEntityId: params.theatreId,
    slotKey: getSlotKeyForMediaType(params.mediaType),
    isActive: (params.status || "ACTIVE") === "ACTIVE",
    createdAt: now,
  };

  return {
    id: params.id,
    collectionId: params.collectionId,
    theatreId: params.theatreId,
    theatreName: params.theatreName,
    theatreSlug: params.theatreSlug,
    mediaType: params.mediaType,
    futureVideoSubtype: params.futureVideoSubtype,
    title: params.title,
    slug: slugifyTitle(params.title),
    url: params.url,
    status: params.status || "ACTIVE",
    displayOrder: params.displayOrder ?? 1,
    displayPriority: 100 - (params.displayOrder ?? 1),
    currentVersion: 1,
    isPrimary: SINGLE_ACTIVE_MEDIA_TYPES.includes(params.mediaType),
    uploadedBy: params.uploadedBy || "usr-super-1",
    uploadedByName: params.uploadedByName || "Vikram Singhania",
    createdAt: now,
    updatedAt: now,
    metadata: {
      altText: params.altText,
      caption: params.caption,
      mimeType: params.mimeType,
      fileSizeBytes: params.fileSizeBytes,
      width: params.width,
      height: params.height,
      aspectRatio: computeAspectRatioLabel(params.width, params.height),
      checksum,
      uploadSource: "BRAND_IMPORT",
      dominantColor: params.dominantColor,
      cropPlaceholder: {
        x: 0,
        y: 0,
        width: params.width,
        height: params.height,
        unit: "px",
        aspectLock: computeAspectRatioLabel(params.width, params.height),
      },
      compressionPlaceholder: {
        compressionReady: true,
        targetFormats: ["webp", "avif", "jpeg"],
        responsiveWidths: [320, 640, 1280, 1920],
        thumbnailSpec: { width: 400, height: 300 },
        cdnUrlPatternPlaceholder: `/cdn-placeholder/${params.theatreSlug}/${params.id}/{width}.{format}`,
      },
      corruptedCheckStatus: "PASSED",
      duplicateCheckHash: checksum,
    },
    versions: [versionRecord],
    references: [refRecord],
  };
}

function initializeMediaStore(): void {
  collectionStore.clear();
  mediaStore.clear();
  auditStore.length = 0;

  const combinedTheatres = [...MULTI_TENANT_THEATRES, ...DUMMY_THEATRES];
  const seenIds = new Set<string>();

  const seedList = combinedTheatres.filter((t) => {
    if (seenIds.has(t.id)) return false;
    seenIds.add(t.id);
    return true;
  });

  const gallerySampleUrls = [
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&auto=format&fit=crop&q=80",
  ];

  seedList.forEach((th, idx) => {
    const col = createInitialCollection(th.id, th.slug);
    const baseLogoUrl =
      th.logo && (th.logo.startsWith("http") || th.logo.startsWith("/"))
        ? th.logo
        : "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80";
    const baseBannerUrl =
      th.banner && (th.banner.startsWith("http") || th.banner.startsWith("/"))
        ? th.banner
        : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80";

    const logoAsset = buildSeedMediaAsset({
      id: `med-${th.id}-logo`,
      collectionId: col.id,
      theatreId: th.id,
      theatreName: th.name,
      theatreSlug: th.slug,
      mediaType: "LOGO",
      title: `${th.name} Brand Emblem`,
      url: baseLogoUrl,
      altText: `${th.name} official circular emblem logo`,
      caption: `${th.chain} brand identity mark`,
      mimeType: "image/png",
      fileSizeBytes: 245760,
      width: 512,
      height: 512,
      dominantColor: "#FBBF24",
    });

    const bannerAsset = buildSeedMediaAsset({
      id: `med-${th.id}-banner`,
      collectionId: col.id,
      theatreId: th.id,
      theatreName: th.name,
      theatreSlug: th.slug,
      mediaType: "BANNER",
      title: `${th.name} Primary Auditorium Banner`,
      url: baseBannerUrl,
      altText: `${th.name} panoramic multiplex auditorium interior banner`,
      caption: "Featured auditorium showcase photography",
      mimeType: "image/webp",
      fileSizeBytes: 1843200,
      width: 1920,
      height: 800,
      dominantColor: "#0A0B10",
    });

    const coverAsset = buildSeedMediaAsset({
      id: `med-${th.id}-cover`,
      collectionId: col.id,
      theatreId: th.id,
      theatreName: th.name,
      theatreSlug: th.slug,
      mediaType: "COVER_IMAGE",
      title: `${th.name} Foyer & Concierge Cover`,
      url: gallerySampleUrls[(idx + 2) % gallerySampleUrls.length],
      altText: `${th.name} luxury cinema concierge & ticket lobby cover`,
      caption: "Foyer architecture cover artwork",
      mimeType: "image/webp",
      fileSizeBytes: 1620000,
      width: 1600,
      height: 900,
      dominantColor: "#161F2E",
    });

    const heroAsset = buildSeedMediaAsset({
      id: `med-${th.id}-hero`,
      collectionId: col.id,
      theatreId: th.id,
      theatreName: th.name,
      theatreSlug: th.slug,
      mediaType: "HERO_IMAGE",
      title: `${th.name} IMAX Laser Hero Stage`,
      url: baseBannerUrl,
      altText: `${th.name} flagship hero exhibition hall stage`,
      caption: "Displayed atop the public theatre landing experience",
      mimeType: "image/webp",
      fileSizeBytes: 2350000,
      width: 2400,
      height: 1080,
      dominantColor: "#070B12",
    });

    const thumbAsset = buildSeedMediaAsset({
      id: `med-${th.id}-thumb`,
      collectionId: col.id,
      theatreId: th.id,
      theatreName: th.name,
      theatreSlug: th.slug,
      mediaType: "THUMBNAIL",
      title: `${th.name} Discovery Thumbnail`,
      url: gallerySampleUrls[idx % gallerySampleUrls.length],
      altText: `${th.name} card thumbnail preview`,
      caption: "Displayed in city & search venue cards",
      mimeType: "image/webp",
      fileSizeBytes: 412000,
      width: 800,
      height: 500,
      dominantColor: "#111827",
    });

    const singleAssets = [logoAsset, bannerAsset, coverAsset, heroAsset, thumbAsset];
    col.activeLogoMediaId = logoAsset.id;
    col.activeBannerMediaId = bannerAsset.id;
    col.activeCoverMediaId = coverAsset.id;
    col.activeHeroMediaId = heroAsset.id;
    col.activeThumbnailMediaId = thumbAsset.id;

    let totalBytes = singleAssets.reduce((sum, a) => sum + a.metadata.fileSizeBytes, 0);
    singleAssets.forEach((a) => mediaStore.set(a.id, a));

    // Seed ordered gallery assets (use CURRENT_THEATRE.gallery for flagship th-pun-001!)
    const galleryItems =
      th.id === "th-pun-001"
        ? CURRENT_THEATRE.gallery.map((g, gIdx) => ({
            id: `med-${th.id}-gal-${gIdx + 1}`,
            title: g.title,
            caption: `${g.category} — ${th.name}`,
            url: g.url,
            order: gIdx + 1,
          }))
        : [
            {
              id: `med-${th.id}-gal-1`,
              title: `${th.name} Signature Laser Auditorium`,
              caption: "Dual-laser 4K projection hall seating view",
              url: gallerySampleUrls[0],
              order: 1,
            },
            {
              id: `med-${th.id}-gal-2`,
              title: `${th.name} VIP Recliner Lounge`,
              caption: "Motorized leather recliners and in-seat service bay",
              url: gallerySampleUrls[2],
              order: 2,
            },
            {
              id: `med-${th.id}-gal-3`,
              title: `${th.name} Grand Atrium Concessions`,
              caption: "Artisan concessions counter and express pickup lane",
              url: gallerySampleUrls[3],
              order: 3,
            },
          ];

    for (const gal of galleryItems) {
      const galAsset = buildSeedMediaAsset({
        id: gal.id,
        collectionId: col.id,
        theatreId: th.id,
        theatreName: th.name,
        theatreSlug: th.slug,
        mediaType: "GALLERY_IMAGE",
        title: gal.title,
        url: gal.url,
        altText: `${gal.title} at ${th.name}, ${th.city}`,
        caption: gal.caption,
        mimeType: "image/jpeg",
        fileSizeBytes: 1450000,
        width: 1600,
        height: 1067,
        dominantColor: "#161F2E",
        displayOrder: gal.order,
        uploadedBy: th.id === "th-pun-001" ? "usr-theatre-1" : "usr-super-1",
        uploadedByName: th.id === "th-pun-001" ? "Aditi Kulkarni" : "Vikram Singhania",
      });
      totalBytes += galAsset.metadata.fileSizeBytes;
      mediaStore.set(galAsset.id, galAsset);
    }

    // Seed prepared Future Video & 360° Panorama placeholders on flagship th-pun-001
    if (th.id === "th-pun-001") {
      const futureVideoStub = buildSeedMediaAsset({
        id: `med-${th.id}-fut-vid-1`,
        collectionId: col.id,
        theatreId: th.id,
        theatreName: th.name,
        theatreSlug: th.slug,
        mediaType: "FUTURE_VIDEO_PLACEHOLDER",
        futureVideoSubtype: "THEATRE_WALKTHROUGH",
        title: "Phoenix Marketcity VIP Walkthrough Reel (Future)",
        url: gallerySampleUrls[1],
        altText: "Future theatre walkthrough video cover frame",
        caption: "Prepared architecture placeholder for future 4K streaming walkthrough.",
        mimeType: "image/webp",
        fileSizeBytes: 512000,
        width: 1920,
        height: 1080,
        dominantColor: "#070B12",
        displayOrder: 1,
        status: "DRAFT",
      });

      const futurePanoramaStub = buildSeedMediaAsset({
        id: `med-${th.id}-fut-pano-1`,
        collectionId: col.id,
        theatreId: th.id,
        theatreName: th.name,
        theatreSlug: th.slug,
        mediaType: "FUTURE_PANORAMA_PLACEHOLDER",
        futureVideoSubtype: "VIRTUAL_TOUR",
        title: "IMAX Laser Auditorium 360° Equirectangular Frame (Future)",
        url: gallerySampleUrls[0],
        altText: "Future 360-degree virtual auditorium tour frame",
        caption: "Prepared panorama architecture placeholder for interactive spatial tour.",
        mimeType: "image/webp",
        fileSizeBytes: 980000,
        width: 2400,
        height: 1200,
        dominantColor: "#111827",
        displayOrder: 2,
        status: "DRAFT",
      });

      totalBytes += futureVideoStub.metadata.fileSizeBytes + futurePanoramaStub.metadata.fileSizeBytes;
      mediaStore.set(futureVideoStub.id, futureVideoStub);
      mediaStore.set(futurePanoramaStub.id, futurePanoramaStub);
    }

    col.usedStorageBytes = totalBytes;
    collectionStore.set(th.id, col);
  });
}

initializeMediaStore();

export class TheatreMediaRepository extends BaseRepository<TheatreMediaAsset> {
  protected entityName = "TheatreMedia";

  resetStore(): void {
    initializeMediaStore();
  }

  /**
   * Resolves (or lazily initializes) the TheatreMediaCollection for any theatre,
   * including newly created theatres from Phase 3 Part 1.
   */
  async ensureCollection(theatreId: string): Promise<TheatreMediaCollectionRecord | null> {
    const existingCol = collectionStore.get(theatreId);
    if (existingCol) {
      this.recalculateStorageUsage(theatreId);
      return collectionStore.get(theatreId)!;
    }

    const lifecycleTheatre = await theatreLifecycleRepository.findById(theatreId);
    if (!lifecycleTheatre) return null;

    const newCol = createInitialCollection(lifecycleTheatre.id, lifecycleTheatre.slug);
    collectionStore.set(theatreId, newCol);
    return newCol;
  }

  getCollection(theatreId: string): TheatreMediaCollectionRecord | null {
    return collectionStore.get(theatreId) || null;
  }

  recalculateStorageUsage(theatreId: string): void {
    const col = collectionStore.get(theatreId);
    if (!col) return;

    let bytes = 0;
    for (const item of mediaStore.values()) {
      if (item.theatreId === theatreId && item.status !== "DELETED") {
        bytes += item.metadata.fileSizeBytes;
      }
    }
    col.usedStorageBytes = bytes;
    col.updatedAt = new Date().toISOString();
    collectionStore.set(theatreId, col);
  }

  async findById(id: string): Promise<TheatreMediaAsset | null> {
    this.logQuery("findById", { id });
    return mediaStore.get(id) || null;
  }

  async findAll(): Promise<TheatreMediaAsset[]> {
    return Array.from(mediaStore.values());
  }

  async findByTheatre(theatreId: string, includeDeleted = false): Promise<TheatreMediaAsset[]> {
    const items: TheatreMediaAsset[] = [];
    for (const item of mediaStore.values()) {
      if (item.theatreId !== theatreId) continue;
      if (!includeDeleted && item.status === "DELETED") continue;
      items.push(item);
    }
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async findDuplicateByChecksum(
    theatreId: string,
    checksum: string,
    excludeMediaId?: string
  ): Promise<TheatreMediaAsset | null> {
    for (const item of mediaStore.values()) {
      if (item.theatreId !== theatreId) continue;
      if (item.status === "DELETED") continue;
      if (excludeMediaId && item.id === excludeMediaId) continue;
      if (item.metadata.checksum === checksum) {
        return item;
      }
    }
    return null;
  }

  computeSummaryForPool(pool: TheatreMediaAsset[], quotaBytes = 524288000): MediaCollectionSummaryMetrics {
    const nonDeleted = pool.filter((a) => a.status !== "DELETED");
    return {
      totalAssets: nonDeleted.length,
      activeAssets: pool.filter((a) => a.status === "ACTIVE").length,
      draftAssets: pool.filter((a) => a.status === "DRAFT").length,
      hiddenAssets: pool.filter((a) => a.status === "HIDDEN").length,
      archivedAssets: pool.filter((a) => a.status === "ARCHIVED").length,
      deletedAssets: pool.filter((a) => a.status === "DELETED").length,
      galleryCount: nonDeleted.filter((a) => a.mediaType === "GALLERY_IMAGE").length,
      futurePlaceholderCount: nonDeleted.filter(
        (a) =>
          a.mediaType === "FUTURE_VIDEO_PLACEHOLDER" ||
          a.mediaType === "FUTURE_PANORAMA_PLACEHOLDER"
      ).length,
      totalBytesUsed: nonDeleted.reduce((s, a) => s + a.metadata.fileSizeBytes, 0),
      quotaBytes,
    };
  }

  async searchAndPaginate(
    filters: TheatreMediaSearchFilters,
    scopedTenantId?: string
  ): Promise<PaginatedTheatreMediaResult> {
    this.logQuery("searchAndPaginate", {
      ...(filters as Record<string, unknown>),
      ...(scopedTenantId ? { scopedTenantId } : {}),
    });

    const targetTheatre = scopedTenantId || filters.theatreId;
    const rawAll = Array.from(mediaStore.values());
    const pool = targetTheatre ? rawAll.filter((a) => a.theatreId === targetTheatre) : rawAll;

    const quota =
      targetTheatre && collectionStore.get(targetTheatre)
        ? collectionStore.get(targetTheatre)!.storageQuotaBytes
        : 524288000;

    const summary = this.computeSummaryForPool(pool, quota);

    const normalizeUpper = (d: string) => (d.length === 10 ? `${d}T23:59:59.999Z` : d);

    const filtered = pool.filter((asset) => {
      if (!filters.includeDeleted && asset.status === "DELETED") return false;

      if (filters.query && filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        const matches =
          asset.title.toLowerCase().includes(q) ||
          asset.mediaType.toLowerCase().includes(q) ||
          asset.theatreName.toLowerCase().includes(q) ||
          asset.theatreSlug.toLowerCase().includes(q) ||
          (asset.uploadedByName || "").toLowerCase().includes(q) ||
          asset.uploadedBy.toLowerCase().includes(q) ||
          asset.metadata.altText.toLowerCase().includes(q) ||
          (asset.metadata.caption || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filters.mediaType && filters.mediaType !== "ALL" && asset.mediaType !== filters.mediaType) {
        return false;
      }

      if (filters.status && filters.status !== "ALL" && asset.status !== filters.status) {
        return false;
      }

      if (filters.uploadedFrom && asset.createdAt < filters.uploadedFrom) return false;
      if (filters.uploadedTo && asset.createdAt > normalizeUpper(filters.uploadedTo)) return false;
      if (filters.updatedFrom && asset.updatedAt < filters.updatedFrom) return false;
      if (filters.updatedTo && asset.updatedAt > normalizeUpper(filters.updatedTo)) return false;

      return true;
    });

    const sortBy = filters.sortBy || "displayOrder";
    const dir = filters.sortOrder === "desc" ? -1 : 1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "createdAt":
          return a.createdAt.localeCompare(b.createdAt) * dir;
        case "updatedAt":
          return a.updatedAt.localeCompare(b.updatedAt) * dir;
        case "fileSizeBytes":
          return (a.metadata.fileSizeBytes - b.metadata.fileSizeBytes) * dir;
        case "displayOrder":
        default:
          return (a.displayOrder - b.displayOrder || b.updatedAt.localeCompare(a.updatedAt)) * dir;
      }
    });

    const paginated = paginateArray(
      filtered,
      { page: filters.page || 1, pageSize: filters.pageSize || 12 },
      12,
      100
    );

    return {
      ...paginated,
      summary,
    };
  }

  /**
   * Ensures single active asset constraint for single-slot types
   * (LOGO, BANNER, COVER_IMAGE, HERO_IMAGE, THUMBNAIL).
   */
  syncCollectionSingleActiveSlot(theatreId: string, asset: TheatreMediaAsset): void {
    const col = collectionStore.get(theatreId);
    if (!col) return;

    if (!SINGLE_ACTIVE_MEDIA_TYPES.includes(asset.mediaType)) {
      return;
    }

    if (asset.status === "ACTIVE") {
      // Archive any sibling active assets of same single-slot type cleanly
      for (const sibling of mediaStore.values()) {
        if (
          sibling.theatreId === theatreId &&
          sibling.mediaType === asset.mediaType &&
          sibling.id !== asset.id &&
          sibling.status === "ACTIVE"
        ) {
          sibling.status = "ARCHIVED";
          sibling.isPrimary = false;
          sibling.updatedAt = new Date().toISOString();
          sibling.references = sibling.references.map((r) => ({ ...r, isActive: false }));
          mediaStore.set(sibling.id, sibling);
        }
      }

      switch (asset.mediaType) {
        case "LOGO":
          col.activeLogoMediaId = asset.id;
          break;
        case "BANNER":
          col.activeBannerMediaId = asset.id;
          break;
        case "COVER_IMAGE":
          col.activeCoverMediaId = asset.id;
          break;
        case "HERO_IMAGE":
          col.activeHeroMediaId = asset.id;
          break;
        case "THUMBNAIL":
          col.activeThumbnailMediaId = asset.id;
          break;
      }
    } else {
      // If deactivated/deleted/hidden/archived, clear pointer if pointing here
      if (col.activeLogoMediaId === asset.id) col.activeLogoMediaId = undefined;
      if (col.activeBannerMediaId === asset.id) col.activeBannerMediaId = undefined;
      if (col.activeCoverMediaId === asset.id) col.activeCoverMediaId = undefined;
      if (col.activeHeroMediaId === asset.id) col.activeHeroMediaId = undefined;
      if (col.activeThumbnailMediaId === asset.id) col.activeThumbnailMediaId = undefined;
    }

    col.version += 1;
    col.updatedAt = new Date().toISOString();
    collectionStore.set(theatreId, col);
  }

  async create(data: Partial<TheatreMediaAsset>): Promise<TheatreMediaAsset> {
    if (!data.id || !data.theatreId || !data.collectionId || !data.mediaType || !data.url) {
      throw new Error("Missing required TheatreMedia fields on create.");
    }
    const entity = data as TheatreMediaAsset;
    mediaStore.set(entity.id, entity);
    this.syncCollectionSingleActiveSlot(entity.theatreId, entity);
    this.recalculateStorageUsage(entity.theatreId);
    return entity;
  }

  async update(id: string, data: Partial<TheatreMediaAsset>): Promise<TheatreMediaAsset | null> {
    const existing = mediaStore.get(id);
    if (!existing) return null;

    const updated: TheatreMediaAsset = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    mediaStore.set(id, updated);
    this.syncCollectionSingleActiveSlot(updated.theatreId, updated);
    this.recalculateStorageUsage(updated.theatreId);
    return updated;
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error("Physical deletion of TheatreMedia is forbidden. Use soft delete.");
  }

  recordAudit(record: Omit<TheatreMediaAuditRecord, "id">): TheatreMediaAuditRecord {
    const entry: TheatreMediaAuditRecord = {
      id: `med-aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...record,
    };
    auditStore.unshift(entry);
    return entry;
  }

  getAudits(theatreId?: string): TheatreMediaAuditRecord[] {
    if (!theatreId) return [...auditStore];
    return auditStore.filter((a) => a.theatreId === theatreId);
  }
}

export const theatreMediaRepository = new TheatreMediaRepository();

