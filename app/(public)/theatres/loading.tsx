import React from "react";

export default function TheatresLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-40 bg-[#1E293B] rounded" />
        <div className="h-8 w-72 bg-[#1E293B] rounded" />
        <div className="h-4 w-96 bg-[#1E293B] rounded" />
      </div>

      {/* City Context Bar */}
      <div className="h-16 w-full bg-[#111827] rounded-2xl border border-[#2A3445]" />

      {/* Filter Bar */}
      <div className="h-20 w-full bg-[#111827] rounded-2xl border border-[#2A3445]" />

      {/* Theatres Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#161F2E] border border-white/5 overflow-hidden space-y-4 pb-4"
          >
            <div className="h-44 bg-[#070B12]" />
            <div className="px-5 space-y-2">
              <div className="h-5 w-48 bg-[#1E293B] rounded" />
              <div className="h-3 w-64 bg-[#1E293B] rounded" />
              <div className="h-4 w-32 bg-[#1E293B] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
