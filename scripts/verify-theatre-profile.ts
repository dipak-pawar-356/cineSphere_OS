/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 3 Verification Suite
 * ==============================================================================
 * End-to-end automated tests verifying Theatre Profile Management:
 * - Separate Public Profile Slug vs Internal Tenant Slug + Localization Map
 * - Validation Guards (Duplicate Theatre Name, Website, Social URLs, Capacity)
 * - Profile Versioning (previousValues, updatedFields, Rollback)
 * - Languages (Single Primary Flag) & Social Links (XSS Blocking + Platforms)
 * - Profile Completion Score integrated with Branding Module Logo/Banner
 * - Status Transitions (DRAFT -> PUBLISHED -> HIDDEN -> ARCHIVED Read-Only)
 * - Search, Multi-Faceted Filtering, Pagination & Pre-Pagination Tenant Scoping
 * - RBAC & Immutable Audit Trail
 * ==============================================================================
 */

import assert from "node:assert/strict";
import { theatreLifecycleService } from "@/lib/services/theatre-lifecycle.service";
import { theatreLifecycleRepository } from "@/lib/repositories/theatre-lifecycle.repository";
import { theatreMediaService } from "@/lib/services/theatre-media.service";
import { theatreMediaRepository } from "@/lib/repositories/theatre-media.repository";
import { theatreProfileService } from "@/lib/services/theatre-profile.service";
import { theatreProfileRepository } from "@/lib/repositories/theatre-profile.repository";
import { SecurityActorContext } from "@/types/security-hardening.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  name: "Vikram Singhania",
  role: "SUPER_ADMIN",
  permissions: [],
  correlationId: "corr-prof-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  name: "Rajesh Deshmukh",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: [],
  correlationId: "corr-prof-pune",
};

const CUSTOMER: SecurityActorContext = {
  userId: "usr-cust-1",
  name: "Aarav Sharma",
  role: "CUSTOMER",
  permissions: [],
  correlationId: "corr-prof-cust",
};

async function runTests() {
  theatreLifecycleRepository.resetStore();
  theatreMediaRepository.resetStore();
  theatreProfileRepository.resetStore();

  console.log("\n==============================================================================");
  console.log("🏢 CineSphere OS — Phase 3 Part 3 Theatre Profile Verification Suite");
  console.log("==============================================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Create Theatre + Profile with Separate Public Slug & Localization
  // --------------------------------------------------------------------------
  console.log("👉 Test 1: Profile Creation, Public Slug Separation & Localization Readiness");
  const newTheatre = await theatreLifecycleService.createTheatre(
    {
      name: "Maratha Heritage Cinemas Nashik",
      chain: "Independent Heritage",
      address: "College Road",
      city: "Nashik",
      state: "Maharashtra",
      pinCode: "422005",
      contactEmail: "desk@marathaheritage.in",
      contactNumber: "+91 253 240 1122",
      adminName: "Sagar Joshi",
      adminEmail: "sagar@marathaheritage.in",
      pricingTier: "PREMIUM",
      subscriptionPlan: "Professional",
    },
    SUPER_ADMIN
  );

  const createdProfile = await theatreProfileService.createProfile(
    {
      theatreId: newTheatre.id,
      publicSlug: "maratha-nashik-showcase",
      theatreName: "Maratha Heritage Cinemas",
      legalName: "Maratha Heritage Exhibition LLP",
      displayName: "Maratha Heritage IMAX",
      tagline: "Nashik's Iconic Cinema Landmark",
      shortDescription: "Heritage single-campus 4-screen laser multiplex in Nashik.",
      fullDescription:
        "Equipped with 4K RGB laser projectors, custom acoustic panels, and Maharashtrian artisanal gourmet snacks.",
      aboutTheatre: "Founded in 1998 and modernized in 2024 with flagship Dolby Atmos halls.",
      establishedYear: 1998,
      theatreType: "LUXURY_CINEMA",
      ownershipModel: "INDEPENDENT",
      screensCount: 4,
      totalSeatingCapacity: 840,
      website: "https://marathaheritage.in",
      businessEmailPlaceholder: "concierge@marathaheritage.in",
      businessPhonePlaceholder: "+91 253 240 1122",
      localizedFields: {
        mr: {
          displayName: "मराठा हेरिटेज आयमॅक्स",
          tagline: "नाशिकची ऐतिहासिक चित्रपटगृह परंपरा",
        },
      },
      languages: [
        { languageCode: "mr", displayName: "Marathi", isPrimary: true },
        { languageCode: "hi", displayName: "Hindi", isPrimary: false },
        { languageCode: "en", displayName: "English", isPrimary: false },
      ],
      socialLinks: [
        {
          platform: "INSTAGRAM",
          label: "@marathaheritage",
          url: "https://instagram.com/marathaheritage",
        },
        {
          platform: "YOUTUBE",
          label: "Maratha Heritage Channel",
          url: "https://youtube.com/@marathaheritage",
        },
      ],
    },
    SUPER_ADMIN
  );

  assert.equal(createdProfile.theatreId, newTheatre.id);
  assert.notEqual(createdProfile.publicSlug, createdProfile.internalTheatreSlug);
  assert.equal(createdProfile.publicSlug, "maratha-nashik-showcase");
  assert.equal(createdProfile.averageCapacityPerScreen, 210);
  assert.equal(createdProfile.primaryLanguageCode, "mr");
  assert.equal(createdProfile.localizedFields.mr?.displayName, "मराठा हेरिटेज आयमॅक्स");
  console.log("  ✓ Created TheatreProfile with independent publicSlug, localization map & avg capacity (210)");

  // --------------------------------------------------------------------------
  // TEST 2: Validation Guards & Duplicate Prevention
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Validation Guards, Duplicate Theatre Name & Error Handling");
  await assert.rejects(
    async () =>
      theatreProfileService.createProfile(
        {
          theatreId: "th-pun-001", // already exists
          theatreName: "Another Name",
          legalName: "Another Legal Entity",
          theatreType: "MULTIPLEX",
          ownershipModel: "CHAIN",
          screensCount: 4,
          totalSeatingCapacity: 500,
        },
        SUPER_ADMIN
      ),
    /already has an initialized profile/
  );
  console.log("  ✓ Blocks duplicate profile creation for same theatre");

  const dupNameTheatre = await theatreLifecycleService.createTheatre(
    {
      name: "Silver Screen Nagpur",
      chain: "Silver Circuit",
      address: "Dharampeth",
      city: "Nagpur",
      state: "Maharashtra",
      contactEmail: "desk@silverscreen.in",
      contactNumber: "+91 712 222 1100",
      adminName: "Neha Kale",
      adminEmail: "neha@silverscreen.in",
      pricingTier: "STANDARD",
      subscriptionPlan: "Starter",
    },
    SUPER_ADMIN
  );

  await assert.rejects(
    async () =>
      theatreProfileService.createProfile(
        {
          theatreId: dupNameTheatre.id,
          theatreName: "Maratha Heritage Cinemas", // Duplicate!
          legalName: "Silver Screen Pvt Ltd",
          theatreType: "CHAIN_THEATRE",
          ownershipModel: "CHAIN",
          screensCount: 5,
          totalSeatingCapacity: 900,
        },
        SUPER_ADMIN
      ),
    /Duplicate Theatre Name/
  );
  console.log("  ✓ Rejects duplicate Theatre Name across circuit");

  await assert.rejects(
    async () =>
      theatreProfileService.createProfile(
        {
          theatreId: dupNameTheatre.id,
          theatreName: "Silver Screen Nagpur",
          legalName: "Silver Screen Nagpur LLP",
          theatreType: "MULTIPLEX",
          ownershipModel: "CHAIN",
          screensCount: 10,
          totalSeatingCapacity: 50, // < 10 per screen!
        },
        SUPER_ADMIN
      ),
    /too low for 10 screen/
  );
  console.log("  ✓ Rejects invalid screens/seating capacity ratio");

  await assert.rejects(
    async () =>
      theatreProfileService.updateProfile(
        {
          theatreId: newTheatre.id,
          website: "javascript:alert(1)",
        },
        SUPER_ADMIN
      ),
    /http:\/\/ or https:\/\//
  );
  console.log("  ✓ Rejects dangerous javascript: website URL");

  // --------------------------------------------------------------------------
  // TEST 3: Profile Completion Score + Live Branding Module Integration
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Completion Score & Branding Logo/Banner Sync");
  assert.equal(createdProfile.completionSummary.checklist.hasLogoUploaded, false);
  assert.equal(createdProfile.completionSummary.checklist.hasBannerUploaded, false);
  assert.equal(createdProfile.completionScore, 75);

  await theatreMediaService.uploadMedia(
    {
      theatreId: newTheatre.id,
      mediaType: "LOGO",
      title: "Maratha Emblem Logo",
      url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=400",
      status: "ACTIVE",
      altText: "Maratha Heritage cinema emblem",
      mimeType: "image/png",
      fileSizeBytes: 180000,
      width: 512,
      height: 512,
    },
    SUPER_ADMIN
  );
  await theatreMediaService.uploadMedia(
    {
      theatreId: newTheatre.id,
      mediaType: "BANNER",
      title: "Maratha Main Banner",
      url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600",
      status: "ACTIVE",
      altText: "Maratha Heritage main auditorium banner",
      mimeType: "image/webp",
      fileSizeBytes: 880000,
      width: 1920,
      height: 1080,
    },
    SUPER_ADMIN
  );

  const bundleAfterBranding = await theatreProfileService.getProfileBundle(newTheatre.id, SUPER_ADMIN);
  assert.equal(bundleAfterBranding.profile.completionSummary.checklist.hasLogoUploaded, true);
  assert.equal(bundleAfterBranding.profile.completionSummary.checklist.hasBannerUploaded, true);
  assert.equal(bundleAfterBranding.profile.completionScore, 100);
  assert.ok(bundleAfterBranding.brandingPreview.logo);
  assert.ok(bundleAfterBranding.brandingPreview.banner);
  console.log("  ✓ Completion score dynamically climbs 75% -> 100% upon Logo & Banner upload");

  // --------------------------------------------------------------------------
  // TEST 4: Update, Optimistic Locking & Version History + Rollback
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Update, Optimistic Concurrency, Versioning & Rollback");
  const updatedV2 = await theatreProfileService.updateProfile(
    {
      theatreId: newTheatre.id,
      expectedVersion: bundleAfterBranding.profile.version,
      displayName: "Maratha Heritage Gold Plaza",
      tagline: "<script>alert('xss')</script>Premier Cinema of North Maharashtra",
      screensCount: 5,
      totalSeatingCapacity: 1100,
      changeSummary: "Expanded IMAX extension to 5 screens",
    },
    SUPER_ADMIN
  );

  assert.equal(updatedV2.version, 2);
  assert.equal(updatedV2.displayName, "Maratha Heritage Gold Plaza");
  assert.equal(updatedV2.tagline, "Premier Cinema of North Maharashtra");
  assert.equal(updatedV2.averageCapacityPerScreen, 220);

  await assert.rejects(
    async () =>
      theatreProfileService.updateProfile(
        {
          theatreId: newTheatre.id,
          expectedVersion: 1, // stale!
          displayName: "Stale Edit",
        },
        SUPER_ADMIN
      ),
    /Optimistic locking conflict/
  );
  console.log("  ✓ Strips XSS script markup, increments version v2, and enforces optimistic locking");

  const rolledBackV3 = await theatreProfileService.rollbackToVersion(
    newTheatre.id,
    2,
    "Reverting display name to flagship title",
    SUPER_ADMIN
  );
  assert.equal(rolledBackV3.version, 3);
  assert.equal(rolledBackV3.displayName, "Maratha Heritage IMAX");
  console.log("  ✓ Rolls back pre-v2 snapshot non-destructively into forward v3");

  // --------------------------------------------------------------------------
  // TEST 5: Multi-Language Enforcement & Social Link Validation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Languages Single-Primary Governance & Social Platform Validation");
  const afterLangs = await theatreProfileService.updateLanguages(
    {
      theatreId: newTheatre.id,
      languages: [
        { languageCode: "en", displayName: "English", isPrimary: false },
        { languageCode: "hi", displayName: "Hindi", isPrimary: true },
        { languageCode: "mr", displayName: "Marathi", isPrimary: true }, // should keep single primary (hi)
        { languageCode: "ta", displayName: "Tamil", isPrimary: false },
      ],
    },
    SUPER_ADMIN
  );

  assert.equal(afterLangs.languages.length, 4);
  assert.equal(afterLangs.languages.filter((l) => l.isPrimary).length, 1);
  assert.equal(afterLangs.primaryLanguageCode, "hi");
  console.log("  ✓ Enforces single Primary language flag cleanly");

  await assert.rejects(
    async () =>
      theatreProfileService.updateSocialLinks(
        {
          theatreId: newTheatre.id,
          socialLinks: [
            { platform: "INSTAGRAM", url: "https://facebook.com/wrongdomain" },
          ],
        },
        SUPER_ADMIN
      ),
    /URL domain for INSTAGRAM/
  );

  const afterSocials = await theatreProfileService.updateSocialLinks(
    {
      theatreId: newTheatre.id,
      socialLinks: [
        { platform: "FACEBOOK", label: "FB Page", url: "https://facebook.com/marathaheritage" },
        { platform: "INSTAGRAM", label: "@maratha", url: "https://instagram.com/marathaheritage" },
        { platform: "X_TWITTER", label: "@marathax", url: "https://x.com/marathaheritage" },
        { platform: "LINKEDIN", label: "Corp", url: "https://linkedin.com/company/maratha" },
        { platform: "THREADS", label: "Threads", url: "https://threads.net/@marathaheritage" },
        {
          platform: "CUSTOM",
          customPlatformName: "WhatsApp Channel",
          url: "https://whatsapp.com/channel/12345",
        },
      ],
    },
    SUPER_ADMIN
  );
  assert.equal(afterSocials.socialLinks.length, 6);
  console.log("  ✓ Validates social URLs by platform domain & supports Custom platforms");

  // --------------------------------------------------------------------------
  // TEST 6: Profile Status Transitions & Public Visibility Projection
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Draft -> Published -> Hidden -> Archived & Public View");
  const draftPublic = await theatreProfileService.getPublicTheatreProfile("maratha-nashik-showcase");
  assert.equal(draftPublic, null);

  await theatreProfileService.changeProfileStatus(
    newTheatre.id,
    "PUBLISHED",
    "Approved for public cinema discovery",
    SUPER_ADMIN
  );

  const publishedPublic = await theatreProfileService.getPublicTheatreProfile(
    "maratha-nashik-showcase"
  );
  assert.ok(publishedPublic);
  assert.equal(publishedPublic.publicSlug, "maratha-nashik-showcase");
  assert.ok(publishedPublic.branding.logo);
  assert.ok(publishedPublic.branding.banner);
  assert.equal(publishedPublic.socialLinks.length, 6);

  await theatreProfileService.changeProfileStatus(
    newTheatre.id,
    "HIDDEN",
    "Temporary brand refresh",
    SUPER_ADMIN
  );
  const hiddenPublic = await theatreProfileService.getPublicTheatreProfile("maratha-nashik-showcase");
  assert.equal(hiddenPublic, null);

  await theatreProfileService.changeProfileStatus(
    newTheatre.id,
    "ARCHIVED",
    "End of lease archive",
    SUPER_ADMIN
  );
  await assert.rejects(
    async () =>
      theatreProfileService.updateProfile(
        { theatreId: newTheatre.id, displayName: "Should Fail" },
        SUPER_ADMIN
      ),
    /Archived profiles are read-only/
  );
  console.log("  ✓ Enforces Draft/Published/Hidden public visibility & Archived read-only protection");

  // --------------------------------------------------------------------------
  // TEST 7: Search, Multi-Filters & Pagination
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Search, Filters & Pagination Accuracy");
  const searchRes = await theatreProfileService.retrieveProfiles(
    {
      query: "Marathi",
      ownershipModel: "INDEPENDENT",
      theatreType: "LUXURY_CINEMA",
      establishedYearFrom: 1995,
      establishedYearTo: 2005,
      page: 1,
      pageSize: 5,
    },
    SUPER_ADMIN
  );
  assert.equal(searchRes.total, 1);
  assert.equal(searchRes.items[0].theatreId, newTheatre.id);
  console.log("  ✓ Search by Language + Ownership + Category + Established Year returns exact match");

  // --------------------------------------------------------------------------
  // TEST 8: Role Permissions, Tenant Isolation & Immutable Audit Trail
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: RBAC, Cross-Tenant Isolation & Audit Trail");
  await assert.rejects(
    async () =>
      theatreProfileService.updateProfile(
        { theatreId: "th-pun-001", tagline: "Unauthorized" },
        CUSTOMER
      ),
    /Access denied/
  );

  await assert.rejects(
    async () => theatreProfileService.getProfileBundle("th-mum-001", PUNE_ADMIN),
    /Cross-tenant access denied/
  );

  await assert.rejects(
    async () =>
      theatreProfileService.changeProfileStatus("th-pun-001", "ARCHIVED", "Admin try", PUNE_ADMIN),
    /Only SUPER_ADMIN may archive/
  );

  const puneSearch = await theatreProfileService.retrieveProfiles({}, PUNE_ADMIN);
  assert.equal(puneSearch.total, 1);
  assert.equal(puneSearch.items[0].theatreId, "th-pun-001");
  assert.equal(puneSearch.summary.totalProfiles, 1);
  console.log("  ✓ Blocks CUSTOMER, enforces strict Theatre Admin cross-tenant isolation & summary scoping");

  const puneEdit = await theatreProfileService.updateProfile(
    {
      theatreId: "th-pun-001",
      shortDescription: "Flagship Dolby & IMAX destination in Pune",
    },
    PUNE_ADMIN
  );
  assert.equal(puneEdit.version, 2);

  const finalBundle = await theatreProfileService.getProfileBundle(newTheatre.id, SUPER_ADMIN);
  assert.ok(finalBundle.versions.length >= 8);
  assert.ok(finalBundle.recentAudits.length >= 8);
  console.log(
    `  ✓ Records immutable TheatreProfileVersion (${finalBundle.versions.length}) & audit entries (${finalBundle.recentAudits.length})`
  );

  console.log("\n==============================================================================");
  console.log("🎉 ALL THEATRE PROFILE MANAGEMENT VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Theatre Profile verification failed:", err);
  process.exit(1);
});

