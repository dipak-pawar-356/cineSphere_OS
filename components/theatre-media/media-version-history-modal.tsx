"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  TheatreMediaAsset,
  UpdateMediaMetadataInput,
} from "@/types/theatre-media.types";
import { MediaStatusBadge, MediaTypeBadge } from "./media-status-badge";
import {
  CheckCircle2,
  History,
  Layers,
  Link2,
  RotateCcw,
  Save,
  X,
} from "lucide-react";

interface MediaVersionHistoryModalProps {
  isOpen: boolean;
  initialTab?: "preview" | "metadata" | "versions";
  asset: TheatreMediaAsset | null;
  onClose: () => void;
  onUpdateMetadata: (
    input: UpdateMediaMetadataInput
  ) => Promise<{ success: boolean; error?: string }>;
  onRestoreVersion: (
    theatreId: string,
    mediaId: string,
    versionNumber: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export function MediaVersionHistoryModal({
  isOpen,
  initialTab = "metadata",
  asset,
  onClose,
  onUpdateMetadata,
  onRestoreVersion,
}: MediaVersionHistoryModalProps) {
  const [tab, setTab] = useState<"preview" | "metadata" | "versions">(initialTab);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED">("ACTIVE");
  const [displayPriority, setDisplayPriority] = useState(100);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && asset) {
      setTab(initialTab);
      setTitle(asset.title);
      setAltText(asset.metadata.altText);
      setCaption(asset.metadata.caption || "");
      setStatus(
        asset.status === "DELETED" ? "ARCHIVED" : asset.status
      );
      setDisplayPriority(asset.displayPriority);
      setFeedback(null);
    }
  }, [isOpen, asset, initialTab]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !asset) return null;

  const isDeleted = asset.status === "DELETED";

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await onUpdateMetadata({
        theatreId: asset.theatreId,
        mediaId: asset.id,
        title,
        altText,
        caption,
        status,
        displayPriority: Number(displayPriority),
      });
      if (res.success) {
        setFeedback("Metadata & status updated cleanly.");
      } else {
        setFeedback(res.error || "Failed to update metadata.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-inspector-title"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#2A3445] pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 id="media-inspector-title" className="text-base font-bold text-white">
                {asset.title}
              </h3>
              <MediaTypeBadge mediaType={asset.mediaType} size="sm" />
              <MediaStatusBadge status={asset.status} size="sm" />
            </div>
            <p className="text-[11px] font-mono text-[#94A3B8]">
              ID: {asset.id} · Version v{asset.currentVersion} · SHA-256:{" "}
              {asset.metadata.checksum.slice(0, 16)}...
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media inspector modal"
            className="text-[#94A3B8] hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Accessible Tabs */}
        <div
          role="tablist"
          aria-label="Media asset inspector sections"
          className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#111827] border border-[#2A3445] text-xs"
        >
          {(
            [
              { id: "preview", label: "Preview & Compression Architecture" },
              { id: "metadata", label: "Metadata & Status" },
              { id: "versions", label: `Version History (${asset.versions.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-colors ${
                tab === item.id
                  ? "bg-[#FBBF24] text-[#070B12] font-bold"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Full Preview & Compression Architecture Placeholders */}
        {tab === "preview" && (
          <div className="space-y-4">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-[#070B12] border border-[#2A3445] overflow-hidden">
              <Image
                src={asset.url}
                alt={asset.metadata.altText || asset.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
                <div className="font-bold text-[#FBBF24] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Prepared Compression & Responsive Architecture
                </div>
                <div className="space-y-1 text-[#CBD5E1] font-mono text-[11px]">
                  <div>Formats Ready: {asset.metadata.compressionPlaceholder.targetFormats.join(", ")}</div>
                  <div>Widths: {asset.metadata.compressionPlaceholder.responsiveWidths.join("px, ")}px</div>
                  <div>
                    Thumbnail Spec: {asset.metadata.compressionPlaceholder.thumbnailSpec.width}×
                    {asset.metadata.compressionPlaceholder.thumbnailSpec.height}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2">
                <div className="font-bold text-[#38BDF8] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Reusable Media References ({asset.references.length})
                </div>
                <div className="space-y-1 text-[11px] font-mono text-[#CBD5E1]">
                  {asset.references.map((ref) => (
                    <div key={ref.id} className="flex items-center justify-between">
                      <span>
                        {ref.targetEntityType} · {ref.slotKey}
                      </span>
                      <span className={ref.isActive ? "text-emerald-400" : "text-[#64748B]"}>
                        {ref.isActive ? "ACTIVE_REF" : "INACTIVE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Metadata & Status Editor */}
        {tab === "metadata" && (
          <form onSubmit={handleSaveMetadata} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-white">Asset Title</label>
                <input
                  required
                  disabled={isDeleted}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Status</label>
                <select
                  aria-label="Media lifecycle status"
                  disabled={isDeleted}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white disabled:opacity-50"
                >
                  <option value="ACTIVE">Active (Live Public)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="HIDDEN">Hidden</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-white">Alt Text (Accessibility)</label>
              <input
                required
                disabled={isDeleted}
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-white">Caption</label>
                <input
                  disabled={isDeleted}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-white">Display Priority</label>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  disabled={isDeleted}
                  value={displayPriority}
                  onChange={(e) => setDisplayPriority(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono disabled:opacity-50"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-[#94A3B8]">
              <div>
                <span className="text-[10px] block">Dimensions</span>
                <strong className="text-white">{asset.metadata.width}×{asset.metadata.height}</strong>
              </div>
              <div>
                <span className="text-[10px] block">Aspect Ratio</span>
                <strong className="text-white">{asset.metadata.aspectRatio}</strong>
              </div>
              <div>
                <span className="text-[10px] block">Upload Source</span>
                <strong className="text-white">{asset.metadata.uploadSource}</strong>
              </div>
              <div>
                <span className="text-[10px] block">Integrity Check</span>
                <strong className="text-emerald-400">{asset.metadata.corruptedCheckStatus}</strong>
              </div>
            </div>

            {feedback && (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {!isDeleted && (
              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" disabled={saving} className="gap-1.5 text-xs font-bold">
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Metadata Changes"}
                </Button>
              </div>
            )}
          </form>
        )}

        {/* Tab 3: Immutable Version History + One-Click Restore */}
        {tab === "versions" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {asset.versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-16 rounded-lg bg-[#070B12] border border-[#2A3445] overflow-hidden shrink-0">
                    <Image
                      src={ver.url}
                      alt={ver.altText}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-2">
                      <History className="h-3.5 w-3.5 text-[#FBBF24]" />
                      <span>Version v{ver.versionNumber}</span>
                      {ver.versionNumber === asset.currentVersion && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {ver.changeReason || "Asset snapshot"} · {ver.width}×{ver.height} ({ver.mimeType})
                    </p>
                    <p className="text-[10px] font-mono text-[#64748B]">
                      {ver.createdAt} · SHA {ver.checksum.slice(0, 12)}...
                    </p>
                  </div>
                </div>

                {!isDeleted && ver.versionNumber !== asset.currentVersion && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={async () => {
                      await onRestoreVersion(asset.theatreId, asset.id, ver.versionNumber);
                    }}
                    className="border-[#2A3445] text-[#FBBF24] hover:border-[#FBBF24] gap-1 shrink-0 text-xs"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore v{ver.versionNumber}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

