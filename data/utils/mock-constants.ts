/**
 * CineSphere OS — Mock Constants
 */

export const MOCK_CONFIG = {
  locale: "en-IN",
  currency: "INR",
  currencySymbol: "₹",
  timeZone: "Asia/Kolkata",
  defaultPageSize: 10,
  platformName: "CineSphere OS",
  platformTagline: "The Operating System for Modern Cinemas",
} as const;

export const MOVIE_FORMATS = [
  "2D",
  "3D",
  "IMAX",
  "4DX",
  "Dolby Atmos",
  "ScreenX",
  "70mm Film",
] as const;

export const SEAT_CATEGORIES = [
  "Silver",
  "Gold",
  "Platinum",
  "VIP Recliner",
  "Royal Suite Lounger",
] as const;

export const SCREEN_TYPES = [
  "IMAX Laser",
  "Dolby Cinema",
  "4DX Dynamic",
  "Prime Club",
  "Royal Suite",
] as const;
