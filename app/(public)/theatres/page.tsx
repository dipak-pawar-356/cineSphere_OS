import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Theatres",
  description: "Explore multiplex complexes and auditoriums.",
};

export default function TheatresPage() {
  return (
    <PagePlaceholder
      badge="Exhibition Venues"
      icon={Building2}
      title="Theatres & Multiplex Circuits"
      description="Discover state-of-the-art cinema complexes equipped with Laser IMAX dual-projection, 128-channel spatial Dolby audio, and handcrafted leather recliners."
      phase="Phase 2 Venues Module"
      futureFeatures={[
        "Geo-fenced Metropolitan Complex Discovery",
        "Auditorium Specification Telemetry (Throw Distance, Lux, Audio)",
        "VIP Concessions Dine-In Menu Manifests",
        "Circuit Real-time Occupancy Telemetry",
      ]}
    />
  );
}
