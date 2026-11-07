import { ID } from "./common.types";

export type EventCategory =
  | "Concerts"
  | "Sports"
  | "Stand-up"
  | "Stand-up Comedy"
  | "Theatre"
  | "Festival"
  | "Live Shows"
  | "Film Festivals";

export interface LiveEvent {
  id: ID;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  theatreId?: ID;
  hallName?: string;
  price?: number;
  priceStart?: string;
  rating: number;
  image?: string;
  banner: string;
  status?: "Tickets Open" | "Almost Full" | "Completed" | "Coming Soon";
  isComingSoon?: boolean;
  artist?: string;
  city: string;
  tags: string[];
}
