/**
 * CineSphere OS - Global Error Handling Utility
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code = "INTERNAL_ERROR", statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function handleApiError(error: unknown): { code: string; message: string } {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message };
  }
  if (error instanceof Error) {
    return { code: "UNHANDLED_EXCEPTION", message: error.message };
  }
  return { code: "UNKNOWN_ERROR", message: "An unexpected error occurred" };
}

