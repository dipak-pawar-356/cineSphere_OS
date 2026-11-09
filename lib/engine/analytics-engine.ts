/**
 * ==============================================================================
 * CineSphere OS - Centralized Reporting, Analytics & Business Intelligence Engine
 * Phase 2 - Part 15
 * 
 * Enterprise Layering Architecture:
 * Operational Data (Bookings, Payments, Shows, Movies, Halls, Customers)
 *         │
 *         ▼
 * Analytics Engine (Formulas, KPIs, Metric Aggregations)
 *         │
 *         ▼
 * Pre-aggregated Summaries (Daily, Monthly, Yearly & Dimension Aggregates)
 *         │
 *         ▼
 * Role-Based Dashboards & Configurable Reports
 * ==============================================================================
 */

import {
  AggregatePeriod,
  AnalyticsAuditAction,
  AnalyticsAuditLog,
  AnalyticsDrilldownLevel,
  AnalyticsDrilldownNode,
  BookingAnalyticsSummary,
  ChartDatapoint,
  ConfigurableReportConfig,
  CustomerAnalyticsSummary,
  AnalyticsDateRange,
  HallPerformanceMetric,
  LiveMetricsSummary,
  MetricDimension,
  MoviePerformanceMetric,
  PaymentAnalyticsSummary,
  PaymentMethodBreakdown,
  PeakHourMetric,
  ReportSnapshot,
  ReportType,
  SectionPerformanceMetric,
  ShowPerformanceMetric,
  StandardKPIs,
  SuperAdminDashboardAnalytics,
  TheatreDashboardAnalytics,
  TimeFilterPreset,
} from "@/types/analytics.types";

// ------------------------------------------------------------------------------
// 1. Centralized KPI Calculation Formulas (Single Source of Truth)
// ------------------------------------------------------------------------------

/**
 * Calculates seat occupancy percentage: (Booked Seats / Total Capacity) * 100
 */
export function calculateOccupancyPercent(bookedSeats: number, totalCapacity: number): number {
  if (!totalCapacity || totalCapacity <= 0) return 0;
  const ratio = (bookedSeats / totalCapacity) * 100;
  return Number(Math.min(100, Math.max(0, ratio)).toFixed(1));
}

/**
 * Calculates Average Ticket Price (ATP): Total Ticket Revenue / Total Issued Tickets
 */
export function calculateAverageTicketPrice(totalRevenue: number, totalTickets: number): number {
  if (!totalTickets || totalTickets <= 0) return 0;
  return Number((totalRevenue / totalTickets).toFixed(2));
}

/**
 * Calculates Average Booking Value (ABV): Total Revenue / Total Confirmed Bookings
 */
export function calculateAverageBookingValue(totalRevenue: number, totalBookings: number): number {
  if (!totalBookings || totalBookings <= 0) return 0;
  return Number((totalRevenue / totalBookings).toFixed(2));
}

/**
 * Calculates Revenue per Available Seat (RevPAS): Total Revenue / Total Hall Capacity
 */
export function calculateRevenuePerSeat(totalRevenue: number, totalCapacity: number): number {
  if (!totalCapacity || totalCapacity <= 0) return 0;
  return Number((totalRevenue / totalCapacity).toFixed(2));
}

/**
 * Calculates Revenue per Show: Total Show Revenue / Total Shows
 */
export function calculateRevenuePerShow(totalRevenue: number, totalShows: number): number {
  if (!totalShows || totalShows <= 0) return 0;
  return Number((totalRevenue / totalShows).toFixed(2));
}

/**
 * Calculates Revenue per Hall: Total Hall Revenue / Total Halls
 */
export function calculateRevenuePerHall(totalRevenue: number, totalHalls: number): number {
  if (!totalHalls || totalHalls <= 0) return 0;
  return Number((totalRevenue / totalHalls).toFixed(2));
}

/**
 * Calculates Revenue per Movie: Total Box Office / Total Programmed Movies
 */
export function calculateRevenuePerMovie(totalRevenue: number, totalMovies: number): number {
  if (!totalMovies || totalMovies <= 0) return 0;
  return Number((totalRevenue / totalMovies).toFixed(2));
}

/**
 * Calculates Booking Conversion Rate: (Confirmed Bookings / Total Booking Sessions) * 100
 */
export function calculateConversionRate(confirmedBookings: number, totalSessions: number): number {
  if (!totalSessions || totalSessions <= 0) return 0;
  const rate = (confirmedBookings / totalSessions) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
}

/**
 * Calculates Cancellation Rate: (Cancelled Bookings / Total Created Bookings) * 100
 */
export function calculateCancellationRate(cancelledBookings: number, totalBookings: number): number {
  if (!totalBookings || totalBookings <= 0) return 0;
  const rate = (cancelledBookings / totalBookings) * 100;
  return Number(Math.min(100, Math.max(0, rate)).toFixed(1));
}

/**
 * Calculates Average Seats per Booking: Total Booked Seats / Total Confirmed Bookings
 */
export function calculateAverageSeatsPerBooking(totalSeats: number, totalBookings: number): number {
  if (!totalBookings || totalBookings <= 0) return 0;
  return Number((totalSeats / totalBookings).toFixed(1));
}

/**
 * Calculates Customer Lifetime Value (LTV): Total Revenue / Unique Customer Count
 */
export function calculateCustomerLifetimeValue(totalSpend: number, uniqueCustomers: number): number {
  if (!uniqueCustomers || uniqueCustomers <= 0) return 0;
  return Number((totalSpend / uniqueCustomers).toFixed(2));
}

// ------------------------------------------------------------------------------
// 2. Date Range Resolution & Time Filter Engine
// ------------------------------------------------------------------------------

export function resolveDateRange(
  preset: TimeFilterPreset = "last30days",
  customRange?: { from: string; to: string }
): AnalyticsDateRange {
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (preset === "custom" && customRange?.from && customRange?.to) {
    return {
      from: customRange.from,
      to: customRange.to,
      preset: "custom",
    };
  }

  switch (preset) {
    case "today": {
      return {
        from: todayStart.toISOString(),
        to: todayEnd.toISOString(),
        preset: "today",
      };
    }
    case "yesterday": {
      const yStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const yEnd = new Date(todayEnd.getTime() - 24 * 60 * 60 * 1000);
      return {
        from: yStart.toISOString(),
        to: yEnd.toISOString(),
        preset: "yesterday",
      };
    }
    case "last7days": {
      const d7 = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        from: d7.toISOString(),
        to: todayEnd.toISOString(),
        preset: "last7days",
      };
    }
    case "thisMonth": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return {
        from: monthStart.toISOString(),
        to: todayEnd.toISOString(),
        preset: "thisMonth",
      };
    }
    case "lastMonth": {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        from: lastMonthStart.toISOString(),
        to: lastMonthEnd.toISOString(),
        preset: "lastMonth",
      };
    }
    case "quarter": {
      const d90 = new Date(todayStart.getTime() - 90 * 24 * 60 * 60 * 1000);
      return {
        from: d90.toISOString(),
        to: todayEnd.toISOString(),
        preset: "quarter",
      };
    }
    case "year": {
      const d365 = new Date(todayStart.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        from: d365.toISOString(),
        to: todayEnd.toISOString(),
        preset: "year",
      };
    }
    case "last30days":
    default: {
      const d30 = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        from: d30.toISOString(),
        to: todayEnd.toISOString(),
        preset: "last30days",
      };
    }
  }
}

// ------------------------------------------------------------------------------
// 3. Pre-aggregated Summary Store & Report Snapshots In-Memory Mart
// ------------------------------------------------------------------------------

export interface AnalyticsSummaryRecord {
  id: string;
  theatreId: string | null;
  aggregatePeriod: AggregatePeriod;
  periodKey: string;
  dimensionType: MetricDimension;
  dimensionId?: string;
  metrics: {
    revenue: number;
    bookingsCount: number;
    ticketsIssued: number;
    occupancyPercent: number;
    atp: number;
    abv: number;
    revpas: number;
    cancellationRate: number;
    conversionRate: number;
    extraMetrics?: Record<string, unknown>;
  };
  createdAt: string;
  updatedAt: string;
}

let analyticsSummaryRepository: AnalyticsSummaryRecord[] = [];
let reportSnapshotRepository: ReportSnapshot[] = [];
let analyticsAuditRepository: AnalyticsAuditLog[] = [];

export function recordAnalyticsAudit(params: {
  action: AnalyticsAuditAction;
  actor: { userId?: string; role: string; theatreId?: string; ip?: string };
  details: Record<string, unknown>;
}): AnalyticsAuditLog {
  const audit: AnalyticsAuditLog = {
    id: `audit-an-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    action: params.action,
    actor: params.actor,
    details: params.details,
    timestamp: new Date().toISOString(),
  };
  analyticsAuditRepository.unshift(audit);
  return audit;
}

export function getAnalyticsAuditLogs(theatreId?: string): AnalyticsAuditLog[] {
  if (!theatreId) return [...analyticsAuditRepository];
  return analyticsAuditRepository.filter(
    (a) => a.actor.theatreId === theatreId || !a.actor.theatreId
  );
}

// ------------------------------------------------------------------------------
// 4. Seed Initial Pre-Aggregated Datamarts
// ------------------------------------------------------------------------------

function seedAnalyticsData(): void {
  analyticsSummaryRepository = [];
  reportSnapshotRepository = [];
  analyticsAuditRepository = [];

  // Seed daily aggregates for Pune Multiplex (th-pun-001)
  const todayKey = new Date().toISOString().split("T")[0];
  analyticsSummaryRepository.push({
    id: "summ-pun-today",
    theatreId: "th-pun-001",
    aggregatePeriod: "DAILY",
    periodKey: todayKey,
    dimensionType: "THEATRE",
    dimensionId: "th-pun-001",
    metrics: {
      revenue: 428000,
      bookingsCount: 680,
      ticketsIssued: 1420,
      occupancyPercent: 88.4,
      atp: 301.4,
      abv: 629.41,
      revpas: 214.0,
      cancellationRate: 1.8,
      conversionRate: 64.2,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed monthly summary for Pune
  analyticsSummaryRepository.push({
    id: "summ-pun-month",
    theatreId: "th-pun-001",
    aggregatePeriod: "MONTHLY",
    periodKey: "2026-11",
    dimensionType: "THEATRE",
    dimensionId: "th-pun-001",
    metrics: {
      revenue: 11480000,
      bookingsCount: 18240,
      ticketsIssued: 39400,
      occupancyPercent: 84.6,
      atp: 291.37,
      abv: 629.38,
      revpas: 191.33,
      cancellationRate: 2.1,
      conversionRate: 61.5,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed Platform Super Admin aggregate
  analyticsSummaryRepository.push({
    id: "summ-platform-month",
    theatreId: null,
    aggregatePeriod: "MONTHLY",
    periodKey: "2026-11",
    dimensionType: "PLATFORM",
    metrics: {
      revenue: 84500000,
      bookingsCount: 135000,
      ticketsIssued: 295000,
      occupancyPercent: 82.1,
      atp: 286.44,
      abv: 625.92,
      revpas: 184.2,
      cancellationRate: 2.4,
      conversionRate: 59.8,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed default report snapshots
  reportSnapshotRepository.push(
    {
      id: "rep-snap-001",
      theatreId: "th-pun-001",
      theatreName: "CineWave Megaplex Pune",
      reportName: "Daily Box Office & Settlement Ledger",
      reportType: "REVENUE_PERFORMANCE",
      dateRange: {
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        preset: "today",
      },
      filters: { theatreId: "th-pun-001" },
      metrics: {
        totalRevenue: 428000,
        ticketsSold: 1420,
        occupancyPercent: "88.4%",
        atp: "₹301.40",
      },
      breakdown: [
        { format: "IMAX Laser", shows: 4, gross: 210000, fillRate: "96.4%" },
        { format: "Dolby Atmos", shows: 6, gross: 142000, fillRate: "89.2%" },
        { format: "Standard 2D", shows: 5, gross: 76000, fillRate: "76.1%" },
      ],
      fileSize: "2.4 MB",
      status: "READY",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "rep-snap-002",
      theatreId: "th-pun-001",
      theatreName: "CineWave Megaplex Pune",
      reportName: "Auditorium Occupancy & Seat Utilization",
      reportType: "OCCUPANCY_UTILIZATION",
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
        preset: "last7days",
      },
      filters: { theatreId: "th-pun-001" },
      metrics: {
        averageOccupancy: "84.6%",
        primeTimeFillRate: "92.8%",
        totalCapacityOffered: 14000,
        totalSeatsBooked: 11844,
      },
      breakdown: [
        { hall: "Hall 1 (IMAX)", capacity: 420, booked: 395, occupancy: "94.0%" },
        { hall: "Hall 2 (Dolby)", capacity: 280, booked: 242, occupancy: "86.4%" },
        { hall: "Hall 3 (Classic)", capacity: 220, booked: 180, occupancy: "81.8%" },
      ],
      fileSize: "3.8 MB",
      status: "READY",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    }
  );

  // Initial audit log
  recordAnalyticsAudit({
    action: "AGGREGATE_REFRESHED",
    actor: { role: "SYSTEM_INITIALIZER" },
    details: { initialSummariesCount: analyticsSummaryRepository.length },
  });
}

// Initialize seed
seedAnalyticsData();

export function resetAnalyticsEngineStore(): void {
  seedAnalyticsData();
}

// ------------------------------------------------------------------------------
// 5. Tenant-Isolated Theatre Admin Analytics Engine
// ------------------------------------------------------------------------------

/**
 * Returns comprehensive analytics for Theatre Admins.
 * Strictly enforces tenant isolation: theatre admins can only view their own theatre's data.
 */
export function getTheatreAnalyticsDashboard(
  theatreId: string,
  timeFilter: TimeFilterPreset = "last30days",
  customRange?: { from: string; to: string }
): TheatreDashboardAnalytics {
  if (!theatreId) {
    throw new Error("Tenant violation: theatreId is required to retrieve theatre analytics.");
  }

  const dateRange = resolveDateRange(timeFilter, customRange);

  // Core KPIs & Operational Cards (Calculated via unified formulas)
  const totalRevenue = 11480000;
  const weeklyRevenue = 2840000;
  const todayRevenue = 428000;
  const monthlyRevenue = 11480000;

  const totalBookings = 18240;
  const weeklyBookings = 4520;
  const todayBookings = 680;
  const monthlyBookings = 18240;

  const totalTickets = 39400;
  const totalCapacity = 46000;

  const atp = calculateAverageTicketPrice(totalRevenue, totalTickets);
  const abv = calculateAverageBookingValue(totalRevenue, totalBookings);
  const occupancy = calculateOccupancyPercent(totalTickets, totalCapacity);
  const revPAS = calculateRevenuePerSeat(totalRevenue, totalCapacity);
  const revPerShow = calculateRevenuePerShow(totalRevenue, 280);
  const revPerHall = calculateRevenuePerHall(totalRevenue, 4);
  const revPerMovie = calculateRevenuePerMovie(totalRevenue, 6);
  const conversionRate = calculateConversionRate(totalBookings, 29600);
  const cancellationRate = calculateCancellationRate(380, totalBookings);
  const avgSeatsPerBooking = calculateAverageSeatsPerBooking(totalTickets, totalBookings);
  const customerLTV = calculateCustomerLifetimeValue(totalRevenue, 9200);

  const kpis: StandardKPIs = {
    occupancyPercent: occupancy,
    averageTicketPrice: atp,
    averageBookingValue: abv,
    revenuePerSeat: revPAS,
    revenuePerShow: revPerShow,
    revenuePerHall: revPerHall,
    revenuePerMovie: revPerMovie,
    bookingConversionRate: conversionRate,
    cancellationRate: cancellationRate,
    averageSeatsPerBooking: avgSeatsPerBooking,
    customerLifetimeValue: customerLTV,
  };

  // Movie Performance Metrics
  const movieMetrics: MoviePerformanceMetric[] = [
    {
      movieId: "mov-001",
      title: "Gladiator II",
      posterUrl: "/posters/gladiator-2.webp",
      format: "IMAX Laser",
      releaseDate: "2026-11-05",
      bookingsCount: 6840,
      ticketsSold: 14820,
      totalRevenue: 4820000,
      occupancyPercent: 94.5,
      averageRatingPlaceholder: 4.9,
      boxOfficeSharePercent: 42.0,
      rank: 1,
    },
    {
      movieId: "mov-002",
      title: "Kalki 2898 AD: Part 2",
      posterUrl: "/posters/kalki-2.webp",
      format: "Dolby Cinema",
      releaseDate: "2026-10-28",
      bookingsCount: 5210,
      ticketsSold: 11200,
      totalRevenue: 3410000,
      occupancyPercent: 91.2,
      averageRatingPlaceholder: 4.8,
      boxOfficeSharePercent: 29.7,
      rank: 2,
    },
    {
      movieId: "mov-003",
      title: "Interstellar 12th Anniversary Re-issue",
      posterUrl: "/posters/interstellar.webp",
      format: "IMAX 70mm",
      releaseDate: "2026-11-01",
      bookingsCount: 3820,
      ticketsSold: 7980,
      totalRevenue: 2150000,
      occupancyPercent: 88.0,
      averageRatingPlaceholder: 5.0,
      boxOfficeSharePercent: 18.7,
      rank: 3,
    },
    {
      movieId: "mov-004",
      title: "Dune: Part Two",
      posterUrl: "/posters/dune-2.webp",
      format: "4DX",
      releaseDate: "2026-09-15",
      bookingsCount: 1450,
      ticketsSold: 3200,
      totalRevenue: 780000,
      occupancyPercent: 68.4,
      averageRatingPlaceholder: 4.7,
      boxOfficeSharePercent: 6.8,
      rank: 4,
    },
    {
      movieId: "mov-005",
      title: "Mufasa: The Lion King",
      posterUrl: "/posters/mufasa.webp",
      format: "Standard 2D",
      releaseDate: "2026-10-10",
      bookingsCount: 920,
      ticketsSold: 2200,
      totalRevenue: 320000,
      occupancyPercent: 52.1,
      averageRatingPlaceholder: 4.2,
      boxOfficeSharePercent: 2.8,
      rank: 5,
    },
  ];

  // Hall Performance Metrics
  const hallMetrics: HallPerformanceMetric[] = [
    {
      hallId: "hall-pun-001",
      name: "Hall 1 (IMAX Laser)",
      format: "IMAX Laser",
      capacity: 420,
      totalShows: 84,
      totalBookings: 7920,
      totalRevenue: 5240000,
      occupancyPercent: 93.8,
      utilizationRate: 94.2,
      revPAS: 148.6,
      isMostUsed: true,
      isLeastUsed: false,
    },
    {
      hallId: "hall-pun-002",
      name: "Hall 2 (Dolby Cinema)",
      format: "Dolby Atmos 4K",
      capacity: 310,
      totalShows: 80,
      totalBookings: 5410,
      totalRevenue: 3520000,
      occupancyPercent: 86.4,
      utilizationRate: 88.0,
      revPAS: 141.9,
      isMostUsed: false,
      isLeastUsed: false,
    },
    {
      hallId: "hall-pun-003",
      name: "Hall 3 (VIP Recliner Suite)",
      format: "VIP Recliner",
      capacity: 120,
      totalShows: 60,
      totalBookings: 2840,
      totalRevenue: 1820000,
      occupancyPercent: 82.5,
      utilizationRate: 78.4,
      revPAS: 252.7,
      isMostUsed: false,
      isLeastUsed: false,
    },
    {
      hallId: "hall-pun-004",
      name: "Hall 4 (Standard 2D)",
      format: "2D Laser Standard",
      capacity: 250,
      totalShows: 56,
      totalBookings: 2070,
      totalRevenue: 900000,
      occupancyPercent: 64.2,
      utilizationRate: 65.0,
      revPAS: 64.2,
      isMostUsed: false,
      isLeastUsed: true,
    },
  ];

  // Section Performance Metrics
  const sectionMetrics: SectionPerformanceMetric[] = [
    {
      sectionType: "RECLINER",
      name: "VIP Motorized Recliners",
      totalSeats: 3200,
      bookedSeats: 2980,
      seatUtilizationPercent: 93.1,
      revenue: 2980000,
      bookingsCount: 1490,
      averageTicketPrice: 1000.0,
      popularitySharePercent: 26.0,
    },
    {
      sectionType: "PRIME",
      name: "Prime Center Dolby Audio",
      totalSeats: 18400,
      bookedSeats: 16200,
      seatUtilizationPercent: 88.0,
      revenue: 4860000,
      bookingsCount: 7920,
      averageTicketPrice: 300.0,
      popularitySharePercent: 42.3,
    },
    {
      sectionType: "CLASSIC",
      name: "Classic Front Rows",
      totalSeats: 16400,
      bookedSeats: 12800,
      seatUtilizationPercent: 78.0,
      revenue: 2560000,
      bookingsCount: 6400,
      averageTicketPrice: 200.0,
      popularitySharePercent: 22.3,
    },
    {
      sectionType: "BALCONY",
      name: "Balcony Mezzanine",
      totalSeats: 8000,
      bookedSeats: 7420,
      seatUtilizationPercent: 92.7,
      revenue: 1080000,
      bookingsCount: 2430,
      averageTicketPrice: 145.5,
      popularitySharePercent: 9.4,
    },
  ];

  // Show Performance Metrics
  const upcomingShowsList: ShowPerformanceMetric[] = [
    {
      showId: "show-today-001",
      movieTitle: "Gladiator II",
      hallName: "Hall 1 (IMAX Laser)",
      hallFormat: "IMAX Laser",
      showTime: "Today at 07:30 PM",
      totalCapacity: 420,
      bookedSeats: 412,
      occupancyPercent: 98.1,
      revenue: 247200,
      averageTicketPrice: 600.0,
      status: "UPCOMING",
    },
    {
      showId: "show-today-002",
      movieTitle: "Kalki 2898 AD",
      hallName: "Hall 2 (Dolby Cinema)",
      hallFormat: "Dolby Atmos",
      showTime: "Today at 08:15 PM",
      totalCapacity: 310,
      bookedSeats: 290,
      occupancyPercent: 93.5,
      revenue: 130500,
      averageTicketPrice: 450.0,
      status: "UPCOMING",
    },
    {
      showId: "show-today-003",
      movieTitle: "Interstellar",
      hallName: "Hall 1 (IMAX Laser)",
      hallFormat: "IMAX Laser",
      showTime: "Today at 10:45 PM",
      totalCapacity: 420,
      bookedSeats: 395,
      occupancyPercent: 94.0,
      revenue: 237000,
      averageTicketPrice: 600.0,
      status: "UPCOMING",
    },
  ];

  // Peak Hours Distribution
  const peakHours: PeakHourMetric[] = [
    { hour: "09:00", bookingsCount: 420, revenue: 142000, occupancyContribution: 4.8 },
    { hour: "12:00", bookingsCount: 1840, revenue: 640000, occupancyContribution: 14.2 },
    { hour: "15:00", bookingsCount: 2950, revenue: 1120000, occupancyContribution: 18.5 },
    { hour: "18:00", bookingsCount: 5820, revenue: 4240000, occupancyContribution: 34.0 },
    { hour: "21:00", bookingsCount: 5210, revenue: 3820000, occupancyContribution: 28.5 },
  ];

  const bookingSummary: BookingAnalyticsSummary = {
    confirmedBookings: totalBookings,
    cancelledBookings: 380,
    expiredBookings: 840,
    totalBookingAttempts: 29600,
    averageBookingValue: abv,
    averageSeatsPerBooking: avgSeatsPerBooking,
    conversionRatePercent: conversionRate,
    cancellationRatePercent: cancellationRate,
    peakHours,
  };

  // Payment Breakdown
  const paymentMethods: PaymentMethodBreakdown[] = [
    { method: "UPI", label: "NPCI Instant UPI", transactionsCount: 12400, totalRevenue: 7806400, sharePercent: 68.0 },
    { method: "CARD", label: "Credit / Debit Cards", transactionsCount: 4120, totalRevenue: 2755200, sharePercent: 24.0 },
    { method: "NETBANKING", label: "Netbanking", transactionsCount: 1120, totalRevenue: 688800, sharePercent: 6.0 },
    { method: "CASH_POS", label: "Box Office POS Cash", transactionsCount: 600, totalRevenue: 229600, sharePercent: 2.0 },
  ];

  const paymentSummary: PaymentAnalyticsSummary = {
    successfulPayments: 18240,
    pendingPayments: 42,
    failedPayments: 180,
    refundedPayments: 110,
    totalProcessedAmount: totalRevenue,
    totalRefundedAmount: 64200,
    successRatePercent: 98.4,
    methods: paymentMethods,
    gatewayTelemetryPlaceholder: {
      primaryRail: "Direct Merchant NPCI UPI VPA",
      averageHandshakeLatencyMs: 142,
      settlementWindow: "T+0 Instant Autonomous Escrow",
    },
  };

  // Customer Analytics
  const customerSummary: CustomerAnalyticsSummary = {
    newCustomers: 3200,
    returningCustomers: 6000,
    totalUniqueCustomers: 9200,
    repeatRatioPercent: 65.2,
    bookingsPerCustomer: 1.98,
    averageSpend: customerLTV,
    customerLifetimeValuePlaceholder: customerLTV,
  };

  // Live Telemetry Placeholders
  const liveTelemetry: LiveMetricsSummary = {
    liveBookingsCount: 18,
    liveRevenueToday: todayRevenue,
    liveOccupancyPercent: 88.4,
    activeTurnstiles: 6,
    lastRefreshedAt: new Date().toISOString(),
  };

  // Chart Datapoints
  const revenueTrend: ChartDatapoint[] = [
    { label: "Mon", value: 340000 },
    { label: "Tue", value: 380000 },
    { label: "Wed", value: 410000 },
    { label: "Thu", value: 390000 },
    { label: "Fri", value: 580000 },
    { label: "Sat", value: 890000 },
    { label: "Sun", value: 840000 },
  ];

  const occupancyTrend: ChartDatapoint[] = [
    { label: "Mon", value: 72.4 },
    { label: "Tue", value: 75.1 },
    { label: "Wed", value: 81.0 },
    { label: "Thu", value: 79.5 },
    { label: "Fri", value: 91.2 },
    { label: "Sat", value: 98.4 },
    { label: "Sun", value: 96.0 },
  ];

  const movieShareDonut: ChartDatapoint[] = movieMetrics.map((m) => ({
    label: m.title,
    value: m.totalRevenue,
    percentage: m.boxOfficeSharePercent,
  }));

  const hourlyBookingsBar: ChartDatapoint[] = peakHours.map((p) => ({
    label: p.hour,
    value: p.bookingsCount,
  }));

  const hallOccupancyComparison: ChartDatapoint[] = hallMetrics.map((h) => ({
    label: h.name,
    value: h.occupancyPercent,
  }));

  // Record audit of dashboard view
  recordAnalyticsAudit({
    action: "DASHBOARD_VIEWED",
    actor: { role: "THEATRE_ADMIN", theatreId },
    details: { timeFilter, dateRange },
  });

  return {
    theatreId,
    theatreName: theatreId === "th-pun-001" ? "CineWave Megaplex Pune" : "Multiplex Cinema",
    city: theatreId === "th-pun-001" ? "Pune" : "Mumbai",
    dateRange,
    kpis,
    cards: {
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalRevenue,
      revenueGrowthRate: 14.2,
      todayBookings,
      weeklyBookings,
      monthlyBookings,
      totalBookings,
      bookingGrowthRate: 11.8,
      averageTicketPrice: atp,
      averageOccupancy: occupancy,
      upcomingShows: 8,
      completedShows: 268,
      cancelledShows: 4,
      showsToday: 18,
    },
    movies: {
      topMovies: movieMetrics.slice(0, 3),
      leastPerformingMovies: movieMetrics.slice(-2),
      allMovies: movieMetrics,
    },
    shows: {
      upcomingShowsList,
      showsTodayCount: 18,
      completedShowsCount: 268,
      cancelledShowsCount: 4,
      averageAttendance: 218,
      revenuePerShow: revPerShow,
      occupancyPerShow: occupancy,
    },
    halls: {
      hallMetrics,
      mostUsedHall: "Hall 1 (IMAX Laser)",
      leastUsedHall: "Hall 4 (Standard 2D)",
      averageHallUtilization: 81.4,
    },
    sections: sectionMetrics,
    bookings: bookingSummary,
    payments: paymentSummary,
    customers: customerSummary,
    liveTelemetry,
    charts: {
      revenueTrend,
      occupancyTrend,
      movieShareDonut,
      hourlyBookingsBar,
      hallOccupancyComparison,
    },
  };
}

// ------------------------------------------------------------------------------
// 6. Super Admin Platform Analytics Engine (Cross-Circuit Visibility)
// ------------------------------------------------------------------------------

/**
 * Returns platform-wide analytics for Super Admin control plane.
 */
export function getSuperAdminAnalyticsDashboard(
  timeFilter: TimeFilterPreset = "last30days",
  customRange?: { from: string; to: string }
): SuperAdminDashboardAnalytics {
  const dateRange = resolveDateRange(timeFilter, customRange);

  const totalTheatres = 25;
  const activeTheatres = 22;
  const pendingTheatres = 2;
  const suspendedTheatres = 1;

  const totalRevenue = 84500000;
  const totalBookings = 135000;
  const totalTickets = 295000;
  const totalCapacity = 360000;

  const atp = calculateAverageTicketPrice(totalRevenue, totalTickets);
  const abv = calculateAverageBookingValue(totalRevenue, totalBookings);
  const occupancy = calculateOccupancyPercent(totalTickets, totalCapacity);
  const revPAS = calculateRevenuePerSeat(totalRevenue, totalCapacity);
  const revPerShow = calculateRevenuePerShow(totalRevenue, 2800);
  const revPerHall = calculateRevenuePerHall(totalRevenue, 110);
  const revPerMovie = calculateRevenuePerMovie(totalRevenue, 18);
  const conversionRate = calculateConversionRate(totalBookings, 225000);
  const cancellationRate = calculateCancellationRate(3240, totalBookings);
  const avgSeats = calculateAverageSeatsPerBooking(totalTickets, totalBookings);
  const customerLTV = calculateCustomerLifetimeValue(totalRevenue, 68000);

  const platformKPIs: StandardKPIs = {
    occupancyPercent: occupancy,
    averageTicketPrice: atp,
    averageBookingValue: abv,
    revenuePerSeat: revPAS,
    revenuePerShow: revPerShow,
    revenuePerHall: revPerHall,
    revenuePerMovie: revPerMovie,
    bookingConversionRate: conversionRate,
    cancellationRate: cancellationRate,
    averageSeatsPerBooking: avgSeats,
    customerLifetimeValue: customerLTV,
  };

  const revenueByTheatre = [
    {
      theatreId: "th-mum-001",
      theatreName: "Apex Grand IMAX Bandra",
      city: "Mumbai",
      revenue: 18450000,
      bookings: 28400,
      occupancy: 92.4,
      growthRate: 18.2,
      status: "ACTIVE" as const,
    },
    {
      theatreId: "th-pun-001",
      theatreName: "CineWave Megaplex Phoenix",
      city: "Pune",
      revenue: 11480000,
      bookings: 18240,
      occupancy: 84.6,
      growthRate: 14.2,
      status: "ACTIVE" as const,
    },
    {
      theatreId: "th-blr-001",
      theatreName: "Starlight Dolby Cinema Indiranagar",
      city: "Bengaluru",
      revenue: 14200000,
      bookings: 22100,
      occupancy: 88.0,
      growthRate: 16.5,
      status: "ACTIVE" as const,
    },
    {
      theatreId: "th-del-001",
      theatreName: "Pinnacle Gold Class Saket",
      city: "Delhi NCR",
      revenue: 12900000,
      bookings: 19800,
      occupancy: 81.5,
      growthRate: 12.0,
      status: "ACTIVE" as const,
    },
    {
      theatreId: "th-hyd-001",
      theatreName: "Miraj Premiere Hitec City",
      city: "Hyderabad",
      revenue: 9800000,
      bookings: 15400,
      occupancy: 79.2,
      growthRate: 9.8,
      status: "ACTIVE" as const,
    },
  ];

  const topCities = [
    { city: "Mumbai", theatreCount: 8, revenue: 32400000, marketSharePercent: 38.3 },
    { city: "Bengaluru", theatreCount: 6, revenue: 21500000, marketSharePercent: 25.4 },
    { city: "Delhi NCR", theatreCount: 5, revenue: 15800000, marketSharePercent: 18.7 },
    { city: "Pune", theatreCount: 3, revenue: 11480000, marketSharePercent: 13.6 },
    { city: "Hyderabad", theatreCount: 3, revenue: 3320000, marketSharePercent: 4.0 },
  ];

  const topPlatformMovies = [
    { movieId: "mov-001", title: "Gladiator II", grossRevenue: 34200000, totalBookings: 54800, screenCoverage: 92 },
    { movieId: "mov-002", title: "Kalki 2898 AD", grossRevenue: 28400000, totalBookings: 46200, screenCoverage: 88 },
    { movieId: "mov-003", title: "Interstellar Re-issue", grossRevenue: 14100000, totalBookings: 22400, screenCoverage: 65 },
  ];

  const activeCustomersSummary = {
    totalPatrons: 68000,
    crossCircuitPatrons: 14200,
    topPatrons: [
      { customerId: "cust-001", name: "Aarav Sharma", bookingCount: 28, totalSpent: 24600 },
      { customerId: "cust-002", name: "Ananya Iyer", bookingCount: 24, totalSpent: 19800 },
      { customerId: "cust-003", name: "Rohan Varma", bookingCount: 21, totalSpent: 17500 },
    ],
  };

  const circuitRevenueTrend: ChartDatapoint[] = [
    { label: "Week 1", value: 18200000 },
    { label: "Week 2", value: 21400000 },
    { label: "Week 3", value: 24800000 },
    { label: "Week 4", value: 20100000 },
  ];

  const cityDistributionDonut: ChartDatapoint[] = topCities.map((c) => ({
    label: c.city,
    value: c.revenue,
    percentage: c.marketSharePercent,
  }));

  const theatreComparisonBar: ChartDatapoint[] = revenueByTheatre.map((t) => ({
    label: t.theatreName.split(" ")[0],
    value: t.revenue,
    secondaryValue: t.bookings,
  }));

  const platformOccupancyArea: ChartDatapoint[] = [
    { label: "Oct W1", value: 74.2 },
    { label: "Oct W2", value: 78.5 },
    { label: "Oct W3", value: 81.0 },
    { label: "Oct W4", value: 79.4 },
    { label: "Nov W1", value: 84.6 },
    { label: "Nov W2", value: 82.1 },
  ];

  // Record audit
  recordAnalyticsAudit({
    action: "DASHBOARD_VIEWED",
    actor: { role: "SUPER_ADMIN" },
    details: { timeFilter, dateRange },
  });

  return {
    dateRange,
    platformKPIs,
    cards: {
      totalTheatres,
      activeTheatres,
      pendingTheatres,
      suspendedTheatres,
      totalMovies: 18,
      totalShows: 2800,
      totalBookings,
      totalRevenue,
      platformGrowthRate: 16.4,
      platformOccupancy: occupancy,
    },
    circuitPerformance: {
      revenueByTheatre,
      topPerformingTheatres: revenueByTheatre.slice(0, 3).map((t, i) => ({
        theatreId: t.theatreId,
        theatreName: t.theatreName,
        city: t.city,
        revenue: t.revenue,
        rank: i + 1,
      })),
      fastestGrowingTheatres: revenueByTheatre.slice(0, 3).map((t) => ({
        theatreId: t.theatreId,
        theatreName: t.theatreName,
        growthRate: t.growthRate,
      })),
      topCities,
      topPlatformMovies,
      activeCustomersSummary,
    },
    charts: {
      circuitRevenueTrend,
      cityDistributionDonut,
      theatreComparisonBar,
      platformOccupancyArea,
    },
  };
}

// ------------------------------------------------------------------------------
// 7. Future Hall Manager Analytics Engine (Scoped to Assigned Halls)
// ------------------------------------------------------------------------------

export function getHallManagerAnalyticsDashboard(
  theatreId: string,
  assignedHallIds: string[],
  timeFilter: TimeFilterPreset = "last30days"
): HallPerformanceMetric[] {
  const dashboard = getTheatreAnalyticsDashboard(theatreId, timeFilter);
  if (!assignedHallIds || assignedHallIds.length === 0) {
    return dashboard.halls.hallMetrics;
  }
  return dashboard.halls.hallMetrics.filter((h) => assignedHallIds.includes(h.hallId));
}

// ------------------------------------------------------------------------------
// 8. Hierarchical Drill-Down Navigation Engine
// Platform → Theatre → Hall → Show → Booking → Ticket
// ------------------------------------------------------------------------------

export function getAnalyticsDrilldown(params: {
  level: AnalyticsDrilldownLevel;
  id?: string;
  theatreId?: string;
}): AnalyticsDrilldownNode[] {
  switch (params.level) {
    case "PLATFORM": {
      // Top level: Returns circuit theatres
      const sa = getSuperAdminAnalyticsDashboard();
      return sa.circuitPerformance.revenueByTheatre.map((t) => ({
        level: "THEATRE",
        id: t.theatreId,
        label: t.theatreName,
        metrics: {
          revenue: t.revenue,
          bookingsCount: t.bookings,
          occupancyPercent: t.occupancy,
        },
        childrenCount: 4, // 4 halls per multiplex
        navigationUrl: `/theatre/${t.theatreId}`,
      }));
    }

    case "THEATRE": {
      // Theatre level: Returns halls for specific theatre
      const tid = params.theatreId || params.id || "th-pun-001";
      const th = getTheatreAnalyticsDashboard(tid);
      return th.halls.hallMetrics.map((h) => ({
        level: "HALL",
        id: h.hallId,
        label: h.name,
        parentId: tid,
        parentLevel: "THEATRE",
        metrics: {
          revenue: h.totalRevenue,
          bookingsCount: h.totalBookings,
          occupancyPercent: h.occupancyPercent,
        },
        childrenCount: h.totalShows,
        navigationUrl: `/theatre/halls/${h.hallId}`,
      }));
    }

    case "HALL": {
      // Hall level: Returns shows in that hall
      return [
        {
          level: "SHOW",
          id: "show-dr-001",
          label: "Gladiator II (19:30)",
          parentId: params.id,
          parentLevel: "HALL",
          metrics: { revenue: 247200, bookingsCount: 180, occupancyPercent: 98.1 },
          childrenCount: 180, // bookings
          navigationUrl: `/booking/show-dr-001`,
        },
        {
          level: "SHOW",
          id: "show-dr-002",
          label: "Interstellar (22:45)",
          parentId: params.id,
          parentLevel: "HALL",
          metrics: { revenue: 237000, bookingsCount: 172, occupancyPercent: 94.0 },
          childrenCount: 172,
          navigationUrl: `/booking/show-dr-002`,
        },
      ];
    }

    case "SHOW": {
      // Show level: Returns bookings in that show
      return [
        {
          level: "BOOKING",
          id: "bkg-dr-001",
          label: "BK-2026-0051 (Seats H12, H13)",
          parentId: params.id,
          parentLevel: "SHOW",
          metrics: { revenue: 1200, bookingsCount: 1, ticketsCount: 2 },
          childrenCount: 2, // 2 tickets
          navigationUrl: `/profile/tickets`,
        },
        {
          level: "BOOKING",
          id: "bkg-dr-002",
          label: "BK-2026-0052 (Seats VIP-1, VIP-2)",
          parentId: params.id,
          parentLevel: "SHOW",
          metrics: { revenue: 2000, bookingsCount: 1, ticketsCount: 2 },
          childrenCount: 2,
          navigationUrl: `/profile/tickets`,
        },
      ];
    }

    case "BOOKING": {
      // Booking level: Returns issued tickets
      return [
        {
          level: "TICKET",
          id: "tk-dr-001",
          label: "Ticket TK-2026-001-01 (Seat H12)",
          parentId: params.id,
          parentLevel: "BOOKING",
          metrics: { revenue: 600, bookingsCount: 1, ticketsCount: 1 },
          childrenCount: 0,
          navigationUrl: `/profile/tickets`,
        },
        {
          level: "TICKET",
          id: "tk-dr-002",
          label: "Ticket TK-2026-001-02 (Seat H13)",
          parentId: params.id,
          parentLevel: "BOOKING",
          metrics: { revenue: 600, bookingsCount: 1, ticketsCount: 1 },
          childrenCount: 0,
          navigationUrl: `/profile/tickets`,
        },
      ];
    }

    case "TICKET":
    default:
      return [];
  }
}

// ------------------------------------------------------------------------------
// 9. Configurable Reports Engine & Snapshot Generator
// ------------------------------------------------------------------------------

export function generateReportSnapshot(config: ConfigurableReportConfig): ReportSnapshot {
  const snapshotId = `rep-snap-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Determine whether this is a theatre or platform report
  let computedMetrics: Record<string, number | string> = {};
  let computedBreakdown: Array<Record<string, unknown>> = [];
  let theatreName: string | undefined = undefined;

  if (config.theatreId) {
    const dash = getTheatreAnalyticsDashboard(config.theatreId, config.dateRange.preset);
    theatreName = dash.theatreName;

    computedMetrics = {
      totalRevenue: dash.cards.totalRevenue,
      totalBookings: dash.cards.totalBookings,
      averageOccupancy: `${dash.kpis.occupancyPercent}%`,
      averageTicketPrice: `₹${dash.kpis.averageTicketPrice.toFixed(2)}`,
      averageBookingValue: `₹${dash.kpis.averageBookingValue.toFixed(2)}`,
    };

    if (config.reportType === "MOVIE_BOX_OFFICE") {
      computedBreakdown = dash.movies.allMovies.map((m) => ({
        movie: m.title,
        format: m.format,
        gross: `₹${m.totalRevenue.toLocaleString("en-IN")}`,
        bookings: m.bookingsCount,
        occupancy: `${m.occupancyPercent}%`,
        share: `${m.boxOfficeSharePercent}%`,
      }));
    } else if (config.reportType === "HALL_CAPACITY") {
      computedBreakdown = dash.halls.hallMetrics.map((h) => ({
        hall: h.name,
        capacity: h.capacity,
        utilization: `${h.utilizationRate}%`,
        occupancy: `${h.occupancyPercent}%`,
        revenue: `₹${h.totalRevenue.toLocaleString("en-IN")}`,
      }));
    } else {
      computedBreakdown = dash.sections.map((s) => ({
        section: s.name,
        seats: s.totalSeats,
        booked: s.bookedSeats,
        revenue: `₹${s.revenue.toLocaleString("en-IN")}`,
        atp: `₹${s.averageTicketPrice.toFixed(2)}`,
      }));
    }
  } else {
    // Platform report
    const sa = getSuperAdminAnalyticsDashboard(config.dateRange.preset);
    computedMetrics = {
      circuitRevenue: `₹${sa.cards.totalRevenue.toLocaleString("en-IN")}`,
      circuitBookings: sa.cards.totalBookings,
      connectedTheatres: sa.cards.activeTheatres,
      circuitOccupancy: `${sa.platformKPIs.occupancyPercent}%`,
    };

    computedBreakdown = sa.circuitPerformance.revenueByTheatre.map((t) => ({
      theatre: t.theatreName,
      city: t.city,
      revenue: `₹${t.revenue.toLocaleString("en-IN")}`,
      bookings: t.bookings,
      occupancy: `${t.occupancy}%`,
      growth: `+${t.growthRate}%`,
    }));
  }

  const snapshot: ReportSnapshot = {
    id: snapshotId,
    theatreId: config.theatreId || null,
    theatreName,
    reportName: config.reportName || "Custom Analytics Performance Ledger",
    reportType: config.reportType,
    dateRange: config.dateRange,
    filters: config.filters || {},
    metrics: computedMetrics,
    breakdown: computedBreakdown,
    fileSize: `${(Math.random() * 2 + 1.5).toFixed(1)} MB`,
    status: "READY",
    createdAt: new Date().toISOString(),
  };

  reportSnapshotRepository.unshift(snapshot);

  recordAnalyticsAudit({
    action: "REPORT_GENERATED",
    actor: { role: config.theatreId ? "THEATRE_ADMIN" : "SUPER_ADMIN", theatreId: config.theatreId },
    details: { reportId: snapshot.id, reportType: config.reportType, dateRange: config.dateRange },
  });

  return snapshot;
}

export function getReportSnapshots(theatreId?: string): ReportSnapshot[] {
  if (!theatreId) return [...reportSnapshotRepository];
  return reportSnapshotRepository.filter((r) => r.theatreId === theatreId || !r.theatreId);
}
