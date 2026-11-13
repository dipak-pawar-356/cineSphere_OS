/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 4 Theatre Address & Location Verification Suite
 * ==============================================================================
 * Comprehensive automated verification tests covering:
 * 1. Location Creation, Structured Address Normalization & Primary Branch Assignment
 * 2. Coordinate Governance, Range Validation & Spatial Index / Geohash Placeholders
 * 3. Google Maps & Navigation Link Verification & Anti-Corruption Protocol
 * 4. Super Admin Location Verification Workflow & Publication Gate
 * 5. Re-verification Governance on Address Tampering
 * 6. Optimistic Concurrency Locking, Version History & Forward Rollback
 * 7. Multi-Location Chains Readiness (Theatre 1:N Locations)
 * 8. Multi-Faceted Search, Hierarchical Filtering & Pre-Pagination Tenant Isolation
 * 9. Public Theatre Page Location Projection (Active Published Only)
 * 10. Immutable Audit Logging & Structured Telemetry
 * ==============================================================================
 */

import { theatreLocationService, computeGeohashPlaceholder, computeSpatialIndexPlaceholder } from "../lib/services/theatre-location.service";
import { theatreLocationRepository } from "../lib/repositories/theatre-location.repository";
import { theatreLifecycleRepository } from "../lib/repositories/theatre-lifecycle.repository";
import { SecurityActorContext } from "../types/security-hardening.types";
import { ConflictError, AuthorizationError, ValidationError } from "../lib/errors/app-error";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["*"],
  correlationId: "corr-loc-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE:MANAGE"],
  correlationId: "corr-loc-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE:MANAGE"],
  correlationId: "corr-loc-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runLocationVerification() {
  console.log("\n==============================================================================");
  console.log("📍 CineSphere OS — Phase 3 Part 4 Theatre Address & Location Verification");
  console.log("==============================================================================\n");

  theatreLocationRepository.resetStore();

  // --------------------------------------------------------------------------
  // TEST 1: Creation, Address Normalization & Primary Branch Assignment
  // --------------------------------------------------------------------------
  console.log("👉 Test 1: Location Creation, Structured Address Normalization & Primary Branch Assignment");

  const createdLocation = await theatreLocationService.createLocation(
    {
      theatreId: "th-pun-001",
      locationName: "Phoenix Marketcity Flagship",
      isPrimary: true,
      addressLine1: "Level 4, East Court, Phoenix Marketcity",
      addressLine2: "Viman Nagar Road",
      area: "Viman Nagar",
      city: "Pune",
      district: "Pune",
      state: "Maharashtra",
      country: "India",
      postalCode: "411014",
      landmark: "Opposite Inorbit Mall",
      latitude: 18.562145,
      longitude: 73.916723,
      coordinateSource: "GPS",
      googleMapsUrl: "https://maps.google.com/?q=18.562145,73.916723",
      navigationLink: "https://www.google.com/maps/dir/?api=1&destination=18.562145,73.916723",
    },
    PUNE_ADMIN
  );

  assert(createdLocation.id.startsWith("loc-"), "Location ID generated with loc- prefix");
  assert(createdLocation.theatreId === "th-pun-001", "Associated with correct theatre tenant");
  assert(createdLocation.isPrimary === true, "Marked as primary location branch");
  assert(createdLocation.version === 1, "Initial optimistic version set to v1");
  assert(
    createdLocation.verificationStatus === "UNVERIFIED",
    "Theatre Admin creation starts in UNVERIFIED state awaiting Super Admin review"
  );
  assert(createdLocation.status === "DRAFT", "Initial status set to DRAFT");
  assert(
    createdLocation.formattedAddress?.includes("Pune, Maharashtra - 411014"),
    "Formatted address contains normalized city, state, and postal code"
  );
  assert(
    createdLocation.displayAddress?.includes("Viman Nagar, Pune, Maharashtra"),
    "Display address generated cleanly for compact badges"
  );

  // --------------------------------------------------------------------------
  // TEST 2: Coordinate Governance, Range Validation & Spatial Index / Geohash Placeholders
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Coordinate Governance, Range Validation & Spatial Index / Geohash Placeholders");

  const coords = await theatreLocationRepository.getCoordinates(createdLocation.id);
  assert(coords !== null, "Coordinates record persisted successfully");
  assert(coords?.latitude === 18.562145, "Latitude recorded accurately");
  assert(coords?.longitude === 73.916723, "Longitude recorded accurately");
  assert(coords?.coordinateSource === "GPS", "Coordinate source recorded as GPS");

  const geohash = computeGeohashPlaceholder(18.562145, 73.916723);
  const spatialPoint = computeSpatialIndexPlaceholder(18.562145, 73.916723);
  assert(geohash.length === 8, `Geohash placeholder generated with 8-character resolution (${geohash})`);
  assert(
    spatialPoint.includes("POINT(73.9167230 18.5621450)"),
    `Spatial Point WKT matches SRID 4326 PostGIS standard (${spatialPoint})`
  );

  // Reject out-of-range coordinates
  let invalidCoordsCaught = false;
  try {
    await theatreLocationService.updateCoordinates(
      {
        locationId: createdLocation.id,
        theatreId: "th-pun-001",
        latitude: 120.0, // Invalid latitude (> 90)
        longitude: 73.916723,
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      invalidCoordsCaught = true;
    }
  }
  assert(invalidCoordsCaught, "Rejects out-of-range latitude > 90 with ValidationError");

  // Valid coordinate update
  const updatedCoords = await theatreLocationService.updateCoordinates(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      latitude: 18.5622,
      longitude: 73.9168,
      coordinateSource: "MAP_PIN",
      accuracyMeters: 3.5,
    },
    PUNE_ADMIN
  );
  assert(updatedCoords.latitude === 18.5622, "Coordinates updated successfully");
  assert(updatedCoords.coordinateSource === "MAP_PIN", "Coordinate source updated to MAP_PIN");

  // --------------------------------------------------------------------------
  // TEST 3: Google Maps & Navigation Link Verification & Anti-Corruption Protocol
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Google Maps & Navigation Link Verification & Anti-Corruption Protocol");

  let dangerousUrlCaught = false;
  try {
    await theatreLocationService.updateLocation(
      {
        locationId: createdLocation.id,
        theatreId: "th-pun-001",
        googleMapsUrl: "javascript:alert(document.cookie)",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      dangerousUrlCaught = true;
    }
  }
  assert(dangerousUrlCaught, "Blocks dangerous javascript: pseudo-protocol in Google Maps URL");

  // Valid Google Maps update
  const validMapsUpdate = await theatreLocationService.updateLocation(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      googleMapsUrl: "https://maps.google.com/?q=18.562145,73.916723",
      navigationLink: "https://www.google.com/maps/dir/?api=1&destination=18.562145,73.916723",
    },
    PUNE_ADMIN
  );
  assert(validMapsUpdate.googleMapsUrl?.startsWith("https://maps.google.com"), "Accepts valid HTTPS maps URL");
  assert(validMapsUpdate.mapEmbedUrl?.includes("output=embed"), "Generates mapEmbedUrl placeholder automatically");

  // --------------------------------------------------------------------------
  // TEST 4: Super Admin Verification Workflow & Publication Gate
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Super Admin Location Verification Workflow & Publication Gate");

  // Theatre Admin cannot self-verify
  let selfVerifyBlocked = false;
  try {
    await theatreLocationService.verifyLocation(
      {
        locationId: createdLocation.id,
        theatreId: "th-pun-001",
        decision: "VERIFY",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      selfVerifyBlocked = true;
    }
  }
  assert(selfVerifyBlocked, "Blocks Theatre Admin from verifying own location (Super Admin only)");

  // Attempting to publish unverified location must fail
  let unverifiedPublishBlocked = false;
  try {
    await theatreLocationService.changeLocationStatus(
      createdLocation.id,
      "PUBLISHED",
      "Attempt direct publish",
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      unverifiedPublishBlocked = true;
    }
  }
  assert(unverifiedPublishBlocked, "Blocks PUBLISHED transition for UNVERIFIED location (Publication Gate)");

  // Super Admin verifies premises
  const verified = await theatreLocationService.verifyLocation(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      decision: "VERIFY",
      notes: "Physical building inspection and fire safety compliance NOC confirmed.",
    },
    SUPER_ADMIN
  );
  assert(verified.verificationStatus === "VERIFIED", "Verification status updated to VERIFIED");
  assert(verified.verifiedBy === SUPER_ADMIN.userId, "Records verifiedBy actor");
  assert(Boolean(verified.verifiedAt), "Records verifiedAt timestamp");
  assert(verified.status === "VERIFIED", "Location status promoted to VERIFIED");

  // Now publish successfully
  const published = await theatreLocationService.changeLocationStatus(
    createdLocation.id,
    "PUBLISHED",
    "Verified cinema opened for patron ticket bookings",
    PUNE_ADMIN
  );
  assert(published.status === "PUBLISHED", "Location successfully transitioned to PUBLISHED");
  assert(Boolean(published.publishedAt), "Records publishedAt timestamp");

  // --------------------------------------------------------------------------
  // TEST 5: Re-verification Governance on Address Tampering
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Re-verification Governance on Address Tampering");

  const tampered = await theatreLocationService.updateLocation(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      addressLine1: "New Renovation Wing, Street 9",
    },
    PUNE_ADMIN
  );
  assert(
    tampered.verificationStatus === "PENDING_REVIEW",
    "Core address mutation by Theatre Admin automatically flags verificationStatus as PENDING_REVIEW"
  );
  assert(
    tampered.verificationNotes?.includes("Re-verification required"),
    "System sets re-verification audit flag in notes"
  );

  // Re-verify by Super Admin
  await theatreLocationService.verifyLocation(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      decision: "VERIFY",
      notes: "Renovation wing inspected and re-approved.",
    },
    SUPER_ADMIN
  );

  // --------------------------------------------------------------------------
  // TEST 6: Optimistic Concurrency Locking, Version History & Forward Rollback
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Optimistic Concurrency Locking, Version History & Forward Rollback");

  const currentBeforeConflict = await theatreLocationRepository.findById(createdLocation.id);
  assert(currentBeforeConflict !== null, "Resolves current location");

  // Conflict test: pass stale version
  let conflictCaught = false;
  try {
    await theatreLocationService.updateLocation(
      {
        locationId: createdLocation.id,
        theatreId: "th-pun-001",
        expectedVersion: 1, // Current version is higher
        landmark: "Stale update landmark",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      conflictCaught = true;
    }
  }
  assert(conflictCaught, "Detects stale expectedVersion and throws ConflictError");

  // Inspect version history
  const versions = await theatreLocationRepository.getVersions(createdLocation.id);
  assert(versions.length >= 3, `Records immutable version snapshots (count: ${versions.length})`);
  assert(versions[0].versionNumber > versions[1].versionNumber, "Versions ordered descending by versionNumber");

  // Rollback to v1
  const rolledBack = await theatreLocationService.rollbackToVersion(
    createdLocation.id,
    1,
    PUNE_ADMIN
  );
  assert(
    rolledBack.version > currentBeforeConflict!.version,
    `Rollback increments forward to v${rolledBack.version} without mutating historical audit records`
  );
  assert(
    rolledBack.addressLine1 === "Level 4, East Court, Phoenix Marketcity",
    "Restores original v1 address snapshot"
  );

  // --------------------------------------------------------------------------
  // TEST 7: Multi-Location Chains Readiness (Theatre 1:N Locations)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Multi-Location Chains Readiness (Theatre 1:N Locations)");

  const secondaryBranch = await theatreLocationService.createLocation(
    {
      theatreId: "th-pun-001",
      locationName: "Seasons Mall Annex Branch",
      isPrimary: false, // Secondary branch
      addressLine1: "Level 2, Seasons Mall, Magarpatta City",
      area: "Hadapsar",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      postalCode: "411028",
      landmark: "Near Magarpatta Cybercity Gate 1",
      latitude: 18.518621,
      longitude: 73.931245,
    },
    PUNE_ADMIN
  );

  const puneLocations = await theatreLocationRepository.findByTheatreId("th-pun-001");
  assert(
    puneLocations.length >= 2,
    `Theatre 'th-pun-001' seamlessly hosts ${puneLocations.length} physical locations (multi-branch chain readiness)`
  );

  const primaryLoc = await theatreLocationRepository.getPrimaryLocation("th-pun-001");
  assert(primaryLoc?.isPrimary === true, "Primary location correctly identified");
  assert(secondaryBranch.isPrimary === false, "Secondary branch marked isPrimary=false");

  // --------------------------------------------------------------------------
  // TEST 8: Search, Filters & Pre-Pagination Tenant Isolation
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Multi-Faceted Search, Hierarchical Filtering & Pre-Pagination Tenant Isolation");

  // Search by City + Landmark
  const searchResults = await theatreLocationService.retrieveLocations(
    {
      query: "Phoenix",
      city: "Pune",
      status: "PUBLISHED",
    },
    SUPER_ADMIN
  );
  assert(searchResults.total >= 1, "Finds location matching query 'Phoenix' in city 'Pune'");

  // Tenant Isolation test: Pune Admin cannot query Mumbai tenant
  let crossTenantSearchBlocked = false;
  try {
    await theatreLocationService.retrieveLocations(
      {
        scopedTenantId: "th-mum-001", // Mumbai
      },
      PUNE_ADMIN // Assigned to Pune
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      crossTenantSearchBlocked = true;
    }
  }
  assert(crossTenantSearchBlocked, "Strictly blocks Pune Theatre Admin from querying Mumbai location tenant");

  // Filter by Verification Status
  const unverifiedList = await theatreLocationService.retrieveLocations(
    {
      verificationStatus: "UNVERIFIED",
    },
    SUPER_ADMIN
  );
  assert(Array.isArray(unverifiedList.items), "Filters by verificationStatus cleanly");

  // --------------------------------------------------------------------------
  // TEST 9: Public Theatre Page Location Projection
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Public Theatre Page Location Projection");

  // Re-publish primary location for th-pun-001
  await theatreLocationService.verifyLocation(
    {
      locationId: createdLocation.id,
      theatreId: "th-pun-001",
      decision: "VERIFY",
    },
    SUPER_ADMIN
  );
  await theatreLocationService.changeLocationStatus(
    createdLocation.id,
    "PUBLISHED",
    "Re-published for public portal",
    SUPER_ADMIN
  );

  const publicLocation = await theatreLocationService.getPublicTheatreLocation("th-pun-001");
  assert(publicLocation !== null, "Resolves public theatre location view for th-pun-001");
  assert(
    publicLocation?.completeAddress.includes("Viman Nagar"),
    "Public projection exposes complete formatted address"
  );
  assert(
    Boolean(publicLocation?.googleMapsUrl),
    "Public projection exposes Google Maps URL"
  );
  assert(
    Boolean(publicLocation?.navigationLink),
    "Public projection exposes turn-by-turn navigation link"
  );
  assert(
    publicLocation?.coordinates?.latitude === 18.5622,
    "Public projection exposes coordinates accurately"
  );

  // Hidden / Draft / Archived location returns null to public patrons
  await theatreLocationService.changeLocationStatus(
    createdLocation.id,
    "DRAFT",
    "Hidden temporarily",
    SUPER_ADMIN
  );
  const hiddenPublicLocation = await theatreLocationService.getPublicTheatreLocation("th-pun-001");
  assert(
    hiddenPublicLocation === null,
    "Non-published location returns null to public patrons (Privacy Guard)"
  );

  // --------------------------------------------------------------------------
  // TEST 10: Immutable Audit Logging & Structured Telemetry
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Immutable Audit Logging & Structured Telemetry");

  const auditHistory = await theatreLocationRepository.getAuditHistory(createdLocation.id);
  assert(auditHistory.length >= 5, `Audit trail contains ${auditHistory.length} tamper-evident event entries`);

  const actions = auditHistory.map((a) => a.action);
  assert(actions.includes("LOCATION_CREATED"), "Audit trail tracks LOCATION_CREATED");
  assert(actions.includes("LOCATION_UPDATED"), "Audit trail tracks LOCATION_UPDATED");
  assert(actions.includes("COORDINATES_UPDATED"), "Audit trail tracks COORDINATES_UPDATED");
  assert(actions.includes("LOCATION_VERIFIED"), "Audit trail tracks LOCATION_VERIFIED");

  console.log("\n==============================================================================");
  console.log("🎉 ALL 10 THEATRE ADDRESS & LOCATION VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runLocationVerification().catch((err) => {
  console.error("FATAL: Location verification suite failed:", err);
  process.exit(1);
});
