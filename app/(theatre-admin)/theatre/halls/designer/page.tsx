"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  Layers,
  Save,
  CheckCircle2,
  Box,
  Sliders,
  Eye,
  Info,
  RefreshCw,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  HallSection,
  HallLayout,
  SeatType,
  ShowSeat,
} from "@/types";
import {
  generateHallLayout,
  generateShowSeatInventory,
} from "@/lib/engine/seat-generator";
import { HallLayoutRenderer } from "@/components/cinema-engine/hall-layout-renderer";
import { SeatLegend } from "@/components/cinema-engine/seat-legend";

// Default 100-seat configuration (Galaxy Multiplex Hall 1 specification)
const DEFAULT_100_SEATS_CONFIG: HallSection[] = [
  {
    id: "sec-a",
    name: "Section A",
    seatCount: 20,
    seatType: "VIP",
    color: "#38BDF8", // Blue
    displayOrder: 1,
    rows: ["A", "B"],
    seatsPerRow: 10,
  },
  {
    id: "sec-b",
    name: "Section B",
    seatCount: 30,
    seatType: "Standard",
    color: "#FBBF24", // Gold
    displayOrder: 2,
    rows: ["C", "D", "E"],
    seatsPerRow: 10,
  },
  {
    id: "sec-c",
    name: "Section C",
    seatCount: 50,
    seatType: "Standard",
    color: "#10B981", // Green
    displayOrder: 3,
    rows: ["F", "G", "H", "I", "J"],
    seatsPerRow: 10,
  },
];

const PRESETS = [
  {
    id: "preset-100",
    name: "Galaxy Hall 1 (100 Seats: A:20, B:30, C:50)",
    capacity: 100,
    sections: DEFAULT_100_SEATS_CONFIG,
  },
  {
    id: "preset-240",
    name: "Mumbai Royale (240 Seats: Royal 40, Plat 100, Gold 100)",
    capacity: 240,
    sections: [
      {
        id: "sec-royal",
        name: "Royal Suite",
        seatCount: 40,
        seatType: "Recliner" as SeatType,
        color: "#F59E0B",
        displayOrder: 1,
        rows: ["A", "B"],
        seatsPerRow: 20,
      },
      {
        id: "sec-plat",
        name: "Platinum Club",
        seatCount: 100,
        seatType: "VIP" as SeatType,
        color: "#A855F7",
        displayOrder: 2,
        rows: ["C", "D", "E", "F", "G"],
        seatsPerRow: 20,
      },
      {
        id: "sec-gold",
        name: "Gold Prime",
        seatCount: 100,
        seatType: "Standard" as SeatType,
        color: "#10B981",
        displayOrder: 3,
        rows: ["H", "I", "J", "K", "L"],
        seatsPerRow: 20,
      },
    ],
  },
  {
    id: "preset-68",
    name: "Ahmedabad Boutique (68 Seats: Recliners 28, Prime 40)",
    capacity: 68,
    sections: [
      {
        id: "sec-ahd-rec",
        name: "Zero-G Recliners",
        seatCount: 28,
        seatType: "Recliner" as SeatType,
        color: "#F43F5E",
        displayOrder: 1,
        rows: ["A", "B"],
        seatsPerRow: 14,
      },
      {
        id: "sec-ahd-prime",
        name: "Prime Club",
        seatCount: 40,
        seatType: "Standard" as SeatType,
        color: "#38BDF8",
        displayOrder: 2,
        rows: ["C", "D"],
        seatsPerRow: 20,
      },
    ],
  },
];

export default function TheatreHallDesignerPage() {
  const [hallName, setHallName] = useState("Hall 1 - IMAX with Laser");
  const [screenNumber, setScreenNumber] = useState(1);
  const [screenType, setScreenType] = useState("IMAX Laser");
  const [soundSystem, setSoundSystem] = useState("IMAX 12-Channel High-Dynamic Precision Array");
  const [sections, setSections] = useState<HallSection[]>(DEFAULT_100_SEATS_CONFIG);
  const [isSaved, setIsSaved] = useState(false);

  // Load a preset
  const handleApplyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSections(JSON.parse(JSON.stringify(preset.sections)));
      setIsSaved(false);
    }
  };

  // Add Section
  const handleAddSection = () => {
    const nextChar = String.fromCharCode(65 + sections.length);
    const newSection: HallSection = {
      id: `sec-${Date.now()}`,
      name: `Section ${nextChar}`,
      seatCount: 20,
      seatType: "Standard",
      color: "#6366F1",
      displayOrder: sections.length + 1,
      rows: [nextChar, `${nextChar}1`],
      seatsPerRow: 10,
    };
    setSections([...sections, newSection]);
    setIsSaved(false);
  };

  // Update Section
  const handleUpdateSection = (index: number, updates: Partial<HallSection>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    setSections(updated);
    setIsSaved(false);
  };

  // Remove Section
  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  // Live Auto-Generation of Reusable Hall Layout
  const generatedLayout: HallLayout = useMemo(() => {
    return generateHallLayout({
      hallId: "hall-custom-preview",
      theatreId: "th-pun-001",
      name: `${hallName} Layout`,
      sections,
    });
  }, [hallName, sections]);

  // Preview Inventory for Renderer
  const previewInventory: ShowSeat[] = useMemo(() => {
    return generateShowSeatInventory(generatedLayout, {
      id: "preview-show",
      pricing: {
        sectionPricing: Object.fromEntries(
          sections.map((s) => [s.name, 250])
        ),
        defaultPrice: 250,
      },
    });
  }, [generatedLayout, sections]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between">
        <Link href={ROUTES.THEATRE_ADMIN.HALLS}>
          <Button variant="ghost" size="xs" className="gap-1.5 text-xs text-[#94A3B8]">
            <ArrowLeft className="h-3 w-3" /> Back to Hall Fleet
          </Button>
        </Link>
        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>Reusable Layout Template Saved</span>
          </div>
        )}
      </div>

      <PageHeader
        title="Dynamic Hall Design Engine"
        subtitle="Configure physical auditoriums once. The engine automatically generates dynamic seat labels (A1..A20, B1..B30, C1..C50), walkways, and emergency exits for future shows."
        badge="Reusable Template"
        badgeVariant="primary"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset("preset-100")}
              className="gap-1.5 border-[#2A3445] text-xs text-[#94A3B8]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset to 100-Seat Standard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSaved(true)}
              className="gap-1.5 font-bold shadow-lg shadow-amber-400/20"
            >
              <Save className="h-4 w-4" /> Save Reusable Layout
            </Button>
          </div>
        }
      />

      {/* 2. ARCHITECTURAL INVARIANT CALLOUT */}
      <Card variant="elevated" className="p-4 bg-[#0B1220] border-[#1E293B]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-white text-sm">
              Architectural Invariant: Designed Once, Reused Across Shows
            </div>
            <p className="text-[#94A3B8] leading-relaxed">
              Theatre Admins configure hall layouts strictly once. Movies never own seats, and hall layouts never permanently hardcode ticket prices. When scheduling shows (e.g., Pushpa 2 Morning Show vs Kalki Night Show), you simply select this layout and specify section pricing (Section A: ₹200 vs ₹250).
            </p>
          </div>
        </div>
      </Card>

      {/* 3. PRESET SELECTOR BAR */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#0B1220] border border-[#1E293B] text-xs">
        <span className="font-mono font-bold text-[#FBBF24] uppercase text-[11px] px-2">
          Load Preset:
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset.id)}
            className="px-3 py-1.5 rounded-xl bg-[#111827] border border-[#2A3445] text-[#CBD5E1] hover:text-white hover:border-[#FBBF24] transition-all font-medium"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 4. LEFT PANEL: CONFIGURATION CONTROLS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hall Meta */}
          <Card variant="elevated" className="p-5 bg-[#0B1220] border-[#1E293B] space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#FBBF24]" />
              Auditorium Specifications
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#64748B] font-bold">
                  Hall Name
                </label>
                <input
                  type="text"
                  value={hallName}
                  onChange={(e) => {
                    setHallName(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#64748B] font-bold">
                  Screen Number
                </label>
                <input
                  type="number"
                  value={screenNumber}
                  onChange={(e) => {
                    setScreenNumber(parseInt(e.target.value) || 1);
                    setIsSaved(false);
                  }}
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-[#FBBF24]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#64748B] font-bold">
                  Screen Format
                </label>
                <select
                  value={screenType}
                  onChange={(e) => {
                    setScreenType(e.target.value);
                    setIsSaved(false);
                  }}
                  className="w-full bg-[#111827] border border-[#2A3445] rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden focus:border-[#FBBF24]"
                >
                  <option value="IMAX Laser">IMAX Laser</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="Laser 4K">Laser 4K</option>
                  <option value="4DX Motion">4DX Motion</option>
                  <option value="RealD 3D">RealD 3D</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-[#64748B] font-bold">
                  Total Capacity
                </label>
                <div className="w-full bg-[#111827]/50 border border-[#2A3445] rounded-xl px-3 py-2 text-[#FBBF24] font-mono font-bold">
                  {generatedLayout.capacity} Seats
                </div>
              </div>
            </div>
          </Card>

          {/* Dynamic Section Configurator */}
          <Card variant="elevated" className="p-5 bg-[#0B1220] border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#38BDF8]" />
                Auditorium Sections ({sections.length})
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={handleAddSection}
                className="gap-1 text-xs border-[#2A3445] text-[#38BDF8]"
              >
                <Plus className="h-3 w-3" /> Add Section
              </Button>
            </div>

            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#2A3445] space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: section.color }}
                      />
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) =>
                          handleUpdateSection(idx, { name: e.target.value })
                        }
                        className="font-bold text-white bg-transparent border-b border-transparent hover:border-[#2A3445] focus:border-[#FBBF24] focus:outline-hidden px-1 py-0.5 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#FBBF24] font-bold">
                        {section.seatCount} seats
                      </span>
                      {sections.length > 1 && (
                        <button
                          onClick={() => handleRemoveSection(idx)}
                          className="text-[#64748B] hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-[#64748B]">
                        Seat Count
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={section.seatCount}
                        onChange={(e) =>
                          handleUpdateSection(idx, {
                            seatCount: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-[#64748B]">
                        Seat Type
                      </span>
                      <select
                        value={section.seatType}
                        onChange={(e) =>
                          handleUpdateSection(idx, {
                            seatType: e.target.value as SeatType,
                          })
                        }
                        className="w-full bg-[#070B12] border border-[#2A3445] rounded-lg px-1.5 py-1 text-white text-[11px]"
                      >
                        <option value="Standard">Standard</option>
                        <option value="VIP">VIP</option>
                        <option value="Recliner">Recliner</option>
                        <option value="Wheelchair">Wheelchair</option>
                        <option value="Couple">Couple</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono text-[#64748B]">
                        Color Accent
                      </span>
                      <input
                        type="color"
                        value={section.color}
                        onChange={(e) =>
                          handleUpdateSection(idx, { color: e.target.value })
                        }
                        className="w-full h-7 bg-[#070B12] border border-[#2A3445] rounded-lg cursor-pointer px-1 py-0.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 5. RIGHT PANEL: LIVE AUTOMATIC LAYOUT VISUALIZATION (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="elevated" className="p-6 bg-[#0B1220] border-[#1E293B] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Live Generated Seating Grid
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Auto-calculated from configuration without manual coordinate placement.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-[#FBBF24] font-bold">
                  {generatedLayout.capacity} Total Seats
                </span>
                <div className="text-[10px] text-[#64748B]">
                  {generatedLayout.rows} Rows • {generatedLayout.maxColumns} Max Columns
                </div>
              </div>
            </div>

            {/* Layout Canvas */}
            <div className="overflow-x-auto py-6">
              <div className="min-w-[500px]">
                <HallLayoutRenderer
                  layout={generatedLayout}
                  seatInventory={previewInventory}
                  screenName={hallName}
                />
              </div>
            </div>

            {/* Dynamic Legend */}
            <div className="pt-4 border-t border-[#1E293B]">
              <SeatLegend sections={generatedLayout.sections} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
