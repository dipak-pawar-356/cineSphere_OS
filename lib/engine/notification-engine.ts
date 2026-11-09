/**
 * ==============================================================================
 * CineSphere OS - Centralized Notification & Communication Engine
 * Phase 2 - Part 14
 * 
 * Enterprise Event-Driven Flow:
 * Domain Modules (Booking, Payment, Show, Ticket, Administration)
 *       │
 *       ▼
 * Event Bus (publishDomainEvent)
 *       │
 *       ▼
 * Notification Service (Template Engine + Channel Preferences)
 *       │
 * ┌─────┴───────┬─────────┬──────────┬───────────┐
 * ▼             ▼         ▼          ▼           ▼
 * In-App      Email*     SMS*      Push*     WhatsApp*
 * (Active UI) (* Architecture Placeholders)
 * ==============================================================================
 */

import {
  ChannelDispatchStatus,
  CreateNotificationInput,
  DomainEvent,
  DomainEventType,
  NotificationAuditAction,
  NotificationAuditLog,
  NotificationChannel,
  NotificationFilterParams,
  NotificationItem,
  NotificationListResult,
  NotificationPreferences,
  NotificationPriority,
  NotificationStatus,
  NotificationTemplate,
  RecipientRole,
  SourceModule,
} from "@/types/notification.types";

// ------------------------------------------------------------------------------
// 1. Reusable Notification Templates (Template Engine)
// ------------------------------------------------------------------------------

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  BOOKING_CONFIRMED_CUSTOMER: {
    key: "BOOKING_CONFIRMED_CUSTOMER",
    category: "BOOKING",
    defaultPriority: "HIGH",
    targetRole: "CUSTOMER",
    titleTemplate: "Booking Confirmed: {movieTitle}",
    messageTemplate:
      "Hi {customerName}, your reservation for {movieTitle} at {theatreName} ({hallName}) for {showTime} on {showDate} is confirmed. Booking Ref: {bookingRef}.",
  },
  BOOKING_CANCELLED_CUSTOMER: {
    key: "BOOKING_CANCELLED_CUSTOMER",
    category: "BOOKING",
    defaultPriority: "HIGH",
    targetRole: "CUSTOMER",
    titleTemplate: "Booking Cancelled: {movieTitle}",
    messageTemplate:
      "Your booking {bookingRef} for {movieTitle} on {showDate} has been cancelled. Refund of ₹{amount} has been initiated.",
  },
  PAYMENT_SUCCESS_CUSTOMER: {
    key: "PAYMENT_SUCCESS_CUSTOMER",
    category: "PAYMENT",
    defaultPriority: "NORMAL",
    targetRole: "CUSTOMER",
    titleTemplate: "Payment of ₹{amount} Received",
    messageTemplate:
      "Your payment of ₹{amount} via {paymentMethod} for booking {bookingRef} succeeded. Transaction ID: {transactionId}.",
  },
  PAYMENT_FAILED_CUSTOMER: {
    key: "PAYMENT_FAILED_CUSTOMER",
    category: "PAYMENT",
    defaultPriority: "HIGH",
    targetRole: "CUSTOMER",
    titleTemplate: "Payment Failed: Booking {bookingRef}",
    messageTemplate:
      "The payment of ₹{amount} could not be authorized. Please retry using an alternate UPI VPA or card.",
  },
  TICKET_ISSUED_CUSTOMER: {
    key: "TICKET_ISSUED_CUSTOMER",
    category: "TICKET",
    defaultPriority: "HIGH",
    targetRole: "CUSTOMER",
    titleTemplate: "Digital Pass Ready: {movieTitle}",
    messageTemplate:
      "Your admission pass ({ticketNumber}) for {movieTitle} at {theatreName} is ready. Seats: {seatNumbers}. Show your dynamic QR at the door.",
  },
  SHOW_REMINDER_CUSTOMER: {
    key: "SHOW_REMINDER_CUSTOMER",
    category: "SHOW",
    defaultPriority: "NORMAL",
    targetRole: "CUSTOMER",
    titleTemplate: "Showtime Reminder: {movieTitle} at {showTime}",
    messageTemplate:
      "Doors open 20 minutes prior to showtime at {theatreName} ({hallName}). Please have your digital fast-pass ready.",
  },
  SHOW_CANCELLED_CUSTOMER: {
    key: "SHOW_CANCELLED_CUSTOMER",
    category: "SHOW",
    defaultPriority: "CRITICAL",
    targetRole: "CUSTOMER",
    titleTemplate: "Notice: Show Cancelled ({movieTitle})",
    messageTemplate:
      "Due to unforeseen technical maintenance, the show of {movieTitle} on {showDate} at {showTime} has been cancelled. A 100% refund has been processed.",
  },
  PROMOTIONAL_OFFER_CUSTOMER: {
    key: "PROMOTIONAL_OFFER_CUSTOMER",
    category: "MARKETING",
    defaultPriority: "LOW",
    targetRole: "CUSTOMER",
    titleTemplate: "Exclusive Deal: {offerTitle}",
    messageTemplate:
      "Enjoy {discountPercent}% off on gourmet popcorn and nachos combo on your next visit to {theatreName}.",
  },

  // Theatre Admin Templates
  NEW_BOOKING_THEATRE: {
    key: "NEW_BOOKING_THEATRE",
    category: "BOOKING",
    defaultPriority: "NORMAL",
    targetRole: "THEATRE_ADMIN",
    titleTemplate: "New Booking: {bookingRef} ({movieTitle})",
    messageTemplate:
      "Patron {customerName} booked {seatCount} seat(s) ({seatNumbers}) for {showTime} in {hallName}. Amount: ₹{amount}.",
  },
  THEATRE_PAYMENT_RECEIVED: {
    key: "THEATRE_PAYMENT_RECEIVED",
    category: "PAYMENT",
    defaultPriority: "NORMAL",
    targetRole: "THEATRE_ADMIN",
    titleTemplate: "Payment Received: ₹{amount}",
    messageTemplate:
      "Payment settlement of ₹{amount} for booking {bookingRef} received via {paymentMethod}.",
  },
  LOW_SEAT_AVAILABILITY_THEATRE: {
    key: "LOW_SEAT_AVAILABILITY_THEATRE",
    category: "SHOW",
    defaultPriority: "HIGH",
    targetRole: "THEATRE_ADMIN",
    titleTemplate: "Low Seat Inventory Alert: {movieTitle}",
    messageTemplate:
      "{hallName} show at {showTime} has only {remainingSeats} seats remaining ({occupancyPercent}% occupancy reached).",
  },
  HALL_UPDATED_THEATRE: {
    key: "HALL_UPDATED_THEATRE",
    category: "THEATRE",
    defaultPriority: "LOW",
    targetRole: "THEATRE_ADMIN",
    titleTemplate: "Auditorium Hardware Config Updated",
    messageTemplate:
      "{hallName} projection and sound calibration telemetry updated.",
  },

  // Super Admin Templates
  NEW_THEATRE_REGISTRATION_SUPER: {
    key: "NEW_THEATRE_REGISTRATION_SUPER",
    category: "THEATRE",
    defaultPriority: "HIGH",
    targetRole: "SUPER_ADMIN",
    titleTemplate: "New Multiplex Application: {theatreName}",
    messageTemplate:
      "{theatreName} located in {city} submitted an onboarding application requiring Super Admin compliance review.",
  },
  PLATFORM_ERROR_SUPER: {
    key: "PLATFORM_ERROR_SUPER",
    category: "SECURITY",
    defaultPriority: "CRITICAL",
    targetRole: "SUPER_ADMIN",
    titleTemplate: "System Alert: {errorScope}",
    messageTemplate:
      "Automated diagnostics reported: {errorMessage}. Node: {nodeId}.",
  },
  HIGH_TRAFFIC_ALERT_SUPER: {
    key: "HIGH_TRAFFIC_ALERT_SUPER",
    category: "SYSTEM",
    defaultPriority: "HIGH",
    targetRole: "SUPER_ADMIN",
    titleTemplate: "Surge Alert: High Checkout Velocity",
    messageTemplate:
      "Platform reservation velocity reached {transactionsPerMinute} req/min during {movieTitle} advance bookings.",
  },
};

/**
 * Replaces token placeholders `{variable}` with actual payload variables.
 */
export function renderTemplate(
  template: NotificationTemplate,
  variables: Record<string, unknown>
): { title: string; message: string } {
  let title = template.titleTemplate;
  let message = template.messageTemplate;

  Object.entries(variables).forEach(([key, value]) => {
    const token = new RegExp(`\\{${key}\\}`, "g");
    const valStr = value !== undefined && value !== null ? String(value) : "";
    title = title.replace(token, valStr);
    message = message.replace(token, valStr);
  });

  return { title, message };
}

// ------------------------------------------------------------------------------
// 2. User Notification Preferences Store
// ------------------------------------------------------------------------------

const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: "default",
  channels: {
    inApp: true,
    email: true,
    sms: true,
    push: true,
    whatsapp: false,
  },
  categories: {
    bookingUpdates: true,
    paymentReceipts: true,
    ticketPasses: true,
    showReminders: true,
    promotionalOffers: false,
    securityAlerts: true,
  },
  updatedAt: new Date().toISOString(),
};

const userPreferencesStore = new Map<string, NotificationPreferences>();

export function getUserPreferences(userId: string): NotificationPreferences {
  if (!userPreferencesStore.has(userId)) {
    const prefs: NotificationPreferences = {
      ...DEFAULT_PREFERENCES,
      userId,
      channels: { ...DEFAULT_PREFERENCES.channels },
      categories: { ...DEFAULT_PREFERENCES.categories },
      updatedAt: new Date().toISOString(),
    };
    userPreferencesStore.set(userId, prefs);
  }
  return userPreferencesStore.get(userId)!;
}

export function updateUserPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getUserPreferences(userId);
  const updated: NotificationPreferences = {
    ...current,
    ...updates,
    channels: {
      ...current.channels,
      ...(updates.channels || {}),
    },
    categories: {
      ...current.categories,
      ...(updates.categories || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  userPreferencesStore.set(userId, updated);
  recordNotificationAudit({
    action: "PREFERENCES_UPDATED",
    actor: { userId, role: "USER" },
    details: { updatedPreferences: updated },
  });

  return updated;
}

// ------------------------------------------------------------------------------
// 3. In-Memory Master Notifications Repository & Audit Store
// ------------------------------------------------------------------------------

let notificationsRepository: NotificationItem[] = [];
let notificationAuditRepository: NotificationAuditLog[] = [];

function recordNotificationAudit(params: {
  notificationId?: string;
  action: NotificationAuditAction;
  actor?: { userId?: string; role: string; ip?: string };
  details?: Record<string, unknown>;
}): NotificationAuditLog {
  const auditEntry: NotificationAuditLog = {
    id: `audit-notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    notificationId: params.notificationId,
    action: params.action,
    actor: params.actor || { role: "SYSTEM" },
    timestamp: new Date().toISOString(),
    details: params.details || {},
  };
  notificationAuditRepository.unshift(auditEntry);
  return auditEntry;
}

/**
 * Evaluates multi-channel dispatch status according to user preferences.
 */
function evaluateChannelDispatches(
  userId: string,
  category: string
): Record<string, ChannelDispatchStatus> {
  const prefs = getUserPreferences(userId);

  // Check if category is enabled in user preferences
  let categoryEnabled = true;
  if (category === "MARKETING" && !prefs.categories.promotionalOffers) {
    categoryEnabled = false;
  } else if (category === "SHOW" && !prefs.categories.showReminders) {
    categoryEnabled = false;
  } else if (category === "BOOKING" && !prefs.categories.bookingUpdates) {
    categoryEnabled = false;
  } else if (category === "PAYMENT" && !prefs.categories.paymentReceipts) {
    categoryEnabled = false;
  } else if (category === "TICKET" && !prefs.categories.ticketPasses) {
    categoryEnabled = false;
  } else if (category === "SECURITY" && !prefs.categories.securityAlerts) {
    categoryEnabled = false;
  }

  const inAppStatus: ChannelDispatchStatus = !categoryEnabled
    ? "SUPPRESSED"
    : !prefs.channels.inApp
    ? "OPTED_OUT"
    : "DELIVERED";

  return {
    IN_APP: inAppStatus,
    EMAIL: !categoryEnabled || !prefs.channels.email ? "OPTED_OUT" : "QUEUED_PLACEHOLDER",
    SMS: !categoryEnabled || !prefs.channels.sms ? "OPTED_OUT" : "QUEUED_PLACEHOLDER",
    PUSH: !categoryEnabled || !prefs.channels.push ? "OPTED_OUT" : "QUEUED_PLACEHOLDER",
    WHATSAPP: !categoryEnabled || !prefs.channels.whatsapp ? "OPTED_OUT" : "QUEUED_PLACEHOLDER",
    TELEGRAM: "QUEUED_PLACEHOLDER",
    WEBHOOK: "QUEUED_PLACEHOLDER",
  };
}

/**
 * Creates and stores a notification.
 */
export function createNotification(input: CreateNotificationInput): NotificationItem {
  const channelDispatches = evaluateChannelDispatches(input.recipientId, input.category);

  const notification: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    recipientId: input.recipientId,
    recipientRole: input.recipientRole,
    theatreId: input.theatreId || null,
    type: input.type,
    category: input.category,
    title: input.title,
    message: input.message,
    priority: input.priority || "NORMAL",
    status: "UNREAD",
    sourceModule: input.sourceModule || "SYSTEM",
    referenceEntity: input.referenceEntity,
    channelDispatches,
    metadata: input.metadata || {},
    createdAt: new Date().toISOString(),
    readAt: null,
    archivedAt: null,
  };

  notificationsRepository.unshift(notification);

  recordNotificationAudit({
    notificationId: notification.id,
    action: "NOTIFICATION_CREATED",
    actor: { role: input.sourceModule || "SYSTEM" },
    details: {
      type: notification.type,
      recipientId: notification.recipientId,
      recipientRole: notification.recipientRole,
    },
  });

  return notification;
}

// ------------------------------------------------------------------------------
// 4. Centralized Domain Event Bus
// ------------------------------------------------------------------------------

export interface NotificationDispatchResult {
  eventId: string;
  eventType: DomainEventType;
  dispatchedCount: number;
  notifications: NotificationItem[];
}

/**
 * Centralized Event Consumer. Receives domain events from any module
 * (Booking, Payment, Show, Ticket, Theatre, System), applies templates,
 * resolves recipients, and dispatches multi-channel notifications.
 */
export function publishDomainEvent<T extends Record<string, unknown>>(
  event: DomainEvent<T>
): NotificationDispatchResult {
  const dispatched: NotificationItem[] = [];
  const payload = event.payload;

  switch (event.type) {
    case "BookingConfirmed": {
      // 1. Notify Customer
      if (payload.customerId) {
        const rendered = renderTemplate(NOTIFICATION_TEMPLATES.BOOKING_CONFIRMED_CUSTOMER, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.customerId),
            recipientRole: "CUSTOMER",
            theatreId: payload.theatreId ? String(payload.theatreId) : null,
            type: "BOOKING_CONFIRMATION",
            category: "BOOKING",
            title: rendered.title,
            message: rendered.message,
            priority: "HIGH",
            sourceModule: "BOOKING",
            referenceEntity: payload.bookingId
              ? { type: "BOOKING", id: String(payload.bookingId), link: `/profile/tickets` }
              : undefined,
            metadata: payload,
          })
        );
      }

      // 2. Notify Theatre Admin
      if (payload.theatreId) {
        const renderedAdmin = renderTemplate(NOTIFICATION_TEMPLATES.NEW_BOOKING_THEATRE, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.theatreId),
            recipientRole: "THEATRE_ADMIN",
            theatreId: String(payload.theatreId),
            type: "NEW_BOOKING",
            category: "BOOKING",
            title: renderedAdmin.title,
            message: renderedAdmin.message,
            priority: "NORMAL",
            sourceModule: "BOOKING",
            referenceEntity: payload.bookingId
              ? { type: "BOOKING", id: String(payload.bookingId), link: `/theatre/bookings` }
              : undefined,
            metadata: payload,
          })
        );
      }
      break;
    }

    case "PaymentSucceeded": {
      // Notify Customer
      if (payload.customerId) {
        const rendered = renderTemplate(NOTIFICATION_TEMPLATES.PAYMENT_SUCCESS_CUSTOMER, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.customerId),
            recipientRole: "CUSTOMER",
            theatreId: payload.theatreId ? String(payload.theatreId) : null,
            type: "PAYMENT_SUCCESS",
            category: "PAYMENT",
            title: rendered.title,
            message: rendered.message,
            priority: "NORMAL",
            sourceModule: "PAYMENT",
            referenceEntity: payload.transactionId
              ? { type: "PAYMENT", id: String(payload.transactionId) }
              : undefined,
            metadata: payload,
          })
        );
      }

      // Notify Theatre Admin
      if (payload.theatreId) {
        const renderedAdmin = renderTemplate(NOTIFICATION_TEMPLATES.THEATRE_PAYMENT_RECEIVED, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.theatreId),
            recipientRole: "THEATRE_ADMIN",
            theatreId: String(payload.theatreId),
            type: "THEATRE_PAYMENT_RECEIVED",
            category: "PAYMENT",
            title: renderedAdmin.title,
            message: renderedAdmin.message,
            priority: "NORMAL",
            sourceModule: "PAYMENT",
            metadata: payload,
          })
        );
      }
      break;
    }

    case "TicketIssued": {
      if (payload.customerId) {
        const rendered = renderTemplate(NOTIFICATION_TEMPLATES.TICKET_ISSUED_CUSTOMER, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.customerId),
            recipientRole: "CUSTOMER",
            theatreId: payload.theatreId ? String(payload.theatreId) : null,
            type: "TICKET_GENERATED",
            category: "TICKET",
            title: rendered.title,
            message: rendered.message,
            priority: "HIGH",
            sourceModule: "TICKET",
            referenceEntity: payload.ticketSecureId
              ? {
                  type: "TICKET",
                  id: String(payload.ticketSecureId),
                  link: `/tickets/${payload.ticketSecureId}`,
                }
              : undefined,
            metadata: payload,
          })
        );
      }
      break;
    }

    case "BookingCancelled": {
      if (payload.customerId) {
        const rendered = renderTemplate(NOTIFICATION_TEMPLATES.BOOKING_CANCELLED_CUSTOMER, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.customerId),
            recipientRole: "CUSTOMER",
            theatreId: payload.theatreId ? String(payload.theatreId) : null,
            type: "BOOKING_CANCELLED",
            category: "BOOKING",
            title: rendered.title,
            message: rendered.message,
            priority: "HIGH",
            sourceModule: "BOOKING",
            metadata: payload,
          })
        );
      }
      break;
    }

    case "ShowCancelled": {
      // Broadcast to Theatre Admin
      if (payload.theatreId) {
        dispatched.push(
          createNotification({
            recipientId: String(payload.theatreId),
            recipientRole: "THEATRE_ADMIN",
            theatreId: String(payload.theatreId),
            type: "SHOW_CANCELLED_ADMIN",
            category: "SHOW",
            title: `Show Cancelled: ${payload.movieTitle}`,
            message: `Auditorium ${payload.hallName} show at ${payload.showTime} was cancelled.`,
            priority: "CRITICAL",
            sourceModule: "SHOW",
            metadata: payload,
          })
        );
      }
      break;
    }

    case "LowSeatAvailability": {
      if (payload.theatreId) {
        const rendered = renderTemplate(NOTIFICATION_TEMPLATES.LOW_SEAT_AVAILABILITY_THEATRE, payload);
        dispatched.push(
          createNotification({
            recipientId: String(payload.theatreId),
            recipientRole: "THEATRE_ADMIN",
            theatreId: String(payload.theatreId),
            type: "LOW_SEAT_AVAILABILITY",
            category: "SHOW",
            title: rendered.title,
            message: rendered.message,
            priority: "HIGH",
            sourceModule: "SHOW",
            metadata: payload,
          })
        );
      }
      break;
    }

    case "NewTheatreRegistered": {
      const rendered = renderTemplate(NOTIFICATION_TEMPLATES.NEW_THEATRE_REGISTRATION_SUPER, payload);
      dispatched.push(
        createNotification({
          recipientId: "super-admin-root",
          recipientRole: "SUPER_ADMIN",
          theatreId: payload.theatreId ? String(payload.theatreId) : null,
          type: "NEW_THEATRE_REGISTRATION",
          category: "THEATRE",
          title: rendered.title,
          message: rendered.message,
          priority: "HIGH",
          sourceModule: "THEATRE",
          referenceEntity: payload.theatreId
            ? { type: "THEATRE", id: String(payload.theatreId), link: `/dashboard/theatres/${payload.theatreId}` }
            : undefined,
          metadata: payload,
        })
      );
      break;
    }

    default: {
      // General fallthrough dispatch
      if (payload.recipientId && payload.title && payload.message) {
        dispatched.push(
          createNotification({
            recipientId: String(payload.recipientId),
            recipientRole: (payload.recipientRole as RecipientRole) || "CUSTOMER",
            theatreId: payload.theatreId ? String(payload.theatreId) : null,
            type: "SYSTEM",
            category: "SYSTEM",
            title: String(payload.title),
            message: String(payload.message),
            priority: (payload.priority as NotificationPriority) || "NORMAL",
            sourceModule: event.sourceModule,
            metadata: payload,
          })
        );
      }
      break;
    }
  }

  return {
    eventId: event.id,
    eventType: event.type,
    dispatchedCount: dispatched.length,
    notifications: dispatched,
  };
}

// ------------------------------------------------------------------------------
// 5. Seed Initial Realistic Notifications
// ------------------------------------------------------------------------------

function seedInitialNotifications(): void {
  notificationsRepository = [];
  notificationAuditRepository = [];

  // Customer Notifications (cust-001 - Aarav Mehta)
  notificationsRepository.push(
    {
      id: "notif-cust-001",
      recipientId: "cust-001",
      recipientRole: "CUSTOMER",
      theatreId: "th-pun-001",
      type: "BOOKING_CONFIRMATION",
      category: "BOOKING",
      title: "Booking Confirmed: Pushpa 2: The Rule",
      message:
        "Hi Aarav Mehta, your reservation for Pushpa 2: The Rule at CineSphere Grand Cinemas (Hall 1 - IMAX Laser) on 2027-01-20 at 10:30 AM is confirmed. Booking Ref: BK-2027-005001.",
      priority: "HIGH",
      status: "UNREAD",
      sourceModule: "BOOKING",
      referenceEntity: { type: "BOOKING", id: "bk-pun-uuid-001", link: "/profile/tickets" },
      channelDispatches: { IN_APP: "DELIVERED", EMAIL: "QUEUED_PLACEHOLDER", SMS: "QUEUED_PLACEHOLDER" },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-cust-002",
      recipientId: "cust-001",
      recipientRole: "CUSTOMER",
      theatreId: "th-pun-001",
      type: "PAYMENT_SUCCESS",
      category: "PAYMENT",
      title: "Payment of ₹553.10 Confirmed",
      message:
        "Your payment of ₹553.10 via UPI for booking BK-2027-005001 succeeded. Transaction ID: TXN-UPI-98218.",
      priority: "NORMAL",
      status: "READ",
      sourceModule: "PAYMENT",
      referenceEntity: { type: "PAYMENT", id: "TXN-UPI-98218" },
      channelDispatches: { IN_APP: "DELIVERED", EMAIL: "QUEUED_PLACEHOLDER" },
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      archivedAt: null,
    },
    {
      id: "notif-cust-003",
      recipientId: "cust-001",
      recipientRole: "CUSTOMER",
      theatreId: "th-pun-001",
      type: "TICKET_GENERATED",
      category: "TICKET",
      title: "Digital Fast-Pass Issued: Pushpa 2",
      message:
        "Your admission pass (TK-2027-001001) for Pushpa 2: The Rule is ready. Show your dynamic QR at the door.",
      priority: "HIGH",
      status: "UNREAD",
      sourceModule: "TICKET",
      referenceEntity: {
        type: "TICKET",
        id: "01JX9K8Z6N5WQ4R2T8M7P1A9BC",
        link: "/tickets/01JX9K8Z6N5WQ4R2T8M7P1A9BC",
      },
      channelDispatches: { IN_APP: "DELIVERED", PUSH: "QUEUED_PLACEHOLDER" },
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-cust-004",
      recipientId: "cust-001",
      recipientRole: "CUSTOMER",
      theatreId: "th-pun-001",
      type: "SHOW_REMINDER",
      category: "SHOW",
      title: "Showtime Reminder: 10:30 AM Today",
      message:
        "Auditorium doors open in 45 minutes at CineSphere Grand Cinemas. Please arrive early for fast turnstile check-in.",
      priority: "NORMAL",
      status: "UNREAD",
      sourceModule: "SHOW",
      channelDispatches: { IN_APP: "DELIVERED", SMS: "QUEUED_PLACEHOLDER" },
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-cust-005",
      recipientId: "cust-001",
      recipientRole: "CUSTOMER",
      theatreId: "th-pun-001",
      type: "PROMOTIONAL_OFFER",
      category: "MARKETING",
      title: "Weekend Combo: 20% Off F&B Concessions",
      message:
        "Show your ticket at the food counter to claim 20% off on premium butter popcorn and gourmet nachos combo.",
      priority: "LOW",
      status: "READ",
      sourceModule: "ADMIN",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      archivedAt: null,
    }
  );

  // Theatre Admin Notifications (th-pun-001 - CineSphere Grand Cinemas, Pune)
  notificationsRepository.push(
    {
      id: "notif-th-001",
      recipientId: "th-pun-001",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-pun-001",
      type: "NEW_BOOKING",
      category: "BOOKING",
      title: "New Booking: BK-2027-005001",
      message:
        "Patron Aarav Mehta booked 2 seats (C10, C11) for 10:30 AM in Hall 1 - IMAX with Laser. Amount: ₹553.10.",
      priority: "NORMAL",
      status: "UNREAD",
      sourceModule: "BOOKING",
      referenceEntity: { type: "BOOKING", id: "bk-pun-uuid-001", link: "/theatre/bookings" },
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-th-002",
      recipientId: "th-pun-001",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-pun-001",
      type: "LOW_SEAT_AVAILABILITY",
      category: "SHOW",
      title: "Low Seat Inventory Alert: Pushpa 2",
      message:
        "Hall 1 - IMAX show at 10:30 AM has only 4 seats remaining (96% occupancy reached). Extra ushers requested at Door A.",
      priority: "HIGH",
      status: "UNREAD",
      sourceModule: "SHOW",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-th-003",
      recipientId: "th-pun-001",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-pun-001",
      type: "THEATRE_PAYMENT_RECEIVED",
      category: "PAYMENT",
      title: "Payment Received: ₹553.10 via UPI",
      message:
        "UPI payment of ₹553.10 settled to primary merchant VPA cinesphere.pune@icici.",
      priority: "NORMAL",
      status: "READ",
      sourceModule: "PAYMENT",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      archivedAt: null,
    },
    {
      id: "notif-th-004",
      recipientId: "th-pun-001",
      recipientRole: "THEATRE_ADMIN",
      theatreId: "th-pun-001",
      type: "HALL_UPDATED",
      category: "THEATRE",
      title: "Auditorium Telemetry Verified",
      message:
        "Hall 2 Dolby Vision laser dual-engine alignment report passed with 100% luminosity compliance.",
      priority: "LOW",
      status: "READ",
      sourceModule: "THEATRE",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      archivedAt: null,
    }
  );

  // Super Admin Platform Notifications
  notificationsRepository.push(
    {
      id: "notif-sa-001",
      recipientId: "super-admin-root",
      recipientRole: "SUPER_ADMIN",
      theatreId: null,
      type: "NEW_THEATRE_REGISTRATION",
      category: "THEATRE",
      title: "New Multiplex Application: CineWave Mumbai",
      message:
        "CineWave Megaplex (Bandra Kurla Complex, Mumbai) submitted an onboarding application requiring Super Admin compliance review.",
      priority: "HIGH",
      status: "UNREAD",
      sourceModule: "THEATRE",
      referenceEntity: { type: "THEATRE", id: "th-mum-002", link: "/dashboard/theatres" },
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-sa-002",
      recipientId: "super-admin-root",
      recipientRole: "SUPER_ADMIN",
      theatreId: null,
      type: "AUDIT_ALERT",
      category: "SECURITY",
      title: "KDM Key Expiry Advisory",
      message:
        "12 Christie 4K projectors at Apex Grand IMAX require renewed KDM decrypt print certificates before midnight.",
      priority: "CRITICAL",
      status: "UNREAD",
      sourceModule: "ADMIN",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-sa-003",
      recipientId: "super-admin-root",
      recipientRole: "SUPER_ADMIN",
      theatreId: null,
      type: "HIGH_TRAFFIC_ALERT",
      category: "SYSTEM",
      title: "High Traffic Velocity Warning",
      message:
        "Platform ticket reservation throughput reached 4,820 req/min during Pushpa 2 advance bookings.",
      priority: "HIGH",
      status: "UNREAD",
      sourceModule: "SYSTEM",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      readAt: null,
      archivedAt: null,
    },
    {
      id: "notif-sa-004",
      recipientId: "super-admin-root",
      recipientRole: "SUPER_ADMIN",
      theatreId: null,
      type: "PLATFORM_ANNOUNCEMENT",
      category: "SYSTEM",
      title: "Scheduled Maintenance Window",
      message:
        "Off-peak maintenance window scheduled for Tuesday 03:00 AM UTC for database index re-indexing.",
      priority: "LOW",
      status: "READ",
      sourceModule: "SYSTEM",
      channelDispatches: { IN_APP: "DELIVERED" },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      readAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      archivedAt: null,
    }
  );

  // Initial audit log
  recordNotificationAudit({
    action: "NOTIFICATION_CREATED",
    actor: { role: "SYSTEM_INITIALIZER" },
    details: { initialNotificationCount: notificationsRepository.length },
  });
}

// Initialize seed store
seedInitialNotifications();

export function resetNotificationEngineStore(): void {
  userPreferencesStore.clear();
  seedInitialNotifications();
}

// ------------------------------------------------------------------------------
// 6. Tenant-Isolated Retrieval & Mutation APIs
// ------------------------------------------------------------------------------

/**
 * Retrieves notifications for a specific Customer with strict tenant isolation.
 */
export function getCustomerNotifications(
  customerId: string,
  filters: NotificationFilterParams = {}
): NotificationListResult {
  if (!customerId) {
    return { notifications: [], totalCount: 0, unreadCount: 0, page: 1, limit: 10, totalPages: 0 };
  }

  // Strict tenant check: customer can only view own notifications
  let list = notificationsRepository.filter(
    (n) => n.recipientId === customerId && n.status !== "DELETED"
  );

  const unreadCount = list.filter((n) => n.status === "UNREAD").length;

  // Status Filter
  if (filters.status && filters.status !== "ALL") {
    list = list.filter((n) => n.status === filters.status);
  }

  // Priority Filter
  if (filters.priority && filters.priority !== "ALL") {
    list = list.filter((n) => n.priority === filters.priority);
  }

  // Category Filter
  if (filters.category && filters.category !== "ALL") {
    list = list.filter((n) => n.category === filters.category);
  }

  // Keyword Search
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.sourceModule.toLowerCase().includes(q)
    );
  }

  // Sort: newest first
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 15);
  const totalCount = list.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    notifications: paginated,
    totalCount,
    unreadCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Retrieves notifications for a Theatre Admin with strict theatre tenant isolation.
 */
export function getTheatreNotifications(
  theatreId: string,
  filters: NotificationFilterParams = {}
): NotificationListResult {
  if (!theatreId) {
    return { notifications: [], totalCount: 0, unreadCount: 0, page: 1, limit: 10, totalPages: 0 };
  }

  // Strict tenant check: only return notifications belonging to this theatre
  let list = notificationsRepository.filter(
    (n) => n.theatreId === theatreId && n.recipientRole === "THEATRE_ADMIN" && n.status !== "DELETED"
  );

  const unreadCount = list.filter((n) => n.status === "UNREAD").length;

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((n) => n.status === filters.status);
  }

  if (filters.priority && filters.priority !== "ALL") {
    list = list.filter((n) => n.priority === filters.priority);
  }

  if (filters.category && filters.category !== "ALL") {
    list = list.filter((n) => n.category === filters.category);
  }

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.sourceModule.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 15);
  const totalCount = list.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    notifications: paginated,
    totalCount,
    unreadCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Retrieves notifications for Super Admin (Platform-wide visibility).
 */
export function getSuperAdminNotifications(
  filters: NotificationFilterParams = {}
): NotificationListResult {
  let list = notificationsRepository.filter(
    (n) => n.recipientRole === "SUPER_ADMIN" && n.status !== "DELETED"
  );

  const unreadCount = list.filter((n) => n.status === "UNREAD").length;

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((n) => n.status === filters.status);
  }

  if (filters.priority && filters.priority !== "ALL") {
    list = list.filter((n) => n.priority === filters.priority);
  }

  if (filters.category && filters.category !== "ALL") {
    list = list.filter((n) => n.category === filters.category);
  }

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.sourceModule.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 20);
  const totalCount = list.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    notifications: paginated,
    totalCount,
    unreadCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Returns the count of unread notifications for a user/theatre.
 */
export function getUnreadCount(
  recipientId: string,
  role: RecipientRole = "CUSTOMER",
  theatreId?: string
): number {
  if (role === "SUPER_ADMIN") {
    return notificationsRepository.filter(
      (n) => n.recipientRole === "SUPER_ADMIN" && n.status === "UNREAD"
    ).length;
  }
  if (role === "THEATRE_ADMIN" && theatreId) {
    return notificationsRepository.filter(
      (n) => n.theatreId === theatreId && n.status === "UNREAD"
    ).length;
  }
  return notificationsRepository.filter(
    (n) => n.recipientId === recipientId && n.status === "UNREAD"
  ).length;
}

/**
 * Marks a notification as READ.
 */
export function markNotificationAsRead(
  id: string,
  actor?: { userId?: string; role: string }
): boolean {
  const notif = notificationsRepository.find((n) => n.id === id);
  if (!notif) return false;

  notif.status = "READ";
  notif.readAt = new Date().toISOString();

  recordNotificationAudit({
    notificationId: notif.id,
    action: "NOTIFICATION_READ",
    actor: actor || { role: notif.recipientRole },
    details: { notificationTitle: notif.title },
  });

  return true;
}

/**
 * Marks all notifications as READ for a recipient or cinema.
 */
export function markAllNotificationsAsRead(
  recipientId: string,
  role: RecipientRole = "CUSTOMER",
  theatreId?: string
): number {
  let count = 0;
  const now = new Date().toISOString();

  notificationsRepository.forEach((n) => {
    let match = false;
    if (role === "SUPER_ADMIN" && n.recipientRole === "SUPER_ADMIN") match = true;
    else if (role === "THEATRE_ADMIN" && theatreId && n.theatreId === theatreId) match = true;
    else if (n.recipientId === recipientId) match = true;

    if (match && n.status === "UNREAD") {
      n.status = "READ";
      n.readAt = now;
      count++;
    }
  });

  if (count > 0) {
    recordNotificationAudit({
      action: "NOTIFICATION_READ",
      actor: { userId: recipientId, role },
      details: { markedCount: count },
    });
  }

  return count;
}

/**
 * Archives a notification.
 */
export function archiveNotification(
  id: string,
  actor?: { userId?: string; role: string }
): boolean {
  const notif = notificationsRepository.find((n) => n.id === id);
  if (!notif) return false;

  notif.status = "ARCHIVED";
  notif.archivedAt = new Date().toISOString();

  recordNotificationAudit({
    notificationId: notif.id,
    action: "NOTIFICATION_ARCHIVED",
    actor: actor || { role: notif.recipientRole },
  });

  return true;
}

/**
 * Soft deletes a notification.
 */
export function deleteNotification(
  id: string,
  actor?: { userId?: string; role: string }
): boolean {
  const notif = notificationsRepository.find((n) => n.id === id);
  if (!notif) return false;

  notif.status = "DELETED";

  recordNotificationAudit({
    notificationId: notif.id,
    action: "NOTIFICATION_DELETED",
    actor: actor || { role: notif.recipientRole },
  });

  return true;
}

/**
 * Returns audit trail logs for notification operations.
 */
export function getNotificationAuditLogs(notificationId?: string): NotificationAuditLog[] {
  if (!notificationId) {
    return [...notificationAuditRepository];
  }
  return notificationAuditRepository.filter((a) => a.notificationId === notificationId);
}
