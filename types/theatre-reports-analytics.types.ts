/**
 * ==============================================================================
 * CineSphere OS — Reports & Analytics Layer Domain Types (Phase 3 – Part 15)
 * ==============================================================================
 * Production-ready typed contracts for dedicated business intelligence and historical
 * reporting, decoupled from the real-time operational dashboard.
 *
 * Provides:
 * 1. Centralized Metric Registry & KPI formulas
 * 2. Configurable Report Definitions across 10 categories
 * 3. Multi-dimensional filtering contracts
 * 4. Dedicated analytical models (Revenue, Occupancy, Hall, Movie, Booking, Customer, Payment, Growth)
 * 5. Multi-tenant reporting isolation & autonomous localization
 * ==============================================================================
 */

import { UserRole } from "@/auth/types/role.types";

// ------------------------------------------------------------------------------
// 1. Report Categories (10 Core BI Categories)
// ------------------------------------------------------------------------------

export type ReportCategoryKey =
  | "REVENUE_REPORTS"
  | "OCCUPANCY_REPORTS"
  | "HALL_PERFORMANCE"
  | "MOVIE_PERFORMANCE"
  | "BOOKING_TRENDS"
  | "CUSTOMER_ANALYTICS"
  | "PAYMENT_ANALYTICS"
  | "THEATRE_GROWTH"
  | "OPERATIONAL_KPIS"
  | "EXECUTIVE_SUMMARY";

// ------------------------------------------------------------------------------
// 2. Centralized Metric Registry Contracts
// ------------------------------------------------------------------------------

export type MetricCategoryKey =
  | "REVENUE"
  | "OCCUPANCY"
  | "HALL"
  | "MOVIE"
  | "BOOKING"
  | "CUSTOMER"
  | "PAYMENT"
  | "GROWTH"
  | "OPERATIONAL";

export type MetricFormatType =
  | "CURRENCY"
  | "PERCENTAGE"
  | "INTEGER"
  | "DECIMAL"
  | "DURATION_MINUTES";

export interface MetricDefinition {
  key: string;
  name: string;
  description: string;
  category: MetricCategoryKey;
  format: MetricFormatType;
  formulaDescription: string;
  isKpi: boolean;
  benchmarkGoal?: number;
}

// ------------------------------------------------------------------------------
// 3. Multi-Dimensional Filter Contracts
// ------------------------------------------------------------------------------

export type ReportDimensionKey =
  | "DATE"
  | "MOVIE"
  | "HALL"
  | "SHOW"
  | "PAYMENT_METHOD"
  | "LANGUAGE"
  | "FORMAT";

export type ReportDateRangePreset =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "CUSTOM";

export interface ReportFilterState {
  dateRangePreset: ReportDateRangePreset;
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string;   // ISO date string (YYYY-MM-DD)
  movieId?: string;
  hallId?: string;
  showId?: string;
  paymentMethod?: string; // UPI, CARD, NETBANKING, CASH
  language?: string;      // English, Hindi, Marathi, Arabic
  format?: string;        // IMAX, 4DX, DOLBY_ATMOS, STANDARD
}

// ------------------------------------------------------------------------------
// 4. Configurable Report Definitions (Template Metadata)
// ------------------------------------------------------------------------------

export type ReportExportFormat = "CSV" | "JSON" | "PDF_PLACEHOLDER";

export interface ReportDefinition {
  id: string;
  category: ReportCategoryKey;
  title: string;
  description: string;
  supportedDimensions: ReportDimensionKey[];
  metrics: string[]; // Keys from Metric Registry
  defaultDatePreset: ReportDateRangePreset;
  requiredRole: UserRole[];
  exportFormats: ReportExportFormat[];
  displayOrder: number;
}

// ------------------------------------------------------------------------------
// 5. Category-Specific Analytical Data Models
// ------------------------------------------------------------------------------

// 5.1 Revenue Analytics
export interface RevenueByDimensionItem {
  id: string;
  label: string;
  revenue: number;
  ticketsSold: number;
  percentageOfTotal: number;
}

export interface RevenueAnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; tickets: number }>;
  weeklyRevenue: Array<{ week: string; revenue: number; tickets: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number; tickets: number }>;
  yearlyRevenue: Array<{ year: string; revenue: number; tickets: number }>;
  revenueByMovie: RevenueByDimensionItem[];
  revenueByHall: RevenueByDimensionItem[];
  revenueByShow: RevenueByDimensionItem[];
  revenueByPaymentMethod: RevenueByDimensionItem[];
  averageTicketValue: number; // ATV
  revenuePerAvailableSeat: number; // RevPAS
  totalGrossRevenue: number;
  totalNetRevenue: number;
}

// 5.2 Occupancy Analytics
export interface OccupancyTimeSlotItem {
  timeSlot: string; // e.g. "10:00-13:00", "18:00-21:00"
  occupancyPercent: number;
  admissions: number;
  isPeak: boolean;
}

export interface OccupancyAnalyticsData {
  dailyOccupancy: Array<{ date: string; occupancyPercent: number; seatsBooked: number; totalCapacity: number }>;
  weeklyOccupancy: Array<{ week: string; occupancyPercent: number }>;
  monthlyOccupancy: Array<{ month: string; occupancyPercent: number }>;
  overallOccupancyPercent: number;
  averageHallUtilization: number;
  peakHours: OccupancyTimeSlotItem[];
  lowOccupancyPeriods: OccupancyTimeSlotItem[];
}

// 5.3 Hall Performance Analytics
export interface HallPerformanceItem {
  hallId: string;
  hallName: string;
  screenType: string;
  totalShows: number;
  bookingsCount: number;
  revenue: number;
  occupancyPercent: number;
  averageUtilization: number;
}

export interface HallPerformanceData {
  halls: HallPerformanceItem[];
  topPerformingHall: HallPerformanceItem | null;
  leastPerformingHall: HallPerformanceItem | null;
  averageHallRevenue: number;
}

// 5.4 Movie Performance Analytics
export interface MoviePerformanceItem {
  movieId: string;
  movieTitle: string;
  genres: string[];
  bookingsCount: number;
  revenue: number;
  occupancyPercent: number;
  showCount: number;
  averageAttendancePerShow: number;
}

export interface MoviePerformanceData {
  movies: MoviePerformanceItem[];
  topMovies: MoviePerformanceItem[];
  upcomingMovieTrendsPlaceholder: Array<{
    movieId: string;
    movieTitle: string;
    expectedReleaseDate: string;
    advanceEnquiriesCount: number;
  }>;
}

// 5.5 Booking Analytics
export interface BookingAnalyticsData {
  confirmedBookingsCount: number;
  cancelledBookingsCount: number;
  cancellationRatePercent: number;
  averageBookingValue: number;
  peakBookingHours: Array<{ hour: number; bookingsCount: number }>;
  bookingTrends: Array<{ date: string; confirmed: number; cancelled: number }>;
  bookingSourcesPlaceholder: Array<{ source: string; bookingsCount: number; percentage: number }>;
}

// 5.6 Customer Analytics
export interface CustomerAnalyticsData {
  newCustomersCount: number;
  returningCustomersCount: number;
  customerReturnRatePercent: number;
  averageCustomerFrequencyPerMonth: number;
  averageCustomerSpend: number;
  customerLifetimeValuePlaceholder: number;
  demographicsPlaceholder: Array<{ segment: string; percentage: number }>;
}

// 5.7 Payment Analytics
export interface PaymentMethodItem {
  method: string;
  transactionsCount: number;
  totalVolume: number;
  successRatePercent: number;
}

export interface PaymentAnalyticsData {
  paymentSuccessRatePercent: number;
  paymentFailuresCount: number;
  paymentMethodsBreakdown: PaymentMethodItem[];
  refundsVolumePlaceholder: number;
  refundsCountPlaceholder: number;
  settlementStatusPlaceholder: {
    pendingSettlementVolume: number;
    settledVolume: number;
    lastSettlementDate: string;
  };
}

// 5.8 Theatre Growth Analytics
export interface GrowthMetricItem {
  metric: string;
  currentValue: number;
  previousValue: number;
  growthRatePercent: number;
  trend: "UP" | "DOWN" | "NEUTRAL";
}

export interface TheatreGrowthData {
  revenueGrowthMoM: GrowthMetricItem;
  bookingGrowthMoM: GrowthMetricItem;
  occupancyGrowthMoM: GrowthMetricItem;
  customerGrowthMoM: GrowthMetricItem;
  historicalTrendComparison: Array<{
    period: string;
    revenue: number;
    bookings: number;
    occupancyPercent: number;
  }>;
}

// 5.9 Operational KPIs
export interface OperationalKpiData {
  totalAdmissions: number;
  screenEfficiencyRate: number;
  turnstileThroughputPerHourStub: number;
  operationalIncidentsCountStub: number;
  averageIntervalTurnaroundMinutes: number;
}

// 5.10 Executive Summary
export interface ExecutiveSummaryData {
  headlineKpis: {
    totalRevenue: number;
    totalBookings: number;
    averageOccupancyPercent: number;
    totalAdmissions: number;
    revenueGrowthMoM: number;
  };
  topRevenueDrivers: string[];
  keyOperationalTakeaways: string[];
  hallRankingSummary: Array<{ rank: number; hallName: string; revenueContribution: number }>;
}

// ------------------------------------------------------------------------------
// 6. Universal Generated Report Output Payload
// ------------------------------------------------------------------------------

export interface ReportSummaryRow {
  label: string;
  value: string | number;
  formattedValue: string;
  changePercent?: number;
  trend?: "UP" | "DOWN" | "NEUTRAL";
}

export interface ReportChartDatapoint {
  dimensionKey: string;
  primaryValue: number;
  secondaryValue?: number;
  formattedPrimary?: string;
  formattedSecondary?: string;
}

export interface ReportChartSeries {
  title: string;
  chartType: "LINE" | "BAR" | "PIE" | "AREA";
  datapoints: ReportChartDatapoint[];
}

export interface GeneratedReportPayload {
  reportId: string;
  definitionId: string;
  category: ReportCategoryKey;
  theatreId: string;
  theatreName: string;
  reportTitle: string;
  subtitle: string;
  filterState: ReportFilterState;
  effectiveDateRange: {
    from: string;
    to: string;
  };
  localization: {
    currency: string;
    currencySymbol: string;
    timezone: string;
    language: string;
    numberFormat: "INDIAN" | "INTERNATIONAL";
  };
  summaryCards: ReportSummaryRow[];
  chartSeries: ReportChartSeries[];
  detailedTableData: Array<Record<string, unknown>>;
  tableColumns: Array<{ key: string; label: string; format?: MetricFormatType }>;
  generatedAt: string;
  generatedByUserId: string;
  generatedByRole: UserRole;
  executionTimeMs: number;
}
