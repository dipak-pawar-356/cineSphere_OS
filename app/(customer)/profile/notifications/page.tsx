import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  getCustomerNotifications,
  getUnreadCount,
  getUserPreferences,
} from "@/lib/engine/notification-engine";
import { CustomerNotificationsClient } from "./customer-notifications-client";

export const metadata = {
  title: "Patron Notifications & Alerts | CineSphere OS",
  description: "Review real-time booking receipts, admission pass issuances, and showtime reminders.",
};

export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage() {
  const customerId = "cust-001";
  const notificationsResult = getCustomerNotifications(customerId);
  const unreadCount = getUnreadCount(customerId, "CUSTOMER");
  const preferences = getUserPreferences(customerId);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Patron Activity & Ticket Updates"
        subtitle="Booking Confirmations, Gate Opening Reminders & Concession Deals"
        description="Review all messages sent to your account regarding showtime changes, auditorium opening reminders, and loyalty bonus points."
        badge={`${unreadCount} Unread Alerts`}
        badgeVariant={unreadCount > 0 ? "warning" : "primary"}
      />

      <CustomerNotificationsClient
        initialNotifications={notificationsResult.notifications}
        initialUnreadCount={unreadCount}
        initialPreferences={preferences}
        customerId={customerId}
      />
    </div>
  );
}
