"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/utils";

export interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-1 mb-6", className)}>
      {label && (
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]/60">
          {label}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export interface SidebarItemProps {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarItem({
  label,
  href,
  icon,
  badge,
  isActive = false,
  onClick,
  className,
}: SidebarItemProps) {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all select-none cursor-pointer",
        isActive
          ? "bg-[#FBBF24] text-[#070B12] font-bold shadow-sm"
          : "text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#161F2E]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className={cn(isActive ? "text-[#070B12]" : "text-[#94A3B8]")}>{icon}</span>}
        <span>{label}</span>
      </div>

      {badge && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.2 rounded",
            isActive ? "bg-black/20 text-black" : "bg-[#111827] text-[#FBBF24] border border-[#2A3445]"
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

