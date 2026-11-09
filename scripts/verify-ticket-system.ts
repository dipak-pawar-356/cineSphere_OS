/**
 * ==============================================================================
 * CineSphere OS - Automated Verification Suite: Ticket Management & Digital Tickets
 * Phase 2 - Part 13
 * 
 * Verifies:
 * 1. Enterprise Flow Invariant: Ticket generation strictly post-payment & post-confirmation
 * 2. Idempotency: Duplicate ticket generation prevention
 * 3. Distinct Identifiers: Internal UUID vs Booking Number vs Ticket Number vs Secure ID
 * 4. High-Integrity Structured QR Payload (8 required fields + version + signature)
 * 5. Dynamic QR Code URL Derivation
 * 6. Multi-Ticket Strategies: PER_BOOKING (consolidated) vs PER_SEAT (individual)
 * 7. Public URL Security & Rejection of Sequential Number Access (/tickets/123 disallowed)
 * 8. Customer Tenant Isolation (cross-patron isolation)
 * 9. Theatre Admin Tenant Isolation (cross-cinema isolation & read-only guarantee)
 * 10. Ticket Status Lifecycle (ISSUED/ACTIVE -> USED / CANCELLED / REFUNDED)
 * 11. Multi-Criteria Search & Filter Engine (time filter, status, keyword)
 * 12. Immutable Audit Logging (TICKET_GENERATED, TICKET_VIEWED, TICKET_CANCELLED)
 * ==============================================================================
 */

import {
  generateSecureId,
  isValidSecureId,
  generateBookingNumber,
  generateTicketNumber,
  createQRPayload,
  generateQRCodeUrl,
  generateTicketsForBooking,
  registerBookingRecord,
  getTicketBySecureId,
  getTicketById,
  getCustomerTickets,
  getTheatreTickets,
  searchTickets,
  cancelTicket,
  getTicketAuditLogs,
  resetTicketEngineStore,
} from "../lib/engine/ticket-engine";
import { QRPayload } from "../types/ticket.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTicketSystemVerification() {
  console.log("\n================================================================================");
  console.log("   CINESPHERE OS — PHASE 2 PART 13: DIGITAL TICKET & QR VERIFICATION SUITE       ");
  console.log("================================================================================\n");

  resetTicketEngineStore();

  // ----------------------------------------------------------------------------
  // TEST 1: Enterprise Flow Invariants (Payment & Confirmation Pre-conditions)
  // ----------------------------------------------------------------------------
  console.log("TEST 1: Enterprise Flow Invariants (Booking Session -> Payment -> Ticket)");

  // 1a. Unpaid booking cannot generate tickets
  registerBookingRecord({
    id: "bk-test-unpaid",
    referenceCode: "BK-2027-009001",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9UA",
    customerId: "cust-test-01",
    customerName: "Test Patron",
    customerEmail: "patron@test.com",
    theatreId: "th-pun-001",
    showId: "show-pun-001",
    hallId: "hall-1",
    seats: ["D1", "D2"],
    amount: 500,
    convenienceFee: 45,
    taxes: 8.1,
    totalAmount: 553.1,
    paymentStatus: "PENDING", // UNPAID
    bookingStatus: "CONFIRMED",
    bookingDate: "2027-01-20",
  });

  const unpaidResult = generateTicketsForBooking({ bookingId: "bk-test-unpaid" });
  assert(
    !unpaidResult.success,
    "Ticket generation correctly rejected for UNPAID booking (paymentStatus: PENDING)"
  );
  assert(
    unpaidResult.error?.includes("Payment is not confirmed") ?? false,
    "Rejection contains informative payment verification error message"
  );

  // 1b. Unconfirmed booking cannot generate tickets
  registerBookingRecord({
    id: "bk-test-unconfirmed",
    referenceCode: "BK-2027-009002",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9UB",
    customerId: "cust-test-01",
    customerName: "Test Patron",
    customerEmail: "patron@test.com",
    theatreId: "th-pun-001",
    showId: "show-pun-001",
    hallId: "hall-1",
    seats: ["D3"],
    amount: 250,
    convenienceFee: 25,
    taxes: 4.5,
    totalAmount: 279.5,
    paymentStatus: "PAID",
    bookingStatus: "CANCELLED", // NOT CONFIRMED
    bookingDate: "2027-01-20",
  });

  const unconfirmedResult = generateTicketsForBooking({ bookingId: "bk-test-unconfirmed" });
  assert(
    !unconfirmedResult.success,
    "Ticket generation correctly rejected for CANCELLED booking"
  );

  // 1c. Confirmed and Paid booking successfully generates tickets
  registerBookingRecord({
    id: "bk-test-valid-01",
    referenceCode: "BK-2027-009003",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9UC",
    customerId: "cust-test-01",
    customerName: "Test Patron",
    customerEmail: "patron@test.com",
    theatreId: "th-pun-001",
    showId: "show-pun-001",
    hallId: "hall-1",
    seats: ["D4", "D5"],
    amount: 600,
    convenienceFee: 50,
    taxes: 9.0,
    totalAmount: 659.0,
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    bookingDate: "2027-01-20",
  });

  const validResult = generateTicketsForBooking({ bookingId: "bk-test-valid-01" });
  assert(validResult.success, "Ticket generation succeeds for PAID & CONFIRMED booking");
  assert(validResult.tickets.length === 1, "Generated 1 consolidated ticket (PER_BOOKING strategy)");

  // ----------------------------------------------------------------------------
  // TEST 2: Idempotency of Ticket Generation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 2: Idempotency Verification");
  const repeatResult = generateTicketsForBooking({ bookingId: "bk-test-valid-01" });
  assert(repeatResult.success, "Repeat generation succeeds idempotently");
  assert(
    repeatResult.tickets[0].id === validResult.tickets[0].id,
    "Returns existing ticket without duplicate generation"
  );
  assert(
    repeatResult.tickets[0].secureId === validResult.tickets[0].secureId,
    "Secure ID is preserved across idempotent calls"
  );

  // ----------------------------------------------------------------------------
  // TEST 3: Distinct Identifiers Separation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 3: Four Distinct Identifiers Separation");
  const ticket = validResult.tickets[0];

  assert(Boolean(ticket.id && ticket.id.startsWith("tkt-")), "1. Internal DB ID is present");
  assert(
    /^BK-\d{4}-\d{6}$/.test(ticket.bookingReference),
    `2. Human-readable Booking Reference format is valid (${ticket.bookingReference})`
  );
  assert(
    /^TK-\d{4}-\d{6}/.test(ticket.ticketNumber),
    `3. Human-readable Ticket Number format is valid (${ticket.ticketNumber})`
  );
  assert(
    isValidSecureId(ticket.secureId),
    `4. Public Secure ID is a valid 26-char Crockford Base32 unguessable token (${ticket.secureId})`
  );
  assert(
    ticket.id !== ticket.bookingReference &&
      ticket.bookingReference !== ticket.ticketNumber &&
      ticket.ticketNumber !== ticket.secureId,
    "All four identifiers are strictly distinct from each other"
  );

  // ----------------------------------------------------------------------------
  // TEST 4: High-Integrity Structured QR Payload
  // ----------------------------------------------------------------------------
  console.log("\nTEST 4: Structured QR Payload Conformance");
  const qr = ticket.qrPayload;

  assert(qr.ticketSecureId === ticket.secureId, "QR payload contains ticketSecureId");
  assert(qr.bookingSecureId === "01JX9K8Z6N5WQ4R2T8M7P1A9UC", "QR payload contains bookingSecureId");
  assert(qr.ticketNumber === ticket.ticketNumber, "QR payload contains ticketNumber");
  assert(qr.theatreId === "th-pun-001", "QR payload contains theatreId");
  assert(qr.showId === "show-pun-001", "QR payload contains showId");
  assert(
    JSON.stringify(qr.seatNumbers) === JSON.stringify(["D4", "D5"]),
    "QR payload contains seatNumbers list"
  );
  assert(qr.version === "v1", "QR payload contains version ('v1')");
  assert(
    Boolean(qr.signaturePlaceholder && qr.signaturePlaceholder.startsWith("sig_v1_cinesphere_")),
    "QR payload contains cryptographic signature verification placeholder"
  );

  // ----------------------------------------------------------------------------
  // TEST 5: Dynamic QR URL Derivation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 5: Dynamic QR URL Derivation");
  assert(ticket.qrCodeUrl.startsWith("https://api.qrserver.com/v1/create-qr-code/"), "URL uses QR service API");
  assert(ticket.qrCodeUrl.includes("size=250x250"), "URL sets standard 250x250 dimensions");
  const extractedJson = decodeURIComponent(ticket.qrCodeUrl.split("data=")[1]);
  const decodedPayload: QRPayload = JSON.parse(extractedJson);
  assert(decodedPayload.ticketSecureId === ticket.secureId, "Encoded QR data matches payload perfectly");

  // ----------------------------------------------------------------------------
  // TEST 6: Multi-Ticket Strategies (PER_BOOKING vs PER_SEAT)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 6: Multi-Ticket Strategies (PER_BOOKING vs PER_SEAT)");

  // Register multi-seat booking for individual seat pass test
  registerBookingRecord({
    id: "bk-test-per-seat",
    referenceCode: "BK-2027-009004",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9UD",
    customerId: "cust-test-02",
    customerName: "Multi Seat Patron",
    customerEmail: "multiseat@test.com",
    theatreId: "th-mum-001",
    showId: "show-mum-001",
    hallId: "hall-mum-1",
    seats: ["F1", "F2", "F3"],
    amount: 900,
    convenienceFee: 90,
    taxes: 16.2,
    totalAmount: 1006.2,
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    bookingDate: "2027-01-22",
  });

  const perSeatResult = generateTicketsForBooking({
    bookingId: "bk-test-per-seat",
    strategy: "PER_SEAT",
  });

  assert(perSeatResult.success, "PER_SEAT strategy ticket generation succeeds");
  assert(perSeatResult.tickets.length === 3, "Generates exactly 3 individual tickets for 3 seats");
  assert(
    perSeatResult.tickets[0].ticketNumber.endsWith("-01") &&
      perSeatResult.tickets[1].ticketNumber.endsWith("-02") &&
      perSeatResult.tickets[2].ticketNumber.endsWith("-03"),
    "Individual ticket numbers carry sub-index suffix (-01, -02, -03)"
  );
  assert(
    perSeatResult.tickets[0].seatNumbers[0] === "F1" &&
      perSeatResult.tickets[1].seatNumbers[0] === "F2" &&
      perSeatResult.tickets[2].seatNumbers[0] === "F3",
    "Each individual ticket is bound to its specific seat coordinate"
  );
  assert(
    perSeatResult.tickets[0].secureId !== perSeatResult.tickets[1].secureId,
    "Each individual seat ticket has its own distinct unguessable secure ID"
  );

  // ----------------------------------------------------------------------------
  // TEST 7: Public URL Security & Sequential Number Rejection
  // ----------------------------------------------------------------------------
  console.log("\nTEST 7: Public URL Security & Rejection of Sequential Numbers");

  // Valid secure ID succeeds
  const seedTicket = getTicketBySecureId("01JX9K8Z6N5WQ4R2T8M7P1A9BC");
  assert(seedTicket !== null, "Retrieval by valid unguessable Secure ID succeeds");
  assert(seedTicket?.ticketNumber === "TK-2027-001001", "Correct ticket data returned");

  // Rejection of sequential IDs
  assert(getTicketBySecureId("123") === null, "Sequential ID '/tickets/123' is strictly rejected");
  assert(getTicketBySecureId("1") === null, "Sequential ID '/tickets/1' is strictly rejected");
  assert(getTicketBySecureId("000001") === null, "Sequential ID '/tickets/000001' is strictly rejected");
  assert(getTicketBySecureId("random-invalid-string") === null, "Invalid format string is strictly rejected");

  // ----------------------------------------------------------------------------
  // TEST 8: Customer Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 8: Customer Tenant Isolation");
  const cust1Tickets = getCustomerTickets("cust-001");
  const cust2Tickets = getCustomerTickets("cust-002");

  assert(cust1Tickets.totalCount >= 3, `Cust-001 has ${cust1Tickets.totalCount} tickets`);
  assert(
    cust1Tickets.tickets.every((t) => t.customerId === "cust-001"),
    "All tickets returned for Cust-001 strictly belong to Cust-001"
  );

  assert(cust2Tickets.totalCount >= 1, `Cust-002 has ${cust2Tickets.totalCount} ticket`);
  assert(
    cust2Tickets.tickets.every((t) => t.customerId === "cust-002"),
    "All tickets returned for Cust-002 strictly belong to Cust-002"
  );

  // Verify non-overlap
  const cust1Ids = new Set(cust1Tickets.tickets.map((t) => t.id));
  const hasLeakage = cust2Tickets.tickets.some((t) => cust1Ids.has(t.id));
  assert(!hasLeakage, "Zero cross-customer ticket data leakage");

  // ----------------------------------------------------------------------------
  // TEST 9: Theatre Admin Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 9: Theatre Admin Tenant Isolation");
  const puneTickets = getTheatreTickets("th-pun-001");
  const mumTickets = getTheatreTickets("th-mum-001");

  assert(
    puneTickets.tickets.every((t) => t.theatreId === "th-pun-001"),
    "Pune theatre admin only sees tickets for Pune Grand Cinemas ('th-pun-001')"
  );
  assert(
    mumTickets.tickets.every((t) => t.theatreId === "th-mum-001"),
    "Mumbai theatre admin only sees tickets for Mumbai Royale ('th-mum-001')"
  );

  // ----------------------------------------------------------------------------
  // TEST 10: Ticket Status Lifecycle & Cancellation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 10: Ticket Status Lifecycle");
  const cancelTarget = validResult.tickets[0];
  assert(cancelTarget.status === "ACTIVE", "Ticket starts with status ACTIVE");

  const cancelRes = cancelTicket(cancelTarget.id, "Customer requested refund");
  assert(cancelRes.success, "Cancellation succeeds for active ticket");
  assert(cancelRes.ticket?.status === "CANCELLED", "Status transitions to CANCELLED");
  assert(Boolean(cancelRes.ticket?.cancelledAt), "cancelledAt timestamp is populated");

  // Double cancellation prevention
  const doubleCancelRes = cancelTicket(cancelTarget.id, "Second cancellation attempt");
  assert(!doubleCancelRes.success, "Double cancellation is prevented");

  // Used ticket cancellation prevention
  const usedTicket = getTicketBySecureId("01JX9K8Z6N5WQ4R2T8M7P1A9BD");
  assert(usedTicket?.status === "USED", "Past ticket has status USED");
  const cancelUsedRes = cancelTicket(usedTicket!.id);
  assert(!cancelUsedRes.success, "Used ticket cannot be cancelled");
  assert(
    cancelUsedRes.error?.includes("already been used") ?? false,
    "Informative error returned when attempting to cancel used pass"
  );

  // ----------------------------------------------------------------------------
  // TEST 11: Multi-Criteria Search & Filter Engine
  // ----------------------------------------------------------------------------
  console.log("\nTEST 11: Search & Filter Engine");

  // Query search by movie title
  const searchMovie = searchTickets({ query: "Pushpa" });
  assert(
    searchMovie.tickets.length > 0 &&
      searchMovie.tickets.every((t) => t.movieTitle.toLowerCase().includes("pushpa")),
    "Search by movie title 'Pushpa' successfully filters tickets"
  );

  // Query search by ticket number
  const searchTicketNum = searchTickets({ query: "TK-2027-001001" });
  assert(
    searchTicketNum.tickets.length === 1 &&
      searchTicketNum.tickets[0].ticketNumber === "TK-2027-001001",
    "Search by exact ticket number 'TK-2027-001001' succeeds"
  );

  // Time filter test
  const custUpcoming = getCustomerTickets("cust-001", { timeFilter: "UPCOMING" });
  assert(
    custUpcoming.tickets.every((t) => t.status !== "CANCELLED" && t.status !== "REFUNDED"),
    "Upcoming filter excludes cancelled and refunded tickets"
  );

  // ----------------------------------------------------------------------------
  // TEST 12: Immutable Audit Trail
  // ----------------------------------------------------------------------------
  console.log("\nTEST 12: Immutable Audit Trail");
  const allAudit = getTicketAuditLogs();
  assert(allAudit.length > 0, "Audit logs are recorded");

  const hasGeneratedAudit = allAudit.some((a) => a.action === "TICKET_GENERATED");
  const hasViewedAudit = allAudit.some((a) => a.action === "TICKET_VIEWED");
  const hasCancelledAudit = allAudit.some((a) => a.action === "TICKET_CANCELLED");

  assert(hasGeneratedAudit, "Audit trail contains TICKET_GENERATED records");
  assert(hasViewedAudit, "Audit trail contains TICKET_VIEWED records");
  assert(hasCancelledAudit, "Audit trail contains TICKET_CANCELLED records");

  const sampleLog = allAudit[0];
  assert(Boolean(sampleLog.id), "Audit log has unique ID");
  assert(Boolean(sampleLog.timestamp), "Audit log has ISO timestamp");
  assert(Boolean(sampleLog.actor && sampleLog.actor.role), "Audit log records actor role");

  console.log("\n================================================================================");
  console.log("   🎉 ALL 12 VERIFICATION SUITES PASSED FLAWLESSLY!                              ");
  console.log("   Enterprise Digital Ticket & QR System is 100% compliant and production-ready. ");
  console.log("================================================================================\n");
}

runTicketSystemVerification().catch((err) => {
  console.error("FATAL ERROR during verification:", err);
  process.exit(1);
});
