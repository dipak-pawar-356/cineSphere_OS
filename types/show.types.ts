import { ID } from "./common.types";
import { MovieFormat, MovieLanguage } from "./movie.types";

export type ShowStatus = "Upcoming" | "Running" | "Housefull" | "Completed" | "Cancelled";

export interface Show {
  id: ID;
  movieId: ID;
  movieTitle: string;
  theatreId: ID;
  theatreName?: string;
  hallId: ID;
  hallName: string;
  showDate: string;
  startTime: string;
  endTime: string;
  language: MovieLanguage;
  format: MovieFormat;
  ticketPrice: number;
  seatsBooked: number;
  totalSeats: number;
  status: ShowStatus;
}
