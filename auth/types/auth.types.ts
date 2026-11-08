import { UserRole } from "./role.types";
import { AuthUser } from "./user.types";

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  theatreName?: string; // For Theatre Admin applicant
  phone?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  code: string;
  newPassword: string;
}

export interface EmailVerificationInput {
  code: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: AuthError;
  redirectUrl?: string;
}

