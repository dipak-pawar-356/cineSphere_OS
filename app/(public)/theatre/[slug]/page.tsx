import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComingSoon } from "@/components/placeholders/coming-soon";
import { BannerPlaceholder } from "@/components/media";
import { Building2, MapPin, Sparkles, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TheatreDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TheatreDetailPage({ params }: TheatreDetailPageProps) {
  const { slug } = await params;
  const formattedName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title={formattedName || "Cinema Multiplex"}
        subtitle="Premier Entertainment Destination • Multi-Format Circuit"
        description="Featuring premium auditoriums with Christie 4K Pure Laser projectors, QSC cinema sound processors, and luxury motorized recliner seating."
        badge="Multiplex Hub"
        badgeVariant="primary"
      />

      <BannerPlaceholder
        title={`${formattedName} Complex Experience`}
        subtitle="Dolby Cinema • IMAX Laser • ScreenX 270-Degree Panoramic Audio-Visuals"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-[#FBBF24]" /> Auditoriums
          </div>
          <div className="text-2xl font-bold font-mono text-white">12 Screens</div>
          <p className="text-xs text-[#94A3B8]">Including 2 IMAX with Laser, 1 Dolby Cinema, and 9 Laser Digital halls.</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#38BDF8]" /> Circuit Hub
          </div>
          <div className="text-2xl font-bold font-mono text-white">Metro Central</div>
          <p className="text-xs text-[#94A3B8]">Dedicated valet parking, premium concession lounge, and rapid gate lanes.</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-xs text-[#94A3B8] uppercase font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Amenities
          </div>
          <div className="text-2xl font-bold font-mono text-white">Full Service</div>
          <p className="text-xs text-[#94A3B8]">Gourmet dining delivered to seat, Dolby Atmos surround, wheelchair accessible.</p>
        </div>
      </div>

      <ComingSoon
        moduleName="Live Showtime Matrix & Seat Lock"
        description="Daily projection schedule matrix, live seat reservations, and concession pre-ordering will connect in Phase 2."
        versionLabel="v1.2 Operations"
        icon={Building2}
        backHref="/theatres"
        backLabel="Back to All Theatres"
      />
    </div>
  );
}
