import React from "react";
import Link from "next/link";
import { THEATRE_STAFF } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Calendar, ShieldCheck, CheckCircle2, Building, AlertCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { theatreStaffService } from "@/lib/services/theatre-staff.service";
import { StaffStatusBadge } from "@/components/theatre-staff/staff-status-badge";

export const metadata = {
  title: "Crew Member Profile | CineSphere OS",
};

export default async function TheatreStaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const dynamicStaff = await theatreStaffService.getStaffById(resolvedParams.id);
  const fallbackLegacy = THEATRE_STAFF.find((s) => s.id === resolvedParams.id) || THEATRE_STAFF[0];

  const displayName = dynamicStaff ? dynamicStaff.displayName : fallbackLegacy.name;
  const designation = dynamicStaff ? dynamicStaff.designation : fallbackLegacy.designation;
  const employeeCode = dynamicStaff ? dynamicStaff.employeeCode : fallbackLegacy.employeeCode;
  const email = dynamicStaff ? dynamicStaff.email : fallbackLegacy.email;
  const phone = dynamicStaff ? dynamicStaff.phone : fallbackLegacy.phone;
  const status = dynamicStaff ? dynamicStaff.employmentStatus : (fallbackLegacy.status === "On Duty" ? "ACTIVE" : "INACTIVE");
  const avatar = dynamicStaff?.avatarUrl || fallbackLegacy.avatar;
  const departmentName = dynamicStaff?.department?.name || fallbackLegacy.assignedHall;
  const joiningDate = dynamicStaff?.joiningDate ? new Date(dynamicStaff.joiningDate).toLocaleDateString("en-IN") : fallbackLegacy.joiningDate;
  const emergencyContact = dynamicStaff?.emergencyContact;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.STAFF}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Staff Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title={displayName}
        subtitle={`${designation} • ${employeeCode}`}
        description="Operational duty assignments, emergency escalation contacts, assigned capabilities, and tenant compliance status."
        badge={status}
        badgeVariant={status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "danger" : "secondary"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 text-center space-y-4">
          <div className="h-28 w-28 rounded-full overflow-hidden bg-[#111827] border-2 border-[#FBBF24] mx-auto shadow-xl">
            <img
              src={avatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{displayName}</h2>
            <span className="text-xs text-[#FBBF24] font-semibold">{designation}</span>
            <span className="text-[10px] text-[#64748B] block font-mono">{employeeCode}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {dynamicStaff?.roles?.map((r) => (
              <Badge key={r.id} variant={r.id === dynamicStaff.primaryRole?.id ? "warning" : "outline"} className="text-[10px]">
                {r.name} {r.id === dynamicStaff.primaryRole?.id && "(Primary)"}
              </Badge>
            ))}
          </div>

          <div className="pt-3 border-t border-[#2A3445] space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Department</span>
              <span className="font-semibold text-white">{departmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Phone</span>
              <span className="font-mono text-white">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Official Email</span>
              <span className="font-mono text-[#CBD5E1] truncate block max-w-[160px]">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Joined Complex</span>
              <span className="font-mono text-[#CBD5E1]">{joiningDate}</span>
            </div>
            {emergencyContact && (
              <div className="pt-2 border-t border-[#2A3445]/50">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Emergency Contact</span>
                <div className="text-zinc-300 text-xs">
                  {emergencyContact.name} ({emergencyContact.relationship}) • {emergencyContact.phone}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Dynamic Role Permissions & Capabilities
            </h3>

            {dynamicStaff ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  This crew member holds {dynamicStaff.roles.length} assigned role(s) with access to {dynamicStaff.permissions.length} module capability grant(s).
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {dynamicStaff.permissions.map((p) => (
                    <span key={p} className="px-2 py-1 rounded text-[10px] font-mono bg-[#0D1525] border border-[#2A3445] text-zinc-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {[
                  { title: "Barco Series 4 Laser Master Certification", desc: "Authorized to calibrate projector laser output curves and RGB prism blocks." },
                  { title: "Dolby Cinema SMPTE Audio Sweep Level 2", desc: "Clearance to adjust 64-channel Atmos EQ profiles and delay arrays." },
                  { title: "Fire Safety & Evacuation Chief Warden", desc: "Trained on emergency exit automation and smoke-damper interlocks." },
                ].map((cert, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">{cert.title}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] pl-6">{cert.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

