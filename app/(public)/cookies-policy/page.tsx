import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Cookie, Shield, Cpu } from "lucide-react";

export default function CookiesPolicyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Cookies and Storage Architecture"
        subtitle="Transparent Telemetry & Session Management Policies"
        description="Learn how CineSphere OS utilizes minimal essential cookies and localized session tokens to power fast theatre discovery, seat holds, and secure staff terminal logins."
        badge="Legal & Trust"
        badgeVariant="info"
      />

      <div className="space-y-6 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cookie className="h-4 w-4 text-[#FBBF24]" />
            1. Strictly Essential Cookies
          </h3>
          <p>
            Essential cookies maintain your encrypted session key, preferred cinema circuit location, and momentary seat locks during checkout. These cookies are strictly functional and do not track external browsing habits.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#38BDF8]" />
            2. Performance & Hardware Telemetry
          </h3>
          <p>
            Anonymized performance tokens assist our engineering team in analyzing WebGL frame rates for the 3D auditorium preview, API latency across cinema circuits, and load balancing during major blockbuster premiere drops.
          </p>
        </section>
      </div>
    </div>
  );
}

