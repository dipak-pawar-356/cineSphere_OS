import { ApiResponse } from "@/lib/security/api-client";
import { Theatre } from "@/types";

export const theatreService = {
  getTheatres: async (): Promise<ApiResponse<Theatre[]>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
  getTheatreById: async (id: string): Promise<ApiResponse<Theatre>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
};

