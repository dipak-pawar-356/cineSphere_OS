"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils";

export interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("rounded-2xl bg-[#161F2E] border border-[#2A3445] overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-white hover:text-[#FBBF24] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#94A3B8] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#FBBF24]"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-[#CBD5E1] leading-relaxed border-t border-[#2A3445]/60 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

export const Collapse = AccordionItem;

