import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Privacy Policy"
        subtitle="Last Revised: November 2026 • Enterprise Compliance v2.4"
        description="CineSphere OS is committed to protecting patron personal information, payment credentials, and circuit operational telemetry in strict compliance with GDPR, CCPA, and global privacy standards."
        badge="Legal & Trust"
        badgeVariant="success"
      />

      <div className="space-y-6 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#FBBF24]" />
            1. Data Encryption & Storage Boundaries
          </h3>
          <p>
            All patron reservation data, payment tokens, and authentication identities are encrypted at rest using AES-256 and transmitted over TLS 1.3 channels. Individual cinema tenant databases maintain cryptographic isolation to prevent cross-tenant data leakage.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-[#38BDF8]" />
            2. Information We Collect
          </h3>
          <p>
            We collect information required to deliver ticketing and auditorium reservation services, including contact email, phone numbers for ticket SMS verification, and localized cinema preferences. We do not sell or monetize personal patron profiles.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            3. Patron Rights & Data Deletion
          </h3>
          <p>
            Patrons hold the right to request comprehensive export or complete erasure of their account records, past booking history, and stored preferences at any time through our automated privacy dashboard or by contacting privacy@cinesphere.io.
          </p>
        </section>
      </div>
    </div>
  );
}
