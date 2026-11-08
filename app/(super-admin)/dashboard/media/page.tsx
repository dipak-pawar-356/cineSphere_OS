"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Image as ImageIcon,
  Film,
  UploadCloud,
  Search,
  Filter,
  HardDrive,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaAssetItem {
  id: string;
  name: string;
  category: "Poster" | "Banner" | "Logo" | "Gallery" | "Trailer";
  fileUrl: string;
  sizeMb: number;
  dimensions: string;
  format: string;
  uploadedAt: string;
}

const SEED_MEDIA: MediaAssetItem[] = [
  { id: "med-01", name: "pushpa-3-imax-poster.webp", category: "Poster", fileUrl: "/placeholders/movie-1.jpg", sizeMb: 2.4, dimensions: "2000x3000", format: "WEBP 4K", uploadedAt: "2026-11-05" },
  { id: "med-02", name: "kalki-cinematic-banner.webp", category: "Banner", fileUrl: "/placeholders/hero-banner.jpg", sizeMb: 4.8, dimensions: "3840x1200", format: "WEBP Ultrawide", uploadedAt: "2026-11-04" },
  { id: "med-03", name: "pvr-inox-brand-vector.svg", category: "Logo", fileUrl: "/placeholders/theatre-1.jpg", sizeMb: 0.2, dimensions: "Vector SVG", format: "SVG", uploadedAt: "2026-11-01" },
  { id: "med-04", name: "phoenix-auditorium-interior.jpg", category: "Gallery", fileUrl: "/placeholders/theatre-2.jpg", sizeMb: 3.1, dimensions: "4000x2667", format: "JPEG HDR", uploadedAt: "2026-10-28" },
  { id: "med-05", name: "avatar-3-teaser-4k.mp4", category: "Trailer", fileUrl: "https://youtube.com/watch?v=placeholder", sizeMb: 85.0, dimensions: "3840x2160 (60fps)", format: "MP4 ProRes", uploadedAt: "2026-11-02" },
];

export default function SuperAdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaAssetItem[]>(SEED_MEDIA);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mediaList.filter((m) => {
    if (searchQuery.trim() && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== "all" && m.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  const totalStorageUsedMb = mediaList.reduce((sum, m) => sum + m.sizeMb, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Digital Media & Creative Asset Vault"
        subtitle="Posters, 4K Banners, Corporate Logos, High-Res Foyer Photography & Trailer Assets"
        badge="Asset CDN"
        badgeVariant="primary"
        actions={
          <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
            <UploadCloud className="h-4 w-4" /> Upload Asset
          </Button>
        }
      />

      {/* Storage Quota Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Cloud CDN Storage Used</div>
          <div className="text-2xl font-black font-mono text-white">
            {(totalStorageUsedMb / 1024).toFixed(2)} GB / 250 GB
          </div>
          <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-[#FBBF24] h-full" style={{ width: "3.8%" }} />
          </div>
          <div className="text-[10px] text-[#94A3B8]">AWS CloudFront ap-south-1 Bucket</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Media Asset Count</div>
          <div className="text-2xl font-black font-mono text-emerald-400">{mediaList.length} Files</div>
          <div className="text-[11px] text-emerald-300">100% WebP Optimized</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Bandwidth Ingress / Month</div>
          <div className="text-2xl font-black font-mono text-white">4.82 TB</div>
          <div className="text-[11px] text-emerald-400">99.4% Edge Cache Hit Ratio</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
          {["all", "poster", "banner", "logo", "gallery", "trailer"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium ${
                filterCategory === cat ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media files by name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white placeholder-[#64748B] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-3 hover:border-[#64748B] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#FBBF24]">
                {m.category === "Trailer" ? <Film className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
              </div>
              <Badge variant="secondary" size="sm">{m.category}</Badge>
            </div>

            <div>
              <div className="font-bold text-white text-xs truncate">{m.name}</div>
              <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">
                {m.dimensions} · {m.format} · {m.sizeMb} MB
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3445]/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#64748B] font-mono">{m.uploadedAt}</span>
              <Button variant="outline" size="sm" className="h-7 text-xs border-[#2A3445] gap-1">
                <ExternalLink className="h-3 w-3" /> View CDN
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
