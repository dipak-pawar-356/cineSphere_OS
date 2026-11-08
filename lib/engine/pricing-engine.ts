import {
  DynamicPricingProfile,
  PriceCalculationLineItem,
  PriceCalculationResult,
  SeatPriceCalculationItem,
  SectionRevenueYield,
  ShowRevenueSimulation,
} from "@/types/pricing-engine.types";
import { DynamicHallSectionConfig } from "@/types/hall.types";

/**
 * ==============================================================================
 * CineSphere OS — Dynamic Pricing Engine (Phase 2 – Part 9)
 * ==============================================================================
 * Invariant Rules:
 * 1. Pricing belongs strictly to SECTIONS via reusable Pricing Profiles.
 * 2. Movies, Halls, and Seat Templates NEVER store prices.
 * 3. Individual seats inherit their parent section's price.
 * 4. Prepared for future surge rules, coupons, memberships, and tax regimes.
 * ==============================================================================
 */

export const INITIAL_DYNAMIC_PRICING_PROFILES: DynamicPricingProfile[] = [
  {
    id: "pp-morning-weekday",
    theatreId: "th-pun-001",
    code: "PRF-MW-01",
    name: "Morning Weekday Economy",
    description: "Discounted introductory rates for morning screenings before 13:00 on Monday through Thursday.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "Weekday",
    slotType: "Morning",
    tierPricing: {
      Silver: 180,
      Gold: 240,
      Platinum: 320,
      VIP: 450,
      Recliner: 550,
      Wheelchair: 180,
      "Royal Suite": 850,
    },
    convenienceFee: 30,
    gstPercent: 18,
    currency: "INR",
    minPrice: 150,
    maxPrice: 1200,
    futureRules: [
      {
        id: "rule-early-bird",
        name: "Early Bird Discount",
        ruleType: "EARLY_BIRD",
        conditionDescription: "Bookings made >48h before showtime",
        multiplier: 0.95,
        isEnabled: false,
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekday-matinee",
    theatreId: "th-pun-001",
    code: "PRF-WD-02",
    name: "Weekday Matinee Regular",
    description: "Standard daytime tariff for weekday afternoon screenings between 13:00 and 17:00.",
    status: "Active",
    isActive: true,
    isDefault: true,
    dayType: "Weekday",
    slotType: "Matinee",
    tierPricing: {
      Silver: 220,
      Gold: 280,
      Platinum: 380,
      VIP: 500,
      Recliner: 650,
      Wheelchair: 220,
      "Royal Suite": 950,
    },
    convenienceFee: 35,
    gstPercent: 18,
    currency: "INR",
    minPrice: 180,
    maxPrice: 1500,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekday-evening",
    theatreId: "th-pun-001",
    code: "PRF-WE-03",
    name: "Prime Evening (Mon - Thu)",
    description: "Peak weekday evening prime slots between 17:00 and 23:00.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "Weekday",
    slotType: "Evening",
    tierPricing: {
      Silver: 280,
      Gold: 360,
      Platinum: 460,
      VIP: 650,
      Recliner: 800,
      Wheelchair: 280,
      "Royal Suite": 1200,
    },
    convenienceFee: 35,
    gstPercent: 18,
    currency: "INR",
    minPrice: 200,
    maxPrice: 1800,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekend-morning",
    theatreId: "th-pun-001",
    code: "PRF-WM-04",
    name: "Weekend Morning Family",
    description: "Saturday and Sunday morning slots tailored for family and kids matinee entertainment.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "Weekend",
    slotType: "Morning",
    tierPricing: {
      Silver: 250,
      Gold: 320,
      Platinum: 420,
      VIP: 600,
      Recliner: 750,
      Wheelchair: 250,
      "Royal Suite": 1100,
    },
    convenienceFee: 35,
    gstPercent: 18,
    currency: "INR",
    minPrice: 200,
    maxPrice: 2000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekend-blockbuster",
    theatreId: "th-pun-001",
    code: "PRF-WBP-05",
    name: "Weekend Blockbuster Prime",
    description: "High-demand weekend evening tariff applicable for Friday evenings, Saturdays, and Sundays.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "Weekend",
    slotType: "All",
    tierPricing: {
      Silver: 350,
      Gold: 450,
      Platinum: 550,
      VIP: 800,
      Recliner: 1000,
      Wheelchair: 350,
      "Royal Suite": 1500,
    },
    convenienceFee: 45,
    gstPercent: 18,
    currency: "INR",
    minPrice: 250,
    maxPrice: 2500,
    futureRules: [
      {
        id: "rule-occupancy-surge",
        name: "Housefull Surge Buffer",
        ruleType: "OCCUPANCY_SURGE",
        conditionDescription: "Occupancy >80% within 2 hours of showtime",
        multiplier: 1.1,
        isEnabled: false,
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-holiday-premium",
    theatreId: "th-pun-001",
    code: "PRF-HOL-06",
    name: "Holiday & Festival Premium",
    description: "National holidays, Diwali, Eid, Christmas, and premiere release festival tiering.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "Holiday",
    slotType: "All",
    tierPricing: {
      Silver: 400,
      Gold: 520,
      Platinum: 650,
      VIP: 900,
      Recliner: 1150,
      Wheelchair: 400,
      "Royal Suite": 1800,
    },
    convenienceFee: 50,
    gstPercent: 18,
    currency: "INR",
    minPrice: 300,
    maxPrice: 3000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-imax-laser-experience",
    theatreId: "th-pun-001",
    code: "PRF-IMX-07",
    name: "IMAX Laser Special Experience",
    description: "Flagship giant-screen 4K laser projection with 12-channel surround sound premium tiering.",
    status: "Active",
    isActive: true,
    isDefault: false,
    dayType: "All",
    slotType: "All",
    tierPricing: {
      Silver: 400,
      Gold: 550,
      Platinum: 700,
      VIP: 950,
      Recliner: 1200,
      Wheelchair: 400,
      "Royal Suite": 1800,
    },
    convenienceFee: 50,
    gstPercent: 18,
    currency: "INR",
    minPrice: 350,
    maxPrice: 3500,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

/**
 * Calculate Seat Selection Pricing Pipeline
 * Prepared for future customer seat selection and checkout.
 *
 * Pipeline:
 * [Seat Selected: A3] -> [Identify Section: Silver] -> [Pricing Profile: ₹200]
 * -> Subtotal + Convenience Fee + GST Tax - Discount = Grand Total
 */
export function calculateShowTicketPrice(
  seatSelections: SeatPriceCalculationItem[],
  profile: DynamicPricingProfile,
  options: {
    appliedMultiplier?: number;
    discountAmount?: number;
  } = {}
): PriceCalculationResult {
  const currency = profile.currency || "INR";
  const lineItems: PriceCalculationLineItem[] = [];
  const multiplier = options.appliedMultiplier ?? 1.0;

  let seatSubtotal = 0;

  for (const seat of seatSelections) {
    // Lookup section price by Category Tier (e.g. "Silver", "VIP") or Section Name
    const categoryKey = seat.categoryTier || "Silver";
    const basePrice =
      profile.tierPricing[categoryKey] ??
      profile.tierPricing[seat.sectionName] ??
      profile.tierPricing["Silver"] ??
      250;

    const unitPrice = Math.round(basePrice * multiplier);

    lineItems.push({
      seatNumber: seat.seatNumber,
      sectionName: seat.sectionName || categoryKey,
      categoryTier: categoryKey,
      unitPrice,
    });

    seatSubtotal += unitPrice;
  }

  const convenienceFeePerSeat = profile.convenienceFee ?? 35;
  const convenienceFeeTotal = seatSelections.length * convenienceFeePerSeat;
  const gstPercent = profile.gstPercent ?? 18;

  // In standard multiplex ticketing, 18% GST applies to convenience fee
  const gstTaxTotal = Math.round((convenienceFeeTotal * gstPercent) / 100);
  const discountTotal = options.discountAmount ?? 0;

  const grandTotal = Math.max(
    0,
    seatSubtotal + convenienceFeeTotal + gstTaxTotal - discountTotal
  );

  return {
    currency,
    seatItems: lineItems,
    totalSeats: seatSelections.length,
    seatSubtotal,
    convenienceFeePerSeat,
    convenienceFeeTotal,
    gstPercent,
    gstTaxTotal,
    discountTotal,
    grandTotal,
    profileApplied: {
      id: profile.id,
      name: profile.name,
      code: profile.code,
    },
  };
}

/**
 * Simulate Potential Show Revenue & Yield by Auditorium Sections
 */
export function simulateShowRevenue(
  sections: DynamicHallSectionConfig[],
  profile: DynamicPricingProfile
): ShowRevenueSimulation {
  const sectionYields: SectionRevenueYield[] = [];
  let totalCapacity = 0;
  let housefullPotentialRevenue = 0;

  for (const sec of sections) {
    const tier = sec.category || "Silver";
    const unitPrice =
      profile.tierPricing[tier] ??
      profile.tierPricing[sec.name] ??
      profile.tierPricing["Silver"] ??
      250;

    const potentialRevenue = sec.seatCount * unitPrice;

    sectionYields.push({
      sectionName: sec.name,
      tier,
      unitPrice,
      seatCount: sec.seatCount,
      potentialRevenue,
    });

    totalCapacity += sec.seatCount;
    housefullPotentialRevenue += potentialRevenue;
  }

  const averageTicketPrice =
    totalCapacity > 0 ? Math.round(housefullPotentialRevenue / totalCapacity) : 0;

  return {
    totalCapacity,
    sections: sectionYields,
    housefullPotentialRevenue,
    averageTicketPrice,
    estimatedAt50Percent: Math.round(housefullPotentialRevenue * 0.5),
    estimatedAt75Percent: Math.round(housefullPotentialRevenue * 0.75),
  };
}
