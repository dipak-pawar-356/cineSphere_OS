"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/utils";

export interface RatingProps {
  max?: number;
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  max = 5,
  value,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4.5 w-4.5",
    lg: "h-6 w-6",
  };

  const activeVal = hoverValue !== null ? hoverValue : value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= activeVal;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(starNumber)}
            onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={cn(
              "transition-colors",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              isFilled ? "text-[#FBBF24]" : "text-[#2A3445]"
            )}
            aria-label={`Rate ${starNumber} out of ${max}`}
          >
            <Star
              className={cn(
                starSizes[size],
                isFilled ? "fill-[#FBBF24]" : "fill-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
