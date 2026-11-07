import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Events",
  description: "Live concert simulcasts, sporting championships, and stage theatre.",
};

export default function EventsPage() {
  return (
    <PagePlaceholder
      badge="Live Simulcasts"
      icon={Calendar}
      title="Events & Stage Broadcasts"
      description="Experience world heavyweight boxing championships, international esports grand finals, and classical symphonic tours broadcast live to giant cinema auditoriums."
      phase="Phase 2 Simulcasts Module"
      futureFeatures={[
        "4K Satellite Stream Manifest Decoupling",
        "Reserved Hall Simulcast Capacity Allocation",
        "Early Bird Pass Pre-Registrations",
        "Spatial Audio Simulcast Calibration",
      ]}
    />
  );
}
