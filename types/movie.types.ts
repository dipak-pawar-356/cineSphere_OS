import { ID, MediaAsset } from "./common.types";

export type MovieFormat =
  | "2D"
  | "3D"
  | "IMAX"
  | "IMAX 3D"
  | "4DX"
  | "Dolby Atmos"
  | "Dolby Cinema"
  | "ScreenX"
  | "70mm Film"
  | "ICE Theaters"
  | "Laser 4K"
  | "Standard"
  | string;

export type MovieLanguage =
  | "English"
  | "Hindi"
  | "Telugu"
  | "Tamil"
  | "Marathi"
  | "Kannada"
  | "Malayalam"
  | "Bengali"
  | "Japanese"
  | "Korean"
  | "Spanish"
  | "French"
  | "German"
  | string;

export type Genre =
  | "Action"
  | "Adventure"
  | "Sci-Fi"
  | "Drama"
  | "Thriller"
  | "Comedy"
  | "Horror"
  | "Romance"
  | "Animation"
  | "Fantasy"
  | "Biography"
  | "History"
  | "Crime"
  | "Mystery";

export type Certification = "U" | "UA" | "UA 13+" | "UA 16+" | "A" | "S" | "PG-13" | "R" | "PG" | string;

export type MovieStatus = "Now Showing" | "Upcoming" | "Special Screening" | "Archived" | "Coming Soon";

export interface CastMember {
  id: ID;
  name: string;
  role: string;
  avatar?: string;
}

export interface CrewMember {
  id: ID;
  name: string;
  role: "Director" | "Producer" | "Music Director" | "Cinematographer" | "Writer" | "Editor" | string;
}

export interface TrailerAsset {
  id: ID;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
}

export interface Movie {
  id: ID;
  slug: string;
  title: string;
  tagline?: string;
  synopsis?: string;
  description?: string;
  poster: string;
  banner: string;
  genre: (Genre | string)[];
  languages: (MovieLanguage | string)[];
  durationMinutes: number;
  runtime?: string;
  rating: number;
  certification: Certification;
  releaseDate: string;
  status?: MovieStatus;
  formats: MovieFormat[];
  director: string;
  cast: string[];
  castDetailed?: CastMember[];
  crewDetailed?: CrewMember[];
  trailer?: TrailerAsset;
  gallery?: MediaAsset[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isComingSoon?: boolean;
}
