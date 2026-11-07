"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { HelpCircle, ChevronDown, CheckCircle2, Search, Sparkles } from "lucide-react";
import { cn } from "@/utils";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const ALL_FAQS: FAQItem[] = [
  {
    category: "Ticketing & Booking",
    q: "How does CineSphere OS handle multi-theatre ticket bookings?",
    a: "CineSphere OS uses an enterprise multi-tenant ledger architecture where each cinema operator maintains partitioned auditorium layouts, pricing rules, and showtime schedules while offering patrons unified booking across the entire circuit.",
  },
  {
    category: "Ticketing & Booking",
    q: "Can I cancel my ticket and receive an instant refund?",
    a: "Yes. Cancellations made up to two hours prior to the programmed screening start time are refunded instantly to your CineSphere Digital Wallet, or within 2-3 business days to your original card payment method.",
  },
  {
    category: "Ticketing & Booking",
    q: "How do dynamic offline QR tickets work at the cinema door?",
    a: "Each issued ticket contains a cryptographically signed dynamic QR token that regenerates every 30 seconds. Ushers scan it using handheld terminal scanners with local decryption keys, meaning entry proceeds with zero delay even if network connectivity drops.",
  },
  {
    category: "Cinema Formats",
    q: "What is the difference between IMAX with Laser and standard 4K projection?",
    a: "IMAX with Laser features custom dual-laser light engines capable of delivering exceptional brightness, high dynamic contrast, and a distinct 1.43:1 / 1.90:1 expanded aspect ratio paired with a 12-channel laser-aligned speaker system.",
  },
  {
    category: "Cinema Formats",
    q: "Are 3D glasses provided at the theatre or can I bring my own?",
    a: "For RealD 3D and Dolby 3D screenings, sanitized glasses are provided complimentary at auditorium turnstiles. Dolby Cinema 3D utilizes specialized dichroic wavelength glasses that must be returned upon exit.",
  },
  {
    category: "Circuit Operations",
    q: "Can cinema operators design custom 3D auditorium seating designs?",
    a: "Yes. CineSphere OS includes a WebGL 3D Hall Designer module in Phase 2 supporting curved IMAX geometry, Dolby Atmos speaker coordinates, motorized recliner spacing, and wheelchair accessibility sightlines.",
  },
  {
    category: "Circuit Operations",
    q: "What happens if a cinema experiences an internet outage during peak hours?",
    a: "CineSphere OS incorporates an offline-first Edge Cache architecture on floor POS terminals, allowing continuous ticket scanning, walk-in cash ticketing, and concession sales with automatic conflict resolution upon reconnection.",
  },
  {
    category: "CineClub VIP",
    q: "What are the benefits of CineSphere Gold Annual Membership?",
    a: "Gold members enjoy zero convenience fees on all bookings, 48-hour advance access to blockbuster premiere drops, a complimentary gourmet concession combo with each visit, and automatic seat upgrades to VIP luxury recliners when available.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Ticketing & Booking", "Cinema Formats", "Circuit Operations", "CineClub VIP"];

  const filteredFaqs = ALL_FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Platform Architecture, Ticketing Policies & Circuit Integrations"
        description="Find direct answers to common architectural, ticketing, format, and exhibitor questions regarding CineSphere OS."
        badge="Knowledge Base"
        badgeVariant="primary"
      />

      {/* Search Input & Category Bar */}
      <div className="space-y-4 p-4 rounded-2xl bg-[#111827] border border-[#2A3445]">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search questions by keyword, e.g. 'refund', 'IMAX', 'offline POS'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#070B12] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  isActive
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-md shadow-[#FBBF24]/20"
                    : "bg-[#161F2E] text-[#94A3B8] hover:text-white hover:bg-[#1f293d] border border-[#2A3445]"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl bg-[#161F2E] border transition-colors overflow-hidden",
                isOpen ? "border-[#FBBF24]/50 shadow-lg" : "border-[#2A3445] hover:border-[#3B485E]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FBBF24]">
                    {faq.category}
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                    {faq.q}
                  </h3>
                </div>

                <div
                  className={cn(
                    "h-8 w-8 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 text-[#FBBF24]"
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-[#2A3445]/60 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed animate-in fade-in-50 duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need more help footer card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161F2E] to-[#111827] border border-[#2A3445] text-center space-y-3">
        <h4 className="font-bold text-white text-base">Still have questions regarding your circuit?</h4>
        <p className="text-xs text-[#94A3B8]">
          Our dedicated solutions architecture and patron support team is on standby 24/7.
        </p>
        <div className="pt-1">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#070B12] font-bold text-xs shadow-md shadow-[#FBBF24]/20 hover:bg-[#FACC15] transition-colors"
          >
            <span>Contact Enterprise Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
}
