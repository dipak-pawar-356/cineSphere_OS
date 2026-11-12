/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 2 Verification Suite
 * Tests: TheatreMediaCollection, Single-Active Brand Slots, Versioning & Rollback,
 * Gallery Ordering, Validation & Security, Soft Delete, Public Projection,
 * Multi-Tenant Isolation, Search/Pagination, Cache Hooks & Audit Trails.
 * ==============================================================================
 */

import { theatreMediaService } from "../lib/services/theatre-media.service";
import { theatreMediaRepository } from "../lib/repositories/theatre-media.repository";
import { theatreLifecycleService } from "../lib/services/theatre-lifecycle.service";
import { theatreLifecycleRepository } from "../lib/repositories/theatre-lifecycle.repository";
import {
  AuthorizationError,
  BusinessRuleError,
  TenantAccessError,
  ValidationError,
} from "../lib/errors/app-error";
import { SecurityActorContext } from "../types/security-hardening.types";

function assert(condition: unknown, label: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${label}`);
    process.exit(1);
  }
  console.log(`  ✓ ${label}`);
}

async function runTheatreMediaVerification() {
  console.log("\n==============================================================================");
  console.log("🎨 CineSphere OS — Phase 3 Part 2 Theatre Branding & Media Verification");
  console.log("==============================================================================\n");

  theatreLifecycleRepository.resetStore();
  theatreMediaRepository.resetStore();

  const superAdmin: SecurityActorContext = {
    userId: "usr-super-1",
    name: "Vikram Singhania",
    role: "SUPER_ADMIN",
    permissions: [],
    correlationId: "corr-med-super",
  };

  const puneAdmin: SecurityActorContext = {
    userId: "usr-th-pun",
    name: "Aditi Kulkarni",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: [],
    correlationId: "corr-med-pune",
  };

  const customerActor: SecurityActorContext = {
    userId: "usr-cust-1",
    name: "Rohan Deshmukh",
    role: "CUSTOMER",
    permissions: [],
    correlationId: "corr-med-cust",
  };

  // ----------------------------------------------------------------------------
  // Test 1: Collection Initialization (Seeded + Dynamically Created Theatre)
  // ----------------------------------------------------------------------------
  console.log("👉 Test 1: Collection Initialization & Unlimited Theatre Extensibility");
  const puneBundle = await theatreMediaService.getTheatreBrandingCollection("th-pun-001", puneAdmin);
  assert(Boolean(puneBundle.collection.id), "Initializes centralized TheatreMediaCollection for th-pun-001");
  assert(
    Boolean(
      puneBundle.brandingSlots.logo &&
        puneBundle.brandingSlots.banner &&
        puneBundle.brandingSlots.coverImage &&
        puneBundle.brandingSlots.heroImage &&
        puneBundle.brandingSlots.thumbnail
    ),
    "Exposes all 5 single-active brand identity slots (Logo, Banner, Cover, Hero, Thumbnail)"
  );
  assert(puneBundle.galleryImages.length >= 3, "Seeds ordered gallery items cleanly");

  const brandNewTheatre = await theatreLifecycleService.createTheatre(
    {
      name: "IMAX Kolhapur Citadel",
      contactEmail: "launch@citadel.example",
      contactNumber: "+91 231 555 0199",
      adminName: "Gaurav Patwardhan",
      adminEmail: "gaurav@citadel.example",
      address: "Tarabai Park Civic Center",
      city: "Kolhapur",
      state: "Maharashtra",
    },
    superAdmin
  );
  const newTheatreCol = await theatreMediaService.getTheatreBrandingCollection(
    brandNewTheatre.id,
    superAdmin
  );
  assert(
    newTheatreCol.collection.theatreId === brandNewTheatre.id,
    `Auto-initializes TheatreMediaCollection for new theatre ${brandNewTheatre.id}`
  );

  // ----------------------------------------------------------------------------
  // Test 2: Upload Validation & Security Rules (Never Trust Client Metadata)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 2: Upload Validation, Security & Anti-Corruption Guards");
  const videoBlocked = await theatreMediaService.validateUpload(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "BANNER",
      title: "Promo Video Attempt",
      url: "https://cdn.example.com/walkthrough.mp4",
      altText: "Walkthrough video file",
      mimeType: "video/mp4",
      fileSizeBytes: 5000000,
      width: 1920,
      height: 1080,
    },
    superAdmin
  );
  assert(!videoBlocked.valid, "Blocks raw video binary upload (video/mp4)");

  const xssBlocked = await theatreMediaService.validateUpload(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "LOGO",
      title: "XSS URL Attempt",
      url: "javascript:alert('xss')",
      altText: "Bad logo url",
      mimeType: "image/png",
      fileSizeBytes: 120000,
      width: 512,
      height: 512,
    },
    superAdmin
  );
  assert(!xssBlocked.valid, "Blocks dangerous javascript: URI protocol");

  const corruptBlocked = await theatreMediaService.validateUpload(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "LOGO",
      title: "Corrupt File Signature",
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=512",
      altText: "Corrupt logo upload",
      mimeType: "image/png",
      fileSizeBytes: 204800,
      width: 512,
      height: 512,
      rawSignatureCheck: "CORRUPT_HEADER_BYTES",
    },
    superAdmin
  );
  assert(!corruptBlocked.valid, "Detects and rejects corrupted file signature marker");

  const oversizedBlocked = await theatreMediaService.validateUpload(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "LOGO",
      title: "Huge Logo",
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1000",
      altText: "Oversized logo image",
      mimeType: "image/png",
      fileSizeBytes: 6 * 1024 * 1024, // 6MB > 2MB LOGO ceiling
      width: 512,
      height: 512,
    },
    superAdmin
  );
  assert(!oversizedBlocked.valid, "Rejects oversized file exceeding 2 MB LOGO limit");

  // Upload valid Logo & test duplicate checksum rejection
  const logo1 = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "LOGO",
      title: "Citadel Primary Gold Mark",
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=512&id=logo1",
      altText: "Citadel gold cinema logo",
      mimeType: "image/png",
      fileSizeBytes: 220000,
      width: 512,
      height: 512,
      dominantColor: "#FBBF24",
    },
    superAdmin
  );
  assert(logo1.status === "ACTIVE" && logo1.currentVersion === 1, "Uploads valid LOGO cleanly (v1)");

  let duplicateBlocked = false;
  try {
    await theatreMediaService.uploadMedia(
      {
        theatreId: brandNewTheatre.id,
        mediaType: "THUMBNAIL",
        title: "Duplicate Checksum File",
        url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=512&id=logo1",
        altText: "Same checksum asset",
        mimeType: "image/png",
        fileSizeBytes: 220000,
        width: 512,
        height: 512,
      },
      superAdmin
    );
  } catch (err) {
    if (err instanceof BusinessRuleError && err.code === "DUPLICATE_MEDIA") {
      duplicateBlocked = true;
    }
  }
  assert(duplicateBlocked, "Prevents duplicate upload via SHA-256 checksum matching");

  // ----------------------------------------------------------------------------
  // Test 3: Single-Active Brand Slot Enforcement (Only 1 Active Logo/Banner/Cover/Hero/Thumb)
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 3: Single-Active Slot Governance");
  const logo2 = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "LOGO",
      title: "Citadel Rebrand Platinum Logo",
      url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=512&id=logo2",
      altText: "Citadel platinum cinema logo",
      mimeType: "image/png",
      fileSizeBytes: 245000,
      width: 512,
      height: 512,
      dominantColor: "#CBD5E1",
    },
    superAdmin
  );
  const logo1After = await theatreMediaRepository.findById(logo1.id);
  const refreshedCol = await theatreMediaService.getTheatreBrandingCollection(
    brandNewTheatre.id,
    superAdmin
  );
  assert(
    logo1After?.status === "ARCHIVED" &&
      logo2.status === "ACTIVE" &&
      refreshedCol.collection.activeLogoMediaId === logo2.id,
    "Automatically archives previous LOGO and promotes newly active LOGO to collection pointer"
  );

  // ----------------------------------------------------------------------------
  // Test 4: Media Versioning & Historical Rollback Restore
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 4: Media Versioning & Historical Restore");
  const hero = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "HERO_IMAGE",
      title: "Citadel Main Hero Stage",
      url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&id=hero-v1",
      altText: "Citadel Hero Stage v1",
      mimeType: "image/webp",
      fileSizeBytes: 1950000,
      width: 1920,
      height: 1080,
      dominantColor: "#070B12",
    },
    superAdmin
  );

  const heroV2 = await theatreMediaService.replaceMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaId: hero.id,
      expectedVersion: 1,
      url: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1600&id=hero-v2",
      altText: "Citadel Hero Stage v2",
      mimeType: "image/webp",
      fileSizeBytes: 2100000,
      width: 2400,
      height: 1080,
      changeReason: "Winter Dolby upgrade photography",
    },
    superAdmin
  );
  assert(
    heroV2.currentVersion === 2 && heroV2.versions.length === 2,
    "Replaces media file while preserving v1 + v2 in TheatreMediaVersion ledger"
  );

  const heroV3Restored = await theatreMediaService.restoreMediaVersion(
    brandNewTheatre.id,
    hero.id,
    1,
    "Revert to original architectural lighting hero",
    superAdmin
  );
  assert(
    heroV3Restored.currentVersion === 3 &&
      heroV3Restored.url.includes("hero-v1") &&
      heroV3Restored.versions.length === 3,
    "Restores v1 cleanly as new forward v3 without mutating version history"
  );

  // ----------------------------------------------------------------------------
  // Test 5: Unlimited Gallery Upload & Reordering Persistence
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 5: Gallery Upload, Drag-and-Drop Reorder & Cross-Tenant Guard");
  const gal1 = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "GALLERY_IMAGE",
      title: "Lobby Fountain View",
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&g=1",
      altText: "Main lobby fountain",
      mimeType: "image/jpeg",
      fileSizeBytes: 1100000,
      width: 1600,
      height: 1067,
    },
    superAdmin
  );
  const gal2 = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "GALLERY_IMAGE",
      title: "Recliner Row Showcase",
      url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1200&g=2",
      altText: "Motorized leather recliners",
      mimeType: "image/jpeg",
      fileSizeBytes: 1200000,
      width: 1600,
      height: 1067,
    },
    superAdmin
  );
  const gal3 = await theatreMediaService.uploadMedia(
    {
      theatreId: brandNewTheatre.id,
      mediaType: "GALLERY_IMAGE",
      title: "Gourmet Bar Counter",
      url: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&g=3",
      altText: "Concessions bar",
      mimeType: "image/jpeg",
      fileSizeBytes: 1300000,
      width: 1600,
      height: 1067,
    },
    superAdmin
  );

  const reordered = await theatreMediaService.reorderGallery(
    {
      theatreId: brandNewTheatre.id,
      orderedMediaIds: [gal3.id, gal1.id, gal2.id],
      mode: "DRAG_DROP",
    },
    superAdmin
  );
  assert(
    reordered[0].id === gal3.id &&
      reordered[0].displayOrder === 1 &&
      reordered[1].id === gal1.id &&
      reordered[1].displayOrder === 2 &&
      reordered[2].id === gal2.id &&
      reordered[2].displayOrder === 3,
    "Persists custom drag-and-drop display ordering (1..3)"
  );

  // ----------------------------------------------------------------------------
  // Test 6: Metadata Sanitization & Lifecycle Status Control
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 6: XSS Sanitization & Media Status Lifecycle");
  const updatedMeta = await theatreMediaService.updateMetadata(
    {
      theatreId: brandNewTheatre.id,
      mediaId: gal2.id,
      title: "<script>alert(1)</script>VIP Leather Lounge",
      altText: "<b>Recliner Seating</b> in VIP Hall",
      status: "HIDDEN",
    },
    superAdmin
  );
  assert(
    updatedMeta.title === "VIP Leather Lounge" &&
      updatedMeta.metadata.altText === "Recliner Seating in VIP Hall" &&
      updatedMeta.status === "HIDDEN",
    "Strips unsafe XSS/HTML markup and transitions asset cleanly to HIDDEN"
  );

  // ----------------------------------------------------------------------------
  // Test 7: Soft Delete Governance & Public Theatre Projection Caching
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 7: Soft Delete & Public Active-Only Projection");
  const deletedAsset = await theatreMediaService.deleteMedia(
    brandNewTheatre.id,
    gal1.id,
    "Replaced during renovation",
    superAdmin
  );
  assert(
    deletedAsset.status === "DELETED" && deletedAsset.deletedBy === superAdmin.userId,
    "Soft deletes asset while preserving deletedBy & deletedAt metadata"
  );

  const publicView = await theatreMediaService.getPublicTheatreMedia(brandNewTheatre.slug);
  assert(
    publicView !== null &&
      publicView.heroImage?.id === hero.id &&
      publicView.logo?.id === logo2.id &&
      publicView.gallery.length === 1 && // gal1 DELETED, gal2 HIDDEN -> only gal3 ACTIVE!
      publicView.gallery[0].id === gal3.id &&
      publicView.futureVideoPlaceholders.length === 5,
    "Public theatre media excludes HIDDEN & DELETED assets and exposes active Hero/Logo/Gallery + 5 future video stubs"
  );

  // Cache invalidation verification on subsequent mutation
  await theatreMediaService.updateMetadata(
    { theatreId: brandNewTheatre.id, mediaId: gal2.id, status: "ACTIVE" },
    superAdmin
  );
  const publicViewRefreshed = await theatreMediaService.getPublicTheatreMedia(brandNewTheatre.slug);
  assert(
    publicViewRefreshed?.gallery.length === 2,
    "Cache invalidation updates public theatre projection immediately upon status activation"
  );

  // ----------------------------------------------------------------------------
  // Test 8: Search, Filters & Pagination
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 8: Search, Multi-Faceted Filters & Pagination");
  const searchByUploader = await theatreMediaService.retrieveMedia(
    { query: "Aditi", mediaType: "GALLERY_IMAGE", status: "ACTIVE", page: 1, pageSize: 2 },
    superAdmin
  );
  assert(
    searchByUploader.items.length === 2 &&
      searchByUploader.total >= 3 &&
      searchByUploader.hasNext,
    "Searches by Uploader, filters by Type/Status, and paginates accurately"
  );

  // ----------------------------------------------------------------------------
  // Test 9: Multi-Tenant RBAC & Cross-Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 9: Multi-Tenant Ownership & Role Enforcement");
  let customerDenied = false;
  try {
    await theatreMediaService.uploadMedia(
      {
        theatreId: "th-pun-001",
        mediaType: "GALLERY_IMAGE",
        title: "Unauthorized Guest Upload",
        url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&u=1",
        altText: "Guest upload attempt",
        mimeType: "image/jpeg",
        fileSizeBytes: 500000,
        width: 800,
        height: 600,
      },
      customerActor
    );
  } catch (err) {
    if (err instanceof AuthorizationError) customerDenied = true;
  }
  assert(customerDenied, "Blocks CUSTOMER role from media vault uploads");

  let crossTenantDenied = false;
  try {
    await theatreMediaService.getTheatreBrandingCollection("th-mum-001", puneAdmin);
  } catch (err) {
    if (err instanceof TenantAccessError) crossTenantDenied = true;
  }
  assert(crossTenantDenied, "Strictly blocks Pune Theatre Admin from viewing th-mum-001 media collection");

  const puneVaultSearch = await theatreMediaService.retrieveMedia({}, puneAdmin);
  assert(
    puneVaultSearch.items.every((a) => a.theatreId === "th-pun-001") &&
      puneVaultSearch.summary.totalAssets === puneBundle.summary.totalAssets,
    "Scopes Theatre Admin search results & summary storage metrics strictly to assigned tenant"
  );

  // ----------------------------------------------------------------------------
  // Test 10: Complete Media Audit Logging Verification
  // ----------------------------------------------------------------------------
  console.log("\n👉 Test 10: Immutable Media Audit Trail");
  const finalColBundle = await theatreMediaService.getTheatreBrandingCollection(
    brandNewTheatre.id,
    superAdmin
  );
  const actionsRecorded = new Set(finalColBundle.recentAudits.map((a) => a.action));
  assert(
    actionsRecorded.has("MEDIA_UPLOADED") &&
      actionsRecorded.has("MEDIA_REPLACED") &&
      actionsRecorded.has("MEDIA_VERSION_RESTORED") &&
      actionsRecorded.has("GALLERY_REORDERED") &&
      actionsRecorded.has("METADATA_UPDATED") &&
      actionsRecorded.has("MEDIA_DELETED"),
    `Records complete immutable audit trail (${finalColBundle.recentAudits.length} events)`
  );

  // Reference check
  assert(
    logo2.references.length === 1 &&
      logo2.references[0].slotKey === "THEATRE_LOGO" &&
      logo2.references[0].targetEntityType === "THEATRE",
    "Maintains decoupled reusable TheatreMediaReference links instead of embedding raw URLs"
  );

  console.log("\n==============================================================================");
  console.log("🎉 ALL 10 THEATRE BRANDING & MEDIA VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runTheatreMediaVerification().catch((err) => {
  console.error("FATAL: Media Verification Failed:", err);
  if (err instanceof ValidationError) {
    console.error("Validation errors:", err.fieldErrors);
  }
  process.exit(1);
});

