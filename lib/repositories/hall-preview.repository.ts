/**
 * ==============================================================================
 * CineSphere OS — Hall Preview Repository
 * Phase 4 – Part 9: Multi-Tenant Preview Configurations & Themes
 * ==============================================================================
 */

import {
  PreviewConfiguration,
  PreviewPreferences,
  PreviewTheme,
} from "@/types/hall-preview.types";

export class HallPreviewRepository {
  private static instance: HallPreviewRepository | null = null;

  // In-memory data stores for preview preferences, configurations, and themes
  private preferencesStore: Map<string, PreviewPreferences> = new Map();
  private configurationsStore: Map<string, PreviewConfiguration> = new Map();
  private themesStore: Map<string, PreviewTheme> = new Map();

  private constructor() {
    this.seedDefaultThemes();
    this.seedTheatrePreferences();
  }

  public static getInstance(): HallPreviewRepository {
    if (!HallPreviewRepository.instance) {
      HallPreviewRepository.instance = new HallPreviewRepository();
    }
    return HallPreviewRepository.instance;
  }

  // ----------------------------------------------------------------------------
  // 1. Preview Preferences (Per Theatre)
  // ----------------------------------------------------------------------------

  public async getPreferences(theatreId: string): Promise<PreviewPreferences> {
    const existing = this.preferencesStore.get(theatreId);
    if (existing) return { ...existing };

    // Factory fallback defaults
    const fallback: PreviewPreferences = {
      theatreId,
      defaultMode: "CUSTOMER",
      seatLabelsVisible: true,
      sectionColorsEnabled: true,
      accessibilityOverlayEnabled: true,
      darkThemeEnabled: true,
      bookingSimulationEnabled: true,
      categoryLabelsVisible: true,
      highContrastMode: false,
      fullscreenDefault: false,
      defaultZoom: 100,
    };
    this.preferencesStore.set(theatreId, fallback);
    return fallback;
  }

  public async savePreferences(
    theatreId: string,
    updates: Partial<PreviewPreferences>
  ): Promise<PreviewPreferences> {
    const current = await this.getPreferences(theatreId);
    const updated: PreviewPreferences = {
      ...current,
      ...updates,
      theatreId, // Immutable tenant boundary
    };
    this.preferencesStore.set(theatreId, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // 2. Version-Specific Preview Configurations
  // ----------------------------------------------------------------------------

  public async getConfiguration(
    theatreId: string,
    layoutVersionId: string
  ): Promise<PreviewConfiguration> {
    const key = `${theatreId}::${layoutVersionId}`;
    const existing = this.configurationsStore.get(key);
    if (existing) return { ...existing };

    const prefs = await this.getPreferences(theatreId);
    const defaultConf: PreviewConfiguration = {
      id: `prev-cfg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      theatreId,
      layoutVersionId,
      defaultMode: prefs.defaultMode,
      showLabels: prefs.seatLabelsVisible,
      showGrid: true,
      seatColorMode: "CATEGORY",
      backgroundTheme: prefs.darkThemeEnabled ? "DARK" : "LIGHT",
      isFullscreen: false,
      zoom: prefs.defaultZoom || 100,
      pan: { x: 0, y: 0 },
      accessibilityOverlay: prefs.accessibilityOverlayEnabled,
      enableBookingSimulation: prefs.bookingSimulationEnabled,
      highContrastMode: prefs.highContrastMode,
      fullscreenDefault: prefs.fullscreenDefault,
    };

    this.configurationsStore.set(key, defaultConf);
    return defaultConf;
  }

  public async saveConfiguration(
    theatreId: string,
    layoutVersionId: string,
    updates: Partial<PreviewConfiguration>
  ): Promise<PreviewConfiguration> {
    const current = await this.getConfiguration(theatreId, layoutVersionId);
    const updated: PreviewConfiguration = {
      ...current,
      ...updates,
      theatreId,
      layoutVersionId,
    };
    const key = `${theatreId}::${layoutVersionId}`;
    this.configurationsStore.set(key, updated);
    return { ...updated };
  }

  // ----------------------------------------------------------------------------
  // 3. Visual Themes
  // ----------------------------------------------------------------------------

  public async listThemes(theatreId?: string): Promise<PreviewTheme[]> {
    const all = Array.from(this.themesStore.values());
    if (!theatreId) return all;
    return all.filter((t) => !t.theatreId || t.theatreId === theatreId);
  }

  public async getTheme(themeName: string, theatreId?: string): Promise<PreviewTheme> {
    const all = await this.listThemes(theatreId);
    const found = all.find((t) => t.themeName === themeName) || all.find((t) => t.isDefault) || all[0];
    return { ...found };
  }

  // ----------------------------------------------------------------------------
  // 4. Default Seeds
  // ----------------------------------------------------------------------------

  private seedDefaultThemes(): void {
    const defaultThemes: PreviewTheme[] = [
      {
        id: "theme-dark-void",
        name: "OLED Cinema Void",
        themeName: "DARK",
        backgroundColor: "#0B0F19",
        gridColor: "rgba(255, 255, 255, 0.04)",
        screenColor: "#38BDF8",
        screenCurvatureGlow: "rgba(56, 189, 248, 0.3)",
        textColor: "#F8FAFC",
        accentColor: "#E11D48",
        isDefault: true,
      },
      {
        id: "theme-light-arch",
        name: "Architectural Slate",
        themeName: "LIGHT",
        backgroundColor: "#F8FAFC",
        gridColor: "rgba(0, 0, 0, 0.06)",
        screenColor: "#0284C7",
        screenCurvatureGlow: "rgba(2, 132, 199, 0.2)",
        textColor: "#0F172A",
        accentColor: "#BE123C",
        isDefault: false,
      },
      {
        id: "theme-high-contrast",
        name: "High Contrast Accessibility",
        themeName: "HIGH_CONTRAST",
        backgroundColor: "#000000",
        gridColor: "rgba(255, 255, 0, 0.15)",
        screenColor: "#FACC15",
        screenCurvatureGlow: "rgba(250, 204, 21, 0.5)",
        textColor: "#FFFFFF",
        accentColor: "#F59E0B",
        isDefault: false,
      },
      {
        id: "theme-oled-midnight",
        name: "Pure OLED Midnight",
        themeName: "OLED",
        backgroundColor: "#020617",
        gridColor: "rgba(148, 163, 184, 0.05)",
        screenColor: "#A855F7",
        screenCurvatureGlow: "rgba(168, 85, 247, 0.3)",
        textColor: "#E2E8F0",
        accentColor: "#D946EF",
        isDefault: false,
      },
    ];

    for (const t of defaultThemes) {
      this.themesStore.set(t.id, t);
    }
  }

  private seedTheatrePreferences(): void {
    // Theatre A: Pune Galaxy Multiplex (th-pun-001)
    // Seat Labels Visible, Section Colors Enabled, Accessibility Overlay Enabled
    this.preferencesStore.set("th-pun-001", {
      theatreId: "th-pun-001",
      defaultMode: "CUSTOMER",
      seatLabelsVisible: true,
      sectionColorsEnabled: true,
      accessibilityOverlayEnabled: true,
      darkThemeEnabled: true,
      bookingSimulationEnabled: true,
      categoryLabelsVisible: true,
      highContrastMode: false,
      fullscreenDefault: false,
      defaultZoom: 100,
    });

    // Theatre B: Mumbai IMAX (th-mum-002)
    // Seat Labels Hidden, Dark Theme Enabled, Booking Simulation Enabled
    this.preferencesStore.set("th-mum-002", {
      theatreId: "th-mum-002",
      defaultMode: "BOOKING_SIMULATION",
      seatLabelsVisible: false,
      sectionColorsEnabled: false,
      accessibilityOverlayEnabled: false,
      darkThemeEnabled: true,
      bookingSimulationEnabled: true,
      categoryLabelsVisible: true,
      highContrastMode: false,
      fullscreenDefault: false,
      defaultZoom: 85,
    });

    // Theatre C: Dubai Grand Mall (th-dxb-003)
    // Category Labels Visible, High Contrast Mode Enabled, Fullscreen Default Enabled
    this.preferencesStore.set("th-dxb-003", {
      theatreId: "th-dxb-003",
      defaultMode: "THEATRE",
      seatLabelsVisible: true,
      sectionColorsEnabled: true,
      accessibilityOverlayEnabled: true,
      darkThemeEnabled: true,
      bookingSimulationEnabled: true,
      categoryLabelsVisible: true,
      highContrastMode: true,
      fullscreenDefault: true,
      defaultZoom: 110,
    });
  }
}

export const hallPreviewRepository = HallPreviewRepository.getInstance();
