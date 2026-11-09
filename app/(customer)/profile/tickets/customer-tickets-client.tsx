"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  DigitalTicket,
  TicketFilterParams,
  TicketStatus,
  TicketTimeFilter,
} from "@/types/ticket.types";
import {
  Ticket as TicketIcon,
  QrCode,
  Calendar,
  Clock,
  Building,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Download,
  Share2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerTicketsClientProps {
  initialTickets: DigitalTicket[];
  customerId: string;
}

export function CustomerTicketsClient({
  initialTickets,
  customerId,
}: CustomerTicketsClientProps) {
  const [tickets, setTickets] = useState<DigitalTicket[]>(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TicketTimeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [theatreFilter, setTheatreFilter] = useState<string>("ALL");
  const [previewTicket, setPreviewTicket] = useState<DigitalTicket | null>(null);

  // Extract distinct theatres for filter dropdown
  const uniqueTheatres = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => map.set(t.theatreId, t.theatreName));
    return Array.from(map.entries());
  }, [tickets]);

  // Dynamic filter application
  const filteredTickets = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return tickets.filter((t) => {
      // Time filter
      if (timeFilter === "UPCOMING") {
        if (t.showDate < todayStr || t.status === "CANCELLED" || t.status === "REFUNDED") {
          return false;
        }
      } else if (timeFilter === "PAST") {
        if (t.showDate >= todayStr && t.status !== "USED" && t.status !== "EXPIRED") {
          return false;
        }
      } else if (timeFilter === "TODAY") {
        if (t.showDate !== todayStr) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }

      // Theatre filter
      if (theatreFilter !== "ALL" && t.theatreId !== theatreFilter) {
        return false;
      }

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.movieTitle.toLowerCase().includes(q);
        const matchTheatre = t.theatreName.toLowerCase().includes(q);
        const matchTicket = t.ticketNumber.toLowerCase().includes(q);
        const matchBooking = t.bookingReference.toLowerCase().includes(q);
        const matchSeat = t.seatNumber.toLowerCase().includes(q);
        if (!matchTitle && !matchTheatre && !matchTicket && !matchBooking && !matchSeat) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, timeFilter, statusFilter, theatreFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="bg-[#0D1522] border border-[#1E2E48] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movie, theatre, ticket # (TK-...), booking # (BK-...), or seat..."
              className="w-full bg-[#111C2E] border border-[#1E2E48] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#FBBF24] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Theatre Filter */}
          <select
            value={theatreFilter}
            onChange={(e) => setTheatreFilter(e.target.value)}
            className="bg-[#111C2E] border border-[#1E2E48] text-[#94A3B8] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FBBF24]"
          >
            <option value="ALL">All Theatres</option>
            {uniqueTheatres.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2E48]/60">
          <div className="flex flex-wrap items-center gap-1.5">
            {(["ALL", "UPCOMING", "TODAY", "PAST"] as TicketTimeFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  timeFilter === tab
                    ? "bg-[#FBBF24] text-[#070B12] shadow-sm"
                    : "bg-[#111C2E] text-[#94A3B8] hover:text-white hover:bg-[#1E2E48]"
                }`}
              >
                {tab === "ALL" && "All Passes"}
                {tab === "UPCOMING" && "Upcoming Shows"}
                {tab === "TODAY" && "Today's Shows"}
                {tab === "PAST" && "Past & Used"}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111C2E] border border-[#1E2E48] text-[#94A3B8] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FBBF24]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="USED">USED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List View */}
      {filteredTickets.length === 0 ? (
        <div className="bg-[#0D1522] border border-[#1E2E48] rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-[#111C2E] rounded-full flex items-center justify-center mx-auto text-[#64748B]">
            <TicketIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Tickets Found</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              No digital tickets matched your selected filters or search query.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setTimeFilter("ALL");
              setStatusFilter("ALL");
              setTheatreFilter("ALL");
            }}
            className="border-[#1E2E48] text-xs text-white"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const isCancelled =
              ticket.status === "CANCELLED" || ticket.status === "REFUNDED";
            const isUsed = ticket.status === "USED";

            return (
              <div
                key={ticket.id}
                className="bg-[#0D1522] border border-[#1E2E48] hover:border-[#FBBF24]/50 rounded-2xl p-5 transition-all duration-200 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
              >
                {/* Left: Movie Thumbnail & Key Information */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden bg-[#111C2E] shrink-0 border border-[#1E2E48]">
                    {ticket.moviePoster ? (
                      <img
                        src={ticket.moviePoster}
                        alt={ticket.movieTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                        <TicketIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="primary" size="sm">
                        {ticket.format}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {ticket.language}
                      </Badge>
                      {ticket.duration && (
                        <span className="text-[10px] text-[#94A3B8] flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#111C2E]">
                          <Clock className="w-3 h-3 text-[#FBBF24]" /> {ticket.duration}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCancelled
                            ? "bg-[#EF4444]/20 text-[#EF4444]"
                            : isUsed
                            ? "bg-[#64748B]/20 text-[#94A3B8]"
                            : "bg-[#10B981]/20 text-[#10B981]"
                        }`}
                      >
                        {ticket.status}
                      </span>
                      {ticket.paymentStatus && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#111C2E] border border-[#1E2E48] text-[#10B981]">
                          {ticket.paymentStatus}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {ticket.movieTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1.5 text-white font-medium">
                        <Building className="w-3.5 h-3.5 text-[#FBBF24]" />
                        {ticket.theatreName}
                      </span>
                      <span>•</span>
                      <span>{ticket.hallName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1 text-[#38BDF8]">
                        <Calendar className="w-3.5 h-3.5" />
                        {ticket.showDate}
                      </span>
                      <span className="flex items-center gap-1 text-[#FBBF24]">
                        <Clock className="w-3.5 h-3.5" />
                        {ticket.showTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Seat Pills & Price */}
                <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start lg:items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1E2E48]/60">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#64748B] uppercase font-semibold block">
                      Seats ({ticket.seatCount})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.seatNumbers.map((seat) => (
                        <span
                          key={seat}
                          className="px-2.5 py-1 rounded-md bg-[#111C2E] border border-[#1E2E48] text-white font-mono text-xs font-bold"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#64748B] uppercase font-semibold block">
                      Total Paid
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      ₹{ticket.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right: QR Preview & Detail Link */}
                <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1E2E48]/60 justify-end">
                  {/* Dynamic QR Thumbnail */}
                  <button
                    onClick={() => setPreviewTicket(ticket)}
                    className="p-2 bg-white rounded-xl shadow-md hover:scale-105 transition-transform"
                    title="Click to expand QR Code"
                  >
                    <img
                      src={ticket.qrCodeUrl}
                      alt="QR Preview"
                      className="w-12 h-12 object-contain"
                    />
                  </button>

                  <Link href={`/tickets/${ticket.secureId}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-2 text-xs font-bold px-4 shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Pass
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Quick Preview Modal */}
      {previewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#0D1522] border border-[#1E2E48] rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <button
              onClick={() => setPreviewTicket(null)}
              className="absolute right-4 top-4 text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1E2E48] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#FBBF24] uppercase tracking-wider">
                Auditorium Admission Pass
              </span>
              <h3 className="text-lg font-bold text-white">
                {previewTicket.movieTitle}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {previewTicket.theatreName} • {previewTicket.hallName}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-xl">
              <img
                src={previewTicket.qrCodeUrl}
                alt="QR Pass"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-[#111C2E] border border-[#1E2E48] rounded-xl p-3 text-xs font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Ticket ID:</span>
                <span className="text-[#FBBF24] font-bold">{previewTicket.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Booking ID:</span>
                <span className="text-white">{previewTicket.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment:</span>
                <span className="text-[#10B981] font-semibold">{previewTicket.paymentStatus || "PAID"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Booking Status:</span>
                <span className="text-[#38BDF8]">{previewTicket.bookingStatus || "CONFIRMED"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Seats:</span>
                <span className="text-white font-bold">{previewTicket.seatNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Show:</span>
                <span className="text-[#38BDF8]">
                  {previewTicket.showDate} at {previewTicket.showTime}
                </span>
              </div>
            </div>

            {/* Future Placeholders */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-[#94A3B8]">
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#111C2E] border border-[#1E2E48] hover:text-white flex flex-col items-center gap-1 transition-colors"
                title="Download PDF Pass (Phase 2 Placeholder)"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#111C2E] border border-[#1E2E48] hover:text-white flex flex-col items-center gap-1 transition-colors"
                title="Share Admission Pass (Phase 2 Placeholder)"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#111C2E] border border-[#1E2E48] hover:text-[#FBBF24] flex flex-col items-center gap-1 transition-colors"
                title="Add to Apple / Google Wallet (Phase 2 Placeholder)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" /> Wallet
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTicket(null)}
                className="w-full border-[#1E2E48] text-white text-xs"
              >
                Close
              </Button>
              <Link href={`/tickets/${previewTicket.secureId}`} className="w-full">
                <Button variant="primary" size="sm" className="w-full text-xs">
                  Full Pass Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

