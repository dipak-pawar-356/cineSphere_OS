"use client";

import React, { useState, useMemo } from "react";
import { useTheatreStore } from "@/store/theatre-store";
import { Modal } from "@/components/dialogs/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  RotateCcw,
  Tag,
  MonitorPlay,
  Armchair,
  Receipt,
  Check,
} from "lucide-react";
import {
  DynamicPricingProfile,
  SeatPriceCalculationItem,
} from "@/types/pricing-engine.types";
import { calculateShowTicketPrice } from "@/lib/engine/pricing-engine";
import { cn } from "@/utils";

interface SimulatorSeat {
  id: string;
  row: string;
  col: number;
  seatNumber: string;
  sectionName: string;
  categoryTier: string;
}

// Mock Auditorium Grid for Pricing Simulation
const AUDITORIUM_ROWS: {
  row: string;
  seats: number;
  sectionName: string;
  tier: string;
}[] = [
  { row: "A", seats: 8, sectionName: "Section A (Front)", tier: "Silver" },
  { row: "B", seats: 8, sectionName: "Section A (Front)", tier: "Silver" },
  { row: "C", seats: 8, sectionName: "Section B (Middle)", tier: "Gold" },
  { row: "D", seats: 8, sectionName: "Section B (Middle)", tier: "Gold" },
  { row: "E", seats: 8, sectionName: "Section C (Executive)", tier: "Platinum" },
  { row: "F", seats: 8, sectionName: "Section C (Executive)", tier: "Platinum" },
  { row: "G", seats: 6, sectionName: "Section D (Club Recliner)", tier: "VIP" },
  { row: "H", seats: 4, sectionName: "Section E (Royal Suite)", tier: "Royal Suite" },
];

const MULTIPLIERS = [
  { label: "Standard (1.0x)", value: 1.0 },
  { label: "Early Bird (0.95x)", value: 0.95 },
  { label: "High Demand Surge (1.15x)", value: 1.15 },
];

interface PricingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfileId?: string;
}

export function PricingSimulatorModal({
  isOpen,
  onClose,
  initialProfileId,
}: PricingSimulatorModalProps) {
  const { pricingProfiles } = useTheatreStore();

  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    return initialProfileId || pricingProfiles[0]?.id || "";
  });

  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(() => {
    // Initial pre-selected seats for immediate demonstration
    return new Set(["C3", "C4"]);
  });

  const [multiplier, setMultiplier] = useState<number>(1.0);

  // Active Profile
  const activeProfile: DynamicPricingProfile = useMemo(() => {
    return (
      pricingProfiles.find((p) => p.id === selectedProfileId) ||
      pricingProfiles[0]
    );
  }, [pricingProfiles, selectedProfileId]);

  // Generate All Simulator Seats
  const allSeats: SimulatorSeat[] = useMemo(() => {
    const list: SimulatorSeat[] = [];
    for (const r of AUDITORIUM_ROWS) {
      for (let c = 1; c <= r.seats; c++) {
        const seatNumber = `${r.row}${c}`;
        list.push({
          id: seatNumber,
          row: r.row,
          col: c,
          seatNumber,
          sectionName: r.sectionName,
          categoryTier: r.tier,
        });
      }
    }
    return list;
  }, []);

  // Map Selected Seat Objects
  const selectedSeatItems: SeatPriceCalculationItem[] = useMemo(() => {
    return allSeats
      .filter((s) => selectedSeats.has(s.id))
      .map((s) => ({
        seatId: s.id,
        seatNumber: s.seatNumber,
        row: s.row,
        column: s.col,
        sectionName: s.sectionName,
        categoryTier: s.categoryTier,
      }));
  }, [allSeats, selectedSeats]);

  // Run Calculation Engine
  const calculationResult = useMemo(() => {
    if (!activeProfile) return null;
    return calculateShowTicketPrice(selectedSeatItems, activeProfile, {
      appliedMultiplier: multiplier,
    });
  }, [selectedSeatItems, activeProfile, multiplier]);

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });
  };

  const selectRow = (rowName: string) => {
    const rowSeatIds = allSeats.filter((s) => s.row === rowName).map((s) => s.id);
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      const allSelected = rowSeatIds.every((id) => next.has(id));
      if (allSelected) {
        rowSeatIds.forEach((id) => next.delete(id));
      } else {
        rowSeatIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedSeats(new Set());
  };

  const selectRandomDemo = () => {
    setSelectedSeats(new Set(["B3", "B4", "E5", "G2"]));
  };

  if (!activeProfile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Dynamic Seat Pricing Engine Simulator"
      description="Interactive real-time demonstration: Seats never store prices. Changing profiles or selecting seats dynamically computes line items, convenience fees, and GST taxes."
    >
      <div className="space-y-5 max-h-[82vh] overflow-y-auto px-1 pr-2">
        {/* Architecture Law Pill Banner */}
        <div className="p-3 bg-amber-400/10 border border-amber-400/25 rounded-xl flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-amber-300">
              Fundamental Architectural Law:
            </span>
            <p className="text-slate-300 leading-relaxed">
              Seat records (<code className="text-amber-400">A1</code>, <code className="text-amber-400">A2</code>...) have zero price fields.
              Every seat inherits its section tier tariff from the attached Show&apos;s Pricing Profile.
            </p>
          </div>
        </div>

        {/* Controls Toolbar: Profile & Multiplier Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[#0B0F17] border border-[#2A3445] rounded-xl">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Active Pricing Profile</span>
            </label>
            <select
              className="w-full bg-[#161F2E] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
            >
              {pricingProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.dayType} • {p.slotType}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Future Dynamic Multiplier</span>
            </label>
            <select
              className="w-full bg-[#161F2E] border border-[#2A3445] rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60"
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
            >
              {MULTIPLIERS.map((m) => (
                <option key={m.label} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Layout & Calculation Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Auditorium Seating Map (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B0F17] border border-[#2A3445] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Auditorium Floor Plan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={selectRandomDemo}
                >
                  Quick Demo (4)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={clearSelection}
                  disabled={selectedSeats.size === 0}
                  iconLeft={<RotateCcw className="w-3 h-3" />}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Screen Horizon Bar */}
            <div className="flex flex-col items-center py-1">
              <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent rounded-full mb-1 shadow-[0_0_12px_rgba(251,191,36,0.3)]" />
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-widest">
                <MonitorPlay className="w-3 h-3 text-amber-400" />
                <span>Auditorium Screen Direction</span>
              </div>
            </div>

            {/* Seat Grid Rows */}
            <div className="space-y-2 py-2">
              {AUDITORIUM_ROWS.map((r) => {
                const tierPrice =
                  activeProfile.tierPricing[r.tier] ||
                  activeProfile.tierPricing["Silver"] ||
                  200;
                const adjustedPrice = Math.round(tierPrice * multiplier);

                return (
                  <div key={r.row} className="flex items-center gap-2">
                    {/* Row Selector Button */}
                    <button
                      type="button"
                      onClick={() => selectRow(r.row)}
                      className="w-6 h-6 rounded bg-[#161F2E] hover:bg-[#1E293B] text-[11px] font-bold text-slate-300 border border-[#2A3445] flex items-center justify-center transition-colors"
                      title={`Select / Deselect Row ${r.row}`}
                    >
                      {r.row}
                    </button>

                    {/* Row Seats */}
                    <div className="flex-1 flex items-center justify-center gap-1.5 flex-wrap">
                      {Array.from({ length: r.seats }).map((_, idx) => {
                        const col = idx + 1;
                        const seatId = `${r.row}${col}`;
                        const isSelected = selectedSeats.has(seatId);

                        return (
                          <button
                            key={seatId}
                            type="button"
                            onClick={() => toggleSeat(seatId)}
                            className={cn(
                              "w-7 h-7 rounded text-[10px] font-semibold transition-all duration-150 flex items-center justify-center relative",
                              isSelected
                                ? "bg-amber-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-105 border border-amber-300"
                                : "bg-[#161F2E] text-slate-300 hover:bg-[#1E293B] hover:text-amber-300 border border-[#2A3445]"
                            )}
                            title={`${seatId} (${r.tier} Tier) — ₹${adjustedPrice}`}
                          >
                            {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : seatId}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tier Price Chip */}
                    <div className="w-20 text-right">
                      <span className="text-[10px] font-medium text-slate-400">
                        {r.tier}: <strong className="text-amber-400">₹{adjustedPrice}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Seating Tier Legend */}
            <div className="pt-2 border-t border-[#2A3445]/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#161F2E] border border-[#2A3445] inline-block" />
                <span>Available</span>
              </div>
              <span className="text-slate-400">Click row letters to batch select</span>
            </div>
          </div>

          {/* Right: Dynamic Price Calculation Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-[#0B0F17] border border-[#2A3445] rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#2A3445] pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Pricing Breakdown
                  </span>
                </div>
                <Badge variant="primary" size="sm">
                  {selectedSeats.size} {selectedSeats.size === 1 ? "Seat" : "Seats"}
                </Badge>
              </div>

              {/* Itemized Seats Scroll Area */}
              {calculationResult && calculationResult.seatItems.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {calculationResult.seatItems.map((item) => (
                    <div
                      key={item.seatNumber}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#161F2E]/60 border border-[#2A3445]/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">
                          {item.seatNumber}
                        </span>
                        <Badge variant="secondary" size="sm">
                          {item.categoryTier}
                        </Badge>
                      </div>
                      <span className="font-semibold text-slate-200">
                        ₹{item.unitPrice}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Click any seat on the auditorium map to begin pricing calculation.
                </div>
              )}

              {/* Fee and Tax Calculations */}
              {calculationResult && calculationResult.totalSeats > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#2A3445]/60 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Seats Subtotal</span>
                    <span className="font-semibold text-slate-100">
                      ₹{calculationResult.seatSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Convenience Fee (₹{calculationResult.convenienceFeePerSeat} × {calculationResult.totalSeats})</span>
                    <span className="text-slate-300">
                      +₹{calculationResult.convenienceFeeTotal}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Integrated GST ({calculationResult.gstPercent}% on Fee)</span>
                    <span className="text-slate-300">
                      +₹{calculationResult.gstTaxTotal}
                    </span>
                  </div>

                  {calculationResult.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Early Bird Discount</span>
                      <span>-₹{calculationResult.discountTotal}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grand Total Summary Box */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/30 to-[#111827] border border-emerald-500/30 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">
                  Calculated Grand Total
                </span>
                <span className="text-xl font-extrabold text-emerald-400">
                  ₹{calculationResult ? calculationResult.grandTotal.toLocaleString("en-IN") : 0}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Applied Tariff: <strong className="text-slate-300">{activeProfile.name}</strong> ({activeProfile.code})
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#2A3445]">
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close Simulator
          </Button>
        </div>
      </div>
    </Modal>
  );
}

