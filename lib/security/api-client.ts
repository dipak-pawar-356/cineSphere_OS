/**
 * CineSphere OS - Typed API Client Placeholder
 */

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "") {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Placeholder - returns typed signature
    return { data: null, error: null };
  }

  async post<T>(endpoint: string, payload: unknown): Promise<ApiResponse<T>> {
    // Placeholder - returns typed signature
    return { data: null, error: null };
  }
}

export const apiClient = new ApiClient();
