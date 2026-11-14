/**
 * ==============================================================================
 * CineSphere OS — Centralized KPI Calculation Engine (Phase 3 – Part 15)
 * ==============================================================================
 * Reusable mathematical calculation formulas for operational KPIs, yield ratios,
 * box office velocity, occupancy metrics, and growth variances.
 * Both the real-time operational dashboard and historical reports consume these
 * identical formulas to guarantee absolute mathematical parity.
 * ==============================================================================
 */

export class KpiEngine {
  /**
   * Calculates seat occupancy percentage: (Booked Seats / Total Capacity) * 100
   * Clamped between 0% and 100%, rounded to 1 decimal place.
   */
  public static calculateOccupancyPercent(
    bookedSeats: number,
    totalCapacity: number
  ): number {
    if (!totalCapacity || totalCapacity <= 0 || !bookedSeats || bookedSeats <= 0) {
      return 0;
    }
    const ratio = (bookedSeats / totalCapacity) * 100;
    return Number(Math.min(100, Math.max(0, ratio)).toFixed(1));
  }

  /**
   * Calculates Average Ticket Value (ATV): Total Gross Revenue / Total Tickets Sold
   */
  public static calculateAverageTicketValue(
    totalGrossRevenue: number,
    totalTicketsSold: number
  ): number {
    if (!totalTicketsSold || totalTicketsSold <= 0 || !totalGrossRevenue || totalGrossRevenue <= 0) {
      return 0;
    }
    return Number((totalGrossRevenue / totalTicketsSold).toFixed(2));
  }

  /**
   * Calculates Revenue Per Available Seat (RevPAS):
   * Total Gross Revenue / Total Scheduled Seat Capacity
   */
  public static calculateRevPAS(
    totalGrossRevenue: number,
    totalAvailableSeats: number
  ): number {
    if (!totalAvailableSeats || totalAvailableSeats <= 0 || !totalGrossRevenue || totalGrossRevenue <= 0) {
      return 0;
    }
    return Number((totalGrossRevenue / totalAvailableSeats).toFixed(2));
  }

  /**
   * Calculates Hall Utilization Rate:
   * (Active Screening Hours / Total Daily Operating Hours) * 100
   */
  public static calculateHallUtilization(
    activeScreeningHours: number,
    totalOperatingHours: number
  ): number {
    if (!totalOperatingHours || totalOperatingHours <= 0 || !activeScreeningHours || activeScreeningHours <= 0) {
      return 0;
    }
    const ratio = (activeScreeningHours / totalOperatingHours) * 100;
    return Number(Math.min(100, Math.max(0, ratio)).toFixed(1));
  }

  /**
   * Calculates Booking Cancellation Rate:
   * (Cancelled Bookings / Total Orders) * 100
   */
  public static calculateCancellationRate(
    cancelledBookings: number,
    totalBookings: number
  ): number {
    if (!totalBookings || totalBookings <= 0 || !cancelledBookings || cancelledBookings <= 0) {
      return 0;
    }
    const ratio = (cancelledBookings / totalBookings) * 100;
    return Number(Math.min(100, Math.max(0, ratio)).toFixed(1));
  }

  /**
   * Calculates Payment Gateway Success Rate:
   * (Successful Payments / Total Payment Attempts) * 100
   */
  public static calculatePaymentSuccessRate(
    successfulPayments: number,
    totalAttempts: number
  ): number {
    if (!totalAttempts || totalAttempts <= 0) return 0;
    if (!successfulPayments || successfulPayments <= 0) return 0;
    const ratio = (successfulPayments / totalAttempts) * 100;
    return Number(Math.min(100, Math.max(0, ratio)).toFixed(1));
  }

  /**
   * Calculates Month-over-Month (MoM) or Period Growth Rate:
   * ((Current Period - Previous Period) / Previous Period) * 100
   */
  public static calculateGrowthRate(
    currentValue: number,
    previousValue: number
  ): number {
    if (!previousValue || previousValue <= 0) {
      return currentValue > 0 ? 100 : 0;
    }
    const variance = ((currentValue - previousValue) / previousValue) * 100;
    return Number(variance.toFixed(1));
  }

  /**
   * Formats a raw currency value with the appropriate currency symbol and number format.
   */
  public static formatLocalizedCurrency(
    amount: number,
    currency = "INR",
    numberFormat: "INDIAN" | "INTERNATIONAL" = "INDIAN"
  ): string {
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
      }).format(Math.round(amount));
      return `${symbol}${formatted}`;
    } else {
      const formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(amount));
      return `${symbol}${formatted}`;
    }
  }
}
