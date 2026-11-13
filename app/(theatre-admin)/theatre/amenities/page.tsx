import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedAmenityWorkspace } from "@/components/theatre-amenity";
import { theatreAmenityService } from "@/lib/services/theatre-amenity.service";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Amenities & Facilities | CineSphere OS",
};

export default async function TheatreAmenitiesPage() {
  const theatreId = "th-pun-001";
  const theatreName = "CineSphere Grand Cinemas (Phoenix Marketcity, Pune)";

  const [bundle, catalogRes] = await Promise.all([
    theatreAmenityService.getTheatreAmenityBundle(theatreId),
    theatreAmenityService.getCatalogItems({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/theatre/profile">
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile Hub
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Amenities, Comfort & Guest Facilities"
        subtitle="Manage customer comfort features, projection acoustics, dining options, and accessibility provisions for CineSphere Grand Cinemas."
        badge={`${bundle.totalAssigned} Configured Facilities`}
        badgeVariant="primary"
      />

      <ConnectedAmenityWorkspace
        theatreId={theatreId}
        theatreName={theatreName}
        isSuperAdmin={false}
        initialBundle={{
          assignments: bundle.assignments,
          categories: bundle.categories,
        }}
        initialCatalog={catalogRes.items}
      />
    </div>
  );
}
