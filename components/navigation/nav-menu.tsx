"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface NavMenuItemProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  collapsed?: boolean;
}

export function NavMenuItem({
  label,
  href,
  icon,
  badge,
  badgeVariant = "secondary",
  collapsed = false,
}: NavMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 outline-none",
        isActive
          ? "bg-[#161F2E] text-white border border-[#2A3445] shadow-lg shadow-black/20"
          : "text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#111827]/70",
        collapsed && "justify-center px-0 py-3"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#FBBF24]" />
      )}

      {icon && (
        <span
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-[#FBBF24]" : "text-[#64748B] group-hover:text-[#CBD5E1]"
          )}
        >
          {icon}
        </span>
      )}

      {!collapsed && (
        <>
          <span className="truncate flex-1 text-left">{label}</span>
          {badge && (
            <Badge variant={badgeVariant} size="sm" className="shrink-0">
              {badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}

export function NavMenuSection({
  title,
  collapsed = false,
  children,
}: {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1">
      {!collapsed && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:text-[#CBD5E1] transition-colors"
        >
          <span>{title}</span>
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      )}
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
}

export const NavMenuGroup = NavMenuSection;
