/**
 * CineSphere OS - Core Design System Tokens
 */

export const THEME_TOKENS = {
  colors: {
    primary: "#FBBF24",
    background: "#070B12",
    surface: "#111827",
    card: "#161F2E",
    border: "#2A3445",
    primaryText: "#F9FAFB",
    secondaryText: "#9CA3AF",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#2563EB",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    full: "9999px",
  },
  typography: {
    fontSans: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  },
} as const;

