import React from "react";

export default function MoviesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A3445]/60 pb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#1E293B] rounded" />
          <div className="h-8 w-64 bg-[#1E293B] rounded" />
          <div className="h-4 w-96 bg-[#1E293B] rounded" />
        </div>
        <div className="h-10 w-44 bg-[#1E293B] rounded-xl" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-28 bg-[#111827] rounded-xl shrink-0" />
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="h-16 w-full bg-[#111827] rounded-2xl border border-[#2A3445]" />

      {/* Movie Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#111827] border border-[#2A3445] overflow-hidden space-y-4 pb-4"
          >
            <div className="aspect-[2/3] bg-[#1E293B]" />
            <div className="px-4 space-y-2">
              <div className="h-4 w-20 bg-[#1E293B] rounded" />
              <div className="h-5 w-40 bg-[#1E293B] rounded" />
              <div className="h-3 w-28 bg-[#1E293B] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

