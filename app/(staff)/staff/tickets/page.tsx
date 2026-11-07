import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { QrCode, Camera, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Gate Ticket Scanner | Staff Terminal",
};

export default function StaffTicketsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Gate Fast-Pass Scanner"
        subtitle="Offline-First Dynamic QR Reader • Rapid 0.8s Validation"
        description="Point terminal camera at patron mobile screen or paper pass. Green indicator validates seat, hall number, and prevents duplicate admissions."
        badge="Camera Active"
        badgeVariant="success"
      />

      <ComingSoon
        moduleName="High-Throughput WebRTC Camera Barcode Scanner"
        description="Direct hardware camera stream integration with real-time sound beep confirmation and seat map validation deploys in Phase 2."
        versionLabel="v1.2 POS Engine"
        icon={QrCode}
        backHref="/staff"
        backLabel="Back to Shift Dashboard"
      />
    </div>
  );
}

