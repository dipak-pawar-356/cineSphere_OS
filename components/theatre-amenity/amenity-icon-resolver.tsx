import React from "react";
import {
  Sparkles,
  Car,
  Accessibility,
  ArrowUpDown,
  MoveUpRight,
  Utensils,
  Coffee,
  Armchair,
  Volume2,
  Film,
  Zap,
  Tv,
  Smile,
  BatteryCharging,
  Building,
  DoorClosed,
  GlassWater,
  Wifi,
  ConciergeBell,
  ShieldCheck,
  CheckCircle2,
  Tag,
  HelpCircle,
} from "lucide-react";

/**
 * ==============================================================================
 * CineSphere OS — Amenity Icon Resolver (Zero External Library Invariant)
 * ==============================================================================
 * Resolves icon strings to verified Lucide React SVG components with fallback.
 * ==============================================================================
 */

export const AMENITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Car,
  Accessibility,
  ArrowUpDown,
  MoveUpRight,
  Utensils,
  Coffee,
  Armchair,
  Volume2,
  Film,
  Zap,
  Tv,
  Smile,
  BatteryCharging,
  Building,
  DoorClosed,
  GlassWater,
  Wifi,
  ConciergeBell,
  ShieldCheck,
  CheckCircle2,
  Tag,
};

export interface AmenityIconResolverProps {
  iconName?: string | null;
  className?: string;
}

export function AmenityIconResolver({ iconName, className = "h-5 w-5" }: AmenityIconResolverProps) {
  if (!iconName) {
    return <Sparkles className={className} />;
  }

  // Normalize case (e.g., "sparkles" -> "Sparkles", "wifi" -> "Wifi")
  const key = Object.keys(AMENITY_ICON_MAP).find(
    (k) => k.toLowerCase() === iconName.toLowerCase()
  );

  const IconComponent = key ? AMENITY_ICON_MAP[key] : HelpCircle;
  return <IconComponent className={className} />;
}
