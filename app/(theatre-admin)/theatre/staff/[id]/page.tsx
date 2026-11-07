import React from "react";
import Link from "next/link";
import { THEATRE_STAFF } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Crew Member Profile | CineSphere OS",
};

export default async function TheatreStaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const staff = THEATRE_STAFF.find((s) => s.id === resolvedParams.id) || THEATRE_STAFF[0];

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
        title={staff.name}
        subtitle={`${staff.designation} • ${staff.employeeCode}`}
        description="Operational duty assignments, emergency escalation contacts, and biometric credentials verification."
        badge={staff.status}
        badgeVariant={staff.status === "On Duty" ? "success" : "secondary"}
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <ShieldCheck className="h-4 w-4" /> Change Clearance Level (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 text-center space-y-4">
          <div className="h-28 w-28 rounded-full overflow-hidden bg-[#111827] border-2 border-[#FBBF24] mx-auto shadow-xl">
            <img
              src={staff.avatar}
              alt={staff.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{staff.name}</h2>
            <span className="text-xs text-[#FBBF24] font-semibold">{staff.role}</span>
            <span className="text-[10px] text-[#64748B] block font-mono">{staff.employeeCode}</span>
          </div>

          <div className="pt-3 border-t border-[#2A3445] space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Assigned Hall</span>
              <span className="font-semibold text-white">{staff.assignedHall}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Phone</span>
              <span className="font-mono text-white">{staff.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Official Email</span>
              <span className="font-mono text-[#CBD5E1] truncate block max-w-[160px]">{staff.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Shift Schedule</span>
              <span className="text-white">{staff.shift}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Joined Complex</span>
              <span className="font-mono text-[#CBD5E1]">{staff.joiningDate}</span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Operational Certifications & Clearance
            </h3>

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
          </Card>
        </div>
      </div>
    </div>
  );
}

