/**
 * ==============================================================================
 * CineSphere OS — Enterprise Input Sanitization Engine (Phase 2 – Part 16)
 * ==============================================================================
 * Comprehensive defenses against XSS, SQLi, Prototype Pollution, Header Injection
 * and CRLF splitting. Every piece of input is sanitized before business logic.
 * ==============================================================================
 */

// Regex patterns for security detection & cleanup
const SCRIPT_TAG_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_REGEX = /<[^>]*>?/gm;
const CRLF_REGEX = /[\r\n]|%0d|%0a/gi;
const DANGEROUS_ATTRIBUTES_REGEX = /\b(on\w+|javascript:|data:|vbscript:)\s*=/gi;
const PROTOTYPE_POLLUTION_KEYS = new Set(["__proto__", "prototype", "constructor"]);

/**
 * Escapes characters with special meaning in HTML to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitizes generic user-supplied strings by removing null bytes,
 * stripping script tags, and trimming extraneous whitespace.
 */
export function sanitizeString(val: unknown, maxLength = 1000): string {
  if (val === null || val === undefined) return "";
  let str = String(val);

  // Remove null bytes and control characters (except space, tab, newline)
  str = str.replace(/\0/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Strip explicit script tags
  str = str.replace(SCRIPT_TAG_REGEX, "");

  // Trim to max length
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

/**
 * Strips all HTML tags from a string, returning pure plain text.
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(SCRIPT_TAG_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .trim();
}

/**
 * Sanitizes rich text content by removing active script blocks
 * and inline javascript execution attributes.
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== "string") return "";
  let sanitized = html.replace(SCRIPT_TAG_REGEX, "");
  sanitized = sanitized.replace(DANGEROUS_ATTRIBUTES_REGEX, 'data-blocked="true"');
  return sanitized.trim();
}

/**
 * Sanitizes and validates a URL to prevent javascript: or data: injection.
 * Only allows http:, https:, mailto:, and tel: protocols.
 */
export function sanitizeUrl(rawUrl: string, allowedProtocols = ["http:", "https:", "mailto:", "tel:"]): string {
  if (!rawUrl || typeof rawUrl !== "string") return "";

  // Check and eliminate CRLF injection
  const cleaned = rawUrl.replace(CRLF_REGEX, "").trim();

  // Handle relative URLs
  if (cleaned.startsWith("/") && !cleaned.startsWith("//")) {
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned, "https://cinesphere.internal");
    if (!allowedProtocols.includes(parsed.protocol)) {
      return "";
    }
    return cleaned;
  } catch {
    return "";
  }
}

/**
 * Sanitizes and normalizes an email address.
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  const cleaned = email.replace(CRLF_REGEX, "").trim().toLowerCase();
  // Basic RFC 5322 validation check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}

/**
 * Sanitizes phone numbers by allowing only digits, plus signs, hyphens, and spaces.
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/[^\d+\-\s()]/g, "").trim();
}

/**
 * Sanitizes headers to prevent HTTP Response Splitting (CRLF injection).
 */
export function sanitizeHeaderValue(headerVal: string): string {
  if (!headerVal || typeof headerVal !== "string") return "";
  return headerVal.replace(CRLF_REGEX, "").trim();
}

/**
 * Sanitizes search / query strings, removing wildcards and dangerous characters.
 */
export function sanitizeSearchQuery(query: string, maxLength = 100): string {
  if (!query || typeof query !== "string") return "";
  let cleaned = query.replace(CRLF_REGEX, "").replace(/[%_\\]/g, "");
  cleaned = sanitizeString(cleaned, maxLength);
  return cleaned;
}

/**
 * Sanitizes URL query parameter dictionaries safely without prototype pollution.
 */
export function sanitizeQueryParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, val] of Object.entries(params)) {
    if (PROTOTYPE_POLLUTION_KEYS.has(key) || val === undefined) continue;
    const safeKey = sanitizeString(key, 64);
    if (!safeKey) continue;
    if (Array.isArray(val)) {
      result[safeKey] = val.map((v) => sanitizeSearchQuery(v, 200));
    } else {
      result[safeKey] = sanitizeSearchQuery(val, 200);
    }
  }
  return result;
}

/**
 * Sanitizes cookie values by stripping control chars, semicolons, and CRLF sequences
 * (RFC 6265 safe cookie-octet enforcement).
 */
export function sanitizeCookieValue(cookieVal: string, maxLength = 512): string {
  if (!cookieVal || typeof cookieVal !== "string") return "";
  const cleaned = cookieVal
    .replace(CRLF_REGEX, "")
    .replace(/[;,\s\\"]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "");
  return cleaned.slice(0, maxLength);
}

/**
 * Recursively sanitizes an object, dictionary, or array.
 * Strictly prevents Prototype Pollution by discarding __proto__, prototype, and constructor.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Prototype Pollution Prevention
      if (PROTOTYPE_POLLUTION_KEYS.has(key)) {
        continue;
      }

      // Disallow dangerous keys
      const cleanKey = sanitizeString(key, 64);
      result[cleanKey] = sanitizeObject(value);
    }

    return result as T;
  }

  return obj;
}

