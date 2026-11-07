"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/utils";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/**
 * Enterprise Copy to Clipboard Button
 * Copies coupon code, API keys, or booking references with visual check animation.
 */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-colors select-none",
        copied
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-[#111827] text-[#CBD5E1] border-[#2A3445] hover:border-[#FBBF24]/50 hover:text-white",
        className
      )}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-sans">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{label || value}</span>
        </>
      )}
    </button>
  );
}

