/**
 * ==============================================================================
 * CineSphere OS — Booking & Reservation Repository (Phase 2 – Part 16)
 * ==============================================================================
 * Data access layer for customer booking sessions, confirmed admissions, and
 * optimistic locking concurrency protection.
 * ==============================================================================
 */

import { BaseRepository } from "./base.repository";
import { BookingSession } from "@/types/booking-engine.types";
import { OptimisticLockResult } from "@/types/security-hardening.types";
import { getBookingSession, updateBookingSession } from "@/lib/engine/booking-engine";

export interface ConfirmedBookingRecord {
  id: string;
  referenceCode: string;
  theatreId: string;
  showId: string;
  hallId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  totalAmount: number;
  seats: string[];
  version: number; // Concurrency version
  createdAt: string;
  updatedAt: string;
}

// In-memory persistent datamart for confirmed bookings with version tracking
const confirmedBookingsStore = new Map<string, ConfirmedBookingRecord>();

// Pre-seed mock bookings with version: 1
const seedBookings: ConfirmedBookingRecord[] = [
  {
    id: "bk-202611-001",
    referenceCode: "CS-PUN-001-9281",
    theatreId: "th-pun-001",
    showId: "show-avatar-01",
    hallId: "hall-pun-01",
    customerId: "cust-001",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    customerPhone: "+91 98234 56789",
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    totalAmount: 944.0,
    seats: ["D14", "D15"],
    version: 1,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "bk-202611-002",
    referenceCode: "CS-PUN-001-9282",
    theatreId: "th-pun-001",
    showId: "show-avatar-02",
    hallId: "hall-pun-01",
    customerId: "cust-002",
    customerName: "Pooja Patel",
    customerEmail: "pooja.patel@example.com",
    customerPhone: "+91 98765 43210",
    bookingStatus: "CONFIRMED",
    paymentStatus: "PAID",
    totalAmount: 1416.0,
    seats: ["F8", "F9", "F10"],
    version: 1,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

for (const b of seedBookings) {
  confirmedBookingsStore.set(b.id, b);
}

export class BookingRepository extends BaseRepository<ConfirmedBookingRecord> {
  protected entityName = "Booking";

  async findById(id: string): Promise<ConfirmedBookingRecord | null> {
    this.logQuery("findById", { id });
    return confirmedBookingsStore.get(id) || null;
  }

  async findByReference(referenceCode: string): Promise<ConfirmedBookingRecord | null> {
    this.logQuery("findByReference", { referenceCode });
    for (const b of confirmedBookingsStore.values()) {
      if (b.referenceCode === referenceCode) return b;
    }
    return null;
  }

  async findAll(filter?: Record<string, unknown>): Promise<ConfirmedBookingRecord[]> {
    this.logQuery("findAll", filter);
    let list = Array.from(confirmedBookingsStore.values());
    if (filter?.theatreId) {
      list = list.filter((b) => b.theatreId === filter.theatreId);
    }
    if (filter?.customerId) {
      list = list.filter((b) => b.customerId === filter.customerId);
    }
    return list;
  }

  async create(data: Partial<ConfirmedBookingRecord>): Promise<ConfirmedBookingRecord> {
    const id = data.id || `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newRecord: ConfirmedBookingRecord = {
      id,
      referenceCode: data.referenceCode || `CS-REF-${Date.now()}`,
      theatreId: data.theatreId || "th-pun-001",
      showId: data.showId || "",
      hallId: data.hallId || "",
      customerId: data.customerId || "guest-user",
      customerName: data.customerName || "Anonymous Patron",
      customerEmail: data.customerEmail || "guest@example.com",
      customerPhone: data.customerPhone || "+91 90000 00000",
      bookingStatus: data.bookingStatus || "CONFIRMED",
      paymentStatus: data.paymentStatus || "PAID",
      totalAmount: data.totalAmount || 0,
      seats: data.seats || [],
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    confirmedBookingsStore.set(id, newRecord);
    return newRecord;
  }

  async update(id: string, data: Partial<ConfirmedBookingRecord>): Promise<ConfirmedBookingRecord | null> {
    const existing = confirmedBookingsStore.get(id);
    if (!existing) return null;
    const updated: ConfirmedBookingRecord = {
      ...existing,
      ...data,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    confirmedBookingsStore.set(id, updated);
    return updated;
  }

  /**
   * Optimistic Locking Update.
   * Atomically verifies that current version === expectedVersion before updating.
   * Prevents stale booking writes or concurrent race conditions.
   */
  async updateWithOptimisticLock(
    bookingId: string,
    expectedVersion: number,
    data: Partial<Omit<ConfirmedBookingRecord, "id" | "version">>
  ): Promise<OptimisticLockResult<ConfirmedBookingRecord>> {
    this.logQuery("updateWithOptimisticLock", { bookingId, expectedVersion });
    const existing = confirmedBookingsStore.get(bookingId);

    if (!existing) {
      return {
        success: false,
        error: `Booking '${bookingId}' not found`,
      };
    }

    // Detect version conflict
    if (existing.version !== expectedVersion) {
      return {
        success: false,
        conflict: true,
        currentVersion: existing.version,
        expectedVersion,
        error: `Conflict: Booking '${bookingId}' version is ${existing.version}, but client expected ${expectedVersion}`,
      };
    }

    // Apply update and advance version
    const nextVersion = existing.version + 1;
    const updated: ConfirmedBookingRecord = {
      ...existing,
      ...data,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
    };

    confirmedBookingsStore.set(bookingId, updated);

    return {
      success: true,
      data: updated,
      currentVersion: nextVersion,
    };
  }

  async delete(id: string): Promise<boolean> {
    return confirmedBookingsStore.delete(id);
  }

  // ----------------------------------------------------------------------------
  // Ephemeral Booking Session Lookups
  // ----------------------------------------------------------------------------

  async findSessionById(sessionId: string): Promise<BookingSession | null> {
    return getBookingSession(sessionId) || null;
  }

  async updateSession(
    sessionId: string,
    updates: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      extensionMinutes?: number;
    }
  ): Promise<BookingSession | null> {
    const res = updateBookingSession(sessionId, updates);
    return res.session || null;
  }
}

export const bookingRepository = new BookingRepository();
