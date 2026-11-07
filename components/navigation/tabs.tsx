"use client";

import React from "react";
import { cn } from "@/utils";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline" | "enclosed";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  className,
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div className={cn("flex items-center gap-6 border-b border-[#2A3445]", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer",
                isActive ? "text-[#FBBF24]" : "text-[#94A3B8] hover:text-[#F9FAFB]"
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#111827] text-white border border-[#2A3445]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#FBBF24] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Pill variant
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[#111827] border border-[#2A3445]",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
              isActive
                ? "bg-[#FBBF24] text-[#070B12] shadow-sm font-bold"
                : "text-[#94A3B8] hover:text-white"
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded text-[10px]",
                  isActive ? "bg-black/20 text-black font-bold" : "bg-[#161F2E] text-[#94A3B8]"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
