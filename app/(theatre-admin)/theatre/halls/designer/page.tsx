import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Layers, Sliders, Box, Grid3X3, Eye } from "lucide-react";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Hall Designer & 3D Layout Editor | CineSphere OS",
};

export default function TheatreHallDesignerPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.HALLS}>
          <Button variant="ghost" size="xs" className="gap-1 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Hall Fleet
          </Button>
        </Link>
      </div>

      <PageHeader
        title="3D Hall Designer & Seating CAD Studio"
        subtitle="Visual seat grid architect, row curve editor, motorized recliner mapping, and sightline calculation engine."
        badge="Coming Soon (Phase 2)"
        badgeVariant="warning"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <Eye className="h-4 w-4" /> 3D Viewport Test
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-1.5 font-bold">
              Save Auditorium Profile
            </Button>
          </div>
        }
      />

      {/* CAD Canvas Mockup */}
      <Card variant="elevated" className="p-8 text-center space-y-6 border-dashed border-[#2A3445] bg-[#0B1220]">
        <div className="h-16 w-16 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] mx-auto shadow-xl">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <Badge variant="warning" size="sm" className="font-bold">Under Active Development</Badge>
          <h2 className="text-xl sm:text-2xl font-black text-white">Interactive 3D Auditorium Layout Canvas</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            The CineSphere CAD Hall Designer will enable exhibitors to drag-and-drop VIP recliners, configure curved screen focal depths, set wheelchair compliance bays, and simulate patron eye-levels with 60fps WebGL rendering.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-xs">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <Grid3X3 className="h-4 w-4 text-[#FBBF24] mx-auto" />
            <h4 className="font-bold text-white">Parametric Row Array</h4>
            <p className="text-[10px] text-[#64748B]">Configurable tier heights and aisle gaps</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <Box className="h-4 w-4 text-[#38BDF8] mx-auto" />
            <h4 className="font-bold text-white">Three.js 3D Viewport</h4>
            <p className="text-[10px] text-[#64748B]">Real-time camera orbit and patron sightlines</p>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
            <Sliders className="h-4 w-4 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white">Acoustic Heatmap</h4>
            <p className="text-[10px] text-[#64748B]">Dolby Atmos speaker cone angle verification</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

