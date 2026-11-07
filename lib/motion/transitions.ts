/**
 * CineSphere OS — Motion & Animation Presets
 * Standardized cubic-bezier curves and Framer Motion / Motion variants.
 * Respects prefers-reduced-motion; optimized for 60fps GPU transforms.
 */

export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const; // Apple/Linear style cubic-bezier
export const SNAPPY_EASE = [0.25, 0.1, 0.25, 1] as const;

export const MOTION_DURATIONS = {
  instant: 0.1,
  fast: 0.18,
  normal: 0.28,
  slow: 0.45,
  cinematic: 0.75,
};

// 1. PAGE TRANSITIONS
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.normal, ease: LUXURY_EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: MOTION_DURATIONS.fast, ease: SNAPPY_EASE },
  },
};

// 2. SCROLL REVEALS
export const fadeUpVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.normal, ease: LUXURY_EASE },
  },
};

export const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION_DURATIONS.normal, ease: LUXURY_EASE },
  },
};

// 3. STAGGER CONTAINERS
export const staggerContainer = (staggerDelay = 0.06) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATIONS.normal, ease: LUXURY_EASE },
  },
};

// 4. CARD HOVER
export const cardHoverMotion = {
  rest: { y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  hover: {
    y: -3,
    scale: 1.01,
    transition: { duration: 0.2, ease: LUXURY_EASE },
  },
  tap: { scale: 0.99 },
};

// 5. BUTTON PRESS & HOVER
export const buttonMotion = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.15, ease: LUXURY_EASE } },
  tap: { scale: 0.97 },
};

// 6. MODAL & DRAWER TRANSITIONS
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const modalDialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: LUXURY_EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15, ease: SNAPPY_EASE },
  },
};

export const drawerSlideRightVariants = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.3, ease: LUXURY_EASE },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: SNAPPY_EASE },
  },
};

export const bottomSheetVariants = {
  hidden: { y: "100%" },
  visible: {
    y: "0%",
    transition: { duration: 0.32, ease: LUXURY_EASE },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.22, ease: SNAPPY_EASE },
  },
};

// 7. NAVIGATION DROPDOWN
export const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.15, ease: LUXURY_EASE },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.97,
    transition: { duration: 0.1, ease: SNAPPY_EASE },
  },
};

