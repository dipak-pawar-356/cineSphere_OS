"use client";

import React, { useState, useMemo } from "react";
import { DUMMY_OFFERS } from "@/lib/constants/offers";
import { OfferCategory } from "@/lib/types";
import { OfferCard } from "@/components/cards/offer-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { FilterChip } from "@/components/ui/filter-chip";
import { Tag, Sparkles, Gift, Percent, ShieldCheck } from "lucide-react";

const OFFER_CATEGORIES: (OfferCategory | "All")[] = [
  "All",
  "Coupons",
  "Cashback",
  "Membership",
  "Festival Offers",
];

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory | "All">("All");

  const filteredOffers = useMemo(() => {
    if (selectedCategory === "All") return DUMMY_OFFERS;
    return DUMMY_OFFERS.filter((o) => o.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Privilege Programs"
          title="Exclusive Offers & Cinema Memberships"
          subtitle="Unlock premium concession perks, cashback credits, complimentary seat upgrades, and seasonal festival discounts."
        />

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 mt-6 scrollbar-none">
          {OFFER_CATEGORIES.map((category) => (
            <FilterChip
              key={category}
              label={category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {/* Benefits Banner */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#111827] to-blue-500/10 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                CineSphere Wallet & Cardholder Advantages
              </div>
              <div className="text-xs text-[#9CA3AF]">
                Coupons can be combined with bank card discounts and instant wallet cashback at checkout.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#9CA3AF] shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Verified Promotions
            </span>
            <span className="flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-amber-400" />
              Instant Cart Application
            </span>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </div>
  );
}
