/**
 * Safe client browser storage utilities (localStorage / sessionStorage)
 */

export const safeLocalStorage = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[storage] Failed setting key ${key}:`, e);
    }
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[storage] Failed removing key ${key}:`, e);
    }
  },
};
