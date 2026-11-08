"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTheatreStore } from "@/store/theatre-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tag,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Edit,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  Star,
  Layers,
  Building2,
  Armchair,
  Check,
  X,
} from "lucide-react";
import {
  DynamicPricingProfile,
  PricingDayType,
  PricingSlotType,
  PricingProfileStatus,
} from "@/types/pricing-engine.types";
import { PricingProfileModal } from "@/components/pricing/pricing-profile-modal";
import { PricingSimulatorModal } from "@/components/pricing/pricing-simulator-modal";
import { simulateShowRevenue } from "@/lib/engine/pricing-engine";
import { cn } from "@/utils";

export default function TheatrePricingPage() {
  const {
    pricingProfiles,
    halls,
    shows,
    setDefaultPricingProfile,
    duplicatePricingProfile,
    deletePricingProfile,
  } = useTheatreStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dayTypeFilter, setDayTypeFilter] = useState<PricingDayType | "all">("all");
  const [slotTypeFilter, setSlotTypeFilter] = useState<PricingSlotType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PricingProfileStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DynamicPricingProfile | null>(null);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);
  const [simulatorInitialProfileId, setSimulatorInitialProfileId] = useState<string | undefined>();

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Yield Simulation State
  const [simSelectedHallId, setSimSelectedHallId] = useState<string>(() => halls[0]?.id || "");
  const [simSelectedProfileId, setSimSelectedProfileId] = useState<string>(() => pricingProfiles[0]?.id || "");

  // Clear feedback after 5 seconds
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return pricingProfiles
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          Object.keys(p.tierPricing).some((tier) => tier.toLowerCase().includes(q))
        );
      })
      .filter((p) => {
        if (dayTypeFilter === "all") return true;
        return p.dayType === dayTypeFilter;
      })
      .filter((p) => {
        if (slotTypeFilter === "all") return true;
        return p.slotType === slotTypeFilter;
      })
      .filter((p) => {
        if (statusFilter === "all") return true;
        return p.status === statusFilter;
      });
  }, [pricingProfiles, searchQuery, dayTypeFilter, slotTypeFilter, statusFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = pricingProfiles.length;
    const active = pricingProfiles.filter((p) => p.status === "Active").length;
    const defaultProfile = pricingProfiles.find((p) => p.isDefault) || pricingProfiles[0];

    // Compute Average Ticket Price across active profiles (Gold tier or fallback)
    const activeProfiles = pricingProfiles.filter((p) => p.status === "Active");
    let totalRates = 0;
    let rateCount = 0;
    let highestRate = 0;
    let highestTierName = "None";

    for (const p of activeProfiles) {
      for (const [tier, rate] of Object.entries(p.tierPricing)) {
        totalRates += rate;
        rateCount++;
        if (rate > highestRate) {
          highestRate = rate;
          highestTierName = `${tier} (${p.code})`;
        }
      }
    }

    const averageTicketPrice = rateCount > 0 ? Math.round(totalRates / rateCount) : 280;

    return {
      total,
      active,
      defaultProfile,
      averageTicketPrice,
      highestRate,
      highestTierName,
    };
  }, [pricingProfiles]);

  // Selected Hall & Profile for Yield Analysis
  const simHall = useMemo(() => {
    return halls.find((h) => h.id === simSelectedHallId) || halls[0];
  }, [halls, simSelectedHallId]);

  const simProfile = useMemo(() => {
    return pricingProfiles.find((p) => p.id === simSelectedProfileId) || pricingProfiles[0];
  }, [pricingProfiles, simSelectedProfileId]);

  const yieldProjection = useMemo(() => {
    if (!simHall || !simProfile) return null;
    return simulateShowRevenue(simHall.sections, simProfile);
  }, [simHall, simProfile]);

  // Actions Handlers
  const handleCreateNew = () => {
    setEditingProfile(null);
    setProfileModalOpen(true);
  };

  const handleEdit = (profile: DynamicPricingProfile) => {
    setEditingProfile(profile);
    setProfileModalOpen(true);
  };

  const handleDuplicate = (profile: DynamicPricingProfile) => {
    const res = duplicatePricingProfile(profile.id);
    if (res.success) {
      showFeedback("success", `Duplicated profile "${profile.name}" as "${res.profile?.name}".`);
    } else {
      showFeedback("error", res.error || "Failed to duplicate profile.");
    }
  };

  const handleSetDefault = (profile: DynamicPricingProfile) => {
    setDefaultPricingProfile(profile.id);
    showFeedback("success", `Set "${profile.name}" as theatre default pricing profile.`);
  };

  const handleDelete = (profile: DynamicPricingProfile) => {
    if (confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
      const res = deletePricingProfile(profile.id);
      if (res.success) {
        showFeedback("success", `Deleted pricing profile "${profile.name}".`);
      } else {
        showFeedback("error", res.error || "Failed to delete profile.");
      }
    }
  };

  const handleOpenSimulator = (profileId?: string) => {
    setSimulatorInitialProfileId(profileId);
    setSimulatorModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dynamic Pricing Engine"
        subtitle="Reusable Section Tariff Hierarchy"
        description="Movies and Hall layouts never store permanent prices. Pricing belongs strictly to Sections via reusable Profiles linked to scheduled Shows."
        badge="Phase 2 Part 9"
        badgeVariant="primary"
        breadcrumbs={[
          { label: "Dashboard", href: "/theatre" },
          { label: "Shows", href: "/theatre/shows" },
          { label: "Dynamic Pricing", href: "/theatre/pricing" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenSimulator()}
              iconLeft={<Sparkles className="w-4 h-4 text-amber-400" />}
            >
              Seat Pricing Simulator
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
              iconLeft={<Plus className="w-4 h-4" />}
            >
              Create Pricing Profile
            </Button>
          </div>
        }
      />

      {/* Dismissible Feedback Banner */}
      {feedback && (
        <div
          className={cn(
            "p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all",
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          )}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="hover:opacity-80 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0B0F17] border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pricing Profiles
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{stats.total}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {stats.active} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Across Weekday, Weekend & Festival classifications
          </p>
        </Card>

        <Card className="p-4 bg-[#0B0F17] border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Theatre Default
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 truncate">
            <span className="text-lg font-bold text-slate-100 truncate">
              {stats.defaultProfile?.name || "None"}
            </span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium">
            {stats.defaultProfile?.code || "N/A"} • Default for newly scheduled shows
          </p>
        </Card>

        <Card className="p-4 bg-[#0B0F17] border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Average Ticket Price (ATP)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">
              ₹{stats.averageTicketPrice}
            </span>
            <span className="text-xs text-slate-400">Across active tiers</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Weighted across Silver, Gold, Platinum & VIP sections
          </p>
        </Card>

        <Card className="p-4 bg-[#0B0F17] border-[#2A3445] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Peak Tier Yield
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-400/10 border border-purple-400/25 flex items-center justify-center">
              <Armchair className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-300">
              ₹{stats.highestRate}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate" title={stats.highestTierName}>
            {stats.highestTierName}
          </p>
        </Card>
      </div>

      {/* Multi-Faceted Filter & Search Toolbar */}
      <Card className="p-3.5 bg-[#0B0F17] border-[#2A3445] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by profile name, code (PRF-...), description, or section tier (Gold, VIP, Recliner)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#161F2E] rounded-lg border border-[#2A3445] shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                viewMode === "grid"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors",
                viewMode === "table"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
              title="Detailed Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A3445]/60 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filters:</span>
          </span>

          {/* Day Type Pills */}
          <div className="flex items-center gap-1">
            {(["all", "Weekday", "Weekend", "Holiday"] as const).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setDayTypeFilter(day)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  dayTypeFilter === day
                    ? "bg-amber-400/15 text-amber-300 border-amber-400/40"
                    : "bg-[#111827] text-slate-400 border-[#2A3445] hover:border-slate-600"
                )}
              >
                {day === "all" ? "All Days" : day}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-4 bg-[#2A3445] mx-1 hidden sm:block" />

          {/* Slot Type Pills */}
          <div className="flex items-center gap-1">
            {(["all", "Morning", "Matinee", "Evening"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSlotTypeFilter(slot)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  slotTypeFilter === slot
                    ? "bg-amber-400/15 text-amber-300 border-amber-400/40"
                    : "bg-[#111827] text-slate-400 border-[#2A3445] hover:border-slate-600"
                )}
              >
                {slot === "all" ? "All Slots" : slot}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-4 bg-[#2A3445] mx-1 hidden sm:block" />

          {/* Status Dropdown */}
          <select
            className="bg-[#111827] border border-[#2A3445] text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400/60"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PricingProfileStatus | "all")}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>

          {(dayTypeFilter !== "all" || slotTypeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setDayTypeFilter("all");
                setSlotTypeFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-[11px] text-amber-400 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Main Content: Grid vs Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((profile) => {
            const isDef = profile.isDefault;
            return (
              <Card
                key={profile.id}
                className={cn(
                  "p-5 bg-[#0B0F17] border flex flex-col justify-between space-y-4 hover:border-slate-600 transition-all group relative",
                  isDef ? "border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.08)]" : "border-[#2A3445]"
                )}
              >
                {/* Header & Badges */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {profile.code}
                        </span>
                        {isDef && (
                          <Badge variant="primary" size="sm" className="font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>Default</span>
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-0.5">
                        {profile.name}
                      </h3>
                    </div>

                    <Badge
                      variant={
                        profile.status === "Active"
                          ? "success"
                          : profile.status === "Draft"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {profile.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {profile.description || "Reusable pricing tariff for auditorium screenings."}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#161F2E] text-slate-300 border border-[#2A3445]">
                      {profile.dayType}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#161F2E] text-slate-300 border border-[#2A3445]">
                      {profile.slotType} Slot
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      Fee: ₹{profile.convenienceFee} + {profile.gstPercent}% GST
                    </span>
                  </div>
                </div>

                {/* Section Tier Rates Grid */}
                <div className="p-3 bg-[#111827] rounded-xl border border-[#2A3445]/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Section Tier Rates</span>
                    <span className="text-[10px] text-slate-400">INR (₹)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(profile.tierPricing)
                      .slice(0, 6)
                      .map(([tier, rate]) => (
                        <div
                          key={tier}
                          className="p-1.5 rounded-lg bg-[#161F2E] border border-[#2A3445] text-center"
                        >
                          <span className="text-[10px] text-slate-400 block truncate" title={tier}>
                            {tier}
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹{rate}
                          </span>
                        </div>
                      ))}
                  </div>

                  {Object.keys(profile.tierPricing).length > 6 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      +{Object.keys(profile.tierPricing).length - 6} more section tiers
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#2A3445]/60 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenSimulator(profile.id)}
                    iconLeft={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    Test Simulator
                  </Button>

                  <div className="flex items-center gap-1">
                    {!isDef && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleSetDefault(profile)}
                        title="Set as Theatre Default"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDuplicate(profile)}
                      title="Duplicate Profile"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleEdit(profile)}
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {!isDef && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(profile)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <Card className="bg-[#0B0F17] border-[#2A3445] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#2A3445]">
                <tr>
                  <th className="p-3.5">Profile & Code</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Silver</th>
                  <th className="p-3.5">Gold</th>
                  <th className="p-3.5">Platinum</th>
                  <th className="p-3.5">VIP / Recliner</th>
                  <th className="p-3.5">Royal Suite</th>
                  <th className="p-3.5">Fee & GST</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3445]/60 text-slate-300">
                {filteredProfiles.map((p) => {
                  const isDef = p.isDefault;
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "hover:bg-[#161F2E]/40 transition-colors",
                        isDef ? "bg-amber-400/[0.02]" : ""
                      )}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">{p.name}</span>
                          {isDef && (
                            <Badge variant="primary" size="sm" className="text-[9px]">
                              Default
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-amber-400">{p.code}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-300 font-medium">{p.dayType}</div>
                        <div className="text-[11px] text-slate-400">{p.slotType}</div>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-200">
                        ₹{p.tierPricing["Silver"] ?? "-"}
                      </td>

                      <td className="p-3.5 font-semibold text-amber-400">
                        ₹{p.tierPricing["Gold"] ?? "-"}
                      </td>

                      <td className="p-3.5 font-semibold text-slate-200">
                        ₹{p.tierPricing["Platinum"] ?? "-"}
                      </td>

                      <td className="p-3.5 font-semibold text-purple-300">
                        ₹{p.tierPricing["VIP"] ?? p.tierPricing["Recliner"] ?? "-"}
                      </td>

                      <td className="p-3.5 font-semibold text-amber-300">
                        ₹{p.tierPricing["Royal Suite"] ?? "-"}
                      </td>

                      <td className="p-3.5 text-slate-400">
                        ₹{p.convenienceFee} / {p.gstPercent}%
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant={
                            p.status === "Active"
                              ? "success"
                              : p.status === "Draft"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenSimulator(p.id)}
                            title="Test in Simulator"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </Button>
                          {!isDef && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => handleSetDefault(p)}
                              title="Set as Default"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDuplicate(p)}
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEdit(p)}
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {!isDef && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => handleDelete(p)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Auditorium Box Office Revenue Yield Simulator Widget */}
      <Card className="p-5 bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#1E293B] border-[#2A3445] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3445]/60 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Gross Box Office Yield Projection Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Simulate total show revenue across different hall configurations and dynamic pricing tariffs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Hall:</span>
              <select
                className="bg-[#161F2E] border border-[#2A3445] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                value={simSelectedHallId}
                onChange={(e) => setSimSelectedHallId(e.target.value)}
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Profile:</span>
              <select
                className="bg-[#161F2E] border border-[#2A3445] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
                value={simSelectedProfileId}
                onChange={(e) => setSimSelectedProfileId(e.target.value)}
              >
                {pricingProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {yieldProjection && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[#0B0F17]/80 rounded-xl border border-[#2A3445]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Housefull Gross Potential
              </span>
              <span className="text-lg font-bold text-emerald-400">
                ₹{yieldProjection.housefullPotentialRevenue.toLocaleString("en-IN")}
              </span>
              <p className="text-[10px] text-slate-400">
                100% Occupancy ({yieldProjection.totalCapacity} seats)
              </p>
            </div>

            <div className="p-3 bg-[#0B0F17]/80 rounded-xl border border-[#2A3445]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Prime Target (75% Occupancy)
              </span>
              <span className="text-lg font-bold text-slate-100">
                ₹{yieldProjection.estimatedAt75Percent.toLocaleString("en-IN")}
              </span>
              <p className="text-[10px] text-slate-400">
                ~{Math.round(yieldProjection.totalCapacity * 0.75)} tickets sold
              </p>
            </div>

            <div className="p-3 bg-[#0B0F17]/80 rounded-xl border border-[#2A3445]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Breakeven (50% Occupancy)
              </span>
              <span className="text-lg font-bold text-amber-400">
                ₹{yieldProjection.estimatedAt50Percent.toLocaleString("en-IN")}
              </span>
              <p className="text-[10px] text-slate-400">
                ~{Math.round(yieldProjection.totalCapacity * 0.5)} tickets sold
              </p>
            </div>

            <div className="p-3 bg-[#0B0F17]/80 rounded-xl border border-[#2A3445]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Average Seat Yield (ATP)
              </span>
              <span className="text-lg font-bold text-purple-300">
                ₹{yieldProjection.averageTicketPrice}
              </span>
              <p className="text-[10px] text-slate-400">
                Blended across all sections
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Pricing Profile Create / Edit Modal */}
      <PricingProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        editingProfile={editingProfile}
        onSuccess={(msg) => showFeedback("success", msg)}
      />

      {/* Interactive Seat Selection & Price Calculation Simulator Modal */}
      <PricingSimulatorModal
        isOpen={simulatorModalOpen}
        onClose={() => setSimulatorModalOpen(false)}
        initialProfileId={simulatorInitialProfileId}
      />
    </div>
  );
}
