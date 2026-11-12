"use client";

import React from "react";
import Image from "next/image";
import { TheatreMediaAsset } from "@/types/theatre-media.types";
import { MediaStatusBadge, MediaTypeBadge } from "./media-status-badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  History,
  ImageIcon,
  RefreshCw,
  Trash2,
  Eye,
} from "lucide-react";

interface MediaAssetCardProps {
  asset: TheatreMediaAsset;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  onPreview: (asset: TheatreMediaAsset) => void;
  onReplace: (asset: TheatreMediaAsset) => void;
  onInspectVersions: (asset: TheatreMediaAsset) => void;
  onDelete: (asset: TheatreMediaAsset) => void;
  onMoveGallery?: (assetId: string, direction: "up" | "down") => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

export function MediaAssetCard({
  asset,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onPreview,
  onReplace,
  onInspectVersions,
  onDelete,
  onMoveGallery,
  canMoveLeft = false,
  canMoveRight = false,
}: MediaAssetCardProps) {
  const sizeKb = (asset.metadata.fileSizeBytes / 1024).toFixed(0);
  const sizeLabel =
    asset.metadata.fileSizeBytes >= 1024 * 1024
      ? `${(asset.metadata.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeKb} KB`;

  const isDeleted = asset.status === "DELETED";

  return (
    <article
      draggable={draggable && !isDeleted}
      onDragStart={(e) => onDragStart?.(e, asset.id)}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e, asset.id)}
      aria-label={`${asset.title} (${asset.mediaType}, ${asset.status})`}
      className={`group rounded-2xl bg-[#111827] border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isDeleted
          ? "border-rose-500/30 opacity-65"
          : "border-[#2A3445] hover:border-[#FBBF24]/50"
      }`}
    >
      {/* Responsive Visual Preview Frame */}
      <div className="relative h-44 w-full bg-[#070B12] overflow-hidden">
        {asset.url ? (
          <Image
            src={asset.url}
            alt={asset.metadata.altText || asset.title}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-[#64748B]">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-[10px]">No Preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            {draggable && !isDeleted && (
              <span
                className="p-1 rounded-md bg-black/70 text-[#FBBF24] cursor-grab active:cursor-grabbing border border-[#FBBF24]/30"
                title="Drag to reorder gallery position"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </span>
            )}
            <MediaTypeBadge mediaType={asset.mediaType} size="sm" />
          </div>
          <MediaStatusBadge status={asset.status} size="sm" />
        </div>

        {/* Bottom Badges: Order / Version / Dominant Swatch */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-black/75 border border-white/10 text-white">
            v{asset.currentVersion}
            {asset.mediaType === "GALLERY_IMAGE" ? ` · Order #${asset.displayOrder}` : ""}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 border border-white/10 text-[#CBD5E1]">
            <span
              className="h-2.5 w-2.5 rounded-full border border-white/30"
              style={{ backgroundColor: asset.metadata.dominantColor }}
              title={`Dominant palette: ${asset.metadata.dominantColor}`}
            />
            {asset.metadata.width}×{asset.metadata.height}
          </span>
        </div>
      </div>

      {/* Metadata & Controls Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h4 className="font-bold text-white text-xs truncate" title={asset.title}>
            {asset.title}
          </h4>
          <p className="text-[11px] text-[#94A3B8] line-clamp-1">
            {asset.metadata.caption || asset.metadata.altText}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#64748B] pt-1">
            <span>{asset.metadata.mimeType}</span>
            <span>·</span>
            <span>{sizeLabel}</span>
            <span>·</span>
            <span>{asset.metadata.aspectRatio}</span>
          </div>
          <div className="text-[10px] text-[#64748B] truncate">
            {asset.theatreName} · By {asset.uploadedByName || asset.uploadedBy}
          </div>
        </div>

        {/* Action Strip */}
        <div className="pt-2.5 border-t border-[#2A3445] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onPreview(asset)}
              aria-label={`Preview ${asset.title}`}
              className="border-[#2A3445] text-[#CBD5E1] hover:text-white gap-1 text-[10px]"
            >
              <Eye className="h-3 w-3" /> Preview
            </Button>

            {!isDeleted && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onReplace(asset)}
                aria-label={`Replace ${asset.title}`}
                className="border-[#2A3445] text-amber-300 hover:border-[#FBBF24]/50 gap-1 text-[10px]"
              >
                <RefreshCw className="h-3 w-3" /> Replace
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onInspectVersions(asset)}
              aria-label={`Metadata & versions for ${asset.title}`}
              className="border-[#2A3445] text-[#38BDF8] hover:border-[#38BDF8]/50 gap-1 text-[10px]"
            >
              <History className="h-3 w-3" /> v{asset.currentVersion}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {onMoveGallery && asset.mediaType === "GALLERY_IMAGE" && !isDeleted && (
              <>
                <button
                  type="button"
                  disabled={!canMoveLeft}
                  onClick={() => onMoveGallery(asset.id, "up")}
                  aria-label={`Move ${asset.title} earlier`}
                  className="p-1.5 rounded-lg bg-[#161F2E] border border-[#2A3445] text-[#CBD5E1] hover:text-white disabled:opacity-30"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveRight}
                  onClick={() => onMoveGallery(asset.id, "down")}
                  aria-label={`Move ${asset.title} later`}
                  className="p-1.5 rounded-lg bg-[#161F2E] border border-[#2A3445] text-[#CBD5E1] hover:text-white disabled:opacity-30"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
              </>
            )}

            {!isDeleted && (
              <button
                type="button"
                onClick={() => onDelete(asset)}
                aria-label={`Delete ${asset.title}`}
                className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

