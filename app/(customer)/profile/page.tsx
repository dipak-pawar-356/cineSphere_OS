import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { User, Award, Ticket, Heart, Clock, Sparkles } from "lucide-react";

export const metadata = {
  title: "My Profile | CineSphere Patron Portal",
};

export default function CustomerProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Patron Profile & Membership"
        subtitle="David Miller • Gold CineClub VIP Member #84910"
        description="Manage your account profile, personalized seat preferences (center aisle, wheelchair companion), audio presets, and CineClub loyalty credits."
        badge="Gold Tier"
        badgeVariant="primary"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <Award className="h-4 w-4 text-[#FBBF24]" /> Loyalty Credits
          </div>
          <div className="text-2xl font-mono font-bold text-white">1,450 Pts</div>
          <p className="text-xs text-[#94A3B8]">550 points until Platinum Tier (Free IMAX Upgrades)</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-[#38BDF8]" /> Active Passes
          </div>
          <div className="text-2xl font-mono font-bold text-white">2 Unused</div>
          <p className="text-xs text-[#94A3B8]">Complimentary Large Popcorn & Beverage Combo</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Preferred Screen
          </div>
          <div className="text-2xl font-mono font-bold text-white">IMAX Laser</div>
          <p className="text-xs text-[#94A3B8]">Row F, Center Seats preferred on booking</p>
        </div>
      </div>

      <ComingSoon
        moduleName="Profile Customization & Loyalty Rewards Store"
        description="Redeem loyalty points for free IMAX tickets, concession upgrades, and exclusive director Q&A premiere passes in Phase 2."
        versionLabel="v1.2 Patron Experience"
        icon={User}
        backHref="/"
        backLabel="Return to Public Home"
      />
    </div>
  );
}
