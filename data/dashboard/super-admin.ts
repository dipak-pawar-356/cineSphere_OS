import { MetricCardData, PendingApproval, SystemStat } from "@/types";

export interface SuperAdminDashboardData {
  metrics: MetricCardData[];
  pendingApprovals: PendingApproval[];
  quickStats: SystemStat[];
}

export const SUPER_ADMIN_DASHBOARD: SuperAdminDashboardData = {
  metrics: [
    {
      title: "Network Gross Revenue",
      value: "₹8.64 Cr",
      change: "+18.4%",
      isPositive: true,
      description: "Platform total across all active cinema chains",
      iconName: "TrendingUp",
    },
    {
      title: "Active Multiplexes",
      value: "25 Venues",
      change: "+3 Pending",
      isPositive: true,
      description: "Operating in 12 major metropolitan markets",
      iconName: "Building2",
    },
    {
      title: "Daily Admissions",
      value: "42,850",
      change: "+14.2%",
      isPositive: true,
      description: "Across 110 active projection auditoriums",
      iconName: "Ticket",
    },
    {
      title: "Platform Core Health",
      value: "99.98%",
      change: "+0.02%",
      isPositive: true,
      description: "Zero incidents detected across payment rails",
      iconName: "Activity",
    },
  ],
  pendingApprovals: [
    {
      id: "appr-001",
      entityName: "CineSphere Phoenix Lower Parel expansion (Hall 11 & 12)",
      entityType: "Theatre Circuit",
      requestedBy: "Mumbai Region Ops Head",
      submittedAt: "2 hours ago",
      priority: "Urgent",
    },
    {
      id: "appr-002",
      entityName: "DCI KDM Master License for Gladiator II Worldwide Release",
      entityType: "DCP Key (KDM)",
      requestedBy: "Paramount Pictures Distribution",
      submittedAt: "5 hours ago",
      priority: "High",
    },
    {
      id: "appr-003",
      entityName: "55/45 Distributor Split Agreement - Dune: Part Two",
      entityType: "Distributor Split",
      requestedBy: "Warner Bros. India",
      submittedAt: "1 day ago",
      priority: "Medium",
    },
    {
      id: "appr-004",
      entityName: "CineSphere Central Mall Kochi Municipal License Renewal",
      entityType: "Exhibition License",
      requestedBy: "South India Operations",
      submittedAt: "2 days ago",
      priority: "Medium",
    },
  ],
  quickStats: [
    { label: "Active DCI Projectors", value: "110 units", subtext: "100% online" },
    { label: "Total Seat Inventory", value: "22,450 seats", subtext: "82.4% avg occupancy" },
    { label: "Payment Success Rate", value: "99.4%", subtext: "Razorpay / UPI rails" },
    { label: "Average Response Time", value: "18 ms", subtext: "Cloudflare Edge network" },
  ],
};

