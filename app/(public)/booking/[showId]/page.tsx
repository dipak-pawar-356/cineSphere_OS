"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getUnifiedCustomerShowDetails,
  calculateCustomerPriceSummary,
  getAllPublishedShows,
} from "@/lib/engine/customer-discovery-engine";
import {
  CustomerShowDetailsResponse,
  CustomerSeatDTO,
  CustomerPriceSummaryDTO,
} from "@/types/customer-discovery.types";
import { SeatLockDTO } from "@/types/booking-engine.types";
import { useBookingSessionStore } from "@/store/booking-session-store";
import { getActiveSeatLocksAction } from "@/actions/booking-engine-actions";
import {
  BookingTimerBadge,
  BookingReviewModal,
  BookingSessionExpiredModal,
} from "@/components/booking";
import { FormatBadge } from "@/components/badges/format-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  Info,
  CheckCircle2,
  Building2,
  Layers,
  Calendar,
  DoorOpen,
  Check,
  X,
  Accessibility,
  Armchair,
  Ticket,
  ChevronRight,
  AlertCircle,
  MapPin,
  HelpCircle,
  Ban,
  Wrench,
  Lock,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/utils";

export default function ShowBookingPage() {
  const params = useParams();
  const router = useRouter();
  const showId = typeof params?.showId === "string" ? params.showId : "show-pun-001";

  // 1. Single Show ID Resolution (Architectural Law)
  // Resolves Movie, Theatre, Hall, Layout, Seat Inventory, Pricing, and Legends in one unified snapshot
  const showDetails: CustomerShowDetailsResponse = useMemo(() => {
    return getUnifiedCustomerShowDetails(showId);
  }, [showId]);

  const {
    show,
    movie,
    theatre,
    hall,
    layout,
    seatInventory,
    pricingProfile,
    sectionLegends,
    capacityMetrics,
  } = showDetails;

  // 2. Resolve Alternate Shows for Quick Switcher
  const allShows = useMemo(() => getAllPublishedShows(), []);
  const alternateShows = useMemo(() => {
    return allShows.filter(
      (s) => s.movieId === show.movieId || s.theatreId === show.theatreId
    );
  }, [allShows, show]);

  // 3. Booking Engine Store Integration (Phase 2 Part 11)
  const {
    currentSession,
    isLoading: isSessionLoading,
    error: sessionError,
    initSession,
    selectSeat,
    deselectSeat,
    openReviewModal,
    resetSession,
    clearError,
  } = useBookingSessionStore();

  // Active locks by other concurrent users for double-booking conflict prevention
  const [activeLocks, setActiveLocks] = useState<SeatLockDTO[]>([]);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const fetchLocks = useCallback(async () => {
    try {
      const res = await getActiveSeatLocksAction(showId);
      if (res.success && res.data) {
        setActiveLocks(res.data);
      }
    } catch {
      // Background poll failure handled gracefully
    }
  }, [showId]);

  // Initialize booking session on mount & fetch locks
  useEffect(() => {
    initSession(showId);
    fetchLocks();

    const interval = setInterval(() => {
      fetchLocks();
    }, 15000); // 15s lock refresh poll

    return () => clearInterval(interval);
  }, [showId, initSession, fetchLocks]);

  // Selected seat numbers derived from active booking session
  const selectedSeatNumbers = useMemo(() => {
    if (!currentSession || currentSession.showId !== showId) return [];
    return currentSession.selectedSeats.map((s) => s.seatNumber);
  }, [currentSession, showId]);

  // 4. Real-time Price Summary Calculation
  const priceSummary: CustomerPriceSummaryDTO = useMemo(() => {
    return calculateCustomerPriceSummary(selectedSeatNumbers, showDetails);
  }, [selectedSeatNumbers, showDetails]);

  // Seat Click Handler wired to Booking Engine concurrency locks
  const handleSeatClick = async (seat: CustomerSeatDTO) => {
    setBannerError(null);
    clearError();

    // Check permanent status
    if (
      seat.status === "Booked" ||
      seat.status === "Reserved" ||
      seat.status === "Blocked" ||
      seat.status === "Maintenance"
    ) {
      return; // Non-selectable
    }

    // Check if locked by another active session
    const isLockedByOther = activeLocks.some(
      (lock) =>
        lock.seatNumber === seat.seatNumber &&
        lock.lockedBySessionId !== currentSession?.id
    );

    if (isLockedByOther) {
      setBannerError(
        `Seat ${seat.seatNumber} is temporarily reserved by another patron. Please select an available seat.`
      );
      return;
    }

    const isCurrentlySelected = selectedSeatNumbers.includes(seat.seatNumber);

    if (isCurrentlySelected) {
      const res = await deselectSeat(seat.seatNumber);
      if (!res.success && res.error) {
        setBannerError(res.error);
      }
      fetchLocks();
    } else {
      const res = await selectSeat(seat.seatNumber);
      if (!res.success && res.error) {
        setBannerError(res.error);
      }
      fetchLocks();
    }
  };

  const handleRemoveSeat = async (seatNumber: string) => {
    setBannerError(null);
    await deselectSeat(seatNumber);
    fetchLocks();
  };

  const handleClearSeats = async () => {
    setBannerError(null);
    for (const num of [...selectedSeatNumbers]) {
      await deselectSeat(num);
    }
    fetchLocks();
  };

  // Group seats by Section
  const seatsBySection = useMemo(() => {
    const map = new Map<string, CustomerSeatDTO[]>();
    for (const seat of seatInventory) {
      if (!map.has(seat.sectionId)) {
        map.set(seat.sectionId, []);
      }
      map.get(seat.sectionId)!.push(seat);
    }
    return map;
  }, [seatInventory]);

  return (
    <div className="min-h-screen bg-[#070B12] text-white pb-24">
      {/* 1. TOP BREADCRUMBS & SHOWTIME QUICK SWITCHER BAR */}
      <div className="bg-[#0B1220] border-b border-[#1E293B] sticky top-0 z-30 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2">
          {/* Breadcrumb row with Active Lock Timer */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <nav className="flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-[#64748B]" />
              <Link href="/movies" className="hover:text-white transition-colors">
                Movies
              </Link>
              <ChevronRight className="h-3 w-3 text-[#64748B]" />
              <Link
                href={`/movie/${movie.slug}`}
                className="hover:text-white transition-colors truncate max-w-[140px]"
              >
                {movie.title}
              </Link>
              <ChevronRight className="h-3 w-3 text-[#64748B]" />
              <Link
                href={`/theatre/${theatre.slug}`}
                className="hover:text-white transition-colors truncate max-w-[140px]"
              >
                {theatre.name}
              </Link>
              <ChevronRight className="h-3 w-3 text-[#64748B]" />
              <span className="text-[#FBBF24] font-medium font-mono">
                {show.startTime} (Seats)
              </span>
            </nav>

            <div className="flex items-center gap-3">
              {/* Live Session Timer Badge in Header */}
              {currentSession && currentSession.status === "Active" && (
                <BookingTimerBadge showExtendButton={true} />
              )}

              <div className="flex items-center gap-2 text-xs font-mono hidden md:flex">
                <Building2 className="h-3.5 w-3.5 text-[#FBBF24]" />
                <span className="text-white font-semibold">{theatre.name}</span>
                <span className="text-[#64748B]">({theatre.city})</span>
              </div>
            </div>
          </div>

          {/* Show Switcher Pills */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#1E293B]/70 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono font-bold text-[#FBBF24] uppercase tracking-wider shrink-0">
              Other Shows:
            </span>
            <div className="flex items-center gap-1.5">
              {alternateShows.map((s) => {
                const isActive = s.id === show.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (!isActive) {
                        resetSession();
                        router.push(`/booking/${s.id}`);
                      }
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                      isActive
                        ? "bg-[#FBBF24] text-black border-[#FBBF24] font-bold shadow-sm shadow-[#FBBF24]/20"
                        : "bg-[#111827] text-[#94A3B8] border-[#2A3445] hover:text-white hover:border-[#38BDF8]"
                    )}
                  >
                    <span>{s.startTime}</span>
                    <span className="text-[10px] opacity-80 font-mono">({s.format})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Conflict or Validation Warning Banner */}
      {(bannerError || sessionError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{bannerError || sessionError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBannerError(null);
                clearError();
              }}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. SHOW INFORMATION HERO */}
      <div className="relative bg-[#0B1220]/95 border-b border-[#1E293B] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Movie Thumbnail */}
              <div className="relative h-24 w-16 sm:h-28 sm:w-20 rounded-xl overflow-hidden shrink-0 border border-[#2A3445] shadow-lg">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <FormatBadge format={show.format} size="xs" />
                  <Badge variant="outline" size="sm" className="text-[#94A3B8] border-[#2A3445]">
                    {show.language}
                  </Badge>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium font-mono">
                    {show.hallName}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {movie.certification}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
                    {show.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
                    {show.startTime} - {show.endTime}
                  </span>
                  <span>•</span>
                  <span>
                    {theatre.name}, {theatre.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Invariant Banner */}
            <div className="rounded-2xl bg-[#111827] border border-[#2A3445] p-3.5 text-xs max-w-md space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#FBBF24] font-bold text-xs">
                  <Layers className="h-4 w-4" />
                  <span>Central Show ID Resolution</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  {capacityMetrics.availableSeats} Seats Available
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Hall layout & geometry are permanent physical venue assets. Temporary seat reservations are managed dynamically per session with double-booking prevention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 2D AUDITORIUM GRID + REAL-TIME PRICING SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Seating Grid (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 bg-[#0B1220]/70 rounded-3xl p-5 sm:p-8 border border-[#1E293B] shadow-2xl backdrop-blur-xl">
            {/* Anti-Double-Booking Protection Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Dynamic Concurrency Locks Active:</strong> Clicked seats are reserved exclusively for your session for 10 minutes.
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-400/20 px-2 py-0.5 rounded font-bold shrink-0">
                Auditorium: {layout.name}
              </span>
            </div>

            {/* 1. Curved Screen Visual Indicator */}
            <div className="relative max-w-2xl mx-auto text-center space-y-2 pt-2 select-none">
              <div className="relative flex justify-center">
                <div className="w-full h-8 border-t-4 border-amber-400/80 rounded-t-[120px] shadow-[0_-12px_24px_rgba(245,158,11,0.25)] relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-amber-400/15 to-transparent blur-sm" />
                </div>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold flex items-center justify-center gap-2">
                <span>•</span>
                <span>Auditorium Screen — All Eyes This Way</span>
                <span>•</span>
              </div>
            </div>

            {/* 2. Emergency Exits Top Indicators */}
            <div className="flex justify-between items-center px-4 text-[10px] font-mono text-[#64748B] uppercase tracking-wider select-none">
              <div className="flex items-center gap-1.5 text-emerald-400/90 font-semibold">
                <DoorOpen className="h-3.5 w-3.5" />
                <span>Exit Left</span>
              </div>
              <div className="text-[#94A3B8]">Acoustic Sweet Spot (Rows B - D)</div>
              <div className="flex items-center gap-1.5 text-emerald-400/90 font-semibold">
                <span>Exit Right</span>
                <DoorOpen className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* 3. Dynamic 2D Seating Sections */}
            <div className="space-y-8 overflow-x-auto pb-4">
              {layout.sections.map((section) => {
                const sectionSeats = seatsBySection.get(section.id) || [];
                const legend = sectionLegends.find((l) => l.sectionId === section.id);

                // Group section seats by Row
                const rowsMap = new Map<string, CustomerSeatDTO[]>();
                for (const seat of sectionSeats) {
                  if (!rowsMap.has(seat.row)) {
                    rowsMap.set(seat.row, []);
                  }
                  rowsMap.get(seat.row)!.push(seat);
                }

                return (
                  <div
                    key={section.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#070B12]/60 border border-[#1E293B] space-y-4"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: section.color }}
                        />
                        <span className="text-sm font-bold text-white">
                          {section.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#94A3B8]">
                          ({section.tier})
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-xs text-[#94A3B8]">
                          {legend?.availableSeats || 0} of {legend?.totalSeats || 0} Available
                        </span>
                        <span className="font-mono font-bold text-base text-[#FBBF24]">
                          ₹{section.price}
                        </span>
                      </div>
                    </div>

                    {/* Row by Row Seat Map */}
                    <div className="space-y-2.5 min-w-[560px]">
                      {Array.from(rowsMap.entries()).map(([rowLabel, rowSeats]) => (
                        <div key={rowLabel} className="flex items-center gap-2 justify-center">
                          {/* Row Label Left */}
                          <span className="w-5 text-center text-xs font-mono font-bold text-[#64748B]">
                            {rowLabel}
                          </span>

                          {/* Row Seats */}
                          <div className="flex items-center gap-1.5">
                            {rowSeats.map((seat) => {
                              const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                              const isBooked = seat.status === "Booked";
                              const isReserved = seat.status === "Reserved";
                              const isBlocked = seat.status === "Blocked";
                              const isMaintenance = seat.status === "Maintenance";

                              // Check concurrency lock held by another session
                              const isLockedByOther = activeLocks.some(
                                (lock) =>
                                  lock.seatNumber === seat.seatNumber &&
                                  lock.lockedBySessionId !== currentSession?.id
                              );

                              const isAvailable =
                                seat.status === "Available" && !isLockedByOther;

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={(!isAvailable && !isSelected) || isSessionLoading}
                                  onClick={() => handleSeatClick(seat)}
                                  title={
                                    isLockedByOther
                                      ? `${seat.seatNumber} • Temporarily reserved by another customer`
                                      : `${seat.seatNumber} • ${seat.sectionName} • ₹${seat.price} (${
                                          isSelected ? "Selected" : seat.status
                                        })`
                                  }
                                  className={cn(
                                    "relative h-7 w-7 sm:h-8 sm:w-8 rounded-t-lg rounded-b-md text-[10px] font-mono font-bold transition-all flex items-center justify-center select-none",
                                    // Available state
                                    isAvailable &&
                                      !isSelected &&
                                      "bg-[#161F2E] text-[#CBD5E1] border border-[#2A3445] hover:border-amber-400 hover:text-white hover:scale-105 shadow-sm cursor-pointer",
                                    // Selected state (Amber glow with checkmark)
                                    isSelected &&
                                      "bg-[#FBBF24] text-black border-2 border-white shadow-lg shadow-amber-400/40 scale-105 z-10 cursor-pointer",
                                    // Locked by other concurrent customer session
                                    isLockedByOther &&
                                      !isSelected &&
                                      "bg-[#161F2E] text-amber-400/90 border border-dashed border-amber-400/60 cursor-not-allowed opacity-80",
                                    // Booked / Sold state
                                    isBooked &&
                                      "bg-[#0D131F] text-[#475569] border border-[#1E293B] cursor-not-allowed opacity-50",
                                    // Reserved state
                                    isReserved &&
                                      "bg-[#0D131F] text-[#475569] border border-dashed border-[#2A3445] cursor-not-allowed opacity-60",
                                    // Blocked state
                                    isBlocked &&
                                      "bg-rose-950/20 text-rose-500 border border-rose-900/40 cursor-not-allowed opacity-50",
                                    // Maintenance state
                                    isMaintenance &&
                                      "bg-amber-950/20 text-amber-500 border border-amber-900/40 cursor-not-allowed opacity-50"
                                  )}
                                >
                                  {isSelected ? (
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  ) : isLockedByOther ? (
                                    <Lock className="h-3 w-3 text-amber-400" />
                                  ) : isBooked ? (
                                    <X className="h-3 w-3 text-[#475569]" />
                                  ) : isReserved ? (
                                    <Lock className="h-2.5 w-2.5 text-[#64748B]" />
                                  ) : isBlocked ? (
                                    <Ban className="h-2.5 w-2.5 text-rose-500/80" />
                                  ) : isMaintenance ? (
                                    <Wrench className="h-2.5 w-2.5 text-amber-500/80" />
                                  ) : seat.isWheelchair ? (
                                    <Accessibility className="h-3.5 w-3.5 text-sky-400" />
                                  ) : seat.isRecliner ? (
                                    <Armchair className="h-3.5 w-3.5 opacity-80" />
                                  ) : (
                                    seat.column
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Row Label Right */}
                          <span className="w-5 text-center text-xs font-mono font-bold text-[#64748B]">
                            {rowLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. Section Legends & Seat Status Guide */}
            <div className="rounded-2xl bg-[#070B12] border border-[#1E293B] p-4 sm:p-5 space-y-4 text-xs select-none">
              {/* Section Tiers & Pricing */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="text-[#64748B] font-mono uppercase text-[10px] tracking-wider font-bold">
                  Section Tiers:
                </span>
                {sectionLegends.map((leg) => (
                  <div key={leg.sectionId} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: leg.color }}
                    />
                    <span className="text-white font-medium">{leg.sectionName}</span>
                    <span className="font-mono font-bold text-[#FBBF24]">
                      ₹{leg.price}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      ({leg.availableSeats} left)
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Guide */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t border-[#1E293B] pt-3 text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b border border-[#2A3445] bg-[#161F2E]" />
                  <span>Available</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-[#FBBF24] text-black flex items-center justify-center font-bold">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span className="text-[#FBBF24] font-medium">Selected</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-[#161F2E] border border-dashed border-amber-400/60 flex items-center justify-center">
                    <Lock className="h-2.5 w-2.5 text-amber-400" />
                  </div>
                  <span className="text-amber-300 font-medium">Temporary Lock</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-[#0D131F] border border-[#1E293B] opacity-50 flex items-center justify-center">
                    <X className="h-2.5 w-2.5 text-[#475569]" />
                  </div>
                  <span>Sold Out</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-[#0D131F] border border-dashed border-[#2A3445] flex items-center justify-center">
                    <Lock className="h-2 w-2 text-[#64748B]" />
                  </div>
                  <span>Reserved</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-rose-950/40 border border-rose-900/60 flex items-center justify-center">
                    <Ban className="h-2 w-2 text-rose-500" />
                  </div>
                  <span>Blocked</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-amber-950/40 border border-amber-900/60 flex items-center justify-center">
                    <Wrench className="h-2 w-2 text-amber-500" />
                  </div>
                  <span>Maintenance</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-sky-950/60 border border-sky-500/50 text-sky-400 flex items-center justify-center">
                    <Accessibility className="h-2.5 w-2.5" />
                  </div>
                  <span>Wheelchair</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-t-md rounded-b bg-[#161F2E] border border-amber-400/40 text-amber-400 flex items-center justify-center">
                    <Armchair className="h-2.5 w-2.5" />
                  </div>
                  <span>Recliner</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. REAL-TIME BOOKING & PRICE SUMMARY SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="rounded-3xl bg-[#0B1220] border border-[#1E293B] p-5 sm:p-6 space-y-6 shadow-2xl backdrop-blur-xl">
              {/* Session Identity & Countdown Header */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">
                    Reservation Session
                  </span>
                  <span className="font-mono font-bold text-xs text-white">
                    {currentSession?.sessionCode || "SES-INITIALIZING"}
                  </span>
                </div>
                <BookingTimerBadge showExtendButton={true} />
              </div>

              {/* Movie & Show Info Card */}
              <div className="flex gap-4 border-b border-[#1E293B] pb-4">
                <div className="relative h-20 w-14 rounded-xl overflow-hidden shrink-0 border border-[#2A3445] shadow-md">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FormatBadge format={show.format} size="xs" />
                    <span className="text-[10px] text-[#94A3B8] font-medium">
                      {show.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base truncate leading-tight">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 text-[#FBBF24] shrink-0" />
                    <span className="truncate">{theatre.name}</span>
                  </p>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#111827] rounded-xl p-3 border border-[#2A3445]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#94A3B8] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase">Date</div>
                    <div className="font-semibold text-white">{show.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#FBBF24] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase">Time</div>
                    <div className="font-semibold text-white">{show.startTime}</div>
                  </div>
                </div>
              </div>

              {/* Selected Seats Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#94A3B8] font-semibold">
                    Selected Seats ({selectedSeatNumbers.length})
                  </span>
                  {selectedSeatNumbers.length > 0 && (
                    <button
                      type="button"
                      disabled={isSessionLoading}
                      onClick={handleClearSeats}
                      className="text-[11px] text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedSeatNumbers.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(currentSession?.selectedSeats || []).map((item) => (
                      <div
                        key={item.seatId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#111827] border border-[#2A3445] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded border border-amber-400/30">
                            {item.seatNumber}
                          </span>
                          <span className="text-[#94A3B8] text-[11px]">
                            {item.sectionName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white">
                            ₹{item.unitPrice}
                          </span>
                          <button
                            type="button"
                            disabled={isSessionLoading}
                            onClick={() => handleRemoveSeat(item.seatNumber)}
                            className="text-[#64748B] hover:text-white transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#111827] border border-dashed border-[#2A3445] text-center space-y-1">
                    <p className="text-xs text-[#94A3B8]">
                      Click seats on the auditorium map to reserve your tickets.
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Max 10 seats per booking session
                    </p>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              {selectedSeatNumbers.length > 0 && (
                <div className="space-y-2.5 border-t border-[#1E293B] pt-4 text-xs">
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Tickets Subtotal</span>
                    <span className="font-mono text-white font-semibold">
                      ₹{currentSession?.subtotal ?? priceSummary.seatSubtotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <span>Convenience Fee</span>
                      <span className="text-[10px] text-[#64748B]">
                        (₹35 × {selectedSeatNumbers.length})
                      </span>
                    </span>
                    <span className="font-mono text-white">
                      ₹{currentSession?.convenienceFee ?? priceSummary.convenienceFeeTotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Integrated GST (18%)</span>
                    <span className="font-mono text-white">
                      ₹{currentSession?.tax ?? priceSummary.gstTaxTotal}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-[#1E293B] pt-3 text-base font-bold text-white">
                    <span>Grand Total</span>
                    <span className="font-mono text-xl font-black text-[#FBBF24]">
                      ₹{currentSession?.grandTotal ?? priceSummary.grandTotal}
                    </span>
                  </div>
                </div>
              )}

              {/* Proceed Action Button */}
              <div className="space-y-2 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={selectedSeatNumbers.length === 0 || isSessionLoading}
                  onClick={openReviewModal}
                  className="w-full font-bold shadow-xl shadow-amber-400/20 text-sm gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  <span>
                    Proceed to Reserve ({selectedSeatNumbers.length}{" "}
                    {selectedSeatNumbers.length === 1 ? "Seat" : "Seats"})
                  </span>
                </Button>

                <p className="text-[10px] text-center text-[#64748B]">
                  Temporary seat lock holds your reservation for 10 minutes. Confirmed Booking ID is issued strictly after payment confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PRE-PAYMENT BOOKING REVIEW MODAL (PHASE 2 PART 11) */}
      <BookingReviewModal />

      {/* 6. EXPIRATION CONCURRENCY MODAL */}
      <BookingSessionExpiredModal onRestart={() => initSession(showId)} />
    </div>
  );
}
