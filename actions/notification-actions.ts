"use server";

import { revalidatePath } from "next/cache";
import {
  CreateNotificationInput,
  DomainEvent,
  NotificationAuditLog,
  NotificationDispatchResult,
  NotificationFilterParams,
  NotificationItem,
  NotificationListResult,
  NotificationPreferences,
  RecipientRole,
} from "@/types/notification.types";
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
  publishDomainEvent,
  updateUserPreferences,
} from "@/lib/engine/notification-engine";

export interface NotificationActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Publishes a domain event to the Central Notification Engine.
 * Decouples domain modules (Booking, Payment, Show, Ticket) from notification channels.
 */
export async function publishDomainEventAction<T extends Record<string, unknown>>(
  event: DomainEvent<T>
): Promise<NotificationActionResponse<NotificationDispatchResult>> {
  try {
    const dispatchResult = publishDomainEvent(event);

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: `Event '${event.type}' dispatched; ${dispatchResult.dispatchedCount} notification(s) generated.`,
      data: dispatchResult,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to publish domain event.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Directly creates a notification (e.g. for administrative or custom alerts).
 */
export async function createNotificationAction(
  input: CreateNotificationInput
): Promise<NotificationActionResponse<NotificationItem>> {
  try {
    const notification = createNotification(input);

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification created successfully.",
      data: notification,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create notification.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Marks a single notification as read.
 */
export async function markNotificationReadAction(
  id: string,
  actor?: { userId?: string; role: RecipientRole }
): Promise<NotificationActionResponse<boolean>> {
  try {
    const updated = markNotificationAsRead(id, actor);
    if (!updated) {
      return {
        success: false,
        error: "Notification not found or already read.",
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification marked as read.",
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to mark notification as read.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Marks all notifications as read for a recipient.
 */
export async function markAllNotificationsReadAction(
  recipientId: string,
  role: RecipientRole,
  theatreId?: string
): Promise<NotificationActionResponse<number>> {
  try {
    const count = markAllNotificationsAsRead(recipientId, role, theatreId);

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: `Marked ${count} notification(s) as read.`,
      data: count,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to mark all notifications as read.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Archives a notification.
 */
export async function archiveNotificationAction(
  id: string,
  actor?: { userId?: string; role: string }
): Promise<NotificationActionResponse<boolean>> {
  try {
    const archived = archiveNotification(id, actor);
    if (!archived) {
      return {
        success: false,
        error: "Notification not found.",
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification archived.",
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive notification.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Soft-deletes a notification.
 */
export async function deleteNotificationAction(
  id: string,
  actor?: { userId?: string; role: string }
): Promise<NotificationActionResponse<boolean>> {
  try {
    const deleted = deleteNotification(id, actor);
    if (!deleted) {
      return {
        success: false,
        error: "Notification not found.",
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/profile/notifications");
    revalidatePath("/theatre/notifications");
    revalidatePath("/dashboard/notifications");

    return {
      success: true,
      message: "Notification deleted.",
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete notification.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves notifications for a customer with tenant isolation.
 */
export async function retrieveCustomerNotificationsAction(
  customerId: string,
  params?: NotificationFilterParams
): Promise<NotificationActionResponse<NotificationListResult>> {
  try {
    const result = getCustomerNotifications(customerId, params);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve customer notifications.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves notifications for a theatre admin with theatre-level tenant isolation.
 */
export async function retrieveTheatreNotificationsAction(
  theatreId: string,
  params?: NotificationFilterParams
): Promise<NotificationActionResponse<NotificationListResult>> {
  try {
    const result = getTheatreNotifications(theatreId, params);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve theatre notifications.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves notifications for Super Admin platform-wide operations.
 */
export async function retrieveSuperAdminNotificationsAction(
  params?: NotificationFilterParams
): Promise<NotificationActionResponse<NotificationListResult>> {
  try {
    const result = getSuperAdminNotifications(params);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve super admin notifications.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves unread notification count.
 */
export async function retrieveUnreadCountAction(
  recipientId: string,
  role?: RecipientRole,
  theatreId?: string
): Promise<NotificationActionResponse<number>> {
  try {
    const count = getUnreadCount(recipientId, role, theatreId);
    return {
      success: true,
      data: count,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve unread count.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves user notification preferences.
 */
export async function retrievePreferencesAction(
  userId: string
): Promise<NotificationActionResponse<NotificationPreferences>> {
  try {
    const prefs = getUserPreferences(userId);
    return {
      success: true,
      data: prefs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve notification preferences.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Updates user notification preferences (channel & category opt-ins/opt-outs).
 */
export async function updatePreferencesAction(
  userId: string,
  updates: Partial<Pick<NotificationPreferences, "channels" | "categories">>
): Promise<NotificationActionResponse<NotificationPreferences>> {
  try {
    const prefs = updateUserPreferences(userId, updates);
    return {
      success: true,
      message: "Preferences updated successfully.",
      data: prefs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update notification preferences.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieves immutable notification audit logs.
 */
export async function getNotificationAuditLogsAction(
  notificationId?: string
): Promise<NotificationActionResponse<NotificationAuditLog[]>> {
  try {
    const logs = getNotificationAuditLogs(notificationId);
    return {
      success: true,
      data: logs,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve notification audit logs.";
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}
