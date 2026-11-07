"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  size = "md",
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
  }[size];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative flex-1 flex flex-col w-full bg-[#111827] border-[#2A3445] z-10 p-6 shadow-2xl overflow-y-auto animate-in duration-200",
          position === "right"
            ? "ml-auto border-l slide-in-from-right"
            : "mr-auto border-r slide-in-from-left",
          sizeClass,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#2A3445] pb-4">
          <div className="space-y-1">
            {title && <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-[#94A3B8]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#161F2E]"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

