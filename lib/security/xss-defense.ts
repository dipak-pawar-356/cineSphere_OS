/**
 * ==============================================================================
 * CineSphere OS — XSS Defense & HTML Sanitization Engine (Phase 2 – Part 16)
 * ==============================================================================
 * Multi-layer protection against Stored, Reflected, and DOM-based Cross-Site
 * Scripting attacks. Escapes untrusted strings and neutralizes script execution.
 * ==============================================================================
 */

import { escapeHtml } from "./input-sanitizer";

/**
 * Escapes values embedded in HTML attribute contexts.
 */
export function escapeHtmlAttribute(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapes JavaScript string literals embedded in inline scripts or dynamic templates.
 */
export function escapeJsString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/<\/script/gi, "<\\/script");
}

/**
 * Safely parses and validates JSON, discarding any properties
 * that attempt Prototype Pollution (__proto__, constructor, prototype).
 */
export function safeJsonParse<T = unknown>(jsonStr: string, fallback: T): T {
  try {
    return JSON.parse(jsonStr, (key, value) => {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return undefined; // Discard prototype pollution keys
      }
      return value;
    });
  } catch {
    return fallback;
  }
}

export { escapeHtml };

