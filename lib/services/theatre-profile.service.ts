/**
 * ==============================================================================
 * CineSphere OS — Theatre Profile Domain Service (Phase 3 – Part 3)
 * ==============================================================================
 * Core business logic for decentralized Theatre Profile Management:
 * - Basic & Business Identity, Public Profile Slug separation
 * - Multi-language & Social Link governance with single primary enforcement
 * - Profile Completion Score integrated with Branding Logo/Banner state
 * - Localization-ready field mapping & Immutable Version History (with Rollback)
 * - Strict RBAC, Tenant Isolation, XSS/SQLi Sanitization, Cache & Audit Logs
 * ==============================================================================
 */

import {
  CACHE_TAGS,
  invalidateCacheByTag,
  withQueryCache,
} from "@/lib/performance/cache-strategy";
import { createLogger } from "@/lib/observability/structured-logger";
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeString,
  sanitizeUrl,
  stripHtml,
} from "@/lib/security/input-sanitizer";
import { securityAuditService } from "./security-audit.service";
import { tenantService } from "./tenant.service";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { theatreMediaRepository } from "@/lib/repositories/theatre-media.repository";
import {
  computeAverageCapacity,
  computeProfileCompletion,
  theatreProfileRepository,
} from "@/lib/repositories/theatre-profile.repository";
import {
  CreateTheatreProfileSchema,
  ProfileStatusTransitionSchema,
  RetrieveTheatreProfileSchema,
  UpdateTheatreLanguagesSchema,
  UpdateTheatreProfileSchema,
  UpdateTheatreSocialLinksSchema,
} from "@/lib/validation/theatre-profile.validation";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { TheatreMediaAsset } from "@/types/theatre-media.types";
import {
  CreateTheatreProfileInput,
  PaginatedTheatreProfileResult,
  PublicTheatreProfileView,
  SearchTheatreProfileFilters,
  TheatreLanguageInput,
  TheatreLanguageRecord,
  TheatreLocalizedTextFields,
  TheatreProfileBundle,
  TheatreProfileRecord,
  TheatreProfileStatus,
  TheatreProfileVersionRecord,
  TheatreSocialLinkInput,
  TheatreSocialLinkRecord,
  UpdateTheatreLanguagesInput,
  UpdateTheatreProfileInput,
  UpdateTheatreSocialLinksInput,
} from "@/types/theatre-profile.types";

const logger = createLogger("TheatreProfileService");

function formatZodIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_root";
    if (!map[key]) map[key] = [];
    map[key].push(issue.message);
  }
  return map;
}

function sanitizePlainText(value?: string, maxLength = 500): string | undefined {
  if (value === undefined) return undefined;
  const cleaned = stripHtml(sanitizeString(value, maxLength)).trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function generateSlugCandidate(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 140);
}

function normalizeLocalizedFields(
  raw?: Record<string, TheatreLocalizedTextFields>
): Record<string, TheatreLocalizedTextFields> {
  if (!raw) return {};
  const result: Record<string, TheatreLocalizedTextFields> = {};
  for (const [locale, fields] of Object.entries(raw)) {
    const cleanLocale = sanitizeString(locale, 16).replace(/[^a-zA-Z0-9-]/g, "");
    if (!cleanLocale) continue;
    result[cleanLocale] = {
      theatreName: sanitizePlainText(fields.theatreName, 150),
      displayName: sanitizePlainText(fields.displayName, 150),
      shortDescription: sanitizePlainText(fields.shortDescription, 400),
      fullDescription: sanitizePlainText(fields.fullDescription, 4000),
      aboutTheatre: sanitizePlainText(fields.aboutTheatre, 4000),
      tagline: sanitizePlainText(fields.tagline, 255),
    };
  }
  return result;
}

function buildLanguageRecords(
  profileId: string,
  theatreId: string,
  inputs: TheatreLanguageInput[] | undefined,
  now: string
): TheatreLanguageRecord[] {
  const effectiveInputs: TheatreLanguageInput[] =
    inputs && inputs.length > 0
      ? inputs
      : [{ languageCode: "en", displayName: "English", isPrimary: true }];

  // Deduplicate by languageCode preserving first entry
  const uniqueMap = new Map<string, TheatreLanguageInput>();
  for (const lang of effectiveInputs) {
    const code = sanitizeString(lang.languageCode, 16).toLowerCase();
    if (!code || uniqueMap.has(code)) continue;
    uniqueMap.set(code, {
      languageCode: code,
      displayName: stripHtml(sanitizeString(lang.displayName, 80)) || code.toUpperCase(),
      isPrimary: Boolean(lang.isPrimary),
    });
  }

  const normalized = Array.from(uniqueMap.values());
  const firstPrimaryIdx = normalized.findIndex((l) => l.isPrimary);
  const activePrimaryIdx = firstPrimaryIdx >= 0 ? firstPrimaryIdx : 0;

  return normalized.map((lang, idx) => ({
    id: `lang-${theatreId}-${lang.languageCode}-${Date.now()}`,
    profileId,
    theatreId,
    languageCode: lang.languageCode,
    displayName: lang.displayName,
    isPrimary: idx === activePrimaryIdx,
    createdAt: now,
    updatedAt: now,
  }));
}

function buildSocialLinkRecords(
  profileId: string,
  theatreId: string,
  inputs: TheatreSocialLinkInput[] | undefined,
  now: string
): TheatreSocialLinkRecord[] {
  if (!inputs || inputs.length === 0) return [];
  const links: TheatreSocialLinkRecord[] = [];
  inputs.forEach((item, idx) => {
    const cleanUrl = sanitizeUrl(item.url, ["http:", "https:"]);
    if (!cleanUrl || (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://"))) {
      throw new ValidationError(
        `Invalid social URL provided for ${item.platform}: '${item.url}'`,
        { socialLinks: [`Unsafe or invalid URL for ${item.platform}`] }
      );
    }
    links.push({
      id: `soc-${theatreId}-${item.platform.toLowerCase()}-${idx + 1}-${Date.now()}`,
      profileId,
      theatreId,
      platform: item.platform,
      customPlatformName: sanitizePlainText(item.customPlatformName, 80),
      label: sanitizePlainText(item.label, 120),
      url: cleanUrl,
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? idx + 1,
      createdAt: now,
      updatedAt: now,
    });
  });

  return links.sort((a, b) => a.displayOrder - b.displayOrder);
}

export class TheatreProfileService {
  private assertEditorRole(actor: SecurityActorContext, actionLabel: string): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        `Access denied: Role '${actor.role}' cannot execute '${actionLabel}' on theatre profiles.`,
        actor.correlationId
      );
    }
  }

  private invalidateProfileCaches(theatreId: string, publicSlug: string, internalSlug?: string) {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_PROFILE(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_PROFILE(theatreId));
    invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_PROFILE(publicSlug));
    if (internalSlug) {
      invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_PROFILE(internalSlug));
    }
  }

  private async resolveBrandingPreview(
    theatreId: string
  ): Promise<{ logo?: TheatreMediaAsset; banner?: TheatreMediaAsset }> {
    const collection = theatreMediaRepository.getCollection(theatreId);
    const assets = await theatreMediaRepository.findByTheatre(theatreId, false);
    const activeLogo =
      assets.find((a) => a.id === collection?.activeLogoMediaId && a.status === "ACTIVE") ||
      assets.find((a) => a.mediaType === "LOGO" && a.status === "ACTIVE");
    const activeBanner =
      assets.find((a) => a.id === collection?.activeBannerMediaId && a.status === "ACTIVE") ||
      assets.find((a) => a.mediaType === "BANNER" && a.status === "ACTIVE");
    return {
      logo: activeLogo,
      banner: activeBanner,
    };
  }

  private async recalculateCompletion(
    profile: TheatreProfileRecord
  ): Promise<TheatreProfileRecord> {
    const completion = await computeProfileCompletion({
      theatreId: profile.theatreId,
      theatreName: profile.theatreName,
      legalName: profile.legalName,
      shortDescription: profile.shortDescription,
      aboutTheatre: profile.aboutTheatre,
      website: profile.website,
      screensCount: profile.screensCount,
      totalSeatingCapacity: profile.totalSeatingCapacity,
      languagesCount: profile.languages.length,
      socialLinksCount: profile.socialLinks.filter((s) => s.isActive).length,
    });
    return {
      ...profile,
      completionScore: completion.score,
      completionSummary: completion,
    };
  }

  /**
   * 1. CREATE THEATRE PROFILE
   */
  async createProfile(
    rawInput: CreateTheatreProfileInput,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, "CREATE_PROFILE");
    const parsed = CreateTheatreProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || "Invalid theatre profile payload",
        formatZodIssues(parsed.error.issues),
        actor.correlationId
      );
    }

    const input = parsed.data;
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const theatre = await theatreLifecycleRepository.findById(input.theatreId);
    if (!theatre) {
      throw new NotFoundError("Theatre", input.theatreId, actor.correlationId);
    }

    const existingForTheatre = await theatreProfileRepository.findByTheatreId(input.theatreId);
    if (existingForTheatre) {
      throw new ConflictError(
        `Theatre '${theatre.name}' already has an initialized profile (${existingForTheatre.id}).`,
        { entity: "TheatreProfile", correlationId: actor.correlationId }
      );
    }

    const cleanTheatreName = sanitizePlainText(input.theatreName, 150)!;
    const duplicateName = await theatreProfileRepository.findByTheatreName(cleanTheatreName);
    if (duplicateName) {
      throw new ConflictError(
        `Duplicate Theatre Name '${cleanTheatreName}' already exists on another profile.`,
        { entity: "TheatreProfile", correlationId: actor.correlationId }
      );
    }

    const desiredSlug =
      sanitizePlainText(input.publicSlug, 160) || `${generateSlugCandidate(cleanTheatreName)}-showcase`;
    const slugCollision = await theatreProfileRepository.findByPublicSlug(desiredSlug);
    const finalPublicSlug = slugCollision ? `${desiredSlug}-${Date.now().toString().slice(-4)}` : desiredSlug;

    let sanitizedWebsite: string | undefined;
    if (input.website && input.website.trim().length > 0) {
      const checked = sanitizeUrl(input.website, ["http:", "https:"]);
      if (!checked || (!checked.startsWith("http://") && !checked.startsWith("https://"))) {
        throw new ValidationError("Website must be a valid http:// or https:// URL", {
          website: ["Invalid website URL"],
        });
      }
      sanitizedWebsite = checked;
    }

    const now = new Date().toISOString();
    const profileId = `prof-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const languages = buildLanguageRecords(profileId, input.theatreId, input.languages, now);
    const primaryLang = languages.find((l) => l.isPrimary) || languages[0];
    const socialLinks = buildSocialLinkRecords(profileId, input.theatreId, input.socialLinks, now);

    const initialStatus: TheatreProfileStatus =
      input.status && actor.role === "SUPER_ADMIN" ? input.status : input.status === "PUBLISHED" && actor.role === "SUPER_ADMIN" ? "PUBLISHED" : input.status || "DRAFT";

    let record: TheatreProfileRecord = {
      id: profileId,
      theatreId: input.theatreId,
      internalTheatreSlug: theatre.slug,
      publicSlug: finalPublicSlug,
      theatreName: cleanTheatreName,
      legalName: sanitizePlainText(input.legalName, 200)!,
      displayName: sanitizePlainText(input.displayName, 150) || cleanTheatreName,
      shortDescription: sanitizePlainText(input.shortDescription, 400),
      fullDescription: sanitizePlainText(input.fullDescription, 4000),
      aboutTheatre: sanitizePlainText(input.aboutTheatre, 4000),
      tagline: sanitizePlainText(input.tagline, 255),
      defaultLocale: input.defaultLocale || primaryLang.languageCode || "en",
      localizedFields: normalizeLocalizedFields(input.localizedFields),
      establishedYear: input.establishedYear,
      theatreType: input.theatreType,
      customTheatreType: sanitizePlainText(input.customTheatreType, 100),
      ownershipModel: input.ownershipModel,
      chainName: sanitizePlainText(input.chainName, 120),
      screensCount: input.screensCount,
      totalSeatingCapacity: input.totalSeatingCapacity,
      averageCapacityPerScreen: computeAverageCapacity(
        input.screensCount,
        input.totalSeatingCapacity
      ),
      primaryLanguageCode: primaryLang.languageCode,
      website: sanitizedWebsite,
      businessEmailPlaceholder: input.businessEmailPlaceholder
        ? sanitizeEmail(input.businessEmailPlaceholder) || undefined
        : undefined,
      businessPhonePlaceholder: input.businessPhonePlaceholder
        ? sanitizePhone(input.businessPhonePlaceholder) || undefined
        : undefined,
      languages,
      socialLinks,
      status: initialStatus,
      version: 1,
      completionScore: 0,
      completionSummary: {
        score: 0,
        completedSteps: 0,
        totalSteps: 8,
        checklist: {
          hasBasicIdentity: true,
          hasDescriptions: false,
          hasLogoUploaded: false,
          hasBannerUploaded: false,
          hasWebsiteConfigured: false,
          hasSocialLinks: false,
          hasLanguagesConfigured: false,
          hasCapacitySpecs: true,
        },
        missingRecommendations: [],
      },
      publishedAt: initialStatus === "PUBLISHED" ? now : undefined,
      publishedBy: initialStatus === "PUBLISHED" ? actor.userId : undefined,
      createdBy: actor.userId || "system",
      updatedBy: actor.userId || "system",
      createdAt: now,
      updatedAt: now,
    };

    record = await this.recalculateCompletion(record);
    await theatreProfileRepository.insertProfile(record);

    await theatreProfileRepository.addVersion({
      id: `pver-${profileId}-1`,
      profileId,
      theatreId: input.theatreId,
      versionNumber: 1,
      previousValues: {},
      nextValues: {
        theatreName: record.theatreName,
        legalName: record.legalName,
        publicSlug: record.publicSlug,
        status: record.status,
      },
      updatedFields: ["initial_profile_created"],
      changeSummary: "Created dedicated theatre profile",
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId,
      theatreId: input.theatreId,
      eventType: "PROFILE_CREATED",
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Created theatre profile '${record.displayName}' (/${record.publicSlug})`,
      timestamp: now,
      metadata: {
        theatreId: input.theatreId,
        completionScore: record.completionScore,
        status: record.status,
      },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_PROFILE",
      action: "CREATE",
      description: `Created TheatreProfile '${record.displayName}' for tenant '${input.theatreId}'`,
      metadata: { profileId, publicSlug: record.publicSlug },
    });

    this.invalidateProfileCaches(input.theatreId, record.publicSlug, theatre.slug);
    return record;
  }

  /**
   * 2. UPDATE THEATRE PROFILE (with Diff Version History & Optimistic Locking)
   */
  async updateProfile(
    rawInput: UpdateTheatreProfileInput,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, "UPDATE_PROFILE");
    const parsed = UpdateTheatreProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || "Invalid profile update payload",
        formatZodIssues(parsed.error.issues),
        actor.correlationId
      );
    }

    const input = parsed.data;
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const existing = await theatreProfileRepository.findByTheatreId(input.theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", input.theatreId, actor.correlationId);
    }

    if (existing.status === "ARCHIVED") {
      throw new BusinessRuleError(
        "Archived profiles are read-only. Re-publish or transition status to Draft before editing.",
        "PROFILE_ARCHIVED_READ_ONLY",
        actor.correlationId
      );
    }

    if (input.expectedVersion !== undefined && existing.version !== input.expectedVersion) {
      throw new ConflictError(
        `Optimistic locking conflict: profile is currently at v${existing.version}, expected v${input.expectedVersion}.`,
        {
          entity: "TheatreProfile",
          currentVersion: existing.version,
          expectedVersion: input.expectedVersion,
        }
      );
    }

    const previousValues: Record<string, unknown> = {};
    const nextValues: Record<string, unknown> = {};
    const updatedFields: string[] = [];

    const trackField = <K extends keyof TheatreProfileRecord>(
      field: K,
      nextVal: TheatreProfileRecord[K]
    ) => {
      if (JSON.stringify(existing[field]) !== JSON.stringify(nextVal)) {
        previousValues[field as string] = existing[field];
        nextValues[field as string] = nextVal;
        updatedFields.push(field as string);
      }
    };

    let nextTheatreName = existing.theatreName;
    if (input.theatreName !== undefined) {
      const cleaned = sanitizePlainText(input.theatreName, 150)!;
      if (cleaned.toLowerCase() !== existing.theatreName.toLowerCase()) {
        const dup = await theatreProfileRepository.findByTheatreName(cleaned, existing.id);
        if (dup) {
          throw new ConflictError(
            `Duplicate Theatre Name '${cleaned}' belongs to another cinema complex.`,
            { entity: "TheatreProfile", correlationId: actor.correlationId }
          );
        }
      }
      nextTheatreName = cleaned;
      trackField("theatreName", nextTheatreName);
    }

    let nextPublicSlug = existing.publicSlug;
    if (input.publicSlug !== undefined) {
      const cleanSlug = sanitizePlainText(input.publicSlug, 160)!;
      if (cleanSlug.toLowerCase() !== existing.publicSlug.toLowerCase()) {
        const slugTaken = await theatreProfileRepository.findByPublicSlug(cleanSlug);
        if (slugTaken && slugTaken.id !== existing.id) {
          throw new ConflictError(
            `Public profile slug '/${cleanSlug}' is already claimed by another theatre.`,
            { entity: "TheatreProfile", correlationId: actor.correlationId }
          );
        }
      }
      nextPublicSlug = cleanSlug;
      trackField("publicSlug", nextPublicSlug);
    }

    let nextWebsite = existing.website;
    if (input.website !== undefined) {
      if (input.website.trim() === "") {
        nextWebsite = undefined;
      } else {
        const cleanWeb = sanitizeUrl(input.website, ["http:", "https:"]);
        if (!cleanWeb || (!cleanWeb.startsWith("http://") && !cleanWeb.startsWith("https://"))) {
          throw new ValidationError("Website must be a valid http:// or https:// URL", {
            website: ["Invalid website URL"],
          });
        }
        nextWebsite = cleanWeb;
      }
      trackField("website", nextWebsite);
    }

    const nextScreens = input.screensCount ?? existing.screensCount;
    const nextCapacity = input.totalSeatingCapacity ?? existing.totalSeatingCapacity;
    if (nextCapacity < nextScreens * 10) {
      throw new ValidationError(
        `Total capacity (${nextCapacity}) cannot be less than ${nextScreens * 10} for ${nextScreens} screens.`,
        { totalSeatingCapacity: ["Invalid screen/capacity ratio"] }
      );
    }

    if (nextScreens !== existing.screensCount) trackField("screensCount", nextScreens);
    if (nextCapacity !== existing.totalSeatingCapacity) {
      trackField("totalSeatingCapacity", nextCapacity);
    }

    const nextLegalName =
      input.legalName !== undefined ? sanitizePlainText(input.legalName, 200)! : existing.legalName;
    if (nextLegalName !== existing.legalName) trackField("legalName", nextLegalName);

    const nextDisplayName =
      input.displayName !== undefined
        ? sanitizePlainText(input.displayName, 150)!
        : existing.displayName;
    if (nextDisplayName !== existing.displayName) trackField("displayName", nextDisplayName);

    const nextShortDesc =
      input.shortDescription !== undefined
        ? sanitizePlainText(input.shortDescription, 400)
        : existing.shortDescription;
    if (nextShortDesc !== existing.shortDescription) trackField("shortDescription", nextShortDesc);

    const nextFullDesc =
      input.fullDescription !== undefined
        ? sanitizePlainText(input.fullDescription, 4000)
        : existing.fullDescription;
    if (nextFullDesc !== existing.fullDescription) trackField("fullDescription", nextFullDesc);

    const nextAbout =
      input.aboutTheatre !== undefined
        ? sanitizePlainText(input.aboutTheatre, 4000)
        : existing.aboutTheatre;
    if (nextAbout !== existing.aboutTheatre) trackField("aboutTheatre", nextAbout);

    const nextTagline =
      input.tagline !== undefined ? sanitizePlainText(input.tagline, 255) : existing.tagline;
    if (nextTagline !== existing.tagline) trackField("tagline", nextTagline);

    const nextType = input.theatreType ?? existing.theatreType;
    if (nextType !== existing.theatreType) trackField("theatreType", nextType);

    const nextCustomType =
      input.customTheatreType !== undefined
        ? sanitizePlainText(input.customTheatreType, 100)
        : existing.customTheatreType;
    if (nextType === "CUSTOM" && (!nextCustomType || nextCustomType.length < 2)) {
      throw new ValidationError("Custom theatre type requires a label", {
        customTheatreType: ["Required for CUSTOM theatreType"],
      });
    }
    if (nextCustomType !== existing.customTheatreType) {
      trackField("customTheatreType", nextCustomType);
    }

    const nextOwnership = input.ownershipModel ?? existing.ownershipModel;
    if (nextOwnership !== existing.ownershipModel) trackField("ownershipModel", nextOwnership);

    const nextChainName =
      input.chainName !== undefined ? sanitizePlainText(input.chainName, 120) : existing.chainName;
    if (nextChainName !== existing.chainName) trackField("chainName", nextChainName);

    const nextYear = input.establishedYear ?? existing.establishedYear;
    if (nextYear !== existing.establishedYear) trackField("establishedYear", nextYear);

    const nextEmail =
      input.businessEmailPlaceholder !== undefined
        ? input.businessEmailPlaceholder
          ? sanitizeEmail(input.businessEmailPlaceholder) || undefined
          : undefined
        : existing.businessEmailPlaceholder;
    if (nextEmail !== existing.businessEmailPlaceholder) {
      trackField("businessEmailPlaceholder", nextEmail);
    }

    const nextPhone =
      input.businessPhonePlaceholder !== undefined
        ? input.businessPhonePlaceholder
          ? sanitizePhone(input.businessPhonePlaceholder) || undefined
          : undefined
        : existing.businessPhonePlaceholder;
    if (nextPhone !== existing.businessPhonePlaceholder) {
      trackField("businessPhonePlaceholder", nextPhone);
    }

    const nextLocale = input.defaultLocale ?? existing.defaultLocale;
    const nextLocalizedFields =
      input.localizedFields !== undefined
        ? { ...existing.localizedFields, ...normalizeLocalizedFields(input.localizedFields) }
        : existing.localizedFields;
    if (input.localizedFields !== undefined) {
      trackField("localizedFields", nextLocalizedFields);
    }

    const now = new Date().toISOString();
    const nextVersion = existing.version + 1;

    let updated: TheatreProfileRecord = {
      ...existing,
      theatreName: nextTheatreName,
      legalName: nextLegalName,
      displayName: nextDisplayName,
      publicSlug: nextPublicSlug,
      shortDescription: nextShortDesc,
      fullDescription: nextFullDesc,
      aboutTheatre: nextAbout,
      tagline: nextTagline,
      defaultLocale: nextLocale,
      localizedFields: nextLocalizedFields,
      establishedYear: nextYear,
      theatreType: nextType,
      customTheatreType: nextCustomType,
      ownershipModel: nextOwnership,
      chainName: nextChainName,
      screensCount: nextScreens,
      totalSeatingCapacity: nextCapacity,
      averageCapacityPerScreen: computeAverageCapacity(nextScreens, nextCapacity),
      website: nextWebsite,
      businessEmailPlaceholder: nextEmail,
      businessPhonePlaceholder: nextPhone,
      version: nextVersion,
      updatedBy: actor.userId || "system",
      updatedAt: now,
    };

    updated = await this.recalculateCompletion(updated);
    await theatreProfileRepository.saveProfile(updated);

    await theatreProfileRepository.addVersion({
      id: `pver-${existing.id}-v${nextVersion}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      versionNumber: nextVersion,
      previousValues,
      nextValues,
      updatedFields: updatedFields.length > 0 ? updatedFields : ["metadata_sync"],
      changeSummary:
        sanitizePlainText(input.changeSummary, 500) ||
        `Updated profile fields: ${updatedFields.join(", ") || "metadata"}`,
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      eventType: "PROFILE_UPDATED",
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Updated profile v${nextVersion} (${updatedFields.join(", ") || "sync"})`,
      timestamp: now,
      metadata: { updatedFields, version: nextVersion },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_PROFILE",
      action: "UPDATE",
      description: `Updated TheatreProfile '${updated.displayName}' to v${nextVersion}`,
      metadata: { profileId: updated.id, updatedFields },
    });

    this.invalidateProfileCaches(
      updated.theatreId,
      updated.publicSlug,
      updated.internalTheatreSlug
    );
    if (existing.publicSlug !== updated.publicSlug) {
      invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_PROFILE(existing.publicSlug));
    }
    return updated;
  }

  /**
   * 3. STATUS TRANSITIONS (Publish / Hide / Archive)
   */
  async changeProfileStatus(
    theatreId: string,
    targetStatus: TheatreProfileStatus,
    reason: string | undefined,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, `STATUS_${targetStatus}`);
    const parsed = ProfileStatusTransitionSchema.safeParse({ theatreId, reason });
    if (!parsed.success) {
      throw new ValidationError("Invalid status transition request");
    }

    await tenantService.assertTenantAccess(actor, theatreId);
    const existing = await theatreProfileRepository.findByTheatreId(theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", theatreId, actor.correlationId);
    }

    if (targetStatus === "ARCHIVED" && actor.role !== "SUPER_ADMIN") {
      throw new AuthorizationError(
        "Only SUPER_ADMIN may archive a theatre profile.",
        actor.correlationId
      );
    }

    if (existing.status === targetStatus) {
      return existing;
    }

    const now = new Date().toISOString();
    const nextVersion = existing.version + 1;
    const cleanReason = sanitizePlainText(reason, 500);

    let updated: TheatreProfileRecord = {
      ...existing,
      status: targetStatus,
      version: nextVersion,
      publishedAt: targetStatus === "PUBLISHED" ? now : existing.publishedAt,
      publishedBy: targetStatus === "PUBLISHED" ? actor.userId || "system" : existing.publishedBy,
      archivedAt: targetStatus === "ARCHIVED" ? now : existing.archivedAt,
      archivedBy: targetStatus === "ARCHIVED" ? actor.userId || "system" : existing.archivedBy,
      updatedBy: actor.userId || "system",
      updatedAt: now,
    };

    updated = await this.recalculateCompletion(updated);
    await theatreProfileRepository.saveProfile(updated);

    await theatreProfileRepository.addVersion({
      id: `pver-${existing.id}-v${nextVersion}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      versionNumber: nextVersion,
      previousValues: { status: existing.status },
      nextValues: { status: targetStatus },
      updatedFields: ["status"],
      changeSummary:
        cleanReason || `Profile transitioned from ${existing.status} -> ${targetStatus}`,
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    const eventMap: Record<
      TheatreProfileStatus,
      "PROFILE_PUBLISHED" | "PROFILE_HIDDEN" | "PROFILE_ARCHIVED" | "PROFILE_UPDATED"
    > = {
      PUBLISHED: "PROFILE_PUBLISHED",
      HIDDEN: "PROFILE_HIDDEN",
      ARCHIVED: "PROFILE_ARCHIVED",
      DRAFT: "PROFILE_UPDATED",
    };

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      eventType: eventMap[targetStatus],
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Profile status changed from ${existing.status} to ${targetStatus}${cleanReason ? ` (${cleanReason})` : ""}`,
      timestamp: now,
      metadata: { from: existing.status, to: targetStatus, version: nextVersion },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_PROFILE",
      action: "UPDATE",
      description: `Profile '${updated.displayName}' status changed: ${existing.status} -> ${targetStatus}`,
      metadata: { profileId: updated.id, targetStatus, reason: cleanReason },
    });

    logger.info("AUDIT", "Profile status transitioned", {
      theatreId,
      metadata: {
        profileId: updated.id,
        fromStatus: existing.status,
        toStatus: targetStatus,
      },
    });

    this.invalidateProfileCaches(
      updated.theatreId,
      updated.publicSlug,
      updated.internalTheatreSlug
    );
    return updated;
  }

  /**
   * 4. UPDATE SUPPORTED LANGUAGES
   */
  async updateLanguages(
    rawInput: UpdateTheatreLanguagesInput,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, "UPDATE_LANGUAGES");
    const parsed = UpdateTheatreLanguagesSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || "Invalid theatre languages payload",
        formatZodIssues(parsed.error.issues),
        actor.correlationId
      );
    }

    const input = parsed.data;
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const existing = await theatreProfileRepository.findByTheatreId(input.theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", input.theatreId, actor.correlationId);
    }

    if (existing.status === "ARCHIVED") {
      throw new BusinessRuleError("Cannot update languages on an archived profile.", "PROFILE_ARCHIVED");
    }

    const now = new Date().toISOString();
    const nextVersion = existing.version + 1;
    const languages = buildLanguageRecords(existing.id, existing.theatreId, input.languages, now);
    const primary = languages.find((l) => l.isPrimary) || languages[0];

    let updated: TheatreProfileRecord = {
      ...existing,
      languages,
      primaryLanguageCode: primary.languageCode,
      version: nextVersion,
      updatedBy: actor.userId || "system",
      updatedAt: now,
    };

    updated = await this.recalculateCompletion(updated);
    await theatreProfileRepository.saveProfile(updated);

    await theatreProfileRepository.addVersion({
      id: `pver-${existing.id}-v${nextVersion}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      versionNumber: nextVersion,
      previousValues: {
        primaryLanguageCode: existing.primaryLanguageCode,
        languages: existing.languages.map((l) => `${l.displayName}(${l.languageCode})`),
      },
      nextValues: {
        primaryLanguageCode: primary.languageCode,
        languages: languages.map((l) => `${l.displayName}(${l.languageCode})`),
      },
      updatedFields: ["languages", "primaryLanguageCode"],
      changeSummary: sanitizePlainText(input.changeSummary, 500) || "Updated theatre languages",
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      eventType: "LANGUAGE_UPDATED",
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Updated ${languages.length} supported languages (primary: ${primary.displayName})`,
      timestamp: now,
      metadata: {
        primaryLanguageCode: primary.languageCode,
        languages: languages.map((l) => l.languageCode),
      },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_PROFILE",
      action: "UPDATE",
      description: `Updated languages for profile '${updated.displayName}'`,
      metadata: { profileId: updated.id, primaryLanguageCode: primary.languageCode },
    });

    this.invalidateProfileCaches(
      updated.theatreId,
      updated.publicSlug,
      updated.internalTheatreSlug
    );
    return updated;
  }

  /**
   * 5. UPDATE SOCIAL LINKS
   */
  async updateSocialLinks(
    rawInput: UpdateTheatreSocialLinksInput,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, "UPDATE_SOCIAL_LINKS");
    const parsed = UpdateTheatreSocialLinksSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues[0]?.message || "Invalid social links payload",
        formatZodIssues(parsed.error.issues),
        actor.correlationId
      );
    }

    const input = parsed.data;
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const existing = await theatreProfileRepository.findByTheatreId(input.theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", input.theatreId, actor.correlationId);
    }

    if (existing.status === "ARCHIVED") {
      throw new BusinessRuleError("Cannot update social links on an archived profile.", "PROFILE_ARCHIVED");
    }

    const now = new Date().toISOString();
    const nextVersion = existing.version + 1;
    const socialLinks = buildSocialLinkRecords(
      existing.id,
      existing.theatreId,
      input.socialLinks,
      now
    );

    let updated: TheatreProfileRecord = {
      ...existing,
      socialLinks,
      version: nextVersion,
      updatedBy: actor.userId || "system",
      updatedAt: now,
    };

    updated = await this.recalculateCompletion(updated);
    await theatreProfileRepository.saveProfile(updated);

    await theatreProfileRepository.addVersion({
      id: `pver-${existing.id}-v${nextVersion}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      versionNumber: nextVersion,
      previousValues: {
        socialLinks: existing.socialLinks.map((s) => `${s.platform}:${s.url}`),
      },
      nextValues: {
        socialLinks: socialLinks.map((s) => `${s.platform}:${s.url}`),
      },
      updatedFields: ["socialLinks"],
      changeSummary: sanitizePlainText(input.changeSummary, 500) || "Updated social presence links",
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      eventType: "SOCIAL_LINK_UPDATED",
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Updated ${socialLinks.length} validated social media links`,
      timestamp: now,
      metadata: { platforms: socialLinks.map((s) => s.platform) },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_PROFILE",
      action: "UPDATE",
      description: `Updated social links for profile '${updated.displayName}'`,
      metadata: { profileId: updated.id, count: socialLinks.length },
    });

    this.invalidateProfileCaches(
      updated.theatreId,
      updated.publicSlug,
      updated.internalTheatreSlug
    );
    return updated;
  }

  /**
   * 6. FUTURE ROLLBACK ARCHITECTURE HOOK (Non-destructive forward version restore)
   */
  async rollbackToVersion(
    theatreId: string,
    targetVersionNumber: number,
    reason: string | undefined,
    actor: SecurityActorContext
  ): Promise<TheatreProfileRecord> {
    this.assertEditorRole(actor, "ROLLBACK_PROFILE_VERSION");
    await tenantService.assertTenantAccess(actor, theatreId);

    const existing = await theatreProfileRepository.findByTheatreId(theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", theatreId, actor.correlationId);
    }

    const versions = await theatreProfileRepository.getVersionsByProfileId(existing.id);
    const target = versions.find((v) => v.versionNumber === targetVersionNumber);
    if (!target) {
      throw new NotFoundError("TheatreProfileVersion", `v${targetVersionNumber}`, actor.correlationId);
    }

    const prevSnapshot = target.previousValues;
    const now = new Date().toISOString();
    const nextVersion = existing.version + 1;

    let rolledBack: TheatreProfileRecord = {
      ...existing,
      ...(typeof prevSnapshot.theatreName === "string"
        ? { theatreName: prevSnapshot.theatreName }
        : {}),
      ...(typeof prevSnapshot.legalName === "string"
        ? { legalName: prevSnapshot.legalName }
        : {}),
      ...(typeof prevSnapshot.displayName === "string"
        ? { displayName: prevSnapshot.displayName }
        : {}),
      ...(typeof prevSnapshot.shortDescription === "string"
        ? { shortDescription: prevSnapshot.shortDescription }
        : {}),
      ...(typeof prevSnapshot.fullDescription === "string"
        ? { fullDescription: prevSnapshot.fullDescription }
        : {}),
      ...(typeof prevSnapshot.aboutTheatre === "string"
        ? { aboutTheatre: prevSnapshot.aboutTheatre }
        : {}),
      ...(typeof prevSnapshot.tagline === "string" ? { tagline: prevSnapshot.tagline } : {}),
      ...(typeof prevSnapshot.website === "string" ? { website: prevSnapshot.website } : {}),
      version: nextVersion,
      updatedBy: actor.userId || "system",
      updatedAt: now,
    };

    rolledBack = await this.recalculateCompletion(rolledBack);
    await theatreProfileRepository.saveProfile(rolledBack);

    const restorableKeys = Object.keys(prevSnapshot);
    await theatreProfileRepository.addVersion({
      id: `pver-${existing.id}-v${nextVersion}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      versionNumber: nextVersion,
      previousValues: { versionRestoredFrom: existing.version },
      nextValues: prevSnapshot,
      updatedFields: restorableKeys.length > 0 ? restorableKeys : ["rollback_restore"],
      changeSummary:
        sanitizePlainText(reason, 500) || `Rolled back snapshot pre-v${targetVersionNumber} as v${nextVersion}`,
      updatedBy: actor.userId || "system",
      updatedByRole: actor.role,
      updatedAt: now,
    });

    await theatreProfileRepository.addAudit({
      id: `paud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profileId: existing.id,
      theatreId: existing.theatreId,
      eventType: "PROFILE_VERSION_ROLLBACK",
      actorId: actor.userId || "system",
      actorName: actor.name,
      actorRole: actor.role,
      summary: `Restored profile values from version v${targetVersionNumber} into forward v${nextVersion}`,
      timestamp: now,
      metadata: { targetVersionNumber, newVersion: nextVersion },
    });

    this.invalidateProfileCaches(
      rolledBack.theatreId,
      rolledBack.publicSlug,
      rolledBack.internalTheatreSlug
    );
    return rolledBack;
  }

  /**
   * 7. RETRIEVE / SEARCH / FILTER / PAGINATE (Tenant-Scoped)
   */
  async retrieveProfiles(
    rawFilters: SearchTheatreProfileFilters,
    actor: SecurityActorContext
  ): Promise<PaginatedTheatreProfileResult> {
    this.assertEditorRole(actor, "RETRIEVE_PROFILES");
    const parsed = RetrieveTheatreProfileSchema.safeParse(rawFilters);
    if (!parsed.success) {
      throw new ValidationError("Invalid profile search filters");
    }

    const filters = parsed.data;
    let scopedTenantId: string | undefined;

    if (actor.role === "THEATRE_ADMIN") {
      if (!actor.theatreId) {
        throw new AuthorizationError("Theatre Admin requires assigned theatreId.");
      }
      if (filters.theatreId && filters.theatreId !== actor.theatreId) {
        await tenantService.assertTenantAccess(actor, filters.theatreId);
      }
      scopedTenantId = actor.theatreId;
    }

    return theatreProfileRepository.searchAndPaginate(filters, scopedTenantId);
  }

  /**
   * 8. GET PROFILE BUNDLE (Profile + Live Logo/Banner Preview + Version History + Audits)
   */
  async getProfileBundle(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<TheatreProfileBundle> {
    this.assertEditorRole(actor, "GET_PROFILE_DETAIL");
    await tenantService.assertTenantAccess(actor, theatreId);

    const existing = await theatreProfileRepository.findByTheatreId(theatreId);
    if (!existing) {
      throw new NotFoundError("TheatreProfile", theatreId, actor.correlationId);
    }

    const refreshed = await this.recalculateCompletion(existing);
    if (refreshed.completionScore !== existing.completionScore) {
      await theatreProfileRepository.saveProfile(refreshed);
    }

    const [brandingPreview, versions, recentAudits] = await Promise.all([
      this.resolveBrandingPreview(theatreId),
      theatreProfileRepository.getVersionsByProfileId(refreshed.id),
      theatreProfileRepository.getAuditsByTheatreId(theatreId, 30),
    ]);

    return {
      profile: refreshed,
      brandingPreview,
      versions,
      recentAudits,
    };
  }

  /**
   * 9. PUBLIC PROFILE VIEW (Combines Profile Info + Active Branding Logo/Banner)
   */
  async getPublicTheatreProfile(theatreIdOrSlug: string): Promise<PublicTheatreProfileView | null> {
    const cleanKey = sanitizePlainText(theatreIdOrSlug, 160);
    if (!cleanKey) return null;

    return withQueryCache(
      `public-theatre-profile:${cleanKey}`,
      async () => {
        const profile =
          (await theatreProfileRepository.findByTheatreId(cleanKey)) ||
          (await theatreProfileRepository.findByPublicSlug(cleanKey));

        if (!profile || profile.status !== "PUBLISHED") {
          return null;
        }

        const branding = await this.resolveBrandingPreview(profile.theatreId);

        return {
          profileId: profile.id,
          theatreId: profile.theatreId,
          publicSlug: profile.publicSlug,
          internalTheatreSlug: profile.internalTheatreSlug,
          theatreName: profile.theatreName,
          displayName: profile.displayName,
          tagline: profile.tagline,
          shortDescription: profile.shortDescription,
          fullDescription: profile.fullDescription,
          aboutTheatre: profile.aboutTheatre,
          theatreType: profile.theatreType,
          customTheatreType: profile.customTheatreType,
          ownershipModel: profile.ownershipModel,
          chainName: profile.chainName,
          establishedYear: profile.establishedYear,
          screensCount: profile.screensCount,
          totalSeatingCapacity: profile.totalSeatingCapacity,
          averageCapacityPerScreen: profile.averageCapacityPerScreen,
          primaryLanguageCode: profile.primaryLanguageCode,
          languages: profile.languages,
          website: profile.website,
          socialLinks: profile.socialLinks.filter((s) => s.isActive),
          branding,
          localizedFields: profile.localizedFields,
          defaultLocale: profile.defaultLocale,
          completionScore: profile.completionScore,
        };
      },
      {
        ttlSeconds: 60,
        tags: [CACHE_TAGS.PUBLIC_THEATRE_PROFILE(cleanKey)],
      }
    );
  }
}

export const theatreProfileService = new TheatreProfileService();

