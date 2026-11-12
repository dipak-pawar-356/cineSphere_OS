/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Management Contracts (Phase 3 – Part 3)
 * ==============================================================================
 * Decoupled multi-tenant domain contracts for public & business theatre profiles,
 * multi-language catalogs, social presence, completion scoring, localization
 * readiness, and immutable version snapshots.
 * ==============================================================================
 */

import { PaginatedResult } from "@/lib/performance/cache-strategy";
import { TheatreMediaAsset } from "./theatre-media.types";

export type TheatreProfileStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";

export type TheatreCategoryType =
  | "MULTIPLEX"
  | "SINGLE_SCREEN"
  | "LUXURY_CINEMA"
  | "DRIVE_IN_CINEMA"
  | "MINI_THEATRE"
  | "INDEPENDENT_THEATRE"
  | "CHAIN_THEATRE"
  | "CUSTOM";

export type TheatreOwnershipModel = "CHAIN" | "INDEPENDENT";

export type TheatreSocialPlatform =
  | "WEBSITE"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "X_TWITTER"
  | "YOUTUBE"
  | "LINKEDIN"
  | "THREADS"
  | "CUSTOM";

export interface TheatreLocalizedTextFields {
  theatreName?: string;
  displayName?: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  tagline?: string;
}

export interface TheatreLanguageRecord {
  id: string;
  profileId: string;
  theatreId: string;
  languageCode: string;
  displayName: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreSocialLinkRecord {
  id: string;
  profileId: string;
  theatreId: string;
  platform: TheatreSocialPlatform;
  customPlatformName?: string;
  label?: string;
  url: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreProfileVersionRecord {
  id: string;
  profileId: string;
  theatreId: string;
  versionNumber: number;
  previousValues: Record<string, unknown>;
  nextValues: Record<string, unknown>;
  updatedFields: string[];
  changeSummary?: string;
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
}

export interface ProfileCompletionChecklist {
  hasBasicIdentity: boolean;
  hasDescriptions: boolean;
  hasLogoUploaded: boolean;
  hasBannerUploaded: boolean;
  hasWebsiteConfigured: boolean;
  hasSocialLinks: boolean;
  hasLanguagesConfigured: boolean;
  hasCapacitySpecs: boolean;
}

export interface ProfileCompletionSummary {
  score: number; // 0..100
  completedSteps: number;
  totalSteps: number;
  checklist: ProfileCompletionChecklist;
  missingRecommendations: string[];
}

export interface TheatreProfileRecord {
  id: string;
  theatreId: string;
  internalTheatreSlug: string;
  publicSlug: string;

  // Basic Information
  theatreName: string;
  legalName: string;
  displayName: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  tagline?: string;
  defaultLocale: string;
  localizedFields: Record<string, TheatreLocalizedTextFields>;

  // Classification
  establishedYear?: number;
  theatreType: TheatreCategoryType;
  customTheatreType?: string;
  ownershipModel: TheatreOwnershipModel;
  chainName?: string;

  // Business Information
  screensCount: number;
  totalSeatingCapacity: number;
  averageCapacityPerScreen: number;
  primaryLanguageCode: string;
  website?: string;
  businessEmailPlaceholder?: string;
  businessPhonePlaceholder?: string;

  // Nested Relationships
  languages: TheatreLanguageRecord[];
  socialLinks: TheatreSocialLinkRecord[];

  // Governance & Completion
  status: TheatreProfileStatus;
  version: number;
  completionScore: number;
  completionSummary: ProfileCompletionSummary;

  publishedAt?: string;
  publishedBy?: string;
  archivedAt?: string;
  archivedBy?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TheatreProfileAuditRecord {
  id: string;
  profileId: string;
  theatreId: string;
  eventType:
    | "PROFILE_CREATED"
    | "PROFILE_UPDATED"
    | "PROFILE_PUBLISHED"
    | "PROFILE_HIDDEN"
    | "PROFILE_ARCHIVED"
    | "LANGUAGE_UPDATED"
    | "SOCIAL_LINK_UPDATED"
    | "PROFILE_VERSION_ROLLBACK";
  actorId: string;
  actorName?: string;
  actorRole: string;
  summary: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TheatreProfileBundle {
  profile: TheatreProfileRecord;
  brandingPreview: {
    logo?: TheatreMediaAsset;
    banner?: TheatreMediaAsset;
  };
  versions: TheatreProfileVersionRecord[];
  recentAudits: TheatreProfileAuditRecord[];
}

export interface PublicTheatreProfileView {
  profileId: string;
  theatreId: string;
  publicSlug: string;
  internalTheatreSlug: string;
  theatreName: string;
  displayName: string;
  tagline?: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  theatreType: TheatreCategoryType;
  customTheatreType?: string;
  ownershipModel: TheatreOwnershipModel;
  chainName?: string;
  establishedYear?: number;
  screensCount: number;
  totalSeatingCapacity: number;
  averageCapacityPerScreen: number;
  primaryLanguageCode: string;
  languages: TheatreLanguageRecord[];
  website?: string;
  socialLinks: TheatreSocialLinkRecord[];
  branding: {
    logo?: TheatreMediaAsset;
    banner?: TheatreMediaAsset;
  };
  localizedFields: Record<string, TheatreLocalizedTextFields>;
  defaultLocale: string;
  completionScore: number;
}

// ==============================================================================
// Server Action & Service Input DTOs
// ==============================================================================

export interface TheatreLanguageInput {
  languageCode: string;
  displayName: string;
  isPrimary: boolean;
}

export interface TheatreSocialLinkInput {
  platform: TheatreSocialPlatform;
  customPlatformName?: string;
  label?: string;
  url: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CreateTheatreProfileInput {
  theatreId: string;
  publicSlug?: string;
  theatreName: string;
  legalName: string;
  displayName?: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  tagline?: string;
  defaultLocale?: string;
  localizedFields?: Record<string, TheatreLocalizedTextFields>;
  establishedYear?: number;
  theatreType: TheatreCategoryType;
  customTheatreType?: string;
  ownershipModel: TheatreOwnershipModel;
  chainName?: string;
  screensCount: number;
  totalSeatingCapacity: number;
  website?: string;
  businessEmailPlaceholder?: string;
  businessPhonePlaceholder?: string;
  status?: TheatreProfileStatus;
  languages?: TheatreLanguageInput[];
  socialLinks?: TheatreSocialLinkInput[];
}

export interface UpdateTheatreProfileInput {
  theatreId: string;
  expectedVersion?: number;
  publicSlug?: string;
  theatreName?: string;
  legalName?: string;
  displayName?: string;
  shortDescription?: string;
  fullDescription?: string;
  aboutTheatre?: string;
  tagline?: string;
  defaultLocale?: string;
  localizedFields?: Record<string, TheatreLocalizedTextFields>;
  establishedYear?: number;
  theatreType?: TheatreCategoryType;
  customTheatreType?: string;
  ownershipModel?: TheatreOwnershipModel;
  chainName?: string;
  screensCount?: number;
  totalSeatingCapacity?: number;
  website?: string;
  businessEmailPlaceholder?: string;
  businessPhonePlaceholder?: string;
  changeSummary?: string;
}

export interface ProfileStatusTransitionInput {
  theatreId: string;
  reason?: string;
}

export interface UpdateTheatreLanguagesInput {
  theatreId: string;
  languages: TheatreLanguageInput[];
  changeSummary?: string;
}

export interface UpdateTheatreSocialLinksInput {
  theatreId: string;
  socialLinks: TheatreSocialLinkInput[];
  changeSummary?: string;
}

export interface SearchTheatreProfileFilters {
  theatreId?: string;
  query?: string; // Searches Theatre Name, Legal Name, Theatre Type, Language, Website
  theatreType?: TheatreCategoryType | "ALL";
  ownershipModel?: TheatreOwnershipModel | "ALL";
  status?: TheatreProfileStatus | "ALL";
  languageCode?: string;
  establishedYearFrom?: number;
  establishedYearTo?: number;
  sortBy?: "theatreName" | "completionScore" | "establishedYear" | "screensCount" | "updatedAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedTheatreProfileResult extends PaginatedResult<TheatreProfileRecord> {
  summary: {
    totalProfiles: number;
    publishedCount: number;
    draftCount: number;
    hiddenCount: number;
    archivedCount: number;
    averageCompletionScore: number;
  };
}

