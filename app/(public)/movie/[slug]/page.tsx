import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { PosterPlaceholder, BannerPlaceholder } from "@/components/media";
import { Film, Calendar, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface MovieDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title={formattedTitle || "Cinematic Feature"}
        subtitle="4K Laser Projection • Dolby Atmos Sound Experience"
        description="Experience the pinnacle of audio-visual cinema technology with laser phosphor projection, calibrated multi-channel sound, and zero-distraction seating."
        badge="Now Showing"
        badgeVariant="success"
      />

      {/* Hero Movie Placeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
          <PosterPlaceholder title={formattedTitle} aspectRatio="2/3" />
        </div>

        <div className="md:col-span-2 space-y-6">
          <BannerPlaceholder
            title={`${formattedTitle} — Official Showtimes`}
            subtitle="Select your preferred hall format, audio profile, and cinema auditorium"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
              <div className="text-[10px] text-[#94A3B8] uppercase">Format</div>
              <div className="font-bold text-white text-sm mt-0.5">IMAX with Laser</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
              <div className="text-[10px] text-[#94A3B8] uppercase">Duration</div>
              <div className="font-bold text-white text-sm mt-0.5">2h 48m</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
              <div className="text-[10px] text-[#94A3B8] uppercase">Sound</div>
              <div className="font-bold text-white text-sm mt-0.5">Dolby Atmos</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161F2E] border border-[#2A3445] text-center">
              <div className="text-[10px] text-[#94A3B8] uppercase">Rating</div>
              <div className="font-bold text-[#FBBF24] text-sm mt-0.5">9.4 / 10</div>
            </div>
          </div>

          <ComingSoon
            moduleName="Interactive Seat Reservation & Hall View"
            description="High-fidelity 3D hall view and interactive seat selection will be activated in Phase 2 with full real-time seat lock orchestration."
            versionLabel="v1.2 Feature"
            icon={Film}
            backHref="/movies"
            backLabel="Back to Movies Catalog"
          />
        </div>
      </div>
    </div>
  );
}
