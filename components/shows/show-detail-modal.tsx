"use client";

import React from "react";
import { ManagedShow } from "@/store/theatre-store";
import { Modal } from "@/components/dialogs/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Film,
  Building2,
  DollarSign,
  Users,
  Copy,
  Edit,
  XCircle,
  Layers,
  Sparkles,
} from "lucide-react";

interface ShowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: ManagedShow | null;
  onEdit?: (show: ManagedShow) => void;
  onCancel?: (id: string, title: string) => void;
  onDuplicate?: (show: ManagedShow) => void;
}

export function ShowDetailModal({
  isOpen,
  onClose,
  show,
  onEdit,
  onCancel,
  onDuplicate,
}: ShowDetailModalProps) {
  if (!show) return null;

  const occupancy =
    show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;
  const availableSeats = show.seatsAvailable ?? Math.max(0, show.totalSeats - show.seatsBooked);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Screening Event Inspector" size="lg">
      <div className="space-y-6 pt-2 text-xs">
        {/* Hero Marquee */}
        <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] bg-[#070B12]">
          <div className="relative h-44 w-full">
            {show.movieBannerUrl || show.moviePosterUrl ? (
              <img
                src={show.movieBannerUrl || show.moviePosterUrl}
                alt={show.movieTitle}
                className="w-full h-full object-cover opacity-35 blur-xs"
              />
            ) : (
              <div className="w-full h-full bg-[#111827]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/60 to-transparent" />

            {/* Floating Info */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div className="flex items-end gap-3.5">
                {show.moviePosterUrl && (
                  <div className="h-28 w-20 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-[#111827] shrink-0">
                    <img
                      src={show.moviePosterUrl}
                      alt={show.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={show.status === "Cancelled" ? "danger" : "success"} size="sm">
                      {show.status}
                    </Badge>
                    <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                      {show.format}
                    </Badge>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {show.showCode || `SH-${show.id}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">{show.movieTitle}</h3>
                  <div className="text-[11px] text-[#94A3B8]">
                    {show.language} • {show.durationMinutes || 150} mins
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Turnaround Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono block">
              Auditorium
            </span>
            <div className="font-bold text-white text-sm">{show.hallName}</div>
            <div className="text-[11px] text-sky-400 font-mono">
              {show.screenType || show.format} • {show.totalSeats} seats
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono block">
              Screening Window
            </span>
            <div className="font-bold text-amber-400 font-mono text-sm">
              {show.startTime} – {show.endTime}
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">
              Turnaround: {show.totalOccupiedMinutes || 185} mins
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-1">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-mono block">
              Sales & Booking
            </span>
            <div className="font-bold text-emerald-400 text-sm">
              {show.bookingStatus || "Booking Open"}
            </div>
            <div className="text-[11px] text-[#94A3B8]">
              Starting at ₹{show.ticketPrice}
            </div>
          </div>
        </div>

        {/* Real-Time Seat Inventory Barometer */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <Users className="h-4 w-4 text-emerald-400" />
              Show Seat Inventory Telemetry
            </h4>
            <span className="text-emerald-400 font-mono font-bold">{occupancy}% Occupancy</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#1E293B] overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${occupancy}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
            <div className="p-2 rounded-lg bg-[#070B12] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block">TOTAL SEATS</span>
              <span className="font-bold text-white">{show.totalSeats}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#070B12] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block">BOOKED</span>
              <span className="font-bold text-emerald-400">{show.seatsBooked}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#070B12] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block">AVAILABLE</span>
              <span className="font-bold text-sky-400">{availableSeats}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#070B12] border border-[#1E293B]">
              <span className="text-[10px] text-[#64748B] block">EST. REVENUE</span>
              <span className="font-bold text-amber-400">
                ₹{(show.seatsBooked * show.ticketPrice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Reusable Pricing Profile Details */}
        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <DollarSign className="h-4 w-4 text-amber-400" />
              Assigned Pricing Profile
            </h4>
            <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
              {show.pricingProfileName || "Standard Tariff"}
            </Badge>
          </div>

          {show.sectionPricing ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {Object.entries(show.sectionPricing).map(([tier, rate]) => (
                <div
                  key={tier}
                  className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1E293B] flex justify-between items-center"
                >
                  <span className="text-[#94A3B8]">{tier}:</span>
                  <span className="font-bold text-emerald-400">₹{rate}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#94A3B8]">
              Standard general admission rate applies at ₹{show.ticketPrice} per ticket.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B]">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              onCancel?.(show.id, show.movieTitle);
              onClose();
            }}
            disabled={show.status === "Cancelled"}
            className="gap-1.5 text-xs"
          >
            <XCircle className="h-3.5 w-3.5" /> Cancel Showtime
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDuplicate?.(show);
                onClose();
              }}
              className="gap-1.5 border-[#2A3445] text-white text-xs"
            >
              <Copy className="h-3.5 w-3.5 text-amber-400" /> Duplicate Slot
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onEdit?.(show);
                onClose();
              }}
              className="gap-1.5 text-xs font-bold"
            >
              <Edit className="h-3.5 w-3.5" /> Modify Parameters
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
