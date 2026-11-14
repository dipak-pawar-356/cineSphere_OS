/**
 * ==============================================================================
 * CineSphere OS — Configurable Report Definitions Registry (Phase 3 – Part 15)
 * ==============================================================================
 * Metadata-driven report templates decoupling report configuration, dimensions,
 * metrics, and RBAC permissions from the presentation UI layer.
 * ==============================================================================
 */

import {
  ReportCategoryKey,
  ReportDefinition,
} from "@/types/theatre-reports-analytics.types";
import { UserRole } from "@/auth/types/role.types";

export const REPORT_DEFINITIONS: Record<string, ReportDefinition> = {
  // 1. Revenue Reports
  DEF_REVENUE_PERFORMANCE: {
    id: "DEF_REVENUE_PERFORMANCE",
    category: "REVENUE_REPORTS",
    title: "Comprehensive Box Office & Revenue Breakdown",
    description: "Detailed box office revenue aggregated across daily, weekly, and monthly periods by movie, hall, and payment rail.",
    supportedDimensions: ["DATE", "MOVIE", "HALL", "SHOW", "PAYMENT_METHOD"],
    metrics: ["TOTAL_REVENUE", "DAILY_REVENUE", "WEEKLY_REVENUE", "MONTHLY_REVENUE", "AVERAGE_TICKET_VALUE", "REVENUE_PER_AVAILABLE_SEAT"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 1,
  },

  // 2. Occupancy Reports
  DEF_OCCUPANCY_ANALYSIS: {
    id: "DEF_OCCUPANCY_ANALYSIS",
    category: "OCCUPANCY_REPORTS",
    title: "Auditorium Seat Occupancy & Capacity Audit",
    description: "Temporal seat utilization trends, peak vs low occupancy time slots, and yield analysis per screening session.",
    supportedDimensions: ["DATE", "HALL", "SHOW", "FORMAT"],
    metrics: ["OCCUPANCY_RATE", "HALL_UTILIZATION", "AVERAGE_ATTENDANCE"],
    defaultDatePreset: "THIS_WEEK",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    exportFormats: ["CSV", "JSON"],
    displayOrder: 2,
  },

  // 3. Hall Performance
  DEF_HALL_PERFORMANCE: {
    id: "DEF_HALL_PERFORMANCE",
    category: "HALL_PERFORMANCE",
    title: "Auditorium Fleet Yield & Screen Utilization",
    description: "Comparative hall metrics evaluating gross box office, occupancy %, screening hours, and top vs least performing screens.",
    supportedDimensions: ["HALL", "FORMAT", "DATE"],
    metrics: ["TOTAL_REVENUE", "OCCUPANCY_RATE", "HALL_UTILIZATION", "SCREEN_EFFICIENCY"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 3,
  },

  // 4. Movie Performance
  DEF_MOVIE_PERFORMANCE: {
    id: "DEF_MOVIE_PERFORMANCE",
    category: "MOVIE_PERFORMANCE",
    title: "Film Exhibition Box Office & Attendance Matrix",
    description: "Exhibition lifecycle performance curves, admissions count, run duration, and genre revenue breakdowns.",
    supportedDimensions: ["MOVIE", "LANGUAGE", "FORMAT", "DATE"],
    metrics: ["TOTAL_REVENUE", "CONFIRMED_BOOKINGS", "OCCUPANCY_RATE", "AVERAGE_ATTENDANCE"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 4,
  },

  // 5. Booking Trends
  DEF_BOOKING_TRENDS: {
    id: "DEF_BOOKING_TRENDS",
    category: "BOOKING_TRENDS",
    title: "Booking Velocity & Cancellation Curves",
    description: "Volume velocity analysis, confirmed vs cancelled reservations, and hourly booking demand curves.",
    supportedDimensions: ["DATE", "SHOW"],
    metrics: ["CONFIRMED_BOOKINGS", "CANCELLED_BOOKINGS", "CANCELLATION_RATE", "AVERAGE_BOOKING_VALUE"],
    defaultDatePreset: "THIS_WEEK",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER"],
    exportFormats: ["CSV", "JSON"],
    displayOrder: 5,
  },

  // 6. Customer Analytics
  DEF_CUSTOMER_ANALYTICS: {
    id: "DEF_CUSTOMER_ANALYTICS",
    category: "CUSTOMER_ANALYTICS",
    title: "Patron Retention, Frequency & Spend Profiles",
    description: "Customer cohort dynamics, first-time vs repeat patron distribution, average basket spend, and frequency curves.",
    supportedDimensions: ["DATE"],
    metrics: ["NEW_CUSTOMERS", "RETURNING_CUSTOMERS", "CUSTOMER_RETURN_RATE", "AVERAGE_CUSTOMER_SPEND"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    exportFormats: ["CSV", "JSON"],
    displayOrder: 6,
  },

  // 7. Payment Analytics
  DEF_PAYMENT_ANALYTICS: {
    id: "DEF_PAYMENT_ANALYTICS",
    category: "PAYMENT_ANALYTICS",
    title: "Payment Gateway Settlements & Rail Reconciliation",
    description: "Payment channel volume split (UPI, Cards, NetBanking, Cash), success vs failure rates, and settlement readiness.",
    supportedDimensions: ["PAYMENT_METHOD", "DATE"],
    metrics: ["TOTAL_REVENUE", "PAYMENT_SUCCESS_RATE", "PAYMENT_FAILURES"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 7,
  },

  // 8. Theatre Growth Analytics
  DEF_THEATRE_GROWTH: {
    id: "DEF_THEATRE_GROWTH",
    category: "THEATRE_GROWTH",
    title: "Theatre MoM Growth & Expansion Telemetry",
    description: "Month-over-month box office growth rate, patron acquisition rate, and multi-year seasonal comparisons.",
    supportedDimensions: ["DATE"],
    metrics: ["REVENUE_GROWTH_MOM", "BOOKING_GROWTH_MOM", "OCCUPANCY_GROWTH_MOM", "CUSTOMER_GROWTH_MOM"],
    defaultDatePreset: "THIS_YEAR",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 8,
  },

  // 9. Operational KPIs
  DEF_OPERATIONAL_KPIS: {
    id: "DEF_OPERATIONAL_KPIS",
    category: "OPERATIONAL_KPIS",
    title: "Daily Operational Efficiency & Screen Productivity",
    description: "Auditorium turnaround efficiency, admissions count, and turnstile throughput performance metrics.",
    supportedDimensions: ["HALL", "DATE"],
    metrics: ["AVERAGE_ATTENDANCE", "HALL_UTILIZATION", "SCREEN_EFFICIENCY"],
    defaultDatePreset: "TODAY",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN", "HALL_MANAGER", "STAFF"],
    exportFormats: ["CSV", "JSON"],
    displayOrder: 9,
  },

  // 10. Executive Summary
  DEF_EXECUTIVE_SUMMARY: {
    id: "DEF_EXECUTIVE_SUMMARY",
    category: "EXECUTIVE_SUMMARY",
    title: "Executive Board Briefing & High-Level Scorecard",
    description: "Consolidated executive overview summarizing top revenue drivers, key operational highlights, and ranking scorecards.",
    supportedDimensions: ["DATE", "MOVIE", "HALL"],
    metrics: ["TOTAL_REVENUE", "CONFIRMED_BOOKINGS", "OCCUPANCY_RATE", "REVENUE_GROWTH_MOM", "AVERAGE_TICKET_VALUE"],
    defaultDatePreset: "THIS_MONTH",
    requiredRole: ["SUPER_ADMIN", "THEATRE_ADMIN"],
    exportFormats: ["CSV", "JSON", "PDF_PLACEHOLDER"],
    displayOrder: 10,
  },
};

export class ReportDefinitionRegistry {
  public static get(id: string): ReportDefinition | undefined {
    return REPORT_DEFINITIONS[id];
  }

  public static getByCategory(category: ReportCategoryKey): ReportDefinition | undefined {
    return Object.values(REPORT_DEFINITIONS).find((def) => def.category === category);
  }

  public static list(role?: UserRole): ReportDefinition[] {
    const all = Object.values(REPORT_DEFINITIONS).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    if (!role) return all;
    return all.filter((def) => def.requiredRole.includes(role));
  }
}
