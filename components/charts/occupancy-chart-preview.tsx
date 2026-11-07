"use client";

import React from "react";
import { Gauge, Users, Sparkles } from "lucide-react";

export function OccupancyChartPreview() {
  const formats = [
    { name: "IMAX Laser", occupancy: 94.2, color: "bg-amber-400" },
    { name: "4DX Motion", occupancy: 88.5, color: "bg-purple-500" },
    { name: "Dolby Cinema", occupancy: 91.0, color: "bg-blue-500" },
    { name: "ScreenX 270°", occupancy: 82.4, color: "bg-emerald-500" },
    { name: "Standard 2D", occupancy: 73.6, color: "bg-zinc-400" },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#161F2E]/90 border border-white/5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Seat Utilization
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Screen Format Fill Rate
            </h3>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Gauge className="h-5 w-5" />
          </div>
        </div>

        <p className="text-xs text-[#9CA3AF] mb-5">
          Real-time prime time occupancy averaged across 650+ connected screens.
        </p>

        <div className="space-y-4">
          {formats.map((fmt) => (
            <div key={fmt.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-white">{fmt.name}</span>
                <span className="font-bold text-white">{fmt.occupancy}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden">
                <div
                  style={{ width: `${fmt.occupancy}%` }}
                  className={`h-full rounded-full ${fmt.color} transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>AI Dynamic Pricing Active</span>
        </div>
        <span className="font-semibold text-white">Avg 86.4%</span>
      </div>
    </div>
  );
}
