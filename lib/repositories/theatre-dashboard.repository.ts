/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard & Analytics Repository (Phase 3 – Part 11)
 * ==============================================================================
 * In-memory materialized metrics repository. Decouples UI requests from direct
 * transactional queries across bookings, payments, shows, and halls tables.
 * Provides pre-aggregated operational metrics, dimension filtering, real-time
 * activity logs, and per-user layout preferences.
 * ==============================================================================
 */

import {
  DashboardFilterInput,
  DashboardActivityItem,
  RevenueMetricsBundle,
  BookingMetricsBundle,
  ShowMetricsBundle,
  HallMetricsBundle,
  OccupancyMetricsBundle,
  PaymentMetricsBundle,
  OperationalAlertsBundle,
  UserDashboardPreferences,
} from "@/types/theatre-dashboard.types";
import { getDefaultPreferences } from "@/lib/dashboard/widget-registry";

interface PreAggregatedTenantMetrics {
  theatreId: string;
  currency: string;
  currencySymbol: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
  timezone: string;
  timeFormat: "12H" | "24H";
  todayRevenue: number;
  yesterdayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  todayBookings: number;
  yesterdayBookings: number;
  todayTicketsSold: number;
  todayCustomersCount: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalHalls: number;
  availableHalls: number;
  occupiedHalls: number;
  maintenanceHalls: number;
  inactiveHalls: number;
  seatUtilizationPercent: number;
  currentOccupancyPercent: number;
  dailyOccupancyPercent: number;
  weeklyOccupancyPercent: number;
  monthlyOccupancyPercent: number;
  peakOccupancyHour: string;
  peakOccupancyPercent: number;
  runningShowsCount: number;
  upcomingShowsCount: number;
  completedShowsCount: number;
  cancelledShowsCount: number;
  staffOnlineCount: number;
  systemLatencyMs: number;
  revenueByMethod: { method: string; amount: number; percentage: number; label: string }[];
  revenueTrend: { label: string; amount: number; bookingsCount: number }[];
  bookingTrend: { label: string; count: number }[];
  showsStartingSoon: {
    id: string;
    movieTitle: string;
    hallName: string;
    hallId: string;
    format: string;
    startTime: string;
    totalSeats: number;
    bookedSeats: number;
    occupancyPercent: number;
    minutesUntilStart: number;
  }[];
  showsSummary: {
    id: string;
    movieTitle: string;
    hallName: string;
    startTime: string;
    endTime: string;
    status: "UPCOMING" | "RUNNING" | "COMPLETED" | "CANCELLED";
    bookedSeats: number;
    totalCapacity: number;
    revenue: number;
  }[];
  hallsSummary: {
    id: string;
    name: string;
    hallType: string;
    totalCapacity: number;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "INACTIVE";
    currentShowTitle?: string;
    currentShowStart?: string;
    currentShowEnd?: string;
    maintenanceReason?: string;
  }[];
}

export class TheatreDashboardRepository {
  private tenantMetricsStore: Map<string, PreAggregatedTenantMetrics> = new Map();
  private userPreferencesStore: Map<string, UserDashboardPreferences> = new Map();
  private activityFeedStore: Map<string, DashboardActivityItem[]> = new Map();

  constructor() {
    this.seedMaterializedData();
  }

  // ----------------------------------------------------------------------------
  // Data Seeding
  // ----------------------------------------------------------------------------
  private seedMaterializedData(): void {
    // --------------------------------------------------------------------------
    // THEATRE A: Pune Flagship (th-pun-001) - INR, 82% Occupancy, 420 Bookings
    // --------------------------------------------------------------------------
    this.tenantMetricsStore.set("th-pun-001", {
      theatreId: "th-pun-001",
      currency: "INR",
      currencySymbol: "₹",
      numberFormat: "INDIAN",
      timezone: "Asia/Kolkata",
      timeFormat: "12H",
      todayRevenue: 125000,
      yesterdayRevenue: 112500,
      weeklyRevenue: 840000,
      monthlyRevenue: 3450000,
      todayBookings: 420,
      yesterdayBookings: 385,
      todayTicketsSold: 980,
      todayCustomersCount: 365,
      confirmedBookings: 405,
      cancelledBookings: 12,
      pendingBookings: 3,
      totalHalls: 6,
      availableHalls: 1,
      occupiedHalls: 4,
      maintenanceHalls: 1,
      inactiveHalls: 0,
      seatUtilizationPercent: 82.0,
      currentOccupancyPercent: 82.0,
      dailyOccupancyPercent: 79.5,
      weeklyOccupancyPercent: 76.2,
      monthlyOccupancyPercent: 74.8,
      peakOccupancyHour: "20:00",
      peakOccupancyPercent: 94.0,
      runningShowsCount: 4,
      upcomingShowsCount: 12,
      completedShowsCount: 2,
      cancelledShowsCount: 0,
      staffOnlineCount: 14,
      systemLatencyMs: 18,
      revenueByMethod: [
        { method: "UPI", amount: 85000, percentage: 68.0, label: "Direct UPI Rails" },
        { method: "CARD", amount: 27500, percentage: 22.0, label: "Credit/Debit Cards" },
        { method: "NETBANKING", amount: 7500, percentage: 6.0, label: "Net Banking" },
        { method: "CASH_POS", amount: 5000, percentage: 4.0, label: "Box Office Cash" },
      ],
      revenueTrend: [
        { label: "09:00", amount: 8500, bookingsCount: 28 },
        { label: "12:00", amount: 22000, bookingsCount: 75 },
        { label: "15:00", amount: 34500, bookingsCount: 115 },
        { label: "18:00", amount: 38000, bookingsCount: 128 },
        { label: "21:00", amount: 22000, bookingsCount: 74 },
      ],
      bookingTrend: [
        { label: "09:00", count: 28 },
        { label: "12:00", count: 75 },
        { label: "15:00", count: 115 },
        { label: "18:00", count: 128 },
        { label: "21:00", count: 74 },
      ],
      showsStartingSoon: [
        {
          id: "sh-pun-001",
          movieTitle: "Dune: Part Two",
          hallName: "Audi 1 (Laser IMAX)",
          hallId: "hall-pun-01",
          format: "IMAX 2D",
          startTime: "14:30",
          totalSeats: 450,
          bookedSeats: 420,
          occupancyPercent: 93.3,
          minutesUntilStart: 22,
        },
        {
          id: "sh-pun-002",
          movieTitle: "Oppenheimer",
          hallName: "Audi 2 (Dolby Atmos)",
          hallId: "hall-pun-02",
          format: "Dolby 2D",
          startTime: "15:00",
          totalSeats: 300,
          bookedSeats: 280,
          occupancyPercent: 93.3,
          minutesUntilStart: 52,
        },
      ],
      showsSummary: [
        {
          id: "sh-pun-001",
          movieTitle: "Dune: Part Two",
          hallName: "Audi 1 (Laser IMAX)",
          startTime: "14:30",
          endTime: "17:15",
          status: "UPCOMING",
          bookedSeats: 420,
          totalCapacity: 450,
          revenue: 63000,
        },
        {
          id: "sh-pun-002",
          movieTitle: "Oppenheimer",
          hallName: "Audi 2 (Dolby Atmos)",
          startTime: "15:00",
          endTime: "18:00",
          status: "UPCOMING",
          bookedSeats: 280,
          totalCapacity: 300,
          revenue: 39200,
        },
        {
          id: "sh-pun-003",
          movieTitle: "Jawan: Director's Cut",
          hallName: "Audi 4 (Standard 4K)",
          startTime: "11:30",
          endTime: "14:15",
          status: "RUNNING",
          bookedSeats: 180,
          totalCapacity: 200,
          revenue: 22800,
        },
      ],
      hallsSummary: [
        { id: "hall-pun-01", name: "Audi 1 (Laser IMAX)", hallType: "IMAX", totalCapacity: 450, status: "OCCUPIED", currentShowTitle: "Dune: Part Two", currentShowStart: "14:30", currentShowEnd: "17:15" },
        { id: "hall-pun-02", name: "Audi 2 (Dolby Atmos)", hallType: "DOLBY_ATMOS", totalCapacity: 300, status: "OCCUPIED", currentShowTitle: "Oppenheimer", currentShowStart: "15:00", currentShowEnd: "18:00" },
        { id: "hall-pun-03", name: "Audi 3 (VIP Dine-In)", hallType: "VIP_LOUNGE", totalCapacity: 120, status: "MAINTENANCE", maintenanceReason: "Scheduled 4K Laser Optic calibration" },
        { id: "hall-pun-04", name: "Audi 4 (Standard 4K)", hallType: "STANDARD", totalCapacity: 200, status: "OCCUPIED", currentShowTitle: "Jawan", currentShowStart: "11:30", currentShowEnd: "14:15" },
        { id: "hall-pun-05", name: "Audi 5 (Standard 4K)", hallType: "STANDARD", totalCapacity: 180, status: "OCCUPIED", currentShowTitle: "Interstellar", currentShowStart: "12:00", currentShowEnd: "15:00" },
        { id: "hall-pun-06", name: "Audi 6 (Club Screen)", hallType: "CLUB", totalCapacity: 150, status: "AVAILABLE" },
      ],
    });

    // --------------------------------------------------------------------------
    // THEATRE B: Mumbai International (th-mum-001) - USD, 61% Occupancy, $8,420
    // --------------------------------------------------------------------------
    this.tenantMetricsStore.set("th-mum-001", {
      theatreId: "th-mum-001",
      currency: "USD",
      currencySymbol: "$",
      numberFormat: "INTERNATIONAL",
      timezone: "America/New_York",
      timeFormat: "12H",
      todayRevenue: 8420,
      yesterdayRevenue: 7950,
      weeklyRevenue: 56400,
      monthlyRevenue: 232000,
      todayBookings: 215,
      yesterdayBookings: 202,
      todayTicketsSold: 485,
      todayCustomersCount: 198,
      confirmedBookings: 210,
      cancelledBookings: 4,
      pendingBookings: 1,
      totalHalls: 4,
      availableHalls: 2,
      occupiedHalls: 2,
      maintenanceHalls: 0,
      inactiveHalls: 0,
      seatUtilizationPercent: 61.0,
      currentOccupancyPercent: 61.0,
      dailyOccupancyPercent: 58.4,
      weeklyOccupancyPercent: 55.0,
      monthlyOccupancyPercent: 53.2,
      peakOccupancyHour: "19:00",
      peakOccupancyPercent: 78.0,
      runningShowsCount: 2,
      upcomingShowsCount: 6,
      completedShowsCount: 1,
      cancelledShowsCount: 0,
      staffOnlineCount: 8,
      systemLatencyMs: 24,
      revenueByMethod: [
        { method: "CARD", amount: 6200, percentage: 73.6, label: "Credit Cards (Stripe)" },
        { method: "WALLET", amount: 1520, percentage: 18.1, label: "Apple Pay / Google Pay" },
        { method: "CASH_POS", amount: 700, percentage: 8.3, label: "Box Office Cash" },
      ],
      revenueTrend: [
        { label: "10:00", amount: 1200, bookingsCount: 32 },
        { label: "13:00", amount: 2400, bookingsCount: 61 },
        { label: "16:00", amount: 2600, bookingsCount: 68 },
        { label: "19:00", amount: 2220, bookingsCount: 54 },
      ],
      bookingTrend: [
        { label: "10:00", count: 32 },
        { label: "13:00", count: 61 },
        { label: "16:00", count: 68 },
        { label: "19:00", count: 54 },
      ],
      showsStartingSoon: [
        {
          id: "sh-mum-001",
          movieTitle: "Interstellar (10th Anniversary)",
          hallName: "Auditorium A",
          hallId: "hall-mum-01",
          format: "Laser 4K",
          startTime: "16:00",
          totalSeats: 350,
          bookedSeats: 220,
          occupancyPercent: 62.8,
          minutesUntilStart: 35,
        },
      ],
      showsSummary: [
        {
          id: "sh-mum-001",
          movieTitle: "Interstellar (10th Anniversary)",
          hallName: "Auditorium A",
          startTime: "16:00",
          endTime: "19:00",
          status: "UPCOMING",
          bookedSeats: 220,
          totalCapacity: 350,
          revenue: 4180,
        },
        {
          id: "sh-mum-002",
          movieTitle: "The Batman",
          hallName: "Auditorium B",
          startTime: "13:00",
          endTime: "16:00",
          status: "RUNNING",
          bookedSeats: 190,
          totalCapacity: 300,
          revenue: 3420,
        },
      ],
      hallsSummary: [
        { id: "hall-mum-01", name: "Auditorium A", hallType: "STANDARD", totalCapacity: 350, status: "OCCUPIED", currentShowTitle: "Interstellar", currentShowStart: "16:00", currentShowEnd: "19:00" },
        { id: "hall-mum-02", name: "Auditorium B", hallType: "DOLBY", totalCapacity: 300, status: "OCCUPIED", currentShowTitle: "The Batman", currentShowStart: "13:00", currentShowEnd: "16:00" },
        { id: "hall-mum-03", name: "Auditorium C", hallType: "STANDARD", totalCapacity: 250, status: "AVAILABLE" },
        { id: "hall-mum-04", name: "Auditorium D", hallType: "VIP", totalCapacity: 100, status: "AVAILABLE" },
      ],
    });

    // --------------------------------------------------------------------------
    // THEATRE C: Dubai CineSphere (th-dxb-001) - AED, 74% Occupancy, AED 32,400
    // --------------------------------------------------------------------------
    this.tenantMetricsStore.set("th-dxb-001", {
      theatreId: "th-dxb-001",
      currency: "AED",
      currencySymbol: "AED ",
      numberFormat: "INTERNATIONAL",
      timezone: "Asia/Dubai",
      timeFormat: "24H",
      todayRevenue: 32400,
      yesterdayRevenue: 29800,
      weeklyRevenue: 215000,
      monthlyRevenue: 890000,
      todayBookings: 170,
      yesterdayBookings: 155,
      todayTicketsSold: 380,
      todayCustomersCount: 155,
      confirmedBookings: 165,
      cancelledBookings: 3,
      pendingBookings: 2,
      totalHalls: 5,
      availableHalls: 2,
      occupiedHalls: 3,
      maintenanceHalls: 0,
      inactiveHalls: 0,
      seatUtilizationPercent: 74.0,
      currentOccupancyPercent: 74.0,
      dailyOccupancyPercent: 71.2,
      weeklyOccupancyPercent: 68.0,
      monthlyOccupancyPercent: 66.5,
      peakOccupancyHour: "21:00",
      peakOccupancyPercent: 88.0,
      runningShowsCount: 3,
      upcomingShowsCount: 3,
      completedShowsCount: 1,
      cancelledShowsCount: 0,
      staffOnlineCount: 11,
      systemLatencyMs: 29,
      revenueByMethod: [
        { method: "CARD", amount: 24000, percentage: 74.1, label: "Credit Cards (Network Intl)" },
        { method: "WALLET", amount: 6400, percentage: 19.8, label: "Apple Pay / Tabby" },
        { method: "CASH_POS", amount: 2000, percentage: 6.1, label: "Box Office Cash" },
      ],
      revenueTrend: [
        { label: "12:00", amount: 5400, bookingsCount: 28 },
        { label: "15:00", amount: 9800, bookingsCount: 52 },
        { label: "18:00", amount: 10200, bookingsCount: 54 },
        { label: "21:00", amount: 7000, bookingsCount: 36 },
      ],
      bookingTrend: [
        { label: "12:00", count: 28 },
        { label: "15:00", count: 52 },
        { label: "18:00", count: 54 },
        { label: "21:00", count: 36 },
      ],
      showsStartingSoon: [
        {
          id: "sh-dxb-001",
          movieTitle: "Gladiator II",
          hallName: "Grand Screen 1",
          hallId: "hall-dxb-01",
          format: "Laser Ultra 4K",
          startTime: "18:30",
          totalSeats: 320,
          bookedSeats: 250,
          occupancyPercent: 78.1,
          minutesUntilStart: 40,
        },
      ],
      showsSummary: [
        {
          id: "sh-dxb-001",
          movieTitle: "Gladiator II",
          hallName: "Grand Screen 1",
          startTime: "18:30",
          endTime: "21:15",
          status: "UPCOMING",
          bookedSeats: 250,
          totalCapacity: 320,
          revenue: 17500,
        },
        {
          id: "sh-dxb-002",
          movieTitle: "Mission: Impossible",
          hallName: "Lounge Screen 2",
          startTime: "15:00",
          endTime: "18:00",
          status: "RUNNING",
          bookedSeats: 130,
          totalCapacity: 160,
          revenue: 14900,
        },
      ],
      hallsSummary: [
        { id: "hall-dxb-01", name: "Grand Screen 1", hallType: "LASER_ULTRA", totalCapacity: 320, status: "OCCUPIED", currentShowTitle: "Gladiator II", currentShowStart: "18:30", currentShowEnd: "21:15" },
        { id: "hall-dxb-02", name: "Lounge Screen 2", hallType: "VIP_LOUNGE", totalCapacity: 160, status: "OCCUPIED", currentShowTitle: "Mission: Impossible", currentShowStart: "15:00", currentShowEnd: "18:00" },
        { id: "hall-dxb-03", name: "Audi 3", hallType: "STANDARD", totalCapacity: 200, status: "OCCUPIED", currentShowTitle: "Aladdin Live", currentShowStart: "14:00", currentShowEnd: "16:30" },
        { id: "hall-dxb-04", name: "Audi 4", hallType: "STANDARD", totalCapacity: 180, status: "AVAILABLE" },
        { id: "hall-dxb-05", name: "Audi 5", hallType: "STANDARD", totalCapacity: 150, status: "AVAILABLE" },
      ],
    });

    // Seed Activity Feeds
    this.activityFeedStore.set("th-pun-001", [
      {
        id: "act-pun-01",
        theatreId: "th-pun-001",
        activityType: "NEW_BOOKING",
        title: "VIP Recliner Box Reserved",
        description: "4x tickets booked for Dune: Part Two on Audi 1 by +91 98201 12345",
        severity: "SUCCESS",
        timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        metadata: { bookingId: "bk-9941", amount: 2400 },
      },
      {
        id: "act-pun-02",
        theatreId: "th-pun-001",
        activityType: "PAYMENT_RECEIVED",
        title: "UPI Instant Settlement",
        description: "₹2,400 successfully credited via HDFC UPI QR Terminal",
        severity: "INFO",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: { upiTxnId: "upi-12948271" },
      },
      {
        id: "act-pun-03",
        theatreId: "th-pun-001",
        activityType: "MAINTENANCE_ALERT",
        title: "Screen 3 Calibration Underway",
        description: "Laser optical team started color prism sweep on Audi 3",
        severity: "WARNING",
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        metadata: { hallId: "hall-pun-03" },
      },
      {
        id: "act-pun-04",
        theatreId: "th-pun-001",
        activityType: "SHOW_STARTED",
        title: "Show Running on Audi 4",
        description: "Jawan: Director's Cut commenced with 180 verified admissions",
        severity: "INFO",
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      },
      {
        id: "act-pun-05",
        theatreId: "th-pun-001",
        activityType: "STAFF_DUTY",
        title: "Crew Shift Assigned",
        description: "Anita Desai assigned as Duty Supervisor for Afternoon Roster",
        severity: "INFO",
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      },
    ]);

    this.activityFeedStore.set("th-mum-001", [
      {
        id: "act-mum-01",
        theatreId: "th-mum-001",
        activityType: "NEW_BOOKING",
        title: "Online Web Checkout",
        description: "2x Standard seats booked for Interstellar on Auditorium A",
        severity: "SUCCESS",
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        id: "act-mum-02",
        theatreId: "th-mum-001",
        activityType: "PAYMENT_RECEIVED",
        title: "Stripe Card Capture",
        description: "$42.00 captured successfully via Stripe US",
        severity: "INFO",
        timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
      },
    ]);

    this.activityFeedStore.set("th-dxb-001", [
      {
        id: "act-dxb-01",
        theatreId: "th-dxb-001",
        activityType: "NEW_BOOKING",
        title: "Gold Lounge Booking",
        description: "3x seats reserved for Gladiator II on Grand Screen 1",
        severity: "SUCCESS",
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
      {
        id: "act-dxb-02",
        theatreId: "th-dxb-001",
        activityType: "PAYMENT_RECEIVED",
        title: "Network International POS",
        description: "AED 340.00 processed via contactless Apple Pay",
        severity: "INFO",
        timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      },
    ]);
  }

  // ----------------------------------------------------------------------------
  // Query Materialized Operational Metrics
  // ----------------------------------------------------------------------------
  public async getMetrics(theatreId: string, filter: DashboardFilterInput): Promise<{
    revenue: RevenueMetricsBundle;
    bookings: BookingMetricsBundle;
    shows: ShowMetricsBundle;
    halls: HallMetricsBundle;
    occupancy: OccupancyMetricsBundle;
    payments: PaymentMetricsBundle;
    alerts: OperationalAlertsBundle;
    meta: {
      currency: string;
      currencySymbol: string;
      numberFormat: "INDIAN" | "INTERNATIONAL";
      timezone: string;
      timeFormat: "12H" | "24H";
    };
  }> {
    const data = this.tenantMetricsStore.get(theatreId);
    if (!data) {
      // Return default synthetic data if unknown tenant
      return this.buildFallbackMetrics(theatreId);
    }

    // Apply period multiplier (e.g. YESTERDAY vs THIS_WEEK vs THIS_MONTH)
    let periodMultiplier = 1;
    let growthMultiplier = 1;
    if (filter.periodPreset === "YESTERDAY") {
      periodMultiplier = data.yesterdayRevenue / data.todayRevenue;
      growthMultiplier = 0;
    } else if (filter.periodPreset === "THIS_WEEK") {
      periodMultiplier = data.weeklyRevenue / data.todayRevenue;
      growthMultiplier = 1.25;
    } else if (filter.periodPreset === "THIS_MONTH") {
      periodMultiplier = data.monthlyRevenue / data.todayRevenue;
      growthMultiplier = 1.45;
    }

    // Dimension filter: by hall
    let filteredHalls = data.hallsSummary;
    let filteredShows = data.showsSummary;
    let filteredStartingSoon = data.showsStartingSoon;
    let hallMultiplier = 1;

    if (filter.hallId) {
      filteredHalls = data.hallsSummary.filter((h) => h.id === filter.hallId);
      filteredShows = data.showsSummary.filter((s) => s.id.includes(filter.hallId || ""));
      filteredStartingSoon = data.showsStartingSoon.filter((s) => s.hallId === filter.hallId);
      hallMultiplier = 1 / Math.max(1, data.totalHalls);
    }

    if (filter.movieId) {
      filteredShows = filteredShows.filter((s) => s.movieTitle.toLowerCase().includes(filter.movieId!.toLowerCase()));
      filteredStartingSoon = filteredStartingSoon.filter((s) => s.movieTitle.toLowerCase().includes(filter.movieId!.toLowerCase()));
    }

    const currentRev = Math.round(data.todayRevenue * periodMultiplier * hallMultiplier);
    const yesterdayRev = Math.round(data.yesterdayRevenue * hallMultiplier);
    const growthPercent = yesterdayRev > 0 ? Number((((currentRev - yesterdayRev) / yesterdayRev) * 100).toFixed(1)) : 0;
    const currentBookings = Math.round(data.todayBookings * periodMultiplier * hallMultiplier);
    const avgTicket = currentBookings > 0 ? Number((currentRev / (data.todayTicketsSold * periodMultiplier * hallMultiplier || 1)).toFixed(2)) : 0;
    const avgBooking = currentBookings > 0 ? Number((currentRev / currentBookings).toFixed(2)) : 0;

    const revenue: RevenueMetricsBundle = {
      todayRevenue: currentRev,
      yesterdayRevenue: yesterdayRev,
      revenueGrowthPercent: growthPercent,
      weeklyRevenue: Math.round(data.weeklyRevenue * hallMultiplier),
      monthlyRevenue: Math.round(data.monthlyRevenue * hallMultiplier),
      averageTicketValue: avgTicket,
      revenueByPaymentMethod: data.revenueByMethod.map((m) => ({
        ...m,
        amount: Math.round(m.amount * periodMultiplier * hallMultiplier),
      })),
      revenueTrend: data.revenueTrend.map((t) => ({
        ...t,
        amount: Math.round(t.amount * periodMultiplier * hallMultiplier),
        bookingsCount: Math.round(t.bookingsCount * periodMultiplier * hallMultiplier),
      })),
    };

    const bookings: BookingMetricsBundle = {
      todayBookings: currentBookings,
      yesterdayBookings: Math.round(data.yesterdayBookings * hallMultiplier),
      bookingGrowthPercent: Number((((currentBookings - Math.round(data.yesterdayBookings * hallMultiplier)) / (Math.max(1, data.yesterdayBookings * hallMultiplier))) * 100).toFixed(1)),
      confirmedBookings: Math.round(data.confirmedBookings * periodMultiplier * hallMultiplier),
      cancelledBookings: Math.round(data.cancelledBookings * periodMultiplier * hallMultiplier),
      pendingBookings: Math.round(data.pendingBookings * periodMultiplier * hallMultiplier),
      todayTicketsSold: Math.round(data.todayTicketsSold * periodMultiplier * hallMultiplier),
      todayCustomersCount: Math.round(data.todayCustomersCount * periodMultiplier * hallMultiplier),
      averageBookingValue: avgBooking,
      bookingTrend: data.bookingTrend.map((b) => ({
        ...b,
        count: Math.round(b.count * periodMultiplier * hallMultiplier),
      })),
    };

    const hasShowFilter = Boolean(filter.hallId || filter.movieId);
    const shows: ShowMetricsBundle = {
      runningShowsCount: hasShowFilter
        ? filteredShows.filter((s) => s.status === "RUNNING").length
        : data.runningShowsCount,
      upcomingShowsCount: hasShowFilter
        ? filteredShows.filter((s) => s.status === "UPCOMING").length
        : data.upcomingShowsCount,
      completedShowsCount: hasShowFilter
        ? filteredShows.filter((s) => s.status === "COMPLETED").length
        : data.completedShowsCount,
      cancelledShowsCount: data.cancelledShowsCount,
      totalShowsCount: hasShowFilter
        ? filteredShows.length
        : (data.runningShowsCount + data.upcomingShowsCount + data.completedShowsCount),
      showsStartingSoon: filteredStartingSoon,
      showsSummary: filteredShows,
    };

    const halls: HallMetricsBundle = {
      totalHalls: filter.hallId ? filteredHalls.length : data.totalHalls,
      availableHalls: filter.hallId ? filteredHalls.filter((h) => h.status === "AVAILABLE").length : data.availableHalls,
      occupiedHalls: filter.hallId ? filteredHalls.filter((h) => h.status === "OCCUPIED").length : data.occupiedHalls,
      maintenanceHalls: filter.hallId ? filteredHalls.filter((h) => h.status === "MAINTENANCE").length : data.maintenanceHalls,
      inactiveHalls: filter.hallId ? filteredHalls.filter((h) => h.status === "INACTIVE").length : data.inactiveHalls,
      seatUtilizationPercent: data.seatUtilizationPercent,
      hallsSummary: filteredHalls,
    };

    const occupancy: OccupancyMetricsBundle = {
      currentOccupancyPercent: data.currentOccupancyPercent,
      dailyOccupancyPercent: data.dailyOccupancyPercent,
      weeklyOccupancyPercent: data.weeklyOccupancyPercent,
      monthlyOccupancyPercent: data.monthlyOccupancyPercent,
      peakOccupancyHour: data.peakOccupancyHour,
      peakOccupancyPercent: data.peakOccupancyPercent,
    };

    const payments: PaymentMetricsBundle = {
      completedPaymentsCount: bookings.confirmedBookings,
      completedPaymentsAmount: currentRev,
      pendingPaymentsCount: bookings.pendingBookings,
      pendingPaymentsAmount: Math.round(currentRev * 0.015),
      failedPaymentsCount: Math.round(bookings.cancelledBookings * 0.25),
      failedPaymentsAmount: Math.round(currentRev * 0.005),
      refundsCount: bookings.cancelledBookings,
      refundsAmount: Math.round(currentRev * 0.025),
    };

    const alerts: OperationalAlertsBundle = {
      newBookingsCount: Math.min(25, bookings.todayBookings),
      paymentUpdatesCount: 12,
      showUpdatesCount: shows.showsStartingSoon.length,
      systemAlertsCount: 0,
      maintenanceAlertsCount: halls.maintenanceHalls,
      staffAlertsCount: 1,
      staffOnlineCount: data.staffOnlineCount,
      systemHealth: {
        status: "OPTIMAL",
        latencyMs: data.systemLatencyMs,
        servicesHealthy: true,
        databaseConnected: true,
        cacheConnected: true,
      },
    };

    return {
      revenue,
      bookings,
      shows,
      halls,
      occupancy,
      payments,
      alerts,
      meta: {
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        numberFormat: data.numberFormat,
        timezone: data.timezone,
        timeFormat: data.timeFormat,
      },
    };
  }

  // ----------------------------------------------------------------------------
  // User Preferences
  // ----------------------------------------------------------------------------
  public async getUserPreferences(theatreId: string, userId: string): Promise<UserDashboardPreferences> {
    const key = `${theatreId}:${userId}`;
    const existing = this.userPreferencesStore.get(key);
    if (existing) {
      return { ...existing };
    }
    const defaults = getDefaultPreferences(theatreId, userId);
    this.userPreferencesStore.set(key, defaults);
    return { ...defaults };
  }

  public async saveUserPreferences(prefs: UserDashboardPreferences): Promise<UserDashboardPreferences> {
    const key = `${prefs.theatreId}:${prefs.userId}`;
    const updated: UserDashboardPreferences = {
      ...prefs,
      updatedAt: new Date(),
    };
    this.userPreferencesStore.set(key, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // Activity Feed
  // ----------------------------------------------------------------------------
  public async getRecentActivities(theatreId: string, limit: number = 10): Promise<DashboardActivityItem[]> {
    const list = this.activityFeedStore.get(theatreId) || [];
    return list.slice(0, limit);
  }

  public async recordActivity(theatreId: string, item: Omit<DashboardActivityItem, "id" | "timestamp">): Promise<DashboardActivityItem> {
    const list = this.activityFeedStore.get(theatreId) || [];
    const newActivity: DashboardActivityItem = {
      id: `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      theatreId,
      activityType: item.activityType,
      title: item.title,
      description: item.description,
      severity: item.severity,
      timestamp: new Date().toISOString(),
      metadata: item.metadata,
    };
    list.unshift(newActivity);
    this.activityFeedStore.set(theatreId, list);
    return newActivity;
  }

  // ----------------------------------------------------------------------------
  // Filter Options
  // ----------------------------------------------------------------------------
  public async getAvailableFilterOptions(theatreId: string): Promise<{
    halls: { id: string; name: string }[];
    movies: { id: string; title: string }[];
    shows: { id: string; title: string; time: string }[];
  }> {
    const data = this.tenantMetricsStore.get(theatreId);
    if (!data) {
      return { halls: [], movies: [], shows: [] };
    }

    const halls = data.hallsSummary.map((h) => ({ id: h.id, name: h.name }));
    const moviesMap = new Map<string, string>();
    data.showsSummary.forEach((s) => {
      moviesMap.set(s.movieTitle, s.movieTitle);
    });
    const movies = Array.from(moviesMap.values()).map((title, idx) => ({ id: `mov-${idx + 1}`, title }));
    const shows = data.showsSummary.map((s) => ({
      id: s.id,
      title: s.movieTitle,
      time: `${s.startTime} - ${s.endTime}`,
    }));

    return { halls, movies, shows };
  }

  // ----------------------------------------------------------------------------
  // Fallback for new theatres
  // ----------------------------------------------------------------------------
  private buildFallbackMetrics(theatreId: string) {
    return {
      revenue: {
        todayRevenue: 0,
        yesterdayRevenue: 0,
        revenueGrowthPercent: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        averageTicketValue: 0,
        revenueByPaymentMethod: [],
        revenueTrend: [],
      },
      bookings: {
        todayBookings: 0,
        yesterdayBookings: 0,
        bookingGrowthPercent: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        pendingBookings: 0,
        todayTicketsSold: 0,
        todayCustomersCount: 0,
        averageBookingValue: 0,
        bookingTrend: [],
      },
      shows: {
        runningShowsCount: 0,
        upcomingShowsCount: 0,
        completedShowsCount: 0,
        cancelledShowsCount: 0,
        totalShowsCount: 0,
        showsStartingSoon: [],
        showsSummary: [],
      },
      halls: {
        totalHalls: 0,
        availableHalls: 0,
        occupiedHalls: 0,
        maintenanceHalls: 0,
        inactiveHalls: 0,
        seatUtilizationPercent: 0,
        hallsSummary: [],
      },
      occupancy: {
        currentOccupancyPercent: 0,
        dailyOccupancyPercent: 0,
        weeklyOccupancyPercent: 0,
        monthlyOccupancyPercent: 0,
        peakOccupancyHour: "N/A",
        peakOccupancyPercent: 0,
      },
      payments: {
        completedPaymentsCount: 0,
        completedPaymentsAmount: 0,
        pendingPaymentsCount: 0,
        pendingPaymentsAmount: 0,
        failedPaymentsCount: 0,
        failedPaymentsAmount: 0,
        refundsCount: 0,
        refundsAmount: 0,
      },
      alerts: {
        newBookingsCount: 0,
        paymentUpdatesCount: 0,
        showUpdatesCount: 0,
        systemAlertsCount: 0,
        maintenanceAlertsCount: 0,
        staffAlertsCount: 0,
        staffOnlineCount: 0,
        systemHealth: {
          status: "OPTIMAL" as const,
          latencyMs: 15,
          servicesHealthy: true,
          databaseConnected: true,
          cacheConnected: true,
        },
      },
      meta: {
        currency: "INR",
        currencySymbol: "₹",
        numberFormat: "INDIAN" as const,
        timezone: "Asia/Kolkata",
        timeFormat: "12H" as const,
      },
    };
  }
}

export const theatreDashboardRepository = new TheatreDashboardRepository();
