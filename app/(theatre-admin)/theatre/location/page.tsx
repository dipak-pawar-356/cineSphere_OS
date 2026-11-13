"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TheatreLocationWorkspace } from "@/components/theatre-location";
import { Building2, Compass, ArrowLeft } from "lucide-react";

export default function TheatreAdminLocationPage() {
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
        title="Physical Address & Geographic Location"
        subtitle="Manage physical street address, GPS coordinates, Google Maps routing, and geospatial catchment area for CineSphere Grand Cinemas (Pune)."
        badge="THEATRE_ADMIN"
        badgeVariant="primary"
      />

      <TheatreLocationWorkspace
        theatreId="th-pun-001"
        actorRole="THEATRE_ADMIN"
        actorUserId="usr-th-pun"
        actorName="Aditi Rao"
        enableFleetExplorer={false}
        defaultView="overview"
      />
    </div>
  );
}
