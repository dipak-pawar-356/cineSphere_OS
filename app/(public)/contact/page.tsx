import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Mail, Phone, MapPin, Building2, MessageSquare, Send, Globe, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Contact & Partnerships | CineSphere OS",
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <PageHeader
        title="Contact & Enterprise Partnerships"
        subtitle="Connect with the CineSphere OS Architecture & Solutions Team"
        description="Whether you operate an international multiplex chain or an independent heritage film house, our enterprise solutions architects are available for circuit onboarding and custom integrations."
        badge="Enterprise Inquiries"
        badgeVariant="primary"
      />

      {/* 1. CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Global Headquarters</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            One World Trade Center, Suite 8500<br />
            New York, NY 10007, United States
          </p>
          <div className="text-[11px] font-mono text-[#FBBF24] pt-1">
            Mon - Fri • 08:00 - 20:00 EST
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#38BDF8]">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">Direct Channels</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            partnerships@cinesphere.io<br />
            support@cinesphere.io
          </p>
          <div className="text-[11px] font-mono text-[#38BDF8] pt-1">
            Typical SLA Response: &lt; 2 Hours
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-emerald-400">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-white text-base">24/7 Circuit Hotline</h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            +1 (800) 555-CINE (Toll-Free USA)<br />
            +44 (20) 7946-0922 (Europe & UK)
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-1">
            Priority Circuit Escalations
          </div>
        </div>
      </div>

      {/* 2. FORM & MAP PLACEHOLDER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Support & Partnership Form Placeholder */}
        <div className="p-8 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6 shadow-xl">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#FBBF24]" />
              <span>Send Us an Inquiry</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Fill out the details below and an enterprise cinema solutions specialist will get in touch.
            </p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Your Name" placeholder="Marcus Sterling" disabled />
              <Input type="email" label="Business Email" placeholder="marcus@cinema-circuit.com" disabled />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Cinema Chain or Organization" placeholder="Apex Multiplex Group" disabled />
              <Input label="Auditorium Count" placeholder="e.g. 12 Screens" disabled />
            </div>

            <Textarea
              label="How can we assist your circuit?"
              placeholder="Tell us about your current ticketing software, hardware formats (IMAX, Dolby Atmos), and desired migration timeline..."
              rows={4}
              disabled
            />

            <Button variant="primary" size="md" fullWidth disabled className="gap-2 font-bold">
              <span>Submit Enterprise Request (Disabled)</span>
              <Send className="h-4 w-4" />
            </Button>

            <p className="text-[11px] text-[#64748B] text-center">
              Phase 1 Route Shell • Form submission pipeline connects in Phase 2.
            </p>
          </form>
        </div>

        {/* Global Map & Datacenter Node Placeholder */}
        <div className="p-8 rounded-3xl bg-[#111827] border border-[#2A3445] space-y-6 shadow-xl flex flex-col justify-between h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#38BDF8]" />
                <span>Global HQ & Circuit Nodes</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">All Nodes Active</span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              CineSphere OS operates across 6 primary edge regions with localized database replication for low-latency ticketing and telemetry synchronization.
            </p>
          </div>

          {/* Interactive Map Visual Placeholder */}
          <div className="relative aspect-video w-full rounded-2xl bg-[#070B12] border border-[#2A3445] overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">One World Trade Center Node</div>
              <div className="text-[11px] text-[#94A3B8] font-mono">40.7128° N, 74.0060° W</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
              Primary Americas Datacenter (14ms)
            </span>
          </div>

          <div className="pt-2 border-t border-[#2A3445]/60 flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Europe Node: London BFI (18ms)</span>
            <span>Asia Node: Mumbai BKC (28ms)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
