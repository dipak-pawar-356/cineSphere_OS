import { ID } from "./common.types";

export type ReportCategory =
  | "Daily Box Office"
  | "Occupancy"
  | "Concessions"
  | "Distributor Split"
  | "Tax Compliance"
  | "Auditorium Performance"
  | "Turnstile Security";

export interface Report {
  id: ID;
  title: string;
  category: ReportCategory;
  lastGenerated: string;
  period: string;
  fileSize: string;
  status: "Ready" | "Processing" | "Archived";
  theatreId?: ID;
}
