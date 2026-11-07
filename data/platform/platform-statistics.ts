export interface MonthlyGrowthPoint {
  month: string;
  revenue: number;
  revenueFormatted: string;
  admissions: number;
  admissionsFormatted: string;
}

export interface CityDistributionPoint {
  city: string;
  sharePercent: number;
  revenueFormatted: string;
}

export interface FormatDistributionPoint {
  format: string;
  screens: number;
  revenueSharePercent: number;
}

export const PLATFORM_MONTHLY_GROWTH: MonthlyGrowthPoint[] = [
  { month: "May", revenue: 5400000, revenueFormatted: "₹54.0 L", admissions: 14200, admissionsFormatted: "14.2K" },
  { month: "Jun", revenue: 6100000, revenueFormatted: "₹61.0 L", admissions: 16800, admissionsFormatted: "16.8K" },
  { month: "Jul", revenue: 6900000, revenueFormatted: "₹69.0 L", admissions: 18900, admissionsFormatted: "18.9K" },
  { month: "Aug", revenue: 7400000, revenueFormatted: "₹74.0 L", admissions: 20400, admissionsFormatted: "20.4K" },
  { month: "Sep", revenue: 7850000, revenueFormatted: "₹78.5 L", admissions: 22100, admissionsFormatted: "22.1K" },
  { month: "Oct", revenue: 86450200 / 10, revenueFormatted: "₹86.4 L", admissions: 32450, admissionsFormatted: "32.4K" },
];

export const CITY_REVENUE_DISTRIBUTION: CityDistributionPoint[] = [
  { city: "Mumbai", sharePercent: 28.5, revenueFormatted: "₹2.46 Cr" },
  { city: "Delhi NCR", sharePercent: 24.2, revenueFormatted: "₹2.09 Cr" },
  { city: "Bengaluru", sharePercent: 18.6, revenueFormatted: "₹1.61 Cr" },
  { city: "Pune", sharePercent: 12.4, revenueFormatted: "₹1.07 Cr" },
  { city: "Hyderabad", sharePercent: 9.8, revenueFormatted: "₹84.7 L" },
  { city: "Other Metros", sharePercent: 6.5, revenueFormatted: "₹56.2 L" },
];

export const FORMAT_DISTRIBUTION: FormatDistributionPoint[] = [
  { format: "IMAX with Laser", screens: 22, revenueSharePercent: 34.2 },
  { format: "Dolby Cinema / Atmos", screens: 44, revenueSharePercent: 38.6 },
  { format: "4DX Dynamic Motion", screens: 14, revenueSharePercent: 12.8 },
  { format: "ScreenX 270° Panorama", screens: 10, revenueSharePercent: 8.4 },
  { format: "Standard Laser 4K", screens: 20, revenueSharePercent: 6.0 },
];
