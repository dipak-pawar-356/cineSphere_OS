import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Ticket, Calendar, QrCode } from "lucide-react";

export const metadata = {
  title: "My Bookings | CineSphere Patron Portal",
};

export default function CustomerBookingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Active & Past Movie Bookings"
        subtitle="Review Upcoming Showtimes, Reserved Seats & Receipts"
        description="View your digital ticket confirmations, check hall gate opening times, or request instant cancellations up to 2 hours prior to showtime."
        badge="2 Upcoming"
        badgeVariant="success"
      />

      <ComingSoon
        moduleName="Booking Management & Cancellation Self-Service"
        description="One-click digital ticket cancellations, seat reassignments, and wallet refunds will activate in Phase 2."
        versionLabel="v1.2 Ticketing Flow"
        icon={Ticket}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}

