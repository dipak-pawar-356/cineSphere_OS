import React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  value: string;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, subtext, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative p-6 rounded-2xl bg-gradient-to-b from-[#161F2E]/80 to-[#111827]/80 border border-white/5 backdrop-blur-md shadow-lg overflow-hidden group hover:border-amber-400/20 transition-all duration-300",
        className
      )}
    >
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
          {label}
        </span>
        {icon && <span className="text-amber-400/70 group-hover:text-amber-400 transition-colors">{icon}</span>}
      </div>

      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        {value}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-[#9CA3AF] line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
