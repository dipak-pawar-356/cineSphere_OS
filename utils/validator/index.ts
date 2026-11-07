/**
 * Validation utility placeholders
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
}

