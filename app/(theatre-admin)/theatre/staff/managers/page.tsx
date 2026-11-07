import React from "react";
import Link from "next/link";
import { THEATRE_STAFF } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Mail, Phone } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Hall Managers & Supervisors | CineSphere OS",
};

export default function TheatreStaffManagersPage() {
  const managers = THEATRE_STAFF.filter(
    (s) => s.role === "Theatre Admin" || s.role === "Hall Manager"
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.STAFF}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Full Crew Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Auditorium Hall Managers & Shift Supervisors"
        subtitle="Key Operational Duty Leads with Hardware Access and Override Clearance"
        badge="Supervisors"
        badgeVariant="warning"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map((m) => (
          <Card key={m.id} variant="elevated" className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{m.name}</h3>
                <span className="text-xs text-[#FBBF24] font-semibold">{m.designation}</span>
                <span className="text-[10px] text-[#64748B] block font-mono">{m.employeeCode}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#2A3445] text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Assigned Jurisdiction</span>
                <span className="font-semibold text-white">{m.assignedHall}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Shift Schedule</span>
                <span className="text-[#CBD5E1]">{m.shift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Duty Status</span>
                <Badge variant={m.status === "On Duty" ? "success" : "secondary"} size="sm" dot>
                  {m.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

