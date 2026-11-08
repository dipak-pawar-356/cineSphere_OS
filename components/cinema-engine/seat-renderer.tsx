"use client";

import React from "react";
import { cn } from "@/utils";
import { ShowSeat } from "@/types";
import { SeatTooltip } from "./seat-tooltip";
import { Accessibility, Wrench, Check } from "lucide-react";

export interface SeatRendererProps {
  seat: ShowSeat;
  isSelected?: boolean;
  sectionColor?: string;
  onClick?: (seat: ShowSeat) => void;
  className?: string;
}

export function SeatRenderer({
  seat,
  isSelected = false,
  sectionColor = "#F59E0B",
  onClick,
  className,
}: SeatRendererProps) {
  const isBooked = seat.status === "Booked";
  const isReserved = seat.status === "Reserved";
  const isBlocked = seat.status === "Blocked";
  const isMaintenance = seat.status === "Maintenance";
  const isWheelchair = seat.status === "Wheelchair" || seat.isWheelchair;
  const isRecliner = seat.seatType === "Recliner" || seat.isRecliner;
  const isCouple = seat.seatType === "Couple";

  const isInteractive =
    !isBooked && !isReserved && !isBlocked && !isMaintenance;

  const handleClick = () => {
    if (isInteractive && onClick) {
      onClick(seat);
    }
  };

  // Base styling for the seat shape
  const baseSize = isRecliner
    ? "w-8 h-8 sm:w-9 sm:h-9"
    : isCouple
    ? "w-14 h-7 sm:w-16 sm:h-8"
    : "w-7 h-7 sm:w-8 sm:h-8";

  let statusStyles = "";

  if (isSelected) {
    statusStyles =
      "bg-amber-400 text-black border-amber-300 font-bold shadow-lg shadow-amber-400/40 scale-105 ring-2 ring-amber-300";
  } else if (isBooked) {
    statusStyles =
      "bg-zinc-900/40 text-zinc-600 border-zinc-800/60 cursor-not-allowed opacity-35";
  } else if (isReserved) {
    statusStyles =
      "bg-amber-950/30 text-amber-500 border-amber-800/50 cursor-not-allowed opacity-60";
  } else if (isBlocked) {
    statusStyles =
      "bg-zinc-900/50 text-zinc-500 border-dashed border-zinc-700 cursor-not-allowed opacity-50";
  } else if (isMaintenance) {
    statusStyles =
      "bg-rose-950/20 text-rose-500 border-rose-900/40 cursor-not-allowed opacity-40";
  } else if (isWheelchair) {
    statusStyles =
      "bg-sky-950/40 text-sky-300 border-sky-500/60 hover:bg-sky-500 hover:text-black cursor-pointer hover:scale-105";
  } else {
    // Available default
    statusStyles =
      "bg-zinc-900/90 text-zinc-300 hover:text-white border-zinc-700 hover:border-amber-400 hover:bg-zinc-800 cursor-pointer hover:scale-105 active:scale-95";
  }

  const seatNode = (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={handleClick}
      aria-label={`Seat ${seat.seatNumber}, ${seat.sectionName}, Price ₹${seat.price}, Status ${
        isSelected ? "Selected" : seat.status
      }`}
      aria-pressed={isSelected}
      aria-disabled={!isInteractive}
      className={cn(
        "relative rounded-t-lg rounded-b-md border text-[10px] sm:text-xs font-mono transition-all duration-150 flex flex-col items-center justify-center select-none shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        baseSize,
        statusStyles,
        className
      )}
      style={{
        borderTopColor: isSelected ? undefined : !isBooked ? sectionColor : undefined,
        borderTopWidth: isSelected ? "2px" : "3px",
      }}
    >
      {isSelected ? (
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      ) : isWheelchair ? (
        <Accessibility className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      ) : isMaintenance ? (
        <Wrench className="h-3 w-3" />
      ) : (
        <span className="truncate max-w-[90%] leading-none">
          {seat.column}
        </span>
      )}
    </button>
  );

  return <SeatTooltip seat={seat}>{seatNode}</SeatTooltip>;
}

