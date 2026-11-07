import { ID, EntityStatus } from "./common.types";
import { MovieFormat } from "./movie.types";

export type ScreenType =
  | "IMAX Laser"
  | "Dolby Cinema"
  | "4DX Dynamic"
  | "Prime Club"
  | "Royal Suite"
  | "Standard"
  | "ScreenX";

export type SeatCategoryTier = "Silver" | "Gold" | "Platinum" | "VIP Recliner" | "Royal Suite Lounger";

export interface SeatCategory {
  id: ID;
  name: SeatCategoryTier;
  basePrice: number;
  perks: string[];
  totalSeats: number;
}

export interface HallSection {
  id: ID;
  name: string;
  category: SeatCategoryTier;
  rowCount: number;
  seatCount: number;
  rowLabels: string[];
}

export interface Hall {
  id: ID;
  theatreId: ID;
  name: string;
  hallNumber: number;
  screenType: ScreenType;
  totalSeats: number;
  seatCategories?: SeatCategory[];
  sections?: HallSection[];
  aspectRatio: string;
  projectorModel: string;
  audioSpec: string;
  currentMovie?: string;
  currentShow?: string;
  occupancyPercent?: number;
  status: "Active" | "Maintenance" | "Cleaning" | "Show Running";
  image?: string;
}

