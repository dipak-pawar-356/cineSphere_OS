/**
 * CineSphere OS — Mock Pure Formatting Utilities
 * Deterministic formatting helpers for INR currency, numbers, and dates.
 */

import { MOCK_CONFIG } from "./mock-constants";

/**
 * Format currency with Indian rupee symbol (e.g. ₹4,85,250 or ₹8.6 Cr)
 */
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
  }

  return new Intl.NumberFormat(MOCK_CONFIG.locale, {
    style: "currency",
    currency: MOCK_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format standard number with Indian thousands grouping
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(MOCK_CONFIG.locale).format(value);
}

/**
 * Format percentage with + / - sign
 */
export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get status badge color variant
 */
export function getStatusBadgeVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "secondary" {
  switch (status.toLowerCase()) {
    case "active":
    case "confirmed":
    case "checked-in":
    case "operational":
    case "paid":
    case "success":
    case "resolved":
      return "success";
    case "pending":
    case "in progress":
    case "running":
    case "upcoming":
      return "warning";
    case "cancelled":
    case "failed":
    case "outage":
    case "high":
    case "urgent":
      return "danger";
    case "vip":
    case "now showing":
      return "info";
    default:
      return "secondary";
  }
}
