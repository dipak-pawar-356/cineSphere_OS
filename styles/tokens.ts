/**
 * CineSphere OS - Centralized Enterprise Design Tokens
 * Scalable token registry for colors, typography, spacing, radius, shadows, and motion.
 */

export const COLOR_TOKENS = {
  background: {
    DEFAULT: "#070B12",
    secondary: "#0F172A",
    surface: "#111827",
    card: "#161F2E",
    sidebar: "#0B1220",
  },
  primary: {
    DEFAULT: "#FBBF24",
    hover: "#FACC15",
    focus: "#EAB308",
    muted: "rgba(251, 191, 36, 0.15)",
    border: "rgba(251, 191, 36, 0.3)",
  },
  secondary: {
    DEFAULT: "#2563EB",
    hover: "#1D4ED8",
    muted: "rgba(37, 99, 235, 0.15)",
  },
  state: {
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",
  },
  border: {
    DEFAULT: "#2A3445",
    divider: "#1F2937",
    focus: "rgba(251, 191, 36, 0.5)",
  },
  text: {
    primary: "#F9FAFB",
    secondary: "#CBD5E1",
    muted: "#94A3B8",
    disabled: "#64748B",
  },
} as const;

export const SPACING_TOKENS = {
  2: "0.125rem",   // 2px
  4: "0.25rem",    // 4px
  8: "0.5rem",     // 8px
  12: "0.75rem",   // 12px
  16: "1rem",      // 16px
  20: "1.25rem",   // 20px
  24: "1.5rem",    // 24px
  32: "2rem",      // 32px
  40: "2.5rem",    // 40px
  48: "3rem",      // 48px
  64: "4rem",      // 64px
  80: "5rem",      // 80px
  96: "6rem",      // 96px
  128: "8rem",     // 128px
} as const;

export const TYPOGRAPHY_TOKENS = {
  display: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight",
  headingXL: "text-3xl sm:text-4xl font-extrabold tracking-tight",
  headingLarge: "text-2xl sm:text-3xl font-bold tracking-tight",
  headingMedium: "text-xl sm:text-2xl font-bold tracking-tight",
  headingSmall: "text-lg sm:text-xl font-semibold tracking-tight",
  bodyLarge: "text-base sm:text-lg leading-relaxed",
  bodyMedium: "text-sm sm:text-base leading-normal",
  bodySmall: "text-xs sm:text-sm leading-normal",
  caption: "text-[11px] sm:text-xs tracking-normal text-[#94A3B8]",
  label: "text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]",
  button: "text-xs sm:text-sm font-semibold tracking-wide",
  navigation: "text-xs sm:text-sm font-medium tracking-normal",
  tableText: "text-xs font-medium",
  sidebarText: "text-xs font-medium tracking-normal",
  dashboardNumbers: "font-mono font-bold tracking-tight",
} as const;

export const RADIUS_TOKENS = {
  small: "rounded-md",      // 6px
  medium: "rounded-lg",     // 8px
  large: "rounded-xl",      // 12px
  extraLarge: "rounded-2xl", // 16px
  full: "rounded-full",
  components: {
    buttons: "rounded-lg",
    inputs: "rounded-lg",
    dropdowns: "rounded-xl",
    cards: "rounded-2xl",
    modals: "rounded-2xl",
    tables: "rounded-xl",
    drawer: "rounded-t-2xl sm:rounded-2xl",
  },
} as const;

export const SHADOW_TOKENS = {
  card: "shadow-[0_8px_30px_rgb(0,0,0,0.35)]",
  dropdown: "shadow-[0_12px_40px_rgb(0,0,0,0.5)]",
  modal: "shadow-[0_24px_60px_rgb(0,0,0,0.7)]",
  floatingButton: "shadow-[0_10px_25px_rgba(251,191,36,0.25)]",
  sidebar: "shadow-[4px_0_24px_rgb(0,0,0,0.4)]",
  hover: "hover:shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 transition-all duration-200",
  focus: "focus-visible:ring-2 focus-visible:ring-[#FBBF24]/50 focus-visible:outline-none",
} as const;

export const ICON_SIZE_TOKENS = {
  small: "h-3.5 w-3.5",   // 14px
  medium: "h-4.5 w-4.5",  // 18px
  large: "h-6 w-6",       // 24px
  extraLarge: "h-8 w-8",  // 32px
} as const;

export const Z_INDEX_TOKENS = {
  base: 0,
  card: 1,
  sticky: 20,
  dropdown: 30,
  sidebar: 40,
  navbar: 45,
  modalBackdrop: 50,
  modalDialog: 55,
  popover: 60,
  toast: 70,
  tooltip: 80,
} as const;

export const BREAKPOINT_TOKENS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const CONTAINER_TOKENS = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1600px]",
} as const;

