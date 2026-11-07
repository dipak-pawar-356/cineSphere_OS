"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Enterprise Mobile Bottom Sheet Drawer
 * Slides up from the bottom on mobile/tablet viewports with touch drag pill.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#161F2E] border-t sm:border border-[#2A3445] p-6 z-10 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200",
          className
        )}
      >
        {/* Drag handle bar */}
        <div className="w-12 h-1 rounded-full bg-[#2A3445] mx-auto mb-2" />

        <div className="flex items-center justify-between border-b border-[#2A3445] pb-3">
          {title && <h3 className="font-bold text-white text-base">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

