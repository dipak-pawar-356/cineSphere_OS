/**
 * CineSphere OS — Common Core TypeScript Definitions
 */

export type ID = string;

export type EntityStatus = "Active" | "Inactive" | "Pending" | "Suspended" | "Archived" | "Draft";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface ContactInformation {
  phone: string;
  email: string;
  website?: string;
  supportEmail?: string;
}

export interface MediaAsset {
  id: ID;
  url: string;
  title?: string;
  category?: string;
  aspectRatio?: "2:3" | "16:9" | "1:1" | "2.39:1";
  altText?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SortConfiguration {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterOption<T = string> {
  label: string;
  value: T;
  count?: number;
}

export interface CityLocation {
  id: ID;
  name: string;
  state: string;
  theatreCount: number;
  screenCount: number;
  isPopular?: boolean;
}
