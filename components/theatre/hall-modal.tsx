"use client";

import React, { useState, useEffect } from "react";
import { ManagedHall } from "@/store/theatre-store";
import { DynamicHallSectionConfig, HallStatus } from "@/types/hall.types";
import {
  PROJECTION_TYPES,
  SOUND_SYSTEMS,
  SCREEN_TYPES,
  HALL_STATUSES,
  validateHallCapacity,
} from "@/lib/constants/seating-design-system";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HallPreview2D } from "./hall-preview-2d";
import { HallSectionEditor } from "./hall-section-editor";
import {
  X,
  Layers,
  Sparkles,
  Tv,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Eye,
  Sliders,
  ShieldCheck,
} from "lucide-react";

interface HallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hallData: Omit<ManagedHall, "id" | "occupancyPercent">) => void;
  initialHall?: ManagedHall | null;
  existingHalls?: ManagedHall[];
}

export function HallModal({
  isOpen,
  onClose,
  onSave,
  initialHall,
  existingHalls = [],
}: HallModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "sections" | "preview" | "future3d">("info");

  // Form State
  const [name, setName] = useState("");
  const [hallNumber, setHallNumber] = useState(1);
  const [hallCode, setHallCode] = useState("");
  const [capacity, setCapacity] = useState(100);
  const [screenType, setScreenType] = useState<string>("Laser 4K");
  const [projectionType, setProjectionType] = useState<string>("Laser 4K");
  const [soundSystem, setSoundSystem] = useState<string>("Dolby Atmos");
  const [aspectRatio, setAspectRatio] = useState("2.39:1 Scope");
  const [floorNumber, setFloorNumber] = useState("Floor 2");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<HallStatus>("Active");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80");
  const [sections, setSections] = useState<DynamicHallSectionConfig[]>([]);

  // Validation errors
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (initialHall) {
      setName(initialHall.name);
      setHallNumber(initialHall.hallNumber);
      setHallCode(initialHall.hallCode || `H0${initialHall.hallNumber}`);
      setCapacity(initialHall.capacity);
      setScreenType(initialHall.screenType);
      setProjectionType(initialHall.projectionType);
      setSoundSystem(initialHall.soundSystem);
      setAspectRatio(initialHall.aspectRatio || "2.39:1 Scope");
      setFloorNumber(initialHall.floorNumber || "Floor 2");
      setDescription(initialHall.description || "");
      setStatus(initialHall.status as HallStatus);
      setImage(initialHall.image);
      setSections(initialHall.sections || []);
    } else {
      const nextNum = Math.max(...existingHalls.map((h) => h.hallNumber), 0) + 1;
      setName(`Auditorium ${nextNum}`);
      setHallNumber(nextNum);
      setHallCode(`PUN-H0${nextNum}`);
      setCapacity(100);
      setScreenType("Laser 4K");
      setProjectionType("Laser 4K");
      setSoundSystem("Dolby Atmos");
      setAspectRatio("2.39:1 Scope");
      setFloorNumber("Floor 2");
      setDescription("Multi-format commercial auditorium with high lumen projection.");
      setStatus("Active");
      setImage("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80");
      setSections([
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
    }
    setActiveTab("info");
    setFormError(null);
  }, [initialHall, isOpen, existingHalls]);

  if (!isOpen) return null;

  const capacityValidation = validateHallCapacity(capacity, sections);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate name
    if (!name.trim()) {
      setFormError("Auditorium name is required.");
      setActiveTab("info");
      return;
    }

    // Validate unique hall code
    const normalizedCode = hallCode.trim().toUpperCase();
    const isDuplicate = existingHalls.some(
      (h) => h.id !== initialHall?.id && h.hallCode?.toUpperCase() === normalizedCode
    );
    if (isDuplicate) {
      setFormError(`Hall code "${hallCode}" is already in use at this cinema.`);
      setActiveTab("info");
      return;
    }

    // Validate Capacity Balance Law
    if (!capacityValidation.isValid) {
      setFormError(capacityValidation.message);
      setActiveTab("sections");
      return;
    }

    onSave({
      name,
      hallNumber,
      hallCode,
      capacity,
      screenType,
      projectionType,
      soundSystem,
      aspectRatio,
      floorNumber,
      description,
      status,
      image,
      sections,
      layout: initialHall?.layout,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B0F19] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#FBBF24]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialHall ? `Edit ${initialHall.name}` : "Create New Cinema Auditorium"}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Configure technical hardware, dynamic sections, and live capacity balance.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-3 bg-[#0F172A]/70 border-b border-[#1E293B] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "info"
                ? "border-amber-400 text-amber-400 bg-[#161F2E]"
                : "border-transparent text-[#94A3B8] hover:text-white"
            }`}
          >
            <Tv className="h-3.5 w-3.5" /> 1. Auditorium Info
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "sections"
                ? "border-amber-400 text-amber-400 bg-[#161F2E]"
                : "border-transparent text-[#94A3B8] hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> 2. Dynamic Sections & Capacity
            {!capacityValidation.isValid && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "preview"
                ? "border-amber-400 text-amber-400 bg-[#161F2E]"
                : "border-transparent text-[#94A3B8] hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> 3. 2D Floor Plan Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("future3d")}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "future3d"
                ? "border-amber-400 text-amber-400 bg-[#161F2E]"
                : "border-transparent text-[#94A3B8] hover:text-white"
            }`}
          >
            <Camera className="h-3.5 w-3.5" /> 4. 3D Specs (Future)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[60vh] space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Tab 1: Hall Information */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Auditorium Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Auditorium 1 - Laser IMAX"
                    className="h-9 bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Hall Code (Unique) *
                  </label>
                  <Input
                    value={hallCode}
                    onChange={(e) => setHallCode(e.target.value)}
                    placeholder="e.g. PUN-H01"
                    className="h-9 font-mono bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Screen Number
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={hallNumber}
                    onChange={(e) => setHallNumber(parseInt(e.target.value) || 1)}
                    className="h-9 font-mono bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Total Capacity (Seats) *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                    className="h-9 font-mono font-bold text-amber-400 bg-[#111827] border-[#2A3445]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-0.5 block">
                    Must equal sum of all configured section seats.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Screen Format Type
                  </label>
                  <select
                    value={screenType}
                    onChange={(e) => setScreenType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {SCREEN_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Projection System
                  </label>
                  <select
                    value={projectionType}
                    onChange={(e) => setProjectionType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {PROJECTION_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Sound Array Spec
                  </label>
                  <select
                    value={soundSystem}
                    onChange={(e) => setSoundSystem(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {SOUND_SYSTEMS.map((snd) => (
                      <option key={snd} value={snd}>
                        {snd}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Floor / Deck Level
                  </label>
                  <Input
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    placeholder="e.g. Floor 2 (South Wing)"
                    className="h-9 bg-[#111827] border-[#2A3445] text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Operating Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as HallStatus)}
                    className="w-full h-9 px-3 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {HALL_STATUSES.map((hs) => (
                      <option key={hs.value} value={hs.value}>
                        {hs.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                  Acoustic & Optical Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical specifications, throw distance, throw ratio, sound dampening treatment..."
                  className="w-full p-3 rounded-lg bg-[#111827] border border-[#2A3445] text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Dynamic Sections Configuration */}
          {activeTab === "sections" && (
            <HallSectionEditor
              capacity={capacity}
              sections={sections}
              onChange={setSections}
              onApplyPreset={(newCapacity, newSections) => {
                setCapacity(newCapacity);
                setSections(newSections);
              }}
            />
          )}

          {/* Tab 3: Live 2D Floor Plan Preview */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <HallPreview2D
                hallName={name}
                hallCode={hallCode}
                screenType={screenType}
                capacity={capacity}
                sections={sections}
              />
            </div>
          )}

          {/* Tab 4: 3D Specs & Camera Configuration (Future architecture) */}
          {activeTab === "future3d" && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-start gap-3">
                <Camera className="h-5 w-5 text-[#818CF8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">3D Cinematic Frustum Architecture (Phase 6 Ready)</h4>
                  <p className="text-[#CBD5E1]">
                    These geometric coordinates and spectator eye-level positions will drive React Three Fiber rendering in Phase 6 without requiring schema redesign.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Auditorium FOV</span>
                  <p className="font-mono font-bold text-white">60.0 Degrees</p>
                  <span className="text-[10px] text-[#64748B]">Human binocular sweetspot</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Screen Curvature</span>
                  <p className="font-mono font-bold text-white">0.18 Rad Arc</p>
                  <span className="text-[10px] text-[#64748B]">Torus projection geometry</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#2A3445] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">Spectator Eye Height</span>
                  <p className="font-mono font-bold text-white">1.20 Meters</p>
                  <span className="text-[10px] text-[#64748B]">ISO 2969 viewing standard</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-[#2A3445] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8] block">
                  Camera Presets & Viewpoints:
                </span>
                <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>Center Eye Sweetspot:</strong> Position [0, 4.5, 14] • Focus [0, 2, 0]
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>Screen Horizon View:</strong> Position [0, 1.5, 1] • Focus [0, 5, 20]
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <strong>VIP Elevation Tier:</strong> Position [-5, 6, 18] • Focus [0, 3, 0]
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Strict Capacity Enforcement */}
        <div className="px-6 py-4 bg-[#0F172A] border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {capacityValidation.isValid ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-medium">Capacity Balanced ({capacity} / {capacity} Seats)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  Capacity Mismatch: {capacityValidation.remainingSeats > 0 ? `${capacityValidation.remainingSeats} remaining` : `${Math.abs(capacityValidation.remainingSeats)} over`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#2A3445] text-[#94A3B8] hover:text-white"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!capacityValidation.isValid || !name.trim()}
              onClick={handleSubmit}
              className="gap-1.5 font-bold bg-[#FBBF24] hover:bg-[#F59E0B] text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              {initialHall ? "Save Changes" : "Create Auditorium"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
