import { ApiResponse } from "@/lib/security/api-client";
import { RecentBooking } from "@/types";

export interface BookingPayload {
  showtimeId: string;
  seats: string[];
  customerEmail: string;
  paymentMethod: string;
}

export const bookingService = {
  createReservation: async (payload: BookingPayload): Promise<ApiResponse<RecentBooking>> => {
    // Contract placeholder for Phase 2 API
    return { data: null, error: null };
  },
};
