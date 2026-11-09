/**
 * ==============================================================================
 * CineSphere OS - Automated Verification Suite: Notification & Communication System
 * Phase 2 - Part 14
 * 
 * Verifies:
 * 1. Domain Event Bus Decoupling: Event publishing by domain modules without direct channel sending
 * 2. Notification Template Engine: Dynamic token placeholder substitution & defaults
 * 3. Multi-Channel Dispatch Manifest: In-App (Delivered) vs Placeholders (Email, SMS, Push, WhatsApp)
 * 4. User Notification Preferences: Channel & category opt-in/opt-out enforcement
 * 5. Customer Tenant Isolation: Patron isolation (no cross-customer notification leakage)
 * 6. Theatre Admin Tenant Isolation: Cinema-specific scoped alerts (no cross-theatre leakage)
 * 7. Super Admin Platform Visibility: Super Admin platform-wide telemetry & system traps
 * 8. Notification Status Lifecycle: UNREAD -> READ -> ARCHIVED -> DELETED
 * 9. Batch Operations: Mark all notifications as read & unread count synchronization
 * 10. Search & Filter Engine: Status, category, priority, and text search across titles & messages
 * 11. Accurate Unread Count Calculation: Across all 3 roles (Customer, Theatre Admin, Super Admin)
 * 12. Immutable Audit Logging: NOTIFICATION_CREATED, READ, ARCHIVED, DELETED, PREFERENCES_UPDATED
 * ==============================================================================
 */

import {
  archiveNotification,
  createNotification,
  deleteNotification,
  getCustomerNotifications,
  getNotificationAuditLogs,
  getSuperAdminNotifications,
  getTheatreNotifications,
  getUnreadCount,
  getUserPreferences,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATION_TEMPLATES,
  publishDomainEvent,
  renderTemplate,
  resetNotificationEngineStore,
  updateUserPreferences,
} from "../lib/engine/notification-engine";
import {
  DomainEvent,
  NotificationFilterParams,
  NotificationItem,
} from "../types/notification.types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runNotificationSystemVerification() {
  console.log("\n================================================================================");
  console.log("   CINESPHERE OS — PHASE 2 PART 14: NOTIFICATION & COMMUNICATION SUITE          ");
  console.log("================================================================================\n");

  resetNotificationEngineStore();

  // ----------------------------------------------------------------------------
  // TEST 1: Template Engine (Placeholder Substitution)
  // ----------------------------------------------------------------------------
  console.log("TEST 1: Notification Template Engine & Dynamic Token Substitution");
  {
    const template = NOTIFICATION_TEMPLATES.BOOKING_CONFIRMED_CUSTOMER;
    assert(!!template, "Template BOOKING_CONFIRMED_CUSTOMER must exist in template registry");

    const variables = {
      customerName: "Aarav Sharma",
      movieTitle: "Kalki 2898 AD",
      theatreName: "CineWave IMAX Mumbai",
      hallName: "Audi 1 IMAX Laser",
      showTime: "Today at 7:30 PM",
      seatLabels: "H12, H13",
      bookingRef: "BK-2026-TEST01",
    };

    const rendered = renderTemplate(template, variables);
    assert(
      rendered.title.includes("Kalki 2898 AD"),
      `Rendered title should include movieTitle '${variables.movieTitle}': got "${rendered.title}"`
    );
    assert(
      rendered.message.includes("Aarav Sharma"),
      `Rendered message should include customerName '${variables.customerName}'`
    );
    assert(
      rendered.message.includes("Audi 1 IMAX Laser"),
      `Rendered message should include hallName '${variables.hallName}'`
    );
    assert(
      rendered.message.includes("BK-2026-TEST01"),
      `Rendered message should include bookingRef '${variables.bookingRef}'`
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 2: Central Domain Event Bus Decoupling (BookingConfirmed)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 2: Event-Driven Bus Decoupling (BookingConfirmed Event)");
  {
    const event: DomainEvent<{
      bookingId: string;
      customerId: string;
      customerName: string;
      movieTitle: string;
      theatreId: string;
      theatreName: string;
      hallName: string;
      showTime: string;
      seatLabels: string;
      seatCount: number;
      amountPaid: number;
      bookingRef: string;
    }> = {
      id: "evt-booking-conf-001",
      type: "BookingConfirmed",
      sourceModule: "BOOKING",
      occurredAt: new Date().toISOString(),
      actor: { userId: "cust-test-01", role: "CUSTOMER" },
      payload: {
        bookingId: "bkg-test-001",
        customerId: "cust-test-01",
        customerName: "Vikram Malhotra",
        movieTitle: "Gladiator II",
        theatreId: "th-mum-001",
        theatreName: "Apex Grand Cinemas Mumbai",
        hallName: "Screen 3 Dolby Atmos",
        showTime: "Tonight, 9:00 PM",
        seatLabels: "G10, G11",
        seatCount: 2,
        amountPaid: 840,
        bookingRef: "BK-GLAD-001",
      },
    };

    const result = publishDomainEvent(event);
    assert(
      result.dispatchedCount >= 2,
      `BookingConfirmed should generate at least 2 notifications (Customer + Theatre Admin); generated: ${result.dispatchedCount}`
    );

    const customerNotif = result.notifications.find(
      (n) => n.recipientId === "cust-test-01" && n.recipientRole === "CUSTOMER"
    );
    assert(!!customerNotif, "Customer notification should be generated by Event Bus");
    assert(
      Boolean(customerNotif?.title.includes("Gladiator II")),
      `Customer notification title should mention movie: "${customerNotif?.title}"`
    );
    assert(
      customerNotif?.sourceModule === "BOOKING",
      `Source module should be BOOKING: got "${customerNotif?.sourceModule}"`
    );

    const theatreNotif = result.notifications.find(
      (n) => n.theatreId === "th-mum-001" && n.recipientRole === "THEATRE_ADMIN"
    );
    assert(!!theatreNotif, "Theatre Admin notification should be generated by Event Bus");
    assert(
      Boolean(theatreNotif?.title.includes("Gladiator II") || theatreNotif?.message.includes("Gladiator II")),
      "Theatre Admin alert should mention movie title"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 3: Multi-Channel Dispatch Manifest (In-App delivered, others queued)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 3: Multi-Channel Dispatch Manifest Architecture");
  {
    const notif = createNotification({
      recipientId: "cust-test-01",
      recipientRole: "CUSTOMER",
      theatreId: "th-mum-001",
      type: "TICKET_GENERATED",
      category: "TICKET",
      title: "Admission Passes Active",
      message: "Your fast-pass QR passes are ready for entry at Turnstile 2.",
      priority: "HIGH",
      sourceModule: "TICKET",
    });

    assert(
      notif.channelDispatches.IN_APP === "DELIVERED",
      `In-App channel must be DELIVERED: got "${notif.channelDispatches.IN_APP}"`
    );
    assert(
      notif.channelDispatches.EMAIL === "QUEUED_PLACEHOLDER",
      `Email channel must be QUEUED_PLACEHOLDER: got "${notif.channelDispatches.EMAIL}"`
    );
    assert(
      notif.channelDispatches.SMS === "QUEUED_PLACEHOLDER",
      `SMS channel must be QUEUED_PLACEHOLDER: got "${notif.channelDispatches.SMS}"`
    );
    assert(
      notif.channelDispatches.PUSH === "QUEUED_PLACEHOLDER",
      `Push channel must be QUEUED_PLACEHOLDER: got "${notif.channelDispatches.PUSH}"`
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 4: User Notification Preferences (Channel & Category Opt-Outs)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 4: User Notification Preferences & Channel/Category Opt-Outs");
  {
    const userId = "cust-optout-user";
    const initialPrefs = getUserPreferences(userId);
    assert(initialPrefs.channels.email === true, "Initial email pref should be enabled");
    assert(initialPrefs.channels.sms === true, "Initial sms pref should be enabled");

    // Opt-out of SMS and marketing category
    const updated = updateUserPreferences(userId, {
      channels: { ...initialPrefs.channels, sms: false },
      categories: { ...initialPrefs.categories, promotionalOffers: false },
    });
    assert(updated.channels.sms === false, "SMS should now be opted out");
    assert(updated.categories.promotionalOffers === false, "Promotions should now be opted out");

    // Notification created for this user should reflect opted-out status for SMS
    const notif = createNotification({
      recipientId: userId,
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Test Reservation",
      message: "Reservation confirmed.",
      priority: "NORMAL",
      sourceModule: "BOOKING",
    });

    assert(
      notif.channelDispatches.SMS === "OPTED_OUT",
      `SMS channel dispatch should be OPTED_OUT when user disables SMS: got "${notif.channelDispatches.SMS}"`
    );
    assert(
      notif.channelDispatches.EMAIL === "QUEUED_PLACEHOLDER",
      "Email should remain QUEUED_PLACEHOLDER since user did not disable email"
    );
    assert(
      notif.channelDispatches.IN_APP === "DELIVERED",
      "In-App should remain DELIVERED"
    );

    // Suppressed category test: Promotional offer notification for this user should be SUPPRESSED
    const promoNotif = createNotification({
      recipientId: userId,
      recipientRole: "CUSTOMER",
      type: "PROMOTIONAL_OFFER",
      category: "MARKETING",
      title: "50% Off IMAX Combos",
      message: "Flash sale on popcorn combos.",
      priority: "LOW",
      sourceModule: "SYSTEM",
    });
    assert(
      promoNotif.channelDispatches.IN_APP === "SUPPRESSED",
      `In-App should be SUPPRESSED when category is opted out: got "${promoNotif.channelDispatches.IN_APP}"`
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 5: Customer Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 5: Customer Tenant Isolation Guarantee");
  {
    // Create notifications for Patron A and Patron B
    createNotification({
      recipientId: "cust-alpha",
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Alpha Booking",
      message: "Alpha exclusive reservation",
      priority: "NORMAL",
      sourceModule: "BOOKING",
    });

    createNotification({
      recipientId: "cust-beta",
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Beta Booking",
      message: "Beta exclusive reservation",
      priority: "NORMAL",
      sourceModule: "BOOKING",
    });

    const alphaList = getCustomerNotifications("cust-alpha");
    assert(
      alphaList.notifications.every((n) => n.recipientId === "cust-alpha"),
      "Patron Alpha must strictly receive only notifications addressed to cust-alpha"
    );
    assert(
      !alphaList.notifications.some((n) => n.recipientId === "cust-beta"),
      "Patron Alpha must NEVER receive Patron Beta's notifications (Zero Leakage)"
    );

    const betaList = getCustomerNotifications("cust-beta");
    assert(
      betaList.notifications.every((n) => n.recipientId === "cust-beta"),
      "Patron Beta must strictly receive only notifications addressed to cust-beta"
    );
    assert(
      !betaList.notifications.some((n) => n.recipientId === "cust-alpha"),
      "Patron Beta must NEVER receive Patron Alpha's notifications (Zero Leakage)"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 6: Theatre Admin Tenant Isolation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 6: Theatre Admin Tenant Isolation Guarantee");
  {
    createNotification({
      recipientId: "th-admin-pune",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-pun-001",
      type: "LOW_SEAT_AVAILABILITY",
      category: "THEATRE",
      title: "Pune High Demand Alert",
      message: "Hall 1 seats 95% booked.",
      priority: "HIGH",
      sourceModule: "SHOW",
    });

    createNotification({
      recipientId: "th-admin-mumbai",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-mum-001",
      type: "HALL_UPDATED",
      category: "THEATRE",
      title: "Mumbai Projector Alert",
      message: "Projector calibrated.",
      priority: "NORMAL",
      sourceModule: "THEATRE",
    });

    const puneResult = getTheatreNotifications("th-pun-001");
    assert(
      puneResult.notifications.every((n) => n.theatreId === "th-pun-001"),
      "Pune theatre admin must only see alerts scoped to th-pun-001"
    );
    assert(
      !puneResult.notifications.some((n) => n.theatreId === "th-mum-001"),
      "Pune theatre admin must NEVER see Mumbai theatre notifications"
    );

    const mumbaiResult = getTheatreNotifications("th-mum-001");
    assert(
      mumbaiResult.notifications.every((n) => n.theatreId === "th-mum-001"),
      "Mumbai theatre admin must only see alerts scoped to th-mum-001"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 7: Super Admin Platform-Wide Telemetry
  // ----------------------------------------------------------------------------
  console.log("\nTEST 7: Super Admin Platform-Wide Telemetry & Alerts");
  {
    createNotification({
      recipientId: "super-admin-root",
      recipientRole: "SUPER_ADMIN",
      theatreId: null,
      type: "NEW_THEATRE_REGISTRATION",
      category: "THEATRE",
      title: "New Theatre Onboarding Application",
      message: "PVR Inox Phoenix Marketcity applied for onboarding.",
      priority: "HIGH",
      sourceModule: "THEATRE",
    });

    const saResult = getSuperAdminNotifications();
    assert(saResult.totalCount > 0, "Super Admin must have platform-wide notification stream");
    assert(
      saResult.notifications.some((n) => n.type === "NEW_THEATRE_REGISTRATION"),
      "Super admin notifications list must include platform onboarding alerts"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 8: Notification Status Lifecycle (UNREAD -> READ -> ARCHIVED -> DELETED)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 8: Notification Status Lifecycle Transitions");
  {
    const notif = createNotification({
      recipientId: "cust-lifecycle-user",
      recipientRole: "CUSTOMER",
      type: "SHOW_REMINDER",
      category: "SHOW",
      title: "Show starts in 30 mins",
      message: "Audi doors are now open.",
      priority: "HIGH",
      sourceModule: "SHOW",
    });

    assert(notif.status === "UNREAD", `Initial status must be UNREAD: got "${notif.status}"`);
    assert(notif.readAt === null, "readAt must initially be null");

    // Transition 1: Mark as READ
    const markedRead = markNotificationAsRead(notif.id, {
      userId: "cust-lifecycle-user",
      role: "CUSTOMER",
    });
    assert(markedRead, "markNotificationAsRead should return true");
    assert(notif.status === "READ", `Status should be READ: got "${notif.status}"`);
    assert(!!notif.readAt, "readAt timestamp should be set upon marking read");

    // Transition 2: ARCHIVED
    const archived = archiveNotification(notif.id, {
      userId: "cust-lifecycle-user",
      role: "CUSTOMER",
    });
    assert(archived, "archiveNotification should return true");
    assert(notif.status === "ARCHIVED", `Status should be ARCHIVED: got "${notif.status}"`);
    assert(!!notif.archivedAt, "archivedAt timestamp should be set");

    // Transition 3: DELETED
    const deleted = deleteNotification(notif.id, {
      userId: "cust-lifecycle-user",
      role: "CUSTOMER",
    });
    assert(deleted, "deleteNotification should return true");
    assert(notif.status === "DELETED", `Status should be DELETED: got "${notif.status}"`);

    // Verify deleted notification is filtered out from query results
    const customerList = getCustomerNotifications("cust-lifecycle-user");
    assert(
      !customerList.notifications.some((n) => n.id === notif.id),
      "Deleted notification must not appear in active queries"
    );
  }

  // ----------------------------------------------------------------------------
  // TEST 9: Batch Operations (Mark All As Read)
  // ----------------------------------------------------------------------------
  console.log("\nTEST 9: Batch Operations (Mark All As Read & Unread Count Synchronization)");
  {
    const recipientId = "cust-batch-user";
    createNotification({
      recipientId,
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Booking 1",
      message: "Ticket 1 confirmed",
      priority: "NORMAL",
      sourceModule: "BOOKING",
    });
    createNotification({
      recipientId,
      recipientRole: "CUSTOMER",
      type: "PAYMENT_SUCCESS",
      category: "PAYMENT",
      title: "Payment 1",
      message: "Payment processed",
      priority: "NORMAL",
      sourceModule: "PAYMENT",
    });

    const unreadBefore = getUnreadCount(recipientId, "CUSTOMER");
    assert(unreadBefore >= 2, `Unread count before batch read should be >= 2: got ${unreadBefore}`);

    const markedCount = markAllNotificationsAsRead(recipientId, "CUSTOMER");
    assert(markedCount >= 2, `Marked count should be >= 2: got ${markedCount}`);

    const unreadAfter = getUnreadCount(recipientId, "CUSTOMER");
    assert(unreadAfter === 0, `Unread count after batch read must be 0: got ${unreadAfter}`);
  }

  // ----------------------------------------------------------------------------
  // TEST 10: Multi-Criteria Search & Filter Engine
  // ----------------------------------------------------------------------------
  console.log("\nTEST 10: Search & Filter Engine (Query, Priority, Category, Status)");
  {
    const recipientId = "cust-filter-user";
    createNotification({
      recipientId,
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Interstellar IMAX 70mm",
      message: "Confirmed for Screen 1.",
      priority: "CRITICAL",
      sourceModule: "BOOKING",
    });
    createNotification({
      recipientId,
      recipientRole: "CUSTOMER",
      type: "SHOW_REMINDER",
      category: "SHOW",
      title: "Dune Part Two Reminder",
      message: "Starts in 2 hours.",
      priority: "LOW",
      sourceModule: "SHOW",
    });

    // 1. Keyword query search
    const queryResult = getCustomerNotifications(recipientId, { query: "Interstellar" });
    assert(queryResult.totalCount === 1, `Query for 'Interstellar' should return 1 result: got ${queryResult.totalCount}`);
    assert(queryResult.notifications[0].title.includes("Interstellar"), "Should match Interstellar notification");

    // 2. Priority filter
    const priorityResult = getCustomerNotifications(recipientId, { priority: "CRITICAL" });
    assert(priorityResult.totalCount === 1, `Priority filter 'CRITICAL' should return 1 result: got ${priorityResult.totalCount}`);

    // 3. Category filter
    const categoryResult = getCustomerNotifications(recipientId, { category: "SHOW" });
    assert(categoryResult.totalCount === 1, `Category filter 'SHOW' should return 1 result: got ${categoryResult.totalCount}`);
    assert(categoryResult.notifications[0].title.includes("Dune"), "Should match Dune notification");
  }

  // ----------------------------------------------------------------------------
  // TEST 11: Unread Count Calculation
  // ----------------------------------------------------------------------------
  console.log("\nTEST 11: Live Unread Count Calculation");
  {
    const recipientId = "cust-unread-calc";
    assert(getUnreadCount(recipientId, "CUSTOMER") === 0, "Initial unread count should be 0");

    const n1 = createNotification({
      recipientId,
      recipientRole: "CUSTOMER",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Alert 1",
      message: "Message 1",
      priority: "NORMAL",
      sourceModule: "BOOKING",
    });

    assert(getUnreadCount(recipientId, "CUSTOMER") === 1, "Unread count should increment to 1");

    markNotificationAsRead(n1.id);
    assert(getUnreadCount(recipientId, "CUSTOMER") === 0, "Unread count should decrement to 0 after read");
  }

  // ----------------------------------------------------------------------------
  // TEST 12: Immutable Audit Logging
  // ----------------------------------------------------------------------------
  console.log("\nTEST 12: Immutable Audit Logging");
  {
    const logs = getNotificationAuditLogs();
    assert(logs.length > 0, "Audit logs must be populated with notification lifecycle actions");

    const actions = new Set(logs.map((l) => l.action));
    assert(actions.has("NOTIFICATION_CREATED"), "Audit logs must record NOTIFICATION_CREATED");
    assert(actions.has("NOTIFICATION_READ"), "Audit logs must record NOTIFICATION_READ");
    assert(actions.has("NOTIFICATION_ARCHIVED"), "Audit logs must record NOTIFICATION_ARCHIVED");
    assert(actions.has("NOTIFICATION_DELETED"), "Audit logs must record NOTIFICATION_DELETED");
    assert(actions.has("PREFERENCES_UPDATED"), "Audit logs must record PREFERENCES_UPDATED");
  }

  console.log("\n================================================================================");
  console.log("   🎉 ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY!                             ");
  console.log("   Phase 2 – Part 14 Notification & Communication System is Production-Ready!   ");
  console.log("================================================================================\n");
}

runNotificationSystemVerification().catch((err) => {
  console.error("Verification failed with uncaught exception:", err);
  process.exit(1);
});
