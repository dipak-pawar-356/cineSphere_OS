"use client";

import React, { useEffect } from "react";
import { Clock, AlertTriangle, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingSessionStore } from "@/store/booking-session-store";
import { cn } from "@/utils";

export interface BookingTimerBadgeProps {
  className?: string;
  showExtendButton?: boolean;
}

export function BookingTimerBadge({
  className,
  showExtendButton = true,
}: BookingTimerBadgeProps) {
  const {
    currentSession,
    timeRemainingSeconds,
    tickTimer,
    extendSessionLock,
    isLoading,
  } = useBookingSessionStore();

  // Tick timer every second
  useEffect(() => {
    if (!currentSession || currentSession.status !== "Active") return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, tickTimer]);

  if (!currentSession || currentSession.status !== "Active") {
    return null;
  }

  const mins = Math.floor(timeRemainingSeconds / 60);
  const secs = timeRemainingSeconds % 60;
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  const isLowTime = timeRemainingSeconds <= 120 && timeRemainingSeconds > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all",
        isLowTime
          ? "bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse shadow-md shadow-rose-500/10"
          : "bg-[#111827] border-[#2A3445] text-[#CBD5E1]",
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-bold">
        {isLowTime ? (
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
        ) : (
          <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        )}
        <span className="text-[11px] font-sans text-[#94A3B8] hidden sm:inline">
          {isLowTime ? "Lock Expiring:" : "Seat Lock Timer:"}
        </span>
        <span
          className={cn(
            "text-sm font-black tracking-wider",
            isLowTime ? "text-rose-400" : "text-amber-400"
          )}
        >
          {formatted}
        </span>
      </div>

      {showExtendButton && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={extendSessionLock}
          className="h-6 px-2 text-[10px] font-sans border-[#2A3445] text-amber-400 hover:text-white hover:border-amber-400 gap-1 shrink-0"
        >
          <Plus className="h-3 w-3" />
          <span>+5m</span>
        </Button>
      )}
    </div>
  );
}
