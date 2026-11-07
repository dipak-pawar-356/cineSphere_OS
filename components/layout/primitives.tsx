import React from "react";
import { cn } from "@/utils";

// 1. CONTAINER
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({ size = "xl", className, children, ...props }: ContainerProps) {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }[size];

  return (
    <div className={cn("w-full mx-auto px-4 sm:px-6 lg:px-8", sizeStyles, className)} {...props}>
      {children}
    </div>
  );
}

// 2. SECTION
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "surface" | "card" | "gradient";
}

export function Section({ variant = "default", className, children, ...props }: SectionProps) {
  const bgStyles = {
    default: "bg-[#070B12]",
    surface: "bg-[#111827]",
    card: "bg-[#161F2E]",
    gradient: "bg-gradient-to-b from-[#111827] to-[#070B12]",
  }[variant];

  return (
    <section className={cn("py-12 sm:py-16 border-b border-[#2A3445]/40", bgStyles, className)} {...props}>
      {children}
    </section>
  );
}

// 3. GRID
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
}

export function Grid({ cols = 3, gap = "md", className, children, ...props }: GridProps) {
  const colsStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
  }[cols];

  const gapStyles = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
    xl: "gap-8 sm:gap-10",
  }[gap];

  return (
    <div className={cn("grid", colsStyles, gapStyles, className)} {...props}>
      {children}
    </div>
  );
}

// 4. STACK (Flex column or row)
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

export function Stack({
  direction = "col",
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
  children,
  ...props
}: StackProps) {
  const gapStyles = {
    xs: "gap-1.5",
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  const alignStyles = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const justifyStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }[justify];

  return (
    <div
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapStyles,
        alignStyles,
        justifyStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// 5. DIVIDER
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Divider({ label, className, ...props }: DividerProps) {
  if (label) {
    return (
      <div className={cn("relative flex items-center justify-center my-4", className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2A3445]" />
        </div>
        <span className="relative px-3 bg-[#070B12] text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          {label}
        </span>
      </div>
    );
  }

  return <div className={cn("w-full border-t border-[#2A3445] my-4", className)} {...props} />;
}

// 6. SPACER
export function Spacer({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" | "xl" }) {
  const sizeMap = {
    xs: "h-2 w-2",
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }[size];

  return <div className={sizeMap} aria-hidden="true" />;
}

// 7. RESPONSIVE WRAPPER
export function ResponsiveWrapper({
  desktop,
  mobile,
  className,
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="hidden lg:block">{desktop}</div>
      <div className="lg:hidden">{mobile}</div>
    </div>
  );
}

// 8. SECTION HEADER
export function SectionHeader({
  title,
  subtitle,
  badge,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#2A3445]/60", className)}>
      <div className="space-y-1">
        {badge && (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30">
            {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-[#94A3B8]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

