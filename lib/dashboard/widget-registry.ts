/**
 * ==============================================================================
 * CineSphere OS — Dashboard Widget Registry (Phase 3 – Part 11)
 * ==============================================================================
 * Metadata-driven widget registry decoupling dashboard components from the page.
 * Supports granular RBAC permission gating, size classification, categories,
 * and user-level preference personalization.
 * ==============================================================================
 */

import {
  DashboardWidgetDefinition,
  UserDashboardPreferences,
} from "@/types/theatre-dashboard.types";

export const DASHBOARD_WIDGET_REGISTRY: DashboardWidgetDefinition[] = [
  {
    id: "widget-revenue-metric",
    title: "Revenue Overview",
    description: "Today's gross revenue, yesterday comparison, and growth percentage.",
    category: "METRIC",
    requiredPermissions: ["reports:read", "dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 1,
    isConfigurable: true,
  },
  {
    id: "widget-booking-metric",
    title: "Booking Quotas",
    description: "Today's bookings, total tickets issued, and unique customer volume.",
    category: "METRIC",
    requiredPermissions: ["bookings:read", "dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 2,
    isConfigurable: true,
  },
  {
    id: "widget-occupancy-metric",
    title: "Auditorium Occupancy",
    description: "Real-time seat occupancy percentage across active and daily screenings.",
    category: "METRIC",
    requiredPermissions: ["shows:read", "reports:read", "dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 3,
    isConfigurable: true,
  },
  {
    id: "widget-halls-status",
    title: "Hall Status Summary",
    description: "Live operational status of screens (Available, Running, Maintenance, Inactive).",
    category: "STATUS",
    requiredPermissions: ["halls:read", "dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 4,
    isConfigurable: true,
  },
  {
    id: "widget-shows-overview",
    title: "Live Shows & Starting Soon",
    description: "Active running screenings, upcoming timetable, and urgent 30-minute start alerts.",
    category: "SUMMARY",
    requiredPermissions: ["shows:read", "dashboard:read"],
    defaultSize: "lg",
    defaultOrder: 5,
    isConfigurable: true,
  },
  {
    id: "widget-payments-overview",
    title: "Payment Settlements",
    description: "Completed, pending, and failed payment transaction reconciliation by rail.",
    category: "SUMMARY",
    requiredPermissions: ["payments:read", "dashboard:read"],
    defaultSize: "md",
    defaultOrder: 6,
    isConfigurable: true,
  },
  {
    id: "widget-operational-alerts",
    title: "Operational Alerts",
    description: "Real-time alerts for booking spikes, hardware maintenance, and ticket issues.",
    category: "ALERT",
    requiredPermissions: ["dashboard:read"],
    defaultSize: "md",
    defaultOrder: 7,
    isConfigurable: true,
  },
  {
    id: "widget-activity-feed",
    title: "Activity Stream",
    description: "Chronological operational activity audit feed of venue operations.",
    category: "FEED",
    requiredPermissions: ["dashboard:read"],
    defaultSize: "md",
    defaultOrder: 8,
    isConfigurable: true,
  },
  {
    id: "widget-quick-actions",
    title: "Quick Actions",
    description: "Operator shortcuts to schedule shows, calibrate screens, manage crew, and adjust settings.",
    category: "ACTION",
    requiredPermissions: ["dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 9,
    isConfigurable: true,
  },
  {
    id: "widget-system-health",
    title: "System Health & Telemetry",
    description: "Edge connectivity, database query response latency, and service status.",
    category: "STATUS",
    requiredPermissions: ["settings:read", "dashboard:read"],
    defaultSize: "sm",
    defaultOrder: 10,
    isConfigurable: true,
  },
];

/**
 * Returns all registered widget definitions.
 */
export function getRegisteredWidgets(): DashboardWidgetDefinition[] {
  return [...DASHBOARD_WIDGET_REGISTRY];
}

/**
 * Filters registered widgets according to the actor's RBAC role and capability permissions.
 */
export function getPermittedWidgets(
  userPermissions: string[] = [],
  userRole: string = "THEATRE_ADMIN"
): DashboardWidgetDefinition[] {
  if (userRole === "SUPER_ADMIN") {
    return [...DASHBOARD_WIDGET_REGISTRY];
  }

  const hasWildcard = userPermissions.includes("*");
  if (hasWildcard) {
    return [...DASHBOARD_WIDGET_REGISTRY];
  }

  const permSet = new Set(userPermissions);

  return DASHBOARD_WIDGET_REGISTRY.filter((widget) => {
    return widget.requiredPermissions.every((perm) => permSet.has(perm));
  });
}

/**
 * Generates default user dashboard preferences for a specific theatre.
 */
export function getDefaultPreferences(
  theatreId: string,
  userId: string = "usr-operator"
): UserDashboardPreferences {
  const allIds = DASHBOARD_WIDGET_REGISTRY.map((w) => w.id);
  return {
    userId,
    theatreId,
    visibleWidgetIds: allIds,
    widgetOrder: allIds,
    collapsedWidgetIds: [],
    favoriteWidgetIds: ["widget-revenue-metric", "widget-booking-metric", "widget-occupancy-metric"],
    defaultDatePreset: "TODAY",
    updatedAt: new Date(),
  };
}
