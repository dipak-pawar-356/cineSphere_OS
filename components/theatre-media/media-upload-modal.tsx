"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MediaCropPlaceholder,
  ReplaceTheatreMediaInput,
  TheatreMediaAsset,
  TheatreMediaType,
  UploadTheatreMediaInput,
} from "@/types/theatre-media.types";
import { validateTheatreMediaUploadAction } from "@/actions/theatre-media-actions";
import {
  AlertTriangle,
  CheckCircle2,
  Crop,
  ImagePlus,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

interface MediaUploadModalProps {
  isOpen: boolean;
  mode: "upload" | "replace";
  theatreId: string;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN";
  defaultMediaType?: TheatreMediaType;
  targetAsset?: TheatreMediaAsset | null;
  onClose: () => void;
  onUpload: (input: UploadTheatreMediaInput) => Promise<{ success: boolean; error?: string }>;
  onReplace: (input: ReplaceTheatreMediaInput) => Promise<{ success: boolean; error?: string }>;
}

const SAMPLE_PRESETS = [
  {
    label: "IMAX Laser Hall (1920×1080)",
    url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80",
    width: 1920,
    height: 1080,
    mimeType: "image/webp",
    fileSizeBytes: 1850000,
  },
  {
    label: "VIP Velvet Auditorium (2400×1080)",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
    width: 2400,
    height: 1080,
    mimeType: "image/webp",
    fileSizeBytes: 2150000,
  },
  {
    label: "Gold Brand Emblem (512×512)",
    url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=600&auto=format&fit=crop&q=80",
    width: 512,
    height: 512,
    mimeType: "image/png",
    fileSizeBytes: 224000,
  },
  {
    label: "Luxury Foyer Atrium (1600×1067)",
    url: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1400&auto=format&fit=crop&q=80",
    width: 1600,
    height: 1067,
    mimeType: "image/jpeg",
    fileSizeBytes: 1420000,
  },
];

export function MediaUploadModal({
  isOpen,
  mode,
  theatreId,
  actorRole,
  defaultMediaType = "GALLERY_IMAGE",
  targetAsset,
  onClose,
  onUpload,
  onReplace,
}: MediaUploadModalProps) {
  const [mediaType, setMediaType] = useState<TheatreMediaType>(defaultMediaType);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [mimeType, setMimeType] = useState("image/webp");
  const [fileSizeBytes, setFileSizeBytes] = useState(1450000);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [dominantColor, setDominantColor] = useState("#FBBF24");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "HIDDEN">("ACTIVE");
  const [changeReason, setChangeReason] = useState("");
  const [cropAspect, setCropAspect] = useState("16:9");

  const [validationMsg, setValidationMsg] = useState<{
    ok: boolean;
    lines: string[];
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValidationMsg(null);
    if (mode === "replace" && targetAsset) {
      setMediaType(targetAsset.mediaType);
      setTitle(targetAsset.title);
      setUrl(targetAsset.url);
      setAltText(targetAsset.metadata.altText);
      setCaption(targetAsset.metadata.caption || "");
      setMimeType(targetAsset.metadata.mimeType);
      setFileSizeBytes(targetAsset.metadata.fileSizeBytes);
      setWidth(targetAsset.metadata.width);
      setHeight(targetAsset.metadata.height);
      setDominantColor(targetAsset.metadata.dominantColor);
      setChangeReason("");
      setCropAspect(targetAsset.metadata.aspectRatio || "16:9");
    } else {
      setMediaType(defaultMediaType);
      setTitle("");
      setUrl("");
      setAltText("");
      setCaption("");
      if (defaultMediaType === "LOGO") {
        setWidth(512);
        setHeight(512);
        setMimeType("image/png");
        setFileSizeBytes(240000);
        setCropAspect("1:1");
      } else if (defaultMediaType === "THUMBNAIL") {
        setWidth(800);
        setHeight(500);
        setMimeType("image/webp");
        setFileSizeBytes(420000);
        setCropAspect("16:10");
      } else {
        setWidth(1920);
        setHeight(1080);
        setMimeType("image/webp");
        setFileSizeBytes(1650000);
        setCropAspect("16:9");
      }
      setDominantColor("#FBBF24");
      setStatus("ACTIVE");
      setChangeReason("");
    }
  }, [isOpen, mode, defaultMediaType, targetAsset]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actorContext = {
    userId: actorRole === "THEATRE_ADMIN" ? "usr-theatre-1" : "usr-super-1",
    role: actorRole,
    theatreId,
  };

  const handleServerPreValidate = async () => {
    const res = await validateTheatreMediaUploadAction(
      {
        theatreId,
        mediaType,
        title: title || "Untitled Asset",
        url: url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        altText: altText || "Cinema theatre visual asset",
        mimeType,
        fileSizeBytes: Number(fileSizeBytes),
        width: Number(width),
        height: Number(height),
        dominantColor,
      },
      actorContext
    );

    if (res.success && res.data) {
      if (res.data.valid) {
        setValidationMsg({
          ok: true,
          lines: [
            `Policy Passed · Ratio ${res.data.computedAspectRatio} · SHA-256 ${res.data.computedChecksum?.slice(0, 12)}...`,
            ...res.data.warnings,
          ],
        });
      } else {
        setValidationMsg({ ok: false, lines: res.data.errors });
      }
    } else {
      setValidationMsg({ ok: false, lines: [res.error?.message || "Pre-flight check failed."] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setValidationMsg(null);

    const cropPlaceholder: MediaCropPlaceholder = {
      x: 0,
      y: 0,
      width: Number(width),
      height: Number(height),
      unit: "px",
      aspectLock: cropAspect,
    };

    try {
      if (mode === "upload") {
        const res = await onUpload({
          theatreId,
          mediaType,
          title,
          url,
          status,
          altText,
          caption: caption || undefined,
          mimeType,
          fileSizeBytes: Number(fileSizeBytes),
          width: Number(width),
          height: Number(height),
          dominantColor,
          uploadSource: "URL_REFERENCE",
          cropPlaceholder,
        });
        if (res.success) {
          onClose();
        } else {
          setValidationMsg({ ok: false, lines: [res.error || "Upload failed."] });
        }
      } else if (mode === "replace" && targetAsset) {
        const res = await onReplace({
          theatreId,
          mediaId: targetAsset.id,
          expectedVersion: targetAsset.currentVersion,
          title: title || undefined,
          url,
          altText,
          caption: caption || undefined,
          mimeType,
          fileSizeBytes: Number(fileSizeBytes),
          width: Number(width),
          height: Number(height),
          dominantColor,
          changeReason: changeReason || undefined,
          cropPlaceholder,
        });
        if (res.success) {
          onClose();
        } else {
          setValidationMsg({ ok: false, lines: [res.error || "Replace failed."] });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-upload-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-3xl bg-[#0B1220] border border-[#2A3445] p-6 space-y-5 shadow-2xl my-8"
      >
        <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
          <div>
            <h3 id="media-upload-modal-title" className="text-base font-bold text-white flex items-center gap-2">
              {mode === "replace" ? (
                <RefreshCw className="h-5 w-5 text-[#FBBF24]" />
              ) : (
                <ImagePlus className="h-5 w-5 text-[#FBBF24]" />
              )}
              <span>
                {mode === "replace"
                  ? `Replace ${targetAsset?.mediaType} (Creating v${(targetAsset?.currentVersion || 1) + 1})`
                  : "Upload Theatre Branding / Gallery Media"}
              </span>
            </h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Validates MIME policy, size bounds, dimensions, SHA-256 duplicate hashes & single-active slot rules server-side.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload modal"
            className="text-[#94A3B8] hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Preview & Quick Preset Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div className="relative h-32 rounded-2xl bg-[#111827] border border-[#2A3445] overflow-hidden flex items-center justify-center">
            {url && (url.startsWith("https://") || url.startsWith("/")) ? (
              <Image
                src={url}
                alt={altText || "Media preview"}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] text-[#64748B] font-mono px-2 text-center">
                Image Preview & Crop Frame ({cropAspect})
              </span>
            )}
          </div>

          <div className="sm:col-span-2 space-y-2">
            <span className="block text-[10px] uppercase font-bold text-[#94A3B8]">
              Quick Reference Art Presets (Or enter custom URL below)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setUrl(`${preset.url}&v=${Date.now()}`);
                    setWidth(preset.width);
                    setHeight(preset.height);
                    setMimeType(preset.mimeType);
                    setFileSizeBytes(preset.fileSizeBytes);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#2A3445] hover:border-[#FBBF24] text-[10px] text-[#CBD5E1] transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label htmlFor="media-type-select" className="font-semibold text-white">
              Media Type Slot *
            </label>
            <select
              id="media-type-select"
              disabled={mode === "replace"}
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as TheatreMediaType)}
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white disabled:opacity-50"
            >
              <option value="LOGO">Logo (Single Active)</option>
              <option value="BANNER">Banner (Single Active)</option>
              <option value="COVER_IMAGE">Cover Image (Single Active)</option>
              <option value="HERO_IMAGE">Hero Image (Single Active)</option>
              <option value="THUMBNAIL">Thumbnail (Single Active)</option>
              <option value="GALLERY_IMAGE">Gallery Image (Ordered Multi-Asset)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="media-title-input" className="font-semibold text-white">
              Asset Title *
            </label>
            <input
              id="media-title-input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dolby Cinema Laser Lounge View"
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label htmlFor="media-url-input" className="font-semibold text-white">
            Secure Image URL (HTTPS or Local Placeholder) *
          </label>
          <input
            id="media-url-input"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label htmlFor="media-alt-input" className="font-semibold text-white">
              Accessible Alt Text * (WCAG)
            </label>
            <input
              id="media-alt-input"
              required
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the cinema room or brand asset..."
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="media-caption-input" className="font-semibold text-white">
              Editorial Caption
            </label>
            <input
              id="media-caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional public display caption..."
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="space-y-1">
            <label htmlFor="media-mime-select" className="font-semibold text-white">
              MIME Format
            </label>
            <select
              id="media-mime-select"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white"
            >
              <option value="image/webp">image/webp</option>
              <option value="image/png">image/png</option>
              <option value="image/jpeg">image/jpeg</option>
              <option value="image/avif">image/avif</option>
              <option value="image/svg+xml">image/svg+xml</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="media-width-input" className="font-semibold text-white">
              Width (px)
            </label>
            <input
              id="media-width-input"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="media-height-input" className="font-semibold text-white">
              Height (px)
            </label>
            <input
              id="media-height-input"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="media-size-input" className="font-semibold text-white">
              Size (Bytes)
            </label>
            <input
              id="media-size-input"
              type="number"
              value={fileSizeBytes}
              onChange={(e) => setFileSizeBytes(Number(e.target.value))}
              className="w-full px-2.5 py-2 rounded-xl bg-[#111827] border border-[#2A3445] text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="media-color-input" className="font-semibold text-white">
              Palette Hex
            </label>
            <input
              id="media-color-input"
              type="color"
              value={dominantColor}
              onChange={(e) => setDominantColor(e.target.value)}
              className="h-9 w-full rounded-xl bg-[#111827] border border-[#2A3445] px-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Crop Placeholder & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-[#111827] border border-[#2A3445] text-xs">
          <div className="flex items-center gap-2">
            <Crop className="h-4 w-4 text-[#FBBF24] shrink-0" />
            <label htmlFor="media-crop-aspect" className="text-[#94A3B8]">
              Crop Frame Placeholder:
            </label>
            <select
              id="media-crop-aspect"
              value={cropAspect}
              onChange={(e) => setCropAspect(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[#070B12] border border-[#2A3445] text-white font-mono"
            >
              <option value="1:1">1:1 Square (Logo)</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="21:9">21:9 CinemaScope</option>
              <option value="3:2">3:2 Editorial</option>
            </select>
          </div>

          {mode === "upload" ? (
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8]">Initial Status:</span>
              <select
                aria-label="Initial media status"
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="flex-1 px-2 py-1 rounded-lg bg-[#070B12] border border-[#2A3445] text-white"
              >
                <option value="ACTIVE">Active (Publish Live)</option>
                <option value="DRAFT">Draft (Stage Only)</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                aria-label="Replacement change reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Version change note (e.g. Updated 4K rebrand art)"
                className="flex-1 px-2.5 py-1 rounded-lg bg-[#070B12] border border-[#2A3445] text-white"
              />
            </div>
          )}
        </div>

        {validationMsg && (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-xl border text-xs space-y-1 ${
              validationMsg.ok
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border-rose-500/40 text-rose-300"
            }`}
          >
            {validationMsg.lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                {validationMsg.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#2A3445]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleServerPreValidate}
            className="gap-1.5 border-[#2A3445] text-xs text-[#38BDF8]"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Validate Policy Server-Side
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="border-[#2A3445] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="text-xs font-bold"
            >
              {submitting
                ? "Saving Asset..."
                : mode === "replace"
                ? "Replace & Save Version"
                : "Upload Media"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

