"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  HallAnalyticsReport,
  HallAnalyticsDashboardData,
  HallAnalyticsConfiguration,
  HallAnalyticsExportEnvelope,
  OccupancySimulationResult,
  RevenueSimulationInput,
  RevenueSimulationResult,
} from "@/types/hall-analytics.types";
import {
  generateHallAnalyticsAction,
  refreshHallAnalyticsAction,
  runHallSimulationsAction,
  loadHallAnalyticsDashboardAction,
  exportHallAnalyticsAction,
  loadHallAnalyticsConfigAction,
  saveHallAnalyticsConfigAction,
} from "@/actions/hall-analytics-actions";

export interface UseHallAnalyticsOptions {
  theatreId: string;
  hallId?: string;
}

export function useHallAnalytics({ theatreId, hallId }: UseHallAnalyticsOptions) {
  const [dashboard, setDashboard] = useState<HallAnalyticsDashboardData | null>(null);
  const [activeReport, setActiveReport] = useState<HallAnalyticsReport | null>(null);
  const [config, setConfig] = useState<HallAnalyticsConfiguration | null>(null);
  const [simulations, setSimulations] = useState<{
    occupancy: OccupancySimulationResult | null;
    revenue: RevenueSimulationResult | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reportCacheRef = useRef<Map<string, HallAnalyticsReport>>(new Map());

  const loadDashboard = useCallback(
    async (targetHallId?: string) => {
      if (!theatreId) return null;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await loadHallAnalyticsDashboardAction({
          theatreId,
          hallId: targetHallId || hallId,
        });
        if (res.success && res.data) {
          setDashboard(res.data);
          setConfig(res.data.configuration);
          if (res.data.reports.length > 0 && !activeReport) {
            setActiveReport(res.data.reports[0]);
          }
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to load hall analytics dashboard.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load hall analytics dashboard.");
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId, hallId, activeReport]
  );

  const generateReport = useCallback(
    async (params: { targetHallId?: string; layoutVersionId?: string; showId?: string; forceRefresh?: boolean }) => {
      const targetHall = params.targetHallId || hallId;
      if (!theatreId || !targetHall) return null;

      const cacheKey = `${theatreId}:${targetHall}:${params.layoutVersionId || "latest"}`;
      if (!params.forceRefresh && reportCacheRef.current.has(cacheKey)) {
        const cached = reportCacheRef.current.get(cacheKey)!;
        setActiveReport(cached);
        return cached;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        const action = params.forceRefresh ? refreshHallAnalyticsAction : generateHallAnalyticsAction;
        const res = await action({
          theatreId,
          hallId: targetHall,
          layoutVersionId: params.layoutVersionId,
          showId: params.showId,
        });
        if (res.success && res.data) {
          reportCacheRef.current.set(cacheKey, res.data);
          setActiveReport(res.data);
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to generate hall analytics.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to generate hall analytics.");
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [theatreId, hallId]
  );

  const runSimulations = useCallback(
    async (input: Omit<RevenueSimulationInput, "theatreId" | "hallId"> & { targetHallId?: string }) => {
      const targetHall = input.targetHallId || hallId;
      if (!theatreId || !targetHall) return null;

      setIsSimulating(true);
      setErrorMessage(null);
      try {
        const res = await runHallSimulationsAction({
          ...input,
          theatreId,
          hallId: targetHall,
        });
        if (res.success && res.data) {
          setSimulations(res.data);
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to execute hall simulations.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to execute hall simulations.");
      } finally {
        setIsSimulating(false);
      }
      return null;
    },
    [theatreId, hallId]
  );

  const exportAnalytics = useCallback(
    async (format: HallAnalyticsExportEnvelope["format"] = "JSON"): Promise<HallAnalyticsExportEnvelope | null> => {
      if (!theatreId) return null;
      try {
        const res = await exportHallAnalyticsAction({ theatreId, format, hallId });
        if (res.success && res.data) {
          return res.data;
        }
        setErrorMessage(res.error?.message || "Failed to export hall analytics.");
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to export hall analytics.");
      }
      return null;
    },
    [theatreId, hallId]
  );

  const loadConfig = useCallback(async () => {
    if (!theatreId) return null;
    const res = await loadHallAnalyticsConfigAction({ theatreId });
    if (res.success && res.data) {
      setConfig(res.data);
      return res.data;
    }
    return null;
  }, [theatreId]);

  const saveConfig = useCallback(
    async (updates: Partial<HallAnalyticsConfiguration>) => {
      if (!theatreId) return null;
      const res = await saveHallAnalyticsConfigAction({ ...updates, theatreId });
      if (res.success && res.data) {
        setConfig(res.data);
        return res.data;
      }
      return null;
    },
    [theatreId]
  );

  const overallHealth = useMemo(() => activeReport?.layoutHealth.overallDesignHealth ?? 0, [activeReport]);
  const maxRevenue = useMemo(
    () => activeReport?.revenueSimulation.maxPotentialGrossRevenue ?? 0,
    [activeReport]
  );

  return {
    dashboard,
    activeReport,
    config,
    simulations,
    isLoading,
    isSimulating,
    errorMessage,
    overallHealth,
    maxRevenue,
    loadDashboard,
    generateReport,
    runSimulations,
    exportAnalytics,
    loadConfig,
    saveConfig,
  };
}
