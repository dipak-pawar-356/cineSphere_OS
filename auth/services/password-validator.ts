import { SECURITY_CONFIG } from "../constants/security.constants";

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0 - 4
  strength: "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  color: string;
  errors: string[];
}

/**
 * Validates a password against CineSphere OS Enterprise Security Standards.
 */
export function validatePassword(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let score = 0;

  const { MIN_LENGTH, MAX_LENGTH, REQUIRE_UPPERCASE, REQUIRE_LOWERCASE, REQUIRE_NUMBERS, REQUIRE_SPECIAL_CHAR, SPECIAL_CHARS_REGEX } =
    SECURITY_CONFIG.PASSWORD;

  if (!password || password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long.`);
  } else {
    score += 1;
  }

  if (password.length > MAX_LENGTH) {
    errors.push(`Password cannot exceed ${MAX_LENGTH} characters.`);
  }

  if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z).");
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z).");
  }

  if (REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit (0-9).");
  } else if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (REQUIRE_SPECIAL_CHAR && !SPECIAL_CHARS_REGEX.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*).");
  } else if (SPECIAL_CHARS_REGEX.test(password)) {
    score += 1;
  }

  let strength: "Weak" | "Fair" | "Good" | "Strong" | "Excellent" = "Weak";
  let color = "#EF4444"; // Red

  if (score === 1) {
    strength = "Weak";
    color = "#EF4444";
  } else if (score === 2) {
    strength = "Fair";
    color = "#F59E0B"; // Amber
  } else if (score === 3) {
    strength = "Good";
    color = "#38BDF8"; // Sky
  } else if (score === 4 && password.length >= 12) {
    strength = "Excellent";
    color = "#10B981"; // Emerald
  } else if (score === 4) {
    strength = "Strong";
    color = "#10B981";
  }

  return {
    isValid: errors.length === 0,
    score,
    strength,
    color,
    errors,
  };
}

