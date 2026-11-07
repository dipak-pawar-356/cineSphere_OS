import React from "react";
import { ShowSeat } from "@/types";
import { SeatBadge } from "./seat-badge";
import { cn } from "@/utils";
import { Trash2 } from "lucide-react";

export interface SeatSummaryProps {
  selectedSeats: ShowSeat[];
  onRemoveSeat?: (seat: ShowSeat) => void;
  onClearAll?: () => void;
  className?: string;
}

export function SeatSummary({
  selectedSeats,
  onRemoveSeat,
  onClearAll,
  className,
}: SeatSummaryProps) {
  if (selectedSeats.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500",
          className
        )}
      >
        No seats selected. Click on available seats in the auditorium to reserve.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-zinc-300">
          Selected Seats ({selectedSeats.length})
        </span>
        {onClearAll && selectedSeats.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedSeats.map((seat) => (
          <SeatBadge
            key={seat.id}
            seat={seat}
            onRemove={onRemoveSeat ? () => onRemoveSeat(seat) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
