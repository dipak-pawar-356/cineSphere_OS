import React from "react";
import { DASHBOARD_THEATRES } from "@/lib/constants/dashboard-stats";
import { StatusBadge } from "@/components/badges/status-badge";
import { Building2, TrendingUp } from "lucide-react";

export function RecentTheatresTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#161F2E]/90 border border-white/5 shadow-xl">
      <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Latest Connected Theatres</h3>
            <p className="text-xs text-[#9CA3AF]">
              Operational health and real-time occupancy monitoring
            </p>
          </div>
        </div>

        <span className="text-xs text-[#9CA3AF]">154 Venues</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#111827]/70 text-[#9CA3AF] uppercase font-semibold text-[10px] tracking-wider border-b border-white/5">
            <tr>
              <th className="py-3 px-5">Theatre Name</th>
              <th className="py-3 px-5">Location</th>
              <th className="py-3 px-5">Screens</th>
              <th className="py-3 px-5">Occupancy Today</th>
              <th className="py-3 px-5">Gross Revenue</th>
              <th className="py-3 px-5 text-right">System Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#9CA3AF]">
            {DASHBOARD_THEATRES.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5 font-bold text-white">
                  {t.name}
                </td>
                <td className="py-3.5 px-5">{t.location}</td>
                <td className="py-3.5 px-5 font-medium text-white">{t.screens} Screens</td>
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-[#111827] overflow-hidden">
                      <div
                        style={{ width: t.todayOccupancy }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                    <span className="font-semibold text-white">{t.todayOccupancy}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 font-bold text-amber-400">{t.revenueToday}</td>
                <td className="py-3.5 px-5 text-right">
                  <StatusBadge status={t.status as "Optimal" | "Attention"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
