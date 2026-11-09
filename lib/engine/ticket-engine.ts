/**
 * ==============================================================================
 * CineSphere OS - Ticket Management & Digital Ticket Engine
 * Phase 2 - Part 13
 * 
 * Architectural Flow:
 * Booking Session → Payment → Payment Verification → Booking Confirmation →
 * Ticket Generation → QR Generation → My Tickets → Future Check-in / Entry Validation
 * 
 * Separate Identifiers:
 * 1. Internal DB ID (UUID)
 * 2. Human-readable Booking Reference (e.g. BK-2027-000001)
 * 3. Human-readable Ticket Number (e.g. TK-2027-000001)
 * 4. Public Secure ID (Unguessable Crockford Base32 ULID / cryptographic token)
 * ==============================================================================
 */

import {
  DigitalTicket,
  GenerateTicketsInput,
  GenerateTicketsResult,
  QRPayload,
  TicketAuditAction,
  TicketAuditLog,
  TicketFilterParams,
  TicketGenerationStrategy,
  TicketListResponse,
  TicketStatus,
} from "@/types/ticket.types";
import { MULTI_TENANT_THEATRES } from "@/data/theatres/multi-tenant-theatres";
import { DYNAMIC_SHOWS } from "@/data/shows/dynamic-shows";
import { INITIAL_MASTER_MOVIES } from "@/lib/constants/initial-master-movies";
import { DUMMY_MOVIES } from "@/lib/constants/movies";

// Crockford's Base32 character set (excludes I, L, O, U to avoid human confusion)
const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Generates an unguessable 26-character Crockford Base32 ULID / cryptographic token.
 * 10 characters time prefix (millisecond precision) + 16 cryptographically random characters.
 * Example: "01JX9K8Z6N5WQ4R2T8M7P1A9BC"
 */
export function generateSecureId(timestamp: number = Date.now()): string {
  // 10 chars time component
  let timeStr = "";
  let t = timestamp;
  for (let i = 0; i < 10; i++) {
    timeStr = CROCKFORD_BASE32[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }

  // 16 chars random component
  let randomStr = "";
  for (let i = 0; i < 16; i++) {
    const rand = Math.floor(Math.random() * 32);
    randomStr += CROCKFORD_BASE32[rand];
  }

  return timeStr + randomStr;
}

/**
 * Strict validator for public unguessable secure IDs.
 * Rejects sequential numbers (e.g., "123", "1", "42"), UUIDs, or short strings.
 */
export function isValidSecureId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim().toUpperCase();
  // Must be 26 characters of Crockford Base32
  if (trimmed.length !== 26) return false;
  for (const char of trimmed) {
    if (!CROCKFORD_BASE32.includes(char)) return false;
  }
  return true;
}

let ticketSequenceCounter = 1000;
let bookingSequenceCounter = 5000;

/**
 * Generates a human-readable booking reference (e.g. BK-2027-005001).
 */
export function generateBookingNumber(year: number = new Date().getFullYear()): string {
  bookingSequenceCounter += 1;
  const seqStr = String(bookingSequenceCounter).padStart(6, "0");
  return `BK-${year}-${seqStr}`;
}

/**
 * Generates a human-readable ticket number (e.g. TK-2027-001001 or TK-2027-001001-01).
 */
export function generateTicketNumber(
  year: number = new Date().getFullYear(),
  subIndex?: number
): string {
  if (subIndex === undefined || subIndex === 1) {
    ticketSequenceCounter += 1;
  }
  const seqStr = String(ticketSequenceCounter).padStart(6, "0");
  if (subIndex !== undefined) {
    const subStr = String(subIndex).padStart(2, "0");
    return `TK-${year}-${seqStr}-${subStr}`;
  }
  return `TK-${year}-${seqStr}`;
}

/**
 * Computes a mock cryptographic HMAC/SHA-256 signature placeholder.
 */
export function generateSignaturePlaceholder(
  ticketSecureId: string,
  ticketNumber: string,
  showId: string,
  seatNumbers: string[]
): string {
  const content = `${ticketSecureId}:${ticketNumber}:${showId}:${seatNumbers.join(",")}`;
  // Simple deterministic hash simulation for HMAC signature verification placeholder
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `sig_v1_cinesphere_${hex}_${ticketSecureId.slice(0, 8)}`;
}

/**
 * Constructs the standard QR Payload structure for high-throughput auditorium verification.
 */
export function createQRPayload(params: {
  ticketSecureId: string;
  bookingSecureId: string;
  ticketNumber: string;
  theatreId: string;
  showId: string;
  seatNumbers: string[];
  issuedAt?: string;
  version?: string;
}): QRPayload {
  const issuedAt = params.issuedAt || new Date().toISOString();
  const version = params.version || "v1";
  const signaturePlaceholder = generateSignaturePlaceholder(
    params.ticketSecureId,
    params.ticketNumber,
    params.showId,
    params.seatNumbers
  );

  return {
    ticketSecureId: params.ticketSecureId,
    bookingSecureId: params.bookingSecureId,
    ticketNumber: params.ticketNumber,
    theatreId: params.theatreId,
    showId: params.showId,
    seatNumbers: params.seatNumbers,
    issuedAt,
    version,
    signaturePlaceholder,
  };
}

/**
 * Dynamically derives the QR Code image URL encoding the structured JSON payload.
 */
export function generateQRCodeUrl(payload: QRPayload): string {
  const jsonStr = JSON.stringify(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    jsonStr
  )}`;
}

// ------------------------------------------------------------------------------
// In-Memory Master Ticket Repository & Audit Store
// ------------------------------------------------------------------------------

interface BookingSourceRecord {
  id: string; // Booking UUID
  referenceCode: string; // BK-2027-...
  secureId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  theatreId: string;
  showId: string;
  hallId: string;
  seats: string[];
  amount: number;
  convenienceFee: number;
  taxes: number;
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  bookingStatus: "CONFIRMED" | "CANCELLED" | "EXPIRED";
  bookingDate: string;
}

const INITIAL_BOOKINGS: BookingSourceRecord[] = [
  {
    id: "bk-pun-uuid-001",
    referenceCode: "BK-2027-005001",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9AA",
    customerId: "cust-001",
    customerName: "Aarav Mehta",
    customerEmail: "aarav.mehta@gmail.com",
    customerPhone: "+91 98201 11223",
    theatreId: "th-pun-001",
    showId: "show-pun-001",
    hallId: "hall-1",
    seats: ["C10", "C11"],
    amount: 500,
    convenienceFee: 45,
    taxes: 8.1,
    totalAmount: 553.1,
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bk-pun-uuid-002",
    referenceCode: "BK-2027-005002",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9AB",
    customerId: "cust-001",
    customerName: "Aarav Mehta",
    customerEmail: "aarav.mehta@gmail.com",
    customerPhone: "+91 98201 11223",
    theatreId: "th-pun-001",
    showId: "show-pun-002",
    hallId: "hall-2",
    seats: ["B5", "B6"],
    amount: 600,
    convenienceFee: 50,
    taxes: 9.0,
    totalAmount: 659.0,
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bk-mum-uuid-003",
    referenceCode: "BK-2027-005003",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9AC",
    customerId: "cust-001",
    customerName: "Aarav Mehta",
    customerEmail: "aarav.mehta@gmail.com",
    customerPhone: "+91 98201 11223",
    theatreId: "th-mum-001",
    showId: "show-mum-001",
    hallId: "hall-mum-1",
    seats: ["A1"],
    amount: 350,
    convenienceFee: 30,
    taxes: 5.4,
    totalAmount: 385.4,
    paymentStatus: "REFUNDED",
    bookingStatus: "CANCELLED",
    bookingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
  {
    id: "bk-mum-uuid-004",
    referenceCode: "BK-2027-005004",
    secureId: "01JX9K8Z6N5WQ4R2T8M7P1A9AD",
    customerId: "cust-002",
    customerName: "Pooja Sharma",
    customerEmail: "pooja.sharma@gmail.com",
    customerPhone: "+91 98110 33445",
    theatreId: "th-mum-001",
    showId: "show-mum-001",
    hallId: "hall-mum-1",
    seats: ["D7", "D8"],
    amount: 700,
    convenienceFee: 60,
    taxes: 10.8,
    totalAmount: 770.8,
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    bookingDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split("T")[0],
  },
];

let bookingsRepository: BookingSourceRecord[] = [...INITIAL_BOOKINGS];
let ticketsRepository: DigitalTicket[] = [];
let ticketAuditRepository: TicketAuditLog[] = [];

/**
 * Resolves full metadata (Movie, Theatre, Hall) for a Show ID.
 */
function resolveShowContext(showId: string, theatreId?: string) {
  const dynamicShow = DYNAMIC_SHOWS.find((s) => s.id === showId);

  // Find theatre
  const targetTheatreId = theatreId || dynamicShow?.theatreId || "th-pun-001";
  const theatre = MULTI_TENANT_THEATRES.find((t) => t.id === targetTheatreId) || {
    id: targetTheatreId,
    name: "CineSphere Grand Cinemas",
    address: "Phoenix Marketcity, Viman Nagar",
    city: "Pune",
    state: "Maharashtra",
    halls: [],
  };

  const hall =
    theatre.halls?.find((h) => h.id === dynamicShow?.hallId) ||
    theatre.halls?.[0] || {
      id: "hall-1",
      name: "Hall 1 - IMAX with Laser",
      screenNumber: 1,
      screenType: "IMAX Laser",
    };

  // Find movie
  const movieId = dynamicShow?.movieId || "mov-001";
  const masterMovie = INITIAL_MASTER_MOVIES.find((m) => m.id === movieId);
  const fallbackMovie = DUMMY_MOVIES.find((m) => m.id === movieId);

  const movieTitle =
    masterMovie?.title ||
    dynamicShow?.movieTitle ||
    fallbackMovie?.title ||
    "Pushpa 2: The Rule";

  const moviePoster =
    masterMovie?.posterUrl ||
    fallbackMovie?.poster ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop";

  const movieBanner =
    masterMovie?.bannerUrl ||
    fallbackMovie?.banner ||
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop";

  const format =
    masterMovie?.formats?.[0] ||
    dynamicShow?.format ||
    hall.screenType ||
    "IMAX Laser";

  const language =
    masterMovie?.availableLanguages?.[0] ||
    dynamicShow?.language ||
    "Hindi";

  const certificate = masterMovie?.certificate || "UA 16+";
  const duration = masterMovie?.durationMinutes ? `${masterMovie.durationMinutes} min` : "166 min";

  return {
    theatre,
    hall,
    movieId,
    movieTitle,
    moviePoster,
    movieBanner,
    format,
    language,
    certificate,
    duration,
    showDate: dynamicShow?.showDate || "2027-01-15",
    showTime: dynamicShow?.startTime || "10:30 AM",
  };
}

/**
 * Seeds the initial in-memory tickets repository with realistic data.
 */
function seedInitialTickets(): void {
  ticketsRepository = [];
  ticketAuditRepository = [];

  // Ticket 1: Upcoming ticket for Aarav Mehta (Cust-001) in Pune
  const t1SecureId = "01JX9K8Z6N5WQ4R2T8M7P1A9BC";
  const b1 = INITIAL_BOOKINGS[0];
  const ctx1 = resolveShowContext(b1.showId, b1.theatreId);
  const t1Number = "TK-2027-001001";
  const t1QrPayload = createQRPayload({
    ticketSecureId: t1SecureId,
    bookingSecureId: b1.secureId,
    ticketNumber: t1Number,
    theatreId: b1.theatreId,
    showId: b1.showId,
    seatNumbers: b1.seats,
    issuedAt: "2027-01-10T10:00:00.000Z",
  });

  ticketsRepository.push({
    id: "tkt-pun-uuid-001",
    secureId: t1SecureId,
    ticketNumber: t1Number,
    bookingId: b1.id,
    bookingReference: b1.referenceCode,
    theatreId: b1.theatreId,
    theatreName: ctx1.theatre.name,
    theatreAddress: ctx1.theatre.address,
    theatreCity: ctx1.theatre.city,
    theatreState: ctx1.theatre.state,
    hallId: b1.hallId,
    hallName: ctx1.hall.name,
    screenNumber: ctx1.hall.screenNumber,
    showId: b1.showId,
    showDate: b1.bookingDate,
    showTime: ctx1.showTime,
    movieId: ctx1.movieId,
    movieTitle: ctx1.movieTitle,
    moviePoster: ctx1.moviePoster,
    movieBanner: ctx1.movieBanner,
    format: ctx1.format,
    language: ctx1.language,
    certificate: ctx1.certificate,
    duration: ctx1.duration,
    bookingStatus: b1.bookingStatus,
    paymentStatus: b1.paymentStatus,
    seatNumber: b1.seats.join(", "),
    seatNumbers: b1.seats,
    seatCount: b1.seats.length,
    sectionName: "VIP Club Recliner",
    totalAmount: b1.totalAmount,
    convenienceFee: b1.convenienceFee,
    taxAmount: b1.taxes,
    priceBreakdown: {
      baseTicketPrice: b1.amount,
      convenienceFee: b1.convenienceFee,
      taxes: b1.taxes,
      grandTotal: b1.totalAmount,
    },
    customerId: b1.customerId,
    customerName: b1.customerName,
    customerEmail: b1.customerEmail,
    customerPhone: b1.customerPhone,
    qrPayload: t1QrPayload,
    qrCodeUrl: generateQRCodeUrl(t1QrPayload),
    qrPlaceholder: JSON.stringify(t1QrPayload),
    qrVersion: "v1",
    signature: t1QrPayload.signaturePlaceholder,
    status: "ACTIVE",
    strategy: "PER_BOOKING",
    issuedAt: "2027-01-10T10:00:00.000Z",
  });

  // Ticket 2: Past ticket for Aarav Mehta (Cust-001) in Pune
  const t2SecureId = "01JX9K8Z6N5WQ4R2T8M7P1A9BD";
  const b2 = INITIAL_BOOKINGS[1];
  const ctx2 = resolveShowContext(b2.showId, b2.theatreId);
  const t2Number = "TK-2027-001002";
  const t2QrPayload = createQRPayload({
    ticketSecureId: t2SecureId,
    bookingSecureId: b2.secureId,
    ticketNumber: t2Number,
    theatreId: b2.theatreId,
    showId: b2.showId,
    seatNumbers: b2.seats,
    issuedAt: "2027-01-05T12:00:00.000Z",
  });

  ticketsRepository.push({
    id: "tkt-pun-uuid-002",
    secureId: t2SecureId,
    ticketNumber: t2Number,
    bookingId: b2.id,
    bookingReference: b2.referenceCode,
    theatreId: b2.theatreId,
    theatreName: ctx2.theatre.name,
    theatreAddress: ctx2.theatre.address,
    theatreCity: ctx2.theatre.city,
    theatreState: ctx2.theatre.state,
    hallId: b2.hallId,
    hallName: ctx2.hall.name,
    screenNumber: ctx2.hall.screenNumber,
    showId: b2.showId,
    showDate: b2.bookingDate,
    showTime: ctx2.showTime,
    movieId: ctx2.movieId,
    movieTitle: ctx2.movieTitle,
    moviePoster: ctx2.moviePoster,
    movieBanner: ctx2.movieBanner,
    format: ctx2.format,
    language: ctx2.language,
    certificate: ctx2.certificate,
    duration: ctx2.duration,
    bookingStatus: b2.bookingStatus,
    paymentStatus: b2.paymentStatus,
    seatNumber: b2.seats.join(", "),
    seatNumbers: b2.seats,
    seatCount: b2.seats.length,
    sectionName: "Dolby Atmos Prime",
    totalAmount: b2.totalAmount,
    convenienceFee: b2.convenienceFee,
    taxAmount: b2.taxes,
    priceBreakdown: {
      baseTicketPrice: b2.amount,
      convenienceFee: b2.convenienceFee,
      taxes: b2.taxes,
      grandTotal: b2.totalAmount,
    },
    customerId: b2.customerId,
    customerName: b2.customerName,
    customerEmail: b2.customerEmail,
    customerPhone: b2.customerPhone,
    qrPayload: t2QrPayload,
    qrCodeUrl: generateQRCodeUrl(t2QrPayload),
    qrPlaceholder: JSON.stringify(t2QrPayload),
    qrVersion: "v1",
    signature: t2QrPayload.signaturePlaceholder,
    status: "USED",
    strategy: "PER_BOOKING",
    issuedAt: "2027-01-05T12:00:00.000Z",
    usedAt: "2027-01-05T15:30:00.000Z",
  });

  // Ticket 3: Cancelled / Refunded ticket for Aarav Mehta (Cust-001) in Mumbai
  const t3SecureId = "01JX9K8Z6N5WQ4R2T8M7P1A9BE";
  const b3 = INITIAL_BOOKINGS[2];
  const ctx3 = resolveShowContext(b3.showId, b3.theatreId);
  const t3Number = "TK-2027-001003";
  const t3QrPayload = createQRPayload({
    ticketSecureId: t3SecureId,
    bookingSecureId: b3.secureId,
    ticketNumber: t3Number,
    theatreId: b3.theatreId,
    showId: b3.showId,
    seatNumbers: b3.seats,
    issuedAt: "2027-01-07T08:00:00.000Z",
  });

  ticketsRepository.push({
    id: "tkt-mum-uuid-003",
    secureId: t3SecureId,
    ticketNumber: t3Number,
    bookingId: b3.id,
    bookingReference: b3.referenceCode,
    theatreId: b3.theatreId,
    theatreName: ctx3.theatre.name,
    theatreAddress: ctx3.theatre.address,
    theatreCity: ctx3.theatre.city,
    theatreState: ctx3.theatre.state,
    hallId: b3.hallId,
    hallName: ctx3.hall.name,
    screenNumber: ctx3.hall.screenNumber,
    showId: b3.showId,
    showDate: b3.bookingDate,
    showTime: ctx3.showTime,
    movieId: ctx3.movieId,
    movieTitle: ctx3.movieTitle,
    moviePoster: ctx3.moviePoster,
    movieBanner: ctx3.movieBanner,
    format: ctx3.format,
    language: ctx3.language,
    certificate: ctx3.certificate,
    duration: ctx3.duration,
    bookingStatus: b3.bookingStatus,
    paymentStatus: b3.paymentStatus,
    seatNumber: b3.seats.join(", "),
    seatNumbers: b3.seats,
    seatCount: b3.seats.length,
    sectionName: "Executive Standard",
    totalAmount: b3.totalAmount,
    convenienceFee: b3.convenienceFee,
    taxAmount: b3.taxes,
    priceBreakdown: {
      baseTicketPrice: b3.amount,
      convenienceFee: b3.convenienceFee,
      taxes: b3.taxes,
      grandTotal: b3.totalAmount,
    },
    customerId: b3.customerId,
    customerName: b3.customerName,
    customerEmail: b3.customerEmail,
    customerPhone: b3.customerPhone,
    qrPayload: t3QrPayload,
    qrCodeUrl: generateQRCodeUrl(t3QrPayload),
    qrPlaceholder: JSON.stringify(t3QrPayload),
    qrVersion: "v1",
    signature: t3QrPayload.signaturePlaceholder,
    status: "CANCELLED",
    strategy: "PER_BOOKING",
    issuedAt: "2027-01-07T08:00:00.000Z",
    cancelledAt: "2027-01-08T10:00:00.000Z",
  });

  // Ticket 4: Upcoming ticket for Pooja Sharma (Cust-002) in Mumbai
  const t4SecureId = "01JX9K8Z6N5WQ4R2T8M7P1A9BF";
  const b4 = INITIAL_BOOKINGS[3];
  const ctx4 = resolveShowContext(b4.showId, b4.theatreId);
  const t4Number = "TK-2027-001004";
  const t4QrPayload = createQRPayload({
    ticketSecureId: t4SecureId,
    bookingSecureId: b4.secureId,
    ticketNumber: t4Number,
    theatreId: b4.theatreId,
    showId: b4.showId,
    seatNumbers: b4.seats,
    issuedAt: "2027-01-11T14:00:00.000Z",
  });

  ticketsRepository.push({
    id: "tkt-mum-uuid-004",
    secureId: t4SecureId,
    ticketNumber: t4Number,
    bookingId: b4.id,
    bookingReference: b4.referenceCode,
    theatreId: b4.theatreId,
    theatreName: ctx4.theatre.name,
    theatreAddress: ctx4.theatre.address,
    theatreCity: ctx4.theatre.city,
    theatreState: ctx4.theatre.state,
    hallId: b4.hallId,
    hallName: ctx4.hall.name,
    screenNumber: ctx4.hall.screenNumber,
    showId: b4.showId,
    showDate: b4.bookingDate,
    showTime: ctx4.showTime,
    movieId: ctx4.movieId,
    movieTitle: ctx4.movieTitle,
    moviePoster: ctx4.moviePoster,
    movieBanner: ctx4.movieBanner,
    format: ctx4.format,
    language: ctx4.language,
    certificate: ctx4.certificate,
    duration: ctx4.duration,
    bookingStatus: b4.bookingStatus,
    paymentStatus: b4.paymentStatus,
    seatNumber: b4.seats.join(", "),
    seatNumbers: b4.seats,
    seatCount: b4.seats.length,
    sectionName: "VIP Laser Lounge",
    totalAmount: b4.totalAmount,
    convenienceFee: b4.convenienceFee,
    taxAmount: b4.taxes,
    priceBreakdown: {
      baseTicketPrice: b4.amount,
      convenienceFee: b4.convenienceFee,
      taxes: b4.taxes,
      grandTotal: b4.totalAmount,
    },
    customerId: b4.customerId,
    customerName: b4.customerName,
    customerEmail: b4.customerEmail,
    customerPhone: b4.customerPhone,
    qrPayload: t4QrPayload,
    qrCodeUrl: generateQRCodeUrl(t4QrPayload),
    qrPlaceholder: JSON.stringify(t4QrPayload),
    qrVersion: "v1",
    signature: t4QrPayload.signaturePlaceholder,
    status: "ACTIVE",
    strategy: "PER_BOOKING",
    issuedAt: "2027-01-11T14:00:00.000Z",
  });

  // Seed initial audit entries
  ticketAuditRepository.push({
    id: "audit-tkt-001",
    ticketId: "tkt-pun-uuid-001",
    ticketSecureId: t1SecureId,
    ticketNumber: t1Number,
    bookingReference: b1.referenceCode,
    action: "TICKET_GENERATED",
    actor: { userId: "system", role: "BOOKING_ENGINE" },
    timestamp: "2027-01-10T10:00:01.000Z",
    details: { strategy: "PER_BOOKING", seatCount: 2 },
  });
}

// Automatically seed store upon module initialization
seedInitialTickets();

/**
 * Resets the in-memory ticket store back to initial clean state.
 */
export function resetTicketEngineStore(): void {
  bookingsRepository = [...INITIAL_BOOKINGS];
  ticketSequenceCounter = 1000;
  bookingSequenceCounter = 5000;
  seedInitialTickets();
}

/**
 * Records an immutable audit log entry for ticket operations.
 */
function recordTicketAudit(params: {
  ticketId: string;
  ticketSecureId: string;
  ticketNumber: string;
  bookingReference: string;
  action: TicketAuditAction;
  actor?: { userId?: string; role: string; ip?: string; userAgent?: string };
  details?: Record<string, unknown>;
}): TicketAuditLog {
  const auditEntry: TicketAuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    ticketId: params.ticketId,
    ticketSecureId: params.ticketSecureId,
    ticketNumber: params.ticketNumber,
    bookingReference: params.bookingReference,
    action: params.action,
    actor: params.actor || { role: "SYSTEM" },
    timestamp: new Date().toISOString(),
    details: params.details || {},
  };
  ticketAuditRepository.unshift(auditEntry);
  return auditEntry;
}

// ------------------------------------------------------------------------------
// Core Ticket Engine APIs
// ------------------------------------------------------------------------------

/**
 * Generates digital tickets strictly after payment verification and booking confirmation.
 * Enforces the architectural invariant:
 * Booking Session → Payment → Payment Verification → Booking Confirmation → Ticket Generation
 */
export function generateTicketsForBooking(
  input: GenerateTicketsInput
): GenerateTicketsResult {
  const booking = bookingsRepository.find((b) => b.id === input.bookingId);

  if (!booking) {
    return {
      success: false,
      tickets: [],
      error: `Booking '${input.bookingId}' not found. Cannot generate tickets without an existing booking record.`,
    };
  }

  // Strict Enterprise Invariant 1: Payment Verification Check
  if (booking.paymentStatus !== "PAID") {
    return {
      success: false,
      tickets: [],
      error: `Payment is not confirmed (Status: ${booking.paymentStatus}). Tickets cannot be issued before payment verification.`,
    };
  }

  // Strict Enterprise Invariant 2: Booking Confirmation Check
  if (booking.bookingStatus !== "CONFIRMED") {
    return {
      success: false,
      tickets: [],
      error: `Booking is not confirmed (Status: ${booking.bookingStatus}). Tickets can only be generated for confirmed bookings.`,
    };
  }

  // Idempotency check: If tickets already exist for this booking, return existing tickets
  const existingTickets = ticketsRepository.filter(
    (t) => t.bookingId === booking.id && t.status !== "CANCELLED"
  );
  if (existingTickets.length > 0) {
    return {
      success: true,
      tickets: existingTickets,
    };
  }

  const strategy: TicketGenerationStrategy = input.strategy || "PER_BOOKING";
  const ctx = resolveShowContext(booking.showId, booking.theatreId);
  const now = new Date().toISOString();
  const generatedTickets: DigitalTicket[] = [];

  if (strategy === "PER_BOOKING") {
    // Strategy A: 1 Ticket covering all seats
    const secureId = generateSecureId();
    const ticketNumber = generateTicketNumber();
    const qrPayload = createQRPayload({
      ticketSecureId: secureId,
      bookingSecureId: booking.secureId,
      ticketNumber,
      theatreId: booking.theatreId,
      showId: booking.showId,
      seatNumbers: booking.seats,
      issuedAt: now,
    });

    const ticket: DigitalTicket = {
      id: `tkt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      secureId,
      ticketNumber,
      bookingId: booking.id,
      bookingReference: booking.referenceCode,
      theatreId: booking.theatreId,
      theatreName: ctx.theatre.name,
      theatreAddress: ctx.theatre.address,
      theatreCity: ctx.theatre.city,
      theatreState: ctx.theatre.state,
      hallId: booking.hallId,
      hallName: ctx.hall.name,
      screenNumber: ctx.hall.screenNumber,
      showId: booking.showId,
      showDate: booking.bookingDate,
      showTime: ctx.showTime,
      movieId: ctx.movieId,
      movieTitle: ctx.movieTitle,
      moviePoster: ctx.moviePoster,
      movieBanner: ctx.movieBanner,
      format: ctx.format,
      language: ctx.language,
      certificate: ctx.certificate,
      duration: ctx.duration,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      seatNumber: booking.seats.join(", "),
      seatNumbers: booking.seats,
      seatCount: booking.seats.length,
      sectionName: "Reserved Premium",
      totalAmount: booking.totalAmount,
      convenienceFee: booking.convenienceFee,
      taxAmount: booking.taxes,
      priceBreakdown: {
        baseTicketPrice: booking.amount,
        convenienceFee: booking.convenienceFee,
        taxes: booking.taxes,
        grandTotal: booking.totalAmount,
      },
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      qrPayload,
      qrCodeUrl: generateQRCodeUrl(qrPayload),
      qrPlaceholder: JSON.stringify(qrPayload),
      qrVersion: "v1",
      signature: qrPayload.signaturePlaceholder,
      status: "ACTIVE",
      strategy: "PER_BOOKING",
      issuedAt: now,
    };

    ticketsRepository.unshift(ticket);
    generatedTickets.push(ticket);

    recordTicketAudit({
      ticketId: ticket.id,
      ticketSecureId: ticket.secureId,
      ticketNumber: ticket.ticketNumber,
      bookingReference: ticket.bookingReference,
      action: "TICKET_GENERATED",
      actor: { userId: input.actorId || "system", role: "TICKET_ENGINE" },
      details: { strategy, seats: booking.seats },
    });
  } else {
    // Strategy B: 1 Ticket per seat
    const perSeatBase = booking.amount / Math.max(booking.seats.length, 1);
    const perSeatFee = booking.convenienceFee / Math.max(booking.seats.length, 1);
    const perSeatTax = booking.taxes / Math.max(booking.seats.length, 1);
    const perSeatTotal = booking.totalAmount / Math.max(booking.seats.length, 1);

    booking.seats.forEach((seat, idx) => {
      const secureId = generateSecureId();
      const ticketNumber = generateTicketNumber(undefined, idx + 1);
      const qrPayload = createQRPayload({
        ticketSecureId: secureId,
        bookingSecureId: booking.secureId,
        ticketNumber,
        theatreId: booking.theatreId,
        showId: booking.showId,
        seatNumbers: [seat],
        issuedAt: now,
      });

      const ticket: DigitalTicket = {
        id: `tkt-${Date.now()}-${idx + 1}`,
        secureId,
        ticketNumber,
        bookingId: booking.id,
        bookingReference: booking.referenceCode,
        theatreId: booking.theatreId,
        theatreName: ctx.theatre.name,
        theatreAddress: ctx.theatre.address,
        theatreCity: ctx.theatre.city,
        theatreState: ctx.theatre.state,
        hallId: booking.hallId,
        hallName: ctx.hall.name,
        screenNumber: ctx.hall.screenNumber,
        showId: booking.showId,
        showDate: booking.bookingDate,
        showTime: ctx.showTime,
        movieId: ctx.movieId,
        movieTitle: ctx.movieTitle,
        moviePoster: ctx.moviePoster,
        movieBanner: ctx.movieBanner,
        format: ctx.format,
        language: ctx.language,
        certificate: ctx.certificate,
        duration: ctx.duration,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        seatNumber: seat,
        seatNumbers: [seat],
        seatCount: 1,
        sectionName: "Individual Seat Pass",
        totalAmount: Number(perSeatTotal.toFixed(2)),
        convenienceFee: Number(perSeatFee.toFixed(2)),
        taxAmount: Number(perSeatTax.toFixed(2)),
        priceBreakdown: {
          baseTicketPrice: Number(perSeatBase.toFixed(2)),
          convenienceFee: Number(perSeatFee.toFixed(2)),
          taxes: Number(perSeatTax.toFixed(2)),
          grandTotal: Number(perSeatTotal.toFixed(2)),
        },
        customerId: booking.customerId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        qrPayload,
        qrCodeUrl: generateQRCodeUrl(qrPayload),
        qrPlaceholder: JSON.stringify(qrPayload),
        qrVersion: "v1",
        signature: qrPayload.signaturePlaceholder,
        status: "ACTIVE",
        strategy: "PER_SEAT",
        issuedAt: now,
      };

      ticketsRepository.unshift(ticket);
      generatedTickets.push(ticket);

      recordTicketAudit({
        ticketId: ticket.id,
        ticketSecureId: ticket.secureId,
        ticketNumber: ticket.ticketNumber,
        bookingReference: ticket.bookingReference,
        action: "TICKET_GENERATED",
        actor: { userId: input.actorId || "system", role: "TICKET_ENGINE" },
        details: { strategy, seatIndex: idx + 1, seat },
      });
    });
  }

  return {
    success: true,
    tickets: generatedTickets,
  };
}

/**
 * Registers an arbitrary confirmed booking into the engine's store.
 * Allows custom test flows and dynamic booking integration.
 */
export function registerBookingRecord(record: BookingSourceRecord): void {
  const existingIdx = bookingsRepository.findIndex((b) => b.id === record.id);
  if (existingIdx >= 0) {
    bookingsRepository[existingIdx] = record;
  } else {
    bookingsRepository.unshift(record);
  }
}

/**
 * Retrieves a digital ticket by its public unguessable Secure ID.
 * Strict URL security: Rejects sequential IDs (e.g. /tickets/123).
 */
export function getTicketBySecureId(
  secureId: string,
  actor?: { userId?: string; role: string; ip?: string; userAgent?: string }
): DigitalTicket | null {
  if (!secureId || !isValidSecureId(secureId)) {
    return null;
  }

  const ticket = ticketsRepository.find(
    (t) => t.secureId.toUpperCase() === secureId.toUpperCase()
  );

  if (ticket) {
    recordTicketAudit({
      ticketId: ticket.id,
      ticketSecureId: ticket.secureId,
      ticketNumber: ticket.ticketNumber,
      bookingReference: ticket.bookingReference,
      action: "TICKET_VIEWED",
      actor: actor || { role: "PUBLIC_GUEST" },
      details: { urlAccess: true },
    });
  }

  return ticket || null;
}

/**
 * Internal lookup by UUID.
 */
export function getTicketById(ticketId: string): DigitalTicket | null {
  return ticketsRepository.find((t) => t.id === ticketId) || null;
}

/**
 * Customer "My Tickets" retrieval with strict tenant isolation.
 * A customer can ONLY view tickets issued to their own customerId.
 */
export function getCustomerTickets(
  customerId: string,
  filters: TicketFilterParams = {}
): TicketListResponse {
  if (!customerId) {
    return { tickets: [], totalCount: 0, page: 1, limit: 10, totalPages: 0 };
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  let filtered = ticketsRepository.filter((t) => t.customerId === customerId);

  // Time filter
  if (filters.timeFilter && filters.timeFilter !== "ALL") {
    if (filters.timeFilter === "UPCOMING") {
      filtered = filtered.filter(
        (t) => t.showDate >= todayStr && t.status !== "CANCELLED" && t.status !== "REFUNDED"
      );
    } else if (filters.timeFilter === "PAST") {
      filtered = filtered.filter(
        (t) => t.showDate < todayStr || t.status === "USED" || t.status === "EXPIRED"
      );
    } else if (filters.timeFilter === "TODAY") {
      filtered = filtered.filter((t) => t.showDate === todayStr);
    }
  }

  // Status filter
  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  // Theatre filter
  if (filters.theatreId) {
    filtered = filtered.filter((t) => t.theatreId === filters.theatreId);
  }

  // Movie filter
  if (filters.movieId) {
    filtered = filtered.filter((t) => t.movieId === filters.movieId);
  }

  // Date filter
  if (filters.showDate) {
    filtered = filtered.filter((t) => t.showDate === filters.showDate);
  }

  // Text search query
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.movieTitle.toLowerCase().includes(q) ||
        t.theatreName.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.bookingReference.toLowerCase().includes(q) ||
        t.seatNumber.toLowerCase().includes(q)
    );
  }

  // Sorting
  const sortBy = filters.sortBy || "showTime_desc";
  filtered.sort((a, b) => {
    if (sortBy === "showTime_asc") {
      return a.showDate.localeCompare(b.showDate);
    }
    if (sortBy === "showTime_desc") {
      return b.showDate.localeCompare(a.showDate);
    }
    if (sortBy === "issuedAt_asc") {
      return a.issuedAt.localeCompare(b.issuedAt);
    }
    return b.issuedAt.localeCompare(a.issuedAt);
  });

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 10);
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    tickets: paginated,
    totalCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Theatre Admin ticket list with strict tenant isolation.
 * Theatre admins can view only tickets issued for their theatreId.
 * Strictly read-only; no modifications permitted.
 */
export function getTheatreTickets(
  theatreId: string,
  filters: TicketFilterParams = {}
): TicketListResponse {
  if (!theatreId) {
    return { tickets: [], totalCount: 0, page: 1, limit: 10, totalPages: 0 };
  }

  let filtered = ticketsRepository.filter((t) => t.theatreId === theatreId);

  // Status filter
  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  // Movie filter
  if (filters.movieId) {
    filtered = filtered.filter((t) => t.movieId === filters.movieId);
  }

  // Text search query
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.movieTitle.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.bookingReference.toLowerCase().includes(q) ||
        t.seatNumber.toLowerCase().includes(q)
    );
  }

  // Sorting
  filtered.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 15);
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    tickets: paginated,
    totalCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Platform-wide ticket search (Super Admin visibility).
 */
export function searchTickets(filters: TicketFilterParams = {}): TicketListResponse {
  let filtered = [...ticketsRepository];

  if (filters.customerId) {
    filtered = filtered.filter((t) => t.customerId === filters.customerId);
  }

  if (filters.theatreId) {
    filtered = filtered.filter((t) => t.theatreId === filters.theatreId);
  }

  if (filters.movieId) {
    filtered = filtered.filter((t) => t.movieId === filters.movieId);
  }

  if (filters.status && filters.status !== "ALL") {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.movieTitle.toLowerCase().includes(q) ||
        t.theatreName.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerEmail.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.bookingReference.toLowerCase().includes(q) ||
        t.seatNumber.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, filters.limit || 20);
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    tickets: paginated,
    totalCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Cancels a ticket and invalidates its dynamic QR entry pass.
 */
export function cancelTicket(
  ticketIdOrSecureId: string,
  reason: string = "Customer cancellation / refund",
  actor?: { userId?: string; role: string }
): { success: boolean; ticket?: DigitalTicket; error?: string } {
  const ticket = ticketsRepository.find(
    (t) =>
      t.id === ticketIdOrSecureId ||
      t.secureId.toUpperCase() === ticketIdOrSecureId.toUpperCase()
  );

  if (!ticket) {
    return { success: false, error: "Ticket not found." };
  }

  if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
    return { success: false, error: "Ticket is already cancelled." };
  }

  if (ticket.status === "USED") {
    return {
      success: false,
      error: "Ticket has already been used for auditorium admission and cannot be cancelled.",
    };
  }

  ticket.status = "CANCELLED";
  ticket.cancelledAt = new Date().toISOString();

  recordTicketAudit({
    ticketId: ticket.id,
    ticketSecureId: ticket.secureId,
    ticketNumber: ticket.ticketNumber,
    bookingReference: ticket.bookingReference,
    action: "TICKET_CANCELLED",
    actor: actor || { role: "ADMIN" },
    details: { reason },
  });

  return { success: true, ticket };
}

/**
 * Retrieves audit logs for a specific ticket or all tickets.
 */
export function getTicketAuditLogs(ticketIdOrSecureId?: string): TicketAuditLog[] {
  if (!ticketIdOrSecureId) {
    return [...ticketAuditRepository];
  }
  return ticketAuditRepository.filter(
    (a) =>
      a.ticketId === ticketIdOrSecureId ||
      a.ticketSecureId.toUpperCase() === ticketIdOrSecureId.toUpperCase()
  );
}
