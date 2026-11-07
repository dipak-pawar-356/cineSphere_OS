import React from "react";
import Link from "next/link";
import { THEATRE_OFFERS } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Plus, Sparkles, Copy, Calendar } from "lucide-react";

export const metadata = {
  title: "Offers & Promotions | CineSphere OS",
};

export default function TheatreOffersPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Promotional Campaigns & Coupon Codes"
        subtitle="Festival Deals, Concession Vouchers & Student Discount Programs at CineSphere Grand"
        badge="Active Campaigns"
        badgeVariant="warning"
        actions={
          <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
            <Plus className="h-4 w-4" /> Create Promotional Code (Phase 2)
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {THEATRE_OFFERS.map((off) => (
          <Card key={off.id} variant="elevated" className="p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm">{off.category}</Badge>
                <Badge variant="success" size="sm" dot>{off.status}</Badge>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{off.title}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">{off.description}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#2A3445]">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#FBBF24]" />
                  <span className="font-mono font-bold text-white text-xs">{off.code}</span>
                </div>
                <Badge variant="warning" size="sm" className="font-mono font-bold">
                  {off.discount}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445] flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-[#94A3B8]" /> Valid until {off.validUntil}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{off.usageCount} Redeemed</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

