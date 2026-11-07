"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { MEDIA_LIBRARY_DATA } from "@/lib/constants/super-admin";
import {
  Image as ImageIcon,
  Film,
  Upload,
  HardDrive,
  Filter,
  Search,
  Layers,
  Sparkles,
  FileVideo,
  Grid,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminMediaLibraryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const ASSET_CARDS = MEDIA_LIBRARY_DATA.recentAssets;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Centralized Media & Asset Library"
        subtitle="Key Art Posters, 4K Hero Banners, Distributor Trailer Loops & SVG Acoustic Schematics"
        description="Global digital asset management system powering customer mobile apps, cinema kiosk will-call displays, and box office portals."
        badge="Asset Engine"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled className="gap-2 border-[#2A3445]">
              <HardDrive className="h-4 w-4" /> Storage Usage
            </Button>
            <Button variant="primary" size="sm" disabled className="gap-2 font-bold">
              <Upload className="h-4 w-4" /> Upload Asset (Disabled)
            </Button>
          </div>
        }
      />

      {/* Storage Utilization Overview Card */}
      <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#FBBF24]" />
              <span>Edge Storage Allocation & NVMe Quota</span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              {MEDIA_LIBRARY_DATA.totalStorageUsed} used of {MEDIA_LIBRARY_DATA.storageQuota} total allocated capacity.
            </p>
          </div>
          <Badge variant="success" size="sm">{MEDIA_LIBRARY_DATA.percentageUsed}% Utilized</Badge>
        </div>

        {/* Storage Bar */}
        <div className="h-3 w-full rounded-full bg-[#111827] overflow-hidden flex">
          <div style={{ width: "1.1%" }} className="h-full bg-[#FBBF24]" title="Posters (1.1 GB)" />
          <div style={{ width: "0.8%" }} className="h-full bg-[#38BDF8]" title="Banners (840 MB)" />
          <div style={{ width: "0.3%" }} className="h-full bg-purple-400" title="Videos (280 MB)" />
          <div style={{ width: "0.2%" }} className="h-full bg-emerald-400" title="Logos & Maps (180 MB)" />
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {MEDIA_LIBRARY_DATA.breakdown.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
              <div className="text-[10px] text-[#94A3B8] truncate">{item.label}</div>
              <div className="font-bold text-white mt-0.5">{item.size}</div>
              <div className="text-[10px] text-[#64748B] font-mono">{item.count} items</div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Explorer & Filters */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {[
            { id: "all", label: "All Media" },
            { id: "posters", label: "Posters" },
            { id: "banners", label: "Banners" },
            { id: "videos", label: "Videos" },
            { id: "gallery", label: "Gallery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium capitalize ${
                selectedFilter === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search media files... (disabled)"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
            disabled
          />
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ASSET_CARDS.map((asset) => (
          <div
            key={asset.id}
            className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#FBBF24]/40 transition-colors flex flex-col justify-between"
          >
            {/* Visual Media Placeholder Box */}
            <div className="h-44 rounded-xl bg-gradient-to-br from-[#111827] to-[#070B12] border border-[#2A3445] flex flex-col items-center justify-center p-4 text-center space-y-2 relative overflow-hidden group">
              <div className="h-10 w-10 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                {asset.category === "Video" ? (
                  <FileVideo className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-semibold text-white px-2 truncate w-full">
                {asset.title}
              </span>
              <Badge variant="outline" size="sm">{asset.category}</Badge>
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-white truncate">{asset.movieOrTheatre}</div>
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                <span>{asset.resolution}</span>
                <span className="text-[#FBBF24]">{asset.fileSize}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A3445]/60 flex items-center justify-between text-[10px] text-[#64748B]">
              <span>{asset.uploadedAt}</span>
              <span className="hover:text-white cursor-pointer font-bold">Inspect Asset →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
