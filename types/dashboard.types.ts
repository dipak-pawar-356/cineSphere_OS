import { ID } from "./common.types";

export interface DashboardMetric {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  description: string;
  iconName: string;
}

export interface SystemStat {
  label: string;
  value: string;
  subtext?: string;
}

export interface SystemServiceStatus {
  name: string;
  status: "Operational" | "Degraded" | "Outage" | "Maintenance";
  latencyMs: number;
  uptime: string;
  region: string;
}

export interface PendingApproval {
  id: ID;
  entityName: string;
  entityType: "Theatre Circuit" | "Exhibition License" | "DCP Key (KDM)" | "Distributor Split";
  requestedBy: string;
  submittedAt: string;
  priority: "High" | "Medium" | "Urgent";
}
