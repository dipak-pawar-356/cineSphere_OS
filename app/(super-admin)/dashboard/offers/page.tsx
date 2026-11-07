"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DUMMY_OFFERS } from "@/lib/constants/offers";
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Sparkles,
  CreditCard,
  Gift,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminOffersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Promotions, Offers & Coupon Campaigns"
        subtitle="Concession Combos, Bank Cashbacks, VIP Loyalty Perks & Student Codes"
        description="Configure promotional voucher campaigns, discount caps, bank BIN range partnerships, and concession bundles."
        badge="Promo Engine"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Create Offer Campaign (Disabled)
          </Button>
        }
      />

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_OFFERS.map((offer) => (
          <div
            key={offer.id}
            className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4 hover:border-[#FBBF24]/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Badge variant="warning" size="sm">{offer.badgeText}</Badge>
                <span className="font-mono text-xs text-[#94A3B8]">{offer.validUntil}</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{offer.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">{offer.tagline}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between">
                <span className="text-xs text-[#94A3B8]">Coupon Code:</span>
                <span className="font-mono font-bold text-[#FBBF24] text-xs">{offer.code}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">
                Value: <strong className="text-emerald-400 font-mono">{offer.discount}</strong>
              </span>
              <Button variant="outline" size="sm" disabled className="h-7 text-xs px-2.5 border-[#2A3445]">
                Edit Campaign (Disabled)
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

