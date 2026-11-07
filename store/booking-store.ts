import { create } from "zustand";

interface BookingDraft {
  movieId: string | null;
  theatreId: string | null;
  showtimeId: string | null;
  selectedSeats: string[];
}

interface BookingState {
  draft: BookingDraft;
  setDraftMovie: (movieId: string | null) => void;
  setDraftTheatre: (theatreId: string | null) => void;
  resetDraft: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  draft: {
    movieId: null,
    theatreId: null,
    showtimeId: null,
    selectedSeats: [],
  },
  setDraftMovie: (movieId) =>
    set((state) => ({ draft: { ...state.draft, movieId } })),
  setDraftTheatre: (theatreId) =>
    set((state) => ({ draft: { ...state.draft, theatreId } })),
  resetDraft: () =>
    set({
      draft: { movieId: null, theatreId: null, showtimeId: null, selectedSeats: [] },
    }),
}));

