import React from "react";
import { cn } from "@/utils";
import { ShowSeat } from "@/types";
import { X } from "lucide-react";

export interface SeatBadgeProps {
  seat: ShowSeat;
  onRemove?: () => void;
  className?: string;
}

export function SeatBadge({ seat, onRemove, className }: SeatBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white shadow-sm transition-all",
        className
      )}
    >
      <span className="font-mono font-bold text-amber-400">{seat.seatNumber}</span>
      <span className="text-zinc-500">•</span>
      <span className="text-zinc-400 text-[11px]">{seat.sectionName}</span>
      <span className="text-zinc-500">•</span>
      <span className="font-semibold text-emerald-400">₹{seat.price}</span>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-0.5 rounded cursor-pointer"
          title={`Remove ${seat.seatNumber}`}
          aria-label={`Remove seat ${seat.seatNumber}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
