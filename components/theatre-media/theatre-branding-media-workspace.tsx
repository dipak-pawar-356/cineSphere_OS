"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  PaginatedTheatreMediaResult,
  ReplaceTheatreMediaInput,
  SINGLE_ACTIVE_MEDIA_TYPES,
  TheatreMediaAsset,
  TheatreMediaCollectionBundle,
  TheatreMediaStatus,
  TheatreMediaType,
  UpdateMediaMetadataInput,
  UploadTheatreMediaInput,
} from "@/types/theatre-media.types";
import {
  deleteTheatreMediaAction,
  getTheatreBrandingCollectionAction,
  reorderTheatreGalleryAction,
  replaceTheatreMediaAction,
  restoreTheatreMediaVersionAction,
  retrieveTheatreMediaAction,
  updateTheatreMediaMetadataAction,
  uploadTheatreMediaAction,
} from "@/actions/theatre-media-actions";
import { MediaAssetCard } from "./media-asset-card";
import { MediaStatusBadge } from "./media-status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Film,
  HardDrive,
  ImagePlus,
  Images,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

const LazyMediaUploadModal = dynamic(
  () => import("./media-upload-modal").then((m) => m.MediaUploadModal),
  { ssr: false }
);

const LazyMediaVersionHistoryModal = dynamic(
  () => import("./media-version-history-modal").then((m) => m.MediaVersionHistoryModal),
  { ssr: false }
);

interface TheatreBrandingMediaWorkspaceProps {
  theatreId: string;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  actorUserId?: string;
  actorName?: string;
  defaultView?: "branding" | "gallery" | "explorer";
}

const BRAND_SLOT_DEFINITIONS: {
  type: TheatreMediaType;
  key: "logo" | "banner" | "coverImage" | "heroImage" | "thumbnail";
  title: string;
  guidance: string;
}[] = [
  { type: "LOGO", key: "logo", title: "Brand Logo", guidance: "Single active · 1:1 / 4:1 emblem" },
  { type: "BANNER", key: "banner", title: "Cinema Banner", guidance: "Single active · Wide header art" },
  { type: "COVER_IMAGE", key: "coverImage", title: "Cover Image", guidance: "Single active · Complex card art" },
  { type: "HERO_IMAGE", key: "heroImage", title: "Public Hero Stage", guidance: "Single active · Public hero showcase" },
  { type: "THUMBNAIL", key: "thumbnail", title: "Search Thumbnail", guidance: "Single active · Listings & search cards" },
];

export function TheatreBrandingMediaWorkspace({
  theatreId,
  actorRole,
  actorUserId = actorRole === "SUPER_ADMIN" ? "usr-super-1" : "usr-theatre-1",
  actorName = actorRole === "SUPER_ADMIN" ? "Vikram Singhania" : "Aditi Kulkarni",
  defaultView = "branding",
}: TheatreBrandingMediaWorkspaceProps) {
  const [bundle, setBundle] = useState<TheatreMediaCollectionBundle | null>(null);
  const [explorerData, setExplorerData] = useState<PaginatedTheatreMediaResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"branding" | "gallery" | "explorer" | "audits">(defaultView);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TheatreMediaType | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<TheatreMediaStatus | "ALL">("ALL");
  const [uploadedFrom, setUploadedFrom] = useState("");
  const [updatedFrom, setUpdatedFrom] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "replace">("upload");
  const [uploadDefaultType, setUploadDefaultType] = useState<TheatreMediaType>("GALLERY_IMAGE");
  const [replaceTarget, setReplaceTarget] = useState<TheatreMediaAsset | null>(null);

  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"preview" | "metadata" | "versions">("metadata");
  const [inspectorAsset, setInspectorAsset] = useState<TheatreMediaAsset | null>(null);

  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const actor = React.useMemo(
    () => ({
      userId: actorUserId,
      name: actorName,
      role: actorRole,
      theatreId,
    }),
    [actorUserId, actorName, actorRole, theatreId]
  );

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadCollectionAndSearch = useCallback(async () => {
    setLoading(true);
    try {
      const [colRes, searchRes] = await Promise.all([
        getTheatreBrandingCollectionAction({ theatreId }, actor),
        retrieveTheatreMediaAction(
          {
            theatreId,
            query: searchQuery.trim() || undefined,
            mediaType: filterType,
            status: filterStatus,
            includeDeleted,
            uploadedFrom: uploadedFrom || undefined,
            updatedFrom: updatedFrom || undefined,
            page,
            pageSize: 9,
          },
          actor
        ),
      ]);

      if (colRes.success && colRes.data) {
        setBundle(colRes.data);
      } else if (!colRes.success && colRes.error) {
        showNotice(colRes.error.message, "error");
      }

      if (searchRes.success && searchRes.data) {
        setExplorerData(searchRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, [
    theatreId,
    actor,
    searchQuery,
    filterType,
    filterStatus,
    includeDeleted,
    uploadedFrom,
    updatedFrom,
    page,
  ]);

  useEffect(() => {
    void loadCollectionAndSearch();
  }, [loadCollectionAndSearch]);

  const handleUpload = async (input: UploadTheatreMediaInput) => {
    const res = await uploadTheatreMediaAction(input, actor);
    if (res.success && res.data) {
      showNotice(
        `Uploaded ${res.data.mediaType} "${res.data.title}"${
          SINGLE_ACTIVE_MEDIA_TYPES.includes(res.data.mediaType)
            ? " (enforced as sole active brand asset)"
            : ""
        }.`
      );
      await loadCollectionAndSearch();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Upload failed." };
  };

  const handleReplace = async (input: ReplaceTheatreMediaInput) => {
    const res = await replaceTheatreMediaAction(input, actor);
    if (res.success && res.data) {
      showNotice(`Replaced "${res.data.title}" — saved immutable version v${res.data.currentVersion}.`);
      await loadCollectionAndSearch();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Replacement failed." };
  };

  const handleUpdateMetadata = async (input: UpdateMediaMetadataInput) => {
    const res = await updateTheatreMediaMetadataAction(input, actor);
    if (res.success && res.data) {
      showNotice(`Updated metadata & status (${res.data.status}) for "${res.data.title}".`);
      setInspectorAsset(res.data);
      await loadCollectionAndSearch();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Update failed." };
  };

  const handleRestoreVersion = async (
    targetTheatreId: string,
    mediaId: string,
    versionNumber: number
  ) => {
    const res = await restoreTheatreMediaVersionAction(
      {
        theatreId: targetTheatreId,
        mediaId,
        versionNumber,
        reason: `Restored v${versionNumber} from Media Version History inspector`,
      },
      actor
    );
    if (res.success && res.data) {
      showNotice(`Restored "${res.data.title}" from v${versionNumber} as new v${res.data.currentVersion}.`);
      setInspectorAsset(res.data);
      await loadCollectionAndSearch();
      return { success: true };
    }
    return { success: false, error: res.error?.message || "Version restore failed." };
  };

  const handleDelete = async (asset: TheatreMediaAsset) => {
    const res = await deleteTheatreMediaAction(
      { theatreId, mediaId: asset.id, reason: "Archived/Removed from vault controls" },
      actor
    );
    if (res.success) {
      showNotice(`Soft-deleted "${asset.title}" cleanly.`);
      await loadCollectionAndSearch();
    } else {
      showNotice(res.error?.message || "Delete failed.", "error");
    }
  };

  const commitGalleryOrder = async (
    orderedIds: string[],
    mode: "DRAG_DROP" | "MANUAL" | "AUTO_NORMALIZE"
  ) => {
    const res = await reorderTheatreGalleryAction(
      { theatreId, orderedMediaIds: orderedIds, mode },
      actor
    );
    if (res.success) {
      showNotice(`Persisted gallery display ordering (${mode}).`);
      await loadCollectionAndSearch();
    } else {
      showNotice(res.error?.message || "Reorder failed.", "error");
    }
  };

  const handleMoveGallery = async (assetId: string, direction: "up" | "down") => {
    if (!bundle) return;
    const ids = bundle.galleryImages.map((g) => g.id);
    const idx = ids.indexOf(assetId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    const next = [...ids];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    await commitGalleryOrder(next, "MANUAL");
  };

  const handleDropOnGalleryCard = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !bundle) return;
    const ids = bundle.galleryImages.map((g) => g.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...ids];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setDraggedId(null);
    await commitGalleryOrder(next, "DRAG_DROP");
  };

  const openUploadForSlot = (type: TheatreMediaType) => {
    setUploadMode("upload");
    setUploadDefaultType(type);
    setReplaceTarget(null);
    setUploadModalOpen(true);
  };

  const openReplaceModal = (asset: TheatreMediaAsset) => {
    setUploadMode("replace");
    setReplaceTarget(asset);
    setUploadModalOpen(true);
  };

  const openInspector = (
    asset: TheatreMediaAsset,
    initialTab: "preview" | "metadata" | "versions"
  ) => {
    setInspectorAsset(asset);
    setInspectorTab(initialTab);
    setInspectorOpen(true);
  };

  const summary = bundle?.summary;
  const usedMb = summary ? (summary.totalBytesUsed / (1024 * 1024)).toFixed(2) : "0.00";
  const quotaMb = summary ? (summary.quotaBytes / (1024 * 1024)).toFixed(0) : "500";
  const pct = summary ? Math.min(100, (summary.totalBytesUsed / summary.quotaBytes) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            notice.type === "error"
              ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
              : "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "error" ? (
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Collection Telemetry Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Media Collection</span>
          <div className="text-sm font-black font-mono text-[#FBBF24] truncate">
            {bundle?.collection.collectionCode || "Initializing..."}
          </div>
          <span className="text-[10px] text-[#64748B]">
            Driver: {bundle?.collection.storageDriver || "LOCAL_VIRTUAL_VAULT"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Vault Utilization</span>
          <div className="text-lg font-black font-mono text-white">
            {usedMb} MB <span className="text-xs font-normal text-[#94A3B8]">/ {quotaMb} MB</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#111827] overflow-hidden">
            <div className="h-full bg-[#FBBF24]" style={{ width: `${Math.max(2, pct)}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
          <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Active / Gallery Count</span>
          <div className="text-lg font-black font-mono text-emerald-400">
            {summary?.activeAssets ?? 0} Active · {summary?.galleryCount ?? 0} Gallery
          </div>
          <span className="text-[10px] text-[#64748B]">
            Draft: {summary?.draftAssets ?? 0} · Archived: {summary?.archivedAssets ?? 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col justify-between gap-2">
          <span className="text-[10px] font-bold uppercase text-[#94A3B8]">
            Prepared Architecture Hooks
          </span>
          <div className="text-[11px] text-[#CBD5E1] flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>WebP/AVIF & CDN Placeholders Ready</span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => openUploadForSlot("GALLERY_IMAGE")}
            className="gap-1.5 text-xs font-bold w-full"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Media Asset
          </Button>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A3445] pb-3">
        <div
          role="tablist"
          aria-label="Theatre branding and media views"
          className="flex flex-wrap gap-1.5"
        >
          {(
            [
              { id: "branding", label: "Brand Slots & Future Video Stubs", icon: Sparkles },
              { id: "gallery", label: "Ordered Gallery (Drag & Drop)", icon: Images },
              { id: "explorer", label: "Vault Search & Filters", icon: Search },
              { id: "audits", label: `Media Audits (${bundle?.recentAudits.length || 0})`, icon: Layers },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={viewMode === t.id}
                onClick={() => setViewMode(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === t.id
                    ? "bg-[#FBBF24] text-[#070B12] font-bold shadow"
                    : "bg-[#111827] text-[#94A3B8] border border-[#2A3445] hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => void loadCollectionAndSearch()}
          className="border-[#2A3445] text-xs gap-1.5"
        >
          <RefreshCw className="h-3 w-3" /> Refresh Vault
        </Button>
      </div>

      {loading && !bundle ? (
        <div className="py-12 text-center text-xs text-[#94A3B8]">
          Loading centralized theatre media collection...
        </div>
      ) : (
        <>
          {/* VIEW 1: Brand Identity Slots + Future Video Gallery Placeholder */}
          {viewMode === "branding" && bundle && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                  Single-Active Theatre Brand Identity Slots
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {BRAND_SLOT_DEFINITIONS.map((slot) => {
                    const asset = bundle.brandingSlots[slot.key];
                    return asset ? (
                      <MediaAssetCard
                        key={slot.type}
                        asset={asset}
                        onPreview={(a) => openInspector(a, "preview")}
                        onReplace={openReplaceModal}
                        onInspectVersions={(a) => openInspector(a, "versions")}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <div
                        key={slot.type}
                        className="rounded-2xl bg-[#111827] border-2 border-dashed border-[#2A3445] p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[260px]"
                      >
                        <ImagePlus className="h-8 w-8 text-[#64748B]" />
                        <div>
                          <div className="text-sm font-bold text-white">{slot.title}</div>
                          <div className="text-[11px] text-[#94A3B8]">{slot.guidance}</div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => openUploadForSlot(slot.type)}
                          className="border-[#2A3445] text-[#FBBF24]"
                        >
                          Upload {slot.title}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Future Video & 360° Architecture Placeholders */}
              <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Video className="h-4 w-4 text-[#38BDF8]" />
                      <span>Future Video & 360° Walkthrough Gallery (Architecture Placeholder)</span>
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Prepared DAM schema slots for Promotional Videos, Theatre Walkthroughs, Hall Previews, 360° Video & Virtual Tours. Video binary upload is disabled in Phase 3 Part 2.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    ARCHITECTURE_PREPARED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { code: "PROMOTIONAL_VIDEO", label: "Promotional Videos" },
                    { code: "THEATRE_WALKTHROUGH", label: "Theatre Walkthrough" },
                    { code: "HALL_PREVIEW", label: "Hall Preview" },
                    { code: "VIDEO_360", label: "360° Degree Video" },
                    { code: "VIRTUAL_TOUR", label: "Interactive Virtual Tour" },
                  ].map((item) => (
                    <div
                      key={item.code}
                      className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <Film className="h-4 w-4 text-[#FBBF24]" />
                        <span className="text-[9px] font-mono text-[#64748B]">STUB</span>
                      </div>
                      <div className="text-xs font-bold text-white">{item.label}</div>
                      <div className="text-[10px] text-[#94A3B8]">Reserved Video Slot</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: Ordered Gallery with Drag & Drop + Manual Arrows */}
          {viewMode === "gallery" && bundle && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445]">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gallery Ordering Matrix ({bundle.galleryImages.length} Venue Photos)
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Drag cards onto another slot or use arrow buttons to reorder display sequence on the public theatre page.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      void commitGalleryOrder(
                        bundle.galleryImages.map((g) => g.id),
                        "AUTO_NORMALIZE"
                      )
                    }
                    className="border-[#2A3445] text-xs"
                  >
                    Auto-Normalize Sequence
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={() => openUploadForSlot("GALLERY_IMAGE")}
                    className="text-xs font-bold gap-1"
                  >
                    <ImagePlus className="h-3.5 w-3.5" /> Add Gallery Photo
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bundle.galleryImages.map((asset, idx) => (
                  <MediaAssetCard
                    key={asset.id}
                    asset={asset}
                    draggable
                    onDragStart={(_e, id) => setDraggedId(id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropOnGalleryCard}
                    onPreview={(a) => openInspector(a, "preview")}
                    onReplace={openReplaceModal}
                    onInspectVersions={(a) => openInspector(a, "versions")}
                    onDelete={handleDelete}
                    onMoveGallery={handleMoveGallery}
                    canMoveLeft={idx > 0}
                    canMoveRight={idx < bundle.galleryImages.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: Full Vault Search, Filters & Pagination */}
          {viewMode === "explorer" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#64748B]" />
                  <input
                    aria-label="Search theatre media by title, type, theatre, or uploader"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search Media Title, Type, Theatre, or Uploader..."
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
                    <option value="ALL">All Types</option>
                    <option value="LOGO">Logo</option>
                    <option value="BANNER">Banner</option>
                    <option value="COVER_IMAGE">Cover Image</option>
                    <option value="HERO_IMAGE">Hero Image</option>
                    <option value="THUMBNAIL">Thumbnail</option>
                    <option value="GALLERY_IMAGE">Gallery Image</option>
                    <option value="FUTURE_VIDEO_PLACEHOLDER">Future Video Stub</option>
                    <option value="FUTURE_PANORAMA_PLACEHOLDER">Panorama Stub</option>
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

                  <label className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                    <span>Uploaded ≥</span>
                    <input
                      type="date"
                      aria-label="Filter by uploaded date"
                      value={uploadedFrom}
                      onChange={(e) => {
                        setUploadedFrom(e.target.value);
                        setPage(1);
                      }}
                      className="px-2 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    />
                  </label>

                  <label className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                    <span>Updated ≥</span>
                    <input
                      type="date"
                      aria-label="Filter by updated date"
                      value={updatedFrom}
                      onChange={(e) => {
                        setUpdatedFrom(e.target.value);
                        setPage(1);
                      }}
                      className="px-2 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
                    />
                  </label>

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
                    <span>Show Deleted</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(explorerData?.items || []).map((asset) => (
                  <MediaAssetCard
                    key={asset.id}
                    asset={asset}
                    onPreview={(a) => openInspector(a, "preview")}
                    onReplace={openReplaceModal}
                    onInspectVersions={(a) => openInspector(a, "versions")}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs text-[#94A3B8]">
                <span className="font-mono">
                  Total Matching Assets: <strong className="text-white">{explorerData?.total || 0}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!explorerData?.hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-[#2A3445]"
                  >
                    Prev
                  </Button>
                  <span className="font-mono text-white">
                    Page {explorerData?.page || 1} / {explorerData?.totalPages || 1}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!explorerData?.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-[#2A3445]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: Media Audit Logs */}
          {viewMode === "audits" && bundle && (
            <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                Immutable Theatre Media Audit Trail
              </h3>
              <div className="divide-y divide-[#2A3445]/60 text-xs">
                {bundle.recentAudits.length === 0 ? (
                  <div className="py-6 text-center text-[#94A3B8]">
                    Perform an upload, replace, reorder, or metadata edit to observe live media audits.
                  </div>
                ) : (
                  bundle.recentAudits.map((aud) => (
                    <div
                      key={aud.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#CBD5E1]"
                    >
                      <div>
                        <div className="font-bold text-white font-mono">{aud.action}</div>
                        <div className="text-[#CBD5E1]">{aud.summary}</div>
                        {aud.reason && <div className="text-[11px] text-[#94A3B8]">Reason: {aud.reason}</div>}
                      </div>
                      <div className="text-right text-[10px] font-mono text-[#64748B]">
                        <div>{aud.timestamp}</div>
                        <div>
                          Actor: {aud.actorId} ({aud.actorRole})
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lazy-Loaded Upload / Replace Modal */}
      {uploadModalOpen && (
        <LazyMediaUploadModal
          isOpen={uploadModalOpen}
          mode={uploadMode}
          theatreId={theatreId}
          actorRole={actorRole}
          defaultMediaType={uploadDefaultType}
          targetAsset={replaceTarget}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
          onReplace={handleReplace}
        />
      )}

      {/* Lazy-Loaded Metadata / Version Inspector Modal */}
      {inspectorOpen && (
        <LazyMediaVersionHistoryModal
          isOpen={inspectorOpen}
          initialTab={inspectorTab}
          asset={inspectorAsset}
          onClose={() => setInspectorOpen(false)}
          onUpdateMetadata={handleUpdateMetadata}
          onRestoreVersion={handleRestoreVersion}
        />
      )}

      {/* Keep reference to MediaStatusBadge cleanly in bundle if needed */}
      <span className="sr-only">
        <MediaStatusBadge status="ACTIVE" />
      </span>
    </div>
  );
}

