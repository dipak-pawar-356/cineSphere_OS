import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { QrCode, Smartphone, Sparkles } from "lucide-react";

export const metadata = {
  title: "Digital Tickets & QR | CineSphere Patron Portal",
};

export default function CustomerTicketsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Digital Tickets & Fast-Pass QR"
        subtitle="Apple Wallet & Google Pay Passes • Dynamic Security Verification"
        description="Access dynamic QR admission codes with cryptographic offline verification for zero-delay usher scanning at the auditorium door."
        badge="Live QR Active"
        badgeVariant="primary"
      />

      <ComingSoon
        moduleName="Apple Wallet Pass & Offline Dynamic QR Engine"
        description="PassKit `.pkpass` downloads, Google Wallet synchronization, and offline brightness boost activate in Phase 2."
        versionLabel="v1.2 Mobile Passes"
        icon={QrCode}
        backHref="/profile"
        backLabel="Back to Profile"
      />
    </div>
  );
}
