/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Management Types (Phase 3 – Part 2)
 * ==============================================================================
 * Enterprise Digital Asset Management (DAM) contracts supporting:
 * Platform -> Theatre -> TheatreMediaCollection -> TheatreMedia -> Versions & Refs
 * ==============================================================================
 */

export type TheatreMediaType =
  | "LOGO"
  | "BANNER"
  | "COVER_IMAGE"
  | "HERO_IMAGE"
  | "THUMBNAIL"
  | "GALLERY_IMAGE"
  | "FUTURE_VIDEO_PLACEHOLDER"
  | "FUTURE_PANORAMA_PLACEHOLDER";

export type TheatreMediaStatus =
  | "DRAFT"
  | "ACTIVE"
  | "HIDDEN"
  | "ARCHIVED"
  | "DELETED";

export type FutureVideoSubtype =
  | "PROMOTIONAL_VIDEO"
  | "THEATRE_WALKTHROUGH"
  | "HALL_PREVIEW"
  | "VIDEO_360"
  | "VIRTUAL_TOUR";

export type MediaUploadSource =
  | "FILE_UPLOAD_PLACEHOLDER"
  | "URL_REFERENCE"
  | "BRAND_IMPORT";

export const SINGLE_ACTIVE_MEDIA_TYPES: readonly TheatreMediaType[] = [
  "LOGO",
  "BANNER",
  "COVER_IMAGE",
  "HERO_IMAGE",
  "THUMBNAIL",
] as const;

export interface MediaCropPlaceholder {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: "px" | "%";
  aspectLock?: string;
}

export interface MediaCompressionPlaceholder {
  compressionReady: boolean;
  targetFormats: ("webp" | "avif" | "jpeg")[];
  responsiveWidths: number[];
  thumbnailSpec: { width: number; height: number };
  cdnUrlPatternPlaceholder?: string;
}

export interface TheatreMediaMetadataRecord {
  altText: string;
  caption?: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  aspectRatio: string;
  checksum: string;
  uploadSource: MediaUploadSource;
  dominantColor: string;
  cropPlaceholder?: MediaCropPlaceholder;
  compressionPlaceholder: MediaCompressionPlaceholder;
  corruptedCheckStatus: "PASSED" | "FAILED_CORRUPTED_SIGNATURE";
  duplicateCheckHash: string;
}

export interface TheatreMediaVersionRecord {
  id: string;
  mediaId: string;
  versionNumber: number;
  url: string;
  checksum: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  dominantColor: string;
  altText: string;
  caption?: string;
  changeReason?: string;
  replacedBy?: string;
  createdAt: string;
}

export type MediaReferenceTargetType =
  | "THEATRE"
  | "HALL"
  | "MOVIE"
  | "PROMOTION"
  | "ADVERTISEMENT";

export interface TheatreMediaReferenceRecord {
  id: string;
  theatreId: string;
  mediaId: string;
  targetEntityType: MediaReferenceTargetType;
  targetEntityId: string;
  slotKey: string;
  isActive: boolean;
  createdAt: string;
}

export interface TheatreMediaAsset {
  id: string;
  collectionId: string;
  theatreId: string;
  theatreName: string;
  theatreSlug: string;
  mediaType: TheatreMediaType;
  futureVideoSubtype?: FutureVideoSubtype;
  title: string;
  slug: string;
  url: string;
  status: TheatreMediaStatus;
  displayOrder: number;
  displayPriority: number;
  currentVersion: number;
  isPrimary: boolean;
  uploadedBy: string;
  uploadedByName?: string;
  deletedBy?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: TheatreMediaMetadataRecord;
  versions: TheatreMediaVersionRecord[];
  references: TheatreMediaReferenceRecord[];
}

export interface TheatreMediaCollectionRecord {
  id: string;
  theatreId: string;
  collectionCode: string;
  activeLogoMediaId?: string;
  activeBannerMediaId?: string;
  activeCoverMediaId?: string;
  activeHeroMediaId?: string;
  activeThumbnailMediaId?: string;
  storageDriver: "LOCAL_VIRTUAL_VAULT";
  cdnBaseUrlPlaceholder?: string;
  storageQuotaBytes: number;
  usedStorageBytes: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadTheatreMediaInput {
  theatreId: string;
  mediaType: TheatreMediaType;
  futureVideoSubtype?: FutureVideoSubtype;
  title: string;
  url: string;
  status?: "DRAFT" | "ACTIVE" | "HIDDEN";
  altText: string;
  caption?: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  uploadSource?: MediaUploadSource;
  dominantColor?: string;
  displayPriority?: number;
  cropPlaceholder?: MediaCropPlaceholder;
  rawSignatureCheck?: string;
}

export interface ReplaceTheatreMediaInput {
  theatreId: string;
  mediaId: string;
  expectedVersion?: number;
  title?: string;
  url: string;
  altText: string;
  caption?: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  dominantColor?: string;
  changeReason?: string;
  cropPlaceholder?: MediaCropPlaceholder;
  rawSignatureCheck?: string;
}

export interface UpdateMediaMetadataInput {
  theatreId: string;
  mediaId: string;
  title?: string;
  altText?: string;
  caption?: string;
  status?: "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
  displayPriority?: number;
  dominantColor?: string;
  cropPlaceholder?: MediaCropPlaceholder;
}

export interface ReorderGalleryInput {
  theatreId: string;
  orderedMediaIds: string[];
  mode?: "DRAG_DROP" | "MANUAL" | "AUTO_NORMALIZE";
}

export interface TheatreMediaSearchFilters {
  theatreId?: string;
  query?: string; // Searches title, mediaType, theatreName, uploader
  mediaType?: TheatreMediaType | "ALL";
  status?: TheatreMediaStatus | "ALL";
  includeDeleted?: boolean;
  uploadedFrom?: string;
  uploadedTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sortBy?: "displayOrder" | "createdAt" | "updatedAt" | "title" | "fileSizeBytes";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface MediaCollectionSummaryMetrics {
  totalAssets: number;
  activeAssets: number;
  draftAssets: number;
  hiddenAssets: number;
  archivedAssets: number;
  deletedAssets: number;
  galleryCount: number;
  futurePlaceholderCount: number;
  totalBytesUsed: number;
  quotaBytes: number;
}

export interface PaginatedTheatreMediaResult {
  items: TheatreMediaAsset[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: MediaCollectionSummaryMetrics;
}

export interface TheatreMediaAuditRecord {
  id: string;
  theatreId: string;
  mediaId?: string;
  action:
    | "MEDIA_UPLOADED"
    | "MEDIA_REPLACED"
    | "MEDIA_VERSION_RESTORED"
    | "MEDIA_DELETED"
    | "GALLERY_REORDERED"
    | "METADATA_UPDATED";
  actorId: string;
  actorRole: string;
  summary: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TheatreMediaCollectionBundle {
  collection: TheatreMediaCollectionRecord;
  brandingSlots: {
    logo?: TheatreMediaAsset;
    banner?: TheatreMediaAsset;
    coverImage?: TheatreMediaAsset;
    heroImage?: TheatreMediaAsset;
    thumbnail?: TheatreMediaAsset;
  };
  galleryImages: TheatreMediaAsset[];
  futurePlaceholders: TheatreMediaAsset[];
  allAssets: TheatreMediaAsset[];
  summary: MediaCollectionSummaryMetrics;
  recentAudits: TheatreMediaAuditRecord[];
}

export interface TheatrePublicMediaView {
  theatreId: string;
  theatreSlug: string;
  theatreName: string;
  logo?: TheatreMediaAsset;
  banner?: TheatreMediaAsset;
  coverImage?: TheatreMediaAsset;
  heroImage?: TheatreMediaAsset;
  thumbnail?: TheatreMediaAsset;
  gallery: TheatreMediaAsset[];
  futureVideoPlaceholders: {
    subtype: FutureVideoSubtype;
    label: string;
    description: string;
    aspectRatio: string;
    status: "PLACEHOLDER_RESERVED";
  }[];
  cacheTag: string;
}

export interface MediaUploadValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  computedChecksum?: string;
  computedAspectRatio?: string;
  duplicateDetected?: boolean;
  duplicateAssetId?: string;
}

