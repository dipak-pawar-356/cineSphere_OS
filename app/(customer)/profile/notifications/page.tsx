import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Bell, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Patron Notifications | CineSphere Patron Portal",
};

export default function CustomerNotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Activity & Ticket Updates"
        subtitle="Booking Confirmations, Gate Opening Reminders & Concession Deals"
        description="Review all messages sent to your account regarding showtime changes, auditorium opening reminders, and loyalty bonus points."
        badge="Notifications"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Real-Time Showtime SMS & Push Notification Hub"
        description="Unified notification preference matrix and message archive deploy in Phase 2."
        versionLabel="v1.2 Notification Hub"
        icon={Bell}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}
