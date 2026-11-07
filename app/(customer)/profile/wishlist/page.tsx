import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Heart, Bell, Film } from "lucide-react";

export const metadata = {
  title: "Watchlist & Alerts | CineSphere Patron Portal",
};

export default function CustomerWishlistPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My Watchlist & Advance Booking Alerts"
        subtitle="Saved Upcoming Blockbusters & IMAX Release Notifications"
        description="Get notified the exact second advance ticket sales open for your favorite franchises, directors, and midnight festival screenings."
        badge="4 Saved Movies"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Advance Ticket Drop Instant Push Alerts"
        description="Instant SMS and browser push notifications when advance bookings open for saved films connect in Phase 2."
        versionLabel="v1.2 Patron Alerts"
        icon={Heart}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}
