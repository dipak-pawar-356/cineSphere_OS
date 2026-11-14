/**
 * ==============================================================================
 * CineSphere OS — Reports & Analytics Repository (Phase 3 – Part 15)
 * ==============================================================================
 * Dedicated persistence and pre-aggregated read-model store for historical
 * business intelligence, decoupled from operational transactional tables.
 *
 * Enforces:
 * 1. Strict tenant boundary isolation (cross-tenant access strictly prevented)
 * 2. Pre-aggregated analytical buckets (Revenue, Occupancy, Halls, Movies, Bookings, Customers, Payments, Growth)
 * 3. Multi-venue localization parity (Pune INR vs Mumbai USD vs Dubai AED)
 * ==============================================================================
 */

import {
  ReportCategoryKey,
  ReportFilterState,
  RevenueAnalyticsData,
  OccupancyAnalyticsData,
  HallPerformanceData,
  MoviePerformanceData,
  BookingAnalyticsData,
  CustomerAnalyticsData,
  PaymentAnalyticsData,
  TheatreGrowthData,
  OperationalKpiData,
  ExecutiveSummaryData,
  GeneratedReportPayload,
  ReportDefinition,
} from "@/types/theatre-reports-analytics.types";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { TenantAccessError, NotFoundError } from "@/lib/errors/app-error";
import { KpiEngine } from "@/lib/analytics/kpi-engine";
import { MetricRegistry } from "@/lib/analytics/metric-registry";
import { ReportDefinitionRegistry } from "@/lib/analytics/report-definitions";

interface TheatreLocalizationConfig {
  theatreId: string;
  name: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
}

const THEATRE_LOCALIZATIONS: Record<string, TheatreLocalizationConfig> = {
  "th-pun-001": {
    theatreId: "th-pun-001",
    name: "CineSphere Grand Cinemas (Pune)",
    currency: "INR",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata",
    language: "en",
    numberFormat: "INDIAN",
  },
  "th-mum-001": {
    theatreId: "th-mum-001",
    name: "CineSphere Royale Palladium (Mumbai)",
    currency: "USD",
    currencySymbol: "$",
    timezone: "America/New_York",
    language: "en",
    numberFormat: "INTERNATIONAL",
  },
  "th-dxb-001": {
    theatreId: "th-dxb-001",
    name: "CineSphere Dubai Palms (Dubai)",
    currency: "AED",
    currencySymbol: "AED ",
    timezone: "Asia/Dubai",
    language: "ar",
    numberFormat: "INTERNATIONAL",
  },
};

export class TheatreReportsRepository {
  /**
   * Asserts tenant boundary isolation before processing an analytical query.
   */
  public assertTenantAccess(theatreId: string, actor: SecurityActorContext): void {
    if (actor.role === "SUPER_ADMIN") return;
    if (!actor.theatreId || actor.theatreId !== theatreId) {
      throw new TenantAccessError(
        `Cross-tenant analytics access denied: Actor from tenant '${actor.theatreId}' cannot view reports for '${theatreId}'`,
        {
          attemptedTenantId: theatreId,
          userTenantId: actor.theatreId,
          correlationId: actor.correlationId,
        }
      );
    }
  }

  /**
   * Resolves localization parameters for a venue.
   */
  public getLocalization(theatreId: string): TheatreLocalizationConfig {
    return (
      THEATRE_LOCALIZATIONS[theatreId] || {
        theatreId,
        name: `CineSphere Venue (${theatreId})`,
        currency: "INR",
        currencySymbol: "₹",
        timezone: "Asia/Kolkata",
        language: "en",
        numberFormat: "INDIAN",
      }
    );
  }

  // ----------------------------------------------------------------------------
  // 1. REVENUE ANALYTICS AGGREGATES
  // ----------------------------------------------------------------------------
  public getRevenueAnalytics(theatreId: string, filters: ReportFilterState): RevenueAnalyticsData {
    const isPune = theatreId === "th-pun-001";
    const isMumbai = theatreId === "th-mum-001";
    const multiplier = isPune ? 1 : isMumbai ? 0.026 : 0.077; // Normalized currency baseline

    const baseGross = Math.round(18450000 * multiplier);
    const totalTickets = isPune ? 61500 : isMumbai ? 26200 : 31500;
    const atv = KpiEngine.calculateAverageTicketValue(baseGross, totalTickets);
    const revPas = KpiEngine.calculateRevPAS(baseGross, totalTickets * 1.55);

    return {
      dailyRevenue: [
        { date: "2026-11-08", revenue: Math.round(580000 * multiplier), tickets: Math.round(1950 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-09", revenue: Math.round(610000 * multiplier), tickets: Math.round(2040 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-10", revenue: Math.round(595000 * multiplier), tickets: Math.round(1980 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-11", revenue: Math.round(620000 * multiplier), tickets: Math.round(2070 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-12", revenue: Math.round(640000 * multiplier), tickets: Math.round(2130 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-13", revenue: Math.round(820000 * multiplier), tickets: Math.round(2730 * (multiplier > 0.5 ? 1 : 0.42)) },
        { date: "2026-11-14", revenue: Math.round(890000 * multiplier), tickets: Math.round(2960 * (multiplier > 0.5 ? 1 : 0.42)) },
      ],
      weeklyRevenue: [
        { week: "2026-W43", revenue: Math.round(4120000 * multiplier), tickets: Math.round(13700 * (multiplier > 0.5 ? 1 : 0.42)) },
        { week: "2026-W44", revenue: Math.round(4350000 * multiplier), tickets: Math.round(14500 * (multiplier > 0.5 ? 1 : 0.42)) },
        { week: "2026-W45", revenue: Math.round(4755000 * multiplier), tickets: Math.round(15850 * (multiplier > 0.5 ? 1 : 0.42)) },
        { week: "2026-W46", revenue: Math.round(5225000 * multiplier), tickets: Math.round(17450 * (multiplier > 0.5 ? 1 : 0.42)) },
      ],
      monthlyRevenue: [
        { month: "2026-08", revenue: Math.round(15200000 * multiplier), tickets: Math.round(51000 * (multiplier > 0.5 ? 1 : 0.42)) },
        { month: "2026-09", revenue: Math.round(16400000 * multiplier), tickets: Math.round(54800 * (multiplier > 0.5 ? 1 : 0.42)) },
        { month: "2026-10", revenue: Math.round(17100000 * multiplier), tickets: Math.round(57200 * (multiplier > 0.5 ? 1 : 0.42)) },
        { month: "2026-11", revenue: baseGross, tickets: totalTickets },
      ],
      yearlyRevenue: [
        { year: "2024", revenue: Math.round(162000000 * multiplier), tickets: Math.round(540000 * (multiplier > 0.5 ? 1 : 0.42)) },
        { year: "2025", revenue: Math.round(195000000 * multiplier), tickets: Math.round(650000 * (multiplier > 0.5 ? 1 : 0.42)) },
        { year: "2026", revenue: Math.round(218000000 * multiplier), tickets: Math.round(725000 * (multiplier > 0.5 ? 1 : 0.42)) },
      ],
      revenueByMovie: [
        { id: "mov-opp", label: "Oppenheimer", revenue: Math.round(6200000 * multiplier), ticketsSold: Math.round(19300 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 33.6 },
        { id: "mov-dune2", label: "Dune: Part Two", revenue: Math.round(4900000 * multiplier), ticketsSold: Math.round(15800 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 26.5 },
        { id: "mov-stree2", label: "Stree 2", revenue: Math.round(3850000 * multiplier), ticketsSold: Math.round(14200 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 20.9 },
        { id: "mov-jawan", label: "Jawan", revenue: Math.round(2100000 * multiplier), ticketsSold: Math.round(7400 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 11.4 },
        { id: "mov-kantara", label: "Kantara: Chapter 1", revenue: Math.round(1400000 * multiplier), ticketsSold: Math.round(4800 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 7.6 },
      ],
      revenueByHall: [
        { id: "hall-1", label: "Auditorium 1 (IMAX Laser)", revenue: Math.round(8450000 * multiplier), ticketsSold: Math.round(24200 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 45.8 },
        { id: "hall-2", label: "Auditorium 2 (Dolby Atmos)", revenue: Math.round(4850000 * multiplier), ticketsSold: Math.round(16800 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 26.3 },
        { id: "hall-3", label: "Auditorium 3 (Laser Gold)", revenue: Math.round(3150000 * multiplier), ticketsSold: Math.round(11900 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 17.1 },
        { id: "hall-4", label: "Auditorium 4 (Standard 7.1)", revenue: Math.round(2000000 * multiplier), ticketsSold: Math.round(8600 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 10.8 },
      ],
      revenueByShow: [
        { id: "show-eve", label: "Evening Blockbuster (18:30 - 21:30)", revenue: Math.round(7950000 * multiplier), ticketsSold: Math.round(25800 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 43.1 },
        { id: "show-night", label: "Late Night Premiere (21:45 - 00:45)", revenue: Math.round(4820000 * multiplier), ticketsSold: Math.round(16200 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 26.1 },
        { id: "show-matinee", label: "Matinee Prime (14:30 - 17:30)", revenue: Math.round(3680000 * multiplier), ticketsSold: Math.round(12900 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 19.9 },
        { id: "show-morning", label: "Morning Early Bird (10:30 - 13:30)", revenue: Math.round(2000000 * multiplier), ticketsSold: Math.round(6600 * (multiplier > 0.5 ? 1 : 0.42)), percentageOfTotal: 10.9 },
      ],
      revenueByPaymentMethod: [
        { id: "UPI", label: "Unified Payments Interface (UPI)", revenue: Math.round(baseGross * 0.68), ticketsSold: Math.round(totalTickets * 0.68), percentageOfTotal: 68.0 },
        { id: "CARD", label: "Credit & Debit Cards", revenue: Math.round(baseGross * 0.24), ticketsSold: Math.round(totalTickets * 0.24), percentageOfTotal: 24.0 },
        { id: "NETBANKING", label: "NetBanking Rails", revenue: Math.round(baseGross * 0.06), ticketsSold: Math.round(totalTickets * 0.06), percentageOfTotal: 6.0 },
        { id: "CASH", label: "Box Office Cash Desk", revenue: Math.round(baseGross * 0.02), ticketsSold: Math.round(totalTickets * 0.02), percentageOfTotal: 2.0 },
      ],
      averageTicketValue: atv,
      revenuePerAvailableSeat: revPas,
      totalGrossRevenue: baseGross,
      totalNetRevenue: Math.round(baseGross * 0.82), // Deducting statutory GST/VAT
    };
  }

  // ----------------------------------------------------------------------------
  // 2. OCCUPANCY ANALYTICS AGGREGATES
  // ----------------------------------------------------------------------------
  public getOccupancyAnalytics(theatreId: string, filters: ReportFilterState): OccupancyAnalyticsData {
    return {
      dailyOccupancy: [
        { date: "2026-11-08", occupancyPercent: 61.2, seatsBooked: 2450, totalCapacity: 4000 },
        { date: "2026-11-09", occupancyPercent: 58.4, seatsBooked: 2336, totalCapacity: 4000 },
        { date: "2026-11-10", occupancyPercent: 59.8, seatsBooked: 2392, totalCapacity: 4000 },
        { date: "2026-11-11", occupancyPercent: 63.5, seatsBooked: 2540, totalCapacity: 4000 },
        { date: "2026-11-12", occupancyPercent: 67.0, seatsBooked: 2680, totalCapacity: 4000 },
        { date: "2026-11-13", occupancyPercent: 82.5, seatsBooked: 3300, totalCapacity: 4000 },
        { date: "2026-11-14", occupancyPercent: 88.0, seatsBooked: 3520, totalCapacity: 4000 },
      ],
      weeklyOccupancy: [
        { week: "2026-W43", occupancyPercent: 59.5 },
        { week: "2026-W44", occupancyPercent: 62.1 },
        { week: "2026-W45", occupancyPercent: 64.8 },
        { week: "2026-W46", occupancyPercent: 70.5 },
      ],
      monthlyOccupancy: [
        { month: "2026-08", occupancyPercent: 57.2 },
        { month: "2026-09", occupancyPercent: 60.8 },
        { month: "2026-10", occupancyPercent: 62.4 },
        { month: "2026-11", occupancyPercent: 64.2 },
      ],
      overallOccupancyPercent: 64.2,
      averageHallUtilization: 72.5,
      peakHours: [
        { timeSlot: "18:00 - 21:00", occupancyPercent: 84.5, admissions: 14200, isPeak: true },
        { timeSlot: "21:00 - 00:00", occupancyPercent: 78.2, admissions: 12800, isPeak: true },
      ],
      lowOccupancyPeriods: [
        { timeSlot: "10:00 - 13:00", occupancyPercent: 34.0, admissions: 4200, isPeak: false },
        { timeSlot: "13:00 - 16:00", occupancyPercent: 48.5, admissions: 6800, isPeak: false },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // 3. HALL PERFORMANCE ANALYTICS
  // ----------------------------------------------------------------------------
  public getHallPerformance(theatreId: string, filters: ReportFilterState): HallPerformanceData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    const halls: HallPerformanceData["halls"] = [
      {
        hallId: "hall-1",
        hallName: "Auditorium 1 (IMAX Laser)",
        screenType: "IMAX 4K",
        totalShows: 120,
        bookingsCount: 24200,
        revenue: Math.round(8450000 * multiplier),
        occupancyPercent: 78.5,
        averageUtilization: 86.4,
      },
      {
        hallId: "hall-2",
        hallName: "Auditorium 2 (Dolby Atmos)",
        screenType: "DOLBY_ATMOS",
        totalShows: 112,
        bookingsCount: 16800,
        revenue: Math.round(4850000 * multiplier),
        occupancyPercent: 66.2,
        averageUtilization: 74.0,
      },
      {
        hallId: "hall-3",
        hallName: "Auditorium 3 (Laser Gold)",
        screenType: "LASER_GOLD",
        totalShows: 104,
        bookingsCount: 11900,
        revenue: Math.round(3150000 * multiplier),
        occupancyPercent: 58.4,
        averageUtilization: 68.2,
      },
      {
        hallId: "hall-4",
        hallName: "Auditorium 4 (Standard 7.1)",
        screenType: "STANDARD",
        totalShows: 96,
        bookingsCount: 8600,
        revenue: Math.round(2000000 * multiplier),
        occupancyPercent: 49.0,
        averageUtilization: 61.5,
      },
    ];

    const sorted = [...halls].sort((a, b) => b.revenue - a.revenue);
    const totalRev = halls.reduce((sum, h) => sum + h.revenue, 0);

    return {
      halls,
      topPerformingHall: sorted[0] || null,
      leastPerformingHall: sorted[sorted.length - 1] || null,
      averageHallRevenue: Math.round(totalRev / halls.length),
    };
  }

  // ----------------------------------------------------------------------------
  // 4. MOVIE PERFORMANCE ANALYTICS
  // ----------------------------------------------------------------------------
  public getMoviePerformance(theatreId: string, filters: ReportFilterState): MoviePerformanceData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    const movies: MoviePerformanceData["movies"] = [
      {
        movieId: "mov-opp",
        movieTitle: "Oppenheimer",
        genres: ["Biography", "Drama", "History"],
        bookingsCount: 19300,
        revenue: Math.round(6200000 * multiplier),
        occupancyPercent: 84.2,
        showCount: 114,
        averageAttendancePerShow: 169,
      },
      {
        movieId: "mov-dune2",
        movieTitle: "Dune: Part Two",
        genres: ["Sci-Fi", "Adventure"],
        bookingsCount: 15800,
        revenue: Math.round(4900000 * multiplier),
        occupancyPercent: 76.5,
        showCount: 108,
        averageAttendancePerShow: 146,
      },
      {
        movieId: "mov-stree2",
        movieTitle: "Stree 2",
        genres: ["Comedy", "Horror"],
        bookingsCount: 14200,
        revenue: Math.round(3850000 * multiplier),
        occupancyPercent: 68.9,
        showCount: 98,
        averageAttendancePerShow: 144,
      },
      {
        movieId: "mov-jawan",
        movieTitle: "Jawan",
        genres: ["Action", "Thriller"],
        bookingsCount: 7400,
        revenue: Math.round(2100000 * multiplier),
        occupancyPercent: 54.0,
        showCount: 64,
        averageAttendancePerShow: 115,
      },
      {
        movieId: "mov-kantara",
        movieTitle: "Kantara: Chapter 1",
        genres: ["Action", "Mystery"],
        bookingsCount: 4800,
        revenue: Math.round(1400000 * multiplier),
        occupancyPercent: 49.5,
        showCount: 48,
        averageAttendancePerShow: 100,
      },
    ];

    return {
      movies,
      topMovies: movies.slice(0, 3),
      upcomingMovieTrendsPlaceholder: [
        { movieId: "mov-up-1", movieTitle: "Avatar: Fire and Ash", expectedReleaseDate: "2026-12-18", advanceEnquiriesCount: 2480 },
        { movieId: "mov-up-2", movieTitle: "Avengers: Secret Wars", expectedReleaseDate: "2027-05-07", advanceEnquiriesCount: 3820 },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // 5. BOOKING ANALYTICS AGGREGATES
  // ----------------------------------------------------------------------------
  public getBookingAnalytics(theatreId: string, filters: ReportFilterState): BookingAnalyticsData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    return {
      confirmedBookingsCount: 24500,
      cancelledBookingsCount: 1225,
      cancellationRatePercent: 4.8,
      averageBookingValue: Math.round(753 * multiplier),
      peakBookingHours: [
        { hour: 12, bookingsCount: 2840 },
        { hour: 13, bookingsCount: 3120 },
        { hour: 18, bookingsCount: 4650 },
        { hour: 19, bookingsCount: 4920 },
        { hour: 20, bookingsCount: 4380 },
      ],
      bookingTrends: [
        { date: "2026-11-08", confirmed: 3120, cancelled: 140 },
        { date: "2026-11-09", confirmed: 2980, cancelled: 135 },
        { date: "2026-11-10", confirmed: 3050, cancelled: 152 },
        { date: "2026-11-11", confirmed: 3340, cancelled: 168 },
        { date: "2026-11-12", confirmed: 3560, cancelled: 184 },
        { date: "2026-11-13", confirmed: 4120, cancelled: 215 },
        { date: "2026-11-14", confirmed: 4330, cancelled: 231 },
      ],
      bookingSourcesPlaceholder: [
        { source: "CineSphere Web Portal", bookingsCount: 14210, percentage: 58.0 },
        { source: "Mobile Progressive Web App (PWA)", bookingsCount: 7840, percentage: 32.0 },
        { source: "Box Office Kiosk Counter", bookingsCount: 2450, percentage: 10.0 },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // 6. CUSTOMER ANALYTICS AGGREGATES
  // ----------------------------------------------------------------------------
  public getCustomerAnalytics(theatreId: string, filters: ReportFilterState): CustomerAnalyticsData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    return {
      newCustomersCount: 8400,
      returningCustomersCount: 16100,
      customerReturnRatePercent: 65.7,
      averageCustomerFrequencyPerMonth: 2.4,
      averageCustomerSpend: Math.round(1145 * multiplier),
      customerLifetimeValuePlaceholder: Math.round(6850 * multiplier),
      demographicsPlaceholder: [
        { segment: "Young Adults (18-24)", percentage: 38.0 },
        { segment: "Working Professionals (25-39)", percentage: 44.0 },
        { segment: "Family / Mature (40+)", percentage: 18.0 },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // 7. PAYMENT ANALYTICS AGGREGATES
  // ----------------------------------------------------------------------------
  public getPaymentAnalytics(theatreId: string, filters: ReportFilterState): PaymentAnalyticsData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;
    const baseGross = Math.round(18450000 * multiplier);

    return {
      paymentSuccessRatePercent: 98.6,
      paymentFailuresCount: 340,
      paymentMethodsBreakdown: [
        { method: "UPI (Paytm, PhonePe, GPay)", transactionsCount: 16660, totalVolume: Math.round(baseGross * 0.68), successRatePercent: 99.1 },
        { method: "Credit / Debit Cards", transactionsCount: 5880, totalVolume: Math.round(baseGross * 0.24), successRatePercent: 97.4 },
        { method: "NetBanking Rails", transactionsCount: 1470, totalVolume: Math.round(baseGross * 0.06), successRatePercent: 96.2 },
        { method: "Box Office Cash Desk", transactionsCount: 490, totalVolume: Math.round(baseGross * 0.02), successRatePercent: 100.0 },
      ],
      refundsVolumePlaceholder: Math.round(284000 * multiplier),
      refundsCountPlaceholder: 412,
      settlementStatusPlaceholder: {
        pendingSettlementVolume: Math.round(412000 * multiplier),
        settledVolume: Math.round(baseGross * 0.96),
        lastSettlementDate: "2026-11-14T23:59:59Z",
      },
    };
  }

  // ----------------------------------------------------------------------------
  // 8. THEATRE GROWTH ANALYTICS
  // ----------------------------------------------------------------------------
  public getTheatreGrowth(theatreId: string, filters: ReportFilterState): TheatreGrowthData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    return {
      revenueGrowthMoM: {
        metric: "Revenue Growth",
        currentValue: Math.round(18450000 * multiplier),
        previousValue: Math.round(16150000 * multiplier),
        growthRatePercent: 14.2,
        trend: "UP",
      },
      bookingGrowthMoM: {
        metric: "Booking Growth",
        currentValue: 24500,
        previousValue: 21900,
        growthRatePercent: 11.9,
        trend: "UP",
      },
      occupancyGrowthMoM: {
        metric: "Occupancy Growth",
        currentValue: 64.2,
        previousValue: 59.8,
        growthRatePercent: 4.4,
        trend: "UP",
      },
      customerGrowthMoM: {
        metric: "Patron Growth",
        currentValue: 24500,
        previousValue: 22100,
        growthRatePercent: 10.9,
        trend: "UP",
      },
      historicalTrendComparison: [
        { period: "2026-Q1", revenue: Math.round(42500000 * multiplier), bookings: 61200, occupancyPercent: 58.4 },
        { period: "2026-Q2", revenue: Math.round(48100000 * multiplier), bookings: 68400, occupancyPercent: 61.2 },
        { period: "2026-Q3", revenue: Math.round(51800000 * multiplier), bookings: 73500, occupancyPercent: 63.8 },
        { period: "2026-Q4", revenue: Math.round(55350000 * multiplier), bookings: 78900, occupancyPercent: 66.5 },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // 9. OPERATIONAL KPIS
  // ----------------------------------------------------------------------------
  public getOperationalKpis(theatreId: string, filters: ReportFilterState): OperationalKpiData {
    return {
      totalAdmissions: 61500,
      screenEfficiencyRate: 88.4,
      turnstileThroughputPerHourStub: 480,
      operationalIncidentsCountStub: 2,
      averageIntervalTurnaroundMinutes: 18,
    };
  }

  // ----------------------------------------------------------------------------
  // 10. EXECUTIVE SUMMARY
  // ----------------------------------------------------------------------------
  public getExecutiveSummary(theatreId: string, filters: ReportFilterState): ExecutiveSummaryData {
    const loc = this.getLocalization(theatreId);
    const multiplier = loc.currency === "INR" ? 1 : loc.currency === "USD" ? 0.026 : 0.077;

    return {
      headlineKpis: {
        totalRevenue: Math.round(18450000 * multiplier),
        totalBookings: 24500,
        averageOccupancyPercent: 64.2,
        totalAdmissions: 61500,
        revenueGrowthMoM: 14.2,
      },
      topRevenueDrivers: [
        "IMAX Laser screening of Oppenheimer generated 33.6% of total revenue.",
        "Evening 18:30 shows accounted for 43.1% of all ticket collections.",
        "UPI payment rails drove 68% of transaction volume with a 99.1% success rate.",
      ],
      keyOperationalTakeaways: [
        "Weekend seat occupancy averaged 85.3%, demonstrating strong prime-time demand.",
        "Auditorium 1 (IMAX) led overall yield with 78.5% occupancy and ₹8.45M gross revenue.",
        "Repeat patron retention reached 65.7%, up 4.1% from the previous quarter.",
      ],
      hallRankingSummary: [
        { rank: 1, hallName: "Auditorium 1 (IMAX Laser)", revenueContribution: 45.8 },
        { rank: 2, hallName: "Auditorium 2 (Dolby Atmos)", revenueContribution: 26.3 },
        { rank: 3, hallName: "Auditorium 3 (Laser Gold)", revenueContribution: 17.1 },
        { rank: 4, hallName: "Auditorium 4 (Standard 7.1)", revenueContribution: 10.8 },
      ],
    };
  }

  // ----------------------------------------------------------------------------
  // UNIVERSAL REPORT BUILDER
  // ----------------------------------------------------------------------------
  public buildReport(
    theatreId: string,
    definitionId: string,
    filters: ReportFilterState,
    actor: SecurityActorContext
  ): GeneratedReportPayload {
    const startTime = Date.now();
    this.assertTenantAccess(theatreId, actor);

    const definition = ReportDefinitionRegistry.get(definitionId);
    if (!definition) {
      throw new NotFoundError(`Report definition '${definitionId}' not found in registry.`);
    }

    const loc = this.getLocalization(theatreId);
    const reportId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let summaryCards: GeneratedReportPayload["summaryCards"] = [];
    let chartSeries: GeneratedReportPayload["chartSeries"] = [];
    let detailedTableData: GeneratedReportPayload["detailedTableData"] = [];
    let tableColumns: GeneratedReportPayload["tableColumns"] = [];

    switch (definition.category) {
      case "REVENUE_REPORTS": {
        const rev = this.getRevenueAnalytics(theatreId, filters);
        summaryCards = [
          {
            label: "Total Gross Revenue",
            value: rev.totalGrossRevenue,
            formattedValue: MetricRegistry.format(rev.totalGrossRevenue, "CURRENCY", loc.currency, loc.numberFormat),
            changePercent: 14.2,
            trend: "UP",
          },
          {
            label: "Average Ticket Value (ATV)",
            value: rev.averageTicketValue,
            formattedValue: MetricRegistry.format(rev.averageTicketValue, "CURRENCY", loc.currency, loc.numberFormat),
            changePercent: 2.1,
            trend: "UP",
          },
          {
            label: "RevPAS",
            value: rev.revenuePerAvailableSeat,
            formattedValue: MetricRegistry.format(rev.revenuePerAvailableSeat, "CURRENCY", loc.currency, loc.numberFormat),
            changePercent: 5.4,
            trend: "UP",
          },
          {
            label: "Net Box Office (Post-Tax)",
            value: rev.totalNetRevenue,
            formattedValue: MetricRegistry.format(rev.totalNetRevenue, "CURRENCY", loc.currency, loc.numberFormat),
            changePercent: 14.0,
            trend: "UP",
          },
        ];

        chartSeries = [
          {
            title: "Daily Box Office Revenue",
            chartType: "AREA",
            datapoints: rev.dailyRevenue.map((d) => ({
              dimensionKey: d.date,
              primaryValue: d.revenue,
              secondaryValue: d.tickets,
              formattedPrimary: MetricRegistry.format(d.revenue, "CURRENCY", loc.currency, loc.numberFormat),
              formattedSecondary: `${d.tickets} tix`,
            })),
          },
        ];

        tableColumns = [
          { key: "label", label: "Dimension / Title" },
          { key: "ticketsSold", label: "Tickets Sold", format: "INTEGER" },
          { key: "revenue", label: "Gross Revenue", format: "CURRENCY" },
          { key: "percentageOfTotal", label: "Contribution %", format: "PERCENTAGE" },
        ];
        detailedTableData = rev.revenueByMovie as unknown as Array<Record<string, unknown>>;
        break;
      }

      case "OCCUPANCY_REPORTS": {
        const occ = this.getOccupancyAnalytics(theatreId, filters);
        summaryCards = [
          {
            label: "Overall Seat Occupancy",
            value: occ.overallOccupancyPercent,
            formattedValue: MetricRegistry.format(occ.overallOccupancyPercent, "PERCENTAGE"),
            changePercent: 4.4,
            trend: "UP",
          },
          {
            label: "Hall Utilization Rate",
            value: occ.averageHallUtilization,
            formattedValue: MetricRegistry.format(occ.averageHallUtilization, "PERCENTAGE"),
            changePercent: 1.8,
            trend: "UP",
          },
          {
            label: "Prime Time Occupancy",
            value: occ.peakHours[0]?.occupancyPercent || 84.5,
            formattedValue: MetricRegistry.format(occ.peakHours[0]?.occupancyPercent || 84.5, "PERCENTAGE"),
            changePercent: 3.2,
            trend: "UP",
          },
        ];

        chartSeries = [
          {
            title: "Daily Occupancy Curve",
            chartType: "LINE",
            datapoints: occ.dailyOccupancy.map((d) => ({
              dimensionKey: d.date,
              primaryValue: d.occupancyPercent,
              formattedPrimary: `${d.occupancyPercent.toFixed(1)}%`,
            })),
          },
        ];

        tableColumns = [
          { key: "date", label: "Date" },
          { key: "occupancyPercent", label: "Occupancy %", format: "PERCENTAGE" },
          { key: "seatsBooked", label: "Seats Booked", format: "INTEGER" },
          { key: "totalCapacity", label: "Total Capacity", format: "INTEGER" },
        ];
        detailedTableData = occ.dailyOccupancy;
        break;
      }

      case "HALL_PERFORMANCE": {
        const hall = this.getHallPerformance(theatreId, filters);
        summaryCards = [
          {
            label: "Top Performing Hall",
            value: hall.topPerformingHall?.hallName || "IMAX Laser",
            formattedValue: hall.topPerformingHall?.hallName || "IMAX Laser",
          },
          {
            label: "Average Hall Revenue",
            value: hall.averageHallRevenue,
            formattedValue: MetricRegistry.format(hall.averageHallRevenue, "CURRENCY", loc.currency, loc.numberFormat),
          },
          {
            label: "Screen Utilization",
            value: 72.5,
            formattedValue: "72.5%",
          },
        ];

        chartSeries = [
          {
            title: "Revenue by Hall",
            chartType: "BAR",
            datapoints: hall.halls.map((h) => ({
              dimensionKey: h.hallName,
              primaryValue: h.revenue,
              formattedPrimary: MetricRegistry.format(h.revenue, "CURRENCY", loc.currency, loc.numberFormat),
            })),
          },
        ];

        tableColumns = [
          { key: "hallName", label: "Auditorium Name" },
          { key: "screenType", label: "Screen Type" },
          { key: "totalShows", label: "Total Shows", format: "INTEGER" },
          { key: "bookingsCount", label: "Admissions", format: "INTEGER" },
          { key: "revenue", label: "Revenue", format: "CURRENCY" },
          { key: "occupancyPercent", label: "Occupancy %", format: "PERCENTAGE" },
        ];
        detailedTableData = hall.halls as unknown as Array<Record<string, unknown>>;
        break;
      }

      case "MOVIE_PERFORMANCE": {
        const mov = this.getMoviePerformance(theatreId, filters);
        summaryCards = [
          {
            label: "Top Grossing Film",
            value: mov.topMovies[0]?.movieTitle || "Oppenheimer",
            formattedValue: mov.topMovies[0]?.movieTitle || "Oppenheimer",
          },
          {
            label: "Total Films Exhibited",
            value: mov.movies.length,
            formattedValue: String(mov.movies.length),
          },
          {
            label: "Average Attendance / Show",
            value: 145,
            formattedValue: "145 patrons",
          },
        ];

        chartSeries = [
          {
            title: "Revenue by Film Title",
            chartType: "BAR",
            datapoints: mov.movies.map((m) => ({
              dimensionKey: m.movieTitle,
              primaryValue: m.revenue,
              formattedPrimary: MetricRegistry.format(m.revenue, "CURRENCY", loc.currency, loc.numberFormat),
            })),
          },
        ];

        tableColumns = [
          { key: "movieTitle", label: "Movie Title" },
          { key: "bookingsCount", label: "Tickets Sold", format: "INTEGER" },
          { key: "revenue", label: "Gross Box Office", format: "CURRENCY" },
          { key: "occupancyPercent", label: "Occupancy %", format: "PERCENTAGE" },
          { key: "showCount", label: "Total Shows", format: "INTEGER" },
        ];
        detailedTableData = mov.movies as unknown as Array<Record<string, unknown>>;
        break;
      }

      default: {
        // Fallback to executive summary
        const exec = this.getExecutiveSummary(theatreId, filters);
        summaryCards = [
          {
            label: "Total Gross Box Office",
            value: exec.headlineKpis.totalRevenue,
            formattedValue: MetricRegistry.format(exec.headlineKpis.totalRevenue, "CURRENCY", loc.currency, loc.numberFormat),
            changePercent: 14.2,
            trend: "UP",
          },
          {
            label: "Confirmed Admissions",
            value: exec.headlineKpis.totalAdmissions,
            formattedValue: MetricRegistry.format(exec.headlineKpis.totalAdmissions, "INTEGER", loc.currency, loc.numberFormat),
            changePercent: 11.9,
            trend: "UP",
          },
          {
            label: "Average Occupancy",
            value: exec.headlineKpis.averageOccupancyPercent,
            formattedValue: `${exec.headlineKpis.averageOccupancyPercent}%`,
            changePercent: 4.4,
            trend: "UP",
          },
        ];

        chartSeries = [
          {
            title: "Hall Revenue Contribution",
            chartType: "PIE",
            datapoints: exec.hallRankingSummary.map((h) => ({
              dimensionKey: h.hallName,
              primaryValue: h.revenueContribution,
              formattedPrimary: `${h.revenueContribution}%`,
            })),
          },
        ];

        tableColumns = [
          { key: "rank", label: "Rank", format: "INTEGER" },
          { key: "hallName", label: "Auditorium Fleet" },
          { key: "revenueContribution", label: "Revenue Share %", format: "PERCENTAGE" },
        ];
        detailedTableData = exec.hallRankingSummary;
        break;
      }
    }

    return {
      reportId,
      definitionId: definition.id,
      category: definition.category,
      theatreId,
      theatreName: loc.name,
      reportTitle: definition.title,
      subtitle: definition.description,
      filterState: filters,
      effectiveDateRange: {
        from: filters.startDate || "2026-11-01",
        to: filters.endDate || "2026-11-15",
      },
      localization: {
        currency: loc.currency,
        currencySymbol: loc.currencySymbol,
        timezone: loc.timezone,
        language: loc.language,
        numberFormat: loc.numberFormat,
      },
      summaryCards,
      chartSeries,
      detailedTableData,
      tableColumns,
      generatedAt: new Date().toISOString(),
      generatedByUserId: actor.userId,
      generatedByRole: actor.role,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Generates CSV string export from report payload.
   */
  public exportToCsv(report: GeneratedReportPayload): string {
    const headers = report.tableColumns.map((c) => `"${c.label}"`).join(",");
    const rows = report.detailedTableData.map((row) =>
      report.tableColumns
        .map((col) => {
          const val = row[col.key];
          if (val === undefined || val === null) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    return [
      `"Report: ${report.reportTitle}"`,
      `"Venue: ${report.theatreName} (${report.theatreId})"`,
      `"Generated At: ${report.generatedAt}"`,
      `"Currency: ${report.localization.currency} (${report.localization.currencySymbol})"`,
      "",
      headers,
      ...rows,
    ].join("\n");
  }
}

export const theatreReportsRepository = new TheatreReportsRepository();
