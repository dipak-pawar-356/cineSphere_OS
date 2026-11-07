import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Film } from "lucide-react";

export const metadata = {
  title: "Movies",
  description: "Browse premier releases and theatrical showtimes.",
};

export default function MoviesPage() {
  return (
    <PagePlaceholder
      badge="Theatrical Catalogue"
      icon={Film}
      title="Movies & Premieres"
      description="Browse upcoming blockbusters, indie festivals, and archival 70mm releases playing across connected partner cinema circuits."
      phase="Phase 2 Catalog Module"
      futureFeatures={[
        "Real-time Distributor Film Manifest Ingestion",
        "Multi-Format Filtering (IMAX, 4DX, Dolby Atmos)",
        "Automated Trailer Allocation & Content Censorship Badges",
        "Dynamic Showtime Booking Grid",
      ]}
    />
  );
}
