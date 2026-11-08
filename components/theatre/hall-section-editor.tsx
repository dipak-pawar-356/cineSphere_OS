"use client";

import React from "react";
import { DynamicHallSectionConfig, SeatCategoryTier } from "@/types/hall.types";
import {
  AVAILABLE_CATEGORIES,
  calculateDynamicRows,
  getCategoryDesignTokens,
  validateHallCapacity,
} from "@/lib/constants/seating-design-system";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Armchair,
} from "lucide-react";

interface HallSectionEditorProps {
  capacity: number;
  sections: DynamicHallSectionConfig[];
  onChange: (sections: DynamicHallSectionConfig[]) => void;
  onApplyPreset?: (capacity: number, sections: DynamicHallSectionConfig[]) => void;
}

export function HallSectionEditor({
  capacity,
  sections,
  onChange,
  onApplyPreset,
}: HallSectionEditorProps) {
  const capacityValidation = validateHallCapacity(capacity, sections);

  // Add a new section
  const handleAddSection = () => {
    const nextOrder = sections.length + 1;
    const defaultCategory: SeatCategoryTier = "Silver";
    const defaultSeatCount = Math.max(10, capacityValidation.remainingSeats > 0 ? capacityValidation.remainingSeats : 20);
    const defaultSeatsPerRow = 10;
    const { rowLabels } = calculateDynamicRows(defaultSeatCount, defaultSeatsPerRow, sections.length * 2);

    const newSection: DynamicHallSectionConfig = {
      id: `sec-${Date.now()}`,
      name: `Section ${String.fromCharCode(64 + nextOrder)}`,
      displayName: `Section ${String.fromCharCode(64 + nextOrder)} Tier`,
      seatCount: defaultSeatCount,
      category: defaultCategory,
      sortOrder: nextOrder,
      visibility: true,
      status: "Active",
      rows: rowLabels,
      seatsPerRow: defaultSeatsPerRow,
    };

    onChange([...sections, newSection]);
  };

  // Update a single section
  const handleUpdateSection = (index: number, updates: Partial<DynamicHallSectionConfig>) => {
    const updated = [...sections];
    const current = updated[index];
    const newConfig = { ...current, ...updates };

    // If seatCount or seatsPerRow changed, recalculate row labels
    if (updates.seatCount !== undefined || updates.seatsPerRow !== undefined) {
      const seatCount = updates.seatCount !== undefined ? Number(updates.seatCount) : current.seatCount;
      const seatsPerRow = updates.seatsPerRow !== undefined ? Number(updates.seatsPerRow) : current.seatsPerRow;
      const { rowLabels } = calculateDynamicRows(seatCount, seatsPerRow, index * 3);
      newConfig.rows = rowLabels;
    }

    updated[index] = newConfig;
    onChange(updated);
  };

  // Remove section
  const handleRemoveSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      sortOrder: idx + 1,
    }));
    onChange(updated);
  };

  // Move section Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = { ...updated[index], sortOrder: index };
    updated[index] = { ...temp, sortOrder: index + 1 };
    onChange(updated);
  };

  // Move section Down
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = { ...updated[index], sortOrder: index + 2 };
    updated[index] = { ...temp, sortOrder: index + 1 };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Live Capacity Barometer & Summary Card */}
      <Card
        variant="elevated"
        className={`p-5 rounded-2xl border transition-all ${
          capacityValidation.isValid
            ? "border-emerald-500/40 bg-[#064E3B]/10"
            : capacityValidation.status === "over_allocated"
            ? "border-rose-500/40 bg-[#881337]/10"
            : "border-amber-500/40 bg-[#78350F]/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {capacityValidation.isValid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : capacityValidation.status === "over_allocated" ? (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              )}
              <h4 className="text-sm font-bold text-white">Live Capacity Allocation Summary</h4>
              <Badge
                variant={
                  capacityValidation.isValid
                    ? "success"
                    : capacityValidation.status === "over_allocated"
                    ? "danger"
                    : "warning"
                }
                size="sm"
                className="font-mono uppercase font-bold"
              >
                {capacityValidation.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-[#CBD5E1] pl-7">{capacityValidation.message}</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono pl-7 sm:pl-0">
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Hall Capacity</span>
              <span className="text-lg font-bold text-white">{capacity}</span>
            </div>
            <div className="h-8 w-px bg-[#2A3445]" />
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Allocated</span>
              <span
                className={`text-lg font-bold ${
                  capacityValidation.isValid
                    ? "text-emerald-400"
                    : capacityValidation.status === "over_allocated"
                    ? "text-rose-400"
                    : "text-amber-400"
                }`}
              >
                {capacityValidation.configuredSeats}
              </span>
            </div>
            <div className="h-8 w-px bg-[#2A3445]" />
            <div className="text-right">
              <span className="text-[10px] text-[#94A3B8] block uppercase">Remaining</span>
              <span className="text-lg font-bold text-[#FBBF24]">
                {capacityValidation.remainingSeats}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="mt-4 pt-3 border-t border-[#1E293B]/70">
          <div className="h-2 w-full rounded-full bg-[#111827] overflow-hidden flex">
            {sections.map((sec) => {
              const tokens = getCategoryDesignTokens(sec.category);
              const widthPct = capacity > 0 ? (sec.seatCount / capacity) * 100 : 0;
              return (
                <div
                  key={sec.id}
                  style={{
                    width: `${Math.min(100, widthPct)}%`,
                    backgroundColor: tokens.color,
                  }}
                  title={`${sec.name}: ${sec.seatCount} seats (${Math.round(widthPct)}%)`}
                  className="h-full transition-all duration-300"
                />
              );
            })}
          </div>
        </div>
      </Card>

      {/* Preset Fast-Allocations */}
      {onApplyPreset && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs">
          <span className="text-xs text-[#94A3B8] flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#FBBF24]" />
            Quick Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onApplyPreset(100, [
                  {
                    id: "sec-a",
                    name: "Section A",
                    displayName: "Silver Tier",
                    seatCount: 20,
                    category: "Silver",
                    sortOrder: 1,
                    visibility: true,
                    status: "Active",
                    rows: ["A", "B"],
                    seatsPerRow: 10,
                  },
                  {
                    id: "sec-b",
                    name: "Section B",
                    displayName: "Gold Tier",
                    seatCount: 30,
                    category: "Gold",
                    sortOrder: 2,
                    visibility: true,
                    status: "Active",
                    rows: ["C", "D", "E"],
                    seatsPerRow: 10,
                  },
                  {
                    id: "sec-c",
                    name: "Section C",
                    displayName: "Platinum Tier",
                    seatCount: 50,
                    category: "Platinum",
                    sortOrder: 3,
                    visibility: true,
                    status: "Active",
                    rows: ["F", "G", "H", "I", "J"],
                    seatsPerRow: 10,
                  },
                ]);
              }}
              className="text-[11px] border-[#2A3445] hover:bg-[#1E293B]"
            >
              Galaxy 100 (A:20, B:30, C:50)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onApplyPreset(240, [
                  {
                    id: "sec-roy",
                    name: "VIP Loungers",
                    displayName: "VIP Recliner Tier",
                    seatCount: 40,
                    category: "VIP Recliner",
                    sortOrder: 1,
                    visibility: true,
                    status: "Active",
                    rows: ["A", "B"],
                    seatsPerRow: 20,
                  },
                  {
                    id: "sec-plat",
                    name: "Platinum Club",
                    displayName: "Platinum Tier",
                    seatCount: 100,
                    category: "Platinum",
                    sortOrder: 2,
                    visibility: true,
                    status: "Active",
                    rows: ["C", "D", "E", "F", "G"],
                    seatsPerRow: 20,
                  },
                  {
                    id: "sec-gold",
                    name: "Gold Prime",
                    displayName: "Gold Tier",
                    seatCount: 100,
                    category: "Gold",
                    sortOrder: 3,
                    visibility: true,
                    status: "Active",
                    rows: ["H", "I", "J", "K", "L"],
                    seatsPerRow: 20,
                  },
                ]);
              }}
              className="text-[11px] border-[#2A3445] hover:bg-[#1E293B]"
            >
              Royale 240 (40 / 100 / 100)
            </Button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#FBBF24]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Configured Sections ({sections.length})
            </h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSection}
            className="gap-1.5 border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/10"
          >
            <Plus className="h-3.5 w-3.5" /> Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-[#2A3445] text-center space-y-3">
            <Armchair className="h-8 w-8 text-[#64748B] mx-auto" />
            <p className="text-sm text-white font-medium">No sections defined yet.</p>
            <p className="text-xs text-[#94A3B8]">
              Click &quot;Add Section&quot; above or choose a preset to begin configuring auditorium tiers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, idx) => {
              const tokens = getCategoryDesignTokens(section.category);
              const rowCount = section.rows?.length || Math.ceil(section.seatCount / (section.seatsPerRow || 10));

              return (
                <div
                  key={section.id}
                  className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-4 hover:border-[#2A3445] transition-all"
                >
                  {/* Section Row Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: tokens.color }}
                      />
                      <span className="text-xs font-mono font-bold text-[#64748B]">#{idx + 1}</span>
                      <span className="text-sm font-bold text-white">{section.name || `Section ${idx + 1}`}</span>
                      <Badge
                        variant="outline"
                        size="sm"
                        className="font-mono text-[10px]"
                        style={{
                          borderColor: `${tokens.color}50`,
                          color: tokens.color,
                        }}
                      >
                        {section.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Reorder Buttons */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>

                      {/* Visibility Toggle */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleUpdateSection(idx, { visibility: !section.visibility })}
                        className="h-7 w-7 p-0 text-[#94A3B8] hover:text-white"
                        title={section.visibility ? "Visible to customers" : "Hidden"}
                      >
                        {section.visibility ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-[#64748B]" />}
                      </Button>

                      {/* Delete Section */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveSection(idx)}
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Section"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Config Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Section Name */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Section Name
                      </label>
                      <Input
                        value={section.name}
                        onChange={(e) => handleUpdateSection(idx, { name: e.target.value })}
                        placeholder="e.g. Section A"
                        className="h-8 text-xs bg-[#0B0F19] border-[#2A3445]"
                      />
                    </div>

                    {/* Category Tier Selector */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Category Tier
                      </label>
                      <select
                        value={section.category}
                        onChange={(e) => handleUpdateSection(idx, { category: e.target.value as SeatCategoryTier })}
                        className="w-full h-8 px-2.5 rounded-lg bg-[#0B0F19] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seat Count */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Seat Count
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={section.seatCount || ""}
                        onChange={(e) => handleUpdateSection(idx, { seatCount: Math.max(1, parseInt(e.target.value) || 0) })}
                        className="h-8 text-xs font-mono bg-[#0B0F19] border-[#2A3445]"
                      />
                    </div>

                    {/* Seats Per Row */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Seats Per Row ({rowCount} rows)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={section.seatsPerRow || ""}
                        onChange={(e) => handleUpdateSection(idx, { seatsPerRow: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="h-8 text-xs font-mono bg-[#0B0F19] border-[#2A3445]"
                      />
                    </div>
                  </div>

                  {/* Calculated Dynamic Rows Pill */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#64748B] pt-1 border-t border-[#1E293B]/60 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span>Row Breakdown:</span>
                      <span className="text-white font-semibold">
                        {section.rows?.join(", ") || "A, B"}
                      </span>
                    </span>
                    <span>
                      {section.seatsPerRow} seats/row • {rowCount} physical rows
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
