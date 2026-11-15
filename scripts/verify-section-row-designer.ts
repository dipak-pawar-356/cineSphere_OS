/**
 * ==============================================================================
 * CineSphere OS — Section & Row Designer Verification Suite (Phase 4 – Parts 3 & 4)
 * ==============================================================================
 * Comprehensive test suite verifying:
 * 1. Part 3 (Section Designer):
 *    - Hierarchical DDD containment: Layout Definition ──► Section ──► Row ──► Seat
 *    - Section CRUD (create, read, update, delete, duplicate)
 *    - Geometries (RECTANGLE, CURVED, ARC, POLYGON, IRREGULAR)
 *    - Label positions (TOP, BOTTOM, LEFT, RIGHT, CENTER, HIDDEN)
 *    - Ordering & Priority (UP, DOWN, TOP, BOTTOM)
 *    - Seat Categories (Standard, Recliner, VIP, Couple, Wheelchair, Sofa)
 *    - Capacity Calculation & Parity Validation
 *    - Cascading row deletion
 * 2. Part 4 (Row Designer):
 *    - Rows belong strictly to Sections (never directly to Hall)
 *    - Auto-numbering strategies (ALPHABETICAL, NUMERIC, ROMAN, CUSTOM)
 *    - Reverse numbering, prefixes, and suffixes
 *    - Row geometries (STRAIGHT, CURVED, ARC, ANGLED)
 *    - Physical coordinate calculation & spacing
 *    - Row accessibility (STANDARD, WHEELCHAIR, COMPANION, RESERVED, etc.)
 *    - Row reordering and duplication
 * 3. Multi-Tenant Isolation & Immutability:
 *    - Independent venue configurations (Pune, Mumbai, Dubai)
 *    - Strict cross-tenant isolation enforcement
 *    - Immutable Version Policy: DRAFT allows mutations, PUBLISHED rejects mutations
 * ==============================================================================
 */

import { SectionRowEngine } from "../lib/engine/section-row-engine";
import { SectionRowValidator } from "../lib/engine/section-row-validator";
import { SectionRowRepository } from "../lib/repositories/section-row.repository";
import { sectionRowDesignerService } from "../lib/services/section-row-designer.service";
import { SecurityActorContext } from "../types/security-hardening.types";
import { HallSection, HallRow } from "../types/section-row-designer.types";
import { HallDesignerRepository } from "../lib/repositories/hall-designer.repository";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✅ PASSED: ${message}`);
}

async function runTestSuite() {
  console.log("==============================================================================");
  console.log("🎬 CineSphere OS — Phase 4 Parts 3 & 4 Verification Suite");
  console.log("   Section Designer (Part 3) & Row Designer (Part 4)");
  console.log("==============================================================================\n");

  const puneActor: SecurityActorContext = {
    userId: "usr-pune-admin",
    theatreId: "th-pun-001",
    role: "THEATRE_ADMIN",
    permissions: ["hall:manage", "layout:edit", "layout:publish"],
    correlationId: "corr-pune-test",
  };

  const mumbaiActor: SecurityActorContext = {
    userId: "usr-mum-admin",
    theatreId: "th-mum-002",
    role: "THEATRE_ADMIN",
    permissions: ["hall:manage", "layout:edit"],
    correlationId: "corr-mum-test",
  };

  const superAdminActor: SecurityActorContext = {
    userId: "usr-super-admin",
    theatreId: undefined,
    role: "SUPER_ADMIN",
    permissions: ["*"],
    correlationId: "corr-super-test",
  };

  // ============================================================================
  // SUITE 1: Pure Mathematical & Sequencing Engine (SectionRowEngine)
  // ============================================================================
  console.log("--- 1. Testing SectionRowEngine (Sequencing & Geometry) ---");

  // Roman Numeral Conversion
  assert(SectionRowEngine.toRoman(1) === "I", "Roman numeral 1 -> I");
  assert(SectionRowEngine.toRoman(4) === "IV", "Roman numeral 4 -> IV");
  assert(SectionRowEngine.toRoman(9) === "IX", "Roman numeral 9 -> IX");
  assert(SectionRowEngine.toRoman(14) === "XIV", "Roman numeral 14 -> XIV");
  assert(SectionRowEngine.toRoman(20) === "XX", "Roman numeral 20 -> XX");

  // Alphabetical Labeling
  assert(SectionRowEngine.toAlphabetical(1) === "A", "Alphabetical 1 -> A");
  assert(SectionRowEngine.toAlphabetical(26) === "Z", "Alphabetical 26 -> Z");
  assert(SectionRowEngine.toAlphabetical(27) === "AA", "Alphabetical 27 -> AA");
  assert(SectionRowEngine.toAlphabetical(28) === "AB", "Alphabetical 28 -> AB");

  // Seat Number Generation
  assert(
    SectionRowEngine.generateSeatNumber("A", 1, 10, { numberingStrategy: "ALPHABETICAL", isReversed: false, startIndex: 1, endIndex: 10 }) === "A1",
    "Seat number generation: Alphabetical Row A, Seat 1 -> A1"
  );
  assert(
    SectionRowEngine.generateSeatNumber("Row", 5, 10, { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 10 }) === "Row-5",
    "Seat number generation: Numeric Row, Seat 5 -> 'Row-5'"
  );
  assert(
    SectionRowEngine.generateSeatNumber("B", 3, 10, { numberingStrategy: "ROMAN", isReversed: false, startIndex: 1, endIndex: 10 }) === "BIII",
    "Seat number generation: Roman Row B, Seat 3 -> 'BIII'"
  );
  assert(
    SectionRowEngine.generateSeatNumber("A", 1, 10, { numberingStrategy: "ALPHABETICAL", isReversed: true, startIndex: 1, endIndex: 10 }) === "A10",
    "Seat number generation: Reversed Alphabetical index 1 of 10 -> 'A10'"
  );
  assert(
    SectionRowEngine.generateSeatNumber("A", 2, 10, { numberingStrategy: "ALPHABETICAL", isReversed: false, startIndex: 1, endIndex: 10, prefix: "VIP-" }) === "VIP-A2",
    "Seat number generation: Prefix 'VIP-' + A2 -> 'VIP-A2'"
  );
  assert(
    SectionRowEngine.generateSeatNumber("A", 4, 10, { numberingStrategy: "ALPHABETICAL", isReversed: false, startIndex: 1, endIndex: 10, suffix: "-W" }) === "A4-W",
    "Seat number generation: Suffix '-W' + A4 -> 'A4-W'"
  );

  // Physical Seat Coordinates: Straight Row
  const straightRow: HallRow = {
    id: "row-test-1",
    sectionId: "sec-test-1",
    theatreId: "th-pun-001",
    rowName: "A",
    displayName: "Row A",
    sequence: 1,
    seatCount: 10,
    spacing: 35,
    rotation: 0,
    visibility: "VISIBLE",
    accessibility: "STANDARD",
    geometry: { geometryType: "STRAIGHT" },
    configuration: { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 10 },
    seats: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const straightSeats = SectionRowEngine.calculateRowSeats(
    "sec-test-1",
    straightRow,
    { x: 100, y: 200 },
    "Standard"
  );
  assert(straightSeats.length === 10, "Straight row generated 10 seats");
  assert(straightSeats[0].coordinates.x === 100 && straightSeats[0].coordinates.y === 200, "First seat placed at row start position");
  assert(straightSeats[1].coordinates.x > straightSeats[0].coordinates.x, "Consecutive seats increment X horizontally");
  assert(straightSeats[9].seatNumber === "A-10", "Last seat has correct seatNumber 'A-10'");

  // Physical Seat Coordinates: Curved Row
  const curvedRow: HallRow = {
    id: "row-test-2",
    sectionId: "sec-test-1",
    theatreId: "th-pun-001",
    rowName: "B",
    displayName: "Row B",
    sequence: 2,
    seatCount: 8,
    spacing: 35,
    rotation: 0,
    visibility: "VISIBLE",
    accessibility: "STANDARD",
    geometry: { geometryType: "CURVED", curveRadius: 600 },
    configuration: { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 8 },
    seats: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const curvedSeats = SectionRowEngine.calculateRowSeats(
    "sec-test-1",
    curvedRow,
    { x: 100, y: 300 },
    "VIP"
  );
  assert(curvedSeats.length === 8, "Curved row generated 8 seats");
  assert(curvedSeats[0].seatType === "VIP", "Curved seats inherit section category VIP");
  // Middle seats have lower Y than endpoints due to upward curvature
  const midSeatY = curvedSeats[3].coordinates.y;
  const edgeSeatY = curvedSeats[0].coordinates.y;
  assert(midSeatY !== edgeSeatY, "Curved row seats have varying Y coordinates conforming to arc");

  // Physical Seat Coordinates: Angled Row
  const angledRow: HallRow = {
    id: "row-test-3",
    sectionId: "sec-test-1",
    theatreId: "th-pun-001",
    rowName: "C",
    displayName: "Row C",
    sequence: 3,
    seatCount: 6,
    spacing: 35,
    rotation: 0,
    visibility: "VISIBLE",
    accessibility: "STANDARD",
    geometry: { geometryType: "ANGLED", angle: 15 },
    configuration: { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 6 },
    seats: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const angledSeats = SectionRowEngine.calculateRowSeats(
    "sec-test-1",
    angledRow,
    { x: 100, y: 400 },
    "Recliner"
  );
  assert(angledSeats.length === 6, "Angled row generated 6 seats");
  assert(angledSeats[5].coordinates.y !== angledSeats[0].coordinates.y, "Angled row inclines Y based on angle parameter");

  // Section Reordering Logic
  const mockSections: HallSection[] = [
    { id: "s1", displayOrder: 1, name: "Sec 1" } as any,
    { id: "s2", displayOrder: 2, name: "Sec 2" } as any,
    { id: "s3", displayOrder: 3, name: "Sec 3" } as any,
  ];
  const reorderedDown = SectionRowEngine.reorderSections(mockSections, "s1", "DOWN");
  assert(reorderedDown[0].id === "s2" && reorderedDown[1].id === "s1", "Reordering section s1 DOWN swaps with s2");

  const reorderedBottom = SectionRowEngine.reorderSections(mockSections, "s1", "BOTTOM");
  assert(reorderedBottom[reorderedBottom.length - 1].id === "s1", "Reordering section s1 BOTTOM places it last");

  // ============================================================================
  // SUITE 2: Section & Row Validation Engine (SectionRowValidator)
  // ============================================================================
  console.log("\n--- 2. Testing SectionRowValidator (Integrity Checks) ---");

  const validSections: HallSection[] = [
    {
      id: "sec-1",
      name: "VIP Lounge",
      internalCode: "SEC-VIP",
      capacity: 10,
      geometry: { shapeType: "RECTANGLE" },
      rows: [
        { id: "r1", rowName: "A", seatCount: 10, spacing: 30, sequence: 1 } as any,
      ],
    } as any,
  ];
  const secValidation = SectionRowValidator.validateSections(validSections);
  assert(secValidation.isValid, "Valid section passes SectionRowValidator");
  assert(secValidation.errors.length === 0, "No errors on valid section");

  // Duplicate Section Names Check
  const duplicateSections: HallSection[] = [
    { id: "sec-1", name: "VIP", internalCode: "SEC-1", capacity: 5, geometry: { shapeType: "RECTANGLE" }, rows: [] } as any,
    { id: "sec-2", name: "VIP", internalCode: "SEC-2", capacity: 5, geometry: { shapeType: "RECTANGLE" }, rows: [] } as any,
  ];
  const dupValidation = SectionRowValidator.validateSections(duplicateSections);
  assert(!dupValidation.isValid, "Duplicate section names rejected");
  assert(dupValidation.summary.duplicateSectionNames.includes("VIP"), "Flags duplicate section name 'VIP'");

  // Duplicate Row Names Check
  const duplicateRows: HallRow[] = [
    { id: "r1", rowName: "A", sequence: 1, seatCount: 10, spacing: 30 } as any,
    { id: "r2", rowName: "A", sequence: 2, seatCount: 10, spacing: 30 } as any,
  ];
  const rowValidation = SectionRowValidator.validateRows("sec-1", duplicateRows);
  assert(!rowValidation.isValid, "Duplicate row name 'A' within same section rejected");
  assert(rowValidation.summary.duplicateRowNames.includes("A"), "Flags duplicate row name in summary");

  // Invalid Row Spacing Check
  const invalidSpacingRows: HallRow[] = [
    { id: "r1", rowName: "A", sequence: 1, seatCount: 10, spacing: -5 } as any,
  ];
  const spacingValidation = SectionRowValidator.validateRows("sec-1", invalidSpacingRows);
  assert(!spacingValidation.isValid, "Negative row spacing rejected");

  // ============================================================================
  // SUITE 3: SectionRowRepository & Multi-Tenant Seeds
  // ============================================================================
  console.log("\n--- 3. Testing SectionRowRepository (Multi-Tenant Seeds & CRUD) ---");

  const repo = SectionRowRepository.getInstance();

  // Verify Pune Venue Seed Data
  const puneSections = repo.listSectionsByVersion("ver-layout-pun-aud1-main-v4", "th-pun-001");
  assert(puneSections.length === 3, "Pune venue has 3 seeded sections (VIP, Executive, Standard)");
  const puneVip = puneSections.find((s) => s.internalCode === "SEC-VIP-RED");
  assert(puneVip !== undefined, "Pune has Section VIP Red");
  assert(puneVip?.color === "#EF4444", "Pune Section VIP Red has red color (#EF4444)");
  assert(puneVip?.seatCategory === "VIP", "Pune Section VIP Red has category VIP");
  assert(puneVip?.rows.length === 3, "Pune Section VIP Red contains Rows A, B, C");
  assert(puneVip?.rows[0].spacing === 35, "Pune Section VIP Red row spacing is 35px (~1.0m)");

  // Verify Mumbai Venue Seed Data
  const mumbaiSections = repo.listSectionsByVersion("ver-layout-mum-aud1-v1", "th-mum-002");
  assert(mumbaiSections.length === 2, "Mumbai venue has 2 seeded sections (Premium Left & Right)");
  const mumbaiLeft = mumbaiSections.find((s) => s.internalCode === "SEC-PREM-LEFT");
  assert(mumbaiLeft !== undefined, "Mumbai has Premium Left Luxury Purple");
  assert(mumbaiLeft?.color === "#8B5CF6", "Mumbai Premium Left has purple color (#8B5CF6)");
  assert(mumbaiLeft?.rows[0].configuration.numberingStrategy === "NUMERIC", "Mumbai uses Numeric row numbering (1-20)");

  // Verify Dubai Venue Seed Data
  const dubaiSections = repo.listSectionsByVersion("ver-layout-dxb-aud1-v1", "th-dxb-003");
  assert(dubaiSections.length === 2, "Dubai venue has 2 seeded sections (Balcony East & West)");
  const dubaiEast = dubaiSections.find((s) => s.internalCode === "SEC-BALC-EAST");
  assert(dubaiEast !== undefined, "Dubai has Balcony East Economy Blue");
  assert(dubaiEast?.rows[0].configuration.numberingStrategy === "CUSTOM", "Dubai uses custom double-letter row convention (AA-AZ)");

  // Multi-Tenant Isolation
  const crossTenantSections = repo.listSectionsByVersion("ver-layout-pun-aud1-main-v4", "th-mum-002");
  assert(crossTenantSections.length === 0, "Mumbai admin querying Pune layout version gets zero results (isolated)");

  // Section CRUD: Create Section
  const createdSection = repo.createSection(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v4",
      theatreId: "th-pun-001",
      name: "Balcony Suite",
      displayName: "Balcony Suite Prime",
      internalCode: "SEC-BALC-PRIME",
      color: "#EC4899",
      seatCategory: "VIP",
      capacity: 20,
      priority: 1,
      displayOrder: 4,
      rotation: 0,
      position: { x: 100, y: 700 },
      visibility: "VISIBLE",
      geometry: { shapeType: "CURVED", curvatureRadius: 750, arcAngle: 45 },
      labelPosition: "TOP",
    },
    puneActor
  );
  assert(createdSection.id.startsWith("sec-"), "Created section receives unique ID");
  assert(createdSection.name === "Balcony Suite", "Created section preserves name");
  assert(createdSection.geometry.shapeType === "CURVED", "Created section preserves curved geometry");

  // Section CRUD: Update Section
  const updatedSection = repo.updateSection(
    createdSection.id,
    "th-pun-001",
    { displayName: "Updated Balcony Suite", color: "#F43F5E" },
    puneActor
  );
  assert(updatedSection.displayName === "Updated Balcony Suite", "Section display name successfully updated");
  assert(updatedSection.color === "#F43F5E", "Section color successfully updated");

  // Row CRUD: Create Row under Section
  const createdRow = repo.createRow(
    {
      sectionId: createdSection.id,
      theatreId: "th-pun-001",
      rowName: "VIP-1",
      displayName: "VIP Row 1",
      sequence: 1,
      seatCount: 10,
      spacing: 40,
      rotation: 0,
      visibility: "VISIBLE",
      accessibility: "WHEELCHAIR",
      geometry: { geometryType: "CURVED", curveRadius: 700 },
      configuration: { numberingStrategy: "NUMERIC", isReversed: false, startIndex: 1, endIndex: 10 },
    },
    puneActor
  );
  assert(createdRow.id.startsWith("row-"), "Created row receives unique ID");
  assert(createdRow.rowName === "VIP-1", "Created row preserves rowName");
  assert(createdRow.accessibility === "WHEELCHAIR", "Created row has wheelchair accessibility");
  assert(createdRow.seats.length === 10, "Created row calculates and embeds 10 seats");

  // Section Duplicate
  const duplicatedSection = repo.duplicateSection(createdSection.id, "th-pun-001", puneActor);
  assert(duplicatedSection.id !== createdSection.id, "Duplicated section has distinct ID");
  assert(duplicatedSection.name.includes("(Copy)"), "Duplicated section appends '(Copy)' to name");
  assert(duplicatedSection.rows.length === 1, "Duplicated section duplicates contained rows");
  assert(duplicatedSection.rows[0].id !== createdRow.id, "Duplicated row has fresh distinct ID");

  // Cascading Row Deletion on Section Delete
  const deleted = repo.deleteSection(createdSection.id, "th-pun-001", puneActor);
  assert(deleted === true, "Section deleted successfully");
  assert(repo.getRowById(createdRow.id, "th-pun-001") === undefined, "Cascading delete: Contained row is removed");

  // Clean up duplicated section
  repo.deleteSection(duplicatedSection.id, "th-pun-001", puneActor);

  // ============================================================================
  // SUITE 4: Domain Service & Immutability Enforcement
  // ============================================================================
  console.log("\n--- 4. Testing SectionRowDesignerService (Security & Immutability) ---");

  // Cross-tenant access violation rejection
  try {
    sectionRowDesignerService.listSections(mumbaiActor, "ver-layout-pun-aud1-main-v4", "th-pun-001");
    assert(false, "Should have thrown cross-tenant error");
  } catch (err: any) {
    assert(err.message.includes("Cross-tenant access violation"), "Rejects cross-tenant access from Mumbai to Pune");
  }

  // Immutability enforcement: mutations rejected on PUBLISHED layouts
  // Setup a published version in hall designer repo
  const hallDesignerRepo = HallDesignerRepository.getInstance();
  const testDef = hallDesignerRepo.createLayoutDefinition(
    { theatreId: "th-pun-001", hallId: "hall-pun-aud1", name: "Immutability Test Layout" },
    puneActor
  );
  // Publish it
  const draftVersion = hallDesignerRepo
    .listVersionsByDefinition(testDef.id, "th-pun-001")
    .find((v) => v.status === "DRAFT");
  assert(draftVersion !== undefined, "Draft version exists for test layout");
  const publishResult = hallDesignerRepo.publishLayoutVersion(testDef.id, draftVersion!.id, "th-pun-001", puneActor);
  const publishedVersion = publishResult.publishedVersion;
  assert(publishedVersion.status === "PUBLISHED", "Layout version is PUBLISHED and immutable");

  // Attempting to create a section on a PUBLISHED layout version must fail
  try {
    sectionRowDesignerService.createSection(puneActor, {
      layoutVersionId: publishedVersion.id,
      theatreId: "th-pun-001",
      name: "Forbidden Section",
      displayName: "Forbidden",
      internalCode: "SEC-FORBIDDEN",
      color: "#000000",
      seatCategory: "Standard",
      capacity: 10,
      priority: 1,
      displayOrder: 1,
      rotation: 0,
      position: { x: 0, y: 0 },
      visibility: "VISIBLE",
      geometry: { shapeType: "RECTANGLE" },
      labelPosition: "TOP",
    });
    assert(false, "Should have thrown immutable version error");
  } catch (err: any) {
    assert(err.message.includes("Immutable Version Policy"), "Rejects section creation on PUBLISHED layout");
  }

  // Row reordering in draft layout
  const rowsInVip = repo.listRowsBySection("sec-pun-vip-001", "th-pun-001");
  assert(rowsInVip.length === 3, "VIP section has 3 rows initially");
  const reorderedRows = sectionRowDesignerService.reorderRows(puneActor, "sec-pun-vip-001", "row-pun-vip-A", "DOWN");
  assert(reorderedRows[0].rowName === "B", "Row B moved to top sequence after Row A moved DOWN");

  // Revert reorder
  sectionRowDesignerService.reorderRows(puneActor, "sec-pun-vip-001", "row-pun-vip-A", "UP");

  // Auto Sort Section Reordering
  const unSortedSections: HallSection[] = [
    { id: "s-low", priority: 3, name: "Z Economy", displayOrder: 1, rows: [] } as any,
    { id: "s-high", priority: 1, name: "A VIP", displayOrder: 2, rows: [] } as any,
  ];
  const autoSorted = SectionRowEngine.reorderSections(unSortedSections, "s-low", "AUTO_SORT");
  assert(autoSorted[0].id === "s-high", "AUTO_SORT prioritizes higher tier (priority 1 before priority 3)");
  assert(autoSorted[0].displayOrder === 1, "AUTO_SORT normalizes display order sequence");

  // Metadata verification on section and row
  const sectionWithMetadata = repo.createSection(
    {
      layoutVersionId: "ver-layout-pun-aud1-main-v4",
      theatreId: "th-pun-001",
      name: "Dolby Atmos Terrace",
      displayName: "Dolby Atmos 360 Terrace",
      internalCode: "SEC-ATMOS-TERRACE",
      color: "#06B6D4",
      seatCategory: "VIP",
      capacity: 15,
      priority: 1,
      displayOrder: 5,
      rotation: 0,
      position: { x: 200, y: 800 },
      visibility: "VISIBLE",
      geometry: { shapeType: "CURVED", curvatureRadius: 800 },
      labelPosition: "CENTER",
      metadata: { soundZone: "OVERHEAD_ATMOS", tags: ["Premium", "Terrace"] },
    },
    puneActor
  );
  assert(sectionWithMetadata.metadata?.soundZone === "OVERHEAD_ATMOS", "Section metadata soundZone persisted");
  assert(sectionWithMetadata.metadata?.tags?.includes("Terrace") === true, "Section metadata tags array persisted");

  // Clean up
  repo.deleteSection(sectionWithMetadata.id, "th-pun-001", puneActor);

  // Summary
  console.log("\n==============================================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("   Phase 4 – Part 3 (Section Designer) & Part 4 (Row Designer) VERIFIED!");
  console.log("==============================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
