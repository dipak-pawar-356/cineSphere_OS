import React from "react";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldCheck, Award, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Theatre Information & Compliance | CineSphere OS",
};

export default function TheatreInformationPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Information & Compliance"
        subtitle="Licensing, GSTIN compliance, municipal exhibition permits & capacity certification."
        badge="Legal Verified"
        badgeVariant="success"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Municipal Exhibition License</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">MH-PUN-CIN-88410</div>
          <p className="text-xs text-[#94A3B8]">Issued by Pune Municipal Corporation (PMC). Valid through Dec 2026.</p>
          <Badge variant="success" size="sm">Active & Valid</Badge>
        </Card>

        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">GSTIN Tax Entity</span>
            <FileText className="h-4 w-4 text-[#FBBF24]" />
          </div>
          <div className="text-lg font-bold font-mono text-white">27AAACC4912M1Z8</div>
          <p className="text-xs text-[#94A3B8]">Maharashtra Commercial Tax Authority. 18% Standard Ticket GST compliance.</p>
          <Badge variant="outline" size="sm">Verified</Badge>
        </Card>

        <Card variant="elevated" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Fire & Public Safety NOC</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">PUN-FIRE-NOC-2024-99</div>
          <p className="text-xs text-[#94A3B8]">Sprinkler, smoke evacuation, and wide emergency corridor certified.</p>
          <Badge variant="success" size="sm">Passed Inspection</Badge>
        </Card>
      </div>

      {/* Capacity & Structural Overview */}
      <Card variant="elevated" className="p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
          Physical Capacity & Architectural Specs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <span className="text-[#64748B]">Total Licensed Occupancy</span>
            <p className="text-xl font-bold font-mono text-white">850 Patrons</p>
            <p className="text-[10px] text-[#94A3B8]">Across 5 auditoriums</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <span className="text-[#64748B]">Emergency Exits</span>
            <p className="text-xl font-bold font-mono text-white">12 Dedicated Exits</p>
            <p className="text-[10px] text-emerald-400">Direct egress to mall atrium</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <span className="text-[#64748B]">Dedicated Wheelchair Bays</span>
            <p className="text-xl font-bold font-mono text-white">18 Companion Slots</p>
            <p className="text-[10px] text-[#94A3B8]">Compliant with Rights of PwD Act</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <span className="text-[#64748B]">Electrical Substation</span>
            <p className="text-xl font-bold font-mono text-white">750 kVA Dedicated</p>
            <p className="text-[10px] text-emerald-400">100% DG Backed (Zero-Drop UPS)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

