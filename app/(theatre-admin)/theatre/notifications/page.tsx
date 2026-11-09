import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getTheatreNotifications, getUnreadCount } from "@/lib/engine/notification-engine";
import { TheatreNotificationsClient } from "./theatre-notifications-client";

export const metadata = {
  title: "Notification Center | CineSphere OS",
  description: "Hardware Sensor Telemetry, Box Office Milestones & Turnstile Alerts.",
};

export const dynamic = "force-dynamic";

export default async function TheatreNotificationsPage() {
  const theatreId = "th-pun-001";
  const result = getTheatreNotifications(theatreId);
  const unreadCount = getUnreadCount(theatreId, "THEATRE_ADMIN", theatreId);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Notification Center & Operational Dispatch"
        subtitle="Hardware Sensor Telemetry, Box Office Milestones & Turnstile Alerts"
        description="Monitor real-time cinema operations, patron gate check-ins, show schedule alerts, and payment settlement notifications."
        badge={`${unreadCount} Unread Alerts`}
        badgeVariant={unreadCount > 0 ? "danger" : "primary"}
      />

      <TheatreNotificationsClient
        initialNotifications={result.notifications}
        initialUnreadCount={unreadCount}
        theatreId={theatreId}
      />
    </div>
  );
}
