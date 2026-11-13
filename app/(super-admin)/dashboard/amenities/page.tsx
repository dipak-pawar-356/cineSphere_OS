import React from "react";
import { SuperAdminAmenityCatalogStudio } from "@/components/theatre-amenity";
import { theatreAmenityService } from "@/lib/services/theatre-amenity.service";

export const metadata = {
  title: "Master Luxury Amenities Catalog | Super Admin",
};

export default async function SuperAdminAmenitiesPage() {
  const [catalogRes, categories] = await Promise.all([
    theatreAmenityService.getCatalogItems({ pageSize: 100 }),
    theatreAmenityService.listCategories(),
  ]);

  return (
    <div className="pb-12">
      <SuperAdminAmenityCatalogStudio
        initialCatalog={catalogRes.items}
        categories={categories}
      />
    </div>
  );
}
