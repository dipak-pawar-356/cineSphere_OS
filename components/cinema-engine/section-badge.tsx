import React from "react";
import { cn } from "@/utils";

export interface SectionBadgeProps {
  name: string;
  color?: string;
  price?: number;
  className?: string;
}

export function SectionBadge({ name, color = "#F59E0B", price, className }: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-white shadow-sm",
        className
      )}
    >
      <span
        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="font-semibold text-zinc-200">{name}</span>
      {price !== undefined && (
        <>
          <span className="text-zinc-600">•</span>
          <span className="font-mono font-bold text-amber-400">₹{price}</span>
        </>
      )}
    </div>
  );
}
