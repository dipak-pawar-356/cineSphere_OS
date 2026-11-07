import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { Sparkles, Compass, Shield, Users, Layers, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="About CineSphere OS"
        subtitle="The Operating System for Modern Cinemas"
        description="CineSphere OS is designed from the ground up as a cloud-native, multi-tenant enterprise cinema orchestration platform. We empower multiplex circuits, independent exhibitors, and entertainment venues worldwide to manage halls, ticketing, acoustic calibration, and concession yields with zero friction."
        badge="Enterprise Vision"
        badgeVariant="primary"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Next-Gen Architecture</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Built on modern web primitives with isolated multi-tenant data boundaries, sub-second latency, and horizontal scalability for millions of concurrent moviegoers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Complete Lifecycle</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            From distributor contract royalties to digital projector telemetry and floor staff handheld scanners, CineSphere OS handles every operational touchpoint.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Enterprise Reliability</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Designed for 99.99% uptime with SOC 2 compliance, encrypted transaction ledgers, and automated offline failover for box office resilience.
          </p>
        </div>
      </div>

      <ComingSoon
        moduleName="CineSphere Global Circuit Map & Case Studies"
        description="Comprehensive exhibitor case studies, hardware compatibility matrices, and partner testimonials will be published in the upcoming release."
        versionLabel="v1.2 Company Profile"
        icon={Sparkles}
        backHref="/"
        backLabel="Return to Public Home"
      />
    </div>
  );
}
