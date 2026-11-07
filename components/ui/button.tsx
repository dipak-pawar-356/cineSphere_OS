import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5 font-semibold",
      icon: "h-9 w-9 p-0",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 font-semibold border border-amber-300/40",
      gold: "bg-amber-400 text-black hover:bg-amber-300 font-semibold shadow-md shadow-amber-500/20",
      secondary:
        "bg-[#111827] text-white hover:bg-[#1f2937] border border-white/10 hover:border-white/20 shadow-sm",
      outline:
        "bg-transparent text-[#F9FAFB] hover:bg-white/5 border border-white/15 hover:border-amber-400/40",
      ghost: "bg-transparent text-[#9CA3AF] hover:text-white hover:bg-white/5",
      danger:
        "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
