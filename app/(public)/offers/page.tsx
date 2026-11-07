import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Tag } from "lucide-react";

export const metadata = {
  title: "Offers",
  description: "Promotional vouchers, bank discounts, and cinema passes.",
};

export default function OffersPage() {
  return (
    <PagePlaceholder
      badge="Privilege Programs"
      icon={Tag}
      title="Offers & Memberships"
      description="Unlock bank card partner discounts, instant wallet cashback credits, complimentary concession upgrades, and seasonal festival passes."
      phase="Phase 2 Loyalty Module"
      futureFeatures={[
        "Automated Cart Coupon Redemption Engine",
        "Digital CineSphere Pass Wallet Synchronization",
        "Distributor Co-Sponsored Seasonal Campaigns",
        "Loyalty Tier Threshold Calculation & Rewards",
      ]}
    />
  );
}
