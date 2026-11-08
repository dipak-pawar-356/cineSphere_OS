"use server";

import {
  CreatePricingProfileInput,
  DynamicPricingProfile,
  PriceCalculationResult,
  PricingAuditLogRecord,
  SeatPriceCalculationItem,
  UpdatePricingProfileInput,
} from "@/types/pricing-engine.types";
import { validatePricingProfileInput } from "@/lib/validation/pricing-validation";
import {
  calculateShowTicketPrice,
  INITIAL_DYNAMIC_PRICING_PROFILES,
} from "@/lib/engine/pricing-engine";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Pricing Server Actions (Phase 2 – Part 9)
 * ==============================================================================
 */

export interface PricingActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  auditRecord?: PricingAuditLogRecord;
}

/**
 * Server Action: Create New Dynamic Pricing Profile
 */
export async function createPricingProfileAction(
  input: CreatePricingProfileInput
): Promise<PricingActionResponse<DynamicPricingProfile>> {
  const validation = validatePricingProfileInput(input);
  if (!validation.isValid) {
    return {
      success: false,
      message: "Pricing profile failed input validation.",
      errors: validation.errors,
    };
  }

  const profileId = `pp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const code =
    input.code ||
    `PRF-${input.name.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 4)}-${Math.floor(Math.random() * 90 + 10)}`;

  const newProfile: DynamicPricingProfile = {
    id: profileId,
    theatreId: input.theatreId,
    code,
    name: input.name,
    description: input.description,
    status: input.status || "Active",
    isDefault: input.isDefault ?? false,
    dayType: input.dayType,
    slotType: input.slotType,
    tierPricing: input.tierPricing,
    convenienceFee: input.convenienceFee ?? 35,
    gstPercent: input.gstPercent ?? 18,
    currency: input.currency || "INR",
    minPrice: input.minPrice || 150,
    maxPrice: input.maxPrice || 3500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const auditRecord: PricingAuditLogRecord = {
    id: `aud-prc-${Date.now()}`,
    action: "CREATED",
    profileId: newProfile.id,
    profileName: newProfile.name,
    theatreId: newProfile.theatreId,
    user: "theatre-admin@cinesphere.com",
    timestamp: new Date().toISOString(),
    details: `Created pricing profile "${newProfile.name}" (${newProfile.code}) with ${Object.keys(newProfile.tierPricing).length} section tiers.`,
    status: "SUCCESS",
  };

  return {
    success: true,
    message: `Successfully created pricing profile "${newProfile.name}".`,
    data: newProfile,
    auditRecord,
  };
}

/**
 * Server Action: Update Pricing Profile
 */
export async function updatePricingProfileAction(
  id: string,
  input: UpdatePricingProfileInput,
  currentProfile: DynamicPricingProfile
): Promise<PricingActionResponse<DynamicPricingProfile>> {
  const merged: CreatePricingProfileInput = {
    theatreId: currentProfile.theatreId,
    name: input.name || currentProfile.name,
    code: input.code || currentProfile.code,
    description: input.description ?? currentProfile.description,
    status: input.status || currentProfile.status,
    isDefault: input.isDefault ?? currentProfile.isDefault,
    dayType: input.dayType || currentProfile.dayType,
    slotType: input.slotType || currentProfile.slotType,
    tierPricing: input.tierPricing || currentProfile.tierPricing,
    convenienceFee: input.convenienceFee ?? currentProfile.convenienceFee,
    gstPercent: input.gstPercent ?? currentProfile.gstPercent,
    currency: input.currency || currentProfile.currency,
    minPrice: input.minPrice ?? currentProfile.minPrice,
    maxPrice: input.maxPrice ?? currentProfile.maxPrice,
  };

  const validation = validatePricingProfileInput(merged);
  if (!validation.isValid) {
    return {
      success: false,
      message: "Pricing profile update failed validation.",
      errors: validation.errors,
    };
  }

  const updatedProfile: DynamicPricingProfile = {
    ...currentProfile,
    ...merged,
    updatedAt: new Date().toISOString(),
  };

  const auditRecord: PricingAuditLogRecord = {
    id: `aud-prc-${Date.now()}`,
    action: "UPDATED",
    profileId: id,
    profileName: updatedProfile.name,
    theatreId: updatedProfile.theatreId,
    user: "theatre-admin@cinesphere.com",
    timestamp: new Date().toISOString(),
    details: `Updated rates and parameters for profile "${updatedProfile.name}".`,
    status: "SUCCESS",
  };

  return {
    success: true,
    message: `Updated pricing profile "${updatedProfile.name}".`,
    data: updatedProfile,
    auditRecord,
  };
}

/**
 * Server Action: Delete Pricing Profile
 */
export async function deletePricingProfileAction(
  id: string,
  profileName: string,
  theatreId: string
): Promise<PricingActionResponse<null>> {
  return {
    success: true,
    message: `Deleted pricing profile "${profileName}".`,
    auditRecord: {
      id: `aud-prc-${Date.now()}`,
      action: "DELETED",
      profileId: id,
      profileName,
      theatreId,
      user: "theatre-admin@cinesphere.com",
      timestamp: new Date().toISOString(),
      details: `Deleted pricing profile ID ${id}.`,
      status: "SUCCESS",
    },
  };
}

/**
 * Server Action: Duplicate Pricing Profile
 */
export async function duplicatePricingProfileAction(
  sourceProfile: DynamicPricingProfile,
  newName?: string
): Promise<PricingActionResponse<DynamicPricingProfile>> {
  const name = newName || `${sourceProfile.name} (Copy)`;
  return createPricingProfileAction({
    theatreId: sourceProfile.theatreId,
    name,
    description: sourceProfile.description,
    status: "Draft",
    isDefault: false,
    dayType: sourceProfile.dayType,
    slotType: sourceProfile.slotType,
    tierPricing: { ...sourceProfile.tierPricing },
    convenienceFee: sourceProfile.convenienceFee,
    gstPercent: sourceProfile.gstPercent,
    currency: sourceProfile.currency,
    minPrice: sourceProfile.minPrice,
    maxPrice: sourceProfile.maxPrice,
  });
}

/**
 * Server Action: Calculate Ticket Pricing
 * Validates the exact seat selection pricing pipeline:
 * [Seat Selected] -> [Identify Section] -> [Pricing Profile] -> [Subtotal + Taxes] = Grand Total
 */
export async function calculateTicketPricingAction(
  seatSelections: SeatPriceCalculationItem[],
  profileId: string,
  profiles: DynamicPricingProfile[] = INITIAL_DYNAMIC_PRICING_PROFILES
): Promise<PricingActionResponse<PriceCalculationResult>> {
  const profile =
    profiles.find((p) => p.id === profileId) ||
    profiles[0] ||
    INITIAL_DYNAMIC_PRICING_PROFILES[0];

  const result = calculateShowTicketPrice(seatSelections, profile);

  return {
    success: true,
    message: `Calculated total ₹${result.grandTotal} for ${seatSelections.length} seats.`,
    data: result,
  };
}
