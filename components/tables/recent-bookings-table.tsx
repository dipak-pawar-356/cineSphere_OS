import React from "react";
import { RECENT_BOOKINGS } from "@/lib/constants/dashboard-stats";
import { StatusBadge } from "@/components/badges/status-badge";
import { Ticket, ArrowUpRight } from "lucide-react";

export function RecentBookingsTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#161F2E]/90 border border-white/5 shadow-xl">
      <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Ticket className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Latest Live Bookings</h3>
            <p className="text-xs text-[#9CA3AF]">
              Real-time feed of omnichannel ticket reservations
            </p>
          </div>
        </div>

        <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
          Live Feed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#111827]/70 text-[#9CA3AF] uppercase font-semibold text-[10px] tracking-wider border-b border-white/5">
            <tr>
              <th className="py-3 px-5">Ref #</th>
              <th className="py-3 px-5">Movie Title</th>
              <th className="py-3 px-5">Venue & Screen</th>
              <th className="py-3 px-5">Seats</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Time</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#9CA3AF]">
            {RECENT_BOOKINGS.map((b) => (
              <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5 font-mono font-medium text-white">
                  {b.bookingRef}
                </td>
                <td className="py-3.5 px-5 font-semibold text-white">
                  {b.movieTitle}
                </td>
                <td className="py-3.5 px-5">
                  <div className="text-white/90">{b.theatreName}</div>
                  <div className="text-[11px] text-[#9CA3AF]/70">{b.screens}</div>
                </td>
                <td className="py-3.5 px-5 font-mono text-white/90">{b.seats}</td>
                <td className="py-3.5 px-5 font-bold text-amber-400">{b.amount}</td>
                <td className="py-3.5 px-5 text-[#9CA3AF]">{b.timestamp}</td>
                <td className="py-3.5 px-5 text-right">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
