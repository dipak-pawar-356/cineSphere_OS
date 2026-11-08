"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore } from "@/store/platform-store";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Layers,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Calendar,
  Clock,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Ticket,
  Film,
  History,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminTheatreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theatreId = params?.id as string;

  const { theatres, approveTheatre, rejectTheatre, suspendTheatre, activateTheatre } =
    usePlatformStore();

  const [activeTab, setActiveTab] = useState<
    "general" | "admin" | "payment" | "subscription" | "metrics" | "audit"
  >("general");

  const theatre = theatres.find((t) => t.id === theatreId) || theatres[0];

  if (!theatre) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Theatre Complex Not Found</h2>
        <p className="text-sm text-[#94A3B8]">The requested theatre circuit ID does not exist.</p>
        <Link href="/dashboard/theatres">
          <Button variant="primary" size="sm">Back to Theatres List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/theatres"
          className="text-xs text-[#94A3B8] hover:text-[#FBBF24] flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Theatres
        </Link>

        {/* Dynamic Action Buttons based on status */}
        <div className="flex items-center gap-2">
          {theatre.status === "Pending Approval" && (
            <>
              <Button
                onClick={() => approveTheatre(theatre.id)}
                variant="primary"
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs border-0"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Licence
              </Button>
              <Button
                onClick={() => rejectTheatre(theatre.id, "Documentation review failed")}
                variant="outline"
                size="sm"
                className="gap-1.5 text-rose-400 border-rose-500/40 text-xs font-bold hover:bg-rose-500/10"
              >
                <XCircle className="h-4 w-4" /> Reject Application
              </Button>
            </>
          )}

          {theatre.status === "Active" && (
            <Button
              onClick={() => suspendTheatre(theatre.id)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-rose-400 border-rose-500/40 text-xs font-bold hover:bg-rose-500/10"
            >
              <PauseCircle className="h-4 w-4" /> Suspend Operations
            </Button>
          )}

          {theatre.status === "Suspended" && (
            <Button
              onClick={() => activateTheatre(theatre.id)}
              variant="primary"
              size="sm"
              className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs border-0"
            >
              <PlayCircle className="h-4 w-4" /> Restore Active Licence
            </Button>
          )}
        </div>
      </div>

      {/* Hero Theatre Banner Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111827] via-[#161F2E] to-[#0B1220] border border-[#2A3445] space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#070B12] border border-[#2A3445] flex items-center justify-center text-[#FBBF24] font-black text-2xl shadow-inner shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{theatre.name}</h1>
                <Badge
                  variant={
                    theatre.status === "Active"
                      ? "success"
                      : theatre.status === "Pending Approval"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                >
                  {theatre.status}
                </Badge>
              </div>
              <div className="text-xs text-[#94A3B8] flex items-center gap-2 mt-1">
                <span>{theatre.chain}</span>
                <span>•</span>
                <span className="font-mono text-[#FBBF24]">{theatre.id}</span>
                <span>•</span>
                <span>{theatre.city}, {theatre.state}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end gap-1">
            <div className="text-xs uppercase font-bold text-[#94A3B8]">Gross Monthly Revenue</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{(theatre.grossRevenueMonthly / 100000).toFixed(2)} Lakh
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#2A3445]">
          {[
            { id: "general", label: "General & Hardware" },
            { id: "admin", label: "Admin & Operators" },
            { id: "payment", label: "Payment & UPI Rail" },
            { id: "subscription", label: "SaaS Licensing" },
            { id: "metrics", label: "Shows & Revenue" },
            { id: "audit", label: "Audit Trail" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#FBBF24] text-[#070B12] shadow-lg font-bold"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#111827]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: General Information */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Corporate & Identity Credentials
            </h3>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Cinema Chain Name</span>
                <span className="font-semibold text-white">{theatre.chain}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Tenant URL Slug</span>
                <span className="font-mono text-white">/{theatre.slug}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Commercial GSTIN</span>
                <span className="font-mono text-white">{theatre.gstNumber}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Physical Address</span>
                <span className="text-white text-right max-w-xs">{theatre.address}, {theatre.city} - {theatre.pinCode}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Jurisdiction</span>
                <span className="text-white">{theatre.state}, {theatre.country}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Hardware & Acoustic Formats
            </h3>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Screen Count</span>
                <span className="font-mono font-bold text-white">{theatre.hallCount} Auditoriums</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Seating Luxury Tier</span>
                <Badge variant="warning" size="sm">{theatre.pricingTier}</Badge>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-[#94A3B8]">Screen Formats</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {theatre.screenTypes.map((fmt, i) => (
                    <Badge key={i} variant="outline" size="sm">{fmt}</Badge>
                  ))}
                </div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Auditorium Status</span>
                <span className="text-emerald-400 font-semibold">100% Calibrated</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Admin Information */}
      {activeTab === "admin" && (
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Authorized Cinema Operator (General Manager)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Administrator Name</div>
              <div className="text-sm font-bold text-white">{theatre.adminName}</div>
              <div className="text-[11px] text-[#FBBF24]">General Manager (Role: THEATRE_ADMIN)</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Primary Email</div>
              <div className="text-sm font-mono text-white">{theatre.adminEmail}</div>
              <div className="text-[11px] text-emerald-400">Clerk Single Sign-On Verified</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Helpline Contact</div>
              <div className="text-sm font-mono text-white">{theatre.contactNumber}</div>
              <div className="text-[11px] text-[#94A3B8]">24/7 Multiplex Foyer Landline</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payment & UPI Rail */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Tenant-Isolated Payment Configuration
            </h3>
            <p className="text-xs text-[#94A3B8]">
              All patron collections belong strictly to this theatre’s merchant account. CineSphere OS acts solely as a technical facilitator.
            </p>
            <div className="divide-y divide-[#2A3445]/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Theatre UPI ID</span>
                <span className="font-mono font-bold text-white">{theatre.slug}@icici</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Merchant Legal Name</span>
                <span className="text-white font-medium">{theatre.name} Private Limited</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Settlement Cycle</span>
                <span className="text-emerald-400 font-bold">T+1 Daily Auto-Settlement</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#94A3B8]">Nodal Bank</span>
                <span className="text-white">HDFC Bank · Pune Corporate Branch</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Gateway Connectors & Webhook Keys
            </h3>
            <div className="space-y-3 pt-2">
              {[
                { name: "UPI Auto-QR Rail", status: "Active", sub: "NPCI Instant Rail" },
                { name: "Razorpay Connect", status: "Configured", sub: "rzp_live_****9281" },
                { name: "PhonePe Nodal Switch", status: "Configured", sub: "M2201928371" },
                { name: "Stripe International", status: "Optional", sub: "Enabled for foreign credit cards" },
              ].map((g, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#111827] border border-[#2A3445] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{g.name}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{g.sub}</div>
                  </div>
                  <Badge variant="success" size="sm">{g.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SaaS Subscription */}
      {activeTab === "subscription" && (
        <div className="p-6 rounded-3xl bg-[#161F2E] border border-[#2A3445] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Active Subscription Plan & Commercial Contract
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Tier Plan</div>
              <div className="text-xl font-extrabold text-[#FBBF24] font-mono">{theatre.subscriptionPlan}</div>
              <div className="text-[11px] text-[#94A3B8]">Commercial SaaS Contract</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Platform Fee Split</div>
              <div className="text-xl font-extrabold text-white font-mono">1.5% Gross</div>
              <div className="text-[11px] text-emerald-400">Enterprise Flat Tariff</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Contract Renewal</div>
              <div className="text-xl font-extrabold text-white font-mono">{theatre.subscriptionRenewal}</div>
              <div className="text-[11px] text-emerald-400">Annual Auto-Renew</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Licensing Status</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">Compliant</div>
              <div className="text-[11px] text-[#94A3B8]">Fire, CBFC & Local NOCs Valid</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Metrics & Shows */}
      {activeTab === "metrics" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Auditorium Halls</div>
            <div className="text-2xl font-black font-mono text-white">{theatre.hallCount} Screens</div>
            <div className="text-[11px] text-[#FBBF24]">CAD Blueprints Active</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Daily Shows Scheduled</div>
            <div className="text-2xl font-black font-mono text-white">32 Shows / Day</div>
            <div className="text-[11px] text-emerald-400">Zero Schedule Collisions</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Monthly Bookings</div>
            <div className="text-2xl font-black font-mono text-white">{theatre.totalBookings.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-emerald-400">92.4% Occupancy Peak</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#161F2E] border border-[#2A3445] space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Gross Box Office</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              ₹{(theatre.grossRevenueMonthly / 100000).toFixed(2)}L
            </div>
            <div className="text-[11px] text-emerald-300">GST Formats Auto-filed</div>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
            Recent Security & Audit Logs for this Tenant
          </h3>
          <div className="divide-y divide-[#2A3445]/60 text-xs">
            {[
              { time: "2026-11-08 17:30:00", action: "THEATRE_ACTIVATED", desc: "Operational license approved by Super Admin HQ.", ip: "103.21.144.12" },
              { time: "2026-11-07 14:12:00", action: "UPI_CONFIG_VERIFIED", desc: "NPCI test micro-transaction ₹1.00 succeeded.", ip: "10.0.2.14" },
              { time: "2026-11-06 09:40:00", action: "KDM_KEYS_INGESTED", desc: "Digital Cinema Package projection certificates synced for Pushpa 3.", ip: "192.168.1.10" },
            ].map((log, i) => (
              <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[#CBD5E1]">
                <div>
                  <div className="font-bold text-white">{log.action}</div>
                  <div className="text-[11px] text-[#94A3B8]">{log.desc}</div>
                </div>
                <div className="text-right text-[10px] font-mono text-[#64748B]">
                  <div>{log.time}</div>
                  <div>IP: {log.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
