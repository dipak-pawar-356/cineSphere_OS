/**
 * ==============================================================================
 * CineSphere OS — Centralized Metric Registry (Phase 3 – Part 15)
 * ==============================================================================
 * Single source of truth for all business analytics metric definitions, formulas,
 * formatting rules, and benchmark goals. Both dashboards and historical reports
 * reuse this registry to guarantee identical calculations across the platform.
 * ==============================================================================
 */

import {
  MetricCategoryKey,
  MetricDefinition,
  MetricFormatType,
} from "@/types/theatre-reports-analytics.types";

export const METRIC_REGISTRY: Record<string, MetricDefinition> = {
  // ----------------------------------------------------------------------------
  // 1. Revenue Metrics
  // ----------------------------------------------------------------------------
  TOTAL_REVENUE: {
    key: "TOTAL_REVENUE",
    name: "Total Gross Revenue",
    description: "Gross revenue generated across ticket sales, convenience fees, and premiums.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Sum(Gross Ticket Amount + Surcharges)",
    isKpi: true,
  },
  DAILY_REVENUE: {
    key: "DAILY_REVENUE",
    name: "Daily Revenue",
    description: "Revenue collected within a 24-hour business operating day.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Sum(Ticket Sales for Day)",
    isKpi: false,
  },
  WEEKLY_REVENUE: {
    key: "WEEKLY_REVENUE",
    name: "Weekly Revenue",
    description: "Weekly rolling box office earnings (Mon-Sun).",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Sum(Daily Revenue over 7 Days)",
    isKpi: false,
  },
  MONTHLY_REVENUE: {
    key: "MONTHLY_REVENUE",
    name: "Monthly Revenue",
    description: "Calendar month total box office collections.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Sum(Revenue for Calendar Month)",
    isKpi: true,
  },
  YEARLY_REVENUE: {
    key: "YEARLY_REVENUE",
    name: "Yearly Revenue",
    description: "Annual cumulative fiscal year box office collection.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Sum(Revenue for Year)",
    isKpi: true,
  },
  AVERAGE_TICKET_VALUE: {
    key: "AVERAGE_TICKET_VALUE",
    name: "Average Ticket Value (ATV)",
    description: "Average gross revenue generated per admitted patron.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Total Gross Revenue / Total Tickets Sold",
    isKpi: true,
    benchmarkGoal: 320,
  },
  REVENUE_PER_AVAILABLE_SEAT: {
    key: "REVENUE_PER_AVAILABLE_SEAT",
    name: "Revenue Per Available Seat (RevPAS)",
    description: "Yield efficiency metric assessing revenue per capacity seat across scheduled shows.",
    category: "REVENUE",
    format: "CURRENCY",
    formulaDescription: "Total Gross Revenue / Total Scheduled Capacity Seats",
    isKpi: true,
    benchmarkGoal: 150,
  },

  // ----------------------------------------------------------------------------
  // 2. Occupancy Metrics
  // ----------------------------------------------------------------------------
  OCCUPANCY_RATE: {
    key: "OCCUPANCY_RATE",
    name: "Occupancy Rate",
    description: "Percentage of total auditorium seat capacity sold across scheduled shows.",
    category: "OCCUPANCY",
    format: "PERCENTAGE",
    formulaDescription: "(Booked Seats / Total Scheduled Seat Capacity) * 100",
    isKpi: true,
    benchmarkGoal: 65,
  },
  HALL_UTILIZATION: {
    key: "HALL_UTILIZATION",
    name: "Hall Utilization Rate",
    description: "Percentage of daily facility operating hours during which screenings were active.",
    category: "OCCUPANCY",
    format: "PERCENTAGE",
    formulaDescription: "(Active Screening Hours / Total Daily Operating Hours) * 100",
    isKpi: true,
    benchmarkGoal: 75,
  },

  // ----------------------------------------------------------------------------
  // 3. Hall & Movie Performance Metrics
  // ----------------------------------------------------------------------------
  AVERAGE_ATTENDANCE: {
    key: "AVERAGE_ATTENDANCE",
    name: "Average Attendance Per Show",
    description: "Mean headcount of patrons attending each screening session.",
    category: "MOVIE",
    format: "INTEGER",
    formulaDescription: "Total Tickets Sold / Total Shows Scheduled",
    isKpi: true,
    benchmarkGoal: 85,
  },
  SCREEN_EFFICIENCY: {
    key: "SCREEN_EFFICIENCY",
    name: "Screen Efficiency Rate",
    description: "Ratio of high-margin premium screen occupancy compared to standard auditoriums.",
    category: "HALL",
    format: "PERCENTAGE",
    formulaDescription: "(Premium Screen Occupancy / Standard Screen Occupancy) * 100",
    isKpi: false,
  },

  // ----------------------------------------------------------------------------
  // 4. Booking Metrics
  // ----------------------------------------------------------------------------
  CONFIRMED_BOOKINGS: {
    key: "CONFIRMED_BOOKINGS",
    name: "Confirmed Bookings",
    description: "Total successful patron booking orders settled through payment.",
    category: "BOOKING",
    format: "INTEGER",
    formulaDescription: "Count(Bookings where status = CONFIRMED)",
    isKpi: true,
  },
  CANCELLED_BOOKINGS: {
    key: "CANCELLED_BOOKINGS",
    name: "Cancelled Bookings",
    description: "Patron-initiated or administrative booking cancellations.",
    category: "BOOKING",
    format: "INTEGER",
    formulaDescription: "Count(Bookings where status = CANCELLED)",
    isKpi: false,
  },
  CANCELLATION_RATE: {
    key: "CANCELLATION_RATE",
    name: "Cancellation Rate",
    description: "Proportion of bookings cancelled relative to total orders initiated.",
    category: "BOOKING",
    format: "PERCENTAGE",
    formulaDescription: "(Cancelled Bookings / Total Orders) * 100",
    isKpi: true,
    benchmarkGoal: 5,
  },
  AVERAGE_BOOKING_VALUE: {
    key: "AVERAGE_BOOKING_VALUE",
    name: "Average Booking Value",
    description: "Mean checkout financial value across completed reservations.",
    category: "BOOKING",
    format: "CURRENCY",
    formulaDescription: "Total Gross Revenue / Confirmed Bookings Count",
    isKpi: true,
  },

  // ----------------------------------------------------------------------------
  // 5. Customer Metrics
  // ----------------------------------------------------------------------------
  NEW_CUSTOMERS: {
    key: "NEW_CUSTOMERS",
    name: "New Patrons",
    description: "First-time patrons booking at this theatre complex.",
    category: "CUSTOMER",
    format: "INTEGER",
    formulaDescription: "Count(Users with exactly 1 booking in date range)",
    isKpi: true,
  },
  RETURNING_CUSTOMERS: {
    key: "RETURNING_CUSTOMERS",
    name: "Returning Patrons",
    description: "Repeat cinema patrons with 2+ completed reservations.",
    category: "CUSTOMER",
    format: "INTEGER",
    formulaDescription: "Count(Users with > 1 lifetime bookings)",
    isKpi: true,
  },
  CUSTOMER_RETURN_RATE: {
    key: "CUSTOMER_RETURN_RATE",
    name: "Customer Retention Rate",
    description: "Proportion of admissions generated by repeat cinema patrons.",
    category: "CUSTOMER",
    format: "PERCENTAGE",
    formulaDescription: "(Returning Patrons / Total Unique Patrons) * 100",
    isKpi: true,
    benchmarkGoal: 40,
  },
  AVERAGE_CUSTOMER_SPEND: {
    key: "AVERAGE_CUSTOMER_SPEND",
    name: "Average Spend per Customer",
    description: "Mean cumulative expenditure per patron within the analytical window.",
    category: "CUSTOMER",
    format: "CURRENCY",
    formulaDescription: "Total Gross Revenue / Unique Customer Count",
    isKpi: true,
  },

  // ----------------------------------------------------------------------------
  // 6. Payment Metrics
  // ----------------------------------------------------------------------------
  PAYMENT_SUCCESS_RATE: {
    key: "PAYMENT_SUCCESS_RATE",
    name: "Payment Gateway Success Rate",
    description: "Percentage of payment checkout intents successfully captured.",
    category: "PAYMENT",
    format: "PERCENTAGE",
    formulaDescription: "(Successful Payments / Total Payment Attempts) * 100",
    isKpi: true,
    benchmarkGoal: 98,
  },
  PAYMENT_FAILURES: {
    key: "PAYMENT_FAILURES",
    name: "Payment Failures",
    description: "Total payment attempts abandoned, timed out, or rejected by banking rails.",
    category: "PAYMENT",
    format: "INTEGER",
    formulaDescription: "Count(Payment transactions where status = FAILED)",
    isKpi: false,
  },

  // ----------------------------------------------------------------------------
  // 7. Growth & Trend Metrics
  // ----------------------------------------------------------------------------
  REVENUE_GROWTH_MOM: {
    key: "REVENUE_GROWTH_MOM",
    name: "Revenue Growth (MoM)",
    description: "Month-over-month revenue percentage variance.",
    category: "GROWTH",
    format: "PERCENTAGE",
    formulaDescription: "((Current Month Revenue - Previous Month Revenue) / Previous Month Revenue) * 100",
    isKpi: true,
    benchmarkGoal: 10,
  },
  BOOKING_GROWTH_MOM: {
    key: "BOOKING_GROWTH_MOM",
    name: "Booking Growth (MoM)",
    description: "Month-over-month booking count percentage variance.",
    category: "GROWTH",
    format: "PERCENTAGE",
    formulaDescription: "((Current Month Bookings - Previous Month Bookings) / Previous Month Bookings) * 100",
    isKpi: true,
  },
  OCCUPANCY_GROWTH_MOM: {
    key: "OCCUPANCY_GROWTH_MOM",
    name: "Occupancy Growth (MoM)",
    description: "Month-over-month seat occupancy percentage variance.",
    category: "GROWTH",
    format: "PERCENTAGE",
    formulaDescription: "Current Month Occupancy % - Previous Month Occupancy %",
    isKpi: true,
  },
  CUSTOMER_GROWTH_MOM: {
    key: "CUSTOMER_GROWTH_MOM",
    name: "Patron Growth (MoM)",
    description: "Month-over-month active patron base percentage variance.",
    category: "GROWTH",
    format: "PERCENTAGE",
    formulaDescription: "((Current Month Patrons - Previous Month Patrons) / Previous Month Patrons) * 100",
    isKpi: true,
  },
};

export class MetricRegistry {
  /**
   * Retrieves a metric definition by its unique key.
   */
  public static get(key: string): MetricDefinition | undefined {
    return METRIC_REGISTRY[key];
  }

  /**
   * Returns all metric definitions belonging to a specific category.
   */
  public static listByCategory(category: MetricCategoryKey): MetricDefinition[] {
    return Object.values(METRIC_REGISTRY).filter((m) => m.category === category);
  }

  /**
   * Returns all KPI metrics flagged for executive monitoring.
   */
  public static listKpis(): MetricDefinition[] {
    return Object.values(METRIC_REGISTRY).filter((m) => m.isKpi);
  }

  /**
   * Formats a raw numerical metric value into its localized human-readable string.
   */
  public static format(
    value: number,
    format: MetricFormatType,
    currency = "INR",
    numberFormat: "INDIAN" | "INTERNATIONAL" = "INDIAN"
  ): string {
    if (value === undefined || value === null || isNaN(value)) return "—";

    switch (format) {
      case "PERCENTAGE":
        return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

      case "INTEGER":
        return numberFormat === "INDIAN"
          ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)
          : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

      case "DECIMAL":
        return value.toFixed(2);

      case "DURATION_MINUTES":
        return `${Math.round(value)} mins`;

      case "CURRENCY": {
        const symbolMap: Record<string, string> = {
          INR: "₹",
          USD: "$",
          AED: "AED ",
          EUR: "€",
          GBP: "£",
        };
        const symbol = symbolMap[currency] || `${currency} `;

        if (numberFormat === "INDIAN") {
          const formatted = new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: 0,
          }).format(Math.round(value));
          return `${symbol}${formatted}`;
        } else {
          const formatted = new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(Math.round(value));
          return `${symbol}${formatted}`;
        }
      }

      default:
        return String(value);
    }
  }
}
