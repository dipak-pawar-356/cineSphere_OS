/**
 * ==============================================================================
 * CineSphere OS — Theatre & Payment Config Repository (Phase 2 – Part 16)
 * ==============================================================================
 * Data access layer for multi-tenant multiplex profiles and independent payment rails.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { MOCK_THEATRES } from "@/data";
import { PaymentConfiguration } from "@/types/payment-config.types";
import {
  getTheatrePaymentConfigurations,
  getTheatreActivePaymentConfiguration,
} from "@/lib/engine/payment-config-engine";

export interface TheatreRecord {
  id: string;
  name: string;
  slug: string;
  city: string;
  isActive: boolean;
  upiId?: string;
  merchantName?: string;
}

export class TheatreRepository extends BaseRepository<TheatreRecord> {
  protected entityName = "Theatre";

  async findById(theatreId: string): Promise<TheatreRecord | null> {
    this.logQuery("findById", { theatreId });
    const found = MOCK_THEATRES.find((t) => t.id === theatreId);
    if (!found) return null;

    return {
      id: found.id,
      name: found.name,
      slug: found.slug,
      city: found.city,
      isActive: found.status === "Active",
      upiId: found.upiDetails?.upiId,
      merchantName: found.upiDetails?.merchantName,
    };
  }

  async findAll(): Promise<TheatreRecord[]> {
    return MOCK_THEATRES.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      city: t.city,
      isActive: t.status === "Active",
      upiId: t.upiDetails?.upiId,
      merchantName: t.upiDetails?.merchantName,
    }));
  }

  async create(data: Partial<TheatreRecord>): Promise<TheatreRecord> {
    const newRecord: TheatreRecord = {
      id: data.id || `th-${Date.now()}`,
      name: data.name || "Untitled Cinema",
      slug: data.slug || "untitled-cinema",
      city: data.city || "Pune",
      isActive: data.isActive ?? true,
    };
    return newRecord;
  }

  async update(id: string, data: Partial<TheatreRecord>): Promise<TheatreRecord | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    return { ...existing, ...data };
  }

  async delete(_id: string): Promise<boolean> {
    return true;
  }

  /**
   * Retrieves all payment configurations for a theatre tenant.
   */
  async findPaymentConfigs(theatreId: string): Promise<PaymentConfiguration[]> {
    this.logQuery("findPaymentConfigs", { theatreId });
    return getTheatrePaymentConfigurations(theatreId);
  }

  /**
   * Resolves the primary active payment configuration for a theatre tenant.
   */
  async findActivePaymentConfig(theatreId: string): Promise<PaymentConfiguration | null> {
    this.logQuery("findActivePaymentConfig", { theatreId });
    return getTheatreActivePaymentConfiguration(theatreId);
  }
}

export const theatreRepository = new TheatreRepository();
