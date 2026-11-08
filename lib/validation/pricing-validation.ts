import { CreatePricingProfileInput } from "@/types/pricing-engine.types";

/**
 * ==============================================================================
 * CineSphere OS — Pricing Profile Validation Engine (Phase 2 – Part 9)
 * ==============================================================================
 */

export interface PricingValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePricingProfileInput(
  input: Partial<CreatePricingProfileInput>
): PricingValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 3) {
    errors.name = "Pricing profile name must be at least 3 characters.";
  }

  if (!input.theatreId || !input.theatreId.trim()) {
    errors.theatreId = "Theatre tenancy ID is required.";
  }

  if (!input.tierPricing || Object.keys(input.tierPricing).length === 0) {
    errors.tierPricing = "At least one seating tier rate must be defined.";
  } else {
    for (const [tier, price] of Object.entries(input.tierPricing)) {
      if (typeof price !== "number" || isNaN(price)) {
        errors[tier] = `Rate for tier "${tier}" must be a valid numeric amount.`;
      } else if (price < 0) {
        errors[tier] = `Rate for tier "${tier}" cannot be negative.`;
      } else if (price > 15000) {
        errors[tier] = `Rate for tier "${tier}" exceeds maximum allowed threshold (₹15,000).`;
      }
    }
  }

  if (input.convenienceFee !== undefined) {
    if (input.convenienceFee < 0) {
      errors.convenienceFee = "Convenience fee cannot be negative.";
    } else if (input.convenienceFee > 500) {
      errors.convenienceFee = "Convenience fee cannot exceed ₹500.";
    }
  }

  if (input.gstPercent !== undefined) {
    if (input.gstPercent < 0 || input.gstPercent > 50) {
      errors.gstPercent = "GST percentage must be between 0% and 50%.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
