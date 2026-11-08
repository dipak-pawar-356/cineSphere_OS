"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { usePlatformStore, type SubscriptionPlan } from "@/store/platform-store";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Shield,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SuperAdminSubscriptionsPage() {
  const { subscriptions, theatres } = usePlatformStore();
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Annual">("Monthly");

  return (
    <div className="space-y-8">
      <PageHeader
        title="SaaS Subscription Plans & Commercial Licensing"
        subtitle="Manage Multi-Tenant Commercial Tier Packages, Commission Rates & Exhibitor Billing"
        badge="4 Active Tiers"
        badgeVariant="primary"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-[#161F2E] border border-[#2A3445] text-xs">
              <button
                onClick={() => setBillingCycle("Monthly")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  billingCycle === "Monthly" ? "bg-[#FBBF24] text-[#070B12]" : "text-[#94A3B8]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("Annual")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  billingCycle === "Annual" ? "bg-[#FBBF24] text-[#070B12]" : "text-[#94A3B8]"
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>
        }
      />

      {/* 4 Commercial SaaS Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((plan) => {
          const price =
            billingCycle === "Annual"
              ? Math.round(plan.priceMonthly * 0.8)
              : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                plan.name === "Enterprise"
                  ? "bg-gradient-to-b from-[#1C2433] to-[#111827] border-[#FBBF24] shadow-2xl relative"
                  : "bg-[#161F2E] border-[#2A3445] hover:border-[#64748B]"
              }`}
            >
              {plan.name === "Enterprise" && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#FBBF24] text-[#070B12] text-[10px] font-black uppercase tracking-wider">
                  Recommended
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <Badge variant={plan.status === "Active" ? "success" : "secondary"} size="sm">
                    {plan.status}
                  </Badge>
                </div>

                <div>
                  <div className="text-3xl font-black text-white font-mono">
                    {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">
                    per multiplex / {billingCycle === "Annual" ? "month billed annually" : "month"}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B1220]/80 border border-[#2A3445] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Screen Limit</span>
                    <span className="font-bold text-white">{plan.screensAllowed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Platform Commission</span>
                    <span className="font-mono text-emerald-400 font-bold">{plan.commissionPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Current Subscribers</span>
                    <span className="font-mono text-[#FBBF24] font-bold">{plan.activeTheatresCount} Theatres</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-[#2A3445]/60">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                    Included Features
                  </div>
                  <ul className="space-y-2 text-xs text-[#CBD5E1]">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={plan.name === "Enterprise" ? "primary" : "outline"}
                  size="sm"
                  className="w-full text-xs font-bold"
                >
                  Manage Tier
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscribed Theatres Overview */}
      <div className="rounded-3xl bg-[#161F2E] border border-[#2A3445] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A3445] pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#FBBF24]" /> Active Theatre Subscriptions
            </h2>
            <p className="text-xs text-[#94A3B8]">Real-time licensing status, renewal dates, and billing compliance</p>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">Showing {theatres.length} Subscribed Tenants</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111827] text-[#94A3B8] uppercase font-bold text-[10px] border-b border-[#2A3445]">
              <tr>
                <th className="py-3 px-4">Theatre Name</th>
                <th className="py-3 px-4">Assigned Plan</th>
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4">Renewal Date</th>
                <th className="py-3 px-4">Monthly Tariff</th>
                <th className="py-3 px-4">Subscription Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3445]/60 text-[#CBD5E1]">
              {theatres.map((th) => (
                <tr key={th.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-[#FBBF24]" />
                    <span>{th.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="warning" size="sm">{th.subscriptionPlan}</Badge>
                  </td>
                  <td className="py-3 px-4 text-[#94A3B8]">Annual Recurring</td>
                  <td className="py-3 px-4 font-mono text-white">{th.subscriptionRenewal}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {th.subscriptionPlan === "Enterprise"
                      ? "₹79,999"
                      : th.subscriptionPlan === "Professional"
                      ? "₹34,999"
                      : th.subscriptionPlan === "Starter"
                      ? "₹14,999"
                      : "₹0"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="success" size="sm">Active Licensing</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
