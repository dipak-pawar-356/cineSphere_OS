import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-2xl border-2 border-[#FBBF24]/30 animate-ping absolute" />
        <div className="h-14 w-14 rounded-2xl bg-[#FBBF24] flex items-center justify-center font-black text-[#070B12] text-lg shadow-xl shadow-[#FBBF24]/20 animate-pulse">
          CS
        </div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-xs font-bold text-white uppercase tracking-wider">CineSphere OS</div>
        <div className="text-[11px] text-[#94A3B8]">Synchronizing telemetry...</div>
      </div>
    </div>
  );
}

// 1. CARD SKELETON
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-3", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

// 2. MOVIE SKELETON
export function MovieSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-[#161F2E] border border-[#2A3445] overflow-hidden space-y-3 p-4", className)}>
      <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[#2A3445]">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// 3. TABLE SKELETON
export function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-[#161F2E] border border-[#2A3445] overflow-hidden p-4 space-y-3", className)}>
      <div className="flex justify-between items-center pb-2 border-b border-[#2A3445]">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
      <div className="space-y-2">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#2A3445]/40">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. SIDEBAR SKELETON
export function SidebarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-64 bg-[#0B1220] border-r border-[#2A3445] p-4 space-y-6", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// 5. CHART SKELETON
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4", className)}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

// 6. DASHBOARD SKELETON
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-2 pb-6 border-b border-[#2A3445]">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export const PageSkeleton = DashboardSkeleton;
