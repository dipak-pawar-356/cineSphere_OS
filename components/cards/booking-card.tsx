"use client";

import React from "react";
import { Ticket, Calendar, Clock, MapPin, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

export interface BookingCardProps {
  bookingRef: string;
  movieTitle: string;
  theatreName: string;
  hallName: string;
  showDate: string;
  showTime: string;
  seats: string;
  format?: string;
  totalAmount: string;
  status?: "Confirmed" | "Processing" | "Refunded" | "Completed";
  className?: string;
  onViewTicket?: () => void;
}

/**
 * Enterprise Booking Transaction Card
 * Displays reservation details, seat codes, dynamic QR pass trigger, and status.
 */
export function BookingCard({
  bookingRef,
  movieTitle,
  theatreName,
  hallName,
  showDate,
  showTime,
  seats,
  format = "IMAX Laser",
  totalAmount,
  status = "Confirmed",
  className,
  onViewTicket,
}: BookingCardProps) {
  return (
    <Card variant="elevated" className={cn("p-5 space-y-4", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-[#2A3445] pb-3">
        <div>
          <span className="font-mono text-xs font-bold text-[#FBBF24]">{bookingRef}</span>
          <h3 className="font-bold text-white text-base mt-0.5">{movieTitle}</h3>
          <p className="text-xs text-[#94A3B8]">{theatreName} • {hallName}</p>
        </div>

        <Badge
          variant={
            status === "Confirmed"
              ? "success"
              : status === "Processing"
              ? "warning"
              : status === "Refunded"
              ? "danger"
              : "outline"
          }
          size="sm"
        >
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#CBD5E1]">
          <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
          <span>{showDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#CBD5E1]">
          <Clock className="h-3.5 w-3.5 text-[#38BDF8]" />
          <span className="font-mono">{showTime}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#CBD5E1]">
          <Ticket className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono font-bold text-white">{seats}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#CBD5E1]">
          <span className="text-[#94A3B8]">Total:</span>
          <span className="font-mono font-bold text-[#FBBF24]">{totalAmount}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#2A3445] flex items-center justify-between">
        <Badge variant="outline" size="sm">{format}</Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewTicket || (() => alert(`Ticket pass for ${bookingRef} (Placeholder)`))}
          iconLeft={<QrCode className="h-3.5 w-3.5 text-[#FBBF24]" />}
          className="h-7 text-xs px-2.5 border-[#2A3445]"
        >
          View QR Pass
        </Button>
      </div>
    </Card>
  );
}

