/**
 * ==============================================================================
 * CineSphere OS — Show & Auditorium Repository (Phase 2 – Part 16)
 * ==============================================================================
 * Data access layer for showtime programming, hall layouts, and seat inventories.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { THEATRE_SHOWS, THEATRE_HALLS } from "@/data";
import { CustomerShowDetailsResponse } from "@/types/customer-discovery.types";
import { getUnifiedCustomerShowDetails } from "@/lib/engine/customer-discovery-engine";

export interface ShowRecord {
  id: string;
  theatreId: string;
  hallId: string;
  movieId: string;
  movieTitle: string;
  showDate: string;
  startTime: string;
  endTime: string;
  language: string;
  experienceType: string;
  pricingProfileId?: string;
  status: string;
}

export class ShowRepository extends BaseRepository<ShowRecord> {
  protected entityName = "Show";

  async findById(showId: string): Promise<ShowRecord | null> {
    this.logQuery("findById", { showId });
    const found = THEATRE_SHOWS.find((s) => s.id === showId);
    if (!found) return null;

    return {
      id: found.id,
      theatreId: found.theatreId,
      hallId: found.hallId,
      movieId: found.movieId,
      movieTitle: found.movieTitle,
      showDate: found.showDate,
      startTime: found.startTime,
      endTime: found.endTime,
      language: found.language,
      experienceType: found.format,
      pricingProfileId: (found as unknown as { pricingProfileId?: string }).pricingProfileId,
      status: found.status,
    };
  }

  async findAll(filter?: Record<string, unknown>): Promise<ShowRecord[]> {
    this.logQuery("findAll", filter);
    let list: ShowRecord[] = THEATRE_SHOWS.map((s) => ({
      id: s.id,
      theatreId: s.theatreId,
      hallId: s.hallId,
      movieId: s.movieId,
      movieTitle: s.movieTitle,
      showDate: s.showDate,
      startTime: s.startTime,
      endTime: s.endTime,
      language: s.language,
      experienceType: s.format,
      pricingProfileId: (s as unknown as { pricingProfileId?: string }).pricingProfileId,
      status: s.status,
    }));

    if (filter?.theatreId) {
      list = list.filter((s) => s.theatreId === filter.theatreId);
    }
    if (filter?.showDate) {
      list = list.filter((s) => s.showDate === filter.showDate);
    }

    return list;
  }

  async create(data: Partial<ShowRecord>): Promise<ShowRecord> {
    const newRecord: ShowRecord = {
      id: data.id || `show-${Date.now()}`,
      theatreId: data.theatreId || "th-pun-001",
      hallId: data.hallId || "hall-01",
      movieId: data.movieId || "mov-01",
      movieTitle: data.movieTitle || "Untitled Movie",
      showDate: data.showDate || new Date().toISOString().split("T")[0],
      startTime: data.startTime || "18:00",
      endTime: data.endTime || "21:00",
      language: data.language || "Hindi",
      experienceType: data.experienceType || "STANDARD_2D",
      pricingProfileId: data.pricingProfileId,
      status: data.status || "OPEN",
    };
    return newRecord;
  }

  async update(id: string, data: Partial<ShowRecord>): Promise<ShowRecord | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    return { ...existing, ...data };
  }

  async delete(_id: string): Promise<boolean> {
    return true;
  }

  /**
   * Resolves the complete unified show snapshot for booking & discovery.
   */
  async getUnifiedShowDetails(showId: string): Promise<CustomerShowDetailsResponse | null> {
    this.logQuery("getUnifiedShowDetails", { showId });
    return getUnifiedCustomerShowDetails(showId);
  }

  /**
   * Resolves physical hall information.
   */
  async findHallById(hallId: string) {
    this.logQuery("findHallById", { hallId });
    return THEATRE_HALLS.find((h) => h.id === hallId) || null;
  }
}

export const showRepository = new ShowRepository();
