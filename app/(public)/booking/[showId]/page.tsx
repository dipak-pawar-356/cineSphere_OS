"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DYNAMIC_SHOWS,
  MULTI_TENANT_THEATRES,
  LAYOUT_100_SEATS,
  LAYOUT_240_SEATS,
  LAYOUT_68_SEATS,
} from "@/data";
import { calculateBookingPrice } from "@/lib/engine";
import { ShowSeat, PricingSummary, Show, Theatre } from "@/types";
import { DUMMY_MOVIES } from "@/lib/constants/movies";
import {
  HallLayoutRenderer,
  BookingSidebar,
  SeatLegend,
} from "@/components/cinema-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  Info,
  CheckCircle2,
  QrCode,
  Building2,
  Layers,
  Calendar,
} from "lucide-react";

export default function ShowBookingPage() {
  const params = useParams();
  const router = useRouter();
  const showId = typeof params?.showId === "string" ? params.showId : "show-pun-001";

  // 1. Resolve Show
  const currentShow: Show = useMemo(() => {
    return (
      DYNAMIC_SHOWS.find((s) => s.id === showId) ||
      DYNAMIC_SHOWS[0]
    );
  }, [showId]);

  // 2. Resolve Associated Theatre
  const currentTheatre: Theatre = useMemo(() => {
    return (
      MULTI_TENANT_THEATRES.find((t) => t.id === currentShow.theatreId) ||
      MULTI_TENANT_THEATRES[0]
    );
  }, [currentShow]);

  // 3. Resolve Movie
  const currentMovie = useMemo(() => {
    return (
      DUMMY_MOVIES.find((m) => m.title === currentShow.movieTitle || m.id === currentShow.movieId) || {
        title: currentShow.movieTitle,
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
        banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
        certification: "UA 16+",
        durationMinutes: 165,
        rating: 9.2,
      }
    );
  }, [currentShow]);

  // 4. Resolve Reusable Hall Layout
  const currentLayout = useMemo(() => {
    if (currentShow.theatreId === "th-mum-001") return LAYOUT_240_SEATS;
    if (currentShow.theatreId === "th-ahd-001") return LAYOUT_68_SEATS;
    return LAYOUT_100_SEATS;
  }, [currentShow]);

  // 5. Interactive Seat Selection State
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Derive ShowSeat objects from selected numbers
  const selectedSeats: ShowSeat[] = useMemo(() => {
    const inv = currentShow.seatInventory || [];
    return inv.filter((s: ShowSeat) => selectedSeatNumbers.includes(s.seatNumber));
  }, [currentShow, selectedSeatNumbers]);

  // Real-time Pricing Summary
  const pricing: PricingSummary = useMemo(() => {
    return calculateBookingPrice(selectedSeats, {
      convenienceFeePerSeat: 35,
      gstPercent: 18,
    });
  }, [selectedSeats]);

  const handleSeatClick = (seat: ShowSeat) => {
    if (["Booked", "Blocked", "Maintenance"].includes(seat.status)) {
      return; // Non-selectable
    }

    setSelectedSeatNumbers((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((num) => num !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  const handleRemoveSeat = (seat: ShowSeat) => {
    setSelectedSeatNumbers((prev) => prev.filter((num) => num !== seat.seatNumber));
  };

  const handleClearSeats = () => {
    setSelectedSeatNumbers([]);
  };

  const handleProceedToPay = () => {
    if (selectedSeats.length > 0) {
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-white pb-20">
      {/* 1. TOP NAVIGATION & SHOW SWITCHER BAR */}
      <div className="bg-[#0B1220] border-b border-[#1E293B] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/movie/${(currentMovie as { slug?: string }).slug || "pushpa-2"}`}>
              <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-[#94A3B8]">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Movie
              </Button>
            </Link>
            <div className="h-4 w-px bg-[#1E293B] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FBBF24] uppercase tracking-wider">
                Show Selector:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {DYNAMIC_SHOWS.map((s) => {
                  const isActive = s.id === currentShow.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSeatNumbers([]);
                        router.push(`/booking/${s.id}`);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 ${
                        isActive
                          ? "bg-[#FBBF24] text-black border-[#FBBF24] font-bold shadow-sm"
                          : "bg-[#111827] text-[#94A3B8] border-[#2A3445] hover:text-white hover:border-[#38BDF8]"
                      }`}
                    >
                      {(s.theatreName || "Cinema").split(" ")[1] || "Cinema"} • {s.startTime} ({s.movieTitle.split(":")[0]})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <Building2 className="h-3.5 w-3.5 text-[#FBBF24]" />
            <span className="font-semibold text-white">{currentTheatre.name}</span>
            <span className="text-[#64748B]">({currentTheatre.city})</span>
          </div>
        </div>
      </div>

      {/* 2. SHOW INFORMATION HERO */}
      <div className="relative bg-[#0B1220]/90 border-b border-[#1E293B] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="warning" size="sm" className="font-bold">
                  {currentShow.format}
                </Badge>
                <Badge variant="outline" size="sm" className="text-[#94A3B8] border-[#2A3445]">
                  {currentShow.language}
                </Badge>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {currentShow.hallName}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  Capacity: {currentLayout.capacity} Seats ({currentLayout.sections.length} Sections)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentShow.movieTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Calendar className="h-3.5 w-3.5 text-[#FBBF24]" />
                  {currentShow.showDate}
                </span>
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Clock className="h-3.5 w-3.5 text-[#FBBF24]" />
                  {currentShow.startTime} - {currentShow.endTime}
                </span>
                <span>•</span>
                <span>Auditorium Layout: <strong className="text-white font-mono">{currentLayout.name}</strong></span>
              </div>
            </div>

            {/* Architectural Invariant Banner */}
            <div className="rounded-xl bg-[#111827] border border-[#2A3445] p-3 text-xs max-w-sm space-y-1">
              <div className="flex items-center gap-1.5 text-[#FBBF24] font-bold">
                <Layers className="h-3.5 w-3.5" />
                <span>Show-Centric Section Pricing</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                Hall layout is reusable. Prices belong exclusively to this show:
                {Object.entries(currentShow.pricing?.sectionPricing || {}).slice(0, 3).map(([sec, price]) => (
                  <span key={sec} className="ml-1 text-white font-mono font-semibold">
                    {sec.replace("sec-pun-", "").toUpperCase()}: ₹{String(price)}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: SEATING CANVAS + BOOKING SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Seating Grid (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 bg-[#0B1220]/60 rounded-3xl p-6 sm:p-8 border border-[#1E293B] shadow-2xl backdrop-blur-xl">
            {/* Double-Booking Concurrency Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Anti-Double-Booking Protection Active:</strong> Selected seats are locked for 10 minutes upon selection.
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-amber-400/20 px-2 py-0.5 rounded font-bold">
                Multi-Tenant Isolated
              </span>
            </div>

            {/* Dynamic Hall Layout Visualization */}
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[620px] mx-auto">
                <HallLayoutRenderer
                  layout={currentLayout}
                  seatInventory={currentShow.seatInventory || []}
                  selectedSeatNumbers={selectedSeatNumbers}
                  sectionPricing={currentShow.pricing?.sectionPricing || {}}
                  onSeatClick={handleSeatClick}
                  screenName={currentShow.hallName}
                />
              </div>
            </div>

            {/* Interactive Dynamic Seat Legend */}
            <div className="pt-4 border-t border-[#1E293B]">
              <SeatLegend
                sections={currentLayout.sections}
                sectionPricing={currentShow.pricing?.sectionPricing || {}}
              />
            </div>
          </div>

          {/* Booking Summary Sidebar (4 Cols) */}
          <div className="lg:col-span-4">
            <BookingSidebar
              movieTitle={currentShow.movieTitle}
              moviePoster={(currentMovie as { poster?: string }).poster}
              language={currentShow.language}
              format={currentShow.format}
              theatreName={currentTheatre.name}
              hallName={currentShow.hallName}
              showDate={currentShow.showDate}
              showTime={currentShow.startTime}
              theatreUPI={currentTheatre.upiDetails}
              selectedSeats={selectedSeats}
              pricing={pricing}
              onRemoveSeat={handleRemoveSeat}
              onClearSeats={handleClearSeats}
              onProceedToPay={handleProceedToPay}
            />
          </div>
        </div>
      </div>

      {/* 4. BOOKING SUCCESS & THEATRE UPI SETTLEMENT MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1220] border border-[#2A3445] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white">Booking Locked & Ready</h3>
              <p className="text-xs text-[#94A3B8]">
                Payment routes directly to the theatre operator via isolated tenant UPI rail.
              </p>
            </div>

            {/* Direct Payee Isolation Box */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-3 text-xs">
              <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                <span>Payee Entity</span>
                <span className="font-bold text-white">{currentTheatre.name}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                <span>UPI ID</span>
                <span className="font-mono font-bold text-[#FBBF24]">{currentTheatre.upiDetails?.upiId || "theatre@upi"}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                <span>GST Registration</span>
                <span className="font-mono text-white">{currentTheatre.gstNumber || "27AAACG0921N1Z1"}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#94A3B8] border-t border-[#1E293B] pt-2">
                <span>Selected Seats ({selectedSeats.length})</span>
                <span className="font-bold text-white">
                  {selectedSeats.map((s) => s.seatNumber).join(", ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
                <span>Grand Total</span>
                <span className="text-[#FBBF24] text-base">{pricing.formattedTotal}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-xl shadow-amber-400/20"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setSelectedSeatNumbers([]);
                  router.push("/profile/bookings");
                }}
              >
                Simulate Direct UPI Settlement
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full text-xs text-[#94A3B8] border-[#2A3445]"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Back to Seating Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
