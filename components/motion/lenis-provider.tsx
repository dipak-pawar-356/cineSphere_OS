"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Enterprise Lenis Smooth Scroll Provider
 * Provides buttery-smooth 60fps scrolling while strictly respecting prefers-reduced-motion.
 */
export function SmoothScrollProvider({
  children,
  enabled = true,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Accessibility check: disable if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential luxury easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return <>{children}</>;
}

