import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Mail, Phone, MapPin, Building2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Contact & Enterprise Partnerships"
        subtitle="Connect with the CineSphere OS Architecture & Solutions Team"
        description="Whether you operate an international multiplex chain or a landmark independent film house, our enterprise solutions architects are available to assist with onboarding, hardware integrations, and custom migrations."
        badge="Enterprise Inquiry"
        badgeVariant="primary"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Global HQ</h3>
          <p className="text-xs text-[#94A3B8]">
            One World Trade Center, Suite 8500<br />New York, NY 10007, USA
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Enterprise Inquiries</h3>
          <p className="text-xs text-[#94A3B8]">
            partnerships@cinesphere.io<br />architecture@cinesphere.io
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Direct Line</h3>
          <p className="text-xs text-[#94A3B8]">
            +1 (800) 555-CINE (Toll-Free USA)<br />Available 24/7 for Circuit Ops
          </p>
        </div>
      </div>

      <ComingSoon
        moduleName="Interactive Circuit Onboarding & RFP Form"
        description="Our direct enterprise contract inquiry portal and automated SLA estimator will go live in Phase 2."
        versionLabel="v1.2 Exhibitor Gateway"
        icon={MessageSquare}
        backHref="/"
        backLabel="Return to Public Home"
      />
    </div>
  );
}
