import { ID } from "./common.types";

export type BookingStatus = "Confirmed" | "Checked-in" | "Completed" | "Cancelled" | "Expired";

export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";

export type PaymentMethod = "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash" | "Wallet";

/**
 * Individual Ticket generated for each booked seat in a Booking.
 */
export interface Ticket {
  ticketId: ID;
  ticketNumber: string;
  bookingId: ID;
  bookingRef: string;
  seatNumber: string;
  sectionName: string;
  price: number;
  movieTitle: string;
  theatreId: ID;
  theatreName: string;
  hallName: string;
  showDate: string;
  showTime: string;
  format: string;
  language: string;
  qrPlaceholder: string;
  status: "Valid" | "Used" | "Cancelled";
}

/**
 * Live Price Calculation Breakdown
 */
export interface PricingSummary {
  subtotal: number;
  convenienceFee: number;
  tax: number;
  total: number;
  formattedSubtotal: string;
  formattedConvenienceFee: string;
  formattedTax: string;
  formattedTotal: string;
  seatCount: number;
}

/**
 * Real-time Customer Seat Selection Summary
 */
export interface BookingSummary {
  showId: ID;
  selectedSeats: string[];
  seatCount: number;
  seatsDetail: {
    seatNumber: string;
    sectionName: string;
    price: number;
  }[];
  pricing: PricingSummary;
}

/**
 * Complete Booking Entity
 * Belongs strictly to a Show (and through Show, to the Theatre and Movie).
 */
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
  seatsDetail?: {
    seatNumber: string;
    sectionName: string;
    price: number;
  }[];
  amount: number;
  convenienceFee?: number;
  taxAmount?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  qrCodeUrl?: string;
  tickets?: Ticket[];
  theatreUPI?: string;
  theatreMerchantName?: string;
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
