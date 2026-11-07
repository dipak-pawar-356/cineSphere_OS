import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How does CineSphere OS handle multi-theatre ticket bookings?",
    a: "CineSphere OS uses an enterprise multi-tenant ledger architecture where each cinema operator maintains partitioned auditorium layouts, pricing rules, and showtime schedules while offering patrons unified booking across the entire circuit.",
  },
  {
    q: "What payment gateways and ticket verification formats are supported?",
    a: "The platform supports all major global gateways (Stripe, Razorpay, Apple Pay, Google Pay) and issues encrypted dynamic QR codes with offline verification keys for usher handheld scanners.",
  },
  {
    q: "Can cinema operators configure custom 3D auditorium seating designs?",
    a: "Yes. CineSphere OS includes a Phase 2 3D Hall Designer module supporting curved IMAX screens, Dolby Atmos speaker positioning, VIP motorized recliners, and wheelchair companion slots.",
  },
  {
    q: "What happens if a cinema experiences an internet outage during peak hours?",
    a: "CineSphere OS incorporates an offline-first Edge Cache architecture on floor POS terminals, allowing continuous ticket scanning, walk-in cash ticketing, and concession sales with automatic conflict resolution upon reconnection.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Platform Capabilities, Ticketing Policies & Circuit Integrations"
        description="Comprehensive answers to common architectural and operational questions regarding the CineSphere OS platform."
        badge="Knowledge Base"
        badgeVariant="primary"
      />

      <div className="space-y-4 max-w-4xl mx-auto">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2 hover:border-[#FBBF24]/40 transition-colors"
          >
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>{item.q}</span>
              <CheckCircle2 className="h-4 w-4 text-[#FBBF24] shrink-0" />
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed pt-1">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <ComingSoon
        moduleName="Interactive Searchable FAQ & Support Community"
        description="Dynamic category filters, search indexing, and exhibitor community forums are launching in Phase 2."
        versionLabel="v1.2 Knowledge Base"
        icon={HelpCircle}
        backHref="/"
        backLabel="Return to Public Home"
      />
    </div>
  );
}
