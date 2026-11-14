"use client";

import React, { useState } from "react";
import { TheatreDashboardWorkspace } from "./theatre-dashboard-workspace";
import {
  TheatreDashboardBundle,
  DashboardFilterInput,
  UserDashboardPreferences,
} from "@/types/theatre-dashboard.types";
import {
  loadTheatreDashboardAction,
  refreshTheatreDashboardAction,
  updateUserDashboardPreferencesAction,
} from "@/actions/theatre-dashboard-actions";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

interface ConnectedTheatreDashboardProps {
  initialBundle: TheatreDashboardBundle;
}

export function ConnectedTheatreDashboard({ initialBundle }: ConnectedTheatreDashboardProps) {
  const [bundle, setBundle] = useState<TheatreDashboardBundle>(initialBundle);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleRefresh = async (filter?: Partial<DashboardFilterInput>) => {
    setIsRefreshing(true);
    try {
      const mergedFilter: DashboardFilterInput = {
        theatreId: bundle.theatreId,
        periodPreset: filter?.periodPreset || bundle.filter.periodPreset,
        hallId: filter?.hallId !== undefined ? filter.hallId : bundle.filter.hallId,
        movieId: filter?.movieId !== undefined ? filter.movieId : bundle.filter.movieId,
        showId: filter?.showId !== undefined ? filter.showId : bundle.filter.showId,
      };

      const res = await loadTheatreDashboardAction(mergedFilter);
      if (res.success && res.data) {
        setBundle(res.data);
        showNotice("success", `Dashboard synchronized with ${mergedFilter.periodPreset.replace("_", " ")} metrics.`);
      } else {
        throw new Error(res.error?.message || "Failed to reload metrics.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refresh dashboard metrics.";
      showNotice("error", msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSavePreferences = async (prefs: Partial<UserDashboardPreferences>) => {
    try {
      const res = await updateUserDashboardPreferencesAction({
        theatreId: bundle.theatreId,
        visibleWidgetIds: prefs.visibleWidgetIds,
        defaultDatePreset: prefs.defaultDatePreset,
        widgetOrder: prefs.widgetOrder,
        collapsedWidgetIds: prefs.collapsedWidgetIds,
        favoriteWidgetIds: prefs.favoriteWidgetIds,
      });

      if (res.success && res.data) {
        setBundle((prev) => ({
          ...prev,
          userPreferences: res.data!,
        }));
        showNotice("success", "Dashboard layout preferences persisted.");
      } else {
        throw new Error(res.error?.message || "Failed to update layout preferences.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update layout preferences.";
      showNotice("error", msg);
    }
  };

  return (
    <div className="relative space-y-4">
      {notice && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            notice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <TheatreDashboardWorkspace
        bundle={bundle}
        onRefresh={handleRefresh}
        onSavePreferences={handleSavePreferences}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
