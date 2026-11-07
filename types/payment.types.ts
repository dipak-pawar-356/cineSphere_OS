import { ID } from "./common.types";
import { PaymentMethod, PaymentStatus } from "./booking.types";

/**
 * Theatre-Specific UPI & Payment Rail Configuration
 * In multi-tenant architecture, payment belongs to the Theatre hosting the show, not the Platform.
 */
export interface UPIConfiguration {
  upiId: string;
  merchantName: string;
  qrPlaceholder: string;
  bankName: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  settlementPeriod?: "T+0 Instant" | "T+1 Daily" | "Weekly";
  gatewayCredentials?: {
    provider: "Razorpay" | "PhonePe" | "Paytm" | "Stripe" | "PineLabs";
    keyIdMasked: string;
    webhookUrl?: string;
    isActive: boolean;
  };
}

/**
 * Tenant-Isolated Booking Payment
 */
export interface Payment {
  id: ID;
  bookingId: ID;
  bookingRef: string;
  theatreId: ID;
  theatreName: string;
  merchantName: string;
  upiId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  timestamp: string;
  gatewayRef: string;
  convenienceFeeShare?: {
    theatreAmount: number;
    platformAmount: number;
  };
  taxBreakup?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
}

/**
 * Ledger Transaction (Backward Compatibility)
 */
export interface Transaction {
  id: ID;
  bookingRef: string;
  customerId?: ID;
  customer: string;
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  status: "Success" | "Pending" | "Refunded" | "Failed";
  gatewayRef: string;
  theatreId?: ID;
}
