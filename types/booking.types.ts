import { ID } from "./common.types";

export type BookingStatus = "Confirmed" | "Checked-in" | "Completed" | "Cancelled" | "Expired";

export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";

export type PaymentMethod = "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash" | "Wallet";

export interface Booking {
  id: ID;
  referenceCode: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieId: ID;
  movieTitle: string;
  theatreId: ID;
  theatreName?: string;
  hallId: ID;
  hallName: string;
  showId?: ID;
  showTime: string;
  bookingDate: string;
  seats: string[];
  amount: number;
  convenienceFee?: number;
  taxAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCodeUrl?: string;
}

export interface RecentBooking {
  id: string;
  bookingRef: string;
  movieTitle: string;
  theatreName: string;
  screens: string;
  seats: string;
  amount: string;
  timestamp: string;
  status: "Confirmed" | "Processing" | "Refunded";
}
