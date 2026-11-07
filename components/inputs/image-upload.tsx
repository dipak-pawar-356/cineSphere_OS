"use client";

import React from "react";
import { Image as ImageIcon, Camera, Upload } from "lucide-react";
import { cn } from "@/utils";

export interface ImageUploadProps {
  label?: string;
  aspectRatio?: "poster" | "banner" | "square";
  previewUrl?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Enterprise Image Upload Placeholder
 * Specialized image selector formatted for posters (2:3), banners (16:9), or logos (1:1).
 */
export function ImageUpload({
  label = "Upload Image Art",
  aspectRatio = "poster",
  previewUrl,
  disabled = false,
  className,
}: ImageUploadProps) {
  const ratioStyles = {
    poster: "aspect-[2/3] max-w-[200px]",
    banner: "aspect-[16/9] w-full",
    square: "aspect-square max-w-[120px]",
  };

  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      {label && <label className="block text-xs font-semibold text-[#CBD5E1]">{label}</label>}

      <div
        onClick={() => {
          if (!disabled) alert("Image selector dialogue triggered (Placeholder in this phase)");
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed border-[#2A3445] hover:border-[#FBBF24]/50 bg-[#111827] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors space-y-2 group",
          ratioStyles[aspectRatio],
          disabled && "opacity-40 cursor-not-allowed pointer-events-none"
        )}
      >
        <div className="h-9 w-9 rounded-xl bg-[#161F2E] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] group-hover:text-[#FBBF24] transition-colors">
          <Camera className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-semibold text-white">Select Image</div>
        <div className="text-[10px] text-[#64748B] font-mono">PNG, WEBP, JPG</div>
      </div>
    </div>
  );
}

