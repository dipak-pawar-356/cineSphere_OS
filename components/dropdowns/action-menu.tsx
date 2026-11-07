"use client";

import React, { useState } from "react";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { cn } from "@/utils";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Enterprise Row Action Context Menu
 * Three-dots dropdown menu for tables and cards.
 */
export function ActionMenu({
  items,
  orientation = "horizontal",
  className,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-[#2A3445] bg-[#111827] text-[#94A3B8] hover:text-white hover:border-[#FBBF24]/50 transition-colors"
        aria-label="More actions"
      >
        {orientation === "horizontal" ? (
          <MoreHorizontal className="h-4 w-4" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#161F2E] border border-[#2A3445] shadow-2xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in duration-100"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors",
                item.variant === "danger"
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-[#CBD5E1] hover:bg-[#111827] hover:text-white",
                item.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

