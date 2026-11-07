"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/utils";

export interface CounterProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: number) => void;
  className?: string;
}

/**
 * Enterprise Numeric Stepper / Ticket Counter
 */
export function Counter({
  value: controlledVal,
  min = 1,
  max = 10,
  step = 1,
  onChange,
  className,
}: CounterProps) {
  const [internalVal, setInternalVal] = useState(min);
  const val = controlledVal !== undefined ? controlledVal : internalVal;

  const handleDecrement = () => {
    const next = Math.max(val - step, min);
    setInternalVal(next);
    onChange?.(next);
  };

  const handleIncrement = () => {
    const next = Math.min(val + step, max);
    setInternalVal(next);
    onChange?.(next);
  };

  return (
    <div className={cn("inline-flex items-center gap-2 p-1 rounded-xl bg-[#111827] border border-[#2A3445]", className)}>
      <button
        type="button"
        disabled={val <= min}
        onClick={handleDecrement}
        className="h-8 w-8 rounded-lg bg-[#161F2E] text-[#CBD5E1] hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
        aria-label="Decrease ticket count"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="w-8 text-center font-mono font-bold text-sm text-white select-none">
        {val}
      </span>

      <button
        type="button"
        disabled={val >= max}
        onClick={handleIncrement}
        className="h-8 w-8 rounded-lg bg-[#161F2E] text-[#CBD5E1] hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors"
        aria-label="Increase ticket count"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

