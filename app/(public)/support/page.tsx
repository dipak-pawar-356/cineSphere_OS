import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { HelpCircle, FileText, Headphones, ShieldAlert, BookOpen } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Customer Concierge & Help Center"
        subtitle="24/7 Ticketing Support, Hall Inquiries & Booking Assistance"
        description="Find answers to questions regarding your digital tickets, refund policies, loyalty tier perks, and theatre accessibility services."
        badge="24/7 Concierge"
        badgeVariant="info"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Ticket Self-Service</h3>
          <p className="text-xs text-[#94A3B8]">
            Manage booking references, seat changes, and cancellations up to 2 hours before showtime.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Knowledge Base</h3>
          <p className="text-xs text-[#94A3B8]">
            Explore cinema format guides, Dolby Atmos acoustic standards, and member tier guidelines.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
            <Headphones className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Live Concierge Chat</h3>
          <p className="text-xs text-[#94A3B8]">
            Instant connection with dedicated patron support specialists for urgent showtime queries.
          </p>
        </div>
      </div>

      <ComingSoon
        moduleName="Automated Ticketing Resolution Bot & Live Chat"
        description="Full AI-powered refund resolution and live agent handoff will be activated in Phase 2."
        versionLabel="v1.2 Patron Concierge"
        icon={HelpCircle}
        backHref="/"
        backLabel="Return to Public Home"
      />
    </div>
  );
}
