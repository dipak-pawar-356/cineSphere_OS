/**
 * ==============================================================================
 * CineSphere OS — Booking Domain Service (Phase 2 – Part 16)
 * ==============================================================================
 * Business rules engine for customer reservations, optimistic locking updates,
 * concurrency conflict detection, and retry orchestration.
 * Decoupled from web frameworks and database drivers.
 * ==============================================================================
 */

import { bookingRepository, ConfirmedBookingRecord } from "@/lib/repositories/booking.repository";
import { tenantService } from "./tenant.service";
import { SecurityActorContext } from "@/types/security-hardening.types";
import { ConflictError, NotFoundError } from "@/lib/errors/app-error";
import { recordSecurityEvent } from "@/lib/security/security-events";
import { createLogger } from "@/lib/observability/structured-logger";

const logger = createLogger("BookingDomainService");

export class BookingDomainService {
  /**
   * Updates booking status with strict Optimistic Locking concurrency protection.
   * If another concurrent request advanced the record's version, this operation rejects
   * with a typed ConflictError and records an audit anomaly.
   */
  async updateBookingStatusWithLock(
    bookingId: string,
    expectedVersion: number,
    newStatus: ConfirmedBookingRecord["bookingStatus"],
    actor: SecurityActorContext
  ): Promise<ConfirmedBookingRecord> {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking", bookingId, actor.correlationId);
    }

    // Tenant Isolation Check
    await tenantService.assertTenantAccess(actor, booking.theatreId);

    // Attempt atomic versioned update
    const result = await bookingRepository.updateWithOptimisticLock(bookingId, expectedVersion, {
      bookingStatus: newStatus,
    });

    if (!result.success || result.conflict) {
      // Record booking concurrency conflict
      recordSecurityEvent({
        eventType: "BOOKING_CONFLICT",
        severity: "MEDIUM",
        actorId: actor.userId,
        actorRole: actor.role,
        theatreId: booking.theatreId,
        details: `Optimistic locking collision on Booking '${bookingId}'. Current version=${result.currentVersion}, Expected=${result.expectedVersion}`,
        metadata: {
          bookingId,
          currentVersion: result.currentVersion,
          expectedVersion,
          correlationId: actor.correlationId,
        },
      });

      throw new ConflictError(
        `Booking '${bookingId}' was updated by another process. Please refresh and retry.`,
        {
          entity: "Booking",
          currentVersion: result.currentVersion,
          expectedVersion,
          correlationId: actor.correlationId,
        }
      );
    }

    logger.info("BOOKING", `Booking '${bookingId}' updated to '${newStatus}' (v${result.currentVersion})`, {
      correlationId: actor.correlationId,
      userId: actor.userId,
      theatreId: booking.theatreId,
      metadata: { bookingId, previousVersion: expectedVersion, nextVersion: result.currentVersion },
    });

    return result.data!;
  }

  /**
   * Optimistic Locking Retry Runner.
   * Automatically retries an idempotent mutation with exponential jitter backoff
   * when encountering transient optimistic concurrency collisions.
   */
  async executeWithOptimisticRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 50
  ): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (err) {
        attempt++;
        if (err instanceof ConflictError && attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 20;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
    throw new ConflictError("Max concurrency retry attempts exhausted.");
  }
}

export const bookingDomainService = new BookingDomainService();

