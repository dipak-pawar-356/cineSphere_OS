"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  RotateCw,
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
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Undo2,
  Redo2,
  GitCompare,
  Paintbrush,
  Scaling,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  MoveVertical,
  Sparkles,
  Tag,
  ShieldCheck,
  Building2,
  DoorOpen,
  Footprints,
  Lock,
  Unlock,
  Tv,
  Flame,
  ShieldAlert,
  FlipHorizontal,
  FlipVertical,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  StructuralObject,
  StructuralObjectType,
} from "@/types/structural-objects.types";
import {
  GeometrySettings,
  LayoutPublishPreflightResult,
  SymmetryAxis,
  AlignType,
  DistributeType,
} from "@/types/geometry-layout.types";
import { useStructuralObjects } from "@/lib/hooks/use-structural-objects";
import { useGeometryEngine } from "@/lib/hooks/use-geometry-engine";
import { useHallPreview } from "@/lib/hooks/use-hall-preview";
import { useHallValidation } from "@/lib/hooks/use-hall-validation";
import { PreviewMode, PreviewViewport } from "@/types/hall-preview.types";
import { ValidationSeverity } from "@/types/hall-validation.types";
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
import {
  HallSection,
  HallRow,
  SectionGeometryType,
  RowGeometryType,
  RowNumberingStrategy,
  RowAccessibilityType,
} from "@/types/section-row-designer.types";
import {
  SeatTemplate,
  SeatCategoryRegistryItem,
  SeatNumberingStyle,
  SeatAccessibilityType,
  SeatGeometryCalculationType,
} from "@/types/seat-generator.types";
import { CanvasGridEngine } from "@/lib/engine/canvas-grid-engine";
import {
  listLayoutDefinitionsAction,
  getLayoutDefinitionAction,
  getLayoutVersionAction,
  createLayoutDefinitionAction,
  createDraftVersionAction,
  updateDraftLayoutAction,
  validateLayoutVersionAction,
  publishLayoutVersionAction,
  duplicateLayoutAction,
  archiveLayoutAction,
  restoreLayoutAction,
  loadCanvasPreferencesAction,
  saveCanvasPreferencesAction,
  resetCanvasPreferencesAction,
} from "@/actions/hall-designer-actions";
import {
  listSectionsAction,
  createSectionAction,
  updateSectionAction,
  deleteSectionAction,
  duplicateSectionAction,
  reorderSectionsAction,
  createRowAction,
  updateRowAction,
  deleteRowAction,
  duplicateRowAction,
  reorderRowsAction,
} from "@/actions/section-row-actions";
import {
  generateSeatsAction,
  regenerateSeatsAction,
  deleteGeneratedSeatsAction,
  loadSeatsAction,
  createCategoryAction,
  loadCategoriesAction,
  archiveCategoryAction,
  restoreCategoryAction,
  duplicateCategoryAction,
} from "@/actions/seat-generator-actions";

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
  // 1. Core Selection & Entity State
  // ----------------------------------------------------------------------------
  const [theatreId, setTheatreId] = useState(initialTheatreId);
  const [selectedHallId, setSelectedHallId] = useState(halls[0]?.id || "hall-pun-aud1");

  // Layout Definitions & Active Version
  const [definitions, setDefinitions] = useState<LayoutDefinition[]>([]);
  const [currentDef, setCurrentDef] = useState<LayoutDefinition | null>(null);
  const [currentVersion, setCurrentVersion] = useState<LayoutVersion | null>(null);
  const [allVersions, setAllVersions] = useState<LayoutVersion[]>([]);

  // Undo / Redo Stacks (Undo/Redo Placeholders)
  const [undoStack, setUndoStack] = useState<SeatDefinition[][]>([]);
  const [redoStack, setRedoStack] = useState<SeatDefinition[][]>([]);

  // Modals & Popups
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDesc, setNewLayoutDesc] = useState("");
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareTargetVersionId, setCompareTargetVersionId] = useState<string>("");

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
  const [activeTab, setActiveTab] = useState<
    "layout" | "sections" | "seats" | "structures" | "geometry" | "preview" | "validation" | "canvas"
  >("layout");

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<LayoutValidationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Seat Generator & Category Registry State (Phase 4 – Parts 5 & 6)
  const [seatCategories, setSeatCategories] = useState<SeatCategoryRegistryItem[]>([]);
  const [selectedSeatRowId, setSelectedSeatRowId] = useState<string>("");
  const [generatedSeatTemplates, setGeneratedSeatTemplates] = useState<SeatTemplate[]>([]);
  const [seatGenNumberingStyle, setSeatGenNumberingStyle] = useState<SeatNumberingStyle>("ALPHABETIC");
  const [seatGenPrefix, setSeatGenPrefix] = useState<string>("");
  const [seatGenSuffix, setSeatGenSuffix] = useState<string>("");
  const [seatGenStartNum, setSeatGenStartNum] = useState<number>(1);
  const [seatGenSkipNums, setSeatGenSkipNums] = useState<string>("");
  const [seatGenIsReversed, setSeatGenIsReversed] = useState<boolean>(false);
  const [seatGenSpacing, setSeatGenSpacing] = useState<number>(10);
  const [seatGenGeometry, setSeatGenGeometry] = useState<SeatGeometryCalculationType>("STRAIGHT");
  const [seatGenRadius, setSeatGenRadius] = useState<number>(600);
  const [seatGenArcAngle, setSeatGenArcAngle] = useState<number>(30);
  const [seatGenCategoryCode, setSeatGenCategoryCode] = useState<string>("VIP");
  const [seatGenWheelchairIndices, setSeatGenWheelchairIndices] = useState<string>("");
  const [seatGenCompanionIndices, setSeatGenCompanionIndices] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryData, setNewCategoryData] = useState<{
    code: string;
    name: string;
    displayName: string;
    color: string;
    priority: number;
    accessibility: SeatAccessibilityType;
    isPremium: boolean;
  }>({
    code: "",
    name: "",
    displayName: "",
    color: "#38BDF8",
    priority: 1,
    accessibility: "STANDARD",
    isPremium: false,
  });

  // Section & Row Designer State (Parts 3 & 4)
  const [detailedSections, setDetailedSections] = useState<HallSection[]>([]);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionData, setNewSectionData] = useState<{
    name: string;
    displayName: string;
    internalCode: string;
    color: string;
    seatCategory: "Standard" | "Recliner" | "VIP" | "Couple" | "Wheelchair" | "Sofa";
    shapeType: SectionGeometryType;
    labelPosition: "TOP" | "BOTTOM" | "LEFT" | "RIGHT" | "CENTER" | "HIDDEN";
    capacity: number;
  }>({
    name: "",
    displayName: "",
    internalCode: "",
    color: "#38BDF8",
    seatCategory: "Standard",
    shapeType: "RECTANGLE",
    labelPosition: "TOP",
    capacity: 0,
  });

  const [isAddingRowForSectionId, setIsAddingRowForSectionId] = useState<string | null>(null);
  const [newRowData, setNewRowData] = useState<{
    rowName: string;
    displayName: string;
    seatCount: number;
    spacing: number;
    numberingStrategy: RowNumberingStrategy;
    geometryType: RowGeometryType;
    accessibility: RowAccessibilityType;
  }>({
    rowName: "",
    displayName: "",
    seatCount: 10,
    spacing: 35,
    numberingStrategy: "ALPHABETICAL",
    geometryType: "STRAIGHT",
    accessibility: "STANDARD",
  });

  // Structural Objects (Phase 4 – Part 7)
  const {
    objects: structuralObjects,
    selectedObjectId: selectedStructuralObjectId,
    setSelectedObjectId: setSelectedStructuralObjectId,
    selectedObject: selectedStructuralObject,
    createObject: createStructuralObject,
    updateObject: updateStructuralObject,
    deleteObject: deleteStructuralObject,
    duplicateObject: duplicateStructuralObject,
    toggleLock: toggleStructuralLock,
    toggleVisibility: toggleStructuralVisibility,
    screens,
    emergencyExits,
    hasScreen,
    hasEmergencyExit,
  } = useStructuralObjects({
    theatreId,
    layoutVersionId: currentVersion?.id || "",
    autoLoad: !!currentVersion?.id,
  });

  // Geometry Engine & Preflight Validation (Phase 4 – Part 8)
  const {
    settings: geometrySettings,
    preflightResult,
    isPreflightValidating,
    runPreflightCheck,
    mirrorLayout,
    saveSettings: saveGeometrySettings,
  } = useGeometryEngine({
    theatreId,
    layoutVersionId: currentVersion?.id || "",
    autoLoad: !!theatreId,
  });

  // Hall Preview Engine (Phase 4 – Part 9)
  const {
    bundle: previewBundle,
    mode: previewMode,
    setMode: setPreviewMode,
    viewport: previewViewport,
    setViewport: setPreviewViewport,
    showLabels: previewShowLabels,
    setShowLabels: setPreviewShowLabels,
    showGrid: previewShowGrid,
    setShowGrid: setPreviewShowGrid,
    themeName: previewThemeName,
    setThemeName: setPreviewThemeName,
    simulationState,
    toggleSeatSimulation,
    clearSimulationSelection,
    decoratedSeats,
    filteredStructuralObjects,
    statistics: previewStatistics,
    preferences: previewPreferences,
    loadPreview,
    refreshPreview,
  } = useHallPreview({
    theatreId,
    layoutVersionId: currentVersion?.id || "",
    autoLoad: !!currentVersion?.id,
  });

  // Hall Validation Engine (Phase 4 – Part 10)
  const {
    report: validationReport,
    rules: validationRules,
    isValidating: isRunningValidation,
    filterSeverity,
    setFilterSeverity,
    filteredResults: validationResultsList,
    canPublish: validationCanPublish,
    runValidation,
    validateBeforePublish,
  } = useHallValidation({
    theatreId,
    layoutVersionId: currentVersion?.id || "",
    autoValidate: !!currentVersion?.id,
  });

  // Structural Object form state
  const [newStructType, setNewStructType] = useState<StructuralObjectType>("SCREEN");
  const [newStructName, setNewStructName] = useState<string>("");
  const [newStructDisplayName, setNewStructDisplayName] = useState<string>("");
  const [newStructCode, setNewStructCode] = useState<string>("");
  const [newStructWidth, setNewStructWidth] = useState<number>(240);
  const [newStructHeight, setNewStructHeight] = useState<number>(40);
  const [newStructColor, setNewStructColor] = useState<string>("#38BDF8");
  const [newStructIsObstacle, setNewStructIsObstacle] = useState<boolean>(false);
  const [isAddingStructuralObject, setIsAddingStructuralObject] = useState<boolean>(false);

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
          setDetailedSections([]);
        }
      }

      // 3. Load Dynamic Category Registry for this theatre
      const catRes = await loadCategoriesAction({ theatreId, includeArchived: true });
      if (catRes.success && catRes.data) {
        setSeatCategories(catRes.data);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load designer data" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSectionsForVersion = async (verId: string) => {
    try {
      const res = await listSectionsAction({ theatreId, layoutVersionId: verId });
      if (res.success && res.data) {
        setDetailedSections(res.data);
      }
    } catch {
      // fallback
    }
  };

  const loadDefinitionDetails = async (defId: string) => {
    const res = await getLayoutDefinitionAction({ theatreId, layoutDefinitionId: defId });
    if (res.success && res.data) {
      setCurrentDef(res.data.definition);
      setAllVersions(res.data.versions);

      const targetVer =
        res.data.activeDraftVersion ||
        res.data.currentPublishedVersion ||
        res.data.versions[0];
      setCurrentVersion(targetVer || null);
      if (targetVer) {
        loadSectionsForVersion(targetVer.id);
      }
      setUndoStack([]);
      setRedoStack([]);
    }
  };

  // Section CRUD Handlers
  const handleCreateSection = async () => {
    if (!currentVersion || currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Cannot add section to immutable live version. Create a draft first." });
      return;
    }
    try {
      const res = await createSectionAction({
        theatreId,
        layoutVersionId: currentVersion.id,
        name: newSectionData.name || "New Section",
        displayName: newSectionData.displayName || "New Auditorium Section",
        internalCode: newSectionData.internalCode || `SEC-${Date.now().toString().slice(-4)}`,
        color: newSectionData.color || "#38BDF8",
        seatCategory: newSectionData.seatCategory || "Standard",
        capacity: newSectionData.capacity || 0,
        priority: detailedSections.length + 1,
        displayOrder: detailedSections.length + 1,
        rotation: 0,
        position: { x: 100, y: 150 + detailedSections.length * 150 },
        visibility: "VISIBLE",
        geometry: {
          shapeType: newSectionData.shapeType,
          curvatureRadius: newSectionData.shapeType === "CURVED" || newSectionData.shapeType === "ARC" ? 600 : undefined,
          arcAngle: newSectionData.shapeType === "CURVED" || newSectionData.shapeType === "ARC" ? 30 : undefined,
        },
        labelPosition: newSectionData.labelPosition || "TOP",
      });

      if (res.success && res.data) {
        setDetailedSections((prev) => [...prev, res.data!]);
        setIsAddingSection(false);
        setNewSectionData({
          name: "",
          displayName: "",
          internalCode: "",
          color: "#38BDF8",
          seatCategory: "Standard",
          shapeType: "RECTANGLE",
          labelPosition: "TOP",
          capacity: 0,
        });
        setStatusMessage({ type: "success", text: `Section '${res.data.name}' created.` });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to create section." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create section." });
    }
  };

  const handleDeleteSection = async (secId: string) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await deleteSectionAction({ theatreId, sectionId: secId });
      if (res.success) {
        setDetailedSections((prev) => prev.filter((s) => s.id !== secId));
        setStatusMessage({ type: "success", text: "Section deleted." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete section." });
    }
  };

  const handleDuplicateSection = async (secId: string) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await duplicateSectionAction({ theatreId, sectionId: secId });
      if (res.success && res.data) {
        setDetailedSections((prev) => [...prev, res.data!]);
        setStatusMessage({ type: "success", text: `Section duplicated as '${res.data.name}'.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to duplicate section." });
    }
  };

  const handleReorderSection = async (secId: string, direction: "UP" | "DOWN" | "TOP" | "BOTTOM") => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await reorderSectionsAction({
        theatreId,
        layoutVersionId: currentVersion.id,
        sectionId: secId,
        direction,
      });
      if (res.success && res.data) {
        setDetailedSections(res.data);
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to reorder section." });
    }
  };

  // Row CRUD Handlers
  const handleCreateRow = async (secId: string) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const targetSec = detailedSections.find((s) => s.id === secId);
      const nextSeq = (targetSec?.rows.length || 0) + 1;
      const res = await createRowAction({
        theatreId,
        sectionId: secId,
        rowName: newRowData.rowName || String.fromCharCode(64 + nextSeq),
        displayName: newRowData.displayName || `Row ${newRowData.rowName || String.fromCharCode(64 + nextSeq)}`,
        sequence: nextSeq,
        seatCount: newRowData.seatCount || 10,
        spacing: newRowData.spacing || 35,
        rotation: 0,
        visibility: "VISIBLE",
        accessibility: newRowData.accessibility || "STANDARD",
        geometry: {
          geometryType: newRowData.geometryType || "STRAIGHT",
          curveRadius: newRowData.geometryType === "CURVED" ? 600 : undefined,
        },
        configuration: {
          numberingStrategy: newRowData.numberingStrategy || "ALPHABETICAL",
          isReversed: false,
          startIndex: 1,
          endIndex: newRowData.seatCount || 10,
        },
      });

      if (res.success && res.data) {
        setDetailedSections((prev) =>
          prev.map((s) =>
            s.id === secId ? { ...s, rows: [...s.rows, res.data!] } : s
          )
        );
        setIsAddingRowForSectionId(null);
        setNewRowData({
          rowName: "",
          displayName: "",
          seatCount: 10,
          spacing: 35,
          numberingStrategy: "ALPHABETICAL",
          geometryType: "STRAIGHT",
          accessibility: "STANDARD",
        });
        setStatusMessage({ type: "success", text: `Row '${res.data.rowName}' added.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create row." });
    }
  };

  const handleDeleteRow = async (secId: string, rowId: string) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await deleteRowAction({ theatreId, rowId });
      if (res.success) {
        setDetailedSections((prev) =>
          prev.map((s) =>
            s.id === secId ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) } : s
          )
        );
        setStatusMessage({ type: "success", text: "Row deleted." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete row." });
    }
  };

  const handleDuplicateRow = async (secId: string, rowId: string) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await duplicateRowAction({ theatreId, rowId });
      if (res.success && res.data) {
        setDetailedSections((prev) =>
          prev.map((s) =>
            s.id === secId ? { ...s, rows: [...s.rows, res.data!] } : s
          )
        );
        setStatusMessage({ type: "success", text: `Row duplicated as '${res.data.rowName}'.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to duplicate row." });
    }
  };

  const handleReorderRow = async (secId: string, rowId: string, direction: "UP" | "DOWN") => {
    if (!currentVersion || currentVersion.status !== "DRAFT") return;
    try {
      const res = await reorderRowsAction({ theatreId, sectionId: secId, rowId, direction });
      if (res.success && res.data) {
        setDetailedSections((prev) =>
          prev.map((s) => (s.id === secId ? { ...s, rows: res.data! } : s))
        );
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to reorder row." });
    }
  };

  // ----------------------------------------------------------------------------
  // Seat Generator & Category Registry Handlers (Phase 4 – Parts 5 & 6)
  // ----------------------------------------------------------------------------
  const handleGenerateSeatsForRow = async (isRegeneration = false) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Cannot generate seats on an immutable published layout. Create a draft first." });
      return;
    }
    if (!selectedSeatRowId) {
      setStatusMessage({ type: "error", text: "Please select a target row first." });
      return;
    }

    let targetRow: HallRow | null = null;
    let targetSection: HallSection | null = null;
    for (const sec of detailedSections) {
      const foundRow = sec.rows.find((r) => r.id === selectedSeatRowId);
      if (foundRow) {
        targetRow = foundRow;
        targetSection = sec;
        break;
      }
    }

    if (!targetRow || !targetSection) {
      setStatusMessage({ type: "error", text: "Selected row was not found in layout." });
      return;
    }

    const parsedSkipNums = seatGenSkipNums
      ? seatGenSkipNums.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
      : [];
    const parsedWheelchair = seatGenWheelchairIndices
      ? seatGenWheelchairIndices.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
      : [];
    const parsedCompanion = seatGenCompanionIndices
      ? seatGenCompanionIndices.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
      : [];

    setIsLoading(true);
    try {
      const payload = {
        theatreId,
        layoutVersionId: currentVersion.id,
        sectionId: targetSection.id,
        rowId: targetRow.id,
        rowName: targetRow.rowName,
        sectionName: targetSection.name,
        categoryCode: seatGenCategoryCode,
        seatCount: targetRow.seatCount,
        seatWidth: 40,
        seatHeight: 40,
        spacing: seatGenSpacing,
        startX: targetRow.geometry?.offsetX || 100,
        startY: targetRow.geometry?.offsetY || 100,
        rotation: targetRow.geometry?.angle || 0,
        numbering: {
          style: seatGenNumberingStyle,
          prefix: seatGenPrefix || undefined,
          suffix: seatGenSuffix || undefined,
          startNumber: seatGenStartNum,
          isReversed: seatGenIsReversed,
          skipNumbers: parsedSkipNums,
        },
        accessibility: {
          wheelchairSeatIndices: parsedWheelchair,
          companionSeatIndices: parsedCompanion,
        },
        geometry: {
          type: seatGenGeometry,
          radius: seatGenRadius,
          arcAngle: seatGenArcAngle,
          angle: targetRow.geometry?.angle,
        },
      };

      const res = isRegeneration
        ? await regenerateSeatsAction(payload)
        : await generateSeatsAction(payload);

      if (res.success && res.data) {
        setGeneratedSeatTemplates(res.data.seats);

        const canvasSeatDefs: SeatDefinition[] = res.data.seats.map((st) => ({
          id: st.id,
          seatNumber: st.seatNumber,
          row: targetRow!.rowName,
          column: st.columnNumber,
          sectionId: targetSection!.id,
          sectionName: targetSection!.name,
          category: st.categoryCode as any,
          type: st.accessibility.isWheelchairAccessible ? "WHEELCHAIR" : "STANDARD",
          seatType: (st.accessibility.isWheelchairAccessible ? "WHEELCHAIR" : "STANDARD") as any,
          isActive: true,
          status: "AVAILABLE",
          coordinates: {
            x: st.coordinates.x,
            y: st.coordinates.y,
            z: 0,
          },
        }));

        const filtered = currentVersion.seats.filter((s) => s.row !== targetRow!.rowName || s.sectionId !== targetSection!.id);
        const merged = [...filtered, ...canvasSeatDefs];
        setCurrentVersion({
          ...currentVersion,
          seats: merged,
        });

        setStatusMessage({
          type: "success",
          text: `Successfully ${isRegeneration ? "regenerated" : "generated"} ${res.data.generatedCount} seat templates with permanent UUIDs.`,
        });
      } else {
        const errStr = typeof res.error === "string" ? res.error : res.error?.message || "Seat generation failed.";
        setStatusMessage({ type: "error", text: errStr });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Seat generation failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSeatsForRow = async () => {
    if (!currentVersion || currentVersion.status !== "DRAFT" || !selectedSeatRowId) return;
    try {
      const res = await deleteGeneratedSeatsAction({
        theatreId,
        layoutVersionId: currentVersion.id,
        rowId: selectedSeatRowId,
      });
      if (res.success) {
        setGeneratedSeatTemplates([]);
        setStatusMessage({ type: "success", text: `Deleted ${res.data?.deletedCount || 0} seat templates for row.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete seats." });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.code || !newCategoryData.name) {
      setStatusMessage({ type: "error", text: "Category code and name are required." });
      return;
    }
    try {
      const res = await createCategoryAction({
        theatreId,
        code: newCategoryData.code,
        name: newCategoryData.name,
        displayName: newCategoryData.displayName || newCategoryData.name,
        color: newCategoryData.color,
        priority: newCategoryData.priority,
        accessibility: newCategoryData.accessibility,
        isPremium: newCategoryData.isPremium,
      });
      if (res.success && res.data) {
        setSeatCategories((prev) => [...prev, res.data!].sort((a, b) => a.priority - b.priority));
        setIsAddingCategory(false);
        setNewCategoryData({
          code: "",
          name: "",
          displayName: "",
          color: "#38BDF8",
          priority: 1,
          accessibility: "STANDARD",
          isPremium: false,
        });
        setStatusMessage({ type: "success", text: `Created category '${res.data.name}' in registry.` });
      } else {
        const errStr = typeof res.error === "string" ? res.error : res.error?.message || "Failed to create category.";
        setStatusMessage({ type: "error", text: errStr });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create category." });
    }
  };

  const handleArchiveCategory = async (catId: string) => {
    try {
      const res = await archiveCategoryAction({ theatreId, categoryId: catId });
      if (res.success && res.data) {
        setSeatCategories((prev) => prev.map((c) => (c.id === catId ? res.data! : c)));
        setStatusMessage({ type: "success", text: `Category archived.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to archive category." });
    }
  };

  const handleRestoreCategory = async (catId: string) => {
    try {
      const res = await restoreCategoryAction({ theatreId, categoryId: catId });
      if (res.success && res.data) {
        setSeatCategories((prev) => prev.map((c) => (c.id === catId ? res.data! : c)));
        setStatusMessage({ type: "success", text: `Category restored to active.` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to restore category." });
    }
  };

  const handleDuplicateCategory = async (catId: string) => {
    try {
      const res = await duplicateCategoryAction({ theatreId, categoryId: catId });
      if (res.success && res.data) {
        setSeatCategories((prev) => [...prev, res.data!].sort((a, b) => a.priority - b.priority));
        setStatusMessage({ type: "success", text: `Category duplicated: '${res.data.displayName}'` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to duplicate category." });
    }
  };

  // Structural Objects Handlers (Phase 4 – Part 7)
  const handleCreateStructuralObject = async () => {
    if (!currentVersion || currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Can only add structural objects to DRAFT layouts." });
      return;
    }
    const name = newStructName.trim() || `${newStructType.charAt(0) + newStructType.slice(1).toLowerCase()} Object`;
    const displayName = newStructDisplayName.trim() || name;
    const code = newStructCode.trim() || `STR-${newStructType.slice(0, 3)}-${Date.now().toString().slice(-4)}`;

    const res = await createStructuralObject({
      layoutVersionId: currentVersion.id,
      theatreId,
      objectName: name,
      displayName,
      objectType: newStructType,
      internalCode: code,
      position: { x: 400, y: 150, z: 0 },
      width: newStructWidth,
      height: newStructHeight,
      rotation: 0,
      layer: 1,
      zIndex: 10,
      visibility: "VISIBLE",
      color: newStructColor,
      isLocked: false,
      metadata: {
        isStatic: true,
        isCollisionObstacle: newStructIsObstacle,
        isReservedArea: false,
      },
      geometry: {
        shape: "RECTANGLE",
      },
    });

    if (res) {
      setStatusMessage({ type: "success", text: `Structural object '${displayName}' created.` });
      setIsAddingStructuralObject(false);
      setNewStructName("");
      setNewStructDisplayName("");
      setNewStructCode("");
    }
  };

  // Geometry Engine Handlers (Phase 4 – Part 8)
  const handleMirror = async (axis: SymmetryAxis) => {
    if (!currentVersion || currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Can only mirror DRAFT layouts." });
      return;
    }
    const count = await mirrorLayout(axis);
    setStatusMessage({
      type: "success",
      text: `Layout mirrored ${axis.toLowerCase()}ly (${count} objects updated).`,
    });
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
    const norm = preferences.defaultZoom > 5 ? preferences.defaultZoom / 100 : preferences.defaultZoom;
    setTransform({
      zoom: norm || 1.0,
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
  // 4. Seating Selection & Alignment Operations (Part 2)
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

  const pushUndoState = () => {
    if (currentVersion) {
      setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentVersion.seats))]);
      setRedoStack([]);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !currentVersion) return;
    const previousSeats = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentVersion.seats))]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setCurrentVersion({ ...currentVersion, seats: previousSeats });
    setStatusMessage({ type: "info", text: "Undo: Restored previous seating layout state." });
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !currentVersion) return;
    const nextSeats = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(currentVersion.seats))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setCurrentVersion({ ...currentVersion, seats: nextSeats });
    setStatusMessage({ type: "info", text: "Redo: Re-applied seating layout modification." });
  };

  const handleAlignSelectedSeats = (
    op:
      | "ALIGN_LEFT"
      | "ALIGN_RIGHT"
      | "ALIGN_TOP"
      | "ALIGN_BOTTOM"
      | "CENTER_HORIZONTAL"
      | "CENTER_VERTICAL"
      | "DISTRIBUTE_HORIZONTALLY"
      | "DISTRIBUTE_VERTICALLY"
  ) => {
    if (!currentVersion || selectedSeatIds.length < 2) {
      setStatusMessage({ type: "info", text: "Select at least 2 seats to align or distribute." });
      return;
    }
    if (currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Layout is published/archived. Switch to Draft version to edit." });
      return;
    }

    pushUndoState();
    const selectedSeats = currentVersion.seats.filter((s) => selectedSeatIds.includes(s.id));
    const alignedSelected = CanvasGridEngine.alignSeats(selectedSeats, op);
    const alignedMap = new Map(alignedSelected.map((s) => [s.id, s]));
    const updatedSeats = currentVersion.seats.map((s) => alignedMap.get(s.id) || s);

    setCurrentVersion({ ...currentVersion, seats: updatedSeats });
    setStatusMessage({
      type: "success",
      text: `Applied ${op.replace("_", " ").toLowerCase()} alignment to ${selectedSeatIds.length} seats.`,
    });
  };

  // Rotation operation
  const handleRotateSelectedSeats = () => {
    if (!currentVersion || selectedSeatIds.length === 0) return;
    if (currentVersion.status !== "DRAFT") {
      setStatusMessage({ type: "error", text: "Only draft layouts can be rotated." });
      return;
    }

    pushUndoState();
    const selectedSeats = currentVersion.seats.filter((s) => selectedSeatIds.includes(s.id));
    const centerX = Math.round(selectedSeats.reduce((acc, s) => acc + s.coordinates.x, 0) / selectedSeats.length);
    const centerY = Math.round(selectedSeats.reduce((acc, s) => acc + s.coordinates.y, 0) / selectedSeats.length);

    // Rotate coordinates 90 degrees around center
    const rotated = selectedSeats.map((seat) => {
      const dx = seat.coordinates.x - centerX;
      const dy = seat.coordinates.y - centerY;
      return {
        ...seat,
        coordinates: {
          x: centerX - dy,
          y: centerY + dx,
        },
      };
    });

    const rotatedMap = new Map(rotated.map((s) => [s.id, s]));
    const updatedSeats = currentVersion.seats.map((s) => rotatedMap.get(s.id) || s);
    setCurrentVersion({ ...currentVersion, seats: updatedSeats });
    setStatusMessage({ type: "success", text: `Rotated ${selectedSeatIds.length} seats by 90°.` });
  };

  // ----------------------------------------------------------------------------
  // 5. Versioning & Validation Actions (Part 1)
  // ----------------------------------------------------------------------------
  const handleCreateNewLayout = async () => {
    if (!newLayoutName.trim()) return;
    setIsLoading(true);
    try {
      const res = await createLayoutDefinitionAction({
        theatreId,
        hallId: selectedHallId,
        name: newLayoutName.trim(),
        description: newLayoutDesc.trim() || undefined,
      });

      if (res.success && res.data) {
        setShowCreateModal(false);
        setNewLayoutName("");
        setNewLayoutDesc("");
        await loadData();
        setStatusMessage({
          type: "success",
          text: `Created layout '${res.data.definition.name}' with initial v1 Draft!`,
        });
      } else {
        setStatusMessage({ type: "error", text: res.error?.message || "Failed to create layout." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to create layout." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateLayout = async () => {
    if (!currentDef) return;
    setIsLoading(true);
    try {
      const res = await duplicateLayoutAction({
        theatreId,
        layoutDefinitionId: currentDef.id,
        newName: `${currentDef.name} (Copy)`,
      });

      if (res.success && res.data) {
        await loadData();
        setStatusMessage({
          type: "success",
          text: `Duplicated layout as '${res.data.definition.name}'.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to duplicate layout." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveLayout = async () => {
    if (!currentDef) return;
    if (!confirm(`Are you sure you want to archive layout '${currentDef.name}'?`)) return;

    setIsLoading(true);
    try {
      const res = await archiveLayoutAction({
        theatreId,
        layoutDefinitionId: currentDef.id,
      });

      if (res.success && res.data) {
        await loadData();
        setStatusMessage({
          type: "success",
          text: `Archived layout '${res.data.name}'.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to archive layout." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (targetVersion: LayoutVersion) => {
    if (!currentDef) return;
    if (!confirm(`Create new draft derived from v${targetVersion.versionNumber}?`)) return;

    setIsLoading(true);
    try {
      const res = await restoreLayoutAction({
        theatreId,
        layoutDefinitionId: currentDef.id,
        versionId: targetVersion.id,
      });

      if (res.success && res.data) {
        await loadDefinitionDetails(currentDef.id);
        setCurrentVersion(res.data);
        setStatusMessage({
          type: "success",
          text: `Rollback / Restore: Created Draft v${res.data.versionNumber} from v${targetVersion.versionNumber}.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to restore version." });
    } finally {
      setIsLoading(false);
    }
  };

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
      // Phase 4 – Part 10: Validation Engine Preflight Audit Gate
      const preValidation = await validateBeforePublish();
      if (!preValidation.canPublish) {
        setIsSaving(false);
        setStatusMessage({
          type: "error",
          text: `Publication blocked by Validation Engine: ${preValidation.error || "Resolve critical errors before publishing."}`,
        });
        setActiveTab("validation");
        return;
      }

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

  // Version Comparison Diff State
  const compareTargetVersion = useMemo(() => {
    if (!compareTargetVersionId) return null;
    return allVersions.find((v) => v.id === compareTargetVersionId) || null;
  }, [compareTargetVersionId, allVersions]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. TOP HEADER BAR: IMMUTABLE DEFINITION LAYER & STATUS */}
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
            onClick={() => setShowCreateModal(true)}
            className="border-slate-700 text-slate-300 hover:text-white"
            title="Create New Layout Definition"
          >
            <Plus className="w-4 h-4 mr-1.5 text-cyan-400" />
            New Layout
          </Button>

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
        {/* Left: Viewport, Zoom & Undo/Redo */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo Placeholders */}
          <Button
            variant="ghost"
            size="sm"
            disabled={undoStack.length === 0}
            onClick={handleUndo}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={redoStack.length === 0}
            onClick={handleRedo}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white disabled:opacity-40"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

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
            title="Reset to Default"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>

          <div className="h-4 w-px bg-slate-800 mx-1.5" />

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
            {preferences.gridVisible ? "On" : "Off"}
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

        {/* Center: Alignment & Transformation Tools */}
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

          <div className="h-3 w-px bg-slate-800 mx-1" />

          {/* Equal Spacing Placeholder */}
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length < 3 || currentVersion?.status !== "DRAFT"}
            onClick={() => handleAlignSelectedSeats("DISTRIBUTE_HORIZONTALLY")}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Equal Spacing (Distribute Horizontally)"
          >
            <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
          </Button>

          {/* Rotation Tool */}
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedSeatIds.length === 0 || currentVersion?.status !== "DRAFT"}
            onClick={handleRotateSelectedSeats}
            className="h-6 w-6 p-0 text-slate-300 hover:text-white"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
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
            backgroundColor:
              activeTab === "preview"
                ? previewThemeName === "LIGHT"
                  ? "#F8FAFC"
                  : previewThemeName === "HIGH_CONTRAST"
                  ? "#000000"
                  : previewThemeName === "OLED"
                  ? "#020617"
                  : "#0B0F19"
                : preferences.backgroundColor || "#0B0F19",
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
            {/* Interactive Structural Objects Layer (Phase 4 – Part 7) */}
            {structuralObjects.length > 0 ? (
              structuralObjects.map((obj) => {
                if (obj.visibility !== "VISIBLE") return null;

                // Mode-specific structural filtering in Preview mode
                if (
                  activeTab === "preview" &&
                  (previewMode === "CUSTOMER" || previewMode === "BOOKING_SIMULATION") &&
                  obj.objectType !== "SCREEN" &&
                  obj.objectType !== "EMERGENCY_EXIT" &&
                  obj.objectType !== "ENTRANCE" &&
                  obj.objectType !== "EXIT" &&
                  obj.objectType !== "ACCESSIBLE_PATH"
                ) {
                  return null;
                }

                const isSelected = selectedStructuralObjectId === obj.id;
                return (
                  <div
                    key={obj.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStructuralObjectId(obj.id);
                      setActiveTab("structures");
                    }}
                    style={{
                      left: `${obj.position.x}px`,
                      top: `${obj.position.y}px`,
                      width: `${obj.width}px`,
                      height: `${obj.height}px`,
                      transform: `rotate(${obj.rotation}deg)`,
                      zIndex: obj.zIndex,
                      backgroundColor: obj.color,
                    }}
                    className={`absolute rounded flex items-center justify-center cursor-pointer transition select-none ${
                      isSelected
                        ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-cyan-500/50"
                        : "opacity-90 hover:opacity-100"
                    } ${
                      obj.objectType === "SCREEN"
                        ? "shadow-md shadow-sky-500/40 text-sky-100 font-bold border-b-2 border-cyan-300"
                        : ""
                    } ${
                      obj.objectType === "EMERGENCY_EXIT"
                        ? "border border-emerald-400 text-emerald-100 font-bold"
                        : ""
                    } ${
                      obj.objectType === "ACCESSIBLE_PATH"
                        ? "border-2 border-dashed border-indigo-400 bg-indigo-950/60"
                        : ""
                    }`}
                    title={`${obj.displayName} (${obj.objectType})`}
                  >
                    <span className="text-[10px] tracking-wider font-semibold uppercase truncate px-1 text-white drop-shadow">
                      {obj.objectType === "SCREEN"
                        ? `🎥 ${obj.displayName}`
                        : obj.objectType === "EMERGENCY_EXIT"
                        ? `🚪 ${obj.displayName}`
                        : obj.objectType === "ACCESSIBLE_PATH"
                        ? `♿ ${obj.displayName}`
                        : obj.displayName}
                    </span>
                  </div>
                );
              })
            ) : (
              /* Fallback Cinema Screen Banner */
              <div className="w-[850px] mx-auto mt-6 mb-12">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 via-sky-300 to-cyan-500 shadow-lg shadow-cyan-500/30" />
                <div className="text-center mt-2 text-xs font-bold tracking-[0.3em] uppercase text-slate-400">
                  CURVED CINEMA SCREEN / DISPLAY AREA
                </div>
              </div>
            )}

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

                // Check preview mode decoration
                const isPreview = activeTab === "preview";
                const isSimMode = isPreview && previewMode === "BOOKING_SIMULATION";
                const isSimSelected = isSimMode && simulationState.selectedSeatIds.includes(seat.id);
                const isWheelchair =
                  seat.seatType === "Wheelchair" ||
                  (seat.seatType as any) === "WHEELCHAIR" ||
                  (seat as any).accessibility?.isWheelchairAccessible ||
                  (seat as any).accessibility?.accessibilityType === "WHEELCHAIR";
                const isCompanion =
                  (seat as any).accessibility?.hasCompanionSeat ||
                  (seat as any).accessibility?.accessibilityType === "COMPANION";
                const isDeEmphasized = isPreview && previewMode === "ACCESSIBILITY" && !isWheelchair && !isCompanion;

                let seatBg = "bg-slate-900";
                let seatBorderColor = color;
                let badge = "";

                if (isPreview) {
                  if (previewMode === "ACCESSIBILITY") {
                    if (isWheelchair) {
                      seatBorderColor = "#06B6D4";
                      seatBg = "bg-cyan-950 text-cyan-200";
                      badge = "♿";
                    } else if (isCompanion) {
                      seatBorderColor = "#F59E0B";
                      seatBg = "bg-amber-950 text-amber-200";
                      badge = "⭐";
                    }
                  } else if (isSimMode && isSimSelected) {
                    seatBorderColor = "#10B981";
                    seatBg = "bg-emerald-950 text-emerald-200";
                  }
                }

                return (
                  <div
                    key={seat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSimMode) {
                        const targetTemplate = previewBundle?.seats.find((s) => s.id === seat.id) || {
                          id: seat.id,
                          theatreId,
                          layoutVersionId: currentVersion.id,
                          sectionId: seat.sectionId,
                          rowId: `row-${seat.row}`,
                          seatNumber: seat.seatNumber,
                          columnNumber: seat.column,
                          categoryCode: seat.seatType?.toUpperCase() || "STANDARD",
                          categoryName: seat.seatType || "Standard",
                          categoryColor: color,
                          coordinates: {
                            id: `coord-${seat.id}`,
                            seatTemplateId: seat.id,
                            x: seat.coordinates.x,
                            y: seat.coordinates.y,
                            rotation: 0,
                            width: 36,
                            height: 36,
                            spacing: 10,
                          },
                          metadata: {
                            id: `meta-${seat.id}`,
                            seatTemplateId: seat.id,
                            seatName: seat.seatNumber,
                            displayName: `Seat ${seat.seatNumber}`,
                            seatCode: seat.seatNumber,
                            rowId: `row-${seat.row}`,
                            rowName: seat.row,
                            sectionId: seat.sectionId,
                            sectionName: section?.name || "Standard",
                            categoryCode: seat.seatType?.toUpperCase() || "STANDARD",
                            status: "ACTIVE",
                          },
                          accessibility: {
                            id: `acc-${seat.id}`,
                            seatTemplateId: seat.id,
                            accessibilityType: isWheelchair ? "WHEELCHAIR" : isCompanion ? "COMPANION" : "STANDARD",
                            isWheelchairAccessible: isWheelchair,
                            hasCompanionSeat: isCompanion,
                            hasAccessibleRoute: true,
                          },
                          status: "ACTIVE" as const,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        toggleSeatSimulation(targetTemplate as any);
                      } else {
                        handleToggleSeat(seat.id, e.shiftKey || e.ctrlKey || e.metaKey);
                      }
                    }}
                    style={{
                      left: `${seat.coordinates.x}px`,
                      top: `${seat.coordinates.y}px`,
                      borderColor: isSimSelected ? "#10B981" : isSelected ? "#38BDF8" : seatBorderColor,
                    }}
                    className={`absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer transition-transform duration-100 ${
                      isSimSelected
                        ? "ring-2 ring-emerald-400 scale-125 z-20 shadow-lg shadow-emerald-500/50 bg-emerald-950 text-emerald-200"
                        : isSelected
                        ? "ring-2 ring-cyan-400 scale-125 z-20 shadow-lg shadow-cyan-500/50 bg-cyan-950"
                        : isDeEmphasized
                        ? "opacity-25 z-0 bg-slate-950/80 border border-slate-800"
                        : `hover:scale-110 z-10 border ${seatBg}`
                    }`}
                  >
                    {badge ? (
                      <span className="text-xs">{badge}</span>
                    ) : previewShowLabels || !isPreview ? (
                      <span style={{ color: isSimSelected ? "#34D399" : color }}>{seat.seatNumber}</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Canvas HUD Status Indicator */}
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
                {activeTab === "preview"
                  ? `Preview (${previewMode})`
                  : activeTab === "validation"
                  ? "Validation Audit"
                  : currentVersion?.status === "DRAFT"
                  ? "Interactive Draft"
                  : "Immutable Live"}
              </span>
            </div>
          </div>

          {/* Mini-Map Indicator Placeholder (Part 2) */}
          {preferences.showMiniMap && (
            <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-800 rounded-lg p-2 shadow-2xl backdrop-blur">
              <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>AUDITORIUM MINI-MAP</span>
                <span className="text-[9px] text-cyan-400">{Math.round(transform.zoom * 100)}%</span>
              </div>
              <div
                className="relative w-44 h-32 bg-slate-950 border border-slate-800 rounded overflow-hidden"
              >
                {/* Mini screen line */}
                <div className="absolute top-2 left-6 right-6 h-1 bg-cyan-400/80 rounded-full" />
                {/* Mini dots for seats */}
                {currentVersion?.seats.slice(0, 80).map((s) => (
                  <div
                    key={s.id}
                    className="absolute w-1 h-1 rounded-full bg-slate-500"
                    style={{
                      left: `${(s.coordinates.x / preferences.canvasWidth) * 100}%`,
                      top: `${(s.coordinates.y / preferences.canvasHeight) * 100}%`,
                    }}
                  />
                ))}
                {/* Viewport frame indicator */}
                <div
                  className="absolute border border-cyan-400/70 bg-cyan-500/10 rounded"
                  style={{
                    left: `${Math.max(0, Math.min(80, (-transform.panX / preferences.canvasWidth) * 100))}%`,
                    top: `${Math.max(0, Math.min(80, (-transform.panY / preferences.canvasHeight) * 100))}%`,
                    width: `${Math.max(20, Math.min(100, 100 / transform.zoom / 2.5))}%`,
                    height: `${Math.max(20, Math.min(100, 100 / transform.zoom / 2.5))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* 4. RIGHT SIDEBAR: TABS FOR LAYOUT, SECTIONS & CANVAS SETTINGS */}
        {/* -------------------------------------------------------------------- */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-20">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("layout")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "layout"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3 inline mr-1" /> Layout
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "sections"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Armchair className="w-3 h-3 inline mr-1" /> Sections
            </button>
            <button
              onClick={() => setActiveTab("seats")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "seats"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> Seats
            </button>
            <button
              onClick={() => setActiveTab("structures")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "structures"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3 h-3 inline mr-1" /> Objects
            </button>
            <button
              onClick={() => setActiveTab("geometry")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "geometry"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-3 h-3 inline mr-1" /> Geometry
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "preview"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" /> Preview
            </button>
            <button
              onClick={() => setActiveTab("validation")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "validation"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-3 h-3 inline mr-1" /> Validation
              {validationReport && validationReport.summary.errorsCount > 0 && (
                <span className="ml-1 px-1 py-0.2 text-[9px] bg-rose-500 text-white rounded-full font-mono">
                  {validationReport.summary.errorsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("canvas")}
              className={`px-2.5 py-2 text-[11px] font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === "canvas"
                  ? "border-cyan-500 text-cyan-400 bg-slate-800/50"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="w-3 h-3 inline mr-1" /> Canvas
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: LAYOUT & VERSION MANAGEMENT (Part 1) */}
            {activeTab === "layout" && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Layout Definition</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleDuplicateLayout}
                        className="text-[11px] text-slate-400 hover:text-cyan-400 p-0.5"
                        title="Duplicate Layout"
                      >
                        <Copy className="w-3 h-3 inline mr-1" /> Duplicate
                      </button>
                      <button
                        onClick={handleArchiveLayout}
                        className="text-[11px] text-slate-400 hover:text-rose-400 p-0.5 ml-1"
                        title="Archive Layout"
                      >
                        <Archive className="w-3 h-3 inline mr-1" /> Archive
                      </button>
                    </div>
                  </div>
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

                {/* Compare Versions Trigger */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (allVersions.length >= 2) {
                        const otherVer = allVersions.find((v) => v.id !== currentVersion?.id);
                        if (otherVer) setCompareTargetVersionId(otherVer.id);
                      }
                      setShowCompareModal(true);
                    }}
                    className="w-full border-slate-800 text-slate-300 hover:text-white text-xs"
                  >
                    <GitCompare className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                    Compare Versions Diff
                  </Button>
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
                        className={`p-2.5 rounded-lg border text-xs transition ${
                          currentVersion?.id === v.id
                            ? "bg-slate-800/90 border-cyan-500/80 shadow"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div
                          className="flex items-center justify-between mb-1 cursor-pointer"
                          onClick={() => setCurrentVersion(v)}
                        >
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
                        <div className="text-[10px] text-slate-500 mt-1 flex justify-between items-center">
                          <span>{v.seats.length} seats</span>
                          {v.status !== "DRAFT" && (
                            <button
                              onClick={() => handleRestoreVersion(v)}
                              className="text-cyan-400 hover:underline flex items-center gap-1"
                              title="Branch new draft from this version"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Rollback
                            </button>
                          )}
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

            {/* TAB 2: SECTIONS & ROWS DESIGNER STUDIO (Parts 3 & 4) */}
            {activeTab === "sections" && (
              <div className="space-y-4">
                {/* Header & Add Section Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Armchair className="w-4 h-4 text-cyan-400" />
                      Section Designer
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Hierarchy: Section ──► Row ──► Seats
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingSection((prev) => !prev)}
                    className="h-7 text-xs border-cyan-800 text-cyan-300 hover:bg-cyan-950/60"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {isAddingSection ? "Cancel" : "Add Section"}
                  </Button>
                </div>

                {/* Add Section Form */}
                {isAddingSection && (
                  <Card className="p-3 bg-slate-900 border-cyan-800/60 text-xs space-y-2.5">
                    <div className="text-xs font-semibold text-cyan-300">New Section Specification</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Section Name</label>
                        <Input
                          placeholder="e.g. VIP Prime"
                          value={newSectionData.name}
                          onChange={(e) =>
                            setNewSectionData((prev) => ({
                              ...prev,
                              name: e.target.value,
                              displayName: `${e.target.value} Suite`,
                              internalCode: `SEC-${e.target.value.toUpperCase().replace(/\s+/g, "-")}`,
                            }))
                          }
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Internal Code</label>
                        <Input
                          placeholder="e.g. SEC-VIP-A"
                          value={newSectionData.internalCode}
                          onChange={(e) => setNewSectionData((prev) => ({ ...prev, internalCode: e.target.value }))}
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Seat Category</label>
                        <select
                          value={newSectionData.seatCategory}
                          onChange={(e) =>
                            setNewSectionData((prev) => ({ ...prev, seatCategory: e.target.value as any }))
                          }
                          className="w-full h-7 bg-slate-950 border border-slate-700 rounded px-2 text-xs text-white"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Recliner">Recliner</option>
                          <option value="VIP">VIP</option>
                          <option value="Couple">Couple</option>
                          <option value="Wheelchair">Wheelchair</option>
                          <option value="Sofa">Sofa</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Geometry Shape</label>
                        <select
                          value={newSectionData.shapeType}
                          onChange={(e) =>
                            setNewSectionData((prev) => ({ ...prev, shapeType: e.target.value as any }))
                          }
                          className="w-full h-7 bg-slate-950 border border-slate-700 rounded px-2 text-xs text-white"
                        >
                          <option value="RECTANGLE">Straight Rectangle</option>
                          <option value="CURVED">Curved Arc</option>
                          <option value="ARC">Radial Arc</option>
                          <option value="POLYGON">Polygon</option>
                          <option value="IRREGULAR">Irregular Shape</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Color Palette</label>
                      <div className="flex items-center gap-1.5">
                        {["#EF4444", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#38BDF8"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewSectionData((prev) => ({ ...prev, color: c }))}
                            className={`w-5 h-5 rounded-full border transition-transform ${
                              newSectionData.color === c ? "scale-125 ring-2 ring-white border-white" : "border-transparent"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <Input
                          value={newSectionData.color}
                          onChange={(e) => setNewSectionData((prev) => ({ ...prev, color: e.target.value }))}
                          className="w-20 h-6 text-[10px] bg-slate-950 border-slate-700 text-white ml-2 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingSection(false)}
                        className="h-6 text-[11px] text-slate-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCreateSection}
                        className="h-6 text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white"
                      >
                        Save Section
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Sections List */}
                <div className="space-y-2.5">
                  {detailedSections.length === 0 && currentVersion?.sections && currentVersion.sections.length > 0 && (
                    <div className="text-[11px] text-slate-400 italic p-2 bg-slate-950/60 rounded">
                      Displaying initial hall sections from draft version. Click &quot;Add Section&quot; to define custom structural layers.
                    </div>
                  )}

                  {detailedSections.map((sec, secIdx) => {
                    const isExpanded = expandedSectionId === sec.id;
                    const totalRowSeats = sec.rows.reduce((sum, r) => sum + r.seatCount, 0);

                    return (
                      <div
                        key={sec.id}
                        className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden text-xs transition-colors hover:border-slate-700"
                      >
                        {/* Section Header Row */}
                        <div className="p-3 flex items-center justify-between gap-2">
                          <div
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full shadow-sm flex-shrink-0"
                              style={{ backgroundColor: sec.color }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                <span>{sec.name}</span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-700 text-slate-400">
                                  {sec.geometry.shapeType}
                                </Badge>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{sec.internalCode}</span>
                                <span>•</span>
                                <span className="text-cyan-400">{sec.rows.length} rows</span>
                                <span>•</span>
                                <span>{totalRowSeats} seats</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Reorder Buttons */}
                            <button
                              title="Move Section Up"
                              disabled={secIdx === 0}
                              onClick={() => handleReorderSection(sec.id, "UP")}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              title="Move Section Down"
                              disabled={secIdx === detailedSections.length - 1}
                              onClick={() => handleReorderSection(sec.id, "DOWN")}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>

                            {/* Duplicate Button */}
                            <button
                              title="Duplicate Section & Rows"
                              onClick={() => handleDuplicateSection(sec.id)}
                              className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                            >
                              <Copy className="w-3 h-3" />
                            </button>

                            {/* Delete Button */}
                            <button
                              title="Delete Section"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {/* Toggle Expand/Collapse */}
                            <button
                              onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Section Body: Row Designer (Part 4) */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-900 bg-slate-900/40 space-y-3">
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                <MoveVertical className="w-3.5 h-3.5 text-cyan-400" />
                                Rows in {sec.name}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setIsAddingRowForSectionId(
                                    isAddingRowForSectionId === sec.id ? null : sec.id
                                  )
                                }
                                className="h-6 text-[10px] text-cyan-300 hover:bg-cyan-950"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Row
                              </Button>
                            </div>

                            {/* Add Row Form */}
                            {isAddingRowForSectionId === sec.id && (
                              <Card className="p-2.5 bg-slate-950 border border-slate-700 rounded text-xs space-y-2">
                                <div className="text-[11px] font-semibold text-cyan-300">
                                  Configure Row Parameters
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Row Name</label>
                                    <Input
                                      placeholder="e.g. A"
                                      value={newRowData.rowName}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({ ...prev, rowName: e.target.value }))
                                      }
                                      className="h-6 text-xs bg-slate-900 border-slate-700 text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Seats Count</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={newRowData.seatCount}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({
                                          ...prev,
                                          seatCount: parseInt(e.target.value, 10) || 1,
                                        }))
                                      }
                                      className="h-6 text-xs bg-slate-900 border-slate-700 text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Spacing (px)</label>
                                    <Input
                                      type="number"
                                      min="20"
                                      max="100"
                                      value={newRowData.spacing}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({
                                          ...prev,
                                          spacing: parseInt(e.target.value, 10) || 35,
                                        }))
                                      }
                                      className="h-6 text-xs bg-slate-900 border-slate-700 text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Numbering</label>
                                    <select
                                      value={newRowData.numberingStrategy}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({
                                          ...prev,
                                          numberingStrategy: e.target.value as any,
                                        }))
                                      }
                                      className="w-full h-6 bg-slate-900 border border-slate-700 rounded px-1 text-[10px] text-white"
                                    >
                                      <option value="ALPHABETICAL">A, B, C...</option>
                                      <option value="NUMERIC">1, 2, 3...</option>
                                      <option value="ROMAN">I, II, III...</option>
                                      <option value="CUSTOM">Custom AA..</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Row Geometry</label>
                                    <select
                                      value={newRowData.geometryType}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({
                                          ...prev,
                                          geometryType: e.target.value as any,
                                        }))
                                      }
                                      className="w-full h-6 bg-slate-900 border border-slate-700 rounded px-1 text-[10px] text-white"
                                    >
                                      <option value="STRAIGHT">Straight</option>
                                      <option value="CURVED">Curved</option>
                                      <option value="ARC">Arc</option>
                                      <option value="ANGLED">Angled</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[9px] text-slate-400 block">Accessibility</label>
                                    <select
                                      value={newRowData.accessibility}
                                      onChange={(e) =>
                                        setNewRowData((prev) => ({
                                          ...prev,
                                          accessibility: e.target.value as any,
                                        }))
                                      }
                                      className="w-full h-6 bg-slate-900 border border-slate-700 rounded px-1 text-[10px] text-white"
                                    >
                                      <option value="STANDARD">Standard</option>
                                      <option value="WHEELCHAIR">Wheelchair ♿</option>
                                      <option value="COMPANION">Companion</option>
                                      <option value="RESERVED">Reserved</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-1.5 pt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAddingRowForSectionId(null)}
                                    className="h-5 text-[10px] text-slate-400"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleCreateRow(sec.id)}
                                    className="h-5 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white"
                                  >
                                    Save Row
                                  </Button>
                                </div>
                              </Card>
                            )}

                            {/* Rows List */}
                            <div className="space-y-1.5">
                              {sec.rows.length === 0 ? (
                                <div className="text-[10px] text-slate-500 italic py-1">
                                  No rows added yet. Click &quot;Add Row&quot; above.
                                </div>
                              ) : (
                                sec.rows.map((row, rowIdx) => (
                                  <div
                                    key={row.id}
                                    className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-[11px]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white w-6">{row.rowName}</span>
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] px-1 py-0 border-slate-700 text-slate-400"
                                      >
                                        {row.seatCount} seats
                                      </Badge>
                                      <span className="text-[9px] text-slate-500">
                                        {row.geometry.geometryType.toLowerCase()} • {row.spacing}px
                                      </span>
                                      {row.accessibility === "WHEELCHAIR" && (
                                        <Badge className="bg-sky-950 text-sky-400 border-sky-800 text-[9px] px-1 py-0">
                                          ♿ Wheelchair
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        title="Move Row Up"
                                        disabled={rowIdx === 0}
                                        onClick={() => handleReorderRow(sec.id, row.id, "UP")}
                                        className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        title="Move Row Down"
                                        disabled={rowIdx === sec.rows.length - 1}
                                        onClick={() => handleReorderRow(sec.id, row.id, "DOWN")}
                                        className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </button>
                                      <button
                                        title="Duplicate Row"
                                        onClick={() => handleDuplicateRow(sec.id, row.id)}
                                        className="p-0.5 text-slate-400 hover:text-cyan-400"
                                      >
                                        <Copy className="w-3 h-3" />
                                      </button>
                                      <button
                                        title="Delete Row"
                                        onClick={() => handleDeleteRow(sec.id, row.id)}
                                        className="p-0.5 text-slate-400 hover:text-rose-400"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: AUTOMATIC SEAT GENERATOR & CATEGORY REGISTRY (Parts 5 & 6) */}
            {activeTab === "seats" && (
              <div className="space-y-4">
                {/* 1. Header with Decoupled Pricing Banner */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Seat Generator & Registry
                    </h3>
                    <Badge variant="outline" className="text-[9px] border-amber-800 text-amber-300">
                      Parts 5 & 6
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Generates immutable Seat Templates from row geometries. Pricing is decoupled and resolved strictly per Show.
                  </p>
                </div>

                {/* 2. Target Row Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-300 block">
                    Target Row for Seat Generation
                  </label>
                  <select
                    value={selectedSeatRowId}
                    onChange={(e) => setSelectedSeatRowId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="">-- Choose Row --</option>
                    {detailedSections.map((sec) => (
                      <optgroup key={sec.id} label={`${sec.name} (${sec.seatCategory})`}>
                        {sec.rows.map((r) => (
                          <option key={r.id} value={r.id}>
                            Row {r.rowName} ({r.seatCount} seats)
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* 3. Seat Generation Configuration */}
                <Card className="p-3 bg-slate-900 border-amber-800/40 text-xs space-y-3">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> Generation Parameters
                  </div>

                  {/* Numbering Style & Category */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Numbering Style</label>
                      <select
                        value={seatGenNumberingStyle}
                        onChange={(e) => setSeatGenNumberingStyle(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="ALPHABETIC">Alphabetic (A, B, C)</option>
                        <option value="NUMERIC">Numeric (1, 2, 3)</option>
                        <option value="ALPHANUMERIC">Alphanumeric (A1, A2)</option>
                        <option value="ROMAN">Roman (I, II, III)</option>
                        <option value="CUSTOM">Custom Convention</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Seat Category</label>
                      <select
                        value={seatGenCategoryCode}
                        onChange={(e) => setSeatGenCategoryCode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        {seatCategories.map((cat) => (
                          <option key={cat.id} value={cat.code}>
                            {cat.displayName} ({cat.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Prefix</label>
                      <Input
                        placeholder="e.g. VIP-"
                        value={seatGenPrefix}
                        onChange={(e) => setSeatGenPrefix(e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Suffix</label>
                      <Input
                        placeholder="e.g. -A"
                        value={seatGenSuffix}
                        onChange={(e) => setSeatGenSuffix(e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Start Number</label>
                      <Input
                        type="number"
                        min="1"
                        value={seatGenStartNum}
                        onChange={(e) => setSeatGenStartNum(parseInt(e.target.value, 10) || 1)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Skip Numbers & Reverse */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Skip Numbers</label>
                      <Input
                        placeholder="e.g. 13, 14"
                        value={seatGenSkipNums}
                        onChange={(e) => setSeatGenSkipNums(e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={seatGenIsReversed}
                          onChange={(e) => setSeatGenIsReversed(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                        />
                        <span>Reverse Numbering</span>
                      </label>
                    </div>
                  </div>

                  {/* Geometry & Curvature */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Row Topology</label>
                      <select
                        value={seatGenGeometry}
                        onChange={(e) => setSeatGenGeometry(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="STRAIGHT">Straight</option>
                        <option value="CURVED">Curved Arc</option>
                        <option value="ARC">Radial Arc</option>
                        <option value="ANGLED">Angled Incline</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Spacing (px)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={seatGenSpacing}
                        onChange={(e) => setSeatGenSpacing(parseInt(e.target.value, 10) || 10)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  {(seatGenGeometry === "CURVED" || seatGenGeometry === "ARC") && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Curvature Radius (px)</label>
                        <Input
                          type="number"
                          min="200"
                          max="2000"
                          step="50"
                          value={seatGenRadius}
                          onChange={(e) => setSeatGenRadius(parseInt(e.target.value, 10) || 600)}
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Arc Angle (deg)</label>
                        <Input
                          type="number"
                          min="5"
                          max="120"
                          value={seatGenArcAngle}
                          onChange={(e) => setSeatGenArcAngle(parseInt(e.target.value, 10) || 30)}
                          className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Accessibility Indices */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">♿ Wheelchair Indices</label>
                      <Input
                        placeholder="e.g. 1, 2"
                        value={seatGenWheelchairIndices}
                        onChange={(e) => setSeatGenWheelchairIndices(e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">🤝 Companion Indices</label>
                      <Input
                        placeholder="e.g. 3"
                        value={seatGenCompanionIndices}
                        onChange={(e) => setSeatGenCompanionIndices(e.target.value)}
                        className="h-7 text-xs bg-slate-950 border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateSeatsForRow(false)}
                      disabled={!selectedSeatRowId || isLoading}
                      className="flex-1 h-8 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Auto Generate Seats
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateSeatsForRow(true)}
                      disabled={!selectedSeatRowId || isLoading}
                      className="h-8 border-amber-800/80 text-amber-300 hover:bg-amber-950/40 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </Card>

                {/* 4. Category Registry Section (Part 6) */}
                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        Seat Category Registry
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Independent dynamic categories for {theatres.find((t) => t.id === theatreId)?.name}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingCategory((prev) => !prev)}
                      className="h-6 text-[10px] border-cyan-800 text-cyan-300 hover:bg-cyan-950/60"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {isAddingCategory ? "Cancel" : "Add Category"}
                    </Button>
                  </div>

                  {/* Add Category Form */}
                  {isAddingCategory && (
                    <Card className="p-2.5 bg-slate-950 border-cyan-800/60 text-xs space-y-2">
                      <div className="text-[11px] font-semibold text-cyan-300">New Category Specification</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Code</label>
                          <Input
                            placeholder="e.g. LUXURY"
                            value={newCategoryData.code}
                            onChange={(e) => setNewCategoryData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            className="h-6 text-[11px] bg-slate-900 border-slate-700 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Name</label>
                          <Input
                            placeholder="e.g. Luxury Suite"
                            value={newCategoryData.name}
                            onChange={(e) =>
                              setNewCategoryData((prev) => ({
                                ...prev,
                                name: e.target.value,
                                displayName: e.target.value,
                              }))
                            }
                            className="h-6 text-[11px] bg-slate-900 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Color</label>
                          <input
                            type="color"
                            value={newCategoryData.color}
                            onChange={(e) => setNewCategoryData((prev) => ({ ...prev, color: e.target.value }))}
                            className="w-full h-6 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">Priority</label>
                          <Input
                            type="number"
                            min="1"
                            value={newCategoryData.priority}
                            onChange={(e) => setNewCategoryData((prev) => ({ ...prev, priority: parseInt(e.target.value, 10) || 1 }))}
                            className="h-6 text-[11px] bg-slate-900 border-slate-700 text-white"
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <label className="flex items-center gap-1 text-[10px] text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newCategoryData.isPremium}
                              onChange={(e) => setNewCategoryData((prev) => ({ ...prev, isPremium: e.target.checked }))}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                            />
                            <span>Premium</span>
                          </label>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleCreateCategory}
                        className="w-full h-6 text-[11px] bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                      >
                        Save Category to Registry
                      </Button>
                    </Card>
                  )}

                  {/* Categories List */}
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {seatCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`p-2 rounded border flex items-center justify-between text-xs transition ${
                          cat.status === "ARCHIVED"
                            ? "bg-slate-950/40 border-slate-800 opacity-60"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              {cat.displayName}
                              {cat.isPremium && (
                                <Badge variant="outline" className="text-[8px] py-0 px-1 border-amber-800 text-amber-300">
                                  PREMIUM
                                </Badge>
                              )}
                              {cat.accessibility === "WHEELCHAIR" && (
                                <Badge variant="outline" className="text-[8px] py-0 px-1 border-purple-800 text-purple-300">
                                  ♿ ADA
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Code: {cat.code} • Priority: {cat.priority}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicateCategory(cat.id)}
                            title="Duplicate Category"
                            className="p-1 text-slate-400 hover:text-cyan-300 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {cat.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleArchiveCategory(cat.id)}
                              title="Archive Category"
                              className="p-1 text-slate-400 hover:text-amber-400 transition"
                            >
                              <Archive className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestoreCategory(cat.id)}
                              title="Restore Category"
                              className="p-1 text-slate-400 hover:text-emerald-400 transition"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: STRUCTURAL OBJECTS (Phase 4 – Part 7) */}
            {activeTab === "structures" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Structural Objects
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Physical auditorium infrastructure & obstacles
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-cyan-400 font-mono">
                    {structuralObjects.length} Objects
                  </Badge>
                </div>

                {/* Regulatory Summary Bar */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded border border-slate-800 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {hasScreen ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className={hasScreen ? "text-slate-300" : "text-rose-400 font-bold"}>
                      {hasScreen ? "Screen Active" : "Screen Missing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasEmergencyExit ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className={hasEmergencyExit ? "text-slate-300" : "text-amber-400"}>
                      {emergencyExits.length} Emergency Exit(s)
                    </span>
                  </div>
                </div>

                {/* Add Structural Object Button */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setIsAddingStructuralObject(!isAddingStructuralObject)}
                    disabled={currentVersion?.status !== "DRAFT"}
                    className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Object
                  </Button>
                </div>

                {/* Add Structural Object Form */}
                {isAddingStructuralObject && (
                  <Card className="p-3 bg-slate-950 border-cyan-800/60 space-y-2.5">
                    <div className="font-semibold text-xs text-cyan-300">New Structural Element</div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Object Type</label>
                      <select
                        value={newStructType}
                        onChange={(e) => {
                          const t = e.target.value as StructuralObjectType;
                          setNewStructType(t);
                          if (t === "SCREEN") {
                            setNewStructColor("#0284C7");
                            setNewStructWidth(800);
                            setNewStructHeight(30);
                            setNewStructIsObstacle(false);
                          } else if (t === "STAGE") {
                            setNewStructColor("#78350F");
                            setNewStructWidth(840);
                            setNewStructHeight(50);
                            setNewStructIsObstacle(true);
                          } else if (t === "EMERGENCY_EXIT") {
                            setNewStructColor("#16A34A");
                            setNewStructWidth(60);
                            setNewStructHeight(30);
                            setNewStructIsObstacle(false);
                          } else if (t === "ENTRANCE") {
                            setNewStructColor("#2563EB");
                            setNewStructWidth(100);
                            setNewStructHeight(35);
                            setNewStructIsObstacle(false);
                          } else if (t === "ACCESSIBLE_PATH") {
                            setNewStructColor("#6366F1");
                            setNewStructWidth(80);
                            setNewStructHeight(400);
                            setNewStructIsObstacle(false);
                          } else if (t === "PILLAR") {
                            setNewStructColor("#94A3B8");
                            setNewStructWidth(32);
                            setNewStructHeight(32);
                            setNewStructIsObstacle(true);
                          } else {
                            setNewStructColor("#64748B");
                            setNewStructWidth(120);
                            setNewStructHeight(30);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="SCREEN">Screen (Cinema Screen)</option>
                        <option value="STAGE">Stage (Presentation Platform)</option>
                        <option value="EMERGENCY_EXIT">Emergency Exit</option>
                        <option value="ENTRANCE">Entrance / Foyer Door</option>
                        <option value="EXIT">General Exit</option>
                        <option value="ACCESSIBLE_PATH">Accessible Path (ADA Ramp)</option>
                        <option value="WALL">Architectural Wall</option>
                        <option value="DIVIDER">Partition / Divider</option>
                        <option value="BALCONY">Balcony / Mezzanine</option>
                        <option value="STAIRS">Stairway / Steps</option>
                        <option value="AISLE">Walkway Aisle</option>
                        <option value="PILLAR">Pillar (Collision Obstacle)</option>
                        <option value="CONTROL_ROOM">Control Room / AV Booth</option>
                        <option value="CUSTOM">Custom Infrastructure</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Name</label>
                        <Input
                          placeholder="e.g. Laser Screen"
                          value={newStructName}
                          onChange={(e) => setNewStructName(e.target.value)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Code</label>
                        <Input
                          placeholder="STR-SCR-01"
                          value={newStructCode}
                          onChange={(e) => setNewStructCode(e.target.value)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Width (px)</label>
                        <Input
                          type="number"
                          value={newStructWidth}
                          onChange={(e) => setNewStructWidth(parseInt(e.target.value, 10) || 100)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Height (px)</label>
                        <Input
                          type="number"
                          value={newStructHeight}
                          onChange={(e) => setNewStructHeight(parseInt(e.target.value, 10) || 40)}
                          className="h-7 text-xs bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Color</label>
                        <input
                          type="color"
                          value={newStructColor}
                          onChange={(e) => setNewStructColor(e.target.value)}
                          className="w-full h-7 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStructIsObstacle}
                          onChange={(e) => setNewStructIsObstacle(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                        />
                        <span>Collision Obstacle (Forbids seats)</span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={handleCreateStructuralObject}
                        className="flex-1 h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                      >
                        Create Object
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddingStructuralObject(false)}
                        className="h-7 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Selected Object Editor */}
                {selectedStructuralObject && (
                  <Card className="p-3 bg-slate-950 border-cyan-500/50 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="font-bold text-xs text-cyan-300 truncate">
                        {selectedStructuralObject.displayName}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleStructuralLock(selectedStructuralObject.id)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                          title={selectedStructuralObject.isLocked ? "Unlock Object" : "Lock Object"}
                        >
                          {selectedStructuralObject.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleStructuralVisibility(selectedStructuralObject.id)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                          title="Toggle Visibility"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateStructuralObject(selectedStructuralObject.id)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                          title="Duplicate Object"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStructuralObject(selectedStructuralObject.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete Object"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-500">Type:</span>{" "}
                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-slate-700 text-slate-300">
                          {selectedStructuralObject.objectType}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-500">Code:</span>{" "}
                        <span className="font-mono text-cyan-400">{selectedStructuralObject.internalCode}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">Pos X</label>
                        <Input
                          type="number"
                          value={selectedStructuralObject.position.x}
                          disabled={selectedStructuralObject.isLocked}
                          onChange={(e) =>
                            updateStructuralObject(selectedStructuralObject.id, {
                              id: selectedStructuralObject.id,
                              theatreId,
                              position: {
                                ...selectedStructuralObject.position,
                                x: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="h-6 text-[11px] bg-slate-900 border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">Pos Y</label>
                        <Input
                          type="number"
                          value={selectedStructuralObject.position.y}
                          disabled={selectedStructuralObject.isLocked}
                          onChange={(e) =>
                            updateStructuralObject(selectedStructuralObject.id, {
                              id: selectedStructuralObject.id,
                              theatreId,
                              position: {
                                ...selectedStructuralObject.position,
                                y: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="h-6 text-[11px] bg-slate-900 border-slate-800 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">Width</label>
                        <Input
                          type="number"
                          value={selectedStructuralObject.width}
                          disabled={selectedStructuralObject.isLocked}
                          onChange={(e) =>
                            updateStructuralObject(selectedStructuralObject.id, {
                              id: selectedStructuralObject.id,
                              theatreId,
                              width: parseInt(e.target.value, 10) || 20,
                            })
                          }
                          className="h-6 text-[11px] bg-slate-900 border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">Height</label>
                        <Input
                          type="number"
                          value={selectedStructuralObject.height}
                          disabled={selectedStructuralObject.isLocked}
                          onChange={(e) =>
                            updateStructuralObject(selectedStructuralObject.id, {
                              id: selectedStructuralObject.id,
                              theatreId,
                              height: parseInt(e.target.value, 10) || 20,
                            })
                          }
                          className="h-6 text-[11px] bg-slate-900 border-slate-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">Rotation</label>
                        <Input
                          type="number"
                          value={selectedStructuralObject.rotation}
                          disabled={selectedStructuralObject.isLocked}
                          onChange={(e) =>
                            updateStructuralObject(selectedStructuralObject.id, {
                              id: selectedStructuralObject.id,
                              theatreId,
                              rotation: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="h-6 text-[11px] bg-slate-900 border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* List of Structural Objects */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {structuralObjects.map((obj) => (
                    <div
                      key={obj.id}
                      onClick={() => setSelectedStructuralObjectId(obj.id)}
                      className={`p-2 rounded border flex items-center justify-between text-xs cursor-pointer transition ${
                        selectedStructuralObjectId === obj.id
                          ? "bg-slate-800/80 border-cyan-500"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded shrink-0 border border-white/20"
                          style={{ backgroundColor: obj.color }}
                        />
                        <div>
                          <div className="font-medium text-slate-200 text-[11px]">
                            {obj.displayName}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            {obj.objectType} • ({obj.position.x}, {obj.position.y})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {obj.isLocked && <Lock className="w-3 h-3 text-amber-400" />}
                        {obj.metadata.isCollisionObstacle && (
                          <Badge variant="outline" className="text-[8px] py-0 px-1 border-rose-800 text-rose-300">
                            Obstacle
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: GEOMETRY & ADVANCED LAYOUT (Phase 4 – Part 8) */}
            {activeTab === "geometry" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" /> Geometry Engine
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Symmetry, curvature transforms & preflight validation
                    </p>
                  </div>
                </div>

                {/* Symmetry & Mirroring Tools */}
                <Card className="p-3 bg-slate-950 border-slate-800 space-y-2">
                  <div className="font-semibold text-xs text-slate-200">Layout Symmetry & Mirroring</div>
                  <p className="text-[10px] text-slate-400">
                    Reflect structural objects and design objects across auditorium axes.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMirror("HORIZONTAL")}
                      disabled={currentVersion?.status !== "DRAFT"}
                      className="h-7 text-xs border-slate-700 text-slate-200 hover:bg-slate-800 gap-1"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Mirror Horiz.
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMirror("VERTICAL")}
                      disabled={currentVersion?.status !== "DRAFT"}
                      className="h-7 text-xs border-slate-700 text-slate-200 hover:bg-slate-800 gap-1"
                    >
                      <FlipVertical className="w-3.5 h-3.5 text-cyan-400" /> Mirror Vert.
                    </Button>
                  </div>
                </Card>

                {/* Theatre Geometry Preferences */}
                <Card className="p-3 bg-slate-950 border-slate-800 space-y-2">
                  <div className="font-semibold text-xs text-slate-200">Theatre Geometry Policies</div>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Curved VIP Layouts</span>
                      <Badge variant="outline" className="text-[9px] border-emerald-800 text-emerald-400">
                        {geometrySettings?.allowCurvedVIP ? "Allowed" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Arc Seating Rows</span>
                      <Badge variant="outline" className="text-[9px] border-emerald-800 text-emerald-400">
                        {geometrySettings?.allowArcRows ? "Allowed" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Polygon Sections</span>
                      <Badge variant="outline" className="text-[9px] border-emerald-800 text-emerald-400">
                        {geometrySettings?.allowPolygonSections ? "Allowed" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Default Curvature Radius</span>
                      <span className="font-mono text-cyan-400">{geometrySettings?.defaultCurveRadius || 700}px</span>
                    </div>
                  </div>
                </Card>

                {/* Preflight Layout Validation Gate (Invariant 3) */}
                <Card className="p-3 bg-slate-950 border-cyan-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-xs text-cyan-300">Publication Preflight Gate</div>
                    <Button
                      size="sm"
                      onClick={runPreflightCheck}
                      disabled={isPreflightValidating || !currentVersion}
                      className="h-6 text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {isPreflightValidating ? "Auditing..." : "Audit Layout"}
                    </Button>
                  </div>

                  {preflightResult ? (
                    <div className="space-y-2 pt-1">
                      <div
                        className={`p-2 rounded text-xs font-semibold flex items-center gap-1.5 ${
                          preflightResult.canPublish
                            ? "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300"
                            : "bg-rose-950/80 border border-rose-500/60 text-rose-300"
                        }`}
                      >
                        {preflightResult.canPublish ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>READY TO PUBLISH (All Invariants Passed)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>PUBLICATION BLOCKED (Violations Detected)</span>
                          </>
                        )}
                      </div>

                      {/* Checklist */}
                      <div className="space-y-1 text-[10px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span>Screen Presence:</span>
                          <span className={preflightResult.checklist.hasScreen ? "text-emerald-400" : "text-rose-400"}>
                            {preflightResult.checklist.hasScreen ? "✓ Screen Present" : "✕ Screen Missing"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Emergency Exits:</span>
                          <span className={preflightResult.checklist.hasEmergencyExit ? "text-emerald-400" : "text-amber-400"}>
                            {preflightResult.checklist.hasEmergencyExit ? "✓ Exits Defined" : "⚠ No Exits"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Entrances / Foyer:</span>
                          <span className={preflightResult.checklist.hasEntrance ? "text-emerald-400" : "text-amber-400"}>
                            {preflightResult.checklist.hasEntrance ? "✓ Entrance Defined" : "⚠ Missing Entrance"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Accessible Route:</span>
                          <span className={preflightResult.checklist.hasAccessiblePath ? "text-emerald-400" : "text-amber-400"}>
                            {preflightResult.checklist.hasAccessiblePath ? "✓ Compliant" : "⚠ No Route Tagged"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Obstacle Collisions:</span>
                          <span className={preflightResult.checklist.hasNoStructuralCollisions ? "text-emerald-400" : "text-rose-400"}>
                            {preflightResult.checklist.hasNoStructuralCollisions ? "✓ Zero Collisions" : "✕ Collisions Detected"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Canvas Bounds:</span>
                          <span className={preflightResult.checklist.hasNoOutOfBounds ? "text-emerald-400" : "text-rose-400"}>
                            {preflightResult.checklist.hasNoOutOfBounds ? "✓ All In Bounds" : "✕ Out-of-bounds"}
                          </span>
                        </div>
                      </div>

                      {/* Blocking Errors */}
                      {preflightResult.blockingErrors.length > 0 && (
                        <div className="p-2 bg-rose-950/60 border border-rose-800 rounded text-[10px] text-rose-300 space-y-1">
                          <div className="font-bold text-rose-200">Critical Errors:</div>
                          {preflightResult.blockingErrors.map((err, i) => (
                            <div key={i}>• {err}</div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {preflightResult.complianceWarnings.length > 0 && (
                        <div className="p-2 bg-amber-950/40 border border-amber-800 rounded text-[10px] text-amber-300 space-y-1">
                          <div className="font-bold text-amber-200">Compliance Warnings:</div>
                          {preflightResult.complianceWarnings.map((warn, i) => (
                            <div key={i}>• {warn}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Audit checks screen presence, emergency egress paths, ADA accessibility, obstacle collisions, and geometry integrity before layout publication.
                    </p>
                  )}
                </Card>
              </div>
            )}

            {/* TAB 6: HALL PREVIEW STUDIO (Part 9) */}
            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview Studio
                    </h4>
                    <p className="text-[10px] text-slate-400">Production-accurate live rendering & simulation</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => refreshPreview()}
                    className="h-7 px-2 text-xs text-slate-400 hover:text-white"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Refresh
                  </Button>
                </div>

                {/* Preview Mode Selector */}
                <Card className="p-3 bg-slate-950/60 border-slate-800 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">Preview Mode</label>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: "CUSTOMER" as PreviewMode, label: "Customer Experience", desc: "Patron booking seat map" },
                      { id: "THEATRE" as PreviewMode, label: "Theatre Operations", desc: "Staff view with row labels & landmarks" },
                      { id: "ADMIN" as PreviewMode, label: "Admin & Diagnostics", desc: "Detailed metadata & seat statistics" },
                      { id: "ACCESSIBILITY" as PreviewMode, label: "Accessibility (ADA)", desc: "Highlight ramps, wheelchair & companion bays" },
                      { id: "BOOKING_SIMULATION" as PreviewMode, label: "Booking Simulation", desc: "Interactive seat hold & price preview" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPreviewMode(m.id)}
                        className={`text-left p-2 rounded text-xs transition border ${
                          previewMode === m.id
                            ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm"
                            : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <div className="font-semibold text-[11px]">{m.label}</div>
                        <div className="text-[10px] text-slate-400">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Viewport Device Breakpoint */}
                <Card className="p-3 bg-slate-950/60 border-slate-800 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">Device Viewport</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: "DESKTOP" as PreviewViewport, label: "Desktop", spec: "1600" },
                      { id: "LAPTOP" as PreviewViewport, label: "Laptop", spec: "1280" },
                      { id: "TABLET" as PreviewViewport, label: "Tablet", spec: "1024" },
                      { id: "MOBILE" as PreviewViewport, label: "Mobile", spec: "390" },
                    ].map((vp) => (
                      <Button
                        key={vp.id}
                        size="sm"
                        variant={previewViewport === vp.id ? "primary" : "outline"}
                        onClick={() => setPreviewViewport(vp.id)}
                        className={`h-8 text-[10px] px-1 ${
                          previewViewport === vp.id
                            ? "bg-cyan-600 text-white"
                            : "border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {vp.label}
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Visual Options */}
                <Card className="p-3 bg-slate-950/60 border-slate-800 space-y-2.5">
                  <label className="text-[11px] font-semibold text-slate-300 block">Display Options</label>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Show Seat Labels:</span>
                    <input
                      type="checkbox"
                      checked={previewShowLabels}
                      onChange={(e) => setPreviewShowLabels(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Canvas Grid:</span>
                    <input
                      type="checkbox"
                      checked={previewShowGrid}
                      onChange={(e) => setPreviewShowGrid(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Theme:</span>
                    <select
                      value={previewThemeName}
                      onChange={(e) => setPreviewThemeName(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                    >
                      <option value="DARK">OLED Dark Void</option>
                      <option value="LIGHT">Architectural Slate</option>
                      <option value="HIGH_CONTRAST">High Contrast Gold</option>
                      <option value="OLED">OLED Midnight</option>
                    </select>
                  </div>
                </Card>

                {/* Booking Simulation Cart (Visible when in simulation mode) */}
                {previewMode === "BOOKING_SIMULATION" && (
                  <Card className="p-3 bg-rose-950/30 border-rose-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide">
                        Booking Cart Simulation
                      </span>
                      {simulationState.selectedSeats.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearSimulationSelection}
                          className="h-5 px-1.5 text-[10px] text-rose-400 hover:text-white"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-slate-300">
                      Seats Selected: <span className="font-bold text-white">{simulationState.selectedSeats.length}</span> / {simulationState.maxSeatsAllowed}
                    </div>
                    {simulationState.selectedSeats.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {simulationState.selectedSeats.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-900/60 text-rose-200 border border-rose-700"
                            >
                              {s.seatNumber} (₹{s.pricePlaceholder})
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-rose-900/50 text-xs font-semibold">
                          <span className="text-slate-300">Total Price:</span>
                          <span className="font-mono text-emerald-400 text-sm">₹{simulationState.totalPrice}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">
                        Click on any seat on the canvas to simulate customer selection and hold pricing.
                      </p>
                    )}
                  </Card>
                )}

                {/* Real-Time Preview Statistics */}
                {previewStatistics && (
                  <Card className="p-3 bg-slate-950/60 border-slate-800 space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                      Auditorium Statistics
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Seats:</span>
                      <span className="font-mono text-white font-bold">{previewStatistics.totalSeats}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wheelchair Bays (ADA):</span>
                      <span className="font-mono text-cyan-400 font-bold">{previewStatistics.wheelchairSeatsCount}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Companion Bays:</span>
                      <span className="font-mono text-amber-400">{previewStatistics.companionSeatsCount}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Screens / Exits:</span>
                      <span className="font-mono text-white">
                        {previewStatistics.screenCount} Screen / {previewStatistics.emergencyExitCount} Exits
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Est. Full Gross:</span>
                      <span className="font-mono text-emerald-400 font-bold">₹{previewStatistics.estimatedFullGross.toLocaleString()}</span>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* TAB 7: HALL VALIDATION CENTER (Part 10) */}
            {activeTab === "validation" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Validation Center
                    </h4>
                    <p className="text-[10px] text-slate-400">Pluggable rule evaluation & publish decision</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isRunningValidation}
                    onClick={() => runValidation()}
                    className="h-7 px-2.5 text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/40"
                  >
                    {isRunningValidation ? (
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <ShieldCheck className="w-3 h-3 mr-1" />
                    )}
                    Run Audit
                  </Button>
                </div>

                {/* Publication Readiness Banner */}
                {validationReport && (
                  <Card
                    className={`p-3 border ${
                      validationReport.canPublish
                        ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                        : "bg-rose-950/40 border-rose-500/60 text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {validationReport.canPublish ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>READY TO PUBLISH (All Invariants Passed)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>PUBLICATION BLOCKED ({validationReport.summary.errorsCount} Critical Errors)</span>
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-300">
                      Policy Applied: <span className="font-semibold text-white">{validationReport.policyApplied.name}</span> ({validationReport.policyApplied.level})
                    </div>
                  </Card>
                )}

                {/* Severity Filter Tabs */}
                {validationReport && (
                  <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                    {[
                      { id: "ALL" as const, label: `All (${validationReport.results.length})` },
                      { id: "ERROR" as const, label: `Errors (${validationReport.summary.errorsCount})`, color: "text-rose-400" },
                      { id: "WARNING" as const, label: `Warnings (${validationReport.summary.warningsCount})`, color: "text-amber-400" },
                      { id: "INFO" as const, label: `Info (${validationReport.summary.infoCount})`, color: "text-cyan-400" },
                      { id: "SUGGESTION" as const, label: `Tips (${validationReport.summary.suggestionsCount})`, color: "text-purple-400" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterSeverity(f.id)}
                        className={`px-2 py-1 rounded transition whitespace-nowrap ${
                          filterSeverity === f.id
                            ? "bg-slate-800 text-white font-bold border border-slate-700"
                            : "bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Validation Results List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {validationResultsList.length > 0 ? (
                    validationResultsList.map((res, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                          res.passed
                            ? "bg-slate-950/60 border-slate-800"
                            : res.severity === "ERROR"
                            ? "bg-rose-950/20 border-rose-800/60"
                            : res.severity === "WARNING"
                            ? "bg-amber-950/20 border-amber-800/60"
                            : "bg-slate-900/40 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px] text-white flex items-center gap-1">
                            {res.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : res.severity === "ERROR" ? (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            {res.ruleName}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                              res.severity === "ERROR"
                                ? "bg-rose-900/60 text-rose-300"
                                : res.severity === "WARNING"
                                ? "bg-amber-900/60 text-amber-300"
                                : "bg-cyan-900/60 text-cyan-300"
                            }`}
                          >
                            {res.severity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">{res.message}</p>
                        {!res.passed && res.remediationGuidance && (
                          <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-cyan-300">
                            <span className="font-bold text-cyan-200">Remediation:</span> {res.remediationGuidance}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No validation rules match current severity filter.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: THEATRE CANVAS PREFERENCES (Part 2) */}
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

                {/* Canvas Width & Height Settings */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Canvas Dimensions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Width (px):</span>
                      <Input
                        type="number"
                        min="800"
                        max="8000"
                        step="100"
                        value={preferences.canvasWidth}
                        onChange={(e) =>
                          handleSavePreferences({ canvasWidth: parseInt(e.target.value, 10) || 2400 })
                        }
                        className="h-8 bg-slate-950 border-slate-700 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Height (px):</span>
                      <Input
                        type="number"
                        min="600"
                        max="8000"
                        step="100"
                        value={preferences.canvasHeight}
                        onChange={(e) =>
                          handleSavePreferences({ canvasHeight: parseInt(e.target.value, 10) || 1800 })
                        }
                        className="h-8 bg-slate-950 border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Background & Grid Colors */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Color Settings
                  </label>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Background:</span>
                    <input
                      type="color"
                      value={preferences.backgroundColor || "#0B0F19"}
                      onChange={(e) => handleSavePreferences({ backgroundColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Grid Color:</span>
                    <input
                      type="color"
                      value={preferences.gridColor || "#334155"}
                      onChange={(e) => handleSavePreferences({ gridColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
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

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Show Mini-Map:</span>
                    <button
                      onClick={() => handleSavePreferences({ showMiniMap: !preferences.showMiniMap })}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        preferences.showMiniMap ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {preferences.showMiniMap ? "Visible" : "Hidden"}
                    </button>
                  </div>
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

      {/* ------------------------------------------------------------------------ */}
      {/* 5. CREATE LAYOUT MODAL */}
      {/* ------------------------------------------------------------------------ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Create Layout Definition
            </h3>
            <p className="text-xs text-slate-400">
              Create an immutable layout blueprint for this auditorium. An initial v1 Draft will be automatically provisioned.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Layout Name</label>
                <Input
                  placeholder="e.g. IMAX Laser Premiere Blueprint"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description (Optional)</label>
                <Input
                  placeholder="e.g. Standard 100-seat layout with VIP recliner section"
                  value={newLayoutDesc}
                  onChange={(e) => setNewLayoutDesc(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateNewLayout}
                disabled={!newLayoutName.trim() || isLoading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
              >
                Create Layout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* 6. COMPARE VERSIONS DIFF MODAL (Placeholder) */}
      {/* ------------------------------------------------------------------------ */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-cyan-400" /> Compare Layout Versions
            </h3>
            <p className="text-xs text-slate-400">
              Inspect structural and seating differences between active version and historical revisions.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Version</span>
                <span className="font-bold text-white text-sm">v{currentVersion?.versionNumber} ({currentVersion?.status})</span>
                <div className="text-slate-400 text-xs">Total Seats: {currentVersion?.seats.length}</div>
                <div className="text-slate-400 text-xs">Sections: {currentVersion?.sections.length}</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Compare Against</span>
                <select
                  value={compareTargetVersionId}
                  onChange={(e) => setCompareTargetVersionId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  {allVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber} ({v.status}) - {v.seats.length} seats
                    </option>
                  ))}
                </select>
                {compareTargetVersion && (
                  <>
                    <div className="text-slate-400 text-xs">Total Seats: {compareTargetVersion.seats.length}</div>
                    <div className="text-slate-400 text-xs">Sections: {compareTargetVersion.sections.length}</div>
                  </>
                )}
              </div>
            </div>

            {compareTargetVersion && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1 text-slate-300">
                <div className="font-bold text-cyan-400 mb-1">Delta Analysis:</div>
                <div>
                  Capacity Delta:{" "}
                  <span
                    className={
                      (currentVersion?.seats.length || 0) - compareTargetVersion.seats.length >= 0
                        ? "text-emerald-400 font-mono"
                        : "text-rose-400 font-mono"
                    }
                  >
                    {(currentVersion?.seats.length || 0) - compareTargetVersion.seats.length >= 0 ? "+" : ""}
                    {(currentVersion?.seats.length || 0) - compareTargetVersion.seats.length} seats
                  </span>
                </div>
                <div>Status Transition: {compareTargetVersion.status} ➔ {currentVersion?.status}</div>
                <div className="text-slate-500 text-[11px] pt-1">
                  In-flight shows on v{compareTargetVersion.versionNumber} will remain unaffected when new version publishes.
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompareModal(false)}
                className="text-slate-300 hover:text-white text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
