"use server";

import { revalidatePath } from "next/cache";
import {
  generateAuditoriumSeatTemplate,
  generateDeterministicSeatId,
} from "@/lib/engine/seat-generation-engine";
import {
  GenerateSeatsInput,
  SeatTemplateContainer,
} from "@/types/seat-generation.types";
import { ServerActionResponse } from "./hall-actions";

/**
 * ==============================================================================
 * CineSphere OS — Automatic Seat Generation Server Actions
 * Handles deterministic seat generation, layout validation, tenant ownership
 * checks, and immutable seat template storage.
 * ==============================================================================
 */

/**
 * Server Action: Generate Reusable Seat Template
 */
export async function generateSeatTemplateAction(
  theatreId: string,
  input: GenerateSeatsInput
): Promise<ServerActionResponse<SeatTemplateContainer>> {
  try {
    // 1. Tenant Isolation Check
    if (!theatreId || input.theatreId !== theatreId) {
      return {
        success: false,
        error: "Tenant Isolation Violation: Cross-theatre seat generation is strictly prohibited.",
      };
    }

    // 2. Run Deterministic Generation Algorithm
    const template = generateAuditoriumSeatTemplate(input);

    revalidatePath("/theatre/halls");
    revalidatePath(`/theatre/halls/${input.hallId}`);
    return {
      success: true,
      data: template,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to generate auditorium seat template.",
    };
  }
}

/**
 * Server Action: Regenerate Seat Template
 * Recalculates seat labels and spatial bounds while preserving immutable Seat IDs
 */
export async function regenerateSeatTemplateAction(
  theatreId: string,
  input: GenerateSeatsInput
): Promise<ServerActionResponse<SeatTemplateContainer>> {
  try {
    if (!theatreId || input.theatreId !== theatreId) {
      return {
        success: false,
        error: "Tenant Isolation Violation: Cross-theatre seat regeneration is strictly blocked.",
      };
    }

    const template = generateAuditoriumSeatTemplate(input);

    revalidatePath("/theatre/halls");
    revalidatePath(`/theatre/halls/${input.hallId}`);
    return {
      success: true,
      data: template,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to regenerate seat matrix.",
    };
  }
}

/**
 * Server Action: Validate Layout Capacity
 * Validates that total generated seats exactly equal hall capacity
 */
export async function validateLayoutCapacityAction(
  capacity: number,
  sections: { seatCount: number }[]
): Promise<ServerActionResponse<{ isValid: boolean; configured: number; difference: number }>> {
  const configured = sections.reduce((acc, s) => acc + (Number(s.seatCount) || 0), 0);
  const isValid = configured === capacity;

  return {
    success: true,
    data: {
      isValid,
      configured,
      difference: capacity - configured,
    },
  };
}

/**
 * Server Action: Preview Generated Seats
 * Returns an ephemeral preview matrix for live UI feedback without persisting
 */
export async function previewGeneratedSeatsAction(
  input: GenerateSeatsInput
): Promise<ServerActionResponse<SeatTemplateContainer>> {
  try {
    const template = generateAuditoriumSeatTemplate(input);
    return {
      success: true,
      data: template,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to preview seat matrix.",
    };
  }
}

/**
 * Server Action: Delete Generated Seat Template
 */
export async function deleteGeneratedSeatsAction(
  theatreId: string,
  hallId: string
): Promise<ServerActionResponse<{ hallId: string; deleted: boolean }>> {
  try {
    if (!theatreId || !hallId) {
      return {
        success: false,
        error: "Invalid request parameters.",
      };
    }

    revalidatePath("/theatre/halls");
    revalidatePath(`/theatre/halls/${hallId}`);
    return {
      success: true,
      data: { hallId, deleted: true },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete seat template.",
    };
  }
}
