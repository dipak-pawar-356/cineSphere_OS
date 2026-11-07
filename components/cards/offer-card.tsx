"use client";

import React, { useState } from "react";
import { Copy, Check, Tag, Clock, ArrowRight } from "lucide-react";
import { Offer } from "@/lib/types";
import { ComingSoonButton } from "@/components/buttons/coming-soon-button";
import { cn } from "@/lib/utils";

export interface OfferCardProps {
  offer: Offer;
  className?: string;
}

export function OfferCard({ offer, className }: OfferCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl bg-[#161F2E]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5",
        className
      )}
    >
      {/* Glow background accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors pointer-events-none" />

      <div>
        {/* Header with badge & discount */}
        <div className="flex items-start justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/25">
            {offer.badgeText}
          </span>
          <span className="text-xl font-black text-amber-400 tracking-tight">
            {offer.discount}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="mt-4 text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
          {offer.title}
        </h3>
        <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">
          {offer.tagline}
        </p>

        {/* Promo Code Box */}
        <div className="mt-5 flex items-center justify-between p-2.5 rounded-xl bg-[#070B12]/80 border border-white/10 group-hover:border-amber-400/30 transition-colors">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-amber-400" />
            <span className="font-mono text-sm font-bold tracking-widest text-white">
              {offer.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
            title="Copy promo code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Key Terms */}
        <div className="mt-4 space-y-1.5 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]/70">
            Terms & Criteria
          </div>
          <ul className="space-y-1 text-[11px] text-[#9CA3AF]">
            {offer.terms.map((t, idx) => (
              <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                <span className="text-amber-400 font-bold">•</span>
                <span className="truncate">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <Clock className="h-3.5 w-3.5 text-amber-400/70" />
          <span>Valid till {offer.validUntil}</span>
        </div>

        <ComingSoonButton
          featureName={`Apply Coupon: ${offer.code}`}
          description={`Cart coupon redemption and wallet discounts will be active when the payment gateway opens in Phase 2.`}
          size="sm"
          variant="primary"
          label="Apply Offer"
        />
      </div>
    </div>
  );
}
