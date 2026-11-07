import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import {
  HelpCircle,
  FileText,
  Headphones,
  BookOpen,
  LifeBuoy,
  Search,
  Ticket,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Support & Help Center | CineSphere OS",
};

const SUPPORT_CATEGORIES = [
  {
    icon: Ticket,
    title: "Ticketing & Cancellations",
    desc: "Refund eligibility, digital ticket recovery, seat swaps, and payment receipt lookups.",
    articles: ["How to cancel tickets 2h before showtime", "Where to find my dynamic QR pass", "Refund timeline to CineSphere Wallet"],
  },
  {
    icon: BookOpen,
    title: "Formats & Audiovisuals",
    desc: "Understanding IMAX with Laser, Dolby Atmos 128-ch spatial sound, and 4DX environmental effects.",
    articles: ["What is the difference between IMAX and Dolby?", "Are 3D glasses provided at the hall?", "Audio loudness safety standards"],
  },
  {
    icon: LifeBuoy,
    title: "CineClub VIP Loyalty",
    desc: "Tier milestones, points redemption, free concession vouchers, and annual pass benefits.",
    articles: ["How to earn points on every booking", "Upgrading from Gold to Platinum VIP", "Zero convenience fee perk guide"],
  },
  {
    icon: FileText,
    title: "Developer & API Docs",
    desc: "Exhibitor REST APIs, webhook listeners, Christie/Barco SNMP traps, and floor POS integration.",
    articles: ["API Authentication & API Keys", "Webhook events for booking settlements", "Floor scanner offline cache spec"],
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <PageHeader
        title="Support & Knowledge Base"
        subtitle="24/7 Ticketing Help, Hall Inquiries, Hardware Guides & Documentation"
        description="Search our library of troubleshooting guides or open an urgent ticket with our patron and exhibitor concierge desk."
        badge="24/7 Concierge"
        badgeVariant="info"
      />

      {/* 1. SEARCH HELP INPUT */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#161F2E] to-[#111827] border border-[#2A3445] text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          How can our concierge assist you today?
        </h2>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search keywords, e.g. 'refund policy', 'IMAX 3D glasses', 'Apple Wallet'..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
            disabled
          />
        </div>
        <p className="text-[11px] text-[#94A3B8]">
          Popular topics: <span className="text-[#FBBF24] hover:underline cursor-pointer">Instant Refunds</span> • <span className="text-[#FBBF24] hover:underline cursor-pointer">Will-Call Kiosks</span> • <span className="text-[#FBBF24] hover:underline cursor-pointer">Dolby Atmos</span>
        </p>
      </div>

      {/* 2. SUPPORT CATEGORIES & HELP CARDS */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Browse by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUPPORT_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-4 hover:border-[#FBBF24]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{cat.title}</h4>
                    <p className="text-xs text-[#94A3B8]">{cat.desc}</p>
                  </div>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-[#2A3445]/60 text-xs text-[#CBD5E1]">
                  {cat.articles.map((art, aIdx) => (
                    <li key={aIdx} className="flex items-center gap-2 hover:text-[#FBBF24] cursor-pointer transition-colors">
                      <ChevronRight className="h-3 w-3 text-[#64748B]" />
                      <span>{art}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUBMIT TICKET PLACEHOLDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Urgent Ticket Creator */}
        <div className="p-8 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="h-5 w-5 text-[#FBBF24]" />
              <span>Open an Urgent Support Ticket</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Have an issue with a booking tonight? Our automated desk routes urgent showtime tickets with &lt; 15 min priority.
            </p>
          </div>

          <div className="space-y-4">
            <Input label="Booking Reference / Ticket ID" placeholder="e.g. CS-849201" disabled />
            <Input type="email" label="Contact Email" placeholder="david@example.com" disabled />
            <div className="pt-2">
              <Button variant="primary" size="md" fullWidth disabled className="gap-2 font-bold">
                <span>Dispatch Support Request (Disabled)</span>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-[#64748B] text-center">
              Phase 1 Route Shell • Automated ticketing bot connects in Phase 2.
            </p>
          </div>
        </div>

        {/* Documentation Placeholder Card */}
        <div className="p-8 rounded-3xl bg-[#111827] border border-[#2A3445] space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#38BDF8]" />
              <span>Documentation & Exhibitor Guides</span>
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Explore exhaustive technical specifications for projector SNMP telemetry, automated KDM key distribution, and turnstile scanner firmware.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Exhibitor REST API Reference</div>
                <div className="text-[10px] text-[#94A3B8]">OpenAPI 3.1 Spec • 120 Endpoints</div>
              </div>
              <Badge variant="outline" size="sm">Docs</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Floor POS Scanner Manual</div>
                <div className="text-[10px] text-[#94A3B8]">Offline Cache & Biometric Setup</div>
              </div>
              <Badge variant="outline" size="sm">PDF</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">3D Hall Acoustic Guidelines</div>
                <div className="text-[10px] text-[#94A3B8]">Dolby Atmos & Christie 4K Setup</div>
              </div>
              <Badge variant="outline" size="sm">Guide</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
