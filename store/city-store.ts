"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_CITIES } from "@/data/common/locations";
import { CustomerCity } from "@/types/customer-discovery.types";

const INITIAL_CITIES: CustomerCity[] = MOCK_CITIES.map((c) => ({
  id: c.id,
  name: c.name,
  state: c.state,
  theatreCount: c.theatreCount,
  screenCount: c.screenCount,
  isPopular: Boolean(c.isPopular),
  slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
}));

interface CityState {
  cities: CustomerCity[];
  selectedCity: CustomerCity;
  recentCities: string[]; // List of city names
  searchQuery: string;
  isCityModalOpen: boolean;

  // Actions
  setSelectedCity: (city: CustomerCity) => void;
  setSelectedCityByName: (cityName: string) => void;
  setSearchQuery: (query: string) => void;
  setCityModalOpen: (open: boolean) => void;
  detectLocation: () => { success: boolean; detectedCity?: CustomerCity; message: string };
}

export const useCityStore = create<CityState>()(
  persist(
    (set, get) => ({
      cities: INITIAL_CITIES,
      selectedCity: INITIAL_CITIES[3] || INITIAL_CITIES[0], // Default Pune (Flagship Theatre A)
      recentCities: ["Pune", "Mumbai", "Bengaluru"],
      searchQuery: "",
      isCityModalOpen: false,

      setSelectedCity: (city) => {
        set((state) => {
          const recents = [city.name, ...state.recentCities.filter((c) => c !== city.name)].slice(0, 5);
          return {
            selectedCity: city,
            recentCities: recents,
            isCityModalOpen: false,
          };
        });
      },

      setSelectedCityByName: (cityName) => {
        const found = get().cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.slug === cityName.toLowerCase()
        );
        if (found) {
          get().setSelectedCity(found);
        }
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setCityModalOpen: (isCityModalOpen) => set({ isCityModalOpen }),

      detectLocation: () => {
        // High-fidelity location detection placeholder
        const defaultDetected = get().cities.find((c) => c.name === "Pune") || get().cities[0];
        get().setSelectedCity(defaultDetected);
        return {
          success: true,
          detectedCity: defaultDetected,
          message: `Detected your location as ${defaultDetected.name}, ${defaultDetected.state}. Updated your cinema circuit.`,
        };
      },
    }),
    {
      name: "cinesphere-customer-city-state",
      partialize: (state) => ({
        selectedCity: state.selectedCity,
        recentCities: state.recentCities,
      }),
    }
  )
);
