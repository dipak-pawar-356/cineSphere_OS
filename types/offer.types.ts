import { ID } from "./common.types";

export type OfferCategory =
  | "Festival Offers"
  | "Cashback"
  | "Food Combos"
  | "Food Offers"
  | "Combo Offers"
  | "Coupons"
  | "Membership"
  | "Student Discounts"
  | "Student Discount"
  | "Weekend Offers";

export interface Offer {
  id: ID;
  title: string;
  code: string;
  category: OfferCategory;
  discount: string;
  description?: string;
  tagline?: string;
  validUntil: string;
  status?: "Active" | "Upcoming" | "Expired";
  usageCount?: number;
  minSpend?: string;
  terms?: string[];
  banner?: string;
  badgeText?: string;
  accentColor?: string;
}
