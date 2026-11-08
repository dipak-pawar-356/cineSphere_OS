import { PricingProfile } from "@/types/show-management.types";

/**
 * ==============================================================================
 * CineSphere OS — Initial Reusable Pricing Profiles (Phase 2 – Part 8)
 * ==============================================================================
 * Architectural Law:
 * Never store prices permanently inside Movies or Hall layouts.
 * A Show references a Pricing Profile.
 *
 * Example:
 * Morning Weekday:  Section Silver → ₹180 | Gold → ₹240 | VIP → ₹450
 * Weekend Evening:  Section Silver → ₹350 | Gold → ₹450 | VIP → ₹800
 * ==============================================================================
 */

export const INITIAL_PRICING_PROFILES: PricingProfile[] = [
  {
    id: "pp-morning-weekday",
    theatreId: "th-pun-001",
    name: "Morning Weekday Economy",
    description: "Discounted introductory rates for screenings before 13:00 on Monday through Thursday.",
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
    isDefault: false,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekday-matinee",
    theatreId: "th-pun-001",
    name: "Weekday Matinee Regular",
    description: "Standard daytime pricing for weekday afternoon screenings between 13:00 and 17:00.",
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
    isDefault: true,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekday-evening",
    theatreId: "th-pun-001",
    name: "Prime Evening (Mon - Thu)",
    description: "Peak weekday evening prime slots between 17:00 and 23:00 with enhanced patron amenities.",
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
    isDefault: false,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-weekend-blockbuster",
    theatreId: "th-pun-001",
    name: "Weekend Blockbuster Prime",
    description: "High-demand weekend tariff applicable for Friday evenings, Saturdays, and Sundays.",
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
    isDefault: false,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "pp-imax-laser-special",
    theatreId: "th-pun-001",
    name: "IMAX Laser Special Experience",
    description: "Flagship giant-screen 4K laser projection with 12-channel surround sound premium tiering.",
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
    isDefault: false,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];
