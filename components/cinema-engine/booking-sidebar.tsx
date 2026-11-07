"use client";

import React from "react";
import { ShowSeat, PricingSummary, UPIConfiguration } from "@/types";
import { SeatSummary } from "./seat-summary";
import { PriceSummary } from "./price-summary";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { Clock, QrCode, Film, MapPin, Calendar, CheckCircle } from "lucide-react";

export interface BookingSidebarProps {
  movieTitle: string;
  moviePoster?: string;
  language: string;
  format: string;
  theatreName: string;
  hallName: string;
  showDate: string;
  showTime: string;
  theatreUPI?: UPIConfiguration;
  selectedSeats: ShowSeat[];
  pricing: PricingSummary;
  onRemoveSeat?: (seat: ShowSeat) => void;
  onClearSeats?: () => void;
  onProceedToPay?: () => void;
  className?: string;
}

export function BookingSidebar({
  movieTitle,
  moviePoster,
  language,
  format,
  theatreName,
  hallName,
  showDate,
  showTime,
  theatreUPI,
  selectedSeats,
  pricing,
  onRemoveSeat,
  onClearSeats,
  onProceedToPay,
  className,
}: BookingSidebarProps) {
  const hasSeats = selectedSeats.length > 0;

  return (
    <div
      className={cn(
        "rounded-3xl bg-zinc-950 border border-zinc-800 p-5 sm:p-6 space-y-6 shadow-2xl backdrop-blur-xl sticky top-20",
        className
      )}
    >
      {/* 1. Show & Movie Header */}
      <div className="flex gap-4 border-b border-zinc-800/80 pb-4">
        {moviePoster && (
          <img
            src={moviePoster}
            alt={movieTitle}
            className="w-14 h-20 rounded-xl object-cover shrink-0 border border-zinc-800 shadow-md"
          />
        )}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 font-bold border border-amber-400/20">
              {format}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              {language}
            </span>
          </div>
          <h3 className="font-bold text-white text-base truncate leading-tight">
            {movieTitle}
          </h3>
          <p className="text-xs text-zinc-400 flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
            <span className="truncate">{theatreName}</span>
          </p>
        </div>
      </div>

      {/* 2. Schedule Info */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Date</div>
            <div className="font-semibold text-zinc-200">{showDate}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Showtime</div>
            <div className="font-semibold text-zinc-200">{showTime}</div>
          </div>
        </div>
      </div>

      {/* 3. Seat Lock Countdown Architecture Placeholder */}
      {hasSeats && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono">
          <span className="flex items-center gap-1.5 font-semibold">
            <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            Temporary Seat Lock
          </span>
          <span className="font-bold">09:59</span>
        </div>
      )}

      {/* 4. Selected Seats Summary */}
      <SeatSummary
        selectedSeats={selectedSeats}
        onRemoveSeat={onRemoveSeat}
        onClearAll={onClearSeats}
      />

      {/* 5. Live Price Calculation */}
      <PriceSummary pricing={pricing} />

      {/* 6. Theatre Direct UPI Payment Rail */}
      {theatreUPI && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-500">
              Direct Theatre Payee
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Tenant Isolated
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">{theatreUPI.merchantName}</div>
              <div className="font-mono text-[11px] text-amber-400">{theatreUPI.upiId}</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <QrCode className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      )}

      {/* 7. Action Button */}
      <Button
        variant="primary"
        size="lg"
        disabled={!hasSeats}
        onClick={onProceedToPay}
        className="w-full font-bold shadow-xl shadow-amber-400/20"
      >
        {hasSeats
          ? `Proceed to Pay ${pricing.formattedTotal}`
          : "Select Seats to Continue"}
      </Button>
    </div>
  );
}
