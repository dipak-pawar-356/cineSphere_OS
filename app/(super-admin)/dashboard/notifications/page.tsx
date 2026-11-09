import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  getNotificationAuditLogs,
  getSuperAdminNotifications,
} from "@/lib/engine/notification-engine";
import { SuperAdminNotificationsClient } from "./super-admin-notifications-client";

export const metadata = {
  title: "Central Notification Center | CineSphere OS",
  description:
    "System Alerts, Hardware Warnings, Distributor KDM Advisories & Security Incidents.",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminNotificationsPage() {
  const result = getSuperAdminNotifications();
  const auditLogs = getNotificationAuditLogs();

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Central Notification Center"
        subtitle="System Alerts, Hardware Warnings, Distributor KDM Advisories & Security Incidents"
        description="Review critical operational events, laser projector SNMP traps, settlement notices, and firewall alerts."
        badge={`${result.unreadCount} Unread Alerts`}
        badgeVariant={result.unreadCount > 0 ? "danger" : "primary"}
      />

      <SuperAdminNotificationsClient
        initialNotifications={result.notifications}
        initialUnreadCount={result.unreadCount}
        initialAuditLogs={auditLogs}
      />
    </div>
  );
}
