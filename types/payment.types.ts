import { ID } from "./common.types";
import { PaymentMethod, PaymentStatus } from "./booking.types";

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
