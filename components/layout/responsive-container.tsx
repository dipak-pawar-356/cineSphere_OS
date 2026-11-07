import React from "react";
import { cn } from "@/utils";

export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * 1. Fluid Container — Expands to full screen width with luxury horizontal padding.
 */
export function FluidContainer({
  children,
  className,
  as: Component = "div",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("w-full px-4 sm:px-6 md:px-8 lg:px-12", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 2. Fixed Container — Centered container capped at standard max-w-7xl with adaptive margins.
 */
export function FixedContainer({
  children,
  className,
  as: Component = "div",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 3. Wide Container — Ultra-wide layout container capped at 1920px (max-w-[1920px]) for cinema dashboards.
 */
export function WideContainer({
  children,
  className,
  as: Component = "div",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 4. Dashboard Container — Specialized for SaaS operations consoles with sticky scroll area support.
 */
export function DashboardContainer({
  children,
  className,
  as: Component = "div",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 5. Page Container — Default top-level wrapper for public marketing and discovery routes.
 */
export function PageContainer({
  children,
  className,
  as: Component = "div",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * 6. Section Container — Spaced vertical block with responsive padding-y.
 */
export function SectionContainer({
  children,
  className,
  as: Component = "section",
  ...props
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn("py-8 sm:py-12 md:py-16 lg:py-20", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
