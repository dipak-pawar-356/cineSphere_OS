import React from "react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

export interface FeatureCardProps {
  title: string;
  description: string;
  tagline: string;
  iconName: string;
  badge?: string;
  metric?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  tagline,
  iconName,
  badge,
  metric,
  className,
}: FeatureCardProps) {
  // Dynamically resolve lucide icon or fallback to Sparkles
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = icons[iconName] || LucideIcons.Sparkles;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#161F2E]/80 hover:bg-[#1A2639]/90 border border-white/5 hover:border-amber-400/30 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/5",
        className
      )}
    >
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="h-12 w-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-black group-hover:scale-105 transition-all duration-300 shadow-md">
            <IconComponent className="h-6 w-6" />
          </div>

          {badge && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-[#9CA3AF] border border-white/10 group-hover:border-amber-400/30 group-hover:text-amber-400/90 transition-colors">
              {badge}
            </span>
          )}
        </div>

        <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400/80">
          {tagline}
        </span>
        <h3 className="mt-1 text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-xs sm:text-sm text-[#9CA3AF] leading-relaxed">
          {description}
        </p>
      </div>

      {metric && (
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#9CA3AF]">
          <span>Standard</span>
          <span className="font-semibold text-white/90 group-hover:text-amber-400 transition-colors">
            {metric}
          </span>
        </div>
      )}
    </div>
  );
}
