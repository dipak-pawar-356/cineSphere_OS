"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Clock,
  Calendar,
  Building2,
  Film,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Ticket,
  Armchair,
  Accessibility,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "@/components/badges/format-badge";
import { useBookingSessionStore } from "@/store/booking-session-store";
import { BookingTimerBadge } from "./booking-timer-badge";
import { cn } from "@/utils";

export function BookingReviewModal() {
  const {
    isReviewModalOpen,
    closeReviewModal,
    reviewData,
    currentSession,
  } = useBookingSessionStore();

  if (!isReviewModalOpen || !reviewData || !currentSession) {
    return null;
  }

  const {
    movieTitle,
    moviePoster,
    movieCertificate,
    theatreName,
    theatreAddress,
    theatreCity,
    hallName,
    showDate,
    showTime,
    language,
    format,
  } = reviewData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div className="bg-[#0B1220] border border-[#2A3445] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeReviewModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#161F2E] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm" className="font-mono font-bold">
              Booking Review
            </Badge>
            <span className="text-[11px] font-mono text-[#64748B]">
              Session: {currentSession.sessionCode}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Review Your Reservation
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Seats are temporarily locked for your checkout session.
          </p>
        </div>

        {/* Live Timer Strip */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827] border border-[#2A3445]">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Temporary Seat Lock Active</span>
          </div>
          <BookingTimerBadge showExtendButton={true} />
        </div>

        {/* Movie & Screening Card */}
        <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] flex gap-4 items-start">
          <div className="relative h-24 w-16 rounded-xl overflow-hidden shrink-0 border border-[#2A3445] shadow-md">
            <Image
              src={moviePoster}
              alt={movieTitle}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <FormatBadge format={format} size="xs" />
              <span className="text-[10px] text-[#94A3B8] font-medium">{language}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {movieCertificate}
              </span>
            </div>

            <h3 className="font-bold text-white text-base truncate leading-snug">
              {movieTitle}
            </h3>

            <p className="text-xs text-[#94A3B8] flex items-center gap-1 truncate">
              <Building2 className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
              <span className="truncate">{theatreName} • {hallName}</span>
            </p>

            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1 text-white font-medium">
                <Calendar className="h-3 w-3 text-[#FBBF24]" />
                {showDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-white font-medium">
                <Clock className="h-3 w-3 text-[#FBBF24]" />
                {showTime}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Seats Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] font-bold uppercase">
            <span>Locked Seats ({currentSession.seatCount})</span>
            <span>Unit Price</span>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {currentSession.selectedSeats.map((seat) => (
              <div
                key={seat.seatNumber}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-white bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded border border-amber-400/30">
                    {seat.seatNumber}
                  </span>
                  <span className="text-[#CBD5E1] font-medium">{seat.sectionName}</span>
                  {seat.isRecliner && (
                    <span title="Recliner">
                      <Armchair className="h-3.5 w-3.5 text-amber-400" />
                    </span>
                  )}
                  {seat.isWheelchair && (
                    <span title="Wheelchair Space">
                      <Accessibility className="h-3.5 w-3.5 text-sky-400" />
                    </span>
                  )}
                </div>

                <span className="font-mono font-bold text-white">₹{seat.unitPrice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-[#1E293B] pt-4 text-xs">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Seats Subtotal</span>
            <span className="font-mono text-white font-semibold">
              ₹{currentSession.subtotal}
            </span>
          </div>

          <div className="flex justify-between text-[#94A3B8]">
            <span>Convenience Fee (₹35 × {currentSession.seatCount})</span>
            <span className="font-mono text-white">₹{currentSession.convenienceFee}</span>
          </div>

          <div className="flex justify-between text-[#94A3B8]">
            <span>Integrated GST (18%)</span>
            <span className="font-mono text-white">₹{currentSession.tax}</span>
          </div>

          <div className="flex justify-between items-center border-t border-[#1E293B] pt-3 text-base font-bold text-white">
            <span>Total Payable Amount</span>
            <span className="font-mono text-2xl font-black text-emerald-400">
              ₹{currentSession.grandTotal}
            </span>
          </div>
        </div>

        {/* Phase 2 Part 11 Scope Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-amber-400" />
            <span>Booking Engine Architecture Pre-Validated</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed">
            Temporary seat locks and countdown timer active. In Phase 2 Part 12, this button transitions to direct UPI and payment gateway settlement. (Per specifications, payment execution is not triggered here).
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-xl shadow-amber-400/20 gap-2 text-sm"
            onClick={closeReviewModal}
          >
            <span>Proceed to Payment (Phase 2 Part 12 Handoff)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-[#94A3B8] border-[#2A3445]"
            onClick={closeReviewModal}
          >
            Modify Seat Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
