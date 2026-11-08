"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Database,
  Layers,
  Building2,
  Ticket,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PlatformHealthPage() {
  const { theatres, settings } = usePlatformStore();

  const totalTheatres = theatres.length;
  const activeTheatres = theatres.filter((t) => t.status === "Active").length;
  const pendingApprovals = theatres.filter((t) => t.status === "Pending Approval").length;
  const suspendedTheatres = theatres.filter((t) => t.status === "Suspended").length;

  const services = [
    { name: "Neon PostgreSQL Cluster", status: "Operational", latency: "4.2 ms", region: "AWS ap-south-1 (Mumbai)", uptime: "99.99%" },
    { name: "Clerk Multi-Tenant Auth Rail", status: "Operational", latency: "18 ms", region: "Global Edge", uptime: "100.00%" },
    { name: "UPI & Instant QR Nodal Gateways", status: "Operational", latency: "42 ms", region: "NPCI Direct Bridge", uptime: "99.96%" },
    { name: "CAD Seating Matrix Engine", status: "Operational", latency: "1.8 ms", region: "Vercel Edge Network", uptime: "100.00%" },
    { name: "Turnstile QR Verification Webhooks", status: "Operational", latency: "8.5 ms", region: "Cloudflare Edge", uptime: "99.98%" },
    { name: "Distributor CBFC Hologram Validator", status: "Operational", latency: "12 ms", region: "Mumbai Security POP", uptime: "99.95%" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Health & Multi-Tenant Infrastructure"
        subtitle="Global Telemetry, Edge Latency, Tenant Partitions & High-Availability Mesh"
        badge="99.98% Live"
        badgeVariant="success"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-[#2A3445] text-xs font-semibold">
              <RefreshCw className="h-3.5 w-3.5" /> Re-check Mesh
            </Button>
            <Link href="/dashboard/settings">
              <Button variant="primary" size="sm" className="gap-2 text-xs font-bold">
                Platform Settings <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold uppercase">
            <span>Theatres Fleet</span>
            <Building2 className="h-4 w-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activeTheatres} / {totalTheatres}</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{pendingApprovals} Pending Approvals</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold uppercase">
            <span>Database Pool</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">18 / 100 Conn</div>
          <div className="text-xs text-emerald-400 font-medium">Neon Serverless · 4.2ms Query Latency</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold uppercase">
            <span>Maintenance Mode</span>
            <Server className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {settings.maintenanceMode ? "ENGAGED" : "OFF"}
          </div>
          <div className="text-xs text-[#94A3B8] font-medium">All Public Portals Fully Operational</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-semibold uppercase">
            <span>Global Uptime</span>
            <Activity className="h-4 w-4 text-[#E50914]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">99.98%</div>
          <div className="text-xs text-emerald-400 font-medium">Past 90 Days SLA: 99.95% Guaranteed</div>
        </div>
      </div>

      {/* Edge Services Health Matrix */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2A3445] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-[#FBBF24]" /> Core Platform Services
            </h2>
            <p className="text-xs text-[#94A3B8]">Live telemetry health across database, authentication, and edge routing rails</p>
          </div>
          <Badge variant="success" size="sm" className="gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Green
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#94A3B8] uppercase font-bold text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3 px-4">Service Component</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">Response Latency</th>
                <th className="py-3 px-4">Cloud Region</th>
                <th className="py-3 px-4">Monthly Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {services.map((srv, i) => (
                <tr key={i} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{srv.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success" size="sm">{srv.status}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{srv.latency}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{srv.region}</td>
                  <td className="py-3 px-4 font-mono text-white font-semibold">{srv.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
