import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8",
        className
      )}
    >
      <div className={cn("flex flex-col space-y-2 max-w-2xl", alignClass[align])}>
        {badge ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {badge}
          </span>
        ) : null}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
