import { MetricCardData, SystemStat } from "@/types";

export interface TheatreAdminDashboardData {
  theatreId: string;
  theatreName: string;
  metrics: MetricCardData[];
  quickStats: SystemStat[];
  hallOccupancySummary: { hallName: string; screenType: string; currentMovie: string; occupancy: number }[];
}

export const THEATRE_ADMIN_DASHBOARD: TheatreAdminDashboardData = {
  theatreId: "th-pun-001",
  theatreName: "CineSphere Grand Cinemas",
  metrics: [
    {
      title: "Today's Gross Box Office",
      value: "₹4,82,500",
      change: "+12.6%",
      isPositive: true,
      description: "Across 8 halls and 32 scheduled shows",
      iconName: "TrendingUp",
    },
    {
      title: "Seat Occupancy Rate",
      value: "86.4%",
      change: "+8.2%",
      isPositive: true,
      description: "Hall 1 (IMAX) running at 94% capacity",
      iconName: "Users",
    },
    {
      title: "Tickets Sold Today",
      value: "1,142",
      change: "+15.3%",
      isPositive: true,
      description: "Online 88% | Box Office Counter 12%",
      iconName: "Ticket",
    },
    {
      title: "Active Staff On Duty",
      value: "18 / 22",
      change: "All Shifts Covered",
      isPositive: true,
      description: "Morning & evening operational shifts",
      iconName: "ShieldCheck",
    },
  ],
  quickStats: [
    { label: "Active Screens", value: "8 / 8", subtext: "Zero technical faults" },
    { label: "Total Seating Capacity", value: "1,680 seats", subtext: "Across 4 premium tiers" },
    { label: "Average Concession SPH", value: "₹285", subtext: "+24.5% vs target" },
    { label: "Automated Check-in Rate", value: "94.2%", subtext: "Turnstile facial & QR gates" },
  ],
  hallOccupancySummary: [
    { hallName: "Hall 1", screenType: "IMAX Laser", currentMovie: "Dune: Part Two", occupancy: 94 },
    { hallName: "Hall 2", screenType: "Dolby Cinema", currentMovie: "Oppenheimer", occupancy: 88 },
    { hallName: "Hall 3", screenType: "4DX Dynamic", currentMovie: "Interstellar", occupancy: 78 },
    { hallName: "Hall 4", screenType: "Royal Suite", currentMovie: "Kalki 2898 AD", occupancy: 95 },
    { hallName: "Hall 5", screenType: "Prime Club", currentMovie: "Spider-Man: Spider-Verse", occupancy: 68 },
    { hallName: "Hall 6", screenType: "Laser 4K", currentMovie: "Stree 2: Sarkate Ka Aatank", occupancy: 82 },
    { hallName: "Hall 7", screenType: "ScreenX", currentMovie: "Fighter", occupancy: 74 },
    { hallName: "Hall 8", screenType: "Royal Suite", currentMovie: "Corporate Event", occupancy: 100 },
  ],
};
