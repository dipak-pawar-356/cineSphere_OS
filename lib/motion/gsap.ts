/**
 * CineSphere OS — GSAP Animation Engine
 * Safe client-side GSAP integration for high-performance scroll triggers and metrics.
 */

import gsap from "gsap";

/**
 * Checks if running on client and prefers-reduced-motion is NOT active.
 */
export function isMotionEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animate numeric counter from start to end value smoothly using GSAP.
 */
export function animateCounter(
  target: { value: number },
  endValue: number,
  onUpdate: (val: number) => void,
  duration = 1.2
) {
  if (!isMotionEnabled()) {
    onUpdate(endValue);
    return;
  }

  return gsap.to(target, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => onUpdate(Math.round(target.value)),
  });
}

/**
 * Subtle entrance animation for cards or sections
 */
export function gsapFadeUp(element: HTMLElement | string, delay = 0) {
  if (!isMotionEnabled()) return;

  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: "power3.out",
    }
  );
}

/**
 * Staggered entrance for list of items or grid cards
 */
export function gsapStaggerList(elements: HTMLElement[] | string, stagger = 0.05) {
  if (!isMotionEnabled()) return;

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger,
      ease: "power2.out",
    }
  );
}

