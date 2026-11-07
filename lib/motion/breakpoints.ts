/**
 * CineSphere OS — Responsive Breakpoints & Device Profiles
 * Configured to support mobile (320px+) to ultra-wide (2560px+) displays.
 */

export const BREAKPOINTS = {
  xs: 320,  // iPhone SE, small Androids (320px - 480px)
  sm: 640,  // Phablets, large phones in landscape
  md: 768,  // Tablets (iPad Mini, iPad), foldables unfolded
  lg: 1024, // Small laptops, iPad Pro, Surface Pro
  xl: 1280, // Standard desktop, 13-14" MacBook / Windows Laptop
  "2xl": 1536, // Large laptops, 16" displays, standard 1080p monitors
  "3xl": 1920, // Full HD desktop displays (1920x1080)
  "4xl": 2560, // 2K/4K/Ultra-wide Cinema Display Monitors
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Common device category mappings
 */
export const DEVICE_PROFILES = {
  mobileSmall: "(max-width: 374px)",
  mobile: "(max-width: 639px)",
  tablet: "(min-width: 640px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  desktopLarge: "(min-width: 1536px)",
  ultrawide: "(min-width: 1920px)",
  touchDevice: "(hover: none) and (pointer: coarse)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

