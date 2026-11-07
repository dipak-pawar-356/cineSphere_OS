import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class name merging helper
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate unique client-side id
 */
export function generateId(prefix = "cs"): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

