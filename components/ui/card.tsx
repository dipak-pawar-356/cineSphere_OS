import React from "react";
import { cn } from "@/utils";

export type CardVariant =
  | "basic"
  | "elevated"
  | "subtle-glass"
  | "interactive"
  | "outline";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverEffect?: boolean;
  glow?: boolean;
}

const VARIANT_MAP: Record<CardVariant, string> = {
  basic: "bg-[#161F2E] border border-[#2A3445]",
  elevated: "bg-[#161F2E] border border-[#2A3445] shadow-[0_8px_30px_rgb(0,0,0,0.35)]",
  "subtle-glass": "bg-[#161F2E]/90 backdrop-blur-md border border-[#2A3445]/80",
  interactive:
    "bg-[#161F2E] border border-[#2A3445] hover:border-[#FBBF24]/40 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer",
  outline: "bg-transparent border border-[#2A3445] hover:border-[#3B485E]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "basic", hoverEffect = false, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl text-[#F9FAFB] overflow-hidden",
          VARIANT_MAP[variant],
          hoverEffect && "hover:border-[#FBBF24]/40 hover:-translate-y-0.5 transition-all duration-200",
          glow && "border-[#FBBF24]/30 shadow-[0_0_25px_rgba(251,191,36,0.1)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-3 flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-bold text-lg text-white tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[#94A3B8] leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export const HoverCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return <Card ref={ref} variant="interactive" hoverEffect className={className} {...props} />;
  }
);

HoverCard.displayName = "HoverCard";
