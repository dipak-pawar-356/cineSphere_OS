import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConnectedTheatreStaffWorkspace } from "@/components/theatre-staff";
import { theatreStaffService } from "@/lib/services/theatre-staff.service";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Staff & Dynamic RBAC Hierarchy | CineSphere OS",
};

export default async function TheatreStaffPage() {
  const theatreId = "th-pun-001";
  const theatreName = "Pune CineSphere Flagship";

  const bundle = await theatreStaffService.getOrganizationBundle(theatreId);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/theatre/profile">
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5 text-zinc-300 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile Hub
          </Button>
        </Link>
        <Link href={ROUTES.THEATRE_ADMIN.STAFF_MANAGERS}>
          <Button variant="outline" size="xs" className="border-[#2A3445] gap-1.5 text-zinc-300 hover:text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-[#F59E0B]" /> Hall Managers Console
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Field Staff Roster & Dynamic RBAC Hierarchy"
        subtitle={`${theatreName} • ${bundle.totalStaffCount} Crew Members • ${bundle.roles.length} Active Roles`}
        description="Manage theatre-specific staff organization, customizable roles, fine-grained access permissions, and departmental reporting structures with complete tenant isolation."
        badge={`${bundle.activeStaffCount} Active Crew`}
        badgeVariant="success"
      />

      <ConnectedTheatreStaffWorkspace
        initialBundle={bundle}
        theatreId={theatreId}
        theatreName={theatreName}
      />
    </div>
  );
}
