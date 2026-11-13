"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  CalendarDays,
  Wrench,
  Sparkles,
  History,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";
import type {
  TheatreOperatingBundle,
  UpsertTheatreOperatingProfileInput,
  UpsertWeeklyScheduleInput,
  AddHolidayScheduleInput,
  AddMaintenanceScheduleInput,
  AddSpecialOperatingEventInput,
} from "@/types/theatre-operating-hours.types";
import {
  OperatingStatusBadge,
  MaintenanceStatusBadge,
  SpecialEventTypeBadge,
} from "./operating-status-badge";
import { RegularHoursModal } from "./regular-hours-modal";
import { HolidayScheduleModal } from "./holiday-schedule-modal";
import { MaintenanceScheduleModal } from "./maintenance-schedule-modal";
import { SpecialEventModal } from "./special-event-modal";

interface OperatingWorkspaceProps {
  theatreId: string;
  initialBundle: TheatreOperatingBundle;
  isSuperAdmin?: boolean;
  onSaveProfile: (input: UpsertTheatreOperatingProfileInput) => Promise<void>;
  onSaveWeekly: (input: UpsertWeeklyScheduleInput) => Promise<void>;
  onAddHoliday: (input: AddHolidayScheduleInput) => Promise<void>;
  onDeleteHoliday: (holidayId: string) => Promise<void>;
  onAddMaintenance: (input: AddMaintenanceScheduleInput) => Promise<void>;
  onDeleteMaintenance: (maintenanceId: string) => Promise<void>;
  onAddSpecialEvent: (input: AddSpecialOperatingEventInput) => Promise<void>;
  onDeleteSpecialEvent: (eventId: string) => Promise<void>;
}

export function TheatreOperatingHoursWorkspace({
  theatreId,
  initialBundle,
  isSuperAdmin = false,
  onSaveProfile,
  onSaveWeekly,
  onAddHoliday,
  onDeleteHoliday,
  onAddMaintenance,
  onDeleteMaintenance,
  onAddSpecialEvent,
  onDeleteSpecialEvent,
}: OperatingWorkspaceProps) {
  const [bundle, setBundle] = useState<TheatreOperatingBundle>(initialBundle);
  const [activeTab, setActiveTab] = useState<"weekly" | "holidays" | "maintenance" | "events" | "audit">("weekly");
  const [regularModalOpen, setRegularModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [specialEventModalOpen, setSpecialEventModalOpen] = useState(false);

  const profile = bundle.profile;
  const weekly = bundle.weeklySchedules || [];
  const holidays = bundle.holidays || [];
  const maintenance = bundle.maintenanceWindows || [];
  const events = bundle.specialEvents || [];
  const versions = bundle.versions || [];

  const handleProfileSave = async (input: UpsertTheatreOperatingProfileInput) => {
    await onSaveProfile(input);
    setBundle((prev) => ({
      ...prev,
      profile: prev.profile
        ? {
            ...prev.profile,
            regularOpeningTime: input.regularOpeningTime || prev.profile.regularOpeningTime,
            regularClosingTime: input.regularClosingTime || prev.profile.regularClosingTime,
            timezone: input.timezone || prev.profile.timezone,
            is24x7: input.is24x7 !== undefined ? input.is24x7 : prev.profile.is24x7,
            lateNightClosing: input.lateNightClosing !== undefined ? input.lateNightClosing : prev.profile.lateNightClosing,
            version: prev.profile.version + 1,
          }
        : null,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Theatre Operating Hours & Schedules
              </h2>
              {profile && <OperatingStatusBadge status={profile.status} size="sm" />}
            </div>
            <p className="text-xs text-[#94A3B8]">
              Manage daily opening/closing times, weekly rotations, holiday adjustments, and technical maintenance outages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRegularModalOpen(true)}
              className="border-[#2A3445] text-white hover:border-[#FBBF24]"
            >
              <Clock className="w-4 h-4 mr-1.5 text-[#FBBF24]" />
              Configure Regular Hours
            </Button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1E293B]">
          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Regular Hours</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {profile?.regularOpeningTime || "09:00"} – {profile?.regularClosingTime || "23:30"}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Active Timezone</div>
            <div className="text-xs font-bold text-[#FBBF24] font-mono mt-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {profile?.timezone || "Asia/Kolkata"}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Weekly Operating</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {weekly.filter((w) => w.isOpen).length} / 7 Days Open
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#070B12] border border-[#1E293B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Scheduled Outages</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
              {maintenance.length} Maintenance Window{maintenance.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#1E293B] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "weekly"
              ? "bg-[#FBBF24] text-black font-bold shadow-md"
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Schedule ({weekly.length})
        </button>

        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "holidays"
              ? "bg-[#FBBF24] text-black font-bold shadow-md"
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Holiday Calendar ({holidays.length})
        </button>

        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "maintenance"
              ? "bg-[#FBBF24] text-black font-bold shadow-md"
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
          }`}
        >
          <Wrench className="w-4 h-4" />
          Technical Maintenance ({maintenance.length})
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "events"
              ? "bg-[#FBBF24] text-black font-bold shadow-md"
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Special Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "audit"
              ? "bg-[#FBBF24] text-black font-bold shadow-md"
              : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
          }`}
        >
          <History className="w-4 h-4" />
          Version Audit Ledger ({versions.length})
        </button>
      </div>

      {/* Tab 1: Weekly Schedule */}
      {activeTab === "weekly" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                7-Day Weekly Schedule Matrix
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Configured operating hours for every day of the week.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {weekly.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No weekly schedule configured. Standard regular hours apply.
              </div>
            ) : (
              weekly.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-28 text-xs font-bold text-white">{item.dayOfWeek}</div>
                    <Badge variant={item.isOpen ? "success" : "secondary"} size="sm">
                      {item.isOpen ? "Open" : "Closed"}
                    </Badge>
                    {item.isOvernight && (
                      <Badge variant="outline" size="sm">
                        Overnight
                      </Badge>
                    )}
                  </div>

                  <div className="text-right">
                    {item.isOpen ? (
                      <span className="text-xs font-mono font-bold text-white">
                        {item.openTime} – {item.closeTime}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748B]">Auditoriums Dark</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Holiday Calendar */}
      {activeTab === "holidays" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                Cultural & Statutory Holiday Calendar
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Overrides standard weekly hours on specific calendar festival dates.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setHolidayModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Holiday
            </Button>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {holidays.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No special holiday schedules configured yet.
              </div>
            ) : (
              holidays.map((h) => (
                <div key={h.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{h.holidayName}</span>
                      <span className="text-xs font-mono text-[#FBBF24] font-semibold">
                        ({h.holidayDate})
                      </span>
                      <Badge variant={h.isClosed ? "danger" : "warning"} size="sm">
                        {h.isClosed ? "Full Closure" : "Partial Hours"}
                      </Badge>
                    </div>
                    {h.notes && <div className="text-xs text-[#94A3B8] mt-0.5">{h.notes}</div>}
                    {!h.isClosed && h.partialOpenTime && h.partialCloseTime && (
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">
                        Hours: {h.partialOpenTime} – {h.partialCloseTime}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteHoliday(h.id)}
                    className="p-1.5 h-auto text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Maintenance Schedule */}
      {activeTab === "maintenance" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                Auditorium & Infrastructure Maintenance Windows
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Scheduled non-operational windows for acoustic tuning, projector optical servicing, and seat overhaul.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMaintenanceModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule Maintenance
            </Button>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {maintenance.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No maintenance outages currently scheduled.
              </div>
            ) : (
              maintenance.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.reason}</span>
                      <MaintenanceStatusBadge status={m.status} />
                    </div>
                    <div className="text-xs text-[#94A3B8] font-mono">
                      Date: {m.maintenanceDate} • Window: {m.startTime} – {m.endTime} • Affected: {m.affectedHalls.join(", ")}
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteMaintenance(m.id)}
                    className="p-1.5 h-auto text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Special Events */}
      {activeTab === "events" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
                Special Operating Events & Midnight Premieres
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Extended operational opening and closing hours for film premieres and corporate events.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSpecialEventModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Special Event
            </Button>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No special operating events scheduled.
              </div>
            ) : (
              events.map((e) => (
                <div key={e.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{e.eventName}</span>
                      <SpecialEventTypeBadge type={e.eventType} />
                    </div>
                    <div className="text-xs text-[#94A3B8] font-mono">
                      Dates: {e.startDate} {e.startDate !== e.endDate && `to ${e.endDate}`} • Hours: {e.openTime} – {e.closeTime}
                    </div>
                    {e.notes && <div className="text-xs text-[#64748B]">{e.notes}</div>}
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDeleteSpecialEvent(e.id)}
                    className="p-1.5 h-auto text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 5: Version Audit Ledger */}
      {activeTab === "audit" && (
        <Card className="p-6 bg-[#0B132B]/80 border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#FBBF24]">
              Immutable Operating Profile Version History
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Cryptographic snapshots recorded on every modification to operating hours, holidays, or outages.
            </p>
          </div>

          <div className="divide-y divide-[#1E293B]">
            {versions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No recorded version history yet.
              </div>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">v{v.versionNumber}</span>
                      <Badge variant="outline" size="sm">
                        {v.changeType}
                      </Badge>
                    </div>
                    {v.changeSummary && (
                      <div className="text-xs text-[#94A3B8] mt-0.5">{v.changeSummary}</div>
                    )}
                  </div>
                  <div className="text-right text-[10px] font-mono text-[#64748B]">
                    <div>{new Date(v.createdAt).toLocaleDateString()}</div>
                    <div>By: {v.changedBy || "System"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      {regularModalOpen && (
        <RegularHoursModal
          isOpen={regularModalOpen}
          onClose={() => setRegularModalOpen(false)}
          theatreId={theatreId}
          profile={profile}
          onSave={handleProfileSave}
        />
      )}

      {holidayModalOpen && (
        <HolidayScheduleModal
          isOpen={holidayModalOpen}
          onClose={() => setHolidayModalOpen(false)}
          theatreId={theatreId}
          onSave={onAddHoliday}
        />
      )}

      {maintenanceModalOpen && (
        <MaintenanceScheduleModal
          isOpen={maintenanceModalOpen}
          onClose={() => setMaintenanceModalOpen(false)}
          theatreId={theatreId}
          onSave={onAddMaintenance}
        />
      )}

      {specialEventModalOpen && (
        <SpecialEventModal
          isOpen={specialEventModalOpen}
          onClose={() => setSpecialEventModalOpen(false)}
          theatreId={theatreId}
          onSave={onAddSpecialEvent}
        />
      )}
    </div>
  );
}
