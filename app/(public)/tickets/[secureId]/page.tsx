import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Film,
  Ticket as TicketIcon,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Printer,
  Sparkles,
  Info,
  Building,
  CreditCard,
  User,
  Hash,
} from "lucide-react";
import { getTicketBySecureId, isValidSecureId } from "@/lib/engine/ticket-engine";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrPayloadInspector } from "./qr-payload-inspector";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ secureId: string }>;
}) {
  const { secureId } = await params;
  if (!isValidSecureId(secureId)) {
    return { title: "Invalid Ticket Pass | CineSphere OS" };
  }
  const ticket = getTicketBySecureId(secureId);
  if (!ticket) {
    return { title: "Ticket Not Found | CineSphere OS" };
  }
  return {
    title: `${ticket.movieTitle} — Digital Ticket (${ticket.ticketNumber}) | CineSphere OS`,
    description: `Official digital admission pass for ${ticket.movieTitle} at ${ticket.theatreName}.`,
  };
}

export default async function PublicTicketDetailPage({
  params,
}: {
  params: Promise<{ secureId: string }>;
}) {
  const { secureId } = await params;

  // Strict URL Security Check: Rejects sequential IDs (e.g. /tickets/123) or malformed tokens
  if (!isValidSecureId(secureId)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#0D1522] border border-[#EF4444]/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[#EF4444]/15 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Invalid or Unauthorized Pass Token
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Ticket admission passes utilize high-entropy, unguessable 26-character Crockford Base32 cryptographic identifiers. Sequential ticket paths are strictly prohibited.
            </p>
          </div>
          <div className="bg-[#111C2E] border border-[#1E2E48] rounded-xl p-3 text-xs font-mono text-[#EF4444] break-all">
            Passed Token: {secureId}
          </div>
          <div className="pt-2">
            <Link href="/profile/tickets">
              <Button variant="outline" className="w-full border-[#1E2E48] text-white">
                Go to My Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ticket = getTicketBySecureId(secureId);

  if (!ticket) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#0D1522] border border-[#1E2E48] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[#FBBF24]/15 rounded-full flex items-center justify-center mx-auto text-[#FBBF24]">
            <TicketIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-wide">
              Admission Pass Not Found
            </h1>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              This digital pass does not exist or may have been revoked. Please check your customer portal for active passes.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/profile/tickets">
              <Button variant="outline" className="w-full border-[#1E2E48] text-white">
                Back to My Tickets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = ticket.status === "CANCELLED" || ticket.status === "REFUNDED";
  const isUsed = ticket.status === "USED";

  return (
    <div className="min-h-screen bg-[#070B12] text-white pb-24 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/profile/tickets"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#94A3B8] hover:text-[#FBBF24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Tickets
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Verified Admission Pass
            </span>

            {/* Future Placeholders: Download, Share, Wallet */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#1E2E48]">
              <Button
                variant="outline"
                size="xs"
                className="gap-1.5 text-xs border-[#1E2E48] text-[#94A3B8] hover:text-white"
                title="Download PDF Pass (Phase 2 Placeholder)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Download</span>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="gap-1.5 text-xs border-[#1E2E48] text-[#94A3B8] hover:text-white"
                title="Share Admission Pass (Phase 2 Placeholder)"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Share</span>
              </Button>
              <Button
                variant="outline"
                size="xs"
                className="gap-1.5 text-xs border-[#1E2E48] text-[#94A3B8] hover:text-white"
                title="Add to Apple / Google Wallet (Phase 2 Placeholder)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span className="hidden sm:inline">Add to Wallet</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Master Ticket Container */}
        <div className="relative bg-[#0D1522] border border-[#1E2E48] rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Banner / Movie Backdrop */}
          <div className="relative h-48 sm:h-64 w-full overflow-hidden">
            {ticket.movieBanner ? (
              <img
                src={ticket.movieBanner}
                alt={ticket.movieTitle}
                className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-xs"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#1E2E48] to-[#0D1522]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-[#0D1522]/60 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {ticket.format}
                  </Badge>
                  <Badge variant="secondary" size="sm">
                    {ticket.language}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {ticket.certificate}
                  </Badge>
                  {ticket.duration && (
                    <Badge variant="soft" size="sm" className="gap-1 text-[#94A3B8]">
                      <Clock className="w-3 h-3 text-[#FBBF24]" />
                      {ticket.duration}
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {ticket.movieTitle}
                </h1>
              </div>

              <div className="flex flex-wrap sm:flex-col sm:items-end gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold block sm:text-right">
                    Ticket Status
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide mt-0.5 uppercase ${
                      isCancelled
                        ? "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30"
                        : isUsed
                        ? "bg-[#64748B]/20 text-[#94A3B8] border border-[#64748B]/30"
                        : "bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/30"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {ticket.bookingStatus && (
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#111C2E] border border-[#1E2E48] text-[#38BDF8]">
                      Booking: {ticket.bookingStatus}
                    </span>
                  )}
                  {ticket.paymentStatus && (
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#111C2E] border border-[#1E2E48] text-[#10B981]">
                      Payment: {ticket.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Body: Two Column Layout */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[#1E2E48]">
            {/* Left Column: Show, Cinema & Seat Coordinates */}
            <div className="md:col-span-7 space-y-6">
              {/* Theatre & Screen Info */}
              <div className="bg-[#111C2E]/60 border border-[#1E2E48] rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24] shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {ticket.theatreName}
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {ticket.theatreAddress}, {ticket.theatreCity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E2E48]/60 text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[11px] font-semibold uppercase">
                      Auditorium
                    </span>
                    <span className="text-white font-medium mt-0.5 block">
                      {ticket.hallName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px] font-semibold uppercase">
                      Screen #
                    </span>
                    <span className="text-white font-medium mt-0.5 block">
                      Screen {ticket.screenNumber || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Show Timing Card */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111C2E]/60 border border-[#1E2E48] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold block">
                      Date
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {ticket.showDate}
                    </span>
                  </div>
                </div>

                <div className="bg-[#111C2E]/60 border border-[#1E2E48] rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold block">
                      Show Time
                    </span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {ticket.showTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allocated Seats Card */}
              <div className="bg-[#111C2E]/60 border border-[#1E2E48] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#64748B] font-bold">
                    Allocated Seats ({ticket.seatCount})
                  </span>
                  <span className="text-xs text-[#FBBF24] font-medium">
                    {ticket.sectionName}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {ticket.seatNumbers.map((seat) => (
                    <span
                      key={seat}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/30 text-white font-mono font-bold text-sm tracking-wide shadow-sm"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown & Patron Info */}
              <div className="bg-[#111C2E]/60 border border-[#1E2E48] rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold uppercase tracking-wider pb-2 border-b border-[#1E2E48]/60">
                  <span>Payment Receipt</span>
                  <span className="text-[#10B981] font-bold">PAID</span>
                </div>

                <div className="space-y-1.5 text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>Base Ticket Price</span>
                    <span className="text-white font-medium">
                      ₹{ticket.priceBreakdown.baseTicketPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span className="text-white font-medium">
                      ₹{ticket.priceBreakdown.convenienceFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & GST</span>
                    <span className="text-white font-medium">
                      ₹{ticket.priceBreakdown.taxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1E2E48]/60 text-sm font-bold text-white">
                    <span>Grand Total</span>
                    <span className="text-[#FBBF24]">
                      ₹{ticket.priceBreakdown.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1E2E48]/60 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Patron: {ticket.customerName}</span>
                  <span>{ticket.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic QR Gate Pass & Cryptographic Inspector */}
            <div className="md:col-span-5 flex flex-col items-center justify-between space-y-6 bg-[#070B12]/80 border border-[#1E2E48] rounded-2xl p-6 text-center">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#FBBF24] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Fast-Pass Gate Turnstile
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Dynamic Admission QR
                </h3>
                <p className="text-[11px] text-[#94A3B8]">
                  Hold this screen up to the usher scanner at the auditorium entrance.
                </p>
              </div>

              {/* Live QR Code Display */}
              <div className="relative p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                {isCancelled ? (
                  <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-100 rounded-xl text-[#EF4444] space-y-2">
                    <AlertTriangle className="w-12 h-12" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Pass Revoked / Cancelled
                    </span>
                  </div>
                ) : (
                  <img
                    src={ticket.qrCodeUrl}
                    alt={`QR Code for ${ticket.ticketNumber}`}
                    className="w-48 h-48 object-contain"
                  />
                )}
              </div>

              {/* Identifiers Manifest */}
              <div className="w-full space-y-2 text-left bg-[#111C2E]/60 border border-[#1E2E48] rounded-xl p-3.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Ticket #:</span>
                  <span className="text-[#FBBF24] font-bold">{ticket.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Booking Ref:</span>
                  <span className="text-white">{ticket.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Secure Token:</span>
                  <span className="text-[#38BDF8] truncate max-w-[140px]">
                    {ticket.secureId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Issued At:</span>
                  <span className="text-[#94A3B8]">{ticket.issuedAt.split("T")[0]}</span>
                </div>
              </div>

              {/* Decoded QR Payload Security Inspector */}
              <div className="w-full pt-2">
                <QrPayloadInspector ticket={ticket} />
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="bg-[#0A0F1A] border-t border-[#1E2E48] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Official Proof of Confirmed Booking • CineSphere OS Digital Ticketing</span>
            </div>
            <div className="text-[11px]">
              Gate Entry Version: {ticket.qrVersion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

