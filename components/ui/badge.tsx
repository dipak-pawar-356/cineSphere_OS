import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "success" | "danger" | "blue";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "secondary", size = "sm", children, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full select-none";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  const variantStyles = {
    primary: "bg-amber-400/10 text-amber-400 border border-amber-400/25",
    gold: "bg-amber-400 text-black font-semibold",
    secondary: "bg-white/5 text-[#9CA3AF] border border-white/10",
    outline: "bg-transparent text-white border border-white/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    danger: "bg-red-500/10 text-red-400 border border-red-500/25",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
}
