"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ClockAlert,
  RotateCcw,
  Film,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookingSessionStore } from "@/store/booking-session-store";

export interface BookingSessionExpiredModalProps {
  onRestart?: () => void;
}

export function BookingSessionExpiredModal({
  onRestart,
}: BookingSessionExpiredModalProps) {
  const router = useRouter();
  const {
    isExpiredModalOpen,
    closeExpiredModal,
    resetSession,
    currentSession,
  } = useBookingSessionStore();

  if (!isExpiredModalOpen) {
    return null;
  }

  const expiredSessionCode = currentSession?.sessionCode || "SES-EXPIRED";
  const seatCount = currentSession?.seatCount || 0;
  const seatNumbers = currentSession?.selectedSeats.map((s) => s.seatNumber).join(", ") || "None";

  const handleRestart = () => {
    closeExpiredModal();
    resetSession();
    if (onRestart) {
      onRestart();
    }
  };

  const handleBrowseMovies = () => {
    closeExpiredModal();
    resetSession();
    router.push("/movies");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div className="bg-[#0B1220] border border-rose-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        {/* Top Warning Icon */}
        <div className="h-16 w-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10 animate-pulse">
          <ClockAlert className="h-8 w-8" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-bold">
            <ShieldAlert className="h-3 w-3" />
            <span>SESSION EXPIRED</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reservation Time Expired
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Your 10-minute temporary seat reservation has ended. To ensure fair access for all patrons, the locked seats have been released back to general inventory.
          </p>
        </div>

        {/* Expired Session Details */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#64748B]">Expired Session</span>
            <span className="font-mono font-bold text-white">{expiredSessionCode}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#64748B]">Released Seats ({seatCount})</span>
            <span className="font-mono text-rose-400 font-bold">{seatNumbers}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] border-t border-[#1E293B] pt-2">
            <span className="text-[#64748B]">Inventory Status</span>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <span>●</span> Restored to Public Sale
            </span>
          </div>
        </div>

        {/* Architecture Note */}
        <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-300 text-left flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Distributed Concurrency Guard:</strong> CineSphere OS enforces non-blocking temporary locks. Unconfirmed sessions automatically expire to prevent zombie locks and double bookings.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleRestart}
            className="w-full font-bold shadow-lg shadow-amber-400/20 text-sm gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restart Seat Selection</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBrowseMovies}
            className="w-full text-xs text-[#94A3B8] border-[#2A3445] hover:text-white"
          >
            <Film className="h-3.5 w-3.5 mr-1.5" />
            <span>Explore Other Shows</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

