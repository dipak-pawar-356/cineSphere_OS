import { SectionCategoryDesignToken, SeatCategoryTier, HallStatus } from "@/types/hall.types";

/**
 * ==============================================================================
 * CineSphere OS — Seating Architecture & Centralized Design System
 * ==============================================================================
 * Architectural Law:
 * Section colors are NOT stored as raw business values (e.g. "Blue").
 * Instead, sections reference a category tier (Silver, Gold, Platinum, VIP, Recliner, etc.)
 * and colors/tokens are derived from this centralized design system.
 * This guarantees theme consistency across 2D schematics, tickets, and future 3D viewports.
 * ==============================================================================
 */

export const SECTION_CATEGORY_PALETTE: Record<string, SectionCategoryDesignToken> = {
  Silver: {
    category: "Silver",
    label: "Silver Standard",
    color: "#38BDF8", // Sky Blue
    bgClass: "bg-sky-500/15",
    borderClass: "border-sky-500/40",
    textClass: "text-sky-400",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    defaultSeatsPerRow: 10,
    icon: "Armchair",
  },
  Gold: {
    category: "Gold",
    label: "Gold Executive",
    color: "#FBBF24", // Amber Yellow
    bgClass: "bg-amber-500/15",
    borderClass: "border-amber-500/40",
    textClass: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    defaultSeatsPerRow: 10,
    icon: "Sparkles",
  },
  Platinum: {
    category: "Platinum",
    label: "Platinum Prime",
    color: "#EF4444", // Red / Crimson
    bgClass: "bg-rose-500/15",
    borderClass: "border-rose-500/40",
    textClass: "text-rose-400",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    defaultSeatsPerRow: 12,
    icon: "Crown",
  },
  VIP: {
    category: "VIP",
    label: "VIP Luxury",
    color: "#A855F7", // Purple
    bgClass: "bg-purple-500/15",
    borderClass: "border-purple-500/40",
    textClass: "text-purple-400",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    defaultSeatsPerRow: 8,
    icon: "Star",
  },
  "VIP Recliner": {
    category: "VIP Recliner",
    label: "VIP Motorized Recliner",
    color: "#8B5CF6", // Violet
    bgClass: "bg-violet-500/15",
    borderClass: "border-violet-500/40",
    textClass: "text-violet-400",
    badgeClass: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    defaultSeatsPerRow: 8,
    icon: "Star",
  },
  Recliner: {
    category: "Recliner",
    label: "Premium Recliner",
    color: "#10B981", // Dark Green / Emerald
    bgClass: "bg-emerald-500/15",
    borderClass: "border-emerald-500/40",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    defaultSeatsPerRow: 6,
    icon: "Sofa",
  },
  Wheelchair: {
    category: "Wheelchair",
    label: "Wheelchair Accessible",
    color: "#06B6D4", // Light Blue / Cyan
    bgClass: "bg-cyan-500/15",
    borderClass: "border-cyan-500/40",
    textClass: "text-cyan-400",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    defaultSeatsPerRow: 4,
    icon: "Accessibility",
  },
  "Royal Suite": {
    category: "Royal Suite",
    label: "Royal Lounger Pod",
    color: "#EC4899", // Pink
    bgClass: "bg-pink-500/15",
    borderClass: "border-pink-500/40",
    textClass: "text-pink-400",
    badgeClass: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    defaultSeatsPerRow: 6,
    icon: "Gem",
  },
  Executive: {
    category: "Executive",
    label: "Executive Prime",
    color: "#F59E0B", // Warm Amber
    bgClass: "bg-amber-500/15",
    borderClass: "border-amber-500/40",
    textClass: "text-amber-400",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    defaultSeatsPerRow: 10,
    icon: "Sparkles",
  },
  Premium: {
    category: "Premium",
    label: "Premium Class",
    color: "#6366F1", // Indigo
    bgClass: "bg-indigo-500/15",
    borderClass: "border-indigo-500/40",
    textClass: "text-indigo-400",
    badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    defaultSeatsPerRow: 10,
    icon: "Crown",
  },
  Luxury: {
    category: "Luxury",
    label: "Luxury Tier",
    color: "#D946EF", // Fuchsia
    bgClass: "bg-fuchsia-500/15",
    borderClass: "border-fuchsia-500/40",
    textClass: "text-fuchsia-400",
    badgeClass: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    defaultSeatsPerRow: 8,
    icon: "Gem",
  },
  Balcony: {
    category: "Balcony",
    label: "Upper Balcony",
    color: "#14B8A6", // Teal
    bgClass: "bg-teal-500/15",
    borderClass: "border-teal-500/40",
    textClass: "text-teal-400",
    badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    defaultSeatsPerRow: 12,
    icon: "Layers",
  },
  Custom: {
    category: "Custom",
    label: "Custom Section",
    color: "#94A3B8", // Slate
    bgClass: "bg-slate-500/15",
    borderClass: "border-slate-500/40",
    textClass: "text-slate-400",
    badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    defaultSeatsPerRow: 10,
    icon: "Armchair",
  },
};

export const DEFAULT_CATEGORY_FALLBACK: SectionCategoryDesignToken = {
  category: "Standard",
  label: "Standard Seating",
  color: "#94A3B8", // Slate
  bgClass: "bg-slate-500/15",
  borderClass: "border-slate-500/40",
  textClass: "text-slate-400",
  badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  defaultSeatsPerRow: 10,
  icon: "Armchair",
};

/**
 * Retrieve design tokens for any section category with graceful fallback
 */
export function getCategoryDesignTokens(category?: string): SectionCategoryDesignToken {
  if (!category) return DEFAULT_CATEGORY_FALLBACK;
  return SECTION_CATEGORY_PALETTE[category] || DEFAULT_CATEGORY_FALLBACK;
}

// ------------------------------------------------------------------------------
// Cinema Hardware & Auditorium Formats
// ------------------------------------------------------------------------------

export const PROJECTION_TYPES = [
  "2K",
  "4K",
  "Laser",
  "Laser 4K",
  "Barco 4K Laser",
  "Christie RGB Laser",
  "IMAX Dual Laser",
] as const;

export const SOUND_SYSTEMS = [
  "Dolby Atmos",
  "Dolby Atmos 64-Channel",
  "Dolby Digital",
  "DTS",
  "DTS:X",
  "IMAX Sound",
  "Custom",
] as const;

export const SCREEN_TYPES = [
  "Standard",
  "3D",
  "IMAX",
  "IMAX Laser",
  "Dolby Cinema",
  "4DX Dynamic",
  "ScreenX",
] as const;

export const HALL_STATUSES: { value: HallStatus; label: string; badgeVariant: "success" | "warning" | "danger" | "secondary" | "info" }[] = [
  { value: "Active", label: "Active", badgeVariant: "success" },
  { value: "Draft", label: "Draft", badgeVariant: "secondary" },
  { value: "Maintenance", label: "Maintenance", badgeVariant: "warning" },
  { value: "Inactive", label: "Inactive", badgeVariant: "danger" },
  { value: "Archived", label: "Archived", badgeVariant: "secondary" },
];

export const AVAILABLE_CATEGORIES: SeatCategoryTier[] = [
  "Silver",
  "Gold",
  "Platinum",
  "VIP",
  "VIP Recliner",
  "Recliner",
  "Wheelchair",
  "Royal Suite",
];

// ------------------------------------------------------------------------------
// Layout & Row Helpers
// ------------------------------------------------------------------------------

/**
 * Compute row labels dynamically: A, B, C... Z, AA, AB...
 */
export function deriveRowLabels(rowCount: number, startOffset: number = 0): string[] {
  const labels: string[] = [];
  for (let i = 0; i < rowCount; i++) {
    const index = startOffset + i;
    let label = "";
    let num = index;
    do {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);
    labels.push(label);
  }
  return labels;
}

/**
 * Calculate row count and row labels from seatCount and seatsPerRow
 */
export function calculateDynamicRows(seatCount: number, seatsPerRow: number, startOffset: number = 0) {
  const validSeatsPerRow = Math.max(1, seatsPerRow);
  const rowCount = Math.ceil(seatCount / validSeatsPerRow);
  const rowLabels = deriveRowLabels(rowCount, startOffset);
  return {
    rowCount,
    rowLabels,
    seatsInLastRow: seatCount % validSeatsPerRow === 0 ? validSeatsPerRow : seatCount % validSeatsPerRow,
  };
}

/**
 * Validates strict equality between Hall Capacity and configured Section Seats.
 * Rule: Hall Capacity must equal sum of Section Seats.
 */
export function validateHallCapacity(
  capacity: number,
  sections: { seatCount: number }[]
): {
  isValid: boolean;
  configuredSeats: number;
  remainingSeats: number;
  message: string;
  status: "balanced" | "under_allocated" | "over_allocated";
} {
  const configuredSeats = sections.reduce((acc, sec) => acc + (Number(sec.seatCount) || 0), 0);
  const remainingSeats = capacity - configuredSeats;

  if (capacity <= 0) {
    return {
      isValid: false,
      configuredSeats,
      remainingSeats,
      message: "Hall capacity must be greater than zero.",
      status: "under_allocated",
    };
  }

  if (configuredSeats === capacity) {
    return {
      isValid: true,
      configuredSeats,
      remainingSeats: 0,
      message: `Capacity balanced: All ${capacity} seats are precisely allocated across ${sections.length} sections.`,
      status: "balanced",
    };
  }

  if (configuredSeats < capacity) {
    return {
      isValid: false,
      configuredSeats,
      remainingSeats,
      message: `Under-allocated: ${remainingSeats} seat${remainingSeats === 1 ? "" : "s"} remaining to reach Hall Capacity of ${capacity}.`,
      status: "under_allocated",
    };
  }

  const overage = configuredSeats - capacity;
  return {
    isValid: false,
    configuredSeats,
    remainingSeats,
    message: `Over-allocated: Sections total ${configuredSeats} seats, which exceeds Hall Capacity (${capacity}) by ${overage} seat${overage === 1 ? "" : "s"}.`,
    status: "over_allocated",
  };
}
