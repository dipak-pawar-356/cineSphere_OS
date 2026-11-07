"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { OfferCard } from "@/components/cards/offer-card";
import { DUMMY_OFFERS } from "@/lib/constants/offers";
import { Tag, Sparkles, SlidersHorizontal, Gift, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const OFFER_CATEGORIES = [
  "All Offers",
  "Coupons",
  "Cashback",
  "Membership",
  "Festival Offers",
  "Food Offers",
  "Combo Offers",
  "Student Discount",
];

export default function OffersPage() {
  const [activeCategory, setActiveCategory] = useState("All Offers");

  const filteredOffers = DUMMY_OFFERS.filter((offer) => {
    if (activeCategory === "All Offers") return true;
    return offer.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Exclusive Offers & CineClub Privileges"
        subtitle="Festival Passes, Wallet Cashback, Student Discounts & F&B Combos"
        description="Save up to 50% on luxury recliner bookings, earn instant wallet cashback credits on concessions, and unlock free IMAX upgrades."
        badge={`${DUMMY_OFFERS.length} Active Promotions`}
        badgeVariant="primary"
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-2 rounded-2xl bg-[#111827] border border-[#2A3445]">
        {OFFER_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
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

      {/* Results Meta */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>
          Showing <strong className="text-white">{filteredOffers.length}</strong> verified offers
        </span>
        <span className="text-[11px] font-mono text-[#FBBF24]">Updated Daily • Valid Across Circuits</span>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
