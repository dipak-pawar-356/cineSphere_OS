"use server";

import { revalidatePath } from "next/cache";
import {
  PaymentConfiguration,
  CreatePaymentConfigurationInput,
  UpdatePaymentConfigurationInput,
  DeriveUpiPayloadParams,
  DerivedUpiDetails,
  PaymentSessionDTO,
  PaymentAuditLog,
  PaymentConfigFilterParams,
} from "@/types/payment-config.types";
import {
  validateUpiId,
  deriveUpiQrPayload,
  createPaymentConfiguration,
  updatePaymentConfiguration,
  deletePaymentConfiguration,
  activatePaymentConfiguration,
  deactivatePaymentConfiguration,
  setPrimaryPaymentConfiguration,
  getTheatrePaymentConfigurations,
  searchPaymentConfigurations,
  prepareBookingPaymentSession,
  getPaymentAuditLogs,
} from "@/lib/engine/payment-config-engine";

/**
 * ==============================================================================
 * CineSphere OS - Payment Configuration Server Actions
 * Phase 2 - Part 12
 * 
 * Provides server actions for multi-rail payment configurations, dynamic
 * QR payload generation, primary rail designation, tenant-safe queries,
 * and dynamic checkout session generation.
 * ==============================================================================
 */

export interface PaymentActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Server Action: Validate UPI VPA syntax
 */
export async function validateUpiAction(
  upiId: string
): Promise<PaymentActionResponse<{ isValid: boolean }>> {
  try {
    const result = validateUpiId(upiId);
    if (!result.isValid) {
      return {
        success: false,
        error: result.error,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: { isValid: true },
      message: "UPI ID is valid and conforms to NPCI standards.",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to validate UPI ID",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Dynamically derive UPI payload and QR code URL
 */
export async function deriveUpiQrAction(
  params: DeriveUpiPayloadParams
): Promise<PaymentActionResponse<DerivedUpiDetails>> {
  try {
    const validation = validateUpiId(params.upiId);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
        timestamp: new Date().toISOString(),
      };
    }

    const derived = deriveUpiQrPayload(params);
    return {
      success: true,
      data: derived,
      message: "Derived NPCI UPI Intent URI and QR code successfully.",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to derive UPI payload",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Create a new Payment Configuration for a Theatre
 */
export async function createPaymentConfigurationAction(
  input: CreatePaymentConfigurationInput,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<PaymentConfiguration>> {
  try {
    const config = createPaymentConfiguration(input, actor);
    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: config,
      message: `Payment rail '${config.merchantDisplayName}' created successfully.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Update an existing Payment Configuration
 */
export async function updatePaymentConfigurationAction(
  id: string,
  input: UpdatePaymentConfigurationInput,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<PaymentConfiguration>> {
  try {
    const config = updatePaymentConfiguration(id, input, actor);
    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: config,
      message: `Payment rail '${config.merchantDisplayName}' updated to Version ${config.configVersion}.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Delete a Payment Configuration
 */
export async function deletePaymentConfigurationAction(
  id: string,
  theatreId?: string,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<{ deletedId: string }>> {
  try {
    const deleted = deletePaymentConfiguration(id, theatreId, actor);
    if (!deleted) {
      return {
        success: false,
        error: "Configuration not found or already deleted.",
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: { deletedId: id },
      message: "Payment configuration deleted successfully.",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Activate a Payment Configuration
 */
export async function activatePaymentConfigurationAction(
  id: string,
  theatreId?: string,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<PaymentConfiguration>> {
  try {
    const config = activatePaymentConfiguration(id, theatreId, actor);
    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: config,
      message: `Payment rail '${config.merchantDisplayName}' activated.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to activate payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Deactivate a Payment Configuration
 */
export async function deactivatePaymentConfigurationAction(
  id: string,
  theatreId?: string,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<PaymentConfiguration>> {
  try {
    const config = deactivatePaymentConfiguration(id, theatreId, actor);
    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: config,
      message: `Payment rail '${config.merchantDisplayName}' deactivated.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to deactivate payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Designate Primary Payment Configuration
 */
export async function setPrimaryPaymentConfigurationAction(
  id: string,
  theatreId: string,
  actor: { actorId: string; role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "SYSTEM" } = {
    actorId: "theatre_admin",
    role: "THEATRE_ADMIN",
  }
): Promise<PaymentActionResponse<PaymentConfiguration>> {
  try {
    const config = setPrimaryPaymentConfiguration(id, theatreId, actor);
    revalidatePath("/theatre/upi");
    revalidatePath("/theatre/payments");

    return {
      success: true,
      data: config,
      message: `'${config.merchantDisplayName}' is now the primary checkout rail for this theatre.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to set primary payment configuration",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Query Payment Configurations for a Theatre
 */
export async function getTheatrePaymentConfigurationsAction(
  theatreId: string,
  role: "SUPER_ADMIN" | "THEATRE_ADMIN" | "CUSTOMER" = "THEATRE_ADMIN"
): Promise<PaymentActionResponse<PaymentConfiguration[]>> {
  try {
    const configs = getTheatrePaymentConfigurations(theatreId, role);
    return {
      success: true,
      data: configs,
      message: `Retrieved ${configs.length} configurations for theatre '${theatreId}'.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to retrieve configurations",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Prepare dynamic Booking Checkout Payment Session
 */
export async function prepareBookingPaymentSessionAction(params: {
  bookingSessionId?: string;
  theatreId: string;
  amount: number;
  customerId?: string;
  reference?: string;
  notes?: string;
}): Promise<PaymentActionResponse<PaymentSessionDTO>> {
  try {
    const sessionDTO = prepareBookingPaymentSession(params);
    return {
      success: true,
      data: sessionDTO,
      message: "Dynamic booking payment session generated successfully.",
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to prepare booking payment session",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Retrieve Payment Audit Logs
 */
export async function getPaymentAuditLogsAction(
  theatreId?: string,
  role: "SUPER_ADMIN" | "THEATRE_ADMIN" = "THEATRE_ADMIN"
): Promise<PaymentActionResponse<PaymentAuditLog[]>> {
  try {
    const logs = getPaymentAuditLogs(theatreId, role);
    return {
      success: true,
      data: logs,
      message: `Retrieved ${logs.length} audit logs.`,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to retrieve audit logs",
      timestamp: new Date().toISOString(),
    };
  }
}
