/**
 * ==============================================================================
 * CineSphere OS — Payment Domain Service (Phase 2 – Part 16)
 * ==============================================================================
 * Architectural abstraction isolating the Booking Engine from individual payment rails.
 * 
 * Flow:
 * Platform -> Theatre -> Payment Configuration (UPI / Razorpay / PhonePe / Paytm / Stripe)
 *          -> Booking -> Payment Transaction
 * 
 * Booking and customer checkout never know raw UPI VPAs directly. They resolve
 * the cinema's active payment configuration through this domain service.
 * ==============================================================================
 */

import { theatreRepository } from "@/lib/repositories/theatre.repository";
import { NotFoundError, BusinessRuleError } from "@/lib/errors/app-error";
import { PaymentConfiguration } from "@/types/payment-config.types";
import { deriveUpiQrPayload } from "@/lib/engine/payment-config-engine";

export interface ResolvedCustomerPaymentConfig {
  configId: string;
  theatreId: string;
  provider: "UPI" | "RAZORPAY" | "PHONEPE" | "PAYTM" | "STRIPE" | string;
  merchantDisplayName: string;
  isPrimary: boolean;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | string;
  // Dynamically synthesized for customer checkout
  upiIntentUri?: string;
  qrPayloadUrl?: string;
  gatewayKeyId?: string; // e.g. Razorpay Key ID or Stripe Publishable Key (safe public keys only)
}

export class PaymentDomainService {
  /**
   * Resolves the active payment configuration for a theatre complex.
   * Sanitizes private credentials and generates safe customer payment artifacts.
   */
  async resolveActivePaymentConfig(
    theatreId: string,
    transactionParams?: {
      amount: number;
      bookingRef?: string;
      customerName?: string;
    }
  ): Promise<ResolvedCustomerPaymentConfig> {
    const config = await theatreRepository.findActivePaymentConfig(theatreId);

    if (!config || config.status !== "ACTIVE") {
      throw new NotFoundError(
        "Active Payment Configuration",
        theatreId,
        `Payment rails currently unavailable for cinema '${theatreId}'`
      );
    }

    let upiIntentUri: string | undefined;
    let qrPayloadUrl: string | undefined;

    if (config.provider === "UPI" && transactionParams?.amount) {
      const payload = deriveUpiQrPayload({
        upiId: config.upiId,
        merchantName: config.merchantName,
        amount: transactionParams.amount,
        merchantCode: config.merchantCode || "7832",
        reference: transactionParams.bookingRef || `CS-${Date.now()}`,
        transactionNote: `Cinema Tickets - ${config.merchantDisplayName || config.businessName}`,
      });

      upiIntentUri = payload.upiIntentUri;
      qrPayloadUrl = payload.qrImageUrl;
    }

    // Return sanitized public customer presentation
    return {
      configId: config.id,
      theatreId: config.theatreId,
      provider: config.provider,
      merchantDisplayName: config.merchantDisplayName || config.businessName,
      isPrimary: config.isPrimary,
      status: config.status,
      upiIntentUri,
      qrPayloadUrl,
      gatewayKeyId: config.credentials?.keyIdMasked || config.credentials?.publishableKeyMasked,
    };
  }

  /**
   * Validates that a payment transaction matches the required booking amount.
   */
  validateTransactionAmount(bookingTotal: number, paidAmount: number): boolean {
    const diff = Math.abs(bookingTotal - paidAmount);
    if (diff > 0.01) {
      throw new BusinessRuleError(
        `Payment amount mismatch: Expected ₹${bookingTotal.toFixed(2)}, received ₹${paidAmount.toFixed(2)}`
      );
    }
    return true;
  }
}

export const paymentDomainService = new PaymentDomainService();
