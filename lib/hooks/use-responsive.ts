"use client";

import { useEffect, useState } from "react";
import { BREAKPOINTS, BreakpointKey, DEVICE_PROFILES } from "@/lib/motion/breakpoints";

export interface ResponsiveState {
  breakpoint: BreakpointKey;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isUltrawide: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
}

const DEFAULT_STATE: ResponsiveState = {
  breakpoint: "xl",
  width: 1280,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isUltrawide: false,
  isTouch: false,
  prefersReducedMotion: false,
};

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(DEFAULT_STATE);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getBreakpoint = (width: number): BreakpointKey => {
      if (width >= BREAKPOINTS["4xl"]) return "4xl";
      if (width >= BREAKPOINTS["3xl"]) return "3xl";
      if (width >= BREAKPOINTS["2xl"]) return "2xl";
      if (width >= BREAKPOINTS.xl) return "xl";
      if (width >= BREAKPOINTS.lg) return "lg";
      if (width >= BREAKPOINTS.md) return "md";
      if (width >= BREAKPOINTS.sm) return "sm";
      return "xs";
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const bp = getBreakpoint(width);
      const isTouch = window.matchMedia(DEVICE_PROFILES.touchDevice).matches;
      const reducedMotion = window.matchMedia(DEVICE_PROFILES.reducedMotion).matches;

      setState({
        breakpoint: bp,
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        isUltrawide: width >= BREAKPOINTS["3xl"],
        isTouch,
        prefersReducedMotion: reducedMotion,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    const motionQuery = window.matchMedia(DEVICE_PROFILES.reducedMotion);
    const motionListener = (e: MediaQueryListEvent) => {
      setState((prev) => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    motionQuery.addEventListener("change", motionListener);

    return () => {
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", motionListener);
    };
  }, []);

  return state;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(DEVICE_PROFILES.reducedMotion);
    setReduced(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return reduced;
}

