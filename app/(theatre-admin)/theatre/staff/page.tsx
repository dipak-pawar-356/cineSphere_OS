import React from "react";
import Link from "next/link";
import { THEATRE_STAFF } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, Plus, Eye, ShieldCheck, Clock } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Theatre Staff & Shift Roster | CineSphere OS",
};

export default function TheatreStaffPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Field Staff Roster & Operational Shifts"
        subtitle="15 Floor Ushers, Projectionists, Concession Leads & Hall Managers"
        description="Monitor staff duty allocations across auditoriums, verify active shift sign-ins, and inspect access privilege credentials."
        badge="Shift 2 Active"
        badgeVariant="success"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.THEATRE_ADMIN.STAFF_MANAGERS}>
              <Button variant="outline" size="sm" className="gap-2 border-[#2A3445]">
                <ShieldCheck className="h-4 w-4 text-[#FBBF24]" /> Hall Managers Only
              </Button>
            </Link>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Add Crew Member (Phase 2)
            </Button>
          </div>
        }
      />

      {/* Staff Table */}
      <Card variant="elevated" className="overflow-hidden border-[#2A3445]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase text-[10px] font-bold tracking-wider border-b border-[#2A3445]">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Designation & Role</th>
                <th className="py-3.5 px-4">Assigned Hall / Post</th>
                <th className="py-3.5 px-4">Current Shift</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60">
              {THEATRE_STAFF.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#161F2E]/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[#111827] border border-[#2A3445] shrink-0">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{staff.name}</span>
                        <span className="font-mono text-[10px] text-[#64748B]">{staff.employeeCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">{staff.designation}</span>
                    <span className="text-[10px] text-[#FBBF24]">{staff.role}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                    {staff.assignedHall}
                  </td>
                  <td className="py-3.5 px-4 text-[#94A3B8]">
                    {staff.shift}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#CBD5E1]">
                    {staff.phone}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={staff.status === "On Duty" ? "success" : "secondary"} size="sm" dot>
                      {staff.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/theatre/staff/${staff.id}`}>
                      <Button variant="outline" size="xs" className="gap-1 border-[#2A3445] text-xs">
                        <Eye className="h-3 w-3" /> View Crew
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
