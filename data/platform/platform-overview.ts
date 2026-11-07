import { MetricCardData } from "@/types";

export interface PlatformOverviewData {
  totalRevenue: number;
  totalBookings: number;
  activeTheatres: number;
  totalScreens: number;
  totalCities: number;
  registeredCustomers: number;
  activeMovies: number;
  avgOccupancyRate: number;
  formattedMetrics: MetricCardData[];
}

export const PLATFORM_OVERVIEW: PlatformOverviewData = {
  totalRevenue: 86450200, // ₹8.64 Cr
  totalBookings: 124850,
  activeTheatres: 25,
  totalScreens: 110,
  totalCities: 12,
  registeredCustomers: 385400,
  activeMovies: 48,
  avgOccupancyRate: 82.4,
  formattedMetrics: [
    {
      title: "Total Gross Box Office",
      value: "₹8.64 Cr",
      change: "+18.4%",
      isPositive: true,
      description: "Compared to previous 30-day fiscal period",
      iconName: "TrendingUp",
    },
    {
      title: "Total Admissions / Bookings",
      value: "1,24,850",
      change: "+14.2%",
      isPositive: true,
      description: "Across 25 exhibition venues nationwide",
      iconName: "Ticket",
    },
    {
      title: "Partner Multiplexes",
      value: "25 Theatres",
      change: "+3 New",
      isPositive: true,
      description: "Operating in 12 Tier-1 and Tier-2 metropolitan hubs",
      iconName: "Building2",
    },
    {
      title: "Active Screen Network",
      value: "110 Screens",
      change: "+8 Screens",
      isPositive: true,
      description: "IMAX Laser, Dolby Cinema, 4DX, ScreenX & 4K",
      iconName: "Tv",
    },
    {
      title: "Customer Footprint",
      value: "3,85,400",
      change: "+22.8%",
      isPositive: true,
      description: "Verified active cinephiles and VIP patrons",
      iconName: "Users",
    },
    {
      title: "Average Seat Occupancy",
      value: "82.4%",
      change: "+5.1%",
      isPositive: true,
      description: "Peak weekend primetime shows averaging 94.6%",
      iconName: "Activity",
    },
  ],
};

