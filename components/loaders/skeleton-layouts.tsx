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

export function SectionPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6 rounded-2xl bg-[#161F2E] border border-[#2A3445]", className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}

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
