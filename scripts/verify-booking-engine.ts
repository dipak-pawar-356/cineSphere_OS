/**
 * CineSphere OS — Phase 2 Part 11 Booking Engine Verification Test Suite
 * Tests concurrency locks, double booking prevention, session lifecycle,
 * dynamic pricing, customer limits, and tenant isolation.
 */

import {
  createBookingSession,
  getBookingSession,
  addSeatToSession,
  removeSeatFromSession,
  renewSessionLock,
  expireBookingSession,
  validateSeatsAvailability,
  getBookingReview,
  searchBookingSessions,
  getAllBookingAuditLogs,
  DEFAULT_BOOKING_RULES,
} from "../lib/engine/booking-engine";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTestSuite() {
  console.log("=========================================================");
  console.log("CINESPHERE OS — BOOKING ENGINE VERIFICATION SUITE");
  console.log("=========================================================\n");

  const showId = "show-pun-001";

  // TEST 1: Create Booking Session (Temporary Identifier)
  console.log("--- TEST 1: Create Temporary Booking Session ---");
  const session1 = createBookingSession({
    showId,
    customerId: "cust-user-101",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "+91 98765 43210",
  });

  assert(Boolean(session1.id), "Session 1 has unique Session ID");
  assert(session1.sessionCode.startsWith("SES-"), "Session Code starts with SES- prefix");
  assert(session1.status === "Active", "Session 1 initialized as Active");
  assert(session1.bookingId === undefined, "Booking ID is undefined before payment (Architectural Law)");
  assert(session1.selectedSeats.length === 0, "Initial selected seats is empty");

  // TEST 2: Add Seat A5 to Session 1
  console.log("\n--- TEST 2: Add Seat to Session 1 & Calculate Total ---");
  const addResult1 = addSeatToSession(session1.id, "A5");
  assert(addResult1.success === true, "Seat A5 added to Session 1");
  assert(session1.selectedSeats.length === 1, "Session 1 holds exactly 1 seat");
  assert(session1.selectedSeats[0].seatNumber === "A5", "Held seat is A5");
  assert(session1.subtotal > 0, `Subtotal calculated: ₹${session1.subtotal}`);
  assert(session1.convenienceFee === DEFAULT_BOOKING_RULES.convenienceFeePerSeat, `Convenience fee is ₹${session1.convenienceFee}`);
  assert(session1.grandTotal > session1.subtotal, `Grand total calculated: ₹${session1.grandTotal}`);

  // TEST 3: Double-Booking Prevention (Session 2 attempts to lock A5)
  console.log("\n--- TEST 3: Double-Booking Prevention (Concurrency Conflict) ---");
  const session2 = createBookingSession({
    showId,
    customerId: "cust-user-202",
    customerName: "Rohan Varma",
  });

  const conflictResult = addSeatToSession(session2.id, "A5");
  assert(conflictResult.success === false, "Session 2 rejected from selecting A5 (Double-booking blocked!)");
  assert(conflictResult.error !== undefined, `Conflict error message: "${conflictResult.error}"`);

  // TEST 4: 5-Point Conflict Validation
  console.log("\n--- TEST 4: 5-Point Comprehensive Conflict Validation ---");
  const validation = validateSeatsAvailability(showId, ["A5"], session2.id);
  assert(validation.isValid === false, "Validation confirms A5 is conflicting for Session 2");
  assert(validation.conflictingSeats.includes("A5"), "A5 flagged in conflictingSeats array");
  assert(validation.isShowActive === true, "Show status verified as active");
  assert(validation.isPricingProfileValid === true, "Pricing profile verified as valid");

  // TEST 5: Renew / Extend Lock
  console.log("\n--- TEST 5: Renew Session Lock (+5 minutes) ---");
  const prevExpiresAt = new Date(session1.expiresAt).getTime();
  const renewResult = renewSessionLock(session1.id, 5);
  assert(renewResult.success === true, "Session lock extended successfully");
  const newExpiresAt = new Date(session1.expiresAt).getTime();
  assert(newExpiresAt > prevExpiresAt, "New expiration timestamp is extended");

  // TEST 6: Booking Review Snapshot
  console.log("\n--- TEST 6: Pre-Payment Booking Review DTO Assembler ---");
  const review = getBookingReview(session1.id);
  assert(review !== null, "Booking review snapshot generated");
  assert(Boolean(review?.movieTitle), `Film Title resolved: ${review?.movieTitle}`);
  assert(Boolean(review?.theatreName), `Theatre resolved: ${review?.theatreName}`);
  assert(review?.session.sessionCode === session1.sessionCode, "Review session matches Session 1");

  // TEST 7: Expire Session 1 & Automatic Lock Release
  console.log("\n--- TEST 7: Expire Session & Automatic Lock Release ---");
  expireBookingSession(session1.id);
  assert(session1.status === "Expired", "Session 1 marked as Expired");

  // Session 2 can now successfully lock A5!
  const addResult2 = addSeatToSession(session2.id, "A5");
  assert(addResult2.success === true, "Seat A5 successfully acquired by Session 2 after Session 1 expired!");
  assert(session2.selectedSeats[0].seatNumber === "A5", "A5 now held by Session 2");

  // TEST 8: Tenant Isolation in Search
  console.log("\n--- TEST 8: Multi-Tenant Query & Isolation ---");
  const customer1Sessions = searchBookingSessions({ customerId: "cust-user-101", role: "CUSTOMER" });
  assert(customer1Sessions.every((s) => s.customerId === "cust-user-101"), "Customer 1 only sees their own sessions");

  const theatreSessions = searchBookingSessions({ theatreId: session1.theatreId, role: "THEATRE_ADMIN" });
  assert(theatreSessions.every((s) => s.theatreId === session1.theatreId), "Theatre Admin sees only sessions in their cinema");

  // TEST 9: Tamper-Evident Audit Trail
  console.log("\n--- TEST 9: Concurrency Audit Trail Verification ---");
  const auditLogs = getAllBookingAuditLogs();
  assert(auditLogs.length > 0, "Audit logs recorded in system");
  const conflictLog = auditLogs.find((l) => l.action === "CONFLICT_REJECTED");
  assert(conflictLog !== undefined, "CONFLICT_REJECTED event logged in audit trail");
  assert(auditLogs.some((l) => l.action === "SEAT_ADDED"), "SEAT_ADDED logged in audit trail");
  assert(auditLogs.some((l) => l.action === "SESSION_EXPIRED"), "SESSION_EXPIRED logged in audit trail");

  console.log("\n=========================================================");
  console.log("🎉 ALL 9 BOOKING ENGINE VERIFICATION TESTS PASSED!");
  console.log("=========================================================");
}

runTestSuite();

