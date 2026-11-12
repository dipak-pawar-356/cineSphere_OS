"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TheatreProfileWorkspace } from "@/components/theatre-profile";
import { ArrowLeft } from "lucide-react";

export default function SuperAdminTheatreProfilesDirectoryPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/theatres">
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Lifecycle Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Fleet Theatre Profiles & Discovery Registry"
        subtitle="Manage decoupled public profiles, business capacity metrics, supported languages, social presence & completion scores across all cinema tenants."
        badge="SUPER_ADMIN"
        badgeVariant="primary"
      />

      <TheatreProfileWorkspace
        theatreId="th-pun-001"
        actorRole="SUPER_ADMIN"
        actorUserId="usr-super-1"
        actorName="Vikram Singhania"
        enableFleetExplorer={true}
        defaultView="explorer"
      />
    </div>
  );
}

