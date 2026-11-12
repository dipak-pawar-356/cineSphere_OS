"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";
import {
  retrieveTheatreMediaAction,
  deleteTheatreMediaAction,
} from "@/actions/theatre-media-actions";
import { searchTheatresLifecycleAction } from "@/actions/theatre-lifecycle-actions";
import { ManagedTheatreEntity } from "@/types/theatre-lifecycle.types";
import {
  PaginatedTheatreMediaResult,
  TheatreMediaAsset,
  TheatreMediaStatus,
  TheatreMediaType,
} from "@/types/theatre-media.types";
import {
  MediaAssetCard,
  TheatreBrandingMediaWorkspace,
} from "@/components/theatre-media";
import { Building2, Layers, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LazyMediaVersionHistoryModal = dynamic(
  () => import("@/components/theatre-media/media-version-history-modal").then((m) => m.MediaVersionHistoryModal),
  { ssr: false }
);

const SUPER_ADMIN_ACTOR = {
  userId: "usr-super-1",
  name: "Vikram Singhania",
  role: "SUPER_ADMIN" as const,
};

export default function SuperAdminMediaPage() {
  const [viewMode, setViewMode] = useState<"fleet" | "studio">("fleet");
  const [theatres, setTheatres] = useState<ManagedTheatreEntity[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>("th-pun-001");

  const [fleetData, setFleetData] = useState<PaginatedTheatreMediaResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TheatreMediaType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<TheatreMediaStatus | "ALL">("ALL");
  const [uploadedFrom, setUploadedFrom] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const [inspectAsset, setInspectAsset] = useState<TheatreMediaAsset | null>(null);

  const loadFleet = useCallback(async () => {
    setLoading(true);
    try {
      const [thRes, medRes] = await Promise.all([
        searchTheatresLifecycleAction({ pageSize: 50 }, SUPER_ADMIN_ACTOR),
        retrieveTheatreMediaAction(
          {
            query: searchQuery.trim() || undefined,
            mediaType: filterType,
            status: filterStatus,
            uploadedFrom: uploadedFrom || undefined,
            includeDeleted,
            page,
            pageSize: 9,
          },
          SUPER_ADMIN_ACTOR
        ),
      ]);
      if (thRes.success && thRes.data) {
        setTheatres(thRes.data.items);
      }
      if (medRes.success && medRes.data) {
        setFleetData(medRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, filterStatus, uploadedFrom, includeDeleted, page]);

  useEffect(() => {
    void loadFleet();
  }, [loadFleet]);

  const summary = fleetData?.summary;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Tenant Theatre Branding & Media Vault"
        subtitle="Centralized Digital Asset Management (DAM): Logos, Banners, Covers, Heroes, Thumbnails & Ordered Galleries"
        badge="Enterprise DAM"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
            <button
              type="button"
              onClick={() => setViewMode("fleet")}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                viewMode === "fleet" ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Fleet DAM Search
            </button>
            <button
              type="button"
              onClick={() => setViewMode("studio")}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                viewMode === "studio" ? "bg-[#FBBF24] text-[#070B12] font-bold" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Theatre Branding Studio
            </button>
          </div>
        }
      />

      {viewMode === "fleet" ? (
        <div className="space-y-6">
          {/* Fleet KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Platform Assets</div>
              <div className="text-2xl font-black font-mono text-white">
                {summary?.totalAssets ?? 0} Files
              </div>
              <div className="text-[11px] text-emerald-400">
                {summary?.activeAssets ?? 0} Active · {summary?.galleryCount ?? 0} Gallery
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Virtual Vault Footprint</div>
              <div className="text-2xl font-black font-mono text-[#FBBF24]">
                {((summary?.totalBytesUsed || 0) / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div className="text-[11px] text-[#94A3B8]">SHA-256 Verified Checksums</div>
            </div>
            <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Future Video Stubs</div>
              <div className="text-2xl font-black font-mono text-[#38BDF8]">
                {summary?.futurePlaceholderCount ?? 0} Reserved
              </div>
              <div className="text-[11px] text-[#94A3B8]">Walkthrough & 360° Hooks</div>
            </div>
            <div className="p-5 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Draft / Archived / Deleted</div>
              <div className="text-2xl font-black font-mono text-white">
                {summary?.draftAssets ?? 0} / {summary?.archivedAssets ?? 0} / {summary?.deletedAssets ?? 0}
              </div>
              <div className="text-[11px] text-[#94A3B8]">Versioned Non-Destructive Vault</div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
              <input
                aria-label="Search media across all theatres"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search Media Title, Media Type, Theatre, or Uploader..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white placeholder-[#64748B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by media type"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as TheatreMediaType | "ALL");
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              >
                <option value="ALL">All Media Types</option>
                <option value="LOGO">Logo</option>
                <option value="BANNER">Banner</option>
                <option value="COVER_IMAGE">Cover Image</option>
                <option value="HERO_IMAGE">Hero Image</option>
                <option value="THUMBNAIL">Thumbnail</option>
                <option value="GALLERY_IMAGE">Gallery Image</option>
                <option value="FUTURE_VIDEO_PLACEHOLDER">Future Video Stub</option>
              </select>

              <select
                aria-label="Filter by media status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as TheatreMediaStatus | "ALL");
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="HIDDEN">Hidden</option>
                <option value="ARCHIVED">Archived</option>
                <option value="DELETED">Deleted</option>
              </select>

              <input
                type="date"
                aria-label="Uploaded after date"
                value={uploadedFrom}
                onChange={(e) => {
                  setUploadedFrom(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
              />

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-[#CBD5E1] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => {
                    setIncludeDeleted(e.target.checked);
                    setPage(1);
                  }}
                />
                <Trash2 className="h-3 w-3 text-rose-400" />
                <span>Deleted</span>
              </label>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">Loading fleet media assets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(fleetData?.items || []).map((asset) => (
                <MediaAssetCard
                  key={asset.id}
                  asset={asset}
                  onPreview={(a) => setInspectAsset(a)}
                  onReplace={() => {
                    setSelectedTheatreId(asset.theatreId);
                    setViewMode("studio");
                  }}
                  onInspectVersions={(a) => setInspectAsset(a)}
                  onDelete={async (a) => {
                    await deleteTheatreMediaAction(
                      { theatreId: a.theatreId, mediaId: a.id },
                      SUPER_ADMIN_ACTOR
                    );
                    await loadFleet();
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-mono">
              Showing page {fleetData?.page || 1} of {fleetData?.totalPages || 1} ({fleetData?.total || 0} matching assets)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={!fleetData?.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-[#2A3445]"
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                disabled={!fleetData?.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="border-[#2A3445]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Theatre Selector Bar */}
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white font-semibold">
              <Building2 className="h-4 w-4 text-[#FBBF24]" />
              <span>Select Theatre Collection to Manage:</span>
            </div>
            <select
              aria-label="Select theatre media collection"
              value={selectedTheatreId}
              onChange={(e) => setSelectedTheatreId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs text-white font-medium"
            >
              {theatres.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name} ({th.city}) — /{th.slug}
                </option>
              ))}
            </select>
          </div>

          <TheatreBrandingMediaWorkspace
            theatreId={selectedTheatreId}
            actorRole="SUPER_ADMIN"
            actorUserId="usr-super-1"
            actorName="Vikram Singhania"
            defaultView="branding"
          />
        </div>
      )}

      {inspectAsset && (
        <LazyMediaVersionHistoryModal
          isOpen={Boolean(inspectAsset)}
          initialTab="preview"
          asset={inspectAsset}
          onClose={() => setInspectAsset(null)}
          onUpdateMetadata={async () => ({ success: false, error: "Switch to Branding Studio tab to edit." })}
          onRestoreVersion={async () => ({ success: false, error: "Switch to Branding Studio tab to restore." })}
        />
      )}

      <span className="sr-only">
        <Layers className="h-4 w-4" />
      </span>
    </div>
  );
}
