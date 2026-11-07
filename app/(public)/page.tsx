import React from "react";
import { PagePlaceholder } from "@/components/placeholders/page-placeholder";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Home",
  description: "CineSphere OS — The Operating System for Modern Cinemas",
};

export default function HomePage() {
  return (
    <PagePlaceholder
      badge="Public Storefront"
      icon={Sparkles}
      title="CineSphere OS"
      description="The Operating System for Modern Cinemas. A unified multi-tenant SaaS architecture engineered to orchestrate cinema chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing worldwide."
      phase="Phase 1 Foundation"
      futureFeatures={[
        "Curated Blockbuster Theatrical Releases",
        "Interactive Spatial Multiplex Circuit Explorer",
        "Omnichannel High-Velocity Booking Engine",
        "VIP Privilege Memberships & Promotional Wallet",
      ]}
    />
  );
}
