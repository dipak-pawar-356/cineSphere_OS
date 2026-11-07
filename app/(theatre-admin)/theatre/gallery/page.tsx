import React from "react";
import { CURRENT_THEATRE } from "@/lib/constants/theatre-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Filter } from "lucide-react";

export const metadata = {
  title: "Theatre Photo Gallery | CineSphere OS",
};

export default function TheatreGalleryPage() {
  const categories = ["All Photos", "Auditoriums", "Lounge & VIP", "Concessions", "Projection Booths"];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Visual Gallery"
        subtitle="High-resolution photography of auditoriums, luxury VIP suites, gourmet kitchen, and projection booth setups."
        badge={`${CURRENT_THEATRE.gallery.length} Verified Photos`}
        badgeVariant="primary"
        actions={
          <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
            <Plus className="h-4 w-4" /> Upload Photo (Phase 2)
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat, i) => (
          <button
            key={i}
            type="button"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              i === 0
                ? "bg-[#FBBF24] text-[#070B12]"
                : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CURRENT_THEATRE.gallery.map((item) => (
          <Card key={item.id} variant="elevated" className="overflow-hidden group space-y-3">
            <div className="relative h-56 w-full overflow-hidden bg-[#111827]">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="solid" size="sm" className="bg-black/60 backdrop-blur-md">
                  {item.category}
                </Badge>
              </div>
            </div>
            <div className="p-4 pt-1 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <span className="text-[10px] text-[#64748B]">Phoenix Marketcity Complex</span>
              </div>
              <Button variant="ghost" size="xs" disabled className="text-xs text-[#94A3B8]">
                View 4K
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

