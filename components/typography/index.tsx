import React from "react";
import { cn } from "@/utils";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

// 1. DISPLAY (Hero / Cinematic luxury display)
export function Display({
  as: Component = "h1",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// 2. HEADING (Standard h1-h3)
export function Heading({
  as: Component = "h2",
  className,
  children,
  ...props
}: TypographyProps & { level?: 1 | 2 | 3 | 4 }) {
  return (
    <Component
      className={cn("font-extrabold text-white tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 3. SUBHEADING
export function SubHeading({
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-sm sm:text-base text-[#94A3B8] leading-relaxed", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 4. TITLE
export function Title({
  as: Component = "h3",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-base sm:text-lg font-bold text-white tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 5. SECTION TITLE
export function SectionTitle({
  as: Component = "h2",
  accent = true,
  className,
  children,
  ...props
}: TypographyProps & { accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {accent && <span className="h-4 w-1 rounded-full bg-[#FBBF24]" />}
      <Component
        className={cn("text-lg sm:text-xl font-bold text-white tracking-tight", className)}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}

// 6. BODY TEXT
export function Body({
  as: Component = "p",
  size = "md",
  className,
  children,
  ...props
}: TypographyProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "text-xs leading-normal",
    md: "text-sm leading-relaxed",
    lg: "text-base leading-relaxed",
  }[size];

  return (
    <Component className={cn("text-[#CBD5E1]", sizeClass, className)} {...props}>
      {children}
    </Component>
  );
}

// 7. CAPTION
export function Caption({
  as: Component = "span",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-[11px] text-[#94A3B8] leading-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 8. LABEL
export function Label({
  as: Component = "label",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-xs font-semibold text-[#CBD5E1] select-none", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 9. BADGE TEXT
export function BadgeText({
  as: Component = "span",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-[10px] font-bold uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 10. BUTTON TEXT
export function ButtonText({
  as: Component = "span",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-xs sm:text-sm font-semibold select-none", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// 11. DASHBOARD NUMBERS (Formatted metrics with KaTeX or Mono)
export function DashboardNumber({
  as: Component = "div",
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Component
      className={cn("text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

