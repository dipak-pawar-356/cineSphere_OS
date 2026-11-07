import React from "react";
import { cn } from "@/utils";
import { Spinner } from "@/components/loaders/spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "light";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  square?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#FBBF24] text-[#070B12] hover:bg-[#FACC15] active:bg-[#EAB308] font-bold border border-[#FBBF24] shadow-sm",
  secondary:
    "bg-[#111827] text-[#F9FAFB] hover:bg-[#161F2E] active:bg-[#0B1220] border border-[#2A3445] hover:border-[#3B485E]",
  outline:
    "bg-transparent text-[#F9FAFB] hover:bg-[#111827] border border-[#2A3445] hover:border-[#FBBF24]/50",
  ghost:
    "bg-transparent text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#111827] border border-transparent",
  success:
    "bg-[#22C55E]/15 text-[#22C55E] hover:bg-[#22C55E]/25 border border-[#22C55E]/30 font-semibold",
  danger:
    "bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 border border-[#EF4444]/30 font-semibold",
  warning:
    "bg-[#F59E0B]/15 text-[#F59E0B] hover:bg-[#F59E0B]/25 border border-[#F59E0B]/30 font-semibold",
  info:
    "bg-[#38BDF8]/15 text-[#38BDF8] hover:bg-[#38BDF8]/25 border border-[#38BDF8]/30 font-semibold",
  dark:
    "bg-[#0B1220] text-[#CBD5E1] hover:text-white border border-[#2A3445] hover:border-[#3B485E]",
  light:
    "bg-[#F9FAFB] text-[#070B12] hover:bg-[#E2E8F0] font-semibold border border-transparent",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-[11px] gap-1",
  sm: "h-8.5 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-xs sm:text-sm gap-2",
  lg: "h-11.5 px-5 text-sm sm:text-base gap-2.5",
  xl: "h-13 px-6 text-base font-bold gap-3",
};

const SQUARE_SIZES: Record<ButtonSize, string> = {
  xs: "h-7 w-7 p-0",
  sm: "h-8.5 w-8.5 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-11.5 w-11.5 p-0",
  xl: "h-13 w-13 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      rounded = false,
      square = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium select-none transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#070B12]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]",
          square ? SQUARE_SIZES[size] : SIZE_STYLES[size],
          VARIANT_STYLES[variant],
          rounded ? "rounded-full" : "rounded-lg",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === "xs" || size === "sm" ? "sm" : "md"} className="mr-1.5" />
        ) : (
          iconLeft && <span className="shrink-0">{iconLeft}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
