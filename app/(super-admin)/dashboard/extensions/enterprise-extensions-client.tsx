"use client";

import React, { useState, useTransition } from "react";
import {
  EnterpriseOverviewSummary,
} from "@/lib/services/enterprise-extensions.service";
import {
  EnterpriseFeatureFlag,
  ResolvedFeatureFlag,
  DeviceRegistry,
  DomainEventPayload,
  EnterpriseModuleId,
} from "@/types/enterprise-extension-framework.types";
import {
  toggleExtensionModuleAction,
  resolveFeatureFlagAction,
  setFeatureFlagOverrideAction,
  dispatchDomainEventAction,
  evaluateDynamicPricingAction,
  getEnterpriseOverviewAction,
  getEventBusHistoryAction,
} from "@/actions/enterprise-extensions-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Building2,
  Cpu,
  TrendingUp,
  Award,
  CreditCard,
  Key,
  Globe,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Zap,
  Sliders,
  Filter,
  Monitor,
  Activity,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface EnterpriseExtensionsClientProps {
  initialOverview: EnterpriseOverviewSummary;
  initialExtensions: any[];
  initialFlags: EnterpriseFeatureFlag[];
  initialDevices: DeviceRegistry[];
  initialEvents: DomainEventPayload[];
  initialHierarchy: any;
}

export function EnterpriseExtensionsClient({
  initialOverview,
  initialExtensions,
  initialFlags,
  initialDevices,
  initialEvents,
  initialHierarchy,
}: EnterpriseExtensionsClientProps) {
  const [activeTab, setActiveTab] = useState<
    "ARCHITECTURE" | "MODULES" | "FLAGS" | "DEVICES" | "EVENTS" | "PRICING"
  >("ARCHITECTURE");

  const [overview, setOverview] = useState(initialOverview);
  const [extensions, setExtensions] = useState(initialExtensions);
  const [flags, setFlags] = useState(initialFlags);
  const [devices, setDevices] = useState(initialDevices);
  const [events, setEvents] = useState(initialEvents);

  // Feature Flag Simulator State
  const [simFlagKey, setSimFlagKey] = useState("enterprise.dynamic_pricing");
  const [simOrgId, setSimOrgId] = useState("org-cinesphere-global");
  const [simTheatreId, setSimTheatreId] = useState("th-pun-001");
  const [simUserId, setSimUserId] = useState("");
  const [resolvedResult, setResolvedResult] = useState<ResolvedFeatureFlag | null>(null);

  // Dynamic Pricing Simulator State
  const [pricingBasePrice, setPricingBasePrice] = useState(350);
  const [pricingOccupancy, setPricingOccupancy] = useState(85);
  const [pricingFormat, setPricingFormat] = useState("IMAX");
  const [pricingResult, setPricingResult] = useState<any>(null);

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const refreshAllData = () => {
    startTransition(async () => {
      const [overviewRes, eventsRes] = await Promise.all([
        getEnterpriseOverviewAction(),
        getEventBusHistoryAction({ limit: 25 }),
      ]);
      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      }
      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      setStatusMessage({ text: "Enterprise telemetry refreshed successfully.", type: "success" });
    });
  };

  const handleToggleModule = (moduleId: EnterpriseModuleId, currentEnabled: boolean) => {
    startTransition(async () => {
      const targetState = !currentEnabled;
      const res = await toggleExtensionModuleAction({ moduleId, enable: targetState });
      if (res.success) {
        setExtensions((prev) =>
          prev.map((item) =>
            item.module.manifest.moduleId === moduleId
              ? { ...item, state: targetState ? "ENABLED" : "DISABLED" }
              : item
          )
        );
        setStatusMessage({
          text: `Module '${moduleId}' successfully ${targetState ? "enabled" : "disabled"}.`,
          type: "success",
        });
        refreshAllData();
      } else {
        setStatusMessage({
          text: `Failed to toggle module '${moduleId}': ${res.error?.message || "Unknown error"}`,
          type: "error",
        });
      }
    });
  };

  const handleSimulateResolveFlag = () => {
    startTransition(async () => {
      const res = await resolveFeatureFlagAction({
        flagKey: simFlagKey,
        scope: {
          organizationId: simOrgId || undefined,
          theatreId: simTheatreId || undefined,
          userId: simUserId || undefined,
        },
      });

      if (res.success && res.data) {
        setResolvedResult(res.data);
        setStatusMessage({
          text: `Flag resolved at tier: ${res.data.resolvedLevel} (Effective: ${String(res.data.effectiveValue)})`,
          type: "success",
        });
      } else {
        setStatusMessage({
          text: `Failed to resolve flag: ${res.error?.message || "Unknown error"}`,
          type: "error",
        });
      }
    });
  };

  const handleToggleTheatreOverride = (targetValue: boolean) => {
    startTransition(async () => {
      const res = await setFeatureFlagOverrideAction({
        flagKey: simFlagKey,
        level: "THEATRE",
        targetId: simTheatreId,
        value: targetValue,
      });

      if (res.success) {
        setStatusMessage({
          text: `Theatre override for '${simFlagKey}' set to ${targetValue} on '${simTheatreId}'.`,
          type: "success",
        });
        handleSimulateResolveFlag();
      }
    });
  };

  const handleTestPricingEvaluation = () => {
    startTransition(async () => {
      const res = await evaluateDynamicPricingAction({
        basePrice: Number(pricingBasePrice),
        theatreId: simTheatreId,
        showTime: new Date().toISOString(),
        currentOccupancyPercent: Number(pricingOccupancy),
        format: pricingFormat,
      });

      if (res.success && res.data) {
        setPricingResult(res.data);
      }
    });
  };

  const handleDispatchTestEvent = () => {
    startTransition(async () => {
      const res = await dispatchDomainEventAction({
        eventType: "PRICING_SURGE_TRIGGERED",
        tenantId: simTheatreId,
        organizationId: simOrgId,
        data: {
          simulatedMultiplier: 1.25,
          reason: "High weekend evening occupancy test",
          triggeredBy: "Enterprise Extensions UI Console",
        },
      });

      if (res.success) {
        setStatusMessage({ text: "Test domain event successfully broadcasted to Event Bus.", type: "success" });
        refreshAllData();
      }
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Enterprise Extension Framework
            </h1>
            <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-xs">
              Phase 3 – Part 16
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Pluggable Sub-Platforms • 4-Tier Hierarchical Feature Flags • Extension SDK Runtime • Decoupled Domain Event Bus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllData}
            disabled={isPending}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDispatchTestEvent}
            disabled={isPending}
            className="bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Simulate Domain Event
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between border ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top-Level Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Circuits & Chains</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{overview.totalOrganizations}</div>
          <p className="text-xs text-zinc-500 mt-1">{overview.totalBranches} connected branches</p>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Extension Modules</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">
            {overview.enabledModulesCount}
            <span className="text-xs font-normal text-zinc-500 ml-1">/ {overview.totalRegisteredModules}</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1">Runtime Kernel Ready</p>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>4-Tier Feature Flags</span>
            <Sliders className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{overview.totalFeatureFlags}</div>
          <p className="text-xs text-zinc-500 mt-1">Cascading Precedence</p>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>IoT Hardware</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">
            {overview.onlineDevicesCount}
            <span className="text-xs font-normal text-zinc-500 ml-1">/ {overview.totalDevices}</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1">Sensors & Signage Online</p>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Domain Event Bus</span>
            <Radio className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">{overview.totalHistoricalEvents}</div>
          <p className="text-xs text-zinc-500 mt-1">Decoupled Pub/Sub</p>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-zinc-800 space-x-1 overflow-x-auto pb-px">
        {[
          { id: "ARCHITECTURE", label: "8 Sub-Platforms Matrix", icon: Layers },
          { id: "MODULES", label: "Extension SDK Kernel", icon: Power },
          { id: "FLAGS", label: "4-Tier Flag Simulator", icon: Sliders },
          { id: "PRICING", label: "Dynamic Pricing Engine", icon: TrendingUp },
          { id: "DEVICES", label: "IoT Hardware Registry", icon: Cpu },
          { id: "EVENTS", label: "Event Bus Stream", icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-amber-500 text-amber-400 bg-amber-500/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* Tab 1: 8 Sub-Platforms Matrix */}
      {activeTab === "ARCHITECTURE" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Enterprise Architecture Matrix (8 Sub-Platforms)
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Independent capabilities plug in modularly without modifying CineSphere OS core cinema operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Organization Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-sky-500/30 text-sky-300 bg-sky-500/10">Active</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">1. Organization Platform</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Multi-branch cinema chains, regional directorates, branch groups, franchise revenue sharing, and B2B corporate credit invoicing.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">Organization, Branch, FranchiseAgreement, CorporateAccount</span>
              </div>
            </Card>

            {/* 2. Customer Experience Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">Active</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">2. Customer Experience</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                VIP tiered Cinema Passports, prepaid digital/physical gift cards, and spend-based reward points ledger with burn redemption.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">MembershipPlan, GiftCard, LoyaltyProgram, RewardLedger</span>
              </div>
            </Card>

            {/* 3. Pricing Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">Configured</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">3. Pricing Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Demand surge multipliers, occupancy threshold triggers, holiday multipliers, and morning early-bird discount rules.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">DynamicPricingRule, IPricingRuleEngine</span>
              </div>
            </Card>

            {/* 4. Device Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10">Active</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">4. Device Platform (IoT)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Auditorium sensors (temperature, occupancy), projector lamp hours telemetry, lobby digital signage, and unattended smart kiosks.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">DeviceRegistry, DeviceTelemetry, KioskController</span>
              </div>
            </Card>

            {/* 5. AI Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                  <Zap className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-pink-500/30 text-pink-300 bg-pink-500/10">Canary (20%)</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">5. AI Platform (Stubs)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Collaborative filtering movie recommendations, optimal seat suggestions, and real-time concession upsell recommendation stubs.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Interfaces: <span className="text-zinc-300">IMovieRecommendation, ISeatRecommendation</span>
              </div>
            </Card>

            {/* 6. Integration Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Key className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10">Active</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">6. Integration Platform</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Third-party partner developer API keys, granular API scopes (shows, bookings, reports), and asynchronous webhook delivery.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">APIClient, ApiScope, WebhookSubscription</span>
              </div>
            </Card>

            {/* 7. Regional Platform */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Globe className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">Active</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">7. Regional Platform</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cross-border multi-region deployment configurations, statutory tax frameworks (GST, VAT, Sales Tax), and multi-currency stacks.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">RegionalDeploymentConfig, TaxFramework</span>
              </div>
            </Card>

            {/* 8. Extension SDK */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">Core Ready</Badge>
              </div>
              <h3 className="font-semibold text-zinc-100">8. Extension SDK</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pluggable runtime kernel with formal lifecycle hooks (onInstall, onEnable, onDisable), dynamic route injection, and background jobs.
              </p>
              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                Key Entities: <span className="text-zinc-300">EnterpriseExtensionRegistry, LifecycleHooks</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Extension SDK Kernel & Installed Modules */}
      {activeTab === "MODULES" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Power className="w-5 h-5 text-amber-400" />
              Installed Enterprise Extension Modules
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Super Admin runtime module lifecycle control. Modules register routes, dynamic permissions, and background jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extensions.map((item) => {
              const mod = item.module.manifest;
              const isEnabled = item.state === "ENABLED";

              return (
                <Card key={mod.moduleId} className="bg-zinc-900/60 border-zinc-800 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-100">{mod.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            isEnabled
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-zinc-700 text-zinc-400 bg-zinc-800/40"
                          }
                        >
                          {item.state}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{mod.moduleId} • v{mod.version}</p>
                    </div>

                    <Button
                      size="sm"
                      variant={isEnabled ? "danger" : "primary"}
                      onClick={() => handleToggleModule(mod.moduleId, isEnabled)}
                      disabled={isPending}
                      className={
                        isEnabled
                          ? "bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }
                    >
                      <Power className="w-3.5 h-3.5 mr-1.5" />
                      {isEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{mod.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-zinc-800/80">
                    <div>
                      <span className="text-zinc-500">Platform:</span>{" "}
                      <span className="text-zinc-300">{mod.platformKey}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Author:</span>{" "}
                      <span className="text-zinc-300">{mod.author}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-500">Dependencies:</span>{" "}
                      <span className="text-zinc-300">
                        {mod.dependencies.length > 0 ? mod.dependencies.join(", ") : "None (Standalone)"}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: 4-Tier Feature Flag Hierarchy Simulator */}
      {activeTab === "FLAGS" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              4-Tier Feature Flag Hierarchy Simulator
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Test cascading inheritance across User &gt; Theatre &gt; Organization &gt; Platform &gt; Default tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-4 lg:col-span-1">
              <h3 className="font-semibold text-zinc-200 text-sm">Simulation Inputs</h3>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Select Feature Flag</label>
                <select
                  value={simFlagKey}
                  onChange={(e) => setSimFlagKey(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                >
                  {flags.map((f) => (
                    <option key={f.flagKey} value={f.flagKey}>
                      {f.name} ({f.flagKey})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Organization Scope</label>
                <input
                  type="text"
                  value={simOrgId}
                  onChange={(e) => setSimOrgId(e.target.value)}
                  placeholder="e.g. org-cinesphere-global"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Theatre Scope</label>
                <input
                  type="text"
                  value={simTheatreId}
                  onChange={(e) => setSimTheatreId(e.target.value)}
                  placeholder="e.g. th-pun-001"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">User Scope (Optional User Override)</label>
                <input
                  type="text"
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  placeholder="e.g. usr-vip-99"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <Button
                onClick={handleSimulateResolveFlag}
                disabled={isPending}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
              >
                Resolve Effective Flag
              </Button>

              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-xs text-zinc-400 font-medium">Quick Theatre Override:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleTheatreOverride(true)}
                    className="flex-1 border-emerald-600 text-emerald-400 hover:bg-emerald-950/40"
                  >
                    Force TRUE for Theatre
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleTheatreOverride(false)}
                    className="flex-1 border-rose-600 text-rose-400 hover:bg-rose-950/40"
                  >
                    Force FALSE
                  </Button>
                </div>
              </div>
            </Card>

            {/* Resolution Output */}
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-4 lg:col-span-2">
              <h3 className="font-semibold text-zinc-200 text-sm">Resolution Result</h3>

              {resolvedResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-800/60 border border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400">Effective Evaluation</span>
                      <div className="text-2xl font-bold mt-1 text-zinc-100 flex items-center gap-2">
                        {String(resolvedResult.effectiveValue).toUpperCase()}
                        <Badge
                          variant="outline"
                          className={
                            resolvedResult.effectiveValue
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-rose-500/40 text-rose-400 bg-rose-500/10"
                          }
                        >
                          {resolvedResult.effectiveValue ? "ENABLED" : "DISABLED"}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400">Winning Resolution Tier</span>
                      <div className="text-lg font-bold text-amber-400 mt-1">
                        Tier: {resolvedResult.resolvedLevel}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {resolvedResult.isOverridden ? "Scoped Override Applied" : "Default Precedence"}
                      </span>
                    </div>
                  </div>

                  {/* Precedence Hierarchy Diagram */}
                  <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                      Evaluation Cascade Order
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs pt-1">
                      {[
                        { level: "USER", label: "1. User / Staff" },
                        { level: "THEATRE", label: "2. Theatre Venue" },
                        { level: "ORGANIZATION", label: "3. Circuit / Org" },
                        { level: "PLATFORM", label: "4. Global Core" },
                        { level: "DEFAULT", label: "5. Default Value" },
                      ].map((step) => {
                        const isWinner = resolvedResult.resolvedLevel === step.level;
                        return (
                          <div
                            key={step.level}
                            className={`p-2.5 rounded border text-center transition-all ${
                              isWinner
                                ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm"
                                : "bg-zinc-900/40 border-zinc-800 text-zinc-500"
                            }`}
                          >
                            <div>{step.label}</div>
                            {isWinner && <div className="text-[10px] text-amber-400 mt-1">WINNER</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  <Sliders className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Select scopes and click &quot;Resolve Effective Flag&quot; to test cascading logic.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Dynamic Pricing Simulation */}
      {activeTab === "PRICING" && (
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Dynamic & Surge Pricing Rule Evaluator
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Simulates demand surge, weekend multipliers, and occupancy pricing rules across show contexts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-4 lg:col-span-1">
              <h3 className="font-semibold text-zinc-200 text-sm">Show Context Inputs</h3>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Base Ticket Price (INR)</label>
                <input
                  type="number"
                  value={pricingBasePrice}
                  onChange={(e) => setPricingBasePrice(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Current Hall Occupancy (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pricingOccupancy}
                  onChange={(e) => setPricingOccupancy(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Experience Format</label>
                <select
                  value={pricingFormat}
                  onChange={(e) => setPricingFormat(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200"
                >
                  <option value="IMAX">IMAX</option>
                  <option value="DOLBY_ATMOS">Dolby Atmos</option>
                  <option value="4DX">4DX</option>
                  <option value="2D">Standard 2D</option>
                </select>
              </div>

              <Button
                onClick={handleTestPricingEvaluation}
                disabled={isPending}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
              >
                Evaluate Pricing Multiplier
              </Button>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-4 lg:col-span-2">
              <h3 className="font-semibold text-zinc-200 text-sm">Dynamic Yield Output</h3>

              {pricingResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-800/60 border border-zinc-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400">Effective Calculated Price</span>
                      <div className="text-3xl font-bold mt-1 text-emerald-400">
                        ₹{pricingResult.effectivePrice}
                      </div>
                      <span className="text-xs text-zinc-500">
                        Base: ₹{pricingBasePrice} • Multiplier: {pricingResult.priceMultiplier}x
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400">Feature Flag Status</span>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            pricingResult.dynamicPricingEnabled
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-zinc-700 text-zinc-400"
                          }
                        >
                          {pricingResult.dynamicPricingEnabled ? "ACTIVE ON VENUE" : "BYPASSED (OFF)"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                    <span className="text-xs text-zinc-400 font-semibold uppercase">Applied Surge Rules</span>
                    <div className="text-xs text-zinc-300">
                      {pricingResult.appliedRuleIds.length > 0 ? (
                        pricingResult.appliedRuleIds.map((id: string) => (
                          <div key={id} className="py-1 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Rule ID: {id}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-zinc-500">No surge rules triggered under current occupancy conditions.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Click &quot;Evaluate Pricing Multiplier&quot; to test occupancy surge calculations.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 5: Connected IoT Devices */}
      {activeTab === "DEVICES" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              Connected Auditorium Hardware & Telemetry
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Live device registry tracking smart kiosks, environmental sensors, and digital poster boards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card key={device.deviceId} className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-zinc-200 text-sm">{device.model}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      device.status === "ONLINE"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : "border-zinc-700 text-zinc-400"
                    }
                  >
                    {device.status}
                  </Badge>
                </div>

                <p className="text-xs text-zinc-400 font-mono">{device.deviceId} • {device.deviceType}</p>

                <div className="text-xs space-y-1 text-zinc-500 pt-2 border-t border-zinc-800">
                  <div>IP Address: <span className="text-zinc-300">{device.ipAddress || "DHCP Auto"}</span></div>
                  <div>Firmware: <span className="text-zinc-300">v{device.firmwareVersion}</span></div>
                  <div>Heartbeat: <span className="text-zinc-400">{new Date(device.lastHeartbeat).toLocaleTimeString()}</span></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Domain Event Bus Telemetry Stream */}
      {activeTab === "EVENTS" && (
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              Decoupled Domain Event Bus Telemetry Stream
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Asynchronous event auditing enabling enterprise modules to react without coupling to core operational tables.
            </p>
          </div>

          <Card className="bg-zinc-900/60 border-zinc-800 divide-y divide-zinc-800">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.eventId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-semibold">{event.eventType}</span>
                      <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                        {event.correlationId}
                      </Badge>
                    </div>
                    <p className="text-zinc-400 font-mono text-[11px] truncate max-w-xl">
                      {JSON.stringify(event.data)}
                    </p>
                  </div>

                  <div className="text-right text-zinc-500 shrink-0">
                    <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[10px]">Tenant: {event.tenantId || "Global"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No domain events recorded yet. Click &quot;Simulate Domain Event&quot; to test.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
