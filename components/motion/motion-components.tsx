"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeUpVariant,
  scaleInVariant,
  staggerContainer,
  staggerItem,
  pageVariants,
} from "@/lib/motion/transitions";
import { animateCounter } from "@/lib/motion/gsap";
import { cn } from "@/utils";

/**
 * 1. Reveal on Scroll Component
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. Staggered Container & Staggered Item
 */
export function StaggerList({
  children,
  className,
  staggerDelay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      variants={staggerContainer(staggerDelay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * 3. Animated Metric Counter (60fps GSAP or React fallback)
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 1.2,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = { value: 0 };
    const tween = animateCounter(target, value, (val) => setDisplayValue(val), duration);
    return () => {
      tween?.kill();
    };
  }, [value, duration]);

  return (
    <span className={cn("font-mono font-bold tracking-tight", className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * 4. Page Transition Wrapper
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

