"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  X,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Calendar,
} from "lucide-react";
import {
  DashboardWidgetDefinition,
  UserDashboardPreferences,
  DashboardTimeFilterPreset,
} from "@/types/theatre-dashboard.types";

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredWidgets: DashboardWidgetDefinition[];
  currentPreferences: UserDashboardPreferences;
  onSavePreferences: (prefs: Partial<UserDashboardPreferences>) => Promise<void>;
}

export function WidgetCustomizerModal({
  isOpen,
  onClose,
  registeredWidgets,
  currentPreferences,
  onSavePreferences,
}: WidgetCustomizerModalProps) {
  const [visibleIds, setVisibleIds] = useState<string[]>(currentPreferences.visibleWidgetIds);
  const [defaultPreset, setDefaultPreset] = useState<DashboardTimeFilterPreset>(
    currentPreferences.defaultDatePreset || "TODAY"
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleVisibility = (id: string) => {
    setVisibleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    const allIds = registeredWidgets.map((w) => w.id);
    setVisibleIds(allIds);
    setDefaultPreset("TODAY");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSavePreferences({
        visibleWidgetIds: visibleIds,
        defaultDatePreset: defaultPreset,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D1525] border border-[#2A3445] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2A3445] bg-[#111827]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B]">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Dashboard Personalization</h3>
              <p className="text-xs text-[#94A3B8]">
                Configure widget visibility and default operational presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Default Date Preset Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block">
              Default Startup Period Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["TODAY", "YESTERDAY", "THIS_WEEK", "THIS_MONTH"] as DashboardTimeFilterPreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDefaultPreset(preset)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      defaultPreset === preset
                        ? "bg-[#F59E0B] text-black border-[#F59E0B] font-bold shadow-md"
                        : "bg-[#111827] text-zinc-300 border-[#2A3445] hover:border-zinc-500/40"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {preset.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Widget Visibility Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Registered Dashboard Widgets ({visibleIds.length}/{registeredWidgets.length} Active)
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>

            <div className="space-y-2 divide-y divide-[#2A3445]/50 border border-[#2A3445] rounded-xl bg-[#111827] overflow-hidden">
              {registeredWidgets.map((widget) => {
                const isVisible = visibleIds.includes(widget.id);
                return (
                  <div
                    key={widget.id}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-[#161F2E]/60 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{widget.title}</span>
                        <Badge variant="outline" size="sm" className="border-[#2A3445] text-[10px]">
                          {widget.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{widget.description}</p>
                    </div>

                    <Button
                      variant={isVisible ? "primary" : "outline"}
                      size="xs"
                      onClick={() => toggleVisibility(widget.id)}
                      className={`gap-1.5 shrink-0 ${!isVisible ? "border-[#2A3445] text-zinc-400" : ""}`}
                    >
                      {isVisible ? (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Hidden
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2A3445] bg-[#111827] flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="border-[#2A3445]">
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Check className="h-4 w-4" /> {saving ? "Saving..." : "Apply Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}
