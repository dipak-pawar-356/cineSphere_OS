import { ID } from "./common.types";

export type FAQCategory =
  | "Platform"
  | "Movies"
  | "Booking"
  | "Theatres"
  | "Refund"
  | "Support"
  | "Membership";

export interface FAQItem {
  id: ID;
  question: string;
  answer: string;
  category: FAQCategory;
}

export interface Partner {
  id: ID;
  name: string;
  category: "Sound & Audio" | "Laser Projection" | "Payment Rail" | "Food & Beverage" | "Cloud Infrastructure";
  logo: string;
  website: string;
  description: string;
}

export interface Testimonial {
  id: ID;
  name: string;
  avatar: string;
  role: string;
  city: string;
  comment: string;
  rating: number;
}
