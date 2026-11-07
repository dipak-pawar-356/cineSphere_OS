import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { FileText, CheckCircle2, AlertTriangle, Scale } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        title="Terms and Conditions of Service"
        subtitle="Effective Date: November 2026 • Platform Terms"
        description="These Terms of Service govern the use of the CineSphere OS platform by cinema patrons, theatre operators, and administrative staff across connected venues."
        badge="Legal & Trust"
        badgeVariant="primary"
      />

      <div className="space-y-6 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#FBBF24]" />
            1. Ticketing & Seat Reservation Policy
          </h3>
          <p>
            Digital reservations made via CineSphere OS represent a legally binding license to access the specified auditorium showtime. Seats reserved via the platform remain guaranteed until the scheduled showtime end.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            2. Cancellation & Refund Guidelines
          </h3>
          <p>
            Ticket cancellations requested up to two hours prior to the programmed show start time are eligible for full credit refund to the patron&apos;s CineSphere wallet or original payment method, subject to individual theatre exhibitor terms.
          </p>
        </section>

        <section className="p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            3. Prohibited Conduct & Hardware Integrity
          </h3>
          <p>
            Users and exhibitors may not attempt to reverse engineer, disrupt API endpoints, or tamper with POS scanner cryptographic payloads. Any unauthorized scanning or spoofing will result in immediate tenant revocation.
          </p>
        </section>
      </div>
    </div>
  );
}
