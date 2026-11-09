/**
 * ==============================================================================
 * CineSphere OS - Digital Ticket & QR Management Types
 * Phase 2 - Part 13
 * 
 * Strict enterprise separation of:
 * 1. Internal Database ID (UUID)
 * 2. Human-readable Booking Reference (e.g. BK-2027-000001)
 * 3. Human-readable Ticket Number (e.g. TK-2027-000001)
 * 4. Public Secure ID (Unguessable Crockford Base32 ULID / Cryptographic token)
 * ==============================================================================
 */

export type TicketStatus =
  | "ISSUED"
  | "ACTIVE"
  | "VALID"
  | "USED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED"
  | "VOIDED";

export type TicketGenerationStrategy = "PER_BOOKING" | "PER_SEAT";

/**
 * High-integrity QR Payload structured for rapid zero-delay verification
 * at auditorium gate terminals.
 */
export interface QRPayload {
  ticketSecureId: string;
  bookingSecureId: string;
  ticketNumber: string;
  theatreId: string;
  showId: string;
  seatNumbers: string[];
  issuedAt: string;
  version: string;
  signaturePlaceholder?: string;
}

export interface TicketPriceBreakdown {
  baseTicketPrice: number;
  convenienceFee: number;
  taxes: number;
  grandTotal: number;
}

/**
 * Enterprise Digital Ticket representation.
 * Serves as official cryptographic proof of admission.
 */
export interface DigitalTicket {
  id: string; // Internal UUID
  secureId: string; // Public unguessable ULID / token (used in URLs & QR payload)
  ticketNumber: string; // Human-readable (e.g. TK-2027-000001 or TK-2027-000001-01)
  bookingId: string; // Internal booking UUID
  bookingReference: string; // Human-readable (e.g. BK-2027-000001)
  bookingSeatId?: string | null;
  theatreId: string;
  theatreName: string;
  theatreAddress?: string;
  theatreCity?: string;
  theatreState?: string;
  hallId: string;
  hallName: string;
  screenNumber?: number | string;
  showId: string;
  showDate: string; // YYYY-MM-DD
  showTime: string; // e.g. "10:30 AM" or "18:45"
  movieId: string;
  movieTitle: string;
  moviePoster?: string;
  movieBanner?: string;
  format: string; // e.g. "IMAX Laser", "Dolby Atmos", "4DX"
  language: string; // e.g. "Hindi", "English"
  certificate: string; // e.g. "UA 16+", "A", "U"
  duration?: string; // e.g. "166 min" or "2h 46m"
  bookingStatus?: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
  paymentStatus?: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED";
  seatNumber: string; // e.g. "E10" or "E10, E11"
  seatNumbers: string[]; // e.g. ["E10", "E11"]
  seatCount: number;
  sectionName: string; // e.g. "VIP Club Recliner", "Executive", "Silver"
  totalAmount: number;
  convenienceFee: number;
  taxAmount: number;
  priceBreakdown: TicketPriceBreakdown;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  qrPayload: QRPayload;
  qrCodeUrl: string; // Dynamic QR image URL
  qrPlaceholder?: string;
  qrVersion: string;
  signature?: string;
  status: TicketStatus;
  strategy: TicketGenerationStrategy;
  issuedAt: string; // ISO 8601
  usedAt?: string | null; // ISO 8601
  cancelledAt?: string | null; // ISO 8601
  metadata?: Record<string, unknown>;
}

export interface GenerateTicketsInput {
  bookingId: string;
  strategy?: TicketGenerationStrategy; // default PER_BOOKING
  actorId?: string;
}

export interface GenerateTicketsResult {
  success: boolean;
  tickets: DigitalTicket[];
  error?: string;
}

export type TicketTimeFilter = "UPCOMING" | "PAST" | "TODAY" | "ALL";

export interface TicketFilterParams {
  query?: string;
  customerId?: string;
  theatreId?: string;
  movieId?: string;
  status?: TicketStatus | "ALL";
  timeFilter?: TicketTimeFilter;
  showDate?: string;
  sortBy?: "showTime_asc" | "showTime_desc" | "issuedAt_desc" | "issuedAt_asc";
  page?: number;
  limit?: number;
}

export interface TicketListResponse {
  tickets: DigitalTicket[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TicketAuditAction =
  | "TICKET_GENERATED"
  | "TICKET_VIEWED"
  | "TICKET_CANCELLED"
  | "TICKET_REFUNDED"
  | "TICKET_REISSUED"
  | "TICKET_VALIDATION_ATTEMPT";

export interface TicketAuditLog {
  id: string;
  ticketId: string;
  ticketSecureId: string;
  ticketNumber: string;
  bookingReference: string;
  action: TicketAuditAction;
  actor: {
    userId?: string;
    role: string;
    ip?: string;
    userAgent?: string;
  };
  timestamp: string;
  details: Record<string, unknown>;
}

