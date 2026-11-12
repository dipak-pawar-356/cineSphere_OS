/**
 * ==============================================================================
 * CineSphere OS — Theatre Branding & Media Domain Service (Phase 3 – Part 2)
 * ==============================================================================
 * Pure DDD Domain Service encapsulating Digital Asset Management (DAM):
 * upload validation, single-active brand slots, unlimited ordered gallery,
 * immutable asset versioning & restore, reusable media references, tenant
 * isolation, security sanitization, audit trails & prepared cache invalidation.
 * ==============================================================================
 */

import {
  MediaUploadValidationResult,
  PaginatedTheatreMediaResult,
  ReorderGalleryInput,
  ReplaceTheatreMediaInput,
  SINGLE_ACTIVE_MEDIA_TYPES,
  TheatreMediaAsset,
  TheatreMediaCollectionBundle,
  TheatreMediaReferenceRecord,
  TheatreMediaSearchFilters,
  TheatreMediaType,
  TheatreMediaVersionRecord,
  TheatrePublicMediaView,
  UpdateMediaMetadataInput,
  UploadTheatreMediaInput,
} from "@/types/theatre-media.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import {
  computeAspectRatioLabel,
  computeMediaChecksum,
  theatreMediaRepository,
} from "@/lib/repositories/theatre-media.repository";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { tenantService } from "./tenant.service";
import { securityAuditService } from "./security-audit.service";
import {
  MEDIA_TYPE_POLICIES,
  UpdateMediaMetadataSchema,
  UploadTheatreMediaSchema,
} from "@/lib/validation/theatre-media.validation";
import { sanitizeString, sanitizeUrl, stripHtml } from "@/lib/security/input-sanitizer";
import {
  AuthorizationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors/app-error";
import {
  CACHE_TAGS,
  invalidateCacheByTag,
  withQueryCache,
} from "@/lib/performance/cache-strategy";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("TheatreMediaService");

const DISALLOWED_VIDEO_EXTENSIONS = /\.(mp4|mov|avi|mkv|webm|flv|m4v)(\?|$)/i;
const DISALLOWED_CORRUPT_MARKERS = ["CORRUPT", "MALFORMED", "EMPTY_BYTES", "INVALID_MAGIC"];

export class TheatreMediaService {
  private assertMediaEditorRole(actor: SecurityActorContext, action: string): void {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        `Permission Denied: Role '${actor.role}' cannot execute '${action}' on theatre media.`,
        actor.correlationId
      );
    }
  }

  private getSlotKey(mediaType: TheatreMediaType): string {
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

  private invalidateMediaCaches(theatreId: string, theatreSlug?: string): void {
    invalidateCacheByTag(CACHE_TAGS.THEATRE_MEDIA(theatreId));
    invalidateCacheByTag(CACHE_TAGS.THEATRE(theatreId));
    if (theatreSlug) {
      invalidateCacheByTag(CACHE_TAGS.PUBLIC_THEATRE_MEDIA(theatreSlug));
    }
  }

  /**
   * 1. VALIDATE UPLOAD (Pre-flight + Server Security Verification)
   * Never trusts client-side file metadata without checking URLs, MIME policy,
   * dimensions, byte bounds, corrupted signatures, and checksum duplicates.
   */
  async validateUpload(
    rawInput: UploadTheatreMediaInput,
    actor: SecurityActorContext,
    options?: { excludeMediaId?: string }
  ): Promise<MediaUploadValidationResult> {
    this.assertMediaEditorRole(actor, "VALIDATE_MEDIA_UPLOAD");
    await tenantService.assertTenantAccess(actor, rawInput.theatreId);

    const errors: string[] = [];
    const warnings: string[] = [];

    const parsed = UploadTheatreMediaSchema.safeParse(rawInput);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${issue.path.join(".") || "input"}: ${issue.message}`);
      }
      return { valid: false, errors, warnings };
    }

    const input = parsed.data;
    const mimeLower = input.mimeType.trim().toLowerCase();

    // Strictly block raw video uploads (Future Video Gallery is architecture placeholder only)
    if (mimeLower.startsWith("video/") || DISALLOWED_VIDEO_EXTENSIONS.test(input.url)) {
      errors.push(
        "Unsupported Format: Direct video uploads are disabled in Phase 3 Part 2. Video gallery integration is reserved as an architecture placeholder."
      );
      return { valid: false, errors, warnings };
    }

    // Sanitize and verify URL protocol (blocks javascript:, data:, vbscript:, CRLF)
    const safeUrl = sanitizeUrl(input.url);
    if (!safeUrl || safeUrl.startsWith("data:")) {
      errors.push("Invalid File URL: Only secure HTTPS or relative local placeholder paths are allowed.");
    }

    // Simulated Corrupted File Signature Detection Placeholder
    const sigUpper = (input.rawSignatureCheck || "").toUpperCase();
    if (
      input.fileSizeBytes < 128 ||
      DISALLOWED_CORRUPT_MARKERS.some((marker) => sigUpper.includes(marker))
    ) {
      errors.push(
        "Corrupted File Detected: Media signature header check failed or file appears truncated (< 128 bytes)."
      );
    }

    // Enforce per-MediaType policy
    const policy = MEDIA_TYPE_POLICIES[input.mediaType];
    if (!policy.allowedMimeTypes.includes(mimeLower)) {
      errors.push(
        `Unsupported Format '${input.mimeType}' for ${input.mediaType}. Allowed: ${policy.allowedMimeTypes.join(", ")}.`
      );
    }

    if (input.fileSizeBytes > policy.maxSizeBytes) {
      const maxMb = (policy.maxSizeBytes / (1024 * 1024)).toFixed(1);
      errors.push(
        `Oversized File: ${(input.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB exceeds maximum ${maxMb} MB ceiling for ${input.mediaType}.`
      );
    }

    if (input.width < policy.minWidth || input.height < policy.minHeight) {
      errors.push(
        `Invalid Dimensions: ${input.width}x${input.height}px is below minimum ${policy.minWidth}x${policy.minHeight}px required for ${input.mediaType}.`
      );
    }

    if (input.width > policy.maxWidth || input.height > policy.maxHeight) {
      errors.push(
        `Dimensions Exceeded: ${input.width}x${input.height}px exceeds max ${policy.maxWidth}x${policy.maxHeight}px.`
      );
    }

    // Aspect Ratio Placeholder evaluation
    const numericRatio = input.height > 0 ? input.width / input.height : 0;
    const computedAspectRatio = computeAspectRatioLabel(input.width, input.height);
    if (numericRatio < policy.minAspectRatio || numericRatio > policy.maxAspectRatio) {
      warnings.push(
        `Aspect Ratio Notice: ${computedAspectRatio} differs from recommended ${policy.recommendedAspectRatio} for ${input.mediaType}; crop adjustment recommended.`
      );
    }

    // Check Tenant Storage Quota
    const col = await theatreMediaRepository.ensureCollection(input.theatreId);
    if (!col) {
      errors.push(`Theatre '${input.theatreId}' does not exist.`);
      return { valid: false, errors, warnings };
    }
    if (col.usedStorageBytes + input.fileSizeBytes > col.storageQuotaBytes) {
      errors.push("Storage Quota Exceeded: Insufficient tenant vault quota remaining.");
    }

    // Compute authoritative server-side SHA-256 checksum & Duplicate Detection
    const computedChecksum = computeMediaChecksum({
      url: safeUrl || input.url,
      mimeType: mimeLower,
      width: input.width,
      height: input.height,
      fileSizeBytes: input.fileSizeBytes,
    });

    const duplicate = await theatreMediaRepository.findDuplicateByChecksum(
      input.theatreId,
      computedChecksum,
      options?.excludeMediaId
    );
    if (duplicate) {
      errors.push(
        `Duplicate Upload Detected: Identical asset already exists in this theatre's collection ('${duplicate.title}', ID: ${duplicate.id}).`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      computedChecksum,
      computedAspectRatio,
      duplicateDetected: Boolean(duplicate),
      duplicateAssetId: duplicate?.id,
    };
  }

  /**
   * 2. UPLOAD MEDIA
   * Creates a new TheatreMedia record inside TheatreMediaCollection, enforces
   * single-active rules for brand slots, auto-orders gallery assets, and audits.
   */
  async uploadMedia(
    input: UploadTheatreMediaInput,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset> {
    this.assertMediaEditorRole(actor, "UPLOAD_MEDIA");
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const validation = await this.validateUpload(input, actor);
    if (!validation.valid) {
      if (validation.duplicateDetected) {
        throw new BusinessRuleError(validation.errors[0], "DUPLICATE_MEDIA", actor.correlationId);
      }
      throw new ValidationError(
        validation.errors[0] || "Invalid media upload payload",
        { upload: validation.errors },
        actor.correlationId
      );
    }

    const col = await theatreMediaRepository.ensureCollection(input.theatreId);
    const theatre = await theatreLifecycleRepository.findById(input.theatreId);
    if (!col || !theatre) {
      throw new NotFoundError("Theatre", input.theatreId, actor.correlationId);
    }

    const cleanTitle = stripHtml(sanitizeString(input.title, 200));
    const cleanAlt = stripHtml(sanitizeString(input.altText, 300));
    const cleanCaption = input.caption ? stripHtml(sanitizeString(input.caption, 1000)) : undefined;
    const cleanUrl = sanitizeUrl(input.url);
    const cleanMime = input.mimeType.trim().toLowerCase();
    const dominantColor = input.dominantColor || "#070B12";

    // Determine next gallery order
    const existingItems = await theatreMediaRepository.findByTheatre(input.theatreId, false);
    const galleryOrders = existingItems
      .filter((i) => i.mediaType === "GALLERY_IMAGE")
      .map((i) => i.displayOrder);
    const nextOrder =
      input.mediaType === "GALLERY_IMAGE"
        ? (galleryOrders.length ? Math.max(...galleryOrders) : 0) + 1
        : 1;

    // Future placeholders default cleanly to DRAFT unless explicitly set
    const resolvedStatus =
      input.mediaType === "FUTURE_VIDEO_PLACEHOLDER" ||
      input.mediaType === "FUTURE_PANORAMA_PLACEHOLDER"
        ? "DRAFT"
        : input.status || "ACTIVE";

    const mediaId = `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const checksum = validation.computedChecksum!;
    const aspectRatio = validation.computedAspectRatio!;

    const initialVersion: TheatreMediaVersionRecord = {
      id: `ver-${mediaId}-v1`,
      mediaId,
      versionNumber: 1,
      url: cleanUrl,
      checksum,
      mimeType: cleanMime,
      fileSizeBytes: input.fileSizeBytes,
      width: input.width,
      height: input.height,
      dominantColor,
      altText: cleanAlt,
      caption: cleanCaption,
      changeReason: "Initial upload",
      replacedBy: actor.userId,
      createdAt: now,
    };

    const refRecord: TheatreMediaReferenceRecord = {
      id: `ref-${mediaId}`,
      theatreId: input.theatreId,
      mediaId,
      targetEntityType: "THEATRE",
      targetEntityId: input.theatreId,
      slotKey: this.getSlotKey(input.mediaType),
      isActive: resolvedStatus === "ACTIVE",
      createdAt: now,
    };

    const created = await theatreMediaRepository.create({
      id: mediaId,
      collectionId: col.id,
      theatreId: input.theatreId,
      theatreName: theatre.name,
      theatreSlug: theatre.slug,
      mediaType: input.mediaType,
      futureVideoSubtype: input.futureVideoSubtype,
      title: cleanTitle,
      slug:
        cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || mediaId,
      url: cleanUrl,
      status: resolvedStatus,
      displayOrder: nextOrder,
      displayPriority: input.displayPriority ?? 100,
      currentVersion: 1,
      isPrimary: SINGLE_ACTIVE_MEDIA_TYPES.includes(input.mediaType) && resolvedStatus === "ACTIVE",
      uploadedBy: actor.userId,
      uploadedByName: actor.name || actor.role,
      createdAt: now,
      updatedAt: now,
      metadata: {
        altText: cleanAlt,
        caption: cleanCaption,
        mimeType: cleanMime,
        fileSizeBytes: input.fileSizeBytes,
        width: input.width,
        height: input.height,
        aspectRatio,
        checksum,
        uploadSource: input.uploadSource || "URL_REFERENCE",
        dominantColor,
        cropPlaceholder: input.cropPlaceholder || {
          x: 0,
          y: 0,
          width: input.width,
          height: input.height,
          unit: "px",
          aspectLock: aspectRatio,
        },
        compressionPlaceholder: {
          compressionReady: true,
          targetFormats: ["webp", "avif", "jpeg"],
          responsiveWidths: [320, 640, 1280, 1920],
          thumbnailSpec: { width: 400, height: 300 },
          cdnUrlPatternPlaceholder: `/cdn-placeholder/${theatre.slug}/${mediaId}/{width}.{format}`,
        },
        corruptedCheckStatus: "PASSED",
        duplicateCheckHash: checksum,
      },
      versions: [initialVersion],
      references: [refRecord],
    });

    theatreMediaRepository.recordAudit({
      theatreId: input.theatreId,
      mediaId: created.id,
      action: "MEDIA_UPLOADED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Uploaded ${created.mediaType} '${created.title}' (${created.metadata.width}x${created.metadata.height}px)`,
      timestamp: now,
      metadata: {
        mediaType: created.mediaType,
        checksum,
        version: 1,
      },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MEDIA",
      action: "CREATE",
      description: `Uploaded ${created.mediaType} '${created.title}' to theatre '${theatre.name}'`,
      metadata: { theatreId: input.theatreId, mediaId: created.id, mediaType: created.mediaType },
    });

    this.invalidateMediaCaches(input.theatreId, theatre.slug);
    return created;
  }

  /**
   * 3. REPLACE MEDIA (with Immutable Version History)
   * Preserves previous image snapshot in TheatreMediaVersion so admins can inspect
   * or restore earlier versions at any time.
   */
  async replaceMedia(
    input: ReplaceTheatreMediaInput,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset> {
    this.assertMediaEditorRole(actor, "REPLACE_MEDIA");
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const existing = await theatreMediaRepository.findById(input.mediaId);
    if (!existing || existing.theatreId !== input.theatreId) {
      throw new NotFoundError("TheatreMedia", input.mediaId, actor.correlationId);
    }

    if (existing.status === "DELETED") {
      throw new BusinessRuleError("Cannot replace a deleted media asset.", "MEDIA_DELETED", actor.correlationId);
    }

    if (input.expectedVersion && existing.currentVersion !== input.expectedVersion) {
      throw new ConflictError(
        `Version Conflict: Media '${existing.title}' is at v${existing.currentVersion}, expected v${input.expectedVersion}.`,
        {
          entity: "TheatreMedia",
          currentVersion: existing.currentVersion,
          expectedVersion: input.expectedVersion,
          correlationId: actor.correlationId,
        }
      );
    }

    const validation = await this.validateUpload(
      {
        theatreId: input.theatreId,
        mediaType: existing.mediaType,
        title: input.title || existing.title,
        url: input.url,
        altText: input.altText,
        caption: input.caption,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        width: input.width,
        height: input.height,
        dominantColor: input.dominantColor,
        cropPlaceholder: input.cropPlaceholder,
        rawSignatureCheck: input.rawSignatureCheck,
      },
      actor,
      { excludeMediaId: existing.id }
    );

    if (!validation.valid) {
      if (validation.duplicateDetected) {
        throw new BusinessRuleError(validation.errors[0], "DUPLICATE_MEDIA", actor.correlationId);
      }
      throw new ValidationError(
        validation.errors[0] || "Invalid replacement media payload",
        { replace: validation.errors },
        actor.correlationId
      );
    }

    const now = new Date().toISOString();
    const nextVersion = existing.currentVersion + 1;
    const cleanUrl = sanitizeUrl(input.url);
    const cleanTitle = input.title ? stripHtml(sanitizeString(input.title, 200)) : existing.title;
    const cleanAlt = stripHtml(sanitizeString(input.altText, 300));
    const cleanCaption =
      input.caption !== undefined ? stripHtml(sanitizeString(input.caption, 1000)) : existing.metadata.caption;
    const dominantColor = input.dominantColor || existing.metadata.dominantColor;
    const checksum = validation.computedChecksum!;
    const aspectRatio = validation.computedAspectRatio!;

    const newVersionRecord: TheatreMediaVersionRecord = {
      id: `ver-${existing.id}-v${nextVersion}`,
      mediaId: existing.id,
      versionNumber: nextVersion,
      url: cleanUrl,
      checksum,
      mimeType: input.mimeType.trim().toLowerCase(),
      fileSizeBytes: input.fileSizeBytes,
      width: input.width,
      height: input.height,
      dominantColor,
      altText: cleanAlt,
      caption: cleanCaption,
      changeReason: sanitizeString(input.changeReason || "Replaced asset file", 500),
      replacedBy: actor.userId,
      createdAt: now,
    };

    const updated = (await theatreMediaRepository.update(existing.id, {
      title: cleanTitle,
      url: cleanUrl,
      currentVersion: nextVersion,
      metadata: {
        ...existing.metadata,
        altText: cleanAlt,
        caption: cleanCaption,
        mimeType: input.mimeType.trim().toLowerCase(),
        fileSizeBytes: input.fileSizeBytes,
        width: input.width,
        height: input.height,
        aspectRatio,
        checksum,
        dominantColor,
        duplicateCheckHash: checksum,
        cropPlaceholder: input.cropPlaceholder || existing.metadata.cropPlaceholder,
      },
      versions: [newVersionRecord, ...existing.versions],
    }))!;

    theatreMediaRepository.recordAudit({
      theatreId: input.theatreId,
      mediaId: updated.id,
      action: "MEDIA_REPLACED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Replaced ${updated.mediaType} '${updated.title}' (v${existing.currentVersion} -> v${nextVersion})`,
      reason: newVersionRecord.changeReason,
      timestamp: now,
      metadata: {
        previousVersion: existing.currentVersion,
        nextVersion,
        checksum,
      },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MEDIA",
      action: "UPDATE",
      description: `Replaced media '${updated.title}' to v${nextVersion}`,
      metadata: { theatreId: input.theatreId, mediaId: updated.id, nextVersion },
    });

    this.invalidateMediaCaches(input.theatreId, updated.theatreSlug);
    return updated;
  }

  /**
   * 4. RESTORE PREVIOUS MEDIA VERSION
   * Append-only rollback: promotes chosen historical version to a fresh currentVersion.
   */
  async restoreMediaVersion(
    theatreId: string,
    mediaId: string,
    versionNumber: number,
    reason: string | undefined,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset> {
    this.assertMediaEditorRole(actor, "RESTORE_MEDIA_VERSION");
    await tenantService.assertTenantAccess(actor, theatreId);

    const existing = await theatreMediaRepository.findById(mediaId);
    if (!existing || existing.theatreId !== theatreId) {
      throw new NotFoundError("TheatreMedia", mediaId, actor.correlationId);
    }
    if (existing.status === "DELETED") {
      throw new BusinessRuleError("Cannot restore versions on a deleted asset.", "MEDIA_DELETED", actor.correlationId);
    }

    const targetVer = existing.versions.find((v) => v.versionNumber === versionNumber);
    if (!targetVer) {
      throw new NotFoundError("TheatreMediaVersion", `${mediaId}@v${versionNumber}`, actor.correlationId);
    }

    const now = new Date().toISOString();
    const nextVersion = existing.currentVersion + 1;
    const restoreReason = sanitizeString(reason || `Restored historical version v${versionNumber}`, 500);

    const restoredVersionRecord: TheatreMediaVersionRecord = {
      id: `ver-${existing.id}-v${nextVersion}`,
      mediaId: existing.id,
      versionNumber: nextVersion,
      url: targetVer.url,
      checksum: targetVer.checksum,
      mimeType: targetVer.mimeType,
      fileSizeBytes: targetVer.fileSizeBytes,
      width: targetVer.width,
      height: targetVer.height,
      dominantColor: targetVer.dominantColor,
      altText: targetVer.altText,
      caption: targetVer.caption,
      changeReason: restoreReason,
      replacedBy: actor.userId,
      createdAt: now,
    };

    const updated = (await theatreMediaRepository.update(existing.id, {
      url: targetVer.url,
      currentVersion: nextVersion,
      metadata: {
        ...existing.metadata,
        altText: targetVer.altText,
        caption: targetVer.caption,
        mimeType: targetVer.mimeType,
        fileSizeBytes: targetVer.fileSizeBytes,
        width: targetVer.width,
        height: targetVer.height,
        aspectRatio: computeAspectRatioLabel(targetVer.width, targetVer.height),
        checksum: targetVer.checksum,
        dominantColor: targetVer.dominantColor,
      },
      versions: [restoredVersionRecord, ...existing.versions],
    }))!;

    theatreMediaRepository.recordAudit({
      theatreId,
      mediaId: updated.id,
      action: "MEDIA_VERSION_RESTORED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Restored '${updated.title}' from v${versionNumber} as new v${nextVersion}`,
      reason: restoreReason,
      timestamp: now,
      metadata: { restoredFromVersion: versionNumber, nextVersion },
    });

    this.invalidateMediaCaches(theatreId, updated.theatreSlug);
    return updated;
  }

  /**
   * 5. UPDATE METADATA & LIFECYCLE STATUS (Draft, Active, Hidden, Archived)
   */
  async updateMetadata(
    rawInput: UpdateMediaMetadataInput,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset> {
    this.assertMediaEditorRole(actor, "UPDATE_MEDIA_METADATA");
    await tenantService.assertTenantAccess(actor, rawInput.theatreId);

    const parsed = UpdateMediaMetadataSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new ValidationError("Invalid metadata update payload", undefined, actor.correlationId);
    }
    const input = parsed.data;

    const existing = await theatreMediaRepository.findById(input.mediaId);
    if (!existing || existing.theatreId !== input.theatreId) {
      throw new NotFoundError("TheatreMedia", input.mediaId, actor.correlationId);
    }

    if (existing.status === "DELETED") {
      throw new BusinessRuleError("Cannot modify metadata of a deleted asset.", "MEDIA_DELETED", actor.correlationId);
    }

    const nextStatus = input.status || existing.status;
    const nextRefs = existing.references.map((r) => ({
      ...r,
      isActive: nextStatus === "ACTIVE",
    }));

    const updated = (await theatreMediaRepository.update(existing.id, {
      title: input.title ? stripHtml(sanitizeString(input.title, 200)) : existing.title,
      status: nextStatus,
      isPrimary: SINGLE_ACTIVE_MEDIA_TYPES.includes(existing.mediaType) && nextStatus === "ACTIVE",
      displayPriority: input.displayPriority ?? existing.displayPriority,
      references: nextRefs,
      metadata: {
        ...existing.metadata,
        altText: input.altText ? stripHtml(sanitizeString(input.altText, 300)) : existing.metadata.altText,
        caption:
          input.caption !== undefined
            ? stripHtml(sanitizeString(input.caption, 1000))
            : existing.metadata.caption,
        dominantColor: input.dominantColor || existing.metadata.dominantColor,
        cropPlaceholder: input.cropPlaceholder || existing.metadata.cropPlaceholder,
      },
    }))!;

    theatreMediaRepository.recordAudit({
      theatreId: input.theatreId,
      mediaId: updated.id,
      action: "METADATA_UPDATED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Updated metadata/status (${updated.status}) for '${updated.title}'`,
      timestamp: updated.updatedAt,
      metadata: { status: updated.status, displayPriority: updated.displayPriority },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MEDIA",
      action: "UPDATE",
      description: `Updated metadata for '${updated.title}' (status=${updated.status})`,
      metadata: { theatreId: input.theatreId, mediaId: updated.id },
    });

    this.invalidateMediaCaches(input.theatreId, updated.theatreSlug);
    return updated;
  }

  /**
   * 6. REORDER GALLERY (Drag & Drop, Manual, or Auto-Normalization)
   */
  async reorderGallery(
    input: ReorderGalleryInput,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset[]> {
    this.assertMediaEditorRole(actor, "REORDER_GALLERY");
    await tenantService.assertTenantAccess(actor, input.theatreId);

    const theatreItems = await theatreMediaRepository.findByTheatre(input.theatreId, false);
    const galleryMap = new Map<string, TheatreMediaAsset>();
    theatreItems
      .filter((i) => i.mediaType === "GALLERY_IMAGE")
      .forEach((i) => galleryMap.set(i.id, i));

    for (const reqId of input.orderedMediaIds) {
      if (!galleryMap.has(reqId)) {
        throw new BusinessRuleError(
          `Gallery item '${reqId}' does not belong to theatre '${input.theatreId}' or is deleted.`,
          "INVALID_GALLERY_REORDER",
          actor.correlationId
        );
      }
    }

    // Preserve any unreferenced gallery items after the explicitly ordered IDs
    const seen = new Set<string>(input.orderedMediaIds);
    const remainingIds = Array.from(galleryMap.keys()).filter((id) => !seen.has(id));
    const finalOrderIds = [...input.orderedMediaIds, ...remainingIds];

    const updatedGallery: TheatreMediaAsset[] = [];
    for (let idx = 0; idx < finalOrderIds.length; idx++) {
      const id = finalOrderIds[idx];
      const updated = await theatreMediaRepository.update(id, {
        displayOrder: idx + 1,
        displayPriority: 1000 - idx,
      });
      if (updated) updatedGallery.push(updated);
    }

    const now = new Date().toISOString();
    theatreMediaRepository.recordAudit({
      theatreId: input.theatreId,
      action: "GALLERY_REORDERED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Reordered ${finalOrderIds.length} gallery images (${input.mode || "MANUAL"})`,
      timestamp: now,
      metadata: { orderedMediaIds: finalOrderIds, mode: input.mode || "MANUAL" },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MEDIA",
      action: "UPDATE",
      description: `Reordered ${finalOrderIds.length} gallery assets for theatre '${input.theatreId}'`,
      metadata: { theatreId: input.theatreId },
    });

    const slug = updatedGallery[0]?.theatreSlug;
    this.invalidateMediaCaches(input.theatreId, slug);
    return updatedGallery;
  }

  /**
   * 7. SOFT DELETE MEDIA
   * Transitions status -> DELETED, preserves audit & version trail, cleans up
   * single-slot active pointer & re-normalizes remaining gallery displayOrder.
   */
  async deleteMedia(
    theatreId: string,
    mediaId: string,
    reason: string | undefined,
    actor: SecurityActorContext
  ): Promise<TheatreMediaAsset> {
    this.assertMediaEditorRole(actor, "DELETE_MEDIA");
    await tenantService.assertTenantAccess(actor, theatreId);

    const existing = await theatreMediaRepository.findById(mediaId);
    if (!existing || existing.theatreId !== theatreId) {
      throw new NotFoundError("TheatreMedia", mediaId, actor.correlationId);
    }

    if (existing.status === "DELETED") {
      throw new BusinessRuleError("Media asset is already deleted.", "ALREADY_DELETED", actor.correlationId);
    }

    const now = new Date().toISOString();
    const deleteReason = sanitizeString(reason || "Removed by authorized theatre operator", 500);

    const deleted = (await theatreMediaRepository.update(existing.id, {
      status: "DELETED",
      isPrimary: false,
      deletedBy: actor.userId,
      deletedAt: now,
      references: existing.references.map((r) => ({ ...r, isActive: false })),
    }))!;

    // Re-normalize remaining gallery displayOrder contiguously if gallery asset deleted
    if (existing.mediaType === "GALLERY_IMAGE") {
      const remaining = (await theatreMediaRepository.findByTheatre(theatreId, false)).filter(
        (i) => i.mediaType === "GALLERY_IMAGE"
      );
      for (let idx = 0; idx < remaining.length; idx++) {
        await theatreMediaRepository.update(remaining[idx].id, {
          displayOrder: idx + 1,
        });
      }
    }

    theatreMediaRepository.recordAudit({
      theatreId,
      mediaId: deleted.id,
      action: "MEDIA_DELETED",
      actorId: actor.userId,
      actorRole: actor.role,
      summary: `Soft deleted ${deleted.mediaType} '${deleted.title}'`,
      reason: deleteReason,
      timestamp: now,
      metadata: { mediaType: deleted.mediaType },
    });

    await securityAuditService.recordAudit({
      actor,
      module: "THEATRE_MEDIA",
      action: "DELETE",
      description: `Soft deleted ${deleted.mediaType} '${deleted.title}' (${deleted.id})`,
      metadata: { theatreId, mediaId: deleted.id, reason: deleteReason },
    });

    logger.info("AUDIT", `Media '${deleted.title}' soft-deleted by ${actor.userId}`, {
      theatreId,
      userId: actor.userId,
      metadata: { mediaId: deleted.id },
    });

    this.invalidateMediaCaches(theatreId, deleted.theatreSlug);
    return deleted;
  }

  /**
   * 8. RETRIEVE / SEARCH / FILTER MEDIA WITH STRICT TENANT ISOLATION
   */
  async retrieveMedia(
    filters: TheatreMediaSearchFilters,
    actor: SecurityActorContext
  ): Promise<PaginatedTheatreMediaResult> {
    if (actor.role !== "SUPER_ADMIN" && actor.role !== "THEATRE_ADMIN") {
      throw new AuthorizationError(
        "Permission Denied: Only Super Admin or Theatre Admin can query the DAM media vault.",
        actor.correlationId
      );
    }

    if (actor.role === "THEATRE_ADMIN" && filters.theatreId) {
      await tenantService.assertTenantAccess(actor, filters.theatreId);
    }

    const scopedTenantId =
      actor.role === "SUPER_ADMIN" ? undefined : actor.theatreId || "__UNASSIGNED_TENANT__";

    return theatreMediaRepository.searchAndPaginate(filters, scopedTenantId);
  }

  /**
   * 9. GET CENTRALIZED THEATRE BRANDING & MEDIA COLLECTION BUNDLE
   */
  async getTheatreBrandingCollection(
    theatreId: string,
    actor: SecurityActorContext
  ): Promise<TheatreMediaCollectionBundle> {
    this.assertMediaEditorRole(actor, "VIEW_THEATRE_MEDIA_COLLECTION");
    await tenantService.assertTenantAccess(actor, theatreId);

    const collection = await theatreMediaRepository.ensureCollection(theatreId);
    if (!collection) {
      throw new NotFoundError("TheatreMediaCollection", theatreId, actor.correlationId);
    }

    const items = await theatreMediaRepository.findByTheatre(theatreId, false);
    const byId = new Map(items.map((i) => [i.id, i]));

    const findActiveByType = (t: TheatreMediaType) =>
      items.find((i) => i.mediaType === t && i.status === "ACTIVE");

    const brandingSlots = {
      logo:
        (collection.activeLogoMediaId && byId.get(collection.activeLogoMediaId)) ||
        findActiveByType("LOGO"),
      banner:
        (collection.activeBannerMediaId && byId.get(collection.activeBannerMediaId)) ||
        findActiveByType("BANNER"),
      coverImage:
        (collection.activeCoverMediaId && byId.get(collection.activeCoverMediaId)) ||
        findActiveByType("COVER_IMAGE"),
      heroImage:
        (collection.activeHeroMediaId && byId.get(collection.activeHeroMediaId)) ||
        findActiveByType("HERO_IMAGE"),
      thumbnail:
        (collection.activeThumbnailMediaId && byId.get(collection.activeThumbnailMediaId)) ||
        findActiveByType("THUMBNAIL"),
    };

    const galleryImages = items
      .filter((i) => i.mediaType === "GALLERY_IMAGE")
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const futurePlaceholders = items.filter(
      (i) =>
        i.mediaType === "FUTURE_VIDEO_PLACEHOLDER" ||
        i.mediaType === "FUTURE_PANORAMA_PLACEHOLDER"
    );

    const allWithDeleted = await theatreMediaRepository.findByTheatre(theatreId, true);
    const summary = theatreMediaRepository.computeSummaryForPool(
      allWithDeleted,
      collection.storageQuotaBytes
    );

    return {
      collection,
      brandingSlots,
      galleryImages,
      futurePlaceholders,
      allAssets: items,
      summary,
      recentAudits: theatreMediaRepository.getAudits(theatreId).slice(0, 30),
    };
  }

  /**
   * 10. PUBLIC THEATRE MEDIA PROJECTION (Cached, Sanitized, Active-Only)
   * Powers /theatres and /theatre/[slug] without exposing DRAFT/HIDDEN/DELETED assets.
   */
  async getPublicTheatreMedia(theatreIdOrSlug: string): Promise<TheatrePublicMediaView | null> {
    const cleanKey = sanitizeString(theatreIdOrSlug, 150);
    if (!cleanKey) return null;

    const theatre =
      (await theatreLifecycleRepository.findById(cleanKey)) ||
      (await theatreLifecycleRepository.findBySlug(cleanKey));

    if (!theatre) return null;

    const cacheTag = CACHE_TAGS.THEATRE_MEDIA(theatre.id);
    const publicTag = CACHE_TAGS.PUBLIC_THEATRE_MEDIA(theatre.slug);

    return withQueryCache<TheatrePublicMediaView>(
      `public-media:${theatre.id}`,
      async () => {
        const col = await theatreMediaRepository.ensureCollection(theatre.id);
        const activeItems = (await theatreMediaRepository.findByTheatre(theatre.id, false)).filter(
          (a) => a.status === "ACTIVE"
        );
        const byId = new Map(activeItems.map((i) => [i.id, i]));

        const resolveSlot = (slotId: string | undefined, type: TheatreMediaType) =>
          (slotId && byId.get(slotId)) || activeItems.find((i) => i.mediaType === type);

        return {
          theatreId: theatre.id,
          theatreSlug: theatre.slug,
          theatreName: theatre.name,
          logo: resolveSlot(col?.activeLogoMediaId, "LOGO"),
          banner: resolveSlot(col?.activeBannerMediaId, "BANNER"),
          coverImage: resolveSlot(col?.activeCoverMediaId, "COVER_IMAGE"),
          heroImage: resolveSlot(col?.activeHeroMediaId, "HERO_IMAGE"),
          thumbnail: resolveSlot(col?.activeThumbnailMediaId, "THUMBNAIL"),
          gallery: activeItems
            .filter((i) => i.mediaType === "GALLERY_IMAGE")
            .sort((a, b) => a.displayOrder - b.displayOrder),
          futureVideoPlaceholders: [
            {
              subtype: "PROMOTIONAL_VIDEO",
              label: "Promotional Theatre Reel",
              description: "16:9 cinema sizzle reel & laser calibration showcase",
              aspectRatio: "16:9",
              status: "PLACEHOLDER_RESERVED",
            },
            {
              subtype: "THEATRE_WALKTHROUGH",
              label: "Full Foyer & VIP Lounge Walkthrough",
              description: "Guided walkthrough from concierge lobby to auditorium",
              aspectRatio: "16:9",
              status: "PLACEHOLDER_RESERVED",
            },
            {
              subtype: "HALL_PREVIEW",
              label: "Auditorium Sound & Sightline Preview",
              description: "Auditorium seating rows & curved screen preview",
              aspectRatio: "16:9",
              status: "PLACEHOLDER_RESERVED",
            },
            {
              subtype: "VIDEO_360",
              label: "360° Interactive Spatial Video",
              description: "Equirectangular immersive auditorium panorama feed",
              aspectRatio: "2:1",
              status: "PLACEHOLDER_RESERVED",
            },
            {
              subtype: "VIRTUAL_TOUR",
              label: "Multi-Hall Interactive Virtual Tour",
              description: "Future spatial wayfinding & premium seat exploration",
              aspectRatio: "16:9",
              status: "PLACEHOLDER_RESERVED",
            },
          ],
          cacheTag,
        };
      },
      {
        ttlSeconds: 120,
        tags: [cacheTag, publicTag],
      }
    );
  }
}

export const theatreMediaService = new TheatreMediaService();

