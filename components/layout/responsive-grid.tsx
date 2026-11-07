import React from "react";
import { cn } from "@/utils";

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

const GAP_STYLES = {
  xs: "gap-2 sm:gap-3",
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-6",
  lg: "gap-6 sm:gap-8",
  xl: "gap-8 sm:gap-10",
};

/** 1 Column Grid */
export function Grid1Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** 2 Columns Grid: 1 col on mobile, 2 on tablet/desktop */
export function Grid2Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** 3 Columns Grid: 1 col mobile, 2 col tablet, 3 col desktop */
export function Grid3Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** 4 Columns Grid: 1 col mobile, 2 col tablet, 4 col desktop */
export function Grid4Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** 5 Columns Grid: 1 col mobile, 2 col sm, 3 col lg, 5 col xl */
export function Grid5Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** 6 Columns Grid: 2 col mobile, 3 col tablet, 6 col desktop */
export function Grid6Col({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** Auto Grid: minmax auto-fill based on provided minItemWidth */
export function AutoGrid({
  children,
  className,
  minWidth = 280,
  gap = "md",
  ...props
}: ResponsiveGridProps & { minWidth?: number }) {
  return (
    <div
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${minWidth}px, 100%), 1fr))` }}
      className={cn("grid", GAP_STYLES[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Dashboard KPI Grid: Stacks cleanly on mobile (1 col), tablet (2 col), desktop (4 col) */
export function DashboardGrid({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** Movie Catalog Grid: 2 cols on mobile, 3 on tablet, 4 on desktop, 5 on wide displays */
export function MovieGrid({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
        GAP_STYLES[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card Grid: Standard responsive 3-column card list */
export function CardGrid({ children, className, gap = "md", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** Analytics Chart Grid: 2/3 primary chart + 1/3 sidebar KPI card on desktop */
export function AnalyticsGrid({ children, className, gap = "lg", ...props }: ResponsiveGridProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3", GAP_STYLES[gap], className)} {...props}>
      {children}
    </div>
  );
}

