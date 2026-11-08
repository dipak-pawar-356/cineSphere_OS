import { ID } from "./common.types";
import { SeatCategoryTier } from "./hall.types";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Pricing Engine Subsystem Types (Phase 2 – Part 9)
 * ==============================================================================
 * Core Architectural Principle:
 * 1. Pricing belongs to Shows via reusable Pricing Profiles.
 * 2. Movies, Halls, and Seat Templates NEVER store prices.
 * 3. Pricing belongs to SECTIONS, not individual seats.
 *    Every seat in the same section inherits that section's price.
 * 4. Hierarchy: Platform -> Theatre -> Pricing Profile -> Section Pricing -> Show -> Seat Inventory
 * ==============================================================================
 */

export type PricingProfileStatus = "Draft" | "Active" | "Inactive" | "Archived";
export type PricingDayType = "Weekday" | "Weekend" | "Holiday" | "All";
export type PricingSlotType = "Morning" | "Matinee" | "Evening" | "Night" | "All";

/**
 * Future Dynamic Pricing Rule Descriptor (Architectural Hooks)
 * Prepared for future dynamic multipliers, surge pricing, early bird, and occupancy rules.
 */
export interface DynamicPricingRuleDescriptor {
  id: string;
  name: string;
  ruleType:
    | "DAY_OF_WEEK"
    | "TIME_OF_DAY"
    | "OCCUPANCY_SURGE"
    | "EARLY_BIRD"
    | "FESTIVAL_SPECIAL"
    | "HOLIDAY_SURGE"
    | "STUDENT_DISCOUNT"
    | "MEMBERSHIP_TIER";
  conditionDescription: string;
  multiplier: number; // e.g. 1.15 for +15% surge or 0.85 for 15% discount
  fixedAdjustment?: number; // e.g. +₹50
  isEnabled: boolean;
}

/**
 * Reusable Pricing Profile Entity
 * Scoped strictly to each Theatre Tenant (`theatreId`).
 */
export interface DynamicPricingProfile {
  id: string; // e.g. "pp-morning-weekday"
  theatreId: string; // e.g. "th-pun-001"
  code: string; // e.g. "PRF-MW-01"
  name: string; // e.g. "Morning Weekday Economy"
  description: string;
  status: PricingProfileStatus;
  isDefault: boolean;
  isActive?: boolean;
  dayType: PricingDayType;
  slotType: PricingSlotType;

  /**
   * Section / Category Tier Pricing Map
   * Maps Section Category (Silver, Gold, Platinum, VIP, Recliner, etc.) or Section Name to price in INR.
   */
  tierPricing: Record<string, number>;

  /** Auxiliary fees and taxes */
  convenienceFee: number; // e.g. ₹35.00 per ticket
  gstPercent: number; // e.g. 18.00%
  currency: string; // "INR"

  /** Min/Max safety boundaries */
  minPrice: number;
  maxPrice: number;

  /** Architectural hooks for future dynamic rules */
  futureRules?: DynamicPricingRuleDescriptor[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Input DTO for Creating / Editing Pricing Profiles
 */
export interface CreatePricingProfileInput {
  name: string;
  code?: string;
  description: string;
  theatreId: string;
  status?: PricingProfileStatus;
  isDefault?: boolean;
  dayType: PricingDayType;
  slotType: PricingSlotType;
  tierPricing: Record<string, number>;
  convenienceFee?: number;
  gstPercent?: number;
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type UpdatePricingProfileInput = Partial<CreatePricingProfileInput>;

/**
 * Selected Seat Item for Price Calculation Engine
 */
export interface SeatPriceCalculationItem {
  seatId?: string;
  seatNumber: string; // e.g. "A3"
  row: string; // "A"
  column: number; // 3
  sectionId?: string;
  sectionName: string; // "Section A" or "Gold Tier"
  categoryTier: SeatCategoryTier | string; // "Gold"
}

/**
 * Price Calculation Breakdown Output
 * Prepared for future customer seat selection & checkout pipeline.
 */
export interface PriceCalculationLineItem {
  seatNumber: string;
  sectionName: string;
  categoryTier: string;
  unitPrice: number;
}

export interface PriceCalculationResult {
  currency: string;
  seatItems: PriceCalculationLineItem[];
  totalSeats: number;
  seatSubtotal: number; // Sum of unit prices
  convenienceFeePerSeat: number;
  convenienceFeeTotal: number;
  gstPercent: number;
  gstTaxTotal: number; // 18% of convenience fee or ticket
  discountTotal: number; // Future discount placeholder
  grandTotal: number; // seatSubtotal + convenienceFeeTotal + gstTaxTotal - discountTotal
  profileApplied: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Revenue and Yield Projection Simulation
 */
export interface SectionRevenueYield {
  sectionName: string;
  tier: string;
  unitPrice: number;
  seatCount: number;
  potentialRevenue: number;
}

export interface ShowRevenueSimulation {
  totalCapacity: number;
  sections: SectionRevenueYield[];
  housefullPotentialRevenue: number;
  averageTicketPrice: number; // ATP = potentialRevenue / totalCapacity
  estimatedAt50Percent: number;
  estimatedAt75Percent: number;
}

/**
 * Multi-Faceted Filters for Pricing Profiles
 */
export interface PricingFilterOptions {
  query?: string;
  status?: PricingProfileStatus | "all";
  dayType?: PricingDayType | "all";
  slotType?: PricingSlotType | "all";
}

/**
 * Audit Log Record for Pricing Mutations
 */
export interface PricingAuditLogRecord {
  id: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "DUPLICATED" | "ASSIGNED" | "ACTIVATED" | "ARCHIVED";
  profileId: string;
  profileName: string;
  theatreId: string;
  user: string;
  timestamp: string;
  details: string;
  status: "SUCCESS" | "FAILED";
}
