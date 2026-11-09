"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BookingSession,
  BookingSessionStatus,
  SelectedSeatItem,
  BookingReviewDTO,
} from "@/types/booking-engine.types";
import {
  createBookingSessionAction,
  addSeatToSessionAction,
  removeSeatFromSessionAction,
  renewSessionLockAction,
  expireBookingSessionAction,
  getBookingReviewAction,
} from "@/actions/booking-engine-actions";

interface BookingSessionState {
  currentSession: BookingSession | null;
  isLoading: boolean;
  error: string | null;
  timeRemainingSeconds: number;
  isReviewModalOpen: boolean;
  isExpiredModalOpen: boolean;
  reviewData: BookingReviewDTO | null;

  // Actions
  initSession: (showId: string, customerId?: string) => Promise<BookingSession | null>;
  selectSeat: (seatNumber: string) => Promise<{ success: boolean; error?: string }>;
  deselectSeat: (seatNumber: string) => Promise<{ success: boolean; error?: string }>;
  extendSessionLock: () => Promise<boolean>;
  expireCurrentSession: () => Promise<void>;
  tickTimer: () => void;
  openReviewModal: () => Promise<void>;
  closeReviewModal: () => void;
  closeExpiredModal: () => void;
  resetSession: () => void;
  clearError: () => void;
}

export const useBookingSessionStore = create<BookingSessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      isLoading: false,
      error: null,
      timeRemainingSeconds: 600, // 10 minutes
      isReviewModalOpen: false,
      isExpiredModalOpen: false,
      reviewData: null,

      initSession: async (showId: string, customerId?: string) => {
        const existing = get().currentSession;
        // Reuse active session if it matches the current show and is not expired
        if (
          existing &&
          existing.showId === showId &&
          existing.status === "Active" &&
          new Date(existing.expiresAt).getTime() > Date.now()
        ) {
          const remaining = Math.max(
            0,
            Math.floor((new Date(existing.expiresAt).getTime() - Date.now()) / 1000)
          );
          set({ timeRemainingSeconds: remaining });
          return existing;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await createBookingSessionAction({ showId, customerId });
          if (res.success && res.data) {
            const remaining = Math.max(
              0,
              Math.floor((new Date(res.data.expiresAt).getTime() - Date.now()) / 1000)
            );
            set({
              currentSession: res.data,
              timeRemainingSeconds: remaining,
              isLoading: false,
              isExpiredModalOpen: false,
            });
            return res.data;
          } else {
            set({ error: res.error || "Failed to start session", isLoading: false });
            return null;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Network error";
          set({ error: msg, isLoading: false });
          return null;
        }
      },

      selectSeat: async (seatNumber: string) => {
        let session = get().currentSession;
        if (!session || session.status !== "Active") {
          return { success: false, error: "Active session required." };
        }

        set({ isLoading: true, error: null });
        try {
          const res = await addSeatToSessionAction(session.id, seatNumber);
          if (res.success && res.data) {
            set({ currentSession: res.data, isLoading: false });
            return { success: true };
          } else {
            set({ error: res.error, isLoading: false });
            return { success: false, error: res.error };
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error selecting seat";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      deselectSeat: async (seatNumber: string) => {
        const session = get().currentSession;
        if (!session) return { success: false };

        set({ isLoading: true, error: null });
        try {
          const res = await removeSeatFromSessionAction(session.id, seatNumber);
          if (res.success && res.data) {
            set({ currentSession: res.data, isLoading: false });
            return { success: true };
          } else {
            set({ error: res.error, isLoading: false });
            return { success: false, error: res.error };
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error deselecting seat";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      extendSessionLock: async () => {
        const session = get().currentSession;
        if (!session) return false;

        set({ isLoading: true });
        try {
          const res = await renewSessionLockAction(session.id, 5);
          if (res.success && res.data) {
            const remaining = Math.max(
              0,
              Math.floor((new Date(res.data.expiresAt).getTime() - Date.now()) / 1000)
            );
            set({
              currentSession: res.data,
              timeRemainingSeconds: remaining,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      expireCurrentSession: async () => {
        const session = get().currentSession;
        if (session && session.status === "Active") {
          try {
            await expireBookingSessionAction(session.id);
          } catch {
            // Ignore background error
          }
        }

        set({
          timeRemainingSeconds: 0,
          isExpiredModalOpen: true,
          isReviewModalOpen: false,
          currentSession: session ? { ...session, status: "Expired", selectedSeats: [] } : null,
        });
      },

      tickTimer: () => {
        const session = get().currentSession;
        if (!session || session.status !== "Active") return;

        const remaining = Math.max(
          0,
          Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
        );

        set({ timeRemainingSeconds: remaining });

        if (remaining <= 0) {
          get().expireCurrentSession();
        }
      },

      openReviewModal: async () => {
        const session = get().currentSession;
        if (!session) return;

        set({ isLoading: true });
        try {
          const res = await getBookingReviewAction(session.id);
          if (res.success && res.data) {
            set({ reviewData: res.data, isReviewModalOpen: true, isLoading: false });
          } else {
            set({ error: res.error, isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      closeReviewModal: () => set({ isReviewModalOpen: false }),
      closeExpiredModal: () => set({ isExpiredModalOpen: false }),
      resetSession: () =>
        set({
          currentSession: null,
          timeRemainingSeconds: 600,
          isReviewModalOpen: false,
          isExpiredModalOpen: false,
          reviewData: null,
          error: null,
        }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "cinesphere-booking-session-storage",
      partialize: (state) => ({
        currentSession: state.currentSession,
      }),
    }
  )
);
