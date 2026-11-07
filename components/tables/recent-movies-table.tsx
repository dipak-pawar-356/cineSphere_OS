import React from "react";
import { DASHBOARD_MOVIES } from "@/lib/constants/dashboard-stats";
import { Film, TrendingUp } from "lucide-react";

export function RecentMoviesTable() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#161F2E]/90 border border-white/5 shadow-xl">
      <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Top Performing Releases</h3>
            <p className="text-xs text-[#9CA3AF]">
              Box office trajectory & screen allocations
            </p>
          </div>
        </div>

        <span className="text-xs text-[#9CA3AF]">42 In Rotation</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#111827]/70 text-[#9CA3AF] uppercase font-semibold text-[10px] tracking-wider border-b border-white/5">
            <tr>
              <th className="py-3 px-5">Title</th>
              <th className="py-3 px-5">Formats</th>
              <th className="py-3 px-5">Daily Showings</th>
              <th className="py-3 px-5">Avg Fill Rate</th>
              <th className="py-3 px-5">Gross Box Office</th>
              <th className="py-3 px-5 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#9CA3AF]">
            {DASHBOARD_MOVIES.map((m) => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5 font-bold text-white">
                  {m.title}
                </td>
                <td className="py-3.5 px-5 text-[11px] font-mono text-white/80">
                  {m.formats}
                </td>
                <td className="py-3.5 px-5 font-medium text-white">
                  {m.totalShowsToday} shows
                </td>
                <td className="py-3.5 px-5 font-semibold text-white">
                  {m.occupancy}
                </td>
                <td className="py-3.5 px-5 font-bold text-amber-400">
                  {m.boxOffice}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    {m.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
