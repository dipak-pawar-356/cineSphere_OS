"use client";

import React from "react";
import { Armchair, Sparkles, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";

export interface SeatCategoryCardProps {
  categoryName: string;
  priceTag: string;
  perks: string[];
  color?: string;
  recommended?: boolean;
  className?: string;
}

/**
 * Enterprise Seat Category Tier Card
 * Used in ticket booking flow to explain VIP Recliner, Prime, and Club seating tiers.
 */
export function SeatCategoryCard({
  categoryName,
  priceTag,
  perks,
  color = "#FBBF24",
  recommended = false,
  className,
}: SeatCategoryCardProps) {
  return (
    <Card
      variant={recommended ? "elevated" : "basic"}
      className={cn(
        "p-5 space-y-3 relative",
        recommended && "border-[#FBBF24]/60 shadow-lg shadow-[#FBBF24]/5",
        className
      )}
    >
      {recommended && (
        <div className="absolute -top-2.5 right-4">
          <Badge variant="warning" size="sm">Recommended</Badge>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#070B12]"
            style={{ backgroundColor: color }}
          >
            <Armchair className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{categoryName}</h4>
            <div className="text-xs font-mono font-bold text-[#FBBF24]">{priceTag}</div>
          </div>
        </div>
      </div>

      <ul className="space-y-1.5 pt-2 border-t border-[#2A3445]/60 text-xs text-[#CBD5E1]">
        {perks.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-[11px]">
            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
