"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  position?: "right" | "bottom";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  className,
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        className={cn(
          "relative z-10 bg-[#111827] border-[#2A3445] shadow-[0_24px_60px_rgb(0,0,0,0.7)] p-6 overflow-y-auto flex flex-col justify-between",
          position === "right"
            ? "ml-auto h-full w-full max-w-md border-l animate-in slide-in-from-right duration-200"
            : "mt-auto w-full max-h-[85vh] border-t rounded-t-2xl animate-in slide-in-from-bottom duration-200",
          className
        )}
      >
        <div>
          <div className="flex items-start justify-between pb-4 border-b border-[#2A3445]">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              {description && <p className="text-xs text-[#94A3B8] mt-1">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161F2E] cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
