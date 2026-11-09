import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShowBookingLoading() {
  return (
    <div className="min-h-screen bg-[#070B12] text-white pb-24 space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="bg-[#0B1220] border-b border-[#1E293B] py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="h-4 w-64 bg-[#1E293B] rounded" />
          <div className="h-4 w-32 bg-[#1E293B] rounded" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="bg-[#0B1220]/90 border-b border-[#1E293B] py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="flex gap-4">
            <div className="h-28 w-20 bg-[#1E293B] rounded-xl shrink-0" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-[#1E293B] rounded" />
              <div className="h-8 w-60 bg-[#1E293B] rounded" />
              <div className="h-4 w-48 bg-[#1E293B] rounded" />
            </div>
          </div>
          <div className="h-16 w-80 bg-[#1E293B] rounded-xl" />
        </div>
      </div>

      {/* Workspace Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Seating Grid (8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#0B1220]/70 border border-[#1E293B] space-y-8">
          <div className="h-10 w-full bg-[#1E293B] rounded-2xl" />
          <div className="h-6 w-96 mx-auto bg-[#1E293B] rounded-t-full" />

          {/* Section Skeletons */}
          {[1, 2, 3].map((sec) => (
            <div key={sec} className="p-4 rounded-2xl bg-[#070B12] border border-[#1E293B] space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-[#1E293B] rounded" />
                <div className="h-5 w-20 bg-[#1E293B] rounded" />
              </div>
              <div className="grid grid-cols-10 gap-2 py-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="h-8 w-8 bg-[#1E293B] rounded mx-auto" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0B1220] border border-[#1E293B] space-y-6">
          <div className="flex gap-4">
            <div className="h-20 w-14 bg-[#1E293B] rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-[#1E293B] rounded" />
              <div className="h-5 w-36 bg-[#1E293B] rounded" />
              <div className="h-3 w-28 bg-[#1E293B] rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-[#1E293B] rounded-xl" />
          <div className="h-32 w-full bg-[#1E293B] rounded-xl" />
          <div className="h-12 w-full bg-amber-400/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
