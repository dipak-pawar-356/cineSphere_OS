import { DynamicHallSectionConfig, HallStatus } from "@/types/hall.types";
import { validateHallCapacity } from "@/lib/constants/seating-design-system";

export interface HallFormValues {
  id?: string;
  theatreId: string;
  name: string;
  hallNumber: number;
  hallCode: string;
  capacity: number;
  screenType: string;
  projectionType: string;
  soundSystem: string;
  aspectRatio: string;
  floorNumber: string;
  description: string;
  status: HallStatus;
  sections: DynamicHallSectionConfig[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateHallForm(
  values: HallFormValues,
  existingHalls: { id: string; hallCode: string; hallNumber: number }[] = []
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Hall Name
  if (!values.name || values.name.trim().length < 2) {
    errors.name = "Hall name must be at least 2 characters long.";
  }

  // 2. Hall Number
  if (!values.hallNumber || values.hallNumber <= 0) {
    errors.hallNumber = "Hall number must be a positive integer.";
  } else {
    const isDuplicateNumber = existingHalls.some(
      (h) => h.id !== values.id && h.hallNumber === Number(values.hallNumber)
    );
    if (isDuplicateNumber) {
      errors.hallNumber = `Hall number ${values.hallNumber} is already in use at this cinema.`;
    }
  }

  // 3. Hall Code (Unique per theatre)
  if (!values.hallCode || values.hallCode.trim().length < 2) {
    errors.hallCode = "Hall code is required (e.g. PUN-H01, IMAX-01).";
  } else {
    const normalizedCode = values.hallCode.trim().toUpperCase();
    const isDuplicateCode = existingHalls.some(
      (h) => h.id !== values.id && h.hallCode?.toUpperCase() === normalizedCode
    );
    if (isDuplicateCode) {
      errors.hallCode = `Hall code "${values.hallCode}" already exists in this theatre.`;
    }
  }

  // 4. Capacity
  if (!values.capacity || values.capacity <= 0) {
    errors.capacity = "Total hall capacity must be greater than zero.";
  }

  // 5. Sections Count
  if (!values.sections || values.sections.length === 0) {
    errors.sections = "A cinema hall must contain at least one seating section.";
  } else {
    // 6. Section Validation
    values.sections.forEach((sec, idx) => {
      if (!sec.name || sec.name.trim().length === 0) {
        errors[`section_${idx}_name`] = `Section #${idx + 1} requires a valid name.`;
      }
      if (!sec.seatCount || sec.seatCount <= 0) {
        errors[`section_${idx}_seatCount`] = `Section "${sec.name || idx + 1}" must have at least 1 seat.`;
      }
      if (!sec.seatsPerRow || sec.seatsPerRow <= 0) {
        errors[`section_${idx}_seatsPerRow`] = `Section "${sec.name || idx + 1}" must have at least 1 seat per row.`;
      }
    });

    // 7. Strict Capacity Balance Validation Rule
    const capacityCheck = validateHallCapacity(Number(values.capacity) || 0, values.sections);
    if (!capacityCheck.isValid) {
      errors.capacityBalance = capacityCheck.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
