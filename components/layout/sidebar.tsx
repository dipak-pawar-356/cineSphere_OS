"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { NavSectionConfig, NavItemConfig } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface SidebarProps {
  sections: NavSectionConfig[];
  roleName?: string;
  roleBadge?: string;
  workspaceName?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function Sidebar({
  sections,
  roleName = "Super Admin",
  roleBadge = "HQ",
  workspaceName = "CineSphere Circuit HQ",
  collapsed: controlledCollapsed,
  onToggleCollapse,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Core Overview": true,
    "Catalog & Programming": true,
    "User Management": true,
    "Financials & Intelligence": true,
    "System & Control": true,
    "Theatre Control": true,
    "Daily Operations": true,
    "Management & Staff": true,
  });

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      aria-label="Enterprise Sidebar Navigation"
      className={cn(
        "relative flex flex-col justify-between shrink-0 bg-[#0B1220] border-r border-[#2A3445] transition-all duration-300 ease-in-out select-none z-30",
        isCollapsed ? "w-20" : "w-64 sm:w-72",
        className
      )}
    >
      {/* Workspace / Role Banner */}
      <div className="p-4 border-b border-[#2A3445]/80 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center text-[#070B12] font-black text-sm shrink-0 shadow-md shadow-[#FBBF24]/20">
              CS
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                <span className="truncate">{workspaceName}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              </div>
              <div className="text-[10px] text-[#94A3B8] font-mono flex items-center gap-1.5">
                <span>{roleName}</span>
                <span className="px-1 py-0.2 rounded bg-[#161F2E] text-[#FBBF24] border border-[#2A3445]">
                  {roleBadge}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-9 w-9 rounded-xl bg-[#FBBF24] flex items-center justify-center text-[#070B12] font-black text-sm">
            CS
          </div>
        )}

        {/* Mini Sidebar Collapse Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className={cn(
            "h-7 w-7 rounded-lg bg-[#111827] border border-[#2A3445] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#FBBF24]/50 transition-colors shrink-0",
            isCollapsed && "mx-auto mt-2"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Groups Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#2A3445]">
        {sections.map((section, idx) => {
          const isSectionOpen = section.title ? expandedSections[section.title] !== false : true;

          return (
            <div key={idx} className="space-y-1">
              {section.title && !isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.title!)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B] hover:text-[#CBD5E1] transition-colors"
                >
                  <span>{section.title}</span>
                  {isSectionOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {isSectionOpen && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 outline-none focus:ring-1 focus:ring-[#FBBF24]",
                          isActive
                            ? "bg-[#161F2E] text-white border border-[#2A3445] shadow-lg shadow-black/20"
                            : "text-[#94A3B8] hover:text-[#F9FAFB] hover:bg-[#111827]/70",
                          isCollapsed && "justify-center px-0 py-3"
                        )}
                      >
                        {/* Golden Active Indicator Stripe */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#FBBF24]" />
                        )}

                        {Icon && (
                          <span
                            className={cn(
                              "shrink-0 transition-colors",
                              isActive
                                ? "text-[#FBBF24]"
                                : "text-[#64748B] group-hover:text-[#CBD5E1]"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                        )}

                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">{item.label}</span>

                            {item.badge && (
                              <Badge
                                variant={item.badgeVariant || "secondary"}
                                size="sm"
                                className="shrink-0"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer System Telemetry Status */}
      <div className="p-3 border-t border-[#2A3445]/80 bg-[#070B12]/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#111827] border border-[#2A3445] text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-[10px]">
                <div className="font-bold text-white leading-none">Circuit Online</div>
                <div className="text-[#64748B] leading-tight font-mono mt-0.5">Latency 24ms</div>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="text-[#94A3B8] hover:text-[#FBBF24] transition-colors p-1"
              aria-label="Settings"
            >
              <Zap className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span
              className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"
              title="Circuit Operational (24ms)"
            />
          </div>
        )}
      </div>
    </aside>
  );
}

