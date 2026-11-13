/**
 * ==============================================================================
 * CineSphere OS — Phase 3 Part 5 Theatre Amenities Verification Suite
 * ==============================================================================
 * Comprehensive verification of the global Amenity Catalog, Dynamic Categories,
 * Tenant-scoped Assignments, Availability Modes, Facility Metadata, Reordering,
 * Cross-Tenant Isolation, Public Projections, and Immutable Audit Versioning.
 * ==============================================================================
 */

import { theatreAmenityService } from "@/lib/services/theatre-amenity.service";
import { theatreAmenityRepository } from "@/lib/repositories/theatre-amenity.repository";
import {
  ValidationError,
  AuthorizationError,
  ConflictError,
  TenantAccessError,
} from "@/lib/errors";
import type { SecurityActorContext } from "@/types/security-hardening.types";

const SUPER_ADMIN: SecurityActorContext = {
  userId: "usr-super-1",
  role: "SUPER_ADMIN",
  permissions: ["ALL"],
  correlationId: "corr-am-super",
};

const PUNE_ADMIN: SecurityActorContext = {
  userId: "usr-th-pun",
  role: "THEATRE_ADMIN",
  theatreId: "th-pun-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-am-pune",
};

const MUMBAI_ADMIN: SecurityActorContext = {
  userId: "usr-th-mum",
  role: "THEATRE_ADMIN",
  theatreId: "th-mum-001",
  permissions: ["THEATRE_ADMIN"],
  correlationId: "corr-am-mum",
};

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runAmenityVerification() {
  console.log("\n==============================================================================");
  console.log("🛋️  CineSphere OS — Phase 3 Part 5 Theatre Amenities Verification Suite");
  console.log("==============================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Master Catalog & Dynamic Category Hierarchy
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 1: Master Catalog & Dynamic Category Hierarchy");

  const categories = await theatreAmenityService.listCategories();
  assert(categories.length >= 10, `Loaded ${categories.length} dynamic categories (min 10)`);
  const catCodes = categories.map((c) => c.code);
  assert(catCodes.includes("technology"), "Category 'technology' exists");
  assert(catCodes.includes("comfort"), "Category 'comfort' exists");
  assert(catCodes.includes("accessibility"), "Category 'accessibility' exists");
  assert(catCodes.includes("food-beverage"), "Category 'food-beverage' exists");
  assert(catCodes.includes("premium-experience"), "Category 'premium-experience' exists");
  assert(catCodes.includes("transportation"), "Category 'transportation' exists");
  assert(catCodes.includes("family"), "Category 'family' exists");
  assert(catCodes.includes("utilities"), "Category 'utilities' exists");
  assert(catCodes.includes("entertainment"), "Category 'entertainment' exists");
  assert(catCodes.includes("safety"), "Category 'safety' exists");

  const catalog = await theatreAmenityService.getCatalogItems({ pageSize: 50 });
  assert(catalog.items.length >= 20, `Loaded ${catalog.items.length} master catalog amenities (min 20)`);

  // Create a new dynamic category
  const newCat = await theatreAmenityService.createCategory(
    {
      code: "wellness",
      name: "Wellness & Health",
      displayName: "Wellness & Sanitization",
      description: "Health screening, contact-free services, and air purification facilities.",
      defaultIcon: "ShieldCheck",
      displayOrder: 11,
    },
    SUPER_ADMIN
  );
  assert(newCat.code === "wellness", "Super Admin dynamically created 'wellness' category without schema changes");

  // Create a new master catalog amenity
  const newAmenity = await theatreAmenityService.createCatalogItem(
    {
      code: "air-purifier",
      name: "Medical Grade Air Purification",
      displayName: "HEPA-14 & UV-C Air Filtration",
      description: "Continuous hospital-grade air turnover eliminating 99.97% of airborne particulates.",
      categoryId: newCat.id,
      defaultIcon: "ShieldCheck",
      priority: "HIGH",
      isFeatured: false,
      displayOrder: 21,
      localizedNames: { hi: "वायु शोधन प्रणाली", mr: "हवा शुद्धीकरण यंत्रणा" },
    },
    SUPER_ADMIN
  );
  assert(newAmenity.code === "air-purifier", "Super Admin created 'air-purifier' catalog amenity");
  assert(newAmenity.categoryCode === "wellness", "Correctly linked to dynamic category 'wellness'");
  assert(newAmenity.localizedNames.hi === "वायु शोधन प्रणाली", "Persisted multilingual localization names");

  // --------------------------------------------------------------------------
  // TEST 2: Role-Based Access Control (RBAC) & Governance Guard
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 2: Role-Based Access Control (RBAC) & Governance Guard");

  let theatreAdminBlockedFromCatalog = false;
  try {
    await theatreAmenityService.createCatalogItem(
      {
        code: "unauthorized-item",
        name: "Unauthorized Item",
        categoryId: newCat.id,
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof AuthorizationError) {
      theatreAdminBlockedFromCatalog = true;
    }
  }
  assert(theatreAdminBlockedFromCatalog, "Blocks Theatre Admin from modifying global Amenity Catalog");

  let invalidCodeCaught = false;
  try {
    await theatreAmenityService.createCatalogItem(
      {
        code: "INVALID CODE WITH SPACES!",
        name: "Invalid Code Test",
        categoryId: newCat.id,
      },
      SUPER_ADMIN
    );
  } catch (err) {
    if (err instanceof ValidationError) {
      invalidCodeCaught = true;
    }
  }
  assert(invalidCodeCaught, "Rejects uppercase and space-containing amenity codes with ValidationError");

  // --------------------------------------------------------------------------
  // TEST 3: Theatre Amenity Assignment & Availability Modes (Capability #1)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 3: Theatre Amenity Assignment & Availability Modes (Capability #1)");

  const assignment = await theatreAmenityService.assignAmenityToTheatre(
    {
      theatreId: "th-pun-001",
      amenityId: newAmenity.id,
      availability: "AVAILABLE",
      notes: "Installed in all 8 auditoriums and VIP waiting foyer.",
      displayOrder: 8,
      visibility: "PUBLIC",
      isFeatured: true,
    },
    PUNE_ADMIN
  );
  assert(assignment.theatreId === "th-pun-001", "Assigned amenity to theatre th-pun-001");
  assert(assignment.availability === "AVAILABLE", "Initial availability set to AVAILABLE");
  assert(assignment.isFeatured === true, "Marked as featured theatre amenity");

  // Update availability mode to TEMPORARILY_UNAVAILABLE
  const tempUnavail = await theatreAmenityService.updateTheatreAmenity(
    {
      assignmentId: assignment.id,
      theatreId: "th-pun-001",
      availability: "TEMPORARILY_UNAVAILABLE",
      notes: "Undergoing bi-monthly filter replacement cycle.",
    },
    PUNE_ADMIN
  );
  assert(
    tempUnavail.availability === "TEMPORARILY_UNAVAILABLE",
    "Transitioned availability to TEMPORARILY_UNAVAILABLE"
  );

  // Update availability mode to UNDER_MAINTENANCE
  const underMaint = await theatreAmenityService.updateTheatreAmenity(
    {
      assignmentId: assignment.id,
      theatreId: "th-pun-001",
      availability: "UNDER_MAINTENANCE",
    },
    PUNE_ADMIN
  );
  assert(underMaint.availability === "UNDER_MAINTENANCE", "Transitioned availability to UNDER_MAINTENANCE");

  // Restore to AVAILABLE
  const restored = await theatreAmenityService.updateTheatreAmenity(
    {
      assignmentId: assignment.id,
      theatreId: "th-pun-001",
      availability: "AVAILABLE",
      notes: "Fully operational with fresh HEPA-14 filters.",
    },
    PUNE_ADMIN
  );
  assert(restored.availability === "AVAILABLE", "Restored availability back to AVAILABLE");

  // --------------------------------------------------------------------------
  // TEST 4: Facility Metadata & Custom Specifications
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 4: Facility Metadata & Custom Specifications");

  // Assign Parking with facility metadata
  const parkingAssignment = await theatreAmenityService.assignAmenityToTheatre(
    {
      theatreId: "th-pun-001",
      amenityId: "am-cat-013", // kids-zone
      availability: "AVAILABLE",
      notes: "Located on Level 3 adjacent to Food Court.",
      displayOrder: 9,
      metadata: {
        waitingAreaDetails: "Air-conditioned arcade alcove with capacity for 40 children.",
        customAttributes: { ageGroup: "3-12 years", supervisorOnDuty: true },
      },
    },
    PUNE_ADMIN
  );
  assert(Boolean(parkingAssignment.metadata), "Facility metadata attached to assignment");
  assert(
    parkingAssignment.metadata?.waitingAreaDetails?.includes("capacity for 40 children"),
    "Waiting area details persisted accurately"
  );
  assert(
    Boolean(parkingAssignment.metadata?.customAttributes?.supervisorOnDuty),
    "Custom facility attributes persisted"
  );

  // --------------------------------------------------------------------------
  // TEST 5: Optimistic Concurrency Control & Version Conflict
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 5: Optimistic Concurrency Control & Version Conflict");

  let conflictCaught = false;
  try {
    await theatreAmenityService.updateTheatreAmenity(
      {
        assignmentId: assignment.id,
        theatreId: "th-pun-001",
        expectedVersion: 1, // Stale version (current is v4)
        notes: "Concurrent conflicting edit",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof ConflictError) {
      conflictCaught = true;
    }
  }
  assert(conflictCaught, "Detected stale expectedVersion and rejected with ConflictError");

  // --------------------------------------------------------------------------
  // TEST 6: Sequential Reordering & Contiguous Display Sequences
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 6: Sequential Reordering & Contiguous Display Sequences");

  const existingAssignments = await theatreAmenityService.getTheatreAmenities("th-pun-001", undefined, PUNE_ADMIN);
  const reorderedIds = existingAssignments.map((a) => a.id).reverse();

  const reordered = await theatreAmenityService.reorderTheatreAmenities(
    {
      theatreId: "th-pun-001",
      orderedAssignmentIds: reorderedIds,
    },
    PUNE_ADMIN
  );
  assert(reordered.length === existingAssignments.length, `Reordered ${reordered.length} assignments`);
  assert(reordered[0].id === reorderedIds[0], "First item updated to target ID");
  assert(reordered[0].displayOrder === 1, "First item assigned displayOrder 1");

  // --------------------------------------------------------------------------
  // TEST 7: Cross-Tenant Isolation & Pre-Pagination Security
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 7: Cross-Tenant Isolation & Pre-Pagination Security");

  let crossTenantAssignmentBlocked = false;
  try {
    // Pune Admin attempts to assign amenity to Mumbai theatre
    await theatreAmenityService.assignAmenityToTheatre(
      {
        theatreId: "th-mum-001",
        amenityId: "am-cat-001",
      },
      PUNE_ADMIN
    );
  } catch (err) {
    if (err instanceof TenantAccessError) {
      crossTenantAssignmentBlocked = true;
    }
  }
  assert(crossTenantAssignmentBlocked, "Strictly blocks Pune Theatre Admin from assigning to Mumbai theatre");

  let crossTenantUpdateBlocked = false;
  try {
    // Mumbai Admin attempts to modify Pune assignment
    await theatreAmenityService.updateTheatreAmenity(
      {
        assignmentId: assignment.id,
        theatreId: "th-mum-001", // Wrong tenant
        notes: "Malicious cross-tenant override",
      },
      MUMBAI_ADMIN
    );
  } catch (err) {
    if (err instanceof AuthorizationError || err instanceof TenantAccessError) {
      crossTenantUpdateBlocked = true;
    }
  }
  assert(crossTenantUpdateBlocked, "Strictly blocks Mumbai Theatre Admin from mutating Pune assignment");

  // --------------------------------------------------------------------------
  // TEST 8: Multi-Faceted Search, Dynamic Category Filtering & Pagination
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 8: Multi-Faceted Search, Dynamic Category Filtering & Pagination");

  const techAmenities = await theatreAmenityService.getTheatreAmenities(
    "th-pun-001",
    { categoryCode: "technology" },
    PUNE_ADMIN
  );
  assert(techAmenities.length >= 1, `Found ${techAmenities.length} technology amenities`);
  techAmenities.forEach((item) => {
    assert(item.amenity.categoryCode === "technology", `Item '${item.amenity.displayName}' is in category 'technology'`);
  });

  const bundle = await theatreAmenityService.getTheatreAmenityBundle("th-pun-001", PUNE_ADMIN);
  assert(bundle.totalAssigned >= 7, `Bundle totalAssigned is ${bundle.totalAssigned}`);
  assert(bundle.activeCount >= 7, `Bundle activeCount is ${bundle.activeCount}`);
  assert(bundle.categories.length >= 10, "Bundle includes dynamic category catalog");

  // --------------------------------------------------------------------------
  // TEST 9: Public Patron Projection, Active-Only Visibility & Privacy Guard
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 9: Public Patron Projection, Active-Only Visibility & Privacy Guard");

  // Hide the assignment from public view
  await theatreAmenityService.updateTheatreAmenity(
    {
      assignmentId: assignment.id,
      theatreId: "th-pun-001",
      visibility: "HIDDEN",
    },
    PUNE_ADMIN
  );

  let publicAmenities = await theatreAmenityService.getPublicTheatreAmenities("th-pun-001");
  const hiddenItem = publicAmenities.find((a) => a.assignmentId === assignment.id);
  assert(hiddenItem === undefined, "HIDDEN amenity is excluded from public patron projection");

  // Restore visibility to PUBLIC
  await theatreAmenityService.updateTheatreAmenity(
    {
      assignmentId: assignment.id,
      theatreId: "th-pun-001",
      visibility: "PUBLIC",
    },
    PUNE_ADMIN
  );

  publicAmenities = await theatreAmenityService.getPublicTheatreAmenities("th-pun-001");
  const visibleItem = publicAmenities.find((a) => a.assignmentId === assignment.id);
  assert(visibleItem !== undefined, "PUBLIC amenity is exposed to public patron projection");
  assert(visibleItem?.name === "Medical Grade Air Purification", "Public projection exposes amenity name");
  assert(visibleItem?.category === "Wellness & Sanitization", "Public projection exposes human-readable category");

  // --------------------------------------------------------------------------
  // TEST 10: Immutable Version Ledger & Audit Logging
  // --------------------------------------------------------------------------
  console.log("\n👉 Test 10: Immutable Version Ledger & Audit Logging");

  const versions = await theatreAmenityRepository.getVersionHistory({ theatreId: "th-pun-001" });
  assert(versions.length >= 4, `Recorded ${versions.length} immutable version history snapshots`);

  const changeTypes = versions.map((v) => v.changeType);
  assert(changeTypes.includes("THEATRE_ASSIGNED"), "Version history tracks THEATRE_ASSIGNED");
  assert(changeTypes.includes("THEATRE_UPDATED"), "Version history tracks THEATRE_UPDATED");

  // Cleanly remove the test assignment
  await theatreAmenityService.removeTheatreAmenity(assignment.id, "th-pun-001", PUNE_ADMIN);
  const postRemove = await theatreAmenityService.getTheatreAmenities("th-pun-001", undefined, PUNE_ADMIN);
  const stillExists = postRemove.some((a) => a.id === assignment.id);
  assert(!stillExists, "Amenity assignment removed cleanly from theatre");

  const postRemoveVersions = await theatreAmenityRepository.getVersionHistory({ theatreId: "th-pun-001" });
  assert(
    postRemoveVersions.some((v) => v.changeType === "THEATRE_REMOVED"),
    "Version history tracks THEATRE_REMOVED deletion event"
  );

  console.log("\n==============================================================================");
  console.log("🎉 ALL 10 THEATRE AMENITIES & FACILITIES VERIFICATION SUITES PASSED FLAWLESSLY!");
  console.log("==============================================================================\n");
}

runAmenityVerification().catch((err) => {
  console.error("FATAL: Amenity verification suite failed:", err);
  process.exit(1);
});
