"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  PreviewMode,
  PreviewViewport,
  PreviewPreferences,
  HallPreviewBundle,
  BookingSimulationState,
} from "@/types/hall-preview.types";
import {
  loadPreviewAction,
  refreshPreviewAction,
  loadPreviewConfigAction,
  savePreviewPreferencesAction,
} from "@/actions/hall-preview-actions";
import { HallPreviewEngine } from "@/lib/engine/hall-preview-engine";
import { SeatTemplate } from "@/types/seat-generator.types";

interface UseHallPreviewOptions {
  theatreId: string;
  layoutVersionId: string;
  initialMode?: PreviewMode;
  initialViewport?: PreviewViewport;
  autoLoad?: boolean;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message || fallback);
  }
  return fallback;
}

export function useHallPreview({
  theatreId,
  layoutVersionId,
  initialMode = "CUSTOMER",
  initialViewport = "DESKTOP",
  autoLoad = true,
}: UseHallPreviewOptions) {
  const [bundle, setBundle] = useState<HallPreviewBundle | null>(null);
  const [mode, setMode] = useState<PreviewMode>(initialMode);
  const [viewport, setViewport] = useState<PreviewViewport>(initialViewport);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Canvas visual controls
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [themeName, setThemeName] = useState<"DARK" | "LIGHT" | "HIGH_CONTRAST" | "OLED">("DARK");

  // Booking Simulation State
  const [simulationState, setSimulationState] = useState<BookingSimulationState>({
    selectedSeatIds: [],
    selectedSeats: [],
    totalPrice: 0,
    categoryBreakdown: {},
    maxSeatsAllowed: 10,
    activeStep: "SELECTING",
  });

  /**
   * Load preview bundle from server
   */
  const loadPreview = useCallback(
    async (targetMode?: PreviewMode, targetViewport?: PreviewViewport) => {
      if (!theatreId || !layoutVersionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await loadPreviewAction({
          layoutVersionId,
          theatreId,
          mode: targetMode || mode,
          viewport: targetViewport || viewport,
        });

        if (res.success && res.data) {
          setBundle(res.data);
          setShowLabels(res.data.preferences.seatLabelsVisible);
          if (res.data.preferences.defaultZoom) {
            setZoom(res.data.preferences.defaultZoom);
          }
          if (res.data.preferences.highContrastMode) {
            setThemeName("HIGH_CONTRAST");
          }
        } else {
          const errMsg = typeof res.error === "string" ? res.error : res.error?.message || "Failed to load hall preview";
          setError(errMsg);
        }
      } catch (err: unknown) {
        setError(parseErrorMessage(err, "Error loading preview"));
      } finally {
        setIsLoading(false);
      }
    },
    [theatreId, layoutVersionId, mode, viewport]
  );

  /**
   * Refresh Preview (Bust Cache)
   */
  const refreshPreview = useCallback(async () => {
    if (!theatreId || !layoutVersionId) return;
    setIsLoading(true);
    try {
      const res = await refreshPreviewAction({ layoutVersionId, theatreId });
      if (res.success && res.data) {
        setBundle(res.data);
      }
    } catch (err: unknown) {
      setError(parseErrorMessage(err, "Failed to refresh preview"));
    } finally {
      setIsLoading(false);
    }
  }, [theatreId, layoutVersionId]);

  /**
   * Toggle Seat in Booking Simulation
   */
  const toggleSeatSimulation = useCallback((seat: SeatTemplate) => {
    setSimulationState((prev) => HallPreviewEngine.simulateSeatToggle(prev, seat));
  }, []);

  /**
   * Clear Booking Simulation Selection
   */
  const clearSimulationSelection = useCallback(() => {
    setSimulationState({
      selectedSeatIds: [],
      selectedSeats: [],
      totalPrice: 0,
      categoryBreakdown: {},
      maxSeatsAllowed: 10,
      activeStep: "SELECTING",
    });
  }, []);

  /**
   * Save Theatre Preview Preferences
   */
  const savePreferences = useCallback(
    async (prefs: Partial<PreviewPreferences>) => {
      try {
        const res = await savePreviewPreferencesAction({
          theatreId,
          ...prefs,
        });
        if (res.success && res.data && bundle) {
          setBundle({
            ...bundle,
            preferences: res.data,
          });
        }
      } catch (err: unknown) {
        setError(parseErrorMessage(err, "Failed to save preview preferences"));
      }
    },
    [theatreId, bundle]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && theatreId && layoutVersionId) {
      loadPreview(initialMode, initialViewport);
    }
  }, [autoLoad, theatreId, layoutVersionId, initialMode, initialViewport, loadPreview]);

  // Decorated seats computation
  const decoratedSeats = useMemo(() => {
    if (!bundle?.seats) return [];
    return HallPreviewEngine.filterAndDecorateSeats(
      bundle.seats,
      mode,
      {
        theatreId,
        defaultMode: mode,
        showLabels,
        showGrid,
        seatColorMode: "CATEGORY",
        backgroundTheme: themeName,
        isFullscreen,
        zoom,
        pan,
        accessibilityOverlay: mode === "ACCESSIBILITY",
        enableBookingSimulation: mode === "BOOKING_SIMULATION",
        highContrastMode: themeName === "HIGH_CONTRAST",
        fullscreenDefault: false,
      },
      simulationState
    );
  }, [bundle?.seats, mode, showLabels, showGrid, themeName, isFullscreen, zoom, pan, theatreId, simulationState]);

  // Filtered structural objects computation
  const filteredStructuralObjects = useMemo(() => {
    if (!bundle?.structuralObjects) return [];
    return HallPreviewEngine.filterStructuralObjects(
      bundle.structuralObjects,
      mode,
      {
        theatreId,
        defaultMode: mode,
        showLabels,
        showGrid,
        seatColorMode: "CATEGORY",
        backgroundTheme: themeName,
        isFullscreen,
        zoom,
        pan,
        accessibilityOverlay: mode === "ACCESSIBILITY",
        enableBookingSimulation: mode === "BOOKING_SIMULATION",
        highContrastMode: themeName === "HIGH_CONTRAST",
        fullscreenDefault: false,
      }
    );
  }, [bundle?.structuralObjects, mode, showLabels, showGrid, themeName, isFullscreen, zoom, pan, theatreId]);

  return {
    bundle,
    mode,
    setMode,
    viewport,
    setViewport,
    zoom,
    setZoom,
    pan,
    setPan,
    showLabels,
    setShowLabels,
    showGrid,
    setShowGrid,
    isFullscreen,
    setIsFullscreen,
    themeName,
    setThemeName,
    simulationState,
    toggleSeatSimulation,
    clearSimulationSelection,
    decoratedSeats,
    filteredStructuralObjects,
    statistics: bundle?.statistics || null,
    preferences: bundle?.preferences || null,
    isLoading,
    error,
    loadPreview,
    refreshPreview,
    savePreferences,
  };
}
