/**
 * ==============================================================================
 * CineSphere OS — Theatre Dashboard & Analytics Layer Type Definitions (Phase 3 – Part 11)
 * ==============================================================================
 * Strongly typed domain contracts, widget registries, aggregated metric models,
 * user personalization preferences, and query filter definitions.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Time Filters & Widget Categories
// ------------------------------------------------------------------------------
export type DashboardTimeFilterPreset = "TODAY" | "YESTERDAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM";

export type DashboardWidgetCategory = "METRIC" | "STATUS" | "SUMMARY" | "ALERT" | "FEED" | "ACTION";

export type DashboardActivityType =
  | "NEW_BOOKING"
  | "PAYMENT_RECEIVED"
  | "SHOW_STARTED"
  | "SHOW_COMPLETED"
  | "MAINTENANCE_ALERT"
  | "SYSTEM_ALERT"
  | "STAFF_DUTY";

export type ActivitySeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

// ------------------------------------------------------------------------------
// Widget Registry Contracts
// ------------------------------------------------------------------------------
export interface DashboardWidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: DashboardWidgetCategory;
  requiredPermissions: string[];
  defaultSize: "sm" | "md" | "lg" | "full";
  defaultOrder: number;
  isConfigurable: boolean;
}

// ------------------------------------------------------------------------------
// User Dashboard Preferences (Decoupled Personalization)
// ------------------------------------------------------------------------------
export interface UserDashboardPreferences {
  userId: string;
  theatreId: string;
  visibleWidgetIds: string[];
  widgetOrder: string[];
  collapsedWidgetIds: string[];
  favoriteWidgetIds: string[];
  defaultDatePreset: DashboardTimeFilterPreset;
  updatedAt: Date;
}

export interface UpdateUserDashboardPreferencesInput {
  theatreId: string;
  userId?: string;
  visibleWidgetIds?: string[];
  widgetOrder?: string[];
  collapsedWidgetIds?: string[];
  favoriteWidgetIds?: string[];
  defaultDatePreset?: DashboardTimeFilterPreset;
}

// ------------------------------------------------------------------------------
// Query & Dimension Filters
// ------------------------------------------------------------------------------
export interface DashboardFilterInput {
  theatreId: string;
  periodPreset: DashboardTimeFilterPreset;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  hallId?: string;
  movieId?: string;
  showId?: string;
}

// ------------------------------------------------------------------------------
// Domain Metric Bundles
// ------------------------------------------------------------------------------

export interface RevenueByPaymentMethodItem {
  method: string;
  amount: number;
  percentage: number;
  label: string;
}

export interface RevenueTrendItem {
  label: string;
  amount: number;
  bookingsCount: number;
}

export interface RevenueMetricsBundle {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueGrowthPercent: number; // e.g. +11.1%
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageTicketValue: number;
  revenueByPaymentMethod: RevenueByPaymentMethodItem[];
  revenueTrend: RevenueTrendItem[];
}

export interface BookingTrendItem {
  label: string;
  count: number;
}

export interface BookingMetricsBundle {
  todayBookings: number;
  yesterdayBookings: number;
  bookingGrowthPercent: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  todayTicketsSold: number;
  todayCustomersCount: number;
  averageBookingValue: number;
  bookingTrend: BookingTrendItem[];
}

export interface ShowStartingSoonItem {
  id: string;
  movieTitle: string;
  hallName: string;
  hallId: string;
  format: string;
  startTime: string; // "14:30"
  totalSeats: number;
  bookedSeats: number;
  occupancyPercent: number;
  minutesUntilStart: number;
}

export interface ShowSummaryItem {
  id: string;
  movieTitle: string;
  hallName: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "RUNNING" | "COMPLETED" | "CANCELLED";
  bookedSeats: number;
  totalCapacity: number;
  revenue: number;
}

export interface ShowMetricsBundle {
  runningShowsCount: number;
  upcomingShowsCount: number;
  completedShowsCount: number;
  cancelledShowsCount: number;
  totalShowsCount: number;
  showsStartingSoon: ShowStartingSoonItem[];
  showsSummary: ShowSummaryItem[];
}

export interface HallSummaryItem {
  id: string;
  name: string;
  hallType: string;
  totalCapacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "INACTIVE";
  currentShowTitle?: string;
  currentShowStart?: string;
  currentShowEnd?: string;
  maintenanceReason?: string;
}

export interface HallMetricsBundle {
  totalHalls: number;
  availableHalls: number;
  occupiedHalls: number;
  maintenanceHalls: number;
  inactiveHalls: number;
  seatUtilizationPercent: number;
  hallsSummary: HallSummaryItem[];
}

export interface OccupancyMetricsBundle {
  currentOccupancyPercent: number;
  dailyOccupancyPercent: number;
  weeklyOccupancyPercent: number;
  monthlyOccupancyPercent: number;
  peakOccupancyHour: string; // e.g. "20:00"
  peakOccupancyPercent: number;
}

export interface PaymentMetricsBundle {
  completedPaymentsCount: number;
  completedPaymentsAmount: number;
  pendingPaymentsCount: number;
  pendingPaymentsAmount: number;
  failedPaymentsCount: number;
  failedPaymentsAmount: number;
  refundsCount: number;
  refundsAmount: number;
}

export interface SystemHealthMetric {
  status: "OPTIMAL" | "DEGRADED" | "CRITICAL";
  latencyMs: number;
  servicesHealthy: boolean;
  databaseConnected: boolean;
  cacheConnected: boolean;
}

export interface OperationalAlertsBundle {
  newBookingsCount: number;
  paymentUpdatesCount: number;
  showUpdatesCount: number;
  systemAlertsCount: number;
  maintenanceAlertsCount: number;
  staffAlertsCount: number;
  staffOnlineCount: number;
  systemHealth: SystemHealthMetric;
}

export interface DashboardActivityItem {
  id: string;
  theatreId: string;
  activityType: DashboardActivityType;
  title: string;
  description: string;
  severity: ActivitySeverity;
  timestamp: string; // ISO
  metadata?: Record<string, unknown>;
}

// ------------------------------------------------------------------------------
// Combined Aggregated Dashboard Bundle
// ------------------------------------------------------------------------------
export interface TheatreDashboardBundle {
  theatreId: string;
  theatreName: string;
  theatreCode: string;
  currency: string;
  currencySymbol: string;
  numberFormat: "INDIAN" | "INTERNATIONAL";
  timezone: string;
  timeFormat: "12H" | "24H";
  filter: DashboardFilterInput;
  revenue: RevenueMetricsBundle;
  bookings: BookingMetricsBundle;
  shows: ShowMetricsBundle;
  halls: HallMetricsBundle;
  occupancy: OccupancyMetricsBundle;
  payments: PaymentMetricsBundle;
  alerts: OperationalAlertsBundle;
  activities: DashboardActivityItem[];
  availableFilters: {
    halls: { id: string; name: string }[];
    movies: { id: string; title: string }[];
    shows: { id: string; title: string; time: string }[];
  };
  userPreferences: UserDashboardPreferences;
  registeredWidgets: DashboardWidgetDefinition[];
  lastUpdated: string; // ISO
}
