import { MetricCardData } from "@/types";

export interface TheatreRevenueData {
  todayRevenue: number;
  monthlyRevenue: number;
  yearToDateRevenue: number;
  ticketSalesRevenue: number;
  concessionsRevenue: number;
  merchandiseAndEventsRevenue: number;
  metrics: MetricCardData[];
  dailyTrends: { day: string; tickets: number; concessions: number; total: number }[];
}

export const THEATRE_REVENUE: TheatreRevenueData = {
  todayRevenue: 482500, // ₹4.82 L
  monthlyRevenue: 10740000, // ₹1.07 Cr
  yearToDateRevenue: 86450200,
  ticketSalesRevenue: 7518000,
  concessionsRevenue: 2685000,
  merchandiseAndEventsRevenue: 537000,
  metrics: [
    {
      title: "Today's Gross Box Office",
      value: "₹4,82,500",
      change: "+12.6%",
      isPositive: true,
      description: "Across all 8 screens and 32 daily showtimes",
      iconName: "TrendingUp",
    },
    {
      title: "Month-To-Date Revenue",
      value: "₹1.07 Cr",
      change: "+18.2%",
      isPositive: true,
      description: "102% of monthly target achieved",
      iconName: "DollarSign",
    },
    {
      title: "F&B Concession Revenue",
      value: "₹26.85 L",
      change: "+24.5%",
      isPositive: true,
      description: "Average spend per head (SPH) ₹285",
      iconName: "Utensils",
    },
    {
      title: "Average Ticket Price (ATP)",
      value: "₹480",
      change: "+₹35",
      isPositive: true,
      description: "Boosted by IMAX and Royal Suite recliner mix",
      iconName: "Ticket",
    },
  ],
  dailyTrends: [
    { day: "Mon", tickets: 210000, concessions: 75000, total: 285000 },
    { day: "Tue", tickets: 235000, concessions: 82000, total: 317000 },
    { day: "Wed", tickets: 320000, concessions: 110000, total: 430000 },
    { day: "Thu", tickets: 290000, concessions: 98000, total: 388000 },
    { day: "Fri", tickets: 480000, concessions: 175000, total: 655000 },
    { day: "Sat", tickets: 620000, concessions: 240000, total: 860000 },
    { day: "Sun", tickets: 590000, concessions: 220000, total: 810000 },
  ],
};
