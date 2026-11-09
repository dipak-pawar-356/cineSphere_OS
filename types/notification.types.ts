import { ID } from "./common.types";

/**
 * ==============================================================================
 * CineSphere OS - Centralized Notification & Communication System Types
 * Phase 2 - Part 14
 * 
 * Event-Driven Architecture:
 * Modules Publish Events → Event Bus → Notification Service → Multi-Channel Dispatch
 * (In-App live; Email, SMS, Push, WhatsApp, Telegram architecture placeholders)
 * ==============================================================================
 */

export type RecipientRole = "CUSTOMER" | "THEATRE_ADMIN" | "SUPER_ADMIN" | "STAFF";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED" | "DELETED";

export type NotificationCategory =
  | "BOOKING"
  | "PAYMENT"
  | "TICKET"
  | "SHOW"
  | "THEATRE"
  | "SECURITY"
  | "MARKETING"
  | "SYSTEM";

export type NotificationChannel =
  | "IN_APP"
  | "EMAIL"
  | "SMS"
  | "PUSH"
  | "WHATSAPP"
  | "TELEGRAM"
  | "WEBHOOK";

export type ChannelDispatchStatus =
  | "DELIVERED"
  | "QUEUED_PLACEHOLDER"
  | "OPTED_OUT"
  | "DISABLED"
  | "SUPPRESSED";

export type SourceModule =
  | "BOOKING"
  | "PAYMENT"
  | "SHOW"
  | "TICKET"
  | "THEATRE"
  | "ADMIN"
  | "SYSTEM";

/**
 * All supported notification types across Customer, Theatre Admin, and Super Admin.
 */
export type NotificationType =
  // Customer Types
  | "BOOKING_CONFIRMATION"
  | "BOOKING_CANCELLED"
  | "BOOKING_EXPIRED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "TICKET_GENERATED"
  | "SHOW_REMINDER"
  | "SHOW_CANCELLED"
  | "SHOW_RESCHEDULED"
  | "SEAT_CHANGE"
  | "PROMOTIONAL_OFFER"
  // Theatre Admin Types
  | "NEW_BOOKING"
  | "THEATRE_BOOKING_CANCELLED"
  | "THEATRE_PAYMENT_RECEIVED"
  | "REFUND_REQUESTED"
  | "SHOW_UPDATED"
  | "SHOW_CANCELLED_ADMIN"
  | "MOVIE_PUBLISHED"
  | "HALL_UPDATED"
  | "PAYMENT_CONFIG_UPDATED"
  | "LOW_SEAT_AVAILABILITY"
  // Super Admin Types
  | "NEW_THEATRE_REGISTRATION"
  | "THEATRE_APPROVAL_REQUIRED"
  | "THEATRE_SUSPENDED"
  | "PLATFORM_ERROR"
  | "HIGH_TRAFFIC_ALERT"
  | "AUDIT_ALERT"
  | "SUBSCRIPTION_EXPIRY"
  | "PLATFORM_ANNOUNCEMENT"
  | "SYSTEM"
  // Legacy / Lowercase compatibility aliases
  | "booking"
  | "payment"
  | "theatre"
  | "movie"
  | "show"
  | "staff"
  | "alert"
  | "approval"
  | "system";

export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export interface NotificationReferenceEntity {
  type: "BOOKING" | "TICKET" | "PAYMENT" | "SHOW" | "THEATRE" | "CUSTOMER";
  id: string;
  link?: string;
}

/**
 * Enterprise Notification representation.
 */
export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientRole: RecipientRole;
  theatreId?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  sourceModule: SourceModule;
  referenceEntity?: NotificationReferenceEntity;
  channelDispatches: Record<string, ChannelDispatchStatus>;
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO 8601
  readAt?: string | null;
  archivedAt?: string | null;
}

/**
 * Legacy interface alias for existing components
 */
export interface SystemNotification {
  id: ID;
  title: string;
  message: string;
  type: NotificationType;
  state: "unread" | "read";
  time: string;
  severity: NotificationSeverity;
  theatreId?: ID;
}

/**
 * Domain Event Types published by modules into the Centralized Event Bus.
 */
export type DomainEventType =
  // Customer events
  | "BookingCreated"
  | "BookingConfirmed"
  | "BookingCancelled"
  | "BookingExpired"
  | "PaymentSucceeded"
  | "PaymentFailed"
  | "PaymentRefunded"
  | "TicketIssued"
  | "TicketCancelled"
  | "ShowReminder"
  | "ShowCancelled"
  | "ShowRescheduled"
  | "SeatChanged"
  | "PromotionalOfferAnnounced"
  // Theatre Admin events
  | "NewBookingReceived"
  | "TheatreBookingCancelled"
  | "TheatrePaymentReceived"
  | "RefundRequested"
  | "ShowUpdated"
  | "ShowCancelledByAdmin"
  | "MoviePublished"
  | "HallUpdated"
  | "PaymentConfigUpdated"
  | "LowSeatAvailability"
  // Super Admin events
  | "NewTheatreRegistered"
  | "TheatreApprovalRequired"
  | "TheatreSuspended"
  | "PlatformErrorOccurred"
  | "HighTrafficAlert"
  | "SecurityAuditAlert"
  | "SubscriptionExpiring"
  | "PlatformAnnouncement";

/**
 * Strongly typed Domain Event container.
 */
export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  type: DomainEventType;
  sourceModule: SourceModule;
  occurredAt: string;
  actor: {
    userId?: string;
    role: string;
    ip?: string;
  };
  payload: T;
}

/**
 * Dynamic Notification Template definition with placeholder tokens.
 */
export interface NotificationTemplate {
  key: string;
  category: NotificationCategory;
  defaultPriority: NotificationPriority;
  targetRole: RecipientRole;
  titleTemplate: string;
  messageTemplate: string;
}

/**
 * User Channel & Category Preferences.
 */
export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
  };
  categories: {
    bookingUpdates: boolean;
    paymentReceipts: boolean;
    ticketPasses: boolean;
    showReminders: boolean;
    promotionalOffers: boolean;
    securityAlerts: boolean;
  };
  updatedAt: string;
}

export interface CreateNotificationInput {
  recipientId: string;
  recipientRole: RecipientRole;
  theatreId?: string | null;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  priority?: NotificationPriority;
  sourceModule?: SourceModule;
  referenceEntity?: NotificationReferenceEntity;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilterParams {
  query?: string;
  recipientId?: string;
  recipientRole?: RecipientRole;
  theatreId?: string;
  status?: NotificationStatus | "ALL";
  priority?: NotificationPriority | "ALL";
  category?: NotificationCategory | "ALL";
  sourceModule?: SourceModule | "ALL";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface NotificationListResult {
  notifications: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type NotificationAuditAction =
  | "NOTIFICATION_CREATED"
  | "NOTIFICATION_DELIVERED"
  | "NOTIFICATION_READ"
  | "NOTIFICATION_ARCHIVED"
  | "NOTIFICATION_DELETED"
  | "PREFERENCES_UPDATED";

export interface NotificationAuditLog {
  id: string;
  notificationId?: string;
  action: NotificationAuditAction;
  actor: {
    userId?: string;
    role: string;
    ip?: string;
  };
  timestamp: string;
  details: Record<string, unknown>;
}

export interface NotificationDispatchResult {
  eventId: string;
  eventType: DomainEventType;
  dispatchedCount: number;
  notifications: NotificationItem[];
}
