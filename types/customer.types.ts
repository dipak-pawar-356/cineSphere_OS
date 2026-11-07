import { ID } from "./common.types";

export type LoyaltyTier = "Standard" | "Silver" | "Gold" | "Platinum" | "CineSphere VIP";

export type CustomerStatus = "Active" | "VIP" | "Dormant" | "Suspended";

export interface Customer {
  id: ID;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  loyaltyTier: LoyaltyTier;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  registrationDate: string;
  status: CustomerStatus;
  preferredGenre?: string;
  city?: string;
}
