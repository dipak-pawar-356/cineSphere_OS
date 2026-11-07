import React from "react";
import { MovieFormat } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FormatBadgeProps {
  format: MovieFormat | string;
  size?: "xs" | "sm";
  className?: string;
}

export function FormatBadge({ format, size = "xs", className }: FormatBadgeProps) {
  const formatStyles: Record<string, string> = {
    IMAX: "bg-blue-600/20 text-blue-300 border-blue-500/40 font-bold",
    "4DX": "bg-purple-600/20 text-purple-300 border-purple-500/40 font-bold",
    "Dolby Atmos": "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold",
    ScreenX: "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 font-bold",
    "3D": "bg-cyan-600/20 text-cyan-300 border-cyan-500/40 font-medium",
    "2D": "bg-white/5 text-[#9CA3AF] border-white/10 font-medium",
  };

  const currentStyle = formatStyles[format] || "bg-white/5 text-[#9CA3AF] border-white/10";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border tracking-wider uppercase select-none transition-colors",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        currentStyle,
        className
      )}
    >
      {format}
    </span>
  );
}
