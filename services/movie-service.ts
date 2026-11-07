import { ApiResponse } from "@/lib/security/api-client";
import { Movie } from "@/types";

export const movieService = {
  getMovies: async (): Promise<ApiResponse<Movie[]>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
  getMovieById: async (id: string): Promise<ApiResponse<Movie>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
};
