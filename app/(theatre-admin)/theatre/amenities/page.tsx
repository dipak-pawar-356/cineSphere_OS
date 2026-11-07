import React from "react";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Sparkles,
  Zap,
  Car,
  Accessibility,
  Wifi,
  Armchair,
  Volume2,
  Tv,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Amenities & Facilities | CineSphere OS",
};

export default function TheatreAmenitiesPage() {
  const amenityIcons: Record<string, React.ReactNode> = {
    "Barco 4K Laser Projection": <Tv className="h-5 w-5 text-[#FBBF24]" />,
    "Dolby Atmos 64-Channel Spatial Audio": <Volume2 className="h-5 w-5 text-[#FBBF24]" />,
    "IMAX with Laser (Screen 02)": <Sparkles className="h-5 w-5 text-[#FBBF24]" />,
    "4DX Dynamic Motion & Environmental FX": <Zap className="h-5 w-5 text-[#FBBF24]" />,
    "Zero-Gravity Ultra Recliners": <Armchair className="h-5 w-5 text-[#FBBF24]" />,
    "Gourmet In-Seat Butler Dining": <Coffee className="h-5 w-5 text-[#FBBF24]" />,
    "Fast Electric Vehicle (EV) Charging Stations": <Zap className="h-5 w-5 text-emerald-400" />,
    "Dedicated Valet Drop-off & Retrieval": <Car className="h-5 w-5 text-[#FBBF24]" />,
    "Accessible Ramps & Companion Wheelchair Seating": <Accessibility className="h-5 w-5 text-[#38BDF8]" />,
    "High-Speed Wi-Fi & Lounge Bar": <Wifi className="h-5 w-5 text-[#FBBF24]" />,
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Amenities, Food Court & Facilities"
        subtitle="Full roster of customer comfort features, projection acoustics, dining options, and accessibility provisions."
        badge="Luxury Standard"
        badgeVariant="warning"
      />

      {/* Featured Amenities Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
          Signature Guest Amenities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRENT_THEATRE.amenities.map((amenity, i) => (
            <Card key={i} variant="elevated" className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center shrink-0">
                {amenityIcons[amenity] || <CheckCircle2 className="h-5 w-5 text-[#FBBF24]" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{amenity}</h4>
                <p className="text-xs text-[#94A3B8]">Verified available across all operational sessions.</p>
                <div className="pt-1">
                  <Badge variant="success" size="sm" dot>Available</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Facilities & Food Court */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
          Complex Facilities & Concessions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURRENT_THEATRE.facilities.map((fac, i) => (
            <Card key={i} variant="basic" className="p-5 flex items-center justify-between border-[#2A3445]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                  <Coffee className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-white">{fac}</span>
              </div>
              <Badge variant="outline" size="sm">Active</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

