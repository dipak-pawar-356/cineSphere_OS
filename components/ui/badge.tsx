import React from "react";
import { cn } from "@/utils";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline"
  | "solid"
  | "soft";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  primary: "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30",
  secondary: "bg-[#1F2937] text-[#CBD5E1] border border-[#2A3445]",
  success: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30",
  warning: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30",
  danger: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30",
  info: "bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30",
  outline: "bg-transparent text-[#F9FAFB] border border-[#2A3445]",
  solid: "bg-[#FBBF24] text-[#070B12] font-bold border-transparent",
  soft: "bg-[#111827] text-[#94A3B8] border border-[#2A3445]",
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  primary: "bg-[#FBBF24]",
  secondary: "bg-[#CBD5E1]",
  success: "bg-[#22C55E]",
  warning: "bg-[#F59E0B]",
  danger: "bg-[#EF4444]",
  info: "bg-[#38BDF8]",
  outline: "bg-white",
  solid: "bg-[#070B12]",
  soft: "bg-[#94A3B8]",
};

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-0.5 text-xs gap-1.5",
  lg: "px-3 py-1 text-xs sm:text-sm gap-2",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "secondary", size = "md", dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full select-none tracking-wide",
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_COLORS[variant])} />
        )}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";
