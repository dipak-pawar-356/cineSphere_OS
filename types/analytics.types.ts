/**
 * ==============================================================================
 * CineSphere OS - Reporting, Analytics & Business Intelligence Type Definitions
 * Phase 2 - Part 15
 * 
 * Enterprise Layering Architecture:
 * Operational Data (Bookings, Payments, Shows, Movies, Halls, Customers)
 *         │
 *         ▼
 * Analytics Engine (Formulas, KPIs, Metric Aggregations)
 *         │
 *         ▼
 * Daily / Monthly / Yearly Aggregates
 *         │
 *         ▼
 * Role-Based Dashboards & Configurable Reports
 * ==============================================================================
 */

export type TimeFilterPreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "quarter"
  | "year"
  | "custom";

export interface AnalyticsDateRange {
  from: string; // ISO 8601 or YYYY-MM-DD
  to: string;   // ISO 8601 or YYYY-MM-DD
  preset: TimeFilterPreset;
}

export type AggregatePeriod = "DAILY" | "MONTHLY" | "YEARLY";

export type MetricDimension =
  | "THEATRE"
  | "MOVIE"
  | "HALL"
  | "SECTION"
  | "PAYMENT_METHOD"
  | "TIME_OF_DAY"
  | "DATE"
  | "CUSTOMER"
  | "PLATFORM";

/**
 * Standardized KPI Calculations (Unified Formulas Across the Platform)
 */
export interface StandardKPIs {
  occupancyPercent: number;        // (Booked Seats / Total Available Seats) * 100
  averageTicketPrice: number;      // Total Ticket Revenue / Total Issued Tickets
  averageBookingValue: number;     // Total Revenue / Total Confirmed Bookings
  revenuePerSeat: number;          // Total Revenue / Total Hall Capacity (RevPAS)
  revenuePerShow: number;          // Show Revenue / Number of Shows
  revenuePerHall: number;          // Hall Revenue / Number of Active Halls
  revenuePerMovie: number;         // Movie Box Office / Number of Programmed Movies
  bookingConversionRate: number;   // (Confirmed Bookings / Total Sessions) * 100
  cancellationRate: number;        // (Cancelled Bookings / Total Created Bookings) * 100
  averageSeatsPerBooking: number;  // Total Booked Seats / Total Confirmed Bookings
  customerLifetimeValue: number;   // Total Spend / Unique Customers
}

/**
 * Movie Analytics
 */
export interface MoviePerformanceMetric {
  movieId: string;
  title: string;
  posterUrl?: string;
  format: string; // IMAX Laser, Dolby Cinema, 4DX, Standard 2D
  releaseDate: string;
  bookingsCount: number;
  ticketsSold: number;
  totalRevenue: number;
  occupancyPercent: number;
  averageRatingPlaceholder: number; // e.g. 4.8 / 5.0
  boxOfficeSharePercent: number;
  rank: number;
}

/**
 * Show Analytics
 */
export interface ShowPerformanceMetric {
  showId: string;
  movieTitle: string;
  hallName: string;
  hallFormat: string;
  showTime: string;
  totalCapacity: number;
  bookedSeats: number;
  occupancyPercent: number;
  revenue: number;
  averageTicketPrice: number;
  status: "UPCOMING" | "RUNNING" | "COMPLETED" | "CANCELLED";
}

/**
 * Hall Analytics
 */
export interface HallPerformanceMetric {
  hallId: string;
  name: string;
  format: string;
  capacity: number;
  totalShows: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyPercent: number;
  utilizationRate: number; // Scheduled hours vs available hours
  revPAS: number;          // Revenue Per Available Seat
  isMostUsed: boolean;
  isLeastUsed: boolean;
}

/**
 * Section Analytics
 */
export interface SectionPerformanceMetric {
  sectionType: string; // RECLINER, VIP, PREMIUM, STANDARD
  name: string;
  totalSeats: number;
  bookedSeats: number;
  seatUtilizationPercent: number;
  revenue: number;
  bookingsCount: number;
  averageTicketPrice: number;
  popularitySharePercent: number;
}

/**
 * Booking Analytics & Peak Hours
 */
export interface PeakHourMetric {
  hour: string; // e.g. "09:00", "12:00", "15:00", "18:00", "21:00"
  bookingsCount: number;
  revenue: number;
  occupancyContribution: number;
}

export interface BookingAnalyticsSummary {
  confirmedBookings: number;
  cancelledBookings: number;
  expiredBookings: number;
  totalBookingAttempts: number;
  averageBookingValue: number;
  averageSeatsPerBooking: number;
  conversionRatePercent: number;
  cancellationRatePercent: number;
  peakHours: PeakHourMetric[];
}

/**
 * Payment Analytics
 */
export interface PaymentMethodBreakdown {
  method: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "CASH_POS";
  label: string;
  transactionsCount: number;
  totalRevenue: number;
  sharePercent: number;
}

export interface PaymentAnalyticsSummary {
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalProcessedAmount: number;
  totalRefundedAmount: number;
  successRatePercent: number;
  methods: PaymentMethodBreakdown[];
  gatewayTelemetryPlaceholder: {
    primaryRail: string;
    averageHandshakeLatencyMs: number;
    settlementWindow: string;
  };
}

/**
 * Customer Analytics
 */
export interface CustomerAnalyticsSummary {
  newCustomers: number;
  returningCustomers: number;
  totalUniqueCustomers: number;
  repeatRatioPercent: number;
  bookingsPerCustomer: number;
  averageSpend: number;
  customerLifetimeValuePlaceholder: number;
}

/**
 * Live Metrics (Architecture Placeholders for Future SSE / WebSockets)
 */
export interface LiveMetricsSummary {
  liveBookingsCount: number;
  liveRevenueToday: number;
  liveOccupancyPercent: number;
  activeTurnstiles: number;
  lastRefreshedAt: string;
}

/**
 * Revenue & Occupancy Trend Datapoints for Charts
 */
export interface ChartDatapoint {
  label: string; // Date (e.g. "Mon", "08 Nov", "Nov") or category name
  timestamp?: string;
  value: number;
  secondaryValue?: number;
  percentage?: number;
  meta?: Record<string, unknown>;
}

/**
 * Complete Theatre Admin Dashboard Analytics
 */
export interface TheatreDashboardAnalytics {
  theatreId: string;
  theatreName: string;
  city: string;
  dateRange: AnalyticsDateRange;
  kpis: StandardKPIs;
  cards: {
    todayRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    totalRevenue: number;
    revenueGrowthRate: number; // e.g. +14.2%

    todayBookings: number;
    weeklyBookings: number;
    monthlyBookings: number;
    totalBookings: number;
    bookingGrowthRate: number; // e.g. +11.8%

    averageTicketPrice: number;
    averageOccupancy: number;

    upcomingShows: number;
    completedShows: number;
    cancelledShows: number;
    showsToday: number;
  };
  movies: {
    topMovies: MoviePerformanceMetric[];
    leastPerformingMovies: MoviePerformanceMetric[];
    allMovies: MoviePerformanceMetric[];
  };
  shows: {
    upcomingShowsList: ShowPerformanceMetric[];
    showsTodayCount: number;
    completedShowsCount: number;
    cancelledShowsCount: number;
    averageAttendance: number;
    revenuePerShow: number;
    occupancyPerShow: number;
  };
  halls: {
    hallMetrics: HallPerformanceMetric[];
    mostUsedHall: string;
    leastUsedHall: string;
    averageHallUtilization: number;
  };
  sections: SectionPerformanceMetric[];
  bookings: BookingAnalyticsSummary;
  payments: PaymentAnalyticsSummary;
  customers: CustomerAnalyticsSummary;
  liveTelemetry: LiveMetricsSummary;
  charts: {
    revenueTrend: ChartDatapoint[];
    occupancyTrend: ChartDatapoint[];
    movieShareDonut: ChartDatapoint[];
    hourlyBookingsBar: ChartDatapoint[];
    hallOccupancyComparison: ChartDatapoint[];
  };
}

/**
 * Complete Super Admin Platform Analytics
 */
export interface SuperAdminDashboardAnalytics {
  dateRange: AnalyticsDateRange;
  platformKPIs: StandardKPIs;
  cards: {
    totalTheatres: number;
    activeTheatres: number;
    pendingTheatres: number;
    suspendedTheatres: number;
    totalMovies: number;
    totalShows: number;
    totalBookings: number;
    totalRevenue: number;
    platformGrowthRate: number;
    platformOccupancy: number;
  };
  circuitPerformance: {
    revenueByTheatre: Array<{
      theatreId: string;
      theatreName: string;
      city: string;
      revenue: number;
      bookings: number;
      occupancy: number;
      growthRate: number;
      status: "ACTIVE" | "PENDING" | "SUSPENDED";
    }>;
    topPerformingTheatres: Array<{
      theatreId: string;
      theatreName: string;
      city: string;
      revenue: number;
      rank: number;
    }>;
    fastestGrowingTheatres: Array<{
      theatreId: string;
      theatreName: string;
      growthRate: number;
    }>;
    topCities: Array<{
      city: string;
      theatreCount: number;
      revenue: number;
      marketSharePercent: number;
    }>;
    topPlatformMovies: Array<{
      movieId: string;
      title: string;
      grossRevenue: number;
      totalBookings: number;
      screenCoverage: number;
    }>;
    activeCustomersSummary: {
      totalPatrons: number;
      crossCircuitPatrons: number;
      topPatrons: Array<{
        customerId: string;
        name: string;
        bookingCount: number;
        totalSpent: number;
      }>;
    };
  };
  charts: {
    circuitRevenueTrend: ChartDatapoint[];
    cityDistributionDonut: ChartDatapoint[];
    theatreComparisonBar: ChartDatapoint[];
    platformOccupancyArea: ChartDatapoint[];
  };
}

/**
 * Hierarchical Drill-down Navigation Node
 * Platform -> Theatre -> Hall -> Show -> Booking -> Ticket
 */
export type AnalyticsDrilldownLevel =
  | "PLATFORM"
  | "THEATRE"
  | "HALL"
  | "SHOW"
  | "BOOKING"
  | "TICKET";

export interface AnalyticsDrilldownNode {
  level: AnalyticsDrilldownLevel;
  id: string;
  label: string;
  parentId?: string;
  parentLevel?: AnalyticsDrilldownLevel;
  metrics: {
    revenue: number;
    bookingsCount: number;
    occupancyPercent?: number;
    ticketsCount?: number;
  };
  childrenCount: number;
  navigationUrl: string;
}

/**
 * Configurable Report Engine
 */
export type ReportType =
  | "REVENUE_PERFORMANCE"
  | "OCCUPANCY_UTILIZATION"
  | "MOVIE_BOX_OFFICE"
  | "HALL_CAPACITY"
  | "PAYMENT_RECONCILIATION"
  | "CUSTOMER_DEMOGRAPHICS"
  | "PLATFORM_AUDIT"
  | "CUSTOM";

export interface ConfigurableReportConfig {
  reportName: string;
  reportType: ReportType;
  theatreId?: string; // Optional (null for platform super admin)
  dateRange: AnalyticsDateRange;
  dimensions: MetricDimension[];
  metrics: string[]; // e.g. ["revenue", "bookings", "occupancy", "atp", "abv"]
  filters?: {
    movieId?: string;
    hallId?: string;
    theatreId?: string;
    paymentMethod?: string;
    bookingStatus?: string;
    searchQuery?: string;
  };
}

export interface ReportSnapshot {
  id: string;
  theatreId?: string | null;
  theatreName?: string;
  reportName: string;
  reportType: ReportType;
  dateRange: AnalyticsDateRange;
  filters: Record<string, unknown>;
  metrics: Record<string, number | string>;
  breakdown: Array<Record<string, unknown>>;
  generatedBy?: {
    userId?: string;
    role: string;
  };
  fileSize: string;
  status: "READY" | "PROCESSING" | "ARCHIVED";
  createdAt: string;
}

/**
 * Analytics Audit Log
 */
export type AnalyticsAuditAction =
  | "REPORT_GENERATED"
  | "DASHBOARD_VIEWED"
  | "ANALYTICS_EXPORT_REQUESTED"
  | "AGGREGATE_REFRESHED";

export interface AnalyticsAuditLog {
  id: string;
  action: AnalyticsAuditAction;
  actor: {
    userId?: string;
    role: string;
    theatreId?: string;
    ip?: string;
  };
  details: Record<string, unknown>;
  timestamp: string;
}
