"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import { TheatreBrandingMediaWorkspace } from "@/components/theatre-media";

export default function TheatreMediaManagementPage() {
  const { profile } = useTheatreStore();

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Branding & Media Vault"
        subtitle={`Tenant Media Collection • ${profile.name} (${profile.code})`}
        description="Manage single-active brand identity slots (Logo, Banner, Cover, Hero, Thumbnail), ordered venue gallery photography, immutable asset versions & audit history."
        badge="Tenant Isolated DAM"
        badgeVariant="primary"
      />

      <TheatreBrandingMediaWorkspace
        theatreId="th-pun-001"
        actorRole="THEATRE_ADMIN"
        actorUserId="usr-theatre-1"
        actorName="Aditi Kulkarni"
        defaultView="branding"
      />
    </div>
  );
}
