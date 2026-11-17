/**
 * ==============================================================================
 * CineSphere OS — Phase 4 – Part 13: Seat Inventory Integration Verification Suite
 * ==============================================================================
 * Automated test runner verifying immutable seat inventory snapshots,
 * deterministic internal seat IDs, dynamic pricing resolution, existing show
 * isolation, booking state transitions, and multi-tenant inventory policies.
 * ==============================================================================
 */

import { seatInventoryIntegrationService } from "../lib/services/seat-inventory-integration.service";
import { SeatInventoryIntegrationRepository } from "../lib/repositories/seat-inventory-integration.repository";
import { SeatInventoryEngine } from "../lib/engine/seat-inventory-engine";
import { SecurityActorContext } from "../types/security-hardening.types";
import {
  generateInventoryAction,
  regenerateInventoryAction,
  syncInventoryAction,
  loadInventoryAction,
  validateInventoryAction,
  mapInventoryToShowAction,
  updateSeatInventoryStatusAction,
  loadInventoryConfigAction,
  saveInventoryConfigAction,
} from "../actions/seat-inventory-integration-actions";

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string): void {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runSeatInventoryVerification() {
  console.log("\n==================================================================");
  console.log("STARTING PHASE 4 – PART 13: SEAT INVENTORY INTEGRATION VERIFICATION");
  console.log("==================================================================\n");

  const puneAdmin: SecurityActorContext = {
    userId: "usr-pune-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-pun-001",
    permissions: ["hall:manage", "inventory:manage"],
    correlationId: "corr-pune-inv-test",
  };

  const mumbaiAdmin: SecurityActorContext = {
    userId: "usr-mum-admin",
    role: "THEATRE_ADMIN",
    theatreId: "th-mum-002",
    permissions: ["hall:manage", "inventory:manage"],
    correlationId: "corr-mum-inv-test",
  };

  const testShowId = "show-pun-matinee-101";

  // ----------------------------------------------------------------------------
  // Section 1: Immutable Seat Inventory Blueprint Generation
  // ----------------------------------------------------------------------------
  console.log("--- Section 1: Blueprint Generation from Published Layout ---");
  const { header, items } = await seatInventoryIntegrationService.generateInventory(
    puneAdmin,
    {
      theatreId: "th-pun-001",
      showId: testShowId,
      hallId: "hall-pun-aud1",
    }
  );

  assert(header.showId === testShowId, "Generated inventory matches show ID");
  assert(header.totalSeats === 100, `Inventory tracks exactly 100 seats (Found: ${header.totalSeats})`);
  assert(header.availableSeats === 100, "All seats initialized as AVAILABLE");
  assert(header.bookedSeats === 0, "Initial booked seats count is 0");
  assert(items.length === 100, "Items list contains 100 seat records");
  assert(header.status === "ACTIVE", "Inventory status is ACTIVE");

  // ----------------------------------------------------------------------------
  // Section 2: Deterministic Internal Seat IDs
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 2: Deterministic Internal Seat IDs ---");
  const id1 = SeatInventoryEngine.generateInternalSeatId("th-pun-001", testShowId, "sec-pun-std", "A", 1);
  const id2 = SeatInventoryEngine.generateInternalSeatId("th-pun-001", testShowId, "sec-pun-std", "A", 1);
  const idDiff = SeatInventoryEngine.generateInternalSeatId("th-pun-001", testShowId, "sec-pun-std", "A", 2);

  assert(id1 === id2, "Internal Seat ID generation is 100% deterministic");
  assert(id1 !== idDiff, "Different seat positions produce distinct internal seat IDs");
  assert(items[0].internalSeatId.startsWith("seat-"), "Internal seat ID follows canonical prefix");

  // ----------------------------------------------------------------------------
  // Section 3: Dynamic Non-Hardcoded Pricing Resolution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 3: Dynamic Non-Hardcoded Pricing Resolution ---");
  const stdSeat = items.find((i) => i.displaySeatNumber === "B5");
  assert(Boolean(stdSeat), "Found standard seat B5");
  assert(stdSeat!.basePrice > 0, `Seat B5 has valid positive base price (₹${stdSeat!.basePrice})`);
  assert(stdSeat!.calculatedPrice > stdSeat!.basePrice, "Calculated price includes convenience fee and GST");
  assert(stdSeat!.currency === "INR", "Seat uses INR currency");

  const vipSeat = items.find((i) => i.seatCategoryName?.toLowerCase().includes("vip") || i.isRecliner);
  if (vipSeat) {
    assert(vipSeat.basePrice >= stdSeat!.basePrice, "VIP seat base price is >= standard seat base price");
  }

  // ----------------------------------------------------------------------------
  // Section 4: Existing Show Isolation (Core Invariant)
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 4: Existing Show Isolation (Immutability Invariant) ---");
  // Modify an item in the existing show to BOOKED
  await seatInventoryIntegrationService.updateSeatStatus(puneAdmin, {
    showId: testShowId,
    internalSeatId: items[0].internalSeatId,
    status: "BOOKED",
    theatreId: "th-pun-001",
    bookingId: "bk-test-001",
    ticketId: "tkt-test-001",
  });

  const updatedShowInv = await seatInventoryIntegrationService.loadInventory(puneAdmin, testShowId, "th-pun-001");
  assert(updatedShowInv.header.bookedSeats === 1, "Show 101 recorded 1 booked seat");

  // Attempt to regenerate show 101 - MUST BE REJECTED because it has active bookings!
  let regenerationBlocked = false;
  try {
    await seatInventoryIntegrationService.regenerateInventory(puneAdmin, {
      theatreId: "th-pun-001",
      showId: testShowId,
      reason: "Emergency redesign",
    });
  } catch (err: any) {
    regenerationBlocked = err.name === "ConflictError" || err.message.includes("active ticket booking");
  }
  assert(regenerationBlocked, "Regeneration strictly rejected for show with active ticket bookings");

  // Verify historical seat remains booked
  const verifiedItems = updatedShowInv.items;
  assert(verifiedItems[0].status === "BOOKED", "Booked seat remains BOOKED and intact");

  // ----------------------------------------------------------------------------
  // Section 5: Maintenance Seat Blocking
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 5: Maintenance Seat Blocking ---");
  const maintSeat = await seatInventoryIntegrationService.updateSeatStatus(puneAdmin, {
    showId: testShowId,
    internalSeatId: items[5].internalSeatId,
    status: "MAINTENANCE",
    theatreId: "th-pun-001",
  });
  assert(maintSeat.status === "MAINTENANCE", "Seat successfully marked as MAINTENANCE");

  const reloadedHeader = (await seatInventoryIntegrationService.loadInventory(puneAdmin, testShowId, "th-pun-001")).header;
  assert(reloadedHeader.maintenanceSeats === 1, "Header tracks 1 maintenance seat");

  // ----------------------------------------------------------------------------
  // Section 6: Multi-Tenant Governance Policies
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 6: Multi-Tenant Governance Policies ---");
  const puneConfig = await seatInventoryIntegrationService.getConfiguration(puneAdmin, "th-pun-001");
  assert(puneConfig.generationMode === "AUTOMATIC", "Pune uses AUTOMATIC inventory generation");
  assert(puneConfig.maintenanceSeatsEnabled === true, "Pune has maintenance seats enabled");

  const mumConfig = await seatInventoryIntegrationService.getConfiguration(mumbaiAdmin, "th-mum-002");
  assert(mumConfig.generationMode === "MANUAL_APPROVAL", "Mumbai uses MANUAL_APPROVAL generation");
  assert(mumConfig.maintenanceSeatsEnabled === false, "Mumbai has maintenance seats disabled");

  // Cross-tenant access rejected
  let crossTenantBlocked = false;
  try {
    await seatInventoryIntegrationService.loadInventory(mumbaiAdmin, testShowId, "th-pun-001");
  } catch (err: any) {
    crossTenantBlocked = err.name === "TenantAccessError" || err.message.includes("Security Violation");
  }
  assert(crossTenantBlocked, "Cross-tenant access blocked with TenantAccessError");

  // ----------------------------------------------------------------------------
  // Section 7: Protected Server Actions Execution
  // ----------------------------------------------------------------------------
  console.log("\n--- Section 7: Protected Server Actions Execution ---");
  const actLoad = await loadInventoryAction(
    { theatreId: "th-pun-001", showId: testShowId },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoad.success === true, "loadInventoryAction executed cleanly");
  assert(actLoad.data?.items.length === 100, "Action loaded 100 inventory items");

  const actValidate = await validateInventoryAction(
    { theatreId: "th-pun-001", showId: testShowId },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actValidate.success === true, "validateInventoryAction executed cleanly");
  assert(actValidate.data?.isValid === true, "Validation confirmed inventory integrity");

  const actSync = await syncInventoryAction(
    { theatreId: "th-pun-001", targetShowIds: [testShowId, "show-pun-evening-102"] },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSync.success === true, "syncInventoryAction executed cleanly");
  assert(actSync.data?.skippedShowIds.includes(testShowId) === true, "Sync skipped existing show 101 to protect inventory");

  const actLoadConfig = await loadInventoryConfigAction(
    { theatreId: "th-pun-001" },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actLoadConfig.success === true, "loadInventoryConfigAction executed cleanly");

  const actSaveConfig = await saveInventoryConfigAction(
    { theatreId: "th-pun-001", defaultLockDurationSeconds: 720 },
    { role: "THEATRE_ADMIN", theatreId: "th-pun-001" }
  );
  assert(actSaveConfig.success === true, "saveInventoryConfigAction executed cleanly");
  assert(actSaveConfig.data?.defaultLockDurationSeconds === 720, "Updated lock duration to 720s");

  console.log("\n==================================================================");
  console.log("SEAT INVENTORY INTEGRATION VERIFICATION COMPLETED");
  console.log(`Passed: ${passedAssertions} | Failed: 0`);
  console.log("==================================================================\n");
}

runSeatInventoryVerification().catch((err) => {
  console.error("FATAL ERROR IN SEAT INVENTORY VERIFICATION:", err);
  process.exit(1);
});
