"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TheatreOperatingHoursWorkspace } from "./theatre-operating-hours-workspace";
import {
  getTheatreOperatingBundleAction,
  upsertTheatreOperatingProfileAction,
  upsertWeeklyScheduleAction,
  addHolidayScheduleAction,
  deleteHolidayScheduleAction,
  addMaintenanceScheduleAction,
  deleteMaintenanceScheduleAction,
  addSpecialOperatingEventAction,
  deleteSpecialOperatingEventAction,
} from "@/actions/theatre-operating-hours-actions";
import type {
  TheatreOperatingBundle,
  UpsertTheatreOperatingProfileInput,
  UpsertWeeklyScheduleInput,
  AddHolidayScheduleInput,
  AddMaintenanceScheduleInput,
  AddSpecialOperatingEventInput,
} from "@/types/theatre-operating-hours.types";

interface ConnectedOperatingHoursWorkspaceProps {
  theatreId: string;
  isSuperAdmin?: boolean;
  initialBundle?: TheatreOperatingBundle;
}

export function ConnectedOperatingHoursWorkspace({
  theatreId,
  isSuperAdmin = false,
  initialBundle,
}: ConnectedOperatingHoursWorkspaceProps) {
  const [loading, setLoading] = useState(!initialBundle);
  const [bundle, setBundle] = useState<TheatreOperatingBundle | null>(initialBundle || null);
  const [error, setError] = useState<string | null>(null);

  const fetchBundle = useCallback(async () => {
    try {
      const res = await getTheatreOperatingBundleAction({ theatreId });
      if (res.success && res.data) {
        setBundle(res.data);
      } else if (!res.success) {
        setError(res.error?.message || "Failed to load theatre operating profile");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load operating profile");
    } finally {
      setLoading(false);
    }
  }, [theatreId]);

  useEffect(() => {
    if (!initialBundle) {
      void fetchBundle();
    }
  }, [fetchBundle, initialBundle]);

  const handleSaveProfile = async (data: UpsertTheatreOperatingProfileInput) => {
    const res = await upsertTheatreOperatingProfileAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update operating profile");
    }
    await fetchBundle();
  };

  const handleSaveWeekly = async (data: UpsertWeeklyScheduleInput) => {
    const res = await upsertWeeklyScheduleAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to update weekly schedule");
    }
    await fetchBundle();
  };

  const handleAddHoliday = async (data: AddHolidayScheduleInput) => {
    const res = await addHolidayScheduleAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to add holiday schedule");
    }
    await fetchBundle();
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    const res = await deleteHolidayScheduleAction({ theatreId, holidayId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to remove holiday schedule");
    }
    await fetchBundle();
  };

  const handleAddMaintenance = async (data: AddMaintenanceScheduleInput) => {
    const res = await addMaintenanceScheduleAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to schedule maintenance window");
    }
    await fetchBundle();
  };

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    const res = await deleteMaintenanceScheduleAction({ theatreId, maintenanceId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to cancel maintenance window");
    }
    await fetchBundle();
  };

  const handleAddSpecialEvent = async (data: AddSpecialOperatingEventInput) => {
    const res = await addSpecialOperatingEventAction(data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || "Failed to schedule special event");
    }
    await fetchBundle();
  };

  const handleDeleteSpecialEvent = async (eventId: string) => {
    const res = await deleteSpecialOperatingEventAction({ theatreId, eventId });
    if (!res.success) {
      throw new Error(res.error?.message || "Failed to remove special event");
    }
    await fetchBundle();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FBBF24] mb-3" />
        <p className="text-sm">Loading theatre operating hours and schedules...</p>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="p-6 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Error Loading Operating Hours</h4>
          <p className="text-xs opacity-90">{error || "No operating configuration available."}</p>
        </div>
      </div>
    );
  }

  return (
    <TheatreOperatingHoursWorkspace
      theatreId={theatreId}
      initialBundle={bundle}
      isSuperAdmin={isSuperAdmin}
      onSaveProfile={handleSaveProfile}
      onSaveWeekly={handleSaveWeekly}
      onAddHoliday={handleAddHoliday}
      onDeleteHoliday={handleDeleteHoliday}
      onAddMaintenance={handleAddMaintenance}
      onDeleteMaintenance={handleDeleteMaintenance}
      onAddSpecialEvent={handleAddSpecialEvent}
      onDeleteSpecialEvent={handleDeleteSpecialEvent}
    />
  );
}
