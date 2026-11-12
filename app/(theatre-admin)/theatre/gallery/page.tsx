"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import { TheatreBrandingMediaWorkspace } from "@/components/theatre-media";

export default function TheatreGalleryPage() {
  const { profile } = useTheatreStore();

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Visual Gallery"
        subtitle={`Ordered Exhibition Venue Photography • ${profile.name} (${profile.code})`}
        description="Upload, replace, drag-and-drop reorder, and curate high-resolution photography of auditoriums, luxury VIP suites, foyer lounges, and projection booths."
        badge="Ordered Gallery Matrix"
        badgeVariant="primary"
      />

      <TheatreBrandingMediaWorkspace
        theatreId="th-pun-001"
        actorRole="THEATRE_ADMIN"
        actorUserId="usr-theatre-1"
        actorName="Aditi Kulkarni"
        defaultView="gallery"
      />
    </div>
  );
}
