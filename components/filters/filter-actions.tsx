"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { cn } from "@/utils";

export interface FilterActionsProps {
  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  isApplied?: boolean;
  className?: string;
}

/**
 * Enterprise Filter Actions (Apply / Reset Controls)
 */
export function FilterActions({
  onApply,
  onReset,
  applyLabel = "Apply Filters",
  resetLabel = "Reset All",
  isApplied = false,
  className,
}: FilterActionsProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        iconLeft={<RotateCcw className="h-3.5 w-3.5 text-[#94A3B8]" />}
        className="text-xs text-[#94A3B8]"
      >
        <span>{resetLabel}</span>
      </Button>

      <Button
        variant="primary"
        size="sm"
        onClick={onApply}
        iconLeft={<Check className="h-3.5 w-3.5" />}
        className="text-xs font-bold"
      >
        <span>{applyLabel}</span>
      </Button>
    </div>
  );
}

