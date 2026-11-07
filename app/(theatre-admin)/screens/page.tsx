import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Monitor } from "lucide-react";

export const metadata = {
  title: "Screen Operations",
  description: "Theatre admin screen & hall operations.",
};

export default function ScreensPage() {
  return (
    <PagePlaceholder
      badge="Auditorium Operations"
      icon={Monitor}
      targetRole="Theatre Admin & Hall Manager"
      title="Screen & Hall Management"
      description="Configure physical auditorium capacities, laser projector calibrations, audio channels, and daily cleaning buffer turnarounds."
      phase="Phase 2 Exhibition Module"
      futureFeatures={[
        "Interactive Screen Aspect Ratio & Curvature Editor",
        "Dolby Atmos Speaker Array Configuration",
        "Hardware Sensor Temperature & Lamp Hours Telemetry",
        "Automated Intermission & Show Interval Balancing",
      ]}
    />
  );
}
