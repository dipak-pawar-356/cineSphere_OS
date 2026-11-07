import { create } from "zustand";

interface UiState {
  isSidebarOpen: boolean;
  isSearchModalOpen: boolean;
  activeCityId: string;
  toggleSidebar: () => void;
  setSearchModalOpen: (open: boolean) => void;
  setActiveCityId: (cityId: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isSearchModalOpen: false,
  activeCityId: "nyc",
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
  setActiveCityId: (activeCityId) => set({ activeCityId }),
}));
