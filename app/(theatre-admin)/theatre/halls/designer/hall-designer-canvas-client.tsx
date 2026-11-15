"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Grid,
  Magnet,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Save,
  UploadCloud,
  History,
  Eye,
  Move,
  Ruler,
  Settings,
  Plus,
  Copy,
  Archive,
  RefreshCw,
  Armchair,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterHorizontal,
  AlignCenterVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  LayoutDefinition,
  LayoutVersion,
  LayoutValidationResult,
  CanvasPreferences,
  CanvasTransform,
  MeasurementUnit,
  GridDensity,
  SeatDefinition,
  HallSectionDefinition,
} from "@/types/hall-designer.types";
import { CanvasGridEngine } from "@/lib/engine/canvas-grid-engine";
import {
  listLayoutDefinitionsAction,
  getLayoutDefinitionAction,
  getLayoutVersionAction,
  createDraftVersionAction,
  updateDraftLayoutAction,
  validateLayoutVersionAction,
  publishLayoutVersionAction,
  duplicateLayoutAction,
  archiveLayoutAction,
  loadCanvasPreferencesAction,
  saveCanvasPreferencesAction,
  resetCanvasPreferencesAction,
} from "@/actions/hall-designer-actions";

interface HallDesignerCanvasClientProps {
  initialTheatreId?: string;
  theatres?: Array<{ id: string; name: string }>;
  halls?: Array<{ id: string; name: string }>;
}

export function HallDesignerCanvasClient({
  initialTheatreId = "th-pun-001",
  theatres = [
    { id: "th-pun-001", name: "Galaxy Multiplex - Pune" },
    { id: "th-mum-002", name: "Mumbai Royale IMAX - Mumbai" },
    { id: "th-dxb-003", name: "Dubai Grand Screen - Dubai" },
  ],
  halls = [
    { id: "hall-pun-aud1", name: "Auditorium 1 (Main Screen)" },
    { id: "hall-pun-aud2", name: "Auditorium 2 (IMAX Atmos)" },
  ],
}: HallDesignerCanvasClientProps) {
  // ----------------------------------------------------------------------------
  // 1. Core Selection State
  // ----------------------------------------------------------------------------
  const [theatreId, setTheatreId] = useState(initialTheatreId);
  const [selectedHallId, setSelectedHallId] = useState(halls[0]?.id || "hall-pun-aud1");

  // Layout Definitions & Active Version
  const [definitions, setDefinitions] = useState<LayoutDefinition[]>([]);
  const [currentDef, setCurrentDef] = useState<LayoutDefinition | null>(null);
  const [currentVersion, setCurrentVersion] = useState<LayoutVersion | null>(null);
  const [allVersions, setAllVersions] = useState<LayoutVersion[]>([]);

  // Canvas Preferences State
  const [preferences, setPreferences] = useState<CanvasPreferences>({
    theatreId: initialTheatreId,
    gridSize: 20,
    gridDensity: "MEDIUM",
    gridVisible: true,
    gridColor: "#334155",
    gridOpacity: 0.35,
    snapEnabled: true,
    snapStrength: 8,
    defaultZoom: 1.0,
    measurementUnit: "PX",
    canvasWidth: 2400,
    canvasHeight: 1800,
    backgroundColor: "#0B0F19",
    showMiniMap: true,
    showSmartGuides: true,
    updatedAt: new Date().toISOString(),
  });

  // Canvas Viewport Transform
  const [transform, setTransform] = useState<CanvasTransform>({
    zoom: 1.0,
    panX: 80,
    panY: 60,
  });

  // Interaction State
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"layout" | "sections" | "canvas">("layout");

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<LayoutValidationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------------------
  // 2. Data Fetching
  // ----------------------------------------------------------------------------
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load Canvas Preferences for this theatre
      const prefRes = await loadCanvasPreferencesAction({ theatreId });
      if (prefRes.success && prefRes.data) {
        setPreferences(prefRes.data);
        const normZoom = prefRes.data.defaultZoom > 5 ? prefRes.data.defaultZoom / 100 : prefRes.data.defaultZoom;
        setTransform((prev) => ({ ...prev, zoom: normZoom }));
      }

      // 2. List Layout Definitions for this hall
      const defsRes = await listLayoutDefinitionsAction({ theatreId, hallId: selectedHallId });
      if (defsRes.success && defsRes.data) {
        setDefinitions(defsRes.data);
        if (defsRes.data.length > 0) {
          const firstDef = defsRes.data[0];
          await loadDefinitionDetails(firstDef.id);
        } else {
          setCurrentDef(null);
          setCurrentVersion(null);
          setAllVersions([]);
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load designer data" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefinitionDetails = async (defId: string) => {
    const res = await getLayoutDefinitionAction({ theatreId, layoutDefinitionId: defId });
    if (res.success && res.data) {
      setCurrentDef(res.data.definition);
      setAllVersions(res.data.versions);

      // Prefer active draft if present, else published version, else latest version
      const targetVer =
        res.data.activeDraftVersion ||
        res.data.currentPublishedVersion ||
        res.data.versions[0];
      setCurrentVersion(targetVer || null);
    }
  };

  useEffect(() => {
    loadData();
  }, [theatreId, selectedHallId]);

  // ----------------------------------------------------------------------------
  // 3. Canvas Zoom & Pan Handlers
  // ----------------------------------------------------------------------------
  const handleZoom = (delta: number) => {
    setTransform((prev) => ({
      ...prev,
      zoom: Math.min(3.0, Math.max(0.2, Math.round((prev.zoom + delta) * 100) / 100)),
    }));
  };

  const handleResetZoom = () => {
    setTransform({
      zoom: preferences.defaultZoom || 1.0,
      panX: 80,
      panY: 60,
    });
  };

  const handleFitToScreen = () => {
    if (!canvasRef.current) return;
    const { clientWidth, clientHeight } = canvasRef.current;
    const fit = CanvasGridEngine.calculateFitToScreen(
      preferences.canvasWidth,
      preferences.canvasHeight,
      clientWidth,
      clientHeight,
      40
    );
    setTransform(fit);
  };

  // Pan via mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).classList.contains("canvas-board")) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - transform.panX, y: e.clientY - transform.panY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        panX: e.clientX - startPan.x,
        panY: e.clientY - startPan.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // ----------------------------------------------------------------------------
  // 4. Seating Selection & Alignment (Part 2)
  // ----------------------------------------------------------------------------
  const handleToggleSeat = (seatId: string, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedSeatIds((prev) =>
        prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
      );
    } else {
      setSelectedSeatIds([seatId]);
    }
  };

  const handleAlignSelectedSeats = (
    op: "ALIGN_LEFT" | "ALIGN_RIGHT" | "ALIGN_TOP" | "ALIGN_BOTTOM" | "CENTER_HORIZONTAL" | "CENTER_VERTICAL"
  ) => {
    if (!currentVersion || selectedSeatIds.length < 2) {
      setStatusMessage({ type: "info", text: "Select at least 2 seats to align." });
      return;
    }
    if (currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Layout is published/archived. Switch to Draft version to edit." });
      return;
    }

    const selectedSeats = currentVersion.seats.filter((s) => selectedSeatIds.includes(s.id));
    const alignedSelected = CanvasGridEngine.alignSeats(selectedSeats, op);
    const alignedMap = new Map(alignedSelected.map((s) => [s.id, s]));
    const updatedSeats = currentVersion.seats.map((s) => alignedMap.get(s.id) || s);

    setCurrentVersion({ ...currentVersion, seats: updatedSeats });
    setStatusMessage({ type: "success", text: `Applied ${op.replace("_", " ").toLowerCase()} alignment to ${selectedSeatIds.length} seats.` });
  };

  // ----------------------------------------------------------------------------
  // 5. Versioning & Validation Actions (Part 1)
  // ----------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (!currentVersion || currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Cannot save non-draft version. Create a new draft first." });
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateDraftLayoutAction({
        theatreId,
        versionId: currentVersion.id,
        payload: {
          sections: currentVersion.sections,
          seats: currentVersion.seats,
          walkways: currentVersion.walkways,
          emergencyExits: currentVersion.emergencyExits,
          gridConfig: currentVersion.gridConfig,
          versionNotes: currentVersion.versionNotes,
        },
      });

      if (res.success && res.data) {
        setCurrentVersion(res.data);
        setStatusMessage({ type: "success", text: `Draft saved successfully (v${res.data.versionNumber}).` });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to save draft." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save draft." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidateVersion = async () => {
    if (!currentVersion) return;
    try {
      const res = await validateLayoutVersionAction({ theatreId, versionId: currentVersion.id });
      if (res.success && res.data) {
        setValidationResult(res.data);
        if (res.data.isValid) {
          setStatusMessage({ type: "success", text: "Layout passed all validation checks! Ready to publish." });
        } else {
          setStatusMessage({ type: "error", text: `Layout validation failed with ${res.data.errors.length} errors.` });
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Validation failed" });
    }
  };

  const handlePublishVersion = async () => {
    if (!currentDef || !currentVersion) return;
    if (currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Only draft versions can be published." });
      return;
    }

    setIsSaving(true);
    try {
      const res = await publishLayoutVersionAction({
        theatreId,
        layoutDefinitionId: currentDef.id,
        versionId: currentVersion.id,
      });

      if (res.success && res.data) {
        setCurrentDef(res.data.definition);
        setCurrentVersion(res.data.publishedVersion);
        await loadDefinitionDetails(currentDef.id);
        setStatusMessage({
          type: "success",
          text: `v${res.data.publishedVersion.versionNumber} is now LIVE! Future shows will use this layout. Existing bookings remain tied to previous versions.`,
        });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Publishing failed." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Publishing failed." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewDraft = async () => {
    if (!currentDef) return;
    setIsLoading(true);
    try {
      const res = await createDraftVersionAction({
        theatreId,
        layoutDefinitionId: currentDef.id,
        notes: `Draft revision based on v${currentVersion?.versionNumber || 1}`,
      });
      if (res.success && res.data) {
        setCurrentVersion(res.data);
        await loadDefinitionDetails(currentDef.id);
        setStatusMessage({ type: "success", text: `Created new Draft v${res.data.versionNumber}.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create draft." });
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 6. Canvas Preferences Updates (Part 2)
  // ----------------------------------------------------------------------------
  const handleSavePreferences = async (newPrefs: Partial<CanvasPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      const res = await saveCanvasPreferencesAction({
        theatreId,
        preferences: newPrefs,
      });
      if (res.success && res.data) {
        setPreferences(res.data);
        setStatusMessage({ type: "success", text: "Canvas preferences saved for this theatre." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save preferences." });
    }
  };

  const handleResetPreferences = async () => {
    try {
      const res = await resetCanvasPreferencesAction({ theatreId });
      if (res.success && res.data) {
        setPreferences(res.data);
        const normZoom = res.data.defaultZoom > 5 ? res.data.defaultZoom / 100 : res.data.defaultZoom;
        setTransform((prev) => ({ ...prev, zoom: normZoom }));
        setStatusMessage({ type: "success", text: "Reset canvas preferences to system defaults." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to reset preferences." });
    }
  };

  // ----------------------------------------------------------------------------
  // Dimension Conversions
  // ----------------------------------------------------------------------------
  const convertedDimensions = useMemo(() => {
    const unit = preferences.measurementUnit;
    const w = CanvasGridEngine.convertUnit(preferences.canvasWidth, "PX", unit);
    const h = CanvasGridEngine.convertUnit(preferences.canvasHeight, "PX", unit);
    return {
      width: Math.round(w * 10) / 10,
      height: Math.round(h * 10) / 10,
      unit,
    };
  }, [preferences.canvasWidth, preferences.canvasHeight, preferences.measurementUnit]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. TOP HEADER BAR */}
      {/* ------------------------------------------------------------------------ */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-30">
        <div className="flex items-center gap-4">
          <Link href="/theatre/halls">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Halls
            </Button>
          </Link>
          <div className="h-5 w-px bg-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                {currentDef?.name || "Auditorium Layout"}
              </h1>
              {currentVersion && (
                <Badge
                  variant="outline"
                  className={
                    currentVersion.status === "PUBLISHED"
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/30 font-semibold"
                      : currentVersion.status === "DRAFT"
                      ? "border-amber-500/40 text-amber-400 bg-amber-950/30 font-semibold"
                      : "border-slate-700 text-slate-400"
                  }
                >
                  v{currentVersion.versionNumber} ({currentVersion.status})
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Tenant: {theatres.find((t) => t.id === theatreId)?.name}</span>
              <span>•</span>
              <span>Hall: {halls.find((h) => h.id === selectedHallId)?.name}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {statusMessage && (
            <div
              className={`text-xs px-3 py-1 rounded border flex items-center gap-1.5 animate-in fade-in duration-200 ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : statusMessage.type === "error"
                  ? "bg-rose-950/60 border-rose-500/40 text-rose-300"
                  : "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
              }`}
            >
              {statusMessage.type === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {statusMessage.type === "error" && <AlertTriangle className="w-3.5 h-3.5" />}
              {statusMessage.type === "info" && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleValidateVersion}
            className="border-slate-700 text-slate-300 hover:text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-cyan-400" />
            Validate
          </Button>

          {currentVersion?.status === "DRAFT" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handlePublishVersion}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950"
              >
                <UploadCloud className="w-4 h-4 mr-1.5" />
                Publish to Live
              </Button>
            </>
          )}

          {currentVersion?.status === "PUBLISHED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewDraft}
              className="border-amber-500/50 text-amber-400 hover:bg-amber-950/30"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Draft Revision
            </Button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. SUB-TOOLBAR: CANVAS & GRID CONTROLS (Part 2) */}
      {/* ------------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
        {/* Left: Viewport & Zoom */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 mr-1 font-medium">Zoom:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white"
            title="Zoom Out (-10%)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono font-bold">
            {Math.round(transform.zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(0.1)}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white"
            title="Zoom In (+10%)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToScreen}
            className="h-7 px-2 text-slate-300 hover:text-white"
            title="Fit to Screen"
          >
            <Maximize className="w-3.5 h-3.5 mr-1" /> Fit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 px-2 text-slate-300 hover:text-white"
            title="Reset to 100%"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> 100%
          </Button>

          <div className="h-4 w-px bg-slate-800 mx-2" />

          {/* Grid Density */}
          <span className="text-slate-400 mr-1 font-medium">Grid:</span>
          {(["SMALL", "MEDIUM", "LARGE"] as GridDensity[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                const size = d === "SMALL" ? 10 : d === "MEDIUM" ? 20 : 40;
                handleSavePreferences({ gridDensity: d, gridSize: size });
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                preferences.gridDensity === d
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {d === "SMALL" ? "10px" : d === "MEDIUM" ? "20px" : "40px"}
            </button>
          ))}

          {/* Grid Visibility Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSavePreferences({ gridVisible: !preferences.gridVisible })}
            className={`h-7 px-2 ${preferences.gridVisible ? "text-cyan-400" : "text-slate-500"}`}
            title="Toggle Grid Visibility"
          >
            <Grid className="w-3.5 h-3.5 mr-1" />
            {preferences.gridVisible ? "Visible" : "Hidden"}
          </Button>

          {/* Snap Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSavePreferences({ snapEnabled: !preferences.snapEnabled })}
            className={`h-7 px-2 ${preferences.snapEnabled ? "text-emerald-400" : "text-slate-500"}`}
            title="Toggle Snap to Grid"
          >
            <Magnet className="w-3.5 h-3.5 mr-1" />
            Snap: {preferences.snapEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Center: Alignment Tools */}
        <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
          <span className="text-[11px] text-slate-400 mr-1">Align ({selectedSeatIds.length}):</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("ALIGN_LEFT")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("ALIGN_RIGHT")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("ALIGN_TOP")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Align Top"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("ALIGN_BOTTOM")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Align Bottom"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("CENTER_HORIZONTAL")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Center Horizontally"
          >
            <AlignCenterHorizontal className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 2 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("CENTER_VERTICAL")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Center Vertically"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right: Unit & Dimensions */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Unit:</span>
          {(["PX", "CM", "FT", "M"] as MeasurementUnit[]).map((u) => (
            <button
              key={u}
              onClick={() => handleSavePreferences({ measurementUnit: u })}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                preferences.measurementUnit === u
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {u}
            </button>
          ))}
          <span className="text-slate-500 font-mono text-[11px]">
            [{convertedDimensions.width} × {convertedDimensions.height} {convertedDimensions.unit}]
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. MAIN WORKSPACE: CANVAS + RIGHT CONTROL PANEL */}
      {/* ------------------------------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Visual Canvas Board */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="canvas-board flex-1 relative overflow-hidden cursor-crosshair bg-slate-950"
          style={{
            backgroundColor: preferences.backgroundColor || "#0B0F19",
          }}
        >
          {/* Dynamic Grid Pattern */}
          {preferences.gridVisible && (
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="canvas-grid-pattern"
                  width={preferences.gridSize * transform.zoom}
                  height={preferences.gridSize * transform.zoom}
                  patternUnits="userSpaceOnUse"
                  x={transform.panX % (preferences.gridSize * transform.zoom)}
                  y={transform.panY % (preferences.gridSize * transform.zoom)}
                >
                  <path
                    d={`M ${preferences.gridSize * transform.zoom} 0 L 0 0 0 ${
                      preferences.gridSize * transform.zoom
                    }`}
                    fill="none"
                    stroke={preferences.gridColor || "#334155"}
                    strokeWidth="1"
                    strokeOpacity={preferences.gridOpacity || 0.35}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#canvas-grid-pattern)" />
            </svg>
          )}

          {/* Interactive Transformed World Container */}
          <div
            className="absolute transform-gpu transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${transform.panX}px, ${transform.panY}px) scale(${transform.zoom})`,
              width: `${preferences.canvasWidth}px`,
              height: `${preferences.canvasHeight}px`,
            }}
          >
            {/* Cinema Screen Banner */}
            <div className="w-[850px] mx-auto mt-6 mb-12">
              <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-300 to-cyan-500 shadow-lg shadow-cyan-500/30" />
              <div className="text-center mt-2 text-xs font-bold tracking-[0.3em] uppercase text-slate-400">
                CURVED CINEMA SCREEN / DISPLAY AREA
              </div>
            </div>

            {/* Emergency Exits Markers */}
            {currentVersion?.emergencyExits?.map((exit) => (
              <div
                key={exit.id}
                className={`absolute px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-bold tracking-wider flex items-center gap-1 ${
                  exit.position === "TOP_LEFT"
                    ? "top-4 left-6"
                    : exit.position === "TOP_RIGHT"
                    ? "top-4 right-6"
                    : exit.position === "BOTTOM_LEFT"
                    ? "bottom-4 left-6"
                    : "bottom-4 right-6"
                }`}
              >
                <span>EXIT</span>
                <span className="text-[9px] text-rose-400/80">({exit.widthUnits}m)</span>
              </div>
            ))}

            {/* Walkway Guides */}
            {currentVersion?.walkways?.map((w) => (
              <div
                key={w.id}
                className="absolute left-10 right-10 h-6 border-y border-dashed border-cyan-800/40 bg-cyan-950/10 flex items-center justify-center text-[10px] text-cyan-400 font-mono tracking-widest pointer-events-none"
                style={{ top: "340px" }}
              >
                WALKWAY AISLE ({w.widthUnits}px)
              </div>
            ))}

            {/* Seats Rendering */}
            <div className="relative w-full h-full">
              {currentVersion?.seats.map((seat) => {
                const isSelected = selectedSeatIds.includes(seat.id);
                const section = currentVersion.sections.find((s) => s.id === seat.sectionId);
                const color = section?.displayColor || "#38BDF8";

                return (
                  <div
                    key={seat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSeat(seat.id, e.shiftKey || e.ctrlKey || e.metaKey);
                    }}
                    style={{
                      left: `${seat.coordinates.x}px`,
                      top: `${seat.coordinates.y}px`,
                      borderColor: isSelected ? "#38BDF8" : color,
                    }}
                    className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer transition-transform duration-100 ${
                      isSelected
                        ? "ring-2 ring-cyan-400 scale-125 z-20 shadow-lg shadow-cyan-500/50 bg-cyan-950"
                        : "hover:scale-110 z-10 bg-slate-900 border"
                    }`}
                  >
                    <span style={{ color }}>{seat.seatNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas HUD / Mini Status Indicator (Part 2) */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-xs flex items-center gap-4 backdrop-blur shadow-xl pointer-events-none">
            <div>
              <span className="text-slate-500">Pan:</span>{" "}
              <span className="font-mono text-slate-300">
                {Math.round(transform.panX)}, {Math.round(transform.panY)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Seats:</span>{" "}
              <span className="font-mono text-slate-300">{currentVersion?.seats.length || 0}</span>
            </div>
            <div>
              <span className="text-slate-500">Selected:</span>{" "}
              <span className="font-mono text-cyan-400">{selectedSeatIds.length}</span>
            </div>
            <div>
              <span className="text-slate-500">Mode:</span>{" "}
              <span className="font-mono text-emerald-400">
                {currentVersion?.status === "DRAFT" ? "Interactive Draft" : "Immutable Live"}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* 4. RIGHT SIDEBAR: TABS FOR LAYOUT, SECTIONS & CANVAS SETTINGS */}
        {/* -------------------------------------------------------------------- */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-20">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("layout")}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === "layout"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Layout
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === "sections"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Armchair className="w-3.5 h-3.5 inline mr-1.5" /> Sections
            </button>
            <button
              onClick={() => setActiveTab("canvas")}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === "canvas"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5 inline mr-1.5" /> Preferences
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: LAYOUT & VERSION MANAGEMENT (Part 1) */}
            {activeTab === "layout" && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Layout Definition</label>
                  <select
                    value={currentDef?.id || ""}
                    onChange={(e) => loadDefinitionDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {definitions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Auditorium / Screen</label>
                  <select
                    value={selectedHallId}
                    onChange={(e) => setSelectedHallId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {halls.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Version History List */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-cyan-400" /> Version History
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {allVersions.length} versions
                    </span>
                  </div>

                  <div className="space-y-2">
                    {allVersions.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => setCurrentVersion(v)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          currentVersion?.id === v.id
                            ? "bg-slate-800/90 border-cyan-500/80 shadow"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">v{v.versionNumber}</span>
                          <Badge
                            variant="outline"
                            className={
                              v.status === "PUBLISHED"
                                ? "border-emerald-500/40 text-emerald-400"
                                : v.status === "DRAFT"
                                ? "border-amber-500/40 text-amber-400"
                                : "border-slate-700 text-slate-500"
                            }
                          >
                            {v.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {v.versionNotes || "No notes"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                          <span>{v.seats.length} seats</span>
                          <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Report Widget */}
                {validationResult && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Validation Report
                    </span>
                    <div
                      className={`p-3 rounded-lg border text-xs space-y-2 ${
                        validationResult.isValid
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                          : "bg-rose-950/30 border-rose-500/40 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Status: {validationResult.isValid ? "PASSED" : "FAILED"}</span>
                        <span>{validationResult.errors.length} errors</span>
                      </div>
                      {validationResult.errors.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-300">
                          {validationResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                      {validationResult.warnings.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-300">
                          {validationResult.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: SECTIONS & CAPACITY */}
            {activeTab === "sections" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Auditorium Sections</span>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Total: {currentVersion?.seats.length || 0} seats
                  </span>
                </div>

                {currentVersion?.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sec.displayColor }}
                        />
                        <span className="font-bold text-white">{sec.name}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-700 text-slate-400">
                        {sec.seatType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Rows: {sec.rowLabels.join(", ")}</span>
                      <span>{sec.seatCount} seats</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: THEATRE CANVAS PREFERENCES (Part 2) */}
            {activeTab === "canvas" && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Cinema Theatre Profile
                  </label>
                  <select
                    value={theatreId}
                    onChange={(e) => setTheatreId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Grid Configuration
                  </label>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Grid Size:</span>
                    <span className="font-mono text-cyan-400">{preferences.gridSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={preferences.gridSize}
                    onChange={(e) =>
                      handleSavePreferences({ gridSize: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-500"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Grid Opacity:</span>
                    <span className="font-mono text-cyan-400">
                      {Math.round(preferences.gridOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={preferences.gridOpacity}
                    onChange={(e) =>
                      handleSavePreferences({ gridOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Snapping & Alignment
                  </label>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Snap Strength:</span>
                    <span className="font-mono text-emerald-400">{preferences.snapStrength}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={preferences.snapStrength}
                    onChange={(e) =>
                      handleSavePreferences({ snapStrength: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPreferences}
                    className="w-full border-slate-700 text-slate-300 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
