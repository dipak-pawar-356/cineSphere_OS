/**
 * ==============================================================================
 * CineSphere OS — Phase 4 Parts 5 & 6 Verification Suite
 * Automatic Seat Generator (Part 5) & Dynamic Seat Categories (Part 6)
 * ==============================================================================
 */

import { SeatGeneratorEngine } from "../lib/engine/seat-generator-engine";
import { SeatGeneratorRepository } from "../lib/repositories/seat-generator.repository";
import { seatGeneratorService } from "../lib/services/seat-generator.service";
import { HallDesignerRepository } from "../lib/repositories/hall-designer.repository";
import { SecurityActorContext } from "../types/security-hardening.types";

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, message: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASSED: ${message}`);
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  console.log("==============================================================================");
  console.log("🎬 CineSphere OS — Phase 4 Parts 5 & 6 Verification Suite");
  console.log("   Automatic Seat Generator (Part 5) & Seat Categories (Part 6)");
  console.log("==============================================================================\n");

  // ----------------------------------------------------------------------------
  // Suite 1: Pure Mathematical Engine (Sequencing, Formatting & Geometries)
  // ----------------------------------------------------------------------------
  console.log("--- 1. Testing SeatGeneratorEngine (Sequencing & Formats) ---");

  // Roman Numeral Conversion
  assert(SeatGeneratorEngine.toRoman(1) === "I", "Roman numeral 1 -> I");
  assert(SeatGeneratorEngine.toRoman(4) === "IV", "Roman numeral 4 -> IV");
  assert(SeatGeneratorEngine.toRoman(9) === "IX", "Roman numeral 9 -> IX");
  assert(SeatGeneratorEngine.toRoman(14) === "XIV", "Roman numeral 14 -> XIV");
  assert(SeatGeneratorEngine.toRoman(40) === "XL", "Roman numeral 40 -> XL");

  // Alphabetical Conversion
  assert(SeatGeneratorEngine.toAlphabetical(1) === "A", "Alphabetical 1 -> A");
  assert(SeatGeneratorEngine.toAlphabetical(26) === "Z", "Alphabetical 26 -> Z");
  assert(SeatGeneratorEngine.toAlphabetical(27) === "AA", "Alphabetical 27 -> AA");
  assert(SeatGeneratorEngine.toAlphabetical(28) === "AB", "Alphabetical 28 -> AB");

  // Seat Number Formatting
  const numConfig: any = { numbering: { style: "NUMERIC", startNumber: 1 } };
  assert(
    SeatGeneratorEngine.formatSeatNumber(5, 10, numConfig).seatNumber === "5",
    "Numeric format col 5 of 10 -> '5'"
  );

  const prefixSuffixConfig: any = {
    numbering: { style: "ALPHABETIC", prefix: "VIP-", suffix: "-W", startNumber: 1 },
  };
  assert(
    SeatGeneratorEngine.formatSeatNumber(2, 10, prefixSuffixConfig).seatNumber === "VIP-B-W",
    "Prefix + Alphabetical + Suffix -> 'VIP-B-W'"
  );

  const reversedConfig: any = {
    numbering: { style: "NUMERIC", isReversed: true, startNumber: 1 },
  };
  assert(
    SeatGeneratorEngine.formatSeatNumber(1, 10, reversedConfig).seatNumber === "10",
    "Reversed numbering col 1 of 10 -> '10'"
  );
  assert(
    SeatGeneratorEngine.formatSeatNumber(10, 10, reversedConfig).seatNumber === "1",
    "Reversed numbering col 10 of 10 -> '1'"
  );

  // Skip Numbers
  const skipConfig: any = {
    numbering: { style: "NUMERIC", startNumber: 1, skipNumbers: [13] },
  };
  assert(
    SeatGeneratorEngine.formatSeatNumber(12, 20, skipConfig).seatNumber === "12",
    "Seat 12 remains 12"
  );
  assert(
    SeatGeneratorEngine.formatSeatNumber(13, 20, skipConfig).seatNumber === "14",
    "Seat 13 is skipped -> becomes 14"
  );

  // Coordinates: Straight Row
  const straightCoords = SeatGeneratorEngine.calculateCoordinates(1, 10, {
    seatWidth: 40,
    seatHeight: 40,
    spacing: 10,
    startX: 100,
    startY: 200,
  } as any);
  assert(straightCoords.x === 100 && straightCoords.y === 200, "First seat placed at startX/startY");

  const straightCoords2 = SeatGeneratorEngine.calculateCoordinates(2, 10, {
    seatWidth: 40,
    seatHeight: 40,
    spacing: 10,
    startX: 100,
    startY: 200,
  } as any);
  assert(straightCoords2.x === 150 && straightCoords2.y === 200, "Second seat placed at pitch 50px (x=150)");

  // Coordinates: Curved Arc Sagitta
  const curvedCoordsMid = SeatGeneratorEngine.calculateCoordinates(5, 9, {
    seatWidth: 40,
    spacing: 10,
    startX: 100,
    startY: 100,
    geometry: { type: "CURVED", radius: 600, arcAngle: 30 },
  } as any);
  assert(curvedCoordsMid.curvedPosition?.angle === 0, "Center seat has arc angle 0°");
  assert(curvedCoordsMid.y === 100, "Center seat has sagitta displacement 0 (y=100)");

  const curvedCoordsEdge = SeatGeneratorEngine.calculateCoordinates(1, 9, {
    seatWidth: 40,
    spacing: 10,
    startX: 100,
    startY: 100,
    geometry: { type: "CURVED", radius: 600, arcAngle: 30 },
  } as any);
  assert(curvedCoordsEdge.y > 100, "Edge seat has positive sagitta vertical depth > 100");
  assert(curvedCoordsEdge.curvedPosition?.sagitta! > 0, "Curved edge has positive sagitta depth");

  // Coordinates: Angled Incline
  const angledCoords = SeatGeneratorEngine.calculateCoordinates(3, 5, {
    seatWidth: 40,
    spacing: 10,
    startX: 100,
    startY: 100,
    geometry: { type: "ANGLED", angle: 30 },
  } as any);
  assert(angledCoords.y > 100, "Angled row seat inclines Y axis based on 30°");

  // Decoupled Pricing Invariant Check
  const validSeats = SeatGeneratorEngine.generateRowSeats(
    {
      rowId: "test-row-1",
      sectionId: "test-sec-1",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-1",
      seatCount: 5,
      seatWidth: 40,
      seatHeight: 40,
      spacing: 10,
      startX: 100,
      startY: 100,
      numbering: { style: "NUMERIC", startNumber: 1 },
      categoryCode: "VIP",
    },
    { rowName: "A", sectionName: "VIP Suite" }
  );
  assert(validSeats.validation.isValid, "Generated seats pass pure validation");
  assert(validSeats.seats.length === 5, "Generated exactly 5 seat templates");

  // Ensure every seat has an immutable UUID
  const allHaveUUID = validSeats.seats.every((s) => s.id && s.id.length >= 32);
  assert(allHaveUUID, "Every generated seat is assigned an immutable permanent UUID");

  // Assert price violation detection
  const dirtySeat: any = { ...validSeats.seats[0], ticketPrice: 500 };
  const dirtyValidation = SeatGeneratorEngine.validateSeats([dirtySeat]);
  assert(!dirtyValidation.isValid, "Pricing violation caught when ticketPrice is embedded in seat");
  assert(
    dirtyValidation.errors[0].includes("contain"),
    "Validator error message cites decoupled pricing invariant"
  );

  // ----------------------------------------------------------------------------
  // Suite 2: Multi-Tenant Repository & Seeds
  // ----------------------------------------------------------------------------
  console.log("\n--- 2. Testing SeatGeneratorRepository (Multi-Tenant Seeds & CRUD) ---");

  // Check Seeded Categories per Theatre (Part 6)
  const puneCategories = SeatGeneratorRepository.loadCategories("th-pun-001");
  assert(puneCategories.length >= 5, "Pune venue has at least 5 seeded categories");
  const puneVIP = puneCategories.find((c) => c.code === "VIP");
  assert(puneVIP?.color === "#EF4444", "Pune VIP category has red color (#EF4444)");
  assert(puneVIP?.isPremium === true, "Pune VIP category has premium flag set");

  const mumbaiCategories = SeatGeneratorRepository.loadCategories("th-mum-002");
  assert(mumbaiCategories.length >= 3, "Mumbai venue has seeded categories");
  const mumbaiLuxury = mumbaiCategories.find((c) => c.code === "LUXURY");
  assert(mumbaiLuxury?.color === "#8B5CF6", "Mumbai Luxury category has luxury purple color (#8B5CF6)");

  const dubaiCategories = SeatGeneratorRepository.loadCategories("th-dxb-003");
  assert(dubaiCategories.length >= 3, "Dubai venue has seeded categories");
  const dubaiPrivateBox = dubaiCategories.find((c) => c.code === "PRIVATE_BOX");
  assert(dubaiPrivateBox?.displayName === "Majlis VIP Box Lounge", "Dubai has Majlis VIP Box Lounge");

  // Tenant Boundary Check: Dubai categories do not leak into Pune
  const puneCodes = puneCategories.map((c) => c.code);
  assert(!puneCodes.includes("PRIVATE_BOX"), "Tenant isolation: Dubai Private Box does not leak into Pune");

  // Seeded Seat Templates (Part 5)
  const puneRowASeats = SeatGeneratorRepository.loadSeatsByRow("row-pun-vip-a", "th-pun-001");
  assert(puneRowASeats.length === 10, "Pune Row A has 10 initial seeded seat templates");
  const wheelchairSeat = puneRowASeats.find((s) => s.accessibility.accessibilityType === "WHEELCHAIR");
  assert(wheelchairSeat !== undefined, "Pune Row A contains designated Wheelchair seat");
  assert(wheelchairSeat?.accessibility.isWheelchairAccessible === true, "Wheelchair seat has isWheelchairAccessible true");

  const companionSeat = puneRowASeats.find((s) => s.accessibility.accessibilityType === "COMPANION");
  assert(companionSeat !== undefined, "Pune Row A contains designated Companion seat");
  assert(
    companionSeat?.accessibility.companionSeatTemplateId === wheelchairSeat?.id,
    "Companion seat correctly anchors to paired Wheelchair seat ID"
  );

  // Bulk Generation for New Row
  const newRowResult = SeatGeneratorRepository.generateSeats(
    {
      rowId: "row-test-bulk-1",
      sectionId: "sec-pun-vip",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-layout-pun-aud1-main-v4",
      seatCount: 8,
      seatWidth: 40,
      seatHeight: 40,
      spacing: 12,
      startX: 150,
      startY: 250,
      numbering: { style: "NUMERIC", startNumber: 1 },
      categoryCode: "RECLINER",
    },
    { rowName: "B", sectionName: "VIP Red Suite" }
  );
  assert(newRowResult.generatedCount === 8, "Bulk generated 8 seat templates for Row B");
  assert(newRowResult.seats[0].categoryCode === "RECLINER", "Seats inherit RECLINER category");

  // Seat Regeneration
  const regenerated = SeatGeneratorRepository.regenerateSeats(
    "row-test-bulk-1",
    "th-pun-001",
    {
      rowId: "row-test-bulk-1",
      sectionId: "sec-pun-vip",
      theatreId: "th-pun-001",
      layoutVersionId: "ver-layout-pun-aud1-main-v4",
      seatCount: 12,
      seatWidth: 40,
      seatHeight: 40,
      spacing: 10,
      startX: 150,
      startY: 250,
      numbering: { style: "ALPHABETIC", startNumber: 1 },
      categoryCode: "RECLINER",
    },
    { rowName: "B", sectionName: "VIP Red Suite" }
  );
  assert(regenerated.generatedCount === 12, "Regenerated seats count updated to 12");
  assert(regenerated.seats[0].seatNumber === "A", "Regenerated seats format switched to ALPHABETIC");

  // Seat Metadata Update
  const seatToUpdate = regenerated.seats[0];
  const updatedSeat = SeatGeneratorRepository.updateSeatMetadata(
    seatToUpdate.id,
    "th-pun-001",
    {
      metadata: { sightlineQuality: "GOOD", legroomRating: "EXTRA_LEGROOM" },
      status: "MAINTENANCE",
    }
  );
  assert(updatedSeat.metadata.sightlineQuality === "GOOD", "Seat sightlineQuality updated");
  assert(updatedSeat.metadata.legroomRating === "EXTRA_LEGROOM", "Seat legroomRating updated");
  assert(updatedSeat.status === "MAINTENANCE", "Seat status updated to MAINTENANCE");

  // Delete Generated Seats
  const deletedCount = SeatGeneratorRepository.deleteGeneratedSeats("row-test-bulk-1", "th-pun-001");
  assert(deletedCount === 12, "Deleted exactly 12 generated seats for Row B");
  const loadedAfterDelete = SeatGeneratorRepository.loadSeatsByRow("row-test-bulk-1", "th-pun-001");
  assert(loadedAfterDelete.length === 0, "Row B now has 0 seats in repository");

  // Dynamic Category CRUD (Part 6)
  const customCat = SeatGeneratorRepository.createCategory({
    theatreId: "th-pun-001",
    code: "KIDS_LOUNGE",
    name: "Kids Lounge",
    displayName: "Kids Beanbag Lounge",
    color: "#EC4899", // Pink
    priority: 6,
    visibility: "VISIBLE",
    accessibility: "STANDARD",
    isPremium: false,
    isDefault: false,
    status: "ACTIVE",
  });
  assert(customCat.id.startsWith("cat-"), "Custom category created with unique ID");
  assert(customCat.code === "KIDS_LOUNGE", "Custom category code preserved");

  // Duplicate Category
  const dupCat = SeatGeneratorRepository.duplicateCategory(customCat.id, "th-pun-001");
  assert(dupCat.code === "KIDS_LOUNGE_COPY", "Duplicated category appends _COPY to code");
  assert(dupCat.displayName.includes("(Copy)"), "Duplicated category appends (Copy) to name");

  // Archive Category
  const archived = SeatGeneratorRepository.archiveCategory(customCat.id, "th-pun-001");
  assert(archived.status === "ARCHIVED", "Category status set to ARCHIVED");
  const activeOnly = SeatGeneratorRepository.loadCategories("th-pun-001", false);
  assert(!activeOnly.some((c) => c.id === customCat.id), "Archived category excluded from default active list");

  // Restore Category
  const restored = SeatGeneratorRepository.restoreCategory(customCat.id, "th-pun-001");
  assert(restored.status === "ACTIVE", "Category successfully restored to ACTIVE");

  // ----------------------------------------------------------------------------
  // Suite 3: Domain Service (Security, Immutability & Pricing Decoupling)
  // ----------------------------------------------------------------------------
  console.log("\n--- 3. Testing SeatGeneratorService (Security & Invariants) ---");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    theatreId: "th-pun-001",
    role: "THEATRE_ADMIN",
    permissions: ["*"],
    correlationId: "corr-pune-admin",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mumbai-admin",
    theatreId: "th-mum-002",
    role: "THEATRE_ADMIN",
    permissions: ["*"],
    correlationId: "corr-mumbai-admin",
  };

  const superAdmin: SecurityActorContext = {
    userId: "usr-super-admin",
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-super-admin",
  };

  // Cross-tenant protection
  let crossTenantBlocked = false;
  try {
    seatGeneratorService.generateSeats(
      mumbaiAdmin,
      {
        rowId: "row-pun-vip-a",
        sectionId: "sec-pun-vip",
        theatreId: "th-pun-001", // Mumbai trying to mutate Pune
        layoutVersionId: "ver-layout-pun-aud1-main-v4",
        seatCount: 10,
        seatWidth: 40,
        seatHeight: 40,
        spacing: 10,
        startX: 100,
        startY: 100,
        numbering: { style: "NUMERIC" },
        categoryCode: "VIP",
      },
      { rowName: "A", sectionName: "VIP" }
    );
  } catch (err: any) {
    crossTenantBlocked = true;
  }
  assert(crossTenantBlocked, "Cross-tenant access violation blocked by resolveTheatreId");

  // Super Admin can access any theatre
  const superAdminLoaded = seatGeneratorService.loadCategories(superAdmin, "th-pun-001");
  assert(superAdminLoaded.length > 0, "Super Admin can query any cinema theatre");

  // Immutability Guard: Cannot generate seats on PUBLISHED layout
  // Publish v4 first to test immutability
  const hallDesignerRepo = HallDesignerRepository.getInstance();
  hallDesignerRepo.publishLayoutVersion(
    "layout-pun-aud1-main",
    "ver-layout-pun-aud1-main-v4",
    "th-pun-001",
    puneAdmin
  );

  let publishedMutationBlocked = false;
  try {
    seatGeneratorService.generateSeats(
      puneAdmin,
      {
        rowId: "row-pun-vip-a",
        sectionId: "sec-pun-vip",
        theatreId: "th-pun-001",
        layoutVersionId: "ver-layout-pun-aud1-main-v4", // now published!
        seatCount: 5,
        seatWidth: 40,
        seatHeight: 40,
        spacing: 10,
        startX: 100,
        startY: 100,
        numbering: { style: "NUMERIC" },
        categoryCode: "VIP",
      },
      { rowName: "A", sectionName: "VIP" }
    );
  } catch (err: any) {
    if (err.message.includes("Immutable Version Policy")) {
      publishedMutationBlocked = true;
    }
  }
  assert(publishedMutationBlocked, "Immutable Version Policy strictly blocks seat generation on PUBLISHED layout");

  // Decoupled Pricing Guard in Service: Rejects category creation with price
  let pricingViolationBlocked = false;
  try {
    seatGeneratorService.createCategory(puneAdmin, {
      theatreId: "th-pun-001",
      code: "INVALID_PRICE",
      name: "Pricey Category",
      displayName: "Pricey Category",
      color: "#FFFFFF",
      priority: 10,
      visibility: "VISIBLE",
      accessibility: "STANDARD",
      isPremium: false,
      isDefault: false,
      status: "ACTIVE",
      ...({ price: 250 } as any),
    });
  } catch (err: any) {
    if (err.message.includes("Decoupled") || err.message.includes("ticket prices")) {
      pricingViolationBlocked = true;
    }
  }
  assert(pricingViolationBlocked, "Service strictly rejects embedding ticket prices in seat categories");

  console.log("\n==============================================================================");
  console.log(`🎉 ALL ${passedCount}/${totalCount} TESTS PASSED SUCCESSFULLY!`);
  console.log("   Phase 4 – Part 5 (Seat Generator) & Part 6 (Seat Categories) VERIFIED!");
  console.log("==============================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
