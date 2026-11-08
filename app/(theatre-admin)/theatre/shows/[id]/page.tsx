"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheatreStore, ManagedShow } from "@/store/theatre-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Ticket,
  CheckCircle2,
  Users,
  Tv,
  Volume2,
  DollarSign,
  Film,
  Building2,
  Layers,
  Sparkles,
  Copy,
  Edit,
  XCircle,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ProgramShowModal } from "@/components/shows/program-show-modal";

export default function TheatreShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { profile, shows, halls, movies, cancelShow, duplicateShow } = useTheatreStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const show = shows.find((s) => s.id === resolvedParams.id) || shows[0];
  const hall = halls.find((h) => h.id === show?.hallId) || halls[0];
  const movie = movies.find((m) => m.id === show?.movieId) || movies[0];

  if (!show) {
    return (
      <div className="p-12 text-center text-[#94A3B8]">
        <Film className="h-10 w-10 mx-auto text-amber-400 mb-3 opacity-50" />
        <h3 className="text-base font-bold text-white">Showtime Event Not Found</h3>
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="outline" size="sm" className="mt-4 border-[#2A3445]">
            Back to Showtime Roster
          </Button>
        </Link>
      </div>
    );
  }

  const fillRate =
    show.totalSeats > 0 ? Math.round((show.seatsBooked / show.totalSeats) * 100) : 0;
  const availableSeats = show.seatsAvailable ?? Math.max(0, show.totalSeats - show.seatsBooked);

  const handleCancel = () => {
    if (confirm(`Cancel showtime screening for "${show.movieTitle}"?`)) {
      cancelShow(show.id, "Cancelled by Theatre Admin");
      setFeedbackNotice(`Showtime for "${show.movieTitle}" has been cancelled.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleDuplicate = () => {
    const res = duplicateShow(show.id);
    if (res.success) {
      setFeedbackNotice(`Duplicated showtime slot for "${show.movieTitle}".`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } else {
      alert(res.error || "Failed to duplicate show.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Feedback */}
      {feedbackNotice && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-medium">{feedbackNotice}</span>
        </div>
      )}

      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href={ROUTES.THEATRE_ADMIN.SHOWS}>
          <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Showtime Roster
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`${show.movieTitle} — Screening Event Dispatch`}
        subtitle={`${show.hallName} • ${show.startTime} – ${show.endTime} • ${show.showCode || `SH-${show.id}`}`}
        description="Comprehensive screening event telemetry: projection pipeline status, turnaround window, section pricing profile, and real-time seat inventory availability."
        badge={show.status}
        badgeVariant={show.status === "Cancelled" ? "danger" : "success"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="gap-1.5 border-[#2A3445] text-white"
            >
              <Copy className="h-4 w-4 text-amber-400" /> Duplicate Slot
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20"
            >
              <Edit className="h-4 w-4" /> Modify Parameters
            </Button>
          </div>
        }
      />

      {/* Hero Marquee */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] bg-[#070B12] shadow-2xl">
        <div className="relative h-64 w-full">
          {show.movieBannerUrl || movie?.backdrop ? (
            <img
              src={show.movieBannerUrl || movie?.backdrop}
              alt={show.movieTitle}
              className="w-full h-full object-cover opacity-35 blur-xs scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[#111827]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/60 to-transparent" />

          {/* Floating Hero Info */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="flex items-end gap-5">
              <div className="h-36 w-24 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-[#111827] shrink-0">
                <img
                  src={show.moviePosterUrl || movie?.poster}
                  alt={show.movieTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={show.status === "Cancelled" ? "danger" : "success"} size="sm">
                    {show.status}
                  </Badge>
                  <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                    {show.format}
                  </Badge>
                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                    {show.bookingStatus || "Booking Open"}
                  </Badge>
                </div>

                <h1 className="text-2xl font-black text-white">{show.movieTitle}</h1>
                <div className="text-xs text-[#94A3B8] font-mono">
                  {show.language} • {show.durationMinutes || 150}m runtime • {show.date}
                </div>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              disabled={show.status === "Cancelled"}
              className="gap-1.5 self-start sm:self-end text-xs"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel Screening
            </Button>
          </div>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Telemetry, Turnaround, Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operational Telemetry Cards */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Screening Event Dispatch Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-mono block">Auditorium</span>
                <p className="font-bold text-white text-sm truncate">{show.hallName}</p>
                <span className="text-[10px] text-sky-400 font-mono font-medium">{show.screenType || show.format}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-mono block">Base Rate</span>
                <p className="font-bold font-mono text-emerald-400 text-sm">₹{show.ticketPrice}</p>
                <span className="text-[10px] text-[#64748B]">Starting Tariff</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-mono block">Booked Seats</span>
                <p className="font-bold font-mono text-white text-sm">{show.seatsBooked} / {show.totalSeats}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">{fillRate}% Occupied</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] space-y-1">
                <span className="text-[#64748B] text-[10px] uppercase font-mono block">Gross Yield</span>
                <p className="font-bold font-mono text-amber-400 text-sm">
                  ₹{(show.seatsBooked * show.ticketPrice).toLocaleString()}
                </p>
                <span className="text-[10px] text-[#64748B]">Box Office</span>
              </div>
            </div>
          </Card>

          {/* Turnaround Breakdown */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-sky-400" />
              Auditorium Turnaround & Buffer Math
            </h3>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-[#1E293B] space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-white">
                <span className="text-[#94A3B8]">Screening Start Time:</span>
                <span className="font-bold text-amber-400 text-sm">{show.startTime}</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-[#94A3B8]">Movie Runtime:</span>
                <span>{show.durationMinutes || 150} minutes</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-[#94A3B8]">Scheduled Intermission:</span>
                <span>{show.intermissionMinutes ?? 15} minutes</span>
              </div>
              <div className="flex justify-between items-center text-white">
                <span className="text-[#94A3B8]">Screening End Time:</span>
                <span className="font-bold text-sky-400 text-sm">{show.endTime}</span>
              </div>
              <div className="flex justify-between items-center text-[#94A3B8] pt-2 border-t border-[#1E293B]">
                <span>Cleaning & Sanitization Buffer:</span>
                <span>{show.cleaningBufferMinutes ?? 20} minutes</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400 font-bold pt-1">
                <span>Total Auditorium Occupied Window:</span>
                <span>{show.totalOccupiedMinutes || 185} minutes</span>
              </div>
            </div>
          </Card>

          {/* Pricing Profile & Section Rates */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Active Pricing Profile: {show.pricingProfileName || "Standard Tariff"}
              </h3>
              <Badge variant="outline" size="sm" className="font-mono text-amber-400 border-amber-400/30">
                Show-Scoped Rates
              </Badge>
            </div>

            {show.sectionPricing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                {Object.entries(show.sectionPricing).map(([tier, rate]) => (
                  <div
                    key={tier}
                    className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex justify-between items-center"
                  >
                    <span className="text-[#94A3B8]">{tier}:</span>
                    <span className="font-bold text-emerald-400">₹{rate}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8]">
                Standard admission rate applies across all auditorium tiers at ₹{show.ticketPrice}.
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Seat Inventory & Hall Hardware */}
        <div className="space-y-6">
          {/* Seat Inventory Card */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-400" />
              Seat Inventory Availability
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#94A3B8]">Capacity Utilization</span>
                <span className="text-emerald-400 font-bold">{fillRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1E293B] overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fillRate}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] block">TOTAL SEATS</span>
                <span className="font-bold text-white text-base">{show.totalSeats}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] block">BOOKED</span>
                <span className="font-bold text-emerald-400 text-base">{show.seatsBooked}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] block">AVAILABLE</span>
                <span className="font-bold text-sky-400 text-base">{availableSeats}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                <span className="text-[10px] text-[#64748B] block">BLOCKED</span>
                <span className="font-bold text-[#94A3B8] text-base">{show.seatsBlocked || 0}</span>
              </div>
            </div>
          </Card>

          {/* Hall Hardware Specs */}
          <Card variant="elevated" className="p-6 bg-[#0F172A] border-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] font-mono flex items-center gap-1.5">
              <Tv className="h-4 w-4 text-purple-400" />
              Auditorium Hardware Spec
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Hall Identifier:</span>
                <span className="text-white font-medium">{hall.hallCode || hall.name}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Screen Technology:</span>
                <span className="text-amber-400 font-bold">{hall.screenType}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Sound Processor:</span>
                <span className="text-white">{hall.soundSystem || "Dolby Atmos 64ch"}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Aspect Ratio:</span>
                <span className="text-white">{hall.aspectRatio || "2.39:1 Scope"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <ProgramShowModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editingShow={show}
        onSuccess={(msg) => {
          setFeedbackNotice(msg);
          setTimeout(() => setFeedbackNotice(null), 4000);
        }}
      />
    </div>
  );
}
