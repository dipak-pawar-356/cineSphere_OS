# CineSphere OS — Theatre Branding & Media Management Architecture (Phase 3 – Part 2)

## 1. Media Architecture Overview

The **Theatre Branding & Media Management** subsystem implements an enterprise multi-tenant **Digital Asset Management (DAM)** architecture decoupled from core cinema records:

```
Platform
  │
  ▼
Theatre (reused root tenant entity)
  │
  ▼
TheatreMediaCollection (theatre_media_collections)
  │
  ├── Logo                (SINGLE ACTIVE)
  ├── Banner              (SINGLE ACTIVE)
  ├── Cover Image         (SINGLE ACTIVE)
  ├── Hero Image          (SINGLE ACTIVE — public hero showcase)
  ├── Thumbnail           (SINGLE ACTIVE — listing & search cards)
  ├── Gallery Images      (UNLIMITED ORDERED ASSETS — 1..N)
  └── Future Video & 360° Walkthrough Placeholders (Architecture Prepared)
```

Rather than embedding hardcoded asset paths into `theatres`, every brand slot and gallery item is stored as an independent `TheatreMedia` record paired with:
1. **`TheatreMediaMetadata`** — `altText`, `caption`, dimensions (`width`/`height`), computed `aspectRatio`, MIME type, `fileSizeBytes`, server-computed SHA-256 `checksum`, `uploadSource`, `dominantColor`, `cropPlaceholder`, and `compressionPlaceholder` (future WebP/AVIF/Thumbnail responsive target metadata).
2. **`TheatreMediaVersion`** — immutable version snapshots created on every replacement so operators can inspect historical revisions and restore any earlier version as a forward non-destructive release (`restoreMediaVersion`).
3. **`TheatreMediaReference`** — reusable reference links (`targetEntityType`: `THEATRE` | `HALL` | `MOVIE` | `PROMOTION` | `ADVERTISEMENT`, `targetEntityId`, `slotKey`, `isActive`) allowing assets to be shared cleanly across modules in future phases.

---

## 2. Media Types & Lifecycle Statuses

### Supported `MediaType` Values (`theatreMediaTypeEnum`)
- **`LOGO`**, **`BANNER`**, **`COVER_IMAGE`**, **`HERO_IMAGE`**, **`THUMBNAIL`**: Enforce **single-active semantics** (`SINGLE_ACTIVE_MEDIA_TYPES`). Uploading or activating a new asset for one of these slots automatically archives the previous active asset in that slot and updates the active pointer on `TheatreMediaCollection`.
- **`GALLERY_IMAGE`**: Supports unlimited venue photography with explicit ordering (`displayOrder`, `displayPriority`).
- **`FUTURE_VIDEO_PLACEHOLDER` & `FUTURE_PANORAMA_PLACEHOLDER`**: Prepared DAM slots reserving schema contracts for future streaming videos and 360° auditorium tours.

### Media Lifecycle Statuses (`theatreMediaStatusEnum`)
- `DRAFT` → `ACTIVE` → `HIDDEN` → `ARCHIVED` → `DELETED` (soft delete only; physical rows remain preserved for audit traceability).

---

## 3. Gallery Management & Image Ordering

Unlimited venue images (`GALLERY_IMAGE`) support:
- **Drag-and-Drop Reordering** (`mode: "DRAG_DROP"`) via interactive cards in `TheatreBrandingMediaWorkspace`
- **Keyboard / Arrow Controls** (`mode: "MANUAL"`) with ARIA labels (`Move <title> earlier / later`)
- **Automatic Contiguous Normalization** (`mode: "AUTO_NORMALIZE"`), including automatic re-numbering when gallery items are soft-deleted
- Persistent storage of `displayOrder` and `displayPriority`, reflected immediately on the public venue gallery (`/theatre/[slug]`).

---

## 4. Validation Rules, Security & Compression Preparation

Enforced strictly server-side in `lib/validation/theatre-media.validation.ts` and `lib/services/theatre-media.service.ts` (`validateUpload`) — client metadata is never trusted unconditionally:

- **Protocol & XSS Sanitization:** Sanitizes titles, alt text, and captions via `stripHtml`/`sanitizeString`; restricts URLs to verified `https:` or safe local placeholder paths (`sanitizeUrl`), blocking `javascript:`, `data:`, `vbscript:`, and CRLF sequences.
- **MIME Allowlist & Binary Video Guard:** Enforces per-type image MIME policies (`image/webp`, `image/png`, `image/jpeg`, `image/avif`, plus `image/svg+xml` for logos). Explicitly rejects `video/*` MIME uploads and video file extensions while Future Video upload remains disabled.
- **File Size Ceilings & Dimension Bounds:** `LOGO` <= 2 MB (`>= 120×120`), `THUMBNAIL` <= 3 MB (`>= 320×200`), `GALLERY_IMAGE` <= 8 MB (`>= 600×400`), `BANNER`/`COVER_IMAGE`/`HERO_IMAGE` <= 10 MB (`>= 800–1200px` wide).
- **Integrity & Duplicate Detection Placeholders:** Checks `rawSignatureCheck` markers and minimum byte threshold (`>= 128` bytes), computes server-side SHA-256 checksums, and rejects duplicate asset uploads inside the same theatre vault (`DUPLICATE_MEDIA`).
- **Prepared Compression & CDN Hooks:** Populates `compressionPlaceholder` (`targetFormats: ["webp", "avif", "jpeg"]`, `responsiveWidths: [320, 640, 1280, 1920]`, `thumbnailSpec`) and cache invalidation tags (`CACHE_TAGS.THEATRE_MEDIA(theatreId)`, `CACHE_TAGS.PUBLIC_THEATRE_MEDIA(slug)`) via `withQueryCache` and `invalidateCacheByTag` — without integrating cloud buckets or executing image compression in this phase.

---

## 5. Future Video & 360° Walkthrough Support

Prepared subtypes under `theatreFutureVideoSubtypeEnum`:
- `PROMOTIONAL_VIDEO` (16:9 promotional reels)
- `THEATRE_WALKTHROUGH` (16:9 foyer & concierge tours)
- `HALL_PREVIEW` (16:9 auditorium screen & sound preview)
- `VIDEO_360` (2:1 equirectangular spatial video)
- `VIRTUAL_TOUR` (interactive virtual walkthrough)

All UI views display reserved architecture placeholders while explicitly blocking direct binary video uploads (`DO NOT BUILD` compliance).

---

## 6. Role Permissions, Tenant Isolation & Audit Trail

- **`SUPER_ADMIN`:** Views, searches, uploads, replaces, reorders, restores versions, updates metadata, and soft deletes across all multi-tenant theatre collections.
- **`THEATRE_ADMIN`:** Strictly isolated via `tenantService.assertTenantAccess` and pre-pagination query scoping (`scopedTenantId`) to manage media exclusively for their assigned complex (`th-pun-001`). Any cross-tenant access throws `TenantAccessError` and logs critical `TENANT_VIOLATION` events.
- **Audit Logging:** Every operation records immutable entries (`MEDIA_UPLOADED`, `MEDIA_REPLACED`, `MEDIA_VERSION_RESTORED`, `METADATA_UPDATED`, `GALLERY_REORDERED`, `MEDIA_DELETED`) capturing actor `userId`, `role`, `timestamp`, checksums, and change reasons.

---

## 7. Server Actions, Portal Integrations & Developer Notes

### Protected Server Actions (`actions/theatre-media-actions.ts`)
- `uploadTheatreMediaAction`
- `replaceTheatreMediaAction`
- `restoreTheatreMediaVersionAction`
- `deleteTheatreMediaAction`
- `reorderTheatreGalleryAction`
- `updateTheatreMediaMetadataAction`
- `retrieveTheatreMediaAction`
- `getTheatreBrandingCollectionAction`
- `validateTheatreMediaUploadAction`
- `getPublicTheatreMediaAction`

### Integrated Portal Routes
- **Public Theatre Detail (`app/(public)/theatre/[slug]/page.tsx`) & Listings (`app/(public)/theatres/page.tsx`):** Dynamically resolves active `Hero Image`, `Banner`, `Logo`, `Cover Image`, `Thumbnail`, and ordered active `Gallery` photos using responsive lazy-loaded `<Image>` rendering (`unoptimized`, `loading="lazy"`).
- **Super Admin Media Explorer (`app/(super-admin)/dashboard/media/page.tsx`) & Theatre Inspector (`app/(super-admin)/dashboard/theatres/[id]/page.tsx` `"media"` tab):** Fleet-wide search/filters + per-theatre Branding Studio.
- **Theatre Admin Vault (`app/(theatre-admin)/theatre/media/page.tsx`) & Gallery (`app/(theatre-admin)/theatre/gallery/page.tsx`):** Tenant-isolated branding slots, drag-and-drop gallery ordering, metadata/version inspector, and audit trail.

### Verification Suite
Run `.\node_modules\.pnpm\node_modules\.bin\tsx.cmd scripts/verify-theatre-media.ts` (or `npx tsx scripts/verify-theatre-media.ts`) to execute all 10 verification suites.

