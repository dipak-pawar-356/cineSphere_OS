import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Ticket, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Ticket Bookings | Theatre Admin",
};

export default function TheatreBookingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Local Box Office & Online Admissions"
        subtitle="Today's Ticket Reservations, Will-Call Holds & Gate Scans"
        description="Monitor live ticketing transactions, usher QR scanner validations at the door, and will-call kiosk pick-up statuses for this theatre."
        badge="Admissions Feed"
        badgeVariant="success"
      />

      <ComingSoon
        moduleName="Live Gate Flow & Seat Occupancy Monitor"
        description="Real-time auditorium entry velocity charts, will-call ticket lookup, and emergency seat relocation tools deploy in Phase 2."
        versionLabel="v1.2 Gate Flow"
        icon={Ticket}
        backHref="/theatre"
        backLabel="Back to Theatre Control"
      />
    </div>
  );
}

