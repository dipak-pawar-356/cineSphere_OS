"use client";

import React, { useState, useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils";

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function Popover({
  trigger,
  children,
  align = "left",
  className,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false));

  const alignStyles = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-xl bg-[#161F2E] border border-[#2A3445] p-3 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95",
            alignStyles[align],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

