/**
 * ==============================================================================
 * CineSphere OS - Multi-Tenant Payment Configuration & Architecture Types
 * Phase 2 - Part 12
 * 
 * Strict separation of Payment Configuration (1 Theatre to N Configurations)
 * from Payment Transactions. Dynamic QR payload derivation based on NPCI standards.
 * ==============================================================================
 */

export type PaymentProvider =
  | "UPI"
  | "RAZORPAY"
  | "PHONEPE"
  | "PAYTM"
  | "STRIPE"
  | "CASH_COUNTER"
  | "CORPORATE_BILLING"
  | "GIFT_CARD"
  | "FUTURE_PROVIDER";

export type PaymentProviderStatus =
  | "DRAFT"
  | "ACTIVE"
  | "INACTIVE"
  | "DISABLED"
  | "ARCHIVED";

export type PaymentTransactionStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "EXPIRED";

export type PaymentRailMethod =
  | "UPI"
  | "CARDS"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "NET_BANKING"
  | "WALLET"
  | "EMI"
  | "CASH_COUNTER"
  | "CASH"
  | "CORPORATE_BILLING"
  | "GIFT_VOUCHER"
  | "MEMBERSHIP_WALLET";

export type SettlementPeriodType =
  | "T+0 Instant"
  | "T+1 Daily"
  | "Weekly"
  | "T_PLUS_0_INSTANT"
  | "T_PLUS_1_DAILY"
  | "WEEKLY_CONSOLIDATED";

/**
 * Enterprise Payment Configuration Entity
 * Represents one payment rail/provider config for a theatre.
 * A theatre can have multiple configurations (e.g., Primary UPI, Concessions UPI, Razorpay PG).
 */
export interface PaymentConfiguration {
  id: string;
  theatreId: string;
  businessName: string;
  merchantName: string;
  merchantDisplayName: string;
  provider: PaymentProvider;
  upiId: string;
  merchantCode: string; // ISO 18245 Merchant Category Code (MCC). Default: "7832" (Motion Picture Theatres)
  configVersion: number;
  qrPlaceholder?: string;
  isPrimary: boolean;
  status: PaymentProviderStatus;
  bankName: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  settlementPeriod: SettlementPeriodType | string;
  description?: string;
  credentials?: {
    keyIdMasked?: string;
    merchantIdMasked?: string;
    midMasked?: string;
    publishableKeyMasked?: string;
    webhookUrl?: string;
    [key: string]: unknown;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input DTO for creating a payment configuration
 */
export interface CreatePaymentConfigurationInput {
  theatreId: string;
  businessName: string;
  merchantName: string;
  merchantDisplayName?: string;
  provider: PaymentProvider;
  upiId: string;
  merchantCode?: string; // Default: 7832
  isPrimary?: boolean;
  status?: PaymentProviderStatus;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  settlementPeriod?: SettlementPeriodType | string;
  description?: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Input DTO for updating a payment configuration
 */
export interface UpdatePaymentConfigurationInput {
  businessName?: string;
  merchantName?: string;
  merchantDisplayName?: string;
  provider?: PaymentProvider;
  upiId?: string;
  merchantCode?: string;
  isPrimary?: boolean;
  status?: PaymentProviderStatus;
  bankName?: string;
  accountNumberMasked?: string;
  ifscCode?: string;
  settlementPeriod?: SettlementPeriodType | string;
  description?: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for dynamically deriving NPCI UPI intent string and QR URL
 */
export interface DeriveUpiPayloadParams {
  upiId: string;
  merchantName: string;
  amount?: number;
  reference?: string;
  transactionNote?: string;
  merchantCode?: string; // Default 7832
  currency?: string; // Default INR
}

/**
 * Derived UPI details object
 */
export interface DerivedUpiDetails {
  upiIntentUri: string;
  qrImageUrl: string;
  merchantCode: string;
  currency: string;
  amount?: number;
  reference?: string;
}

/**
 * Dynamic Customer Checkout Payment Session
 * Customer-facing payload that resolves the primary active rail without exposing private keys.
 */
export interface PaymentSessionDTO {
  sessionId: string;
  bookingSessionId?: string;
  theatreId: string;
  theatreName: string;
  paymentConfigId: string;
  provider: PaymentProvider;
  merchantName: string;
  merchantDisplayName: string;
  upiId: string;
  merchantCode: string;
  amount: number;
  currency: string;
  reference: string;
  upiIntentUri: string;
  qrImageUrl: string;
  expiresAt: string;
}

/**
 * Payment Transaction Record (Ledger)
 */
export interface PaymentTransactionRecord {
  id: string;
  bookingId: string;
  theatreId: string;
  paymentConfigId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentRailMethod;
  status: PaymentTransactionStatus;
  transactionReference: string;
  gatewayRef?: string;
  idempotencyKey?: string;
  theatreShare?: number;
  platformFeeShare?: number;
  taxBreakup?: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  gatewayData?: Record<string, unknown>;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Audit Logging for Payment Configuration Lifecycle
 */
export type PaymentAuditAction =
  | "CONFIG_CREATED"
  | "CONFIG_UPDATED"
  | "CONFIG_ACTIVATED"
  | "CONFIG_DEACTIVATED"
  | "CONFIG_SET_PRIMARY"
  | "CONFIG_ARCHIVED"
  | "CONFIG_DELETED"
  | "QR_GENERATED"
  | "PAYMENT_SESSION_PREPARED";

export interface PaymentAuditLog {
  id: string;
  theatreId: string;
  configId?: string;
  action: PaymentAuditAction;
  actorId: string;
  actorRole: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" | "CUSTOMER";
  previousState?: Partial<PaymentConfiguration>;
  newState?: Partial<PaymentConfiguration>;
  details: string;
  timestamp: string;
}

/**
 * Filter Parameters for Payment Configuration Queries
 */
export interface PaymentConfigFilterParams {
  theatreId?: string;
  provider?: PaymentProvider;
  status?: PaymentProviderStatus;
  isPrimary?: boolean;
  role?: "SUPER_ADMIN" | "THEATRE_ADMIN" | "CUSTOMER";
}
