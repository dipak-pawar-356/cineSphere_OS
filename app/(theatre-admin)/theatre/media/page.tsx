"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore, type ManagedMediaAsset } from "@/store/theatre-store";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Filter,
  Eye,
  Plus,
  HardDrive,
  CheckCircle2,
  Layers,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TheatreMediaManagementPage() {
  const { profile, media, uploadMedia, deleteMedia } = useTheatreStore();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ManagedMediaAsset["category"]>("Gallery");
  const [newUrl, setNewUrl] = useState("");
  const [newSize, setNewSize] = useState("2.1 MB");
  const [newDimensions, setNewDimensions] = useState("1920x1080");

  const categories = ["All", "Lobby", "Hall", "Gallery", "Logo", "Banner", "Promotional", "Video"];

  const filteredMedia =
    activeCategory === "All"
      ? media
      : media.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    uploadMedia({
      title: newTitle.trim(),
      category: newCategory,
      url: newUrl.trim(),
      fileSize: newSize,
      dimensions: newDimensions,
    });

    setUploadModalOpen(false);
    setNewTitle("");
    setNewUrl("");
    setFeedbackNotice(`Media asset "${newTitle}" uploaded successfully.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Remove asset "${title}" from your theatre vault?`)) {
      deleteMedia(id);
      setFeedbackNotice(`Asset "${title}" was removed.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Theatre Media & Asset Vault"
        subtitle={`Tenant Media Management • ${profile.name} (${profile.code})`}
        description="Upload, curate, and organize your auditorium photography, lobby banners, logo variants, and promotional video assets."
        badge="Asset Storage"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              className="gap-2 font-bold bg-[#E50914] hover:bg-[#b80710] text-white"
            >
              <Upload className="h-4 w-4" /> Upload Asset
            </Button>
          </div>
        }
      />

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Storage Allocation & Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Assets</span>
          <div className="text-2xl font-black font-mono text-white">{media.length} Files</div>
          <span className="text-[10px] text-[#64748B]">Across 6 operational categories</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Storage Utilized</span>
          <div className="text-2xl font-black font-mono text-[#FBBF24]">16.4 MB</div>
          <div className="w-full bg-[#1A2333] h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#FBBF24] h-full rounded-full" style={{ width: "3.2%" }} />
          </div>
          <span className="text-[10px] text-[#64748B]">3.2% of 500 MB Tenant Tier</span>
        </Card>

        <Card variant="elevated" className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">CDN Status</span>
          <div className="text-2xl font-black font-mono text-emerald-400">Active (Global)</div>
          <span className="text-[10px] text-emerald-400">Cloudflare Edge Caching Active</span>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#2A3445] pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[#E50914] text-white shadow-lg"
                : "bg-[#111827] text-[#94A3B8] hover:text-white hover:bg-[#161F2E] border border-[#2A3445]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Asset Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMedia.map((asset) => (
          <div
            key={asset.id}
            className="group rounded-2xl bg-[#111827] border border-[#2A3445] overflow-hidden hover:border-[#FBBF24]/50 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="relative h-48 w-full bg-[#070B12] overflow-hidden">
              <img
                src={asset.url}
                alt={asset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="outline" size="sm" className="bg-[#070B12]/80 backdrop-blur-sm border-[#2A3445]">
                  {asset.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-[#070B12]/80 hover:bg-[#111827] text-white inline-block border border-[#2A3445]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-white text-sm truncate" title={asset.title}>
                  {asset.title}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] font-mono mt-0.5">
                  <span>{asset.fileSize}</span>
                  {asset.dimensions && (
                    <>
                      <span>•</span>
                      <span>{asset.dimensions}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{asset.uploadedAt}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2A3445]/60">
                <span className="text-[10px] text-[#64748B] font-mono">ID: {asset.id}</span>
                <button
                  onClick={() => handleDelete(asset.id, asset.title)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3">
          <ImageIcon className="h-10 w-10 text-[#64748B] mx-auto" />
          <h3 className="font-bold text-white text-base">No assets found in category &quot;{activeCategory}&quot;</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Upload images or banners to showcase your auditorium amenities and luxury foyer.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            className="border-[#2A3445] text-white"
          >
            Upload Now
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-[#2A3445] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#E50914]" />
                <h3 className="text-lg font-bold text-white">Upload Creative Asset</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMAX Dual Laser Screen Front View"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Asset Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="Lobby">Lobby</option>
                    <option value="Hall">Hall</option>
                    <option value="Gallery">Gallery</option>
                    <option value="Logo">Logo</option>
                    <option value="Banner">Banner</option>
                    <option value="Promotional">Promotional</option>
                    <option value="Video">Video</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] font-medium">Resolution / Dimensions</label>
                  <input
                    type="text"
                    value={newDimensions}
                    onChange={(e) => setNewDimensions(e.target.value)}
                    placeholder="1920x1080"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#94A3B8] font-medium">Image / Asset URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070B12] border border-[#2A3445] text-white focus:outline-none focus:border-[#E50914]"
                />
                <span className="text-[10px] text-[#64748B]">Provide high-resolution CDN link or public asset URI.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3445]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadModalOpen(false)}
                  className="border-[#2A3445] text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-[#E50914] text-white font-bold"
                >
                  Save to Vault
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
