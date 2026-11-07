"use client";

import React from "react";
import { Camera, User } from "lucide-react";
import { cn } from "@/utils";

export interface AvatarPickerProps {
  currentAvatarUrl?: string;
  onSelect?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarPicker({
  currentAvatarUrl,
  onSelect,
  size = "md",
  className,
}: AvatarPickerProps) {
  const sizeMap = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-28 w-28",
  };

  return (
    <div className={cn("relative inline-block group cursor-pointer", className)} onClick={onSelect}>
      <div
        className={cn(
          "rounded-full bg-[#161F2E] border-2 border-[#2A3445] overflow-hidden flex items-center justify-center text-[#94A3B8]",
          sizeMap[size]
        )}
      >
        {currentAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <User className="h-1/2 w-1/2 text-[#94A3B8]" />
        )}
      </div>

      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#FBBF24]">
        <Camera className="h-5 w-5" />
      </div>
    </div>
  );
}
